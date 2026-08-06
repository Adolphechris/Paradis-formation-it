# TOME P5 — Cybersécurité Avancée & Red/Blue Team — Jour 209 (6h) : Hardening Système & Bastion d'Administration (SSH Hardening, PAM Linux, Bastion Teleport/Guacamole & PAM Privileged Access Management)

> [!NOTE]
> **Objectif du jour :** Maîtriser les techniques de durcissement (Hardening) des accès administratifs et la mise en œuvre de **Bastions d'Administration** : durcissement avancé du service **SSH (sshd_config)**, configuration des modules d'authentification Linux (**PAM — Pluggable Authentication Modules**), déploiement d'un Bastion moderne (**Teleport / Apache Guacamole**), et gestion des accès privilégiés (**PAM / PAM Privileged Access Management**).
>
> **Compétences visées :** `SEC-04` (A) — Bastion d'Administration & SSH Hardening | `SEC-05` (A) — Linux PAM & Privileged Access Management

---

## 1) Module — Durcissement du Service SSH (SSH Hardening) (2h)

### 📖 Narration/Intuition

Le protocole **SSH (Secure Shell)** est la porte d'entrée principale pour la gestion à distance des serveurs Linux de la BCC. Un serveur SSH mal configuré (authentification par mot de passe autorisée, accès Root direct permis, ciphers obsolètes) est une cible de choix pour les attaques par force brute et la prise de contrôle à distance.

Le **SSH Hardening** consiste à restreindre les configurations du daemon `sshd` pour interdire l'accès Root direct, imposer l'authentification par clés Ed25519 ou certificats SSH, désactiver les algorithmes de chiffrement obsolètes et limiter les accès par IP.

### 🔍 Anatomie Technique

**Fichier de Configuration SSH Sécurisé (`/etc/ssh/sshd_config.d/hardening.conf`) :**

```ini
# ════════════════════════════════════════════════════════════
# HARDENING SSHD — BANQUE CENTRALE DU CONGO (BCC)
# ════════════════════════════════════════════════════════════

# 1. ACCÈS ET AUTHENTIFICATION
Port 2222                          # Changer le port par défaut (Anti-Reconnaissance)
Protocol 2                         # Protocol version 2 uniquement
PermitRootLogin no                 # 🚨 INTERDIRE STRICTEMENT la connexion directe en ROOT
PubkeyAuthentication yes           # Autoriser l'authentification par clés publiques
PasswordAuthentication no           # 🚨 DÉSACTIVER l'authentification par mot de passe !
KbdInteractiveAuthentication no    # Désactiver l'authentification interactive
PermitEmptyPasswords no            # Interdire les mots de passe vides
MaxAuthTries 3                     # Max 3 tentatives avant déconnexion

# 2. SEULS ALGORITHMES CRYPTOGRAPHIQUES FORTS (FIPS 140-3)
# Algorithmes d'échange de clés (KEX)
KexAlgorithms curve25519-sha256,curve25519-sha256@libssh.org,diffie-hellman-group16-sha512

# Algorithmes de chiffrement (Ciphers)
Ciphers chacha20-poly1305@openssh.com,aes256-gcm@openssh.com,aes128-gcm@openssh.com

# Codes d'authentification de message (MACs)
MACs hmac-sha2-512-etm@openssh.com,hmac-sha2-256-etm@openssh.com

# 3. SESSIONS ET RESTRICTIONS
ClientAliveInterval 300            # Déconnexion automatique après 5 min d'inactivité
ClientAliveCountMax 0
X11Forwarding no                   # Désactiver la redirection d'affichage X11
AllowTcpForwarding no              # Désactiver le tunnel TCP sauf si explicite
AllowAgentForwarding no            # Désactiver la redirection d'agent SSH
MaxStartups 10:30:100              # Protection Anti-DoS Brute Force

# 4. RESTRICTION D'ACCÈS PAR GROUPE
AllowGroups sysadmins bcc-ops     # Seuls ces deux groupes Linux peuvent se connecter
```

---

## 2) Module — Linux PAM (Pluggable Authentication Modules) (2h)

