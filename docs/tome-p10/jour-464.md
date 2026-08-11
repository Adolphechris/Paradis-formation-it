# TOME P10 — Intelligence Artificielle, ML & MLOps — Jour 464 (6h) : Optimisation de Modèles ML pour la Production : Quantisation (INT8/INT4), Pruning, Knowledge Distillation, TensorRT & Benchmarking de Performance

> [!NOTE]
> **Objectifs pédagogiques :**
> - Maîtriser les 3 piliers de l'optimisation de modèles : **Quantisation**, **Pruning** (Élagage) et **Knowledge Distillation** (Distillation de connaissances)
> - Implémenter le pruning structuré et non-structuré sur des réseaux PyTorch avec la bibliothèque `torch.nn.utils.prune`
> - Structurer la distillation d'un modèle Enseignant (Teacher) vers un modèle Élève (Student) compact
> - Compiler et accélérer des graphes de calcul avec **NVIDIA TensorRT** et exécuter des benchmarks de débit/latence avec **Locust**
>
> **Compétences visées :** `AI-03` (A) — Model Optimization & High-Performance Inference

---

## Module 1 — Techniques d'Optimisation : Quantisation, Pruning & Distillation (2h)

### 📖 Intuition & Narration

Les modèles de Deep Learning récents souffrent d'une sur-parameterisation extrême. Un grand modèle possède souvent des millions de poids redondants ou proches de zéro qui n'apportent presque aucune valeur à la précision finale, tout en consommant de la mémoire VRAM et des cycles d'horloge.

Pour déployer sur des architectures aux ressources contraintes (Edge Devices, serveurs à forte densité), l'ingénierie MLOps dispose de trois leviers complémentaires :
1. **Quantisation** : Réduire la précision numérique des poids (FP32 $\rightarrow$ FP16 $\rightarrow$ INT8 $\rightarrow$ INT4).
2. **Pruning (Élagage)** : Mettre à zéro ou supprimer les connexions/neurones peu importants.
3. **Knowledge Distillation** : Entraîner un petit modèle ("Élève") à reproduire les probabilités de sortie (soft targets) d'un grand modèle expert ("Enseignant").

### 🔍 Anatomie Technique — Knowledge Distillation (Teacher-Student)

```
ARCHITECTURE DE KNOWLEDGE DISTILLATION (Hinton et al. 2015)

                 Entrée x
                    │
     ┌──────────────┴──────────────┐
     │                             │
     ▼                             ▼
 [ ENSEIGNANT (Teacher) ]      [ ÉLÈVE (Student) ]
 (Grand Modèle Gelé, FP32)     (Petit Modèle Entraînable)
     │                             │
     ▼                             ▼
 Logits z_T                    Logits z_S
     │                             │
     │ Softmax(z_T / T)            │ Softmax(z_S / T)
     ▼                             ▼
 Probabilités p_T              Probabilités p_S
     │                             │
     └──────────────┬──────────────┘
                    │
                    ▼
          PERTE DE DISTILLATION (KL Divergence)
                    +
          PERTE CLASSIQUE (Cross-Entropy avec Cible Réelle y)

  FORMULE DE LA PERTE COMBINÉE :
  L_total = α * T² * KL_Div( p_S , p_T ) + (1 - α) * CrossEntropy( p_S , y_true )
  (T = Température de lissage des logits, typiquement T = 2.0 à 5.0)
```

---

## Module 2 — Atelier Pratique : Pruning PyTorch & Distillation de Connaissances (2h)

### 🛠️ Script Python : Élagage Structuré et Distillation de Modèle en PyTorch

