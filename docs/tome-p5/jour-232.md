# TOME P5 — Cybersécurité Avancée & Red/Blue Team — Jour 232 (6h) : Déception & Honeypots (Honeyd, T-Pot, Canary Tokens, Cyber Deception Strategy & Early Warning)

> [!NOTE]
> **Objectif du jour :** Maîtriser les technologies de **déception cybernétique (Cyber Deception)** comme stratégie de détection précoce des attaquants à l'intérieur du réseau BCC : déploiement de **honeypots** (T-Pot, Honeyd), création de **Canary Tokens** (pièges numériques déclenchant des alertes à l'ouverture), conception d'une **stratégie de déception défensive** intégrée à l'architecture Zero Trust BCC pour détecter les mouvements latéraux dès les premières secondes.
>
> **Compétences visées :** `SEC-04` (A) — Cyber Deception Honeypots & Canary Tokens Early Detection | `SEC-05` (A) — T-Pot Honeypot Deployment & Deception Network BCC Architecture

---

## 1) Module — Principes de la Déception Cybernétique & Honeypots (2h)

### 📖 Narration/Intuition

Lors de l'incident BCC du J221, l'attaquant a eu **23 minutes** pour se déplacer librement dans l'infrastructure avant la première alerte SOC. La **déception cybernétique (Cyber Deception)** est une stratégie complémentaire aux outils de détection traditionnels (SIEM, EDR) : au lieu d'attendre qu'un attaquant déclenche une règle de détection connue, on lui **tend des pièges** — des ressources leurres (fichiers, services, credentials factices) que seul un attaquant accéderait.

L'avantage majeur : **zéro faux-positif**. Si quelqu'un touche un honeypot, c'est forcément un attaquant ou un insider malveillant — aucun utilisateur légitime ne devrait accéder à des ressources inexistantes dans le contexte opérationnel normal.

### 🔍 Anatomie Technique

**Taxonomie des Technologies de Déception :**

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                    TAXONOMIE DE LA DÉCEPTION CYBERNÉTIQUE                    │
├────────────────────────┬─────────────────────────────────────────────────────┤
│ TECHNOLOGIE            │ DESCRIPTION & USAGE BCC                             │
├────────────────────────┼─────────────────────────────────────────────────────┤
│ Honeypot               │ Système/service entier simulant une cible réelle    │
│ (Pot de miel)          │ Ex: T-Pot — Suite de honeypots multi-protocoles     │
│                        │ → Attire les attaquants externes (Internet)          │
├────────────────────────┼─────────────────────────────────────────────────────┤
│ Honeynet               │ Réseau entier de honeypots simulant une infra réelle│
│ (Réseau leurre)        │ → Piège les mouvements latéraux d'un attaquant interne│
├────────────────────────┼─────────────────────────────────────────────────────┤
│ Canary Token           │ Fichier/URL/credential leurre déclenchant une alerte│
│ (Jeton canari)         │ dès qu'il est ouvert/accédé                         │
│                        │ → Détecte les accès non autorisés à des fichiers    │
├────────────────────────┼─────────────────────────────────────────────────────┤
│ Honey Credential       │ Identifiant factice intégré dans une liste de mots  │
│ (Identifiant leurre)   │ de passe hashés — si utilisé, alerte immédiate      │
├────────────────────────┼─────────────────────────────────────────────────────┤
│ Honey File / HoneyDoc  │ Fichier sensible (ex: "MNBC_passwords_2026.xlsx")   │
│ (Fichier leurre)       │ contenant un Canary Token → Alerte à l'ouverture    │
└────────────────────────┴─────────────────────────────────────────────────────┘
```

---

## 2) Module — Déploiement T-Pot & Canary Tokens (2h)

### 🛠️ Atelier Pratique

**Déploiement de T-Pot (Suite de Honeypots Multi-Protocoles) :**

```bash
# T-Pot — Deutsch Telekom Security — Suite de 20+ honeypots dans des conteneurs Docker
# Honeypots inclus : Cowrie (SSH/Telnet), Dionaea (SMB/FTP/HTTP), Conpot (SCADA/Modbus),
#                    ElasticPot (Elasticsearch), Honeytrap, CitrixHoneypot, etc.

