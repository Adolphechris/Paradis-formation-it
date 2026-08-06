# TOME P5 — Cybersécurité Avancée & Red/Blue Team — Jour 218 (6h) : Sécurité des Systèmes Industriels SCADA & OT (ICS Security, Modbus TCP, DNP3, PLC Hardening & Réseau Air-Gapped)

> [!NOTE]
> **Objectif du jour :** Maîtriser la sécurité des systèmes industriels et des réseaux d'opérations (**OT — Operational Technology / SCADA / ICS**) : compréhension des protocoles industriels (**Modbus TCP**, **DNP3**), analyse des automates programmables (**PLC — Programmable Logic Controller**), modèle de référence **Purdue Model**, durcissement des réseaux d'infrastructures critiques et techniques d'isolation par **Air-Gap**.
>
> **Compétences visées :** `SEC-04` (A) — Sécurité des Systèmes Industriels SCADA/OT | `SEC-05` (A) — Modèle Purdue & Isolation Réseau Air-Gap

---

## 1) Module — Modèle Purdue & Architecture des Réseaux OT/SCADA (2h)

### 📖 Narration/Intuition

Dans une banque centrale ou un centre de gestion des réserves d'or, la sécurité ne concerne pas seulement les serveurs web et la base de données : elle concerne aussi les systèmes informatiques industriels (**OT — Operational Technology / SCADA**) qui contrôlent physiquement l'ouverture des coffres-forts, la climatisation des datacenters, les groupes électrogènes de secours et les caméras de contrôle d'accès.

Contrairement aux réseaux IT classiques où l'on privilégie la **Confidentialité**, dans les réseaux OT/SCADA, la priorité absolue est la **Disponibilité** et la **Sécurité Physique (Safety)**.

### 🔍 Anatomie Technique

**Le Modèle de Référence Purdue (NIST SP 800-82 / IEC 62443) :**

```
NIVEAU 5 — ENTREPRISE IT (Cloud, Mail, ERP)
─────────────────────────────────────────────────────────────
  - Réseau informatique global de la banque
  - Pare-feu DMZ IT/OT (Isolation stricte)
─────────────────────────────────────────────────────────────
NIVEAU 4 — GESTION DU SITE (Serveurs de Fichiers, Active Directory IT)
─────────────────────────────────────────────────────────────
  - DMZ INDUSTRIELLE (Historian, Bastion OT, WSUS OT)
─────────────────────────────────────────────────────────────
NIVEAU 3 — CONTRÔLE SITUATIONNEL OT (SCADA Servers, HMI Haupt)
  - Serveurs SCADA (Supervisory Control and Data Acquisition)
  - Interfaces Homme-Machine (HMI)
─────────────────────────────────────────────────────────────
NIVEAU 2 — CONTRÔLE DE PROCÉDÉ (HMI Locales, Consoles d'Ingénierie)
─────────────────────────────────────────────────────────────
NIVEAU 1 — AUTOMATES & RÈGULATION (PLC, RTU, DCS)
  - Automates Programmables (PLC : Siemens S7, Schneider Modicon)
  - Unités de Téléconduite (RTU)
  - Protocoles non chiffrés : Modbus TCP, DNP3, Profinet
─────────────────────────────────────────────────────────────
NIVEAU 0 — ÉQUIPEMENTS PHYSIQUES (Capteurs, Actionneurs, Relais)
  - Moteurs, Vannes, Capteurs de température/pression
```

---

## 2) Module — Protocoles Industriels : Modbus TCP & DNP3 (2h)

### 📖 Narration/Intuition

Les protocoles de communication industriels comme **Modbus TCP** (développé en 1979) et **DNP3** ont été conçus à une époque où les réseaux industriels étaient totalement isolés d'Internet.

**Le problème majeur :** Modbus TCP ne possède **aucune authentification, aucun chiffrement et aucun contrôle d'intégrité**. N'importe qui sur le réseau local peut envoyer une commande Modbus pour forcer l'ouverture d'un relais ou couper l'alimentation électrique d'un datacenter.

### 🔍 Anatomie Technique

