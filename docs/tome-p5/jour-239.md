# TOME P5 — Cybersécurité Avancée & Red/Blue Team — Jour 239 (6h) : Active Directory Enterprise Federation (ADFS Exploitation, SAML Response Spoofing, Golden SAML Attack & Détection SOC)

> [!NOTE]
> **Objectif du jour :** Maîtriser l'analyse et la sécurisation des architectures de fédération d'identité **Active Directory Federation Services (ADFS)** : compréhension du fonctionnement des assertions **SAML 2.0**, exploitation des vulnérabilités de fédération (usurpation d'assertion, **Golden SAML Attack** via l'extraction du certificat de signature de jeton ADFS / Token-Signing Certificate), et déploiement des contrôles de détection et de durcissement défensif.
>
> **Compétences visées :** `SEC-04` (A) — Active Directory Federation Exploitation & Golden SAML Attack | `SEC-05` (A) — SAML 2.0 Hardening & ADFS Detection Security Controls

---

## 1) Module — Mécanismes de Fédération SAML 2.0 & ADFS (2h)

### 📖 Narration/Intuition

Pour permettre aux employés de la BCC d'accéder aux applications Cloud (AWS, Microsoft 365, applications MNBC) avec leurs identifiants Active Directory locaux sans ressaisir leur mot de passe, la BCC utilise **ADFS (Active Directory Federation Services)** comme Fournisseur d'Identité (**Identity Provider — IdP**).

L'élément central d'ADFS est le **Token-Signing Certificate** (certificat de signature de jetons). Si un attaquant parvient à voler la clé privée de ce certificat, il peut forger des assertions SAML valides pour **n'importe quel utilisateur**, contournant totalement l'authentification AD et le MFA !

### 🔍 Anatomie Technique

**Fonctionnement de la Fédération SAML 2.0 :**

```
┌──────────┐         1. Reconnect Request          ┌──────────────────────┐
│ Client   ├──────────────────────────────────────►│ Service Provider (SP)│
│ Browser  │◄──────────────────────────────────────┤ (ex: Cloud AWS BCC)  │
└────┬─────┘    2. SAML AuthNRequest Redirect      └──────────────────────┘
     │
     │ 3. Authentification AD (Kerberos/NTLM)
     ▼
┌──────────────────────────┐
│ Identity Provider (IdP)  │ 4. Génère & Signe l'Assertion SAML 2.0
│ ADFS Server BCC          │    avec la clé privée du Token-Signing Cert
└────┬─────────────────────┘
     │
     │ 5. SAML Response (Assertion signée) transmise via le Navigateur
     ▼
┌──────────────────────────┐
│ Service Provider (SP)    │ 6. Valide la signature avec la clé publique ADFS
│ (Cloud AWS BCC)          │    → Accès accordé à l'utilisateur !
└──────────────────────────┘
```

---

## 2) Module — Golden SAML Attack (2h)

### 📖 Narration/Intuition

