import { useMemo, useState } from 'react';
import { MapPin, X } from 'lucide-react';
import { MAP_VIEWBOX } from '@/lib/france-departments';
import {
  departmentStats,
  formatEuro,
  formatMetric,
  formatNumber,
  geoPeriods,
  geoServices,
  metricLabels,
  metricValue,
  type DepartmentStats,
  type GeoPeriod,
  type GeoService,
  type MetricKey,
} from '@/lib/oeko-geo';

const metricKeys: MetricKey[] = ['leads', 'qualifies', 'devis', 'ventes', 'ca'];

/** Dégradé sobre du gris clair vers l’accent OEKO #352C5B. */
function fillFor(ratio: number) {
  if (ratio <= 0) return 'hsl(220 14% 96%)';
  const steps = [0.1, 0.24, 0.42, 0.62, 0.82, 1];
  const opacity = steps.find((s) => ratio <= s) ?? 1;
  return `color-mix(in srgb, var(--primary) ${Math.round(opacity * 100)}%, hsl(220 14% 96%))`;
}

function Kpi({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md bg-canvas px-3 py-2">
      <p className="text-[10px] font-medium text-muted-foreground">{label}</p>
      <p className="mt-0.5 text-sm font-bold">{value}</p>
    </div>
  );
}

export function OekoDepartmentMap() {
  const [period, setPeriod] = useState<GeoPeriod>(geoPeriods[0]);
  const [metric, setMetric] = useState<MetricKey>('leads');
  const [service, setService] = useState<GeoService>(geoServices[0]);
  const [hover, setHover] = useState<{ stat: DepartmentStats; x: number; y: number } | null>(null);
  const [selected, setSelected] = useState<string | null>(null);

  const stats = useMemo(() => departmentStats(period, service), [period, service]);
  const max = useMemo(() => Math.max(...stats.map((s) => metricValue(s, metric)), 1), [stats, metric]);
  const top5 = useMemo(() => [...stats].sort((a, b) => metricValue(b, metric) - metricValue(a, metric)).slice(0, 5), [stats, metric]);
  const detail = selected ? stats.find((s) => s.code === selected) ?? null : null;
  const total = stats.reduce((sum, s) => sum + metricValue(s, metric), 0);

  return (
    <section className="min-w-0 rounded-lg border border-border bg-card">
      <div className="flex flex-col gap-3 border-b border-border px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <h2 className="flex items-center gap-2 text-sm font-bold"><MapPin size={16} className="text-primary" /> Activité par département</h2>
          <p className="mt-1 text-[11px] text-muted-foreground">{metricLabels[metric]} · {formatMetric(total, metric)} au total · {service}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <select aria-label="Période" value={period} onChange={(e) => setPeriod(e.target.value as GeoPeriod)} className="h-9 rounded-md border border-border bg-background px-2 text-xs">
            {geoPeriods.map((p) => <option key={p}>{p}</option>)}
          </select>
          <select aria-label="Donnée affichée" value={metric} onChange={(e) => setMetric(e.target.value as MetricKey)} className="h-9 rounded-md border border-border bg-background px-2 text-xs">
            {metricKeys.map((k) => <option key={k} value={k}>{metricLabels[k]}</option>)}
          </select>
          <select aria-label="Service" value={service} onChange={(e) => setService(e.target.value as GeoService)} className="h-9 rounded-md border border-border bg-background px-2 text-xs">
            {geoServices.map((s) => <option key={s}>{s}</option>)}
          </select>
        </div>
      </div>

      <div className="grid gap-5 p-5 xl:grid-cols-[1.35fr_1fr]">
        <div className="relative min-w-0" onMouseLeave={() => setHover(null)}>
          <svg viewBox={MAP_VIEWBOX} className="w-full" role="img" aria-label="Carte de France des projets OEKO par département">
            {stats.map((stat) => {
              const ratio = metricValue(stat, metric) / max;
              const isSelected = selected === stat.code;
              return (
                <path
                  key={stat.code}
                  d={stat.d}
                  style={{ fill: fillFor(ratio) }}
                  stroke={isSelected ? 'var(--lime-foreground)' : 'white'}
                  strokeWidth={isSelected ? 2 : 0.6}
                  className="cursor-pointer transition-[stroke] hover:stroke-lime-foreground"
                  onMouseMove={(e) => {
                    const box = e.currentTarget.ownerSVGElement?.parentElement?.getBoundingClientRect();
                    setHover({ stat, x: e.clientX - (box?.left ?? 0), y: e.clientY - (box?.top ?? 0) });
                  }}
                  onClick={() => setSelected(stat.code === selected ? null : stat.code)}
                />
              );
            })}
          </svg>
          <div className="mt-2 flex items-center gap-2 text-[10px] text-muted-foreground">
            <span>Faible</span>
            <span className="h-2 flex-1 rounded-full" style={{ background: 'linear-gradient(90deg, hsl(220 14% 96%), var(--primary))' }} />
            <span>Élevé</span>
          </div>
          {hover && (
            <div
              className="pointer-events-none absolute z-20 w-52 rounded-md border border-border bg-background p-3 shadow-lg"
              style={{ left: Math.min(hover.x + 12, 240), top: Math.max(hover.y - 90, 0) }}
            >
              <p className="text-xs font-bold">{hover.stat.nom} <span className="text-muted-foreground">· {hover.stat.code}</span></p>
              <dl className="mt-2 space-y-1 text-[11px]">
                {([['Leads', formatNumber(hover.stat.leads)], ['Projets qualifiés', formatNumber(hover.stat.qualifies)], ['Devis', formatNumber(hover.stat.devis)], ['Ventes', formatNumber(hover.stat.ventes)], ['CA signé', formatEuro(hover.stat.ca)]] as const).map(([k, v]) => (
                  <div key={k} className="flex justify-between gap-3"><dt className="text-muted-foreground">{k}</dt><dd className="font-semibold">{v}</dd></div>
                ))}
              </dl>
            </div>
          )}
        </div>

        <div className="min-w-0 space-y-4">
          {detail ? (
            <div className="rounded-lg border border-border bg-background p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[10px] font-semibold text-muted-foreground">DÉPARTEMENT {detail.code}</p>
                  <p className="text-base font-bold">{detail.nom}</p>
                </div>
                <button onClick={() => setSelected(null)} aria-label="Fermer le détail" className="rounded p-1 text-muted-foreground hover:bg-muted"><X size={15} /></button>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <Kpi label="Leads" value={formatNumber(detail.leads)} />
                <Kpi label="Projets qualifiés" value={formatNumber(detail.qualifies)} />
                <Kpi label="Devis" value={formatNumber(detail.devis)} />
                <Kpi label="Ventes" value={formatNumber(detail.ventes)} />
              </div>
              <div className="mt-2 rounded-md bg-primary px-3 py-2 text-primary-foreground">
                <p className="text-[10px] font-medium opacity-75">CA signé</p>
                <p className="text-sm font-bold">{formatEuro(detail.ca)}</p>
              </div>
              <div className="mt-3 space-y-1.5">
                {Object.entries(detail.services).filter(([, v]) => v > 0).map(([name, value]) => (
                  <div key={name} className="flex items-center gap-2 text-[11px]">
                    <span className="w-24 shrink-0 text-muted-foreground">{name}</span>
                    <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted"><span className="block h-full rounded-full bg-lime" style={{ width: `${Math.min(100, (value / Math.max(detail.leads, 1)) * 100 * 2)}%` }} /></span>
                    <span className="w-8 text-right font-semibold">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="rounded-lg border border-dashed border-border bg-canvas p-4 text-xs text-muted-foreground">
              Survolez un département pour voir ses indicateurs, cliquez pour afficher le détail complet.
            </div>
          )}

          <div className="overflow-hidden rounded-lg border border-border">
            <div className="border-b border-border bg-canvas px-4 py-2.5 text-[11px] font-semibold uppercase text-muted-foreground">Top 5 départements</div>
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-[10px] uppercase text-muted-foreground">
                  <th className="px-4 py-2 font-semibold">Département</th>
                  <th className="px-2 py-2 font-semibold">Leads</th>
                  <th className="px-2 py-2 font-semibold">Ventes</th>
                  <th className="px-4 py-2 text-right font-semibold">CA</th>
                </tr>
              </thead>
              <tbody>
                {top5.map((s) => (
                  <tr key={s.code} onClick={() => setSelected(s.code)} className={`cursor-pointer border-t border-border hover:bg-canvas ${selected === s.code ? 'bg-secondary' : ''}`}>
                    <td className="px-4 py-2.5 font-bold">{s.code} <span className="font-normal text-muted-foreground">{s.nom}</span></td>
                    <td className="px-2 py-2.5">{formatNumber(s.leads)}</td>
                    <td className="px-2 py-2.5">{formatNumber(s.ventes)}</td>
                    <td className="px-4 py-2.5 text-right font-semibold">{formatEuro(s.ca)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}