### 📖 Narration/Intuition

**PAM (Pluggable Authentication Modules)** est la couche d'abstraction sous Linux qui gère toutes les opérations d'authentification (`login`, `sudo`, `su`, `sshd`).

En configurant PAM, les administrateurs BCC peuvent imposer le **MFA (TOTP)** directement lors des connexions SSH ou lors de l'exécution de la commande `sudo`, verrouiller automatiquement les comptes après 5 échecs de mot de passe (module `pam_faillock`), et restreindre les heures de connexion (`pam_time`).

### 🔍 Anatomie Technique

**Fichier de Configuration PAM Sudo avec MFA TOTP (`/etc/pam.d/sudo`) :**

```ini
# /etc/pam.d/sudo — Exiger le mot de passe ET un code TOTP (MFA) pour exécuter sudo
auth       required     pam_env.so
auth       required     pam_google_authenticator.so nullok secret=/var/lib/google-authenticator/${USER}/.google_authenticator
auth       required     pam_unix.so try_first_pass use_first_pass
@include common-account
@include common-session
```

**Configuration de Verrouillage de Compte avec `pam_faillock` (`/etc/security/faillock.conf`) :**

```ini
# Verrouillage automatique de compte après échecs répétés
deny = 5                  # Verrouiller après 5 échecs consécutifs
unlock_time = 900         # Verrouillage pendant 15 minutes (900 secondes)
fail_interval = 900       # Fenêtre d'évaluation de 15 minutes
even_deny_root            # Appliquer le verrouillage même pour le compte root !
```

---

## 3) Module — Bastion d'Administration Modernes (Teleport / Guacamole) (2h)

### 📖 Narration/Intuition

Dans une architecture bancaire sécurisée, aucun administrateur ne doit pouvoir se connecter directement depuis son poste de travail vers les serveurs de production. Tout accès d'administration doit obligatoirement passer par un **Bastion d'Administration (Jump Server)**.

Un bastion moderne comme **Gravitational Teleport** apporte :
- L'accès sans mot de passe ni clé statique (Authentification par **certificats SSH éphémères** émis pour 8 heures via OIDC/Okta).
- L'enregistrement vidéo intégral des sessions SSH et des commandes exécutées (Session Recording & Audit).
- Le contrôle d'accès basé sur les rôles (RBAC) au niveau de la commande Linux.

### 🛠️ Atelier Pratique

**Architecture et Configuration de Teleport Bastion (`teleport.yaml`) :**

```yaml
# Configuration du Bastion Teleport pour la BCC (/etc/teleport.yaml)
teleport:
  nodename: bastion.bcc.cd
  data_dir: /var/lib/teleport
  log:
    output: stderr
    severity: INFO

# Service Proxy (Point d'accès public sécurisé)
proxy_service:
  enabled: "yes"
  web_listen_addr: 0.0.0.0:443
  public_addr: bastion.bcc.cd:443
  https_keypairs:
    - cert_file: /etc/ssl/certs/teleport.pem
      key_file: /etc/ssl/private/teleport.key

# Service Auth (Autorité de Certification éphémère)
auth_service:
  enabled: "yes"
  cluster_name: "bcc-production-cluster"
  authentication:
    type: oidc # Authentification via le fournisseur OIDC BCC (Keycloak / Okta)
    second_factor: otp # MFA TOTP obligatoire

# Enregistrement vidéo de toutes les sessions SSH
session_recording: "node-sync" # Transmis et chiffré en temps réel vers S3
```

---

## 🏅 Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **PAM** | Pluggable Authentication Modules — Framework d'authentification modulaire sous Linux |
| **PAM (Sec)** | Privileged Access Management — Gestion et contrôle des accès à hauts privilèges |
| **KEX** | Key Exchange — Algorithme d'échange de clés cryptographiques dans SSH |
| **TOTP** | Time-based One-Time Password — Code d'authentification temporaire à usage unique |
| **RBAC** | Role-Based Access Control — Contrôle d'accès basé sur les rôles de l'utilisateur |

---

## 🏋️ Exercices & Corrigés

