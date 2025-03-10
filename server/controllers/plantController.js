const ESPlantTerminal = require("../models/ESPlantTerminal");

//-------------------- 1. Get Plant Information --------------------
exports.getPlantInfo = async (req, res) => {
  try {
    const plants = await ESPlantTerminal.distinct("PlantName").then((names) =>
      Promise.all(
        names.map(async (name) => ({
          PlantName: name,
          PlantId: await ESPlantTerminal.findOne({ PlantName: name })
            .select("PlantId")
            .then((doc) => doc.PlantId),
        }))
      )
    );

    res.json(plants);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// -------------------- 2. Get Terminal Information by PlantName --------------------
exports.getTerminalInfo = async (req, res) => {
  try {
    const { plantName } = req.params;

    const terminals = await ESPlantTerminal.aggregate([
      { $match: { PlantName: plantName } },
      {
        $group: {
          _id: "$TerminalName",
          TerminalId: { $first: "$TerminalId" },
        },
      },
      {
        $project: {
          TerminalName: "$_id",
          TerminalId: 1,
          _id: 0,
        },
      },
    ]).exec();

    if (!terminals.length) {
      return res
        .status(404)
        .json({ message: "No terminals found for this plant" });
    }

    res.json(terminals);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// -------------------- 3. Get Measurand Information by PlantName and TerminalName --------------------
exports.getMeasurandInfo = async (req, res) => {
  try {
    const { plantName, terminalName } = req.params;

    const measurands = await ESPlantTerminal.find({
      PlantName: plantName,
      TerminalName: terminalName,
    })
      .select("MeasurandDetails.MeasurandName MeasurandDetails.MeasurandId")
      .lean();

    if (!measurands.length) {
      return res.status(404).json({ message: "No measurands found" });
    }

    res.json(
      measurands.map((m) => ({
        MeasurandName: m.MeasurandDetails.MeasurandName,
        MeasurandId: m.MeasurandDetails.MeasurandId,
      }))
    );
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// -------------------- 4. Get Measurement Data --------------------
exports.getMeasurementData = async (req, res) => {
  try {
    const { plantName, terminalName, measurandName } = req.params;

    const data = await ESPlantTerminal.find({
      PlantName: plantName,
      TerminalName: terminalName,
      "MeasurandDetails.MeasurandName": measurandName,
    })
      .select("MeasurandDetails.MeasurandValue TimeStamp")
      .lean();

    if (!data.length) {
      return res.status(404).json({ message: "No measurement data found" });
    }

    res.json(
      data.map((d) => ({
        MeasurandValue: d.MeasurandDetails.MeasurandValue,
        TimeStamp: d.TimeStamp,
      }))
    );
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
