# TOME P12 — Architecture Ultime, Leadership Technique & Capstone Final — Jour 565 (6h) : High Availability & Disaster Recovery : Multi-Region Active-Active & RTO Zéro

> [!NOTE]
> **Objectifs pédagogiques :**
> - Concevoir une architecture **Multi-Region Active-Active** à haute disponibilité garantissant un **RTO (Recovery Time Objective) proche de zéro**
> - Maîtriser le routage du trafic mondial via **GSLB (Global Server Load Balancing)**, Anycast BGP et Cloudflare/AWS Route53 Latency-Based Routing
> - Gérer la réplication de données multi-régions (PostgreSQL BDR, CockroachDB Multi-Region, AWS DynamoDB Global Tables)
> - Prévenir les risques du **Split-Brain** lors d'un partitionnement inter-régional
>
> **Compétences visées :** `INFRA-03` (A), `ARCH-01` (A) — High Availability, Multi-Region Active-Active, RTO Zéro

---

## Module 1 — Architecture Multi-Region Active-Active (2h)

### 📖 Intuition & Narration

Dans une architecture Active-Passive traditionnelle, la région secondaire attend patiemment qu'une catastrophe frappe la région principale. Mais lorsque la panne survient, le basculement (failover) prend souvent des dizaines de minutes, requiert des interventions manuelles stressantes et échoue régulièrement faute de tests en conditions réelles.

Dans une architecture **Multi-Region Active-Active**, **toutes les régions traitent du trafic utilisateur en continu**. Si la région Europe-Ouest subit une panne totale de datacenter, les utilisateurs sont automatiquement redirigés vers la région Europe-Nord en quelques secondes par le réseau Anycast/GSLB, **sans aucune interruption perçue et sans intervention humaine**.

### 🔍 Architecture Active-Active Globale

```
ARCHITECTURE MULTI-REGION ACTIVE-ACTIVE

                 UTILISATEURS MONDIAUX
                          │
                          ▼
            ANYCAST BGP / ROUTE53 GSLB
            (Routage automatique par latence & santé)
             ┌────────────┴────────────┐
             │                         │
             ▼                         ▼
  RÉGION 1 : EU-WEST (PARIS)   RÉGION 2 : EU-NORTH (STOCKHOLM)
  ┌───────────────────────┐    ┌───────────────────────┐
  │ Ingress Controller    │    │ Ingress Controller    │
  │ Cluster K8s Active    │    │ Cluster K8s Active    │
  └──────────┬────────────┘    └──────────┬────────────┘
             │                            │
             ▼                            ▼
  ┌───────────────────────┐    ┌───────────────────────┐
  │ CockroachDB / Dynamo  │◄──►│ CockroachDB / Dynamo  │
  │ Node 1 (Raft Group)   │    │ Node 2 (Raft Group)   │
  └───────────────────────┘    └───────────────────────┘
     Réplication Synchronisée Inter-Régions (Consensus Majority)
```

---

## Module 2 — GSLB, Anycast & Prévention du Split-Brain (2h)

### 🔍 Routage GSLB & Anycast BGP

- **Anycast BGP** : Une seule adresse IP publique (ex: `1.1.1.1` ou `192.0.2.1`) est annoncée simultanément par des datacenters aux quatre coins du globe. Le protocole BGP oriente chaque paquet utilisateur vers le datacenter le plus proche sur le réseau Internet.
- **GSLB Health Checking** : Le GSLB vérifie en continu l'état de santé (Health Checks HTTP/gRPC) de chaque région. Si une région ne répond pas pendant 3 secondes, elle est retirée des enregistrements DNS.

### 🔍 Le Risque du Split-Brain

Si le lien réseau entre la Région A et la Région B est coupé mais que les deux régions continuent de fonctionner, les deux régions risquent de se déclarer "Master" et d'accepter des écritures conflictuelles (**Split-Brain**).

$$\text{Solution} : \text{Nombre IMPAIR de régions (ex: 3 régions)} \quad \rightarrow \quad \text{Quorum Majority} = \lfloor N/2 \rfloor + 1$$

