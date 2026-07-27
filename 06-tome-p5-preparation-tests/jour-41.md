# TOME P5 — Jour 41 (14h)

## Découpage horaire opérationnel J41
- Diagnostic des points faibles (analyse des scores J36-J40) — **2h**
- Remédiation ciblée sur les 2 domaines les plus faibles — **6h**
- Mini-simulation de validation (50 questions ciblées) — **3h**
- Correction + validation P5 + suivi P1 — **3h**

---

## 1) Diagnostic des points faibles (2h)

### Objectifs d'apprentissage
- Consolider les scores des 5 jours de test (J36-J40).
- Identifier les 2 domaines les plus faibles nécessitant une remédiation.
- Prioriser les actions de révision.

### Contenu pédagogique
- Diagnostiquer les faiblesses de la préparation aux tests.
- Organiser une remédiation structurée fondée sur des données de performance.
- Mettre en place un plan d'action pour renforcer les domaines prioritaires.

### Exercices
- Remplir le tableau de synthèse des scores.
- Appliquer la méthode de remédiation pour au moins deux domaines faibles.

### Tableau de synthèse des scores P5

| Jour | Domaine | Score cible | Score obtenu | Écart |
|---|---|---|---|---|
| J36 | P0-P2 Fondamentaux | 80% (80/100) | ___ | ___ |
| J37 | P3-A/P3-B Spécialisations | 80% (80/100) | ___ | ___ |
| J38 | P3-C/P4 Web & Cloud | 80% (80/100) | ___ | ___ |
| J39 | Poste visé QCM | 80% (160/200) | ___ | ___ |
| J40 | Simulation complète | 80% (120/150) | ___ | ___ |

### Analyse par sous-domaine (extraire de J40)

| Sous-domaine | Questions | Correctes | % |
|---|---|---|---|
| Support/Bureautique | 20 | ___ | ___% |
| Web/Git/Linux | 20 | ___ | ___% |
| Python/Algo | 15 | ___ | ___% |
| SQL/BDD | 15 | ___ | ___% |
| Réseaux | 10 | ___ | ___% |
| Bash | 10 | ___ | ___% |
| Admin sys (P3-A) | 15 | ___ | ___% |
| Data (P3-B) | 10 | ___ | ___% |
| Dev web (P3-C) | 15 | ___ | ___% |
| Cloud/Sécurité/Gouvernance | 15 | ___ | ___% |
| Anglais | 5 | ___ | ___% |

### Identification des 2 priorités

1. **Domaine faible n°1** : ________ (score: ___%)
2. **Domaine faible n°2** : ________ (score: ___%)

---

## 2) Remédiation ciblée (6h)

### Méthode pour chaque domaine faible (3h par domaine)

1. **Relecture des fiches de synthèse** du tome correspondant (30 min)
   - Identifier les concepts clés mal maîtrisés.
   - Relire les points clés et les schémas.

2. **Exercices ciblés** (1h30)
   - Refaire 20 questions du domaine dans la banque du tome.
   - Se concentrer sur les questions échouées au test précédent.
   - Comprendre la correction, pas juste mémoriser la réponse.

3. **Mini-projet/pratique** (1h)
   - Appliquer le concept dans un exercice pratique.
   - Exemples :
     - Réseaux : configurer un VPC simple, diagnostiquer un problème de connectivité.
     - SQL : écrire 5 requêtes complexes (fenêtres, CTE, jointures).
     - Python : résoudre 3 problèmes algorithmiques.
     - Sécurité : auditer une configuration avec une checklist.
     - Cloud : dessiner une architecture et justifier chaque choix.

### Ressources de remédiation par domaine

**Support/Bureautique :** Revoir J1-J3 (P0), refaire les exercices Excel (TCD, RECHERCHEV).

**Web/Git/Linux :** Revoir J2-J3 (P0), pratiquer les commandes Git et Linux en conditions réelles.

**Python :** Revoir J4-J6 (P2), plateforme d'exercices codingame/leetcode.

**SQL :** Revoir J7-J8 (P2), SQLZoo, PostgreSQL Exercises.

**Réseaux :** Revoir J9 (P2), Cisco Packet Tracer, schémas OSI/TCP-IP.

**Bash :** Revoir J10 (P2), écrire 5 scripts d'automatisation.

**Admin sys (P3-A) :** Revoir J12-J17, monter un lab Docker ou une VM Linux.

**Data (P3-B) :** Revoir J18-J22, pratiquer pandas/SQL sur un dataset Kaggle.

**Dev web (P3-C) :** Revoir J23-J28, mini-projet CRUD.

**Cloud/Sécurité/Gouvernance :** Revoir J29-J35, schémas d'architecture AWS, comparatifs.

**Anglais technique :** Revoir J33-J34, lire 3 articles techniques AWS/Medium en anglais, rédiger un post-mortem.

---

## 3) Mini-simulation de validation (3h)

### Format
- **50 questions ciblées** sur les 2 domaines faibles identifiés (25 questions par domaine).
- **2h chronométrées** (1h par domaine).
- Même format que J40 : QCM + ouvertes + cas.

