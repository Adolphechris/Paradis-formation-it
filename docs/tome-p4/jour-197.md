# TOME P4 — Cloud, DevOps & SecOps — Jour 197 (6h) : SecOps & Cloud Security Avancé (CSPM, CWPP, IAM Zero Trust, Container Security & Runtime Protection avec Falco)

> [!NOTE]
> **Objectif du jour :** Maîtriser les technologies de sécurité cloud avancées pour protéger les infrastructures modernes : **CSPM (Cloud Security Posture Management)** pour la détection de dérives de configuration, **CWPP (Cloud Workload Protection Platform)** pour la protection des charges de travail, et la détection d'anomalies en temps réel au niveau du noyau Linux avec **Falco (eBPF)**.
>
> **Compétences visées :** `SEC-05` (A) — Cloud Security CSPM & CWPP | `SEC-06` (A) — Runtime Protection eBPF & Falco

---

## 1) Module — CSPM & CWPP : Posture de Sécurité Cloud (2h)

### 📖 Narration/Intuition

Dans un environnement Cloud complexe comptant des centaines de buckets S3, des dizaines de clusters EKS et des milliers de rôles IAM, comment le CISO de la BCC peut-il s'assurer qu'aucun bucket S3 contenant des données financières n'est devenu publiquement accessible par erreur suite à une modification manuelle ?

- **CSPM (Cloud Security Posture Management)** : Analyse en continu la configuration des ressources cloud (AWS/GCP) par rapport aux référentiels de sécurité (CIS Benchmarks, PCI-DSS) et alerte immédiatement en cas de dérive de sécurité.
- **CWPP (Cloud Workload Protection Platform)** : Protège les charges de travail en cours d'exécution (VMs, conteneurs, fonctions Serverless) contre les attaques au niveau système et applicatif.

### 🔍 Anatomie Technique

**Architecture CSPM vs CWPP dans l'Écosystème BCC :**

```
┌─────────────────────────────────────────────────────────────┐
│                 CSPM (Prowler / AWS Security Hub)           │
│  - Analyse les APIs Cloud et les configurations IaC         │
│  - Détecte : Bucket S3 public, SG avec 0.0.0.0/0 sur SSH,  │
│    MFA non activé, KMS sans rotation de clé                │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                 CWPP (CrowdStrike Falcon / Falco)           │
│  - Inspecte les workloads en exécution (VMs, K8s, Containers)│
│  - Détecte : Execution de shell dans un conteneur Prod,     │
│    écriture dans /etc/passwd, scan nmap depuis un Pod       │
└─────────────────────────────────────────────────────────────┘
```

**Exemple de règle CSPM personnalisée avec Prowler (`cspm_rule.json`) :**

```json
{
  "CheckID": "bcc_s3_bucket_public_access_prohibited",
  "CheckTitle": "Vérifier qu'aucun bucket S3 BCC n'a d'accès public activé",
  "Severity": "CRITICAL",
  "Compliance": ["PCI-DSS-v4.0", "ISO-27001"],
  "Remediation": {
    "Code": "aws s3api put-public-access-block --bucket <bucket-name> --public-access-block-configuration BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true"
  }
}
```

---

## 2) Module — Runtime Protection Kubernetes avec Falco & eBPF (2h)

### 📖 Narration/Intuition

Les scanners statiques (SAST, Trivy) vérifient le code et l'image Docker **avant** le déploiement. Mais si un attaquant découvre une vulnérabilité Zero-Day dans l'API BCC et parvient à exécuter une commande système non autorisée dans un Pod en cours d'exécution, comment le détecter instantanément ?

**Falco** (projet CNCF) utilise la technologie **eBPF (Extended Berkeley Packet Filter)** du noyau Linux pour intercepter tous les appels système (`syscalls`) émis par les conteneurs en temps réel, sans impacter les performances de l'application.

### 🔍 Anatomie Technique

**Détection d'Anomalies au Niveau Noyau avec Falco :**

```
 CONTENEUR BCC API (Pod K8s)
         │
         │ Exec /bin/bash  OU  Read /etc/shadow
         ▼
 NOYAU LINUX (System Calls: execve, open, connect)
         │
         ▼ (Interception transparente via eBPF)
 ┌────────────────────────────────────────────────────────┐
 │                      FALCO ENGINE                      │
 │  Compare les syscalls avec les règles de sécurité       │
 └──────────────────────────┬─────────────────────────────┘
                            │
                            ▼ Match Règle
 ┌────────────────────────────────────────────────────────┐
 │                      ALERTE SOC                        │
 │  "🚨 Shell Spawned in Production Container bcc-api!"   │
 └────────────────────────────────────────────────────────┘
```

