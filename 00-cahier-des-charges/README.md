# 📚 DOCUMENTATION MACRO & CAHIER DES CHARGES — UNIVERSITÉ VIRTUELLE PARADIS IT

Ce dossier contient l'ensemble de la documentation de cadrage stratégique, technique, ergonomique et la planification en sprints pour la réalisation de la plateforme **PARADIS E-Learning Platform (PELP)**.

---

## 📑 Index des Documents de Référence

| Fichier | Description | Usage |
| :--- | :--- | :--- |
| 🚀 [`plan-de-developpement-42-sprints.md`](file:///home/adolphe/PARADIS/Paradis-formation-it/00-cahier-des-charges/plan-de-developpement-42-sprints.md) | **Plan Master de Développement en 42 Sprints Granulaires** (1-3 jours par sprint, 6 phases, livrables & critères d'acceptation). | **Feuille de route d'exécution du code** |
| 📄 [`cahier-des-charges-v3.0.md`](file:///home/adolphe/PARADIS/Paradis-formation-it/00-cahier-des-charges/cahier-des-charges-v3.0.md) | **Cahier des Charges Master v3.0** (Vision produit, contraintes PWA, typographies, architecture hybride). | **Référence Produit & Pédagogie** |
| 📄 [`cahier-des-charges-v2.0.md`](file:///home/adolphe/PARADIS/Paradis-formation-it/00-cahier-des-charges/cahier-des-charges-v2.0.md) | **Cahier des Charges Spécifique & Pointilleux v2.0** (Mode Offline PWA, Radar de compétences, Concours BCC, Prompt IA Socratique). | **Spécifications Fonctionnelles & BCC** |
| 📄 [`cahier-des-charges-merged.md`](file:///home/adolphe/PARADIS/Paradis-formation-it/00-cahier-des-charges/cahier-des-charges-merged.md) | **Annexe Technique & Opérationnelle** (Recommandations d'implémentation, plan CI/CD, tests automatisés). | **Annexe Opérationnelle** |

---

## 🎯 Principes Fondamentaux de Gouvernance
1. **Couverture à 100% (45 Jours / 630h)** : Tous les cours J1-J45 sont intégralement rédigés et QC-passés.
2. **Standard Concours BCC** : Entraînement QCM et épreuves blanches chronométrées avec correction et explications.
3. **Architecture Local-First & Supabase** : Frontend Docusaurus / MkDocs + JavaScript ES6+ + Supabase PostgreSQL (Auth, RLS, Storage) + IndexedDB (cache PWA).
4. **Zéro Secret Commité** : Injection stricte des variables d'environnement `SUPABASE_URL` et `SUPABASE_ANON_KEY` via GitHub Secrets.
