# TOME P12 — Architecture Ultime, Leadership Technique & Capstone Final — Jour 582 (6h) : Révision Intensive Semestres 5–8 — Cloud, Kubernetes, CI/CD & Observabilité

> [!NOTE]
> **Objectifs pédagogiques :**
> - Consolider les architectures **Cloud AWS/GCP/Azure** : IAM, VPC, services managés, calcul des coûts et optimisation FinOps
> - Réviser le cycle de vie complet **Kubernetes** : Pod, Deployment, Service, Ingress, RBAC, HPA, NetworkPolicy
> - Maîtriser les pipelines **CI/CD GitOps** : GitHub Actions, ArgoCD, GitLab CI, Flux, stratégies de déploiement (Blue/Green, Canary)
> - Revoir l'**Observabilité** (Pilliers : Métriques Prometheus, Logs Loki, Traces Jaeger/Tempo, OpenTelemetry)
>
> **Compétences visées :** `DEV-01` (A), `OPS-01` (A), `OPS-02` (A), `MON-01` (A) — Cloud, Kubernetes, CI/CD, Observabilité

---

## Module 1 — Cloud & Kubernetes (2h)

### 📖 Récapitulatif des Concepts Clés S5–S6

```
ARCHITECTURE AWS — COMPOSANTS ESSENTIELS

  REGION (ex: eu-west-3 Paris)
  ├── VPC (10.0.0.0/16)
  │   ├── Public Subnet (10.0.1.0/24) — AZ-a
  │   │   └── EC2 t3.medium (Bastion) + ALB (Load Balancer)
  │   ├── Private Subnet (10.0.2.0/24) — AZ-a
  │   │   └── EC2 m5.xlarge (App Server) + RDS PostgreSQL Multi-AZ
  │   └── Private Subnet (10.0.3.0/24) — AZ-b
  │       └── EC2 m5.xlarge (App Server) [HA]
  ├── Internet Gateway (IGW) → Sortie publique
  ├── NAT Gateway → Sortie Internet subnets privés
  ├── Route53 (DNS) → CloudFront (CDN) → ALB
  └── S3 Bucket (Objets) + DynamoDB (NoSQL) + ElastiCache Redis

  IAM — CONCEPTS DE SÉCURITÉ CLOUD CRITIQUES :
  ┌─────────────────────────────────────────────────────────────────┐
  │  Principe du Moindre Privilège : attribuer le minimum requis   │
  │  IAM Role vs IAM User : Rôles pour services, Users pour humains│
  │  IAM Policy : JSON document Effet/Action/Resource/Condition    │
  │  SCP (Service Control Policy) : Limites au niveau Organisation │
  │  Resource-based Policy : S3 Bucket Policy, KMS Key Policy      │
  └─────────────────────────────────────────────────────────────────┘
```

### 🔍 Kubernetes — Commandes Kubectl Essentielles

```bash
# ─── KUBECTL — COMMANDES CRITIQUES ────────────────────────────────────────

# Inspection & Debug
kubectl get pods -n production -o wide          # Pods avec node et IP
kubectl describe pod mon-pod -n production       # Événements & état détaillé
kubectl logs mon-pod -n production -f --tail=100 # Logs temps réel
kubectl exec -it mon-pod -n production -- bash   # Shell interactif dans pod
kubectl get events -n production --sort-by='.lastTimestamp'  # Événements triés

# Déploiement & Rollout
kubectl apply -f deployment.yaml                # Appliquer manifeste
kubectl rollout status deployment/mon-app       # Suivi du rollout
kubectl rollout history deployment/mon-app      # Historique des révisions
kubectl rollout undo deployment/mon-app --to-revision=3  # Rollback vers V3
kubectl scale deployment mon-app --replicas=5   # Scaling manuel

# RBAC — Contrôle d'Accès
kubectl auth can-i delete pods --namespace=production --as=user@example.com
kubectl create rolebinding dev-read --role=view --user=dev@example.com -n dev

# Ressources & Limites
kubectl top pods -n production                  # CPU/RAM en temps réel
kubectl top nodes                               # Utilisation des nodes

# Debugging Réseau
kubectl run debug --image=busybox --rm -it --restart=Never -- sh
kubectl port-forward svc/mon-service 8080:80   # Forward local → pod
```

