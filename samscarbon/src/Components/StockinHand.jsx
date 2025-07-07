import React, { useEffect, useState } from 'react';
import { ResponsiveBar } from '@nivo/bar';
import { Button, autocompleteClasses } from '@mui/material'
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import IconButton from '@mui/material/IconButton';
import MultiselectDialog from './MultiSelectList';


const API_URL = 'http://localhost:8000/api/stock_in_hand';  // your Express endpoint

export default function StockInHand() {
  const [data, setData] = useState([]);
  const [filteredGrades, setFilteredGrades] = useState([]);
  const [allGrades, setAllGrades] = useState([]);
  const [rawData, setRawData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    fetch(API_URL)
      .then(res => res.json())
      .then(json => {
        setRawData(json.data);
        
        const uniqueGrades = [...new Set(json.data.map(d => d.grade))];
        setAllGrades(uniqueGrades);
        setFilteredGrades(uniqueGrades); // all selected by default
        setData(json.data);
        setLoading(false)
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);


    if (loading) return <div>Loading...</div>;
    if (error) return <div style={{ color: 'red' }}>Error: {error}</div>;
    if (rawData.length === 0) return <div>No data available.</div>;

    const handleApplyFilter = (selected) => {
        
        setFilteredGrades(selected)
        const filtered = rawData.filter(d => selected.includes(d.grade));
        setData(filtered);
        setDialogOpen(false);
      };


  return (
        <>
        <div>
        <span>Stock in Hand Grade wise :</span>
        <IconButton style={{float:'right'}}> <FilterAltIcon color='primary' onClick={() => setDialogOpen(true)}/></IconButton>

            <MultiselectDialog
            open={dialogOpen}
            onClose={() => setDialogOpen(false)}
            onApply={handleApplyFilter}
            initialValues={filteredGrades}
            options={allGrades}
            />
        </div>
        <div style={{height:'180px',width:'100%',overflowY:'auto'}}>
            <div style={{height:data.length < 8 ? 200 : 600,width:600}} >
            <ResponsiveBar
                data={data}
                keys={['weight']}
                indexBy="grade" // 🔄 Replace "?column?" with the actual field (e.g., "grade")
                margin={{ top: 10, right: 10, bottom: 10, left: 50 }}
                padding={0.3}
                colors={{ scheme: 'paired' }}
                layout="horizontal"
                axisBottom={null} // ✅ Remove bottom axis
                axisLeft={{
                tickSize: 2,
                tickPadding: 10,
                legend: 'Grade',
                legendPosition: 'middle',
                legendOffset: -40,
            
                }}
                theme={{
                    axis: {
                    domain: {
                        line: {
                        stroke: '#000',
                        strokeWidth: 1
                        }
                    },
                    
                    }}}
                enableLabel={true} // ✅ Turn off default labels
                labelPosition='end'
                //layers={['grid', 'axes', 'bars', CustomLabelLayer]} // ✅ Add custom labels at end
            />
            </div>
        </div>
    </>
  );
    
}