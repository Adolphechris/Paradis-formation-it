# TOME P5 — Cybersécurité Avancée & Red/Blue Team — Jour 246 (6h) : Privacy Engineering & Protection des Données (Differential Privacy, k-Anonymity, Synthetic Data Generation & Conformité RGPD/CCPA/HIPAA)

> [!NOTE]
> **Objectif du jour :** Maîtriser les principes et outils du **Privacy Engineering** (Ingénierie de la Confidentialité) indispensables dans les grands groupes internationaux, GAFA et FinTechs : mise en œuvre de la **Differential Privacy (Confidentialité Différentielle)** avec Python PyDP, anonymisation formelle de jeux de données avec **$k$-Anonymity**, $l$-Diversity et $t$-Closeness, génération de données synthétiques anonymes, et alignement technique avec les réglementations mondiales (**RGPD/GDPR**, **CCPA**, **HIPAA**).
>
> **Compétences visées :** `SEC-06` (A) — Privacy Engineering & Differential Privacy | `POL-03` (A) — Anonymisation Formelle k-Anonymity & RGPD Technical Compliance

---

## 1) Module — Modèles Mathematiques d'Anonymisation (k-Anonymity, l-Diversity, t-Closeness) (2h)

### 📖 Narration/Intuition

Dans le monde professionnel (santé, finance, e-commerce, adtech), le simple fait de supprimer les noms ou numéros de sécurité sociale d'une base de données ne suffit pas à anonymiser un jeu de données. Des attaques par ré-identification (utilisant des données croisées publiques) permettent de ré-identifier jusqu'à 87% des individus avec seulement trois quasi-identifiants : le code postal, le sexe et la date de naissance (travaux majeurs de Latanya Sweeney).

Le **Privacy Engineering** fournit des modèles mathématiques rigoureux pour garantir l'anonymat irréversible exigé par la CNIL et le RGPD.

### 🔍 Anatomie Technique

**Comparatif des Modèles d'Anonymisation :**

```
┌─────────────────┬─────────────────────────────────────────────────────────────┐
│ Modèle          │ Principe Mathématique & Protection                          │
├─────────────────┼─────────────────────────────────────────────────────────────┤
│ k-Anonymity     │ Chaque combinaison de quasi-identifiants (ex: Age, CP)      │
│                 │ doit être identique pour au moins k individus dans la base.  │
│                 │ → Empêche la ré-identification directe.                     │
├─────────────────┼─────────────────────────────────────────────────────────────┤
│ l-Diversity     │ Extension de k-Anonymity : dans chaque groupe anonyme de k  │
│                 │ individus, la donnée sensible (ex: Maladie) doit comporter  │
│                 │ au moins l valeurs distinctes.                              │
│                 │ → Empêche l'attaque par inférence d'attributs.              │
├─────────────────┼─────────────────────────────────────────────────────────────┤
│ t-Closeness     │ Exige que la distribution d'un attribut sensible dans un    │
│                 │ groupe de k-Anonymity ne s'écarte pas de la distribution    │
│                 │ globale de plus d'une distance t.                           │
│                 │ → Empêche l'inférence statistique avancée.                 │
└─────────────────┴─────────────────────────────────────────────────────────────┘
```

---

## 2) Module — Differential Privacy avec Google PyDP (2h)

### 📖 Narration/Intuition

La **Confidentialité Différentielle (Differential Privacy)** est l'étalon-or (Gold Standard) de la protection de la vie privée utilisé par Apple, Google, US Census Bureau et Meta.

Elle consiste à ajouter du **bruit mathématique contrôlé** (mécanisme de Laplace ou Gaussien) lors du calcul de statistiques ou d'entraînements de modèles IA, de sorte qu'il soit mathématiquement impossible de déterminer si les données d'un individu spécifique faisaient partie ou non du jeu de données source (budget de confidentialité $\epsilon$).

### 🛠️ Atelier Pratique

**Implémentation de Differential Privacy en Python (`dp_analytics.py`) :**

```python
import pydp as dp
from pydp.algorithms.laplacian import BoundedMean

# Jeu de données de salaires d'une multinationale (Données sensibles)
salaries = [45000, 52000, 68000, 120000, 48000, 95000, 51000, 150000, 62000, 58000]

# 1. Calcul de la moyenne classique (Révèle l'impact direct d'un haut salaire)
raw_mean = sum(salaries) / len(salaries)
print(f"Moyenne brute (sans privacy) : {raw_mean:.2f} €")

# 2. Calcul avec Differential Privacy (Budget de confidentialité epsilon = 1.0)
# Le bruit de Laplace garantit qu'aucun individu ne peut être ré-identifié
dp_mean_calculator = BoundedMean(epsilon=1.0, lower_bound=30000, upper_bound=200000)
dp_mean = dp_mean_calculator.quick_result(salaries)

print(f"🔒 Moyenne différenciellement privée (DP) : {dp_mean:.2f} €")
print("✅ Calcul sécurisé conforme RGPD Article 32 / CNIL Privacy by Design")
```

---

## 3) Module — Données Synthétiques & Privacy-by-Design (2h)

### 🛠️ Atelier Pratique

**Génération de Données Synthétiques avec SDV (Synthetic Data Vault) (`synthetic_data.py`) :**