# 1. Déploiement T-Pot sur un VPS "leurre" BCC (Exposé sur Internet)
git clone https://github.com/telekom-security/tpotce.git /opt/tpot
cd /opt/tpot
sudo ./install.sh --type=T  # Mode Standard (20+ honeypots)

# 2. Accéder au dashboard T-Pot (Kibana) : https://bcc-honeypot.cd:64297
echo "✅ T-Pot déployé — Dashboard Kibana sur port 64297"

# Honeypots clés pour la BCC :
# - Cowrie  : Simule SSH/Telnet — Capture toutes les commandes des attaquants
# - Conpot  : Simule Modbus TCP/DNP3 — Attire les attaquants SCADA (cf. J218)
# - Dionaea : Simule SMB (WannaCry), HTTP, FTP — Capture les malwares

# 3. Exemple de log Cowrie (Attaquant SSH capturé)
cat /data/cowrie/log/cowrie.json | python3 -m json.tool | head -30
# → {"eventid": "cowrie.command.input",
#    "timestamp": "2026-08-06T03:15:22",
#    "src_ip": "185.220.101.47",          ← Même IP que l'attaquant BCC J221 !
#    "input": "cat /etc/passwd",
#    "session": "d8f3b2a1"}
echo "⚠️ Attaquant BCC détecté sur le honeypot SSH !"
```

**Création de Canary Tokens pour la Détection des Accès Internes (`canary_setup.py`) :**

```python
import requests, json

# Canary Tokens — canarytokens.org (ou self-hosted)
CANARYTOKEN_API = "https://canarytokens.org/api"

# 1. Créer un Canary Token de type "document Word"
#    (Se déclenchera à l'ouverture du fichier Word par quiconque)
response = requests.post(f"{CANARYTOKEN_API}/generate", json={
    "type": "doc",           # Document Microsoft Word piégé
    "email": "csirt@bcc.cd", # Alertes envoyées au CSIRT BCC
    "webhook_url": "https://siem.internal.bcc.cd/webhook/canary",
    "memo": "BCC — MNBC_Master_Passwords_2026_CONFIDENTIEL.docx"
})
token_data = response.json()
print(f"✅ Canary Token créé : {token_data['token']}")
print(f"   Télécharger le fichier piégé : {token_data['url']}")

# 2. Placer les fichiers leurres stratégiquement dans l'infrastructure BCC
lure_placements = [
    "/home/mnbc-worker/documents/MNBC_Master_Passwords_2026.docx",  # FS serveur compromis
    "s3://bcc-mnbc-backups/ADMIN_CREDENTIALS_BACKUP.xlsx",           # Bucket S3 BCC
    "\\\\BCC-FILE-SERVER\\Finance\\Budget_MNBC_Confidentiel_2026.pdf",  # Partage réseau
]
print("\nPlacements des fichiers leurres BCC :")
for path in lure_placements:
    print(f"  → {path}")

# 3. Créer un Canary Token DNS (Credential factice dans Active Directory)
response_dns = requests.post(f"{CANARYTOKEN_API}/generate", json={
    "type": "dns",
    "email": "csirt@bcc.cd",
    "memo": "Honey Credential — Compte AD mnbc-backup-svc (leurre)"
})
print(f"\n✅ DNS Canary Token : {response_dns.json()['hostname']}")
print("   → Intégrer ce hostname comme serveur dans la config du compte leurre AD")
print("   → Toute authentification avec ce compte déclenchera une alerte CSIRT !")
```

---

## 3) Module — Architecture de Déception Intégrée BCC (2h)

### 📖 Narration/Intuition

Une stratégie de déception efficace ne se limite pas à un honeypot posé sur le réseau. Elle doit être **intégrée** à l'architecture de sécurité globale et déployer des leurres à chaque couche de l'infrastructure, créant une surface d'alerte précoce omniprésente.

### 🛠️ Atelier Pratique

**Architecture de Déception Multi-Couches BCC (`deception_strategy.md`) :**

```markdown
# STRATÉGIE DE DÉCEPTION CYBERNÉTIQUE BCC — ARCHITECTURE COMPLÈTE

## COUCHE RÉSEAU — Honeypots & Honeynets

