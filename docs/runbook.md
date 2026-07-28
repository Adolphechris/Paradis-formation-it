# PARADIS — Runbook d'Exploitation (Sprint 41)
Version : 1.0  
Dernière mise à jour : 2026-07-28

---

## 1. Périmètre

Ce runbook couvre l'exploitation de la plateforme PARADIS IT en production sur GitHub Pages avec backend Supabase.

---

## 2. Architecture production

| Couche | Service | Rôle |
|:---|:---|:---|
| Frontend | GitHub Pages | Hébergement statique, CDN global, HTTPS automatique |
| Build | GitHub Actions | CI/CD : build MkDocs → tests → déploiement |
| Backend | Supabase (`iwwohgdbdrlodhhgewut`) | Auth + DB PostgreSQL + RLS + Storage |
| Search | Fuse.js (client-side) | Recherche plein texte dans le contenu |
| PWA | Service Worker | Cache offline, install prompt |

### Secrets à configurer dans GitHub

| Secret | Usage |
|:---|:---|
| `SUPABASE_URL` | URL du projet Supabase |
| `SUPABASE_ANON_KEY` | Clé anonyme (publique) Supabase |

Emplacement : Repository → Settings → Secrets and variables → Actions → New repository secret.

---

## 3. Procédures d'exploitation

### 3.1 Déploiement d'une nouvelle version

```bash
# 1. Merger les changements sur main
git checkout main
git merge <branche-a-deployer>
git push origin main

# 2. Vérifier le workflow GitHub Actions
# Aller sur : https://github.com/Adolphechris/Paradis-formation-it/actions
# Vérifier que le workflow "Deploy PARADIS IT" passe (build + test + deploy)

# 3. Vérifier le site en ligne
# https://adolphechris.github.io/Paradis-formation-it/
```

### 3.2 Rollback

```bash
# Revenir au commit précédent
git revert HEAD
git push origin main

# Le workflow CI se relance automatiquement et déploie l'ancienne version
```

### 3.3 Monitoring Supabase

| métrique | seuil d'alerte |
|:---|:---|
| Connexions DB actives | > 40 |
| Stockage utilisé | > 400 MB |
| Requêtes / minute | > 5 000 |
| Erreurs RLS | > 0 |
| Auth échecs / heure | > 10 |

Accès : Dashboard Supabase → Project `iwwohgdbdrlodhhgewut` → Settings → Usage & Billing.

### 3.4 Alertes à configurer dans Supabase

1. Aller dans **Settings → Integrations**
2. Activer **Email alerts** pour :
   - Quota storage > 80%
   - Quota bandwidth > 80%
   - Quota DAU > 80%
   - Erreurs de migration
   - Échecs auth suspects

### 3.5 Logs applicatifs

Les logs navigateur sont disponibles via la console DevTools du site.  
Les erreurs Supabase sont loggées dans la table `audit.logs` (si activée) ou dans le dashboard Supabase → Logs.

### 3.6 Sauvegarde

- Sauvegarde automatique Supabase : **quotidienne** (7 jours de rétention par défaut)
- Export manuel : Dashboard Supabase → Settings → Database → Backups → Export
- Backup applicatif (JSON) : accessible via `docs/js/backup.js` côté client (export localStorage/IndexedDB)

---

## 4. Procédures de crise

### 4.1 Site inaccessible

1. Vérifier GitHub Status : https://www.githubstatus.com
2. Vérifier le dernier workflow Actions (échec ?)
3. Vérifier les secrets GitHub (SUPABASE_URL, SUPABASE_ANON_KEY)
4. Si problème Supabase : vérifier le statut https://status.supabase.com

### 4.2 Base de données saturée ou lente

1. Dashboard Supabase → SQL Editor
2. Vérifier les requêtes longues : `SELECT * FROM pg_stat_activity WHERE state = 'active';`
3. Vérifier les index : `\d+ public.progress` dans SQL Editor
4. Tuer les requêtes bloquées si nécessaire

### 4.3 Fuite de données / faille RLS

1. Désactiver temporairement le site (GitHub Pages : désactiver dans Settings)
2. Auditer les policies : `SELECT * FROM pg_policies WHERE tablename IN ('profiles', 'progress', 'notes', 'qcm_attempts', 'exam_sessions');`
3. Révoquer les clés compromises dans Supabase → Settings → API → Revoke

### 4.4 Proxy / CDN invalide

Forcer le rebuild en touchant `mkdocs.yml` et en poussant sur `main`.

---

## 5. Contacts et responsabilités

| Rôle | Contact |
|:---|:---|
| Owner du dépôt | Adolphe Chris (@Adolphechris) |
| Support Supabase | https://supabase.com/docs/support |
| Support GitHub Pages | https://docs.github.com/en/pages |

---

## 6. Maintenance préventive

| Tâche | Fréquence | Responsable |
|:---|:---|:---|
| Vérifier les logs Supabase | Hebdomadaire | Owner |
| Mettre à jour les dépendances MkDocs | Mensuelle | Owner |
| Vérifier les alerts Supabase | Hebdomadaire | Owner |
| Backup complet DB | Mensuelle | Owner |
| Revue sécurité des policies RLS | Trimestrielle | Owner |
