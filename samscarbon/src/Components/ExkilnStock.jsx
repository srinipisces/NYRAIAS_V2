import React from 'react';
import { ResponsiveBar } from '@nivo/bar';

export default function ExkilnStock({ data }) {
  return (
    <div style={{ height: '300px', width: '100%', overflowX: 'auto' }}>
      <ResponsiveBar
        data={data}
        keys={['weight']}
        indexBy="kiln"
        margin={{ top: 20, right: 20, bottom: 50, left: 60 }}
        padding={0.3}
        groupMode="grouped" // Not stacked
        axisBottom={{
          legend: 'Kiln',
          legendOffset: 36,
          tickRotation: 0,
        }}
        axisLeft={{
          legend: 'Weight',
          legendOffset: -40,
        }}
        colors={{ scheme: 'nivo' }}
        tooltip={({ id, value, indexValue }) => (
          <div style={{ fontSize: '0.75rem', padding: '4px 8px', background: '#fff', border: '1px solid #ccc' }}>
            <strong>Kiln:</strong> {indexValue}<br />
            <strong>Weight:</strong> {value}
          </div>
        )}
        labelSkipWidth={12}
        labelSkipHeight={12}
        animate
      />
    </div>
  );
}
