import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
} from "@mui/material";

const SaveDashboardDialog = ({
  open,
  onClose,
  dashboardName,
  setDashboardName,
  handleSaveDashboard,
}) => (
  // ------------------ Dialog container -------------
  <Dialog open={open} onClose={onClose}>
    <DialogTitle>Save Dashboard</DialogTitle>
    <DialogContent>
      <TextField
        autoFocus
        margin="dense"
        label="Dashboard Name"
        fullWidth
        value={dashboardName}
        onChange={(e) => setDashboardName(e.target.value)}
      />
    </DialogContent>

    {/* ------------------ Dialog actions area ------------- */}
    <DialogActions>
      <Button onClick={onClose}>Cancel</Button>
      <Button onClick={handleSaveDashboard} variant="contained">
        Save
      </Button>
    </DialogActions>
  </Dialog>
);

export default SaveDashboardDialog;
