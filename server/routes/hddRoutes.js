const express = require("express");
const router = express.Router();
const hddController = require("../controllers/hddController");

// -------------------- 1. Get all HDD views --------------------
router.get("/", hddController.getHDDViews);

// -------------------- 2. Create a new HDD view --------------------
router.post("/create", hddController.createHDDView);

// -------------------- 3. Update an HDD view --------------------
router.put("/:id", hddController.updateHDDView);

// -------------------- 4. Delete an HDD view --------------------
router.delete("/:id", hddController.deleteHDDView);

// -------------------- 5. Get unique plant names --------------------
router.get("/plants", hddController.getPlants);

// -------------------- 6. Get unique terminal names for a plant --------------------
router.get("/terminals/:plantName", hddController.getTerminals);

// -------------------- 7. Get unique measurand names for a plant and terminal --------------------
router.get("/measurands/:plantName/:terminalName", hddController.getMeasurands);

// -------------------- 8. Get measurand values with date filter --------------------
router.get(
  "/historical/:plantName/:terminalName/:measurandName",
  hddController.getHistoricalMeasurandValues
);

// --------------------9. Get Get measurand values for graph --------------------
router.get(
  "/graph/:plantName/:terminalName/:measurandName",
  hddController.getHistoricalMeasurandValuesForGraph
);

module.exports = router;