### Objectif
- Score >= 80% (40/50) sur les domaines remédiés pour valider la progression.

### Exemple de tirage ciblé (si domaine faible = Réseaux)

1. QCM: Le port standard HTTPS est... A) 443 B) 80 C) 22 D) 25
2. QCM: DNS traduit... A) nom de domaine → IP B) IP → nom de domaine C) email D) fichier
3. QCM: Un sous-réseau /24 contient... A) 256 adresses B) 128 C) 512 D) 1024
4. QCM: TCP est... A) fiable, orienté connexion B) non fiable C) de messagerie D) lent
5. Ouverte: différence entre TCP et UDP.
6. QCM: DHCP attribue... A) des IP dynamiquement B) des DNS C) des emails D) rien
7. QCM: `traceroute` montre... A) le chemin des paquets B) la vitesse C) le DNS D) rien
8. QCM: Le 3-way handshake TCP est... A) SYN, SYN-ACK, ACK B) ACK, SYN, FIN C) GET, POST, PUT D) rien
9. Cas: `ping google.com` fonctionne mais pas le navigateur. Diagnostic ?
10. QCM: `tcpdump` capture... A) les paquets réseau B) les logs C) les processus D) rien
11. Ouverte: décrire le modèle OSI en 7 couches.
12. QCM: ICMP est utilisé par... A) ping B) HTTP C) FTP D) SSH
13. QCM: Un VLAN permet de... A) segmenter un réseau physique B) accélérer le CPU C) sauvegarder D) rien
14. QCM: Une adresse 169.254.x.x indique... A) APIPA B) IP publique C) erreur D) rien
15. Ouverte: comment fonctionne un VPN ?
16. QCM: CIDR /24 correspond au masque... A) 255.255.255.0 B) 255.0.0.0 C) 255.255.0.0 D) rien
17. QCM: Le port SSH est... A) 22 B) 80 C) 443 D) 21
18. Cas: `nslookup monsite.com` retourne NXDOMAIN. Signification ?
19. QCM: Un firewall stateful... A) garde l'état des connexions B) bloque tout C) ne fait rien D) est lent
20. Ouverte: différence entre HTTP et HTTPS.
21. QCM: BGP est un protocole de... A) routage B) messagerie C) transfert de fichiers D) rien
22. QCM: Un proxy... A) intermédiaire entre client et serveur B) un type de câble C) un OS D) rien
23. Cas: un serveur web est lent. Quelles métriques réseau vérifier ?
24. QCM: `ss -tlnp` affiche... A) les ports en écoute B) les fichiers C) les utilisateurs D) rien
25. Ouverte: expliquer le concept de subnetting.

---

## 4) Correction + validation P5 + suivi P1 (3h)

### Correction de la mini-simulation
- Score domaine 1 : ___/25 (___%)
- Score domaine 2 : ___/25 (___%)
- Score total : ___/50 (___%)

### Validation P5
- Si >= 80% sur les domaines remédiés : **P5 validé avec succès**.
- Si < 80% : plan de remédiation continue (révisions auto-gérées).

### Bilan final P5

| Indicateur | Valeur |
|---|---|
| Jours de préparation | J36-J41 (6 jours, 84h) |
| Questions traitées | 700+ (J36-J40) + 50 (J41) |
| Simulations d'entretien | 2 (J39 + J40) |
| Domaines couverts | 11 |
| Score moyen cible | >= 80% |

### 🏆 FÉLICITATIONS — TOME P5 TERMINÉ

Tu as complété la préparation intensive aux tests et entretiens. Les points clés acquis :
- Maîtrise des 11 domaines du programme PARADIS
- Capacité à répondre à des QCM, questions ouvertes, et cas pratiques en conditions chronométrées
- Expérience de simulations d'entretien technique avec feedback
- Confiance et méthode pour aborder les tests de recrutement

**Prochaine étape : Tome P6 — Portfolio final et consolidation (J42-J43).**


---

## Validation qualité J41 — Remédiation finale (anti-superficiel)

### Grille d'évaluation (sur 100 points)
- Diagnostic des points faibles (analyse des scores J36-J40) : **15 pts**
- Remédiation ciblée (2 domaines faibles traités) : **30 pts**
- Mini-simulation validation (50 questions, ≥ 80%) : **35 pts**
- Correction + débriefing + plan de progression : **20 pts**

### Seuil attendu
- **>= 80/100** : P5 validé. Fin de parcours PARADIS. Passage à la Célébration et Projection (J45).
- **65-79/100** : Remédiation ciblée sur les modules < 70%, puis re-simulation 48h plus tard.
- **< 65/100** : Révision approfondie de tous les tomes, puis re-simulation complète avant validation.

