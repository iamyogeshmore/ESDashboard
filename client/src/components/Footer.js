import React from "react";
import { Typography } from "@mui/material";
import { StyledAppBar } from "../styles/navbarStyles";

const Footer = () => (
  <StyledAppBar
    position="static"
    sx={{
      top: "auto",
      bottom: 0,
      p: 2,
      textAlign: "center",
      boxShadow: "0 -2px 10px rgba(0,0,0,0.2)",
    }}
  >
    <Typography variant="body2" sx={{ opacity: 0.8 }}>
      © {new Date().getFullYear()} | All Rights Reserved
    </Typography>
  </StyledAppBar>
);

export default Footer;
