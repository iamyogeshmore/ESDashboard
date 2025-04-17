import React, { useState, useEffect } from "react";
import { Box, Typography, Paper, Tooltip } from "@mui/material";
import axios from "axios";
import { formatTimestamp } from "./formatTimestamp";

// ------------------ Base API endpoint from environment variables ------------------
const API_BASE_URL = `${process.env.REACT_APP_API_LOCAL_URL}api`;

const DashboardNumberWidget = ({
  data,
  width,
  height,
  onDelete,
  onSettingsClick,
  isPublished,
}) => {
  const [value, setValue] = useState(null);
  const [timestamp, setTimestamp] = useState(null);
  const [isHovered, setIsHovered] = useState(false);
  const settings = data.settings || {};

  // ----------------------- Fetch Data Effect ---------------------
  useEffect(() => {
    const fetchData = async () => {
      try {
        const { plantId, terminalId, measurandId } = data;
        if (!plantId || !terminalId || !measurandId) {
          setValue(null);
          return;
        }

        const response = await axios.get(
          `${API_BASE_URL}/measurements/${plantId}/${terminalId}/${measurandId}`
        );
        const latestData = response.data[response.data.length - 1];
        setValue(
          latestData &&
            latestData.MeasurandValue !== undefined &&
            latestData.MeasurandValue !== null
            ? parseFloat(latestData.MeasurandValue)
            : null
        );
        setTimestamp(latestData?.TimeStamp || null);
      } catch (error) {
        console.error("Error fetching measurement data:", error.message);
        setValue(null);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, [data.plantId, data.terminalId, data.measurandId]);

  const tooltipTitle = timestamp
    ? `Last updated: ${formatTimestamp(timestamp)}`
    : "No data available";

  const displayValue =
    value === null || value === undefined
      ? "N/A"
      : value.toFixed(data.decimals);

  return (
    <Tooltip title={tooltipTitle} arrow>
      <Paper
        elevation={3}
        sx={{
          height: "100%",
          width: "100%",
          minHeight: "80px",
          minWidth: "120px",
          textAlign: "center",
          bgcolor:
            settings.backgroundColor ||
            "linear-gradient(135deg, #ffffff 0%, #f5f7fa 100%)",
          borderRadius: settings.borderRadius || "12px",
          border: `${settings.borderWidth || "1px"} solid ${
            settings.borderColor || "#e0e0e0"
          }`,
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
          transition: "transform 0.2s ease, box-shadow 0.2s ease",
          display: "flex",
          flexDirection: "column",
          padding: "8px",
          boxSizing: "border-box",
          "&:hover": {
            boxShadow: "0 6px 20px rgba(0, 0, 0, 0.1)",
          },
          "&:hover .control-buttons": {
            opacity: !isPublished ? 1 : 0,
          },
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Header with Title and Icons */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            width: "100%",
            mb: 1,
          }}
        >
          <Typography
            variant="subtitle1"
            sx={{
              color: settings.titleColor || "#2c3e50",
              fontFamily: settings.titleFontFamily || "'Roboto', sans-serif",
              fontSize: settings.titleFontSize || "clamp(12px, 2vw, 16px)",
              fontWeight: settings.titleFontWeight || 600,
              fontStyle: settings.titleFontStyle || "normal",
              textDecoration: settings.titleTextDecoration || "none",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              flexGrow: 1,
              textAlign: "center",
            }}
          >
            {data.name}
          </Typography>
        </Box>

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 1,
            flexWrap: "wrap",
            flexGrow: 1,
          }}
        >
          <Typography
            sx={{
              color: settings.valueColor || "#34495e",
              fontFamily:
                settings.valueFontFamily || "'Roboto Mono', monospace",
              fontWeight: settings.valueFontWeight || 700,
              fontStyle: settings.valueFontStyle || "normal",
              fontSize: settings.valueFontSize || "16px",
              textDecoration: settings.valueTextDecoration || "none",
            }}
          >
            {displayValue}
          </Typography>
          {data.unit && value !== null && value !== undefined && (
            <Typography
              sx={{
                color: settings.titleColor || "#2c3e50",
                fontFamily: settings.titleFontFamily || "'Roboto', sans-serif",
                fontSize: settings.titleFontSize || "12px",
                fontWeight: settings.titleFontWeight || 600,
                fontStyle: settings.titleFontStyle || "normal",
                textDecoration: settings.titleTextDecoration || "none",
                letterSpacing: "0.5px",
              }}
            >
              {data.unit}
            </Typography>
          )}
        </Box>
      </Paper>
    </Tooltip>
  );
};

export default DashboardNumberWidget;
