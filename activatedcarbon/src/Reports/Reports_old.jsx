import { useState } from 'react';
import {
  Box, FormControl, InputLabel, Select, MenuItem, Typography, Button,
  Divider, Alert, Paper
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import dayjs from 'dayjs';
import { reportComponentMap } from './reportComponenetMap';

const reportOptions = Object.keys(reportComponentMap);

export default function ReportsPage() {
  const [selectedReport, setSelectedReport] = useState(reportOptions[0]);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const selectedReportConfig = reportComponentMap[selectedReport];
  const ReportComponent = selectedReportConfig?.component;
  const needsDateRange = selectedReportConfig?.needsDateRange || false;

  const handleSubmit = () => {
    setSubmitted(true);
  };

  const renderReport = () => {
    if (!ReportComponent) return <Typography>No component available for this report.</Typography>;
    if (needsDateRange && (!submitted || !startDate || !endDate)) return null;
    return <ReportComponent startDate={startDate} endDate={endDate} />;
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box sx={{ px: 3, pt: 2, width: '1000px' }}>
        <Typography variant="h5" gutterBottom>Reports</Typography>

        {errorMessage && <Alert severity="error" sx={{ mb: 2 }}>{errorMessage}</Alert>}

        <Paper elevation={3} sx={{ p: 2, mb: 2 }}>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
            <FormControl size="small" sx={{ minWidth: 250 }}>
              <InputLabel>Select Report</InputLabel>
              <Select
                value={selectedReport}
                label="Select Report"
                onChange={(e) => {
                  setSelectedReport(e.target.value);
                  setSubmitted(false);
                }}
              >
                {reportOptions.map((report, idx) => (
                  <MenuItem key={idx} value={report}>{report}</MenuItem>
                ))}
              </Select>
            </FormControl>

            {needsDateRange && (
              <>
                <DatePicker
                  label="Start Date"
                  value={startDate}
                  onChange={setStartDate}
                  slotProps={{ textField: { size: 'small' } }}
                />
                <DatePicker
                  label="End Date"
                  value={endDate}
                  onChange={setEndDate}
                  slotProps={{ textField: { size: 'small' } }}
                />
                <Button
                  variant="contained"
                  size="small"
                  onClick={handleSubmit}
                  disabled={!startDate || !endDate}
                >
                  Submit
                </Button>
              </>
            )}
          </Box>
        </Paper>

        <Paper elevation={0} sx={{ minHeight: 600 }}>
          {renderReport()}
        </Paper>
      </Box>
    </LocalizationProvider>
  );
}
