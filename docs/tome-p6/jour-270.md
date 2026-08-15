# TOME P6 — Cybersécurité Expert & Red Team Avancé — Jour 270 (6h) : Projet Intégrateur S6 Partie 4 — SOC Operations, Threat Hunting & SOAR Response (Scénario Incident Majeur Multi-Domaines)

> [!NOTE]
> **Objectif du jour :** Exécuter le **Projet Intégrateur global d'Opérations SOC, Threat Hunting et Réponse SOAR** : analyser une simulation d'incident cyber majeur (attaque par Ransomware avec exfiltration C2 et tentative de compromission AD), construire les requêtes de détection SIEM EQL/KQL, conduire la chasse proactive sur les logs EDR, orchestrer le confinement via un Playbook SOAR Shuffle, et produire un rapport post-mortem formel conforme au standard **NIST SP 800-61 Rev. 2**.
>
> **Ce projet valide l'aptitude opérationnelle complète de l'apprenant à agir en tant que SOC Lead / Incident Response Manager lors de crises cyber réelles.**

---

## 🎯 Objectifs de la Leçon

- 🏥 Maîtriser le cycle de vie de gestion d'incidents selon la norme **NIST SP 800-61 Rev. 2**.
- 🔍 Détecter les canaux de communication C2 cachés (*Beaconing*) grâce à l'analyse statistique de variance d'inter-arrivée des paquets.
- 📜 Rédiger des règles de détection SIEM en **EQL** (*Event Query Language*) et **KQL** (*Kibana Query Language*).
- ⚡ Orchestrer une réponse automatique d'isolation en moins de 5 secondes via un **Playbook SOAR** (Shuffle / Cortex XSOAR).
- 📊 Optimiser les métriques clés d'un SOC : **MTTD** (*Mean Time To Detect*) et **MTTR** (*Mean Time To Respond*).
- 🧪 Développer et exécuter le script d'orchestration d'incident (`incident_response_orchestrator.py`).

---

## 🖼️ Opérations SOC & Réponse aux Incidents

![SOC Operations & Incident Response](https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=800)

---

## 📖 1. Le Cycle de Gestion d'Incident NIST SP 800-61 Rev. 2

Le **NIST SP 800-61 Rev. 2** (*Computer Security Incident Handling Guide*) régit les 4 phases de réponse opérationnelle d'un SOC d'élite :

```
┌──────────────────────────────────────────────────────────────────────────┐
│ 1. PRÉPARATION (Preparation)                                             │
│    - Déploiement des agents EDR, SIEM, SOAR et formation des équipes    │
├──────────────────────────────────────────────────────────────────────────┤
│ 2. DÉTECTION & ANALYSE (Detection & Analysis)                            │
│    - Alertes SIEM/EQL, Threat Hunting, Triage des anomalies (MTTD)       │
├──────────────────────────────────────────────────────────────────────────┤
│ 3. CONFINEMENT, ÉRADICATION & RÉTABLISSEMENT (Containment & Recovery)    │
│    - Isolation EDR, blocage IP firewall, révocation de jetons (MTTR)     │
├──────────────────────────────────────────────────────────────────────────┤
│ 4. ACTIVITÉS POST-INCIDENT (Post-Incident Activity / Lessons Learned)    │
│    - Rapport post-mortem, cause racine, plan d'actions correctives (CAPA)│
└──────────────────────────────────────────────────────────────────────────┘
```

---

## 📖 2. Anatomie de l'Incident Majeur INC-2026-9901

### 2.1 La Chîne d'Attaque (Kill Chain)

L'incident analysé implique une attaque sophistiquée contre la société financière **PARADIS Financial** :

```
[ Phishing Mail ] ──► [ Stager PowerShell ] ──► [ AMSI Bypass & Direct Syscalls ]
                                                        │
                                                        ▼
[ C2 Beaconing ]  ◄── [ Exfiltration 1.2 Go ] ◄── [ Cobalt Strike Beacon ]
       │
       ▼
[ Détection SOC ] ──► [ Playbook SOAR Shuffle ] ──► [ Isolation EDR & Blocage IP (48s) ]
```

1. **Vecteur d'Accès Initial (H+00)** : Phishing ciblé (*Spearphishing*) avec une pièce jointe exécutant un stager PowerShell obfusqué dans la mémoire d'un poste du département Finance (`FINANCE-WORKSTATION-09`).
2. **Évasion EDR (H+01)** : Contournement de l'AMSI (*Antimalware Scan Interface*) par *Memory Patching* et utilisation de *Direct Syscalls* (méthode Hell's Gate) pour injecter un Beacon Cobalt Strike.
3. **Escalade & Mouvement Latéral (H+03)** : Exploitation de templates Active Directory Certificate Services (ADCS) vulnérables (vulnérabilité ESC1) via `Certipy` pour générer un certificat administrateur du domaine.
4. **Exfiltration & Tentative de Ransomware (H+05)** : Début d'exfiltration de données sensibles vers un serveur C2 externe (`198.51.100.45`).

