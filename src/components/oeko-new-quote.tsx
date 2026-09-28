import { useMemo, useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Check, FileText, Plus, Trash2, User, Leaf, Eye, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useOekoDemo } from '@/lib/oeko-demo';

type Line = { id: number; label: string; unit: string; qty: number; price: number; vat: number };
const catalog: { trade: string; items: Omit<Line, 'id'>[] }[] = [
  { trade: 'Pompe à chaleur (PAC)', items: [
    { label: 'PAC air-eau 11 kW (fourniture)', unit: 'u', qty: 1, price: 8900, vat: 5.5 },
    { label: 'Pose et raccordement hydraulique', unit: 'forfait', qty: 1, price: 2400, vat: 5.5 },
    { label: 'Dépose chaudière fioul', unit: 'forfait', qty: 1, price: 650, vat: 10 },
  ] },
  { trade: 'Isolation extérieure (ITE)', items: [
    { label: 'Isolant PSE graphité 140 mm (R=4,4)', unit: 'm²', qty: 120, price: 95, vat: 5.5 },
    { label: 'Enduit de finition', unit: 'm²', qty: 120, price: 28, vat: 5.5 },
    { label: 'Échafaudage', unit: 'forfait', qty: 1, price: 1800, vat: 10 },
  ] },
  { trade: 'Toiture', items: [
    { label: 'Isolation rampants laine de verre (R=7)', unit: 'm²', qty: 85, price: 62, vat: 5.5 },
    { label: 'Remplacement tuiles', unit: 'm²', qty: 85, price: 110, vat: 10 },
  ] },
  { trade: 'Menuiseries', items: [
    { label: 'Fenêtre PVC double vitrage (Uw 1,3)', unit: 'u', qty: 8, price: 780, vat: 5.5 },
    { label: 'Pose en rénovation', unit: 'u', qty: 8, price: 180, vat: 5.5 },
  ] },
];
const incomes = [
  { id: 'Très modestes', mpr: 0.7 }, { id: 'Modestes', mpr: 0.5 }, { id: 'Intermédiaires', mpr: 0.3 }, { id: 'Supérieurs', mpr: 0 },
];
const eur = (n: number) => `${Math.round(n).toLocaleString('fr-FR')} €`;
const sel = 'h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring';

