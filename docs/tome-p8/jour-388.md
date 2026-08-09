# TOME P8 — Blue Team, SOC & SIEM Advanced — Jour 388 (6h) : Container & Kubernetes Security (K8s CIS Benchmark, eBPF Falco Detection Engine, Admission Controllers & Container Escape Analysis)

> [!NOTE]
> **Objectif du jour :** Maîtriser la sécurisation approfondie des environnements **Cloud-Native et Kubernetes (K8s)** : appliquer le **K8s CIS Benchmark**, déployer **Falco (eBPF-based Runtime Security)** pour la détection d'anomalies en temps réel au niveau noyau, implémenter des **Admission Controllers (Kyverno / OPA Gatekeeper)** pour interdire les conteneurs privilégiés, et analyser les vecteurs d'évasion de conteneur (**Container Escape** via `hostPath`, `CAP_SYS_ADMIN` ou montage du socket Docker).
>
> **Compétences visées :** `K8S-SEC-01` (A) — K8s CIS Benchmark & eBPF Falco Runtime Security | `K8S-SEC-02` (A) — Admission Control (Kyverno/OPA), Pod Security Standards & Container Escape Forensics

---

## 1) Module — Architecture de Sécurité Kubernetes & eBPF Runtime (2h)

### 📖 Narration/Intuition

Les conteneurs ne sont pas des machines virtuelles : ce sont de simples processus isolés partageant le **noyau Linux de l'hôte**. Une mauvaise configuration (ex. `privileged: true` ou montage de `/var/run/docker.sock`) permet à un attaquant de sortir du conteneur et d'obtenir l'accès root sur le nœud Kubernetes (**Container Escape**).

```
   [ POD CONTENEURISÉ VULNÉRABLE ]
                 │
                 ├── 1. Privileged Container (`privileged: true`) OU CAP_SYS_ADMIN
                 ├── 2. HostPath Volume Mount (`hostPath: /`)
                 │
                 ▼ (Tentative d'Évasion de Conteneur / Container Escape)
   ┌─────────────────────────────────────────────────────────────────┐
   │                  NOYAU LINUX DU NŒUD HÔTE                       │
   │  - Falco eBPF Sensor ──► Capture l'événement système `execve`    │
   │    "Spawn shell in container with host namespace"               │
   └────────────────────────────────┬────────────────────────────────┘
                                    │
                                    ▼
       [ ALERTE FALCO DE LEVEL CRITICAL : CONTAINER ESCAPE DETECTED ]
```

#### Niveaux des Pod Security Standards (PSS) Kubernetes

| Niveau PSS | Description | Contrôles Clés |
|:---:|:---|:---|
| **Privileged** | Non restreint (Accès total au nœud) | **INTERDIT** sauf pour les agents système de bas niveau |
| **Baseline** | Empêche les élévations de privilèges connues | Bloque `hostNetwork`, `hostPID`, `hostIPC` |
| **Restricted** | Hardening maximal conforme aux meilleures pratiques | Force `runAsNonRoot: true`, `readOnlyRootFilesystem: true`, supprime toutes les capacités Linux (`drop: ["ALL"]`) |

---

## 2) Module — Outillage K8s & Falco eBPF Security Engine (`k8s_falco_engine.py`) (2h)

### 🛠️ Atelier Pratique

