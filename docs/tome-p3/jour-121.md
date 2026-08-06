# TOME P3 — Cloud Native, DevOps & Cyberdéfense — Jour 121 (6h) : Sécurité des Réseaux 5G / Core Network & NFV (Network Functions Virtualization, 5G AKA & Slice Isolation)

> [!NOTE]
> **Objectif du jour :** Comprendre l'architecture et la sécurité des réseaux mobiles de nouvelle génération (5G Standalone / Core Network) et de la virtualisation des fonctions réseau (NFV) : protocole d'authentification 5G AKA, isolation cryptographique du Network Slicing, sécurité de l'interface SBI (Service-Based Architecture / OAuth2 TLS), et déploiement de fonctions réseau virtuelles (VNF/CNF).
>
> **Compétences visées :** `BIT-04` (A) — Réseaux Mobiles & 5G Core | `SEC-04` (A) — Cyberdéfense des Infrastructures Télécoms (5G/NFV)

---

## 1) Module — Architecture 5G Standalone (SA) & SBA (Service-Based Architecture) (2h)

### 📖 Narration/Intuition

Les réseaux télécoms 5G ne servent pas uniquement aux téléphones portables : ils transportent les communications critiques de la Banque Centrale du Congo, les infrastructures bancaires distantes et les réseaux d'urgence.

Contrairement à la 4G/LTE qui s'appuyait sur des équipements matériels propriétaires, la **5G Standalone (5G SA)** repose sur une **Service-Based Architecture (SBA)** où toutes les fonctions du cœur de réseau (AMF, SMF, UPF, AUSF) sont des microservices logiciels conteneurisés communiquant entre eux via des APIs REST HTTP/2 chiffrées en TLS.

### 🔍 Anatomie Technique

**Architecture du Cœur de Réseau 5G SA (Service-Based Architecture) :**

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ 5G CORE NETWORK CONTROL PLANE (SBA - Service-Based Architecture)            │
│                                                                             │
│   ┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌───────────┐ │
│   │ AMF (Access │     │ SMF (Session│     │ AUSF (Auth  │     │ UDM (User │ │
│   │ Management) │     │ Management) │     │ Server)     │     │ Data Mgmt)│ │
│   └──────┬──────┘     └──────┬──────┘     └──────┬──────┘     └─────┬─────┘ │
│          │                   │                   │                  │       │
│  ════════╧═══════════════════╧═══════════════════╧══════════════════╧═════  │
│                   SBI (Service-Based Interface - HTTP/2 + TLS 1.3)          │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │ Protocol N4 (PFCP)
┌──────────────────────────────────────▼──────────────────────────────────────┐
│ 5G USER PLANE                                                               │
│   User Equipment (UE) ─── gNodeB (5G RAN) ─── UPF (User Plane Function)     │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2) Module — Authentification 5G AKA & Sécurité du Network Slicing (2h)

### 📖 Narration/Intuition

En 5G, l'identité permanente de l'abonné (SUPI) n'est **jamais transmise en clair sur les ondes radio** (contrairement à l'IMSI en 2G/3G/4G qui permettait le piratage par des fausses antennes "IMSI Catchers"). Elle est chiffrée avec la clé publique du cœur de réseau sous forme de **SUCI (Subscription Concealed Identifier)**.

Le **Network Slicing (Tranchage Réseau)** permet de créer des réseaux virtuels hermétiques indépendants sur la même infrastructure physique (ex: une tranche ultra-sécurisée dédiée aux transactions bancaires RTGS avec une latence garantie < 1ms, et une tranche dédiée au grand public).

### 🔍 Anatomie Technique

**Flux d'Authentification 5G AKA (Authentication and Key Agreement) :**

```
Équipement (UE / SIM)             Antenne (gNodeB)            5G Core AMF / AUSF            UDM / ARPF
        │                                │                          │                            │
        │── 1. Envoi SUCI (Chiffré) ────→│                          │                            │
        │                                │── 2. Transmission ──────→│                            │
        │                                                           │── 3. Demande de vecteur ──→│
        │                                                           │←── 4. Vecteur RAND/AUTN ───┤
        │←── 5. Défi RAND / AUTN ───────────────────────────────────┤                            │
        │                                                           │                            │
  (Calcule RES* via K)                                              │                            │
        │── 6. Réponse RES* ───────────────────────────────────────→│                            │
        │                                                           │ (Vérifie RES* == XRES*)    │
        │←── 7. Authentification Réussie & Clé K_SEAF générée ──────┤                            │
```

---

## 3) Module — Inspection de Trafic Cœur 5G avec Open5GS (2h)

### 📖 Narration/Intuition

