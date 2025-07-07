import React, { useEffect, useState } from 'react';
import { ResponsiveBar } from '@nivo/bar';



export default function RawMaterialStock({data,keys}) {
  
  


  return (
    <>
    <div>
        <div style={{ height: '300px',width:'400px',overflowY:'auto',}}>
        <ResponsiveBar
                data={data}
                keys={keys}  // dynamic keys based on inward_numbers
                indexBy="supplier_name"
                margin={{ top: 20, right: 20, bottom: 50, left: 50 }}
                padding={0.3}
                groupMode="stacked"
                axisBottom={{
                  legend: 'Supplier',
                  legendOffset: 36,
                  tickRotation: 0,
                }}
                axisLeft={{
                 
                }}
                colors={{ scheme: 'nivo' }}
                tooltip={({ id, value, indexValue }) => (
                  <div style={{ fontSize: '0.75rem', padding: '4px 8px', background: '#fff', border: '1px solid #ccc' , minwidth : '75px',maxWidth : '75px'}}>
                    {`Inward Number ${id}`}
                  </div>
                )}
                labelSkipWidth={12}
                labelSkipHeight={12}
              />

            </div>
        </div>
    </>
  );
}