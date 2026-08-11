# TOME P11 — DevSecOps, Cloud Security & Gouvernance — Jour 501 (6h) : Architecture Zero-Trust d'Entreprise : BeyondCorp, Identité SPIFFE/SPIRE, mTLS & Micro-segmentation

> [!NOTE]
> **Objectifs pédagogiques :**
> - Maîtriser le paradigme **Zero-Trust (Never Trust, Always Verify)** selon la norme NIST SP 800-207
> - Implémenter l'identité dynamique des charges de travail (Workload Identity) avec **SPIFFE/SPIRE**
> - Déployer le chiffrement et l'authentification mutuelle **mTLS** entre microservices (Service Mesh Istio / Linkerd)
> - Concevoir une architecture de **micro-segmentation réseau** empêchant la propagation latérale (Lateral Movement)
>
> **Compétences visées :** `SEC-04` (A), `SEC-05` (A) — Zero-Trust Enterprise Architecture

---

## Module 1 — Principes du Zero-Trust & Modèle NIST SP 800-207 (2h)

### 📖 Intuition & Narration

Le modèle de sécurité réseau traditionnel fonctionnait selon la métaphore du "château fort avec des douves" (Perimeter Security). Tout ce qui se trouvait à l'extérieur du réseau d'entreprise était considéré comme hostile, tandis que tout ce qui se trouvait à l'intérieur du réseau (derrière le VPN) était implicitement considéré comme digne de confiance.

Une fois qu'un pirate réussissait à pénétrer le VPN ou le réseau interne, il pouvait se déplacer latéralement sans rencontrer aucun obstacle.

Le modèle **Zero-Trust (NIST SP 800-207)** casse ce dogme obsolète. Son principe directeur est : **"Ne jamais faire confiance, toujours vérifier" (Never Trust, Always Verify)**. L'emplacement réseau d'un utilisateur ou d'un serveur ne lui accorde aucun privilège implicite.

### 🔍 Anatomie Technique — Composants d'un Contrôle Zero-Trust

```
ARCHITECTURE ZERO-TRUST (NIST SP 800-207 & SPIFFE/SPIRE)

  [ WORKLOAD / APPLICATION ] ──► (Identité SVID X.509)
              │
              ▼
  ┌────────────────────────────────────────────────────────┐
  │ POLICY ENGINE (PE) & POLICY ENFORCEMENT POINT (PEP)    │
  │ Évalue en continu : Identité + Santé Posture + Rôle    │
  └────────────────────────┬───────────────────────────────┘
                           │ (Si authentifié mTLS)
                           ▼
  ┌────────────────────────────────────────────────────────┐
  │ RESOURCE / MICROSERVICE DE DESTINATION                 │
  │ Chiffrement mTLS strict (TLS 1.3 avec SVID SPIFFE)     │
  └────────────────────────────────────────────────────────┘
```

---

## Module 2 — Atelier Pratique : Authentification mTLS & SPIFFE ID Validator (2h)

### 🛠️ Code Python : Validation d'Identité Workload SPIFFE ID & Certificats SVID

```python
#!/usr/bin/env python3
"""
PARADIS — SPIFFE ID Workload Identity Validator
Valide les identifiants de charge de travail (SPIFFE IDs) extraits des certificats mTLS X.509.
"""

import re
import sys
from dataclasses import dataclass

@dataclass
class SpiffeIdentity:
    trust_domain: str
    namespace: str
    service_account: str
    raw_spiffe_id: str

class SpiffeValidator:
    SPIFFE_REGEX = r"^spiffe://([^/]+)/ns/([^/]+)/sa/([^/]+)$"

    def parse_spiffe_id(self, spiffe_id: str) -> SpiffeIdentity:
        """Parse et valide le format d'un SPIFFE ID (URI SAN du certificat)."""
        match = re.match(self.SPIFFE_REGEX, spiffe_id)
        if not match:
            raise ValueError(f"SPIFFE ID invalide : {spiffe_id}")

        return SpiffeIdentity(
            trust_domain=match.group(1),
            namespace=match.group(2),
            service_account=match.group(3),
            raw_spiffe_id=spiffe_id
        )

    def authorize_workload(self, client_spiffe_id: str, allowed_namespace: str, allowed_sa: str) -> bool:
        print("=== EVALUATION DE L'AUTORISATION ZERO-TRUST WORKLOAD (SPIFFE) ===")
        print(f"[*] SPIFFE ID reçu du client mTLS : {client_spiffe_id}")

        try:
            identity = self.parse_spiffe_id(client_spiffe_id)
            print(f"    - Domaine de confiance : {identity.trust_domain}")
            print(f"    - Namespace           : {identity.namespace}")
            print(f"    - Service Account     : {identity.service_account}")

            if identity.namespace != allowed_namespace or identity.service_account != allowed_sa:
                print(f"[🚨 AUTORISATION REFUSÉE] Le workload '{identity.raw_spiffe_id}' n'est pas autorisé !")
                return False

            print("[✅ AUTORISATION ACCORDÉE] Identité mTLS vérifiée et conforme.")
            return True

        except ValueError as e:
            print(f"[🚨 ERREUR FORMAT] {e}")
            return False

if __name__ == "__main__":
    validator = SpiffeValidator()
    # Test d'une identité SPIFFE valide d'un microservice de paiement
    valid_id = "spiffe://paradis.finance/ns/production/sa/payment-service-sa"
    success = validator.authorize_workload(valid_id, allowed_namespace="production", allowed_sa="payment-service-sa")
    if not success:
        sys.exit(1)
```

