const mongoose = require("mongoose");

const MeasurandDetailsSchema = new mongoose.Schema(
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

const ESPlantTerminalSchema = new mongoose.Schema(
  {
    MeasurandDetails: {
      type: MeasurandDetailsSchema,
      required: true,
    },
    TimeStamp: {
      type: Date,
      required: true,
    },
    TimeStampId: {
      type: Number,
      required: true,
    },
    PlantId: {
      type: Number,
      required: true,
      index: true,
    },
    PlantName: {
      type: String,
      required: true,
      index: true,
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
  },
  {
    timestamps: false,
    autoIndex: true,
    collection: "ESPlantTerminal",
  }
);

module.exports =
  mongoose.models.ESPlantTerminal ||
  mongoose.model("ESPlantTerminal", ESPlantTerminalSchema);
