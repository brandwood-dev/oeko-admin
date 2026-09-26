import { createFileRoute } from '@tanstack/react-router';
import { OekoWorkspace } from '@/components/oeko-workspace';

export const Route = createFileRoute('/seo')({
  head: () => ({
    meta: [
      { title: 'SEO & Acquisition — Backoffice OEKO' },
      { name: 'description', content: 'Suivez les KPI Google Analytics et Search Console d’OEKO : trafic, mots-clés, opportunités SEO et impact commercial par canal.' },
      { property: 'og:title', content: 'SEO & Acquisition — Backoffice OEKO' },
      { property: 'og:description', content: 'Trafic, mots-clés, opportunités SEO et acquisition par canal pour la rénovation énergétique OEKO.' },
      { property: 'og:type', content: 'website' },
      { name: 'twitter:card', content: 'summary_large_image' },
    ],
  }),
  component: () => <OekoWorkspace view="seo" />,
});
