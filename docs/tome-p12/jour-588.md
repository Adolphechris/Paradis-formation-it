# TOME P12 — Architecture Ultime, Leadership Technique & Capstone Final — Jour 588 (6h) : Certification Sprint Final — CISSP, CISM, AWS SAP, CKS — Last Mile Preparation

> [!NOTE]
> **Objectifs pédagogiques :**
> - Construire une **stratégie de préparation "Dernière Ligne Droite" (Last Mile)** pour les certifications majeures (CISSP, CISM, AWS SAP, CKS)
> - Décoder la **mécanique d'examen CAT (Computer Adaptive Testing)** et le mindset managérial ("Think like a Manager") requis pour le CISSP/CISM
> - Maîtriser le **dépannage sous pression** pour l'examen pratique CKS (Certified Kubernetes Security Specialist - 2h en environnement réel)
> - Établir un **plan d'action J-7** pour aborder l'examen dans des conditions physiques, mentales et techniques optimales
>
> **Compétences visées :** Toutes compétences `SEC`, `CLD`, `OPS`, `GRC` — Certification Excellence, Professional Credentials

---

## Module 1 — Strategie CISSP / CISM — Think Like a Manager (2h)

### 📖 Le Mindset "Think Like a Manager"

La principale cause d'échec au **CISSP (ISC²)** ou **CISM (ISACA)** chez les ingénieurs techniques est de vouloir résoudre les problèmes avec des réponses de technicien. Le CISSP et le CISM sont des examens de **gouvernance et de gestion des risques**, pas d'implémentation de commandes.

```
RÈGLES D'OR CISSP / CISM — THINK LIKE A MANAGER / CISO

  1. LA SÉCURITÉ DOIT SOUTENIR LES OBJECTIFS MÉTIER
     Le rôle du manager de sécurité n'est pas d'interdire, mais de permettre
     l'activité économique en maintenant le risque à un niveau acceptable.

  2. LAS (LA SÉCURITÉ D'ABORD, LES HUMAINS EN PREMIER)
     La protection de la vie humaine (Human Safety / Safety of Life) surpasse
     TOUJOURS la protection des actifs, des données ou de la continuité.

  3. LA RESPONSABILITÉ INCOMBE À LA DIRECTION (Senior Management)
     La sécurité est une responsabilité de la gouvernance. Le rôle du CISO est
     d'informer, de conseiller et de recommander. La direction APPROUVE et FINANCE.

  4. PRIVILÉGIER LES PROCESSUS SUR LES TECHNOLOGIES
     Avant d'acheter un outil (WAF, SIEM), établir la politique, les rôles,
     la procédure et la sensibilisation.

  5. COMPRENDRE LE VOCABULAIRE DES RISQUES
     ALE = SLE × ARO (Annualized Loss Expectancy = Single Loss Expectancy × Annualized Rate of Occurrence)
     Cost-Benefit Analysis : Ne jamais dépenser 100k€/an pour protéger un actif qui vaut 10k€.
```

---

## Module 2 — Strategie AWS SAP & CKS Practice (2h)

### 🔍 AWS Certified Solutions Architect - Professional (SAP-C02)

L'examen **AWS SAP** se caractérise par des énoncés très longs (1 à 2 paragraphes par question) et 4 options complexes.

```
MÉTHODE DE DÉCODAGE QUESTIONS AWS SAP

  1. DÉTECTER LE MOT-CLÉ DE CONTRAINTE ("The LEAST operational overhead",
     "The MOST cost-effective", "The LOWEST latency", "HIGH AVAILABILITY")
  2. IDENTIFIER L'ARCHITECTURE CIBLE (Multi-Account AWS Organizations,
     Control Tower, Transit Gateway, Hybrid Direct Connect, Cross-Region Replication)
  3. ÉLIMINER LES OPTIONS NON CONFORMES AUX BEST PRACTICES
     - Éliminer les solutions nécessitant la gestion manuelle d'EC2 si un service managé existe
     - Éliminer les solutions sans chiffrement KMS en transit/au repos
```

### 🔍 Certified Kubernetes Security Specialist (CKS) — Examen Pratique (2h)

Contrairement aux examens QCM, le **CKS** est un examen **100% pratique** dans un terminal Linux réel avec 15 à 20 tâches à accomplir en 120 minutes.

```
STRATÉGIE DE SURVIE CKS (120 MIN — TERMINAL REEL)

  1. ALIAS & AUTOCOMPLÉTION IMMÉDIATS (30 sec)
     source <(kubectl completion bash)
     alias k=kubectl
     complete -F __start_kubectl k
     export do="--dry-run=client -o yaml"  # k run nginx $do > pod.yaml

  2. GESTION STRICTE DU TEMPS (6 min/question max)
     Si une question prend > 6 min ou si un pod ne redémarre pas → SKIP IMMÉDIATEMENT.

  3. THÈMES CRITIQUES CKS À MAÎTRISER PAR CŒUR :
     - Cluster Hardening (Kube-bench, CIS benchmarks, RBAC strict)
     - System Hardening (AppArmor profiles, seccomp, AppArmor /etc/apparmor.d/)
     - Microservice Protection (NetworkPolicy egress/ingress, mTLS Istio)
     - Supply Chain Security (Trivy scan, image digest pinning sha256)
     - Monitoring & Threat Detection (Falco rules /etc/falco/falco_rules.yaml)
```

