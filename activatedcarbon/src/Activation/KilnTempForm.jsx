import React, { useRef, useState } from 'react';
import dayjs from 'dayjs';
import axios from 'axios';
import DynamicFormv3 from './DynamicFormv3';


export default function KilnTempForm({ onSuccess }) {
  const formRef = useRef();
  const [submitting, setSubmitting] = useState(false);

  const fields = [
    {
      name: 'temp_entryDateTime',
      label: 'Date & Time',
      type: 'datetime',
      required: true,
    },
    {
      name: 'kiln',
      label: 'Select Kiln',
      type: 'select',
      required: true,
      options:[
        {label:'Kiln A', value:'Kiln A'},
        {label:'Kiln B', value:'Kiln B'},
        {label:'Kiln C', value:'Kiln C'}
      ],
    },
    {
      name: 't1',
      label: 'T1',
      type: 'number',
      required: true,
      min :0,
      max :999
    },
    {
      name: 't2',
      label: 'T2',
      type: 'number',
      required: true,
      min :0,
      max :999
    },
    {
      name: 't3',
      label: 'T3 Value',
      type: 'number',
      required: true,
      min :0,
      max :999
    },
    {
      name: 't4',
      label: 'T4 Value',
      type: 'number',
      required: true,
      min :0,
      max :999
    },
    {
      name: 'chamber',
      label: 'Chamber Value',
      type: 'number',
      required: true,
      min :0,
      max :999
    },
    {
      name: 'feed_rate',
      label: 'Feed Rate Value',
      type: 'number',
      required: true,
      min :0,
      max :20
    },
    {
      name: 'kiln_rpm',
      label: 'Kiln RPM Value',
      type: 'number',
      required: true,
      min :0,
      max :200
    },
    {
      name: 'main_damper_open_per',
      label: 'Main Damper %Open',
      type: 'number',
      required: true,
      min :0,
      max : 100
    },
    {
      name: 'boiler_damper_open_per',
      label: 'Boiler Damper %Open',
      type: 'number',
      required: true,
      min :0,
      max : 100
    },
    {
      name: 'steam_pressure',
      label: 'Steam Pressure in PSI',
      type: 'number',
      required: true,
      min :0,
      max : 200
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
    temp_entryDateTime:dayjs(),
    kiln:'',
    t1:'',
    t2:'',
    t3:'',
    t4:'',
    chamber:'',
    feed_rate: '',
    kiln_rpm:'',
    main_damper_open_per: '',
    boiler_damper_open_per: '',
    steam_pressure : '',
    remarks:''
  };

  const handleSubmit = async (data) => {
    setSubmitting(true);
    try {
      const payload = {
        ...data,
        temp_entryDateTime: dayjs(data.date_time).format('YYYY-MM-DD HH:mm:ss'),
      };

      const response = await axios.post(
        import.meta.env.VITE_API_URL + '/api/activation/kilntemp',
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
