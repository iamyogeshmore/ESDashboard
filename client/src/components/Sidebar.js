import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Button,
  Box,
  IconButton,
  Typography,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  useTheme,
  CircularProgress,
} from "@mui/material";
import {
  Dashboard as DashboardIcon,
  Add as AddIcon,
  ChevronLeft as ChevronLeftIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { preserveWidgetTemplatesAndClear } from "./localStorageUtils"; // Import utility

const API_BASE_URL = `${process.env.REACT_APP_API_LOCAL_URL}api`;

const Sidebar = ({
  open,
  toggleSidebar,
  onDashboardUpdate,
  onNewDashboard,
  onDashboardSelect,
  setShowSnackbar,
  activeDashboard,
}) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [dashboards, setDashboards] = useState([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [dashboardToDelete, setDashboardToDelete] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchDashboards = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/dashboards`);
      setDashboards(response.data);
    } catch (error) {
      console.error("Error fetching dashboards:", error);
      setShowSnackbar({
        message: "Failed to fetch dashboards",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  }, [setShowSnackbar]);

  useEffect(() => {
    fetchDashboards();
  }, [fetchDashboards]);

  useEffect(() => {
    if (onDashboardUpdate) {
      fetchDashboards();
    }
  }, [onDashboardUpdate, fetchDashboards]);

  if (loading) {
    return (
      <Drawer
        variant="temporary"
        anchor="left"
        open={open}
        onClose={toggleSidebar}
        PaperProps={{ sx: { width: 280, boxShadow: 3 } }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            p: 2,
            backgroundColor: theme.palette.primary.main,
            color: "white",
          }}
        >
          <Typography variant="h6" fontWeight="500">
            Dashboards
          </Typography>
          <IconButton
            onClick={toggleSidebar}
            sx={{
              color: "white",
              "&:hover": { backgroundColor: "rgba(255, 255, 255, 0.08)" },
            }}
          >
            <ChevronLeftIcon />
          </IconButton>
        </Box>
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100%",
          }}
        >
          <CircularProgress color="primary" />
        </Box>
      </Drawer>
    );
  }

  const handleDashboardClick = async (dashboard) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/dashboards/${dashboard.name}`
      );
      localStorage.setItem(
        "dashboardWidgets",
        JSON.stringify(response.data.widgets)
      );
      onDashboardSelect(dashboard.name, response.data.widgets);
      navigate("/");
      setShowSnackbar({
        message: `Dashboard "${dashboard.name}" loaded`,
        severity: "info",
      });
    } catch (error) {
      console.error("Error loading dashboard:", error);
      setShowSnackbar({
        message: "Failed to switch dashboard",
        severity: "error",
      });
    }
  };

  const handleDeleteClick = (dashboard, e) => {
    e.stopPropagation();
    setDashboardToDelete(dashboard);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!dashboardToDelete) return;

    try {
      await axios.delete(
        `${API_BASE_URL}/dashboards/${dashboardToDelete.name}`
      );
      const updatedDashboards = dashboards.filter(
        (d) => d.name !== dashboardToDelete.name
      );
      setDashboards(updatedDashboards);

      if (dashboardToDelete.isPublished && updatedDashboards.length > 0) {
        const nextDashboard = updatedDashboards[0];
        await axios.put(
          `${API_BASE_URL}/dashboards/${nextDashboard.name}/publish`
        );
        localStorage.setItem(
          "dashboardWidgets",
          JSON.stringify(nextDashboard.widgets)
        );
        onDashboardSelect(nextDashboard.name, nextDashboard.widgets);
        setShowSnackbar({
          message: `${dashboardToDelete.name} deleted, switched to ${nextDashboard.name}`,
          severity: "success",
        });
      } else {
        preserveWidgetTemplatesAndClear(); // Clear except widget templates
        onDashboardSelect("", []);
        setShowSnackbar({
          message: `${dashboardToDelete.name} deleted, no dashboards remaining`,
          severity: "success",
        });
      }

      setDeleteDialogOpen(false);
      setDashboardToDelete(null);
      navigate("/");
    } catch (error) {
      console.error("Error deleting dashboard:", error);
      setShowSnackbar({
        message: `Failed to delete ${dashboardToDelete.name}`,
        severity: "error",
      });
    }
  };

  const handleNewDashboardClick = () => {
    onNewDashboard();
    preserveWidgetTemplatesAndClear(); // Clear except widget templates
    setShowSnackbar({
      message: "New dashboard created",
      severity: "success",
    });
  };

  return (
    <Drawer
      variant="temporary"
      anchor="left"
      open={open}
      onClose={toggleSidebar}
      PaperProps={{ sx: { width: 280, boxShadow: 3 } }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          p: 2,
          backgroundColor: theme.palette.primary.main,
          color: "white",
        }}
      >
        <Typography variant="h6" fontWeight="500">
          Dashboards
        </Typography>
        <IconButton
          onClick={toggleSidebar}
          sx={{
            color: "white",
            "&:hover": { backgroundColor: "rgba(255, 255, 255, 0.08)" },
          }}
        >
          <ChevronLeftIcon />
        </IconButton>
      </Box>

      <Divider />

      <Box sx={{ p: 2 }}>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          fullWidth
          sx={{
            borderRadius: 1,
            py: 1,
            textTransform: "none",
            fontWeight: 500,
          }}
          onClick={handleNewDashboardClick}
        >
          New Dashboard
        </Button>
      </Box>

      <Divider />

      <List sx={{ px: 1, py: 1.5 }}>
        {dashboards.map((dashboard) => (
          <ListItem
            key={dashboard.id}
            button
            onClick={() => handleDashboardClick(dashboard)}
            sx={{
              borderRadius: 1,
              mb: 0.5,
              position: "relative",
              backgroundColor:
                activeDashboard === dashboard.name
                  ? `${theme.palette.primary.light}20`
                  : "transparent",
              "&:hover": {
                backgroundColor: `${theme.palette.primary.light}10`,
              },
            }}
          >
            <ListItemIcon>
              <DashboardIcon color="primary" />
            </ListItemIcon>
            <ListItemText
              primary={
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <Typography sx={{ mr: 1 }}>{dashboard.name}</Typography>
                  {!dashboard.isPublished &&
                    activeDashboard === dashboard.name && (
                      <Chip
                        label="Active"
                        size="small"
                        color="primary"
                        variant="outlined"
                        sx={{ height: 22, fontSize: "0.7rem" }}
                      />
                    )}
                  {dashboard.isPublished && (
                    <Chip
                      label="Published"
                      size="small"
                      color="secondary"
                      variant="outlined"
                      sx={{ height: 22, fontSize: "0.7rem" }}
                    />
                  )}
                </Box>
              }
            />
            <IconButton
              edge="end"
              aria-label="delete"
              onClick={(e) => handleDeleteClick(dashboard, e)}
              sx={{
                color: theme.palette.text.secondary,
                "&:hover": {
                  color: theme.palette.error.main,
                  backgroundColor: `${theme.palette.error.light}20`,
                },
              }}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </ListItem>
        ))}
      </List>

      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        PaperProps={{ elevation: 3, sx: { borderRadius: 2 } }}
      >
        <DialogTitle>Delete Dashboard</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete "{dashboardToDelete?.name}"? This
            action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button
            onClick={() => setDeleteDialogOpen(false)}
            color="inherit"
            variant="outlined"
            sx={{ borderRadius: 1, textTransform: "none" }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            color="error"
            variant="contained"
            sx={{ borderRadius: 1, textTransform: "none", ml: 1 }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Drawer>
  );
};

export default Sidebar;
