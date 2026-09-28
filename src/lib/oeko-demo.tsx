import { createContext, useContext, useState, type ReactNode } from 'react';
import { leads, quotes, rdvSeed, docSeed, logSeed, type DemoDoc, type Lead, type LeadEvent, type LogEntry, type Quote, type Rdv } from './oeko-data';
import { articleSeed, type Article } from './oeko-articles';

type DemoEntry = { section: string; title: string; detail: string; status: string; date: string };

const now = () => new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }).format(new Date());
const today = () => new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date());
const uid = (p: string) => `${p}-${Math.random().toString(36).slice(2, 8)}`;

// Qualification defaults so every seeded dossier shows its acquisition data.
const seeded: Lead[] = leads.map((l, i) => ({
  housing: 'Maison individuelle', year: ['Avant 1948', '1948–1974', '1975–2000', 'Après 2000'][i % 4]!,
  surface: ['120', '145', '96', '88', '130', '110'][i] ?? '110',
  heating: ['Chaudière fioul', 'Chaudière gaz', 'Électrique', 'Chaudière gaz', 'Électrique', 'Bois'][i] ?? 'Chaudière gaz',
  occupancy: 'Propriétaire occupant', income: ['Modestes', 'Intermédiaires', 'Très modestes', 'Modestes', 'Intermédiaires', 'Modestes'][i] ?? 'Modestes',
  persons: ['4', '3', '5', '2', '3', '4'][i] ?? '3',
  urgency: ['Sous 3 mois', 'Immédiate', 'Sous 3 mois', 'Sous 6 mois', 'Simple information', 'Sous 3 mois'][i] ?? 'Sous 3 mois',
  priority: i < 2 ? 'Haute' : i < 4 ? 'Normale' : 'Basse',
  potential: i < 3 ? 'Élevé' : 'Moyen',
  consent: true,
  channel: l.source === 'Google Ads' || l.source === 'Meta' ? 'Publicité payante' : l.source === 'SEO' ? 'Référencement naturel' : 'Contact direct',
  campaign: l.source === 'Google Ads' ? 'IDF · Rénovation 2026' : l.source === 'Meta' ? 'Meta · Aides PAC' : '—',
  landing: `/demande-de-devis/${l.service.toLowerCase().replaceAll(' ', '-')}`,
  utm: `utm_source=${l.source.toLowerCase().replaceAll(' ', '_')}&utm_medium=cpc&utm_campaign=idf_2026`,
  gclid: l.source === 'Google Ads' ? `Cj0KCQ${1000 + i}xRENOV` : '',
  fbclid: l.source === 'Meta' ? `IwAR${2000 + i}OEKO` : '',
  ...l,
}));

type DemoContextValue = {
  leadList: Lead[]; setLeadList: React.Dispatch<React.SetStateAction<Lead[]>>;
  notes: Record<string, string[]>; addNote: (id: string, note: string) => void;
  entries: DemoEntry[]; addEntry: (entry: DemoEntry) => void;
  desktopMenuOpen: boolean; setDesktopMenuOpen: React.Dispatch<React.SetStateAction<boolean>>;
  rdvList: Rdv[]; addRdv: (rdv: Omit<Rdv, 'id'>) => void; updateRdv: (id: string, patch: Partial<Rdv>) => void;
  quoteList: Quote[]; addQuote: (quote: Quote) => void; updateQuote: (ref: string, patch: Partial<Quote>) => void;
  docs: DemoDoc[]; addDoc: (doc: Omit<DemoDoc, 'id' | 'date'>) => void;
  events: LeadEvent[]; addEvent: (event: Omit<LeadEvent, 'id' | 'when'>) => void;
  log: LogEntry[]; addLog: (action: string, target: string) => void;
  updateLead: (id: string, patch: Partial<Lead>, logAction?: string) => void;
  articleList: Article[]; saveArticle: (article: Article, isNew: boolean) => void;
};
const DemoContext = createContext<DemoContextValue | null>(null);

