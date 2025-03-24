import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
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
import { ThemeContext } from "../../contexts/ThemeContext";

const API_BASE_URL = `${process.env.REACT_APP_API_LOCAL_URL}api`;

const customDefaultWidgetSettings = {
  backgroundColor: "#cff7ba",
  borderColor: "#417505",
  borderRadius: "3px",
  borderWidth: "1px",
  titleColor: "#000000",
  titleFontFamily: "Georgia",
  titleFontSize: "16px",
  titleFontStyle: "normal",
  titleFontWeight: "normal",
  titleTextDecoration: "none",
  valueColor: "#d0021b",
  valueFontFamily: "Arial",
  valueFontSize: "14px",
  valueFontStyle: "normal",
  valueTextDecoration: "none",
};

const StyledPaper = styled(Paper)(({ theme, settings }) => ({
  padding: theme.spacing(2),
  boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
  background: settings?.backgroundColor || theme.palette.background.paper,
  border: `${settings?.borderWidth || "1px"} solid ${
    settings?.borderColor || "#e0e0e0"
  }`,
  borderRadius: settings?.borderRadius || "8px",
}));

const StyledTableCell = styled(TableCell)(({ theme, settings }) => ({
  borderBottom: `1px solid #e0e0e0`,
  padding: theme.spacing(0.5, 1),
  whiteSpace: "normal",
  wordWrap: "break-word",
  width: "200px",
  height: "40px",
  maxWidth: "200px",
  backgroundColor: settings?.backgroundColor,
  textAlign: "center",
}));

const StyledHeaderCell = styled(TableCell)(({ theme, settings }) => ({
  borderBottom: `2px solid #1976d2`,
  padding: theme.spacing(0.5, 1),
  whiteSpace: "normal",
  wordWrap: "break-word",
  width: "200px",
  height: "40px",
  maxWidth: "200px",
  backgroundColor: settings?.backgroundColor,
  textAlign: "center",
}));

// Updated formatTimestamp to return raw timestamp string as-is
const formatTimestamp = (timestamp) => {
  return timestamp || "--";
};

