import React, { useState } from 'react';
import {
  Table, TableHead, TableRow, TableCell, TableBody,
  Button, Dialog, DialogTitle, DialogContent, DialogActions,
  IconButton, TextField
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

export default function DynamicTable({ columns, rows, primaryKey, editablePopupFields = [], onPopupSave }) {
  const [popupOpen, setPopupOpen] = useState(false);
  const [popupRow, setPopupRow] = useState(null);
  const [popupField, setPopupField] = useState('');
  const [originalValue, setOriginalValue] = useState('');
  const [newValue, setNewValue] = useState('');
  const [saveDisabled, setSaveDisabled] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const handleOpenPopup = (row, field) => {
    const value = row[field] || '';
    setPopupRow(row);
    setPopupField(field);
    setOriginalValue(value);
    setNewValue(value);
    setPopupOpen(true);
    setSaveDisabled(true);
    setIsSaving(false);
  };

  const handleClosePopup = () => {
    setPopupOpen(false);
    setPopupRow(null);
    setPopupField('');
    setOriginalValue('');
    setNewValue('');
    setSaveDisabled(true);
    setIsSaving(false);
  };

  const handleChange = (e) => {
    const value = e.target.value;
    setNewValue(value);
    setSaveDisabled(value === originalValue);
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveDisabled(true);
    try {
      await onPopupSave(popupRow, popupField, newValue);
      handleClosePopup();
    } catch (err) {
      alert('Error saving data.');
      setIsSaving(false);
      setSaveDisabled(false);
    }
  };

  return (
    <>
      <Table size="small">
        <TableHead>
            <TableRow sx={{ backgroundColor: '#f5f5f5' }}> {/* light gray background */}
                {columns.map((col) => (
                <TableCell
                    key={col.field}
                    sx={{ fontWeight: 'bold', color: '#333' }} // darker text
                >
                    {col.headerName || col.field}
                </TableCell>
                ))}
            </TableRow>
        </TableHead>

        <TableBody>
          {rows.map((row, rowIndex) => (
            <TableRow key={row[primaryKey] || rowIndex}>
              {columns.map((col) => {
                const isEditable = editablePopupFields.includes(col.field);
                const value = row[col.field];

                return (
                  <TableCell key={col.field}>
                    {isEditable ? (
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => handleOpenPopup(row, col.field)}
                      >
                        {value || '—'}
                      </Button>
                    ) : (
                      value
                    )}
                  </TableCell>
                );
              })}
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Popup Dialog */}
      <Dialog open={popupOpen} onClose={handleClosePopup} maxWidth="sm" fullWidth>
        <DialogTitle>
          Edit "{popupField}"
          <IconButton
            aria-label="close"
            onClick={handleClosePopup}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <TextField
            fullWidth
            value={newValue}
            onChange={handleChange}
            label={popupField}
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleSave}
            disabled={saveDisabled || isSaving}
            variant="contained"
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
