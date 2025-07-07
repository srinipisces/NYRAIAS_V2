import React from 'react';
import { ResponsiveBar } from '@nivo/bar';



export default function LabTest({ data}) {
  
  return (
    <div style={{ height: '300px',width:'400px',overflow:'auto' }}>
      <ResponsiveBar
        data={data}
        keys={['moisture', 'dust', 'ad_value']}
        indexBy="inward_number"
        margin={{ top: 20, right: 20, bottom: 50, left: 50 }}
        padding={0.3}
        groupMode="grouped"
        colors={{ scheme: 'set2' }}
        axisBottom={{
          tickRotation: 0,
          legend: 'Inward Number',
          legendPosition: 'middle',
          legendOffset: 32
        }}
        axisLeft={{
          legend: 'Value',
          legendPosition: 'middle',
          legendOffset: -40
        }}
        labelSkipWidth={12}
        labelSkipHeight={12}
        legends={[
          {
            dataFrom: 'keys',
            anchor: 'top-right',
            direction: 'column',
            translateX: 120,
            itemsSpacing: 2,
            itemWidth: 100,
            itemHeight: 20,
            symbolSize: 12,
          }
        ]}
        tooltip={({ id, value, indexValue }) => (
          <strong style={{ fontSize: '13px' }}>
            {`${id} : ${value}`}
          </strong>
        )}
      />
    </div>
  );
}
