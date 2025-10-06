// routes/labels.js  (barcode-only version)
const express = require('express');
const router = express.Router();
const PDFDocument = require('pdfkit');
const bwipjs = require('bwip-js');        // Code 128 renderer
const { authenticate } = require('./authenticate');

// mm -> PostScript points
const mm = (v) => (v * 72) / 25.4;

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

      // Label size (mm)
      wmm = '50',     // 50x25 or 50x30 as you use
      hmm = '25',

      // Layout
      margin = '1.5',
      qrmm = '18',    // keeps the same right-hand "symbol box" size you were using

      // Optional tuning for the barcode box (mm) inside that right area
      // If omitted, it uses the full qrmm width and ~60% height
      bwmm,
      bhmm,

      // Optional: payload mode ("bag" is fastest for scanning)
      payloadMode = 'bag', // 'bag' | 'full'
    } = req.query;

    if (!bag_no) return res.status(400).send('bag_no is required');

    // points
    const W = mm(Number(wmm) || 50);
    const H = mm(Number(hmm) || 25);
    const M = mm(Number(margin) || 1.5);
    const copies = Math.max(1, Math.min(20, parseInt(copiesRaw, 10) || 1));

    // reserved area for the symbol on the right (same as before)
    const gutter = mm(2);
    const symbolBoxPt = Math.min(mm(Number(qrmm) || 18), H - 2 * M);

    // Keep payload short for faster scans
    const payload =
      String(payloadMode).toLowerCase() === 'full'
        ? `${bag_no}|${grade || ''}|${weight || ''}`
        : String(bag_no);

    // Render Code 128 once; scale in PDF
    const barcodePngBuffer = await bwipjs.toBuffer({
      bcid: 'code128',
      text: payload,
      scale: 4,             // pixels per module (hi-res; PDF scales down crisply)
      includetext: false,   // we print human text on the left already
      backgroundcolor: 'FFFFFF',
      padding: 0,
      // (no height here; we’ll size in PDF to bwmm/bhmm or defaults)
    });

    // Preferred inside size for the bars
    const barWpt = bwmm ? mm(Number(bwmm)) : symbolBoxPt;
    const barHpt = bhmm ? mm(Number(bhmm)) : Math.max(symbolBoxPt * 0.6, mm(10));

    // Prepare response
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'inline; filename="preview.pdf"');

    const doc = new PDFDocument({
      size: [W, H],
      margin: 0,
      autoFirstPage: false,
      pdfVersion: '1.5',
    });
    doc.pipe(res);

    for (let c = 0; c < copies; c++) {
      doc.addPage({ size: [W, H], margin: 0 });

      // Layout calcs
      const leftX = M;
      const leftY = M;
      const leftW = Math.max(0, W - M - gutter - symbolBoxPt - M);

      // Left text block
      const bagSize = fitAndDrawOneLine(doc, {
        text: String(bag_no).toUpperCase(),
        maxSize: 18,
        minSize: 10,
        font: 'Helvetica-Bold',
        x: leftX,
        y: leftY,
        width: leftW,
      });

      const y2 = leftY + bagSize + mm(1.2);
      const gradeSize = fitAndDrawOneLine(doc, {
        text: String(grade || '').toUpperCase(),
        maxSize: 12,
        minSize: 7,
        font: 'Helvetica',
        x: leftX,
        y: y2,
        width: leftW,
      });

      if (String(weight || '').trim()) {
        const y3 = y2 + gradeSize + mm(0.8);
        fitAndDrawOneLine(doc, {
          text: `${weight} kg`,
          maxSize: 12,
          minSize: 7,
          font: 'Helvetica',
          x: leftX,
          y: y3,
          width: leftW,
        });
      }

      // Right: barcode centered in the reserved box
      const boxX = W - M - symbolBoxPt;
      const barX = boxX + (symbolBoxPt - Math.min(barWpt, symbolBoxPt)) / 2;
      const barY = M + (symbolBoxPt - Math.min(barHpt, H - 2 * M)) / 2;

      doc.image(barcodePngBuffer, barX, barY, {
        width: Math.min(barWpt, symbolBoxPt),
        height: Math.min(barHpt, H - 2 * M),
      });

      // (debug)
      // doc.rect(boxX, M, symbolBoxPt, symbolBoxPt).stroke('#eee');
    }

    doc.end();
  } catch (err) {
    console.error('PDF preview error:', err);
    res.status(500).send('Failed to generate PDF');
  }
});

module.exports = router;
