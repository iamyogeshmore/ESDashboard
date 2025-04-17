import React, { useState, useEffect, useCallback } from "react";
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
  Box,
  Typography,
  IconButton,
} from "@mui/material";
import { Add as AddIcon, Delete as DeleteIcon } from "@mui/icons-material";
import { styled } from "@mui/material/styles";

const StyledDialog = styled(Dialog)(({ theme }) => ({
  "& .MuiDialog-paper": {
    borderRadius: "12px",
    padding: theme.spacing(2),
    minWidth: "500px",
    maxWidth: "700px",
  },
}));

const StyledButton = styled(Button)(({ theme }) => ({
  borderRadius: "8px",
  textTransform: "none",
  fontWeight: 600,
  fontFamily: "Inter",
  padding: theme.spacing(1, 3),
}));

const customDefaultWidgetSettings = {
  backgroundColor: "#ffffff",
  backgroundColorDark: "#1f2937",
  headerBackgroundColor: "rgba(243, 244, 246, 0.5)",
  headerBackgroundColorDark: "rgba(55, 65, 81, 0.5)",
  headerBorder: "1px solid rgba(0, 0, 0, 0.1)",
  headerBorderDark: "1px solid rgba(255, 255, 255, 0.1)",
  borderRadius: "8px",
  border: "none",
  titleColor: "#000000",
  titleFontFamily: "inherit",
  titleFontSize: "14px",
  titleFontStyle: "normal",
  titleFontWeight: "normal",
  titleTextDecoration: "none",
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
  const [errors, setErrors] = useState({});

  const validateForm = useCallback(() => {
    const newErrors = {};
    let isValid = true;

    switch (widgetType) {
      case "value":
        if (!formData.plant) newErrors.plant = "Plant is required";
        if (!formData.terminal) newErrors.terminal = "Terminal is required";
        if (!formData.measurement)
          newErrors.measurement = "Measurement is required";
        if (!formData.name) newErrors.name = "Widget name is required";
        if (formData.decimals && isNaN(formData.decimals))
          newErrors.decimals = "Must be a valid number";
        if (formData.minRange && isNaN(formData.minRange))
          newErrors.minRange = "Must be a valid number";
        if (formData.maxRange && isNaN(formData.maxRange))
          newErrors.maxRange = "Must be a valid number";
        isValid = Object.keys(newErrors).length === 0;
        break;
      case "graph":
        if (!formData.plant) newErrors.plant = "Plant is required";
        if (!formData.terminal) newErrors.terminal = "Terminal is required";
        if (!formData.measurement)
          newErrors.measurement = "Measurement is required";
        if (!formData.name) newErrors.name = "Widget name is required";
        if (formData.decimals && isNaN(formData.decimals))
          newErrors.decimals = "Must be a valid number";
        if (
          formData.thresholds?.percentage &&
          isNaN(formData.thresholds.percentage)
        )
          newErrors.thresholds = "Percentage must be a valid number";
        isValid = Object.keys(newErrors).length === 0;
        break;
      case "table":
        if (!formData.plant) newErrors.plant = "Plant is required";
        if (!formData.terminal) newErrors.terminal = "Terminal is required";
        if (!formData.measurement)
          newErrors.measurement = "Measurement is required";
        if (!formData.name) newErrors.name = "Widget name is required";
        if (formData.rows && isNaN(formData.rows))
          newErrors.rows = "Must be a valid number";
        if (formData.columns && isNaN(formData.columns))
          newErrors.columns = "Must be a valid number";
        isValid = Object.keys(newErrors).length === 0;
        break;
      case "text":
        if (!formData.name) newErrors.name = "Widget name is required";
        if (!formData.textContent)
          newErrors.textContent = "Text content is required";
        isValid = Object.keys(newErrors).length === 0;
        break;
      case "image":
        if (!formData.name) newErrors.name = "Widget name is required";
        if (!formData.imageData) newErrors.imageData = "Image data is required";
        isValid = Object.keys(newErrors).length === 0;
        break;
      default:
        break;
    }

    setErrors(newErrors);
    return isValid;
  }, [widgetType, formData]);

  useEffect(() => {
    if (open) {
      setErrors({});
    }
  }, [open]);

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
      selectedMeasurands: formData.measurement
        ? [{ id: measurandInfo?.MeasurandId, name: formData.measurement }]
        : [],
      thresholds: formData.thresholds || { percentage: null },
      imageData: formData.imageData || "",
      settings: { ...customDefaultWidgetSettings },
    };

    handleSaveWidget(widgetData);
  };

  const handleAddRange = () => {
    const newRange = { min: "", max: "", color: "#000000" };
    handleFormChange("ranges", [...(formData.ranges || []), newRange]);
  };

  const handleRangeChange = (index, field, value) => {
    const updatedRanges = [...(formData.ranges || [])];
    updatedRanges[index] = { ...updatedRanges[index], [field]: value };
    handleFormChange("ranges", updatedRanges);
  };

  const handleRemoveRange = (index) => {
    const updatedRanges = [...(formData.ranges || [])];
    updatedRanges.splice(index, 1);
    handleFormChange("ranges", updatedRanges);
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
      case "value":
        return (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            {commonFields}
            <TextField
              fullWidth
              label="Min Range (optional)"
              type="number"
              value={formData.minRange || ""}
              onChange={(e) => handleFormChange("minRange", e.target.value)}
              variant="outlined"
              InputLabelProps={{ shrink: true }}
              error={!!errors.minRange}
              helperText={errors.minRange}
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
            />
            <TextField
              fullWidth
              label="Max Range (optional)"
              type="number"
              value={formData.maxRange || ""}
              onChange={(e) => handleFormChange("maxRange", e.target.value)}
              variant="outlined"
              InputLabelProps={{ shrink: true }}
              error={!!errors.maxRange}
              helperText={errors.maxRange}
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
            />
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Ranges (optional)
              </Typography>
              {(formData.ranges || []).map((range, index) => (
                <Box
                  key={index}
                  sx={{
                    display: "flex",
                    gap: 2,
                    mb: 2,
                    alignItems: "center",
                  }}
                >
                  <TextField
                    label="Min"
                    type="number"
                    value={range.min}
                    onChange={(e) =>
                      handleRangeChange(index, "min", e.target.value)
                    }
                    variant="outlined"
                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                  />
                  <TextField
                    label="Max"
                    type="number"
                    value={range.max}
                    onChange={(e) =>
                      handleRangeChange(index, "max", e.target.value)
                    }
                    variant="outlined"
                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                  />
                  <TextField
                    label="Color"
                    type="color"
                    value={range.color}
                    onChange={(e) =>
                      handleRangeChange(index, "color", e.target.value)
                    }
                    variant="outlined"
                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                  />
                  <IconButton
                    onClick={() => handleRemoveRange(index)}
                    sx={{ color: "#b91c1c" }}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              ))}
              <Button
                startIcon={<AddIcon />}
                onClick={handleAddRange}
                sx={{ mt: 1 }}
              >
                Add Range
              </Button>
            </Box>
          </Box>
        );
      case "graph":
        return (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            {commonFields}
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
      case "table":
        return (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            {commonFields}
            <TextField
              fullWidth
              label="Rows (optional)"
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
              label="Columns (optional)"
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
      case "text":
        return (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
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
      case "image":
        return (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
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
              label="Image URL"
              value={formData.imageData || ""}
              onChange={(e) => handleFormChange("imageData", e.target.value)}
              variant="outlined"
              InputLabelProps={{ shrink: true }}
              error={!!errors.imageData}
              helperText={errors.imageData}
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
            />
          </Box>
        );
      default:
        return null;
    }
  };

  return (
    <StyledDialog open={open} onClose={onClose}>
      <DialogTitle>
        {widgetType
          ? `Add ${
              widgetType.charAt(0).toUpperCase() + widgetType.slice(1)
            } Widget`
          : "Add Widget"}
      </DialogTitle>
      <DialogContent>{renderWidgetForm()}</DialogContent>
      <DialogActions>
        <StyledButton onClick={onClose}>Cancel</StyledButton>
        <StyledButton
          variant="contained"
          onClick={handleSubmit}
          disabled={Object.keys(errors).length > 0}
        >
          Save
        </StyledButton>
      </DialogActions>
    </StyledDialog>
  );
};

export default WidgetFormDialog;
