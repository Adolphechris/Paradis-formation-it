# TOME P3 — Cloud Native, DevOps & Cyberdéfense — Jour 132 (6h) : Sécurité de la Virtualisation de Fonctions Réseau (VNF/CNF) & Orchestration MANO (ETSI MANO, OpenSource MANO - OSM & Cloud-Native VNFs)

> [!NOTE]
> **Objectif du jour :** Concevoir et sécuriser les architectures d'Orchestration de Virtualisation de Fonctions Réseau (NFV MANO - Management and Orchestration) : standards ETSI GS NFV-SEC, orchestration avec OpenSource MANO (OSM), isolation des VNFs (Virtual Network Functions) et CNFs (Cloud-Native Network Functions) dans des clouds télécoms critiques.
>
> **Compétences visées :** `BIT-04` (A) — NFV MANO & Orchestration Télécoms | `SEC-04` (A) — Sécurité des VNFs/CNFs Télécoms

---

## 1) Module — Architecture ETSI NFV MANO & Composants (2h)

### 📖 Narration/Intuition

Dans les réseaux télécoms modernes (5G, IMS, SD-WAN), les fonctions réseau qui s'exécutaient autrefois sur des matériels physiques dédiés (routeurs, pare-feux, CGNAT) sont désormais des logiciels virtualisés (**VNFs** sous KVM/OpenStack) ou conteneurisés (**CNFs** sous Kubernetes).

L'architecture **ETSI NFV MANO (Management and Orchestration)** est le standard mondial qui régit la création, le déploiement automatisé, le scaling et la sécurité de ces fonctions réseau virtuelles.

### 2) Module — Les 3 Couches MANO (NFVO, VNFM, VIM) (2h)

```
┌─────────────────────────────────────────────────────────────┐
│ 1. NFVO (NFV Orchestrator)                                  │
│    - Orchestration globale des services réseau (NS)         │
│    - Gestion du cycle de vie des Network Services           │
└──────────────┬──────────────────────────────┬───────────────┘
               │                              │
               ▼                              ▼
┌─────────────────────────────┐┌──────────────────────────────┐
│ 2. VNFM (VNF Manager)       ││ 3. VIM (Virtualised Infra    │
│ - Instanciation et scaling  ││    Manager - OpenStack/K8s) │
│   individuel de chaque VNF  ││ - Allocation CPU/RAM/Network │
└─────────────────────────────┘└──────────────────────────────┘
```

---

## 3) Module — Sécurisation des VNFs/CNFs selon ETSI NFV-SEC (2h)

### 📖 Narration/Intuition

Une VNF compromise (ex: une fonction réseau virtuelle pare-feu ou un sous-système 5G UPF) pourrait permettre à un attaquant d'intercepter les communications de millions d'abonnés. Le groupe de travail **ETSI NFV-SEC** définit les règles de durcissement et d'isolement des VNFs.

### 🔍 Anatomie Technical

**Descripteur de VNF sécurisé OpenSource MANO (VNFD YAML) (`bcc_firewall_vnfd.yaml`) :**

```yaml
vnfd:
  id: bcc_firewall_vnfd
  product-name: bcc_firewall_vnfd
  description: "VNF Pare-feu Virtuel Sécurisé BCC"
  version: "2.0"
  provider: "BCC-Telecom-Security"

  df:
    - id: default-df
      vdu-profile:
        - id: vdu-firewall
          min-number-of-instances: 2 # Haute Disponibilité (2 instances min)

  vdu:
    - id: vdu-firewall
      name: bcc-fw-vdu
      image: "bcc-hardened-fw-v2.qcow2"
      
      # Isolation des ressources d'exécution
      virtual-compute-desc: vdu-compute-hugepages
      virtual-storage-desc:
        - vdu-storage

      # Isolation cryptographique des cartes réseau virtuelles (SR-IOV / DPDK)
      int-cpd:
        - id: vdu-fw-eth0-int
          virtual-network-interface-requirement:
            - name: sriov-passthrough
              support-mandatory: true

  virtual-compute-desc:
    - id: vdu-compute-hugepages
      virtual-cpu:
        num-virtual-cpu: 4
        cpu-architecture: "x86_64"
      virtual-memory:
        size: 8.0 # 8 GB RAM avec Hugepages isolés
```

