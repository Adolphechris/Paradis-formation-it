# Jour J0C — Système d'Exploitation (OS) vs Applications : L'Anatomie du Logiciel

> [!NOTE]
> **SEMESTRE 0 — PARCOURS D'INITIATION ET SOCLE DE PRÉ-REQUIS ABSOLUS (J0a–J0o)**  
> Cette leçon détaille l'architecture logicielle complète d'un ordinateur : du matériel brut jusqu'au noyau (kernel), au système d'exploitation et aux applications utilisateur.

---

## 🎯 Objectifs de la Leçon

- 🧱 Distinguer les 4 couches fondamentales : Matériel, Noyau (Kernel), Système d'Exploitation (OS), et Applications.
- 🔒 Maîtriser la distinction critique entre **Espace Noyau (Kernel Space / Ring 0)** et **Espace Utilisateur (User Space / Ring 3)**.
- 🔄 Comprendre le fonctionnement exact d'un **Appel Système (Syscall)**.
- ⚙️ Découvrir le processus de démarrage d'un ordinateur (BIOS/UEFI → Bootloader → Kernel → Init/Systemd).
- 🖥️ Comparer l'Interface Graphique (**GUI**) et l'Interface en Ligne de Commande (**CLI**).
- 🧪 Manipuler les outils de traçage et d'inspection du système sous Linux.

---

## 🖼️ Architecture en Couches du Système

