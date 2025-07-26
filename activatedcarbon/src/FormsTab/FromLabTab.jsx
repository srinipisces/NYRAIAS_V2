import React, { useRef, useState } from 'react';
import dayjs from 'dayjs';
import axios from 'axios';
import DynamicFormv3 from './DynamicFormv3';


export default function FromLabTab({ onSuccess }) {
  const formRef = useRef();
  const [submitting, setSubmitting] = useState(false);

  const fields = [
    {
      name: 'inward_number',
      label: 'Inward Number',
      type: 'select',
      required: true,
      optionsFunctionName: 'lab/inwardlabque',
    },
    {
      name: 'moisture',
      label: 'Moisture',
      type: 'number',
      required: true,
    },
    {
      name: 'dust',
      label: 'Dust',
      type: 'number',
      required: true,
    },
    {
      name: 'ad_value',
      label: 'AD Value',
      type: 'number',
      required: true,
    },
    {
      name: 'admit_load',
      label: 'Admit Load',
      type: 'select',
      required: true,
      options :[
        {label: 'Approve', value: 'Approve'},
        {label: 'Deny', value: 'Deny'}
      ]
    },
    {
      name: 'remarks',
      label: 'Remarks',
      type: 'text',
      multiline:true,
      minRows:4,
      required: false,
    },
  ];

  const defaultValues = {
    inward_number: '',
    moisture: 0,
    dust: 0,
    ad_value: 0,
    admit_load : '',
    remarks:''
  };

  const handleSubmit = async (data) => {
    setSubmitting(true);
    try {
      const payload = {
        ...data,
        rawmaterial_entryDateTime: dayjs(data.date_time).format('YYYY-MM-DD HH:mm:ss'),
      };

      const response = await axios.post(
        import.meta.env.VITE_API_URL + '/api/lab/inwardlabtest',
        payload,
        {
          withCredentials: true,
        }
      );

      const { inward_number, message } = response.data;
      alert(message || 'Success!');

      formRef.current?.resetAndRefresh();
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
      submitting={submitting}
    />
  );
}
