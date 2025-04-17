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
  Button,
  Snackbar,
  Slide,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  ListItemText,
  Divider,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import TableChartIcon from "@mui/icons-material/TableChart";
import BarChartIcon from "@mui/icons-material/BarChart";
import { ArrowUpward, ArrowDownward } from "@mui/icons-material";
import EditIcon from "@mui/icons-material/Edit";
import MuiAlert from "@mui/material/Alert";
import { styled } from "@mui/material/styles";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import "../styles/TableDetailsPage.css";
import { ThemeContext } from "../contexts/ThemeContext";
import GraphComponent from "../components/Widgets/HDDGraph";

const BASE_URL = "http://localhost:6005/api/measurand-hdd";

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

const historicalCache = {};

// Styled components
const DifferenceBox = styled(Box)(({ theme, isNegative, isZero }) => ({
  display: "flex",
  alignItems: "center",
  gap: "4px",
  color: isNegative ? "#d32f2f" : isZero ? "#388e3c" : "#388e3c",
  fontSize: "0.75rem",
  borderRadius: "4px",
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

const StyledSnackbar = styled(Snackbar)(({ theme }) => ({
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

const StyledAlert = styled(MuiAlert)(({ theme, severity }) => ({
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

const MeasurandDetailsPage = () => {
  const { measurandId } = useParams();
  const navigate = useNavigate();
  const { isDarkMode } = useContext(ThemeContext);
  const [measurand, setMeasurand] = useState(null);
  const [loading, setLoading] = useState(false);
  const [gridLoading, setGridLoading] = useState(true);
  const [plantInfo, setPlantInfo] = useState({});
  const [terminalInfo, setTerminalInfo] = useState([]);
  const [historicalData, setHistoricalData] = useState([]);
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false);
  const [terminals, setTerminals] = useState([]);
  const [selectedTerminalIds, setSelectedTerminalIds] = useState([]);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "info",
    loading: false,
  });
  const [graphDialog, setGraphDialog] = useState({ open: false });

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

  const fetchMeasurandData = useCallback(async () => {
    setLoading(true);
    setGridLoading(true);
    showSnackbar("Fetching measurand view data", "info", true);

    try {
      const response = await axios.get(`${BASE_URL}/${measurandId}`);
      if (!response.data.success) throw new Error(response.data.message);
      const data = response.data.data;
      setMeasurand({
        id: data.measurandId,
        name: data.measurandName || `Measurand ${data.measurandId}`,
        plantId: data.plantId,
      });
      setPlantInfo({ id: data.plantId, name: data.plantName || "Unknown" });
      setTerminalInfo(
        data.terminalIds.map((id, idx) => ({
          id,
          name: data.terminalNames[idx] || `Terminal ${id}`,
        }))
      );
      setSelectedTerminalIds(data.terminalIds);
      showSnackbar("Measurand view data loaded successfully", "success");
    } catch (error) {
      console.error("Error fetching measurand view:", error);
      showSnackbar(
        error.message || "Failed to load measurand view data",
        "error"
      );
    } finally {
      setLoading(false);
      setGridLoading(false);
    }
  }, [measurandId]);

  const fetchTerminals = useCallback(async () => {
    if (!measurand || !plantInfo.id) return;
    try {
      const response = await axios.get(
        `http://localhost:6005/api/measurand/terminals/plant/${plantInfo.id}/measurand/${measurand.id}`
      );
      setTerminals(response.data);
    } catch (error) {
      console.error("Error fetching terminals:", error);
      showSnackbar("Failed to fetch terminals", "error");
    }
  }, [measurand, plantInfo]);

  const fetchHistoricalMeasurandValues = useCallback(async () => {
    if (!terminalInfo.length || !measurand?.id) return;
    setGridLoading(true);
    showSnackbar("Fetching historical measurand data", "info", true);

    try {
      const promises = terminalInfo.map((terminal) => {
        const cacheKey = `${terminal.id}:${measurand.id}:${dateFilter.start}:${dateFilter.end}`;
        if (historicalCache[cacheKey]) {
          console.log(`Cache hit for ${cacheKey}`);
          return Promise.resolve({
            terminalId: terminal.id,
            data: historicalCache[cacheKey],
          });
        }

        return axios
          .get(
            `${BASE_URL}/historical/${terminal.id}/${measurand.id}?from=${dateFilter.start}&to=${dateFilter.end}`
          )
          .then((response) => {
            if (!response.data.success) throw new Error(response.data.message);
            const result = response.data.data.map((item) => ({
              timestamp: item.Timestamp,
              value: item.MeasurandValue,
              terminalId: terminal.id,
            }));
            historicalCache[cacheKey] = result;
            return { terminalId: terminal.id, data: result };
          });
      });

      const results = await Promise.all(promises);
      const combinedData = results.flatMap((result) => result.data);
      setHistoricalData(combinedData);
      showSnackbar("Historical measurand data loaded successfully", "success");
    } catch (error) {
      console.error("Error fetching historical data:", error);
      showSnackbar(error.message || "Failed to load historical data", "error");
    } finally {
      setGridLoading(false);
    }
  }, [measurand, terminalInfo, dateFilter]);

  useEffect(() => {
    fetchMeasurandData();
  }, [fetchMeasurandData]);

  useEffect(() => {
    if (measurand) {
      fetchHistoricalMeasurandValues();
      fetchTerminals();
    }
  }, [measurand, terminalInfo, fetchHistoricalMeasurandValues, fetchTerminals]);

  const handleUpdateTerminals = async () => {
    if (!selectedTerminalIds.length) {
      showSnackbar("At least one terminal must be selected", "error");
      return;
    }

    try {
      const selectedTerminals = terminals.filter((t) =>
        selectedTerminalIds.includes(t.terminalId)
      );
      const updateData = {
        terminalIds: selectedTerminalIds,
        terminalNames: selectedTerminals.map((t) => t.terminalName),
      };
      const response = await axios.put(
        `${BASE_URL}/${measurandId}`,
        updateData
      );
      if (!response.data.success) throw new Error(response.data.message);
      setTerminalInfo(
        updateData.terminalIds.map((id, idx) => ({
          id,
          name: updateData.terminalNames[idx],
        }))
      );
      setUpdateDialogOpen(false);
      showSnackbar("Measurand view updated successfully", "success");
      fetchHistoricalMeasurandValues();
    } catch (error) {
      console.error("Error updating view:", error);
      showSnackbar(error.message || "Failed to update view", "error");
    }
  };

  const calculateStats = useCallback(() => {
    const stats = {};
    terminalInfo.forEach((terminal) => {
      const values = historicalData
        .filter((d) => d.terminalId === terminal.id)
        .map((d) => d.value)
        .filter((v) => v !== null);
      stats[terminal.id] = values.length
        ? {
            min: Math.min(...values).toFixed(2),
            max: Math.max(...values).toFixed(2),
            avg: (values.reduce((a, b) => a + b, 0) / values.length).toFixed(2),
          }
        : { min: "N/A", max: "N/A", avg: "N/A" };
    });
    return stats;
  }, [historicalData, terminalInfo]);

  const generateRows = useCallback(() => {
    const allTimestamps = new Set(historicalData.map((d) => d.timestamp));
    return Array.from(allTimestamps)
      .sort((a, b) => new Date(b) - new Date(a))
      .slice(0, 1000)
      .map((timestamp, index) => {
        const row = { id: index, timestamp };
        terminalInfo.forEach((terminal) => {
          const dataPoint = historicalData.find(
            (d) => d.timestamp === timestamp && d.terminalId === terminal.id
          );
          row[terminal.id] = dataPoint?.value ?? null;
        });
        return row;
      });
  }, [historicalData, terminalInfo]);

  const generateColumns = useCallback(() => {
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
      ...terminalInfo.map((terminal) => ({
        field: terminal.id.toString(),
        headerName: (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            {terminal.name}
            <IconButton
              size="small"
              onClick={() => setGraphDialog({ open: true })}
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
        headerNameText: terminal.name,
        width: 250,
        renderCell: (params) => {
          const currentValue = params.value;
          const rowIndex = params.row.id;
          const nextValue =
            rowIndex < rows.length - 1 ? rows[rowIndex + 1][terminal.id] : null;

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
                irq
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
  }, [terminalInfo, generateRows]);

  const exportToPDF = () => {
    const doc = new jsPDF({
      orientation: "landscape",
      unit: "pt",
      format: "a4",
    });
    doc.setFontSize(16);
    doc.text(`Measurand Data - ${measurand?.name || "Unknown"}`, 40, 40);

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

    const statsData = Object.entries(stats).map(([terminalId, stat]) => [
      terminalInfo.find((t) => t.id === Number(terminalId))?.name || terminalId,
      stat.min,
      stat.max,
      stat.avg,
    ]);

    autoTable(doc, {
      startY: finalY + 10,
      head: [["Terminal", "Min", "Max", "Avg"]],
      body: statsData,
      theme: "grid",
      styles: { fontSize: 8, cellPadding: 4 },
      headStyles: {
        fillColor: isDarkMode ? [33, 150, 243] : [25, 118, 210],
        textColor: 255,
      },
    });

    doc.save(`measurand_${measurandId}_data.pdf`);
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
      ["Terminal", "Min", "Max", "Avg"],
      ...Object.entries(stats).map(([terminalId, stat]) => [
        terminalInfo.find((t) => t.id === Number(terminalId))?.name ||
          terminalId,
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
    XLSX.utils.book_append_sheet(workbook, worksheet, "Measurand Data");
    XLSX.writeFile(workbook, `measurand_${measurandId}_data.xlsx`, {
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

  if (!measurand) {
    return (
      <Box sx={{ p: 4, textAlign: "center" }}>
        <StyledButton
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={handleBackClick}
        >
          Back to Measurands
        </StyledButton>
        <Typography variant="h5" color="error" sx={{ mt: 2 }}>
          Measurand view not found
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
            <IconButton edge="start" color="inherit" onClick={handleBackClick}>
              <ArrowBackIcon />
            </IconButton>
            <Typography
              variant="h6"
              sx={{ ml: 2, fontWeight: 600, letterSpacing: 0.5 }}
            >
              Measurand View - {measurand.name}
            </Typography>
          </Box>
        </Toolbar>
      </StyledAppBar>

      <Grid container spacing={4} sx={{ p: 4 }}>
        <Grid item xs={12} md={3}>
          <StyledPaper>
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
              label="Measurand Name"
              value={measurand.name}
              fullWidth
              disabled
              sx={{ mb: 2 }}
            />
            <TextField
              label="Plant"
              value={plantInfo.name}
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
              Terminals
            </Typography>
            <Box sx={{ mb: 2 }}>
              {terminalInfo.map((terminal) => (
                <Chip
                  key={terminal.id}
                  label={terminal.name}
                  sx={{
                    mr: 1,
                    mb: 1,
                    bgcolor: isDarkMode ? "#0288d1" : "#e1f5fe",
                    color: isDarkMode ? "white" : "#0288d1",
                  }}
                />
              ))}
            </Box>
            <StyledButton
              variant="contained"
              startIcon={<EditIcon />}
              onClick={() => setUpdateDialogOpen(true)}
              fullWidth
            >
              Update Terminals
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
                sx={{ mr: 1 }}
              />
              <Chip
                label="8 Hours"
                onClick={() => handleTimeRangeClick(8)}
                sx={{ mr: 1 }}
              />
              <Chip
                label="24 Hours"
                onClick={() => handleTimeRangeClick(24)}
                sx={{ mr: 1 }}
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
                  pagination: { paginationModel: { pageSize: 15, page: 0 } },
                }}
                pageSizeOptions={[10, 15, 25, 50]}
              />
            )}
          </StyledPaper>
          <StyledPaper sx={{ mt: 4 }}>
            <Typography variant="h5" sx={{ mb: 2 }}>
              Data Analysis
            </Typography>
            <Grid container spacing={2}>
              {Object.entries(stats).map(([terminalId, stat]) => (
                <Grid item xs={12} sm={6} md={4} key={terminalId}>
                  <AnalysisCard>
                    <Typography
                      variant="subtitle1"
                      sx={{ fontWeight: "bold", mb: 1, color: "#00bcd4" }}
                    >
                      {terminalInfo.find((t) => t.id === Number(terminalId))
                        ?.name || terminalId}
                    </Typography>
                    <Box
                      sx={{ display: "flex", flexDirection: "column", gap: 1 }}
                    >
                      <Typography variant="body2" sx={{ color: "#ff4444" }}>
                        Min: {stat.min}
                      </Typography>
                      <Typography variant="body2" sx={{ color: "#00cc00" }}>
                        Max: {stat.max}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{ color: isDarkMode ? "white" : "black" }}
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

      <Dialog
        open={updateDialogOpen}
        onClose={() => setUpdateDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Typography variant="h6">Update Terminals</Typography>
          <Typography variant="body2" color="text.secondary">
            Select or remove terminals for this measurand view
          </Typography>
        </DialogTitle>
        <Divider />
        <DialogContent>
          <FormControl fullWidth>
            <InputLabel id="terminal-label">Terminal Options</InputLabel>
            <Select
              labelId="terminal-label"
              multiple
              value={selectedTerminalIds}
              label="Terminal Options"
              onChange={(e) => setSelectedTerminalIds(e.target.value)}
              renderValue={(selected) => (
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                  {selected.map((value) => (
                    <Chip
                      key={value}
                      label={
                        terminals.find((t) => t.terminalId === value)
                          ?.terminalName
                      }
                    />
                  ))}
                </Box>
              )}
            >
              {terminals.map((terminal) => (
                <MenuItem key={terminal.terminalId} value={terminal.terminalId}>
                  <Checkbox
                    checked={selectedTerminalIds.includes(terminal.terminalId)}
                  />
                  <ListItemText primary={terminal.terminalName} />
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setUpdateDialogOpen(false)} color="inherit">
            Cancel
          </Button>
          <Button
            onClick={handleUpdateTerminals}
            variant="contained"
            disabled={!selectedTerminalIds.length}
          >
            Update
          </Button>
        </DialogActions>
      </Dialog>

      {graphDialog.open && (
        <GraphComponent
          data={historicalData}
          measurand={measurand.name}
          open={graphDialog.open}
          onClose={() => setGraphDialog({ open: false })}
          allMeasurands={[measurand.name]}
          allData={{ [measurand.name]: historicalData }}
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

export default MeasurandDetailsPage;
