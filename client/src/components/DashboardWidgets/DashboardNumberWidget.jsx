import React, { useState, useEffect } from "react";
import { Box, Typography, Paper, Tooltip } from "@mui/material";
import axios from "axios";

const API_BASE_URL = `${process.env.REACT_APP_API_LOCAL_URL}api`;

const customDefaultWidgetSettings = {
  backgroundColor: "#cff7ba",
  borderColor: "#417505",
  borderRadius: "3px",
  borderWidth: "1px",
  titleColor: "#000000",
  titleFontFamily: "Georgia",
  titleFontSize: "14px",
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

// Simply return the raw timestamp as received from API
const formatTimestamp = (timestamp) => {
  return timestamp || "No timestamp available";
};

const DashboardNumberWidget = ({ data, width, height }) => {
  const [value, setValue] = useState(null);
  const [timestamp, setTimestamp] = useState(null);
  const [unit, setUnit] = useState(data.unit || ""); // Initialize with data.unit or empty
  const [isHovered, setIsHovered] = useState(false);
  const settings = { ...customDefaultWidgetSettings, ...(data.settings || {}) };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          `${API_BASE_URL}/measurements/${data.plant}/${data.terminal}/${data.measurement}`
        );
        const latestData = response.data[response.data.length - 1];
        setValue(parseFloat(latestData.MeasurandValue) || 0);
        setTimestamp(latestData.TimeStamp);
        setUnit(latestData.Unit || data.unit || ""); // Fallback to API unit
      } catch (error) {
        console.error("Error fetching measurement data:", error);
        setValue(0);
        setTimestamp(null);
        setUnit(data.unit || ""); // Reset to data.unit or empty on error
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
          {unit && (
            <Typography
              sx={{
                ml: 1,
                color: "text.secondary",
                fontSize: "clamp(10px, 2vw, 16px)",
              }}
            >
              {unit} {/* Display API-provided unit */}
            </Typography>
          )}
        </Box>
      </Paper>
    </Tooltip>
  );
};

export default DashboardNumberWidget;
