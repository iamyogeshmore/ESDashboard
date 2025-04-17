const NodeCache = require("node-cache");
const ESPlantMeasurandView = require("../models/ESPlantMeasurandView");
const MeasurandHDDViews = require("../models/MeasurandHDDViews");

const log = {
  info: (msg) => console.log(`[INFO] ${new Date().toISOString()} - ${msg}`),
  error: (msg) => console.error(`[ERROR] ${new Date().toISOString()} - ${msg}`),
};

const viewCache = new NodeCache({
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

// -------------------- 1. Get all Measurand HDD views --------------------
exports.getMeasurandHDDViews = async (req, res) => {
  try {
    const views = await withRetry(async () => {
      return await MeasurandHDDViews.find().lean().exec();
    });

    if (!views || views.length === 0) {
      log.info("No Measurand HDD views found.");
      return res.status(200).json({
        success: true,
        message: "No Measurand HDD views found",
        data: [],
      });
    }

    res.status(200).json({
      success: true,
      message: "Measurand HDD views retrieved successfully",
      data: views,
      total: views.length,
    });
  } catch (error) {
    log.error(`Error fetching Measurand HDD views: ${error.message}`);
    res.status(500).json({
      success: false,
      message: "Failed to fetch Measurand HDD views",
      error: error.message,
    });
  }
};

// -------------------- 2. Create a new Measurand HDD view --------------------
exports.createMeasurandHDDView = async (req, res) => {
  try {
    const {
      plantId,
      measurandId,
      terminalIds,
      plantName,
      measurandName,
      terminalNames,
    } = req.body;

    if (
      !plantId ||
      !measurandId ||
      !terminalIds ||
      !Array.isArray(terminalIds) ||
      !plantName ||
      !measurandName ||
      !Array.isArray(terminalNames)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Missing or invalid required fields (plantId, measurandId, terminalIds, plantName, measurandName, terminalNames)",
      });
    }

    const newView = new MeasurandHDDViews({
      profile: "custom",
      plantId,
      measurandId,
      terminalIds,
      plantName,
      measurandName,
      terminalNames,
    });

    const savedView = await withRetry(async () => {
      return await newView.save();
    });

    res.status(201).json({
      success: true,
      message: "Measurand HDD view created successfully",
      data: savedView,
    });
  } catch (error) {
    log.error(`Error creating Measurand HDD view: ${error.message}`);
    res.status(500).json({
      success: false,
      message: "Failed to create Measurand HDD view",
      error: error.message,
    });
  }
};

// -------------------- 3. Update a Measurand HDD view --------------------
exports.updateMeasurandHDDView = async (req, res) => {
  try {
    const { id } = req.params;
    const { terminalIds, terminalNames } = req.body;

    if (
      !id ||
      !terminalIds ||
      !Array.isArray(terminalIds) ||
      !Array.isArray(terminalNames)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Missing or invalid required fields (id, terminalIds, terminalNames)",
      });
    }

    const updatedView = await withRetry(async () => {
      return await MeasurandHDDViews.findByIdAndUpdate(
        id,
        {
          terminalIds,
          terminalNames,
          updatedAt: Date.now(),
        },
        { new: true }
      ).lean();
    });

    if (!updatedView) {
      return res.status(404).json({
        success: false,
        message: "Measurand HDD view not found",
      });
    }

    log.info(`Updated Measurand HDD view: ${id}`);
    res.status(200).json({
      success: true,
      message: "Measurand HDD view updated successfully",
      data: updatedView,
    });
  } catch (error) {
    log.error(`Error updating Measurand HDD view: ${error.message}`);
    res.status(500).json({
      success: false,
      message: "Failed to update Measurand HDD view",
      error: error.message,
    });
  }
};

// -------------------- 4. Delete a Measurand HDD view --------------------
exports.deleteMeasurandHDDView = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Missing required field: id",
      });
    }

    const deletedView = await withRetry(async () => {
      return await MeasurandHDDViews.findByIdAndDelete(id).lean();
    });

    if (!deletedView) {
      return res.status(404).json({
        success: false,
        message: "Measurand HDD view not found",
      });
    }

    log.info(`Deleted Measurand HDD view: ${id}`);
    res.status(200).json({
      success: true,
      message: "Measurand HDD view deleted successfully",
      data: deletedView,
    });
  } catch (error) {
    log.error(`Error deleting Measurand HDD view: ${error.message}`);
    res.status(500).json({
      success: false,
      message: "Failed to delete Measurand HDD view",
      error: error.message,
    });
  }
};

// -------------------- 5. Get Measurand HDD view by ID --------------------
exports.getMeasurandHDDViewById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Missing required field: id",
      });
    }

    const view = await withRetry(async () => {
      return await MeasurandHDDViews.findById(id).lean();
    });

    if (!view) {
      return res.status(404).json({
        success: false,
        message: `Measurand HDD view not found for ID: ${id}`,
      });
    }

    res.status(200).json({
      success: true,
      message: "Measurand HDD view retrieved successfully",
      data: view,
    });
  } catch (error) {
    log.error(`Error fetching Measurand HDD view by ID: ${error.message}`);
    res.status(500).json({
      success: false,
      message: "Failed to fetch Measurand HDD view",
      error: error.message,
    });
  }
};

