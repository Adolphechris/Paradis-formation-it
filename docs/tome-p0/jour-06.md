# SEMESTRE 1 — Jour 06 (6h) : Administration des Paquets & Services systemd

> [!NOTE]
> **Objectif de la journée** : Savoir installer des logiciels sur Linux de manière propre et gérer les services d'arrière-plan (démarrage, arrêt, logs) via le standard industriel `systemd`.
> **Compétences visées** : `BIT-02` (A), `POL-01` (A) — Administration paquets et services systemd.

---

## 1) Gestion des Paquets (Debian/Ubuntu) (1h30)

### 📖 1.1 Narration & Intuition
Sous Windows, on cherche un `.exe` sur internet, on clique sur Suivant, Suivant, Terminer. Sous Linux, c'est l'App Store depuis 30 ans ! Un **gestionnaire de paquets** va chercher les logiciels sur des serveurs officiels sécurisés (les **dépôts** ou repositories), télécharge le paquet, gère ses dépendances (si le logiciel A a besoin du logiciel B), et l'installe. 

### 🔍 1.2 Anatomie Technique
- **`dpkg`** : L'outil de bas niveau. Installe des fichiers `.deb` locaux. Ne résout pas les dépendances.
- **`apt` (Advanced Package Tool)** : L'outil de haut niveau. Cherche sur internet et gère les dépendances.
- **`/etc/apt/sources.list`** : Le fichier texte qui contient les URL des dépôts officiels.
- Commandes principales :
  - `apt update` : Met à jour le catalogue local (liste des logiciels disponibles). *À faire avant toute chose*.
  - `apt upgrade` : Met à jour tous les logiciels installés.
  - `apt install <paquet>` : Installe un logiciel.
  - `apt remove <paquet>` : Désinstalle (conserve les fichiers de configuration).
  - `apt search <mot>` : Cherche un logiciel.

### 🛠️ 1.3 Atelier Pratique Hands-on
```bash
# Mettre à jour le catalogue (nécessite les droits root/sudo)
sudo apt update

# Chercher un serveur web
apt search nginx

# Installer le serveur web nginx
sudo apt install nginx -y

# Vérifier que le paquet est bien installé
dpkg -l | grep nginx
```

### 🚑 1.4 Diagnostic & Réflexes Terrain
- **Symptôme** : `E: Could not get lock /var/lib/dpkg/lock...`
- **Réflexe** : Une autre mise à jour est en cours en arrière-plan (souvent automatique au démarrage). Attendez quelques minutes. Ne supprimez pas le fichier de lock brutalement sous peine de corrompre le système de paquets.

---

## 2) L'Architecture systemd et systemctl (2h00)

### 📖 2.1 Narration & Intuition
Un serveur web ou une base de données doit démarrer tout seul quand la machine s'allume, et tourner en arrière-plan sans qu'un utilisateur n'ait besoin d'être connecté. Ces programmes s'appellent des **démons** (daemons). `systemd` est le grand chef d'orchestre de Linux moderne : il gère le démarrage de l'OS et maintient ces services en vie. L'outil pour lui parler s'appelle `systemctl`.

### 🔍 2.2 Anatomie Technique
- **`systemctl`** : L'outil de pilotage des services.
  - `status <service>` : Affiche l'état (actif, inactif, en erreur) et les dernières lignes de logs.
  - `start <service>` : Démarre manuellement le service.
  - `stop <service>` : Arrête le service.
  - `restart <service>` : Redémarre (stop puis start, utile si on a modifié la configuration).
  - `reload <service>` : Recharge la configuration sans couper le service (zéro interruption).
  - `enable <service>` : Active le démarrage automatique du service au boot de la machine.
  - `disable <service>` : Désactive le démarrage automatique.

### 🛠️ 2.3 Atelier Pratique Hands-on
```bash
# Vérifier l'état de notre serveur web fraîchement installé
sudo systemctl status nginx

# Le serveur est normalement "active (running)". Faisons-lui relire sa configuration :
sudo systemctl reload nginx

# S'assurer qu'il démarre au prochain redémarrage du serveur
sudo systemctl enable nginx
```

