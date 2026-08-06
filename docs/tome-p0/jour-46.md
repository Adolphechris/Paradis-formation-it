# SEMESTRE 1 — Jour 46 (6h) : Hardening Linux Approfondi & SecOps

> [!NOTE]
> **Objectif de la journée** : Blinder l'infrastructure Linux en configurant un bastion SSH sécurisé, en renforçant l'authentification avec PAM, et en ajustant le noyau contre les attaques.
> **Compétences visées** : `SEC-03` (Niveau Cible: A) — Appliquer des mesures de durcissement (hardening) avancées sur les systèmes d'exploitation.

---

## 1) Bastion SSH & PAM (Pluggable Authentication Modules) (1h30)

### 📖 1.1 Narration & Intuition
Imaginez votre serveur comme un coffre-fort. Le service SSH en est la porte d'entrée principale. Un bastion SSH est une machine ultra-sécurisée qui sert de point d'entrée unique vers l'ensemble de votre réseau interne (le sas de sécurité de la banque). PAM (Pluggable Authentication Modules), c'est le vigile intraitable à cette porte : il vérifie non seulement la clé, mais aussi le badge de sécurité, l'empreinte digitale, et s'assure que vous n'avez pas essayé 15 mauvaises clés de suite.

### 🔍 1.2 Anatomie Technique
- **SSH (sshd_config)** : Configuration désactivant le login root, limitant les chiffrements faibles et interdisant les mots de passe vides.
- **PAM (/etc/pam.d/)** : Une pile de modules qui s'exécutent en série. Les types de modules sont `auth` (vérification de l'identité), `account` (validité du compte), `password` (changement de mot de passe) et `session` (configuration de l'environnement).
- **Faillib / Tally2** : Historiquement utilisés pour bloquer les comptes après de multiples échecs, remplacés aujourd'hui par `pam_faillock.so`.

### 🛠️ 1.3 Atelier Pratique Hands-on
```bash
# 1. Sécuriser SSH : on empêche le root login et l'authentification par mot de passe
sudo sed -i 's/^#PermitRootLogin.*/PermitRootLogin no/' /etc/ssh/sshd_config
sudo sed -i 's/^#PasswordAuthentication.*/PasswordAuthentication no/' /etc/ssh/sshd_config
sudo systemctl restart ssh

# 2. Configurer PAM pour bloquer un utilisateur après 3 échecs
# Édition de /etc/pam.d/common-auth (Debian/Ubuntu)
# Ajouter au-dessus de 'auth required pam_deny.so' (Attention en prod !)
sudo bash -c 'echo "auth required pam_faillock.so preauth silent audit deny=3 unlock_time=600" >> /tmp/pam_test'
sudo bash -c 'echo "auth [default=die] pam_faillock.so authfail audit deny=3 unlock_time=600" >> /tmp/pam_test'

# 3. Vérifier les échecs
sudo faillock --user adolphe
```

### 🚑 1.4 Diagnostic & Réflexes Terrain
- **Symptôme** : "Permission denied (publickey)".
- **Réflexe** : Vérifiez `/var/log/auth.log` ou le journal systemd (`journalctl -u ssh`). Assurez-vous que l'utilisateur a bien déposé la bonne clé publique dans `~/.ssh/authorized_keys` et que les permissions sont à `600` ou `644`, et `700` pour le dossier `.ssh`.

---

## 2) Kernel Hardening (sysctl.conf) (1h30)

### 📖 2.1 Narration & Intuition
Le noyau (Kernel) est le cœur battant du système. Même si la porte est solide (SSH), le système digestif doit pouvoir rejeter le poison. Le Kernel Hardening consiste à modifier les variables du noyau à chaud pour ignorer les paquets réseau malveillants, prévenir les attaques par déni de service (DDoS) comme le "SYN flood", et empêcher la prédiction de l'aléatoire.

### 🔍 2.2 Anatomie Technique
L'interface `/proc/sys/` permet de lire et modifier ces valeurs. L'outil `sysctl` lit le fichier de configuration statique `/etc/sysctl.conf` ou le répertoire `/etc/sysctl.d/` au démarrage pour appliquer ces réglages réseau et système au noyau en cours d'exécution.

### 🛠️ 2.3 Atelier Pratique Hands-on
```bash
# 1. Créer un fichier de hardening personnalisé
sudo nano /etc/sysctl.d/99-security.conf
```
*Insérer le contenu suivant :*
```ini
# Protection contre les attaques SYN Flood
net.ipv4.tcp_syncookies = 1
# Ignorer les requêtes ICMP (Ping)
net.ipv4.icmp_echo_ignore_all = 1
# Désactiver le routage (sauf si routeur)
net.ipv4.ip_forward = 0
# Prévenir l'IP Spoofing
net.ipv4.conf.all.rp_filter = 1
net.ipv4.conf.default.rp_filter = 1
```
```bash
# 2. Appliquer les changements immédiatement
sudo sysctl --system

# 3. Vérifier une valeur précise
sudo sysctl net.ipv4.tcp_syncookies
```

### 🚑 2.4 Diagnostic & Réflexes Terrain
- **Symptôme** : Le ping ne répond plus après configuration.
- **Réflexe** : C'est normal si `icmp_echo_ignore_all` est à 1. Si cela gêne la supervision Zabbix/Nagios, passez à 0, mais limitez le taux (`net.ipv4.icmp_ratelimit`).

---

## 3) Détection de Rootkits (rkhunter, chkrootkit) (2h00)

### 📖 3.1 Narration & Intuition
Un rootkit, c'est l'homme invisible de l'informatique. Il s'infiltre et modifie les outils système fondamentaux (comme `ls` ou `ps`) pour cacher la présence de l'attaquant. Les détecteurs de rootkits scannent le système pour trouver ces anomalies, des fichiers cachés étranges, ou des binaires altérés par rapport à leur signature connue.

### 🔍 3.2 Anatomie Technique
- **rkhunter (Rootkit Hunter)** : Vérifie les signatures MD5 des binaires, recherche des répertoires suspects, vérifie les permissions des fichiers critiques. Il a besoin d'être mis à jour via une base de données locale (`--propupd`).
- **chkrootkit** : Un script bash qui parcourt le système avec une série d'heuristiques simples pour trouver les signatures spécifiques de rootkits connus.

### 🛠️ 3.3 Atelier Pratique Hands-on
```bash
# 1. Installation des outils
sudo apt-get update
sudo apt-get install -y rkhunter chkrootkit

# 2. Lancement d'un scan avec chkrootkit
sudo chkrootkit

# 3. Initialisation de la base de rkhunter (très important !)
sudo rkhunter --propupd

# 4. Lancement d'un scan complet rkhunter sans pause
sudo rkhunter -c --sk
```

### 🚑 3.4 Diagnostic & Réflexes Terrain
- **Symptôme** : Rkhunter signale un "Warning" sur un binaire système après une mise à jour (ex: `apt upgrade`).
- **Réflexe** : Les hash ont changé légitimement. Vérifiez que c'était bien une mise à jour officielle, puis relancez `sudo rkhunter --propupd` pour que Rkhunter apprenne les nouvelles signatures.

---

## 🔤 Nouvelles abréviations rencontrées
- **PAM** : Pluggable Authentication Modules (Modules d'authentification enfichables).
- **CIS** : Center for Internet Security (Référentiel de bonnes pratiques de sécurité).
- **SYN** : Synchronize (Type de paquet TCP initial).

---

## 🏧️ Exercices Pratiques (Preuves de Portfolio)

### Exercice 1 : Configuration d'un Bastion Renforcé
- **Consigne** : Configurez votre machine locale pour refuser l'authentification SSH par mot de passe, modifiez les paramètres du noyau pour bloquer les ping, et lancez un scan anti-rootkit.
- **Livrables à produire** : Captures d'écran de l'impossibilité de pinger la machine, et le résumé des résultats du scan `rkhunter`.
- **Corrigé détaillé & Guidé** :
  1. Éditez `/etc/ssh/sshd_config`, passez `PasswordAuthentication no`. Rechargez SSH (`sudo systemctl reload ssh`).
  2. Éditez `/etc/sysctl.conf`, ajoutez `net.ipv4.icmp_echo_ignore_all = 1`. Appliquez avec `sudo sysctl -p`.
  3. Mettez à jour rkhunter (`sudo rkhunter --update` et `--propupd`), puis lancez `sudo rkhunter -c --sk`.
  4. Priez un collègue (ou utilisez une autre VM) pour lancer un ping. Il y aura "Request Timeout".

---

## ❓ Banque de Questions QCM (Évaluation 75% minimum)

1. Que permet le framework PAM (Pluggable Authentication Modules) sous Linux ?
   - A) Configurer l'adressage IP des interfaces
   - B) Gérer la politique d'authentification et les accès des utilisateurs de manière modulaire
   - C) Analyser le noyau en temps réel
   - D) Déployer des applications conteneurisées
   - **Réponse : B**

2. Quel fichier doit-on modifier pour interdire l'accès "root" par SSH ?
   - A) `/etc/ssh/ssh_config`
   - B) `/etc/sudoers`
   - C) `/etc/ssh/sshd_config`
   - D) `/etc/pam.d/sshd`
   - **Réponse : C**

3. Quelle commande applique instantanément les paramètres du noyau définis dans `sysctl.conf` ?
   - A) `sysctl --system` (ou `sysctl -p`)
   - B) `systemctl daemon-reload`
   - C) `update-kernel`
   - D) `modprobe -a`
   - **Réponse : A**

4. À quoi sert la commande `rkhunter --propupd` ?
   - A) À télécharger la dernière version du logiciel
   - B) À mettre à jour la base des propriétés (hashs) des binaires légitimes du système
   - C) À corriger les vulnérabilités trouvées
   - D) À configurer le pare-feu
   - **Réponse : B**

5. Si le paramètre `net.ipv4.tcp_syncookies` est défini à 1, de quoi protège-t-il le système ?
   - A) Des attaques par force brute SSH
   - B) De l'interception de mots de passe
   - C) Des attaques par déni de service de type SYN Flood
   - D) Des rootkits
   - **Réponse : C**

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
