// QualityPostActivationAccordions.jsx
import React, { useEffect, useState, useCallback } from 'react';
import {
  Box, Stack, Typography, Chip, IconButton, CircularProgress, Tooltip,
  Accordion, AccordionSummary, AccordionDetails,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import RefreshOutlinedIcon from '@mui/icons-material/RefreshOutlined';
import ReplayOutlinedIcon from '@mui/icons-material/ReplayOutlined';
import QualityBucketTable from './QualityBucketTable';

const API_BASE = import.meta.env.VITE_API_URL;

// EXACT order & labels (no De-Stoning)
const PANEL_KEYS = ['Screening', 'Blending', 'De-Dusting', 'De-Magnetize', 'Crushing'];

export default function QualityPostActivationAccordions() {
  const [counts, setCounts] = useState(() =>
    PANEL_KEYS.reduce((a, k) => ({ ...a, [k]: 0 }), {})
  );
  const [loadingCounts, setLoadingCounts] = useState(false);
  const [loadedPanels, setLoadedPanels] = useState(() =>
    PANEL_KEYS.reduce((a, k) => ({ ...a, [k]: false }), {})
  );
  const [expanded, setExpanded] = useState([]); // allow multiple open

  const fetchCounts = useCallback(async () => {
    setLoadingCounts(true);
    try {
      const resp = await fetch(`${API_BASE}/api/post_activation/bag_counts`, {
        method: 'GET',
        credentials: 'include',
      });
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      const data = await resp.json();
      if (!data?.success) throw new Error(data?.error || 'Failed to load counts');
      setCounts(prev => {
        const next = { ...prev };
        PANEL_KEYS.forEach(k => { next[k] = data.counts?.[k] ?? 0; });
        return next;
      });
    } catch (e) {
      console.error('bag_counts error', e);
      alert('Failed to load counts.');
    } finally {
      setLoadingCounts(false);
    }
  }, []);

  useEffect(() => { fetchCounts(); }, [fetchCounts]);

  const handleAccordionChange = (panelKey) => (_evt, isExpanded) => {
    setExpanded(prev => {
      const set = new Set(prev);
      if (isExpanded) set.add(panelKey); else set.delete(panelKey);
      return Array.from(set);
    });
    if (isExpanded && !loadedPanels[panelKey]) {
      setLoadedPanels(p => ({ ...p, [panelKey]: true }));
    }
  };

  const applyCountUpdate = (operation, newCount) => {
    if (!operation) return;
    setCounts(prev => ({ ...prev, [operation]: Number(newCount ?? 0) }));
  };

  const reloadPanel = (panelKey) => {
    // force child remount to refetch
    setLoadedPanels(p => ({ ...p, [panelKey]: false }));
    setTimeout(() => setLoadedPanels(p => ({ ...p, [panelKey]: true })), 0);
  };

  return (
    <Box sx={{ width: { xs: '100%', md: 1100 } }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
        <Typography variant="subtitle1" fontWeight={700}>Quality — Post Activation</Typography>
        <Tooltip title="Refresh all counts">
          <span>
            <IconButton onClick={fetchCounts} disabled={loadingCounts}>
              {loadingCounts ? <CircularProgress size={20} /> : <RefreshOutlinedIcon />}
            </IconButton>
          </span>
        </Tooltip>
      </Stack>

      <Stack spacing={1}>
        {PANEL_KEYS.map((panelKey) => {
          const isOpen = expanded.includes(panelKey);
          return (
            <Accordion
              key={panelKey}
              expanded={isOpen}
              onChange={handleAccordionChange(panelKey)}
              sx={{ borderRadius: 2, bgcolor: '#f6f8fa', boxShadow: 'none' }}
            >
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ width: '100%' }}>
                  <Typography variant="subtitle1" fontWeight={700}>{panelKey}</Typography>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Chip size="small" label={counts[panelKey] ?? 0} />
                    <Tooltip title="Reload panel">
                      <span>
                        <IconButton size="small" onClick={(e) => { e.stopPropagation(); reloadPanel(panelKey); }}>
                          <ReplayOutlinedIcon fontSize="small" />
                        </IconButton>
                      </span>
                    </Tooltip>
                  </Stack>
                </Stack>
              </AccordionSummary>
              <AccordionDetails sx={{ bgcolor: 'white', borderRadius: 2 }}>
                {loadedPanels[panelKey] ? (
                  <QualityBucketTable
                    key={`table-${panelKey}-${counts[panelKey]}`}
                    apiBase={API_BASE}
                    bucketKey={panelKey}
                    pageSize={50}
                    onCountRefresh={(newCount) => applyCountUpdate(panelKey, newCount)}
                  />
                ) : (
                  <Box sx={{ p: 1, color: 'text.secondary', fontSize: 13 }}>
                    Expand to load {panelKey} records.
                  </Box>
                )}
              </AccordionDetails>
            </Accordion>
          );
        })}
      </Stack>
    </Box>
  );
}
