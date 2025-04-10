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
          setPlants(response.data);
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
          setMeasurands(response.data);
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
          setTerminals(response.data);
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
    onCreate(newTable);
    handleClose();
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
                  <MenuItem key={plant.PlantId} value={plant.PlantId}>
                    {plant.PlantName}
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
                    key={measurand.MeasurandId}
                    value={measurand.MeasurandId}
                  >
                    {measurand.MeasurandName}
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
                          terminals.find((t) => t.TerminalId === value)
                            ?.TerminalName
                        }
                      />
                    ))}
                  </Box>
                )}
              >
                {terminals.map((terminal) => (
                  <MenuItem
                    key={terminal.TerminalId}
                    value={terminal.TerminalId}
                  >
                    <Checkbox
                      checked={newTable.terminalIds.includes(
                        terminal.TerminalId
                      )}
                    />
                    <ListItemText primary={terminal.TerminalName} />
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
