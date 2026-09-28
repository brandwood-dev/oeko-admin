export type View = 'dashboard' | 'qualification' | 'dossiers' | 'journee' | 'planning' | 'devis' | 'articles' | 'services' | 'realisations' | 'mediatheque' | 'marketing' | 'seo' | 'performance' | 'parametres' | 'integrations' | 'journal';
export type Lead = { id: string; name: string; initials: string; city: string; zip: string; phone: string; email: string; service: string; source: string; status: string; date: string; owner: string; amount: string; next: string; address: string; description: string;
  housing?: string; year?: string; surface?: string; heating?: string; occupancy?: string; income?: string; persons?: string;
  urgency?: string; priority?: string; potential?: string; consent?: boolean;
  channel?: string; campaign?: string; landing?: string; utm?: string; gclid?: string; fbclid?: string;
  lossReason?: string; competitor?: string; saleAmount?: string; archived?: boolean };
export const STATUSES = ['Nouveau','À qualifier','Qualifié','Commercial attribué','À rappeler','RDV planifié','Devis à faire','Devis envoyé','À relancer','Vente','Perdu'];
export const SIDE_STATUSES = ['Nurserie','Inexploitable','Abandon','Archivé'];
export const LOSS_REASONS = ['Trop cher','Concurrent','Projet abandonné','Projet reporté','Hors cible','Raison technique','Raison administrative','Impossible à joindre','Autre'];
export const OWNERS = ['Laurent Moreau','Sophie Martin','Thomas Leroy'];
export const SOURCES = ['Google Ads','SEO','Meta','Appels','Email','Apporteurs'];
export type Rdv = { id: string; day: number; start: number; end: number; kind: 'visite'|'devis'|'audit'|'appel'; client: string; lead: string; city: string; dep: string; address: string; phone: string; owner: string; project: string; status: string; report?: string };
export type Quote = { ref: string; leadId: string; name: string; service: string; amount: string; total: string; date: string; status: string; aid?: string; rest?: string };
export type DemoDoc = { id: string; leadId: string; name: string; kind: string; date: string };
export type LeadEvent = { id: string; leadId: string; kind: string; title: string; body: string; when: string; who: string };
export type LogEntry = { user: string; action: string; when: string; target: string };
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
 {label:'PILOTAGE',items:[{view:'marketing',label:'Marketing',icon:'Megaphone'},{view:'seo',label:'SEO & Acquisition',icon:'TrendingUp'},{view:'performance',label:'Performance',icon:'ChartNoAxesCombined'}]},
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
export const quotes: Quote[] = [
 {ref:'DEV-2026-084',leadId:'OE-24088',name:'Nadia Bensalem',service:'Menuiseries',amount:'8 000 €',total:'9 600 €',date:'24 sept. 2026',status:'À relancer'},
 {ref:'DEV-2026-083',leadId:'OE-24089',name:'Camille Petit',service:'Toiture',amount:'19 000 €',total:'22 800 €',date:'23 sept. 2026',status:'Envoyé'},
 {ref:'DEV-2026-082',leadId:'OE-24086',name:'Sofia Rahmani',service:'Climatisation',amount:'6 583 €',total:'7 900 €',date:'20 sept. 2026',status:'À préparer'},
 {ref:'DEV-2026-081',leadId:'OE-24090',name:'Laurent Dubois',service:'PAC',amount:'11 833 €',total:'14 200 €',date:'19 sept. 2026',status:'Accepté'},
];
export const rdvSeed: Rdv[] = [
  { id: 'R1', day: 0, start: 9.5, end: 11.5, kind: 'visite', client: 'Foued Benali', lead: 'OE-24091', city: 'Créteil', dep: '94', address: '18 rue du Général Leclerc, 94000 Créteil', phone: '06 12 84 35 71', owner: 'Laurent Moreau', project: 'PAC + ITE', status: 'Effectué' },
  { id: 'R2', day: 0, start: 14, end: 14.5, kind: 'appel', client: 'Marc Lefèvre', lead: 'OE-24087', city: 'Boulogne', dep: '92', address: '33 rue de Sèvres, 92100 Boulogne-Billancourt', phone: '06 28 75 49 32', owner: 'Sophie Martin', project: 'Ravalement', status: 'Effectué' },
  { id: 'R3', day: 1, start: 10, end: 12, kind: 'audit', client: 'Sofia Rahmani', lead: 'OE-24086', city: 'Cergy', dep: '95', address: '5 allée des Tilleuls, 95000 Cergy', phone: '06 34 92 17 80', owner: 'Sophie Martin', project: 'Climatisation', status: 'Effectué' },
  { id: 'R4', day: 2, start: 14, end: 15, kind: 'appel', client: 'Nadia Bensalem', lead: 'OE-24088', city: 'Saint-Denis', dep: '93', address: '12 rue Gabriel Péri, 93200 Saint-Denis', phone: '06 55 42 87 19', owner: 'Thomas Leroy', project: 'Menuiseries', status: 'Reporté' },
  { id: 'R5', day: 2, start: 9, end: 11, kind: 'visite', client: 'Laurent Dubois', lead: 'OE-24090', city: 'Versailles', dep: '78', address: '24 avenue de Paris, 78000 Versailles', phone: '06 73 45 19 08', owner: 'Laurent Moreau', project: 'PAC', status: 'Effectué' },
  { id: 'R6', day: 3, start: 16, end: 17.5, kind: 'devis', client: 'Laurent Dubois', lead: 'OE-24090', city: 'Versailles', dep: '78', address: '24 avenue de Paris, 78000 Versailles', phone: '06 73 45 19 08', owner: 'Sophie Martin', project: 'PAC', status: 'Effectué' },
  { id: 'R7', day: 4, start: 9, end: 10.5, kind: 'visite', client: 'Camille Petit', lead: 'OE-24089', city: 'Montreuil', dep: '93', address: '7 rue de la République, 93100 Montreuil', phone: '06 89 24 11 63', owner: 'Laurent Moreau', project: 'Toiture', status: 'Effectué' },
  { id: 'R8', day: 4, start: 11.5, end: 13, kind: 'devis', client: 'Nadia Bensalem', lead: 'OE-24088', city: 'Saint-Denis', dep: '93', address: '12 rue Gabriel Péri, 93200 Saint-Denis', phone: '06 55 42 87 19', owner: 'Thomas Leroy', project: 'Menuiseries', status: 'Confirmé' },
  { id: 'R9', day: 4, start: 14.5, end: 16.5, kind: 'visite', client: 'Foued Benali', lead: 'OE-24091', city: 'Meaux', dep: '77', address: '4 rue Saint-Rémy, 77100 Meaux', phone: '06 12 84 35 71', owner: 'Laurent Moreau', project: 'PAC + ITE', status: 'Confirmé' },
  { id: 'R10', day: 4, start: 16, end: 16.5, kind: 'appel', client: 'Laurent Dubois', lead: 'OE-24090', city: 'Versailles', dep: '78', address: '24 avenue de Paris, 78000 Versailles', phone: '06 73 45 19 08', owner: 'Sophie Martin', project: 'PAC', status: 'Confirmé' },
  { id: 'R11', day: 5, start: 10, end: 12, kind: 'audit', client: 'Marc Lefèvre', lead: 'OE-24087', city: 'Boulogne', dep: '92', address: '33 rue de Sèvres, 92100 Boulogne-Billancourt', phone: '06 28 75 49 32', owner: 'Thomas Leroy', project: 'Ravalement', status: 'Confirmé' },
];
export const docSeed: DemoDoc[] = [
  { id: 'D1', leadId: 'OE-24088', name: 'Devis DEV-2026-084.pdf', kind: 'Devis', date: '24 sept. 2026' },
  { id: 'D2', leadId: 'OE-24089', name: 'Photos toiture avant travaux.zip', kind: 'Photos', date: '22 sept. 2026' },
  { id: 'D3', leadId: 'OE-24090', name: 'Avis d’imposition 2025.pdf', kind: 'Aides', date: '20 sept. 2026' },
];
export const logSeed: LogEntry[] = [
  { user: 'Laurent Moreau', action: 'A qualifié un prospect', when: '25 sept. · 09:42', target: 'Foued Benali · OE-24091' },
  { user: 'Sophie Martin', action: 'A créé un rendez-vous', when: '25 sept. · 08:51', target: 'Laurent Dubois · OE-24090' },
  { user: 'Émilie Bernard', action: 'A publié un article', when: '24 sept. · 16:35', target: 'Isolation extérieure : quelles aides ?' },
  { user: 'Thomas Leroy', action: 'A envoyé un devis', when: '24 sept. · 14:12', target: 'DEV-2026-084' },
  { user: 'Alexandre Martin', action: 'A modifié un service', when: '23 sept. · 11:30', target: 'Pompe à chaleur' },
];

