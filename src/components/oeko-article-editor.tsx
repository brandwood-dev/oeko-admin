import { useMemo, useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { ArrowDown, ArrowUp, Check, CircleAlert, CircleCheck, Eye, FileText, Plus, Save, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useOekoDemo } from '@/lib/oeko-demo';
import { services } from '@/lib/oeko-data';
import { slugify, type Article } from '@/lib/oeko-articles';

const uid = () => Math.random().toString(36).slice(2, 8);
const today = () => new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date());
const cities = ['Île-de-France', 'Seine-et-Marne', 'Yvelines', 'Essonne', 'Hauts-de-Seine', 'Seine-Saint-Denis', 'Val-de-Marne', 'Val-d’Oise', 'Paris'];
const templates: Record<string, string[]> = {
  Guide: ['Qu’est-ce que c’est ?', 'Combien ça coûte ?', 'Quelles aides en 2026 ?', 'Les étapes du chantier'],
  Conseils: ['Les critères pour bien choisir', 'Les erreurs à éviter', 'Notre recommandation'],
  Actualités: ['Ce qui change', 'Ce que cela implique pour vous'],
};
const blank = (): Article => ({ id: `A-${uid()}`, title: '', slug: '', type: 'Guide', service: services[0] ?? '', city: 'Île-de-France', keyword: '', summary: '', blocks: [{ id: uid(), heading: '', body: '' }], faq: [], cta: 'Demander un diagnostic gratuit', author: 'Émilie Bernard', date: today(), status: 'Brouillon', seoTitle: '', metaDescription: '', sources: '' });

const lbl = 'mb-1.5 block text-xs font-semibold';
const sel = 'h-10 w-full rounded-md border border-input bg-background px-3 text-sm';

