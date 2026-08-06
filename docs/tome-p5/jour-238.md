# TOME P5 — Cybersécurité Avancée & Red/Blue Team — Jour 238 (6h) : Résilience & Plan de Reprise d'Activité Cyber (PCA/PRA — Disaster Recovery Planning DRP, Ransomware Recovery, Immutabilité des Backups & Chaos Security Engineering)

> [!NOTE]
> **Objectif du jour :** Maîtriser la conception et le déploiement de **plans de résilience et de reprise d'activité (PCA/PRA / Disaster Recovery)** face aux attaques cyber extrêmes (ex: attaque par Ransomware dévastatrice) : calcul des objectifs **RTO (Recovery Time Objective)** et **RPO (Recovery Point Objective)**, stratégie de **sauvegardes immuables (Air-Gapped / S3 Object Lock WORM)**, procédures de restauration en environnement "Air-Gapped Cleanroom", et tests de résilience automatisés avec le **Chaos Security Engineering (Chaos Mesh / LitmusChaos)**.
>
> **Compétences visées :** `SEC-04` (A) — Cyber Resilience & Ransomware Recovery DRP | `SEC-05` (A) — Immutabilité WORM S3 Backups & Chaos Security Engineering

---

## 1) Module — DRP, Metrics RTO/RPO & Architecture de Sauvegarde Immuable (2h)

### 📖 Narration/Intuition

En cas d'attaque par Ransomware destructeur ciblant la BCC (similaire à l'attaque NotPetya de 2017), les cybercriminels tentent systématiquement de **détruire les sauvegardes** et de chiffrer les bases de données MNBC avant de réclamer une rançon.

La résilience cyber de la BCC repose sur la capacité d'assurer la continuité des services financiers vitaux même après la destruction totale du datacenter principal.

### 🔍 Anatomie Technique

**Métriques Fondamentales du PRA (Disaster Recovery) :**

```
 ┌─────────────────────────────────────────────────────────────────────────────┐
 │                         METRIQUES RTO & RPO (BCC)                           │
 ├─────────────────────────────────────────────────────────────────────────────┤
 │ ÉVÉNEMENT PERTINENT : Attaque Ransomware (02h00)                            │
 │                                                                             │
 │ <───────────── RPO ─────────────>│<──────────────── RTO ─────────────────>  │
 │ (Pertes de données tolérées)     │ (Temps d'interruption toléré)            │
 │                                  │                                          │
 │ Last Backup (01h45)           CRASH (02h00)                      Restauration (02h30)
 ├─────────────────────────────────────────────────────────────────────────────┤
 │ Objectifs BCC MNBC :                                                        │
 │ - RPO (Recovery Point Objective) : < 15 minutes (Réplication synchrone)     │
 │ - RTO (Recovery Time Objective)  : < 30 minutes (Bascule automatique DR)  │
 └─────────────────────────────────────────────────────────────────────────────┘
```

**Architecture de Sauvegarde Immuable S3 Object Lock (WORM — Write Once Read Many) :**

```bash
# Activation de la politique S3 Object Lock (Mode Compliance - Impossible à supprimer même par root AWS !)
aws s3api create-bucket \
    --bucket bcc-mnbc-immutable-backups \
    --region af-south-1 \
    --object-lock-enabled-for-bucket

# Configuration de la rétention Compliance Mode (30 jours d'immuabilité absolue)
aws s3api put-object-lock-configuration \
    --bucket bcc-mnbc-immutable-backups \
    --object-lock-configuration '{
        "ObjectLockEnabled": "Enabled",
        "Rule": {
            "DefaultRetention": {
                "Mode": "COMPLIANCE",
                "Days": 30
            }
        }
    }'

echo "✅ Vault de sauvegarde immuable créé : Impossible d'effacer ou de chiffrer les backups pendant 30 jours !"
```

---

## 2) Module — Procédure de Restauration Ransomware (Cleanroom Recovery) (2h)

### 📖 Narration/Intuition

Lorsqu'un ransomware a infecté un environnement, **on ne restaure jamais directement les sauvegardes dans l'environnement de production compromis**. On utilise un environnement isolé dit **"Cleanroom"** pour vérifier et désinfecter les données avant la réinjection.

### 🛠️ Atelier Pratique

**Script d'Orchestration de Restauration Cleanroom (`cleanroom_recovery.py`) :**

```python
import subprocess, time

def isolate_cleanroom_environment():
    """1. Provisionner un réseau entièrement isolé (VLAN/VPC étanche)."""
    print("🔒 Isolement du VPC Cleanroom BCC (Aucun accès Internet/Prod)...")

def restore_immutable_snapshot(snapshot_id: str):
    """2. Récupérer le snapshot immuable depuis S3 WORM."""
    print(f"📥 Téléchargement du snapshot immuable {snapshot_id}...")

def run_malware_scan():
    """3. Scanner le snapshot avec des moteurs Antivirus/YARA dans la Cleanroom."""
    print("🔍 Analyse YARA & EDR du snapshot restauré...")
    # Simuler le scan YARA
    res = subprocess.run(["yara", "-r", "/rules/ransomware.yar", "/mnt/cleanroom"], capture_output=True)
    if b"MATCH" in res.stdout:
        raise ValueError("🚨 MALWARE DÉTECTÉ DANS LE SNAPSHOT — Restauration refusée !")
    print("✅ Snapshot propre — Aucun ransomware détecté.")

def promote_to_production():
    """4. Basculer le trafic vers le nouveau cluster restauré."""
    print("🚀 Bascule DNS / ZTNA vers le cluster restauré avec succès !")

if __name__ == "__main__":
    isolate_cleanroom_environment()
    restore_immutable_snapshot("snap-20260806-0145")
    run_malware_scan()
    promote_to_production()
```

