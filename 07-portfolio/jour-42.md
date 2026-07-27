# TOME P6 — Jour 42 (14h)

## Découpage horaire opérationnel J42
- Sélection et tri des projets réalisés dans le programme — **3h**
- Rédaction technique des descriptifs de projets (README, contexte, compétences) — **4h**
- Mise en forme du portfolio (structure, design, navigation) — **4h**
- Publication en ligne (GitHub Pages, portfolio site) + test — **2h**
- Banque de questions + suivi P1 — **1h**

---

## 1) Sélection et tri des projets (3h)

### Objectifs d'apprentissage
- Sélectionner les projets les plus pertinents pour le poste de Professionnel du numérique.
- Organiser les preuves de compétences par domaine.
- Hiérarchiser les projets (principal, secondaires, complémentaires).

### Contenu pédagogique
- Tri et sélection des projets selon leur pertinence métier.
- Construction d'éléments de preuve clairs et valorisants.
- Organisation du portfolio pour un parcours lecteur fluide et professionnel.

### Exercices
- Compléter le tableau d'inventaire de projets.
- Rédiger les fiches projet et préparer la publication en ligne.

### Inventaire des projets réalisés dans PARADIS

| Tome | Projet | Domaine | Complexité | Portfolio ? |
|---|---|---|---|---|
| P0 | Mini-site web + dossier bureautique | Web, Bureautique | ★★☆☆☆ | Secondaire |
| P2 | Script automatisation + base de données | Python, SQL, Bash | ★★★☆☆ | Secondaire |
| P3-A | Infrastructure documentée sécurisée (4 serveurs) | Admin sys, Réseau, Sécurité | ★★★★★ | **PRINCIPAL** |
| P3-B | Analyse de données bancaires (rapport + dashboard) | Data, SQL, Visualisation | ★★★★☆ | **PRINCIPAL** |
| P3-C | TaskFlow — Application full-stack | Développement web | ★★★★★ | **PRINCIPAL** |
| P4 | Dossier de recommandation cloud sécurisé | Cloud, Sécurité, Gouvernance | ★★★★☆ | **PRINCIPAL** |
| J23 | Dashboard utilisateurs (JS vanilla) | JavaScript, DOM, API | ★★☆☆☆ | Complémentaire |
| J24 | App CRUD React (Gestion de contacts) | React, API REST | ★★★☆☆ | Secondaire |
| J25 | API REST Produits (Express + PostgreSQL) | Backend, API, DB | ★★★☆☆ | Secondaire |
| J26 | API sécurisée Notes (Prisma + JWT) | ORM, Auth, Sécurité | ★★★★☆ | Complémentaire |

### Critères de sélection
1. **Pertinence pour le poste visé** : privilégier les projets qui démontrent les compétences demandées.
2. **Complétude** : un projet terminé (code + doc + déploiement) vaut plus qu'un projet avancé mais incomplet.
3. **Variété** : couvrir les 3 grands domaines (Admin sys, Data, Développement).
4. **Impact** : un projet avec un résultat mesurable est plus impactant.

### Sélection recommandée (4 projets principaux + 3 secondaires)

**Projets principaux (portfolio) :**
1. **TaskFlow** (P3-C) — Application full-stack, démontre React + Express + PostgreSQL + JWT + déploiement.
2. **Infrastructure sécurisée** (P3-A) — 4 serveurs, schéma, sécurité, supervision, documentation.
3. **Analyse de données bancaires** (P3-B) — Rapport, dashboard, SQL analytique, visualisation, recommandations.
4. **Dossier cloud sécurisé** (P4) — Architecture AWS, sécurité, PCA, conformité, budget.

**Projets secondaires (mention dans le CV) :**
5. API sécurisée Notes (J26) — ORM, JWT, refresh tokens, sécurité.
6. Script automatisation + DB (P2) — Python, SQL, Bash.
7. Mini-site web + dossier bureautique (P0) — Fondamentaux.

### Exercice : pour chaque projet, remplir la fiche projet (nom, domaine, description 1 phrase, technos, lien GitHub, lien démo).

---

## 2) Rédaction technique des descriptifs (4h)

### Objectifs d'apprentissage
- Rédiger un README.md professionnel pour chaque projet.
- Contextualiser le projet (pourquoi, comment, résultats).
- Mettre en avant les compétences démontrées.

