import { useMemo, useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Camera, CircleAlert, CircleCheck, ImagePlus, Plus, Quote, Save, Star, Trash2, TrendingDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useOekoDemo } from '@/lib/oeko-demo';
import { services } from '@/lib/oeko-data';
import { slugify } from '@/lib/oeko-articles';
import chantierImage from '@/assets/chantier-facade.jpg';

const uid = () => Math.random().toString(36).slice(2, 8);
const today = () => new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date());
const DEPTS = [['75', 'Paris'], ['77', 'Seine-et-Marne'], ['78', 'Yvelines'], ['91', 'Essonne'], ['92', 'Hauts-de-Seine'], ['93', 'Seine-Saint-Denis'], ['94', 'Val-de-Marne'], ['95', 'Val-d’Oise']] as const;
const DPE = ['A', 'B', 'C', 'D', 'E', 'F', 'G'] as const;
const HOUSING = ['Maison individuelle', 'Maison mitoyenne', 'Pavillon années 70', 'Maison ancienne (avant 1948)', 'Appartement', 'Copropriété'];
const AIDS = ['MaPrimeRénov’', 'CEE (Coup de pouce)', 'Éco-PTZ', 'TVA 5,5 %', 'Aides locales'];
const PHASES = ['Avant', 'Pendant', 'Après'] as const;

type Photo = { id: string; phase: (typeof PHASES)[number]; alt: string; cover: boolean };
type Rea = {
  title: string; slug: string; service: string; city: string; dept: string; date: string; duration: string; housing: string; year: string; surface: string;
  problem: string; works: string; result: string; dpeBefore: string; dpeAfter: string; saving: string; budget: string; aidAmount: string; aids: string[];
  photos: Photo[]; testimonial: string; client: string; rating: number; consent: boolean; keyword: string; seoTitle: string; meta: string;
  status: 'Brouillon' | 'En relecture' | 'Publié' | 'Archivé';
};

const blank = (): Rea => ({
  title: '', slug: '', service: services[0]!, city: '', dept: '92', date: '', duration: '', housing: HOUSING[0]!, year: '', surface: '',
  problem: '', works: '', result: '', dpeBefore: 'F', dpeAfter: 'C', saving: '', budget: '', aidAmount: '', aids: ['MaPrimeRénov’'],
  photos: [], testimonial: '', client: '', rating: 5, consent: false, keyword: '', seoTitle: '', meta: '', status: 'Brouillon',
});
const seedFor = (name: string): Rea => ({
  ...blank(), title: name, slug: slugify(name), service: services.find(s => name.toLowerCase().includes(s.toLowerCase().split(' ')[0]!)) ?? services[0]!,
  city: 'Créteil', dept: '94', date: '2026-06-12', duration: '3 semaines', year: '1972', surface: '130',
  problem: 'Pavillon des années 70 très énergivore : murs non isolés, sensation de paroi froide et facture de chauffage de 2 900 € / an.',
  works: 'Isolation thermique par l’extérieur en polystyrène graphité 140 mm, enduit de finition taloché, traitement des ponts thermiques et reprise des appuis.',
  result: 'Confort d’hiver retrouvé et gain de deux classes DPE, validé par l’audit de fin de chantier.',
  dpeBefore: 'F', dpeAfter: 'C', saving: '38', budget: '26 400', aidAmount: '11 200', aids: ['MaPrimeRénov’', 'CEE (Coup de pouce)', 'TVA 5,5 %'],
  photos: [{ id: uid(), phase: 'Avant', alt: 'Façade du pavillon avant isolation à Créteil', cover: false }, { id: uid(), phase: 'Pendant', alt: 'Pose des isolants sur façade', cover: false }, { id: uid(), phase: 'Après', alt: 'Façade rénovée après ITE à Créteil', cover: true }],
  testimonial: 'Équipe à l’écoute, chantier propre et délais tenus. On a gagné en confort dès le premier hiver.', client: 'Laurent M.', rating: 5, consent: true,
  keyword: 'isolation extérieure créteil', seoTitle: `${name} à Créteil | Réalisation OEKO`, meta: 'Découvrez notre réalisation à Créteil (94) : isolation par l’extérieur, DPE F → C, 38 % d’économies et 11 200 € d’aides obtenues.', status: 'Publié',
});

