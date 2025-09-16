// PrintLabelButton.jsx
import { IconButton, Tooltip } from '@mui/material';
import PrintIcon from '@mui/icons-material/Print';
const API_URL = import.meta.env.VITE_API_URL;

export default function PrintLabelButton({ bag_no, grade, weight, heightIn = 2.5, useSignedUrl = false }) {
  const openPdf = async () => {
    try {
      let url;
      if (useSignedUrl) {
        // If your API is on a different domain or you don’t rely on cookies:
        const resp = await fetch(`${API_URL}/api/labels/print-url`, {
          method: 'POST',
          credentials: 'include', // send cookie if you have it
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ bag_no, grade, weight, heightIn, copies: 1 }),
        });
        const data = await resp.json();
        if (!data?.success) throw new Error('ticket failed');
        url = `${API_URL}${data.url}`;
      } else {
        // Same-site cookie auth – open direct preview
        const q = new URLSearchParams({
          bag_no,
          grade: grade || '',
          weight: weight || '',
          heightIn: String(heightIn),
          _: String(Date.now()), // cache-buster
        }).toString();
        url = `${API_URL}/api/labels/templates/bag_v1/preview.pdf?${q}`;
      }
      window.open(url, '_blank', 'noopener');
    } catch (e) {
      console.error('Open PDF failed:', e);
      alert('Unable to open label PDF');
    }
  };

  return (
    <Tooltip title="Print label">
      <IconButton size="small" onClick={openPdf} aria-label="Print label">
        <PrintIcon fontSize="small" />
      </IconButton>
    </Tooltip>
  );
}
