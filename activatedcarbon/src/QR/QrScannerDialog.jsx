// src/PostActivation/QrScannerDialog.jsx
import React,{useEffect} from "react";
import { Dialog, DialogContent } from "@mui/material";
import { BrowserMultiFormatReader } from "@zxing/browser";
import { BarcodeFormat, DecodeHintType } from "@zxing/library";

/**
 * Props:
 *  - open        : boolean
 *  - onClose     : () => void
 *  - onDetected  : (text: string) => void
 *  - closeOnScan : boolean (default: true) — auto-close after ANY detection
 */
export default function QrScannerDialog({ open, onClose, onDetected, closeOnScan = true,
  closeOnBackdrop = true,         // keep normal behavior
  closeOnEscape = true,           // keep normal behavior
  ignoreBackdropOnMount = true,   // <-- key: prevents the mount flicker
 }) {
    const armedRef = React.useRef(false);
    React.useEffect(() => {
      if (open) {
        armedRef.current = false;
        const t = setTimeout(() => { armedRef.current = true; }, 150);
        return () => clearTimeout(t);
      } else {
        armedRef.current = false;
      }
    }, [open]);
  const videoRef = React.useRef(null);
  const canvasRef = React.useRef(null);

  const streamRef = React.useRef(null);
  const rafRef = React.useRef(0);
  const zxingControlsRef = React.useRef(null);
  const cancelledRef = React.useRef(false);

  const stopAll = React.useCallback(() => {
    if (rafRef.current) { cancelAnimationFrame(rafRef.current); rafRef.current = 0; }
    try { zxingControlsRef.current?.stop?.(); } catch {}
    zxingControlsRef.current = null;

    const s = streamRef.current;
    if (s && s.getTracks) { try { s.getTracks().forEach(t => t.stop()); } catch {} }
    streamRef.current = null;

    if (videoRef.current) {
      try { videoRef.current.pause(); } catch {}
      videoRef.current.srcObject = null;
    }
  }, []);

  React.useEffect(() => {
    cancelledRef.current = false;
    if (!open) return;

    const startNative = async () => {
      if (!("BarcodeDetector" in window)) return false;
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: false,
          video: { facingMode: { ideal: "environment" }, width: { ideal: 1920 } },
        });
        if (cancelledRef.current) { stream.getTracks().forEach(t => t.stop()); return false; }
        streamRef.current = stream;

        const video = videoRef.current;
        video.setAttribute("playsinline", "true"); // iOS
        video.muted = true; video.autoplay = true;
        video.srcObject = stream;

        await new Promise((resolve) => {
          if (video.readyState >= 1) return resolve();
          const onMeta = () => { video.removeEventListener("loadedmetadata", onMeta); resolve(); };
          video.addEventListener("loadedmetadata", onMeta);
        });
        try { await video.play(); } catch {}

        const detector = new window.BarcodeDetector({ formats: ["qr_code"] });

        const tick = async () => {
          if (cancelledRef.current) return;
          const v = videoRef.current, c = canvasRef.current;
          if (!v || !c || v.readyState < 2) {
            rafRef.current = requestAnimationFrame(tick);
            return;
          }
          c.width = v.videoWidth || 1280;
          c.height = v.videoHeight || 720;
          const ctx = c.getContext("2d", { willReadFrequently: true });
          ctx.drawImage(v, 0, 0, c.width, c.height);

          try {
            const results = await detector.detect(c);
            if (results?.length) {
              const value = results[0]?.rawValue || "";
              console.log("detected",value);
              if (value) {
                try { onDetected?.(value); } finally {
                  if (closeOnScan) { stopAll(); onClose?.(); }
                }
                return;
              }
            }
          } catch {}
          rafRef.current = requestAnimationFrame(tick);
        };
        rafRef.current = requestAnimationFrame(tick);
        return true;
      } catch {
        return false;
      }
    };

    const startZXing = async () => {
      const reader = new BrowserMultiFormatReader();
      const hints = new Map();
      hints.set(DecodeHintType.POSSIBLE_FORMATS, [BarcodeFormat.QR_CODE]); // QR only
      hints.set(DecodeHintType.TRY_HARDER, true);
      reader.setHints(hints);

      const controls = await reader.decodeFromConstraints(
        {
          audio: false,
          video: { facingMode: { ideal: "environment" }, width: { ideal: 1920 } },
        },
        videoRef.current,
        (result, _err, ctl) => {
          if (cancelledRef.current) return;
          if (result) {
            const value = result.getText?.() ?? String(result?.text || "");
            if (value) {
              try { onDetected?.(value); } finally {
                if (closeOnScan) { try { ctl.stop(); } catch {} onClose?.(); }
              }
            }
          }
        }
      );
      zxingControlsRef.current = controls;
    };

    (async () => {
      stopAll(); // clean slate
      const nativeOK = await startNative();
      if (!nativeOK) await startZXing();
    })();

    return () => { cancelledRef.current = true; stopAll(); };
  }, [open, closeOnScan, onClose, onDetected, stopAll]);

  return (
     <Dialog
       open={open}
       onClose={(_e, reason) => {
         if (reason === 'backdropClick') {
           if (ignoreBackdropOnMount && !armedRef.current) return; // ignore initial click-away
           if (!closeOnBackdrop) return;
         }
         if (reason === 'escapeKeyDown' && !closeOnEscape) return;
         stopAll();
         onClose?.();
       }}
       keepMounted
       disableRestoreFocus
       disableAutoFocus
       fullWidth
       maxWidth="xs"
     >
      <DialogContent sx={{ p: 0 }}>
        <video ref={videoRef} autoPlay muted playsInline style={{ width: "100%", display: "block", borderRadius: 8 }} />
        <canvas ref={canvasRef} style={{ display: "none" }} />
      </DialogContent>
    </Dialog>
  );
}