┌─────────────────────────────────────────────────────────────────┐
│ VLAN PROD BCC (192.168.10.0/24)                                 │
│                                                                 │
│  ┌──────────────────┐    ┌──────────────────┐                   │
│  │ Serveurs Réels   │    │ 🍯 Honey Servers  │                   │
│  │ 192.168.10.1-50  │    │ 192.168.10.100-110│                   │
│  │ (Légitimes)      │    │ (Leurres T-Pot)   │                   │
│  └──────────────────┘    └──────────────────┘                   │
│                               ↑ ALERTE IMMÉDIATE si accédé !   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ 🍯 Honey PLC Modbus TCP : 192.168.10.200:502              │   │
│  │    (Conpot — Simule un automate Schneider vulnérable)    │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘

## COUCHE ACTIVE DIRECTORY — Honey Credentials & Honey Groups

- Compte AD leurre : mnbc-backup-svc (Membre du groupe "Domain Admins" en apparence)
  → Aucun script légitime ne doit jamais utiliser ce compte
  → Toute authentification = attaquant ayant dumpé le NTDS.dit !
  → Alerte CSIRT immédiate via SIEM (Règle Sigma sur logon mnbc-backup-svc)

- Groupe AD leurre : "BCC-MNBC-SuperAdmins" (Visible dans BloodHound)
  → Aucun membre réel — Si un attaquant tente de l'exploiter via BloodHound,
    son activité est tracée par les logs Kerberos

## COUCHE FICHIERS — Honey Files & Canary Tokens

Distribution dans les partages réseau et serveurs critiques :
  - MNBC_Master_Passwords_2026.docx → Canary Token Word (alerte à l'ouverture)
  - admin_credentials_backup.txt    → Canary Token fichier texte
  - BCC_Blockchain_Private_Keys.pdf → Canary Token PDF

## COUCHE API/BLOCKCHAIN — Honey Endpoints

- Endpoint API leurre : GET /v1/admin/all-accounts (Non documenté, jamais appelé)
  → Toute requête = alerte BOLA/IDOR scanning en cours !
- Smart Contract leurre : HoneyVault.sol (Solde apparent de 10M MNBC)
  → Toute tentative d'interaction = attaquant recherchant des cibles Blockchain
```

---

## 🏅 Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **Honeypot** | Système ou service leurre conçu pour attirer et détecter les attaquants |
| **Canary Token** | Artefact numérique piégé (fichier, URL, credential) déclenchant une alerte à son accès |
| **T-Pot** | Suite de 20+ honeypots conteneurisés développée par Deutsche Telekom Security |
| **Cowrie** | Honeypot SSH/Telnet capturant les commandes des attaquants dans un shell simulé |
| **Conpot** | Honeypot industriel simulant des automates SCADA (Modbus, SNMP, S7, BACnet) |
| **Honeynet** | Réseau entier de honeypots simulant une infrastructure complète pour piéger les mouvements latéraux |

---

## 🏋️ Exercices & Corrigés

**Exercice 1 :** Pourquoi les technologies de **déception cybernétique (honeypots, Canary Tokens)** génèrent-elles **zéro faux-positif** contrairement aux règles SIEM classiques, et en quoi cet avantage est-il particulièrement précieux pour les équipes SOC surchargées ?

**Corrigé :** Les technologies de déception génèrent **zéro faux-positif** par construction, grâce au principe fondamental qui les sous-tend : les ressources leurres (honeypots, fichiers Canary Token, credentials factices) n'ont **aucune utilité opérationnelle légitime**. Aucun employé de la BCC, aucun système automatisé, aucun outil de supervision n'est censé accéder à un fichier nommé "MNBC_Master_Passwords_2026.docx" planté dans un répertoire de serveur, ni se connecter au compte AD factice "mnbc-backup-svc", ni envoyer une requête Modbus au PLC leurre 192.168.10.200. Par définition, **tout accès à une ressource leurre est malveillant** (attaquant externe, insider malveillant, ou processus compromis effectuant de la découverte automatisée). Cet avantage est crucial pour les SOC surchargés car les systèmes SIEM classiques génèrent des centaines à milliers d'alertes par jour, dont la grande majorité sont des faux-positifs qui épuisent les analystes (alerte fatigue). Les alertes de déception, rares mais à haute valeur, permettent aux analystes de répondre avec certitude à chaque déclenchement sans perte de temps à qualifier l'alerte.

**Exercice 2 :** Dans le contexte de l'incident BCC (J221), comment un **Canary Token de type "credential leurre"** placé dans les fichiers du serveur compromis aurait-il pu **détecter l'attaquant en moins de 2 minutes** après sa compromission initiale ?

**Corrigé :** Après sa compromission initiale à 02h31, l'attaquant du J221 a passé les premières minutes à explorer le serveur compromis (découverte — TA0007) avant de télécharger ses outils et de lancer le reverse shell à 02h47. Durant cette phase d'exploration, un attaquant méthodique consulte typiquement les fichiers de configuration, les scripts présents sur le serveur, et les fichiers de mots de passe. Si le serveur "mnbc-worker" contenait un fichier leurre `bcc_server_credentials.txt` avec un Canary Token DNS intégré, dès que l'attaquant aurait ouvert ou `cat`-é ce fichier, le token aurait tenté une **résolution DNS** vers le serveur Canary Token (ex: `https://bcc.mnbc-honeypot.canarytokens.org`). Cette résolution DNS aurait été capturée par le serveur Canary Token et aurait **immédiatement envoyé un email et une webhook au CSIRT BCC** avec l'IP source de la résolution (185.220.101.47) et l'horodatage exact — permettant une réponse en moins de 2 minutes plutôt que 23 minutes.

---

## ❓ Banque de Questions & Test du Jour

**Q1 :** Quel est l'avantage principal des technologies de **déception cybernétique (Canary Tokens, Honeypots)** sur les règles de détection SIEM classiques en termes de qualité des alertes générées ?
- A) Zéro faux-positif — Toute interaction avec une ressource leurre est par définition malveillante, car aucun utilisateur légitime n'est censé y accéder
- B) Les alertes de déception sont moins nombreuses mais aussi moins précises
- C) Les honeypots détectent uniquement les attaques réseau externes (Internet)
- D) Les Canary Tokens nécessitent un agent EDR sur chaque poste pour fonctionner

