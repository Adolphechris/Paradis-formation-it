# Jour J0Q — Codes Compétences : la Grille de Progression

> [!NOTE]
> **JOUR DE TRANSITION VERS LE SEMESTRE 1 — S0→S1 (J0p–J0v)**  
> Cette leçon explique le système de codes compétences qui structure tout le parcours PARADIS. Aucun prérequis technique n'est nécessaire.

---

## 🎯 Objectifs de la Leçon
- 🗺️ Comprendre la structure des codes compétences (BIT, SEC, POL, etc.).
- 📊 Savoir lire une grille de progression.
- 🎯 Comprendre pourquoi ces codes existent (traçabilité, certification, employabilité).
- 📝 Créer son tableau de progression personnel.

---

## 📖 1. Qu'est-ce qu'un code compétence ?

Dans le parcours PARADIS, chaque journée vise un ou plusieurs **codes compétences**. C'est une étiquette standardisée qui dit : "ce jour, tu développes cette compétence précise".

**Exemple** : S1 J01 vise `BIT-02` (Administration Linux & Shell).

Les codes compétences servent à :
1. **Traçabilité** : savoir exactement ce que tu sais faire.
2. **Certification** : les certifications internationales (LPIC-1, CCNA, OSCP...) demandent ces compétences.
3. **Employabilité** : les recruteurs nord-américains (Canada/USA) cherchent ces compétences précisément.
4. **Progression** : tu vois où tu en es et où tu vas.

---

## 📖 2. Les familles de codes compétences

Le parcours utilise plusieurs familles de codes :

| Famille | Domaine | Exemples |
|---|---|---|
| **BIT** | Information Technology (fondamentaux) | BIT-01, BIT-02, BIT-03... |
| **SEC** | Sécurité informatique | SEC-01, SEC-02, SEC-03... |
| **POL** | Politique, gouvernance, conformité | POL-01, POL-02, POL-03... |
| **CLD** | Cloud computing | CLD-01, CLD-02, CLD-03... |
| **NET** | Réseaux | NET-01, NET-02, NET-03... |
| **DEV** | Développement | DEV-01, DEV-02, DEV-03... |
| **DAT** | Bases de données | DAT-01, DAT-02... |
| **INF** | Infrastructure | INF-01, INF-02... |

### Niveaux de maîtrise

Chaque code compétence a un **niveau cible** :

| Niveau | Signification | Exemple |
|---|---|---|
| **A** | Awareness (connaissance théorique) | "Je sais expliquer le concept" |
| **B** | Basic (application guidée) | "Je peux l'appliquer avec de l'aide" |
| **C** | Confirmed (autonome) | "Je peux le faire seul en production" |
| **E** | Expert (enseignement) | "Je peux former d'autres personnes" |

---

## 📖 3. Exemples concrets

### Jour S1 J01 : Prise en main Linux CLI
- Code : `BIT-02` (Administration Linux & Shell)
- Niveau cible : A (Awareness)
- Signification : "Aujourd'hui, tu apprends à reconnaître les commandes Linux de base et à naviguer dans le terminal."

### Jour S1 J03 : Permissions Linux
- Code : `BIT-02` (Administration Linux & Shell) + `SEC-01` (Gestion des identités et accès)
- Niveau cible : B (Basic)
- Signification : "Tu passes de la navigation à la sécurisation des fichiers."