---

## 📖 3. Threat Hunting : Détection du C2 Beaconing par Variance

Les implants malveillants (*Beacons*) se connectent à leur serveur C2 à des intervalles réguliers (ex: toutes les 60 secondes). Pour déjouer les détections simples, les attaquants ajoutent un délai aléatoire appelé **Jitter** (ex: 60s $\pm 10\%$).

L'équipe Threat Hunting utilise une **analyse statistique de la variance de l'intervalle de temps ($\Delta t$)** entre les connexions réseau :

$$\text{Variance Relative } V = \frac{\sigma(\Delta t)}{\mu(\Delta t)}$$

- Si $V < 0.15$ (faible variance), le trafic réseau est **artificiellement généré par une machine/beacon**, même avec du Jitter !

```
Requête EQL pour Elastic Security :
sequence by host.name
  [ network where destination.ip == "198.51.100.45" and destination.port == 443 ]
  [ network where destination.ip == "198.51.100.45" and destination.port == 443 ]
  until [ process where process.name == "powershell.exe" ]
```

---

## 📖 4. Orchestration & Confinement Automatisé SOAR (Shuffle)

Lorsqu'une alerte critique est confirmée, le système **SOAR** (*Security Orchestration, Automation and Response*) exécute un **Playbook automatisé** sans attendre l'intervention humaine :

```
                  PLAYBOOK SOAR SHUFFLE — INC-2026-9901
                  ┌─────────────────────────────────────┐
                  │ 1. Alerte Détectée par le SIEM      │
                  └──────────────────┬──────────────────┘
                                     │
                  ┌──────────────────┴──────────────────┐
                  │ 2. API EDR (CrowdStrike / Defender) │
                  │    - Isoler le poste du réseau LAN  │
                  └──────────────────┬──────────────────┘
                                     │
                  ┌──────────────────┴──────────────────┐
                  │ 3. API Pare-feu (Palo Alto / Forti) │
                  │    - Ajouter l'IP C2 en Blocklist   │
                  └──────────────────┬──────────────────┘
                                     │
                  ┌──────────────────┴──────────────────┐
                  │ 4. API Active Directory / Okta      │
                  │    - Suspendre le compte & Jetons   │
                  └─────────────────────────────────────┘
```

> [!IMPORTANT]
> **Optimisation des Métriques SOC :**  
> L'automatisation SOAR réduit le **MTTR** (*Mean Time To Respond*) de plusieurs heures à **moins de 5 secondes**, coupant l'exfiltration de données avant l'exécution du ransomware !

---

## 🧪 5. Atelier Pratique : Code d'Orchestration d'Incident (`incident_response_orchestrator.py`)

### Script Python : Chasse C2 & Confinement SOAR

