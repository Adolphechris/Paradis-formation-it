# Jour J0G — Comment Fonctionne un Programme Informatique ?

> [!NOTE]
> **SEMESTRE 0 — PARCOURS D'INITIATION ET SOCLE DE PRÉ-REQUIS ABSOLUS (J0a–J0o)**  
> Cette leçon explique le voyage complet d'un programme informatique : de l'écriture du code source texte par un humain jusqu'à sa transformation et son exécution en mémoire par le processeur.

---

## 🎯 Objectifs de la Leçon

- 🧠 Définir la notion d'**Algorithme**, de **Code Source** et de **Processus**.
- ⚙️ Distinguer les langages **compilés** (C, Go, Rust), **interprétés** (Python, Bash) et **JIT** (JavaScript, Java).
- 🏗️ Comprendre la structure mémoire d'un programme en exécution (Stack, Heap, Code, Data).
- 🔗 Découvrir le rôle du **Compilateur**, du **Linker** (Éditeur de liens) et des **Bibliothèques partagées (`.so`)**.
- 🐞 Identifier les différents types d'erreurs (Syntaxe, Runtime, Logique) et gérer les **Exit Codes**.
- 🧪 Fabriquer, compiler et exécuter des programmes en Bash, Python et C dans le terminal Linux.

---

## 🖼️ Logique de Programmation & Exécution

![Code & Programmation](https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800)

---

## 📖 1. Qu'est-ce qu'un Algorithme et un Programme ?

### 1.1 L'Algorithme : La Recette de Cuisine Logique

Un **algorithme** est une suite d'instructions étape par étape, finie, déterministe et non ambiguë, permettant de résoudre un problème donné ou d'accomplir une tâche.

Analogie de la Cuisine :
> Une recette de gâteau au chocolat est un algorithme :
> 1. Entrées (*Inputs*) : 3 œufs, 100g de farine, 200g de chocolat.
> 2. Traitement (*Processing*) : Fondre le chocolat, mélanger avec les œufs et la farine pendant 3 minutes.
> 3. Cuisson (*Execution*) : Cuire au four à 180°C pendant 20 minutes.
> 4. Sortie (*Output*) : Le gâteau prêt à être dégusté.

### 1.2 Le Programme : L'Algorithme Traduit en Code

Un **programme informatique** est la concrétisation d'un algorithme rédigée dans un **langage de programmation** lisible par un être humain (Python, C, Bash, Go). 

Puisque le processeur (CPU) ne comprend que le système binaire (`0` et `1`), ce code source doit obligatoirement être traduit en **langage machine (Instructions binaire ASM)** pour être exécuté.

```
┌─────────────────┐      Traduction       ┌─────────────────┐      Chargement     ┌─────────────────┐
│   CODE SOURCE   │ ────────────────────► │ BINAIR / BYTECODE│ ─────────────────► │    PROCESSUS    │
│  (Texte lisible)│   (Compilateur ou     │ (Instructions 0/1│    Appel système  │   (Exécution   │
│   ex: main.py   │    Interpréteur)      │  ou Bytecode)   │    execve()       │    en RAM)      │
└─────────────────┘                       └─────────────────┘                     └─────────────────┘
```

---

## 📖 2. Langages Compilés vs Interprétés vs JIT

Les langages de programmation se divisent en 3 grandes familles de traduction :

```
1. LANGAGES COMPILÉS (C, C++, Go, Rust)
   Code Source (.c/.go)  ──► [ Compilateur (gcc/go) ] ──► Binaire ELF Exécutable ──► CPU (Ultra Rapide)
   - Traduction intégrale UNE FOIS pour toutes AVANT l'exécution.
   - Binaire autonome, vitesse maximale, accès direct au matériel.

2. LANGAGES INTERPRÉTÉS / SCRIPTING (Bash, Python, Ruby, PHP)
   Code Source (.py/.sh) ──► [ Interpréteur (python3/bash) ] ──► Traduction ligne par ligne ──► CPU
   - Traduction à la volée pendant l'exécution.
   - Développement très rapide, écriture lisible, mais exécution légèrement plus lente.

3. LANGAGES HYBRIDES / JIT (Java, C#, JavaScript Node.js)
   Code Source (.java)   ──► [ Compilateur Bytecode ] ──► Bytecode (.class) ──► [ JVM / V8 Engine ] ──► CPU
   - Traduit d'abord en code intermédiaire (Bytecode), puis compilé "Just-In-Time" (JIT) en binaire par la machine virtuelle.
```