// --- Prochaines actions / tâches (démonstration) ---
export type Task = { id: string; leadId: string; leadName: string; type: string; date: string; time: string; comment: string; owner: string; done: boolean };
export const TASK_TYPES = ['Appel', 'Rappel', 'Visite technique', 'Présentation de devis', 'Relance devis', 'Document aides', 'Email'];
export const taskSeed: Task[] = [
  { id: 'T1', leadId: 'OE-24087', leadName: 'Marc Lefèvre', type: 'Appel', date: '2026-09-26', time: '09:00', comment: 'Premier contact · ravalement façade', owner: 'Sophie Martin', done: false },
  { id: 'T2', leadId: 'OE-24089', leadName: 'Camille Petit', type: 'Visite technique', date: '2026-09-28', time: '10:00', comment: 'Métrés toiture + relevé isolation', owner: 'Laurent Moreau', done: false },
  { id: 'T3', leadId: 'OE-24088', leadName: 'Nadia Bensalem', type: 'Relance devis', date: '2026-09-28', time: '11:00', comment: 'Devis DEV-2026-084 envoyé il y a 5 jours', owner: 'Thomas Leroy', done: false },
  { id: 'T4', leadId: 'OE-24090', leadName: 'Laurent Dubois', type: 'Document aides', date: '2026-09-27', time: '12:00', comment: 'Avis d’imposition manquant · MaPrimeRénov’', owner: 'Sophie Martin', done: false },
  { id: 'T5', leadId: 'OE-24091', leadName: 'Foued Benali', type: 'Visite technique', date: '2026-09-28', time: '14:30', comment: 'Audit façade ITE · maison de 1985', owner: 'Laurent Moreau', done: false },
  { id: 'T6', leadId: 'OE-24090', leadName: 'Laurent Dubois', type: 'Rappel', date: '2026-09-28', time: '16:00', comment: 'Choix PAC air-eau à confirmer', owner: 'Sophie Martin', done: false },
  { id: 'T7', leadId: 'OE-24086', leadName: 'Sofia Rahmani', type: 'Présentation de devis', date: '2026-09-28', time: '17:30', comment: 'Climatisation réversible · 3 pièces', owner: 'Sophie Martin', done: true },
];

