// ExpandableTablePlus.jsx — Expandable table with optional Actions column and date-friendly formatting
import React, { useState } from 'react';
import {
  Box, Collapse, IconButton, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Typography, Paper
} from '@mui/material';
import { KeyboardArrowDown, KeyboardArrowUp } from '@mui/icons-material';

function Row({ row, columns, expandColumns, expandKey, rowActions, actionsHeader }) {
  const [open, setOpen] = useState(false);
  const childRows = row[expandKey] || [];

  const weightColumn = expandColumns.find((col) => col.headerName?.trim().toLowerCase() === 'weight');
  const weightField = weightColumn?.field;
  const totalWeight = weightField
    ? childRows.reduce((sum, item) => sum + (parseFloat(item[weightField]) || 0), 0)
    : null;

  return (
    <>
      <TableRow>
        <TableCell width={48}>
          <IconButton size="small" onClick={() => setOpen(!open)}>
            {open ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
          </IconButton>
        </TableCell>
        {columns.map((col) => (
          <TableCell key={col.field}>
            {col.type === 'datetime'
              ? (row[col.field] ? new Date(row[col.field]).toLocaleString() : '')
              : row[col.field]}
          </TableCell>
        ))}
        {rowActions && (
          <TableCell width={140} align="right">
            {rowActions(row)}
          </TableCell>
        )}
      </TableRow>

      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={columns.length + 1 + (rowActions ? 1 : 0)}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box margin={1}>
              <Typography variant="subtitle2" gutterBottom>
                Details
              </Typography>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    {expandColumns.map((col) => (
                      <TableCell key={col.field}>{col.headerName}</TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {childRows.map((item, i) => (
                    <TableRow key={i}>
                      {expandColumns.map((col) => (
                        <TableCell key={col.field}>
                          {col.type === 'datetime'
                            ? (item[col.field] ? new Date(item[col.field]).toLocaleString() : '')
                            : item[col.field]}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                  {weightField && (
                    <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                      <TableCell colSpan={expandColumns.length - 1} align="right" sx={{ fontWeight: 'bold' }}>
                        Total Weight
                      </TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>
                        {totalWeight.toFixed(2)} kg
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
}

export default function ExpandableTable({ columns, rows, expandColumns, expandKey, rowActions, actionsHeader = 'Actions' }) {
  return (
    <TableContainer component={Paper}>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell />
            {columns.map((col) => (
              <TableCell key={col.field}>{col.headerName}</TableCell>
            ))}
            {rowActions && <TableCell align="right">{actionsHeader}</TableCell>}
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row, idx) => (
            <Row
              key={idx}
              row={row}
              columns={columns}
              expandColumns={expandColumns}
              expandKey={expandKey}
              rowActions={rowActions}
              actionsHeader={actionsHeader}
            />
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