**Règles Falco personnalisées pour la BCC (`falco_rules.yaml`) :**

```yaml
# Règle 1 : Détection d'ouverture d'un terminal interactif dans un Pod de Prod
- rule: Shell in Production Pod
  desc: Détecte le lancement d'un shell (bash/sh) dans un conteneur en production
  condition: >
    container.on_host = true and
    k8s.ns.name = "bcc-production" and
    evt.type = execve and
    proc.name in (bash, sh, zsh, ksh)
  output: >
    🚨 FALCO ALERT: Shell exécuté dans un conteneur de Prod!
    (user=%user.name pod=%k8s.pod.name container=%container.name image=%container.image.repository cmd=%proc.cmdline)
  priority: CRITICAL
  tags: [container, k8s, bcc_security]

# Règle 2 : Tentative de modification de fichiers système sensibles
- rule: Sensitive File Modification
  desc: Détecte l'écriture dans des répertoires système sensibles du conteneur
  condition: >
    open_write and
    fd.filename startswith /etc/ or
    fd.filename startswith /boot/
  output: >
    ⚠️ FALCO ALERT: Tentative d'écriture dans un fichier système sensible!
    (file=%fd.filename proc=%proc.name pod=%k8s.pod.name)
  priority: WARNING
  tags: [filesystem, security]
```

---

## 3) Module — Laboratoire Pratique : Réponse Automatisée avec FalcoSidekick (2h)

### 📖 Narration/Intuition

Détecter une intrusion avec Falco en 1 milliseconde est remarquable. Bloquer l'attaque et isoler le Pod compromis automatiquement en 2 secondes grâce à **FalcoSidekick** et un Webhook de réponse automatisée est la marque d'un SOC moderne.

### 🛠️ Atelier Pratique

**Webhook de Réponse Automatisée à une Alerte Falco (`falco_response_handler.py`) :**

```python
from fastapi import FastAPI, Request
from kubernetes import client, config
import logging

app = FastAPI()
logging.basicConfig(level=logging.INFO)

# Charger la configuration Kubernetes in-cluster
config.load_incluster_config()
k8s_core_api = client.CoreV1Api()

@app.post("/falco-webhook")
async function handle_falco_alert(request: Request):
    payload = await request.json()
    rule = payload.get("rule")
    priority = payload.get("priority")
    output_fields = payload.get("output_fields", {})

    pod_name = output_fields.get("k8s.pod.name")
    namespace = output_fields.get("k8s.ns.name")

    logging.info(f"Alerte Falco reçue: Règle '{rule}' (Priorité: {priority}) sur Pod '{pod_name}'")

    # Si l'alerte est CRITICAL (ex: Shell dans un conteneur de Prod)
    if priority == "CRITICAL" and pod_name and namespace:
        logging.warning(f"🔒 CONTAINMENT AUTOMATIQUE: Isolement du Pod '{pod_name}'...")
        
        try:
            # 1. Ajouter un label de quarantaine pour isoler le Pod via la NetworkPolicy
            body = {"metadata": {"labels": {"quarantine": "true"}}}
            k8s_core_api.patch_namespaced_pod(name=pod_name, namespace=namespace, body=body)
            
            # 2. Supprimer le Pod compromis pour forcer K8s à en recréer un sain
            k8s_core_api.delete_namespaced_pod(name=pod_name, namespace=namespace)
            
            logging.info(f"✅ Pod '{pod_name}' supprimé avec succès. Nouveau Pod en cours de démarrage.")
            return {"status": "CONTAINED", "action": "POD_DELETED"}
            
        except Exception as e:
            logging.error(f"❌ Échec du containment: {str(e)}")
            return {"status": "ERROR", "message": str(e)}

    return {"status": "ACKNOWLEDGED"}
```

---

