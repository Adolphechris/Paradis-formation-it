# SEMESTRE 1 — Jour 04 (6h) : Gestion des Processus Linux & Ressources Système

> [!NOTE]
> **Objectif de la journée** : Maîtriser le cycle de vie des processus sous Linux, surveiller les ressources du système et savoir reprendre le contrôle d'une machine en surcharge.
> **Compétences visées** : `BIT-02` (Niveau Cible: A) — Gestion des processus et charge système Linux.

---

## 1) Anatomie d'un Processus et États (1h30)

### 📖 1.1 Narration & Intuition
Imaginez votre système Linux comme une usine gigantesque. Les programmes sur le disque sont des plans de construction (statiques). Lorsqu'on décide de construire, on embauche des ouvriers et on crée des lignes d'assemblage : ce sont les **processus**. Chaque ouvrier a un badge unique (le PID, Process ID) et un chef d'équipe (le PPID, Parent Process ID). Parfois, un ouvrier s'endort (état S), travaille d'arrache-pied (état R) ou devient un zombie car son chef l'a oublié (état Z).

### 🔍 1.2 Anatomie Technique
Un processus est une instance d'exécution d'un programme.
- **PID (Process ID)** : Identifiant unique du processus.
- **PPID (Parent Process ID)** : Identifiant du processus parent.
- **États (STAT)** :
  - `R` (Running) : En cours d'exécution.
  - `S` (Sleeping) : En attente d'un événement (ex: frappe au clavier).
  - `D` (Uninterruptible sleep) : En attente d'Entrée/Sortie matérielle (ex: disque).
  - `Z` (Zombie) : Terminé, mais le parent n'a pas récupéré son code de retour.