### Tableau Comparatif des Langages Majeurs en IT & Cybersécurité :

| Langage | Type | Vitesse | Cas d'Usage Principaux en IT |
| :--- | :--- | :--- | :--- |
| **C / C++** | Compilé | ⚡⚡⚡ Maximal | Noyau Linux, Drivers, Moteurs 3D, Exploits de sécurité |
| **Go (Golang)** | Compilé | ⚡⚡⚡ Ultra rapide | Docker, Kubernetes, Terraform, Outils DevOps modernes |
| **Rust** | Compilé | ⚡⚡⚡ Maximal + Sécurisé| Développement système moderne, Sécurité mémoire (Mozilla) |
| **Python** | Interprété | ⚡ Modéré | Scripting, Cybersécurité, Data Science, IA, Automatisations |
| **Bash** | Interprété | ⚡ Modéré | Scripts d'administration système Linux et pipelines CI/CD |

---

## 📖 3. Que Se Passe-t-il en Mémoire RAM quand un Programme s'Exécute ?

Lorsqu'un programme est exécuté (par exemple quand vous tapez `./mon_programme` dans le terminal), le noyau Linux crée un **Processus** et lui attribue une structure de mémoire RAM isolée découpée en 5 zones :

```
  ADRESSES HAUTES (0xFFFFFFFF)
  ┌─────────────────────────────────────────────────────────┐
  │ 1. STACK (La Pile d'Appel)                              │
  │    - Stocke les variables locales des fonctions          │
  │    - Grandit vers le bas de la mémoire                  │
  ├─────────────────────────────────────────────────────────┤
  │    ▲                                                    │
  │    │  Espace mémoire libre intermédiaire                │
  │    │                                                    │
  ├─────────────────────────────────────────────────────────┤
  │ 2. HEAP (Le Tas)                                        │
  │    - Mémoire dynamique allouée à la demande (malloc)    │
  │    - Grandit vers le haut de la mémoire                 │
  ├─────────────────────────────────────────────────────────┤
  │ 3. BSS & DATA                                           │
  │    - Stocke les variables globales et constantes        │
  ├─────────────────────────────────────────────────────────┤
  │ 4. TEXT (Code Binaire Exécutable)                       │
  │    - Contient les instructions ASM lues par le CPU      │
  │    - Zone protégée en Lecture Seule                     │
  └─────────────────────────────────────────────────────────┘
  ADRESSES BASES (0x00000000)
```

- **Le Segment Text** : Contient les vraies instructions binaires exécutées par le CPU.
- **La Stack (La Pile)** : Zone ultra-rapide organisée en LIFO (*Last In, First Out*) qui garde la trace des fonctions en cours et de leurs variables locales.

---

## 📖 4. Les Différents Types d'Erreurs & Les Exit Codes

En programmation et scripting IT, vous rencontrerez 3 catégories d'erreurs :

1. **Erreurs de Syntaxe (Syntax Errors / Compile Errors)** : Vous avez mal orthographié une commande ou oublié une parenthèse. Le compilateur ou l'interpréteur **refuse de lancer le programme**.
2. **Erreurs à l'Exécution (Runtime Errors)** : Le code est valide, mais une opération impossible survient au cours de l'exécution (ex: division par zéro, fichier introuvable, connexion réseau coupée). Le programme **plante au milieu**.
3. **Erreurs de Logique (Logical Bugs)** : Le programme s'exécute sans planter, mais donne un **mauvais résultat** (ex: calculer des taxes négatives).

### Le Code de Sortie (Exit Code / Status Code)

