// src/pages/InwardSecurityPage.jsx
import React, { useRef, useState } from 'react';
import dayjs from 'dayjs';
import axios from 'axios';
import './Forms.css';
import DynamicFormv3 from './DynamicFormv3';

export default function DeStoningQualityForm({ onSuccess }) {
  const formRef = useRef();
  const [submitting, setSubmitting] = useState(false);

  const fields = [
    {
      name: 'bag_no',
      label: 'Bag Number',
      type: 'select',
      required: true,
      optionsFunctionName: 'destoning/bag_quality'
    },
    
    {
      name: 'quality_plus_3',
      label: '+3',
      type: 'number',
      required: true,
      min :0,
      max:100
    },
    {
      name: 'quality_3by4',
      label: '3/4',
      type: 'number',
      required: true,
      min :0,
      max :100
    },
    {
      name: 'quality_4by8',
      label: '4/8',
      type: 'number',
      required: true,
      min :0,
      max :100
    },
    {
      name: 'quality_8by12',
      label: '8/12',
      type: 'number',
      required: true,
      min :0,
      max :100
    },
    {
      name: 'quality_12by30',
      label: '12/30',
      type: 'number',
      required: true,
      min :0,
      max :100
    },
    {
      name: 'quality_minus_30',
      label: '-30',
      type: 'number',
      required: true,
      min :0,
      max :100
    },
    {
      name: 'quality_cbd',
      label: 'CBD',
      type: 'number',
      required: true,
      min :0,
      max :100
    },
    {
      name: 'quality_ctc',
      label: 'CTC',
      type: 'number',
      required: true,
      min :0,
      max :100
    },
    {
      name: 'destination',
      label: 'Destination',
      type: 'select',
      required: true,
      options: [
        {label: 'Screening', value: 'Screening'},
        {label: 'InStock', value: 'InStock'}
      ]
    },
    {
      name: 'quality_remarks',
      label: 'Remarks',
      type: 'text',
      required: false
    },
  ];

  const defaultValues = {
    quality_plus_3 :'',
    quality_3by4 :'',
    quality_4by8 :'',
    quality_8by12 :'',
    quality_12by30 :'',
    quality_minus_30 :'',
    quality_cbd :'',
    quality_ctc :'',
    bag_no:'',
    destination:''
  };

  const handleSubmit = async (data) => {
    setSubmitting(true);
    try {
      const payload = { ...data };

      const response = await axios.post(
        import.meta.env.VITE_API_URL + '/api/destoning/destoningquality',
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
