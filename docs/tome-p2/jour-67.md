# TOME P2 — Réseaux & Télécoms — Jour 67 (6h) : Supervision Réseau — SNMPv3, NetFlow & IPFIX

> [!NOTE]
> **Objectif du jour :** Maîtriser la supervision réseau avec SNMPv3 (authentification et confidentialité), la collecte de flux NetFlow/IPFIX pour la cartographie du trafic, et l'utilisation d'outils de monitoring réseau (Zabbix, Grafana+Prometheus). Ces outils constituent le système nerveux de la surveillance d'une infrastructure bancaire.
>
> **Compétences visées :** `POL-03` (A) — Supervision & Monitoring | `BIT-04` (A) — Protocoles de Management Réseau

---

## 1) Module — SNMP : Simple Network Management Protocol (2h)

### 📖 Narration/Intuition

SNMP permet à une console de supervision centralisée d'interroger des équipements réseau (switches, routeurs, serveurs) et de recevoir leurs alertes (Traps). C'est comme un système de télémetrie : chaque équipement publie ses métriques (CPU, mémoire, trafic, erreurs d'interface) dans une base de données standardisée appelée **MIB (Management Information Base)**.

**SNMPv1 et v2c** transmettent les données en clair avec une simple "community string" — équivalent d'un mot de passe en texte clair. **SNMPv3** ajoute l'authentification (HMAC-MD5/SHA) et le chiffrement (AES) — **obligatoire en environnement bancaire.**

### 🔍 Anatomie Technique

**Architecture SNMP :**

```
Manager SNMP (NMS)                    Agents SNMP
(Serveur de supervision)              (Équipements à surveiller)
  ┌──────────────────┐                ┌────────────────┐
  │ Zabbix / Cacti / │                │ Switch Core    │
  │ LibreNMS         │                │ Routeur BCC    │
  │                  │── GET ─────────→│ Serveur Linux  │
  │                  │── GETNEXT ─────→│ Imprimante     │
  │                  │── SET ──────────→│ UPS            │
  │                  │←── TRAP ────────│                │
  └──────────────────┘  (alertes asynchrones)
       UDP 161 (manager polls agent)
       UDP 162 (traps de l'agent vers le manager)
```

**La MIB (Management Information Base) :**

```
La MIB est une base de données hiérarchique (arbre OID)
OID (Object Identifier) : chemin unique vers un objet administrable

Exemples d'OIDs standardisés :
1.3.6.1.2.1.1.1.0  = sysDescr      (description du système)
1.3.6.1.2.1.1.3.0  = sysUpTime     (temps depuis le dernier redémarrage)
1.3.6.1.2.1.2.1.0  = ifNumber      (nombre d'interfaces réseau)
1.3.6.1.2.1.2.2.1.10 = ifInOctets  (octets reçus par interface)
1.3.6.1.2.1.2.2.1.16 = ifOutOctets (octets envoyés par interface)
1.3.6.1.2.1.25.3.3.1.2 = hrProcessorLoad (charge CPU %)

Notation humaine : .iso.org.dod.internet.mgmt.mib-2.interfaces...
```

**Configuration SNMPv3 sous Linux :**

```bash
# Installation snmpd (agent SNMP)
apt install snmpd snmp libsnmp-dev

# ─── Configuration /etc/snmp/snmpd.conf ───────────────────────────────────────
cat > /etc/snmp/snmpd.conf << 'EOF'
# Écouter sur toutes les interfaces (UDP 161)
agentaddress udp:161,udp6:161

# Désactiver SNMPv1/v2c (non sécurisé) - en commentant toute community string
# rocommunity public  ← NE PAS METTRE EN PROD

# Créer un utilisateur SNMPv3 avec authPriv (auth + chiffrement)
# Niveau de sécurité : noAuthNoPriv < authNoPriv < authPriv
createUser bccMonitor SHA-256 "MotDePasseAuth256!" AES "MotDePassePriv256!"

# Accorder l'accès en lecture seule à cet utilisateur
rouser bccMonitor priv -V systemview

# Vue : définir ce qui est accessible
view   systemview  included  .1.3.6.1.2.1    # MIB-2 complète
view   systemview  included  .1.3.6.1.4.1    # MIBs entreprise

# Autoriser uniquement le serveur de supervision
agentaddress udp:161

# Trap vers le manager (pour les alertes)
trapsink 10.0.10.200 bccMonitor        # SNMPv1 trap (heritage)
trap2sink 10.0.10.200 bccMonitor       # SNMPv2 trap
informsink 10.0.10.200 bccMonitor      # SNMPv3 inform (avec confirmation)
EOF

systemctl restart snmpd

# ─── Tests depuis le manager ───────────────────────────────────────────────────
# Interroger un OID spécifique avec SNMPv3 authPriv
snmpget -v3 -u bccMonitor \
    -l authPriv \
    -a SHA-256 -A "MotDePasseAuth256!" \
    -x AES -X "MotDePassePriv256!" \
    10.0.10.1 1.3.6.1.2.1.1.1.0    # sysDescr

# Parcourir toute la MIB interfaces
snmpwalk -v3 -u bccMonitor -l authPriv \
    -a SHA -A "MotDePasseAuth256!" \
    -x AES -X "MotDePassePriv256!" \
    10.0.10.1 1.3.6.1.2.1.2

# Récupérer le trafic sur l'interface eth0 (ifIndex 1)
snmpget -v3 -u bccMonitor -l authPriv \
    -a SHA -A "MotDePasseAuth256!" \
    -x AES -X "MotDePassePriv256!" \
    10.0.10.1 ifInOctets.1 ifOutOctets.1
```

---

## 2) Module — NetFlow & IPFIX : Analyse des Flux Réseau (2h)

### 📖 Narration/Intuition

SNMP donne des compteurs agrégés (total de bytes). **NetFlow** donne la granularité des **flux** : "entre 14h30 et 14h35, l'IP 192.168.1.50 a transféré 450 MB vers l'IP externe 203.0.113.5 sur le port TCP 443." Cette visibilité est essentielle pour détecter des exfiltrations de données, des malwares, ou des pics de trafic anormaux.

**IPFIX** (IP Flow Information Export, RFC 7011) est le standard IETF basé sur NetFlow v9 — c'est le format moderne recommandé.

### 🔍 Anatomie Technique

**Architecture de collecte NetFlow/IPFIX :**

```
Équipements réseau (Exportateurs)           Collecteur & Analyseur
┌─────────────────────────────┐             ┌──────────────────────┐
│ Routeur Linux (softflowd)   │             │ ntopng               │
│ Switch (NetFlow activé)     │──── UDP ────→│ nfdump               │
│ Serveur Linux (fprobe)      │  port 2055  │ Grafana + Prometheus  │
└─────────────────────────────┘             │ ELK Stack             │
                                             └──────────────────────┘

Un "flux" NetFlow contient :
- IP source et destination
- Port source et destination
- Protocole (TCP/UDP/ICMP)
- Timestamps (début et fin du flux)
- Bytes et paquets échangés
- Flags TCP (SYN, ACK, FIN, RST)
- Interface d'entrée/sortie
```

**Déploiement de softflowd (exportateur NetFlow Linux) :**

```bash
# Installation
apt install softflowd nfdump

# Démarrer softflowd sur l'interface eth0
softflowd -i eth0 \
    -n 10.0.10.200:2055 \   # Envoyer les flows vers le collecteur
    -v 10 \                  # NetFlow version 10 (= IPFIX)
    -t maxlife=300           # Expirer les flows après 5 minutes

# Configurer softflowd comme service systemd
cat > /etc/systemd/system/softflowd.service << 'EOF'
[Unit]
Description=softflowd NetFlow Exporter
After=network.target

[Service]
ExecStart=/usr/sbin/softflowd -i eth0 -n 10.0.10.200:2055 -v 10
Restart=always

[Install]
WantedBy=multi-user.target
EOF
systemctl enable --now softflowd
```

**Collecte et analyse avec nfdump :**

```bash
# nfcapd : démon collecteur NetFlow (écoute sur UDP 2055)
mkdir -p /var/flows
nfcapd -w -D -l /var/flows/ -p 2055

# nfdump : analyse des fichiers de flow
# Afficher les flows du dernière heure
nfdump -R /var/flows/2024/08/06 -s srcip/bytes -n 20

# Top 20 destinations par bytes (détection d'exfiltration)
nfdump -R /var/flows/ \
    -s dstip/bytes \
    -n 20 \
    -o "fmt:%ts %td %sa %da %sp %dp %pr %byt"

# Flux d'une IP spécifique sur les 2 dernières heures
nfdump -R /var/flows/ \
    -t "2024-08-06.06:00:00-2024-08-06.08:00:00" \
    'src ip 192.168.1.100' \
    -o extended

# Filtres nfdump (similaires à tcpdump BPF)
nfdump -R /var/flows/ 'proto tcp and dstport 443'
nfdump -R /var/flows/ 'dst net 10.0.0.0/8'

# Statistiques de trafic
nfdump -R /var/flows/ -s proto/bytes -n 10     # Top protocoles
nfdump -R /var/flows/ -s srcip/flows -n 10    # Top IPs par nombre de flux
```

**ntopng — Dashboard de supervision de flux :**

```bash
# Installation ntopng (interface web pour visualisation NetFlow)
apt install ntopng

# Configuration de base
cat > /etc/ntopng/ntopng.conf << 'EOF'
-G=/var/run/ntopng.pid
-i=eth0              # Interface à surveiller (mode live)
# ou
-i=udp://localhost:2055  # Recevoir les flows NetFlow/IPFIX
-w=3000              # Port web (http://localhost:3000)
--community          # Édition communautaire (gratuite)
EOF

systemctl enable --now ntopng
# Interface web : http://10.0.10.200:3000 (admin/admin par défaut → CHANGER !)
```

---

## 3) Module — Alertes SNMP & Supervision Proactive (2h)

### 📖 Narration/Intuition

La supervision proactive ne consiste pas à attendre qu'une panne survienne pour réagir — elle anticipe les problèmes. En configurant des seuils d'alerte (CPU > 80%, lien saturé > 90%, espace disque < 20%), le SOC de la BCC reçoit des alertes AVANT que l'impact soit visible pour les utilisateurs.

### 🔍 Anatomie Technique

**Envoi de Traps SNMP depuis Linux :**

```bash
# Envoyer un trap SNMP vers le manager (test)
snmptrap -v3 \
    -u bccMonitor \
    -l authPriv \
    -a SHA -A "MotDePasseAuth256!" \
    -x AES -X "MotDePassePriv256!" \
    10.0.10.200 \          # Destination (manager)
    '' \                   # Entreprise OID
    1.3.6.1.6.3.1.1.5.4  # linkDown trap (interface tombée)

# Configuration snmptrapd (récepteur de traps côté manager)
cat > /etc/snmp/snmptrapd.conf << 'EOF'
authCommunity log,execute,net public
traphandle default /usr/bin/logger -t snmptrap
createUser -e 0x8000000001020304 bccMonitor SHA "MotDePasseAuth256!" AES "MotDePassePriv256!"
authUser log,execute bccMonitor
EOF
systemctl enable --now snmptrapd
tail -f /var/log/syslog | grep snmptrap
```

**Intégration avec Zabbix (supervision unifiée) :**

```bash
# Zabbix agent sur les serveurs supervisés
apt install zabbix-agent

cat > /etc/zabbix/zabbix_agentd.conf << 'EOF'
Server=10.0.10.200         # IP du serveur Zabbix
ServerActive=10.0.10.200   # Pour les checks actifs
Hostname=routeur-bcc-siege  # Nom unique dans Zabbix
EOF
systemctl enable --now zabbix-agent

# Templates Zabbix disponibles :
# - Template Net: Linux Network Interfaces SNMP
# - Template OS: Linux by Zabbix agent
# - Template Net: Generic SNMP
# Accessible depuis l'interface web Zabbix
```

---

## 🏅 Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **SNMP** | Simple Network Management Protocol — protocole de supervision réseau |
| **MIB** | Management Information Base — base de données des objets SNMP |
| **OID** | Object Identifier — identifiant unique d'un objet dans la MIB |
| **NMS** | Network Management System — système centralisé de supervision réseau |
| **NetFlow** | Protocole Cisco d'export de données de flux réseau |
| **IPFIX** | IP Flow Information Export — standard IETF (RFC 7011), successeur NetFlow v9 |
| **Trap** | Alerte asynchrone envoyée par un agent SNMP vers le manager |
| **Inform** | Trap avec accusé de réception (SNMPv2/v3 uniquement) |
| **NTP** | Network Time Protocol — synchronisation de l'horloge réseau (UDP 123) |

---

## 🏋️ Exercices & Corrigés

**Exercice 1 :** Quelle commande nfdump permet d'identifier le top 10 des IPs sources générant le plus de bytes vers l'extérieur (réseau non-RFC1918) ?

**Corrigé :**
```bash
nfdump -R /var/flows/ \
    'src net not 10.0.0.0/8 and src net not 192.168.0.0/16 and src net not 172.16.0.0/12' \
    -s srcip/bytes -n 10
# Ou plus simplement : filtrer la destination non-RFC1918
nfdump -R /var/flows/ 'dst net not 10.0.0.0/8' -s srcip/bytes -n 10
```

**Exercice 2 :** Expliquez pourquoi il faut passer de SNMPv2c à SNMPv3 dans un environnement bancaire.

**Corrigé :** SNMPv2c transmet les données et la community string (mot de passe) en **texte clair non chiffré**. Un attaquant qui capture le trafic réseau peut voir la community string et l'utiliser pour lire la configuration de tous les équipements, voire les modifier (community en écriture). SNMPv3 avec `authPriv` utilise **SHA pour l'authentification** et **AES pour le chiffrement** — les données et les identifiants sont protégés.

---

## ❓ Banque de Questions & Test du Jour

**Q1 :** Sur quel port UDP les agents SNMP écoutent-ils les requêtes du manager ?
- A) UDP 53
- B) UDP 162
- C) UDP 161
- D) TCP 8080

