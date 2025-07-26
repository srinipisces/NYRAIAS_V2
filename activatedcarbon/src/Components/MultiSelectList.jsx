import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Checkbox, Typography, Box, Divider
} from '@mui/material';

const MultiselectDialog = ({ open, onClose, onApply, options = [], initialValues = [] }) => {
  const [selected, setSelected] = useState([]);

  
  useEffect(() => {
    if (open) {
      setSelected(initialValues);
    }
  }, [open, initialValues]);
  

  const isAllSelected = selected.length === options.length && options.length > 0;

  const handleToggle = (value) => () => {
    setSelected((prev) =>
      prev.includes(value)
        ? prev.filter((v) => v !== value)
        : [...prev, value]
    );
  };

  const handleToggleAll = (e) => {
    if (e.target.checked) {
      setSelected([...options]);
    } else {
      setSelected([]);
    }
  };

  const handleApply = () => {
    onApply(selected);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth={false} >
      <DialogTitle>Select Filters</DialogTitle>

      <DialogContent dividers sx={{ maxHeight: 400, p: 0 ,maxWidth: 400,overflowX:'auto'}}>
        {/* Header */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: '40px 1fr',
            alignItems: 'center',
            px: 2,
            py: 1,
            backgroundColor: '#f5f5f5',
          }}
        >
          <Checkbox
            checked={isAllSelected}
            indeterminate={selected.length > 0 && selected.length < options.length}
            onChange={handleToggleAll}
            size="small"
          />
          <Typography variant="subtitle2">Grade</Typography>
        </Box>
        <Divider />

        {/* List Items */}
        <Box sx={{ overflowY: 'auto' }}>
          {options.map((option) => (
            <Box
              key={option}
              onClick={handleToggle(option)}
              sx={{
                display: 'grid',
                gridTemplateColumns: '40px 1fr',
                alignItems: 'center',
                px: 2,
                py: 0.75,
                cursor: 'pointer',
                '&:hover': { backgroundColor: '#f0f0f0' },
              }}
            >
              <Checkbox
                checked={selected.includes(option)}
                size="small"
              />
              <Typography variant="body2">{option}</Typography>
            </Box>
          ))}
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleApply} variant="contained">Apply</Button>
      </DialogActions>
    </Dialog>
  );
};

export default MultiselectDialog;
