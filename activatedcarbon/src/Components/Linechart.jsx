import React, { useState, useEffect } from "react";
import { LineChart } from "../../node_modules/@mui/x-charts/LineChart";
import {
  Button,
  MenuItem,
  FormControl,
  Select,
  InputLabel,
  Box,
  Typography,
  CircularProgress,
} from "../../node_modules/@mui/material";

// Helper: Sort "1st", "2nd", ... numerically
const sortDeliveries = (arr) => {
  return [...new Set(arr)].sort((a, b) => parseInt(a) - parseInt(b));
};

// Chart Data Processor
function prepareChartData(data, selectedSupplier, selectedParamType) {
    const filtered = data.filter(
      (d) => d.suppliername === selectedSupplier && d.paramtype === selectedParamType
    );
  
    const deliveries = [...new Set(filtered.map((d) => d.delivery))].sort((a, b) =>
      parseInt(a) - parseInt(b)
    );
  
    const weights = [];
    const timestamps = [];
  
    deliveries.forEach((delivery) => {
      const entry = filtered.find((d) => d.delivery === delivery);
      weights.push(entry ? parseFloat(entry.weight) : null);
      timestamps.push(entry ? entry.event_timestamp : null);
    });
  
    return {
      xAxisData: deliveries,
      weights,
      timestamps,
      series: [
        {
          label: `${selectedSupplier} - ${selectedParamType}`,
          data: weights,
        },
      ],
    };
  }
  

export default function InteractiveLineChart() {
  const API_URL = "http://localhost:8000/api/supplier_performance";

  const [rawData, setRawData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error1, setError1] = useState(null);

  const [selectedSupplier, setSelectedSupplier] = useState("");
  const [selectedParamType, setSelectedParamType] = useState("");
  const [chartData, setChartData] = useState(null);
  const [error, setError] = useState("");

  // Fetch Data
  useEffect(() => {
    fetch(API_URL)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch data");
        return res.json();
      })
      .then((json) => {
        const fetchedData = json.data || [];
        setRawData(fetchedData);

        // Initialize default dropdown values
        const supplierNames = [...new Set(fetchedData.map((d) => d.suppliername))];
        const paramTypes = [...new Set(fetchedData.map((d) => d.paramtype))];
        if (supplierNames.length > 0) setSelectedSupplier(supplierNames[0]);
        if (paramTypes.length > 0) setSelectedParamType(paramTypes[0]);

        setLoading(false);
      })
      .catch((err) => {
        setError1(err.message);
        setLoading(false);
      });
  }, []); // no dependencies

  if (loading) return <CircularProgress />;
  if (error1) return <Typography color="error">Error: {error1}</Typography>;
  if (rawData.length === 0) return <Typography>No data available.</Typography>;

  const supplierNames = [...new Set(rawData.map((d) => d.suppliername))];
  const paramTypes = [...new Set(rawData.map((d) => d.paramtype))];

  const handleSubmit = () => {
    const filtered = rawData.filter(
      (d) => d.suppliername === selectedSupplier && d.paramtype === selectedParamType
    );

    if (filtered.length === 0) {
      setError("No data found for the selected supplier and parameter type.");
      setChartData(null);
    } else {
      setError("");
      setChartData(prepareChartData(rawData, selectedSupplier, selectedParamType));
    }
    console.log ()
  };

  return (
    <Box p={0}>
      <Box display="flex" gap={2} mb={2} flexWrap="wrap">
        <FormControl>
          <InputLabel>Supplier</InputLabel>
          <Select
            value={selectedSupplier}
            label="Supplier"
            onChange={(e) => setSelectedSupplier(e.target.value)}
            style={{ minWidth: 150 ,height:'40px'}}
          >
            {supplierNames.map((name) => (
              <MenuItem key={name} value={name}>
                {name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl>
          <InputLabel>Param Type</InputLabel>
          <Select
            value={selectedParamType}
            label="Param Type"
            onChange={(e) => setSelectedParamType(e.target.value)}
            style={{ minWidth: 150 ,height:'40px'}}
          >
            {paramTypes.map((type) => (
              <MenuItem key={type} value={type}>
                {type}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        
        <Button variant="contained" onClick={handleSubmit}>
          Go
        </Button>
      </Box>

      {error && (
        <Typography color="error" mb={2}>
          {error}
        </Typography>
      )}
      <Box sx={{
            border: '1px solid lightgrey',
            borderRadius: 1, // optional, for slightly rounded corners
            padding: 0,      // optional, for inner spacing
        }}>
      {chartData && (
        <LineChart
        xAxis={[{ data: chartData.xAxisData, scaleType: "point", label: "Delivery" }]}
        yAxis={[{ min: 0 }]}
        series={chartData.series}
        height={200}
        tooltip={{
          trigger: 'item',
          formatter: (params) => {
            const index = params.dataIndex;
            const delivery = chartData.xAxisData[index];
            const weight = chartData.series[0].data[index];
            const timestamp = chartData.timestamps[index];
            const formattedDate = timestamp
              ? new Date(timestamp).toLocaleString()
              : 'N/A';
      
            return `
              <strong>Delivery:</strong> ${delivery}<br/>
              <strong>Weight:</strong> ${weight}<br/>
              <strong>Timestamp:</strong> ${formattedDate}
            `;
          },
        }}
      />)}
      
    </Box>
    </Box>
  );
}
