import { createFileRoute } from '@tanstack/react-router';
import { OekoWorkspace } from '@/components/oeko-workspace';
export const Route = createFileRoute('/services')({
 head: () => ({ meta: [{title:'Services — OEKO CRM'},{name:'description',content:'Espace services du backoffice OEKO pour la rénovation énergétique.'},{property:'og:title',content:'Services — OEKO CRM'},{property:'og:description',content:'Découvrez l’espace services du CRM OEKO.'},{property:'og:type',content:'website'},{name:'twitter:card',content:'summary_large_image'}] }),
 component: () => <OekoWorkspace view="services" />,
});
