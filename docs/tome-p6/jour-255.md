# TOME P6 — Cybersécurité Expert & Red Team Avancé — Jour 255 (6h) : Projet Intégrateur S6 Partie 1 — Red Team Full-Stack : Bug Bounty Simulation, Web Exploitation Chaînée & Active Directory Compromise (Scénario Multi-Cibles)

> [!NOTE]
> **Objectif du jour :** Réaliser un **exercice Red Team complet multi-vecteurs** en conditions réalistes : simuler un engagement Bug Bounty sur une infrastructure multi-cibles (application web + AD + mobile), chaîner les vulnérabilités découvertes pour progresser de l'accès initial jusqu'au **Domain Admin**, produire un **rapport de findings** de qualité BSCP/CRTO, et documenter les remédiations dans un plan de remédiation priorisé.
>
> **Ce projet illustre le workflow complet d'un Red Team Operator senior travaillant en environnement multi-cibles — compétence universelle requise dans toutes les entreprises, banques, cabinets de conseil et gouvernements.**

---

## 1) Module — Phase de Reconnaissance (OSINT + Footprinting) (1h)

### 📖 Narration/Intuition

Tout engagement Red Team ou Bug Bounty commence par une **phase de reconnaissance rigoureuse** : identifier les actifs exposés de la cible (subdomains, ports ouverts, technologies) sans jamais toucher hors-scope. Une bonne reconnaissance fait économiser des heures de tests non productifs.

### 🛠️ Atelier Pratique

**Reconnaissance automatisée multi-outils (`recon_workflow.sh`) :**

```bash
#!/bin/bash
# Red Team Recon Workflow — Phase 1 (Passive + Active Recon)
# Usage : ./recon_workflow.sh <target_domain>

TARGET=$1
echo "[*] Démarrage de la reconnaissance sur : $TARGET"
mkdir -p recon/{subdomains,ports,urls,screenshots}

# ═══════════════════════════════════════════════════════
# PASSIVE RECON — Sans contact direct avec la cible
# ═══════════════════════════════════════════════════════

# Énumération de sous-domaines via APIs publiques
amass enum -passive -d $TARGET -o recon/subdomains/amass_passive.txt
subfinder -d $TARGET -o recon/subdomains/subfinder.txt
cat recon/subdomains/*.txt | sort -u > recon/subdomains/all_subdomains.txt
echo "[+] $(wc -l < recon/subdomains/all_subdomains.txt) sous-domaines découverts"

# Google Dorking automatisé (via CLI googler)
googler -n 20 "site:$TARGET filetype:pdf OR filetype:docx OR filetype:xlsx" > recon/google_dorks.txt 2>/dev/null

# Certificate Transparency Logs (crt.sh API)
curl -s "https://crt.sh/?q=%25.$TARGET&output=json" | \
  jq -r '.[].name_value' | sort -u >> recon/subdomains/all_subdomains.txt

# ═══════════════════════════════════════════════════════
# ACTIVE RECON — Contact direct avec les serveurs découverts
# ═══════════════════════════════════════════════════════

# Résolution DNS et détermination des hôtes actifs
cat recon/subdomains/all_subdomains.txt | dnsx -resp -o recon/subdomains/live_hosts.txt

# Scan de ports sur les hôtes actifs (top-1000 ports)
nmap -sV -T4 --top-ports 1000 -iL recon/subdomains/live_hosts.txt \
     -oA recon/ports/nmap_scan 2>/dev/null
echo "[+] Scan Nmap terminé"

# Spider des URLs avec Katana
katana -list recon/subdomains/live_hosts.txt -depth 3 -o recon/urls/all_urls.txt

# Screenshots automatiques avec Gowitness
gowitness file -f recon/subdomains/live_hosts.txt --screenshot-path recon/screenshots/

echo "[+] Reconnaissance terminée. Résultats dans ./recon/"
```

---

## 2) Module — Exploitation Chaînée (Web → Accès Initial) (2h)

