// ImpuritiesChart.jsx
import { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { Box, Paper, Typography, LinearProgress, Alert, Button } from '@mui/material';
import { ResponsiveBar } from '@nivo/bar';

const KEYS = ['Stones', 'Unburnt', 'Minus20'];
const COLOR_MAP = { Stones: '#87CEEB', Unburnt: '#10B981', Minus20: '#FFB74D' };
const n = (v) => Number(v || 0);

export default function ImpuritiesChart({
  url = `${import.meta.env.VITE_API_URL}/api/dashboard/gcharcoal`,
  sx,
}) {
  const [rows, setRows] = useState([]);
  const [state, setState] = useState({ loading: true, error: null });
  const abortRef = useRef(null);

  const fetchData = async () => {
    abortRef.current?.abort?.();
    const controller = new AbortController();
    abortRef.current = controller;

    setState({ loading: true, error: null });
    try {
      const res = await axios.get(url, { withCredentials: true, signal: controller.signal });
      const list = res?.data?.data?.GCharcoal_impurities_chart ?? [];
      // Ensure numeric fields
      const mapped = (Array.isArray(list) ? list : []).map((r) => ({
        inward_number: r.inward_number ?? 'NA',
        supplier_name: r.supplier_name ?? '',
        Stones: n(r.Stones),
        Unburnt: n(r.Unburnt),
        Minus20: n(r.Minus20),
      }));
      // Hide rows with all zeros
      const filtered = mapped.filter((r) => KEYS.some((k) => n(r[k]) > 0));

      setRows(filtered);
      setState({ loading: false, error: null });
    } catch (err) {
      if (axios.isCancel(err)) return;
      const msg = err?.response?.data?.error || err?.message || 'Failed to fetch data';
      setState({ loading: false, error: msg });
    }
  };

  useEffect(() => {
    fetchData();
    return () => abortRef.current?.abort?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url]);

  if (state.loading) {
    return (
      <Paper sx={{ p: 2, ...sx }}>
        <LinearProgress />
      </Paper>
    );
  }

  if (state.error) {
    return (
      <Paper sx={{ p: 2, ...sx }}>
        <Alert
          severity="error"
          action={<Button onClick={fetchData} color="inherit" size="small">Retry</Button>}
        >
          Failed to load data: {state.error}
        </Alert>
      </Paper>
    );
  }

  if (!rows.length) {
    return (
      <Paper sx={{ p: 2, ...sx }}>
        <Alert severity="info">No impurity data to display.</Alert>
      </Paper>
    );
  }

  const rowHeight = 28;
  const chartHeight = Math.max(160, 40 + rows.length * rowHeight);

  return (
    <Paper sx={{ p: 3, bgcolor: '#f6f8fa', width:'100%', height: 300 }}>
      <Typography variant="subtitle1" sx={{ mb: 1, textAlign: 'center' }}>
        Impurities by Inward
      </Typography>

      <Box sx={{ height: 250 }}>
        <ResponsiveBar
          data={rows}
          keys={KEYS}
          indexBy="inward_number"
          layout="horizontal"
          groupMode="stacked"
          padding={0.2}
          margin={{ top: 10, right: 10, bottom: 30, left: 10 }}
          enableGridX
          axisLeft={null}
          axisBottom={{
            tickSize: 1,
            tickPadding: 1,
            legend: '',
            legendOffset: 24,
            legendPosition: 'middle',
          }}
          colors={({ id }) => COLOR_MAP[id]}
          valueFormat={(v) => `${v} kg`}
          label={(d) => (d.value > 0 ? `${d.value} kg` : '')}
          labelSkipWidth={24}
          labelTextColor={{ from: 'color', modifiers: [['darker', 2]] }}
          tooltip={({ indexValue, data }) => {
            const s = n(data.Stones);
            const u = n(data.Unburnt);
            const m = n(data.Minus20);
            const total = s + u + m;
            return (
              <Box sx={{ fontSize: '0.75rem', p: '6px 8px', background: '#fff', border: '1px solid #ccc', boxShadow: '0 2px 8px rgba(0,0,0,.15)' ,width:100}}>
                <div><strong>Inward:</strong> {indexValue}</div>
                <div>Stones: {s} kg</div>
                <div>Unburnt: {u} kg</div>
                <div>-20: {m} kg</div>
                <hr style={{ margin: '6px 0' }} />
                <div><strong>Total:</strong> {total} kg</div>
              </Box>
            );
          }}
          /* legends={[
            {
              dataFrom: 'keys',
              anchor: 'bottom-right',
              direction: 'column',
              translateX: 0,
              translateY: 0,
              itemWidth: 80,
              itemHeight: 16,
              itemsSpacing: 4,
              symbolSize: 10,
            }
          ]} */
          role="img"
          ariaLabel="Impurities stacked bar chart by inward number"
        />
      </Box>
    </Paper>
  );
}
