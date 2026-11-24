import { useState } from 'react';

interface ArrayDef {
  id: string;
  name: string;
  levels: number;
  columns: number;
  rows: number[][];
  catatan: string;
}

const ARRAYS: ArrayDef[] = [
  {
    id: 'L4', name: 'L4 (2³)', levels: 2, columns: 3,
    rows: [
      [1, 1, 1], [1, 2, 2], [2, 1, 2], [2, 2, 1],
    ],
    catatan: 'Empat percobaan untuk tiga faktor dua level. Cocok untuk penyaringan awal; interaksi tidak dapat dipisahkan.',
  },
  {
    id: 'L8', name: 'L8 (2⁷)', levels: 2, columns: 7,
    rows: [
      [1, 1, 1, 1, 1, 1, 1], [1, 1, 1, 2, 2, 2, 2],
      [1, 2, 2, 1, 1, 2, 2], [1, 2, 2, 2, 2, 1, 1],
      [2, 1, 2, 1, 2, 1, 2], [2, 1, 2, 2, 1, 2, 1],
      [2, 2, 1, 1, 2, 2, 1], [2, 2, 1, 2, 1, 1, 2],
    ],
    catatan: 'Delapan percobaan, tujuh kolom dua level. Kolom kosong dapat dipakai untuk estimasi interaksi atau galat.',
  },
  {
    id: 'L9', name: 'L9 (3⁴)', levels: 3, columns: 4,
    rows: [
      [1, 1, 1, 1], [1, 2, 2, 2], [1, 3, 3, 3],
      [2, 1, 2, 3], [2, 2, 3, 1], [2, 3, 1, 2],
      [3, 1, 3, 2], [3, 2, 1, 3], [3, 3, 2, 1],
    ],
    catatan: 'Sembilan percobaan untuk empat faktor tiga level. Keseimbangan tiap level muncul 3 kali per kolom.',
  },
];

/** Tabel Orthogonal Array L4, L8, L9 (F-10). */
export default function OrthogonalArrays() {
  const [active, setActive] = useState(0);
  const oa = ARRAYS[active];

  return (
    <div className="oa-card card">
      <div className="oa-head">
        <div>
          <p className="eyebrow">Orthogonal Array</p>
          <h3 className="serif">Matriks L4 · L8 · L9</h3>
        </div>
        <div className="oa-tabs" role="group" aria-label="Pilih orthogonal array">
          {ARRAYS.map((a, i) => (
            <button
              type="button"
              key={a.id}
              className={`chip${i === active ? ' is-active' : ''}`}
              aria-pressed={i === active}
              onClick={() => setActive(i)}
            >
              {a.name}
            </button>
          ))}
        </div>
      </div>
      <div className="table-scroll">
        <table className="data-table oa-grid">
          <caption>{oa.name}: {oa.rows.length} baris percobaan, {oa.columns} kolom faktor, {oa.levels} level per faktor.</caption>
          <thead>
            <tr>
              <th scope="col">Baris</th>
              {Array.from({ length: oa.columns }, (_, i) => <th scope="col" key={i}>Kolom {i + 1}</th>)}
            </tr>
          </thead>
          <tbody>
            {oa.rows.map((row, r) => (
              <tr key={r}>
                <th scope="row">{r + 1}</th>
                {row.map((level, c) => <td key={c}>{level}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="oa-note text-soft">{oa.catatan}</p>
    </div>
  );
}
