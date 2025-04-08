const ESBolt = require("../models/ESBolts");
const mongoose = require("mongoose");

const getQueries = async (req, res) => {
  try {
    const queries = await ESBolt.find({ Enable: true }, "QName QDescription");
    res.json(queries);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching queries", error: error.message });
  }
};

const executeQuery = async (req, res) => {
  const { qName, fromDate, toDate } = req.body;

  try {
    if (!qName || !fromDate || !toDate) {
      return res.status(400).json({ message: "Missing required parameters" });
    }

    // Log incoming UTC ISO strings
    console.log(`Received UTC dates: from=${fromDate}, to=${toDate}`);

    // Fetch the query document
    const queryDoc = await ESBolt.findOne({ QName: qName });
    if (!queryDoc) {
      return res.status(404).json({ message: "Query not found" });
    }

    const qScript = queryDoc.QScript.trim();
    const qType = queryDoc.QType; // 1 = pipeline, 2 = view
    const db = mongoose.connection.db;

    let result;

    if (qType === 1) {
      // Handle aggregation pipeline
      if (!qScript.startsWith("db.")) {
        return res
          .status(400)
          .json({ message: "Invalid pipeline script format" });
      }

      const collectionMatch = qScript.match(/db\.([^\.]+)\.aggregate\s*\(/);
      if (!collectionMatch) {
        return res.status(400).json({ message: "Invalid aggregation syntax" });
      }
      const collectionName = collectionMatch[1];

      const pipelineStrMatch = qScript.match(/\[\s*(.+?)\s*\]\s*\);?$/s);
      if (!pipelineStrMatch) {
        return res.status(400).json({ message: "Invalid pipeline format" });
      }
      let pipelineStr = pipelineStrMatch[1];

      // Remove comments
      pipelineStr = pipelineStr.replace(/\/\/.*$/gm, "").trim();

      // Parse pipeline
      let pipeline;
      try {
        pipeline = JSON.parse(pipelineStr);
      } catch (initialParseError) {
        console.log(
          "Initial parse failed, cleaning pipeline:",
          initialParseError.message
        );

        pipelineStr = pipelineStr
          .replace(/\s+/g, " ")
          .replace(/([{,])\s*([$\w]+)\s*:/g, '$1 "$2":')
          .replace(/,\s*([\]}])/g, "$1");

        if (!pipelineStr.startsWith("[")) {
          pipelineStr = `[${pipelineStr}]`;
        }

        console.log("Cleaned pipeline string:", pipelineStr);

        try {
          pipeline = JSON.parse(pipelineStr);
        } catch (cleanedParseError) {
          console.error(
            "Error parsing cleaned pipeline:",
            cleanedParseError.message
          );
          return res.status(400).json({
            message: "Invalid aggregation pipeline",
            error: cleanedParseError.message,
          });
        }
      }

      if (!Array.isArray(pipeline)) {
        pipeline = [pipeline];
      }

      // Add UTC date filter as the first stage
      const dateFilterStage = {
        $match: {
          TimeStamp: {
            $gte: new Date(fromDate), // Interprets ISO string as UTC
            $lte: new Date(toDate), // Interprets ISO string as UTC
          },
        },
      };
      pipeline.unshift(dateFilterStage);

      console.log("Final pipeline:", JSON.stringify(pipeline, null, 2));

      // Execute the aggregation pipeline
      result = await db
        .collection(collectionName)
        .aggregate(pipeline)
        .toArray();

      console.log(
        "Result timestamps:",
        result.map((doc) => doc.TimeStamp)
      );
    } else if (qType === 2) {
      // Handle view
      const viewName = qScript;

      const query = {
        TimeStamp: {
          $gte: new Date(fromDate), // Interprets ISO string as UTC
          $lte: new Date(toDate), // Interprets ISO string as UTC
        },
      };

      result = await db
        .collection(viewName)
        .find(query)
        .sort({ TimeStamp: 1 })
        .toArray();

      console.log(
        "Result timestamps:",
        result.map((doc) => doc.TimeStamp)
      );
    } else {
      return res.status(400).json({
        message: "Invalid QType. Must be 1 (pipeline) or 2 (view)",
      });
    }

    res.json(result); // MongoDB returns UTC timestamps in ISO format
  } catch (error) {
    console.error("Query execution error:", error);
    res.status(500).json({
      message: "Error executing query",
      error: error.message,
    });
  }
};

module.exports = {
  getQueries,
  executeQuery,
};
