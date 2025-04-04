const mongoose = require("mongoose");

const ESBoltSchema = new mongoose.Schema(
  {
    QName: {
      type: String,
      required: true,
    },
    QDescription: {
      type: String,
      required: true,
    },
    QScript: {
      type: String,
      required: true,
    },
    Enable: {
      type: Boolean,
      required: true,
    },
    QType: {
      type: Number,
      required: false,
    },
  },
  {
    collection: "ESBolts",
  }
);

module.exports =
  mongoose.models.ESBolt || mongoose.model("ESBolts", ESBoltSchema);
