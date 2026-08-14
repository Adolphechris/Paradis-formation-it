# Jour J0E — Premiers Pas dans le Terminal & la Ligne de Commande

> [!NOTE]
> **SEMESTRE 0 — PARCOURS D'INITIATION ET SOCLE DE PRÉ-REQUIS ABSOLUS (J0a–J0o)**  
> Cette leçon lève l'appréhension de la ligne de commande. Vous allez apprendre à décoder l'invite de commande (Prompt) et exécuter vos premières commandes Unix en toute sécurité.

---

## 🎯 Objectifs de la Leçon
- 🖤 Démystifier la fenêtre noire du terminal.
- 💬 Comprendre la structure d'une commande Unix : `Commande -Options Arguments`.
- 📍 Identifier qui vous êtes (`whoami`) et où vous vous trouvez (`pwd`).
- 📅 Utiliser les commandes d'information système (`date`, `cal`, `clear`).

---

## 🖼️ Le Terminal Linux
![Terminal Linux](https://images.unsplash.com/photo-1629654297299-c8506221ca97?w=800)

---

## 📖 1. L'Invite de Commande (The Prompt)

Lorsque vous ouvrez un terminal sous Linux, vous voyez une ligne de texte appelée le **Prompt** (l'invite de commande). Elle vous donne des informations immédiates :

Exemple : `adolphe@paradis-srv:~$`

- **`adolphe`** : Le nom de l'utilisateur connecté.
- **`@paradis-srv`** : Le nom de la machine (nom d'hôte / hostname).
- **`:`** : Séparateur.
- **`~`** : Le dossier courant (le symbole tilde `~` est un raccourci qui désigne votre dossier personnel `/home/adolphe`).
- **`$`** : Indique que vous êtes un utilisateur standard (si c'était un `#`, vous seriez l'administrateur suprême `root`).

---

## 📖 2. La Structure d'une Commande Unix

Sous Linux, presque toutes les commandes suivent une grammaire très simple à 3 éléments :

```
nom_de_commande   -options   arguments
```

- **Le Nom** : La commande à exécuter (ex: `ls`).
- **Les Options (Flags)** : Modifient le comportement de la commande, généralement précédées d'un tiret `-` ou `--` (ex: `-l` pour affichage détaillé).
- **Les Arguments** : La cible sur laquelle la commande doit agir (ex: le nom d'un dossier `/var/log`).

---

## 📖 3. Vos 4 Premières Commandes Indispensables

1. **`whoami`** (*Who Am I?* / Qui suis-je ?) : Affiche le nom de compte de l'utilisateur actuellement connecté au terminal.
2. **`pwd`** (*Print Working Directory* / Afficher le répertoire de travail) : Affiche le chemin absolu du dossier exact dans lequel vous vous trouvez.
3. **`date`** : Affiche la date, l'heure exacte et le fuseau horaire du système.
4. **`clear`** : Nettoie l'écran du terminal pour repartir sur une page vierge (raccourci clavier : `Ctrl + L`).

---

## 🧪 2. Atelier Pratique : Exécuter vos Commandes

Tapez successivement ces 4 commandes dans votre terminal et observez le résultat :

```bash
whoami
pwd
date
clear
```

---

## ❓ Banque de QCM & Test du Jour (5 Questions)

**Q1 : Que signifie la commande Unix `pwd` ?**
- A) Power Down
- B) Print Working Directory (Afficher le dossier courant)
- C) Password Change
- D) Process Windows Data

*Réponse : B — `pwd` permet de connaître le chemin exact du répertoire dans lequel on se trouve.*

**Q2 : Dans l'invite de commande `user@linux-pc:~$`, que signifie le symbole tilde `~` ?**
- A) Que l'ordinateur est en panne
- B) Que vous êtes dans votre répertoire personnel d'utilisateur (`/home/user`)
- C) Que vous êtes connecté à Internet
- D) Que le disque dur est plein

*Réponse : B — Le tilde `~` est l'abréviation universelle désignant le dossier personnel de l'utilisateur.*

**Q3 : Dans la commande `ls -la /home`, quel élément représente l'option (flag) ?**
- A) `ls`
- B) `-la`
- C) `/home`
- D) Le bouton Entrée

*Réponse : B — `-la` est l'option qui modifie le comportement de la commande `ls` pour afficher les fichiers cachés et les détails.*

**Q4 : Quelle commande permet de connaître le nom exact de l'utilisateur connecté dans le terminal ?**
- A) `whoami`
- B) `whoareyou`
- C) `name`
- D) `user`

*Réponse : A — `whoami` renvoie l'identifiant du compte utilisateur actif.*

**Q5 : Quel raccourci clavier permet de nettoyer instantanément l'affichage du terminal ?**
- A) `Alt + F4`
- B) `Ctrl + L`
- C) `Ctrl + Alt + Suppr`
- D) `Espace + Entrée`

*Réponse : B — `Ctrl + L` nettoie immédiatement l'écran du terminal (équivalent de la commande `clear`).*

---

*Semestre 0 — Module d'Initiation & Pré-requis Absolus PARADIS IT Masterclass*
