/**
 * Diadaptasi dari Aceternity UI "Text Generate Effect" (MIT, Manu Arora).
 * Implementasi CSS stagger (tanpa `motion`) agar bundel tetap kecil dan
 * output SSR identik dengan hidrasi klien.
 */
export interface RevealLine {
  text: string;
  italic?: boolean;
}

interface Props {
  lines: RevealLine[];
  id?: string;
  className?: string;
}

export default function TextReveal({ lines, id, className = '' }: Props) {
  let wordIndex = 0;
  const label = lines.map((l) => l.text).join(' ');

  return (
    <h1 id={id} className={`serif hero-title hero-title--reveal ${className}`} aria-label={label}>
      {lines.map((line, li) => (
        <span key={li} className={`title-line ${line.italic ? 'title-em' : ''}`} aria-hidden="true">
          {line.text.split(' ').map((word, wi) => {
            const delay = wordIndex++ * 70 + 120;
            return (
              <span className="reveal-word" key={wi} style={{ animationDelay: `${delay}ms` }}>
                {word}{wi < line.text.split(' ').length - 1 ? '\u00a0' : ''}
              </span>
            );
          })}
        </span>
      ))}
    </h1>
  );
}
