const NodeCache = require("node-cache");
const ESPlantTerminalHD = require("../models/ESPlantTerminalHD");
const HDDViews = require("../models/HDDViews");

const log = {
  info: (msg) => console.log(`[INFO] ${new Date().toISOString()} - ${msg}`),
  error: (msg) => console.error(`[ERROR] ${new Date().toISOString()} - ${msg}`),
};

const cache = new NodeCache({
  stdTTL: 10,
  checkperiod: 2,
});

// Cache key generator
const generateCacheKey = (plantName, terminalName, measurandName, from, to) => {
  const fromStr = from ? new Date(from).toISOString() : "no-from";
  const toStr = to ? new Date(to).toISOString() : "no-to";
  return `${plantName}:${terminalName}:${measurandName}:${fromStr}:${toStr}`;
};

const withRetry = async (fn, retries = 3, delay = 1000) => {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === retries - 1) throw error;
      log.error(`Retry attempt ${i + 1} failed: ${error.message}`);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
};

// -------------------- 1. Get all HDD views --------------------
exports.getHDDViews = async (req, res) => {
  try {
    const views = await HDDViews.find().lean();
    log.info(`Fetched ${views.length} HDD views`);
    res.json(views);
  } catch (error) {
    log.error(`Error fetching HDD views: ${error.message}`);
    res
      .status(500)
      .json({ message: "Error fetching HDD views", error: error.message });
  }
};

// -------------------- 2. Create a new HDD view --------------------
exports.createHDDView = async (req, res) => {
  try {
    const { plantName, terminalName, measurandNames } = req.body;

    if (
      !plantName ||
      !terminalName ||
      !measurandNames ||
      !Array.isArray(measurandNames)
    ) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const newView = new HDDViews({
      profile: "custom",
      plantName,
      terminalName,
      measurandNames,
    });

    const savedView = await newView.save();
    log.info(`Created HDD view: ${savedView._id}`);
    res.status(201).json(savedView);
  } catch (error) {
    log.error(`Error creating HDD view: ${error.message}`);
    res
      .status(500)
      .json({ message: "Error creating HDD view", error: error.message });
  }
};

// -------------------- 3. Update an HDD view --------------------
exports.updateHDDView = async (req, res) => {
  try {
    const { id } = req.params;
    const { measurandNames } = req.body;

    if (!measurandNames || !Array.isArray(measurandNames)) {
      return res
        .status(400)
        .json({ message: "measurandNames is required and must be an array" });
    }

    const updatedView = await HDDViews.findByIdAndUpdate(
      id,
      { measurandNames, updatedAt: Date.now() },
      { new: true }
    ).lean();

    if (!updatedView) {
      return res.status(404).json({ message: "HDD view not found" });
    }

    log.info(`Updated HDD view: ${id}`);
    res.json(updatedView);
  } catch (error) {
    log.error(`Error updating HDD view: ${error.message}`);
    res
      .status(500)
      .json({ message: "Error updating HDD view", error: error.message });
  }
};

// -------------------- 4. Delete an HDD view --------------------
exports.deleteHDDView = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedView = await HDDViews.findByIdAndDelete(id);

    if (!deletedView) {
      return res.status(404).json({ message: "HDD view not found" });
    }

    log.info(`Deleted HDD view: ${id}`);
    res.status(200).json({ message: "HDD view deleted successfully" });
  } catch (error) {
    log.error(`Error deleting HDD view: ${error.message}`);
    res
      .status(500)
      .json({ message: "Error deleting HDD view", error: error.message });
  }
};

// -------------------- 5. Get unique plant names --------------------
exports.getPlants = async (req, res) => {
  try {
    const plants = await ESPlantTerminalHD.distinct("PlantName");
    log.info(`Fetched ${plants.length} unique plant names`);
    res.json(plants);
  } catch (error) {
    log.error(`Error fetching plants: ${error.message}`);
    res
      .status(500)
      .json({ message: "Error fetching plants", error: error.message });
  }
};

// -------------------- 6. Get unique terminal names for a plant --------------------
exports.getTerminals = async (req, res) => {
  try {
    const { plantName } = req.params;
    const terminals = await ESPlantTerminalHD.aggregate([
      { $match: { PlantName: plantName } },
      {
        $group: { _id: "$TerminalName", TerminalId: { $first: "$TerminalId" } },
      },
      { $project: { TerminalName: "$_id", TerminalId: 1, _id: 0 } },
    ]);
    log.info(`Fetched ${terminals.length} terminals for plant: ${plantName}`);
    res.json(terminals.map((t) => t.TerminalName));
  } catch (error) {
    log.error(`Error fetching terminals: ${error.message}`);
    res
      .status(500)
      .json({ message: "Error fetching terminals", error: error.message });
  }
};

