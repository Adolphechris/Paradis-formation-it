# SEMESTRE 1 — Jour 49 (6h) : Préparation de la Soutenance du Semestre 1

> [!NOTE]
> **Objectif de la journée** : Documenter, consolider le Portfolio de Projets (P1 à P4), structurer le mémoire technique et se préparer à l'oral d'évaluation devant jury.
> **Compétences visées** : `PRO-01` (Niveau Cible: A) — Communiquer techniquement, documenter et vulgariser son travail.

---

## 1) Consolidation du Portfolio de Projets (1h30)

### 📖 1.1 Narration & Intuition
Le meilleur ingénieur du monde n'est rien s'il ne sait pas prouver et expliquer ce qu'il a fait. Le Portfolio n'est pas un simple cahier de brouillon ; c'est votre vitrine professionnelle. Il regroupe l'ensemble des livrables (captures, scripts, playbooks, logs) accumulés pendant le semestre. L'objectif est de montrer la progression de votre réflexion technique : du problème posé (ex: sécuriser une infra) à la solution déployée (Ansible).

### 🔍 1.2 Anatomie Technique
Un bon portfolio projet respecte la règle **STAR** :
- **S**ituation : Quel était le contexte (serveurs vulnérables, besoin métier) ?
- **T**âche : Quelle était votre mission (déployer un bastion, auditer, durcir) ?
- **A**ction : Qu'avez-vous fait exactement (technologies utilisées : bash, SSH, iptables) ?
- **R**ésultat : Quelle est la preuve de réussite (statut Ansible "OK", pare-feu bloquant) ?

### 🛠️ 1.3 Atelier Pratique Hands-on
```bash
# 1. Organisation de votre dossier personnel de livrables
mkdir -p ~/Portfolio/S1/{P1_LinuxBase,P2_Bash,P3_Reseau,P4_SecOps}

# 2. Rassemblez tous vos scripts dans ces dossiers
# cp ~/scripts_bash/*.sh ~/Portfolio/S1/P2_Bash/
# cp ~/ansible-secops/*.yml ~/Portfolio/S1/P4_SecOps/

# 3. Exportez un arbre propre pour le joindre au mémoire
tree ~/Portfolio/S1/ > ~/Portfolio/S1/Arborescence_Livrables.txt
```

### 🚑 1.4 Diagnostic & Réflexes Terrain
- **Symptôme** : Perte de scripts car créés en `/tmp` lors des TP précédents.
- **Réflexe** : C'est le moment d'utiliser votre mémoire (ou votre historique de commandes avec `history`) pour recréer ces fichiers proprement. Ne présentez jamais un script brouillon.

---

## 2) Structuration du Mémoire Technique (1h30)

### 📖 2.1 Narration & Intuition
Le Mémoire de fin de semestre n'est pas un roman. C'est une documentation technique destinée à des experts. Il doit être structuré de façon à ce qu'un autre technicien puisse le lire, comprendre l'architecture, et potentiellement reproduire vos résultats.

### 🔍 2.2 Anatomie Technique
Structure exigée pour le Mémoire PARADIS IT (S1) :
1. **Page de Garde** (Nom, Date, Semestre, Titre).
2. **Résumé (Abstract)** : 10 lignes max synthétisant le semestre.
3. **Architecture et Topologie** : Schéma du réseau ou de l'infrastructure montée.
4. **Réalisation des Projets** : Développements, difficultés rencontrées, choix techniques (Pourquoi Ansible plutôt qu'un script Bash ?).
5. **Conclusion et Ouverture** : Bilan de compétences acquises et ce qu'il reste à améliorer pour le Semestre 2.

### 🛠️ 2.3 Atelier Pratique Hands-on
```bash
# 1. Générer le squelette du mémoire en Markdown
cat << 'EOF' > ~/Portfolio/S1/Memoire_S1.md
# Mémoire Technique - Semestre 1
## Auteur: [Votre Nom]

## 1. Résumé
[Insérez le résumé]

## 2. Architecture
[Décrire la topologie locale, VM, adresses IP]

## 3. Réalisations SecOps
[Lien vers les playbooks]

## 4. Conclusion
[Bilan]
EOF
```

### 🚑 2.4 Diagnostic & Réflexes Terrain
- **Symptôme** : Le jury pointe que la topologie n'est pas claire.
- **Réflexe** : Toujours utiliser des diagrammes visuels (Draw.io, Lucidchart, ou format texte Mermaid) pour documenter les flux réseau. Le texte seul est lourd à lire pour une architecture IP.

---

## 3) L'Oral Blanc d'Évaluation (2h00)

### 📖 3.1 Narration & Intuition
L'oral de soutenance (souvent 15 à 20 minutes) ne sert pas à lire votre mémoire (le jury l'a déjà lu). L'oral sert à démontrer votre maîtrise du sujet, à expliquer vos choix avec passion et professionnalisme, et surtout à affronter la redoutable séance des questions/réponses (Q/A) du jury. 

