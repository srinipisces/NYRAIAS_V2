import { Box, Paper, Typography } from '@mui/material';
import { ResponsiveBar } from '@nivo/bar';
import { useMemo } from 'react';

/* --- helpers for MUI bar lists --- */
const PALETTE = [
  '#4F46E5', '#22C55E', '#EF4444', '#F59E0B', '#06B6D4',
  '#A855F7', '#10B981', '#E11D48', '#F97316', '#0EA5E9',
  '#84CC16', '#D946EF', '#F43F5E', '#14B8A6', '#8B5CF6',
];
const fmt = new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 });

function colorFor(key) {
  let h = 0;
  for (let i = 0; i < String(key).length; i++) h = (h * 31 + String(key).charCodeAt(i)) >>> 0;
  return PALETTE[h % PALETTE.length];
}

function toSeries(raw = [], field) {
  const rows = raw.map(r => ({
    inward: r.inward_number ?? r.inward ?? r.inwardNo ?? 'NA',
    qty: Number(r[field] || 0),
  }));
  rows.sort((a, b) => b.qty - a.qty);
  return rows;
}

function BarList({ title, rows, height, globalMax }) {
  const max = globalMax ?? Math.max(0, ...rows.map(r => r.qty));
  return (
    <Box sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
      <Typography variant="subtitle2" sx={{ mb: 1, textAlign: 'center' }}>{title}</Typography>
      <Box
        sx={{
          flex: 1,
          minHeight: height,
          maxHeight: height,
          overflowY: 'auto',
          pr: 0.5,
          display: 'flex',
          flexDirection: 'column',
          gap: 1,
        }}
      >
        {rows.map(({ inward, qty }) => {
          const pct = max > 0 ? (qty / max) * 100 : 0;
          const color = colorFor(inward);
          return (
            <Box
              key={`${title}-${inward}`}
              sx={{
                display: 'grid',
                gridTemplateColumns: '120px 1fr',
                alignItems: 'center',
                gap: 1,
              }}
            >
              <Typography fontSize={12} sx={{ color: 'text.secondary' }} noWrap title={inward}>
                {inward}
              </Typography>

              <Box
                sx={{
                  position: 'relative',
                  height: 22,
                  background: '#e9eef3',
                  borderRadius: 1.25,
                  overflow: 'hidden',
                }}
              >
                <Box
                  sx={{
                    position: 'absolute',
                    inset: 0,
                    width: `${pct}%`,
                    minWidth: qty > 0 ? 6 : 0,
                    transition: 'width 250ms ease',
                    background: color,
                  }}
                />
                <Box
                  sx={{
                    position: 'relative',
                    zIndex: 1,
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    px: 1,
                    pointerEvents: 'none',
                  }}
                >
                  <Typography fontSize={11.5} sx={{ color: pct > 35 ? 'white' : 'text.secondary' }}>
                    {fmt.format(qty)} kg
                  </Typography>
                  <Typography fontSize={10.5} sx={{ color: 'text.disabled' }}>
                    {pct.toFixed(0)}%
                  </Typography>
                </Box>
              </Box>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}

function ImpurityBarLists({ raw = [], panelHeight = 320 }) {
  const stones  = useMemo(() => toSeries(raw, 'Stones'),  [raw]);
  const unburnt = useMemo(() => toSeries(raw, 'Unburnt'), [raw]);
  const minus20 = useMemo(() => toSeries(raw, 'Minus20'), [raw]);

  const globalMax = useMemo(
    () => Math.max(
      0,
      ...stones.map(r => r.qty),
      ...unburnt.map(r => r.qty),
      ...minus20.map(r => r.qty)
    ),
    [stones, unburnt, minus20]
  );

  return (
    <Box sx={{ display: 'flex', gap: 2, width: '100%' }}>
      <BarList title="Stones"  rows={stones}  height={panelHeight} globalMax={globalMax} />
      <BarList title="Unburnt" rows={unburnt} height={panelHeight} globalMax={globalMax} />
      <BarList title="-20"     rows={minus20} height={panelHeight} globalMax={globalMax} />
    </Box>
  );
}

/* --- MAIN COMPONENT: receives all data from wrapper --- */
export default function GCharcoalCharts({ data }) {
  const {
    GCharcoal_chartData = [],
    GCharcoal_chart_keys = [],
    GCharcoal_impurities_chart = [],
  } = data || {};

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        gap: 2,
        width: '100%',
        flexWrap: 'wrap',
      }}
    >
      {/* Chart 1: GCharcoal Stock (Nivo) */}
      <Paper sx={{ flex: 1, minWidth: { xs: '100%', sm: '0' }, p: 2 }}>
        <Typography variant="h6" fontWeight="bold" gutterBottom>
          GCharcoal Stock Supplier Wise
        </Typography>
        <Box sx={{ height: 300 }}>
          <ResponsiveBar
            data={GCharcoal_chartData}
            keys={GCharcoal_chart_keys}
            indexBy="supplier_name"
            groupMode="stacked"
            margin={{ top: 20, right: 20, bottom: 40, left: 50 }}
            padding={0.3}
            colors={{ scheme: 'nivo' }}
            tooltip={({ id, value, indexValue }) => (
              <Box sx={{ p: 1, fontSize: '0.75rem' }}>
                <div><strong>{id}</strong>: {value} kg</div>
                <div><strong>Supplier:</strong> {indexValue}</div>
              </Box>
            )}
          />
        </Box>
      </Paper>

      {/* Chart 2: Impurities (MUI bar lists) */}
      <Paper sx={{ flex: 1, minWidth: { xs: '100%', sm: '0' }, p: 2 }}>
        <Typography variant="h6" fontWeight="bold" gutterBottom>
          Impurities (per Inward Number)
        </Typography>
        <ImpurityBarLists raw={GCharcoal_impurities_chart} panelHeight={320} />
      </Paper>
    </Box>
  );
}
