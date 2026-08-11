# TOME P12 — Architecture Ultime, Leadership Technique & Capstone Final — Jour 585 (6h) : Simulation d'Examen Blanc Complet — 600 QCM Chrono — Full Masterclass Mock Exam

> [!NOTE]
> **Objectifs pédagogiques :**
> - Évaluer le niveau de maîtrise de l'**intégralité des 12 Semestres** (J1–J584) dans une simulation d'examen en conditions réelles
> - Identifier précisément les **lacunes résiduelles** par domaine de compétence pour orienter les révisions finales
> - S'entraîner à la **gestion du temps** sous contrainte : 600 questions en 600 minutes (1 min/question en moyenne)
> - Pratiquer le **raisonnement par élimination** et la métacognition pour maximiser le score sur les questions incertaines
>
> **Compétences visées :** Toutes compétences `BIT`, `SEC`, `DEV`, `OPS`, `MON`, `AI`, `GRC`, `POL` — Évaluation Intégrale de la Masterclass PARADIS IT

---

## Module 1 — Structure & Stratégie de l'Examen Blanc (2h)

### 📖 Contexte & Enjeux

Vous avez parcouru **584 jours de formation**. Ce jour 585 marque une étape critique : l'**examen blanc intégral**. Il ne s'agit pas d'un simple test — c'est une simulation des conditions exactes des certifications visées (AWS SAP, CKS, CISSP, CISM, OSCP).

```
STRUCTURE DE L'EXAMEN BLANC PARADIS IT — 600 QCM

  RÉPARTITION PAR DOMAINE :
  ┌─────────────────────────────────────────────────────────────────┐
  │  Sem 1–2  : Linux, Réseaux, Sécurité Fondamentale  → 80 QCM  │
  │  Sem 3–4  : Python, Scripting, Automatisation       → 60 QCM  │
  │  Sem 5–6  : Cloud AWS/GCP/Azure, Architecture       → 80 QCM  │
  │  Sem 7–8  : Kubernetes, CI/CD, Microservices        → 80 QCM  │
  │  Sem 9    : Cryptographie, PKI, Pentest OSCP        → 80 QCM  │
  │  Sem 10   : IA/ML/MLOps/LLM                         → 80 QCM  │
  │  Sem 11   : DevSecOps, GRC, SOC, DFIR               → 80 QCM  │
  │  Sem 12   : Architecture, Leadership, Frontier Tech → 60 QCM  │
  │                                              TOTAL : 600 QCM  │
  └─────────────────────────────────────────────────────────────────┘

  TIMING & RÈGLES :
  - Durée totale : 600 minutes (10 heures) — 1 min/question en moyenne
  - Questions difficiles : max 3 min — Passer et revenir
  - Seuil de réussite : 75% (450/600)
  - Aucune pénalité pour les mauvaises réponses → Toujours répondre
  - Note cible PARADIS IT : 85% (510/600) = Excellence

  STRATÉGIE DE RÉPONSE :
  1. Lire la QUESTION avant les options de réponse
  2. Éliminer les 2 distracteurs évidents
  3. Choisir entre les 2 restantes par logique
  4. Marquer les questions incertaines pour révision
  5. Ne jamais changer sa première réponse sans raison solide
```

### 🔍 Grille de Scoring par Domaine

```
PONDÉRATION DES DOMAINES (Basée sur la criticité métier)

  Domaine                  | Poids | Questions | Score cible
  ─────────────────────────┼───────┼───────────┼─────────────
  Sécurité (All)           | 25%   | 150 QCM   | ≥ 110/150
  Cloud & Architecture     | 20%   | 120 QCM   | ≥  90/120
  Kubernetes & DevOps      | 15%   | 90 QCM    | ≥  68/90
  IA/ML/MLOps              | 15%   | 90 QCM    | ≥  68/90
  Linux & Réseaux          | 15%   | 90 QCM    | ≥  68/90
  Scripting & Automation   | 10%   | 60 QCM    | ≥  45/60
  ─────────────────────────┴───────┴───────────┴─────────────
  TOTAL                            | 600 QCM   | ≥ 450/600
```

---

## Module 2 — Examen Blanc — Domaines 1–4 (150 QCM représentatifs) (2h)

