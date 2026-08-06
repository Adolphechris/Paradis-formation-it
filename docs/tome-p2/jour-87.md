# TOME P2 — Réseaux & Télécoms — Jour 87 (6h) : Réponse aux Incidents & Threat Intelligence (MISP, Volatility & SANS Incident Response)

> [!NOTE]
> **Objectif du jour :** Maîtriser le processus de réponse aux incidents de sécurité selon la méthodologie SANS/NIST (Préparation, Identification, Confinement, Éradication, Recouvrement, Leçons Apprises), l'analyse mémoire légale avec Volatility, et l'échange d'indicateurs de compromission (IoC) avec la plateforme MISP.
>
> **Compétences visées :** `SEC-06` (A) — Réponse aux Incidents & Forensique | `POL-03` (A) — Threat Intelligence & Gestion de Crise

---

## 1) Module — Le Cycle de Réponse aux Incidents (NIST / SANS Framework) (2h)

### 📖 Narration/Intuition

Lorsqu'un ransomware s'infiltre dans le réseau de la BCC ou qu'une exfiltration de données bancaires est détectée, la panique est le pire ennemi. L'équipe de réponse aux incidents (DFIR / CSIRT) doit appliquer une **procédure méthodique et répétable** pour stopper l'attaque sans détruire les preuves numériques nécessaires à l'enquête.

Le framework de réponse aux incidents SANS/NIST définit 6 étapes incontournables.

### 🔍 Anatomie Technique

**Les 6 Étapes du Cycle de Réponse aux Incidents (SANS Framework) :**

```
┌─────────────────────────────────────────────────────────────┐
│ 1. PRÉPARATION                                              │
│    - Déploiement des outils (SIEM, EDR, kits de collecte)   │
│    - Établissement des procédures et chartes d'escalade     │
└─────────────────────────────┬───────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. IDENTIFICATION (DÉTECTION)                               │
│    - Détection de l'anomalie (alertes SIEM, logs, rapport)  │
│    - Triage, confirmation de l'incident et périmètre        │
└─────────────────────────────┬───────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. CONFINEMENT (CONTAINMENT)                                │
│    - Court terme : Isoler les machines infectées du réseau  │
│    - Long terme : Révoquer les accès compromis, modifier FW │
└─────────────────────────────┬───────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│ 4. ÉRADICATION                                              │
│    - Suppression des malwares, portes dérobées (backdoors)  │
│    - Correction des vulnérabilités exploitées               │
└─────────────────────────────┬───────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│ 5. RECOUVREMENT (RECOVERY)                                  │
│    - Restauration des systèmes depuis des sauvegardes saines│
│    - Remise en service sous surveillance renforcée          │
└─────────────────────────────┬───────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│ 6. LEÇONS APPRISES (LESSONS LEARNED)                        │
│    - Rédaction du rapport d'incident complet                │
│    - Amélioration des contrôles pour éviter la récidive     │
└─────────────────────────────────────────────────────────────┘
```

---

## 2) Module — Forensique Mémoire Vive avec Volatility 3 (2h)

### 📖 Narration/Intuition

