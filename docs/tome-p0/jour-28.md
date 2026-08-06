# SEMESTRE 1 — Jour 28 (6h) : Centralisation des Logs & Logrotate

> [!NOTE]
> **Objectif de la journée** : Mettre en œuvre une architecture de journalisation robuste, collecter les logs locaux et distants via Rsyslog, analyser les événements avec journalctl, et configurer la rotation pour éviter la saturation des disques.
> **Compétences visées** : `BIT-02` (Niveau Cible: A) — Administration Système Avancée, `SEC-04` (Niveau Cible: A) — Gestion et rotation de logs.

---

## 1) Architecture Rsyslog et Journalisation (1h30)

### 📖 1.1 Narration & Intuition
Un serveur qui travaille génère des événements, un peu comme le journal de bord d'un navire. S'il n'y a pas de journal, en cas de tempête (piratage, panne, bug), vous n'aurez aucun historique pour comprendre ce qui s'est passé. Historiquement, Linux utilise le protocole `syslog`. Aujourd'hui, `Rsyslog` (Rocket-fast Syslog) gère le flux massif de messages. Il écoute, filtre, et écrit ces messages dans divers fichiers sous `/var/log/` (comme `syslog`, `auth.log`, `messages`).

### 🔍 1.2 Anatomie Technique
Rsyslog est configuré via `/etc/rsyslog.conf` et les fichiers inclus dans `/etc/rsyslog.d/`.
Un message de log possède :
- Une **Facility** : La source du message (ex: `auth`, `cron`, `daemon`, `kern`, `local0` à `local7`).
- Une **Severity** : La gravité (ex: `debug`, `info`, `notice`, `warning`, `err`, `crit`, `alert`, `emerg`).

La syntaxe classique d'une règle de routage : `facility.severity /chemin/vers/fichier.log`
Exemple : `auth.* /var/log/auth.log` (Tout ce qui concerne l'authentification va dans auth.log).

### 🛠️ 1.3 Atelier Pratique Hands-on
Créons une règle de log personnalisée pour rediriger tous les messages de gravité "critique" (indépendamment du service) vers un fichier spécifique.

```bash
# Créer un nouveau fichier de configuration dans rsyslog.d
sudo nano /etc/rsyslog.d/99-criticals.conf

# Ajouter la ligne suivante :
# *.crit    /var/log/alertes-critiques.log

# Redémarrer Rsyslog
sudo systemctl restart rsyslog

# Tester la configuration en générant un faux log critique via la commande 'logger'
logger -p daemon.crit "Ceci est un test critique !"

# Vérifier que le fichier a bien été créé et contient notre message
cat /var/log/alertes-critiques.log
```

### 🚑 1.4 Diagnostic & Réflexes Terrain
- **Symptôme** : Le fichier `/var/log/syslog` devient massivement volumineux en quelques minutes, rendant le serveur lent.
- **Diagnostic** : Une application (souvent un script mal codé ou un service en erreur) "spamme" les logs dans une boucle infinie.
- **Réflexe** : Utiliser `tail -f /var/log/syslog` ou `watch tail /var/log/syslog` pour identifier le processus fautif. Arrêter le processus ou réduire sa verbosité.

---

## 2) Centralisation de Logs (1h30)

### 📖 2.1 Narration & Intuition
Imaginez gérer 50 serveurs. En cas d'incident, allez-vous vous connecter en SSH sur chacun d'eux pour lire `/var/log/syslog` ? C'est inefficace et dangereux (si le serveur est piraté, l'attaquant efface les logs locaux). La solution est de désigner un serveur "Puits de Logs" (Log Server) vers lequel tous les autres serveurs (Clients) envoient une copie de leurs messages, en temps réel.

### 🔍 2.2 Anatomie Technique
- **Sur le serveur Rsyslog Central** : Il faut décommenter les modules de réception UDP (`imudp`) ou TCP (`imtcp`) dans `/etc/rsyslog.conf` pour écouter sur le port 514.
- **Sur les serveurs Clients** : On indique que tous les logs (`*.*`) doivent être envoyés à l'adresse IP du serveur central, par exemple `*.* @IP_SERVEUR` (pour UDP) ou `*.* @@IP_SERVEUR` (pour TCP).