const DashboardDataGridWidget = ({
  data,
  width,
  height,
  dashboardName,
  isPublished,
}) => {
  const { isDarkMode } = useContext(ThemeContext);
  const settings = { ...customDefaultWidgetSettings, ...(data.settings || {}) };
  const rows = parseInt(data.rows) || 1;
  const measurandColumns = parseInt(data.columns) || 1;
  const addTimestamp = data.addTimestamp || false;

  const [plants, setPlants] = useState(data.plants || []);
  const [terminals, setTerminals] = useState(data.terminals || []);
  const [measurands, setMeasurands] = useState(data.measurands || []);
  const [selectedPlant, setSelectedPlant] = useState(
    data.selectedPlant || (plants.length > 0 ? plants[0].PlantName : "")
  );
  const [selectedTerminals, setSelectedTerminals] = useState(
    data.selectedTerminals?.length === rows
      ? data.selectedTerminals
      : Array(rows).fill(terminals.length > 0 ? terminals[0].TerminalName : "")
  );
  const [selectedMeasurements, setSelectedMeasurements] = useState(
    data.selectedMeasurements?.length === measurandColumns
      ? data.selectedMeasurements
      : Array(measurandColumns).fill(
          measurands.length > 0 ? measurands[0].MeasurandName : ""
        )
  );
  const [gridData, setGridData] = useState(
    data.gridData ||
      Array(rows)
        .fill()
        .map(() =>
          Array(measurandColumns).fill({ value: "--", timestamp: "", unit: "" })
        )
  );

  useEffect(() => {
    console.log("DashboardDataGridWidget Props:", {
      dashboardName,
      widgetId: data.id,
      data,
    });
  }, [dashboardName, data]);

  const saveSelectionsToDB = async () => {
    if (!dashboardName || !data.id) {
      console.error(
        "Cannot save selections: dashboardName or data.id is undefined",
        {
          dashboardName,
          widgetId: data.id,
        }
      );
      return;
    }

    try {
      const url = `${API_BASE_URL}/dashboards/${dashboardName}/widgets/${data.id}/selections`;
      await axios.put(url, {
        selectedPlant,
        selectedTerminals,
        selectedMeasurements,
      });
    } catch (error) {
      console.error("Error saving selections:", error);
    }
  };

  const fetchPlants = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/plants`);
      const newPlants = response.data;
      setPlants(newPlants);
      if (newPlants.length > 0 && !selectedPlant) {
        setSelectedPlant(newPlants[0].PlantName);
      }
    } catch (error) {
      console.error("Error fetching plants:", error);
      setPlants([]);
    }
  };

  const fetchTerminals = async (plantName) => {
    if (!plantName) return;
    try {
      const response = await axios.get(
        `${API_BASE_URL}/terminals/${plantName}`
      );
      const newTerminals = response.data;
      setTerminals(newTerminals);
      if (newTerminals.length > 0 && !selectedTerminals.some((t) => t)) {
        setSelectedTerminals(Array(rows).fill(newTerminals[0].TerminalName));
      }
    } catch (error) {
      console.error("Error fetching terminals:", error);
      setTerminals([]);
    }
  };

  const fetchMeasurands = async (plantName, terminalName) => {
    if (!plantName || !terminalName) return;
    try {
      const response = await axios.get(
        `${API_BASE_URL}/measurands/${plantName}/${terminalName}`
      );
      const newMeasurands = response.data;
      setMeasurands(newMeasurands);
      if (newMeasurands.length > 0 && !selectedMeasurements.some((m) => m)) {
        setSelectedMeasurements(
          Array(measurandColumns).fill(newMeasurands[0].MeasurandName)
        );
      }
    } catch (error) {
      console.error("Error fetching measurands:", error);
      setMeasurands([]);
    }
  };

  const fetchMeasurementData = async (plant, terminal, measurand) => {
    if (!plant || !terminal || !measurand)
      return { value: "--", timestamp: "", unit: "" };
    try {
      const response = await axios.get(
        `${API_BASE_URL}/measurements/${plant}/${terminal}/${measurand}`
      );
      const data = response.data;
      if (data.length > 0) {
        const latest = data[data.length - 1];
        return {
          value:
            latest.MeasurandValue !== undefined &&
            latest.MeasurandValue !== null &&
            !isNaN(parseFloat(latest.MeasurandValue))
              ? parseFloat(latest.MeasurandValue)
              : "--",
          timestamp: latest.TimeStamp || "",
          unit: latest.Unit || "",
        };
      }
      return { value: "--", timestamp: "", unit: "" };
    } catch (error) {
      console.error(
        `Error fetching data for ${plant}/${terminal}/${measurand}:`,
        error
      );
      return { value: "--", timestamp: "", unit: "" };
    }
  };

  useEffect(() => {
    if (!plants.length) fetchPlants();
  }, []);

  useEffect(() => {
    if (selectedPlant) fetchTerminals(selectedPlant);
  }, [selectedPlant]);

  useEffect(() => {
    if (selectedPlant && selectedTerminals[0])
      fetchMeasurands(selectedPlant, selectedTerminals[0]);
  }, [selectedPlant, selectedTerminals]);

  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      if (
        !selectedPlant ||
        selectedTerminals.some((t) => !t) ||
        selectedMeasurements.some((m) => !m)
      ) {
        setGridData(
          Array(rows)
            .fill()
            .map(() =>
              Array(measurandColumns).fill({
                value: "--",
                timestamp: "",
                unit: "",
              })
            )
        );
        return;
      }

      const newData = await Promise.all(
        selectedTerminals.map(async (terminal) => {
          const rowData = await Promise.all(
            selectedMeasurements.map(async (measurand) => {
              return await fetchMeasurementData(
                selectedPlant,
                terminal,
                measurand
              );
            })
          );
          return rowData;
        })
      );

      if (isMounted) {
        setGridData(
          newData.length
            ? newData
            : Array(rows).fill(
                Array(measurandColumns).fill({
                  value: "--",
                  timestamp: "",
                  unit: "",
                })
              )
        );
        saveSelectionsToDB();
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [selectedPlant, selectedTerminals, selectedMeasurements]);

  const handlePlantChange = (_, value) => {
    setSelectedPlant(value);
    setSelectedTerminals(Array(rows).fill(""));
    setSelectedMeasurements(Array(measurandColumns).fill(""));
    setGridData(
      Array(rows)
        .fill()
        .map(() =>
          Array(measurandColumns).fill({ value: "--", timestamp: "", unit: "" })
        )
    );
    saveSelectionsToDB();
  };

  const handleTerminalChange = (rowIdx, value) => {
    const newTerminals = [...selectedTerminals];
    newTerminals[rowIdx] = value;
    setSelectedTerminals(newTerminals);
    saveSelectionsToDB();
  };

  const handleMeasurementChange = (colIdx, value) => {
    const newMeasurements = [...selectedMeasurements];
    newMeasurements[colIdx] = value;
    setSelectedMeasurements(newMeasurements);
    saveSelectionsToDB();
  };

  const renderDropdown = (type, value, options, onChange, index) => {
    if (isPublished) {
      return null;
    }

    return (
      <FormControl sx={{ width: "150px", height: "40px" }}>
        <Select
          value={value || ""}
          onChange={(e) => onChange(index, e.target.value)}
          size="small"
          sx={{
            fontSize: "0.875rem",
            height: "40px",
            backgroundColor: isDarkMode ? "#2c2c2c" : "#ffffff",
            color: settings.titleColor,
            fontFamily: settings.titleFontFamily,
            fontSize: settings.titleFontSize,
            fontStyle: settings.titleFontStyle,
            fontWeight: settings.titleFontWeight,
            textDecoration: settings.titleTextDecoration,
            "& .MuiSelect-icon": {
              color: isDarkMode ? "#e0e0e0" : "#1976d2",
            },
            borderRadius: "4px",
            boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
          }}
          displayEmpty
          MenuProps={{
            PaperProps: {
              sx: {
                backgroundColor: isDarkMode ? "#2c2c2c" : "#ffffff",
                color: settings.titleColor,
                fontFamily: settings.titleFontFamily,
                fontSize: settings.titleFontSize,
                fontStyle: settings.titleFontStyle,
                fontWeight: settings.titleFontWeight,
                textDecoration: settings.titleTextDecoration,
              },
            },
          }}
        >
          <MenuItem value="" disabled>
            Select {type}
          </MenuItem>
          {options.map((option) => (
            <MenuItem
              key={
                option[
                  type === "Plant"
                    ? "PlantId"
                    : type === "Terminal"
                    ? "TerminalId"
                    : "MeasurandId"
                ]
              }
              value={
                option[
                  type === "Plant"
                    ? "PlantName"
                    : type === "Terminal"
                    ? "TerminalName"
                    : "MeasurandName"
                ]
              }
            >
              {
                option[
                  type === "Plant"
                    ? "PlantName"
                    : type === "Terminal"
                    ? "TerminalName"
                    : "MeasurandName"
                ]
              }
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    );
  };

  return (
    <StyledPaper
      settings={settings}
      sx={{ width: "100%", height: "100%", overflow: "auto" }}
    >
      <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
        <Typography
          sx={{
            color: settings.titleColor,
            fontFamily: settings.titleFontFamily,
            fontSize: settings.titleFontSize,
            fontStyle: settings.titleFontStyle,
            fontWeight: settings.titleFontWeight,
            textDecoration: settings.titleTextDecoration,
          }}
        >
          {data.name}
        </Typography>
        {!isPublished && (
          <Box sx={{ ml: 2 }}>
            {renderDropdown("Plant", selectedPlant, plants, handlePlantChange)}
          </Box>
        )}
      </Box>
      <Table>
        <TableHead>
          <TableRow>
            <StyledHeaderCell settings={settings}>
              <Typography
                sx={{
                  color: settings.titleColor,
                  fontFamily: settings.titleFontFamily,
                  fontSize: settings.titleFontSize,
                  fontStyle: settings.titleFontStyle,
                  fontWeight: settings.titleFontWeight,
                  textDecoration: settings.titleTextDecoration,
                  wordWrap: "break-word",
                  maxWidth: "200px",
                }}
              >
                Terminal
              </Typography>
            </StyledHeaderCell>
            {addTimestamp && (
              <StyledHeaderCell settings={settings}>
                <Typography
                  sx={{
                    color: settings.titleColor,
                    fontFamily: settings.titleFontFamily,
                    fontSize: settings.titleFontSize,
                    fontStyle: settings.titleFontStyle,
                    fontWeight: settings.titleFontWeight,
                    textDecoration: settings.titleTextDecoration,
                    wordWrap: "break-word",
                    maxWidth: "200px",
                  }}
                >
                  Timestamp
                </Typography>
              </StyledHeaderCell>
            )}
            {Array(measurandColumns)
              .fill()
              .map((_, i) => (
                <StyledHeaderCell key={i} settings={settings}>
                  {renderDropdown(
                    "Measurand",
                    selectedMeasurements[i],
                    measurands,
                    handleMeasurementChange,
                    i
                  ) || (
                    <Typography
                      sx={{
                        color: settings.titleColor,
                        fontFamily: settings.titleFontFamily,
                        fontSize: settings.titleFontSize,
                        fontStyle: settings.titleFontStyle,
                        fontWeight: settings.titleFontWeight,
                        textDecoration: settings.titleTextDecoration,
                        wordWrap: "break-word",
                        maxWidth: "200px",
                      }}
                    >
                      {selectedMeasurements[i]
                        ? `${selectedMeasurements[i]} (${
                            gridData?.[0]?.[i]?.unit || ""
                          })`
                        : "--"}
                    </Typography>
                  )}
                </StyledHeaderCell>
              ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {Array(rows)
            .fill()
            .map((_, rowIdx) => (
              <TableRow key={rowIdx}>
                <StyledTableCell settings={settings}>
                  {renderDropdown(
                    "Terminal",
                    selectedTerminals[rowIdx],
                    terminals,
                    handleTerminalChange,
                    rowIdx
                  ) || (
                    <Typography
                      sx={{
                        color: settings.titleColor,
                        fontFamily: settings.titleFontFamily,
                        fontSize: settings.titleFontSize,
                        fontStyle: settings.titleFontStyle,
                        fontWeight: settings.titleFontWeight,
                        textDecoration: settings.titleTextDecoration,
                        wordWrap: "break-word",
                        maxWidth: "200px",
                      }}
                    >
                      {selectedTerminals[rowIdx] || "--"}
                    </Typography>
                  )}
                </StyledTableCell>
                {addTimestamp && (
                  <StyledTableCell settings={settings}>
                    <Typography
                      sx={{
                        color: settings.valueColor,
                        fontFamily: settings.valueFontFamily,
                        fontSize: settings.valueFontSize,
                        fontStyle: settings.valueFontStyle,
                        fontWeight: settings.valueFontWeight,
                        textDecoration: settings.valueTextDecoration,
                        wordWrap: "break-word",
                        maxWidth: "200px",
                      }}
                    >
                      {formatTimestamp(gridData[rowIdx]?.[0]?.timestamp)}
                    </Typography>
                  </StyledTableCell>
                )}
                {gridData[rowIdx]?.map((cell, colIdx) => (
                  <StyledTableCell key={colIdx} settings={settings}>
                    <Typography
                      sx={{
                        color: settings.valueColor,
                        fontFamily: settings.valueFontFamily,
                        fontSize: settings.valueFontSize,
                        fontStyle: settings.valueFontStyle,
                        fontWeight: settings.valueFontWeight,
                        textDecoration: settings.valueTextDecoration,
                        wordWrap: "break-word",
                        maxWidth: "200px",
                      }}
                    >
                      {cell.value !== "--" ? `${cell.value.toFixed(2)}` : "--"}
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

export default DashboardDataGridWidget;
