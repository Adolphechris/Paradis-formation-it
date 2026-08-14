# TOME P2 — Réseaux & Télécoms — Jour 90 (6h) : Projet Intégrateur Semestre 2 (Partie 4) — Audit Global, Durcissement & Déploiement Résilient

> [!NOTE]
> **Objectif du jour :** Réaliser le projet intégrateur de fin de sous-cycle (J81-J90) : conduire un audit de conformité global, mettre en œuvre un plan de durcissement complet (Hardening, IAM, Observabilité, HA, Reprise d'Activité) et défendre le projet devant une grille d'évaluation d'architecture de niveau Master.
>
> **Compétences visées :** `PRO-01` (A) — Conduite de Projet d'Infrastructure & Sécurité | `SEC-03` (A) — Architecture Système Résiliente | `POL-01` (A) — Audit & Gouvernance SI

---

## 1) Module — Cahier des Charges & Architecture Globale (2h)

### 📖 Narration/Intuition

Vous êtes l'Ingénieur en Chef Sécurité & Infrastructure d'une grande institution financière. Suite à une mise en demeure des régulateurs et à l'augmentation des menaces réseau, vous devez finaliser la mise en production de la **Nouvelle Plateforme de Paiement Critique (NPC)**.

Cette plateforme doit être :
1. **Conforme** aux normes ISO 27001, PCI-DSS v4.0 et aux recommandations CIS Level 2.
2. **Hautement Disponible (HA)** avec un taux de disponibilité mesuré de 99.99%.
3. **Résiliente (PRA)** avec un RPO = 0 pour les transactions et un RTO < 15 minutes.
4. **Totalement Observables** (Metrics, Logs, Traces) et supervisée en temps réel.

### 🔍 Anatomie Technique

**Schéma d'Architecture Global du Projet Intégrateur (J90) :**

```
               ╔═══════════════════════════════════════════════════════╗
               ║                   INTERNET / INTERBANK                ║
               ╚═══════════════════════╤═══════════════════════════════╝
                                       │ HTTPS (TLS 1.3)
                        ┌──────────────▼──────────────┐
                        │   REPLAY / DOS PROTECTION   │
                        └──────────────┬──────────────┘
                                       │
                ┌──────────────────────┴──────────────────────┐
                │        KEEP ALIVED (VRRP - VIP 10.0.10.100)  │
                │   ┌──────────────────┐    ┌──────────────┐  │
                │   │ HAProxy Master   │    │HAProxy Backup│  │
                │   └────────┬─────────┘    └──────┬───────┘  │
                └────────────┼─────────────────────┼──────────┘
                             │ L7 Load Balancing   │
                ┌────────────▼─────────────────────▼──────────┐
                │           DMZ APPLICATIVE KUBERNETES         │
                │  - AppArmor / Seccomp Enforced               │
                │  - NetworkPolicies Strictes (Deny-All)      │
                │  - Keycloak OIDC Authentication (MFA)        │
                │  - Microservices Python (Prometheus/OTel)    │
                └────────────┬─────────────────────┬──────────┘
                             │                     │
      ┌──────────────────────▼──────┐       ┌──────▼──────────────────────┐
      │  CLUSTER DB POSTGRESQL HA   │       │ OBSERVABILITÉ & SIEM        │
      │  - Patroni / Pacemaker      │       │ - Prometheus & Grafana      │
      │  - pgcrypto (TDE/Encryption)│       │ - Stack ELK & MISP IoC      │
      │  - Backups Restic (WORM S3) │       │ - Jaeger Distributed Tracing│
      └─────────────────────────────┘       └─────────────────────────────┘
```

---

## 2) Module — Implémentation & Automatisation du Déploiement (2h)

### 📖 Narration/Intuition

Pour garantir l'absence d'erreur humaine, l'ensemble du déploiement de la solution doit s'effectuer via un script d'orchestration global qui exécute l'Infrastructure as Code (Terraform), le durcissement (Ansible CIS), le déploiement applicatif (Kubernetes/Helm) et les tests de validation.

### 🔍 Anatomie Technique

**Orchestrateur de Déploiement & Audit Automatisé (`master_deploy_and_audit.py`) :**

```python
#!/usr/bin/env python3
"""
master_deploy_and_audit.py — Déploiement et Audit Global du Projet J90
"""
import subprocess
import sys
import time

def run_command(cmd, description):
    print(f"\n[+] {description}...")
    print(f"    Commande : {cmd}")
    result = subprocess.run(cmd, shell=True, capture_output=True, text=True)
    if result.returncode == 0:
        print(f"    ✅ Succès.")
        return True
    else:
        print(f"    ❌ Échec !")
        print(f"    STDOUT: {result.stdout}")
        print(f"    STDERR: {result.stderr}")
        return False

def main():
    print("=================================================================")
    print("  DÉPLOIEMENT & VERIFICATION DE CONFORMITÉ — PROJET J90   ")
    print("=================================================================")

    steps = [
        ("ansible-playbook -i inventory/prod.yml playbooks/cis_hardening.yml", 
         "1. Application du durcissement système CIS Level 2 (Ansible)"),
        
         ("sysctl -p /etc/sysctl.d/99-hardening.conf", 
         "2. Application des paramètres noyau sysctl de sécurité"),
        
        ("docker compose -f docker-compose-keycloak.yml up -d", 
         "3. Déploiement du serveur d'Identité Keycloak IAM"),
        
        ("kubectl apply -k k8s/overlays/production", 
         "4. Déploiement des microservices NPIP sur Kubernetes"),
        
        ("lynis audit system --quick", 
         "5. Exécution de l'audit de sécurité Lynis"),
        
        ("python3 parse_lynis_report.py", 
         "6. Vérification du Score de Durcissement (Hardening Index >= 80%)")
    ]

    success_count = 0
    for cmd, desc in steps:
        if run_command(cmd, desc):
            success_count += 1
        else:
            print(f"\n🚨 Interruption du déploiement suite à une erreur lors de l'étape : {desc}")
            sys.exit(1)

    print("\n=================================================================")
    print(f"  ✅ DÉPLOIEMENT GLOBAL RÉUSSI : {success_count}/{len(steps)} étapes validées.")
    print("  La plateforme NPIP est opérationnelle, conforme et sécurisée.")
    print("=================================================================")

if __name__ == "__main__":
    main()
```

---

## 3) Module — Grille d'Évaluation & Soutenance du Projet (2h)

### 📖 Narration/Intuition

La validation finale du projet reposera sur une démonstration technique en direct devant le jury technique (formateur / experts) et la remise du dossier d'architecture complet.

### 🔍 Anatomie Technique

**Grille d'Évaluation Technique Master (J90) :**

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       GRILLE D'ÉVALUATION — PROJET J90                      │
├───────────────────────────────────┬────────┬────────────────────────────────┤
│ Domaine d'Évaluation              │ Poids  │ Critères de Validation         │
├───────────────────────────────────┼────────┼────────────────────────────────┤
│ 1. Durcissement OS & Kernel       │  20%   │ • sysctl sécurisés (ASLR, SYN) │
│                                   │        │ • Profils AppArmor actifs      │
│                                   │        │ • Score Lynis >= 80%           │
├───────────────────────────────────┼────────┼────────────────────────────────┤
│ 2. IAM & Sécurité Applicative     │  20%   │ • Keycloak SSO / OIDC fonctionnel│
│                                   │        │ • MFA/TOTP appliqué aux admins │
│                                   │        │ • Validation JWT dans l'API    │
├───────────────────────────────────┼────────┼────────────────────────────────┤
│ 3. Observabilité & SIEM           │  20%   │ • Dashboard Grafana fonctionnel│
│                                   │        │ • Traces Jaeger générées       │
│                                   │        │ • Alertes SIEM sur bruteforce  │
├───────────────────────────────────┼────────┼────────────────────────────────┤
│ 4. Haute Disponibilité & Resil.   │  20%   │ • Basculement Keepalived (VIP) │
│                                   │        │ • Tests HAProxy LoadBalancing  │
│                                   │        │ • Backup Restic WORM opérationnel│
├───────────────────────────────────┼────────┼────────────────────────────────┤
│ 5. Audit & Conformité PCI-DSS     │  20%   │ • Rapport OpenSCAP généré      │
│                                   │        │ • Chiffrement pgcrypto fonctionnel│
│                                   │        │ • Script de déploiement IaC 100%│
└───────────────────────────────────┴────────┴────────────────────────────────┘
```

---

## 🏅 Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **NPIP** | Nouvelle Plateforme Interbancaire de Paiement |
| **SLA** | Service Level Agreement — Engagement de niveau de service (ex: 99.99% d'uptime) |
| **RPO** | Recovery Point Objective — Pertes de données tolérées (0 sec en bancaire) |
| **RTO** | Recovery Time Objective — Temps d'arrêt toléré |

---

## 🏋️ Exercices & Corrigés

**Exercice 1 :** Lors de la démonstration du basculement Haute Disponibilité (HA), quelle commande permet de simuler la panne soudaine du serveur HAProxy Master et d'observer le basculement de l'IP virtuelle vers le Backup ?

**Corrigé :** On peut simuler la panne sur le Master en coupant le service Keepalived ou en arrêtant l'interface réseau :
`sudo systemctl stop keepalived` (ou `sudo ip link set dev eth0 down`).
Sur le serveur Backup, on vérifie immédiatement l'attribution de la VIP avec `ip addr show` (l'IP `10.0.10.100` doit apparaître instantanément sur l'interface du Backup). En parallèle, un `ping 10.0.10.100` lancé depuis un poste client ne doit rater au maximum qu'un seul paquet.

**Exercice 2 :** Dans l'architecture du projet J90, comment s'assure-t-on que les données stockées dans la base de données PostgreSQL restent protégées même en cas de vol physique des disques durs du serveur ?

**Corrigé :** La protection repose sur la combinaison du chiffrement des volumes au repos (**LUKS / dm-crypt**) au niveau du système de fichiers du serveur et du chiffrement applicatif au niveau colonne avec l'extension **pgcrypto** (AES-256) pour les champs ultra-sensibles (données de cartes, NNI). Sans la clé de déchiffrement stockée dans un HSM ou injectée au démarrage en mémoire, les données brutes sur les disques volés sont totalement inexploitables.

---

## ❓ Banque de Questions & Test du Jour

**Q1 :** Dans un projet d'architecture hautement disponible avec un SLA de 99.99% d'uptime, quelle est la durée maximale d'interruption totale autorisée par an ?
- A) Environ 52 minutes par an
- B) 3 jours par an
- C) 10 heures par an
- D) 0 seconde

**Réponse : A** *(99.99% d'uptime correspond à un maximum de ~52.6 minutes d'arrêt par an).*

**Q2 :** Quel composant assure le rôle de point d'entrée unique (VIP) et de basculement transparent entre HAProxy Master et HAProxy Backup ?
- A) OpenSCAP
- B) Keepalived (via le protocole VRRP)
- C) Lynis
- D) PostgreSQL

**Réponse : B**

**Q3 :** Pourquoi est-il impératif que les sauvegardes d'une plateforme bancaire critique soient rendues immuables (WORM) ?
- A) Pour réduire le coût de stockage sur le Cloud
- B) Pour empêcher un ransomware ou un administrateur compromis de supprimer ou chiffrer les sauvegardes existantes
- C) Pour accélérer le débit de la connexion Internet
- D) Pour éviter d'avoir à faire des tests de restauration

**Réponse : B**

**Q4 :** Quel outil d'observabilité est dédié à l'analyse des traces distribuées pour mesurer la latence de chaque étape d'une requête dans une architecture microservices ?
- A) Jaeger (avec OpenTelemetry)
- B) Nmap
- C) AppArmor
- D) Fail2ban

**Réponse : A**

**Q5 :** Dans la grille d'évaluation d'un projet d'architecture de sécurité d'entreprise, quel document prouve l'exécution automatique et la conformité du durcissement par rapport aux standards internationaux ?
- A) Une facture d'achat de matériel
- B) Le rapport d'audit automatisé OpenSCAP / Lynis avec un score >= 80%
- C) Un e-mail de confirmation
- D) Une photo du centre de données

**Réponse : B**

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
