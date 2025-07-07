import React, { useRef, useContext, useState } from 'react';
import dayjs from 'dayjs';
import axios from 'axios';
import './Forms.css';
import DynamicFormv3 from './DynamicFormv3';
import { AuthContext } from '../AuthContext';

export default function From_Security({ onSuccess }) {
  const { userid } = useContext(AuthContext);
  const formRef = useRef();
  const [submitting, setSubmitting] = useState(false);

  const fields = [
    {
      name: 'rawmaterial_entryDateTime',
      label: 'Inward Date & Time',
      type: 'datetime',
      required: true,
    },
    {
      name: 'supplier',
      label: 'Select a supplier ',
      type: 'select',
      required: true,
      optionsFunctionName: 'suppliers/listnames',
    },
    {
      name: 'supplier_dc_number',
      label: 'Supplier DC Number',
      type: 'text',
      required: true,
    },
    {
      name: 'supplier_weight',
      label: 'Supplier Weight',
      type: 'number',
      required: true,
    },
    {
      name: 'supplier_value',
      label: 'Supplier Value',
      type: 'number',
      required: false,
    },
    {
      name: 'our_weight',
      label: 'Our Weight',
      type: 'number',
      required: true,
    },
  ];

  const defaultValues = {
    rawmaterial_entryDateTime: dayjs(),
    supplier: '',
    supplier_dc_number: '',
    supplier_weight: 0,
    our_weight: 0,
    supplier_value: '',
  };

  const handleSubmit = async (data) => {
    setSubmitting(true); // 👈 prevent multiple presses
    try {
      const payload = {
        ...data,
        rawmaterial_entryDateTime: dayjs(data.rawmaterial_entryDateTime).format('YYYY-MM-DD HH:mm:ss'),
        userid,
        deleted: false,
        // remarks will now be handled by backend as activities
      };

      const response = await axios.post(
        import.meta.env.VITE_API_URL + '/api/materialatgate',
        payload,
        { withCredentials: true }
      );

      const { inward_number, message } = response.data;
      alert(message || `Success! Inward Number ${inward_number} created`);
      formRef.current?.reset();
      onSuccess?.();
    } catch (err) {
      console.error('Error while submit:', err.response?.data || err.message);
      alert('Failed to load data: ' + (err.response?.data?.error || err.message));
    } finally {
      setSubmitting(false); // ✅ re-enable button
    }
  };

  return (
    <DynamicFormv3
      ref={formRef}
      fields={fields}
      defaultValues={defaultValues}
      onSubmit={handleSubmit}
      submitting={submitting} // 👈 pass to form
    />
  );
}
