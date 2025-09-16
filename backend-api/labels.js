// routes/labels.js
const express = require('express');
const router = express.Router();
const PDFDocument = require('pdfkit');
const QRCode = require('qrcode');

// reuse your existing cookie middleware
const { authenticate } = require('./authenticate');
// mm -> PostScript points
const mm = v => (v * 72 / 25.4);

// Draw one line that auto-shrinks to fit width
function fitAndDrawOneLine(doc, { text, maxSize, minSize, font, x, y, width }) {
  let size = maxSize;
  while (size > minSize) {
    doc.font(font).fontSize(size);
    if (doc.widthOfString(text) <= width) break;
    size -= 0.5;
  }
  doc.text(text, x, y, { width, lineBreak: false, ellipsis: true });
  return size;
}

router.get('/templates/:tpl/preview.pdf', authenticate, async (req, res) => {
  try {
    const { tpl } = req.params;
    if (tpl !== 'bag_v1') return res.status(404).send('Unknown template');

    const {
      bag_no = '',
      grade = '',
      weight = '',
      copies: copiesRaw = '1',
      // optional overrides if you ever need to tweak:
      wmm = '50',    // default width 50 mm
      hmm = '25',    // default height 30 mm
      margin = '1.5',// mm; small to keep top-anchored
      qrmm = '18'    // QR size in mm (shrink if text is long)
    } = req.query;

    if (!bag_no) return res.status(400).send('bag_no is required');

    const widthPt  = mm(Number(wmm) || 50);
    const heightPt = mm(Number(hmm) || 30);
    const copies   = Math.max(1, Math.min(20, parseInt(copiesRaw, 10) || 1));

    // Build QR image
    const qrPayload = `${bag_no}|${grade || ''}|${weight || ''}`;
    const qrDataURL = await QRCode.toDataURL(qrPayload, { margin: 0, scale: 3 });
    const qrBase64 = qrDataURL.replace(/^data:image\/png;base64,/, '');
    const qrBuffer = Buffer.from(qrBase64, 'base64');

    const M = mm(Number(margin));        // top-left anchor margin
    const gutter = mm(2);                // space between text and QR
    const qrSize = Math.min(mm(Number(qrmm) || 18), heightPt - 2 * M);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${encodeURIComponent(bag_no)}.pdf"`);

    const doc = new PDFDocument({
      size: [widthPt, heightPt],
      margins: { top: M, left: M, right: M, bottom: M },
      pdfVersion: '1.5',
      autoFirstPage: false
    });
    doc.pipe(res);

    for (let i = 0; i < copies; i++) {
      doc.addPage({ size: [widthPt, heightPt], margins: { top: M, left: M, right: M, bottom: M } });

      const W = widthPt, H = heightPt;
      const contentW = W - 2 * M;

      // Right column (QR) — TOP-ALIGNED
      const qrX = W - M - qrSize;
      const qrY = M;

      // Left column (text) — TOP-ALIGNED
      const leftX = M;
      const leftY = M;
      const leftW = Math.max(0, qrX - gutter - leftX);

      // 1) Bag number (bold, single line, auto shrink 11→8 pt)
      const bagFontSize = fitAndDrawOneLine(doc, {
        text: bag_no,
        maxSize: 11,
        minSize: 8,
        font: 'Helvetica-Bold',
        x: leftX,
        y: leftY,
        width: leftW
      });

      // 2) Compact second line: Grade + Weight + Date
      const dateStr = new Date().toLocaleDateString();
      doc.font('Helvetica').fontSize(8.5)
         .text(`G:${grade || '-'}  W:${weight || '-'}  D:${dateStr}`,
               leftX, leftY + bagFontSize + 2,
               { width: leftW, lineBreak: false, ellipsis: true });

      // (Optional) very thin divider under text block:
      // const dividerY = Math.min(leftY + bagFontSize + 2 + 9, H - M - 1);
      // doc.moveTo(leftX, dividerY).lineTo(leftX + leftW, dividerY).lineWidth(0.3).stroke();

      // QR image
      doc.image(qrBuffer, qrX, qrY, { width: qrSize, height: qrSize });

      // (Optional) debug outlines:
      // doc.rect(0,0,W,H).stroke();
      // doc.rect(leftX,leftY,leftW,qrSize).stroke();
    }

    doc.end();
  } catch (err) {
    console.error('PDF preview error:', err);
    res.status(500).send('Failed to generate PDF');
  }
});

module.exports = router;
