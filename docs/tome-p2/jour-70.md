# TOME P2 — Réseaux & Télécoms — Jour 70 (6h) : Projet Intégrateur Semestre 2 — Architecture Réseau Haute Disponibilité Multi-Sites

> [!NOTE]
> **Objectif du jour :** Concevoir et documenter une architecture réseau complète, haute disponibilité et sécurisée pour un réseau multi-sites d'une banque centrale (BCC) : VRRP, Multi-Area OSPF, BGP, Wi-Fi 802.1X, QoS, NGFW/DMZ. Ce projet synthétise l'ensemble des compétences du Semestre 2.
>
> **Compétences visées :** `BIT-04` (A) — Architecture Réseau | `SEC-04` (A) — Sécurité Réseau | `PRO-01` (A) — Conduite de Projet

---

## 1) Module — Spécification & Architecture Globale (2h)

### 📖 Narration/Intuition

La BCC doit relier son siège de Kinshasa à 3 agences régionales (Lubumbashi, Goma, Matadi) via un réseau multi-transport SD-WAN sécurisé. L'infrastructure doit garantir une disponibilité de 99,9% pour les services critiques (RTGS, SWIFT), une sécurité Zero-Trust périmétrique et une supervision centralisée.

Ce projet intégrateur est la preuve de portfolio la plus importante du Semestre 2 : il démontre votre capacité à concevoir une architecture réseau d'entreprise complète.

### 🔍 Anatomie Technique

**Plan d'adressage IP global :**

```
╔══════════════════════════════════════════════════════════════════╗
║        PLAN D'ADRESSAGE IP — RÉSEAU BCC MULTI-SITES             ║
╠══════════════╦══════════════════╦═══════════════╦═══════════════╣
║ Site         ║ Réseau Principal ║ VLAN Mgmt     ║ VLAN Wi-Fi   ║
╠══════════════╬══════════════════╬═══════════════╬═══════════════╣
║ Siège KIN    ║ 10.0.100.0/24   ║ 10.0.200.0/24║ 10.0.300.0/24║
║ Agence LUB   ║ 10.1.100.0/24   ║ 10.1.200.0/24║ 10.1.300.0/24║
║ Agence GOM   ║ 10.2.100.0/24   ║ 10.2.200.0/24║ 10.2.300.0/24║
║ Agence MAT   ║ 10.3.100.0/24   ║ 10.3.200.0/24║ 10.3.300.0/24║
║ DMZ Siège    ║ 10.0.50.0/24    ║               ║              ║
╚══════════════╩══════════════════╩═══════════════╩══════════════╝

Liens WAN inter-sites :
- Siège ↔ LUB : 10.100.1.0/30  (MPLS 100Mbps + 4G backup)
- Siège ↔ GOM : 10.100.2.0/30  (Fibre 50Mbps + VSAT backup)
- Siège ↔ MAT : 10.100.3.0/30  (MPLS 50Mbps + 4G backup)

BGP (entre AS privés) :
- Siège   : AS 64512
- MTN Congo : AS 37153 (ISP Principal)
- Vodacom : AS 37594 (ISP Backup)
```

**Schéma logique de l'architecture :**

```
                ╔═══════════════════════════════════════╗
                ║  INTERNET (AS 37153 MTN + AS 37594)   ║
                ╚═════════════╤════════════╤════════════╝
                              │ BGP        │ BGP
                    ┌─────────▼──┐     ┌───▼──────────┐
                    │  RTR-BGP-1 │     │  RTR-BGP-2   │
                    │ AS 64512   │     │ AS 64512      │
                    └─────┬──────┘     └───────┬───────┘
                          │ eBGP ↔ iBGP        │
                    ┌─────▼────────────────────▼──────┐
                    │         CORE OSPF AREA 0         │
                    │  RTR-CORE-1 ──── RTR-CORE-2      │
                    │  (VRRP Master)   (VRRP Backup)   │
                    └──────────┬──────────────┬────────┘
                               │ OSPF         │ OSPF
                    ┌──────────▼───┐    ┌─────▼──────┐
                    │ Area 1 (Siège│    │ Area 2 (WAN│
                    │ Bâtiments)   │    │ Agences)   │
                    └──────────────┘    └────────────┘
```

---

## 2) Module — Implémentation & Scripts de Déploiement (2h)

### 📖 Narration/Intuition

