import { useState } from 'react';
import {
  Box, FormControl, InputLabel, Select, MenuItem, Typography, Button,
  Alert, Paper
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
  const [singleDate, setSingleDate] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const selectedReportConfig = reportComponentMap[selectedReport];
  const ReportComponent = selectedReportConfig?.component;
  const needsDateRange = selectedReportConfig?.needsDateRange || false;
  const needsSingleDate = selectedReportConfig?.needsSingleDate || false;

  const handleSubmit = () => {
    if (needsDateRange) {
      if (!startDate || !endDate) {
        setErrorMessage("Please select both start and end date.");
        return;
      }
      if (endDate.isBefore(startDate)) {
        setErrorMessage("End date must be on or after start date.");
        return;
      }
    }

    if (needsSingleDate && !singleDate) {
      setErrorMessage("Please select a date.");
      return;
    }

    setErrorMessage('');
    setSubmitted(true);
  };

  const renderReport = () => {
    if (!ReportComponent) return <Typography>No component available for this report.</Typography>;
    if (needsDateRange && (!submitted || !startDate || !endDate)) return null;
    if (needsSingleDate && (!submitted || !singleDate)) return null;

    return (
      <ReportComponent
        startDate={startDate}
        endDate={endDate}
        singleDate={singleDate}
        enableDateRange={needsDateRange}
        needsSingleDate={needsSingleDate}
      />
    );
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
                  setStartDate(null);
                  setEndDate(null);
                  setSingleDate(null);
                  setSubmitted(false);
                  setErrorMessage('');
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
                  onChange={(val) => {
                    setStartDate(val);
                    setSubmitted(false);
                  }}
                  slotProps={{ textField: { size: 'small' } }}
                />
                <DatePicker
                  label="End Date"
                  value={endDate}
                  onChange={(val) => {
                    setEndDate(val);
                    setSubmitted(false);
                  }}
                  slotProps={{ textField: { size: 'small' } }}
                />
              </>
            )}

            {needsSingleDate && (
              <DatePicker
                label="Date"
                value={singleDate}
                onChange={(val) => {
                  setSingleDate(val);
                  setSubmitted(false);
                }}
                slotProps={{ textField: { size: 'small' } }}
              />
            )}

            {(needsDateRange || needsSingleDate) && (
              <Button
                variant="contained"
                size="small"
                onClick={handleSubmit}
              >
                Submit
              </Button>
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
