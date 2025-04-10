// models/ESPlantMeasurandView.js
const mongoose = require("mongoose");

const TerminalDetailsSchema = new mongoose.Schema(
  {
    TerminalId: {
      type: Number,
      required: true,
    },
    TerminalName: {
      type: String,
      required: true,
    },
    Unit: {
      type: String,
      required: true,
    },
    MeasurandValue: {
      type: Number,
      default: null,
    },
    TimeStampId: {
      type: Number,
      required: true,
    },
    TimeStamp: {
      type: Date,
      required: true,
    },
  },
  { _id: false }
);

const ESPlantMeasurandViewSchema = new mongoose.Schema(
  {
    TerminalDetails: [TerminalDetailsSchema],
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
    MeasurandId: {
      type: Number,
      required: true,
      index: true,
    },
    MeasurandName: {
      type: String,
      required: true,
      index: true,
    },
  },
  {
    timestamps: false,
    autoIndex: true,
    collection: "ESPlantMeasurandView",
  }
);

module.exports =
  mongoose.models.ESPlantMeasurandView ||
  mongoose.model("ESPlantMeasurandView", ESPlantMeasurandViewSchema);
