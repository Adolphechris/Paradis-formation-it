# TOME P12 — Architecture Ultime, Leadership Technique & Capstone Final — Jour 591 (6h) : System Design Interview Simulation — Netflix, Uber, WhatsApp Scale

> [!NOTE]
> **Objectifs pédagogiques :**
> - Simuler en profondeur les 3 cas d'école incontournables des entretiens **System Design Échelle Mondiale** : Netflix (Streaming & CDN), Uber (Géolocalisation & Matchmaking), WhatsApp (Messagerie temps réel)
> - Concevoir des architectures capables de supporter **100 millions+ d'utilisateurs actifs** avec latence sub-seconde
> - Maîtriser le **Geohashing (H3/Quadtree)** pour la recherche spatiale temps réel et le **Consistent Hashing** pour la distribution de charge
> - Évaluer les compromis **CAP Theorem** (AP vs. CP) dans des contextes d'infrastructures hautement distribuées
>
> **Compétences visées :** `ARCH-01` (A), `OPS-01` (A) — Massive Scale System Design, Distributed Systems, High Availability

---

## Module 1 — Architecture Netflix Scale (Video Streaming & Global CDN) (2h)

### 📖 Défis d'Ingénierie à l'Échelle Netflix

**Contraintes :** 200M+ abonnés, 15% du trafic Internet mondial aux heures de pointe, vidéo 4K HDR.

```
ARCHITECTURE NETFLIX — CONTROL PLANE vs DATA PLANE

  CONTROL PLANE (AWS Cloud — Microservices)
  ┌─────────────────────────────────────────────────────────────┐
  │  Client App → AWS Route53 → API Gateway (Zuul/Spring Cloud) │
  │  ├── Auth & User Profile (Cassandra / DynamoDB)              │
  │  ├── Recommendation Engine (ML Model / Spark / Kafka)       │
  │  └── Encodage Vidéo Async (AWS EC2 Spot Fleet + S3)         │
  └──────────────────────────────┬──────────────────────────────┘
                                 │ URL signée (Token HMAC)
  DATA PLANE (Open Connect CDN — ISP Edge Servers)
  ┌──────────────────────────────▼──────────────────────────────┐
  │  Serveurs Open Connect (IXP / Fournisseurs d'Accès Internet)│
  │  - Pré-positionnement nuit des vidéos populaires (FreeBSD)  │
  │  - Streaming direct aux utilisateurs (Zero-copy TLS/Nginx)  │
  └─────────────────────────────────────────────────────────────┘

  PATTERNS CRITIQUES NETFLIX :
  - Adaptive Bitrate Streaming (HLS / DASH) : découpage vidéo en segments de 2-6 sec avec plusieurs résolutions (1080p, 4K).
  - Chaos Engineering (Chaos Monkey / Simian Army) : injection de pannes aléatoires en production pour vérifier l'auto-healing.
```

---

## Module 2 — Architecture Uber & WhatsApp Scale (2h)

### 🔍 Uber Scale — Géolocalisation Temps Réel (Geohashing & H3)

```
UBER MATCHMAKING — GÉOLOCALISATION & H3 HEXAGONAL GRID

  Chaque conducteur transmet ses coordonnées GPS (Lat, Lon) toutes les 4 secondes.
  Problème : Trouver les 10 chauffeurs les plus proches d'un passager en < 100ms.

  SOLUTION : H3 Spatial Indexing (Uber Open Source)
  - La surface de la Terre est découpée en hexagones hiérarchiques (Résolution 8 = ~0.7 km²).
  - (Lat: 48.8566, Lon: 2.3522) → Hash Hexagonal : "882b3084bffffff"

  FLUX ARCHITECTURAL UBER :
  Driver App (GPS 4s) ──WebSocket──► Driver Location Service
                                           │ (Update Memory Index)
                                           ▼
                                 Redis Cluster (Geospatial / H3)
                                           │
  Rider App (Request Ride) ──HTTPS──► Matchmaking Engine
                                           │ Query Hexagon + 6 voisins
                                           ▼
                                 Top 10 Chauffeurs Proches (Latence < 50ms)
```

### 🔍 WhatsApp Scale — Messagerie Temps Réel (WebSocket & Erlang/Elixir)

```
WHATSAPP ARCHITECTURE — 2 MILLIARDS D'UTILISATEURS

  - Connexions persistantes : WebSockets / Erlang BEAM (2 Millions de connexions TCP par serveur).
  - Chiffrement de bout en bout (E2EE) : Protocol Signal (Double Ratchet Algorithm).
  - Base de données : Mnesia (Erlang) / Cassandra pour les messages non livrés (Store-and-Forward).
  - Statut de livraison : Sent (✓), Delivered (✓✓), Read (✓✓ bleu).
```

---

## Module 3 — Atelier Pratique : Geohash & Consistent Hashing Simulator (1h30)