---

## Module 3 — Atelier Pratique : Certification Exam Simulator & CKS Checklist (1h30)

### 🛠️ Script Python : CKS Task Simulator & ALE Risk Calculator

```python
#!/usr/bin/env python3
"""
PARADIS — CKS Task Simulator & Risk Calculator (CISSP ALE)
Simule les calculs de risque CISSP (ALE/SLE/ARO) et vérifie la syntaxe d'un manifeste K8s Security (CKS).
"""
import yaml
from dataclasses import dataclass
from typing import Dict, Any, List

# ─── PARTIE 1 : CISSP Risk Calculator (ALE / SLE / ARO) ───────────────────

class CISSPRatiosCalculator:
    """Calculateur de Risque Financier — CISSP Domain 1 (Risk Management)"""

    @staticmethod
    def calculate_ale(asset_value_eur: float, exposure_factor: float, aro: float) -> dict:
        """
        SLE (Single Loss Expectancy) = Asset Value × Exposure Factor (EF)
        ALE (Annualized Loss Expectancy) = SLE × ARO (Annualized Rate of Occurrence)
        """
        ef = max(0.0, min(1.0, exposure_factor))
        sle = asset_value_eur * ef
        ale = sle * aro

        return {
            "asset_value"    : f"{asset_value_eur:,.0f} €",
            "exposure_factor": f"{ef*100:.0f}%",
            "sle"            : f"{sle:,.0f} €",
            "aro"            : f"{aro} occurrence(s)/an",
            "ale"            : f"{ale:,.0f} €/an",
            "max_countermeasure_budget": f"{ale:,.0f} €/an"  # Ne pas dépenser plus que l'ALE
        }

# ─── PARTIE 2 : CKS Manifest Security Audit (CKS Practice) ───────────────

class CKSSecurityAuditor:
    """Auditeur de sécurité de manifeste Pod/Deployment Kubernetes — Examen CKS"""

    def audit_pod_spec(self, manifest_yaml: str) -> dict:
        findings = []
        score = 100

        try:
            doc = yaml.safe_load(manifest_yaml)
        except Exception as e:
            return {"valid_yaml": False, "error": str(e)}

        spec = doc.get("spec", {})
        if "template" in spec:
            pod_spec = spec["template"].get("spec", {})
        else:
            pod_spec = spec

        containers = pod_spec.get("containers", [])

        # 1. Verification SecurityContext pod-level
        pod_sec = pod_spec.get("securityContext", {})
        if not pod_sec.get("runAsNonRoot"):
            findings.append("⚠️ Pod-level: 'runAsNonRoot: true' manquant (Risque privilèges root)")
            score -= 20

        # 2. Verification conteneurs
        for c in containers:
            c_name = c.get("name", "unknown")
            c_sec  = c.get("securityContext", {})

            if c_sec.get("privileged"):
                findings.append(f"🔴 Container '{c_name}': 'privileged: true' DÉTECTÉ (Strictement interdit CKS)")
                score -= 40

            if not c_sec.get("readOnlyRootFilesystem"):
                findings.append(f"⚠️ Container '{c_name}': 'readOnlyRootFilesystem: true' manquant")
                score -= 15

            if not c_sec.get("allowPrivilegeEscalation") == False:
                findings.append(f"⚠️ Container '{c_name}': 'allowPrivilegeEscalation: false' manquant")
                score -= 15

            # Verification Image Tag (pas de :latest)
            image = c.get("image", "")
            if image.endswith(":latest") or ":" not in image:
                findings.append(f"🟡 Container '{c_name}': Image utilise ':latest' ou tag omis — utiliser un digest sha256")
                score -= 10

        return {
            "valid_yaml": True,
            "security_score": max(0, score),
            "passed_cks"    : score >= 80,
            "findings"      : findings
        }


if __name__ == "__main__":
    print("=== PARADIS — CERTIFICATION SIMULATOR & RISK CALCULATOR ===\n")

    # 1. Calculator CISSP ALE
    print("📊 CALCUL DE RISQUE CISSP (Domain 1 — Quantitative Risk Analysis)")
    calc = CISSPRatiosCalculator()
    risk = calc.calculate_ale(
        asset_value_eur = 500_000.0,  # Valeur datacenter/données
        exposure_factor = 0.40,       # 40% de perte si inondation
        aro             = 0.10        # Une fois tous les 10 ans (0.1/an)
    )
    for k, v in risk.items():
        print(f"  {k:30s} : {v}")

    print("\n" + "─"*70 + "\n")

    # 2. Auditor CKS K8s Manifest
    print("🔒 AUDIT DE SÉCURITÉ MANIFESTE KUBERNETES (CKS Practice Task)")
    auditor = CKSSecurityAuditor()

    manifest_unsafe = """
apiVersion: apps/v1
kind: Deployment
metadata:
  name: insecure-app
spec:
  replicas: 2
  template:
    spec:
      containers:
      - name: web
        image: nginx:latest
        securityContext:
          privileged: true
"""

    audit_result = auditor.audit_pod_spec(manifest_unsafe)
    print(f"  Score Sécurité : {audit_result['security_score']}/100")
    print(f"  Conforme CKS   : {'✅ OUI' if audit_result['passed_cks'] else '❌ NON — Corrections requises'}")
    print("  Constats :")
    for f in audit_result["findings"]:
        print(f"    {f}")
```

