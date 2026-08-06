# TOME P3 — Cloud Native, DevOps & Cyberdéfense — Jour 138 (6h) : Sécurité de la Virtualisation des Accès Réseau & Zero Trust Network Access (ZTNA, Software-Defined Perimeter - SDP & Tailscale / Headscale Mesh)

> [!NOTE]
> **Objectif du jour :** Déployer des solutions d'Accès Réseau Zero Trust (ZTNA / Software-Defined Perimeter) pour remplacer les VPNs d'entreprise traditionnels : architecture SDP (Controller, Gateway, Client), réseau maillé chiffré basé sur WireGuard avec Tailscale / Headscale, authentification SSO OIDC et règles de contrôle d'accès granulaires au niveau du poste (Device Posture Check).
>
> **Compétences visées :** `SEC-04` (A) — ZTNA & Software-Defined Perimeter | `BIT-04` (A) — Tailscale/Headscale Mesh Networking

---

## 1) Module — Du VPN Traditionnel au ZTNA / SDP (2h)

### 📖 Narration/Intuition

Le modèle VPN traditionnel (IPsec / OpenVPN client-to-site) est dépassé : lorsqu'un employé itinérant ou un sous-traitant se connecte au VPN, son ordinateur rejoint directement le sous-réseau d'entreprise L3/L4. Si son ordinateur est infecté par un ransomware, le malware se propage instantanément sur l'ensemble des serveurs internes.

Le **ZTNA (Zero Trust Network Access)** s'appuie sur le concept de **Périmètre Défini par Logiciel (SDP - Software-Defined Perimeter)**. Il applique le principe d'**Invisibilité Réseau** : aucune ressource de l'entreprise n'a d'IP publique ou de port ouvert sur Internet. Le client s'authentifie d'abord auprès du contrôleur d'identité, puis une passerelle éphémère établit un tunnel chiffré point-à-point vers la **seule application autorisée**, sans aucun accès au reste du réseau.

### 🔍 Anatomie Technique

**Comparaison VPN Traditionnel vs ZTNA / SDP :**

```
┌─────────────────────────────────────────────────────────────┐
│ 1. VPN TRADITIONNEL (ACCÈS RÉSEAU GLOBAL L3)                │
│    Poste Client ─── Connecté au VPN ───> Accès au Réseau 10.0.0.0/16 │
│    (Risque : Scan de réseau et propagation de Ransomware)   │
└─────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. ZTNA / SDP (ACCÈS APPLICATIF ISOLE L7)                   │
│    Poste Client ─── Auth SSO OIDC ───> SDP Controller       │
│                                              │              │
│    Tunnel Chiffré Point-à-Point éphémère ────┴─────────────>│ Application A Seule
│    (Réseau 10.0.0.0/16 INVISIBLE & INACCESSIBLE)            │ (Ex: BDD 10.0.20.5:5432)
└─────────────────────────────────────────────────────────────┘
```

---

## 2) Module — Déploiement d'un Maillage ZTNA avec Headscale (Open-Source Tailscale) (2h)

### 📖 Narration/Intuition

**Tailscale** est la solution ZTNA / Mesh VPN la plus populaire du monde open-source. Elle s'appuie sur le protocole **WireGuard** pour interconnecter des machines (serveurs, ordinateurs, téléphones) dans un maillage chiffré direct (Peer-to-Peer) sans passer par un serveur central pour le trafic de données.

**Headscale** est l'implémentation open-source auto-hébergée (On-Premises) du serveur de contrôle Tailscale, permettant à la Banque Centrale du Congo de conserver un contrôle 100% privé sur son réseau maillé Zero Trust.

### 🔍 Anatomie Technique

**Architecture et déploiement d'Headscale On-Premises :**

```bash
# 1. Installation de Headscale sur un serveur Linux d'infrastructure
wget https://github.com/juanfont/headscale/releases/download/v0.22.3/headscale_0.22.3_linux_amd64.deb
sudo dpkg -i headscale_0.22.3_linux_amd64.deb

# 2. Créer un utilisateur/espace de noms réseau pour la BCC
sudo headscale users create bcc-enterprise

# 3. Générer une clé d'enregistrement de machine (AuthKey)
sudo headscale preauthkeys create --user bcc-enterprise --reusable --expiration 24h

# 4. Connexion d'un poste client à l'infrastructure ZTNA privée
sudo tailscale up --login-server https://headscale.bcc.internal:8080 --authkey <AUTH_KEY_GENERATED>

# 5. Vérifier le maillage de machines interconnectées
sudo tailscale status
```

---

## 3) Module — Contrôle de Posture d'Équipement (Device Posture Check) (2h)

### 📖 Narration/Intuition

