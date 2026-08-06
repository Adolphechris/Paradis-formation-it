# TOME P6 — Cybersécurité Expert & Red Team Avancé — Jour 251 (6h) : Bug Bounty & Responsible Disclosure (Plateformes HackerOne/Bugcrowd, Méthodologie VDP/BBP, CVSS Scoring, Rédaction de Rapports de Vulnérabilités & Négociation)

> [!NOTE]
> **Objectif du jour :** Maîtriser l'écosystème du **Bug Bounty** et de la **Divulgation Responsable (Responsible Disclosure)** : comprendre les différences entre les programmes **VDP (Vulnerability Disclosure Program)** et **BBP (Bug Bounty Program)**, utiliser les plateformes **HackerOne** et **Bugcrowd**, rédiger des rapports de vulnérabilités professionnels convaincants, comprendre les règles de scoring **CVSS v3.1** pour maximiser les bounties, et naviguer les aspects éthiques et légaux du Bug Bounty.
>
> **Compétences visées :** `SEC-04` (A) — Bug Bounty Methodology & Responsible Disclosure | `PRO-01` (A) — Vulnerability Report Writing & CVSS v3.1 Scoring

---

## 1) Module — Écosystème Bug Bounty & Plateformes (2h)

### 📖 Narration/Intuition

Le **Bug Bounty** est l'un des débouchés professionnels les plus attractifs et les mieux rémunérés de la cybersécurité. Des chercheurs indépendants gagnent de 500 $ à **500 000 $** par vulnérabilité découverte chez des géants comme Google (Android Security Reward Program), Meta, Apple, Microsoft ou Amazon.

Contrairement au pentest classique (engagement contractuel borné), le Bug Bounty est une **chasse en continue** : des dizaines de milliers de chercheurs du monde entier testent en permanence les applications en scope des programmes ouverts.

### 🔍 Anatomie Technique

**Comparatif VDP vs Bug Bounty Program (BBP) :**

```
┌────────────────────────────┬────────────────────────────┬────────────────────────────┐
│ Critère                    │ VDP (Disclosure Program)   │ BBP (Bug Bounty Program)   │
├────────────────────────────┼────────────────────────────┼────────────────────────────┤
│ Rémunération               │ Aucune (remerciements)     │ Récompense monétaire       │
│ Objectif                   │ Canal de signalement sécurisé│ Découverte incentivée      │
│ Portée (Scope)             │ Souvent large              │ Définie précisément        │
│ Délai de réponse           │ 90 jours (Google Policy)   │ 90 jours (standard HackerOne)│
│ Exemples                   │ NCSC UK, ANSSI France      │ Google, Apple, Meta, GitHub │
└────────────────────────────┴────────────────────────────┴────────────────────────────┘
```

---

## 2) Module — Méthodologie de Bug Bounty & CVSS Scoring (2h)

### 📖 Narration/Intuition

Une vulnérabilité non documentée ne vaut rien : c'est la **qualité du rapport** qui détermine si le programme vous attribuera la récompense maximale ou minimale. Les meilleurs Bug Bounty Hunters ne sont pas nécessairement les meilleurs hackers techniques — ils sont les meilleurs **communicants techniques**.

### 🛠️ Atelier Pratique

**Calcul CVSS v3.1 d'une vulnérabilité SSRF (`cvss_calculator.py`) :**

```python
# CVSS v3.1 — Scoring d'une vulnérabilité SSRF → Accès aux métadonnées AWS IMDSv1
# Référence : https://www.first.org/cvss/calculator/3.1

cvss_metrics = {
    "Attack Vector":        "Network",          # AV:N — Exploitable depuis Internet
    "Attack Complexity":    "Low",              # AC:L — Pas de conditions particulières
    "Privileges Required":  "None",             # PR:N — Pas de compte requis
    "User Interaction":     "None",             # UI:N — Pas d'action utilisateur
    "Scope":                "Changed",          # S:C — Impact sur d'autres composants (AWS)
    "Confidentiality":      "High",             # C:H — Vol de credentials IAM
    "Integrity":            "Low",              # I:L — Modification possible
    "Availability":         "None",             # A:N — Pas de déni de service
}

# Score CVSS v3.1 résultant
base_score = 9.6  # CRITIQUE
severity = "CRITIQUE"

print(f"Score CVSS v3.1 : {base_score} — {severity}")
print("Vector String : CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:C/C:H/I:L/A:N")
print(f"Bounty estimé (Google VRP) : $15,000 - $31,337")
```

---

## 3) Module — Rédaction d'un Rapport de Vulnérabilité Professionnel (2h)

### 🛠️ Atelier Pratique

**Template de Rapport Bug Bounty Standard HackerOne (`bug_report_template.md`) :**

```markdown
## Titre de la Vulnérabilité
SSRF aveugle dans le paramètre `webhook_url` permettant l'exfiltration des credentials
AWS IAM via le service IMDS (Instance Metadata Service v1)

## Sévérité CVSS v3.1
**Score : 9.6 — CRITIQUE**
Vector : CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:C/C:H/I:L/A:N

## Description
Le paramètre `webhook_url` de l'endpoint POST `/api/v1/integrations/webhook`
n'effectue aucune validation de l'URL fournie. En soumettant l'URL interne de
l'IMDS (`http://169.254.169.254/latest/meta-data/iam/security-credentials/`),
un attaquant non authentifié peut récupérer les credentials IAM temporaires
du rôle EC2 attaché au serveur d'application.

