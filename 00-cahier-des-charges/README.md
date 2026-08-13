# 📚 DOCUMENTATION MACRO & CAHIER DES CHARGES — UNIVERSITÉ VIRTUELLE PARADIS IT

Ce dossier contient l'ensemble de la documentation de cadrage stratégique, technique, ergonomique et la planification en sprints pour la réalisation de la plateforme **PARADIS E-Learning Platform (PELP)**.

---

## 📑 Index des Documents de Référence

| Fichier | Description | Usage |
| :--- | :--- | :--- |
| 👑 [`cahier-des-charges-600jours-v1.0.md`](file:///home/adolphe/PARADIS/Paradis-formation-it/00-cahier-des-charges/cahier-des-charges-600jours-v1.0.md) | **Cahier des Charges Master v1.0 — 600 Jours** (Vision 12 semestres, 8 400h, éclipsement du parcours 45j, PWA local-first). | **Référence Produit Ultime (Masterclass)** |
| 🚀 [`plan-de-developpement-42-sprints.md`](file:///home/adolphe/PARADIS/Paradis-formation-it/00-cahier-des-charges/plan-de-developpement-42-sprints.md) | **Plan Master de Développement en 42 Sprints Granulaires** (1-3 jours par sprint, 6 phases, livrables & critères d'acceptation). | **Feuille de route d'exécution du code** |
| 📄 [`cahier-des-charges-v3.0.md`](file:///home/adolphe/PARADIS/Paradis-formation-it/00-cahier-des-charges/cahier-des-charges-v3.0.md) | **Cahier des Charges v3.0 (Historique 45j)** (Archivé comme socle d'accélération initial). | **Historique & Fondations** |
| 📄 [`cahier-des-charges-v2.0.md`](file:///home/adolphe/PARADIS/Paradis-formation-it/00-cahier-des-charges/cahier-des-charges-v2.0.md) | **Cahier des Charges v2.0** (Mode Offline PWA, Radar de compétences, Prompt IA Socratique). | **Spécifications Fonctionnelles** |
| 📄 [`cahier-des-charges-merged.md`](file:///home/adolphe/PARADIS/Paradis-formation-it/00-cahier-des-charges/cahier-des-charges-merged.md) | **Annexe Technique & Opérationnelle** (Recommandations d'implémentation, plan CI/CD, tests automatisés). | **Annexe Opérationnelle** |

---

## 🎯 Principes Fondamentaux de Gouvernance
1. **Couverture à 100% (600 Jours / 8 400h)** : Tous les cours J1-J600 (Semestres 1 à 12) sont intégralement rédigés et indexés dans `mkdocs.yml`.
2. **Niveau Master Class & Certifications d'Élite** : Entraînement QCM, épreuves blanches chronométrées (600 questions) et préparatifs OSCP+, CKA/CKS, PQC, CISSP, GRC.
3. **Architecture Local-First & Supabase** : Frontend MkDocs Material + JavaScript ES6+ + Supabase PostgreSQL (Auth, RLS, Storage) + IndexedDB v6.0 (cache PWA).
4. **Zéro Secret Commité** : Injection stricte des variables d'environnement `SUPABASE_URL` et `SUPABASE_ANON_KEY` via GitHub Secrets.
