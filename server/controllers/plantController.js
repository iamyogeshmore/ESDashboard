const ESPlantTerminal = require("../models/ESPlantTerminal");
const ESPlant = require("../models/ESPlant");

//-------------------- 1. Get Plant Information --------------------
exports.getPlantInfo = async (req, res) => {
  try {
    const plants = await ESPlant.find().select("PlantName").lean();

    res.json(
      plants.map((plant) => ({
        PlantName: plant.PlantName,
        PlantId: plant._id,
      }))
    );
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get terminal information by PlantName
exports.getTerminalInfo = async (req, res) => {
  try {
    const { plantName } = req.params;

    const plant = await ESPlant.findOne({ PlantName: plantName })
      .select("TerminalList")
      .lean();

    if (!plant || !plant.TerminalList.length) {
      return res
        .status(404)
        .json({ message: "No terminals found for this plant" });
    }

    res.json(plant.TerminalList);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get measurand information by PlantName and TerminalName
exports.getMeasurandInfo = async (req, res) => {
  try {
    const { plantName, terminalName } = req.params;

    const plant = await ESPlant.findOne({
      PlantName: plantName,
      "TerminalList.TerminalName": terminalName,
    })
      .select("MeasurandList")
      .lean();

    if (!plant || !plant.MeasurandList.length) {
      return res.status(404).json({ message: "No measurands found" });
    }

    res.json(plant.MeasurandList);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// -------------------- 4. Get Measurement Data --------------------
exports.getMeasurementData = async (req, res) => {
  try {
    const { plantId, terminalId, measurandId } = req.params;

    // Convert to appropriate types if necessary (e.g., handle string IDs)
    const query = {
      PlantId: isNaN(Number(plantId)) ? plantId : Number(plantId), // Handle both string and number IDs
      TerminalId: isNaN(Number(terminalId)) ? terminalId : Number(terminalId),
      "MeasurandDetails.MeasurandId": isNaN(Number(measurandId)) ? measurandId : Number(measurandId),
    };

    const data = await ESPlantTerminal.find(query)
      .select("MeasurandDetails.MeasurandValue MeasurandDetails.Unit TimeStamp")
      .lean();

    if (!data.length) {
      return res.status(404).json({ message: "No measurement data found" });
    }

    res.json(
      data.map((d) => ({
        MeasurandValue: d.MeasurandDetails.MeasurandValue,
        Unit: d.MeasurandDetails.Unit || "",
        TimeStamp: d.TimeStamp,
      }))
    );
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};