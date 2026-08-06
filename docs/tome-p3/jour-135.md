# TOME P3 — Cloud Native, DevOps & Cyberdéfense — Jour 135 (6h) : Sécurité du WebAssembly (WASM) & Micro-Runtimes Edge (Wasmtime, WasmEdge, Wasmer & Component Model)

> [!NOTE]
> **Objectif du jour :** Concevoir et sécuriser des micro-services d'exécution distribués à ultra-haute performance avec WebAssembly (WASM) côté serveur et Edge : runtimes Wasmtime / WasmEdge, isolation mémoire Sandbox sans conteneur Linux, WASI (WebAssembly System Interface) et Component Model.
>
> **Compétences visées :** `BIT-06` (A) — Micro-Runtimes WASM Serverless | `SEC-03` (A) — Isolement Mémoire WASM & Sandboxing

---

## 1) Module — Pourquoi WebAssembly (WASM) côté Serveur ? (2h)

### 📖 Narration/Intuition

Les conteneurs Docker/Linux ont révolutionné le déploiement, mais ils traînent avec eux un système d'exploitation Linux complet (noyau, système de fichiers, allocation de mémoire VM) : une image conteneur minimale pèse entre 20 et 200 Mo et met plusieurs centaines de millisecondes à démarrer.

**WebAssembly (WASM)** côté serveur représente la prochaine étape de l'évolution Cloud-Native. Initialement conçu pour le navigateur web, WASM est un format d'instructions binaire compact pour une machine virtuelle à pile.

Côté serveur, un binaire WASM pèse **quelques kilo-octets**, démarre en **moins de 1 milliseconde**, et s'exécute à une vitesse quasi-native (compilation JIT/AOT) à l'intérieur d'un **sandbox mémoire hermétique sans système d'exploitation sous-jacent**.

### 🔍 Anatomie Technique

**Comparaison des Architectures d'Exécution (VM vs Docker vs WASM) :**

```
┌─────────────────────────────────────────────────────────────┐
│ 1. MACHINE VIRTUELLE (KVM / QEMU)                           │
│    - Poids : 2 à 20 GB | Démarrage : 10 - 30 secondes       │
│    - Hyperviseur + OS Invité Complet (Kernel + Drivers)     │
└─────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. CONTENEUR LINUX (DOCKER / KUBERNETES)                    │
│    - Poids : 20 à 500 MB | Démarrage : 200ms - 2 secondes   │
│    - Partage le noyau Linux hôte + Filesystem complet       │
└─────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. WEB-ASSEMBLY SERVERSIDE (WASMTIME / WASMEDGE)            │
│    - Poids : 50 KB à 2 MB | Démarrage : < 1 milliseconde    │
│    - Sandbox Mémoire Linéaire Isolée (Aucun OS, Aucun Root) │
└─────────────────────────────────────────────────────────────┘
```

---

## 2) Module — WASI & Isolation Mémoire de Sandbox WASM (2h)

### 📖 Narration/Intuition

Par défaut, un module WebAssembly est totalement aveugle et amnésique : il ne peut ni lire un fichier, ni ouvrir une socket réseau, ni accéder à l'horloge système. C'est le niveau d'isolement mémoire le plus strict du monde informatique (**Capability-Based Security**).

**WASI (WebAssembly System Interface)** est le standard d'interface système qui permet au runtime hôte (Wasmtime/WasmEdge) d'accorder sélectivement à un module WASM le droit d'accéder à un répertoire ou un port spécifique, et RIEN D'AUTRE.

### 🔍 Anatomie Technique

**Code Rust compilé en WebAssembly WASM (`main.rs`) :**

```rust
// Code Rust compilé vers la cible wasm32-wasi : cargo build --target wasm32-wasi --release
use std::fs::File;
use std::io::prelude::*;

fn main() -> std::io::Result<()> {
    println!("=== MODULE WASM BANCAIRE BCC DÉMARRÉ EN < 1MS ===");
    
    // Tente de lire le fichier de transaction autorisé via WASI
    let mut file = File::open("/data/transaction.json")?;
    let mut contents = String::new();
    file.read_to_string(&mut contents)?;
    
    println!("   Données lues depuis le Sandbox WASM : {}", contents);
    Ok(())
}
```

**Exécution sécurisée dans le runtime Wasmtime avec accès restreint :**

```bash
# Compilation du code Rust vers WebAssembly
cargo build --target wasm32-wasi --release

# Exécution dans le runtime Wasmtime en accordant uniquement l'accès au dossier /tmp/data
wasmtime run --dir=/tmp/data::/data target/wasm32-wasi/release/bcc_wasm_app.wasm

# Si le module WASM tente de lire /etc/passwd -> REJETÉ IMMÉDIATEMENT par le Sandbox WASI !
```

---

## 3) Module — Intégration WASM dans Kubernetes (K3s / Spin / WasmEdge) (2h)

