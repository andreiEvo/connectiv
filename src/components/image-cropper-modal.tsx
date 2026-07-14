"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";

type Shape = "circle" | "banner";

const VIEWPORT: Record<Shape, { width: number; height: number }> = {
  circle: { width: 280, height: 280 },
  banner: { width: 320, height: 80 },
};

const OUTPUT: Record<Shape, { width: number; height: number }> = {
  circle: { width: 480, height: 480 },
  banner: { width: 1600, height: 400 },
};

export function ImageCropperModal({
  file,
  shape,
  onCancel,
  onCropped,
}: {
  file: File;
  shape: Shape;
  onCancel: () => void;
  onCropped: (blob: Blob) => void;
}) {
  const imgRef = useRef<HTMLImageElement>(null);
  const [imgUrl, setImgUrl] = useState<string | null>(null);
  const [natural, setNatural] = useState({ width: 0, height: 0 });
  const [zoom, setZoom] = useState(1);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const dragRef = useRef<{ startX: number; startY: number; posX: number; posY: number } | null>(
    null,
  );
  const [busy, setBusy] = useState(false);

  const vp = VIEWPORT[shape];

  useEffect(() => {
    const url = URL.createObjectURL(file);
    setImgUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  function handleImgLoad() {
    const img = imgRef.current;
    if (!img) return;
    const w = img.naturalWidth;
    const h = img.naturalHeight;
    setNatural({ width: w, height: h });
    const baseScale = Math.max(vp.width / w, vp.height / h);
    const displayW = w * baseScale;
    const displayH = h * baseScale;
    setPos({ x: (vp.width - displayW) / 2, y: (vp.height - displayH) / 2 });
    setZoom(1);
  }

  function effectiveScale() {
    if (!natural.width) return 1;
    const baseScale = Math.max(vp.width / natural.width, vp.height / natural.height);
    return baseScale * zoom;
  }

  function clamp(x: number, y: number, scale: number) {
    const displayW = natural.width * scale;
    const displayH = natural.height * scale;
    return {
      x: Math.min(0, Math.max(vp.width - displayW, x)),
      y: Math.min(0, Math.max(vp.height - displayH, y)),
    };
  }

  function onPointerDown(e: React.PointerEvent) {
    dragRef.current = { startX: e.clientX, startY: e.clientY, posX: pos.x, posY: pos.y };

    function handleMove(ev: PointerEvent) {
      if (!dragRef.current) return;
      const dx = ev.clientX - dragRef.current.startX;
      const dy = ev.clientY - dragRef.current.startY;
      const scale = effectiveScale();
      setPos(clamp(dragRef.current.posX + dx, dragRef.current.posY + dy, scale));
    }
    function handleUp() {
      dragRef.current = null;
      window.removeEventListener("pointermove", handleMove);
      window.removeEventListener("pointerup", handleUp);
    }
    window.addEventListener("pointermove", handleMove);
    window.addEventListener("pointerup", handleUp);
  }

  function handleZoomChange(next: number) {
    const prevScale = effectiveScale();
    setZoom(next);
    const nextBaseScale = Math.max(vp.width / natural.width, vp.height / natural.height);
    const nextScale = nextBaseScale * next;
    // keep the viewport's visual center anchored while zooming
    const cx = vp.width / 2;
    const cy = vp.height / 2;
    const ratio = nextScale / prevScale;
    const newX = cx - (cx - pos.x) * ratio;
    const newY = cy - (cy - pos.y) * ratio;
    setPos(clamp(newX, newY, nextScale));
  }

  async function handleConfirm() {
    const img = imgRef.current;
    if (!img || !natural.width) return;
    setBusy(true);

    const scale = effectiveScale();
    const sx = -pos.x / scale;
    const sy = -pos.y / scale;
    const sWidth = vp.width / scale;
    const sHeight = vp.height / scale;

    const out = OUTPUT[shape];
    const canvas = document.createElement("canvas");
    canvas.width = out.width;
    canvas.height = out.height;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      setBusy(false);
      return;
    }
    ctx.drawImage(img, sx, sy, sWidth, sHeight, 0, 0, out.width, out.height);

    canvas.toBlob(
      (blob) => {
        setBusy(false);
        if (blob) onCropped(blob);
      },
      "image/jpeg",
      0.92,
    );
  }

  if (typeof document === "undefined") return null;

  return createPortal(
    <div className="fixed inset-0 z-[200] bg-black/80 flex items-center justify-center p-4">
      <div className="w-full max-w-sm rounded-2xl border border-border-strong bg-surface p-5 shadow-2xl shadow-black/50">
        <p className="font-display text-base font-semibold mb-1">
          {shape === "circle" ? "Repoziționează poza" : "Repoziționează fundalul"}
        </p>
        <p className="text-sm text-text-muted mb-4">
          Trage imaginea ca s-o centrezi, apoi folosește glisorul pentru zoom.
        </p>

        <div
          className="relative mx-auto overflow-hidden bg-black touch-none select-none cursor-grab active:cursor-grabbing"
          style={{
            width: vp.width,
            height: vp.height,
            borderRadius: shape === "circle" ? "9999px" : "12px",
          }}
          onPointerDown={onPointerDown}
        >
          {imgUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              ref={imgRef}
              src={imgUrl}
              alt=""
              onLoad={handleImgLoad}
              draggable={false}
              className="absolute pointer-events-none"
              style={{
                width: natural.width * effectiveScale(),
                height: natural.height * effectiveScale(),
                left: pos.x,
                top: pos.y,
                maxWidth: "none",
              }}
            />
          )}
        </div>

        <div className="flex items-center gap-3 mt-4">
          <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4 text-text-muted shrink-0">
            <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.6" />
            <path d="M20 20l-3.5-3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
          <input
            type="range"
            min={1}
            max={3}
            step={0.01}
            value={zoom}
            onChange={(e) => handleZoomChange(Number(e.target.value))}
            className={cn("flex-1 accent-accent")}
          />
        </div>

        <div className="flex gap-2 mt-5">
          <Button variant="secondary" className="flex-1" onClick={onCancel} disabled={busy}>
            Renunță
          </Button>
          <Button className="flex-1" onClick={handleConfirm} disabled={busy || !natural.width}>
            {busy ? "Se procesează…" : "Salvează"}
          </Button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