**Exercice 1 :** Pourquoi la directive `PermitRootLogin no` dans la configuration SSH (`sshd_config`) est-elle une règle de sécurité fondamentale pour la traçabilité des actions administrateurs ?

**Corrigé :** Si la connexion directe en `root` via SSH est autorisée (`PermitRootLogin yes`), tous les administrateurs se connectent sous la même identité générique `root`. En cas d'erreur de configuration, d'action malveillante ou de fuite de données, les logs du serveur afficheront uniquement `root` comme auteur de l'action, rendant **impossible l'imputation de l'action à un individu spécifique** (perte de la traçabilité et de la responsabilité). En définissant `PermitRootLogin no`, chaque administrateur doit obligatoirement se connecter avec son propre compte nominatif (ex: `kabilaj`), authentifié par sa propre clé SSH, puis utiliser `sudo` pour élever ses privilèges. L'ensemble des commandes exécutées en root est ainsi nominativement tracé dans `/var/log/auth.log` et `/var/log/syslog`.

**Exercice 2 :** Quel est le principal avantage de l'utilisation de **certificats SSH éphémères** (comme dans Teleport) par rapport à la gestion traditionnelle des **clés SSH publiques statiques** (`authorized_keys`) ?

**Corrigé :** Dans la gestion traditionnelle par **clés publiques statiques**, la clé publique de chaque administrateur doit être copiée dans le fichier `~/.ssh/authorized_keys` de chaque serveur. Problèmes : (1) **Gestion du cycle de vie** : si un administrateur quitte l'entreprise, sa clé doit être supprimée manuellement de dizaines ou centaines de serveurs (risque d'oubli de clés orphelines), (2) **Absence d'expiration** : une clé statique reste valide indéfiniment jusqu'à sa suppression. Avec les **certificats SSH éphémères**, l'administrateur s'authentifie sur le Bastion (avec MFA), qui lui émet un certificat SSH signé cryptographiquement par la CA de l'entreprise avec une **durée de vie limitée** (ex: 8 heures). Les serveurs cibles font confiance à la CA de l'entreprise. À la fin de la journée, le certificat **expire automatiquement** et devient inutilisable sans qu'aucune action de nettoyage ne soit nécessaire sur les serveurs.

---

## ❓ Banque de Questions & Test du Jour

**Q1 :** Quelle directive dans le fichier `sshd_config` permet d'interdire formellement l'authentification par mot de passe, forçant l'utilisation exclusive de clés cryptographiques SSH ?
- A) `PasswordAuthentication no`
- B) `PermitRootLogin no`
- C) `PubkeyAuthentication no`
- D) `AllowGroups none`

**Réponse : A**

**Q2 :** Quel composant d'architecture Linux gère l'authentification de manière modulaire pour les services comme `login`, `sudo` et `sshd` ?
- A) PAM (Pluggable Authentication Modules)
- B) Systemd
- C) GRUB
- D) Udev

**Réponse : A**

**Q3 :** Quel module PAM permet de verrouiller automatiquement un compte utilisateur Linux après un nombre défini d'échecs d'authentification consécutifs ?
- A) `pam_faillock`
- B) `pam_unix`
- C) `pam_env`
- D) `pam_permit`

**Réponse : A**

**Q4 :** Quel est le rôle principal d'un **Bastion d'Administration (Jump Server)** comme Teleport dans une infrastructure d'entreprise ?
- A) Centraliser, contrôler, authentifier (MFA) et enregistrer (vidéo/logs) toutes les sessions d'accès administratif vers les serveurs internes sans accès direct depuis Internet
- B) Accélérer la vitesse du réseau Wi-Fi
- C) Compresser les bases de données SQL
- D) Servir de serveur web public

**Réponse : A**

**Q5 :** Quel type d'authentification SSH moderne élimine le besoin de gérer des fichiers `authorized_keys` statiques sur les serveurs en utilisant des jetons signés à durée de vie courte ?
- A) Les certificats SSH éphémères
- B) Mots de passe simples de 8 caractères
- C) L'authentification par adresse MAC
- D) Le protocole Telnet

**Réponse : A**

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
