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
  TextField,
  Button,
  FormControlLabel,
} from "@mui/material";
import axios from "axios";

const CreateMeasurandWidgetDialog = ({
  open,
  onClose,
  onCreate,
  onOpenProperties,
}) => {
  const [newWidget, setNewWidget] = useState({
    plantName: "",
    terminalName: "",
    measurandName: "",
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
  const [loading, setLoading] = useState(false);

  const API_BASE_URL = "http://localhost:6005/api"; // Adjust based on your server config

  // Fetch all plants on component mount
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

  // Fetch terminals and measurands when plantName changes
  useEffect(() => {
    if (newWidget.plantName) {
      setLoading(true);
      Promise.all([
        axios.get(`${API_BASE_URL}/measurands/plant/${newWidget.plantName}`),
        axios.get(
          `${API_BASE_URL}/terminals/plant/${newWidget.plantName}/measurand/1`
        ), // Assuming measurandId=1 for simplicity
      ])
        .then(([measurandsRes, terminalsRes]) => {
          setMeasurands(measurandsRes.data);
          setTerminals(terminalsRes.data);
          setLoading(false);
        })
        .catch((error) => {
          console.error("Error fetching data:", error);
          setLoading(false);
        });
    }
  }, [newWidget.plantName]);

  const handleNewWidgetChange = (field) => (event) => {
    const value =
      field === "isGraph" ? event.target.checked : event.target.value;
    setNewWidget((prev) => ({
      ...prev,
      [field]: value,
      ...(field === "plantName" && { terminalName: "", measurandName: "" }),
      ...(field === "measurandName" && { terminalName: "" }),
    }));
  };

  const handleCreate = () => {
    if (
      !newWidget.plantName ||
      !newWidget.measurandName ||
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
      terminalName: "",
      measurandName: "",
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
        <FormControl fullWidth sx={{ mt: 2 }} disabled={loading}>
          <InputLabel>Plant</InputLabel>
          <Select
            value={newWidget.plantName}
            label="Plant"
            onChange={handleNewWidgetChange("plantName")}
          >
            {plants.map((plant) => (
              <MenuItem key={plant.PlantId} value={plant.PlantId}>
                {plant.PlantName}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl
          fullWidth
          sx={{ mt: 2 }}
          disabled={!newWidget.plantName || loading}
        >
          <InputLabel>Measurand</InputLabel>
          <Select
            value={newWidget.measurandName}
            label="Measurand"
            onChange={handleNewWidgetChange("measurandName")}
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

        <FormControl
          fullWidth
          sx={{ mt: 2 }}
          disabled={!newWidget.measurandName || loading}
        >
          <InputLabel>Terminal</InputLabel>
          <Select
            value={newWidget.terminalName}
            label="Terminal"
            onChange={handleNewWidgetChange("terminalName")}
          >
            {terminals.map((terminal) => (
              <MenuItem key={terminal.TerminalId} value={terminal.TerminalId}>
                {terminal.TerminalName}
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
        <Button onClick={handleCreate} variant="contained" disabled={loading}>
          Create
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreateMeasurandWidgetDialog;
