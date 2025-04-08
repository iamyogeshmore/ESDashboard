import React, { useState, useEffect, useCallback, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
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

// ------------------ Base API endpoint from environment variables ------------------
const BASE_URL = `${process.env.REACT_APP_API_LOCAL_URL}api/hdd`;

// ------------------ Format Timestamp Function ------------------
const formatTimestamp = (timestamp) => {
  if (!timestamp) return "No timestamp available";
  const date = new Date(timestamp);
  return date.toLocaleString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
    timeZone: "Asia/Kolkata",
  });
};

// ------------------ Cache for historical data ------------------
const historicalCache = {};

const DifferenceBox = styled(Box)(({ theme, isNegative, isZero }) => ({
  display: "flex",
  alignItems: "center",
  gap: "4px",
  color: isNegative ? "#d32f2f" : isZero ? "#388e3c" : "#388e3c",
  fontSize: "0.75rem",
  borderRadius: "4px",
}));

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

const StyledAppBar = styled(AppBar)(({ theme }) => ({
  background:
    theme.palette.mode === "dark"
      ? "linear-gradient(45deg, #0288d1 30%, #4fc3f7 90%)"
      : "linear-gradient(45deg, #1976d2 30%, #42a5f5 90%)",
  boxShadow: "0 4px 16px rgba(0,0,0,0.3)",
}));

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

