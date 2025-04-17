const express = require("express");
const router = express.Router();
const measurandViewController = require("../controllers/measurandViewController");

// -------------------- 1. Save a new measurand view --------------------
router.post(
  "/saved-measurand-views",
  measurandViewController.saveMeasurandView
);

// -------------------- 2. Get all saved measurand views --------------------
router.get(
  "/saved-measurand-views",
  measurandViewController.getSavedMeasurandViews
);

// -------------------- 3. Get a specific saved measurand view by ID --------------------
router.get(
  "/saved-measurand-views/:id",
  measurandViewController.getSavedMeasurandViewById
);

// -------------------- 4. Delete a saved measurand view by ID --------------------
router.delete(
  "/saved-measurand-views/:id",
  measurandViewController.deleteSavedMeasurandView
);

// -------------------- 5. Update widget properties in a saved measurand view --------------------
router.patch(
  "/saved-measurand-views/:viewId/widgets/:widgetId",
  measurandViewController.updateWidgetProperties
);

// -------------------- 6. Update measurand view --------------------
router.put(
  "/saved-measurand-views/:id",
  measurandViewController.updateMeasurandView
);

// -------------------- 7. Get All Plants --------------------
router.get("/plants", measurandViewController.getAllPlants);

// -------------------- 8. Get All Measurands by Plant ID --------------------
router.get(
  "/measurands/plant/:plantId",
  measurandViewController.getAllMeasurandsByPlantId
);

// -------------------- 9. Get All Terminals by Plant ID and Measurand ID --------------------
router.get(
  "/terminals/plant/:plantId/measurand/:measurandId",
  measurandViewController.getAllTerminalsByPlantAndMeasurand
);

// -------------------- 10. Get Measurement Data for Measurand View --------------------
router.get(
  "/measurements/:plantId/:measurandId/:terminalId",
  measurandViewController.getMeasurandViewMeasurementData
);

module.exports = router;
