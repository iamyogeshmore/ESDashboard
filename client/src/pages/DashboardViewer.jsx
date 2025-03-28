import React, { useState, useEffect } from "react";
import { Box, Typography, CircularProgress } from "@mui/material";
import axios from "axios";
import DashboardGrid from "../components/Dashboard/DashboardGrid"; // Import DashboardGrid

const API_BASE_URL = `${process.env.REACT_APP_API_LOCAL_URL}api`;

const Viewer = () => {
  const [widgets, setWidgets] = useState([]);
  const [dashboardName, setDashboardName] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchActiveDashboard = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/dashboards/active`);
        const { name, widgets } = response.data;
        setDashboardName(name);
        setWidgets(widgets || []);
        setLoading(false);
      } catch (err) {
        setError("Failed to load the active dashboard");
        setLoading(false);
      }
    };

    fetchActiveDashboard();
  }, []);

  // Dummy handlers since Viewer mode doesn't need editing
  const handleDeleteClick = () => {};
  const handleSettingsClick = () => {};
  const onLayoutChange = () => {}; // Layout is fixed in Viewer mode

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <Typography variant="h6" color="error">
          {error}
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 2, mt: 2, minHeight: "calc(100vh - 64px)" }}>
      <Typography variant="h4" gutterBottom>
        {dashboardName || "Live Dashboard"}
      </Typography>
      <DashboardGrid
        widgets={widgets}
        onLayoutChange={onLayoutChange}
        handleDeleteClick={handleDeleteClick}
        handleSettingsClick={handleSettingsClick}
        dashboardName={dashboardName}
        isPublished={true} // Viewer mode is always published/read-only
      />
    </Box>
  );
};

export default Viewer;