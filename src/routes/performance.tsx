import { createFileRoute } from '@tanstack/react-router';
import { OekoWorkspace } from '@/components/oeko-workspace';
export const Route = createFileRoute('/performance')({
 head: () => ({ meta: [{title:'Performance commerciale — OEKO CRM'},{name:'description',content:'Espace performance commerciale du backoffice OEKO pour la rénovation énergétique.'},{property:'og:title',content:'Performance commerciale — OEKO CRM'},{property:'og:description',content:'Découvrez l’espace performance commerciale du CRM OEKO.'},{property:'og:type',content:'website'},{name:'twitter:card',content:'summary_large_image'}] }),
 component: () => <OekoWorkspace view="performance" />,
});
