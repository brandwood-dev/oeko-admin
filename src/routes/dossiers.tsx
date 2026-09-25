import { createFileRoute } from '@tanstack/react-router';
import { OekoWorkspace } from '@/components/oeko-workspace';
export const Route = createFileRoute('/dossiers')({
 head: () => ({ meta: [{title:'Dossiers CRM — OEKO CRM'},{name:'description',content:'Espace dossiers crm du backoffice OEKO pour la rénovation énergétique.'},{property:'og:title',content:'Dossiers CRM — OEKO CRM'},{property:'og:description',content:'Découvrez l’espace dossiers crm du CRM OEKO.'},{property:'og:type',content:'website'},{name:'twitter:card',content:'summary_large_image'}] }),
 component: () => <OekoWorkspace view="dossiers" />,
});
