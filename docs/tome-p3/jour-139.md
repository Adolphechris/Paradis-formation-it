# TOME P3 — Cloud Native, DevOps & Cyberdéfense — Jour 139 (6h) : Sécurité de l'Infrastructure as Code (IaC) & Continuous Compliance (Terraform Sentinel, Open Policy Agent & Trivy IaC)

> [!NOTE]
> **Objectif du jour :** Mettre en œuvre la sécurité et la conformité continue des déploiements d'infrastructures automatisées (Infrastructure as Code - IaC) : règles de gouvernance HashiCorp Sentinel, validation statique des plans Terraform avec OPA / Rego, et analyse approfondie des vulnérabilités de conteneurs et d'IaC avec Trivy.
>
> **Compétences visées :** `SEC-05` (A) — Security & Compliance as Code (IaC) | `BIT-08` (A) — Governed Infrastructure Pipelines

---

## 1) Module — Pourquoi la Gouvernance d'IaC ? (2h)

### 📖 Narration/Intuition

Lorsque les équipes d'ingénierie déploient des milliers de ressources cloud par jour via Terraform ou OpenTofu, une simple erreur de syntaxe ou une mauvaise variable dans un fichier `.tf` (ex: passer un bucket S3 en `public-read` ou ouvrir un Security Group sur le port 22 pour `0.0.0.0/0`) peut immédiatement exposer toute l'entreprise.

La **Gouvernance d'IaC (Policy as Code)** consiste à évaluer automatiquement le plan d'exécution Terraform (`terraform plan`) par rapport à des règles de sécurité **avant** que la moindre ressource ne soit créée dans le cloud.

### 🔍 Anatomie Technique

**Le Pipeline de Sécurité d'IaC (Shift-Left Security) :**

```
Code Terraform (.tf) ───> terraform plan -out=plan.tfplan
                                │
                                ▼
                   [ CONVERTI EN JSON : plan.json ]
                                │
                                ▼
            ┌───────────────────────────────────────┐
            │ MOTEUR DE POLITIQUE (OPA / SENTINEL)   │
            │  - Check: Port 22 ouvert ? ❌         │
            │  - Check: Chiffrement KMS présent ? ✅│
            └───────────────────┬───────────────────┘
                                │
                ┌───────────────┴───────────────┐
                ▼                               ▼
       [ PASSE : terraform apply ]     [ ÉCHEC : Pipeline Bloqué ! ]
```

---

## 2) Module — Validation des Plans Terraform avec OPA Rego (2h)

### 📖 Narration/Intuition

En convertissant le plan d'exécution Terraform en fichier JSON (`terraform show -json plan.tfplan > plan.json`), on peut utiliser **Open Policy Agent (OPA)** et le langage Rego pour auditer la structure exacte des ressources qui vont être créées.

### 🔍 Anatomie Technique

**Règle OPA Rego d'audit de plan Terraform (`policy_terraform.rego`) :**

```rego
package terraform.analysis

default allow = false

# Autoriser l'exécution uniquement si aucune violation n'est trouvée
allow {
    count(violations) == 0
}

# Règle 1 : Bloquer la création de Security Groups AWS ouverts au monde sur SSH (Port 22)
violations[msg] {
    resource := input.resource_changes[_]
    resource.type == "aws_security_group"
    ingress := resource.change.after.ingress[_]
    ingress.from_port <= 22
    ingress.to_port >= 22
    cidr := ingress.cidr_blocks[_]
    cidr == "0.0.0.0/0"
    msg := sprintf("🚨 ALERTE SECURITE IaC: Le Security Group '%s' autorise SSH depuis 0.0.0.0/0 !", [resource.name])
}

# Règle 2 : Exiger le chiffrement EBS sur toutes les instances EC2
violations[msg] {
    resource := input.resource_changes[_]
    resource.type == "aws_ebs_volume"
    not resource.change.after.encrypted
    msg := sprintf("🚨 ALERTE SECURITE IaC: Le volume EBS '%s' n'est pas chiffré !", [resource.name])
}
```

---

## 3) Module — Scans Complémentaires avec Trivy & Checkov dans le CI/CD (2h)

### 📖 Narration/Intuition

Dans une chaîne DevSecOps moderne, on combine la puissance d'OPA pour les règles métier personnalisées avec **Trivy** pour la détection instantanée de vulnérabilités et d'erreurs de configuration d'infrastructures.

### 🔍 Anatomie Technique

**Script de validation de pipeline CI/CD (`validate_iac_pipeline.sh`) :**

