# TOME P11 — DevSecOps, Cloud Security & Gouvernance — Jour 548 (6h) : Retours d'Expérience & Leçons Apprises : Post-Mortem d'Intrusions Majeures & Blameless Culture

> [!NOTE]
> **Objectifs pédagogiques :**
> - Analyser en détail l'anatomie et les leçons tirées d'**intrusions majeures de l'histoire moderne** : Equifax (2017), Capital One (2019), NotPetya (2017) et Kaseya VSA (2021)
> - Maîtriser la méthodologie d'analyse **Post-Mortem sans blâme (Blameless Post-Mortem)** pour transformer les failles en améliorations systémiques
> - Rédiger un **Rapport REX (Retour d'Expérience)** professionnel avec timeline, cause racine (Root Cause Analysis - 5 Pourquoi), et plan d'action correctif
> - Extraire des règles de détection et des contrôles préventifs durables à partir d'incidents réels
>
> **Compétences visées :** `SEC-08` (A), `POL-03` (A) — Post-Mortem Analysis & Incident Lessons Learned

---

## Module 1 — Post-Mortem d'Intrusions Majeures de l'Histoire IT (2h)

### 📖 Intuition & Narration

"Ceux qui ne peuvent se rappeler le passé sont condamnés à le répéter." — George Santayana.

Chaque cyberattaque d'envergure est une démonstration coûteuse mais précieuse des failles de nos architectures. Analyser les échecs des autres est le moyen le plus efficace et le moins cher d'élever le niveau de sécurité de sa propre organisation.

### 🔍 Études de Cas — 4 Intrusions Majeures

```
ANALYSE DE 4 INTRUSIONS HISTORIQUES MAJEURES

  1. EQUIFAX (2017) — 147 millions de personnes impactées
     • Vecteur d'entrée : Vulnérabilité Apache Struts (CVE-2017-5638) non patchée sur un serveur web public.
     • Cause d'amplification : Certificat TLS expiré sur l'outil d'inspection réseau (IDS) → exfiltration non détectée pendant 76 jours.
     • Leçons : Gestion des patchs critique + renouvellement automatique des certificats d'inspection.

  2. CAPITAL ONE (2019) — 106 millions de clients impactés
     • Vecteur d'entrée : SSRF (Server-Side Request Forgery) sur un WAF ModSecurity mal configuré hébergé sur AWS EC2.
     • Cause d'amplification : Le WAF utilisait un rôle IAM sur-privilégié (`EC2-Read-S3-ReadOnly`) permettant de lister et lire 700+ buckets S3.
     • Leçons : Principe du moindre privilège IAM dans le cloud + protection IMDSv2 (metadata service).

  3. NOTPETYA (2017) — > 10 milliards de $ de dégâts mondiaux
     • Vecteur d'entrée : Supply chain via le logiciel comptable ukrainien M.E.Doc.
     • Cause d'amplification : Propagation automatique ultra-rapide via EternalBlue (SMB) et Mimikatz (WMI/psexec). Réseau plat non segmenté (Maersk).
     • Leçons : Segmentation réseau absolue + désactivation de SMBv1 + backups hors-ligne.

  4. KASEYA VSA (2021) — 1500+ entreprises chiffrées
     • Vecteur d'entrée : Zero-day SQLi + Authentication Bypass dans l'outil de gestion à distance Kaseya VSA (utilisé par des MSP).
     • Cause d'amplification : Le logiciel d'administration avait des privilèges SYSTEM sur tous les agents clients → déploiement automatique de REvil.
     • Leçons : Sécurisation renforcée des outils d'administration tiers (Supply Chain MSP).
```

---

## Module 2 — Méthodologie du Blameless Post-Mortem (2h)

### 🔍 La Culture "Blameless" (Sans Blâme)

Dans une culture **Blameless Post-Mortem** (popularisée par Google SRE et Etsy), lorsqu'une erreur survient, on pose la question : **"Quel composant du système, quel manque de formation ou quelle mauvaise procédure a permis à cette erreur d'avoir un impact ?"** au lieu de chercher "Qui a commis la faute ?".

Si vous blâmez l'humain ("l'utilisateur a cliqué sur le lien", "le dev a poussé la clé"), la conséquence immédiate est que **les employés cacheront leurs erreurs à l'avenir**, retardant la détection de la prochaine attaque.

### 🛠️ Script Python : Root Cause Analysis Engine (Méthode des 5 Pourquoi)

```python
#!/usr/bin/env python3
"""
PARADIS — Root Cause Analysis (RCA) & Post-Mortem Generator
Implémente la méthode des 5 Pourquoi pour déterminer la cause racine systémique d'un incident.
"""
from dataclasses import dataclass, field
from typing import List
from datetime import datetime

@dataclass
class ActionItem:
    description: str
    owner: str
    target_date: str
    priority: str  # P0 (Critique), P1 (Haute), P2 (Moyenne)

class PostMortemReport:
    def __init__(self, incident_title: str, incident_date: str, severity: str):
        self.title = incident_title
        self.date = incident_date
        self.severity = severity
        self.five_whys: List[str] = []
        self.action_items: List[ActionItem] = []
        self.root_cause = ""

    def add_why(self, question: str, answer: str):
        self.five_whys.append(f"Pourquoi ? {question} → Parce que : {answer}")

    def set_root_cause(self, root_cause: str):
        self.root_cause = root_cause

    def add_action(self, desc: str, owner: str, target_date: str, priority: str):
        self.action_items.append(ActionItem(desc, owner, target_date, priority))

    def generate(self):
        print("=" * 65)
        print(f"  RAPPORT POST-MORTEM (BLAMELESS REX) — PARADIS IT")
        print(f"  Titre     : {self.title}")
        print(f"  Date      : {self.date}")
        print(f"  Sévérité  : {self.severity}")
        print("=" * 65)
        print()

        print("  🔍 MÉTHODE DES 5 POURQUOI (RCA)")
        for i, why in enumerate(self.five_whys, 1):
            print(f"    {i}. {why}")
        print()

        print(f"  🎯 CAUSE RACINE SYSTÉMIQUE :")
        print(f"     {self.root_cause}")
        print()

        print("  🛠️ PLAN D'ACTION CORRECTIF (PREVENTIVE ACTIONS)")
        for action in self.action_items:
            icon = "🔴" if action.priority == "P0" else ("🟠" if action.priority == "P1" else "🟡")
            print(f"    {icon} [{action.priority}] {action.description}")
            print(f"         Responsable : {action.owner} | Échéance : {action.target_date}")
        print("=" * 65)


if __name__ == "__main__":
    rex = PostMortemReport(
        incident_title="Exposition de Clés API AWS en Pre-Production via Dépôt GitHub Public",
        incident_date="2024-03-10",
        severity="HAUTE"
    )

    rex.add_why("Les clés AWS ont été utilisées par un bot malveillant à 03h14", "Elles étaient commitées dans un dépôt GitHub public.")
    rex.add_why("Elles étaient dans le code source commité", "Un développeur a copié le fichier .env de dev dans le commit sans vérifier.")
    rex.add_why("Le fichier .env a été inclus dans le commit", "Le fichier .gitignore du projet n'incluait pas la ligne '.env'.")
    rex.add_why(".env n'était pas dans .gitignore", "Le template de projet n'imposait pas de githooks ou de pré-commit hooks automatisés.")
    rex.add_why("Aucun hook automatisé n'était en place", "Le processus de CI/CD ne scannait pas les secrets avant le push (absence de GitLeaks/TruffleHog).")

    rex.set_root_cause(
        "Absence de contrôle automatisé de détection de secrets (GitLeaks/TruffleHog) "
        "dans le pipeline CI/CD et les hooks git de l'organisation."
    )

    rex.add_action("Révocation et rotation immédiate de toutes les clés d'accès compromisses", "Équipe Cloud Sec", "2024-03-10 (T+2h)", "P0")
    rex.add_action("Intégrer GitLeaks dans tous les pipelines GitLab CI (échec si secret trouvé)", "Équipe DevSecOps", "2024-03-12", "P0")
    rex.add_action("Mettre en place TruffleHog avec détection en temps réel sur les organisations GitHub/GitLab", "Équipe SOC", "2024-03-15", "P1")
    rex.add_action("Sensibilisation équipe dev à l'utilisation d'AWS Vault et des variables d'environnement", "RSSI", "2024-03-20", "P2")

    rex.generate()
```

---

## Module 3 — Traduction du REX en Règles de Détection (1h30)

### 🔍 Boucle de Rétroaction REX → Détection

Chaque incident terminé doit alimenter le système de détection pour garantira qu'**un même scénario d'attaque ne fonctionnera jamais deux fois**.

```
BOUCLE DE RÉTROACTION INCIDENT → DÉTECTION

  INCIDENT ──→ POST-MORTEM (RCA) ──→ IOC & TTP (MITRE ATT&CK)
     ▲                                      │
     │                                      ▼
  AMÉLIORATION CONTINUE ←── ÉDITION RÈGLES SIEM/SIGMA/YARA/FALCO
```

---

## Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **REX** | Retour d'Expérience — Session d'analyse et de formalisation des leçons apprises après un projet ou un incident |
| **RCA** | Root Cause Analysis — Analyse des causes racines visant à identifier le facteur systémique initial |
| **Blameless** | Approche managériale et technique évitant la recherche de coupables individuels pour se concentrer sur les défaillances du système |
| **SSRF** | Server-Side Request Forgery — Vulnérabilité web permettant de forcer un serveur à effectuer des requêtes internes (Capital One) |
| **IMDSv2** | Instance Metadata Service Version 2 — Service AWS EC2 avec authentification par jeton pour contrer les SSRF |

---

## Exercices Pratiques

### Exercice 1 — Conduite des 5 Pourquoi

Une entreprise subit une fuite de données de 50 000 enregistrements de base de données à cause d'une injection SQL sur son formulaire de contact. Appliquez la méthode des 5 Pourquoi pour identifier la cause racine systémique.

**Corrigé guidé :**
1. **Pourquoi les données ont-elles été exfiltrées ?** → L'attaquant a exécuté une requête SQL malveillante via le champ 'Message' du formulaire de contact.
2. **Pourquoi la requête SQL a-t-elle pu s'exécuter ?** → Les entrées du formulaire étaient directement concaténées dans la requête SQL sans être assainies.
3. **Pourquoi la concaténation directe a-t-elle été utilisée ?** → Le développeur a utilisé des requêtes SQL brutes au lieu de requêtes préparées (Prepared Statements / ORM).
4. **Pourquoi l'utilisation des requêtes préparées n'a-t-elle pas été respectée ?** → Aucun linter de sécurité (SAST / Semgrep) ou règle de revue de code n'a vérifié le code avant sa mise en production.
5. **Pourquoi aucun linter de sécurité n'était en place ?** → **Cause racine systémique** : Le cycle de développement (SDLC) ne comprenait pas d'étape d'analyse statique de sécurité (SAST) obligatoire dans le pipeline CI/CD.

---

## Banque QCM — 5 Questions

**Q1.** Quel est le principe fondamental d'un **Blameless Post-Mortem** (Post-Mortem sans blâme) ?

- A) Ignorer l'incident pour ne pas froisser les équipes.
- B) Se concentrer sur l'identification des failles systémiques, organisationnelles et techniques plutôt que de chercher des coupables individuels, afin d'encourager la transparence et l'apprentissage. ✅
- C) Rejeter la responsabilité de l'incident sur un sous-traitant externe.
- D) Publier le nom des développeurs ayant commis l'erreur.

