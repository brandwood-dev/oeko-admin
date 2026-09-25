import { createFileRoute } from '@tanstack/react-router';
import { OekoWorkspace } from '@/components/oeko-workspace';
export const Route = createFileRoute('/')({
 head: () => ({ meta: [{title:'Tableau de bord — OEKO CRM'},{name:'description',content:'Aperçu du tableau de bord OEKO pour le suivi des leads, rendez-vous et ventes.'},{property:'og:title',content:'Tableau de bord — OEKO CRM'},{property:'og:description',content:'Suivez les leads, rendez-vous et ventes dans le backoffice OEKO.'},{property:'og:type',content:'website'},{name:'twitter:card',content:'summary_large_image'}] }),
 component: () => <OekoWorkspace view="dashboard" />,
});
