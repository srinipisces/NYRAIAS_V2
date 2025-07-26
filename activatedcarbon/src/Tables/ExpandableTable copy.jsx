import React, { useState } from 'react';
import {
  Box, Collapse, IconButton, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Typography, Paper
} from '@mui/material';
import { KeyboardArrowDown, KeyboardArrowUp } from '@mui/icons-material';

function Row({ row, columns, expandColumns, expandKey }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <TableRow>
        <TableCell>
          <IconButton size="small" onClick={() => setOpen(!open)}>
            {open ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
          </IconButton>
        </TableCell>
        {columns.map((col) => (
          <TableCell key={col.field}>{row[col.field]}</TableCell>
        ))}
      </TableRow>

      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={columns.length + 1}>
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
                  {(row[expandKey] || []).map((item, i) => (
                    <TableRow key={i}>
                      {expandColumns.map((col) => (
                        <TableCell key={col.field}>{item[col.field]}</TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
}

export default function ExpandableTable({ columns, rows, expandColumns, expandKey }) {
  return (
    <TableContainer component={Paper}>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell />
            {columns.map((col) => (
              <TableCell key={col.field}>{col.headerName}</TableCell>
            ))}
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
            />
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
