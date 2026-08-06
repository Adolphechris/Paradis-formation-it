# SEMESTRE 1 — Jour 18 (6h) : Scripting Bash — Boucles & Traitement de Données

> [!NOTE]
> **Objectif de la journée** : Maîtriser l'automatisation répétitive en traitant des listes, des fichiers et des commandes en boucle.
> **Compétences visées** : `BIT-05` (Niveau Cible: A) — Boucles et parsing de données Bash.

---

## 1) La Boucle `for` et l'Itération (1h30)

### 📖 1.1 Narration & Intuition
L'intérêt d'une machine, c'est de faire le travail répétitif sans se fatiguer. La boucle `for` est l'outil parfait pour dire à l'ordinateur : "Pour chaque élément de cette liste, fais cette action". Que ce soit pour créer 50 utilisateurs, supprimer 200 fichiers ou pinger 10 serveurs, le code reste le même.

### 🔍 1.2 Anatomie Technique
La boucle `for` prend une liste (fichiers, mots, séquence de nombres) et assigne chaque élément à une variable temporaire, tour à tour.
```bash
for VARIABLE in LISTE; do
    commandes
done
```
Pour générer une séquence numérique, on utilise les accolades `{debut..fin}`.

### 🛠️ 1.3 Atelier Pratique Hands-on
```bash
# Itérer sur une liste de mots
for SRV in web db mail; do
    echo "Configuration du serveur: $SRV"
done

# Itérer sur une plage numérique
for NUM in {1..5}; do
    echo "Création de l'utilisateur user-$NUM"
done

# Itérer sur les fichiers d'un dossier
for FILE in /var/log/*.log; do
    echo "Analyse du fichier de log : $FILE"
done
```

### 🚑 1.4 Diagnostic & Réflexes Terrain
- **Espaces dans les noms de fichiers** : Lors d'une itération sur des fichiers, un espace dans un nom casse la boucle si vous n'utilisez pas les guillemets. Préférez `"$FILE"` à `$FILE`.
- **Boucle infinie accidentelle** : Rare avec `for` en Bash, mais attention à la consommation de ressources si votre liste contient 5 millions d'éléments.

---

## 2) La Boucle `while` et le parsing ligne par ligne (1h30)

### 📖 2.1 Narration & Intuition
La boucle `while` (tant que) fonctionne différemment : elle boucle "tant qu'une condition est vraie". Elle est particulièrement puissante en Bash pour lire un fichier ligne par ligne de manière sécurisée (parsing CSV, fichiers de configuration).

### 🔍 2.2 Anatomie Technique
La syntaxe standard avec lecture de fichier:
```bash
while read -r LIGNE; do
    echo "J'ai lu : $LIGNE"
done < "mon_fichier.txt"
```
L'option `-r` dans `read` empêche l'interprétation des antislashes (backslash), assurant une lecture brute et fidèle de la donnée.

### 🛠️ 2.3 Atelier Pratique Hands-on
Créons un fichier factice `serveurs.txt`:
```bash
echo -e "192.168.1.1\n192.168.1.2\n192.168.1.3" > serveurs.txt

# Lecture en boucle
while read -r IP; do
    echo "Tentative de connexion à $IP..."
    # ping -c 1 $IP
done < serveurs.txt
```

### 🚑 2.4 Diagnostic & Réflexes Terrain
- **Perte de la dernière ligne** : Si le fichier ne se termine pas par un saut de ligne (`\n`), `read` peut ignorer la dernière ligne. Solution : `while read -r LIGNE || [ -n "$LIGNE" ]; do ...`
- **Tant que basique** : On l'utilise aussi avec une condition. Exemple : `while [[ $COMPTEUR -lt 10 ]]; do ...`

---

## 3) Sous-interpréteurs et Substitution de Commandes (2h00)

### 📖 3.1 Narration & Intuition
Parfois, vous voulez qu'une commande serve d'"ingrédient" à une autre commande. La substitution de commande est le fait de capturer le résultat d'une commande (sa sortie standard) pour la stocker dans une variable ou l'utiliser dans une boucle.

