import { createFileRoute } from '@tanstack/react-router';
import { OekoWorkspace } from '@/components/oeko-workspace';
export const Route = createFileRoute('/journal')({
 head: () => ({ meta: [{title:'Journal d’activité — OEKO CRM'},{name:'description',content:'Espace journal d’activité du backoffice OEKO pour la rénovation énergétique.'},{property:'og:title',content:'Journal d’activité — OEKO CRM'},{property:'og:description',content:'Découvrez l’espace journal d’activité du CRM OEKO.'},{property:'og:type',content:'website'},{name:'twitter:card',content:'summary_large_image'}] }),
 component: () => <OekoWorkspace view="journal" />,
});
