# TOME P2 — Jour 05 (12h) : Python Intermédiaire — Fonctions, Modules, Fichiers & POO

> [!NOTE]
> **Objectif de la journée** : Passer de l'écriture de scripts simples à la création de programmes structurés et réutilisables. Vous apprendrez à organiser votre code en fonctions, à lire et écrire des fichiers, à gérer les erreurs et à découvrir les bases de la Programmation Orientée Objet (POO).

---

## 1) Les Fonctions : Créer des Blocs de Code Réutilisables (2h)

### 📖 1.1 Pourquoi les Fonctions ?

Imaginez devoir calculer la TVA de 500 produits différents. Vous n'allez pas réécrire le même calcul 500 fois. Vous créez **une fois** la recette de calcul (la fonction) et vous l'appelez autant de fois que nécessaire.

```python
# Définition de la fonction
def calculer_tva(prix_ht, taux=0.16):
    """Calcule le prix TTC avec TVA. Taux par défaut : 16%"""
    tva = prix_ht * taux
    prix_ttc = prix_ht + tva
    return prix_ttc

# Appel de la fonction
facture_imprimante = calculer_tva(500)
facture_serveur = calculer_tva(8000, 0.20)

print(f"Imprimante TTC : {facture_imprimante} USD")  # 580.0 USD
print(f"Serveur TTC : {facture_serveur} USD")         # 9600.0 USD
```

### 🔍 1.2 Anatomie d'une Fonction Python

```python
def nom_de_la_fonction(parametre1, parametre2="valeur_par_défaut"):
    # Corps de la fonction (indenté)
    resultat = parametre1 + parametre2
    return resultat   # Valeur retournée à l'appelant
```

---

## 2) Gestion des Erreurs & Exceptions (2h)

### 📖 2.1 Un Programme Robuste Anticipe les Pannes

Un bon programme ne plante pas face à une donnée incorrecte. Il **anticipe** les cas d'erreur et réagit de manière contrôlée.

```python
def ouvrir_ticket(agent_id):
    try:
        # Tenter l'opération risquée
        id_numerique = int(agent_id)
        print(f"Ticket ouvert pour l'agent #{id_numerique}")
        return id_numerique

    except ValueError:
        # Capturé si agent_id n'est pas un nombre
        print(f"❌ Erreur : '{agent_id}' n'est pas un identifiant valide.")
        return None

    except Exception as e:
        # Capturer toute autre erreur inattendue
        print(f"❌ Erreur inattendue : {e}")
        return None

    finally:
        # Toujours exécuté, même en cas d'erreur
        print("Traitement de la demande terminé.")

# Tests
ouvrir_ticket("1042")      # ✅ Fonctionne
ouvrir_ticket("ABC-ERR")   # ❌ ValueError géré proprement
```

---

## 3) Lire et Écrire des Fichiers (2h)

### 📖 3.1 Persister des Données dans des Fichiers

Un programme qui ne sauvegarde rien perd toutes ses données à l'arrêt. La gestion de fichiers permet de **persister les informations entre deux exécutions**.

```python
# Écrire dans un fichier (crée le fichier si inexistant)
with open("incidents.log", "w", encoding="utf-8") as fichier:
    fichier.write("2026-07-30 09:15 | Réseau | BCC-Siège | Panne DHCP\n")
    fichier.write("2026-07-30 10:22 | Imprimante | BCC-Annexe | Toner vide\n")

# Lire un fichier ligne par ligne
with open("incidents.log", "r", encoding="utf-8") as fichier:
    for ligne in fichier:
        print(ligne.strip())  # .strip() enlève le '\n' en fin de ligne

# Ajouter sans effacer (mode 'a' = append)
with open("incidents.log", "a", encoding="utf-8") as fichier:
    fichier.write("2026-07-30 14:05 | Sécurité | BCC-Siège | Tentative d'accès non autorisé\n")
```

> [!TIP]
> L'instruction `with open(...) as fichier:` ferme automatiquement le fichier même si une erreur survient. C'est la manière professionnelle de travailler avec les fichiers en Python.

---

## 4) Introduction à la POO — Programmation Orientée Objet (3h)

### 📖 4.1 Penser en Objets : La Révolution Conceptuelle

La POO consiste à modéliser le monde réel sous forme d'**objets** qui ont des **attributs** (caractéristiques) et des **méthodes** (actions).

Exemple : Un `TicketSupport` a des attributs (`numéro`, `agent`, `statut`) et des méthodes (`ouvrir()`, `fermer()`, `escalader()`).

```python
class TicketSupport:
    """Représente un ticket d'incident dans le système BCC."""

    def __init__(self, agent, type_incident, description):
        """Constructeur : appelé à la création de chaque objet."""
        self.id = TicketSupport._prochain_id
        TicketSupport._prochain_id += 1
        self.agent = agent
        self.type = type_incident
        self.description = description
        self.statut = "Ouvert"

    _prochain_id = 1  # Compteur de classe partagé entre toutes les instances

    def escalader(self):
        self.statut = "Escaladé - Niveau 2"
        print(f"⚠️ Ticket #{self.id} escaladé au support de niveau 2.")

    def fermer(self, resolution):
        self.statut = "Fermé"
        print(f"✅ Ticket #{self.id} fermé. Résolution : {resolution}")

    def afficher(self):
        print(f"[{self.statut}] Ticket #{self.id} | {self.agent} | {self.type}")
        print(f"   Description : {self.description}")


# Utilisation
t1 = TicketSupport("Marie Bongo", "Réseau", "Pas d'Internet depuis 9h")
t2 = TicketSupport("Paul Kimba", "Compte", "Impossible de se connecter à l'ERP")

t1.afficher()
t2.escalader()
t1.fermer("Redémarrage du routeur de distribution")
```

---

## 5) Modules Python : Importer des Bibliothèques (1h)

### 📖 5.1 Ne Pas Réinventer la Roue

Python dispose d'une bibliothèque standard immense et d'un écosystème de modules tiers. Au lieu de tout coder soi-même, on importe des modules existants.

```python
import os          # Interagir avec le système d'exploitation
import datetime    # Gérer dates et heures
import json        # Lire et écrire du format JSON (données web)

# Exemple : Créer un rapport automatique
maintenant = datetime.datetime.now()
rapport = {
    "date_rapport": maintenant.strftime("%Y-%m-%d %H:%M"),
    "total_tickets_ouverts": 12,
    "incidents_critiques": 2
}

with open("rapport_quotidien.json", "w") as f:
    json.dump(rapport, f, indent=4, ensure_ascii=False)

print(f"Rapport généré le {rapport['date_rapport']}")
```

---

## 🏋️ Exercices Pratiques & Corrigés

### Exercice 1 : Fonction de Validation
Écrivez une fonction `valider_email_bcc(email)` qui retourne `True` si l'email se termine par `@bcc.cd`, sinon `False`.
- **Corrigé** :
  ```python
  def valider_email_bcc(email):
      return email.strip().lower().endswith("@bcc.cd")

  print(valider_email_bcc("j.mukendi@bcc.cd"))  # True
  print(valider_email_bcc("gmail@gmail.com"))    # False
  ```

---

## ❓ Banque de Questions & Test du Jour 05

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
