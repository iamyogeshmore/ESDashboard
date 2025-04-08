import React, { useState, useEffect } from "react";
import axios from "axios";
import { Box, Switch, FormControlLabel } from "@mui/material";
import DashboardToolbar from "../components/Dashboard/DashboardToolbar";
import DashboardGrid from "../components/Dashboard/DashboardGrid";
import WidgetFormDialog from "../components/Dashboard/WidgetFormDialog";
import SaveDashboardDialog from "../components/Dashboard/SaveDashboardDialog";
import DeleteConfirmationDialog from "../components/DeleteConfirmationDialog";
import SnackbarComponent from "../components/Dashboard/SnackbarComponent";
import PropertiesDialog from "../components/Dashboard/PropertiesDialog";
import { preserveWidgetTemplatesAndClear } from "../components/localStorageUtils";

// ----------------- Base API endpoint from environment variables -----------------
const API_BASE_URL = `${process.env.REACT_APP_API_LOCAL_URL}api`;

// ----------------- Default widget settings -----------------
const customDefaultWidgetSettings = {
  backgroundColor: "#334155",
  borderColor: "#94A3B8",
  borderRadius: "3px",
  borderWidth: "2px",
  titleColor: "#E2E8F0",
  titleFontFamily: "Arial",
  titleFontSize: "22px",
  titleFontStyle: "normal",
  titleFontWeight: "normal",
  titleTextDecoration: "none",
  valueColor: "#FFFFFF",
  valueFontFamily: "Arials",
  valueFontSize: "44px",
  valueFontStyle: "normal",
  valueFontWeight: "bold",
  valueTextDecoration: "none",
};

