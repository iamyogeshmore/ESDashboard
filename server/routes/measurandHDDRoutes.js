const express = require("express");
const router = express.Router();
const measurandHDDController = require("../controllers/measurandHDDController");

// -------------------- 1. Get all Measurand HDD Views --------------------
router.get("/", measurandHDDController.getMeasurandHDDViews);

// -------------------- 2. Create Measurand HDD Views --------------------
router.post("/create", measurandHDDController.createMeasurandHDDView);

// -------------------- 3. Update Measurand HDD Views --------------------
router.put("/:id", measurandHDDController.updateMeasurandHDDView);

// -------------------- 4. Delete Measurand HDD Views --------------------
router.delete("/:id", measurandHDDController.deleteMeasurandHDDView);

// -------------------- 5. Get Measurand HDD View by ID --------------------
router.get("/:id", measurandHDDController.getMeasurandHDDViewById);

// -------------------- 6. Get Measurand HDD View by plantId and measurandId --------------------
router.get(
  "/:plantId/:measurandId",
  measurandHDDController.getMeasurandHDDViewByPlantAndMeasurand
);

// -------------------- 7. Get Historical Data for a Terminal and Measurand --------------------
router.get(
  "/historical/:terminalId/:measurandId",
  measurandHDDController.getHistoricalData
);

// -------------------- 8. Get All Plants --------------------
router.get("/plants", measurandHDDController.getPlants);

// -------------------- 9. Get All Measurands by Plant ID --------------------
router.get(
  "/measurands/plant/:plantId",
  measurandHDDController.getMeasurandsByPlant
);

// -------------------- 10. Get All Terminals by Plant ID and Measurand ID --------------------
router.get(
  "/terminals/plant/:plantId/measurand/:measurandId",
  measurandHDDController.getTerminalsByPlantAndMeasurand
);

module.exports = router;
