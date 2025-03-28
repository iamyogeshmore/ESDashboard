import React, { useState, useEffect, useContext, useCallback } from "react";
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
  Checkbox,
  FormControlLabel,
  Paper,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { ThemeContext } from "../../contexts/ThemeContext";

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

const StyledButton = styled(Button)(({ theme }) => ({
  "&:disabled": {
    backgroundColor: theme.palette.grey[400],
    color: theme.palette.grey[600],
  },
}));

const RangeCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  borderRadius: 8,
  backgroundColor: theme.palette.mode === "dark" ? "#2c2c2c" : "#f9fafb",
  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(2),
  marginBottom: theme.spacing(1),
}));

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

// --------------------------- Function renders a dialog form for creating/editing widgets -------------------------------
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

  // --------------------------- Function generates default ranges for gauge widget -------------------------------
  const generateRanges = (min, max) => {
    const rangeSize = (max - min) / 3;
    return [
      { start: min, end: min + rangeSize, color: "#ff5252" },
      { start: min + rangeSize, end: min + 2 * rangeSize, color: "#ffeb3b" },
      { start: min + 2 * rangeSize, end: max, color: "#4caf50" },
    ];
  };

  // --------------------------- Function validates form data based on widget type -------------------------------
  const validateForm = useCallback(() => {
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
        if (!formData.plant) newErrors.plant = "Plant is required";
        if (!formData.terminal) newErrors.terminal = "Terminal is required";
        if (!formData.measurement)
          newErrors.measurement = "Measurement is required";
        if (!formData.name) newErrors.name = "Widget name is required";
        if (formData.decimals && isNaN(formData.decimals))
          newErrors.decimals = "Must be a valid number";
        if (widgetType === "gauge") {
          const minRange = Number(formData.minRange);
          const maxRange = Number(formData.maxRange);
          if (isNaN(minRange)) newErrors.minRange = "Must be a valid number";
          if (isNaN(maxRange)) newErrors.maxRange = "Must be a valid number";
          if (minRange >= maxRange)
            newErrors.maxRange = "Max must be greater than Min";
          if (!formData.ranges || formData.ranges.length !== 3)
            newErrors.ranges = "Three ranges are required";
          else {
            const ranges = formData.ranges.map((r) => ({
              start: Number(r.start),
              end: Number(r.end),
            }));
            if (ranges.some((r) => isNaN(r.start) || isNaN(r.end)))
              newErrors.ranges = "All range values must be valid numbers";
            else if (ranges[0].start !== minRange || ranges[2].end !== maxRange)
              newErrors.ranges = "Ranges must cover from min to max";
            else {
              for (let i = 0; i < ranges.length - 1; i++) {
                if (ranges[i].end !== ranges[i + 1].start) {
                  newErrors.ranges = "Ranges must be continuous";
                  break;
                }
                if (ranges[i].start >= ranges[i].end) {
                  newErrors.ranges =
                    "Start must be less than End in each range";
                  break;
                }
              }
            }
          }
        }
        isValid = Object.keys(newErrors).length === 0;
        break;
      case "graph":
        if (!formData.plant) newErrors.plant = "Plant is required";
        if (!formData.terminal) newErrors.terminal = "Terminal is required";
        if (!formData.measurement)
          newErrors.measurement = "Measurement is required";
        if (!formData.name) newErrors.name = "Widget name is required";
        if (!formData.graphType) newErrors.graphType = "Graph type is required";
        if (formData.decimals && isNaN(formData.decimals))
          newErrors.decimals = "Must be a valid number";
        if (formData.resetInterval && isNaN(formData.resetInterval))
          newErrors.resetInterval = "Must be a valid number";
        isValid = Object.keys(newErrors).length === 0;
        break;
      case "image":
        isValid = true;
        break;
      case "datagrid":
        if (!formData.rows || isNaN(formData.rows))
          newErrors.rows = "Valid number of rows is required";
        if (!formData.columns || isNaN(formData.columns))
          newErrors.columns = "Valid number of columns is required";
        isValid = Object.keys(newErrors).length === 0;
        break;
      default:
        break;
    }

    setErrors(newErrors);
    return isValid;
  }, [widgetType, formData]);

  useEffect(() => {
    if (widgetType === "gauge" && formData.minRange && formData.maxRange) {
      const min = Number(formData.minRange);
      const max = Number(formData.maxRange);
      if (min < max && !formData.ranges) {
        handleFormChange("ranges", generateRanges(min, max));
      }
    }
  }, [
    formData.minRange,
    formData.maxRange,
    formData.ranges,
    widgetType,
    handleFormChange,
  ]);

  useEffect(() => {
    setIsFormValid(validateForm());
  }, [formData, widgetType, validateForm]);

  // --------------------------- Function updates range values for gauge widget -------------------------------
  const handleRangeChange = (index, field, value) => {
    const updatedRanges = [...formData.ranges];
    updatedRanges[index] = { ...updatedRanges[index], [field]: Number(value) };
    handleFormChange("ranges", updatedRanges);
  };

  // --------------------------- Function resets gauge ranges to default values -------------------------------
  const handleResetRanges = () => {
    const min = Number(formData.minRange) || 0;
    const max = Number(formData.maxRange) || 100;
    if (min < max) handleFormChange("ranges", generateRanges(min, max));
  };

  // --------------------------- Function renders the form fields based on widget type -------------------------------
  const renderWidgetForm = () => {
    const commonFields = (
      <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
        <FormControl fullWidth error={!!errors.plant} sx={{ mt: 2 }}>
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
          sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 }, mt: 2 }}
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
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 }, mt: 2 }}
            />
            {/* --------------------------- Section for text content input ------------------------------- */}
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
            {/* --------------------------- Section for graph type selection ------------------------------- */}
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
        return (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            {commonFields}
            <TextField
              fullWidth
              label="Minimum Range"
              type="number"
              value={formData.minRange || ""}
              onChange={(e) => handleFormChange("minRange", e.target.value)}
              variant="outlined"
              InputLabelProps={{ shrink: true }}
              error={!!errors.minRange}
              helperText={errors.minRange || "Default: 0"}
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
            />
            <TextField
              fullWidth
              label="Maximum Range"
              type="number"
              value={formData.maxRange || ""}
              onChange={(e) => handleFormChange("maxRange", e.target.value)}
              variant="outlined"
              InputLabelProps={{ shrink: true }}
              error={!!errors.maxRange}
              helperText={errors.maxRange || "Default: 100"}
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
            />
            {formData.ranges && (
              <Box sx={{ mt: 2 }}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 1,
                  }}
                >
                  <Typography variant="subtitle1">Range Settings</Typography>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={handleResetRanges}
                    disabled={!formData.minRange || !formData.maxRange}
                    sx={{ textTransform: "none" }}
                  >
                    Reset Ranges
                  </Button>
                </Box>
                {formData.ranges.map((range, index) => (
                  <RangeCard key={index} elevation={2}>
                    <TextField
                      label={`Start`}
                      type="number"
                      value={range.start}
                      onChange={(e) =>
                        handleRangeChange(index, "start", e.target.value)
                      }
                      variant="outlined"
                      size="small"
                      sx={{ width: "30%" }}
                      error={!!errors.ranges}
                    />
                    <TextField
                      label={`End`}
                      type="number"
                      value={range.end}
                      onChange={(e) =>
                        handleRangeChange(index, "end", e.target.value)
                      }
                      variant="outlined"
                      size="small"
                      sx={{ width: "30%" }}
                      error={!!errors.ranges}
                    />
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <input
                        type="color"
                        value={range.color}
                        onChange={(e) =>
                          handleFormChange("ranges", [
                            ...formData.ranges.slice(0, index),
                            { ...range, color: e.target.value },
                            ...formData.ranges.slice(index + 1),
                          ])
                        }
                        style={{
                          width: 40,
                          height: 40,
                          border: "none",
                          borderRadius: "4px",
                          cursor: "pointer",
                        }}
                      />
                      <Typography variant="body2">{range.color}</Typography>
                    </Box>
                  </RangeCard>
                ))}
                {errors.ranges && (
                  <Typography variant="caption" color="error">
                    {errors.ranges}
                  </Typography>
                )}
              </Box>
            )}
          </Box>
        );
      case "image":
        return (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            {/* --------------------------- Section for image file upload ------------------------------- */}
            <Box sx={{ mt: 2 }}>
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
            {/* --------------------------- Section for datagrid widget name input ------------------------------- */}
            <TextField
              fullWidth
              label="Widget Name (optional)"
              value={formData.name || ""}
              onChange={(e) => handleFormChange("name", e.target.value)}
              variant="outlined"
              InputLabelProps={{ shrink: true }}
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 }, mt: 2 }}
            />
            {/* --------------------------- Section for number of rows input ------------------------------- */}
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
            {/* --------------------------- Section for number of columns input ------------------------------- */}
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
            {/* --------------------------- Section for timestamp checkbox ------------------------------- */}
            <FormControlLabel
              control={
                <Checkbox
                  checked={formData.addTimestamp || false}
                  onChange={(e) =>
                    handleFormChange("addTimestamp", e.target.checked)
                  }
                  color="primary"
                />
              }
              label="Add Timestamp Column"
            />
          </Box>
        );
      default:
        return null;
    }
  };

  // --------------------------- Function handles saving widget data after validation -------------------------------
  const handleSave = () => {
    if (validateForm()) {
      const widgetData = {
        ...formData,
        id: Date.now().toString(),
        type: widgetType,
        minRange: formData.minRange ? Number(formData.minRange) : 0,
        maxRange: formData.maxRange ? Number(formData.maxRange) : 100,
        ranges: formData.ranges || [],
        settings: { ...customDefaultWidgetSettings },
        layout: {
          i: Date.now().toString(),
          x: 0,
          y: 0,
          w: 4,
          h: 4,
        },
      };
      handleSaveWidget(widgetData);
      setErrors({});
      onClose();
    }
  };

  return (
    <StyledDialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Typography
          variant="h5"
          sx={{ fontWeight: 600, color: isDarkMode ? "#90caf9" : "#1976d2" }}
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
          sx={{ borderRadius: 1, textTransform: "none" }}
        >
          Create
        </StyledButton>
      </DialogActions>
    </StyledDialog>
  );
};

export default WidgetFormDialog;