Avec 3 régions, la région isolée (1 seule) n'a pas la majorité (2/3 requis) et **refuse les écritures**, empêchant toute corruption de données.

---

## Module 3 — Simulator de GSLB & Multi-Region Failover (1h30)

### 🛠️ Script Python : GSLB & Automated Health Check Failover Engine

```python
#!/usr/bin/env python3
"""
PARADIS — GSLB & Automated Multi-Region Failover Simulator
Simule le routage Anycast/GSLB et le basculement automatique de trafic en < 3 secondes.
"""
import time
from dataclasses import dataclass, field
from typing import List, Dict

@dataclass
class RegionEndpoint:
    region_code: str
    name: str
    ip_address: str
    latency_ms: float
    is_healthy: bool = True
    active_connections: int = 0

class GSLBRouter:
    def __init__(self):
        self.endpoints: Dict[str, RegionEndpoint] = {}

    def add_endpoint(self, endpoint: RegionEndpoint):
        self.endpoints[endpoint.region_code] = endpoint

    def set_region_health(self, region_code: str, is_healthy: bool):
        if region_code in self.endpoints:
            self.endpoints[region_code].is_healthy = is_healthy
            status = "HEALTHY 🟢" if is_healthy else "DOWN 🚨 (Panne Majeure)"
            print(f"  [GSLB MONITOR] Changement de santé Région {region_code} → {status}")

    def route_request(self, client_location: str) -> RegionEndpoint:
        """Route la requête vers la région SAINE la plus proche (latence minimale)"""
        healthy_nodes = [ep for ep in self.endpoints.values() if ep.is_healthy]

        if not healthy_nodes:
            raise RuntimeError("CRITIQUE : Toutes les régions sont indisponibles ! Disaster Plan général.")

        # Sélection par latence minimale parmi les nœuds sains
        best_endpoint = min(healthy_nodes, key=lambda ep: ep.latency_ms)
        best_endpoint.active_connections += 1
        return best_endpoint

    def print_routing_table(self):
        print("=" * 70)
        print("  PARADIS GSLB ANYCAST ROUTING TABLE — VUE TEMPS RÉEL")
        print("=" * 70)
        for ep in self.endpoints.values():
            status = "HEALTHY 🟢" if ep.is_healthy else "FAILED ❌"
            print(f"  • [{ep.region_code}] {ep.name:<25} | IP: {ep.ip_address:<14} | Latence: {ep.latency_ms:4.1f}ms | {status}")
        print("=" * 70)


if __name__ == "__main__":
    gslb = GSLBRouter()

    # Initialisation de 3 Régions (France, Suède, USA)
    gslb.add_endpoint(RegionEndpoint("eu-west-3", "France (Paris)", "195.154.10.1", 12.0))
    gslb.add_endpoint(RegionEndpoint("eu-north-1", "Suède (Stockholm)", "13.53.20.2", 28.0))
    gslb.add_endpoint(RegionEndpoint("us-east-1", "USA (N. Virginia)", "52.90.30.3", 95.0))

    gslb.print_routing_table()

    # 1. Requête nominale (Région la plus proche : France 12ms)
    print("\n[1] Arrivée d'un utilisateur européen (Trafic Nominal)...")
    ep1 = gslb.route_request("Europe/Paris")
    print(f"    → Routé vers : {ep1.name} (IP: {ep1.ip_address}) en {ep1.latency_ms}ms\n")

    # 2. Simulation PANNE TOTALE Datacenter Paris (eu-west-3)
    print("[2] SIMULATION PANNE CRITIQUE : Incendie Datacenter Paris (eu-west-3)...")
    gslb.set_region_health("eu-west-3", False)
    print()

    # 3. Requête pendant la panne -> Basculement automatique vers Suède (28ms) en RTO Zéro !
    print("[3] Arrivée d'un nouvel utilisateur pendant la panne (Automated Failover)...")
    ep2 = gslb.route_request("Europe/Paris")
    print(f"    → Routé automatiquement vers : {ep2.name} (IP: {ep2.ip_address}) en {ep2.latency_ms}ms")
    print("    [✅ RTO ZÉRO] Aucune interruption de service subie par l'utilisateur.")
```

