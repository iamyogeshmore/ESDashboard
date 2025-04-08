import React from "react";
import { Dialog, DialogContent, DialogActions, Button } from "@mui/material";
import WidgetProperties from "../WidgetProperties";

const PropertiesDialog = ({
  open,
  onClose,
  selectedWidgetId,
  handleApplySettings,
  widgetData,
  dashboardName,
}) => (
  <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
    <DialogContent>
      <WidgetProperties
        onApply={handleApplySettings}
        selectedWidget={selectedWidgetId}
        widgetData={widgetData}
        onClose={onClose}
        isDashboard={true}
        dashboardName={dashboardName}
      />
    </DialogContent>
    <DialogActions>
      <Button onClick={onClose}>Close</Button>
    </DialogActions>
  </Dialog>
);

export default PropertiesDialog;
