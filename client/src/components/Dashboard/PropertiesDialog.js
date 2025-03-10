import React from "react";
import { Dialog, DialogContent, DialogActions, Button } from "@mui/material";
import WidgetProperties from "../WidgetProperties";

const PropertiesDialog = ({
  open,
  onClose,
  selectedWidgetId,
  handleApplySettings,
}) => (
  // ------------------ Dialog container -------------
  <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
    <DialogContent>
      <WidgetProperties
        onApply={handleApplySettings}
        selectedWidget={selectedWidgetId}
        onClose={onClose}
      />
    </DialogContent>

    {/* ------------------ Dialog actions area ------------- */}
    <DialogActions>
      <Button onClick={onClose}>Close</Button>
    </DialogActions>
  </Dialog>
);

export default PropertiesDialog;