---

## Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **GSLB** | Global Server Load Balancing — Équilibrage de charge mondial basé sur le DNS et la latence |
| **Anycast** | Technique de routage BGP où plusieurs serveurs partagent la même IP publique globale |
| **Split-Brain** | État dangereux où deux sous-réseaux isolés se déclarent maîtres et modifient des données en conflit |
| **Quorum** | Nombre minimal de nœuds requis ($\lfloor N/2 \rfloor + 1$) pour valider une décision dans un système distribué |

---

## Exercices Pratiques

### Exercice 1 — Calcul de Quorum Anti Split-Brain

Une entreprise déploie un cluster distribué sur **4 datacenters**.

1. Quelle est la valeur du Quorum nécessaire pour valider une écriture ($\lfloor N/2 \rfloor + 1$) ?
2. Si une coupure réseau sépare le cluster en 2 sous-groupes égaux de 2 datacenters chacun, que se passe-t-il ?
3. Pourquoi recommande-t-on toujours un nombre **impair** de datacenters (ex: 3 ou 5) ?

**Corrigé guidé :**
1. Pour $N = 4$ datacenters, $\text{Quorum} = \lfloor 4/2 \rfloor + 1 = \mathbf{3 \text{ datacenters}}$.
2. Si le réseau se coupe en $2 + 2$, aucun des deux sous-groupes ne possède 3 nœuds (ils n'ont que 2/4). **Résultat : L'ensemble du cluster bloque les écritures !** (Indisponibilité totale).
3. Avec un nombre **impair** (ex: 3 datacenters), le Quorum est de 2/3. Une coupure séparera le réseau en $2 + 1$. Le sous-groupe de 2 datacenters possède la majorité (2 >= 2) et **continue de fonctionner normalement**, tandis que le nœud isolé (1 < 2) s'arrête gentiment sans risquer un Split-Brain.

---

## Banque QCM — 5 Questions

**Q1.** Quelle est la caractéristique principale d'une architecture **Multi-Region Active-Active** par rapport à une architecture Active-Passive ?

- A) Active-Active coûte 10 fois moins cher.
- B) Toutes les régions traitent du trafic utilisateur en continu, permettant un basculement instantané (RTO proche de zéro) sans intervention humaine en cas de panne d'une région. ✅
- C) Active-Active n'utilise aucun serveur web.
- D) Active-Passive ne fonctionne qu'avec Windows.

**Q2.** Comment fonctionne le routage par **Anycast BGP** ?

- A) Chaque utilisateur reçoit une adresse IP différente.
- B) Une seule adresse IP publique est annoncée simultanément par plusieurs datacenters dans le monde, et le réseau Internet oriente chaque paquet vers le datacenter le plus proche. ✅
- C) Anycast nécessite d'envoyer un SMS avant de se connecter.
- D) Anycast est un protocole de base de données.

**Q3.** Qu'est-ce que le risque de **Split-Brain** dans un système distribué multi-régions ?

- A) La surchauffe des processeurs.
- B) Le phénomène où une coupure réseau isole deux sous-groupes qui se déclarent tous les deux "Master", acceptant des écritures divergentes qui corrompent les données. ✅
- C) La perte des mots de passe des administrateurs.
- D) L'absence de certificat SSL.

**Q4.** Pour éviter le Split-Brain et garantir la formation d'une majorité (Quorum), il est fortement recommandé de déployer un nombre :

- A) Pair de nœuds (2, 4, 6)
- B) Impair de nœuds ou de régions (3, 5, 7) ✅
- C) Supérieur à 100 nœuds obligatoirement
- D) De 1 seul serveur

**Q5.** Dans un système GSLB, que se passe-t-il lorsque le Health Check détecte qu'une région entière est en panne ?

- A) Il réinitialise la base de données.
- B) Il retire immédiatement la région défaillante des réponses DNS Anycast/GSLB pour rediriger tout le trafic vers les régions saines. ✅
- C) Il envoie un message d'erreur HTTP 500 à tous les utilisateurs.
- D) Il attend 24 heures avant d'agir.

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
