# Jour J0R — Diagnostic & Réflexes Terrain : la Méthode S1

> [!NOTE]
> **JOUR DE TRANSITION VERS LE SEMESTRE 1 — S0→S1 (J0p–J0v)**  
> Cette leçon vous apprend la méthode de dépannage systématique utilisée dans toutes les journées S1. Aucun prérequis technique n'est nécessaire.

---

## 🎯 Objectifs de la Leçon
- 🚑 Comprendre la philosophie du "Diagnostic & Réflexes Terrain".
- 🔍 Apprendre la méthode d'investigation par élimination.
- 📜 Savoir lire et interpréter un message d'erreur.
- 💪 Cultiver la ténacité du débogueur.
- 🛠️ Résoudre 3 diagnostics réels.

---

## 📖 1. La philosophie du Diagnostic & Réflexes Terrain

Dans le Semestre 0, on vous a donné des commandes qui marchent. Dans le Semestre 1, on vous donne des commandes qui **cassent**. Pourquoi ?

Parce que dans la vraie vie (serveurs en production, entreprises nord-américaines, Canada/USA), **les choses cassent tout le temps**. Un fichier de configuration a une faute de frappe. Un service ne démarre pas. Un utilisateur a saisi un mauvais mot de passe.

Votre valeur n'est pas de savoir exécuter une commande qui marche. Votre valeur est de savoir **diagnostiquer et réparer** celle qui ne marche pas.

### Les 4 Règles d'Or du Débogueur

| Règle | Principe | Application |
|---|---|---|
| **1. Ne Jamais Paniquer** | Un message d'erreur est un diagnostic, pas une punition | Respirez, lisez le message en entier |
| **2. Lire le Message** | 90% de la solution est écrite noir sur blanc | La dernière ligne du message d'erreur est la plus importante |
| **3. Isoler le Problème** | Ne modifiez qu'un seul paramètre à la fois | Changez une chose, testez, observez |
| **4. Consulter la Documentation** | Les docs officielles sont vos meilleures amies | `man <commande>`, `--help`, StackOverflow, Tuteur IA |

---

## 📖 2. La méthode d'investigation par élimination

Face à un problème, appliquez toujours cette séquence :

```
1. QUOI ?   → Quel est le symptôme exact ?
2. OÙ ?     → Où se produit l'erreur (fichier, service, machine) ?
3. QUAND ?  → Depuis quand ça ne marche pas ? Qu'est-ce qui a changé ?
4. POURQUOI ? → Quelle est la cause racine ?
5. COMMENT ? → Quelle est la solution ?
```

### Exemple concret

**Symptôme** : "Je ne peux pas me connecter en SSH sur le serveur."

1. **QUOI ?** → `Connection refused` ou `Permission denied` ?
2. **OÙ ?** → Sur le serveur cible ou sur mon poste ?
3. **QUAND ?** → Ça marchait hier. Qu'est-ce qui a changé ?
4. **POURQUOI ?** → Le service SSH est arrêté ? Le firewall bloque ? La clé SSH a changé ?
5. **COMMENT ?** → Redémarrer SSH, vérifier UFW, vérifier les clés.

---

## 📖 3. Les messages d'erreur les plus courants

### 3.1 "Command not found"
- **Cause** : La commande n'est pas installée ou pas dans le PATH.
- **Solution** : Vérifier l'orthographe, installer le paquet (`apt install <paquet>`), vérifier le PATH.

### 3.2 "Permission denied"
- **Cause** : Vous n'avez pas les droits suffisants.
- **Solution** : Utiliser `sudo` si vous êtes administrateur, ou vérifier les permissions (`ls -la`).

### 3.3 "No such file or directory"
- **Cause** : Le fichier ou dossier n'existe pas, ou le chemin est incorrect.
- **Solution** : Vérifier le chemin avec `ls`, utiliser des chemins absolus.

### 3.4 "Disk full"
- **Cause** : L'espace disque est épuisé.
- **Solution** : Vérifier avec `df -h`, nettoyer les fichiers temporaires (`/tmp`), les logs (`/var/log`).

### 3.5 "Connection timed out"
- **Cause** : Le serveur distant ne répond pas (firewall, service arrêté, réseau coupé).
- **Solution** : Vérifier la connectivité (`ping`), le firewall (`ufw status`), le service (`systemctl status <service>`).

---

## 🧪 Atelier Pratique : 3 diagnostics réels

### Diagnostic 1 : "Command not found"

**Scénario** : Vous tapez `nginx` et vous obtenez `command not found`.

