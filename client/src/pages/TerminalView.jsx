import React, { useState } from "react";
import { Box, Tabs, Tab, Paper, Fade, useTheme } from "@mui/material";
import { styled } from "@mui/material/styles";
import CDDView from "../components/TerminalView/View/CDDView";
import HDDView from "../components/TerminalView/View/HDDView";

// ------------------ Styled Tab component ------------------
const StyledTab = styled(Tab)(({ theme }) => ({
  textTransform: "none",
  fontWeight: 600,
  fontSize: "0.925rem",
  padding: "12px 24px",
  minHeight: "54px",
  color: theme.palette.text.secondary,
  transition: "all 0.3s ease",
  "&.Mui-selected": {
    color: theme.palette.primary.main,
    fontWeight: 700,
  },
  "&:hover": {
    color: theme.palette.primary.main,
    backgroundColor: theme.palette.action.hover,
  },
}));

// ------------------ Styled Tabs component ------------------
const StyledTabs = styled(Tabs)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  borderRadius: "12px 12px 0 0",
  boxShadow: "0 2px 4px rgba(0, 0, 0, 0.05)",
  "& .MuiTabs-indicator": {
    height: "4px",
    borderRadius: "4px 4px 0 0",
    background: `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.primary.light} 90%)`,
  },
}));

const TerminalView = () => {
  const [activeTab, setActiveTab] = useState("CDD");
  const theme = useTheme();

  // ------------------ Handler for tab change ------------------
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  return (
    <Box
      sx={{
        width: "100%",
        margin: 0,
        padding: 0,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      <Paper
        sx={{
          borderRadius: 0,
          overflow: "hidden",
          background: theme.palette.background.default,
          backdropFilter: "blur(12px)",
          border: `1px solid ${theme.palette.divider}`,
          boxShadow: "0 8px 24px rgba(0, 0, 0, 0.08)",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* ------------------ Tabs for switching views ------------------ */}
        <StyledTabs
          value={activeTab}
          onChange={handleTabChange}
          aria-label="Data View Tabs"
          variant="fullWidth"
          sx={{
            borderBottom: `1px solid ${theme.palette.divider}`,
            flexShrink: 0,
          }}
        >
          <StyledTab
            label="Current Data Display"
            value="CDD"
            aria-controls="cdd-panel"
            id="cdd-tab"
          />
          <StyledTab
            label="Historical Data Display"
            value="HDD"
            aria-controls="hdd-panel"
            id="hdd-tab"
          />
        </StyledTabs>

        {/* ------------------ Content area for selected view ------------------ */}
        <Box
          sx={{
            p: 2,
            flexGrow: 1,
            backgroundColor: theme.palette.background.paper,
            overflow: "auto",
          }}
          role="tabpanel"
        >
          <Fade in={true} timeout={500}>
            <Box sx={{ height: "100%" }}>
              {activeTab === "CDD" ? (
                <CDDView aria-labelledby="cdd-tab" />
              ) : (
                <HDDView aria-labelledby="hdd-tab" />
              )}
            </Box>
          </Fade>
        </Box>
      </Paper>
    </Box>
  );
};

export default TerminalView;
