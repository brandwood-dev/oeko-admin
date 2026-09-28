export type ArticleBlock = { id: string; heading: string; body: string };
export type ArticleFaq = { id: string; q: string; a: string };
export type Article = {
  id: string; title: string; slug: string; type: string; service: string; city: string; keyword: string;
  summary: string; blocks: ArticleBlock[]; faq: ArticleFaq[]; cta: string; author: string; date: string;
  status: string; seoTitle: string; metaDescription: string; sources: string;
};

export const slugify = (s: string) => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

const mk = (id: string, title: string, type: string, service: string, keyword: string, date: string, status: string, author: string, city = 'Île-de-France'): Article => ({
  id, title, slug: slugify(title), type, service, city, keyword, date, status, author,
  summary: `${title.replace(/ \?$/, '')} : OEKO, artisan RGE en ${city}, résume l’essentiel en 2026 — coûts, aides mobilisables et étapes du projet.`,
  blocks: [
    { id: `${id}-1`, heading: `Pourquoi s’intéresser à ${keyword} ?`, body: `Un logement mal isolé perd jusqu’à 30 % de sa chaleur. En ${city}, ${keyword} fait partie des travaux les plus rentables.` },
    { id: `${id}-2`, heading: 'Quelles aides en 2026 ?', body: 'MaPrimeRénov’, CEE et éco-PTZ peuvent se cumuler selon vos revenus et le type de logement.' },
  ],
  faq: [
    { id: `${id}-f1`, q: `Combien coûte ${keyword} ?`, a: 'Comptez en moyenne entre 120 et 180 € / m² selon la technique retenue.' },
    { id: `${id}-f2`, q: 'Faut-il un artisan RGE ?', a: 'Oui, la certification RGE conditionne l’accès aux aides de l’État.' },
  ],
  cta: 'Demander un diagnostic gratuit', seoTitle: `${title} | OEKO`, metaDescription: `${title} Découvrez les coûts, aides 2026 et conseils d’OEKO, artisan RGE en ${city}.`,
  sources: 'ANAH — Guide des aides 2026\nADEME — Chiffres clés du bâtiment',
});

export const articleSeed: Article[] = [
  mk('A-1', 'Isolation extérieure : quelles aides en 2026 ?', 'Guide', 'ITE', 'isolation extérieure', '22 sept. 2026', 'Publié', 'Émilie Bernard'),
  mk('A-2', 'Pompe à chaleur ou chaudière : comment choisir ?', 'Conseils', 'PAC', 'pompe à chaleur', '18 sept. 2026', 'Publié', 'Émilie Bernard'),
  mk('A-3', 'Rénover sa toiture avant l’hiver', 'Actualités', 'Toiture', 'rénovation toiture', '14 sept. 2026', 'Brouillon', 'Foued Benali', 'Seine-et-Marne'),
  mk('A-4', 'Comprendre le DPE de votre maison', 'Guide', 'Façade', 'DPE maison', '10 sept. 2026', 'Publié', 'Émilie Bernard'),
];
