import { useMemo, useState } from 'react';
import { ArrowRight, Columns3, Euro, Plus, Search, Table2, TrendingUp, Trophy, Wallet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useOekoDemo } from '@/lib/oeko-demo';
import type { Lead } from '@/lib/oeko-data';

const stages = [
  { key: 'Qualifié', label: 'Qualifié', prob: 15, alias: [] as string[] },
  { key: 'Commercial attribué', label: 'Commercial attribué', prob: 25, alias: [] as string[] },
  { key: 'À rappeler', label: 'À rappeler', prob: 20, alias: [] as string[] },
  { key: 'RDV planifié', label: 'RDV planifié', prob: 40, alias: ['Rendez-vous'] },
  { key: 'Devis à faire', label: 'Devis à faire', prob: 50, alias: [] as string[] },
  { key: 'Devis envoyé', label: 'Devis envoyé', prob: 65, alias: [] as string[] },
  { key: 'À relancer', label: 'À relancer', prob: 75, alias: ['Négociation'] },
  { key: 'Vente', label: 'Vente', prob: 100, alias: ['Signé'] },
  { key: 'Perdu', label: 'Perdu', prob: 0, alias: [] as string[] },
] as const;
const aides: Record<string, string> = { 'OE-24091': 'MaPrimeRénov’ en cours', 'OE-24090': 'CEE validé', 'OE-24089': 'Non éligible', 'OE-24088': 'CEE en cours', 'OE-24087': 'À instruire', 'OE-24086': 'MaPrimeRénov’ validé' };
const stageOf = (s: string) => stages.find(x => x.key === s || (x.alias as readonly string[]).includes(s))?.key ?? null;
const num = (a: string) => Number(a.replace(/[^0-9]/g, '')) || 0;
const eur = (n: number) => n.toLocaleString('fr-FR') + ' €';

