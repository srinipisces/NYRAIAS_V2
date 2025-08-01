// ExpressionSearchBar.jsx
import React, { useState } from 'react';
import { TextField, Box, Button, Alert, Typography } from '@mui/material';

// Fields and operators we support
const VALID_FIELDS = ['bag_no', 'grade', 'ctc'];
const VALID_OPERATORS = ['=', '!=', '>', '<', '>=', '<=', 'LIKE', 'IN'];
const TEXT_FIELDS = ['bag_no', 'grade'];
const NUMBER_FIELDS = ['ctc'];

function parseAndNormalizeExpression(input) {
  const rawFilters = [];
  const grouped = {};
  let error = null;
  let corrected = '';

  try {
    const segments = input.split(/\s+AND\s+/i);
    const correctedParts = [];

    for (let segment of segments) {
      const match = segment.match(/^(\w+)\s*(=|!=|>=|<=|>|<|LIKE|IN)\s*(.+)$/i);
      if (!match) {
        throw new Error(`Invalid expression: '${segment}'`);
      }

      let [, field, operator, rawValue] = match;
      field = field.trim();
      operator = operator.toUpperCase();

      if (!VALID_FIELDS.includes(field)) {
        throw new Error(`Unsupported field: '${field}'`);
      }
      if (!VALID_OPERATORS.includes(operator)) {
        throw new Error(`Unsupported operator: '${operator}'`);
      }

      if (operator === 'IN') {
        if (!rawValue.startsWith('(') || !rawValue.endsWith(')')) {
          throw new Error(`IN values must be in parentheses`);
        }
        let values = rawValue.slice(1, -1).split(',').map(v => v.trim());

        if (TEXT_FIELDS.includes(field)) {
          values = values.map(v => (v.startsWith("'") ? v : `'${v}'`));
        }

        const parsedValues = values.map(v => {
          if (TEXT_FIELDS.includes(field)) {
            if (!v.startsWith("'") || !v.endsWith("'")) {
              throw new Error(`Text value '${v}' must be in quotes`);
            }
            return v.slice(1, -1);
          } else if (NUMBER_FIELDS.includes(field)) {
            if (isNaN(v)) throw new Error(`Value '${v}' must be a number`);
            return Number(v);
          }
        });

        rawFilters.push({ field, operator, value: parsedValues });
        correctedParts.push(`${field} IN (${values.join(', ')})`);
      } else {
        rawValue = rawValue.trim();

        if (TEXT_FIELDS.includes(field)) {
          if (!rawValue.startsWith("'") || !rawValue.endsWith("'")) {
            rawValue = `'${rawValue}'`;
          }
        } else if (NUMBER_FIELDS.includes(field)) {
          if (rawValue.startsWith("'") || rawValue.endsWith("'")) {
            throw new Error(`Numeric value '${rawValue}' must not be in quotes`);
          }
          if (isNaN(rawValue)) throw new Error(`Invalid numeric value: '${rawValue}'`);
        }

        const parsedValue = TEXT_FIELDS.includes(field)
          ? rawValue.slice(1, -1)
          : Number(rawValue);

        if (operator === '=' && TEXT_FIELDS.includes(field)) {
          if (!grouped[field]) grouped[field] = [];
          grouped[field].push(parsedValue);
        } else {
          rawFilters.push({ field, operator, value: parsedValue });
          correctedParts.push(`${field} ${operator} ${rawValue}`);
        }
      }
    }

    for (const [field, values] of Object.entries(grouped)) {
      if (values.length === 1) {
        rawFilters.push({ field, operator: '=', value: values[0] });
        correctedParts.push(`${field} = '${values[0]}'`);
      } else {
        rawFilters.push({ field, operator: 'IN', value: values });
        const quoted = values.map(v => `'${v}'`).join(', ');
        correctedParts.push(`${field} IN (${quoted})`);
      }
    }

    corrected = correctedParts.join(' AND ');
    return { valid: true, filters: rawFilters, corrected, error: null };
  } catch (err) {
    return { valid: false, filters: [], corrected: '', error: err.message };
  }
}

export default function ExpressionSearchBar({ onSearch, onBulkUpdate, loading }) {
  const [input, setInput] = useState('');
  const [error, setError] = useState(null);
  const [corrected, setCorrected] = useState(null);

  const handleSubmit = () => {
    if (!input.trim()) {
      // Empty input resets filters
      setCorrected(null);
      setError(null);
      onSearch([]);
      return;
    }

    const result = parseAndNormalizeExpression(input);
    if (result.valid) {
      setError(null);
      setCorrected(result.corrected);
      onSearch(result.filters);
    } else {
      setCorrected(null);
      setError(result.error);
    }
  };


  const handleBulkClick = (status) => {
    const result = parseAndNormalizeExpression(input);
    if (!result.valid) {
      setError(result.error);
      setCorrected(null);
      return;
    }
    setError(null);
    onBulkUpdate(result.filters, status);
  };

  return (
    <Box mb={2}>
      <Box display="flex" gap={2} alignItems="center">
        <TextField
          fullWidth
          label="Enter filter expression (e.g. bag_no LIKE 'K%' AND grade='Grade A')"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          size="small"
          variant="outlined"
        />
        <Button variant="contained" onClick={handleSubmit} disabled={loading}>Search</Button>
      </Box>

      <Box mt={1} display="flex" gap={2}>
        <Button variant="outlined" color="secondary" onClick={() => handleBulkClick('Screening')} disabled={loading}>
          Move to Screening
        </Button>
        <Button variant="outlined" color="primary" onClick={() => handleBulkClick('Delivered')} disabled={loading}>
          Move to Delivered
        </Button>
      </Box>

      {corrected && (
        <Typography variant="body2" color="textSecondary" mt={1}>
          Interpreted as: <code>{corrected}</code>
        </Typography>
      )}
      {error && (
        <Alert severity="error" sx={{ mt: 1 }}>{error}</Alert>
      )}
    </Box>
  );
}
