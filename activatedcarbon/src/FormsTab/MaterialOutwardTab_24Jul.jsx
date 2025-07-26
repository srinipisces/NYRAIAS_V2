import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Typography,
  Stack,
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import axios from 'axios';

export default function MaterialOutwardTab({ onSuccess }) {
  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      inward_number: '',
      outward_grade: '',
      bag_weight: '',
    },
  });

  const [options, setOptions] = useState([]);
  const selectedInward = watch('inward_number');
  const [submitting, setSubmitting] = useState(false);
  const [finishing, setFinishing] = useState(false);

  const gradeOptions = [
    { label: '-20  1st Stage - Rotary A', value: '-20  1st Stage - Rotary A' },
    { label: 'Grade 1st stage - Rotary A', value: 'Grade 1st stage - Rotary A' },
    { label: '-20 2nd Stage - Rotary B', value: '-20 2nd Stage - Rotary B' },
    { label: 'Grade 2nd stage - Rotary B', value: 'Grade 2nd stage - Rotary B' },
    { label: 'Stones', value: 'Stones' },
    { label: 'Unburnt', value: 'Unburnt' },
  ];

  useEffect(() => {
    const fetchInwards = async () => {
      try {
        const result = await axios.get(`${import.meta.env.VITE_API_URL}/api/materialoutward/inwardnumber_outward_select`, { withCredentials: true });
        setOptions(result.data);
      } catch (error) {
        console.error('Failed to fetch inward options', error);
      }
    };

    fetchInwards();
  }, []);

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/materialoutward/outwardweightsummary`, {
        params: { inward_number: data.inward_number },
        withCredentials: true,
      });

      const { our_weight, total_weight, bag_count } = res.data;

      const confirm = window.confirm(
        `Confirm New Bag Creation?\nNo. of Bags in system: ${bag_count}\nTotal weight of bags in system: ${total_weight}\nRecieved Weight by security: ${our_weight}\nNew bag Weight to Add: ${data.bag_weight}`
      );

      if (confirm) {
        const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/materialoutward/crusheroutput`, data, { withCredentials: true });
        const { bag_no } = response.data;
        window.alert(`Success! Bag Number - ${bag_no} created`);
        reset();
        onSuccess?.();
      }
    } catch (err) {
      console.error(err);
      window.alert('Error during submission.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleFinish = async () => {
    if (!selectedInward) {
      window.alert('Please select an Inward Number.');
      return;
    }

    setFinishing(true);
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/materialoutward/outwardweightsummary`, {
        params: { inward_number: selectedInward },
        withCredentials: true,
      });

      const { our_weight, total_weight, bag_count } = res.data;

      const confirm = window.confirm(
        `Finish Inward?\nNo. of Bags: ${bag_count}\nTotal weight of bags: ${total_weight}\nRecieved Weight by security: ${our_weight}`
      );

      if (confirm) {
        const remark = window.prompt('Enter remarks before completing:', '');
        if (remark === null) return;

        const payload = {
          inward_number: selectedInward,
          remark: remark,
        };

        await axios.put(`${import.meta.env.VITE_API_URL}/api/materialoutward/materialoutwardcomplete`, payload, { withCredentials: true });
        window.alert(`Inward ${selectedInward} marked as complete!`);
        reset();
        onSuccess?.();
      }
    } catch (err) {
      console.error(err);
      window.alert('Failed to fetch summary.');
    } finally {
      setFinishing(false);
    }
  };

  // ✅ DynamicFormv3-matching field style
  const fieldSx = {
    width: 180,
    fontSize: '0.8rem',
    '& .MuiInputBase-input': {
      padding: '6px 10px',
      fontSize: '0.8rem',
    },
    '& .MuiInputLabel-root': {
      fontSize: '0.8rem',
    },
    '& .MuiSelect-select': {
      padding: '6px 10px',
    },
  };

  const buttonSx = {
    width: 180,
    fontSize: '0.75rem',
    py: 0.5,
  };

  return (
    <Box
      sx={{
        width: '100%',
        maxWidth: 800,
        mt: 2,
        ml: { xs: 2, sm: 'auto' },
        mr: { xs: 2, sm: 'auto' },
      }}
    >
      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack
          direction="row"
          spacing={1.5}
          useFlexGap
          flexWrap="wrap"
          justifyContent="flex-start"
          alignItems="flex-start"
        >
          {/* Inward Number */}
          <Controller
            name="inward_number"
            control={control}
            rules={{ required: 'Inward number is required' }}
            render={({ field }) => (
              <FormControl sx={fieldSx} size="small" error={!!errors.inward_number}>
                <InputLabel>Inward Number</InputLabel>
                <Select {...field} label="Inward Number">
                  <MenuItem value="">
                    <em>Select Inward</em>
                  </MenuItem>
                  {options.map((opt) => (
                    <MenuItem key={opt} value={opt}>
                      {opt}
                    </MenuItem>
                  ))}
                </Select>
                {errors.inward_number && (
                  <Typography variant="caption" color="error">
                    {errors.inward_number.message}
                  </Typography>
                )}
              </FormControl>
            )}
          />

          {/* Outward Grade */}
          <Controller
            name="outward_grade"
            control={control}
            rules={{ required: 'Grade selection is required' }}
            render={({ field }) => (
              <FormControl sx={fieldSx} size="small" error={!!errors.outward_grade}>
                <InputLabel>Select Grade</InputLabel>
                <Select {...field} label="Select Grade">
                  <MenuItem value="">
                    <em>Select Grade</em>
                  </MenuItem>
                  {gradeOptions.map((opt) => (
                    <MenuItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </MenuItem>
                  ))}
                </Select>
                {errors.outward_grade && (
                  <Typography variant="caption" color="error">
                    {errors.outward_grade.message}
                  </Typography>
                )}
              </FormControl>
            )}
          />

          {/* Weight Input */}
          <Controller
            name="bag_weight"
            control={control}
            rules={{
              required: 'Weight is required',
              validate: (value) => parseFloat(value) > 0 || 'Weight must be > 0',
            }}
            render={({ field }) => (
              <TextField
                {...field}
                type="number"
                size="small"
                label="Weight"
                error={!!errors.bag_weight}
                helperText={errors.bag_weight?.message}
                inputProps={{ min: 0, step: 0.01 }}
                sx={fieldSx}
              />
            )}
          />

          {/* Submit Button */}
          <Button
            type="submit"
            variant="contained"
            color="primary"
            size="small"
            sx={buttonSx}
            disabled={submitting}
          >
            Submit Load
          </Button>

          {/* Finish Button */}
          <Button
            type="button"
            variant="outlined"
            color="secondary"
            size="small"
            sx={buttonSx}
            onClick={handleFinish}
            disabled={finishing}
          >
            Finish Outward
          </Button>
        </Stack>
      </form>
    </Box>
  );
}
