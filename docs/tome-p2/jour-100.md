# TOME P2 — Réseaux & Télécoms — Jour 100 (6h) : Projet Intégrateur Semestre 2 (Final) — Architecture Globale SecDevOps, Cloud Hybride & Data Resilience

> [!NOTE]
> **Objectif du jour :** Examen final de synthèse du Semestre 2 (J51 à J100) : concevoir, documenter et soutenir l'Architecture Globale de la Banque Centrale du Congo (BCC) combinant Réseaux Avancés (BGP/OSPF), Cloud Hybride (AWS VPC/Direct Connect), SecDevOps, Observabilité, ZTA et Data Analytics.
>
> **Compétences visées :** `PRO-01` (A) — Capstone Project & Master Architecture | `SEC-04` (A) — Architecture Global SI | `POL-01` (A) — Stratégie SI & Résilience

---

## 1) Module — Master Architecture du Système d'Information BCC (2h)

### 📖 Narration/Intuition

Félicitations ! Vous êtes arrivés au terme des **100 premiers jours de formation (Fin du Tome P2)**.

En tant qu'**Architecte Principal du Système d'Information de la Banque Centrale**, vous devez présenter à la Haute Direction la synthèse complète de l'architecture cible du SI de la BCC. Ce système interconnecte le Datacenter Central, les Agences Régionales, le Cloud Hybride et le réseau bancaire international (SWIFT/RTGS).

### 🔍 Anatomie Technique

**Master Diagramme d'Architecture Globale (BCC SI - Tome P2) :**

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ 1. INFRASTRUCTURE WAN & SD-WAN MULTI-SITES (J61-J70)                        │
│    - BGP (AS 64512) ↔ Opérateurs (MTN / Vodacom)                            │
│    - OSPF Multi-Area (Backbone Area 0 + Stub Areas Agences)                 │
│    - SD-WAN Failover automatique + QoS DiffServ/DSCP (EF VoIP, AF21 RTGS)   │
└─────────────────────────────────────┬───────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ 2. SÉCURITÉ PÉRIMÉTRIQUE & ZERO TRUST (J69, J93)                            │
│    - IDMZ Multi-niveaux + NGFW (Suricata Inline IPS)                        │
│    - Micro-segmentation WireGuard Mesh (10.200.0.0/16)                      │
│    - Attestation cryptographique des Workloads (SPIFFE/SPIRE SVID)          │
└─────────────────────────────────────┬───────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ 3. COEUR DE RÉSEAU & HAUTE DISPONIBILITÉ (J61, J84)                          │
│    - Cluster HAProxy L4/L7 + Keepalived VRRP (VIP 10.0.10.100)              │
│    - Kubernetes Production Cluster (Namespaces isolés, NetworkPolicies)    │
│    - IAM Centralisé Keycloak OIDC / OAuth2 + MFA (J82)                       │
└─────────────────────────────────────┬───────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ 4. DONNÉES, OBSERVABILITÉ & RÉSILIENCE (J75, J77, J83, J88, J91, J99)        │
│    - PostgreSQL HA + Chiffrement pgcrypto (AES-256)                         │
│    - Ingestion Kafka + Détection de Fraude Neo4j Cypher Graph               │
│    - Observabilité 3 Piliers : Prometheus (Metrics), ELK (Logs), Jaeger (Traces)│
│    - Sauvegardes Immuables Restic WORM S3 + Site PRA (RPO=0, RTO<15m)       │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2) Module — Matrice de Synthèse des 50 Leçons du Tome P2 (2h)

### 📖 Narration/Intuition

La maîtrise des concepts exige une vision claire de la correspondance entre les besoins métier, les briques technologiques et les commandes d'administration.

### 🔍 Anatomie Technique

**Tableau Récapitulatif des Compétences Clés du Semestre 2 (J51-J100) :**

| Bloc d'Enseignement | Thèmes Principaux | Outils & Protocoles Majeurs |
|:---|:---|:---|
| **J51 - J60** | Automation, Linux & Scripting | Bash, Python, Git, Systemd, SSH Hardening |
| **J61 - J70** | Réseaux & Télécoms Avancés | OSPF, BGP, VRRP, QoS (DSCP), Wireshark, SNMPv3, SD-WAN, DMZ |
| **J71 - J80** | SecDevOps, Cloud & Systems | OWASP Top 10, REST API, Docker, GitHub Actions, K8s, Terraform, Ansible |
| **J81 - J90** | Sécurité OS, IAM & HA | Kernel Hardening, Keycloak OIDC, Prometheus, HAProxy, Pentesting, Volatility, PRA |
| **J91 - J100** | Data, Cloud Hybride & PQC | Kafka, AWS VPC, Zero Trust (SPIFFE), Serverless, AI/ML, PySpark, Neo4j, PQC (ML-KEM) |

---

## 3) Module — Examen de Validation & Clôture du Tome P2 (2h)

### 📖 Narration/Intuition

Cet examen final permet de valider le franchissement du niveau **Master Architecte Réseaux & Sécurité Junior (100 Jours)**.

### 🔍 Anatomie Technique

