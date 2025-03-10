import React from "react";
import { Box, IconButton } from "@mui/material";
import {
  Delete as DeleteIcon,
  Settings as SettingsIcon,
} from "@mui/icons-material";
import GridLayout from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import DashboardNumberWidget from "../DashboardWidgets/DashboardNumberWidget";
import DashboardGraphWidget from "../DashboardWidgets/DashboardGraphWidget";
import DashboardGaugeWidget from "../DashboardWidgets/DashboardGaugeWidget";
import DashboardImageWidget from "../DashboardWidgets/DashboardImageWidget";
import DashboardDataGridWidget from "../DashboardWidgets/DashboardDataGridWidget";
import DashboardTextWidget from "../DashboardWidgets/DashboardTextWidget";

const DashboardGrid = ({
  widgets,
  onLayoutChange,
  handleDeleteClick,
  handleSettingsClick,
}) => {
  // ------------------ Helper function to render individual widgets -------------
  const renderWidget = (widget) => {
    // Calculate pixel dimensions based on grid units (w = width, h = height)
    const pixelWidth = widget.layout.w * ((window.innerWidth - 48) / 12);
    const pixelHeight = widget.layout.h * 50;

    // ------------------ Enhance widget data with default empty arrays -------------
    const enhancedData = {
      ...widget,
      plants: widget.plants || [],
      terminals: widget.terminals || [],
      measurands: widget.measurands || [],
    };

    // ------------------ Render widget with controls -------------
    return (
      <Box
        sx={{
          position: "relative",
          height: "100%",
          "&:hover .delete-icon, &:hover .settings-icon": { opacity: 1 },
        }}
      >
        {/* ------------------ Switch to render specific widget type ------------- */}
        {(() => {
          switch (widget.type) {
            case "number":
              return (
                <DashboardNumberWidget
                  data={enhancedData}
                  width={pixelWidth}
                  height={pixelHeight}
                />
              );
            case "text":
              return (
                <DashboardTextWidget
                  data={enhancedData}
                  width={pixelWidth}
                  height={pixelHeight}
                />
              );
            case "graph":
              return (
                <DashboardGraphWidget
                  data={enhancedData}
                  width={pixelWidth}
                  height={pixelHeight}
                  onDelete={handleDeleteClick}
                  handleSettingsClick={handleSettingsClick}
                />
              );
            case "gauge":
              return (
                <DashboardGaugeWidget
                  data={enhancedData}
                  width={pixelWidth}
                  height={pixelHeight}
                />
              );
            case "image":
              return (
                <DashboardImageWidget
                  data={enhancedData}
                  width={pixelWidth}
                  height={pixelHeight}
                />
              );
            case "datagrid":
              return (
                <DashboardDataGridWidget
                  data={enhancedData}
                  width={pixelWidth}
                  height={pixelHeight}
                />
              );
            default:
              return null;
          }
        })()}

        {/* ------------------ Delete button ------------- */}
        <IconButton
          className="delete-icon"
          size="small"
          sx={{
            position: "absolute",
            top: 8,
            right: 40,
            opacity: 0,
            transition: "opacity 0.2s",
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            color: "white",
            padding: "4px",
            "&:hover": { backgroundColor: "rgba(211, 47, 47, 0.8)" },
            "& .MuiSvgIcon-root": { fontSize: "1rem" },
          }}
          onClick={() => handleDeleteClick(widget.id)}
        >
          <DeleteIcon />
        </IconButton>

        {/* ------------------ Settings button ------------- */}
        <IconButton
          className="settings-icon"
          size="small"
          sx={{
            position: "absolute",
            top: 8,
            right: 70,
            opacity: 0,
            transition: "opacity 0.2s",
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            color: "white",
            padding: "4px",
            "&:hover": { backgroundColor: "rgba(33, 150, 243, 0.8)" },
            "& .MuiSvgIcon-root": { fontSize: "1rem" },
          }}
          onClick={() => handleSettingsClick(widget.id)}
        >
          <SettingsIcon />
        </IconButton>
      </Box>
    );
  };

  return (
    <GridLayout
      className="layout"
      layout={widgets.map((w) => w.layout)}
      cols={12}
      rowHeight={50}
      width={window.innerWidth - 48}
      onLayoutChange={onLayoutChange}
      isResizable={true}
      isDraggable={true}
      compactType="vertical"
      preventCollision={false}
    >
      {/* ------------------ Map widgets to grid items ------------- */}
      {widgets.map((widget) => (
        <div key={widget.layout.i} style={{ overflow: "hidden" }}>
          {renderWidget(widget)}
        </div>
      ))}
    </GridLayout>
  );
};

export default DashboardGrid;
