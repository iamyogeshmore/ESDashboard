import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  Snackbar,
  Alert,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
} from "@mui/material";
import {
  FormatBold,
  FormatItalic,
  FormatUnderlined,
  Close as CloseIcon,
  Save as SaveIcon,
  Palette as PaletteIcon,
  TextFields as TextFieldsIcon,
  Add as AddIcon,
  Remove as RemoveIcon,
} from "@mui/icons-material";
import { SketchPicker } from "react-color";

// --------------- Base API endpoint from environment variables ---------------
const BASE_URL = `${process.env.REACT_APP_API_LOCAL_URL}api`;

// ------------------ Default widget settings ------------------
const customDefaultWidgetSettings = {
  titleColor: "#000000",
  titleFontFamily: "Georgia",
  titleFontSize: "34px",
  titleFontWeight: "normal",
  titleFontStyle: "normal",
  titleTextDecoration: "none",
  valueColor: "#d0021b",
  valueFontFamily: "Arial",
  valueFontSize: "39px",
  valueFontWeight: "bold",
  valueFontStyle: "normal",
  valueTextDecoration: "none",
  backgroundColor: "#b8e986",
  borderColor: "#417505",
  borderWidth: "3px",
  borderRadius: "3px",
  widgetName: "Custom Widget",
};

// ------------------ Utility function to adjust size ------------------
const adjustSize = (currentSize, increment = true, min = 0) => {
  const sizeStr =
    typeof currentSize === "string" ? currentSize : `${currentSize || 0}px`;
  const value = parseInt(sizeStr.replace("px", ""), 10) || 0;
  const newValue = increment ? value + 1 : Math.max(value - 1, min);
  return `${newValue}px`;
};

