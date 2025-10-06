// InwardBagLabeler.jsx
import * as React from 'react';
import {
  Box, Paper, Typography, Divider, TextField, IconButton, Tooltip,
  FormControl, InputLabel, Select, MenuItem, CircularProgress
} from '@mui/material';
import LocalOfferOutlinedIcon from '@mui/icons-material/LocalOfferOutlined';
import LocalPrintshopOutlinedIcon from '@mui/icons-material/LocalPrintshopOutlined';

const TEXT_SX = { fontSize: 13, fontWeight: 600 };

// Build api base from env (can be overridden by prop)
function useApiBase(override) {
  const envBase = (import.meta?.env?.VITE_API_URL || '').trim();
  const base = (override || envBase || '').replace(/\/+$/, ''); // strip trailing slash
  return base;
}

// ---- Fetch from your backend route -----------------------------------
async function fetchInwards(apiBase) {
  const url = `${apiBase}/api/materialinward/inwardnumber`;
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    // credentials: 'include', // uncomment if your API needs cookies
  });
  if (!res.ok) throw new Error((await res.text().catch(() => '')) || `HTTP ${res.status}`);
  // Expect: [{ inward_no, weight, bags: [{ bag_no, weight }] }]
  return res.json();
}
// ----------------------------------------------------------------------