```python
#!/usr/bin/env python3
"""
PARADIS — Optimisation par Pruning et Knowledge Distillation en PyTorch
Réduction de la taille et accélération de l'inférence.
"""

import torch
import torch.nn as nn
import torch.nn.functional as F
import torch.nn.utils.prune as prune

# 1. Définition du Modèle Enseignant (Grand et Profond)
class TeacherModel(nn.Module):
    def __init__(self):
        super().__init__()
        self.fc1 = nn.Linear(20, 128)
        self.fc2 = nn.Linear(128, 64)
        self.fc3 = nn.Linear(64, 2)

    def forward(self, x):
        x = F.relu(self.fc1(x))
        x = F.relu(self.fc2(x))
        return self.fc3(x)

# 2. Définition du Modèle Élève (Compact et Rapide)
class StudentModel(nn.Module):
    def __init__(self):
        super().__init__()
        self.fc1 = nn.Linear(20, 32)
        self.fc2 = nn.Linear(32, 2)

    def forward(self, x):
        x = F.relu(self.fc1(x))
        return self.fc2(x)

# 3. Fonction de Perte pour Knowledge Distillation
def distillation_loss(student_logits, teacher_logits, labels, T=3.0, alpha=0.7):
    """
    Combine la divergence KL sur les soft targets et la Cross-Entropy sur la cible réelle
    """
    soft_targets = F.softmax(teacher_logits / T, dim=1)
    soft_prob_student = F.log_softmax(student_logits / T, dim=1)

    kl_loss = F.kl_div(soft_prob_student, soft_targets, reduction='batchmean') * (T ** 2)
    ce_loss = F.cross_entropy(student_logits, labels)

    return alpha * kl_loss + (1.0 - alpha) * ce_loss

def run_optimization_demo():
    torch.manual_seed(42)

    teacher = TeacherModel()
    student = StudentModel()

    # Compter les paramètres
    params_teacher = sum(p.numel() for p in teacher.parameters())
    params_student = sum(p.numel() for p in student.parameters())
    print(f"[*] Paramètres Enseignant : {params_teacher:,}")
    print(f"[*] Paramètres Élève     : {params_student:,} (Réduction de {100*(1-params_student/params_teacher):.1f}%)")

    # Données synthétiques
    x_dummy = torch.randn(64, 20)
    y_dummy = torch.randint(0, 2, (64,))

    # Passe de distillation (1 étape de démo)
    teacher.eval()
    student.train()

    with torch.no_grad():
        teacher_logits = teacher(x_dummy)

    student_logits = student(x_dummy)
    loss = distillation_loss(student_logits, teacher_logits, y_dummy, T=3.0, alpha=0.7)

    print(f"[+] Perte de Distillation calculée avec succès : {loss.item():.4f}")

    # 4. Élagage (Pruning) L1-Unstructured sur la couche fc1 du modèle Élève (30% des poids mis à zéro)
    print("\n[*] Application d'un Pruning L1-Unstructured de 30% sur l'Élève...")
    prune.l1_unstructured(student.fc1, name="weight", amount=0.3)

    # Vérification des poids masqués
    zero_weights = float(torch.sum(student.fc1.weight == 0))
    total_weights = float(student.fc1.weight.nelement())
    print(f"[+] Proportion de poids nuls après Pruning : {100*(zero_weights/total_weights):.1f}%")

    # Rendre le pruning permanent
    prune.remove(student.fc1, 'weight')
    print("[+] Masque de Pruning appliqué définitivement au tenseur de poids.")

if __name__ == "__main__":
    run_optimization_demo()
```

---

## Module 3 — Acceleration NVIDIA TensorRT & Benchmarking avec Locust (1h30)

### 🔍 Pipeline de Compilation TensorRT & Fichier de Benchmark Locust

```python
# 1. Pipeline de compilation TensorRT via Python (trtexec / tensorrt API)
# Exemple conceptuel d'optimisation d'un fichier ONNX vers un moteur TensorRT (.engine)
"""
import tensorrt as trt

TRT_LOGGER = trt.Logger(trt.Logger.WARNING)
builder = trt.Builder(TRT_LOGGER)
network = builder.create_network(1 << int(trt.NetworkDefinitionCreationFlag.EXPLICIT_BATCH))
parser = trt.OnnxParser(network, TRT_LOGGER)

with open("model.onnx", "rb") as model_file:
    parser.parse(model_file.read())

config = builder.create_builder_config()
config.set_memory_pool_limit(trt.MemoryPoolType.WORKSPACE, 1 << 30) # 1GB
config.set_flag(trt.BuilderFlag.FP16) # Activation de la précision FP16 sur GPU Tensor Cores

engine = builder.build_serialized_network(network, config)
with open("model.engine", "wb") as f:
    f.write(engine)
"""

# 2. Script de Benchmark de Charge avec Locust (locustfile.py)
from locust import HttpUser, task, between
import json

class ModelServingUser(HttpUser):
    wait_time = between(0.01, 0.05)  # Pause très courte pour tester la haute charge

    @task
    def predict_endpoint(self):
        headers = {"Content-Type": "application/json"}
        payload = {
            "packet_rate": 1500.0,
            "byte_count": 50000.0,
            "duration": 2.5,
            "failed_attempts": 0,
            "port": 443
        }
        self.client.post("/predict", data=json.dumps(payload), headers=headers)
```