const WidgetProperties = ({ onApply, selectedWidget, viewId, onClose }) => {
  const [settings, setSettings] = useState(customDefaultWidgetSettings);
  const [savedTemplates, setSavedTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [newTemplateName, setNewTemplateName] = useState("");
  const [templateNameError, setTemplateNameError] = useState("");
  const [colorPickerOpen, setColorPickerOpen] = useState(false);
  const [currentColorField, setCurrentColorField] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");

  // ------------------ Effect to load saved templates and default settings ------------------
  useEffect(() => {
    const loadSavedTemplates = () => {
      const templates = Object.keys(localStorage)
        .filter((key) => key.startsWith("widgetTemplate_"))
        .map((key) => key.replace("widgetTemplate_", ""));
      setSavedTemplates(templates);
    };

    loadSavedTemplates();

    const defaultSettings = localStorage.getItem("widgetSettings");
    if (defaultSettings) {
      try {
        setSettings(JSON.parse(defaultSettings));
      } catch (error) {
        console.error("Error parsing saved widget settings:", error);
      }
    }
  }, []);

  // ------------------ Effect to load widget-specific settings ------------------
  useEffect(() => {
    if (selectedWidget) {
      const widgetSettings = localStorage.getItem(
        `widgetSettings_${selectedWidget}`
      );
      if (widgetSettings) {
        try {
          setSettings(JSON.parse(widgetSettings));
        } catch (error) {
          console.error(
            `Error parsing settings for widget ${selectedWidget}:`,
            error
          );
        }
      } else {
        setSettings(customDefaultWidgetSettings);
      }
    }
  }, [selectedWidget]);

  // ------------------ Handler for input changes ------------------
  const handleInputChange = (field, value) => {
    setSettings((prev) => ({ ...prev, [field]: value }));
  };

  // ------------------ Handler for size adjustments ------------------
  const handleSizeChange = (field, increment, min = 1) => {
    setSettings((prev) => ({
      ...prev,
      [field]: adjustSize(prev[field], increment, min),
    }));
  };

  // ------------------ Handler for color changes ------------------
  const handleColorChange = (color) => {
    if (currentColorField) {
      setSettings((prev) => ({ ...prev, [currentColorField]: color.hex }));
    }
  };

  // ------------------ Handler to open color picker ------------------
  const handleColorPickerOpen = (field) => {
    setCurrentColorField(field);
    setColorPickerOpen(true);
  };

  // ------------------ Handler to toggle text formatting ------------------
  const toggleTextFormat = (field, value) => {
    setSettings((prev) => ({
      ...prev,
      [field]: prev[field] === value ? "normal" : value,
    }));
  };

  // ------------------ Function to save settings ------------------
  const saveSettings = async () => {
    try {
      localStorage.setItem("widgetSettings", JSON.stringify(settings));
      if (selectedWidget) {
        localStorage.setItem(
          `widgetSettings_${selectedWidget}`,
          JSON.stringify(settings)
        );
      }

      if (viewId && selectedWidget) {
        const response = await axios.patch(
          `${BASE_URL}/saved-views/${viewId}/widgets/${selectedWidget}`,
          settings
        );
        console.log("Updated view:", response.data);
      }

      setSnackbarMessage("Settings saved successfully");
      setSnackbarSeverity("success");
      setSnackbarOpen(true);

      if (onApply) onApply(settings);
      if (onClose) onClose();
    } catch (error) {
      console.error("Error saving widget settings:", error);
      setSnackbarMessage(
        error.response?.data?.message || "Error saving settings"
      );
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    }
  };

  // ------------------ Function to load a template ------------------
  const loadTemplate = (templateName) => {
    setSelectedTemplate(templateName);
    if (templateName) {
      try {
        const template = JSON.parse(
          localStorage.getItem(`widgetTemplate_${templateName}`)
        );
        if (template) {
          setSettings(template);
          setSnackbarMessage(`Template "${templateName}" loaded successfully`);
          setSnackbarSeverity("success");
          setSnackbarOpen(true);
        }
      } catch (error) {
        console.error("Error loading template:", error);
        setSnackbarMessage("Error loading template");
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
      }
    }
  };

  // ------------------ Handler to open save template dialog ------------------
  const handleOpenSaveDialog = () => {
    setNewTemplateName(settings.widgetName || "");
    setTemplateNameError("");
    setSaveDialogOpen(true);
  };

  // ------------------ Function to validate template name ------------------
  const validateTemplateName = (name) => {
    if (!name.trim()) return "Template name cannot be empty.";
    if (savedTemplates.includes(name))
      return `A template named "${name}" already exists.`;
    return "";
  };

  // ------------------ Handler for template name changes ------------------
  const handleTemplateNameChange = (e) => {
    const name = e.target.value;
    setNewTemplateName(name);
    setTemplateNameError(validateTemplateName(name));
  };

  // ------------------ Function to save settings as a template ------------------
  const saveAsTemplate = () => {
    const errorMessage = validateTemplateName(newTemplateName);
    if (errorMessage) {
      setTemplateNameError(errorMessage);
      return;
    }

    localStorage.setItem(
      `widgetTemplate_${newTemplateName}`,
      JSON.stringify(settings)
    );
    const updatedTemplates = [
      ...savedTemplates.filter((t) => t !== newTemplateName),
      newTemplateName,
    ];
    setSavedTemplates(updatedTemplates);
    setSelectedTemplate(newTemplateName);

    setSaveDialogOpen(false);
    setSnackbarMessage(`Template "${newTemplateName}" saved successfully.`);
    setSnackbarSeverity("success");
    setSnackbarOpen(true);
  };

  // ------------------ Function to delete a template ------------------
  const deleteTemplate = () => {
    if (!selectedTemplate) return;
    if (
      window.confirm(
        `Are you sure you want to delete template "${selectedTemplate}"?`
      )
    ) {
      localStorage.removeItem(`widgetTemplate_${selectedTemplate}`);
      setSavedTemplates(savedTemplates.filter((t) => t !== selectedTemplate));
      setSelectedTemplate("");
      setSnackbarMessage(`Template "${selectedTemplate}" deleted successfully`);
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
    }
  };

  // ------------------ Widget preview component ------------------
  const WidgetPreview = () => (
    <Paper
      elevation={2}
      sx={{
        p: 2,
        width: "100%",
        minHeight: "120px",
        backgroundColor: settings.backgroundColor,
        borderRadius: settings.borderRadius,
        border: `${settings.borderWidth} solid ${settings.borderColor}`,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
      }}
    >
      <Box>
        <Typography
          variant="subtitle2"
          sx={{
            color: settings.titleColor,
            fontFamily: settings.titleFontFamily,
            fontSize: settings.titleFontSize,
            fontWeight: settings.titleFontWeight,
            fontStyle: settings.titleFontStyle,
            textDecoration: settings.titleTextDecoration,
            mb: 1,
          }}
        >
          Sample Widget Title
        </Typography>
        <Typography
          variant="h5"
          sx={{
            color: settings.valueColor,
            fontFamily: settings.valueFontFamily,
            fontSize: settings.valueFontSize,
            fontWeight: settings.valueFontWeight,
            fontStyle: settings.valueFontStyle,
            textDecoration: settings.valueTextDecoration,
          }}
        >
          42
        </Typography>
      </Box>
    </Paper>
  );

  return (
    <Box sx={{ p: 3 }}>
      <Paper elevation={3} sx={{ p: 3, borderRadius: 2, position: "relative" }}>
        {/* ------------------ Header with title and close button ------------------ */}
        <Typography variant="h5" gutterBottom>
          Widget Properties {selectedWidget ? `for ${selectedWidget}` : ""}
        </Typography>
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            position: "absolute",
            right: 8,
            top: 8,
            color: "grey.500",
            "&:hover": { color: "grey.900", backgroundColor: "grey.200" },
          }}
        >
          <CloseIcon />
        </IconButton>

        <Grid container spacing={3}>
          {/* ------------------ Settings configuration panel ------------------ */}
          <Grid item xs={12} md={8}>
            <Typography
              variant="h6"
              sx={{ mt: 2, mb: 1, display: "flex", alignItems: "center" }}
            >
              <TextFieldsIcon sx={{ mr: 1 }} /> Title Text Format
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Title Color"
                  value={settings.titleColor}
                  onChange={(e) =>
                    handleInputChange("titleColor", e.target.value)
                  }
                  InputProps={{
                    endAdornment: (
                      <IconButton
                        onClick={() => handleColorPickerOpen("titleColor")}
                      >
                        <PaletteIcon sx={{ color: settings.titleColor }} />
                      </IconButton>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Font Family</InputLabel>
                  <Select
                    value={settings.titleFontFamily}
                    onChange={(e) =>
                      handleInputChange("titleFontFamily", e.target.value)
                    }
                    label="Font Family"
                  >
                    {["Arial", "Georgia", "Times New Roman", "Verdana"].map(
                      (font) => (
                        <MenuItem key={font} value={font}>
                          {font}
                        </MenuItem>
                      )
                    )}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Font Size"
                  value={settings.titleFontSize}
                  onChange={(e) =>
                    handleInputChange("titleFontSize", e.target.value)
                  }
                  InputProps={{
                    endAdornment: (
                      <>
                        <IconButton
                          onClick={() =>
                            handleSizeChange("titleFontSize", true)
                          }
                        >
                          <AddIcon />
                        </IconButton>
                        <IconButton
                          onClick={() =>
                            handleSizeChange("titleFontSize", false)
                          }
                        >
                          <RemoveIcon />
                        </IconButton>
                      </>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Box sx={{ display: "flex", gap: 1 }}>
                  <IconButton
                    onClick={() => toggleTextFormat("titleFontWeight", "bold")}
                    color={
                      settings.titleFontWeight === "bold"
                        ? "primary"
                        : "default"
                    }
                  >
                    <FormatBold />
                  </IconButton>
                  <IconButton
                    onClick={() => toggleTextFormat("titleFontStyle", "italic")}
                    color={
                      settings.titleFontStyle === "italic"
                        ? "primary"
                        : "default"
                    }
                  >
                    <FormatItalic />
                  </IconButton>
                  <IconButton
                    onClick={() =>
                      toggleTextFormat("titleTextDecoration", "underline")
                    }
                    color={
                      settings.titleTextDecoration === "underline"
                        ? "primary"
                        : "default"
                    }
                  >
                    <FormatUnderlined />
                  </IconButton>
                </Box>
              </Grid>
            </Grid>

            <Typography
              variant="h6"
              sx={{ mt: 2, mb: 1, display: "flex", alignItems: "center" }}
            >
              <TextFieldsIcon sx={{ mr: 1 }} /> Value Text Format
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Value Color"
                  value={settings.valueColor}
                  onChange={(e) =>
                    handleInputChange("valueColor", e.target.value)
                  }
                  InputProps={{
                    endAdornment: (
                      <IconButton
                        onClick={() => handleColorPickerOpen("valueColor")}
                      >
                        <PaletteIcon sx={{ color: settings.valueColor }} />
                      </IconButton>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Font Family</InputLabel>
                  <Select
                    value={settings.valueFontFamily}
                    onChange={(e) =>
                      handleInputChange("valueFontFamily", e.target.value)
                    }
                    label="Font Family"
                  >
                    {["Arial", "Georgia", "Times New Roman", "Verdana"].map(
                      (font) => (
                        <MenuItem key={font} value={font}>
                          {font}
                        </MenuItem>
                      )
                    )}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Font Size"
                  value={settings.valueFontSize}
                  onChange={(e) =>
                    handleInputChange("valueFontSize", e.target.value)
                  }
                  InputProps={{
                    endAdornment: (
                      <>
                        <IconButton
                          onClick={() =>
                            handleSizeChange("valueFontSize", true)
                          }
                        >
                          <AddIcon />
                        </IconButton>
                        <IconButton
                          onClick={() =>
                            handleSizeChange("valueFontSize", false)
                          }
                        >
                          <RemoveIcon />
                        </IconButton>
                      </>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Box sx={{ display: "flex", gap: 1 }}>
                  <IconButton
                    onClick={() => toggleTextFormat("valueFontWeight", "bold")}
                    color={
                      settings.valueFontWeight === "bold"
                        ? "primary"
                        : "default"
                    }
                  >
                    <FormatBold />
                  </IconButton>
                  <IconButton
                    onClick={() => toggleTextFormat("valueFontStyle", "italic")}
                    color={
                      settings.valueFontStyle === "italic"
                        ? "primary"
                        : "default"
                    }
                  >
                    <FormatItalic />
                  </IconButton>
                  <IconButton
                    onClick={() =>
                      toggleTextFormat("valueTextDecoration", "underline")
                    }
                    color={
                      settings.valueTextDecoration === "underline"
                        ? "primary"
                        : "default"
                    }
                  >
                    <FormatUnderlined />
                  </IconButton>
                </Box>
              </Grid>
            </Grid>

            <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
              Widget Appearance
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Background Color"
                  value={settings.backgroundColor}
                  onChange={(e) =>
                    handleInputChange("backgroundColor", e.target.value)
                  }
                  InputProps={{
                    endAdornment: (
                      <IconButton
                        onClick={() => handleColorPickerOpen("backgroundColor")}
                      >
                        <PaletteIcon sx={{ color: settings.backgroundColor }} />
                      </IconButton>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Border Color"
                  value={settings.borderColor}
                  onChange={(e) =>
                    handleInputChange("borderColor", e.target.value)
                  }
                  InputProps={{
                    endAdornment: (
                      <IconButton
                        onClick={() => handleColorPickerOpen("borderColor")}
                      >
                        <PaletteIcon sx={{ color: settings.borderColor }} />
                      </IconButton>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Border Width"
                  value={settings.borderWidth}
                  onChange={(e) =>
                    handleInputChange("borderWidth", e.target.value)
                  }
                  InputProps={{
                    endAdornment: (
                      <>
                        <IconButton
                          onClick={() =>
                            handleSizeChange("borderWidth", true, 0)
                          }
                        >
                          <AddIcon />
                        </IconButton>
                        <IconButton
                          onClick={() =>
                            handleSizeChange("borderWidth", false, 0)
                          }
                        >
                          <RemoveIcon />
                        </IconButton>
                      </>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Border Radius"
                  value={settings.borderRadius}
                  onChange={(e) =>
                    handleInputChange("borderRadius", e.target.value)
                  }
                  InputProps={{
                    endAdornment: (
                      <>
                        <IconButton
                          onClick={() =>
                            handleSizeChange("borderRadius", true, 0)
                          }
                        >
                          <AddIcon />
                        </IconButton>
                        <IconButton
                          onClick={() =>
                            handleSizeChange("borderRadius", false, 0)
                          }
                        >
                          <RemoveIcon />
                        </IconButton>
                      </>
                    ),
                  }}
                />
              </Grid>
            </Grid>

            <Divider sx={{ my: 2 }} />

            {/* ------------------ Template management section ------------------ */}
            <Typography variant="h6" sx={{ mb: 1 }}>
              Templates
            </Typography>
            <Box sx={{ display: "flex", gap: 2 }}>
              <FormControl fullWidth>
                <InputLabel>Select Template</InputLabel>
                <Select
                  value={selectedTemplate}
                  onChange={(e) => loadTemplate(e.target.value)}
                  label="Select Template"
                >
                  <MenuItem value="">
                    <em>None</em>
                  </MenuItem>
                  {savedTemplates.map((template) => (
                    <MenuItem key={template} value={template}>
                      {template}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Button
                variant="outlined"
                onClick={handleOpenSaveDialog}
                startIcon={<SaveIcon />}
              >
                Save As Template
              </Button>
              <Button
                variant="outlined"
                color="error"
                onClick={deleteTemplate}
                disabled={!selectedTemplate}
              >
                Delete Template
              </Button>
            </Box>
          </Grid>

          {/* ------------------ Preview section ------------------ */}
          <Grid item xs={12} md={4}>
            <Typography variant="h6" sx={{ mb: 1 }}>
              Preview
            </Typography>
            <WidgetPreview />
          </Grid>
        </Grid>

        {/* ------------------ Action buttons ------------------ */}
        <Box
          sx={{ mt: 3, display: "flex", justifyContent: "flex-end", gap: 2 }}
        >
          <Button variant="outlined" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="contained" onClick={saveSettings}>
            Apply
          </Button>
        </Box>

        {/* ------------------ Color picker dialog ------------------ */}
        {colorPickerOpen && (
          <Box
            sx={{
              position: "absolute",
              zIndex: 2,
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
            }}
          >
            <SketchPicker
              color={settings[currentColorField] || "#000000"}
              onChangeComplete={handleColorChange}
            />
            <Button
              onClick={() => setColorPickerOpen(false)}
              sx={{ mt: 1, width: "100%" }}
            >
              Close
            </Button>
          </Box>
        )}

        {/* ------------------ Save template dialog ------------------ */}
        <Dialog open={saveDialogOpen} onClose={() => setSaveDialogOpen(false)}>
          <DialogTitle>Save As Template</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Template Name"
              fullWidth
              value={newTemplateName}
              onChange={handleTemplateNameChange}
              error={!!templateNameError}
              helperText={templateNameError}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setSaveDialogOpen(false)}>Cancel</Button>
            <Button onClick={saveAsTemplate} disabled={!!templateNameError}>
              Save
            </Button>
          </DialogActions>
        </Dialog>

        {/* ------------------ Snackbar for feedback ------------------ */}
        <Snackbar
          open={snackbarOpen}
          autoHideDuration={6000}
          onClose={() => setSnackbarOpen(false)}
        >
          <Alert
            onClose={() => setSnackbarOpen(false)}
            severity={snackbarSeverity}
            sx={{ width: "100%" }}
          >
            {snackbarMessage}
          </Alert>
        </Snackbar>
      </Paper>
    </Box>
  );
};

export default WidgetProperties;
