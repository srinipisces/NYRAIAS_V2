import React, {
    useState,
    useEffect,
    forwardRef,
    useImperativeHandle,
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
  
  const DynamicFormv3 = forwardRef(({ fields, defaultValues = {}, onSubmit, onValueChange }, ref) => {
    const {
      control,
      handleSubmit,
      formState: { errors },
      reset,
    } = useForm({ defaultValues });
  
    const watchValues = useWatch({ control });
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
      const init = async () => {
        for (const field of fields) {
          await loadOptions(field, watchValues);
        }
      };
      init();
    }, [fields]);
  
    useEffect(() => {
      fields.forEach((field) => {
        if (field.dependsOn && watchValues[field.dependsOn]) {
          loadOptions(field, watchValues);
        }
      });
    }, [watchValues]);
  
    return (
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <Box
          component="form"
          onSubmit={handleSubmit(onSubmit)}
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
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
              rules.pattern = {
                value: /^\d+(\.\d{1,2})?$/,
                message: `${label} must be a number (up to 2 decimals)`,
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
              <Box key={name} sx={{ display: 'flex', flexDirection: 'column' }}>
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
                      case 'number':
                        return (
                          <TextField
                            {...field}
                            label={label}
                            type={type === 'number' ? 'number' : 'text'}
                            error={!!errors[name]}
                            helperText={errors[name]?.message}
                            multiline={multiline || false}
                            minRows={minRows || (multiline ? 3 : 1)}
                            size="small"
                            sx={commonSx}
                            inputProps={type === 'number' ? { inputMode: 'decimal', pattern: '[0-9]+([.][0-9]{1,2})?' } : {}}
                          />
                        );
  
                        case 'checkbox-group':
                          return (
                            <FormControl component="fieldset"
                            error={!!errors[name]}
                            sx={{
                              width: '100%',
                              '&.MuiFormControl-root': { display: 'block' }, // override fieldset behavior
                            }}>
                              <Typography sx={{ mb: 1, fontSize: 14 }}>{label}</Typography>

                              {/* Wrapper with border */}
                              <Box
                                sx={{
                                  border: '1px solid',
                                  borderColor: 'grey.400',
                                  borderRadius: 2,
                                  p: 1.5,
                                  width: '100%',
                                }}
                              >
                                {/* Horizontal layout with spacing */}
                                <Box
                                  sx={{
                                    display: 'flex',
                                    flexWrap: 'wrap', // allows wrapping if too many
                                    gap: 2, // space between checkboxes
                                  }}
                                >
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

                              {/* Error message */}
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
  
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gridColumn: '1 / -1' }}>
            <Button
              type="submit"
              variant="contained"
              size="small"
              sx={{ height: 36, minWidth: 100, fontSize: 13 }}
            >
              Submit
            </Button>
          </Box>
        </Box>
      </LocalizationProvider>
    );
  });
  
  export default DynamicFormv3;
  