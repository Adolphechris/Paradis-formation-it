# TOME P2 — Réseaux & Télécoms — Jour 66 (6h) : Diagnostics Réseau Avancés & Forensique avec Wireshark/TShark

> [!NOTE]
> **Objectif du jour :** Maîtriser l'analyse approfondie de captures réseau avec Wireshark et TShark : filtres d'affichage et de capture avancés, analyse de flux TCP (retransmissions, RST, Zero Window), détection d'anomalies et techniques de forensique réseau pour l'investigation d'incidents.
>
> **Compétences visées :** `BIT-04` (A) — Diagnostics Réseau | `SEC-04` (A) — Forensique Réseau

---

## 1) Module — Capture & Filtres Wireshark Avancés (2h)

### 📖 Narration/Intuition

Wireshark est le microscope du réseau. Tout comme un pathologiste analyse des échantillons cellulaires pour diagnostiquer une maladie, un analyste réseau examine les trames packet par packet pour comprendre ce qui se passe réellement sur le câble. Dans un contexte bancaire, cette compétence permet d'investiguer des incidents de sécurité, diagnostiquer des problèmes de performance, et constituer des preuves numériques.

### 🔍 Anatomie Technique

**TShark — Wireshark en ligne de commande :**

```bash
# Installation
apt install tshark

# Capture basique (interface eth0, 100 paquets)
tshark -i eth0 -c 100

# Sauvegarder la capture dans un fichier .pcap
tshark -i eth0 -w /tmp/capture_bcc.pcap

# Lire un fichier de capture existant
tshark -r /tmp/capture_bcc.pcap

# Capture avec filtre de capture BPF (Berkeley Packet Filter)
# Filtres BPF sont appliqués au niveau du kernel — très performants
tshark -i eth0 -f "tcp port 443"                    # HTTPS uniquement
tshark -i eth0 -f "host 192.168.1.1"               # Trafic vers/depuis cette IP
tshark -i eth0 -f "net 192.168.100.0/24"            # Tout un sous-réseau
tshark -i eth0 -f "port 53"                         # DNS uniquement
tshark -i eth0 -f "not port 22 and not arp"        # Exclure SSH et ARP

# Capture multi-interfaces et rotation de fichiers
tshark -i eth0 -i eth1 \
    -w /tmp/capture.pcap \
    -b filesize:102400 \    # Nouveau fichier tous les 100 MB
    -b files:10             # Garder seulement les 10 derniers fichiers
```

**Filtres d'affichage Wireshark (display filters) :**

```bash
# ATTENTION : Les filtres d'affichage (display filters) sont différents des filtres de capture BPF
# Ils sont appliqués APRÈS la capture (plus flexibles, mais moins performants)

# Filtres par protocole
tshark -r capture.pcap -Y "tcp"
tshark -r capture.pcap -Y "dns"
tshark -r capture.pcap -Y "http or https"
tshark -r capture.pcap -Y "ospf"
tshark -r capture.pcap -Y "bgp"

# Filtres par IP
tshark -r capture.pcap -Y "ip.src == 192.168.1.100"
tshark -r capture.pcap -Y "ip.dst == 10.0.0.1"
tshark -r capture.pcap -Y "ip.addr == 192.168.1.1"   # Source OU destination

# Filtres par port
tshark -r capture.pcap -Y "tcp.port == 443"
tshark -r capture.pcap -Y "udp.dstport == 53"

# Filtres de flags TCP (analyse de comportement)
tshark -r capture.pcap -Y "tcp.flags.syn == 1 and tcp.flags.ack == 0"  # SYN sans ACK (début connexion)
tshark -r capture.pcap -Y "tcp.flags.rst == 1"        # Paquets RST (réinitialisation)
tshark -r capture.pcap -Y "tcp.flags.fin == 1"        # Paquets FIN (fermeture propre)
tshark -r capture.pcap -Y "tcp.analysis.retransmission"  # Retransmissions
tshark -r capture.pcap -Y "tcp.analysis.zero_window"     # Fenêtre TCP à zéro (congestion)

# Filtres HTTP (analyse de requêtes web)
tshark -r capture.pcap -Y "http.request.method == POST"
tshark -r capture.pcap -Y "http.response.code >= 400"   # Erreurs HTTP
tshark -r capture.pcap -Y 'http.host contains "bcc.cd"'

# Combiner les filtres
tshark -r capture.pcap -Y "ip.src == 192.168.1.100 and tcp.port == 443 and tcp.analysis.retransmission"
```

