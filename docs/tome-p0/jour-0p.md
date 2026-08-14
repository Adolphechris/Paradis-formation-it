# Jour J0P — Format S1 : Anatomie d'une Journée Type

> [!NOTE]
> **JOUR DE TRANSITION VERS LE SEMESTRE 1 — S0→S1 (J0p–J0v)**  
> Cette leçon vous dévoile la structure exacte d'une journée du Semestre 1 pour éliminer toute surprise le Jour 1. Aucun prérequis technique n'est nécessaire.

---

## 🎯 Objectifs de la Leçon
- 🗺️ Comprendre la structure en 4 blocs d'une journée S1.
- 📖 Savoir ce qu'est la section "Narration & Intuition".
- 🔍 Savoir ce qu'est la section "Anatomie Technique".
- 🛠️ Savoir ce qu'est la section "Atelier Pratique Hands-on".
- 🚑 Savoir ce qu'est la section "Diagnostic & Réflexes Terrain".
- 🧠 Comprendre la différence avec le format S0.

---

## 📖 1. Pourquoi le format change-t-il ?

Le Semestre 0 vous a habitués à un format léger : théorie courte, un seul lab, 5 QCM avec réponses fournies.

Le Semestre 1 adopte un format **professionnel** :

| Semestre 0 | Semestre 1 |
|---|---|
| Théorie générale | Narration & Intuition (storytelling) |
| Un seul lab | Atelier Pratique Hands-on (multi-commandes) |
| 5 QCM avec réponses | QCM sans réponses fournies |
| Pas de diagnostic | Diagnostic & Réflexes Terrain (dépannage) |
| Pas de livrable | Portfolio (scripts, captures, rapports) |

**Pourquoi ce changement ?** Parce que le Semestre 1 prépare au métier d'administrateur système. Un admin ne résout pas des QCM — il résout des problèmes sur des serveurs en production. Le format S1 simule cette réalité.

---

## 📖 2. Anatomie d'une Journée S1 (exemple commenté)

Une journée S1 se découpe en **4 sections principales** :

### 2.1 Narration & Intuition (1h30)
C'est l'histoire du concept. Pas de jargon d'entrée. On explique par une analogie métier.

> **Exemple (S1 J01)** : "Imaginez votre ordinateur comme une entreprise géante. L'écran de votre terminal est l'interphone à la porte. Le Shell est le réceptionniste derrière cet interphone. Vous parlez dans l'interphone (CLI), et le réceptionniste (Bash) interprète vos demandes pour les transmettre au patron (le noyau Linux)."

**Règle d'or** : Si vous ne pouvez pas expliquer le concept à quelqu'un qui n'a jamais touché un ordinateur, vous ne l'avez pas compris.

### 2.2 Anatomie Technique (1h30)
C'est la partie précise : commandes exactes, options, syntaxe, pièges.

> **Exemple (S1 J01)** :
> - `pwd` : Print Working Directory — affiche le chemin absolu depuis la racine `/`.
> - `ls -lah` : List avec format long, fichiers cachés, tailles lisibles.
> - `cd ..` : remonter d'un niveau.
> - `cd ~` : retourner au répertoire personnel.

**Règle d'or** : Chaque commande est réelle, testable, fonctionnelle. Pas de pseudo-code.

### 2.3 Atelier Pratique Hands-on (2h)
C'est le cœur de la journée. Vous exécutez des commandes réelles, vous écrivez des scripts, vous produisez des résultats visibles.

> **Exemple (S1 J01)** :
> ```bash
> # Savoir où on est
> pwd
> 
> # Lister le contenu du dossier avec détails
> ls -lah
> 
> # Aller dans /var/log
> cd /var/log
> pwd
> 
> # Revenir au répertoire précédent
> cd ..
> ```

**Règle d'or** : Vous ne "lisez" pas le TP, vous l'exécutez. Si le script ne marche pas, vous débuggez. C'est la méthode "Diagnostic & Réflexes Terrain".

