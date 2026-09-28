import { useMemo, useState } from 'react';
import { AlarmClock, ArrowRight, Ban, CalendarClock, Check, Flame, Mail, MapPin, Phone, Search, ShieldCheck, Timer, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useOekoDemo } from '@/lib/oeko-demo';
import type { Lead } from '@/lib/oeko-data';

type Queue = 'À traiter' | 'À rappeler' | 'Qualifiés' | 'Nurserie' | 'Écartés';
const queueOf = (s: string): Queue => ['Nouveau', 'À qualifier'].includes(s) ? 'À traiter' : s === 'À rappeler' ? 'À rappeler' : s === 'Nurserie' ? 'Nurserie' : ['Inexploitable', 'Abandon', 'Archivé', 'Perdu'].includes(s) ? 'Écartés' : 'Qualifiés';
const idf = ['75', '77', '78', '91', '92', '93', '94', '95'];
const waits: Record<string, number> = { 'OE-24091': 12, 'OE-24090': 47, 'OE-24087': 196, 'OE-24089': 1080, 'OE-24088': 1260, 'OE-24086': 2880 };
const fmtWait = (m: number) => m < 60 ? `${m} min` : m < 1440 ? `${Math.floor(m / 60)} h ${String(m % 60).padStart(2, '0')}` : `${Math.floor(m / 1440)} j`;
const checks = ['Propriétaire occupant', 'Maison individuelle', 'Revenus renseignés (MaPrimeRénov’)', 'Projet sous 3 mois', 'Budget validé'];
const sourceColor: Record<string, string> = { 'Google Ads': 'bg-primary/10 text-primary', SEO: 'bg-lime/60 text-foreground', Meta: 'bg-muted text-foreground', Appels: 'bg-foreground text-background', Email: 'bg-muted text-foreground' };

function score(l: Lead) {
  const amount = Number(l.amount.replace(/[^0-9]/g, '')) || 0;
  let s = 40 + Math.min(30, Math.round(amount / 800));
  if (idf.includes(l.zip.slice(0, 2))) s += 15;
  if (['Google Ads', 'Appels', 'SEO'].includes(l.source)) s += 10;
  return Math.min(98, s);
}

