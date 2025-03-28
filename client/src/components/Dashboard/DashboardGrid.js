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
  const renderWidget = (widget) => {
    const pixelWidth = widget.layout.w * ((window.innerWidth - 48) / 12);
    const pixelHeight = widget.layout.h * 50;

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
            opacity: !isPublished ? 1 : 0,
          },
        }}
      >
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
                  dashboardName={dashboardName}
                  isPublished={isPublished}
                />
              );
            default:
              return null;
          }
        })()}

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
              onClick={() => handleSettingsClick(widget.id, widget)}
            >
              <SettingsIcon />
            </IconButton>
          </>
        )}
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
      isResizable={!isPublished} // Explicitly disable resizing in published mode
      isDraggable={!isPublished} // Explicitly disable dragging in published mode
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
