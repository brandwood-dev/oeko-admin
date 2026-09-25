import { createFileRoute } from '@tanstack/react-router';
import { OekoWorkspace } from '@/components/oeko-workspace';
export const Route = createFileRoute('/mediatheque')({
 head: () => ({ meta: [{title:'Médiathèque — OEKO CRM'},{name:'description',content:'Espace médiathèque du backoffice OEKO pour la rénovation énergétique.'},{property:'og:title',content:'Médiathèque — OEKO CRM'},{property:'og:description',content:'Découvrez l’espace médiathèque du CRM OEKO.'},{property:'og:type',content:'website'},{name:'twitter:card',content:'summary_large_image'}] }),
 component: () => <OekoWorkspace view="mediatheque" />,
});