export function OekoNewQuote() {
  const navigate = useNavigate();
  const { leadList, addEntry } = useOekoDemo();
  const [leadId, setLeadId] = useState(leadList[0]?.id ?? '');
  const [lines, setLines] = useState<Line[]>(() => (catalog[0]?.items ?? []).map((l, i) => ({ ...l, id: i })));
  const [income, setIncome] = useState('Modestes');
  const [cee, setCee] = useState(true);
  const [discount, setDiscount] = useState(0);
  const [validity, setValidity] = useState('30 jours');
  const [deposit, setDeposit] = useState(30);
  const [notes, setNotes] = useState('Travaux réalisés par une entreprise certifiée RGE. Délai d’intervention : 4 à 6 semaines après acceptation.');
  const [preview, setPreview] = useState(false);
  const lead = leadList.find(l => l.id === leadId);
  const ref = 'DEV-2026-085';

  const t = useMemo(() => {
    const ht = lines.reduce((s, l) => s + l.qty * l.price, 0) * (1 - discount / 100);
    const vat = lines.reduce((s, l) => s + l.qty * l.price * (l.vat / 100), 0) * (1 - discount / 100);
    const ttc = ht + vat;
    const mpr = Math.min(ht * (incomes.find(i => i.id === income)?.mpr ?? 0), 20000);
    const ceeAmt = cee ? Math.min(ht * 0.12, 4000) : 0;
    return { ht, vat, ttc, mpr, cee: ceeAmt, rest: Math.max(ttc - mpr - ceeAmt, 0), margin: ht * 0.32 };
  }, [lines, discount, income, cee]);

  const upd = (id: number, patch: Partial<Line>) => setLines(p => p.map(l => l.id === id ? { ...l, ...patch } : l));
  const addPack = (trade: string) => { const pack = catalog.find(c => c.trade === trade); if (pack) setLines(p => [...p, ...pack.items.map((l, i) => ({ ...l, id: Date.now() + i }))]); };
  const save = (status: string) => {
    addEntry({ section: 'devis', title: ref, detail: `${lead?.name ?? ''} · ${lines.length} ouvrages · ${eur(t.ht)} HT`, status, date: new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date()) });
    navigate({ to: '/devis' });
  };

  return <div className="grid gap-6 lg:grid-cols-[1.7fr_1fr]">
    <div className="space-y-6 min-w-0">
      <section className="rounded-xl border border-border bg-card p-5">
        <div className="mb-4 flex items-center gap-2"><User size={16} className="text-primary"/><h2 className="text-sm font-bold">Client & chantier</h2><span className="ml-auto rounded bg-muted px-2 py-1 text-[11px] font-semibold">{ref}</span></div>
        <div className="grid gap-4 sm:grid-cols-3">
          <label className="sm:col-span-2"><span className="mb-1.5 block text-xs font-semibold">Prospect</span><select className={sel} value={leadId} onChange={e => setLeadId(e.target.value)}>{leadList.map(l => <option key={l.id} value={l.id}>{l.name} · {l.city} ({l.id})</option>)}</select></label>
          <label><span className="mb-1.5 block text-xs font-semibold">Validité</span><select className={sel} value={validity} onChange={e => setValidity(e.target.value)}>{['15 jours','30 jours','60 jours'].map(v => <option key={v}>{v}</option>)}</select></label>
        </div>
        {lead && <div className="mt-4 grid gap-3 rounded-lg bg-muted/60 p-3 text-xs sm:grid-cols-4">
          <div><p className="text-muted-foreground">Adresse</p><p className="font-semibold">{lead.address}, {lead.zip} {lead.city}</p></div>
          <div><p className="text-muted-foreground">Projet</p><p className="font-semibold">{lead.service}</p></div>
          <div><p className="text-muted-foreground">Budget annoncé</p><p className="font-semibold">{lead.amount}</p></div>
          <div><p className="text-muted-foreground">Commercial</p><p className="font-semibold">{lead.owner}</p></div>
        </div>}
      </section>

      <section className="rounded-xl border border-border bg-card p-5">
        <div className="mb-4 flex flex-wrap items-center gap-2"><FileText size={16} className="text-primary"/><h2 className="text-sm font-bold">Ouvrages & prestations</h2>
          <div className="ml-auto flex flex-wrap gap-1.5">{catalog.map(c => <button key={c.trade} type="button" onClick={() => addPack(c.trade)} className="rounded-full border border-border px-3 py-1 text-[11px] font-semibold hover:border-primary hover:text-primary">+ {c.trade.split(' (')[0]}</button>)}</div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] table-fixed text-sm">
            <thead><tr className="border-b border-border text-left text-[11px] uppercase text-muted-foreground"><th className="w-auto py-2 font-semibold">Désignation</th><th className="w-16 font-semibold">Qté</th><th className="w-16 font-semibold">Unité</th><th className="w-24 font-semibold">PU HT</th><th className="w-20 font-semibold">TVA</th><th className="w-24 text-right font-semibold">Total HT</th><th className="w-8"/></tr></thead>
            <tbody>{lines.map(l => <tr key={l.id} className="border-b border-border/60">
              <td className="py-2 pr-2"><Input value={l.label} onChange={e => upd(l.id, { label: e.target.value })} className="h-9"/></td>
              <td className="pr-2"><Input type="number" value={l.qty} onChange={e => upd(l.id, { qty: Number(e.target.value) })} className="h-9"/></td>
              <td className="pr-2 text-xs text-muted-foreground">{l.unit}</td>
              <td className="pr-2"><Input type="number" value={l.price} onChange={e => upd(l.id, { price: Number(e.target.value) })} className="h-9"/></td>
              <td className="pr-2"><select value={l.vat} onChange={e => upd(l.id, { vat: Number(e.target.value) })} className="h-9 rounded-md border border-input bg-background px-2 text-xs">{[5.5,10,20].map(v => <option key={v} value={v}>{v} %</option>)}</select></td>
              <td className="text-right font-semibold tabular-nums">{eur(l.qty * l.price)}</td>
              <td className="pl-2"><button type="button" aria-label="Supprimer la ligne" onClick={() => setLines(p => p.filter(x => x.id !== l.id))} className="text-muted-foreground hover:text-destructive"><Trash2 size={15}/></button></td>
            </tr>)}</tbody>
          </table>
        </div>
        <Button type="button" variant="outline" size="sm" className="mt-3" onClick={() => setLines(p => [...p, { id: Date.now(), label: 'Nouvelle prestation', unit: 'u', qty: 1, price: 0, vat: 5.5 }])}><Plus size={14}/> Ligne libre</Button>
      </section>

      <section className="rounded-xl border border-border bg-card p-5">
        <div className="mb-4 flex items-center gap-2"><Leaf size={16} className="text-primary"/><h2 className="text-sm font-bold">Aides à la rénovation</h2></div>
        <p className="mb-2 text-xs font-semibold">Profil de revenus MaPrimeRénov’</p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">{incomes.map(i => <button key={i.id} type="button" onClick={() => setIncome(i.id)} className={`rounded-lg border px-3 py-2 text-xs font-semibold transition ${income === i.id ? 'border-primary bg-primary text-primary-foreground' : 'border-border hover:border-primary'}`}>{i.id}</button>)}</div>
        <label className="mt-4 flex items-center gap-2 text-sm"><input type="checkbox" checked={cee} onChange={e => setCee(e.target.checked)} className="h-4 w-4 accent-primary"/> Prime CEE (certificats d’économies d’énergie)</label>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label><span className="mb-1.5 block text-xs font-semibold">Remise commerciale (%)</span><Input type="number" min={0} max={30} value={discount} onChange={e => setDiscount(Number(e.target.value))} className="h-10"/></label>
          <label><span className="mb-1.5 block text-xs font-semibold">Acompte à la signature (%)</span><select className={sel} value={deposit} onChange={e => setDeposit(Number(e.target.value))}>{[0,20,30,40].map(v => <option key={v} value={v}>{v} %</option>)}</select></label>
        </div>
        <label className="mt-4 block"><span className="mb-1.5 block text-xs font-semibold">Conditions & mentions</span><Textarea value={notes} onChange={e => setNotes(e.target.value)} className="min-h-24"/></label>
      </section>

      {preview && <section className="rounded-xl border border-border bg-background p-6 shadow-sm">
        <div className="flex justify-between border-b border-border pb-4"><div><p className="text-lg font-bold">OEKO</p><p className="text-xs text-muted-foreground">Rénovation énergétique · RGE</p></div><div className="text-right text-xs"><p className="font-bold">DEVIS {ref}</p><p className="text-muted-foreground">Validité {validity}</p></div></div>
        <p className="mt-4 text-sm"><b>{lead?.name}</b><br/>{lead?.address}, {lead?.zip} {lead?.city}</p>
        <ul className="mt-4 space-y-1 text-sm">{lines.map(l => <li key={l.id} className="flex justify-between gap-4"><span>{l.label} × {l.qty}</span><span className="tabular-nums">{eur(l.qty * l.price)}</span></li>)}</ul>
        <p className="mt-4 border-t border-border pt-3 text-right text-sm font-bold">Total TTC {eur(t.ttc)} · Reste à charge {eur(t.rest)}</p>
        <p className="mt-3 text-xs text-muted-foreground">{notes}</p>
      </section>}
    </div>

    <aside className="space-y-4 lg:sticky lg:top-4 lg:self-start">
      <div className="rounded-xl bg-primary p-5 text-primary-foreground">
        <p className="text-[11px] font-bold uppercase opacity-70">Reste à charge client</p>
        <p className="mt-1 text-3xl font-bold tabular-nums">{eur(t.rest)}</p>
        <p className="mt-1 text-xs opacity-70">après aides estimées</p>
        <dl className="mt-5 space-y-2 text-sm">
          {[['Total HT', t.ht], ['TVA', t.vat], ['Total TTC', t.ttc]].map(([k, v]) => <div key={k as string} className="flex justify-between"><dt className="opacity-80">{k}</dt><dd className="tabular-nums font-semibold">{eur(v as number)}</dd></div>)}
          <div className="flex justify-between text-lime"><dt>MaPrimeRénov’</dt><dd className="tabular-nums font-semibold">− {eur(t.mpr)}</dd></div>
          <div className="flex justify-between text-lime"><dt>Prime CEE</dt><dd className="tabular-nums font-semibold">− {eur(t.cee)}</dd></div>
          <div className="flex justify-between border-t border-primary-foreground/20 pt-2"><dt className="opacity-80">Acompte ({deposit} %)</dt><dd className="tabular-nums font-semibold">{eur(t.ttc * deposit / 100)}</dd></div>
        </dl>
      </div>
      <div className="rounded-xl border border-border bg-card p-4 text-sm">
        <p className="text-[11px] font-bold uppercase text-muted-foreground">Indicateurs internes</p>
        <div className="mt-3 flex justify-between"><span>Marge estimée</span><b className="tabular-nums">{eur(t.margin)} · 32 %</b></div>
        <div className="mt-2 flex justify-between"><span>Ouvrages</span><b>{lines.length}</b></div>
        <div className="mt-2 flex justify-between"><span>Écart budget annoncé</span><b className="tabular-nums">{lead ? eur(t.ttc - Number(lead.amount.replace(/[^0-9]/g, ''))) : '—'}</b></div>
      </div>
      <div className="grid gap-2">
        <Button type="button" onClick={() => save('Envoyé')}><Send size={15}/> Enregistrer & envoyer</Button>
        <Button type="button" variant="outline" onClick={() => setPreview(p => !p)}><Eye size={15}/> {preview ? 'Masquer l’aperçu' : 'Aperçu du devis'}</Button>
        <Button type="button" variant="outline" onClick={() => save('À préparer')}><Check size={15}/> Enregistrer en brouillon</Button>
      </div>
      <p className="text-[11px] text-muted-foreground">Montants des aides indicatifs, calculés pour la démonstration.</p>
    </aside>
  </div>;
}
