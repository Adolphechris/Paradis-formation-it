# TOME P3 — Cloud Native, DevOps & Cyberdéfense — Jour 130 (6h) : Projet Intégrateur Semestre 3 (Partie 3) — Resilient Banking Infrastructure, 5G Core & Zero-Trust SDN

> [!NOTE]
> **Objectif du jour :** Réaliser et soutenir la troisième partie du projet intégrateur de fin de bloc (J121-J130) : déploiement et validation de l'Infrastructure Réseau et Data globale de la Banque Centrale du Congo (5G SA Core, SDN Open vSwitch / VXLAN, Real-Time Linux PREEMPT_RT, Flink Stream Processing et S3 Object Lock Storage).
>
> **Compétences visées :** `PRO-01` (A) — Conduite de Projet Télécoms & Data | `BIT-04` (A) — Intégration 5G/SDN & Stream Processing | `SEC-04` (A) — Cyberdéfense des Réseaux Métiers

---

## 1) Module — Cahier des Charges & Architecture Globale Télécoms/Data (2h)

### 📖 Narration/Intuition

En tant qu'**Architecte Principal Réseaux Télécoms & Data Infrastructure** de la Banque Centrale du Congo, vous devez valider l'intégration du sous-système **BCC Resilient Infrastructure Core**.

Ce sous-système interconnecte :
1. **Un réseau mobile privé 5G SA** avec Network Slicing dédié aux agences et TPE.
2. **Un réseau virtuel logiciel SDN (Open vSwitch / VXLAN)** isolant le trafic par VNI.
3. **Un moteur d'exécution Temps Réel (Linux PREEMPT_RT)** pour le trading haute fréquence.
4. **Un pipeline d'ingestion de flux en temps réel (Apache Flink / Kafka)** avec détection de fraude.
5. **Un stockage Objet immuable (MinIO / S3 Object Lock WORM)** pour l'archivage légal.

### 🔍 Anatomie Technique

**Schéma d'Architecture Télécoms & Streaming Data (Projet J130) :**

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ 1. INFRASTRUCTURE 5G & SDN OVERLAY (J121, J126)                            │
│    - 5G Core SBA Open5GS (AMF, SMF, UPF) + Network Slicing S-NSSAI          │
│    - Open vSwitch (OVS) + Tunnels VXLAN (VNI 1001) + OpenFlow Rules         │
└─────────────────────────────────────┬───────────────────────────────────────┘
                                      │ Trafic Encapsulé & Isolé
┌─────────────────────────────────────▼───────────────────────────────────────┐
│ 2. COEUR TEMPS RÉEL & INGESTION FLUIDE (J123, J128)                         │
│    - Linux PREEMPT_RT Kernel (CPU Pinning isolcpus=2,3, SCHED_FIFO 99)      │
│    - Kafka Cluster (SASL/SCRAM-SHA-512 + TLS 1.3)                            │
│    - Apache Flink Stream Processing (Fenêtres Glissantes Sliding Windows)   │
└─────────────────────────────────────┬───────────────────────────────────────┘
                                      │ Ingestion & Sauvegardes
┌─────────────────────────────────────▼───────────────────────────────────────┐
│ 3. STOCKAGE IMMUABLE & CONFORMITÉ LÉGALE (J125, J127)                        │
│    - MinIO Object Storage (S3 API Compatible)                               │
│    - S3 Object Lock (Compliance Mode 90 jours WORM)                         │
│    - Configuration Anti-Spoofing Mail (SPF -all, DKIM RSA, DMARC p=reject)  │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2) Module — Orchestration & Test d'Intégration Globale (2h)

### 📖 Narration/Intuition

L'ensemble des briques de cette troisième phase du projet intégrateur est testé et audité via un script d'intégration Python global.

### 🔍 Anatomie Technique

**Script de Validation Globale du Projet J130 (`validate_j130_infrastructure.py`) :**

```python
#!/usr/bin/env python3
"""
validate_j130_infrastructure.py — Script de validation globale Télécoms/Data (Projet J130)
"""
import subprocess
import sys

def test_component(cmd, title):
    print(f"[+] Test d'intégration : {title}...")
    res = subprocess.run(cmd, shell=True, capture_output=True, text=True)
    if res.returncode == 0:
        print(f"    ✅ PASS : {title}")
        return True
    else:
        print(f"    ❌ FAIL : {title}")
        print(f"    Erreur : {res.stderr.strip()}")
        return False

def main():
    print("=================================================================")
    print("   VALIDATION DU PROJET INTÉGRATEUR J130 — TELECOMS & DATA CORE  ")
    print("=================================================================\n")

    checks = [
        ("ovs-vsctl show | grep -i vxlan", "1. SDN Open vSwitch & Tunnel VXLAN Active"),
        ("uname -v | grep -i PREEMPT_RT", "2. Linux Kernel Hard Real-Time PREEMPT_RT"),
        ("mc lock retention get bcc-minio/bcc-bank-backups | grep -i compliance", "3. Stockage MinIO S3 Object Lock Compliance WORM"),
        ("dig _dmarc.bcc.cd TXT +short | grep -i 'p=reject'", "4. Enregistrement DNS DMARC Anti-Spoofing (p=reject)"),
        ("tshark -h > /dev/null", "5. Outil de capture Télécoms/Network TShark Disponible")
    ]

    success = 0
    for cmd, name in checks:
        if test_component(cmd, name):
            success += 1

    total = len(checks)
    print("\n=================================================================")
    print(f"BOUCLAGE PROJET J130 : {success}/{total} briques validées.")
    if success == total:
        print("🎓 CONFORME : Projet J130 Réussi — Infrastructure Télécoms & Data Opérationnelle !")
        sys.exit(0)
    else:
        print("❌ INCOMPLET : Résolvez les échecs réseau ou stockage.")
        sys.exit(1)

if __name__ == "__main__":
    main()
```

