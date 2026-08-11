# TOME P11 — DevSecOps, Cloud Security & Gouvernance — Jour 505 (6h) : Container Security & Runtime Isolation : Hardening Docker, Profiles Seccomp/AppArmor, gVisor & Détection Runtime Falco

> [!NOTE]
> **Objectifs pédagogiques :**
> - Maîtriser le modèle de sécurité et d'isolation des conteneurs Linux (Namespaces, Cgroups, Capabilities)
> - Hardener une image Docker (Distroless, Non-root user, Read-only filesystem, Multi-stage build)
> - Restreindre les appels système Linux du noyau avec **Seccomp** et **AppArmor**
> - Détecter les intrusions et comportements anormaux en temps réel dans les conteneurs avec **Sysdig Falco**
>
> **Compétences visées :** `SEC-05` (A), `INF-02` (A) — Container Security & Runtime Hardening

---

## Module 1 — Principes de l'Isolation Conteneur & Surface d'Attaque (2h)

### 📖 Intuition & Narration

Contrairement à une Machine Virtuelle (VM) qui possède son propre système d'exploitation et son propre noyau (Hyperviseur), un conteneur Docker partage le **noyau Linux de l'hôte**.

Un conteneur est simplement un processus Linux ordinaire isolé par des barrières logicielles :
- **Namespaces** (PID, Net, Mount, User, IPC) : Ce que le conteneur peut *voir*.
- **Cgroups** (Control Groups) : Ce que le conteneur peut *consommer* (CPU, RAM).
- **Capabilities** : Ce que le conteneur a le droit de *faire* au niveau du noyau (ex: `CAP_NET_ADMIN`).

Si un conteneur tourne en tant que `root` (UID 0) et qu'une vulnérabilité d'évasion de conteneur (Container Escape) est exploitée, l'attaquant devient immédiatement `root` sur la machine hôte !

### 🔍 Anatomie Technique — Isolation Kernel & Couches de Hardening

```
ARCHITECTURE D'ISOLATION ET HARDENING DE CONTENEUR

  ┌──────────────────────────────────────────────────────────────────┐
  │ PROCESSUS CONTENEUR (Utilisateur non-root UID 10001)             │
  │ File System Read-Only ■ Distroless Base Image ■ No Capabilities   │
  └────────────────────────────────┬─────────────────────────────────┘
                                   │
                                   ▼ [ Appels Système (syscalls) ]
  ┌──────────────────────────────────────────────────────────────────┐
  │ FILTRE SECCOMP / APPARMOR PROFILE                                │
  │ Intercepte et bloque les syscalls dangereux (ptrace, reboot...)  │
  └────────────────────────────────┬─────────────────────────────────┘
                                   │ (Si autorisé)
                                   ▼
  ┌──────────────────────────────────────────────────────────────────┐
  │ NOYAU LINUX HÔTE (KERNEL)                                        │
  │ ──► FALCO (eBPF Sensor) : Détecte tout comportement anormal      │
  └──────────────────────────────────────────────────────────────────┘
```

---

## Module 2 — Atelier Pratique : Dockerfile Hardened & Scanner de Sécurité (2h)

### 🛠️ Dockerfile Hardened & Script Python de Validation de Conformité

```dockerfile
# /docker/Dockerfile.hardened — Exemple d'Image Hardened Production
# 1. Multi-stage build pour éliminer les compilateurs du conteneur final
FROM python:3.12-slim AS builder
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir --user -r requirements.txt

# 2. Image finale minimale Distroless / Non-root
FROM python:3.12-slim AS runner
WORKDIR /app

# Création d'un utilisateur système non-root dédié (UID 10001)
RUN groupadd -g 10001 appgroup && \
    useradd -u 10001 -g appgroup -s /sbin/nologin appuser

# Copie uniquement des artefacts compilés
COPY --from=builder /root/.local /home/appuser/.local
COPY src/ /app/src/

# Attribution stricte des droits
RUN chown -R appuser:appgroup /app
USER 10001:10001

ENV PATH=/home/appuser/.local/bin:$PATH
EXPOSE 8080

# Système de fichiers en lecture seule recommandé lors de l'exécution (docker run --read-only)
CMD ["python", "src/main.py"]
```

