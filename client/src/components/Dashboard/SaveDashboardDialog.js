import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
} from "@mui/material";

// --------------------------- Function renders a dialog for saving the dashboard with a name -------------------------------
const SaveDashboardDialog = ({
  open,
  onClose,
  dashboardName,
  setDashboardName,
  handleSaveDashboard,
}) => (
  <Dialog open={open} onClose={onClose}>
    <DialogTitle>Save Dashboard</DialogTitle>
    {/* --------------------------- Section for dialog content with input field ------------------------------- */}
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
    {/* --------------------------- Section for dialog actions with buttons ------------------------------- */}
    <DialogActions>
      <Button onClick={onClose}>Cancel</Button>
      <Button onClick={handleSaveDashboard} variant="contained">
        Save
      </Button>
    </DialogActions>
  </Dialog>
);

export default SaveDashboardDialog;
