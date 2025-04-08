const mongoose = require("mongoose");

const widgetTemplateSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    settings: {
      type: Object,
      required: true,
      default: {
        backgroundColor: "#000000",
        borderColor: "#ffffff",
        borderRadius: "3px",
        borderWidth: "1px",
        titleColor: "#ffffff",
        titleFontFamily: "Arial",
        titleFontSize: "24px",
        titleFontStyle: "normal",
        titleFontWeight: "normal",
        titleTextDecoration: "none",
        valueColor: "#f8e71c",
        valueFontFamily: "Arial",
        valueFontSize: "24px",
        valueFontStyle: "normal",
        valueFontWeight: "bold",
        valueTextDecoration: "none",
      },
    },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Optional
  },
  { timestamps: true }
);

module.exports = mongoose.model("WidgetTemplate", widgetTemplateSchema);