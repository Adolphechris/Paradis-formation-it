# TOME P2 — Réseaux & Télécoms — Jour 88 (6h) : Continuité d'Activité (PCA/PRA) & Sauvegardes Immuables (Veeam & Restic)

> [!NOTE]
> **Objectif du jour :** Concevoir et mettre en œuvre une stratégie robuste de Continuité d'Activité (PCA) et de Reprise d'Activité (PRA) pour les systèmes d'information bancaires de la BCC : calcul des métriques RTO et RPO, architecture de réplication multi-sites, sauvegardes immuables (WORM - Write Once Read Many) contre les ransomwares avec Restic et Veeam.
>
> **Compétences visées :** `POL-02` (A) — Plan de Continuité & Reprise d'Activité | `SEC-03` (A) — Sauvegardes & Résilience Données

---

## 1) Module — Fondamentaux PCA/PRA, RTO & RPO (2h)

### 📖 Narration/Intuition

En cas d'inondation du Datacenter principal de Kinshasa, d'attaque par ransomware ou de coupure de fibre majeure, comment garantir que la Banque Centrale du Congo continue de fonctionner ?

- Le **PCA (Plan de Continuité d'Activité)** regroupe l'ensemble des mesures (humaines, techniques, organisationnelles) permettant de maintenir le service bancaire sans interruption, ou avec une dégradation minimale acceptée.
- Le **PRA (Plan de Reprise d'Activité)** regroupe les procédures techniques permettant de reconstruire et restaurer les systèmes d'information sur un site de secours après un sinistre majeur.

### 🔍 Anatomie Technique

**Définition des Métriques RTO et RPO :**

```
Moments clés lors d'un sinistre :

  Dernière Sauvegarde                  Sinistre                Reprise du Service
        │                                  │                           │
        │◄─────────── RPO ────────────────►│◄─────────── RTO ─────────►│
        │      (Perte de données)          │    (Temps d'interruption) │
```

- **RPO (Recovery Point Objective - Durée Maximale de Perte de Données Acceptable)** : Quantité maximale de données que l'organisation peut se permettre de perdre.
  *(Exemple BCC : Pour le système de paiement RTGS, RPO = 0 seconde -> Réplication synchrone obligatoire. Pour de la bureautique, RPO = 24 heures).*
- **RTO (Recovery Time Objective - Durée Maximale d'Interruption Admissible)** : Temps maximal écoulé entre le sinistre et la remise en service opérationnelle des applications.
  *(Exemple BCC : RTO RTGS = 15 minutes ; RTO intranet = 4 heures).*

**Niveaux de Sites de Secours (Disaster Recovery Sites) :**

| Type de Site | Caractéristiques | RTO Typique | RPO Typique | Coût relatif |
|:---:|:---|:---:|:---:|:---:|
| **Hot Site (Site Chaud)** | Serveurs identiques actifs, réplication des données en temps réel. | < 15 min | ≈ 0 sec | $$$$$ |
| **Warm Site (Site Tiède)** | Infrastructures prêtes, données répliquées régulièrement (ex: hourly). | 1h à 4h | < 1h | $$$ |
| **Cold Site (Site Froid)** | Bâtiment avec électricité/réseau, sans serveurs configurés. | > 24h | Selon backups | $ |

---

## 2) Module — Sauvegardes Immuables avec Restic & Stockage S3 Object Lock (2h)

### 📖 Narration/Intuition

Les ransomwares modernes ne se contentent plus de chiffrer les serveurs de production : ils cherchent d'abord à détruire ou chiffrer les sauvegardes connectées au réseau. Si les sauvegardes sont détruites, l'entreprise ne peut plus restaurer ses données.

La solution consiste à utiliser des **Sauvegardes Immuables (WORM - Write Once, Read Many)** : les fichiers de sauvegarde écrits ne peuvent être ni modifiés ni supprimés par quiconque (pas même par l'administrateur root ou un attaquant compromis) pendant une durée de rétention stricte programmée au niveau matériel/chiffrement.

### 🔍 Anatomie Technique

**Architecture de Sauvegarde Immuable avec Restic et MinIO/S3 Object Lock :**

```bash
# Restic est un outil de sauvegarde moderne, rapide, chiffré et dédupliqué.

# ─── 1. Initialisation du dépôt Restic sur un Bucket S3 avec Object Lock ───────
export RESTIC_REPOSITORY="s3:https://s3-backup.bcc.cd/bcc-immutable-backups"
export RESTIC_PASSWORD="Cle_De_Chiffrement_Restoration_Ultra_Secrete_2024!"
export AWS_ACCESS_KEY_ID="restic-backup-bot"
export AWS_SECRET_ACCESS_KEY="Cle_Bot_S3_Secrete"

# Initialiser le dépôt chiffré
restic init

# ─── 2. Exécution d'une Sauvegarde Chiffrée et Immuable ───────────────────────
# Sauvegarder les répertoires critiques de la base de données et de la configuration
restic backup /var/vmail /etc /opt/bcc-app/data \
  --tag "production" \
  --tag "daily" \
  --exclude="/var/vmail/spool"

# ─── 3. Gestion de la Rétention et Vérification d'Intégrité ───────────────────
# Appliquer une politique de rétention (garder 7 journalières, 4 hebdomadaires, 12 mensuelles)
restic forget \
  --keep-daily 7 \
  --keep-weekly 4 \
  --keep-monthly 12 \
  --prune

# Vérifier l'intégrité globale de tous les blocs de données stockés
restic check --read-data-subset=10%
```

---

## 3) Module — Plan de Reprise d'Activité (PRA) — Procédure de Basculement (2h)

### 📖 Narration/Intuition

Un plan PRA qui n'a jamais été testé est un plan qui échouera le jour du sinistre. La réglementation bancaire impose des **exercices de basculement à blanc** au moins deux fois par an pour s'assurer que les procédures de basculement de passerelle et de restauration de BDD fonctionnent réellement.

### 🔍 Anatomie Technique

**Script d'automatisation de Basculement PRA (Failover Script) :**

```python
#!/usr/bin/env python3
"""
pra_failover.py — Script d'activation du Site de Secours (PRA) BCC
Bascule le routage DNS et active les bases de données secondaires.
"""
import requests
import subprocess
import time
import sys

DNS_PROVIDER_API = "https://api.dns.bcc.cd/v1"
API_KEY = "DNS_API_KEY_PRA_SECRET"

SITE_PRINCIPAL_IP = "196.200.10.50"
SITE_SECOURS_IP = "196.200.20.50"

def verifier_sante_site_principal():
    """Teste si le site principal répond sur l'endpoint de santé."""
    try:
        r = requests.get(f"https://{SITE_PRINCIPAL_IP}/health", timeout=5)
        return r.status_code == 200
    except requests.RequestException:
        return False

def basculer_dns(nouveau_target_ip):
    """Met à jour les enregistrements A DNS vers l'IP du site de secours."""
    print(f"[+] Basculement DNS vers l'IP de Secours : {nouveau_target_ip}...")
    headers = {"Authorization": f"Bearer {API_KEY}"}
    payload = {
        "domain": "bcc.cd",
        "records": [
            {"name": "banque", "type": "A", "content": nouveau_target_ip, "ttl": 60},
            {"name": "api", "type": "A", "content": nouveau_target_ip, "ttl": 60}
        ]
    }
    r = requests.put(f"{DNS_PROVIDER_API}/records", json=payload, headers=headers)
    if r.status_code == 200:
        print("✅ Enregistrements DNS mis à jour avec succès (TTL 60s).")
    else:
        print(f"❌ Échec de mise à jour DNS : {r.text}")
        sys.exit(1)

def promouvoir_base_de_donnees_secondaire():
    """Promut la base PostgreSQL répliquée du site de secours en Master."""
    print("[+] Promouvoir la base PostgreSQL du Site de Secours en lecture/écriture...")
    cmd = "ssh admin@10.0.20.200 'sudo -u postgres pg_ctl promote -D /var/lib/postgresql/16/main'"
    res = subprocess.run(cmd, shell=True, capture_output=True, text=True)
    if res.returncode == 0:
        print("✅ Base de données du Site de Secours promue avec succès.")
    else:
        print(f"❌ Erreur lors de la promotion BDD : {res.stderr}")
        sys.exit(1)

def executer_plan_pra():
    print("==================================================")
    print("   ACTIVATION DU PLAN DE REPRISE D'ACTIVITÉ (PRA)  ")
    print("==================================================")

    if verifier_sante_site_principal():
        print("⚠️ Le site principal répond toujours. Annulation de l'activation automatique.")
        sys.exit(0)

    print("🚨 ALERTE : Site Principal Inaccessible ! Début de la procédure de secours...")

    # 1. Promouvoir les données
    promouvoir_base_de_donnees_secondaire()

    # 2. Re-router le trafic DNS
    basculer_dns(SITE_SECOURS_IP)

    print("\n✅ PLAN PRA EXÉCUTÉ : Le service bancaire tourne sur le Site de Secours.")

if __name__ == "__main__":
    executer_plan_pra()
```

---

## 🏅 Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **PCA** | Plan de Continuité d'Activité — Maintien des activités métier sans interruption |
| **PRA** | Plan de Reprise d'Activité — Reconstruction et restauration après un sinistre majeur |
| **RTO** | Recovery Time Objective — Durée maximale d'interruption admissible |
| **RPO** | Recovery Point Objective — Durée maximale de perte de données acceptable |
| **WORM** | Write Once, Read Many — Sauvegarde immuable incassable |

---

## 🏋️ Exercices & Corrigés

**Exercice 1 :** Quelle est la différence entre le RTO et le RPO pour un système bancaire de paiement en ligne ?

**Corrigé :** Le **RPO** mesure la quantité de données financières perdues en cas de panne (ex: si RPO = 0, aucune transaction validée ne doit être perdue). Le **RTO** mesure la durée pendant laquelle le service est indisponible avant d'être restauré (ex: si RTO = 15 minutes, le système doit être de nouveau opérationnel 15 minutes au maximum après le début du sinistre).

**Exercice 2 :** Pourquoi la technique de sauvegarde immuable (Immutability / WORM) est-elle la meilleure protection contre les ransomwares modernes ?

**Corrigé :** Les ransomwares modernes cherchent à détruire les sauvegardes (locales et réseau) pour empêcher la restauration et forcer le paiement de la rançon. Avec l'immuabilité (WORM), les fichiers de sauvegarde stockés sont verrouillés par un mécanisme cryptographique et matériel pendant une période définie (ex: 30 jours). Même si un attaquant prend le contrôle total du serveur avec les droits d'administration root, il lui est physiquement impossible de modifier, chiffrer ou supprimer les sauvegardes existantes.

---

## ❓ Banque de Questions & Test du Jour

**Q1 :** Quelle métrique définit le temps maximal acceptable d'interruption d'un service informatique après un sinistre ?
- A) RPO
- B) RTO
- C) MTBF
- D) SLA

