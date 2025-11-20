// src/QR/QrScanner.jsx
import * as React from "react";
import { BrowserMultiFormatReader } from "@zxing/browser";
import { BarcodeFormat, DecodeHintType } from "@zxing/library";

export default function QrScanner({
  active = false,
  onDetected,
  onClose,              // optional: called when we self-stop after a scan
  closeOnScan = true,   // default: stop camera after first successful detection
  className,
  style,
}) {
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

    const v = videoRef.current;
    if (v) {
      try { v.pause(); } catch {}
      v.srcObject = null;
    }
  }, []);

  React.useEffect(() => {
    cancelledRef.current = false;
    if (!active) { stopAll(); return; }

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
        video.setAttribute("playsinline", "true");
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
      hints.set(DecodeHintType.POSSIBLE_FORMATS, [BarcodeFormat.QR_CODE]);
      hints.set(DecodeHintType.TRY_HARDER, true);

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
      stopAll();
      const nativeOK = await startNative();
      if (!nativeOK) await startZXing();
    })();

    return () => { cancelledRef.current = true; stopAll(); };
  }, [active, closeOnScan, onDetected, onClose, stopAll]);

  return (
    <div className={className} style={style}>
      <video ref={videoRef} autoPlay muted playsInline style={{ width: "100%", display: "block", borderRadius: 8 }} />
      <canvas ref={canvasRef} style={{ display: "none" }} />
    </div>
  );
}
