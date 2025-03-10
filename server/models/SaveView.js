const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const WidgetSchema = new Schema({
  plantId: Number,
  plantName: String,
  terminalId: Number,
  terminalName: String,
  measurandId: Number,
  measurandName: String,
  displayName: String,
  unit: String,
  widgetType: String,
  decimalPlaces: Number,
  graphType: String,
  xAxisConfiguration: {
    type: String,
    value: String,
  },
  refreshInterval: Number,
  properties: Schema.Types.Mixed,
  position: {
    x: Number,
    y: Number,
    width: Number,
    height: Number,
  },
  i: String,
});

const SaveViewSchema = new Schema(
  {
    name: { type: String, required: true, unique: true },
    description: { type: String, default: "" },
    widgets: [WidgetSchema],
    plant: { type: String, required: true },
    terminal: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

const SaveView =
  mongoose.models.SaveView || mongoose.model("SaveView", SaveViewSchema);

module.exports = SaveView;
