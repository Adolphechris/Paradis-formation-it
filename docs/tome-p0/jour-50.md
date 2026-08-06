# SEMESTRE 1 — Jour 50 (6h) : Grand Examen du Semestre 1 & Remise des Notes

> [!NOTE]
> **Objectif de la journée** : Clôturer le Semestre 1 par l'évaluation finale. Valider toutes les compétences fondamentales en administration système, réseaux, scripting et sécurité (SecOps) via un QCM global et un cas pratique sous pression.
> **Compétences visées** : **Clôture intégrale du Semestre 1** — Validation pour le passage au Semestre 2.

---

## 1) Évaluation Théorique : Le QCM Global (1h30)

### 📖 1.1 Narration & Intuition
Avant de manipuler un réacteur nucléaire, on valide que l'ingénieur connaît les plans. Le QCM global de fin de semestre n'est pas conçu pour vous piéger sur des détails absurdes, mais pour vérifier que vos fondations (Commandes, Réseau, Droits, Automatisation) sont solides et encrées comme des automatismes.

### 🔍 1.2 Anatomie Technique (Thèmes couverts)
- **Linux Base** : FHS (arborescence), Permissions (chmod, chown), Gestion des processus.
- **Réseau** : Modèle OSI, Routage (IP, subnetting), DNS.
- **Scripting Bash** : Boucles, Variables, Conditions, Cron.
- **SecOps** : Bastion SSH, Hardening (sysctl), Analyse Forensique, Ansible.

### 🛠️ 1.3 Atelier Pratique Hands-on
*(Ceci est une session d'examen fermée. Pas de console autorisée. Papier/Crayon ou plateforme d'examen LMS).*

### 🚑 1.4 Diagnostic & Réflexes Terrain
- **Symptôme** : Hésitation entre deux options apparemment correctes.
- **Réflexe** : Raisonnez par élimination technique. Quelle option violerait les règles de sécurité fondamentales (principe de moindre privilège) ou ferait crasher le serveur ? C'est souvent la réponse à écarter.

---

## 2) Cas Pratique Sous Contrainte de Temps (2h00)

### 📖 2.1 Narration & Intuition
L'incident est en cours. Le chronomètre tourne. Le cas pratique simule la pression d'un vrai "Jour 1" en entreprise. Vous recevez un serveur fraîchement installé, vide, et vous avez un temps imparti pour le configurer, le sécuriser et l'automatiser selon un cahier des charges strict.

### 🔍 2.2 Anatomie Technique (Mission Typique)
1. Création d'utilisateurs et gestion de groupes stricts.
2. Configuration du pare-feu (`ufw` ou `iptables`) pour n'autoriser que SSH et le Web.
3. Écriture d'un script d'alerte automatisé (Cron).
4. Création d'un playbook Ansible pour imposer les règles CIS (verrouillage mots de passe).
5. Récupération d'un log effacé.

### 🛠️ 2.3 Atelier Pratique Hands-on (Sujet de l'Examen Pratique)
```bash
# === DÉBUT DE L'ÉPREUVE (Exemple de directives à réaliser sur la VM) ===

# Mission 1 : Créez l'utilisateur 'auditeur', sans mot de passe, mais avec une clé SSH imposée.
# Mission 2 : Désactivez le ping entrant sur le serveur de manière permanente.
# Mission 3 : Rédigez un playbook Ansible 'examen.yml' qui installe 'nginx' et le lance.

# (L'étudiant travaille en silence et autonomie sur sa console)
```

### 🚑 2.4 Diagnostic & Réflexes Terrain
- **Symptôme** : Le stress monte, bloqué depuis 15 minutes sur une erreur de syntaxe Ansible.
- **Réflexe** : Avancez. Commentez votre code (avec `#`) pour expliquer au jury ce que vous vouliez faire. Un code partiel mais documenté rapporte des points partiels ; un code bloquant tout le reste vaut zéro.

---

## 3) Soutenances, Délibérations et Remise des Notes (2h00)

