// InwardBagLabeler.jsx
import * as React from 'react';
import {
  Box, Paper, Typography, List, ListItemButton, ListItemText,
  Divider, TextField, IconButton, Tooltip
} from '@mui/material';
import LocalOfferOutlinedIcon from '@mui/icons-material/LocalOfferOutlined';
import LocalPrintshopOutlinedIcon from '@mui/icons-material/LocalPrintshopOutlined';

const TEXT_SX = { fontSize: 13, fontWeight: 600 };

// Adjust widths (laptop/desktop)
const LEFT_W  = 150; // Inwards
const MID_W   = 300; // Details
const RIGHT_W = 300; // Labels (min width; can grow)

// Helpers
function formatDDMMYY(d = new Date()) {
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yy = String(d.getFullYear()).slice(-2);
  return `${dd}${mm}${yy}`;
}
function nextRunNumber(n) {
  return String(n + 1).padStart(3, '0');
}

// Dummy data
const seedInwards = [
  { inward_no: 'I-1001', weight: 1000, bags: [] },
  { inward_no: 'I-1002', weight: 850,  bags: [] },
  { inward_no: 'I-1003', weight: 920,  bags: [] },
  { inward_no: 'I-1004', weight: 780,  bags: [] },
  { inward_no: 'I-1005', weight: 640,  bags: [] },
];

export default function InwardBagLabeler() {
  const [inwards, setInwards] = React.useState(seedInwards);
  const [selectedIndex, setSelectedIndex] = React.useState(0);
  const [bagWeightInput, setBagWeightInput] = React.useState('');

  const selected = inwards[selectedIndex];
  const totalBagged = (selected?.bags || []).reduce((s, b) => s + (Number(b.weight) || 0), 0);
  const delta = (selected?.weight || 0) - totalBagged;

  const panelH = { xs: 'auto', md: 'calc(100vh - 300px)' }; // match heights on md+

  const handleCreateLabel = () => {
    const w = Number(bagWeightInput);
    if (!selected || Number.isNaN(w) || w <= 0) return;

    const run = nextRunNumber(selected.bags.length);
    const label = `${selected.inward_no}_${formatDDMMYY()}_Inw_${run}`;

    const updated = [...inwards];
    updated[selectedIndex] = {
      ...selected,
      bags: [...selected.bags, { label, weight: w }],
    };
    setInwards(updated);
    setBagWeightInput('');
  };

  const handlePrint = (bag) => {
    // TODO: hook to your PDF endpoint
    console.log('PRINT', bag.label, bag.weight);
  };

  return (
    <div style={{ display: "grid", gap: 12 }}>
    <Box
      sx={{
        width: '100%',
        display: 'grid',
        gap: 2,
        mt:2,
        gridTemplateColumns: {
          xs: '1fr 1fr', // inwards + details
          md: `${LEFT_W}px ${MID_W}px minmax(${RIGHT_W}px, 1fr)`, // add labels column
        },
        gridTemplateAreas: {
          xs: `"inw details" "labels labels"`,
          md: `"inw details labels"`,
        },
        alignItems: 'stretch',
        scrollbarGutter: { md: 'stable both-edges' },
      }}
    >
      {/* Inwards (left) */}
      <Panel area="inw" height={panelH}>
        <Typography sx={{ ...TEXT_SX, mb: 1.5 }}>Inwards ({inwards.length})</Typography>

        <List disablePadding>
          {inwards.map((row, i) => (
            <Box key={row.inward_no} sx={{ mb: 1 }}>
              <ListItemButton
                onClick={() => setSelectedIndex(i)}
                selected={i === selectedIndex}
                sx={(t) => ({
                  borderRadius: 2,
                  px: 2, py: 1.5,
                  bgcolor: i === selectedIndex ? t.palette.primary.main : 'rgba(79,195,247,.6)',
                  '&.Mui-selected': {
                    bgcolor: t.palette.primary.main + ' !important',
                    color: t.palette.primary.contrastText,
                  },
                })}
              >
                <ListItemText primary={<Typography sx={TEXT_SX}>{row.inward_no}</Typography>} />
              </ListItemButton>
            </Box>
          ))}
        </List>
      </Panel>

      {/* Inward Details (middle) */}
      <Panel area="details" height={panelH} p3>
        <Typography sx={TEXT_SX}>Inward Details</Typography>

        {/* Stats */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 1.5 }}>
          <Stat label="Weight" value={`${selected?.weight ?? 0} kg`} />
          <Stat label="Bagged Weight" value={`${totalBagged} kg`} />
          <Stat label="Delta" value={`${delta} kg`} emphasize />
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Weight input + create (one line on all sizes) */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: { xs: 0.5, sm: 1 },
            flexWrap: 'nowrap',
            minWidth: 0,
          }}
        >
          <TextField
            size="small"
            type="number"
            label="Weight"
            value={bagWeightInput}
            onChange={(e) => setBagWeightInput(e.target.value)}
            inputProps={{ min: 0, step: '0.01', inputMode: 'decimal' }}
            sx={{
              width: { xs: 100, sm: 140 }, // fits 3 digits on mobile
              flexShrink: 1,
              '& .MuiInputBase-input': TEXT_SX,
            }}
            InputLabelProps={{ sx: TEXT_SX }}
          />
          <Tooltip title="Create label">
            <span>
              <IconButton
                size="small"
                color="primary"
                onClick={handleCreateLabel}
                disabled={!selected || !bagWeightInput || Number(bagWeightInput) <= 0}
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
      </Panel>

      {/* Labeled Bags (right on md+, below on xs) */}
      <Panel area="labels" height={panelH}>
        <Typography sx={{ ...TEXT_SX, mb: 1.5 }}>Labeled Bags</Typography>

        <Box sx={{ display: 'grid', gap: 1 }}>
          {selected?.bags?.length ? (
            selected.bags.map((b) => (
              <LabelCard key={b.label} label={b.label} weight={b.weight} onPrint={() => handlePrint(b)} />
            ))
          ) : (
            <Typography color="text.secondary" sx={TEXT_SX}>
              No bags yet for this inward.
            </Typography>
          )}
        </Box>
      </Panel>
    </Box>
    </div>
  );
}