> **Note pédagogique :** Ce module présente un échantillon représentatif de 50 questions couvrant les 4 premiers domaines avec difficulté progressive. Les 550 questions restantes sont générées dynamiquement par le moteur d'évaluation PARADIS.

### 🔍 Section A — Linux & Réseaux (15 Questions)

**A1.** Quelle option de la commande `rsync` permet de **compresser les données en transit** pour réduire la bande passante ?
- A) `-a` (archive)
- B) `-z` (compress) ✅
- C) `-v` (verbose)
- D) `-n` (dry-run)

**A2.** La commande `ip route add 10.10.0.0/16 via 192.168.1.1 dev eth0` ajoute une route vers :
- A) Toutes les destinations via 192.168.1.1
- B) Le réseau 10.10.0.0/16 en passant par la gateway 192.168.1.1 sur l'interface eth0 ✅
- C) L'interface eth0 uniquement
- D) Le réseau local 192.168.1.0/24

**A3.** Quel protocole remplace **ARP** pour la résolution d'adresses MAC en IPv6 ?
- A) DHCPv6
- B) ICMPv6 NDP (Neighbor Discovery Protocol) ✅
- C) RARP
- D) OSPF v3

**A4.** En OSPF, quelle zone est désignée comme la **zone backbone** obligatoire ?
- A) Zone 1
- B) Zone 255
- C) Zone 0 (Area 0) ✅
- D) Zone 100

**A5.** Le bit `s` dans les permissions `rws` d'un fichier exécutable Linux indique :
- A) Que le fichier est système.
- B) Le bit **SUID** — Le fichier s'exécute avec les privilèges du propriétaire (ex: `/usr/bin/sudo`). ✅
- C) Que le fichier est en lecture seule.
- D) Sticky bit.

**A6.** Quel algorithme est utilisé par **BGP** pour sélectionner le meilleur chemin ?
- A) Dijkstra (SPF)
- B) Bellman-Ford
- C) Best Path Selection Algorithm basé sur les attributs (AS-Path, Local Preference, MED) ✅
- D) DUAL (EIGRP)

**A7.** La commande `iptables -A INPUT -p tcp --dport 22 -m state --state NEW -m recent --update --seconds 60 --hitcount 4 -j DROP` :
- A) Autorise SSH depuis toutes les sources.
- B) Bloque les tentatives SSH brute force : drop si > 4 connexions en 60 secondes depuis une même IP. ✅
- C) Limite le débit SSH à 4 Mbps.
- D) Autorise SSH uniquement depuis 60 IPs.

**A8.** Quelle commande affiche les **10 processus les plus gourmands en RAM** sur Linux ?
- A) `ps aux | sort -k3 -rn | head -10`
- B) `ps aux | sort -k4 -rn | head -10` ✅
- C) `top -o %MEM`
- D) `lsof | head -10`

**A9.** Quel VLAN est considéré comme le **VLAN natif** sur un trunk Cisco par défaut ?
- A) VLAN 0
- B) VLAN 1 ✅
- C) VLAN 100
- D) VLAN 4095

**A10.** La valeur de **MTU (Maximum Transmission Unit)** sur Ethernet standard est de :
- A) 576 octets
- B) 1024 octets
- C) 1500 octets ✅
- D) 9000 octets (Jumbo Frames)

### 🔍 Section B — Sécurité Fondamentale (15 Questions)

**B1.** Une attaque **SQL Injection UNION-based** réussit quand :
- A) L'attaquant envoie un fichier malveillant.
- B) L'attaquant injecte une requête `UNION SELECT` pour concaténer les résultats d'une deuxième requête (ex: `' UNION SELECT username, password FROM users--`) permettant d'exfiltrer des données. ✅
- C) La base de données tombe en panne.
- D) L'attaquant utilise un DDoS.

**B2.** La technique **Pass-the-Hash (PtH)** consiste à :
- A) Casser le hash NTLM par force brute.
- B) Utiliser le hash NTLM d'un utilisateur directement pour s'authentifier sans connaître le mot de passe en clair. ✅
- C) Intercepter les paquets d'authentification Kerberos.
- D) Injecter du code dans le processus LSASS.

**B3.** Quel standard définit la **sécurité des applications web** et est maintenu par l'OWASP ?
- A) ISO 27001
- B) NIST 800-53
- C) OWASP ASVS (Application Security Verification Standard) ✅
- D) CIS Benchmarks

