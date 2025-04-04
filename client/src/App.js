import React, { useState, useEffect } from "react";
import { CssBaseline, Box } from "@mui/material";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { ThemeContextProvider } from "./contexts/ThemeContext";
import { useToggle } from "./hooks/useToggle";
import LiveDateTimeIcon from "./components/Widgets/LiveDateTimeIcon";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Sidebar from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";
import TerminalView from "./pages/TerminalView";
import MeasurandView from "./pages/MeasurandView";
import TableDetailsPage from "./pages/TableDetailsPage";
import Viewer from "./pages/DashboardViewer"; // Import the new Viewer page
import axios from "axios";
import { preserveWidgetTemplatesAndClear } from "./components/localStorageUtils";
import LogView from "./pages/LogView";
const API_BASE_URL = `${process.env.REACT_APP_API_LOCAL_URL}api`;

const App = () => {
  const [sidebarOpen, toggleSidebar] = useToggle(true);
  const [widgets, setWidgets] = useState([]);
  const [dashboardName, setDashboardName] = useState("");
  const [dashboardUpdated, setDashboardUpdated] = useState(0);
  const [showSnackbar, setShowSnackbar] = useState({
    message: "",
    severity: "success",
  });
  const [activeDashboard, setActiveDashboard] = useState("");

  const handleDashboardUpdate = () => {
    setDashboardUpdated((prev) => prev + 1);
  };

  const handleNewDashboard = () => {
    setWidgets([]);
    setDashboardName("");
    setActiveDashboard("");
    preserveWidgetTemplatesAndClear();
  };

  const handleDashboardSelect = async (name, widgets) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/dashboards/${name}`);
      setDashboardName(name);
      setWidgets(widgets);
      setActiveDashboard(name);
    } catch (error) {
      console.error("Error selecting dashboard:", error);
      setShowSnackbar({
        message: "Failed to load dashboard",
        severity: "error",
      });
    }
  };

  useEffect(() => {
    console.log("App.js state changed:", {
      widgets,
      dashboardName,
      activeDashboard,
    });
  }, [widgets, dashboardName, activeDashboard]);

  return (
    <ThemeContextProvider>
      <CssBaseline />
      <Router>
        <Navbar toggleSidebar={toggleSidebar} />
        <LiveDateTimeIcon />
        <Sidebar
          open={sidebarOpen}
          toggleSidebar={toggleSidebar}
          onDashboardUpdate={dashboardUpdated}
          onNewDashboard={handleNewDashboard}
          onDashboardSelect={handleDashboardSelect}
          setShowSnackbar={setShowSnackbar}
          activeDashboard={activeDashboard}
        />
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            mt: 10,
            mb: 8,
            p: 2,
            width: "100%",
            transition: "margin-left 0.3s ease",
          }}
        >
          <Routes>
            <Route
              path="/"
              element={
                <Dashboard
                  onDashboardUpdate={handleDashboardUpdate}
                  widgets={widgets}
                  setWidgets={setWidgets}
                  dashboardName={dashboardName}
                  setDashboardName={setDashboardName}
                  showSnackbar={showSnackbar}
                  setShowSnackbar={setShowSnackbar}
                  setActiveDashboard={setActiveDashboard}
                />
              }
            />
            <Route path="/terminal-view" element={<TerminalView />} />
            <Route path="/hdd/table/:tableId" element={<TableDetailsPage />} />
            <Route path="/measurand-view" element={<MeasurandView />} />
            <Route path="/viewer" element={<Viewer />} />{" "}
            <Route path="/log-view" element={<LogView />} />{" "}
            {/* New LogView Route */}{" "}
          </Routes>
        </Box>
        <Footer />
      </Router>
    </ThemeContextProvider>
  );
};

export default App;
