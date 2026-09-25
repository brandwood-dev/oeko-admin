export type View = 'dashboard' | 'qualification' | 'dossiers' | 'journee' | 'planning' | 'devis' | 'articles' | 'services' | 'realisations' | 'mediatheque' | 'marketing' | 'performance' | 'parametres' | 'integrations' | 'journal';
export type Lead = { id: string; name: string; initials: string; city: string; zip: string; phone: string; email: string; service: string; source: string; status: string; date: string; owner: string; amount: string; next: string; address: string; description: string };
export const leads: Lead[] = [
  {id:'OE-24091',name:'Foued Benali',initials:'FB',city:'Créteil',zip:'94000',phone:'06 12 84 35 71',email:'foued.benali@exemple.fr',service:'Isolation extérieure',source:'Google Ads',status:'À qualifier',date:'Aujourd’hui, 09:42',owner:'Laurent Moreau',amount:'18 500 €',next:'Appel · Aujourd’hui 14:30',address:'18 rue du Général Leclerc',description:'Souhaite isoler la façade de sa maison des années 80 avant l’hiver.'},
  {id:'OE-24090',name:'Laurent Dubois',initials:'LD',city:'Versailles',zip:'78000',phone:'06 73 45 19 08',email:'laurent.dubois@exemple.fr',service:'Pompe à chaleur',source:'SEO',status:'À rappeler',date:'Aujourd’hui, 08:15',owner:'Sophie Martin',amount:'14 200 €',next:'Rappel · Aujourd’hui 16:00',address:'24 avenue de Paris',description:'Remplacement d’une ancienne chaudière fioul par une pompe à chaleur air-eau.'},
  {id:'OE-24089',name:'Camille Petit',initials:'CP',city:'Montreuil',zip:'93100',phone:'06 89 24 11 63',email:'camille.petit@exemple.fr',service:'Rénovation toiture',source:'Meta',status:'RDV planifié',date:'Hier, 17:28',owner:'Laurent Moreau',amount:'22 800 €',next:'RDV · Demain 10:00',address:'7 rue de la République',description:'Réfection complète de toiture avec amélioration de l’isolation.'},
  {id:'OE-24088',name:'Nadia Bensalem',initials:'NB',city:'Saint-Denis',zip:'93200',phone:'06 55 42 87 19',email:'nadia.bensalem@exemple.fr',service:'Menuiseries',source:'Appels',status:'Devis envoyé',date:'Hier, 14:06',owner:'Thomas Leroy',amount:'9 600 €',next:'Relance · Vendredi 11:00',address:'12 rue Gabriel Péri',description:'Remplacement de huit fenêtres pour améliorer le confort thermique.'},
  {id:'OE-24087',name:'Marc Lefèvre',initials:'ML',city:'Boulogne-Billancourt',zip:'92100',phone:'06 28 75 49 32',email:'marc.lefevre@exemple.fr',service:'Ravalement façade',source:'Google Ads',status:'Nouveau',date:'Hier, 11:22',owner:'Non attribué',amount:'16 400 €',next:'Aucune action',address:'33 rue de Sèvres',description:'Ravalement de façade et réparation des fissures.'},
  {id:'OE-24086',name:'Sofia Rahmani',initials:'SR',city:'Cergy',zip:'95000',phone:'06 34 92 17 80',email:'sofia.rahmani@exemple.fr',service:'Climatisation',source:'Email',status:'Qualifié',date:'23 sept. 2026',owner:'Sophie Martin',amount:'7 900 €',next:'Devis · Lundi 09:00',address:'5 allée des Tilleuls',description:'Installation de climatisation réversible dans une maison individuelle.'},
];
export const navGroups: { label: string; items: {view:View; label:string; icon:string}[] }[] = [
 {label:'VUE D’ENSEMBLE',items:[{view:'dashboard',label:'Tableau de bord',icon:'LayoutDashboard'},{view:'journee',label:'Ma journée',icon:'Sun'}]},
 {label:'RELATION CLIENT',items:[{view:'qualification',label:'Qualification',icon:'Inbox'},{view:'dossiers',label:'Dossiers CRM',icon:'Users'},{view:'planning',label:'Planning',icon:'CalendarDays'},{view:'devis',label:'Devis & ventes',icon:'FileText'}]},
 {label:'CONTENUS',items:[{view:'articles',label:'Articles / Blog',icon:'Newspaper'},{view:'services',label:'Services',icon:'Layers3'},{view:'realisations',label:'Réalisations',icon:'House'},{view:'mediatheque',label:'Médiathèque',icon:'Images'}]},
 {label:'PILOTAGE',items:[{view:'marketing',label:'Marketing',icon:'Megaphone'},{view:'performance',label:'Performance',icon:'ChartNoAxesCombined'}]},
 {label:'ADMINISTRATION',items:[{view:'parametres',label:'Paramètres',icon:'Settings2'},{view:'integrations',label:'Intégrations',icon:'PlugZap'},{view:'journal',label:'Journal d’activité',icon:'ScrollText'}]},
];
export const pathFor = (view: View) => view === 'dashboard' ? '/' : `/${view}`;
export const services = ['Façade','Toiture','Isolation extérieure (ITE)','Pompe à chaleur (PAC)','Climatisation','Menuiseries'];
export const articles = [
 {title:'Isolation extérieure : quelles aides en 2026 ?',type:'Guide',date:'22 sept. 2026',status:'Publié',author:'Émilie Bernard'},
 {title:'Pompe à chaleur ou chaudière : comment choisir ?',type:'Conseils',date:'18 sept. 2026',status:'Publié',author:'Émilie Bernard'},
 {title:'Rénover sa toiture avant l’hiver',type:'Actualités',date:'14 sept. 2026',status:'Brouillon',author:'Foued Benali'},
 {title:'Comprendre le DPE de votre maison',type:'Guide',date:'10 sept. 2026',status:'Publié',author:'Émilie Bernard'},
];
export const quotes = [
 {ref:'DEV-2026-084',name:'Nadia Bensalem',service:'Menuiseries',amount:'8 000 €',total:'9 600 €',date:'24 sept. 2026',status:'À relancer'},
 {ref:'DEV-2026-083',name:'Camille Petit',service:'Toiture',amount:'19 000 €',total:'22 800 €',date:'23 sept. 2026',status:'Envoyé'},
 {ref:'DEV-2026-082',name:'Sofia Rahmani',service:'Climatisation',amount:'6 583 €',total:'7 900 €',date:'20 sept. 2026',status:'À préparer'},
 {ref:'DEV-2026-081',name:'Laurent Dubois',service:'PAC',amount:'11 833 €',total:'14 200 €',date:'19 sept. 2026',status:'Accepté'},
];
