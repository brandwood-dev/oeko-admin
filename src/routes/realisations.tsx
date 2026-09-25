import { createFileRoute } from '@tanstack/react-router';
import { OekoWorkspace } from '@/components/oeko-workspace';
export const Route = createFileRoute('/realisations')({
 head: () => ({ meta: [{title:'Réalisations — OEKO CRM'},{name:'description',content:'Espace réalisations du backoffice OEKO pour la rénovation énergétique.'},{property:'og:title',content:'Réalisations — OEKO CRM'},{property:'og:description',content:'Découvrez l’espace réalisations du CRM OEKO.'},{property:'og:type',content:'website'},{name:'twitter:card',content:'summary_large_image'}] }),
 component: () => <OekoWorkspace view="realisations" />,
});
