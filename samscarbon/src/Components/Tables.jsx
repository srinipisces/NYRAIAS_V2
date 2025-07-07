import React, { useState, useEffect } from 'react';
import {
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  TableContainer,
  Typography,
  CircularProgress,
  Box,
} from '@mui/material';

export default function DataTable({ tableName, header_param }) {
  const API_URL = 'http://13.61.100.218:8000/api/' + tableName;

  const [rawData, setRawData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(API_URL)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch data');
        return res.json();
      })
      .then((json) => {
        setRawData(json.data || []);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [API_URL]);

  if (loading) return <CircularProgress />;
  if (error) return <Typography color="error">Error: {error}</Typography>;
  if (rawData.length === 0) return <Typography>No data available.</Typography>;

  const headers = Object.keys(rawData[0]);

  return (

    <>
    <span style={{marginBottom:'10px'}}>{header_param} :</span>
    <Box sx={{ paddingTop: 3 }}>
      

      <TableContainer
        component={Paper}
        sx={{
          maxHeight: 500,
          overflow: 'auto',
          border: '1px solid #ccc',
        }}
      >
        <Table stickyHeader size="small" sx={{ borderCollapse: 'collapse' }}>
          <TableHead>
            <TableRow sx={{ backgroundColor: '#f0f0f0' }}>
              {headers.map((key) => (
                <TableCell
                  key={key}
                  sx={{
                    padding: '8px',
                    border: '1px solid #ccc',
                    fontWeight: 'bold',
                    backgroundColor: '#f0f0f0',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {key.replace(/_/g, ' ').toUpperCase()}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {rawData.map((row, rowIndex) => (
              <TableRow key={rowIndex}>
                {headers.map((key) => (
                  <TableCell
                    key={key}
                    sx={{
                      padding: '8px',
                      borderBottom: '1px solid #ddd',
                      whiteSpace: 'nowrap',
                      border: '1px solid #ccc',
                    }}
                  >
                    {row[key]}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>

    </>
  );
}
