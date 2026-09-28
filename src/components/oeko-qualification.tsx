import { useMemo, useState } from 'react';
import { AlarmClock, ArrowRight, Ban, CalendarClock, Check, Flame, Mail, MapPin, Phone, RotateCcw, Search, ShieldCheck, Timer, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useOekoDemo } from '@/lib/oeko-demo';
import { LOSS_REASONS, OWNERS, SOURCES, STATUSES, TASK_TYPES, services, type Lead } from '@/lib/oeko-data';

type Queue = 'À traiter' | 'À rappeler' | 'Qualifiés' | 'Nurserie' | 'Écartés';
const queueOf = (s: string): Queue => ['Nouveau', 'À qualifier'].includes(s) ? 'À traiter' : s === 'À rappeler' ? 'À rappeler' : s === 'Nurserie' ? 'Nurserie' : ['Inexploitable', 'Abandon', 'Archivé', 'Perdu'].includes(s) ? 'Écartés' : 'Qualifiés';
const idf = ['75', '77', '78', '91', '92', '93', '94', '95'];
const waits: Record<string, number> = { 'OE-24091': 12, 'OE-24090': 47, 'OE-24087': 196, 'OE-24089': 1080, 'OE-24088': 1260, 'OE-24086': 2880 };
const fmtWait = (m: number) => m < 60 ? `${m} min` : m < 1440 ? `${Math.floor(m / 60)} h ${String(m % 60).padStart(2, '0')}` : `${Math.floor(m / 1440)} j`;
const checks = ['Propriétaire occupant', 'Maison individuelle', 'Revenus renseignés (MaPrimeRénov’)', 'Projet sous 3 mois', 'Budget validé'];
const sourceColor: Record<string, string> = { 'Google Ads': 'bg-primary/10 text-primary', SEO: 'bg-lime/60 text-foreground', Meta: 'bg-muted text-foreground', Appels: 'bg-foreground text-background', Email: 'bg-muted text-foreground' };
const URGENCY = ['Immédiate', 'Sous 3 mois', 'Sous 6 mois', 'Plus de 6 mois', 'Simple information'];
const PRIORITY = ['Haute', 'Normale', 'Basse'];
const POTENTIAL = ['Élevé', 'Moyen', 'Faible'];
const DATES = ['Toutes les dates', 'Aujourd’hui', 'Hier', 'Cette semaine'];
const SORTS = ['Score décroissant', 'Plus ancien', 'Sans action récente'];
const sel = 'h-9 w-full rounded-md border border-border bg-background px-2 text-xs';
const matchDate = (l: Lead, f: string) => f === DATES[0] || (f === 'Aujourd’hui' ? l.date.startsWith('Aujourd') : f === 'Hier' ? l.date.startsWith('Hier') : l.date.startsWith('Aujourd') || l.date.startsWith('Hier') || l.date.includes('sept'));

function score(l: Lead) {
  const amount = Number(l.amount.replace(/[^0-9]/g, '')) || 0;
  let s = 40 + Math.min(30, Math.round(amount / 800));
  if (idf.includes(l.zip.slice(0, 2))) s += 15;
  if (['Google Ads', 'Appels', 'SEO'].includes(l.source)) s += 10;
  return Math.min(98, s);
}

