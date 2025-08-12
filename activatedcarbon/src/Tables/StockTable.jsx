import React, { useState, useEffect } from 'react';
import {
  Table, TableBody, TableCell, TableHead, TableRow,
  Button, Select, MenuItem, CircularProgress, TablePagination,
  Dialog, DialogTitle, DialogContent, DialogActions, Typography
} from '../../node_modules/@mui/material';

export default function StockTable({
  data, page, totalRows, rowsPerPage, onPageChange, onUpdate, loading
}) {
  const [rows, setRows] = useState([]);
  const [loadingRow, setLoadingRow] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState({ open: false, bag_no: '', newStatus: '' });

  useEffect(() => {
    setRows(data.map(row => ({
      ...row,
      newStatus: row.delivery_status || 'InStock'
    })));
  }, [data]);

  const handleFieldChange = (index, value) => {
    const updated = [...rows];
    updated[index].newStatus = value;
    setRows(updated);
  };

  const handleRequestUpdate = (bag_no, newStatus) => {
    setConfirmDialog({ open: true, bag_no, newStatus });
  };

  const handleConfirmUpdate = async () => {
    const { bag_no, newStatus } = confirmDialog;
    setConfirmDialog({ open: false, bag_no: '', newStatus: '' });
    setLoadingRow(bag_no);
    try {
      await onUpdate(bag_no, newStatus);
    } finally {
      setLoadingRow(null);
    }
  };

  const getStatusOptions = (bag_no) => {
    const prefix = bag_no.toLowerCase();
    if (prefix.startsWith('scr')) return ['InStock', 'Delivered', 'Screening','Re-Processing'];
    if (prefix.startsWith('ds')) return ['InStock', 'Delivered','Screening'];
    return ['InStock']; // default/fallback
  };

  return (
    <>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Bag_No</TableCell>
            <TableCell>Grade</TableCell>
            <TableCell>CTC</TableCell>
            <TableCell>Weight</TableCell>
            <TableCell>Stock Status</TableCell>
            <TableCell>Update</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row, idx) => {
            const options = getStatusOptions(row.bag_no);
            const isUpdating = loadingRow === row.bag_no;
            const isChanged = row.newStatus !== (row.delivery_status || 'InStock');

            return (
              <TableRow key={row.bag_no}>
                <TableCell>{row.bag_no}</TableCell>
                <TableCell>{row.grade}</TableCell>
                <TableCell>{row.ctc}</TableCell>
                <TableCell>{row.weight}</TableCell>
                <TableCell>
                  <Select
                    value={row.newStatus}
                    onChange={(e) => handleFieldChange(idx, e.target.value)}
                    disabled={isUpdating || loading}
                    size="small"
                    sx={{ minWidth: 140 }}
                  >
                    {options.map((status) => (
                      <MenuItem key={status} value={status}>{status}</MenuItem>
                    ))}
                  </Select>
                </TableCell>
                <TableCell>
                  <Button
                    variant="contained"
                    disabled={!isChanged || isUpdating || loading}
                    onClick={() => handleRequestUpdate(row.bag_no, row.newStatus)}
                  >
                    {isUpdating ? <CircularProgress size={20} /> : 'Update'}
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      <TablePagination
        component="div"
        count={totalRows}
        page={page}
        onPageChange={(_, newPage) => onPageChange(newPage)}
        rowsPerPage={rowsPerPage}
        rowsPerPageOptions={[rowsPerPage]}
      />

      <Dialog
        open={confirmDialog.open}
        onClose={() => setConfirmDialog({ open: false, bag_no: '', newStatus: '' })}
      >
        <DialogTitle>Confirm Update</DialogTitle>
        <DialogContent>
          <Typography>
            Update <strong>{confirmDialog.bag_no}</strong> to <strong>{confirmDialog.newStatus}</strong>?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialog({ open: false, bag_no: '', newStatus: '' })}>
            Cancel
          </Button>
          <Button onClick={handleConfirmUpdate} variant="contained" color="primary">
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
