
import React,{useRef,useState} from 'react';
import dayjs from 'dayjs';
import axios from 'axios';
import DynamicFormv3 from './DynamicFormv3';

export default function DeStoningFormTab({onSuccess}) {
  const formRef = useRef();
  const [submitting, setSubmitting] = useState(false);
  // 1. Define your dynamic fields schema. Notice for the “supplier” select,
  //    we only pass optionsFunctionName: 'fetchSuppliers'
  const fields = [
    
    {
      name: 'bag_no',
      label: 'Kiln Output Bag No',
      type: 'select',
      required: true,
      optionsFunctionName: 'kiln/destoningbagno',
    },

    {
      name: 'exkiln_stock',
      label: 'Select status : ',
      type: 'select',
      required: true,
      options: [{label: 'Screening',value:'Screening'},
      {label: 'De-Stoning',value:'De-Stoning'}]
    },
    {
      name: 'bag_weight',
      label: 'Bag Weight',
      type: 'number',
      required: true,
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
    bag_no:'',
    exkiln_stock:'',
    weight:''  
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
        import.meta.env.VITE_API_URL + '/api/kiln/destoning_in',
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
