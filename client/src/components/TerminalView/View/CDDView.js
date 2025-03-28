"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import axios from "axios";
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Snackbar,
  Alert,
  Paper,
  Typography,
  Chip,
  Tooltip,
  IconButton,
  Slide,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import InfoIcon from "@mui/icons-material/Info";
import DeleteIcon from "@mui/icons-material/Delete";
import GridLayout from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import NumberWidget from "../../Widgets/NumberWidget";
import GraphWidget from "../../Widgets/GraphWidget";
import WidgetProperties from "../../WidgetProperties";
import CreateWidgetDialog from "../CreationForm/CreateWidgetDialog";
import DeleteConfirmationDialog from "../../DeleteConfirmationDialog";
import SaveIcon from "@mui/icons-material/Save";
import UpdateIcon from "@mui/icons-material/Update";
import { preserveWidgetTemplatesAndClear } from "../../localStorageUtils"; // Import utility

const BASE_URL = `${process.env.REACT_APP_API_LOCAL_URL}api`;

const DeleteAlert = styled(Alert)(({ theme }) => ({
  backgroundColor: theme.palette.error.main,
  color: theme.palette.error.contrastText,
  "& .MuiAlert-icon": {
    color: theme.palette.error.contrastText,
  },
}));

const CDDView = () => {
  const [plant, setPlant] = useState("");
  const [terminal, setTerminal] = useState("");
  const [measurands, setMeasurands] = useState([]);
  const [plants, setPlants] = useState([]);
  const [terminals, setTerminals] = useState([]);
  const [availableMeasurands, setAvailableMeasurands] = useState([]);
  const [showWidgets, setShowWidgets] = useState(false);
  const [layout, setLayout] = useState([]);
  const [showGraph, setShowGraph] = useState(false);
  const [savedViews, setSavedViews] = useState([]);
  const [selectedView, setSelectedView] = useState("");
  const [selectionInfo, setSelectionInfo] = useState(null);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [viewName, setViewName] = useState("");
  const [viewNameError, setViewNameError] = useState("");
  const [viewDescription, setViewDescription] = useState("");
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const [widgetDialogOpen, setWidgetDialogOpen] = useState(false);
  const [propertiesDialogOpen, setPropertiesDialogOpen] = useState(false);
  const [selectedWidgetId, setSelectedWidgetId] = useState(null);
  const [createdWidgets, setCreatedWidgets] = useState([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [graphData, setGraphData] = useState({});

  useEffect(() => {
    axios
      .get(`${BASE_URL}/plants`)
      .then((response) => setPlants(response.data))
      .catch((error) => console.error("Error fetching plants:", error));

    axios
      .get(`${BASE_URL}/saved-views`)
      .then((response) => setSavedViews(response.data))
      .catch((error) => console.error("Error fetching saved views:", error));
  }, []);

  useEffect(() => {
    if (plant) {
      axios
        .get(`${BASE_URL}/terminals/${plant}`)
        .then((response) =>
          setTerminals(
            response.data.map((t) => ({
              TerminalName: t.TerminalName,
              TerminalID: t.TerminalId,
            }))
          )
        )
        .catch((error) => console.error("Error fetching terminals:", error));
    } else {
      setTerminals([]);
      setAvailableMeasurands([]);
      setTerminal("");
      setMeasurands([]);
    }
  }, [plant]);

  useEffect(() => {
    if (plant && terminal) {
      axios
        .get(`${BASE_URL}/measurands/${plant}/${terminal}`)
        .then((response) => setAvailableMeasurands(response.data))
        .catch((error) => console.error("Error fetching measurands:", error));
    } else {
      setAvailableMeasurands([]);
      setMeasurands([]);
    }
  }, [plant, terminal]);

  const fetchGraphHistory = useCallback(
    async (measurandName) => {
      const terminalData = terminals.find((t) => t.TerminalName === terminal);
      const measurandData = availableMeasurands.find(
        (m) => m.MeasurandName === measurandName
      );
      if (!terminalData || !measurandData) return [];

      try {
        const response = await axios.get(
          `${BASE_URL}/hdd/historical/${terminalData.TerminalID}/${measurandData.MeasurandId}`
        );
        if (!response.data.success) throw new Error(response.data.message);
        return response.data.data.map((d) => ({
          value: d.MeasurandValue,
          timestamp: d.Timestamp,
        }));
      } catch (error) {
        console.error("Error fetching graph history:", error);
        return [];
      }
    },
    [terminal, terminals, availableMeasurands]
  );

  const fetchMeasurandValue = useCallback(
    async (measurandName, signal) => {
      try {
        const response = await axios.get(
          `${BASE_URL}/measurements/${plant}/${terminal}/${measurandName}`,
          { signal }
        );
        const data = response.data[0];
        return {
          value: data?.MeasurandValue ?? null,
          timestamp: data?.TimeStamp ?? null,
        };
      } catch (error) {
        if (!signal?.aborted) {
          console.error("Error fetching measurand value:", error);
        }
        return { value: null, timestamp: null };
      }
    },
    [plant, terminal]
  );

  useEffect(() => {
    console.log("CDDView mounted");
    return () => {
      console.log("CDDView unmounted");
      setShowWidgets(false);
      setCreatedWidgets([]);
      setGraphData({});
    };
  }, []);

  useEffect(() => {
    if (!showWidgets || !plant || !terminal || !createdWidgets.length) {
      setGraphData({});
      return;
    }

    let isMounted = true;
    const controller = new AbortController();

    const fetchAllGraphData = async () => {
      try {
        const graphWidgets = createdWidgets.filter(
          (w) => w.widgetType === "graph"
        );
        const newGraphData = {};

        await Promise.all(
          graphWidgets.map(async (widget) => {
            const data = await fetchGraphHistory(widget.measurandName);
            if (isMounted) newGraphData[widget.measurandName] = data;
          })
        );

        if (isMounted) setGraphData(newGraphData);
      } catch (error) {
        console.error("Error fetching graph data:", error);
      }
    };

    fetchAllGraphData();
    const interval = setInterval(fetchAllGraphData, 1000);

    return () => {
      isMounted = false;
      controller.abort();
      clearInterval(interval);
      console.log("Graph data fetch effect cleaned up");
    };
  }, [showWidgets, plant, terminal, createdWidgets, fetchGraphHistory]);

  useEffect(() => {
    if (
      !showWidgets ||
      showGraph ||
      !plant ||
      !terminal ||
      !createdWidgets.length
    ) {
      return;
    }

    let isMounted = true;
    const controller = new AbortController();

    const fetchAllMeasurandValues = async () => {
      try {
        const numberWidgets = createdWidgets.filter(
          (w) => w.widgetType === "number"
        );
        const updatedWidgets = await Promise.all(
          numberWidgets.map(async (widget) => {
            const data = await fetchMeasurandValue(
              widget.measurandName,
              controller.signal
            );
            return {
              ...widget,
              value: data?.value ?? null,
              timestamp: data?.timestamp ?? null,
            };
          })
        );

        if (isMounted) {
          setCreatedWidgets((prev) => {
            const currentNumberWidgets = prev.filter(
              (w) => w.widgetType === "number"
            );
            const hasChanges = updatedWidgets.some((updated, index) => {
              const current = currentNumberWidgets[index];
              return (
                updated.value !== current.value ||
                updated.timestamp !== current.timestamp
              );
            });
            if (!hasChanges) return prev;
            return [
              ...prev.filter((w) => w.widgetType !== "number"),
              ...updatedWidgets,
            ];
          });
        }
      } catch (error) {
        if (!controller.signal.aborted) {
          console.error("Error fetching measurand values:", error);
        }
      }
    };

    fetchAllMeasurandValues();
    const interval = setInterval(fetchAllMeasurandValues, 1000);

    return () => {
      isMounted = false;
      controller.abort();
      clearInterval(interval);
      console.log("Measurand value fetch effect cleaned up");
    };
  }, [
    showWidgets,
    showGraph,
    plant,
    terminal,
    createdWidgets,
    fetchMeasurandValue,
  ]);

  const numberWidgetPropsMap = useMemo(() => {
    return layout.reduce((acc, item) => {
      if (!item.i.includes("-graph")) {
        const title = item.i.split("-")[0];
        const widget = createdWidgets.find((w) => w.i === item.i);
        acc[item.i] = {
          title,
          widgetId: item.i,
          terminalInfo: `${plant} - ${terminal}`,
          fetchValue: () => fetchMeasurandValue(title),
          value: widget?.value,
          timestamp: widget?.timestamp,
          onDelete: (id) => {
            setLayout((prev) => prev.filter((l) => l.i !== id));
            setCreatedWidgets((prev) => prev.filter((w) => w.i !== id));
            setMeasurands((prev) => prev.filter((m) => m !== title));
          },
          onOpenProperties: () => handleOpenProperties(item.i),
          ...widget?.properties,
        };
      }
      return acc;
    }, {});
  }, [layout, createdWidgets, plant, terminal, fetchMeasurandValue]);

  const allSelected =
    measurands.length === availableMeasurands.length &&
    availableMeasurands.length > 0;

  const handleMeasurandChange = (event) => {
    const value = event.target.value;
    if (value.includes("selectAll")) {
      setMeasurands(
        allSelected ? [] : availableMeasurands.map((m) => m.MeasurandName)
      );
    } else {
      setMeasurands(value);
    }
  };

  const showSnackbar = (message, severity) => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(false);
    setTimeout(() => setSnackbarOpen(true), 100);
  };

  const handleGoClick = () => {
    if (!plant || !terminal || !measurands.length) {
      showSnackbar(
        "Please select a plant, terminal, and at least one measurand",
        "warning"
      );
      return;
    }

    const newWidgets = measurands.map((measurand, index) => {
      const measurandData = availableMeasurands.find(
        (m) => m.MeasurandName === measurand
      );
      const terminalData = terminals.find((t) => t.TerminalName === terminal);
      return {
        plantId: plants.find((p) => p.PlantName === plant).PlantId,
        plantName: plant,
        terminalId: terminalData?.TerminalID,
        terminalName: terminal,
        measurandId: measurandData.MeasurandId,
        measurandName: measurand,
        displayName: measurand,
        unit: "",
        widgetType: showGraph ? "graph" : "number",
        decimalPlaces: 2,
        graphType: showGraph ? "area" : null,
        xAxisConfiguration: showGraph ? "time:timestamp" : null,
        refreshInterval: 1000,
        properties: {},
        position: {
          x: (index % 6) * 2,
          y: Math.floor(index / 6) * 2,
          width: showGraph ? 4 : 2,
          height: showGraph ? 6 : 3,
        },
        i: `${measurand}${showGraph ? "-graph" : ""}`,
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
        minW: 1,
        minH: 3,
        maxW: 12,
        maxH: 8,
        resizeHandles: ["se"],
      }))
    );
    setSelectionInfo({
      terminalGroup: plant,
      terminal,
      mesrand: [...measurands],
      viewType: showGraph ? "Graph" : "Number",
      timestamp: new Date().toLocaleString(),
    });
    setShowWidgets(true);
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
        if (layoutItem) {
          return {
            ...widget,
            position: {
              x: layoutItem.x,
              y: layoutItem.y,
              width: layoutItem.w,
              height: layoutItem.h,
            },
          };
        }
        return widget;
      })
    );
  };

  const handleSaveView = () => {
    setSaveDialogOpen(true);
  };

  const validateViewName = (name) => {
    if (!name.trim()) return "View name cannot be empty";
    if (
      savedViews.some(
        (view) => view.name.toLowerCase() === name.trim().toLowerCase()
      )
    )
      return "A view with this name already exists";
    return "";
  };

  const handleViewNameChange = (e) => {
    const name = e.target.value;
    setViewName(name);
    setViewNameError(validateViewName(name));
  };

  const handleSaveViewConfirm = async () => {
    const nameError = validateViewName(viewName);
    if (nameError) {
      setViewNameError(nameError);
      showSnackbar(nameError, "error");
      return;
    }

    try {
      if (createdWidgets.length === 0) {
        showSnackbar("No widgets to save in this view", "warning");
        return;
      }

      const viewData = {
        name: viewName,
        description: viewDescription,
        widgets: createdWidgets.map((widget) => ({
          ...widget,
          position: {
            x: widget.position.x,
            y: widget.position.y,
            width: widget.position.width,
            height: widget.position.height,
          },
        })),
        plant,
        terminal,
      };

      const response = await axios.post(`${BASE_URL}/saved-views`, viewData);
      setSavedViews((prev) => [...prev, response.data]);
      preserveWidgetTemplatesAndClear(); // Clear except widget templates
      setSaveDialogOpen(false);
      setViewName("");
      setViewDescription("");
      setViewNameError("");
      showSnackbar("View saved successfully", "success");
    } catch (error) {
      console.error("Error saving view:", error.response?.data || error);
      showSnackbar(
        error.response?.data?.message || "Error saving view",
        "error"
      );
    }
  };

  const handleUpdateView = async () => {
    if (!selectedView) return;

    try {
      const viewData = {
        name: savedViews.find((v) => v._id === selectedView).name,
        description:
          viewDescription ||
          savedViews.find((v) => v._id === selectedView).description ||
          "",
        widgets: createdWidgets.map((widget) => ({
          ...widget,
          position: {
            x: widget.position.x,
            y: widget.position.y,
            width: widget.position.width,
            height: widget.position.height,
          },
        })),
        plant,
        terminal,
      };

      const response = await axios.put(
        `${BASE_URL}/saved-views/${selectedView}`,
        viewData
      );
      setSavedViews((prev) =>
        prev.map((v) => (v._id === selectedView ? response.data : v))
      );
      preserveWidgetTemplatesAndClear(); // Clear except widget templates
      showSnackbar("View updated successfully", "success");
    } catch (error) {
      console.error("Error updating view:", error.response?.data || error);
      showSnackbar(
        error.response?.data?.message || "Error updating view",
        "error"
      );
    }
  };

  const handleViewChange = async (event) => {
    const viewId = event.target.value;
    setSelectedView(viewId);

    if (viewId) {
      try {
        const response = await axios.get(`${BASE_URL}/saved-views/${viewId}`);
        const savedView = response.data;
        if (savedView) {
          setCreatedWidgets(savedView.widgets);
          setLayout(
            savedView.widgets.map((w) => ({
              i: `${w.measurandName}${
                w.widgetType === "graph" ? "-graph" : ""
              }`,
              x: w.position?.x ?? 0,
              y: w.position?.y ?? 0,
              w: w.position?.width ?? (w.widgetType === "graph" ? 2 : 2),
              h: w.position?.height ?? (w.widgetType === "graph" ? 2 : 2),
              minW: 2,
              minH: 2,
              maxW: 12,
              maxH: 8,
              resizeHandles: ["se"],
            }))
          );
          setMeasurands(savedView.widgets.map((w) => w.measurandName));
          setShowGraph(savedView.widgets.some((w) => w.widgetType === "graph"));
          setPlant(savedView.plant);
          setTerminal(savedView.terminal);
          setSelectionInfo({
            terminalGroup: savedView.plant,
            terminal: savedView.terminal,
            mesrand: savedView.widgets.map((w) => w.measurandName),
            viewType: savedView.widgets.some((w) => w.widgetType === "graph")
              ? "Graph"
              : "Number",
            timestamp: new Date(savedView.updatedAt).toLocaleString(),
          });
          setShowWidgets(true);
        }
      } catch (error) {
        console.error("Error loading saved view:", error);
        showSnackbar("Error loading saved view", "error");
      }
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

  const handleDeleteView = async () => {
    try {
      await axios.delete(`${BASE_URL}/saved-views/${selectedView}`);
      setSavedViews((prev) => prev.filter((v) => v._id !== selectedView));
      setSelectedView("");
      setShowWidgets(false);
      setCreatedWidgets([]);
      setSelectionInfo(null);
      preserveWidgetTemplatesAndClear(); // Clear except widget templates
      showSnackbar("View deleted successfully", "error");
    } catch (error) {
      console.error("Error deleting view:", error);
      showSnackbar("Error deleting view", "error");
    } finally {
      setDeleteDialogOpen(false);
    }
  };

  const handleDeleteDialogClose = () => {
    setDeleteDialogOpen(false);
  };

  const handleAddWidget = () => {
    if (!plant || !terminal) {
      showSnackbar("Please select a plant and terminal first", "warning");
      return;
    }
    setWidgetDialogOpen(true);
  };

  const handleCreateWidget = async (widgetData) => {
    if (widgetData.error) {
      showSnackbar(widgetData.error, "warning");
      return;
    }

    const terminalData = terminals.find((t) => t.TerminalName === terminal);
    const measurandData = availableMeasurands.find(
      (m) => m.MeasurandName === widgetData.mesrand
    );

    const newWidget = {
      plantId: plants.find((p) => p.PlantName === plant).PlantId,
      plantName: plant,
      terminalId: terminalData?.TerminalID,
      terminalName: terminal,
      measurandId: measurandData.MeasurandId,
      measurandName: widgetData.mesrand,
      displayName: widgetData.mesrand,
      unit: "",
      widgetType: widgetData.isGraph ? "graph" : "number",
      decimalPlaces: 2,
      graphType: widgetData.isGraph ? "area" : null,
      xAxisConfiguration: widgetData.isGraph
        ? { type: "time", value: "timestamp" }
        : null,
      refreshInterval: 1000,
      properties: {},
      position: {
        x: (layout.length % 6) * 2,
        y: Math.floor(layout.length / 6) * 2,
        width: widgetData.isGraph ? 4 : 2,
        height: widgetData.isGraph ? 6 : 3,
      },
      i: `${widgetData.mesrand}${widgetData.isGraph ? "-graph" : ""}`,
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
        minW: 2,
        minH: 2,
        maxW: 12,
        maxH: 8,
        resizeHandles: ["se"],
      },
    ]);
    setMeasurands((prev) => [...prev, widgetData.mesrand]);
    setShowWidgets(true);
    showSnackbar("Widget created successfully!", "success");
    setWidgetDialogOpen(false);
  };

  const handleOpenProperties = (widgetId) => {
    setSelectedWidgetId(widgetId);
    setPropertiesDialogOpen(true);
  };

  const handleCloseProperties = () => {
    setPropertiesDialogOpen(false);
    setSelectedWidgetId(null);
  };

  const handleApplySettings = (settings, applyToAll) => {
    setCreatedWidgets((prev) => {
      const updatedWidgets = applyToAll
        ? prev.map((w) => ({
            ...w,
            properties: { ...w.properties, ...settings },
          }))
        : prev.map((w) =>
            w.i === selectedWidgetId
              ? { ...w, properties: { ...w.properties, ...settings } }
              : w
          );

      updatedWidgets.forEach((w) => {
        if (applyToAll || w.i === selectedWidgetId) {
          localStorage.setItem(
            `widgetSettings_${w.i}`,
            JSON.stringify(w.properties)
          );
        }
      });

      return updatedWidgets;
    });

    showSnackbar(
      applyToAll
        ? "Properties applied to all widgets successfully!"
        : "Widget properties updated successfully!",
      "success"
    );
    setPropertiesDialogOpen(false);
    setSelectedWidgetId(null);
  };

  const TransitionSlide = (props) => <Slide {...props} direction="left" />;

  return (
    <Box sx={{ width: "100%" }}>
      <Paper sx={{ p: 2 }}>
        <Box sx={{ display: "flex", gap: 2 }}>
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel>Plant</InputLabel>
            <Select
              value={plant}
              label="Plant"
              onChange={(e) => setPlant(e.target.value)}
            >
              {plants.map((p) => (
                <MenuItem key={p.PlantId} value={p.PlantName}>
                  {p.PlantName}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel>Terminal</InputLabel>
            <Select
              value={terminal}
              label="Terminal"
              onChange={(e) => setTerminal(e.target.value)}
              disabled={!plant}
            >
              {terminals.map((t) => (
                <MenuItem key={t.TerminalID} value={t.TerminalName}>
                  {t.TerminalName}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel>Measurand</InputLabel>
            <Select
              multiple
              value={measurands}
              label="Measurand"
              onChange={handleMeasurandChange}
              disabled={!terminal}
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
              {availableMeasurands.map((m) => (
                <MenuItem key={m.MeasurandId} value={m.MeasurandName}>
                  <Checkbox checked={measurands.includes(m.MeasurandName)} />
                  <ListItemText primary={m.MeasurandName} />
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
                <MenuItem key={view._id} value={view._id}>
                  {view.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          {showWidgets && (
            <Tooltip title="Save View">
              <IconButton
                variant="outlined"
                onClick={handleSaveView}
                color="primary"
              >
                <SaveIcon />
              </IconButton>
            </Tooltip>
          )}
          {showWidgets && selectedView && (
            <Tooltip title="Update View">
              <IconButton
                variant="outlined"
                onClick={handleUpdateView}
                color="primary"
              >
                <UpdateIcon />
              </IconButton>
            </Tooltip>
          )}
          {selectedView && (
            <Tooltip title="Delete Selected View">
              <IconButton color="error" onClick={handleDeleteClick}>
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
                {selectionInfo.terminalGroup}
              </Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <Typography variant="subtitle1" sx={{ fontWeight: "medium" }}>
                Terminal:
              </Typography>
              <Typography variant="body1" sx={{ ml: 1 }}>
                {selectionInfo.terminal}
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
                Metrics:
              </Typography>
              <Chip
                label={`${selectionInfo.mesrand.length} selected`}
                size="small"
                sx={{ ml: 1 }}
              />
              <Tooltip title={selectionInfo.mesrand.join(", ")}>
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
              return (
                <div key={item.i}>
                  {isGraph ? (
                    <GraphWidget
                      title={title}
                      widgetId={item.i}
                      terminalInfo={`${plant} - ${terminal}`}
                      fetchValue={fetchGraphHistory}
                      onDelete={(id) => {
                        setLayout((prev) => prev.filter((l) => l.i !== id));
                        setCreatedWidgets((prev) =>
                          prev.filter((w) => w.i !== id)
                        );
                        setMeasurands((prev) =>
                          prev.filter((m) => m !== title)
                        );
                      }}
                      availableMeasurands={availableMeasurands.map((m) => ({
                        MeasurandName: m.MeasurandName,
                        MeasurandId: m.MeasurandId,
                      }))}
                      onOpenProperties={() => handleOpenProperties(item.i)}
                    />
                  ) : (
                    <NumberWidget {...numberWidgetPropsMap[item.i]} />
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

      <Dialog open={saveDialogOpen} onClose={() => setSaveDialogOpen(false)}>
        <DialogTitle>Save View</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="View Name"
            fullWidth
            value={viewName}
            onChange={handleViewNameChange}
            variant="outlined"
            required
            error={!!viewNameError}
            helperText={viewNameError}
          />
          <TextField
            margin="dense"
            label="Description (optional)"
            fullWidth
            value={viewDescription}
            onChange={(e) => setViewDescription(e.target.value)}
            variant="outlined"
            multiline
            rows={2}
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setSaveDialogOpen(false);
              setViewName("");
              setViewNameError("");
              setViewDescription("");
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSaveViewConfirm}
            variant="contained"
            disabled={!!viewNameError}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>

      <CreateWidgetDialog
        open={widgetDialogOpen}
        onClose={() => setWidgetDialogOpen(false)}
        onCreate={handleCreateWidget}
        onOpenProperties={handleOpenProperties}
        availableMeasurands={availableMeasurands}
      />

      <Dialog
        open={propertiesDialogOpen}
        onClose={handleCloseProperties}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>Widget Properties</DialogTitle>
        <DialogContent>
          <WidgetProperties
            onApply={handleApplySettings}
            selectedWidget={selectedWidgetId}
            viewId={selectedView}
            onClose={handleCloseProperties}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseProperties}>Close</Button>
        </DialogActions>
      </Dialog>

      <DeleteConfirmationDialog
        open={deleteDialogOpen}
        onClose={handleDeleteDialogClose}
        onConfirm={handleDeleteView}
        title="Confirm View Deletion"
        message={
          selectedView
            ? `Are you sure you want to delete the view "${
                savedViews.find((v) => v._id === selectedView)?.name
              }"? This action cannot be undone.`
            : "Are you sure you want to delete this view? This action cannot be undone."
        }
      />

      <Snackbar
        key={snackbarMessage}
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
        sx={{ mt: 8 }}
        TransitionComponent={TransitionSlide}
      >
        {snackbarMessage === "View deleted successfully" ? (
          <DeleteAlert
            onClose={() => setSnackbarOpen(false)}
            severity="error"
            sx={{ width: "100%" }}
          >
            {snackbarMessage}
          </DeleteAlert>
        ) : (
          <Alert
            onClose={() => setSnackbarOpen(false)}
            severity={snackbarSeverity}
            sx={{ width: "100%" }}
          >
            {snackbarMessage}
          </Alert>
        )}
      </Snackbar>
    </Box>
  );
};

export default CDDView;