### 2.4 Diagnostic & Réflexes Terrain (1h)
C'est la section qui vous apprend à dépanner. On vous donne un symptôme, vous identifiez la cause et la solution.

> **Exemple (S1 J01)** :
> - **Symptôme** : "Commande introuvable" (`command not found`).
> - **Diagnostic** : Soit la commande est mal orthographiée, soit elle n'est pas installée, soit elle n'est pas dans `$PATH`.
> - **Réflexe** : Vérifier l'orthographe ou utiliser `which <commande>`.

**Règle d'or** : En production, les choses cassent. Votre valeur n'est pas de savoir exécuter une commande qui marche, mais de savoir réparer celle qui ne marche pas.

---

## 📖 3. Le système d'évaluation S1

### 3.1 QCM quotidien
- 5 questions à la fin de chaque journée.
- Pas de réponses fournies immédiatement.
- Seuil de réussite : **75% (4/5)** pour passer au jour suivant.
- Si échec : revoir les sections concernées et recommencer.

### 3.2 Examens de synthèse
- Tous les 50 jours : examen de synthèse du semestre.
- 50 QCM couvrant l'ensemble du semestre.
- Seuil : **75%**.
- Si échec : rattrapage avec révision ciblée.

### 3.3 Portfolio
- Chaque journée peut produire un livrable (script, capture, rapport).
- Ces livrables sont stockés dans votre portfolio personnel.
- Le portfolio est votre **preuve de compétence** pour les employeurs.

---

## 🧪 Atelier Pratique : Lire une journée S1

Ouvrez le fichier `docs/tome-p0/jour-01.md` et lisez-le intégralement. Ce jour-là est votre premier jour S1 après la transition. Votre mission :

1. Lisez la section "Narration & Intuition" sans regarder les commandes.
2. Lisez la section "Anatomie Technique" et notez 3 commandes que vous ne connaissez pas.
3. Exécutez l'Atelier Pratique dans votre terminal.
4. Lisez la section "Diagnostic & Réflexes Terrain" et répondez mentalement à la question avant de lire la réponse.

**Livrable** : Capture d'écran de votre terminal après avoir exécuté les 7 commandes de l'atelier J01.

---

## ❓ Banque de QCM & Test du Jour (5 Questions)

**Q1 : Combien de sections principales compose une journée S1 ?**
- A) 1 section (théorie uniquement)
- B) 3 sections (théorie, TP, QCM)
- C) 4 sections (Narration, Anatomie Technique, Atelier Pratique, Diagnostic & Réflexes Terrain)
- D) 5 sections (théorie, TP, QCM, examen, portfolio)

*Réponse : C — Une journée S1 comporte 4 sections principales.*

**Q2 : Quelle est la différence principale entre le format S0 et le format S1 ?**
- A) Aucune différence
- B) S1 ajoute le Diagnostic & Réflexes Terrain et les livrables portfolio
- C) S0 est plus difficile que S1
- D) S1 supprime les TP pratiques

*Réponse : B — S1 introduit le Diagnostic & Réflexes Terrain et les livrables portfolio.*

**Q3 : Quel est le seuil de réussite pour un QCM quotidien S1 ?**
- A) 50%
- B) 75% (4/5 bonnes réponses)
- C) 100%
- D) Pas de seuil

*Réponse : B — Le seuil est de 75% (4/5 bonnes réponses).*

**Q4 : À quoi sert la section "Diagnostic & Réflexes Terrain" ?**
- A) À apprendre des histoires
- B) À apprendre à dépanner et résoudre des problèmes techniques
- C) À faire des pauses
- D) À lire des poèmes

*Réponse : B — Cette section vous apprend à diagnostiquer et résoudre des problèmes techniques.*

**Q5 : Qu'est-ce qu'un livrable portfolio ?**
- A) Un fichier Word vierge
- B) Un script, une capture ou un rapport produit pendant la journée, preuve de compétence
- C) Un examen blanc
- D) Une vidéo YouTube

*Réponse : B — Un livrable portfolio est une preuve concrète de compétence produite pendant la journée.*

---

*Jour de Transition S0→S1 — Module J0p*