### 📖 Narration/Intuition

Dans un Red Team réel, une seule vulnérabilité mène rarement à Domain Admin. La valeur ajoutée d'un Red Teamer expert est sa capacité à **chaîner des vulnérabilités** : une SSRF → vol de credentials AWS → pivot dans le réseau interne → accès à une machine Windows → Kerberoasting → Domain Admin.

### 🛠️ Atelier Pratique

**Chaîne d'attaque documentée (`attack_chain.py`) :**

```python
# ═══════════════════════════════════════════════════════
# ATTACK CHAIN SIMULÉE — Red Team S6 Projet
# ═══════════════════════════════════════════════════════
#
# ÉTAPE 1 : SSRF → Accès IMDS → Vol credentials AWS
#           ↓
# ÉTAPE 2 : AWS CLI avec credentials volés → Enumerate S3 buckets
#           ↓
# ÉTAPE 3 : Bucket S3 mal configuré → Téléchargement backup AD DB (ntds.dit)
#           ↓
# ÉTAPE 4 : Extraction hashs NTLM depuis ntds.dit avec secretsdump.py
#           ↓
# ÉTAPE 5 : Pass-the-Hash → Accès Domain Admin → Golden Ticket
#           ↓
# ÉTAPE 6 : Persistance via DCSync rights sur compte de service

import subprocess
import json

class AttackChain:
    """Simulation Red Team S6 — Multi-vector attack chain"""

    def __init__(self, target_url: str, attacker_ip: str):
        self.target = target_url
        self.attacker = attacker_ip
        self.findings = []

    def step1_ssrf_imds(self) -> dict:
        """ÉTAPE 1 : SSRF → Vol credentials AWS IMDSv1"""
        print("[*] ÉTAPE 1 — Test SSRF vers IMDS AWS")
        # Simulation de la réponse IMDSv1
        simulated_response = {
            "AccessKeyId": "ASIA3XPQRSTUV1234567",
            "SecretAccessKey": "wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY",
            "Token": "AQoXnyc4lcK4w//////////...<snip>",
            "Expiration": "2026-08-07T00:00:00Z"
        }
        self.findings.append({
            "vuln": "SSRF → IMDS",
            "cvss": 9.6,
            "severity": "CRITIQUE",
            "evidence": simulated_response
        })
        print(f"[+] Credentials AWS volés : {simulated_response['AccessKeyId']}")
        return simulated_response

    def step2_aws_enumeration(self, creds: dict) -> list:
        """ÉTAPE 2 : Énumération AWS avec credentials volés"""
        print("[*] ÉTAPE 2 — Énumération S3 avec les credentials volés")
        # Simulation des commandes AWS CLI
        aws_commands = [
            f"AWS_ACCESS_KEY_ID={creds['AccessKeyId']} aws s3 ls",
            f"AWS_ACCESS_KEY_ID={creds['AccessKeyId']} aws iam get-user",
            f"AWS_ACCESS_KEY_ID={creds['AccessKeyId']} aws s3 ls s3://company-backups-internal/",
        ]
        for cmd in aws_commands:
            print(f"  [+] Commande : {cmd}")

        discovered_buckets = ["company-backups-internal", "company-configs-dev"]
        print(f"[+] Buckets S3 découverts : {discovered_buckets}")
        return discovered_buckets

    def generate_report(self) -> str:
        """Génération automatique du rapport de findings"""
        report = f"""
# Rapport Red Team — Projet S6 Partie 1

## Executive Summary
Accès Domain Admin atteint en 4 étapes via une chaîne :
SSRF → AWS Credentials → S3 Bucket Exposure → AD Hash Dump → Domain Admin

## Findings

| # | Vulnérabilité | CVSS | Impact |
|---|--------------|------|--------|
| 1 | SSRF → AWS IMDS | 9.6 (CRITIQUE) | Vol credentials IAM |
| 2 | S3 Bucket Public | 8.5 (ÉLEVÉ) | Exposition backup ntds.dit |
| 3 | NTLM Hash Dump | N/A | Accès Domain Admin |

## Plan de Remédiation

| Priorité | Remédiation | Délai |
|----------|-------------|-------|
| P0 | Activer IMDSv2 obligatoire sur toutes les instances EC2 | 24h |
| P0 | Chiffrer et restreindre l'accès aux buckets S3 contenant des backups AD | 24h |
| P1 | Réinitialiser tous les mots de passe de domaine | 72h |
| P2 | Déployer PAM (Privileged Access Management) | 30 jours |
"""
        return report

# Exécution
chain = AttackChain("https://target-company.com", "10.0.0.1")
creds = chain.step1_ssrf_imds()
buckets = chain.step2_aws_enumeration(creds)
print(chain.generate_report())
```

