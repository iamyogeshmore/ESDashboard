import React, { createContext, useEffect, useState } from "react";
import {
  Alert,
  Snackbar,
  Box,
  AlertTitle,
  IconButton,
  Fade,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";

export const AlertContext = createContext();

export const AlertContextProviders = ({ children }) => {
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertMessages, setAlertMessages] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          `${process.env.REACT_APP_API_LOCAL_URL}api/getbeacons`
        );
        const result = await response.json();

        console.log("✅ API Response:", result);

        if (Array.isArray(result) && result.length > 0) {
          // Filter beacons based on PopUp and Enable
          const validBeacons = result.filter(
            (beacon) => beacon.PopUp === true && beacon.Enable === true
          );

          // Extract messages from BeaconsDetails where Status is true
          const validMessages = validBeacons.flatMap((beacon) =>
            beacon.BeaconsDetails.filter(
              (detail) => detail.Status === true
            ).map((detail) => detail.MessageOcc)
          );

          // Check if there are valid messages to display
          if (validMessages.length > 0) {
            setAlertMessages(validMessages);
            setAlertVisible(true);

            // Enhanced cycling between alerts
            const cycleAlerts = () => {
              setAlertVisible(true);

              // Hide after 10 seconds
              setTimeout(() => {
                setAlertVisible(false);

                // After hiding, prepare for the next alert
                setTimeout(() => {
                  setCurrentIndex(
                    (prevIndex) => (prevIndex + 1) % validMessages.length
                  );
                  cycleAlerts(); // Show the next alert
                }, 60000); // Wait 1 minute before showing next
              }, 10000);
            };

            cycleAlerts();
          }
        } else {
          console.error("API response is incorrect or missing data:", result);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  const handleClose = () => {
    setAlertVisible(false);
  };

  return (
    <AlertContext.Provider value={{ alertVisible, alertMessages }}>
      {children}

      {alertMessages.length > 0 && (
        <Snackbar
          open={alertVisible}
          autoHideDuration={null}
          onClose={handleClose}
          anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
          TransitionComponent={Fade}
          sx={{
            bottom: "24px",
            left: "24px",
            width: "360px",
          }}
        >
          <Alert
            icon={
              <NotificationsActiveIcon
                sx={{
                  color: "#0277bd",
                  animation: "pulse 2s infinite",
                  "@keyframes pulse": {
                    "0%": { opacity: 0.6 },
                    "50%": { opacity: 1 },
                    "100%": { opacity: 0.6 },
                  },
                }}
              />
            }
            severity="info"
            onClose={null}
            sx={{
              width: "100%",
              padding: "14px 16px",
              boxShadow: "0 6px 20px rgba(0,0,0,0.12)",
              borderRadius: "10px",
              backgroundColor: "rgba(255, 255, 255, 0.95)",
              backdropFilter: "blur(8px)",
              border: "1px solid rgba(210, 210, 210, 0.5)",
              color: "#333333",
              display: "flex",
              alignItems: "flex-start",
              overflow: "hidden",
              transition: "all 0.3s ease",
              position: "relative", // Added position relative for absolute positioning of close button
              "&:hover": {
                boxShadow: "0 8px 24px rgba(0,0,0,0.16)",
                backgroundColor: "#ffffff",
              },
              "& .MuiAlert-message": {
                padding: "0px",
                width: "100%",
              },
              "& .MuiAlert-icon": {
                padding: "8px 0 0 0",
                marginRight: "12px",
              },
            }}
          >
            {/* Close button positioned absolutely in the top right */}
            <IconButton
              size="small"
              aria-label="close"
              onClick={handleClose}
              sx={{
                position: "absolute",
                top: "8px",
                right: "8px",
                padding: "4px",
                backgroundColor: "rgba(240, 240, 240, 0.7)",
                transition: "all 0.2s ease",
                zIndex: 2,
                "&:hover": {
                  backgroundColor: "rgba(220, 220, 220, 0.9)",
                  transform: "scale(1.05)",
                },
              }}
            >
              <CloseIcon
                fontSize="small"
                sx={{ fontSize: "16px", color: "#424242" }}
              />
            </IconButton>

            <Box sx={{ width: "100%" }}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  marginBottom: "6px",
                  paddingRight: "24px", // Added padding to avoid text overlap with close button
                }}
              >
                <AlertTitle
                  sx={{
                    fontWeight: 600,
                    background: "linear-gradient(90deg, #0277bd, #0288d1)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    fontSize: "15px",
                    margin: 0,
                    padding: 0,
                    letterSpacing: "0.3px",
                  }}
                >
                  Operational Alert
                </AlertTitle>
              </Box>

              {/* Message Content with improved typography */}
              <Typography
                variant="body2"
                sx={{
                  fontSize: "13px",
                  lineHeight: 1.5,
                  overflow: "hidden",
                  display: "-webkit-box",
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: "vertical",
                  color: "#424242",
                  marginBottom: "8px",
                  maxHeight: "60px",
                  letterSpacing: "0.2px",
                }}
              >
                {alertMessages[currentIndex]}
              </Typography>

              {/* Bottom row with logo and counter */}
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginTop: "6px",
                }}
              >
                <Typography
                  variant="caption"
                  sx={{
                    color: "#757575",
                    fontSize: "11px",
                    opacity: 0.8,
                  }}
                >
                  {currentIndex + 1} of {alertMessages.length}
                </Typography>

                <img
                  src="/logo1.png"
                  alt="Logo"
                  height="18"
                  style={{
                    opacity: 0.9,
                    filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.1))",
                  }}
                />
              </Box>
            </Box>
          </Alert>
        </Snackbar>
      )}
    </AlertContext.Provider>
  );
};
