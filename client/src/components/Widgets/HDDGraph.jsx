import React, { useState, useRef, useContext } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
} from "@mui/material";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import zoomPlugin from "chartjs-plugin-zoom";
import CloseIcon from "@mui/icons-material/Close";
import ZoomInIcon from "@mui/icons-material/ZoomIn";
import ZoomOutIcon from "@mui/icons-material/ZoomOut";
import FullscreenIcon from "@mui/icons-material/Fullscreen";
import FullscreenExitIcon from "@mui/icons-material/FullscreenExit";
import { ThemeContext } from "../../contexts/ThemeContext";

// ------------------ Register ChartJS components and plugins ------------------
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  zoomPlugin
);

const formatTimestamp = (timestamp) => {
  if (!timestamp) return "No timestamp available";
  const date = new Date(timestamp);
  return date.toLocaleString("en-US", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false, 
    timeZone: "UTC",
  });
};

const GraphComponent = ({
  data,
  measurand,
  open,
  onClose,
  allMeasurands,
  allData,
}) => {
  const { isDarkMode } = useContext(ThemeContext);
  const [selectedMeasurands, setSelectedMeasurands] = useState([measurand]);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const chartRef = useRef(null);

  // ------------------ Theme-aware color definitions ------------------
  const colors = [
    {
      border: isDarkMode ? "#64b5f6" : "#1976d2",
      background: isDarkMode
        ? "rgba(100, 181, 246, 0.15)"
        : "rgba(25, 118, 210, 0.1)",
    },
    {
      border: isDarkMode ? "#f06292" : "#d81b60",
      background: isDarkMode
        ? "rgba(240, 98, 146, 0.15)"
        : "rgba(216, 27, 96, 0.1)",
    },
    {
      border: isDarkMode ? "#81c784" : "#2e7d32",
      background: isDarkMode
        ? "rgba(129, 199, 132, 0.15)"
        : "rgba(46, 125, 50, 0.1)",
    },
    {
      border: isDarkMode ? "#ffb300" : "#ef6c00",
      background: isDarkMode
        ? "rgba(255, 179, 0, 0.15)"
        : "rgba(239, 108, 0, 0.1)",
    },
  ];

  // ------------------ Handler for measurand selection change ------------------
  const handleMeasurandChange = (event) => {
    setSelectedMeasurands(event.target.value);
  };

  // ------------------ Generate sorted unique timestamps ------------------
  const allTimestamps = [
    ...new Set(
      Object.values(allData)
        .flat()
        .map((item) => item.timestamp)
    ),
  ].sort();

  // ------------------ Chart data configuration ------------------
  const chartData = {
    labels: allTimestamps,
    datasets: selectedMeasurands.map((m, index) => ({
      label: m,
      data: allTimestamps.map((ts) => {
        const dataPoint = allData[m]?.find((d) => d.timestamp === ts);
        return dataPoint ? dataPoint.value : null;
      }),
      borderColor: colors[index % colors.length].border,
      backgroundColor: colors[index % colors.length].background,
      fill: true,
      tension: 0.4,
      borderWidth: 1.5,
      pointRadius: 0,
      pointHoverRadius: 5,
      pointBackgroundColor: colors[index % colors.length].border,
      pointBorderColor: isDarkMode ? "#fff" : "#fff",
      pointBorderWidth: 2,
    })),
  };

  // ------------------ Chart options configuration ------------------
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
        labels: {
          boxWidth: 15,
          padding: 20,
          font: { size: 14, weight: "500" },
          color: isDarkMode ? "#e0e0e0" : "#424242",
          usePointStyle: true,
          pointStyle: "rectRounded",
        },
      },
      tooltip: {
        mode: "index",
        intersect: false,
        backgroundColor: isDarkMode
          ? "rgba(33, 33, 33, 0.95)"
          : "rgba(50, 50, 50, 0.9)",
        titleFont: { size: 14, weight: "bold" },
        bodyFont: { size: 12 },
        padding: 12,
        cornerRadius: 6,
        borderWidth: 1,
        borderColor: isDarkMode ? "#616161" : "#bdbdbd",
        boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
        callbacks: {
          title: (tooltipItems) => {
            if (tooltipItems.length > 0) {
              return formatTimestamp(tooltipItems[0].label);
            }
            return "";
          },
        },
      },

      zoom: {
        zoom: { wheel: { enabled: true }, pinch: { enabled: true }, mode: "x" },
        pan: { enabled: true, mode: "x" },
      },
    },
    scales: {
      x: {
        title: { display: false },
        ticks: {
          maxRotation: 45,
          minRotation: 45,
          maxTicksLimit: 10,
          color: isDarkMode ? "#b0bec5" : "#455a64",
          font: { size: 12 },
        },
        grid: {
          color: isDarkMode
            ? "rgba(255, 255, 255, 0.05)"
            : "rgba(0, 0, 0, 0.05)",
          borderColor: isDarkMode ? "#424242" : "#e0e0e0",
          drawBorder: true,
        },
      },
      y: {
        title: { display: false },
        ticks: {
          color: isDarkMode ? "#b0bec5" : "#455a64",
          font: { size: 12 },
          padding: 10,
          maxTicksLimit: 8,
          stepSize: null,
        },
        grid: {
          color: isDarkMode
            ? "rgba(255, 255, 255, 0.05)"
            : "rgba(0, 0, 0, 0.05)",
          borderColor: isDarkMode ? "#424242" : "#e0e0e0",
          drawBorder: true,
        },
      },
    },
    animation: {
      duration: 800,
      easing: "easeInOutQuart",
    },
    hover: {
      mode: "nearest",
      intersect: true,
    },
  };

  // ------------------ Zoom in function ------------------
  const zoomIn = () => {
    if (chartRef.current) chartRef.current.zoom(1.1);
  };

  // ------------------ Zoom out function ------------------
  const zoomOut = () => {
    if (chartRef.current) chartRef.current.zoom(0.9);
  };

  // ------------------ Reset zoom function ------------------
  const resetZoom = () => {
    if (chartRef.current) chartRef.current.resetZoom();
  };

  // ------------------ Toggle fullscreen mode ------------------
  const toggleFullScreen = () => {
    setIsFullScreen(!isFullScreen);
  };

  // ------------------ Main render function ------------------
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={isFullScreen ? false : "lg"}
      fullWidth={!isFullScreen}
      fullScreen={isFullScreen}
      sx={{
        "& .MuiDialog-paper": {
          background: isDarkMode
            ? "linear-gradient(145deg, #212121 0%, #303030 100%)"
            : "linear-gradient(145deg, #fafafa 0%, #ffffff 100%)",
          boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
          borderRadius: isFullScreen ? 0 : "12px",
          border: isDarkMode ? "1px solid #424242" : "1px solid #e0e0e0",
          ...(isFullScreen && {
            margin: 0,
            width: "100%",
            height: "100%",
            maxHeight: "100vh",
          }),
          transition: "all 0.3s ease-in-out",
        },
      }}
    >
      {/* ------------------ Dialog title with controls ------------------ */}
      <DialogTitle
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: isDarkMode
            ? "linear-gradient(90deg, #0288d1 0%, #0277bd 100%)"
            : "linear-gradient(90deg, #1976d2 0%, #1565c0 100%)",
          color: "#fff",
          padding: "10px 20px",
          borderTopLeftRadius: isFullScreen ? 0 : "12px",
          borderTopRightRadius: isFullScreen ? 0 : "12px",
          boxShadow: "0 2px 10px rgba(0,0,0,0.15)",
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Trend Analysis
        </Typography>
        <Box sx={{ display: "flex", gap: 0.5 }}>
          <IconButton
            onClick={zoomIn}
            title="Zoom In"
            sx={{
              color: "#fff",
              "&:hover": { backgroundColor: "rgba(255, 255, 255, 0.15)" },
              padding: "6px",
            }}
          >
            <ZoomInIcon fontSize="small" />
          </IconButton>
          <IconButton
            onClick={zoomOut}
            title="Zoom Out"
            sx={{
              color: "#fff",
              "&:hover": { backgroundColor: "rgba(255, 255, 255, 0.15)" },
              padding: "6px",
            }}
          >
            <ZoomOutIcon fontSize="small" />
          </IconButton>
          <IconButton
            onClick={resetZoom}
            title="Reset Zoom"
            sx={{
              color: "#fff",
              "&:hover": { backgroundColor: "rgba(255, 255, 255, 0.15)" },
              padding: "6px",
            }}
          >
            <ZoomOutIcon fontSize="small" />
          </IconButton>
          <IconButton
            onClick={toggleFullScreen}
            title={isFullScreen ? "Exit Fullscreen" : "Fullscreen"}
            sx={{
              color: "#fff",
              "&:hover": { backgroundColor: "rgba(255, 255, 255, 0.15)" },
              padding: "6px",
            }}
          >
            {isFullScreen ? (
              <FullscreenExitIcon fontSize="small" />
            ) : (
              <FullscreenIcon fontSize="small" />
            )}
          </IconButton>
          <IconButton
            onClick={onClose}
            sx={{
              color: "#fff",
              "&:hover": { backgroundColor: "rgba(255, 255, 255, 0.15)" },
              padding: "6px",
            }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>
      </DialogTitle>

      {/* ------------------ Dialog content with measurand selector and graph ------------------ */}
      <DialogContent
        sx={{
          padding: "20px",
          backgroundColor: isDarkMode ? "#181818" : "#f7f7f7",
        }}
      >
        <Box sx={{ mt: 2, mb: 3 }}>
          <FormControl
            fullWidth
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: "8px",
                backgroundColor: isDarkMode ? "#2c2c2c" : "#ffffff",
                "&:hover fieldset": {
                  borderColor: isDarkMode ? "#64b5f6" : "#1976d2",
                },
                "&.Mui-focused fieldset": {
                  borderColor: isDarkMode ? "#64b5f6" : "#1976d2",
                },
              },
            }}
          >
            <InputLabel
              sx={{
                color: isDarkMode ? "#b0bec5" : "#455a64",
                fontWeight: 500,
                "&.Mui-focused": { color: isDarkMode ? "#e0e0e0" : "#1976d2" },
              }}
            >
              Compare Measurands
            </InputLabel>
            <Select
              multiple
              value={selectedMeasurands}
              onChange={handleMeasurandChange}
              label="Compare Measurands"
              renderValue={(selected) => selected.join(", ")}
              sx={{
                color: isDarkMode ? "#e0e0e0" : "#424242",
                boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
                "& .MuiSelect-select": { padding: "10px 14px" },
              }}
            >
              {allMeasurands.map((m) => (
                <MenuItem
                  key={m}
                  value={m}
                  sx={{ color: isDarkMode ? "#e0e0e0" : "#424242" }}
                >
                  <Checkbox
                    checked={selectedMeasurands.includes(m)}
                    sx={{ color: isDarkMode ? "#64b5f6" : "#1976d2" }}
                  />
                  {m}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
        <Box
          sx={{
            height: isFullScreen ? "calc(100vh - 160px)" : 480,
            width: "100%",
            backgroundColor: isDarkMode ? "#212121" : "#ffffff",
            borderRadius: "12px",
            boxShadow: "0 6px 20px rgba(0,0,0,0.15)",
            padding: "20px",
            border: isDarkMode ? "1px solid #333" : "1px solid #e0e0e0",
          }}
        >
          <Line ref={chartRef} data={chartData} options={options} />
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default GraphComponent;
