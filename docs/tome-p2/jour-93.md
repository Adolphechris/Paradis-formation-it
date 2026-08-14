# TOME P2 — Réseaux & Télécoms — Jour 93 (6h) : Modèle Zero Trust Architecture (ZTA) & Micro-segmentation Réseau (BeyondCorp, WireGuard & SPIFFE/SPIRE)

> [!NOTE]
> **Objectif du jour :** Comprendre et mettre en œuvre le modèle de sécurité Zero Trust ("Ne jamais faire confiance, toujours vérifier") : disparition du périmètre réseau traditionnel, micro-segmentation avec WireGuard mesh, vérification d'identité dynamique des workloads avec SPIFFE/SPIRE et architecture d'accès BeyondCorp.
>
> **Compétences visées :** `SEC-04` (A) — Architectures Réseau Avancées | `SEC-01` (A) — Modèle Zero Trust & Contrôle d'Accès

---

## 1) Module — Fondamentaux du Modèle Zero Trust Architecture (ZTA) (2h)

### 📖 Narration/Intuition

Pendant des décennies, la sécurité réseau reposait sur le modèle **"Château et douves" (Perimeter Security)** : une fois qu'un utilisateur ou un serveur franchissait le pare-feu du Datacenter (la douve), il était considéré comme "de confiance" et pouvait communiquer librement avec les autres serveurs.

Ce modèle est dépassé : si un attaquant s'infiltre sur un poste de travail ou un serveur DMZ, il peut se déplacer latéralement sur tout le réseau. 

Le **Zero Trust (NIST SP 800-207)** inverse ce paradigme : **"Never Trust, Always Verify"**. L'emplacement réseau (adresse IP, réseau interne) n'accorde plus AUCUNE confiance par défaut. Chaque demande d'accès doit être réauthentifiée, réautorisée et chiffrée de bout en bout.

### 🔍 Anatomie Technique

**Composants du Modèle Zero Trust (NIST SP 800-207) :**

```
Utilisateur / Workload                          Policy Enforcement Point (PEP)         Ressource Cible
┌─────────────────────┐                          ┌────────────────────────┐           ┌──────────────┐
│ Demande d'accès     │                          │ Proxy d'accès /        │           │ Base de      │
│ (ID + Device Health)├─────────────────────────→│ Micro-segmentation     ├──────────→│ Données      │
└─────────────────────┘                          └───────────▲────────────┘           └──────────────┘
                                                             │
                                                   Évalue chaque requête
                                                             │
                                                 ┌───────────┴────────────┐
                                                 │ Policy Decision Point  │
                                                 │ (PDP) / Policy Engine  │
                                                 └────────────────────────┘
```

**Les 3 Principes Fondamentaux Zero Trust :**

1. **Vérification explicite à chaque requête** : Authentification et autorisation systématiques basées sur toutes les données d'identité disponibles (utilisateur, appareil, localisation, comportement, état de santé du système).
2. **Accès au moindre privilège (Just-In-Time & Just-Enough-Access)** : Limiter les accès au strict minimum nécessaire et durant la fenêtre de temps exacte de l'opération.
3. **Supposer la compromission (Assume Breach)** : Micro-segmenter le réseau, chiffrer toutes les communications internes et auditer l'intégralité des transactions en continu.

---

## 2) Module — Micro-segmentation avec Tunnels Mesh WireGuard (2h)

### 📖 Narration/Intuition

Dans une architecture Zero Trust, chaque serveur communique avec les autres via des **tunnels chiffrés point-à-point (Mesh VPN)** avec authentification mutuelle forte par clés cryptographiques. Même si deux serveurs sont physiquement branchés sur le même switch Ethernet, ils ne peuvent s'échanger aucun paquet s'ils ne disposent pas des clés cryptographiques WireGuard valides.

### 🔍 Anatomie Technique

**Déploiement d'un Maillage WireGuard (Mesh) entre serveurs critiques (`/etc/wireguard/wg0.conf`) :**

```ini
# Configuration WireGuard sur le Serveur API (IP Mesh: 10.200.0.1/32)
[Interface]
PrivateKey = <Cle_Privee_Serveur_API>
Address = 10.200.0.1/32
ListenPort = 51820

# ─── Peer 1 : Serveur Base de Données (Seul autorisé à communiquer) ─────────
[Peer]
PublicKey = <Cle_Publique_Serveur_DB>
AllowedIPs = 10.200.0.2/32
Endpoint = 10.0.20.200:51820
PersistentKeepalive = 25

# ─── Peer 2 : Serveur de Logs SIEM ───────────────────────────────────────────
[Peer]
PublicKey = <Cle_Publique_Serveur_SIEM>
AllowedIPs = 10.200.0.250/32
Endpoint = 10.0.10.250:51820
PersistentKeepalive = 25
```

**Commande d'activation et état du Maillage :**

```bash
# Activer l'interface WireGuard sécurisée
sudo wg-quick up wg0

# Afficher l'état du maillage et le volume de données chiffrées échangées
sudo wg show

# Test de connectivité Zero Trust (seules les adresses IP du maillage 10.200.0.x sont accessibles)
ping 10.200.0.2
```

---

## 3) Module — Identité Cryptographique des Workloads (SPIFFE / SPIRE) (2h)

### 📖 Narration/Intuition

Comment prouver l'identité d'un microservice (ex: un conteneur Kubernetes) auprès d'une base de données sans utiliser de mots de passe ou de clés API statiques qui risqueraient d'être fuités ?

