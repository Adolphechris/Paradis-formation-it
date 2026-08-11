# TOME P11 — DevSecOps, Cloud Security & Gouvernance — Jour 532 (6h) : Patrons de Sécurité Cloud-Native : Istio mTLS Strict, OPA Gatekeeper Rego & Secrets Management

> [!NOTE]
> **Objectifs pédagogiques :**
> - Maîtriser les patrons de sécurité **Cloud-Native** (Defense in Depth sur Kubernetes)
> - Implémenter le chiffrement **mTLS Strict** et l'autorisation fine avec le Service Mesh Istio
> - Rédiger des règles de contrôle d'admission en langage **Rego (Open Policy Agent - OPA Gatekeeper)**
> - Orchestrer la rotation automatique des secrets cryptographiques avec HashiCorp Vault et Vault Agent Injector
>
> **Compétences visées :** `SEC-05` (A), `INF-02` (A) — Cloud-Native Security Patterns

---

## Module 1 — Patrons de Sécurité Cloud-Native & OPA Rego (2h)

### 📖 Intuition & Narration

Les applications Cloud-Native construites sur Kubernetes sont distribuées et dynamiques. Les conteneurs apparaissent et disparaissent en quelques secondes.

Appliquer une sécurité basée sur des règles de pare-feu IP traditionnelles est impossible. La sécurité Cloud-Native s'appuie sur deux patrons majeurs :
1. **Policy-as-Code** (avec OPA Gatekeeper) : Exprimer les règles de conformité Kubernetes dans un langage déclaratif (Rego).
2. **Service Mesh Encryption** (avec Istio) : Chiffrer automatiquement tout le trafic inter-pod en mTLS TLS 1.3 sans modifier le code des applications.

### 🔍 Anatomie Technique — OPA Gatekeeper & Rego Policy Engine

```
ARCHITECTURE POLICY-AS-CODE (OPA GATEKEEPER & REGO)

  [ REQUÊTE KUBECTL / ARGO CD ]
               │
               ▼
  ┌────────────────────────────────────────────────────────┐
  │ KUBE-APISERVER                                         │
  └────────────┬───────────────────────────────────────────┘
               │ (Validating Webhook Call)
               ▼
  ┌────────────────────────────────────────────────────────┐
  │ OPA GATEKEEPER (Rego Policy Engine)                    │
  │ Évalue les règles Rego (ConstraintTemplates)           │
  └────────────┬───────────────────────────────────────────┘
               │
     ┌─────────┴────────────────────────┐
     │ DENY (Si violation Rego)         │ ALLOW (Si conforme)
     ▼                                  ▼
  [ REJET REQUÊTE HTTP 403 ]     [ RESSOURCE CRÉÉE DANS K8S ]
```

---

## Module 2 — Atelier Pratique : Rego Policy Evaluator & Istio Authorization (2h)

### 🛠️ Code Rego & Script Python : OPA Rego Engine Simulator

```rego
# /k8s/policy-container-image-origin.rego — Règle Rego OPA Gatekeeper
package k8scontainerorigin

violation[{"msg": msg}] {
    input.review.object.kind == "Pod"
    container := input.review.object.spec.containers[_]
    not startswith(container.image, "registry.paradis.fr/")
    msg := sprintf("Image '%v' interdite ! Seules les images provenant de 'registry.paradis.fr/' sont autorisées.", [container.image])
}
```

```python
#!/usr/bin/env python3
"""
PARADIS — OPA Rego Policy Simulator Engine
Simule l'évaluation d'une politique Rego OPA Gatekeeper interdisant les images Docker non signées ou externes.
"""

import json
import sys
from typing import List

class OPARegoEvaluator:
    def __init__(self, allowed_registry: str):
        self.allowed_registry = allowed_registry

    def evaluate_pod_review(self, pod_manifest: dict) -> tuple[bool, List[str]]:
        print("=== EVALUATION OPA GATEKEEPER REGO POLICY ===")
        violations = []

        containers = pod_manifest.get("spec", {}).get("containers", [])
        for c in containers:
            image = c.get("image", "")
            print(f"[*] Vérification de l'image du conteneur '{c.get('name')}': {image}")

            if not image.startswith(self.allowed_registry):
                violations.append(f"Image '{image}' rejetée ! Elle ne provient pas du registre officiel '{self.allowed_registry}'.")

        if violations:
            return False, violations
        return True, []

if __name__ == "__main__":
    evaluator = OPARegoEvaluator(allowed_registry="registry.paradis.fr/")

    # Manifeste test 1 : Image venant de Docker Hub public (Doit être rejetée)
    untrusted_pod = {
        "kind": "Pod",
        "spec": {
            "containers": [
                {"name": "nginx-web", "image": "docker.io/library/nginx:latest"}
            ]
        }
    }

    allowed, msgs = evaluator.evaluate_pod_review(untrusted_pod)
    if not allowed:
        print(f"\n[🚨 REGO DENY] Admission Refusée ({len(msgs)} violation(s)) :")
        for m in msgs:
            print(f"  ❌ {m}")
        print("\n[⛔ OPA GATEKEEPER] Déploiement bloqué par le contrôleur d'admission.")
```

