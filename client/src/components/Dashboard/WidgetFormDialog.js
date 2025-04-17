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

  const generateRanges = (min, max) => {
    const rangeSize = (max - min) / 3;
    return [
      { start: min, end: min + rangeSize, color: "#ff5252" },
      { start: min + rangeSize, end: min + 2 * rangeSize, color: "#ffeb3b" },
      { start: min + 2 * rangeSize, end: max, color: "#4caf50" },
    ];
  };

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

        if (!formData.name) newErrors.name = "Widget name is required";
        if (!formData.graphType) newErrors.graphType = "Graph type is required";
        if (formData.decimals && isNaN(formData.decimals))
          newErrors.decimals = "Must be a valid number";
        if (formData.resetInterval && isNaN(formData.resetInterval))
          newErrors.resetInterval = "Must be a valid number";
        if (
          formData.thresholds?.percentage &&
          isNaN(formData.thresholds.percentage)
        )
          newErrors.thresholds = "Percentage must be a valid number";
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

  const handleRangeChange = (index, field, value) => {
    const updatedRanges = [...formData.ranges];
    updatedRanges[index] = { ...updatedRanges[index], [field]: Number(value) };
    handleFormChange("ranges", updatedRanges);
  };

  const handleResetRanges = () => {
    const min = Number(formData.minRange) || 0;
    const max = Number(formData.maxRange) || 100;
    if (min < max) handleFormChange("ranges", generateRanges(min, max));
  };

  const handleMeasurandChange = (event) => {
    const selected = event.target.value;
    const selectedMeasurands = formData.selectedMeasurands || [];
    const newMeasurands = selected.map((name) => {
      const existing = selectedMeasurands.find((m) => m.name === name);
      return (
        existing || {
          name,
          id: measurands.find((m) => m.MeasurandName === name)?.MeasurandId,
        }
      );
    });
    handleFormChange("selectedMeasurands", newMeasurands);
  };

  const handleSubmit = () => {
    if (!validateForm()) return;

    const plantInfo = plants.find((p) => p.PlantName === formData.plant);
    const terminalInfo = terminals.find(
      (t) => t.TerminalName === formData.terminal
    );
    const measurandInfo = measurands.find(
      (m) => m.MeasurandName === formData.measurement
    );

    const widgetData = {
      name: formData.name || `${widgetType} Widget`,
      plant: formData.plant || "",
      terminal: formData.terminal || "",
      measurement: formData.measurement || "",
      plantId: plantInfo?.PlantId || "",
      terminalId: terminalInfo?.TerminalId || "",
      measurandId: measurandInfo?.MeasurandId || "",
      unit: formData.unit || "",
      decimals: formData.decimals ? Number(formData.decimals) : undefined,
      textContent: formData.textContent || "",
      minRange: formData.minRange ? Number(formData.minRange) : undefined,
      maxRange: formData.maxRange ? Number(formData.maxRange) : undefined,
      ranges: formData.ranges || undefined,
      rows: formData.rows ? Number(formData.rows) : undefined,
      columns: formData.columns ? Number(formData.columns) : undefined,
      selectedMeasurands: formData.selectedMeasurands || [],
      graphType: formData.graphType || "",
      xAxis: formData.xAxis || "",
      resetInterval: formData.resetInterval
        ? Number(formData.resetInterval)
        : undefined,
      thresholds: formData.thresholds || { percentage: null },
      imageData: formData.imageData || "",
      settings: { ...customDefaultWidgetSettings },
    };

    handleSaveWidget(widgetData);
  };

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
            <TextField
              fullWidth
              label="Percentage Threshold (optional)"
              type="number"
              value={formData.thresholds?.percentage || ""}
              onChange={(e) =>
                handleFormChange("thresholds", {
                  percentage: e.target.value,
                })
              }
              variant="outlined"
              InputLabelProps={{ shrink: true }}
              error={!!errors.thresholds}
              helperText={errors.thresholds}
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
                          cursor: "pointer",
                        }}
                      />
                      <Typography
                        variant="body2"
                        sx={{ color: range.color, fontWeight: "bold" }}
                      >
                        Color
                      </Typography>
                    </Box>
                  </RangeCard>
                ))}
                {errors.ranges && (
                  <Typography variant="caption" color="error" sx={{ mt: 1 }}>
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
            <TextField
              fullWidth
              label="Widget Name (optional)"
              value={formData.name || ""}
              onChange={(e) => handleFormChange("name", e.target.value)}
              variant="outlined"
              InputLabelProps={{ shrink: true }}
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 }, mt: 2 }}
            />
            <Box>
              <Button
                variant="contained"
                component="label"
                sx={{
                  borderRadius: 2,
                  textTransform: "none",
                  backgroundColor: isDarkMode ? "#4b5563" : "#10b981",
                  "&:hover": {
                    backgroundColor: isDarkMode ? "#6b7280" : "#059669",
                  },
                }}
              >
                Upload Image
                <input
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={(e) => handleFormChange("file", e.target.files[0])}
                />
              </Button>
              {formData.imageData && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2">Preview:</Typography>
                  <img
                    src={formData.imageData}
                    alt="Uploaded"
                    style={{
                      maxWidth: "100%",
                      maxHeight: 200,
                      borderRadius: 8,
                      marginTop: 8,
                    }}
                  />
                </Box>
              )}
            </Box>
          </Box>
        );
      case "datagrid":
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
            <FormControlLabel
              control={
                <Checkbox
                  checked={formData.showHeader || false}
                  onChange={(e) =>
                    handleFormChange("showHeader", e.target.checked)
                  }
                />
              }
              label="Show Header"
            />
          </Box>
        );
      default:
        return null;
    }
  };

  return (
    <StyledDialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle
        sx={{
          bgcolor: isDarkMode ? "#1f2937" : "#f3f4f6",
          borderRadius: "12px 12px 0 0",
          fontWeight: "bold",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        {`Create ${
          widgetType.charAt(0).toUpperCase() + widgetType.slice(1)
        } Widget`}
      </DialogTitle>
      <DialogContent sx={{ p: 3 }}>{renderWidgetForm()}</DialogContent>
      <DialogActions sx={{ p: 2, bgcolor: isDarkMode ? "#1f2937" : "#f3f4f6" }}>
        <Button
          onClick={onClose}
          sx={{
            color: isDarkMode ? "#d1d5db" : "#6b7280",
            textTransform: "none",
          }}
        >
          Cancel
        </Button>
        <StyledButton
          onClick={handleSubmit}
          variant="contained"
          disabled={!isFormValid}
          sx={{
            borderRadius: 2,
            textTransform: "none",
            backgroundColor: isDarkMode ? "#4b5563" : "#10b981",
            "&:hover": {
              backgroundColor: isDarkMode ? "#6b7280" : "#059669",
            },
          }}
        >
          Save Widget
        </StyledButton>
      </DialogActions>
    </StyledDialog>
  );
};

export default WidgetFormDialog;
