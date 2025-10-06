// src/PostActivation/QrScannerDialog.jsx
import React from "react";
import { Dialog, DialogContent } from "@mui/material";
// ZXing (fallback for iOS/Safari and where BarcodeDetector isn't available)
import { BrowserMultiFormatReader } from "@zxing/browser";
import { BarcodeFormat, DecodeHintType } from "@zxing/library";

/**
 * Props:
 *  - open        : boolean
 *  - onClose     : () => void
 *  - onDetected  : (text: string) => void
 *  - closeOnScan : boolean (optional, default = false) -> auto-close dialog after a successful scan
 */
export default function QrScannerDialog({ open, onClose, onDetected, closeOnScan = false }) {
  const videoRef = React.useRef(null);
  const canvasRef = React.useRef(null);

  const streamRef = React.useRef(null);     // MediaStream we opened (native path)
  const rafRef = React.useRef(0);           // requestAnimationFrame id (native path)
  const zxingControlsRef = React.useRef(null); // ZXing controls (fallback path)
  const cancelledRef = React.useRef(false);

  const stopAll = React.useCallback(() => {
    // Stop native loop
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = 0;
    }
    // Stop ZXing
    try { zxingControlsRef.current?.stop?.(); } catch {}
    zxingControlsRef.current = null;

    // Stop camera tracks
    const s = streamRef.current;
    if (s && typeof s.getTracks === "function") {
      try { s.getTracks().forEach((t) => t.stop()); } catch {}
    }
    streamRef.current = null;

    // Detach video
    if (videoRef.current) {
      try { videoRef.current.pause(); } catch {}
      videoRef.current.srcObject = null;
    }
  }, []);

  React.useEffect(() => {
    cancelledRef.current = false;
    if (!open) return;

    // Try native BarcodeDetector first (fast on Chrome/Android and some desktops).
    const startNative = async () => {
      if (!("BarcodeDetector" in window)) return false;

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: false,
          video: { facingMode: { ideal: "environment" }, width: { ideal: 1920 } },
        });
        if (cancelledRef.current) {
          stream.getTracks().forEach((t) => t.stop());
          return false;
        }
        streamRef.current = stream;

        const video = videoRef.current;
        video.setAttribute("playsinline", "true"); // iOS Safari
        video.muted = true;
        video.autoplay = true;
        video.srcObject = stream;

        // Wait for metadata to ensure videoWidth/videoHeight are set
        await new Promise((resolve) => {
          if (video.readyState >= 1) return resolve();
          const onMeta = () => { video.removeEventListener("loadedmetadata", onMeta); resolve(); };
          video.addEventListener("loadedmetadata", onMeta);
        });
        try { await video.play(); } catch {}

        const detector = new window.BarcodeDetector({ formats: ["qr_code"] });

        const tick = async () => {
          if (cancelledRef.current) return;

          const v = videoRef.current;
          const c = canvasRef.current;
          if (!v || !c || v.readyState < 2) {
            rafRef.current = requestAnimationFrame(tick);
            return;
          }

          // Draw current frame to canvas (helps stability across devices)
          c.width = v.videoWidth || 1280;
          c.height = v.videoHeight || 720;
          const ctx = c.getContext("2d", { willReadFrequently: true });
          ctx.drawImage(v, 0, 0, c.width, c.height);

          try {
            const results = await detector.detect(c);
            if (results && results.length) {
              const value = results[0]?.rawValue || "";
              if (value) {
                try { onDetected?.(value); } finally {
                  if (closeOnScan) { stopAll(); onClose?.(); return; }
                }
              }
            }
          } catch {
            // ignore frame errors
          }

          rafRef.current = requestAnimationFrame(tick);
        };

        rafRef.current = requestAnimationFrame(tick);
        return true;
      } catch {
        // Permission issue or unsupported — fall back
        return false;
      }
    };

    const startZXing = async () => {
      try {
        const reader = new BrowserMultiFormatReader();
        const hints = new Map();
        // Very important: tell ZXing we only want QR (much faster & more reliable)
        hints.set(DecodeHintType.POSSIBLE_FORMATS, [BarcodeFormat.QR_CODE]);
        hints.set(DecodeHintType.TRY_HARDER, true);
        reader.setHints(hints);

        const controls = await reader.decodeFromConstraints(
          {
            audio: false,
            video: {
              facingMode: { ideal: "environment" },
              width: { ideal: 1920 }, // more pixels -> clearer modules
            },
          },
          videoRef.current,
          (result, err, ctl) => {
            if (cancelledRef.current) return;
            if (result) {
              const value = result.getText ? result.getText() : String(result?.text || "");
              if (value) {
                try { onDetected?.(value); } finally {
                  if (closeOnScan) { try { ctl.stop(); } catch {} onClose?.(); }
                }
              }
            }
          }
        );

        zxingControlsRef.current = controls;
      } catch (e) {
        // If even ZXing fails to start, close the dialog to avoid a stuck UI
        console.error("ZXing start failed:", e);
        onClose?.();
      }
    };

    (async () => {
      stopAll(); // just in case
      const ok = await startNative();
      if (!ok) await startZXing();
    })();

    return () => { cancelledRef.current = true; stopAll(); };
  }, [open, closeOnScan, onClose, onDetected, stopAll]);

  return (
    <Dialog
      open={open}
      onClose={() => { stopAll(); onClose?.(); }}
      fullWidth
      maxWidth="xs"
    >
      <DialogContent sx={{ p: 0 }}>
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          style={{ width: "100%", height: "100%", display: "block", borderRadius: 8 }}
        />
        {/* hidden canvas used by the native path */}
        <canvas ref={canvasRef} style={{ display: "none" }} />
      </DialogContent>
    </Dialog>
  );
}

/* Utility: super-light iOS check if you ever need it elsewhere
function isIOS() {
  if (typeof navigator === "undefined") return false;
  return /iPad|iPhone|iPod/.test(navigator.userAgent) || 
         (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
}
*/
