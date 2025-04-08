import React, { useState, useEffect, useCallback } from "react";
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
import { formatTimestamp } from "./formatTimestamp";

ChartJS.register(ArcElement, ChartTooltip, Legend);

// ------------------ Base API endpoint from environment variables ------------------
const API_BASE_URL = `${process.env.REACT_APP_API_LOCAL_URL}api`;

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

const DashboardGaugeWidget = ({ data, width, height }) => {
  const theme = useTheme();
  const settings = data.settings || {};
  const [measurementData, setMeasurementData] = useState({
    value: null,
    timestamp: null,
  });

  // ----------------------- Fetch Measurement Data ---------------------
  const fetchMeasurementData = useCallback(async () => {
    try {
      const { plantId, terminalId, measurandId } = data;
      if (!plantId || !terminalId || !measurandId) {
        setMeasurementData({ value: null, timestamp: null });
        return;
      }

      const response = await axios.get(
        `${API_BASE_URL}/measurements/${plantId}/${terminalId}/${measurandId}`
      );

      const latestData = response.data[0];
      setMeasurementData({
        value:
          latestData &&
          latestData.MeasurandValue !== undefined &&
          latestData.MeasurandValue !== null
            ? parseFloat(latestData.MeasurandValue)
            : null,
        timestamp: latestData?.TimeStamp || null,
      });
    } catch (err) {
      console.error("Error fetching measurement data:", err.message);
      setMeasurementData((prev) => ({ ...prev, value: null }));
    }
  }, [data]);

  // ----------------------- Get Gauge Color ---------------------
  const getGaugeColor = () => {
    if (!isNumeric) return settings.gaugeColor || "#1976d2";
    for (const range of ranges) {
      if (displayValue >= range.start && displayValue <= range.end) {
        return range.color;
      }
    }
    return settings.gaugeColor || "#1976d2";
  };

  useEffect(() => {
    fetchMeasurementData();
    const interval = setInterval(fetchMeasurementData, 5000);
    return () => clearInterval(interval);
  }, [fetchMeasurementData]);

  const minValue = data.minRange || 0;
  const maxValue = data.maxRange || 100;

  const displayValue =
    measurementData.value === null || measurementData.value === undefined
      ? "N/A"
      : measurementData.value;
  const isNumeric = typeof displayValue === "number";

  // Calculate gaugeValue for visualization, still respecting min/max for the gauge arc
  const gaugeValue = isNumeric
    ? Math.max(
        0,
        Math.min(
          100,
          ((Math.max(minValue, Math.min(maxValue, displayValue)) - minValue) /
            (maxValue - minValue)) *
            100
        )
      )
    : 0;

  const ranges = data.ranges || [
    {
      start: minValue,
      end: minValue + (maxValue - minValue) / 3,
      color: "#ff5252",
    },
    {
      start: minValue + (maxValue - minValue) / 3,
      end: minValue + (2 * (maxValue - minValue)) / 3,
      color: "#ffeb3b",
    },
    {
      start: minValue + (2 * (maxValue - minValue)) / 3,
      end: maxValue,
      color: "#4caf50",
    },
  ];

  const chartData = {
    datasets: [
      {
        data: [isNumeric ? gaugeValue : 0, isNumeric ? 100 - gaugeValue : 100],
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

  const tooltipTitle = measurementData.timestamp
    ? `Last sync: ${formatTimestamp(
        measurementData.timestamp
      )}\nMin Range: ${minValue}\nMax Range: ${maxValue}\nActual Value: ${displayValue}`
    : "No timestamp available";

  return (
    <Tooltip title={<pre>{tooltipTitle}</pre>} arrow>
      <StyledCard variant="outlined" settings={settings}>
        <CardContent
          sx={{
            height: "100%",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Typography
            sx={{
              fontWeight: settings.titleFontWeight || "normal",
              fontSize: settings.titleFontSize || "14px",
              fontFamily: settings.titleFontFamily || "inherit",
              fontStyle: settings.titleFontStyle || "normal",
              textDecoration: settings.titleTextDecoration || "none",
              color: settings.titleColor || "#000000",
              textAlign: "center",
            }}
          >
            {data.name}
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
                  fontSize: settings.valueFontSize || "24px",
                  fontWeight: settings.valueFontWeight || "normal",
                  color: settings.valueColor || "#000000",
                  fontFamily: settings.valueFontFamily || "inherit",
                  fontStyle: settings.valueFontStyle || "normal",
                  textDecoration: settings.valueTextDecoration || "none",
                }}
              >
                {isNumeric
                  ? displayValue.toFixed(data.decimals || 1)
                  : displayValue}
              </Typography>
              {data.unit && isNumeric && (
                <Typography
                  sx={{
                    position: "absolute",
                    bottom: "10%",
                    left: "50%",
                    transform: "translateX(-50%)",
                    fontWeight: settings.titleFontWeight || "normal",
                    fontSize: settings.titleFontSize || "14px",
                    fontFamily: settings.titleFontFamily || "inherit",
                    fontStyle: settings.titleFontStyle || "normal",
                    textDecoration: settings.titleTextDecoration || "none",
                    color: settings.titleColor || "#000000",
                  }}
                >
                  {data.unit}
                </Typography>
              )}
            </Box>
          </GaugeContainer>
        </CardContent>
      </StyledCard>
    </Tooltip>
  );
};

export default DashboardGaugeWidget;
