import { createFileRoute } from '@tanstack/react-router';
import { OekoWorkspace } from '@/components/oeko-workspace';
export const Route = createFileRoute('/journee')({
 head: () => ({ meta: [{title:'Ma journée — OEKO CRM'},{name:'description',content:'Espace ma journée du backoffice OEKO pour la rénovation énergétique.'},{property:'og:title',content:'Ma journée — OEKO CRM'},{property:'og:description',content:'Découvrez l’espace ma journée du CRM OEKO.'},{property:'og:type',content:'website'},{name:'twitter:card',content:'summary_large_image'}] }),
 component: () => <OekoWorkspace view="journee" />,
});
