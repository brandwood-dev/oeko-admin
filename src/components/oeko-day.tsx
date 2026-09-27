import { useMemo, useState } from 'react';
import { AlertTriangle, ArrowRight, CalendarDays, Car, Check, Clock, FileText, MapPin, Navigation, Phone, Send, ShieldCheck, Sparkles, Target } from 'lucide-react';
import type { Lead, View } from '@/lib/oeko-data';

type Kind = 'Appel' | 'Visite' | 'Relance devis' | 'Aides' | 'Devis';
type Task = { id: string; time: string; kind: Kind; lead: string; leadId?: string; detail: string; city: string; amount: string; urgent?: boolean; late?: boolean };

const tasks: Task[] = [
  { id: 't1', time: '09:00', kind: 'Appel', lead: 'Marc Lefèvre', leadId: 'OE-24087', detail: 'Premier contact · Ravalement façade', city: 'Boulogne (92)', amount: '16 400 €', late: true },
  { id: 't2', time: '10:00', kind: 'Visite', lead: 'Camille Petit', leadId: 'OE-24089', detail: 'Visite technique toiture + métrés', city: 'Montreuil (93)', amount: '22 800 €' },
  { id: 't3', time: '11:00', kind: 'Relance devis', lead: 'Nadia Bensalem', leadId: 'OE-24088', detail: 'Devis DEV-2026-084 envoyé il y a 5 j', city: 'Saint-Denis (93)', amount: '9 600 €', urgent: true },
  { id: 't4', time: '12:00', kind: 'Aides', lead: 'Laurent Dubois', leadId: 'OE-24090', detail: 'Avis d’imposition manquant · MaPrimeRénov’', city: 'Versailles (78)', amount: '14 200 €', urgent: true },
  { id: 't5', time: '14:30', kind: 'Visite', lead: 'Foued Benali', leadId: 'OE-24091', detail: 'Audit façade ITE · maison 1985', city: 'Créteil (94)', amount: '18 500 €' },
  { id: 't6', time: '16:00', kind: 'Appel', lead: 'Laurent Dubois', leadId: 'OE-24090', detail: 'Rappel convenu · choix PAC air-eau', city: 'Versailles (78)', amount: '14 200 €' },
  { id: 't7', time: '17:30', kind: 'Devis', lead: 'Sofia Rahmani', leadId: 'OE-24086', detail: 'Préparer devis climatisation réversible', city: 'Cergy (95)', amount: '7 900 €' },
];
const kindStyle: Record<Kind, string> = {
  Appel: 'bg-secondary text-primary', Visite: 'bg-primary text-primary-foreground', 'Relance devis': 'bg-lime text-lime-foreground', Aides: 'bg-accent text-accent-foreground', Devis: 'bg-muted text-foreground',
};
const kindIcon = { Appel: Phone, Visite: MapPin, 'Relance devis': Send, Aides: ShieldCheck, Devis: FileText };
const route = [
  { time: '10:00', city: 'Montreuil (93)', who: 'Camille Petit', drive: null },
  { time: '14:30', city: 'Créteil (94)', who: 'Foued Benali', drive: '32 min · 14 km' },
];
const aides = [
  { name: 'Laurent Dubois', item: 'Avis d’imposition 2025', status: 'Bloquant' },
  { name: 'Camille Petit', item: 'Attestation de propriété', status: 'À demander' },
  { name: 'Foued Benali', item: 'Éligibilité CEE à confirmer', status: 'En cours' },
];
const hot = [
  { name: 'Nadia Bensalem', id: 'OE-24088', amount: '9 600 €', score: 86, note: 'A ouvert le devis 3 fois' },
  { name: 'Camille Petit', id: 'OE-24089', amount: '22 800 €', score: 78, note: 'Visite demain, budget validé' },
];
const filters = ['Tout', 'Appel', 'Visite', 'Relance devis', 'Aides', 'Devis'] as const;