---

## Module 2 — CI/CD GitOps & Observabilité (2h)

### 🔍 Pipeline CI/CD GitOps — GitHub Actions + ArgoCD

```yaml
# ─── GITHUB ACTIONS — PIPELINE CI COMPLET ────────────────────────────────
# .github/workflows/ci.yml

name: CI/CD Pipeline PARADIS
on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

env:
  REGISTRY: ghcr.io
  IMAGE_NAME: ${{ github.repository }}

jobs:
  # ÉTAPE 1 : Tests & Sécurité
  test-and-scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Run unit tests
        run: python -m pytest tests/ --cov=src --cov-report=xml
      - name: SAST — Semgrep Security Scan
        uses: returntocorp/semgrep-action@v1
        with:
          config: "p/owasp-top-ten"
      - name: SCA — Dependency Check
        run: pip-audit --requirement requirements.txt

  # ÉTAPE 2 : Build & Push Image Docker
  build-push:
    needs: test-and-scan
    runs-on: ubuntu-latest
    permissions:
      contents: read
      packages: write
    steps:
      - uses: actions/checkout@v4
      - name: Build & Push Docker Image
        uses: docker/build-push-action@v5
        with:
          push: ${{ github.ref == 'refs/heads/main' }}
          tags: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}:${{ github.sha }}
      - name: Container Image Scan — Trivy
        uses: aquasecurity/trivy-action@master
        with:
          image-ref: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}:${{ github.sha }}
          severity: 'CRITICAL,HIGH'

  # ÉTAPE 3 : Mise à jour manifeste GitOps → ArgoCD sync auto
  update-gitops:
    needs: build-push
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - name: Update Kubernetes manifest with new image tag
        run: |
          sed -i "s|image: .*/mon-app:.*|image: ghcr.io/paradis/mon-app:${{ github.sha }}|" k8s/deployment.yaml
          git config user.email "ci@paradis.io"
          git add k8s/deployment.yaml
          git commit -m "ci: update image to ${{ github.sha }}"
          git push
```

### 🔍 Les 3 Piliers de l'Observabilité

```
STACK OBSERVABILITÉ PARADIS — GRAFANA + LGTM STACK

  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
  │   MÉTRIQUES     │  │     LOGS        │  │    TRACES       │
  │  Prometheus     │  │   Grafana Loki  │  │  Grafana Tempo  │
  │  (time-series)  │  │   (log index)   │  │  (distributed)  │
  └────────┬────────┘  └────────┬────────┘  └────────┬────────┘
           └──────────────────┬─┘                   │
                              ▼                     │
                    ┌─────────────────┐             │
                    │ GRAFANA CLOUD   │ ◄───────────┘
                    │ (Unified UI)    │
                    └────────┬────────┘
                             │
           Correlation TraceID ←→ Log ←→ Métrique

  RÈGLE D'ALERTE PROMETHEUS (PromQL) :
  alert: HighErrorRate
  expr: |
    sum(rate(http_requests_total{status=~"5.."}[5m]))
    / sum(rate(http_requests_total[5m])) > 0.05
  for: 2m
  labels:
    severity: critical
  annotations:
    summary: "Taux d'erreur HTTP > 5% depuis 2 minutes"
```

---

## Module 3 — Atelier Pratique : GitOps Deployment Simulator (1h30)

### 🛠️ Script Python : CI/CD Pipeline Simulator & PromQL Alert Evaluator

