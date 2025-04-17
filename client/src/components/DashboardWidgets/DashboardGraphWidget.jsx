"use client";

import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  LinearScale,
  TimeScale,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Line } from "react-chartjs-2";
import {
  Box,
  Typography,
  Paper,
  IconButton,
  useTheme,
  Drawer,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Menu,
  Snackbar,
  Alert,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControlLabel,
  Checkbox,
} from "@mui/material";
import {
  DragHandle,
  MoreVert as MoreVertIcon,
  Settings as SettingsIcon,
  Delete as DeleteIcon,
  Fullscreen as FullscreenIcon,
  FullscreenExit as FullscreenExitIcon,
  Compare as CompareIcon,
} from "@mui/icons-material";
import { styled } from "@mui/material/styles";
import "chartjs-adapter-date-fns";
import DeleteConfirmationDialog from "../DeleteConfirmationDialog";

ChartJS.register(
  LineElement,
  PointElement,
  LinearScale,
  TimeScale,
  Title,
  Tooltip,
  Legend,
  Filler
);

const API_BASE_URL = `${process.env.REACT_APP_API_LOCAL_URL}api`;

const colorOptions = [
  { name: "Teal", value: "rgba(0, 128, 128, 1)", bg: "rgba(0, 128, 128, 0.2)" },
  {
    name: "Purple",
    value: "rgba(128, 0, 128, 1)",
    bg: "rgba(128, 0, 128, 0.2)",
  },
  {
    name: "Orange",
    value: "rgba(255, 165, 0, 1)",
    bg: "rgba(255, 165, 0, 0.2)",
  },
  { name: "Red", value: "rgba(255, 0, 0, 1)", bg: "rgba(255, 0, 0, 0.2)" },
  { name: "Blue", value: "rgba(0, 0, 255, 1)", bg: "rgba(0, 0, 255, 0.2)" },
  { name: "Green", value: "rgba(0, 128, 0, 1)", bg: "rgba(0, 128, 0, 0.2)" },
  {
    name: "Pink",
    value: "rgba(255, 105, 180, 1)",
    bg: "rgba(255, 105, 180, 0.2)",
  },
  { name: "Cyan", value: "rgba(0, 255, 255, 1)", bg: "rgba(0, 255, 255, 0.2)" },
];

const GraphPaper = styled(Paper)(
  ({ theme, isDarkMode, isFullscreen, settings }) => ({
    width: "100%",
    height: isFullscreen ? "100vh" : "auto",
    display: "flex",
    flexDirection: "column",
    borderRadius: settings.borderRadius || "8px",
    border: settings.border || "none",
    backgroundColor: isDarkMode
      ? settings.backgroundColorDark || "#1f2937"
      : settings.backgroundColor || "#ffffff",
    overflow: "hidden",
    position: "relative",
    "&:hover .widget-header": {
      opacity: 1,
    },
  })
);

const WidgetHeader = styled(Box)(({ isDarkMode, settings }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "6px 12px",
  backgroundColor: isDarkMode
    ? settings.headerBackgroundColorDark || "rgba(55, 65, 81, 0.5)"
    : settings.headerBackgroundColor || "rgba(243, 244, 246, 0.5)",
  backdropFilter: "blur(4px)",
  opacity: 1,
  transition: "opacity 0.3s ease",
  borderBottom: isDarkMode
    ? settings.headerBorderDark || "1px solid rgba(255, 255, 255, 0.1)"
    : settings.headerBorder || "1px solid rgba(0, 0, 0, 0.1)",
}));

const ControlButtons = styled(Box)({
  display: "flex",
  alignItems: "center",
  gap: "4px",
  transition: "opacity 0.3s ease",
});

const StyledIconButton = styled(IconButton)(({ isDarkMode }) => ({
  padding: "4px",
  "&:hover": {
    backgroundColor: isDarkMode
      ? "rgba(255, 255, 255, 0.1)"
      : "rgba(0, 0, 0, 0.05)",
  },
}));

