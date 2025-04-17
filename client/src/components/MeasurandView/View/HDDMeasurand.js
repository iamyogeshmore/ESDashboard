import React, { useState, useEffect } from "react";
import {
  Box,
  Snackbar,
  Alert,
  Typography,
  Card,
  CardContent,
  CardActionArea,
  Grid,
  Container,
  Paper,
  Chip,
  Avatar,
  IconButton,
  Fab,
  Slide,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { useNavigate } from "react-router-dom";
import {
  Add as AddIcon,
  Storage as StorageIcon,
  TableChart as TableChartIcon,
  LocationOn as LocationOnIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";
import CreateMeasurandTableDialog from "../CreationForm/CreateMeasurandTableDialog";
import DeleteConfirmationDialog from "../../DeleteConfirmationDialog";
import axios from "axios";

const AnimatedCard = styled(Card)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  color: theme.palette.text.primary,
  transition: "transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out",
  position: "relative",
  "&:hover": {
    transform: "translateY(-10px)",
    boxShadow: theme.shadows[12],
    "& .delete-icon": { opacity: 1 },
  },
  "& .delete-icon": {
    opacity: 0,
    transition: "opacity 0.2s ease-in-out",
  },
}));

const TopRightAddButton = styled(Fab)(({ theme }) => ({
  position: "absolute",
  top: theme.spacing(2),
  right: theme.spacing(2),
  zIndex: theme.zIndex.speedDial,
  boxShadow: theme.shadows[6],
  transition: "all 0.3s ease",
  "&:hover": {
    transform: "scale(1.1)",
    boxShadow: theme.shadows[12],
  },
}));

const DeleteAlert = styled(Alert)(({ theme }) => ({
  backgroundColor: theme.palette.error.main,
  color: theme.palette.error.contrastText,
  "& .MuiAlert-icon": { color: theme.palette.error.contrastText },
}));

