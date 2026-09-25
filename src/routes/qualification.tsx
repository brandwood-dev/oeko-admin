import { createFileRoute } from '@tanstack/react-router';
import { OekoWorkspace } from '@/components/oeko-workspace';
export const Route = createFileRoute('/qualification')({
 head: () => ({ meta: [{title:'Qualification — OEKO CRM'},{name:'description',content:'Espace qualification du backoffice OEKO pour la rénovation énergétique.'},{property:'og:title',content:'Qualification — OEKO CRM'},{property:'og:description',content:'Découvrez l’espace qualification du CRM OEKO.'},{property:'og:type',content:'website'},{name:'twitter:card',content:'summary_large_image'}] }),
 component: () => <OekoWorkspace view="qualification" />,
});
