# SEMESTRE 1 — Jour 17 (6h) : Scripting Bash — Conditions & Structure de Contrôle

> [!NOTE]
> **Objectif de la journée** : Rendre vos scripts intelligents en leur donnant la capacité de prendre des décisions selon l'état du système, le contenu de variables ou l'existence de fichiers.
> **Compétences visées** : `BIT-05` (Niveau Cible: A) — Logique et conditions Bash.

---

## 1) Les Tests Logiques et Opérateurs (1h30)

### 📖 1.1 Narration & Intuition
Un script linéaire est comme une recette de cuisine stricte : on fait A, puis B, puis C. Mais que se passe-t-il si un ingrédient manque ? Le script doit s'adapter. Les "tests" sont les yeux de votre script : ils lui permettent de vérifier l'environnement (un fichier existe-t-il ? un service tourne-t-il ? le mot de passe est-il correct ?) avant d'agir.

### 🔍 1.2 Anatomie Technique
Sous Linux, le test s'effectue via les crochets `[ ]` (la commande `test` POSIX) ou les doubles crochets `[[ ]]` (extension Bash plus robuste et moderne).
- **Fichiers** : `-f` (est un fichier), `-d` (est un dossier), `-e` (existe).
- **Nombres** : `-eq` (égal), `-ne` (différent), `-lt` (plus petit), `-gt` (plus grand).
- **Chaînes** : `==` (égal), `!=` (différent), `-z` (chaîne vide), `-n` (non vide).
*Règle d'or Bash* : Toujours laisser un espace après le crochet ouvrant et avant le crochet fermant.

### 🛠️ 1.3 Atelier Pratique Hands-on
```bash
# Tester si un fichier critique existe
[[ -f "/etc/passwd" ]] && echo "Le fichier existe !" || echo "Fichier introuvable."

# Tester des valeurs numériques
AGE=25
[[ $AGE -ge 18 ]] && echo "Majeur" || echo "Mineur"

# Tester des chaînes
USER_INPUT=""
[[ -z "$USER_INPUT" ]] && echo "Erreur: variable vide."
```

### 🚑 1.4 Diagnostic & Réflexes Terrain
- **Erreur courante** : `[[: command not found` ou erreurs de syntaxe. Souvent causé par l'absence d'espaces : `[[-f file]]` va planter. Il faut écrire `[[ -f file ]]`.
- **Variables non définies** : Toujours utiliser des guillemets doubles avec un simple crochet `[ "$VAR" == "test" ]` pour éviter un plantage si la variable est vide. Les doubles crochets `[[ $VAR == "test" ]]` gèrent mieux ce cas.

---

## 2) Les Structures Conditionnelles if / elif / else (1h30)

### 📖 2.1 Narration & Intuition
Une fois que notre script sait "voir" (via les tests), il doit "choisir". La structure `if/else` est l'aiguillage de votre programme. C'est le carrefour où le script décide s'il tourne à gauche (succès) ou à droite (échec).