```python
#!/usr/bin/env python3
"""
PARADIS — CI/CD Pipeline Simulator & Deployment Strategy Comparator
Simule un pipeline CI/CD avec Blue/Green et Canary deployments.
"""
import time
import random
from dataclasses import dataclass, field
from typing import List, Dict, Optional
from enum import Enum

class DeploymentStrategy(Enum):
    ROLLING_UPDATE = "Rolling Update"
    BLUE_GREEN     = "Blue/Green"
    CANARY         = "Canary"

@dataclass
class Release:
    version       : str
    image_tag     : str
    test_pass_rate: float  # 0.0 – 1.0
    error_rate    : float  # % d'erreurs HTTP 5xx en production

class CICDPipeline:
    SAST_THRESHOLD     = 0.0    # Aucune CRITICAL tolérée
    COVERAGE_THRESHOLD = 80.0   # Couverture de code minimum (%)

    def __init__(self, app_name: str):
        self.app_name     = app_name
        self.deploy_log   : List[dict] = []

    def run_tests(self, release: Release) -> dict:
        passed     = release.test_pass_rate >= 0.95
        coverage   = random.uniform(75.0, 98.0)
        cov_ok     = coverage >= self.COVERAGE_THRESHOLD
        critical_vulns = 0 if random.random() > 0.1 else random.randint(1, 3)
        sast_ok    = critical_vulns == 0
        return {
            "stage"        : "test-and-scan",
            "tests_pass"   : passed,
            "coverage_pct" : round(coverage, 1),
            "coverage_ok"  : cov_ok,
            "critical_vulns": critical_vulns,
            "sast_ok"      : sast_ok,
            "gate_passed"  : passed and cov_ok and sast_ok
        }

    def build_image(self, release: Release) -> dict:
        image_uri = f"ghcr.io/paradis/{self.app_name}:{release.image_tag}"
        has_high_cve = random.random() < 0.15
        return {
            "stage"          : "build-push",
            "image_uri"      : image_uri,
            "trivy_high_cves": random.randint(0, 3) if has_high_cve else 0,
            "image_size_mb"  : round(random.uniform(80, 400), 1),
            "gate_passed"    : not has_high_cve
        }

    def deploy(self, release: Release, strategy: DeploymentStrategy) -> dict:
        deploy_ok = release.error_rate < 0.05  # Seuil erreur 5%
        return {
            "stage"        : "deploy",
            "strategy"     : strategy.value,
            "version"      : release.version,
            "error_rate_pct": round(release.error_rate * 100, 2),
            "deploy_ok"    : deploy_ok,
            "rollback"     : not deploy_ok,
            "message"      : "✅ Déploiement réussi" if deploy_ok else "❌ Rollback automatique déclenché"
        }

    def run_full_pipeline(self, release: Release, strategy: DeploymentStrategy) -> bool:
        print(f"\n{'='*65}")
        print(f"  🚀 PIPELINE CI/CD — {self.app_name} v{release.version} [{strategy.value}]")
        print(f"{'='*65}")

        stages = [
            self.run_tests(release),
            self.build_image(release),
        ]

        all_passed = True
        for stage in stages:
            icon = "✅" if stage["gate_passed"] else "❌"
            print(f"  {icon} Stage [{stage['stage']:15s}] : {'GATE PASSÉ' if stage['gate_passed'] else 'GATE BLOQUÉ'}")
            if stage["stage"] == "test-and-scan":
                print(f"       Coverage: {stage['coverage_pct']}%"
                      f" | Vulnérabilités CRITICAL: {stage['critical_vulns']}")
            if not stage["gate_passed"]:
                all_passed = False
                print(f"  ⛔ Pipeline interrompu à l'étape [{stage['stage']}]")
                break

        if all_passed:
            deploy_result = self.deploy(release, strategy)
            icon = "✅" if deploy_result["deploy_ok"] else "❌"
            print(f"  {icon} Stage [deploy         ] : {deploy_result['message']}")
            print(f"       Taux erreur prod: {deploy_result['error_rate_pct']}% | Stratégie: {strategy.value}")
            self.deploy_log.append(deploy_result)
            return deploy_result["deploy_ok"]
        return False


if __name__ == "__main__":
    pipeline = CICDPipeline("paradis-api")

    releases = [
        Release("1.5.0", "sha-abc123", test_pass_rate=0.98, error_rate=0.012),
        Release("1.6.0", "sha-def456", test_pass_rate=0.92, error_rate=0.003),  # Tests < 95%
        Release("1.7.0", "sha-ghi789", test_pass_rate=0.97, error_rate=0.082),  # Erreur prod élevée
    ]

    random.seed(42)
    for i, (release, strategy) in enumerate(zip(releases, [
        DeploymentStrategy.ROLLING_UPDATE,
        DeploymentStrategy.BLUE_GREEN,
        DeploymentStrategy.CANARY
    ])):
        result = pipeline.run_full_pipeline(release, strategy)

    print(f"\n  📊 Bilan : {sum(1 for d in pipeline.deploy_log if d['deploy_ok'])}/{len(releases)} déploiements réussis")
```

