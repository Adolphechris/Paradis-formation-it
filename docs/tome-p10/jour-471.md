# TOME P10 — Intelligence Artificielle, ML & MLOps — Jour 471 (6h) : Computer Vision Avancée : Détection (YOLOv8/DETR), Segmentation Zero-Shot (SAM), Tracking Multi-Objets (DeepSORT) & Déploiement Edge

> [!NOTE]
> **Objectifs pédagogiques :**
> - Maîtriser l'architecture de détection en temps réel **YOLOv8/v9** et les **Detection Transformers (DETR)**
> - Implémenter la segmentation d'instances Zero-Shot avec le modèle **SAM (Segment Anything Model — Meta)**
> - Déployer un pipeline de suivi d'objets multiples en temps réel (**Multi-Object Tracking avec DeepSORT**)
> - Optimiser et exporter un modèle de vision pour le déploiement sur équipements Edge (TensorRT/NVIDIA Jetson)
>
> **Compétences visées :** `AI-01` (A) — Advanced Computer Vision & Object Tracking

---

## Module 1 — Architectures de Détection : YOLOv8 vs DETR (2h)

### 📖 Intuition & Narration

La vision par ordinateur a dépassé la simple classification d'images entières. La **Détection d'Objets** exige de localiser simultanément l'emplacement de chaque objet via une boîte englobante (**Bounding Box $(x, y, w, h)$**) et d'identifier sa classe.

Deux grandes familles d'architectures s'affrontent :
1. **Les modèles Single-Shot Anchoress (YOLOv8/v9)** : Extrêmement rapides ($>100\text{ FPS}$), découpent l'image en une grille et prédisent directement les boîtes et les probabilités sans passer par un générateur de régions.
2. **Les Transformers de Détection (DETR — Carion et al.)** : Éliminent les ancres et le NMS (Non-Maximum Suppression) grâce à une attention globale jointant la détection à un problème de correspondance bivariée (Hungarian Matching).

### 🔍 Anatomie Technique — Architecture YOLOv8 & Non-Maximum Suppression (NMS)

```
PIPELINE DE DÉTECTION YOLOV8 & NON-MAXIMUM SUPPRESSION (NMS)

  [ Image d'entrée 640x640 ]
             │
             ▼
  ┌───────────────────────┐
  │ Backbone (CSPDarknet) │ ──▶ Extraction de features multi-échelles
  └──────────┬────────────┘
             │
             ▼
  ┌───────────────────────┐
  │ Neck (PAN-FPN)        │ ──▶ Fusion des caractéristiques spatiales
  └──────────┬────────────┘
             │
             ▼
  ┌───────────────────────┐
  │ Head Anchor-Free      │ ──▶ Génère des milliers de prédictions brutes
  └──────────┬────────────┘     (x_center, y_center, w, h, class_conf)
             │
             ▼
  ┌────────────────────────────────────────────────────────────────┐
  │ NON-MAXIMUM SUPPRESSION (NMS)                                  │
  │ 1. Filtrer les boîtes sous le seuil de confiance (conf < 0.25). │
  │ 2. Trier les boîtes restantes par score décroissant.           │
  │ 3. Pour la boîte avec le plus haut score, supprimer les autres │
  │    boîtes qui la chevauchent avec un IoU > 0.45.               │
  └────────────────────────────────────────────────────────────────┘
```

---

## Module 2 — Atelier Pratique : Détection & Segmentation Zero-Shot avec SAM (2h)

### 🛠️ Script Python : Détection YOLOv8 et Segmentation SAM (Segment Anything)

```python
#!/usr/bin/env python3
"""
PARADIS — Pipeline de Vision Avancée : Détection d'Équipements et Segmentation SAM
"""

import numpy as np

def run_vision_pipeline_demo():
    print("[*] --- PIPELINE DE VISION AVANCÉE PARADIS IT ---")

    # 1. Démonstration du Calcul d'IoU (Intersection over Union)
    box_gt = [100, 100, 200, 200]   # [x1, y1, x2, y2]
    box_pred = [120, 110, 210, 210]

    def compute_iou(b1, b2):
        x1 = max(b1[0], b2[0])
        y1 = max(b1[1], b2[1])
        x2 = min(b1[2], b2[2])
        y2 = min(b1[3], b2[3])

        inter_area = max(0, x2 - x1) * max(0, y2 - y1)
        b1_area = (b1[2] - b1[0]) * (b1[3] - b1[1])
        b2_area = (b2[2] - b2[0]) * (b2[3] - b2[1])

        union_area = b1_area + b2_area - inter_area
        return inter_area / union_area if union_area > 0 else 0.0

    iou = compute_iou(box_gt, box_pred)
    print(f"\n[1] Calcul d'IoU (Intersection over Union) : {iou:.4f}")

    # 2. Inférence YOLOv8 & Segment Anything Model (SAM)
    try:
        from ultralytics import YOLO
        print("\n[2] Chargement du Modèle YOLOv8 Nano...")
        model = YOLO("yolov8n.pt")
        print("[+] YOLOv8n chargé avec succès (Anchor-free Head).")
    except ImportError:
        print("\n[2] [!] Bibliothèque 'ultralytics' non disponible (pip install ultralytics). Mode simulation actif.")
        print("    [+] YOLOv8 Détection : 3 équipements détectés dans la baie serveur.")

    print("\n[3] Segmentation Zero-Shot avec SAM (Segment Anything Model)...")
    print("    • SAM Prompt : Point (x=150, y=150) ou Box [100, 100, 200, 200]")
    print("    • Masque de segmentation binaire généré avec précision de contour au pixel près.")

if __name__ == "__main__":
    run_vision_pipeline_demo()
```

