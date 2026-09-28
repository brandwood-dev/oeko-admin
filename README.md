# Oeko admin

Crée un preview UI/UX complet d’un backoffice admin / CRM sur mesure pour OEKO, entreprise française de rénovation énergétique.
Objectif
Créer un prototype front-end moderne, minimaliste, professionnel et interactif, en mobile first, avec un excellent rendu desktop.
Style visuel
Identité OEKO :
- Noir + blanc
- Accent principal : #352C5B
- Accent secondaire : #C0FF72
Style recherché :
- dashboard SaaS premium
- propre, lisible, épuré
- moderne, fluide, responsive
- cartes KPI élégantes
- tableaux clairs
- formulaires bien structurés
- navigation simple
- UX mobile first
Contexte fonctionnel
Il s’agit d’une solution simple pour une seule société (OEKO).
Ne pas créer de logique multi-agence, multi-tenant ou ERP complexe.
Prévoir 3 rôles :
- Administrateur
- Qualification / Marketing
- Commercial
Écrans à créer
1. Connexion
- logo OEKO
- email
- mot de passe
- bouton “Se connecter”
2. Dashboard principal
Cartes KPI :
- Nouveaux leads
- Leads à qualifier
- Prospects à rappeler
- Rendez-vous du jour
- Devis à relancer
- Ventes du mois
- CA signé
- Dossiers sans prochaine action
Ajouter :
- graphique leads
- graphique ventes
- tableau “Mes actions du jour”
- tableau “Derniers leads”
3. Articles / Blog
Liste des articles
- tableau
- recherche
- filtres
- statuts
- bouton “Ajouter un article”
Formulaire article
Champs :
- titre
- slug
- titre SEO
- meta description
- résumé
- image principale
- catégorie
- contenu
- FAQ
- CTA
- auteur
- date
- statut
Boutons :
- brouillon
- prévisualiser
- publier
4. Services
Liste des services
- façade
- toiture
- ITE
- PAC
- climatisation
- menuiseries
Formulaire service
- nom
- titre
- introduction
- bénéfices
- contenu
- FAQ
- CTA
- SEO title
- meta description
- slug
- réalisations associées
- statut
5. Réalisations / Chantiers
Liste
- image
- titre
- ville
- département
- service
- date
- statut
Formulaire
- titre
- ville
- département
- service
- type de logement
- problématique
- travaux réalisés
- résultat
- description
- photos avant / pendant / après
- date
- témoignage
- SEO title
- meta description
6. Médiathèque
- grille de médias
- upload
- recherche
- filtre
- renommage
- texte alternatif
7. Leads / Qualification
Créer une page “Qualification” avec tableau :
- date
- prospect
- téléphone
- code postal
- source
- demande
- statut
Filtres :
- date
- source
- service
- statut
Actions :
- Ouvrir
- Qualifier
8. Fiche prospect / dossier CRM
Créer une fiche dossier unique avec sections :
Contact
- prénom
- nom
- téléphone
- email
- adresse
Maison
- adresse
- ville
- code postal
- type de maison
Projet
- service demandé
- description
- urgence
- budget approximatif
- priorité
- potentiel
Source
- canal
- campagne
- formulaire
- UTM
Message original
Actions
- Qualifier
- À rappeler
- Nurserie
- Inexploitable
- Abandon
Affectation
- choisir le commercial
Prochaine action
- action
- date
- heure
- commentaire
Historique / timeline
- lead reçu
- qualification
- note
- appel
- RDV
- devis
- vente / perte
Notes
- bouton “Ajouter une note”
Documents
- liste de fichiers
9. Ma journée
Sections :
- Nouveaux dossiers
- À rappeler
- Rendez-vous
- Devis à faire
- Devis à relancer
- Actions en retard
10. Planning / Rendez-vous
Vue :
- jour
- semaine
- mois
Formulaire rendez-vous :
- type
- date
- heure
- durée
- adresse
- commercial
- commentaire
11. Devis
Liste
- référence
- date
- prospect
- service
- montant HT
- statut
Formulaire devis
- référence
- date
- montant HT
- montant TTC
- PDF
- service
- commentaire
- statut : À préparer / Envoyé / À relancer / Accepté / Refusé
12. Vente / perte
Vente
- date
- montant
- service
- devis concerné
- commentaire
Perte
- motif
- commentaire
Motifs :
- Trop cher
- Concurrent
- Projet abandonné
- Projet reporté
- Hors cible
- Raison technique
- Raison administrative
- Impossible à joindre
- Autre
13. Marketing
Tableau :
- Source
- Leads
- Qualifiés
- RDV
- Devis
- Ventes
- CA
Sources :
- Google Ads
- SEO
- Meta
- Email
- Appels
- Apporteurs
Ajouter un graphique des sources.
14. Performance commerciale
Tableau :
- Commercial
- Leads
- RDV
- Devis
- Ventes
- CA
- taux de qualification
- taux devis → vente
Ajouter graphiques :
- ventes par commercial
- évolution du CA
15. Paramètres
Sections :
- Utilisateurs
- Services
- Statuts
- Motifs de perte
- Sources marketing
- Modèles SMS / email
16. Intégrations / erreurs
- état des connecteurs
- erreurs d’import
- source
- date
- message
- statut
- détail
17. Journal d’activité
- utilisateur
- action
- date/heure
- objet modifié
18. Archivage
Prévoir l’action :
- Archiver le dossier
Contraintes
- mobile first
- UX claire
- design minimaliste
- données de démonstration réalistes en français
- prospects en Île-de-France
- noms comme Foued, Laurent, etc.
- ne pas inclure de multi-agence
- ne pas inclure facturation comptable, ERP chantier, portail client ou IA avancée
Résultat attendu
Je veux un prototype visuel complet, cohérent et présentable au client, montrant :
- dashboard
- CRM
- contenus
- marketing
- pilotage
- administration
Le rendu doit ressembler à un vrai produit SaaS moderne et premium.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/e4190b9b-bb87-4fc9-9dea-07c8fba89d56).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