```python
#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
PARADIS IT — Masterclass Cybersécurité (Tome P6 - Jour 270)
Projet Intégrateur S6 Partie 4 : Threat Hunting C2 & SOAR Incident Response
"""

import json
import time
import math

def calculate_variance_jitter(timestamps):
    """Calcule la variance d'inter-arrivée des paquets pour détecter du C2 Beaconing."""
    if len(timestamps) < 3:
        return 1.0
    
    deltas = [timestamps[i+1] - timestamps[i] for i in range(len(timestamps)-1)]
    mean_delta = sum(deltas) / len(deltas)
    
    if mean_delta == 0:
        return 0.0
    
    variance = sum((x - mean_delta) ** 2 for x in deltas) / len(deltas)
    std_dev = math.sqrt(variance)
    relative_variance = std_dev / mean_delta
    return relative_variance

def hunt_c2_beaconing(network_logs):
    """Module Threat Hunting : Analyse du trafic réseau."""
    ip_timeline = {}
    for log in network_logs:
        ip = log["dest_ip"]
        if ip not in ip_timeline:
            ip_timeline[ip] = []
        ip_timeline[ip].append(log["timestamp"])
    
    suspicious_ips = []
    for ip, ts_list in ip_timeline.items():
        if len(ts_list) >= 3:
            v = calculate_variance_jitter(ts_list)
            if v < 0.15: # Seuil de détection du Jitter C2
                suspicious_ips.append((ip, v))
                print(f"[!] THREAT HUNTING ALERT : Beaconing C2 détecté vers IP {ip} (Variance Jitter : {v:.4f})")
    
    return suspicious_ips

def trigger_soar_playbook(compromised_host, target_ip, user_account):
    """Module SOAR : Confinement automatisé multi-API."""
    start_time = time.time()
    print(f"\n[*] INITIATION DU PLAYBOOK SOAR AUTOMATISÉ (Target Host: {compromised_host})...")
    
    # 1. Isolation EDR
    print(f"  [+] API EDR (Crowdstrike) ──► Post {compromised_host} Isolé du réseau (Network Isolation: OK)")
    
    # 2. Blocage Firewall
    print(f"  [+] API Firewall (Palo Alto) ──► IP C2 {target_ip} ajoutée à la Blocklist globale (Drop Rule: OK)")
    
    # 3. Suspension AD
    print(f"  [+] API Active Directory ──► Compte {user_account} désactivé et jetons OAuth révoqués (Revoke: OK)")
    
    elapsed = time.time() - start_time
    print(f"✅ PLAYBOOK SOAR EXÉCUTÉ AVEC SUCCÈS EN {elapsed:.3f} SECONDES (MTTR Optimisé !)\n")

def main():
    print("=================================================================")
    print("   PARADIS IT — SOC INCIDENT RESPONSE & SOAR ORCHESTRATOR        ")
    print("=================================================================")
    time.sleep(1)

    # Simulation de logs EDR/Réseau d'un poste infecté (Connexions toutes les ~60s avec léger Jitter)
    simulated_network_logs = [
        {"timestamp": 100.0, "dest_ip": "198.51.100.45", "bytes": 1420},
        {"timestamp": 160.1, "dest_ip": "198.51.100.45", "bytes": 1450},
        {"timestamp": 220.3, "dest_ip": "198.51.100.45", "bytes": 1410},
        {"timestamp": 280.2, "dest_ip": "198.51.100.45", "bytes": 1435},
        {"timestamp": 105.0, "dest_ip": "8.8.8.8", "bytes": 64},
        {"timestamp": 450.0, "dest_ip": "8.8.8.8", "bytes": 64}
    ]

    c2_targets = hunt_c2_beaconing(simulated_network_logs)

    if c2_targets:
        for ip, var in c2_targets:
            trigger_soar_playbook(
                compromised_host="FINANCE-WORKSTATION-09",
                target_ip=ip,
                user_account="j.doe@paradis.local"
            )

    post_mortem_summary = {
        "incident_id": "INC-2026-9901",
        "standard": "NIST SP 800-61 Rev. 2",
        "mttd_seconds": 120,
        "mttr_seconds": 3,
        "data_exfiltrated_gb": 1.2,
        "data_saved_gb": 48.8,
        "status": "CONTAINED_AND_RESOLVED"
    }

    print("=== SYNTHÈSE DU RAPPORT POST-MORTEM (TLP:AMBER) ===")
    print(json.dumps(post_mortem_summary, indent=2))
    print("=================================================================")

if __name__ == "__main__":
    main()
```

### Exécution du Script dans le Terminal

```bash
# Tester le script Python de détection Threat Hunting & SOAR
python3 -c "
import json, math
deltas = [60.1, 60.2, 59.9, 60.0]
mean_d = sum(deltas)/len(deltas)
var = math.sqrt(sum((x - mean_d)**2 for x in deltas)/len(deltas))/mean_d
print('=== SIMULATION THREAT HUNTING C2 BEACONING ===')
print(f'Variance du Jitter calculée : {var:.5f} (< 0.15 => ALERTE C2 BEACONING)')
print('Action SOAR : Post FINANCE-WORKSTATION-09 isolé du réseau en 0.005s.')
"
```

---

## 🛠️ Diagnostics & Réflexes Terrain

### 1. Que faire lorsque l'isolation EDR d'un poste bloque une chaîne de production critique ?
- **Réflexe** : Les playbooks SOAR doivent prévoir des **exceptions pour les systèmes critiques (Crown Jewels)**. Au lieu d'une isolation réseau totale, le SOAR applique un profil de pare-feu EDR restreint qui coupe uniquement le port C2 suspect tout en maintenant les flux applicatifs vitaux.

### 2. Comment réduire le MTTD (Mean Time To Detect) dans un SOC ?
- **Réflexe** : Automatisez l'ingestion des règles de détection **SIGMA** communautaires dans votre SIEM et déployez des alertes comportementales basées sur les appels API système suspects (ex: accès mémoire à `lsass.exe` ou écriture dans le Registre Run Keys).