const Sidebar = styled(Drawer)(({ isDarkMode }) => ({
  "& .MuiDrawer-paper": {
    width: 350,
    backgroundColor: isDarkMode ? "#1f2937" : "#ffffff",
    padding: "16px",
    boxSizing: "border-box",
  },
}));

const ApplyButton = styled(Button)(({ isDarkMode }) => ({
  backgroundColor: isDarkMode ? "#3b82f6" : "#2563eb",
  color: "#ffffff",
  "&:hover": {
    backgroundColor: isDarkMode ? "#60a5fa" : "#1d4ed8",
  },
  textTransform: "none",
  fontWeight: 600,
  fontFamily: "Inter",
  borderRadius: "8px",
}));

const formatTimestamp = (timestamp) => {
  if (!timestamp) return "No timestamp available";
  const date = new Date(timestamp);
  return date.toLocaleString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
    timeZone: "Asia/Kolkata",
  });
};

Tooltip.positioners.custom = function (elements, eventPosition) {
  return { x: eventPosition.x, y: eventPosition.y - 20 };
};

const tooltipCrosshairPlugin = {
  id: "tooltipCrosshair",
  afterDraw: (chart) => {
    const { ctx, chartArea, tooltip } = chart;
    if (!tooltip?.caretX || !tooltip?.caretY) return;
    const x = tooltip.caretX;
    const y = tooltip.caretY;
    if (
      x >= chartArea.left &&
      x <= chartArea.right &&
      y >= chartArea.top &&
      y <= chartArea.bottom
    ) {
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(x, chartArea.top);
      ctx.lineTo(x, chartArea.bottom);
      ctx.lineWidth = 1;
      ctx.strokeStyle = chart.config.options.scales.x.ticks.color;
      ctx.setLineDash([5, 5]);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(chartArea.left, y);
      ctx.lineTo(chartArea.right, y);
      ctx.strokeStyle = chart.config.options.scales.y.ticks.color;
      ctx.stroke();
      ctx.restore();
    }
  },
};

