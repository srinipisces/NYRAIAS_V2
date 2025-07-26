// src/pages/InwardSecurityPage.jsx
import React,{useRef} from 'react';
import dayjs from 'dayjs';
import axios from 'axios';
import DynamicFormv3 from './DynamicFormv3';

export default function KilnFeedQualityFormTab({onSuccess}) {
  const formRef = useRef();
  // 1. Define your dynamic fields schema. Notice for the “supplier” select,
  //    we only pass optionsFunctionName: 'fetchSuppliers'
  const fields = [
    {
      name: 'kiln_quality_entryDateTime',
      label: 'Reported Date & Time',
      type: 'datetime',
      required: true,
    },
    {
      name: 'inward_number',
      label: 'Inward_Number',
      type: 'select',
      required: true,
      optionsFunctionName: 'kiln/inwardnumber_kilnfeedquality_select'
      
    },
    {
      name: 'bag_no',
      label: 'Bag Number',
      type: 'select',
      required: true,
      optionsFunctionName: 'kiln/inwardnumber_kilnfeedquality_bag_no_select',
      dependsOn: 'inward_number',
      getOptionsParams: (watchValues) => ({ inward_number: watchValues.inward_number }),
      
    },
    {
      name: 'g_plus_2',
      label: '+2',
      type: 'number',
      required: true,
      min:0,
      max:100
    },
    {
      name: 'g_2by3',
      label: '2/3',
      type: 'number',
      required: true,
      min:0,
      max:100
    },
    {
      name: 'g_3by6',
      label: '3/6',
      type: 'number',
      required: true,
      min:0,
      max:100
    },
    {
      name: 'g_6by8',
      label: '6/8',
      type: 'number',
      required: true,
      min:0,
      max:100
    },
    {
      name: 'g_8by10',
      label: '8/10',
      type: 'number',
      required: true,
      min:0,
      max:100
    },
    {
      name: 'g_10by12',
      label: '10/12',
      type: 'number',
      required: true,
      min:0,
      max:100
    },
    {
      name: 'g_12by14',
      label: '12/14',
      type: 'number',
      required: true,
      min:0,
      max:100
    },
    {
      name: 'g_minus_14',
      label: '-14',
      type: 'number',
      required: true,
      min:0,
      max:100
    },
    {
      name: 'feed_moisture',
      label: 'Feed Moisture',
      type: 'number',
      required: true,
      min:0,
      max:25
    },
    {
      name: 'dust',
      label: 'Dust',
      type: 'number',
      required: true,
      min:0,
      max:20
    },
    {
      name: 'feed_volatile',
      label: 'Feed Volatile',
      type: 'number',
      required: true,
      min:0,
      max:25
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
    kiln_quality_entryDateTime:dayjs(),
    inward_number: '',
    bag_no: '',
    kiln:'',
    g_plus_2:'',
    g_2by3:'',
    g_3by6:'',
    g_6by8:'',
    g_8by10:'',
    g_10by12:'',
    g_12by14:'',
    g_minus_14:'',
    feed_moisture:'',
    dust:'',
    feed_volatile:'',
    remarks:''
  };

  // 3. Handle submission
  const handleSubmit = async (data) => {
    try {
      // Format datetime before sending
      const payload = {
        ...data,
        kiln_quality_entryDateTime:dayjs(data.kiln_quality_entryDateTime).format('YYYY-MM-DD HH:mm:ss')
      };

      // Send to your server
      const response = await axios.post(
        import.meta.env.VITE_API_URL + '/api/kiln/kilnfeedquality',
        payload,
        {withCredentials:true}
      );

      // E.g. server returns { operation, inward_number, message }
      
      alert("Success!");

      // Optionally reset the form or do any post‐submit logic here
      formRef.current?.reset();
      onSuccess?.();
    } catch (err) {
      console.error(err);
      alert('Failed to submit form');
    }
  };

  return (

            <DynamicFormv3
              ref={formRef}
              fields={fields}
              defaultValues={defaultValues}
              onSubmit={handleSubmit}
            />
          
  );
}
