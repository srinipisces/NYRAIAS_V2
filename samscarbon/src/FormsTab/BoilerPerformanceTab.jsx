// src/pages/InwardSecurityPage.jsx
import React,{useRef,useState} from 'react';
import dayjs from 'dayjs';
import axios from 'axios';
import DynamicFormv3 from './DynamicFormv3';

export default function BoilerPerformanceTab({onSuccess}) {
  const formRef = useRef();
  const [submitting, setSubmitting] = useState(false);
  // 1. Define your dynamic fields schema. Notice for the “supplier” select,
  //    we only pass optionsFunctionName: 'fetchSuppliers'
  const fields = [
    {
      name: 'boiler_perf_entryDateTime',
      label: 'Date & Time',
      type: 'datetime',
      required: true,
    },
    {
      name: 'boiler_number',
      label: 'Boiler Number',
      type: 'select',
      required: true,
      options :[{ label: 'Boiler No 1', value: 'Boiler No 1' },
      { label: 'Boiler No 2',  value: 'Boiler No 2'  }
      ]
      
    },
    {
      name: 'boiler_pressure',
      label: 'Boiler Pressure in Kgs/cm2',
      type: 'number',
      required: true,
    },
    {
      name: 'boiler_inlet_temperature',
      label: 'Boiler Inlet Temperature in Deg C',
      type: 'number',
      required: true,
    },
    {
      name: 'boiler_outlet_temperature',
      label: 'Boiler Outlet Temperature in Deg C',
      type: 'number',
      required: true,
    },
    {
      name: 'feed_pump',
      label: 'Feed Pump',
      type: 'select',
      required: true,
      options :[{ label: 'Feed Pump 1', value: 'Feed Pump 1' },
      { label: 'Feed Pump 2',  value: 'Feed Pump 2'  }
      ]
      
    },
    {
      name: 'blower_open',
      label: 'Blow Down Open for Mins',
      type: 'number',
      required: true,
    },
    {
      name: 'fan_damper_open',
      label: 'ID Fan Damper Open %',
      type: 'number',
      required: true,
    },
    {
      name: 'vfd_rpm',
      label: 'VFD RPM',
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
    boiler_perf_entryDateTime:dayjs(),
    boiler_number:'',
    boiler_pressure:'',
    boiler_inlet_temperature:'',
    boiler_outlet_temperature:'',
    feed_pump:'',
    blower_open:'',
    fan_damper_open:'',
    vfd_rpm:'',
    remarks:''
  };

  // 3. Handle submission
  const handleSubmit = async (data) => {
    try {
      setSubmitting(true);
      // Format datetime before sending
      const payload = {
        ...data,
        boiler_perf_entryDateTime:dayjs(data.boiler_perf_entryDateTime).format('YYYY-MM-DD HH:mm:ss')
      };

      // Send to your server
      const response = await axios.post(
        import.meta.env.VITE_API_URL + '/api/boilerperformance',
        payload,
        {withCredentials:true}
      );

      // E.g. server returns { operation, inward_number, message }
      
      alert(`Success!`);

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
