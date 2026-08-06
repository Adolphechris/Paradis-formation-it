# TOME P6 — Cybersécurité Expert & Red Team Avancé — Jour 270 (6h) : Projet Intégrateur S6 Partie 4 — SOC Operations, Threat Hunting & SOAR Response (Scénario Incident Majeur Multi-Domaines)

> [!NOTE]
> **Objectif du jour :** Exécuter un **Projet Intégrateur global d'Opérations SOC, Threat Hunting et Réponse SOAR** : analyser une simulation d'incident cyber majeur (attaque par Ransomware avec exfiltration C2 et tentative de compromission AD), construire les requêtes de détection SIEM EQL/KQL, conduire la chasse proactive sur les logs EDR, orchestrer le confinement via un Playbook SOAR Shuffle, et produire un rapport post-mortem formel conforme au standard NIST SP 800-61 Rev. 2.
>
> **Ce projet valide l'aptitude opérationnelle complète de l'apprenant à agir en tant que SOC Lead / Incident Response Manager lors de crises cyber réelles.**

---

## 1) Module — Analyse du Scénario d'Incident Cyber Majeur (2h)

### 📖 Description du Scénario d'Attaque (Incident INC-2026-9901)

Une entreprise financière internationale est victime d'une attaque d'envergure :
1. **Accès Initial (H+00) :** Phishing ciblé → Exécution d'un stager PowerShell obfusqué par un utilisateur du département Finance.
2. **EDR Evasion (H+01) :** Bypass AMSI via memory patching + Direct Syscalls pour injecter un Cobalt Strike Beacon.
3. **Mouvement Latéral & AD Compromise (H+03) :** Exécution de DCSync via secretsdump.py suite à des privilèges ADCS mal configurés (ESC1).
4. **Exfiltration & Ransomware (H+05) :** Exfiltration de 50 Go de données sensibles vers un serveur C2 externe (`198.51.100.45`) suivi du chiffrement des partages réseau.

---

## 2) Module — Implémentation de la Détection & de l'Orchestration SOAR (2h30)

### 🛠️ Script d'Orchestration Post-Incident & Threat Hunting (`incident_response_orchestrator.py`)

```python
import json
import numpy as np

# Script de traitement d'incident combiné : KQL Threat Hunting + SOAR Containment

def hunt_beaconing_c2(network_logs: list) -> str:
    """Étape 1 — Threat Hunting : Détection du C2 via variance d'inter-connexion"""
    deltas = np.diff([log['timestamp'] for log in network_logs])
    variance = np.std(deltas) / np.mean(deltas)
    if variance < 0.15:
        c2_ip = network_logs[0]['dest_ip']
        print(f"[!] THREAT HUNTING : C2 Beaconing confirmé vers IP {c2_ip} (Variance : {variance:.4f})")
        return c2_ip
    return None

def trigger_soar_containment(compromised_host: str, c2_ip: str):
    """Étape 2 — SOAR Containment : Isolation Host + Blocage Firewall"""
    print(f"[*] SOAR PLAYBOOK INITIÉ pour Host : {compromised_host}")
    print(f"  [+] API EDR : Host {compromised_host} Isolé du réseau")
    print(f"  [+] API Firewall : IP {c2_ip} ajoutée à la Blocklist globale")
    print(f"  [+] API Active Directory : Compte utilisateur suspendu")
    print("[+] ACTION SOAR TERMINÉE EN 3.2 SECONDES (MTTR optimisé !)")

# Simulation des logs réseau capturés
simulated_logs = [
    {'timestamp': 100.0, 'dest_ip': '198.51.100.45'},
    {'timestamp': 160.1, 'dest_ip': '198.51.100.45'},
    {'timestamp': 220.3, 'dest_ip': '198.51.100.45'},
    {'timestamp': 280.2, 'dest_ip': '198.51.100.45'}
]

c2 = hunt_beaconing_c2(simulated_logs)
if c2:
    trigger_soar_containment("FINANCE-WORKSTATION-09", c2)
```

---

## 3) Module — Rapport Post-Mortem NIST SP 800-61 Rev. 2 (1h30)

```markdown
# RAPPORT POST-MORTEM D'INCIDENT DE SÉCURITÉ — INC-2026-9901
**Standard de référence :** NIST SP 800-61 Rev. 2 (Computer Security Incident Handling Guide)
**Classification :** TLP:AMBER

## 1. Résumé de l'Incident (Executive Summary)
Le 2026-08-07 à 14:00 UTC, l'équipe SOC a détecté et contenu une tentative de chiffrement Ransomware initiée via un vecteur de Phishing. L'isolation automatique SOAR a permis de stopper l'exfiltration à 1.2 Go (sur 50 Go ciblés) et de préserver le Domain Controller.

## 2. Chronologie Complète & Temps de Réponse (MTTD / MTTR)

| Phase | Heure (UTC) | Action / Événement | Outil / Télémétrie |
|---|---|---|---|
| Détection | 14:02:15 | Alerte SIEM EQL (Process Hollowing) | Elastic Security |
| Chasse | 14:03:00 | Confirmation C2 Beaconing (Variance 0.08) | Python Threat Hunting |
| Confinement | 14:03:03 | Isolation EDR + Blocage IP Firewall | Playbook Shuffle SOAR |
| **Bilan Métriques** | **MTTD : 2 minutes** | **MTTR : 48 secondes** | **Objectif SOC atteint** |

## 3. Leçons Apprises & Plan d'Action Post-Incident (CAPA)
1. **P0 (Immédiat) :** Désactiver les templates ADCS vulnérables à ESC1 via Certipy Audit
2. **P1 (72h) :** Déployer les règles EDR d'inspection de la mémoire contre le Direct Syscall Hooking
3. **P2 (30 jours) :** Imposer des YubiKeys FIDO2 pour l'ensemble du personnel Finance
```

---

## 🏅 Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **NIST SP 800-61** | Guide officiel du NIST pour la gestion des incidents de sécurité informatique |
| **MTTD** | Mean Time To Detect — Temps moyen de détection d'un incident de sécurité |
| **CAPA** | Corrective and Preventive Actions — Plan d'actions correctives et préventives post-incident |

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
