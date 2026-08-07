# TOME P7 — Certifications d'Élite & Spécialisations — Jour 315 (6h) : Projet Intégrateur S7 Partie 3 — CKS Full Cluster Security Audit (Hardening Complet d'un Cluster Kubernetes de Production)

> [!NOTE]
> **Objectif du jour :** Mettre en œuvre un **audit de sécurité complet d'un cluster Kubernetes** simulant l'examen CKS : appliquer les 8 domaines de sécurité CKS (PSS, Supply Chain, Network Policies, Runtime Security, Secrets Encryption, RBAC Hardening, Audit Logs, Image Scanning), corriger les findings, et produire un rapport de conformité CKS.
>
> **Ce projet valide la maîtrise complète de la sécurité Kubernetes requise pour la certification CKS (CNCF).**

---

## 1) Module — Script d'Audit CKS Automatisé (`cks_cluster_audit.sh`) (2h)

### 🛠️ Audit des 8 Domaines CKS

```bash
#!/bin/bash
# CKS Cluster Security Audit — PARADIS IT Master 2
echo "=== AUDIT DE SÉCURITÉ CLUSTER KUBERNETES — CKS SIMULATION ==="
PASS=0; FAIL=0

# ──────────────────────────────────────────
# 1. CLUSTER HARDENING — RBAC Least Privilege
# ──────────────────────────────────────────
echo "[*] Contrôle 1 : ClusterRoleBindings wildcards dangereux..."
WILD=$(kubectl get clusterrolebindings -o json | python3 -c "
import json,sys
data=json.load(sys.stdin)
for item in data['items']:
    role=item['roleRef']['name']
    if role=='cluster-admin':
        print(f'FAIL: {item[\"metadata\"][\"name\"]} -> cluster-admin')
")
[ -z "$WILD" ] && echo "  PASS: Aucun binding cluster-admin non justifié" && ((PASS++)) || { echo "  $WILD"; ((FAIL++)); }

# ──────────────────────────────────────────
# 2. POD SECURITY — PSS restricted actif ?
# ──────────────────────────────────────────
echo "[*] Contrôle 2 : Pod Security Standards sur namespace production..."
PSS=$(kubectl get namespace production -o jsonpath='{.metadata.labels.pod-security\.kubernetes\.io/enforce}')
[ "$PSS" = "restricted" ] && echo "  PASS: PSS restricted activé" && ((PASS++)) || { echo "  FAIL: PSS non configuré (actuel: $PSS)"; ((FAIL++)); }

# ──────────────────────────────────────────
# 3. NETWORK — Default Deny All present ?
# ──────────────────────────────────────────
echo "[*] Contrôle 3 : NetworkPolicy default-deny-all dans production..."
DENY=$(kubectl get networkpolicy default-deny-all -n production 2>/dev/null)
[ -n "$DENY" ] && echo "  PASS: default-deny-all présente" && ((PASS++)) || { echo "  FAIL: NetworkPolicy default-deny-all manquante"; ((FAIL++)); }

# ──────────────────────────────────────────
# 4. SECRETS — Chiffrement etcd activé ?
# ──────────────────────────────────────────
echo "[*] Contrôle 4 : Chiffrement des Secrets etcd..."
ETCD_ENC=$(grep -l "EncryptionConfig" /etc/kubernetes/manifests/kube-apiserver.yaml 2>/dev/null)
[ -n "$ETCD_ENC" ] && echo "  PASS: EncryptionConfiguration active" && ((PASS++)) || { echo "  FAIL: Secrets etcd non chiffrés !"; ((FAIL++)); }

# ──────────────────────────────────────────
# 5. IMAGES — Trivy scan résumé
# ──────────────────────────────────────────
echo "[*] Contrôle 5 : Images de production sans CVE critiques..."
IMAGES=$(kubectl get pods -n production -o jsonpath='{.items[*].spec.containers[*].image}' | tr ' ' '\n' | sort -u)
for img in $IMAGES; do
  CRIT=$(trivy image --severity CRITICAL --quiet "$img" 2>/dev/null | grep -c "CRITICAL")
  [ "$CRIT" -eq 0 ] && echo "  PASS: $img — 0 CVE CRITICAL" && ((PASS++)) || { echo "  FAIL: $img — $CRIT CVE CRITICAL !"; ((FAIL++)); }
done

# ──────────────────────────────────────────
# SCORE FINAL
# ──────────────────────────────────────────
TOTAL=$((PASS+FAIL))
SCORE=$((PASS*100/TOTAL))
echo ""
echo "=== SCORE CKS CLUSTER AUDIT : $PASS/$TOTAL ($SCORE%) ==="
[ $SCORE -ge 75 ] && echo "STATUS: CONFORME CKS ✅" || echo "STATUS: NON CONFORME ❌ — Remédiation requise"
```

---

## 2) Module — Plan de Remédiation CKS (1h30)

```markdown
# RAPPORT D'AUDIT CKS — CLUSTER KUBERNETES DE PRODUCTION

## Findings Critiques (P0 — Action < 24h)
| # | Domaine | Finding | Remédiation |
|---|---------|---------|-------------|
| 1 | Secrets | Secrets etcd non chiffrés | Activer EncryptionConfiguration aescbc/KMS |
| 2 | RBAC | ServiceAccount `default` avec cluster-admin | Révoquer + RBAC least privilege |
| 3 | PSS | Namespace production sans profil restricted | Appliquer PSS labels enforce=restricted |

## Findings Hauts (P1 — Action < 7 jours)
| # | Domaine | Finding | Remédiation |
|---|---------|---------|-------------|
| 4 | Network | Absence de NetworkPolicy default-deny-all | Déployer deny-all + allow minimal |
| 5 | Runtime | Pas de profil Seccomp sur les Pods | Appliquer RuntimeDefault ou Localhost |
| 6 | Supply Chain | Images non signées Cosign en production | Intégrer Cosign verify dans le pipeline |
```

---

## 3) Module — Mock Exam CKS — 10 Questions (2h30)

**Q1 :** Comment vérifier que le chiffrement des Secrets etcd est actif sur un cluster kubeadm ?
- **A)** Vérifier la présence du flag `--encryption-provider-config` dans `/etc/kubernetes/manifests/kube-apiserver.yaml` ✅

**Q2 :** Comment identifier tous les ServiceAccounts qui ont des droits cluster-admin ?
- **A)** `kubectl get clusterrolebindings -o json | jq '.items[] | select(.roleRef.name=="cluster-admin")'` ✅

**Q3 :** Quel provider de chiffrement etcd est recommandé pour la production avec rotation automatique des clés ?
- **A)** Provider `kms` (AWS KMS / HashiCorp Vault KMS Plugin) ✅

**Q4 :** Comment empêcher un container de monter l'API socket Docker (`/var/run/docker.sock`) via OPA Gatekeeper ?
- **A)** ConstraintTemplate Rego vérifiant `input.review.object.spec.volumes[_].hostPath.path == "/var/run/docker.sock"` ✅

**Q5 :** Que vérifie `kubectl auth can-i --list --as=system:serviceaccount:production:default` ?
- **A)** Les permissions du ServiceAccount `default` du namespace `production` sur le cluster ✅

---

## 🏅 Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **etcd** | Base de données distribuée clé-valeur stockant tout l'état d'un cluster Kubernetes |
| **KMS Provider** | Fournisseur de chiffrement etcd utilisant un service KMS externe (AWS KMS, Vault) pour la gestion des clés |
| **RBAC** | Role-Based Access Control — Contrôle d'accès par rôles dans Kubernetes |

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
