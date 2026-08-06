# TOME P3 — Cloud Native, DevOps & Cyberdéfense — Jour 109 (6h) : Compliance as Code & Automatisation de la Sécurité (Open Policy Agent, Gatekeeper & Conftest)

> [!NOTE]
> **Objectif du jour :** Maîtriser le concept de **Compliance as Code** avec Open Policy Agent (OPA), le langage Rego, Gatekeeper pour Kubernetes et Conftest pour valider les politiques de sécurité sur tous les fichiers de configuration de l'entreprise (IaC, Docker, K8s).
>
> **Compétences visées :** `SEC-05` (A) — Compliance as Code & Politique d'Admission | `BIT-08` (A) — Moteur de Règles OPA Rego

---

## 1) Module — Moteur de Règles OPA & Langage Rego (2h)

### 📖 Narration/Intuition

Exprimer les politiques de sécurité (ex: *"Aucun conteneur ne doit tourner en root"*, *"Tous les sous-réseaux AWS doivent comporter un tag 'Owner'"*) sous forme de documentation texte exige des audits manuels lents et faillibles.

**Open Policy Agent (OPA)** est un moteur de politique généraliste open-source (CNCF) qui permet d'exprimer les règles de conformité sous forme de code déclaratif en langage **Rego**. OPA sépare la logique de prise de décision de la logique applicative.

### 🔍 Anatomie Technique

**Architecture de Découplage des Décisions avec OPA :**

```
Données de Requête (JSON Input)          Politique Rego (.rego)
┌──────────────────────────────┐        ┌──────────────────────────────┐
│ { "user": "alice",           │        │ package bcc.authz            │
│   "action": "read",          │        │ default allow = false        │
│   "resource": "virements" }  │        │ allow { input.user == "alice"│
└──────────────┬───────────────┘        └──────────────┬───────────────┘
               │                                       │
               └───────────────────┬───────────────────┘
                                   │ Évaluation OPA
                                   ▼
                       ┌──────────────────────┐
                       │ DÉCISION (ALLOW/DENY)│
                       │ { "allow": true }    │
                       └──────────────────────┘
```

**Exemple de Politique Rego (`bcc_security.rego`) :**

```rego
package bcc.k8s.security

default allow = false

# Autoriser la création du Pod SEULEMENT SI runAsNonRoot est vrai
allow {
    input.request.kind.kind == "Pod"
    input.request.object.spec.securityContext.runAsNonRoot == true
}

# Règle d'avertissement : Bloquer les images avec le tag 'latest'
violation[msg] {
    container := input.request.object.spec.containers[_]
    endswith(container.image, ":latest")
    msg := sprintf("Image interdite '%s': l'utilisation du tag ':latest' est proscrite en production.", [container.image])
}
```

---

## 2) Module — Validations Kubernetes avec OPA Gatekeeper (2h)

### 📖 Narration/Intuition

**Gatekeeper** est le contrôleur d'admission personnalisé basé sur OPA pour Kubernetes. Il intercepte les requêtes de création de ressources dans le cluster et rejette immédiatement toute ressource non conforme aux règles Rego définies.

### 🔍 Anatomie Technique

**Manifeste Gatekeeper ConstraintTemplate (`template-must-have-labels.yaml`) :**

```yaml
apiVersion: templates.gatekeeper.sh/v1
kind: ConstraintTemplate
metadata:
  name: k8smusthavelabels
spec:
  crd:
    spec:
      names:
        kind: K8sMustHaveLabels
      validation:
        openAPIV3Schema:
          type: object
          properties:
            labels:
              type: array
              items:
                type: string
  targets:
    - target: admission.k8s.gatekeeper.sh
      rego: |
        package k8smusthavelabels

        violation[{"msg": msg}] {
          provided := {label | input.review.object.metadata.labels[label]}
          required := {label | label := input.parameters.labels[_]}
          missing := required - provided
          count(missing) > 0
          msg := sprintf("Étiquette(s) obligatoire(s) manquante(s) sur la ressource: %v", [missing])
        }
```

---

## 3) Module — Validation d'IaC dans le CI/CD avec Conftest (2h)