const Dashboard = ({
  onDashboardUpdate,
  widgets,
  setWidgets,
  dashboardName,
  setDashboardName,
  showSnackbar,
  setShowSnackbar,
  setActiveDashboard,
}) => {
  const [openWidgetDialog, setOpenWidgetDialog] = useState(false);
  const [openSaveDialog, setOpenSaveDialog] = useState(false);
  const [widgetType, setWidgetType] = useState("");
  const [formData, setFormData] = useState({});
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [widgetToDelete, setWidgetToDelete] = useState(null);
  const [plants, setPlants] = useState([]);
  const [terminals, setTerminals] = useState([]);
  const [measurands, setMeasurands] = useState([]);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const [isPublished, setIsPublished] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [originalWidgets, setOriginalWidgets] = useState([]);
  const [openPropertiesDialog, setOpenPropertiesDialog] = useState(false);
  const [selectedWidgetId, setSelectedWidgetId] = useState(null);
  const [selectedWidgetData, setSelectedWidgetData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loadingSave, setLoadingSave] = useState(false);
  const [loadingPublish, setLoadingPublish] = useState(false);

  // ----------------- Load initial dashboard and plants -----------------
  useEffect(() => {
    const loadInitialDashboard = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/dashboards/active`);
        if (response.data) {
          setWidgets(response.data.widgets || []);
          setDashboardName(response.data.name);
          setIsPublished(response.data.isPublished);
          setOriginalWidgets(response.data.widgets || []);
          setActiveDashboard(response.data.name);
          localStorage.setItem(
            "dashboardWidgets",
            JSON.stringify(response.data.widgets)
          );
          triggerSnackbar(`Dashboard "${response.data.name}" loaded`, "info");
        } else {
          const storedWidgets =
            JSON.parse(localStorage.getItem("dashboardWidgets")) || [];
          setWidgets(storedWidgets);
          setOriginalWidgets(storedWidgets);
          setIsPublished(false);
          setDashboardName("");
        }
      } catch (error) {
        console.error("Error loading active dashboard:", error);
        const storedWidgets =
          JSON.parse(localStorage.getItem("dashboardWidgets")) || [];
        setWidgets(storedWidgets);
        setOriginalWidgets(storedWidgets);
        setIsPublished(false);
        setDashboardName("");
      }
    };

    // -------------- Fetch plants --------------
    const fetchPlants = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/plants`);
        setPlants(response.data);
      } catch (error) {
        console.error("Error fetching plants:", error);
      }
    };

    loadInitialDashboard();
    fetchPlants();
  }, [setWidgets, setDashboardName, setActiveDashboard]);

  // ----------------- -----------------
  useEffect(() => {
    const updateDashboardFromProps = async () => {
      if (dashboardName) {
        try {
          const response = await axios.get(
            `${API_BASE_URL}/dashboards/${dashboardName}`
          );
          setWidgets(response.data.widgets || []);
          setIsPublished(response.data.isPublished);
          setOriginalWidgets(response.data.widgets || []);
          setActiveDashboard(response.data.name);
        } catch (error) {
          console.error("Error updating dashboard from props:", error);
          triggerSnackbar("Failed to load dashboard details", "error");
        }
      }
    };
    updateDashboardFromProps();
  }, [dashboardName, setWidgets, setActiveDashboard]);

  useEffect(() => {
    if (showSnackbar.message) {
      setSnackbarOpen(true);
      setSnackbarMessage(showSnackbar.message);
      setSnackbarSeverity(showSnackbar.severity);
    }
  }, [showSnackbar]);

  useEffect(() => {
    const widgetsChanged =
      JSON.stringify(widgets) !== JSON.stringify(originalWidgets);
    setHasChanges(widgetsChanged);
  }, [widgets, originalWidgets]);

  useEffect(() => {
    setIsEditing(!isPublished);
  }, [isPublished]);

  const fetchTerminals = async (plantName) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/terminals/${plantName}`
      );
      setTerminals(response.data);
    } catch (error) {
      console.error("Error fetching terminals:", error);
    }
  };

  const fetchMeasurands = async (plantName, terminalName) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/measurands/${plantName}/${terminalName}`
      );
      setMeasurands(response.data);
    } catch (error) {
      console.error("Error fetching measurands:", error);
    }
  };

  const handleSettingsClick = (widgetId) => {
    const widget = widgets.find((w) => w.id === widgetId);
    setSelectedWidgetId(widgetId);
    setSelectedWidgetData(widget);
    setOpenPropertiesDialog(true);
  };

  const handleApplySettings = async (
    settings,
    applyToAll,
    selectedWidgetType
  ) => {
    let updatedWidgets;
    if (applyToAll) {
      if (selectedWidgetType) {
        updatedWidgets = widgets.map((widget) =>
          widget.type === selectedWidgetType ? { ...widget, settings } : widget
        );
      } else {
        updatedWidgets = widgets.map((widget) => ({ ...widget, settings }));
      }
    } else {
      updatedWidgets = widgets.map((widget) =>
        widget.id === selectedWidgetId ? { ...widget, settings } : widget
      );
    }

    setWidgets(updatedWidgets);
    localStorage.setItem("dashboardWidgets", JSON.stringify(updatedWidgets));
    if (dashboardName) {
      try {
        await axios.put(`${API_BASE_URL}/dashboards/${dashboardName}`, {
          widgets: updatedWidgets,
        });
        triggerSnackbar("Widget settings updated successfully");
      } catch (error) {
        console.error("Error updating widget settings:", error);
        triggerSnackbar("Failed to update widget settings", "error");
      }
    }
    setOpenPropertiesDialog(false);
    setSelectedWidgetId(null);
    setSelectedWidgetData(null);
  };

  const triggerSnackbar = (message, severity = "success") => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  const handleFormChange = (field, value) => {
    if (field === "plant") {
      fetchTerminals(value);
      setFormData((prev) => ({
        ...prev,
        [field]: value,
        terminal: "",
        measurement: "",
      }));
    } else if (field === "terminal") {
      fetchMeasurands(formData.plant, value);
      setFormData((prev) => ({ ...prev, [field]: value, measurement: "" }));
    } else if (field === "file" && value) {
      const reader = new FileReader();
      reader.onload = (e) =>
        setFormData((prev) => ({ ...prev, imageData: e.target.result }));
      reader.readAsDataURL(value);
    } else {
      setFormData((prev) => ({ ...prev, [field]: value }));
    }
  };

  const handleSaveWidget = async (widgetData) => {
    const newWidget = {
      id: Date.now().toString(),
      type: widgetType,
      ...widgetData,
      measurands,
      settings: { ...customDefaultWidgetSettings },
      layout: {
        i: Date.now().toString(),
        x: 0,
        y: Infinity,
        w: widgetType === "datagrid" ? 6 : 3,
        h: widgetType === "datagrid" ? 6 : 4,
      },
      plantId: widgetData.plantId || "",
      terminalId: widgetData.terminalId || "",
      measurandId: widgetData.measurandId || "",
    };
    try {
      const updatedWidgets = [...widgets, newWidget];
      setWidgets(updatedWidgets);
      localStorage.setItem("dashboardWidgets", JSON.stringify(updatedWidgets));

      if (dashboardName) {
        await axios.post(
          `${API_BASE_URL}/dashboards/${dashboardName}/widgets`,
          newWidget
        );
      }

      setOpenWidgetDialog(false);
      setFormData({});
      triggerSnackbar(
        `Widget "${newWidget.name || widgetType}" created successfully`
      );
    } catch (error) {
      console.error("Error saving widget:", error);
      triggerSnackbar("Failed to add widget", "error");
    }
  };

  const handleDeleteConfirm = async () => {
    if (widgetToDelete) {
      try {
        const updatedWidgets = widgets.filter((w) => w.id !== widgetToDelete);
        setWidgets(updatedWidgets);
        localStorage.setItem(
          "dashboardWidgets",
          JSON.stringify(updatedWidgets)
        );
        if (dashboardName) {
          await axios.delete(
            `${API_BASE_URL}/dashboards/${dashboardName}/widgets/${widgetToDelete}`
          );
        }
        setDeleteDialogOpen(false);
        setWidgetToDelete(null);
        preserveWidgetTemplatesAndClear();
        triggerSnackbar("Widget deleted successfully");
      } catch (error) {
        console.error("Error deleting widget:", error);
        triggerSnackbar("Failed to delete widget", "error");
      }
    }
  };

  const handleSaveDashboard = async () => {
    if (!dashboardName.trim()) {
      triggerSnackbar("Please enter a dashboard name", "warning");
      return;
    }
    setLoadingSave(true);
    const dashboardData = {
      id: Date.now(),
      name: dashboardName,
      widgets,
      isPublished: false,
    };
    try {
      const response = await axios.post(
        `${API_BASE_URL}/dashboards`,
        dashboardData
      );
      setOpenSaveDialog(false);
      setDashboardName(response.data.name);
      setIsPublished(response.data.isPublished);
      setOriginalWidgets(response.data.widgets);
      setActiveDashboard(response.data.name);
      preserveWidgetTemplatesAndClear();
      if (onDashboardUpdate) onDashboardUpdate();
      triggerSnackbar(`Dashboard "${dashboardName}" saved successfully`);
    } catch (error) {
      console.error("Error saving dashboard to database:", error);
      triggerSnackbar("Failed to save dashboard", "error");
    } finally {
      setLoadingSave(false);
    }
  };

  const handleUpdateDashboard = async () => {
    if (!dashboardName) return;
    setLoadingSave(true);
    try {
      const dashboardData = { widgets };
      const response = await axios.put(
        `${API_BASE_URL}/dashboards/${dashboardName}`,
        dashboardData
      );
      setOriginalWidgets(response.data.widgets);
      setHasChanges(false);
      preserveWidgetTemplatesAndClear();
      if (onDashboardUpdate) onDashboardUpdate();
      triggerSnackbar(`Dashboard "${dashboardName}" updated successfully`);
    } catch (error) {
      console.error("Error updating dashboard:", error);
      triggerSnackbar("Failed to update dashboard", "error");
    } finally {
      setLoadingSave(false);
    }
  };

  const handlePublish = async () => {
    if (!dashboardName) {
      triggerSnackbar("Please save the dashboard with a name first", "warning");
      return;
    }
    setLoadingPublish(true);
    try {
      const response = await axios.put(
        `${API_BASE_URL}/dashboards/${dashboardName}/publish`
      );
      setIsPublished(true);
      setOriginalWidgets(response.data.widgets);
      preserveWidgetTemplatesAndClear();
      if (onDashboardUpdate) onDashboardUpdate();
      triggerSnackbar(`Dashboard "${dashboardName}" published successfully`);
    } catch (error) {
      console.error("Error publishing dashboard:", error);
      triggerSnackbar("Failed to publish dashboard", "error");
    } finally {
      setLoadingPublish(false);
    }
  };

  const handleEditToggle = (event) => {
    setIsEditing(event.target.checked);
  };

  const handleIconClick = (type) => {
    setWidgetType(type);
    setFormData({});
    setOpenWidgetDialog(true);
  };

  const handleSave = () => {
    if (dashboardName) handleUpdateDashboard();
    else setOpenSaveDialog(true);
  };

  const onLayoutChange = (newLayout) => {
    const updatedWidgets = widgets.map((widget) => {
      const layout = newLayout.find((l) => l.i === widget.layout.i);
      return {
        ...widget,
        layout: {
          ...layout,
          w: Math.max(1, layout.w),
          h: Math.max(1, layout.h),
        },
      };
    });
    setWidgets(updatedWidgets);
    localStorage.setItem("dashboardWidgets", JSON.stringify(updatedWidgets));
  };

  const handleDeleteClick = (widgetId) => {
    setWidgetToDelete(widgetId);
    setDeleteDialogOpen(true);
  };

  return (
    <Box sx={{ flexGrow: 1, minHeight: "calc(100vh - 128px)", padding: 2 }}>
      {isEditing && (
        <DashboardToolbar
          dashboardName={dashboardName}
          isPublished={isPublished}
          hasChanges={hasChanges}
          handleIconClick={handleIconClick}
          handleSave={handleSave}
          handlePublish={handlePublish}
          loadingSave={loadingSave}
          loadingPublish={loadingPublish}
        />
      )}
      {isPublished && (
        <Box sx={{ mb: 2 }}>
          <FormControlLabel
            control={
              <Switch
                checked={isEditing}
                onChange={handleEditToggle}
                color="primary"
              />
            }
            label="Edit Mode"
          />
        </Box>
      )}
      <SnackbarComponent
        open={snackbarOpen}
        message={snackbarMessage}
        severity={snackbarSeverity}
        onClose={() => {
          setSnackbarOpen(false);
          setShowSnackbar({ message: "", severity: "success" });
        }}
      />
      <DashboardGrid
        widgets={widgets}
        onLayoutChange={onLayoutChange}
        handleDeleteClick={handleDeleteClick}
        handleSettingsClick={handleSettingsClick}
        dashboardName={dashboardName}
        isPublished={!isEditing}
      />
      {isEditing && (
        <>
          <WidgetFormDialog
            open={openWidgetDialog}
            onClose={() => setOpenWidgetDialog(false)}
            widgetType={widgetType}
            formData={formData}
            plants={plants}
            terminals={terminals}
            measurands={measurands}
            handleFormChange={handleFormChange}
            handleSaveWidget={handleSaveWidget}
          />
          <SaveDashboardDialog
            open={openSaveDialog}
            onClose={() => setOpenSaveDialog(false)}
            dashboardName={dashboardName}
            setDashboardName={setDashboardName}
            handleSaveDashboard={handleSaveDashboard}
          />
          <DeleteConfirmationDialog
            open={deleteDialogOpen}
            onClose={() => {
              setDeleteDialogOpen(false);
              setWidgetToDelete(null);
            }}
            onConfirm={handleDeleteConfirm}
            title="Delete Widget"
            message="Are you sure you want to delete this widget? This action cannot be undone."
          />
          <PropertiesDialog
            open={openPropertiesDialog}
            onClose={() => {
              setOpenPropertiesDialog(false);
              setSelectedWidgetId(null);
              setSelectedWidgetData(null);
            }}
            selectedWidgetId={selectedWidgetId}
            widgetData={selectedWidgetData}
            handleApplySettings={handleApplySettings}
            viewId={dashboardName}
            dashboardName={dashboardName}
          />
        </>
      )}
    </Box>
  );
};

export default Dashboard;