const lbl = 'mb-1.5 block text-xs font-semibold';
const sel = 'h-10 w-full rounded-md border border-input bg-background px-3 text-sm';
const card = 'rounded-lg border border-border bg-card p-5';
const dpeColor = (l: string) => ({ A: 'bg-lime text-lime-foreground', B: 'bg-lime text-lime-foreground', C: 'bg-primary text-primary-foreground', D: 'bg-primary text-primary-foreground', E: 'bg-muted text-foreground', F: 'bg-destructive text-destructive-foreground', G: 'bg-destructive text-destructive-foreground' } as Record<string, string>)[l] ?? 'bg-muted';

function Chips({ all, value, onChange }: { all: readonly string[]; value: string[]; onChange: (v: string[]) => void }) {
  return <div className="flex flex-wrap gap-2">{all.map(a => { const on = value.includes(a); return <button key={a} type="button" onClick={() => onChange(on ? value.filter(x => x !== a) : [...value, a])} className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${on ? 'border-primary bg-primary text-primary-foreground' : 'border-border hover:border-primary'}`}>{a}</button>; })}</div>;
}

export function OekoRealisationEditor({ item }: { item: string }) {
  const navigate = useNavigate();
  const { addEntry, addLog } = useOekoDemo();
  const isNew = item === 'nouveau';
  const [r, setR] = useState<Rea>(() => isNew ? blank() : seedFor(decodeURIComponent(item)));
  const [slugTouched, setSlugTouched] = useState(!isNew);
  const [tab, setTab] = useState<'seo' | 'geo' | 'pub'>('seo');
  const [msg, setMsg] = useState('');
  const set = <K extends keyof Rea>(k: K, v: Rea[K]) => setR(p => ({ ...p, [k]: v }));
  const deptName = DEPTS.find(d => d[0] === r.dept)?.[1] ?? '';
  const gain = Math.max(0, DPE.indexOf(r.dpeBefore as never) - DPE.indexOf(r.dpeAfter as never));
  const num = (s: string) => Number(s.replace(/\s/g, '')) || 0;
  const rest = Math.max(0, num(r.budget) - num(r.aidAmount));

  const checks = useMemo(() => {
    const kw = r.keyword.toLowerCase().trim();
    return [
      ['Titre du chantier renseigné', r.title.trim().length > 5],
      ['Mot-clé local défini', kw.length > 3],
      ['Ville dans le title SEO', !!r.city && r.seoTitle.toLowerCase().includes(r.city.toLowerCase())],
      ['Title entre 45 et 60 caractères', r.seoTitle.length >= 45 && r.seoTitle.length <= 60],
      ['Meta entre 130 et 160 caractères', r.meta.length >= 130 && r.meta.length <= 160],
      ['Photos Avant et Après', r.photos.some(p => p.phase === 'Avant') && r.photos.some(p => p.phase === 'Après')],
      ['Texte alternatif sur chaque photo', r.photos.length > 0 && r.photos.every(p => p.alt.length > 10)],
      ['Photo à la une choisie', r.photos.some(p => p.cover)],
    ] as const;
  }, [r]);
  const geoChecks = [
    ['Ville et département précisés', !!r.city && !!r.dept],
    ['Problématique décrite (≥ 80 car.)', r.problem.length >= 80],
    ['Résultat chiffré (DPE ou économies)', gain > 0 || !!r.saving],
    ['Budget et aides indiqués', !!r.budget && !!r.aidAmount],
    ['Témoignage client avec accord', !!r.testimonial && r.consent],
  ] as const;
  const score = Math.round((checks.filter(c => c[1]).length / checks.length) * 100);
  const geo = Math.round((geoChecks.filter(c => c[1]).length / geoChecks.length) * 100);

  const save = (status: Rea['status']) => {
    if (!r.title.trim()) { setMsg('Le titre du chantier est obligatoire.'); return; }
    if (status === 'Publié' && r.testimonial && !r.consent) { setMsg('Accord écrit du client requis pour publier son témoignage.'); return; }
    set('status', status);
    addEntry({ section: 'realisations', title: r.title, detail: `${r.city || '—'} (${r.dept}) · ${r.service}`, status, date: today() });
    addLog(status === 'Publié' ? 'A publié une réalisation' : status === 'Archivé' ? 'A archivé une réalisation' : 'A enregistré une réalisation', r.title);
    setMsg(status === 'Publié' ? 'Réalisation publiée sur le site.' : status === 'Archivé' ? 'Réalisation archivée.' : 'Brouillon enregistré.');
    setTimeout(() => navigate({ to: '/realisations' }), 700);
  };
  const addPhoto = (phase: Photo['phase']) => set('photos', [...r.photos, { id: uid(), phase, alt: `${r.service} ${phase.toLowerCase()} travaux${r.city ? ` à ${r.city}` : ''}`, cover: r.photos.length === 0 }]);
  const cover = r.photos.find(p => p.cover);

  return <div className="pb-24">
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1.9fr)_minmax(300px,1fr)]">
      <div className="space-y-5">
        <section className={card}>
          <div className="mb-4 flex flex-wrap items-center gap-2"><span className="rounded-full bg-lime px-2.5 py-1 text-[11px] font-bold text-lime-foreground">{r.status}</span><span className="text-xs text-muted-foreground">{isNew ? 'Nouveau cas client' : 'Modification'} · Émilie Bernard</span></div>
          <label className={lbl}>Titre du chantier (H1)</label>
          <Input value={r.title} onChange={e => { set('title', e.target.value); if (!slugTouched) set('slug', slugify(`${e.target.value} ${r.city}`)); }} placeholder="Ex. Isolation extérieure d’un pavillon de 1972 à Créteil" className="h-12 text-lg font-bold" />
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            <div><label className={lbl}>Service réalisé</label><select value={r.service} onChange={e => set('service', e.target.value)} className={sel}>{services.map(x => <option key={x}>{x}</option>)}</select></div>
            <div><label className={lbl}>Ville</label><Input value={r.city} onChange={e => set('city', e.target.value)} placeholder="Ex. Versailles" /></div>
            <div><label className={lbl}>Département</label><select value={r.dept} onChange={e => set('dept', e.target.value)} className={sel}>{DEPTS.map(d => <option key={d[0]} value={d[0]}>{d[0]} · {d[1]}</option>)}</select></div>
            <div><label className={lbl}>Fin de chantier</label><Input type="date" value={r.date} onChange={e => set('date', e.target.value)} /></div>
            <div><label className={lbl}>Durée</label><Input value={r.duration} onChange={e => set('duration', e.target.value)} placeholder="Ex. 3 semaines" /></div>
            <div><label className={lbl}>Type de logement</label><select value={r.housing} onChange={e => set('housing', e.target.value)} className={sel}>{HOUSING.map(h => <option key={h}>{h}</option>)}</select></div>
            <div><label className={lbl}>Année de construction</label><Input value={r.year} onChange={e => set('year', e.target.value)} placeholder="Ex. 1972" /></div>
            <div><label className={lbl}>Surface (m²)</label><Input value={r.surface} onChange={e => set('surface', e.target.value)} /></div>
          </div>
        </section>

        <section className={card}>
          <h3 className="mb-4 text-sm font-bold">Récit du chantier</h3>
          {([['problem', '1 · Problématique initiale', 'Ce qui n’allait pas : déperditions, humidité, facture, inconfort…'], ['works', '2 · Solution et travaux réalisés', 'Techniques, matériaux, épaisseurs, marques, contraintes…'], ['result', '3 · Résultat pour le client', 'Confort, économies, esthétique, valorisation du bien…']] as const).map(([k, t, ph]) => <div key={k} className="mb-4 last:mb-0"><label className={lbl}>{t}</label><Textarea rows={3} value={r[k]} onChange={e => set(k, e.target.value)} placeholder={ph} /><p className="mt-1 text-[11px] text-muted-foreground">{r[k].length} caractères</p></div>)}
        </section>

        <section className={card}>
          <h3 className="mb-4 text-sm font-bold">Performance & financement</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div><label className={lbl}>Étiquette DPE avant → après</label><div className="flex items-center gap-2"><select value={r.dpeBefore} onChange={e => set('dpeBefore', e.target.value)} className={sel}>{DPE.map(d => <option key={d}>{d}</option>)}</select><span className="text-muted-foreground">→</span><select value={r.dpeAfter} onChange={e => set('dpeAfter', e.target.value)} className={sel}>{DPE.map(d => <option key={d}>{d}</option>)}</select></div></div>
            <div><label className={lbl}>Économies d’énergie (%)</label><Input value={r.saving} onChange={e => set('saving', e.target.value)} placeholder="Ex. 35" /></div>
            <div><label className={lbl}>Coût total TTC (€)</label><Input value={r.budget} onChange={e => set('budget', e.target.value)} /></div>
            <div><label className={lbl}>Aides obtenues (€)</label><Input value={r.aidAmount} onChange={e => set('aidAmount', e.target.value)} /></div>
          </div>
          <label className={`${lbl} mt-4`}>Aides mobilisées</label><Chips all={AIDS} value={r.aids} onChange={v => set('aids', v)} />
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <div className="rounded-md bg-muted p-3"><p className="text-[11px] text-muted-foreground">Gain DPE</p><div className="mt-1 flex items-center gap-1.5"><span className={`grid size-7 place-items-center rounded text-xs font-black ${dpeColor(r.dpeBefore)}`}>{r.dpeBefore}</span>→<span className={`grid size-7 place-items-center rounded text-xs font-black ${dpeColor(r.dpeAfter)}`}>{r.dpeAfter}</span><span className="ml-1 text-sm font-bold">+{gain} classe{gain > 1 ? 's' : ''}</span></div></div>
            <div className="rounded-md bg-muted p-3"><p className="text-[11px] text-muted-foreground">Économies</p><p className="mt-1 flex items-center gap-1 text-lg font-bold"><TrendingDown size={16} />{r.saving || '—'} %</p></div>
            <div className="rounded-md bg-muted p-3"><p className="text-[11px] text-muted-foreground">Reste à charge client</p><p className="mt-1 text-lg font-bold">{rest ? `${rest.toLocaleString('fr-FR')} €` : '—'}</p></div>
          </div>
        </section>

        <section className={card}>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2"><div><h3 className="text-sm font-bold">Photos avant / pendant / après</h3><p className="text-[11px] text-muted-foreground">Depuis la médiathèque · texte alternatif géolocalisé pour Google Images</p></div><div className="flex gap-2">{PHASES.map(ph => <Button key={ph} type="button" size="sm" variant="outline" onClick={() => addPhoto(ph)}><ImagePlus size={14} /> {ph}</Button>)}</div></div>
          {r.photos.length === 0 && <p className="rounded-md bg-muted p-6 text-center text-xs text-muted-foreground"><Camera className="mx-auto mb-2" size={20} />Aucune photo. Ajoutez au minimum une photo « Avant » et une photo « Après ».</p>}
          <div className="grid gap-4 sm:grid-cols-3">{PHASES.map(ph => <div key={ph} className="space-y-3"><p className="text-[11px] font-bold uppercase text-muted-foreground">{ph} · {r.photos.filter(p => p.phase === ph).length}</p>{r.photos.filter(p => p.phase === ph).map(p => <div key={p.id} className="overflow-hidden rounded-md border border-border">
            <div className="relative"><img src={chantierImage} alt={p.alt} className={`aspect-[4/3] w-full object-cover ${ph === 'Avant' ? 'grayscale' : ph === 'Pendant' ? 'sepia' : ''}`} />{p.cover && <span className="absolute left-2 top-2 rounded-full bg-lime px-2 py-0.5 text-[10px] font-bold text-lime-foreground">À la une</span>}</div>
            <div className="space-y-2 p-2"><Input value={p.alt} onChange={e => set('photos', r.photos.map(x => x.id === p.id ? { ...x, alt: e.target.value } : x))} placeholder="Texte alternatif" className="h-8 text-xs" /><div className="flex justify-between"><button type="button" onClick={() => set('photos', r.photos.map(x => ({ ...x, cover: x.id === p.id })))} className="text-[11px] font-semibold text-primary">Mettre à la une</button><button type="button" aria-label="Retirer la photo" onClick={() => set('photos', r.photos.filter(x => x.id !== p.id))} className="text-destructive"><Trash2 size={13} /></button></div></div>
          </div>)}</div>)}</div>
        </section>

        <section className={card}>
          <h3 className="mb-4 flex items-center gap-2 text-sm font-bold"><Quote size={15} /> Témoignage client</h3>
          <Textarea rows={3} value={r.testimonial} onChange={e => set('testimonial', e.target.value)} placeholder="Les mots du client, sans reformulation" />
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div><label className={lbl}>Signature (prénom + initiale)</label><Input value={r.client} onChange={e => set('client', e.target.value)} placeholder="Ex. Laurent M." /></div>
            <div><label className={lbl}>Note</label><div className="flex gap-1">{[1, 2, 3, 4, 5].map(n => <button key={n} type="button" aria-label={`${n} étoiles`} onClick={() => set('rating', n)}><Star size={20} className={n <= r.rating ? 'fill-primary text-primary' : 'text-muted-foreground'} /></button>)}</div></div>
          </div>
          <label className="mt-4 flex items-center gap-2 text-xs"><input type="checkbox" checked={r.consent} onChange={e => set('consent', e.target.checked)} /> Accord écrit du client pour la diffusion (photos et témoignage) — RGPD</label>
        </section>
      </div>

      <aside className="space-y-5 lg:sticky lg:top-4 lg:self-start">
        <section className={card}>
          <div className="grid grid-cols-2 gap-3">{[['Score SEO', score], ['Score GEO', geo]].map(([l, v]) => <div key={l} className="rounded-md bg-muted p-3 text-center"><p className="text-[11px] text-muted-foreground">{l}</p><p className="text-2xl font-black">{v}</p><div className="mt-2 h-1.5 rounded-full bg-background"><div className="h-full rounded-full bg-primary" style={{ width: `${v}%` }} /></div></div>)}</div>
          <div className="mt-4 flex rounded-md bg-muted p-1 text-xs font-semibold">{([['seo', 'SEO'], ['geo', 'Local & IA'], ['pub', 'Publication']] as const).map(([k, l]) => <button key={k} type="button" onClick={() => setTab(k)} className={`flex-1 rounded px-2 py-1.5 ${tab === k ? 'bg-background shadow-sm' : 'text-muted-foreground'}`}>{l}</button>)}</div>
          {tab === 'seo' && <div className="mt-4 space-y-3">
            <div><label className={lbl}>Mot-clé local</label><Input value={r.keyword} onChange={e => set('keyword', e.target.value)} placeholder="Ex. isolation extérieure créteil" /></div>
            <div><label className={lbl}>Title SEO · {r.seoTitle.length}/60</label><Input value={r.seoTitle} onChange={e => set('seoTitle', e.target.value)} /></div>
            <div><label className={lbl}>Meta description · {r.meta.length}/160</label><Textarea rows={3} value={r.meta} onChange={e => set('meta', e.target.value)} /></div>
            <div><label className={lbl}>Slug</label><Input value={r.slug} onChange={e => { setSlugTouched(true); set('slug', slugify(e.target.value)); }} /></div>
            <div className="rounded-md border border-border p-3"><p className="text-[11px] text-muted-foreground">oeko.fr › realisations › {r.slug || '…'}</p><p className="mt-1 text-sm font-semibold text-primary">{r.seoTitle || 'Title SEO de la réalisation'}</p><p className="mt-1 text-xs text-muted-foreground">{r.meta || 'Meta description…'}</p></div>
            <ul className="space-y-1.5">{checks.map(([l, ok]) => <li key={l} className="flex items-center gap-2 text-xs">{ok ? <CircleCheck size={14} className="text-primary" /> : <CircleAlert size={14} className="text-muted-foreground" />}{l}</li>)}</ul>
          </div>}
          {tab === 'geo' && <div className="mt-4 space-y-3">
            <div className="rounded-md bg-muted p-3 text-xs"><p className="font-semibold">Fiche locale</p><p className="mt-1 text-muted-foreground">{r.service} · {r.city || 'Ville ?'} ({r.dept} · {deptName}) · {r.housing}{r.year ? ` de ${r.year}` : ''}</p></div>
            <div className="rounded-md border border-border p-3 text-xs"><p className="font-semibold">Résumé repris par les moteurs IA</p><p className="mt-1 text-muted-foreground">À {r.city || '…'} ({r.dept}), OEKO a réalisé {r.service.toLowerCase()} sur {r.housing.toLowerCase()}{r.surface ? ` de ${r.surface} m²` : ''} : DPE {r.dpeBefore} → {r.dpeAfter}{r.saving ? `, ${r.saving} % d’économies` : ''}{r.aidAmount ? `, ${r.aidAmount} € d’aides` : ''}.</p></div>
            <ul className="space-y-1.5">{geoChecks.map(([l, ok]) => <li key={l} className="flex items-center gap-2 text-xs">{ok ? <CircleCheck size={14} className="text-primary" /> : <CircleAlert size={14} className="text-muted-foreground" />}{l}</li>)}</ul>
            <p className="text-[11px] text-muted-foreground">Balisage généré : LocalBusiness, Review, ImageObject.</p>
          </div>}
          {tab === 'pub' && <div className="mt-4 space-y-3">
            <div><label className={lbl}>Statut</label><select value={r.status} onChange={e => set('status', e.target.value as Rea['status'])} className={sel}>{['Brouillon', 'En relecture', 'Publié', 'Archivé'].map(x => <option key={x}>{x}</option>)}</select></div>
            {cover ? <img src={chantierImage} alt={cover.alt} className="aspect-[1.91/1] w-full rounded-md object-cover" /> : <p className="rounded-md bg-muted p-4 text-center text-xs text-muted-foreground">Choisissez une photo à la une pour l’aperçu de partage.</p>}
            <p className="text-sm font-bold">{r.title || 'Titre de la réalisation'}</p>
            <p className="text-xs text-muted-foreground">{r.city || 'Ville'} · {r.service}{r.testimonial ? ` · « ${r.testimonial.slice(0, 60)}… »` : ''}</p>
            {!isNew && <Button type="button" variant="outline" className="w-full" onClick={() => save('Archivé')}>Archiver la réalisation</Button>}
          </div>}
        </section>
      </aside>
    </div>

    <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-background/95 px-4 py-3 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-end gap-2">
        {msg && <span className="mr-auto text-xs font-semibold text-primary">{msg}</span>}
        <Button type="button" variant="ghost" onClick={() => navigate({ to: '/realisations' })}>Annuler</Button>
        <Button type="button" variant="outline" onClick={() => save('Brouillon')}><Save size={14} /> Brouillon</Button>
        <Button type="button" variant="outline" onClick={() => save('En relecture')}><Plus size={14} /> En relecture</Button>
        <Button type="button" onClick={() => save('Publié')}>Publier</Button>
      </div>
    </div>
  </div>;
}