// -------------------- 6. Get Measurand HDD view by plantId and measurandId --------------------
exports.getMeasurandHDDViewByPlantAndMeasurand = async (req, res) => {
  const { plantId, measurandId } = req.params;

  try {
    if (!plantId || !measurandId) {
      return res.status(400).json({
        success: false,
        message: "Missing plantId or measurandId parameter",
      });
    }

    const numericPlantId = Number(plantId);
    const numericMeasurandId = Number(measurandId);

    if (isNaN(numericPlantId) || isNaN(numericMeasurandId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid plantId or measurandId format. Must be numbers.",
      });
    }

    const view = await withRetry(async () => {
      return await MeasurandHDDViews.findOne({
        plantId: numericPlantId,
        measurandId: numericMeasurandId,
      }).lean();
    });

    if (!view) {
      return res.status(404).json({
        success: false,
        message: `No Measurand HDD view found for PlantId: ${plantId} and MeasurandId: ${measurandId}`,
      });
    }

    res.status(200).json({
      success: true,
      message: "Measurand HDD view retrieved successfully",
      data: view,
    });
  } catch (error) {
    log.error(`Error fetching Measurand HDD view: ${error.message}`);
    res.status(500).json({
      success: false,
      message: "Failed to fetch Measurand HDD view",
      error: error.message,
    });
  }
};

// -------------------- 7. Get Historical Data for a Terminal and Measurand --------------------
exports.getHistoricalData = async (req, res) => {
  const { terminalId, measurandId } = req.params;
  const { from, to } = req.query;

  try {
    if (!terminalId || !measurandId) {
      return res.status(400).json({
        success: false,
        message: "Missing terminalId or measurandId parameter",
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

    const query = {
      MeasurandId: numericMeasurandId,
      "TerminalDetails.TerminalId": numericTerminalId,
    };

    if (from && to) {
      query["TerminalDetails.TimeStamp"] = {
        $gte: new Date(from),
        $lte: new Date(to),
      };
    }

    const data = await withRetry(async () => {
      return await ESPlantMeasurandView.find(query).lean().exec();
    });

    if (!data.length) {
      return res.status(404).json({
        success: false,
        message: "No historical data found for this terminal and measurand",
      });
    }

    const historicalData = data
      .flatMap((view) =>
        view.TerminalDetails.filter(
          (detail) => detail.TerminalId === numericTerminalId
        ).map((detail) => ({
          Timestamp: detail.TimeStamp,
          MeasurandValue: detail.MeasurandValue,
        }))
      )
      .sort((a, b) => new Date(a.Timestamp) - new Date(b.Timestamp));

    res.status(200).json({
      success: true,
      message: "Historical data retrieved successfully",
      data: historicalData,
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

// -------------------- 8. Get All Plants --------------------
exports.getPlants = async (req, res) => {
  try {
    const plants = await ESPlantMeasurandView.distinct("PlantId").lean();

    if (!plants.length) {
      return res.status(404).json({
        success: false,
        message: "No plants found",
      });
    }

    const plantDetails = await ESPlantMeasurandView.find({
      PlantId: { $in: plants },
    })
      .select("PlantId PlantName")
      .lean();

    const uniquePlants = [
      ...new Map(
        plantDetails.map((p) => [
          p.PlantId,
          { plantId: p.PlantId, plantName: p.PlantName },
        ])
      ).values(),
    ];

    res.status(200).json(uniquePlants);
  } catch (error) {
    log.error(`Error fetching plants: ${error.message}`);
    res.status(500).json({
      success: false,
      message: "Failed to fetch plants",
      error: error.message,
    });
  }
};

// -------------------- 9. Get All Measurands by Plant ID --------------------
exports.getMeasurandsByPlant = async (req, res) => {
  try {
    const { plantId } = req.params;
    const plantIdNum = Number(plantId);

    if (isNaN(plantIdNum)) {
      return res.status(400).json({
        success: false,
        message: "Invalid plantId format. Must be a number.",
      });
    }

    const measurands = await ESPlantMeasurandView.find({ PlantId: plantIdNum })
      .select("MeasurandId MeasurandName")
      .lean();

    if (!measurands.length) {
      return res.status(404).json({
        success: false,
        message: "No measurands found for this plant",
      });
    }

    const uniqueMeasurands = [
      ...new Map(
        measurands.map((m) => [
          m.MeasurandId,
          { measurandId: m.MeasurandId, measurandName: m.MeasurandName },
        ])
      ).values(),
    ];

    res.status(200).json(uniqueMeasurands);
  } catch (error) {
    log.error(`Error fetching measurands: ${error.message}`);
    res.status(500).json({
      success: false,
      message: "Failed to fetch measurands",
      error: error.message,
    });
  }
};

// -------------------- 10. Get All Terminals by Plant ID and Measurand ID --------------------
exports.getTerminalsByPlantAndMeasurand = async (req, res) => {
  try {
    const { plantId, measurandId } = req.params;
    const plantIdNum = Number(plantId);
    const measurandIdNum = Number(measurandId);

    if (isNaN(plantIdNum) || isNaN(measurandIdNum)) {
      return res.status(400).json({
        success: false,
        message: "Invalid plantId or measurandId format. Must be numbers.",
      });
    }

    const terminals = await ESPlantMeasurandView.find({
      PlantId: plantIdNum,
      MeasurandId: measurandIdNum,
    })
      .select("TerminalDetails")
      .lean();

    if (!terminals.length) {
      return res.status(404).json({
        success: false,
        message: "No terminals found for this plant and measurand",
      });
    }

    const terminalList = terminals.flatMap((t) =>
      t.TerminalDetails.map((td) => ({
        terminalId: td.TerminalId,
        terminalName: td.TerminalName,
      }))
    );

    const uniqueTerminals = [
      ...new Map(terminalList.map((t) => [t.terminalId, t])).values(),
    ];

    if (!uniqueTerminals.length) {
      return res.status(404).json({
        success: false,
        message: "No terminals found",
      });
    }

    res.status(200).json(uniqueTerminals);
  } catch (error) {
    log.error(`Error fetching terminals: ${error.message}`);
    res.status(500).json({
      success: false,
      message: "Failed to fetch terminals",
      error: error.message,
    });
  }
};

module.exports = exports;