**Extraction d'informations avec TShark (-T fields) :**

```bash
# Extraire des champs spécifiques en format texte
# Format CSV des connexions TCP établies
tshark -r capture.pcap \
    -Y "tcp.flags.syn==1 && tcp.flags.ack==0" \
    -T fields \
    -e frame.number \
    -e frame.time \
    -e ip.src \
    -e ip.dst \
    -e tcp.dstport \
    -E separator=, -E header=y \
    > connexions_tcp.csv

# Extraire les requêtes DNS
tshark -r capture.pcap \
    -Y "dns.flags.response == 0" \
    -T fields \
    -e frame.time \
    -e ip.src \
    -e dns.qry.name \
    -e dns.qry.type

# Statistiques de conversations (top IPs)
tshark -r capture.pcap -q -z conv,ip
tshark -r capture.pcap -q -z conv,tcp
tshark -r capture.pcap -q -z io,stat,1   # Bytes/s par intervalle de 1 seconde

# Top protocoles utilisés
tshark -r capture.pcap -q -z io,phs
```

---

## 2) Module — Analyse TCP Avancée & Détection d'Anomalies (2h)

### 📖 Narration/Intuition

L'analyse TCP approfondie révèle les problèmes de performance et les comportements suspects. Une rafale de paquets RST peut indiquer un scan de ports. Des retransmissions excessives indiquent des problèmes de qualité de lien. Un Zero Window indique une saturation côté application. Ces signaux permettent de diagnostiquer précisément les pannes.

### 🔍 Anatomie Technique

**Anatomie d'un flux TCP — Établissement et fermeture :**

```
Three-Way Handshake (Établissement TCP) :
Client                    Serveur
  │── SYN (seq=1000) ────────→│  Client propose numéro de séquence
  │←── SYN-ACK (seq=5000,ack=1001)─│  Serveur répond avec son séquence + ack
  │── ACK (ack=5001) ──────────→│  Client confirme → Connexion ÉTABLIE

Four-Way Teardown (Fermeture propre TCP) :
  │── FIN (seq=X) ─────────────→│  Un côté initie la fermeture
  │←── ACK (ack=X+1) ──────────│  L'autre accuse réception
  │←── FIN (seq=Y) ────────────│  L'autre côté ferme sa moitié
  │── ACK (ack=Y+1) ─────────→│  Confirmation finale → Connexion FERMÉE

RST (Réinitialisation abrupte) :
  → Port fermé ou refus de connexion
  → Connexion interrompue brutalement (firewall, crash applicatif)
  → Outil de scan : nmap -sS génère des SYN et analyse les SYN-ACK vs RST
```

**Indicateurs de problèmes TCP — forensique réseau :**

```bash
# 1. RETRANSMISSIONS : signes de perte de paquets / latence élevée
tshark -r capture.pcap -Y "tcp.analysis.retransmission" -T fields \
    -e frame.time -e ip.src -e ip.dst -e tcp.seq -e tcp.analysis.rto
# RTO (Retransmission Timeout) élevé = latence élevée sur le lien

# 2. ZERO WINDOW : buffer de réception plein (saturation applicative)
tshark -r capture.pcap -Y "tcp.analysis.zero_window" -T fields \
    -e frame.time -e ip.src -e ip.dst
# → L'application destinataire n'arrive pas à consommer les données assez vite

# 3. WINDOW SCALING : débit théorique max du flux
tshark -r capture.pcap -Y "tcp.options.wscale" -T fields \
    -e frame.time -e ip.src -e tcp.window_size -e tcp.options.wscale.multiplier

# 4. DUPLICATE ACK / FAST RETRANSMIT
tshark -r capture.pcap -Y "tcp.analysis.duplicate_ack"
# 3 ACKs dupliqués → Fast Retransmit (TCP détecte perte sans attendre timeout)

# 5. LATENCE (RTT) par flux
tshark -r capture.pcap -q -z tcp,rtt,ip.addr==192.168.1.100
```

**Détection de comportements suspects :**

