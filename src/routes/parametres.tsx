import { createFileRoute } from '@tanstack/react-router';
import { OekoWorkspace } from '@/components/oeko-workspace';
export const Route = createFileRoute('/parametres')({
 head: () => ({ meta: [{title:'Paramètres — OEKO CRM'},{name:'description',content:'Espace paramètres du backoffice OEKO pour la rénovation énergétique.'},{property:'og:title',content:'Paramètres — OEKO CRM'},{property:'og:description',content:'Découvrez l’espace paramètres du CRM OEKO.'},{property:'og:type',content:'website'},{name:'twitter:card',content:'summary_large_image'}] }),
 component: () => <OekoWorkspace view="parametres" />,
});