export function OekoDay({ leadList, openLead, go }: { leadList: Lead[]; openLead: (l: Lead) => void; go: (v: View) => void }) {
  const [done, setDone] = useState<Record<string, boolean>>({});
  const [filter, setFilter] = useState<(typeof filters)[number]>('Tout');
  const [note, setNote] = useState('');
  const [saved, setSaved] = useState<string[]>([]);
  const list = useMemo(() => tasks.filter(t => filter === 'Tout' || t.kind === filter), [filter]);
  const doneCount = tasks.filter(t => done[t.id]).length;
  const pct = Math.round((doneCount / tasks.length) * 100);
  const open = (id?: string) => { const l = leadList.find(x => x.id === id); if (l) openLead(l); };
  const next = tasks.find(t => !done[t.id]);

  return (
    <div className="space-y-5">
      <section className="grid gap-4 rounded-xl bg-primary p-5 text-primary-foreground md:grid-cols-[1.4fr_1fr] md:p-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider opacity-70">Dimanche 27 septembre · Laurent Moreau</p>
          <h2 className="mt-2 text-2xl font-bold">Bonjour Laurent, 7 actions vous attendent.</h2>
          <p className="mt-1 text-sm opacity-80">2 visites terrain, 2 urgences à traiter avant midi et 92 700 € de potentiel en jeu aujourd’hui.</p>
          {next && <button onClick={() => open(next.leadId)} className="mt-4 inline-flex items-center gap-2 rounded-lg bg-lime px-4 py-2 text-sm font-bold text-lime-foreground">Prochaine action · {next.time} {next.lead}<ArrowRight size={15} /></button>}
        </div>
        <div className="rounded-lg bg-primary-foreground/10 p-4">
          <div className="flex items-center justify-between text-sm font-semibold"><span className="inline-flex items-center gap-2"><Target size={16} />Progression du jour</span><span>{doneCount}/{tasks.length}</span></div>
          <div className="mt-3 h-2 rounded-full bg-primary-foreground/20"><div className="h-2 rounded-full bg-lime transition-all" style={{ width: `${pct}%` }} /></div>
          <div className="mt-4 grid grid-cols-3 gap-2 text-center">
            {[['Appels', '2'], ['Visites', '2'], ['Devis', '2']].map(([k, v]) => <div key={k} className="rounded-md bg-primary-foreground/10 py-2"><p className="text-lg font-bold">{v}</p><p className="text-[11px] opacity-75">{k}</p></div>)}
          </div>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[[AlertTriangle, 'En retard', '1', 'Marc Lefèvre · 09:00'], [Send, 'Devis à relancer', '4', '38 700 € en attente'], [ShieldCheck, 'Aides bloquées', '3', 'MaPrimeRénov’ / CEE'], [Sparkles, 'Nouveaux leads', '2', 'À qualifier < 1 h']].map(([Icon, l, v, s]) => {
          const I = Icon as typeof Phone;
          return <div key={l as string} className="rounded-xl border border-border bg-card p-4"><I size={17} className="text-primary" /><p className="mt-3 text-2xl font-bold">{v as string}</p><p className="text-xs font-semibold">{l as string}</p><p className="mt-0.5 truncate text-[11px] text-muted-foreground">{s as string}</p></div>;
        })}
      </section>

      <div className="grid gap-5 lg:grid-cols-[1.75fr_1fr]">
        <section className="rounded-xl border border-border bg-card">
          <div className="flex flex-col gap-3 border-b border-border p-4 sm:flex-row sm:items-center sm:justify-between">
            <h3 className="font-bold">Fil d’actions priorisé</h3>
            <div className="flex gap-1.5 overflow-x-auto">{filters.map(f => <button key={f} onClick={() => setFilter(f)} className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${filter === f ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>{f}</button>)}</div>
          </div>
          <ul className="divide-y divide-border">
            {list.map(t => { const I = kindIcon[t.kind]; const d = done[t.id]; return (
              <li key={t.id} className={`flex items-start gap-3 p-4 ${d ? 'opacity-50' : ''}`}>
                <button aria-label="Marquer comme fait" onClick={() => setDone(p => ({ ...p, [t.id]: !p[t.id] }))} className={`mt-0.5 flex size-5 shrink-0 items-center justify-center rounded border ${d ? 'border-primary bg-primary text-primary-foreground' : 'border-border'}`}>{d && <Check size={13} />}</button>
                <div className="w-12 shrink-0 text-xs font-bold tabular-nums"><Clock size={12} className="mb-0.5 inline" /> {t.time}</div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`inline-flex items-center gap-1 rounded px-2 py-0.5 text-[11px] font-bold ${kindStyle[t.kind]}`}><I size={11} />{t.kind}</span>
                    {t.late && <span className="rounded bg-destructive/10 px-2 py-0.5 text-[11px] font-bold text-destructive">En retard</span>}
                    {t.urgent && <span className="rounded bg-destructive/10 px-2 py-0.5 text-[11px] font-bold text-destructive">Urgent</span>}
                  </div>
                  <button onClick={() => open(t.leadId)} className={`mt-1 text-left text-sm font-semibold hover:underline ${d ? 'line-through' : ''}`}>{t.lead}</button>
                  <p className="text-xs text-muted-foreground">{t.detail} · {t.city}</p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-2">
                  <span className="text-xs font-bold">{t.amount}</span>
                  <a href="tel:0612843571" aria-label="Appeler" className="flex size-7 items-center justify-center rounded-md bg-secondary text-primary"><Phone size={13} /></a>
                </div>
              </li>); })}
            {list.length === 0 && <li className="p-6 text-center text-sm text-muted-foreground">Aucune action de ce type aujourd’hui.</li>}
          </ul>
        </section>

        <aside className="space-y-5">
          <section className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-center justify-between"><h3 className="font-bold">Tournée terrain</h3><span className="inline-flex items-center gap-1 text-xs text-muted-foreground"><Car size={13} />46 km au total</span></div>
            <ol className="mt-4 space-y-3">{route.map(r => <li key={r.time}>
              {r.drive && <p className="mb-2 ml-3 border-l-2 border-dashed border-border pl-4 text-[11px] text-muted-foreground">Trajet estimé · {r.drive}</p>}
              <div className="flex items-center gap-3 rounded-lg bg-canvas p-3"><span className="flex size-8 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">{r.time.slice(0, 2)}h</span><div className="min-w-0 flex-1"><p className="text-sm font-semibold">{r.who}</p><p className="text-xs text-muted-foreground">{r.time} · {r.city}</p></div><a target="_blank" rel="noreferrer" href={`https://waze.com/ul?q=${encodeURIComponent(r.city)}`} aria-label="Itinéraire" className="flex size-8 items-center justify-center rounded-md bg-lime text-lime-foreground"><Navigation size={14} /></a></div>
            </li>)}</ol>
            <button onClick={() => go('planning')} className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-primary">Voir le planning <CalendarDays size={13} /></button>
          </section>

          <section className="rounded-xl border border-border bg-card p-4">
            <h3 className="font-bold">Dossiers d’aides à débloquer</h3>
            <ul className="mt-3 space-y-2">{aides.map(a => <li key={a.name} className="flex items-center justify-between gap-2 text-xs"><div className="min-w-0"><p className="font-semibold">{a.name}</p><p className="truncate text-muted-foreground">{a.item}</p></div><span className={`shrink-0 rounded px-2 py-0.5 font-bold ${a.status === 'Bloquant' ? 'bg-destructive/10 text-destructive' : 'bg-secondary text-primary'}`}>{a.status}</span></li>)}</ul>
          </section>

          <section className="rounded-xl border border-border bg-card p-4">
            <h3 className="font-bold">Signatures proches</h3>
            <ul className="mt-3 space-y-3">{hot.map(h => <li key={h.id}><button onClick={() => open(h.id)} className="w-full text-left"><div className="flex justify-between text-sm font-semibold"><span>{h.name}</span><span>{h.amount}</span></div><div className="mt-1.5 h-1.5 rounded-full bg-muted"><div className="h-1.5 rounded-full bg-primary" style={{ width: `${h.score}%` }} /></div><p className="mt-1 text-[11px] text-muted-foreground">Score {h.score} · {h.note}</p></button></li>)}</ul>
          </section>

          <section className="rounded-xl border border-border bg-card p-4">
            <h3 className="font-bold">Compte-rendu express</h3>
            <textarea value={note} onChange={e => setNote(e.target.value)} placeholder="Note rapide après une visite ou un appel…" className="mt-3 h-20 w-full resize-none rounded-lg border border-input bg-background p-2 text-sm outline-none focus:ring-2 focus:ring-ring" />
            <button disabled={!note.trim()} onClick={() => { setSaved(s => [note.trim(), ...s]); setNote(''); }} className="mt-2 w-full rounded-lg bg-primary py-2 text-sm font-semibold text-primary-foreground disabled:opacity-40">Enregistrer la note</button>
            {saved.map((s, i) => <p key={i} className="mt-2 rounded bg-canvas p-2 text-xs">{s}</p>)}
          </section>
        </aside>
      </div>
    </div>
  );
}