## 🏅 Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **CSPM** | Cloud Security Posture Management — Analyse continue de la conformité des configurations Cloud |
| **CWPP** | Cloud Workload Protection Platform — Protection des charges de travail en exécution |
| **eBPF** | Extended Berkeley Packet Filter — Technologie noyau Linux d'exécution sécurisée de programmes sandboxés |
| **Syscall** | System Call — Appel système d'un programme vers le noyau Linux (`execve`, `open`, `socket`) |
| **CNCF** | Cloud Native Computing Foundation — Fondation gérant Kubernetes, Prometheus, Falco |

---

## 🏋️ Exercices & Corrigés

**Exercice 1 :** Quelle est la différence fondamentale entre une approche de sécurité par **Analyse Statique d'Image (Trivy)** et une approche de **Runtime Protection (Falco/eBPF)** ?

**Corrigé :** L'**Analyse Statique d'Image** (ex: Trivy) intervient de manière **préventive** avant le déploiement. Elle scanne le système de fichiers de l'image Docker pour y détecter des vulnérabilités connues (CVEs) dans les paquets installés. Cependant, elle ne peut pas détecter les vulnérabilités Zero-Day inconnues ni les comportements malveillants réels. La **Runtime Protection** (ex: Falco avec eBPF) intervient de manière **détective en temps réel** pendant que l'application s'exécute en production. Elle surveille les actions réelles effectuées par le processus (appels système au noyau Linux) et alerte immédiatement si un conteneur effectue une action anormale (ex: lancer un shell `/bin/bash`, lire `/etc/shadow`), même si l'image Docker avait passé avec succès tous les scans statiques.

**Exercice 2 :** Pourquoi la technologie **eBPF** est-elle révolutionnaire pour la sécurité et l'observabilité des clusters Kubernetes par rapport aux anciens modules noyau Linux (LKM) ?

**Corrigé :** Les anciens **Modules Noyau Linux (LKM)** nécessitaient la compilation et le chargement de code C directement dans l'espace noyau. En cas de bug ou de fuite mémoire dans le module, c'était tout le serveur hôte qui subissait un Kernel Panic et plantait. **eBPF** permet d'exécuter du code personnalisé au cœur du noyau Linux de manière **ultra-sécurisée et hautement performante** : le code eBPF est vérifié par un *Verifier* strict du noyau avant exécution (garantissant qu'il ne peut ni boucler indéfiniment, ni corrompre la mémoire du noyau), et s'exécute dans une sandbox à vitesse native. eBPF offre une visibilité totale à 360° sur tout ce qui se passe sur le serveur (réseau, processus, système de fichiers) sans aucun impact mesurable sur les performances applicatives.

---

## ❓ Banque de Questions & Test du Jour

**Q1 :** Quel type d'outil de sécurité cloud s'assure en continu que les configurations des services Cloud (AWS/GCP) respectent les référentiels de sécurité (ex: pas de bucket S3 public) ?
- A) CSPM (Cloud Security Posture Management)
- B) CWPP
- C) Antivirus local
- D) WAF

**Réponse : A**

**Q2 :** Quelle technologie du noyau Linux est utilisée par **Falco** pour intercepter les appels système (`syscalls`) émis par les conteneurs avec une latence quasi-nulle et sans modifier le noyau ?
- A) eBPF (Extended Berkeley Packet Filter)
- B) Docker Daemon API
- C) Chroot Jail
- D) IPTables uniquement

**Réponse : A**

**Q3 :** Si un attaquant parvient à exécuter la commande `/bin/bash` dans un Pod Kubernetes de production, quelle règle Falco doit être déclenchée ?
- A) Shell in Production Pod
- B) HTTP 200 OK Rule
- C) DNS Lookup Rule
- D) Disk Space Alert

**Réponse : A**

**Q4 :** Quelle est la fonction du composant **FalcoSidekick** dans un écosystème de sécurité Kubernetes ?
- A) Router les alertes émises par Falco vers des canaux de notification (Slack, PagerDuty) ou des Webhooks de réponse automatisée (soar/lambdas)
- B) Compiler le noyau Linux
- C) Scanner les fichiers de logs Apache
- D) Redémarrer les serveurs Kubernetes

**Réponse : A**

**Q5 :** Dans le modèle de responsabilité partagée en sécurité Cloud, de quelle catégorie relève la protection du système de fichiers et des processus des conteneurs en cours d'exécution ?
- A) CWPP (Cloud Workload Protection Platform)
- B) Sécurité physique du datacenter AWS
- C) DNS Management
- D) CDN Cache Management

**Réponse : A**

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