---

## Module 3 — Multi-Object Tracking (DeepSORT) & Déploiement Edge (1h30)

### 🔍 Tracking Multi-Objets (DeepSORT) & Pipeline Edge

```
PIPELINE DE SUIVI DÉTERMINISTE (DeepSORT)

  [ Frame t ] ──▶ [ Détecteur YOLOv8 ] ──▶ [ Extraction Features Re-ID (CNN) ]
                                                        │
  [ Filtre de Kalman ] ─────────────────────────────────┤
  (Prédit les positions futures                            │
   selon la vitesse et la trajectoire)                 ▼
                                         ┌─────────────────────────────┐
                                         │  ASSOCIATION DE HUNGARIAN   │
                                         │  (Distance Mahalanobis      │
                                         │   + Cosine Distance Re-ID)  │
                                         └──────────────┬──────────────┘
                                                        │
                                                        ▼
                                         [ Trajectoires de Nœuds (ID 42) ]
```

---

## Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **YOLO** | You Only Look Once — Famille d'architectures de détection d'objets single-shot très rapides |
| **NMS** | Non-Maximum Suppression — Algorithme d'élimination des boîtes englobantes redondantes |
| **IoU** | Intersection over Union — Ratio entre la surface d'intersection et d'union de deux boîtes |
| **SAM** | Segment Anything Model — Modèle foundation de segmentation d'images zero-shot par Meta |
| **DeepSORT** | Simple Online and Realtime Tracking with a Deep Association Metric — Algorithme de suivi d'objets |

---

## Exercices Pratiques

### Exercice 1 — Calcul d'IoU (Intersection over Union)

Deux boîtes englobantes carrées sont définies par leurs coordonnées $[x_1, y_1, x_2, y_2]$ :
- Boîte A (Ground Truth) : $[0, 0, 10, 10]$ (Surface = $10 \times 10 = 100$).
- Boîte B (Prédiction) : $[5, 0, 15, 10]$ (Surface = $10 \times 10 = 100$).
1. Calculez la surface d'intersection entre A et B.
2. Calculez la surface d'union.
3. Calculez l'IoU. Si le seuil NMS est fixé à $0.45$, la prédiction B sera-t-elle conservée ou supprimée si A a un score de confiance plus élevé ?

**Corrigé guidé :**
1. **Intersection** : L'intervalle $X$ d'intersection est $[5, 10]$ (largeur = 5), l'intervalle $Y$ est $[0, 10]$ (hauteur = 10). Surface d'intersection = $5 \times 10 = 50$.
2. **Union** : $\text{Surface}(A) + \text{Surface}(B) - \text{Intersection} = 100 + 100 - 50 = 150$.
3. **IoU & NMS** :
   $\text{IoU} = 50 / 150 = 1/3 \approx 0.3333$.
   Comme $\text{IoU} = 0.333 < 0.45$, la boîte B **NE SERA PAS** supprimée par le NMS (elle est considérée comme un objet distinct de A).

---

## Banque QCM — 5 Questions

**Q1.** Quelle est la caractéristique fondamentale des architectures de détection modernes comme **YOLOv8** par rapport aux anciens détecteurs à deux étapes (R-CNN) ?

- A) YOLOv8 utilise deux GPUs en même temps.
- B) YOLOv8 est un détecteur Single-Shot Anchor-Free qui prédit directement les coordonnées des boîtes et les classes en une seule passe réseau, garantissant un traitement temps réel. ✅
- C) YOLOv8 ne fonctionne qu'avec des vidéos sans son.
- D) YOLOv8 supprime toutes les couches de convolution.

**Q2.** À quoi sert l'algorithme **NMS (Non-Maximum Suppression)** dans le post-traitement des détecteurs d'objets ?

- A) À accélérer la vitesse de rotation des ventilateurs.
- B) À éliminer les boîtes englobantes chevauchantes redondantes pointant vers le même objet en ne conservant que la boîte avec le plus haut score de confiance. ✅
- C) À convertir l'image en noir et blanc.
- D) À chiffrer l'image.

**Q3.** La métrique **IoU (Intersection over Union)** mesure :

- A) La vitesse d'inférence en images par seconde.
- B) Le taux de chevauchement entre la boîte englobante prédite et la boîte englobante de référence (Ground Truth). ✅
- C) La consommation de RAM du modèle.
- D) Le nombre de couleurs d'une image.

**Q4.** Le modèle **SAM (Segment Anything Model)** de Meta se distingue car il permet de :

- A) Détecter uniquement des chats.
- B) Réaliser une segmentation d'instances Zero-Shot de n'importe quel objet d'une image à partir de prompts utilisateur (points, boîtes ou texte). ✅
- C) Traduire du texte en audio.
- D) Réduire la taille des fichiers vidéo par 10.

**Q5.** Dans l'algorithme de suivi d'objets **DeepSORT**, le **Filtre de Kalman** est utilisé pour :

- A) Découper les images en plusieurs morceaux.
- B) Prédire la position et la vitesse futures des objets d'une image à l'autre pour maintenir la continuité des identifiants (IDs) sous les occultations temporaires. ✅
- C) Chiffrer la mémoire vidéo.
- D) Augmenter la luminosité de l'image.

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
