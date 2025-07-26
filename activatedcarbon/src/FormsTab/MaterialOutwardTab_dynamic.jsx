import React, { useRef, useState } from 'react';
import { Box, Button } from '@mui/material';
import axios from 'axios';
import DynamicFormv3 from './DynamicFormv3';

export default function MaterialOutwardTab({ onSuccess }) {
  const formRef = useRef();
  const [submitting, setSubmitting] = useState(false);
  const [finishing, setFinishing] = useState(false);
  const [formValues, setFormValues] = useState({});

  // ✅ Define fields as required by DynamicFormv3
  const fields = [
    {
      name: 'inward_number',
      label: 'Inward Number',
      type: 'select',
      required: true,
      optionsFunctionName: 'materialoutward/inwardnumber_outward_select',
    },
    {
      name: 'outward_grade',
      label: 'Select Grade',
      type: 'select',
      required: true,
      options: [
        { label: '-20  1st Stage - Rotary A', value: '-20  1st Stage - Rotary A' },
        { label: 'Grade 1st stage - Rotary A', value: 'Grade 1st stage - Rotary A' },
        { label: '-20 2nd Stage - Rotary B', value: '-20 2nd Stage - Rotary B' },
        { label: 'Grade 2nd stage - Rotary B', value: 'Grade 2nd stage - Rotary B' },
        { label: 'Stones', value: 'Stones' },
        { label: 'Unburnt', value: 'Unburnt' },
      ],
    },
    {
      name: 'bag_weight',
      label: 'Weight',
      type: 'number',
      required: true,
      validate: (value) => parseFloat(value) > 0 || 'Weight must be > 0',
    },
  ];

  const handleSubmit = async (data) => {
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
        formRef.current?.resetForm();
        onSuccess?.();
      }
    } catch (err) {
      console.error(err);
      window.alert('Error during submission.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleValueChange = (values) => {
    setFormValues(values);
  };

  const handleFinish = async () => {
    const inward_number = formValues.inward_number;
    if (!inward_number) {
      window.alert('Please select an Inward Number.');
      return;
    }

    setFinishing(true);
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/materialoutward/outwardweightsummary`, {
        params: { inward_number },
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
          inward_number,
          remark,
        };

        await axios.put(`${import.meta.env.VITE_API_URL}/api/materialoutward/materialoutwardcomplete`, payload, { withCredentials: true });
        window.alert(`Inward ${inward_number} marked as complete!`);
        formRef.current?.resetForm();
        onSuccess?.();
      }
    } catch (err) {
      console.error(err);
      window.alert('Failed to finish.');
    } finally {
      setFinishing(false);
    }
  };

  return (
    <Box sx={{ mt: 2, ml: { xs: 2, sm: 'auto' }, mr: { xs: 2, sm: 'auto' }, maxWidth: 800 }}>
      <DynamicFormv3
        ref={formRef}
        fields={fields}
        onSubmit={handleSubmit}
        onValueChange={handleValueChange}
        submitting={submitting}
      />

      <Button
        variant="outlined"
        size="small"
        color="secondary"
        sx={{ mt: 2, width: 180 }}
        onClick={handleFinish}
        disabled={finishing}
      >
        Finish Outward
      </Button>
    </Box>
  );
}
