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

const DEFAULT_LOGS = []; // start empty – no hardcoded logs
const API_URL = import.meta.env.VITE_API_URL;

// Default backend fetcher with robust error handling
async function defaultFetchLogsFromBackend(limit = 96) {
  const params = new URLSearchParams();
  params.set('limit', String(limit));

  const url = API_URL+`/api/factory-log/scroll?${params.toString()}`;

  let resp;
  try {
    resp = await fetch(url, { credentials: 'include' });
  } catch (err) {
    // Network / CORS / fetch-level error
    throw new Error(`Unable to reach factory log API (${url})`);
  }

  // Handle 401 explicitly if you don't have global handling
  if (resp.status === 401) {
    throw new Error('Not authorised to view factory logs (401)');
  }

  const contentType = resp.headers.get('content-type') || '';

  // Non-OK HTTP status
  if (!resp.ok) {
    const text = await resp.text().catch(() => '');
    // Common dev case: route not found → Express HTML with "Cannot GET ..."
    if (text && (text.startsWith('<!DOCTYPE') || text.startsWith('<html'))) {
      if (text.includes('Cannot GET')) {
        throw new Error(`Factory log API not found at ${url}`);
      }
      throw new Error(
        `Factory log API error (${resp.status} ${resp.statusText || ''})`
      );
    }
    // If server sent some plain text error message, use it
    if (text.trim()) {
      throw new Error(text.trim());
    }
    throw new Error(
      `Factory log API error (${resp.status} ${resp.statusText || ''})`
    );
  }

  // Expect JSON { items: [...], paging: {...} }
  if (!contentType.includes('application/json')) {
    const text = await resp.text().catch(() => '');
    if (text.includes('Cannot GET')) {
      throw new Error(`Factory log API not found at ${url}`);
    }
    throw new Error('Factory log API returned non-JSON response');
  }

  const json = await resp.json();

  const items = Array.isArray(json.items) ? json.items : [];
  const flat = [];

  // Flatten slot-based logs into a simple array
  // Each item: { slotStart, slotEnd, data: { logs: [ { id, level, message, timestamp }, ... ] } }
  for (const slot of items) {
    const slotLogs = Array.isArray(slot.logs)
      ? slot.logs
      : Array.isArray(slot.data?.logs)
      ? slot.data.logs
      : [];
    for (const entry of slotLogs) {
      flat.push({
        id: entry.id || `${entry.timestamp || ''}-${entry.message || ''}`,
        timestamp: entry.timestamp || '', // already IST string from your scheduler
        level: entry.level || 'INFO',
        message: entry.message || '',
      });
    }
  }

  // Newest first by timestamp string
  flat.sort((a, b) => (b.timestamp || '').localeCompare(a.timestamp || ''));

  return flat;
}

export default function FactoryLogsChatWidget({
  title = 'Factory Logs',
  // optional custom fetch: async () => [{ id, timestamp, level, message }, ...]
  fetchLogs,
  position = { bottom: 16, right: 16 },
  // default: NO auto-refresh; set a value (e.g. 15 * 60 * 1000) to enable
  refreshIntervalMs = null,
}) {
  const [open, setOpen] = React.useState(false);
  const [logs, setLogs] = React.useState(DEFAULT_LOGS);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(null);
  const [lastUpdated, setLastUpdated] = React.useState(null);

  // Use custom fetch if provided, otherwise default backend fetch
  const effectiveFetchLogs = React.useCallback(
    async () => {
      if (typeof fetchLogs === 'function') {
        return fetchLogs();
      }
      return defaultFetchLogsFromBackend(96);
    },
    [fetchLogs]
  );

  const toggleOpen = () => setOpen((prev) => !prev);

  const loadLogs = React.useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await effectiveFetchLogs();

      if (Array.isArray(data)) {
        setLogs(data);
      } else {
        setLogs([]);
      }
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Error fetching logs:', err);
      setError(err?.message || 'Failed to load logs');
      setLogs([]); // clear logs so the error is clear
    } finally {
      setLoading(false);
    }
  }, [effectiveFetchLogs]);

  // Load once when opened
  React.useEffect(() => {
    if (open) {
      loadLogs();
    }
  }, [open, loadLogs]);

  // Optional auto-refresh while open (disabled by default)
  React.useEffect(() => {
    if (!open || !refreshIntervalMs || refreshIntervalMs <= 0) return;

    const id = setInterval(() => {
      loadLogs();
    }, refreshIntervalMs);

    return () => clearInterval(id);
  }, [open, refreshIntervalMs, loadLogs]);

  const lastUpdatedLabel = React.useMemo(() => {
    if (!lastUpdated) return '';
    return lastUpdated.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
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
                {!loading && (
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
            <Box
              sx={{
                p: 1,
                flex: 1,
                minHeight: 160,
                maxHeight: '50vh',
                overflowY: 'auto',
              }}
            >
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
