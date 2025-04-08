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
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  FormControlLabel,
  Checkbox,
  Tooltip,
} from "@mui/material";
import {
  FormatBold,
  FormatItalic,
  FormatUnderlined,
  Close as CloseIcon,
  Save as SaveIcon,
  Palette as PaletteIcon,
  Add as AddIcon,
  Remove as RemoveIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";
import { SketchPicker } from "react-color";
import { styled } from "@mui/material/styles";

// ------------------ Base API endpoint from environment variables ------------------
const BASE_URL = `${process.env.REACT_APP_API_LOCAL_URL}api`;

// ------------------ Utility function to adjust size ------------------
const adjustSize = (currentSize, increment = true, min = 0) => {
  const sizeStr =
    typeof currentSize === "string" ? currentSize : `${currentSize || 0}px`;
  const value = parseInt(sizeStr.replace("px", ""), 10) || 0;
  const newValue = increment ? value + 1 : Math.max(value - 1, min);
  return `${newValue}px`;
};

const WidgetProperties = ({
  onApply,
  selectedWidget,
  viewId,
  onClose,
  widgetData,
  isDashboard,
  dashboardName,
}) => {
  const [settings, setSettings] = useState({});
  const [savedTemplates, setSavedTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [newTemplateName, setNewTemplateName] = useState("");
  const [templateNameError, setTemplateNameError] = useState("");
  const [colorPickerOpen, setColorPickerOpen] = useState(false);
  const [currentColorField, setCurrentColorField] = useState(null);
  const [applyToAll, setApplyToAll] = useState(false);
  const [selectedWidgetType, setSelectedWidgetType] = useState("");

  // Default settings to fall back to if widgetData.settings is incomplete
  const defaultSettings = {
    backgroundColor: "#334155",
    borderColor: "#94A3B8",
    borderRadius: "3px",
    borderWidth: "2px",
    titleColor: "#E2E8F0",
    titleFontFamily: "Arial",
    titleFontSize: "22px",
    titleFontStyle: "normal",
    titleFontWeight: "normal",
    titleTextDecoration: "none",
    valueColor: "#FFFFFF",
    valueFontFamily: "Arial",
    valueFontSize: "44px",
    valueFontStyle: "normal",
    valueFontWeight: "bold",
    valueTextDecoration: "none",
  };

  // --------------------------- Load saved templates and current widget settings ---------------------------
  useEffect(() => {
    const loadSavedTemplates = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/widget-templates`);
        setSavedTemplates(response.data);
      } catch (error) {
        console.error("Error loading templates:", error);
      }
    };
    loadSavedTemplates();

    const currentSettings = widgetData?.settings || {};
    setSettings({
      ...defaultSettings,
      ...currentSettings,
    });
  }, [widgetData]);

  const handleInputChange = (field) => (event) => {
    setSettings({ ...settings, [field]: event.target.value });
  };

  const handleSizeChange = (field, increment) => () => {
    setSettings({
      ...settings,
      [field]: adjustSize(settings[field], increment),
    });
  };

  const handleColorChange = (field) => (color) => {
    setSettings({ ...settings, [field]: color.hex });
  };

  const openColorPicker = (field) => () => {
    setCurrentColorField(field);
    setColorPickerOpen(true);
  };

  const closeColorPicker = () => {
    setColorPickerOpen(false);
    setCurrentColorField(null);
  };

  const toggleStyle = (field, styleType, valueOn, valueOff) => () => {
    setSettings((prevSettings) => ({
      ...prevSettings,
      [field]: prevSettings[field] === valueOn ? valueOff : valueOn,
    }));
  };

  // --------------------------- Save settings to the server ---------------------------
  const saveSettings = async () => {
    try {
      const updatedSettings = { ...settings };

      if (selectedWidget && !applyToAll) {
        if (isDashboard && dashboardName) {
          await axios.patch(
            `${BASE_URL}/dashboards/widgets/${selectedWidget}/properties`,
            updatedSettings
          );
        } else if (viewId) {
          await axios.patch(
            `${BASE_URL}/saved-views/${viewId}/widgets/${selectedWidget}`,
            updatedSettings
          );
        }
      }

      if (onApply) onApply(updatedSettings, applyToAll, selectedWidgetType);
      if (onClose) onClose();
    } catch (error) {
      console.error("Error saving widget settings:", error);
      throw error;
    }
  };

  // --------------------------- Load selected template settings ---------------------------
  const loadTemplate = async (templateId) => {
    try {
      const response = await axios.get(
        `${BASE_URL}/widget-templates/${templateId}`
      );
      const templateSettings = response.data.settings || {};
      setSettings({
        ...settings,
        ...templateSettings,
      });
      setSelectedTemplate(templateId);
    } catch (error) {
      console.error(`Error loading template ${templateId}:`, error);
    }
  };

  const handleOpenSaveDialog = () => {
    setSaveDialogOpen(true);
    setNewTemplateName("");
    setTemplateNameError("");
  };

  const handleOpenEditDialog = () => {
    const currentTemplate = savedTemplates.find(
      (t) => t._id === selectedTemplate
    );
    setNewTemplateName(currentTemplate?.name || "");
    setEditDialogOpen(true);
    setTemplateNameError("");
  };

  const validateTemplateName = (name) => {
    if (!name.trim()) return "Template name cannot be empty";
    if (
      savedTemplates.some(
        (t) =>
          t.name.toLowerCase() === name.toLowerCase() &&
          t._id !== selectedTemplate
      )
    )
      return "Template name already exists";
    return "";
  };

  // --------------------------- Save and update template ---------------------------
  const saveTemplate = async () => {
    const error = validateTemplateName(newTemplateName);
    if (error) {
      setTemplateNameError(error);
      return;
    }
    try {
      const response = await axios.post(`${BASE_URL}/widget-templates`, {
        name: newTemplateName,
        settings,
      });
      setSavedTemplates([...savedTemplates, response.data]);
      setSaveDialogOpen(false);
      setSelectedTemplate(response.data._id);
    } catch (error) {
      console.error("Error saving template:", error);
      setTemplateNameError("Failed to save template");
    }
  };

  const updateTemplate = async () => {
    const error = validateTemplateName(newTemplateName);
    if (
      error &&
      newTemplateName !==
        savedTemplates.find((t) => t._id === selectedTemplate)?.name
    ) {
      setTemplateNameError(error);
      return;
    }
    try {
      const response = await axios.put(
        `${BASE_URL}/widget-templates/${selectedTemplate}`,
        {
          name: newTemplateName,
          settings,
        }
      );
      setSavedTemplates(
        savedTemplates.map((t) =>
          t._id === selectedTemplate ? response.data : t
        )
      );
      setEditDialogOpen(false);
    } catch (error) {
      console.error("Error updating template:", error);
      setTemplateNameError("Failed to update template");
    }
  };

  // ---------------------- Delete template ----------------------
  const deleteTemplate = async () => {
    if (!selectedTemplate) {
      setTemplateNameError("Please select a template to delete.");
      return;
    }
    try {
      await axios.delete(`${BASE_URL}/widget-templates/${selectedTemplate}`);
      setSavedTemplates(
        savedTemplates.filter((t) => t._id !== selectedTemplate)
      );
      setSelectedTemplate("");
    } catch (error) {
      console.error("Error deleting template:", error);
      setTemplateNameError("Failed to delete template");
    }
  };

  const WidgetPreview = () => (
    <Paper
      elevation={4}
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

  const widgetTypes = ["number", "graph", "gauge", "image", "datagrid", "text"];

  return (
    <Box sx={{ p: 3, bgcolor: "#0f1415" }}>
      <CoolPaper elevation={3}>
        <Typography
          variant="h5"
          gutterBottom
          sx={{ fontWeight: 600, color: "#e0e0e0" }}
        >
          Widget Properties {selectedWidget ? `for ${selectedWidget}` : ""}
        </Typography>
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{ position: "absolute", right: 16, top: 16, color: "#e0e0e0" }}
        >
          <CloseIcon />
        </IconButton>

        <Grid container spacing={2}>
          <Grid item xs={4}>
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ color: "#4a90e2" }}>
                General Settings
              </Typography>
              <CoolTextField
                label="Background Color"
                value={settings.backgroundColor || ""}
                onChange={handleInputChange("backgroundColor")}
                fullWidth
                InputProps={{
                  endAdornment: (
                    <>
                      <Box
                        sx={{
                          width: 20,
                          height: 20,
                          bgcolor: settings.backgroundColor,
                          borderRadius: "4px",
                          mr: 1,
                        }}
                      />
                      <IconButton onClick={openColorPicker("backgroundColor")}>
                        <PaletteIcon sx={{ color: "#e0e0e0" }} />
                      </IconButton>
                    </>
                  ),
                }}
              />
              <CoolTextField
                label="Border Color"
                value={settings.borderColor || ""}
                onChange={handleInputChange("borderColor")}
                fullWidth
                sx={{ mt: 2 }}
                InputProps={{
                  endAdornment: (
                    <>
                      <Box
                        sx={{
                          width: 20,
                          height: 20,
                          bgcolor: settings.borderColor,
                          borderRadius: "4px",
                          mr: 1,
                        }}
                      />
                      <IconButton onClick={openColorPicker("borderColor")}>
                        <PaletteIcon sx={{ color: "#e0e0e0" }} />
                      </IconButton>
                    </>
                  ),
                }}
              />
              <CoolTextField
                label="Border Radius"
                value={settings.borderRadius || ""}
                onChange={handleInputChange("borderRadius")}
                fullWidth
                sx={{ mt: 2 }}
              />
              <CoolTextField
                label="Border Width"
                value={settings.borderWidth || ""}
                onChange={handleInputChange("borderWidth")}
                fullWidth
                sx={{ mt: 2 }}
              />
            </Box>
          </Grid>

          <Grid item xs={4}>
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ color: "#4a90e2" }}>
                Title Text Format
              </Typography>
              <CoolTextField
                label="Title Color"
                value={settings.titleColor || ""}
                onChange={handleInputChange("titleColor")}
                fullWidth
                InputProps={{
                  endAdornment: (
                    <>
                      <Box
                        sx={{
                          width: 20,
                          height: 20,
                          bgcolor: settings.titleColor,
                          borderRadius: "4px",
                          mr: 1,
                        }}
                      />
                      <IconButton onClick={openColorPicker("titleColor")}>
                        <PaletteIcon sx={{ color: "#e0e0e0" }} />
                      </IconButton>
                    </>
                  ),
                }}
              />
              <FormControl fullWidth sx={{ mt: 2 }}>
                <InputLabel sx={{ color: "rgba(255, 255, 255, 0.6)" }}>
                  Font Family
                </InputLabel>
                <CoolSelect
                  value={settings.titleFontFamily || ""}
                  onChange={handleInputChange("titleFontFamily")}
                  label="Font Family"
                >
                  <MenuItem value="Arial">Arial</MenuItem>
                  <MenuItem value="Georgia">Georgia</MenuItem>
                  <MenuItem value="Times New Roman">Times New Roman</MenuItem>
                  <MenuItem value="Verdana">Verdana</MenuItem>
                </CoolSelect>
              </FormControl>
              <Box sx={{ display: "flex", alignItems: "center", mt: 2 }}>
                <CoolTextField
                  label="Font Size"
                  value={settings.titleFontSize || ""}
                  onChange={handleInputChange("titleFontSize")}
                  fullWidth
                />
                <IconButton
                  onClick={handleSizeChange("titleFontSize", true)}
                  sx={{ ml: 1, color: "#e0e0e0" }}
                >
                  <AddIcon />
                </IconButton>
                <IconButton
                  onClick={handleSizeChange("titleFontSize", false)}
                  sx={{ color: "#e0e0e0" }}
                >
                  <RemoveIcon />
                </IconButton>
              </Box>
              <Box sx={{ mt: 2 }}>
                <IconButton
                  onClick={toggleStyle(
                    "titleFontWeight",
                    "bold",
                    "bold",
                    "normal"
                  )}
                  color={
                    settings.titleFontWeight === "bold" ? "primary" : "default"
                  }
                  sx={{ color: "#e0e0e0" }}
                >
                  <FormatBold />
                </IconButton>
                <IconButton
                  onClick={toggleStyle(
                    "titleFontStyle",
                    "italic",
                    "italic",
                    "normal"
                  )}
                  color={
                    settings.titleFontStyle === "italic" ? "primary" : "default"
                  }
                  sx={{ color: "#e0e0e0" }}
                >
                  <FormatItalic />
                </IconButton>
                <IconButton
                  onClick={toggleStyle(
                    "titleTextDecoration",
                    "underline",
                    "underline",
                    "none"
                  )}
                  color={
                    settings.titleTextDecoration === "underline"
                      ? "primary"
                      : "default"
                  }
                  sx={{ color: "#e0e0e0" }}
                >
                  <FormatUnderlined />
                </IconButton>
              </Box>
            </Box>
          </Grid>

          <Grid item xs={4}>
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ color: "#4a90e2" }}>
                Value Text Format
              </Typography>
              <CoolTextField
                label="Value Color"
                value={settings.valueColor || ""}
                onChange={handleInputChange("valueColor")}
                fullWidth
                InputProps={{
                  endAdornment: (
                    <>
                      <Box
                        sx={{
                          width: 20,
                          height: 20,
                          bgcolor: settings.valueColor,
                          borderRadius: "4px",
                          mr: 1,
                        }}
                      />
                      <IconButton onClick={openColorPicker("valueColor")}>
                        <PaletteIcon sx={{ color: "#e0e0e0" }} />
                      </IconButton>
                    </>
                  ),
                }}
              />
              <FormControl fullWidth sx={{ mt: 2 }}>
                <InputLabel sx={{ color: "rgba(255, 255, 255, 0.6)" }}>
                  Font Family
                </InputLabel>
                <CoolSelect
                  value={settings.valueFontFamily || ""}
                  onChange={handleInputChange("valueFontFamily")}
                  label="Font Family"
                >
                  <MenuItem value="Arial">Arial</MenuItem>
                  <MenuItem value="Georgia">Georgia</MenuItem>
                  <MenuItem value="Times New Roman">Times New Roman</MenuItem>
                  <MenuItem value="Verdana">Verdana</MenuItem>
                </CoolSelect>
              </FormControl>
              <Box sx={{ display: "flex", alignItems: "center", mt: 2 }}>
                <CoolTextField
                  label="Font Size"
                  value={settings.valueFontSize || ""}
                  onChange={handleInputChange("valueFontSize")}
                  fullWidth
                />
                <IconButton
                  onClick={handleSizeChange("valueFontSize", true)}
                  sx={{ ml: 1, color: "#e0e0e0" }}
                >
                  <AddIcon />
                </IconButton>
                <IconButton
                  onClick={handleSizeChange("valueFontSize", false)}
                  sx={{ color: "#e0e0e0" }}
                >
                  <RemoveIcon />
                </IconButton>
              </Box>
              <Box sx={{ mt: 2 }}>
                <IconButton
                  onClick={toggleStyle(
                    "valueFontWeight",
                    "bold",
                    "bold",
                    "normal"
                  )}
                  color={
                    settings.valueFontWeight === "bold" ? "primary" : "default"
                  }
                  sx={{ color: "#e0e0e0" }}
                >
                  <FormatBold />
                </IconButton>
                <IconButton
                  onClick={toggleStyle(
                    "valueFontStyle",
                    "italic",
                    "italic",
                    "normal"
                  )}
                  color={
                    settings.valueFontStyle === "italic" ? "primary" : "default"
                  }
                  sx={{ color: "#e0e0e0" }}
                >
                  <FormatItalic />
                </IconButton>
                <IconButton
                  onClick={toggleStyle(
                    "valueTextDecoration",
                    "underline",
                    "underline",
                    "none"
                  )}
                  color={
                    settings.valueTextDecoration === "underline"
                      ? "primary"
                      : "default"
                  }
                  sx={{ color: "#e0e0e0" }}
                >
                  <FormatUnderlined />
                </IconButton>
              </Box>
            </Box>
          </Grid>
        </Grid>

        <Divider sx={{ my: 2, bgcolor: "rgba(255, 255, 255, 0.1)" }} />

        <Grid container spacing={2}>
          <Grid item xs={6}>
            <Typography variant="h6" gutterBottom sx={{ color: "#4a90e2" }}>
              Preview
            </Typography>
            <WidgetPreview />
          </Grid>
          <Grid item xs={6}>
            <Typography variant="h6" gutterBottom sx={{ color: "#4a90e2" }}>
              Template Management
            </Typography>
            <FormControl fullWidth>
              <InputLabel sx={{ color: "rgba(255, 255, 255, 0.6)" }}>
                Select Template
              </InputLabel>
              <CoolSelect
                value={selectedTemplate}
                onChange={(e) => loadTemplate(e.target.value)}
                label="Select Template"
              >
                <MenuItem value="">
                  <em>None</em>
                </MenuItem>
                {savedTemplates.map((template) => (
                  <MenuItem key={template._id} value={template._id}>
                    {template.name}
                  </MenuItem>
                ))}
              </CoolSelect>
            </FormControl>
            <Box sx={{ mt: 2, display: "flex", gap: 1 }}>
              <Tooltip title="Save current settings as a new template">
                <CoolButton
                  variant="outlined"
                  startIcon={<SaveIcon />}
                  onClick={handleOpenSaveDialog}
                  sx={{
                    flex: 1,
                    borderColor: "#4a90e2",
                    color: "#4a90e2",
                    "&:hover": { borderColor: "#357abd", color: "#357abd" },
                  }}
                >
                  Save New
                </CoolButton>
              </Tooltip>
              <Tooltip title="Update selected template">
                <CoolButton
                  variant="outlined"
                  startIcon={<SaveIcon />}
                  onClick={handleOpenEditDialog}
                  disabled={!selectedTemplate}
                  sx={{
                    flex: 1,
                    borderColor: "#4a90e2",
                    color: selectedTemplate ? "#4a90e2" : "#999",
                    "&:hover": {
                      borderColor: selectedTemplate ? "#357abd" : "#999",
                      color: selectedTemplate ? "#357abd" : "#999",
                    },
                  }}
                >
                  Update
                </CoolButton>
              </Tooltip>
              <Tooltip title="Delete the selected template">
                <CoolButton
                  variant="outlined"
                  startIcon={<DeleteIcon />}
                  onClick={deleteTemplate}
                  disabled={!selectedTemplate}
                  sx={{
                    flex: 1,
                    borderColor: "#ff4444",
                    color: selectedTemplate ? "#ff4444" : "#999",
                    "&:hover": {
                      borderColor: selectedTemplate ? "#cc3333" : "#999",
                      color: selectedTemplate ? "#cc3333" : "#999",
                    },
                  }}
                >
                  Delete
                </CoolButton>
              </Tooltip>
            </Box>
            {templateNameError && (
              <Typography sx={{ color: "#ff4444", mt: 1, fontSize: "0.9rem" }}>
                {templateNameError}
              </Typography>
            )}
          </Grid>
        </Grid>

        <Box sx={{ mt: 2 }}>
          <FormControlLabel
            control={
              <Checkbox
                checked={applyToAll}
                onChange={(e) => setApplyToAll(e.target.checked)}
                sx={{ color: "#4a90e2" }}
              />
            }
            label="Apply to all widgets in this view"
            sx={{ color: "#e0e0e0" }}
          />
          {applyToAll && (
            <FormControl fullWidth sx={{ mt: 2 }}>
              <InputLabel sx={{ color: "rgba(255, 255, 255, 0.6)" }}>
                Apply to Widget Type
              </InputLabel>
              <CoolSelect
                value={selectedWidgetType}
                onChange={(e) => setSelectedWidgetType(e.target.value)}
                label="Apply to Widget Type"
              >
                <MenuItem value="">
                  <em>All Types</em>
                </MenuItem>
                {widgetTypes.map((type) => (
                  <MenuItem key={type} value={type}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </MenuItem>
                ))}
              </CoolSelect>
            </FormControl>
          )}
        </Box>

        <Box
          sx={{ mt: 3, display: "flex", justifyContent: "flex-end", gap: 2 }}
        >
          <CoolButton
            variant="outlined"
            onClick={onClose}
            sx={{
              color: "#e0e0e0",
              borderColor: "#e0e0e0",
              "&:hover": { borderColor: "#b0b0b0" },
            }}
          >
            Cancel
          </CoolButton>
          <CoolButton
            variant="contained"
            onClick={saveSettings}
            sx={{
              bgcolor: "#4a90e2",
              color: "#fff",
              "&:hover": { bgcolor: "#357abd" },
            }}
          >
            Apply
          </CoolButton>
        </Box>
      </CoolPaper>

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
            onChangeComplete={handleColorChange(currentColorField)}
          />
          <Button
            onClick={closeColorPicker}
            sx={{ mt: 1, width: "100%", bgcolor: "#4a90e2", color: "#fff" }}
          >
            Close
          </Button>
        </Box>
      )}

      <Dialog open={saveDialogOpen} onClose={() => setSaveDialogOpen(false)}>
        <DialogTitle sx={{ bgcolor: "#4a90e2", color: "#fff" }}>
          Save New Template
        </DialogTitle>
        <DialogContent sx={{ bgcolor: "#1a2526" }}>
          <CoolTextField
            autoFocus
            margin="dense"
            label="Template Name"
            fullWidth
            value={newTemplateName}
            onChange={(e) => {
              setNewTemplateName(e.target.value);
              setTemplateNameError("");
            }}
            error={!!templateNameError}
            helperText={templateNameError}
          />
        </DialogContent>
        <DialogActions sx={{ bgcolor: "#1a2526" }}>
          <CoolButton onClick={() => setSaveDialogOpen(false)}>
            Cancel
          </CoolButton>
          <CoolButton onClick={saveTemplate} disabled={!!templateNameError}>
            Save
          </CoolButton>
        </DialogActions>
      </Dialog>

      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)}>
        <DialogTitle sx={{ bgcolor: "#4a90e2", color: "#fff" }}>
          Update Template
        </DialogTitle>
        <DialogContent sx={{ bgcolor: "#1a2526" }}>
          <CoolTextField
            autoFocus
            margin="dense"
            label="Template Name"
            fullWidth
            value={newTemplateName}
            onChange={(e) => {
              setNewTemplateName(e.target.value);
              setTemplateNameError("");
            }}
            error={!!templateNameError}
            helperText={templateNameError}
          />
        </DialogContent>
        <DialogActions sx={{ bgcolor: "#1a2526" }}>
          <CoolButton onClick={() => setEditDialogOpen(false)}>
            Cancel
          </CoolButton>
          <CoolButton onClick={updateTemplate} disabled={!!templateNameError}>
            Update
          </CoolButton>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

const CoolPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: "12px",
  background: "linear-gradient(135deg, #1a2526 0%, #2e3b3e 100%)",
  color: "#e0e0e0",
  position: "relative",
}));

const CoolButton = styled(Button)(({ theme }) => ({
  borderRadius: "8px",
  padding: theme.spacing(1, 3),
  textTransform: "none",
}));

const CoolTextField = styled(TextField)(({ theme }) => ({
  "& .MuiOutlinedInput-root": {
    borderRadius: "8px",
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    color: "#e0e0e0",
    "& fieldset": { borderColor: "rgba(255, 255, 255, 0.2)" },
    "&:hover fieldset": { borderColor: "rgba(255, 255, 255, 0.4)" },
  },
  "& .MuiInputLabel-root": { color: "rgba(255, 255, 255, 0.6)" },
}));

const CoolSelect = styled(Select)(({ theme }) => ({
  borderRadius: "8px",
  backgroundColor: "rgba(255, 255, 255, 0.05)",
  color: "#e0e0e0",
  "& .MuiOutlinedInput-notchedOutline": {
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
}));

export default WidgetProperties;
