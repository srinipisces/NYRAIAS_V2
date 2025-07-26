// src/pages/InwardSecurityPage.jsx
import React, { useRef, useState } from 'react';
import axios from 'axios';
import DynamicFormv3 from './DynamicFormv3';

export default function CrusherPerformanceTab({ onSuccess }) {
  const formRef = useRef();
  const [submitting, setSubmitting] = useState(false); // renamed to match prop

  const fields = [
    {
      name: 'inward_number',
      label: 'Inward Number',
      type: 'select',
      required: true,
      optionsFunctionName: 'inwnumforcrusheroutward',
    },
    {
      name: 'sample_from',
      label: 'Rotary',
      type: 'select',
      required: true,
      options: [
        { label: '1st Rotary', value: '1st Rotary' },
        { label: '2nd Rotary', value: '2nd Rotary' },
      ],
    },
    { name: 'grade_plus2', label: '+2', type: 'number', required: true },
    { name: 'grade_2by3', label: '2/3', type: 'number', required: true },
    { name: 'grade_3by4', label: '3/4', type: 'number', required: true },
    { name: 'grade_4by6', label: '4/6', type: 'number', required: true },
    { name: 'grade_6by10', label: '6/10', type: 'number', required: true },
    { name: 'grade_10by12', label: '10/12', type: 'number', required: true },
    { name: 'grade_12by14', label: '12/14', type: 'number', required: true },
    { name: 'grade_minus14', label: '-14', type: 'number', required: true },
    { name: 'moisture', label: 'Moisture', type: 'number', required: true },
    { name: 'dust', label: 'Dust', type: 'number' },
  ];

  const defaultValues = {
    inward_number: '',
    sample_from: '',
    grade_plus2: '',
    grade_2by3: '',
    grade_3by4: '',
    grade_4by6: '',
    grade_6by10: '',
    grade_10by12: '',
    grade_12by14: '',
    grade_minus14: '',
    moisture: '',
    dust: '',
  };

  const handleSubmit = async (data) => {
    if (submitting) return;
    setSubmitting(true);
    try {
      const payload = { ...data };

      await axios.post(
        import.meta.env.VITE_API_URL + '/api/crusherperformance',
        payload,
        { withCredentials: true }
      );

      alert(`Success!`);
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
      submitting={submitting} // ✅ correctly passed
    />
  );
}
