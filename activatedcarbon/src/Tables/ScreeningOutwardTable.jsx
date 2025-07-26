import React, { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import { Box } from '@mui/material';
import DynamicTable from './EditableTable';

const API_URL = import.meta.env.VITE_API_URL;

export default function ScreeningOutwardTable({ searchText }) {
  const [tableData, setTableData] = useState({ columns: [], rows: [] });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/screening/ScreeningOutward`, {
          withCredentials: true,
        });
        setTableData(res.data); // { columns: [...], rows: [...] }
      } catch (err) {
        console.error('Error loading ScreeningOutwardTable:', err.message);
        alert('Failed to load table data.');
      }
    };
    fetchData();
  }, []);

  // 🧠 Local filter using searchText
  const filteredRows = useMemo(() => {
    if (!searchText) return tableData.rows;
    return tableData.rows.filter(row =>
      Object.values(row).some(val =>
        String(val).toLowerCase().includes(searchText.toLowerCase())
      )
    );
  }, [tableData.rows, searchText]);

  // 💾 Backend update handler for editable fields
  const handlePopupSave = async (row, field, newValue) => {
    const payload = {
      primaryKeyField: 'bag_no',
      primaryKeyValue: row.bag_no,
      field,
      value: newValue,
    };

    await axios.post(`${API_URL}/api/screening/update-cell`, payload, {
      withCredentials: true,
    });

    // 🔄 Optimistic UI update
    setTableData(prev => ({
      ...prev,
      rows: prev.rows.map(r =>
        r.bag_no === row.bag_no ? { ...r, [field]: newValue } : r
      ),
    }));
  };

  return (
    <Box sx={{ padding: 2 }}>
      <DynamicTable
        columns={tableData.columns}
        rows={filteredRows}
        primaryKey="bag_no"
        editablePopupFields={['ctc']} // ⬅️ only 'remarks' is editable
        onPopupSave={handlePopupSave}
      />
    </Box>
  );
}