---

## Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **CAT** | Computer Adaptive Testing — Algorithme d'examen ajustant la difficulté des questions en temps réel (ex: CISSP) |
| **CKS** | Certified Kubernetes Security Specialist — Certification sécurité CNCF/Linux Foundation (100% pratique) |
| **ALE** | Annualized Loss Expectancy — Perte financière annuelle attendue liée à un risque |
| **SLE** | Single Loss Expectancy — Perte financière liée à la survenance d'un unique événement de risque |
| **ARO** | Annualized Rate of Occurrence — Fréquence annuelle estimée de survenance d'un risque |
| **EF** | Exposure Factor — Pourcentage de perte subi par un actif lors d'un incident |

---

## Exercices Pratiques

### Exercice 1 — Calcul de Rentabilité d'une Mesure de Sécurité (CISSP)

Une entreprise possède une base de données d'une valeur estimée à **2 000 000 €**. Un incident de ransomware entraînerait une perte de **50%** des données (EF = 0.50). On estime qu'une telle attaque peut survenir **une fois tous les 2 ans** (ARO = 0.5).

Une solution de sauvegarde immuable et d'EDR coûte **200 000 €/an**.

1. Calculez le SLE.
2. Calculez l'ALE avant la mesure de sécurité.
3. La solution à 200 000 €/an est-elle financièrement justifiée selon les principes CISSP ?

**Corrigé :**
1. $SLE = 2\,000\,000 \times 0.50 = \mathbf{1\,000\,000 \text{ €}}$.
2. $ALE = 1\,000\,000 \times 0.5 = \mathbf{500\,000 \text{ €/an}}$.
3. La solution coûte $200\,000 \text{ €/an} < 500\,000 \text{ €/an}$ (ALE). Elle permet d'éviter jusqu'à 500k€/an de pertes. **Oui, la mesure est financièrement très rentable** (bénéfice net d'évitement de risque = 300k€/an). ✅

---

## Banque QCM — 5 Questions

**Q1.** Lors du passage du **CISSP**, si vous devez choisir entre installer un pare-feu supplémentaire et former les employés à la sécurité, que recommande le mindset *"Think like a Manager"* ?

- A) Toujours choisir le pare-feu car la technique est infaillible.
- B) Évaluer d'abord la politique, les risques et la sensibilisation humaine, car les humains et les processus précèdent les solutions techniques. ✅
- C) Ignorer les deux et souscrire une assurance cyber.
- D) Choisir la solution la plus chère.

**Q2.** Dans l'examen **CKS**, quel alias est universellement recommandé dès le démarrage pour gagner un temps précieux dans le terminal ?

- A) `alias docker=podman`
- B) `alias k=kubectl` et `export do="--dry-run=client -o yaml"` ✅
- C) `alias systemctl=service`
- D) `alias vi=nano`

**Q3.** Qu'est-ce que le **Single Loss Expectancy (SLE)** en gestion des risques CISSP ?

- A) La perte annuelle moyenne liée à un risque.
- B) Le coût d'achat d'un serveur.
- C) La perte financière causée par un unique événement d'incident de sécurité ($SLE = Asset\_Value \times Exposure\_Factor$). ✅
- D) La durée d'interruption de service.

**Q4.** Dans une question **AWS SAP**, si l'énoncé exige *"The LEAST operational overhead"*, quelle architecture devez-vous privilégier ?

- A) Des instances EC2 configurées manuellement avec Auto Scaling.
- B) Des conteneurs déployés sur EC2 avec scripts Custom Data.
- C) Des services serverless / managés natifs (AWS Lambda, Fargate, Aurora Serverless, DynamoDB). ✅
- D) Une infrastructure hybride on-premise.

**Q5.** Dans l'examen CKS, la présence de `privileged: true` dans le SecurityContext d'un conteneur est :

- A) Recommandée pour de meilleures performances.
- B) Utile pour les microservices de production.
- C) Une faille de sécurité majeure (interdite dans 99% des cas) car elle donne au conteneur l'accès quasi-total aux capacités du kernel de l'hôte. ✅
- D) Ignorée par Kubernetes.

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