### 🛠️ Script Python : Consistent Hashing Ring & Geohash Grid Simulator

```python
#!/usr/bin/env python3
"""
PARADIS — Consistent Hashing Ring & Geohash Grid Simulator
Simule les algorithmes clés d'Uber (Geohashing/Grid) et de Netflix/Cassandra (Consistent Hashing Ring).
"""
import hashlib
import math
from typing import List, Dict, Tuple, Optional

# ─── PARTIE 1 : Consistent Hashing Ring (Cassandra / DynamoDB / CDN) ────────

class ConsistentHashRing:
    """Anneau de Hashing Consistent avec Nœuds Virtuels (Virtual Nodes)"""

    def __init__(self, replicas: int = 3):
        self.replicas = replicas  # Nombre de virtual nodes par serveur
        self.ring: Dict[int, str] = {}
        self._sorted_keys: List[int] = []

    def _hash(self, key: str) -> int:
        """Hash MD5 ramené sur 32 bits"""
        return int(hashlib.md5(key.encode()).hexdigest()[:8], 16)

    def add_node(self, node: str):
        for i in range(self.replicas):
            vnode_key = f"{node}-vnode-{i}"
            h = self._hash(vnode_key)
            self.ring[h] = node
            self._sorted_keys.append(h)
        self._sorted_keys.sort()

    def remove_node(self, node: str):
        for i in range(self.replicas):
            vnode_key = f"{node}-vnode-{i}"
            h = self._hash(vnode_key)
            if h in self.ring:
                del self.ring[h]
                self._sorted_keys.remove(h)

    def get_node(self, item_key: str) -> Optional[str]:
        if not self.ring:
            return None
        h = self._hash(item_key)
        for key in self._sorted_keys:
            if h <= key:
                return self.ring[key]
        return self.ring[self._sorted_keys[0]]  # Boucle sur l'anneau


# ─── PARTIE 2 : Geohash Grid Simulator (Uber Scale) ──────────────────────────

class SimpleGeohashGrid:
    """Simulateur simplifié de grille spatiale pour Uber Matchmaking"""

    def __init__(self, grid_size_km: float = 1.0):
        self.grid_size_km = grid_size_km
        self.drivers: Dict[str, Tuple[float, float]] = {}  # driver_id -> (lat, lon)

    def _to_grid_cell(self, lat: float, lon: float) -> Tuple[int, int]:
        # Conversion simplifiée degrés → grille (1 deg lat ~ 111 km)
        cell_x = int(lat * 111.0 / self.grid_size_km)
        cell_y = int(lon * 111.0 * math.cos(math.radians(lat)) / self.grid_size_km)
        return (cell_x, cell_y)

    def update_driver_location(self, driver_id: str, lat: float, lon: float):
        self.drivers[driver_id] = (lat, lon)

    def find_nearby_drivers(self, rider_lat: float, rider_lon: float, max_distance_km: float = 2.0) -> List[Tuple[str, float]]:
        nearby = []
        for driver_id, (d_lat, d_lon) in self.drivers.items():
            # Distance haversine simplifiée
            dlat = math.radians(d_lat - rider_lat)
            dlon = math.radians(d_lon - rider_lon)
            a = math.sin(dlat/2)**2 + math.cos(math.radians(rider_lat)) * math.cos(math.radians(d_lat)) * math.sin(dlon/2)**2
            dist_km = 6371.0 * 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))

            if dist_km <= max_distance_km:
                nearby.append((driver_id, round(dist_km, 2)))

        nearby.sort(key=lambda x: x[1])
        return nearby


if __name__ == "__main__":
    print("=== PARADIS — SYSTEM DESIGN MASSIVE SCALE SIMULATOR ===\n")

    # 1. Consistent Hashing Demo
    print("⭕ CONSISTENT HASHING RING (Cassandra / CDN Data Sharding)")
    ring = ConsistentHashRing(replicas=3)
    nodes = ["cdn-node-paris", "cdn-node-frankfurt", "cdn-node-london"]
    for n in nodes:
        ring.add_node(n)

    keys = ["video_stream_4k_001.mp4", "video_stream_1080p_002.mp4", "user_profile_99.json", "movie_thumbnail.jpg"]
    print("  Attribution initiale des fichiers aux nœuds :")
    for k in keys:
        node = ring.get_node(k)
        print(f"    Fichier '{k:28s}' → Nœud : {node}")

    print("\n  Simulations d'ajout d'un nœud (cdn-node-amsterdam)...")
    ring.add_node("cdn-node-amsterdam")
    for k in keys:
        node = ring.get_node(k)
        print(f"    Fichier '{k:28s}' → Nœud : {node}")

    print("\n" + "─"*70 + "\n")

    # 2. Geohash Uber Matchmaking Demo
    print("🚕 UBER MATCHMAKING — SPATIAL SEARCH DEMO")
    grid = SimpleGeohashGrid(grid_size_km=1.0)

    # Position chauffeurs à Paris
    grid.update_driver_location("driver_alpha",   48.8584, 2.2945)  # Tour Eiffel (0.2 km)
    grid.update_driver_location("driver_bravo",   48.8606, 2.3376)  # Louvre (~3.2 km)
    grid.update_driver_location("driver_charlie", 48.8570, 2.2980)  # Champ de Mars (0.3 km)
    grid.update_driver_location("driver_delta",   48.8738, 2.2950)  # Arc de Triomphe (~1.7 km)

    # Passager à la Tour Eiffel
    rider_lat, rider_lon = 48.8583, 2.2944
    drivers = grid.find_nearby_drivers(rider_lat, rider_lon, max_distance_km=2.0)

    print(f"  Passager positionné à (Lat: {rider_lat}, Lon: {rider_lon}) [Tour Eiffel]")
    print("  Chauffeurs trouvés dans un rayon de 2 km :")
    for driver_id, dist in drivers:
        print(f"    🚗 {driver_id:15s} — Distance: {dist} km")
```

