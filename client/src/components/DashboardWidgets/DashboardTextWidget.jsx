import React from "react";
import { Box, Card, CardContent, Typography } from "@mui/material";
import { styled } from "@mui/material/styles";

const customDefaultWidgetSettings = {
  backgroundColor: "#cff7ba",
  borderColor: "#417505",
  borderRadius: "3px",
  borderWidth: "1px",
  titleColor: "#000000",
  titleFontFamily: "Georgia",
  titleFontSize: "14px",
  titleFontStyle: "normal",
  titleFontWeight: "normal",
  titleTextDecoration: "none",
  valueColor: "#d0021b",
  valueFontFamily: "Arial",
  valueFontSize: "24px",
  valueFontStyle: "normal",
  valueFontWeight: "bold",
  valueTextDecoration: "none",
};
// ------------- Styled component for the card with custom settings ------------------
const StyledCard = styled(Card)(({ theme, settings }) => ({
  transition: "all 0.3s",
  background: settings?.backgroundColor || theme.palette.background.paper,
  border: `${settings?.borderWidth || "1px"} solid ${
    settings?.borderColor || "#e0e0e0"
  }`,
  borderRadius: settings?.borderRadius || "8px",
}));

const DashboardTextWidget = ({ data, width, height }) => {
  const { textContent, settings: providedSettings = {} } = data || {};
  const settings = { ...customDefaultWidgetSettings, ...providedSettings };

  return (
    <StyledCard
      variant="outlined"
      settings={settings}
      sx={{ width: "100%", height: "100%" }}
    >
      <CardContent>
        <Box
          sx={{
            flexGrow: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            overflow: "auto",
          }}
        >
          <Typography
            sx={{
              color: settings.titleColor,
              fontFamily: settings.titleFontFamily,
              fontSize: settings.titleFontSize,
              fontWeight: settings.titleFontWeight,
              fontStyle: settings.titleFontStyle,
              textDecoration: settings.titleTextDecoration,
              wordBreak: "break-word",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {textContent || "No text provided"}
          </Typography>
        </Box>
      </CardContent>
    </StyledCard>
  );
};

export default DashboardTextWidget;
