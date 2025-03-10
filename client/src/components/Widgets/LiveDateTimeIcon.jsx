import React, { useState, useEffect } from "react";
import { Box, Typography, Collapse } from "@mui/material";
import { AccessTime as TimeIcon } from "@mui/icons-material";
import "../../styles/LiveDateTimeIcon.css";

const LiveDateTimeIcon = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isHovered, setIsHovered] = useState(false);

  // ------------------ Effect to update time every second ------------------
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    // ---------------- Cleanup interval on unmount ----------------
    return () => clearInterval(timer); 
  }, []);

  // ------------------ Format date for display ------------------
  const formattedDate = currentTime.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // ------------------ Format time for display ------------------
  const formattedTime = currentTime.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  return (
    <Box
      className="live-datetime-container"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* ------------------ Time icon display ------------------ */}
      <TimeIcon className="time-icon" />

      {/* ------------------ Collapsible date and time display ------------------ */}
      <Collapse in={isHovered} orientation="horizontal" timeout={300}>
        <Box className="datetime-content">
          <Typography variant="body2" className="date-text">
            {formattedDate}
          </Typography>
          <Typography variant="body1" className="time-text">
            {formattedTime}
          </Typography>
        </Box>
      </Collapse>
    </Box>
  );
};

export default LiveDateTimeIcon;