### Structure d'un README projet (modèle PARADIS)

```markdown
# Nom du Projet

![Badge](https://img.shields.io/badge/status-deployed-success)

## 📖 Description
[1-2 phrases : ce que fait le projet, pour qui, pourquoi]

## 🎯 Contexte
[Dans quel cadre ce projet a-t-il été réalisé ? PARADIS, autoformation, poste visé]

## 🛠️ Stack Technique
- Frontend : [technos]
- Backend : [technos]
- Base de données : [technos]
- Infrastructure : [technos]
- Sécurité : [technos]

## ✨ Fonctionnalités
- [Liste des fonctionnalités principales]

## 📸 Captures d'écran
[3-4 captures : page d'accueil, fonctionnalité clé, dashboard, déploiement]

## 🚀 Démo en ligne
[Lien vers la version déployée]

## 📦 Installation locale
```bash
git clone [repo]
cd [projet]
npm install
# configurer .env
npm run dev
```

## 🏗️ Architecture
[Schéma simplifié ou description de l'architecture]

## 📊 Compétences démontrées
- [Compétence 1] : [comment le projet la démontre]
- [Compétence 2] : [comment le projet la démontre]
- ...

## 🔒 Sécurité
[Mesures de sécurité implémentées]

## 📝 Leçons apprises
[2-3 points : ce qui a bien marché, ce qui a été difficile, ce qu'on ferait différemment]

## 📄 Licence
MIT
```

### Rédaction pour les 4 projets principaux (1h par projet)

**TaskFlow :**
- Description : "Application full-stack de gestion de tâches collaborative avec authentification JWT, dashboard temps réel, et déploiement cloud."
- Compétences : React (hooks, context, routing), Express/Node.js, Prisma ORM, PostgreSQL, JWT auth, Vercel/Render, CI/CD.

**Infrastructure sécurisée :**
- Description : "Infrastructure complète pour PME de 50 employés : 4 serveurs (Linux, Windows Server), Active Directory, supervision, sécurité."
- Compétences : Linux (systemd, logs, permissions), Windows Server/AD, Docker, pare-feu, fail2ban, Prometheus, ITIL.

**Analyse de données bancaires :**
- Description : "Analyse de données de bout en bout pour une banque : statistiques, SQL analytique, visualisation, recommandations."
- Compétences : Python/pandas, SQL (fenêtres, CTE), Power BI/Excel, statistiques descriptives, storytelling data.

**Dossier cloud sécurisé :**
- Description : "Dossier de recommandation pour la migration cloud d'une PME bancaire : architecture AWS, sécurité, PCA, conformité RGPD."
- Compétences : AWS (EC2, S3, RDS, VPC, IAM, KMS), sécurité cloud (WAF, GuardDuty), PCA/PRA, RGPD, FinOps.

---

## 3) Mise en forme du portfolio (4h)

### Objectifs d'apprentissage
- Créer un portfolio en ligne professionnel.
- Structurer la navigation pour mettre en avant les projets clés.
- Soigner le design et l'expérience utilisateur.

### Structure recommandée du portfolio

**Page d'accueil :**
- Photo/avatar professionnel
- Titre : "Professionnel du numérique | Administration systèmes • Data • Développement web"
- Pitch de 2-3 phrases résumant le parcours PARADIS
- Liens : GitHub, LinkedIn, Email

**Section "Projets" (la plus importante) :**
- 4 cartes de projets principaux avec image, titre, stack, lien démo, lien code
- Filtres par domaine (Admin sys, Data, Développement)

**Section "Compétences" :**
- Liste par domaine avec barres de progression ou tags
- Administration : Linux, Windows Server, Active Directory, Docker, Supervision
- Data : Python, SQL, pandas, Power BI, Excel
- Développement : JavaScript, React, Node.js, Express, Prisma
- Cloud : AWS (EC2, S3, RDS, Lambda), Azure, Vercel, Render
- Sécurité : JWT, OWASP, WAF, KMS, RGPD
- Méthodes : ITIL, Agile/Scrum, FinOps, PCA

**Section "Parcours" :**
- Timeline du programme PARADIS (45 jours, 630h)
- Collaboration méthodologique UNISA
- Trajectoire d'accréditation