**SPIFFE (Secure Production Identity Framework for Everyone)** définit un standard d'**identité cryptographique universelle (SVID)** pour les logiciels. **SPIRE** est l'implémentation qui émet et renouvelle automatiquement des certificats X.509 d'identité de très courte durée (ex: 1 heure) pour chaque conteneur en fonction de ses caractéristiques d'exécution (Attestation).

### 🔍 Anatomie Technique

**Identifiant SPIFFE (SPIFFE ID) et flux d'attestation :**

```
Format d'un SPIFFE ID : spiffe://<trust-domain>/ns/<namespace>/sa/<service-account>
Exemple : spiffe://corp.internal/ns/production/sa/virement-api-serviceaccount
```

**Attestation et échange mTLS avec SPIFFE/SPIRE :**

```
Conteneur (Microservice API)           SPIRE Agent (Sur le Node)               SPIRE Server
          │                                      │                                  │
          │── 1. Demande son identité SVID ─────→│                                  │
          │       (via Unix Domain Socket)       │                                  │
          │                                      │── 2. Vérifie l'Attestation ─────→│
          │                                      │      (UID, PID, Namespace, K8s)  │
          │                                      │←── 3. Émet le SVID (X.509) ───────│
          │←── 4. Retourne Certificat X.509 ─────│                                  │
          │       valide 1 heure                 │                                  │
          │                                                                         │
          │═════════════════════════════════════════════════════════════════════════│
          │ Connectivité mTLS (chiffrée et authentifiée mutuellement par SVID)      │
          │────────────────────────────────────────────────────────────────────────→│ Base de Données
```

---

## 🏅 Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **ZTA** | Zero Trust Architecture — Architecture réseau sans confiance implicite (NIST SP 800-207) |
| **PEP** | Policy Enforcement Point — Composant filtrant et bloquant le trafic réseau selon la politique |
| **PDP** | Policy Decision Point — Moteur prenant les décisions d'autorisation en temps réel |
| **SPIFFE** | Secure Production Identity Framework for Everyone — Standard d'identité cryptographique des workloads |
| **SVID** | SPIFFE Verifiable Identity Document — Certificat X.509 ou JWT représentant l'identité d'un service |
| **mTLS** | Mutual TLS — Chiffrement TLS avec vérification des certificats du client ET du serveur |

---

## 🏋️ Exercices & Corrigés

**Exercice 1 :** Quelle est la faille majeure de l'approche traditionnelle de sécurité par périmètre ("Château et douves") qu'élimine le modèle Zero Trust ?

**Corrigé :** L'approche "Château et douves" accorde une **confiance implicite et totale** à n'importe quel équipement une fois qu'il se trouve à l'intérieur du réseau interne. Si un attaquant parvient à compromettre une seule machine périphérique (ex: via un phishing sur un poste de travail ou une faille sur un serveur DMZ), il peut effectuer du **déplacement latéral** sans restriction sur l'ensemble du réseau interne. Le modèle Zero Trust élimine cette confiance implicite : chaque requête interne est réauthentifiée et filtrée comme si elle venait d'Internet.

**Exercice 2 :** Pourquoi l'utilisation de certificats SVID émis par SPIFFE/SPIRE d'une durée de validité très courte (ex: 1 heure) améliore-t-elle la sécurité par rapport aux clés d'API statiques ?

**Corrigé :** Les clés d'API et certificats statiques à longue durée de vie (ex: 1 an) risquent d'être accidentellement intégrés dans des dépôts de code, des logs ou des sauvegardes, offrant un accès permanent à un attaquant en cas de fuite. Avec SPIFFE/SPIRE, les certificats sont générés dynamiquement en mémoire et renouvelés automatiquement toutes les heures. Si un certificat temporaire est intercepté, sa durée d'exploitation est extrêmement limitée et la révocation est automatique à l'expiration de la fenêtre de 1 heure.

---

## ❓ Banque de Questions & Test du Jour

**Q1 :** Quel est le principe fondateur du modèle de sécurité Zero Trust défini par le NIST ?
- A) Faire confiance à toutes les adresses IP du réseau local
- B) Ne jamais faire confiance, toujours vérifier (Never Trust, Always Verify)
- C) Chiffrer uniquement les e-mails
- D) Utiliser des mots de passe de 4 chiffres

**Réponse : B**

**Q2 :** Dans l'architecture Zero Trust, quel composant est chargé d'intercepter le trafic et d'appliquer physiquement la décision d'accès (autoriser ou bloquer) ?
- A) Policy Decision Point (PDP)
- B) Policy Enforcement Point (PEP)
- C) Certificate Authority (CA)
- D) Domain Name System (DNS)

**Réponse : B**

**Q3 :** Quel protocole VPN moderne, léger et intégré au noyau Linux est idéal pour créer du maillage réseau chiffré (Mesh) et de la micro-segmentation Zero Trust ?
- A) PPTP
- B) WireGuard
- C) L2TP
- D) Telnet

**Réponse : B**

**Q4 :** Que définit la norme SPIFFE dans une architecture cloud-native ?
- A) Un format de fichier vidéo
- B) Un standard ouvert pour l'attribution d'identités cryptographiques universelles (SVID) aux charges de travail (workloads)
- C) Une méthode de compression de base de données
- D) Un protocole de routage Wi-Fi

**Réponse : B**

**Q5 :** Dans une connexion mTLS (Mutual TLS), qui présente un certificat cryptographique pour prouver son identité ?
- A) Le serveur uniquement
- B) Le client uniquement
- C) Le serveur ET le client
- D) Aucun des deux

**Réponse : C**

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
