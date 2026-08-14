# Jour J0F — Fichiers, Dossiers & Arborescence Linux

> [!NOTE]
> **SEMESTRE 0 — PARCOURS D'INITIATION ET SOCLE DE PRÉ-REQUIS ABSOLUS (J0a–J0o)**  
> Cette leçon explique la philosophie Unix du système de fichiers en arbre et la navigation entre les répertoires.

---

## 🎯 Objectifs de la Leçon
- 📁 Comprendre le principe universel : *"Tout est fichier sous Linux"*.
- 🌳 Explorer la racine `/` et les principaux dossiers du système (`/home`, `/etc`, `/var`).
- 🧭 Maitriser la différence entre chemin **absolu** et chemin **relatif**.
- 🔍 Découvrir la commande `ls` pour lister le contenu des répertoires.

---

## 🖼️ Arborescence des Fichiers
![Arborescence Linux](https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=800)

---

## 📖 1. L'Arbre des Fichiers Linux (Filesystem Hierarchy)

Contrairement à Windows qui utilise des lettres de lecteurs séparées (`C:\`, `D:\`), Linux organise l'intégralité de son stockage dans un **arbre unique inversé**. Le sommet de cet arbre est représenté par une simple barre oblique appelée la **Racine** (**`/`**).

### Les Dossiers Stratégiques :
- **`/` (La Racine)** : La base de tout le système de fichiers.
- **`/home`** : Contient les dossiers personnels de chaque utilisateur (ex: `/home/adolphe`).
- **`/etc`** : Contient tous les fichiers de configuration texte des logiciels et du système.
- **`/var`** : Contient les données variables (les journaux d'erreurs `logs`, les bases de données, les mémoires tampons).
- **`/bin` & `/usr/bin`** : Contiennent les programmes exécutables et commandes du système.

---

## 📖 2. Chemins Absolus vs Chemins Relatifs

Pour désigner l'emplacement d'un fichier sous Linux, on utilise deux méthodes :

### 2.1 Le Chemin Absolu
Il commence **toujours par la racine `/`** et décrit l'itinéraire complet depuis le sommet de l'arbre.
- Exemple : `/home/adolphe/Documents/rapport.txt`

### 2.2 Le Chemin Relatif
Il décrit l'itinéraire **depuis l'endroit exact où vous êtes actuellement (`pwd`)**.
- Symboles utiles :
  - **`.`** (Un seul point) : Le répertoire courant.
  - **`..`** (Deux points) : Le répertoire parent (remonter d'un niveau).
- Exemple : Si vous êtes dans `/home/adolphe`, le chemin relatif vers `rapport.txt` est `Documents/rapport.txt`.

---

## 🧪 2. Atelier Pratique : Explorer l'Arborescence

Exécutez ces commandes dans votre terminal Linux pour naviguer dans l'arborescence :

```bash
# 1. Lister le contenu de votre répertoire courant
ls -la

# 2. Lister le contenu de la racine du système /
ls -l /

# 3. Voir l'espace disque disponible sur le système de fichiers
df -h /
```

---

## ❓ Banque de QCM & Test du Jour (5 Questions)

**Q1 : Quel symbole représente le sommet absolu du système de fichiers sous Linux (la Racine) ?**
- A) `C:\`
- B) `/` (La barre oblique / Slash)
- C) `~`
- D) `root:`

*Réponse : B — La barre oblique `/` (slash) désigne la racine de l'arborescence Linux.*

**Q2 : Quel dossier sous Linux contient les fichiers de configuration système et applicatifs en format texte ?**
- A) `/tmp`
- B) `/etc`
- C) `/home`
- D) `/dev`

*Réponse : B — `/etc` est le répertoire standard réservé aux fichiers de configuration.*

**Q3 : Dans un chemin de fichier, que désigne le symbole `..` (deux points) ?**
- A) Le répertoire racine
- B) Le répertoire parent (remonter d'un niveau dans l'arbre)
- C) Un fichier supprimé
- D) La corbeille

*Réponse : B — `..` est le raccourci universel pour désigner le dossier immédiatement supérieur.*

**Q4 : Quelle est la différence entre un chemin absolu et un chemin relatif ?**
- A) Le chemin absolu commence toujours par la racine `/`, tandis que le chemin relatif démarre du dossier courant
- B) Le chemin absolu est réservé aux images
- C) Le chemin relatif ne fonctionne que sur Windows
- D) Il n'y a aucune différence

*Réponse : A — L'absolu part de `/` tandis que le relatif s'évalue depuis le répertoire de travail actuel.*

**Q5 : Quel répertoire héberge les espaces de stockage personnels des utilisateurs standard sous Linux ?**
- A) `/bin`
- B) `/var`
- C) `/home`
- D) `/boot`

*Réponse : C — `/home` contient les répertoires personnels réservés aux utilisateurs du système.*

---

*Semestre 0 — Module d'Initiation & Pré-requis Absolus PARADIS IT Masterclass*
