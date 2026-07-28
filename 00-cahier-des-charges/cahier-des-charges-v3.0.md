# CAHIER DES CHARGES MASTER — PLATEFORME PELP (PARADIS E-LEARNING PLATFORM)
## Version 3.0 — État des lieux consolidé (Juillet 2026)

---

### Métadonnées du document

| Champ | Valeur |
| :--- | :--- |
| **Version** | 3.0 |
| **Date** | 2026-07-28 |
| **Auteur** | Copilot CLI / Professeure Virtuelle DeepSeek V4 Lite |
| **Statut** | FINAL — Tous les contenus de J1–J45 rédigés et QC-passés |
| **Branche git** | `agents/greeting-bonjour` (worktree) |
| **Dépôt principal** | `Adolphechris/Paradis-formation-it.git` |
| **Dépôt archivé** | `Adolphechris/Paradis.git` (README only) |
| **Site de déploiement cible** | GitHub Pages (`https://adolphechris.github.io/Paradis-formation-it/`) |
| **Static generator** | MkDocs Material (préféré) ; Hugo/PaperMod ou Astro/Next.js en alternative |
| **Hébergement** | GitHub Pages (gratuit, HTTPS automatique, CDN global) |

---

## 1. SYNTHÈSE EXÉCUTATIVE

> Annexe technique companion : Pour les aspects opérationnels, la version technique complémentaire est disponible dans `00-cahier-des-charges/cahier-des-charges-merged.md`. Ce document ("merged") contient les recommandations d'implémentation, le plan CI/CD, les tests automatisés et les options de déploiement (hybride Firestore + IndexedDB). Conserver les deux documents permet de séparer la vision produit (v3.0) et les détails opérationnels réutilisables lors du chantier.



### 1.1. Vision du projet
Construire une plateforme d'apprentissage en ligne **PELP** (PARADIS E-Learning Platform) qui couvre l'intégralité du programme **PARADIS IT** — 45 jours d'autoformation intensive (630 heures) répartis en 7 tomes (P0–P6) préparant au Bachelor of IT et à l'emploi dans les institutions bancaires/centrales de la RDC.

### 1.2. Contraintes et principes fondamentaux

