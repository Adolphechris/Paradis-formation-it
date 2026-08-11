# TOME P11 — DevSecOps, Cloud Security & Gouvernance — Jour 508 (6h) : Architecture de Sécurité Cloud & Gouvernance : Hardening Multi-Cloud (AWS/GCP/Azure), IAM Moindre Privilège & CSPM

> [!NOTE]
> **Objectifs pédagogiques :**
> - Maîtriser le Modèle de Responsabilité Partagée (Shared Responsibility Model) entre le fournisseur cloud et le client
> - Appliquer le principe du Moindre Privilège (Least Privilege) sur les identités IAM multi-cloud (AWS IAM, Azure RBAC, GCP IAM)
> - Déployer une solution **CSPM (Cloud Security Posture Management)** pour la surveillance continue de la conformité
> - Activer l'immuabilité et la centralisation des logs d'audit cloud (CloudTrail, GCP Audit Logs, Azure Activity Log)
>
> **Compétences visées :** `SEC-05` (A), `INF-02` (A) — Cloud Security Architecture & CSPM

---

## Module 1 — Modèle de Responsabilité Partagée & IAM Moindre Privilège (2h)

### 📖 Intuition & Narration

Beaucoup d'entreprises pensent à tort que la migration vers le Cloud (AWS, GCP ou Azure) transfère 100% de la responsabilité de la sécurité au fournisseur. C'est une erreur dramatique.

Le **Modèle de Responsabilité Partagée** stipule que :
- Le fournisseur Cloud est responsable de la **Sécurité DU Cloud** (Sécurité physique des data centers, matériel, hyperviseurs, réseau physique).
- Le client est responsable de la **Sécurité DANS le Cloud** (Gestion des identités IAM, chiffrement des données, règles de pare-feu, configuration des VM et conteneurs).

La majorité des piratages cloud ne sont pas dus à des failles chez le fournisseur cloud, mais à des **erreurs de configuration du client** (clés IAM trop permissives, buckets publics).

### 🔍 Anatomie Technique — Modèle IAM & Posture CSPM

```
MODÈLE DE RESPONSABILITÉ PARTAGÉE & PILIERS CSPM

  ┌─────────────────────────────────────────────────────────────────┐
  │ RESPONSABILITÉ CLIENT (Sécurité DANS le Cloud)                 │
  │ - Identités & Accès IAM (Moindre privilège, MFA obligatoire)   │
  │ - Chiffrement des données (KMS / Customer Managed Keys)         │
  │ - Configurations Réseau (VPC, Security Groups)                  │
  └────────────────────────────────┬────────────────────────────────┘
                                   │
                                   ▼ [ Audit continu CSPM ]
  ┌─────────────────────────────────────────────────────────────────┐
  │ CSPM (Cloud Security Posture Management — Wiz, Prowler, Scout)  │
  │ Détecte les dérives de configuration et les accès excessifs     │
  └────────────────────────────────┬────────────────────────────────┘
                                   │
                                   ▼
  ┌─────────────────────────────────────────────────────────────────┐
  │ RESPONSABILITÉ FOURNISSEUR (Sécurité DU Cloud)                  │
  │ Data Centers physiques, Serveurs, Hyperviseurs, Réseau physique │
  └─────────────────────────────────────────────────────────────────┘
```

---

## Module 2 — Atelier Pratique : Auditor de Sécurité IAM Multi-Cloud (2h)

### 🛠️ Code Python : Script d'Audit IAM & Detection des Rôles Permissifs

```python
#!/usr/bin/env python3
"""
PARADIS — Multi-Cloud IAM Least Privilege Security Auditor
Inspecte les politiques IAM (AWS/GCP/Azure) et alerte sur les permissions sauvages (Wildcards).
"""

import json
import sys

def audit_iam_policy(policy_doc: dict) -> bool:
    print("=== AUDIT DE SÉCURITÉ IAM MOINDRE PRIVILÈGE PARADIS IT ===")
    violations = []

    statements = policy_doc.get("Statement", [])
    for stmt in statements:
        effect = stmt.get("Effect", "")
        actions = stmt.get("Action", [])
        resources = stmt.get("Resource", [])

        if isinstance(actions, str):
            actions = [actions]
        if isinstance(resources, str):
            resources = [resources]

        if effect == "Allow":
            # Règle 1 : Action Joker (*)
            if "*" in actions:
                violations.append("[🚨 CRITICAL] Action '*' accordée ! Accès administrateur complet détecté.")

            # Règle 2 : Action iam:* ou permissions d'escalade
            if any("iam:*" in a or "iam:CreateUser" in a for a in actions):
                violations.append("[🚨 CRITICAL] Autorisation de modification IAM susceptible de permettre une escalade de privilèges.")

            # Règle 3 : Ressource Joker sur actions sensibles
            if "*" in resources and any(a not in ("sts:AssumeRole",) for a in actions if a != "*"):
                violations.append("[⚠️ HIGH] Utilisation du joker '*' pour les ressources sur des actions sensibles.")

    print(f"[*] Analyse de la politique IAM '{policy_doc.get('PolicyName', 'unnamed')}'...")

    if violations:
        print(f"\n[!] Violations du principe du Moindre Privilège ({len(violations)}) :")
        for v in violations:
            print(f"  {v}")
        print("\n[⛔ RESULTAT] POLITIQUE IAM NON CONFORME — Rejet immédiat.")
        return False
    else:
        print("\n[✅ RESULTAT] POLITIQUE IAM VALIDE — Respecte le principe du moindre privilège.")
        return True

if __name__ == "__main__":
    vulnerable_policy = {
        "PolicyName": "OverlyPermissivePolicy",
        "Statement": [
            {
                "Effect": "Allow",
                "Action": "*",
                "Resource": "*"
            }
        ]
    }
    success = audit_iam_policy(vulnerable_policy)
    if not success:
        sys.exit(1)
```