### 📖 3.1 Narration & Intuition
Le jury se réunit. Il croise les notes de votre QCM (30%), de votre cas pratique (40%) et de votre présentation de Portfolio (30%). C'est le moment d'évaluer non seulement votre niveau technique, mais aussi votre posture professionnelle (Soft Skills).

### 🔍 3.2 Anatomie Technique
- **Critère de passage** : Seuil fixé à **75%** global pour obtenir la certification du Semestre 1 et l'autorisation de passer au Semestre 2 (où l'on abordera les infrastructures avancées, le Cloud, et la Cybersécurité offensive).
- En cas d'échec (entre 60% et 74%), un rattrapage intensif (Bootcamp) d'une semaine est prévu.

### 🛠️ 3.3 Atelier Pratique Hands-on
*(Entretiens individuels, remise du diplôme du S1).*

### 🚑 3.4 Diagnostic & Réflexes Terrain
- **Symptôme** : Une note de 72%, échec de justesse à cause du Bash.
- **Réflexe** : Acceptez le feedback du jury de manière constructive. Demandez exactement quels concepts doivent être retravaillés pendant le rattrapage. Ne soyez pas défensif : un vrai pro apprend de ses erreurs.

---

## 🔤 Nouvelles abréviations rencontrées
- **QCM** : Questionnaire à Choix Multiples.
- **LMS** : Learning Management System (Plateforme d'apprentissage, Moodle, Canvas).
- **Soft Skills** : Compétences comportementales et humaines.

---

## 🏧️ Exercices Pratiques (Preuves de Portfolio)

### Exercice 1 : Nettoyage de l'Environnement S1
- **Consigne** : L'examen est terminé, préparez votre machine pour le S2. Archivez tout votre dossier S1 dans une archive compressée et chiffrée.
- **Livrables à produire** : L'archive `Portfolio_S1_Final.tar.gz.gpg` et son hash de vérification.
- **Corrigé détaillé & Guidé** :
  1. `tar -czvf Portfolio_S1.tar.gz ~/Portfolio/S1/`
  2. `gpg -c Portfolio_S1.tar.gz` (Saisir un mot de passe fort).
  3. `sha256sum Portfolio_S1.tar.gz.gpg > archive_hash.txt`
  4. Gardez cela précieusement.

---

## ❓ Banque de Questions QCM (Évaluation 75% minimum)

*(Ceci est un extrait de l'examen final)*

1. Dans un système Linux, que signifie une permission de `755` sur un répertoire ?
   - A) Le propriétaire a tous les droits, les autres peuvent lire et exécuter/traverser le dossier
   - B) Tout le monde a tous les droits
   - C) Personne ne peut écrire, seul le propriétaire peut lire
   - D) Le dossier est caché
   - **Réponse : A**

2. En Bash, comment redirige-t-on la sortie standard (stdout) ET la sortie d'erreur (stderr) vers un seul fichier ?
   - A) `commande > fichier`
   - B) `commande > fichier 2>&1`
   - C) `commande < fichier`
   - D) `commande | fichier`
   - **Réponse : B**

3. Quelle commande Ansible permet de vérifier ce qu'un Playbook modifierait sans réellement appliquer les changements ?
   - A) `ansible-playbook --apply`
   - B) `ansible-playbook --dry`
   - C) `ansible-playbook --check`
   - D) `ansible-playbook --undo`
   - **Réponse : C**

4. Lors d'un incident de sécurité, pourquoi l'analyse de la mémoire vive (RAM) est-elle cruciale ?
   - A) Pour libérer de l'espace disque
   - B) Parce que des malwares "fileless", des clés de chiffrement et des connexions réseau actives s'y trouvent
   - C) Pour réduire la température du serveur
   - D) Parce que la RAM conserve les données même après un redémarrage
   - **Réponse : B**

5. À quoi correspond le niveau 3 (Couche Réseau) du modèle OSI ?
   - A) Routage et adressage IP
   - B) Câbles physiques
   - C) Applications HTTP/DNS
   - D) Commutation Ethernet (MAC)
   - **Réponse : A**

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
