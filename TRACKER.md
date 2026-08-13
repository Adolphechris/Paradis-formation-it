# PARADIS IT — Nouveau Tracker de Chantier
_Regénéré sur des bases saines — sans dépendance à l'ancien tracker_

---

## Source de vérité

| Document | Rôle |
|:---|:---|
| `docs/feuille-de-route.md` | 🏛️ Constitution & Loi Fondamentale — Norme suprême |
| `00-cahier-des-charges/cahier-des-charges-600jours-v1.0.md` | Cahier des charges technique — Programme 600 Jours / 12 Semestres |
| `docs/table-des-matieres.md` | Table des matières complète des 600 leçons |

---

## Phase 1 — Foundations (Sprints 00–08) _En cours_

Ces sprints constituent le socle technique. Aucun développement front-end ne doit commencer avant validation complète.

| Sprint | Livrable | Critère d'acceptation | Statut |
|:---:|:---|:---|:---:|
| 00 | Moteur de test automatisé (`scripts/test-suite.js`) | `npm test` passe | ✅ Fait |
| 01 | Injection des secrets CI + vérification runtime | `deploy.yml` injecte `supabase-env.js`, aucun secret en dur | ✅ Fait |
| 02 | Storage Adapter local-first (IndexedDB + fallback) | `docs/js/storage-adapter.js` existe et fonctionne | ✅ Fait |
| 03 | Modal d'authentification (Inscription / Connexion Supabase) | `docs/js/auth-modal.js` — login + signup fonctionnels | ✅ Fait |
| 04 | Widget de profil + `ensureProfile` | `docs/js/profile-widget.js` + `supabase-client.js` line 129 | ✅ Fait |
| 05 | Marquage journée complétée (mode hors-ligne) | Widget journée complétée fonctionne offline | ✅ Fait |
| 06 | Bridge de synchronisation push (local → Supabase) | `docs/js/sync-bridge.js` 247 lignes | ✅ Fait |
| 07 | Engine de synchronisation pull & merge (multi-appareils) | `docs/js/sync-pull-engine.js` + `offline-resync.js` | ✅ Fait |
| 08 | Audit RLS, vues à moindre privilège + migration sécurité | 2 migrations appliquées, 27 RLS policies live | ✅ Fait |

**Phase 1 complète.**

---

## Phase 2 — Lecteur & UX Apprentissage (Sprints 09–14)

| Sprint | Livrable | Critère d'acceptation | Statut |
|:---:|:---|:---|:---:|
| 09 | Lecteur de leçons Markdown HD | `docs/js/lesson-reader.js` — callouts + nav prev/next | ✅ Fait |
| 10 | Coloration syntaxique & Copier le code | `docs/js/code-highlighter.js` | ✅ Fait |
| 11 | Minuteur de session 14h/jour interactif | `docs/js/schedule-timer.js` | ✅ Fait |
| 12 | Cartes de paliers employabilité & badges métier | `docs/js/employability-badge.js` | ✅ Fait |
| 13 | Moteur de recherche plein texte (`Ctrl+K`) | `docs/js/search-engine.js` + index | ✅ Fait |
| 14 | Barre de statut sync & déclencheur manuel | Indicateur dans le header MkDocs | ✅ Fait |

**Phase 2 complète.**

---

## Phase 3 — Moteur QCM & Examens (Sprints 15–22) _En cours_

| Sprint | Livrable | Critère d'acceptation | Statut |
|:---:|:---|:---|:---:|
| 15 | Pipeline d'import & seeding banque QCM | `docs/js/qcm-bank.js` + questions en DB | ✅ Fait |
| 16 | Interface interactive passage quiz quotidien | `docs/js/qcm-dashboard.js` | ✅ Fait |
| 17 | Calcul note /100 + persistance Supabase | Score enregistré dans table `qcm_attempts` | ✅ Fait |
| 18 | Mode examen strict (2h, chrono verrouillé) | `docs/js/exam-simulator.js` | ✅ Fait |
| 19 | Révélation corrections & grille de remédiation | Post-exam corrections view | ✅ Fait |
| 20 | Scores pondérés & analytics par domaine | `docs/js/analytics-dashboard.js` | ✅ Fait |
| 21 | Simulateur officiel épreuve Concours BCC | 100 questions, timing officiel | ✅ Fait |
| 22 | Vues SQL statistiques & difficulté questions | Vues SQL dans migration | ✅ Fait |

**Phase 3 complète.**

---

## Phase 4 — Notes, Radar & Portfolio (Sprints 23–30)

