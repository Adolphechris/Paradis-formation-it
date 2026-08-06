# SEMESTRE 1 — Jour 16 (6h) : Scripting Bash Fondamentaux

> [!NOTE]
> **Objectif de la journée** : Créer, structurer et exécuter ses premiers scripts d'automatisation en Bash en utilisant les variables, les arguments, et les codes de retour pour valider le bon fonctionnement.
> **Compétences visées** : `BIT-05` (Niveau Cible: A) — Scripting Bash de base.

---

## 1) Introduction au Scripting Bash (1h30)

### 📖 1.1 Narration & Intuition
L'informatique, c'est l'art d'être paresseux avec intelligence. Si vous tapez trois fois par semaine la même séquence de cinq commandes pour sauvegarder un dossier, vous perdez votre temps. Un script Bash est simplement un fichier texte dans lequel on écrit ces commandes, et que l'on donne à l'ordinateur comme une partition à jouer. Le système devient l'orchestre, le script est la partition, et Bash est le chef d'orchestre.

### 🔍 1.2 Anatomie Technique
Un script sous Linux commence toujours par une ligne magique appelée **Shebang** (`#!`). Cette ligne indique au noyau quel programme doit être utilisé pour lire et exécuter le reste du fichier.
Pour le bash, c'est : `#!/bin/bash`.
Ensuite, pour qu'un simple fichier texte soit considéré comme un programme exécutable par Linux, il faut lui donner la permission d'exécution via `chmod +x`.

### 🛠️ 1.3 Atelier Pratique Hands-on
```bash
# Créer un fichier pour le script
nano mon_premier_script.sh

# Contenu du fichier :
# #!/bin/bash
# echo "Bonjour, monde !"
# echo "Nous sommes le :"
# date

# Rendre le fichier exécutable
chmod +x mon_premier_script.sh

# Exécuter le script (le ./ indique "dans le dossier actuel")
./mon_premier_script.sh
```

### 🚑 1.4 Diagnostic & Réflexes Terrain
**Problème** : "J'ai écrit mon script mais quand je tape son nom dans le terminal, on me dit `command not found`."
**Diagnostic** : Contrairement à Windows, Linux ne cherche pas les exécutables dans le dossier courant pour des raisons de sécurité. 
**Solution** : Il faut toujours précéder le nom du script par son chemin, souvent `./` s'il est dans le dossier courant, ex : `./script.sh`.

---

## 2) Variables et Arguments (1h30)

### 📖 2.1 Narration & Intuition
Un script doit pouvoir s'adapter. Si on code "en dur" (hardcode) le nom du fichier à sauvegarder, le script ne sert qu'à une seule chose. Les variables sont comme des tiroirs étiquetés dans lesquels on range des informations. Les arguments sont les colis qu'on donne au script au moment même où on le lance, de l'extérieur.

### 🔍 2.2 Anatomie Technique
- **Déclaration d'une variable** : `NOM="Jean"` (sans espaces autour du signe =).
- **Appel d'une variable** : On préfixe le nom par `$` : `echo $NOM`.
- **Arguments de la ligne de commande** :
  - `$1` est le premier mot passé après le nom du script.
  - `$2` est le second, etc.
  - `$0` est le nom du script lui-même.
  - `$#` contient le nombre total d'arguments reçus.

### 🛠️ 2.3 Atelier Pratique Hands-on
```bash
# Script de salutation personnalisée (saluer.sh)
cat << 'EOF' > saluer.sh
#!/bin/bash
PRENOM=$1
echo "Bonjour $PRENOM !"
echo "Vous avez passé $# arguments à ce script."
EOF

chmod +x saluer.sh

# Exécution avec argument
./saluer.sh Adolphe
```

### 🚑 2.4 Diagnostic & Réflexes Terrain
**Problème** : "Je déclare ma variable avec `VAR = "valeur"`, mais bash me dit `VAR: command not found`."
**Diagnostic** : Les espaces en Bash sont des séparateurs d'instructions. Bash croit que `VAR` est une commande, `=` son premier paramètre, etc.
**Solution** : Supprimez les espaces autour de l'égalité : `VAR="valeur"`.

---

## 3) Interactions, Saisies et Codes de Retour (2h00)