/* ---------- Small building blocks ---------- */

function Panel({ area, height, children, p3 = false }) {
  return (
    <Paper
      elevation={0}
      sx={{
        gridArea: area,
        p: { xs: 2, md: p3 ? 3 : 2 },
        bgcolor: '#f6f8fa',
        height,
        overflowY: { xs: 'visible', md: 'auto' },
        borderRadius: 2,
        minWidth: 0,
        boxSizing: 'border-box',
      }}
    >
      {children}
    </Paper>
  );
}

function Stat({ label, value, emphasize = false }) {
  return (
    <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 2 }}>
      <Typography sx={{ ...TEXT_SX, color: 'text.secondary' }}>{label} :</Typography>
      <Typography sx={{ ...TEXT_SX, mt: 0.5, fontWeight: emphasize ? 800 : 600 }}>
        {value}
      </Typography>
    </Paper>
  );
}

function ChipPill({ children }) {
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

function LabelCard({ label, weight, onPrint }) {
  return (
    <Paper
      elevation={1}
      sx={{
        p: 1.2,
        borderRadius: 3,
        display: 'grid',
        gridTemplateColumns: '1fr auto',
        rowGap: 1,
        columnGap: 1,
        alignItems: 'center',
      }}
    >
      {/* Top: label (full width) */}
      <Typography sx={{ gridColumn: '1 / span 2', ...TEXT_SX, fontWeight: 700 }}>
        {label}
      </Typography>

      {/* Bottom-left: weight chip */}
      <Box sx={{ gridColumn: '1 / span 1' }}>
        <ChipPill>{Number(weight).toFixed(1)} kg</ChipPill>
      </Box>

      {/* Bottom-right: print button */}
      <Box sx={{ gridColumn: '2 / span 1', justifySelf: 'end' }}>
        <Tooltip title="Print">
          <IconButton
            size="small"
            onClick={onPrint}
            sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 9999, width: 36, height: 36 }}
          >
            <LocalPrintshopOutlinedIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>
    </Paper>
  );
}
