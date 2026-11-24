import { useState, type ChangeEvent } from 'react';
import { exportBackup, importBackup } from '../../lib/storage';

/** Ekspor/impor cadangan progres JSON (F-09) — seluruhnya di sisi klien. */
export default function BackupControls() {
  const [message, setMessage] = useState('');
  const [tone, setTone] = useState<'ok' | 'danger' | undefined>(undefined);

  function handleExport() {
    try {
      const blob = new Blob([exportBackup()], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'mutulab-cadangan.json';
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      setTone('ok');
      setMessage('Berkas mutulab-cadangan.json berhasil diunduh. Simpan di tempat yang aman.');
    } catch {
      setTone('danger');
      setMessage('Ekspor gagal. Periksa izin unduhan browser Anda.');
    }
  }

  async function handleImport(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const raw = await file.text();
      const restored = importBackup(raw);
      if (!restored) {
        setTone('danger');
        setMessage('Berkas ditolak: format bukan cadangan MutuLab v1 yang valid. Progres Anda tidak berubah.');
      } else {
        setTone('ok');
        setMessage('Cadangan berhasil dipulihkan. Progres, bookmark, dan preferensi Mode Mengajar telah diperbarui.');
      }
    } catch {
      setTone('danger');
      setMessage('Berkas tidak dapat dibaca. Pastikan Anda memilih berkas .json.');
    } finally {
      e.target.value = '';
    }
  }

  return (
    <div className="bk-controls">
      <div className="bk-actions">
        <button type="button" className="btn btn-primary" onClick={handleExport}>Unduh cadangan JSON ↓</button>
        <label className="btn btn-ghost bk-import">
          Pilih berkas cadangan ↑
          <input type="file" accept="application/json,.json" onChange={handleImport} aria-label="Pilih berkas cadangan JSON" />
        </label>
      </div>
      {message && <p className="chip" data-tone={tone} role="status">{message}</p>}
      <p className="bk-schema text-soft">Skema: <code className="mono">mutulab.progress.v1</code> · divalidasi sebelum disimpan · tanpa pengiriman data ke server.</p>
    </div>
  );
}