const HDDMeasurand = () => {
  const navigate = useNavigate();
  const [tables, setTables] = useState([]);
  const [tableDialogOpen, setTableDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [tableToDelete, setTableToDelete] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const API_BASE_URL = "http://localhost:6005/api/measurand-hdd";

  useEffect(() => {
    axios
      .get(`${API_BASE_URL}/`)
      .then((response) => {
        if (response.data.success) {
          setTables(response.data.data);
        }
      })
      .catch((error) => {
        console.error("Error fetching tables:", error);
        setSnackbar({
          open: true,
          message: "Failed to fetch tables",
          severity: "error",
        });
      });
  }, []);

  const handleTableCreate = (tableData) => {
    if (tableData.error) {
      setSnackbar({
        open: true,
        message: tableData.error,
        severity: "warning",
      });
      return;
    }

    setTables((prev) => [...prev, tableData]);
    setSnackbar({
      open: true,
      message: "Table created successfully!",
      severity: "success",
    });
    setTableDialogOpen(false);
  };

  const handleDeleteTable = () => {
    axios
      .delete(`${API_BASE_URL}/${tableToDelete}`)
      .then((response) => {
        if (response.data.success) {
          setTables((prev) =>
            prev.filter((table) => table._id !== tableToDelete)
          );
          setSnackbar({
            open: true,
            message: "Table deleted successfully!",
            severity: "error",
          });
        } else {
          setSnackbar({
            open: true,
            message: response.data.message,
            severity: "error",
          });
        }
      })
      .catch((error) => {
        setSnackbar({
          open: true,
          message: "Failed to delete table",
          severity: "error",
        });
      });
    setDeleteDialogOpen(false);
    setTableToDelete(null);
  };

  const handleAddTable = () => setTableDialogOpen(true);

  const handleTableClick = (tableId) => {
    navigate(`/hdd/measurand/${tableId}`);
  };

  const handleDeleteClick = (tableId) => {
    setTableToDelete(tableId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteDialogClose = () => {
    setDeleteDialogOpen(false);
    setTableToDelete(null);
  };

  const handleSnackbarClose = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  const TransitionSlide = (props) => <Slide {...props} direction="left" />;

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "background.default",
        py: 4,
        position: "relative",
      }}
    >
      <TopRightAddButton
        color="primary"
        aria-label="add"
        onClick={handleAddTable}
      >
        <AddIcon />
      </TopRightAddButton>

      <Container maxWidth="lg">
        {tables.length > 0 ? (
          <Grid container spacing={3}>
            {tables.map((table) => (
              <Grid item xs={12} sm={6} md={4} key={table._id}>
                <AnimatedCard>
                  <CardActionArea onClick={() => handleTableClick(table._id)}>
                    <CardContent>
                      <Box
                        sx={{ display: "flex", alignItems: "center", mb: 2 }}
                      >
                        <Avatar
                          sx={{
                            mr: 2,
                            bgcolor: "primary.main",
                            width: 56,
                            height: 56,
                          }}
                        >
                          {table.measurandName?.charAt(0)?.toUpperCase() || "M"}
                        </Avatar>
                        <Typography variant="h6" fontWeight="bold">
                          {table.measurandName || "Measurand View"}
                        </Typography>
                      </Box>
                      <Box
                        sx={{
                          display: "flex",
                          flexDirection: "column",
                          gap: 1,
                        }}
                      >
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          <LocationOnIcon
                            sx={{ mr: 1, color: "text.secondary" }}
                          />
                          <Typography color="text.secondary">
                            Plant: {table.plantName || "Unknown"}
                          </Typography>
                        </Box>
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          <TableChartIcon
                            sx={{ mr: 1, color: "text.secondary" }}
                          />
                          <Typography color="text.secondary">
                            Measurand: {table.measurandName || "Unknown"}
                          </Typography>
                        </Box>
                        <Chip
                          label={`${table.terminalNames.length} Terminals`}
                          color="primary"
                          variant="outlined"
                          sx={{ alignSelf: "flex-start", mt: 1 }}
                        />
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ mt: 1 }}
                        >
                          Created: {new Date(table.createdAt).toLocaleString()}
                        </Typography>
                      </Box>
                    </CardContent>
                  </CardActionArea>
                  <IconButton
                    className="delete-icon"
                    sx={{
                      position: "absolute",
                      top: 8,
                      right: 8,
                      color: "error.main",
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteClick(table._id);
                    }}
                  >
                    <DeleteIcon />
                  </IconButton>
                </AnimatedCard>
              </Grid>
            ))}
          </Grid>
        ) : (
          <Paper
            elevation={2}
            sx={{
              mt: 4,
              p: 4,
              textAlign: "center",
              bgcolor: "background.paper",
              borderRadius: 2,
            }}
          >
            <StorageIcon sx={{ fontSize: 80, color: "primary.main", mb: 2 }} />
            <Typography variant="h5" color="text.secondary">
              No tables created yet.
            </Typography>
          </Paper>
        )}

        <CreateMeasurandTableDialog
          open={tableDialogOpen}
          onClose={() => setTableDialogOpen(false)}
          onCreate={handleTableCreate}
        />

        <DeleteConfirmationDialog
          open={deleteDialogOpen}
          onClose={handleDeleteDialogClose}
          onConfirm={handleDeleteTable}
          title="Confirm Table Deletion"
          message="Are you sure you want to delete this table? This action cannot be undone."
        />

        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={handleSnackbarClose}
          anchorOrigin={{ vertical: "top", horizontal: "right" }}
          sx={{ mt: 8 }}
          TransitionComponent={TransitionSlide}
        >
          {snackbar.message === "Table deleted successfully!" ? (
            <DeleteAlert
              onClose={handleSnackbarClose}
              severity="error"
              sx={{ width: "100%" }}
            >
              {snackbar.message}
            </DeleteAlert>
          ) : (
            <Alert
              onClose={handleSnackbarClose}
              severity={snackbar.severity}
              sx={{ width: "100%" }}
            >
              {snackbar.message}
            </Alert>
          )}
        </Snackbar>
      </Container>
    </Box>
  );
};

export default HDDMeasurand;