### 📖 Narration/Intuition

On peut faire cohabiter des conteneurs Docker classiques et des modules WebAssembly ultra-rapides au sein d'un même cluster Kubernetes grâce au projet **runwasi** (plugin containerd).

### 🔍 Anatomie Technique

**Manifeste Pod Kubernetes d'exécution d'un microservice WASM (`wasm-pod-k8s.yaml`) :**

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: bcc-high-speed-wasm-calculator
  namespace: bcc-production
spec:
  # Handler containerd runwasi pour WebAssembly
  runtimeClassName: wasmedge
  containers:
    - name: wasm-calc
      image: ghcr.io/bcc/wasm-calculator:v1.0.0 # Image OCI contenant le binaire .wasm
      resources:
        limits:
          memory: "16Mi"  # Consommation mémoire ultra-faible (16 MB au lieu de 512 MB !)
          cpu: "100m"
```

---

## 🏅 Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **WASM** | WebAssembly — Format d'instructions binaire compact pour machine virtuelle à pile |
| **WASI** | WebAssembly System Interface — Spécification d'accès système sécurisé basé sur les capacités |
| **Capability-Based Security** | Modèle de sécurité où chaque droit d'accès doit être explicitement conféré |
| **Wasmtime / WasmEdge** | Runtimes d'exécution WebAssembly côté serveur de référence |

---

## 🏋️ Exercices & Corrigés

**Exercice 1 :** Quelle est la différence majeure entre le modèle de sécurité d'un **conteneur Linux (Docker)** et un **module WebAssembly (WASM)** ?

**Corrigé :** Un **conteneur Linux** s'appuie sur des mécanismes d'isolation du noyau (Namespaces, Cgroups, Seccomp) et conserve un environnement d'exécution proche d'un OS (système de fichiers, variables d'environnement, interpréteurs). S'il tourne sous l'utilisateur root, une faille du noyau peut permettre l'évasion. Un **module WebAssembly (WASM)** s'exécute dans une **machine virtuelle mémoire linéaire complètement étanche (Sandbox)**. Il n'a aucun accès au système d'exploitation hôte par défaut. Toute interaction système doit être accordée explicitement par l'hôte via la spécification WASI (Capability-Based Security).

**Exercice 2 :** Pourquoi l'empreinte mémoire et le temps de démarrage du WebAssembly (WASM) sont-ils une révolution pour les architectures Serverless à l'Edge ?

**Corrigé :** Une fonction Serverless basée sur un conteneur Linux Docker (ex: Python/Java) doit charger un runtime et des bibliothèques système, consommant 100 à 500 Mo de RAM et nécessitant 200 ms à 2 secondes de temps de démarrage à froid (Cold Start). Un binaire **WebAssembly (WASM)** ne pèse que quelques kilo-octets et s'instancie en **moins d'une milliseconde** avec une consommation mémoire de seulement **1 à 10 Mo de RAM**. Cela permet de déployer des millions de fonctions instantanées sur des serveurs de bordure (Edge Nodes) à moindre coût.

---

## ❓ Banque de Questions & Test du Jour

**Q1 :** Quel format d'instructions binaire compact permet d'exécuter du code compilé (Rust, C++, Go) dans un sandbox mémoire ultra-rapide à démarrer en < 1ms côté serveur ?
- A) WebAssembly (WASM)
- B) MS-DOS
- C) Disquette
- D) Câble VGA

**Réponse : A**

**Q2 :** Quelle spécification d'interface système (WebAssembly System Interface) permet d'accorder de manière granulaire des capacités d'accès système (fichiers, sockets) à un binaire WASM ?
- A) WASI
- B) POP3
- C) FTP
- D) Telnet

**Réponse : A**

**Q3 :** Quel est le modèle de sécurité fondamental de WebAssembly où le module n'a aucun accès implicite aux ressources et doit recevoir des droits explicites du runtime hôte ?
- A) Capability-Based Security (Sécurité basée sur les capacités)
- B) Mot de passe par défaut
- C) Accès root total
- D) Pas de sécurité

**Réponse : A**

**Q4 :** Quel runtime d'exécution WebAssembly côté serveur développé par la Bytecode Alliance est l'un des standards mondiaux pour l'exécution WASM ?
- A) Wasmtime (ou WasmEdge / Wasmer)
- B) Paint
- C) Notepad
- D) Excel

**Réponse : A**

**Q5 :** Quelle est l'empreinte mémoire moyenne et le temps de démarrage typique d'un microservice WebAssembly par rapport à un conteneur Docker traditionnel ?
- A) Moins de 16 Mo de RAM et démarrage en moins de 1 milliseconde
- B) 100 Go de RAM et 4 heures de démarrage
- C) 5 Go de RAM
- D) 1 jour de démarrage

**Réponse : A**

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
