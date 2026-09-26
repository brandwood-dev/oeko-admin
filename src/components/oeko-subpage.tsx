import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from '@tanstack/react-router';
import { Archive, ArrowLeft, Check, FileText, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useOekoDemo } from '@/lib/oeko-demo';
import { quotes, services, type View } from '@/lib/oeko-data';

type FieldSpec = { name: string; type?: string; options?: string[] | undefined; wide?: boolean };
type Group = { title: string; fields: FieldSpec[] };
const f = (name: string, type = 'text', wide = false, options?: string[]): FieldSpec => ({ name, type, wide, options });
const groups: Record<string, Group[]> = {
  articles: [
    { title: 'Informations générales', fields: [f('Titre','text',true),f('Slug'),f('Catégorie','text',false,['Guide','Conseils','Actualités']),f('Résumé','textarea',true),f('Image principale','file',true)] },
    { title: 'Contenu de l’article', fields: [f('Contenu','textarea',true),f('FAQ','textarea',true),f('CTA'),f('Auteur')] },
    { title: 'Référencement & publication', fields: [f('Titre SEO'),f('Date','date'),f('Meta description','textarea',true),f('Statut','text',false,['Brouillon','Publié'])] },
  ],
  services: [
    { title: 'Présentation', fields: [f('Nom'),f('Titre'),f('Introduction','textarea',true),f('Bénéfices','textarea',true)] },
    { title: 'Contenu & associations', fields: [f('Contenu','textarea',true),f('FAQ','textarea',true),f('CTA'),f('Réalisations associées')] },
    { title: 'Référencement & publication', fields: [f('Titre SEO'),f('Slug'),f('Meta description','textarea',true),f('Statut','text',false,['Brouillon','Publié'])] },
  ],
  realisations: [
    { title: 'Le chantier', fields: [f('Titre','text',true),f('Ville'),f('Département'),f('Service','text',false,services),f('Type de logement'),f('Date','date')] },
    { title: 'Projet & résultat', fields: [f('Problématique','textarea',true),f('Travaux réalisés','textarea',true),f('Résultat','textarea',true),f('Description','textarea',true),f('Témoignage','textarea',true)] },
    { title: 'Photos du chantier', fields: [f('Photos avant','file'),f('Photos pendant','file'),f('Photos après','file')] },
    { title: 'Référencement & publication', fields: [f('Titre SEO'),f('Statut','text',false,['Brouillon','Publié']),f('Meta description','textarea',true)] },
  ],
  planning: [{ title: 'Rendez-vous', fields: [f('Type','text',false,['Visite technique','Appel de suivi','Présentation de devis']),f('Date','date'),f('Heure','time'),f('Durée','text',false,['30 min','1 heure','1 h 30','2 heures']),f('Adresse','text',true),f('Commercial','text',false,['Laurent Moreau','Sophie Martin','Thomas Leroy']),f('Commentaire','textarea',true)] }],
  devis: [
    { title: 'Informations du devis', fields: [f('Référence'),f('Date','date'),f('Prospect'),f('Service','text',false,services),f('Montant HT','number'),f('Montant TTC','number'),f('PDF','file',true)] },
    { title: 'Suivi commercial', fields: [f('Commentaire','textarea',true),f('Statut','text',false,['À préparer','Envoyé','À relancer','Accepté','Refusé'])] },
  ],
  vente: [{ title: 'Vente conclue', fields: [f('Date','date'),f('Montant','number'),f('Service','text',false,services),f('Devis concerné'),f('Commentaire','textarea',true)] }],
  perte: [{ title: 'Motif de perte', fields: [f('Motif','text',false,['Trop cher','Concurrent','Projet abandonné','Projet reporté','Hors cible','Raison technique','Raison administrative','Impossible à joindre','Autre']),f('Commentaire','textarea',true)] }],
};
const labels: Record<string,string> = { articles:'Article',services:'Service',realisations:'Réalisation',planning:'Rendez-vous',devis:'Devis',vente:'Vente',perte:'Perte' };
const parent: Record<string,View> = { articles:'articles',services:'services',realisations:'realisations',planning:'planning',devis:'devis',vente:'devis',perte:'devis' };
function Field({ spec, value }: { spec: FieldSpec; value?: string | undefined }) {
  const id = `field-${spec.name.replaceAll(' ','-')}`;
  const base = 'w-full rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring';
  return <div className={spec.wide ? 'sm:col-span-2' : ''}><label htmlFor={id} className="mb-2 block text-xs font-semibold">{spec.name}</label>
    {spec.options ? <select id={id} name={spec.name} defaultValue={value || spec.options[0]} className={`${base} h-10`}>{spec.options.map(o=><option key={o}>{o}</option>)}</select> : spec.type === 'textarea' ? <Textarea id={id} name={spec.name} defaultValue={value} className="min-h-32 bg-background" /> : <Input id={id} name={spec.name} type={spec.type ?? 'text'} defaultValue={value} className="h-10 bg-background" />}
  </div>;
}
function Section({title,children}:{title:string;children:React.ReactNode}) { return <section className="border-t border-border py-7 first:border-t-0 first:pt-0"><h2 className="mb-5 text-base font-bold">{title}</h2>{children}</section>; }
export function OekoSubpage({section,item}:{section:string;item:string}) {
  const navigate = useNavigate();
  const { leadList, setLeadList, notes, addNote, entries, addEntry } = useOekoDemo();
  const [feedback,setFeedback] = useState('');
  const [preview,setPreview] = useState(false);
  const [note,setNote] = useState('');
  const base = section === 'dossiers' || section === 'qualification' ? section : parent[section];
  const back = base ? `/${base}` : '/';
  const lead = leadList.find(l=>l.id === item);
  const isLead = section === 'dossiers' || section === 'qualification';
  const title = isLead ? lead?.name ?? 'Dossier introuvable' : item === 'nouveau' ? section==='articles'?'Nouvel article':section==='realisations'?'Nouvelle réalisation':`Nouveau ${labels[section]?.toLowerCase() ?? 'document'}` : item === 'vente' ? 'Enregistrer une vente' : item === 'perte' ? 'Enregistrer une perte' : `Modifier ${labels[section]?.toLowerCase() ?? 'document'}`;
  const saved = entries.find(e=>e.section===section && e.title===item);
  const existing = item !== 'nouveau' && item !== 'vente' && item !== 'perte' ? item : '';
  const quote = section === 'devis' ? quotes.find(q=>q.ref===item) : undefined;
  const values: Record<string,string> = existing ? { Titre: existing, Nom: existing, Référence: existing, Prospect: quote?.name ?? existing, Service: quote?.service ?? '', 'Montant HT': quote?.amount.replace(/[^0-9]/g,'') ?? '', 'Montant TTC': quote?.total.replace(/[^0-9]/g,'') ?? '', Statut: quote?.status ?? '' } : {};
  const notify = (message:string) => { setFeedback(message); window.setTimeout(()=>setFeedback(''),3500); };
  const save = (e:FormEvent<HTMLFormElement>, override?:string) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const recordSection = section === 'devis' && (item === 'vente' || item === 'perte') ? item : section;
    const recordTitle = String(data.get('Titre') || data.get('Nom') || data.get('Référence') || data.get('Prospect') || (recordSection==='vente'?'Vente enregistrée':recordSection==='perte'?'Perte enregistrée':'Sans titre'));
    addEntry({section: recordSection,title:recordTitle,detail:section==='devis' ? `${String(data.get('Prospect') || '')} · ${String(data.get('Service') || '')} · ${String(data.get('Montant HT') || '')} €` : String(data.get('Catégorie') || data.get('Service') || data.get('Ville') || ''),status:override || String(data.get('Statut') || 'Enregistré'),date:new Intl.DateTimeFormat('fr-FR',{day:'numeric',month:'short',year:'numeric'}).format(new Date())});
    navigate({to:back});
  };
  const changeStatus = (status:string) => { if (!lead) return; setLeadList(prev=>prev.map(l=>l.id===lead.id?{...l,status}:l)); notify(`Dossier ${status.toLowerCase()}.`); };
  return <div className="mx-auto max-w-5xl px-4 pb-20 pt-7 sm:px-7 lg:px-9">
    <nav aria-label="Fil d’Ariane" className="mb-5 flex flex-wrap items-center gap-2 text-xs text-muted-foreground"><Link to="/" className="hover:text-primary">Espace OEKO</Link><span>/</span><button type="button" onClick={()=>navigate({to:back})} className="hover:text-primary">{base === 'dossiers' ? 'Dossiers CRM' : base === 'qualification' ? 'Qualification' : base === 'devis' ? 'Devis & ventes' : base === 'articles' ? 'Articles / Blog' : base === 'realisations' ? 'Réalisations' : base === 'planning' ? 'Planning' : 'Services'}</button><span>/</span><span className="font-semibold text-foreground">{title}</span></nav>
    <Button variant="ghost" size="sm" className="mb-5 -ml-2" onClick={()=>navigate({to:back})}><ArrowLeft size={16}/> Retour</Button>
    <div className="mb-8 flex flex-wrap items-start justify-between gap-4"><div><p className="text-[11px] font-bold uppercase text-primary">{isLead ? `Dossier ${lead?.id ?? ''}` : item==='nouveau' ? 'Création' : 'Gestion'}</p><h1 className="mt-2 text-2xl font-bold sm:text-3xl">{title}</h1><p className="mt-2 text-sm text-muted-foreground">{isLead ? `${lead?.city ?? ''} · ${lead?.service ?? ''}` : 'Espace de travail OEKO'}</p></div>{lead&&<span className="rounded bg-secondary px-3 py-1.5 text-xs font-semibold text-primary">{lead.status}</span>}</div>
    {isLead ? lead ? <div className="space-y-7">
      <div className="flex flex-wrap gap-2 border-b border-border pb-6">{['Qualifié','À rappeler','Nurserie','Inexploitable','Abandon'].map(s=><Button key={s} size="sm" variant={lead.status===s?'default':'outline'} onClick={()=>changeStatus(s)}>{s==='Qualifié'?'Qualifier':s}</Button>)}<Button variant="ghost" size="sm" className="sm:ml-auto" onClick={()=>changeStatus('Archivé')}><Archive size={15}/> Archiver</Button></div>
      <div className="grid gap-x-10 lg:grid-cols-2"><Section title="Contact"><div className="grid gap-4 sm:grid-cols-2"><Field spec={f('Prénom')} value={lead.name.split(' ')[0]}/><Field spec={f('Nom')} value={lead.name.split(' ').slice(1).join(' ')}/><Field spec={f('Téléphone')} value={lead.phone}/><Field spec={f('Email','email')} value={lead.email}/><Field spec={f('Adresse','text',true)} value={lead.address}/></div></Section><Section title="Maison"><div className="grid gap-4 sm:grid-cols-2"><Field spec={f('Adresse','text',true)} value={lead.address}/><Field spec={f('Ville')} value={lead.city}/><Field spec={f('Code postal')} value={lead.zip}/><Field spec={f('Type de logement','text',false,['Maison individuelle','Maison mitoyenne','Appartement'])}/></div></Section></div>
      <Section title="Projet"><div className="grid gap-4 sm:grid-cols-2"><Field spec={f('Service demandé')} value={lead.service}/><Field spec={f('Urgence','text',false,['Sous 3 mois','Immédiate','Sous 6 mois','Non définie'])}/><Field spec={f('Budget approximatif')} value={lead.amount}/><Field spec={f('Priorité','text',false,['Haute','Moyenne','Basse'])}/><Field spec={f('Potentiel','text',false,['Élevé','Moyen','Faible'])}/><Field spec={f('Description','textarea',true)} value={lead.description}/></div></Section>
      <div className="grid gap-x-10 lg:grid-cols-2"><Section title="Source & message original"><dl className="space-y-3 text-sm"><div><dt className="text-muted-foreground">Canal</dt><dd>{lead.source}</dd></div><div><dt className="text-muted-foreground">Campagne</dt><dd>Rénovation IDF 2026</dd></div><div><dt className="text-muted-foreground">Formulaire</dt><dd>Demande de devis</dd></div><div><dt className="text-muted-foreground">UTM</dt><dd>source={lead.source.toLowerCase().replaceAll(' ','_')}</dd></div><div><dt className="text-muted-foreground">Message original</dt><dd className="mt-1 border-l-2 border-primary pl-3">{lead.description}</dd></div></dl></Section><Section title="Affectation & prochaine action"><div className="grid gap-4 sm:grid-cols-2"><Field spec={f('Commercial','text',false,['Laurent Moreau','Sophie Martin','Thomas Leroy'])} value={lead.owner}/><Field spec={f('Action','text',false,['Appel','Rendez-vous','Devis','Relance'])}/><Field spec={f('Date','date')}/><Field spec={f('Heure','time')}/><Field spec={f('Commentaire','textarea',true)}/><Button size="sm" onClick={()=>notify('Prochaine action enregistrée pour ce dossier.')}>Enregistrer l’action</Button></div></Section></div>
      <div className="grid gap-x-10 lg:grid-cols-2"><Section title="Historique / timeline"><div className="space-y-4">{['Lead reçu · 25 sept. à 09:42',`Statut · ${lead.status}`,'Note','Appel','RDV','Devis','Vente / perte'].map((t,i)=><div key={t} className="flex items-center gap-3 text-sm"><span className={`size-2 shrink-0 rounded-full ${i<2?'bg-primary':'bg-border'}`}/>{t}</div>)}</div></Section><div><Section title="Notes"><div className="space-y-3">{(notes[lead.id]??[]).map((n,i)=><p key={i} className="border-l-2 border-primary pl-3 text-sm">{n}</p>)}<Textarea aria-label="Nouvelle note" placeholder="Ajouter une note..." value={note} onChange={e=>setNote(e.target.value)}/><Button size="sm" variant="outline" onClick={()=>{if(note.trim()){addNote(lead.id,note.trim());setNote('');notify('Note ajoutée.')}}}><Plus size={15}/> Ajouter une note</Button></div></Section><Section title="Documents"><div className="flex items-center gap-2 text-sm text-muted-foreground"><FileText size={16}/> Aucun document ajouté.</div></Section></div></div>
    </div> : <p className="text-sm text-muted-foreground">Ce dossier n’existe pas dans la démonstration.</p> : groups[item==='vente'||item==='perte'?item:section] ? <form onSubmit={e=>save(e)} className="max-w-4xl"><div className="space-y-2">{(groups[item==='vente'||item==='perte'?item:section] ?? []).map(group=><Section key={group.title} title={group.title}><div className="grid gap-5 sm:grid-cols-2">{group.fields.map(spec=><Field key={spec.name} spec={spec} value={saved?.title && ['Titre','Nom','Référence'].includes(spec.name)?saved.title:values[spec.name]}/>)}</div></Section>)}</div>
      {preview && <section className="my-5 border-t border-border py-6"><h2 className="text-base font-bold">Prévisualisation</h2><p className="mt-3 text-sm text-muted-foreground">La prévisualisation du contenu s’affiche ici après publication.</p></section>}
      <div className="mt-7 flex flex-wrap items-center justify-end gap-2 border-t border-border pt-6"><Button type="button" variant="outline" onClick={()=>navigate({to:back})}>Annuler</Button>{section==='articles'&&<><Button type="button" variant="outline" onClick={e=>{const form=e.currentTarget.closest('form');if(form)save({preventDefault:()=>{},currentTarget:form} as FormEvent<HTMLFormElement>,'Brouillon')}}>Brouillon</Button><Button type="button" variant="outline" onClick={()=>setPreview(!preview)}>Prévisualiser</Button></>}<Button type="submit"><Check size={16}/>{section==='articles'?'Publier':'Enregistrer'}</Button></div>
    </form> : <p className="text-sm text-muted-foreground">Cette page n’est pas disponible.</p>}
    {feedback&&<div role="status" className="fixed bottom-5 right-5 z-50 rounded bg-primary px-4 py-3 text-xs font-semibold text-primary-foreground shadow-lg">{feedback}</div>}
  </div>;
}
