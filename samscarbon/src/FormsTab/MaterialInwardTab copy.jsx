// src/components/InwardLoadForm.jsx

import React, { useEffect, useState, useRef } from 'react';
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

export default function InwardLoadForm({onSuccess}) {
  const { control, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm({
    defaultValues: {
      inward_number: '',
      bag_weight: '',
    },
  });

  const [options, setOptions] = useState([]);
  const selectedInward = watch('inward_number');

  // Fetch inward numbers
  useEffect(() => {
    const fetchInwards = async () => {
      try {
        const result = await axios.get(`${import.meta.env.VITE_API_URL}/api/materialinward/inwardnumber`,{withCredentials:true});
        setOptions(result.data);
      } catch (error) {
        console.error('Failed to fetch inward options', error);
      }
    };

    fetchInwards();
  }, []);

  const onSubmit = async (data) => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/materialinward/inwardweightsummary`, {
        params: { inward_number: data.inward_number }, withCredentials:true
      });

      const { our_weight, total_weight,bag_count } = res.data;

      const confirm = window.confirm(
        `Confirm New Bag Creation?\nNo. of Bags in system: ${bag_count}\nTotal weight of bags in system: ${total_weight}\nRecieved Weight by security: ${our_weight}\nNew bag Weight to Add: ${data.bag_weight}`
      );

      if (confirm) {
        const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/materialinward/crusherload`, data,{withCredentials:true});
        const { bag_no, message } = response.data;
        window.alert(`Success! Bag Number -  ${bag_no} created`);
        reset();
        onSuccess?.();
      }
    } catch (err) {
      console.error(err);
      window.alert('Error during submission.');
    }
  };

  const handleFinish = async () => {
    if (!selectedInward) {
      window.alert('Please select an Inward Number.');
      return;
    }

    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/materialinward/inwardweightsummary`, {
        params: { inward_number: selectedInward },
      });

      const { our_weight, total_weight, bag_count} = res.data;

      const confirm = window.confirm(
        `Finish Inward?\nNo. of Bags: ${bag_count}\nTotal weight of bags: ${total_weight}\nRecieved Weight by security: ${our_weight}\n`
      );
      
      if (confirm) {
        const remark = window.prompt('Enter remarks before completing:', '');

        if (remark === null) return;
        
        const payload = {
          inward_number : selectedInward,
          remark : remark
      }  ;
        await axios.put(`${import.meta.env.VITE_API_URL}/api/materialinwardcomplete`, payload
        );
        window.alert(`Inward ${selectedInward} marked as complete!`);
        reset();
        onSuccess?.();
        // You can optionally make an API call here to mark it complete
      }
    } catch (err) {
      console.error(err);
      window.alert('Failed to fetch summary.');
    }
  };
  
  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', mt: 2 }}>
  <form onSubmit={handleSubmit(onSubmit)}>
    <Stack spacing={2}>
      {/* Inward Number Select */}
      <Controller
        name="inward_number"
        control={control}
        rules={{ required: 'Inward number is required' }}
        render={({ field }) => (
          <FormControl fullWidth size="small" error={!!errors.inward_number}>
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
            fullWidth
          />
        )}
      />

      {/* Submit Button */}
      <Button type="submit" variant="contained" color="primary" size="small">
        Submit Load
      </Button>

      {/* Finish Inward Button */}
      <Button
        type="button"
        variant="outlined"
        color="secondary"
        size="small"
        onClick={handleFinish}
      >
        Finish Inward
      </Button>
    </Stack>
  </form>
</Box>

  );
}