### Check-lists de validation finale
- [ ] Score moyen cumulé J36-J40 ≥ 80%
- [ ] Tous les domaines ≥ 70% (aucun domaine en dessous de ce seuil critique)
- [ ] Capacité à expliquer oralement 5 concepts clés (Python, SQL, Linux, réseau, sécurité) en 2 minutes chacun
- [ ] Portfolio contenant au minimum 3 preuves de projets déployés
- [ ] CV mis à jour avec toutes les compétences P0-P4 documentées
- [ ] Pitch de 90 secondes prêt et répété (parlé à voix haute, chronométré)
- [ ] Plan de remédiation post-PARADIS identifié (certifications, veille, projets personnels)

### Ajout de questions complémentaires — remédiation ciblée J41

**Domaine Support/Bureautique (questions supplémentaires 61-70) :**
61. QCM : Un SLA informatique définit... A) un prix B) un engagement de niveau de service C) un logiciel
62. Ouverte : Explique la différence entre un incident (P1) et un problème (P1) en ITIL
63. QCM : Le principe du moindre privilège signifie... A) donner tous les droits B) donner le strict minimum nécessaire C) ne rien donner
64. Ouverte : Comment expliquer un écart de salaire entre un profil junior et senior en entretien ?
65. QCM : Un runbook est... A) un livre de recettes B) une procédure documentée pour exécuter une tâche C) un type de serveur
66. Ouverte : Décris en 3 lignes comment tu diagnostiquerais un poste lent
67. QCM : La méthode RCA (Root Cause Analysis) sert à... A) trouver la cause profonde B) cacher les problèmes C) blâmer un collègue
68. Ouverte : Donne un exemple de mesure corrective que tu as prise après un incident
69. QCM : ITSM =... A) informatique de service B) gestion structurée des services et incidents IT C) un outil de ticketing
70. Ouverte : Pourquoi documenter chaque action d'administration dans un ticket ?

**Domaine Développement Web (questions supplémentaires 71-80) :**
71. QCM : REST signifie... A) Really Easy Software Tools B) Representational State Transfer C) Rapid Execution System Test
72. QCM : Une API REST utilise généralement... A) SOAP B) HTTP + JSON C) FTP
73. QCM : Un status code HTTP 404 signifie... A) serveur en panne B) page non trouvée C) erreur de syntaxe
74. Ouverte : Différence entre GET et POST en HTTP
75. QCM : JSON est... A) un langage de programmation B) un format d'échange de données C) un système de fichiers
76. Ouverte : Qu'est-ce qu'un CORS error et comment le résoudre ?
77. QCM : Le pattern MVC signifie... A) Model-View-Controller B) Multiple Variable Configuration C) Machine Virtual Computing
78. Ouverte : Pourquoi utiliser un système de versionnage (Git) en développement ?
79. QCM : Un package.json contient... A) le code source B) les métadonnées et dépendances du projet C) uniquement des images
80. Ouverte : Différence entre frontend et backend dans une application web

**Domaine Cloud & Sécurité (questions supplémentaires 81-90) :**
81. QCM : Un VPC est... A) un pare-feu B) un réseau privé virtuel dans le cloud C) un système d'exploitation
82. QCM : IAM signifie... A) Internet Architecture Model B) Identity and Access Management C) Integrated Application Management
83. QCM : La conformité RGPD concerne... A) uniquement les banques B) toute organisation traitant des données personnelles de résidents UE C) uniquement le gouvernement
84. Ouverte : Explique la différence entre sauvegarde et réplication en cloud
85. QCM : Un multi-AZ déploie des ressources dans... A) un seul datacenter B) plusieurs zones de disponibilité C) uniquement en local
86. Ouverte : Qu'est-ce qu'un SLO et comment se distingue-t-il d'un SLA ?
87. QCM : KMS sert à... A) gérer des machines B) gérer des clés de chiffrement C) gérer des clés USB
88. Ouverte : Comment vérifier qu'un bucket S3 est bien privé ?
89. QCM : Un WAF protège contre... A) les virus B) les attaques web (XSS, SQLi, etc.) C) les pannes matérielles
90. Ouverte : Explique en une phrase pourquoi Zero Trust est plus sûr que le modèle périmètre

**Domaine Data / Analyse (questions supplémentaires 91-100) :**
91. QCM : pandas est une bibliothèque Python pour... A) jeux vidéo B) manipulation de données C) dessin graphique
92. QCM : Un DataFrame pandas est... A) un tableau Excel B) une structure tabulaire en mémoire C) un fichier JSON
93. Ouverte : Quelle est la différence entre `merge` et `concat` dans pandas ?
94. QCM : `dtypes` en pandas affiche... A) les dates B) les types de données de chaque colonne C) les dimensions
95. Ouverte : Comment gérer les valeurs manquantes (NaN) dans un DataFrame ?
96. QCM : SQL analytique = `SELECT dept, COUNT(*) FROM employees GROUP BY dept` produit... A) une erreur B) le nombre d'employés par département C) tous les employés triés
97. Ouverte : Qu'est-ce qu'un data pipeline ?
98. QCM : `plot()` dans pandas génère... A) une table B) un graphique C) un fichier HTML
99. Ouverte : Comment choisir entre une visualisation en barres et en lignes ?
100. Ouverte : Décris en 3 phrases une analyse exploratoire complète de départ