Un projet réseau sans documentation et sans automatisation est incomplet. Dans ce module, nous structurons le déploiement en un ensemble de scripts réutilisables et une documentation opérationnelle (Runbook).

### 🔍 Anatomie Technique

**Script de déploiement OSPF + VRRP (Siège Kinshasa) :**

```bash
#!/bin/bash
# deploy-network-kin.sh — Déploiement réseau Siège BCC Kinshasa
# Prérequis : Ubuntu 22.04 LTS, FRRouting, keepalived installés

set -euo pipefail

SITE="KIN-SIEGE"
OSPF_ROUTER_ID="10.0.200.1"
VRRP_INTERFACE="eth1"
VRRP_VIP="10.0.100.1"        # IP virtuelle VRRP (passerelle des utilisateurs)
VRRP_PRIORITY="${1:-150}"     # 150 pour MASTER, 100 pour BACKUP

echo "=== Déploiement Réseau BCC — $SITE ==="
echo "Priority VRRP: $VRRP_PRIORITY (150=MASTER, 100=BACKUP)"

# ─── 1. Configuration IP forwarding ─────────────────────────────────────────
echo "[1/5] Configuration IP Forwarding..."
sysctl -w net.ipv4.ip_forward=1
sysctl -w net.ipv4.conf.all.rp_filter=1
echo "net.ipv4.ip_forward=1" >> /etc/sysctl.conf

# ─── 2. Configuration VRRP (keepalived) ─────────────────────────────────────
echo "[2/5] Configuration VRRP keepalived..."
cat > /etc/keepalived/keepalived.conf << EOF
vrrp_instance VI_LAN {
    state $([ "$VRRP_PRIORITY" -gt 100 ] && echo "MASTER" || echo "BACKUP")
    interface $VRRP_INTERFACE
    virtual_router_id 51
    priority $VRRP_PRIORITY
    advert_int 1
    authentication { auth_type PASS; auth_pass BCC_VRRP_2024! }
    virtual_ipaddress { $VRRP_VIP/24 }
}
EOF
systemctl restart keepalived

# ─── 3. Configuration OSPF (FRRouting) ───────────────────────────────────────
echo "[3/5] Configuration OSPF Multi-Area..."
vtysh -c "configure terminal" \
      -c "router ospf" \
      -c "  ospf router-id $OSPF_ROUTER_ID" \
      -c "  network 10.0.100.0/24 area 1" \
      -c "  network 10.0.200.0/24 area 0" \
      -c "  network 10.100.1.0/30 area 0" \
      -c "  area 1 stub" \
      -c "  timers throttle spf 50 200 5000" \
      -c "  area 0 authentication message-digest" \
      -c "end" \
      -c "write memory"

# ─── 4. Configuration QoS (trafic RTGS prioritaire) ─────────────────────────
echo "[4/5] Application des politiques QoS..."
tc qdisc del dev eth0 root 2>/dev/null || true
tc qdisc add dev eth0 root handle 1: htb default 30
tc class add dev eth0 parent 1: classid 1:1 htb rate 1000mbit
tc class add dev eth0 parent 1:1 classid 1:10 htb rate 100mbit ceil 1000mbit prio 1
tc class add dev eth0 parent 1:1 classid 1:20 htb rate 600mbit ceil 1000mbit prio 2
tc class add dev eth0 parent 1:1 classid 1:30 htb rate 200mbit ceil 1000mbit prio 3

# Marquage RTGS/SWIFT → classe 1:20
iptables -t mangle -A POSTROUTING -d 10.0.100.10/32 -j DSCP --set-dscp 18

# ─── 5. Vérifications post-déploiement ──────────────────────────────────────
echo "[5/5] Vérifications..."
sleep 5

echo ""
echo "--- État VRRP ---"
ip addr show $VRRP_INTERFACE | grep "$VRRP_VIP"

echo "--- État OSPF ---"
vtysh -c "show ip ospf neighbor" 2>/dev/null

echo "--- Table de routage (routes OSPF) ---"
ip route show proto ospf

echo ""
echo "=== ✅ Déploiement $SITE terminé ==="
```

