import React, { useState, useEffect } from "react";
import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  ListItemText,
  Button,
  FormControlLabel,
  Paper,
  Typography,
  Chip,
  Tooltip,
  IconButton,
  Snackbar,
  Alert,
  Slide,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import GridLayout from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import InfoIcon from "@mui/icons-material/Info";
import DeleteIcon from "@mui/icons-material/Delete";
import NumberWidget from "../../Widgets/NumberWidget";
import GraphWidget from "../../Widgets/GraphWidget";
import CreateMeasurandWidgetDialog from "../CreationForm/CreateMeasurandWidgetDialog";
import WidgetProperties from "../../WidgetProperties";
import DeleteConfirmationDialog from "../../DeleteConfirmationDialog";
import axios from "axios";

const CDDMeasurand = () => {
  const [plant, setPlant] = useState("");
  const [measurand, setMeasurand] = useState("");
  const [terminals, setTerminals] = useState([]);
  const [plants, setPlants] = useState([]);
  const [measurands, setMeasurands] = useState([]);
  const [terminalOptions, setTerminalOptions] = useState([]);
  const [showWidgets, setShowWidgets] = useState(false);
  const [layout, setLayout] = useState([]);
  const [showGraph, setShowGraph] = useState(false);
  const [savedViews, setSavedViews] = useState([]);
  const [selectedView, setSelectedView] = useState("");
  const [selectionInfo, setSelectionInfo] = useState(null);
  const [widgetDialogOpen, setWidgetDialogOpen] = useState(false);
  const [propertiesDialogOpen, setPropertiesDialogOpen] = useState(false);
  const [createdWidgets, setCreatedWidgets] = useState([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const [loading, setLoading] = useState(false);

  const API_BASE_URL = "http://localhost:6005/api/measurand";

  // Fetch plants on mount
  useEffect(() => {
    fetchPlants();
    fetchSavedViews();
  }, []);

  // Fetch plants
  const fetchPlants = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/plants`);
      setPlants(response.data);
    } catch (error) {
      console.error("Error fetching plants:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch measurands when plant changes
  useEffect(() => {
    if (plant) {
      setLoading(true);
      axios
        .get(`${API_BASE_URL}/measurands/plant/${plant}`)
        .then((response) => {
          setMeasurands(response.data);
          setLoading(false);
        })
        .catch((error) => {
          console.error("Error fetching measurands:", error);
          setLoading(false);
        });
    }
  }, [plant]);

  // Fetch terminals when plant and measurand change
  useEffect(() => {
    if (plant && measurand) {
      setLoading(true);
      axios
        .get(`${API_BASE_URL}/terminals/plant/${plant}/measurand/${measurand}`)
        .then((response) => {
          setTerminalOptions(response.data);
          setLoading(false);
        })
        .catch((error) => {
          console.error("Error fetching terminals:", error);
          setLoading(false);
        });
    }
  }, [plant, measurand]);

  // Fetch all saved views
  const fetchSavedViews = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/allmeasurandview`);
      setSavedViews(response.data.data);
    } catch (error) {
      console.error("Error fetching saved views:", error);
      setSnackbarMessage("Error fetching saved views");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    }
  };

  const allSelected =
    terminals.length === terminalOptions.length && terminalOptions.length > 0;

  const handleTerminalChange = (event) => {
    const value = event.target.value;
    if (value.includes("selectAll")) {
      setTerminals(allSelected ? [] : terminalOptions.map((t) => t.TerminalId));
    } else {
      setTerminals(value);
    }
  };

  const handleGoClick = () => {
    if (!plant || !measurand || !terminals.length) {
      setSnackbarMessage(
        "Please select a plant, measurand, and at least one terminal"
      );
      setSnackbarSeverity("warning");
      setSnackbarOpen(true);
      return;
    }

    setLoading(true);
    const newWidgets = terminals.map((terminalId, index) => {
      const terminal = terminalOptions.find((t) => t.TerminalId === terminalId);
      return {
        plantId: plant,
        measurandId: measurand,
        terminalId: terminalId,
        displayName: terminal.TerminalName,
        widgetType: showGraph ? "graph" : "number",
        decimalPlaces: 2,
        graphType: showGraph ? "area" : null,
        xAxisConfiguration: showGraph ? "time:timestamp" : null,
        refreshInterval: 10000,
        position: {
          x: (index % 3) * 4,
          y: Math.floor(index / 3) * 4,
          width: showGraph ? 6 : 4,
          height: showGraph ? 6 : 4,
        },
        i: `${terminal.TerminalName}${showGraph ? "-graph" : ""}`,
        value: null,
        timestamp: null,
      };
    });

    setCreatedWidgets(newWidgets);
    setLayout(
      newWidgets.map((w) => ({
        i: w.i,
        x: w.position.x,
        y: w.position.y,
        w: w.position.width,
        h: w.position.height,
        minW: showGraph ? 4 : 2,
        minH: showGraph ? 4 : 2,
        maxW: 12,
        maxH: 8,
      }))
    );
    setSelectionInfo({
      plantId: plant,
      measurandId: measurand,
      terminalIds: [...terminals],
      viewType: showGraph ? "Graph" : "Number",
      timestamp: new Date().toLocaleString(),
    });
    setShowWidgets(true);
    setSelectedView("");
    setLoading(false);
  };

  const onLayoutChange = (newLayout) => {
    const adjustedLayout = newLayout.map((item) => ({
      ...item,
      x: Math.min(item.x, 12 - item.w),
      y: Math.max(item.y, 0),
    }));
    setLayout(adjustedLayout);
    setCreatedWidgets((prev) =>
      prev.map((widget) => {
        const layoutItem = adjustedLayout.find((l) => l.i === widget.i);
        return layoutItem
          ? {
              ...widget,
              position: {
                x: layoutItem.x,
                y: layoutItem.y,
                width: layoutItem.w,
                height: layoutItem.h,
              },
            }
          : widget;
      })
    );
  };

  // Save a new view to the backend
  const handleSaveView = async () => {
    if (!plant || !measurand || !terminals.length || !createdWidgets.length) {
      setSnackbarMessage("Cannot save view: Missing required data");
      setSnackbarSeverity("warning");
      setSnackbarOpen(true);
      return;
    }

    const viewData = {
      plantId: plant,
      measurandId: measurand,
      terminalIds: terminals,
      plantName: plants.find((p) => p.PlantId === plant)?.PlantName || "",
      measurandName:
        measurands.find((m) => m.MeasurandId === measurand)?.MeasurandName ||
        "",
      terminalNames: terminals.map(
        (tId) =>
          terminalOptions.find((t) => t.TerminalId === tId)?.TerminalName || ""
      ),
    };

    try {
      const response = await axios.post(`${API_BASE_URL}/create`, viewData);
      setSavedViews((prev) => [...prev, response.data.data]);
      setSnackbarMessage("View saved successfully!");
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
    } catch (error) {
      console.error("Error saving view:", error);
      setSnackbarMessage("Error saving view");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    }
  };

  // Update an existing view
  const handleUpdateView = async () => {
    if (!selectedView || !createdWidgets.length) {
      setSnackbarMessage("Please select a view to update");
      setSnackbarSeverity("warning");
      setSnackbarOpen(true);
      return;
    }

    const viewToUpdate = savedViews.find((v) => v._id === selectedView);
    if (!viewToUpdate) return;

    const updatedViewData = {
      terminalIds: terminals,
      terminalNames: terminals.map(
        (tId) =>
          terminalOptions.find((t) => t.TerminalId === tId)?.TerminalName || ""
      ),
    };

    try {
      const response = await axios.put(
        `${API_BASE_URL}/${viewToUpdate._id}`,
        updatedViewData
      );
      setSavedViews((prev) =>
        prev.map((v) => (v._id === viewToUpdate._id ? response.data.data : v))
      );
      setSnackbarMessage("View updated successfully!");
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
    } catch (error) {
      console.error("Error updating view:", error);
      setSnackbarMessage("Error updating view");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    }
  };

  // Load a selected view
  const handleViewChange = (event) => {
    const viewId = event.target.value;
    setSelectedView(viewId);
    if (viewId) {
      const savedView = savedViews.find((v) => v._id === viewId);
      const newWidgets = savedView.terminalIds.map((terminalId, index) => {
        const terminalName =
          savedView.terminalNames[index] ||
          terminalOptions.find((t) => t.TerminalId === terminalId)
            ?.TerminalName ||
          `Terminal ${terminalId}`;
        return {
          plantId: savedView.plantId,
          measurandId: savedView.measurandId,
          terminalId: terminalId,
          displayName: terminalName,
          widgetType: showGraph ? "graph" : "number",
          decimalPlaces: 2,
          graphType: showGraph ? "area" : null,
          xAxisConfiguration: showGraph ? "time:timestamp" : null,
          refreshInterval: 10000,
          position: {
            x: (index % 3) * 4,
            y: Math.floor(index / 3) * 4,
            width: showGraph ? 6 : 4,
            height: showGraph ? 6 : 4,
          },
          i: `${terminalName}${showGraph ? "-graph" : ""}`,
          value: null,
          timestamp: null,
        };
      });

      setCreatedWidgets(newWidgets);
      setLayout(
        newWidgets.map((w) => ({
          i: w.i,
          x: w.position.x,
          y: w.position.y,
          w: w.position.width,
          h: w.position.height,
          minW: showGraph ? 4 : 2,
          minH: showGraph ? 4 : 2,
          maxW: 12,
          maxH: 8,
        }))
      );
      setTerminals(savedView.terminalIds);
      setPlant(savedView.plantId);
      setMeasurand(savedView.measurandId);
      setSelectionInfo({
        plantId: savedView.plantId,
        measurandId: savedView.measurandId,
        terminalIds: savedView.terminalIds,
        viewType: showGraph ? "Graph" : "Number",
        timestamp: new Date().toLocaleString(),
      });
      setShowWidgets(true);
    } else {
      setShowWidgets(false);
      setLayout([]);
      setCreatedWidgets([]);
      setSelectionInfo(null);
    }
  };

  // Delete a view
  const handleDeleteView = async () => {
    if (!selectedView) return;

    try {
      await axios.delete(`${API_BASE_URL}/${selectedView}`);
      setSavedViews((prev) => prev.filter((v) => v._id !== selectedView));
      setSelectedView("");
      setShowWidgets(false);
      setCreatedWidgets([]);
      setSelectionInfo(null);
      setSnackbarMessage("View deleted successfully");
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
      setDeleteDialogOpen(false);
    } catch (error) {
      console.error("Error deleting view:", error);
      setSnackbarMessage("Error deleting view");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    }
  };

  const handleDeleteClick = () => {
    if (!selectedView) return;
    setDeleteDialogOpen(true);
  };

  const handleAddWidget = () => {
    if (!plant || !measurand) {
      setSnackbarMessage("Please select a plant and measurand first");
      setSnackbarSeverity("warning");
      setSnackbarOpen(true);
      return;
    }
    setWidgetDialogOpen(true);
  };

  const handleCreateWidget = (widgetData) => {
    if (widgetData.error) {
      setSnackbarMessage(widgetData.error);
      setSnackbarSeverity("warning");
      setSnackbarOpen(true);
      return;
    }

    setLoading(true);
    const newWidget = {
      plantId: plant,
      measurandId: measurand,
      terminalId: widgetData.terminalName,
      displayName: widgetData.widgetName,
      widgetType: widgetData.isGraph ? "graph" : "number",
      decimalPlaces: parseInt(widgetData.decimalPlaces),
      graphType: widgetData.isGraph ? widgetData.graphType : null,
      xAxisConfiguration: widgetData.isGraph
        ? { type: "time", value: "timestamp" }
        : null,
      refreshInterval: 10000,
      position: {
        x: 0,
        y: layout.length ? Math.max(...layout.map((l) => l.y + l.h)) : 0,
        width: widgetData.isGraph ? 6 : 4,
        height: widgetData.isGraph ? 6 : 4,
      },
      i: `${widgetData.terminalName}${widgetData.isGraph ? "-graph" : ""}`,
      value: null,
      timestamp: null,
    };

    setCreatedWidgets((prev) => [...prev, newWidget]);
    setLayout((prev) => [
      ...prev,
      {
        i: newWidget.i,
        x: newWidget.position.x,
        y: newWidget.position.y,
        w: newWidget.position.width,
        h: newWidget.position.height,
        minW: widgetData.isGraph ? 4 : 2,
        minH: widgetData.isGraph ? 4 : 2,
        maxW: 12,
        maxH: 8,
      },
    ]);
    setShowWidgets(true);
    setSnackbarMessage("Widget created successfully!");
    setSnackbarSeverity("success");
    setSnackbarOpen(true);
    setWidgetDialogOpen(false);
    setLoading(false);
  };

  const handleOpenProperties = () => {
    setPropertiesDialogOpen(true);
  };

  const handleApplySettings = (settings) => {
    const lastWidget = layout[layout.length - 1];
    if (lastWidget) {
      setCreatedWidgets((prev) =>
        prev.map((w) =>
          w.i === lastWidget.i ? { ...w, properties: settings } : w
        )
      );
    }
    setPropertiesDialogOpen(false);
    setSnackbarMessage("Widget properties applied!");
    setSnackbarSeverity("success");
    setSnackbarOpen(true);
  };

  const TransitionSlide = (props) => <Slide {...props} direction="left" />;

  return (
    <Box>
      <Paper>
        <Box sx={{ display: "flex", gap: 2, p: 2 }}>
          <FormControl size="small" sx={{ minWidth: 200 }} disabled={loading}>
            <InputLabel>Plant</InputLabel>
            <Select
              value={plant}
              label="Plant"
              onChange={(e) => {
                setPlant(e.target.value);
                setMeasurand("");
                setTerminals([]);
              }}
            >
              {plants.map((p) => (
                <MenuItem key={p.PlantId} value={p.PlantId}>
                  {p.PlantName}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl
            size="small"
            sx={{ minWidth: 200 }}
            disabled={!plant || loading}
          >
            <InputLabel>Measurand</InputLabel>
            <Select
              value={measurand}
              label="Measurand"
              onChange={(e) => {
                setMeasurand(e.target.value);
                setTerminals([]);
              }}
            >
              {measurands.map((m) => (
                <MenuItem key={m.MeasurandId} value={m.MeasurandId}>
                  {m.MeasurandName}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl
            size="small"
            sx={{ minWidth: 200 }}
            disabled={!measurand || loading}
          >
            <InputLabel>Terminals</InputLabel>
            <Select
              multiple
              value={terminals}
              label="Terminals"
              onChange={handleTerminalChange}
              renderValue={(selected) => (
                <Box
                  sx={{
                    display: "flex",
                    flexWrap: "nowrap",
                    gap: 0.5,
                    overflow: "hidden",
                  }}
                >
                  <Typography noWrap>{selected.length} selected</Typography>
                </Box>
              )}
            >
              <MenuItem value="selectAll">
                <Checkbox checked={allSelected} />
                <ListItemText primary="Select All" />
              </MenuItem>
              {terminalOptions.map((t) => (
                <MenuItem key={t.TerminalId} value={t.TerminalId}>
                  <Checkbox checked={terminals.includes(t.TerminalId)} />
                  <ListItemText primary={t.TerminalName} />
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControlLabel
            control={
              <Checkbox
                checked={showGraph}
                onChange={(e) => setShowGraph(e.target.checked)}
              />
            }
            label="Graph"
            sx={{ flexShrink: 0 }}
          />
          <Button
            variant="contained"
            onClick={handleGoClick}
            sx={{ flexShrink: 0 }}
            disabled={loading}
          >
            Go
          </Button>
          <Button
            variant="contained"
            onClick={handleAddWidget}
            sx={{ flexShrink: 0, ml: 1 }}
            disabled={loading}
          >
            Add Widget
          </Button>
          {showWidgets && (
            <>
              <Button
                variant="outlined"
                onClick={handleSaveView}
                sx={{ flexShrink: 0, ml: 1 }}
                disabled={loading}
              >
                Save View
              </Button>
              <Button
                variant="outlined"
                onClick={handleUpdateView}
                sx={{ flexShrink: 0, ml: 1 }}
                disabled={loading || !selectedView}
              >
                Update View
              </Button>
            </>
          )}
          <FormControl size="small" sx={{ minWidth: 200 }} disabled={loading}>
            <InputLabel>Saved Views</InputLabel>
            <Select
              value={selectedView}
              label="Saved Views"
              onChange={handleViewChange}
            >
              <MenuItem value="">
                <em>None</em>
              </MenuItem>
              {savedViews.map((view) => (
                <MenuItem key={view._id} value={view._id}>
                  {view.plantName} - {view.measurandName} (
                  {view.terminalIds.length} terminals)
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          {selectedView && (
            <Tooltip title="Delete Selected View">
              <IconButton
                color="error"
                onClick={handleDeleteClick}
                sx={{ ml: 1, flexShrink: 0 }}
                disabled={loading}
              >
                <DeleteIcon />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      </Paper>

      {selectionInfo && (
        <Paper sx={{ p: 2, mb: 1, mt: 1 }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 4,
              flexWrap: "nowrap",
              overflowX: "auto",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <Typography variant="subtitle1" sx={{ fontWeight: "medium" }}>
                Plant:
              </Typography>
              <Typography variant="body1" sx={{ ml: 1 }}>
                {
                  plants.find((p) => p.PlantId === selectionInfo.plantId)
                    ?.PlantName
                }
              </Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <Typography variant="subtitle1" sx={{ fontWeight: "medium" }}>
                Measurand:
              </Typography>
              <Typography variant="body1" sx={{ ml: 1 }}>
                {
                  measurands.find(
                    (m) => m.MeasurandId === selectionInfo.measurandId
                  )?.MeasurandName
                }
              </Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <Typography variant="subtitle1" sx={{ fontWeight: "medium" }}>
                Type:
              </Typography>
              <Typography variant="body1" sx={{ ml: 1 }}>
                {selectionInfo.viewType} View
              </Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <Typography variant="subtitle1" sx={{ fontWeight: "medium" }}>
                Terminals:
              </Typography>
              <Chip
                label={`${selectionInfo.terminalIds.length} selected`}
                size="small"
                sx={{ ml: 1 }}
              />
              <Tooltip
                title={selectionInfo.terminalIds
                  .map(
                    (id) =>
                      terminalOptions.find((t) => t.TerminalId === id)
                        ?.TerminalName
                  )
                  .join(", ")}
              >
                <IconButton size="small">
                  <InfoIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
            <Typography variant="caption" color="text.secondary">
              Last updated: {selectionInfo.timestamp}
            </Typography>
          </Box>
        </Paper>
      )}

      {showWidgets ? (
        <Paper elevation={3}>
          <GridLayout
            className="layout"
            layout={layout}
            onLayoutChange={onLayoutChange}
            cols={12}
            rowHeight={30}
            width={window.innerWidth - 80}
            compactType="vertical"
            preventCollision={false}
            margin={[15, 15]}
            containerPadding={[10, 10]}
            draggableHandle=".widget-header"
          >
            {layout.map((item) => {
              const isGraph = item.i.includes("-graph");
              const widget = createdWidgets.find((w) => w.i === item.i);
              const fetchValue = async () => {
                const response = await axios.get(
                  `${API_BASE_URL}/measurements/${widget.plantId}/${widget.measurandId}/${widget.terminalId}`
                );
                const data = response.data.data[0]?.TerminalDetails[0] || {};
                return {
                  value: data.MeasurandValue ?? "N/A",
                  timestamp: data.TimeStamp ?? null,
                };
              };
              return (
                <div key={item.i}>
                  {isGraph ? (
                    <GraphWidget
                      title={widget.displayName}
                      widgetId={item.i}
                      terminalInfo={`${
                        plants.find((p) => p.PlantId === plant)?.PlantName
                      } - ${
                        measurands.find((m) => m.MeasurandId === measurand)
                          ?.MeasurandName
                      }`}
                      fetchValue={() => Promise.resolve([])} // Replace with actual graph data API if needed
                      onDelete={(id) => {
                        setLayout((prev) => prev.filter((l) => l.i !== id));
                        setCreatedWidgets((prev) =>
                          prev.filter((w) => w.i !== id)
                        );
                      }}
                      xAxisConfiguration={widget.xAxisConfiguration}
                    />
                  ) : (
                    <NumberWidget
                      title={widget.displayName}
                      widgetId={item.i}
                      terminalInfo={`${
                        plants.find((p) => p.PlantId === plant)?.PlantName
                      } - ${
                        measurands.find((m) => m.MeasurandId === measurand)
                          ?.MeasurandName
                      }`}
                      fetchValue={fetchValue}
                      decimalPlaces={widget.decimalPlaces}
                      refreshInterval={widget.refreshInterval}
                      onDelete={(id) => {
                        setLayout((prev) => prev.filter((l) => l.i !== id));
                        setCreatedWidgets((prev) =>
                          prev.filter((w) => w.i !== id)
                        );
                      }}
                    />
                  )}
                </div>
              );
            })}
          </GridLayout>
        </Paper>
      ) : (
        <Typography
          variant="h6"
          align="center"
          color="text.secondary"
          sx={{ mt: 4 }}
        >
          Select options and click "Go" or "Add Widget" to display widgets
        </Typography>
      )}

      <CreateMeasurandWidgetDialog
        open={widgetDialogOpen}
        onClose={() => setWidgetDialogOpen(false)}
        onCreate={handleCreateWidget}
        onOpenProperties={handleOpenProperties}
      />

      <Dialog
        open={propertiesDialogOpen}
        onClose={() => setPropertiesDialogOpen(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>Widget Properties</DialogTitle>
        <DialogContent>
          <WidgetProperties
            onApply={handleApplySettings}
            selectedWidget={createdWidgets[createdWidgets.length - 1]?.i}
            viewId={selectedView}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPropertiesDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      <DeleteConfirmationDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleDeleteView}
        title="Confirm View Deletion"
        message={`Are you sure you want to delete the selected view? This action cannot be undone.`}
      />

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
        sx={{ mt: 8 }}
        TransitionComponent={TransitionSlide}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity={snackbarSeverity}
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default CDDMeasurand;
