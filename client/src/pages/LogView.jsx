import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Typography,
  Paper,
  Grid,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
  TextField,
  Card,
  CardContent,
  Divider,
  Chip,
  IconButton,
  useTheme,
  alpha,
  Menu,
  Snackbar,
  Alert as MuiAlert,
} from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import axios from "axios";
import { styled } from "@mui/material/styles";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import DateRangeIcon from "@mui/icons-material/DateRange";
import DownloadIcon from "@mui/icons-material/Download";
import RefreshIcon from "@mui/icons-material/Refresh";
import SaveIcon from "@mui/icons-material/Save";
import DeleteIcon from "@mui/icons-material/Delete";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import TableChartIcon from "@mui/icons-material/TableChart";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
const BASE_URL = `${process.env.REACT_APP_API_LOCAL_URL}api`;
const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  borderRadius: "16px",
  boxShadow: "0 8px 32px rgba(0, 0, 0, 0.12)",
  background: `linear-gradient(135deg, ${alpha(
    theme.palette.background.paper,
    0.95
  )} 0%, ${alpha(theme.palette.background.paper, 0.85)} 100%)`,
  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
}));

const GlassCard = styled(Card)(({ theme }) => ({
  background: alpha(theme.palette.background.paper, 0.7),
  borderRadius: "12px",
  boxShadow: `0 4px 20px ${alpha(theme.palette.common.black, 0.1)}`,
  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
}));

const StyledButton = styled(Button)(({ theme }) => ({
  padding: theme.spacing(1.5, 3),
  borderRadius: "12px",
  background: `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.primary.light} 90%)`,
  fontWeight: 600,
}));

const StyledSaveButton = styled(Button)(({ theme }) => ({
  padding: theme.spacing(1.5, 3),
  borderRadius: "12px",
  borderColor: theme.palette.success.main,
  color: theme.palette.success.main,
  "&:hover": {
    backgroundColor: alpha(theme.palette.success.light, 0.1),
    borderColor: theme.palette.success.dark,
  },
}));

const AnimatedTextField = styled(TextField)(({ theme }) => ({
  "& .MuiOutlinedInput-root": {
    borderRadius: "12px",
    background: alpha(theme.palette.background.paper, 0.8),
  },
}));

const AnimatedSelect = styled(Select)(({ theme }) => ({
  borderRadius: "12px",
  background: alpha(theme.palette.background.paper, 0.8),
}));

const StyledDataGrid = styled(DataGrid)(({ theme }) => ({
  "& .MuiDataGrid-root": {
    border: "none",
    borderRadius: "12px",
    backgroundColor: theme.palette.background.paper,
    boxShadow: `0 2px 10px ${alpha(theme.palette.grey[500], 0.1)}`,
  },
  "& .MuiDataGrid-cell": {
    borderBottom: `1px solid ${alpha(
      theme.palette.grey[theme.palette.mode === "dark" ? 700 : 300],
      0.5
    )}`,
    padding: theme.spacing(1.5),
    fontSize: "0.9rem",
    color: theme.palette.text.primary,
  },
  "& .MuiDataGrid-columnHeaders": {
    borderRadius: "12px 12px 0 0",
    borderBottom: `2px solid ${theme.palette.primary.dark}`,
  },
  "& .MuiDataGrid-columnHeader": {
    padding: theme.spacing(1.5),
  },
  "& .MuiDataGrid-columnHeaderTitle": {
    fontSize: "1rem",
  },
  "& .MuiDataGrid-row": {
    "&:nth-of-type(even)": {
      backgroundColor: alpha(
        theme.palette.grey[theme.palette.mode === "dark" ? 800 : 100],
        0.3
      ),
    },
    "&:hover": {
      backgroundColor: alpha(theme.palette.primary.light, 0.2),
      transition: "background-color 0.3s ease",
    },
  },
  "& .MuiDataGrid-footerContainer": {
    borderTop: `1px solid ${alpha(
      theme.palette.grey[theme.palette.mode === "dark" ? 700 : 300],
      0.5
    )}`,
    backgroundColor: theme.palette.background.paper,
    borderRadius: "0 0 12px 12px",
    padding: theme.spacing(1),
  },
  "& .MuiDataGrid-toolbarContainer": {
    padding: theme.spacing(1),
    backgroundColor: alpha(
      theme.palette.grey[theme.palette.mode === "dark" ? 900 : 100],
      0.8
    ),
    borderBottom: `1px solid ${alpha(
      theme.palette.grey[theme.palette.mode === "dark" ? 700 : 300],
      0.5
    )}`,
  },
}));

