const mongoose = require("mongoose");

const widgetSchema = new mongoose.Schema({
  plantId: { type: String, required: true },
  plantName: { type: String, required: true },
  terminalId: { type: String, required: true },
  terminalName: { type: String, required: true },
  measurandId: { type: String, required: true },
  measurandName: { type: String, required: true },
  displayName: { type: String, required: true },
  unit: { type: String, default: "" },
  widgetType: { type: String, required: true, enum: ["number", "graph"] },
  decimalPlaces: { type: Number, default: 2 },
  graphType: { type: String, default: null },
  xAxisConfiguration: { type: Object, default: null },
  refreshInterval: { type: Number, default: 10000 },
  properties: { type: Object, default: {} },
  position: {
    x: { type: Number, required: true },
    y: { type: Number, required: true },
    width: { type: Number, required: true },
    height: { type: Number, required: true },
  },
  i: { type: String, required: true },
});

const saveViewSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    description: { type: String, default: "" },
    widgets: [widgetSchema],
    plant: { type: String, required: true },
    terminal: { type: String, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("SaveView", saveViewSchema);
