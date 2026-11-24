/**
 * Diadaptasi dari React Bits "SpotlightCard" (MIT, David Haz).
 * Versi ringkas: spotlight mengikuti pointer memakai CSS custom properties,
 * tanpa requestAnimationFrame permanen. Fokus keyboard juga menyalakan cahaya.
 */
import { useRef, type ReactNode, type PointerEvent } from 'react';
import './spotlight-card.css';

interface Props {
  children: ReactNode;
  className?: string;
  color?: string;
  size?: number;
}

export default function SpotlightCard({ children, className = '', color = '99, 143, 255', size = 420 }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  const move = (e: PointerEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el || document.documentElement.dataset.teaching === 'true') return;
    const r = el.getBoundingClientRect();
    el.style.setProperty('--sx', `${e.clientX - r.left}px`);
    el.style.setProperty('--sy', `${e.clientY - r.top}px`);
    el.style.setProperty('--s-opacity', '1');
  };
  const leave = () => ref.current?.style.setProperty('--s-opacity', '0');

  return (
    <div
      ref={ref}
      className={`spotlight-card ${className}`}
      style={{ '--s-color': color, '--s-size': `${size}px` } as React.CSSProperties}
      onPointerMove={move}
      onPointerLeave={leave}
      onFocus={() => ref.current?.style.setProperty('--s-opacity', '1')}
      onBlur={leave}
    >
      <span className="spotlight-card__light" aria-hidden="true" />
      {children}
    </div>
  );
}
