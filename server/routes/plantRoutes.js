const express = require("express");
const router = express.Router();
const plantController = require("../controllers/plantController");

// -------------------- 1. Get Plant Information --------------------
router.get("/plants", plantController.getPlantInfo);

// -------------------- 2. Get Terminal Information --------------------
router.get("/terminals/:plantName", plantController.getTerminalInfo);

// -------------------- 3. Get Measurand Information --------------------
router.get(
  "/measurands/:plantName/:terminalName",
  plantController.getMeasurandInfo
);

// -------------------- 4. Get Measurement Data --------------------
router.get(
  "/measurements/:plantId/:terminalId/:measurandId",
  plantController.getMeasurementData
);

module.exports = router;
