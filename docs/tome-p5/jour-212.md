# TOME P5 — Cybersécurité Avancée & Red/Blue Team — Jour 212 (6h) : Threat Intelligence & Threat Hunting (Cyber Threat Intelligence CTI, Standards TAXII/STIX, OpenCTI & MISP Platform)

> [!NOTE]
> **Objectif du jour :** Maîtriser le renseignement sur les menaces informatiques (**Cyber Threat Intelligence — CTI**) et les opérations de **Threat Hunting** : formats standards d'échange de renseignements (**STIX 2.1** / **TAXII 2.1**), déploiement et utilisation des plateformes CTI open-source (**OpenCTI**, **MISP**), enrichissement des règles SIEM avec des flux de menace (Feeds), et cartographie des acteurs de menace (APT) selon le framework **MITRE ATT&CK**.
>
> **Compétences visées :** `SEC-07` (A) — Threat Intelligence STIX/TAXII & OpenCTI | `SEC-04` (A) — Threat Hunting & MISP Integration

---

## 1) Module — Fondamentaux CTI & Standards STIX/TAXII (2h)

### 📖 Narration/Intuition

Lorsqu'une banque centrale voisine en Afrique centrale subit une attaque par un groupe cybercriminel (APT), comment la BCC peut-elle recevoir en temps réel la liste exacte des adresses IP, des domaines malveillants et des signatures de fichiers utilisés par les attaquants pour bloquer l'attaque **avant qu'elle ne touche ses propres serveurs** ?

Grâce au partage de **Cyber Threat Intelligence (CTI)** via les langages et protocoles standards mondialement reconnus : **STIX (Structured Threat Information Expression)** pour le format de données JSON structuré et **TAXII (Trusted Automated Exchange of Intelligence Information)** pour le protocole de transmission sécurisé via HTTPS.

### 🔍 Anatomie Technique

**Les 3 Niveaux de Threat Intelligence :**

```
 ┌────────────────────────────────────────────────────────┐
 │ 1. CTI STRATÉGIQUE (Pour CISO & Direction)             │
 │  - Tendances des cyber-menaces du secteur bancaire     │
 │  - Motivations géopolitiques des groupes APT           │
 └──────────────────────────┬─────────────────────────────┘
                            │
                            ▼
 ┌────────────────────────────────────────────────────────┐
 │ 2. CTI TACTIQUE (Pour les Architectes & Threat Hunters)│
 │  - Méthodes et TTPs des attaquants (MITRE ATT&CK)      │
 │  - Outils et vecteurs d'attaque préférés               │
 └──────────────────────────┬─────────────────────────────┘
                            │
                            ▼
 ┌────────────────────────────────────────────────────────┐
 │ 3. CTI OPÉRATIONNELLE / TECHNIQUE (Pour le SOC/SIEM)   │
 │  - Indicateurs de compromission (IoCs) bruts           │
 │  - Adresses IP C2, Hashes SHA256, Domaines DGA         │
 └────────────────────────────────────────────────────────┘
```

**Structure d'un Objet STIX 2.1 JSON (`stix_indicator.json`) :**

```json
{
  "type": "bundle",
  "id": "bundle--a1b2c3d4-e5f6-7890-abcd-1234567890ab",
  "objects": [
    {
      "type": "indicator",
      "spec_version": "2.1",
      "id": "indicator--8e2e2d2b-17d4-4cbf-938f-98ee46b3cd3f",
      "created": "2026-06-17T10:00:00.000Z",
      "modified": "2026-06-17T10:00:00.000Z",
      "name": "IP C2 Groupe APT-BCC-Target",
      "description": "Adresse IP de serveur de Command & Control identifiée dans l'attaque bancaire",
      "pattern": "[ipv4-addr:value = '198.51.100.42']",
      "pattern_type": "stix",
      "valid_from": "2026-06-17T10:00:00.000Z",
      "labels": ["malicious-activity", "c2-server"]
    }
  ]
}
```

