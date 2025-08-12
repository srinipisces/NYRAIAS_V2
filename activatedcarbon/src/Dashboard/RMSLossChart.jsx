// src/Reports/RmsLossLast30Chart.jsx
import React, { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import { Box, Paper, Typography, CircularProgress, Alert ,useTheme,useMediaQuery} from '@mui/material';


import { ResponsiveBar } from '@nivo/bar';

export default function RMSLossChart() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [rows, setRows] = useState([]);
  const [avgPct, setAvgPct] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/dashboard/rms-loss-last30`,
          { withCredentials: true }
        );
        if (mounted) {
          if (res.data?.success) {
            setRows(res.data.rows || []);
            setAvgPct(Number(res.data.avg_pct || 0));
          } else {
            throw new Error(res.data?.error || 'Unknown API error');
          }
        }
      } catch (e) {
        if (mounted) setError(e.message || 'Failed to load chart');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const data = useMemo(() => {
    return (rows || []).map(r => ({
      inward_number: r.inward_number,
      rms_total_loss_pct: Number(r.rms_total_loss_pct || 0),
      outward_status_upddt: r.outward_status_upddt,
    }));
  }, [rows]);

  const barColors = useMemo(() => [
    '#87CEEB', // sky-blue
    '#FFA500', // orange
  ], []);


  const AverageLine = ({ yScale, innerWidth }) => {
    if (!data.length) return null;
    const y = yScale(avgPct);
    return (
      <>
        <line x1={0} x2={innerWidth} y1={y} y2={y} strokeWidth={2} strokeDasharray="6,4" stroke="currentColor" />
        <text x={innerWidth - 4} y={y - 6} textAnchor="end" fontSize={16}>
          Avg: {avgPct.toFixed(2)}%
        </text>
      </>
    );
  };

  const titleRange = useMemo(() => {
    const end = new Date();
    const start = new Date(Date.now() - 30 * 24 * 3600 * 1000);
    return `${start.toLocaleDateString()} – ${end.toLocaleDateString()}`;
  }, []);


  const axisBottomMobile = {
    tickValues: [],   // no ticks
    tickSize: 0,
    tickPadding: 0,
    legend: 'Inward Numbers',     // single legend
    legendOffset: 14,
    legendPosition: 'middle',
  };

  const axisBottomDesktop = {
    tickSize: 3,
    tickPadding: 4,
    legend: 'Inward Numbers',
    legendOffset: 30,
    legendPosition: 'middle',
  };

  return (
    <Paper sx={{ p: {xs:1,sm:3}, bgcolor: '#f6f8fa', width:'100%', height: 350, mx:'auto' }}>
      <Typography variant="h6" gutterBottom>
        RMS Total Loss % — Last 30 days
      </Typography>
      <Typography variant="body2" sx={{ mb: 1, color: 'text.secondary' }}>
        {titleRange}
      </Typography>

      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress />
        </Box>
      )}

      {!loading && error && <Alert severity="error">{error}</Alert>}

      {!loading && !error && data.length === 0 && (
        <Alert severity="info">No completed outwards in the last 30 days.</Alert>
      )}

      {!loading && !error && data.length > 0 && (
        <Box sx={{ height: 280, width: '100%' }}>
          <ResponsiveBar
            data={data}
            indexBy="inward_number"
            keys={['rms_total_loss_pct']}
            margin={{ top: 30, right: 24, bottom: isMobile ? 20 : 35, left: 20 }}
            padding={0.3}
            valueFormat={v => `${Number(v || 0).toFixed(2)}%`}
            axisBottom={isMobile ? axisBottomMobile : axisBottomDesktop}
            axisLeft={{legend : 'RMS Total Loss %',legendOffset: -10,tickValues: []}}
            enableGridX
            enableLabel={false}
            colorBy="indexValue"               // color by each inward (category)
            colors={barColors}                 // alternates through this array
            tooltip={({ data: d }) => (
              <div style={{ padding: '6px 8px', background: '#fff', border: '1px solid #ccc', fontSize: 12 }}>
                <div><strong>{d.inward_number}</strong></div>
                <div>Completed: {new Date(d.outward_status_upddt).toLocaleString()}</div>
                <div>Loss: {Number(d.rms_total_loss_pct).toFixed(2)}%</div>
              </div>
            )}
            layers={[
              'grid',
              'axes',
              'bars',
              'markers',
              'legends',
              AverageLine, // custom average line
            ]}
          />
        </Box>
      )}
    </Paper>
  );
}