**Vérification de conformité réseau (script d'audit) :**

```python
#!/usr/bin/env python3
"""
Audit de conformité réseau — BCC Multi-Sites
Vérifie que chaque site répond aux exigences d'architecture.
"""
import subprocess
import socket

def check_vrrp():
    """Vérifie que l'IP virtuelle VRRP est active."""
    try:
        result = subprocess.run(
            ["ip", "addr", "show", "eth1"],
            capture_output=True, text=True
        )
        return "10.0.100.1" in result.stdout, "IP VRRP active"
    except Exception as e:
        return False, str(e)

def check_ospf_neighbors():
    """Vérifie qu'il y a au moins un voisin OSPF."""
    try:
        result = subprocess.run(
            ["vtysh", "-c", "show ip ospf neighbor"],
            capture_output=True, text=True
        )
        lines = [l for l in result.stdout.split('\n') if 'Full' in l]
        return len(lines) > 0, f"{len(lines)} voisin(s) OSPF Full"
    except Exception as e:
        return False, str(e)

def check_bgp():
    """Vérifie l'état des sessions BGP."""
    try:
        result = subprocess.run(
            ["vtysh", "-c", "show bgp summary"],
            capture_output=True, text=True
        )
        return "Established" in result.stdout, "Session BGP Established"
    except Exception as e:
        return False, str(e)

def check_dns(domaine="bcc.cd"):
    """Vérifie la résolution DNS."""
    try:
        ip = socket.gethostbyname(domaine)
        return True, f"DNS OK → {domaine} = {ip}"
    except socket.gaierror as e:
        return False, f"DNS KO — {e}"

# Exécuter les vérifications
checks = [
    ("VRRP", check_vrrp),
    ("OSPF Neighbors", check_ospf_neighbors),
    ("BGP", check_bgp),
    ("DNS", check_dns),
]

print("=== AUDIT RÉSEAU BCC — CONFORMITÉ ARCHITECTURE ===")
passed = 0
for nom, fn in checks:
    ok, detail = fn()
    status = "✅ PASS" if ok else "❌ FAIL"
    print(f"  [{status}] {nom:20s} — {detail}")
    if ok:
        passed += 1

score = (passed / len(checks)) * 100
print(f"\nScore: {passed}/{len(checks)} ({score:.0f}%)")
print("Statut: ✅ CONFORME" if score >= 75 else "❌ NON CONFORME")
```

---

## 3) Module — Documentation, Runbook & Livrables Portfolio (2h)

### 📖 Narration/Intuition

Un architecte réseau ne livre pas seulement une infrastructure qui fonctionne — il livre une documentation opérationnelle complète (runbook, plan d'adressage, schémas) qui permet à un autre ingénieur de comprendre, opérer et faire évoluer l'infrastructure sans son aide.

### 🔍 Anatomie Technique

**Runbook opérationnel — Procédures critiques :**

```markdown
# RUNBOOK — Infrastructure Réseau BCC
Version : 1.0 | Date : 2024-08 | Auteur : Équipe Réseau BCC

## P1 — Panne de la passerelle VRRP

### Symptômes
- Les utilisateurs du LAN signalent une perte de connectivité
- L'IP virtuelle 10.0.100.1 ne répond plus au ping

### Diagnostic (< 5 minutes)
```bash
# 1. Vérifier l'état keepalived sur RTR-CORE-1
ssh admin@10.0.200.1 "systemctl status keepalived && ip addr show eth1"

# 2. Vérifier l'état sur RTR-CORE-2 (BACKUP)
ssh admin@10.0.200.2 "ip addr show eth1 | grep 10.0.100.1"
```

### Résolution
Si keepalived est arrêté sur MASTER → restart sur MASTER :
```bash
ssh admin@10.0.200.1 "sudo systemctl restart keepalived"
```
Si MASTER inaccessible → le BACKUP a déjà pris l'IP virtuelle (VRRP automatique)
→ Investiguer la cause de la panne MASTER
→ Ouvrir ticket P1 auprès de l'équipe infrastructure

## P2 — Perte d'adjacence OSPF

### Diagnostic
```bash
vtysh -c "show ip ospf neighbor"       # Vérifier l'état Full
vtysh -c "show ip ospf interface eth0" # Vérifier Hello timer
journalctl -u frr -n 50               # Logs FRRouting
```

### Causes fréquentes
- Hello/Dead timer mismatch (vérifier les 2 côtés du lien)
- MTU mismatch (désactiver avec ip ospf mtu-ignore)
- Problème d'authentification OSPF
```

**Livrables Portfolio attendus :**

```
Portfolio Semestre 2 — Réseau Multi-Sites BCC

□ Livrable 1 : Schéma d'architecture (Diagrams.net / draw.io)
  - Topologie physique et logique
  - Plan d'adressage IP complet
  - Flux de trafic par catégorie (RTGS, VoIP, Web)

□ Livrable 2 : Script de déploiement
  - deploy-network-kin.sh (Siège)
  - deploy-network-agence.sh (Agences)
  - Tests de validation post-déploiement

□ Livrable 3 : Rapport d'audit de sécurité périmétrique
  - Règles nftables documentées
  - Configuration WAF/Suricata
  - Résultats du test de pénétration (nmap, nikto)

□ Livrable 4 : Runbook opérationnel
  - Procédures P1 et P2
  - Contacts d'escalade
  - Schéma de supervision (Zabbix / netflow)

□ Livrable 5 : Rapport de supervision
  - Dashboard Grafana (screenshot)
  - Top 10 des consommateurs de bande passante
  - Rapport NetFlow d'une semaine
```

---

## 🏅 Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **Runbook** | Documentation opérationnelle des procédures d'intervention réseau/système |
| **RTO** | Recovery Time Objective — durée maximale d'interruption tolérable |
| **RPO** | Recovery Point Objective — perte de données maximale tolérable |
| **MTU** | Maximum Transmission Unit — taille maximale d'un paquet réseau |
| **PTP** | Point-to-Point — lien réseau dédié entre deux équipements |
| **VSAT** | Very Small Aperture Terminal — connexion satellite pour sites isolés |

---

## 🏋️ Exercices & Corrigés

**Exercice 1 :** Calculez le nombre total d'adresses utilisables dans le sous-réseau `10.100.1.0/30` utilisé pour un lien WAN point-à-point.

**Corrigé :** /30 → 4 adresses totales, 2 utilisables (10.100.1.1 = RTR-1, 10.100.1.2 = RTR-2). Les /30 sont les masques standard pour les liens WAN point-à-point.

**Exercice 2 :** Dans l'architecture présentée, pourquoi configure-t-on Area 1 en mode "Stub" ?

**Corrigé :** L'Area 1 (LAN des bâtiments du Siège) n'a qu'un seul chemin de sortie via l'ABR vers Area 0. En mode Stub, les LSA de type 5 (routes externes) ne sont pas propagées dans Area 1 — les routeurs de cette zone utilisent uniquement une route par défaut pour tout le trafic vers l'extérieur. Cela réduit la LSDB et simplifie la configuration des routeurs de la zone.

---

## ❓ Banque de Questions & Test du Jour

**Q1 :** Dans l'architecture multi-sites BCC, quel protocole assure la redondance de la passerelle par défaut pour les utilisateurs du LAN Siège ?
- A) OSPF
- B) BGP
- C) VRRP (keepalived)
- D) MPLS

