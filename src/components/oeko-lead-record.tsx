import { useState } from 'react';
import { Archive, Calendar, Check, ChevronRight, FileText, Mail, MapPin, MessageSquare, Pencil, Phone, Plus, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { useOekoDemo } from '@/lib/oeko-demo';
import type { Lead } from '@/lib/oeko-data';

const stages = ['Nouveau', 'Qualifié', 'Rendez-vous', 'Devis envoyé', 'Signé'];
const stageIndex = (s: string) => { const i = stages.findIndex(x => s.toLowerCase().startsWith(x.toLowerCase().slice(0, 5))); return i < 0 ? 0 : i; };
const tabs = ['Activité', 'Détails', 'Documents'] as const;

function Row({ label, value }: { label: string; value?: string }) {
  return <div className="grid grid-cols-[130px_1fr] gap-3 border-b border-border py-2.5 text-sm last:border-0"><dt className="text-muted-foreground">{label}</dt><dd className="font-medium">{value || '—'}</dd></div>;
}
function Card({ title, action, children }: { title: string; action?: React.ReactNode; children: React.ReactNode }) {
  return <section className="rounded-lg border border-border bg-card"><header className="flex items-center justify-between border-b border-border px-4 py-3"><h3 className="text-sm font-bold">{title}</h3>{action}</header><div className="p-4">{children}</div></section>;
}

export function OekoLeadRecord({ lead, notify }: { lead: Lead; notify: (m: string) => void }) {
  const { setLeadList, notes, addNote } = useOekoDemo();
  const [tab, setTab] = useState<(typeof tabs)[number]>('Activité');
  const [kind, setKind] = useState('Note');
  const [text, setText] = useState('');
  const current = stageIndex(lead.status);
  const setStatus = (status: string) => { setLeadList(p => p.map(l => l.id === lead.id ? { ...l, status } : l)); notify(`Statut : ${status}.`); };
  const leadNotes = notes[lead.id] ?? [];
  const timeline = [
    ...leadNotes.map(n => ({ icon: MessageSquare, title: n.split(' · ')[0] ?? 'Note', body: n.split(' · ').slice(1).join(' · ') || n, when: 'À l’instant', who: 'Vous' })).reverse(),
    { icon: Check, title: `Statut mis à jour : ${lead.status}`, body: '', when: lead.date, who: lead.owner },
    { icon: Phone, title: 'Appel de découverte', body: 'Premier contact, besoin confirmé. Rappel prévu pour visite technique.', when: lead.date, who: lead.owner },
    { icon: Mail, title: 'Lead reçu', body: lead.description, when: lead.date, who: lead.source },
  ];

  return <div className="space-y-5">
    {/* Highlights panel */}
    <div className="rounded-lg border border-border bg-card p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="grid size-14 place-items-center rounded-full bg-primary text-lg font-bold text-primary-foreground">{lead.initials}</div>
          <div><p className="text-[11px] font-bold uppercase text-muted-foreground">Dossier {lead.id} · {lead.service}</p><h2 className="text-xl font-bold">{lead.name}</h2>
            <p className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground"><span className="flex items-center gap-1"><MapPin size={13} />{lead.city} ({lead.zip})</span><span className="flex items-center gap-1"><User size={13} />{lead.owner}</span></p></div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="outline" asChild><a href={`tel:${lead.phone}`}><Phone size={15} /> Appeler</a></Button>
          <Button size="sm" variant="outline" asChild><a href={`mailto:${lead.email}`}><Mail size={15} /> Email</a></Button>
          <Button size="sm" variant="outline" onClick={() => { setKind('Rendez-vous'); setTab('Activité'); }}><Calendar size={15} /> Planifier</Button>
          <Button size="sm" variant="ghost" onClick={() => setStatus('Archivé')}><Archive size={15} /> Archiver</Button>
        </div>
      </div>
      <dl className="mt-5 grid grid-cols-2 gap-4 border-t border-border pt-4 sm:grid-cols-4">
        {[['Budget estimé', lead.amount], ['Source', lead.source], ['Prochaine action', lead.next], ['Créé le', lead.date]].map(([k, v]) => <div key={k}><dt className="text-[11px] uppercase text-muted-foreground">{k}</dt><dd className="mt-1 text-sm font-semibold">{v}</dd></div>)}
      </dl>
    </div>

    {/* Pipeline */}
    <div className="rounded-lg border border-border bg-card p-3">
      <div className="flex overflow-x-auto">
        {stages.map((s, i) => <button key={s} type="button" onClick={() => setStatus(s)} style={{ clipPath: i === 0 ? 'polygon(0 0,calc(100% - 12px) 0,100% 50%,calc(100% - 12px) 100%,0 100%)' : 'polygon(0 0,calc(100% - 12px) 0,100% 50%,calc(100% - 12px) 100%,0 100%,12px 50%)' }}
          className={`-ml-1 flex min-w-32 flex-1 items-center justify-center gap-1 px-5 py-2.5 text-xs font-semibold transition first:ml-0 ${i < current ? 'bg-primary/80 text-primary-foreground' : i === current ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground hover:bg-muted'}`}>
          {i < current && <Check size={13} />}{s}</button>)}
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2 px-1 text-xs"><span className="text-muted-foreground">Autre issue :</span>
        {['À rappeler', 'Nurserie', 'Inexploitable', 'Abandon'].map(s => <button key={s} type="button" onClick={() => setStatus(s)} className={`rounded-full border px-3 py-1 ${lead.status === s ? 'border-primary bg-primary text-primary-foreground' : 'border-border hover:border-primary'}`}>{s}</button>)}
        {current < stages.length - 1 && <Button size="sm" className="ml-auto" onClick={() => setStatus(stages[current + 1]!)}>Étape suivante <ChevronRight size={14} /></Button>}
      </div>
    </div>

    <div className="grid gap-5 lg:grid-cols-[minmax(0,1.85fr)_minmax(0,1fr)]">
      <div className="rounded-lg border border-border bg-card">
        <div role="tablist" className="flex border-b border-border px-2">{tabs.map(t => <button key={t} role="tab" aria-selected={tab === t} onClick={() => setTab(t)} className={`border-b-2 px-4 py-3 text-sm font-semibold ${tab === t ? 'border-primary text-primary' : 'border-transparent text-muted-foreground'}`}>{t}</button>)}</div>
        <div className="p-5">
          {tab === 'Activité' && <>
            <div className="rounded-lg border border-border p-3">
              <div className="mb-3 flex flex-wrap gap-1">{['Note', 'Appel', 'Email', 'Rendez-vous'].map(k => <button key={k} type="button" onClick={() => setKind(k)} className={`rounded px-3 py-1.5 text-xs font-semibold ${kind === k ? 'bg-primary text-primary-foreground' : 'bg-secondary'}`}>{k}</button>)}</div>
              <Textarea aria-label="Nouvelle activité" placeholder={`Ajouter : ${kind.toLowerCase()}...`} value={text} onChange={e => setText(e.target.value)} className="min-h-20" />
              <div className="mt-2 flex justify-end"><Button size="sm" onClick={() => { if (text.trim()) { addNote(lead.id, `${kind} · ${text.trim()}`); setText(''); notify(`${kind} enregistré(e).`); } }}><Plus size={15} /> Enregistrer</Button></div>
            </div>
            <ol className="mt-6 space-y-5 border-l border-border pl-6">{timeline.map((e, i) => <li key={i} className="relative"><span className="absolute -left-[37px] grid size-7 place-items-center rounded-full border border-border bg-background text-primary"><e.icon size={13} /></span>
              <div className="flex flex-wrap justify-between gap-2"><p className="text-sm font-semibold">{e.title}</p><span className="text-xs text-muted-foreground">{e.when} · {e.who}</span></div>{e.body && <p className="mt-1 text-sm text-muted-foreground">{e.body}</p>}</li>)}</ol>
          </>}
          {tab === 'Détails' && <div className="grid gap-6 md:grid-cols-2">
            <div><h4 className="mb-2 text-xs font-bold uppercase text-muted-foreground">Maison</h4><dl><Row label="Adresse" value={lead.address} /><Row label="Ville" value={lead.city} /><Row label="Code postal" value={lead.zip} /><Row label="Logement" value="Maison individuelle" /></dl></div>
            <div><h4 className="mb-2 text-xs font-bold uppercase text-muted-foreground">Projet</h4><dl><Row label="Service" value={lead.service} /><Row label="Budget" value={lead.amount} /><Row label="Urgence" value="Sous 3 mois" /><Row label="Potentiel" value="Élevé" /></dl></div>
            <div className="md:col-span-2"><h4 className="mb-2 text-xs font-bold uppercase text-muted-foreground">Message original</h4><p className="border-l-2 border-primary pl-3 text-sm">{lead.description}</p></div>
            <div className="md:col-span-2"><h4 className="mb-2 text-xs font-bold uppercase text-muted-foreground">Source</h4><dl className="grid md:grid-cols-2 md:gap-x-6"><Row label="Canal" value={lead.source} /><Row label="Campagne" value="Rénovation IDF 2026" /><Row label="Formulaire" value="Demande de devis" /><Row label="UTM" value={`source=${lead.source.toLowerCase().replaceAll(' ', '_')}`} /></dl></div>
          </div>}
          {tab === 'Documents' && <div className="grid place-items-center rounded-lg border border-dashed border-border py-12 text-center"><FileText className="text-muted-foreground" /><p className="mt-2 text-sm font-semibold">Aucun document</p><p className="text-xs text-muted-foreground">Devis, photos, avis d’imposition…</p><Button size="sm" variant="outline" className="mt-4" onClick={() => notify('Import simulé dans la démonstration.')}><Plus size={15} /> Ajouter un fichier</Button></div>}
        </div>
      </div>

      <aside className="space-y-5">
        <Card title="Contact" action={<button aria-label="Modifier le contact" className="text-muted-foreground hover:text-primary"><Pencil size={14} /></button>}>
          <dl><Row label="Téléphone" value={lead.phone} /><Row label="Email" value={lead.email} /><Row label="Adresse" value={lead.address} /></dl>
        </Card>
        <Card title="Prochaine action">
          <p className="text-sm font-semibold">{lead.next}</p>
          <div className="mt-3 grid grid-cols-2 gap-2"><Input type="date" aria-label="Date" className="h-9" /><Input type="time" aria-label="Heure" className="h-9" /></div>
          <Button size="sm" className="mt-3 w-full" onClick={() => notify('Prochaine action planifiée.')}>Planifier</Button>
        </Card>
        <Card title="Affectation">
          <select aria-label="Commercial" defaultValue={lead.owner} onChange={e => { setLeadList(p => p.map(l => l.id === lead.id ? { ...l, owner: e.target.value } : l)); notify(`Dossier affecté à ${e.target.value}.`); }} className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm">
            {['Laurent Moreau', 'Sophie Martin', 'Thomas Leroy', lead.owner].filter((v, i, a) => a.indexOf(v) === i).map(o => <option key={o}>{o}</option>)}
          </select>
        </Card>
        <Card title="Devis liés"><p className="text-sm text-muted-foreground">Aucun devis pour ce dossier.</p></Card>
      </aside>
    </div>
  </div>;
}
