import React, { useEffect, useState } from 'react';
import ExpandableTable from './ExpandableTable';
import axios from 'axios';

export default function MaterialOutwardTable() {
  const [columns, setColumns] = useState([]);
  const [expandColumns, setExpandColumns] = useState([]);
  const [rows, setRows] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/materialoutward/material-outward-bagging`,{withCredentials:true});
        const { columns, rows, expandColumns } = res.data;

        setColumns(columns);
        setRows(rows);
        setExpandColumns(expandColumns);
      } catch (err) {
        console.error('Error fetching MaterialInward:', err.response?.data || err.message);
        alert('Failed to load data: ' + (err.response?.data?.error || err.message));
      }
    };

    fetchData();
  }, []);

  return (
    <div style={{ padding: 16 }}>
      <ExpandableTable
        columns={columns}
        rows={rows}
        expandColumns={expandColumns}
        expandKey="bags"
      />
    </div>
  );
}
