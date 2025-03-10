import React, { useContext, useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Box,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { ThemeContext } from "../../contexts/ThemeContext";

// ------------- dialog with theme-aware styling ------------------
const StyledDialog = styled(Dialog)(({ theme }) => ({
  "& .MuiDialog-paper": {
    borderRadius: 16,
    background:
      theme.palette.mode === "dark"
        ? "linear-gradient(135deg, #1e1e1e 0%, #2c2c2c 100%)"
        : "linear-gradient(135deg, #ffffff 0%, #f5f7fa 100%)",
    boxShadow:
      theme.palette.mode === "dark"
        ? "0 8px 32px rgba(0, 0, 0, 0.5)"
        : "0 8px 32px rgba(0, 0, 0, 0.1)",
    border: `1px solid ${theme.palette.divider}`,
    padding: theme.spacing(1),
  },
}));

// ------------- Buttons with hover effects and theme support ------------------
const StyledButton = styled(Button)(({ theme }) => ({
  "&:disabled": {
    backgroundColor: theme.palette.grey[400],
    color: theme.palette.grey[600],
  },
}));

const WidgetFormDialog = ({
  open,
  onClose,
  widgetType,
  formData,
  plants,
  terminals,
  measurands,
  handleFormChange,
  handleSaveWidget,
}) => {
  const { isDarkMode } = useContext(ThemeContext);
  const [errors, setErrors] = useState({});
  const [isFormValid, setIsFormValid] = useState(false);

  // ------------- Validates the form based on widget type and sets errors ------------------
  const validateForm = () => {
    const newErrors = {};
    let isValid = true;

    switch (widgetType) {
      case "text":
        if (!formData.textContent) {
          newErrors.textContent = "Text content is required";
          isValid = false;
        }
        break;
      case "number":
      case "gauge":
        if (!formData.plant) {
          newErrors.plant = "Plant is required";
          isValid = false;
        }
        if (!formData.terminal) {
          newErrors.terminal = "Terminal is required";
          isValid = false;
        }
        if (!formData.measurement) {
          newErrors.measurement = "Measurement is required";
          isValid = false;
        }
        if (!formData.name) {
          newErrors.name = "Widget name is required";
          isValid = false;
        }
        if (formData.decimals && isNaN(formData.decimals)) {
          newErrors.decimals = "Must be a valid number";
          isValid = false;
        }
        break;
      case "graph":
        if (!formData.plant) {
          newErrors.plant = "Plant is required";
          isValid = false;
        }
        if (!formData.terminal) {
          newErrors.terminal = "Terminal is required";
          isValid = false;
        }
        if (!formData.measurement) {
          newErrors.measurement = "Measurement is required";
          isValid = false;
        }
        if (!formData.name) {
          newErrors.name = "Widget name is required";
          isValid = false;
        }
        if (!formData.graphType) {
          newErrors.graphType = "Graph type is required";
          isValid = false;
        }
        if (formData.decimals && isNaN(formData.decimals)) {
          newErrors.decimals = "Must be a valid number";
          isValid = false;
        }
        if (formData.resetInterval && isNaN(formData.resetInterval)) {
          newErrors.resetInterval = "Must be a valid number";
          isValid = false;
        }
        break;
      case "image":
        if (!formData.name) {
          newErrors.name = "Image name is required";
          isValid = false;
        }
        if (!formData.file) {
          isValid = true;
        }
        break;
      case "datagrid":
        if (!formData.rows || isNaN(formData.rows)) {
          newErrors.rows = "Valid number of rows is required";
          isValid = false;
        }
        if (!formData.columns || isNaN(formData.columns)) {
          newErrors.columns = "Valid number of columns is required";
          isValid = false;
        }
        break;
      default:
        break;
    }

    setErrors(newErrors);
    return isValid;
  };

  // ------------- Updates form validity whenever formData or widgetType changes ------------------
  useEffect(() => {
    setIsFormValid(validateForm());
  }, [formData, widgetType]);

  // ------------- Renders the form fields based on the widget type ------------------
  const renderWidgetForm = () => {
    const commonFields = (
      <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
        <FormControl fullWidth error={!!errors.plant}>
          <InputLabel id="plant-label">Plant</InputLabel>
          <Select
            labelId="plant-label"
            value={formData.plant || ""}
            onChange={(e) => handleFormChange("plant", e.target.value)}
            label="Plant"
            sx={{ borderRadius: 2 }}
          >
            {plants.map((plant) => (
              <MenuItem key={plant.PlantId} value={plant.PlantName}>
                {plant.PlantName}
              </MenuItem>
            ))}
          </Select>
          {errors.plant && (
            <Typography variant="caption" color="error">
              {errors.plant}
            </Typography>
          )}
        </FormControl>
        <FormControl
          fullWidth
          disabled={!formData.plant}
          error={!!errors.terminal}
        >
          <InputLabel id="terminal-label">Terminal Name</InputLabel>
          <Select
            labelId="terminal-label"
            value={formData.terminal || ""}
            onChange={(e) => handleFormChange("terminal", e.target.value)}
            label="Terminal Name"
            sx={{ borderRadius: 2 }}
          >
            {terminals.map((terminal) => (
              <MenuItem key={terminal.TerminalId} value={terminal.TerminalName}>
                {terminal.TerminalName}
              </MenuItem>
            ))}
          </Select>
          {errors.terminal && (
            <Typography variant="caption" color="error">
              {errors.terminal}
            </Typography>
          )}
        </FormControl>
        <FormControl
          fullWidth
          disabled={!formData.terminal}
          error={!!errors.measurement}
        >
          <InputLabel id="measurement-label">Measurement</InputLabel>
          <Select
            labelId="measurement-label"
            value={formData.measurement || ""}
            onChange={(e) => handleFormChange("measurement", e.target.value)}
            label="Measurement"
            sx={{ borderRadius: 2 }}
          >
            {measurands.map((measurand) => (
              <MenuItem
                key={measurand.MeasurandId}
                value={measurand.MeasurandName}
              >
                {measurand.MeasurandName}
              </MenuItem>
            ))}
          </Select>
          {errors.measurement && (
            <Typography variant="caption" color="error">
              {errors.measurement}
            </Typography>
          )}
        </FormControl>
        <TextField
          fullWidth
          label="Widget Name"
          value={formData.name || ""}
          onChange={(e) => handleFormChange("name", e.target.value)}
          variant="outlined"
          InputLabelProps={{ shrink: true }}
          error={!!errors.name}
          helperText={errors.name}
          sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
        />
        <TextField
          fullWidth
          label="Unit (optional)"
          value={formData.unit || ""}
          onChange={(e) => handleFormChange("unit", e.target.value)}
          variant="outlined"
          InputLabelProps={{ shrink: true }}
          sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
        />
        <TextField
          fullWidth
          label="Decimal Places"
          type="number"
          value={formData.decimals || ""}
          onChange={(e) => handleFormChange("decimals", e.target.value)}
          variant="outlined"
          InputLabelProps={{ shrink: true }}
          error={!!errors.decimals}
          helperText={errors.decimals}
          sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
        />
      </Box>
    );

    switch (widgetType) {
      case "text":
        return (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            <TextField
              fullWidth
              label="Widget Name (optional)"
              value={formData.name || ""}
              onChange={(e) => handleFormChange("name", e.target.value)}
              variant="outlined"
              InputLabelProps={{ shrink: true }}
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
            />
            <TextField
              fullWidth
              label="Text Content"
              multiline
              rows={4}
              value={formData.textContent || ""}
              onChange={(e) => handleFormChange("textContent", e.target.value)}
              variant="outlined"
              InputLabelProps={{ shrink: true }}
              error={!!errors.textContent}
              helperText={errors.textContent}
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
            />
          </Box>
        );
      case "number":
        return commonFields;
      case "graph":
        return (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            {commonFields}
            <FormControl fullWidth error={!!errors.graphType}>
              <InputLabel id="graph-type-label">Graph Type</InputLabel>
              <Select
                labelId="graph-type-label"
                value={formData.graphType || ""}
                onChange={(e) => handleFormChange("graphType", e.target.value)}
                label="Graph Type"
                sx={{ borderRadius: 2 }}
              >
                <MenuItem value="simple">Simple</MenuItem>
                <MenuItem value="multi-axis">Multi-axis</MenuItem>
              </Select>
              {errors.graphType && (
                <Typography variant="caption" color="error">
                  {errors.graphType}
                </Typography>
              )}
            </FormControl>
            <TextField
              fullWidth
              label="X-axis Configuration"
              value={formData.xAxis || ""}
              onChange={(e) => handleFormChange("xAxis", e.target.value)}
              variant="outlined"
              InputLabelProps={{ shrink: true }}
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
            />
            <TextField
              fullWidth
              label="Reset Interval"
              type="number"
              value={formData.resetInterval || ""}
              onChange={(e) =>
                handleFormChange("resetInterval", e.target.value)
              }
              variant="outlined"
              InputLabelProps={{ shrink: true }}
              error={!!errors.resetInterval}
              helperText={errors.resetInterval}
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
            />
          </Box>
        );
      case "gauge":
        return commonFields;
      case "image":
        return (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            <TextField
              fullWidth
              label="Image Name"
              value={formData.name || ""}
              onChange={(e) => handleFormChange("name", e.target.value)}
              variant="outlined"
              InputLabelProps={{ shrink: true }}
              error={!!errors.name}
              helperText={errors.name}
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
            />
            <Box>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  handleFormChange("file", e.target.files[0]);
                  if (e.target.files[0] && errors.file) {
                    setErrors((prevErrors) => {
                      const { file, ...rest } = prevErrors;
                      return rest;
                    });
                  }
                }}
                style={{
                  margin: "16px 0",
                  padding: "10px",
                  border: `2px dashed ${isDarkMode ? "#90caf9" : "#1976d2"}`,
                  borderRadius: "8px",
                  backgroundColor: isDarkMode ? "#2c2c2c" : "#f0f4f8",
                  cursor: "pointer",
                  color: isDarkMode ? "#e0e0e0" : "#37474f",
                  display: "block",
                  width: "100%",
                }}
              />
              {errors.file && (
                <Typography variant="caption" color="error">
                  {errors.file}
                </Typography>
              )}
            </Box>
          </Box>
        );
      case "datagrid":
        return (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            <TextField
              fullWidth
              label="Number of Rows"
              type="number"
              value={formData.rows || ""}
              onChange={(e) => handleFormChange("rows", e.target.value)}
              variant="outlined"
              InputLabelProps={{ shrink: true }}
              error={!!errors.rows}
              helperText={errors.rows}
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
            />
            <TextField
              fullWidth
              label="Number of Columns"
              type="number"
              value={formData.columns || ""}
              onChange={(e) => handleFormChange("columns", e.target.value)}
              variant="outlined"
              InputLabelProps={{ shrink: true }}
              error={!!errors.columns}
              helperText={errors.columns}
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
            />
          </Box>
        );
      default:
        return null;
    }
  };

  // ------------- Handles saving the widget if the form is valid ------------------
  const handleSave = () => {
    if (validateForm()) {
      handleSaveWidget();
      setErrors({});
    }
  };

  return (
    <StyledDialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Typography
          variant="h5"
          sx={{
            fontWeight: 600,
            color: isDarkMode ? "#90caf9" : "#1976d2",
          }}
        >
          Create {widgetType} Widget
        </Typography>
      </DialogTitle>
      <DialogContent sx={{ py: 3 }}>{renderWidgetForm()}</DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <StyledButton
          onClick={onClose}
          color="inherit"
          variant="outlined"
          sx={{ borderRadius: 1, textTransform: "none" }}
        >
          Cancel
        </StyledButton>
        <StyledButton
          onClick={handleSave}
          variant="contained"
          disabled={!isFormValid}
        >
          Create
        </StyledButton>
      </DialogActions>
    </StyledDialog>
  );
};

export default WidgetFormDialog;