export function OekoArticleEditor({ item }: { item: string }) {
  const navigate = useNavigate();
  const { articleList, saveArticle } = useOekoDemo();
  const existing = articleList.find(a => a.title === item || a.id === item || a.slug === item);
  const isNew = !existing;
  const [a, setA] = useState<Article>(() => existing ? structuredClone(existing) : blank());
  const [slugTouched, setSlugTouched] = useState(!isNew);
  const [tab, setTab] = useState<'seo' | 'geo' | 'google'>('seo');
  const [preview, setPreview] = useState(false);
  const [error, setError] = useState('');
  const set = <K extends keyof Article>(k: K, v: Article[K]) => setA(p => ({ ...p, [k]: v, ...(k === 'title' && !slugTouched ? { slug: slugify(String(v)) } : {}) }));

  const text = [a.summary, ...a.blocks.map(b => `${b.heading} ${b.body}`), ...a.faq.map(f => `${f.q} ${f.a}`)].join(' ');
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  const kw = a.keyword.trim().toLowerCase();
  const has = (s: string) => !!kw && s.toLowerCase().includes(kw);
  const seoTitle = a.seoTitle || a.title;
  const seoChecks = [
    { ok: !!kw, label: 'Mot-clé principal défini' },
    { ok: has(a.title), label: 'Mot-clé dans le titre' },
    { ok: seoTitle.length >= 30 && seoTitle.length <= 60, label: `Titre SEO 30–60 caractères (${seoTitle.length})` },
    { ok: a.metaDescription.length >= 120 && a.metaDescription.length <= 160, label: `Meta description 120–160 caractères (${a.metaDescription.length})` },
    { ok: has(a.metaDescription), label: 'Mot-clé dans la meta description' },
    { ok: a.blocks.some(b => has(b.heading)), label: 'Mot-clé dans un intertitre H2' },
    { ok: a.blocks.filter(b => b.heading).length >= 3, label: 'Au moins 3 intertitres H2' },
    { ok: words >= 600, label: `600 mots minimum (${words})` },
    { ok: !!a.slug && a.slug.length <= 60, label: 'URL courte et lisible' },
  ];
  const geoChecks = [
    { ok: a.summary.length >= 80 && a.summary.length <= 320, label: 'Réponse directe en introduction (80–320 car.)' },
    { ok: a.faq.filter(f => f.q && f.a).length >= 3, label: 'FAQ de 3 questions minimum' },
    { ok: a.blocks.some(b => b.heading.trim().endsWith('?')), label: 'Intertitres formulés en questions' },
    { ok: /\d/.test(text), label: 'Chiffres ou données concrètes' },
    { ok: a.sources.trim().split('\n').filter(Boolean).length >= 1, label: 'Sources officielles citées (ANAH, ADEME…)' },
    { ok: text.toLowerCase().includes(a.city.toLowerCase()) || text.includes('Île-de-France'), label: `Ancrage local (${a.city})` },
    { ok: /rge|2026|maprimerénov/i.test(text), label: 'Expertise : RGE, aides 2026' },
    { ok: !!a.author, label: 'Auteur identifié (E-E-A-T)' },
  ];
  const score = (c: { ok: boolean }[]) => Math.round(c.filter(x => x.ok).length / c.length * 100);
  const seoScore = score(seoChecks), geoScore = score(geoChecks);

  const duplicate = useMemo(() => articleList.find(x => x.id !== a.id && x.slug === a.slug && a.slug), [articleList, a.id, a.slug]);
  const updBlock = (id: string, patch: Partial<Article['blocks'][number]>) => set('blocks', a.blocks.map(b => b.id === id ? { ...b, ...patch } : b));
  const move = (i: number, d: number) => { const b = [...a.blocks]; const j = i + d; if (j < 0 || j >= b.length) return; [b[i], b[j]] = [b[j]!, b[i]!]; set('blocks', b); };
  const applyTemplate = () => set('blocks', (templates[a.type] ?? []).map(h => ({ id: uid(), heading: kw ? `${h.replace('?', '')} ${kw} ?`.replace(' ? ?', ' ?') : h, body: '' })));

  const submit = (status: string) => {
    if (!a.title.trim()) { setError('Ajoutez un titre avant d’enregistrer.'); return; }
    if (duplicate) { setError('Cette URL est déjà utilisée par un autre article.'); return; }
    saveArticle({ ...a, status, slug: a.slug || slugify(a.title), date: today() }, isNew);
    navigate({ to: '/articles' });
  };

  const Gauge = ({ v, label }: { v: number; label: string }) => (
    <div className="flex-1 rounded-lg border border-border p-3"><div className="flex items-baseline justify-between"><span className="text-xs font-semibold text-muted-foreground">{label}</span><span className="text-xl font-bold">{v}</span></div>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted"><div className={`h-full ${v >= 75 ? 'bg-accent' : v >= 45 ? 'bg-primary/60' : 'bg-destructive'}`} style={{ width: `${v}%` }} /></div></div>
  );

  return <div>
    <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
      <div><p className="text-[11px] font-bold uppercase text-primary">{isNew ? 'Studio de rédaction · Création' : `Studio de rédaction · Modification · ${existing.status}`}</p>
        <h1 className="mt-2 text-2xl font-bold sm:text-3xl">{a.title || (isNew ? 'Nouvel article' : 'Article sans titre')}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{words} mots · {Math.max(1, Math.round(words / 200))} min de lecture · {a.blocks.length} sections · {a.faq.length} questions FAQ</p></div>
      <div className="flex flex-wrap gap-2"><Button variant="outline" onClick={() => setPreview(!preview)}><Eye size={16} />{preview ? 'Éditer' : 'Aperçu'}</Button><Button variant="outline" onClick={() => submit('Brouillon')}><Save size={16} />Brouillon</Button><Button onClick={() => submit('Publié')}><Check size={16} />{isNew || existing.status !== 'Publié' ? 'Publier' : 'Mettre à jour'}</Button></div>
    </div>
    {error && <p role="alert" className="mb-4 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>}

    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
      <div className="min-w-0 space-y-6">
        {preview ? <article className="rounded-lg border border-border bg-card p-6 sm:p-10">
          <p className="text-xs font-bold uppercase text-primary">{a.type} · {a.service}</p><h1 className="mt-3 text-3xl font-bold">{a.title || 'Titre de l’article'}</h1>
          <p className="mt-2 text-xs text-muted-foreground">Par {a.author} · {a.date}</p><p className="mt-6 border-l-4 border-accent pl-4 text-base font-medium">{a.summary}</p>
          {a.blocks.map(b => <section key={b.id} className="mt-8"><h2 className="text-xl font-bold">{b.heading}</h2><p className="mt-3 whitespace-pre-line text-sm leading-7 text-muted-foreground">{b.body}</p></section>)}
          {a.faq.length > 0 && <section className="mt-10"><h2 className="text-xl font-bold">Questions fréquentes</h2>{a.faq.map(f => <details key={f.id} className="mt-3 rounded-md border border-border p-3"><summary className="cursor-pointer text-sm font-semibold">{f.q}</summary><p className="mt-2 text-sm text-muted-foreground">{f.a}</p></details>)}</section>}
          <div className="mt-10 rounded-lg bg-primary p-6 text-primary-foreground"><p className="font-bold">Un projet de rénovation en {a.city} ?</p><span className="mt-3 inline-block rounded bg-accent px-4 py-2 text-sm font-bold text-accent-foreground">{a.cta}</span></div>
        </article> : <>
          <section className="rounded-lg border border-border bg-card p-5">
            <h2 className="mb-4 text-base font-bold">Sujet & ciblage</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2"><label htmlFor="ar-title" className={lbl}>Titre (H1)</label><Input id="ar-title" value={a.title} onChange={e => { set('title', e.target.value); setError(''); }} placeholder="Ex. Isolation des combles : prix et aides 2026" className="h-11 text-base font-semibold" /></div>
              <div><label htmlFor="ar-kw" className={lbl}>Mot-clé principal</label><Input id="ar-kw" value={a.keyword} onChange={e => set('keyword', e.target.value)} placeholder="isolation des combles" /></div>
              <div><label htmlFor="ar-city" className={lbl}>Zone ciblée</label><select id="ar-city" value={a.city} onChange={e => set('city', e.target.value)} className={sel}>{cities.map(c => <option key={c}>{c}</option>)}</select></div>
              <div><label htmlFor="ar-type" className={lbl}>Catégorie</label><select id="ar-type" value={a.type} onChange={e => set('type', e.target.value)} className={sel}>{Object.keys(templates).map(c => <option key={c}>{c}</option>)}</select></div>
              <div><label htmlFor="ar-svc" className={lbl}>Service associé</label><select id="ar-svc" value={a.service} onChange={e => set('service', e.target.value)} className={sel}>{services.map(c => <option key={c}>{c}</option>)}</select></div>
            </div>
          </section>

          <section className="rounded-lg border border-border bg-card p-5">
            <h2 className="text-base font-bold">Introduction — réponse directe</h2>
            <p className="mb-3 mt-1 text-xs text-muted-foreground">2 à 3 phrases qui répondent immédiatement à la question. C’est ce passage que reprennent Google et les moteurs IA.</p>
            <Textarea value={a.summary} onChange={e => set('summary', e.target.value)} className="min-h-24" aria-label="Introduction" />
          </section>

          <section className="rounded-lg border border-border bg-card p-5">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2"><h2 className="text-base font-bold">Plan & contenu</h2><div className="flex gap-2"><Button type="button" size="sm" variant="outline" onClick={applyTemplate}><FileText size={14} />Plan type « {a.type} »</Button><Button type="button" size="sm" variant="outline" onClick={() => set('blocks', [...a.blocks, { id: uid(), heading: '', body: '' }])}><Plus size={14} />Section</Button></div></div>
            <div className="space-y-4">{a.blocks.map((b, i) => <div key={b.id} className="rounded-md border border-border p-4">
              <div className="mb-2 flex items-center gap-2"><span className="rounded bg-muted px-2 py-0.5 text-[10px] font-bold">H2</span><Input value={b.heading} onChange={e => updBlock(b.id, { heading: e.target.value })} placeholder="Intertitre (idéalement une question)" aria-label={`Intertitre ${i + 1}`} className="font-semibold" />
                <Button type="button" size="icon" variant="ghost" aria-label="Monter" onClick={() => move(i, -1)}><ArrowUp size={14} /></Button><Button type="button" size="icon" variant="ghost" aria-label="Descendre" onClick={() => move(i, 1)}><ArrowDown size={14} /></Button><Button type="button" size="icon" variant="ghost" aria-label="Supprimer la section" onClick={() => set('blocks', a.blocks.filter(x => x.id !== b.id))}><Trash2 size={14} /></Button></div>
              <Textarea value={b.body} onChange={e => updBlock(b.id, { body: e.target.value })} placeholder="Rédigez le paragraphe…" className="min-h-28" aria-label={`Contenu ${i + 1}`} />
            </div>)}</div>
          </section>

          <section className="rounded-lg border border-border bg-card p-5">
            <div className="mb-4 flex items-center justify-between"><h2 className="text-base font-bold">FAQ</h2><Button type="button" size="sm" variant="outline" onClick={() => set('faq', [...a.faq, { id: uid(), q: '', a: '' }])}><Plus size={14} />Question</Button></div>
            {a.faq.length === 0 && <p className="text-sm text-muted-foreground">Ajoutez des questions réelles de vos clients : elles sont reprises dans les résultats enrichis et les réponses IA.</p>}
            <div className="space-y-3">{a.faq.map(f => <div key={f.id} className="grid gap-2 rounded-md border border-border p-3">
              <div className="flex gap-2"><Input value={f.q} onChange={e => set('faq', a.faq.map(x => x.id === f.id ? { ...x, q: e.target.value } : x))} placeholder="Question" aria-label="Question" /><Button type="button" size="icon" variant="ghost" aria-label="Supprimer la question" onClick={() => set('faq', a.faq.filter(x => x.id !== f.id))}><Trash2 size={14} /></Button></div>
              <Textarea value={f.a} onChange={e => set('faq', a.faq.map(x => x.id === f.id ? { ...x, a: e.target.value } : x))} placeholder="Réponse courte et précise" aria-label="Réponse" className="min-h-16" />
            </div>)}</div>
          </section>

          <section className="rounded-lg border border-border bg-card p-5">
            <h2 className="mb-4 text-base font-bold">Crédibilité & conversion</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div><label htmlFor="ar-author" className={lbl}>Auteur</label><select id="ar-author" value={a.author} onChange={e => set('author', e.target.value)} className={sel}>{['Émilie Bernard', 'Foued Benali', 'Laurent Moreau', 'Alexandre Martin'].map(c => <option key={c}>{c}</option>)}</select></div>
              <div><label htmlFor="ar-cta" className={lbl}>Appel à l’action</label><select id="ar-cta" value={a.cta} onChange={e => set('cta', e.target.value)} className={sel}>{['Demander un diagnostic gratuit', 'Simuler mes aides', 'Être rappelé par un conseiller', 'Voir nos réalisations'].map(c => <option key={c}>{c}</option>)}</select></div>
              <div className="sm:col-span-2"><label htmlFor="ar-src" className={lbl}>Sources (une par ligne)</label><Textarea id="ar-src" value={a.sources} onChange={e => set('sources', e.target.value)} placeholder="ANAH — Guide des aides 2026" className="min-h-16" /></div>
            </div>
          </section>
        </>}
      </div>

      <aside className="space-y-4 lg:sticky lg:top-4 lg:self-start">
        <div className="flex gap-3"><Gauge v={seoScore} label="Score SEO" /><Gauge v={geoScore} label="Score GEO" /></div>
        <div className="rounded-lg border border-border bg-card">
          <div className="grid grid-cols-3 border-b border-border text-xs font-semibold">{(['seo', 'geo', 'google'] as const).map(t => <button key={t} type="button" onClick={() => setTab(t)} className={`py-2.5 ${tab === t ? 'border-b-2 border-primary text-primary' : 'text-muted-foreground'}`}>{t === 'seo' ? 'SEO' : t === 'geo' ? 'GEO / IA' : 'Google'}</button>)}</div>
          <div className="p-4">
            {tab !== 'google' ? <ul className="space-y-2">{(tab === 'seo' ? seoChecks : geoChecks).map(c => <li key={c.label} className="flex items-start gap-2 text-xs">{c.ok ? <CircleCheck size={15} className="mt-px shrink-0 text-primary" /> : <CircleAlert size={15} className="mt-px shrink-0 text-muted-foreground" />}<span className={c.ok ? '' : 'text-muted-foreground'}>{c.label}</span></li>)}</ul>
              : <div className="space-y-3">
                <div className="rounded-md border border-border p-3"><p className="text-[11px] text-muted-foreground">oeko.fr › blog › {a.slug || 'url-article'}</p><p className="mt-1 line-clamp-1 text-sm font-semibold text-primary">{seoTitle || 'Titre SEO'}</p><p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{a.metaDescription || 'La meta description apparaîtra ici.'}</p></div>
                <div><label htmlFor="ar-seo" className={lbl}>Titre SEO <span className="font-normal text-muted-foreground">{seoTitle.length}/60</span></label><Input id="ar-seo" value={a.seoTitle} onChange={e => set('seoTitle', e.target.value)} placeholder={a.title} /></div>
                <div><label htmlFor="ar-meta" className={lbl}>Meta description <span className="font-normal text-muted-foreground">{a.metaDescription.length}/160</span></label><Textarea id="ar-meta" value={a.metaDescription} onChange={e => set('metaDescription', e.target.value)} className="min-h-20" /></div>
                <div><label htmlFor="ar-slug" className={lbl}>URL</label><Input id="ar-slug" value={a.slug} onChange={e => { setSlugTouched(true); set('slug', slugify(e.target.value)); }} />{duplicate && <p className="mt-1 text-xs text-destructive">Déjà utilisée par « {duplicate.title} »</p>}</div>
              </div>}
          </div>
        </div>
        <div className="rounded-lg border border-border bg-card p-4 text-xs"><p className="mb-2 font-bold">Publication</p><div className="space-y-1.5 text-muted-foreground"><p>Statut : <span className="font-semibold text-foreground">{isNew ? 'Nouveau' : existing.status}</span></p><p>Dernière mise à jour : {a.date}</p><p>Données structurées : Article{a.faq.length ? ' + FAQPage' : ''}</p></div></div>
      </aside>
    </div>
  </div>;
}
