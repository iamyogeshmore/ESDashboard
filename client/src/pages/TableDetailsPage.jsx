import React, { useState, useEffect, useCallback, useContext } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Paper,
  CircularProgress,
  Grid,
  TextField,
  Chip,
  IconButton,
  Select,
  MenuItem,
  FormControl,
  Button,
  Snackbar,
  Slide,
  InputLabel,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import DeleteIcon from "@mui/icons-material/Delete";
import SaveIcon from "@mui/icons-material/Save";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import TableChartIcon from "@mui/icons-material/TableChart";
import BarChartIcon from "@mui/icons-material/BarChart";
import { ArrowUpward, ArrowDownward } from "@mui/icons-material";
import MuiAlert from "@mui/material/Alert";
import { styled, styled as muiStyled } from "@mui/material/styles";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import "../styles/TableDetailsPage.css";
import { ThemeContext } from "../contexts/ThemeContext";
import GraphComponent from "../components/Widgets/HDDGraph";

// --------------- Base API endpoint from environment variables ---------------
const BASE_URL = `${process.env.REACT_APP_API_LOCAL_URL}api/hdd`;

// ---------------- Styled component for displaying value differences -----------------
const DifferenceBox = styled(Box)(({ theme, isNegative, isZero }) => ({
  display: "flex",
  alignItems: "center",
  gap: "4px",
  color: isNegative ? "#d32f2f" : isZero ? "#388e3c" : "#388e3c",
  fontSize: "0.75rem",
  borderRadius: "4px",
}));

// ---------------- Styled component for menu items in the measurand selector -----------------
const StyledMenuItem = styled(MenuItem)(({ theme, isSelected }) => ({
  backgroundColor: isSelected
    ? theme.palette.mode === "dark"
      ? "#0288d1"
      : "#e1f5fe"
    : "inherit",
  color: isSelected
    ? theme.palette.mode === "dark"
      ? "white"
      : "#0288d1"
    : "inherit",
  "&:hover": {
    backgroundColor: isSelected
      ? theme.palette.mode === "dark"
        ? "#4fc3f7"
        : "#b3e5fc"
      : theme.palette.action.hover,
  },
}));

// ---------------- Styled component for paper containers -----------------
const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: "16px",
  boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
  background:
    theme.palette.mode === "dark"
      ? "linear-gradient(145deg, #1e1e1e 0%, #2c2c2c 100%)"
      : "linear-gradient(145deg, #ffffff 0%, #f5f7fa 100%)",
  color: theme.palette.text.primary,
}));

// ---------------- Styled component for the app bar -----------------
const StyledAppBar = styled(AppBar)(({ theme }) => ({
  background:
    theme.palette.mode === "dark"
      ? "linear-gradient(45deg, #0288d1 30%, #4fc3f7 90%)"
      : "linear-gradient(45deg, #1976d2 30%, #42a5f5 90%)",
  boxShadow: "0 4px 16px rgba(0,0,0,0.3)",
}));

// ---------------- Styled component for buttons -----------------
const StyledButton = styled(Button)(({ theme }) => ({
  borderRadius: "8px",
  padding: theme.spacing(1, 3),
  margin: theme.spacing(1, 0),
  background:
    theme.palette.mode === "dark"
      ? "linear-gradient(45deg, #388e3c 30%, #4caf50 90%)"
      : "linear-gradient(45deg, #43a047 30%, #66bb6a 90%)",
  color: "white",
  "&:hover": {
    background:
      theme.palette.mode === "dark"
        ? "linear-gradient(45deg, #4caf50 30%, #388e3c 90%)"
        : "linear-gradient(45deg, #66bb6a 30%, #43a047 90%)",
  },
}));

