import { createFileRoute } from '@tanstack/react-router';
import { OekoWorkspace } from '@/components/oeko-workspace';
import type { View } from '@/lib/oeko-data';

const valid: View[] = ['dossiers','qualification','articles','services','realisations','planning','devis'];
export const Route = createFileRoute('/$section/$item')({
  head: ({ params }) => {
    const title = `${params.item === 'nouveau' ? 'Nouveau' : 'Gestion'} ${params.section} — OEKO CRM`;
    const description = `Espace de gestion ${params.section} du backoffice OEKO.`;
    return { meta: [{ title }, { name:'description',content:description }, { property:'og:title',content:title }, { property:'og:description',content:description }, { property:'og:type',content:'website' }, { name:'twitter:card',content:'summary_large_image' }] };
  },
  component: () => {
    const { section, item } = Route.useParams();
    return <OekoWorkspace view={valid.find(v=>v===section) ?? 'dashboard'} subpage={{ section, item }} />;
  },
});
