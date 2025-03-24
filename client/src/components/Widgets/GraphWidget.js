"use client";

import React, { useEffect, useState, useRef } from "react";
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
import { Snackbar, Alert } from "@mui/material";
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

const GraphPaper = styled(Paper)(({ theme, isDarkMode, isFullscreen }) => ({
  height: isFullscreen ? "100vh" : "100%",
  width: isFullscreen ? "100vw" : "100%",
  padding: theme.spacing(2),
  background: isDarkMode
    ? "linear-gradient(145deg, #2a2a2a 0%, #1f1f1f 100%)"
    : "linear-gradient(145deg, #ffffff 0%, #f1f5f9 100%)",
  borderRadius: isFullscreen ? 0 : "12px",
  border: `1px solid ${isDarkMode ? "#4b5563" : "#d1d5db"}`,
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
}));

const WidgetHeader = styled(Box)(({ theme, isDarkMode }) => ({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  paddingBottom: theme.spacing(1),
  borderBottom: `1px solid ${isDarkMode ? "#6b7280" : "#e5e7eb"}`,
  cursor: "move",
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
    boxShadow: isDarkMode
      ? "0 6px 16px rgba(0, 0, 0, 0.4)"
      : "0 6px 16px rgba(0, 0, 0, 0.15)",
  },
  transition: "all 0.3s ease",
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

const GraphWidget = ({
  title,
  widgetId,
  fetchValue,
  terminalInfo,
  xAxisConfiguration,
  onDelete,
  onOpenProperties,
  availableMeasurands = [],
}) => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === "dark";
  const [isHovered, setIsHovered] = useState(false);
  const [graphData, setGraphData] = useState({});
  const [selectedMeasurands, setSelectedMeasurands] = useState([
    { name: title, color: colorOptions[0] },
  ]);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [measurand, setMeasurand] = useState("");
  const [color, setColor] = useState(colorOptions[0].name);
  const [customColor, setCustomColor] = useState("#000000");
  const chartRef = useRef(null);
  const widgetRef = useRef(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const parsedXAxisConfig = xAxisConfiguration
    ? xAxisConfiguration.split(":").reduce((acc, part, index) => {
        acc[index === 0 ? "type" : "value"] = part;
        return acc;
      }, {})
    : { type: "category", value: "timestamp" };

  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      try {
        const newData = {};
        await Promise.all(
          selectedMeasurands.map(async (measurand) => {
            const fetchedData = await fetchValue(measurand.name);
            newData[measurand.name] = fetchedData;
          })
        );
        if (isMounted) setGraphData((prev) => ({ ...prev, ...newData }));
      } catch (err) {
        console.error("Error fetching graph data:", err);
      }
    };
    if (selectedMeasurands.length > 0) {
      fetchData();
      const interval = setInterval(fetchData, 5000);
      return () => {
        isMounted = false;
        clearInterval(interval);
      };
    }
  }, [fetchValue, selectedMeasurands]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement && isFullscreen) {
        setIsFullscreen(false);
      }
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
      const data = (graphData[measurand.name] || []).map((d) => d.value);
      const pointRadius = data.map((_, index) =>
        index === data.length - 1 ? 5 : 0
      );
      const pointBackgroundColor = data.map((_, index) =>
        index === data.length - 1 ? "red" : measurand.color.value
      );
      return {
        label: measurand.name,
        data,
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
        type: parsedXAxisConfig.type,
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
        title: { display: false },
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
            `${tooltipItem.dataset.label}: ${tooltipItem.raw}`,
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
        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
      },
    },
    animation: {
      duration: 600,
      easing: "easeOutQuart",
      onProgress: (animation) => {
        const chart = animation.chart;
        chart.data.datasets.forEach((dataset) => {
          const lastIndex = dataset.data.length - 1;
          if (lastIndex >= 0)
            dataset.pointRadius[lastIndex] =
              5 * Math.abs(Math.sin(Date.now() / 200));
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
    onDelete(widgetId);
    setDeleteDialogOpen(false);
    setSnackbarMessage("Graph widget deleted successfully");
    setSnackbarSeverity("success");
    setSnackbarOpen(true);
  };

  const toggleFullscreen = () => {
    if (!isFullscreen) {
      widgetRef.current
        .requestFullscreen()
        .then(() => setIsFullscreen(true))
        .catch((err) => console.error("Fullscreen error:", err));
    } else {
      document
        .exitFullscreen()
        .then(() => setIsFullscreen(false))
        .catch((err) => console.error("Exit fullscreen error:", err));
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
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <WidgetHeader
        isDarkMode={isDarkMode}
        className="widget-header"
        sx={{ position: "relative" }}
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
              color: isDarkMode ? "#f3f4f6" : "#1f2937",
              fontWeight: "600",
              fontFamily: "Inter",
              letterSpacing: "0.2px",
            }}
          >
            {title}
          </Typography>
        </Box>
        <ControlButtons
          sx={{ opacity: isHovered || isFullscreen ? 1 : 0, zIndex: 1400 }}
        >
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
                onOpenProperties();
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
          height: isFullscreen ? "calc(100vh - 80px)" : "100%",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <Line
          ref={chartRef}
          data={chartData}
          options={options}
          plugins={[tooltipCrosshairPlugin]}
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
                  key={m.MeasurandName}
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
        message={`Are you sure you want to delete the "${title}" graph widget? This action cannot be undone.`}
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

export default GraphWidget;
