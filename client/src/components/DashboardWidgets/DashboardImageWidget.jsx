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
  overflow: "hidden",
}));

const DashboardImageWidget = ({ data, width, height }) => {
  const settings = data.settings || {};

  return (
    <StyledPaper settings={settings} sx={{ width: "100%", height: "100%" }}>
      <Box
        sx={{
          flexGrow: 1,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "80%",
        }}
      >
        {data.imageData ? (
          <img
            src={data.imageData}
            alt={data.name || "Image"}
            style={{
              maxWidth: "100%",
              maxHeight: "100%",
              objectFit: "contain",
            }}
            onError={(e) => {
              e.target.style.display = "none";
              e.target.nextSibling.style.display = "block";
            }}
          />
        ) : (
          <Typography
            color="text.secondary"
            sx={{ fontSize: `${Math.min(width / 25, height / 12)}px` }}
          >
            No image selected
          </Typography>
        )}
        <Typography
          color="text.secondary"
          sx={{
            display: "none",
            fontSize: `${Math.min(width / 25, height / 12)}px`,
          }}
        >
          Failed to load image
        </Typography>
      </Box>
    </StyledPaper>
  );
};

export default DashboardImageWidget;
