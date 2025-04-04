// models/ESPlant.js
const mongoose = require("mongoose");

const TerminalSchema = new mongoose.Schema(
  {
    TerminalId: { type: Number, required: true },
    TerminalName: { type: String, required: true },
  },
  { _id: false }
);

const MeasurandSchema = new mongoose.Schema(
  {
    MeasurandId: { type: Number, required: true },
    MeasurandName: { type: String, required: true },
    Unit: { type: String }, // Added Unit field
  },
  { _id: false }
);

const QuerySchema = new mongoose.Schema(
  {
    QueryId: { type: Number, required: true },
    QueryName: { type: String, required: true },
  },
  { _id: false }
);

const ScriptSchema = new mongoose.Schema(
  {
    ScriptId: { type: Number, required: true },
    ScriptName: { type: String, required: true },
  },
  { _id: false }
);

const ESPlantSchema = new mongoose.Schema(
  {
    _id: { type: Number, required: true },
    PlantName: {
      type: String,
      required: true,
      index: true,
    },
    Description: { type: String },
    DisplayName: { type: String },
    Type: { type: String },
    TerminalList: [TerminalSchema],
    MeasurandList: [MeasurandSchema],
    QueryList: [QuerySchema],
    ScriptList: [ScriptSchema],
  },
  {
    collection: "ESPlant",
    timestamps: true,
    _id: false,
  }
);

module.exports =
  mongoose.models.ESPlant || mongoose.model("ESPlant", ESPlantSchema);
