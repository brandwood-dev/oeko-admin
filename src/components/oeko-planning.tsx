import { useMemo, useState } from 'react';
import { Link } from '@tanstack/react-router';
import { ChevronLeft, ChevronRight, Clock, MapPin, Navigation, Phone, X, FolderOpen, Car } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useOekoDemo } from '@/lib/oeko-demo';
import type { Rdv } from '@/lib/oeko-data';

type Kind = Rdv['kind'];

const kinds: Record<Kind, { label: string; card: string; dot: string }> = {
  visite: { label: 'Visites techniques', card: 'border-l-primary bg-primary/10', dot: 'bg-primary' },
  devis: { label: 'Présentations de devis', card: 'border-l-accent-foreground bg-accent', dot: 'bg-accent-foreground' },
  audit: { label: 'Audits énergétiques', card: 'border-l-foreground bg-muted', dot: 'bg-foreground' },
  appel: { label: 'Appels & suivis', card: 'border-l-muted-foreground bg-background', dot: 'bg-muted-foreground' },
};
const owners = [
  { name: 'Laurent Moreau', short: 'Laurent M.', initials: 'LM' },
  { name: 'Sophie Martin', short: 'Sophie M.', initials: 'SM' },
  { name: 'Thomas Leroy', short: 'Thomas L.', initials: 'TL' },
];
const days = ['Lun. 21', 'Mar. 22', 'Mer. 23', 'Jeu. 24', 'Ven. 25', 'Sam. 26', 'Dim. 27'];
const TODAY = 4, NOW = 11.33, H0 = 8, H1 = 19, ROW = 56;

const fmt = (h: number) => `${String(Math.floor(h)).padStart(2, '0')}:${String(Math.round((h % 1) * 60)).padStart(2, '0')}`;
const initials = (n: string) => owners.find(o => o.name === n)?.initials ?? '?';


function Card({ r, onOpen, compact }: { r: Rdv; onOpen: (r: Rdv) => void; compact?: boolean }) {
  const k = kinds[r.kind];
  return <button type="button" onClick={() => onOpen(r)} className={`h-full w-full overflow-hidden rounded-md border border-border border-l-[3px] ${k.card} p-2 text-left text-[11px] leading-tight shadow-sm transition hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${r.status === 'Reporté' ? 'opacity-60' : ''}`}>
    <div className="flex items-center justify-between gap-1"><span className="font-semibold tabular-nums text-muted-foreground">{fmt(r.start)} – {fmt(r.end)}</span><span className="grid size-5 shrink-0 place-items-center rounded-full bg-foreground text-[8px] font-bold text-background">{initials(r.owner)}</span></div>
    <div className="mt-1 truncate font-bold">{r.client} <span className="font-medium text-muted-foreground">({r.project})</span></div>
    {!compact && <div className="mt-0.5 truncate text-muted-foreground">{r.city} ({r.dep})</div>}
  </button>;
}

