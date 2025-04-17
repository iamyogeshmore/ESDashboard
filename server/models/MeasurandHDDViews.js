const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const MeasurandHDDViewsSchema = new Schema(
  {
    profile: { type: String, default: "custom" },
    plantId: { type: Number, required: true },
    measurandId: { type: Number, required: true },
    terminalIds: [{ type: Number, required: true }],
    plantName: { type: String },
    measurandName: { type: String },
    terminalNames: [{ type: String }],
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  {
    collection: "MeasurandHDDViews",
    timestamps: true,
  }
);

MeasurandHDDViewsSchema.index({ plantId: 1 });
MeasurandHDDViewsSchema.index({ measurandId: 1 });
MeasurandHDDViewsSchema.index({ terminalIds: 1 });

const MeasurandHDDViews =
  mongoose.models.MeasurandHDDViews ||
  mongoose.model("MeasurandHDDViews", MeasurandHDDViewsSchema);

module.exports = MeasurandHDDViews;
