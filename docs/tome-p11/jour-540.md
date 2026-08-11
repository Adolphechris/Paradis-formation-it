# TOME P11 — DevSecOps, Cloud Security & Gouvernance — Jour 540 (6h) : Projet Intégrateur Semestre 12 — Partie 4 : Déploiement d'une Plateforme DevSecOps Complète

> [!NOTE]
> **Objectifs pédagogiques :**
> - Assembler en une architecture cohérente tous les composants DevSecOps étudiés dans le Semestre 12 : CI/CD sécurisé, SAST/DAST, SBOM, Kubernetes Hardening, CSPM et IR
> - Déployer et valider un **pipeline DevSecOps de bout-en-bout** : du commit développeur au déploiement Kubernetes sécurisé en production
> - Rédiger un **rapport de posture de sécurité** couvrant la classification des données, le CSPM, le score SLSA et le plan IR
> - Conduire une **revue d'architecture Security** (Threat Modeling simplifié) de la plateforme assemblée
>
> **Compétences visées :** `SEC-03` (A), `SEC-05` (A), `SEC-07` (A), `POL-02` (A), `PRO-01` (A) — DevSecOps Integration, Architecture Review

---

## Module 1 — Architecture de la Plateforme DevSecOps PARADIS (2h)

### 📖 Narration — L'Ambition du Projet Intégrateur

Depuis le début du Semestre 12, chaque leçon a apporté une pièce du puzzle DevSecOps :
- **J521** : Architecture Zero Trust (réseau)
- **J523** : Threat Modeling (conception)
- **J524** : API Security (développement)
- **J525** : Cryptographie PQC (chiffrement)
- **J526** : IAM Avancé (identités)
- **J527** : SIEM/UEBA (détection)
- **J531** : Secure SDLC (pipeline CI/CD)
- **J532** : Cloud-Native Security (Istio/OPA)
- **J533** : Pentest Méthodologie (validation offensive)
- **J535** : Data Security & DLP (données)
- **J536** : Supply Chain Security (SBOM/Sigstore)
- **J537** : Kubernetes Hardening (runtime)
- **J538** : CSPM & Gouvernance Cloud (conformité)
- **J539** : Incident Response (réaction)

Ce projet intégrateur consiste à **assembler toutes ces pièces en une plateforme cohérente** pour l'organisation fictive PARADIS Finance.

### 🔍 Anatomie de la Plateforme Cible

```
ARCHITECTURE DEVSECOPS — PARADIS FINANCE (CIBLE)

 ┌─────────────────────────────────────────────────────────────────────────┐
 │  COUCHE 1 : DÉVELOPPEMENT (Secure SDLC)                                  │
 │  ┌──────────┐  ┌──────────────┐  ┌──────────────────────────────────┐   │
 │  │ GitLab   │→ │ CI/CD Pipeline│→ │ SAST (Semgrep) + SCA (Trivy/Syft)│   │
 │  │ (code)   │  │ (GitLab CI)  │  │ + SBOM CycloneDX + Cosign Sign   │   │
 │  └──────────┘  └──────────────┘  └──────────────────────────────────┘   │
 ├─────────────────────────────────────────────────────────────────────────┤
 │  COUCHE 2 : RUNTIME (Kubernetes Hardened)                                │
 │  ┌────────────────────────────────────────────────────────────────────┐  │
 │  │ Namespace: app-production (PSA: restricted)                         │  │
 │  │  ┌──────────────┐   ┌──────────────┐   ┌──────────────────┐        │  │
 │  │  │ API Backend  │   │ Postgres DB  │   │ Redis Cache      │        │  │
 │  │  │ (non-root)   │   │ (chiffrée)   │   │ (TLS)            │        │  │
 │  │  └──────┬───────┘   └──────────────┘   └──────────────────┘        │  │
 │  │  NetworkPolicy: Ingress Only From Istio Sidecar                     │  │
 │  │  OPA/Gatekeeper: No :latest, No Privileged, Tags Requis             │  │
 │  │  Falco: Runtime Detection Rules Actives                             │  │
 │  └────────────────────────────────────────────────────────────────────┘  │
 ├─────────────────────────────────────────────────────────────────────────┤
 │  COUCHE 3 : OBSERVABILITÉ & DÉTECTION                                    │
 │  ┌──────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
 │  │ Prometheus│  │ Grafana       │  │ Microsoft    │  │ Falco       │    │
 │  │ (métriques│  │ (dashboards)  │  │ Sentinel     │  │ (runtime)   │    │
 │  │  )        │  │               │  │ (SIEM/UEBA)  │  │             │    │
 │  └──────────┘  └──────────────┘  └──────────────┘  └──────────────┘    │
 ├─────────────────────────────────────────────────────────────────────────┤
 │  COUCHE 4 : GOUVERNANCE & CONFORMITÉ                                     │
 │  ┌──────────────┐  ┌────────────────┐  ┌──────────────────────────┐     │
 │  │ Azure Policy  │  │ CSPM (Defender)│  │ DLP (Purview)            │     │
 │  │ (conformité)  │  │ (posture score)│  │ (classification données) │     │
 │  └──────────────┘  └────────────────┘  └──────────────────────────┘     │
 └─────────────────────────────────────────────────────────────────────────┘
```

