// models/MeasurandView.js
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const MeasurandViewSchema = new Schema(
  {
    profile: { type: String, default: "custom" },
    measurandId: { type: Number, required: true },
    terminalIds: [{ type: Number, required: true }],
    measurandName: { type: String },
    terminalNames: [{ type: String }],
    plantId: { type: Number, required: true },
    plantName: { type: String },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  {
    collection: "MeasurandViews",
    timestamps: true,
  }
);

MeasurandViewSchema.index({ measurandId: 1 });
MeasurandViewSchema.index({ terminalIds: 1 });
MeasurandViewSchema.index({ plantId: 1 });

const MeasurandView =
  mongoose.models.MeasurandView ||
  mongoose.model("MeasurandView", MeasurandViewSchema);

module.exports = MeasurandView;
