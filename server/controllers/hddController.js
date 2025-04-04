const NodeCache = require("node-cache");
const ESPlantTerminalHD900 = require("../models/ESPlantTerminalHD900");
const HDDViews = require("../models/HDDViews");
const ESPlant = require("../models/ESPlant");
const log = {
  info: (msg) => console.log(`[INFO] ${new Date().toISOString()} - ${msg}`),
  error: (msg) => console.error(`[ERROR] ${new Date().toISOString()} - ${msg}`),
};

const historicalCache = new NodeCache({
  stdTTL: 10,
  checkperiod: 2,
});

const graphCache = new NodeCache({
  stdTTL: 10,
  checkperiod: 2,
});

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
    const views = await withRetry(async () => {
      return await HDDViews.find().lean().exec();
    });

    if (!views || views.length === 0) {
      log.info("No HDD views found.");
      return res.status(200).json({
        success: true,
        message: "No HDD views found",
        data: [],
      });
    }

    res.status(200).json({
      success: true,
      message: "HDD views retrieved successfully",
      data: views,
      total: views.length,
    });
  } catch (error) {
    log.error(`Error fetching HDD views: ${error.message}`);
    res.status(500).json({
      success: false,
      message: "Failed to fetch HDD views",
      error: error.message,
    });
  }
};

// -------------------- 2. Create a new HDD view --------------------
exports.createHDDView = async (req, res) => {
  try {
    const {
      plantId,
      terminalId,
      measurandIds,
      plantName,
      terminalName,
      measurandNames,
    } = req.body;

    if (
      !plantId ||
      !terminalId ||
      !measurandIds ||
      !Array.isArray(measurandIds)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Missing required fields (plantId, terminalId, measurandIds) or measurandIds is not an array",
      });
    }

    const newView = new HDDViews({
      profile: "custom",
      plantId,
      terminalId,
      measurandIds,
      plantName: plantName || "",
      terminalName: terminalName || "",
      measurandNames: measurandNames || [],
    });

    const savedView = await withRetry(async () => {
      return await newView.save();
    });

    res.status(201).json({
      success: true,
      message: "HDD view created successfully",
      data: savedView,
    });
  } catch (error) {
    log.error(`Error creating HDD view: ${error.message}`);
    res.status(500).json({
      success: false,
      message: "Failed to create HDD view",
      error: error.message,
    });
  }
};

// -------------------- 3. Update an HDD view --------------------
exports.updateHDDView = async (req, res) => {
  try {
    const { id } = req.params;
    const { measurandIds, measurandNames } = req.body;

    if (!id || !measurandIds || !Array.isArray(measurandIds)) {
      return res.status(400).json({
        success: false,
        message:
          "Missing required fields (id, measurandIds) or measurandIds is not an array",
      });
    }

    const updatedView = await withRetry(async () => {
      return await HDDViews.findByIdAndUpdate(
        id,
        {
          measurandIds,
          measurandNames: measurandNames || [],
          updatedAt: Date.now(),
        },
        { new: true }
      ).lean();
    });

    if (!updatedView) {
      return res.status(404).json({
        success: false,
        message: "HDD view not found",
      });
    }

    log.info(`Updated HDD view: ${id}`);
    res.status(200).json({
      success: true,
      message: "HDD view updated successfully",
      data: updatedView,
    });
  } catch (error) {
    log.error(`Error updating HDD view: ${error.message}`);
    res.status(500).json({
      success: false,
      message: "Failed to update HDD view",
      error: error.message,
    });
  }
};

// -------------------- 4. Delete an HDD view --------------------
exports.deleteHDDView = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Missing required field: id",
      });
    }

    const deletedView = await withRetry(async () => {
      return await HDDViews.findByIdAndDelete(id).lean();
    });

    if (!deletedView) {
      return res.status(404).json({
        success: false,
        message: "HDD view not found",
      });
    }

    log.info(`Deleted HDD view: ${id}`);
    res.status(200).json({
      success: true,
      message: "HDD view deleted successfully",
      data: deletedView,
    });
  } catch (error) {
    log.error(`Error deleting HDD view: ${error.message}`);
    res.status(500).json({
      success: false,
      message: "Failed to delete HDD view",
      error: error.message,
    });
  }
};