export function OekoQualification({ openLead }: { openLead: (l: Lead) => void }) {
  const { leadList, updateLead, addEvent, checkGrid, toggleCheck, addTask } = useOekoDemo();
  const [queue, setQueue] = useState<Queue>('À traiter');
  const [q, setQ] = useState('');
  const [dateF, setDateF] = useState(DATES[0]!);
  const [sourceF, setSourceF] = useState('Toutes les sources');
  const [serviceF, setServiceF] = useState('Tous les services');
  const [statusF, setStatusF] = useState('Tous les statuts');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [toast, setToast] = useState('');
  const [taskType, setTaskType] = useState(TASK_TYPES[0]!);
  const [taskDate, setTaskDate] = useState('');
  const [taskTime, setTaskTime] = useState('');
  const [taskNote, setTaskNote] = useState('');
  const [reasonFor, setReasonFor] = useState<string | null>(null);
  const [reason, setReason] = useState(LOSS_REASONS[0]!);
  const [sortF, setSortF] = useState(SORTS[0]!);
  const [err, setErr] = useState<{ owner?: string; task?: string }>({});
  const [confirmAct, setConfirmAct] = useState<{ title: string; text: string; run: () => void } | null>(null);

  const counts = useMemo(() => leadList.reduce<Record<string, number>>((acc, l) => { const k = queueOf(l.status); acc[k] = (acc[k] ?? 0) + 1; return acc; }, {}), [leadList]);
  const activeFilters = [dateF !== DATES[0] && dateF, sourceF !== 'Toutes les sources' && sourceF, serviceF !== 'Tous les services' && serviceF, statusF !== 'Tous les statuts' && statusF, sortF !== SORTS[0] && sortF].filter(Boolean) as string[];
  const resetFilters = () => { setDateF(DATES[0]!); setSourceF('Toutes les sources'); setServiceF('Tous les services'); setStatusF('Tous les statuts'); setSortF(SORTS[0]!); setQ(''); };
  const noAction = (l: Lead) => !l.next || l.next === 'Aucune action' || l.next.startsWith('Aucune');
  const list = leadList
    .filter(l => queueOf(l.status) === queue
      && `${l.name} ${l.city} ${l.phone} ${l.zip} ${l.email}`.toLowerCase().includes(q.toLowerCase())
      && matchDate(l, dateF)
      && (sourceF === 'Toutes les sources' || l.source === sourceF)
      && (serviceF === 'Tous les services' || l.service === serviceF)
      && (statusF === 'Tous les statuts' || l.status === statusF)
      && (sortF !== 'Sans action récente' || noAction(l)))
    .sort((a, b) => sortF === 'Plus ancien' ? (waits[b.id] ?? 30) - (waits[a.id] ?? 30) : sortF === 'Sans action récente' ? (waits[b.id] ?? 30) - (waits[a.id] ?? 30) : score(b) - score(a));
  const selected = leadList.find(l => l.id === selectedId) ?? list[0];
  const tick = selected ? checkGrid[selected.id] ?? [] : [];
  const notify = (m: string) => { setToast(m); window.setTimeout(() => setToast(''), 3000); };
  const setStatus = (status: string, message: string) => {
    if (!selected) return;
    updateLead(selected.id, { status, archived: status === 'Archivé' }, 'A traité un lead en qualification');
    addEvent({ leadId: selected.id, kind: 'Qualification', title: message, body: `Statut : ${status}`, who: 'Alexandre Martin' });
    notify(message);
  };
  const planTask = () => {
    if (!selected) return false;
    addTask({ leadId: selected.id, leadName: selected.name, type: taskType, date: taskDate, time: taskTime, comment: taskNote, owner: selected.owner });
    updateLead(selected.id, { next: `${taskType} · ${taskDate} ${taskTime}` });
    setTaskDate(''); setTaskTime(''); setTaskNote('');
    return true;
  };
  // La qualification exige un commercial attribué ET une prochaine action planifiée.
  const validate = (needOwner: boolean) => {
    if (!selected) return false;
    const next: { owner?: string; task?: string } = {};
    if (needOwner && (!selected.owner || selected.owner === 'Non attribué')) next.owner = 'Attribuez un commercial avant de qualifier ce lead.';
    if (!taskDate || !taskTime) next.task = 'Renseignez la date et l’heure de la prochaine action.';
    setErr(next);
    return Object.keys(next).length === 0;
  };
  const ask = (title: string, text: string, run: () => void) => setConfirmAct({ title, text, run });
  const qualify = () => { if (!validate(true)) return; ask('Qualifier ce lead ?', `${selected!.name} passera en « Qualifié » et sera transmis à ${selected!.owner}, avec l’action ${taskType} le ${taskDate} à ${taskTime}.`, () => { planTask(); setStatus('Qualifié', `${selected!.name} qualifié · transmis à ${selected!.owner}`); }); };
  const recall = () => { if (!validate(false)) return; ask('Programmer un rappel ?', `${selected!.name} passera en « À rappeler » avec un rappel le ${taskDate} à ${taskTime}.`, () => { planTask(); setStatus('À rappeler', `Rappel programmé pour ${selected!.name}`); }); };
  const nursery = () => ask('Placer en nurserie ?', `${selected!.name} sera mis de côté pour un projet non mature. Vous pourrez le réactiver à tout moment.`, () => setStatus('Nurserie', `${selected!.name} placé en nurserie`));
  const discard = (status: string) => { setErr({}); setReasonFor(status); setReason(LOSS_REASONS[0]!); };
  const confirmDiscard = () => {
    if (!selected || !reasonFor) return;
    if (!reason) { setErr({ task: 'Sélectionnez un motif.' }); return; }
    updateLead(selected.id, { status: reasonFor, lossReason: reason, next: 'Aucune action' }, 'A écarté un lead');
    addEvent({ leadId: selected.id, kind: 'Qualification', title: `${reasonFor} · ${reason}`, body: taskNote, who: 'Alexandre Martin' });
    notify(`${selected.name} · ${reasonFor} (${reason}).`);
    setReasonFor(null);
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

    <div className="rounded-lg border border-border bg-card p-3">
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
        <select aria-label="Trier la file" value={sortF} onChange={e => setSortF(e.target.value)} className={sel}>{SORTS.map(o => <option key={o}>{o}</option>)}</select>
        <select aria-label="Filtrer par date" value={dateF} onChange={e => setDateF(e.target.value)} className={sel}>{DATES.map(o => <option key={o}>{o}</option>)}</select>
        <select aria-label="Filtrer par source" value={sourceF} onChange={e => setSourceF(e.target.value)} className={sel}>{['Toutes les sources', ...SOURCES].map(o => <option key={o}>{o}</option>)}</select>
        <select aria-label="Filtrer par service" value={serviceF} onChange={e => setServiceF(e.target.value)} className={sel}>{['Tous les services', ...new Set([...services, ...leadList.map(l => l.service)])].map(o => <option key={o}>{o}</option>)}</select>
        <select aria-label="Filtrer par statut" value={statusF} onChange={e => setStatusF(e.target.value)} className={sel}>{['Tous les statuts', ...STATUSES].map(o => <option key={o}>{o}</option>)}</select>
      </div>
      {!!activeFilters.length && <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px]"><span className="text-muted-foreground">Filtres actifs :</span>{activeFilters.map(f => <span key={f} className="rounded-full bg-secondary px-2 py-0.5 font-semibold">{f}</span>)}<button onClick={resetFilters} className="ml-auto inline-flex items-center gap-1 font-semibold text-primary"><RotateCcw size={12} /> Réinitialiser</button></div>}
    </div>

    <div className="grid gap-5 lg:grid-cols-[1.1fr_1fr]">
      <div className="overflow-hidden rounded-lg border border-border bg-card">
        <div className="flex items-center justify-between border-b border-border px-4 py-3 text-xs"><span className="font-bold">File {queue.toLowerCase()}</span><span className="text-muted-foreground">{sortF} · {list.length} leads</span></div>
        {list.length === 0 && <p className="p-8 text-center text-sm text-muted-foreground">Aucun lead ne correspond à ces filtres.</p>}
        <ul className="divide-y divide-border">{list.map(l => {
          const w = waits[l.id] ?? 30; const late = w > 60; const s = score(l);
          return <li key={l.id}><button onClick={() => { setSelectedId(l.id); setErr({}); setReasonFor(null); }} className={`flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/60 ${selected?.id === l.id ? 'bg-primary/5 ring-1 ring-inset ring-primary/30' : ''}`}>
            <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">{l.initials}</div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2"><span className="truncate text-sm font-bold">{l.name}</span><span className={`rounded px-1.5 py-0.5 text-[10px] font-semibold ${sourceColor[l.source] ?? 'bg-muted'}`}>{l.source}</span>
                {late && <span className="rounded bg-destructive/10 px-1.5 py-0.5 text-[10px] font-bold text-destructive">En retard</span>}
                {noAction(l) && <span className="rounded bg-secondary px-1.5 py-0.5 text-[10px] font-bold text-primary">Sans action</span>}
                {(!l.owner || l.owner === 'Non attribué') && <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-bold">Non attribué</span>}</div>
              <div className="mt-0.5 truncate text-xs text-muted-foreground">{l.service} · {l.city} ({l.zip.slice(0, 2)}) · {l.amount}</div>
            </div>
            <div className="shrink-0 text-right">
              <div className={`text-sm font-bold ${s >= 80 ? 'text-primary' : ''}`}>{s}<span className="text-[10px] text-muted-foreground">/100</span></div>
              <div className={`mt-0.5 flex items-center justify-end gap-1 text-[10px] font-semibold ${late ? 'text-destructive' : 'text-muted-foreground'}`}><Timer size={11} />Âge {fmtWait(w)}</div>
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
          <div><p className="text-xs font-bold">Demande</p><p className="mt-1 text-sm text-muted-foreground">« {selected.description} »</p></div>

          <div><p className="mb-2 text-xs font-bold">Champs de qualification</p>
            <div className="grid gap-2 sm:grid-cols-2">
              <label className="block"><span className="mb-1 block text-[11px] text-muted-foreground">Budget estimé</span><Input value={selected.amount} onChange={e => updateLead(selected.id, { amount: e.target.value })} className="h-9" /></label>
              <label className="block"><span className="mb-1 block text-[11px] text-muted-foreground">Urgence</span><select value={selected.urgency ?? ''} onChange={e => updateLead(selected.id, { urgency: e.target.value })} className={sel}>{URGENCY.map(o => <option key={o}>{o}</option>)}</select></label>
              <label className="block"><span className="mb-1 block text-[11px] text-muted-foreground">Priorité</span><select value={selected.priority ?? ''} onChange={e => updateLead(selected.id, { priority: e.target.value })} className={sel}>{PRIORITY.map(o => <option key={o}>{o}</option>)}</select></label>
              <label className="block"><span className="mb-1 block text-[11px] text-muted-foreground">Potentiel</span><select value={selected.potential ?? ''} onChange={e => updateLead(selected.id, { potential: e.target.value })} className={sel}>{POTENTIAL.map(o => <option key={o}>{o}</option>)}</select></label>
              <label className="block sm:col-span-2"><span className="mb-1 block text-[11px] text-muted-foreground">Commercial attribué <span className="text-destructive">*</span></span><select value={selected.owner} onChange={e => { updateLead(selected.id, { owner: e.target.value }, 'A attribué un lead'); setErr(p => ({ ...p, owner: undefined })); notify(`Lead attribué à ${e.target.value}.`); }} className={`${sel} ${err.owner ? 'border-destructive' : ''}`}>{[selected.owner, ...OWNERS, 'Non attribué'].filter((v, i, a) => a.indexOf(v) === i).map(o => <option key={o}>{o}</option>)}</select>{err.owner && <span role="alert" className="mt-1 block text-[11px] font-semibold text-destructive">{err.owner}</span>}</label>
            </div>
          </div>

          <div><div className="flex items-center justify-between"><p className="text-xs font-bold">Grille d’éligibilité</p><span className="text-[11px] font-semibold text-primary">{tick.length}/{checks.length}</span></div>
            <div className="mt-2 h-1.5 rounded bg-muted"><div className="h-full rounded bg-primary transition-all" style={{ width: `${(tick.length / checks.length) * 100}%` }} /></div>
            <ul className="mt-3 space-y-1.5">{checks.map(c => { const on = tick.includes(c); return <li key={c}><button onClick={() => toggleCheck(selected.id, c)} className="flex w-full items-center gap-2.5 rounded-md px-2 py-1.5 text-left text-sm hover:bg-muted">
              <span className={`flex size-4 items-center justify-center rounded border ${on ? 'border-primary bg-primary text-primary-foreground' : 'border-input'}`}>{on && <Check size={11} />}</span>{c}</button></li>; })}</ul></div>

          <div className="rounded-md border border-dashed border-border p-3">
            <p className="text-xs font-bold">Prochaine action <span className="font-normal text-destructive">(obligatoire)</span></p>
            <select aria-label="Type d’action" value={taskType} onChange={e => setTaskType(e.target.value)} className={`${sel} mt-2`}>{TASK_TYPES.map(o => <option key={o}>{o}</option>)}</select>
            <div className="mt-2 grid grid-cols-2 gap-2"><Input aria-label="Date de l’action" type="date" value={taskDate} onChange={e => { setTaskDate(e.target.value); setErr(p => ({ ...p, task: undefined })); }} className={`h-9 ${err.task ? 'border-destructive' : ''}`} /><Input aria-label="Heure de l’action" type="time" value={taskTime} onChange={e => { setTaskTime(e.target.value); setErr(p => ({ ...p, task: undefined })); }} className={`h-9 ${err.task ? 'border-destructive' : ''}`} /></div>
            {err.task && <p role="alert" className="mt-1 text-[11px] font-semibold text-destructive">{err.task}</p>}
            <Textarea aria-label="Commentaire" value={taskNote} onChange={e => setTaskNote(e.target.value)} placeholder="Commentaire d’appel…" className="mt-2 min-h-16" />
            <p className="mt-1 text-[11px] text-muted-foreground">Action actuelle : {selected.next}</p>
          </div>

          <div className="grid gap-2 sm:grid-cols-2">
            <Button onClick={qualify}><ShieldCheck size={15} />Qualifier</Button>
            <Button variant="outline" onClick={recall}><AlarmClock size={15} />Fixer un rappel</Button>
            <Button variant="outline" onClick={nursery}><CalendarClock size={15} />Nurserie</Button>
            <Button variant="outline" className="text-destructive" onClick={() => discard('Inexploitable')}><Ban size={15} />Inexploitable</Button>
            <Button variant="ghost" className="text-destructive sm:col-span-2" onClick={() => discard('Abandon')}>Déclarer un abandon</Button>
          </div>

          {confirmAct && <div className="rounded-md border border-primary/40 bg-primary/5 p-3">
            <p className="text-xs font-bold">{confirmAct.title}</p>
            <p className="mt-1 text-[11px] text-muted-foreground">{confirmAct.text}</p>
            <div className="mt-2 flex gap-2"><Button size="sm" onClick={() => { confirmAct.run(); setConfirmAct(null); }}>Confirmer</Button><Button size="sm" variant="outline" onClick={() => setConfirmAct(null)}>Annuler</Button></div>
          </div>}
          <button onClick={() => openLead(selected)} className="flex items-center gap-1 text-xs font-semibold text-primary">Ouvrir la fiche complète <ArrowRight size={13} /></button>

          {reasonFor && <div className="rounded-md border border-destructive/40 bg-destructive/5 p-3">
            <p className="text-xs font-bold">Motif d’{reasonFor === 'Abandon' ? 'abandon' : 'inexploitation'}</p>
            <select aria-label="Motif" value={reason} onChange={e => setReason(e.target.value)} className={`${sel} mt-2`}>{LOSS_REASONS.map(o => <option key={o}>{o}</option>)}</select>
            <div className="mt-2 flex gap-2"><Button size="sm" onClick={confirmDiscard}>Confirmer</Button><Button size="sm" variant="outline" onClick={() => setReasonFor(null)}>Annuler</Button></div>
          </div>}
        </div>
      </div> : <div className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">Sélectionnez un lead.</div>}
    </div>
    {toast && <div role="status" className="fixed bottom-5 right-5 z-50 rounded bg-primary px-4 py-3 text-xs font-semibold text-primary-foreground shadow-lg">{toast}</div>}
  </div>;
}