En ZTNA, l'authentification de l'utilisateur ne suffit pas. Avant d'accorder l'accès à une application sensible, le contrôleur ZTNA vérifie le **Device Posture (l'état de santé du poste client)** : l'antivirus EDR est-il actif ? Le disque dur est-il chiffré par BitLocker/LUKS ? Le système d'exploitation est-il à jour ? Si le poste n'est pas conforme, l'accès est automatiquement refusé.

### 🔍 Anatomie Technique

**Politique d'Accès ZTNA basée sur la posture (`ztna-policy.json`) :**

```json
{
  "Version": "2026-01",
  "PolicyName": "Accès-Application-Comptabilité",
  "Rules": [
    {
      "UserGroup": "Equipe-Finance",
      "RequiredPosture": {
        "OS_Version": ">= Ubuntu 22.04 / Windows 11 23H2",
        "DiskEncryption": true,
        "EDR_Agent_Running": "CrowdStrike / Falcon",
        "ScreenLockTimeoutMinutes": "<= 5"
      },
      "Action": "ALLOW",
      "TargetResource": "https://finance.bcc.internal"
    }
  ]
}
```

---

## 🏅 Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **ZTNA** | Zero Trust Network Access — Accès réseau sans confiance basée sur l'identité et l'application |
| **SDP** | Software-Defined Perimeter — Périmètre défini par logiciel rendant les serveurs invisibles |
| **Headscale** | Serveur de contrôle open-source auto-hébergé compatible avec les clients Tailscale |
| **Device Posture** | Vérification automatique de l'état de santé et de sécurité d'un équipement client |

---

## 🏋️ Exercices & Corrigés

**Exercice 1 :** Quelle est la différence majeure d'architecture entre l'**Invisibilité Réseau (Dark Cloud)** offerte par le ZTNA / SDP et un serveur VPN traditionnel ?

**Corrigé :** Un serveur **VPN traditionnel** écoute sur une adresse IP publique avec un port ouvert (ex: UDP 1194 pour OpenVPN ou UDP 500/4500 pour IPsec). N'importe quel pirate sur Internet peut scanner cette IP et tenter d'exploiter des vulnérabilités de la pile VPN. Dans une architecture **ZTNA / SDP (Software-Defined Perimeter)**, les passerelles et serveurs d'application sont **100% invisibles (Dark)** : ils n'ouvrent aucun port écoute sur Internet. L'accès est initié exclusivement par une connexion sortante chiffrée après authentification et validation auprès du contrôleur ZTNA central.

**Exercice 2 :** Comment la solution maillée **Tailscale / Headscale** basée sur WireGuard établit-elle une connexion directe (Peer-to-Peer) entre deux machines situées derrière des pare-feux NAT complexes (NAT Traversal) ?

**Corrigé :** Tailscale utilise une technique avancée appelée **DERP / STUN / NAT Traversal (UDP Hole Punching)**. Le serveur de contrôle (Headscale) aide les deux machines à découvrir leurs adresses IP publiques et ports éphémères attribués par leurs routeurs NAT respectifs. Les deux machines envoient simultanément des paquets UDP l'une vers l'autre pour ouvrir dynamiquement des "trous" dans leurs pare-feux NAT, établissant ainsi une **connexion chiffrée directe de machine à machine (Peer-to-Peer)** à haute vitesse sans faire transiter les données par le serveur central.

---

## ❓ Banque de Questions & Test du Jour

**Q1 :** Quelle architecture d'accès sécurisé remplace les VPNs d'entreprise traditionnels en accordant un accès restreint application par application sans ouvrir l'accès au réseau IP global ?
- A) ZTNA (Zero Trust Network Access) / SDP
- B) MS Paint
- C) Disquette
- D) Câble VGA

**Réponse : A**

**Q2 :** Quel serveur de contrôle open-source auto-hébergé (On-Premises) permet de déployer un maillage réseau privé Zero Trust compatible avec les clients Tailscale et WireGuard ?
- A) Headscale
- B) Word
- C) Calculator
- D) Paint

**Réponse : A**

**Q3 :** En ZTNA, que désigne le contrôle "Device Posture Check" effectué avant d'accorder l'accès à une application d'entreprise ?
- A) La vérification automatique de l'état de sécurité et de conformité du poste client (antivirus actif, chiffrement du disque, OS à jour)
- B) La couleur de la souris
- C) Le poids de l'écran
- D) Le nom de la marque de l'ordinateur

**Réponse : A**

**Q4 :** Quel est le principe de l'invisibilité réseau (Dark Cloud) fourni par le concept Software-Defined Perimeter (SDP) ?
- A) Les serveurs d'application n'exposent aucun port ouvert ni adresse IP publique écoutant sur Internet, rendant l'infrastructure invisible aux scans des pirates
- B) Éteindre les lumières du datacenter
- C) Peindre les serveurs en noir
- D) Déconnecter l'électricité

**Réponse : A**

**Q5 :** Quel protocole VPN moderne et ultra-rapide est utilisé comme moteur de chiffrement sous-jacent par la solution Tailscale / Headscale ?
- A) WireGuard
- B) PPTP
- C) L2TP non sécurisé
- D) Telnet

**Réponse : A**

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
