import React from 'react';
import { ResponsiveBar } from '@nivo/bar';

export default function RawMaterialStock({ data, keys }) {
  return (
    <div>
      <div style={{ height: '300px', width: '400px', overflowY: 'auto' }}>
        <ResponsiveBar
          data={data}
          keys={keys}
          indexBy="supplier_name"
          margin={{ top: 20, right: 20, bottom: 50, left: 50 }}
          padding={0.3}
          groupMode="stacked"
          axisBottom={{
            tickValues: [], // ⛔ hides supplier names from X-axis
            legend: '',     // ⛔ remove axis legend
          }}
          axisLeft={{}}
          colors={{ scheme: 'nivo' }}
          tooltip={({ id, value, indexValue, data }) => (
            <div style={{ fontSize: '0.75rem', padding: '4px 8px', background: '#fff', border: '1px solid #ccc', minWidth: '75px', maxWidth: '75px' }}>
              <strong>{data.supplier_name}</strong><br />
              {`${id}: ${value}`}
            </div>
          )}
          labelSkipWidth={12}
          labelSkipHeight={12}
        />
      </div>
    </div>
  );
}