export function OekoDemoProvider({ children }: { children: ReactNode }) {
  const [leadList, setLeadList] = useState<Lead[]>(seeded);
  const [notes, setNotes] = useState<Record<string, string[]>>({});
  const [entries, setEntries] = useState<DemoEntry[]>([]);
  const [desktopMenuOpen, setDesktopMenuOpen] = useState(true);
  const [rdvList, setRdvList] = useState<Rdv[]>(rdvSeed);
  const [quoteList, setQuoteList] = useState<Quote[]>(quotes);
  const [docs, setDocs] = useState<DemoDoc[]>(docSeed);
  const [events, setEvents] = useState<LeadEvent[]>([]);
  const [log, setLog] = useState<LogEntry[]>(logSeed);
  const [articleList, setArticleList] = useState<Article[]>(articleSeed);

  const addLog = (action: string, target: string) => setLog(p => [{ user: 'Alexandre Martin', action, when: now(), target }, ...p]);
  const addEvent: DemoContextValue['addEvent'] = e => setEvents(p => [{ ...e, id: uid('EV'), when: now() }, ...p]);
  const addNote = (id: string, note: string) => {
    setNotes(prev => ({ ...prev, [id]: [...(prev[id] ?? []), note] }));
    const [kind, ...rest] = note.split(' · ');
    addEvent({ leadId: id, kind: kind ?? 'Note', title: kind ?? 'Note', body: rest.join(' · '), who: 'Alexandre Martin' });
  };
  const addEntry = (entry: DemoEntry) => { setEntries(prev => [entry, ...prev]); addLog(`A enregistré un élément (${entry.section})`, entry.title); };
  const updateLead: DemoContextValue['updateLead'] = (id, patch, logAction) => {
    setLeadList(p => p.map(l => l.id === id ? { ...l, ...patch } : l));
    const lead = leadList.find(l => l.id === id);
    if (logAction) addLog(logAction, `${lead?.name ?? id} · ${id}`);
  };
  const addRdv: DemoContextValue['addRdv'] = rdv => {
    setRdvList(p => [...p, { ...rdv, id: uid('R') }]);
    addEvent({ leadId: rdv.lead, kind: 'Rendez-vous', title: `Rendez-vous planifié · ${rdv.project}`, body: `${rdv.address} · ${rdv.owner}`, who: rdv.owner });
    addLog('A créé un rendez-vous', `${rdv.client} · ${rdv.lead}`);
  };
  const updateRdv: DemoContextValue['updateRdv'] = (id, patch) => setRdvList(p => p.map(r => r.id === id ? { ...r, ...patch } : r));
  const addQuote: DemoContextValue['addQuote'] = quote => {
    setQuoteList(p => [quote, ...p]);
    addEvent({ leadId: quote.leadId, kind: 'Devis', title: `Devis ${quote.ref} · ${quote.status}`, body: `${quote.service} · ${quote.total} TTC`, who: 'Alexandre Martin' });
    setDocs(p => [{ id: uid('D'), leadId: quote.leadId, name: `Devis ${quote.ref}.pdf`, kind: 'Devis', date: today() }, ...p]);
    addLog('A créé un devis', `${quote.ref} · ${quote.name}`);
  };
  const updateQuote: DemoContextValue['updateQuote'] = (ref, patch) => setQuoteList(p => p.map(q => q.ref === ref ? { ...q, ...patch } : q));
  const addDoc: DemoContextValue['addDoc'] = doc => {
    setDocs(p => [{ ...doc, id: uid('D'), date: today() }, ...p]);
    addEvent({ leadId: doc.leadId, kind: 'Document', title: `Document ajouté · ${doc.name}`, body: doc.kind, who: 'Alexandre Martin' });
    addLog('A ajouté un document', doc.name);
  };

  const saveArticle: DemoContextValue['saveArticle'] = (a, isNew) => {
    setArticleList(p => isNew ? [a, ...p] : p.map(x => x.id === a.id ? a : x));
    addLog(isNew ? (a.status === 'Publié' ? 'A publié un article' : 'A créé un brouillon d’article') : 'A modifié un article', a.title);
  };

  return <DemoContext.Provider value={{ leadList, setLeadList, notes, addNote, entries, addEntry, desktopMenuOpen, setDesktopMenuOpen, rdvList, addRdv, updateRdv, quoteList, addQuote, updateQuote, docs, addDoc, events, addEvent, log, addLog, updateLead, articleList, saveArticle }}>{children}</DemoContext.Provider>;
}

export function useOekoDemo() {
  const context = useContext(DemoContext);
  if (!context) throw new Error('OEKO demo provider missing');
  return context;
}
