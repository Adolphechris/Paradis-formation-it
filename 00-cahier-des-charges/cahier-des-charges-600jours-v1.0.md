# 📑 CAHIER DES CHARGES MASTER — PLATEFORME PELP (PARADIS E-LEARNING PLATFORM)
## Version 1.0 — Document d'Application et Spécifications Techniques (Août 2026)
### Mise en Pratique de la Constitution & Loi Fondamentale (`docs/feuille-de-route.md`)

---

### Métadonnées du document

| Champ | Valeur |
| :--- | :--- |
| **Norme Suprême de Référence** | 🏛️ **Constitution & Loi Fondamentale** (`docs/feuille-de-route.md`) |
| **Statut du présent document** | 📑 **Document d'Application & Spécifications Techniques Ultime** |
| **Version** | 1.0 (Masterclass 600 Jours) |
| **Date** | 2026-08-13 |
| **Auteur** | Équipe d'Ingénierie Pédagogique & Architecture PARADIS IT |
| **Branche git** | `main` |
| **Dépôt principal** | `Adolphechris/Paradis-formation-it.git` |
| **Site de déploiement cible** | GitHub Pages (`https://adolphechris.github.io/Paradis-formation-it/`) |
| **Static Generator** | MkDocs Material (Thème Slate/Default customisé) |
| **Périmètre Pédagogique** | 600 Jours / 12 Semestres / 5h à 6h par jour (3 300h au total) |

---

## 🏛️ 0. ALIGNEMENT CONSTITUTIONNEL ET CONFORMITÉ À LA LOI FONDAMENTALE

> [!IMPORTANT]
> **PRIMAUTÉ DE LA CONSTITUTION ET CLAUSE D'ALIGNEMENT SANS RÉSERVE :**  
> Le présent Cahier des Charges est le **document d'application et la spécification technique officielle** édictée pour mettre en pratique la **Constitution et Loi Fondamentale** de PARADIS IT (`docs/feuille-de-route.md`).
> 
> En vertu de la **Hiérarchie des Normes de PARADIS IT** :
> 1. La **Feuille de Route Ultime (`docs/feuille-de-route.md`)** prévaut sur toute autre considération technique, organisationnelle ou logicielle.
> 2. L'ensemble des **9 Modules d'Ingénierie**, des **scripts JavaScript (`docs/js/*`)**, du **schéma de données IndexedDB (v6.0)**, des **règles RLS Supabase**, du **manifeste PWA**, de la **navigation MkDocs (`mkdocs.yml`)** et des **espaces fonctionnels UI** définis dans ce document **DOIVENT STRICTEMENT RESPECTER LA CONSTITUTION ET S'Y CONFORMER SANS RESERVE**.
> 3. En cas de divergence ou de conflit d'interprétation entre le présent Cahier des Charges et la Constitution, **la Constitution fait foi de manière absolue**.

---

## 1. SYNTHÈSE EXÉCUTIVE ET CADRAGE PRODUIT

### 1.1. Vision du projet
Construire et maintenir la plateforme d'apprentissage en ligne **PELP** (PARADIS E-Learning Platform) v6.0, une infrastructure d'autoformation d'élite couvrant l'intégralité du cursus **PARADIS IT Masterclass** — 600 jours d'autoformation intensive à raison de **5 à 6 heures par jour** (3 300 heures de formation au total) répartis en 12 semestres (Tomes P0 à P12). 

La plateforme accompagne l'apprenant depuis les fondamentaux des systèmes Linux et réseaux (Niveau Bachelor BIT) jusqu'aux compétences d'Expert en Cybersécurité, DevSecOps, Cryptographie Post-Quantique et Gouvernance d'Entreprise Zero-Trust (Niveau Master Expert / CISO).

---

### 1.2. Architecture du Cursus Masterclass 600 Jours & Passerelle Semestre 0

La plateforme **PARADIS IT Masterclass** intègre le **Semestre 0 (Initiation & Socle Pré-requis J0a–J0o)** comme passerelle d'entrée facultative dédiée aux apprenants débutants absolus, avant le déroulement du cursus d'élite de **600 Jours / 12 Semestres (3 300h)** :

0. **Semestre 0 (`docs/tome-p0/`, J0a–J0o) :** 15 jours d'initiation ludique (Hardware, Binaire, Reseau, Métiers IT, Outils & Grand Examen Massif d'Entrée).
1. **Semestre 1 (`docs/tome-p0/`, J1–J50) :** Fondamentaux Linux CLI, Administration Système, Git, Docker, PKI.
2. **Semestres 2 à 6 :** Réseaux, Python/Bash, SQL, Web Full-Stack, Cloud/DevOps et Grand Projet Bachelor BIT.
3. **Semestres 7 à 12 :** Master Cybersécurité, Cryptographie PQC, DFIR, MLSecOps, DevSecOps, GRC et Grand Capstone Final.

```mermaid
graph TD
    S0[Semestre 0 : Initiation & Pré-requis J0a-J0o] --> A[Semestres 1 & 2 : Socle Système & Réseaux]
    A --> B[Semestres 3 à 6 : Python, SQL, Web & Cloud]
    B --> C[Semestres 7 à 9 : Cybersécurité Expert & Cryptographie PQC]
    C --> D[Semestres 10 à 12 : DFIR, MLSecOps, GRC & Capstone Final]
    D --> E[600 Jours — PARADIS IT Masterclass (3 300h)]
```

---

### 1.3. Contraintes et principes fondamentaux

