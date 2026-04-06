// src/components/FactoryLogsChatWidget.jsx
import React from 'react';
import {
  Box,
  Paper,
  IconButton,
  Typography,
  Divider,
  List,
  ListItem,
  ListItemText,
  Tooltip,
  CircularProgress,
  Fade,
  Slide,
} from '@mui/material';
import FactoryIcon from '@mui/icons-material/Factory';
import CloseIcon from '@mui/icons-material/Close';
import RefreshIcon from '@mui/icons-material/Refresh';

const DEFAULT_LOGS = [
  {
    id: 1,
    timestamp: '2025-11-23 10:05',
    level: 'INFO',
    message: 'Kiln A: Loaded 12 bags, total 965 kg.',
  },
  {
    id: 2,
    timestamp: '2025-11-23 10:00',
    level: 'WARN',
    message: 'Boiler feed pressure slightly below target.',
  },
  {
    id: 3,
    timestamp: '2025-11-23 09:45',
    level: 'INFO',
    message: 'Crusher line restarted after scheduled maintenance.',
  },
  {
    id: 1,
    timestamp: '2025-11-23 10:05',
    level: 'INFO',
    message: 'Kiln A: Loaded 12 bags, total 965 kg.',
  },
  {
    id: 2,
    timestamp: '2025-11-23 10:00',
    level: 'WARN',
    message: 'Boiler feed pressure slightly below target.',
  },
  {
    id: 3,
    timestamp: '2025-11-23 09:45',
    level: 'INFO',
    message: 'Crusher line restarted after scheduled maintenance.',
  },
];

export default function FactoryLogsChatWidget({
  title = 'Factory Logs',
  fetchLogs,              // optional: async () => [{ id, timestamp, level, message }, ...]
  position = { bottom: 16, right: 16 },
  refreshIntervalMs = 15 * 60 * 1000, // 🔁 default: 15 minutes
}) {
  const [open, setOpen] = React.useState(false);
  const [logs, setLogs] = React.useState(DEFAULT_LOGS);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(null);
  const [lastUpdated, setLastUpdated] = React.useState(null);

  const toggleOpen = () => setOpen((prev) => !prev);

  const loadLogs = React.useCallback(async () => {
    if (!fetchLogs) return; // stay with default logs until backend is wired
    try {
      setLoading(true);
      setError(null);
      const data = await fetchLogs();
      if (Array.isArray(data)) {
        setLogs(data);
      } else {
        setLogs([]);
      }
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Error fetching logs:', err);
      setError(err?.message || 'Failed to load logs');
    } finally {
      setLoading(false);
    }
  }, [fetchLogs]);

  // Load once when opened (if backend is provided)
  React.useEffect(() => {
    if (open && fetchLogs) {
      loadLogs();
    }
  }, [open, fetchLogs, loadLogs]);

  // 🔁 Auto-refresh every 15 minutes while open
  React.useEffect(() => {
    if (!open || !fetchLogs || !refreshIntervalMs) return;

    const id = setInterval(() => {
      loadLogs();
    }, refreshIntervalMs);

    return () => clearInterval(id);
  }, [open, fetchLogs, refreshIntervalMs, loadLogs]);

  const lastUpdatedLabel = React.useMemo(() => {
    if (!lastUpdated) return '';
    return lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }, [lastUpdated]);

  return (
    <>
      {/* Floating panel */}
      <Box
        sx={{
          position: 'fixed',
          bottom: position.bottom + 64,
          right: position.right,
          zIndex: (theme) => theme.zIndex.tooltip + 10,
          width: 360,
          maxWidth: '90vw',
          pointerEvents: open ? 'auto' : 'none',
        }}
      >
        <Slide direction="up" in={open} mountOnEnter unmountOnExit>
          <Paper
            elevation={8}
            sx={{
              borderRadius: 3,
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              maxHeight: '60vh',
            }}
          >
            {/* Header */}
            <Box
              sx={{
                px: 1.5,
                py: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                bgcolor: 'primary.main',
                color: 'primary.contrastText',
              }}
            >
              <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                <Typography variant="subtitle2" fontWeight={600}>
                  {title}
                </Typography>
                {lastUpdatedLabel && (
                  <Typography variant="caption" sx={{ opacity: 0.8 }}>
                    Updated at {lastUpdatedLabel}
                  </Typography>
                )}
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                {loading && (
                  <CircularProgress
                    size={18}
                    sx={{ color: 'primary.contrastText' }}
                  />
                )}
                {fetchLogs && !loading && (
                  <Tooltip title="Refresh now">
                    <IconButton
                      size="small"
                      onClick={loadLogs}
                      sx={{
                        color: 'primary.contrastText',
                        '&:hover': { bgcolor: 'rgba(255,255,255,0.15)' },
                      }}
                    >
                      <RefreshIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                )}
                <Tooltip title="Close">
                  <IconButton
                    size="small"
                    onClick={toggleOpen}
                    sx={{
                      color: 'primary.contrastText',
                      '&:hover': { bgcolor: 'rgba(255,255,255,0.15)' },
                    }}
                  >
                    <CloseIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>

            <Divider />

            {/* Content */}
            <Box sx={{ p: 1, flex: 1, minHeight: 160, maxHeight: '50vh', overflowY: 'auto' }}>
              {error && (
                <Typography
                  variant="caption"
                  color="error"
                  sx={{ mb: 1, display: 'block' }}
                >
                  {error}
                </Typography>
              )}

              {logs.length === 0 && !loading && !error && (
                <Typography variant="body2" color="text.secondary">
                  No logs available.
                </Typography>
              )}

              {logs.length > 0 && (
                <List dense sx={{ py: 0 }}>
                  {logs.map((log) => (
                    <ListItem
                      key={log.id || `${log.timestamp}-${log.message}`}
                      alignItems="flex-start"
                      sx={{ px: 0.5 }}
                    >
                      <ListItemText
                        primary={
                          <Box
                            sx={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              gap: 1,
                            }}
                          >
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              sx={{ whiteSpace: 'nowrap' }}
                            >
                              {log.timestamp}
                            </Typography>
                            <Typography
                              variant="caption"
                              sx={{
                                ml: 1,
                                px: 0.75,
                                py: 0.1,
                                borderRadius: 1,
                                bgcolor:
                                  log.level === 'ERROR'
                                    ? 'error.light'
                                    : log.level === 'WARN'
                                    ? 'warning.light'
                                    : 'success.light',
                              }}
                            >
                              {log.level || 'INFO'}
                            </Typography>
                          </Box>
                        }
                        secondary={
                          <Typography
                            variant="body2"
                            sx={{ mt: 0.25, whiteSpace: 'pre-line' }}
                          >
                            {log.message}
                          </Typography>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              )}
            </Box>
          </Paper>
        </Slide>
      </Box>

      {/* Floating chat button */}
      <Box
        sx={{
          position: 'fixed',
          bottom: position.bottom,
          right: position.right,
          zIndex: (theme) => theme.zIndex.tooltip + 11,
        }}
      >
        <Fade in>
          <Paper
            elevation={8}
            sx={{
              borderRadius: '999px',
              bgcolor: 'primary.main',
              color: 'primary.contrastText',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 52,
              height: 52,
              cursor: 'pointer',
              '&:hover': { bgcolor: 'primary.dark' },
            }}
            onClick={toggleOpen}
          >
            <FactoryIcon />
          </Paper>
        </Fade>
      </Box>
    </>
  );
}
