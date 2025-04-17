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
import CreateWidgetDialog from "../CreationForm/CreateMeasurandWidgetDialog";
import DeleteConfirmationDialog from "../../DeleteConfirmationDialog";
import SaveIcon from "@mui/icons-material/Save";
import UpdateIcon from "@mui/icons-material/Update";
import { preserveWidgetTemplatesAndClear } from "../../localStorageUtils";

const BASE_URL = `${process.env.REACT_APP_API_LOCAL_URL}api/measurand`;

const DeleteAlert = styled(Alert)(({ theme }) => ({
  backgroundColor: theme.palette.error.main,
  color: theme.palette.error.contrastText,
  "& .MuiAlert-icon": {
    color: theme.palette.error.contrastText,
  },
}));

const CDDMeasurand = () => {
  const [plant, setPlant] = useState("");
  const [measurand, setMeasurand] = useState("");
  const [selectedTerminals, setSelectedTerminals] = useState([]);
  const [plants, setPlants] = useState([]);
  const [measurands, setMeasurands] = useState([]);
  const [availableTerminals, setAvailableTerminals] = useState([]);
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
  const [measurementData, setMeasurementData] = useState({});

  useEffect(() => {
    axios
      .get(`${BASE_URL}/plants`)
      .then((response) => {
        console.log("Fetched plants:", response.data);
        setPlants(response.data);
      })
      .catch((error) => console.error("Error fetching plants:", error));

    axios
      .get(`${BASE_URL}/saved-measurand-views`)
      .then((response) => {
        console.log("Fetched saved views:", response.data);
        setSavedViews(response.data);
      })
      .catch((error) => console.error("Error fetching saved views:", error));
  }, []);

  useEffect(() => {
    if (plant) {
      axios
        .get(`${BASE_URL}/measurands/plant/${plant}`)
        .then((response) => {
          console.log(`Fetched measurands for plant ${plant}:`, response.data);
          setMeasurands(response.data);
        })
        .catch((error) => console.error("Error fetching measurands:", error));
    } else {
      setMeasurands([]);
      setMeasurand("");
      setAvailableTerminals([]);
      setSelectedTerminals([]);
    }
  }, [plant]);

  useEffect(() => {
    if (plant && measurand) {
      axios
        .get(`${BASE_URL}/terminals/plant/${plant}/measurand/${measurand}`)
        .then((response) => {
          console.log(
            `Fetched terminals for plant ${plant}, measurand ${measurand}:`,
            response.data
          );
          setAvailableTerminals(response.data);
        })
        .catch((error) => console.error("Error fetching terminals:", error));
    } else {
      setAvailableTerminals([]);
    }
  }, [plant, measurand]);

  // Sync selectedTerminals with availableTerminals
  useEffect(() => {
    if (availableTerminals.length && createdWidgets.length) {
      const widgetTerminalIds = createdWidgets.map((w) => w.terminalId);
      const validTerminals = widgetTerminalIds.filter((id) =>
        availableTerminals.some((t) => t.TerminalId === id)
      );
      if (
        validTerminals.length !== selectedTerminals.length ||
        !validTerminals.every((id, i) => id === selectedTerminals[i])
      ) {
        console.log("Syncing selectedTerminals:", validTerminals);
        setSelectedTerminals(validTerminals);
      }
    }
  }, [availableTerminals, createdWidgets]);

  const handleTerminalChange = (event) => {
    const value = event.target.value;
    if (value.includes("selectAll")) {
      setSelectedTerminals(
        selectedTerminals.length === availableTerminals.length
          ? []
          : availableTerminals.map((t) => t.TerminalId)
      );
    } else {
      setSelectedTerminals(value);
      console.log("Updated selectedTerminals:", value);
    }
  };

  const fetchMeasurementData = useCallback(
    async (terminalId, signal) => {
      if (!plant || !measurand || !terminalId) {
        console.warn("Missing data for fetchMeasurementData:", {
          plant,
          measurand,
          terminalId,
        });
        return { value: null, timestamp: null, unit: "", terminalId };
      }

      try {
        const plantData = plants.find((p) => p.PlantId === plant);
        const measurandData = measurands.find(
          (m) => m.MeasurandId === measurand
        );
        const terminalData = availableTerminals.find(
          (t) => t.TerminalId === terminalId
        );

        if (!plantData || !measurandData || !terminalData) {
          console.warn("Validation data missing, proceeding with API call:", {
            plantData,
            measurandData,
            terminalData,
          });
        }

        const response = await axios.get(
          `${BASE_URL}/measurements/${plant}/${measurand}/${terminalId}`,
          { signal }
        );

        const data = response.data[0]?.TerminalDetails[0] || {};
        const terminalName =
          data.TerminalName || terminalData?.TerminalName || "Unknown Terminal";
        console.log(`Fetched data for terminal ${terminalId}:`, {
          value: data.MeasurandValue,
          timestamp: data.TimeStamp,
          terminalName,
          unit: data.Unit,
        });

        return {
          value: data.MeasurandValue ?? null,
          timestamp: data.TimeStamp ?? null,
          unit: data.Unit ?? "",
          terminalId: terminalId,
          terminalName,
        };
      } catch (error) {
        if (!signal?.aborted) {
          console.error(
            `Error fetching measurement data for terminal ${terminalId}:`,
            error
          );
        }
        return { value: null, timestamp: null, unit: "", terminalId };
      }
    },
    [plant, measurand, plants, measurands, availableTerminals]
  );

  useEffect(() => {
    console.log("CDDMeasurand mounted");
    return () => {
      console.log("CDDMeasurand unmounted");
      setShowWidgets(false);
      setCreatedWidgets([]);
      setMeasurementData({});
    };
  }, []);

  useEffect(() => {
    if (
      !showWidgets ||
      !plant ||
      !measurand ||
      !selectedTerminals.length ||
      !createdWidgets.length
    ) {
      setMeasurementData({});
      console.log("Polling skipped due to missing state:", {
        showWidgets,
        plant,
        measurand,
        selectedTerminals,
        createdWidgets,
      });
      return;
    }

    let isMounted = true;
    const controller = new AbortController();

    const fetchAllMeasurementData = async () => {
      console.log("Polling measurement data for terminals:", selectedTerminals);
      try {
        // Refetch missing state if necessary
        if (!plants.length) {
          const plantsRes = await axios.get(`${BASE_URL}/plants`);
          if (isMounted) setPlants(plantsRes.data);
        }
        if (!measurands.length && plant) {
          const measurandsRes = await axios.get(
            `${BASE_URL}/measurands/plant/${plant}`
          );
          if (isMounted) setMeasurands(measurandsRes.data);
        }
        if (!availableTerminals.length && plant && measurand) {
          const terminalsRes = await axios.get(
            `${BASE_URL}/terminals/plant/${plant}/measurand/${measurand}`
          );
          if (isMounted) setAvailableTerminals(terminalsRes.data);
        }

        const updatedWidgets = await Promise.all(
          createdWidgets.map(async (widget) => {
            if (!widget.terminalId || !widget.measurandId || !widget.plantId) {
              console.warn("Invalid widget data:", widget);
              return widget;
            }
            const data = await fetchMeasurementData(
              widget.terminalId,
              controller.signal
            );
            return {
              ...widget,
              value: data?.value ?? null,
              timestamp: data?.timestamp ?? null,
              unit: data?.unit ?? widget.unit,
              terminalName: widget.terminalName, // Preserve saved terminalName
            };
          })
        );

        if (isMounted) {
          setCreatedWidgets((prev) => {
            const hasChanges = updatedWidgets.some((updated, index) => {
              const current = prev[index];
              return (
                updated.value !== current.value ||
                updated.timestamp !== current.timestamp ||
                updated.unit !== current.unit
              );
            });
            if (hasChanges) {
              console.log("Updating widgets with new data:", updatedWidgets);
              return updatedWidgets;
            }
            return prev;
          });
          setMeasurementData(
            updatedWidgets.reduce(
              (acc, widget) => ({
                ...acc,
                [`${measurand}_${widget.terminalId}`]: widget,
              }),
              {}
            )
          );
        }
      } catch (error) {
        if (!controller.signal.aborted) {
          console.error("Error in fetchAllMeasurementData:", error);
        }
      }
    };

    fetchAllMeasurementData();
    const interval = setInterval(fetchAllMeasurementData, 5000);

    return () => {
      isMounted = false;
      controller.abort();
      clearInterval(interval);
      console.log("Measurement data fetch effect cleaned up");
    };
  }, [
    showWidgets,
    plant,
    measurand,
    selectedTerminals,
    createdWidgets,
    fetchMeasurementData,
  ]);

  const numberWidgetPropsMap = useMemo(() => {
    return layout.reduce((acc, item) => {
      const widget = createdWidgets.find((w) => w.i === item.i);
      if (widget) {
        acc[item.i] = {
          title: widget.terminalName,
          widgetId: item.i,
          terminalName: widget.terminalName,
          measurandName: widget.measurandName,
          fetchValue: () => fetchMeasurementData(widget.terminalId),
          value: widget.value,
          timestamp: widget.timestamp,
          unit: widget.unit,
          onDelete: (id) => {
            setLayout((prev) => prev.filter((l) => l.i !== id));
            setCreatedWidgets((prev) => prev.filter((w) => w.i !== id));
            setSelectedTerminals((prev) =>
              prev.filter((t) => t !== widget.terminalId)
            );
            console.log(
              `Deleted widget ${id}, updated selectedTerminals:`,
              selectedTerminals
            );
          },
          onOpenProperties: () => handleOpenProperties(item.i),
          ...widget.properties,
        };
      }
      return acc;
    }, {});
  }, [layout, createdWidgets, fetchMeasurementData, selectedTerminals]);

  const showSnackbar = (message, severity) => {
    if (message !== snackbarMessage || severity !== snackbarSeverity) {
      setSnackbarMessage(message);
      setSnackbarSeverity(severity);
      setSnackbarOpen(true);
    }
  };

  const handleGoClick = () => {
    if (!plant || !measurand || !selectedTerminals.length) {
      showSnackbar(
        "Please select a plant, measurand, and at least one terminal",
        "warning"
      );
      return;
    }

    const plantData = plants.find((p) => p.PlantId === plant);
    const measurandData = measurands.find((m) => m.MeasurandId === measurand);

    if (!plantData || !measurandData) {
      console.warn("Proceeding with widget creation despite missing data:", {
        plantData,
        measurandData,
      });
    }

    const newWidgets = selectedTerminals.map((terminalId, index) => {
      const terminalData = availableTerminals.find(
        (t) => t.TerminalId === terminalId
      );
      return {
        plantId: plant,
        plantName: plantData?.PlantName || "Unknown Plant",
        measurandId: measurand,
        measurandName: measurandData?.MeasurandName || "Unknown Measurand",
        terminalId: terminalId,
        terminalName: terminalData?.TerminalName || "Unknown Terminal",
        displayName: measurandData?.MeasurandName || "Unknown Measurand",
        unit: "",
        widgetType: showGraph ? "graph" : "number",
        decimalPlaces: 2,
        graphType: showGraph ? "area" : null,
        xAxisConfiguration: showGraph ? "time:timestamp" : null,
        refreshInterval: 5000,
        properties: {},
        position: {
          x: (index % 6) * 2,
          y: Math.floor(index / 6) * 2,
          width: showGraph ? 4 : 2,
          height: showGraph ? 6 : 3,
        },
        i: `${terminalData?.TerminalName || "terminal"}_${terminalId}${
          showGraph ? "-graph" : ""
        }`,
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
        minW: 1,
        minH: 3,
        maxW: 12,
        maxH: 8,
        resizeHandles: ["se"],
      }))
    );
    setSelectionInfo({
      terminalGroup: plantData?.PlantName || "Unknown Plant",
      terminals: selectedTerminals.map(
        (id) =>
          availableTerminals.find((t) => t.TerminalId === id)?.TerminalName ||
          "Unknown Terminal"
      ),
      mesrand: [measurandData?.MeasurandName || "Unknown Measurand"],
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
        (view) => (view.name || "").toLowerCase() === name.trim().toLowerCase()
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
        measurandId: measurand,
        plant,
        terminal: selectedTerminals[0],
        widgets: createdWidgets.map((widget) => ({
          ...widget,
          position: {
            x: widget.position.x,
            y: widget.position.y,
            width: widget.position.width,
            height: widget.position.height,
          },
        })),
      };

      const response = await axios.post(
        `${BASE_URL}/saved-measurand-views`,
        viewData
      );
      setSavedViews((prev) => [...prev, response.data]);
      preserveWidgetTemplatesAndClear();
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
        measurandId: measurand,
        plant,
        terminal: selectedTerminals[0] || createdWidgets[0]?.terminalId,
        widgets: createdWidgets.map((widget) => ({
          ...widget,
          position: {
            x: widget.position.x,
            y: widget.position.y,
            width: widget.position.width,
            height: widget.position.height,
          },
        })),
      };

      const response = await axios.put(
        `${BASE_URL}/saved-measurand-views/${selectedView}`,
        viewData
      );
      setSavedViews((prev) =>
        prev.map((v) => (v._id === selectedView ? response.data : v))
      );
      preserveWidgetTemplatesAndClear();
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
      let isMounted = true;
      try {
        const response = await axios.get(
          `${BASE_URL}/saved-measurand-views/${viewId}`
        );
        const savedView = response.data;

        if (!savedView || !savedView.widgets?.length) {
          showSnackbar(
            "Selected view not found or contains no widgets",
            "error"
          );
          setShowWidgets(false);
          setCreatedWidgets([]);
          setLayout([]);
          setSelectionInfo(null);
          return;
        }

        const selectedPlant = savedView.plant || "";
        const selectedMeasurand = savedView.measurandId || "";

        if (isMounted) {
          setPlant(selectedPlant);
          setMeasurand(selectedMeasurand);
        }

        const [plantsRes, measurandsRes, terminalsRes] = await Promise.all([
          axios.get(`${BASE_URL}/plants`).catch((error) => {
            console.error("Error fetching plants:", error);
            return { data: [] };
          }),
          selectedPlant
            ? axios
                .get(`${BASE_URL}/measurands/plant/${selectedPlant}`)
                .catch((error) => {
                  console.error("Error fetching measurands:", error);
                  return { data: [] };
                })
            : Promise.resolve({ data: [] }),
          selectedPlant && selectedMeasurand
            ? axios
                .get(
                  `${BASE_URL}/terminals/plant/${selectedPlant}/measurand/${selectedMeasurand}`
                )
                .catch((error) => {
                  console.error("Error fetching terminals:", error);
                  return { data: [] };
                })
            : Promise.resolve({ data: [] }),
        ]);

        const currentPlants = plantsRes.data;
        const currentMeasurands = measurandsRes.data;
        const currentTerminals = terminalsRes.data;

        console.log("Current Plants:", currentPlants);
        console.log("Current Measurands:", currentMeasurands);
        console.log("Current Terminals:", currentTerminals);
        console.log("Saved View MeasurandId:", savedView.measurandId);
        console.log(
          "Saved View MeasurandId Type:",
          typeof savedView.measurandId
        );

        if (isMounted) {
          setPlants(currentPlants);
          setMeasurands(currentMeasurands);
          setAvailableTerminals(currentTerminals);
        }

        const measurandData = currentMeasurands.find(
          (m) => String(m.MeasurandId) === String(savedView.measurandId)
        );

        if (!measurandData) {
          console.error(
            `Measurand ${savedView.measurandId} not found in plant ${selectedPlant}.`,
            `Available measurands:`,
            currentMeasurands.map((m) => ({
              MeasurandId: m.MeasurandId,
              Type: typeof m.MeasurandId,
              MeasurandName: m.MeasurandName,
            }))
          );
          showSnackbar(
            `Measurand not found for plant ${selectedPlant}. Please select a different view or update the plant data.`,
            "error"
          );
          setShowWidgets(false);
          setCreatedWidgets([]);
          setLayout([]);
          setSelectionInfo(null);
          setMeasurand("");
          setAvailableTerminals([]);
          setSelectedTerminals([]);
          return;
        }

        const newWidgets = savedView.widgets
          .filter(
            (widget) =>
              widget.plantId && widget.measurandId && widget.terminalId
          )
          .map((widget, index) => {
            const plantData = currentPlants.find(
              (p) => p.PlantId === widget.plantId
            );
            const terminalData = currentTerminals.find(
              (t) => t.TerminalId === widget.terminalId
            );

            return {
              ...widget,
              i:
                widget.i ||
                `${widget.terminalName}_${widget.terminalId}${
                  widget.widgetType === "graph" ? "-graph" : ""
                }`,
              plantName:
                plantData?.PlantName || widget.plantName || "Unknown Plant",
              measurandId: savedView.measurandId,
              measurandName:
                measurandData?.MeasurandName ||
                widget.measurandName ||
                "Unknown Measurand",
              terminalName:
                widget.terminalName ||
                terminalData?.TerminalName ||
                "Unknown Terminal",
              displayName:
                measurandData?.MeasurandName ||
                widget.displayName ||
                "Unknown Measurand",
              position: {
                x: widget.position?.x ?? (index % 6) * 2,
                y: widget.position?.y ?? Math.floor(index / 6) * 2,
                width:
                  widget.position?.width ??
                  (widget.widgetType === "graph" ? 4 : 2),
                height:
                  widget.position?.height ??
                  (widget.widgetType === "graph" ? 6 : 3),
              },
              value: null,
              timestamp: null,
              unit: widget.unit || "",
            };
          });

        if (newWidgets.length === 0) {
          showSnackbar("No valid widgets found in the saved view", "error");
          setShowWidgets(false);
          setCreatedWidgets([]);
          setLayout([]);
          setSelectionInfo(null);
          return;
        }

        if (isMounted) {
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
          const newSelectedTerminals = newWidgets.map((w) => w.terminalId);
          setSelectedTerminals(newSelectedTerminals);
          setShowGraph(newWidgets.some((w) => w.widgetType === "graph"));
          setSelectionInfo({
            terminalGroup: newWidgets[0]?.plantName || "Unknown Plant",
            terminals: newWidgets.map(
              (w) => w.terminalName || "Unknown Terminal"
            ),
            mesrand: [measurandData?.MeasurandName || "Unknown Measurand"],
            viewType: newWidgets.some((w) => w.widgetType === "graph")
              ? "Graph"
              : "Number",
            timestamp: new Date(savedView.updatedAt).toLocaleString(),
          });
          setShowWidgets(true);
        }

        // Initial data fetch after states are set
        const controller = new AbortController();
        const updatedWidgets = await Promise.all(
          newWidgets.map(async (widget) => {
            const data = await fetchMeasurementData(
              widget.terminalId,
              controller.signal
            );
            return {
              ...widget,
              value: data?.value ?? null,
              timestamp: data?.timestamp ?? null,
              unit: data?.unit ?? widget.unit,
              terminalName: widget.terminalName,
            };
          })
        );
        if (isMounted) {
          setCreatedWidgets(updatedWidgets);
          setMeasurementData(
            updatedWidgets.reduce(
              (acc, widget) => ({
                ...acc,
                [`${measurand}_${widget.terminalId}`]: widget,
              }),
              {}
            )
          );
        }
      } catch (error) {
        console.error("Error loading saved view:", error);
        showSnackbar("Error loading saved view", "error");
        if (isMounted) {
          setShowWidgets(false);
          setCreatedWidgets([]);
          setLayout([]);
          setSelectionInfo(null);
          setPlant("");
          setMeasurand("");
          setAvailableTerminals([]);
          setSelectedTerminals([]);
        }
      }
      return () => {
        isMounted = false;
      };
    } else {
      setShowWidgets(false);
      setLayout([]);
      setCreatedWidgets([]);
      setSelectionInfo(null);
      setPlant("");
      setMeasurand("");
      setSelectedTerminals([]);
      setAvailableTerminals([]);
    }
  };

  const handleDeleteClick = () => {
    if (!selectedView) return;
    setDeleteDialogOpen(true);
  };

  const handleDeleteView = async () => {
    try {
      await axios.delete(`${BASE_URL}/saved-measurand-views/${selectedView}`);
      setSavedViews((prev) => prev.filter((v) => v._id !== selectedView));
      setSelectedView("");
      setShowWidgets(false);
      setCreatedWidgets([]);
      setSelectionInfo(null);
      preserveWidgetTemplatesAndClear();
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

  const handleAddWidget = async () => {
    if (!plant || !measurand) {
      showSnackbar("Please select a plant and measurand first", "warning");
      return;
    }

    // Refetch missing state if necessary
    try {
      if (!plants.length) {
        const plantsRes = await axios.get(`${BASE_URL}/plants`);
        setPlants(plantsRes.data);
      }
      if (!measurands.length && plant) {
        const measurandsRes = await axios.get(
          `${BASE_URL}/measurands/plant/${plant}`
        );
        setMeasurands(measurandsRes.data);
      }
      if (!availableTerminals.length && plant && measurand) {
        const terminalsRes = await axios.get(
          `${BASE_URL}/terminals/plant/${plant}/measurand/${measurand}`
        );
        setAvailableTerminals(terminalsRes.data);
      }
    } catch (error) {
      console.error("Error refetching state for add widget:", error);
      showSnackbar("Error loading data for widget creation", "error");
      return;
    }

    setWidgetDialogOpen(true);
  };

  const handleCreateWidget = async (widgetData) => {
    if (widgetData.error) {
      showSnackbar(widgetData.error, "warning");
      return;
    }

    const plantData = plants.find((p) => p.PlantId === plant);
    const measurandData = measurands.find(
      (m) => m.MeasurandId === widgetData.mesrand
    );
    const terminalData = availableTerminals.find(
      (t) => t.TerminalId === widgetData.terminalId
    );

    if (!plantData || !measurandData || !terminalData) {
      console.warn("Proceeding with widget creation despite missing data:", {
        plantData,
        measurandData,
        terminalData,
      });
    }

    const newWidget = {
      plantId: plant,
      plantName: plantData?.PlantName || "Unknown Plant",
      measurandId: widgetData.mesrand,
      measurandName: measurandData?.MeasurandName || "Unknown Measurand",
      terminalId: widgetData.terminalId,
      terminalName: terminalData?.TerminalName || "Unknown Terminal",
      displayName: measurandData?.MeasurandName || "Unknown Measurand",
      unit: "",
      widgetType: widgetData.isGraph ? "graph" : "number",
      decimalPlaces: 2,
      graphType: widgetData.isGraph ? "area" : null,
      xAxisConfiguration: widgetData.isGraph
        ? { type: "time", value: "timestamp" }
        : null,
      refreshInterval: 5000,
      properties: {},
      position: {
        x: (layout.length % 6) * 2,
        y: Math.floor(layout.length / 6) * 2,
        width: widgetData.isGraph ? 4 : 2,
        height: widgetData.isGraph ? 6 : 3,
      },
      i: `${terminalData?.TerminalName || "terminal"}_${widgetData.terminalId}${
        widgetData.isGraph ? "-graph" : ""
      }`,
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
        minW: 2,
        minH: 2,
        maxW: 12,
        maxH: 8,
        resizeHandles: ["se"],
      },
    ]);
    setSelectedTerminals((prev) => {
      const newTerminals = prev.includes(widgetData.terminalId)
        ? prev
        : [...prev, widgetData.terminalId];
      console.log(
        "Updated selectedTerminals after adding widget:",
        newTerminals
      );
      return newTerminals;
    });
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

  const handleApplySettings = async (settings, applyToAll) => {
    try {
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

      if (selectedView && !applyToAll) {
        await axios.patch(
          `${BASE_URL}/saved-measurand-views/${selectedView}/widgets/${selectedWidgetId}`,
          settings
        );
      }

      showSnackbar(
        applyToAll
          ? "Properties applied to all widgets successfully!"
          : "Widget properties updated successfully!",
        "success"
      );
    } catch (error) {
      console.error("Error updating widget properties:", error);
      showSnackbar("Error updating widget properties", "error");
    } finally {
      setPropertiesDialogOpen(false);
      setSelectedWidgetId(null);
    }
  };

  const TransitionSlide = (props) => <Slide {...props} direction="left" />;

  const allTerminalsSelected =
    selectedTerminals.length === availableTerminals.length &&
    availableTerminals.length > 0;

  return (
    <Box sx={{ width: "100%" }}>
      <Paper sx={{ p: 2 }}>
        <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel>Plant</InputLabel>
            <Select
              value={plant}
              label="Plant"
              onChange={(e) => setPlant(e.target.value)}
            >
              <MenuItem value="">
                <em>Select Plant</em>
              </MenuItem>
              {plants.map((p) => (
                <MenuItem key={p.PlantId} value={p.PlantId}>
                  {p.PlantName}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel>Measurand</InputLabel>
            <Select
              value={measurand}
              label="Measurand"
              onChange={(e) => setMeasurand(e.target.value)}
              disabled={!plant}
            >
              <MenuItem value="">
                <em>Select Measurand</em>
              </MenuItem>
              {measurands.map((m) => (
                <MenuItem key={m.MeasurandId} value={m.MeasurandId}>
                  {m.MeasurandName}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel>Terminal</InputLabel>
            <Select
              multiple
              value={selectedTerminals}
              label="Terminal"
              onChange={handleTerminalChange}
              disabled={!measurand}
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
                <Checkbox checked={allTerminalsSelected} />
                <ListItemText primary="Select All" />
              </MenuItem>
              {availableTerminals.map((t) => (
                <MenuItem key={t.TerminalId} value={t.TerminalId}>
                  <Checkbox
                    checked={selectedTerminals.includes(t.TerminalId)}
                  />
                  <ListItemText primary={t.TerminalName} />
                </MenuItem>
              ))}
              {/* Fallback for widgets not in availableTerminals */}
              {createdWidgets
                .filter(
                  (w) =>
                    !availableTerminals.some(
                      (t) => t.TerminalId === w.terminalId
                    )
                )
                .map((w) => (
                  <MenuItem key={w.terminalId} value={w.terminalId}>
                    <Checkbox
                      checked={selectedTerminals.includes(w.terminalId)}
                    />
                    <ListItemText
                      primary={w.terminalName || "Unknown Terminal"}
                    />
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
              flexWrap: "wrap",
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
                Terminals:
              </Typography>
              <Chip
                label={`${selectionInfo.terminals.length} selected`}
                size="small"
                sx={{ ml: 1 }}
              />
              <Tooltip title={selectionInfo.terminals.join(", ")}>
                <IconButton size="small">
                  <InfoIcon fontSize="small" />
                </IconButton>
              </Tooltip>
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
              const widget = createdWidgets.find((w) => w.i === item.i);
              if (!widget) {
                console.warn(`Widget not found for layout item: ${item.i}`);
                return null;
              }
              return (
                <div key={item.i}>
                  {isGraph ? (
                    <GraphWidget
                      title={widget.terminalName}
                      widgetId={item.i}
                      terminalName={widget.terminalName}
                      measurandName={widget.measurandName}
                      fetchValue={() => Promise.resolve([])}
                      onDelete={(id) => {
                        setLayout((prev) => prev.filter((l) => l.i !== id));
                        setCreatedWidgets((prev) =>
                          prev.filter((w) => w.i !== id)
                        );
                        setSelectedTerminals((prev) =>
                          prev.filter((t) => !id.includes(t))
                        );
                      }}
                      availableMeasurands={measurands.map((m) => ({
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
        availableMeasurands={measurands}
        availableTerminals={availableTerminals}
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
        autoHideDuration={3000}
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

export default CDDMeasurand;
