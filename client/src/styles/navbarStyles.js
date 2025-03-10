import { styled } from "@mui/material/styles";
import { Box, Badge, AppBar } from "@mui/material";

export const ThemeSwitch = styled(Box)(({ theme }) => ({
  position: "relative",
  width: "36px",
  height: "20px",
  marginLeft: "16px",
  cursor: "pointer",
  borderRadius: "34px",
  background:
    theme.palette.mode === "dark"
      ? "linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)"
      : "linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)",
  transition: "background 0.3s ease-in-out",
  "&:hover": {
    boxShadow:
      theme.palette.mode === "dark"
        ? "0 0 12px rgba(33, 150, 243, 0.8)"
        : "0 0 12px rgba(255, 142, 83, 0.8)",
    transform: "scale(1.05)",
  },
}));

export const SwitchKnob = styled(Box)(({ theme, isDarkMode }) => ({
  position: "absolute",

  left: isDarkMode ? "18px" : "1px",

  borderRadius: "50%",
  background: "#fff",
  transition: "left 0.3s cubic-bezier(0.68, -0.55, 0.27, 1.55)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
  color: isDarkMode ? "#2196F3" : "#FF8E53",
  "&:hover": {
    transform: "scale(1.1)",
  },
}));

export const NavItem = styled("div", {
  shouldForwardProp: (prop) => prop !== "active",
})(({ theme, active }) => ({
  display: "flex",
  alignItems: "center",
  marginLeft: theme.spacing(1),
  marginRight: theme.spacing(1),
  borderRadius: theme.shape.borderRadius,
  padding: theme.spacing(0.5, 1.5),
  transition: "all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)",
  cursor: "pointer",
  backgroundColor: active
    ? theme.palette.mode === "dark"
      ? "rgba(33, 150, 243, 0.2)"
      : "rgba(255, 255, 255, 0.25)"
    : "transparent",
  boxShadow: active
    ? theme.palette.mode === "dark"
      ? "0 0 10px rgba(33, 150, 243, 0.5)"
      : "0 0 10px rgba(255, 255, 255, 0.3)"
    : "none",
  border: active
    ? theme.palette.mode === "dark"
      ? "1px solid rgba(33, 150, 243, 0.5)"
      : "1px solid rgba(255, 255, 255, 0.5)"
    : "1px solid transparent",
  "&:hover": {
    backgroundColor:
      theme.palette.mode === "dark"
        ? "rgba(255, 255, 255, 0.1)"
        : "rgba(255, 255, 255, 0.3)",
    transform: "translateY(-3px)",
    boxShadow: active
      ? theme.palette.mode === "dark"
        ? "0 7px 14px rgba(33, 150, 243, 0.6)"
        : "0 7px 14px rgba(255, 255, 255, 0.4)"
      : theme.palette.mode === "dark"
      ? "0 7px 14px rgba(0, 0, 0, 0.3)"
      : "0 7px 14px rgba(0, 0, 0, 0.1)",
  },
  "&:active": {
    transform: "translateY(-1px)",
    boxShadow: "0 3px 6px rgba(0, 0, 0, 0.1)",
  },
}));

export const StyledBadge = styled(Badge)(({ theme }) => ({
  "& .MuiBadge-badge": {
    backgroundColor: "#44b700",
    color: "#44b700",
    boxShadow: `0 0 0 2px ${theme.palette.background.paper}`,
    "&::after": {
      position: "absolute",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      borderRadius: "50%",
      animation: "ripple 1.5s infinite ease-in-out",
      border: "1px solid currentColor",
      content: '""',
    },
  },
  "@keyframes ripple": {
    "0%": {
      transform: "scale(.8)",
      opacity: 1,
    },
    "50%": {
      transform: "scale(1.6)",
      opacity: 0.5,
    },
    "100%": {
      transform: "scale(2.4)",
      opacity: 0,
    },
  },
}));

export const StyledAppBar = styled(AppBar)(({ theme }) => ({
  background:
    theme.palette.mode === "dark"
      ? "linear-gradient(90deg, #1a237e 0%, #303f9f 100%)"
      : "linear-gradient(90deg, #1976d2 0%, #42a5f5 100%)",
  transition: "background 0.3s ease",
  boxShadow:
    theme.palette.mode === "dark"
      ? "0 4px 20px rgba(0, 0, 0, 0.5)"
      : "0 4px 20px rgba(25, 118, 210, 0.3)",
  "&::before": {
    content: '""',
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "2px",
    background:
      "linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.7) 50%, rgba(255,255,255,0) 100%)",
  },
}));

