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

const BASE_URL = `${process.env.REACT_APP_API_LOCAL_URL}api`;

const customDefaultWidgetSettings = {
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
};

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

  useEffect(() => {
    const loadSavedTemplates = () => {
      const templates = Object.keys(localStorage)
        .filter((key) => key.startsWith("widgetTemplate_"))
        .map((key) => key.replace("widgetTemplate_", ""));
      setSavedTemplates(templates);
    };

    loadSavedTemplates();

    if (widgetData && widgetData.settings) {
      setSettings({ ...customDefaultWidgetSettings, ...widgetData.settings });
    } else if (selectedWidget) {
      const widgetSettings = localStorage.getItem(
        `widgetSettings_${selectedWidget}`
      );
      if (widgetSettings) {
        try {
          setSettings({
            ...customDefaultWidgetSettings,
            ...JSON.parse(widgetSettings),
          });
        } catch (error) {
          console.error(
            `Error parsing settings for widget ${selectedWidget}:`,
            error
          );
          setSettings({ ...customDefaultWidgetSettings });
        }
      } else {
        setSettings({ ...customDefaultWidgetSettings });
      }
    } else {
      setSettings({ ...customDefaultWidgetSettings });
    }
  }, [selectedWidget, widgetData]);

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

  const saveSettings = async () => {
    try {
      const updatedSettings = { ...settings };
      localStorage.setItem("widgetSettings", JSON.stringify(updatedSettings));
      if (selectedWidget) {
        localStorage.setItem(
          `widgetSettings_${selectedWidget}`,
          JSON.stringify(updatedSettings)
        );
      }

      if (viewId && selectedWidget) {
        const response = await axios.patch(
          `${BASE_URL}/saved-views/${viewId}/widgets/${selectedWidget}`,
          updatedSettings
        );
        console.log("Updated view:", response.data);
      }

      if (onApply) onApply(updatedSettings, applyToAll, selectedWidget);
      if (onClose) onClose();
    } catch (error) {
      console.error("Error saving widget settings:", error);
    }
  };

  const loadTemplate = (templateName) => {
    const template = localStorage.getItem(`widgetTemplate_${templateName}`);
    if (template) {
      try {
        setSettings(JSON.parse(template));
        setSelectedTemplate(templateName);
      } catch (error) {
        console.error(`Error loading template ${templateName}:`, error);
      }
    }
  };

  const handleOpenSaveDialog = () => {
    setSaveDialogOpen(true);
    setNewTemplateName("");
    setTemplateNameError("");
  };

  const validateTemplateName = (name) => {
    if (!name.trim()) return "Template name cannot be empty";
    if (savedTemplates.includes(name) && !editDialogOpen)
      return "Template name already exists";
    return "";
  };

  const saveTemplate = () => {
    const error = validateTemplateName(newTemplateName);
    if (error) {
      setTemplateNameError(error);
      return;
    }
    localStorage.setItem(
      `widgetTemplate_${newTemplateName}`,
      JSON.stringify(settings)
    );
    setSavedTemplates([...savedTemplates, newTemplateName]);
    setSaveDialogOpen(false);
    setSelectedTemplate(newTemplateName);
  };

  const updateTemplate = () => {
    const error = validateTemplateName(newTemplateName);
    if (error && newTemplateName !== selectedTemplate) {
      setTemplateNameError(error);
      return;
    }
    localStorage.setItem(
      `widgetTemplate_${newTemplateName}`,
      JSON.stringify(settings)
    );
    if (newTemplateName !== selectedTemplate) {
      localStorage.removeItem(`widgetTemplate_${selectedTemplate}`);
      setSavedTemplates(
        savedTemplates.map((t) =>
          t === selectedTemplate ? newTemplateName : t
        )
      );
    }
    setEditDialogOpen(false);
    setSelectedTemplate(newTemplateName);
  };

  const deleteTemplate = () => {
    if (!selectedTemplate) {
      setTemplateNameError("Please select a template to delete.");
      return;
    }
    localStorage.removeItem(`widgetTemplate_${selectedTemplate}`);
    setSavedTemplates(savedTemplates.filter((t) => t !== selectedTemplate));
    setSelectedTemplate("");
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
                value={settings.backgroundColor}
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
                value={settings.borderColor}
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
                value={settings.borderRadius}
                onChange={handleInputChange("borderRadius")}
                fullWidth
                sx={{ mt: 2 }}
              />
              <CoolTextField
                label="Border Width"
                value={settings.borderWidth}
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
                value={settings.titleColor}
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
                  value={settings.titleFontFamily}
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
                  value={settings.titleFontSize}
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
                value={settings.valueColor}
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
                  value={settings.valueFontFamily}
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
                  value={settings.valueFontSize}
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
                  <MenuItem key={template} value={template}>
                    {template}
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
                  Save
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
            color={settings[currentColorField]}
            onChangeComplete={handleColorChange(currentColorField)}
          />
          <Button onClick={closeColorPicker} sx={{ mt: 1, width: "100%" }}>
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