const DashboardGraphWidget = ({
  data,
  width,
  height,
  onDelete,
  handleSettingsClick,
}) => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === "dark";
  const [isHovered, setIsHovered] = useState(false);
  const [graphData, setGraphData] = useState({});
  const [selectedMeasurands, setSelectedMeasurands] = useState(
    data.selectedMeasurands?.length > 0
      ? data.selectedMeasurands.map((m, index) => ({
          id: m.id,
          name: m.name,
          color:
            m.color ||
            colorOptions[index % colorOptions.length] ||
            colorOptions[0],
        }))
      : data.measurandId
      ? [
          {
            id: data.measurandId,
            name: data.measurement,
            color: colorOptions[0],
          },
        ]
      : []
  );
  const [thresholds, setThresholds] = useState(
    data.thresholds || { percentage: null }
  );
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [availableMeasurands, setAvailableMeasurands] = useState([]);
  const [measurandColors, setMeasurandColors] = useState({}); // Track color selections
  const [terminalDetails, setTerminalDetails] = useState({
    plantId: null,
    terminalId: null,
  });
  const [percentageDialogOpen, setPercentageDialogOpen] = useState(false);
  const [percentageInput, setPercentageInput] = useState("");
  const chartInstanceRef = useRef(null);
  const widgetRef = useRef(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const settings = data.settings || {};

  useEffect(() => {
    const saveConfiguration = async () => {
      try {
        await axios.put(
          `${API_BASE_URL}/dashboards/${data.dashboardName}/widgets/${data.id}/selections`,
          {
            selectedMeasurands,
            thresholds,
          }
        );
      } catch (error) {
        console.error("Error saving configuration:", error);
        setSnackbarMessage("Failed to save configuration");
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
      }
    };
    if (selectedMeasurands.length > 0 || thresholds.percentage) {
      saveConfiguration();
    }
  }, [selectedMeasurands, thresholds, data.id, data.dashboardName]);

  const fetchTerminalDetails = async (terminalName) => {
    try {
      if (!terminalName)
        throw new Error("Terminal name is required to fetch details");
      const plantsResponse = await axios.get(`${API_BASE_URL}/hdd/plants`);
      const plants = plantsResponse.data.data;
      for (const plant of plants) {
        const terminalsResponse = await axios.get(
          `${API_BASE_URL}/hdd/terminals/${plant.plantId}`
        );
        const terminal = terminalsResponse.data.data.find(
          (t) => t.terminalName === terminalName
        );
        if (terminal)
          return { plantId: plant.plantId, terminalId: terminal.terminalId };
      }
      throw new Error(`Terminal ${terminalName} not found in any plant`);
    } catch (error) {
      console.error("Error fetching terminal details:", error);
      setSnackbarMessage(
        `Failed to resolve terminal details for ${terminalName}`
      );
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
      return null;
    }
  };

  const fetchAvailableMeasurands = async (plantId, terminalId) => {
    try {
      if (!plantId || !terminalId)
        throw new Error("PlantId and TerminalId are required");
      const response = await axios.get(
        `${API_BASE_URL}/hdd/measurands/${plantId}/${terminalId}`
      );
      const measurands = response.data.data.map((item) => ({
        MeasurandId: item.measurandId,
        MeasurandName: item.measurandName,
      }));
      setAvailableMeasurands(measurands);
      // Initialize default colors for measurands
      const initialColors = measurands.reduce((acc, measurand) => {
        acc[measurand.MeasurandId] = "#000000"; // Default color
        return acc;
      }, {});
      setMeasurandColors(initialColors);
    } catch (error) {
      console.error("Error fetching measurands:", error);
      setSnackbarMessage("Failed to fetch measurands for comparison");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
      setAvailableMeasurands(data.measurands || []);
    }
  };

  useEffect(() => {
    const resolveTerminalDetails = async () => {
      if (data.plantId && data.terminalId) {
        setTerminalDetails({
          plantId: data.plantId,
          terminalId: data.terminalId,
        });
        fetchAvailableMeasurands(data.plantId, data.terminalId);
      } else if (data.terminal) {
        const details = await fetchTerminalDetails(data.terminal);
        if (details) {
          setTerminalDetails(details);
          fetchAvailableMeasurands(details.plantId, details.terminalId);
        }
      }
    };
    resolveTerminalDetails();
  }, [data.terminal, data.plantId, data.terminalId]);

  const fetchGraphData = async (measurandId) => {
    try {
      const { terminalId } = terminalDetails;
      if (!terminalId || !measurandId) {
        return [];
      }
      const response = await axios.get(
        `${API_BASE_URL}/hdd/graph/${terminalId}/${measurandId}`
      );
      const fetchedData = response.data.data
        .map((item) => ({
          timestamp: item.Timestamp,
          value: parseFloat(item.MeasurandValue),
        }))
        .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
      return fetchedData;
    } catch (error) {
      console.error(`Error fetching graph data for ${measurandId}:`, error);
      return [];
    }
  };

  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      const newData = {};
      await Promise.all(
        selectedMeasurands.map(async (measurand) => {
          const fetchedData = await fetchGraphData(measurand.id);
          newData[measurand.id] = fetchedData;
        })
      );
      if (isMounted) setGraphData((prev) => ({ ...prev, ...newData }));
    };
    if (selectedMeasurands.length > 0) {
      fetchData();
      const interval = setInterval(fetchData, 1000);
      return () => {
        isMounted = false;
        clearInterval(interval);
      };
    }
  }, [selectedMeasurands, terminalDetails.terminalId]);

  useEffect(() => {
    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
        chartInstanceRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement && isFullscreen) setIsFullscreen(false);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () =>
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, [isFullscreen]);

  const calculateThresholdLines = () => {
    if (!thresholds.percentage || !graphData[selectedMeasurands[0]?.id])
      return {};
    const primaryData = graphData[selectedMeasurands[0].id] || [];
    const values = primaryData.map((d) => d.value).filter((v) => !isNaN(v));
    if (values.length === 0) return {};
    const avg = values.reduce((sum, v) => sum + v, 0) / values.length;
    const percentage = parseFloat(thresholds.percentage) / 100;
    const minLine = avg * (1 - percentage);
    const maxLine = avg * (1 + percentage);
    return { minLine, maxLine };
  };

  const { minLine, maxLine } = calculateThresholdLines();

  const chartData = {
    labels:
      selectedMeasurands.length > 0 && graphData[selectedMeasurands[0].id]
        ? graphData[selectedMeasurands[0].id].map((d) =>
            formatTimestamp(d.timestamp)
          )
        : [],
    datasets: [
      ...selectedMeasurands.map((measurand) => {
        const dataPoints = (graphData[measurand.id] || []).map((d) => d.value);
        const pointRadius = dataPoints.map((_, index) =>
          index === dataPoints.length - 1 ? 5 : 0
        );
        const pointBackgroundColor = dataPoints.map((_, index) =>
          index === dataPoints.length - 1 ? "red" : measurand.color.value
        );
        return {
          label: measurand.name,
          data: dataPoints,
          backgroundColor: measurand.color.bg,
          borderColor: measurand.color.value,
          fill: true,
          tension: 0.3,
          pointRadius,
          pointBackgroundColor,
          pointHoverRadius: 5,
          borderWidth: 2,
        };
      }),
      ...(minLine !== undefined
        ? [
            {
              label: "Percentage Min",
              data: graphData[selectedMeasurands[0]?.id]?.map(() => minLine),
              borderColor: "rgba(255, 165, 0, 0.8)",
              borderDash: [5, 5],
              fill: false,
              pointRadius: 0,
              borderWidth: 2,
            },
          ]
        : []),
      ...(maxLine !== undefined
        ? [
            {
              label: "Percentage Max",
              data: graphData[selectedMeasurands[0]?.id]?.map(() => maxLine),
              borderColor: "rgba(0, 0, 255, 0.8)",
              borderDash: [5, 5],
              fill: false,
              pointRadius: 0,
              borderWidth: 2,
            },
          ]
        : []),
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        type: "category",
        title: { display: false },
        ticks: {
          color: isDarkMode ? "#9ca3af" : "#6b7280",
          font: { size: 10, family: "Inter" },
          callback: function (value, index, values) {
            const totalTicks = values.length;
            if (totalTicks <= 3) return this.getLabelForValue(value);
            if (
              index === 0 ||
              index === Math.floor(totalTicks / 2) ||
              index === totalTicks - 1
            )
              return this.getLabelForValue(value);
            return null;
          },
          maxTicksLimit: 3,
          autoSkip: false,
        },
        grid: { color: isDarkMode ? "rgba(255, 255, 255, 0.05)" : "#f3f4f6" },
      },
      y: {
        beginAtZero: true,
        title: {
          display: true,
          color: isDarkMode ? "#d1d5db" : "#4b5563",
          font: { size: 12, family: "Inter" },
        },
        ticks: {
          color: isDarkMode ? "#9ca3af" : "#6b7280",
          font: { size: 10, family: "Inter" },
        },
        grid: { color: isDarkMode ? "rgba(255, 255, 255, 0.05)" : "#f3f4f6" },
      },
    },
    plugins: {
      legend: {
        display: false, // Hide legend (measurand names)
      },
      tooltip: {
        enabled: true,
        mode: "index",
        intersect: false,
        position: "custom",
        callbacks: {
          title: (tooltipItems) => tooltipItems[0].label,
          label: (tooltipItem) =>
            `${tooltipItem.dataset.label}: ${tooltipItem.raw} ${
              data.unit || ""
            }`,
        },
        backgroundColor: isDarkMode
          ? "rgba(55, 65, 81, 0.95)"
          : "rgba(255, 255, 255, 0.95)",
        titleColor: isDarkMode ? "#ffffff" : "#111827",
        bodyColor: isDarkMode ? "#d1d5db" : "#4b5563",
        borderColor: isDarkMode ? "#6b7280" : "#e5e7eb",
        borderWidth: 1,
        padding: 10,
        cornerRadius: 6,
      },
    },
    animation: {
      duration: 600,
      easing: "easeOutQuart",
      onProgress: (animation) => {
        const chart = animation.chart;
        chart.data.datasets.forEach((dataset, index) => {
          if (index < selectedMeasurands.length) {
            const lastIndex = dataset.data.length - 1;
            if (lastIndex >= 0) {
              dataset.pointRadius[lastIndex] =
                5 * Math.abs(Math.sin(Date.now() / 200));
            }
          }
        });
        chart.update("none");
      },
    },
    elements: { line: { tension: 0.3 }, point: { radius: 0, hoverRadius: 5 } },
    interaction: { mode: "index", intersect: false },
  };

  ChartJS.register(tooltipCrosshairPlugin);

  const handleSidebarToggle = () => setSidebarOpen(!sidebarOpen);
  const handleSidebarClose = () => setSidebarOpen(false);

  const handleCheckboxChange = (measurand) => {
    const newMeasurands = [...selectedMeasurands];
    const existingIndex = newMeasurands.findIndex(
      (m) => m.id === measurand.MeasurandId
    );
    if (existingIndex >= 0) {
      newMeasurands.splice(existingIndex, 1);
      setSnackbarMessage("Measurand removed successfully");
    } else if (newMeasurands.length < 3) {
      const selectedColor = measurandColors[measurand.MeasurandId] || "#000000";
      newMeasurands.push({
        id: measurand.MeasurandId,
        name: measurand.MeasurandName,
        color: {
          value: selectedColor,
          bg: `rgba(${parseInt(selectedColor.slice(1, 3), 16)}, ${parseInt(
            selectedColor.slice(3, 5),
            16
          )}, ${parseInt(selectedColor.slice(5, 7), 16)}, 0.2)`,
        },
      });
      setSnackbarMessage("Measurand added successfully");
    } else {
      setSnackbarMessage("Maximum 3 measurands allowed for comparison");
      setSnackbarSeverity("warning");
      setSnackbarOpen(true);
      return;
    }
    setSelectedMeasurands(newMeasurands);
    setSnackbarSeverity("success");
    setSnackbarOpen(true);
  };

  const handleColorChange = (measurandId, color) => {
    setMeasurandColors((prev) => ({
      ...prev,
      [measurandId]: color,
    }));
    // Update color for already selected measurand
    const newMeasurands = selectedMeasurands.map((m) =>
      m.id === measurandId
        ? {
            ...m,
            color: {
              value: color,
              bg: `rgba(${parseInt(color.slice(1, 3), 16)}, ${parseInt(
                color.slice(3, 5),
                16
              )}, ${parseInt(color.slice(5, 7), 16)}, 0.2)`,
            },
          }
        : m
    );
    setSelectedMeasurands(newMeasurands);
  };

  const handlePercentageDialogOpen = () => setPercentageDialogOpen(true);
  const handlePercentageDialogClose = () => {
    setPercentageDialogOpen(false);
    setPercentageInput("");
  };

  const handlePercentageSave = () => {
    const percentage = parseFloat(percentageInput);
    if (isNaN(percentage) || percentage < 0 || percentage > 100) {
      setSnackbarMessage("Please enter a valid percentage (0-100)");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
      return;
    }
    setThresholds({ percentage });
    handlePercentageDialogClose();
    setSnackbarMessage("Percentage threshold applied");
    setSnackbarSeverity("success");
    setSnackbarOpen(true);
  };

  const handleDeleteClick = () => setDeleteDialogOpen(true);
  const handleDeleteConfirm = () => {
    onDelete(data.id);
    setDeleteDialogOpen(false);
    setSnackbarMessage("Graph widget deleted successfully");
    setSnackbarSeverity("success");
    setSnackbarOpen(true);
  };

  const toggleFullscreen = () => {
    if (!isFullscreen) {
      widgetRef.current.requestFullscreen().then(() => setIsFullscreen(true));
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false));
    }
  };

  const handleMenuClick = (event) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  return (
    <GraphPaper
      ref={widgetRef}
      elevation={2}
      isDarkMode={isDarkMode}
      isFullscreen={isFullscreen}
      settings={settings}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <WidgetHeader
        isDarkMode={isDarkMode}
        settings={settings}
        className="widget-header"
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <DragHandle
            sx={{
              fontSize: "0.75rem",
              color: isDarkMode ? "#9ca3af" : "#6b7280",
            }}
          />
          <Typography
            variant="h6"
            sx={{
              color: settings.titleColor || "#000000",
              fontFamily: settings.titleFontFamily || "inherit",
              fontSize: settings.titleFontSize || "14px",
              fontStyle: settings.titleFontStyle || "normal",
              fontWeight: settings.titleFontWeight || "normal",
              textDecoration: settings.titleTextDecoration || "none",
            }}
          >
            {data.name || "Graph Widget"}
          </Typography>
        </Box>
        <ControlButtons sx={{ opacity: isHovered || isFullscreen ? 1 : 0 }}>
          <StyledIconButton
            size="small"
            isDarkMode={isDarkMode}
            onClick={handleMenuClick}
          >
            <MoreVertIcon
              sx={{
                fontSize: "0.95rem",
                color: isDarkMode ? "#d1d5db" : "#6b7280",
              }}
            />
          </StyledIconButton>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
          >
            <MenuItem
              onClick={() => {
                handleSidebarToggle();
                handleMenuClose();
              }}
            >
              <CompareIcon
                sx={{
                  fontSize: "0.75rem",
                  mr: 1,
                  color: isDarkMode ? "#d1d5db" : "#6b7280",
                }}
              />{" "}
              Compare Measurands
            </MenuItem>
            <MenuItem
              onClick={() => {
                handlePercentageDialogOpen();
                handleMenuClose();
              }}
            >
              <CompareIcon
                sx={{
                  fontSize: "0.75rem",
                  mr: 1,
                  color: isDarkMode ? "#d1d5db" : "#6b7280",
                }}
              />{" "}
              Set Percentage Threshold
            </MenuItem>
            <MenuItem
              onClick={() => {
                handleSettingsClick(data.id);
                handleMenuClose();
              }}
            >
              <SettingsIcon
                sx={{
                  fontSize: "0.75rem",
                  mr: 1,
                  color: isDarkMode ? "#d1d5db" : "#6b7280",
                }}
              />{" "}
              Settings
            </MenuItem>
            <MenuItem
              onClick={() => {
                handleDeleteClick();
                handleMenuClose();
              }}
            >
              <DeleteIcon
                sx={{
                  fontSize: "0.75rem",
                  mr: 1,
                  color: isDarkMode ? "#fecaca" : "#b91c1c",
                }}
              />
              Delete
            </MenuItem>
            <MenuItem
              onClick={() => {
                toggleFullscreen();
                handleMenuClose();
              }}
            >
              {isFullscreen ? (
                <FullscreenExitIcon
                  sx={{
                    fontSize: "0.75rem",
                    mr: 1,
                    color: isDarkMode ? "#d1d5db" : "#6b7280",
                  }}
                />
              ) : (
                <FullscreenIcon
                  sx={{
                    fontSize: "0.75rem",
                    mr: 1,
                    color: isDarkMode ? "#d1d5db" : "#6b7280",
                  }}
                />
              )}
              {isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
            </MenuItem>
          </Menu>
        </ControlButtons>
      </WidgetHeader>

      <Box
        sx={{
          flexGrow: 1,
          height: isFullscreen ? "calc(100vh - 80px)" : height || "300px",
          position: "relative",
        }}
      >
        <Line
          data={chartData}
          options={options}
          plugins={[tooltipCrosshairPlugin]}
          ref={(chart) => {
            if (chart) {
              if (chartInstanceRef.current) chartInstanceRef.current.destroy();
              chartInstanceRef.current = chart.chart;
            }
          }}
        />
      </Box>

      <Sidebar
        anchor="right"
        open={sidebarOpen}
        onClose={handleSidebarClose}
        isDarkMode={isDarkMode}
      >
        <Typography
          variant="h6"
          sx={{
            color: isDarkMode ? "#f3f4f6" : "#1f2937",
            fontWeight: "600",
            fontFamily: "Inter",
            padding: "16px",
          }}
        >
          Comparison Options
        </Typography>
        <Box sx={{ px: 2 }}>
          <Typography
            variant="body2"
            sx={{
              color: isDarkMode ? "#d1d5db" : "#4b5563",
              fontFamily: "Inter",
              mb: 2,
            }}
          >
            Select Measurands to Compare (Max 3)
          </Typography>
          {availableMeasurands.map((measurand) => (
            <Box
              key={measurand.MeasurandId}
              sx={{ display: "flex", alignItems: "center", mb: 1 }}
            >
              <FormControlLabel
                control={
                  <Checkbox
                    checked={selectedMeasurands.some(
                      (m) => m.id === measurand.MeasurandId
                    )}
                    onChange={() => handleCheckboxChange(measurand)}
                    sx={{
                      color: isDarkMode ? "#d1d5db" : "#4b5563",
                    }}
                  />
                }
                label={measurand.MeasurandName}
                sx={{
                  color: isDarkMode ? "#d1d5db" : "#4b5563",
                  fontFamily: "Inter",
                  flexGrow: 1,
                }}
              />
              <TextField
                type="color"
                value={measurandColors[measurand.MeasurandId] || "#000000"}
                onChange={(e) =>
                  handleColorChange(measurand.MeasurandId, e.target.value)
                }
                disabled={
                  !selectedMeasurands.some(
                    (m) => m.id === measurand.MeasurandId
                  )
                }
                sx={{
                  width: 40,
                  "& .MuiOutlinedInput-root": { padding: 0 },
                  "& .MuiInputBase-input": { padding: 0 },
                }}
              />
            </Box>
          ))}
          <ApplyButton
            onClick={handleSidebarClose}
            isDarkMode={isDarkMode}
            fullWidth
            sx={{ mt: 2 }}
          >
            Close
          </ApplyButton>
        </Box>
      </Sidebar>

      <Dialog open={percentageDialogOpen} onClose={handlePercentageDialogClose}>
        <DialogTitle>Set Percentage Threshold</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Percentage (%)"
            type="number"
            value={percentageInput}
            onChange={(e) => setPercentageInput(e.target.value)}
            variant="outlined"
            sx={{ mt: 2 }}
            helperText="Enter a percentage to calculate min/max lines based on the primary measurand's average"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handlePercentageDialogClose}>Cancel</Button>
          <Button onClick={handlePercentageSave} variant="contained">
            Apply
          </Button>
        </DialogActions>
      </Dialog>

      <DeleteConfirmationDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Graph Widget"
        message={`Are you sure you want to delete the "${
          data.name || "Graph Widget"
        }" graph widget?`}
      />

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity={snackbarSeverity}
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </GraphPaper>
  );
};

export default DashboardGraphWidget;