// ---------------- Styled component for the data grid -----------------
const StyledDataGrid = styled(DataGrid)(({ theme }) => ({
  "& .MuiDataGrid-root": {
    border: "none",
    borderRadius: "12px",
    background: theme.palette.background.paper,
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
  },
  "& .MuiDataGrid-cell": {
    borderBottom: `1px solid ${theme.palette.divider}`,
    color: theme.palette.text.primary,
    padding: theme.spacing(1),
  },
  "& .MuiDataGrid-columnHeaders": {
    background:
      theme.palette.mode === "dark"
        ? "linear-gradient(45deg, #2c2c2c 30%, #424242 90%)"
        : "linear-gradient(45deg, #eceff1 30%, #f5f7fa 90%)",
    color: theme.palette.text.primary,
    fontWeight: "bold",
  },
}));

// ---------------- Styled component for export buttons -----------------
const ExportButton = styled(IconButton)(({ theme }) => ({
  background:
    theme.palette.mode === "dark"
      ? "linear-gradient(45deg, #0288d1 30%, #4fc3f7 90%)"
      : "linear-gradient(45deg, #1976d2 30%, #42a5f5 90%)",
  color: "white",
  margin: theme.spacing(0, 1),
  padding: theme.spacing(1.5),
  borderRadius: "50%",
  "&:hover": {
    background:
      theme.palette.mode === "dark"
        ? "linear-gradient(45deg, #4fc3f7 30%, #0288d1 90%)"
        : "linear-gradient(45deg, #42a5f5 30%, #1976d2 90%)",
  },
}));

// ---------------- Styled component for analysis cards -----------------
const AnalysisCard = styled(Box)(({ theme }) => ({
  padding: "16px",
  borderRadius: "12px",
  background:
    theme.palette.mode === "dark"
      ? "linear-gradient(145deg, #1e1e1e 0%, #2c2c2c 100%)"
      : "linear-gradient(145deg, #ffffff 0%, #f5f7fa 100%)",
  boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
}));

// ---------------- Styled component for snackbar notifications -----------------
const StyledSnackbar = muiStyled(Snackbar)(({ theme }) => ({
  "& .MuiSnackbarContent-root": {
    background:
      theme.palette.mode === "dark"
        ? "linear-gradient(45deg, #1e1e1e 0%, #2c2c2c 100%)"
        : "linear-gradient(45deg, #ffffff 0%, #f5f7fa 100%)",
    color: theme.palette.text.primary,
    borderRadius: "12px",
    boxShadow: "0 4px 15px rgba(0,0,0,0.2)",
    padding: theme.spacing(1, 2),
  },
}));

// ---------------- Styled component for alerts within snackbar -----------------
const StyledAlert = muiStyled(MuiAlert)(({ theme, severity }) => ({
  background: "transparent",
  color: theme.palette.text.primary,
  alignItems: "center",
  "& .MuiAlert-icon": {
    color:
      severity === "success"
        ? theme.palette.success.main
        : severity === "error"
        ? theme.palette.error.main
        : theme.palette.info.main,
  },
}));

