import { useState } from 'react';
import { Check, Pencil, Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useOekoDemo } from '@/lib/oeko-demo';
import { OWNERS, SOURCES, STATUSES, TASK_TYPES, services, type Lead, type Task } from '@/lib/oeko-data';

const HOUSING = ['Maison individuelle', 'Appartement', 'Immeuble / copropriété', 'Local professionnel'];
const YEARS = ['Avant 1948', '1948–1974', '1975–2000', 'Après 2000'];
const HEATING = ['Chaudière fioul', 'Chaudière gaz', 'Électrique', 'Bois', 'Pompe à chaleur', 'Autre'];
const URGENCY = ['Immédiate', 'Sous 3 mois', 'Sous 6 mois', 'Plus de 6 mois', 'Simple information'];
const PRIORITY = ['Haute', 'Normale', 'Basse'];
const POTENTIAL = ['Élevé', 'Moyen', 'Faible'];
const CHANNELS = ['Publicité payante', 'Référencement naturel', 'Réseaux sociaux', 'Contact direct', 'Recommandation'];
const OCCUPANCY = ['Propriétaire occupant', 'Propriétaire bailleur', 'Locataire', 'Syndic / copropriété'];
const INCOMES = ['Très modestes', 'Modestes', 'Intermédiaires', 'Supérieurs'];

const selCls = 'h-9 w-full rounded-md border border-input bg-background px-3 text-sm';

function F({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block"><span className="mb-1.5 block text-xs font-semibold">{label}</span>{children}</label>;
}
function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return <section><h4 className="mb-3 text-xs font-bold uppercase text-muted-foreground">{title}</h4><div className="grid gap-3 sm:grid-cols-2">{children}</div></section>;
}

