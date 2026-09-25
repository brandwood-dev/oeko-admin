import { createFileRoute } from '@tanstack/react-router';
import { OekoWorkspace } from '@/components/oeko-workspace';
export const Route = createFileRoute('/devis')({
 head: () => ({ meta: [{title:'Devis & ventes — OEKO CRM'},{name:'description',content:'Espace devis & ventes du backoffice OEKO pour la rénovation énergétique.'},{property:'og:title',content:'Devis & ventes — OEKO CRM'},{property:'og:description',content:'Découvrez l’espace devis & ventes du CRM OEKO.'},{property:'og:type',content:'website'},{name:'twitter:card',content:'summary_large_image'}] }),
 component: () => <OekoWorkspace view="devis" />,
});
