# TOME P11 — DevSecOps, Cloud Security & Gouvernance — Jour 517 (6h) : Cyber Threat Intelligence (CTI) & Threat Hunting : MISP, OpenCTI, Règles Sigma & Détection YARA

> [!NOTE]
> **Objectifs pédagogiques :**
> - Comprendre le cycle de vie de la **Cyber Threat Intelligence (CTI)** et la Pyramide de la Douleur (**Pyramid of Pain**)
> - Déployer et alimenter des plateformes CTI open-source : **MISP** (Malware Information Sharing Platform) et **OpenCTI**
> - Rédiger et partager des règles d'analyse de logs universelles **Sigma** pour la détection SIEM
> - Développer des règles **YARA** pour la recherche et l'identification de malwares sur disque et en mémoire
>
> **Compétences visées :** `SEC-04` (A), `SEC-06` (A) — Cyber Threat Intelligence & Threat Hunting

---

## Module 1 — Cyber Threat Intelligence & la Pyramide de la Douleur (2h)

### 📖 Intuition & Narration

La défense passive consiste à attendre qu'une alerte retentisse pour réagir. Le **Threat Hunting** (chasse aux menaces) est une approche proactive : l'analyste part du principe que des attaquants furtifs sont *déjà présents* dans le réseau sans déclencher d'alerte, et cherche activement des indices de leur présence en s'appuyant sur la **Cyber Threat Intelligence (CTI)**.

Pour être efficace, le chausseur de menaces s'appuie sur la **Pyramide de la Douleur (Pyramid of Pain)** de David Bianco. Cette pyramide classe les indicateurs de compromission selon la *difficulté pour l'attaquant* de modifier sa technique si cet indicateur est bloqué par la défense.

### 🔍 Anatomie Technique — La Pyramide de la Douleur & les Règles Sigma / YARA

```
LA PYRAMIDE DE LA DOULEUR (PYRAMID OF PAIN — BIANCO)

                  ┌─────────────────────────────┐
                  │    TTPs (Tactiques & Tech)  │  ◄── DOULEUR MAXIMALE (Très dur à changer)
                  ├─────────────────────────────┤      Détecté par SIGMA & MITRE ATT&CK
                  │    Tools (Outils malveillants)│
                  ├─────────────────────────────┤      Détecté par YARA RULES
                  │    Domain Names (C2)        │
                  ├─────────────────────────────┤
                  │    IP Addresses (Command&Ctrl)│
                  ├─────────────────────────────┤
                  │    Hash Values (MD5/SHA256) │  ◄── DOULEUR MINIMALE (Facile à changer)
                  └─────────────────────────────┘

ROLES DES REGLES :
  • Règle YARA  : Recherche de motifs binaires/chaînes dans des fichiers exécutables ou dumps RAM.
  • Règle SIGMA : Détection d'anomalies comportementales dans les logs SIEM (Event Viewer, Sysmon, Auditd).
```

---

## Module 2 — Atelier Pratique : Rédaction de Règles Sigma & YARA (2h)

### 🛠️ Code YAML & Python : Convertisseur & Exécuteur de Règles YARA / Sigma

```python
#!/usr/bin/env python3
"""
PARADIS — YARA & Sigma Threat Hunting Scanner
Simule le balayage de fichiers malveillants par règles YARA et de logs par règles SIGMA.
"""

import re
import sys

# ──────────────────────────────────────────────────────────────────
# 1. EXEMPLE DE RÈGLE YARA SIMULÉE (Détection de Ransomware)
# ──────────────────────────────────────────────────────────────────
YARA_RULE_RANSOMWARE = """
rule Paradis_Ransomware_Wannacry_Pattern {
    meta:
        description = "Détecte les chaînes caractéristiques d'un ransomware"
        author = "PARADIS CTI Team"
        severity = "CRITICAL"
    strings:
        $s1 = "Your files have been encrypted!" ascii wide
        $s2 = "WANCRY!" ascii
        $s3 = "Bitcoin" ascii
    condition:
        2 of ($s*)
}
"""

class ThreatHunterEngine:
    def scan_file_with_yara(self, file_content: str, file_path: str) -> bool:
        print(f"=== SCAN FORENSIQUE YARA EN COURSsur {file_path} ===")

        # Logique de matching YARA (simulée en Python)
        match_s1 = "Your files have been encrypted!" in file_content
        match_s2 = "WANCRY!" in file_content
        match_s3 = "Bitcoin" in file_content

        matches_count = sum([match_s1, match_s2, match_s3])

        if matches_count >= 2:
            print(f"[🚨 ALERTE YARA] Règle 'Paradis_Ransomware_Wannacry_Pattern' DÉCLENCHÉE !")
            print(f"    Fichier suspect : {file_path}")
            print(f"    Nombre de signatures correspondantes : {matches_count}/3")
            return True
        else:
            print("[✅ YARA SCAN] Fichier sain. Aucune signature malveillante détectée.")
            return False

    def scan_log_with_sigma(self, log_event: dict) -> bool:
        print(f"\n=== ANALYSE DE LOG SIEM AVEC RÈGLE SIGMA ===")
        # Règle Sigma simulée : Détection d'exécution de PowerShell encodé en Base64
        # EventID 4688 (Process Creation) + powershell.exe + -enc / -encodedcommand

        process_name = log_event.get("process_name", "").lower()
        command_line = log_event.get("command_line", "").lower()

        if "powershell" in process_name and ("-enc" in command_line or "-encodedcommand" in command_line):
            print(f"[🚨 ALERTE SIGMA] Règle 'Suspicious Encoded PowerShell Execution' DÉCLENCHÉE !")
            print(f"    Processus : {log_event.get('process_name')}")
            print(f"    Ligne de commande : {log_event.get('command_line')}")
            print(f"    Utilisateur : {log_event.get('user')}")
            return True

        print("[✅ SIGMA SCAN] Événement de log normal.")
        return False

if __name__ == "__main__":
    hunter = ThreatHunterEngine()

    # 1. Test YARA
    vulnerable_binary = "WARNING: Your files have been encrypted! Please send 0.5 Bitcoin to recover."
    hunter.scan_file_with_yara(vulnerable_binary, "/tmp/suspicious_payload.exe")

    # 2. Test SIGMA
    suspicious_log = {
        "event_id": 4688,
        "user": "NT AUTHORITY\\SYSTEM",
        "process_name": "C:\\Windows\\System32\\WindowsPowerShell\\v1.0\\powershell.exe",
        "command_line": "powershell.exe -ExecutionPolicy Bypass -Enc SQBFAFgAIAAoAE4AZQB3AC0AE8AYgBqAGUAYwB0ACAA...=="
    }
    hunter.scan_log_with_sigma(suspicious_log)
```

