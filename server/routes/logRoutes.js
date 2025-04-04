const express = require("express");
const router = express.Router();
const ESBolt = require("../models/ESBolts");
const mongoose = require("mongoose");

router.get("/queries", async (req, res) => {
  try {
    const queries = await ESBolt.find({ Enable: true }, "QName QDescription");
    res.json(queries);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching queries", error: error.message });
  }
});

router.post("/execute-query", async (req, res) => {
  const { qName, fromDate, toDate } = req.body;

  try {
    // Validate input
    if (!qName || !fromDate || !toDate) {
      return res.status(400).json({ message: "Missing required parameters" });
    }

    // Fetch the query document based on QName
    const queryDoc = await ESBolt.findOne({ QName: qName });
    if (!queryDoc) {
      return res.status(404).json({ message: "Query not found" });
    }

    const viewName = queryDoc.QScript; // Get the view name from QScript (e.g., "KWh_Imp2")
    const db = mongoose.connection.db;

    // Create query with date range
    const query = {
      TimeStamp: {
        $gte: new Date(fromDate),
        $lte: new Date(toDate),
      },
    };

    // Fetch data from the view collection
    const result = await db
      .collection(viewName)
      .find(query)
      .sort({ TimeStamp: 1 })
      .toArray();

    res.json(result);
  } catch (error) {
    console.error("Query execution error:", error);
    res.status(500).json({
      message: "Error executing query",
      error: error.message,
    });
  }
});

module.exports = router;