```bash
#!/bin/bash
# validate_iac_pipeline.sh — Validation de sécurité de l'IaC dans le CI/CD

echo "[+] 1. Génération du plan d'exécution Terraform..."
terraform plan -out=tfplan.binary
terraform show -json tfplan.binary > tfplan.json

echo "[+] 2. Audit du plan Terraform avec Open Policy Agent (OPA)..."
opa eval --data policy_terraform.rego --input tfplan.json "data.terraform.analysis.allow" | grep "true"
if [ $? -ne 0 ]; then
    echo "❌ ÉCHEC : Violations de règles de sécurité détectées dans le plan Terraform !"
    exit 1
fi

echo "[+] 3. Scan de sécurité IaC avec Trivy..."
trivy config ./terraform/ --exit-code 1 --severity CRITICAL,HIGH

echo "✅ PIPELINE IaC VALIDÉ : L'infrastructure respecte 100% des normes de sécurité d'entreprise !"
```

---

## 🏅 Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **IaC** | Infrastructure as Code — Déploiement et gestion déclarative de l'infrastructure via du code |
| **Policy as Code** | Définition sous forme de code et évaluation automatisée des politiques de sécurité |
| **Sentinel** | Moteur de politiques de sécurité intégré à HashiCorp Terraform Enterprise |
| **Shift-Left Security** | Intégration de la sécurité au plus tôt dans le cycle de développement |

---

## 🏋️ Exercices & Corrigés

**Exercice 1 :** Pourquoi est-il indispensable d'analyser le fichier **`terraform plan` (JSON)** plutôt que de se contenter de scanner les fichiers de code source `.tf` bruts ?

**Corrigé :** Scanner les fichiers de code source `.tf` permet de trouver des erreurs évidentes. Cependant, dans des projets d'infrastructure complexes utilisant des modules réutilisables, des variables dynamiques et des expressions conditionnelles, seule la commande **`terraform plan`** calcule l'état final exact de la ressource telle qu'elle sera physiquement provisionnée dans le cloud. Analyser le plan JSON avec OPA permet de valider les vraies valeurs calculées (ex: le CIDR final attribué après évaluation de variables d'environnement).

**Exercice 2 :** Quelle est la différence entre la directive `terraform plan` et `terraform apply` dans un pipeline DevSecOps sécurisé ?

**Corrigé :** **`terraform plan`** est une commande de **simulation** : elle interroge le cloud et calcule les modifications qui *seraient* effectuées sans toucher à l'infrastructure réelle. C'est à cette étape que le moteur de sécurité (OPA / Trivy) intercepte le plan pour valider la conformité. **`terraform apply`** est la commande d'**exécution réelle** : elle n'est déclenchée que si et seulement si l'étape de validation du plan a réussi sans aucune violation de sécurité.

---

## ❓ Banque de Questions & Test du Jour

**Q1 :** Quelle démarche consiste à évaluer automatiquement les manifestes d'Infrastructure as Code (IaC) par rapport à des règles de sécurité codées avant l'application sur le cloud ?
- A) Policy as Code / Shift-Left IaC Security
- B) MS-DOS
- C) Disquette
- D) Câble VGA

**Réponse : A**

**Q2 :** Quel outil open-source d'analyse de sécurité permet de scanner simultanément le code IaC (Terraform, K8s), les images de conteneurs et les dépendances logicielle ?
- A) Trivy
- B) Paint
- C) Calculator
- D) Word

**Réponse : A**

**Q3 :** Quelle commande Terraform permet d'exporter la simulation des modifications d'infrastructure sous forme de fichier structuré pour une analyse par OPA Rego ?
- A) `terraform show -json tfplan.binary > tfplan.json`
- B) `terraform destroy`
- C) `format c:`
- D) `reboot`

**Réponse : A**

**Q4 :** Quel est le moteur de règles de sécurité propriétaire développé par HashiCorp pour imposer la gouvernance des déploiements dans Terraform Enterprise ?
- A) Sentinel
- B) BGP
- C) POP3
- D) Telnet

**Réponse : A**

**Q5 :** Quel est l'avantage de bloquer un pipeline CI/CD dès l'étape d'analyse de l'IaC avec un code de retour `--exit-code 1` ?
- A) Empêcher physiquement la création d'une infrastructure non conforme ou vulnérable sur le cloud
- B) Éteindre l'ordinateur du développeur
- C) Supprimer le dépôt Git
- D) Effacer les logs

**Réponse : A**

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
