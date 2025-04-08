const express = require("express");
const router = express.Router();
const widgetTemplateController = require("../controllers/widgetTemplateController");

// 1. Save a new widget template
router.post("/widget-templates", widgetTemplateController.saveWidgetTemplate);

// 2. Get all widget templates
router.get("/widget-templates", widgetTemplateController.getWidgetTemplates);

// 3. Get a specific widget template by ID
router.get("/widget-templates/:id", widgetTemplateController.getWidgetTemplateById);

// 4. Update a widget template
router.put("/widget-templates/:id", widgetTemplateController.updateWidgetTemplate);

// 5. Delete a widget template
router.delete("/widget-templates/:id", widgetTemplateController.deleteWidgetTemplate);

module.exports = router;