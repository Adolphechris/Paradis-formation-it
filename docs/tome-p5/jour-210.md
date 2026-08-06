# TOME P5 — Cybersécurité Avancée & Red/Blue Team — Jour 210 (6h) : Projet Intégrateur Semestre 5 — Partie 2 : Audit de Sécurité Réseau Sans-Fil & Ingestion Sociale BCC (Synthèse J206-J209)

> [!NOTE]
> **Objectif du jour :** Synthetiser les acquis des Jours 206 à 209 dans un **projet intégrateur Red Team & Blue Team complet** : audit de sécurité des infrastructures sans-fil d'entreprise, évaluation des applications mobiles bancaires (Android/iOS), simulation d'ingénierie sociale (Phishing Evilginx2) et définition des contrôles de hardening système et bastions d'accès privilégiés.
>
> **Compétences visées :** `SEC-04` à `SEC-06` (A) — Audits Sans-Fil, Mobile, Social Engineering & Hardening System

---

## 1) Module — Synthèse de l'Audit de Sécurité Globale BCC (2h)

### 📖 Narration/Intuition

Dans le cadre du programme de cybersécurité de la BCC, nous combinons les évaluations menées sur les vecteurs d'accès périphériques (Wi-Fi, Apps Mobiles, Facteur Humain, Bastions d'Admin) pour fournir une cartographie globale des vulnérabilités et des remédiations.

### 🔍 Anatomie Technique

**Cartographie des Vecteurs d'Attaque Évalués :**

```
┌─────────────────────────────────────────────────────────────┐
│ 1. VECTEUR WI-FI (Jour 206)                                 │
│  - SSID : BCC-Corporate (PEAP-MSCHAPv2)                     │
│  - Risque : Attaque EvilTwin + Hash Cracking MSCHAPv2       │
│  - Remédiation : Migration vers EAP-TLS (Certificats X.509) │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. VECTEUR MOBILE (Jour 207)                                │
│  - App : BCC Mobile Banking APK                             │
│  - Risque : Clés AWS codées en dur, SSL Pinning manquant    │
│  - Remédiation : Obfuscation R8, Frida protection, Vault    │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. VECTEUR HUMAIN (Jour 208)                                │
│  - Phishing : Reverse Proxy Evilginx2                       │
│  - Risque : Vol de Cookie de Session (Bypass MFA TOTP)      │
│  - Remédiation : Authentification FIDO2 / Passkeys WebAuthn │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│ 4. VECTEUR ADMINISTRATION (Jour 209)                        │
│  - Accès SSH : Connexions directes Root autorisées          │
│  - Risque : Absences de traçabilité nominative              │
│  - Remédiation : Bastion Teleport + Certificats éphémères   │
└─────────────────────────────────────────────────────────────┘
```

---

## 2) Module — Matrice Globale de Vulnérabilités & Criticité (2h)

### 📖 Narration/Intuition

Les résultats des audits sont synthétisés selon la norme **CVSS v3.1** afin de prioriser les efforts de remédiation des équipes Blue Team et Ops.

### 🔍 Anatomie Technique

**Matrice des Vulnérabilités Découvertes (Audits J206-J209) :**

| Ref ID | Périmètre | Vulnérabilité Découverte | Criticité | CVSS v3.1 | Remédiation Prioritaire |
|---|---|---|:---:|:---:|---|
| BCC-MOB-01 | App Mobile Android | Clé d'accès AWS Master codée en dur dans le bytecode DEX | CRITIQUE | 9.8 | Supprimer la clé du code source. Utiliser AWS STS / HashiCorp Vault. |
| BCC-HUM-01 | Identités / Auth | Sensibilité au Phishing Reverse Proxy Evilginx2 (TOTP Bypass) | ÉLEVÉE | 8.5 | Migrer les 500 collaborateurs clés vers des clés FIDO2 (YubiKey). |
| BCC-WIFI-01 | Réseau Sans-Fil | Utilisation de PEAP-MSCHAPv2 sensible aux attaques Evil Twin | ÉLEVÉE | 7.4 | Déployer EAP-TLS avec certificats X.509 obligatoires par GPO. |
| BCC-SYS-01 | Serveurs Linux | Accès SSH direct sous l'utilisateur Root autorisé | MOYENNE | 6.5 | Configurer `PermitRootLogin no` et déployer le Bastion Teleport. |
| BCC-MOB-02 | App Mobile Android | Absences de SSL Pinning et détection de Root désactivée | MOYENNE | 5.3 | Implémenter le Pinning de certificat avec la bibliothèque OkHttp. |

---

## 3) Module — Plan de Securisation & Architecture Cible (2h)

### 📖 Narration/Intuition

L'architecture cible intègre l'ensemble des mécanismes de protection recommandés pour élever la posture de sécurité de la BCC aux standards bancaires internationaux.

### 🛠️ Atelier Pratique

**Architecture de Sécurité Cible (Blue Team Plan) :**