---

## Module 3 — Service Mesh & Micro-segmentation mTLS (1h30)

### 🔍 mTLS avec Istio / Linkerd

Dans une architecture de microservices Cloud-Native, les communications inter-services s'effectuent via un **Service Mesh** (ex: Istio). Un proxy "Sidecar" (Envoy) est injecté à côté de chaque conteneur.

Le Service Mesh gère automatiquement :
1. La rotation transparente des certificats **mTLS (Mutual TLS)** toutes les quelques heures.
2. Le chiffrement TLS 1.3 de bout en bout entre tous les Pods.
3. L'authentification forte de chaque microservice grâce à son **SPIFFE ID**.

---

## Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **SPIFFE** | Secure Production Identity Framework for Everyone — Standard d'identité des workloads |
| **SPIRE** | SPIFFE Runtime Environment — Implémentation de référence de SPIFFE |
| **mTLS** | Mutual Transport Layer Security — Chiffrement et authentification bidirectionnelle TLS |
| **SVID** | SPIFFE Verifiable Identity Document — Certificat X.509 ou token JWT prouvant l'identité |

---

## Exercices Pratiques

### Exercice 1 — Analyse de SPIFFE ID

Décomposez le SPIFFE ID suivant : `spiffe://paradis-prod.internal/ns/finance/sa/billing-api`

**Corrigé guidé :**
- **Domaine de confiance (Trust Domain)** : `paradis-prod.internal`
- **Namespace Kubernetes** : `finance`
- **Service Account Kubernetes** : `billing-api`

---

## Banque QCM — 5 Questions

**Q1.** Quel est le principe fondamental du modèle d'architecture **Zero-Trust** ?

- A) Faire confiance à tout ce qui se trouve derrière le VPN.
- B) "Ne jamais faire confiance, toujours vérifier" (Never Trust, Always Verify) — l'emplacement réseau n'accorde aucun privilège implicite. ✅
- C) Supprimer tous les mots de passe des bases de données.
- D) Utiliser uniquement des connexions en HTTP clair.

**Q2.** Que signifie l'acronyme **mTLS (Mutual TLS)** ?

- A) Multiple Transport Layer Security.
- B) Mutual TLS — une connexion TLS où le client ET le serveur présentent tous deux un certificat X.509 valide pour s'authentifier mutuellement. ✅
- C) Memory TLS.
- D) Master TLS.

**Q3.** Quel est le rôle du projet **SPIFFE/SPIRE** ?

- A) Générer des images Docker.
- B) Fournir un standard et une infrastructure permettant d'attribuer une identité cryptographique universelle (SPIFFE ID) aux charges de travail (workloads). ✅
- C) Nettoyer la mémoire RAM.
- D) Remplacer le pare-feu physique.

**Q4.** Comment appelle-t-on le document cryptographique délivré par SPIRE (généralement un certificat X.509) prouvant l'identité d'un service ?

- A) Un SVID (SPIFFE Verifiable Identity Document). ✅
- B) Un fichier ZIP.
- C) Un cookie HTTP.
- D) Un jeton OAuth.

**Q5.** Dans un Service Mesh comme **Istio**, quel composant intercepte le trafic réseau à côté de chaque conteneur applicatif pour gérer le chiffrement mTLS ?

- A) Le proxy Sidecar Envoy. ✅
- B) Le navigateur Chrome.
- C) Le noyau Windows.
- D) Le serveur DNS.

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