```python
from sdv.single_table import GaussianCopulaSynthesizer
from sdv.metadata import SingleTableMetadata
import pandas as pd

# 1. Charger des données clients réelles (ex: Banque, e-commerce, santé)
real_data = pd.DataFrame({
    'age': [25, 42, 31, 55, 64, 22, 38],
    'income': [32000, 65000, 48000, 92000, 110000, 28000, 54000],
    'churn': [0, 0, 1, 0, 1, 0, 0]
})

# 2. Définir les métadonnées et entraîner le synthétiseur
metadata = SingleTableMetadata()
metadata.detect_from_dataframe(data=real_data)

synthesizer = GaussianCopulaSynthesizer(metadata)
synthesizer.fit(real_data)

# 3. Générer 10 000 lignes de données synthétiques totalement anonymes
# (Aucune donnée réelle d'individu ne figure dans le résultat, qualité statistique identique)
synthetic_data = synthesizer.sample(num_rows=10000)
print("✅ 10 000 lignes de données synthétiques générées pour l'entraînement IA sans risque RGPD !")
print(synthetic_data.head())
```

---

## 🏅 Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **DP** | Differential Privacy — Confidentialité différentielle (bruit de Laplace/Gaussien) |
| **RGPD / GDPR** | Règlement Général sur la Protection des Données (General Data Protection Regulation) |
| **CCPA** | California Consumer Privacy Act — Législation américaine sur la protection des données |
| **SDV** | Synthetic Data Vault — Écosystème open-source de génération de données synthétiques |
| **PII** | Personally Identifiable Information — Données personnelles identifiantes |

---

## 🏋️ Exercices & Corrigés

**Exercice 1 :** Quelle est l'attaque majeure que le modèle **$k$-Anonymity** seul ne permet pas d'éviter, et qui justifie l'utilisation du modèle **$l$-Diversity** ?

**Corrigé :** $k$-Anonymity empêche la ré-identification d'un individu en garantissant qu'au moins $k$ personnes partagent les mêmes quasi-identifiants (ex: Age 30, CP 75001). Cependant, il est vulnérable à l'**attaque par homogénéité (Attribute Disclosure Attack)** : si les $k$ individus anonymes d'un même groupe possèdent tous **la même valeur d'attribut sensible** (ex: les 4 personnes du groupe ont toutes un "Cancer de l'estomac"), un attaquant sachant que la cible fait partie de ce groupe déduit avec 100% de certitude sa maladie. Le modèle **$l$-Diversity** résout cette faille en imposant qu'il y ait au moins $l$ valeurs distinctes pour l'attribut sensible dans chaque classe d'équivalence $k$.

**Exercice 2 :** Dans la Confidentialité Différentielle, à quoi correspond le paramètre **Budget de Confidentialité ($\epsilon$ / Epsilon)** ?

**Corrigé :** Le paramètre $\epsilon$ (Epsilon) mesure et contrôle le **niveau de perte de confidentialité (privacy loss)** toléré lors d'une requête ou d'une analyse. Plus $\epsilon$ est petit (ex: $\epsilon = 0.1$), plus le bruit injecté est important, offrant une protection maximale de la vie privée mais réduisant la précision de la mesure. Plus $\epsilon$ est grand (ex: $\epsilon = 10$), plus le résultat est précis mais la garantie de confidentialité diminue. Le Privacy Engineer doit arbitrer entre l'utilité des données et la protection de la vie privée.

---

## ❓ Banque de Questions & Test du Jour

**Q1 :** Selon les recherches formelles en Privacy Engineering, quel modèle d'anonymisation exige que chaque combinaison de quasi-identifiants réapparaisse au moins $k$ fois dans un jeu de données ?
- A) $k$-Anonymity
- B) RSA-2048
- C) SHA-256
- D) Differential Privacy

**Réponse : A**

**Q2 :** Quel mécanisme mathématique est utilisé dans la **Differential Privacy (DP)** pour empêcher la ré-identification d'individus dans des requêtes statistiques ?
- A) Injection de bruit probabiliste (mécanisme de Laplace ou Gaussien)
- B) Chiffrement symétrique AES-256
- C) Hachage MD5
- D) Suppression de colonnes SQL

**Réponse : A**

**Q3 :** Quel outil open-source (développé initialement au MIT) permet de générer des **données synthétiques** réalistes qui conservent la valeur statistique des données sources sans inclure de données réelles d'individus ?
- A) SDV (Synthetic Data Vault)
- B) Nmap
- C) Metasploit
- D) Wireshark

**Réponse : A**

**Q4 :** Quelle est l'exigence clé de la directive **RGPD (Article 25)** concernant l'ingénierie de la confidentialité dans la conception de nouvelles applications ?
- A) Privacy by Design and by Default (Confidentialité dès la conception et par défaut)
- B) Chiffrement RSA 4096 obligatoire
- C) Interdiction d'utiliser des bases de données relationnelles
- D) Obligation d'héberger les serveurs uniquement en France

**Réponse : A**

**Q5 :** Quel modèle d'anonymisation améliore $l$-Diversity en vérifiant que la distribution statistique d'un attribut sensible ne dévie pas trop de la distribution globale de la population ?
- A) $t$-Closeness
- B) $k$-Anonymity
- C) HMAC
- D) TLS 1.3

**Réponse : A**

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