exports.getPlants = async (req, res) => {
  try {
    const plants = await ESPlant.find().select("_id PlantName").lean();

    if (!plants.length) {
      return res.status(200).json({
        success: true,
        message: "No plants found",
        data: [],
      });
    }

    res.status(200).json({
      success: true,
      message: "Plants retrieved successfully",
      data: plants.map((plant) => ({
        plantId: plant._id,
        plantName: plant.PlantName,
      })),
      total: plants.length,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch plants",
      error: error.message,
    });
  }
};

// 6. Get unique terminal names for a plant
exports.getTerminals = async (req, res) => {
  const { plantId } = req.params;

  try {
    if (!plantId) {
      return res.status(400).JSONArray({
        success: false,
        message: "Missing plantId parameter",
      });
    }

    const numericPlantId = Number(plantId);
    if (isNaN(numericPlantId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid plantId format. Must be a number.",
      });
    }

    const plant = await ESPlant.findById(numericPlantId)
      .select("TerminalList PlantName")
      .lean();

    if (!plant || !plant.TerminalList.length) {
      return res.status(404).json({
        success: false,
        message: `No terminals found for PlantId: ${plantId}`,
      });
    }

    res.status(200).json({
      success: true,
      message: `Terminals retrieved successfully for Plant: ${plant.PlantName}`,
      data: plant.TerminalList,
      total: plant.TerminalList.length,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch terminal list",
      error: error.message,
    });
  }
};

// 7. Get measurands by plantId and terminalId
// controllers/hddController.js (only updating getMeasurands function)
exports.getMeasurands = async (req, res) => {
  const { plantId, terminalId } = req.params;

  try {
    if (!plantId || !terminalId) {
      return res.status(400).json({
        success: false,
        message: "Missing plantId or terminalId parameter",
      });
    }

    const numericPlantId = Number(plantId);
    const numericTerminalId = Number(terminalId);

    if (isNaN(numericPlantId) || isNaN(numericTerminalId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid plantId or terminalId format. Must be numbers.",
      });
    }

    const plant = await ESPlant.findOne({
      _id: numericPlantId,
      "TerminalList.TerminalId": numericTerminalId,
    })
      .select("MeasurandList PlantName TerminalList")
      .lean();

    if (!plant) {
      return res.status(404).json({
        success: false,
        message: `No data found for PlantId: ${plantId} and TerminalId: ${terminalId}`,
      });
    }

    // Format the response to ensure MeasurandName is properly structured
    const measurands = plant.MeasurandList.map((measurand) => ({
      measurandId: measurand.MeasurandId,
      measurandName: measurand.MeasurandName,
      unit: measurand.Unit || "",
    }));

    res.status(200).json({
      success: true,
      message: `Measurands retrieved successfully for Plant: ${plant.PlantName}`,
      data: measurands,
      total: measurands.length,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch measurands",
      error: error.message,
    });
  }
};
// -------------------- 8. Get measurand values with date filter --------------------
exports.getHistoricalMeasurandValues = async (req, res) => {
  const { terminalId, measurandId } = req.params;
  const { from, to } = req.query;

  try {
    if (
      !terminalId ||
      isNaN(terminalId) ||
      !measurandId ||
      isNaN(measurandId)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid or missing terminalId or measurandId parameter",
      });
    }

    const numericTerminalId = Number(terminalId);
    const numericMeasurandId = Number(measurandId);

    const cacheKey = `${numericTerminalId}:${numericMeasurandId}:${
      from || "no-from"
    }:${to || "no-to"}`;
    const cachedData = historicalCache.get(cacheKey);
    if (cachedData) {
      log.info(`Cache hit for historical data: ${cacheKey}`);
      return res.status(200).json({
        success: true,
        message: "Historical data retrieved from cache",
        data: cachedData.data,
      });
    }

    const fromDate = from ? new Date(from).toISOString() : null;
    const toDate = to ? new Date(to).toISOString() : null;

    const queryConditions = {
      TerminalId: numericTerminalId,
      "MeasurandData.MeasurandId": numericMeasurandId,
    };

    if (fromDate && toDate) {
      queryConditions.TimeStamp = { $gte: fromDate, $lte: toDate };
    }

    log.info(`Executing query: ${JSON.stringify(queryConditions)}`);

    const data = await withRetry(async () => {
      return await ESPlantTerminalHD900.find(queryConditions)
        .select("TimeStamp MeasurandData")
        .lean()
        .exec();
    });

    if (!data || data.length === 0) {
      log.info("No historical data found for the given query conditions.");
      return res.status(200).json({
        success: true,
        message: "No historical data found",
        data: [],
      });
    }

    const responseData = {
      data: data.flatMap((d) =>
        d.MeasurandData.filter((m) => m.MeasurandId === numericMeasurandId).map(
          (m) => ({
            Timestamp: d.TimeStamp,
            MeasurandValue: m.MeasurandValue,
            MeasurandName: m.MeasurandName,
          })
        )
      ),
    };

    historicalCache.set(cacheKey, responseData);
    log.info(`Cache set for historical data: ${cacheKey}`);
    res.status(200).json({
      success: true,
      message: "Historical data retrieved successfully",
      data: responseData.data,
      total: responseData.data.length,
    });
  } catch (error) {
    log.error(`Error fetching historical data: ${error.message}`);
    res.status(500).json({
      success: false,
      message: "Failed to fetch historical data",
      error: error.message,
    });
  }
};