**Réponse : B**

**Q2 :** Quel type de site de secours (Disaster Recovery Site) offre la réplication des données en temps réel et permet une reprise de service en moins de 15 minutes ?
- A) Cold Site (Site Froid)
- B) Hot Site (Site Chaud)
- C) Offline Tape Vault
- D) Dark Fiber Site

**Réponse : B**

**Q3 :** Que signifie le principe de sauvegarde WORM ?
- A) Write Only Read Memory
- B) Write Once, Read Many (Immuabilité des données)
- C) Windows Operating Recovery Mode
- D) Web Online Resource Management

**Réponse : B**

**Q4 :** Si un système bancaire exige un RPO égal à zéro (0), quelle technique de sauvegarde/réplication est OBLIGATOIRE ?
- A) Sauvegarde hebdomadaire sur bande
- B) Réplication synchrone en temps réel des données sur deux datacenters distants
- C) Copie manuelle sur clé USB une fois par jour
- D) Exportation mensuelle par e-mail

**Réponse : B**

**Q5 :** Quel outil moderne Open Source permet d'effectuer des sauvegardes chiffrées, dédupliquées et d'exporter vers des stockages S3 avec gestion d'immuabilité ?
- A) Restic
- B) Ping
- C) Telnet
- D) Nginx

**Réponse : A**

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
