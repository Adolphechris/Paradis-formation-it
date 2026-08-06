# TOME P2 — Réseaux & Télécoms — Jour 97 (6h) : Cybersécurité des Systèmes Industriels & SCADA (ICS, Modbus/TCP, IEC 60870-5-104 & Isolation OT)

> [!NOTE]
> **Objectif du jour :** Comprende l'architecture et la cybersécurité des Réseaux Industriels et Systèmes de Contrôle (ICS / SCADA) : protocoles industriels (Modbus/TCP, IEC 104), modèle Purdue d'isolation des réseaux IT/OT, détection d’intrusions industrielles et sécurisation des infrastructures critiques d'énergie et de transport.
>
> **Compétences visées :** `BIT-04` (A) — Réseaux Industriels & OT | `SEC-04` (A) — Sécurité des Infrastructures Critiques (ICS/SCADA)

---

## 1) Module — Le Modèle Purdue & Séparation des Réseaux IT / OT (2h)

### 📖 Narration/Intuition

En plus de ses systèmes bancaires informatiques (IT), une banque centrale comme la BCC ou des entités nationales stratégiques exploitent des **Systèmes de Technologies Opérationnelles (OT / Operational Technology)** : gestion technique des bâtiments (GTB), contrôle des coffres-forts haute sécurité, climatisation des Datacenters, et groupes électrogènes de secours.

Historiquement, les réseaux OT n'étaient pas connectés à Internet. Aujourd'hui, la convergence IT/OT expose les Automates Programmables Industriels (API / PLC) à des cyberattaques dévastatrices (ex: Stuxnet, CrashOverride).

Le **Modèle Purdue (Purdue Reference Model - IEC 62443)** est la référence d'architecture pour segmenter de manière étanche le réseau IT (Bureautique/Cloud) et le réseau OT (Usines/Bâtiments).

### 🔍 Anatomie Technique

**Le Modèle Purdue d'Architecture IT/OT (IEC 62443) :**

```
┌─────────────────────────────────────────────────────────────┐
│ NIVEAU 4 & 5 : ENTERPRISE IT NETWORK (Réseau Bureautique)    │
│   - ERP, E-mails, Internet, SIEM central                     │
└──────────────────────────────┬──────────────────────────────┘
                               │
 ══════════════════════════════╪═══════════════════════════════
   INDUSTRIAL DMZ (IDMZ) — Zone d'Isolation Étanche (Firewall IT/OT)
 ══════════════════════════════╪═══════════════════════════════
                               │
┌──────────────────────────────▼──────────────────────────────┐
│ NIVEAU 3 : CONTROL SITE / SCADA SYSTEM                       │
│   - Serveurs SCADA, Historian, Consoles HMI d'ingénierie     │
└──────────────────────────────┬──────────────────────────────┘
                               │ Protocoles Industriels (Modbus, IEC-104)
┌──────────────────────────────▼──────────────────────────────┐
│ NIVEAU 2 : CONTROL PROCESS (Automates & Contrôleurs)         │
│   - PLC (Programmable Logic Controllers), PAC, RTU            │
└──────────────────────────────┬──────────────────────────────┘
                               │
┌──────────────────────────────▼──────────────────────────────┐
│ NIVEAU 0 & 1 : FIELD DEVICES (Capteurs & Actionneurs)        │
│   - Capteurs de température, moteurs, vannes, relais         │
└─────────────────────────────────────────────────────────────┘
```

---

## 2) Module — Protocoles Industriels & Vulnérabilités (Modbus/TCP) (2h)

### 📖 Narration/Intuition

Les protocoles industriels ont été conçus il y a 40 ans pour être simples et robustes sur des liaisons série ou réseau local. Ils ne possèdent **aucun mécanisme d'authentification, de chiffrement ni de contrôle d'intégrité**.

Si un attaquant réussit à envoyer un paquet **Modbus/TCP** forgé sur le port `502` à un automate qui pilote le refroidissement d'un Datacenter, l'automate obéira immédiatement sans demander de mot de passe et coupera le système.

### 🔍 Anatomie Technique

**Inspection et Forgerie de Paquets Modbus/TCP en Python (Scapy) :**

```python
#!/usr/bin/env python3
"""
modbus_auditer.py — Inspecteur et auditeur de sécurité Modbus/TCP pour automates industriels (Lab OT)
"""
from scapy.all import IP, TCP, sr1
import struct

PLC_IP = "10.0.90.50"   # IP de l'Automate Programmable (PLC)
MODBUS_PORT = 502

def lire_registres_modbus(ip_automate, adresse_registre, nb_registres):
    """
    Envoie une requête Modbus/TCP 'Read Holding Registers' (Function Code 03)
    """
    print(f"[+] Lecture des registres Modbus {adresse_registre} sur {ip_automate}:502...")

    # En-tête Modbus/TCP (MBAP Header) + PDU
    transaction_id = 0x0001
    protocol_id = 0x0000     # 0 pour Modbus
    length = 0x0006          # Longueur des octets suivants
    unit_id = 0x01           # Adresse de l'esclave (Slave ID)
    function_code = 0x03     # Read Holding Registers

    # Assembly du paquet Modbus binaire
    payload_modbus = struct.pack(">HHHBBHH", 
                        transaction_id, protocol_id, length, unit_id, 
                        function_code, adresse_registre, nb_registres)

    # Envoi du paquet via Scapy sur le port TCP 502
    paquet = IP(dst=ip_automate)/TCP(dport=MODBUS_PORT, flags="PA")/payload_modbus
    reponse = sr1(paquet, timeout=3, verbose=False)

    if reponse and reponse.haslayer(TCP):
        print("✅ Réponse reçue de l'automate !")
        raw_data = bytes(reponse[TCP].payload)
        # Extraire les valeurs des registres
        print(f"   Données brutes reçues (hex) : {raw_data.hex()}")
    else:
        print("❌ Aucune réponse de l'automate. Le port 502 est-il fermé ou filtré ?")

if __name__ == "__main__":
    lire_registres_modbus(PLC_IP, adresse_registre=0, nb_registres=4)
```