### 🔍 2.2 Anatomie Technique
La syntaxe en Bash nécessite des mots-clés spécifiques : `if` (si), `then` (alors), `elif` (sinon si), `else` (sinon), et se termine par `fi` (if à l'envers).
```bash
if [[ condition ]]; then
    commandes
elif [[ autre_condition ]]; then
    commandes
else
    commandes
fi
```

### 🛠️ 1.3 Atelier Pratique Hands-on
```bash
#!/bin/bash
# Script de vérification d'espace disque simplifié
ESPACE=$(df / | grep / | awk '{ print $5 }' | sed 's/%//g')

if [[ $ESPACE -gt 90 ]]; then
    echo "ALERTE : Espace disque critique ($ESPACE%) !"
elif [[ $ESPACE -gt 70 ]]; then
    echo "WARNING : Espace disque élevé ($ESPACE%)."
else
    echo "OK : Espace disque normal."
fi
```

### 🚑 2.4 Diagnostic & Réflexes Terrain
- **Oubli du `then` ou du `fi`** : Bash renverra une erreur `syntax error: unexpected end of file`.
- **Indentation** : Bash s'en fiche, mais pour l'humain, une mauvaise indentation rend un code illisible. Toujours indenter le bloc dans le `if`.

---

## 3) Le Sélecteur Multi-cas : case (2h00)

### 📖 3.1 Narration & Intuition
Imaginons un script d'installation qui demande : "Tapez 1 pour Apache, 2 pour Nginx, 3 pour quitter". Faire une suite de `if/elif/elif/elif` devient vite lourd et illisible. L'instruction `case` fonctionne comme un standard téléphonique automatique qui vous dirige directement vers le bon service selon votre choix.

### 🔍 3.2 Anatomie Technique
L'instruction `case` évalue une variable et la compare à différents "motifs" (patterns).
Chaque bloc de cas se termine par une double esperluette... non, un double point-virgule `;;`.
```bash
case "$VARIABLE" in
    motif1) commandes ;;
    motif2|motif3) commandes ;;
    *) commandes_par_defaut ;;
esac
```

### 🛠️ 3.3 Atelier Pratique Hands-on
```bash
#!/bin/bash
echo "Quel service voulez-vous gérer ? (start/stop/restart)"
read ACTION

case "$ACTION" in
    start)
        echo "Démarrage du service..."
        ;;
    stop)
        echo "Arrêt du service..."
        ;;
    restart|reload)
        echo "Redémarrage en cours..."
        ;;
    *)
        echo "Action non reconnue. Utilisez start, stop ou restart."
        exit 1
        ;;
esac
```

### 🚑 3.4 Diagnostic & Réflexes Terrain
- **Oubli du `;;`** : Provoque des comportements inattendus ou des erreurs de syntaxe. Bash ne saura pas où le cas s'arrête.
- **Utilisation du wildcard `*`** : Toujours le mettre à la fin comme filet de sécurité ("catch-all") pour traiter les cas invalides.

---

## 📚 Nouvelles abréviations rencontrées
- **POSIX**: Portable Operating System Interface.

---

## 🏧️ Exercices Pratiques (Preuves de Portfolio)

### Exercice 1 : Script de Sauvegarde Conditionnelle
- **Consigne** : Créez un script `backup_check.sh` qui vérifie si le dossier `/var/log` existe. Si oui, il le copie dans `/tmp/log_backup`. S'il n'existe pas, il affiche un message d'erreur. Si `/tmp/log_backup` existe déjà, il demande confirmation avant d'écraser (via une structure `case` sur la réponse Y/N).
- **Livrables à produire** : Le fichier de script bash.
- **Corrigé détaillé & Guidé** :
```bash
#!/bin/bash
SOURCE="/var/log"
DEST="/tmp/log_backup"

if [[ ! -d "$SOURCE" ]]; then
    echo "Erreur: $SOURCE n'existe pas."
    exit 1
fi

if [[ -d "$DEST" ]]; then
    read -p "Le dossier $DEST existe déjà. Écraser ? (y/n) : " REP
    case "$REP" in
        y|Y)
            echo "Écrasement en cours..."
            rm -rf "$DEST"
            cp -r "$SOURCE" "$DEST"
            echo "Sauvegarde terminée."
            ;;
        n|N)
            echo "Annulation de la sauvegarde."
            ;;
        *)
            echo "Réponse invalide."
            exit 1
            ;;
    esac
else
    cp -r "$SOURCE" "$DEST"
    echo "Première sauvegarde terminée."
fi
```

---

## ❓ Banque de Questions QCM (Évaluation 75% minimum)
1. QCM: Quelle option teste si un fichier existe et est un fichier régulier ?
A) `-d`
B) `-f`
C) `-x`
D) `-z`
*Réponse: B*

2. QCM: Pourquoi utiliser `[[ ]]` plutôt que `[ ]` en Bash moderne ?
A) C'est plus court à taper.
B) Il supporte les expressions régulières et est plus tolérant aux variables vides.
C) `[ ]` est obsolète et a été supprimé.
D) `[[ ]]` est plus coloré dans le terminal.
*Réponse: B*

3. QCM: Quel est l'opérateur pour comparer numériquement si "a est plus grand que b" ?
A) `>`
B) `-ge`
C) `-gt`
D) `!=`
*Réponse: C*

4. QCM: Par quel mot-clé termine-t-on une boucle ou structure `if` en Bash ?
A) `endif`
B) `end`
C) `fi`
D) `done`
*Réponse: C*

5. QCM: Que signifie le symbole `*` dans un bloc `case` ?
A) Un pointeur mémoire.
B) Tous les fichiers du dossier courant.
C) C'est le cas par défaut qui capture tout ce qui n'a pas matché avant.
D) Une multiplication.
*Réponse: C*
