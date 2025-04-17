const MeasurandView = require("../models/MeasurandView");
const ESPlantMeasurandView = require("../models/ESPlantMeasurandView");
const NodeCache = require("node-cache");
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

// -------------------- 1. Save a new measurand view --------------------
exports.saveMeasurandView = async (req, res) => {
  try {
    const { name, description, measurandId, widgets, plant, terminal } =
      req.body;

    if (
      !name ||
      !measurandId ||
      !plant ||
      !terminal ||
      !widgets ||
      !Array.isArray(widgets)
    ) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Validate widget positions
    const invalidWidgets = widgets.filter(
      (widget) =>
        !widget.position ||
        typeof widget.position.x !== "number" ||
        typeof widget.position.y !== "number" ||
        typeof widget.position.width !== "number" ||
        typeof widget.position.height !== "number"
    );

    if (invalidWidgets.length > 0) {
      log.error("Invalid widgets:", invalidWidgets);
      return res.status(400).json({ message: "Invalid widget position data" });
    }

    const existingView = await MeasurandView.findOne({
      name: { $regex: new RegExp(`^${name}$`, "i") },
    });
    if (existingView) {
      return res.status(400).json({ message: `View "${name}" already exists` });
    }

    const newView = new MeasurandView({
      name,
      description: description || "",
      measurandId,
      widgets: widgets.map((widget) => ({
        ...widget,
        position: {
          x: widget.position.x,
          y: widget.position.y,
          width: widget.position.width,
          height: widget.position.height,
        },
      })),
      plant,
      terminal,
    });

    const savedView = await newView.save();
    log.info(`Saved measurand view: ${savedView._id}`);
    res.status(201).json(savedView);
  } catch (error) {
    log.error(`Error saving measurand view: ${error.message}`);
    res
      .status(500)
      .json({ message: "Error saving measurand view", error: error.message });
  }
};

// -------------------- 2. Update an existing measurand view --------------------
exports.updateMeasurandView = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, measurandId, widgets, plant, terminal } =
      req.body;

    if (
      !name ||
      !measurandId ||
      !plant ||
      !terminal ||
      !widgets ||
      !Array.isArray(widgets)
    ) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const invalidWidgets = widgets.filter(
      (widget) =>
        !widget.position ||
        typeof widget.position.x !== "number" ||
        typeof widget.position.y !== "number" ||
        typeof widget.position.width !== "number" ||
        typeof widget.position.height !== "number"
    );

    if (invalidWidgets.length > 0) {
      log.error("Invalid widgets:", invalidWidgets);
      return res.status(400).json({ message: "Invalid widget position data" });
    }

    const view = await MeasurandView.findById(id);
    if (!view) {
      return res.status(404).json({ message: "Measurand view not found" });
    }

    const existingView = await MeasurandView.findOne({
      name: { $regex: new RegExp(`^${name}$`, "i") },
      _id: { $ne: id },
    });
    if (existingView) {
      return res.status(400).json({ message: `View "${name}" already exists` });
    }

    const updatedView = await MeasurandView.findByIdAndUpdate(
      id,
      {
        name,
        description: description || "",
        measurandId,
        widgets: widgets.map((widget) => ({
          ...widget,
          position: {
            x: widget.position.x,
            y: widget.position.y,
            width: widget.position.width,
            height: widget.position.height,
          },
        })),
        plant,
        terminal,
      },
      { new: true, runValidators: true }
    ).lean();

    if (!updatedView) {
      return res.status(404).json({ message: "Measurand view not found" });
    }

    log.info(`Updated measurand view: ${id}`);
    res.json(updatedView);
  } catch (error) {
    log.error(`Error updating measurand view: ${error.message}`);
    res
      .status(500)
      .json({ message: "Error updating measurand view", error: error.message });
  }
};

// -------------------- 3. Get all saved measurand views --------------------
exports.getSavedMeasurandViews = async (req, res) => {
  try {
    const views = await MeasurandView.find().lean();
    res.json(views);
  } catch (error) {
    log.error(`Error retrieving measurand views: ${error.message}`);
    res
      .status(500)
      .json({
        message: "Error retrieving measurand views",
        error: error.message,
      });
  }
};

// -------------------- 4. Get a specific saved measurand view by ID --------------------
exports.getSavedMeasurandViewById = async (req, res) => {
  try {
    const { id } = req.params;
    const view = await MeasurandView.findById(id).lean();
    if (!view) {
      return res.status(404).json({ message: "Measurand view not found" });
    }
    res.json(view);
  } catch (error) {
    log.error(`Error retrieving measurand view: ${error.message}`);
    res
      .status(500)
      .json({
        message: "Error retrieving measurand view",
        error: error.message,
      });
  }
};

// -------------------- 5. Delete a saved measurand view by ID --------------------
exports.deleteSavedMeasurandView = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedView = await MeasurandView.findByIdAndDelete(id);
    if (!deletedView) {
      return res.status(404).json({ message: "Measurand view not found" });
    }
    log.info(`Deleted measurand view: ${id}`);
    res.json({ message: "Measurand view deleted successfully" });
  } catch (error) {
    log.error(`Error deleting measurand view: ${error.message}`);
    res
      .status(500)
      .json({ message: "Error deleting measurand view", error: error.message });
  }
};

// -------------------- 6. Update widget properties --------------------
exports.updateWidgetProperties = async (req, res) => {
  try {
    const { viewId, widgetId } = req.params;
    const properties = req.body;

    if (
      !viewId ||
      !widgetId ||
      !properties ||
      Object.keys(properties).length === 0
    ) {
      return res.status(400).json({
        message: "Missing required fields: viewId, widgetId, or properties",
      });
    }

    const updatedView = await MeasurandView.findOneAndUpdate(
      { _id: viewId, "widgets.i": widgetId },
      { $set: { "widgets.$.properties": properties } },
      { new: true }
    ).lean();

    if (!updatedView) {
      return res
        .status(404)
        .json({ message: "Measurand view or widget not found" });
    }

    log.info(
      `Updated widget properties for view: ${viewId}, widget: ${widgetId}`
    );
    res.json(updatedView);
  } catch (error) {
    log.error(`Error updating widget properties: ${error.message}`);
    res.status(500).json({
      message: "Error updating widget properties",
      error: error.message,
    });
  }
};

// -------------------- 7. Get All Plants from ESPlantMeasurandView --------------------
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
    log.error(`Error fetching plants: ${error.message}`);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// -------------------- 8. Get All Measurands by Plant ID --------------------
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
    log.error(`Error fetching measurands: ${error.message}`);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// -------------------- 9. Get All Terminals by Plant ID and Measurand ID --------------------
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
    log.error(`Error fetching terminals: ${error.message}`);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// -------------------- 10. Get Measurand View Measurement Data --------------------
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
      return res.json(cachedData);
    }

    const data = await withRetry(async () => {
      return await ESPlantMeasurandView.find(query).lean().exec();
    });

    if (!data.length) {
      return res.status(404).json({
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
        message: "No measurement data found for this terminal",
      });
    }

    cache.set(cacheKey, filteredData);
    log.info(`Cache set for measurand view data: ${cacheKey}`);

    res.json(filteredData);
  } catch (error) {
    log.error(`Error fetching measurand view data: ${error.message}`);
    res.status(500).json({
      message: "Failed to fetch measurand view data",
      error: error.message,
    });
  }
};

module.exports = exports;