---

## Module 2 — Déploiement du Pipeline DevSecOps Complet (2h)

### 🛠️ Atelier Pratique — Pipeline GitLab CI DevSecOps de Bout-en-Bout

```yaml
# .gitlab-ci.yml — Pipeline DevSecOps PARADIS Finance (Production-Grade)
stages:
  - static-analysis
  - build-sign
  - sca-sbom
  - kubernetes-admission
  - deploy

variables:
  IMAGE_NAME: "registry.paradis.internal/app-backend"
  IMAGE_TAG:  "${CI_COMMIT_SHORT_SHA}"
  FULL_IMAGE: "${IMAGE_NAME}:${IMAGE_TAG}"
  NAMESPACE:  "app-production"

# ═══════════════════════════════════════════════════
# ÉTAPE 1 : ANALYSE STATIQUE DE CODE (SAST)
# ═══════════════════════════════════════════════════
sast-semgrep:
  stage: static-analysis
  image: returntocorp/semgrep:latest
  script:
    - semgrep scan --config=p/python --config=p/owasp-top-ten
                   --json --output=reports/sast-report.json .
    - |
      CRITICAL_COUNT=$(jq '[.results[] | select(.extra.severity == "ERROR")] | length' reports/sast-report.json)
      echo "Findings SAST CRITIQUE : ${CRITICAL_COUNT}"
      if [ "${CRITICAL_COUNT}" -gt "0" ]; then
        echo "[❌ SAST] Des vulnérabilités critiques ont été détectées. Pipeline arrêté."
        exit 1
      fi
      echo "[✅ SAST] Analyse Semgrep réussie. Aucune vulnérabilité critique."
  artifacts:
    paths: [reports/sast-report.json]
    when: always

# ═══════════════════════════════════════════════════
# ÉTAPE 2 : BUILD & SIGNATURE COSIGN
# ═══════════════════════════════════════════════════
build-and-sign:
  stage: build-sign
  image: docker:24-dind
  script:
    - docker build -t "${FULL_IMAGE}" .
    - docker push "${FULL_IMAGE}"
    - cosign sign --key cosign.key "${FULL_IMAGE}"
    - echo "[✅ BUILD] Image construite et signée : ${FULL_IMAGE}"

# ═══════════════════════════════════════════════════
# ÉTAPE 3 : GÉNÉRATION SBOM & SCAN SCA
# ═══════════════════════════════════════════════════
sbom-and-sca:
  stage: sca-sbom
  image: anchore/syft:latest
  script:
    - syft "${FULL_IMAGE}" -o cyclonedx-json > reports/sbom.cyclonedx.json
    - grype sbom:reports/sbom.cyclonedx.json --fail-on critical --output json > reports/grype-report.json
    - echo "[✅ SCA] SBOM généré et aucune CVE critique détectée."
  artifacts:
    paths: [reports/sbom.cyclonedx.json, reports/grype-report.json]
    when: always

# ═══════════════════════════════════════════════════
# ÉTAPE 4 : VALIDATION OPA/GATEKEEPER
# ═══════════════════════════════════════════════════
kubernetes-policy-check:
  stage: kubernetes-admission
  image: openpolicyagent/conftest:latest
  script:
    - |
      conftest test k8s/deployment.yaml \
        --policy policies/no-latest-image.rego \
        --policy policies/no-privileged.rego \
        --policy policies/require-security-context.rego \
        --output json > reports/policy-check.json
      echo "[✅ OPA] Manifestes Kubernetes conformes aux politiques de sécurité."
  artifacts:
    paths: [reports/policy-check.json]

# ═══════════════════════════════════════════════════
# ÉTAPE 5 : DÉPLOIEMENT KUBERNETES (PRODUCTION)
# ═══════════════════════════════════════════════════
deploy-production:
  stage: deploy
  image: bitnami/kubectl:latest
  environment: production
  when: manual  # Déploiement en production = approbation manuelle requise
  script:
    - cosign verify --key cosign.pub "${FULL_IMAGE}"
    - kubectl set image deployment/api-backend api="${FULL_IMAGE}" -n "${NAMESPACE}"
    - kubectl rollout status deployment/api-backend -n "${NAMESPACE}" --timeout=120s
    - echo "[✅ DEPLOY] ${FULL_IMAGE} déployé en production. Intégrité vérifiée par Cosign."
```

