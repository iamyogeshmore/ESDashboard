import React, { useState, useEffect } from "react";
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
} from "@mui/material";
import axios from "axios";

const CreateMeasurandTableDialog = ({ open, onClose, onCreate }) => {
  const [newTable, setNewTable] = useState({
    plantId: "",
    measurandId: "",
    terminalIds: [],
  });
  const [plants, setPlants] = useState([]);
  const [measurands, setMeasurands] = useState([]);
  const [terminals, setTerminals] = useState([]);
  const [loading, setLoading] = useState(false);

  const API_BASE_URL = "http://localhost:6005/api/measurand";

  useEffect(() => {
    if (open) {
      setLoading(true);
      axios
        .get(`${API_BASE_URL}/plants`)
        .then((response) => {
          // Transform API response to match expected format
          const transformedPlants = response.data.map((plant) => ({
            plantId: plant.PlantId,
            plantName: plant.PlantName,
          }));
          setPlants(transformedPlants);
          setLoading(false);
        })
        .catch((error) => {
          console.error("Error fetching plants:", error);
          setLoading(false);
        });
    }
  }, [open]);

  useEffect(() => {
    if (newTable.plantId) {
      setLoading(true);
      axios
        .get(`${API_BASE_URL}/measurands/plant/${newTable.plantId}`)
        .then((response) => {
          // Assuming measurands API returns MeasurandId, MeasurandName
          const transformedMeasurands = response.data.map((measurand) => ({
            measurandId: measurand.MeasurandId,
            measurandName: measurand.MeasurandName,
          }));
          setMeasurands(transformedMeasurands);
          setLoading(false);
        })
        .catch((error) => {
          console.error("Error fetching measurands:", error);
          setLoading(false);
        });
    }
  }, [newTable.plantId]);

  useEffect(() => {
    if (newTable.plantId && newTable.measurandId) {
      setLoading(true);
      axios
        .get(
          `${API_BASE_URL}/terminals/plant/${newTable.plantId}/measurand/${newTable.measurandId}`
        )
        .then((response) => {
          // Assuming terminals API returns TerminalId, TerminalName
          const transformedTerminals = response.data.map((terminal) => ({
            terminalId: terminal.TerminalId,
            terminalName: terminal.TerminalName,
          }));
          setTerminals(transformedTerminals);
          setLoading(false);
        })
        .catch((error) => {
          console.error("Error fetching terminals:", error);
          setLoading(false);
        });
    }
  }, [newTable.plantId, newTable.measurandId]);

  const handleNewTableChange = (field) => (event) => {
    const value = event.target.value;
    setNewTable((prev) => ({
      ...prev,
      [field]: value,
      ...(field === "plantId" && { measurandId: "", terminalIds: [] }),
      ...(field === "measurandId" && { terminalIds: [] }),
    }));
  };

  const handleCreate = () => {
    if (
      !newTable.plantId ||
      !newTable.measurandId ||
      !newTable.terminalIds.length
    ) {
      onCreate({ error: "Please complete all table fields" });
      return;
    }

    const selectedPlant = plants.find((p) => p.plantId === newTable.plantId);
    const selectedMeasurand = measurands.find(
      (m) => m.measurandId === newTable.measurandId
    );
    const selectedTerminals = terminals.filter((t) =>
      newTable.terminalIds.includes(t.terminalId)
    );

    const tableData = {
      plantId: newTable.plantId,
      measurandId: newTable.measurandId,
      terminalIds: newTable.terminalIds,
      plantName: selectedPlant?.plantName || "",
      measurandName: selectedMeasurand?.measurandName || "",
      terminalNames: selectedTerminals.map((t) => t.terminalName),
    };

    axios
      .post(`${API_BASE_URL}-hdd/create`, tableData)
      .then((response) => {
        if (response.data.success) {
          onCreate(response.data.data);
          handleClose();
        } else {
          onCreate({ error: response.data.message });
        }
      })
      .catch((error) => {
        onCreate({ error: "Failed to create table" });
      });
  };

  const handleClose = () => {
    setNewTable({ plantId: "", measurandId: "", terminalIds: [] });
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Typography variant="h6">Create New HDD Measurand View</Typography>
        <Typography variant="body2" color="text.secondary">
          Configure table settings for HDD Measurand
        </Typography>
      </DialogTitle>

      <Divider />

      <DialogContent>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <FormControl fullWidth disabled={loading}>
              <InputLabel id="plant-label">Plant Name</InputLabel>
              <Select
                labelId="plant-label"
                value={newTable.plantId}
                label="Plant Name"
                onChange={handleNewTableChange("plantId")}
              >
                {plants.map((plant) => (
                  <MenuItem key={plant.plantId} value={plant.plantId}>
                    {plant.plantName}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12}>
            <FormControl fullWidth disabled={!newTable.plantId || loading}>
              <InputLabel id="measurand-label">Measurand Name</InputLabel>
              <Select
                labelId="measurand-label"
                value={newTable.measurandId}
                label="Measurand Name"
                onChange={handleNewTableChange("measurandId")}
              >
                {measurands.map((measurand) => (
                  <MenuItem
                    key={measurand.measurandId}
                    value={measurand.measurandId}
                  >
                    {measurand.measurandName}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12}>
            <FormControl
              fullWidth
              disabled={!newTable.plantId || !newTable.measurandId || loading}
            >
              <InputLabel id="terminal-label">Terminal Options</InputLabel>
              <Select
                labelId="terminal-label"
                multiple
                value={newTable.terminalIds}
                label="Terminal Options"
                onChange={handleNewTableChange("terminalIds")}
                renderValue={(selected) => (
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                    {selected.map((value) => (
                      <Chip
                        key={value}
                        label={
                          terminals.find((t) => t.terminalId === value)
                            ?.terminalName
                        }
                      />
                    ))}
                  </Box>
                )}
              >
                {terminals.map((terminal) => (
                  <MenuItem
                    key={terminal.terminalId}
                    value={terminal.terminalId}
                  >
                    <Checkbox
                      checked={newTable.terminalIds.includes(
                        terminal.terminalId
                      )}
                    />
                    <ListItemText primary={terminal.terminalName} />
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
            !newTable.measurandId ||
            !newTable.terminalIds.length ||
            loading
          }
        >
          Create Table
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreateMeasurandTableDialog;
