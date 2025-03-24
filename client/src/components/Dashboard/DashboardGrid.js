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
  dashboardName,
  isPublished,
}) => {
  // ------------- Renders an individual widget based on its type -------------
  const renderWidget = (widget) => {
    // Calculate pixel dimensions based on grid units
    const pixelWidth = widget.layout.w * ((window.innerWidth - 48) / 12);
    const pixelHeight = widget.layout.h * 50;

    // Enhance widget data with default empty arrays if properties are missing
    const enhancedData = {
      ...widget,
      plants: widget.plants || [],
      terminals: widget.terminals || [],
      measurands: widget.measurands || [],
    };

    return (
      <Box
        sx={{
          position: "relative",
          height: "100%",
          "&:hover .delete-icon, &:hover .settings-icon": {
            opacity: !isPublished ? 1 : 0, // Show icons only when not published
          },
        }}
      >
        {(() => {
          // Switch statement to render appropriate widget component
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
                  dashboardName={dashboardName}
                  isPublished={isPublished}
                />
              );
            default:
              return null;
          }
        })()}

        {/* Render delete and settings buttons only if dashboard isn't published */}
        {!isPublished && (
          <>
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
          </>
        )}
      </Box>
    );
  };

  // ------------- Renders the grid layout with all widgets -------------
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
      {widgets.map((widget) => (
        <div key={widget.layout.i} style={{ overflow: "hidden" }}>
          {renderWidget(widget)}
        </div>
      ))}
    </GridLayout>
  );
};

export default DashboardGrid;
