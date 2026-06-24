import { useState, useCallback, useRef } from "react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

// ─── Design tokens ──────────────────────────────────────────────────────────
const T = {
  bg: "#080d14",
  surface: "#0d1520",
  surfaceAlt: "#111d2c",
  border: "#1a2e44",
  borderGlow: "#1e3a52",
  text: "#dde8f5",
  muted: "#5a7a9a",
  accent: "#00c2d4",
  accentDim: "#003d45",
  green: "#00e5a0",
  greenDim: "#003d2a",
  amber: "#f5a623",
  amberDim: "#3d2a00",
  red: "#ff5f5f",
  redDim: "#3d1010",
  violet: "#a78bfa",
  violetDim: "#1e1040",
  cyan2: "#38bdf8",
};

// ─── Helpers ─────────────────────────────────────────────────────────────────
const fmt = (v) =>
  v == null
    ? "—"
    : Number(v).toLocaleString("pt-BR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });

const fmtPct = (v) => (v == null ? "—" : `${Number(v).toFixed(2)}%`);

const fmtBRL = (v) => (v == null ? "—" : `R$ ${fmt(v)}`);

// ─── Styles ──────────────────────────────────────────────────────────────────
const css = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    font-family: 'Inter', sans-serif;
    background: ${T.bg};
    color: ${T.text};
    min-height: 100vh;
  }

  .app { min-height: 100vh; display: flex; flex-direction: column; }

  /* ── Header ── */
  .header {
    display: flex; align-items: center; gap: 16px;
    padding: 18px 32px;
    border-bottom: 1px solid ${T.border};
    background: linear-gradient(90deg, #0a121e 0%, #0d1925 100%);
    position: sticky; top: 0; z-index: 50;
  }
  .logo-mark {
    width: 38px; height: 38px; border-radius: 10px;
    background: linear-gradient(135deg, ${T.accent} 0%, #0066ff 100%);
    display: flex; align-items: center; justify-content: center;
    font-weight: 700; font-size: 14px; color: #fff; letter-spacing: -0.5px;
    flex-shrink: 0;
  }
  .header-title { font-size: 17px; font-weight: 600; color: ${T.text}; }
  .header-sub { font-size: 12px; color: ${T.muted}; margin-top: 1px; }
  .header-right { margin-left: auto; display: flex; gap: 10px; align-items: center; }
  .badge {
    padding: 3px 10px; border-radius: 20px; font-size: 11px; font-weight: 500;
    border: 1px solid ${T.border}; color: ${T.muted}; background: ${T.surface};
  }
  .badge-live { border-color: ${T.accent}; color: ${T.accent}; background: ${T.accentDim}; }

  /* ── Main layout ── */
  .main { flex: 1; padding: 28px 32px; max-width: 1600px; margin: 0 auto; width: 100%; }

  /* ── Drop zone ── */
  .drop-zone {
    border: 2px dashed ${T.border};
    border-radius: 16px;
    padding: 56px 32px;
    text-align: center;
    cursor: pointer;
    transition: all 0.25s ease;
    background: ${T.surface};
    position: relative;
    overflow: hidden;
  }
  .drop-zone::before {
    content: '';
    position: absolute; inset: 0;
    background: radial-gradient(circle at 50% 0%, rgba(0,194,212,0.06) 0%, transparent 60%);
    pointer-events: none;
  }
  .drop-zone:hover, .drop-zone.drag-over {
    border-color: ${T.accent};
    background: linear-gradient(135deg, #0d1a22 0%, #0d1520 100%);
  }
  .drop-icon {
    width: 56px; height: 56px; border-radius: 14px;
    background: linear-gradient(135deg, ${T.accentDim} 0%, #001d33 100%);
    border: 1px solid ${T.borderGlow};
    display: flex; align-items: center; justify-content: center;
    margin: 0 auto 16px; font-size: 22px;
  }
  .drop-title { font-size: 18px; font-weight: 600; margin-bottom: 6px; }
  .drop-sub { font-size: 13px; color: ${T.muted}; }
  .drop-sub span { color: ${T.accent}; cursor: pointer; }
  .drop-hint { margin-top: 12px; font-size: 11px; color: ${T.muted}; }
  .file-list {
    display: flex; flex-wrap: wrap; gap: 8px; justify-content: center; margin-top: 20px;
  }
  .file-chip {
    display: flex; align-items: center; gap: 6px;
    padding: 5px 12px; border-radius: 20px;
    background: ${T.accentDim}; border: 1px solid ${T.accent};
    font-size: 12px; color: ${T.accent};
  }

  /* ── Btn ── */
  .btn {
    display: inline-flex; align-items: center; gap: 8px;
    padding: 10px 20px; border-radius: 10px; border: none;
    font-size: 13px; font-weight: 600; cursor: pointer;
    transition: all 0.2s ease; font-family: inherit;
  }
  .btn-primary {
    background: linear-gradient(135deg, ${T.accent} 0%, #0088cc 100%);
    color: #001a1f;
  }
  .btn-primary:hover { opacity: 0.88; transform: translateY(-1px); }
  .btn-primary:disabled { opacity: 0.4; cursor: not-allowed; transform: none; }
  .btn-ghost {
    background: ${T.surfaceAlt}; color: ${T.muted};
    border: 1px solid ${T.border};
  }
  .btn-ghost:hover { border-color: ${T.accent}; color: ${T.accent}; }

  /* ── Loading ── */
  .loading-bar {
    height: 3px; background: ${T.border}; border-radius: 3px;
    overflow: hidden; margin: 24px 0;
  }
  .loading-fill {
    height: 100%; background: linear-gradient(90deg, ${T.accent}, #0088ff, ${T.accent});
    background-size: 200% 100%;
    animation: shimmer 1.4s ease infinite;
    border-radius: 3px;
  }
  @keyframes shimmer {
    0% { background-position: -200% 0; }
    100% { background-position: 200% 0; }
  }

  /* ── KPI Grid ── */
  .kpi-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 14px; margin-bottom: 24px;
  }
  .kpi-card {
    background: ${T.surface};
    border: 1px solid ${T.border};
    border-radius: 14px; padding: 18px 20px;
    position: relative; overflow: hidden;
    transition: border-color 0.2s;
  }
  .kpi-card:hover { border-color: ${T.borderGlow}; }
  .kpi-glow {
    position: absolute; top: -20px; right: -20px;
    width: 80px; height: 80px; border-radius: 50%;
    opacity: 0.15; filter: blur(20px);
  }
  .kpi-label {
    font-size: 11px; font-weight: 500; text-transform: uppercase;
    letter-spacing: 0.8px; color: ${T.muted}; margin-bottom: 8px;
  }
  .kpi-value {
    font-size: 22px; font-weight: 700; line-height: 1.1;
    font-family: 'JetBrains Mono', monospace;
  }
  .kpi-sub {
    font-size: 11px; color: ${T.muted}; margin-top: 5px;
    display: flex; align-items: center; gap: 4px;
  }
  .kpi-sub .positive { color: ${T.green}; }
  .kpi-sub .negative { color: ${T.red}; }

  /* ── NF Header card ── */
  .nf-header {
    background: linear-gradient(135deg, #0d1825 0%, #0a1520 100%);
    border: 1px solid ${T.borderGlow};
    border-radius: 14px; padding: 20px 24px;
    margin-bottom: 24px;
    display: flex; flex-wrap: wrap; gap: 24px; align-items: center;
  }
  .nf-field { display: flex; flex-direction: column; gap: 3px; }
  .nf-field-label { font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.8px; color: ${T.muted}; }
  .nf-field-value { font-size: 14px; font-weight: 600; color: ${T.text}; font-family: 'JetBrains Mono', monospace; }
  .nf-field-value.big { font-size: 20px; color: ${T.accent}; }
  .nf-divider { width: 1px; height: 40px; background: ${T.border}; }

  /* ── Section header ── */
  .section-header {
    display: flex; align-items: center; gap: 10px;
    margin-bottom: 14px;
  }
  .section-title { font-size: 14px; font-weight: 600; color: ${T.text}; }
  .section-count {
    padding: 2px 8px; border-radius: 20px; font-size: 11px;
    background: ${T.surfaceAlt}; color: ${T.muted}; border: 1px solid ${T.border};
  }
  .section-line { flex: 1; height: 1px; background: ${T.border}; }

  /* ── Charts grid ── */
  .charts-grid {
    display: grid; grid-template-columns: 1fr 1fr 1fr;
    gap: 14px; margin-bottom: 24px;
  }
  @media (max-width: 1100px) { .charts-grid { grid-template-columns: 1fr 1fr; } }
  @media (max-width: 700px) { .charts-grid { grid-template-columns: 1fr; } }
  .chart-card {
    background: ${T.surface}; border: 1px solid ${T.border};
    border-radius: 14px; padding: 20px;
  }
  .chart-card.wide { grid-column: span 2; }
  @media (max-width: 1100px) { .chart-card.wide { grid-column: span 1; } }
  .chart-title { font-size: 12px; font-weight: 600; color: ${T.muted}; text-transform: uppercase; letter-spacing: 0.6px; margin-bottom: 16px; }

  /* ── Tax ring ── */
  .tax-ring-center { text-align: center; }
  .tax-legend { display: flex; flex-direction: column; gap: 8px; margin-top: 14px; }
  .tax-legend-item {
    display: flex; align-items: center; gap: 8px; font-size: 12px;
  }
  .tax-dot { width: 8px; height: 8px; border-radius: 2px; flex-shrink: 0; }
  .tax-legend-name { flex: 1; color: ${T.muted}; }
  .tax-legend-val { font-family: 'JetBrains Mono', monospace; font-size: 11px; }
  .tax-legend-pct { color: ${T.muted}; font-size: 11px; margin-left: 4px; }

  /* ── Table ── */
  .table-card {
    background: ${T.surface}; border: 1px solid ${T.border};
    border-radius: 14px; overflow: hidden; margin-bottom: 24px;
  }
  .table-toolbar {
    padding: 16px 20px; display: flex; align-items: center; gap: 12px;
    border-bottom: 1px solid ${T.border};
    background: ${T.surfaceAlt};
  }
  .search-input {
    flex: 1; background: ${T.bg}; border: 1px solid ${T.border};
    border-radius: 8px; padding: 8px 14px; color: ${T.text};
    font-size: 13px; font-family: inherit; outline: none;
    transition: border-color 0.2s;
  }
  .search-input:focus { border-color: ${T.accent}; }
  .search-input::placeholder { color: ${T.muted}; }
  .table-scroll { overflow-x: auto; }
  table { width: 100%; border-collapse: collapse; font-size: 12.5px; }
  thead tr { background: ${T.surfaceAlt}; }
  th {
    padding: 11px 14px; text-align: left; font-size: 10.5px; font-weight: 600;
    text-transform: uppercase; letter-spacing: 0.6px; color: ${T.muted};
    white-space: nowrap; border-bottom: 1px solid ${T.border};
    cursor: pointer; user-select: none;
  }
  th:hover { color: ${T.accent}; }
  th.right, td.right { text-align: right; }
  td {
    padding: 10px 14px; border-bottom: 1px solid ${T.border};
    white-space: nowrap; font-family: 'JetBrains Mono', monospace;
    font-size: 12px;
  }
  tr:last-child td { border-bottom: none; }
  tr:nth-child(even) td { background: rgba(255,255,255,0.01); }
  tr:hover td { background: rgba(0,194,212,0.05); }
  .status-ok { color: ${T.green}; font-weight: 600; font-family: 'Inter', sans-serif; }
  .status-warn { color: ${T.amber}; font-weight: 600; font-family: 'Inter', sans-serif; }
  .nf-num-col { color: ${T.accent}; font-weight: 600; }
  .codigo-col { color: ${T.text}; }
  .pct-pill {
    display: inline-block; padding: 2px 7px; border-radius: 5px;
    font-size: 10px; font-family: 'Inter', sans-serif;
  }
  .margem-high { background: ${T.greenDim}; color: ${T.green}; }
  .margem-mid { background: ${T.amberDim}; color: ${T.amber}; }
  .margem-low { background: ${T.redDim}; color: ${T.red}; }

  /* ── Alerts ── */
  .alert-list { display: flex; flex-direction: column; gap: 8px; }
  .alert-item {
    display: flex; align-items: center; gap: 10px;
    padding: 10px 14px; border-radius: 10px;
    background: ${T.amberDim}; border: 1px solid rgba(245,166,35,0.2);
    font-size: 12.5px;
  }
  .alert-icon { font-size: 15px; flex-shrink: 0; }

  /* ── Tooltips ── */
  .custom-tooltip {
    background: ${T.surfaceAlt}; border: 1px solid ${T.borderGlow};
    border-radius: 10px; padding: 10px 14px; font-size: 12px;
  }
  .tooltip-label { color: ${T.muted}; margin-bottom: 4px; font-size: 11px; }
  .tooltip-value { color: ${T.text}; font-weight: 600; font-family: 'JetBrains Mono', monospace; }

  /* ── Multi-NF selector ── */
  .nf-selector { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 20px; }
  .nf-tab {
    padding: 7px 14px; border-radius: 8px; cursor: pointer;
    font-size: 12px; font-weight: 500;
    border: 1px solid ${T.border};
    background: ${T.surface}; color: ${T.muted};
    transition: all 0.2s;
  }
  .nf-tab:hover { border-color: ${T.accent}; color: ${T.accent}; }
  .nf-tab.active {
    background: ${T.accentDim}; border-color: ${T.accent}; color: ${T.accent};
  }

  /* ── Empty state ── */
  .empty { text-align: center; padding: 60px; color: ${T.muted}; }
  .empty-icon { font-size: 40px; margin-bottom: 14px; }
  .empty-title { font-size: 16px; font-weight: 600; color: ${T.text}; margin-bottom: 8px; }
  .empty-sub { font-size: 13px; }

  /* ── CSV export bar ── */
  .action-bar {
    display: flex; gap: 10px; margin-bottom: 24px; align-items: center;
  }
  .spacer { flex: 1; }
`;

// ─── Components ───────────────────────────────────────────────────────────────

const TAX_COLORS = {
  ICMS: "#00c2d4",
  PIS: "#a78bfa",
  COFINS: "#f5a623",
  IBS: "#00e5a0",
  CBS: "#38bdf8",
};

function KpiCard({ label, value, sub, color, icon }) {
  return (
    <div className="kpi-card">
      <div className="kpi-glow" style={{ background: color }} />
      <div className="kpi-label">
        {icon} {label}
      </div>
      <div className="kpi-value" style={{ color }}>
        {value}
      </div>
      {sub && <div className="kpi-sub">{sub}</div>}
    </div>
  );
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="custom-tooltip">
      <div className="tooltip-label">{label}</div>
      {payload.map((p, i) => (
        <div key={i} className="tooltip-value" style={{ color: p.color }}>
          {p.name}: R$ {fmt(p.value)}
        </div>
      ))}
    </div>
  );
}

function TaxPieChart({ data }) {
  const total = data.reduce((a, d) => a + d.value, 0);
  return (
    <div className="chart-card">
      <div className="chart-title">Distribuição de Alíquotas</div>
      <ResponsiveContainer width="100%" height={160}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={50}
            outerRadius={75}
            paddingAngle={3}
            dataKey="value"
          >
            {data.map((entry) => (
              <Cell key={entry.name} fill={TAX_COLORS[entry.name]} />
            ))}
          </Pie>
          <Tooltip
            formatter={(v) => `R$ ${fmt(v)}`}
            contentStyle={{
              background: T.surfaceAlt,
              border: `1px solid ${T.borderGlow}`,
              borderRadius: 10,
              fontSize: 12,
            }}
          />
        </PieChart>
      </ResponsiveContainer>
      <div className="tax-legend">
        {data.map((d) => (
          <div className="tax-legend-item" key={d.name}>
            <div
              className="tax-dot"
              style={{ background: TAX_COLORS[d.name] }}
            />
            <span className="tax-legend-name">{d.name}</span>
            <span
              className="tax-legend-val"
              style={{ color: TAX_COLORS[d.name] }}
            >
              R$ {fmt(d.value)}
            </span>
            <span className="tax-legend-pct">
              ({total > 0 ? ((d.value / total) * 100).toFixed(1) : 0}%)
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ItemsBarChart({ items }) {
  const top = [...items]
    .sort((a, b) => Number(b.valorItem) - Number(a.valorItem))
    .slice(0, 8)
    .map((it) => ({
      name: it.codigo || `Item ${it.nItem}`,
      bruto: Number(it.valorItem),
      liquido: Number(it.receitaLiquida),
      tributos: Number(it.totalTributos),
    }));
  return (
    <div className="chart-card wide">
      <div className="chart-title">
        Top Itens — Valor Bruto vs Receita Líquida
      </div>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={top} barSize={16} barGap={4}>
          <CartesianGrid stroke={T.border} vertical={false} />
          <XAxis
            dataKey="name"
            tick={{ fill: T.muted, fontSize: 10 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: T.muted, fontSize: 10 }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ fontSize: 11, color: T.muted }} />
          <Bar
            dataKey="bruto"
            name="Receita Bruta"
            fill={T.accent}
            radius={[4, 4, 0, 0]}
            opacity={0.8}
          />
          <Bar
            dataKey="liquido"
            name="Receita Líquida"
            fill={T.green}
            radius={[4, 4, 0, 0]}
            opacity={0.8}
          />
          <Bar
            dataKey="tributos"
            name="Tributos"
            fill={T.amber}
            radius={[4, 4, 0, 0]}
            opacity={0.8}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function MargemAreaChart({ items }) {
  const data = items.map((it, i) => ({
    name: it.codigo || `${it.nItem}`,
    margem: Number(it.margemLiquida),
  }));
  return (
    <div className="chart-card">
      <div className="chart-title">Margem Líquida por Item (%)</div>
      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="margemGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={T.green} stopOpacity={0.3} />
              <stop offset="100%" stopColor={T.green} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke={T.border} vertical={false} />
          <XAxis
            dataKey="name"
            tick={{ fill: T.muted, fontSize: 10 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: T.muted, fontSize: 10 }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `${v}%`}
          />
          <Tooltip
            formatter={(v) => `${fmt(v)}%`}
            contentStyle={{
              background: T.surfaceAlt,
              border: `1px solid ${T.borderGlow}`,
              borderRadius: 10,
              fontSize: 12,
            }}
          />
          <Area
            dataKey="margem"
            name="Margem %"
            stroke={T.green}
            fill="url(#margemGrad)"
            strokeWidth={2}
            dot={{ fill: T.green, r: 3 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

function MargemClass(v) {
  const n = Number(v);
  if (n >= 50) return "margem-high";
  if (n >= 20) return "margem-mid";
  return "margem-low";
}

function ItemTable({ items, filter }) {
  const [sort, setSort] = useState({ col: "nItem", dir: 1 });
  const lower = filter.toLowerCase();
  const filtered = items.filter(
    (it) =>
      (it.codigo || "").toLowerCase().includes(lower) ||
      (it.descricao || "").toLowerCase().includes(lower) ||
      String(it.nItem).includes(lower) ||
      (it.numero || "").includes(lower)
  );
  const sorted = [...filtered].sort((a, b) => {
    const va = a[sort.col] ?? 0,
      vb = b[sort.col] ?? 0;
    return (
      (Number(va) - Number(vb)) * sort.dir ||
      String(va).localeCompare(String(vb)) * sort.dir
    );
  });
  const Th = ({ col, label, right }) => (
    <th
      className={right ? "right" : ""}
      onClick={() => setSort((s) => ({ col, dir: s.col === col ? -s.dir : 1 }))}
    >
      {label} {sort.col === col ? (sort.dir === 1 ? "↑" : "↓") : ""}
    </th>
  );

  return (
    <div className="table-scroll">
      <table>
        <thead>
          <tr>
            <Th col="nItem" label="Nº" />
            <Th col="codigo" label="Código" />
            <Th col="descricao" label="Descrição" />
            <Th col="valorItem" label="Rec. Bruta" right />
            <Th col="icms" label="ICMS" right />
            <Th col="percIcms" label="% ICMS" right />
            <Th col="pis" label="PIS" right />
            <Th col="percPis" label="% PIS" right />
            <Th col="cofins" label="COFINS" right />
            <Th col="percCofins" label="% COFINS" right />
            <Th col="ibs" label="IBS" right />
            <Th col="percIbs" label="% IBS" right />
            <Th col="cbs" label="CBS" right />
            <Th col="percCbs" label="% CBS" right />
            <Th col="totalTributos" label="Total Trib." right />
            <Th col="receitaLiquida" label="Rec. Líquida" right />
            <Th col="margemLiquida" label="Margem %" right />
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((it, i) => (
            <tr key={i}>
              <td className="nf-num-col">{it.nItem}</td>
              <td className="codigo-col">{it.codigo || "—"}</td>
              <td
                style={{
                  color: T.muted,
                  maxWidth: 180,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {it.descricao || "—"}
              </td>
              <td className="right">{fmtBRL(it.valorItem)}</td>
              <td className="right">{fmtBRL(it.icms)}</td>
              <td className="right" style={{ color: T.cyan2 }}>
                {fmtPct(it.percIcms)}
              </td>
              <td className="right">{fmtBRL(it.pis)}</td>
              <td className="right" style={{ color: T.violet }}>
                {fmtPct(it.percPis)}
              </td>
              <td className="right">{fmtBRL(it.cofins)}</td>
              <td className="right" style={{ color: T.amber }}>
                {fmtPct(it.percCofins)}
              </td>
              <td className="right">{fmtBRL(it.ibs)}</td>
              <td className="right" style={{ color: T.green }}>
                {fmtPct(it.percIbs)}
              </td>
              <td className="right">{fmtBRL(it.cbs)}</td>
              <td className="right" style={{ color: "#38bdf8" }}>
                {fmtPct(it.percCbs)}
              </td>
              <td className="right" style={{ color: T.red }}>
                {fmtBRL(it.totalTributos)}
              </td>
              <td className="right" style={{ color: T.green }}>
                {fmtBRL(it.receitaLiquida)}
              </td>
              <td className="right">
                <span className={`pct-pill ${MargemClass(it.margemLiquida)}`}>
                  {fmtPct(it.margemLiquida)}
                </span>
              </td>
              <td>
                {it.avisos?.length > 0 ? (
                  <span className="status-warn">⚠ Alerta</span>
                ) : (
                  <span className="status-ok">✓ OK</span>
                )}
              </td>
            </tr>
          ))}
          {sorted.length === 0 && (
            <tr>
              <td
                colSpan={18}
                style={{ textAlign: "center", color: T.muted, padding: 32 }}
              >
                Nenhum item encontrado.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function exportCSV(results) {
  const headers = [
    "Tipo",
    "NF",
    "Série",
    "Emissão",
    "Emitente",
    "CNPJ Emit.",
    "Destinatário",
    "CNPJ Dest.",
    "Chave",
    "N.Item",
    "Código",
    "Descrição",
    "Valor Total",
    "ICMS",
    "%ICMS",
    "PIS",
    "%PIS",
    "COFINS",
    "%COFINS",
    "IBS",
    "%IBS",
    "CBS",
    "%CBS",
    "Total Trib.",
    "Val.Líquido",
    "Margem%",
    "Status",
  ];
  const rows = [];
  for (const r of results) {
    for (const it of r.itens) {
      rows.push([
        r.tipoNota,
        r.numero,
        r.serie,
        r.dataEmissao,
        r.emitNome,
        r.emitCnpj,
        r.destNome,
        r.destCnpj,
        r.chave,
        it.nItem,
        it.codigo,
        it.descricao,
        it.valorItem,
        it.icms,
        it.percIcms,
        it.pis,
        it.percPis,
        it.cofins,
        it.percCofins,
        it.ibs,
        it.percIbs,
        it.cbs,
        it.percCbs,
        it.totalTributos,
        it.receitaLiquida,
        it.margemLiquida,
        it.avisos?.length > 0 ? "Alerta" : "OK",
      ]);
    }
  }
  const csv = [headers, ...rows]
    .map((r) =>
      r.map((v) => `"${String(v ?? "").replace(/"/g, '""')}"`).join(";")
    )
    .join("\n");
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "nfe_ibs_cbs_validador.csv";
  a.click();
  URL.revokeObjectURL(url);
}

// ─── XML parser (browser-side, mirrors Java backend logic) ────────────────────
// ─── XML Parser (fiel ao comportamento do xml_reader.py) ────────────────────
//
// Regras críticas portadas do Python:
//  1. localName() — remove o prefixo de namespace {uri}tag → tag
//  2. firstChild(el, name) — busca apenas filhos DIRETOS (não descendentes)
//  3. firstDesc(el, name) — busca o PRIMEIRO descendente em qualquer profundidade
//  4. sumDesc(el, names) — itera TODOS os descendentes via el.iter() (sem repetir nós)
//  5. Valores  IBS: <vIBS> ou <vIBSUF>+<vIBSMun> (dentro de <IBSCBS>)
//     Valores  CBS: <vCBS> (dentro de <IBSCBS>)
//  6. Alíquota IBS: pIBSUF + pIBSMun (soma das duas parcelas)
//     Alíquota CBS: pCBS
//     Alíquota ICMS: pICMS | PIS: pPIS | COFINS: pCOFINS
//  7. NUNCA usar getElementsByTagNameNS + getElementsByTagName no mesmo nó
//     (duplica valores quando o XML tem namespace)

function parseNFeXml(xmlText, fileName) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xmlText, "application/xml");

  // ── Helpers ────────────────────────────────────────────────────────────────

  // Remove prefixo de namespace: "{http://...}tag" → "tag"
  const localName = (node) => {
    const t = node.localName || node.nodeName || "";
    return t.includes("}") ? t.split("}")[1] : t;
  };

  // Converte texto para número (suporta vírgula brasileira)
  const toNum = (t) => {
    if (!t) return 0;
    let s = String(t).trim();
    if (!s) return 0;
    if (s.includes(",")) s = s.replace(/\./g, "").replace(",", ".");
    return parseFloat(s) || 0;
  };

  const money2 = (v) => Math.round(v * 100) / 100;
  const pct = (part, total) => (total ? money2((part / total) * 100) : 0);

  // Retorna array de todos os nós descendentes (equivale ao el.iter() do Python)
  // Usa TreeWalker para evitar recursão e não depender de namespace
  const iterAll = (el) => {
    if (!el) return [];
    const result = [];
    const walk = (node) => {
      for (const child of node.childNodes) {
        if (child.nodeType === 1) {
          // ELEMENT_NODE
          result.push(child);
          walk(child);
        }
      }
    };
    walk(el);
    return result;
  };

  // Busca primeiro FILHO DIRETO com dado localName (espelha _first_child do Python)
  const firstChild = (el, name) => {
    if (!el) return null;
    for (const child of el.childNodes) {
      if (child.nodeType === 1 && localName(child) === name) return child;
    }
    return null;
  };

  // Busca primeiro DESCENDENTE com dado localName (espelha _first_desc do Python)
  const firstDesc = (el, name) => {
    if (!el) return null;
    for (const node of iterAll(el)) {
      if (localName(node) === name) return node;
    }
    return null;
  };

  // Texto do primeiro filho direto com dado nome
  const textChild = (el, name) => {
    const child = firstChild(el, name);
    return child?.textContent?.trim() || "";
  };

  // Soma todos os descendentes cujo localName está em names (Set)
  // Equivale exatamente ao _sum_desc do Python — itera UMA VEZ sem repetir
  const sumDesc = (el, names) => {
    if (!el) return 0;
    let total = 0;
    for (const node of iterAll(el)) {
      if (names.has(localName(node))) {
        total += toNum(node.textContent);
      }
    }
    return money2(total);
  };

  // ── Extração de campos globais da NF ──────────────────────────────────────

  const infNFe = firstDesc(doc.documentElement, "infNFe");
  const id = infNFe?.getAttribute("Id") || "";
  const chave = id.startsWith("NFe") ? id.slice(3) : id;

  const ide = firstChild(infNFe, "ide");
  const numero = textChild(ide, "nNF");
  const serie = textChild(ide, "serie");
  // tpNF: 0 = Entrada, 1 = Saída
  const tpNF = textChild(ide, "tpNF");
  const tipoNota = tpNF === "0" ? "Entrada" : tpNF === "1" ? "Saída" : "—";
  // Data de emissão: dhEmi (com hora) ou dEmi (só data)
  const dhEmiRaw = textChild(ide, "dhEmi") || textChild(ide, "dEmi") || "";
  const dataEmissao = dhEmiRaw
    ? dhEmiRaw.substring(0, 10).split("-").reverse().join("/")
    : "—";
  // Emitente
  const emit = firstChild(infNFe, "emit");
  const emitNome = textChild(emit, "xNome") || textChild(emit, "xFant") || "—";
  const emitCnpj = textChild(emit, "CNPJ") || textChild(emit, "CPF") || "—";
  // Destinatário
  const dest = firstChild(infNFe, "dest");
  const destNome = textChild(dest, "xNome") || "—";
  const destCnpj = textChild(dest, "CNPJ") || textChild(dest, "CPF") || "—";

  // ── Coleta todos os <det> que possuem <prod> ─────────────────────────────

  const detNodes = iterAll(doc.documentElement).filter(
    (n) => localName(n) === "det" && firstChild(n, "prod") !== null
  );

  // ── Parse de cada item ────────────────────────────────────────────────────

  const itens = detNodes
    .map((det) => {
      const prod = firstChild(det, "prod");
      if (!prod) return null;
      const imp = firstChild(det, "imposto");

      const nItem = parseInt(det.getAttribute("nItem") || "0") || 0;
      const codigo = textChild(prod, "cProd");
      const descricao = textChild(prod, "xProd");

      const valorProduto = toNum(textChild(prod, "vProd"));
      const desconto = toNum(textChild(prod, "vDesc"));
      const frete = toNum(textChild(prod, "vFrete"));
      const seguro = toNum(textChild(prod, "vSeg"));
      const outras = toNum(textChild(prod, "vOutro"));
      const valorItem = money2(
        valorProduto - desconto + frete + seguro + outras
      );

      // ICMS: soma todos os <vICMS> dentro de <imposto>
      const icms = sumDesc(imp, new Set(["vICMS"]));

      // PIS: soma todos os <vPIS> dentro de <imposto>
      const pis = sumDesc(imp, new Set(["vPIS"]));

      // COFINS: soma todos os <vCOFINS> dentro de <imposto>
      const cofins = sumDesc(imp, new Set(["vCOFINS"]));

      // IBS: tenta <vIBS> primeiro; se zero usa <vIBSUF> + <vIBSMun>
      // Esses nós ficam dentro de <IBSCBS> (filho de <imposto>)
      let ibs = sumDesc(imp, new Set(["vIBS"]));
      if (ibs === 0) {
        ibs = sumDesc(imp, new Set(["vIBSUF", "vIBSMun"]));
      }

      // CBS: <vCBS> dentro de <IBSCBS>
      const cbs = sumDesc(imp, new Set(["vCBS"]));

      const totalTributos = money2(icms + pis + cofins + ibs + cbs);
      const receitaLiquida = money2(valorItem - totalTributos);
      const margemLiquida = pct(receitaLiquida, valorItem);

      // Alíquotas: lidas diretamente dos campos p* do XML
      // ICMS -> pICMS | PIS -> pPIS | COFINS -> pCOFINS
      // IBS  -> pIBSUF + pIBSMun (soma das duas parcelas = aliquota total IBS)
      // CBS  -> pCBS
      const percIcms = money2(sumDesc(imp, new Set(["pICMS"])));
      const percPis = money2(sumDesc(imp, new Set(["pPIS"])));
      const percCofins = money2(sumDesc(imp, new Set(["pCOFINS"])));
      const percIbs = money2(sumDesc(imp, new Set(["pIBSUF", "pIBSMun"])));
      const percCbs = money2(sumDesc(imp, new Set(["pCBS"])));

      const avisos = [];
      if (valorItem < 0)
        avisos.push("Valor do item negativo após descontos/acréscimos.");
      if (receitaLiquida < 0)
        avisos.push("Receita líquida negativa; confira valores e tributos.");

      return {
        arquivo: fileName,
        chave,
        numero,
        serie,
        nItem,
        codigo,
        descricao,
        valorProduto,
        desconto,
        frete,
        seguro,
        outras,
        valorItem,
        icms,
        pis,
        cofins,
        ibs,
        cbs,
        totalTributos,
        receitaLiquida,
        margemLiquida,
        percIcms,
        percPis,
        percCofins,
        percIbs,
        percCbs,
        avisos,
      };
    })
    .filter(Boolean)
    .sort((a, b) => a.nItem - b.nItem);

  // ── Totais ────────────────────────────────────────────────────────────────

  const sum = (f) => money2(itens.reduce((a, it) => a + (it[f] || 0), 0));

  const totalReceitaBruta = sum("valorItem");
  const totalTributos = sum("totalTributos");
  const totalReceitaLiquida = sum("receitaLiquida");
  const margemLiquidaGeral = pct(totalReceitaLiquida, totalReceitaBruta);

  return {
    arquivo: fileName,
    chave,
    numero,
    serie,
    tpNF,
    tipoNota,
    dataEmissao,
    emitNome,
    emitCnpj,
    destNome,
    destCnpj,
    itens,
    quantidadeItens: itens.length,
    totalReceitaBruta,
    totalDesconto: sum("desconto"),
    totalIcms: sum("icms"),
    totalPis: sum("pis"),
    totalCofins: sum("cofins"),
    totalIbs: sum("ibs"),
    totalCbs: sum("cbs"),
    totalTributos,
    totalReceitaLiquida,
    margemLiquidaGeral,
    percGeralIcms: pct(sum("icms"), totalReceitaBruta),
    percGeralPis: pct(sum("pis"), totalReceitaBruta),
    percGeralCofins: pct(sum("cofins"), totalReceitaBruta),
    percGeralIbs: pct(sum("ibs"), totalReceitaBruta),
    percGeralCbs: pct(sum("cbs"), totalReceitaBruta),
    avisos: itens.flatMap((it) =>
      it.avisos.map((a) => `Item ${it.nItem}: ${a}`)
    ),
  };
}

