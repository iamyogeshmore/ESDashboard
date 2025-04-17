const mongoose = require("mongoose");

const measurandViewSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    measurandId: {
      type: String,
      required: true,
      trim: true,
    },
    widgets: [
      {
        i: { type: String, required: true },
        plantId: { type: String },
        plantName: { type: String },
        measurandId: { type: String },
        measurandName: { type: String },
        terminalId: { type: String },
        terminalName: { type: String },
        displayName: { type: String },
        unit: { type: String },
        widgetType: { type: String, enum: ["number", "graph"] },
        decimalPlaces: { type: Number },
        graphType: { type: String },
        xAxisConfiguration: { type: String },
        refreshInterval: { type: Number },
        properties: { type: mongoose.Schema.Types.Mixed },
        position: {
          x: { type: Number, required: true },
          y: { type: Number, required: true },
          width: { type: Number, required: true },
          height: { type: Number, required: true },
        },
      },
    ],
    plant: {
      type: String,
      required: true,
      trim: true,
    },
    terminal: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("MeasurandView", measurandViewSchema);
