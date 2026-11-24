import type { AnovaRow } from '../../lib/types';

interface Props {
  rows: AnovaRow[];
  caption?: string;
  decision?: { label: string; accepted: boolean };
  fmt?: (n: number) => string;
}

export const defaultFmt = (n: number): string => {
  if (!Number.isFinite(n)) return '—';
  if (n !== 0 && Math.abs(n) < 0.0001) return '<0,0001';
  return n.toLocaleString('id-ID', { minimumFractionDigits: 3, maximumFractionDigits: 4 });
};

export default function StatTable({ rows, caption, decision, fmt = defaultFmt }: Props) {
  return (
    <div className="stat-table-wrap card">
      {caption && <p className="table-caption">{caption}</p>}
      <div className="table-scroll">
        <table className="data-table">
          <thead>
            <tr><th>Sumber</th><th>SS</th><th>df</th><th>MS</th><th>F</th><th>p-value</th></tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.source}>
                <td>{row.source}{row.note && <small>{row.note}</small>}</td>
                <td>{fmt(row.ss)}</td>
                <td>{row.df}</td>
                <td>{fmt(row.ms)}</td>
                <td>{row.f === undefined ? '—' : fmt(row.f)}</td>
                <td>{row.p === undefined ? '—' : fmt(row.p)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {decision && (
        <div className="decision" data-tone={decision.accepted ? 'ok' : 'danger'}>
          <strong>{decision.label}</strong>
          <span>{decision.accepted ? 'Tidak cukup bukti untuk menolak H₀' : 'Tolak H₀ pada taraf signifikansi yang dipilih'}</span>
        </div>
      )}
    </div>
  );
}