---

## Module 3 — Rapport de Posture de Sécurité & Leçons Apprises (1h30)

### 🛠️ Script Python : DevSecOps Posture Report Generator

```python
#!/usr/bin/env python3
"""
PARADIS — DevSecOps Posture Report Generator
Génère un rapport de posture de sécurité consolidé pour la plateforme DevSecOps.
"""
from datetime import datetime

class DevSecOpsPostureReport:
    def __init__(self, org: str):
        self.org = org
        self.date = datetime.now().strftime("%Y-%m-%d")
        self.checks = []

    def add_check(self, domaine: str, controle: str, statut: str, detail: str):
        self.checks.append({
            "domaine": domaine,
            "controle": controle,
            "statut": statut,  # PASS | FAIL | WARN
            "detail": detail
        })

    def generate(self):
        print("=" * 65)
        print(f"  RAPPORT DE POSTURE DEVSECOPS — {self.org}")
        print(f"  Date : {self.date}")
        print("=" * 65)

        # Regroupement par domaine
        domaines = {}
        for check in self.checks:
            d = check["domaine"]
            if d not in domaines:
                domaines[d] = []
            domaines[d].append(check)

        total_pass = sum(1 for c in self.checks if c["statut"] == "PASS")
        total = len(self.checks)

        for domaine, checks in domaines.items():
            print(f"\n  📋 {domaine}")
            for c in checks:
                icon = "✅" if c["statut"] == "PASS" else ("⚠️" if c["statut"] == "WARN" else "❌")
                print(f"    {icon} [{c['statut']}] {c['controle']}")
                print(f"         → {c['detail']}")

        score = (total_pass / total) * 100
        print(f"\n{'='*65}")
        print(f"  SCORE GLOBAL DE POSTURE : {total_pass}/{total} ({score:.0f}%)")
        if score >= 80:
            print("  [✅ CONFORME] Objectif PARADIS >= 80% atteint.")
        else:
            print("  [❌ NON CONFORME] Actions correctives requises. Cible : >= 80%.")
        print("=" * 65)


if __name__ == "__main__":
    rapport = DevSecOpsPostureReport("PARADIS FINANCE")

    rapport.add_check("Supply Chain Security", "SBOM généré à chaque build", "PASS", "CycloneDX JSON archivé dans GitLab Artifacts")
    rapport.add_check("Supply Chain Security", "Images signées avec Cosign (Sigstore)", "PASS", "Signature vérifiée avant tout déploiement")
    rapport.add_check("Supply Chain Security", "Niveau SLSA atteint", "WARN", "SLSA 2 actuel — cible SLSA 3 d'ici T2")

    rapport.add_check("Kubernetes Security", "PSA Namespace : restricted", "PASS", "Namespace app-production labelisé enforce=restricted")
    rapport.add_check("Kubernetes Security", "OPA/Gatekeeper policies actives", "PASS", "3 ConstraintTemplates : NoLatest, NoPrivileged, RequireSecCtx")
    rapport.add_check("Kubernetes Security", "Network Policies configurées", "PASS", "Micro-segmentation L3/L4 entre tous les Pods")
    rapport.add_check("Kubernetes Security", "Falco Runtime Detection", "PASS", "8 règles custom activées, alertes Slack actives")

    rapport.add_check("Data Security", "Classification des données documentée", "PASS", "Grille 4 niveaux validée par DPO")
    rapport.add_check("Data Security", "DLP Endpoint déployé", "WARN", "Couverture : 80% des endpoints — reste 20% à migrer")
    rapport.add_check("Data Security", "Masquage des PII en pre-prod", "PASS", "DataMasking Engine actif sur DB staging")

    rapport.add_check("Cloud Governance", "CSPM Score Defender for Cloud", "PASS", "Score actuel : 87% (cible : >= 80%)")
    rapport.add_check("Cloud Governance", "Azure Policy : Tagging obligatoire", "PASS", "Effet Deny actif sur 3 abonnements Azure")
    rapport.add_check("Cloud Governance", "CloudTrail/Azure Monitor actif", "FAIL", "CloudTrail inactif en région eu-west-3 — CRITIQUE")

    rapport.add_check("Incident Response", "Playbook IR Ransomware validé", "PASS", "Testé en exercice tabletop (Q3)")
    rapport.add_check("Incident Response", "Notification CNIL < 72h documentée", "PASS", "Procédure DPO intégrée au Playbook IR")

    rapport.generate()
```

---

## Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **Tabletop Exercise** | Exercice de simulation d'incident sur table (sans action réelle) pour tester les procédures IR et la cellule de crise |
| **Conftest** | Outil CLI permettant de valider des configurations (YAML/JSON) contre des politiques OPA Rego |
| **SCA** | Software Composition Analysis — Analyse des composants open-source d'une application pour détecter les vulnérabilités |
| **SLSA** | Supply-chain Levels for Software Artifacts — Voir J536 |
| **Rollout** | Déploiement progressif d'une nouvelle version dans Kubernetes sans interruption de service |

---

## Exercices Pratiques

### Exercice 1 — Évaluation de Maturité DevSecOps

Pour chacun des 5 domaines DevSecOps suivants, évaluez la maturité de votre organisation (ou de l'organisation fictive PARADIS) sur une échelle de 1 (Initial) à 5 (Optimisé), et justifiez votre notation :

1. **Supply Chain Security** (SBOM, signatures, SLSA)
2. **Kubernetes Security** (PSA, OPA, Falco, Network Policies)
3. **Data Security** (Classification, DLP, Masquage)
4. **Cloud Governance** (CSPM, Azure Policy, Audit Trail)
5. **Incident Response** (Playbooks, Exercices, Notification CNIL)

**Corrigé guidé (PARADIS Finance) :**
1. Supply Chain : **4/5** — SBOM et signatures actifs, SLSA 3 non encore atteint.
2. Kubernetes : **5/5** — PSA Restricted, OPA, Falco et NetworkPolicies tous opérationnels.
3. Data Security : **3/5** — Classification documentée, DLP à 80% de couverture, besoin de terminer le déploiement.
4. Cloud Governance : **4/5** — CSPM à 87%, CloudTrail manquant dans 1 région (gap critique).
5. Incident Response : **4/5** — Playbooks validés en tabletop, délai de notification CNIL documenté mais non testé en conditions réelles.

---

## Banque QCM — 5 Questions

**Q1.** Dans le pipeline CI/CD DevSecOps décrit dans ce cours, pourquoi l'étape de déploiement en production nécessite-t-elle une **approbation manuelle** (`when: manual`) ?

- A) Pour que l'équipe de développement puisse ajouter de nouvelles fonctionnalités de dernière minute.
- B) Pour instaurer un contrôle humain ("human-in-the-loop") sur la dernière étape critique avant que le code n'atteigne les utilisateurs finaux, réduisant le risque de déploiement accidentel ou malveillant. ✅
- C) Pour permettre aux opérations de facturer le déploiement.
- D) Par limitation technique de GitLab CI.

**Q2.** Pourquoi vérifier la signature **Cosign** d'une image **au moment du déploiement** (et pas seulement lors du build) ?

- A) Pour accélérer le déploiement.
- B) Parce que quelqu'un pourrait avoir remplacé l'image dans le registre entre le build et le déploiement. Vérifier la signature au moment du déploiement garantit que l'image déployée est exactement celle qui a été signée. ✅
- C) Pour compresser l'image avant déploiement.
- D) Parce que Kubernetes ne comprend pas les images non signées.

**Q3.** Qu'est-ce qu'un **Tabletop Exercise** (exercice sur table) dans le contexte de la Réponse aux Incidents ?

- A) Un exercice de dessin de diagrammes d'architecture réseau.
- B) Une simulation d'incident conduite en salle de réunion où les participants discutent de leurs réponses à un scénario d'attaque sans effectuer d'actions réelles sur les systèmes, permettant de tester les procédures et la coordination. ✅
- C) Un test de charge des serveurs en production.
- D) Un audit de code source en pair-programming.

**Q4.** Dans le rapport de posture généré, CloudTrail inactif dans une région est noté **FAIL**. Pourquoi est-ce un risque critique ?

- A) CloudTrail consomme trop de bande passante dans cette région.
- B) Sans CloudTrail, aucune action API dans cette région n'est auditée. Un attaquant peut créer des ressources, exfiltrer des données ou modifier des configurations sans laisser de trace. ✅
- C) CloudTrail ralentit les déploiements CI/CD dans cette région.
- D) Cette région est moins performante sans CloudTrail.

**Q5.** Quelle est la principale valeur ajoutée d'un **pipeline DevSecOps** par rapport à un pipeline DevOps classique ?

- A) Il déploie les applications plus rapidement.
- B) La sécurité est intégrée automatiquement à chaque étape du cycle de vie logiciel (SAST, SBOM, signature, validation OPA) plutôt qu'ajoutée comme une vérification manuelle ponctuelle en fin de processus. ✅
- C) Il utilise plus de serveurs.
- D) Il supprime la nécessité de tests unitaires.

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
