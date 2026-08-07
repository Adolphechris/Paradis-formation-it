# TOME P6 — Cybersécurité Expert & Red Team Avancé — Jour 293 (6h) : Telecom & 5G Core Security (Architecture 5G SA/NSA, GTP Inspection, Protocoles Diameter/SCTP, IMSI Catching & Network Slicing Security)

> [!NOTE]
> **Objectif du jour :** Maîtriser la **cybersécurité des réseaux de télécommunications mobiles et du cœur de réseau 5G (5G Core Security)** : comprendre l'architecture 5G Standalone (SA) basée sur des microservices (SBA - Service-Based Architecture), analyser les vulnérabilités du protocole **GTP (GPRS Tunneling Protocol)** et **Diameter/SCTP**, contrer les attaques par **IMSI Catching / SUPI Concealment**, et sécuriser le **Network Slicing**.
>
> **Compétences visées :** `TEL-01` (A) — 5G Core Architecture & SBA Security | `TEL-02` (A) — Telecom Protocols Security (GTP, Diameter, SCTP)

---

## 1) Module — Architecture 5G Core (SBA) vs 4G LTE (2h)

### 📖 Narration/Intuition

La 5G Standalone (5G SA) abandonne les équipements télécoms propriétaires au profit d'une **Service-Based Architecture (SBA)** où les fonctions réseau (AMF, SMF, UPF, NRF) s'exécutent sous forme de microservices HTTP/2 et REST isolés dans des conteneurs Cloud-Native. Cependant, les interfaces d'interconnexion (roaming international) transportent encore des protocoles historiques vulnérables (GTP-U, Diameter, SS7).

```
[ UE / Smartphone ] ──(NR Radio)──► [ gNB / Antenne ] ──(NG-U / GTP-U)──► [ UPF (User Plane) ] ──► Internet
                                                                                │
                                                                       [ 5G Core SBA (HTTP/2 REST) ]
                                                                       (AMF, SMF, NRF, AUSF, UDM)
```

---

## 2) Module — Inspection de Trafic GTP & Diameter avec Scapy (`telecom_inspection.py`) (2h)

### 🛠️ Atelier Pratique

**Détection et injection de paquets GTP-U avec Scapy (`gtp_scanner.py`) :**

```python
from scapy.all import *
from scapy.contrib.gtp import GTP_U_Header

# Détection de paquets GTP-U (GPRS Tunneling Protocol User Plane - Port UDP 2152)

def audit_gtp_traffic(pcap_file: str):
    print(f"[*] Analyse de la capture télécom : {pcap_file}")
    packets = rdpcap(pcap_file)

    gtp_count = 0
    for pkt in packets:
        if pkt.haslayer(GTP_U_Header):
            gtp_count += 1
            teid = pkt[GTP_U_Header].teid
            print(f"[!] Paquet GTP-U détecté ! Tunnel TEID : {hex(teid)} | Source : {pkt[IP].src} -> Dest : {pkt[IP].dst}")

    print(f"[+] Total de paquets GTP-U analysés : {gtp_count}")

# Un attaquant ayant accès au réseau d'interconnexion IPX/GRX peut utiliser des TEID usurpés
# pour injecter du trafic directement dans le réseau d'un opérateur mobile !
```

---

## 3) Module — Sécurisation de l'Identité 5G (SUPI vs SUCI) (2h)

### 🛠️ Protection contre l'IMSI Catching en 5G

```python
# En 2G/3G/4G, l'identifiant unique de la carte SIM (IMSI) transite en clair sur les ondes radio.
# Un "IMSI Catcher" (Fausse antenne-relais) intercepte cet identifiant pour géolocaliser la victime.
#
# En 5G SA, l'IMSI est remplacé par le SUPI (Subscription Permanent Identifier).
# Le SUPI est TOUJOURS chiffré sur les ondes radio avec la clé publique du réseau (Home Network) -> SUCI (Subscription Concealed Identifier).

def supi_to_suci_encryption(supi: str, home_network_public_key: str) -> str:
    print(f"[*] Chiffrement du SUPI 5G : {supi}")
    # Simulation du chiffrement ECIES (Elliptic Curve Integrated Encryption Scheme)
    suci = f"suci-0-001-01-0-0-0-{hash(supi)[:8]}"
    print(f"[+] SUCI chiffré transmis sur les ondes radio : {suci}")
    print("[+] L'IMSI Catcher est incapable de lire le SUPI d'origine (Protection 5G SA) !")
    return suci

supi_to_suci_encryption("208101234567890", "EC_PUB_KEY_XYZ")
```

---

## 🏅 Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **5G SA** | 5G Standalone — Réseau 5G pur avec cœur de réseau 5GC indépendant |
| **SBA** | Service-Based Architecture — Architecture du cœur 5G basée sur des microservices REST HTTP/2 |
| **GTP** | GPRS Tunneling Protocol — Protocole de tunneling transportant les données mobiles (Port UDP 2152) |
| **SUPI / SUCI** | Subscription Permanent / Concealed Identifier — Identifiant 5G chiffré remplaçant l'IMSI |

---

## ❓ Banque de Questions & Test du Jour

**Q1 :** Quelle est l'évolution majeure d'architecture réseau introduite par la **5G Standalone (5G SA)** au niveau du cœur de réseau (5G Core) ?
- A) Le passage à une Service-Based Architecture (SBA) où les fonctions réseau (AMF, SMF, UPF) s'exécutent comme des microservices conteneurisés communiquant en HTTP/2 REST
- B) La suppression de la carte SIM
- C) L'utilisation exclusive du Wi-Fi
- D) L'abandon du chiffrement

**Réponse : A**

**Q2 :** Comment la 5G SA protège-t-elle les utilisateurs contre les attaques par **IMSI Catcher** (fausses antennes-relais) ?
- A) En chiffrant l'identifiant permanent (SUPI) sur les ondes radio avec la clé publique du réseau pour produire un identifiant dissimulé (SUCI)
- B) En interdisant l'utilisation des téléphones
- C) En utilisant du papier aluminium
- D) En changeant d'opérateur toutes les heures

**Réponse : A**

**Q3 :** Quel protocole télécom historique (port UDP 2152) est utilisé pour encapsuler et tunneler le trafic de données des utilisateurs mobiles (User Plane) entre les antennes et le cœur de réseau ?
- A) GTP-U (GPRS Tunneling Protocol User Plane)
- B) HTTP/1.1
- C) SSH
- D) BGP

**Réponse : A**

**Q4 :** Dans la 5G Core SBA, quelle fonction réseau (Network Function) agit comme un annuaire centralisé permettant aux microservices de découvrir les instances d'autres fonctions réseau disponibles ?
- A) NRF (Network Repository Function)
- B) AMF
- C) UPF
- D) SMF

**Réponse : A**

**Q5 :** Qu'est-ce que le **Network Slicing** en 5G ?
- A) La création de tranches de réseau virtuel isolées et personnalisées sur une même infrastructure physique pour répondre à des besoins spécifiques (ex: tranche véhicules autonomes vs tranche grand public)
- B) La découpe des câbles de fibre optique
- C) Le partage de mot de passe Wi-Fi
- D) La suppression des antennes

**Réponse : A**

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
