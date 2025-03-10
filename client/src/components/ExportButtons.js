import React from "react";
import { Tooltip, IconButton, Box } from "@mui/material";
import GetAppIcon from "@mui/icons-material/GetApp";
import jsPDF from "jspdf";
import "jspdf-autotable";
import * as XLSX from "xlsx";
import { styled } from "@mui/material/styles";
import { useContext } from "react";
import { ThemeContext } from "../contexts/ThemeContext";

// ------------------ Styled IconButton for export actions ------------------
const StyledIconButton = styled(IconButton)(({ theme }) => ({
  margin: theme.spacing(0, 1),
  "&:hover": {
    color: theme.palette.primary.main,
  },
}));

const ExportButtons = ({ rows, columns, stats, tableId, profile }) => {
  const { isDarkMode } = useContext(ThemeContext);

  // ------------------ Function to export table data to PDF ------------------
  const exportToPDF = () => {
    const doc = new jsPDF({
      orientation: "landscape",
      unit: "pt",
      format: "a4",
    });

    doc.setFontSize(16);
    doc.text(`Table Data - ${profile}`, 40, 40);

    const tableData = rows.map((row) =>
      columns.map((col) => row[col.field]?.toFixed(2) ?? "N/A")
    );

    doc.autoTable({
      startY: 60,
      head: [columns.map((col) => col.headerName)],
      body: tableData,
      theme: "striped",
      styles: {
        fontSize: 8,
        cellPadding: 4,
        overflow: "linebreak",
      },
      headStyles: {
        fillColor: isDarkMode ? [33, 150, 243] : [25, 118, 210],
        textColor: 255,
      },
      columnStyles: {
        0: { cellWidth: 120 },
      },
      margin: { top: 60, left: 40, right: 40 },
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

    doc.autoTable({
      startY: finalY + 10,
      head: [["Measurand", "Min", "Max", "Avg"]],
      body: statsData,
      theme: "grid",
      styles: {
        fontSize: 8,
        cellPadding: 4,
      },
      headStyles: {
        fillColor: isDarkMode ? [33, 150, 243] : [25, 118, 210],
        textColor: 255,
      },
      margin: { left: 40, right: 40 },
    });

    doc.save(`table_${tableId}_data.pdf`);
  };

  // ------------------ Function to export table data to Excel ------------------
  const exportToExcel = () => {
    const tableData = [
      columns.map((col) => col.headerName),
      ...rows.map((row) =>
        columns.map((col) => row[col.field]?.toFixed(2) ?? "N/A")
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

    const worksheet = XLSX.utils.aoa_to_sheet([...tableData, [], ...statsData]);
    worksheet["!cols"] = columns.map(() => ({ wch: 20 }));

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Table Data");

    XLSX.writeFile(workbook, `table_${tableId}_data.xlsx`, {
      compression: true,
    });
  };

  return (
    <Box sx={{ display: "flex", justifyContent: "flex-end", p: 1 }}>
      {/* ------------------ PDF export button ------------------ */}
      <Tooltip title="Export to PDF" arrow>
        <StyledIconButton onClick={exportToPDF}>
          <GetAppIcon />
        </StyledIconButton>
      </Tooltip>

      {/* ------------------ Excel export button ------------------ */}
      <Tooltip title="Export to Excel" arrow>
        <StyledIconButton onClick={exportToExcel}>
          <GetAppIcon />
        </StyledIconButton>
      </Tooltip>
    </Box>
  );
};

export default ExportButtons;