```bash
# Détection de scan de ports (SYN sans SYN-ACK en réponse)
tshark -r capture.pcap \
    -Y "tcp.flags.syn==1 and tcp.flags.ack==0" \
    -T fields -e ip.src -e ip.dst -e tcp.dstport | \
    sort | uniq -c | sort -rn | head -20
# Une IP avec des centaines de connexions SYN vers différents ports = scan !

# Détection d'exfiltration de données (gros flux sortants vers l'extérieur)
tshark -r capture.pcap -q -z conv,tcp | \
    awk '$1 ~ /[0-9]+\.[0-9]+/ {print $0}' | \
    sort -k 11 -rn | head -20
# Trier par bytes envoyés (colonne 11) — identifier les flux les plus volumineux

# Détection de beacon malware (connexions régulières et périodiques vers C2)
tshark -r capture.pcap -Y "ip.dst == 203.0.113.1" \
    -T fields -e frame.time -e tcp.dstport
# Pattern régulier toutes les 60 secondes = comportement beacon typique de malware

# Extraction des certificats SSL (pour analyse d'un MITM)
tshark -r capture.pcap \
    -Y "ssl.handshake.certificate" \
    -T fields \
    -e x509sat.uTF8String \
    -e x509ce.generalName \
    -e ssl.handshake.certificate
```

---

## 3) Module — Forensique Réseau & Reconstruction de Flux (2h)

### 📖 Narration/Intuition

La **forensique réseau** (Network Forensics) consiste à analyser des captures réseau pour reconstituer la chronologie d'un incident, identifier un attaquant, et préserver des preuves numériques légalement admissibles. Chaque byte dans une capture pcap est une preuve potentielle.

### 🔍 Anatomie Technique

**Reconstruction de flux et extraction de fichiers :**

```bash
# tcpflow : reconstituer des flux TCP en fichiers texte
apt install tcpflow

tcpflow -r capture.pcap -o /tmp/flux_tcp/
ls /tmp/flux_tcp/    # Un fichier par flux TCP bidirectionnel

# Extraction de fichiers transférés (HTTP, FTP) avec NetworkMiner
# (outil graphique Linux/Windows pour la forensique réseau)
apt install networkminer

# Alternative CLI avec Zeek (ancien Bro) — analyse comportementale
apt install zeek
zeek -r capture.pcap local
ls -la *.log    # conn.log, dns.log, http.log, ssl.log, files.log...

# Analyser le fichier conn.log (connexions)
cat conn.log | zeek-cut -d '\t' ts id.orig_h id.resp_h id.resp_p proto duration bytes_sent

# Analyser les requêtes DNS (détection de DNS tunneling)
cat dns.log | zeek-cut query qtype_name answers | sort | uniq -c | sort -rn | head -20
# Requêtes DNS vers des domaines longs et aléatoires = DNS tunneling possible

# Extraction de hash MD5 de fichiers transférés
cat files.log | zeek-cut md5 filename mime_type
```

**Script Python d'analyse de pcap (Scapy) :**

```python
#!/usr/bin/env python3
"""Analyseur de capture réseau pour investigation d'incident."""
from scapy.all import rdpcap, TCP, IP, UDP, DNS, DNSQR
from collections import Counter
import sys

def analyser_capture(fichier_pcap):
    """Analyse une capture réseau et produit un rapport d'investigation."""
    print(f"[+] Lecture de {fichier_pcap}...")
    paquets = rdpcap(fichier_pcap)
    
    # Compteurs
    connexions_tcp = Counter()
    requetes_dns = Counter()
    ips_sources = Counter()
    
    for paquet in paquets:
        if IP in paquet:
            ips_sources[paquet[IP].src] += 1
            
            if TCP in paquet:
                # Détecter les SYN (tentatives de connexion)
                if paquet[TCP].flags == 0x02:  # SYN
                    cible = f"{paquet[IP].dst}:{paquet[TCP].dport}"
                    connexions_tcp[cible] += 1
            
            if UDP in paquet and DNS in paquet:
                # Collecter les requêtes DNS
                if DNSQR in paquet:
                    domaine = paquet[DNSQR].qname.decode('utf-8', errors='replace')
                    requetes_dns[domaine] += 1
    
    # Rapport
    print(f"\n[ANALYSE] Total paquets: {len(paquets)}")
    
    print(f"\n[TOP 10 IPs sources]")
    for ip, count in ips_sources.most_common(10):
        print(f"  {ip:20s} : {count:6d} paquets")
    
    print(f"\n[TOP 10 Destinations TCP SYN] (scan de ports potentiel)")
    for dest, count in connexions_tcp.most_common(10):
        if count > 5:
            print(f"  {dest:30s} : {count:4d} SYN {'← SUSPECT' if count > 50 else ''}")
    
    print(f"\n[TOP 10 Requêtes DNS]")
    for domaine, count in requetes_dns.most_common(10):
        longueur = len(domaine.rstrip('.'))
        alerte = "← DNS TUNNELING ?" if longueur > 50 else ""
        print(f"  {domaine:50s} : {count:3d} requêtes {alerte}")

if __name__ == "__main__":
    cible = sys.argv[1] if len(sys.argv) > 1 else "capture.pcap"
    analyser_capture(cible)
```