---

## 🏅 Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **MANO** | Management and Orchestration — Framework ETSI d'orchestration de la virtualisation réseau |
| **NFVO** | NFV Orchestrator — Orchestrateur global de services réseau virtuels |
| **VNFM** | VNF Manager — Gestionnaire du cycle de vie individuel d'une VNF |
| **VIM** | Virtualised Infrastructure Manager — Gestionnaire des ressources d'infrastructure (OpenStack/K8s) |
| **CNF** | Cloud-Native Network Function — Fonction réseau conteneurisée sur Kubernetes |

---

## 🏋️ Exercices & Corrigés

**Exercice 1 :** Quelle est la différence de déploiement et de performance entre une **VNF (Virtual Network Function)** et une **CNF (Cloud-Native Network Function)** ?

**Corrigé :** Une **VNF** est une fonction réseau empaquetée sous forme de **machine virtuelle (VM)** s'exécutant sur un hyperviseur (KVM/OpenStack). Son démarrage prend plusieurs dizaines de secondes et elle consomme plus de ressources. Une **CNF** est une fonction réseau empaquetée sous forme de **conteneur cloud-native (Kubernetes)**. Son démarrage est quasi-instantané (quelques millisecondes), son empreinte mémoire est ultra-faible, et elle s'intègre directement dans les architectures GitOps et Service Mesh.

**Exercice 2 :** Pourquoi la technologie **SR-IOV (Single Root I/O Virtualization)** est-elle privilégiée pour les cartes réseau des VNFs télécoms critiques ?

**Corrigé :** **SR-IOV** permet à une carte réseau physique (NIC) de se diviser en plusieurs fonctions virtuelles (VF) et de les attribuer **directement à la mémoire de la VNF** sans passer par le commutateur virtuel logiciel de l'hyperviseur. Cela élimine la surcharge CPU du commutateur virtuel, réduit la latence réseau au niveau matériel (latence sub-microseconde) et fournit une isolation physique et cryptographique des flux réseau.

---

## ❓ Banque de Questions & Test du Jour

**Q1 :** Quel standard mondial développé par l'ETSI régit l'architecture d'orchestration, de déploiement et de sécurité des fonctions réseau virtuelles (NFV) ?
- A) ETSI NFV MANO
- B) MS-DOS
- C) HDMI
- D) POP3

**Réponse : A**

**Q2 :** Dans l'architecture MANO, quel composant est responsable de la gestion des ressources d'infrastructure physiques et virtuelles (ex: OpenStack ou Kubernetes) ?
- A) VIM (Virtualised Infrastructure Manager)
- B) Lecteur DVD
- C) Imprimante
- D) Clavier

**Réponse : A**

**Q3 :** Comment appelle-t-on une fonction réseau télécoms empaquetée et exécutée sous forme de conteneur natif Kubernetes (par opposition aux VNFs basées sur des VMs) ?
- A) CNF (Cloud-Native Network Function)
- B) Fichier ZIP
- C) Disquette
- D) Fichier texte

**Réponse : A**

**Q4 :** Quelle technologie réseau permet d'attribuer directement des fonctions virtuelles d'une carte réseau physique (NIC) à une VNF pour obtenir des performances de débit maximales à latence quasi-nulle ?
- A) SR-IOV (Single Root I/O Virtualization)
- B) Wi-Fi public
- C) Bluetooth
- D) Port série RS232

**Réponse : A**

**Q5 :** Quel projet open-source hébergé par l'ETSI est l'implémentation de référence du framework MANO pour l'orchestration des services réseau télécoms 5G ?
- A) OpenSource MANO (OSM)
- B) Notepad
- C) Paint
- D) Word

**Réponse : A**

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
