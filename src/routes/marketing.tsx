import { createFileRoute } from '@tanstack/react-router';
import { OekoWorkspace } from '@/components/oeko-workspace';
export const Route = createFileRoute('/marketing')({
 head: () => ({ meta: [{title:'Marketing — OEKO CRM'},{name:'description',content:'Espace marketing du backoffice OEKO pour la rénovation énergétique.'},{property:'og:title',content:'Marketing — OEKO CRM'},{property:'og:description',content:'Découvrez l’espace marketing du CRM OEKO.'},{property:'og:type',content:'website'},{name:'twitter:card',content:'summary_large_image'}] }),
 component: () => <OekoWorkspace view="marketing" />,
});
