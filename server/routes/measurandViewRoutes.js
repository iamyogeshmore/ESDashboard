const express = require("express");
const router = express.Router();
const measurandViewController = require("../controllers/measurandViewController");

// 1. Get All Plants
router.get("/plants", measurandViewController.getAllPlants);

// 2. Get All Measurands by Plant ID
router.get(
  "/measurands/plant/:plantId",
  measurandViewController.getAllMeasurandsByPlantId
);

// 3. Get All Terminals by Plant ID and Measurand ID
router.get(
  "/terminals/plant/:plantId/measurand/:measurandId",
  measurandViewController.getAllTerminalsByPlantAndMeasurand
);

// 4. Get Measurement Data for Measurand View
router.get(
  "/measurements/:plantId/:measurandId/:terminalId",
  measurandViewController.getMeasurandViewMeasurementData
);
// 5. Get all Measurand Views
router.get("/allmeasurandview", measurandViewController.getMeasurandViews);

// 6. Create a Measurand View
router.post("/create", measurandViewController.createMeasurandView);

// 7. Update a Measurand View
router.put("/:id", measurandViewController.updateMeasurandView);

// 8. Delete a Measurand View
router.delete("/:id", measurandViewController.deleteMeasurandView);

module.exports = router;
