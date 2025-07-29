
import React,{useRef,useState} from 'react';
import dayjs from 'dayjs';
import axios from 'axios';
import DynamicFormv3 from './DynamicFormv3';

export default function ScreeningInwardFormTab({onSuccess}) {
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
      name: 'bag_no',
      label: 'Bag No / Drum No',
      type: 'select',
      required: true,
      optionsFunctionName: 'screening/screeninginwardbagno',
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
      name: 'bag_weight',
      label: 'Bag Weight',
      type: 'number',
      required: true
    },
    {
      name: 'output_required',
      label: 'Output Required',
      type: 'checkbox-group',
      options: [
        { label: '6x12', value: '6x12' },
        { label: '4x8', value: '4x8' },
        { label: '8x16', value: '8x16' },
        { label: '8x30', value: '8x30' },
        { label: '12x20', value: '12x20' },
        { label: '20x40', value: '20x40' },
        { label: '30x60', value: '30x60' },
        { label: '12x40', value: '12x40' },
      ],
      required: true
    },
    
  ];

  // 2. Optionally define initial defaultValues (React Hook Form will use these)
  const defaultValues = {
    date_time: dayjs(),
    kiln:'',
    bag_no:'',
    grade:'',
    ctc:'',
    machine:'',
    output_required:[],
    bag_weight:''
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
        import.meta.env.VITE_API_URL + '/api/screening/ScreeningInward',
        payload,
        {withCredentials:true}
      );

      // E.g. server returns { operation, inward_number, message }
      const { inward_number, message } = response.data;
      alert(message || `Success!`);

      // Optionally reset the form or do any post‐submit logic here
      formRef.current?.reset();
      onSuccess?.();
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