```python
import json
from datetime import datetime, timezone
from typing import List, Dict

class K8sFalcoEngine:
    """
    Moteur de détection de sécurité Runtime Kubernetes basé sur eBPF (Spécification Falco).
    Inspecte les spécifications de Pods (SecurityContext) et les événements système noyau.
    """

    def __init__(self, cluster_name: str):
        self.cluster = cluster_name
        self.falco_alerts: List[dict] = []
        self.policy_violations: List[dict] = []

    def audit_pod_security_context(self, pod_manifest: dict) -> dict:
        """
        Contrôleur d'admission (Admission Controller) simulant Kyverno / OPA Gatekeeper.
        Vérifie la conformité avec le profil Restricted des Pod Security Standards.
        """
        pod_name = pod_manifest.get("metadata", {}).get("name", "unknown")
        namespace = pod_manifest.get("metadata", {}).get("namespace", "default")
        spec = pod_manifest.get("spec", {})

        containers = spec.get("containers", [])
        for c in containers:
            c_name = c.get("name")
            sec_ctx = c.get("securityContext", {})

            # Violation 1 : Conteneur Privilégié (Privileged: true)
            if sec_ctx.get("privileged", False):
                self._add_policy_violation(pod_name, namespace, c_name, "CONTAINER_PRIVILEGED_ALLOWED", "CRITICAL")

            # Violation 2 : Exécution en tant que Root (runAsNonRoot false)
            if not sec_ctx.get("runAsNonRoot", False):
                self._add_policy_violation(pod_name, namespace, c_name, "CONTAINER_RUNNING_AS_ROOT", "HIGH")

            # Violation 3 : Capacités Linux dangereuses (ex: CAP_SYS_ADMIN, CAP_NET_ADMIN)
            add_caps = sec_ctx.get("capabilities", {}).get("add", [])
            if "SYS_ADMIN" in add_caps or "ALL" in add_caps:
                self._add_policy_violation(pod_name, namespace, c_name, "DANGEROUS_CAPABILITIES_ADDED", "CRITICAL")

        # Violation 4 : HostPath Volume Mount vers la racine du nœud
        volumes = spec.get("volumes", [])
        for v in volumes:
            if "hostPath" in v and v["hostPath"].get("path") in ["/", "/etc", "/var/run/docker.sock"]:
                self._add_policy_violation(pod_name, namespace, "volume", "CRITICAL_HOSTPATH_MOUNT", "CRITICAL")

        return {"pod": pod_name, "violations_count": len(self.policy_violations)}

    def process_ebpf_kernel_event(self, syscall_event: dict):
        """
        Traite un événement noyau eBPF capturé par la sonde Falco.
        """
        syscall = syscall_event.get("syscall")
        process_name = syscall_event.get("process")
        container_id = syscall_event.get("container_id")
        args = syscall_event.get("args", "")

        # Règle Falco 1 : Spawning d'un shell interactif dans un conteneur de prod
        if syscall == "execve" and process_name in ["sh", "bash", "zsh"] and container_id:
            self._raise_falco_alert(
                rule="Terminal shell in container",
                priority="WARNING",
                output=f"Un shell interactif ({process_name}) a été exécuté dans le conteneur {container_id[:12]}"
            )

        # Règle Falco 2 : Tentative d'écriture dans un répertoire système (/etc, /bin)
        if syscall in ["open", "openat", "write"] and any(p in args for p in ["/etc/shadow", "/etc/passwd"]):
            self._raise_falco_alert(
                rule="Write below binary or config dir",
                priority="CRITICAL",
                output=f"Tentative de modification de fichier système ({args}) par {process_name} dans le conteneur {container_id[:12]}"
            )

    def _add_policy_violation(self, pod: str, ns: str, target: str, rule: str, severity: str):
        entry = {"pod": pod, "namespace": ns, "target": target, "rule": rule, "severity": severity}
        self.policy_violations.append(entry)
        print(f"  [ADMISSION REJECT] [{severity}] Pod '{pod}' dans '{ns}': Violation {rule} sur {target}")

    def _raise_falco_alert(self, rule: str, priority: str, output: str):
        alert = {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "rule": rule,
            "priority": priority,
            "output": output
        }
        self.falco_alerts.append(alert)
        print(f"  [!] FALCO eBPF ALERT [{priority}] {rule}: {output}")

    def generate_k8s_security_report(self) -> dict:
        return {
            "cluster_name": self.cluster,
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "policy_violations_count": len(self.policy_violations),
            "falco_alerts_count": len(self.falco_alerts),
            "violations": self.policy_violations,
            "falco_runtime_alerts": self.falco_alerts
        }

# Démonstration K8s Falco Engine
engine = K8sFalcoEngine("paradis-prod-eks-cluster")

print("=== KUBERNETES & FALCO eBPF SECURITY ENGINE ===")

# 1. Audit d'admission d'un Manifest Pod VULNÉRABLE (Privileged + HostPath + Root)
vulnerable_pod = {
    "metadata": {"name": "malicious-admin-pod", "namespace": "default"},
    "spec": {
        "containers": [{
            "name": "attacker-container",
            "image": "ubuntu:latest",
            "securityContext": {"privileged": True, "runAsNonRoot": False, "capabilities": {"add": ["SYS_ADMIN"]}}
        }],
        "volumes": [{"name": "node-root", "hostPath": {"path": "/"}}]
    }
}
engine.audit_pod_security_context(vulnerable_pod)

# 2. Capture d'événements eBPF Falco en temps réel
engine.process_ebpf_kernel_event({"syscall": "execve", "process": "bash", "container_id": "a8f912b3c4d5", "args": "/bin/bash"})
engine.process_ebpf_kernel_event({"syscall": "openat", "process": "cat", "container_id": "a8f912b3c4d5", "args": "/etc/shadow"})

print("\n=== K8S SECURITY REPORT ===")
print(json.dumps(engine.generate_k8s_security_report(), indent=2, ensure_ascii=False))
```

