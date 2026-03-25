# Linguere – Restaurant sénégalais (React + Vite)

**Linguere** est une application web (démo) de restaurant : landing page, carte par repas, panier/commandes, espace client et dashboard admin.

## Fonctionnalités

- **Landing page** : Hero, Menu, Avis clients, À propos.
- **Carte par repas** : petit-déjeuner / déjeuner / dîner (avec disponibilité des plats).
- **Panier & commande** : ajout/suppression d’articles, validation de commande via une modale.
- **Espace client** : inscription + connexion, accès à “Mes commandes”.
- **Dashboard (admin)** :
  - Aperçu (KPIs + dernières commandes)
  - Statistiques (graphiques Recharts)
  - Commandes (filtre + changement de statut + suppression)
  - Menu (CRUD)
- **Stockage local** : données persistées dans `localStorage` (pas de backend).

## Comptes de démo

- **Admin** : `admin@linguere.sn` / `Linguere1234`
- **Client** : crée un compte via `/register`, puis connecte-toi via `/login`

## Prérequis

Ce projet utilise Vite. Vérifie ta version de Node.js :

- **Node.js** : `^20.19.0` ou `>= 22.12.0`

## Installation

```bash
npm install
```

## Scripts

```bash
# dev
npm run dev

# build
npm run build

# preview (après build)
npm run preview

# lint
npm run lint
```

## Déploiement (Vercel)

Configuration recommandée :

- **Framework** : Vite
- **Build Command** : `npm run build`
- **Output Directory** : `dist`
- **Node.js** : `20.19+` (ou `22.12+`)
- **Branch** : `main`

## Données locales (localStorage)

Clés utilisées :

- `restauapp.menuItems.v1` : items du menu (CRUD)
- `restauapp.orders.v1` : commandes
- `restauapp.users.v1` : utilisateurs inscrits (démo)
- `restauapp.session.v1` : session utilisateur

Pour réinitialiser l’app, supprime ces clés dans le stockage du navigateur.

## Notes

- Projet **front-end only** (démo) : pas de paiement, pas d’API, pas de sécurité côté serveur.
- Ne pas utiliser ce système d’auth en production (mots de passe stockés côté client).