const TableDetailsPage = () => {
  const { tableId } = useParams();
  const navigate = useNavigate();
  const { isDarkMode } = useContext(ThemeContext);
  const [table, setTable] = useState(null);
  const [loading, setLoading] = useState(false);
  const [gridLoading, setGridLoading] = useState(true);
  const [measurandOptions, setMeasurandOptions] = useState([]);
  const [availableMeasurands, setAvailableMeasurands] = useState([]);
  const [newMeasurand, setNewMeasurand] = useState("");
  const [selectedRows, setSelectedRows] = useState([]);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "info",
    loading: false,
  });
  const [graphDialog, setGraphDialog] = useState({
    open: false,
    measurand: null,
  });

  // ---------------- Default date filter setup -----------------
  const defaultStart = "2025-01-01T00:00";
  const defaultEnd = new Date().toISOString().slice(0, 16);
  const [dateFilter, setDateFilter] = useState({
    start: defaultStart,
    end: defaultEnd,
  });

  const [measurandData, setMeasurandData] = useState({});

  // ---------------- Transition component for snackbar -----------------
  const TransitionLeft = (props) => {
    return <Slide {...props} direction="left" />;
  };

  // ---------------- Shows a snackbar notification -----------------
  const showSnackbar = (message, severity = "info", loading = false) => {
    setSnackbar({
      open: true,
      message,
      severity,
      loading,
    });
  };

  // ---------------- Hides the snackbar -----------------
  const hideSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false, loading: false }));
  };

  // ---------------- Handles snackbar close events -----------------
  const handleSnackbarClose = (event, reason) => {
    if (reason === "clickaway") return;
    hideSnackbar();
  };

  // ---------------- Fetches initial table data -----------------
  const fetchTableData = useCallback(() => {
    setLoading(true);
    setGridLoading(true);
    showSnackbar("Fetching table data", "info", true);

    axios
      .get(`${BASE_URL}/`)
      .then((response) => {
        const foundTable = response.data.find((t) => t._id === tableId);
        if (foundTable) {
          setTable(foundTable);
          setMeasurandOptions(foundTable.measurandNames || []);
          showSnackbar("Table data loaded successfully", "success");
        } else {
          showSnackbar("Table not found", "error");
        }
        setLoading(false);
        setGridLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching table:", error);
        showSnackbar("Failed to load table data", "error");
        setLoading(false);
        setGridLoading(false);
      });
  }, [tableId]);

  // ---------------- Fetches available measurands -----------------
  const fetchAvailableMeasurands = useCallback(() => {
    if (!table?.plantName || !table?.terminalName) return;
    showSnackbar("Fetching available measurands", "info", true);
    axios
      .get(`${BASE_URL}/measurands/${table.plantName}/${table.terminalName}`)
      .then((response) => {
        setAvailableMeasurands(response.data);
        showSnackbar("Measurands loaded successfully", "success");
      })
      .catch((error) => {
        console.error("Error fetching available measurands:", error);
        showSnackbar("Failed to load measurands", "error");
      });
  }, [table]);

  // ---------------- Fetches historical measurand data -----------------
  const fetchMeasurandData = useCallback(() => {
    if (!table?.measurandNames?.length) return;
    setGridLoading(true);
    showSnackbar("Fetching measurand data", "info", true);

    const promises = table.measurandNames.map((measurand) =>
      axios
        .get(
          `${BASE_URL}/historical/${table.plantName}/${table.terminalName}/${measurand}`,
          {
            params: {
              from: dateFilter.start,
              to: dateFilter.end,
            },
          }
        )
        .then((res) => {
          const transformedData = res.data.data.map((item) => ({
            timestamp: item.Timestamp,
            value: item.MeasurandValue,
          }));
          return { measurand, data: transformedData };
        })
        .catch((error) => {
          console.error(`Error fetching ${measurand}:`, error);
          showSnackbar(`Failed to load ${measurand} data`, "error");
          return { measurand, data: [] };
        })
    );

    Promise.all(promises)
      .then((results) => {
        const newData = {};
        results.forEach(({ measurand, data }) => {
          newData[measurand] = data;
        });
        setMeasurandData(newData);
        setGridLoading(false);
        showSnackbar("Measurand data loaded successfully", "success");
      })
      .catch((error) => {
        console.error("Error in Promise.all:", error);
        setGridLoading(false);
        showSnackbar("Failed to load measurand data", "error");
      });
  }, [table, dateFilter]);

  // ---------------- Effect to fetch table data on mount or tableId change -----------------
  useEffect(() => {
    fetchTableData();
  }, [tableId, fetchTableData]);

  // ---------------- Effect to fetch measurand data when table or date filter changes -----------------
  useEffect(() => {
    if (table) {
      fetchMeasurandData();
    }
  }, [table, dateFilter, fetchMeasurandData]);

  // ---------------- Effect to fetch available measurands when table changes -----------------
  useEffect(() => {
    if (table) {
      fetchAvailableMeasurands();
    }
  }, [table, fetchAvailableMeasurands]);

  // ---------------- Handles adding a new measurand -----------------
  const handleMeasurandChange = (event) => {
    const selectedMeasurand = event.target.value;
    if (
      selectedMeasurand &&
      !measurandOptions.includes(selectedMeasurand) &&
      availableMeasurands.includes(selectedMeasurand)
    ) {
      showSnackbar(`Adding ${selectedMeasurand}`, "info", true);
      setMeasurandOptions([...measurandOptions, selectedMeasurand]);
      setNewMeasurand("");
      axios
        .get(
          `${BASE_URL}/historical/${table.plantName}/${table.terminalName}/${selectedMeasurand}`,
          {
            params: {
              from: dateFilter.start,
              to: dateFilter.end,
            },
          }
        )
        .then((res) => {
          const transformedData = res.data.data.map((item) => ({
            timestamp: item.Timestamp,
            value: item.MeasurandValue,
          }));
          setMeasurandData((prev) => ({
            ...prev,
            [selectedMeasurand]: transformedData,
          }));
          showSnackbar(`${selectedMeasurand} added successfully`, "success");
        })
        .catch((error) => {
          console.error("Error fetching new measurand values:", error);
          showSnackbar(`Failed to add ${selectedMeasurand}`, "error");
        });
    }
  };

  // ---------------- Saves the current configuration -----------------
  const handleSave = () => {
    showSnackbar("Saving configuration", "info", true);
    axios
      .put(`${BASE_URL}/${tableId}`, {
        measurandNames: measurandOptions,
      })
      .then((response) => {
        showSnackbar("Configuration saved successfully", "success");
      })
      .catch((error) => {
        console.error("Error updating table:", error);
        showSnackbar("Failed to save configuration", "error");
      });
  };

  // ---------------- Calculates statistics for measurand data -----------------
  const calculateStats = useCallback(() => {
    const stats = {};
    Object.entries(measurandData).forEach(([measurand, data]) => {
      const values = data.map((d) => d.value).filter((v) => v !== null);
      if (values.length > 0) {
        stats[measurand] = {
          min: Math.min(...values).toFixed(2),
          max: Math.max(...values).toFixed(2),
          avg: (values.reduce((a, b) => a + b, 0) / values.length).toFixed(2),
        };
      } else {
        stats[measurand] = { min: "N/A", max: "N/A", avg: "N/A" };
      }
    });
    return stats;
  }, [measurandData]);

  // ---------------- Generates rows for the data grid -----------------
  const generateRows = useCallback(() => {
    if (!Object.keys(measurandData).length) return [];
    const allTimestamps = new Set();
    Object.values(measurandData).forEach((measurandValues) => {
      measurandValues.forEach((data) => {
        allTimestamps.add(data.timestamp);
      });
    });

    return Array.from(allTimestamps)
      .sort((a, b) => new Date(b) - new Date(a))
      .slice(0, 1000)
      .map((timestamp, index) => {
        const row = { id: index, timestamp };
        measurandOptions.forEach((option) => {
          const dataPoint = measurandData[option]?.find(
            (dp) => dp.timestamp === timestamp
          );
          row[option] = dataPoint?.value ?? null;
        });
        return row;
      });
  }, [measurandData, measurandOptions]);

  // ---------------- Generates columns for the data grid -----------------
  const generateColumns = useCallback(() => {
    if (!table || !measurandOptions.length) return [];

    const rows = generateRows();

    return [
      {
        field: "timestamp",
        headerName: "Timestamp",
        width: 250,
        renderCell: (params) => (
          <Typography variant="body2">{params.value}</Typography>
        ),
      },
      ...measurandOptions.map((option) => ({
        field: option,
        headerName: (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            {option}
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                setGraphDialog({ open: true, measurand: option });
              }}
              sx={{
                color: "#1976d2",
                "&:hover": {
                  bgcolor: "rgba(25, 118, 210, 0.1)",
                  transform: "scale(1.1)",
                  transition: "all 0.2s",
                },
              }}
            >
              <BarChartIcon fontSize="small" />
            </IconButton>
          </Box>
        ),
        headerNameText: option,
        width: 250,
        renderCell: (params) => {
          const currentValue = params.value;
          const rowIndex = params.row.id;
          const nextValue =
            rowIndex < rows.length - 1 ? rows[rowIndex + 1][option] : null;

          let difference = null;
          let isNegative = false;
          let isZero = false;

          if (currentValue !== null && nextValue !== null) {
            difference = (currentValue - nextValue).toFixed(2);
            isNegative = difference < 0;
            isZero = difference === "0.00";
          }

          return (
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Typography variant="body2">
                {currentValue !== null ? currentValue.toFixed(2) : "N/A"}
              </Typography>
              {difference !== null && (
                <DifferenceBox isNegative={isNegative} isZero={isZero}>
                  {isNegative && <ArrowDownward fontSize="small" />}
                  {!isNegative && !isZero && <ArrowUpward fontSize="small" />}
                  {!isZero && difference}
                </DifferenceBox>
              )}
            </Box>
          );
        },
      })),
    ];
  }, [table, measurandOptions, generateRows]);

  // ---------------- Handles row selection in the data grid -----------------
  const handleRowSelection = (selectionModel) => {
    const newSelection = selectionModel.slice(0, 2);
    setSelectedRows(
      generateRows().filter((row) => newSelection.includes(row.id))
    );
  };

  // ---------------- Deletes a measurand from options -----------------
  const handleDeleteMeasurand = (option) => {
    setMeasurandOptions((prev) => prev.filter((opt) => opt !== option));
    setMeasurandData((prev) => {
      const newData = { ...prev };
      delete newData[option];
      return newData;
    });
  };

  // ---------------- Exports table data to PDF -----------------
  const exportToPDF = () => {
    const doc = new jsPDF({
      orientation: "landscape",
      unit: "pt",
      format: "a4",
    });

    doc.setFontSize(16);
    doc.text(`Table Data - ${table?.profile || "Unknown"}`, 40, 40);

    const columns = generateColumns();
    const rows = generateRows();
    const stats = calculateStats();

    const exportColumns = columns.map(
      (col) => col.headerNameText || col.headerName
    );

    const exportRows = rows.map((row) =>
      columns.map((col) =>
        col.field === "timestamp"
          ? row[col.field]
          : row[col.field] !== null && row[col.field] !== undefined
          ? Number(row[col.field]).toFixed(2)
          : "N/A"
      )
    );

    autoTable(doc, {
      startY: 60,
      head: [exportColumns],
      body: exportRows,
      theme: "striped",
      styles: { fontSize: 8, cellPadding: 4 },
      headStyles: {
        fillColor: isDarkMode ? [33, 150, 243] : [25, 118, 210],
        textColor: 255,
      },
    });

    let finalY = doc.lastAutoTable.finalY + 20;
    doc.setFontSize(12);
    doc.text("Statistics", 40, finalY);

    const statsData = Object.entries(stats).map(([measurand, stat]) => [
      measurand,
      stat.min,
      stat.max,
      stat.avg,
    ]);

    autoTable(doc, {
      startY: finalY + 10,
      head: [["Measurand", "Min", "Max", "Avg"]],
      body: statsData,
      theme: "grid",
      styles: { fontSize: 8, cellPadding: 4 },
      headStyles: {
        fillColor: isDarkMode ? [33, 150, 243] : [25, 118, 210],
        textColor: 255,
      },
    });

    doc.save(`table_${tableId}_data.pdf`);
  };

  // ---------------- Exports table data to Excel -----------------
  const exportToExcel = () => {
    const columns = generateColumns();
    const rows = generateRows();
    const stats = calculateStats();

    const exportColumns = columns.map(
      (col) => col.headerNameText || col.headerName
    );

    const exportRows = [
      exportColumns,
      ...rows.map((row) =>
        columns.map((col) =>
          col.field === "timestamp"
            ? row[col.field]
            : row[col.field] !== null && row[col.field] !== undefined
            ? Number(row[col.field]).toFixed(2)
            : "N/A"
        )
      ),
    ];

    const statsData = [
      ["Statistics"],
      ["Measurand", "Min", "Max", "Avg"],
      ...Object.entries(stats).map(([measurand, stat]) => [
        measurand,
        stat.min,
        stat.max,
        stat.avg,
      ]),
    ];

    const worksheet = XLSX.utils.aoa_to_sheet([
      ...exportRows,
      [],
      ...statsData,
    ]);
    worksheet["!cols"] = exportColumns.map(() => ({ wch: 20 }));

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Table Data");
    XLSX.writeFile(workbook, `table_${tableId}_data.xlsx`, {
      compression: true,
    });
  };

  // ---------------- Navigates back to previous page -----------------
  const handleBackClick = () => navigate(-1);

  // ---------------- Loading state UI -----------------
  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  // ---------------- Table not found UI -----------------
  if (!table) {
    return (
      <Box sx={{ p: 4, textAlign: "center" }}>
        <StyledButton
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={handleBackClick}
        >
          Back to Tables
        </StyledButton>
        <Typography variant="h5" color="error" sx={{ mt: 2 }}>
          Table not found
        </Typography>
      </Box>
    );
  }

  const stats = calculateStats();

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: isDarkMode
          ? "linear-gradient(135deg, #1a1a1a 0%, #2c2c2c 100%)"
          : "linear-gradient(135deg, #f5f7fa 0%, #e4e9f2 100%)",
      }}
    >
      <StyledAppBar position="static">
        <Toolbar
          sx={{
            justifyContent: "space-between",
            backdropFilter: "blur(10px)",
            background: isDarkMode
              ? "rgba(2, 136, 209, 0.9)"
              : "rgba(25, 118, 210, 0.9)",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <IconButton
              edge="start"
              color="inherit"
              onClick={handleBackClick}
              sx={{
                "&:hover": {
                  bgcolor: "rgba(255, 255, 255, 0.1)",
                  transform: "scale(1.1)",
                  transition: "all 0.2s",
                },
              }}
            >
              <ArrowBackIcon />
            </IconButton>
            <Typography
              variant="h6"
              sx={{
                ml: 2,
                fontWeight: 600,
                letterSpacing: 0.5,
              }}
            >
              {table.profile.charAt(0).toUpperCase() + table.profile.slice(1)} -
              Table Details
            </Typography>
          </Box>
        </Toolbar>
      </StyledAppBar>

      <Grid container spacing={4} sx={{ p: 4 }}>
        <Grid item xs={12} md={3}>
          <StyledPaper
            sx={{
              transition: "transform 0.3s",
              "&:hover": { transform: "translateY(-4px)" },
            }}
          >
            <Typography
              variant="h5"
              sx={{
                mb: 2,
                fontWeight: 600,
                color: isDarkMode ? "#4fc3f7" : "#1976d2",
              }}
            >
              Configuration
            </Typography>
            <TextField
              label="Profile"
              value={
                table.profile.charAt(0).toUpperCase() + table.profile.slice(1)
              }
              fullWidth
              disabled
              sx={{ mb: 2 }}
            />
            <TextField
              label="Plant"
              value={table.plantName}
              fullWidth
              disabled
              sx={{ mb: 2 }}
            />
            <TextField
              label="Terminal"
              value={table.terminalName}
              fullWidth
              disabled
              sx={{ mb: 2 }}
            />
            <Typography
              variant="subtitle1"
              sx={{
                mb: 1,
                color: isDarkMode ? "#90caf9" : "#1976d2",
                fontWeight: 500,
              }}
            >
              Measurand Options
            </Typography>
            <Box sx={{ mb: 2 }}>
              {measurandOptions.map((option) => (
                <Chip
                  key={option}
                  label={option}
                  onDelete={() => handleDeleteMeasurand(option)}
                  deleteIcon={<DeleteIcon />}
                  sx={{
                    mr: 1,
                    mb: 1,
                    bgcolor: isDarkMode ? "#0288d1" : "#e1f5fe",
                    color: isDarkMode ? "white" : "#0288d1",
                    transition: "all 0.2s",
                    "&:hover": {
                      bgcolor: isDarkMode ? "#4fc3f7" : "#b3e5fc",
                      transform: "scale(1.05)",
                    },
                    "& .MuiChip-deleteIcon": {
                      color: "red",
                      "&:hover": { color: "#8B0000" },
                    },
                  }}
                />
              ))}
            </Box>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel
                sx={{
                  color: isDarkMode ? "#90caf9" : "#1976d2",
                  "&.Mui-focused": {
                    color: isDarkMode ? "#4fc3f7" : "#1976d2",
                  },
                }}
              >
                Select Measurand
              </InputLabel>
              <Select
                value={newMeasurand}
                onChange={handleMeasurandChange}
                label="Select Measurand"
                sx={{
                  "& .MuiSelect-select": {
                    color: isDarkMode ? "#fff" : "#333",
                  },
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: isDarkMode ? "#4fc3f7" : "#1976d2",
                  },
                  "&:hover .MuiOutlinedInput-notchedOutline": {
                    borderColor: isDarkMode ? "#90caf9" : "#42a5f5",
                  },
                }}
              >
                <StyledMenuItem value="">
                  <em>Select an option</em>
                </StyledMenuItem>
                {availableMeasurands.map((option) => (
                  <StyledMenuItem
                    key={option}
                    value={option}
                    isSelected={measurandOptions.includes(option)}
                  >
                    {option}
                  </StyledMenuItem>
                ))}
              </Select>
            </FormControl>
            <StyledButton
              variant="contained"
              startIcon={<SaveIcon />}
              onClick={handleSave}
              fullWidth
              sx={{
                transition: "all 0.3s",
                "&:hover": {
                  transform: "translateY(-2px)",
                  boxShadow: "0 6px 20px rgba(0,0,0,0.2)",
                },
              }}
            >
              Save Configuration
            </StyledButton>
            <Typography variant="h6" sx={{ mt: 3, mb: 2 }}>
              Date Filters
            </Typography>
            <TextField
              type="datetime-local"
              label="Start Date"
              value={dateFilter.start}
              onChange={(e) =>
                setDateFilter((prev) => ({ ...prev, start: e.target.value }))
              }
              InputLabelProps={{ shrink: true }}
              fullWidth
              sx={{ mb: 2 }}
            />
            <TextField
              type="datetime-local"
              label="End Date"
              value={dateFilter.end}
              onChange={(e) =>
                setDateFilter((prev) => ({ ...prev, end: e.target.value }))
              }
              InputLabelProps={{ shrink: true }}
              fullWidth
              sx={{ mb: 2 }}
            />
            <Box
              sx={{ mt: 2, display: "flex", justifyContent: "center", gap: 2 }}
            >
              <ExportButton onClick={exportToPDF} title="Export to PDF">
                <PictureAsPdfIcon sx={{ fontSize: 28 }} />
              </ExportButton>
              <ExportButton onClick={exportToExcel} title="Export to Excel">
                <TableChartIcon sx={{ fontSize: 28 }} />
              </ExportButton>
            </Box>
          </StyledPaper>
        </Grid>
        <Grid item xs={12} md={9}>
          <StyledPaper>
            {gridLoading ? (
              <Box
                sx={{
                  height: 450,
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <CircularProgress />
              </Box>
            ) : (
              <StyledDataGrid
                rows={generateRows()}
                columns={generateColumns()}
                pageSize={10}
                rowsPerPageOptions={[10, 25, 50]}
                onSelectionModelChange={handleRowSelection}
                selectionModel={selectedRows.map((row) => row.id)}
                sx={{
                  height: 450,
                  "& .MuiDataGrid-cell": {
                    transition: "background 0.2s",
                    "&:hover": {
                      background: isDarkMode
                        ? "rgba(255, 255, 255, 0.05)"
                        : "rgba(0, 0, 0, 0.02)",
                    },
                  },
                }}
              />
            )}
          </StyledPaper>
          <StyledPaper sx={{ mt: 4 }}>
            <Typography variant="h5" sx={{ mb: 2 }}>
              Data Analysis
            </Typography>
            <Grid container spacing={2}>
              {Object.entries(stats).map(([measurand, stat]) => (
                <Grid item xs={12} sm={6} md={4} key={measurand}>
                  <AnalysisCard
                    sx={{
                      p: 2,
                      border: "1px solid #546e7a",
                      borderRadius: "8px",
                      boxShadow: "0 4px 15px rgba(0, 0, 0, 0.4)",
                      transition: "all 0.3s ease",
                      background: isDarkMode
                        ? "linear-gradient #546e7a 0%, #546e7a 100%"
                        : "linear-gradient(145deg,rgb(244, 244, 244) 0%,rgba(195, 195, 195, 0.44) 100%)",
                      "&:hover": {
                        transform: "translateY(-4px)",
                        boxShadow: "0 8px 25px rgba(0, 188, 212, 0.3)",
                        borderColor: "#00bcd4",
                      },
                    }}
                  >
                    <Typography
                      variant="subtitle1"
                      sx={{
                        fontWeight: "bold",
                        mb: 1,
                        color: "#00bcd4",
                        textTransform: "uppercase",
                        letterSpacing: "0.5px",
                        background: "linear-gradient(90deg, #00bcd4, #00e5ff)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                      }}
                    >
                      {measurand}
                    </Typography>
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 1,
                        p: 1,
                        borderRadius: "4px",
                        border: "1px solid rgba(84, 110, 122, 0.3)",
                      }}
                    >
                      <Typography
                        variant="body2"
                        sx={{
                          color: "#ff4444",
                          fontWeight: "500",
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                          "&:before": {
                            content: '"▼"',
                            fontSize: "0.8rem",
                            color: "#ff4444",
                            animation: "pulseRed 1.5s infinite",
                            "@keyframes pulseRed": {
                              "0%": { transform: "scale(1)" },
                              "50%": { transform: "scale(1.2)" },
                              "100%": { transform: "scale(1)" },
                            },
                          },
                        }}
                      >
                        Min: {stat.min}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          color: "#00cc00",
                          fontWeight: "500",
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                          "&:before": {
                            content: '"▲"',
                            fontSize: "0.8rem",
                            color: "#00cc00",
                            animation: "pulseGreen 1.5s infinite",
                            "@keyframes pulseGreen": {
                              "0%": { transform: "scale(1)" },
                              "50%": { transform: "scale(1.2)" },
                              "100%": { transform: "scale(1)" },
                            },
                          },
                        }}
                      >
                        Max: {stat.max}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: "500",
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                          color: isDarkMode ? "white" : "black",
                          "&:before": {
                            content: '"—"',
                            fontSize: "0.8rem",
                            color: "#b0bec5",
                          },
                        }}
                      >
                        Avg: {stat.avg}
                      </Typography>
                    </Box>
                  </AnalysisCard>
                </Grid>
              ))}
            </Grid>
          </StyledPaper>
        </Grid>
      </Grid>

      {graphDialog.measurand && (
        <GraphComponent
          data={measurandData[graphDialog.measurand] || []}
          measurand={graphDialog.measurand}
          open={graphDialog.open}
          onClose={() => setGraphDialog({ open: false, measurand: null })}
          allMeasurands={measurandOptions}
          allData={measurandData}
        />
      )}

      <StyledSnackbar
        open={snackbar.open}
        autoHideDuration={snackbar.loading ? null : 6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
        TransitionComponent={TransitionLeft}
      >
        <StyledAlert
          onClose={snackbar.loading ? null : handleSnackbarClose}
          severity={snackbar.severity}
          elevation={6}
          variant="filled"
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            {snackbar.loading && <CircularProgress size={20} />}
            {snackbar.message}
          </Box>
        </StyledAlert>
      </StyledSnackbar>
    </Box>
  );
};

export default TableDetailsPage;
