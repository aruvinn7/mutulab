import { useMemo, useState } from 'react';
import { fCritical } from '../../lib/calc-core';
import { defaultFmt } from '../ui/StatTable';

const DF1 = [1, 2, 3, 4, 5, 6, 8, 10, 12, 15, 20];
const DF2 = [1, 2, 3, 4, 5, 6, 8, 10, 12, 15, 20, 24, 30, 40, 60, 120, Number.POSITIVE_INFINITY];
const ALPHAS = [0.1, 0.05, 0.01];

/** Nilai kritis F dihitung saat runtime memakai fungsi calc-core yang sama dengan kalkulator. */
export default function FTable() {
  const [alpha, setAlpha] = useState(0.05);

  const table = useMemo(
    () => DF2.map((df2) => DF1.map((df1) => {
      try {
        const value = fCritical(alpha, df1, Number.isFinite(df2) ? df2 : 1e7);
        return Number.isFinite(value) ? defaultFmt(value) : '—';
      } catch {
        return '—';
      }
    })),
    [alpha],
  );

  return (
    <div className="f-table card">
      <div className="f-table-head">
        <div>
          <p className="eyebrow">Tabel F · hasil komputasi</p>
          <h3 className="serif">Nilai kritis F<sub>α; df₁, df₂</sub></h3>
        </div>
        <div className="f-alpha" role="group" aria-label="Pilih taraf signifikansi">
          {ALPHAS.map((a) => (
            <button
              type="button"
              key={a}
              className={`chip${a === alpha ? ' is-active' : ''}`}
              aria-pressed={a === alpha}
              onClick={() => setAlpha(a)}
            >
              α = {a.toLocaleString('id-ID')}
            </button>
          ))}
        </div>
      </div>
      <div className="table-scroll">
        <table className="data-table f-grid">
          <caption>Tolak H₀ bila F-hitung &gt; nilai pada tabel. Baris = df penyebut (df₂), kolom = df pembilang (df₁). ∞ memakai pendekatan df₂ = 10⁷.</caption>
          <thead>
            <tr>
              <th scope="col">df₂ \ df₁</th>
              {DF1.map((df1) => <th scope="col" key={df1}>{df1}</th>)}
            </tr>
          </thead>
          <tbody>
            {DF2.map((df2, row) => (
              <tr key={df2}>
                <th scope="row">{Number.isFinite(df2) ? df2 : '∞'}</th>
                {table[row].map((cell, col) => <td key={DF1[col]}>{cell}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="f-source text-soft">
        Sumber: <code className="mono">fCritical(alpha, df1, df2)</code> dari <code className="mono">src/lib/calc-core</code> — sama persis dengan mesin kalkulator, bukan tabel statis.
      </p>
    </div>
  );
}