// --- Centre de notifications (démonstration) ---
export type Notif = { id: string; kind: string; title: string; body: string; leadId?: string; when: string; read: boolean };
export const notifSeed: Notif[] = [
  { id: 'N1', kind: 'Nouveau lead', title: 'Nouveau lead · Foued Benali', body: 'Isolation extérieure · Créteil (94) · Google Ads', leadId: 'OE-24091', when: 'Aujourd’hui · 09:42', read: false },
  { id: 'N2', kind: 'Lead attribué', title: 'Dossier attribué à Sophie Martin', body: 'Laurent Dubois · Pompe à chaleur · Versailles (78)', leadId: 'OE-24090', when: 'Aujourd’hui · 08:20', read: false },
  { id: 'N3', kind: 'Rendez-vous proche', title: 'Visite technique dans 1 h', body: 'Camille Petit · Montreuil (93) · 10:00', leadId: 'OE-24089', when: 'Aujourd’hui · 09:00', read: false },
  { id: 'N4', kind: 'Action en retard', title: 'Action en retard · Marc Lefèvre', body: 'Appel de qualification prévu le 26 sept. à 09:00', leadId: 'OE-24087', when: 'Hier · 09:00', read: false },
  { id: 'N5', kind: 'Devis à relancer', title: 'Devis DEV-2026-084 à relancer', body: 'Nadia Bensalem · 9 600 € · envoyé il y a 5 jours', leadId: 'OE-24088', when: 'Hier · 14:12', read: true },
  { id: 'N6', kind: 'Document manquant', title: 'Document manquant · Laurent Dubois', body: 'Avis d’imposition 2025 requis pour MaPrimeRénov’', leadId: 'OE-24090', when: '26 sept. · 17:40', read: true },
];
