"use client";

import React, { useEffect, useState, useMemo, useRef } from "react";
import {
  Box,
  Typography,
  Paper,
  IconButton,
  useTheme,
  Tooltip,
  Menu,
  MenuItem,
} from "@mui/material";
import {
  MoreVert as MoreVertIcon,
  Settings as SettingsIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";
import DeleteConfirmationDialog from "../DeleteConfirmationDialog";

const formatTimestamp = (timestamp) => {
  if (!timestamp) return "No timestamp available";
  const date = new Date(timestamp);
  return date.toLocaleString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
    timeZone: "Asia/Kolkata",
  });
};

const customDefaultWidgetSettings = {
  backgroundColor: "#334155",
  borderColor: "#94A3B8",
  borderRadius: "3px",
  borderWidth: "2px",
  titleColor: "#E2E8F0",
  titleFontFamily: "Arial",
  titleFontSize: "20px",
  titleFontStyle: "normal",
  titleFontWeight: "normal",
  titleTextDecoration: "none",
  valueColor: "#FFFFFF",
  valueFontFamily: "Arial",
  valueFontSize: "30px",
  valueFontStyle: "normal",
  valueFontWeight: "bold",
};

const NumberWidget = ({
  title,
  widgetId,
  fetchValue,
  terminalName,
  measurandName,
  value: externalValue,
  timestamp: externalTimestamp,
  unit,
  onDelete,
  onOpenProperties,
  ...initialProperties
}) => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === "dark";
  const [isHovered, setIsHovered] = useState(false);
  const [internalValue, setInternalValue] = useState(null);
  const [internalTimestamp, setInternalTimestamp] = useState(null);
  const [internalUnit, setInternalUnit] = useState(unit || "");
  const [error, setError] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const menuButtonRef = useRef(null);

  const styles = useMemo(() => {
    const storedSettings = widgetId
      ? localStorage.getItem(`widgetSettings_${widgetId}`)
      : null;
    const baseStyles = {
      ...customDefaultWidgetSettings,
      ...(storedSettings ? JSON.parse(storedSettings) : {}),
      ...initialProperties,
    };
    return isDarkMode
      ? {
          ...baseStyles,
          titleColor: baseStyles.titleColor,
          valueColor: baseStyles.valueColor,
          backgroundColor: baseStyles.backgroundColor,
          borderColor: baseStyles.borderColor,
        }
      : baseStyles;
  }, [widgetId, initialProperties, isDarkMode]);

  useEffect(() => {
    if (!fetchValue || externalValue !== undefined) return;

    let isMounted = true;
    const controller = new AbortController();

    const loadValue = async () => {
      try {
        const fetchedData = await fetchValue({ signal: controller.signal });
        if (isMounted) {
          if (
            fetchedData.message === "No measurement data found" ||
            fetchedData.value === null ||
            fetchedData.value === undefined ||
            isNaN(fetchedData.value)
          ) {
            setInternalValue("N/A");
            setInternalTimestamp(fetchedData.timestamp || null);
            setInternalUnit(fetchedData.unit || "");
            setError(null);
          } else {
            setInternalValue(fetchedData.value);
            setInternalTimestamp(fetchedData.timestamp);
            setInternalUnit(fetchedData.unit || "");
            setError(null);
          }
        }
      } catch (err) {
        if (!controller.signal.aborted) {
          setError("Failed to fetch value");
          console.error("Error fetching value:", err);
        }
      }
    };

    loadValue();
    const interval = setInterval(loadValue, 5000); // Changed to 5 seconds

    return () => {
      isMounted = false;
      controller.abort();
      clearInterval(interval);
    };
  }, [fetchValue]);

  const displayValue =
    externalValue !== undefined ? externalValue : internalValue;
  const displayTimestamp =
    externalTimestamp !== undefined ? externalTimestamp : internalTimestamp;
  const displayUnit = unit !== undefined ? unit : internalUnit;
  const tooltipTitle = `Last sync: ${formatTimestamp(displayTimestamp)}`;

  const handleMenuClick = (event) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => {
    setAnchorEl(null);
    menuButtonRef.current?.focus();
  };
  const handleDeleteClick = () => {
    setDeleteDialogOpen(true);
    handleMenuClose();
  };
  const handleDeleteConfirm = () => {
    onDelete(widgetId || title);
    setDeleteDialogOpen(false);
  };
  const handleDeleteCancel = () => setDeleteDialogOpen(false);

  return (
    <Tooltip title={tooltipTitle} arrow>
      <Paper
        elevation={2}
        sx={{
          height: "100%",
          width: "100%",
          minHeight: "100px",
          minWidth: "120px",
          p: 2,
          textAlign: "center",
          bgcolor: styles.backgroundColor,
          borderRadius: styles.borderRadius,
          border: `${styles.borderWidth} solid ${styles.borderColor}`,
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
            <Typography
              variant="subtitle2"
              sx={{
                mb: 1,
                color: styles.titleColor,
                fontFamily: styles.titleFontFamily,
                fontSize: styles.titleFontSize,
                fontWeight: styles.titleFontWeight,
                fontStyle: styles.titleFontStyle,
                textDecoration: styles.titleTextDecoration,
                wordBreak: "break-word",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {terminalName || title || "Unknown Terminal"}
            </Typography>
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
            >
              <IconButton
                onClick={handleMenuClick}
                ref={menuButtonRef}
                sx={{
                  bgcolor: isDarkMode
                    ? "rgba(66,66,66,0.8)"
                    : "rgba(255,255,255,0.7)",
                  "&:hover": {
                    bgcolor: isDarkMode
                      ? "rgba(97,97,97,0.9)"
                      : "rgba(225,225,225,0.9)",
                  },
                }}
                aria-label="More options"
              >
                <MoreVertIcon
                  sx={{
                    fontSize: "0.90rem",
                    color: isDarkMode ? "#e0e0e0" : "#757575",
                  }}
                />
              </IconButton>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
                MenuListProps={{
                  "aria-labelledby": "more-options-button",
                }}
              >
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
                      color: isDarkMode ? "#e0e0e0" : "#757575",
                    }}
                  />
                  Settings
                </MenuItem>
                <MenuItem onClick={handleDeleteClick}>
                  <DeleteIcon
                    sx={{
                      fontSize: "0.75rem",
                      mr: 1,
                      color: isDarkMode ? "#ef5350" : "#d32f2f",
                    }}
                  />
                  Delete
                </MenuItem>
              </Menu>
            </Box>
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
              color: styles.valueColor,
              fontFamily: styles.valueFontFamily,
              fontWeight: styles.valueFontWeight,
              fontStyle: styles.valueFontStyle,
              textDecoration: styles.valueTextDecoration,
              fontSize: styles.valueFontSize,
              wordBreak: "break-word",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              maxWidth: "100%",
            }}
          >
            {error
              ? "Error"
              : displayValue === "N/A"
              ? "N/A"
              : displayValue !== null && displayValue !== undefined
              ? `${displayValue.toFixed(styles.decimalPlaces || 2)} ${
                  displayUnit || ""
                }`
              : "N/A"}
          </Typography>
        </Box>

        <DeleteConfirmationDialog
          open={deleteDialogOpen}
          onClose={handleDeleteCancel}
          onConfirm={handleDeleteConfirm}
          title="Confirm Widget Deletion"
          message={`Are you sure you want to delete the "${
            terminalName || title
          }" widget? This action cannot be undone.`}
        />
      </Paper>
    </Tooltip>
  );
};

export default NumberWidget;
