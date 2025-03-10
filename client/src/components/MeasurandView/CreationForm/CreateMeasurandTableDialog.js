import React, { useState } from "react";
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

const CreateMeasurandTableDialog = ({ open, onClose, onCreate }) => {
  const [newTable, setNewTable] = useState({
    plantName: "",
    scriptName: "",
    terminalNames: [],
  });

  // Static data
  const plantOptions = ["Plant A", "Plant B", "Plant C"];
  const scriptOptions = {
    "Plant A": ["Script 1", "Script 2"],
    "Plant B": ["Script 3", "Script 4"],
    "Plant C": ["Script 5", "Script 6"],
  };
  const terminalOptions = {
    "Plant A": {
      "Script 1": ["Terminal 1A", "Terminal 1B"],
      "Script 2": ["Terminal 2A", "Terminal 2B"],
    },
    "Plant B": {
      "Script 3": ["Terminal 3A", "Terminal 3B"],
      "Script 4": ["Terminal 4A", "Terminal 4B"],
    },
    "Plant C": {
      "Script 5": ["Terminal 5A", "Terminal 5B"],
      "Script 6": ["Terminal 6A", "Terminal 6B"],
    },
  };

  const handleNewTableChange = (field) => (event) => {
    const value = event.target.value;
    setNewTable((prev) => ({
      ...prev,
      [field]: value,
      ...(field === "plantName" && { scriptName: "", terminalNames: [] }),
      ...(field === "scriptName" && { terminalNames: [] }),
    }));
  };

  const handleCreate = () => {
    if (
      !newTable.plantName ||
      !newTable.scriptName ||
      !newTable.terminalNames.length
    ) {
      onCreate({ error: "Please complete all table fields" });
      return;
    }
    onCreate(newTable);
    handleClose();
  };

  const handleClose = () => {
    setNewTable({ plantName: "", scriptName: "", terminalNames: [] });
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
            <FormControl fullWidth>
              <InputLabel id="plant-label">Plant Name</InputLabel>
              <Select
                labelId="plant-label"
                value={newTable.plantName}
                label="Plant Name"
                onChange={handleNewTableChange("plantName")}
              >
                {plantOptions.map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12}>
            <FormControl fullWidth disabled={!newTable.plantName}>
              <InputLabel id="script-label">Script Name</InputLabel>
              <Select
                labelId="script-label"
                value={newTable.scriptName}
                label="Script Name"
                onChange={handleNewTableChange("scriptName")}
              >
                {(scriptOptions[newTable.plantName] || []).map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12}>
            <FormControl
              fullWidth
              disabled={!newTable.plantName || !newTable.scriptName}
            >
              <InputLabel id="terminal-label">Terminal Options</InputLabel>
              <Select
                labelId="terminal-label"
                multiple
                value={newTable.terminalNames}
                label="Terminal Options"
                onChange={handleNewTableChange("terminalNames")}
                renderValue={(selected) => (
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                    {selected.map((value) => (
                      <Chip key={value} label={value} />
                    ))}
                  </Box>
                )}
              >
                {(terminalOptions[newTable.plantName]?.[newTable.scriptName] ||
                  []).map((option) => (
                  <MenuItem key={option} value={option}>
                    <Checkbox
                      checked={newTable.terminalNames.includes(option)}
                    />
                    <ListItemText primary={option} />
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
            !newTable.scriptName ||
            !newTable.terminalNames.length
          }
        >
          Create Table
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreateMeasurandTableDialog;