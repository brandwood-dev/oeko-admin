import { useMemo, useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { ArrowDown, ArrowUp, Check, CircleAlert, CircleCheck, Plus, Save, ShieldCheck, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useOekoDemo } from '@/lib/oeko-demo';
import { services } from '@/lib/oeko-data';
import { slugify } from '@/lib/oeko-articles';

const uid = () => Math.random().toString(36).slice(2, 8);
const today = () => new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date());
const DEPTS = [['75', 'Paris'], ['77', 'Seine-et-Marne'], ['78', 'Yvelines'], ['91', 'Essonne'], ['92', 'Hauts-de-Seine'], ['93', 'Seine-Saint-Denis'], ['94', 'Val-de-Marne'], ['95', 'Val-d’Oise']] as const;
const AIDS = ['MaPrimeRénov’', 'CEE (Coup de pouce)', 'Éco-PTZ', 'TVA 5,5 %', 'Aides locales'];
const CERTS = ['RGE Qualibat', 'Garantie décennale', 'QualiPAC', 'Assurance RC Pro', 'Artisan partenaire certifié'];
const POLES = ['Enveloppe du bâtiment', 'Chauffage & confort', 'Menuiseries & ouvertures'];

type Step = { id: string; title: string; body: string };
type Faq = { id: string; q: string; a: string };
type Svc = {
  name: string; slug: string; pole: string; pitch: string; description: string; priceFrom: string; priceTo: string; unit: string; duration: string;
  gain: string; aids: string[]; certs: string[]; depts: string[]; keyword: string; seoTitle: string; meta: string; steps: Step[]; faq: Faq[];
  cta: string; status: 'Brouillon' | 'En relecture' | 'Publié'; owner: string;
};

const blank = (name = ''): Svc => ({
  name, slug: slugify(name), pole: POLES[0]!, pitch: '', description: '', priceFrom: '', priceTo: '', unit: 'm²', duration: '', gain: '',
  aids: ['MaPrimeRénov’', 'CEE (Coup de pouce)'], certs: ['RGE Qualibat', 'Garantie décennale'], depts: ['92', '94'], keyword: '', seoTitle: '', meta: '',
  steps: [{ id: uid(), title: 'Visite technique gratuite', body: 'Un conseiller OEKO évalue votre logement et vos besoins.' }, { id: uid(), title: 'Devis détaillé et aides', body: 'Chiffrage transparent avec le montage des aides.' }, { id: uid(), title: 'Travaux par nos équipes RGE', body: 'Chantier suivi par un chef de projet dédié.' }],
  faq: [], cta: 'Demander une visite technique gratuite', status: 'Brouillon', owner: 'Émilie Bernard',
});

const seedFor = (name: string): Svc => {
  const b = blank(name);
  const k = name.toLowerCase();
  const heat = k.includes('pompe') || k.includes('clim');
  return { ...b, pole: heat ? POLES[1]! : k.includes('menuis') ? POLES[2]! : POLES[0]!, pitch: `${name} en Île-de-France par des artisans certifiés RGE.`,
    description: `OEKO accompagne les propriétaires franciliens pour leur projet de ${k} : diagnostic, chiffrage, montage des aides et réalisation du chantier.`,
    priceFrom: heat ? '9 000' : '120', priceTo: heat ? '16 000' : '220', unit: heat ? 'installation' : 'm²', duration: heat ? '2 à 3 jours' : '1 à 3 semaines', gain: heat ? 'Jusqu’à 60 % sur la facture de chauffage' : 'Jusqu’à 30 % de pertes de chaleur en moins',
    keyword: `${k} île-de-france`, seoTitle: `${name} en Île-de-France | Artisan RGE — OEKO`, meta: `${name} en Île-de-France : devis gratuit, artisans RGE, aides MaPrimeRénov’ et CEE. Visite technique offerte sous 72 h.`,
    faq: [{ id: uid(), q: `Quel est le prix d’un projet ${k} ?`, a: 'Le prix dépend de la surface et de l’état du logement ; nous remettons un devis détaillé après visite.' }, { id: uid(), q: 'Quelles aides puis-je obtenir ?', a: 'Selon vos revenus : MaPrimeRénov’, CEE, Éco-PTZ et TVA réduite à 5,5 %.' }], status: 'Publié' };
};

