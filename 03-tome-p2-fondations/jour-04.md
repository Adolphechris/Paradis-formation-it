# TOME P2 — Jour 04 (12h) : Python — Du Zéro Absolu à la Programmation Professionnelle

> [!NOTE]
> **Objectif de la journée** : Apprendre à programmer en Python à partir de zéro. À la fin de ce cours, vous comprendrez comment un programme informatique "réfléchit", comment stocker des données dans des variables, prendre des décisions avec des conditions, et répéter des actions avec des boucles.

---

## 1) Qu'est-ce que la Programmation ? L'Art de Commander une Machine (1h)

### 📖 1.1 La Programmation Expliquée Sans Jargon

Imaginez que vous recrutez un stagiaire qui fait exactement ce que vous lui dites, mais qui ne comprend pas le contexte et ne prend aucune initiative. Vous devez lui expliquer **chaque étape** dans un ordre précis et sans ambiguïté.

C'est exactement ce qu'est la programmation : **écrire des instructions précises et séquentielles** qu'une machine exécute à la lettre.

Python est le langage parfait pour commencer car :
- Sa syntaxe ressemble presque à de l'anglais courant.
- Il est utilisé par Google, Instagram, Netflix, les banques centrales mondiales.
- Il excelle en automatisation, analyse de données et intelligence artificielle.

### 🛠️ 1.2 Installer et Lancer Python

```bash
# Vérifier si Python est installé
python3 --version
# Résultat attendu : Python 3.10.x ou supérieur

# Lancer l'interpréteur interactif (taper du code en temps réel)
python3

# Votre premier programme
>>> print("Bonjour Banque Centrale !")
Bonjour Banque Centrale !
>>> exit()  # Quitter l'interpréteur
```

---

## 2) Les Variables : La Mémoire de votre Programme (2h)

### 📖 2.1 Une Variable, c'est quoi ?

Une variable est comme une **boîte étiquetée** dans laquelle vous rangez une information. Vous donnez un nom à la boîte, vous y mettez une valeur, et vous pouvez la modifier ou la relire à tout moment.

```python
# Déclarer des variables (Python déduit le type automatiquement)
nom_agent = "Jean-Baptiste Mukendi"
age = 32
salaire = 850.50
est_admin = True

print(nom_agent)     # Jean-Baptiste Mukendi
print(age)           # 32
```

### 🔍 2.2 Les Types de Données Fondamentaux

| Type | Exemple | Description |
|------|---------|-------------|
| `str` (chaîne) | `"Banque Centrale"` | Texte |
| `int` (entier) | `42` | Nombre sans décimale |
| `float` (flottant) | `3.14` | Nombre avec décimale |
| `bool` (booléen) | `True / False` | Vrai ou Faux |
| `list` (liste) | `["Réseau", "Sécurité"]` | Collection ordonnée |
| `dict` (dictionnaire) | `{"nom": "Jean", "age": 32}` | Paires clé-valeur |

---

## 3) Les Conditions : La Prise de Décision (2h)

### 📖 3.1 L'instruction `if / elif / else`

Un programme doit pouvoir décider d'un comportement en fonction d'une situation. C'est le rôle des **conditions** :

```python
score_quiz = 82

if score_quiz >= 75:
    print("✅ Seuil atteint ! Passage au jour suivant déverrouillé.")
elif score_quiz >= 50:
    print("⚠️ Seuil non atteint. Révisez et repassez le test.")
else:
    print("❌ Score insuffisant. Relecture complète du cours recommandée.")
```

> [!IMPORTANT]
> L'indentation (les espaces en début de ligne) est **obligatoire** en Python. Elle définit les blocs de code. Une erreur d'indentation = programme qui plante.

---

## 4) Les Boucles : Automatiser la Répétition (2h)

### 📖 4.1 La boucle `for` — Parcourir une liste

```python
services_bcc = ["Réseau", "Sécurité", "Support", "Développement"]

for service in services_bcc:
    print(f"  ✔ Département IT : {service}")
```

### 📖 4.2 La boucle `while` — Répéter tant qu'une condition est vraie

```python
tentatives = 0

while tentatives < 3:
    mot_de_passe = input("Entrez le mot de passe : ")
    if mot_de_passe == "BCC2026!":
        print("✅ Accès autorisé.")
        break
    tentatives += 1
    print(f"❌ Mot de passe incorrect. Tentative {tentatives}/3")

if tentatives == 3:
    print("🔒 Compte bloqué après 3 tentatives.")
```

---

## 5) Projet Pratique : Gestionnaire de Tickets en Python (3h)

### 🎯 Application : Système de Tickets Support BCC

```python
# tickets-bcc.py — Gestionnaire de tickets d'assistance

tickets = []

def creer_ticket(agent, type_incident, description):
    ticket = {
        "id": len(tickets) + 1,
        "agent": agent,
        "type": type_incident,
        "description": description,
        "statut": "Ouvert"
    }
    tickets.append(ticket)
    print(f"✅ Ticket #{ticket['id']} créé pour {agent}")

def afficher_tickets():
    if not tickets:
        print("Aucun ticket ouvert.")
        return
    for t in tickets:
        print(f"[{t['statut']}] #{t['id']} | {t['agent']} | {t['type']}")

# Simulation
creer_ticket("Marie Bongo", "Réseau", "Pas d'accès Internet depuis 9h")
creer_ticket("Paul Kimba", "Imprimante", "Bourrage papier imprimante 3ème étage")
afficher_tickets()
```

---

## 🏋️ Exercices Pratiques & Corrigés

### Exercice 1 : Calculatrice de Score
Écrivez un programme qui demande un score à l'utilisateur et affiche s'il a réussi (≥75%), est à améliorer (≥50%) ou a échoué.
- **Corrigé** :
  ```python
  score = int(input("Entrez votre score (0-100) : "))
  if score >= 75:
      print("✅ Réussi - Jour suivant débloqué !")
  elif score >= 50:
      print("⚠️ À améliorer - Révisez et retentez")
  else:
      print("❌ Échec - Recommencez le cours depuis le début")
  ```

---

## ❓ Banque de Questions & Test du Jour 04

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
