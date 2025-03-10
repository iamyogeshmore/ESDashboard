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

// ------------- Base API endpoint from environment variables ------------------
const API_BASE_URL = `${process.env.REACT_APP_API_LOCAL_URL}api`;

const CreateTableDialog = ({ open, onClose, onCreate }) => {
  const [newTable, setNewTable] = useState({
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

  // ------------- Fetches plant ------------------
  useEffect(() => {
    if (open) {
      const fetchPlants = async () => {
        setLoading((prev) => ({ ...prev, plants: true }));
        try {
          const response = await axios.get(`${API_BASE_URL}/plants`);
          setPlantOptions(response.data);
          setError(null);
        } catch (error) {
          console.error("Error fetching plants:", error);
          setError("Failed to fetch plants");
        } finally {
          setLoading((prev) => ({ ...prev, plants: false }));
        }
      };

      fetchPlants();
    }
  }, [open]);

  // ------------- Handles changes to table fields and fetches related data ------------------
  const handleNewTableChange = (field) => async (event) => {
    const value = event.target.value;
    setNewTable((prev) => ({ ...prev, [field]: value }));

    if (field === "plantName") {
      setLoading((prev) => ({ ...prev, terminals: true }));
      try {
        const response = await axios.get(`${API_BASE_URL}/terminals/${value}`);
        setTerminalOptions(response.data);
        setNewTable((prev) => ({
          ...prev,
          [field]: value,
          terminalName: "",
          measurandNames: [],
        }));
        setMeasurandOptions([]);
        setError(null);
      } catch (error) {
        console.error("Error fetching terminals:", error);
        setError("Failed to fetch terminals");
      } finally {
        setLoading((prev) => ({ ...prev, terminals: false }));
      }
    } else if (field === "terminalName") {
      setLoading((prev) => ({ ...prev, measurands: true }));
      try {
        const response = await axios.get(
          `${API_BASE_URL}/measurands/${newTable.plantName}/${value}`
        );
        setMeasurandOptions(response.data);
        setNewTable((prev) => ({
          ...prev,
          [field]: value,
          measurandNames: [],
        }));
        setError(null);
      } catch (error) {
        console.error("Error fetching measurands:", error);
        setError("Failed to fetch measurands");
      } finally {
        setLoading((prev) => ({ ...prev, measurands: false }));
      }
    }
  };

  // ------------- Creates the new table and closes the dialog ------------------
  const handleCreate = () => {
    if (
      !newTable.plantName ||
      !newTable.terminalName ||
      !newTable.measurandNames.length
    ) {
      onCreate({ error: "Please complete all table fields" });
      return;
    }
    onCreate(newTable);
    handleClose();
  };

  // ------------- Resets the form and closes the dialog ------------------
  const handleClose = () => {
    setNewTable({ plantName: "", terminalName: "", measurandNames: [] });
    setTerminalOptions([]);
    setMeasurandOptions([]);
    onClose();
  };

  // ------------- Main render of the create table dialog UI ------------------
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
                value={newTable.plantName}
                label="Plant Name"
                onChange={handleNewTableChange("plantName")}
                endAdornment={
                  loading.plants ? <CircularProgress size={20} /> : null
                }
              >
                {plantOptions.map((option) => (
                  <MenuItem key={option.PlantId} value={option.PlantName}>
                    {option.PlantName}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12}>
            <FormControl
              fullWidth
              disabled={!newTable.plantName || loading.terminals}
            >
              <InputLabel id="terminal-label">Terminal Name</InputLabel>
              <Select
                labelId="terminal-label"
                value={newTable.terminalName}
                label="Terminal Name"
                onChange={handleNewTableChange("terminalName")}
                endAdornment={
                  loading.terminals ? <CircularProgress size={20} /> : null
                }
              >
                {terminalOptions.map((option) => (
                  <MenuItem key={option.TerminalId} value={option.TerminalName}>
                    {option.TerminalName}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12}>
            <FormControl
              fullWidth
              disabled={!newTable.terminalName || loading.measurands}
            >
              <InputLabel id="measurand-label">Measurand Options</InputLabel>
              <Select
                labelId="measurand-label"
                multiple
                value={newTable.measurandNames}
                label="Measurand Options"
                onChange={handleNewTableChange("measurandNames")}
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
                    key={option.MeasurandId}
                    value={option.MeasurandName}
                  >
                    <Checkbox
                      checked={newTable.measurandNames.includes(
                        option.MeasurandName
                      )}
                    />
                    <ListItemText primary={option.MeasurandName} />
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
            !newTable.plantName ||
            !newTable.terminalName ||
            !newTable.measurandNames.length
          }
        >
          Create Table
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreateTableDialog;
