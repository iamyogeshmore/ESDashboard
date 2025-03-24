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

const API_BASE_URL = `${process.env.REACT_APP_API_LOCAL_URL}api`;

const customDefaultWidgetSettings = {
  backgroundColor: "#cff7ba",
  borderColor: "#417505",
  borderRadius: "3px",
  borderWidth: "1px",
  titleColor: "#000000",
  titleFontFamily: "Georgia",
  titleFontSize: "24px",
  titleFontStyle: "normal",
  titleFontWeight: "normal",
  titleTextDecoration: "none",
  valueColor: "#d0021b",
  valueFontFamily: "Arial",
  valueFontSize: "24px",
  valueFontStyle: "normal",
  valueFontWeight: "bold",
  valueTextDecoration: "none",
};

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

const formatTimestamp = (timestamp) => {
  return timestamp || "No timestamp available";
};

const DashboardGaugeWidget = ({ data, width, height }) => {
  const theme = useTheme();
  const settings = { ...customDefaultWidgetSettings, ...(data.settings || {}) };
  const [measurementData, setMeasurementData] = useState({
    value: 0, // Start with 0 or a default value
    timestamp: null,
    unit: data.unit || "",
  });
  const [error, setError] = useState(null);

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
          unit: latestData.Unit || data.unit || "",
        });
      }
      setError(null);
    } catch (err) {
      console.error("Error fetching measurement data:", err);
      setError("Failed to fetch data");
      // Optionally keep the last value instead of resetting
    }
  };

  useEffect(() => {
    fetchMeasurementData(); // Initial fetch
    const interval = setInterval(fetchMeasurementData, 5000); // Poll every 5 seconds for live updates
    return () => clearInterval(interval);
  }, [data.plant, data.terminal, data.measurement]);

  const minValue = data.minRange || 0;
  const maxValue = data.maxRange || 100;
  const displayValue = Math.max(
    minValue,
    Math.min(maxValue, measurementData.value)
  );
  const range = maxValue - minValue;
  const gaugeValue = ((displayValue - minValue) / range) * 100;

  const ranges = data.ranges || [
    { start: minValue, end: minValue + range / 3, color: "#ff5252" },
    {
      start: minValue + range / 3,
      end: minValue + (2 * range) / 3,
      color: "#ffeb3b",
    },
    { start: minValue + (2 * range) / 3, end: maxValue, color: "#4caf50" },
  ];

  const getGaugeColor = () => {
    for (const range of ranges) {
      if (displayValue >= range.start && displayValue <= range.end) {
        return range.color;
      }
    }
    return settings.gaugeColor || "#1976d2";
  };

  const chartData = {
    datasets: [
      {
        data: [gaugeValue, 100 - gaugeValue],
        backgroundColor: [getGaugeColor(), theme.palette.grey[200]],
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
  )}\nMin Range: ${minValue}\nMax Range: ${maxValue}`;

  return (
    <Tooltip title={<pre>{tooltipTitle}</pre>} arrow>
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
              color: settings.titleColor,
          
              textAlign: "center",
              mb: 1,
            }}
          >
            {data.name || "Gauge Widget"}
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
                {error ? "Error" : displayValue.toFixed(data.decimals || 1)}
              </Typography>
              <Typography
                sx={{
                  position: "absolute",
                  bottom: "10%",
                  left: "50%",
                  transform: "translateX(-50%)",
                  fontWeight: settings.titleFontWeight,
                  fontSize: settings.titleFontSize,
                  fontFamily: settings.titleFontFamily,
                  fontStyle: settings.titleFontStyle,
                  textDecoration: settings.titleTextDecoration,
                  color: settings.titleColor,
                }}
              >
                {measurementData.unit}
              </Typography>
            </Box>
          </GaugeContainer>
        </CardContent>
      </StyledCard>
    </Tooltip>
  );
};

export default DashboardGaugeWidget;
