import React, { useEffect, useState } from 'react';
import DynamicTable from './DynamicTable';
import axios from 'axios';
import { TbRulerMeasure } from 'react-icons/tb';

export default function BoilerPerformanceTable() {
  const [tableData, setTableData] = useState({ columns: [], rows: [] });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/BoilerPerformance`,{withCredentials:true});
        const data = res.data;

        // Assuming response has: { columns: [{ field, headerName }], rows: [ ... ] }
        setTableData(data);
      } catch (err) {
        console.error('Error fetching BoilerPerformance:', err.response?.data || err.message);
        alert('Failed to load data: ' + (err.response?.data?.error || err.message));
      }
    };

    fetchData();
  }, []);

  return (
    <div style={{ padding: 16 }}>
      <DynamicTable columns={tableData.columns} rows={tableData.rows} />
    </div>
  );
}