---

## 3) Module — Chaos Security Engineering avec Chaos Mesh (2h)

### 🛠️ Atelier Pratique

**Test de Résilience par Injection de Panne Kubernetes (`chaos_experiment.yaml`) :**

```yaml
# Chaos Mesh Experiment — Simulation de la perte subite du Pod Settlement MNBC
apiVersion: chaos-mesh.org/v1alpha1
kind: PodChaos
metadata:
  name: simulate-node-failure
  namespace: mnbc-production
spec:
  action: pod-kill
  mode: one
  selector:
    namespaces:
      - mnbc-production
    labelSelectors:
      app: bcc-settlement-service
  scheduler:
    cron: '@every 2h'
```

---

## 🏅 Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **RTO** | Recovery Time Objective — Durée maximale acceptable d'interruption du service |
| **RPO** | Recovery Point Objective — Quantité maximale acceptable de perte de données (ex primée en temps) |
| **DRP** | Disaster Recovery Plan — Plan de Reprise d'Activité informatique (PRA) |
| **WORM** | Write Once, Read Many — Rétention immuable empêchant toute modification ou suppression |
| **Cleanroom** | Environnement isolé d'analyse et de désinfection avant restauration des backups |

---

## 🏋️ Exercices & Corrigés

**Exercice 1 :** Quelle est la différence essentielle entre l’Objectif de Temps de Restauration (**RTO**) et l’Objectif de Point de Restauration (**RPO**) ?

**Corrigé :**
- **RPO (Recovery Point Objective)** : Définit la quantité maximale de données que l'organisation accepte de perdre lors d'un sinistre, mesurée en **durée écoulée depuis la dernière sauvegarde**. (Exemple : Si le RPO de la BCC est de 15 minutes et qu'une panne survient à 14h00, la sauvegarde doit dater au maximum de 13h45).
- **RTO (Recovery Time Objective)** : Définit la durée maximale admissible pendant laquelle le système peut rester indisponible avant sa restauration complète. (Exemple : Si le RTO est de 30 minutes, le système doit être de nouveau opérationnel au plus tard à 14h30).

**Exercice 2 :** Pourquoi le mode **S3 Object Lock COMPLIANCE** offre-t-il une protection absolue contre les ransomwares, même en cas de vol des clés AWS Root ?

**Corrigé :** En mode **COMPLIANCE**, Amazon S3 applique un verrouillage cryptographique strict qui **interdit toute suppression ou modification** d'un objet pendant la période de rétention définie. Aucune politique IAM, aucune commande CLI, et **pas même l'utilisateur Root du compte AWS** ni le support AWS ne possède les privilèges nécessaires pour contourner ce verrouillage avant la fin de la période de rétention. Ainsi, si un ransomware prend le contrôle des credentials AWS du compte, il ne pourra ni chiffrer ni effacer les backups sous Object Lock Compliance.

---

## ❓ Banque de Questions & Test du Jour

**Q1 :** Quelle métrique de résilience DRP définit la durée maximale tolérée d'interruption d'un service critique après un incident ?
- A) RTO (Recovery Time Objective)
- B) RPO (Recovery Point Objective)
- C) MTBF
- D) SLA

**Réponse : A**

**Q2 :** Quel mode de rétention S3 Object Lock interdit la suppression de fichiers sauvegardés pendant une période donnée, sans aucune possibilité d'annulation même par le compte Root AWS ?
- A) COMPLIANCE mode
- B) GOVERNANCE mode
- C) STANDARD mode
- D) READ-ONLY mode

**Réponse : A**

**Q3 :** Pourquoi effectue-t-on la restauration de sauvegardes après une attaque par ransomware dans un environnement isolé appelé **Cleanroom** ?
- A) Pour analyser et désinfecter les données sans risque de re-contaminer le réseau de production
- B) Pour accélérer le débit réseau
- C) Pour économiser des coûts Cloud
- D) Pour compresser la base de données

**Réponse : A**

**Q4 :** Quelle pratique consiste à injecter volontairement des pannes et des attaques dans un cluster (ex: via Chaos Mesh) pour tester la résilience réelle des systèmes ?
- A) Chaos Security Engineering
- B) Pentesting classique
- C) Load Testing
- D) Unit Testing

**Réponse : A**

**Q5 :** Si la BCC effectue une réplication de base de données en temps réel toutes les 5 minutes, quel est son **RPO** théorique ?
- A) 5 minutes
- B) 30 minutes
- C) 1 heure
- D) 24 heures

**Réponse : A**

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
