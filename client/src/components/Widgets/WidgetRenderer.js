import React from "react";
import { Card, CardContent, Typography } from "@mui/material";

const WidgetRenderer = ({ widget, isViewerMode }) => {
  const { type, name, selectedPlant, selectedTerminals, selectedMeasurements } = widget;

  return (
    <Card sx={{ minWidth: 275 }}>
      <CardContent>
        <Typography variant="h6">{name || "Unnamed Widget"}</Typography>
        <Typography color="textSecondary">Type: {type}</Typography>
        {selectedPlant && (
          <Typography>Plant: {selectedPlant}</Typography>
        )}
        {selectedTerminals && selectedTerminals.length > 0 && (
          <Typography>Terminals: {selectedTerminals.join(", ")}</Typography>
        )}
        {selectedMeasurements && selectedMeasurements.length > 0 && (
          <Typography>Measurements: {selectedMeasurements.join(", ")}</Typography>
        )}
      </CardContent>
    </Card>
  );
};

export default WidgetRenderer;