// ─── App ──────────────────────────────────────────────────────────────────────
export default function App() {
  const [results, setResults] = useState([]);
  const [activeIdx, setActiveIdx] = useState(0);
  const [loading, setLoading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [pendingFiles, setPendingFiles] = useState([]);
  const [filter, setFilter] = useState("");
  const fileRef = useRef();

  const processFiles = useCallback(async (files) => {
    setLoading(true);
    const parsed = [];
    for (const file of files) {
      try {
        const text = await file.text();
        const result = parseNFeXml(text, file.name);
        parsed.push(result);
      } catch (e) {
        console.error(file.name, e);
      }
    }
    setResults(parsed);
    setActiveIdx(0);
    setLoading(false);
  }, []);

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      setDragging(false);
      const files = [...e.dataTransfer.files].filter((f) =>
        f.name.endsWith(".xml")
      );
      if (files.length) {
        setPendingFiles(files);
        processFiles(files);
      }
    },
    [processFiles]
  );

  const handleFileInput = useCallback(
    (e) => {
      const files = [...e.target.files];
      if (files.length) {
        setPendingFiles(files);
        processFiles(files);
      }
    },
    [processFiles]
  );

  const nf = results[activeIdx];
  const allItems = nf?.itens || [];

  const taxData = nf
    ? [
        { name: "ICMS", value: Number(nf.totalIcms) },
        { name: "PIS", value: Number(nf.totalPis) },
        { name: "COFINS", value: Number(nf.totalCofins) },
        { name: "IBS", value: Number(nf.totalIbs) },
        { name: "CBS", value: Number(nf.totalCbs) },
      ].filter((d) => d.value > 0)
    : [];

  return (
    <>
      <style>{css}</style>
      <div className="app">
        {/* Header */}
        <header className="header">
          <div className="logo-mark">NF</div>
          <div>
            <div className="header-title">Validador IBS/CBS</div>
            <div className="header-sub">
              Análise fiscal de NF-e · ICMS · PIS · COFINS · IBS · CBS
            </div>
          </div>
          <div className="header-right">
            {results.length > 0 && (
              <span className="badge badge-live">
                ● {results.length} NF(s) carregada(s)
              </span>
            )}
            {nf && (
              <span
                className="badge"
                style={{
                  borderColor:
                    nf.tipoNota === "Entrada" ? "#00e5a0" : "#00c2d4",
                  color: nf.tipoNota === "Entrada" ? "#00e5a0" : "#00c2d4",
                  background: nf.tipoNota === "Entrada" ? "#003d2a" : "#003d45",
                }}
              >
                {nf.tipoNota === "Entrada"
                  ? "↓ Nota de Entrada"
                  : nf.tipoNota === "Saída"
                  ? "↑ Nota de Saída"
                  : "NF-e"}
              </span>
            )}
            <span className="badge">Reforma Tributária 2026</span>
          </div>
        </header>

        <main className="main">
          {/* Drop zone */}
          {results.length === 0 && !loading && (
            <div
              className={`drop-zone${dragging ? " drag-over" : ""}`}
              onDragOver={(e) => {
                e.preventDefault();
                setDragging(true);
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileRef.current.click()}
            >
              <div className="drop-icon">📂</div>
              <div className="drop-title">Arraste XMLs de NF-e aqui</div>
              <div className="drop-sub">
                ou <span>clique para selecionar</span> arquivos .xml
              </div>
              <div className="drop-hint">
                Suporte a múltiplas NFs · ICMS · PIS · COFINS · IBS (novo) · CBS
                (novo)
              </div>
              <input
                ref={fileRef}
                type="file"
                accept=".xml"
                multiple
                style={{ display: "none" }}
                onChange={handleFileInput}
              />
            </div>
          )}

          {/* Loading */}
          {loading && (
            <div>
              <div className="drop-zone" style={{ cursor: "default" }}>
                <div className="drop-icon">⚙️</div>
                <div className="drop-title">Processando XMLs...</div>
                <div className="drop-sub">
                  Calculando tributos, margens e alíquotas
                </div>
              </div>
              <div className="loading-bar">
                <div className="loading-fill" style={{ width: "100%" }} />
              </div>
            </div>
          )}

          {/* Dashboard */}
          {!loading && results.length > 0 && (
            <>
              {/* NF selector tabs */}
              <div className="action-bar">
                <div className="nf-selector">
                  {results.map((r, i) => (
                    <div
                      key={i}
                      className={`nf-tab${i === activeIdx ? " active" : ""}`}
                      onClick={() => setActiveIdx(i)}
                    >
                      <span
                        style={{ fontSize: 10, opacity: 0.7, marginRight: 4 }}
                      >
                        {r.tipoNota === "Entrada"
                          ? "↓E"
                          : r.tipoNota === "Saída"
                          ? "↑S"
                          : "NF"}
                      </span>
                      {r.numero || r.arquivo.replace(".xml", "")}
                    </div>
                  ))}
                </div>
                <div className="spacer" />
                <button
                  className="btn btn-ghost"
                  onClick={() => {
                    setResults([]);
                    setPendingFiles([]);
                    fileRef.current && (fileRef.current.value = "");
                  }}
                >
                  ✕ Limpar
                </button>
                <button
                  className="btn btn-ghost"
                  onClick={() => fileRef.current.click()}
                >
                  + Adicionar XML
                  <input
                    ref={fileRef}
                    type="file"
                    accept=".xml"
                    multiple
                    style={{ display: "none" }}
                    onChange={handleFileInput}
                  />
                </button>
                <button
                  className="btn btn-primary"
                  onClick={() => exportCSV(results)}
                >
                  ↓ Exportar CSV
                </button>
              </div>

              {/* NF header */}
              {nf && (
                <div className="nf-header">
                  {/* Tipo badge */}
                  <div className="nf-field">
                    <span className="nf-field-label">Tipo</span>
                    <span
                      className="nf-field-value"
                      style={{
                        color:
                          nf.tipoNota === "Entrada"
                            ? "#00e5a0"
                            : nf.tipoNota === "Saída"
                            ? "#00c2d4"
                            : "#5a7a9a",
                        fontSize: 15,
                        fontWeight: 700,
                      }}
                    >
                      {nf.tipoNota === "Entrada"
                        ? "↓ Entrada"
                        : nf.tipoNota === "Saída"
                        ? "↑ Saída"
                        : "—"}
                    </span>
                  </div>
                  <div className="nf-divider" />
                  <div className="nf-field">
                    <span className="nf-field-label">Nº NF-e</span>
                    <span className="nf-field-value big">
                      {nf.numero || "—"}
                    </span>
                  </div>
                  <div className="nf-divider" />
                  <div className="nf-field">
                    <span className="nf-field-label">Série</span>
                    <span className="nf-field-value">{nf.serie || "—"}</span>
                  </div>
                  <div className="nf-divider" />
                  <div className="nf-field">
                    <span className="nf-field-label">Emissão</span>
                    <span className="nf-field-value">
                      {nf.dataEmissao || "—"}
                    </span>
                  </div>
                  <div className="nf-divider" />
                  <div className="nf-field">
                    <span className="nf-field-label">Emitente</span>
                    <span className="nf-field-value" style={{ fontSize: 12 }}>
                      {nf.emitNome}
                    </span>
                    <span
                      style={{
                        fontSize: 10,
                        color: "#5a7a9a",
                        fontFamily: "JetBrains Mono, monospace",
                        marginTop: 2,
                      }}
                    >
                      {nf.emitCnpj}
                    </span>
                  </div>
                  <div className="nf-divider" />
                  <div className="nf-field">
                    <span className="nf-field-label">Destinatário</span>
                    <span className="nf-field-value" style={{ fontSize: 12 }}>
                      {nf.destNome}
                    </span>
                    <span
                      style={{
                        fontSize: 10,
                        color: "#5a7a9a",
                        fontFamily: "JetBrains Mono, monospace",
                        marginTop: 2,
                      }}
                    >
                      {nf.destCnpj}
                    </span>
                  </div>
                  <div className="nf-divider" />
                  <div className="nf-field">
                    <span className="nf-field-label">Chave de Acesso</span>
                    <span
                      className="nf-field-value"
                      style={{ fontSize: 10, letterSpacing: 0.5 }}
                    >
                      {nf.chave
                        ? nf.chave.replace(/(\d{4})/g, "$1 ").trim()
                        : "—"}
                    </span>
                  </div>
                  <div className="nf-divider" />
                  <div className="nf-field">
                    <span className="nf-field-label">Qtd. Itens</span>
                    <span className="nf-field-value">{nf.quantidadeItens}</span>
                  </div>
                </div>
              )}

              {/* KPI grid */}
              {nf && (
                <div className="kpi-grid">
                  <KpiCard
                    label={
                      nf.tipoNota === "Entrada"
                        ? "Valor Total Entrada"
                        : "Receita Bruta"
                    }
                    value={fmtBRL(nf.totalReceitaBruta)}
                    color={nf.tipoNota === "Entrada" ? T.green : T.accent}
                    icon={nf.tipoNota === "Entrada" ? "↓" : "◈"}
                    sub={
                      <>
                        <span>Qtd. de itens: </span>
                        <span className="positive">{nf.quantidadeItens}</span>
                      </>
                    }
                  />
                  <KpiCard
                    label="Total de Tributos"
                    value={fmtBRL(nf.totalTributos)}
                    color={T.amber}
                    icon="◉"
                    sub={
                      <>
                        <span className="negative">
                          {fmtPct(
                            (nf.totalTributos / nf.totalReceitaBruta) * 100 || 0
                          )}{" "}
                          da receita bruta
                        </span>
                      </>
                    }
                  />
                  <KpiCard
                    label={
                      nf.tipoNota === "Entrada"
                        ? "Valor Líquido Entrada"
                        : "Receita Líquida"
                    }
                    value={fmtBRL(nf.totalReceitaLiquida)}
                    color={T.green}
                    icon="◆"
                    sub={
                      <>
                        <span>após dedução de impostos</span>
                      </>
                    }
                  />
                  <KpiCard
                    label="Margem Líquida"
                    value={fmtPct(nf.margemLiquidaGeral)}
                    color={
                      Number(nf.margemLiquidaGeral) >= 40
                        ? T.green
                        : Number(nf.margemLiquidaGeral) >= 20
                        ? T.amber
                        : T.red
                    }
                    icon="▸"
                    sub={
                      <span
                        className={
                          Number(nf.margemLiquidaGeral) >= 40
                            ? "positive"
                            : "negative"
                        }
                      >
                        {Number(nf.margemLiquidaGeral) >= 40
                          ? "Margem saudável"
                          : "Atenção à margem"}
                      </span>
                    }
                  />
                  <KpiCard
                    label="ICMS"
                    value={fmtBRL(nf.totalIcms)}
                    color={T.cyan2}
                    icon="▪"
                    sub={
                      <span style={{ color: T.cyan2 }}>
                        {fmtPct(nf.percGeralIcms)} da rec. bruta
                      </span>
                    }
                  />
                  <KpiCard
                    label="PIS + COFINS"
                    value={fmtBRL(nf.totalPis + nf.totalCofins)}
                    color={T.violet}
                    icon="▪"
                    sub={
                      <span style={{ color: T.violet }}>
                        {fmtPct(nf.percGeralPis + nf.percGeralCofins)} da rec.
                        bruta
                      </span>
                    }
                  />
                  <KpiCard
                    label="IBS (novo)"
                    value={fmtBRL(nf.totalIbs)}
                    color={T.green}
                    icon="▪"
                    sub={
                      <span style={{ color: T.green }}>
                        {fmtPct(nf.percGeralIbs)} da rec. bruta
                      </span>
                    }
                  />
                  <KpiCard
                    label="CBS (novo)"
                    value={fmtBRL(nf.totalCbs)}
                    color={"#38bdf8"}
                    icon="▪"
                    sub={
                      <span style={{ color: "#38bdf8" }}>
                        {fmtPct(nf.percGeralCbs)} da rec. bruta
                      </span>
                    }
                  />
                </div>
              )}

              {/* Charts */}
              {nf && allItems.length > 0 && (
                <div className="charts-grid">
                  <TaxPieChart data={taxData} />
                  <ItemsBarChart items={allItems} />
                  <MargemAreaChart items={allItems} />
                </div>
              )}

              {/* Alerts */}
              {nf?.avisos?.length > 0 && (
                <>
                  <div className="section-header">
                    <span className="section-title">Alertas de Validação</span>
                    <span className="section-count">{nf.avisos.length}</span>
                    <div className="section-line" />
                  </div>
                  <div className="alert-list" style={{ marginBottom: 24 }}>
                    {nf.avisos.map((a, i) => (
                      <div key={i} className="alert-item">
                        <span className="alert-icon">⚠️</span>
                        <span>{a}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {/* Table */}
              {nf && (
                <>
                  <div className="section-header">
                    <span className="section-title">Itens da NF-e</span>
                    <span className="section-count">
                      {allItems.length} itens
                    </span>
                    <div className="section-line" />
                  </div>
                  <div className="table-card">
                    <div className="table-toolbar">
                      <input
                        className="search-input"
                        placeholder="Filtrar por código, descrição, nº item…"
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                      />
                      <button
                        className="btn btn-ghost"
                        style={{ whiteSpace: "nowrap" }}
                        onClick={() => setFilter("")}
                      >
                        Limpar filtro
                      </button>
                    </div>
                    <ItemTable items={allItems} filter={filter} />
                  </div>
                </>
              )}
            </>
          )}

          {/* Empty after clear */}
          {!loading &&
            results.length === 0 &&
            pendingFiles.length === 0 &&
            false && (
              <div className="empty">
                <div className="empty-icon">📋</div>
                <div className="empty-title">Nenhuma NF-e carregada</div>
                <div className="empty-sub">
                  Arraste XMLs para o validador acima.
                </div>
              </div>
            )}
        </main>
      </div>
    </>
  );
}
