import { Paper, Stack, Box, Typography, Chip, IconButton, Tooltip } from '@mui/material';
import LocalPrintshopOutlinedIcon from '@mui/icons-material/LocalPrintshopOutlined';

// keep or reuse your TEXT_SX
const TEXT_SX = { fontSize: 13, fontWeight: 600 };
const CHIP_SX = { '& .MuiChip-label': { fontSize: 13, fontWeight: 600, px: 1 } };
const LABEL_CARD_H = 75; // tweak (72–96) if you want a consistent height

function formatWeight(w) {
  const n = Number(w) || 0;
  return n.toFixed(1);
}

export function LabelCard({
  label,
  weight,
  grade,          // optional
  createdAt,      // optional (timestamp)
  onPrint,
  disabled = false,
  sx = {},
}) {
  return (
    <Paper
      elevation={1}
      sx={{
        p: 0.5,
        mb: 0.5,
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 2,
        alignSelf: 'start',        // don’t stretch in grid parents
        minHeight: LABEL_CARD_H,   // fixed-ish height like your sample
        ...sx,
      }}
    >
      <Stack direction="row" justifyContent="space-between" alignItems="center" gap={1}>
        {/* Left: label + chips */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography sx={{ ...TEXT_SX, fontWeight: 700, mb: 0.5, overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {label}
          </Typography>

          <Stack direction="row" spacing={1} useFlexGap alignItems="center" flexWrap="wrap">
            <Chip label={`${formatWeight(weight)} kg`} size="small" variant="outlined" sx={CHIP_SX} />
            {grade ? <Chip label={grade} size="small" variant="outlined" sx={CHIP_SX} /> : null}
            {createdAt ? (
              <Chip label={new Date(createdAt).toLocaleString()} size="small" variant="outlined" sx={CHIP_SX} />
            ) : null}
          </Stack>
        </Box>

        {/* Right: print button */}
        <Tooltip title="Print">
          <span>
            <IconButton
              size="small"
              onClick={onPrint}
              disabled={disabled}
              sx={{ border: '1px solid', borderColor: 'divider', borderRadius: '9999px' }}
            >
              <LocalPrintshopOutlinedIcon fontSize="small" />
            </IconButton>
          </span>
        </Tooltip>
      </Stack>
    </Paper>
  );
}