**B4.** En cryptographie, que signifie l'acronyme **AEAD** ?
- A) Advanced Encryption Algorithm Digest
- B) Authenticated Encryption with Associated Data — algorithme fournissant confidentialité + authentification + intégrité en une seule opération (ex: AES-GCM). ✅
- C) Asymmetric Encryption with Algorithm Derivation
- D) Advanced Error Authentication Detection

**B5.** Le protocole **DNSSEC** protège contre :
- A) Les attaques DDoS sur les serveurs DNS.
- B) Les attaques de **DNS Cache Poisoning** (empoisonnement du cache DNS) en signant cryptographiquement les enregistrements DNS. ✅
- C) La surveillance du trafic DNS par l'ISP.
- D) Les requêtes DNS non autorisées.

### 🔍 Section C — Cloud & Architecture (10 Questions)

**C1.** Dans AWS, quel service gère la **distribution de contenu statique globalement** avec un réseau de Points-of-Presence (PoP) ?
- A) AWS Direct Connect
- B) Amazon CloudFront ✅
- C) Amazon Route 53
- D) AWS Global Accelerator

**C2.** Le **CAP Theorem** stipule qu'un système distribué ne peut garantir simultanément que **2 des 3** propriétés. Lesquelles ?
- A) Cohérence, Atomicité, Partition
- B) Consistency, Availability, Partition Tolerance ✅
- C) Concurrence, Atomicité, Performance
- D) Cryptographie, Authentification, Performance

**C3.** Dans une architecture **CQRS**, la séparation fondamentale est entre :
- A) La production et la consommation de messages Kafka.
- B) Les **Commands** (opérations d'écriture modifiant l'état) et les **Queries** (opérations de lecture ne modifiant pas l'état), optimisées sur des modèles de données distincts. ✅
- C) Les services frontend et backend.
- D) Le chiffrement et le déchiffrement des données.

**C4.** Quelle métrique **SRE** mesure le ratio d'erreurs autorisé avant de déclencher un gel des déploiements ?
- A) SLI (Service Level Indicator)
- B) SLO (Service Level Objective)
- C) Error Budget ✅
- D) MTTR (Mean Time to Recovery)

**C5.** Dans le modèle **FinOps**, quelle phase suit "Inform" dans le cycle FinOps ?
- A) Optimize ✅
- B) Deploy
- C) Govern
- D) Measure

---

## Module 3 — Atelier Pratique : Quiz Engine Generator (1h30)

### 🛠️ Script Python : PARADIS Exam Engine — Score Calculator & Weak Domain Analyzer

