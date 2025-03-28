import React from "react";
import { Snackbar, Alert } from "@mui/material";

// --------------------------- Function renders a snackbar notification with customizable message and severity -------------------------------
const SnackbarComponent = ({ open, message, severity, onClose }) => (
  <Snackbar
    open={open}
    autoHideDuration={3000}
    onClose={onClose}
    anchorOrigin={{ vertical: "top", horizontal: "right" }}
    sx={{ mt: 8, mr: 2 }}
  >
    <Alert onClose={onClose} severity={severity} sx={{ width: "100%" }}>
      {message}
    </Alert>
  </Snackbar>
);

export default SnackbarComponent;
