import { createContext, useContext, useState, type ReactNode } from 'react';
import { leads, type Lead } from './oeko-data';

type DemoEntry = { section: string; title: string; detail: string; status: string; date: string };
type DemoContextValue = {
  leadList: Lead[]; setLeadList: React.Dispatch<React.SetStateAction<Lead[]>>;
  notes: Record<string, string[]>; addNote: (id: string, note: string) => void;
  entries: DemoEntry[]; addEntry: (entry: DemoEntry) => void;
};
const DemoContext = createContext<DemoContextValue | null>(null);
export function OekoDemoProvider({ children }: { children: ReactNode }) {
  const [leadList, setLeadList] = useState(leads);
  const [notes, setNotes] = useState<Record<string, string[]>>({});
  const [entries, setEntries] = useState<DemoEntry[]>([]);
  const addNote = (id: string, note: string) => setNotes(prev => ({ ...prev, [id]: [...(prev[id] ?? []), note] }));
  const addEntry = (entry: DemoEntry) => setEntries(prev => [entry, ...prev]);
  return <DemoContext.Provider value={{ leadList, setLeadList, notes, addNote, entries, addEntry }}>{children}</DemoContext.Provider>;
}
export function useOekoDemo() {
  const context = useContext(DemoContext);
  if (!context) throw new Error('OEKO demo provider missing');
  return context;
}
