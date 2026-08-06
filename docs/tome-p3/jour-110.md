# TOME P3 — Cloud Native, DevOps & Cyberdéfense — Jour 110 (6h) : Projet Intégrateur Semestre 3 (Partie 1) — Architecture Cloud-Native & Observabilité eBPF

> [!NOTE]
> **Objectif du jour :** Déployer et valider la première phase du projet intégrateur de fin de bloc (J101-J110) : construction d'une plateforme bancaire Cloud-Native sécurisée combinant sondes eBPF (bpftrace/XDP), Service Mesh Istio (mTLS Strict), déploiement GitOps automatisé avec ArgoCD et détection de menaces runtime avec Falco.
>
> **Compétences visées :** `PRO-01` (A) — Conduite de Projet Cloud Native | `BIT-08` (A) — Intégration GitOps & Mesh | `SEC-04` (A) — Cyberdéfense Kernel/Container

---

## 1) Module — Cahier des Charges & Architecture Globale (2h)

### 📖 Narration/Intuition

Vous êtes l'Architecte Cloud-Native & Cyberdéfense de la Banque Centrale du Congo (BCC). La Direction souhaite faire évoluer l'infrastructure bancaire vers une plateforme de nouvelle génération **Zero Trust & eBPF-Powered**.

Cette plateforme doit intégrer :
1. **Une observabilité et défense au niveau du noyau (Kernel Level)** avec eBPF/XDP et Falco.
2. **Un maillage de microservices (Service Mesh)** avec Istio pour le chiffrement mTLS Strict inter-services.
3. **Un modèle de déploiement 100% GitOps** piloté par ArgoCD depuis un dépôt Git sécurisé.
4. **Une chaîne d'approvisionnement (Supply Chain) signée** avec Cosign et vérifiée par Kyverno.

### 🔍 Anatomie Technique

**Schéma d'Architecture Cloud-Native SecDevOps (Projet J110) :**

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ 1. SOURCE DE VÉRITÉ GITOPS & SUPPLY CHAIN                                   │
│    - Dépôt Git (Manifestes Kustomize)                                       │
│    - Build CI/CD -> SBOM (Syft) -> Signature Cosign (Sigstore)              │
└─────────────────────────────────────┬───────────────────────────────────────┘
                                      │ Sync Automatique (Pull)
