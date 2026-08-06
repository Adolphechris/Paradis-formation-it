# TOME P3 — Cloud Native, DevOps & Cyberdéfense — Jour 142 (6h) : Résilience Opérationnelle & Business Continuity Plan (BCP/DRP, RPO/RTO & Tests de Basculement)

> [!NOTE]
> **Objectif du jour :** Concevoir, documenter et valider les plans de continuité d'activité (BCP) et de reprise après sinistre (DRP) d'une institution financière critique : calcul des indicateurs RPO/RTO, architectures de réplication synchrone/asynchrone, procédures de basculement automatisé (Failover) et tests de validation Black Swan.
>
> **Compétences visées :** `POL-03` (A) — Business Continuity & DRP | `BIT-04` (A) — Architectures Haute Disponibilité Multi-Sites

---

## 1) Module — Fondamentaux du BCP/DRP : RPO & RTO (2h)

### 📖 Narration/Intuition

En mai 2026, un incendie détruit partiellement la salle serveur principale de la BCC à Kinshasa. Le Gouverneur convoque le DSI : "Combien de temps avant que nos systèmes de virements interbancaires soient de nouveau opérationnels ?"

La réponse à cette question se trouve dans le **BCP (Business Continuity Plan)** et le **DRP (Disaster Recovery Plan)** qui doivent être rédigés, testés et approuvés bien **avant** qu'une catastrophe ne survienne.

Deux indicateurs clés gouvernent ces plans :
- **RPO (Recovery Point Objective)** : Quelle est la quantité maximale de données que nous pouvons tolérer de perdre ? (Ex: 4 heures de transactions = RPO = 4h)
- **RTO (Recovery Time Objective)** : En combien de temps maximum les systèmes doivent-ils être restaurés et opérationnels ? (Ex: 2 heures = RTO = 2h)

### 🔍 Anatomie Technique

**Relation entre RPO, RTO et niveau d'investissement :**

```
┌───────────────────────────────────────────────────────────────────────────────┐
│ CONTINUITÉ D'ACTIVITÉ & RÉPLICATION (BCP/DRP)                                 │
├──────────────┬───────────────┬───────────────────────────────────────────────┤
│ Niveau BCP   │ RPO / RTO     │ Architecture de Résilience                    │
├──────────────┼───────────────┼───────────────────────────────────────────────┤
│ Active-Active│ RPO = 0       │ Deux sites actifs en simultané (Sync ↔ Sync)  │
│ (Tier IV)    │ RTO = 0 sec   │ Coût très élevé / Zéro interruption           │
├──────────────┼───────────────┼───────────────────────────────────────────────┤
│ Active-Passive│ RPO < 30 min │ Site passif chaud (Hot Standby synchronisé)   │
│ (Tier III)   │ RTO < 15 min  │ Basculement automatique (Failover)            │
├──────────────┼───────────────┼───────────────────────────────────────────────┤
│ Warm Standby │ RPO < 8h      │ Site tiède avec réplication asynchrone        │
│ (Tier II)    │ RTO < 4h      │ Activation manuelle / Coût modéré             │
├──────────────┼───────────────┼───────────────────────────────────────────────┤
│ Cold Standby │ RPO < 24h     │ Sauvegardes sur bandes / Site froid           │
│ (Tier I)     │ RTO < 24h     │ Restauration manuelle / Coût minimal          │
└──────────────┴───────────────┴───────────────────────────────────────────────┘
```

---

## 2) Module — Architectures de Réplication : Synchrone vs Asynchrone (2h)

### 📖 Narration/Intuition

Pour atteindre un **RPO de zéro** (aucune perte de donnée), chaque écriture en base de données doit être **confirmée simultanément** sur les deux sites de production avant de renvoyer une réponse de succès au client.

**Réplication Synchrone** : Kinshasa attend que Lubumbashi confirme l'écriture avant de valider la transaction. RPO = 0 mais latence réseau Inter-site impacte les performances (round-trip latency).

**Réplication Asynchrone** : Kinshasa valide immédiatement la transaction et envoie les mises à jour à Lubumbashi dans un second temps. RPO > 0 (risque de perte de quelques transactions) mais performances optimales.

### 🔍 Anatomie Technique

**Configuration de la réplication synchrone PostgreSQL + Patroni (`patroni.yml`) :**

```yaml
# Haute Disponibilité PostgreSQL avec Patroni (Failover automatique)
scope: bcc-banking-cluster
namespace: /db/
name: pg-kinshasa-primary

bootstrap:
  dcs:
    ttl: 30
    loop_wait: 10
    retry_timeout: 30
    maximum_lag_on_failover: 1048576  # 1 MB max lag avant d'accepter un failover

postgresql:
  listen: 0.0.0.0:5432
  data_dir: /data/patroni/
  authentication:
    replication:
      username: replicator
      password: BCC_Rep_Password_2024!
  parameters:
    synchronous_commit: "on"               # Réplication synchrone obligatoire
    synchronous_standby_names: "pg-lubumbashi-standby"  # Nom du nœud standby synchrone
    wal_level: replica
    max_wal_senders: 5
    wal_keep_size: 128
```

---

## 3) Module — Test de Basculement (Failover Drill) & Post-Mortem (2h)

### 📖 Narration/Intuition