---

## Module 3 — CSPM & Centralisation des Logs d'Audit Cloud (1h30)

### 🔍 Outils CSPM & Immuabilité des Logs

Un outil **CSPM (Cloud Security Posture Management)** tel que **Prowler** (open-source) ou **Wiz** effectue des scans automatiques et continus des API des comptes cloud pour vérifier le respect des benchmarks de sécurité (ex: **CIS AWS Benchmarks**).

Les logs d'audit cloud (**AWS CloudTrail**, **GCP Admin Activity Logs**) doivent impérativement être :
1. **Centralisés** dans un compte de sécurité isolé.
2. **Protégés en écriture seule / Immuables** (S3 Object Lock / WORM — Write Once Read Many) pour empêcher un attaquant ayant compromis un compte de supprimer les traces de son intrusion.

---

## Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **CSPM** | Cloud Security Posture Management — Surveillance continue de la sécurité des configurations cloud |
| **IAM** | Identity and Access Management — Gestion des identités et des accès |
| **CIS** | Center for Internet Security — Organisme publiant des benchmarks de sécurité de référence |
| **WORM** | Write Once, Read Many — Technologie de stockage immuable empêchant la modification ou suppression |

---

## Exercices Pratiques

### Exercice 1 — Audit d'une Règle IAM AWS

Pourquoi l'action `iam:PassRole` combinée avec `ec2:RunInstances` nécessite-t-elle une attention particulière lors d'un audit de sécurité IAM ?

**Corrigé guidé :**
L'action `iam:PassRole` permet à un utilisateur d'attribuer un rôle IAM à une instance EC2. Si l'utilisateur a le droit d'assigner un rôle d'administration puissant (ex: `AdministratorAccess`) à une VM qu'il crée, il peut se connecter à cette VM et récupérer les jetons temporaires du rôle d'admin. C'est une technique classique d'**escalade de privilèges**.

---

## Banque QCM — 5 Questions

**Q1.** Dans le **Modèle de Responsabilité Partagée** du Cloud, qui est responsable de la bonne configuration des identités IAM et des règles de pare-feu d'une application déployée sur AWS ?

- A) Le fournisseur AWS.
- B) Le client entreprise. ✅
- C) La police nationale.
- D) Personne.

**Q2.** Quel est le principe fondamental de sécurité de l'**IAM Moindre Privilège (Least Privilege)** ?

- A) Donner tous les accès à tous les employés pour éviter les bloquages.
- B) Accorder uniquement les permissions strictement nécessaires à un utilisateur ou service pour accomplir sa tâche, et rien de plus. ✅
- C) Supprimer les mots de passe.
- D) Changer d'adresse e-mail tous les jours.

**Q3.** Quel est le rôle principal d'une solution **CSPM (Cloud Security Posture Management)** comme Prowler ou Wiz ?

- A) Redémarrer automatiquement les serveurs en panne.
- B) Scanner en continu les configurations des comptes Cloud pour détecter les non-conformités, les accès excessifs et les buckets exposés. ✅
- C) Imprimer des rapports papier.
- D) Chiffrer les e-mails.

**Q4.** Pourquoi les buckets S3 contenant les logs d'audit **CloudTrail** doivent-ils être configurés avec l'option **S3 Object Lock / WORM** ?

- A) Pour accélérer la recherche des logs.
- B) Pour rendre les logs d'audit immuables et incassables, empêchant tout piratage ou suppression des traces par un attaquant. ✅
- C) Pour réduire la taille des fichiers.
- D) Pour interdire l'accès au RSSI.

**Q5.** Que contient un log **AWS CloudTrail** ?

- A) Les photos des serveurs physiques.
- B) L'historique complet des appels d'API effectués sur le compte AWS (qui a fait quoi, quand et depuis quelle adresse IP). ✅
- C) Les e-mails des clients.
- D) Les lignes de code source Python.

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