Découverte par CyberArk en 2017 (et utilisée par le groupe APT29 lors de l'attaque SolarWinds), l'attaque **Golden SAML** est l'équivalent dans le monde de la fédération Cloud de l'attaque Golden Ticket dans Active Directory local.

Elle permet à un attaquant qui a extrait le certificat de signature d'ADFS de générer des réponses SAML valides en hors-ligne, sans jamais contacter le serveur ADFS ni déclencher de requêtes d'authentification AD !

### 🛠️ Atelier Pratique

**Extraction du Certificat ADFS & Attaque Golden SAML (`golden_saml.py`) :**

```python
# 1. Extraction du Certificat ADFS (Côté Red Team via Mimikatz ou DPAPI)
# Sur le serveur ADFS compromis :
# mimikatz # lsadump::adfs /delegate

# Données extraites :
# - Clé privée du Token-Signing Certificate (PFX / PEM)
# - Issuer URI : http://adfs.bcc.cd/adfs/services/trust
# - NameID Format & Attribute Claims

# 2. Forge de l'Assertion SAML 2.0 avec la clé volée (Golden SAML)
from saml2 import saml, sigver
import datetime

def forge_golden_saml(target_user="gouverneur@bcc.cd"):
    """Forge une assertion SAML 2.0 valide avec la clé privée ADFS volée."""
    print(f"🔑 Génération d'une assertion Golden SAML pour : {target_user}")
    
    # L'assertion inclut les rôles les plus élevés (Admin AWS / Global Admin)
    # Même si le mot de passe de l'utilisateur change ou si le MFA est activé,
    # le Service Provider (Cloud) acceptera l'assertion signée !
    print("✅ Assertion Golden SAML générée — Accès Cloud accordé sans mot de passe ni MFA !")

if __name__ == "__main__":
    forge_golden_saml()
```

---

## 3) Module — Hardening & Détection SOC ADFS (2h)

### 🛠️ Atelier Pratique

**Détection SOC des Anomalies ADFS (`adfs_detection.yaml`) :**

```yaml
# Règle de Détection SIEM — Usurpation SAML / Golden SAML
title: Détection d'Assertion SAML sans Événement d'Authentification ADFS Associé
description: >
  Détecte une connexion réussie sur AWS/Cloud via SAML alors qu'aucun événement
  d'émission de jeton (EventID 1200 / 1202) n'a été enregistré sur ADFS.
logsource:
  product: cloud_federation
detection:
  selection_cloud:
    event_type: "SAMLIdentityProviderLogin"
  selection_adfs_logs:
    event_id: 1200 # Token issuance on ADFS
  condition: selection_cloud and not selection_adfs_logs (Corrélation SIEM)
falsepositives:
  - Désynchronisation temporelle des logs (NTP)
level: critical
```

---

## 🏅 Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **ADFS** | Active Directory Federation Services — Service de fédération d'identité Microsoft |
| **SAML** | Security Assertion Markup Language — Standard d'échange d'identités et d'authentification |
| **IdP** | Identity Provider — Fournisseur d'Identité émettant les assertions (ex: ADFS) |
| **SP** | Service Provider — Fournisseur de Service consommant les assertions (ex: AWS) |
| **DPAPI** | Data Protection API — API de chiffrement de secrets Windows |

---

## 🏋️ Exercices & Corrigés

**Exercice 1 :** Expliquer pourquoi l'attaque **Golden SAML** permet de contourner l'authentification à deux facteurs (**MFA**) et la réinitialisation du mot de passe de la victime.

**Corrigé :** Dans une fédération SAML 2.0, le Service Provider (SP, ex: AWS Cloud) ne gère ni les mots de passe ni le MFA : il fait une **confiance aveugle** aux assertions SAML signées par la clé privée du Fournisseur d'Identité (IdP, ADFS). Lors d'une attaque Golden SAML, l'attaquant possède la clé privée du Token-Signing Certificate ADFS et forge directement l'assertion SAML de son côté. Comme l'assertion est présentée directement au Service Provider (AWS) sans jamais passer par le serveur ADFS réel, aucun mot de passe n'est vérifié et aucune requête MFA n'est déclenchée. Même si la victime réinitialise son mot de passe AD, l'assertion forgée reste cryptographiquement valide pour le SP jusqu'à la révocation ou le renouvellement du certificat de signature ADFS.

**Exercice 2 :** Quelle est la mesure de remédiation d'urgence (P0) à appliquer immédiatement si la clé privée du Token-Signing Certificate d'un serveur ADFS a été compromise ?

**Corrigé :** (1) **Renouveler immédiatement le Token-Signing Certificate** sur le serveur ADFS (`Update-AdfsCertificate -CertificateType Token-Signing -Urgent`). (2) **Exporter la nouvelle clé publique** et **mettre à jour la métadonnée de fédération** sur TOUS les Service Providers connectés (AWS, Azure, Microsoft 365, Salesforce). (3) **Invalider les anciens certificats** chez les Service Providers pour que les assertions signées avec l'ancienne clé privée soient rejetées. (4) Réinitialiser les mots de passe des comptes à hauts privilèges et effectuer une recherche d'indicateurs de compromission (IOCs) sur le serveur ADFS.

---

## ❓ Banque de Questions & Test du Jour

**Q1 :** Dans une architecture de fédération ADFS / SAML 2.0, quel composant critique détient la clé privée utilisée pour signer les assertions transmises aux applications Cloud ?
- A) Le Token-Signing Certificate du serveur ADFS
- B) Le contrôleur de domaine AD principal
- C) L'application cliente
- D) Le serveur DNS

**Réponse : A**

**Q2 :** Quel est le principal avantage de l'attaque **Golden SAML** pour un attaquant par rapport à d'autres techniques de compromission AD ?
- A) Elle permet d'accéder aux services Cloud en générant des assertions signées hors-ligne sans contacter ADFS ni déclencher de MFA
- B) Elle chiffre les disques durs des serveurs
- C) Elle accélère la vitesse du réseau
- D) Elle efface les logs du pare-feu

**Réponse : A**

**Q3 :** Quel rôle joue l'élément **Service Provider (SP)** dans une transaction de fédération SAML 2.0 ?
- A) Il consomme et vérifie l'assertion SAML transmise par le client pour lui accorder l'accès à la ressource
- B) Il émet les mots de passe des utilisateurs
- C) Il gère l'annuaire Active Directory
- D) Il effectue les sauvegardes réseau

**Réponse : A**

**Q4 :** Comment un SIEM/SOC peut-il détecter une attaque de type Golden SAML en croisant les logs Cloud et ADFS ?
- A) En détectant une connexion SAML réussie sur le Cloud sans aucun événement d'émission de jeton ADFS correspondant au même moment
- B) En mesurant la taille des fichiers logs
- C) En vérifiant la version de Python
- D) En scannant les ports SSH

**Réponse : A**

**Q5 :** Quel outil/méthode est traditionnellement utilisé par les attaquants pour extraire la clé privée du certificat ADFS depuis la mémoire ou la base DPAPI du serveur ADFS ?
- A) Mimikatz (lsadump::adfs)
- B) Wireshark
- C) Nmap
- D) Trivy

**Réponse : A**

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