### Jour S5 J201 : OSINT & Nmap Avancé
- Code : `SEC-04` (Évaluation de la sécurité réseau) + `SEC-06` (Tests d'intrusion)
- Niveau cible : B (Basic)
- Signification : "Tu apprends à cartographier la surface d'attaque d'une entreprise."

---

## 📖 4. La grille de progression complète

Voici la carte des codes compétences sur les 12 semestres :

### Semestre 1 (S1) — Bachelor BIT
| Code | Compétence | Jours concernés |
|---|---|---|
| BIT-01 | Architecture système | J07 |
| BIT-02 | Administration Linux & Shell | J01–J06, J16–J19 |
| BIT-03 | Administration Windows | J08–J09 |
| BIT-04 | Bases de données | J34–J35 |
| BIT-05 | Développement Python | J31–J33 |
| BIT-06 | Versionning Git | J36 |
| BIT-07 | Virtualisation | J21–J22 |
| BIT-08 | Réseaux TCP/IP | J11–J14 |
| BIT-09 | Sécurité système | J27–J28 |
| BIT-10 | Cloud & Conteneurs | J42–J43 |
| BIT-11 | Monitoring | J29, J43 |
| BIT-12 | Conformité | J44 |

### Semestres 2-6 (S2–S6) — Transition Bachelor→Master
| Code | Compétence | Semestre |
|---|---|---|
| NET-01 à NET-04 | Réseaux avancés (BGP, OSPF, DNS, VPN) | S2 |
| SEC-01 à SEC-04 | Sécurité offensive et défensive | S2–S6 |
| CLD-01 à CLD-03 | Cloud computing (AWS, Azure, Terraform) | S3–S4 |
| INF-01 à INF-03 | Infrastructure (K8s, IaC, monitoring) | S3–S6 |
| DEV-01 à DEV-03 | Développement sécurisé | S5–S6 |

### Semestres 7-12 (S7–S12) — Master Cybersecurity
| Code | Compétence | Semestre |
|---|---|---|
| SEC-05 à SEC-09 | Pentesting, forensics, SOC, GRC | S7–S12 |
| POL-01 à POL-04 | Gouvernance, conformité, risque | S8–S12 |
| AI-01 à AI-04 | IA/ML Security | S10–S12 |
| CRY-01 à CRY-04 | Cryptographie avancée | S9–S12 |

---

## 📖 5. Créer son tableau de progression

Créez un fichier `progression.md` dans votre dossier de travail avec ce modèle :

```markdown
# Ma Progression PARADIS

## Semestre 0 (Initiation)
- [x] J0a : Qu'est-ce qu'un ordinateur ?
- [x] J0b : Logique binaire
- ...
- [x] J0o : Examen S0 ✅ (score : __/40)

## Semestre 1 (Bachelor BIT)
- [ ] J01 : Prise en main Linux CLI (BIT-02, Niveau A)
- [ ] J02 : FHS & Liens (BIT-02, Niveau A)
- ...

## Compétences acquises
| Code | Compétence | Niveau | Date d'acquisition |
|---|---|---|---|
| BIT-02 | Administration Linux | A | J01 |
| ... | ... | ... | ... |
```

**Exercice** : Créez ce fichier maintenant et remplissez les jours S0 déjà complétés.

---

## 🧪 Atelier Pratique : Cartographier S1

Ouvrez le fichier `docs/tome-p0/jour-01.md` et repérez le code compétence dans l'en-tête :

```markdown
> **Compétences visées** : `BIT-02` (Niveau Cible: A) — Administration Linux & Shell.
```

Faites la même chose pour J02, J03, J04 (lisez uniquement les en-têtes).

**Livrable** : Tableau listant les 4 premiers codes compétences S1 avec leur niveau.

---

## ❓ Banque de QCM & Test du Jour (5 Questions)

**Q1 : Que signifie le code compétence `BIT-02` ?**
- A) Base de données
- B) Administration Linux & Shell
- C) Réseaux sans fil
- D) Intelligence artificielle

*Réponse : B — BIT-02 correspond à Administration Linux & Shell.*

**Q2 : Que signifie le code compétence `SEC-01` ?**
- A) Gestion des identités et accès
- B) Développement web
- C) Cloud computing
- D) Architecture matérielle

*Réponse : A — SEC-01 couvre la gestion des identités et accès.*

**Q3 : Que signifie le niveau cible "A" pour une compétence ?**
- A) Awareness — connaissance théorique
- B) Basic — application guidée
- C) Confirmed — autonome
- D) Expert — peut former

*Réponse : A — Niveau A = Awareness, connaissance théorique.*

**Q4 : À quoi servent les codes compétences ?**
- A) À décorer les fichiers
- B) À tracer les compétences, préparer les certifications et valoriser l'employabilité
- C) À rendre les fichiers plus longs
- D) À confondre les apprenants

*Réponse : B — Les codes compétences servent à la traçabilité, aux certifications et à l'employabilité.*

**Q5 : Dans le fichier d'un jour S1, où trouve-t-on les compétences visées ?**
- A) Dans la section QCM
- B) Dans l'en-tête, après "Compétences visées"
- C) Dans les commentaires du code
- D) À la fin du fichier

*Réponse : B — Les compétences visées sont dans l'en-tête du fichier.*

---

*Jour de Transition S0→S1 — Module J0q*