const lbl = 'mb-1.5 block text-xs font-semibold';
const sel = 'h-10 w-full rounded-md border border-input bg-background px-3 text-sm';
const card = 'rounded-lg border border-border bg-card p-5';

function Gauge({ label, n, min, max }: { label: string; n: number; min: number; max: number }) {
  const ok = n >= min && n <= max;
  return <div className="mt-1 flex items-center gap-2 text-[11px]"><div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted"><div className={`h-full ${ok ? 'bg-lime' : 'bg-destructive'}`} style={{ width: `${Math.min(100, (n / max) * 100)}%` }} /></div><span className={ok ? 'text-muted-foreground' : 'text-destructive'}>{label} {n}/{min}–{max}</span></div>;
}

function Chips({ all, value, onChange, render }: { all: readonly string[]; value: string[]; onChange: (v: string[]) => void; render?: (v: string) => string }) {
  return <div className="flex flex-wrap gap-2">{all.map(x => { const on = value.includes(x); return <button type="button" key={x} onClick={() => onChange(on ? value.filter(y => y !== x) : [...value, x])} className={`inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs font-semibold transition ${on ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-background hover:border-primary'}`}>{on && <Check size={12} />}{render ? render(x) : x}</button>; })}</div>;
}

export function OekoServiceEditor({ item }: { item: string }) {
  const navigate = useNavigate();
  const { addEntry, addLog } = useOekoDemo();
  const isNew = item === 'nouveau';
  const [s, setS] = useState<Svc>(() => isNew ? blank() : seedFor(decodeURIComponent(item)));
  const [slugTouched, setSlugTouched] = useState(!isNew);
  const [tab, setTab] = useState<'seo' | 'geo' | 'pub'>('seo');
  const [msg, setMsg] = useState('');
  const set = <K extends keyof Svc>(k: K, v: Svc[K]) => setS(p => ({ ...p, [k]: v }));

  const checks = useMemo(() => {
    const kw = s.keyword.toLowerCase().trim();
    return [
      ['Nom du service renseigné', s.name.trim().length > 2],
      ['Mot-clé principal défini', kw.length > 3],
      ['Mot-clé dans le title SEO', !!kw && s.seoTitle.toLowerCase().includes(kw.split(' ')[0]!)],
      ['Title entre 50 et 60 caractères', s.seoTitle.length >= 50 && s.seoTitle.length <= 60],
      ['Meta entre 130 et 160 caractères', s.meta.length >= 130 && s.meta.length <= 160],
      ['Description ≥ 150 caractères', s.description.length >= 150],
      ['Au moins 3 étapes de parcours', s.steps.filter(x => x.title).length >= 3],
      ['FAQ ≥ 2 questions (FAQPage)', s.faq.filter(f => f.q && f.a).length >= 2],
      ['Fourchette de prix indiquée', !!s.priceFrom && !!s.priceTo],
    ] as const;
  }, [s]);
  const geoChecks = [
    ['Au moins 2 départements ciblés', s.depts.length >= 2],
    ['Aides éligibles précisées', s.aids.length >= 1],
    ['Preuves de confiance (RGE, décennale)', s.certs.length >= 2],
    ['Réponse factuelle chiffrée (gain)', s.gain.length > 10],
    ['Durée des travaux indiquée', !!s.duration],
  ] as const;
  const score = Math.round((checks.filter(c => c[1]).length / checks.length) * 100);
  const geo = Math.round((geoChecks.filter(c => c[1]).length / geoChecks.length) * 100);
  const deptLabel = (c: string) => `${c} · ${DEPTS.find(d => d[0] === c)?.[1] ?? ''}`;

  const save = (status: Svc['status']) => {
    if (!s.name.trim()) { setMsg('Le nom du service est obligatoire.'); return; }
    set('status', status);
    addEntry({ section: 'services', title: s.name, detail: s.pitch || s.pole, status, date: today() });
    addLog(status === 'Publié' ? 'A publié un service' : 'A enregistré un service', s.name);
    setMsg(status === 'Publié' ? 'Service publié sur le site.' : 'Brouillon enregistré.');
    setTimeout(() => navigate({ to: '/services' }), 700);
  };
  const moveStep = (i: number, d: number) => setS(p => { const st = [...p.steps]; const j = i + d; if (j < 0 || j >= st.length) return p; [st[i], st[j]] = [st[j]!, st[i]!]; return { ...p, steps: st }; });

  return <div className="pb-24">
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1.9fr)_minmax(300px,1fr)]">
      <div className="space-y-5">
        <section className={card}>
          <div className="mb-4 flex flex-wrap items-center gap-2"><span className="rounded-full bg-lime px-2.5 py-1 text-[11px] font-bold text-lime-foreground">{s.status}</span><span className="text-xs text-muted-foreground">{isNew ? 'Nouveau service' : 'Modification'} · {s.owner}</span></div>
          <label className={lbl}>Nom du service (H1)</label>
          <Input value={s.name} onChange={e => { set('name', e.target.value); if (!slugTouched) set('slug', slugify(e.target.value)); }} placeholder="Ex. Isolation thermique par l’extérieur" className="h-12 text-lg font-bold" />
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div><label className={lbl}>Pôle d’expertise</label><select value={s.pole} onChange={e => set('pole', e.target.value)} className={sel}>{POLES.map(p => <option key={p}>{p}</option>)}</select></div>
            <div><label className={lbl}>Rattaché au métier</label><select className={sel} defaultValue={services.find(x => s.name.includes(x.split(' ')[0]!)) ?? services[0]}>{services.map(x => <option key={x}>{x}</option>)}</select></div>
          </div>
          <label className={`${lbl} mt-4`}>Accroche commerciale</label>
          <Input value={s.pitch} onChange={e => set('pitch', e.target.value)} placeholder="Une phrase claire sur le bénéfice client" />
          <label className={`${lbl} mt-4`}>Description détaillée</label>
          <Textarea value={s.description} onChange={e => set('description', e.target.value)} rows={5} placeholder="Problèmes résolus, solution technique, bénéfices, public concerné…" />
          <p className="mt-1 text-[11px] text-muted-foreground">{s.description.length} caractères · 150 minimum recommandés</p>
        </section>

        <section className={card}>
          <h3 className="mb-4 text-sm font-bold">Offre & chiffres clés</h3>
          <div className="grid gap-4 sm:grid-cols-4">
            <div><label className={lbl}>Prix à partir de (€)</label><Input value={s.priceFrom} onChange={e => set('priceFrom', e.target.value)} /></div>
            <div><label className={lbl}>Jusqu’à (€)</label><Input value={s.priceTo} onChange={e => set('priceTo', e.target.value)} /></div>
            <div><label className={lbl}>Unité</label><select value={s.unit} onChange={e => set('unit', e.target.value)} className={sel}>{['m²', 'installation', 'unité', 'forfait'].map(u => <option key={u}>{u}</option>)}</select></div>
            <div><label className={lbl}>Durée des travaux</label><Input value={s.duration} onChange={e => set('duration', e.target.value)} placeholder="Ex. 2 semaines" /></div>
          </div>
          <label className={`${lbl} mt-4`}>Gain énergétique annoncé</label>
          <Input value={s.gain} onChange={e => set('gain', e.target.value)} placeholder="Ex. Jusqu’à 25 % d’économies de chauffage" />
          <label className={`${lbl} mt-4`}>Aides éligibles</label><Chips all={AIDS} value={s.aids} onChange={v => set('aids', v)} />
          <label className={`${lbl} mt-4`}>Certifications & garanties</label><Chips all={CERTS} value={s.certs} onChange={v => set('certs', v)} />
        </section>

        <section className={card}>
          <div className="mb-4 flex items-center justify-between"><h3 className="text-sm font-bold">Parcours client (étapes)</h3><Button type="button" size="sm" variant="outline" onClick={() => set('steps', [...s.steps, { id: uid(), title: '', body: '' }])}><Plus size={14} /> Étape</Button></div>
          <div className="space-y-3">{s.steps.map((st, i) => <div key={st.id} className="flex gap-3 rounded-md border border-border p-3">
            <span className="grid size-7 shrink-0 place-items-center rounded-full bg-primary text-xs font-bold text-primary-foreground">{i + 1}</span>
            <div className="flex-1 space-y-2"><Input value={st.title} onChange={e => set('steps', s.steps.map(x => x.id === st.id ? { ...x, title: e.target.value } : x))} placeholder="Titre de l’étape" /><Textarea rows={2} value={st.body} onChange={e => set('steps', s.steps.map(x => x.id === st.id ? { ...x, body: e.target.value } : x))} placeholder="Détail" /></div>
            <div className="flex flex-col gap-1"><button type="button" aria-label="Monter" onClick={() => moveStep(i, -1)} className="rounded p-1 hover:bg-muted"><ArrowUp size={14} /></button><button type="button" aria-label="Descendre" onClick={() => moveStep(i, 1)} className="rounded p-1 hover:bg-muted"><ArrowDown size={14} /></button><button type="button" aria-label="Supprimer" onClick={() => set('steps', s.steps.filter(x => x.id !== st.id))} className="rounded p-1 text-destructive hover:bg-muted"><Trash2 size={14} /></button></div>
          </div>)}</div>
        </section>

        <section className={card}>
          <div className="mb-4 flex items-center justify-between"><div><h3 className="text-sm font-bold">FAQ du service</h3><p className="text-[11px] text-muted-foreground">Balisage FAQPage, repris par Google et les moteurs IA</p></div><Button type="button" size="sm" variant="outline" onClick={() => set('faq', [...s.faq, { id: uid(), q: '', a: '' }])}><Plus size={14} /> Question</Button></div>
          {s.faq.length === 0 && <p className="rounded-md bg-muted p-4 text-center text-xs text-muted-foreground">Aucune question. Ajoutez les questions réelles de vos prospects (prix, aides, durée, autorisations).</p>}
          <div className="space-y-3">{s.faq.map(f => <div key={f.id} className="space-y-2 rounded-md border border-border p-3"><div className="flex gap-2"><Input value={f.q} onChange={e => set('faq', s.faq.map(x => x.id === f.id ? { ...x, q: e.target.value } : x))} placeholder="Question" /><button type="button" aria-label="Supprimer la question" onClick={() => set('faq', s.faq.filter(x => x.id !== f.id))} className="px-2 text-destructive"><Trash2 size={14} /></button></div><Textarea rows={2} value={f.a} onChange={e => set('faq', s.faq.map(x => x.id === f.id ? { ...x, a: e.target.value } : x))} placeholder="Réponse courte et factuelle" /></div>)}</div>
        </section>

        <section className={card}>
          <h3 className="mb-3 text-sm font-bold">Appel à l’action</h3>
          <select value={s.cta} onChange={e => set('cta', e.target.value)} className={sel}>{['Demander une visite technique gratuite', 'Obtenir mon devis sous 48 h', 'Simuler mes aides 2026', 'Être rappelé par un conseiller'].map(c => <option key={c}>{c}</option>)}</select>
        </section>
      </div>

      <aside className="space-y-5 lg:sticky lg:top-4 lg:self-start">
        <div className={card}>
          <div className="grid grid-cols-2 gap-3">{[['Score SEO', score], ['Score GEO', geo]].map(([l, v]) => <div key={l as string} className="rounded-md bg-muted p-3 text-center"><p className="text-[11px] font-semibold text-muted-foreground">{l}</p><p className="text-2xl font-extrabold text-primary">{v}<span className="text-sm">/100</span></p></div>)}</div>
          <div className="mt-4 flex gap-1 rounded-md bg-muted p-1">{([['seo', 'SEO & SERP'], ['geo', 'Ciblage local'], ['pub', 'Publication']] as const).map(([k, l]) => <button type="button" key={k} onClick={() => setTab(k)} className={`flex-1 rounded px-2 py-1.5 text-xs font-semibold ${tab === k ? 'bg-background shadow-sm' : 'text-muted-foreground'}`}>{l}</button>)}</div>

          {tab === 'seo' && <div className="mt-4 space-y-4">
            <div><label className={lbl}>Mot-clé principal</label><Input value={s.keyword} onChange={e => set('keyword', e.target.value)} placeholder="ite val-de-marne" /></div>
            <div><label className={lbl}>Title SEO</label><Input value={s.seoTitle} onChange={e => set('seoTitle', e.target.value)} /><Gauge label="car." n={s.seoTitle.length} min={50} max={60} /></div>
            <div><label className={lbl}>Meta description</label><Textarea rows={3} value={s.meta} onChange={e => set('meta', e.target.value)} /><Gauge label="car." n={s.meta.length} min={130} max={160} /></div>
            <div><label className={lbl}>Slug</label><Input value={s.slug} onChange={e => { setSlugTouched(true); set('slug', slugify(e.target.value)); }} /></div>
            <div className="rounded-md border border-border p-3"><p className="text-[11px] text-muted-foreground">oeko.fr › services › {s.slug || 'mon-service'}</p><p className="truncate text-sm font-semibold text-primary">{s.seoTitle || s.name || 'Title SEO du service'}</p><p className="line-clamp-2 text-xs text-muted-foreground">{s.meta || 'La meta description apparaîtra ici dans Google.'}</p></div>
            <ul className="space-y-1.5">{checks.map(([l, ok]) => <li key={l} className="flex items-center gap-2 text-xs">{ok ? <CircleCheck size={14} className="text-primary" /> : <CircleAlert size={14} className="text-destructive" />}{l}</li>)}</ul>
          </div>}

          {tab === 'geo' && <div className="mt-4 space-y-4">
            <div><label className={lbl}>Départements d’intervention</label><Chips all={DEPTS.map(d => d[0])} value={s.depts} onChange={v => set('depts', v)} render={deptLabel} /></div>
            <p className="rounded-md bg-muted p-3 text-xs text-muted-foreground">Pages locales générées : {s.depts.length ? s.depts.map(c => `/${s.slug || 'service'}-${c}`).join(', ') : 'aucune'}</p>
            <ul className="space-y-1.5">{geoChecks.map(([l, ok]) => <li key={l} className="flex items-center gap-2 text-xs">{ok ? <CircleCheck size={14} className="text-primary" /> : <CircleAlert size={14} className="text-destructive" />}{l}</li>)}</ul>
          </div>}

          {tab === 'pub' && <div className="mt-4 space-y-4">
            <div><label className={lbl}>Statut</label><select value={s.status} onChange={e => set('status', e.target.value as Svc['status'])} className={sel}>{['Brouillon', 'En relecture', 'Publié'].map(x => <option key={x}>{x}</option>)}</select></div>
            <div><label className={lbl}>Responsable</label><select value={s.owner} onChange={e => set('owner', e.target.value)} className={sel}>{['Émilie Bernard', 'Alexandre Martin', 'Laurent Moreau'].map(x => <option key={x}>{x}</option>)}</select></div>
          </div>}
        </div>

        <div className={card}>
          <p className="mb-3 text-[11px] font-bold uppercase tracking-wide text-muted-foreground">Aperçu carte service</p>
          <p className="text-[11px] font-semibold text-muted-foreground">{s.pole}</p>
          <h4 className="text-base font-extrabold">{s.name || 'Nom du service'}</h4>
          <p className="mt-1 text-xs text-muted-foreground">{s.pitch || 'Accroche commerciale'}</p>
          {s.priceFrom && <p className="mt-3 text-sm font-bold text-primary">Dès {s.priceFrom} € / {s.unit}</p>}
          {s.gain && <p className="mt-1 text-xs">{s.gain}</p>}
          <div className="mt-3 flex flex-wrap gap-1">{s.aids.map(a => <span key={a} className="rounded bg-lime px-2 py-0.5 text-[10px] font-bold text-lime-foreground">{a}</span>)}</div>
          <div className="mt-2 flex flex-wrap gap-1">{s.certs.map(c => <span key={c} className="inline-flex items-center gap-1 rounded border border-border px-2 py-0.5 text-[10px]"><ShieldCheck size={10} />{c}</span>)}</div>
          <div className="mt-4 rounded-md bg-primary px-3 py-2 text-center text-xs font-bold text-primary-foreground">{s.cta}</div>
        </div>
      </aside>
    </div>

    <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-background/95 px-4 py-3 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-end gap-2">
        {msg && <span className="mr-auto text-xs font-semibold text-primary">{msg}</span>}
        <Button type="button" variant="ghost" onClick={() => navigate({ to: '/services' })}>Annuler</Button>
        <Button type="button" variant="outline" onClick={() => save('Brouillon')}><Save size={14} /> Brouillon</Button>
        <Button type="button" onClick={() => save('Publié')}>Publier le service</Button>
      </div>
    </div>
  </div>;
}