// Custom styled Alert for Snackbar
const StyledAlert = styled(MuiAlert)(({ theme }) => ({
  color:
    theme.palette.mode === "dark"
      ? theme.palette.common.white
      : theme.palette.common.black,
  "& .MuiAlert-icon": {
    color:
      theme.palette.mode === "dark" ? theme.palette.common.white : "inherit",
  },
  "& .MuiAlert-message": {
    fontWeight: 500,
  },
}));

// Helper functions
const formatDateTime = (date) => {
  if (!date) return "";
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  const hours = String(d.getHours()).padStart(2, "0");
  const minutes = String(d.getMinutes()).padStart(2, "0");
  const seconds = String(d.getSeconds()).padStart(2, "0");
  return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
};

const pivotData = (data) => {
  const uniqueMeasurands = new Set();
  data.forEach((row) => {
    row.MeasurandData.forEach((m) => uniqueMeasurands.add(m.MeasurandName));
  });
  const measurandNames = Array.from(uniqueMeasurands);

  const pivotedData = data.map((row, index) => {
    const newRow = { id: index, TimeStamp: row.TimeStamp };
    row.MeasurandData.forEach((m) => {
      newRow[m.MeasurandName] = m.MeasurandValue;
    });
    return newRow;
  });

  return { pivotedData, measurandNames };
};

const loadSavedQueries = () => {
  const saved = localStorage.getItem("savedQueries");
  return saved ? JSON.parse(saved) : [];
};

const saveQueryToLocalStorage = (query) => {
  const savedQueries = loadSavedQueries();
  const updatedQueries = [...savedQueries, query];
  localStorage.setItem("savedQueries", JSON.stringify(updatedQueries));
};

const deleteQueryFromLocalStorage = (index) => {
  const savedQueries = loadSavedQueries();
  const updatedQueries = savedQueries.filter((_, i) => i !== index);
  localStorage.setItem("savedQueries", JSON.stringify(updatedQueries));
};

