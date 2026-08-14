# TOME P2 — Réseaux & Télécoms — Jour 92 (6h) : Architectures Cloud Hybrides & Connectivité Sécurisée (VPC, VPN IPsec & BGP)

> [!NOTE]
> **Objectif du jour :** Concevoir et sécuriser une architecture Cloud Hybride interconnectant un Datacenter sur site (On-Premises) avec un Virtual Private Cloud (VPC) : sous-réseaux publics/privés, tables de routage, tunnels VPN IPsec avec BGP dynamique.
>
> **Compétences visées :** `BIT-04` (A) — Architectures Réseau Cloud & Hybride | `SEC-04` (A) — Connectivité Cloud Sécurisée

---

## 1) Module — Conception d'un VPC & Segmentation Réseau (2h)

### 📖 Narration/Intuition

Pour migrer certaines applications vers le Cloud tout en conservant le cœur métier dans les Datacenters sur site, on utilise une **architecture Cloud Hybride**.

Le **VPC (Virtual Private Cloud)** est un réseau virtuel isolé et dédié dans le Cloud. Une conception rigoureuse exige une segmentation stricte en sous-réseaux (Subnets) publics, privés et isolés (Database Subnets).

### 🔍 Anatomie Technique

**Architecture de sous-réseaux d'un VPC Hybride (CIDR: 10.50.0.0/16) :**

```
┌──────────────────────────────────────────────────────────────────┐
│                    CLOUD PROVIDER (Région)                        │
│  VPC (10.50.0.0/16)                                               │
│                                                                  │
│  ┌──────────────────────────┐   ┌──────────────────────────┐    │
│  │ Public Subnet (10.50.1.0/24) │ │ Public Subnet (10.50.2.0/24) │ │
│  │ - NAT Gateway / ALB     │   │ - NAT Gateway / ALB     │    │
│  └────────────┬─────────────┘   └────────────┬─────────────┘    │
│               │                              │                  │
│  ┌────────────▼─────────────┐   ┌────────────▼─────────────┐    │
│  │ Private Subnet(10.50.10.0/24)│ │ Private Subnet(10.50.20.0/24)│ │
│  │ - Instances applicatives │   │ - Instances applicatives │    │
│  └────────────┬─────────────┘   └────────────┬─────────────┘    │
│               │                              │                  │
│  ┌────────────▼─────────────┐   ┌────────────▼─────────────┐    │
│  │ DB Subnet (10.50.100.0/24)  │ │ DB Subnet (10.50.200.0/24)  │ │
│  │ - Bases de données      │   │ - Bases de données      │    │
│  └──────────────────────────┘   └──────────────────────────┘    │
└──────────────────────────────────────────────────────────────────┘
```

**Différence essentielle Security Group vs NACL :**
- **Security Group** : Stateful (état), s'applique à l'instance. Si le trafic entrant est autorisé, le trafic de réponse sortant est automatiquement autorisé.
- **Network ACL (NACL)** : Stateless (sans état), s'applique au sous-réseau. Il faut définir explicitement les règles d'entrée ET de sortie.

---

## 2) Module — Connectivité Hybride : VPN IPsec avec BGP (2h)

### 📖 Narration/Intuition

Pour relier de manière chiffrée les serveurs du Datacenter sur site aux instances du VPC Cloud, on monte un **Tunnel VPN IPsec Redondant** avec routage dynamique **BGP**.

### 🔍 Anatomie Technique

**Composants de la connectivité hybride :**

```
Datacenter Sur Site                          Cloud Provider
┌───────────────────────────┐                ┌─────────────────────────┐
│ Subnet: 10.0.0.0/16       │                │ VPC Subnet: 10.50.0.0/16│
│ Routeur (AS 64512)        │                │                         │
│ IP: 196.200.10.1          │                │                         │
└──────────────┬────────────┘                └─────────────▲───────────┘
               │   ══════════ Tunnel IPsec ══════════           │
               ├─────────────────────────────────────────────────┤
               │   ══════════ Tunnel IPsec (secours) ═══════    │
               ▼                                                 ▼
┌───────────────────────────┐                ┌─────────────────────────┐
│ Customer Gateway (CGW)    │                │ Virtual Private GW (VGW)│
│                           │                │ ASN Cloud: 64513        │
└───────────────────────────┘                └─────────────────────────┘
```

