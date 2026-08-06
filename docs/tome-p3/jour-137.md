# TOME P3 — Cloud Native, DevOps & Cyberdéfense — Jour 137 (6h) : Sécurité de la Téléphonie IP & VoIP d'Entreprise (SIP, SRTP, TLS & Kamailio / Asterisk Hardening)

> [!NOTE]
> **Objectif du jour :** Concevoir et sécuriser les réseaux de téléphonie sur IP (VoIP) et de visioconférence de la Banque Centrale du Congo : protocoles de signalisation sécurisés (SIP over TLS), chiffrement des flux média voix/vidéo (SRTP / ZRTP), pare-feu VoIP / Session Border Controller (SBC Kamailio), et hardening d'IP-PBX Asterisk.
>
> **Compétences visées :** `BIT-04` (A) — Téléphonie IP & VoIP d'Entreprise | `SEC-04` (A) — Cyberdéfense des Réseaux VoIP & SBC

---

## 1) Module — Architecture VoIP & Protocoles (SIP, RTP vs SRTP) (2h)

### 📖 Narration/Intuition

La téléphonie IP d'entreprise repose sur deux flux distincts :
1. **La Signalisation (Établissement/Fermeture d'appel)** : Gérée par le protocole **SIP (Session Initiation Protocol)** sur le port `5060`.
2. **Le Média (La voix et la vidéo en temps réel)** : Transporté par le protocole **RTP (Real-time Transport Protocol)** sur des ports UDP dynamiques.

Sans chiffrement, le trafic SIP et RTP circule en texte clair et en audio non chiffré sur le réseau : un simple écouteur réseau (Wireshark / Cain & Abel) permet d'**enregistrer et d'écouter les conversations téléphoniques confidentielles** du comité de direction ou des opérateurs de marché.

Pour sécuriser la VoIP, on utilise **SIPS (SIP over TLS 1.3)** sur le port `5061` pour la signalisation, et **SRTP (Secure Real-time Transport Protocol)** avec chiffrement AES-128-ICM / AES-256-GCM pour le flux audio.

### 🔍 Anatomie Technique

**Architecture VoIP Sécurisée avec Session Border Controller (SBC) :**

```
Téléphone IP / Softphone (Kinshasa)             SBC Kamailio / Firewall               IP-PBX Asterisk (Datacenter)
┌───────────────────────────┐                 ┌───────────────────────────┐           ┌───────────────────────────┐
│ Signalisation: SIPS (TLS) │────────────────→│ Inspection & Filtrage SBC │──────────→│ Traitement Appel (PBX)    │
│ Média: SRTP (AES-256-GCM) │────────────────→│ Anti-VOSP / Rate Limit    │──────────→│                           │
└───────────────────────────┘                 └───────────────────────────┘           └───────────────────────────┘
```

---

## 2) Module — Durcissement d'IP-PBX Asterisk & Session Border Controller (2h)

### 📖 Narration/Intuition

Les autocommutateurs téléphoniques virtuels (IP-PBX comme **Asterisk**) sont les cibles privilégiées d'attaques par brute-force d'extensions et de **Toll Fraud (Pirate téléphonique)** : des pirates s'introduisent sur le PBX pour passer des milliers d'appels frauduleux vers des numéros surtaxés à l'étranger aux frais de l'entreprise.

Le déploiement d'un **Session Border Controller (SBC)** en amont (ex: **Kamailio**) protège le PBX contre les attaques par déni de service (DoS SIP) et bloque les tentatives de brute-force d'extensions.

### 🔍 Anatomie Technique

**Configuration d'Asterisk pour le support obligatoire de SIPS et SRTP (`pjsip.conf`) :**

```ini
; Configuration Asterisk PJSIP sécurisée
[global]
type=global

; Transport SIP sécurisé sur TLS (Port 5061)
[transport-tls]
type=transport
protocol=tls
bind=0.0.0.0:5061
cert_file=/etc/asterisk/keys/asterisk.crt
priv_key_file=/etc/asterisk/keys/asterisk.key
method=tlsv1_3

; Extension Téléphonique Sécurisée (Softphone Direction)
[1001]
type=endpoint
context=interne-securise
disallow=all
allow=opus,g722,ulaw
auth=auth1001
aors=1001
transport=transport-tls

; Exiger obligatoirement le chiffrement SRTP des flux audio
media_encryption=sdes
require_secure_media=yes

[auth1001]
type=auth
auth_type=userpass
username=1001
password=MotDePasseVoIPUltraComplexe2024!
```

---

## 3) Module — Forensique & Inspection de Trafic VoIP (Wireshark / TShark) (2h)

### 📖 Narration/Intuition

Pour auditer la sécurité de la VoIP, les ingénieurs réseau utilisent Wireshark/TShark pour s'assurer qu'aucun paquet RTP non chiffré ne circule sur le réseau et pour analyser les flux d'établissement d'appel SIP.

### 🔍 Anatomie Technique

**Commandes d'inspection VoIP avec TShark :**

```bash
# 1. Écouter les tentatives d'enregistrement SIP (REGISTER) pour repérer le brute-force
sudo tshark -i eth0 -Y "sip.Method == REGISTER" -T fields -e frame.time -e ip.src -e sip.from.user

# 2. Inspecter les paquets de négociation TLS des sessions SIPS (Port 5061)
sudo tshark -i eth0 -Y "tcp.port == 5061 and tls.handshake.type == 1"

# 3. Vérifier la présence de paquets SRTP (Chiffrés) par rapport à des paquets RTP (Clairs)
sudo tshark -i eth0 -Y "srtp" | head -n 5
```

---

## 🏅 Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **SIP** | Session Initiation Protocol — Protocole de signalisation pour l'établissement d'appels VoIP |
| **SRTP** | Secure Real-time Transport Protocol — Extension chiffrée (AES) du protocole RTP audio/vidéo |
| **SBC** | Session Border Controller — Pare-feu applicatif dédié à la protection des réseaux VoIP |
| **SIPS** | SIP Secure — Protocole SIP encapsulé dans un tunnel chiffré TLS (Port 5061) |
| **Toll Fraud** | Piratage de centraux téléphoniques pour émettre des appels frauduleux surtaxés |

---

## 🏋️ Exercices & Corrigés

**Exercice 1 :** Quelle est la différence entre le rôle du protocole **SIPS (SIP over TLS)** et du protocole **SRTP** dans une communication de téléphonie sur IP ?

**Corrigé :** **SIPS (SIP over TLS)** sécurise la couche de **signalisation** (port 5061) : il chiffre les messages d'établissement d'appel, de sonnerie, le numéro de l'appelant et du destinataire, empêchant l'usurpation d'identité et l'interception des métadonnées de l'appel. **SRTP (Secure RTP)** sécurise la couche de **média** (ports UDP dynamiques) : il chiffre avec l'algorithme AES-128/256 le flux de voix et de vidéo numérisé en temps réel, empêchant l'écoute clandestine des conversations. Les deux protocoles sont indissociables pour une sécurité VoIP complète.

**Exercice 2 :** Quel est le rôle principal d'un **Session Border Controller (SBC)** placé en bordure du réseau d'entreprise ?

**Corrigé :** Le **Session Border Controller (SBC)** agit comme un pare-feu applicatif intelligent spécialisé pour la VoIP. Il masque l'architecture interne des autocommutateurs téléphoniques (IP-PBX), intercepte et nettoie les en-têtes SIP malformés, applique des règles de limitation de débit (Rate Limiting) pour contrer les attaques DoS SIP et le brute-force de mots de passe d'extensions, et assure la conversion de protocoles (Normalisation SIP) entre le réseau interne de l'entreprise et les opérateurs télécoms extérieurs.

---

## ❓ Banque de Questions & Test du Jour

**Q1 :** Quel protocole de transport sécurisé chiffre les flux audio et vidéo (média) en temps réel avec l'algorithme AES pour empêcher l'écoute clandestine des communications VoIP ?
- A) SRTP (Secure Real-time Transport Protocol)
- B) MS-DOS
- C) Disquette
- D) Câble VGA

**Réponse : A**

**Q2 :** Sur quel port TCP/UDP s'effectuent par défaut les échanges de signalisation SIP sécurisés par le protocole TLS (SIPS) ?
- A) Port 5061
- B) Port 80
- C) Port 21
- D) Port 53

**Réponse : A**

**Q3 :** Quel pare-feu applicatif spécialisé est placé en bordure du réseau pour protéger les serveurs IP-PBX contre le piratage téléphonique (Toll Fraud) et les attaques par déni de service SIP ?
- A) SBC (Session Border Controller)
- B) Paint
- C) Word
- D) Excel

**Réponse : A**

**Q4 :** Comment appelle-t-on le piratage d'un central téléphonique IP-PBX visant à émettre des milliers d'appels frauduleux vers des numéros surtaxés internationaux aux frais de l'entreprise ?
- A) Toll Fraud (Fraude Téléphonique)
- B) Formatage de disque
- C) Impression
- D) Redémarrage

**Réponse : A**

**Q5 :** Quel codec audio HD moderne et libre de droits offre une excellente qualité sonore et une faible consommation de bande passante sur les réseaux IP sécurisés ?
- A) Opus (ou G.722)
- B) MP3
- C) AVI
- D) WAV non compressé

**Réponse : A**

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