/** Panneau d'édition complet d'un dossier : contact, logement, qualification, acquisition. */
export function OekoLeadEditDialog({ lead, open, onClose, notify }: { lead: Lead; open: boolean; onClose: () => void; notify: (m: string) => void }) {
  const { updateLead } = useOekoDemo();
  const [d, setD] = useState<Lead>(lead);
  const set = (patch: Partial<Lead>) => setD(p => ({ ...p, ...patch }));
  if (!open) return null;
  const submit = () => {
    if (!d.name.trim()) { notify('Le nom du contact est obligatoire.'); return; }
    updateLead(lead.id, d, 'A modifié une fiche dossier');
    notify('Fiche dossier mise à jour.');
    onClose();
  };
  return <Dialog open onOpenChange={o => { if (!o) onClose(); }}>
    <DialogContent className="max-h-[88vh] max-w-3xl overflow-y-auto">
      <DialogHeader><DialogTitle>Modifier le dossier {lead.id}</DialogTitle><DialogDescription>Coordonnées, logement, qualification et données d’acquisition.</DialogDescription></DialogHeader>
      <div className="space-y-6">
        <Group title="Contact">
          <F label="Nom complet"><Input value={d.name} onChange={e => set({ name: e.target.value })} className="h-9" /></F>
          <F label="Téléphone"><Input value={d.phone} onChange={e => set({ phone: e.target.value })} className="h-9" /></F>
          <F label="Email"><Input type="email" value={d.email} onChange={e => set({ email: e.target.value })} className="h-9" /></F>
          <F label="Adresse"><Input value={d.address} onChange={e => set({ address: e.target.value })} className="h-9" /></F>
          <F label="Ville"><Input value={d.city} onChange={e => set({ city: e.target.value })} className="h-9" /></F>
          <F label="Code postal"><Input value={d.zip} onChange={e => set({ zip: e.target.value })} className="h-9" /></F>
        </Group>
        <Group title="Logement">
          <F label="Type de logement"><select value={d.housing ?? ''} onChange={e => set({ housing: e.target.value })} className={selCls}>{HOUSING.map(o => <option key={o}>{o}</option>)}</select></F>
          <F label="Année de construction"><select value={d.year ?? ''} onChange={e => set({ year: e.target.value })} className={selCls}>{YEARS.map(o => <option key={o}>{o}</option>)}</select></F>
          <F label="Surface (m²)"><Input value={d.surface ?? ''} onChange={e => set({ surface: e.target.value })} className="h-9" /></F>
          <F label="Chauffage actuel"><select value={d.heating ?? ''} onChange={e => set({ heating: e.target.value })} className={selCls}>{HEATING.map(o => <option key={o}>{o}</option>)}</select></F>
          <F label="Occupation"><select value={d.occupancy ?? ''} onChange={e => set({ occupancy: e.target.value })} className={selCls}>{OCCUPANCY.map(o => <option key={o}>{o}</option>)}</select></F>
          <F label="Revenus (MaPrimeRénov’)"><select value={d.income ?? ''} onChange={e => set({ income: e.target.value })} className={selCls}>{INCOMES.map(o => <option key={o}>{o}</option>)}</select></F>
        </Group>
        <Group title="Projet & qualification">
          <F label="Service"><select value={d.service} onChange={e => set({ service: e.target.value })} className={selCls}>{[d.service, ...services].filter((v, i, a) => a.indexOf(v) === i).map(o => <option key={o}>{o}</option>)}</select></F>
          <F label="Budget estimé"><Input value={d.amount} onChange={e => set({ amount: e.target.value })} className="h-9" /></F>
          <F label="Urgence"><select value={d.urgency ?? ''} onChange={e => set({ urgency: e.target.value })} className={selCls}>{URGENCY.map(o => <option key={o}>{o}</option>)}</select></F>
          <F label="Priorité"><select value={d.priority ?? ''} onChange={e => set({ priority: e.target.value })} className={selCls}>{PRIORITY.map(o => <option key={o}>{o}</option>)}</select></F>
          <F label="Potentiel"><select value={d.potential ?? ''} onChange={e => set({ potential: e.target.value })} className={selCls}>{POTENTIAL.map(o => <option key={o}>{o}</option>)}</select></F>
          <F label="Statut"><select value={d.status} onChange={e => set({ status: e.target.value })} className={selCls}>{[d.status, ...STATUSES].filter((v, i, a) => a.indexOf(v) === i).map(o => <option key={o}>{o}</option>)}</select></F>
          <F label="Commercial"><select value={d.owner} onChange={e => set({ owner: e.target.value })} className={selCls}>{[d.owner, ...OWNERS, 'Non attribué'].filter((v, i, a) => a.indexOf(v) === i).map(o => <option key={o}>{o}</option>)}</select></F>
          <F label="Personnes au foyer"><Input value={d.persons ?? ''} onChange={e => set({ persons: e.target.value })} className="h-9" /></F>
          <div className="sm:col-span-2"><F label="Demande du client"><Textarea value={d.description} onChange={e => set({ description: e.target.value })} className="min-h-20" /></F></div>
        </Group>
        <Group title="Acquisition & tracking">
          <F label="Source"><select value={d.source} onChange={e => set({ source: e.target.value })} className={selCls}>{[d.source, ...SOURCES].filter((v, i, a) => a.indexOf(v) === i).map(o => <option key={o}>{o}</option>)}</select></F>
          <F label="Canal"><select value={d.channel ?? ''} onChange={e => set({ channel: e.target.value })} className={selCls}>{CHANNELS.map(o => <option key={o}>{o}</option>)}</select></F>
          <F label="Campagne"><Input value={d.campaign ?? ''} onChange={e => set({ campaign: e.target.value })} className="h-9" /></F>
          <F label="Page d’arrivée"><Input value={d.landing ?? ''} onChange={e => set({ landing: e.target.value })} className="h-9" /></F>
          <div className="sm:col-span-2"><F label="Paramètres UTM"><Input value={d.utm ?? ''} onChange={e => set({ utm: e.target.value })} className="h-9" /></F></div>
          <F label="GCLID"><Input value={d.gclid ?? ''} onChange={e => set({ gclid: e.target.value })} className="h-9" /></F>
          <F label="FBCLID"><Input value={d.fbclid ?? ''} onChange={e => set({ fbclid: e.target.value })} className="h-9" /></F>
          <label className="flex items-center gap-2 text-sm sm:col-span-2"><input type="checkbox" checked={!!d.consent} onChange={e => set({ consent: e.target.checked })} className="size-4" />Consentement RGPD obtenu</label>
        </Group>
      </div>
      <div className="flex flex-wrap justify-end gap-2 border-t border-border pt-4">
        <Button variant="outline" onClick={onClose}><X size={15} /> Annuler</Button>
        <Button onClick={submit}><Check size={15} /> Enregistrer</Button>
      </div>
    </DialogContent>
  </Dialog>;
}

