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
  ListItemText,
  Button,
  Typography,
  Grid,
  Chip,
  Box,
  Divider,
  CircularProgress,
} from "@mui/material";

// Base URL for API calls
const API_BASE_URL = `${process.env.REACT_APP_API_LOCAL_URL}api/hdd`;

const CreateTableDialog = ({ open, onClose, onCreate }) => {
  const [newTable, setNewTable] = useState({
    plantId: "",
    terminalId: "",
    measurandIds: [],
    plantName: "",
    terminalName: "",
    measurandNames: [],
  });
  const [plantOptions, setPlantOptions] = useState([]);
  const [terminalOptions, setTerminalOptions] = useState([]);
  const [measurandOptions, setMeasurandOptions] = useState([]);
  const [loading, setLoading] = useState({
    plants: false,
    terminals: false,
    measurands: false,
  });
  const [error, setError] = useState(null);

  // Fetch plants when dialog opens
  useEffect(() => {
    if (open) {
      const fetchPlants = async () => {
        setLoading((prev) => ({ ...prev, plants: true }));
        try {
          const response = await axios.get(`${API_BASE_URL}/plants`);
          if (!response.data.success) throw new Error(response.data.message);
          setPlantOptions(response.data.data); // Expecting [{ plantId, plantName }]
          setError(null);
        } catch (error) {
          console.error("Error fetching plants:", error);
          setError(error.message || "Failed to fetch plants");
        } finally {
          setLoading((prev) => ({ ...prev, plants: false }));
        }
      };
      fetchPlants();
    }
  }, [open]);

  // Handle changes in form fields
  const handleNewTableChange = (field) => async (event) => {
    const value = event.target.value;

    if (field === "plantId") {
      const selectedPlant = plantOptions.find((p) => p.plantId === value);
      setNewTable((prev) => ({
        ...prev,
        plantId: value,
        plantName: selectedPlant?.plantName || "",
        terminalId: "",
        terminalName: "",
        measurandIds: [],
        measurandNames: [],
      }));
      setTerminalOptions([]);
      setMeasurandOptions([]);

      if (value) {
        setLoading((prev) => ({ ...prev, terminals: true }));
        try {
          const response = await axios.get(
            `${API_BASE_URL}/terminals/${value}`
          );
          if (!response.data.success) throw new Error(response.data.message);
          // Map backend response to match expected structure
          const formattedTerminals = response.data.data.map((terminal) => ({
            terminalId: terminal.terminalId || terminal.TerminalId,
            terminalName: terminal.terminalName || terminal.TerminalName,
          }));
          setTerminalOptions(formattedTerminals);
          setError(null);
        } catch (error) {
          console.error("Error fetching terminals:", error);
          setError(error.message || "Failed to fetch terminals");
          setTerminalOptions([]);
        } finally {
          setLoading((prev) => ({ ...prev, terminals: false }));
        }
      }
    } else if (field === "terminalId") {
      const selectedTerminal = terminalOptions.find(
        (t) => t.terminalId === value
      );
      setNewTable((prev) => ({
        ...prev,
        terminalId: value,
        terminalName: selectedTerminal?.terminalName || "",
        measurandIds: [],
        measurandNames: [],
      }));
      setMeasurandOptions([]);

      if (value && newTable.plantId) {
        setLoading((prev) => ({ ...prev, measurands: true }));
        try {
          const response = await axios.get(
            `${API_BASE_URL}/measurands/${newTable.plantId}/${value}`
          );
          if (!response.data.success) throw new Error(response.data.message);
          // Map backend response to include unit
          const formattedMeasurands = response.data.data.map((measurand) => ({
            measurandId: measurand.measurandId || measurand.MeasurandId,
            measurandName: measurand.measurandName || measurand.MeasurandName,
            unit: measurand.unit || measurand.Unit || "",
          }));
          setMeasurandOptions(formattedMeasurands);
          setError(null);
        } catch (error) {
          console.error("Error fetching measurands:", error);
          setError(error.message || "Failed to fetch measurands");
          setMeasurandOptions([]);
        } finally {
          setLoading((prev) => ({ ...prev, measurands: false }));
        }
      }
    } else if (field === "measurandIds") {
      const selectedNames = value; // Array of selected measurandNames
      const selectedIds = measurandOptions
        .filter((option) => selectedNames.includes(option.measurandName))
        .map((option) => option.measurandId);
      setNewTable((prev) => ({
        ...prev,
        measurandIds: selectedIds,
        measurandNames: selectedNames,
      }));
    }
  };

  // Handle table creation
  const handleCreate = async () => {
    if (
      !newTable.plantId ||
      !newTable.terminalId ||
      !newTable.measurandIds.length
    ) {
      setError("Please complete all required fields");
      return;
    }

    setLoading((prev) => ({ ...prev, plants: true }));
    try {
      const response = await axios.post(`${API_BASE_URL}/create`, newTable);
      if (!response.data.success) throw new Error(response.data.message);
      onCreate(response.data.data);
      handleClose();
    } catch (error) {
      console.error("Error creating HDD view:", error);
      setError(error.message || "Failed to create HDD view");
    } finally {
      setLoading((prev) => ({ ...prev, plants: false }));
    }
  };

  // Reset form and close dialog
  const handleClose = () => {
    setNewTable({
      plantId: "",
      terminalId: "",
      measurandIds: [],
      plantName: "",
      terminalName: "",
      measurandNames: [],
    });
    setTerminalOptions([]);
    setMeasurandOptions([]);
    setError(null);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Typography variant="h6">Create New HDD View</Typography>
        <Typography variant="body2" color="text.secondary">
          Configure table settings for HDD
        </Typography>
      </DialogTitle>

      <Divider />

      <DialogContent>
        {error && (
          <Typography color="error" sx={{ mb: 2 }}>
            {error}
          </Typography>
        )}
        <Grid container spacing={3}>
          {/* Plant Selection */}
          <Grid item xs={12}>
            <FormControl fullWidth disabled={loading.plants}>
              <InputLabel id="plant-label">Plant Name</InputLabel>
              <Select
                labelId="plant-label"
                value={newTable.plantId}
                label="Plant Name"
                onChange={handleNewTableChange("plantId")}
              >
                <MenuItem value="">
                  <em>Select Plant</em>
                </MenuItem>
                {plantOptions.map((option) => (
                  <MenuItem key={option.plantId} value={option.plantId}>
                    {option.plantName}
                  </MenuItem>
                ))}
              </Select>
              {loading.plants && (
                <CircularProgress
                  size={20}
                  sx={{ position: "absolute", right: 30, top: 15 }}
                />
              )}
            </FormControl>
          </Grid>

          {/* Terminal Selection */}
          <Grid item xs={12}>
            <FormControl
              fullWidth
              disabled={!newTable.plantId || loading.terminals}
            >
              <InputLabel id="terminal-label">Terminal Name</InputLabel>
              <Select
                labelId="terminal-label"
                value={newTable.terminalId}
                label="Terminal Name"
                onChange={handleNewTableChange("terminalId")}
              >
                <MenuItem value="">
                  <em>Select Terminal</em>
                </MenuItem>
                {terminalOptions.map((option) => (
                  <MenuItem key={option.terminalId} value={option.terminalId}>
                    {option.terminalName}
                  </MenuItem>
                ))}
              </Select>
              {loading.terminals && (
                <CircularProgress
                  size={20}
                  sx={{ position: "absolute", right: 30, top: 15 }}
                />
              )}
            </FormControl>
          </Grid>

          {/* Measurand Selection */}
          <Grid item xs={12}>
            <FormControl
              fullWidth
              disabled={!newTable.terminalId || loading.measurands}
            >
              <InputLabel id="measurand-label">Measurand Options</InputLabel>
              <Select
                labelId="measurand-label"
                multiple
                value={newTable.measurandNames}
                label="Measurand Options"
                onChange={handleNewTableChange("measurandIds")}
                renderValue={(selected) => (
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                    {selected.map((value) => (
                      <Chip key={value} label={value} />
                    ))}
                  </Box>
                )}
              >
                {measurandOptions.map((option) => (
                  <MenuItem
                    key={option.measurandId}
                    value={option.measurandName}
                  >
                    <Checkbox
                      checked={newTable.measurandNames.includes(
                        option.measurandName
                      )}
                    />
                    <ListItemText primary={option.measurandName} />
                  </MenuItem>
                ))}
              </Select>
              {loading.measurands && (
                <CircularProgress
                  size={20}
                  sx={{ position: "absolute", right: 30, top: 15 }}
                />
              )}
            </FormControl>
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={handleClose} color="inherit">
          Cancel
        </Button>
        <Button
          onClick={handleCreate}
          variant="contained"
          disabled={
            !newTable.plantId ||
            !newTable.terminalId ||
            !newTable.measurandIds.length ||
            loading.plants
          }
        >
          {loading.plants ? <CircularProgress size={20} /> : "Create Table"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreateTableDialog;
