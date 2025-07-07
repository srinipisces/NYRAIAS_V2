// src/pages/InwardSecurityPage.jsx
import React, { useRef, useState } from 'react';
import dayjs from 'dayjs';
import axios from 'axios';
import './Forms.css';
import DynamicFormv3 from './DynamicFormv3';

export default function KilnFeedTab({ onSuccess }) {
  const formRef = useRef();
  const [submitting, setSubmitting] = useState(false);

  const fields = [
    {
      name: 'inward_number',
      label: 'Inward_Number',
      type: 'select',
      required: true,
      optionsFunctionName: 'kiln/inwardnumber_kilnfeed_select'
    },
    {
      name: 'bag_no',
      label: 'Bag No',
      type: 'select',
      required: true,
      optionsFunctionName: 'kiln/inwardnumber_kilnfeed_bag_no_select',
      dependsOn: 'inward_number',
      getOptionsParams: (watchValues) => ({ inward_number: watchValues.inward_number }),
    },
    {
      name: 'bags_loaded_for',
      label: 'Bags Loaded For',
      type: 'select',
      required: true,
      options: [
        { label: 'Kiln A', value: 'Kiln A' },
        { label: 'Kiln B', value: 'Kiln B' },
        { label: 'Kiln C', value: 'Kiln C' },
      ]
    },
  ];

  const defaultValues = {
    inward_number: '',
    bag_no: '',
    bags_loaded_for: ''
  };

  const handleSubmit = async (data) => {
    setSubmitting(true);
    try {
      const payload = { ...data };

      const response = await axios.post(
        import.meta.env.VITE_API_URL + '/api/kiln/kilnfeed',
        payload,
        { withCredentials: true }
      );

      const { inward_number, message } = response.data;
      alert(message || `Success!`);

      formRef.current?.reset();
      onSuccess?.();
    } catch (err) {
      console.error(err);
      alert('Failed to submit form');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DynamicFormv3
      ref={formRef}
      fields={fields}
      defaultValues={defaultValues}
      onSubmit={handleSubmit}
      submitting={submitting} // <-- pass submitting to disable button
    />
  );
}