export default function InwardBagLabeler({ apiBase: apiBaseOverride }) {
  const apiBase = useApiBase(apiBaseOverride);

  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');
  const [inwards, setInwards] = React.useState([]);
  const [selectedIndex, setSelectedIndex] = React.useState(0);
  const [bagWeightInput, setBagWeightInput] = React.useState('');

  React.useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        const data = await fetchInwards(apiBase);
        if (!alive) return;
        setInwards(Array.isArray(data) ? data : []);
        setSelectedIndex(0);
        setError('');
      } catch (e) {
        const msg = e?.message || 'Failed to load inwards';
        setError(msg);
        alert(msg); // mobile-friendly error surfacing
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [apiBase]);

  const hasInwards = inwards.length > 0;
  const selected = hasInwards ? inwards[Math.min(selectedIndex, inwards.length - 1)] : null;

  const totalBagged = (selected?.bags || []).reduce((s, b) => s + (Number(b.weight) || 0), 0);
  const wNum = Number(selected?.weight || 0);
  const deltaNum = Number((wNum - totalBagged).toFixed(2));

  const panelH = { xs: 'auto', md: 'calc(100vh - 220px)' };

  const handleCreateLabel = () => {
    // TODO: wire POST /bags (next step)
    alert('Hook up Create Label API next');
  };

  const handlePrint = (bag) => {
    // TODO: wire GET /bags/:bagId/label (next step)
    alert(`Hook up Print for ${bag.bag_no || bag.label}`);
  };

  if (loading) {
    return (
      <Paper sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <CircularProgress size={18} />
        <Typography sx={TEXT_SX}>Loading inwards…</Typography>
      </Paper>
    );
  }

  if (error && !hasInwards) {
    return (
      <Paper sx={{ p: 2 }}>
        <Typography sx={{ ...TEXT_SX, color: 'error.main' }}>{error}</Typography>
      </Paper>
    );
  }

  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 2, md: 3 },
        bgcolor: '#f6f8fa',
        height: panelH,
        borderRadius: 2,
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        overflow: 'hidden', // keep header fixed; list scrolls
      }}
    >
      {/* Inward dropdown */}
      <Box>
        <Typography sx={TEXT_SX}>Inward</Typography>
        <FormControl size="small" sx={{ mt: 1, width: 260 }}>
          <InputLabel sx={TEXT_SX}>Select Inward</InputLabel>
          <Select
            value={hasInwards ? selectedIndex : ''}
            label="Select Inward"
            onChange={(e) => setSelectedIndex(Number(e.target.value))}
            sx={TEXT_SX}
            disabled={!hasInwards}
            displayEmpty
            renderValue={(v) => {
              if (!hasInwards) return 'No inwards available';
              return inwards[v]?.inward_no ?? '';
            }}
          >
            {hasInwards ? (
              inwards.map((row, i) => (
                <MenuItem key={row.inward_no} value={i} sx={TEXT_SX}>
                  {row.inward_no}
                </MenuItem>
              ))
            ) : (
              <MenuItem value="" disabled sx={TEXT_SX}>
                No inwards available
              </MenuItem>
            )}
          </Select>
        </FormControl>
      </Box>

      {/* Stats: W · Σ · ∆ (∆ red when ≤ 0) */}
      <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', alignItems: 'center' }}>
        <StatTiny label="W" value={`${wNum} kg`} />
        <StatTiny label="Σ" value={`${totalBagged} kg`} />
        <StatTiny label="∆" value={`${deltaNum} kg`} emphasize danger={deltaNum <= 0} />
      </Box>

      {/* Weight input + Create (disabled if no inwards) */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0.5, sm: 1 }, flexWrap: 'nowrap', minWidth: 0 }}>
        <TextField
          size="small"
          type="number"
          label="Weight"
          value={bagWeightInput}
          onChange={(e) => setBagWeightInput(e.target.value)}
          inputProps={{ min: 0, step: '0.01', inputMode: 'decimal' }}
          sx={{
            width: { xs: 100, sm: 140 },
            // iOS: avoid zoom on focus (>=16px on xs)
            '& .MuiInputBase-input': { fontSize: { xs: 16, sm: 13 }, fontWeight: 600 },
            '& .MuiInputLabel-root': { fontSize: { xs: 16, sm: 13 }, fontWeight: 600 },
          }}
          disabled={!hasInwards}
        />
        <Tooltip title={hasInwards ? 'Create label' : 'No inwards'}>
          <span>
            <IconButton
              size="small"
              color="primary"
              onClick={handleCreateLabel}
              disabled={!hasInwards || !bagWeightInput || Number(bagWeightInput) <= 0}
              sx={{
                borderRadius: 3,
                border: '1px solid',
                borderColor: 'primary.main',
                p: { xs: 0.5, sm: 1 },
                flexShrink: 0,
              }}
            >
              <LocalOfferOutlinedIcon fontSize="small" />
            </IconButton>
          </span>
        </Tooltip>
      </Box>

      <Divider />

      {/* Header above the list */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 1 }}>
        <Typography sx={TEXT_SX}>
          Labeled Bags ({selected?.bags?.length || 0})
        </Typography>
      </Box>

      <Divider sx={{ my: 1 }} />

      {/* Scrollable bag list */}
      {/* Scrollable bag list */}
      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          overflowY: 'auto',
          display: 'grid',
          gap: 1,
          pr: 0.5,
          alignContent: 'start',
          gridAutoRows: 'min-content',
        }}
      >
        {hasInwards && (selected?.bags?.length > 0) ? (
          selected.bags.map((b, idx) => (
            <Paper
              key={`${selected.inward_no}::${b.bag_no ?? idx}`}
              sx={{ p: 1, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
                <Box sx={{ minWidth: 0 }}>
                  <Typography sx={{ ...TEXT_SX, fontWeight: 700, mb: 0.5, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {b.bag_no || b.label || 'Bag'}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
                    <ChipLike>{Number(b.weight).toFixed(1)} kg</ChipLike>
                  </Box>
                </Box>
                <Tooltip title="Print">
                  <span>
                    <IconButton
                      size="small"
                      onClick={() => handlePrint(b)}
                      sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 9999 }}
                    >
                      <LocalPrintshopOutlinedIcon fontSize="small" />
                    </IconButton>
                  </span>
                </Tooltip>
              </Box>
            </Paper>
          ))
        ) : hasInwards ? (
          // Inward with no bags → show nothing (or a tiny hint)
          <Typography color="text.secondary" sx={TEXT_SX}>
            No labeled bags yet.
          </Typography>
        ) : (
          <Typography color="text.secondary" sx={TEXT_SX}>
            No inwards available.
          </Typography>
        )}
      </Box>

    </Paper>
  );
}

/* ---------- tiny helpers ---------- */

function StatTiny({ label, value, emphasize = false, danger = false }) {
  return (
    <Box sx={{ display: 'inline-flex', alignItems: 'baseline', gap: 0.75 }}>
      <Typography sx={{ ...TEXT_SX, color: 'text.secondary' }}>{label}:</Typography>
      <Typography
        sx={{
          ...TEXT_SX,
          fontWeight: emphasize ? 800 : 600,
          color: danger ? 'error.main' : 'text.primary',
        }}
      >
        {value}
      </Typography>
    </Box>
  );
}

function ChipLike({ children }) {
  return (
    <Box
      sx={{
        px: 1.2, py: 0.5,
        borderRadius: 9999,
        border: '1px solid',
        borderColor: 'divider',
        display: 'inline-flex',
        alignItems: 'center',
        ...TEXT_SX,
        lineHeight: 1.2,
        whiteSpace: 'nowrap',
      }}
    >
      {children}
    </Box>
  );
}