---

## Module 3 — Plateformes CTI : MISP & OpenCTI (1h30)

### 🔍 Écosystème CTI : MISP vs OpenCTI

1. **MISP (Malware Information Sharing Platform)** : Plateforme européenne open-source d'échange d'indicateurs de compromission (**IoCs** : IPs, Hashs, Domaines C2) entre certs et entreprises.
2. **OpenCTI** : Plateforme moderne de connaissance de la menace basée sur le standard **STIX 2.1** (Structured Threat Information Expression) et le langage de graphes (GraphQL), permettant de cartographier les campagnes d'attaque et les groupes d'APT (Advanced Persistent Threats).

---

## Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **CTI** | Cyber Threat Intelligence — Renseignement sur les cybermenaces |
| **IoC** | Indicator of Compromise — Indicateur de compromission (IP, Hash, Domaine) |
| **STIX** | Structured Threat Information Expression — Format standard de description de la menace |
| **MISP** | Malware Information Sharing Platform — Plateforme de partage d'IoCs |
| **APT** | Advanced Persistent Threat — Groupe d'attaquants étatiques hautement qualifiés |

---

## Exercices Pratiques

### Exercice 1 — Analyse de la Pyramide de la Douleur

Pourquoi un simple hachage MD5 ou SHA-256 se trouve-t-il au niveau le plus bas (le moins douloureux pour l'attaquant) de la Pyramide de la Douleur de David Bianco ?

**Corrigé guidé :**
Parce qu'il suffit à l'attaquant de recompiler son malware en modifiant un seul octet ou une seule chaîne de texte inutile pour changer intégralement son hash SHA-256. Cela prend 2 secondes à l'attaquant et rend obsolète tout blocage basé exclusivement sur les empreintes numériques.

---

## Banque QCM — 5 Questions

**Q1.** Qu'est-ce que le **Threat Hunting** ?

- A) Acheter de nouveaux serveurs.
- B) Une démarche pro-active de recherche d'indices de compromission et d'attaquants cachés au sein du réseau, sans attendre le déclenchement d'une alerte automatique. ✅
- C) Une compétition de jeux vidéo.
- D) La suppression des spams.

**Q2.** Quel est le sommet (le niveau le plus douloureux à modifier pour l'attaquant) de la **Pyramide de la Douleur** de David Bianco ?

- A) Les adresses IP.
- B) Les TTPs (Tactiques, Techniques et Procédures de l'attaquant). ✅
- C) Les empreintes MD5.
- D) Les noms de fichiers.

**Q3.** Quel est le rôle principal d'une règle **YARA** ?

- A) Formater le disque dur.
- B) Identifier et classifier des échantillons de malwares ou des fichiers suspects en recherchant des motifs binaires ou des chaînes de texte spécifiques. ✅
- C) Envoyer des e-mails.
- D) Configurer les pare-feux Cisco.

**Q4.** Qu'est-ce que le format **STIX 2.1** dans le domaine de la Cyber Threat Intelligence ?

- A) Un format d'image.
- B) Le langage et la structure de données internationale standardisée (JSON-based) pour exprimer et échanger des informations sur les menaces informatiques (OpenCTI / MISP). ✅
- C) Un système d'exploitation.
- D) Un protocole de réseau sans fil.

**Q5.** À quoi servent les règles **Sigma** dans un SOC ?

- A) À écrire des règles de détection d'anomalies comportementales dans les logs de façon universelle, réutilisables sur n'importe quel SIEM (Splunk, Elastic, QRadar). ✅
- B) À calculer des moyennes mathématiques.
- C) À remplacer les pare-feux.
- D) À nettoyer la base de données.

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
