# TOME P2 — Réseaux & Télécoms — Jour 92 (6h) : Architectures Cloud Hybrides & Connectivité Sécurisée (AWS VPC, Direct Connect & VPN BGP)

> [!NOTE]
> **Objectif du jour :** Concevoir et sécuriser une architecture Cloud Hybride interconnectant le Datacenter sur site (On-Premises) de la BCC avec un Virtual Private Cloud (AWS VPC) : sous-réseaux publics/privés, tables de routage, Transit Gateway, tunnels VPN IPsec avec BGP dynamique et AWS Direct Connect.
>
> **Compétences visées :** `BIT-04` (A) — Architectures Réseau Cloud & Hybride | `SEC-04` (A) — Connectivité Cloud Sécurisée

---

## 1) Module — Conception d'un VPC AWS & Segmentation Réseau (2h)

### 📖 Narration/Intuition

Pour migrer certaines applications non critiques vers le Cloud tout en conservant le cœur bancaire (Core Banking) dans les Datacenters ultra-sécurisés de Kinshasa, la BCC utilise une **architecture Cloud Hybride**.

Le **VPC (Virtual Private Cloud)** est votre réseau virtuel isolé et dédié dans le Cloud AWS. Une conception réseau rigoureuse exige une segmentation stricte en sous-réseaux (Subnets) publics, privés et isolés (Database Subnets), protégés par des Security Groups (stateless/stateful firewalls).

### 🔍 Anatomie Technique

**Architecture de sous-réseaux d'un VPC Hybride (CIDR: 10.50.0.0/16) :**

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    AWS REGION (eu-west-3 Paris)                             │
│  AWS VPC (10.50.0.0/16)                                                     │
│                                                                             │
│  ┌─────────────────────────────────┐   ┌─────────────────────────────────┐  │
│  │ Availability Zone A (eu-west-3a)│   │ Availability Zone B (eu-west-3b)│  │
│  │                                 │   │                                 │  │
│  │ ┌─────────────────────────────┐ │   │ ┌─────────────────────────────┐ │  │
│  │ │ Public Subnet (10.50.1.0/24) │ │   │ │ Public Subnet (10.50.2.0/24) │ │  │
│  │ │ - NAT Gateway / ALB         │ │   │ │ - NAT Gateway / ALB         │ │  │
│  │ └──────────────┬──────────────┘ │   │ └──────────────┬──────────────┘ │  │
│  │                │                │   │                │                │  │
│  │ ┌──────────────▼──────────────┐ │   │ ┌──────────────▼──────────────┐ │  │
│  │ │ Private Subnet(10.50.10.0/24)│ │   │ │ Private Subnet(10.50.20.0/24)│ │  │
│  │ │ - App EKS / EC2 Instances   │ │   │ │ - App EKS / EC2 Instances   │ │  │
│  │ └──────────────┬──────────────┘ │   │ └──────────────┬──────────────┘ │  │
│  │                │                │   │                │                │  │
│  │ ┌──────────────▼──────────────┐ │   │ ┌──────────────▼──────────────┐ │  │
│  │ │ DB Subnet (10.50.100.0/24)  │ │   │ │ DB Subnet (10.50.200.0/24)  │ │  │
│  │ │ - RDS PostgreSQL Isolated   │ │   │ │ - RDS PostgreSQL Isolated   │ │  │
│  │ └─────────────────────────────┘ │   │ └─────────────────────────────┘ │  │
│  └─────────────────────────────────┘   └─────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2) Module — Infrastructure as Code : VPC AWS avec Terraform (2h)

### 📖 Narration/Intuition

Déployer un VPC AWS à la main via la console web est source d'erreurs d'inattention (mauvaises tables de routage, règles de Security Group ouvertes au monde `0.0.0.0/0`). Terraform permet de provisionner un VPC complet et conforme en une seule commande.

### 🔍 Anatomie Technique

**Manifeste Terraform VPC Cloud Hybride (`aws_vpc_hybride.tf`) :**

