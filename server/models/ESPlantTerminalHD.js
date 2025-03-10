const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ESPlantTerminalHDSchema = new Schema(
  {
    PlantName: String,
    PlantId: Number,
    TerminalId: Number,
    TerminalName: String,
    MeasurandDetails: {
      MeasurandId: Number,
      MeasurandName: String,
      MeasurandValue: Number,
    },
    TimeStampId: Schema.Types.Mixed,
    TimeStamp: String,
  },
  {
    collection: "ESPlantTerminalHD",
    timestamps: false,
  }
);

const ESPlantTerminalHD =
  mongoose.models.ESPlantTerminalHD ||
  mongoose.model("ESPlantTerminalHD", ESPlantTerminalHDSchema);

module.exports = ESPlantTerminalHD;