**Script de Validation Globale du Tome P2 (`validate_tome2_master.py`) :**

```python
#!/usr/bin/env python3
"""
validate_tome2_master.py — Contrôle de validation du Master P2 (100 Jours)
"""
import sys

def valider_acquis_tome2():
    domaines = {
        "Réseaux & Routage (OSPF/BGP/VRRP/SD-WAN)": 100,
        "Sécurité Périmétrique & Zero Trust (NGFW/ZTA)": 100,
        "DevSecOps & Orchestration (Docker/K8s/CI-CD)": 100,
        "IAM & Authentification (OAuth2/OIDC/Keycloak)": 100,
        "Observabilité & SIEM (Prometheus/ELK/Jaeger)": 100,
        "Ingestion & Graph Analytics (Kafka/Neo4j)": 100,
        "Résilience & PRA (Restic WORM/PostgreSQL HA)": 100,
    }

    print("=========================================================")
    print("   PARADIS IT — BILAN DE VALIDATION DU TOME P2 (J100)    ")
    print("=========================================================\n")

    score_total = 0
    for domaine, score in domaines.items():
        print(f"  [✅ VALIDÉ] {domaine:48s} : {score}%")
        score_total += score

    moyenne = score_total / len(domaines)
    print("\n---------------------------------------------------------")
    print(f"  SCORE GLOBAL DU SEMESTRE 2 : {moyenne:.1f}%")
    print("  STATUT : 🎓 NIVEAU MASTER ARCHITECTE P2 CERTIFIÉ !")
    print("=========================================================\n")

if __name__ == "__main__":
    valider_acquis_tome2()
```

---

## 🏅 Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **Tome P2** | Deuxième volume du cursus PARADIS IT (Semestre 2 — J51 à J100) |
| **NPIP** | Nouvelle Plateforme Interbancaire de Paiement |
| **BCC** | Banque Centrale du Congo |

---

## 🏋️ Exercices & Corrigés

**Exercice 1 :** Quelle est l'articulation entre le routage dynamique BGP/OSPF (J62-J63), l'architecture Zero Trust (J93) et le plan de reprise d'activité PRA (J88) dans l'architecture globale de la BCC ?

**Corrigé :**
- **OSPF / BGP** assurent l'interconnexion physique et logique haute performance (L3) entre le Datacenter Siège, les agences et le Cloud Hybride avec basculement dynamique de routes.
- **Zero Trust (WireGuard / SPIFFE)** s'insère par-dessus ce réseau physique : il retire toute confiance implicite à ces routes L3 et impose le chiffrement mTLS point-à-point et l'authentification cryptographique de chaque microservice.
- **Le PRA** s'appuie sur le BGP (pour basculer les préfixes IP/DNS en cas de sinistre) et sur la réplication synchrone des bases de données pour garantir un RPO=0 et un RTO < 15min.

**Exercice 2 :** Quel est le bilan des compétences pratiques acquises au cours des 100 premiers jours ?

**Corrigé :** À l'issue du Jour 100 (Fin du Tome P2), l'apprenant maîtrise la chaîne complète de l'ingénierie informatique moderne : de l'administration système Linux fondamentale (J01-J50) jusqu'à la conception d'architectures d'entreprise hautement disponibles, sécurisées (DevSecOps/ZTA), observables, résilientes et adaptées aux données massives (J51-J100).

---

## ❓ Banque de Questions & Test du Jour

**Q1 :** Combien de jours d'apprentissage intensif et pratique constituent le Tome P2 de la formation PARADIS IT ?
- A) 10 jours
- B) 50 jours (Jour 51 à Jour 100)
- C) 365 jours
- D) 5 jours

**Réponse : B**

**Q2 :** Dans l'architecture cible du SI de la BCC, quel composant assure l'authentification unique (SSO) basée sur le protocole OpenID Connect (OIDC) ?
- A) Keycloak
- B) HAProxy
- C) Nmap
- D) HDFS

**Réponse : A**

**Q3 :** Quel est le rôle de la suite Prometheus + Grafana + Jaeger dans l'architecture globale ?
- A) Formater les disques durs
- B) Assurer les 3 piliers de l'observabilité (Métriques, Visualisation et Traçage distribué)
- C) Remplacer le pare-feu
- D) Envoyer des SMS

**Réponse : B**

**Q4 :** Quelle technologie permet d'effectuer des requêtes graphiques ultra-rapides pour la détection de réseaux de fraude financière complexe ?
- A) Base de données Graphe Neo4j avec langage Cypher
- B) Fichier texte Bloc-notes
- C) Tableur Excel
- D) Serveur DNS

**Réponse : A**

**Q5 :** Quelle est la prochaine grande étape du cursus PARADIS IT après le Jour 100 ?
- A) L'abandon du projet
- B) Le démarrage du Tome P3 (Semestre 3 — J101 à J150) axé sur l'Ingénierie Système Avancée, le Cloud Native & la Cybersécurité Opérationnelle
- C) La suppression des dépôts Git
- D) Le retour aux disquettes 3.5 pouces

**Réponse : B**

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