---

## 3) Module — Fiche de Règle Falco & Politique Kyverno (2h)

```yaml
# 1. RÈGLE FALCO — DÉTECTION DE SHELL INTERACTIF DANS UN CONTENEUR
- rule: Terminal shell in container
  desc: A shell was spawned inside a running container
  condition: >
    container.id != host and
    evt.type = execve and
    proc.name in (bash, sh, zsh, ksh)
  output: >
    Shell spawned in container (user=%user.name container_id=%container.id
    image=%container.image.repository proc=%proc.name)
  priority: WARNING
  tags: [container, mitre_execution]

---
# 2. POLITIQUE KYVERNO — INTERDIRE LES CONTENEURS PRIVILÉGIÉS (ADMISSION CONTROL)
apiVersion: kyverno.io/v1
kind: ClusterPolicy
metadata:
  name: disallow-privileged-containers
spec:
  validationFailureAction: Enforce   # Bloque le déploiement
  rules:
  - name: validate-privileged
    match:
      resources:
        kinds:
        - Pod
    validate:
      message: "Les conteneurs privilégiés (privileged: true) sont INTERDITS dans ce cluster K8s."
      pattern:
        spec:
          containers:
          - =(securityContext):
              =(privileged): false
```

---

## 🏅 Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **eBPF** | Extended Berkeley Packet Filter — Technologie noyau Linux permettant d'exécuter du code de sécurité haute performance sans modifier le noyau |
| **Falco** | Outil open-source majeur de sécurité Runtime pour Kubernetes basé sur l'inspection des eBPF system calls |
| **Admission Controller** | Composant Kubernetes interceptant les requêtes d'API avant leur création pour valider ou rejeter les objets selon des règles de conformité |

---

## ❓ Banque de Questions & Test du Jour (5 QCM)

**Q1 :** Pourquoi la technologie **eBPF** est-elle révolutionnaire pour la sécurité Runtime de Kubernetes comparée aux agents traditionnels usermode ?
- A) Parce qu'eBPF fonctionne directement au sein du noyau Linux (Kernelmode), permettant d'intercepter 100% des appels système (`syscalls`) générés par les conteneurs avec une surcharge CPU négligeable et sans dépendre de l'espace utilisateur du conteneur
- B) Parce qu'elle supprime le besoin de sauvegardes
- C) Parce qu'elle fonctionne uniquement sur Windows Server
- D) Parce qu'elle remplace le pare-feu réseau matériel

**Réponse : A**

**Q2 :** Quel paramètre de configuration dans le `securityContext` d'un Pod Kubernetes représente le plus grand risque de **Container Escape** (Évasion de conteneur) ?
- A) `privileged: true` — qui accorde au conteneur l'accès direct à tous les périphériques et capacités du nœud hôte
- B) `readOnlyRootFilesystem: true`
- C) `runAsNonRoot: true`
- D) `imagePullPolicy: Always`

**Réponse : A**

**Q3 :** Quel est le rôle d'un **Admission Controller** (ex: Kyverno / OPA Gatekeeper) dans un cluster Kubernetes ?
- A) Intercepter et valider chaque manifeste YAML soumis à l'API Server Kubernetes pour REJETER immédiatement le déploiement de tout Pod non conforme aux politiques de sécurité (ex. conteneur root ou privilégié)
- B) Attribuer des adresses IP aux machines virtuelles
- C) Compiler le code source des applications
- D) Chiffrer les disques SSD du datacenter

**Réponse : A**

**Q4 :** Dans un profil **Restricted** des Pod Security Standards (PSS) Kubernetes, quelle directive de sécurité est obligatoire pour le système de fichiers du conteneur ?
- A) `readOnlyRootFilesystem: true` — empêcher toute modification ou écriture de binaire malveillant sur le disque du conteneur
- B) `hostPath: /`
- C) `privileged: true`
- D) `allowPrivilegeEscalation: true`

**Réponse : A**

**Q5 :** Quel outil open-source du projet CNCF est le standard de l'industrie pour la détection d'anomalies de sécurité en temps réel (Runtime Security) sur Kubernetes ?
- A) **Falco**
- B) Wireshark
- C) Metasploit
- D) Nmap

**Réponse : A**

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
