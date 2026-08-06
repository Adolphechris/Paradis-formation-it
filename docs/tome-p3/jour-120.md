# TOME P3 — Cloud Native, DevOps & Cyberdéfense — Jour 120 (6h) : Projet Intégrateur Semestre 3 (Partie 2) — Hardening Kubernetes, Vault Secrets & Defense-in-Depth

> [!NOTE]
> **Objectif du jour :** Réaliser et soutenir la deuxième partie du projet intégrateur du Semestre 3 (J111-J120) : hardening complet d'un cluster Kubernetes (gVisor Runtimes, AWS IRSA, Cilium L7 Policies, Vault Dynamic Secrets, OPA Gatekeeper et audit Prowler).
>
> **Compétences visées :** `PRO-01` (A) — Conduite de Projet SecDevOps | `SEC-03` (A) — Defense-in-Depth Kubernetes & Hardening Cloud

---

## 1) Module — Cahier des Charges & Architecture Defense-in-Depth (2h)

### 📖 Narration/Intuition

En tant qu'**Expert SecDevOps & Architecte Cyberdéfense** de la Banque Centrale du Congo, vous devez valider le déploiement du sous-système **BCC Defense-in-Depth**.

Ce système doit appliquer **5 niveaux de sécurité étanches** :
1. **Accès Cloud IAM sans clés statiques** (AWS IRSA / Workload Identity).
2. **Isolation des Runtimes Kubernetes** avec Sandboxing gVisor pour les conteneurs sensibles.
3. **Gestion dynamique des secrets BDD** via HashiCorp Vault et External Secrets Operator.
4. **Filtrage réseau micro-segmenté Niveau 7** avec Cilium CNI.
5. **Contrôle d'admission et de conformité** avec OPA Gatekeeper et audit Prowler/Checkov.

### 🔍 Anatomie Technique

**Architecture Globale 5-Niveaux (Projet J120) :**

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ NIV 1. CLOUD IAM : AWS IRSA (Pas de clés d'accès statiques)                 │
└─────────────────────────────────────┬───────────────────────────────────────┘
                                      │ Identity Federation OIDC
┌─────────────────────────────────────▼───────────────────────────────────────┐
│ NIV 2. CONTRÔLE D'ADMISSION : OPA Gatekeeper (Politiques Rego Deny-All)    │
└─────────────────────────────────────┬───────────────────────────────────────┘
                                      │ Validation des Manifestes
┌─────────────────────────────────────▼───────────────────────────────────────┐
│ NIV 3. GESTION DES SECRETS : HashiCorp Vault (Dynamic BDD Credentials)       │
└─────────────────────────────────────┬───────────────────────────────────────┘
                                      │ External Secrets Operator
┌─────────────────────────────────────▼───────────────────────────────────────┐
│ NIV 4. FILTRAGE RÉSEAU L7 : Cilium CNI & Hubble (HTTP Filtering Rules)      │
└─────────────────────────────────────┬───────────────────────────────────────┘
                                      │ Micro-segmentation eBPF
┌─────────────────────────────────────▼───────────────────────────────────────┐
│ NIV 5. RUNTIME ISOLATION : gVisor Sandbox (runsc) / Seccomp SPO Profiles    │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2) Module — Orchestrateur de Déploiement & Audit Automatisé (2h)

### 📖 Narration/Intuition

Le déploiement complet de la solution est validé par un script Python d'audit global qui exécute la vérification des 5 couches de sécurité.

### 🔍 Anatomie Technique

**Script de Validation d'Architecture Defense-in-Depth (`validate_j120_defense.py`) :**

```python
#!/usr/bin/env python3
"""
validate_j120_defense.py — Validation du Projet J120 (Defense-in-Depth K8s)
"""
import subprocess
import sys

def check(cmd, title):
    print(f"[+] Vérification Couche : {title}...")
    res = subprocess.run(cmd, shell=True, capture_output=True, text=True)
    if res.returncode == 0:
        print(f"    ✅ PASS : {title}")
        return True
    else:
        print(f"    ❌ FAIL : {title}")
        print(f"    Détails : {res.stderr.strip()}")
        return False

def main():
    print("=================================================================")
    print("   VALIDATION DU PROJET INTÉGRATEUR J120 — DEFENSE-IN-DEPTH      ")
    print("=================================================================\n")

    results = [
        check("kubectl get sa bcc-s3-reader-sa -n bcc-production -o jsonpath='{.metadata.annotations}' | grep eks.amazonaws.com", "Niv 1: AWS IRSA ServiceAccount Annoté"),
        check("kubectl get constrainttemplates k8smusthavelabels", "Niv 2: OPA Gatekeeper ConstraintTemplate"),
        check("kubectl get externalsecret bcc-api-secrets-es -n bcc-production", "Niv 3: External Secrets Vault Integration"),
        check("kubectl get ciliumnetworkpolicy restrict-virement-api-l7 -n bcc-production", "Niv 4: Cilium L7 NetworkPolicy"),
        check("kubectl get deployment bcc-untrusted-api -n bcc-production -o jsonpath='{.spec.template.spec.runtimeClassName}' | grep gvisor", "Niv 5: gVisor RuntimeClass Isolation")
    ]

    passed = sum(results)
    total = len(results)
    print("\n=================================================================")
    print(f"RÉSULTAT DU CONTRÔLE : {passed}/{total} couches de sécurité validées.")
    if passed == total:
        print("🎓 CONFORME : Projet J120 Validé — Niveau Expert Cyberdéfense K8s !")
        sys.exit(0)
    else:
        print("❌ INCOMPLET : Corrigez les couches manquantes.")
        sys.exit(1)

if __name__ == "__main__":
    main()
```