const AnalysisCard = styled(Box)(({ theme }) => ({
  padding: "16px",
  borderRadius: "12px",
  background:
    theme.palette.mode === "dark"
      ? "linear-gradient(145deg, #1e1e1e 0%, #2c2c2c 100%)"
      : "linear-gradient(145deg, #ffffff 0%, #f5f7fa 100%)",
  boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
}));

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
  const [measurandIds, setMeasurandIds] = useState([]);
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

  const now = new Date();
  const startOfDay = new Date(
    Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate(),
      0,
      0,
      0,
      0
    )
  );
  const defaultStart = startOfDay.toISOString().slice(0, 16);
  const defaultEnd = new Date(now.getTime()).toISOString().slice(0, 16);
  const [dateFilter, setDateFilter] = useState({
    start: defaultStart,
    end: defaultEnd,
  });

  const [measurandData, setMeasurandData] = useState({});
  const TransitionLeft = (props) => <Slide {...props} direction="left" />;

  const showSnackbar = (message, severity = "info", loading = false) => {
    setSnackbar({ open: true, message, severity, loading });
  };

  const hideSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false, loading: false }));
  };

  const handleSnackbarClose = (event, reason) => {
    if (reason === "clickaway") return;
    hideSnackbar();
  };

  const handleTimeRangeClick = (hours) => {
    const startDate = new Date(dateFilter.start + "Z");
    const endDate = new Date(startDate.getTime());
    endDate.setUTCHours(endDate.getUTCHours() + hours);
    setDateFilter({
      start: startDate.toISOString().slice(0, 16),
      end: endDate.toISOString().slice(0, 16),
    });
  };

  // ------------------ Fetch Table Data ------------------
  const fetchTableData = useCallback(async () => {
    setLoading(true);
    setGridLoading(true);
    showSnackbar("Fetching table data", "info", true);

    try {
      const response = await axios.get(`${BASE_URL}/`);
      if (!response.data.success) throw new Error(response.data.message);
      const foundTable = response.data.data.find((t) => t._id === tableId);
      if (foundTable) {
        setTable({
          ...foundTable,
          plantId: foundTable.plantId,
          terminalId: foundTable.terminalId,
          plantName: foundTable.plantName || "Unknown",
          terminalName: foundTable.terminalName || "Unknown",
        });
        setMeasurandOptions(foundTable.measurandNames || []);
        setMeasurandIds(foundTable.measurandIds || []);
        showSnackbar("Table data loaded successfully", "success");
      } else {
        throw new Error("Table not found");
      }
    } catch (error) {
      console.error("Error fetching table:", error);
      showSnackbar(error.message || "Failed to load table data", "error");
    } finally {
      setLoading(false);
      setGridLoading(false);
    }
  }, [tableId]);

  // ------------------ Fetch Available Measurands ------------------
  const fetchAvailableMeasurands = useCallback(async () => {
    if (!table?.plantId || !table?.terminalId) return;
    showSnackbar("Fetching available measurands", "info", true);

    try {
      const response = await axios.get(
        `${BASE_URL}/measurands/${table.plantId}/${table.terminalId}`
      );
      if (!response.data.success) throw new Error(response.data.message);
      setAvailableMeasurands(response.data.data || []);
      showSnackbar("Measurands loaded successfully", "success");
    } catch (error) {
      console.error("Error fetching available measurands:", error);
      showSnackbar(error.message || "Failed to load measurands", "error");
    }
  }, [table]);

  // ------------------ Fetch Historical Measurand Values ------------------
  const fetchHistoricalMeasurandValues = useCallback(async () => {
    if (!table?.terminalId || !measurandIds.length) return;
    setGridLoading(true);
    showSnackbar("Fetching historical measurand data", "info", true);

    const fetchDataForMeasurand = async (measurandId, measurandName) => {
      const cacheKey = `${table.terminalId}:${measurandId}:${dateFilter.start}:${dateFilter.end}`;
      if (historicalCache[cacheKey]) {
        console.log(`Cache hit for ${cacheKey}`);
        return { measurandName, data: historicalCache[cacheKey] };
      }

      try {
        const response = await axios.get(
          `${BASE_URL}/historical/${table.terminalId}/${measurandId}?from=${dateFilter.start}&to=${dateFilter.end}`
        );
        if (!response.data.success) throw new Error(response.data.message);
        const result = response.data.data.map((item) => ({
          timestamp: item.Timestamp,
          value: item.MeasurandValue,
          name: item.MeasurandName,
        }));
        historicalCache[cacheKey] = result;
        return { measurandName, data: result };
      } catch (error) {
        console.error(`Error fetching ${measurandName}:`, error);
        showSnackbar(
          error.message || `Failed to load ${measurandName} data`,
          "error"
        );
        return { measurandName, data: [] };
      }
    };

    try {
      const promises = measurandIds.map((id, idx) =>
        fetchDataForMeasurand(id, measurandOptions[idx])
      );
      const results = await Promise.all(promises);
      const newData = {};
      results.forEach(({ measurandName, data }) => {
        newData[measurandName] = data;
      });
      setMeasurandData(newData);
      showSnackbar("Historical measurand data loaded successfully", "success");
    } catch (error) {
      console.error("Error in fetching historical data:", error);
      showSnackbar("Failed to load historical measurand data", "error");
    } finally {
      setGridLoading(false);
    }
  }, [table, dateFilter, measurandIds, measurandOptions]);

  useEffect(() => {
    fetchTableData();
  }, [fetchTableData]);

  useEffect(() => {
    if (table) {
      fetchAvailableMeasurands();
      fetchHistoricalMeasurandValues();
    }
  }, [
    table,
    dateFilter,
    fetchAvailableMeasurands,
    fetchHistoricalMeasurandValues,
  ]);

  const handleMeasurandChange = async (event) => {
    const selectedMeasurandName = event.target.value;
    const selectedMeasurand = availableMeasurands.find(
      (m) => m.measurandName === selectedMeasurandName
    );
    if (
      selectedMeasurand &&
      !measurandOptions.includes(selectedMeasurandName)
    ) {
      showSnackbar(`Adding ${selectedMeasurandName}`, "info", true);
      const updatedOptions = [...measurandOptions, selectedMeasurandName];
      const updatedIds = [...measurandIds, selectedMeasurand.measurandId];
      setMeasurandOptions(updatedOptions);
      setMeasurandIds(updatedIds);
      setNewMeasurand("");

      const cacheKey = `${table.terminalId}:${selectedMeasurand.measurandId}:${dateFilter.start}:${dateFilter.end}`;
      if (historicalCache[cacheKey]) {
        setMeasurandData((prev) => ({
          ...prev,
          [selectedMeasurandName]: historicalCache[cacheKey],
        }));
        showSnackbar(`${selectedMeasurandName} added from cache`, "success");
        return;
      }

      try {
        const response = await axios.get(
          `${BASE_URL}/historical/${table.terminalId}/${selectedMeasurand.measurandId}?from=${dateFilter.start}&to=${dateFilter.end}`
        );
        if (!response.data.success) throw new Error(response.data.message);
        const result = response.data.data.map((item) => ({
          timestamp: item.Timestamp,
          value: item.MeasurandValue,
        }));
        historicalCache[cacheKey] = result;
        setMeasurandData((prev) => ({
          ...prev,
          [selectedMeasurandName]: result,
        }));
        showSnackbar(`${selectedMeasurandName} added successfully`, "success");
      } catch (error) {
        console.error("Error fetching new measurand values:", error);
        showSnackbar(
          error.message || `Failed to add ${selectedMeasurandName}`,
          "error"
        );
      }
    }
  };

  //  ----------------------- Saving configuration -----------------------
  const handleSave = async () => {
    showSnackbar("Saving configuration", "info", true);
    try {
      const response = await axios.put(`${BASE_URL}/${tableId}`, {
        measurandIds,
        measurandNames: measurandOptions,
      });
      if (!response.data.success) throw new Error(response.data.message);
      showSnackbar("Configuration saved successfully", "success");
    } catch (error) {
      console.error("Error updating table:", error);
      showSnackbar(error.message || "Failed to save configuration", "error");
    }
  };

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

  const generateRows = useCallback(() => {
    if (!Object.keys(measurandData).length) return [];
    const allTimestamps = new Set();
    Object.values(measurandData).forEach((measurandValues) => {
      measurandValues.forEach((data) => allTimestamps.add(data.timestamp));
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

  const generateColumns = useCallback(() => {
    if (!table || !measurandOptions.length) return [];

    const rows = generateRows();

    return [
      {
        field: "timestamp",
        headerName: "Timestamp",
        width: 250,
        renderCell: (params) => (
          <Typography variant="body2">
            {formatTimestamp(params.value)}
          </Typography>
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

  const handleRowSelection = (selectionModel) => {
    const newSelection = selectionModel.slice(0, 2);
    setSelectedRows(
      generateRows().filter((row) => newSelection.includes(row.id))
    );
  };

  const handleDeleteMeasurand = (option) => {
    const index = measurandOptions.indexOf(option);
    setMeasurandOptions((prev) => prev.filter((opt) => opt !== option));
    setMeasurandIds((prev) => prev.filter((_, i) => i !== index));
    setMeasurandData((prev) => {
      const newData = { ...prev };
      delete newData[option];
      return newData;
    });
  };

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
          ? formatTimestamp(row[col.field])
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

  const handleBackClick = () => navigate(-1);

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
              sx={{ ml: 2, fontWeight: 600, letterSpacing: 0.5 }}
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
                <MenuItem value="">
                  <em>Select an option</em>
                </MenuItem>
                {availableMeasurands
                  .filter(
                    (option) => !measurandOptions.includes(option.measurandName)
                  )
                  .map((option) => (
                    <StyledMenuItem
                      key={option.measurandId}
                      value={option.measurandName}
                    >
                      {option.measurandName}{" "}
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
              label="Start Date (UTC)"
              value={dateFilter.start}
              onChange={(e) =>
                setDateFilter((prev) => ({ ...prev, start: e.target.value }))
              }
              InputLabelProps={{ shrink: true }}
              inputProps={{ step: 60 }}
              fullWidth
              sx={{ mb: 2 }}
            />
            <TextField
              type="datetime-local"
              label="End Date (UTC)"
              value={dateFilter.end}
              onChange={(e) =>
                setDateFilter((prev) => ({ ...prev, end: e.target.value }))
              }
              InputLabelProps={{ shrink: true }}
              inputProps={{ step: 60 }}
              fullWidth
              sx={{ mb: 2 }}
            />
            <Box sx={{ mb: 2 }}>
              <Chip
                label="1 Hour"
                onClick={() => handleTimeRangeClick(1)}
                sx={{
                  mr: 1,
                  bgcolor: isDarkMode ? "#0288d1" : "#e1f5fe",
                  color: isDarkMode ? "white" : "#0288d1",
                  "&:hover": {
                    bgcolor: isDarkMode ? "#4fc3f7" : "#b3e5fc",
                  },
                }}
              />
              <Chip
                label="8 Hours"
                onClick={() => handleTimeRangeClick(8)}
                sx={{
                  mr: 1,
                  bgcolor: isDarkMode ? "#0288d1" : "#e1f5fe",
                  color: isDarkMode ? "white" : "#0288d1",
                  "&:hover": {
                    bgcolor: isDarkMode ? "#4fc3f7" : "#b3e5fc",
                  },
                }}
              />
              <Chip
                label="24 Hours"
                onClick={() => handleTimeRangeClick(24)}
                sx={{
                  mr: 1,
                  bgcolor: isDarkMode ? "#0288d1" : "#e1f5fe",
                  color: isDarkMode ? "white" : "#0288d1",
                  "&:hover": {
                    bgcolor: isDarkMode ? "#4fc3f7" : "#b3e5fc",
                  },
                }}
              />
            </Box>
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
                initialState={{
                  pagination: {
                    paginationModel: {
                      pageSize: 15,
                      page: 0,
                    },
                  },
                }}
                pageSizeOptions={[10, 15, 25, 50]}
                onRowSelectionModelChange={handleRowSelection}
                rowSelectionModel={selectedRows.map((row) => row.id)}
                sx={{
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
                        ? "linear-gradient(#546e7a 0%, #546e7a 100%)"
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
