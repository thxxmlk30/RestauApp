# TODO — Simplification checkout + Admin + Préparation NestJS

## Étape A — Simplifier le processus de commande (client / external checkout)
- [ ] Réduire le wizard (actuellement 3 étapes) dans `src/components/ordering/Cartmodal.tsx` (ex: passer à 1-2 étapes)
- [ ] Simplifier les validations (panier vide, table/zone si nécessaire, login si non-auth)
- [ ] Retirer/limiter la complexité UI (ex: StepIndicator si jugé inutile)
- [ ] Mettre à jour l’UI pour garder un flow rapide (moins de champs visibles)
- [ ] Commit #A1 après refactor UI/flow

## Étape B — Simplifier le dashboard admin (supprimer toutes les “cartes”)
- [ ] Remplacer les KPI “cards” (ex: `src/components/dashboard/StatsCards.tsx`) par une version simple (listes/sections)
- [ ] Retirer `panel-3d` / “rounded card layouts” sur les pages dashboard (overview, stats, etc.)
- [ ] Supprimer les cartes de style mobile si nécessaire (ex: fallback cards dans `OrdersTable.tsx`) ou les simplifier
- [ ] Commit #B1 après suppression des blocs cards dans les écrans principaux

## Étape C — Préparer un backend NestJS
- [ ] Introduire une couche API dans `src/api/*` (client HTTP + interfaces repository)
- [ ] Encapsuler l’accès `localStorage` existant derrière un repository (ex: `StorageRepository`)
- [ ] Permettre un switch “mock/localStorage” ↔ “backend HTTP”
- [ ] Commit #C1 après création de la couche API + intégration mock

## Étape D — Créer un guide backend complet NestJS (groupe de 4)
- [ ] Créer un guide `NESTJS_BACKEND_GUIDE.md`
- [ ] Proposer découpage des tâches (4 personnes) + endpoints + DTO + validation
- [ ] Ajouter stratégie de migration (mock → backend → DB)
- [ ] Ajouter checklist de tests + conventions
- [ ] Commit #D1 après rédaction guide

## Notes
- Chaque étape doit être validée par commits successifs.
- Aucun commit “massif” : viser 1 commit par changement cohérent.
