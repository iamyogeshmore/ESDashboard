const mongoose = require("mongoose");

const WidgetSchema = new mongoose.Schema({
  id: { type: Number, required: true },
  type: {
    type: String,
    required: true,
    enum: ["number", "graph", "gauge", "image", "datagrid", "text"],
  },
  plant: String,
  terminal: String,
  measurement: String,
  name: String,
  unit: String,
  decimals: Number,
  graphType: String,
  xAxis: String,
  resetInterval: Number,
  rows: Number,
  columns: Number,
  imageData: { type: String },
  textContent: { type: String },
  selectedPlant: { type: String },
  selectedTerminals: [{ type: String }],
  selectedMeasurements: [{ type: String }],
  addTimestamp: { type: Boolean, default: false },
  minRange: { type: Number, default: 0 },
  maxRange: { type: Number, default: 100 },
  ranges: [
    {
      start: { type: Number },
      end: { type: Number },
      color: { type: String },
    },
  ],
  layout: {
    i: { type: String, required: true },
    x: { type: Number, required: true },
    y: { type: Number, required: true },
    w: { type: Number, required: true },
    h: { type: Number, required: true },
  },
  settings: {
    titleColor: { type: String, default: "#666666" },
    titleFontFamily: { type: String, default: "Roboto" },
    titleFontSize: { type: String, default: "14px" },
    titleFontWeight: { type: String, default: "normal" },
    titleFontStyle: { type: String, default: "normal" },
    titleTextDecoration: { type: String, default: "none" },
    valueColor: { type: String, default: "#1976d2" },
    valueFontFamily: { type: String, default: "Roboto" },
    valueFontSize: { type: String, default: "24px" },
    valueFontWeight: { type: String, default: "bold" },
    valueFontStyle: { type: String, default: "normal" },
    valueTextDecoration: { type: String, default: "none" },
    backgroundColor: { type: String, default: "#ffffff" },
    borderColor: { type: String, default: "#e0e0e0" },
    borderWidth: { type: String, default: "1px" },
    borderRadius: { type: String, default: "8px" },
    gaugeColor: { type: String, default: "#1976d2" },
  },
});

const DashboardSchema = new mongoose.Schema(
  {
    id: { type: Number, required: true, unique: true },
    name: { type: String, required: true, unique: true },
    widgets: [WidgetSchema],
    isPublished: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { collection: "Dashboard" }
);

module.exports = mongoose.model("Dashboard", DashboardSchema);