const LogView = () => {
  const theme = useTheme();
  const [queries, setQueries] = useState([]);
  const [selectedQuery, setSelectedQuery] = useState("");
  const [dateFilter, setDateFilter] = useState({ from: "", to: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [queryResults, setQueryResults] = useState([]);
  const [savedQueries, setSavedQueries] = useState(loadSavedQueries());
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "info",
  });
  const [anchorEl, setAnchorEl] = useState(null);

  useEffect(() => {
    const fetchQueries = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(`${BASE_URL}/queries`);
        setQueries(response.data);
        if (response.data.length > 0) setSelectedQuery(response.data[0].QName);
        showSnackbar("Queries loaded successfully", "success");
      } catch (error) {
        console.error("Error fetching queries:", error);
        showSnackbar("Failed to load queries", "error");
      } finally {
        setIsLoading(false);
      }
    };
    fetchQueries();
  }, []);

  useEffect(() => {
    setSavedQueries(loadSavedQueries());
  }, []);

  const showSnackbar = (message, severity = "info") => {
    setSnackbar({ open: true, message, severity });
  };

  const handleSnackbarClose = (event, reason) => {
    if (reason === "clickaway") return;
    setSnackbar({ ...snackbar, open: false });
  };

  const validateDates = () => {
    if (!dateFilter.from || !dateFilter.to) {
      showSnackbar("Please select both From and To dates", "warning");
      return false;
    }

    const fromDate = new Date(dateFilter.from);
    const toDate = new Date(dateFilter.to);

    if (toDate <= fromDate) {
      showSnackbar("To Date must be after From Date", "warning");
      return false;
    }

    return true;
  };

  const handleGoClick = async () => {
    if (!selectedQuery) {
      showSnackbar("Please select a query", "warning");
      return;
    }

    if (!validateDates()) return;

    setIsLoading(true);
    try {
      const response = await axios.post(`${BASE_URL}/execute-query`, {
        qName: selectedQuery,
        fromDate: new Date(dateFilter.from).toISOString(),
        toDate: new Date(dateFilter.to).toISOString(),
      });

      const { pivotedData } = pivotData(response.data);
      setQueryResults(pivotedData);
      showSnackbar(
        `Query executed successfully. Found ${pivotedData.length} results`,
        "success"
      );
    } catch (error) {
      console.error("Error executing query:", error);
      showSnackbar("Failed to execute query", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveQuery = () => {
    if (!selectedQuery) {
      showSnackbar("Please select a query to save", "warning");
      return;
    }

    if (!validateDates()) return;

    const queryToSave = {
      name: selectedQuery,
      displayName: selectedQuery,
      from: dateFilter.from,
      to: dateFilter.to,
      savedAt: new Date().toISOString(),
    };
    saveQueryToLocalStorage(queryToSave);
    setSavedQueries(loadSavedQueries());
    showSnackbar("Query saved successfully", "success");
  };

  const handleLoadAndExecuteQuery = async (savedQuery) => {
    setSelectedQuery(savedQuery.name);
    setDateFilter({ from: savedQuery.from, to: savedQuery.to });
    setAnchorEl(null);

    setIsLoading(true);
    try {
      const response = await axios.post(`${BASE_URL}/execute-query`, {
        qName: savedQuery.name,
        fromDate: new Date(savedQuery.from).toISOString(),
        toDate: new Date(savedQuery.to).toISOString(),
      });

      const { pivotedData } = pivotData(response.data);
      setQueryResults(pivotedData);
      showSnackbar(
        `Query executed from saved: ${savedQuery.displayName}. Found ${pivotedData.length} results`,
        "success"
      );
    } catch (error) {
      console.error("Error executing saved query:", error);
      showSnackbar("Failed to execute saved query", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteQuery = (index) => {
    deleteQueryFromLocalStorage(index);
    setSavedQueries(loadSavedQueries());
    showSnackbar("Query deleted successfully", "success");
  };

  const handleRefresh = () => {
    if (!selectedQuery || !validateDates()) {
      showSnackbar("Please select a query and valid date range", "info");
      return;
    }
    handleGoClick();
  };

  const handleExportCSV = () => {
    if (queryResults.length === 0) {
      showSnackbar("No data to export", "warning");
      return;
    }
    const headers = Object.keys(queryResults[0]).filter((key) => key !== "id");
    let csv = headers.join(",") + "\n";
    queryResults.forEach((row) => {
      const values = headers.map((header) => {
        if (header === "TimeStamp") {
          return `"${formatDateTime(row[header])}"`;
        } else if (row[header] === 0) {
          return `"0"`;
        } else {
          return `"${
            row[header] !== null && row[header] !== undefined
              ? row[header]
              : "NA"
          }"`;
        }
      });
      csv += values.join(",") + "\n";
    });
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${selectedQuery}_export_${new Date()
      .toISOString()
      .slice(0, 10)}.csv`;
    a.click();
    showSnackbar("Data exported as CSV successfully", "success");
  };

  const handleExportPDF = () => {
    if (queryResults.length === 0) {
      showSnackbar("No data to export", "warning");
      return;
    }

    const doc = new jsPDF();
    const headers = Object.keys(queryResults[0]).filter((key) => key !== "id");

    doc.setFillColor(33, 150, 243);
    doc.rect(0, 0, 210, 40, "F");
    doc.setFontSize(20);
    doc.setTextColor(255, 255, 255);
    doc.text(`${selectedQuery} Report`, 20, 20);

    doc.setFontSize(12);
    doc.text(
      `From: ${formatDateTime(dateFilter.from)} To: ${formatDateTime(
        dateFilter.to
      )}`,
      20,
      30
    );

    const tableData = queryResults.map((row) =>
      headers.map((header) =>
        header === "TimeStamp"
          ? formatDateTime(row[header])
          : row[header] === 0
          ? "0"
          : row[header] !== null && row[header] !== undefined
          ? row[header]
          : "NA"
      )
    );

    autoTable(doc, {
      startY: 50,
      head: [headers],
      body: tableData,
      styles: {
        fontSize: 10,
        cellPadding: 3,
        overflow: "linebreak",
      },
      headStyles: {
        fillColor: [33, 150, 243],
        textColor: [255, 255, 255],
        fontStyle: "bold",
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245],
      },
      tableLineColor: [200, 200, 200],
      tableLineWidth: 0.1,
    });

    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(100);
      doc.text(
        `Page ${i} of ${pageCount} | Generated on ${formatDateTime(
          new Date()
        )}`,
        20,
        doc.internal.pageSize.height - 10
      );
    }

    doc.save(
      `${selectedQuery}_export_${new Date().toISOString().slice(0, 10)}.pdf`
    );
    showSnackbar("Data exported as PDF successfully", "success");
  };

  const handleExportExcel = () => {
    if (queryResults.length === 0) {
      showSnackbar("No data to export", "warning");
      return;
    }
    const headers = Object.keys(queryResults[0]).filter((key) => key !== "id");
    const data = queryResults.map((row) =>
      headers.reduce((acc, header) => {
        acc[header] =
          header === "TimeStamp"
            ? formatDateTime(row[header])
            : row[header] === 0
            ? "0"
            : row[header] !== null && row[header] !== undefined
            ? row[header]
            : "NA";
        return acc;
      }, {})
    );
    const ws = XLSX.utils.json_to_sheet(data, { header: headers });
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
    XLSX.writeFile(
      wb,
      `${selectedQuery}_export_${new Date().toISOString().slice(0, 10)}.xlsx`
    );
    showSnackbar("Data exported as Excel successfully", "success");
  };

  const handleSavedQueriesClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseSavedQueries = () => {
    setAnchorEl(null);
  };

  const getColumns = () => {
    const { measurandNames } = pivotData(
      queryResults.length > 0
        ? queryResults.map((row) => ({
            TimeStamp: row.TimeStamp,
            MeasurandData: Object.entries(row)
              .filter(([key]) => key !== "id" && key !== "TimeStamp")
              .map(([name, value]) => ({
                MeasurandName: name,
                MeasurandValue: value,
              })),
          }))
        : []
    );

    return [
      {
        field: "TimeStamp",
        headerName: "Timestamp",
        width: 200,
        renderCell: (params) => (
          <Typography variant="body2" sx={{ fontWeight: 500 }}>
            {formatDateTime(params.value)}
          </Typography>
        ),
      },
      ...measurandNames.map((name) => ({
        field: name,
        headerName: name,
        width: 200,
        renderCell: (params) => (
          <Typography variant="body2">
            {params.value === 0
              ? "0"
              : params.value !== null && params.value !== undefined
              ? params.value
              : "NA"}
          </Typography>
        ),
      })),
    ];
  };

  return (
    <Box>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={5000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <StyledAlert
          elevation={6}
          variant="filled"
          onClose={handleSnackbarClose}
          severity={snackbar.severity}
        >
          {snackbar.message}
        </StyledAlert>
      </Snackbar>

      <StyledPaper>
        <GlassCard sx={{ mb: 4 }}>
          <CardContent>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                mb: 3,
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <DateRangeIcon color="primary" />
                <Typography variant="h6" sx={{ fontWeight: 600, ml: 1 }}>
                  Query Parameters
                </Typography>
              </Box>
              <Button
                variant="outlined"
                startIcon={<SaveIcon />}
                onClick={handleSavedQueriesClick}
              >
                Saved Queries
              </Button>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleCloseSavedQueries}
                PaperProps={{
                  style: { maxHeight: 400, width: "500px" },
                }}
              >
                {savedQueries.length === 0 ? (
                  <MenuItem disabled>No saved queries</MenuItem>
                ) : (
                  savedQueries.map((query, index) => (
                    <MenuItem
                      key={index}
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <Typography variant="body2" sx={{ mr: 2 }}>
                        {query.displayName} | {formatDateTime(query.from)} -{" "}
                        {formatDateTime(query.to)}
                      </Typography>
                      <Box>
                        <Button
                          size="small"
                          startIcon={<PlayArrowIcon />}
                          onClick={() => handleLoadAndExecuteQuery(query)}
                          sx={{ mr: 1 }}
                        >
                          Execute
                        </Button>
                        <Button
                          size="small"
                          startIcon={<DeleteIcon />}
                          onClick={() => handleDeleteQuery(index)}
                          color="error"
                        >
                          Delete
                        </Button>
                      </Box>
                    </MenuItem>
                  ))
                )}
              </Menu>
            </Box>
            <Grid container spacing={3} alignItems="center">
              <Grid item xs={12} md={4}>
                <FormControl fullWidth variant="outlined">
                  <InputLabel>Query Name</InputLabel>
                  <AnimatedSelect
                    value={selectedQuery}
                    onChange={(e) => setSelectedQuery(e.target.value)}
                    label="Query Name"
                  >
                    {queries.map((query) => (
                      <MenuItem key={query._id} value={query.QName}>
                        {query.QName}
                      </MenuItem>
                    ))}
                  </AnimatedSelect>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={3}>
                <AnimatedTextField
                  fullWidth
                  type="datetime-local"
                  label="From Date"
                  value={dateFilter.from}
                  onChange={(e) => {
                    setDateFilter((prev) => ({
                      ...prev,
                      from: e.target.value,
                    }));
                    if (
                      dateFilter.to &&
                      new Date(e.target.value) >= new Date(dateFilter.to)
                    ) {
                      showSnackbar(
                        "From Date must be before To Date",
                        "warning"
                      );
                    }
                  }}
                  InputLabelProps={{ shrink: true }}
                  inputProps={{ step: 1 }}
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <AnimatedTextField
                  fullWidth
                  type="datetime-local"
                  label="To Date"
                  value={dateFilter.to}
                  onChange={(e) => {
                    setDateFilter((prev) => ({ ...prev, to: e.target.value }));
                    if (
                      dateFilter.from &&
                      new Date(e.target.value) <= new Date(dateFilter.from)
                    ) {
                      showSnackbar(
                        "To Date must be after From Date",
                        "warning"
                      );
                    }
                  }}
                  InputLabelProps={{ shrink: true }}
                  inputProps={{ step: 1 }}
                />
              </Grid>
              <Grid item xs={12} md={2}>
                <Box sx={{ display: "flex", gap: 2 }}>
                  <StyledButton
                    fullWidth
                    variant="contained"
                    onClick={handleGoClick}
                    disabled={isLoading}
                    startIcon={isLoading ? null : <PlayArrowIcon />}
                  >
                    {isLoading ? <CircularProgress size={24} /> : "Execute"}
                  </StyledButton>
                  <StyledSaveButton
                    variant="outlined"
                    startIcon={<SaveIcon />}
                    onClick={handleSaveQuery}
                  >
                    Save
                  </StyledSaveButton>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </GlassCard>

        <Box
          sx={{ mb: 2, display: "flex", justifyContent: "flex-end", gap: 2 }}
        >
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={handleRefresh}
          >
            Refresh
          </Button>
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={handleExportCSV}
          >
            Export CSV
          </Button>
          <Button
            variant="outlined"
            startIcon={<PictureAsPdfIcon />}
            onClick={handleExportPDF}
          >
            Export PDF
          </Button>
          <Button
            variant="outlined"
            startIcon={<TableChartIcon />}
            onClick={handleExportExcel}
          >
            Export Excel
          </Button>
        </Box>

        <GlassCard>
          <Box sx={{ height: 600, width: "100%" }}>
            <StyledDataGrid
              rows={queryResults}
              columns={getColumns()}
              pageSize={10}
              rowsPerPageOptions={[10, 25, 50]}
              loading={isLoading}
              components={{ Toolbar: GridToolbar }}
            />
          </Box>
        </GlassCard>

        {queryResults.length === 0 && !isLoading && (
          <Box sx={{ mt: 2, textAlign: "center", py: 8 }}>
            <Typography variant="h6" color="text.secondary">
              No Data to Display
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Select a query and date range, then click Execute
            </Typography>
          </Box>
        )}
      </StyledPaper>
    </Box>
  );
};

export default LogView;