---

## Module 3 — Service Mesh mTLS Strict & Rotation de Secrets Vault (1h30)

### 🔍 Istio PeerAuthentication & Vault Agent Injector

1. **Istio PeerAuthentication (mTLS Strict)** :
   ```yaml
   apiVersion: security.istio.io/v1beta1
   kind: PeerAuthentication
   metadata:
     name: default
     namespace: production
   spec:
     mtls:
       mode: STRICT # Rejette tout trafic HTTP non mTLS
   ```
2. **Vault Agent Injector** : Injecte dynamiquement les secrets Vault directement dans un volume en mémoire (`tmpfs`) du Pod, éliminant les secrets stockés sur disque.

---

## Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **OPA** | Open Policy Agent — Moteur de politique déclarative généraliste |
| **Rego** | Langage de requête et de politique de niveau élevé utilisé par OPA |
| **mTLS** | Mutual Transport Layer Security — Authentification et chiffrement bidirectionnels |

---

## Exercices Pratiques

### Exercice 1 — Modification de Règle Rego

Écrivez la condition Rego permettant d'interdire la création d'un Pod si le champ `spec.securityContext.runAsUser` est égal à `0` (User root).

**Corrigé guidé :**
```rego
violation[{"msg": msg}] {
    input.review.object.kind == "Pod"
    input.review.object.spec.securityContext.runAsUser == 0
    msg := "L'exécution sous l'utilisateur UID 0 (root) est strictement interdite."
}
```

---

## Banque QCM — 5 Questions

**Q1.** Quel est le rôle principal d'**OPA Gatekeeper** dans un cluster Kubernetes ?

- A) Formater le disque dur des nœuds.
- B) Agir comme un contrôleur d'admission validant en continu les manifestes Kubernetes par rapport à des politiques **Policy-as-Code** écrites en Rego. ✅
- C) Gérer l'affichage de l'écran.
- D) Accélérer le Wi-Fi.

**Q2.** Dans une politique Istio `PeerAuthentication`, que signifie le mode `STRICT` pour le chiffrement mTLS ?

- A) Le chiffrement mTLS est facultatif.
- B) Tout le trafic HTTP non chiffré ou non authentifié par certificat mTLS est strictement rejeté. ✅
- C) Seuls les ordinateurs portables peuvent se connecter.
- D) Le réseau est désactivé.

**Q3.** Quel est le nom du langage de politique utilisé par l'Open Policy Agent (OPA) ?

- A) Python.
- B) Rego. ✅
- C) Java.
- D) C#.

**Q4.** Comment **Vault Agent Injector** transmet-il un secret à un conteneur Kubernetes de manière ultra-sécurisée ?

- A) En écrivant le secret dans un fichier sur le disque dur principal.
- B) En injectant le secret directement dans un volume en mémoire ram éphémère (`tmpfs`) partagé au sein du Pod. ✅
- C) En l'envoyant par e-mail.
- D) En l'affichant dans les logs.

**Q5.** Pourquoi l'utilisation de registres de conteneurs non autorisés (ex: Docker Hub public) est-elle interdite dans un cluster de production sécurisé ?

- A) Parce que les images publiques peuvent contenir des vulnérabilités critiques non vérifiées ou du code malveillant (malware/cryptominer). ✅
- B) Parce que Docker Hub est payant pour tout le monde.
- C) Parce que les images sont trop grandes.
- D) Parce que le serveur refuse d'exécuter Linux.

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
