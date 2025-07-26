import React, { useEffect, useState } from 'react';
import DynamicTable from './DynamicTable';
import axios from 'axios';

export default function LabTest() {
  const [tableData, setTableData] = useState({ columns: [], rows: [] });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/lab/LabTest_Table`,{withCredentials:true});
        const data = res.data;

        // Assuming response has: { columns: [{ field, headerName }], rows: [ ... ] }
        setTableData(data);
      } catch (err) {
        console.error('Error fetching LabTest_Table:', err.response?.data || err.message);
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