---

## ❓ Banque de QCM & Test du Jour (8 Questions)

**Q1 : Quel standard du NIST fait référence mondiale pour le traitement et la gestion des incidents de sécurité informatique ?**
- A) NIST SP 800-53
- B) NIST SP 800-61 Rev. 2
- C) NIST SP 800-190
- D) FIPS 140-3

*Réponse : B — NIST SP 800-61 Rev. 2 est le guide de référence pour la conduite de la réponse aux incidents cyber.*

**Q2 : Que mesurent respectivement les métriques clés d'un SOC appelées MTTD et MTTR ?**
- A) MTTD = Temps moyen de détection / MTTR = Temps moyen de réponse/confinement
- B) MTTD = Coût financier / MTTR = Nombre d'employés
- C) MTTD = Vitesse du processeur / MTTR = Taille du disque dur
- D) MTTD = Nombre d'attaques / MTTR = Nombre de virus

*Réponse : A — MTTD (Mean Time To Detect) et MTTR (Mean Time To Respond) sont les deux indicateurs de performance fondamentaux d'un SOC.*

**Q3 : Comment l'équipe Threat Hunting parvient-elle à détecter un canal de communication C2 (Beaconing) même si l'attaquant ajoute un délai aléatoire (Jitter) ?**
- A) En lisant les emails de l'attaquant
- B) En calculant la variance statistique de l'intervalle de temps entre les connexions réseau
- C) En éteignant le pare-feu
- D) En changeant le mot de passe Wi-Fi

*Réponse : B — La faible variance statistique des deltas de temps trahit le caractère automatisé des connexions de Beaconing.*

**Q4 : Quel est l'avantage principal d'un système SOAR (*Security Orchestration, Automation and Response*) par rapport à un simple SIEM ?**
- A) Il est gratuit
- B) Il orchestre et exécute automatiquement des actions de confinement (isolation EDR, blocage IP) en quelques secondes via des API
- C) Il remplace les disques durs SSD
- D) Il installe Windows sur les serveurs

*Réponse : B — Le SOAR automatise la réponse aux incidents en exécutant des playbooks multi-outils sans délai humain.*

**Q5 : Quelle est la première étape du cycle de gestion d'incident selon le NIST SP 800-61 Rev. 2 ?**
- A) La Préparation (*Preparation*)
- B) L'Éradication
- C) Le paiement de la rançon
- D) La fermeture de l'entreprise

*Réponse : A — La Préparation (outils, processus, formation) est la phase initiale indispensable avant la survenue de tout incident.*

**Q6 : Quel langage de requête est utilisé par Elastic Security pour détecter des séquences d'événements système complexes (ex: process hollowing suivi d'une connexion réseau) ?**
- A) SQL
- B) EQL (*Event Query Language*)
- C) HTML
- D) Bash

*Réponse : B — EQL (Event Query Language) permet de rédiger des règles de détection basées sur des séquences temporelles d'événements.*

**Q7 : Que contient la section CAPA (*Corrective and Preventive Actions*) d'un rapport post-mortem d'incident ?**
- A) La liste des salaires des employés
- B) Le plan d'actions correctives et préventives à appliquer pour éliminer la cause racine et éviter la récurrence de l'attaque
- C) La publicité pour l'entreprise
- D) Les photos des serveurs

*Réponse : B — Le plan CAPA définit les mesures techniques et organisationnelles à déployer suite aux leçons apprises.*

**Q8 : Quel protocole/outil est couramment utilisé par la Red Team pour contourner l'AMSI (*Antimalware Scan Interface*) sous Windows ?**
- A) Le chiffrement AES
- B) Le Memory Patching des instructions d'inspection en mémoire du processus
- C) Le protocole DHCP
- D) Le câble Ethernet

*Réponse : B — Le patching mémoire des fonctions AMSI (ex: `AmsiScanBuffer`) neutralise l'inspection des scripts par les antivirus.*

---

## 📚 Ressources & Références

- **NIST SP 800-61 Rev. 2 (Computer Security Incident Handling Guide)** : https://csrc.nist.gov/publications/detail/sp/800-61/rev-2/final
- **MITRE ATT&CK Framework for Enterprise** : https://attack.mitre.org/
- **Shuffle Automation (Open Source SOAR)** : https://shuffler.io/
- **Elastic Event Query Language (EQL) Documentation** : https://www.elastic.co/guide/en/elasticsearch/reference/current/eql.html

---

*Semestre 6 — Cybersécurité Expert & Red Team Avancé PARADIS IT Masterclass*
