import React from "react";
import {
  AppBar,
  Toolbar,
  IconButton,
  Tooltip,
  Box,
  Button,
  Typography,
  Chip,
  Paper,
  CircularProgress, // Import CircularProgress for loading animation
} from "@mui/material";
import {
  TextFields as TextIcon,
  LooksOne as NumberIcon,
  BarChart as GraphIcon,
  Speed as GaugeIcon,
  GridOn as DataGridIcon,
  Image as ImageIcon,
  Save as SaveIcon,
  Publish as PublishIcon,
} from "@mui/icons-material";

const DashboardToolbar = ({
  dashboardName,
  isPublished,
  hasChanges,
  handleIconClick,
  handleSave,
  handlePublish,
  loadingSave = false, // New prop for Save/Update button loading state
  loadingPublish = false, // New prop for Publish button loading state
}) => (
  <Paper elevation={2} sx={{ mb: 3, overflow: "hidden" }}>
    <AppBar position="static" color="default" elevation={0}>
      <Toolbar variant="dense">
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <Tooltip title="Add Text Widget" arrow>
            <IconButton color="primary" onClick={() => handleIconClick("text")}>
              <TextIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Add Number Widget" arrow>
            <IconButton
              color="primary"
              onClick={() => handleIconClick("number")}
            >
              <NumberIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Add Graph Widget" arrow>
            <IconButton
              color="primary"
              onClick={() => handleIconClick("graph")}
            >
              <GraphIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Add Gauge Widget" arrow>
            <IconButton
              color="primary"
              onClick={() => handleIconClick("gauge")}
            >
              <GaugeIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Add DataGrid Widget" arrow>
            <IconButton
              color="primary"
              onClick={() => handleIconClick("datagrid")}
            >
              <DataGridIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Add Image Widget" arrow>
            <IconButton
              color="primary"
              onClick={() => handleIconClick("image")}
            >
              <ImageIcon />
            </IconButton>
          </Tooltip>
        </Box>

        {/* Dashboard title and status */}
        <Box
          sx={{
            flexGrow: 1,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Typography variant="h6" sx={{ mr: 2 }}>
            Dashboard Tools {dashboardName ? `- ${dashboardName}` : ""}
          </Typography>
          {dashboardName && !isPublished && (
            <Chip
              label="Active"
              color="primary"
              size="small"
              variant="outlined"
              sx={{ mr: 1, height: 22, fontSize: "0.7rem" }}
            />
          )}
          {isPublished && (
            <Chip
              label="Published"
              color="secondary"
              size="small"
              variant="outlined"
              sx={{ height: 22, fontSize: "0.7rem" }}
            />
          )}
        </Box>

        {/* Save and Publish buttons with loading animations */}
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <Button
            variant="contained"
            color="primary"
            startIcon={
              loadingSave ? (
                <CircularProgress size={20} color="inherit" />
              ) : (
                <SaveIcon />
              )
            }
            sx={{ ml: 1, textTransform: "none" }}
            onClick={handleSave}
            disabled={!hasChanges || loadingSave} // Disable during loading
          >
            {dashboardName ? "Update" : "Save"}
          </Button>
          <Tooltip
            title={
              isPublished
                ? "Dashboard is already published"
                : "Publish Dashboard"
            }
            arrow
          >
            <span>
              <Button
                variant="outlined"
                color="secondary"
                startIcon={
                  loadingPublish ? (
                    <CircularProgress size={20} color="inherit" />
                  ) : (
                    <PublishIcon />
                  )
                }
                sx={{ ml: 1, textTransform: "none" }}
                onClick={handlePublish}
                disabled={!dashboardName || isPublished || loadingPublish} // Disable during loading
              >
                Publish
              </Button>
            </span>
          </Tooltip>
        </Box>
      </Toolbar>
    </AppBar>
  </Paper>
);

export default DashboardToolbar;