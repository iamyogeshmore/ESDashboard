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
  MenuItem,
  FormControl,
  Select,
  InputLabel,
  Button,
  Menu,
  Snackbar,
  Alert,
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
    height: isFullscreen ? "100vh" : "100%",
    width: isFullscreen ? "100vw" : "100%",
    padding: theme.spacing(2),
    background:
      settings?.backgroundColor ||
      (isDarkMode
        ? "linear-gradient(145deg, #2a2a2a 0%, #1f1f1f 100%)"
        : "#ffffff"),
    borderRadius: isFullscreen ? 0 : settings?.borderRadius || "3px",
    border: `${settings?.borderWidth || "1px"} solid ${
      settings?.borderColor || "#e0e0e0"
    }`,
    boxShadow: isDarkMode
      ? "0 4px 20px rgba(0, 0, 0, 0.5)"
      : "0 4px 20px rgba(0, 0, 0, 0.05)",
    transition: "all 0.3s ease",
    "&:hover": !isFullscreen && {
      transform: "translateY(-2px)",
      boxShadow: isDarkMode
        ? "0 6px 24px rgba(0, 0, 0, 0.6)"
        : "0 6px 24px rgba(0, 0, 0, 0.1)",
    },
    display: "flex",
    flexDirection: "column",
    position: isFullscreen ? "fixed" : "relative",
    top: isFullscreen ? 0 : "auto",
    left: isFullscreen ? 0 : "auto",
    zIndex: isFullscreen ? 1300 : "auto",
    overflow: "hidden",
  })
);

const WidgetHeader = styled(Box)(({ theme, isDarkMode, settings }) => ({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  paddingBottom: theme.spacing(1),
  borderBottom: `1px solid ${isDarkMode ? "#6b7280" : "#e5e7eb"}`,
  cursor: "move",
  color: settings?.titleColor || "#000000",
}));

const ControlButtons = styled(Box)(({ theme }) => ({
  display: "flex",
  gap: theme.spacing(0.5),
  alignItems: "center",
  position: "absolute",
  right: 8,
  top: 8,
}));

const StyledIconButton = styled(IconButton)(({ theme, isDarkMode }) => ({
  backgroundColor: isDarkMode
    ? "rgba(75, 85, 99, 0.8)"
    : "rgba(255, 255, 255, 0.8)",
  "&:hover": {
    backgroundColor: isDarkMode
      ? "rgba(107, 114, 128, 0.9)"
      : "rgba(229, 231, 235, 0.9)",
  },
}));

const Sidebar = styled(Drawer)(({ theme, isDarkMode }) => ({
  "& .MuiDrawer-paper": {
    width: 250,
    backgroundColor: isDarkMode ? "#1f2937" : "#ffffff",
    borderLeft: `1px solid ${isDarkMode ? "#4b5563" : "#e5e7eb"}`,
    padding: theme.spacing(2),
  },
}));

const ApplyButton = styled(Button)(({ theme, isDarkMode }) => ({
  background: isDarkMode
    ? "linear-gradient(45deg, #4b5563 30%, #6b7280 90%)"
    : "linear-gradient(45deg, #10b981 30%, #34d399 90%)",
  color: isDarkMode ? "#e5e7eb" : "#ffffff",
  fontFamily: "Inter",
  fontWeight: "600",
  padding: "8px 16px",
  borderRadius: "8px",
  boxShadow: isDarkMode
    ? "0 4px 12px rgba(0, 0, 0, 0.3)"
    : "0 4px 12px rgba(0, 0, 0, 0.1)",
  "&:hover": {
    background: isDarkMode
      ? "linear-gradient(45deg, #6b7280 30%, #9ca3af 90%)"
      : "linear-gradient(45deg, #059669 30%, #10b981 90%)",
  },
}));

