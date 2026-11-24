import { useState, type KeyboardEvent } from 'react';
import Formula from '../ui/Formula';

interface FormulaItem {
  label: string;
  tex: string;
  note?: string;
}

interface Tab {
  id: string;
  label: string;
  ringkas: string;
  items: FormulaItem[];
}

const TABS: Tab[] = [
  {
    id: 'm1', label: 'Fondasi', ringkas: 'Tiga prinsip Fisher: replikasi, randomisasi, blocking.',
    items: [
      { label: 'Dekomposisi variasi', tex: String.raw`SS_{\text{Total}} = SS_{\text{Perlakuan}} + SS_{\text{Error}}`, note: 'Variasi diamati = sinyal + galat.' },
      { label: 'Prinsip Fisher', tex: String.raw`\text{Replikasi} \;\rightarrow\; \text{Randomisasi} \;\rightarrow\; \text{Blocking}`, note: 'Replikasi mengestimasi galat, randomisasi menetralkan bias, blocking menyerap faktor pengganggu.' },
      { label: 'Kesalahan umum OFAT', tex: String.raw`y \neq f(x_1) + f(x_2) \quad \text{bila ada interaksi}` },
    ],
  },
  {
    id: 'm2', label: 'CRD · ANOVA', ringkas: 'Satu faktor, beberapa level, ulangan diacak.',
    items: [
      { label: 'SS Perlakuan', tex: String.raw`SS_{\text{Tr}} = n\sum_{i=1}^{a}\left(\bar{y}_{i\cdot}-\bar{y}_{\cdot\cdot}\right)^2` },
      { label: 'SS Error', tex: String.raw`SS_E = \sum_{i=1}^{a}\sum_{j=1}^{n}\left(y_{ij}-\bar{y}_{i\cdot}\right)^2` },
      { label: 'Derajat bebas', tex: String.raw`df_{\text{Tr}}=a-1,\qquad df_E=a(n-1),\qquad df_{\text{Total}}=an-1` },
      { label: 'Statistik F', tex: String.raw`F = \frac{SS_{\text{Tr}}/(a-1)}{SS_E/[a(n-1)]}` },
      { label: 'Fisher LSD', tex: String.raw`LSD = t_{\alpha/2,\,df_E}\sqrt{\frac{2\,MS_E}{n}}` },
    ],
  },
  {
    id: 'm3', label: 'RCBD', ringkas: 'Blok menyerap variasi bahan, operator, atau shift.',
    items: [
      { label: 'Model aditif', tex: String.raw`y_{ij} = \mu + \tau_i + \beta_j + \varepsilon_{ij}` },
      { label: 'SS Blok', tex: String.raw`SS_{\text{Blok}} = \frac{1}{a}\sum_{j=1}^{b}B_j^2 - \frac{G^2}{ab}` },
      { label: 'SS Error', tex: String.raw`SS_E = SS_{\text{Total}} - SS_{\text{Tr}} - SS_{\text{Blok}}` },
      { label: 'Derajat bebas', tex: String.raw`df_{\text{Tr}}=a-1,\quad df_{\text{Blok}}=b-1,\quad df_E=(a-1)(b-1)` },
      { label: 'Uji F perlakuan', tex: String.raw`F = \frac{MS_{\text{Tr}}}{MS_E}` },
    ],
  },
  {
    id: 'm4', label: 'Faktorial 2ᵏ', ringkas: 'Efek utama dan interaksi dari kontras bertanda ±1.',
    items: [
      { label: 'Efek utama', tex: String.raw`\text{Efek}_A = \frac{1}{2^{k-1}}\sum (\pm\bar{y}_{\cdot})`, note: 'Kontras memakai rata-rata tiap sel; untuk kontras total C, Efek = 2C/N.' },
      { label: 'SS efek', tex: String.raw`SS_A = \frac{(\text{kontras total}_A)^2}{N}`, note: 'N = 2ᵏ × replikasi; kontras total = replikasi × kontras rata-rata sel.' },
      { label: 'Kode ternormalisasi', tex: String.raw`x_i = \frac{X_i - (X_{i,\text{tinggi}}+X_{i,\text{rendah}})/2}{(X_{i,\text{tinggi}}-X_{i,\text{rendah}})/2}` },
      { label: 'Model 2²', tex: String.raw`\hat{y} = \beta_0 + \beta_1 x_1 + \beta_2 x_2 + \beta_{12}x_1x_2,\qquad \beta_j = \tfrac12\,\text{Efek}_j` },
      { label: 'Syarat uji F', tex: String.raw`n \ge 2 \quad \text{(galat murni harus tersedia)}` },
    ],
  },
  {
    id: 'm5', label: 'Taguchi', ringkas: 'Optimasi parameter agar tangguh terhadap noise.',
    items: [
      { label: 'Smaller is better', tex: String.raw`\eta = -10\log_{10}\!\left(\frac{1}{n}\sum_{i=1}^{n} y_i^2\right)` },
      { label: 'Larger is better', tex: String.raw`\eta = -10\log_{10}\!\left(\frac{1}{n}\sum_{i=1}^{n}\frac{1}{y_i^2}\right)` },
      { label: 'Nominal is better', tex: String.raw`\eta = 10\log_{10}\!\left(\frac{\bar{y}^2}{s^2}\right)` },
      { label: 'Fungsi kerugian', tex: String.raw`L(y) = k(y-T)^2,\qquad k = \frac{\text{biaya kegagalan}}{\Delta^2}` },
      { label: 'Delta & peringkat', tex: String.raw`\Delta_f = \max_j(\bar{\eta}_{fj}) - \min_j(\bar{\eta}_{fj})` },
      { label: 'Prediksi optimum', tex: String.raw`\hat{\eta}_{\text{opt}} = \bar{\eta} + \sum_f\left(\bar{\eta}_{f,\text{opt}} - \bar{\eta}\right)` },
    ],
  },
  {
    id: 'm0', label: 'Sampling', ringkas: 'Keputusan terima/tolak lot berdasarkan sampel.',
    items: [
      { label: 'Peluang terima (binomial)', tex: String.raw`P_a = \sum_{d=0}^{c}\binom{n}{d}p^d(1-p)^{n-d}` },
      { label: 'Peluang terima (Poisson)', tex: String.raw`P_a = \sum_{d=0}^{c}\frac{e^{-np}(np)^d}{d!}` },
      { label: 'AOQ', tex: String.raw`AOQ \approx P_a\,p\,\frac{N-n}{N}` },
      { label: 'ATI', tex: String.raw`ATI = n + (1-P_a)N` },
      { label: 'Risiko', tex: String.raw`\alpha = 1-P_a(\text{AQL}),\qquad \beta = P_a(\text{LTPD})` },
    ],
  },
];