### 🚑 2.4 Diagnostic & Réflexes Terrain
- **Panne** : Un service est en état `failed`.
- **Réflexe** : Ne spammez pas `start`. Lisez la sortie de `systemctl status` qui affichera la ligne rouge de l'erreur (souvent une erreur de frappe dans le fichier de configuration du service).

---

## 3) Analyse Centralisée des Logs avec journalctl (1h30)

### 📖 3.1 Narration & Intuition
Avant systemd, chaque logiciel écrivait son petit fichier texte de log dans un coin de `/var/log`. Avec systemd vient le **Journal**, une base de données binaire ultra-rapide qui centralise absolument tous les logs du système. Pour l'interroger, on utilise `journalctl`. 

### 🔍 3.2 Anatomie Technique
- **`journalctl`** : Lit le journal systemd.
  - `-u <service>` : Filtre les logs pour une unité (service) spécifique.
  - `-f` : (Follow) Affiche les logs en temps réel, équivalent à `tail -f`.
  - `-e` : (End) Saute directement à la fin du journal (les événements les plus récents).
  - `--since "1 hour ago"` : Affiche les logs depuis 1 heure.

### 🛠️ 3.3 Atelier Pratique Hands-on
```bash
# Voir les logs d'erreurs récents du système
sudo journalctl -e -p err

# Voir uniquement les logs du service nginx en temps réel
sudo journalctl -u nginx -f
# (Appuyez sur Ctrl+C pour quitter)

# Voir ce qui s'est passé aujourd'hui
sudo journalctl --since today
```

### 🚑 3.4 Diagnostic & Réflexes Terrain
- **Symptôme** : Le disque dur est plein, `/var/log/journal` prend des Gigaoctets.
- **Réflexe** : Le journal a gardé l'historique depuis des mois. Nettoyez-le en limitant sa taille : `sudo journalctl --vacuum-size=100M`.

---

## 🏧️ Exercices Pratiques (Preuves de Portfolio)

### Exercice 1 : Déploiement Complet
- **Consigne** : Mettez à jour vos dépôts, installez le paquet `htop`, vérifiez son statut avec `dpkg`. Ensuite, utilisez `systemctl` pour lister tous les services échoués sur la machine.
- **Livrables à produire** : Commandes et captures du statut des services échoués.
- **Corrigé détaillé & Guidé** :
```bash
# 1. Mise à jour et installation
sudo apt update
sudo apt install htop -y

# 2. Vérification
dpkg -l | grep htop

# 3. Lister les services en échec
systemctl --failed
```

---

## ❓ Banque de Questions QCM (Évaluation 75% minimum)

1. QCM: Quelle commande télécharge la nouvelle liste des logiciels disponibles depuis les dépôts ?
   A) apt upgrade
   B) apt install
   C) apt update
   D) apt list
   **Réponse : C**

2. QCM: Comment configurer un service (ex: ssh) pour qu'il démarre automatiquement au lancement de la machine ?
   A) systemctl start ssh
   B) systemctl enable ssh
   C) systemctl boot ssh
   D) systemctl auto ssh
   **Réponse : B**

3. QCM: Quelle commande utiliser si vous modifiez la configuration d'un service web et voulez appliquer les changements sans déconnecter les utilisateurs actuels ?
   A) systemctl restart
   B) systemctl kill
   C) systemctl reload
   D) systemctl stop
   **Réponse : C**

4. QCM: Quelle commande permet de suivre en temps réel les logs d'un service spécifique ?
   A) journalctl -u nginx -f
   B) systemctl logs nginx -f
   C) cat /var/log/nginx -f
   D) grep nginx /var/log/syslog
   **Réponse : A**

5. QCM: Quelle est la différence entre `apt` et `dpkg` ?
   A) dpkg télécharge sur internet, apt installe des paquets locaux.
   B) apt gère les dépendances et les dépôts distants, dpkg agit localement sur des .deb.
   C) apt est obsolète, dpkg est le nouvel outil.
   D) Il n'y a aucune différence.
   **Réponse : B**