```python
#!/usr/bin/env python3
"""
PARADIS — Container Configuration Security Auditor
Vérifie la conformité des configurations de lancement de conteneurs (Docker/K8s).
"""

import json
import sys

def audit_container_security_config(config: dict) -> bool:
    print("=== AUDIT DE SÉCURITÉ DE CONFIGURATION DE CONTENEUR PARADIS IT ===")
    violations = []

    # Règle 1 : Vérifier si l'utilisateur est non-root
    user = config.get("User", "")
    if user in ("", "0", "root"):
        violations.append("[🚨 CRITICAL] Le conteneur s'exécute en tant que ROOT (UID 0) !")

    # Règle 2 : Système de fichiers en lecture seule (Read-Only Root Filesystem)
    read_only = config.get("HostConfig", {}).get("ReadonlyRootfs", False)
    if not read_only:
        violations.append("[⚠️ HIGH] Le système de fichiers n'est pas configuré en Read-Only !")

    # Règle 3 : Interdiction de l'élévation de privilèges (No New Privileges)
    security_opts = config.get("HostConfig", {}).get("SecurityOpt", [])
    if "no-new-privileges:true" not in security_opts:
        violations.append("[⚠️ HIGH] L'option 'no-new-privileges:true' est manquante !")

    # Règle 4 : Privileged Mode
    privileged = config.get("HostConfig", {}).get("Privileged", False)
    if privileged:
        violations.append("[🚨 CRITICAL] Le conteneur s'exécute en mode PRIVILEGED !")

    print(f"[*] Analyse de la configuration du conteneur...")
    if violations:
        print(f"\n[!] Violations de sécurité détectées ({len(violations)}) :")
        for v in violations:
            print(f"  {v}")
        print("\n[⛔ RESULTAT] CONTENEUR NON CONFORME — Déploiement Interdit.")
        return False
    else:
        print("\n[✅ RESULTAT] CONTENEUR HARDENED — Conforme aux exigences de sécurité.")
        return True

if __name__ == "__main__":
    # Test d'une configuration vulnérable simulée
    vulnerable_config = {
        "User": "root",
        "HostConfig": {
            "ReadonlyRootfs": False,
            "Privileged": False,
            "SecurityOpt": []
        }
    }
    success = audit_container_security_config(vulnerable_config)
    if not success:
        sys.exit(1)
```

---

## Module 3 — Runtime Security avec Falco & gVisor (1h30)

### 🔍 Sysdig Falco & Sandboxing gVisor

1. **Sysdig Falco** : Outil open-source de détection de menaces en temps réel. Il utilise **eBPF** pour intercepter tous les appels système au niveau du noyau et déclencher des alertes (ex: ouverture d'un shell `/bin/bash` dans un conteneur de production).
2. **gVisor (Google)** : Moteur d'exécution de conteneur alternatif (OIDC Runtime) qui réimplémente les appels système Linux dans un bac à sable en langage Go, isolant totalement le conteneur du noyau hôte.

---

## Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **Seccomp** | Secure Computing Mode — Filtre d'appels système du noyau Linux |
| **AppArmor** | Application Armor — Module de sécurité du noyau Linux imposant des restrictions |
| **eBPF** | Extended Berkeley Packet Filter — Technologie d'exécution de code sécurisé dans le noyau |
| **Distroless** | Image de conteneur minimale ne contenant que l'application et ses dépendances sans OS complet |

---

## Exercices Pratiques

### Exercice 1 — Rédaction de Règle Falco

Rédigez une règle Falco simple qui déclenche une alerte si un processus interactif shell (`bash` ou `sh`) est exécuté à l'intérieur d'un conteneur.

**Corrigé guidé :**
```yaml
- rule: Shell in Container
  desc: Détection de l'ouverture d'un shell interactif dans un conteneur
  condition: container.id != host and proc.name in (bash, sh)
  output: "ALERTE SÉCURITÉ : Shell ouvert dans le conteneur (user=%user.name container_id=%container.id command=%proc.cmdline)"
  priority: WARNING
```

---

## Banque QCM — 5 Questions

**Q1.** Pourquoi l'exécution d'un conteneur en tant qu'utilisateur **`root` (UID 0)** est-elle considérée comme une grave vulnérabilité ?

- A) Parce que le conteneur consomme trop de batterie.
- B) Parce que si un attaquant réussit une évasion de conteneur (Container Escape), il obtient immédiatement les privilèges `root` complets sur le serveur hôte. ✅
- C) Parce que Docker refuse de démarrer.
- D) Parce que le code Python ne s'exécute pas en root.

**Q2.** Quel est le rôle principal d'un profil **Seccomp** pour un conteneur Linux ?

- A) Accélérer la vitesse de téléchargement de l'image Docker.
- B) Restreindre et filtrer la liste des appels système (syscalls) que le conteneur a le droit d'effectuer auprès du noyau Linux. ✅
- C) Redimensionner les images d'affichage.
- D) Sauvegarder la base de données.

**Q3.** Qu'est-ce qu'une image de conteneur **Distroless** ?

- A) Une image sans système d'exploitation complet (ni gestionnaire de packages, ni shell), ne contenant que l'application et ses dépendances pour réduire au maximum la surface d'attaque. ✅
- B) Une image corrompue qui ne fonctionne pas.
- C) Une image payante d'entreprise.
- D) Une image qui n'utilise pas de réseau.

**Q4.** Comment l'outil **Falco** parvient-il à détecter les intrusions dans les conteneurs en temps réel ?

- A) En prenant des captures d'écran de l'ordinateur.
- B) En interceptant les appels système (syscalls) du noyau Linux via eBPF ou un module kernel et en les comparant à des règles de sécurité. ✅
- C) En envoyant des e-mails aux utilisateurs.
- D) En analysant l'historique du navigateur web.

**Q5.** Que réalise la technologie **gVisor** (développée par Google) pour isoler les conteneurs ?

- A) Elle réimplémente les appels système du noyau dans un bac à sable (sandbox) écrit en Go, empêchant le conteneur d'interagir directement avec le noyau de l'hôte. ✅
- B) Elle supprime les fichiers temporaires.
- C) Elle traduit le code C++ en Java.
- D) Elle éteint le serveur en cas d'attaque.

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
