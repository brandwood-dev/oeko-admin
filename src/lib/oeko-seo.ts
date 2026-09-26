// Données de démonstration du module SEO & Acquisition (Google Analytics 4 + Search Console).
// Chiffres fictifs mais réalistes pour une entreprise francilienne de rénovation énergétique.

export const seoPeriods = ['7 derniers jours', '30 derniers jours', '90 derniers jours', 'Année 2026'] as const;
export type SeoPeriod = (typeof seoPeriods)[number];
export const seoServices = ['Tous les services', 'Façade', 'Toiture', 'ITE', 'PAC', 'Climatisation', 'Menuiseries'] as const;
export const seoChannels = ['Tous les canaux', 'SEO / Organic', 'Google Ads', 'Meta', 'Direct', 'Email', 'Referral', 'Apporteurs'] as const;

export const periodWeight: Record<SeoPeriod, number> = {
  '7 derniers jours': 1,
  '30 derniers jours': 4.1,
  '90 derniers jours': 11.8,
  'Année 2026': 38.5,
};

// Base = 7 derniers jours
const base = {
  visiteurs: 2140,
  sessions: 2860,
  organique: 1720,
  pagesVues: 7420,
  leads: 42,
  ventes: 6,
  ca: 78400,
  clics: 1380,
  impressions: 46200,
};

export type SeoTotals = {
  visiteurs: number; sessions: number; organique: number; pagesVues: number;
  leads: number; ventes: number; ca: number; clics: number; impressions: number;
  ctr: number; position: number;
};

export function seoTotals(period: SeoPeriod): SeoTotals {
  const w = periodWeight[period];
  const clics = Math.round(base.clics * w);
  const impressions = Math.round(base.impressions * w);
  return {
    visiteurs: Math.round(base.visiteurs * w),
    sessions: Math.round(base.sessions * w),
    organique: Math.round(base.organique * w),
    pagesVues: Math.round(base.pagesVues * w),
    leads: Math.round(base.leads * w),
    ventes: Math.round(base.ventes * w),
    ca: Math.round(base.ca * w),
    clics,
    impressions,
    ctr: (clics / impressions) * 100,
    position: period === 'Année 2026' ? 14.2 : period === '90 derniers jours' ? 12.8 : period === '30 derniers jours' ? 11.6 : 10.9,
  };
}

export type SeoPage = {
  url: string; titre: string; service: string; canal: string;
  vues: number; utilisateurs: number; engagement: string; leads: number; ventes: number; tendance: number;
};

export const seoPages: SeoPage[] = [
  { url: '/services/isolation-exterieure', titre: 'Isolation thermique par l’extérieur', service: 'ITE', canal: 'SEO / Organic', vues: 1284, utilisateurs: 962, engagement: '2 min 48 s', leads: 11, ventes: 2, tendance: 18.4 },
  { url: '/services/pompe-a-chaleur', titre: 'Installation de pompe à chaleur', service: 'PAC', canal: 'SEO / Organic', vues: 1096, utilisateurs: 848, engagement: '2 min 31 s', leads: 9, ventes: 2, tendance: 12.7 },
  { url: '/services/ravalement-facade', titre: 'Ravalement de façade', service: 'Façade', canal: 'Google Ads', vues: 874, utilisateurs: 701, engagement: '1 min 58 s', leads: 7, ventes: 1, tendance: 4.2 },
  { url: '/guides/aides-renovation-2026', titre: 'Les aides à la rénovation en 2026', service: 'Tous les services', canal: 'SEO / Organic', vues: 812, utilisateurs: 688, engagement: '3 min 24 s', leads: 5, ventes: 1, tendance: 26.1 },
  { url: '/services/renovation-toiture', titre: 'Rénovation de toiture', service: 'Toiture', canal: 'SEO / Organic', vues: 648, utilisateurs: 512, engagement: '2 min 12 s', leads: 6, ventes: 1, tendance: -7.8 },
  { url: '/realisations', titre: 'Nos chantiers en Île-de-France', service: 'Tous les services', canal: 'Direct', vues: 596, utilisateurs: 431, engagement: '1 min 44 s', leads: 3, ventes: 0, tendance: 9.3 },
  { url: '/services/menuiseries', titre: 'Remplacement de menuiseries', service: 'Menuiseries', canal: 'Meta', vues: 482, utilisateurs: 394, engagement: '1 min 37 s', leads: 4, ventes: 1, tendance: -12.5 },
  { url: '/services/climatisation', titre: 'Climatisation réversible', service: 'Climatisation', canal: 'Google Ads', vues: 418, utilisateurs: 341, engagement: '1 min 29 s', leads: 3, ventes: 0, tendance: -3.1 },
  { url: '/contact', titre: 'Demander un devis gratuit', service: 'Tous les services', canal: 'Direct', vues: 388, utilisateurs: 312, engagement: '1 min 06 s', leads: 14, ventes: 3, tendance: 15.2 },
  { url: '/guides/prix-isolation-exterieure', titre: 'Prix d’une isolation extérieure', service: 'ITE', canal: 'SEO / Organic', vues: 356, utilisateurs: 298, engagement: '2 min 54 s', leads: 4, ventes: 1, tendance: 31.6 },
];