- **Content Completeness (100% Rédigé) :** Aucun jour, aucun semestre ne doit être omis, résumé ou laissé sous forme de placeholder. Les 600 jours (J1–J600) sont intégralement rédigés et indexés dans `mkdocs.yml`.
- **Rythme d'Étude Ergonomique (5h à 6h/jour) :** Chaque journée de formation est calibrée pour un volume horaire réaliste de **5 à 6 heures d'apprentissage actif** (théorie, TP guidés, commandes pratiques et QCM).
- **Local-First Architecture :** La plateforme fonctionne à 100% hors-ligne dans le navigateur (IndexedDB + Service Worker PWA). La synchronisation vers le Cloud Supabase est optionnelle et transparente.
- **Gratuité & Open Source :** Zéro composant payant ou serveur propriétaire. Hébergement gratuit sur GitHub Pages, base de données Supabase Tier gratuit, modèles IA Gemini 1.5 Flash / DeepSeek V4 Lite.
- **Charte Typographique Stricte :**
  - **Inter** — Police d'interface UI (titres, boutons, navigation).
  - **Fira Code** — Police monospaced pour blocs de code, commandes terminal et logs.
- **Conformité WCAG 2.1 AA :** Accessibilité garantie pour les personnes en situation de handicap (contraste, lecteur d'écran, navigation clavier).

---

## 2. ARCHITECTURE TECHNIQUE & CHARTE ERGONOMIQUE

### 2.1. Stack Technologique Globale

```
┌────────────────────────────────────────────────────────────────────────┐
│                        PARADIS IT MASTERCLASS v6.0                      │
├────────────────────────────────────────────────────────────────────────┤
│ Front-End UI   : MkDocs Material (HTML5/CSS3/Vanilla JS ES2024)        │
│ Design System  : HSL Dark Slate Theme (#0a0f1d / #06b6d4 / #10b981)   │
│ Typographie    : Inter (UI) & Fira Code (Code & Terminaux)             │
│ State Engine   : Local-First IndexedDB v6.0 + localStorage Fallback   │
│ Offline / PWA  : Service Worker (sw.js) Stale-While-Revalidate         │
│ Cloud Sync     : Supabase Cloud (PostgreSQL + Auth + RLS 27 policies) │
│ Intelligence IA: Tuteur Socratique (Google Gemini 1.5 / DeepSeek V4)   │
│ Build Pipeline : Python 3.12 + MkDocs Strict Mode + GitHub Actions CI  │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 3. SPÉCIFICATIONS DES 9 MODULES D'INGÉNIERIE

### 3.1. Module 1 : Moteur de Recherche Client-Side Full-Text (`search-engine.js`)
- Indexation complète des 600 leçons via `search_index.json`.
- Recherche instantanée via raccourci clavier `Ctrl + K`.

### 3.2. Module 2 : Design System & Palette HSL (`theme-switcher.js`)
- Palette sombre futuriste avec micro-animations CSS et respect de la typographie Inter & Fira Code.

### 3.3. Module 3 : Lecteur Markdown HD & Navigation 12 Semestres (`markdown-reader.js`)
- Rendu fluide des cours des Semestres 1 à 12 avec barre de progression de la leçon.

### 3.4. Module 4 : Moteur de Progression Local-First (`progression-engine.js`)
- Suivi du statut des 600 jours (Non débuté, En cours, Validé) stocké dans IndexedDB.

### 3.5. Module 5 : Banque de QCM & Examen Blanc 600 Questions (`qcm-bank.js`, `exam-simulator.js`)
- Validation quotidienne /100 et simulateur d'Examen Blanc Chrono 2h.

### 3.6. Module 6 : Tuteur IA Socratique (`chat-widget.js`)
- Assistance pédagogique interactive couvrant les 12 semestres de la Masterclass.

### 3.7. Module 7 : Radar de Compétences 6 Axes & Portfolio Builder (`radar.md`, `portfolio.md`)
- Graphique 6 axes d'expertise et générateur de CV/Portfolio d'ingénieur.

### 3.8. Module 8 : PWA & Mode Hors-Ligne Total (`manifest.json`, `sw.js`)
- Installation PWA autonome et disponibilité 100% hors-ligne.

### 3.9. Module 9 : Moteur de Migration & Alignement Constitutionnel (`migration-engine.js`)
- Migration automatique des profils antérieurs et garantie d'alignement avec la Constitution (`docs/feuille-de-route.md`).

---

## 4. MATRICE DE RECETTE ET SUITE DE TESTS AUTOMATISÉE (`npm test`)

La plateforme est soumise à la suite de tests automatisée `scripts/test-suite.js` (160 tests, 100% de réussite) :
1. **TEST-01 : Cohérence `mkdocs.yml`** (Vérification de la présence des assets et des 12 semestres).
2. **TEST-02 : Syntaxe JavaScript (`node --check`)** (Contrôle de syntaxe sur tous les modules JS).
3. **TEST-03 : Contrats d'API (`window.ParadisXxx`)** (Exposition propre des modules).
4. **TEST-04 : Sécurité & Absence de secrets** (Scanner anti-fuite de clés API).
5. **TEST-05 : Build MkDocs Strict (`mkdocs build --strict`)** (Validation 0 lien mort sur les 600 jours).

---

## 5. CONCLUSION ET ENGAGEMENT DE CONFORMITÉ

Le présent Cahier des Charges v1.0 est le **document d'application officiel** de la plateforme **PARADIS IT Masterclass**.  
Il traduit la **Constitution (`docs/feuille-de-route.md`)** en exigences techniques et opérationnelles strictes, garantissant l'alignement sans faille de tous les composants logiciels, cours, scripts et interfaces de la plateforme.

---

*Spécifications approuvées et mises en application le 13 Août 2026 — PARADIS IT Masterclass v6.0*