**Réponse : C**

**Q2 :** La BCC dispose d'un lien MPLS 100 Mbps et d'un lien 4G 20 Mbps vers Internet. En SD-WAN, quel trafic doit être routé en priorité sur le lien MPLS ?
- A) Navigation Web et mises à jour OS
- B) Trafic RTGS et VoIP du Gouverneur (latence et QoS critiques)
- C) Backup des données la nuit
- D) Streaming des caméras de surveillance

**Réponse : B**

**Q3 :** Dans OSPF Multi-Area, quel est le rôle de l'ABR (Area Border Router) ?
- A) Injecter des routes BGP dans OSPF
- B) Interconnecter les zones non-backbone avec l'Area 0 et résumer les routes entre zones
- C) Servir de point d'accès Wi-Fi centralisé
- D) Gérer les sessions VPN entre les sites

**Réponse : B**

**Q4 :** Le script de déploiement `deploy-network-kin.sh` configure QoS avec DSCP 18 pour le trafic RTGS. À quelle classe AF correspond DSCP 18 ?
- A) EF (Expedited Forwarding) — VoIP
- B) AF21 (Assured Forwarding, Classe 2, Low Drop)
- C) BE (Best Effort)
- D) CS5 (Signalisation)

**Réponse : B** — DSCP 18 = AF21 (Assured Forwarding Classe 2, faible probabilité de drop).

**Q5 :** Dans le runbook, quelle est la première action à effectuer face à une perte d'adjacence OSPF ?
- A) Redémarrer immédiatement tous les routeurs
- B) Contacter l'opérateur WAN
- C) Diagnostiquer avec `show ip ospf neighbor` pour identifier le routeur concerné et l'état de ses liens
- D) Désactiver OSPF et passer en routage statique

**Réponse : C**

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
