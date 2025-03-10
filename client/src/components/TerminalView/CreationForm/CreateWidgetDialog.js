"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  TextField,
  Button,
  FormControlLabel,
} from "@mui/material";

// ------------------ Base API endpoint from environment variables ------------------
const API_BASE_URL = `${process.env.REACT_APP_API_LOCAL_URL}api`;

const CreateWidgetDialog = ({ open, onClose, onCreate, onOpenProperties }) => {
  const [newWidget, setNewWidget] = useState({
    terminalGroup: "",
    terminal: "",
    mesrand: "",
    widgetName: "",
    unit: "",
    decimalPlaces: "2",
    isGraph: false,
    graphType: "simple",
    xAxisRecords: "10",
  });
  const [plants, setPlants] = useState([]);
  const [terminals, setTerminals] = useState([]);
  const [measurands, setMeasurands] = useState([]);

  // ------------------ Fetches plant ------------------
  useEffect(() => {
    if (open) {
      axios
        .get(`${API_BASE_URL}/plants`)
        .then((response) => setPlants(response.data))
        .catch((error) => console.error("Error fetching plants:", error));
    }
  }, [open]);

  // ------------------ Fetches terminal options when a plant is selected ------------------
  useEffect(() => {
    if (newWidget.terminalGroup) {
      axios
        .get(`${API_BASE_URL}/terminals/${newWidget.terminalGroup}`)
        .then((response) =>
          setTerminals(
            response.data.map((t) => ({
              TerminalName: t.TerminalName,
              TerminalID: t.TerminalId,
            }))
          )
        )
        .catch((error) => console.error("Error fetching terminals:", error));
    } else {
      setTerminals([]);
    }
  }, [newWidget.terminalGroup]);

  // ------------------ Fetches measurand options when a terminal is selected ------------------
  useEffect(() => {
    if (newWidget.terminalGroup && newWidget.terminal) {
      axios
        .get(
          `${API_BASE_URL}/measurands/${newWidget.terminalGroup}/${newWidget.terminal}`
        )
        .then((response) => setMeasurands(response.data))
        .catch((error) => console.error("Error fetching measurands:", error));
    } else {
      setMeasurands([]);
    }
  }, [newWidget.terminalGroup, newWidget.terminal]);

  // ------------------ Handles changes to widget fields ------------------
  const handleNewWidgetChange = (field) => (event) => {
    const value =
      field === "isGraph" ? event.target.checked : event.target.value;
    setNewWidget((prev) => ({ ...prev, [field]: value }));
  };

  // ------------------ Creates the new widget and closes the dialog ------------------
  const handleCreate = () => {
    if (
      !newWidget.terminalGroup ||
      !newWidget.terminal ||
      !newWidget.mesrand ||
      !newWidget.widgetName
    ) {
      onCreate({ error: "Please complete all required fields" });
      return;
    }
    onCreate(newWidget);
    handleClose();
  };

  // ------------------ Resets the form and closes the dialog ------------------
  const handleClose = () => {
    setNewWidget({
      terminalGroup: "",
      terminal: "",
      mesrand: "",
      widgetName: "",
      unit: "",
      decimalPlaces: "2",
      isGraph: false,
      graphType: "simple",
      xAxisRecords: "10",
    });
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>Create New Widget</DialogTitle>
      <DialogContent>
        {/* ------------------ Plant selection dropdown ------------------ */}
        <FormControl fullWidth sx={{ mt: 2 }}>
          <InputLabel>Plant</InputLabel>
          <Select
            value={newWidget.terminalGroup}
            label="Plant"
            onChange={handleNewWidgetChange("terminalGroup")}
          >
            {plants.map((plant) => (
              <MenuItem key={plant.PlantId} value={plant.PlantName}>
                {plant.PlantName}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* ------------------ Terminal selection dropdown ------------------ */}
        <FormControl fullWidth sx={{ mt: 2 }}>
          <InputLabel>Terminal</InputLabel>
          <Select
            value={newWidget.terminal}
            label="Terminal"
            onChange={handleNewWidgetChange("terminal")}
            disabled={!newWidget.terminalGroup}
          >
            {terminals.map((terminal) => (
              <MenuItem key={terminal.TerminalID} value={terminal.TerminalName}>
                {terminal.TerminalName}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* ------------------ Measurand selection dropdown ------------------ */}
        <FormControl fullWidth sx={{ mt: 2 }}>
          <InputLabel>Measurand</InputLabel>
          <Select
            value={newWidget.mesrand}
            label="Measurand"
            onChange={handleNewWidgetChange("mesrand")}
            disabled={!newWidget.terminal}
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
        </FormControl>

        {/* ------------------ Widget name input field ------------------ */}
        <TextField
          fullWidth
          margin="dense"
          label="Widget Name"
          value={newWidget.widgetName}
          onChange={handleNewWidgetChange("widgetName")}
          variant="outlined"
          required
          sx={{ mt: 2 }}
        />

        {/* ------------------ Unit input field (optional) ------------------ */}
        <TextField
          fullWidth
          margin="dense"
          label="Unit (optional)"
          value={newWidget.unit}
          onChange={handleNewWidgetChange("unit")}
          variant="outlined"
          sx={{ mt: 2 }}
        />

        {/* ------------------ Decimal places input field ------------------ */}
        <TextField
          fullWidth
          margin="dense"
          label="Decimal Places"
          type="number"
          value={newWidget.decimalPlaces}
          onChange={handleNewWidgetChange("decimalPlaces")}
          variant="outlined"
          sx={{ mt: 2 }}
          inputProps={{ min: 0 }}
        />

        {/* ------------------ Graph toggle checkbox ------------------ */}
        <FormControlLabel
          control={
            <Checkbox
              checked={newWidget.isGraph}
              onChange={handleNewWidgetChange("isGraph")}
            />
          }
          label="Show as Graph"
          sx={{ mt: 2 }}
        />

        {/* ------------------ Graph-specific options (conditional) ------------------ */}
        {newWidget.isGraph && (
          <>
            <FormControl fullWidth sx={{ mt: 2 }}>
              <InputLabel>Graph Type</InputLabel>
              <Select
                value={newWidget.graphType}
                label="Graph Type"
                onChange={handleNewWidgetChange("graphType")}
              >
                <MenuItem value="simple">Simple</MenuItem>
                <MenuItem value="multiAxis">Multi Axis</MenuItem>
              </Select>
            </FormControl>

            <TextField
              fullWidth
              margin="dense"
              label="X-Axis Records"
              type="number"
              value={newWidget.xAxisRecords}
              onChange={handleNewWidgetChange("xAxisRecords")}
              variant="outlined"
              sx={{ mt: 2 }}
              inputProps={{ min: 1 }}
            />
          </>
        )}
      </DialogContent>
      {/* ------------------ Dialog action buttons ------------------ */}
      <DialogActions>
        <Button onClick={onOpenProperties}>Properties</Button>
        <Button onClick={handleClose}>Cancel</Button>
        <Button onClick={handleCreate} variant="contained">
          Create
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreateWidgetDialog;