**Q2.** Dans l'attaque contre **Capital One (2019)**, quelle vulnérabilité web initiale a été combinée avec un rôle IAM sur-privilégié pour exfiltrer des buckets S3 ?

- A) Cross-Site Scripting (XSS)
- B) Server-Side Request Forgery (SSRF) sur le WAF ModSecurity ✅
- C) Injection SQL sur le portail de connexion
- D) Remote Code Execution (RCE) via Log4j

**Q3.** Pourquoi **IMDSv2** (AWS Instance Metadata Service v2) protège-t-il contre l'exfiltration de credentials via les failles SSRF ?

- A) Il chiffre tous les volumes EBS.
- B) Il exige une requête `PUT` initiale pour obtenir un jeton de session court (Session Token) avant toute requête `GET` sur les métadonnées, ce que la plupart des failles SSRF simples (GET uniquement) ne peuvent pas effectuer. ✅
- C) Il désactive totalement le service de métadonnées.
- D) Il restreint l'accès IP par adresse MAC.

**Q4.** La méthode des **5 Pourquoi (5 Whys)** sert à :

- A) Rédiger 5 questions dans un QCM de sécurité.
- B) Remonter progressivement de la cause immédiate d'un incident jusqu'à sa cause racine systémique et organisationnelle. ✅
- C) Tester 5 vulnérabilités différentes lors d'un pentest.
- D) Évaluer 5 prestataires de sécurité.

**Q5.** Dans l'incident **Equifax (2017)**, pourquoi l'exfiltration des données a-t-elle pu durer 76 jours sans être détectée par l'IDS ?

- A) L'IDS était éteint pour des raisons de coût.
- B) Le certificat TLS utilisé par l'outil d'inspection du trafic réseau avait expiré depuis 19 mois, empêchant le déchiffrement et l'analyse du trafic TLS par l'IDS. ✅
- C) L'attaquant utilisait un VPN commercial.
- D) Les logs étaient supprimés toutes les 5 minutes.

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