Lorsque tout programme ou commande sous Linux termine son exécution, il renvoie au système un numéro entier appelé **Exit Code** (accessible via `echo $?`) :

- **Exit Code `0`** : **Succès absolu**. La commande s'est déroulée sans aucune erreur.
- **Exit Code `1 à 255`** : **Erreur**. Chaque chiffre indique une cause de panne (ex: `1` pour erreur générale, `2` pour mauvaise utilisation, `127` pour commande introuvable, `130` pour interruption par `Ctrl+C`).

---

## 🧪 Atelier Pratique : Créer et Compiler des Programmes sous Linux

Réalisons 3 exercices complets pour manipuler du Bash, du Python et du C dans votre terminal :

### Exercice 1 : Écrire et Exécuter un Script Bash Pro

```bash
# 1. Créer le fichier du script avec le Shebang (#!/bin/bash)
cat > ~/script_demo.sh << 'EOF'
#!/bin/bash
# Mon premier script d'administration
echo "=== AUDIT SYSTÈME FAST ==="
echo "Utilisateur connecté : $(whoami)"
echo "Date actuelle        : $(date)"
echo "Repertoire de travail: $(pwd)"
EOF

# 2. Rendre le script exécutable (chmod +x)
chmod +x ~/script_demo.sh

# 3. Lancer le script
~/script_demo.sh

# 4. Vérifier son Exit Code
echo "Code de retour : $?"
# Output attendu: Code de retour : 0
```

### Exercice 2 : Écrire un Programme Python Recevant des Arguments

```bash
# 1. Créer le script Python
cat > ~/calcul.py << 'EOF'
import sys

if len(sys.argv) < 3:
    print("Usage: python3 calcul.py <nombre1> <nombre2>")
    sys.exit(1)

n1 = float(sys.argv[1])
n2 = float(sys.argv[2])
resultat = n1 * n2
print(f"Résultat de la multiplication : {resultat}")
sys.exit(0)
EOF

# 2. Tester l'exécution Python
python3 ~/calcul.py 12.5 4
# Output attendu: Résultat de la multiplication : 50.0
```

### Exercice 3 : Compiler son Premier Programme en Langage C

```bash
# 1. Rédiger le code source C
cat > ~/hello.c << 'EOF'
#include <stdio.h>

int main() {
    printf("Hello PARADIS IT ! Programme C compilé sous Linux.\n");
    return 0;
}
EOF

# 2. Compiler avec le compilateur GCC pour générer un binaire binaire ELF
gcc ~/hello.c -o ~/hello_binaire

# 3. Inspecter le type de fichier généré (Binaire ELF x86-64)
file ~/hello_binaire
# Output attendu: /home/.../hello_binaire: ELF 64-bit LSB executable, x86-64...

# 4. Exécuter le binaire compilé
~/hello_binaire
# Output attendu: Hello PARADIS IT ! Programme C compilé sous Linux.
```

---

## 🛠️ Diagnostics & Réflexes Terrain

### 1. Problème de Shebang Invalide : `bash: ./script.sh: /bin/bash^M: bad interpreter`
- **Cause** : Le script a été modifié ou créé sous Windows avec des fins de lignes au format CRLF (`\r\n`). Linux utilise des fins de lignes au format LF (`\n`). Le caractère invisible `^M` perturbe l'interpréteur.
- **Réflexe** : Convertissez les fins de ligne au format Unix avec la commande **`dos2unix ./script.sh`**.

### 2. Le script ne s'exécute pas : `bash: ./script.sh: Permission denied`
- **Cause** : Le fichier possède le bon code, mais l'option d'exécution (`x`) n'a pas été attribuée dans le système de fichiers.
- **Réflexe** : Ajoutez le bit d'exécution avec **`chmod +x ./script.sh`**.

### 3. Traquer la cause d'une panne avec le code de sortie
- **Réflexe** : Dans tout script Bash de production, commencez toujours par l'option `set -e` pour forcer le script à s'arrêter immédiatement dès qu'une commande renvoie un code de sortie d'erreur (non-zéro).