- **Content completeness** : Aucun jour, aucune section ne doit être omise ou simplifiée. Tous les 45 jours (J1–J45) sont intégralement rédigés.
- **Multi-appareil** : La plateforme doit fonctionner sans rupture sur PC, Mac, tablette et smartphone. La progression se synchronise entre appareils.
- **Gratuité totale** : Aucun coût récurrent au lancement. Tous les outils sont open source ou gratuits.
- **Local-first** : Fonctionnement principal sur la machine locale (IndexedDB + Service Worker), avec sync optionnelle vers GitHub.
- **Typographie stricte** :
  - **Inter** — police UI (titres, navigation, éléments d'interface)
  - **Source Serif Pro** — police de contenu (corps de texte des leçons)
  - **JetBrains Mono** — police code (blocs de code syntax-highlightés)
- **Illustrations** : SVG pour les diagrammes techniques ; Unsplash/Pexels pour les images visuelles.
- **Icônes** : Lucide ou Feather (licence MIT).
- **Recherche** : Fuse.js (client-side) ou Algolia DocSearch.
- **Mode sombre/clair** : CSS custom properties + `prefers-color-scheme` media query.
- **Contenu** : Fichiers Markdown (`.md`) avec nommage standardisé `jour-XX.md`.
- **Design system** : MkDocs Material comme base, avec CSS customisé aux couleurs PARADIS.
- **Progression** : localStorage + optionnel GitHub Actions/JSON serveur.

### 1.3. Structure du contenu pédagogique

| Tome | Code | Jours | Thème | Volume horaire estimé |
| :--- | :--- | :--- | :--- | :--- |
| **P0** | Socle Support | J1–J3 | Environnement de travail, bureautique, Web front-end, Git, Linux | 42h |
| **P2** | Fondations Sys/Data/Net | J4–J11 | Python, structures de données, SQL, réseaux, Bash | 112h |
| **P3-A** | Spécialisation Sysadmin | J12–J17 | Administration systèmes avancée | ~42h |
| **P3-B** | Spécialisation Data | J18–J22 | Bases de données, analytique, SQL avancé | ~35h |
| **P3-C** | Spécialisation Web | J23–J28 | Développement web full-stack | ~42h |
| **P4** | Cloud & Sécurité | J29–J35 | Cloud computing, sécurité informatique, gouvernance IT | 98h |
| **P5** | Préparation Tests | J36–J41 | Banques de QCM, simulations d'entretien, examens blancs | 84h |
| **P6** | Portfolio & Soutenance | J42–J45 | Projets portfolio, rapport d'employabilité, simulation finale | 56h |

### 1.4. Sections obligatoires par jour (grille de qualité /100)
Chaque fichier `jour-XX.md` doit contenir :

1. **Objectifs d'apprentissage** — ce que l'étudiant maîtrisera après cette journée
2. **Contenu théorique** — explications structurées avec exemples de code
3. **Exemples pratiques** — extraits de code commentés et exercices guidés
4. **Exercices** — défis pratiques à réaliser
5. **Validation qualité grille /100** — critère d'évaluation de la qualité de la leçon
6. **Corrigés guidés mode tuteur** — solutions détaillées avec explications pédagogiques

### 1.5. État actuel de réalisation (Juillet 2026)

| Composant | Statut | Détails |
| :--- | :--- | :--- |
| P0 (J1–J3) | ✅ COMPLET | QC sections ajoutées, corrigés guidés en place |
| P2 (J4–J11) | ✅ COMPLET | J11 bridging module systemctl; J14 docker compose; J15 firewall enhanced |
| P3-A (J12–J17) | ✅ COMPLET | 6 jours rédigés |
| P3-B (J18–J22) | ✅ COMPLET | 5 jours rédigés |
| P3-C (J23–J28) | ✅ COMPLET | 6 jours rédigés |
| P4 (J29–J35) | ✅ COMPLET | 7 jours; J35 validation qualité passée |
| P5 (J36–J41) | ✅ COMPLET | 6 jours avec corrigés guidés |
| P6 (J42–J45) | ✅ COMPLET | 4 jours; structure harmonisée; corrigés guidés |
| Annexe abréviations | ✅ COMPLET | `annexes/abreviations.md` existante |
| Cahier des charges | 🔄 EN COURS | Ce document v3.0 en cours de rédaction |
| Feuille de route | ✅ À JOUR | v2.3 avec suivi qualité |
| CSS customisé | 🔧 EXISTANT | `css/style.css` (21 Ko) |
| Markdown parser JS | 🔧 EXISTANT | `js/markdown-parser.js` (3.9 Ko) |

---

## 2. ARCHITECTURE TECHNIQUE

### 2.1. Stack recommandée

```
┌─────────────────────────────────────────────────────────┐
│  COUCHE PRÉSENTATION (Navigateur)                       │
│  ┌─────────────────────────────────────────────────┐   │
│  │  MkDocs Material (thème) + CSS customisé       │   │
│  │  + Fuse.js (recherche) + Chart.js (radar)      │   │
│  │  + DOMPurify (sanitisation) + Prism.js (code)  │   │
│  └─────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────┐   │
│  │  PWA Layer : manifest.json + sw.js              │   │
│  │  IndexedDB (idb library) + LocalStorage         │   │
│  └─────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────┤
│  COUCHE CONTENU (Markdown)                             │
│  ┌─────────────────────────────────────────────────┐   │
│  │  45 fichiers jour-XX.md                         │   │
│  │  Frontmatter : title, tome, jour, duration,    │   │
│  │  tags, quiz_id                                   │   │
│  └─────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────┤
│  COUCHE DÉPLOIEMENT                                     │
│  ┌─────────────────────────────────────────────────┐   │
│  │  GitHub Actions (build MkDocs)                  │   │
│  │  GitHub Pages (déploiement automatique)         │   │
│  │  Branche cible : agents/greeting-bonjour        │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

### 2.2. Architecture de stockage local (Local-First)

```typescript
// Structure IndexedDB
interface AppDatabase {
  lessons: LessonRecord[];     // Contenu des cours en cache
  progress: ProgressRecord[];  // Progression utilisateur
  quizzes: QuizRecord[];       // Historique QCM
  notes: NoteRecord[];         // Annotations utilisateur
  bookmarks: BookmarkRecord[]; // Signets
  userProfile: UserProfile;    // Profil utilisateur
}

interface LessonRecord {
  dayId: string;       // "jour-01"
  tome: string;        // "P0"
  title: string;
  content: string;     // HTML rendu depuis Markdown
  lastAccessed: number; // timestamp
}

interface ProgressRecord {
  dayId: string;
  isCompleted: boolean;
  quizScore: number;   // /100
  timeSpent: number;   // en minutes
  completedAt: number; // timestamp
  notes: string;
}

interface UserProfile {
  displayName: string;
  targetRole: "BCC_IT_Officer" | "Sysadmin" | "Data_Analyst" | "Fullstack";
  totalHoursSpent: number;
  daysCompletedCount: number;
  globalAverageScore: number;
  streakDays: number;
  competencyRadar: CompetencyRadar;
}

interface CompetencyRadar {
  supportBureautique: number;   // /100 (J1-J3)
  systemesReseaux: number;      // /100 (J9, J12-J17)
  devAlgo: number;              // /100 (J4-J6, J23-J28)
  dataSql: number;              // /100 (J7-J8, J18-J22)
  cloudSecurity: number;        // /100 (J15, J29-J35)
  bankingGovernance: number;    // /100 (BCC Module + P5)
}
```

### 2.3. Stratégie PWA (Progressive Web App)

| Ressource | Stratégie de cache |
| :--- | :--- |
| CSS, JS, Fonts (Inter, Source Serif Pro, JetBrains Mono) | **CacheFirst** — servi depuis le cache Service Worker |
| Fichiers Markdown (contenu cours) | **NetworkFirst** avec secours IndexedDB |
| Images (SVG, WebP) | **CacheFirst** avec cache versionné |
| Données de progression (IndexedDB) | **Local only** — jamais en cache réseau |
| Manifest `manifest.json` | **CacheFirst** |

### 2.4. Recherche plein texte (Fuse.js)

- **Moteur** : Fuse.js (client-side, zéro dépendance serveur)
- **Index** : Constructed at build time from all `jour-XX.md` frontmatter + first paragraph
- **Champs indexés** : title, tags, summary
- **Raccourci clavier** : `Ctrl + K` (ou `Cmd + K` sur Mac) pour ouvrir la barre de recherche
- **Fallback** : Si Fuse.js échoue, recherche basique dans les titres de section (H1/H2)

### 2.5. Design System & palette PARADIS

| Token | Valeur | Usage |
| :--- | :--- | :--- |
| `--brand-primary` | `#0B5FFF` | Bleu profond — liens, boutons principaux |
| `--brand-accent` | `#2EC4B6` | Turquoise — accents, badges, highlights |
| `--brand-cta` | `#FF7A18` | Orange — boutons d'action (CTA) |
| `--surface-bg` | `#F7F9FC` | Fond de page clair |
| `--surface-dark` | `#1a1a2e` | Fond sombre (mode sombre) |
| `--text-primary` | `#1a1a2e` (clair) / `#e0e0e0` (sombre) | Texte principal |
| `--text-secondary` | `#6b7280` | Texte secondaire, métadonnées |
| `--code-bg` | `#f0f4f8` | Fond des blocs de code |
| `--success` | `#10b981` | Validation réussite |
| `--warning` | `#f59e0b` | Avertissement, "À consolider" |
| `--danger` | `#ef4444` | Erreur, échec |

### 2.6. Typographie

| Police | Usage | Source |
| :--- | :--- | :--- |
| **Inter** | UI, titres d'interface | Google Fonts |
| **Source Serif Pro** | Corps des leçons | Google Fonts |
| **JetBrains Mono** | Blocs de code | Google Fonts |

### 2.7. Icônes

- **Bibliothèque** : Lucide Icons (MIT license)
- **Intégration** : SVG inline pour les icônes de navigation (📚 Tome, 🏆 Examen, 🔍 Recherche)
- **Alternative** : Feather Icons si Lucide pose problème

---

## 3. SPÉCIFICATIONS FONCTIONNELLES (8 MODULES)

### 3.1. Module 1 : Lecteur Markdown HD (Moteur de rendu)

**Fonctionnalités :**
- Rendu dynamique des fichiers `.md` avec **Marked.js** ou le parser natif de MkDocs
- Colouring syntaxique des blocs de code via **Prism.js** ou **highlight.js** (support Python, Bash, SQL, JavaScript, YAML)
- Navigation jour par jour avec breadcrumbs (`P0 > J1 > Objectifs`)
- Bouton **"Code Playground"** pour les blocs de code Python/SQL/Bash : exécution simulée ou copie rapide dans le presse-papier
- Surlignage de texte et bloc-notes persistant sous chaque leçon (stocké en localStorage)
- Barre de progression latérale montrant la position dans le document

**Exigences de qualité :**
- Temps de rendu < 100ms pour un jour standard (~3Ko Markdown)
- Aucun bloc de code non coloré
- Tous les SVG techniques rendus correctement
- Responsive : les tables Markdown se scrollent horizontalement sur mobile

### 3.2. Module 2 : Suivi de progression & Badges

**Fonctionnalités :**
- **Progression par jour** : pourcentage de complétion (0–100%) stocké en IndexedDB
- **Progression par tome** : sommaire visuel avec barres de progression
- **Progression globale** : barre de progression principale `J24 / 45 [████████░░░░] 53%`
- **Statut visuel** par jour : ✅ Terminé | 🔄 En cours | 🔒 Non commencé | 📝 À consolider
- **Badges** : règles évaluées côté client
  - 🏅 *Premier Jour* — J1 complété
  - 🏅 *Semaine Complète* — 5 jours consécutifs
  - 🏅 *Maître du Socle* — P0 complété avec score ≥ 80/100
  - 🏅 *Oracle* — Tous les QCM ≥ 85/100
  - 🏅 *Portfolio Complet* — J42–J45 soumis
- **Streak** : compteur de jours consécutifs complétés
- **Temps passé** : tracking du temps de lecture par jour

### 3.3. Module 3 : Moteur de QCM & Examen Blanc

**QCM Quotidien (intégré à chaque fin de jour) :**
- Extraction automatique des questions des fichiers du Tome P5 et des fins de journée
- Format de question (JSON) :
  ```json
  {
    "id": "qcm-jour08-01",
    "type": "qcm" | "open" | "case",
    "question": "Texte de la question",
    "choices": ["A", "B", "C", "D"],
    "correct": 0,
    "weight": 1,
    "explanation": "Explication détaillée de la réponse",
    "tags": ["linux", "systemd"],
    "difficulty": "easy" | "medium" | "hard"
  }
  ```
- **Chronométrage** : 1h30 max par test quotidien
- **Barème** : note calculée sur 100
- **Seuil de validation** :
  - Note ≥ 80/100 : ✅ Journée validée avec mention
  - Note 60–79/100 : 🔄 Statut "À consolider"
  - Note < 60/100 : 🔁 Exercices de remédiation recommandés

**Simulateur d'Examen Blanc BCC (mode spécifique) :**
- Génération automatique d'une épreuve de **100 questions aléatoires** dans la banque globale
- **Chronomètre strict de 2h00** sans possibilité de pause
- Masquage des réponses et explications pendant l'épreuve
- Ordre des questions et des choix aléatoire à chaque passage
- Édition d'un relevé de note officiel (PDF exportable) à la fin
- Conditions réelles de concours : pas de retour en arrière, pas de triche

### 3.4. Module 4 : Tuteur IA Virtuel Socratique

**Architecture :**
```
┌─────────────┐     ┌──────────────────┐     ┌──────────────┐
│  Widget Chat │────▶│  API Handler     │────▶│ DeepSeek V4  │
│  (floating)  │     │  (par défaut)    │     │ Lite (gratuit)│
└─────────────┘     └──────────────────┘     └──────────────┘
      │                                          │
      │ (si hors-ligne ou API indisponible)      │
      ▼                                          ▼
┌─────────────────┐                    ┌────────────────────┐
│ FAQ Locale      │                    │ Fallback : recherche│
│ (Fuse.js sur    │                    │ plein texte sur     │
│  markdown index)│                    │ Markdown indexé     │
└─────────────────┘                    └────────────────────┘
```

**Prompt système constitutionnel (DeepSeek V4 Lite) :**
```text
Tu es la Professeure Virtuelle de l'Université PARADIS IT.
Ton rôle est d'accompagner l'étudiant dans sa préparation intensive
au niveau Bachelor IT et au concours de la Banque Centrale du Congo.

RÈGLES D'ENGAGEMENT :
1. Adopte une méthode socratique : ne donne pas directement la réponse
   finale. Pose une question intermédiaire pour guider la réflexion.
2. Si l'étudiant soumet un message d'erreur (Linux, Python, SQL),
   analyse la cause racine et explique le concept sous-jacent.
3. Rigueur académique et courtoisie professionnelle.
4. Adapte ton niveau de détail au niveau de l'étudiant (débutant vs confirmé).
5. Après une réponse, propose toujours un exercice de consolidation.
6. Ne jamais donner le code complet sans demander à l'étudiant d'essayer d'abord.
```

**Fonctionnalités du widget :**
- Bouton flottant permanent (coin inférieur droit)
- Fenêtre modale pour le chat (accessible sur mobile et desktop)
- Historique de la session stocké en localStorage
- Bouton "Copier la réponse" pour chaque message de la professeure
- Bouton "Nouvelle session" pour réinitialiser le contexte

### 3.5. Module 5 : Radar de Compétences & Learning Analytics

**Visualisation :**
- Diagramme en radar (spider chart) avec 6 axes sectoriels
- Mise à jour en temps réel à chaque complétion de jour

**6 axes sectoriels :**
| Axe | Tome couvert | Jours |
| :--- | :--- | :--- |
| Support & Bureautique | P0 | J1–J3 |
| Systèmes & Réseaux | P2, P3-A | J9, J12–J17 |
| Développement & Algorithmique | P2, P3-C | J4–J6, J23–J28 |
| Base de Données & Analytics | P2, P3-B | J7–J8, J18–J22 |
| Cloud & Cybersécurité | P4 | J15, J29–J35 |
| Conformité & Culture Bancaire | BCC Module + P5 | P5 tous jours |

**Calcul du score :**
- Chaque axe calcule un score sur 100 basé sur :
  - % de jours complétés dans le périmètre de l'axe (poids 40%)
  - Moyenne des notes QCM dans le périmètre (poids 60%)
- La visualisation utilise Chart.js ou D3.js

### 3.6. Module 6 : Moteur de Recherche Plein Texte

**Configuration Fuse.js :**
```javascript
const fuseOptions = {
  keys: [
    { name: 'title', weight: 0.6 },
    { name: 'tags', weight: 0.3 },
    { name: 'summary', weight: 0.1 }
  ],
  threshold: 0.3,
  includeMatches: true,
  minMatchCharLength: 2
};
```

**Interface :**
- Barre de recherche globale accessible via `Ctrl + K` / `Cmd + K`
- Résultats groupés par tome
- Surbrillance des termes trouvés dans les extraits
- Résultats triés par pertinence décroissante

### 3.7. Module 7 : Générateur de Rapport d'Employabilité & Portfolio PDF

**Rapport PDF (généré côté client avec jsPDF ou html2pdf) :**
1. **Page de couverture** : logo PARADIS IT, nom de l'étudiant, date
2. **Profil** : displayName, targetRole, heures totales, streak
3. **Progression 45J** : graphique de progression jour par jour (bar chart)
4. **Radar de compétences** : visualisation radar
5. **Résultats QCM** : tableau avec date, jour, score/100, statut
6. **Portfolio** : liste des projets du P6 avec liens GitHub
7. **Certificat de complétion** : si tous les jours validés (score ≥ 60/100)

**Export ZIP (Portfolio dactylique) :**
- Rapport PDF
- JSON complet de la progression
- Copie de tous les notes/annotations
- Screenshots des projets (si présents dans `.paradis/uploads/`)

### 3.8. Module 8 : Synchronisation & Backup

**Synchronisation locale → cloud (optionnelle) :**
- Bouton "Sync" qui crée un commit GitHub dans le repo utilisateur
- Le token GitHub doit être fourni manuellement par l'utilisateur (jamais stocké en clair)
- Gestion des conflits par rebase automatique ou alerte manuelle

**Backup / Restore :**
- Export JSON complet : `export_profile()` génère `paradis-backup-YYYY-MM-DD.json`
- Import JSON : `import_profile(file)` restaure profil + progression
- Archive ZIP : backup complet des uploads + exports

---

## 4. EXIGENCES NON FONCTIONNELLES

### 4.1. Performance (Core Web Vitals)

| Métrique | Cible | Stratégie d'atteinte |
| :--- | :--- | :--- |
| **LCP** (Largest Contentful Paint) | < 1.2s | CacheFirst pour assets, CDN GitHub Pages |
| **INP** (Interaction to Next Paint) | < 80ms | CSS natif + JS minimal, pas de framework lourd |
| **CLS** (Cumulative Layout Shift) | < 0.02 | Dimensions fixes pour images, font-display: swap |
| **FCP** (First Contentful Paint) | < 0.8s | Préchargement du tome courant |
| **TTFB** (Time to First Byte) | < 200ms | GitHub Pages edge network |

### 4.2. Sécurité

1. **Sanitisation** : DOMPurify appliqué à tout contenu Markdown transformé en HTML
2. **Content Security Policy (CSP)** : meta tag configuré pour GitHub Pages deployment :
   ```
   default-src 'self'; script-src 'self' https://cdn.jsdelivr.net; 
   style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
   font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:;
   connect-src 'self' https://api.deepseek.com;
   ```
3. **Chiffrement local** : mots de passe utilisateur hachés avec bcryptjs côté client (note : sécurité limitée en local, migration OAuth recommandée pour multi-machine)
4. **Pas de collecte de données personnelles** : aucun tracking, aucun analytics tiers
5. **HTTPS obligatoire** : garanti par GitHub Pages

### 4.3. RGPD & Conformité Données

- Export des données personnelles en 1 clic ( bouton "Exporter mes données")
- Suppression complète du profil local en 1 clic (bouton "Supprimer mon profil")
- Aucune donnée envoyée à un serveur tiers sauf consentement explicite
- Aucune cookie de tracking

---

## 5. PLAN D'IMPLÉMENTATION & ROUTE

### 5.1. Phase 1 — Foundation (Semaine 1)
| Tâche | Détail | Priorité |
| :--- | :--- | :--- |
| Initialiser MkDocs Material | `pip install mkdocs-material`, configuration `mkdocs.yml` | Critique |
| CSS customisé | `css/style.css` PARADIS brand + Inter/Source Serif/JetBrains | Critique |
| 45 fichiers Markdown importés | Copier `jour-XX.md` dans `docs/` | Critique |
| Deploy base sur GitHub Pages | Workflow Actions, branche `agents/greeting-bonjour` | Critique |
| Service Worker stub | `sw.js` avec CacheFirst pour assets | Haute |
| manifest.json | PWA installable | Haute |

### 5.2. Phase 2 — Moteur de contenu (Semaine 2)
| Tâche | Détail | Priorité |
| :--- | :--- | :--- |
| Parser Markdown côté client | Marked.js ou parser natif MkDocs | Critique |
| Prism.js highlighting | Configuration pour Python, Bash, SQL, JS, YAML | Haute |
| IndexedDB skeleton | idb library, stores lessons/progress/quizzes/notes | Critique |
| Navigation jour par jour | Breadcrumbs, sidebar tome/jour, boutons préc/suiv | Critique |
| Fuse.js search index | Build at deploy time, `Ctrl+K` widget | Haute |

### 5.3. Phase 3 — Moteur QCM & Examen Blanc (Semaine 3)
| Tâche | Détail | Priorité |
| :--- | :--- | :--- |
| Moteur QCM natif | JSON question bank, évaluation locale | Critique |
| Examen Blanc 100Q | Chronomètre 2h, randomisation, score /100 | Critique |
| Seuil de validation | 80=validé, 60-79=à consolider, <60=remédiation | Haute |
| Export résultats JSON/CSV | Inclus dans rapport employabilité | Moyenne |

### 5.4. Phase 4 — Analytics & Portfolio (Semaine 4)
| Tâche | Détail | Priorité |
| :--- | :--- | :--- |
| Radar Chart | Chart.js ou D3.js, 6 axes sectoriels | Haute |
| Générateur PDF | jsPDF ou html2pdf client-side | Haute |
| Portfolio local | Fiches projets + liens GitHub | Moyenne |
| Backup/Restore JSON | Export ZIP complet | Moyenne |

### 5.5. Phase 5 — IA & Polish (Semaine 5)
| Tâche | Détail | Priorité |
| :--- | :--- | :--- |
| Widget chat Tuteur IA | Floating button, modale chat, DeepSeek API | Haute |
| Fallback FAQ locale | Fuse.js search si API indisponible | Moyenne |
| Dark mode | CSS custom properties + prefers-color-scheme | Critique |
| Responsive full | Test mobile/tablet/desktop | Critique |
| WCAG 2.1 AA | Contraste, clavier, aria-labels | Haute |
| Acceptance tests | Checklist de recette finale | Critique |

### 5.6. Checklist de recette MVP (Acceptance Criteria)

- [ ] Lecture de chaque jour (45) fonctionne hors-ligne.
- [ ] Progression enregistrée et exportable en JSON.
- [ ] Examen blanc 100Q chrono fonctionne et scores exportables.
- [ ] Portfolio exportable et rapport PDF généré.
- [ ] Backup/restore JSON complète et fonctionnelle.
- [ ] Recherche plein texte (Ctrl+K) fonctionne sur tous les jours.
- [ ] Radar de compétences se met à jour à chaque complétion.
- [ ] Tuteur IA accessible et fonctionnel (mode online + fallback).
- [ ] Mode sombre/clair fonctionne sur tous les appareils.
- [ ] PWA installable et fonctionne en mode avion.
- [ ] WCAG 2.1 AA : contraste, navigation clavier, aria-labels.
- [ ] Core Web Vitals dans les cibles (LCP<1.2s, INP<80ms, CLS<0.02).
- [ ] Déploiement GitHub Pages fonctionnel et accessible publiquement.

---

## 6. GESTION DU DÉPÔT & WORKFLOW GIT

### 6.1. Réfèrences git

| Élément | Valeur |
| :--- | :--- |
| Dépôt principal | `https://github.com/Adolphechris/Paradis-formation-it.git` |
| Branche active | `agents/greeting-bonjour` |
| Worktree path | `/home/adolphe/PARADIS/Paradis-formation-it.worktrees/greeting-bonjour/` |
| Dépôt archivé | `https://github.com/Adolphechris/Paradis.git` (README only) |
| Cible de déploiement | GitHub Pages (source: `main` ou `agents/greeting-bonjour`) |

### 6.2. Conventions de commit

```
<type>: <description concise>

Types acceptés :
- content: ajout/modification de contenu pédagogique (jour-XX.md)
- qc: correction qualité, ajout de sections /100 ou corrigés
- infra: infrastructure technique, CSS, JS, config
- docs: documentation, cahier des charges, feuille de route
- build: configuration MkDocs, GitHub Actions, Pages
- style: refactoring sans changement de logique
```

### 6.3. Branches attendues

| Branche | Usage |
| :--- | :--- |
| `main` | Branche de production stable |
| `agents/greeting-bonjour` | Branche active de travail (worktree) |
| `site/docusaurus-init` | (future) squelette site statique |
| `qc/pass` | Branches temporaires pour validation qualité |

---

## 7. ANNEXES

### 7.1. Structure des fichiers MkDocs cible

```
Paradis-formation-it/
├── mkdocs.yml                  # Configuration MkDocs Material
├── docs/
│   ├── index.md                # Page d'accueil hero
│   ├── tome-p0/                # Socle Support
│   │   ├── jour-01.md
│   │   ├── jour-02.md
│   │   └── jour-03.md
│   ├── tome-p2/                # Fondations
│   │   ├── jour-04.md ... jour-11.md
│   ├── tome-p3a/               # Spécialisation Sysadmin
│   │   ├── jour-12.md ... jour-17.md
│   ├── tome-p3b/               # Spécialisation Data
│   │   ├── jour-18.md ... jour-22.md
│   ├── tome-p3c/               # Spécialisation Web
│   │   ├── jour-23.md ... jour-28.md
│   ├── tome-p4/                # Cloud & Sécurité
│   │   ├── jour-29.md ... jour-35.md
│   ├── tome-p5/                # Préparation Tests
│   │   ├── jour-36.md ... jour-41.md
│   ├── tome-p6/                # Portfolio & Examen
│   │   ├── jour-42.md ... jour-45.md
│   ├── recherche.md            # Page de recherche plein texte
│   ├── examen-blanc.md         # Simulateur BCC
│   ├── portfolio.md            # Portfolio & rapport employabilité
│   └── annexes/
│       └── abreviations.md
├── css/
│   └── style.css               # Custom CSS PARADIS
├── js/
│   ├── markdown-parser.js      # Parser Markdown + highlighting
│   ├── progress-tracker.js     # IndexedDB + progression
│   ├── quiz-engine.js          # Moteur QCM
│   ├── search-engine.js        # Fuse.js indexation
│   ├── radar-chart.js          # Chart.js radar
│   ├── pdf-export.js           # jsPDF générateur
│   ├── chat-widget.js          # Tuteur IA widget
│   └── backup.js               # Export/Import JSON
├── templates/
│   └── day-template.md         # Template standard pour nouveaux jours
├── scripts/
│   ├── build-search-index.js   # Index Fuse.js au build time
│   ├── export-profile.js       # Export JSON profil + progression
│   ├── git-backup.sh           # Commit + push helper
│   └── qc-check.js             # Validation qualité automatique
└── .github/
    └── workflows/
        └── deploy.yml          # GitHub Actions pour GitHub Pages
```

### 7.2. Grille de qualité /100 (référence)

Chaque jour est évalué selon ces 10 critères (10 points chacun) :

| # | Critère | Pondération | Description |
| :---: | :--- | :---: | :--- |
| 1 | **Clarté des objectifs** | 10 | Objectifs d'apprentissage formulés clairement et mesurables |
| 2 | **Complétude du contenu** | 10 | Aucun sujet clé omis, toutes les concepts couverts |
| 3 | **Exemples de code** | 10 | Code commenté, testable, avec explications de chaque ligne |
| 4 | **Exercices pratiques** | 10 | Exercices guidés avec difficulté progressive |
| 5 | **Exercices résolus** | 10 | Corrigés présentés avec explication du cheminement |
| 6 | **Contexte bancaire** | 10 | Lien avec les institutions financières/BCC quand pertinent |
| 7 | **Accessibilité** | 10 | Langage inclusif, pas de jargon non expliqué, structure claire |
| 8 | **Cohérence pédagogique** | 10 | Progression logique, références aux jours précédents |
| 9 | **QC interne** | 10 | Auto-vérification via la grille /100 |
| 10 | **Formatage** | 10 | Markdown valide, frontmatter correct, sections obligatoires présentes |

**Seuil d'acceptation** : Score ≥ 70/100 pour un jour "publiable". Score < 70 nécessite une révision avant intégration.

### 7.3. Références & liens utiles

| Référence | Lien |
| :--- | :--- |
| Dépôt principal | `https://github.com/Adolphechris/Paradis-formation-it` |
| Branche active | `https://github.com/Adolphechris/Paradis-formation-it/tree/agents/greeting-bonjour` |
| Dépôt archivé | `https://github.com/Adolphechris/Paradis` |
| Feuille de route v2.3 | `01-feuille-de-route/feuille-de-route-v2.2.md` |
| Table des matières | `01-feuille-de-route/table-des-matieres-45jours.md` |
| Abréviations | `annexes/abreviations.md` |
| CSS customisé | `css/style.css` |

---

*Fin du Cahier des Charges v3.0 — Document maître de la plateforme PELP (PARADIS E-Learning Platform)*
