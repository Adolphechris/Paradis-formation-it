# TOME P6 — Cybersécurité Expert & Red Team Avancé — Jour 273 (6h) : Privacy Engineering & Data Protection (Differential Privacy PyDP, k-Anonymity, Synthetic Data SDV & Conformité RGPD/CCPA)

> [!NOTE]
> **Objectif du jour :** Maîtriser le **Privacy Engineering** et les techniques de protection formelle des données personnelles (Privacy-by-Design) ciblées par les certifications **CIPP/E** et **CIPM** : appliquer le modèle de **k-Anonymity**, mettre en œuvre la **Confidentialité Différentielle (Differential Privacy)** avec **Google PyDP**, générer des données synthétiques anonymisées avec **SDV (Synthetic Data Vault)**, et automatiser la conformité aux articles du **RGPD** et du **CCPA**.
>
> **Compétences visées :** `PRIV-01` (A) — Differential Privacy & k-Anonymity Implementation | `PRIV-02` (A) — Synthetic Data Generation & GDPR Privacy-by-Design

---

## 1) Module — Modèles d'Anonymisation Formelle (k-Anonymity, l-Diversity) (2h)

### 📖 Narration/Intuition

La simple suppression du nom et de l'adresse IP d'une base de données ne constitue pas une anonymisation légale (pseudonymisation). En croisant des **quasi-identifiants** (ex: Code Postal + Date de Naissance + Sexe), 87% de la population américaine est réidentifiable de façon unique ! Le modèle **k-Anonymity** garantit que chaque combinaison de quasi-identifiants est partagée par au moins $k$ individus.

---

## 2) Module — Confidentialité Différentielle avec PyDP (`differential_privacy.py`) (2h)

### 🛠️ Atelier Pratique

**Calcul de moyenne protégée par bruit de Laplace avec PyDP (`pydp_demo.py`) :**

```python
import pydp as dp
from pydp.algorithms.laplacian_bounded import BoundedMean

# Jeu de données contenant les salaires exacts d'employés (données sensibles)
salaries = [45000, 52000, 61000, 48000, 95000, 53000, 49000, 120000]

# 1) Instanciation de l'algorithme BoundedMean avec un budget de confidentialité epsilon = 0.5
# Un epsilon faible (ex: 0.5) garantit une forte protection formelle de la vie privée
mean_algorithm = BoundedMean(
    epsilon=0.5,
    lower_bound=30000,
    upper_bound=150000,
    dtype="float"
)

# 2) Calcul de la moyenne privée (avec injection de bruit de Laplace calibré)
private_mean = mean_algorithm.quick_result(salaries)

print(f"[*] Moyenne réelle (non protégée) : {sum(salaries)/len(salaries):.2f} €")
print(f"[+] Moyenne protégée (Differential Privacy ε=0.5) : {private_mean:.2f} €")
print("[+] L'ajout ou le retrait d'un employé n'impacte pas statistiquement le résultat (Garantie DP) !")
```

---

## 3) Module — Génération de Données Synthétiques avec SDV (`synthetic_data.py`) (2h)

### 🛠️ Génération d'un jeu de données bancaires synthétiques (`sdv_synth.py`)

```python
import pandas as pd
from sdv.single_table import GaussianCopulaSynthesizer
from sdv.metadata import SingleTableMetadata

# 1) Charger un échantillon de données réelles sensibles
data = pd.DataFrame({
    'user_id': [1, 2, 3, 4, 5],
    'age': [25, 42, 37, 61, 29],
    'balance': [1200.50, 4500.00, 890.25, 12500.00, 3100.75],
    'is_fraud': [0, 0, 1, 0, 0]
})

# 2) Définir les métadonnées et entraîner le modèle synthétique
metadata = SingleTableMetadata()
metadata.detect_from_dataframe(data)

synthesizer = GaussianCopulaSynthesizer(metadata)
synthesizer.fit(data)

# 3) Générer 1000 enregistrements synthétiques sans aucune donnée réelle
synthetic_data = synthesizer.sample(num_rows=1000)
print("[+] Dataframe synthétique créé avec succès (Zéro risque de fuite RGPD) :\n", synthetic_data.head())
```

---

## 🏅 Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **PyDP** | Python Differential Privacy — Bibliothèque open-source de Google pour la confidentialité différentielle |
| **SDV** | Synthetic Data Vault — Framework Python de génération de données synthétiques anonymisées |
| **k-Anonymity** | Modèle mathématique garantissant qu'au moins k individus partagent les mêmes quasi-identifiants |
| **RGPD / GDPR** | Règlement Général sur la Protection des Données — Cadre réglementaire européen de la donnée |

---

## ❓ Banque de Questions & Test du Jour

**Q1 :** Quelle est la garantie fondamentale apportée par la **Confidentialité Différentielle (Differential Privacy)** ?
- A) Garantir mathématiquement que la présence ou l'absence d'un individu dans un jeu de données n'affecte pas significativement le résultat de l'analyse statistique
- B) Chiffrer la base de données avec AES-256
- C) Bloquer les attaques par déni de service
- D) Supprimer les sauvegardes

**Réponse : A**

**Q2 :** Dans le modèle mathématique **k-Anonymity**, que représente la valeur $k$ ?
- A) Le nombre minimal d'individus qui doivent posséder exactement la même combinaison de quasi-identifiants (ex: k=5)
- B) La taille de la clé RSA
- C) Le nombre de serveurs
- D) La durée de rétention des logs

**Réponse : A**

**Q3 :** Que représente le paramètre **epsilon ($\epsilon$)** dans la Confidentialité Différentielle ?
- A) Le budget de confidentialité — Plus epsilon est faible, plus le bruit injecté est fort et plus la confidentialité est élevée
- B) Le temps de calcul CPU
- C) Le nombre d'utilisateurs
- D) La version du protocole SSL

**Réponse : A**

**Q4 :** Quel est le principal avantage de l'utilisation de **Données Synthétiques (Synthetic Data)** générées par SDV pour les environnements de test et de dev ?
- A) Fournir des données réalistes respectant la distribution statistique d'origine sans jamais utiliser ni exposer de vraies données personnelles (Conformité RGPD garantie)
- B) Remplacer les bases de données SQL
- C) Éviter d'utiliser Python
- D) Accélérer le réseau

**Réponse : A**

**Q5 :** Quelle certification de l'IAPP (International Association of Privacy Professionals) est la référence mondiale pour les Data Protection Officers (DPO) et spécialistes du RGPD ?
- A) CIPP/E (Certified Information Privacy Professional/Europe)
- B) OSCP
- C) CEH
- D) AWS Security

**Réponse : A**

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
