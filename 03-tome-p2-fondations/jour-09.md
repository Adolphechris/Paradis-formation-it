# TOME P2 — Jour 09 (12h) : Linux Avancé — Administration Système, Logs & Services

> [!NOTE]
> **Objectif de la journée** : Maîtriser l'administration avancée d'un système Linux : gérer les utilisateurs et groupes, lire et analyser les logs système, administrer les services avec systemd, et planifier des tâches automatiques. Ces compétences sont au cœur du métier d'administrateur système IT.

---

## 1) Gestion Avancée des Utilisateurs et Groupes (3h)

### 📖 1.1 La Logique des Droits Linux : Groupes et Permissions

Dans un environnement bancaire, un agent de la Direction Informatique n'a pas les mêmes droits qu'un agent de la Comptabilité. Linux permet de modéliser précisément ces hiérarchies avec les **groupes d'utilisateurs**.

### 🛠️ 1.2 Commandes de Gestion

```bash
# Créer un groupe pour le département IT
sudo groupadd departement-it

# Créer un utilisateur et l'assigner directement à ce groupe
sudo useradd -m -G departement-it,sudo -s /bin/bash jean.mukendi

# Définir le mot de passe
sudo passwd jean.mukendi

# Modifier un utilisateur existant (ajouter un groupe)
sudo usermod -aG departement-it marie.bongo

# Vérifier les groupes d'un utilisateur
groups marie.bongo

# Afficher les détails d'un utilisateur
id jean.mukendi
cat /etc/passwd | grep jean.mukendi
```

### 🔍 1.3 Le Fichier Sudoers : Déléguer des Permissions Admin

```bash
# Ouvrir l'éditeur sécurisé de sudoers (JAMAIS éditer /etc/sudoers directement)
sudo visudo

# Accorder à un groupe l'accès sudo sans mot de passe (dangereux — à éviter en prod)
# %departement-it ALL=(ALL) NOPASSWD: ALL

# Accorder des commandes spécifiques seulement (bonne pratique)
# jean.mukendi ALL=(ALL) NOPASSWD: /usr/bin/systemctl restart nginx, /usr/bin/apt update
```

---

## 2) Analyse des Logs Système (3h)

### 📖 2.1 Les Logs : Le Journal de Bord du Serveur

Un serveur Linux enregistre en permanence toutes ses activités dans des fichiers **logs**. En cas de panne ou d'incident de sécurité, les logs sont votre première source d'investigation.

| Fichier Log | Contenu |
|-------------|---------|
| `/var/log/syslog` | Journal général du système |
| `/var/log/auth.log` | Connexions, authentifications SSH, sudo |
| `/var/log/kern.log` | Messages du noyau Linux |
| `/var/log/nginx/access.log` | Requêtes HTTP reçues par le serveur web |
| `/var/log/nginx/error.log` | Erreurs du serveur web |

### 🛠️ 2.2 Lire et Analyser les Logs

```bash
# Lire en temps réel (live monitoring)
sudo tail -f /var/log/auth.log

# Afficher les 50 dernières lignes
sudo tail -50 /var/log/syslog

# Chercher les tentatives de connexion SSH échouées
sudo grep "Failed password" /var/log/auth.log | tail -20

# Compter le nombre d'échecs par IP (détection brute force)
sudo grep "Failed password" /var/log/auth.log | awk '{print $(NF-3)}' | sort | uniq -c | sort -rn | head -10

# Utiliser journalctl (système systemd)
sudo journalctl -u nginx --since "1 hour ago"
sudo journalctl -p err -n 50   # 50 dernières erreurs
```

---

## 3) Gestion des Services avec systemd (3h)

### 📖 3.1 Systemd : Le Chef d'Orchestre des Services

**systemd** est le système d'initialisation et de gestion des services sous les distributions Linux modernes (Ubuntu, Debian, CentOS). Il démarre, arrête, surveille et redémarre automatiquement les services système.

### 🛠️ 3.2 Commandes systemctl Essentielles

```bash
# État d'un service
sudo systemctl status nginx

# Démarrer, arrêter, redémarrer
sudo systemctl start nginx
sudo systemctl stop nginx
sudo systemctl restart nginx
sudo systemctl reload nginx   # Recharge la config sans interruption

# Activer/désactiver le démarrage automatique au boot
sudo systemctl enable nginx
sudo systemctl disable nginx

# Lister tous les services actifs
systemctl list-units --type=service --state=active

# Créer un service personnalisé
sudo nano /etc/systemd/system/monitoring-bcc.service
```

```ini
# /etc/systemd/system/monitoring-bcc.service
[Unit]
Description=Monitoring BCC — Surveillance Continue
After=network.target

[Service]
Type=simple
User=monitoring
ExecStart=/usr/local/bin/monitoring-bcc.sh
Restart=always
RestartSec=30

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl daemon-reload
sudo systemctl enable monitoring-bcc
sudo systemctl start monitoring-bcc
```

---

## 🏋️ Exercices Pratiques & Corrigés

### Exercice : Détecter une Intrusion
Écrivez une commande qui extrait les 10 adresses IP ayant eu le plus d'échecs de connexion SSH dans les dernières 24 heures.
- **Corrigé** :
  ```bash
  sudo journalctl -u ssh --since "24 hours ago" | grep "Failed password" | awk '{print $(NF-3)}' | sort | uniq -c | sort -rn | head -10
  ```

---

## ❓ Banque de Questions & Test du Jour 09

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*