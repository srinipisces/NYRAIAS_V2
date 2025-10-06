import React, {
  useState,
  useEffect,
  forwardRef,
  useImperativeHandle,
  useRef,
} from 'react';
import { useForm, Controller, useWatch } from 'react-hook-form';
import {
  Box,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  RadioGroup,
  FormControlLabel,
  Radio,
  Checkbox,
} from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
dayjs.extend(customParseFormat);

import { fetchOptionsFromUrl } from '../api';

const DynamicFormv3 = forwardRef(({ fields, defaultValues = {}, onSubmit, onValueChange, submitting = false }, ref) => {
  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm({ defaultValues });

  const watchValues = useWatch({ control });
  const prevValuesRef = useRef({});
  const [optionsMap, setOptionsMap] = useState({});
  const [loadingMap, setLoadingMap] = useState({});

  const loadOptions = async (field, watchValues) => {
    const { name, optionsFunctionName, getOptionsParams } = field;
    if (!optionsFunctionName) return;
    setLoadingMap((prev) => ({ ...prev, [name]: true }));
    const params = getOptionsParams ? getOptionsParams(watchValues) : undefined;
    const opts = await fetchOptionsFromUrl(optionsFunctionName, params);
    setOptionsMap((prev) => ({ ...prev, [name]: opts }));
    setLoadingMap((prev) => ({ ...prev, [name]: false }));
  };

  useImperativeHandle(ref, () => ({
    resetAndRefresh: async () => {
      reset();
      for (const field of fields) {
        await loadOptions(field, watchValues);
      }
    },
    reset,
  }));

  useEffect(() => {
    fields.forEach((field) => {
      const parent = field.dependsOn;
      const parentChanged = parent && watchValues[parent] !== prevValuesRef.current[parent];

      if (parentChanged) {
        setValue(field.name, '');
        loadOptions(field, watchValues);
      } else if (!parent && field.optionsFunctionName) {
        loadOptions(field, watchValues);
      }
    });

    prevValuesRef.current = watchValues;
  }, [watchValues, fields]);

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box
        component="form"
        onSubmit={handleSubmit(onSubmit)}
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2, 1fr)',
            md: 'repeat(3, 1fr)',
          },
          gap: 2,
          width: '100%',
          maxWidth: '1000px',
        }}
      >
        {fields.map((fieldDef) => {
          const {
            name,
            label,
            type,
            required = false,
            optionsFunctionName,
            options: staticOptions = [],
            multiline,
            minRows,
            min,
            max,
            decimalPlaces,
          } = fieldDef;

          const rules = {};
          if (required) rules.required = `${label} is required`;

          if (type === 'number') {
            rules.validate = (val) => {
              if (!required && (val === '' || val === null || val === undefined)) return true;
              const parsed = parseFloat(val);
              if (isNaN(parsed)) return `${label} must be a number`;
              if (min !== undefined && parsed < min) return `${label} must be >= ${min}`;
              if (max !== undefined && parsed > max) return `${label} must be <= ${max}`;
              return true;
            };
            const decimals = decimalPlaces ?? 2;
            rules.pattern = {
              value: new RegExp(`^\\d+(\\.\\d{1,${decimals}})?$`),
              message: `${label} must be a valid number with up to ${decimals} decimal places`,
            };
          }

          const opts = optionsFunctionName ? optionsMap[name] || [] : staticOptions;
          const isLoading = loadingMap[name] || false;

          const commonSx = {
            width: '100%',
            '& .MuiInputBase-root': { fontSize: 14, height: 38 },
            '& .MuiInputLabel-root': { fontSize: 13 },
          };

          return (
            <Box
              key={name}
              sx={{
                display: 'flex',
                flexDirection: 'column',
                width: '100%',
                maxWidth: { xs: 280, sm: '100%' },
                mx: 0,
              }}
            >
              <Controller
                name={name}
                control={control}
                rules={rules}
                render={({ field }) => {
                  switch (type) {
                    case 'select':
                      return (
                        <FormControl fullWidth error={!!errors[name]} sx={commonSx}>
                          <InputLabel id={`${name}-label`}>{label}</InputLabel>
                          <Select
                            labelId={`${name}-label`}
                            label={label}
                            {...field}
                            onChange={(e) => {
                              const value = e.target.value;
                              field.onChange(value);
                              fieldDef.onChange?.(value);
                              onValueChange?.(name, value);
                            }}
                            disabled={isLoading || opts.length === 0}
                          >
                            {isLoading ? (
                              <MenuItem value="" disabled>Loading…</MenuItem>
                            ) : opts.length === 0 ? (
                              <MenuItem value="" disabled>No Data Available</MenuItem>
                            ) : (
                              [<MenuItem key="" value="" disabled>{`Select ${label}`}</MenuItem>,
                              ...opts.map((opt) => (
                                <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                              ))]
                            )}
                          </Select>
                          {errors[name] && (
                            <Typography sx={{ color: 'error.main', fontSize: 11 }}>{errors[name].message}</Typography>
                          )}
                        </FormControl>
                      );

                    case 'radio':
                      return (
                        <FormControl component="fieldset" error={!!errors[name]} sx={{ width: '100%' }}>
                          <Typography sx={{ mb: 1, fontSize: 14 }}>{label}</Typography>
                          <RadioGroup row {...field} onChange={(e) => field.onChange(e.target.value)}>
                            {opts.map((opt) => (
                              <FormControlLabel
                                key={opt.value}
                                value={opt.value}
                                control={<Radio size="small" />}
                                label={<Typography fontSize={13}>{opt.label}</Typography>}
                              />
                            ))}
                          </RadioGroup>
                          {errors[name] && (
                            <Typography sx={{ color: 'error.main', fontSize: 11 }}>{errors[name].message}</Typography>
                          )}
                        </FormControl>
                      );

                    case 'datetime':
                      const parsedDate = dayjs(field.value);
                      const isValidDate = dayjs.isDayjs(parsedDate) && parsedDate.isValid();
                      return (
                        <DateTimePicker
                          label={label}
                          {...field}
                          value={isValidDate ? parsedDate : null}
                          onChange={(val) => field.onChange(val)}
                          maxDateTime={dayjs()}
                          slotProps={{
                            textField: {
                              error: !!errors[name],
                              helperText: errors[name]?.message,
                              size: 'small',
                              sx: commonSx,
                            },
                          }}
                        />
                      );

                    case 'text':
                      return (
                        <TextField
                          {...field}
                          label={label}
                          error={!!errors[name]}
                          helperText={errors[name]?.message}
                          multiline={multiline || false}
                          minRows={minRows || (multiline ? 3 : 1)}
                          size="small"
                          sx={{
                            width: '100%',
                            '& .MuiInputBase-root': {
                              fontSize: 14,
                              alignItems: 'center',
                            },
                            '& .MuiInputLabel-root': {
                              fontSize: 13,
                            },
                            '& .MuiInputBase-input': {
                              padding: '10px 14px',
                            },
                          }}
                        />
                      );

                    case 'number':
                      const decimals = decimalPlaces ?? 2;
                      const step = (1 / Math.pow(10, decimals)).toFixed(decimals);
                      return (
                        <TextField
                          {...field}
                          label={label}
                          type="number"
                          error={!!errors[name]}
                          helperText={errors[name]?.message}
                          size="small"
                          sx={commonSx}
                          inputProps={{
                            inputMode: 'decimal',
                            pattern: `[0-9]+(\\.[0-9]{1,${decimals}})?`,
                            step,
                            ...(min !== undefined && { min }),
                            ...(max !== undefined && { max }),
                          }}
                        />
                      );

                    case 'checkbox-group':
                      return (
                        <FormControl component="fieldset" error={!!errors[name]} sx={{ width: '100%' }}>
                          <Typography sx={{ mb: 1, fontSize: 14 }}>{label}</Typography>
                          <Box sx={{ border: '1px solid', borderColor: 'grey.400', borderRadius: 2, p: 1.5 }}>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                              {opts.map((opt) => (
                                <FormControlLabel
                                  key={opt.value}
                                  control={
                                    <Checkbox
                                      size="small"
                                      checked={field.value?.includes(opt.value) || false}
                                      onChange={(e) => {
                                        const newValue = e.target.checked
                                          ? [...(field.value || []), opt.value]
                                          : (field.value || []).filter((v) => v !== opt.value);
                                        field.onChange(newValue);
                                      }}
                                    />
                                  }
                                  label={<Typography fontSize={13}>{opt.label}</Typography>}
                                  sx={{ m: 0, flex: '0 1 auto' }}
                                />
                              ))}
                            </Box>
                          </Box>
                          {errors[name] && (
                            <Typography sx={{ color: 'error.main', fontSize: 11, mt: 0.5 }}>
                              {errors[name].message}
                            </Typography>
                          )}
                        </FormControl>
                      );

                    default:
                      return null;
                  }
                }}
              />
            </Box>
          );
        })}

        <Box
          sx={{
            display: 'flex',
            justifyContent: { xs: 'flex-start', sm: 'flex-end' },
            gridColumn: '1 / -1',
          }}
        >
          <Button
            type="submit"
            variant="contained"
            size="small"
            disabled={submitting}
            sx={{
              height: 36,
              fontSize: 13,
              width: { xs: '100%', sm: 'auto' },
              minWidth: { sm: 100 },
              maxWidth: { xs: 280, sm: 'none' },
            }}
          >
            {submitting ? 'Submitting...' : 'Submit'}
          </Button>
        </Box>
      </Box>
    </LocalizationProvider>
  );
});

export default DynamicFormv3;
