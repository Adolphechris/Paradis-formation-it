# TOME P6 — Cybersécurité Expert & Red Team Avancé — Jour 274 (6h) : Zero Trust Architecture Implementation (ZTA NIST SP 800-207, SPIFFE/SPIRE Workload Identity, Cloudflare Access ZTNA & Cilium eBPF Microsegmentation)

> [!NOTE]
> **Objectif du jour :** Maîtriser l'implémentation pratique d'une **Architecture Zero Trust (ZTA)** conforme au standard **NIST SP 800-207** : déployer l'identité de charge de travail avec **SPIFFE/SPIRE**, configurer un accès réseau Zero Trust (**ZTNA**) avec **Cloudflare Access**, et appliquer la micro-segmentation réseau **eBPF** dans Kubernetes avec **Cilium**.
>
> **Compétences visées :** `ZTA-01` (A) — NIST SP 800-207 Zero Trust Architecture | `ZTA-02` (A) — SPIFFE/SPIRE Workload Identity & Cilium eBPF Policy

---

## 1) Module — 7 Piliers du Zero Trust NIST SP 800-207 (2h)

### 📖 Narration/Intuition

L'architecture Zero Trust repose sur le postulat **"Never Trust, Always Verify"** : aucun utilisateur, appareil ou service — qu'il soit situé à l'intérieur ou à l'extérieur du réseau d'entreprise — n'est accordé d'accès implicite de confiance. La décision d'accès est réévaluée dynamiquement à chaque requête par le **Policy Decision Point (PDP)** et appliquée par le **Policy Enforcement Point (PEP)**.

---

## 2) Module — Workload Identity avec SPIFFE/SPIRE (`spire_setup.yaml`) (2h)

### 🛠️ Atelier Pratique

**Configuration SPIFFE/SPIRE pour microservices Kubernetes (`spire_attestation.yaml`) :**

```yaml
# Attestation automatique de Pod Kubernetes par SPIRE Agent
apiVersion: spire.spiffe.io/v1alpha1
kind: ClusterSPIFFEID
metadata:
  name: backend-workload-id
spec:
  spiffeIDTemplate: "spiffe://company.local/ns/{{ .PodMeta.Namespace }}/sa/{{ .PodSpec.ServiceAccountName }}"
  podSelector:
    matchLabels:
      app: payment-api
  workloadSelectorTemplates:
    - "k8s:ns:production"
    - "k8s:sa:payment-service-account"
```

```bash
# Vérifier l'émission du certificat SVID (SPIFFE Verifiable Identity Document)
spire-agent api fetch x509 -writeInto /tmp/svid/
# Résultat : Certificat X.509 éphémère (durée 1h) contenant l'URI spiffe://company.local/...
```

---

## 3) Module — Micro-segmentation Cilium eBPF (`cilium_policy.yaml`) (2h)

```yaml
# CiliumNetworkPolicy : Bloquer tout le trafic sortant sauf vers l'API de paiement
apiVersion: "cilium.io/v2"
kind: CiliumNetworkPolicy
metadata:
  name: restrict-payment-api
  namespace: production
spec:
  endpointSelector:
    matchLabels:
      app: frontend-web
  egress:
    - toEndpoints:
        - matchLabels:
            app: payment-api
      toPorts:
        - ports:
            - port: "8443"
              protocol: TCP
          rules:
            http:
              - method: "POST"
                path: "/api/v1/charge"
  # Politique implicite : Deny All pour toute autre destination !
```

---

## 🏅 Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **ZTA** | Zero Trust Architecture — Modèle de sécurité réseau sans confiance implicite (NIST SP 800-207) |
| **SPIFFE** | Secure Production Identity Framework for Everyone — Standard d'identité de workload |
| **SPIRE** | SPIFFE Runtime Environment — Implémentation de référence de SPIFFE |
| **ZTNA** | Zero Trust Network Access — Remplacement moderne des VPNs traditionnels |

---

## ❓ Banque de Questions & Test du Jour

**Q1 :** Quel est le principe fondamental au cœur de l'Architecture Zero Trust (ZTA) définie par le NIST SP 800-207 ?
- A) "Never Trust, Always Verify" — Aucun réseau ni utilisateur n'est considéré comme de confiance par défaut
- B) Faire confiance au réseau local interne
- C) Utiliser des mots de passe plus longs
- D) Désactiver les pare-feux

**Réponse : A**

**Q2 :** Dans l'écosystème SPIFFE/SPIRE, sous quel format est exprimée l'identité cryptographique d'un microservice (Spiffe ID) ?
- A) Sous forme d'URI X.509 SAN : `spiffe://domain/ns/namespace/sa/serviceaccount`
- B) Un mot de passe en clair
- C) Une adresse IP fixe
- D) Un cookie HTTP

**Réponse : A**

**Q3 :** Dans la nomenclature NIST SP 800-207, quel composant évalue les politiques de sécurité et prend la décision d'accorder ou de refuser un accès ?
- A) PDP (Policy Decision Point)
- B) PEP (Policy Enforcement Point)
- C) WAF
- D) SIEM

**Réponse : A**

**Q4 :** Quel est le rôle de **Cilium** dans la micro-segmentation d'un cluster Kubernetes Zero Trust ?
- A) Appliquer des règles de filtrage réseau ultra-rapides au niveau du noyau Linux via eBPF (jusqu'à la couche L7 HTTP)
- B) Générer des mots de passe
- C) Sauvegarder la base etcd
- D) Remplacer Docker

**Réponse : A**

**Q5 :** Quel service réseau moderne (ZTNA) remplace les VPNs d'entreprise traditionnels en vérifiant l'identité et la posture du poste avant d'accorder un tunnel sortant ?
- A) Cloudflare Access / ZTNA
- B) PPTP VPN
- C) Telnet
- D) FTP

**Réponse : A**

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
