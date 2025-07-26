
import React,{useRef,useState} from 'react';
import dayjs from 'dayjs';
import axios from 'axios';
import {
  Box
} from '../../node_modules/@mui/material';
import DynamicFormv3 from './DynamicFormv3';
export default function ScreeningOutwardFormTab({onSuccess}) {
  const formRef = useRef();
  const [submitting, setSubmitting] = useState(false);
  // 1. Define your dynamic fields schema. Notice for the “supplier” select,
  //    we only pass optionsFunctionName: 'fetchSuppliers'
  const fields = [
    {
      name: 'date_time',
      label: 'Date Time',
      type: 'datetime',
      required: true,
    },
    {   
      name: 'grade',
      label: 'Grade : ',
      type: 'select',
      required: true,
      options: [{label: '6x12',value:'6x12'},
      {label: '4x8',value:'4x8'},
      {label: '8x16',value:'8x16'},
      {label: '8x30',value:'8x30'},
      {label: '12x30',value:'12x30'},
      {label: '20x50',value:'20x50'},
      {label: '30x60',value:'30x60'},
      {label: '-30',value:'-30'},
      {label: '+4',value:'+4'},
      {label: '-60',value:'-60'},
      {label: '8x14',value:'8x14'},
      {label: '-16',value:'-16'},
    ]
    },
    {
      name: 'bag_weight',
      label: 'Bag Weight',
      type: 'number',
      required: true,
    },
    {
      name: 'machine',
      label: 'Machine : ',
      type: 'select',
      required: true,
      options: [{label: 'Gyro',value:'gyro'},
      {label: 'Shaker',value:'Shaker'}]
    },
    {
      name: 'ctc',
      label: 'CTC',
      type: 'number',
      required: true,
    },
  ];

  // 2. Optionally define initial defaultValues (React Hook Form will use these)
  const defaultValues = {
    date_time: dayjs(),
    grade:'',
    bag_weight:0,
    machine:'',
    ctc:''
  };

  // 3. Handle submission
  const handleSubmit = async (data) => {
    setSubmitting(true);
    try {
      // Format datetime before sending
      const payload = {
        ...data,
        date_time: dayjs(data.date_time).format('YYYY-MM-DD HH:mm:ss')
      };

      // Send to your server
      const response = await axios.post(
        import.meta.env.VITE_API_URL + '/api/screening/screeningoutward',
        payload,
        {withCredentials:true}
      );

      // E.g. server returns { operation, inward_number, message }
      const { bag_no, message } = response.data;
      alert(message || `Success!`);

      // Optionally reset the form or do any post‐submit logic here
      formRef.current?.reset();
      onSuccess?.()
    } catch (err) {
      console.error(err);
      alert('Failed to submit form');
    }finally {
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
