"use client";

import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  IconButton,
  Dialog,
  DialogContent,
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
import WidgetProperties from "../WidgetProperties";
import DeleteConfirmationDialog from "../DeleteConfirmationDialog";

// ------------------ Default widget settings ------------------
const defaultWidgetSettings = {
  titleColor: "#666666",
  titleFontFamily: "Roboto",
  titleFontSize: "14px",
  titleFontWeight: "normal",
  titleFontStyle: "normal",
  titleTextDecoration: "none",
  valueColor: "#1976d2",
  valueFontFamily: "Roboto",
  valueFontSize: "24px",
  valueFontWeight: "bold",
  valueFontStyle: "normal",
  valueTextDecoration: "none",
  backgroundColor: "#ffffff",
  borderColor: "#e0e0e0",
  borderWidth: "1px",
  borderRadius: "8px",
  widgetName: "Default Widget",
};

// ------------------ Main NumberWidget component ------------------
const NumberWidget = ({
  title,
  widgetId,
  fetchValue,
  terminalInfo,
  value: externalValue,
  timestamp: externalTimestamp,
  onDelete,
  ...initialProperties
}) => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === "dark";
  const [isHovered, setIsHovered] = useState(false);
  const [internalValue, setInternalValue] = useState(null);
  const [internalTimestamp, setInternalTimestamp] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [styles, setStyles] = useState({
    ...defaultWidgetSettings,
    ...initialProperties,
  });
  const [settingsDialogOpen, setSettingsDialogOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // ------------------ Effect to fetch value if not provided externally ------------------
  useEffect(() => {
    const loadValue = async () => {
      setLoading(true);
      setError(null);
      try {
        const fetchedData = await fetchValue();
        setInternalValue(fetchedData.value);
        setInternalTimestamp(fetchedData.timestamp);
      } catch (err) {
        setError("Failed to fetch value");
        console.error("Error fetching value:", err);
      } finally {
        setLoading(false);
      }
    };
    if (fetchValue && externalValue === undefined) loadValue();
    else setLoading(false);
  }, [fetchValue, externalValue]);

  // ------------------ Effect to load saved settings from localStorage ------------------
  useEffect(() => {
    let widgetSettings = widgetId
      ? localStorage.getItem(`widgetSettings_${widgetId}`)
      : localStorage.getItem("widgetSettings");
    if (widgetSettings) {
      try {
        const parsedSettings = JSON.parse(widgetSettings);
        setStyles((prev) => ({ ...prev, ...parsedSettings }));
      } catch (error) {
        console.error("Error parsing widget settings:", error);
      }
    }
  }, [widgetId]);

  // ------------------ Effect to adjust styles for dark mode ------------------
  useEffect(() => {
    if (isDarkMode) {
      setStyles((prev) => ({
        ...prev,
        titleColor: prev.titleColor === "#666666" ? "#e0e0e0" : prev.titleColor,
        valueColor: prev.valueColor === "#1976d2" ? "#90caf9" : prev.valueColor,
        backgroundColor:
          prev.backgroundColor === "#ffffff" ? "#1e1e1e" : prev.backgroundColor,
        borderColor:
          prev.borderColor === "#e0e0e0" ? "#424242" : prev.borderColor,
      }));
    }
  }, [isDarkMode]);

  // ------------------ Handler to apply new settings ------------------
  const handleApplySettings = (newSettings) => {
    setStyles(newSettings);
    if (widgetId)
      localStorage.setItem(
        `widgetSettings_${widgetId}`,
        JSON.stringify(newSettings)
      );
    else localStorage.setItem("widgetSettings", JSON.stringify(newSettings));
    setSettingsDialogOpen(false);
  };

  // ------------------ Determine display value and timestamp ------------------
  const displayValue =
    externalValue !== undefined ? externalValue : internalValue;
  const displayTimestamp =
    externalTimestamp !== undefined ? externalTimestamp : internalTimestamp;
  const tooltipTitle = displayTimestamp
    ? `Last updated: ${new Date(displayTimestamp).toLocaleString()}`
    : "No timestamp available";

  // ------------------ Menu handlers ------------------
  const handleMenuClick = (event) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  // ------------------ Delete handlers ------------------
  const handleDeleteClick = () => {
    setDeleteDialogOpen(true);
    handleMenuClose();
  };
  const handleDeleteConfirm = () => {
    onDelete(widgetId || title);
    setDeleteDialogOpen(false);
  };
  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
  };

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
        {/* ------------------ Widget header with title and menu ------------------ */}
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
              {title}
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
              >
                <MenuItem
                  onClick={() => {
                    setSettingsDialogOpen(true);
                    handleMenuClose();
                  }}
                >
                  <SettingsIcon
                    sx={{
                      fontSize: "0.75rem",
                      mr: 1,
                      color: isDarkMode ? "#e0e0e0" : "#757575",
                    }}
                  />{" "}
                  Settings
                </MenuItem>
                <MenuItem onClick={handleDeleteClick}>
                  <DeleteIcon
                    sx={{
                      fontSize: "0.75rem",
                      mr: 1,
                      color: isDarkMode ? "#ef5350" : "#d32f2f",
                    }}
                  />{" "}
                  Delete
                </MenuItem>
              </Menu>
            </Box>
          </Box>
        </Box>

        {/* ------------------ Value display area ------------------ */}
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
            {loading
              ? "Loading..."
              : error
              ? "Error"
              : displayValue !== null && displayValue !== undefined
              ? displayValue.toFixed(styles.decimalPlaces || 2)
              : "N/A"}
          </Typography>
        </Box>

        {/* ------------------ Settings dialog ------------------ */}
        <Dialog
          open={settingsDialogOpen}
          onClose={() => setSettingsDialogOpen(false)}
          maxWidth="lg"
          fullWidth
        >
          <DialogContent sx={{ p: 0 }}>
            <WidgetProperties
              onApply={handleApplySettings}
              selectedWidget={widgetId || title}
            />
          </DialogContent>
        </Dialog>

        {/* ------------------ Delete confirmation dialog ------------------ */}
        <DeleteConfirmationDialog
          open={deleteDialogOpen}
          onClose={handleDeleteCancel}
          onConfirm={handleDeleteConfirm}
          title="Confirm Widget Deletion"
          message={`Are you sure you want to delete the "${title}" widget? This action cannot be undone.`}
        />
      </Paper>
    </Tooltip>
  );
};

export default NumberWidget;