```hcl
# aws_vpc_hybride.tf — VPC AWS sécurisé pour la BCC
provider "aws" {
  region = "eu-west-3"
}

# ─── 1. Création du VPC ───────────────────────────────────────────────────────
resource "aws_vpc" "bcc_vpc" {
  cidr_block           = "10.50.0.0/16"
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = {
    Name        = "bcc-vpc-production"
    Environment = "production"
  }
}

# ─── 2. Sous-réseaux (Subnets) ────────────────────────────────────────────────
resource "aws_subnet" "public_az1" {
  vpc_id            = aws_vpc.bcc_vpc.id
  cidr_block        = "10.50.1.0/24"
  availability_zone = "eu-west-3a"

  tags = { Name = "bcc-public-eu-west-3a" }
}

resource "aws_subnet" "private_az1" {
  vpc_id            = aws_vpc.bcc_vpc.id
  cidr_block        = "10.50.10.0/24"
  availability_zone = "eu-west-3a"

  tags = { Name = "bcc-private-eu-west-3a" }
}

# ─── 3. Internet Gateway & NAT Gateway ─────────────────────────────────────────
resource "aws_internet_gateway" "igw" {
  vpc_id = aws_vpc.bcc_vpc.id
  tags   = { Name = "bcc-igw" }
}

resource "aws_eip" "nat_eip" {
  domain = "vpc"
}

resource "aws_nat_gateway" "nat_gw" {
  allocation_id = aws_eip.nat_eip.id
  subnet_id     = aws_subnet.public_az1.id
  tags          = { Name = "bcc-nat-gw" }
}

# ─── 4. Tables de Routage ─────────────────────────────────────────────────────
resource "aws_route_table" "public_rt" {
  vpc_id = aws_vpc.bcc_vpc.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.igw.id
  }

  tags = { Name = "bcc-public-route-table" }
}

resource "aws_route_table" "private_rt" {
  vpc_id = aws_vpc.bcc_vpc.id

  route {
    cidr_block     = "0.0.0.0/0"
    nat_gateway_id = aws_nat_gateway.nat_gw.id
  }

  tags = { Name = "bcc-private-route-table" }
}

resource "aws_route_table_association" "public_assoc" {
  subnet_id      = aws_subnet.public_az1.id
  route_table_id = aws_route_table.public_rt.id
}

resource "aws_route_table_association" "private_assoc" {
  subnet_id      = aws_subnet.private_az1.id
  route_table_id = aws_route_table.private_rt.id
}
```

---

## 3) Module — Connectivité Hybride : AWS Site-to-Site VPN avec BGP (2h)

### 📖 Narration/Intuition

Pour relier de manière chiffrée les serveurs du Datacenter de Kinshasa (ex: `10.0.0.0/16`) aux instances EC2 du VPC Cloud AWS (`10.50.0.0/16`), on monte un **Tunnel VPN IPsec Redondant** avec routage dynamique **BGP**.

### 🔍 Anatomie Technique

**Composants de connectivité Hybride AWS :**

```
- Customer Gateway (CGW) : Représente l'IP publique du pare-feu/routeur On-Premises (Kinshasa).
- Virtual Private Gateway (VGW) / Transit Gateway (TGW) : Concentrateur VPN côté AWS.
- Tunnel IPsec IPsec : 2 tunnels IPSec parallèles configurés automatiquement pour la haute disponibilité.
- BGP (Border Gateway Protocol) : Échange automatiquement les routes entre le Datacenter et AWS sans routage statique.
```

**Architecture du Tunnel VPN Hybride :**

```
Datacenter Kinshasa (On-Premises)                  AWS Cloud (eu-west-3)
┌───────────────────────────────┐                  ┌─────────────────────────────┐
│ Subnet: 10.0.0.0/16           │                  │ VPC Subnet: 10.50.0.0/16    │
│ Routeur FRRouting (AS 64512)  │                  │                             │
│ IP: 196.200.10.1              │                  │                             │
└──────────────┬────────────────┘                  └──────────────▲──────────────┘
               │                                                  │
               │   ══════════ Tunnel IPsec 1 ══════════           │
               ├─────────────────────────────────────────┐        │
               │   ══════════ Tunnel IPsec 2 ══════════  │        │
               ▼                                         ▼        │
┌───────────────────────────────┐                  ┌──────────────┴──────────────┐
│ Customer Gateway (CGW)        │                  │ Virtual Private GW (VGW)    │
│ (Représentation AWS)          │                  │ ASN AWS: 64513             │
└───────────────────────────────┘                  └─────────────────────────────┘
```

