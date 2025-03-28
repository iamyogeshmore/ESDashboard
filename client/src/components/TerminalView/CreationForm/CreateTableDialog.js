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

  useEffect(() => {
    if (open) {
      const fetchPlants = async () => {
        setLoading((prev) => ({ ...prev, plants: true }));
        try {
          const response = await axios.get(`${API_BASE_URL}/plants`);
          if (!response.data.success) throw new Error(response.data.message);
          setPlantOptions(response.data.data);
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
          setTerminalOptions(response.data.data);
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
          setMeasurandOptions(response.data.data); // Now expects all measurands
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
      const selectedNames = value;
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

  const handleCreate = () => {
    if (
      !newTable.plantId ||
      !newTable.terminalId ||
      !newTable.measurandIds.length
    ) {
      onCreate({ error: "Please complete all table fields" });
      return;
    }
    const tableToCreate = {
      plantId: newTable.plantId,
      terminalId: newTable.terminalId,
      measurandIds: newTable.measurandIds,
      plantName: newTable.plantName,
      terminalName: newTable.terminalName,
      measurandNames: newTable.measurandNames,
    };
    onCreate(tableToCreate);
    handleClose();
  };

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
          <Grid item xs={12}>
            <FormControl fullWidth disabled={loading.plants}>
              <InputLabel id="plant-label">Plant Name</InputLabel>
              <Select
                labelId="plant-label"
                value={newTable.plantId}
                label="Plant Name"
                onChange={handleNewTableChange("plantId")}
                endAdornment={
                  loading.plants ? <CircularProgress size={20} /> : null
                }
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
            </FormControl>
          </Grid>

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
                endAdornment={
                  loading.terminals ? <CircularProgress size={20} /> : null
                }
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
            </FormControl>
          </Grid>

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
                endAdornment={
                  loading.measurands ? <CircularProgress size={20} /> : null
                }
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
            !newTable.measurandIds.length
          }
        >
          Create Table
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreateTableDialog;
