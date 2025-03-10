import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import {
  Box,
  Snackbar,
  Alert,
  Typography,
  Card,
  CardContent,
  CardActionArea,
  CircularProgress,
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

import CreateTableDialog from "../CreationForm/CreateTableDialog";
import DeleteConfirmationDialog from "../../DeleteConfirmationDialog";

// --------------- Base API endpoint fetched from environment variables ---------------
const BASE_URL = `${process.env.REACT_APP_API_LOCAL_URL}api/hdd`;

// --------------- Styled component for animated card with hover effects ---------------
const AnimatedCard = styled(Card)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  color: theme.palette.text.primary,
  transition: "transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out",
  position: "relative",
  "&:hover": {
    transform: "translateY(-10px)",
    boxShadow: theme.shadows[12],
    "& .delete-icon": {
      opacity: 1,
    },
  },
  "& .delete-icon": {
    opacity: 0,
    transition: "opacity 0.2s ease-in-out",
  },
}));

// --------------- Styled floating action button for adding new tables ---------------
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

// --------------- Custom styled Alert for red delete notification ---------------
const DeleteAlert = styled(Alert)(({ theme }) => ({
  backgroundColor: theme.palette.error.main,
  color: theme.palette.error.contrastText,
  "& .MuiAlert-icon": {
    color: theme.palette.error.contrastText,
  },
}));

const HDDView = () => {
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // --------------- Fetch tables from API with error handling ---------------
  const fetchTables = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(BASE_URL);
      setTables(response.data);
    } catch (error) {
      setError("Failed to fetch tables");
      setSnackbar({
        open: true,
        message: "Error loading tables",
        severity: "error",
      });
      console.error("Error fetching HDD views:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // --------------- Handle table creation with API call ---------------
  const handleTableCreate = async (tableData) => {
    if (tableData.error) {
      setSnackbar({
        open: true,
        message: tableData.error,
        severity: "warning",
      });
      return;
    }

    try {
      const response = await axios.post(`${BASE_URL}/create`, tableData);
      setTables((prev) => [...prev, response.data]);
      setSnackbar({
        open: true,
        message: "Table created successfully!",
        severity: "success",
      });
      setTableDialogOpen(false);
    } catch (error) {
      setSnackbar({
        open: true,
        message: "Error creating table",
        severity: "error",
      });
      console.error("Error creating HDD view:", error);
    }
  };

  // --------------- Handle table deletion with API call ---------------
  const handleDeleteTable = async () => {
    if (!tableToDelete) return;

    try {
      await axios.delete(`${BASE_URL}/${tableToDelete}`);
      setTables((prev) => prev.filter((table) => table._id !== tableToDelete));
      setSnackbar({
        open: true,
        message: "Table deleted successfully!",
        severity: "error",
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: "Error deleting table",
        severity: "error",
      });
      console.error("Error deleting HDD view:", error);
    } finally {
      setDeleteDialogOpen(false);
      setTableToDelete(null);
    }
  };

  // --------------- Fetch tables on component mount ---------------
  useEffect(() => {
    fetchTables();
  }, [fetchTables]);

  // --------------- Open create table dialog ---------------
  const handleAddTable = () => setTableDialogOpen(true);

  // --------------- Navigate to specific table view ---------------
  const handleTableClick = (tableId) => {
    navigate(`/hdd/table/${tableId}`);
  };

  // --------------- Initiate table deletion process ---------------
  const handleDeleteClick = (tableId) => {
    setTableToDelete(tableId);
    setDeleteDialogOpen(true);
  };

  // --------------- Close delete confirmation dialog ---------------
  const handleDeleteDialogClose = () => {
    setDeleteDialogOpen(false);
    setTableToDelete(null);
  };

  // --------------- Close snackbar notification ---------------
  const handleSnackbarClose = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  // --------------- Animation transition for Snackbar ---------------
  const TransitionSlide = (props) => {
    return <Slide {...props} direction="left" />;
  };

  // --------------- Render loading state ---------------
  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          bgcolor: "background.default",
        }}
      >
        <CircularProgress size={80} thickness={4} color="primary" />
      </Box>
    );
  }

  // --------------- Render error state ---------------
  if (error) {
    return (
      <Container
        maxWidth="sm"
        sx={{
          textAlign: "center",
          mt: 10,
          p: 4,
          borderRadius: 2,
          bgcolor: "error.main",
          color: "error.contrastText",
        }}
      >
        <Typography variant="h4" gutterBottom>
          Oops! Something went wrong
        </Typography>
        <Typography variant="body1" sx={{ mb: 3 }}>
          {error}
        </Typography>
      </Container>
    );
  }

  // --------------- Main render of table view ---------------
  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "background.default",
        py: 4,
        position: "relative",
      }}
    >
      {/* --------------- Floating button to add new table --------------- */}
      <TopRightAddButton
        color="primary"
        aria-label="add"
        onClick={handleAddTable}
      >
        <AddIcon />
      </TopRightAddButton>

      <Container maxWidth="lg">
        {tables.length > 0 ? (
          // --------------- Display grid of table cards ---------------
          <Grid container spacing={3}>
            {tables.map((table) => (
              <Grid item xs={12} sm={6} md={4} key={table._id}>
                <AnimatedCard>
                  <CardActionArea onClick={() => handleTableClick(table._id)}>
                    <CardContent>
                      {/* --------------- Table profile header --------------- */}
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
                          {table.profile.charAt(0).toUpperCase()}
                        </Avatar>
                        <Typography variant="h6" fontWeight="bold">
                          {table.profile.charAt(0).toUpperCase() +
                            table.profile.slice(1)}{" "}
                          Profile
                        </Typography>
                      </Box>
                      {/* --------------- Table details --------------- */}
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
                            Plant: {table.plantName}
                          </Typography>
                        </Box>
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          <TableChartIcon
                            sx={{ mr: 1, color: "text.secondary" }}
                          />
                          <Typography color="text.secondary">
                            Terminal: {table.terminalName}
                          </Typography>
                        </Box>
                        <Chip
                          label={`${table.measurandNames.length} Measurands`}
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
                  {/* --------------- Delete button for each card --------------- */}
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
          // --------------- Display empty state message ---------------
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

        {/* --------------- Dialog for creating new tables --------------- */}
        <CreateTableDialog
          open={tableDialogOpen}
          onClose={() => setTableDialogOpen(false)}
          onCreate={handleTableCreate}
        />

        {/* --------------- Dialog for delete confirmation --------------- */}
        <DeleteConfirmationDialog
          open={deleteDialogOpen}
          onClose={handleDeleteDialogClose}
          onConfirm={handleDeleteTable}
          title="Confirm Table Deletion"
          message="Are you sure you want to delete this table? This action cannot be undone."
        />

        {/* --------------- Animated notification snackbar positioned top-right below navbar --------------- */}
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

export default HDDView;
