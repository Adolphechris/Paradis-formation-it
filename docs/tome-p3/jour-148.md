# TOME P3 — Cloud Native, DevOps & Cyberdéfense — Jour 148 (6h) : Réseaux Privés Virtuels d'Entreprise (MPLS, SD-WAN Avancé & Sécurité des Liaisons Opérateur)

> [!NOTE]
> **Objectif du jour :** Architecturer et sécuriser les liaisons WAN d'une banque centrale multi-sites : interconnexion MPLS/VPN L3, migration vers SD-WAN avec orchestration centralisée, sécurisation des sessions BGP inter-opérateurs (RPKI, MD5, TTL Security), et gestion des QoS sur les liaisons opérateur pour la voix et les données critiques RTGS.
>
> **Compétences visées :** `BIT-04` (A) — WAN Avancé : MPLS / SD-WAN Entreprise | `SEC-04` (A) — BGP Security & Opérateur

---

## 1) Module — MPLS/VPN L3 : Architecture & Fondamentaux (2h)

### 📖 Narration/Intuition

La BCC interconnecte ses 30 agences provinciales (Kinshasa, Lubumbashi, Goma, Kisangani…) via un réseau **MPLS/VPN L3** loué à l'opérateur national de télécommunications. Contrairement à l'Internet public, le MPLS garantit des niveaux de service (SLA) contractuels : latence maximale, bande passante réservée, taux de perte de paquets.

**MPLS (MultiProtocol Label Switching)** remplace le routage IP traditionnel par une commutation d'étiquettes ultrarapide. Les routeurs P (Provider) du cœur ne consultent jamais la table de routage IP, ils se contentent de lire une **étiquette MPLS de 20 bits** pour commuter le paquet vers la prochaine interface en microsecondes.

### 🔍 Anatomie Technique

**Architecture MPLS/VPN L3 BCC :**

```
AGENCE KINSHASA (CE-Router-KIN)
    │ ← iBGP → │
PE-Router-KIN (MPLS Edge Opérateur)
    │  Label Stack: [VPN-Label | Transport-Label]
    ▼
MPLS CORE OPÉRATEUR (P-Routers — Label Switching)
    │
PE-Router-LUB (MPLS Edge Opérateur)
    │ ← iBGP → │
AGENCE LUBUMBASHI (CE-Router-LUB)

Contrôle : MP-BGP (VPNv4 address-family) entre PE-Routers
Transport : LDP (Label Distribution Protocol) entre P-Routers
```

---

## 2) Module — SD-WAN : Orchestration & Politique de Routage (2h)

### 📖 Narration/Intuition

Le contrat MPLS de la BCC expire en 2026. La direction décide de migrer vers une architecture **SD-WAN** qui hybride les liens MPLS existants, les accès Internet fibre et les liaisons LTE 4G/5G de backup pour chaque agence.

**SD-WAN (Software-Defined WAN)** déplace l'intelligence de routage du matériel vers un **orchestrateur logiciel centralisé** qui route dynamiquement chaque flux applicatif sur le meilleur lien disponible selon la latence, le jitter et les pertes de paquets mesurés en temps réel.

### 🔍 Anatomie Technique

**Politique de routage SD-WAN basée sur l'application (`sdwan_policy.json`) :**

```json
{
  "sdwan_policy": {
    "name": "BCC_Routing_Policy_v1",
    "application_policies": [
      {
        "application": "RTGS_Banking",
        "preferred_path": "MPLS",
        "fallback_path": ["MPLS_BACKUP", "Internet_Fiber"],
        "max_latency_ms": 50,
        "max_jitter_ms": 10,
        "min_bandwidth_mbps": 20
      },
      {
        "application": "Video_Conference",
        "preferred_path": "Internet_Fiber",
        "fallback_path": "LTE_4G",
        "max_latency_ms": 150,
        "max_jitter_ms": 30,
        "min_bandwidth_mbps": 5
      },
      {
        "application": "Backups_Nightly",
        "preferred_path": "Internet_Fiber",
        "fallback_path": "LTE_4G",
        "scheduling": "best_effort_only"
      }
    ]
  }
}
```

---

## 3) Module — BGP Security : RPKI, MD5 & TTL Security (2h)

### 📖 Narration/Intuition

En 2010, Pakistan Telecom a accidentellement détourné (BGP Hijacking) l'ensemble du trafic YouTube mondial pendant 2 heures. En 2022, un acteur malveillant a redirigé le trafic bancaire de plusieurs institutions africaines via une annonce BGP forgée.

