import { departmentShapes } from '@/lib/france-departments';

export type MetricKey = 'leads' | 'qualifies' | 'devis' | 'ventes' | 'ca';
export const metricLabels: Record<MetricKey, string> = {
  leads: 'Leads',
  qualifies: 'Projets qualifiés',
  devis: 'Devis',
  ventes: 'Ventes',
  ca: 'Chiffre d’affaires',
};
export const geoPeriods = ['30 derniers jours', '90 derniers jours', 'Année 2026'] as const;
export const geoServices = ['Tous les services', 'Toiture', 'Façade', 'ITE', 'PAC', 'Climatisation', 'Menuiseries'] as const;
export type GeoPeriod = (typeof geoPeriods)[number];
export type GeoService = (typeof geoServices)[number];

export type DepartmentStats = {
  code: string;
  nom: string;
  d: string;
  cx: number;
  cy: number;
  leads: number;
  qualifies: number;
  devis: number;
  ventes: number;
  ca: number;
  services: Record<string, number>;
};

/** Volume de base par département (démonstration OEKO, forte densité en Île-de-France). */
const baseLeads: Record<string, number> = {
  '77': 118, '78': 132, '91': 104, '92': 146, '93': 158, '94': 171, '95': 112, '75': 86,
  '60': 41, '27': 24, '28': 26, '45': 22, '89': 14, '10': 11, '51': 12, '02': 16, '80': 13,
  '76': 21, '59': 18, '62': 12, '14': 15, '61': 9, '72': 12, '41': 10, '37': 11, '18': 8,
  '58': 6, '21': 10, '71': 8, '69': 16, '38': 12, '13': 14, '33': 15, '31': 13, '44': 14,
  '35': 11, '06': 10, '34': 9, '67': 9, '68': 7, '54': 7, '57': 8, '25': 6, '63': 7,
  '86': 6, '87': 5, '16': 5, '17': 8, '49': 9, '53': 5, '56': 6, '29': 7, '22': 5,
  '85': 6, '79': 4, '36': 4, '03': 4, '42': 6, '43': 3, '07': 3, '26': 5, '30': 6,
  '84': 5, '83': 8, '04': 2, '05': 2, '73': 4, '74': 7, '01': 6, '39': 3, '70': 2,
  '90': 2, '88': 3, '52': 2, '55': 2, '08': 3, '23': 2, '19': 3, '15': 2, '46': 2,
  '12': 3, '48': 1, '81': 4, '82': 3, '32': 2, '40': 4, '47': 3, '24': 4, '64': 6,
  '65': 2, '09': 2, '11': 4, '66': 5, '2A': 2, '2B': 2, '09b': 0,
};

const periodFactor: Record<GeoPeriod, number> = {
  '30 derniers jours': 1,
  '90 derniers jours': 2.6,
  'Année 2026': 7.4,
};

const serviceMix: Record<Exclude<GeoService, 'Tous les services'>, number> = {
  Toiture: 0.22,
  Façade: 0.24,
  ITE: 0.19,
  PAC: 0.17,
  Climatisation: 0.09,
  Menuiseries: 0.09,
};

const averageTicket = 13400;

export function departmentStats(period: GeoPeriod, service: GeoService): DepartmentStats[] {
  const pf = periodFactor[period];
  const sf = service === 'Tous les services' ? 1 : serviceMix[service];
  return departmentShapes.map((shape) => {
    const base = (baseLeads[shape.code] ?? 2) * pf * sf;
    const leads = Math.round(base);
    const qualifies = Math.round(leads * 0.66);
    const devis = Math.round(leads * 0.42);
    const ventes = Math.round(leads * 0.15);
    const ca = ventes * averageTicket;
    const services = Object.fromEntries(
      (Object.keys(serviceMix) as (keyof typeof serviceMix)[]).map((key) => [key, Math.round(leads * (service === 'Tous les services' ? serviceMix[key] : key === service ? 1 : 0))]),
    );
    return { ...shape, leads, qualifies, devis, ventes, ca, services };
  });
}

export const metricValue = (stat: DepartmentStats, metric: MetricKey) => stat[metric];

export const formatNumber = (value: number) => value.toLocaleString('fr-FR');
export const formatEuro = (value: number) => `${Math.round(value).toLocaleString('fr-FR')} €`;
export const formatMetric = (value: number, metric: MetricKey) => (metric === 'ca' ? formatEuro(value) : formatNumber(value));