**Réponse : A**

**Q2 :** Quel honeypot industriel open-source de la suite T-Pot simule des automates programmables **SCADA** compatibles avec les protocoles Modbus TCP, S7 et BACnet, permettant de détecter les attaquants ciblant les systèmes OT de la BCC ?
- A) Conpot
- B) Cowrie
- C) Dionaea
- D) ElasticPot

**Réponse : A**

**Q3 :** Quel type de **Canary Token** placé dans un compte Active Directory leurre ("mnbc-backup-svc") permet de détecter immédiatement qu'un attaquant a dumpé la base de données NTDS.dit et tente de s'authentifier avec les credentials extraits ?
- A) Un Honey Credential — Compte AD factice dont toute authentification Kerberos/NTLM déclenche immédiatement une alerte CSIRT car aucun système légitime ne doit jamais l'utiliser
- B) Un Canary Token de type "document Word"
- C) Un Canary Token de type "URL web"
- D) Un Token AWS IAM désactivé

**Réponse : A**

**Q4 :** Dans l'architecture de déception BCC, pourquoi placer un **Honey PLC Modbus** (192.168.10.200:502) dans le VLAN OT est-il particulièrement efficace pour détecter les attaques de type SCADA/OT (cf. J218) ?
- A) Aucun opérateur légitime, aucun HMI autorisé ne communique avec cette adresse IP — toute connexion sur le port 502 de ce leurre signale immédiatement un scan Modbus ou une attaque OT en cours dans le réseau interne
- B) Le Honey PLC génère automatiquement des réponses Modbus légitimes pour tromper l'attaquant
- C) Le Honey PLC sert de backup au PLC de production en cas de panne
- D) Le Honey PLC enregistre les flux réseau pour l'analyse forensique uniquement

**Réponse : A**

**Q5 :** Quel honeypot SSH/Telnet open-source (inclus dans T-Pot) capture toutes les commandes exécutées par les attaquants dans un shell simulé et permet d'identifier leurs TTPs (reconnaissance, techniques de persistance, outils utilisés) ?
- A) Cowrie
- B) Conpot
- C) Dionaea
- D) Honeyd

**Réponse : A**

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
