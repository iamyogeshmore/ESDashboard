const express = require("express");
const router = express.Router();
const hddController = require("../controllers/hddController");

// -------------------- 1. Get HDD Views --------------------
router.get("/", hddController.getHDDViews);

// -------------------- 2. Create HDD Views --------------------
router.post("/create", hddController.createHDDView);

// -------------------- 3.Update HDD Views --------------------
router.put("/:id", hddController.updateHDDView);

// -------------------- 4.Delete HDD Views --------------------
router.delete("/:id", hddController.deleteHDDView);

// -------------------- 5. Get Plant Information --------------------
router.get("/plants", hddController.getPlants);

// -------------------- 6. Get Terminal Information --------------------
router.get("/terminals/:plantId", hddController.getTerminals);

// -------------------- 7. Get Measurand Information --------------------
router.get("/measurands/:plantId/:terminalId", hddController.getMeasurands);

// -------------------- 8. Get Measurement Data --------------------
router.get(
  "/historical/:terminalId/:measurandId",
  hddController.getHistoricalMeasurandValues
);

// -------------------- 9. Get Measurement Data for Graph --------------------
router.get(
  "/graph/:terminalId/:measurandId",
  hddController.getHistoricalMeasurandValuesForGraph
);

module.exports = router;