export function OekoPlanning() {
  const [mode, setMode] = useState('Semaine');
  const [offset, setOffset] = useState(0);
  const [kindOn, setKindOn] = useState<Kind[]>(['visite', 'devis', 'audit', 'appel']);
  const [ownerOn, setOwnerOn] = useState<string[]>(owners.map(o => o.name));
  const [open, setOpen] = useState<Rdv | null>(null);
  const { rdvList, updateRdv } = useOekoDemo();
  const list = useMemo(() => offset !== 0 ? [] : rdvList.filter(r => kindOn.includes(r.kind) && ownerOn.includes(r.owner)), [offset, kindOn, ownerOn, rdvList]);
  const toggle = <T,>(arr: T[], v: T, set: (a: T[]) => void) => set(arr.includes(v) ? arr.filter(x => x !== v) : [...arr, v]);
  const hours = Array.from({ length: H1 - H0 }, (_, i) => H0 + i);
  const shownDays = mode === 'Jour' ? [TODAY] : [0, 1, 2, 3, 4, 5, 6];
  const label = mode === 'Jour' ? (offset === 0 ? 'Vendredi 25 septembre 2026' : `Jour ${offset > 0 ? '+' : ''}${offset}`) : mode === 'Mois' ? (offset === 0 ? 'Septembre 2026' : `Mois ${offset > 0 ? '+' : ''}${offset}`) : offset === 0 ? '21 – 27 septembre 2026' : `Semaine ${offset > 0 ? '+' : ''}${offset}`;
  const current = open ? list.find(r => r.id === open.id) ?? open : null;

  const grid = <div className="overflow-x-auto rounded-lg border border-border bg-background">
    <div className={mode === 'Jour' ? '' : 'min-w-[860px]'}>
      <div className="grid border-b border-border" style={{ gridTemplateColumns: `56px repeat(${shownDays.length}, 1fr)` }}>
        <div />{shownDays.map(d => <div key={d} className={`border-l border-border px-2 py-3 text-center text-xs font-semibold ${d === TODAY && offset === 0 ? 'text-primary' : 'text-muted-foreground'}`}>{mode === 'Jour' ? label : days[d]}{d === TODAY && offset === 0 && <span className="ml-1.5 rounded-full bg-primary px-1.5 py-0.5 text-[9px] text-primary-foreground">Aujourd’hui</span>}</div>)}
      </div>
      <div className="relative grid" style={{ gridTemplateColumns: `56px repeat(${shownDays.length}, 1fr)` }}>
        <div>{hours.map(h => <div key={h} style={{ height: ROW }} className="-translate-y-2 pr-2 text-right text-[10px] tabular-nums text-muted-foreground">{fmt(h)}</div>)}</div>
        {shownDays.map(d => {
          const evs = list.filter(r => r.day === d);
          return <div key={d} className={`relative border-l border-border ${d >= 5 ? 'bg-muted/40' : ''}`} style={{ height: ROW * hours.length }}>
            {hours.map(h => <div key={h} style={{ top: (h - H0) * ROW }} className="absolute inset-x-0 border-t border-border/60" />)}
            {evs.map(r => { const overlap = evs.filter(o => o.id !== r.id && o.start < r.end && o.end > r.start); const col = overlap.length ? (evs.indexOf(r) > evs.indexOf(overlap[0]!) ? 1 : 0) : 0;
              return <div key={r.id} className="absolute px-1" style={{ top: (r.start - H0) * ROW + 2, height: (r.end - r.start) * ROW - 4, left: overlap.length ? `${col * 50}%` : 0, width: overlap.length ? '50%' : '100%' }}><Card r={r} onOpen={setOpen} compact={r.end - r.start <= 0.5} /></div>; })}
            {d === TODAY && offset === 0 && <div className="pointer-events-none absolute inset-x-0 z-10 flex items-center" style={{ top: (NOW - H0) * ROW }}><span className="size-2.5 -translate-x-1 rounded-full bg-destructive" /><span className="h-0.5 flex-1 bg-destructive" /></div>}
          </div>;
        })}
      </div>
    </div>
  </div>;

  const dayTrips = mode === 'Jour' ? list.filter(r => r.day === TODAY).sort((a, b) => a.start - b.start) : [];

  return <div className="space-y-4">
    <div className="space-y-4 rounded-lg border border-border bg-background p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2"><Button variant="outline" size="sm" onClick={() => setOffset(0)}>Aujourd’hui</Button><Button variant="ghost" size="icon" onClick={() => setOffset(offset - 1)} aria-label="Période précédente"><ChevronLeft /></Button><Button variant="ghost" size="icon" onClick={() => setOffset(offset + 1)} aria-label="Période suivante"><ChevronRight /></Button><span className="text-sm font-bold sm:text-base">{label}</span></div>
        <div className="flex gap-1 rounded-lg bg-muted p-1">{['Jour', 'Semaine', 'Mois', 'Liste'].map(m => <Button key={m} size="sm" variant={mode === m ? 'default' : 'ghost'} onClick={() => setMode(m)} className="h-8 min-w-[4.75rem] flex-1 rounded-md px-3 text-xs font-semibold sm:flex-none sm:min-w-[6rem]">{m}</Button>)}</div>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
        <div className="flex flex-wrap gap-2">{(Object.keys(kinds) as Kind[]).map(k => { const on = kindOn.includes(k); return <button key={k} type="button" aria-pressed={on} onClick={() => toggle(kindOn, k, setKindOn)} className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition ${on ? 'border-foreground bg-foreground text-background' : 'border-border text-muted-foreground hover:border-foreground'}`}><span className={`size-2 rounded-full ${kinds[k].dot} ${on ? 'ring-1 ring-background' : ''}`} />{kinds[k].label}</button>; })}</div>
        <div className="flex items-center gap-1.5"><span className="mr-1 text-xs text-muted-foreground">Équipe</span>{owners.map(o => { const on = ownerOn.includes(o.name); return <button key={o.name} type="button" aria-pressed={on} title={o.name} onClick={() => toggle(ownerOn, o.name, setOwnerOn)} className={`flex items-center gap-1.5 rounded-full border py-1 pl-1 pr-2.5 text-xs font-medium transition ${on ? 'border-primary bg-primary/10 text-foreground' : 'border-border text-muted-foreground opacity-60'}`}><span className={`grid size-6 place-items-center rounded-full text-[9px] font-bold ${on ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>{o.initials}</span><span className="hidden sm:inline">{o.short}</span></button>; })}</div>
      </div>
    </div>

    {(mode === 'Semaine' || mode === 'Jour') && <div className={mode === 'Jour' ? 'grid gap-4 lg:grid-cols-[1fr_320px]' : ''}>{grid}
      {mode === 'Jour' && <aside className="rounded-lg border border-border bg-background p-4"><h3 className="text-sm font-bold">Tournée du jour</h3><p className="mt-1 text-xs text-muted-foreground">{dayTrips.length} rendez-vous · trajets estimés</p><ol className="mt-4 space-y-1">{dayTrips.map((r, i) => <li key={r.id}>{i > 0 && <div className="my-1 ml-3 flex items-center gap-2 border-l border-dashed border-border py-1.5 pl-4 text-[11px] text-muted-foreground"><Car size={12} /> {[35, 25, 50, 40][i % 4]} min · {r.city}</div>}<button type="button" onClick={() => setOpen(r)} className="flex w-full items-start gap-3 rounded-md p-2 text-left hover:bg-muted"><span className={`mt-1 size-2.5 rounded-full ${kinds[r.kind].dot}`} /><span className="flex-1"><span className="block text-xs font-bold">{fmt(r.start)} · {r.client}</span><span className="block text-[11px] text-muted-foreground">{r.city} ({r.dep}) · {r.owner}</span></span></button></li>)}{!dayTrips.length && <li className="text-xs text-muted-foreground">Aucun rendez-vous.</li>}</ol></aside>}
    </div>}

    {mode === 'Mois' && <div className="grid grid-cols-7 overflow-hidden rounded-lg border border-border bg-background">{['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map(d => <div key={d} className="border-b border-border p-2 text-center text-[11px] font-semibold text-muted-foreground">{d}</div>)}{Array.from({ length: 35 }, (_, i) => { const n = i - 1; const inWeek = n >= 21 && n <= 27; const evs = inWeek ? list.filter(r => r.day === n - 21) : []; return <div key={i} className={`min-h-20 border-b border-l border-border p-1.5 sm:min-h-28 ${n < 1 || n > 30 ? 'bg-muted/40' : ''}`}><div className={`mb-1 text-[11px] font-semibold ${n === 25 && offset === 0 ? 'grid size-5 place-items-center rounded-full bg-primary text-primary-foreground' : 'text-muted-foreground'}`}>{n >= 1 && n <= 30 ? n : ''}</div><div className="space-y-1">{evs.slice(0, 3).map(r => <button key={r.id} type="button" onClick={() => setOpen(r)} className="flex w-full items-center gap-1 truncate rounded px-1 text-left text-[10px] hover:bg-muted"><span className={`size-1.5 shrink-0 rounded-full ${kinds[r.kind].dot}`} /><span className="hidden tabular-nums text-muted-foreground sm:inline">{fmt(r.start)}</span><span className="truncate font-medium">{r.client.split(' ')[1]}</span></button>)}{evs.length > 3 && <span className="px-1 text-[10px] text-muted-foreground">+{evs.length - 3} autres</span>}</div></div>; })}</div>}

    {mode === 'Liste' && <div className="overflow-hidden rounded-lg border border-border bg-background">{shownDays.map(d => { const evs = list.filter(r => r.day === d).sort((a, b) => a.start - b.start); if (!evs.length) return null; return <div key={d}><div className="border-b border-border bg-muted/50 px-4 py-2 text-xs font-bold">{days[d]} septembre{d === TODAY && ' · Aujourd’hui'}</div>{evs.map(r => <button key={r.id} type="button" onClick={() => setOpen(r)} className="flex w-full flex-wrap items-center gap-x-4 gap-y-1 border-b border-border px-4 py-3 text-left text-sm last:border-b-0 hover:bg-muted/40"><span className="w-28 tabular-nums text-xs font-semibold text-muted-foreground">{fmt(r.start)} – {fmt(r.end)}</span><span className={`size-2 rounded-full ${kinds[r.kind].dot}`} /><span className="min-w-40 flex-1 font-semibold">{r.client} <span className="font-normal text-muted-foreground">· {r.project}</span></span><span className="text-xs text-muted-foreground">{r.city} ({r.dep})</span><span className="text-xs">{r.owner}</span><span className="rounded-full border border-border px-2 py-0.5 text-[10px] font-semibold">{r.status}</span></button>)}</div>; })}{!list.length && <p className="p-6 text-center text-sm text-muted-foreground">Aucun rendez-vous sur cette période.</p>}</div>}

    {current && <div className="fixed inset-0 z-50 flex justify-end bg-foreground/30" onClick={() => setOpen(null)}>
      <aside role="dialog" aria-label="Détail du rendez-vous" onClick={e => e.stopPropagation()} className="flex h-full w-full max-w-md flex-col overflow-y-auto bg-background shadow-2xl">
        <div className="flex items-start justify-between gap-3 border-b border-border p-5"><div><span className="flex items-center gap-2 text-[11px] font-bold uppercase text-primary"><span className={`size-2 rounded-full ${kinds[current.kind].dot}`} />{kinds[current.kind].label.replace(/s( |$)/g, '$1').trim()}</span><h2 className="mt-2 text-xl font-bold">{current.client}</h2><p className="text-sm text-muted-foreground">{current.project} · Dossier {current.lead}</p></div><Button variant="ghost" size="icon" onClick={() => setOpen(null)} aria-label="Fermer"><X /></Button></div>
        <div className="space-y-5 p-5 text-sm">
          <div className="flex items-center gap-3"><Clock size={16} className="text-muted-foreground" /><span>{days[current.day]} septembre · {fmt(current.start)} – {fmt(current.end)}</span></div>
          <div className="flex items-start gap-3"><MapPin size={16} className="mt-0.5 text-muted-foreground" /><div><div>{current.address}</div><div className="mt-2 flex gap-2"><Button asChild variant="outline" size="sm"><a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(current.address)}`} target="_blank" rel="noreferrer"><MapPin size={14} /> Maps</a></Button><Button asChild variant="outline" size="sm"><a href={`https://waze.com/ul?q=${encodeURIComponent(current.address)}`} target="_blank" rel="noreferrer"><Navigation size={14} /> Waze</a></Button></div></div></div>
          <div className="flex items-center gap-3"><Phone size={16} className="text-muted-foreground" /><a href={`tel:${current.phone.replaceAll(' ', '')}`} className="font-semibold text-primary hover:underline">{current.phone}</a></div>
          <div><div className="mb-2 text-xs font-semibold text-muted-foreground">Statut du rendez-vous</div><div className="grid grid-cols-2 gap-2">{['Confirmé', 'Effectué', 'Reporté', 'Annulé / Absent'].map(s => <Button key={s} size="sm" variant={current.status === s ? 'default' : 'outline'} onClick={() => setStatuses(p => ({ ...p, [current.id]: s }))}>{s}</Button>)}</div></div>
          <div><label htmlFor="rdv-owner" className="mb-2 block text-xs font-semibold text-muted-foreground">Commercial</label><select id="rdv-owner" defaultValue={current.owner} className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm">{owners.map(o => <option key={o.name}>{o.name}</option>)}</select></div>
          <div><label htmlFor="rdv-cr" className="mb-2 block text-xs font-semibold text-muted-foreground">Compte-rendu</label><textarea id="rdv-cr" className="min-h-24 w-full rounded-md border border-input bg-background p-3 text-sm" placeholder="Observations, mesures, points à chiffrer…" /></div>
        </div>
        <div className="mt-auto border-t border-border p-5"><Button asChild className="w-full"><Link to="/$section/$item" params={{ section: 'dossiers', item: current.lead }}><FolderOpen size={16} /> Consulter le dossier CRM ({current.lead})</Link></Button></div>
      </aside>
    </div>}
  </div>;
}