---

## ❓ Banque de QCM & Test du Jour (8 Questions)

**Q1 : Qu'est-ce qu'un algorithme en informatique ?**
- A) Un binaire exécutable préinstallé dans le processeur
- B) Une suite d'instructions étape par étape, finie et non ambiguë, permettant de résoudre un problème
- C) Une erreur de mémoire RAM
- D) Un câble de fibre optique

*Réponse : B — Un algorithme est la description logique de la séquence d'instructions à exécuter.*

**Q2 : Quelle est la différence majeure entre un langage compilé (C, Go) et un langage interprété (Python, Bash) ?**
- A) Le langage compilé est traduit intégralement une fois pour toutes en binaire exécutable avant l'exécution, tandis que le langage interprété est traduit ligne par ligne à la volée
- B) Les langages interprétés ne fonctionnent pas sous Linux
- C) Les langages compilés sont écrits exclusivement en majuscules
- D) Il n'y a aucune différence de performance

*Réponse : A — La compilation produit un binaire natif avant l'exécution, garantissant des performances maximales.*

**Q3 : Quel format binaire exécutable est le standard universel utilisé par le noyau Linux (l'équivalent du .exe sous Windows) ?**
- A) Formate PE
- B) Format ELF (Executable and Linkable Format)
- C) Format APK
- D) Format DOCX

*Réponse : B — ELF (Executable and Linkable Format) est le format binaire standard sous Linux.*

**Q4 : Que signifie un Exit Code de `0` renvoyé à la fin de l'exécution d'une commande Linux ?**
- A) La commande a échoué avec une erreur critique
- B) La commande s'est déroulée avec succès sans aucune erreur
- C) Le fichier a été supprimé
- D) Le processeur s'est arrêté

*Réponse : B — En convention Unix, l'Exit Code 0 indique le succès parfait d'une exécution.*

**Q5 : Quelle zone de la mémoire d'un processus en RAM (Stack vs Heap) est utilisée pour stocker dynamiquement les données volumineuses allouées à la demande (ex: via `malloc`) ?**
- A) La Stack (La Pile)
- B) Le Heap (Le Tas)
- C) Le BIOS
- D) Le registre CPU

*Réponse : B — Le Heap (Le Tas) est l'espace réservé aux allocations de mémoire dynamique.*

**Q6 : À quoi sert la toute première ligne `#!/bin/bash` située au sommet d'un script Linux (le Shebang) ?**
- A) À afficher un commentaire d'auteur
- B) À indiquer au noyau quel interpréteur utiliser pour exécuter le fichier
- C) À effacer le terminal
- D) À crypter le script

*Réponse : B — Le Shebang (`#!`) indique au système le chemin de l'interpréteur qui doit lire le script (ex: `/bin/bash` ou `/usr/bin/python3`).*

**Q7 : Quel compilateur standard est utilisé sous Linux pour transformer du code C en fichier binaire exécutable ?**
- A) `pip`
- B) `gcc` (GNU Compiler Collection)
- C) `apt`
- D) `npm`

*Réponse : B — `gcc` est le compilateur C/C++ historique et de référence du monde GNU/Linux.*

**Q8 : Quel type d'erreur se produit lorsqu'un programme s'exécute sans planter mais donne un résultat incorrect ?**
- A) Erreur de syntaxe
- B) Erreur de compilation
- C) Erreur de logique (Logical Bug)
- D) Erreur de disque dur

*Réponse : C — Une erreur de logique est une faille dans la conception de l'algorithme lui-même.*

---

## 📚 Ressources & Références

- **GNU Compiler Collection (GCC) Documentation** : https://gcc.gnu.org/onlinedocs/
- **Python Official Documentation** : https://docs.python.org/3/
- **The Linux Programming Interface (Michael Kerrisk)** — L'ouvrage de référence absolu sur l'API système Linux.

---

*Semestre 0 — Module d'Initiation & Pré-requis Absolus PARADIS IT Masterclass*
