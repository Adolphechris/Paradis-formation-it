# SEMESTRE 1 — Jour 19 (6h) : Scripting Bash — Fonctions, Gestion d'Erreurs & Cron

> [!NOTE]
> **Objectif de la journée** : Structurer le code pour la maintenabilité (fonctions), le blindage contre les pannes (erreurs), et le rendre autonome (planification temporelle).
> **Compétences visées** : `BIT-05` (Niveau Cible: A), `POL-05` (A) — Fonctions Bash et automatisation Cron.

---

## 1) Définition et appel de Fonctions Bash (1h30)

### 📖 1.1 Narration & Intuition
Copier-coller le même code cinq fois dans un script est le péché capital du développeur (principe DRY : Don't Repeat Yourself). Une fonction encapsule un bout de logique sous un nom clair pour l'appeler à volonté. C'est comme créer vos propres mini-commandes Linux.

### 🔍 1.2 Anatomie Technique
Il existe deux syntaxes, mais la plus lisible est celle avec le mot-clé `function`.
En Bash, les fonctions ne prennent pas de paramètres entre parenthèses. Elles lisent les arguments avec `$1, $2, $3` comme le script principal.
Le mot-clé `local` est crucial : il empêche une variable de fuiter et d'écraser le reste du script.

### 🛠️ 1.3 Atelier Pratique Hands-on
```bash
#!/bin/bash

# Définition de la fonction
function afficher_log() {
    local MESSAGE="$1"
    local NIVEAU="$2"
    local HORODATAGE=$(date +"%Y-%m-%d %H:%M:%S")
    echo "[$HORODATAGE] [$NIVEAU] - $MESSAGE"
}

# Appels de la fonction
afficher_log "Démarrage du backup" "INFO"
afficher_log "Fichier /etc/shadow inaccessible" "ERROR"
```

### 🚑 1.4 Diagnostic & Réflexes Terrain
- **Oubli de `local`** : En Bash, par défaut, TOUTES les variables sont globales. Si vous utilisez un compteur `i` dans une fonction sans le déclarer `local`, il écrasera le compteur `i` de votre boucle principale. Toujours utiliser `local VARIABLE="valeur"`.

---

## 2) Gestion Rigoureuse des Erreurs (1h30)

### 📖 2.1 Narration & Intuition
Un script bash "normal" a un comportement suicidaire : si une commande plante à la ligne 5, il continue aveuglément à la ligne 6. Si la ligne 5 devait créer un dossier et la ligne 6 supprimer son contenu... c'est la catastrophe. Il faut "durcir" le script.

### 🔍 2.2 Anatomie Technique
On utilise le "Mode Strict" Bash avec `set`.
- `set -e` : Arrête le script immédiatement si une commande échoue (renvoie autre chose que 0).
- `set -u` : Arrête le script si une variable non définie est utilisée.
- `set -o pipefail` : Dans un pipe `cat file | grep x`, si `cat` échoue, l'erreur est propagée.
- `trap` : Intercepte les signaux (comme CTRL+C ou la fin d'un script) pour faire le ménage (supprimer des fichiers temporaires).

### 🛠️ 2.3 Atelier Pratique Hands-on
```bash
#!/bin/bash
set -euo pipefail

# Nettoyage automatique à la sortie (réussie ou erreur)
FICHIER_TEMP=$(mktemp)
trap 'rm -f "$FICHIER_TEMP"; echo "Nettoyage terminé."' EXIT

echo "Téléchargement critique en cours..." > "$FICHIER_TEMP"

# Ceci provoquera une erreur car la variable N_EXISTE_PAS n'est pas définie (grâce à -u)
# Le script s'arrêtera avant le 'echo' de succès, et le trap s'exécutera quand même.
echo $N_EXISTE_PAS

echo "Succès du script !"
```

### 🚑 2.4 Diagnostic & Réflexes Terrain
- **Faux positifs avec `set -e`** : Parfois, vous *voulez* qu'une commande échoue silencieusement (ex: un `grep` qui ne trouve rien). Dans ce cas, forcez le succès avec `|| true` : `grep "erreur" logs.txt || true`.

---

## 3) Automatisation par Planificateur (Cron) (2h00)

### 📖 3.1 Narration & Intuition
Un script parfait qui doit être lancé manuellement tous les matins à 3h est un script inutile pour l'IT. Le démon `cron` est l'horloge interne de Linux. Il lance des tâches en arrière-plan avec une précision chirurgicale selon une grille horaire.

### 🔍 3.2 Anatomie Technique
On édite la table de planification de l'utilisateur avec `crontab -e`.
La syntaxe comprend 5 champs temporels suivis de la commande :
`MIN HEURE JOUR_MOIS MOIS JOUR_SEMAINE commande`
L'astérisque `*` signifie "chaque". `*/5` signifie "tous les 5".

### 🛠️ 3.3 Atelier Pratique Hands-on
```bash
# Ouvrez l'éditeur
crontab -e

# Ajoutez ces lignes :
# Lancer le script de backup tous les jours à 2h30 du matin
30 2 * * * /opt/scripts/backup.sh >> /var/log/backup.log 2>&1

# Ping un serveur toutes les 5 minutes
*/5 * * * * ping -c 1 192.168.1.100 > /dev/null
```

### 🚑 3.4 Diagnostic & Réflexes Terrain
- **Problème de PATH** : Cron exécute avec un environnement minimaliste. Le `$PATH` n'est pas le même que le vôtre. Utilisez TOUJOURS des chemins absolus (ex: `/usr/bin/python3` ou `/opt/monscript.sh`).
- **Où va l'affichage ?** Cron envoie par défaut la sortie standard par e-mail local. Il faut rediriger l'output `>> /var/log/cron.log 2>&1`.

---

## 📚 Nouvelles abréviations rencontrées
- **DRY**: Don't Repeat Yourself.
- **CRON**: Command Run ON (parfois attribué au temps chronos).

---

## 🏧️ Exercices Pratiques (Preuves de Portfolio)

### Exercice 1 : Nettoyeur Auto avec Trap et Cron
- **Consigne** : Écrivez un script `clean_tmp.sh` avec le mode strict. Le script crée un fichier de log avec une fonction `log_info`. Il supprime les fichiers de `/tmp/` plus vieux de 7 jours (`find /tmp -type f -mtime +7 -exec rm {} \;`). Utilisez un `trap` pour logguer la fin de l'exécution.
- **Livrables à produire** : Le script et la ligne crontab pour le lancer chaque dimanche à minuit.
- **Corrigé détaillé & Guidé** :
```bash
#!/bin/bash
set -euo pipefail

LOG_FILE="/var/log/clean_tmp.log"

function log_info() {
    local MESSAGE="$1"
    echo "$(date +'%Y-%m-%d %H:%M:%S') - $MESSAGE" >> "$LOG_FILE"
}

trap 'log_info "Fin de l exécution du nettoyage."' EXIT

log_info "Début du nettoyage des fichiers temporaires."
find /tmp -type f -mtime +7 -delete
log_info "Nettoyage réussi."
```

Ligne Crontab :
```bash
0 0 * * 0 /chemin/vers/clean_tmp.sh
```

---

## ❓ Banque de Questions QCM (Évaluation 75% minimum)
1. QCM: En Bash, comment passe-t-on le premier argument à une fonction appelée `calculer` ?
A) `calculer($1)`
B) `calculer -arg1`
C) `calculer argument1`
D) `call calculer(argument1)`
*Réponse: C*

2. QCM: Pourquoi utilise-t-on le mot-clé `local` dans une fonction Bash ?
A) Pour limiter l'usage réseau.
B) Pour empêcher une variable de modifier une variable de même nom dans le script principal.
C) Pour la rendre accessible uniquement à l'utilisateur root.
D) Pour accélérer le script.
*Réponse: B*

3. QCM: Que fait la commande `set -e` ?
A) Elle exporte toutes les variables.
B) Elle exécute le script en arrière-plan.
C) Elle arrête immédiatement le script si une commande échoue.
D) Elle efface l'écran (echo).
*Réponse: C*

4. QCM: Dans la crontab `*/15 * * * * commande`, à quelle fréquence la commande s'exécute-t-elle ?
A) Tous les jours à 15h.
B) Le 15 de chaque mois.
C) Toutes les 15 minutes.
D) 15 fois par jour.
*Réponse: C*

5. QCM: Quelle instruction permet d'intercepter la fermeture inattendue du script pour nettoyer des fichiers ?
A) `catch`
B) `trap`
C) `clean`
D) `finally`
*Réponse: B*