### 🛠️ 1.3 Atelier Pratique Hands-on
*(Simulé sur la même machine pour l'atelier)* Activons la réception TCP locale et envoyons un message.

```bash
# Éditer le fichier principal rsyslog
sudo nano /etc/rsyslog.conf

# Décommenter les lignes suivantes :
# module(load="imtcp")
# input(type="imtcp" port="514")

# Redémarrer
sudo systemctl restart rsyslog

# Vérifier que le serveur écoute bien sur TCP 514
sudo ss -tlnp | grep 514
```

### 🚑 1.4 Diagnostic & Réflexes Terrain
- **Symptôme** : Le serveur central ne reçoit aucun log des clients.
- **Diagnostic** : Le pare-feu bloque le port 514, ou Rsyslog n'écoute pas sur l'interface réseau correcte.
- **Réflexe** : Vérifier l'ouverture du pare-feu (`sudo ufw status` ou `iptables`), et lancer un `tcpdump -i eth0 port 514` pour voir si les paquets réseau arrivent réellement.

---

## 3) Rotation des Logs et Systemd Journal (2h00)

### 📖 3.1 Narration & Intuition
Si un serveur enregistre 50 Mo de logs par jour, au bout d'un an, votre disque dur sera plein et le serveur plantera. `logrotate` est le jardinier du système : chaque jour/semaine, il taille les fichiers de logs, les compresse, archive les anciens et supprime ceux qui sont trop vieux. 
Par ailleurs, les systèmes modernes utilisent `systemd-journald`, un gestionnaire de log binaire intégré, interrogeable très finement avec `journalctl`.

### 🔍 3.2 Anatomie Technique
**Logrotate** est invoqué via un script `cron`. Sa configuration est dans `/etc/logrotate.conf` et `/etc/logrotate.d/`.
Directives clés : `daily/weekly`, `rotate 7` (garder 7 archives), `compress`, `missingok` (ignorer si le fichier n'existe pas), `postrotate` (script à exécuter après la rotation, ex: recharger un service).

**Journalctl** : 
- `journalctl -u sshd` (logs d'un service spécifique)
- `journalctl -p err` (logs en erreur)
- `journalctl --since "1 hour ago"` (filtrage temporel)

### 🛠️ 1.3 Atelier Pratique Hands-on
Créons une règle de rotation pour notre fichier personnalisé `/var/log/alertes-critiques.log`.

```bash
# Créer le fichier de configuration de rotation
sudo nano /etc/logrotate.d/alertes-critiques

# Ajouter :
/var/log/alertes-critiques.log {
    daily
    rotate 14
    compress
    missingok
    notifempty
    create 0640 root adm
}

# Tester logrotate manuellement en forçant l'exécution (mode debug)
sudo logrotate -d /etc/logrotate.d/alertes-critiques
```

### 🚑 1.4 Diagnostic & Réflexes Terrain
- **Symptôme** : Un service (ex: Nginx) continue d'écrire dans un fichier log qui a été renommé par logrotate (ex: `access.log.1`), et le nouveau `access.log` reste vide.
- **Diagnostic** : Le service garde le "descripteur de fichier" ouvert sur l'ancien inode.
- **Réflexe** : Toujours utiliser des blocs `postrotate` dans logrotate pour envoyer un signal de rechargement au service (ex: `systemctl reload nginx`), forçant la réouverture du nouveau fichier log.

---

## 🏧️ Exercices Pratiques (Preuves de Portfolio)

### Exercice 1 : Audit et Filtrage Journalctl
- **Consigne** : À l'aide de `journalctl`, identifiez toutes les tentatives de connexion SSH échouées ou les erreurs système survenues durant la dernière heure, et exportez ce résultat dans un fichier texte.
- **Livrables à produire** : La commande exécutée et le fichier texte généré.
- **Corrigé détaillé & Guidé** :
```bash
# Récupérer les erreurs (priority 3 = err) depuis 1 heure
journalctl -p err --since "1 hour ago" > ~/rapport_erreurs_1h.txt

# Filtrer spécifiquement pour le service SSH
journalctl -u sshd --since "1 hour ago" > ~/rapport_sshd.txt
```

---

## ❓ Banque de Questions QCM (Évaluation 75% minimum)
1. **Que permet de faire Rsyslog ?**
   A) Faire tourner les fichiers de logs pour gagner de la place
   B) Router, filtrer et centraliser les messages de journalisation
   C) Diagnostiquer les pannes matérielles du CPU
   D) Bloquer les attaques réseau
   **Réponse : B**

2. **Dans le contexte Rsyslog, que représente la `Facility` ?**
   A) Le niveau d'urgence du message
   B) La source ou le composant générant le message (ex: kern, auth, mail)
   C) L'adresse IP du serveur de logs
   D) L'identifiant du processus
   **Réponse : B**

3. **Quelle commande affiche les logs en direct (streaming) via le démon journald ?**
   A) `logrotate -f`
   B) `journalctl -f`
   C) `systemctl log`
   D) `rsyslog follow`
   **Réponse : B**

4. **Dans une configuration logrotate, que fait l'option `compress` ?**
   A) Compresse le code source de l'application
   B) Compresse la mémoire RAM
   C) Compresse les anciens fichiers journaux rotatés (généralement en .gz)
   D) Réduit la taille des polices d'affichage
   **Réponse : C**

5. **Pourquoi utilise-t-on le mot-clé `@@` dans Rsyslog (`*.* @@192.168.1.10`) ?**
   A) Pour envoyer les logs en UDP
   B) Pour chiffrer les logs avec AES
   C) Pour envoyer les logs via TCP
   D) C'est une erreur de syntaxe
   **Réponse : C**