// -------------------- 7. Get unique measurand names for a plant and terminal --------------------
exports.getMeasurands = async (req, res) => {
  try {
    const { plantName, terminalName } = req.params;
    const measurands = await ESPlantTerminalHD.distinct(
      "MeasurandDetails.MeasurandName",
      {
        PlantName: plantName,
        TerminalName: terminalName,
      }
    );
    log.info(
      `Fetched ${measurands.length} measurands for ${plantName}/${terminalName}`
    );
    res.json(measurands);
  } catch (error) {
    log.error(`Error fetching measurands: ${error.message}`);
    res
      .status(500)
      .json({ message: "Error fetching measurands", error: error.message });
  }
};

// -------------------- 8. Get measurand values with date filter --------------------
exports.getHistoricalMeasurandValues = async (req, res) => {
  try {
    const { plantName, terminalName, measurandName } = req.params;
    const { from, to } = req.query;

    if (!plantName || !terminalName || !measurandName) {
      return res.status(400).json({
        message: "Plant name, terminal name, and measurand name are required",
      });
    }

    const startDate = from ? new Date(from) : null;
    const endDate = to ? new Date(to) : null;

    const cacheKey = generateCacheKey(
      plantName,
      terminalName,
      measurandName,
      from,
      to
    );

    const cachedData = cache.get(cacheKey);
    if (cachedData) {
      log.info(`Cache hit for ${cacheKey}`);
      return res.json(cachedData);
    }

    const queryConditions = {
      PlantName: plantName,
      TerminalName: terminalName,
      "MeasurandDetails.MeasurandName": measurandName,
    };

    if (startDate && endDate) {
      if (startDate > endDate) {
        return res.status(400).json({
          message: "Start date must be earlier than end date",
        });
      }
      queryConditions.TimeStamp = {
        $gte: startDate.toISOString(),
        $lte: endDate.toISOString(),
      };
    }

    const data = await withRetry(async () => {
      const startTime = Date.now();
      const result = await ESPlantTerminalHD.find(queryConditions)
        .select("MeasurandDetails.MeasurandValue TimeStamp")
        .sort({ TimeStamp: -1 })
        .limit(900)
        .lean();
      log.info(`Query executed in ${Date.now() - startTime}ms for ${cacheKey}`);
      return result;
    });

    if (!data || data.length === 0) {
      return res.status(404).json({
        message: "No data found for the specified parameters",
      });
    }

    const formattedData = data.map((d) => ({
      Timestamp: d.TimeStamp,
      MeasurandValue: d.MeasurandDetails.MeasurandValue,
    }));

    const responseData = {
      total: formattedData.length,
      data: formattedData,
    };

    cache.set(cacheKey, responseData);
    log.info(`Cache set for ${cacheKey}`);
    res.json(responseData);
  } catch (error) {
    log.error(`Error in getHistoricalMeasurandValues: ${error.message}`);
    res.status(500).json({
      message: "Error fetching historical measurand values",
      error: error.message,
    });
  }
};

// -------------------- 9. Get measurand values for graph --------------------
exports.getHistoricalMeasurandValuesForGraph = async (req, res) => {
  try {
    const { plantName, terminalName, measurandName } = req.params;

    if (!plantName || !terminalName || !measurandName) {
      return res.status(400).json({
        message: "Plant name, terminal name, and measurand name are required",
      });
    }

    const cacheKey = generateCacheKey(plantName, terminalName, measurandName);

    const cachedData = cache.get(cacheKey);
    if (cachedData) {
      log.info(`Cache hit for ${cacheKey}`);
      return res.json(cachedData);
    }

    const queryConditions = {
      PlantName: plantName,
      TerminalName: terminalName,
      "MeasurandDetails.MeasurandName": measurandName,
    };

    const data = await withRetry(async () => {
      const startTime = Date.now();
      const result = await ESPlantTerminalHD.find(queryConditions)
        .select("MeasurandDetails.MeasurandValue TimeStamp")
        .sort({ TimeStamp: -1 })
        .limit(900)
        .lean();
      log.info(`Query executed in ${Date.now() - startTime}ms for ${cacheKey}`);
      return result;
    });

    if (!data || data.length === 0) {
      return res.status(404).json({
        message: "No data found for the specified parameters",
      });
    }

    const formattedData = data.map((d) => ({
      Timestamp: d.TimeStamp,
      MeasurandValue: d.MeasurandDetails.MeasurandValue,
    }));

    const responseData = {
      total: formattedData.length,
      data: formattedData,
    };

    cache.set(cacheKey, responseData);
    log.info(`Cache set for ${cacheKey}`);
    res.json(responseData);
  } catch (error) {
    log.error(
      `Error in getHistoricalMeasurandValuesForGraph: ${error.message}`
    );
    res.status(500).json({
      message: "Error fetching historical measurand values",
      error: error.message,
    });
  }
};

module.exports = exports;