const formatTimestamp = (timestamp) => {
  if (!timestamp) return "";
  const date = new Date(timestamp);
  return date.toLocaleString("en-US", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
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
    data.measurement ? [{ name: data.measurement, color: colorOptions[0] }] : []
  );
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [measurand, setMeasurand] = useState("");
  const [color, setColor] = useState(colorOptions[0].name);
  const [customColor, setCustomColor] = useState("#000000");
  const [availableMeasurands, setAvailableMeasurands] = useState([]);
  const [terminalDetails, setTerminalDetails] = useState({
    plantId: null,
    terminalId: null,
  });
  const chartInstanceRef = useRef(null);
  const widgetRef = useRef(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const settings = data.settings || {};

  useEffect(() => {
    const widgetSettings = localStorage.getItem(`widgetSettings_${data.id}`);
    if (widgetSettings) {
      try {
        // Settings are applied via WidgetProperties, no need to set here
      } catch (error) {
        console.error(`Error parsing settings for widget ${data.id}:`, error);
      }
    }
  }, [data.id]);

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

  const fetchGraphData = async (measurandName) => {
    try {
      const { terminal } = data;
      if (!terminal || !measurandName)
        throw new Error("Missing terminal or measurand");
      const response = await axios.get(
        `${API_BASE_URL}/hdd/graph/${terminal}/${measurandName}`
      );
      const fetchedData = response.data.data
        .map((item) => ({
          timestamp: item.Timestamp,
          value: parseFloat(item.MeasurandValue),
        }))
        .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
      return fetchedData;
    } catch (error) {
      console.error(`Error fetching graph data for ${measurandName}:`, error);
      setSnackbarMessage(`Failed to fetch data for ${measurandName}`);
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
      return [];
    }
  };

  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      const newData = {};
      await Promise.all(
        selectedMeasurands.map(async (measurand) => {
          const fetchedData = await fetchGraphData(measurand.name);
          newData[measurand.name] = fetchedData;
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
  }, [selectedMeasurands, data.terminal]);

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

  const chartData = {
    labels:
      selectedMeasurands.length > 0 && graphData[selectedMeasurands[0].name]
        ? graphData[selectedMeasurands[0].name].map((d) =>
            formatTimestamp(d.timestamp)
          )
        : [],
    datasets: selectedMeasurands.map((measurand) => {
      const dataPoints = (graphData[measurand.name] || []).map((d) => d.value);
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
        position: "top",
        labels: {
          color: isDarkMode ? "#d1d5db" : "#374151",
          font: { size: 12, weight: "500", family: "Inter" },
          usePointStyle: true,
          padding: 12,
          boxWidth: 8,
        },
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
        chart.data.datasets.forEach((dataset) => {
          const lastIndex = dataset.data.length - 1;
          if (lastIndex >= 0) {
            dataset.pointRadius[lastIndex] =
              5 * Math.abs(Math.sin(Date.now() / 200));
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
  const handleMeasurandChange = (event) => setMeasurand(event.target.value);
  const handleColorChange = (event) => setColor(event.target.value);
  const handleCustomColorChange = (event) => {
    setCustomColor(event.target.value);
    setColor("Custom");
  };

  const handleApplySelection = () => {
    if (!measurand) {
      setSnackbarMessage("Please select a measurand to compare");
      setSnackbarSeverity("warning");
      setSnackbarOpen(true);
      return;
    }
    const selectedColor =
      color === "Custom"
        ? { name: "Custom", value: `${customColor}`, bg: `${customColor}33` }
        : colorOptions.find((c) => c.name === color);
    const newMeasurands = [...selectedMeasurands];
    const existingIndex = newMeasurands.findIndex((m) => m.name === measurand);
    if (existingIndex >= 0) {
      newMeasurands[existingIndex] = { name: measurand, color: selectedColor };
      setSnackbarMessage("Measurand updated successfully");
    } else if (newMeasurands.length < 3) {
      newMeasurands.push({ name: measurand, color: selectedColor });
      setSnackbarMessage("Measurand added successfully");
    } else {
      setSnackbarMessage("Maximum 3 measurands allowed for comparison");
      setSnackbarSeverity("warning");
      setSnackbarOpen(true);
      return;
    }
    setSelectedMeasurands(newMeasurands);
    setMeasurand("");
    setColor(colorOptions[0].name);
    setCustomColor("#000000");
    setSidebarOpen(false);
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
              Compare
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
              />{" "}
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
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel
              sx={{
                color: isDarkMode ? "#d1d5db" : "#4b5563",
                fontFamily: "Inter",
              }}
            >
              Measurand
            </InputLabel>
            <Select
              value={measurand}
              onChange={handleMeasurandChange}
              label="Measurand"
              sx={{
                color: isDarkMode ? "#d1d5db" : "#4b5563",
                fontFamily: "Inter",
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: isDarkMode ? "#4b5563" : "#e5e7eb",
                },
                "&:hover .MuiOutlinedInput-notchedOutline": {
                  borderColor: isDarkMode ? "#6b7280" : "#d1d5db",
                },
              }}
            >
              <MenuItem value="">
                <em>Select Measurand</em>
              </MenuItem>
              {availableMeasurands.map((m) => (
                <MenuItem
                  key={m.MeasurandId}
                  value={m.MeasurandName}
                  sx={{ fontFamily: "Inter" }}
                >
                  {m.MeasurandName}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel
              sx={{
                color: isDarkMode ? "#d1d5db" : "#4b5563",
                fontFamily: "Inter",
              }}
            >
              Color
            </InputLabel>
            <Select
              value={color}
              onChange={handleColorChange}
              label="Color"
              sx={{
                color: isDarkMode ? "#d1d5db" : "#4b5563",
                fontFamily: "Inter",
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: isDarkMode ? "#4b5563" : "#e5e7eb",
                },
                "&:hover .MuiOutlinedInput-notchedOutline": {
                  borderColor: isDarkMode ? "#6b7280" : "#d1d5db",
                },
              }}
            >
              {colorOptions.map((c) => (
                <MenuItem
                  key={c.name}
                  value={c.name}
                  sx={{ fontFamily: "Inter" }}
                >
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <Box
                      sx={{
                        width: 16,
                        height: 16,
                        bgcolor: c.value,
                        borderRadius: "4px",
                        mr: 1,
                      }}
                    />
                    {c.name}
                  </Box>
                </MenuItem>
              ))}
              <MenuItem value="Custom" sx={{ fontFamily: "Inter" }}>
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <Box
                    sx={{
                      width: 16,
                      height: 16,
                      bgcolor: customColor,
                      borderRadius: "4px",
                      mr: 1,
                    }}
                  />
                  Custom
                </Box>
              </MenuItem>
            </Select>
          </FormControl>
          <Box sx={{ mb: 2 }}>
            <Typography
              variant="body2"
              sx={{
                color: isDarkMode ? "#d1d5db" : "#4b5563",
                fontFamily: "Inter",
                mb: 1,
              }}
            >
              Custom Color
            </Typography>
            <input
              type="color"
              value={customColor}
              onChange={handleCustomColorChange}
              style={{
                width: "100%",
                height: "40px",
                border: `1px solid ${isDarkMode ? "#4b5563" : "#e5e7eb"}`,
                borderRadius: "4px",
                cursor: "pointer",
              }}
            />
          </Box>
          <ApplyButton
            onClick={handleApplySelection}
            isDarkMode={isDarkMode}
            fullWidth
          >
            Apply
          </ApplyButton>
        </Box>
      </Sidebar>

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
