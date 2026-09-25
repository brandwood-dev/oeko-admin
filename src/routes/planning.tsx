import { createFileRoute } from '@tanstack/react-router';
import { OekoWorkspace } from '@/components/oeko-workspace';
export const Route = createFileRoute('/planning')({
 head: () => ({ meta: [{title:'Planning — OEKO CRM'},{name:'description',content:'Espace planning du backoffice OEKO pour la rénovation énergétique.'},{property:'og:title',content:'Planning — OEKO CRM'},{property:'og:description',content:'Découvrez l’espace planning du CRM OEKO.'},{property:'og:type',content:'website'},{name:'twitter:card',content:'summary_large_image'}] }),
 component: () => <OekoWorkspace view="planning" />,
});