export function OekoQualification({ openLead }: { openLead: (l: Lead) => void }) {
  const { leadList, updateLead, addEvent } = useOekoDemo();
  const [queue, setQueue] = useState<Queue>('À traiter');
  const [q, setQ] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [ticked, setTicked] = useState<Record<string, string[]>>({});
  const [toast, setToast] = useState('');

  const counts = useMemo(() => leadList.reduce<Record<string, number>>((acc, l) => { const k = queueOf(l.status); acc[k] = (acc[k] ?? 0) + 1; return acc; }, {}), [leadList]);
  const list = leadList.filter(l => queueOf(l.status) === queue && `${l.name} ${l.city} ${l.phone} ${l.zip}`.toLowerCase().includes(q.toLowerCase()))
    .sort((a, b) => score(b) - score(a));
  const selected = leadList.find(l => l.id === selectedId) ?? list[0];
  const tick = selected ? ticked[selected.id] ?? [] : [];
  const notify = (m: string) => { setToast(m); window.setTimeout(() => setToast(''), 3000); };
  const setStatus = (status: string, message: string) => {
    if (!selected) return;
    updateLead(selected.id, { status, archived: status === 'Archivé' }, 'A traité un lead en qualification');
    addEvent({ leadId: selected.id, kind: 'Qualification', title: message, body: `Statut : ${status}`, who: 'Alexandre Martin' });
    setSelectedId(null); notify(message);
  };

  const kpis = [
    { icon: Zap, label: 'Délai moyen de 1er contact', value: '18 min', hint: 'Objectif < 30 min', good: true },
    { icon: Flame, label: 'Leads à traiter', value: String(counts['À traiter'] ?? 0), hint: '2 hors délai SLA', good: false },
    { icon: ShieldCheck, label: 'Taux de qualification', value: '68 %', hint: '+4,2 pts ce mois', good: true },
    { icon: CalendarClock, label: 'RDV fixés aujourd’hui', value: '5', hint: 'sur 11 appels joints', good: true },
  ];

  return <div className="space-y-5">
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">{kpis.map(k => <div key={k.label} className="rounded-lg border border-border bg-card p-4">
      <div className="flex items-center gap-2 text-[11px] font-semibold text-muted-foreground"><k.icon size={14} className="text-primary" />{k.label}</div>
      <div className="mt-2 text-2xl font-bold">{k.value}</div>
      <div className={`mt-1 text-[11px] font-semibold ${k.good ? 'text-primary' : 'text-destructive'}`}>{k.hint}</div>
    </div>)}</div>

    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex gap-1 overflow-x-auto rounded-lg bg-muted p-1">{(['À traiter', 'À rappeler', 'Qualifiés', 'Nurserie', 'Écartés'] as Queue[]).map(k =>
        <button key={k} onClick={() => { setQueue(k); setSelectedId(null); }} className={`flex h-8 shrink-0 items-center gap-2 rounded-md px-3 text-xs font-semibold ${queue === k ? 'bg-background shadow-sm' : 'text-muted-foreground'}`}>{k}<span className={`rounded px-1.5 text-[10px] ${queue === k ? 'bg-primary text-primary-foreground' : 'bg-background'}`}>{counts[k] ?? 0}</span></button>)}</div>
      <div className="relative sm:w-64"><Search size={15} className="absolute left-3 top-2.5 text-muted-foreground" /><Input value={q} onChange={e => setQ(e.target.value)} placeholder="Nom, ville, téléphone…" className="pl-9" /></div>
    </div>

    <div className="grid gap-5 lg:grid-cols-[1.1fr_1fr]">
      <div className="overflow-hidden rounded-lg border border-border bg-card">
        <div className="flex items-center justify-between border-b border-border px-4 py-3 text-xs"><span className="font-bold">File {queue.toLowerCase()}</span><span className="text-muted-foreground">Triée par score · {list.length} leads</span></div>
        {list.length === 0 && <p className="p-8 text-center text-sm text-muted-foreground">Aucun lead dans cette file.</p>}
        <ul className="divide-y divide-border">{list.map(l => {
          const w = waits[l.id] ?? 30; const late = queue === 'À traiter' && w > 30; const s = score(l);
          return <li key={l.id}><button onClick={() => setSelectedId(l.id)} className={`flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/60 ${selected?.id === l.id ? 'bg-primary/5 ring-1 ring-inset ring-primary/30' : ''}`}>
            <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">{l.initials}</div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2"><span className="truncate text-sm font-bold">{l.name}</span><span className={`rounded px-1.5 py-0.5 text-[10px] font-semibold ${sourceColor[l.source] ?? 'bg-muted'}`}>{l.source}</span></div>
              <div className="mt-0.5 truncate text-xs text-muted-foreground">{l.service} · {l.city} ({l.zip.slice(0, 2)}) · {l.amount}</div>
            </div>
            <div className="shrink-0 text-right">
              <div className={`text-sm font-bold ${s >= 80 ? 'text-primary' : ''}`}>{s}<span className="text-[10px] text-muted-foreground">/100</span></div>
              <div className={`mt-0.5 flex items-center justify-end gap-1 text-[10px] font-semibold ${late ? 'text-destructive' : 'text-muted-foreground'}`}><Timer size={11} />{fmtWait(w)}</div>
            </div>
          </button></li>;
        })}</ul>
      </div>

      {selected ? <div className="rounded-lg border border-border bg-card lg:sticky lg:top-4 lg:self-start">
        <div className="border-b border-border p-5">
          <div className="flex items-start justify-between gap-3"><div><p className="text-[11px] font-bold uppercase text-primary">Lead {selected.id}</p><h3 className="mt-1 text-lg font-bold">{selected.name}</h3><p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground"><MapPin size={12} />{selected.address}, {selected.zip} {selected.city}</p></div>
            <span className={`rounded px-2 py-1 text-[10px] font-bold ${idf.includes(selected.zip.slice(0, 2)) ? 'bg-lime text-lime-foreground' : 'bg-destructive/10 text-destructive'}`}>{idf.includes(selected.zip.slice(0, 2)) ? 'Zone IDF' : 'Hors zone'}</span></div>
          <div className="mt-4 flex flex-wrap gap-2"><Button size="sm" asChild><a href={`tel:${selected.phone.replaceAll(' ', '')}`}><Phone size={14} />{selected.phone}</a></Button><Button size="sm" variant="outline" asChild><a href={`mailto:${selected.email}`}><Mail size={14} />Email</a></Button></div>
        </div>
        <div className="space-y-5 p-5">
          <div><p className="text-xs font-bold">Demande</p><p className="mt-1 text-sm text-muted-foreground">« {selected.description} »</p>
            <div className="mt-2 flex flex-wrap gap-2 text-[11px]"><span className="rounded bg-muted px-2 py-1">{selected.service}</span><span className="rounded bg-muted px-2 py-1">Budget {selected.amount}</span><span className="rounded bg-muted px-2 py-1">Reçu {selected.date}</span></div></div>
          <div><div className="flex items-center justify-between"><p className="text-xs font-bold">Grille d’éligibilité</p><span className="text-[11px] font-semibold text-primary">{tick.length}/{checks.length}</span></div>
            <div className="mt-2 h-1.5 rounded bg-muted"><div className="h-full rounded bg-primary transition-all" style={{ width: `${(tick.length / checks.length) * 100}%` }} /></div>
            <ul className="mt-3 space-y-1.5">{checks.map(c => { const on = tick.includes(c); return <li key={c}><button onClick={() => setTicked(p => ({ ...p, [selected.id]: on ? tick.filter(x => x !== c) : [...tick, c] }))} className="flex w-full items-center gap-2.5 rounded-md px-2 py-1.5 text-left text-sm hover:bg-muted">
              <span className={`flex size-4 items-center justify-center rounded border ${on ? 'border-primary bg-primary text-primary-foreground' : 'border-input'}`}>{on && <Check size={11} />}</span>{c}</button></li>; })}</ul></div>
          <div className="grid gap-2 sm:grid-cols-2">
            <Button onClick={() => setStatus('Qualifié', `${selected.name} qualifié · transmis à ${selected.owner}`)}><ShieldCheck size={15} />Qualifier</Button>
            <Button variant="outline" onClick={() => setStatus('À rappeler', `Rappel programmé pour ${selected.name}`)}><AlarmClock size={15} />Fixer un rappel</Button>
            <Button variant="outline" onClick={() => setStatus('Nurserie', `${selected.name} placé en nurserie`)}><CalendarClock size={15} />Nurserie</Button>
            <Button variant="outline" className="text-destructive" onClick={() => setStatus('Inexploitable', `${selected.name} écarté`)}><Ban size={15} />Hors cible</Button>
          </div>
          <button onClick={() => openLead(selected)} className="flex items-center gap-1 text-xs font-semibold text-primary">Ouvrir la fiche complète <ArrowRight size={13} /></button>
        </div>
      </div> : <div className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">Sélectionnez un lead.</div>}
    </div>
    {toast && <div role="status" className="fixed bottom-5 right-5 z-50 rounded bg-primary px-4 py-3 text-xs font-semibold text-primary-foreground shadow-lg">{toast}</div>}
  </div>;
}