---

## 2) Module — Plateformes CTI : MISP & OpenCTI (2h)

### 📖 Narration/Intuition

Pour agréger, corréler et redistribuer automatiquement ces milliers d'indicateurs de menace aux pare-feu NGFW et au SIEM ELK, la BCC déploie des plateformes CTI centralisées : **MISP (Malware Information Sharing Platform)** et **OpenCTI**.

### 🔍 Anatomie Technique

**Flux d'Enrichissement CTI Automatisé BCC :**

```
SOURCES DE RENSEIGNEMENT INTERNES & EXTERNES
  ├── Feed CERT National / BNR
  ├── Feeds Commerciaux (Mandiant, CrowdStrike)
  ├── OpenCTI / MISP Feeds (OSINT)
  └── Incidents analysés par le SOC BCC
          │
          ▼
┌─────────────────────────────────────────────────────────────┐
│                       OPENCTI / MISP                        │
│  - Déduplication et calcul du score de confiance (0-100)    │
│  - Corrélation avec la matrice MITRE ATT&CK                 │
│  - Export automatique au format TAXII 2.1 / STIX 2.1        │
└─────────┬─────────────────────────────────────────┬─────────┘
          │                                         │
          ▼                                         ▼
┌──────────────────┐                       ┌──────────────────┐
│  NGFW PALO ALTO  │                       │    SIEM ELK      │
│  (Blocage IP C2  │                       │ (Enrichissement  │
│   automatique)   │                       │  des logs SOC)   │
└──────────────────┘                       └──────────────────┘
```

---

## 3) Module — Threat Hunting & Hypotheses-Driven Hunting (2h)

### 📖 Narration/Intuition

Le **Threat Hunting** est la démarche proactive par laquelle un chercheur en sécurité formule une **hypothèse d'intrusion** basée sur les TTPs récentes d'un groupe d'attaque, puis fouille les logs SIEM et EDR pour vérifier si cette attaque est en cours dans le réseau d'entreprise sans avoir déclenché d'alerte.

### 🛠️ Atelier Pratique

**Scénario de Threat Hunting — Détection d'Attaque DCSync (Active Directory) :**

```markdown
# HYPOTHÈSE DE HUNTING : TH-2026-04
## Tactique MITRE ATT&CK : TA0006 (Credential Access) | Technique : T1003.006 (DCSync)

### HYPOTHÈSE :
"Un attaquant ayant obtenu un accès initial sur le réseau d'entreprise tente d'exécuter une attaque DCSync via Mimikatz (secretsdump) pour répliquer le hash NTLM du compte krbtgt sans être détecté par l'antivirus."

### REQUÊTE DE HUNTING (Kibana SIEM KQL) :
```kql
event.dataset: "winlogbeat" AND
event.code: 4662 AND
winlog.event_data.Properties: ("*1131f6aa-9c5d-11d1-bf6d-00c04f79efbc*" OR "*1131f6ad-9c5d-11d1-bf6d-00c04f79efbc*") AND
NOT winlog.event_data.SubjectUserName: "*$"
```

### INTERPRÉTATION :
- Event ID 4662 = Accès à un objet Active Directory.
- GUID `1131f6aa` = Replicating Directory Changes (Permission DCSync).
- `NOT SubjectUserName: "*$"` = L'action est exécutée par un compte UTILISATEUR et NON par un Contrôleur de Domaine légitime (qui se termine par $).

### RÉSULTAT DU HUNTING :
- 🚨 1 événement trouvé ! L'utilisateur `kabilaj` a exécuté une demande DCSync depuis le poste `PC-042` à 14h23.
- ACTION : Isoler le poste PC-042 via EDR + Révoquer les identifiants `kabilaj`.
```

---