La commande `ps` permet de photographier l'état des processus. L'option `ps aux` est le standard absolu des administrateurs.
- `a` : Tous les processus (pas seulement ceux du terminal actuel).
- `u` : Format utilisateur (affiche l'utilisateur, CPU, mémoire).
- `x` : Inclure les processus sans terminal de contrôle (comme les démons).

### 🛠️ 1.3 Atelier Pratique Hands-on
```bash
# Afficher tous les processus avec détails
ps aux

# Chercher un processus spécifique (ex: sshd)
ps aux | grep sshd

# Afficher l'arbre des processus pour visualiser les relations parents/enfants
pstree -p
```

### 🚑 1.4 Diagnostic & Réflexes Terrain
- **Symptôme** : Beaucoup de processus "Z" (Zombies).
- **Réflexe** : Les zombies ne consomment pas de CPU/RAM mais encombrent la table des PIDs. Pour les éliminer, il faut relancer le processus parent (le PPID).

---

## 2) Surveillance en Temps Réel et Signaux (2h00)

### 📖 2.1 Narration & Intuition
Si `ps` est une photographie, `top` et `htop` sont des caméras de vidéosurveillance. Ils permettent d'observer l'usine en temps réel et d'intervenir. Si un ouvrier s'emballe et casse tout, le manager (vous) doit envoyer un signal. Il existe le signal diplomatique ("Arrête ce que tu fais proprement", SIGTERM) et le coup de fusil à pompe ("Mort immédiate, pose tout", SIGKILL). 

### 🔍 2.2 Anatomie Technique
- **`top`** : Outil natif interactif de suivi système.
- **`htop`** : Version améliorée, plus colorée et ergonomique (nécessite souvent une installation).
- **Les Signaux (kill)** : Ce sont des messages asynchrones envoyés aux processus.
  - `15 (SIGTERM)` : Terminaison propre (par défaut). Le processus a le temps de sauvegarder et fermer ses fichiers.
  - `9 (SIGKILL)` : Terminaison brutale. Géré par le noyau, le processus ne peut ni l'ignorer ni se nettoyer. 
  - `kill <PID>` : Envoie le signal 15 par défaut.
  - `kill -9 <PID>` : Envoie le signal 9.
  - `pkill <nom_programme>` : Tue par nom de programme au lieu du PID.

### 🛠️ 2.3 Atelier Pratique Hands-on
```bash
# Lancer un processus bidon en arrière-plan (une boucle infinie)
bash -c 'while true; do true; done' &

# Récupérer son PID (sera affiché lors de la création, ex: [1] 12345)
# Observer avec top
top
# (Appuyez sur 'q' pour quitter top)

# Tuer le processus proprement
kill 12345

# Tuer tous les processus du même nom (attention !)
pkill firefox
```

### 🚑 2.4 Diagnostic & Réflexes Terrain
- **Panne** : Un processus refuse de s'arrêter avec `kill <PID>`.
- **Réflexe** : Le processus est coincé (peut-être en état 'D'). Utilisez `kill -9 <PID>`. N'utilisez `SIGKILL` qu'en dernier recours, car il peut corrompre des données.

---

## 3) Gestion des Tâches en Arrière-plan (Job Control) (1h30)

### 📖 3.1 Narration & Intuition
Parfois, vous lancez une tâche qui prend beaucoup de temps (comme un téléchargement ou une sauvegarde) et vous voulez récupérer votre terminal pour faire autre chose. Au lieu d'ouvrir 10 terminaux, le Shell permet de jongler en mettant des tâches au "second plan" (background) et de les rappeler au "premier plan" (foreground) à volonté.

### 🔍 3.2 Anatomie Technique
- **`&`** : Ajouté à la fin d'une commande, il lance la commande en arrière-plan.
- **`Ctrl+Z`** : Suspend (état T - Stopped) le processus en cours au premier plan.
- **`jobs`** : Liste les tâches rattachées au terminal actuel.
- **`bg %<ID>` (background)** : Reprend l'exécution d'une tâche suspendue, mais en arrière-plan.
- **`fg %<ID>` (foreground)** : Ramène une tâche de l'arrière-plan vers le premier plan.

### 🛠️ 3.3 Atelier Pratique Hands-on
```bash
# Lancer une commande longue (pause de 60s) au premier plan
sleep 60
# Appuyer sur Ctrl+Z pour la suspendre
# Le terminal affiche : [1]+  Stopped                 sleep 60

# Relancer en arrière-plan
bg %1

# Lister les jobs actifs
jobs

# Ramener au premier plan
fg %1
# Attendre la fin ou utiliser Ctrl+C pour interrompre
```

### 🚑 3.4 Diagnostic & Réflexes Terrain
- **Symptôme** : "There are stopped jobs" s'affiche quand on essaie de fermer le terminal (exit).
- **Réflexe** : Tapez `jobs`, identifiez la tâche arrêtée. Si elle ne sert plus, ramenez-la avec `fg` et tuez-la avec `Ctrl+C`, ou utilisez `kill %1` pour tuer le job n°1.

---

## 🏧️ Exercices Pratiques (Preuves de Portfolio)

### Exercice 1 : Chasseur de Zombies
- **Consigne** : Identifiez le processus le plus consommateur en CPU, déterminez son parent, et tuez le processus gourmand en forçant l'arrêt de manière brutale.
- **Livrables à produire** : Capture d'écran montrant l'utilisation de `ps` ou `top`, et les commandes `kill` exécutées.
- **Corrigé détaillé & Guidé** :
```bash
# 1. Identifier le processus le plus gourmand
top
# Repérer le PID sous la colonne PID (ex: 4567)
# Appuyer sur 'q'

# 2. Identifier le parent du PID 4567
ps -o ppid= -p 4567

# 3. Tuer le processus brutalement
kill -9 4567
```

---

## ❓ Banque de Questions QCM (Évaluation 75% minimum)

1. QCM: Quelle commande affiche les processus de tous les utilisateurs avec des informations détaillées ?
   A) ps -d
   B) ps aux
   C) top -a
   D) pstree -all
   **Réponse : B**

2. QCM: Que signifie l'état "Z" dans la colonne STAT de `ps` ?
   A) Zippé
   B) Zone protégée
   C) Zombie
   D) Zero memory
   **Réponse : C**

3. QCM: Quel signal est envoyé par défaut lorsqu'on utilise la commande `kill` sans option ?
   A) 1 (SIGHUP)
   B) 9 (SIGKILL)
   C) 15 (SIGTERM)
   D) 19 (SIGSTOP)
   **Réponse : C**

4. QCM: Comment suspendre une tâche en cours d'exécution dans le terminal ?
   A) Ctrl+C
   B) Ctrl+D
   C) Ctrl+Z
   D) Alt+S
   **Réponse : C**

5. QCM: Quelle commande permet de relancer en arrière-plan une tâche suspendue ?
   A) fg
   B) back
   C) bg
   D) jobs
   **Réponse : C**