### 🔍 3.2 Anatomie Technique
La syntaxe moderne est `$(commande)`. L'ancienne syntaxe utilisait les backticks `\`commande\`` (à éviter car difficilement imbricable et illisible).
Lorsque vous lancez `$(...)`, Bash ouvre un "sous-shell" (un processus enfant), exécute la commande, et remplace le bloc par le résultat texte.

### 🛠️ 3.3 Atelier Pratique Hands-on
```bash
# Stocker le résultat dans une variable
DATE_ACTUELLE=$(date +%Y-%m-%d)
echo "Nous sommes le $DATE_ACTUELLE"

# Utiliser dans une boucle for
for PROCESS in $(ps aux | awk '{print $1}' | sort | uniq); do
    echo "Utilisateur faisant tourner des process : $PROCESS"
done
```

### 🚑 3.4 Diagnostic & Réflexes Terrain
- **Séparation par espace vs par ligne** : `$(commande)` découpe les mots sur les espaces et les retours à la ligne par défaut (la variable d'environnement `IFS`). Si vous analysez le contenu d'un dossier, privilégiez `for FILE in *` plutôt que `for FILE in $(ls)` (qui va exploser les noms contenant des espaces).

---

## 📚 Nouvelles abréviations rencontrées
- **IFS**: Internal Field Separator.
- **CSV**: Comma-Separated Values.

---

## 🏧️ Exercices Pratiques (Preuves de Portfolio)

### Exercice 1 : Générateur de structure de projet
- **Consigne** : Créez un script `init_project.sh` qui lit un fichier texte `folders.txt` contenant des noms de répertoires à créer. Pour chaque ligne, il crée le dossier, et ajoute un fichier `README.md` vide à l'intérieur avec la date du jour injectée dedans via `$(date)`.
- **Livrables à produire** : Le script + le fichier `folders.txt`.
- **Corrigé détaillé & Guidé** :
```bash
# 1. Création du fichier source
cat << EOF > folders.txt
src
bin
docs
tests
EOF

# 2. Le script d'automatisation
#!/bin/bash
FICHIER="folders.txt"

if [[ ! -f "$FICHIER" ]]; then
    echo "Fichier $FICHIER introuvable !"
    exit 1
fi

while read -r DOSSIER; do
    echo "Création du dossier $DOSSIER..."
    mkdir -p "$DOSSIER"
    
    DATE_CREATION=$(date +"%d/%m/%Y %H:%M")
    echo "# Dossier $DOSSIER créé le $DATE_CREATION" > "$DOSSIER/README.md"
done < "$FICHIER"

echo "Initialisation terminée."
```

---

## ❓ Banque de Questions QCM (Évaluation 75% minimum)
1. QCM: Quelle est la syntaxe correcte pour une boucle for sur une séquence de 1 à 10 ?
A) `for i in 1..10`
B) `for i in {1..10}`
C) `for (i=1; i<=10; i++)`
D) `for i in [1-10]`
*Réponse: B*

2. QCM: Quel est l'avantage de la boucle `while read` par rapport à un `for` pour lire un fichier ?
A) Elle est plus rapide.
B) Elle respecte les lignes entières même s'il y a des espaces, contrairement au `for`.
C) Elle utilise moins de RAM.
D) Elle détecte automatiquement les formats JSON.
*Réponse: B*

3. QCM: Pourquoi préfère-t-on la syntaxe `$(commande)` aux backticks \`commande\` ?
A) Les backticks sont supprimés de Linux.
B) `$(...)` permet facilement d'imbriquer des commandes `$(commande1 $(commande2))`.
C) C'est exigé par le standard Windows.
D) `$(...)` exécute la commande en tant que root.
*Réponse: B*

4. QCM: Dans `while read -r ligne`, à quoi sert `-r` ?
A) À lire en Reverse (à l'envers).
B) À ignorer les backslashes pour une lecture brute sans échappement.
C) À utiliser une expression Régulière.
D) À limiter l'usage de la RAM.
*Réponse: B*

5. QCM: Quelle boucle est la plus appropriée pour un menu persistant qui attend un choix utilisateur jusqu'à ce qu'il tape 'Quitter' ?
A) `for`
B) `until`
C) `while`
D) `foreach`
*Réponse: C*
