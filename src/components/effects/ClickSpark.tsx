/**
 * Diadaptasi dari React Bits "ClickSpark" (MIT, David Haz).
 * https://reactbits.dev  ·  spark halus saat klik, canvas mandiri, tanpa dependency.
 * Dimatikan otomatis pada Mode Mengajar dan prefers-reduced-motion.
 */
import { useEffect, useRef } from 'react';

interface Spark {
  angle: number;
  reach: number;
  scale: number;
  life: number;
  color: string;
}
interface Burst {
  x: number;
  y: number;
  start: number;
  sparks: Spark[];
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  ratio: number;
  left: number;
  top: number;
}

const EASE_OUT = (t: number) => 1 - Math.pow(1 - t, 3);
const COLORS = ['#2F6BFF', '#7DB36A', '#ffffff'];
const MAX_BURSTS = 12;

export default function ClickSpark() {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const burstLayer = document.createElement('div');
    burstLayer.setAttribute('aria-hidden', 'true');
    Object.assign(burstLayer.style, {
      position: 'fixed', inset: '0', zIndex: '90', pointerEvents: 'none', overflow: 'hidden',
    });
    document.body.appendChild(burstLayer);

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const bursts: Burst[] = [];
    let raf = 0;

    const frame = (now: number) => {
      raf = 0;
      for (const burst of [...bursts]) {
        const elapsed = now - burst.start;
        const ctx = burst.ctx;
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.clearRect(0, 0, burst.canvas.width, burst.canvas.height);
        ctx.setTransform(burst.ratio, 0, 0, burst.ratio, -burst.left * burst.ratio, -burst.top * burst.ratio);
        let alive = false;
        for (const spark of burst.sparks) {
          const life = reduced ? 320 : 520 * spark.life;
          const p = elapsed / life;
          if (p >= 1) continue;
          alive = true;
          const e = reduced ? 0.55 : EASE_OUT(p);
          const distance = 26 * spark.reach * e;
          const x = burst.x + Math.cos(spark.angle) * distance;
          const y = burst.y + Math.sin(spark.angle) * distance;
          const fade = reduced ? 1 - p : 1 - Math.pow(p, 2);
          ctx.globalAlpha = Math.max(0, fade);
          ctx.strokeStyle = spark.color;
          ctx.lineWidth = 2 * spark.scale;
          ctx.lineCap = 'round';
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(x + Math.cos(spark.angle) * (reduced ? 3 : Math.max(0.01, 11 * (1 - p))), y + Math.sin(spark.angle) * (reduced ? 3 : Math.max(0.01, 11 * (1 - p))));
          ctx.stroke();
        }
        ctx.globalAlpha = 1;
        if (!alive) {
          burst.canvas.remove();
          bursts.splice(bursts.indexOf(burst), 1);
        }
      }
      if (bursts.length) raf = requestAnimationFrame(frame);
    };

    const spawn = (clientX: number, clientY: number) => {
      const reach = 46;
      const box = {
        left: Math.max(clientX - reach, 0), top: Math.max(clientY - reach, 0),
        right: Math.min(clientX + reach, window.innerWidth), bottom: Math.min(clientY + reach, window.innerHeight),
      };
      if (box.right - box.left < 1 || box.bottom - box.top < 1) return;
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      const canvas = document.createElement('canvas');
      canvas.width = Math.ceil((box.right - box.left) * ratio);
      canvas.height = Math.ceil((box.bottom - box.top) * ratio);
      Object.assign(canvas.style, {
        position: 'absolute', left: `${box.left}px`, top: `${box.top}px`,
        width: `${box.right - box.left}px`, height: `${box.bottom - box.top}px`, pointerEvents: 'none',
      });
      burstLayer.appendChild(canvas);
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      const sparks: Spark[] = Array.from({ length: 8 }, (_, i) => ({
        angle: (i / 8) * Math.PI * 2 + (Math.random() - 0.5) * 0.35,
        reach: 1 + (Math.random() - 0.5) * 0.5,
        scale: 1 + (Math.random() - 0.5) * 0.5,
        life: 1 + (Math.random() - 0.5) * 0.3,
        color: COLORS[i % COLORS.length],
      }));
      bursts.push({ x: clientX, y: clientY, start: performance.now(), sparks, canvas, ctx, ratio, left: box.left, top: box.top });
      while (bursts.length > MAX_BURSTS) bursts.shift()?.canvas.remove();
      if (!raf) raf = requestAnimationFrame(frame);
    };

    const onClick = (event: MouseEvent) => {
      if (document.documentElement.dataset.teaching === 'true') return;
      if (event.detail === 0) return; // keyboard-initiated: tidak beranimasi
      const target = event.target as Element | null;
      if (target?.closest('input, textarea, select, [contenteditable="true"]')) return;
      spawn(event.clientX, event.clientY);
    };
    document.addEventListener('click', onClick);

    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener('click', onClick);
      burstLayer.remove();
    };
  }, []);

  return <div ref={hostRef} aria-hidden="true" />;
}
