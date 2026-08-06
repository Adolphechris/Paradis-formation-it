# TOME P3 — Cloud Native, DevOps & Cyberdéfense — Jour 115 (6h) : Sécurité des Réseaux Software-Defined (SDN), eBPF CNI & Cilium (Cilium CNI, Hubble & Network Policies L7)

> [!NOTE]
> **Objectif du jour :** Déployer et maîtriser l'interface réseau conteneurisée (CNI - Container Network Interface) de nouvelle génération basée sur eBPF **Cilium** dans Kubernetes : remplacement d'kube-proxy par eBPF, observabilité réseau L3 à L7 avec Hubble, et règles de filtrage de sécurité applicatives (CiliumNetworkPolicies).
>
> **Compétences visées :** `BIT-04` (A) — Network CNI & eBPF Cilium | `SEC-04` (A) — Micro-segmentation Réseau L7 (Cilium)

---

## 1) Module — Pourquoi Cilium & eBPF CNI ? (2h)

### 📖 Narration/Intuition

Dans les clusters Kubernetes traditionnels, le réseau entre Pods et la répartition de charge des Services s'appuient sur **kube-proxy**, qui génère des milliers de règles **iptables**. À mesure que le cluster grandit (plus de 5 000 Pods), la traversée séquentielle de la table iptables s'effondre et consomme une quantité colossale de ressources CPU.

**Cilium** remplace intégralement kube-proxy par des programmes **eBPF**. Les paquets réseau sont routés directement dans le noyau via des tables de hachage eBPF en temps constant ($O(1)$), offrant des performances ultra-rapides et une visibilité complète sur le trafic sans surcoût.

### 🔍 Anatomie Technique

**Comparaison de Performance kube-proxy (iptables) vs Cilium (eBPF CNI) :**

```
KUBE-PROXY (IPTABLES TRADITIONNEL - LENT O(N)) :
Paquet Réseau ───> Règle 1 ───> Règle 2 ───> ... ───> Règle 5000 ───> Destination

CILIUM EBPF CNI (ULTRA FAST O(1)) :
Paquet Réseau ───> eBPF Map Lookup (Table de Hachage Kernel) ───> Destination Instantanée
```

---

## 2) Module — Micro-segmentation Niveau 7 avec CiliumNetworkPolicies (2h)

### 📖 Narration/Intuition

Les `NetworkPolicies` Kubernetes standard s'arrêtent aux couches 3 et 4 (IPs et Ports TCP/UDP). Elles ne permettent pas de dire *"Le pod A peut faire des requêtes `GET /api/v1/public` mais il lui est interdit de faire un `POST /api/v1/admin`"*.

**Cilium** pousse le filtrage réseau jusqu'à la **Couche 7 (Application - HTTP/gRPC/Kafka)** grâce au moteur eBPF.

### 🔍 Anatomie Technique

**Manifeste CiliumNetworkPolicy L7 (`cilium-l7-policy.yaml`) :**

```yaml
apiVersion: "cilium.io/v2"
kind: CiliumNetworkPolicy
metadata:
  name: restrict-virement-api-l7
  namespace: bcc-production
spec:
  endpointSelector:
    matchLabels:
      app: bcc-virement-api

  # Autoriser uniquement les connexions HTTP entrantes venant du Front-end
  ingress:
  - fromEndpoints:
    - matchLabels:
        app: bcc-frontend
    toPorts:
    - ports:
      - port: "8080"
        protocol: TCP
      # Filtrage fin de Niveau 7 (HTTP Rules)
      rules:
        http:
        - method: "GET"
          path: "/api/v1/public/.*"
        - method: "POST"
          path: "/api/v1/virement"
        # TOUTES LES AUTRES MÉTHODES ET CHEMINS SONT BLOQUÉS (ex: DELETE, /admin)
```

---

## 3) Module — Observabilité Réseau Temps Réel avec Hubble (2h)

### 📖 Narration/Intuition

**Hubble** est la plateforme d'observabilité réseau et de sécurité intégrée à Cilium. Elle permet de visualiser la cartographie complète des flux réseau entre Pods, de mesurer les pertes de paquets et d'auditer les connexions rejetées par les règles de sécurité.

### 🔍 Anatomie Technique

**Inspection des flux réseau via la CLI Hubble :**