---

## Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **HPA** | Horizontal Pod Autoscaler — Scaling automatique du nombre de pods Kubernetes |
| **LGTM** | Logs, Grafana, Traces, Metrics — Stack observabilité open source de Grafana Labs |
| **PromQL** | Prometheus Query Language — Langage de requête pour Prometheus |
| **GitOps** | Paradigme d'opérations où Git est la source unique de vérité pour l'état de l'infrastructure |
| **SCA** | Software Composition Analysis — Analyse des dépendances open source (CVEs) |
| **Canary** | Stratégie de déploiement dérivant progressivement le trafic vers la nouvelle version (1% → 10% → 100%) |

---

## Exercices Pratiques

### Exercice 1 — Analyse PromQL & Alerting

La requête PromQL suivante est utilisée pour une alerte :

```
sum(rate(http_requests_total{status=~"5.."}[5m])) / sum(rate(http_requests_total[5m])) > 0.05
```

1. Que mesure cette expression ?
2. Le seuil de `0.05` représente quoi en pratique ?
3. Si l'on observe 200 req/s dont 15 renvoient HTTP 503, l'alerte se déclenchera-t-elle ?

**Corrigé :**
1. Le **taux d'erreurs HTTP 5xx** sur les 5 dernières minutes divisé par le taux total de requêtes = le **ratio d'erreurs HTTP serveur**.
2. `0.05` = **5%** de taux d'erreurs.
3. Taux = $\frac{15}{200} = 0.075 = 7.5\% > 5\%$ → **Oui, l'alerte se déclenchera**. ✅

---

## Banque QCM — 5 Questions

**Q1.** Dans Kubernetes, quelle ressource définit le **nombre de replicas** d'un Pod et la politique de mise à jour (Rolling Update, Recreate) ?

- A) Pod
- B) Service
- C) Deployment ✅
- D) ConfigMap

**Q2.** Qu'est-ce que le **GitOps** ?

- A) Un client Git graphique.
- B) Un paradigme où l'état désiré de l'infrastructure et des applications est déclaré dans Git (source unique de vérité), et où des opérateurs (ArgoCD, Flux) synchronisent automatiquement l'état réel. ✅
- C) Un plugin GitHub Actions.
- D) Un système de gestion de bases de données.

**Q3.** Quelle est la différence entre un déploiement **Blue/Green** et un déploiement **Canary** ?

- A) Il n'y a aucune différence.
- B) Blue/Green bascule 100% du trafic instantanément vers la nouvelle version (avec rollback rapide), tandis que Canary dérive progressivement un faible pourcentage du trafic vers la nouvelle version pour tester en production. ✅
- C) Blue/Green est réservé aux microservices, Canary aux monolithes.
- D) Canary est moins sûr que Blue/Green.

**Q4.** La commande `kubectl rollout undo deployment/mon-app --to-revision=3` effectue :

- A) La suppression du déploiement revision 3.
- B) Un rollback (retour en arrière) vers la révision 3 du déploiement, restaurant l'image et la configuration de cette version précédente. ✅
- C) La mise en pause du déploiement.
- D) La création d'une nouvelle révision 3.

**Q5.** Dans la stack Grafana LGTM, quel composant est responsable du **stockage et de la requête des logs** ?

- A) Prometheus
- B) Tempo
- C) Loki ✅
- D) Mimir

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