---

## 3) Module — Détection d'Intrusions & Protection OT (Suricata & Malcolm) (2h)

### 📖 Narration/Intuition

Dans les réseaux industriels OT, on ne peut pas installer d'antivirus classiques sur les automates ni effectuer des scans Nmap agressifs qui risqueraient de faire planter les contrôleurs. La sécurité repose donc quasi-exclusivement sur la **surveillance passive du trafic réseau** (Passive Network Monitoring) à l'aide de sondes IDS adaptées aux protocoles industriels.

### 🔍 Anatomie Technique

**Règles Suricata de détection d'attaques industrielles Modbus (`modbus_rules.rules`) :**

```
# Règle 1 : Alerte en cas de tentative d'écriture de registre (Code fonction 06 ou 16) sur un PLC
alert modbus any any -> $PLC_NET 502 (msg:"OT-ALERT: Modification de registre Modbus (Write Single Register)"; modbus:function 6; sid:3000001; rev:1;)

# Règle 2 : Alerte si une commande de réinitialisation/arrêt de l'automate est transmise
alert modbus any any -> $PLC_NET 502 (msg:"OT-CRITICAL: Commande de STOP/FORCE transmise à l'automate"; modbus:function 90; sid:3000002; rev:1;)

# Règle 3 : Détection de trafic Modbus provenant d'une adresse IP non autorisée (Hors de la console HMI)
alert tcp !$HMI_NET any -> $PLC_NET 502 (msg:"OT-SECURITY: Connexion Modbus depuis une IP non autorisée"; sid:3000003; rev:1;)
```

---

## 🏅 Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **ICS** | Industrial Control Systems — Systèmes de contrôle industriels |
| **SCADA** | Supervisory Control and Data Acquisition — Système de télégestion et d'acquisition de données |
| **OT** | Operational Technology — Technologies opérationnelles (par opposition à l'IT) |
| **PLC** | Programmable Logic Controller — Automate Programmable Industriel (API) |
| **HMI** | Human-Machine Interface — Interface Homme-Machine (Console de supervision graphique) |
| **IDMZ** | Industrial Demilitarized Zone — Zone tampon isolant le réseau IT du réseau OT |

---

## 🏋️ Exercices & Corrigés

**Exercice 1 :** Quelle est la différence fondamentale entre les objectifs de sécurité prioritaires du monde **IT** (Informatique) et du monde **OT** (Industriel) ?

**Corrigé :** Dans le monde **IT**, la priorité absolue est la **Confidentialité** des données (Triade C-I-A : Confidentialité > Intégrité > Disponibilité). Dans le monde **OT / Industriel**, la priorité absolue est la **Sécurité physique des personnes / Sûreté (Safety) et la Disponibilité continue** (Triade A-I-C : Disponibilité > Intégrité > Confidentialité). Une interruption de service sur un réseau OT peut entraîner des pannes physiques ou des accidents graves.

**Exercice 2 :** Pourquoi est-il strictement interdit d'effectuer des scans de vulnérabilités agressifs (ex: Nmap intense) sur un réseau OT de Niveau 1 ou 2 ?

**Corrigé :** Les Automates Programmables (PLC) et capteurs industriels ont des piles réseau TCP/IP très rudimentaires et des microprocesseurs à faible puissance. L'envoi d'un volume important de paquets réseau de balayage ou de paquets mal formés peut saturer la mémoire du contrôleur ou faire crasher sa pile réseau, provoquant l'arrêt brutal des équipements industriels ou de la régulation technique qu'il pilote.

---

## ❓ Banque de Questions & Test du Jour

**Q1 :** Dans le Modèle Purdue d'architecture industrielle (IEC 62443), quelle zone tampon réseau isole hermétiquement le réseau informatique bureautique (IT) du réseau industriel de contrôle (OT) ?
- A) DMZ Web
- B) IDMZ (Industrial DMZ)
- C) Sous-réseau Wi-Fi Invité
- D) Loopback

**Réponse : B**

**Q2 :** Sur quel port TCP standard le protocole industriel Modbus/TCP écoute-t-il par défaut ?
- A) 80
- B) 443
- C) 502
- D) 22

**Réponse : C**

**Q3 :** Pourquoi le protocole industriel Modbus/TCP d'origine est-il intrinsèquement vulnérable aux cyberattaques de type Replay et Man-in-the-Middle ?
- A) Il est trop moderne
- B) Il ne possède aucun mécanisme natif d'authentification des requêtes ni de chiffrement des données
- C) Il exige des mots de passe de 30 caractères
- D) Il ne fonctionne que sur fibre optique

**Réponse : B**

**Q4 :** Quel composant réseau industriel assure l'interface graphique permettant aux opérateurs humains d'interagir et de visualiser l'état des processus physiques ?
- A) PLC (Automate)
- B) HMI (Human-Machine Interface)
- C) Capteur de température
- D) Routeur BGP

**Réponse : B**

**Q5 :** Dans le domaine de la sécurité des réseaux industriels OT, quelle méthode de surveillance est recommandée pour détecter des intrusions sans risquer d'interrompre le fonctionnement des automates ?
- A) Scans de vulnérabilités Nmap quotidiens agressifs
- B) Surveillance passive du trafic réseau (Passive Monitoring via SPAN/Mirror port) et sondes IDS
- C) Redémarrage des automates toutes les heures
- D) Suppression de tous les pare-feux

**Réponse : B**

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