┌─────────────────────────────────────▼───────────────────────────────────────┐
│ 2. CLUSTER KUBERNETES SECURE DATA PLANE                                     │
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │ Admission Control : Kyverno (Vérification des signatures Cosign)      │  │
│  │ GitOps Controller : ArgoCD (Self-Healing & Drift Correction)          │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │ Service Mesh Istio (mTLS Strict + AuthorizationPolicies)              │  │
│  │  Pod A (App Virement + Envoy)  ==mTLS==>  Pod B (DB Postgres + Envoy)   │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │ LINUX KERNEL EBPF LAYER (Hôte Node)                                   │  │
│  │  - XDP Anti-DDoS Filter (Pilote Carte Réseau)                         │  │
│  │  - Falco Runtime Security Agent (Détection d'intrusion Syscalls)       │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2) Module — Implémentation & Automatisation du Déploiement (2h)

### 📖 Narration/Intuition

Pour démontrer la faisabilité technique, nous automatisons la vérification de l'ensemble du déploiement via un script d'audit d'infrastructure en Python qui valide la présence du pilote eBPF, l'état mTLS d'Istio et la synchronisation GitOps d'ArgoCD.

### 🔍 Anatomie Technique

**Script d'Audit de Déploiement Cloud-Native (`audit_cloud_native_j110.py`) :**

```python
#!/usr/bin/env python3
"""
audit_cloud_native_j110.py — Audit d'intégration Cloud-Native SecDevOps pour la BCC (J110)
"""
import subprocess
import json
import sys

def check_command(cmd, name):
    print(f"[+] Vérification : {name}...")
    res = subprocess.run(cmd, shell=True, capture_output=True, text=True)
    if res.returncode == 0:
        print(f"    ✅ PASS : {name}")
        return True, res.stdout.strip()
    else:
        print(f"    ❌ FAIL : {name}")
        print(f"    Détails : {res.stderr.strip()}")
        return False, res.stderr.strip()

def main():
    print("=================================================================")
    print("   AUDIT DU PROJET INTÉGRATEUR J110 — CLOUD-NATIVE & EBPF        ")
    print("=================================================================\n")

    score = 0
    total_checks = 4

    # 1. Vérifier la présence du support eBPF dans le noyau Linux
    ok, out = check_command("bpftrace -l 'tracepoint:syscalls:*' | head -n 1", "Support eBPF Kernel")
    if ok: score += 1

    # 2. Vérifier l'état de synchronisation ArgoCD
    ok, out = check_command("kubectl get application -n argocd -o jsonpath='{.items[0].status.sync.status}'", "Synchronisation GitOps ArgoCD")
    if ok and "Synced" in out: 
        print("    --> État GitOps : Synced ✅")
        score += 1

    # 3. Vérifier le mode PeerAuthentication mTLS d'Istio
    ok, out = check_command("kubectl get peerauthentication -n bcc-production -o jsonpath='{.items[0].spec.mtls.mode}'", "Istio mTLS Strict")
    if ok and "STRICT" in out:
        print("    --> Mode mTLS : STRICT ✅")
        score += 1

    # 4. Vérifier que les pods Falco eBPF sont en cours d'exécution
    ok, out = check_command("kubectl get pods -n falco -l app.kubernetes.io/name=falco -o jsonpath='{.items[0].status.phase}'", "Agent Falco eBPF Runtime")
    if ok and "Running" in out:
        score += 1

    print("\n=================================================================")
    pourcentage = (score / total_checks) * 100
    print(f"RÉSULTAT GLOBALE : {score}/{total_checks} vérifications validées ({pourcentage:.0f}%)")
    if pourcentage == 100:
        print("✅ PROJET INTÉGRATEUR J110 VALIDE : Infrastructure Cloud-Native Conforme !")
        sys.exit(0)
    else:
        print("❌ NON CONFORME : Corrigez les éléments en échec.")
        sys.exit(1)

if __name__ == "__main__":
    main()
```

---

## 3) Module — Dossier d'Architecture & Grille d'Évaluation (2h)

### 📖 Narration/Intuition

Ce module finalise le livrable sous forme de dossier d'architecture technique (DAT) prêt pour la soutenance technique.

### 🔍 Anatomie Technique

**Grille d'Évaluation du Projet J110 :**

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    GRILLE D'ÉVALUATION D'ARCHITECTURE J110                  │
├───────────────────────────────────┬────────┬────────────────────────────────┤
│ Domaine d'Évaluation              │ Poids  │ Critères de Validation         │
├───────────────────────────────────┼────────┼────────────────────────────────┤
│ 1. Kernel & eBPF Observabilité    │  25%   │ • Sondes bpftrace fonctionnelles│
│                                   │        │ • Filtre XDP anti-DDoS actif   │
│                                   │        │ • Agent Falco eBPF déployé     │
├───────────────────────────────────┼────────┼────────────────────────────────┤
│ 2. Service Mesh & mTLS            │  25%   │ • Istio mTLS Strict configuré  │
│                                   │        │ • VirtualService Canary 90/10  │
│                                   │        │ • Kiali Dashboard opérationnel │
├───────────────────────────────────┼────────┼────────────────────────────────┤
│ 3. Modèle GitOps                  │  25%   │ • ArgoCD synchronisé sur Git   │
│                                   │        │ • Self-Healing testé et validé │
│                                   │        │ • Overlays Kustomize structurés│
├───────────────────────────────────┼────────┼────────────────────────────────┤
│ 4. Supply Chain & Admission       │  25%   │ • Images signées avec Cosign   │
│                                   │        │ • SBOM généré avec Syft        │
│                                   │        │ • Kyverno Policy Enforced      │
└───────────────────────────────────┴────────┴────────────────────────────────┘
```

---

## 🏅 Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **DAT** | Dossier d'Architecture Technique — Document de référence décrivant la conception d'un SI |
| **CNCF** | Cloud Native Computing Foundation — Organisme régissant l'écosystème Cloud Native (K8s, Istio, Falco) |

---

## 🏋️ Exercices & Corrigés

**Exercice 1 :** Pourquoi l'association d'eBPF au niveau du noyau hôte et d'Istio Service Mesh au niveau de Kubernetes offre-t-elle une défense en profondeur optimale ?

**Corrigé :** **Istio (niveau applicatif L7)** s'occupe de la sécurité des microservices : chiffrement mTLS, vérification des identités applicatives et routage intelligent des requêtes HTTP. **eBPF (niveau noyau L3/L4/Syscalls)** protège l'infrastructure hôte sous-jacente : il rejette les attaques réseau volumétriques au niveau de la carte réseau (XDP) et intercepte en temps réel toute tentative d'intrusion ou d'élévation de privilège au niveau des appels système (Falco), offrant une couverture de sécurité hermétique du câble réseau jusqu'à l'application.

**Exercice 2 :** Dans la grille d'évaluation J110, quelle est la preuve technique qui valide le fonctionnement du Self-Healing GitOps d'ArgoCD ?

**Corrigé :** La preuve technique consiste à supprimer manuellement une ressource Kubernetes (ex: `kubectl delete deployment bcc-virement-api`) ou à modifier sa configuration directement sur le cluster. Si ArgoCD est correctement configuré en mode GitOps avec `selfHeal: true`, l'agent détecte immédiatement le décalage (Drift) et re-crée automatiquement la ressource ou annule la modification manuelle dans les secondes qui suivent pour réaligner le cluster sur l'état exact déclaré dans Git.

---

## ❓ Banque de Questions & Test du Jour

**Q1 :** Dans l'architecture Cloud-Native SecDevOps (J110), quel composant est responsable du chiffrement mTLS Strict entre les conteneurs microservices ?
- A) Istio Service Mesh (via les proxies Envoy)
- B) Le BIOS du serveur
- C) L'imprimante réseau
- D) Le câble USB

**Réponse : A**

**Q2 :** Quel outil assure le rôle d'agent GitOps dans Kubernetes en répliquant automatiquement l'état décrit dans les dépôts Git vers le cluster ?
- A) ArgoCD
- B) Wireshark
- C) Netcat
- D) Ping

**Réponse : A**

**Q3 :** Quelle technologie permet à Falco de surveiller les appels système du noyau Linux avec un impact minimal sur les performances des conteneurs ?
- A) eBPF
- B) MS-DOS
- C) Floppy Disk
- D) Telnet

**Réponse : A**

**Q4 :** Quel outil est utilisé dans la chaîne CI/CD du projet J110 pour vérifier la signature cryptographique des images de conteneurs avant leur déploiement ?
- A) Cosign (Sigstore)
- B) Word
- C) Paint
- D) Notepad

**Réponse : A**

**Q5 :** Quel contrôleur d'admission Kubernetes intercepte les requêtes de création de Pods et valide qu'elles respectent les politiques de sécurité (ex: signature d'image valide) ?
- A) Kyverno
- B) BGP Daemon
- C) Systemd
- D) DHCP Server

**Réponse : A**

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