## Étapes de Reproduction (Step-by-Step)
1. Créer un compte sur target.com
2. Naviguer vers Settings → Integrations → Webhook
3. Renseigner le champ `Webhook URL` avec : `http://169.254.169.254/latest/meta-data/`
4. Cliquer sur "Test Webhook"
5. Observer la réponse JSON contenant les métadonnées d'instance AWS

## Impact
- Vol des credentials IAM du rôle de production (AccessKeyId, SecretAccessKey, Token)
- Pivot potentiel vers l'ensemble de l'infrastructure Cloud de la cible
- Score d'impact métier : CRITIQUE (données clients, infrastructure entière compromise)

## Preuve de Concept (PoC)
```bash
curl -X POST 'https://target.com/api/v1/integrations/webhook' \
  -H 'Authorization: Bearer <token>' \
  -d '{"webhook_url": "http://169.254.169.254/latest/meta-data/iam/security-credentials/"}'
# Réponse : {"AccessKeyId": "ASIA...", "SecretAccessKey": "...", "Token": "..."}
```

## Remédiation Recommandée
1. Implémenter une liste blanche stricte des URLs autorisées (allowlist)
2. Migrer vers IMDSv2 avec tokens de session obligatoires
3. Bloquer les requêtes vers les plages RFC1918 et 169.254.0.0/16 depuis le backend
```

---

## 🏅 Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **VDP** | Vulnerability Disclosure Program — Programme de divulgation responsable non rémunéré |
| **BBP** | Bug Bounty Program — Programme de récompense financière pour la découverte de failles |
| **CVSS** | Common Vulnerability Scoring System — Système de scoring standardisé des vulnérabilités |
| **HackerOne** | Principale plateforme mondiale d'hébergement de programmes Bug Bounty |
| **Bugcrowd** | Seconde plateforme majeure de Bug Bounty (concurrente d'HackerOne) |

---

## 🏋️ Exercices & Corrigés

**Exercice 1 :** Quels sont les 4 groupes de métriques du standard **CVSS v3.1** et quels groupes influencent le **Base Score** ?

**Corrigé :** Les 4 groupes sont :
1. **Base Metrics (Métriques de Base)** : Décrivent les caractéristiques intrinsèques et permanentes de la vulnérabilité (Attack Vector, Attack Complexity, Privileges Required, User Interaction, Scope, Confidentiality, Integrity, Availability). Ces métriques constituent le **Base Score** (0.0-10.0).
2. **Temporal Metrics (Métriques Temporelles)** : Reflètent les caractéristiques évolutives dans le temps (Exploit Code Maturity, Remediation Level, Report Confidence). Modifient le score Base en un Temporal Score.
3. **Environmental Metrics** : Personnalisent le score selon le contexte de l'organisation (Modified Base Metrics + Security Requirements).
4. **Supplemental Metrics** (nouveauté v4.0) : Fournissent des contextes additionnels sans modifier le score.

**Exercice 2 :** Quel est le délai standard **"90 days"** en Bug Bounty et que se passe-t-il si l'entreprise ne remédie pas dans ce délai ?

**Corrigé :** Le **délai de 90 jours** (policy Google Project Zero, adoptée par la majorité des plateformes) donne à l'organisation 90 jours à partir de la notification pour corriger la vulnérabilité. Si la remédiation n'est pas faite dans ce délai : (1) Le chercheur peut divulguer publiquement ses findings (Full Disclosure) sur des plateformes comme HackerOne ou son blog, (2) La plateforme peut publier le rapport après expiration, (3) Dans certains cas, un délai de grâce de 14 jours supplémentaires est accordé si un patch est en cours de déploiement.

---

## ❓ Banque de Questions & Test du Jour

**Q1 :** Sur la plateforme HackerOne, quelle métrique détermine principalement le montant de la récompense accordée pour une vulnérabilité découverte ?
- A) Le score CVSS v3.1 combiné à l'impact métier évalué par le programme
- B) Le nombre de mots dans le rapport
- C) La nationalité du chercheur
- D) La langue dans laquelle le rapport est rédigé

**Réponse : A**

**Q2 :** Dans le scoring CVSS v3.1, quelle valeur du champ **Scope (S)** signifie que la vulnérabilité affecte des composants au-delà du composant vulnérable lui-même (ex: SSRF → AWS) ?
- A) **S:C** — Scope Changed (Portée Modifiée)
- B) **S:U** — Scope Unchanged
- C) **S:N** — Scope None
- D) **S:A** — Scope Adjacent

**Réponse : A**

**Q3 :** Quel est le principal avantage du **Bug Bounty Program (BBP)** par rapport à un **VDP (Vulnerability Disclosure Program)** du point de vue du chercheur ?
- A) La rémunération financière proportionnelle à la criticité des vulnérabilités découvertes
- B) L'accès aux locaux de l'entreprise
- C) Le droit à une interview d'embauche
- D) La possibilité de publier librement les vulnérabilités sans délai

**Réponse : A**

**Q4 :** Dans un rapport de Bug Bounty, quelle section est la plus importante pour convaincre le programme de la validité et de la reproductibilité d'une vulnérabilité ?
- A) Les Étapes de Reproduction (Step-by-Step Reproduction Steps) avec un Proof of Concept (PoC) concret
- B) La biographie du chercheur
- C) La liste de ses certifications
- D) L'historique de ses précédents bounties

**Réponse : A**

**Q5 :** Quel délai standard la politique "Coordinated Vulnerability Disclosure" de Google Project Zero accorde-t-il aux entreprises pour remédier à une vulnérabilité avant divulgation publique ?
- A) 90 jours (+ 14 jours de grâce si patch en cours)
- B) 7 jours
- C) 1 an
- D) 30 jours uniquement

**Réponse : A**

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
