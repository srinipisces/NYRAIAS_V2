import React, { useEffect, useState } from 'react';
import { ResponsiveBar } from '@nivo/bar';
import { Paper, Box, Typography, CircularProgress } from '@mui/material';

const BASE_URL = import.meta.env.VITE_API_URL;

export default function RawMaterialStock() {
  const [data, setData] = useState([]);
  const [keys, setKeys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(`${BASE_URL}/api/dashboard/rawmaterial`, {
      method: 'GET',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
    })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch charcoal stock');
        return res.json();
      })
      .then((json) => {
        if (json?.data) {
          setData(json.data.Charcoal_chartData || []);
          setKeys(json.data.Charcoal_chart_keys || []);
        } else {
          throw new Error('Invalid data structure');
        }
      })
      .catch((err) => {
        setError(err.message || 'Unknown error');
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <Paper sx={{
    p: 1,
    height: { xs: 'auto', sm: 350 },
    width: '100%',
    minWidth: 0,                // important in Grid/Flex
    backgroundColor: '#f6f8fa',
    overflowX: 'auto',
  }}>
    <Box sx={{p:2}}>
      <Typography variant="subtitle1" gutterBottom>
        Charcoal Stock 
      </Typography>

      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
          <CircularProgress size={24} />
        </Box>
      )}

      {error && (
        <Typography color="error" fontSize={14}>
          Error: {error}
        </Typography>
      )}

      {!loading && !error && (
        <Box sx={{ height: 300, overflowY: 'auto' }}>
          <ResponsiveBar
            data={data}
            keys={keys}
            indexBy="supplier_name"
            margin={{ top: 20, right: 20, bottom: 20, left: 50 }}
            padding={0.3}
            groupMode="stacked"
            axisBottom={{
              tickValues: [],
              legend: '',
            }}
            axisLeft={{}}
            colors={{ scheme: 'nivo' }}
            tooltip={({ id, value, data }) => (
              <div
                style={{
                  fontSize: '0.75rem',
                  padding: '4px 8px',
                  background: '#fff',
                  border: '1px solid #ccc',
                  minWidth: '75px',
                }}
              >
                <strong>{data.supplier_name}</strong>
                <br />
                {`${id}: ${value}`}
              </div>
            )}
            labelSkipWidth={12}
            labelSkipHeight={12}
          />
        </Box>
      )}
    </Box>
    </Paper>
  );
}