export const useNavbarStyles = (theme) => ({
  menuButton: {
    mr: 2,
    transition: "transform 0.3s cubic-bezier(0.68, -0.55, 0.27, 1.55)",
    "&:hover": {
      transform: "rotate(180deg) scale(1.1)",
    },
  },

  title: {
    flexGrow: 1,
    fontWeight: 700,
    letterSpacing: 1.2,
    backgroundImage:
      "linear-gradient(45deg, #FFF 30%, rgba(255,255,255,0.8) 90%)",
    backgroundClip: "text",
    textFillColor: "transparent",
    textShadow: "0px 2px 5px rgba(0,0,0,0.2)",
    display: "flex",
    alignItems: "center",
    gap: 1,
  },

  adminBadge: {
    padding: "3px 8px",
    borderRadius: "4px",
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    backdropFilter: "blur(5px)",
    boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
    border: "1px solid rgba(255,255,255,0.2)",
    fontSize: "0.7rem",
    fontWeight: 600,
    letterSpacing: "0.5px",
    textTransform: "uppercase",
  },

  navItems: {
    display: "flex",
    alignItems: "center",
  },

  navItemText: {
    ml: 0.5,
    display: { xs: "none", sm: "block" },
    fontWeight: 500,
    transition: "color 0.2s ease",
    "&:hover": {
      color:
        theme.palette.mode === "dark"
          ? "rgba(255, 255, 255, 0.9)"
          : "rgba(255, 255, 255, 1)",
    },
  },

  menuPaper: {
    mt: 1.5,
    borderRadius: 2,
    minWidth: 180,
    overflow: "hidden",
    boxShadow:
      theme.palette.mode === "dark"
        ? "0 8px 20px rgba(0, 0, 0, 0.6)"
        : "0 8px 20px rgba(0, 0, 0, 0.1)",
    border:
      theme.palette.mode === "dark"
        ? "1px solid rgba(255, 255, 255, 0.1)"
        : "1px solid rgba(0, 0, 0, 0.05)",
  },

  menuItem: {
    transition: "background-color 0.2s ease",
    "&:hover": {
      backgroundColor:
        theme.palette.mode === "dark"
          ? "rgba(255, 255, 255, 0.05)"
          : "rgba(0, 0, 0, 0.02)",
    },
  },

  notificationsPaper: {
    width: 320,
    maxHeight: 350,
    mt: 1.5,
    borderRadius: 2,
    overflow: "hidden",
    boxShadow:
      theme.palette.mode === "dark"
        ? "0 8px 20px rgba(0, 0, 0, 0.6)"
        : "0 8px 20px rgba(0, 0, 0, 0.1)",
  },

  notificationsHeader: {
    p: 1.5,
    backgroundColor:
      theme.palette.mode === "dark" ? "primary.dark" : "primary.main",
    color: "white",
    borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
  },

  notificationItem: {
    display: "flex",
    flexDirection: "column",
    width: "100%",
    py: 0.5,
    transition: "background-color 0.2s ease",
    "&:hover": {
      backgroundColor:
        theme.palette.mode === "dark"
          ? "rgba(255, 255, 255, 0.05)"
          : "rgba(0, 0, 0, 0.02)",
    },
  },

  viewAllLink: {
    p: 1,
    textAlign: "center",
    color: theme.palette.primary.main,
    fontWeight: 500,
    transition: "background-color 0.2s ease",
    "&:hover": {
      backgroundColor:
        theme.palette.mode === "dark"
          ? "rgba(255, 255, 255, 0.05)"
          : "rgba(0, 0, 0, 0.02)",
      textDecoration: "underline",
    },
  },

  userMenuPaper: {
    mt: 1.5,
    borderRadius: 2,
    minWidth: 200,
    overflow: "hidden",
    boxShadow:
      theme.palette.mode === "dark"
        ? "0 8px 20px rgba(0, 0, 0, 0.6)"
        : "0 8px 20px rgba(0, 0, 0, 0.1)",
  },

  userMenuHeader: {
    p: 2,
    textAlign: "center",
    borderBottom:
      theme.palette.mode === "dark"
        ? "1px solid rgba(255, 255, 255, 0.1)"
        : "1px solid rgba(0, 0, 0, 0.05)",
    backgroundColor:
      theme.palette.mode === "dark"
        ? "rgba(255, 255, 255, 0.02)"
        : "rgba(0, 0, 0, 0.02)",
  },

  smallAvatar: {
    width: 32,
    height: 32,
    border: "2px solid white",
    transition: "transform 0.2s ease",
    "&:hover": {
      transform: "scale(1.1)",
    },
  },

  largeAvatar: {
    width: 60,
    height: 60,
    mx: "auto",
    border: "3px solid",
    borderColor: "primary.main",
    boxShadow: "0 4px 10px rgba(0, 0, 0, 0.2)",
    transition: "transform 0.2s ease",
    "&:hover": {
      transform: "scale(1.05)",
    },
  },
});

export const menuTransitionProps = {
  mountOnEnter: true,
  unmountOnExit: true,
  timeout: {
    enter: 200,
    exit: 150,
  },
};