Les malwares modernes (ransomwares, trojans bancaires, implants d'état) utilisent souvent des techniques "fileless" (sans fichier) : ils s'exécutent exclusivement en mémoire vive (RAM) et n'écrivent rien sur le disque dur pour échapper aux antivirus classiques.

L'**analyse mémoire (Memory Forensics)** permet d'inspecter un dump binaire de la RAM d'un système infecté pour extraire les processus cachés, les connexions réseau actives, les mots de passe en clair et les clés de chiffrement.

### 🔍 Anatomie Technique

**Commandes d'analyse mémoire avec Volatility 3 :**

```bash
# Installation de Volatility 3
git clone https://github.com/volatilityfoundation/volatility3.git
cd volatility3 && pip install -r requirements.txt

# ─── 1. Inspection des Processus en Mémoire ───────────────────────────────────
# Lister l'arbre des processus (Parent-Child relationships)
python3 vol.py -f /tmp/memoire_infectee.raw windows.pstree.PsTree

# Détecter les processus cachés ou désinjectés de la liste officielle (Process Hollowing)
python3 vol.py -f /tmp/memoire_infectee.raw windows.psscan.PsScan

# ─── 2. Analyse des Connexions Réseau en Mémoire ──────────────────────────────
# Identifier les adresses IP et ports distants ouverts par les malwares
python3 vol.py -f /tmp/memoire_infectee.raw windows.netscan.NetScan

# ─── 3. Détection d'Injection de Code et DUMP de Processus ────────────────────
# Détecter les zones mémoire exécutables non cartographiées (DLL Injection / Shellcode)
python3 vol.py -f /tmp/memoire_infectee.raw windows.malfind.Malfind

# Extraire l'exécutable suspect de la mémoire pour analyse antivirus/YARA
python3 vol.py -f /tmp/memoire_infectee.raw windows.dumpfiles.DumpFiles --pid 4108
```

---

## 3) Module — Threat Intelligence & Échange d'IoC avec MISP (2h)

### 📖 Narration/Intuition

Lorsqu'une banque consœur subit une cyberattaque, les **indicateurs de compromission (IoC)** (adresses IP d'attaquants, hashs de malwares, noms de domaine malveillants) peuvent être partagés immédiatement avec la BCC pour bloquer l'attaque *avant* qu'elle n'atteigne notre réseau.

**MISP (Malware Information Sharing Platform)** est la plateforme Open Source standard internationale d'échange de renseignements sur les menaces (Threat Intelligence).

### 🔍 Anatomie Technique

**Concepts clés de Threat Intelligence dans MISP :**

```
- Event : Dossier regroupant les informations relatives à une menace ou un incident.
- Attribute : Élément unitaire d'information (ex: IP 196.200.10.5, Hash SHA256, Domaine C2).
- Sightings : Confirmation de la présence d'un attribut sur son propre réseau.
- TLP (Traffic Light Protocol) : Classification du niveau de confidentialité du partage :
  • TLP:RED    → Strictement confidentiel (destinataires nommés uniquement).
  • TLP:AMBER  → Partage restreint à l'organisation et ses partenaires.
  • TLP:GREEN  → Partage avec la communauté du secteur (ex: secteur bancaire CD).
  • TLP:CLEAR  → Information publique.
```

**Export et intégration automatique d'IoC depuis MISP vers les pare-feux :**

```python
#!/usr/bin/env python3
"""
misp_to_nftables.py — Script de récupération automatique des IPs malveillantes
depuis MISP et mise à jour de la liste de blocage Nftables / Firewall.
"""
from pymisp import PyMISP
import subprocess

MISP_URL = "https://misp.bcc.cd"
MISP_KEY = "Votre_Cle_API_MISP_Secrete"

def mettre_a_jour_firewall():
    # Initialiser la connexion à l'instance MISP
    misp = PyMISP(MISP_URL, MISP_KEY, ssl=False)

    # Rechercher tous les attributs de type 'ip-dst' ou 'ip-src' marqués TLP:GREEN ou AMBER
    results = misp.search(controller='attributes', type_attribute=['ip-dst', 'ip-src'], to_ids=True)

    ips_malveillantes = set()
    if 'Attribute' in results:
        for attr in results['Attribute']:
            ips_malveillantes.add(attr['value'])

    print(f"[+] {len(ips_malveillantes)} adresses IP malveillantes récupérées depuis MISP.")

    # Générer et appliquer un ensemble (set) Nftables pour blocage immédiat
    if ips_malveillantes:
        ip_list_str = ", ".join(ips_malveillantes)
        cmd = f"nft add set inet filter misp_block_list {{ type ipv4_addr; }}; " \
              f"nft flush set inet filter misp_block_list; " \
              f"nft add element inet filter misp_block_list {{ {ip_list_str} }}"
        
        # Exécution de la commande nftables
        print("[+] Mise à jour du jeux de règles Nftables...")
        # subprocess.run(cmd, shell=True, check=True)
        print("✅ Pare-feu BCC mis à jour avec les IoC de Threat Intelligence.")

if __name__ == "__main__":
    mettre_a_jour_firewall()
```

