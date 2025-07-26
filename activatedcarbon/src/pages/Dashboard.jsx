import React, { useState, useEffect } from 'react';
import { Box, Grid, Typography, Paper, CircularProgress } from '../../node_modules/@mui/material';
import InteractiveLineChart from '../Components/Linechart';
import RawMaterialStock from '../Components/RawMaterialStock';
import LabTest from '../Components/LabTest';
import GCharcoalPercentChart from '../Components/gCharcoalPercentData';
import ExkilnStock from '../Components/ExkilnStock';
import GradeInStock from '../Components/GradeInStock';

const BASE_URL = import.meta.env.VITE_API_URL + '/api/dashboard';

const Dashboard = () => {
  // Section 1 (Charcoal)
  const [charcoalData, setCharcoalData] = useState(null);
  const [loadingCharcoal, setLoadingCharcoal] = useState(true);
  const [errorCharcoal, setErrorCharcoal] = useState(null);

  // Section 2 (Granulated Charcoal)
  const [gCharcoalData, setGCharcoalData] = useState(null);
  const [loadingGCharcoal, setLoadingGCharcoal] = useState(true);
  const [errorGCharcoal, setErrorGCharcoal] = useState(null);
  
  // Section 3 (Kiln stock)
  const [exkilnData, setexkilnData] = useState(null);
  const [loadingexkiln, setLoadingexkiln] = useState(true);
  const [errorexkiln, setErrorexkiln] = useState(null);

  // Section 3 (grade stock)
  const [gradeData, setgradeData] = useState(null);
  const [loadinggrade, setLoadinggrade] = useState(true);
  const [errorgrade, setErrorgrade] = useState(null);

  // Fetch Charcoal
  useEffect(() => {
    fetch(`${BASE_URL}/rawmaterial`, {
      method: 'GET',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' }
    })
      .then(res => res.json())
      .then(json => {
        setCharcoalData(json.data);
        setLoadingCharcoal(false);
      })
      .catch(err => {
        setErrorCharcoal(err.message);
        setLoadingCharcoal(false);
      });
  }, []);

  // Fetch GCharcoal
  useEffect(() => {
    fetch(`${BASE_URL}/gcharcoal`, {
      method: 'GET',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' }
    })
      .then(res => res.json())
      .then(json => {
        setGCharcoalData(json.data);
        setLoadingGCharcoal(false);
      })
      .catch(err => {
        setErrorGCharcoal(err.message);
        setLoadingGCharcoal(false);
      });
  }, []);

   // Fetch Kiln Output
  useEffect(() => {
    fetch(`${BASE_URL}/kilnstock`, {
      method: 'GET',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' }
    })
      .then(res => res.json())
      .then(json => {
        setexkilnData(json.data);
        setLoadingexkiln(false);
      })
      .catch(err => {
        setErrorexkiln(err.message);
        setLoadingexkiln(false);
      });
  }, []);

   // Fetch grade Output
  useEffect(() => {
    fetch(`${BASE_URL}/gradeinstock`, {
      method: 'GET',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' }
    })
      .then(res => res.json())
      .then(json => {
        setgradeData(json.data);
        setLoadinggrade(false);
      })
      .catch(err => {
        setErrorgrade(err.message);
        setLoadinggrade(false);
      });
  }, []);

  // Reusable card renderer
  const renderChartCard = (Component, label, props = {}) => (
    <Paper
      elevation={2}
      sx={{
        width: '450px',
        height: '300px',
        p: 1.5,
        borderRadius: 2,
        backgroundColor: (theme) => theme.palette.grey[100],
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'flex-start',
      }}
    >
      <Typography variant="caption" sx={{ mt: 1, fontSize: 15 }}>
        {label}
      </Typography>
      <Component {...props} />
    </Paper>
  );

  const section = (title, components, loading, error) => (
    <Box sx={{ mb: 5 }}>
      <Typography variant="h6" sx={{ mb: 2, borderBottom: '1px solid #ccc' }}>
        {title}
      </Typography>
      {loading ? (
        <CircularProgress size={24} sx={{ ml: 2 }} />
      ) : error ? (
        <Typography color="error">{error}</Typography>
      ) : (
        <Grid container spacing={2}>
          {components.map(([Component, label, props = {}], idx) => (
            <Grid item key={idx}>
              {renderChartCard(Component, label, props)}
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );

  return (
    <Box sx={{ p: 3 }}>
      {section(
        `Charcoal In-Stock: ${charcoalData?.Charcoal_stock ?? '...'} kg`,
        charcoalData
          ? [
              [RawMaterialStock, 'Charcoal in stock', {
                data: charcoalData?.Charcoal_chartData,
                keys: charcoalData?.Charcoal_chart_keys,
              }],
              [LabTest, 'Lab Test Results For Inward Stock', {
                data: charcoalData?.labTestData,
              }],
            ]
          : [],
        loadingCharcoal,
        errorCharcoal
      )}

      {section(
        `Granulated Charcoal In-Stock: ${gCharcoalData?.GCharcoal_stock ?? '...'} kg`,
        gCharcoalData
          ? [
              [RawMaterialStock, 'Granulated Charcoal in stock', {
                data: gCharcoalData?.GCharcoal_chartData,
                keys: gCharcoalData?.GCharcoal_chart_keys,
              }],
              [GCharcoalPercentChart,'Split of charcoal,stone & unburnt',
                {data:gCharcoalData?.GCharcoal_percent_stacked} ]

            ]
          : [],
        loadingGCharcoal,
        errorGCharcoal
      )}
      {section(
        `Exkiln In-Stock: ${exkilnData?.exkiln_stock ?? '...'} kg`,
        exkilnData
          ? [
              [ExkilnStock, 'Exkiln in-stock', {
                data: exkilnData?.exkiln_chartData,
              }],
              
            ]
          : [],
        loadingexkiln,
        errorexkiln
      )}
      {section(
        `Grade In-Stock: ${gradeData?.grade_stock ?? '...'} kg`,
        exkilnData
          ? [
              [GradeInStock, 'In-Stock per Grade', {
                data: gradeData?.grade_chartData,
              }],
              
            ]
          : [],
        loadinggrade,
        errorgrade
      )}
    </Box>
  );
};

export default Dashboard;