/** Tab rumus per modul dengan render KaTeX memakai komponen Formula. */
export default function FormulaTabs() {
  const [active, setActive] = useState(0);
  const tab = TABS[active];

  function onKeyDown(e: KeyboardEvent<HTMLButtonElement>, index: number) {
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
      e.preventDefault();
      const next = e.key === 'ArrowRight' ? (index + 1) % TABS.length : (index - 1 + TABS.length) % TABS.length;
      setActive(next);
      document.getElementById(`formula-tab-${TABS[next].id}`)?.focus();
    }
  }

  return (
    <div className="ft-tabs">
      <div className="ft-tablist" role="tablist" aria-label="Pilih modul rumus">
        {TABS.map((t, i) => (
          <button
            key={t.id}
            type="button"
            id={`formula-tab-${t.id}`}
            role="tab"
            aria-selected={i === active}
            aria-controls="formula-panel"
            tabIndex={i === active ? 0 : -1}
            className={`chip ft-tab${i === active ? ' is-active' : ''}`}
            onClick={() => setActive(i)}
            onKeyDown={(e) => onKeyDown(e, i)}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div className="ft-panel card" role="tabpanel" id="formula-panel" aria-labelledby={`formula-tab-${tab.id}`}>
        <p className="text-soft ft-ringkas">{tab.ringkas}</p>
        <div className="ft-formulas">
          {tab.items.map((item) => (
            <div className="ft-formula" key={item.label}>
              <p className="eyebrow">{item.label}</p>
              <Formula tex={item.tex} display />
              {item.note && <p className="text-soft ft-note">{item.note}</p>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
