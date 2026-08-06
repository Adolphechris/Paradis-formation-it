# SEMESTRE 1 — Jour 48 (6h) : Analyse Forensique Basique & Réponse à Incident

> [!NOTE]
> **Objectif de la journée** : Comprendre et appliquer les bases de l'investigation numérique, collecter les preuves correctement, analyser un incident et contenir une compromission.
> **Compétences visées** : `SEC-05` (Niveau Cible: A) — Gérer un incident de sécurité, de l'investigation à la remédiation.

---

## 1) Collecte de Preuves et Ordre de Volatilité (1h30)

### 📖 1.1 Narration & Intuition
Votre serveur a été piraté. L'instinct du débutant : éteindre la machine pour "arrêter les dégâts" ou redémarrer. C'est la **pire** chose à faire ! Éteindre détruit la mémoire vive (RAM), où se cache souvent le malware sans fichier (fileless malware) ou les connexions actives du pirate. L'analyse forensique consiste à figer la scène de crime et recueillir les preuves dans un ordre précis : du plus volatile (ce qui disparaît en un clin d'œil, comme la RAM) au moins volatile (le disque dur).

### 🔍 1.2 Anatomie Technique
- **Ordre de Volatilité (RFC 3227)** :
  1. Registres, cache, mémoire RAM.
  2. État du réseau (connexions actives).
  3. Processus en cours d'exécution.
  4. Disque dur (systèmes de fichiers).
  5. Journaux système distants et sauvegardes.
- Outils Linux natifs pour un premier survol : `netstat` / `ss` (réseau), `ps` (processus), `lsof` (fichiers ouverts).

### 🛠️ 1.3 Atelier Pratique Hands-on
```bash
# 1. Enregistrer la configuration réseau active vers un fichier
sudo ss -antp > /tmp/evidence_network.txt

# 2. Capturer les processus actifs (arbre)
ps f -eo pid,ppid,user,args > /tmp/evidence_processes.txt

# 3. Voir quels fichiers sont ouverts par les processus réseau
sudo lsof -i > /tmp/evidence_lsof.txt

# 4. Toujours calculer un hash de l'évidence pour garantir qu'elle n'a pas été altérée
sha256sum /tmp/evidence_*.txt > /tmp/evidence_hashes.sha256
```

### 🚑 1.4 Diagnostic & Réflexes Terrain
- **Symptôme** : Un exécutable inconnu tourne dans la mémoire, mais son fichier source a été supprimé.
- **Réflexe** : Linux garde un lien symbolique vers l'exécutable supprimé en RAM. S'il a le PID 1234, vous pouvez récupérer son binaire en le copiant : `cp /proc/1234/exe /tmp/recovered_malware.bin`.

---

## 2) Timeline d'Incident et Analyse des Logs (1h30)

### 📖 2.1 Narration & Intuition
L'attaquant a laissé des traces. Pour comprendre ce qu'il a fait, nous devons reconstruire la "Timeline" (chronologie) : comment est-il entré ? Quand ? Qu'a-t-il modifié ? C'est le travail de détective où chaque ligne de log d'authentification ou du serveur web devient une pièce du puzzle.

### 🔍 2.2 Anatomie Technique
- **`/var/log/auth.log`** (Debian) ou `/var/log/secure` (RHEL) : Essentiel pour voir les logins SSH réussis et échoués, ou l'utilisation de `sudo`.
- **`last` / `lastb`** : Affiche l'historique des connexions (qui s'est connecté et qui a échoué).
- **`.bash_history`** : Si l'attaquant n'a pas été assez malin, l'historique des commandes tapées est conservé ici (dans le répertoire du compte compromis).

### 🛠️ 2.3 Atelier Pratique Hands-on
```bash
# 1. Trouver les connexions SSH réussies aujourd'hui
grep "Accepted" /var/log/auth.log

# 2. Chercher qui a acquis les droits root
grep "sudo" /var/log/auth.log | grep "COMMAND="

# 3. Récupérer les fichiers modifiés dans les 2 derniers jours
find /etc -type f -mtime -2 -exec ls -la {} \;
```

### 🚑 2.4 Diagnostic & Réflexes Terrain
- **Symptôme** : Tous les logs du jour ont été effacés (le fichier `/var/log/auth.log` est vide).
- **Réflexe** : L'attaquant a nettoyé ses traces. Regardez dans `journalctl` (qui peut avoir gardé des données en binaire intouchées par un simple `rm` ou `echo "" >`) et vérifiez si vous avez configuré des logs centralisés (rsyslog vers une autre machine non compromise).

---

## 3) Confinement et Remédiation (2h00)

