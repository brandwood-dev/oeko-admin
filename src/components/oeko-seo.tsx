import { useMemo, useState, type ReactNode } from 'react';
import { ArrowDownRight, ArrowRight, ArrowUpRight, ExternalLink, Minus, MousePointerClick, Search, Target, TrendingDown, TrendingUp } from 'lucide-react';
import {
  acquisitionRows, fmtEuro, fmtNumber, fmtPercent, fmtSigned, seoChannels, seoKeywords, seoPages,
  seoPeriods, seoServices, seoTotals, trafficSeries, trendLabel,
  type SeoPeriod,
} from '@/lib/oeko-seo';

const tabs = ['Vue d’ensemble', 'Pages', 'Mots-clés SEO', 'Opportunités SEO'] as const;
type Tab = (typeof tabs)[number];
const seriesKeys = ['sessions', 'clics', 'leads'] as const;
type SeriesKey = (typeof seriesKeys)[number];
const seriesLabels: Record<SeriesKey, string> = { sessions: 'Sessions', clics: 'Clics Google', leads: 'Leads générés' };

function Box({ title, action, children, className = '' }: { title: string; action?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={`min-w-0 rounded-lg border border-border bg-card ${className}`}>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-4">
        <h2 className="text-sm font-bold">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

function KpiCard({ label, value, hint, accent = false }: { label: string; value: string; hint?: string; accent?: boolean }) {
  return (
    <div className={`min-w-0 rounded-lg border p-4 ${accent ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-card'}`}>
      <p className={`truncate text-[11px] font-semibold uppercase ${accent ? 'opacity-75' : 'text-muted-foreground'}`}>{label}</p>
      <p className="mt-1.5 text-xl font-bold tracking-tight">{value}</p>
      {hint && <p className={`mt-1 truncate text-[11px] ${accent ? 'opacity-80' : 'text-muted-foreground'}`}>{hint}</p>}
    </div>
  );
}

function TrendBadge({ evolution }: { evolution: number }) {
  const label = trendLabel(evolution);
  const cls = label === 'En hausse' ? 'bg-lime/40 text-foreground' : label === 'En baisse' ? 'bg-secondary text-primary' : 'bg-muted text-muted-foreground';
  const Icon = label === 'En hausse' ? ArrowUpRight : label === 'En baisse' ? ArrowDownRight : Minus;
  return (
    <span className={`inline-flex w-fit items-center gap-1 whitespace-nowrap rounded px-2 py-1 text-[11px] font-semibold ${cls}`}>
      <Icon size={12} /> {label}
    </span>
  );
}

function Table({ headers, rows, alignRight = [] }: { headers: string[]; rows: { key: string; cells: ReactNode[] }[]; alignRight?: number[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[680px] text-left text-sm">
        <thead>
          <tr className="bg-canvas">
            {headers.map((h, i) => (
              <th key={h} className={`px-5 py-3 text-[11px] font-semibold uppercase text-muted-foreground ${alignRight.includes(i) ? 'text-right' : ''}`}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.key} className="border-t border-border hover:bg-canvas">
              {r.cells.map((cell, i) => (
                <td key={i} className={`px-5 py-3.5 text-xs text-foreground ${alignRight.includes(i) ? 'text-right' : ''}`}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {!rows.length && <div className="p-12 text-center text-sm text-muted-foreground">Aucune donnée pour ces filtres.</div>}
    </div>
  );
}

function TrendChart({ series }: { series: SeriesKey }) {
  const [hover, setHover] = useState<number | null>(null);
  const max = Math.max(...trafficSeries.map((p) => p[series]));
  return (
    <div className="p-5">
      <div className="flex h-44 items-end justify-between gap-1.5">
        {trafficSeries.map((point, i) => {
          const height = (point[series] / max) * 100;
          const active = hover === i;
          return (
            <div
              key={point.label}
              className="relative flex h-full min-w-0 flex-1 cursor-pointer flex-col items-center justify-end gap-2"
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(null)}
            >
              {active && (
                <div className="pointer-events-none absolute bottom-full z-10 mb-1 w-36 rounded-md border border-border bg-background p-2 text-[11px] shadow-lg">
                  <p className="font-bold">{point.label}</p>
                  <p className="mt-1 flex justify-between"><span className="text-muted-foreground">Sessions</span><span className="font-semibold">{fmtNumber(point.sessions)}</span></p>
                  <p className="flex justify-between"><span className="text-muted-foreground">Clics</span><span className="font-semibold">{fmtNumber(point.clics)}</span></p>
                  <p className="flex justify-between"><span className="text-muted-foreground">Leads</span><span className="font-semibold">{fmtNumber(point.leads)}</span></p>
                </div>
              )}
              <div className={`w-full max-w-10 rounded-t-sm transition-colors ${active ? 'bg-lime' : 'bg-primary'}`} style={{ height: `${height}%` }} />
              <span className="truncate text-[10px] text-muted-foreground">{point.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function OekoSeo() {
  const [tab, setTab] = useState<Tab>('Vue d’ensemble');
  const [period, setPeriod] = useState<SeoPeriod>('30 derniers jours');
  const [service, setService] = useState<string>('Tous les services');
  const [channel, setChannel] = useState<string>('Tous les canaux');
  const [series, setSeries] = useState<SeriesKey>('sessions');

  const totals = useMemo(() => seoTotals(period), [period]);
  const pages = useMemo(() => seoPages.filter((p) =>
    (service === 'Tous les services' || p.service === service || p.service === 'Tous les services') &&
    (channel === 'Tous les canaux' || p.canal === channel)
  ), [service, channel]);
  const keywords = useMemo(() => [...seoKeywords].sort((a, b) => b.clics - a.clics), []);

  const lowCtr = keywords.filter((k) => k.impressions > 5000 && k.ctr < 1.5).slice(0, 4);
  const nearTop = keywords.filter((k) => k.position >= 4 && k.position <= 15).sort((a, b) => a.position - b.position).slice(0, 5);
  const losing = seoPages.filter((p) => p.tendance < 0).sort((a, b) => a.tendance - b.tendance).slice(0, 4);
  const rising = seoPages.filter((p) => p.tendance > 0).sort((a, b) => b.tendance - a.tendance).slice(0, 4);
  const acqTotal = acquisitionRows.reduce((acc, r) => ({
    sessions: acc.sessions + r.sessions, leads: acc.leads + r.leads, qualifies: acc.qualifies + r.qualifies,
    devis: acc.devis + r.devis, ventes: acc.ventes + r.ventes, ca: acc.ca + r.ca,
  }), { sessions: 0, leads: 0, qualifies: 0, devis: 0, ventes: 0, ca: 0 });
  const maxSessions = Math.max(...acquisitionRows.map((r) => r.sessions));

  const select = 'h-9 rounded-md border border-border bg-background px-2 text-xs';

  return (
    <div className="space-y-5">
      {/* Onglets + période */}
      <div className="flex flex-col gap-3 rounded-lg border border-border bg-card p-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex gap-1 overflow-x-auto" role="tablist" aria-label="Sections SEO et acquisition">
          {tabs.map((t) => (
            <button
              key={t}
              role="tab"
              aria-selected={tab === t}
              onClick={() => setTab(t)}
              className={`whitespace-nowrap rounded-md px-3.5 py-2 text-xs font-semibold transition-colors ${tab === t ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}
            >
              {t}
            </button>
          ))}
        </div>
        <select aria-label="Période" value={period} onChange={(e) => setPeriod(e.target.value as SeoPeriod)} className={`${select} lg:w-44`}>
          {seoPeriods.map((p) => <option key={p}>{p}</option>)}
        </select>
      </div>

      {tab === 'Vue d’ensemble' && (
        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
            <KpiCard label="Visiteurs" value={fmtNumber(totals.visiteurs)} hint="Utilisateurs uniques" />
            <KpiCard label="Sessions" value={fmtNumber(totals.sessions)} hint="Toutes sources" />
            <KpiCard label="Trafic organique" value={fmtNumber(totals.organique)} hint={`${fmtPercent((totals.organique / totals.sessions) * 100, 0)} des sessions`} />
            <KpiCard label="Pages vues" value={fmtNumber(totals.pagesVues)} hint={`${(totals.pagesVues / totals.sessions).toFixed(1).replace('.', ',')} par session`} />
            <KpiCard label="Leads générés" value={fmtNumber(totals.leads)} hint={`${fmtPercent((totals.leads / totals.sessions) * 100, 2)} de conversion`} />
            <KpiCard label="Ventes" value={fmtNumber(totals.ventes)} hint="Signées sur la période" />
            <KpiCard label="CA généré" value={fmtEuro(totals.ca)} hint="Attribué au trafic" accent />
            <KpiCard label="Clics Google" value={fmtNumber(totals.clics)} hint="Search Console" />
            <KpiCard label="Impressions Google" value={fmtNumber(totals.impressions)} hint="Search Console" />
            <KpiCard label="CTR moyen" value={fmtPercent(totals.ctr, 2)} hint="Clics / impressions" />
            <KpiCard label="Position moyenne" value={totals.position.toFixed(1).replace('.', ',')} hint="Toutes requêtes" />
            <KpiCard label="CA moyen par lead" value={fmtEuro(totals.ca / Math.max(totals.leads, 1))} hint="Valeur d’un lead" />
          </div>

          <Box
            title="Évolution du trafic et des leads"
            action={
              <div className="flex gap-1">
                {seriesKeys.map((k) => (
                  <button
                    key={k}
                    onClick={() => setSeries(k)}
                    className={`rounded-md px-2.5 py-1.5 text-[11px] font-semibold transition-colors ${series === k ? 'bg-secondary text-primary' : 'text-muted-foreground hover:bg-muted'}`}
                  >
                    {seriesLabels[k]}
                  </button>
                ))}
              </div>
            }
          >
            <TrendChart series={series} />
            <p className="border-t border-border px-5 py-3 text-[11px] text-muted-foreground">
              Survolez une barre pour afficher le détail des sessions, clics et leads de la semaine.
            </p>
          </Box>
        </div>
      )}

      {tab === 'Pages' && (
        <Box title="Pages les plus consultées" action={<span className="text-xs text-muted-foreground">{pages.length} pages</span>}>
          <div className="flex flex-col gap-3 border-b border-border p-4 sm:flex-row sm:flex-wrap">
            <select aria-label="Période des pages" value={period} onChange={(e) => setPeriod(e.target.value as SeoPeriod)} className={select}>
              {seoPeriods.map((p) => <option key={p}>{p}</option>)}
            </select>
            <select aria-label="Service" value={service} onChange={(e) => setService(e.target.value)} className={select}>
              {seoServices.map((s) => <option key={s}>{s}</option>)}
            </select>
            <select aria-label="Canal" value={channel} onChange={(e) => setChannel(e.target.value)} className={select}>
              {seoChannels.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
          <Table
            headers={['Page', 'Vues', 'Utilisateurs', 'Temps d’engagement', 'Leads', 'Ventes', 'Tendance']}
            alignRight={[1, 2, 4, 5]}
            rows={pages.map((p) => ({
              key: p.url,
              cells: [
                <span className="block min-w-48">
                  <span className="flex items-center gap-1.5 font-bold text-foreground">{p.titre}<ExternalLink size={12} className="text-muted-foreground" /></span>
                  <span className="block text-[11px] text-muted-foreground">{p.url} · {p.canal}</span>
                </span>,
                fmtNumber(p.vues),
                fmtNumber(p.utilisateurs),
                p.engagement,
                <span className="font-semibold">{p.leads}</span>,
                <span className="font-semibold">{p.ventes}</span>,
                <span className={`font-semibold ${p.tendance > 0 ? 'text-foreground' : 'text-primary'}`}>{fmtSigned(p.tendance)} %</span>,
              ],
            }))}
          />
        </Box>
      )}

      {tab === 'Mots-clés SEO' && (
        <Box title="Principales requêtes Google" action={<span className="text-xs text-muted-foreground">Source : Search Console · {period}</span>}>
          <Table
            headers={['Mot-clé', 'Position moyenne', 'Clics', 'Impressions', 'CTR', 'Évolution', 'Tendance']}
            alignRight={[1, 2, 3, 4, 5]}
            rows={keywords.map((k) => ({
              key: k.mot,
              cells: [
                <span className="block min-w-48">
                  <span className="font-bold">{k.mot}</span>
                  <span className="block text-[11px] text-muted-foreground">{k.page} · {k.service}</span>
                </span>,
                <span className="font-semibold">{k.position.toFixed(1).replace('.', ',')}</span>,
                fmtNumber(k.clics),
                fmtNumber(k.impressions),
                fmtPercent(k.ctr, 1),
                <span className={`font-semibold ${k.evolution > 0 ? 'text-foreground' : k.evolution < 0 ? 'text-primary' : 'text-muted-foreground'}`}>{fmtSigned(k.evolution)}</span>,
                <TrendBadge evolution={k.evolution} />,
              ],
            }))}
          />
          <p className="border-t border-border px-5 py-3 text-[11px] text-muted-foreground">
            L’évolution compare la position moyenne à la période précédente : une valeur positive signifie un gain de places.
          </p>
        </Box>
      )}

      {tab === 'Opportunités SEO' && (
        <div className="space-y-5">
          <div className="grid gap-3 sm:grid-cols-3">
            <KpiCard label="Opportunités identifiées" value={String(lowCtr.length + nearTop.length + losing.length)} hint="À traiter ce mois" />
            <KpiCard label="Clics potentiels / mois" value="+ 420" hint="Si CTR optimisé" />
            <KpiCard label="Leads potentiels / mois" value="+ 14" hint="Estimation prudente" accent />
          </div>

          <Box title="Meilleures opportunités à traiter en priorité">
            <Table
              headers={['Priorité', 'Sujet', 'Constat', 'Action recommandée', 'Gain estimé']}
              rows={[
                { key: '1', cells: ['1', <span className="font-bold">aide rénovation énergétique 2026</span>, '12 640 impressions pour 1,0 % de CTR', 'Réécrire le titre et la méta description du guide', <span className="font-semibold">+ 120 clics</span>] },
                { key: '2', cells: ['2', <span className="font-bold">isolation extérieure prix m2</span>, 'Position 4,2 : le Top 3 est à portée', 'Enrichir le guide tarifaire et ajouter un tableau de prix', <span className="font-semibold">+ 90 clics</span>] },
                { key: '3', cells: ['3', <span className="font-bold">/services/menuiseries</span>, 'Trafic en baisse de 12,5 %', 'Mettre à jour la page et ajouter deux réalisations', <span className="font-semibold">+ 60 visites</span>] },
                { key: '4', cells: ['4', <span className="font-bold">climatisation réversible maison prix</span>, 'Position 13,4 avec 8 460 impressions', 'Créer un guide dédié au prix de la climatisation', <span className="font-semibold">+ 70 clics</span>] },
                { key: '5', cells: ['5', <span className="font-bold">pompe à chaleur air eau avis</span>, 'CTR de 0,8 % en position 11,2', 'Ajouter des témoignages clients et une FAQ', <span className="font-semibold">+ 50 clics</span>] },
              ]}
            />
          </Box>

          <div className="grid gap-5 xl:grid-cols-2">
            <Box title="Fortes impressions, faible CTR" action={<MousePointerClick size={15} className="text-muted-foreground" />}>
              <Table
                headers={['Mot-clé', 'Impressions', 'CTR', 'Position']}
                alignRight={[1, 2, 3]}
                rows={lowCtr.map((k) => ({ key: k.mot, cells: [<span className="font-semibold">{k.mot}</span>, fmtNumber(k.impressions), fmtPercent(k.ctr, 1), k.position.toFixed(1).replace('.', ',')] }))}
              />
            </Box>

            <Box title="Mots-clés en position 4 à 15" action={<Target size={15} className="text-muted-foreground" />}>
              <Table
                headers={['Mot-clé', 'Position', 'Clics', 'Impressions']}
                alignRight={[1, 2, 3]}
                rows={nearTop.map((k) => ({ key: k.mot, cells: [<span className="font-semibold">{k.mot}</span>, k.position.toFixed(1).replace('.', ','), fmtNumber(k.clics), fmtNumber(k.impressions)] }))}
              />
            </Box>

            <Box title="Pages ayant perdu du trafic" action={<TrendingDown size={15} className="text-primary" />}>
              <Table
                headers={['Page', 'Vues', 'Évolution']}
                alignRight={[1, 2]}
                rows={losing.map((p) => ({ key: p.url, cells: [<span><span className="font-semibold">{p.titre}</span><span className="block text-[11px] text-muted-foreground">{p.url}</span></span>, fmtNumber(p.vues), <span className="font-semibold text-primary">{fmtSigned(p.tendance)} %</span>] }))}
              />
            </Box>

            <Box title="Pages en progression" action={<TrendingUp size={15} className="text-muted-foreground" />}>
              <Table
                headers={['Page', 'Vues', 'Évolution']}
                alignRight={[1, 2]}
                rows={rising.map((p) => ({ key: p.url, cells: [<span><span className="font-semibold">{p.titre}</span><span className="block text-[11px] text-muted-foreground">{p.url}</span></span>, fmtNumber(p.vues), <span className="font-semibold">{fmtSigned(p.tendance)} %</span>] }))}
              />
            </Box>
          </div>
        </div>
      )}

      {/* Bloc Acquisition : trafic croisé avec les résultats commerciaux */}
      <Box
        title="Acquisition : du trafic au chiffre d’affaires"
        action={<span className="flex items-center gap-1.5 text-xs text-muted-foreground"><Search size={14} /> {period}</span>}
      >
        <Table
          headers={['Canal', 'Sessions', 'Leads', 'Qualifiés', 'Devis', 'Ventes', 'CA signé']}
          alignRight={[1, 2, 3, 4, 5, 6]}
          rows={[
            ...acquisitionRows.map((r) => ({
              key: r.canal,
              cells: [
                <span className="block min-w-40">
                  <span className="font-bold">{r.canal}</span>
                  <span className="mt-1.5 block h-1.5 w-full max-w-32 overflow-hidden rounded-full bg-muted">
                    <span className="block h-full rounded-full bg-primary" style={{ width: `${(r.sessions / maxSessions) * 100}%` }} />
                  </span>
                </span>,
                fmtNumber(r.sessions),
                fmtNumber(r.leads),
                fmtNumber(r.qualifies),
                fmtNumber(r.devis),
                <span className="font-semibold">{fmtNumber(r.ventes)}</span>,
                <span className="font-semibold">{fmtEuro(r.ca)}</span>,
              ],
            })),
            {
              key: 'total',
              cells: [
                <span className="font-bold uppercase text-[11px]">Total</span>,
                <span className="font-bold">{fmtNumber(acqTotal.sessions)}</span>,
                <span className="font-bold">{fmtNumber(acqTotal.leads)}</span>,
                <span className="font-bold">{fmtNumber(acqTotal.qualifies)}</span>,
                <span className="font-bold">{fmtNumber(acqTotal.devis)}</span>,
                <span className="font-bold">{fmtNumber(acqTotal.ventes)}</span>,
                <span className="font-bold">{fmtEuro(acqTotal.ca)}</span>,
              ],
            },
          ]}
        />
        <p className="flex items-center gap-1.5 border-t border-border px-5 py-3 text-[11px] text-muted-foreground">
          <ArrowRight size={13} /> Le référencement naturel apporte {fmtPercent((acquisitionRows[0]!.leads / acqTotal.leads) * 100, 0)} des leads et {fmtEuro(acquisitionRows[0]!.ca)} de chiffre d’affaires signé.
        </p>
      </Box>
    </div>
  );
}