## 🏅 Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **CTI** | Cyber Threat Intelligence — Renseignement sur les cyber-menaces |
| **STIX** | Structured Threat Information Expression — Format JSON structuré de données CTI |
| **TAXII** | Trusted Automated Exchange of Intelligence Information — Protocole de transport CTI |
| **MISP** | Malware Information Sharing Platform — Plateforme open-source de partage de menace |
| **OpenCTI** | Open Cyber Threat Intelligence Platform — Plateforme CTI orientée graphe de connaissances |

---

## 🏋️ Exercices & Corrigés

**Exercice 1 :** Quelle est la différence entre le standard **STIX** et le protocole **TAXII** dans l'écosystème de la Threat Intelligence ?

**Corrigé :** **STIX (Structured Threat Information Expression)** est le **langage et format de données** (schéma JSON) servant à représenter de manière structurée les informations de sécurité (indicateurs de compromission, identités d'attaquants, vulnérabilités, TTPs). **TAXII (Trusted Automated Exchange of Intelligence Information)** est le **protocole de transport réseau** (dédicté sur HTTPS/REST API) permettant d'échanger de manière sécurisée et automatisée des paquets de données STIX entre différentes organisations ou équipements de sécurité (ex: d'une plateforme MISP vers un pare-feu NGFW). STIX est le message ; TAXII est le camion de livraison.

**Exercice 2 :** Pourquoi la détection d'une demande de réplication Active Directory par un compte utilisateur ordinaire (Event ID 4662) est-elle la signature absolue d'une attaque **DCSync** ?

**Corrigé :** Dans le fonctionnement normal d'Active Directory, les seules entités autorisées à répliquer les données de l'annuaire (notamment les hashes des mots de passe des comptes de domaine via le protocole MS-DRSR) sont les **Contrôleurs de Domaine eux-mêmes** (dont le nom de compte machine se termine par `$`, ex: `DC01$`). L'attaque **DCSync** consiste pour un attaquant utilisant Mimikatz ou Impacket (`secretsdump.py`) à usurper les privilèges de réplication. Si les logs d'audit Windows (Event ID 4662) montrent une demande de réplication (`Replicating Directory Changes`) émanant d'un **compte utilisateur ordinaire** (ex: `kabilaj`), cela signifie avec une certitude absolue qu'un outil d'attaque usurpe le protocole de réplication AD pour voler tous les hashes du domaine.

---

## ❓ Banque de Questions & Test du Jour

**Q1 :** Quel format standardisé basé sur JSON est mondialement utilisé pour représenter de manière structurée des données de Cyber Threat Intelligence (STIX Objects) ?
- A) STIX 2.1
- B) HTML5
- C) XML 1.0
- D) CSV

**Réponse : A**

**Q2 :** Quel protocole HTTPS sécurisé est utilisé pour échanger automatiquement des bundles de données STIX entre des plateformes CTI et des pare-feu d'entreprise ?
- A) TAXII 2.1
- B) FTP
- C) SNMP
- D) SMTP

**Réponse : A**

**Q3 :** Quelle plateforme CTI open-source développée par la communauté européenne permet de stocker, corréler et partager des événements et indicateurs de compromission (IoCs) ?
- A) MISP (Malware Information Sharing Platform)
- B) WordPress
- C) Metasploit
- D) Wireshark

**Réponse : A**

**Q4 :** Qu'est-ce qui caractérise l'activité de **Threat Hunting** par rapport à la surveillance SOC traditionnelle basée sur des alertes ?
- A) Le Threat Hunting est une démarche proactive basée sur des hypothèses où un chercheur cherche des attaques non détectées par les règles existantes
- B) Le Threat Hunting attend que le client appelle le support
- C) Le Threat Hunting consiste à réinstaller les systèmes d'exploitation
- D) Le Threat Hunting est automatisé à 100% par le pare-feu

**Réponse : A**

**Q5 :** Quel code d'événement d'audit Windows (Event ID) permet de détecter les tentatives de réplication non autorisées de l'annuaire Active Directory (Attaque DCSync) ?
- A) Event ID 4662
- B) Event ID 4624
- C) Event ID 1102
- D) Event ID 7045

**Réponse : A**

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
