import React, { useState, useEffect } from "react";
import { Box, Typography, Paper, Tooltip } from "@mui/material";

import axios from "axios";

// --------------- Base API endpoint from environment variables ---------------
const API_BASE_URL = `${process.env.REACT_APP_API_LOCAL_URL}api`;

const customDefaultWidgetSettings = {
  titleColor: "#000000",
  titleFontFamily: "Georgia",
  titleFontSize: "25px",
  titleFontWeight: "normal",
  titleFontStyle: "normal",
  titleTextDecoration: "none",
  valueColor: "#d0021b",
  valueFontFamily: "Arial",
  valueFontSize: "39px",
  valueFontWeight: "bold",
  valueFontStyle: "normal",
  valueTextDecoration: "none",
  backgroundColor: "#b8e986",
  borderColor: "#417505",
  borderWidth: "3px",
  borderRadius: "3px",
};

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

// ------------- Main component to render a number widget on the dashboard ------------------
const DashboardNumberWidget = ({ data, width, height }) => {
  const [value, setValue] = useState(null);
  const [timestamp, setTimestamp] = useState(null);
  const [isHovered, setIsHovered] = useState(false);
  const settings = { ...customDefaultWidgetSettings, ...(data.settings || {}) };

  // ------------- Fetches measurement data periodically every 5 seconds ------------------
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          `${API_BASE_URL}/measurements/${data.plant}/${data.terminal}/${data.measurement}`
        );
        const latestData = response.data[response.data.length - 1];
        setValue(parseFloat(latestData.MeasurandValue) || 0);
        setTimestamp(latestData.TimeStamp);
      } catch (error) {
        console.error("Error fetching measurement data:", error);
        setValue(0);
        setTimestamp(null);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 5000);

    return () => clearInterval(interval);
  }, [data.plant, data.terminal, data.measurement]);

  const tooltipTitle = `Last sync: ${formatTimestamp(timestamp)}`;

  return (
    <Tooltip title={tooltipTitle} arrow>
      <Paper
        elevation={2}
        sx={{
          height: "100%",
          width: "100%",
          minHeight: "120px",
          minWidth: "150px",
          p: 2,
          textAlign: "center",
          bgcolor: settings.backgroundColor,
          borderRadius: settings.borderRadius,
          border: `${settings.borderWidth} solid ${settings.borderColor}`,
          transition: "transform 0.2s",
          "&:hover": { transform: "scale(1.02)" },
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          position: "relative",
          overflow: "hidden",
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <Typography
          variant="subtitle2"
          sx={{
            color: settings.titleColor,
            fontFamily: settings.titleFontFamily,
            fontSize: settings.titleFontSize,
            fontWeight: settings.titleFontWeight,
            fontStyle: settings.titleFontStyle,
            textDecoration: settings.titleTextDecoration,
            wordBreak: "break-word",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {data.name}
        </Typography>
        <Box sx={{ flexShrink: 0 }}>
          <Box
            className="widget-header"
            sx={{
              cursor: "move",
              mb: 1,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              position: "relative",
            }}
          >
            <Box
              sx={{
                position: "absolute",
                right: -8,
                top: -8,
                opacity: isHovered ? 1 : 0,
                transition: "opacity 0.3s ease",
                display: "flex",
                gap: 0.5,
              }}
            ></Box>
          </Box>
        </Box>
        <Box
          sx={{
            flexGrow: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
          }}
        >
          <Typography
            sx={{
              color: settings.valueColor,
              fontFamily: settings.valueFontFamily,
              fontWeight: settings.valueFontWeight,
              fontStyle: settings.valueFontStyle,
              textDecoration: settings.valueTextDecoration,
              fontSize: settings.valueFontSize,
              wordBreak: "break-word",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              maxWidth: "100%",
            }}
          >
            {value !== null ? value.toFixed(data.decimals || 2) : "Loading..."}
          </Typography>
          {data.unit && (
            <Typography
              sx={{
                ml: 1,
                color: "text.secondary",
                fontSize: "clamp(10px, 2vw, 16px)",
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
