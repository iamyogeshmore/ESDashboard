import React from "react";
import { Dialog, DialogContent, DialogActions, Button } from "@mui/material";
import WidgetProperties from "../WidgetProperties";

// --------------------------- Function renders a dialog for widget properties editing -------------------------------
const PropertiesDialog = ({
  open,
  onClose,
  selectedWidgetId,
  handleApplySettings,
}) => (
  <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
    <DialogContent>
      <WidgetProperties
        onApply={handleApplySettings}
        selectedWidget={selectedWidgetId}
        onClose={onClose}
      />
    </DialogContent>
    <DialogActions>
      <Button onClick={onClose}>Close</Button>
    </DialogActions>
  </Dialog>
);

export default PropertiesDialog;
