import { Box, Typography } from '@mui/material';
import { ResponsiveBar } from '@nivo/bar';

function toSeries(raw = [], field) {
  return raw.map((r) => ({
    inward_number: r.inward_number ?? r.inward ?? r.inwardNo ?? 'NA',
    qty: Number(r[field] || 0),
  }));
}

// alternating colors per bar
const colorSets = [
  ['#4F46E5', '#A5B4FC'], // blue tones
  ['#10B981', '#6EE7B7'], // green tones
  ['#F97316', '#FDBA74'], // orange tones
];

export default function ImpuritySmallMultiples({ raw = [] }) {
  const charts = [
    { key: 'Stones', title: 'Stones', colors: colorSets[0] },
    { key: 'Unburnt', title: 'Unburnt', colors: colorSets[1] },
    { key: 'Minus20', title: '-20', colors: colorSets[2] },
  ];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'row', gap: 2, width: '100%' }}>
      {charts.map(({ key, title, colors }) => {
        const data = toSeries(raw, key);

        return (
          <Box key={key} sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="subtitle2" sx={{ mb: 1, textAlign: 'center' }}>
              {title}
            </Typography>
            <Box sx={{ height: 300 }}>
              <ResponsiveBar
                data={data}
                keys={['qty']}
                indexBy="inward_number"
                margin={{ top: 10, right: 10, bottom: 10, left: 60 }}
                padding={0.2}
                layout="horizontal"
                enableGridX
                axisBottom={{legend:'kgs'}} // ❌ remove x-axis legend
                axisLeft={{
                  tickSize: 3,
                  tickPadding: 4,
                  legend: null, // ❌ remove y-axis legend
                }}
                colors={({ index }) => colors[index % colors.length]} // ✅ alternate colors
                label={(d) => `${d.value} kg`}
                labelSkipWidth={1000}
                labelTextColor={{
                  from: 'color',
                  modifiers: [['darker', 2]],
                }}
                theme={{
                    tooltip: {
                        container: {
                        fontSize: '0.75rem',
                        padding: '6px 8px',
                        background: '#ffffff',
                        border: '1px solid #ccc',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                        transform: 'translate(10px, 12px)',
                        opacity: 1,                  // ✅ always visible
                        zIndex: 1000,                // ✅ on top of everything
                        pointerEvents: 'auto',       // make it interactive if needed
                        },
                    },
                    }}

                tooltip={({ value, indexValue }) => (
                  <Box sx={{ fontSize: '0.75rem',background: '#fff' }}>
                    <div><strong>Inward:</strong> {indexValue}</div>
                    <div><strong>Qty:</strong> {value} kg</div>
                  </Box>
                )}
              />
            </Box>
          </Box>
        );
      })}
    </Box>
  );
}