export const isLate = (t: Task) => !t.done && new Date(`${t.date}T${t.time || '00:00'}`).getTime() < Date.now();

/** Bloc « Prochaines actions » : créer, modifier, terminer, repérer les retards. */
export function OekoTaskPanel({ lead, notify }: { lead: Lead; notify: (m: string) => void }) {
  const { taskList, addTask, updateTask, updateLead } = useOekoDemo();
  const [editing, setEditing] = useState<string | null>(null);
  const [type, setType] = useState(TASK_TYPES[0]!);
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [comment, setComment] = useState('');
  const mine = taskList.filter(t => t.leadId === lead.id).sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`));

  const reset = () => { setEditing(null); setType(TASK_TYPES[0]!); setDate(''); setTime(''); setComment(''); };
  const submit = () => {
    if (!date || !time) { notify('Indiquez une date et une heure pour l’action.'); return; }
    if (editing) { updateTask(editing, { type, date, time, comment }); notify('Action mise à jour.'); }
    else {
      addTask({ leadId: lead.id, leadName: lead.name, type, date, time, comment, owner: lead.owner });
      updateLead(lead.id, { next: `${type} · ${date} ${time}` });
      notify('Prochaine action enregistrée.');
    }
    reset();
  };

  return <section className="rounded-lg border border-border bg-card">
    <header className="flex items-center justify-between border-b border-border px-4 py-3"><h3 className="text-sm font-bold">Prochaines actions</h3><span className="text-[11px] text-muted-foreground">{mine.filter(t => !t.done).length} à faire</span></header>
    <div className="p-4">
      {mine.length ? <ul className="mb-4 space-y-2">{mine.map(t => <li key={t.id} className={`rounded-md border p-2.5 text-xs ${isLate(t) ? 'border-destructive/40 bg-destructive/5' : 'border-border'} ${t.done ? 'opacity-55' : ''}`}>
        <div className="flex items-start gap-2">
          <button aria-label="Marquer comme terminée" onClick={() => updateTask(t.id, { done: !t.done })} className={`mt-0.5 grid size-4 shrink-0 place-items-center rounded border ${t.done ? 'border-primary bg-primary text-primary-foreground' : 'border-input'}`}>{t.done && <Check size={10} />}</button>
          <div className="min-w-0 flex-1">
            <p className={`font-bold ${t.done ? 'line-through' : ''}`}>{t.type}</p>
            <p className="text-muted-foreground">{t.date} · {t.time} · {t.owner}</p>
            {t.comment && <p className="mt-0.5">{t.comment}</p>}
            {isLate(t) && <span className="mt-1 inline-block rounded bg-destructive/10 px-1.5 py-0.5 font-bold text-destructive">En retard</span>}
          </div>
          <button aria-label="Modifier l’action" onClick={() => { setEditing(t.id); setType(t.type); setDate(t.date); setTime(t.time); setComment(t.comment); }} className="text-muted-foreground hover:text-primary"><Pencil size={13} /></button>
        </div>
      </li>)}</ul> : <p className="mb-4 text-xs text-muted-foreground">Aucune action planifiée pour ce dossier.</p>}
      <div className="space-y-2 rounded-md border border-dashed border-border p-3">
        <p className="text-xs font-bold">{editing ? 'Modifier l’action' : 'Planifier une action'}</p>
        <select aria-label="Type d’action" value={type} onChange={e => setType(e.target.value)} className={selCls}>{TASK_TYPES.map(o => <option key={o}>{o}</option>)}</select>
        <div className="grid grid-cols-2 gap-2"><Input aria-label="Date de l’action" type="date" value={date} onChange={e => setDate(e.target.value)} className="h-9" /><Input aria-label="Heure de l’action" type="time" value={time} onChange={e => setTime(e.target.value)} className="h-9" /></div>
        <Textarea aria-label="Commentaire" value={comment} onChange={e => setComment(e.target.value)} placeholder="Commentaire…" className="min-h-16" />
        <div className="flex gap-2"><Button size="sm" className="flex-1" onClick={submit}><Plus size={14} />{editing ? 'Mettre à jour' : 'Ajouter'}</Button>{editing && <Button size="sm" variant="outline" onClick={reset}>Annuler</Button>}</div>
      </div>
    </div>
  </section>;
}