Un DRP non testé est un DRP inutile. Les institutions financières régulées (Banque des Règlements Internationaux) exigent au minimum **deux tests de basculement complets par an**, documentés et soumis à l'autorité de régulation.

### 🔍 Anatomie Technique

**Script de test de basculement automatisé (`failover_drill.sh`) :**

```bash
#!/bin/bash
# failover_drill.sh — Test de basculement DRP / Exercice BCP Annuel

set -euo pipefail

DATE_DEBUT=$(date +"%Y-%m-%d %H:%M:%S")
echo "=== DEBUT DU TEST DE BASCULEMENT DRP BCC ===" >> /var/log/bcc_drp_test.log
echo "Date de début : $DATE_DEBUT" >> /var/log/bcc_drp_test.log

# 1. Simuler la défaillance du nœud primaire (Test Contrôlé)
echo "[1] Simulation de défaillance du primaire Kinshasa..."
sudo patronictl -c /etc/patroni/patroni.yml failover bcc-banking-cluster --master pg-kinshasa-primary --force
echo "[2] Failover initié. En attente d'élection du nouveau primaire..."

# 2. Mesurer le RTO effectif (Temps de Basculement)
sleep 5
LEADER=$(patronictl -c /etc/patroni/patroni.yml list | grep "Leader" | awk '{print $2}')
echo "[3] Nouveau nœud primaire élu : $LEADER"

DATE_FIN=$(date +"%Y-%m-%d %H:%M:%S")
echo "Date de fin : $DATE_FIN" >> /var/log/bcc_drp_test.log
echo "RTO Mesuré : Calculer manuellement l'écart $DATE_DEBUT -> $DATE_FIN" >> /var/log/bcc_drp_test.log
echo "✅ TEST DRP TERMINÉ. Rapport disponible dans /var/log/bcc_drp_test.log"
```

---

## 🏅 Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **BCP** | Business Continuity Plan — Plan de continuité d'activité |
| **DRP** | Disaster Recovery Plan — Plan de reprise après sinistre |
| **RPO** | Recovery Point Objective — Perte de données maximale tolérée |
| **RTO** | Recovery Time Objective — Durée maximale d'interruption tolérée |
| **Patroni** | Solution open-source de haute disponibilité et failover automatique pour PostgreSQL |

---

## 🏋️ Exercices & Corrigés

**Exercice 1 :** La BCC définit un **RPO = 0** et un **RTO < 15 minutes** pour son système RTGS. Quelle architecture de réplication est obligatoirement requise pour respecter ces exigences ?

**Corrigé :** Un **RPO = 0** exige une **réplication synchrone obligatoire** : aucune transaction ne peut être validée sur le site primaire sans confirmation simultanée de l'écriture sur le site secondaire, garantissant zéro perte de donnée. Un **RTO < 15 minutes** exige un **mode Active-Passive Hot Standby avec failover automatique** (ex: Patroni + etcd/consul) : le serveur secondaire est constamment synchronisé et prêt à prendre en charge les connexions applicatives en quelques secondes via une mise à jour automatique du DNS ou de l'IP virtuelle (VIP).

**Exercice 2 :** Quelle est la différence entre un **Hot Standby** et un **Warm Standby** dans une architecture DRP ?

**Corrigé :** Un **Hot Standby** est un site secondaire allumé, synchronisé en temps réel et prêt à basculer automatiquement en quelques secondes sans intervention humaine (RTO < 5 min). Un **Warm Standby** est un site secondaire partiellement préconfiguré, avec les serveurs allumés mais pas tous les services actifs, et une réplication asynchrone. L'activation d'un Warm Standby nécessite une intervention humaine et prend 30 minutes à 4 heures (RTO < 4h).

---

## ❓ Banque de Questions & Test du Jour

**Q1 :** Que mesure l'indicateur **RPO (Recovery Point Objective)** dans le contexte d'un plan de reprise après sinistre ?
- A) La quantité maximale de données acceptables à perdre en cas de sinistre
- B) Le prix des serveurs de remplacement
- C) La vitesse du réseau Wi-Fi
- D) Le nombre d'employés présents

**Réponse : A**

**Q2 :** Quel mode de réplication garantit un RPO = 0 en confirmant chaque écriture simultanément sur le site primaire et le site secondaire avant de valider la transaction ?
- A) Réplication synchrone
- B) Sauvegarde mensuelle sur bandes
- C) Copie manuelle par USB
- D) Email de confirmation

**Réponse : A**

**Q3 :** Quelle solution open-source assure la haute disponibilité et le failover automatique de clusters PostgreSQL ?
- A) Patroni
- B) MS Paint
- C) Notepad
- D) Word

**Réponse : A**

**Q4 :** Que désigne le terme **Hot Standby** dans une architecture de continuité ?
- A) Un site secondaire actif, synchronisé en temps réel, prêt à basculer automatiquement en quelques secondes sans intervention humaine
- B) Un serveur éteint
- C) Un disque dur portable
- D) Un câble de rechange

**Réponse : A**

**Q5 :** Quelle fréquence minimale de tests de basculement complets (Failover Drill) les régulateurs financiers exigent-ils généralement des infrastructures bancaires critiques ?
- A) Au moins deux tests documentés par an
- B) Une fois tous les 10 ans
- C) Jamais
- D) Uniquement en cas de panne réelle

**Réponse : A**

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