### 📖 3.1 Narration & Intuition
L'hémorragie est en cours. Avant de nettoyer (Remédiation), vous devez isoler la machine (Confinement). On ne débranche pas physiquement le serveur (rappel : on garde la RAM), mais on coupe le réseau logiciellement pour arrêter la fuite de données (Data Exfiltration) ou l'appel au serveur de commande (C2 - Command & Control).

### 🔍 3.2 Anatomie Technique
- **Confinement** : Isoler la machine du reste du réseau via le pare-feu (iptables/ufw), en gardant uniquement l'accès SSH pour l'administrateur depuis l'IP de secours.
- **Remédiation** : Tuer les processus malveillants, bloquer les IP suspectes, supprimer les comptes backdoor, changer tous les mots de passe.

### 🛠️ 3.3 Atelier Pratique Hands-on
```bash
# 1. Confinement : Isoler complètement la machine (Attention : ne faites ça qu'avec un accès physique ou console !)
# (Si vous tapez ça en SSH normal, vous serez éjecté).
# iptables -P INPUT DROP ; iptables -P OUTPUT DROP

# 2. Remédiation : Tuer un processus malveillant (exemple PID 9999)
# kill -9 9999

# 3. Remédiation : Verrouiller un compte suspect (ex: "hacker")
# sudo usermod -L hacker
# sudo pkill -u hacker

# 4. Créer un dump complet du système de fichiers (nécessite disque externe en prod)
# sudo dd if=/dev/sda1 of=/mnt/usb/sda1_evidence.img bs=4M status=progress
```

### 🚑 3.4 Diagnostic & Réflexes Terrain
- **Symptôme** : Le processus malveillant redémarre instantanément après un `kill -9`.
- **Réflexe** : Il a une persistance. Il y a probablement un service Systemd, une tâche cron (`crontab -l`), ou un malware avec processus "parents/enfants" qui se ressuscitent mutuellement. Vérifiez `/etc/cron.*` et `/etc/systemd/system/`.

---

## 🔤 Nouvelles abréviations rencontrées
- **RFC** : Request For Comments (Documents décrivant les standards Internet, ex: RFC 3227 pour la forensique).
- **C2 (C&C)** : Command & Control (Serveur utilisé par les pirates pour piloter les machines compromises).
- **PID** : Process ID (Identifiant unique de processus).

---

## 🏧️ Exercices Pratiques (Preuves de Portfolio)

### Exercice 1 : Simulation de confinement réseau
- **Consigne** : Avec `ufw`, activez le pare-feu, bloquez tout le trafic entrant et sortant, mais autorisez le SSH UNIQUEMENT depuis l'IP locale de votre machine (ex: 192.168.1.50).
- **Livrables à produire** : La commande exacte tapée et le résultat de `ufw status verbose`.
- **Corrigé détaillé & Guidé** :
  1. `sudo ufw default deny incoming`
  2. `sudo ufw default deny outgoing`
  3. `sudo ufw allow in from 192.168.1.50 to any port 22`
  4. `sudo ufw enable`
  5. `sudo ufw status verbose` (Vérifiez les règles et ne vous bloquez pas !).

---

## ❓ Banque de Questions QCM (Évaluation 75% minimum)

1. Selon l'ordre de volatilité (RFC 3227), quel élément doit être acquis en tout premier lors d'une investigation sur un serveur allumé ?
   - A) Le disque dur
   - B) La mémoire RAM (registres et cache)
   - C) Les journaux distants
   - D) Les logs web locaux
   - **Réponse : B**

2. Quelle est la pire erreur à commettre lors de la découverte d'un serveur compromis ?
   - A) Regarder les connexions actives
   - B) Éteindre immédiatement ou redémarrer la machine
   - C) Effectuer un hash des fichiers de logs
   - D) Bloquer le port du serveur web
   - **Réponse : B**

3. Où trouve-t-on généralement les journaux d'authentification sur un système Debian/Ubuntu ?
   - A) `/var/log/auth.log`
   - B) `/var/log/dmesg`
   - C) `/var/log/apache2/error.log`
   - D) `/etc/auth.conf`
   - **Réponse : A**

4. À quoi sert de calculer l'empreinte (hash SHA256) d'un fichier de log copié en tant que preuve ?
   - A) À réduire la taille du fichier
   - B) À chiffrer son contenu pour les pirates
   - C) À prouver son intégrité, garantissant que la preuve n'a pas été modifiée post-acquisition
   - D) À accélérer la lecture du fichier
   - **Réponse : C**

5. Lors de la phase de confinement, quel est l'objectif premier ?
   - A) Formater le serveur
   - B) Installer un nouvel antivirus
   - C) Empêcher l'attaquant d'exfiltrer plus de données ou de compromettre le reste du réseau
   - D) Décrypter le mot de passe de l'attaquant
   - **Réponse : C**

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