// -------------------- 9. Get measurand values for graph --------------------
// -------------------- 9. Get measurand values for graph by terminalId and measurandId --------------------
exports.getHistoricalMeasurandValuesForGraph = async (req, res) => {
  const { terminalId, measurandId } = req.params;

  try {
    if (!terminalId || !measurandId) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: terminalId or measurandId",
      });
    }

    const numericTerminalId = Number(terminalId);
    const numericMeasurandId = Number(measurandId);

    if (isNaN(numericTerminalId) || isNaN(numericMeasurandId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid terminalId or measurandId format. Must be numbers.",
      });
    }

    const cacheKey = `${numericTerminalId}:${numericMeasurandId}`;
    const cachedData = graphCache.get(cacheKey);
    if (cachedData) {
      log.info(`Cache hit for graph data: ${cacheKey}`);
      return res.status(200).json({
        success: true,
        message: "Graph data retrieved from cache",
        data: cachedData.data,
        total: cachedData.total,
      });
    }

    const queryConditions = {
      TerminalId: numericTerminalId,
      "MeasurandData.MeasurandId": numericMeasurandId,
    };

    const data = await withRetry(async () => {
      const startTime = Date.now();
      const result = await ESPlantTerminalHD900.find(queryConditions)
        .select("MeasurandData TimeStamp")
        .sort({ TimeStamp: -1 })
        .limit(40)
        .lean()
        .exec();
      log.info(`Query executed in ${Date.now() - startTime}ms`);
      return result;
    });

    if (!data || data.length === 0) {
      log.info(
        `No graph data found for query: ${JSON.stringify(queryConditions)}`
      );
      return res.status(200).json({
        success: true,
        message: "No graph data found",
        data: [],
      });
    }

    const formattedData = data.flatMap((d) =>
      d.MeasurandData.filter((m) => m.MeasurandId === numericMeasurandId).map(
        (m) => ({
          Timestamp: d.TimeStamp,
          MeasurandValue: m.MeasurandValue,
        })
      )
    );

    const responseData = {
      total: formattedData.length,
      data: formattedData,
    };

    graphCache.set(cacheKey, responseData);
    log.info(`Cache set for graph data: ${cacheKey}`);
    res.status(200).json({
      success: true,
      message: "Graph data retrieved successfully",
      data: responseData.data,
      total: responseData.total,
    });
  } catch (error) {
    log.error(`Error fetching graph data: ${error.message}`);
    res.status(500).json({
      success: false,
      message: "Failed to fetch graph data",
      error: error.message,
    });
  }
};

module.exports = exports;