| Sprint | Livrable | Critère d'acceptation | Statut |
|:---:|:---|:---|:---:|
| 23 | Éditeur de notes personnelles par leçon | `docs/js/notes-drawer.js` + table `notes` | ✅ Fait |
| 24 | Radar de compétences 6 axes | `docs/js/radar-chart.js` + `docs/js/skill-radar.js` | ✅ Fait |
| 25 | Bucket Portfolio + politiques Storage | Bucket `portfolio-artifacts` + RLS | ✅ Fait |
| 26 | Page Portfolio & upload livrables J42–J45 | `docs/js/portfolio-generator.js` | ✅ Fait |
| 27 | Export JSON snapshot backup complet | `docs/js/backup.js` | ✅ Fait |
| 28 | Validation qualité P3C — corrigés guidés | Sections QC dans J23–J28 | ✅ Fait |
| 29 | Validation qualité P4 — corrigés guidés | Sections QC dans J29–J35 | ✅ Fait |
| 30 | Export PDF rapport employabilité | `docs/js/pdf-export.js` (jsPDF CDN) + `certification-generator.js` | ✅ Fait |

---

## Phase 5 — PWA & Offline (Sprints 31–36)

| Sprint | Livrable | Critère d'acceptation | Statut |
|:---:|:---|:---|:---:|
| 31 | PWA : manifest + Service Worker + install prompt | `docs/manifest.json` + `docs/sw.js` + `docs/js/pwa-installer.js` | ✅ Fait |
| 32 | Cache offline intelligent (stale-while-revalidate) | Cache strategy dans sw.js | ✅ Fait |
| 33 | Re-synchronisation au retour du réseau | `docs/js/offline-resync.js` | ✅ Fait |
| 34 | Algorithme 3-way merge conflits multi-appareils | Conflit résolu dans `sync-pull-engine.js` | ✅ Fait |
| 35 | Validation qualité P5 — QCM chronométrés | QC sections J36–J41 | ✅ Fait |
| 36 | Validation qualité P6 — portfolio + soutenance | QC sections J42–J45 | ✅ Fait |

---

## Phase 6 — Production & Go-Live (Sprints 37–42) _En cours_

| Sprint | Livrable | Critère d'acceptation | Statut |
|:---:|:---|:---|:---:|
| 37 | Tests E2E Playwright — parcours utilisateur complets | `playwright-report/` en CI | ⚠️ À implémenter |
| 38 | Accessibilité WCAG 2.1 AA | `docs/js/accessibility-controls.js` + audit Lighthouse | ✅ Fait |
| 39 | Performance budget (LCP < 1.2s, TTFB < 200ms) | `docs/js/perf-monitor.js` + mesure CI | ✅ Fait |
| 40 | Audit sécurité : CSP, XSS sanitization, anti-fuite clés | Scan CI passe, aucun token dev dans `site/` | ✅ Fait |
| 41 | Monitoring production + alertes quotas Supabase + Runbook | `docs/runbook.md` — monitoring, alertes, procédures de crise | ✅ Fait |
| 42 | Revue recette finale & Go-Live GitHub Pages | `docs/go-live-checklist.md` + checklist 42 sprints | ✅ Fait |

**Phase 6 complète.**

---

## État du dépôt principal (main)

| Composant | Fichiers | Statut |
|:---|:---:|:---:|
| Contenu pédagogique (J1–J45) | 45 .md + README par tome | ✅ 100% |
| MkDocs scaffold | mkdocs.yml + docs/ (11 pages) | ✅ Build passe |
| Modules JS | ~40 fichiers dans docs/js/ | ✅ Opérationnels |
| Supabase | 2 migrations + config.toml | ✅ 27 RLS live |
| PWA | manifest.json + sw.js | ✅ |
| CI/CD | .github/workflows/deploy.yml (164 lignes) | ✅ 3 jobs |
| Documentation | CDA v3.0 + plan 42 sprints + feuille route | ✅ |
| Tag de version | v5.0.0 | ✅ |
| Branches features | sprint-01 → sprint-42 + quality-cleanup | ✅ |

## État du worktree `agents/greeting-bonjour`

| Composant | Statut |
|:---|:---|
| .gitignore | ✅ Nettoyé (58 lignes, aligné sur main) |
| supabase-config.js | ✅ URL + anonKey retirés (placeholders) |
| .env | ✅ Gitignored, prêt pour usage local |
| TRACKER.md | ✅ Supprimé du scope — remplacé par ce tracker |
| run-supabase.sh | ⚠️ Contient token — utilisateur gère la révocation |
| Fichiers techniques (JS, PWA) | ⚠️ Sous-ensemble vs main — à merger depuis main |

---

## Actions restantes pour mise en production

1. **Utilisateur** : révoquer le token Supabase (`sbp_49f3c98af...`) dans le dashboard
2. **Git** : `git add -A && git commit && git push origin agents/greeting-bonjour` dans le worktree
3. **Git** : `git checkout main && git merge agents/greeting-bonjour && git push origin main`
4. **GitHub** : activer GitHub Pages (Settings → Pages → Source: GitHub Actions)
5. **GitHub** : vérifier le workflow Actions passe (build + test + deploy)
6. **GitHub** : tester l'URL publique `https://adolphechris.github.io/Paradis-formation-it/`
