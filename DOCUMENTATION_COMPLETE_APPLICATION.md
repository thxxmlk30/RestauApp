# Documentation Complete de l'Application Linguere

## 1. Vue d'ensemble

Linguere est une application front-end de gestion et de commande pour un restaurant.
Elle couvre deux univers:

- l'experience client: navigation sur la landing page, consultation du menu, ajout au panier, commande, suivi des commandes.
- l'experience operationnelle: dashboard interne pour les commandes, les stocks, le personnel, les zones de livraison et le pilotage global.

Le projet fonctionne sans backend.
Les donnees sont stockees localement dans le navigateur via `localStorage`.

## 2. Stack technique

- `React 19`
- `TypeScript`
- `Vite`
- `React Router`
- `Tailwind CSS`
- `Recharts`
- `Framer Motion`

## 3. Structure generale

### Pages principales

- `/`
  Landing page publique.
- `/login`
  Connexion.
- `/register`
  Inscription client.
- `/forgot-password`
  Recuperation de mot de passe.
- `/mes-commandes`
  Espace client pour suivre les commandes.
- `/dashboard`
  Dashboard interne selon le role.

### Zones du dashboard

- Apercu operationnel
- Statistiques
- Commandes
- Produits
- Stocks
- Personnel
- Carte / tracking
- Zones / dispatch
- Rapports

## 4. Roles utilisateurs

Les roles supportes sont:

- `admin`
- `chef`
- `waiter`
- `delivery`
- `customer`

### Comportement

- `customer`
  Peut commander et suivre ses commandes.
- `admin`
  A acces a tout le dashboard.
- `chef`
  Voit surtout la cuisine, les commandes et les ingredients.
- `waiter`
  Voit surtout les commandes sur place et la carte.
- `delivery`
  Voit surtout les livraisons, la carte et les zones.

## 5. Authentification

Le systeme d'authentification est local.

### Fonctionnement

- les membres du staff utilisent les donnees mockees du projet.
- les clients creent leur compte dans le navigateur.
- la session active est stockee dans `localStorage`.

### Limite importante

Ce mecanisme est une demo front-end.
Il n'est pas securise pour un usage production.

## 6. Menu et parcours client

### Landing page

La landing page contient:

- un hero
- une presentation du menu
- des sections informatives
- un acces rapide au panier

### Menu

Le menu est filtre par moments:

- petit-dejeuner
- dejeuner
- diner

Chaque carte produit affiche:

- visuel
- nom
- description
- prix
- temps de preparation
- controle d'ajout/retrait

### Ajustement UI effectue

Les cartes menu ont ete rendues:

- plus etroites
- plus hautes
- plus regulieres verticalement

L'objectif est d'ameliorer la lecture en grille et de donner plus d'importance visuelle au contenu produit.

## 7. Panier et commande

Le tunnel de commande se fait dans un drawer lateral.

### Etapes

1. Verification du panier
2. Choix du mode de service
3. Confirmation

### Modes de service

- `Sur place`
  Le client saisit seulement un numero de table.
- `Livraison`
  Le client choisit:
  - departement
  - commune
  - secteur
  - adresse detaillee
  - point de repere
  - telephone
  - note pour le livreur

### Simplifications recentes

- suppression complete du code promo
- recap plus lisible
- moins de contenu inutile
- choix d'adresse plus simple
- carte de livraison utilisee comme apercu, plus comme systeme principal de choix

## 8. Attribution automatique des livreurs

Quand une commande de livraison est creee, le systeme choisit automatiquement un livreur actif.

### Regle d'affectation

Le systeme priorise:

1. le livreur actif qui a fait le moins de courses dans la journee
2. en cas d'egalite, le livreur ayant la plus faible charge active
3. en dernier recours, le tri se fait sur le nom

### Fichier concerne

- `src/utils/helpers.ts`

## 9. Suivi des commandes client

La page `Mes commandes` permet au client de:

- voir sa commande en cours
- suivre une livraison
- revoir l'historique
- recommander rapidement
- noter une commande livree

### Nouveau suivi simplifie

Le suivi met maintenant l'accent sur:

- le statut
- l'ETA
- le nom du livreur
- la destination
- les etapes de progression

La carte n'est plus le centre du parcours.
Elle est conservee comme aide visuelle uniquement quand cela apporte une vraie valeur.

## 10. Dashboard commandes

Le dashboard permet:

- de consulter les commandes
- de changer les statuts
- de supprimer une commande
- d'assigner chefs et livreurs

Sur mobile, la table passe en cartes afin de rester lisible.

## 11. Gestion des stocks

Le module stock couvre:

- le suivi des ingredients
- les seuils de reapprovisionnement
- le seuil minimum
- le seuil critique
- la cloture de journee
- le lancement d'un bot de commande fournisseur

### Champs d'un ingredient

Chaque ingredient contient:

- nom
- stock actuel
- unite
- stock minimum
- seuil de reappro
- seuil critique
- fournisseur
- cout unitaire
- date de dernier reassort
- date de dernier comptage

### Niveaux d'alerte

- `OK`
  Le stock est confortable.
- `Reappro`
  Le stock est sous le seuil de reappro.
- `Sous minimum`
  Le stock est sous le minimum.
- `Critique`
  Le stock a atteint la limite critique.

## 12. Cloture de journee stock

La cloture de journee permet de saisir le restant reel de chaque ingredient.

### Flux

1. Le responsable ouvre la page stock.
2. Il saisit le restant de chaque ingredient.
3. Il valide la cloture.
4. Le systeme met a jour les stocks reels.
5. Un audit est enregistre.
6. Si un ou plusieurs produits sont critiques, le bot est declenche instantanement.

### Audit enregistre

Chaque cloture garde:

- un identifiant
- une date
- le canal du bot utilise
- le nombre total de lignes
- le nombre de produits critiques
- les niveaux avant/apres comptage

## 13. Bot d'approvisionnement

Le bot d'approvisionnement est un mecanisme front-end de lancement rapide.

### Canaux supportes

- email
- WhatsApp

### Fonctionnement

Le systeme construit automatiquement un message contenant:

- la date
- la liste des produits critiques
- le restant observe
- le seuil critique
- une quantite suggeree
- le fournisseur associe

Puis il ouvre:

- un `mailto:` pour l'email
- un lien `wa.me` pour WhatsApp

### Important

Ce n'est pas un bot serveur reel.
Le systeme prepare et lance le message vers un contact bot configure dans l'application.

### Parametres configurables

Dans l'ecran stock, on peut definir:

- l'email du bot
- le numero WhatsApp du bot
- le canal prefere

## 14. Gestion du personnel

Le dashboard personnel permet:

- d'ajouter ou modifier un membre
- de suivre son role
- de gerer son statut
- d'exploiter ses informations dans les affectations

## 15. Zones et logistique de livraison

Les zones de livraison Dakar sont predefinies.

Chaque zone fournit:

- departement
- commune
- secteur
- frais de livraison
- temps estime
- coordonnees
- points de repere

Ces donnees servent a:

- la saisie de l'adresse
- le calcul des frais
- l'estimation d'ETA
- le tracking simplifie

## 16. Persistance locale

Les donnees sont stockees dans `localStorage`.

### Cles principales

- `restauapp.menuItems.v2`
- `restauapp.orders.v3`
- `restauapp.ingredients.v2`
- `restauapp.staff.v2`
- `restauapp.favorites.v1`
- `restauapp.stockAudits.v1`
- `restauapp.stockBotSettings.v1`
- cles d'auth et de session dans le contexte auth

## 17. Donnees mockees

Le projet embarque des donnees de demo pour:

- les ingredients
- les commandes
- le staff
- le menu
- les zones de Dakar

Ces donnees sont chargees au premier usage puis peuvent etre modifiees localement.

## 18. Fichiers techniques majeurs

### Application

- `src/App.tsx`
  Routage principal.
- `src/main.tsx`
  Point d'entree React.

### Contextes

- `src/context/AuthContext.tsx`
  Auth locale.
- `src/context/CartContext.tsx`
  Gestion du panier.

### Commande

- `src/components/ordering/Cartmodal.tsx`
  Tunnel de commande.
- `src/components/ordering/DakarAddressPicker.tsx`
  Saisie guidee de l'adresse de livraison.

### Suivi

- `src/pages/orders/MyOrdersPage.tsx`
  Historique et suivi client.
- `src/components/dashboard/DeliveryLiveMap.tsx`
  Suivi simplifie d'une livraison.

### Stocks

- `src/components/dashboard/StockManagement.tsx`
  Module principal de stock, cloture de journee et bot.

### Utilitaires

- `src/utils/helpers.ts`
  Regles metier et formattage.
- `src/utils/storage.ts`
  Persistance navigateur.

## 19. Limites actuelles

- pas de backend
- pas de vraie base de donnees
- pas de vrai service email/WhatsApp serveur
- pas d'authentification securisee serveur
- pas de gestion multi-utilisateur temps reel
- pas de webhooks fournisseurs

## 20. Evolutions recommandees pour une version production

- backend API
- base SQL ou NoSQL
- authentification securisee
- integration SMTP / API WhatsApp Business
- systeme de stock multi-entrepots
- historique d'audit plus complet
- notifications temps reel
- permissions fines par role
- vraies commandes fournisseurs tracees

## 21. Resume fonctionnel

L'application permet aujourd'hui de:

- presenter le restaurant et sa carte
- prendre une commande client avec un tunnel simplifie
- suivre les commandes cote client
- piloter les operations cote dashboard
- affecter automatiquement les livreurs
- gerer les ingredients
- faire une cloture de stock de fin de journee
- declencher instantanement une commande d'approvisionnement via email ou WhatsApp quand un stock devient critique

