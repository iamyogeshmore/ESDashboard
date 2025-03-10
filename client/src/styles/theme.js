import { createTheme } from "@mui/material/styles";

const lightTheme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#1976d2",
      dark: "#1565c0",
      light: "#42a5f5",
      contrastText: "#fff",
    },
    secondary: {
      main: "#dc004e",
      dark: "#b0003a",
      light: "#ff5c8d",
      contrastText: "#fff",
    },
    background: {
      default: "#f5f7fa",
      paper: "#ffffff",
    },
    text: {
      primary: "#37474f",
      secondary: "#546e7a",
      disabled: "#b0bec5",
    },
    divider: "#cfd8dc",
    success: {
      main: "#4caf50",
      light: "#e6ffe6",
      dark: "#2e7d32",
    },
    error: {
      main: "#d32f2f",
      light: "#ffe6e6",
      dark: "#b71c1c",
    },
    grey: {
      100: "#eceff1",
      200: "#cfd8dc",
      300: "#b0bec5",
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h5: { fontWeight: 600 },
    h6: { fontWeight: 700 },
    subtitle1: { fontWeight: 500 },
    body2: { fontSize: "0.875rem" },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          borderRadius: 8,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
        },
      },
    },
  },
});

const darkTheme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#90caf9",
      dark: "#42a5f5",
      light: "#bbdefb",
      contrastText: "#fff",
    },
    secondary: {
      main: "#f48fb1",
      dark: "#f06292",
      light: "#f8bbd0",
      contrastText: "#fff",
    },
    background: {
      default: "#121212",
      paper: "#1e1e1e",
    },
    text: {
      primary: "#e0e0e0",
      secondary: "#b0bec5",
      disabled: "#616161",
    },
    divider: "#424242",
    success: {
      main: "#388e3c",
      light: "#2e7d32",
      dark: "#e6ffe6",
    },
    error: {
      main: "#f44336",
      light: "#d32f2f",
      dark: "#ffe6e6",
    },
    grey: {
      700: "#424242",
      800: "#2c2c2c",
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h5: { fontWeight: 600 },
    h6: { fontWeight: 700 },
    subtitle1: { fontWeight: 500 },
    body2: { fontSize: "0.875rem" },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          borderRadius: 8,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
        },
      },
    },
  },
});

export { lightTheme, darkTheme };
