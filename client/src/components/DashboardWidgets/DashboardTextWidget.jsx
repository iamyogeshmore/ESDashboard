import React from "react";
import { Card, CardContent, Typography } from "@mui/material";
import { styled } from "@mui/material/styles";

const StyledCard = styled(Card)(({ theme, settings }) => ({
  transition: "all 0.3s",
  background: settings?.backgroundColor || theme.palette.background.paper,
  border: `${settings?.borderWidth || "1px"} solid ${
    settings?.borderColor || "#e0e0e0"
  }`,
  borderRadius: settings?.borderRadius || "8px",
  height: "100%",
  display: "flex",
  flexDirection: "column",
}));

const DashboardTextWidget = ({ data, width, height }) => {
  const { textContent, settings = {} } = data || {};

  return (
    <StyledCard
      variant="outlined"
      settings={settings}
      sx={{ width: "100%", height: "100%" }}
    >
      <CardContent
        sx={{
          flexGrow: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 2,
        }}
      >
        <Typography
          sx={{
            color: settings.titleColor || "#000000",
            fontFamily: settings.titleFontFamily || "inherit",
            fontSize: settings.titleFontSize || "14px",
            fontWeight: settings.titleFontWeight || "normal",
            fontStyle: settings.titleFontStyle || "normal",
            textDecoration: settings.titleTextDecoration || "none",
            wordBreak: "break-word",
            textAlign: "center",
          }}
        >
          {textContent || "No text provided"}
        </Typography>
      </CardContent>
    </StyledCard>
  );
};

export default DashboardTextWidget;
