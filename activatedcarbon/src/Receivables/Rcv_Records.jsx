// RawMaterialIncomingFilterShell.jsx
import * as React from "react";
import {
  Box, Paper, Stack, Button, TextField, MenuItem, Typography, Chip,
  IconButton, Tooltip, Divider, Grid
} from "@mui/material";
import FilterAltIcon from "@mui/icons-material/FilterAlt";
import ClearAllIcon from "@mui/icons-material/ClearAll";
import DownloadIcon from "@mui/icons-material/Download";
import {
  Table, TableContainer, TableHead, TableRow, TableCell, TableBody, TablePagination,
} from "@mui/material";

const API_URL = import.meta.env.VITE_API_URL;
const BASE = `${API_URL}/receivables`;

export default function RawMaterialIncomingFilterShell() {
  const [showFilters, setShowFilters] = React.useState(false);
  const [filters, setFilters] = React.useState({
    inward_number: "",
    supplier_name: "",
    admit: "All",
    from: "",
    to: "",
  });

  const filtersApplied =
    !!filters.inward_number ||
    !!filters.supplier_name ||
    filters.admit !== "All" ||
    !!filters.from ||
    !!filters.to;

  const buildDownloadQuery = () => {
    const p = new URLSearchParams();
    if (filters.inward_number) p.set("inward_number", filters.inward_number);
    if (filters.supplier_name) p.set("supplier_name", filters.supplier_name);
    if (filters.admit && filters.admit !== "All") p.set("admit", filters.admit);
    if (filters.from) p.set("from", filters.from);
    if (filters.to) p.set("to", filters.to);
    return p.toString();
  };

  const handleClear = () =>
    setFilters({ inward_number: "", supplier_name: "", admit: "All", from: "", to: "" });

  const handleDownloadCsv = () => {
    const qs = buildDownloadQuery();
    const url = `${BASE}/RawMaterialIncoming/download.csv${qs ? `?${qs}` : ""}`;
    const a = document.createElement("a");
    a.href = url; a.download = "";
    document.body.appendChild(a); a.click(); a.remove();
  };

  return (
    // Root: fill container, never overflow horizontally
    <div style={{ display: "grid", gap: 12 }}>
      
          (table will render here)
          <TableContainer sx={{ maxHeight: 520 }}>
                  <Table stickyHeader size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell width={56} /> {/* room for big tap-target */}
                        <TableCell>Arrival Time</TableCell>
                        <TableCell>Inward #</TableCell>
                        <TableCell>Supplier</TableCell>
                        <TableCell>DC #</TableCell>
                        <TableCell align="right">Supplier Weight</TableCell>
                        <TableCell align="right">Supplier Value</TableCell>
                        <TableCell align="right">Security Weight</TableCell>
                        <TableCell>Security User</TableCell>
                        <TableCell>Arrival Time</TableCell>
                        <TableCell>Inward #</TableCell>
                        <TableCell>Supplier</TableCell>
                        <TableCell>DC #</TableCell>
                        <TableCell align="right">Supplier Weight</TableCell>
                        <TableCell align="right">Supplier Value</TableCell>
                        <TableCell align="right">Security Weight</TableCell>
                        <TableCell>Security User</TableCell>
                      </TableRow>
                    </TableHead>
                   </Table>
            </TableContainer>
   </div>
  );
}
