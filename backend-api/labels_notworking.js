// routes/labels.js  — barcode-only, full-width bars with text below
const express = require('express');
const router = express.Router();
const PDFDocument = require('pdfkit');
const bwipjs = require('bwip-js');
const { authenticate } = require('./authenticate');

// mm -> PostScript points
const mm = (v) => (v * 72) / 25.4;

// Draw one line that auto-shrinks to fit width
function fitAndDrawOneLine(doc, { text, maxSize, minSize, font, x, y, width, align = 'center' }) {
  let size = maxSize;
  while (size > minSize) {
    doc.font(font).fontSize(size);
    if (doc.widthOfString(text) <= width) break;
    size -= 0.5;
  }
  doc.text(text, x, y, { width, align, lineBreak: false, ellipsis: true });
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

      // Label size (mm) — e.g., 50x25 or 50x30
      wmm = '50',
      hmm = '25',

      // Margins (mm)
      margin = '1.5',

      // Optional tuning for bar area (in mm). If omitted, we auto-fill width and pick a tall bar.
      bwmm,
      bhmm,

      // Keep payload short for better scans: 'bag' (default) or 'full' = bag|grade|weight
      payloadMode = 'bag',

      // Optional: show human-readable text under the bars (default true)
      readable = 'true',
    } = req.query;

    if (!bag_no) return res.status(400).send('bag_no is required');

    // Convert to points
    const W = mm(Number(wmm) || 50);
    const H = mm(Number(hmm) || 25);
    const M = mm(Number(margin) || 1.5);
    const copies = Math.max(1, Math.min(20, parseInt(copiesRaw, 10) || 1));

    // Build payload
    const payload =
      String(payloadMode).toLowerCase() === 'full'
        ? `${bag_no}|${grade || ''}|${weight || ''}`
        : String(bag_no);

    // Render a crisp barcode PNG once; scale inside PDF
    const barcodePngBuffer = await bwipjs.toBuffer({
      bcid: 'code128',
      text: payload,
      scale: 4,            // hi-res source; PDF scales down cleanly
      includetext: false,  // we'll draw human-readable ourselves
      backgroundcolor: 'FFFFFF',
      padding: 0,
    });

    // Layout: full-width bars at the top; text centered below
    const contentW = W - 2 * M;
    const contentH = H - 2 * M;

    // Bars size — default to full width; height uses ~65% of content height (leaves room for text)
    const barWpt = bwmm ? mm(Number(bwmm)) : contentW;
    const barHpt = (() => {
      const wanted = bhmm ? mm(Number(bhmm)) : contentH * 0.65;
      // keep at least 10mm bars; do not exceed available height
      return Math.max(mm(10), Math.min(wanted, contentH * 0.8));
    })();

    // Positions
    const barX = M + (contentW - barWpt) / 2; // centered
    const barY = M;                           // top inside margin

    // Text block starts below the bars with a small gap
    const textGap = mm(1.0);
    const textY = barY + barHpt + textGap;
    const textW = contentW;

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

      // Draw BARCODE (full width area)
      doc.image(barcodePngBuffer, barX, barY, { width: barWpt, height: barHpt });

      // Human-readable BAG NO under bars (centered)
      if (String(readable).toLowerCase() !== 'false') {
        // Big bag_no; shrink-to-fit if needed
        const bagSize = fitAndDrawOneLine(doc, {
          text: String(bag_no).toUpperCase(),
          maxSize: 12,          // tweak if you want larger
          minSize: 8,
          font: 'Helvetica-Bold',
          x: M,
          y: textY,
          width: textW,
          align: 'center',
        });

        // Optional: grade below
        const haveGrade = String(grade || '').trim() !== '';
        const haveWeight = String(weight || '').trim() !== '';
        const grade_weight = haveGrade+" "+haveWeight
        let nextY = textY + bagSize + mm(0.4);

        if (haveGrade) {
          const gSize = fitAndDrawOneLine(doc, {
            text: String(grade_weight).toUpperCase(),
            maxSize: 10,
            minSize: 7,
            font: 'Helvetica',
            x: M,
            y: nextY,
            width: textW,
            align: 'center',
          });
          nextY += gSize + mm(0.2);
        }

        /* if (haveWeight) {
          fitAndDrawOneLine(doc, {
            text: `${weight} kg`,
            maxSize: 10,
            minSize: 7,
            font: 'Helvetica',
            x: M,
            y: nextY,
            width: textW,
            align: 'center',
          });
        } */
      }

      // (debug guide)
      // doc.save().strokeColor('#eeeeee').lineWidth(0.5)
      //   .rect(M, M, contentW, contentH).stroke().restore();
    }

    doc.end();
  } catch (err) {
    console.error('PDF preview error:', err);
    res.status(500).send('Failed to generate PDF');
  }
});

module.exports = router;
