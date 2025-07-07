import React, { useEffect, useState } from 'react';
import { ResponsiveBar } from '@nivo/bar';

const API_URL = 'http://localhost:8000/api/charcoalstock';  // your Express endpoint

export default function RawMaterialStock({onStockCalculated}) {
  const [data, setData] = useState([]);
  const [keys,setKeys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    fetch(API_URL)
      .then(res => res.json())
      .then(json => {
        
        const total = json.data.reduce((sum, item) => sum + parseFloat(item.weight), 0);
        onStockCalculated?.(total); // call parent callback
        
        const grouped = {};
  
        json.data.forEach(item => {
          const supplier = item.supplier_name;
          const inwardKey = item.inward_number.replace(/\s+/g, ''); // e.g. I976
          const weight = parseFloat(item.weight);
  
          if (!grouped[supplier]) {
            grouped[supplier] = { supplier_name: supplier };
          }
  
          grouped[supplier][inwardKey] = (grouped[supplier][inwardKey] || 0) + weight;
        });
  
        const chartData = Object.values(grouped);
        const allInwards = new Set(json.data.map(d => d.inward_number.replace(/\s+/g, '')));
  
        setData(chartData);
        setKeys(Array.from(allInwards));
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [onStockCalculated]);
  



  if (loading) return <div>Loading...</div>;
  if (error) return <div style={{ color: 'red' }}>Error: {error}</div>;
  if (data.length === 0) return <div>Currently no Charcoal is in stock.</div>;

  console.log("Cahrt......." ,data)

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