**Section "Contact" :**
- Formulaire ou liens directs

### Outils recommandés
- **GitHub Pages** (gratuit, markdown, Jekyll) : solution la plus simple, directement liée au code.
- **Vercel** (gratuit, React/Next.js) : si on veut un portfolio plus interactif.
- **Notion/Super.so** : si on veut une solution no-code rapide.
- **LinkedIn** : mettre à jour le profil avec les projets et compétences.

---

## 4) Publication en ligne + test (2h)

### Étapes de publication (GitHub Pages)

1. Créer un repo `[username].github.io` ou utiliser le repo PARADIS existant.
2. Structurer le portfolio avec un fichier `README.md` principal ou un site statique.
3. Configurer GitHub Pages dans Settings → Pages → Source (main branch, /root ou /docs).
4. Vérifier que l'URL `https://[username].github.io` est accessible.
5. Tester sur mobile et desktop.

### Checklist de validation du portfolio

- [ ] Les 4 projets principaux sont visibles avec captures et liens
- [ ] Les liens GitHub et démo fonctionnent
- [ ] Le portfolio est responsive (mobile-friendly)
- [ ] Les informations de contact sont à jour
- [ ] Le pitch d'accroche est clair et percutant
- [ ] Pas de fautes d'orthographe
- [ ] Les compétences sont organisées et lisibles
- [ ] Le parcours PARADIS est expliqué simplement
- [ ] Le portfolio charge en moins de 3 secondes

---

## 5) Banque de questions + suivi P1 (1h)

### Vérification portfolio par un tiers
- Faire tester le portfolio par quelqu'un (ami, mentor, Claude).
- Demander : "En 30 secondes, qu'as-tu compris de mon profil ?"
- Ajuster en fonction du feedback.

### Pitch portfolio (30 secondes)
"J'ai suivi un programme intensif de 45 jours couvrant l'administration systèmes, l'analyse de données, et le développement web. Mon portfolio présente 4 projets concrets : une infrastructure sécurisée pour PME, une analyse de données bancaires, une application full-stack, et un dossier de recommandation cloud. Tout le code est sur GitHub, avec des démos en ligne."

---

## Validation qualité J42

### Livrables obligatoires
1. 4 README.md de projets principaux rédigés (TaskFlow, Infra, Data, Cloud).
2. 1 portfolio en ligne accessible (GitHub Pages, Vercel, ou autre).
3. 1 profil LinkedIn mis à jour avec les projets PARADIS.
4. 1 pitch portfolio de 30 secondes.

### 🎯 Prochaine étape : J43 — CV, argumentaire UNISA, dossier candidature.

---

## Corrigés guidés — mode tuteur (réponses attendues)

> Tu as raison : ici tu es l'étudiant.

### J42 — Portfolio

1. **Critère n°1 :** Le projet P3-A (infrastructure sécurisée) est la preuve la plus forte — 4 serveurs déployés, pare-feu configuré, supervision en place
2. **Critère n°2 :** La variété des domaines couverts (support, data, dev) démontre la polyvalence recherchée
3. **Critère n°3 :** Un projet déployé en ligne avec documentation est 10× plus crédible qu'un simple dépôt GitHub sans README
4. **Critère n°4 :** Le portfolio doit contenir 4 projets minimum (principaux) et 3 secondaires pour couvrir l'ensemble des compétences
5. **Exemple de fiche projet :** « TaskFlow — Application de gestion de tâches full-stack. Frontend React + backend Express/Node.js. Base PostgreSQL. Déployé sur Vercel (front) et Render (back). 3 commits par jour pendant 3 semaines. GitHub avec README + captures d'écran. »
6. **Erreur à éviter :** Ne pas inclure uniquement des liens sans contexte. Chaque projet nécessite un résumé écrit en 2-3 lignes montrant ce que tu as fait et le résultat
7. **Structure d'une fiche portfolio :** (1) Titre du projet, (2) Contexte et objectif, (3) Technologies utilisées, (4) Ce que tu as construit, (5) Résultat mesurable, (6) Lien GitHub + démo en ligne (si applicable)
8. **Outil de publication :** GitHub Pages (gratuit, statique) ou Netlify (gratuit, déploiement automatique depuis Git)

