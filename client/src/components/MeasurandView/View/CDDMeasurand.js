import React, { useState } from "react";
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

const CDDMeasurand = () => {
  const [plant, setPlant] = useState("");
  const [script, setScript] = useState("");
  const [terminals, setTerminals] = useState([]);
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

  // Static widget data
  const staticWidgetData = {
    "Terminal 1A": { value: 42, timestamp: "2025-03-07 10:00" },
    "Terminal 1B": { value: 58, timestamp: "2025-03-07 10:01" },
    "Terminal 2A": { value: 75, timestamp: "2025-03-07 10:02" },
    "Terminal 2B": { value: 19, timestamp: "2025-03-07 10:03" },
    "Terminal 3A": { value: 33, timestamp: "2025-03-07 10:04" },
    "Terminal 3B": { value: 88, timestamp: "2025-03-07 10:05" },
    "Terminal 4A": { value: 62, timestamp: "2025-03-07 10:06" },
    "Terminal 4B": { value: 47, timestamp: "2025-03-07 10:07" },
    "Terminal 5A": { value: 91, timestamp: "2025-03-07 10:08" },
    "Terminal 5B": { value: 25, timestamp: "2025-03-07 10:09" },
    "Terminal 6A": { value: 70, timestamp: "2025-03-07 10:10" },
    "Terminal 6B": { value: 36, timestamp: "2025-03-07 10:11" },
  };

  const staticGraphData = {
    "Terminal 1A": [
      { value: 40, timestamp: "2025-03-07 09:50" },
      { value: 42, timestamp: "2025-03-07 10:00" },
    ],
    "Terminal 1B": [
      { value: 55, timestamp: "2025-03-07 09:51" },
      { value: 58, timestamp: "2025-03-07 10:01" },
    ],
    // Add more as needed
  };

  const allSelected =
    terminals.length === terminalOptions[plant]?.[script]?.length &&
    terminalOptions[plant]?.[script]?.length > 0;

  const handleTerminalChange = (event) => {
    const value = event.target.value;
    if (value.includes("selectAll")) {
      setTerminals(allSelected ? [] : terminalOptions[plant][script]);
    } else {
      setTerminals(value);
    }
  };

  const handleGoClick = () => {
    if (!plant || !script || !terminals.length) {
      setSnackbarMessage(
        "Please select a plant, script, and at least one terminal"
      );
      setSnackbarSeverity("warning");
      setSnackbarOpen(true);
      return;
    }

    const newWidgets = terminals.map((terminal, index) => ({
      plantName: plant,
      scriptName: script,
      terminalName: terminal,
      displayName: terminal,
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
      i: `${terminal}${showGraph ? "-graph" : ""}`,
      value: staticWidgetData[terminal]?.value || null,
      timestamp: staticWidgetData[terminal]?.timestamp || null,
    }));

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
      plantName: plant,
      scriptName: script,
      terminalNames: [...terminals],
      viewType: showGraph ? "Graph" : "Number",
      timestamp: new Date().toLocaleString(),
    });
    setShowWidgets(true);
    setSelectedView("");
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

  const handleSaveView = () => {
    const viewData = {
      name: `View-${Date.now()}`,
      plant,
      script,
      terminals,
      widgets: createdWidgets,
    };
    setSavedViews((prev) => [...prev, viewData]);
    setSnackbarMessage("View saved successfully!");
    setSnackbarSeverity("success");
    setSnackbarOpen(true);
  };

  const handleViewChange = (event) => {
    const viewName = event.target.value;
    setSelectedView(viewName);
    if (viewName) {
      const savedView = savedViews.find((v) => v.name === viewName);
      setCreatedWidgets(savedView.widgets);
      setLayout(
        savedView.widgets.map((w) => ({
          i: w.i,
          x: w.position.x,
          y: w.position.y,
          w: w.position.width,
          h: w.position.height,
          minW: w.widgetType === "graph" ? 4 : 2,
          minH: w.widgetType === "graph" ? 4 : 2,
          maxW: 12,
          maxH: 8,
        }))
      );
      setTerminals(savedView.terminals);
      setShowGraph(savedView.widgets.some((w) => w.widgetType === "graph"));
      setPlant(savedView.plant);
      setScript(savedView.script);
      setSelectionInfo({
        plantName: savedView.plant,
        scriptName: savedView.script,
        terminalNames: savedView.terminals,
        viewType: savedView.widgets.some((w) => w.widgetType === "graph")
          ? "Graph"
          : "Number",
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

  const handleDeleteClick = () => {
    if (!selectedView) return;
    setDeleteDialogOpen(true);
  };

  const handleDeleteView = () => {
    setSavedViews((prev) => prev.filter((v) => v.name !== selectedView));
    setSelectedView("");
    setShowWidgets(false);
    setCreatedWidgets([]);
    setSelectionInfo(null);
    setSnackbarMessage("View deleted successfully");
    setSnackbarSeverity("error");
    setSnackbarOpen(true);
    setDeleteDialogOpen(false);
  };

  const handleAddWidget = () => {
    if (!plant || !script) {
      setSnackbarMessage("Please select a plant and script first");
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

    const newWidget = {
      plantName: plant,
      scriptName: script,
      terminalName: widgetData.terminalName,
      displayName: widgetData.terminalName,
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
      value: staticWidgetData[widgetData.terminalName]?.value || null,
      timestamp: staticWidgetData[widgetData.terminalName]?.timestamp || null,
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
    <Box sx={{ width: "100%", p: 2 }}>
      <Paper sx={{ p: 2 }}>
        <Box sx={{ display: "flex", gap: 2 }}>
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel>Plant</InputLabel>
            <Select
              value={plant}
              label="Plant"
              onChange={(e) => {
                setPlant(e.target.value);
                setScript("");
                setTerminals([]);
              }}
            >
              {plantOptions.map((p) => (
                <MenuItem key={p} value={p}>
                  {p}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel>Script</InputLabel>
            <Select
              value={script}
              label="Script"
              onChange={(e) => {
                setScript(e.target.value);
                setTerminals([]);
              }}
              disabled={!plant}
            >
              {(scriptOptions[plant] || []).map((s) => (
                <MenuItem key={s} value={s}>
                  {s}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel>Terminals</InputLabel>
            <Select
              multiple
              value={terminals}
              label="Terminals"
              onChange={handleTerminalChange}
              disabled={!script}
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
              {(terminalOptions[plant]?.[script] || []).map((t) => (
                <MenuItem key={t} value={t}>
                  <Checkbox checked={terminals.includes(t)} />
                  <ListItemText primary={t} />
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
          >
            Go
          </Button>
          <Button
            variant="contained"
            onClick={handleAddWidget}
            sx={{ flexShrink: 0, ml: 1 }}
          >
            Add Widget
          </Button>
          {showWidgets && (
            <Button
              variant="outlined"
              onClick={handleSaveView}
              sx={{ flexShrink: 0, ml: 1 }}
            >
              Save View
            </Button>
          )}
          <FormControl size="small" sx={{ minWidth: 200 }}>
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
                <MenuItem key={view.name} value={view.name}>
                  {view.name}
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
                {selectionInfo.plantName}
              </Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <Typography variant="subtitle1" sx={{ fontWeight: "medium" }}>
                Script:
              </Typography>
              <Typography variant="body1" sx={{ ml: 1 }}>
                {selectionInfo.scriptName}
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
                label={`${selectionInfo.terminalNames.length} selected`}
                size="small"
                sx={{ ml: 1 }}
              />
              <Tooltip title={selectionInfo.terminalNames.join(", ")}>
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
        <Paper elevation={3} sx={{ p: 2 }}>
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
              const title = item.i.split("-")[0];
              const widget = createdWidgets.find((w) => w.i === item.i);
              return (
                <div key={item.i}>
                  {isGraph ? (
                    <GraphWidget
                      title={title}
                      widgetId={item.i}
                      terminalInfo={`${plant} - ${script}`}
                      fetchValue={() =>
                        Promise.resolve(staticGraphData[title] || [])
                      }
                      onDelete={(id) => {
                        setLayout((prev) => prev.filter((l) => l.i !== id));
                        setCreatedWidgets((prev) =>
                          prev.filter((w) => w.i !== id)
                        );
                      }}
                    />
                  ) : (
                    <NumberWidget
                      title={title}
                      widgetId={item.i}
                      terminalInfo={`${plant} - ${script}`}
                      fetchValue={() =>
                        Promise.resolve(
                          staticWidgetData[title] || {
                            value: null,
                            timestamp: null,
                          }
                        )
                      }
                      value={widget?.value}
                      timestamp={widget?.timestamp}
                      onDelete={(id) => {
                        setLayout((prev) => prev.filter((l) => l.i !== id));
                        setCreatedWidgets((prev) =>
                          prev.filter((w) => w.i !== id)
                        );
                      }}
                      {...(widget?.properties || {})}
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
        message={`Are you sure you want to delete the view "${selectedView}"? This action cannot be undone.`}
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