---

## 3) Module — Production du Rapport Red Team (3h)

### 🛠️ Template de Rapport Red Team Professionnel

```markdown
# RAPPORT RED TEAM — Projet Intégrateur S6 Partie 1
**Date :** 2026-08-07
**Classification :** CONFIDENTIEL — TLP:RED
**Équipe Red Team :** PARADIS IT Security Lab

---

## Résumé Exécutif (Executive Summary)
Lors de cette simulation Red Team de 6 heures, l'équipe a réussi à progresser
de **l'accès anonyme Internet jusqu'aux droits Domain Admin** du domaine Active
Directory cible via une chaîne d'exploitation de 5 vulnérabilités enchaînées.

**Impact global :** Compromission totale de l'infrastructure IT de l'organisation,
incluant l'accès à l'ensemble des données clients, systèmes financiers et emails.

---

## Chronologie de l'Attaque (Attack Timeline)

| Heure | Étape | Action |
|-------|-------|--------|
| H+00 | Reconnaissance | Découverte de 47 sous-domaines, 3 ports critiques |
| H+01 | Accès Initial | SSRF sur /api/webhook → Vol credentials AWS (P0) |
| H+02 | Pivot Cloud | S3 Bucket mal configuré → Téléchargement ntds.dit |
| H+03 | Persistance AD | DCSync rights → Golden Ticket KRBTGT (P0) |
| H+04 | Post-Exploitation | Accès complet à 847 comptes AD + serveurs critiques |

---

## Findings Détaillés

### FINDING-001 — CRITIQUE — SSRF AWS IMDS
**CVE/CVSS :** CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:C/C:H/I:L/A:N = **9.6**
**Endpoint vulnérable :** POST /api/v1/integrations/webhook
**Remédiation :** Activer IMDSv2 obligatoire + blocage des requêtes vers 169.254.0.0/16

### FINDING-002 — ÉLEVÉ — S3 Bucket Exposition
**CVSS :** 8.5
**Remédiation :** Activer S3 Block Public Access au niveau account + chiffrement SSE-KMS

---

## Plan de Remédiation Priorisé

| Priorité | Finding | Effort | Délai |
|----------|---------|--------|-------|
| **P0 - CRITIQUE** | SSRF IMDS + Golden Ticket | Faible | 24h |
| **P1 - ÉLEVÉ** | S3 Exposition + Réinitialisation mdp | Moyen | 72h |
| **P2 - MOYEN** | Déploiement PAM + Zero Trust | Élevé | 30 jours |
```

---

## 🏅 Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **TLP** | Traffic Light Protocol — Protocole de classification de sensibilité des informations partagées |
| **OSINT** | Open Source Intelligence — Renseignement à partir de sources ouvertes |
| **PAM** | Privileged Access Management — Gestion des accès privilégiés (ex: CyberArk, BeyondTrust) |
| **ntds.dit** | NT Directory Services Database — Base de données Active Directory contenant tous les hashs NTLM |
| **PTH** | Pass-the-Hash — Technique d'authentification utilisant le hash NTLM sans connaître le mot de passe |

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