**Rôle de BGP :** Échanger automatiquement les tables de routage entre le Datacenter et le Cloud sans configuration statique. En cas de coupure d'un tunnel, BGP bascule automatiquement le trafic vers le tunnel de secours.

---

## 3) Module — Bonnes Pratiques de Sécurité Cloud Hybride (2h)

### 🔍 Anatomie Technique

**Checklist de sécurité pour un VPC hybride :**

```
1. Réseaux
   - Segmenter en sous-réseaux publics, privés et de base de données
   - Ne jamais exposer une base de données directement sur Internet
   - Utiliser des NAT Gateways pour les sorties Internet des sous-réseaux privés

2. Connectivité
   - Préférer un lien dédié (Direct Connect / ExpressRoute) au VPN pour les volumes élevés
   - Configurer 2 tunnels VPN parallèles pour la haute disponibilité
   - Activer BGP pour le routage dynamique et la détection de coupure

3. Sécurité
   - Security Groups en mode "deny-all by default" avec règles explicites
   - Network ACLs comme couche de défense supplémentaire (stateless)
   - Chiffrement TLS 1.3 pour toutes les communications inter-services
   - Journalisation (Flow Logs) de tout le trafic VPC pour audit
```

---

## 🏅 Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **VPC** | Virtual Private Cloud — Réseau virtuel privé isolé dans le Cloud |
| **NAT GW** | NAT Gateway — Permet la sortie Internet pour sous-réseaux privés |
| **CGW** | Customer Gateway — Représentation de l'équipement sur site dans le Cloud |
| **VGW** | Virtual Private Gateway — Concentrateur VPN côté Cloud |
| **BGP** | Border Gateway Protocol — Protocole de routage dynamique entre réseaux autonomes |

---

## 🏋️ Exercices & Corrigés

**Exercice 1 :** Pourquoi place-t-on les bases de données dans un sous-réseau privé sans accès direct à Internet ?

**Corrigé :** Les bases de données contiennent les données les plus critiques. En les plaçant dans un sous-réseau privé sans route vers Internet, elles sont physiquement incapables d'accéder à l'extérieur ou d'être jointes depuis Internet, réduisant la surface d'attaque.

---

**Exercice 2 :** Quelle est la différence entre un Security Group et une Network ACL ?

**Corrigé :** Le Security Group est **stateful** (conserve l'état des connexions) et s'applique au niveau de l'instance. La NACL est **stateless** (sans état) et s'applique au niveau du sous-réseau, nécessitant des règles d'entrée ET de sortie explicites.

---

## ❓ Banque de Questions & Test du Jour

**Q1 :** Dans un VPC Cloud, quel composant permet aux instances d'un sous-réseau privé d'accéder à Internet tout en protégeant leur identité ?
- A) Internet Gateway (IGW)
- B) NAT Gateway
- C) Customer Gateway
- D) VPC Peering

**Réponse : B**

---

**Q2 :** Quel protocole permet d'échanger automatiquement les tables de routage entre un Datacenter sur site et un VPC Cloud ?
- A) OSPF
- B) BGP
- C) DNS
- D) HTTP

**Réponse : B**

---

**Q3 :** Les Security Groups dans le Cloud sont-ils stateful ou stateless ?
- A) Stateless
- B) Stateful
- C) Cela dépend du provider
- D) Ils ne gèrent que le trafic UDP

**Réponse : B**

---

**Q4 :** Dans le CIDR `10.50.0.0/16`, combien d'adresses IP sont disponibles ?
- A) 256
- B) 65 536
- C) 1 024
- D) 16 777 216

**Réponse : B**

---

**Q5 :** Quel est le rôle principal d'un Customer Gateway (CGW) dans une architecture hybride ?
- A) Héberger les bases de données
- B) Représenter l'équipement réseau sur site du client dans la configuration Cloud
- C) Chiffrer les e-mails
- D) Gérer les licences logicielles

**Réponse : B**

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