---

## Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **TensorRT** | SDK d'optimisation et moteur d'inférence haute performance de NVIDIA pour GPUs |
| **Pruning** | Élagage ou suppression de poids/neurones superflus dans un réseau de neurones |
| **Distillation** | Transfert de connaissances d'un grand modèle (Teacher) vers un petit modèle (Student) |
| **Locust** | Outil open-source de test de charge écrit en Python et orienté scénarios utilisateurs |
| **KL-Divergence** | Divergence de Kullback-Leibler — Mesure de la différence entre deux distributions |

---

## Exercices Pratiques

### Exercice 1 — Calcul de Compression et d'Empreinte Mémoire

Un modèle d'analyse visuelle compte 100 millions de paramètres.
1. Calculez la taille mémoire des poids de ce modèle en précision FP32 (4 octets par paramètre).
2. Si l'on applique une quantisation en INT8 (1 octet par paramètre) combinée à un pruning non-structuré de 50% conservé sous forme condensée CSR/COO (réduisant de moitié la matrice), quelle est la nouvelle taille théorique des poids ?

**Corrigé guidé :**
1. **FP32** : $100 \times 10^6 \times 4 \text{ bytes} = 400\,000\,000 \text{ bytes} = 400 \text{ MB}$.
2. **INT8 + Pruning 50%** :
   - Quantisation INT8 : $100 \times 10^6 \times 1 \text{ byte} = 100 \text{ MB}$.
   - Pruning 50% : $50\% \times 100 \text{ MB} = 50 \text{ MB}$ (pour les poids non nuls).
   - **Taille finale** : environ **50 MB** (gain d'un facteur 8x par rapport à la version FP32 initiale).

---

## Banque QCM — 5 Questions

**Q1.** Dans le processus de **Knowledge Distillation**, à quoi sert le paramètre de **Température ($T > 1$)** appliqué au Softmax des logits ?

- A) À accélérer la vitesse de rotation des ventilateurs du GPU.
- B) À lisser les distributions de probabilités de sortie pour révéler la structure fine et les relations inter-classes ("dark knowledge") apprises par le modèle Enseignant. ✅
- C) À supprimer les valeurs négatives.
- D) À convertir le modèle en format C++.

**Q2.** Quelle est la différence entre un **Pruning Structuré** et un **Pruning Non-Structuré** ?

- A) Le pruning structuré ne s'applique qu'aux modèles sous Windows.
- B) Le pruning non-structuré met à zéro des poids individuels isolés (créant des matrices creuses), tandis que le pruning structuré supprime des canaux ou filtres entiers (réduisant la dimension réelle des matrices). ✅
- C) Le pruning non-structuré augmente la taille du fichier.
- D) Il n'y a aucune différence.

**Q3.** Quel est le rôle principal du SDK **NVIDIA TensorRT** ?

- A) Entraîner des LLMs à partir de zéro.
- B) Optimiser, fusionner les couches et compiler un graphe d'inférence pour exécuter les modèles à la latence minimale absolue sur les Tensor Cores des GPUs NVIDIA. ✅
- C) Générer des graphiques avec Matplotlib.
- D) Sauvegarder les données dans PostgreSQL.

**Q4.** La **Quantisation Post-Training (PTQ)** se distingue de la **Quantisation-Aware Training (QAT)** car :

- A) QAT ne nécessite aucun GPU.
- B) PTQ s'effectue directement sur un modèle déjà entraîné sans ré-entraînement, alors que QAT simule l'erreur de quantisation pendant l'apprentissage pour maintenir une précision optimale. ✅
- C) PTQ est uniquement disponible en C#.
- D) QAT supprime toutes les couches du réseau.

**Q5.** Dans l'outil de benchmark **Locust**, quelle métrique est cruciale pour valider qu'un microservice de serving respecte un SLA de production ?

- A) Le nombre de lignes de code du fichier Python.
- B) Le percentile 95 (P95) ou 99 (P99) du temps de réponse (latence HTTP) sous le débit de requêtes cible. ✅
- C) La couleur du terminal Bash.
- D) La version du compilateur GCC.

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
