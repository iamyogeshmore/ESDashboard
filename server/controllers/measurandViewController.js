const ESPlant = require("../models/ESPlant");
const NodeCache = require("node-cache");
const MeasurandView = require("../models/MeasurandView");
const ESPlantMeasurandView = require("../models/ESPlantMeasurandView");

const log = {
  info: (msg) => console.log(`[INFO] ${new Date().toISOString()} - ${msg}`),
  error: (msg) => console.error(`[ERROR] ${new Date().toISOString()} - ${msg}`),
};

const cache = new NodeCache({
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

// 1. Get All Plants from ESPlantMeasurandView
exports.getAllPlants = async (req, res) => {
  try {
    const plants = await ESPlantMeasurandView.distinct("PlantId").lean();

    if (!plants.length) {
      return res.status(404).json({ message: "No plants found" });
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
          { PlantId: p.PlantId, PlantName: p.PlantName },
        ])
      ).values(),
    ];

    res.json(uniquePlants);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// 2. Get All Measurands by Plant ID from ESPlantMeasurandView
exports.getAllMeasurandsByPlantId = async (req, res) => {
  try {
    const { plantId } = req.params;
    const plantIdNum = isNaN(Number(plantId)) ? plantId : Number(plantId);

    const measurands = await ESPlantMeasurandView.find({ PlantId: plantIdNum })
      .select("MeasurandId MeasurandName")
      .lean();

    if (!measurands.length) {
      return res
        .status(404)
        .json({ message: "No measurands found for this plant" });
    }

    const uniqueMeasurands = [
      ...new Map(
        measurands.map((m) => [
          m.MeasurandId,
          { MeasurandId: m.MeasurandId, MeasurandName: m.MeasurandName },
        ])
      ).values(),
    ];

    res.json(uniqueMeasurands);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// 3. Get All Terminals by Plant ID and Measurand ID from ESPlantMeasurandView
exports.getAllTerminalsByPlantAndMeasurand = async (req, res) => {
  try {
    const { plantId, measurandId } = req.params;
    const plantIdNum = isNaN(Number(plantId)) ? plantId : Number(plantId);
    const measurandIdNum = isNaN(Number(measurandId))
      ? measurandId
      : Number(measurandId);

    const terminals = await ESPlantMeasurandView.find({
      PlantId: plantIdNum,
      MeasurandId: measurandIdNum,
    })
      .select("TerminalDetails")
      .lean();

    if (!terminals.length) {
      return res
        .status(404)
        .json({ message: "No terminals found for this plant and measurand" });
    }

    const terminalList = terminals.flatMap((t) =>
      t.TerminalDetails.map((td) => ({
        TerminalId: td.TerminalId,
        TerminalName: td.TerminalName,
      }))
    );

    const uniqueTerminals = [
      ...new Map(terminalList.map((t) => [t.TerminalId, t])).values(),
    ];

    if (!uniqueTerminals.length) {
      return res.status(404).json({ message: "No terminals found" });
    }

    res.json(uniqueTerminals);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// 4. Get Measurand View Measurement Data
exports.getMeasurandViewMeasurementData = async (req, res) => {
  try {
    const { plantId, measurandId, terminalId } = req.params;

    const query = {
      PlantId: isNaN(Number(plantId)) ? plantId : Number(plantId),
      MeasurandId: isNaN(Number(measurandId))
        ? measurandId
        : Number(measurandId),
      "TerminalDetails.TerminalId": isNaN(Number(terminalId))
        ? terminalId
        : Number(terminalId),
    };

    const cacheKey = `${plantId}:${measurandId}:${terminalId}`;
    const cachedData = cache.get(cacheKey);
    if (cachedData) {
      log.info(`Cache hit for measurand view data: ${cacheKey}`);
      return res.status(200).json({
        success: true,
        message: "Measurand view data retrieved from cache",
        data: cachedData,
      });
    }

    const data = await withRetry(async () => {
      return await ESPlantMeasurandView.find(query).lean().exec();
    });

    if (!data.length) {
      return res.status(404).json({
        success: false,
        message:
          "No measurement data found for this measurand view and terminal",
      });
    }

    const filteredData = data
      .map((view) => ({
        PlantId: view.PlantId,
        PlantName: view.PlantName,
        MeasurandId: view.MeasurandId,
        MeasurandName: view.MeasurandName,
        TerminalDetails: view.TerminalDetails.filter(
          (detail) =>
            detail.TerminalId ===
            (isNaN(Number(terminalId)) ? terminalId : Number(terminalId))
        ).map((detail) => ({
          TerminalId: detail.TerminalId,
          TerminalName: detail.TerminalName,
          Unit: detail.Unit,
          MeasurandValue: detail.MeasurandValue,
          TimeStamp: detail.TimeStamp,
          TimeStampId: detail.TimeStampId,
        })),
      }))
      .filter((view) => view.TerminalDetails.length > 0);

    if (!filteredData.length) {
      return res.status(404).json({
        success: false,
        message: "No measurement data found for this terminal",
      });
    }

    cache.set(cacheKey, filteredData);
    log.info(`Cache set for measurand view data: ${cacheKey}`);

    res.status(200).json({
      success: true,
      message: "Measurand view data retrieved successfully",
      data: filteredData,
    });
  } catch (error) {
    log.error(`Error fetching measurand view data: ${error.message}`);
    res.status(500).json({
      success: false,
      message: "Failed to fetch measurand view data",
      error: error.message,
    });
  }
};

// -------------------- 5. Get All Measurand Views --------------------
exports.getMeasurandViews = async (req, res) => {
  try {
    const views = await withRetry(async () => {
      return await MeasurandView.find().lean().exec();
    });

    if (!views || views.length === 0) {
      log.info("No Measurand views found.");
      return res.status(200).json({
        success: true,
        message: "No Measurand views found",
        data: [],
      });
    }

    res.status(200).json({
      success: true,
      message: "Measurand views retrieved successfully",
      data: views,
      total: views.length,
    });
  } catch (error) {
    log.error(`Error fetching Measurand views: ${error.message}`);
    res.status(500).json({
      success: false,
      message: "Failed to fetch Measurand views",
      error: error.message,
    });
  }
};

// -------------------- 6. Create Measurand View --------------------
exports.createMeasurandView = async (req, res) => {
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
      !Array.isArray(terminalIds)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Missing required fields (plantId, measurandId, terminalIds) or terminalIds is not an array",
      });
    }

    const newView = new MeasurandView({
      profile: "custom",
      plantId,
      measurandId,
      terminalIds,
      plantName: plantName || "",
      measurandName: measurandName || "",
      terminalNames: terminalNames || [],
    });

    const savedView = await withRetry(async () => {
      return await newView.save();
    });

    res.status(201).json({
      success: true,
      message: "Measurand view created successfully",
      data: savedView,
    });
  } catch (error) {
    log.error(`Error creating Measurand view: ${error.message}`);
    res.status(500).json({
      success: false,
      message: "Failed to create Measurand view",
      error: error.message,
    });
  }
};

// -------------------- 7. Update Measurand View --------------------
exports.updateMeasurandView = async (req, res) => {
  try {
    const { id } = req.params;
    const { terminalIds, terminalNames } = req.body;

    if (!id || !terminalIds || !Array.isArray(terminalIds)) {
      return res.status(400).json({
        success: false,
        message:
          "Missing required fields (id, terminalIds) or terminalIds is not an array",
      });
    }

    const updatedView = await withRetry(async () => {
      return await MeasurandView.findByIdAndUpdate(
        id,
        {
          terminalIds,
          terminalNames: terminalNames || [],
          updatedAt: Date.now(),
        },
        { new: true }
      ).lean();
    });

    if (!updatedView) {
      return res.status(404).json({
        success: false,
        message: "Measurand view not found",
      });
    }

    log.info(`Updated Measurand view: ${id}`);
    res.status(200).json({
      success: true,
      message: "Measurand view updated successfully",
      data: updatedView,
    });
  } catch (error) {
    log.error(`Error updating Measurand view: ${error.message}`);
    res.status(500).json({
      success: false,
      message: "Failed to update Measurand view",
      error: error.message,
    });
  }
};

// -------------------- 8. Delete Measurand View --------------------
exports.deleteMeasurandView = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Missing required field: id",
      });
    }

    const deletedView = await withRetry(async () => {
      return await MeasurandView.findByIdAndDelete(id).lean();
    });

    if (!deletedView) {
      return res.status(404).json({
        success: false,
        message: "Measurand view not found",
      });
    }

    log.info(`Deleted Measurand view: ${id}`);
    res.status(200).json({
      success: true,
      message: "Measurand view deleted successfully",
      data: deletedView,
    });
  } catch (error) {
    log.error(`Error deleting Measurand view: ${error.message}`);
    res.status(500).json({
      success: false,
      message: "Failed to delete Measurand view",
      error: error.message,
    });
  }
};

module.exports = exports;
