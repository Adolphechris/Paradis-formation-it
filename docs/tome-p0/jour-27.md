# SEMESTRE 1 — Jour 27 (6h) : Hardening Linux & Sécurité Système

> [!NOTE]
> **Objectif de la journée** : Sécuriser un système Linux en appliquant les bonnes pratiques de durcissement (Hardening) selon les standards de l'industrie, configurer l'authentification forte via SSH et comprendre le rôle central de PAM.
> **Compétences visées** : `BIT-02` (Niveau Cible: A) — Administration Système Avancée, `SEC-03` (Niveau Cible: A) — Hardening et durcissement OS Linux.

---

## 1) Fondations du Hardening & Benchmarks (1h30)

### 📖 1.1 Narration & Intuition
Imaginez votre serveur Linux comme un château fort fraîchement construit. Par défaut, de nombreuses portes sont ouvertes, les ponts-levis sont baissés et les gardes laissent passer tout le monde. Le *Hardening* (durcissement) consiste à fermer les accès inutiles, à vérifier l'identité de chaque visiteur et à s'assurer que seuls les services critiques sont actifs. Les *CIS Benchmarks* (Center for Internet Security) sont le cahier des charges des architectes de sécurité, fournissant des centaines de règles pour garantir que votre château est imprenable.

### 🔍 1.2 Anatomie Technique
Le durcissement implique plusieurs couches :
- **Minimisation des services** : Désactiver tout ce qui n'est pas strictement nécessaire (imprimantes, partage de fichiers inutiles).
- **Mises à jour** : Un système non patché est une cible facile.
- **Sécurisation des accès locaux et réseaux** : Paramétrage rigoureux des fichiers de configuration, restriction des privilèges (principe du moindre privilège).

### 🛠️ 1.3 Atelier Pratique Hands-on
Vérifions les services qui écoutent sur le réseau et désactivons un service inutile (par exemple `cups`, le service d'impression, souvent installé par défaut sur des distributions desktop mais inutile sur un serveur).

```bash
# Lister les ports en écoute
sudo ss -tulnp

# Désactiver et masquer le service CUPS (impression) s'il est présent
sudo systemctl stop cups
sudo systemctl disable cups
sudo systemctl mask cups
```

### 🚑 1.4 Diagnostic & Réflexes Terrain
- **Symptôme** : Impossible de réactiver un service après un durcissement sévère.
- **Diagnostic** : Le service a probablement été "masqué" (`masked`), ce qui crée un lien symbolique vers `/dev/null`.
- **Réflexe** : Utiliser `sudo systemctl unmask nom_du_service` avant d'essayer de le redémarrer.

---

## 2) Blindage de l'accès distant : OpenSSH (1h30)

### 📖 2.1 Narration & Intuition
Le service SSH est la grande porte d'entrée de votre serveur. Si l'utilisateur `root` (le roi) peut se connecter directement avec un simple mot de passe (une clé en laiton générique), n'importe quel attaquant peut essayer de deviner cette clé en force brute depuis l'autre bout du monde. Nous allons interdire l'accès direct au roi, et exiger des clés biométriques (clés cryptographiques SSH) pour tous les autres visiteurs.

### 🔍 2.2 Anatomie Technique
Le fichier de configuration principal du serveur SSH est `/etc/ssh/sshd_config`. 
Les paramètres vitaux :
- `PermitRootLogin no` : Interdit la connexion directe en root.
- `PasswordAuthentication no` : Refuse les mots de passe.
- `PubkeyAuthentication yes` : Force l'utilisation d'une paire de clés (publique/privée).
- `Port 2222` : (Optionnel) Changer le port par défaut pour éviter les scans de masse automatisés.

### 🛠️ 1.3 Atelier Pratique Hands-on
Sécurisons notre serveur SSH.

```bash
# Générer une paire de clés sur la machine CLIENT (votre PC)
ssh-keygen -t ed25519 -C "admin@paradis-it.com"

# Copier la clé publique sur le serveur
ssh-copy-id -i ~/.ssh/id_ed25519.pub utilisateur@ip_du_serveur

# Sur le SERVEUR, éditer la configuration SSH
sudo nano /etc/ssh/sshd_config

# S'assurer que les lignes suivantes sont configurées (sans # devant) :
# PermitRootLogin no
# PasswordAuthentication no

# Redémarrer le service SSH pour appliquer les changements
sudo systemctl restart sshd
```
*Note: Gardez toujours votre session SSH actuelle ouverte lorsque vous redémarrez sshd pour ne pas vous enfermer dehors si vous avez fait une erreur de syntaxe.*

### 🚑 1.4 Diagnostic & Réflexes Terrain
- **Symptôme** : "Permission denied (publickey)".
- **Diagnostic** : Le serveur refuse la clé du client, ou les permissions du dossier `~/.ssh` sur le serveur sont incorrectes.
- **Réflexe** : Vérifier que `~/.ssh` est en `700` (`chmod 700 ~/.ssh`) et que `~/.ssh/authorized_keys` est en `600` (`chmod 600 ~/.ssh/authorized_keys`) sur le serveur. Consulter les logs via `sudo tail -f /var/log/auth.log`.

---

## 3) Pluggable Authentication Modules (PAM) (2h00)

### 📖 3.1 Narration & Intuition
PAM, c'est le videur de la boîte de nuit Linux. Chaque fois qu'une application (login, su, sshd) veut authentifier quelqu'un, elle ne le fait pas elle-même ; elle demande à PAM. PAM consulte ses règles de sécurité (les registres d'entrée) et décide si l'utilisateur peut entrer, sous quelles conditions, et s'il a le droit de changer son mot de passe.

