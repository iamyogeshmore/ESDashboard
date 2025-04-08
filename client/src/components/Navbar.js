import React, { useContext, useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Toolbar,
  IconButton,
  Typography,
  Menu,
  MenuItem,
  Box,
  Tooltip,
  Avatar,
  Badge,
  useTheme,
  Fade,
  Divider,
} from "@mui/material";
import {
  Dashboard as DashboardIcon,
  Visibility as ViewIcon,
  Notifications as NotifyIcon,
  ExitToApp as LogoutIcon,
  Menu as MenuIcon,
  WbSunny as LightModeIcon,
  NightsStay as DarkModeIcon,
} from "@mui/icons-material";
import { ThemeContext } from "../contexts/ThemeContext";
import {
  ThemeSwitch,
  SwitchKnob,
  NavItem,
  StyledBadge,
  StyledAppBar,
  useNavbarStyles,
  menuTransitionProps,
} from "../styles/navbarStyles";

const NAV_ITEMS = {
  dashboard: { path: "/", label: "Dashboard" },
  view: { path: "/terminal-view", label: "View" },
};

const Navbar = ({ toggleSidebar }) => {
  const { isDarkMode, toggleTheme } = useContext(ThemeContext);
  const [viewAnchorEl, setViewAnchorEl] = useState(null);
  const [notificationsAnchorEl, setNotificationsAnchorEl] = useState(null);
  const [userAnchorEl, setUserAnchorEl] = useState(null);
  const [currentView, setCurrentView] = useState("View");
  const [currentTime, setCurrentTime] = useState(new Date());
  const theme = useTheme();
  const styles = useNavbarStyles(theme);
  const navigate = useNavigate();
  const location = useLocation();

  const getActiveItem = useCallback(() => {
    const pathname = location.pathname;
    if (pathname === NAV_ITEMS.dashboard.path) return "dashboard";
    if (
      pathname === NAV_ITEMS.view.path ||
      pathname === "/measurand-view" ||
      pathname === "/script-view" ||
      pathname === "/log-view"
    )
      return "view";
    if (pathname.startsWith("/hdd/table/")) return "dashboard";
    return "dashboard";
  }, [location.pathname]);

  const [activeItem, setActiveItem] = useState(getActiveItem);

  useEffect(() => {
    setActiveItem(getActiveItem());
    switch (location.pathname) {
      case "/terminal-view":
        setCurrentView("Terminal View");
        break;
      case "/measurand-view":
        setCurrentView("Measurand View");
        break;
      case "/script-view":
        setCurrentView("Script View");
        break;
      case "/log-view":
        setCurrentView("Log View");
        break;
      default:
        setCurrentView("View");
    }
  }, [location.pathname, getActiveItem]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleViewClick = (event) => setViewAnchorEl(event.currentTarget);

  const handleViewSelect = (viewName, path) => {
    setCurrentView(viewName);
    setViewAnchorEl(null);
    setActiveItem("view");
    if (path) {
      navigate(path);
    }
  };

  const handleNotificationsClick = (event) =>
    setNotificationsAnchorEl(event.currentTarget);

  const handleNotificationsClose = () => setNotificationsAnchorEl(null);

  const handleUserClick = (event) => setUserAnchorEl(event.currentTarget);

  const handleUserClose = () => setUserAnchorEl(null);

  const handleNavItemClick = (item, path) => {
    setActiveItem(item);
    if (path) {
      navigate(path);
    }
  };

  return (
    <StyledAppBar position="fixed" elevation={0}>
      <Toolbar>
        <IconButton
          edge="start"
          color="inherit"
          onClick={toggleSidebar}
          sx={styles.menuButton}
        >
          <MenuIcon />
        </IconButton>
        <Typography variant="h6" sx={styles.title}>
          DASHBOARD
        </Typography>
        <Box sx={styles.navItems}>
          <Tooltip title="Dashboard" arrow>
            <NavItem
              active={activeItem === "dashboard"}
              onClick={() =>
                handleNavItemClick("dashboard", NAV_ITEMS.dashboard.path)
              }
            >
              <IconButton color="inherit" size="small">
                <DashboardIcon />
              </IconButton>
              <Typography sx={styles.navItemText}>
                {NAV_ITEMS.dashboard.label}
              </Typography>
            </NavItem>
          </Tooltip>

          <Tooltip title={`Current: ${currentView}`} arrow>
            <NavItem
              active={activeItem === "view"}
              onClick={(e) => {
                handleNavItemClick("view");
                handleViewClick(e);
              }}
            >
              <IconButton color="inherit" size="small">
                <ViewIcon />
              </IconButton>
              <Typography sx={styles.navItemText}>{currentView}</Typography>
            </NavItem>
          </Tooltip>
          <Menu
            anchorEl={viewAnchorEl}
            open={Boolean(viewAnchorEl)}
            onClose={() => setViewAnchorEl(null)}
            TransitionComponent={Fade}
            TransitionProps={menuTransitionProps}
            PaperProps={{ sx: styles.menuPaper }}
            elevation={0}
          >
            <MenuItem
              onClick={() =>
                handleViewSelect("Terminal View", "/terminal-view")
              }
              sx={styles.menuItem}
            >
              Terminal View
            </MenuItem>
            <MenuItem
              onClick={() =>
                handleViewSelect("Measurand View", "/measurand-view")
              }
              sx={styles.menuItem}
            >
              Measurand View
            </MenuItem>
            <MenuItem
              onClick={() => handleViewSelect("Script View", "/script-view")}
              sx={styles.menuItem}
            >
              Script View
            </MenuItem>
            <MenuItem
              onClick={() => handleViewSelect("Log View", "/log-view")}
              sx={styles.menuItem}
            >
              Log View
            </MenuItem>
          </Menu>

          <Tooltip title="Notifications" arrow>
            <NavItem
              active={activeItem === "notifications"}
              onClick={(e) => {
                handleNavItemClick("notifications");
                handleNotificationsClick(e);
              }}
            >
              <IconButton color="inherit" size="small">
                <Badge badgeContent={4} color="error">
                  <NotifyIcon />
                </Badge>
              </IconButton>
              <Typography sx={styles.navItemText}>Notifications</Typography>
            </NavItem>
          </Tooltip>
          <Menu
            anchorEl={notificationsAnchorEl}
            open={Boolean(notificationsAnchorEl)}
            onClose={handleNotificationsClose}
            TransitionComponent={Fade}
            TransitionProps={menuTransitionProps}
            PaperProps={{ sx: styles.notificationsPaper }}
            elevation={0}
          >
            <Box sx={styles.notificationsHeader}>
              <Typography variant="subtitle1" fontWeight="bold">
                Notifications (4)
              </Typography>
            </Box>
            <MenuItem onClick={handleNotificationsClose}>
              <Box sx={styles.notificationItem}>
                <Typography variant="subtitle2" fontWeight="bold">
                  System Update
                </Typography>
                <Typography variant="body2">New version available</Typography>
              </Box>
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleNotificationsClose}>
              <Box sx={styles.notificationItem}>
                <Typography variant="subtitle2" fontWeight="bold">
                  New Message
                </Typography>
                <Typography variant="body2">
                  You have 3 unread messages
                </Typography>
              </Box>
            </MenuItem>
            <Divider />
            <Box sx={styles.viewAllLink}>
              <Typography variant="body2">View all notifications</Typography>
            </Box>
          </Menu>

          <Tooltip title="User Settings" arrow>
            <NavItem
              active={activeItem === "user"}
              onClick={(e) => {
                handleNavItemClick("user");
                handleUserClick(e);
              }}
            >
              <IconButton color="inherit" size="small">
                <StyledBadge
                  overlap="circular"
                  anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                  variant="dot"
                >
                  <Avatar
                    alt="User"
                    src="/user-avatar.jpg"
                    sx={styles.smallAvatar}
                  />
                </StyledBadge>
              </IconButton>
            </NavItem>
          </Tooltip>
          <Menu
            anchorEl={userAnchorEl}
            open={Boolean(userAnchorEl)}
            onClose={handleUserClose}
            TransitionComponent={Fade}
            TransitionProps={menuTransitionProps}
            PaperProps={{ sx: styles.userMenuPaper }}
            elevation={0}
          >
            <Box sx={styles.userMenuHeader}>
              <Avatar
                alt="User"
                src="/user-avatar.jpg"
                sx={styles.largeAvatar}
              />
              <Typography variant="subtitle1" fontWeight="bold" mt={1}>
                Admin User
              </Typography>
              <Typography variant="body2" color="text.secondary">
                admin@example.com
              </Typography>
            </Box>
            <MenuItem onClick={handleUserClose} sx={styles.menuItem}>
              Profile
            </MenuItem>
            <MenuItem onClick={handleUserClose} sx={styles.menuItem}>
              Settings
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleUserClose} sx={styles.menuItem}>
              <LogoutIcon fontSize="small" sx={{ mr: 1 }} />
              Logout
            </MenuItem>
          </Menu>

          <Tooltip
            title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            arrow
          >
            <ThemeSwitch onClick={toggleTheme}>
              <SwitchKnob darkmode={isDarkMode.toString()}>
                {isDarkMode ? (
                  <DarkModeIcon fontSize="small" />
                ) : (
                  <LightModeIcon fontSize="small" />
                )}
              </SwitchKnob>
            </ThemeSwitch>
          </Tooltip>
        </Box>
        <Box sx={{ ml: 2 }}>{currentTime.toLocaleString()}</Box>
        <Typography variant="h6" sx={{ ml: 2, fontWeight: "bold" }}>
          EnergiSpeak
        </Typography>
      </Toolbar>
    </StyledAppBar>
  );
};

export default Navbar;
