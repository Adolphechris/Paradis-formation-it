# Radar de Compétences — Masterclass 600 Jours

## Vue d'ensemble

Le radar de compétences mesure et affiche votre progression en temps réel sur les **6 piliers d'expertise IT** couvrant l'intégralité des 12 semestres (J1 à J600) :

| Axe de Compétence | Période & Tomes | Volume Horaire | Palier / Certifications visées |
| :--- | :--- | :---: | :--- |
| **1. Systèmes Linux & Admin** | Semestre 1 (`docs/tome-p0/`) | 275 h | Linux Essentials, LPIC-1 |
| **2. Réseaux & Télécoms** | Semestre 2 (`docs/tome-p2/`) | 275 h | CCNA, Network+ |
| **3. Cloud & Kubernetes** | Semestres 3, 4, 5 (`docs/tome-p3/` à `p5/`) | 825 h | Proxmox, AWS SysOps, CKA (Kubernetes) |
| **4. Pentest & AppSec** | Semestres 6, 7 (`docs/tome-p6/`, `p7/`) | 550 h | OSCP+, CEH Master, CKS (K8s Security) |
| **5. Cryptographie & PQC** | Semestre 9 (`docs/tome-p9/`) | 275 h | PKI Enterprise, ZKP, Post-Quantique (FIPS 203/204) |
| **6. GRC, DFIR & Zero-Trust** | Semestres 8, 10, 11, 12 (`docs/tome-p8/`, `p10/` à `p12/`) | 1 100 h | CISSP, GCFA/GREM, DevSecOps, CISO (ISO 27001) |

---

## Calcul & Mise à jour dynamique

Le radar s'actualise automatiquement à chaque leçon complétée et à chaque QCM validé dans le navigateur (IndexedDB) :

- **40% de la note d'axe** : Pourcentage de journées validées dans le périmètre du semestre.
- **60% de la note d'axe** : Moyenne des scores QCM (/100) obtenus dans les modules de cet axe.

---

*Le rendu visuel du radar utilise Chart.js. Consultez votre radar dans le [Tableau de bord Étudiant](../espace-etudiant/).*
