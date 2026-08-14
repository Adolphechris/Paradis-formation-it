# Jour J0G — Comment Fonctionne un Programme Informatique ?

> [!NOTE]
> **SEMESTRE 0 — PARCOURS D'INITIATION ET SOCLE DE PRÉ-REQUIS ABSOLUS (J0a–J0o)**  
> Cette leçon explique comment du texte écrit par un être humain (le code source) se transforme en instructions exécutées par le processeur.

---

## 🎯 Objectifs de la Leçon
- 🧠 Définir la notion d'**algorithme** et de **code source**.
- ⚙️ Distinguer les langages **compilés** (C, C++, Go) et les langages **interprétés** (Python, Bash).
- 🔄 Découvrir la séquence : Entrées → Traitement → Sorties.
- 🐞 Comprendre ce qu'est un bogue (*bug*) informatique et un débogueur.

---

## 🖼️ Logique de Programmation
![Code & Programmation](https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800)

---

## 📖 1. Qu'est-ce qu'un Algorithme et un Programme ?

### 1.1 L'Algorithme : La Recette de Cuisine
Un **algorithme** est une suite d'instructions étape par étape, finie et non ambiguë, permettant de résoudre un problème ou d'accomplir une tâche. 

Analogie :
> Une recette de gâteau au chocolat est un algorithme :
> 1. Casser 3 œufs.
> 2. Ajouter 100g de sucre.
> 3. Mélanger pendant 2 minutes.
> 4. Cuire à 180°C pendant 25 minutes.

### 1.2 Le Programme : L'Algorithme traduit en Code
Un **programme informatique** est l'expression d'un algorithme rédigée dans un **langage de programmation** compréhensible (comme Python, Bash ou C) puis traduit en langage machine (`0` et `1`) pour le processeur.

---

## 📖 2. Langages Compilés vs Langages Interprétés

### 2.1 Les Langages Compilés (ex: C, C++, Go, Rust)
Dans un langage compilé, un logiciel appelé **Compilateur** traduit l'intégralité du code source texte en un fichier binaire exécutable (`.exe` ou binaire ELF Linux) **avant** l'exécution.
- **Avantage** : Vitesse d'exécution maximale (accès direct au processeur).
- **Inconvénient** : Il faut recompiler à chaque modification de code.

### 2.2 Les Langages Interprétés / Scripting (ex: Python, Bash, JavaScript)
Dans un langage interprété, un logiciel appelé **Interpréteur** lit le code source ligne par ligne au moment exact où le programme s'exécute, et le traduit à la volée.
- **Avantage** : Développement très rapide, écriture simple et lisible.
- **Inconvénient** : Légèrement plus lent que le binaire compilé.

---

## 🧪 2. Atelier Pratique : Créer et Exécuter son Premier Script Bash

Tapez ces commandes dans votre terminal Linux pour créer et lancer votre tout premier programme :

```bash
# 1. Écrire le code source du script dans un fichier
echo 'echo "Hello World ! Mon premier programme Linux fonctionne !"' > mon_script.sh

# 2. Exécuter le script via l'interpréteur Bash
bash mon_script.sh
```

---

## ❓ Banque de QCM & Test du Jour (5 Questions)

**Q1 : Qu'est-ce qu'un algorithme en informatique ?**
- A) Un composant électronique en silicium
- B) Une suite d'instructions étape par étape permettant de résoudre un problème donné
- C) Une marque d'ordinateur
- D) Un câble de connexion Internet

*Réponse : B — Un algorithme est la description logique de la séquence d'instructions à accomplir.*

**Q2 : Quelle est la différence majeure entre un langage compilé (comme le C) et un langage interprété (comme Python) ?**
- A) Le langage compilé est traduit à l'avance en binaire exécutable, tandis que le langage interprété est traduit ligne par ligne à l'exécution
- B) Le langage interprété nécessite un écran tactile
- C) Les langages compilés sont interdits sur Linux
- D) Il n'y a aucune différence

*Réponse : A — La compilation génère un binaire natif avant l'exécution, l'interpréteur lit le code à la volée.*

**Q3 : Que signifie le terme "Bug" (Bogue) en programmation ?**
- A) Un insecte physique coincé dans l'écran
- B) Une erreur ou un défaut dans le code source provoquant un comportement incorrect du programme
- C) Une mise à jour automatique
- D) Une sauvegarde réussie

*Réponse : B — Un bug est une anomalie logique ou de syntaxe dans le code source.*

**Q4 : Quel langage de scripting moderne est extrêmement populaire pour l'automatisation système et la cybersécurité ?**
- A) COBOL
- B) Python
- C) Pascal
- D) HTML

*Réponse : B — Python est le langage de référence moderne pour l'automatisation, la data et la cybersécurité.*

**Q5 : Quel logiciel est responsable de la lecture et de l'exécution ligne par ligne d'un script Bash ou Python ?**
- A) L'imprimante
- B) L'Interpréteur
- C) La carte graphique
- D) Le bloc d'alimentation

*Réponse : B — L'interpréteur lit le code source et le traduit en instructions système à la volée.*

---

*Semestre 0 — Module d'Initiation & Pré-requis Absolus PARADIS IT Masterclass*