**Structure d'une Trame Modbus TCP (Port 502) :**

```
 ┌──────────────────────┬─────────────┬─────────────┬─────────────────────┐
 │ Transaction ID (2B)  │ Protocol(2B)│ Length (2B) │ Unit ID / Function  │
 ├──────────────────────┼─────────────┼─────────────┼─────────────────────┤
 │   0x0001             │   0x0000    │   0x0006    │  0x01 | 0x05 (Write)│
 └──────────────────────┴─────────────┴─────────────┴─────────────────────┘
```

**Interaction Modbus TCP en Python avec PyModbus (`modbus_audit.py`) :**

```python
from pymodbus.client import ModbusTcpClient

# Connexion à l'Automate Programmable (PLC Schneider sur port 502)
plc_ip = "192.168.10.50"
client = ModbusTcpClient(plc_ip, port=502)

if client.connect():
    print(f"✅ Connecté au PLC Modbus {plc_ip}")

    # 1. Lire l'état des bobines (Coils - Relais physiques d'ouverture de porte)
    result = client.read_coils(address=0, count=8, slave=1)
    print("État actuel des relais (Coils):", result.bits)

    # 2. 🚨 SIMULATION RED TEAM : Forcer l'ouverture du relais 0 (Changer l'état)
    # (Attaque sans authentification permise par le protocole Modbus TCP !)
    client.write_coil(address=0, value=True, slave=1)
    print("⚠️ Commande Modbus Write Coil exécutée avec succès sur le PLC !")

    client.close()
```

---

## 3) Module — PLC Hardening & Réseaux Air-Gapped (2h)

### 📖 Narration/Intuition

Un réseau **Air-Gapped** est un réseau informatique physiquement isolé de tout autre réseau, et en particulier d'Internet. C'est la protection ultime recommandée pour les systèmes SCADA ultra-critiques.

Cependant, comme l'a prouvé le ver **Stuxnet** (qui a détruit les centrifugeuses iraniennes en 2010), l'Air-Gap peut être franchi via des clés USB infectées ou des ordinateurs portables de techniciens de maintenance tiers.

### 🛠️ Atelier Pratique

**Recommandations de Durcissement des Réseaux OT/ICS (IEC 62443) :**

```markdown
# FEUILLE DE ROUTE DE HARDENING OT / SCADA — BCC

1. **PARTITIONNEMENT PAR ZONES ET CONDUITS (IEC 62443-3-2)**
   - Déployer un pare-feu industriel (ex: Hirschmann / Palo Alto Industrial) entre chaque niveau du modèle Purdue.
   - Interdire STRICTEMENT tout flux direct du Niveau 4 (IT) vers le Niveau 1 (PLC).

2. **DURCISSEMENT DES AUTOMATES PROGRAMMABLES (PLC Hardening)**
   - Activer le commutateur physique **RUN / STOP** sur la clé physique du PLC (Empêche la reprogrammation à distance du firmware).
   - Désactiver les services de gestion web non sécurisés (HTTP/Telnet) sur le PLC.
   - Utiliser des versions modernisées de protocoles (ex: **Modbus Security / DNP3 Secure Authentication** avec TLS/mTLS).

3. **CONTRÔLE DU VECTEUR CLEF USB (Protection Air-Gap)**
   - Bloquer physiquement ou logiquement (via GPO/EDR) les ports USB sur toutes les consoles HMI et stations d'ingénierie OT.
   - Imposer l'utilisation d'une **Station de Décontamination USB** obligatoire (Kiosque d'analyse antivirus) avant l'introduction de toute clé USB en zone OT.
```

---

## 🏅 Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **SCADA** | Supervisory Control and Data Acquisition — Système de télégestion et contrôle industriel |
| **OT** | Operational Technology — Technologies d'exploitation contrôlant les équipements physiques |
| **PLC** | Programmable Logic Controller — Automate programmable industriel exécutant la logique métier |
| **HMI** | Human-Machine Interface — Interface Homme-Machine d'affichage et contrôle des opérateurs |
| **Air-Gap** | Isolation physique totale d'un réseau par rapport à tout autre réseau |

