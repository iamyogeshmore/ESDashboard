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
  TextField,
  Button,
  FormControlLabel,
} from "@mui/material";

const CreateMeasurandWidgetDialog = ({
  open,
  onClose,
  onCreate,
  onOpenProperties,
}) => {
  const [newWidget, setNewWidget] = useState({
    plantName: "",
    scriptName: "",
    terminalName: "",
    widgetName: "",
    unit: "",
    decimalPlaces: "2",
    isGraph: false,
    graphType: "simple",
    xAxisRecords: "10",
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

  const handleNewWidgetChange = (field) => (event) => {
    const value =
      field === "isGraph" ? event.target.checked : event.target.value;
    setNewWidget((prev) => ({
      ...prev,
      [field]: value,
      ...(field === "plantName" && { scriptName: "", terminalName: "" }),
      ...(field === "scriptName" && { terminalName: "" }),
    }));
  };

  const handleCreate = () => {
    if (
      !newWidget.plantName ||
      !newWidget.scriptName ||
      !newWidget.terminalName ||
      !newWidget.widgetName
    ) {
      onCreate({ error: "Please complete all required fields" });
      return;
    }
    onCreate(newWidget);
    handleClose();
  };

  const handleClose = () => {
    setNewWidget({
      plantName: "",
      scriptName: "",
      terminalName: "",
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
      <DialogTitle>Create New Measurand Widget</DialogTitle>
      <DialogContent>
        <FormControl fullWidth sx={{ mt: 2 }}>
          <InputLabel>Plant</InputLabel>
          <Select
            value={newWidget.plantName}
            label="Plant"
            onChange={handleNewWidgetChange("plantName")}
          >
            {plantOptions.map((plant) => (
              <MenuItem key={plant} value={plant}>
                {plant}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl fullWidth sx={{ mt: 2 }}>
          <InputLabel>Script</InputLabel>
          <Select
            value={newWidget.scriptName}
            label="Script"
            onChange={handleNewWidgetChange("scriptName")}
            disabled={!newWidget.plantName}
          >
            {(scriptOptions[newWidget.plantName] || []).map((script) => (
              <MenuItem key={script} value={script}>
                {script}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl fullWidth sx={{ mt: 2 }}>
          <InputLabel>Terminal</InputLabel>
          <Select
            value={newWidget.terminalName}
            label="Terminal"
            onChange={handleNewWidgetChange("terminalName")}
            disabled={!newWidget.plantName || !newWidget.scriptName}
          >
            {(
              terminalOptions[newWidget.plantName]?.[newWidget.scriptName] || []
            ).map((terminal) => (
              <MenuItem key={terminal} value={terminal}>
                {terminal}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

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

        <TextField
          fullWidth
          margin="dense"
          label="Unit (optional)"
          value={newWidget.unit}
          onChange={handleNewWidgetChange("unit")}
          variant="outlined"
          sx={{ mt: 2 }}
        />

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

export default CreateMeasurandWidgetDialog;
