import { createFileRoute } from '@tanstack/react-router';
import { OekoWorkspace } from '@/components/oeko-workspace';
export const Route = createFileRoute('/articles')({
 head: () => ({ meta: [{title:'Articles / Blog — OEKO CRM'},{name:'description',content:'Espace articles / blog du backoffice OEKO pour la rénovation énergétique.'},{property:'og:title',content:'Articles / Blog — OEKO CRM'},{property:'og:description',content:'Découvrez l’espace articles / blog du CRM OEKO.'},{property:'og:type',content:'website'},{name:'twitter:card',content:'summary_large_image'}] }),
 component: () => <OekoWorkspace view="articles" />,
});