---

## 🏅 Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **pcap** | Packet Capture — format de fichier de capture réseau |
| **BPF** | Berkeley Packet Filter — filtre de capture au niveau kernel Linux |
| **RTT** | Round-Trip Time — temps d'aller-retour réseau |
| **RTO** | Retransmission Timeout — délai avant retransmission TCP |
| **RST** | Reset — flag TCP indiquant une réinitialisation de connexion |
| **C2** | Command & Control — infrastructure de contrôle des malwares |
| **DNSQR** | DNS Query Record — enregistrement de requête DNS |
| **SAN** | Subject Alternative Name — extension X.509 pour les domaines alternatifs |
| **DFIR** | Digital Forensics and Incident Response — forensique numérique et réponse à incident |

---

## 🏋️ Exercices & Corrigés

**Exercice 1 :** Écrivez la commande TShark qui extrait, depuis `capture.pcap`, toutes les requêtes DNS vers des domaines contenant plus de 40 caractères (potentiel DNS tunneling).

**Corrigé :**
```bash
tshark -r capture.pcap -Y 'dns.flags.response==0' \
    -T fields -e frame.time -e ip.src -e dns.qry.name | \
    awk 'length($3) > 40 {print $0}'
```

**Exercice 2 :** Qu'indique un flux TCP avec de nombreux paquets "TCP ZeroWindow" ?

**Corrigé :** Le buffer de réception de l'application destinataire est plein — elle n'arrive pas à traiter les données aussi vite qu'elles arrivent. Cela peut indiquer : une application lente, une surcharge CPU côté serveur, ou une connexion base de données lente. Le zéro window **ne traduit pas** un problème de réseau mais un problème applicatif.

---

## ❓ Banque de Questions & Test du Jour

**Q1 :** Quelle est la différence entre un filtre de capture BPF et un filtre d'affichage Wireshark ?
- A) Les deux filtres sont identiques et interchangeables
- B) BPF est appliqué au niveau kernel avant la capture (plus efficace) ; les filtres d'affichage sont appliqués après la capture sur les données déjà en mémoire
- C) Les filtres d'affichage sont plus performants car ils utilisent le GPU
- D) BPF ne fonctionne que sur les interfaces physiques, pas les virtuelles

**Réponse : B**

**Q2 :** Un analyste observe 500 paquets SYN depuis la même IP vers 500 ports différents en 2 secondes. Quel comportement est-ce ?
- A) Une connexion HTTP normale
- B) Un scan de ports TCP SYN (probable outil nmap -sS)
- C) Une tentative d'authentification SSH
- D) Un trafic BGP normal

**Réponse : B**

**Q3 :** Que signifie TCP "Zero Window" dans une capture Wireshark ?
- A) Le pare-feu a bloqué la connexion
- B) La connexion est sur le point de se fermer proprement (FIN)
- C) Le buffer de réception du destinataire est plein — il ne peut plus accepter de données
- D) Le lien réseau est saturé à 0% de capacité

**Réponse : C**

**Q4 :** La commande `tshark -r cap.pcap -q -z conv,tcp` affiche :
- A) Les statistiques de conversations TCP (IP source, IP dest, ports, bytes échangés)
- B) Seulement les paquets TCP avec le flag PUSH
- C) La liste des erreurs TCP dans la capture
- D) Le RTT moyen de toutes les connexions

**Réponse : A**

**Q5 :** Dans la forensique réseau, pourquoi est-il important de préserver le fichier pcap original sans le modifier ?
- A) Pour économiser de l'espace disque
- B) Pour accélérer l'analyse avec Wireshark
- C) Pour garantir l'intégrité des preuves numériques — toute modification invalide l'admissibilité légale
- D) Wireshark ne peut ouvrir que des fichiers pcap non modifiés

**Réponse : C**

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