La sécurisation des sessions BGP passe par trois mécanismes complémentaires : **RPKI** (validation de l'origine des routes), **MD5 Authentication** (authentification des sessions TCP BGP) et **TTL Security/GTSM** (protection contre les paquets BGP forgés depuis des AS lointains).

### 🔍 Anatomie Technique

**Configuration BGP sécurisée (RPKI + MD5 + TTL Security) sur routeur Cisco IOS-XE :**

```cisco
! Configuration BGP sécurisée — Routeur CE BCC Kinshasa
router bgp 65001
 bgp log-neighbor-changes

 ! Voisin PE Opérateur avec authentification MD5 et TTL Security
 neighbor 203.0.113.1 remote-as 65000
 neighbor 203.0.113.1 password BCC_BGP_Auth_2024!
 neighbor 203.0.113.1 ttl-security hops 1        ! Protection anti-spoofing (GTSM RFC 5082)
 neighbor 203.0.113.1 prefix-list INBOUND_PREFIXES in
 neighbor 203.0.113.1 prefix-list OUTBOUND_PREFIXES out

! Politique RPKI (BGP Origin Validation)
bgp rpki server tcp 198.51.100.10 port 3323
bgp bestpath prefix-validate allow-invalid  ! Mode monitoring (passer à 'discard' en prod)
```

---

## 🏅 Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **MPLS** | MultiProtocol Label Switching — Commutation de paquets par étiquettes dans les réseaux opérateurs |
| **SD-WAN** | Software-Defined WAN — Réseau WAN orchestré logiciellement |
| **PE** | Provider Edge — Routeur de bordure de l'opérateur MPLS |
| **CE** | Customer Edge — Routeur de bordure du client MPLS |
| **RPKI** | Resource Public Key Infrastructure — Infrastructure de validation cryptographique des routes BGP |
| **GTSM** | Generalized TTL Security Mechanism — Mécanisme de sécurisation BGP via TTL (RFC 5082) |

---

## 🏋️ Exercices & Corrigés

**Exercice 1 :** Comment fonctionne le mécanisme **RPKI (Resource Public Key Infrastructure)** pour se protéger contre les attaques de **BGP Hijacking** ?

**Corrigé :** **RPKI** est un système d'infrastructure à clé publique appliqué au routage Internet. Chaque titulaire d'un bloc d'adresses IP (ex: 196.200.64.0/18 - AFRINIC) signe cryptographiquement un **ROA (Route Origin Authorization)** qui déclare quel numéro d'AS (Autonomous System) est autorisé à annoncer ce préfixe. Les routeurs BGP equipés de RPKI vérifient en temps réel que chaque route annoncée correspond à un ROA valide signé par le propriétaire légitime. Une annonce BGP d'un préfixe dont l'AS d'origine ne correspond pas au ROA est marquée INVALID et rejetée, rendant les BGP Hijackings impossibles même si un attaquant contrôle un AS.

**Exercice 2 :** Quelle est la valeur ajoutée du **SD-WAN** par rapport à une architecture MPLS pure pour les agences bancaires de province ?

**Corrigé :** Le **MPLS pur** est coûteux, peu flexible et avec des délais de provisionnement longs (semaines à mois). En cas de panne du lien MPLS, l'agence est totalement coupée. Le **SD-WAN** hybride les liens disponibles (MPLS + Internet Fibre + LTE 4G) et route chaque application sur le lien optimal selon ses exigences de latence et de bande passante, mesurées en continu. Les applications critiques (RTGS, Swift) utilisent MPLS. Les vidéoconférences utilisent l'Internet. En cas de panne MPLS, le SD-WAN bascule automatiquement en quelques secondes sur l'Internet/LTE, assurant la continuité de service.

---

## ❓ Banque de Questions & Test du Jour

**Q1 :** Quel mécanisme réseau MPLS permet aux routeurs du cœur de l'opérateur de commuter les paquets sans consulter la table de routage IP, en utilisant uniquement une étiquette numérique de 20 bits ?
- A) MPLS Label Switching (commutation d'étiquettes)
- B) WiFi
- C) Bluetooth
- D) NFC

**Réponse : A**

**Q2 :** Dans une architecture SD-WAN, comment le trafic des applications critiques (RTGS) est-il distingué du trafic de navigation web pour leur appliquer des politiques de routage différentes ?
- A) Par Deep Packet Inspection (DPI) et classification applicative dans l'orchestrateur SD-WAN
- B) En regardant la couleur des câbles
- C) Par la taille de l'écran
- D) Par l'emplacement géographique des employés

**Réponse : A**

**Q3 :** Quel mécanisme de sécurisation BGP utilise une infrastructure de signature cryptographique (ROA) pour valider que le titulaire légitime d'un préfixe IP est bien l'AS annoncant ce préfixe, protégeant contre le BGP Hijacking ?
- A) RPKI (Resource Public Key Infrastructure)
- B) FTP
- C) Telnet
- D) POP3

**Réponse : A**

**Q4 :** À quoi sert la configuration `neighbor X.X.X.X ttl-security hops 1` dans une session BGP sécurisée (GTSM) ?
- A) Elle rejette les paquets BGP reçus avec un TTL inférieur à 254, protégeant contre les attaques BGP forgées depuis des nœuds distants (uniquement le voisin direct peut établir la session)
- B) Elle configure la vitesse du câble
- C) Elle change l'adresse IP
- D) Elle redémarre le routeur

**Réponse : A**

**Q5 :** Quelle est la principale limitation technique du MPLS pur qui pousse les entreprises à migrer vers le SD-WAN hybride ?
- A) Coût élevé, faible flexibilité, délais de provisionnement longs et absence de basculement automatique en cas de panne
- B) Trop rapide pour les ordinateurs
- C) Incompatible avec les souris sans fil
- D) Consomme trop d'électricité

**Réponse : A**

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
