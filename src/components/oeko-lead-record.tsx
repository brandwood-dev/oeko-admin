import { useState } from 'react';
import { Link, useNavigate } from '@tanstack/react-router';
import { Archive, ArchiveRestore, Calendar, Check, ChevronRight, FileText, Mail, MapPin, MessageSquare, Pencil, Phone, Plus, TrendingUp, User, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { useOekoDemo } from '@/lib/oeko-demo';
import { OWNERS, type Lead } from '@/lib/oeko-data';

const stages = ['Nouveau', 'Qualifié', 'RDV planifié', 'Devis envoyé', 'Vente'];
const stageIndex = (s: string) => {
  const map: Record<string, number> = { 'Nouveau': 0, 'À qualifier': 0, 'Qualifié': 1, 'Commercial attribué': 1, 'À rappeler': 1, 'RDV planifié': 2, 'Rendez-vous': 2, 'Devis à faire': 2, 'Devis envoyé': 3, 'À relancer': 3, 'Vente': 4, 'Signé': 4 };
  return map[s] ?? 0;
};
const tabs = ['Activité', 'Détails', 'Devis & ventes', 'Documents'] as const;
const docKinds = ['Devis', 'Photos', 'Aides', 'Facture', 'Autre'];

function Row({ label, value }: { label: string; value?: string }) {
  return <div className="grid grid-cols-[130px_1fr] gap-3 border-b border-border py-2.5 text-sm last:border-0"><dt className="text-muted-foreground">{label}</dt><dd className="break-words font-medium">{value || '—'}</dd></div>;
}
function Card({ title, action, children }: { title: string; action?: React.ReactNode; children: React.ReactNode }) {
  return <section className="rounded-lg border border-border bg-card"><header className="flex items-center justify-between border-b border-border px-4 py-3"><h3 className="text-sm font-bold">{title}</h3>{action}</header><div className="p-4">{children}</div></section>;
}

export function OekoLeadRecord({ lead, notify }: { lead: Lead; notify: (m: string) => void }) {
  const navigate = useNavigate();
  const { notes, addNote, updateLead, rdvList, addRdv, quoteList, docs, addDoc, events, addEvent } = useOekoDemo();
  const [tab, setTab] = useState<(typeof tabs)[number]>('Activité');
  const [kind, setKind] = useState('Note');
  const [text, setText] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [docName, setDocName] = useState('');
  const [docKind, setDocKind] = useState('Devis');
  const current = stageIndex(lead.status);
  const archived = lead.status === 'Archivé' || lead.archived;
  const setStatus = (status: string) => { updateLead(lead.id, { status, archived: status === 'Archivé' }, 'A modifié le statut d’un dossier'); addEvent({ leadId: lead.id, kind: 'Statut', title: `Statut : ${status}`, body: '', who: 'Alexandre Martin' }); notify(`Statut : ${status}.`); };
  const leadRdvs = rdvList.filter(r => r.lead === lead.id);
  const leadQuotes = quoteList.filter(q => q.leadId === lead.id);
  const leadDocs = docs.filter(d => d.leadId === lead.id);
  const leadNotes = notes[lead.id] ?? [];
  const timeline = [
    ...events.filter(e => e.leadId === lead.id).map(e => ({ icon: e.kind === 'Devis' ? FileText : e.kind === 'Rendez-vous' ? Calendar : e.kind === 'Vente' ? TrendingUp : e.kind === 'Perte' ? X : MessageSquare, title: e.title, body: e.body, when: e.when, who: e.who })),
    { icon: Check, title: `Statut mis à jour : ${lead.status}`, body: '', when: lead.date, who: lead.owner },
    { icon: Phone, title: 'Appel de découverte', body: 'Premier contact, besoin confirmé. Rappel prévu pour visite technique.', when: lead.date, who: lead.owner },
    { icon: Mail, title: 'Lead reçu', body: lead.description, when: lead.date, who: lead.source },
  ];

  const schedule = () => {
    if (!date || !time) { notify('Choisissez une date et une heure.'); return; }
    const dayNum = Number(date.slice(8, 10));
    const [hh, mm] = time.split(':');
    const start = Number(hh) + Number(mm ?? 0) / 60;
    addRdv({ day: Math.min(Math.max((dayNum || 25) - 21, 0), 6), start, end: Math.min(start + 1.5, 19), kind: 'visite', client: lead.name, lead: lead.id, city: lead.city, dep: lead.zip.slice(0, 2), address: `${lead.address}, ${lead.zip} ${lead.city}`, phone: lead.phone, owner: lead.owner, project: lead.service, status: 'Confirmé' });
    updateLead(lead.id, { status: 'RDV planifié', next: `Visite technique le ${date} à ${time}` });
    notify('Rendez-vous ajouté au planning partagé.');
    setDate(''); setTime('');
  };

  return <div className="space-y-5">
    <div className="rounded-lg border border-border bg-card p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="grid size-14 place-items-center rounded-full bg-primary text-lg font-bold text-primary-foreground">{lead.initials}</div>
          <div><p className="text-[11px] font-bold uppercase text-muted-foreground">Dossier {lead.id} · {lead.service}</p><h2 className="text-xl font-bold">{lead.name}</h2>
            <p className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground"><span className="flex items-center gap-1"><MapPin size={13} />{lead.city} ({lead.zip})</span><span className="flex items-center gap-1"><User size={13} />{lead.owner}</span>{lead.priority && <span className="rounded-full bg-secondary px-2 py-0.5 font-semibold">Priorité {lead.priority}</span>}{archived && <span className="rounded-full bg-muted px-2 py-0.5 font-semibold">Archivé</span>}</p></div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="outline" asChild><a href={`tel:${lead.phone.replaceAll(' ', '')}`}><Phone size={15} /> Appeler</a></Button>
          <Button size="sm" variant="outline" asChild><a href={`mailto:${lead.email}`}><Mail size={15} /> Email</a></Button>
          <Button size="sm" variant="outline" onClick={() => navigate({ to: '/devis/nouveau' })}><FileText size={15} /> Créer un devis</Button>
          {archived
            ? <Button size="sm" variant="ghost" onClick={() => setStatus('Qualifié')}><ArchiveRestore size={15} /> Restaurer</Button>
            : <Button size="sm" variant="ghost" onClick={() => setStatus('Archivé')}><Archive size={15} /> Archiver</Button>}
        </div>
      </div>
      <dl className="mt-5 grid grid-cols-2 gap-4 border-t border-border pt-4 sm:grid-cols-4">
        {[['Budget estimé', lead.saleAmount ? `${lead.saleAmount} signés` : lead.amount], ['Source', lead.source], ['Prochaine action', lead.next], ['Créé le', lead.date]].map(([k, v]) => <div key={k}><dt className="text-[11px] uppercase text-muted-foreground">{k}</dt><dd className="mt-1 text-sm font-semibold">{v}</dd></div>)}
      </dl>
      {lead.lossReason && <p className="mt-4 rounded-lg border border-border bg-muted/60 p-3 text-xs">Dossier perdu · motif : <b>{lead.lossReason}</b>{lead.competitor && <> · concurrent : <b>{lead.competitor}</b></>}</p>}
    </div>

    <div className="rounded-lg border border-border bg-card p-3">
      <div className="flex overflow-x-auto">
        {stages.map((s, i) => <button key={s} type="button" onClick={() => setStatus(s)} style={{ clipPath: i === 0 ? 'polygon(0 0,calc(100% - 12px) 0,100% 50%,calc(100% - 12px) 100%,0 100%)' : 'polygon(0 0,calc(100% - 12px) 0,100% 50%,calc(100% - 12px) 100%,0 100%,12px 50%)' }}
          className={`-ml-1 flex min-w-32 flex-1 items-center justify-center gap-1 px-5 py-2.5 text-xs font-semibold transition first:ml-0 ${i < current ? 'bg-primary/80 text-primary-foreground' : i === current ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground hover:bg-muted'}`}>
          {i < current && <Check size={13} />}{s}</button>)}
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2 px-1 text-xs"><span className="text-muted-foreground">Autre issue :</span>
        {['À rappeler', 'Nurserie', 'Inexploitable', 'Abandon'].map(s => <button key={s} type="button" onClick={() => setStatus(s)} className={`rounded-full border px-3 py-1 ${lead.status === s ? 'border-primary bg-primary text-primary-foreground' : 'border-border hover:border-primary'}`}>{s}</button>)}
        <button type="button" onClick={() => navigate({ to: '/devis/vente' })} className="rounded-full border border-border px-3 py-1 hover:border-primary">Enregistrer la vente</button>
        <button type="button" onClick={() => navigate({ to: '/devis/perte' })} className="rounded-full border border-border px-3 py-1 hover:border-primary">Déclarer perdu</button>
        {current < stages.length - 1 && <Button size="sm" className="ml-auto" onClick={() => setStatus(stages[current + 1]!)}>Étape suivante <ChevronRight size={14} /></Button>}
      </div>
    </div>

    <div className="grid gap-5 lg:grid-cols-[minmax(0,1.85fr)_minmax(0,1fr)]">
      <div className="rounded-lg border border-border bg-card">
        <div role="tablist" className="flex flex-wrap border-b border-border px-2">{tabs.map(t => <button key={t} role="tab" aria-selected={tab === t} onClick={() => setTab(t)} className={`border-b-2 px-4 py-3 text-sm font-semibold ${tab === t ? 'border-primary text-primary' : 'border-transparent text-muted-foreground'}`}>{t}</button>)}</div>
        <div className="p-5">
          {tab === 'Activité' && <>
            <div className="rounded-lg border border-border p-3">
              <div className="mb-3 flex flex-wrap gap-1">{['Note', 'Appel', 'Email', 'Rendez-vous'].map(k => <button key={k} type="button" onClick={() => setKind(k)} className={`rounded px-3 py-1.5 text-xs font-semibold ${kind === k ? 'bg-primary text-primary-foreground' : 'bg-secondary'}`}>{k}</button>)}</div>
              <Textarea aria-label="Nouvelle activité" placeholder={`Ajouter : ${kind.toLowerCase()}...`} value={text} onChange={e => setText(e.target.value)} className="min-h-20" />
              <div className="mt-2 flex justify-end"><Button size="sm" onClick={() => { if (text.trim()) { addNote(lead.id, `${kind} · ${text.trim()}`); setText(''); notify(`${kind} enregistré(e).`); } }}><Plus size={15} /> Enregistrer</Button></div>
            </div>
            <ol className="mt-6 space-y-5 border-l border-border pl-6">{timeline.map((e, i) => <li key={i} className="relative"><span className="absolute -left-[37px] grid size-7 place-items-center rounded-full border border-border bg-background text-primary"><e.icon size={13} /></span>
              <div className="flex flex-wrap justify-between gap-2"><p className="text-sm font-semibold">{e.title}</p><span className="text-xs text-muted-foreground">{e.when} · {e.who}</span></div>{e.body && <p className="mt-1 text-sm text-muted-foreground">{e.body}</p>}</li>)}</ol>
            {!!leadNotes.length && <p className="mt-4 text-[11px] text-muted-foreground">{leadNotes.length} activité(s) ajoutée(s) pendant cette session.</p>}
          </>}
          {tab === 'Détails' && <div className="grid gap-6 md:grid-cols-2">
            <div><h4 className="mb-2 text-xs font-bold uppercase text-muted-foreground">Logement</h4><dl><Row label="Adresse" value={lead.address} /><Row label="Ville" value={`${lead.city} (${lead.zip})`} /><Row label="Type" value={lead.housing} /><Row label="Année" value={lead.year} /><Row label="Surface" value={lead.surface ? `${lead.surface} m²` : ''} /><Row label="Chauffage actuel" value={lead.heating} /></dl></div>
            <div><h4 className="mb-2 text-xs font-bold uppercase text-muted-foreground">Projet & éligibilité</h4><dl><Row label="Service" value={lead.service} /><Row label="Budget" value={lead.amount} /><Row label="Urgence" value={lead.urgency} /><Row label="Potentiel" value={lead.potential} /><Row label="Occupation" value={lead.occupancy} /><Row label="Revenus (MPR)" value={lead.income} /><Row label="Personnes au foyer" value={lead.persons} /></dl></div>
            <div className="md:col-span-2"><h4 className="mb-2 text-xs font-bold uppercase text-muted-foreground">Message original</h4><p className="border-l-2 border-primary pl-3 text-sm">{lead.description}</p></div>
            <div className="md:col-span-2"><h4 className="mb-2 text-xs font-bold uppercase text-muted-foreground">Acquisition & tracking</h4><dl className="grid md:grid-cols-2 md:gap-x-6"><Row label="Source" value={lead.source} /><Row label="Canal" value={lead.channel} /><Row label="Campagne" value={lead.campaign} /><Row label="Page d’arrivée" value={lead.landing} /><Row label="UTM" value={lead.utm} /><Row label="GCLID" value={lead.gclid} /><Row label="FBCLID" value={lead.fbclid} /><Row label="Consentement RGPD" value={lead.consent ? 'Obtenu' : 'Non recueilli'} /></dl></div>
          </div>}
          {tab === 'Devis & ventes' && <div className="space-y-6">
            <div><h4 className="mb-3 text-xs font-bold uppercase text-muted-foreground">Devis rattachés</h4>
              {leadQuotes.length ? <ul className="divide-y divide-border rounded-lg border border-border">{leadQuotes.map(q => <li key={q.ref}><Link to="/$section/$item" params={{ section: 'devis', item: q.ref }} className="flex flex-wrap items-center gap-x-4 gap-y-1 p-3 text-sm hover:bg-muted/50"><span className="font-bold text-primary">{q.ref}</span><span>{q.service}</span><span className="text-muted-foreground">{q.date}</span><span className="ml-auto font-semibold tabular-nums">{q.total}</span><span className="rounded-full border border-border px-2 py-0.5 text-[10px] font-semibold">{q.status}</span></Link></li>)}</ul>
                : <p className="text-sm text-muted-foreground">Aucun devis pour ce dossier.</p>}
              <Button size="sm" variant="outline" className="mt-3" onClick={() => navigate({ to: '/devis/nouveau' })}><Plus size={15} /> Nouveau devis</Button>
            </div>
            <div><h4 className="mb-3 text-xs font-bold uppercase text-muted-foreground">Rendez-vous</h4>
              {leadRdvs.length ? <ul className="divide-y divide-border rounded-lg border border-border">{leadRdvs.map(r => <li key={r.id} className="flex flex-wrap items-center gap-x-4 gap-y-1 p-3 text-sm"><span className="font-semibold">{['Lun. 21', 'Mar. 22', 'Mer. 23', 'Jeu. 24', 'Ven. 25', 'Sam. 26', 'Dim. 27'][r.day]}</span><span className="tabular-nums text-muted-foreground">{String(Math.floor(r.start)).padStart(2, '0')}h{String(Math.round((r.start % 1) * 60)).padStart(2, '0')}</span><span>{r.project}</span><span className="ml-auto text-xs">{r.owner}</span><span className="rounded-full border border-border px-2 py-0.5 text-[10px] font-semibold">{r.status}</span></li>)}</ul>
                : <p className="text-sm text-muted-foreground">Aucun rendez-vous planifié.</p>}
            </div>
          </div>}
          {tab === 'Documents' && <div className="space-y-4">
            {leadDocs.length ? <ul className="divide-y divide-border rounded-lg border border-border">{leadDocs.map(d => <li key={d.id} className="flex flex-wrap items-center gap-x-4 gap-y-1 p-3 text-sm"><FileText size={15} className="text-primary" /><span className="font-medium">{d.name}</span><span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-semibold">{d.kind}</span><span className="ml-auto text-xs text-muted-foreground">{d.date}</span></li>)}</ul>
              : <div className="grid place-items-center rounded-lg border border-dashed border-border py-10 text-center"><FileText className="text-muted-foreground" /><p className="mt-2 text-sm font-semibold">Aucun document</p><p className="text-xs text-muted-foreground">Devis, photos, avis d’imposition…</p></div>}
            <div className="flex flex-wrap items-end gap-2 rounded-lg border border-border p-3">
              <label className="flex-1"><span className="mb-1.5 block text-xs font-semibold">Nom du fichier</span><Input value={docName} onChange={e => setDocName(e.target.value)} placeholder="Avis d’imposition 2025.pdf" className="h-9" /></label>
              <label><span className="mb-1.5 block text-xs font-semibold">Type</span><select value={docKind} onChange={e => setDocKind(e.target.value)} className="h-9 rounded-md border border-input bg-background px-3 text-sm">{docKinds.map(k => <option key={k}>{k}</option>)}</select></label>
              <Button size="sm" onClick={() => { if (!docName.trim()) { notify('Indiquez un nom de fichier.'); return; } addDoc({ leadId: lead.id, name: docName.trim(), kind: docKind }); setDocName(''); notify('Document rattaché au dossier.'); }}><Plus size={15} /> Rattacher</Button>
            </div>
          </div>}
        </div>
      </div>

      <aside className="space-y-5">
        <Card title="Contact" action={<button aria-label="Modifier le contact" className="text-muted-foreground hover:text-primary"><Pencil size={14} /></button>}>
          <dl><Row label="Téléphone" value={lead.phone} /><Row label="Email" value={lead.email} /><Row label="Adresse" value={lead.address} /></dl>
        </Card>
        <Card title="Prochaine action">
          <p className="text-sm font-semibold">{lead.next}</p>
          <div className="mt-3 grid grid-cols-2 gap-2"><Input type="date" aria-label="Date" value={date} onChange={e => setDate(e.target.value)} className="h-9" /><Input type="time" aria-label="Heure" value={time} onChange={e => setTime(e.target.value)} className="h-9" /></div>
          <Button size="sm" className="mt-3 w-full" onClick={schedule}><Calendar size={15} /> Planifier la visite</Button>
          <p className="mt-2 text-[11px] text-muted-foreground">Le rendez-vous apparaît aussitôt dans le planning partagé.</p>
        </Card>
        <Card title="Affectation">
          <select aria-label="Commercial" value={lead.owner} onChange={e => { updateLead(lead.id, { owner: e.target.value, status: lead.status === 'Qualifié' ? 'Commercial attribué' : lead.status }, 'A réaffecté un dossier'); notify(`Dossier affecté à ${e.target.value}.`); }} className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm">
            {[...OWNERS, lead.owner].filter((v, i, a) => a.indexOf(v) === i).map(o => <option key={o}>{o}</option>)}
          </select>
        </Card>
        <Card title="Devis liés">
          {leadQuotes.length ? <ul className="space-y-2 text-sm">{leadQuotes.map(q => <li key={q.ref} className="flex items-center justify-between gap-2"><Link to="/$section/$item" params={{ section: 'devis', item: q.ref }} className="font-semibold text-primary hover:underline">{q.ref}</Link><span className="tabular-nums">{q.total}</span></li>)}</ul>
            : <p className="text-sm text-muted-foreground">Aucun devis pour ce dossier.</p>}
        </Card>
      </aside>
    </div>
  </div>;
}