---

## 3) Module — Grille d'Évaluation & Clôture de Phase (2h)

### 📖 Narration/Intuition

Ce module valide le dossier d'architecture technique (DAT) et la soutenance de la Phase 3.

### 🔍 Anatomie Technique

**Grille d'Évaluation Technique Phase 3 (Projet J130) :**

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       GRILLE D'ÉVALUATION — PROJET J130                     │
├───────────────────────────────────┬────────┬────────────────────────────────┤
│ Domaine d'Évaluation              │ Poids  │ Critères de Validation         │
├───────────────────────────────────┼────────┼────────────────────────────────┤
│ 1. Réseaux 5G & SDN OVS / VXLAN   │  20%   │ • Isolation S-NSSAI 5G         │
│                                   │        │ • Commutation OVS & VXLAN VNI  │
├───────────────────────────────────┼────────┼────────────────────────────────┤
│ 2. Linux Temps Réel PREEMPT_RT    │  20%   │ • Latence cyclictest < 15 µs   │
│                                   │        │ • CPU Pinning SCHED_FIFO 99    │
├───────────────────────────────────┼────────┼────────────────────────────────┤
│ 3. Streaming Data & Kafka Security│  20%   │ • Kafka SASL/SCRAM + TLS 1.3   │
│                                   │        │ • Flink Sliding Windows        │
├───────────────────────────────────┼────────┼────────────────────────────────┤
│ 4. Stockage Immuable & Messagerie │  20%   │ • MinIO S3 WORM Compliance 90d │
│                                   │        │ • DMARC p=reject & SPF -all    │
├───────────────────────────────────┼────────┼────────────────────────────────┤
│ 5. APIs Modernes & Cryptographie  │  20%   │ • gRPC Protobuf mTLS           │
│                                   │        │ • TenSEAL FHE Homomorphe       │
└───────────────────────────────────┴────────┴────────────────────────────────┘
```

---

## 🏅 Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **DAT** | Dossier d'Architecture Technique |
| **VNI** | VXLAN Network Identifier |

---

## 🏋️ Exercices & Corrigés

**Exercice 1 :** Comment le couplage entre un réseau mobile **5G SA (Network Slicing)** et un overlay **SDN VXLAN (Open vSwitch)** garantit-il l'étanchéité totale du trafic d'une banque distante ?

**Corrigé :** La **5G SA** isole le trafic radio de la banque au niveau du réseau d'accès via une tranche dédiée (S-NSSAI). Dès que le trafic atteint l'User Plane Function (UPF) du cœur 5G, il est injecté directement dans un tunnel **VXLAN** géré par **Open vSwitch (OVS)** identifié par un VNI unique (ex: VNI 1001). Le trafic est encapsulé et transporté de manière totalement isolée par rapport aux autres flux du datacenter, garantissant une étanchéité de bout en bout depuis l'antenne 5G jusqu'au serveur d'application.

**Exercice 2 :** Dans la grille d'évaluation J130, quelle est la preuve d'audit démontrant qu'aucune altération des sauvegardes bancaires n'est possible sur le stockage MinIO ?

**Corrigé :** La preuve d'audit consiste à interroger la politique de rétention du bucket avec l'outil `mc` (`mc lock retention get bcc-minio/bcc-bank-backups`). La réponse affiche le mode `Compliance` avec une durée de rétention (ex: 90 jours). En mode Compliance, les requêtes d'effacement ou de modification (`mc rm` ou `mc overwrite`) échouent systématiquement avec une erreur d'accès refusé (`AccessDenied`), prouvant l'immuabilité WORM matérielle et logicielle du stockage.

---

## ❓ Banque de Questions & Test du Jour

**Q1 :** Dans l'architecture télécoms du projet J130, quel protocole permet d'encapsuler les trames Ethernet L2 des machines virtuelles dans des paquets UDP sur le port 4789 pour transporter le réseau virtuel sur IP ?
- A) VXLAN
- B) MS Paint
- C) Disquette
- D) Câble VGA

**Réponse : A**

**Q2 :** Quel noyau Linux est requis pour garantir un ordonnancement déterministe avec une latence maximale inférieure à 15 microsecondes pour le trading bancaire ?
- A) Noyau Linux PREEMPT_RT
- B) Windows 95
- C) MS-DOS
- D) Android grand public

**Réponse : A**

**Q3 :** Quelle politique DMARC DNS (`p=...`) doit être configurée sur le domaine de la Banque Centrale pour garantir le rejet automatique par les serveurs distants de tout e-mail usurpant son identité ?
- A) `p=reject`
- B) `p=none`
- C) `p=allow`
- D) `p=test`

**Réponse : A**

**Q4 :** Quel moteur de calcul sur flux de données (Stream Processing) est utilisé dans le projet J130 pour analyser les transactions bancaires en temps réel avec des fenêtres glissantes ?
- A) Apache Flink (ou PySpark Streaming)
- B) Word
- C) Calculator
- D) Paint

**Réponse : A**

**Q5 :** Quel mode de verrouillage S3 Object Lock configuré sur MinIO garantit qu'aucune sauvegarde bancaire ne peut être modifiée ni supprimée pendant 90 jours ?
- A) Compliance Mode (WORM)
- B) Soft Mode
- C) Read Only Mode
- D) Free Mode

**Réponse : A**

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
