import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
} from "@mui/material";

// ------------------ Main DeleteConfirmationDialog component ------------------
const DeleteConfirmationDialog = ({
  open,
  onClose,
  onConfirm,
  title = "Confirm Deletion",
  message = "Are you sure you want to delete this item? This action cannot be undone.",
}) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby="delete-dialog-title"
      sx={{ borderRadius: 2 }}
    >
      {/* ------------------ Dialog title ------------------ */}
      <DialogTitle id="delete-dialog-title">{title}</DialogTitle>

      {/* ------------------ Dialog content with message ------------------ */}
      <DialogContent>
        <Typography>{message}</Typography>
      </DialogContent>

      {/* ------------------ Dialog actions with buttons ------------------ */}
      <DialogActions>
        <Button
          onClick={onClose}
          color="inherit"
          variant="outlined"
          sx={{ borderRadius: 1, textTransform: "none" }}
        >
          Cancel
        </Button>
        <Button
          onClick={onConfirm}
          color="error"
          variant="contained"
          sx={{ borderRadius: 1, textTransform: "none", ml: 1 }}
          autoFocus
        >
          Delete
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteConfirmationDialog;
