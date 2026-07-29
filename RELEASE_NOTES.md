# 🚀 RELEASE NOTES – PARADIS IT v5.0.0

## 📌 Contexte
Version **v5.0.0** marque la clôture de **Phase V** (Sprints 31‑38) et le lancement de la **Phase VI** (Qualité & Déploiement). Cette version introduit :
- **PWA** complète avec installateur, Service Worker et manifeste.
- **Resynchronisation automatique** et toasts réseau.
- **Accessibilité** (WCAG AA) : contraste, police dyslexie, taille du texte.
- **Navigation clavier** enrichie (`?`, `Alt+N/P/H/S/A`, `Escape`).
- **Thème Dark/Light** persistant, 5 accents, anti‑FOUC.
- **Gestion globale d’erreurs** (`onerror`, `unhandledrejection`) + logs IndexedDB.
- **Surveillance Core Web Vitals** (LCP, INP, CLS) via `PerformanceObserver`.
- **Orchestrateur central** `paradis-init.js` : health‑check 25 modules, badge version, persistance du rapport dans IndexedDB.
- **Suite de tests automatisée** (`scripts/test-suite.js`) couvrant 5 catégories : cohérence mkdocs, syntaxe JS, contrats API, secrets, build strict.
- **Pipeline CI/CD** complet (build, test, déploiement) sur GitHub Actions.
- **Optimisation CSS** : tokens centralisés, règles d’impression unifiées.
- **Package npm** avec scripts `test`, `build`, `serve`, `deploy`, `check`.

## 📦 Contenu livré (42 Sprints)
| Sprint | Module | Statut |
|------|--------|--------|
| 01‑08 | Infra, Auth, Sync | ✅
| 09‑14 | Lecteur, Timer, Paliers | ✅
| 15‑22 | QCM, Exam, Flashcard, Certif | ✅
| 23‑30 | Analytics, Portfolio, Radar, Backup, Chat, PDF, Search | ✅
| 31‑38 | PWA, Resync, A11y, Keyboard, Theme, Errors, Perf, Orchestrateur | ✅
| **39** | Suite de tests automatisée | ✅
| **40** | Centralisation CSS, `package.json` | ✅
| **41** | CI/CD GitHub Actions complet | ✅
| **42** | **Déploiement final & documentation** | ⏳ |

## 🗒️ Prochaine étape (Sprint 42)
1. **Vérification finale du workflow** – s’assurer que le job `deploy` s’exécute sans problème (GitHub Pages).
2. **Mise à jour du README** – inclure les instructions de build, test, déploiement et le badge de version.
3. **Publication du changelog** – ajouter la section ci‑dessus dans le `CHANGELOG.md` du dépôt.
4. **Tag final** – le tag `v5.0.0` est déjà créé ; nous ajouterons une **release GitHub** associée.
5. **Nettoyage** – supprimer les éventuels fichiers temporaires (`supabase-env.js` placeholder) du dépôt.

## ✅ Checklist avant le déploiement final
- [ ] `mkdocs build --strict` passe sans erreur (déjà validé).
- [ ] `npm run test` (ou `node scripts/test-suite.js`) passe 100 %.
- [ ] Aucun secret en dur dans le code source (`git grep -r "supabase"`).
- [ ] Workflow GitHub Actions (`.github/workflows/deploy.yml`) passe les trois jobs.
- [ ] README à jour, badge de version visible.
- [ ] Release GitHub créée avec le changelog ci‑dessus et les assets.

---

*Ce document sera utilisé comme base de la prochaine release et sera inclus dans le dépôt sous `RELEASE_NOTES.md`.*
