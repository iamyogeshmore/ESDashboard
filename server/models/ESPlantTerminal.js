const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ESPlantTerminalSchema = new Schema(
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
    TimeStampId: {
      type: Schema.Types.Mixed,
      default: null,
    },
    TimeStamp: {
      type: { $date: String },
      default: null,
    },
  },
  {
    collection: "ESPlantTerminal",
    timestamps: false,
  }
);

const ESPlantTerminal =
  mongoose.models.ESPlantTerminal ||
  mongoose.model("ESPlantTerminal", ESPlantTerminalSchema);

module.exports = ESPlantTerminal;
