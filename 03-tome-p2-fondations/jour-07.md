# TOME P2 — Jour 07 (12h) : Réseaux TCP/IP — Comment les Ordinateurs se Parlent

> [!NOTE]
> **Objectif de la journée** : Comprendre le fonctionnement interne d'un réseau informatique depuis la prise murale jusqu'à Internet. À la fin de ce cours, vous saurez lire une adresse IP, calculer un sous-réseau, configurer DNS et DHCP, et diagnostiquer n'importe quelle panne réseau comme un ingénieur réseau senior.

---

## 1) Le Modèle OSI : La Carte Architecturale des Réseaux (2h)

### 📖 1.1 Pourquoi un Modèle par Couches ?

Quand vous envoyez un email, il ne voyage pas d'un coup. Comme un colis postal, il passe par plusieurs étapes : emballage, étiquetage, transport, livraison. Le **modèle OSI** (Open Systems Interconnection) découpe ce voyage en **7 couches standardisées**.

| Couche | Nom | Rôle | Exemple concret |
|--------|-----|------|-----------------|
| 7 | **Application** | Interface utilisateur | HTTP, SMTP, FTP |
| 6 | **Présentation** | Encodage/Chiffrement | SSL/TLS, JPEG |
| 5 | **Session** | Gestion des sessions | Cookies, RPC |
| 4 | **Transport** | Fiabilité, Ports | **TCP, UDP** |
| 3 | **Réseau** | Adressage, Routage | **IP, ICMP** |
| 2 | **Liaison** | Accès au medium | **Ethernet, Wi-Fi, MAC** |
| 1 | **Physique** | Signal électrique | Câble RJ45, Fibre, Wi-Fi |

> [!TIP]
> **Mnémotechnique** (de bas en haut) : **P**our **L**e **R**éseau **T**out **S**emble **P**lus **A**isé → Physique, Liaison, Réseau, Transport, Session, Présentation, Application

---

## 2) L'Adressage IP : L'Identité Réseau de chaque Machine (3h)

### 📖 2.1 C'est quoi une Adresse IP ?

Chaque appareil connecté à un réseau possède une **adresse IP** — son identifiant unique sur le réseau, comparable à une adresse postale.

Une adresse IPv4 se compose de **4 nombres de 0 à 255** séparés par des points :
```
192.168.1.100
   ↑   ↑  ↑  ↑
   |   |  |  └── Identifiant de la machine (host)
   |   |  └───── Sous-réseau
   |   └──────── Réseau privé local
   └──────────── Réseau privé local
```

### 🔍 2.2 Classes d'Adresses et Plages Privées

| Plage | Utilisation |
|-------|------------|
| `192.168.0.0 – 192.168.255.255` | Réseaux domestiques et PME |
| `172.16.0.0 – 172.31.255.255` | Réseaux d'entreprise moyens |
| `10.0.0.0 – 10.255.255.255` | Grands réseaux d'entreprise |
| `127.0.0.1` | Loopback — l'ordinateur lui-même (test local) |

### 🛠️ 2.3 Diagnostiquer avec les Outils Réseau Essentiels

```bash
# Afficher la configuration réseau complète
ipconfig /all        # Windows
ip addr show         # Linux (ou ifconfig)

# Tester la connectivité vers une machine
ping 8.8.8.8                # Ping vers DNS Google (test Internet)
ping 192.168.1.1            # Ping vers la passerelle (test réseau local)

# Tracer le chemin des paquets à travers les routeurs
tracert google.com           # Windows
traceroute google.com        # Linux

# Résoudre un nom de domaine en adresse IP
nslookup bcc.cd             # Windows
dig bcc.cd                  # Linux
```

---

## 3) DHCP & DNS : Les Services Réseau Fondamentaux (3h)

### 📖 3.1 DHCP : L'Attribution Automatique d'Adresses

Sans DHCP, il faudrait configurer manuellement l'adresse IP de chaque ordinateur de la BCC. Le **DHCP** (Dynamic Host Configuration Protocol) automatise cette attribution.

**Processus DORA** :
1. **D**iscover : L'ordinateur crie sur le réseau *"Y a-t-il un serveur DHCP ?"*
2. **O**ffer : Le serveur DHCP répond *"Oui ! Je t'offre l'IP 192.168.1.105"*
3. **R**equest : L'ordinateur accepte *"D'accord, je prends le 192.168.1.105"*
4. **A**cknowledge : Le serveur confirme et note le bail (lease)

```bash
# Renouveler l'adresse IP manuellement (Windows)
ipconfig /release    # Libérer l'IP actuelle
ipconfig /renew      # Demander une nouvelle IP au DHCP

# Linux
sudo dhclient -r eth0   # Libérer
sudo dhclient eth0      # Renouveler
```

### 📖 3.2 DNS : L'Annuaire du Internet

Le **DNS** (Domain Name System) traduit les noms lisibles par l'humain (`www.bcc.cd`) en adresses IP (`197.239.4.105`) compréhensibles par les machines.

**Processus de résolution DNS** :
```
Vous tapez : www.bcc.cd
    ↓
Votre PC consulte son cache local DNS
    ↓ (si non trouvé)
Serveur DNS local (192.168.1.1)
    ↓ (si non trouvé)
Serveurs DNS racine (13 serveurs mondiaux)
    ↓
Serveurs DNS autoritaires pour .cd
    ↓
Réponse : www.bcc.cd = 197.239.4.105
```

---

## 🏋️ Exercices Pratiques & Corrigés

### Exercice 1 : Diagnostic Réseau
Un agent vous dit *"Je n'ai pas Internet"*. Listez les 5 commandes exactes à taper dans l'ordre pour diagnostiquer le problème.
- **Corrigé** :
  ```bash
  ping 127.0.0.1        # 1. Tester la pile TCP/IP locale
  ipconfig /all          # 2. Vérifier l'adresse IP (APIPA = problème DHCP)
  ping 192.168.1.1       # 3. Tester la passerelle (gateway)
  ping 8.8.8.8           # 4. Tester la connectivité Internet (DNS Google)
  nslookup google.com    # 5. Tester la résolution DNS
  ```

---

## ❓ Banque de Questions & Test du Jour 07

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