```bash
# Installation du CLI Hubble
curl -L --remote-name-all https://github.com/cilium/hubble/releases/latest/download/hubble-linux-amd64.tar.gz
tar xzvf hubble-linux-amd64.tar.gz && sudo mv hubble /usr/local/bin/

# 1. Observer le trafic réseau en temps réel dans un namespace
hubble observe --namespace bcc-production --follow

# 2. Inspecter uniquement les paquets de trafic REJETÉS (Dropped Flows) par les règles de sécurité
hubble observe --namespace bcc-production --verdict DROPPED

# 3. Afficher les métriques de latence HTTP inter-services
hubble observe --service bcc-virement-api --protocol http --output json
```

---

## 🏅 Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **CNI** | Container Network Interface — Spécification et plugin d'architecture réseau pour conteneurs |
| **Cilium** | Plugin CNI open-source de référence basé sur eBPF pour Kubernetes |
| **Hubble** | Plateforme d'observabilité réseau et sécurité au niveau du noyau basée sur Cilium/eBPF |
| **L7 Policy** | Politique de sécurité réseau opérant au niveau applicatif (HTTP/gRPC) |

---

## 🏋️ Exercices & Corrigés

**Exercice 1 :** Pourquoi l'utilisation de Cilium en mode replacement complet de `kube-proxy` améliore-t-elle le temps de latence réseau des microservices Kubernetes ?

**Corrigé :** Dans les clusters Kubernetes volumineux, `kube-proxy` s'appuie sur `iptables` qui traite les règles de routage de manière **séquentielle** ($O(N)$). Plus il y a de services dans le cluster, plus chaque paquet doit traverser de nombreuses règles avant de trouver sa destination, augmentant la latence. Cilium remplace ce mécanisme par des **tables de hachage eBPF dans le noyau (Maps eBPF)** qui effectuent la recherche de destination en **temps constant ($O(1)$)**, quelle que soit la taille du cluster.

**Exercice 2 :** Quelle est la différence entre une `NetworkPolicy` native Kubernetes et une `CiliumNetworkPolicy` ?

**Corrigé :** Une `NetworkPolicy` native Kubernetes ne filtre le trafic qu'aux **Couches 3 et 4** (Adresse IP source/destination et Port TCP/UDP). Une `CiliumNetworkPolicy` permet d'étendre la sécurité jusqu'à la **Couche 7 (Application)** : elle permet de filtrer selon les méthodes HTTP (`GET`, `POST`, `DELETE`), les chemins d'URL (`/api/v1/virement`), ou les commandes des protocoles applicatifs comme Kafka ou gRPC.

---

## ❓ Banque de Questions & Test du Jour

**Q1 :** Quel plugin CNI réseau de référence pour Kubernetes s'appuie intégralement sur eBPF pour offrir des performances réseau ultra-rapides et de l'observabilité sans kube-proxy ?
- A) Cilium
- B) MS-DOS
- C) Gzip
- D) Notepad

**Réponse : A**

**Q2 :** Quelle plateforme d'observabilité réseau intégrée à Cilium permet de visualiser graphiquement les flux de paquets et d'auditer le trafic rejeté en temps réel ?
- A) Hubble
- B) Word
- C) Paint
- D) Calculator

**Réponse : A**

**Q3 :** À quel niveau du modèle OSI les `CiliumNetworkPolicies` permettent-elles d'effectuer du filtrage réseau fin (ex: autoriser `GET /public` et bloquer `DELETE /admin`) ?
- A) Couche 7 (Application - HTTP/gRPC)
- B) Couche 1 (Physique)
- C) Couche 2 (Liaison de données)
- D) Aucune couche

**Réponse : A**

**Q4 :** Quelle est la complexité algorithmique de recherche de destination d'un paquet réseau avec Cilium (eBPF Maps) par rapport aux $O(N)$ d'iptables ?
- A) $O(1)$ (Temps constant instantané)
- B) $O(N^3)$
- C) $O(2^N)$
- D) Infini

**Réponse : A**

**Q5 :** Quel verdict renvoyé par l'outil `hubble observe` permet à l'équipe de sécurité de lister tous les paquets réseau bloqués par une règle de sécurité ?
- A) DROPPED
- B) FORWARDED
- C) OK
- D) UNKNOWN

**Réponse : A**

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