export type SeoKeyword = {
  mot: string; position: number; clics: number; impressions: number; ctr: number; evolution: number; service: string; page: string;
};

export const seoKeywords: SeoKeyword[] = [
  { mot: 'isolation extérieure prix m2', position: 4.2, clics: 186, impressions: 7420, ctr: 2.5, evolution: 1.8, service: 'ITE', page: '/guides/prix-isolation-exterieure' },
  { mot: 'entreprise isolation extérieure 94', position: 3.1, clics: 164, impressions: 3280, ctr: 5.0, evolution: 2.4, service: 'ITE', page: '/services/isolation-exterieure' },
  { mot: 'installateur pompe à chaleur 78', position: 5.6, clics: 142, impressions: 4890, ctr: 2.9, evolution: 0.9, service: 'PAC', page: '/services/pompe-a-chaleur' },
  { mot: 'aide rénovation énergétique 2026', position: 7.8, clics: 128, impressions: 12640, ctr: 1.0, evolution: 3.2, service: 'Tous les services', page: '/guides/aides-renovation-2026' },
  { mot: 'ravalement façade île de france prix', position: 6.4, clics: 112, impressions: 5960, ctr: 1.9, evolution: -0.4, service: 'Façade', page: '/services/ravalement-facade' },
  { mot: 'rénovation toiture créteil', position: 8.9, clics: 86, impressions: 3140, ctr: 2.7, evolution: -1.6, service: 'Toiture', page: '/services/renovation-toiture' },
  { mot: 'pompe à chaleur air eau avis', position: 11.2, clics: 74, impressions: 9820, ctr: 0.8, evolution: 0.1, service: 'PAC', page: '/services/pompe-a-chaleur' },
  { mot: 'changer fenêtres double vitrage 93', position: 9.7, clics: 68, impressions: 4210, ctr: 1.6, evolution: -2.1, service: 'Menuiseries', page: '/services/menuiseries' },
  { mot: 'climatisation réversible maison prix', position: 13.4, clics: 52, impressions: 8460, ctr: 0.6, evolution: 1.2, service: 'Climatisation', page: '/services/climatisation' },
  { mot: 'entreprise rénovation énergétique versailles', position: 5.2, clics: 48, impressions: 1980, ctr: 2.4, evolution: 2.9, service: 'Tous les services', page: '/realisations' },
  { mot: 'devis isolation extérieure gratuit', position: 2.4, clics: 44, impressions: 1120, ctr: 3.9, evolution: 0.0, service: 'ITE', page: '/contact' },
  { mot: 'ite sous enduit ou bardage', position: 14.6, clics: 28, impressions: 6740, ctr: 0.4, evolution: 1.4, service: 'ITE', page: '/services/isolation-exterieure' },
];

export const trendLabel = (evolution: number) => evolution > 0.5 ? 'En hausse' : evolution < -0.5 ? 'En baisse' : 'Stable';

export type AcquisitionRow = { canal: string; sessions: number; leads: number; qualifies: number; devis: number; ventes: number; ca: number };

export const acquisitionRows: AcquisitionRow[] = [
  { canal: 'SEO / Organic', sessions: 8460, leads: 96, qualifies: 68, devis: 31, ventes: 11, ca: 142800 },
  { canal: 'Google Ads', sessions: 5240, leads: 92, qualifies: 61, devis: 28, ventes: 9, ca: 118600 },
  { canal: 'Meta', sessions: 2180, leads: 38, qualifies: 22, devis: 11, ventes: 3, ca: 38200 },
  { canal: 'Direct', sessions: 1940, leads: 34, qualifies: 24, devis: 12, ventes: 4, ca: 46400 },
  { canal: 'Email', sessions: 1120, leads: 25, qualifies: 18, devis: 9, ventes: 3, ca: 32600 },
  { canal: 'Referral', sessions: 680, leads: 14, qualifies: 9, devis: 5, ventes: 2, ca: 21400 },
  { canal: 'Apporteurs', sessions: 210, leads: 10, qualifies: 8, devis: 6, ventes: 3, ca: 34800 },
];

export const trafficSeries = [
  { label: 'Sem. 1', sessions: 2180, clics: 1020, leads: 28 },
  { label: 'Sem. 2', sessions: 2410, clics: 1140, leads: 31 },
  { label: 'Sem. 3', sessions: 2260, clics: 1080, leads: 26 },
  { label: 'Sem. 4', sessions: 2640, clics: 1290, leads: 36 },
  { label: 'Sem. 5', sessions: 2880, clics: 1380, leads: 39 },
  { label: 'Sem. 6', sessions: 3120, clics: 1520, leads: 44 },
  { label: 'Sem. 7', sessions: 3040, clics: 1460, leads: 41 },
  { label: 'Sem. 8', sessions: 3380, clics: 1640, leads: 48 },
];

export const fmtNumber = (n: number) => new Intl.NumberFormat('fr-FR').format(Math.round(n));
export const fmtEuro = (n: number) => `${new Intl.NumberFormat('fr-FR').format(Math.round(n))} €`;
export const fmtPercent = (n: number, digits = 1) => `${n.toFixed(digits).replace('.', ',')} %`;
export const fmtSigned = (n: number) => `${n > 0 ? '+' : n < 0 ? '−' : ''}${Math.abs(n).toFixed(1).replace('.', ',')}`;
