import { createFileRoute } from '@tanstack/react-router';
import { OekoWorkspace } from '@/components/oeko-workspace';
export const Route = createFileRoute('/integrations')({
 head: () => ({ meta: [{title:'Intégrations & erreurs — OEKO CRM'},{name:'description',content:'Espace intégrations & erreurs du backoffice OEKO pour la rénovation énergétique.'},{property:'og:title',content:'Intégrations & erreurs — OEKO CRM'},{property:'og:description',content:'Découvrez l’espace intégrations & erreurs du CRM OEKO.'},{property:'og:type',content:'website'},{name:'twitter:card',content:'summary_large_image'}] }),
 component: () => <OekoWorkspace view="integrations" />,
});