---

## 🏅 Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **VPC** | Virtual Private Cloud — Réseau virtuel privé isolé dans AWS |
| **IGW** | Internet Gateway — Passerelle de connexion Internet directe pour sous-réseaux publics |
| **NAT GW** | Network Address Translation Gateway — Permet la sortie Internet pour sous-réseaux privés |
| **CGW** | Customer Gateway — Représentation de l'équipement réseau sur site du client dans AWS |
| **VGW** | Virtual Private Gateway — Concentrateur VPN côté AWS |
| **TGW** | Transit Gateway — Hub de routage réseau centralisé interconnectant VPCs et VPNs |

---

## 🏋️ Exercices & Corrigés

**Exercice 1 :** Quelle est la différence de sécurité essentielle entre un **Security Group** et une **Network ACL (NACL)** dans un VPC AWS ?

**Corrigé :** Un **Security Group** est **Stateful** (à conservation d'état) et s'applique au niveau de l'instance/ENI : si le trafic entrant est autorisé sur le port 443, le trafic de réponse sortant est automatiquement autorisé. Une **Network ACL (NACL)** est **Stateless** (sans état) et s'applique au niveau du sous-réseau (Subnet) entier : elle exige de définir explicitement des règles d'entrée ET des règles de sortie (y compris les plages de ports éphémères `1024-65535`).

**Exercice 2 :** Pourquoi place-t-on les bases de données (RDS) dans un sous-réseau privé isolé sans NAT Gateway ?

**Corrigé :** Les bases de données bancaires contiennent les données les plus critiques et ne doivent sous aucun prétexte initier ou recevoir de connexions directes vers/depuis Internet. En les plaçant dans un sous-réseau privé sans route vers une Internet Gateway ni vers une NAT Gateway, les bases de données sont physiquement incapables d'accéder à Internet ou d'être jointes depuis l'extérieur, réduisant au maximum la surface d'attaque. Seules les instances applicatives situées dans le sous-réseau privé interne peuvent communiquer avec elles.

---

## ❓ Banque de Questions & Test du Jour

**Q1 :** Dans un VPC AWS, quel composant permet aux instances situées dans un sous-réseau privé d'accéder à Internet (ex: pour télécharger des mises à jour de sécurité) tout en empêchant Internet d'initier une connexion vers ces instances ?
- A) Internet Gateway (IGW)
- B) NAT Gateway
- C) Customer Gateway
- D) VPC Peering

**Réponse : B**

**Q2 :** Quelle est la fonction du protocole BGP dans le cadre d'un tunnel VPN AWS Site-to-Site ?
- A) Chiffrer les paquets de données
- B) Échanger automatiquement et dynamiquement les tables de routage entre le Datacenter sur site et le VPC AWS
- C) Remplacer le protocole DNS
- D) Attribuer des adresses MAC aux instances EC2

**Réponse : B**

**Q3 :** Les Security Groups dans AWS sont-ils avec état (Stateful) ou sans état (Stateless) ?
- A) Stateless (sans état)
- B) Stateful (avec état — la réponse est automatiquement autorisée)
- C) Cela dépend de la région AWS
- D) Ils ne gèrent que le trafic UDP

**Réponse : B**

**Q4 :** Quel service AWS fournit une connexion réseau filaire dédiée et privée entre un Datacenter sur site et AWS, sans passer par Internet public ?
- A) AWS Direct Connect
- B) AWS Site-to-Site VPN
- C) AWS Route 53
- D) AWS CloudFront

**Réponse : A**

**Q5 :** Dans le CIDR IPv4 `10.50.0.0/16`, combien d'adresses IP uniques sont théoriquement disponibles au total ?
- A) 256
- B) 65 536
- C) 1 024
- D) 16 777 216

**Réponse : B**

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