**Réponse : C** — UDP 162 est utilisé pour les Traps (alertes de l'agent vers le manager).

**Q2 :** Quelle est la différence entre un SNMP Trap et un SNMP Inform ?
- A) Les Traps sont chiffrés, les Informs non
- B) Les Informs attendent un accusé de réception du manager, les Traps sont en "fire and forget"
- C) Les Traps supportent SNMPv3, les Informs uniquement SNMPv1
- D) Les Informs sont uniquement utilisés pour les erreurs critiques

**Réponse : B**

**Q3 :** NetFlow enregistre des informations de flux réseau. Quelle information N'EST PAS incluse dans un flow NetFlow ?
- A) IP source et destination
- B) Port source et destination
- C) Contenu des paquets (payload)
- D) Bytes et paquets échangés

**Réponse : C** — NetFlow est une métadonnée de flux, pas une capture complète. Il ne capture pas le contenu des paquets (comme le ferait Wireshark).

**Q4 :** Un flow NetFlow montre 500 MB transférés depuis 192.168.1.100 vers 203.0.113.5:443 en 5 minutes à 2h du matin. Quel est le risque potentiel ?
- A) Une mise à jour système normale
- B) Un utilisateur qui télécharge des films
- C) Une potentielle exfiltration de données vers un serveur externe
- D) Un backup automatique — comportement normal

**Réponse : C** — 500 MB à 2h du matin vers une IP externe sur HTTPS mérite une investigation (IoC d'exfiltration).

**Q5 :** La commande `snmpwalk -v3 -l authPriv` indique que la session SNMPv3 utilise :
- A) Authentification seulement (authNoPriv)
- B) Aucune authentification ni chiffrement (noAuthNoPriv)
- C) Authentification ET chiffrement (authPriv = niveau de sécurité maximum)
- D) Chiffrement sans authentification

**Réponse : C**

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