### 🔍 3.2 Anatomie Technique
- **Attitude** : Pro, synthétique, franc.
- **La règle d'Or du "Je ne sais pas"** : Si on vous pose une question technique très pointue et que vous ignorez la réponse, ne mentez jamais, ne bluffez pas. Un jury IT le verra en 3 secondes. Dites : *"Je n'ai pas la réponse précise de mémoire, mais dans une situation réelle, je vérifierais les man pages de cet outil ou les logs dans /var/log/"*. Cela montre un esprit d'ingénieur.

### 🛠️ 3.3 Atelier Pratique Hands-on
*Atelier de simulation en binôme :*
1. **Élève A (Candidat)** : Présente son projet Ansible de durcissement pendant 5 minutes.
2. **Élève B (Jury)** : Pose 2 questions pièges.
   - *Exemple* : "Que se passe-t-il si la connexion réseau coupe pendant l'exécution d'Ansible ?"
3. **Élève A** : Répond de manière professionnelle et technique.
4. Inversion des rôles.

### 🚑 3.4 Diagnostic & Réflexes Terrain
- **Symptôme** : Stress extrême, perte de moyens face à une commande oubliée lors d'une démo en direct (Effet Démo).
- **Réflexe** : Respirez. Expliquez à voix haute ce que vous êtes en train de faire pour déboguer ("Je rencontre une erreur de permission, je vais vérifier mes droits avec `id` et m'assurer que sudo est actif"). Le jury évalue souvent mieux votre gestion de l'imprévu que la démo elle-même.

---

## 🔤 Nouvelles abréviations rencontrées
- **STAR** : Situation, Task, Action, Result (Méthode de présentation).
- **Q/A** : Questions and Answers (Session de questions-réponses).

---

## 🏧️ Exercices Pratiques (Preuves de Portfolio)

### Exercice 1 : Rédaction de l'Abstract
- **Consigne** : Rédigez le résumé (Abstract) de votre mémoire S1 en Markdown (max 10 lignes), décrivant l'évolution de la simple commande Linux à l'automatisation SecOps complète.
- **Livrables à produire** : Le fichier `Memoire_S1.md` contenant le résumé.
- **Corrigé détaillé & Guidé** :
  *Exemple de contenu attendu* : "Au cours de ce premier semestre de la formation PARADIS IT, j'ai acquis des fondations solides en administration système Linux et en réseau. En débutant par la gestion de fichiers et d'utilisateurs, j'ai progressé vers la création de scripts Bash complexes et l'automatisation. Le point culminant a été la sécurisation d'un bastion SSH et le déploiement de règles de hardening CIS à l'aide d'Ansible, garantissant un environnement robuste face aux incidents."

---

## ❓ Banque de Questions QCM (Évaluation 75% minimum)

1. Quelle est la structure idéale pour présenter un projet technique lors d'une soutenance ?
   - A) La méthode SWOT
   - B) La méthode STAR (Situation, Tâche, Action, Résultat)
   - C) La méthode ABC
   - D) Un script bash lu de bout en bout
   - **Réponse : B**

2. Lors d'un oral technique, quelle est la meilleure réaction face à une question dont vous ignorez la réponse ?
   - A) Inventer une réponse complexe pour faire illusion
   - B) Admettre honnêtement son ignorance, mais expliquer comment on s'y prendrait pour trouver la solution (documentation, logs)
   - C) Ignorer la question et passer au slide suivant
   - D) Blâmer le système d'exploitation
   - **Réponse : B**

3. Qu'est-ce qu'un effet "Démo" ?
   - A) Une fonctionnalité d'Ansible
   - B) Le fait qu'une application fonctionne parfaitement en test, mais plante mystérieusement lors d'une présentation officielle
   - C) Un outil de présentation de diapositives Linux
   - D) Un type de malware
   - **Réponse : B**

4. Que doit absolument contenir le mémoire technique pour justifier l'architecture réseau ?
   - A) Un schéma de topologie (diagramme visuel)
   - B) L'adresse MAC de tous les PC de l'entreprise
   - C) Un poème sur le protocole TCP
   - D) Le code source du noyau Linux
   - **Réponse : A**

5. Pourquoi le portfolio de projets est-il crucial ?
   - A) Pour occuper de l'espace disque
   - B) Il sert de vitrine concrète de l'expertise acquise, prouvant la réalisation effective des TP et des projets
   - C) Uniquement pour générer un PDF
   - D) Pour installer des dépendances
   - **Réponse : B**

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
