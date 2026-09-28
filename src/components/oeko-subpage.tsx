import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from '@tanstack/react-router';
import { ArrowLeft, Check } from 'lucide-react';
import { OekoLeadRecord } from './oeko-lead-record';
import { OekoNewLead } from './oeko-new-lead';
import { OekoNewQuote } from './oeko-new-quote';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useOekoDemo } from '@/lib/oeko-demo';
import { quotes, services, type Lead, type View } from '@/lib/oeko-data';

type FieldSpec = { name: string; type?: string; options?: string[] | undefined; wide?: boolean };
type Group = { title: string; fields: FieldSpec[] };
const f = (name: string, type = 'text', wide = false, options?: string[]): FieldSpec => ({ name, type, wide, options });
const buildGroups = (leadOptions: string[]): Record<string, Group[]> => ({
  dossiers: [
    { title: 'Contact', fields: [f('Nom complet'),f('Téléphone','tel'),f('Email','email'),f('Adresse','text',true),f('Ville'),f('Code postal')] },
    { title: 'Projet de rénovation', fields: [f('Service','text',false,services),f('Budget estimé','number'),f('Description','textarea',true)] },
    { title: 'Suivi commercial', fields: [f('Source','text',false,['Google Ads','SEO','Meta','Appels','Email','Apporteurs']),f('Commercial','text',false,['Laurent Moreau','Sophie Martin','Thomas Leroy','Non attribué']),f('Statut','text',false,['Nouveau','À qualifier','Qualifié','À rappeler'])] },
  ],
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
  planning: [{ title: 'Rendez-vous', fields: [f('Prospect','text',true,leadOptions),f('Type','text',false,['Visite technique','Appel de suivi','Présentation de devis']),f('Date','date'),f('Heure','time'),f('Durée','text',false,['30 min','1 heure','1 h 30','2 heures']),f('Adresse','text',true),f('Commercial','text',false,['Laurent Moreau','Sophie Martin','Thomas Leroy']),f('Commentaire','textarea',true)] }],
  devis: [
    { title: 'Informations du devis', fields: [f('Référence'),f('Date','date'),f('Prospect'),f('Service','text',false,services),f('Montant HT','number'),f('Montant TTC','number'),f('PDF','file',true)] },
    { title: 'Suivi commercial', fields: [f('Commentaire','textarea',true),f('Statut','text',false,['À préparer','Envoyé','À relancer','Accepté','Refusé'])] },
  ],
  vente: [{ title: 'Vente conclue', fields: [f('Prospect','text',true,leadOptions),f('Date','date'),f('Montant','number'),f('Service','text',false,services),f('Devis concerné'),f('Commentaire','textarea',true)] }],
  perte: [{ title: 'Motif de perte', fields: [f('Prospect','text',true,leadOptions),f('Concurrent'),f('Motif','text',false,['Trop cher','Concurrent','Projet abandonné','Projet reporté','Hors cible','Raison technique','Raison administrative','Impossible à joindre','Autre']),f('Commentaire','textarea',true)] }],
});
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
export function OekoSubpage({section,item,wide=false}:{section:string;item:string;wide?:boolean}) {
  const navigate = useNavigate();
  const { leadList, setLeadList, entries, addEntry, quoteList, updateQuote, addRdv, updateLead, addEvent } = useOekoDemo();
  const leadOptions = leadList.map(l => `${l.name} · ${l.id}`);
  const groups = buildGroups(leadOptions);
  const pickLead = (value: string) => leadList.find(l => value.includes(l.id)) ?? leadList.find(l => l.name === value);
  const [feedback,setFeedback] = useState('');
  const [preview,setPreview] = useState(false);
    const base = section === 'dossiers' || section === 'qualification' ? section : parent[section];
  const back = base ? `/${base}` : '/';
  const lead = leadList.find(l=>l.id === item);
  const isLead = (section === 'dossiers' || section === 'qualification') && item !== 'nouveau';
  const isNewLead = (section === 'dossiers' || section === 'qualification') && item === 'nouveau';
  const title = isLead ? lead?.name ?? 'Dossier introuvable' : isNewLead ? 'Nouveau dossier' : item === 'nouveau' ? section==='articles'?'Nouvel article':section==='realisations'?'Nouvelle réalisation':`Nouveau ${labels[section]?.toLowerCase() ?? 'document'}` : item === 'vente' ? 'Enregistrer une vente' : item === 'perte' ? 'Enregistrer une perte' : `Modifier ${labels[section]?.toLowerCase() ?? 'document'}`;
  const saved = entries.find(e=>e.section===section && e.title===item);
  const existing = item !== 'nouveau' && item !== 'vente' && item !== 'perte' ? item : '';
  const quote = section === 'devis' ? quotes.find(q=>q.ref===item) : undefined;
  const values: Record<string,string> = existing ? { Titre: existing, Nom: existing, Référence: existing, Prospect: quote?.name ?? existing, Service: quote?.service ?? '', 'Montant HT': quote?.amount.replace(/[^0-9]/g,'') ?? '', 'Montant TTC': quote?.total.replace(/[^0-9]/g,'') ?? '', Statut: quote?.status ?? '' } : {};
  const notify = (message:string) => { setFeedback(message); window.setTimeout(()=>setFeedback(''),3500); };
  const save = (e:FormEvent<HTMLFormElement>, override?:string) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    if (isNewLead) {
      const name = String(data.get('Nom complet') || '').trim();
      if (!name) return;
      const id = `OE-${Date.now()}`;
      const newLead: Lead = { id, name, initials: name.split(/\s+/).map(part => part[0]).slice(0,2).join('').toUpperCase(), city:String(data.get('Ville') || ''),zip:String(data.get('Code postal') || ''),phone:String(data.get('Téléphone') || ''),email:String(data.get('Email') || ''),service:String(data.get('Service') || ''),source:String(data.get('Source') || ''),status:String(data.get('Statut') || 'Nouveau'),date:'Aujourd’hui',owner:String(data.get('Commercial') || 'Non attribué'),amount:`${Number(data.get('Budget estimé') || 0).toLocaleString('fr-FR')} €`,next:'Aucune action',address:String(data.get('Adresse') || ''),description:String(data.get('Description') || '') };
      setLeadList(previous => [newLead, ...previous]);
      navigate({to:`/dossiers/${id}`});
      return;
    }
    const target = pickLead(String(data.get('Prospect') || ''));
    if (section === 'planning') {
      if (!target) { notify('Sélectionnez un prospect.'); return; }
      const type = String(data.get('Type') || 'Visite technique');
      const kind = type.startsWith('Appel') ? 'appel' as const : type.startsWith('Présentation') ? 'devis' as const : 'visite' as const;
      const iso = String(data.get('Date') || '');
      const dayNum = Number(iso.slice(8, 10));
      const day = Math.min(Math.max((dayNum || 25) - 21, 0), 6);
      const [hh, mm] = String(data.get('Heure') || '09:00').split(':');
      const start = Number(hh) + Number(mm ?? 0) / 60;
      const dur = { '30 min': 0.5, '1 heure': 1, '1 h 30': 1.5, '2 heures': 2 }[String(data.get('Durée') || '1 heure')] ?? 1;
      addRdv({ day, start, end: Math.min(start + dur, 19), kind, client: target.name, lead: target.id, city: target.city, dep: target.zip.slice(0, 2), address: String(data.get('Adresse') || `${target.address}, ${target.zip} ${target.city}`), phone: target.phone, owner: String(data.get('Commercial') || target.owner), project: target.service, status: 'Confirmé', report: String(data.get('Commentaire') || '') });
      updateLead(target.id, { status: 'RDV planifié', next: `${type} le ${iso || 'à confirmer'}` });
      navigate({ to: '/planning' });
      return;
    }
    if (item === 'vente' || item === 'perte') {
      if (!target) { notify('Sélectionnez un prospect.'); return; }
      const comment = String(data.get('Commentaire') || '');
      if (item === 'vente') {
        const amount = `${Number(data.get('Montant') || 0).toLocaleString('fr-FR')} €`;
        updateLead(target.id, { status: 'Vente', saleAmount: amount, next: 'Lancer le chantier' }, 'A enregistré une vente');
        addEvent({ leadId: target.id, kind: 'Vente', title: `Vente signée · ${amount}`, body: comment, who: target.owner });
        const linked = String(data.get('Devis concerné') || '');
        if (linked) updateQuote(linked, { status: 'Accepté' });
      } else {
        const reason = String(data.get('Motif') || 'Autre');
        updateLead(target.id, { status: 'Perdu', lossReason: reason, competitor: String(data.get('Concurrent') || ''), next: 'Aucune action' }, 'A enregistré une perte');
        addEvent({ leadId: target.id, kind: 'Perte', title: `Dossier perdu · ${reason}`, body: comment, who: target.owner });
      }
      navigate({ to: `/dossiers/${target.id}` });
      return;
    }
    const recordSection = section;
    const recordTitle = String(data.get('Titre') || data.get('Nom') || data.get('Référence') || data.get('Prospect') || 'Sans titre');
    addEntry({section: recordSection,title:recordTitle,detail:section==='devis' ? `${String(data.get('Prospect') || '')} · ${String(data.get('Service') || '')} · ${String(data.get('Montant HT') || '')} €` : String(data.get('Catégorie') || data.get('Service') || data.get('Ville') || ''),status:override || String(data.get('Statut') || 'Enregistré'),date:new Intl.DateTimeFormat('fr-FR',{day:'numeric',month:'short',year:'numeric'}).format(new Date())});
    if (section === 'devis' && quote) updateQuote(quote.ref, { status: override || String(data.get('Statut') || quote.status) });
    navigate({to:back});
  };
     return <div className={`mx-auto px-4 pb-20 pt-7 sm:px-7 lg:px-9 ${wide?'':isLead||isNewLead||(section==='devis'&&item==='nouveau')?'max-w-7xl':'max-w-5xl'}`}>
    <nav aria-label="Fil d’Ariane" className="mb-5 flex flex-wrap items-center gap-2 text-xs text-muted-foreground"><Link to="/" className="hover:text-primary">Espace OEKO</Link><span>/</span><button type="button" onClick={()=>navigate({to:back})} className="hover:text-primary">{base === 'dossiers' ? 'Dossiers CRM' : base === 'qualification' ? 'Qualification' : base === 'devis' ? 'Devis & ventes' : base === 'articles' ? 'Articles / Blog' : base === 'realisations' ? 'Réalisations' : base === 'planning' ? 'Planning' : 'Services'}</button><span>/</span><span className="font-semibold text-foreground">{title}</span></nav>
    <Button variant="ghost" size="sm" className="mb-5 -ml-2" onClick={()=>navigate({to:back})}><ArrowLeft size={16}/> Retour</Button>
    {!isLead&&<div className="mb-8 flex flex-wrap items-start justify-between gap-4"><div><p className="text-[11px] font-bold uppercase text-primary">{isLead ? `Dossier ${lead?.id ?? ''}` : item==='nouveau' ? 'Création' : 'Gestion'}</p><h1 className="mt-2 text-2xl font-bold sm:text-3xl">{title}</h1><p className="mt-2 text-sm text-muted-foreground">{isLead ? `${lead?.city ?? ''} · ${lead?.service ?? ''}` : 'Espace de travail OEKO'}</p></div></div>}
    {isLead ? lead ? <OekoLeadRecord lead={lead} notify={notify} /> : <p className="text-sm text-muted-foreground">Ce dossier n’existe pas dans la démonstration.</p> : isNewLead ? <OekoNewLead /> : section==='devis'&&item==='nouveau' ? <OekoNewQuote /> : groups[item==='vente'||item==='perte'?item:section] ? <form onSubmit={e=>save(e)} className={wide?'':'max-w-4xl'}><div className="space-y-2">{(groups[item==='vente'||item==='perte'?item:section] ?? []).map(group=><Section key={group.title} title={group.title}><div className="grid gap-5 sm:grid-cols-2">{group.fields.map(spec=><Field key={spec.name} spec={spec} value={saved?.title && ['Titre','Nom','Référence'].includes(spec.name)?saved.title:values[spec.name]}/>)}</div></Section>)}</div>
      {preview && <section className="my-5 border-t border-border py-6"><h2 className="text-base font-bold">Prévisualisation</h2><p className="mt-3 text-sm text-muted-foreground">La prévisualisation du contenu s’affiche ici après publication.</p></section>}
      <div className="mt-7 flex flex-wrap items-center justify-end gap-2 border-t border-border pt-6"><Button type="button" variant="outline" onClick={()=>navigate({to:back})}>Annuler</Button>{section==='articles'&&<><Button type="button" variant="outline" onClick={e=>{const form=e.currentTarget.closest('form');if(form)save({preventDefault:()=>{},currentTarget:form} as FormEvent<HTMLFormElement>,'Brouillon')}}>Brouillon</Button><Button type="button" variant="outline" onClick={()=>setPreview(!preview)}>Prévisualiser</Button></>}<Button type="submit"><Check size={16}/>{section==='articles'?'Publier':'Enregistrer'}</Button></div>
    </form> : <p className="text-sm text-muted-foreground">Cette page n’est pas disponible.</p>}
    {feedback&&<div role="status" className="fixed bottom-5 right-5 z-50 rounded bg-primary px-4 py-3 text-xs font-semibold text-primary-foreground shadow-lg">{feedback}</div>}
  </div>;
}
