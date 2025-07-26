// src/pages/InwardSecurityPage.jsx
import React,{useRef,useState} from 'react';
import dayjs from 'dayjs';
import axios from 'axios';
import DynamicFormv3 from './DynamicFormv3';

export default function KilnOutputFormTab({onSuccess}) {
  const formRef = useRef();
  const [submitting, setSubmitting] = useState(false);
  // 1. Define your dynamic fields schema. Notice for the “supplier” select,
  //    we only pass optionsFunctionName: 'fetchSuppliers'
  const fields = [
    {
      name: 'kiln_output_entryDateTime',
      label: 'Output Date & Time',
      type: 'datetime',
      required: true,
    },
    {
      name: 'kiln',
      label: 'Kiln',
      type: 'select',
      required: true,
      options :[{ label: 'Kiln A', value: 'Kiln A' },
      { label: 'Kiln B',  value: 'Kiln B'  },
      { label: 'Kiln C',    value: 'Kiln C'    },]
      
    },
    {
      name: 'bag_weight',
      label: 'Weight with Stones',
      type: 'number',
      required: true,
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

  // 2. Optionally define initial defaultValues (React Hook Form will use these)
  const defaultValues = {
    kiln_output_entryDateTime:dayjs(),
    kiln:'',
    bag_weight:0,
    remarks:''
  };

  // 3. Handle submission
  const handleSubmit = async (data) => {
    setSubmitting(true);
    try {
      // Format datetime before sending
      const payload = {
        ...data,
        kiln_output_entryDateTime:dayjs(data.kiln_output_entryDateTime).format('YYYY-MM-DD HH:mm:ss')
      };

      // Send to your server
      const response = await axios.post(
        import.meta.env.VITE_API_URL + '/api/kiln/kilnoutput',
        payload,
        {withCredentials:true}
      );

      // E.g. server returns { operation, inward_number, message }
      const { bag_no, message } = response.data;
      alert(message || `Success! Bag number: ${bag_no}`);

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