export function OekoDossiers({ openLead, newDossier }: { openLead: (l: Lead) => void; newDossier: () => void }) {
  const { leadList, setLeadList } = useOekoDemo();
  const [mode, setMode] = useState<'Kanban' | 'Table'>('Kanban');
  const [q, setQ] = useState('');
  const [owner, setOwner] = useState('Tous');
  const [dragId, setDragId] = useState<string | null>(null);

  const portfolio = leadList.filter(l => stageOf(l.status) && `${l.name} ${l.city} ${l.service}`.toLowerCase().includes(q.toLowerCase()) && (owner === 'Tous' || l.owner === owner));
  const kpi = useMemo(() => {
    const open = portfolio.filter(l => !['Vente', 'Perdu'].includes(stageOf(l.status) ?? ''));
    const weighted = open.reduce((s, l) => s + num(l.amount) * (stages.find(x => x.key === stageOf(l.status))?.prob ?? 20) / 100, 0);
    return { total: open.reduce((s, l) => s + num(l.amount), 0), weighted: Math.round(weighted), signed: portfolio.filter(l => stageOf(l.status) === 'Vente').reduce((s, l) => s + num(l.amount), 0), avg: Math.round(portfolio.reduce((s, l) => s + num(l.amount), 0) / (portfolio.length || 1)) };
  }, [portfolio]);
  const move = (id: string, status: string) => setLeadList(p => p.map(l => l.id === id ? { ...l, status } : l));

  const cards = [
    { icon: Wallet, label: 'Portefeuille ouvert', value: eur(kpi.total) },
    { icon: TrendingUp, label: 'Prévisionnel pondéré', value: eur(kpi.weighted) },
    { icon: Trophy, label: 'CA signé', value: eur(kpi.signed) },
    { icon: Euro, label: 'Panier moyen', value: eur(kpi.avg) },
  ];

  return <div className="space-y-5">
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">{cards.map(c => <div key={c.label} className="rounded-lg border border-border bg-card p-4">
      <div className="flex items-center gap-2 text-[11px] font-semibold text-muted-foreground"><c.icon size={14} className="text-primary" />{c.label}</div>
      <div className="mt-2 text-xl font-bold sm:text-2xl">{c.value}</div></div>)}</div>

    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex flex-col gap-2 sm:flex-row">
        <div className="relative sm:w-64"><Search size={15} className="absolute left-3 top-2.5 text-muted-foreground" /><Input value={q} onChange={e => setQ(e.target.value)} placeholder="Client, ville, métier…" className="pl-9" /></div>
        <select value={owner} onChange={e => setOwner(e.target.value)} aria-label="Commercial" className="h-9 rounded-md border border-border bg-background px-3 text-xs">{['Tous', 'Laurent Moreau', 'Sophie Martin', 'Thomas Leroy'].map(o => <option key={o}>{o}</option>)}</select>
      </div>
      <div className="flex gap-2">
        <div className="flex gap-1 rounded-lg bg-muted p-1">{(['Kanban', 'Table'] as const).map(m => <button key={m} onClick={() => setMode(m)} className={`flex h-8 items-center gap-1.5 rounded-md px-3 text-xs font-semibold ${mode === m ? 'bg-background shadow-sm' : 'text-muted-foreground'}`}>{m === 'Kanban' ? <Columns3 size={14} /> : <Table2 size={14} />}{m}</button>)}</div>
        <Button size="sm" onClick={newDossier}><Plus size={14} />Nouveau dossier</Button>
      </div>
    </div>

    {mode === 'Kanban' ? <div className="flex gap-3 overflow-x-auto pb-2">{stages.map(s => {
      const col = portfolio.filter(l => stageOf(l.status) === s.key);
      return <div key={s.key} onDragOver={e => e.preventDefault()} onDrop={() => { if (dragId) move(dragId, s.key); setDragId(null); }} className="flex w-72 shrink-0 flex-col rounded-lg bg-muted/60 p-2">
        <div className="flex items-center justify-between px-2 py-2"><div><p className="text-xs font-bold">{s.label}</p><p className="text-[10px] text-muted-foreground">{eur(col.reduce((a, l) => a + num(l.amount), 0))} · {s.prob} %</p></div><span className="rounded bg-background px-1.5 text-[10px] font-bold">{col.length}</span></div>
        <div className="h-1 rounded bg-background"><div className="h-full rounded bg-primary" style={{ width: `${s.prob}%` }} /></div>
        <div className="mt-2 min-h-24 space-y-2">{col.map(l => <div key={l.id} draggable onDragStart={() => setDragId(l.id)} onClick={() => openLead(l)} className="cursor-pointer rounded-md border border-border bg-card p-3 shadow-sm transition hover:border-primary/40">
          <div className="flex items-start justify-between gap-2"><span className="text-sm font-bold">{l.name}</span><span className="text-xs font-bold text-primary">{l.amount}</span></div>
          <p className="mt-0.5 text-[11px] text-muted-foreground">{l.service} · {l.city} ({l.zip.slice(0, 2)})</p>
          <span className="mt-2 inline-block rounded bg-lime/50 px-1.5 py-0.5 text-[10px] font-semibold">{stageOf(l.status) === 'Perdu' ? `Perdu · ${l.lossReason ?? 'motif à préciser'}` : aides[l.id] ?? 'Aides à instruire'}</span>
          <div className="mt-2 flex items-center justify-between text-[10px] text-muted-foreground"><span>{l.next}</span><span className="flex size-6 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-primary-foreground">{l.owner.split(' ').map(x => x[0]).join('')}</span></div>
          <select onClick={e => e.stopPropagation()} value={stageOf(l.status) ?? 'Qualifié'} onChange={e => move(l.id, e.target.value)} aria-label="Changer d’étape" className="mt-2 h-7 w-full rounded border border-border bg-background px-2 text-[11px]">{stages.map(x => <option key={x.key} value={x.key}>{x.label}</option>)}</select>
        </div>)}{col.length === 0 && <p className="p-4 text-center text-[11px] text-muted-foreground">Glissez un dossier ici</p>}</div>
      </div>;
    })}</div>
    : <div className="overflow-x-auto rounded-lg border border-border bg-card"><table className="w-full min-w-[760px] text-left text-xs"><thead className="border-b border-border text-[11px] text-muted-foreground"><tr>{['Client', 'Métier', 'Montant', 'Étape', 'Probabilité', 'Aides', 'Commercial', ''].map(h => <th key={h} className="px-4 py-3 font-semibold">{h}</th>)}</tr></thead>
      <tbody className="divide-y divide-border">{portfolio.map(l => { const st = stages.find(x => x.key === stageOf(l.status)) ?? stages[0]; return <tr key={l.id} onClick={() => openLead(l)} className="cursor-pointer hover:bg-muted/50">
        <td className="px-4 py-3"><span className="font-bold">{l.name}</span><span className="block text-muted-foreground">{l.city}</span></td><td className="px-4 py-3">{l.service}</td><td className="px-4 py-3 font-bold">{l.amount}</td><td className="px-4 py-3"><span className="rounded bg-primary/10 px-2 py-1 font-semibold text-primary">{st.label}</span></td><td className="px-4 py-3">{st.prob} %</td><td className="px-4 py-3">{aides[l.id] ?? 'À instruire'}</td><td className="px-4 py-3">{l.owner}</td><td className="px-4 py-3 text-primary"><ArrowRight size={14} /></td></tr>; })}</tbody></table>
      {portfolio.length === 0 && <p className="p-8 text-center text-sm text-muted-foreground">Aucun dossier.</p>}</div>}
    <p className="text-[11px] text-muted-foreground">Pipeline commercial en 9 étapes, identique à la fiche dossier et aux tableaux de bord. Les leads non qualifiés restent dans « Qualification ». Données de démonstration.</p>
  </div>;
}