---

## 🏅 Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **DFIR** | Digital Forensics and Incident Response — Investigation numérique et réponse aux incidents |
| **CSIRT** | Computer Security Incident Response Team — Équipe d'intervention sur les incidents de sécurité |
| **IoC** | Indicator of Compromise — Indicateur de compromission (IP, Hash, Domaine) |
| **MISP** | Malware Information Sharing Platform — Plateforme de partage d'informations sur les malwares |
| **TLP** | Traffic Light Protocol — Protocole de classification et partage de l'information (RED, AMBER, GREEN, CLEAR) |

---

## 🏋️ Exercices & Corrigés

**Exercice 1 :** Durant la phase d'**Identification** d'un incident de sécurité, pourquoi est-il fortement déconseillé d'éteindre brutalement l'ordinateur suspecté d'être infecté ?

**Corrigé :** Éteindre la machine coupe l'alimentation électrique de la mémoire vive (RAM). Toute la mémoire volatile est immédiatement perdue : les processus malveillants actifs, les connexions réseau établies, les clés de chiffrement en mémoire et les injecteurs de code fileless disparaissent. La bonne pratique consiste à **isoler la machine du réseau** (débrancher le câble Ethernet / couper le Wi-Fi) puis à effectuer un **dump de la mémoire RAM** avant toute action d'arrêt.

**Exercice 2 :** Dans la classification TLP (Traffic Light Protocol), quelle est la règle de diffusion d'un indicateur de menace marqué `TLP:AMBER` ?

**Corrigé :** La classification **TLP:AMBER** (Ambre/Orange) signifie que l'information est sensible. Le destinataire ne peut partager l'information qu'avec les membres de sa propre organisation et ses clients/partenaires qui ont un besoin strict de savoir (*need-to-know*) pour se protéger ou prévenir des dommages. L'information ne doit pas être diffusée publiquement ni en dehors de ce cercle restreint.

---

## ❓ Banque de Questions & Test du Jour

**Q1 :** Quelle est la première étape du cycle de réponse aux incidents selon le framework SANS / NIST ?
- A) Éradication
- B) Préparation
- C) Confinement
- D) Recouvrement

**Réponse : B**

**Q2 :** Quel outil d'analyse forensique est le standard Open Source pour inspecter un dump de mémoire vive (RAM) et extraire les processus et connexions réseau ?
- A) Volatility
- B) Nmap
- C) Wireshark
- D) Docker

**Réponse : A**

**Q3 :** Quelle est la fonction principale d'une plateforme de Threat Intelligence comme MISP ?
- A) Compiler du code source C++
- B) Collecter, centraliser et échanger des indicateurs de compromission (IoC) et des renseignements sur les menaces entre organisations
- C) Remplacer le pare-feu matériel
- D) Générer des mots de passe aléatoires pour les utilisateurs

**Réponse : B**

**Q4 :** Si un rapport de menace dans MISP contient des indicateurs classés `TLP:RED`, quelle est la restriction de partage ?
- A) L'information est publique et peut être publiée sur Twitter/X
- B) L'information est strictement confidentielle et limitée aux participants présents lors de l'échange
- C) L'information peut être partagée avec toutes les banques du pays
- D) L'information doit être supprimée immédiatement

**Réponse : B**

**Q5 :** Quel plugin Volatility 3 permet de scanner la mémoire à la recherche de structures de réseaux pour lister les connexions TCP/UDP actives et fermées lors de la capture ?
- A) windows.info.Info
- B) windows.netscan.NetScan
- C) windows.cmdline.CmdLine
- D) linux.bash.Bash

**Réponse : B**

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