![Système d'Exploitation](https://images.unsplash.com/photo-1618401471353-b98afee0b2eb?w=800)

---

## 📖 1. L'Empilement Logiciel : Les 4 Couches de l'Informatique

### 1.1 Narration & Intuition — Le Gouvernement d'un Pays

Imaginez un pays moderne. 
- Le **Matériel** (*Hardware*), ce sont les infrastructures physiques : les routes, les usines, les centrales électriques.
- Le **Noyau** (*Kernel*), c'est le gouvernement central et les forces de sécurité : il possède l'autorité absolue, gère les ressources de l'État et empêche les citoyens de se voler les uns les autres.
- Le **Système d'Exploitation** (*OS*), c'est l'ensemble de la fonction publique et des services d'administration (cadastre, registre civil, services de voirie) qui entourent le gouvernement.
- Les **Applications**, ce sont les entreprises et les citoyens : ils travaillent, créent de la valeur, mais doivent demander une autorisation officielle au gouvernement (les *Syscalls*) chaque fois qu'ils ont besoin d'utiliser les infrastructures physiques.

Un ordinateur sans système d'exploitation n'est qu'un assemblage d'électronique inerte. Pour transformer ce matériel brut en outil interactif, l'informatique s'appuie sur cet empilement strict de 4 couches superposées :

```
┌─────────────────────────────────────────────────────────────────────────┐
│ 4. APPLICATIONS UTILISATEUR (Navigateur, VS Code, Nginx, Terminal)    │
├─────────────────────────────────────────────────────────────────────────┤
│ 3. SERVICES DU SYSTÈME D'EXPLOITATION (Systemd, Daemons, Shell, GUI)   │
├─────────────────────────────────────────────────────────────────────────┤
│ 2. NOYAU / KERNEL (Linux Kernel, Windows NT Kernel, macOS XNU)         │
├─────────────────────────────────────────────────────────────────────────┤
│ 1. MATÉRIEL BRUT (CPU, RAM, SSD/HDD, Carte Réseau, Carte Graphique)    │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 📖 2. Le Noyau (Kernel) : Le Chef d'Orchestre et Gardien de la Sécurité

### 2.1 Espace Noyau (Ring 0) vs Espace Utilisateur (Ring 3)

Les processeurs modernes (x86-64, ARM64) intègrent des mécanismes de sécurité matériels appelés **niveaux de privilèges** (*Protection Rings*).

```
          ┌───────────────────────────────────────────────┐
          │  Ring 3 : USER SPACE (Espace Utilisateur)      │
          │  - Navigateur Web, Python, Bash, Jeux         │
          │  - Accès direct au matériel INTERDIT          │
          └───────────────────────┬───────────────────────┘
                                  │ Appels Système (Syscalls)
                                  ▼
          ┌───────────────────────────────────────────────┐
          │  Ring 0 : KERNEL SPACE (Espace Noyau)          │
          │  - Noyau Linux, Pilotes Matériels (Drivers)   │
          │  - Accès direct et illimité à toute la mémoire │
          │    et aux périphériques                       │
          └───────────────────────────────────────────────┘
```

- **Ring 0 (Kernel Space)** : Le code s'exécute avec les privilèges maximaux du processeur. Il peut lire et écrire n'importe quelle adresse mémoire et contrôler directement les composants physiques. Seul le noyau réside ici.
- **Ring 3 (User Space)** : Tout le reste du système (vos programmes, votre navigateur, votre terminal) s'exécute en mode restreint. Si une application tente d'accéder directement au disque ou à la mémoire d'un autre programme sans passer par le noyau, le processeur bloque l'instruction et déclenche une erreur **Segmentation Fault (Segfault)**.

### 2.2 Les 5 Missions Principales du Noyau Linux

1. **Ordonnancement du Processeur (CPU Scheduling)** : Le noyau découpe le temps de calcul du processeur en microsecondes et l'attribue à tour de rôle aux centaines de processus actifs (*multitâche préemptif*).
2. **Gestion de la Mémoire RAM (Memory Management)** : Le noyau attribue une mémoire virtuelle isolée à chaque programme et empêche une application défaillante d'écraser les données d'une autre.
3. **Pilotes de Périphériques (Device Drivers)** : Le noyau traduit les commandes abstraites des programmes en instructions électroniques spécifiques pour la carte réseau, le SSD ou la carte vidéo.
4. **Gestion du Système de Fichiers (Filesystem Management)** : Le noyau gère l'organisation, l'écriture, la lecture et la sécurité des données sur les supports de stockage (ext4, NTFS, Btrfs).
5. **Gestion de la Sécurité & Réseau (Networking & Access Control)** : Le noyau gère la pile TCP/IP, le filtrage des paquets (*netfilter/iptables*) et les permissions d'accès des utilisateurs (`rwx`).

---

## 📖 3. Anatomie d'un Appel Système (Syscall)

### 3.1 Comment une Application Dialogue avec le Noyau ?

Une application utilisateur ne peut pas écrire directement sur le disque ni envoyer de données sur le réseau. Elle doit obligatoirement effectuer un **Appel Système (Syscall)**.

Prerenons l'exemple simple d'un script Python qui enregistre du texte dans un fichier `rapport.txt` :

```
┌─────────────────┐       1. open("rapport.txt")       ┌─────────────────┐
│ App Utilisateur │ ──────────────────────────────────►│  Bibliothèque C │
│  (Python/Ring 3)│                                    │     (glibc)     │
└─────────────────┘                                    └────────┬────────┘
                                                                │ 2. Instruction
                                                                │    CPU `syscall`
                                                                ▼
┌─────────────────┐                                    ┌─────────────────┐
│ Disque SSD / HDD│ ◄─── 4. Écriture physique sur ───────│   NOYAU LINUX   │
│  (Hardware)     │      le bloc mémoire du stockage   │    (Ring 0)     │
└─────────────────┘                                    └─────────────────┘
```

1. **Demande applicative** : Le programme fait appel à une fonction standard (ex: `open()`, `write()`, `socket()`).
2. **Commutation de mode (Context Switch)** : Le processeur exécute une instruction assembleur spéciale (`syscall` sur x86_64) qui fait basculer le processeur du Ring 3 vers le Ring 0.
3. **Exécution sécurisée par le Noyau** : Le noyau prend la main, vérifie si l'utilisateur a les droits d'accès au fichier, localise les secteurs sur le SSD, et effectue l'écriture.
4. **Retour au User Space** : Le noyau remet le processeur en Ring 3 et renvoie un code de statut (ex: `0` pour succès) à l'application.

---

## 📖 4. Du Démarrage du PC à l'Interface Utilisateur

Le processus de démarrage d'un ordinateur Linux suit 5 étapes séquentielles précises :

```
Step 1: POST / UEFI       ──► Le matériel s'auto-teste et initialise la carte mère.
Step 2: Bootloader (GRUB) ──► Charge le binaire du Noyau Linux depuis le disque vers la RAM.
Step 3: Kernel Execution  ──► Décompresse le noyau, initialise les pilotes et monte le disque racine (/).
Step 4: Init (Systemd)    ──► Le noyau lance le premier processus utilisateur : PID 1 (systemd).
Step 5: User Environment  ──► Systemd démarre les services (SSH, réseau, Web) et l'interface (GUI/CLI).
```

- **PID 1 (Systemd)** : C'est le père de tous les processus de l'ordinateur. Tout programme actif sur Linux est un descendant direct ou indirect du processus `systemd` (PID 1).

---

## 📖 5. GUI vs CLI : Quel Environnement pour Quel Usage ?

| Caractéristique | Interface Graphique (GUI) | Interface en Ligne de Commande (CLI) |
| :--- | :--- | :--- |
| **Interaction** | Souris, fenêtres, icônes, menus | Clavier, commandes textuelles, scripts |
| **Prise en main** | Immédiate et intuitive | Nécessite l'apprentissage de commandes |
| **Consommation RAM/CPU**| Élevée (~1 à 2 Go de RAM juste pour l'affichage) | Quasiment nulle (~5 à 15 Mo de RAM) |
| **Automatisation** | Très difficile ou impossible | Native via des scripts Bash / Python |
| **Gestion distante** | Nécessite beaucoup de bande passante (VNC, RDP) | Ultra-rapide via SSH (quelques Ko/sec) |
| **Usage idéal** | Bureautique, montage vidéo, navigation web | Administration serveur, Cybersécurité, Cloud |

> [!IMPORTANT]
> **Pourquoi les serveurs de production n'ont PAS d'interface graphique (Headless Servers) ?**  
> Dans un centre de données ou sur AWS, un serveur n'a pas d'écran. Installer une GUI consommerait inutilement de la mémoire RAM, ralentirait le système et augmenterait la surface d'attaque en installant des centaines de bibliothèques graphiques inutiles.

---

## 🧪 Atelier Pratique : Observer et Interroger le Noyau Linux

Ouvrez votre terminal et exécutez ces commandes réelles pour inspecter le fonctionnement de votre système :

```bash
# 1. Vérifier le nom, l'architecture et la version exacte du Noyau Linux
uname -a
# Output attendu: Linux hostname 5.15.0-xx-generic #xx-Ubuntu SMP ... x86_64

# 2. Inspecter le tout premier processus du système (PID 1)
ps -p 1 -o pid,ppid,user,cmd
# Output attendu: PID  PPID USER     CMD
#                  1     0 root     /sbin/init (ou /lib/systemd/systemd)

# 3. Traquer les appels système (Syscalls) exécutés par une commande
# La commande strace enregistre chaque appel au noyau !
strace -c ls /var/log/
# Output attendu: Un tableau récapitulatif des syscalls (% time, seconds, usecs/call, calls, errors, syscall)
# Vous verrez les appels openat, mmap, read, write, close...

# 4. Afficher la distribution Linux et le système d'exploitation complet
cat /etc/os-release
# Output attendu: NAME="Ubuntu", VERSION="22.04.3 LTS (Jammy Jellyfish)", ID=ubuntu...

# 5. Voir la consommation globale de mémoire gérée par le Noyau
free -h
# Output attendu: Mem: total, used, free, shared, buff/cache, available

# 6. Lister les 10 processus consommant le plus de ressources
ps aux --sort=-%cpu | head -10
```

---

## 🛠️ Diagnostics & Réflexes Terrain

### 1. Que faire en cas de "Segmentation Fault (core dumped)" ?
- **Cause** : Une application a tenté de lire ou d'écrire dans une zone de mémoire RAM qui ne lui appartenait pas. Le noyau est intervenu immédiatement pour tuer l'application afin d'éviter la corruption du système.
- **Réflexe** : Ce n'est pas un problème du système Linux, mais un **bug dans le code du logiciel**. Vérifiez les logs avec `journalctl -xe` ou examinez le binaire avec un débogueur (`gdb`).

### 2. Qu'est-ce que le "OOM Killer" (Out Of Memory Killer) ?
- **Cause** : La mémoire RAM du serveur est saturée à 100% et la mémoire Swap est pleine. Le noyau Linux doit décider d'urgence quel processus sacrifier pour empêcher le crash complet de la machine.
- **Réflexe** : Consultez les logs du noyau avec `dmesg | grep -i oom` ou `journalctl -k | grep -i oom`. Le noyau vous indiquera quel processus a été arrêté (ex: `Killed process 1234 (mysqld)`).

---

## ❓ Banque de QCM & Test du Jour (8 Questions)

**Q1 : Quel composant logiciel s'exécute en Ring 0 (Kernel Space) avec des privilèges absolus sur le matériel ?**
- A) Le navigateur web Chrome
- B) Le Noyau (Kernel)
- C) L'éditeur de texte VS Code
- D) Le serveur web Nginx

*Réponse : B — Le Noyau est le seul composant qui s'exécute en Ring 0 (Espace Noyau) avec un accès illimité au matériel.*

**Q2 : Que se passe-t-il lorsqu'une application en User Space (Ring 3) tente d'accéder directement à la RAM d'une autre application sans autorisation ?**
- A) L'ordinateur accélère
- B) Le processeur et le noyau bloquent l'application et déclenchent une erreur "Segmentation Fault"
- C) Les données sont fusionnées
- D) L'écran s'éteint automatiquement

*Réponse : B — Le noyau isole strictement la mémoire de chaque application et interrompt toute tentative d'accès non autorisé par un Segfault.*

**Q3 : Comment appelle-t-on la demande officielle d'un programme utilisateur au noyau pour effectuer une action matérielle (ex: lire un fichier) ?**
- A) Un Appel Système (Syscall)
- B) Une interruption Wi-Fi
- C) Un téléchargement web
- D) Un clic de souris

*Réponse : A — Un Appel Système (Syscall) est l'API qui permet aux programmes de solliciter les services sécurisés du noyau.*

**Q4 : Quel est le numéro d'identifiant (PID) du premier processus lancé par le noyau au démarrage du système Linux (généralement systemd) ?**
- A) PID 0
- B) PID 1
- C) PID 100
- D) PID 9999

*Réponse : B — Systemd (ou init) est le processus initial qui porte le PID 1 et duquel dérivent tous les autres processus.*

**Q5 : Pourquoi les serveurs de production professionnels en entreprise n'installent-ils pas d'interface graphique (GUI) ?**
- A) Parce que les cartes graphiques sont interdites dans les serveurs
- B) Pour économiser les ressources RAM/CPU, maximiser la stabilité et réduire la surface d'attaque
- C) Parce que Linux ne supporte pas les écrans
- D) Pour empêcher les employés de travailler

*Réponse : B — L'absence de GUI libère des gigaoctets de RAM, élimine des failles de sécurité et permet une administration 100% automatisée via CLI.*

**Q6 : Quelle commande Linux permet de tracer en temps réel tous les appels système (Syscalls) exécutés par un programme ?**
- A) `ping`
- B) `strace`
- C) `mkdir`
- D) `cat`

*Réponse : B — `strace` est l'outil d'ingénierie et de débogage ultime qui liste tous les appels système (open, read, write, etc.) lancés par un processus.*

**Q7 : Quel composant matériel/logiciel prend la main immédiatement à l'allumage du PC pour effectuer les auto-tests (POST) et charger le Bootloader ?**
- A) Le navigateur web
- B) L'UEFI / BIOS
- C) Python 3
- D) Le bureau GNOME

*Réponse : B — L'UEFI/BIOS est le micrologiciel (firmware) intégré à la carte mère qui démarre la séquence d'allumage.*

**Q8 : Que fait le composant du noyau appelé "OOM Killer" lorsque la mémoire RAM est saturée à 100% ?**
- A) Il achète de la RAM sur internet
- B) Il sélectionne et arrête brutalement le processus le plus gourmand pour éviter le plantage total du serveur
- C) Il efface le disque dur
- D) Il redémarre l'ordinateur sans prévenir

*Réponse : B — Le Out-Of-Memory (OOM) Killer intervient en dernier recours pour tuer les processus trop gourmands et maintenir le système en vie.*

---

## 📚 Ressources & Références

- **The Linux Kernel Archives** : https://kernel.org
- **Man Page des Syscalls Linux** : `man 2 syscalls`
- **Operating System Concepts (Silberschatz, Galvin, Gagne)** — Le manuel universitaire de référence sur les OS.
- **Linus Torvalds GitHub / Kernel Tree** : https://github.com/torvalds/linux

---

*Semestre 0 — Module d'Initiation & Pré-requis Absolus PARADIS IT Masterclass*