### 📖 3.1 Narration & Intuition
Pour être vraiment interactif, un script doit pouvoir vous poser des questions. La commande `read` sert à stopper le script et attendre que l'utilisateur tape quelque chose au clavier.
D'autre part, chaque commande Linux qui s'exécute renvoie un signal invisible de succès ou d'échec quand elle se termine, appelé **Code de retour**. C'est grâce à lui qu'un script sait si la commande précédente a réussi avant de continuer.

### 🔍 3.2 Anatomie Technique
- `read -p "Question : " MA_VAR` : Affiche une question et place la réponse dans `MA_VAR`.
- `$?` : C'est une variable spéciale qui contient le code de retour de la *dernière* commande exécutée.
  - `0` signifie "Succès parfait".
  - Tout ce qui est `> 0` (1, 2, 127, etc.) signifie "Erreur".

### 🛠️ 3.3 Atelier Pratique Hands-on
```bash
# Exemple interactif et vérification d'erreur (interactive.sh)
cat << 'EOF' > interactive.sh
#!/bin/bash
read -p "Quel dossier voulez-vous créer ? " DOSSIER

mkdir $DOSSIER

# On vérifie le code de retour du mkdir
if [ $? -eq 0 ]; then
    echo "Le dossier a été créé avec succès !"
else
    echo "Une erreur est survenue (le dossier existe peut-être déjà)."
fi
EOF

chmod +x interactive.sh
./interactive.sh
```

### 🚑 3.4 Diagnostic & Réflexes Terrain
**Problème** : "Mon script continue de s'exécuter et efface des fichiers même si la commande de changement de dossier (`cd`) a échoué juste avant !"
**Diagnostic** : Par défaut, Bash continue à la ligne suivante, même si une commande échoue. C'est très dangereux.
**Solution** : Placez toujours `set -e` juste en dessous du shebang. Cela force le script à s'arrêter immédiatement dès qu'une erreur se produit.

---

## 📚 Nouvelles abréviations rencontrées
- **PID** : Process ID (Identifiant de processus)
- **EOF** : End Of File (Fin de fichier)

---

## 🏧️ Exercices Pratiques (Preuves de Portfolio)

### Exercice 1 : Script de Sauvegarde basique
- **Consigne** : Écrivez un script `backup.sh` qui prend un nom de fichier en argument (`$1`). Le script doit copier ce fichier dans le dossier `/tmp/` en lui ajoutant l'extension `.bak`. Affichez un message de confirmation.
- **Livrables à produire** : Le contenu du fichier `backup.sh`.
- **Corrigé détaillé & Guidé** :
```bash
#!/bin/bash
FICHIER=$1

# Copie vers /tmp/ avec le nom original + .bak
cp "$FICHIER" "/tmp/${FICHIER}.bak"

# Message de confirmation
echo "Le fichier $FICHIER a été sauvegardé dans /tmp/${FICHIER}.bak"
```
*(N'oubliez pas `chmod +x backup.sh` !)*

---

## ❓ Banque de Questions QCM (Évaluation 75% minimum)
1. **Que signifie la ligne `#!/bin/bash` au début d'un fichier ?**
   A) C'est un commentaire ignoré par l'ordinateur
   B) C'est la déclaration du nom de l'auteur
   C) C'est le Shebang, qui indique à l'OS quel interpréteur utiliser pour lire le script
   D) C'est un mot de passe pour chiffrer le fichier
   *Réponse : C*

2. **Quelle est la bonne syntaxe pour affecter une valeur à une variable en Bash ?**
   A) `var := valeur`
   B) `var = "valeur"`
   C) `var="valeur"`
   D) `$var="valeur"`
   *Réponse : C*

3. **Dans un script, à quoi correspond la variable `$#` ?**
   A) Au nom du script
   B) Au code de retour de la dernière commande
   C) Au nombre d'arguments fournis lors du lancement du script
   D) À l'identifiant du processus (PID)
   *Réponse : C*

4. **Si la commande `ls /dossier_inexistant` échoue, quelle sera la valeur de `$?` immédiatement après ?**
   A) 0
   B) Un nombre supérieur à 0 (ex: 2)
   C) Vrai
   D) Faux
   *Réponse : B*

5. **Pourquoi est-il conseillé de mettre des guillemets autour des variables comme `"$1"` ?**
   A) Pour appliquer des couleurs dans le terminal
   B) Pour chiffrer la variable
   C) Pour éviter les erreurs si l'argument contient des espaces
   D) Parce que c'est obligatoire, sinon la variable n'est pas reconnue
   *Réponse : C*
