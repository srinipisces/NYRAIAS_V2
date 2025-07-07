import React from 'react';
import { ResponsiveBar } from '@nivo/bar';

export default function GCharcoalPercentChart({ data = [] }) {
  const tooltipStyle = {
    fontSize: '0.75rem',
    padding: '6px 10px',
    background: '#fff',
    border: '1px solid #ccc',
    boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
    pointerEvents: 'none',
    transform: 'translate(10px, 10px)', // shifts tooltip below/right of cursor
    position: 'relative',
    maxWidth: '150px',
    whiteSpace: 'nowrap'
  };

  return (
    <div style={{ height: '300px', width: '100%', overflowX: 'auto' }}>
      <ResponsiveBar
        data={data}
        keys={['percent_gcharcoal', 'percent_stone', 'percent_unburnt']}
        indexBy="inward_number" // ✅ group by inward_number
        margin={{ top: 20, right: 20, bottom: 50, left: 60 }}
        padding={0.3}
        groupMode="stacked"
        valueFormat={(v) => `${v.toFixed(1)}%`}
        maxValue={100}
        axisBottom={{
          legend: 'Inward Number',
          legendOffset: 36,
          tickRotation: 0
        }}
        axisLeft={{
          legend: '% Composition',
          legendOffset: -40,
        }}
        colors={{ scheme: 'nivo' }}
        tooltip={({ id, value, indexValue, data }) => (
          <div style={tooltipStyle}>
            <div><strong>Supplier:</strong> {data.supplier_name}</div>
            <div><strong>Inward:</strong> {indexValue}</div>
            <div><strong>{id}:</strong> {value}%</div>
          </div>
        )}
        labelSkipWidth={12}
        labelSkipHeight={12}
      />
    </div>
  );
}