---

## Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **HLS / DASH** | HTTP Live Streaming / Dynamic Adaptive Streaming over HTTP — Protocoles de vidéo adaptative |
| **Consistent Hashing** | Technique de hachage où l'ajout/retrait de nœuds ne déplace qu'une fraction minimale de clés |
| **H3** | Système d'indexation spatiale hexagonale open source développé par Uber |
| **IXP** | Internet Exchange Point — Point d'interconnexion physique entre opérateurs réseau et CDNs |

---

## Exercices Pratiques

### Exercice 1 — Calcul de Re-hashing lors de l'ajout d'un Nœud

Un cluster de cache traditionnel utilise la formule $Node = Hash(Key) \pmod N$ avec $N = 4$ serveurs.

1. Si l'on ajoute un 5ème serveur ($N = 5$), quel pourcentage de clés devra être déplacé (re-hashé) ?
2. Quelle solution d'architecture évite ce problème de déplacement massif ?

**Corrigé :**
1. Avec $Hash(Key) \pmod N$, modifier $N$ de 4 à 5 change le résultat de la formule pour environ **80% à 90% de toutes les clés** du cluster, annulant l'efficacité du cache.
2. Le **Consistent Hashing** (anneau avec Virtual Nodes) résout ce problème : lors de l'ajout d'un 5ème nœud, seules **1/N** (soit 20%) des clés sont réattribuées au nouveau nœud, les 80% autres restent intactes. ✅

---

## Banque QCM — 5 Questions

**Q1.** Pourquoi Netflix utilise-t-il son propre réseau CDN appelé **Open Connect** installé directement au sein des FAI (Fournisseurs d'Accès Internet) ?

- A) Pour économiser sur le stockage AWS.
- B) Pour servir les téraoctets de flux vidéo 4K depuis des serveurs localisés au plus près des utilisateurs finaux, évitant de surcharger le backbone Internet global. ✅
- C) Parce que la vidéo 4K est interdite sur AWS.
- D) Pour contourner le protocole HTTPS.

**Q2.** Quel est le principal avantage de l'indexation spatiale hexagonale **H3 d'Uber** par rapport à une grille carrée classique ?

- A) L'hexagone a une distance identique entre son centre et tous ses voisins directs, simplifiant les algorithmes de recherche spatiale sans distorsion d'angle. ✅
- B) L'hexagone consomme moins de mémoire RAM.
- C) H3 est compatible uniquement avec SQL.
- D) L'hexagone permet de chiffrer les coordonnées GPS.

**Q3.** En messagerie temps réel à l'échelle de **WhatsApp** (2 milliards d'utilisateurs), quel protocole réseau assure la connexion persistante bidirectionnelle à faible latence ?

- A) HTTP/1.1 Short Polling
- B) WebSockets (sur connexions TCP longue durée) ✅
- C) FTP
- D) SMTP

**Q4.** Dans un algorithme de **Consistent Hashing**, à quoi servent les **Virtual Nodes (vnodes)** ?

- A) À dupliquer les données sur le disque dur.
- B) À répartir uniformément les clés sur l'anneau et équilibrer la charge entre serveurs de capacités différentes. ✅
- C) À accélérer le chiffrement TLS.
- D) À remplacer les routeurs réseau.

**Q5.** Qu'est-ce que le **Adaptive Bitrate Streaming (HLS/DASH)** ?

- A) Une technique de compression audio.
- B) Le découpage d'une vidéo en petits segments encodés en plusieurs résolutions, permettant au lecteur vidéo d'ajuster automatiquement la qualité en fonction de la bande passante temps réel de l'utilisateur. ✅
- C) Un pare-feu applicatif.
- D) Un protocole de téléchargement P2P.

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
