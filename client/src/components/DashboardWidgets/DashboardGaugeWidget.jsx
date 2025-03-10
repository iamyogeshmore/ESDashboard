import React, { useState, useEffect } from "react";
import { Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip as ChartTooltip,
  Legend,
} from "chart.js";
import {
  Card,
  CardContent,
  Typography,
  Box,
  useTheme,
  Tooltip,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import axios from "axios";

ChartJS.register(ArcElement, ChartTooltip, Legend);

// --------------- Base API endpoint from environment variables ---------------
const API_BASE_URL = `${process.env.REACT_APP_API_LOCAL_URL}api`;

const customDefaultWidgetSettings = {
  titleColor: "#000000",
  titleFontFamily: "Georgia",
  titleFontSize: "20px",
  titleFontWeight: "normal",
  titleFontStyle: "normal",
  titleTextDecoration: "none",
  valueColor: "#d0021b",
  valueFontFamily: "Arial",
  valueFontSize: "35px",
  valueFontWeight: "bold",
  valueFontStyle: "normal",
  valueTextDecoration: "none",
  backgroundColor: "#b8e986",
  borderColor: "#417505",
  borderWidth: "3px",
  borderRadius: "3px",
};

// ------------- Styled component for the card with custom settings ------------------
const StyledCard = styled(Card)(({ theme, settings }) => ({
  background: settings?.backgroundColor || theme.palette.background.paper,
  border: `${settings?.borderWidth || "1px"} solid ${
    settings?.borderColor || "#e0e0e0"
  }`,
  borderRadius: settings?.borderRadius || "8px",
  height: "100%",
  display: "flex",
  flexDirection: "column",
}));

// ------------- Styled container for the gauge chart ------------------
const GaugeContainer = styled(Box)({
  position: "relative",
  width: "100%",
  height: "100%",
  padding: "16px",
  flexGrow: 1,
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
});

// ------------- Formats a timestamp into a readable string ------------------
const formatTimestamp = (timestamp) => {
  if (!timestamp) return "No timestamp available";
  const date = new Date(timestamp);
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  const hours = String(date.getUTCHours()).padStart(2, "0");
  const minutes = String(date.getUTCMinutes()).padStart(2, "0");
  const seconds = String(date.getUTCSeconds()).padStart(2, "0");
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};

// ------------- Main component to render a gauge widget on the dashboard ------------------
const DashboardGaugeWidget = ({ data, width, height }) => {
  const theme = useTheme();
  const settings = { ...customDefaultWidgetSettings, ...(data.settings || {}) };
  const [measurementData, setMeasurementData] = useState({
    value: 0,
    timestamp: null,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ------------- Fetches measurement data from the API ------------------
  const fetchMeasurementData = async () => {
    try {
      const { plant, terminal, measurement } = data;
      if (!plant || !terminal || !measurement) {
        throw new Error("Missing required widget configuration");
      }

      const response = await axios.get(
        `${API_BASE_URL}/measurements/${plant}/${terminal}/${measurement}`
      );

      const latestData = response.data[0];
      if (latestData) {
        setMeasurementData({
          value: parseFloat(latestData.MeasurandValue) || 0,
          timestamp: latestData.TimeStamp,
        });
      }
      setError(null);
    } catch (err) {
      console.error("Error fetching measurement data:", err);
      setError("Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  // ------------- Fetches data on mount and periodically every 5 seconds ------------------
  useEffect(() => {
    fetchMeasurementData();
    const interval = setInterval(fetchMeasurementData, 5000);
    return () => clearInterval(interval);
  }, [data.plant, data.terminal, data.measurement]);

  const maxValue = 100;
  const displayValue = measurementData.value;

  const chartData = {
    datasets: [
      {
        data: [displayValue, maxValue - displayValue],
        backgroundColor: [
          displayValue <= 33
            ? theme.palette.success.main
            : displayValue <= 66
            ? theme.palette.warning.main
            : theme.palette.error.main,
          theme.palette.grey[200],
        ],
        borderWidth: 0,
        circumference: 270,
        rotation: 225,
        cutout: "80%",
      },
    ],
  };

  const options = {
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { enabled: false },
    },
    animation: {
      duration: 1000,
      easing: "easeOutQuart",
    },
  };

  const tooltipTitle = `Last sync: ${formatTimestamp(
    measurementData.timestamp
  )}`;

  return (
    <Tooltip title={tooltipTitle} arrow>
      <StyledCard variant="outlined" settings={settings}>
        <CardContent
          sx={{
            height: "100%",
            display: "flex",
            flexDirection: "column",
            padding: 2,
            paddingBottom: 0,
          }}
        >
          <Typography
            color={settings.titleColor}
            sx={{
              fontWeight: settings.titleFontWeight,
              fontSize: settings.titleFontSize,
              fontFamily: settings.titleFontFamily,
              fontStyle: settings.titleFontStyle,
              textDecoration: settings.titleTextDecoration,
              textAlign: "center",
              mb: 1,
            }}
          >
            {data.name || "Energy Meter"}
          </Typography>
          <GaugeContainer>
            <Box sx={{ position: "relative", width: "100%", height: "100%" }}>
              <Doughnut
                data={chartData}
                options={options}
                width={width}
                height={height}
              />
              <Typography
                sx={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  fontSize: settings.valueFontSize,
                  fontWeight: settings.valueFontWeight,
                  color: settings.valueColor,
                  fontFamily: settings.valueFontFamily,
                  fontStyle: settings.valueFontStyle,
                  textDecoration: settings.valueTextDecoration,
                }}
              >
                {loading
                  ? "Loading..."
                  : error
                  ? "Error"
                  : displayValue.toFixed(data.decimals || 1)}
              </Typography>
              <Typography
                sx={{
                  position: "absolute",
                  bottom: "10%",
                  left: "50%",
                  transform: "translateX(-50%)",
                  fontSize: "1rem",
                  color: "text.secondary",
                }}
              >
                {data.unit || "kWh"}
              </Typography>
            </Box>
          </GaugeContainer>
          <Box sx={{ display: "flex", justifyContent: "space-between", mt: 1 }}>
            <Typography color="text.secondary">0</Typography>
            <Typography color="text.secondary">{maxValue}</Typography>
          </Box>
        </CardContent>
      </StyledCard>
    </Tooltip>
  );
};

export default DashboardGaugeWidget;
