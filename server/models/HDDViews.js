const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const HDDViewsSchema = new Schema(
  {
    profile: { type: String, default: "custom" },
    plantId: { type: Number, required: true },
    terminalId: { type: Number, required: true },
    measurandIds: [{ type: Number }],
    plantName: { type: String },
    terminalName: { type: String },
    measurandNames: [{ type: String }],
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  {
    collection: "HDDViews",
    timestamps: true,
  }
);

HDDViewsSchema.index({ plantId: 1 });
HDDViewsSchema.index({ terminalId: 1 });
HDDViewsSchema.index({ measurandIds: 1 });

const HDDViews =
  mongoose.models.HDDViews || mongoose.model("HDDViews", HDDViewsSchema);

module.exports = HDDViews;
