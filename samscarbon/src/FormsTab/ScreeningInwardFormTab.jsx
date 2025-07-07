
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
      name: 'kiln',
      label: 'Kiln : ',
      type: 'select',
      required: true,
      options: [{label: 'Kiln A',value:'Kiln A'},
      {label: 'Kiln B',value:'Kiln B'},
      {label: 'Kiln C',value:'Kiln C'}]
    },
    {
      name: 'bag_no',
      label: 'Bag No / Drum No',
      type: 'select',
      required: true,
      optionsFunctionName: 'screening/screeninginwardbagno'
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
      {label: 'Ex Kiln',value:'Ex Kiln'},
      {label: '20x50',value:'20x50'},
      {label: '+4',value:'+4'},
      {label: '+6',value:'+6'},
      {label: '+4',value:'+4'},
      {label: '-30',value:'-30'},
    ]
    },
    {   
      name: 'ctc',
      label: 'CTC : ',
      type: 'select',
      required: true,
      options: [{label: '45-50',value:'45-50'},
      {label: '50-55',value:'50-55'},
      {label: '55-60',value:'55-60'},
      {label: '60-65',value:'60-65'},
      {label: '65-70',value:'65-70'},
      {label: '70-75',value:'70-75'},
      {label: '75-80',value:'75-80'},
      {label: 'above 80',value:'above 80'},
      {label: 'option 9',value:'option 9'},
    ]
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
    }

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