### 📖 Narration/Intuition

**Conftest** permet d'utiliser les politiques Rego d'OPA directement sur des fichiers de configuration locaux (Terraform, Dockerfile, Compose, YAML) lors des commits Git ou dans les pipelines CI/CD.

### 🔍 Anatomie Technique

**Validation d'un fichier Terraform avec Conftest :**

```bash
# Installation de Conftest
curl -SFL https://github.com/open-policy-agent/conftest/releases/download/v0.45.0/conftest_0.45.0_Linux_x86_64.tar.gz | tar -xz

# Tester des manifestes Kubernetes ou Terraform par rapport à un dossier de politiques Rego
conftest test deployment.yaml --policy ./policy/

# Résultat en cas de violation :
# FAIL - deployment.yaml - bcc.k8s.security - Image interdite 'nginx:latest'
# 1 test, 0 passed, 0 warnings, 1 failure
```

---

## 🏅 Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **OPA** | Open Policy Agent — Moteur de règles de politique généraliste open-source (CNCF) |
| **Rego** | Langage de requête et de description de politiques haut niveau utilisé par OPA |
| **Constraint** | Instanciation d'une règle de sécurité Gatekeeper appliquée sur des ressources cibles |

---

## 🏋️ Exercices & Corrigés

**Exercice 1 :** Quelle est la différence entre l'approche **OPA Gatekeeper** (dans Kubernetes) et **Conftest** (dans le CI/CD) ?

**Corrigé :** **Conftest** est un outil en ligne de commande utilisé en amont (Shift-Left) dans les postes de travail des développeurs ou dans les pipelines CI/CD pour valider les fichiers de configuration (YAML, Terraform, Dockerfile) *avant* qu'ils ne soient poussés ou appliqués. **OPA Gatekeeper** est un contrôleur d'admission qui s'exécute *à l'intérieur* du cluster Kubernetes en production : il intercepte dynamiquement les requêtes `kubectl` ou GitOps et bloque physiquement l'injection de toute ressource non conforme dans le cluster.

**Exercice 2 :** Dans le langage Rego d'OPA, que signifie la directive `default allow = false` ?

**Corrigé :** La directive `default allow = false` définit une posture de sécurité par défaut de type **Deny-All (Refus par défaut)**. Si aucune règle explicite dans le fichier Rego n'évalue la demande comme autorisée (`allow = true`), la décision renvoyée par OPA sera systématiquement le refus (`false`). C'est le principe fondamental du moindre privilège.

---

## ❓ Banque de Questions & Test du Jour

**Q1 :** Quel langage de programmation déclaratif est utilisé par Open Policy Agent (OPA) pour exprimer des politiques de conformité sous forme de code ?
- A) Rego
- B) Python
- C) Java
- D) HTML

**Réponse : A**

**Q2 :** Quel composant est le contrôleur d'admission natif pour Kubernetes basé sur le moteur Open Policy Agent (OPA) ?
- A) Gatekeeper
- B) BGP Router
- C) Docker Engine
- D) Systemd

**Réponse : A**

**Q3 :** Quel outil permet d'exécuter des tests de politique Rego (OPA) sur des fichiers de configuration locaux (Terraform, Dockerfile, YAML) dans un pipeline CI/CD ?
- A) Conftest
- B) Ping
- C) Gzip
- D) Netcat

**Réponse : A**

**Q4 :** Quel est le bénéfice majeur du concept de Compliance as Code ?
- A) Rendre les règles de sécurité automatisées, auditales, versionnées dans Git et évaluées instantanément sans audit manuel
- B) Augmenter la taille des fichiers de code
- C) Supprimer le besoin de sauvegardes
- D) Ralentir le réseau

**Réponse : A**

**Q5 :** Dans une politique Gatekeeper, que permet de définir un `ConstraintTemplate` ?
- A) La logique de règle Rego réutilisable et le schéma des paramètres d'entrée de la contrainte
- B) Le mot de passe de l'administrateur
- C) La vitesse du processeur
- D) L'adresse MAC de la carte réseau

**Réponse : A**

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
