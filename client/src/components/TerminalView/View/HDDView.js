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

// ------------------ Base API endpoint from environment variables ------------------
const BASE_URL = `${process.env.REACT_APP_API_LOCAL_URL}api/hdd`;

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

  // ----------------------- Fetch Tables ---------------------
  const fetchTables = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(BASE_URL);
      if (!response.data.success) throw new Error(response.data.message);
      setTables(response.data.data);
    } catch (error) {
      setError(error.message || "Failed to fetch tables");
      setSnackbar({
        open: true,
        message: error.message || "Error loading tables",
        severity: "error",
      });
      console.error("Error fetching HDD views:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // ----------------------- Handle Table Creation ---------------------
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
      if (!response.data.success) throw new Error(response.data.message);
      setTables((prev) => [...prev, response.data.data]);
      setSnackbar({
        open: true,
        message: "Table created successfully!",
        severity: "success",
      });
      setTableDialogOpen(false);
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.message || "Error creating table",
        severity: "error",
      });
      console.error("Error creating HDD view:", error);
    }
  };

  // ----------------------- Handle Table Deletion ---------------------
  const handleDeleteTable = async () => {
    if (!tableToDelete) return;

    try {
      const response = await axios.delete(`${BASE_URL}/${tableToDelete}`);
      if (!response.data.success) throw new Error(response.data.message);
      setTables((prev) => prev.filter((table) => table._id !== tableToDelete));
      setSnackbar({
        open: true,
        message: "Table deleted successfully!",
        severity: "error",
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.message || "Error deleting table",
        severity: "error",
      });
      console.error("Error deleting HDD view:", error);
    } finally {
      setDeleteDialogOpen(false);
      setTableToDelete(null);
    }
  };

  // ----------------------- Fetch Tables Effect ---------------------
  useEffect(() => {
    fetchTables();
  }, [fetchTables]);

  // ----------------------- Handle Add Table ---------------------
  const handleAddTable = () => setTableDialogOpen(true);

  // ----------------------- Handle Table Click ---------------------
  const handleTableClick = (tableId) => {
    navigate(`/hdd/table/${tableId}`);
  };

  // ----------------------- Handle Delete Click ---------------------
  const handleDeleteClick = (tableId) => {
    setTableToDelete(tableId);
    setDeleteDialogOpen(true);
  };

  // ----------------------- Handle Delete Dialog Close ---------------------
  const handleDeleteDialogClose = () => {
    setDeleteDialogOpen(false);
    setTableToDelete(null);
  };

  // ----------------------- Handle Snackbar Close ---------------------
  const handleSnackbarClose = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  // ----------------------- Transition Slide ---------------------
  const TransitionSlide = (props) => <Slide {...props} direction="left" />;

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
                          {table.profile.charAt(0).toUpperCase()}
                        </Avatar>
                        <Typography variant="h6" fontWeight="bold">
                          {table.profile.charAt(0).toUpperCase() +
                            table.profile.slice(1)}{" "}
                          Profile
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
                            Terminal: {table.terminalName || "Unknown"}
                          </Typography>
                        </Box>
                        <Chip
                          label={`${
                            table.measurandNames?.length || 0
                          } Measurands`}
                          color="primary"
                          variant="outlined"
                          sx={{ alignSelf: "flex-start", mt: 1 }}
                        />
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ mt: 1 }}
                        >
                          Created:
                          {new Date(table.createdAt).toLocaleString("en-GB", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: true,
                          })}
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

        <CreateTableDialog
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

export default HDDView;