```python
#!/usr/bin/env python3
"""
PARADIS — Exam Engine : Score Calculator & Domain Performance Analyzer
Simule le traitement des réponses d'un examen blanc 600 QCM et génère
un rapport de performance avec identification des domaines faibles.
"""
import random
from dataclasses import dataclass, field
from typing import List, Dict, Tuple
from collections import defaultdict

@dataclass
class Question:
    question_id : int
    domain      : str
    difficulty  : str   # EASY | MEDIUM | HARD
    correct_answer: int  # Index 0-3

@dataclass
class CandidateAnswer:
    question_id  : int
    given_answer : int  # Index 0-3, -1 = non répondu

class ParadisExamEngine:
    PASS_THRESHOLD    = 0.75  # 75% minimum
    EXCELLENCE_TARGET = 0.85  # 85% cible PARADIS

    DOMAINS = [
        ("Linux & Réseaux",        80),
        ("Scripting & Python",     60),
        ("Cloud & Architecture",   80),
        ("Kubernetes & DevOps",    80),
        ("Cryptographie & PKI",    80),
        ("IA/ML/MLOps",            80),
        ("DevSecOps & GRC",        80),
        ("Architecture Avancée",   60),
    ]

    def generate_exam(self) -> List[Question]:
        """Génère 600 questions aléatoires (simulation)"""
        questions = []
        qid = 1
        for domain, count in self.DOMAINS:
            for _ in range(count):
                diff = random.choices(["EASY", "MEDIUM", "HARD"], weights=[3, 5, 2])[0]
                questions.append(Question(qid, domain, diff, random.randint(0, 3)))
                qid += 1
        return questions

    def simulate_candidate(self, questions: List[Question], skill_level: float = 0.78) -> List[CandidateAnswer]:
        """
        Simule les réponses d'un candidat avec un niveau de compétence donné.
        skill_level = probabilité de répondre correctement (0.0 – 1.0)
        """
        answers = []
        for q in questions:
            # Ajustement par difficulté
            diff_modifier = {"EASY": 0.1, "MEDIUM": 0.0, "HARD": -0.12}.get(q.difficulty, 0)
            p_correct = min(1.0, max(0.0, skill_level + diff_modifier))
            if random.random() < p_correct:
                answer = q.correct_answer
            else:
                wrong_answers = [i for i in range(4) if i != q.correct_answer]
                answer = random.choice(wrong_answers)
            answers.append(CandidateAnswer(q.question_id, answer))
        return answers

    def score(self, questions: List[Question], answers: List[CandidateAnswer]) -> dict:
        """Calcule les scores global et par domaine"""
        answer_map = {a.question_id: a.given_answer for a in answers}

        domain_stats : Dict[str, Dict] = defaultdict(lambda: {"correct": 0, "total": 0, "by_diff": defaultdict(lambda: {"correct": 0, "total": 0})})

        for q in questions:
            correct = answer_map.get(q.question_id, -1) == q.correct_answer
            domain_stats[q.domain]["total"] += 1
            domain_stats[q.domain]["by_diff"][q.difficulty]["total"] += 1
            if correct:
                domain_stats[q.domain]["correct"] += 1
                domain_stats[q.domain]["by_diff"][q.difficulty]["correct"] += 1

        total_correct = sum(d["correct"] for d in domain_stats.values())
        total_questions = len(questions)
        global_score = total_correct / total_questions

        return {
            "total_questions"  : total_questions,
            "total_correct"    : total_correct,
            "global_score"     : global_score,
            "passed"           : global_score >= self.PASS_THRESHOLD,
            "excellence"       : global_score >= self.EXCELLENCE_TARGET,
            "domain_stats"     : dict(domain_stats)
        }

    def print_report(self, result: dict):
        gs = result["global_score"]
        status = "🌟 EXCELLENCE" if result["excellence"] else "✅ REÇU" if result["passed"] else "❌ RECALÉ"
        print("=" * 70)
        print(f"  🎓 PARADIS IT — RAPPORT EXAMEN BLANC (600 QCM)")
        print("=" * 70)
        print(f"  Score Global  : {result['total_correct']}/{result['total_questions']}"
              f" ({gs*100:.1f}%)  →  {status}")
        print(f"  Seuil 75%    : {'✅ ATTEINT' if result['passed'] else '❌ NON ATTEINT'}")
        print(f"  Cible 85%    : {'✅ ATTEINT' if result['excellence'] else '⚪ Non atteint'}")
        print("\n  PERFORMANCE PAR DOMAINE :")
        print(f"  {'Domaine':<30} {'Score':>8} {'%':>7} {'Statut'}")
        print(f"  {'─'*30} {'─'*8} {'─'*7} {'─'*15}")

        for domain, stats in sorted(result["domain_stats"].items(),
                                    key=lambda x: x[1]["correct"]/max(x[1]["total"],1)):
            score_pct = stats["correct"] / max(stats["total"], 1)
            bar_icon  = "🟢" if score_pct >= 0.80 else "🟡" if score_pct >= 0.65 else "🔴"
            print(f"  {domain:<30} {stats['correct']:>4}/{stats['total']:<4} {score_pct*100:>6.1f}% {bar_icon}")

        print("=" * 70)
        # Domaines faibles (< 70%)
        weak = [(d, s["correct"]/s["total"]) for d, s in result["domain_stats"].items()
                if s["correct"]/s["total"] < 0.70]
        if weak:
            print("\n  ⚠️  DOMAINES À REVOIR (< 70%) :")
            for d, pct in sorted(weak, key=lambda x: x[1]):
                print(f"     🔴 {d}: {pct*100:.1f}% — Consulter les leçons du domaine correspondant")
        print("=" * 70)


if __name__ == "__main__":
    random.seed(123)
    engine     = ParadisExamEngine()
    questions  = engine.generate_exam()
    answers    = engine.simulate_candidate(questions, skill_level=0.78)
    result     = engine.score(questions, answers)
    engine.print_report(result)
```

---

## Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **ASVS** | Application Security Verification Standard — Standard OWASP de vérification de sécurité des applications |
| **PtH** | Pass-the-Hash — Technique d'attaque utilisant un hash NTLM pour s'authentifier sans mot de passe |
| **MTTR** | Mean Time to Recovery — Temps moyen de récupération après un incident |
| **PoP** | Point-of-Presence — Nœud de distribution d'un réseau CDN proche des utilisateurs finaux |

---

## Exercices Pratiques

### Exercice 1 — Analyse d'un Score d'Examen Blanc

Un candidat obtient les résultats suivants à l'examen blanc PARADIS IT (600 QCM) :

| Domaine | Score |
|:---|:---:|
| Linux & Réseaux | 68/80 (85%) |
| Scripting & Python | 42/60 (70%) |
| Cloud & Architecture | 55/80 (69%) |
| Kubernetes & DevOps | 50/80 (62%) |
| Cryptographie & PKI | 68/80 (85%) |
| IA/ML/MLOps | 58/80 (72%) |
| DevSecOps & GRC | 72/80 (90%) |
| Architecture Avancée | 40/60 (67%) |

1. Calculez le score total et le pourcentage global.
2. Le candidat est-il reçu (seuil 75%) ? Atteint-il l'excellence (85%) ?
3. Quels sont les 3 domaines prioritaires à retravailler avant l'examen final ?

**Corrigé :**
1. Total = 68+42+55+50+68+58+72+40 = **453/600** = **75.5%**.
2. **Reçu** ✅ (75.5% > 75%). **Excellence non atteinte** (75.5% < 85%).
3. Domaines prioritaires (< 70%) : **Kubernetes & DevOps (62%)** > **Architecture Avancée (67%)** > **Cloud & Architecture (69%)**. Actions : reprendre J501-J560 pour Kubernetes, J551-J570 pour l'Architecture Avancée.

---

## Banque QCM — 5 Questions (Meta-Examen)

**Q1.** Quelle est la **stratégie optimale** face à une question d'examen difficile dont vous n'êtes pas sûr ?

- A) Passer et ne jamais revenir pour ne pas perdre de temps.
- B) Passer immédiatement en la marquant, continuer l'examen, puis y revenir si du temps est disponible à la fin. ✅
- C) Répondre au hasard sans réfléchir.
- D) Laisser la question sans réponse.

**Q2.** Dans un examen CISSP (3–4 heures, 175 questions adaptatives), quel est l'indicateur que vous avez **réussi** même si l'examen s'arrête à 125 questions ?

- A) L'examen s'arrête forcément à 125 questions en cas d'échec.
- B) Le moteur CAT (Computer Adaptive Testing) a eu suffisamment de confiance que votre niveau est bien au-dessus du seuil de compétence. ✅
- C) Vous avez répondu à toutes les questions difficiles.
- D) Le score de 125 questions est toujours supérieur à celui de 175 questions.

**Q3.** Pour maximiser sa préparation à la certification **AWS Solutions Architect Professional (SAP-C02)**, quelle approche est la plus efficace ?

- A) Mémoriser toutes les pages de documentation AWS.
- B) Combiner des examens blancs (practice tests), des labs pratiques (AWS Free Tier), et la revue systématique des questions incorrectes pour comprendre le "pourquoi". ✅
- C) Regarder uniquement des vidéos YouTube.
- D) Passer l'examen sans préparation pour "voir ce qui sort".

**Q4.** Quelle technique de **raisonnement par élimination** est la plus efficace dans un QCM à 4 options ?

- A) Choisir toujours l'option la plus longue.
- B) Éliminer d'abord les options contenant des absolus ("jamais", "toujours", "uniquement") et les distracteurs partiellement corrects, puis choisir parmi les 2 restantes. ✅
- C) Toujours choisir la réponse "C".
- D) Choisir la première option proposée.

**Q5.** Le **seuil de réussite de 75%** de la Masterclass PARADIS IT correspond à la norme de quelle certification sécurité mondialement reconnue ?

- A) AWS Cloud Practitioner (70%)
- B) CISSP (700/1000 points ≈ 70%)
- C) CompTIA Security+ (750/900 ≈ 83%)
- D) CISM (450/800 ≈ 56%) — Le seuil PARADIS 75% est plus sévère que la plupart des certifications professionnelles majeures pour assurer une excellence réelle. ✅

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