---

## 🏋️ Exercices & Corrigés

**Exercice 1 :** Quelle est la différence majeure d'objectifs de sécurité entre les réseaux **IT (Information Technology)** et les réseaux **OT (Operational Technology)** concernant le triptyque **CIA (Confidentialité, Intégrité, Disponibilité)** ?

**Corrigé :** Dans les réseaux **IT** traditionnels, la priorité absolue est généralement la **Confidentialité (C)** des données (ex: éviter la fuite de secrets ou de données personnelles), suivie de l'**Intégrité (I)** et de la **Disponibilité (A)**. Un serveur web peut être redémarré en urgence pour appliquer un patch de sécurité. Dans les réseaux **OT / SCADA**, la priorité absolue est la **Disponibilité (A)** et la **Sécurité Physique (Safety)** des équipements et des personnes, suivies de l'**Intégrité (I)**, tandis que la **Confidentialité (C)** vient en dernier. Arrêter un automate PLC de refroidissement de datacenter ou de chaîne de production pour appliquer un patch peut causer des dégâts matériels catastrophiques ou des pertes de vie humaine.

**Exercice 2 :** Pourquoi le protocole **Modbus TCP** classique (port 502) est-il intrinsèquement vulnérable aux attaques de type *Man-in-the-Middle* et d'injection de commandes ?

**Corrigé :** Développé en 1979 pour des liaisons séries simples, **Modbus TCP** a été encapsulé dans des paquets Ethernet/IP sans aucune modification de sa couche applicative. Il ne comporte **aucun mécanisme d'authentification** (n'importe quelle machine connectée au réseau local peut envoyer des requêtes), **aucun chiffrement** (les commandes et valeurs des capteurs transitent en texte clair), et **aucun contrôle d'intégrité** ou de numéro de séquence contre le rejeu. Ainsi, si un attaquant accède au réseau local OT, il lui suffit d'envoyer un simple paquet Modbus TCP contrefait (ex: `write_coil` ou `write_single_register`) pour modifier l'état physique des automates PLC sans que le matériel ne puisse vérifier l'identité de l'expéditeur.

---

## ❓ Banque de Questions & Test du Jour

**Q1 :** Quel est le modèle de référence international (NIST SP 800-82 / IEC 62443) découpant les réseaux industriels OT/SCADA en 6 niveaux hiérarchiques d'isolation ?
- A) Le Modèle Purdue
- B) Le Modèle OSI
- C) Le Modèle TCP/IP
- D) La Pyramide de Maslow

**Réponse : A**

**Q2 :** Quel est le composant industriel de niveau 1 (PLC) chargé d'exécuter le code de contrôle et de piloter directement les capteurs et actionneurs physiques ?
- A) Automate Programmable Industriel (PLC — Programmable Logic Controller)
- B) Serveur Web Apache
- C) Routeur Wi-Fi
- D) Switch Ethernet grand public

**Réponse : A**

**Q3 :** Quelle est la vulnérabilité majeure du protocole industriel traditionnel Modbus TCP (Port 502) ?
- A) Il ne possède aucune authentification ni chiffrement, permettant l'injection directe de commandes à tout équipement connecté au réseau
- B) Il est trop lent
- C) Il nécessite un mot de passe de 32 caractères
- D) Il ne fonctionne que sur fibre optique

**Réponse : A**

**Q4 :** Qu'est-ce qu'un réseau dit **Air-Gapped** dans la sécurité des infrastructures critiques ?
- A) Un réseau totalement isolé physiquement de tout autre réseau et d'Internet (aucune connexion filaire ni sans-fil)
- B) Un réseau Wi-Fi gratuit
- C) Un réseau utilisant le protocole Bluetooth
- D) Un serveur Cloud public

**Réponse : A**

**Q5 :** Quel célèbre ver informatique de 2010 a démontré qu'un réseau industriel SCADA physiquement isolé (Air-Gapped) pouvait être compromis via des clés USB infectées ?
- A) Stuxnet
- B) WannaCry
- C) ILOVEYOU
- D) Conficker

**Réponse : A**

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
