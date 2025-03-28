const mongoose = require("mongoose");

const MeasurandDataSchema = new mongoose.Schema(
  {
    MeasurandId: {
      type: Number,
      required: true,
    },
    MeasurandName: {
      type: String,
      required: true,
    },
    MeasurandValue: {
      type: Number,
      required: true,
    },
  },
  { _id: false }
);

const ESPlantTerminalHD900Schema = new mongoose.Schema(
  {
    MeasurandData: {
      type: [MeasurandDataSchema],
      required: true,
    },
    TerminalId: {
      type: Number,
      required: true,
      index: true,
    },
    TerminalName: {
      type: String,
      required: true,
      index: true,
    },
    TimeStamp: {
      type: Date,
      required: true,
      index: true,
    },
    TimeStampId: {
      type: Number,
      required: true,
    },
    DebugLogTime: {
      type: String,
      required: false,
    },
  },
  {
    timestamps: false,
    autoIndex: true,
    collection: "ESPlantTerminalHD900",
  }
);

module.exports =
  mongoose.models.ESPlantTerminalHD900 ||
  mongoose.model("ESPlantTerminalHD900", ESPlantTerminalHD900Schema);
