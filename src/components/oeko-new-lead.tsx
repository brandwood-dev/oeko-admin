import { useMemo, useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { AlertTriangle, CalendarPlus, Check, Home, Leaf, Phone, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useOekoDemo } from '@/lib/oeko-demo';
import type { Lead } from '@/lib/oeko-data';

const trades = [
  { id: 'Pompe à chaleur (PAC)', price: 14000 },
  { id: 'Isolation extérieure (ITE)', price: 18000 },
  { id: 'Toiture', price: 21000 },
  { id: 'Façade', price: 15000 },
  { id: 'Menuiseries', price: 9000 },
  { id: 'Climatisation', price: 7500 },
];
const incomes = [
  { id: 'Très modestes', color: 'bg-blue-500', aid: 0.7 },
  { id: 'Modestes', color: 'bg-yellow-400', aid: 0.5 },
  { id: 'Intermédiaires', color: 'bg-violet-500', aid: 0.3 },
  { id: 'Supérieurs', color: 'bg-rose-500', aid: 0.1 },
];
const sources = ['Google Ads', 'SEO', 'Meta', 'Appels', 'Email', 'Apporteurs'];
const owners = ['Non attribué', 'Laurent Moreau', 'Sophie Martin', 'Thomas Leroy'];
const sel = 'h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring';

function L({ label, children, wide }: { label: string; children: React.ReactNode; wide?: boolean }) {
  return <label className={`block ${wide ? 'sm:col-span-2' : ''}`}><span className="mb-1.5 block text-xs font-semibold">{label}</span>{children}</label>;
}
function Card({ icon, title, step, children }: { icon: React.ReactNode; title: string; step: number; children: React.ReactNode }) {
  return <section className="rounded-xl border border-border bg-card p-5 sm:p-6">
    <div className="mb-5 flex items-center gap-3"><span className="grid size-9 place-items-center rounded-lg bg-primary/10 text-primary">{icon}</span><div><p className="text-[11px] font-bold uppercase text-muted-foreground">Étape {step}</p><h2 className="text-base font-bold">{title}</h2></div></div>
    {children}
  </section>;
}

export function OekoNewLead() {
  const navigate = useNavigate();
  const { leadList, setLeadList, addLog, addEvent } = useOekoDemo();
  const [v, setV] = useState({ civ: 'M.', first: '', last: '', phone: '', email: '', address: '', city: '', zip: '', housing: 'Maison individuelle', year: '1975–2000', surface: '', heating: 'Chaudière fioul', owner: 'Propriétaire occupant', income: 'Modestes', persons: '3', source: 'Google Ads', commercial: 'Non attribué', urgency: 'Sous 3 mois', description: '' });
  const [picked, setPicked] = useState<string[]>([]);
  const [dupOk, setDupOk] = useState<string | null>(null);
  const [toast, setToast] = useState('');
  const set = (k: keyof typeof v) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => setV({ ...v, [k]: e.target.value });

  const budget = trades.filter(t => picked.includes(t.id)).reduce((s, t) => s + t.price, 0);
  const aid = Math.round(budget * (v.owner === 'Locataire' ? 0 : incomes.find(i => i.id === v.income)!.aid));
  const dup = useMemo(() => {
    const p = v.phone.replace(/\s/g, ''), m = v.email.trim().toLowerCase(), n = `${v.first} ${v.last}`.trim().toLowerCase();
    return leadList.find(l => (p.length >= 8 && l.phone.replace(/\s/g, '') === p) || (m && l.email.toLowerCase() === m) || (n.length > 3 && l.name.toLowerCase() === n));
  }, [leadList, v.phone, v.email, v.first, v.last]);
  const idf = /^(75|77|78|91|92|93|94|95)/.test(v.zip);
  const checks = [
    ['Identité', !!(v.first && v.last)], ['Téléphone', v.phone.replace(/\s/g, '').length >= 10], ['Adresse', !!(v.city && v.zip)],
    ['Logement', !!v.surface], ['Travaux', picked.length > 0], ['Éligibilité', v.owner !== 'Locataire'],
  ] as const;
  const score = Math.round(checks.filter(c => c[1]).length / checks.length * 100);
  const valid = !!(v.last && v.phone);

  const create = (plan: boolean) => {
    if (!valid) return;
    const name = `${v.first} ${v.last}`.trim();
    const id = `OE-${Date.now()}`;
    const lead: Lead = { id, name, initials: name.split(/\s+/).map(x => x[0]).slice(0, 2).join('').toUpperCase(), city: v.city, zip: v.zip, phone: v.phone, email: v.email, service: picked.join(' + ') || 'À définir', source: v.source, status: 'Nouveau', date: 'Aujourd’hui', owner: v.commercial, amount: `${budget.toLocaleString('fr-FR')} €`, next: plan ? 'Visite technique à planifier' : 'Aucune action', address: v.address, description: v.description || `${v.housing} · ${v.year} · ${v.surface || '?'} m² · ${v.heating} · ${v.owner} · Revenus ${v.income} · ${v.urgency}.`,
      housing: v.housing, year: v.year, surface: v.surface, heating: v.heating, occupancy: v.owner, income: v.income, persons: v.persons,
      urgency: v.urgency, priority: v.urgency === 'Immédiate' ? 'Haute' : v.urgency === 'Simple information' ? 'Basse' : 'Normale',
      potential: budget >= 20000 ? 'Élevé' : budget >= 10000 ? 'Moyen' : 'Faible', consent: true,
      channel: ['Google Ads', 'Meta'].includes(v.source) ? 'Publicité payante' : v.source === 'SEO' ? 'Référencement naturel' : 'Contact direct',
      campaign: v.source === 'Google Ads' ? 'IDF · Rénovation 2026' : '—', landing: '/demande-de-devis',
      utm: `utm_source=${v.source.toLowerCase().replaceAll(' ', '_')}&utm_medium=crm&utm_campaign=saisie_manuelle` };
    setLeadList(prev => [lead, ...prev]);
    addLog('A créé un dossier', `${name} · ${id}`);
    addEvent({ leadId: id, kind: 'Création', title: 'Dossier créé depuis le back-office', body: `${lead.service} · ${lead.amount}`, who: 'Alexandre Martin' });
    navigate({ to: plan ? '/planning/nouveau' : `/dossiers/${id}` });
  };

  return <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
    <div className="space-y-5">
      <Card icon={<User size={18} />} title="Contact & identité" step={1}>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="grid grid-cols-[90px_1fr] gap-3 sm:col-span-2"><L label="Civilité"><select className={sel} value={v.civ} onChange={set('civ')}><option>M.</option><option>Mme</option></select></L><L label="Prénom"><Input value={v.first} onChange={set('first')} placeholder="Foued" /></L></div>
          <L label="Nom *" wide><Input value={v.last} onChange={set('last')} placeholder="Benali" /></L>
          <L label="Téléphone *"><Input type="tel" value={v.phone} onChange={set('phone')} placeholder="06 12 34 56 78" /></L>
          <L label="Email"><Input type="email" value={v.email} onChange={set('email')} placeholder="nom@exemple.fr" /></L>
        </div>
        {dup && <div className="mt-4 flex flex-wrap items-center gap-3 rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900"><AlertTriangle size={16} /><span className="flex-1">Doublon possible : <b>{dup.name}</b> ({dup.id} · {dup.city})</span><Button size="sm" variant="outline" type="button" onClick={() => navigate({ to: `/dossiers/${dup.id}` })}>Ouvrir le dossier</Button></div>}
      </Card>

      <Card icon={<Home size={18} />} title="Logement" step={2}>
        <div className="grid gap-4 sm:grid-cols-2">
          <L label="Adresse du chantier" wide><Input value={v.address} onChange={set('address')} placeholder="18 rue du Général Leclerc" /></L>
          <L label="Code postal"><Input value={v.zip} onChange={set('zip')} placeholder="94000" maxLength={5} /></L>
          <L label="Ville"><Input value={v.city} onChange={set('city')} placeholder="Créteil" /></L>
          {v.zip.length === 5 && <p className={`sm:col-span-2 text-xs font-semibold ${idf ? 'text-primary' : 'text-amber-700'}`}>{idf ? '✓ Zone d’intervention Île-de-France' : '⚠ Hors zone d’intervention habituelle'}</p>}
          <L label="Type de logement"><select className={sel} value={v.housing} onChange={set('housing')}>{['Maison individuelle', 'Maison mitoyenne', 'Appartement', 'Immeuble'].map(o => <option key={o}>{o}</option>)}</select></L>
          <L label="Année de construction"><select className={sel} value={v.year} onChange={set('year')}>{['Avant 1948', '1948–1974', '1975–2000', 'Après 2000'].map(o => <option key={o}>{o}</option>)}</select></L>
          <L label="Surface habitable (m²)"><Input type="number" value={v.surface} onChange={set('surface')} placeholder="110" /></L>
          <L label="Chauffage actuel"><select className={sel} value={v.heating} onChange={set('heating')}>{['Chaudière fioul', 'Chaudière gaz', 'Électrique', 'Bois', 'Pompe à chaleur'].map(o => <option key={o}>{o}</option>)}</select></L>
        </div>
      </Card>

      <Card icon={<Check size={18} />} title="Travaux souhaités" step={3}>
        <div className="grid gap-3 sm:grid-cols-3">
          {trades.map(t => { const on = picked.includes(t.id); return <button type="button" key={t.id} onClick={() => setPicked(on ? picked.filter(x => x !== t.id) : [...picked, t.id])} className={`rounded-lg border p-3 text-left transition ${on ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'border-border hover:border-primary/50'}`}><span className="block text-sm font-semibold">{t.id}</span><span className="text-xs text-muted-foreground">dès {t.price.toLocaleString('fr-FR')} €</span></button>; })}
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <L label="Urgence du projet"><select className={sel} value={v.urgency} onChange={set('urgency')}>{['Immédiate', 'Sous 3 mois', 'Sous 6 mois', 'Simple information'].map(o => <option key={o}>{o}</option>)}</select></L>
          <L label="Description / besoin exprimé" wide><Textarea value={v.description} onChange={set('description')} className="min-h-24" placeholder="Ex. : souhaite isoler la façade avant l’hiver…" /></L>
        </div>
      </Card>

      <Card icon={<Leaf size={18} />} title="Éligibilité aux aides (MaPrimeRénov’ / CEE)" step={4}>
        <div className="grid gap-4 sm:grid-cols-2">
          <L label="Statut d’occupation"><select className={sel} value={v.owner} onChange={set('owner')}>{['Propriétaire occupant', 'Propriétaire bailleur', 'Locataire'].map(o => <option key={o}>{o}</option>)}</select></L>
          <L label="Personnes au foyer"><Input type="number" value={v.persons} onChange={set('persons')} /></L>
        </div>
        <p className="mb-2 mt-4 text-xs font-semibold">Catégorie de revenus</p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {incomes.map(i => <button type="button" key={i.id} onClick={() => setV({ ...v, income: i.id })} className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-semibold ${v.income === i.id ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'border-border'}`}><span className={`size-2.5 rounded-full ${i.color}`} />{i.id}</button>)}
        </div>
      </Card>

      <Card icon={<Phone size={18} />} title="Suivi commercial" step={5}>
        <div className="grid gap-4 sm:grid-cols-2">
          <L label="Source d’acquisition"><select className={sel} value={v.source} onChange={set('source')}>{sources.map(o => <option key={o}>{o}</option>)}</select></L>
          <L label="Commercial assigné"><select className={sel} value={v.commercial} onChange={set('commercial')}>{owners.map(o => <option key={o}>{o}</option>)}</select></L>
        </div>
      </Card>
    </div>

    <aside className="lg:sticky lg:top-6 lg:self-start">
      <div className="rounded-xl border border-border bg-card p-5">
        <p className="text-[11px] font-bold uppercase text-muted-foreground">Synthèse du dossier</p>
        <p className="mt-2 text-lg font-bold">{`${v.civ} ${v.first} ${v.last}`.trim() === v.civ ? 'Nouveau prospect' : `${v.civ} ${v.first} ${v.last}`}</p>
        <p className="text-xs text-muted-foreground">{v.city || 'Ville non renseignée'}{v.zip && ` (${v.zip.slice(0, 2)})`}</p>
        <div className="mt-5"><div className="mb-1.5 flex justify-between text-xs font-semibold"><span>Complétude</span><span>{score} %</span></div><div className="h-2 rounded-full bg-muted"><div className="h-2 rounded-full bg-primary transition-all" style={{ width: `${score}%` }} /></div></div>
        <ul className="mt-4 space-y-1.5 text-xs">{checks.map(([k, ok]) => <li key={k} className={`flex items-center gap-2 ${ok ? '' : 'text-muted-foreground'}`}><span className={`grid size-4 place-items-center rounded-full ${ok ? 'bg-primary text-primary-foreground' : 'border border-border'}`}>{ok && <Check size={10} />}</span>{k}</li>)}</ul>
        <div className="mt-5 space-y-2 border-t border-border pt-4 text-sm">
          <div className="flex justify-between"><span className="text-muted-foreground">Budget estimé</span><b>{budget.toLocaleString('fr-FR')} €</b></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Aides estimées</span><b className="text-primary">− {aid.toLocaleString('fr-FR')} €</b></div>
          <div className="flex justify-between border-t border-border pt-2"><span className="font-semibold">Reste à charge</span><b>{(budget - aid).toLocaleString('fr-FR')} €</b></div>
        </div>
        <p className="mt-2 text-[11px] text-muted-foreground">Estimation indicative de démonstration.</p>
        <div className="mt-5 space-y-2">
          <Button className="w-full" disabled={!valid} onClick={() => create(false)}><Check size={16} /> Créer et ouvrir la fiche</Button>
          <Button className="w-full" variant="outline" disabled={!valid} onClick={() => create(true)}><CalendarPlus size={16} /> Créer & planifier un RDV</Button>
          {!valid && <p className="text-center text-[11px] text-muted-foreground">Nom et téléphone requis</p>}
        </div>
      </div>
    </aside>
  </div>;
}