### 🔍 3.2 Anatomie Technique
Les fichiers de configuration PAM résident dans `/etc/pam.d/`. Chaque service a son fichier (ex: `/etc/pam.d/sshd`, `/etc/pam.d/su`).
Les directives sont structurées en 4 types :
- `auth` : Vérifie l'identité (mot de passe).
- `account` : Vérifie si le compte est valide (non expiré, bonnes heures).
- `password` : Gère le changement de mot de passe (complexité).
- `session` : Gère ce qui se passe avant/après la connexion (monter un répertoire, logs).

### 🛠️ 1.3 Atelier Pratique Hands-on
Forçons la complexité des mots de passe (longueur minimale, caractères spéciaux) en utilisant le module `pam_pwquality`.

```bash
# Installer le module (sur Debian/Ubuntu)
sudo apt install libpam-pwquality

# Éditer le fichier de configuration principal pour les mots de passe
sudo nano /etc/pam.d/common-password

# Trouver la ligne contenant pam_pwquality.so et la modifier pour ajouter des contraintes :
# password requisite pam_pwquality.so retry=3 minlen=12 ucredit=-1 lcredit=-1 dcredit=-1 ocredit=-1
```
*Ici : minimum 12 caractères, au moins 1 majuscule (ucredit), 1 minuscule (lcredit), 1 chiffre (dcredit) et 1 caractère spécial (ocredit).*

### 🚑 1.4 Diagnostic & Réflexes Terrain
- **Symptôme** : Tous les utilisateurs, y compris `root`, sont bloqués et ne peuvent plus se connecter, avec le message "Module is unknown" ou une erreur d'authentification immédiate.
- **Diagnostic** : Erreur de frappe dans un fichier `/etc/pam.d/`. PAM est impitoyable : s'il ne comprend pas la règle, il refuse l'accès.
- **Réflexe** : Démarrer la machine en mode *Rescue* ou via un Live CD, monter le disque racine (`/`), et corriger la faute de frappe dans la configuration PAM. **Ne jamais fermer sa session root active en modifiant PAM !**

---

## 🏧️ Exercices Pratiques (Preuves de Portfolio)

### Exercice 1 : Durcissement SSH et PAM
- **Consigne** : Vous devez sécuriser votre machine virtuelle. 1) Bloquez l'accès root SSH. 2) Interdisez l'authentification par mot de passe SSH. 3) Configurez PAM pour bloquer un compte pendant 5 minutes après 3 tentatives de mot de passe incorrectes en console locale (`pam_faillock`).
- **Livrables à produire** : Capture d'écran d'une tentative de connexion root échouée. Capture d'écran du fichier `sshd_config`. Capture d'écran démontrant le blocage du compte après 3 échecs avec `faillock`.
- **Corrigé détaillé & Guidé** :
```bash
# 1 et 2: Sécurisation SSH
sudo sed -i 's/^#PermitRootLogin.*/PermitRootLogin no/' /etc/ssh/sshd_config
sudo sed -i 's/^#PasswordAuthentication.*/PasswordAuthentication no/' /etc/ssh/sshd_config
sudo systemctl restart sshd

# 3: Verrouillage après échec
sudo apt install libpam-modules
# Éditer /etc/pam.d/common-auth (ou system-auth selon distribution)
# Ajouter APRÈS la ligne "auth required pam_env.so" :
# auth required pam_faillock.so preauth silent deny=3 unlock_time=300
# auth [success=1 default=ignore] pam_unix.so nullok
# auth [default=die] pam_faillock.so authfail
# auth sufficient pam_faillock.so authsucc
```

---

## ❓ Banque de Questions QCM (Évaluation 75% minimum)
1. **Que signifie la directive `PermitRootLogin no` dans SSH ?**
   A) Root peut se connecter mais uniquement avec un mot de passe
   B) L'utilisateur root est supprimé du système
   C) Il est interdit de se connecter directement en tant que root via SSH
   D) Tous les utilisateurs sont traités comme root
   **Réponse : C**

2. **Quelle est la commande pour désactiver définitivement un service même s'il est appelé comme dépendance ?**
   A) `systemctl stop service`
   B) `systemctl disable service`
   C) `systemctl mask service`
   D) `systemctl kill service`
   **Réponse : C**

3. **Dans quel répertoire se trouvent les fichiers de configuration des modules d'authentification Linux ?**
   A) `/etc/auth/`
   B) `/etc/ssh/`
   C) `/etc/pam.d/`
   D) `/var/security/`
   **Réponse : C**

4. **Si `PasswordAuthentication` est à `no`, comment l'utilisateur doit-il s'authentifier via SSH ?**
   A) Par email
   B) Par une paire de clés cryptographiques (Pubkey)
   C) Par un appel téléphonique
   D) L'accès est totalement impossible
   **Réponse : B**

5. **A quoi sert le module `pam_pwquality` ?**
   A) Mesurer la vitesse de frappe au clavier
   B) Imposer des règles de complexité sur les nouveaux mots de passe
   C) Crypter le trafic réseau
   D) Surveiller les connexions SSH en temps réel
   **Réponse : B**
