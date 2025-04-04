import React from "react";
import { Paper, Typography, Box } from "@mui/material";
import { styled } from "@mui/material/styles";

const StyledPaper = styled(Paper)(({ theme, settings }) => ({
  padding: theme.spacing(2),
  boxShadow: theme.shadows[2],
  background: settings?.backgroundColor || theme.palette.background.paper,
  border: `${settings?.borderWidth || "1px"} solid ${
    settings?.borderColor || "#e0e0e0"
  }`,
  borderRadius: settings?.borderRadius || "8px",
  height: "100%",
  width: "100%",
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "center",
}));

const DashboardTextWidget = ({ data, width, height }) => {
  const settings = data.settings || {};

  return (
    <StyledPaper settings={settings}>
      <Typography
        sx={{
          color: settings.titleColor || "#000000",
          fontFamily: settings.titleFontFamily || "inherit",
          fontSize: settings.titleFontSize || "16px",
          fontWeight: settings.titleFontWeight || "normal",
          fontStyle: settings.titleFontStyle || "normal",
          textDecoration: settings.titleTextDecoration || "none",
          textAlign: "center",
          wordBreak: "break-word",
          overflowWrap: "break-word",
          maxWidth: "100%",
        }}
      >
        {data.text || "Text Widget"}
      </Typography>
    </StyledPaper>
  );
};

export default DashboardTextWidget;
  