```markdown
# FEUILLE DE ROUTE DE SÉCURISATION CYBER — BCC (2026-2027)

### PHASE 1 : PROTECTION DES ACCÈS & IDENTITÉS (Mois 1-2)
- 🔒 **Déploiement FIDO2 / WebAuthn** : Remplacement des SMS/TOTP par des YubiKeys FIDO2 pour l'ensemble des administrateurs et collaborateurs habilités (Éradication du Phishing Reverse Proxy).
- 🔒 **Bastion d'Administration Teleport** : Fermeture de tous les ports SSH 22 directs depuis l'extérieur. Tout accès passe par `bastion.bcc.cd:443` avec enregistrement de session vidéo.

### PHASE 2 : SÉCURISATION DU RÉSEAU SANS-FIL & INFRASTRUCTURE (Mois 3-4)
- 🔒 **Migration Wi-Fi 802.1X EAP-TLS** : Émission automatique de certificats clients X.509 via Active Directory Certificate Services (AD CS). Désactivation définitive de PEAP.
- 🔒 **Hardening Linux SSH & PAM** : Déploiement du fichier `sshd_config` durci + activation du module `pam_faillock` sur l'ensemble des serveurs.

### PHASE 3 : SÉCURISATION APPLICATIVE MOBILE (Mois 5-6)
- 🔒 **Hardening APK Android / iOS** : Integration de R8/ProGuard pour l'obfuscation du code, activation du SSL Pinning strict et détection du Root/Jailbreak.
- 🔒 **Vault Dynamic Secrets** : Migration de toutes les clés d'API vers HashiCorp Vault.
```

---

## 🏅 Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **CVSS** | Common Vulnerability Scoring System — Norme internationale de notation des vulnérabilités |
| **AD CS** | Active Directory Certificate Services — Service d'autorité de certification Microsoft |
| **STS** | Security Token Service — Service AWS d'émission de jetons temporaires |

---

## 🏋️ Exercices & Corrigés

**Exercice 1 :** Pourquoi la présence d'une clé d'accès cloud (ex: `AWS_ACCESS_KEY`) codée en dur dans une application mobile Android constitue-t-elle une vulnérabilité de criticité **CRITIQUE (CVSS 9.8)** ?

**Corrigé :** Un fichier APK Android est un paquet d'archive qui peut être décompilé en quelques secondes par n'importe quel utilisateur ou attaquant à l'aide d'outils gratuits comme **Jadx** ou **MobSF**. Tout secret, mot de passe ou clé d'API écrit en clair dans le code Java/Kotlin est immédiatement extrait. Si une clé d'accès Cloud (ex: AWS Access Key) avec des droits d'écriture est extraite, l'attaquant peut l'utiliser pour prendre le contrôle total du compte AWS de l'entreprise, exfiltrer l'intégralité des bases de données S3/RDS, ou déployer des clusters de minage de cryptomonnaie entraînant des factures de plusieurs centaines de milliers de dollars.

**Exercice 2 :** Dans le plan de sécurisation globale, pourquoi la combinaison d'un **Bastion Teleport** et de clés **FIDO2 YubiKey** offre-t-elle une protection quasi-invulnérable pour les accès d'administration d'une banque ?

**Corrigé :** Cette combinaison couvre l'intégralité de la chaîne d'accès administratif : (1) **FIDO2 YubiKey** protège l'authentification initiale de l'administrateur contre le Phishing, le vol de mot de passe et les attaques de type Evilginx2 (grâce au liage cryptographique au domaine). (2) **Teleport** élimine les mots de passe et clés SSH statiques au profit de certificats éphémères signés valides quelques heures, enregistre l'intégralité des commandes et flux vidéo de la session d'administration, et empêche l'accès direct aux serveurs (qui n'exposent aucun port sur Internet). Même si un ordinateur d'administrateur est volé, sans la YubiKey physique et sans session Teleport active, aucun accès serveur n'est possible.

---

## ❓ Banque de Questions & Test du Jour

**Q1 :** Dans la notation de criticité des vulnérabilités CVSS v3.1, quel score caractérise une vulnérabilité de niveau **CRITIQUE** nécessitant une remédiation immédiate ?
- A) Score de 9.0 à 10.0
- B) Score de 0.1 à 3.9
- C) Score de 4.0 à 6.9
- D) Score de 7.0 à 8.9

**Réponse : A**

**Q2 :** Pourquoi la décompilation d'une application Android avec des outils comme Jadx révèle-t-elle facilement les clés d'API codées en dur dans le code source Java ?
- A) Car le bytecode DEX conservé dans l'APK contient l'intégralité des constantes textuelles du code source non obfusqué
- B) Car Android force l'écriture des clés en clair dans le fichier manifeste
- C) Car les clés d'API sont envoyées par SMS
- D) Car Jadx devine les mots de passe

**Réponse : A**

**Q3 :** Dans le plan de sécurisation Wi-Fi d'entreprise, quel service Microsoft permet d'émettre automatiquement des certificats clients X.509 pour l'authentification 802.1X EAP-TLS ?
- A) Active Directory Certificate Services (AD CS)
- B) Windows Update
- C) Windows Defender
- D) DHCP Server

**Réponse : A**

**Q4 :** Quel composant de sécurité cloud d'AWS permet de délivrer des jetons d'accès temporaires à durée de vie courte plutôt que d'utiliser des clés d'accès statiques ?
- A) AWS STS (Security Token Service)
- B) AWS S3
- C) AWS Route 53
- D) AWS CloudFront

**Réponse : A**

**Q5 :** Quel est l'avantage principal d'un audit de sécurité combinant les approches Red Team (offensive) et Blue Team (défensive) — souvent appelée **Purple Team** ?
- A) Permettre aux défenseurs (Blue Team) de comprendre en temps réel les techniques d'attaque utilisées par les attaquants (Red Team) pour ajuster et valider immédiatement les règles de détection SIEM/EDR
- B) Réduire le coût de l'audit
- C) Remplacer les logiciels antivirus
- D) Éviter l'utilisation du chiffrement

**Réponse : A**

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