**Questions à se poser** :
1. Est-ce que `nginx` est installé ?
2. Si oui, est-ce dans le PATH ?
3. Si non, comment l'installer ?

**Solution** :
```bash
# Vérifier si nginx est installé
which nginx
# ou
dpkg -l | grep nginx

# Installer nginx
sudo apt update
sudo apt install nginx

# Vérifier que le service démarre
sudo systemctl start nginx
sudo systemctl status nginx
```

### Diagnostic 2 : "Permission denied" sur un fichier

**Scénario** : Vous voulez modifier `/etc/hosts` mais vous obtenez `Permission denied`.

**Questions à se poser** :
1. Quelles sont les permissions actuelles du fichier ?
2. Quel est votre utilisateur actuel ?
3. Avez-vous les droits sudo ?

**Solution** :
```bash
# Vérifier les permissions
ls -la /etc/hosts

# Vérifier votre utilisateur
whoami

# Éditer avec sudo
sudo nano /etc/hosts
```

### Diagnostic 3 : "Connection refused" sur le port 22 (SSH)

**Scénario** : `ssh user@serveur` retourne `Connection refused`.

**Questions à se poser** :
1. Le serveur est-il allumé et accessible ?
2. Le service SSH est-il démarré ?
3. Le firewall autorise-t-il le port 22 ?

**Solution** :
```bash
# Tester la connectivité
ping serveur

# Vérifier si le port 22 est ouvert
nc -zv serveur 22
# ou
nmap -p 22 serveur

# Si c'est le serveur distant : vérifier le service SSH
sudo systemctl status sshd

# Si c'est le firewall : vérifier UFW
sudo ufw status
```

---

## 📖 4. Les outils du débogueur

| Outil | Usage | Exemple |
|---|---|---|
| `man <commande>` | Manuel officiel | `man ls` |
| `--help` | Aide rapide | `ls --help` |
| `which <commande>` | Localiser un binaire | `which python3` |
| `echo $?` | Code de retour de la dernière commande | `0 = succès, >0 = erreur` |
| `journalctl -xe` | Logs système récents | `journalctl -u nginx` |
| `systemctl status` | État d'un service | `systemctl status sshd` |
| `ufw status` | État du firewall | `ufw status verbose` |
| `df -h` | Espace disque | `df -h /` |
| `free -h` | Mémoire RAM | `free -h` |
| `ps aux` | Processus en cours | `ps aux \| grep nginx` |

---

## 🧪 Atelier Pratique : Simuler un diagnostic

**Scénario** : Le service Apache ne démarre pas.

```bash
# 1. Vérifier l'état du service
sudo systemctl status apache2

# 2. Vérifier les logs
sudo journalctl -u apache2 -n 50

# 3. Vérifier le fichier de configuration
sudo apache2ctl configtest

# 4. Vérifier le port 80
sudo ss -tlnp | grep :80
```

**Exercice** : Faites ces commandes sur votre machine. Même si Apache n'est pas installé, observez les messages d'erreur et interprétez-les.

**Livrable** : Notez 3 messages d'erreur que vous avez rencontrés et leur solution.

---

## ❓ Banque de QCM & Test du Jour (5 Questions)

**Q1 : Quelle est la première règle d'or du débogueur ?**
- A) Éteindre l'ordinateur
- B) Ne jamais paniquer — un message d'erreur est un diagnostic précieux
- C) Réinstaller le système
- D) Formater le disque

*Réponse : B — Un message d'erreur contient l'explication du problème.*

**Q2 : Que signifie le code de retour `$? = 0` ?**
- A) Erreur critique
- B) Succès de la dernière commande
- C) Le disque est plein
- D) Le réseau est coupé

*Réponse : B — Un code de retour 0 signifie que la dernière commande s'est exécutée avec succès.*

**Q3 : Quelle commande affiche le manuel officiel d'une commande Linux ?**
- A) `readme`
- B) `man`
- C) `help`
- D) `doc`

*Réponse : B — `man` ouvre les pages de documentation officielles.*

**Q4 : Face à une erreur "Permission denied", quel est le premier réflexe ?**
- A) Supprimer le fichier
- B) Vérifier les permissions et utiliser sudo si nécessaire
- C) Redémarrer l'ordinateur
- D) Ignorer l'erreur

*Réponse : B — Vérifier les permissions et utiliser sudo si vous avez les droits administrateur.*

**Q5 : Quelle commande affiche l'espace disque disponible ?**
- A) `free -h`
- B) `df -h`
- C) `ls -la`
- D) `ps aux`

*Réponse : B — `df -h` affiche l'espace disque disponible sur chaque partition.*

---

*Jour de Transition S0→S1 — Module J0r*
