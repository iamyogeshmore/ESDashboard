import React, { useState, useEffect, useContext } from "react";
import { ThemeContext } from "../../contexts/ThemeContext";
import {
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  MenuItem,
  Select,
  FormControl,
  Box,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import axios from "axios";

// --------------- Base API endpoint from environment variables ---------------
const API_BASE_URL = `${process.env.REACT_APP_API_LOCAL_URL}api`;

const customDefaultWidgetSettings = {
  titleColor: "#000000",
  titleFontFamily: "Georgia",
  titleFontSize: "20px",
  titleFontWeight: "normal",
  titleFontStyle: "normal",
  titleTextDecoration: "none",
  valueColor: "#000000",
  valueFontFamily: "Arial",
  valueFontSize: "14px",
  valueFontWeight: "bold",
  valueFontStyle: "normal",
  valueTextDecoration: "none",
  backgroundColor: "#b8e986",
  borderColor: "#417505",
  borderWidth: "3px",
  borderRadius: "3px",
};

// ------------- paper container with custom settings ------------------
const StyledPaper = styled(Paper)(({ theme, settings }) => ({
  padding: theme.spacing(2),
  boxShadow: theme.shadows[2],
  background: settings?.backgroundColor || theme.palette.background.paper,
  border: `${settings?.borderWidth || "1px"} solid ${
    settings?.borderColor || "#e0e0e0"
  }`,
  borderRadius: settings?.borderRadius || "8px",
}));

// -------------table cells with custom border and padding ------------------
const StyledTableCell = styled(TableCell)(({ theme }) => ({
  borderBottom: `1px solid ${theme.palette.divider}`,
  padding: theme.spacing(1),
}));

// ------------- Formats a timestamp into a readable string ------------------
const formatTimestamp = (timestamp) => {
  if (!timestamp) return "--";
  const date = new Date(timestamp);
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  const hours = String(date.getUTCHours()).padStart(2, "0");
  const minutes = String(date.getUTCMinutes()).padStart(2, "0");
  const seconds = String(date.getUTCSeconds()).padStart(2, "0");
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};

// ------------- Main component to render a data grid widget on the dashboard ------------------
const DashboardDataGridWidget = ({ data, width, height }) => {
  const { isDarkMode } = useContext(ThemeContext);
  const settings = { ...customDefaultWidgetSettings, ...(data.settings || {}) };
  const rows = parseInt(data.rows) || 1;
  const columns = parseInt(data.columns) || 1;

  const [plants, setPlants] = useState(data.plants || []);
  const [terminals, setTerminals] = useState(data.terminals || []);
  const [measurands, setMeasurands] = useState(data.measurands || []);
  const [selectedPlant, setSelectedPlant] = useState("");
  const [selectedTerminals, setSelectedTerminals] = useState(
    Array(rows).fill("")
  );
  const [selectedMeasurements, setSelectedMeasurements] = useState(
    Array(columns - 1).fill("")
  );
  const [gridData, setGridData] = useState(
    Array(rows)
      .fill()
      .map(() => Array(columns).fill({ value: 0, timestamp: "" }))
  );

  // ------------- Fetches the list of plants ------------------
  const fetchPlants = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/plants`);
      setPlants(response.data);
      if (response.data.length > 0 && !selectedPlant) {
        setSelectedPlant(response.data[0].PlantName);
      }
    } catch (error) {
      console.error("Error fetching plants:", error);
    }
  };

  // ------------- Fetches terminals for a given plant ------------------
  const fetchTerminals = async (plantName) => {
    if (!plantName) return;
    try {
      const response = await axios.get(
        `${API_BASE_URL}/terminals/${plantName}`
      );
      setTerminals(response.data);
      if (response.data.length > 0) {
        setSelectedTerminals(Array(rows).fill(response.data[0].TerminalName));
      } else {
        setSelectedTerminals(Array(rows).fill(""));
      }
    } catch (error) {
      console.error("Error fetching terminals:", error);
      setTerminals([]);
    }
  };

  // ------------- Fetches measurands for a given plant and terminal ------------------
  const fetchMeasurands = async (plantName, terminalName) => {
    if (!plantName || !terminalName) return;
    try {
      const response = await axios.get(
        `${API_BASE_URL}/measurands/${plantName}/${terminalName}`
      );
      setMeasurands(response.data);
      if (response.data.length > 0) {
        setSelectedMeasurements(
          Array(columns - 1).fill(response.data[0].MeasurandName)
        );
      } else {
        setSelectedMeasurements(Array(columns - 1).fill(""));
      }
    } catch (error) {
      console.error("Error fetching measurands:", error);
      setMeasurands([]);
    }
  };

  // ------------- Fetches measurement data for a specific plant, terminal, and measurand ------------------
  const fetchMeasurementData = async (plant, terminal, measurand) => {
    if (!plant || !terminal || !measurand) return { value: 0, timestamp: "" };
    try {
      const response = await axios.get(
        `${API_BASE_URL}/measurements/${plant}/${terminal}/${measurand}`
      );
      const data = response.data;
      if (data.length > 0) {
        const latest = data[data.length - 1];
        return {
          value: parseFloat(latest.MeasurandValue) || 0,
          timestamp: latest.TimeStamp || "",
        };
      }
      return { value: 0, timestamp: "" };
    } catch (error) {
      console.error(
        `Error fetching data for ${plant}/${terminal}/${measurand}:`,
        error
      );
      return { value: 0, timestamp: "" };
    }
  };

  // ------------- Fetches plants on initial load if not provided ------------------
  useEffect(() => {
    if (!plants.length) {
      fetchPlants();
    } else if (plants.length > 0 && !selectedPlant) {
      setSelectedPlant(plants[0].PlantName);
    }
  }, [plants]);

  // ------------- Fetches terminals when the selected plant changes ------------------
  useEffect(() => {
    if (selectedPlant) {
      fetchTerminals(selectedPlant);
    }
  }, [selectedPlant]);

  // ------------- Fetches measurands when the plant or first terminal changes ------------------
  useEffect(() => {
    if (selectedPlant && selectedTerminals[0]) {
      fetchMeasurands(selectedPlant, selectedTerminals[0]);
    }
  }, [selectedPlant, selectedTerminals]);

  // ------------- Fetches and updates grid data periodically ------------------
  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      if (
        !selectedPlant ||
        selectedTerminals.some((t) => !t) ||
        selectedMeasurements.some((m) => !m)
      ) {
        return;
      }

      const newData = await Promise.all(
        selectedTerminals.map(async (terminal, rowIdx) => {
          const timestampData = await fetchMeasurementData(
            selectedPlant,
            terminal,
            selectedMeasurements[0] || measurands[0]?.MeasurandName || ""
          );
          const rowData = await Promise.all(
            selectedMeasurements.map(async (measurand) => {
              const data = await fetchMeasurementData(
                selectedPlant,
                terminal,
                measurand
              );
              return { value: data.value, timestamp: timestampData.timestamp };
            })
          );
          return [{ value: 0, timestamp: timestampData.timestamp }, ...rowData];
        })
      );

      if (isMounted) {
        setGridData(newData);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 5000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [selectedPlant, selectedTerminals, selectedMeasurements]);

  // ------------- Handles plant selection change and resets related states ------------------
  const handlePlantChange = (value) => {
    setSelectedPlant(value);
    setSelectedTerminals(Array(rows).fill(""));
    setSelectedMeasurements(Array(columns - 1).fill(""));
    setGridData(
      Array(rows)
        .fill()
        .map(() => Array(columns).fill({ value: 0, timestamp: "" }))
    );
  };

  // ------------- Handles terminal selection change for a specific row ------------------
  const handleTerminalChange = (rowIdx, value) => {
    const newTerminals = [...selectedTerminals];
    newTerminals[rowIdx] = value;
    setSelectedTerminals(newTerminals);
  };

  // ------------- Handles measurement selection change for a specific column ------------------
  const handleMeasurementChange = (colIdx, value) => {
    const newMeasurements = [...selectedMeasurements];
    newMeasurements[colIdx] = value;
    setSelectedMeasurements(newMeasurements);
  };

  return (
    <StyledPaper
      settings={settings}
      sx={{ width: "100%", height: "100%", overflow: "auto" }}
    >
      <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
        <Typography
          color={settings.titleColor}
          sx={{
            fontSize: settings.titleFontSize,
            fontWeight: settings.titleFontWeight,
            fontFamily: settings.titleFontFamily,
            fontStyle: settings.titleFontStyle,
            textDecoration: settings.titleTextDecoration,
            mr: 2,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          Data Grid - {data.name || "Untitled"}
        </Typography>
        <FormControl sx={{ minWidth: 120 }}>
          <Select
            value={selectedPlant}
            onChange={(e) => handlePlantChange(e.target.value)}
            size="small"
            sx={{
              fontSize: "0.875rem",
              backgroundColor: isDarkMode ? "#2c2c2c" : "inherit",
              color: isDarkMode ? "#e0e0e0" : "inherit",
              "& .MuiSelect-icon": {
                color: isDarkMode ? "#e0e0e0" : "inherit",
              },
            }}
            displayEmpty
            MenuProps={{
              PaperProps: {
                sx: {
                  backgroundColor: isDarkMode ? "#2c2c2c" : "#ffffff",
                  color: isDarkMode ? "#e0e0e0" : "inherit",
                },
              },
            }}
          >
            <MenuItem value="" disabled>
              Select Plant
            </MenuItem>
            {plants.map((plant) => (
              <MenuItem key={plant.PlantId} value={plant.PlantName}>
                {plant.PlantName}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>
      <Table stickyHeader>
        <TableHead>
          <TableRow>
            <StyledTableCell
              sx={{ backgroundColor: isDarkMode ? "#1e1e1e" : "inherit" }}
            >
              Terminal
            </StyledTableCell>
            <StyledTableCell
              sx={{ backgroundColor: isDarkMode ? "#1e1e1e" : "inherit" }}
            >
              Timestamp
            </StyledTableCell>
            {Array(columns - 1)
              .fill()
              .map((_, i) => (
                <StyledTableCell
                  key={i}
                  sx={{ backgroundColor: isDarkMode ? "#1e1e1e" : "inherit" }}
                >
                  <FormControl sx={{ minWidth: 100 }}>
                    <Select
                      value={selectedMeasurements[i] || ""}
                      onChange={(e) =>
                        handleMeasurementChange(i, e.target.value)
                      }
                      size="small"
                      sx={{
                        fontSize: "0.875rem",
                        backgroundColor: isDarkMode ? "#2c2c2c" : "inherit",
                        color: isDarkMode ? "#e0e0e0" : "inherit",
                        "& .MuiSelect-icon": {
                          color: isDarkMode ? "#e0e0e0" : "inherit",
                        },
                      }}
                      displayEmpty
                      MenuProps={{
                        PaperProps: {
                          sx: {
                            backgroundColor: isDarkMode ? "#2c2c2c" : "#ffffff",
                            color: isDarkMode ? "#e0e0e0" : "inherit",
                          },
                        },
                      }}
                    >
                      <MenuItem value="" disabled>
                        Select Measurand
                      </MenuItem>
                      {measurands.map((meas) => (
                        <MenuItem
                          key={meas.MeasurandId}
                          value={meas.MeasurandName}
                        >
                          {meas.MeasurandName}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </StyledTableCell>
              ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {Array(rows)
            .fill()
            .map((_, rowIdx) => (
              <TableRow key={rowIdx}>
                <StyledTableCell>
                  <FormControl sx={{ minWidth: 120 }}>
                    <Select
                      value={selectedTerminals[rowIdx] || ""}
                      onChange={(e) =>
                        handleTerminalChange(rowIdx, e.target.value)
                      }
                      size="small"
                      sx={{
                        fontSize: "0.875rem",
                        backgroundColor: isDarkMode ? "#2c2c2c" : "inherit",
                        color: isDarkMode ? "#e0e0e0" : "inherit",
                        "& .MuiSelect-icon": {
                          color: isDarkMode ? "#e0e0e0" : "inherit",
                        },
                      }}
                      displayEmpty
                      MenuProps={{
                        PaperProps: {
                          sx: {
                            backgroundColor: isDarkMode ? "#2c2c2c" : "#ffffff",
                            color: isDarkMode ? "#e0e0e0" : "inherit",
                          },
                        },
                      }}
                    >
                      <MenuItem value="" disabled>
                        Select Terminal
                      </MenuItem>
                      {terminals.map((term) => (
                        <MenuItem
                          key={term.TerminalId}
                          value={term.TerminalName}
                        >
                          {term.TerminalName}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </StyledTableCell>
                {gridData[rowIdx]?.map((cell, colIdx) => (
                  <StyledTableCell key={colIdx}>
                    <Typography
                      sx={{
                        fontSize: settings.valueFontSize,
                        color: settings.valueColor,
                        fontWeight: settings.valueFontWeight,
                        fontFamily: settings.valueFontFamily,
                        fontStyle: settings.valueFontStyle,
                        textDecoration: settings.valueTextDecoration,
                      }}
                    >
                      {colIdx === 0
                        ? formatTimestamp(cell.timestamp)
                        : `${cell.value.toFixed(2)} ${
                            data.unit ||
                            getUnit(selectedMeasurements[colIdx - 1])
                          }`}
                    </Typography>
                  </StyledTableCell>
                ))}
              </TableRow>
            ))}
        </TableBody>
      </Table>
    </StyledPaper>
  );
};

// ------------- Returns the unit for a given measurand name ------------------
const getUnit = (measurandName) => {
  if (!measurandName) return "";
  switch (measurandName.toLowerCase()) {
    case "voltage":
      return "V";
    case "current":
      return "A";
    case "power":
      return "W";
    case "energy":
      return "kWh";
    default:
      return "";
  }
};

export default DashboardDataGridWidget;