---

## 3) Module — Grille d'Évaluation & Soutenance Technique (2h)

### 📖 Narration/Intuition

La soutenance devant le jury d'évaluation s'appuie sur la grille d'évaluation ci-dessous.

### 🔍 Anatomie Technique

**Grille d'Évaluation Technique (Projet J120) :**

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       GRILLE D'ÉVALUATION — PROJET J120                     │
├───────────────────────────────────┬────────┬────────────────────────────────┤
│ Domaine d'Évaluation              │ Poids  │ Critères de Validation         │
├───────────────────────────────────┼────────┼────────────────────────────────┤
│ 1. Identité Cloud IRSA / OIDC     │  20%   │ • Aucune clé statique dans K8s │
│                                   │        │ • Trust Policy IAM restreinte  │
├───────────────────────────────────┼────────┼────────────────────────────────┤
│ 2. Admission OPA Gatekeeper       │  20%   │ • Politique Rego Deny-All      │
│                                   │        │ • Validation IaC Conftest CI   │
├───────────────────────────────────┼────────┼────────────────────────────────┤
│ 3. Gestion Dynamic Secrets        │  20%   │ • Engine Vault Database / TTL  │
│                                   │        │ • ESO Synchronisation K8s      │
├───────────────────────────────────┼────────┼────────────────────────────────┤
│ 4. Cilium Micro-segmentation L7   │  20%   │ • Filtrage HTTP GET/POST       │
│                                   │        │ • Inspection Hubble Flows      │
├───────────────────────────────────┼────────┼────────────────────────────────┤
│ 5. Sandboxing gVisor & Seccomp    │  20%   │ • RuntimeClass gvisor active   │
│                                   │        │ • Profil Seccomp SPO appliqué  │
└───────────────────────────────────┴────────┴────────────────────────────────┘
```

---

## 🏅 Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **Defense-in-Depth** | Stratégie de sécurité par couches successives indépendantes |
| **ESO** | External Secrets Operator |

---

## 🏋️ Exercices & Corrigés

**Exercice 1 :** Quel est l'intérêt fondamental de superposer **5 couches de sécurité indépendantes (Defense-in-Depth)** sur le cluster Kubernetes de la BCC ?

**Corrigé :** Dans une approche Defense-in-Depth, on part du principe qu'**aucune couche de sécurité individuelle n'est infaillible**. Si un attaquant réussit à exploiter une faille applicative RCE (Couche 0), la tentative d'exécution de commande est bloquée par l'isolation du Sandbox **gVisor (Couche 5)**. S'il contourne le sandbox, le filtrage **Cilium L7 (Couche 4)** l'empêche de contacter d'autres microservices internes. S'il tente d'accéder aux données, les mots de passe BDD sont éphémères grâce à **Vault (Couche 3)**, et il n'existe aucune clé cloud statique à voler grâce à **IRSA (Couche 1)**. L'attaquant est bloqué à chaque étape.

**Exercice 2 :** Dans la grille J120, quelle est la preuve d'audit démontrant qu'aucune clé d'accès cloud n'est exposée ?

**Corrigé :** La preuve d'audit est double : 1) L'inspection du code source et des manifestes GitOps montre une absence totale de variables `AWS_ACCESS_KEY_ID` ou `AWS_SECRET_ACCESS_KEY`. 2) L'inspection de l'objet ServiceAccount Kubernetes montre l'annotation `eks.amazonaws.com/role-arn`, prouvant que l'authentification est déléguée à 100% au service AWS STS via des jetons temporaires signés par OIDC.

---

## ❓ Banque de Questions & Test du Jour

**Q1 :** Que désigne le principe de sécurité "Defense-in-Depth" (Défense en profondeur) ?
- A) L'installation de plusieurs couches de sécurité indépendantes de telle sorte que si une couche est franchie, la suivante bloque l'attaquant
- B) L'enterrement des serveurs sous terre
- C) L'utilisation de mots de passe de 2 caractères
- D) La suppression des sauvegardes

**Réponse : A**

**Q2 :** Dans l'architecture J120, quel opérateur Kubernetes assure la liaison entre les rôles HashiCorp Vault et les secrets natifs du cluster ?
- A) External Secrets Operator (ESO)
- B) Paint
- C) Word
- D) MS-DOS

**Réponse : A**

**Q3 :** Quel composant assure l'isolation du noyau pour les conteneurs non fiables en interceptant les appels système en Userspace ?
- A) gVisor (runsc)
- B) Systemd
- C) Gzip
- D) BGP Router

**Réponse : A**

**Q4 :** Quelle technologie permet à Cilium de bloquer les requêtes HTTP `DELETE` tout en autorisant les requêtes HTTP `GET` entre deux microservices ?
- A) CiliumNetworkPolicy (Filtrage Niveau 7)
- B) Câble RJ45
- C) Clavier USB
- D) BIOS

**Réponse : A**

**Q5 :** Dans le projet J120, comment les clés de base de données sont-elles renouvelées ?
- A) Elles sont générées dynamiquement avec un TTL court par HashiCorp Vault et révoquées automatiquement à expiration
- B) Par courrier postal
- C) Elles ne sont jamais modifiées
- D) En redémarrant le routeur

**Réponse : A**

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
