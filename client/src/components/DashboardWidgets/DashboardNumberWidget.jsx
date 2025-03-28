import React, { useState, useEffect } from "react";
import { Box, Typography, Paper, Tooltip } from "@mui/material";
import axios from "axios";
import { formatTimestamp } from "./formatTimestamp";

const API_BASE_URL = `${process.env.REACT_APP_API_LOCAL_URL}api`;

const DashboardNumberWidget = ({ data, width, height }) => {
  const [value, setValue] = useState(null);
  const [timestamp, setTimestamp] = useState(null);
  const [isHovered, setIsHovered] = useState(false);
  const settings = data.settings || {};

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
          bgcolor: settings.backgroundColor || "#ffffff",
          borderRadius: settings.borderRadius || "3px",
          border: `${settings.borderWidth || "1px"} solid ${
            settings.borderColor || "#e0e0e0"
          }`,
          transition: "transform 0.2s",
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
            color: settings.titleColor || "#000000",
            fontFamily: settings.titleFontFamily || "inherit",
            fontSize: settings.titleFontSize || "14px",
            fontWeight: settings.titleFontWeight || "normal",
            fontStyle: settings.titleFontStyle || "normal",
            textDecoration: settings.titleTextDecoration || "none",
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
              color: settings.valueColor || "#000000",
              fontFamily: settings.valueFontFamily || "inherit",
              fontWeight: settings.valueFontWeight || "normal",
              fontStyle: settings.valueFontStyle || "normal",
              textDecoration: settings.valueTextDecoration || "none",
              fontSize: settings.valueFontSize || "24px",
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
                color: settings.titleColor || "#000000",
                fontFamily: settings.titleFontFamily || "inherit",
                fontSize: settings.titleFontSize || "14px",
                fontWeight: settings.titleFontWeight || "normal",
                fontStyle: settings.titleFontStyle || "normal",
                textDecoration: settings.titleTextDecoration || "none",
                ml: 1,
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