Pour auditer la sécurité d'un réseau 5G, les ingénieurs télécoms déploient des cœurs de réseau open-source comme **Open5GS** dans Kubernetes pour analyser les échanges d'APIs SBI et les paquets de plan utilisateur (UPF / GTP-U).

### 🔍 Anatomie Technique

**Inspection des interfaces SBI d'un cœur 5G Open5GS avec TShark :**

```bash
# Capture du trafic HTTP/2 SBI entre le serveur AMF et AUSF sur l'interface virtuelle 5G
sudo tshark -i ogstun -Y "http2" -T fields \
  -e frame.time -e ip.src -e ip.dst -e http2.type -e http2.headers.path

# Inspection des paquets d'encapsulation utilisateur GTP-U (GPRS Tunnelling Protocol)
sudo tshark -i eth0 -Y "gtp" -V
```

---

## 🏅 Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **SBA** | Service-Based Architecture — Architecture du cœur 5G basée sur des microservices HTTP/2 |
| **SUPI** | Subscription Permanent Identifier — Identifiant permanent unique de l'abonné 5G |
| **SUCI** | Subscription Concealed Identifier — Identifiant 5G anonymisé et chiffré transmis sur les ondes |
| **AMF** | Access and Mobility Management Function — Fonction 5G de gestion des accès et de la mobilité |
| **UPF** | User Plane Function — Fonction 5G de routage du trafic de données des abonnés |
| **NFV** | Network Functions Virtualization — Virtualisation des fonctions matérielles réseau en logiciels |

---

## 🏋️ Exercices & Corrigés

**Exercice 1 :** Comment le protocole **5G AKA** résout-il le problème des fausses antennes-relais (IMSI Catchers) qui affectait les réseaux 2G, 3G et 4G ?

**Corrigé :** Dans les réseaux 2G/3G/4G, l'identifiant permanent de la carte SIM (l'IMSI) était transmis en clair sur les ondes radio lors de la première connexion, permettant à une fausse antenne (IMSI Catcher) d'intercepter l'identité et de localiser l'utilisateur. En **5G**, l'identifiant permanent (SUPI) est **chiffré directement dans la carte SIM** avec la clé publique du cœur de réseau (Elliptic Curve ECIES) pour devenir un **SUCI**. Le SUCI change à chaque connexion. Une fausse antenne qui intercepte le SUCI est incapable de le déchiffrer ou d'identifier l'utilisateur.

**Exercice 2 :** Qu'est-ce que le **Network Slicing** 5G et comment garantit-il la sécurité des communications bancaires critiques ?

**Corrigé :** Le **Network Slicing** découpe une infrastructure réseau 5G physique en plusieurs réseaux virtuels étanches ("Tranches" ou Slices) configurés sur-mesure. Une tranche réseau dédiée aux transactions bancaires de la BCC bénéficie d'une isolation cryptographique complète (S-NSSAI), d'un débit garanti et d'une latence minimale, sans risquer d'être perturbée ou interceptée par le trafic des autres utilisateurs s'exécutant sur des tranches publiques.

---

## ❓ Banque de Questions & Test du Jour

**Q1 :** Quelle architecture du cœur de réseau 5G Standalone (5G SA) remplace les anciens équipements matériels propriétaires par des microservices logiciels communiquant en HTTP/2 et TLS ?
- A) SBA (Service-Based Architecture)
- B) MS-DOS
- C) Câble VGA
- D) Disquette

**Réponse : A**

**Q2 :** Quel identifiant 5G anonymisé et chiffré est transmis sur les ondes radio à la place de l'ancien IMSI pour empêcher le piratage par IMSI Catchers ?
- A) SUCI (Subscription Concealed Identifier)
- B) Adresse MAC
- C) Numéro de téléphone en clair
- D) Code PIN

**Réponse : A**

**Q3 :** Quelle fonctionnalité 5G permet de créer des réseaux virtuels isolés et étanches sur une même infrastructure physique pour garantir la qualité de service et la sécurité de communications critiques ?
- A) Network Slicing (Tranchage Réseau)
- B) WiFi gratuit
- C) Bluetooth
- D) Formatage de disque

**Réponse : A**

**Q4 :** Dans le cœur de réseau 5G, quelle fonction réseau (User Plane Function) est responsable du routage et du transfert des paquets de données de l'utilisateur vers Internet ou le réseau d'entreprise ?
- A) UPF
- B) AMF
- C) AUSF
- D) UDM

**Réponse : A**

**Q5 :** Quel protocole applicatif est utilisé par la Service-Based Interface (SBI) pour faire communiquer les microservices du Control Plane 5G entre eux ?
- A) HTTP/2 avec chiffrement TLS 1.3
- B) Telnet non sécurisé
- C) FTP
- D) SMTP

**Réponse : A**

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
