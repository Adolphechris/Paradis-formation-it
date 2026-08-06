# TOME P2 — Réseaux & Télécoms — Jour 69 (6h) : Sécurité du Périmètre Réseau & Bastion

> [!NOTE]
> **Objectif du jour :** Concevoir et déployer une architecture de sécurité périmétrique multi-niveaux : DMZ, pare-feu NGFW (Next-Generation Firewall), inspection SSL/TLS, et bastions d'administration (jump servers). Ces contrôles constituent la frontière entre le réseau interne sécurisé de la BCC et le monde extérieur.
>
> **Compétences visées :** `SEC-04` (A) — Sécurité du Périmètre Réseau

---

## 1) Module — Architecture DMZ Multi-Niveaux (2h)

### 📖 Narration/Intuition

La **DMZ (Demilitarized Zone)** est une zone réseau intermédiaire entre Internet et le réseau interne. Les serveurs accessibles depuis l'extérieur (web, mail, DNS) y sont placés : s'ils sont compromis, l'attaquant est bloqué dans la DMZ et ne peut pas atteindre directement les serveurs internes critiques (bases de données, SWIFT, RTGS).

Une **architecture DMZ à 2 pare-feux** (recommandée pour une banque centrale) crée deux périmètres de sécurité distinctes : le pare-feu externe filtre Internet → DMZ, le pare-feu interne filtre DMZ → LAN interne.

### 🔍 Anatomie Technique

**Architecture DMZ à double pare-feu :**

```
Internet
    │
┌───▼────────────────────────────────────────────────────────┐
│  PARE-FEU EXTERNE (FW-EXT)                                 │
│  - Bloque tout sauf les services exposés (80, 443, 25, 53) │
│  - IPS/IDS activé                                          │
│  - Anti-DDoS / Rate limiting                               │
└───┬────────────────────────────────────────────────────────┘
    │
    │   ╔══════════════════════════════════════════╗
    │   ║  ZONE DMZ (vlan 200 - 10.0.200.0/24)    ║
    │   ║  - Serveur Web BCC (10.0.200.10)         ║
    │   ║  - Serveur Mail (10.0.200.20)            ║
    │   ║  - Reverse Proxy / WAF (10.0.200.5)      ║
    │   ║  - DNS Externe (10.0.200.30)             ║
    │   ╚══════════════════════════════════════════╝
    │
┌───▼────────────────────────────────────────────────────────┐
│  PARE-FEU INTERNE (FW-INT)                                 │
│  - Bloque DMZ → LAN sauf règles explicites autorisées      │
│  - Inspection applicative (L7)                             │
│  - Journalisation complète                                 │
└───┬────────────────────────────────────────────────────────┘
    │
    │   ╔══════════════════════════════════════════╗
    │   ║  RÉSEAU INTERNE (vlan 100 - 10.0.100.0/24║
    │   ║  - Serveur RTGS/SWIFT (10.0.100.10)      ║
    │   ║  - Active Directory (10.0.100.20)         ║
    │   ║  - Base de données (10.0.100.30)          ║
    │   ╚══════════════════════════════════════════╝
```

**Règles nftables pour une DMZ (FW-EXT) :**

```bash
#!/usr/bin/env nft -f
# Pare-feu externe BCC — Protection DMZ

flush ruleset

table inet filter {
    chain input {
        type filter hook input priority 0; policy drop;
        
        # Connexions établies — autoriser le retour
        ct state established,related accept
        
        # Loopback
        iif "lo" accept
        
        # ICMP limité (ping depuis l'extérieur — rate limiting)
        ip protocol icmp limit rate 5/second accept
        
        # Services exposés depuis Internet
        tcp dport 80 accept     # HTTP (→ redirect HTTPS)
        tcp dport 443 accept    # HTTPS
        tcp dport 25 accept     # SMTP entrant
        tcp dport 53 accept     # DNS
        udp dport 53 accept     # DNS
        
        # SSH de gestion uniquement depuis le bastion admin
        ip saddr 196.x.x.x tcp dport 22 accept  # IP bastion externe
        
        # Tout le reste : drop + log
        log prefix "FW-EXT DROP: " flags all
        drop
    }
    
    chain forward {
        type filter hook forward priority 0; policy drop;
        
        # Internet → DMZ : uniquement les services autorisés
        iif "eth0" oif "vlan200" tcp dport {80, 443, 25, 53} ct state new accept
        
        # DMZ → Internet : uniquement pour les mises à jour des serveurs
        iif "vlan200" oif "eth0" ct state new ip daddr 0.0.0.0/0 \
            tcp dport {80, 443} accept
        
        # DMZ → Interne : règles très restrictives
        iif "vlan200" oif "vlan100" ip saddr 10.0.200.5 \
            ip daddr 10.0.100.30 tcp dport 5432 accept  # WAF → DB PostgreSQL
        
        # Tout le reste INTERDIT entre zones
        log prefix "FW-EXT FORWARD DROP: "
        drop
    }
    
    chain output {
        type filter hook output priority 0; policy accept;
    }
}
```

---

## 2) Module — NGFW, WAF & Inspection SSL/TLS (2h)

### 📖 Narration/Intuition

Un **pare-feu classique** (comme nftables) filtre sur les couches 3 et 4 (IP, ports). Un **NGFW (Next-Generation Firewall)** va plus loin : il inspecte le **contenu applicatif (couche 7)** — il peut reconnaître et bloquer les attaques SQL Injection dans une requête HTTPS, même si le port 443 est autorisé.

L'**inspection SSL/TLS** (man-in-the-middle légitime ou "SSL Inspection") permet au NGFW de déchiffrer temporairement le trafic HTTPS pour l'analyser, puis le re-chiffrer vers la destination.

### 🔍 Anatomie Technique

**NGFW avec Suricata (IPS inline) :**

```bash
# Suricata en mode IPS inline (NFQUEUE)
apt install suricata

# Configurer Suricata en mode NFQUEUE (capture via netfilter)
cat >> /etc/suricata/suricata.yaml << 'EOF'
nfq:
  mode: accept
  fail-open: yes
  
af-packet:
  - interface: eth0
    cluster-id: 99
    cluster-type: cluster_flow
    defrag: yes
EOF

# Intégration avec nftables (rediriger le trafic vers Suricata)
nft add rule inet filter forward queue num 0 bypass

# Démarrer Suricata en mode IPS
suricata -c /etc/suricata/suricata.yaml --nfq
# ou
suricata -c /etc/suricata/suricata.yaml -i eth0

# Télécharger les règles de détection (Emerging Threats)
suricata-update
suricata-update list-sources

# Règle Suricata personnalisée — bloquer les SQL Injection
echo 'alert http any any -> $HTTP_SERVERS any (msg:"SQL Injection Attempt"; \
  content:"UNION SELECT"; nocase; http.uri; classtype:web-application-attack; \
  sid:9000001; rev:1;)' >> /etc/suricata/rules/bcc-custom.rules

# Surveiller les alertes
tail -f /var/log/suricata/fast.log    # Alertes en temps réel
tail -f /var/log/suricata/eve.json    # Format JSON complet (pour SIEM)
```

**WAF (Web Application Firewall) avec ModSecurity/nginx :**

```bash
# ModSecurity : WAF open-source pour nginx/Apache
apt install nginx libnginx-mod-http-modsecurity

# Télécharger le Core Rule Set (CRS) OWASP
git clone https://github.com/coreruleset/coreruleset.git /etc/nginx/modsec-crs

# Configuration nginx + ModSecurity
cat > /etc/nginx/sites-available/bcc-web << 'EOF'
server {
    listen 443 ssl;
    server_name www.bcc.cd;
    
    ssl_certificate /etc/ssl/certs/bcc.crt;
    ssl_certificate_key /etc/ssl/private/bcc.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA384:ECDHE-RSA-CHACHA20-POLY1305;
    
    # Activer ModSecurity WAF
    modsecurity on;
    modsecurity_rules_file /etc/nginx/modsec-crs/crs-setup.conf;
    
    # Proxy vers le serveur applicatif interne
    location / {
        proxy_pass http://10.0.200.10:8080;
        proxy_set_header X-Forwarded-For $remote_addr;
        proxy_set_header Host $host;
    }
    
    # En-têtes de sécurité HTTP
    add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload";
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Content-Security-Policy "default-src 'self'; script-src 'self'";
    add_header Referrer-Policy strict-origin-when-cross-origin;
}
EOF

nginx -t && systemctl reload nginx
```

---

## 3) Module — Bastion d'Administration & Jump Server (2h)

### 📖 Narration/Intuition

**Le Bastion** est la seule porte d'entrée autorisée pour l'administration des serveurs internes. Personne ne se connecte DIRECTEMENT aux serveurs de production — tout passe par le bastion qui journalise chaque action, limite les protocoles autorisés, et force la MFA. C'est le principe de l'accès "choke point unique" : si quelqu'un tente d'accéder aux systèmes BCC, il doit obligatoirement passer par le bastion.

### 🔍 Anatomie Technique

**Architecture Bastion SSH :**

```
Administrateur BCC                     Infrastructure BCC
(Remote)                               (Réseau interne)

Admin ─── MFA ───→ BASTION ─── SSH ──→ Serveurs Linux
                   10.0.200.50         10.0.100.x

Règles sur le Bastion :
1. Seul le port 22 entrant est autorisé (depuis IPs autorisées)
2. MFA obligatoire (SSH + TOTP)
3. Tous les accès journalisés (qui, quand, quoi)
4. Sessions vidéo enregistrées (optionnel)
5. Whitelist des commandes autorisées par rôle
```

**Configuration d'un bastion SSH sécurisé :**

```bash
# Configuration SSH durcit pour le bastion
cat > /etc/ssh/sshd_config << 'EOF'
# Port non standard (obscurity supplémentaire)
Port 2222

# IPv4 uniquement
AddressFamily inet

# Protocole et crypto modernes
Protocol 2
HostKey /etc/ssh/ssh_host_ed25519_key
KexAlgorithms curve25519-sha256,diffie-hellman-group16-sha512
Ciphers chacha20-poly1305@openssh.com,aes256-gcm@openssh.com
MACs hmac-sha2-512-etm@openssh.com,hmac-sha2-256-etm@openssh.com

# Authentification par clé uniquement (jamais par mot de passe)
PubkeyAuthentication yes
PasswordAuthentication no
PermitEmptyPasswords no
PermitRootLogin no

# MFA : clé SSH + code TOTP
AuthenticationMethods publickey,keyboard-interactive

# Timeout de session inactive
ClientAliveInterval 300
ClientAliveCountMax 2

# Limitation du forwarding (bastion ne doit pas être utilisé comme proxy)
X11Forwarding no
AllowAgentForwarding no
AllowTcpForwarding local    # Autorise uniquement le forwarding local (ssh -L)
PermitTunnel no

# Journalisation maximale
LogLevel VERBOSE
SyslogFacility AUTH

# Bannière légale
Banner /etc/ssh/banner.txt

# Limiter les utilisateurs autorisés
AllowUsers alice@196.1.1.1 bob@196.2.2.2  # IP autorisées par utilisateur
EOF

# Bannière légale
cat > /etc/ssh/banner.txt << 'EOF'
╔══════════════════════════════════════════════════════════════╗
║          ACCÈS AUTORISÉ — PERSONNEL BCC UNIQUEMENT           ║
║  Toutes les connexions sont journalisées et surveillées.      ║
║  Tout accès non autorisé est passible de poursuites pénales. ║
╚══════════════════════════════════════════════════════════════╝
EOF

systemctl restart ssh

# Journalisation avancée des sessions SSH (tlog)
apt install tlog
# tlog enregistre toutes les sessions terminal au format JSON
# Rejouer une session : tlog-play -r /var/log/tlog/
```

**PAM - Configuration MFA sur le bastion :**

```bash
# MFA Google Authenticator sur le bastion
apt install libpam-google-authenticator

# Activer pour tous les utilisateurs du bastion
google-authenticator    # Exécuter en tant qu'utilisateur

# Configuration PAM pour SSH
echo "auth required pam_google_authenticator.so" >> /etc/pam.d/sshd
```

---

## 🏅 Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **DMZ** | Demilitarized Zone — zone réseau tampon entre Internet et le réseau interne |
| **NGFW** | Next-Generation Firewall — pare-feu d'inspection applicative (couche 7) |
| **WAF** | Web Application Firewall — pare-feu applicatif web (OWASP Top 10) |
| **IPS** | Intrusion Prevention System — système de prévention d'intrusion (actif) |
| **IDS** | Intrusion Detection System — système de détection d'intrusion (passif) |
| **CRS** | Core Rule Set — ensemble de règles de détection OWASP pour WAF |
| **HSTS** | HTTP Strict Transport Security — force HTTPS sur tous les navigateurs |
| **CSP** | Content Security Policy — en-tête HTTP de sécurité contre XSS |
| **NFQUEUE** | Netfilter Queue — mécanisme kernel Linux pour injection d'IPS inline |
| **Tlog** | Terminal Logging — enregistrement de sessions terminal sous Linux |

---

## 🏋️ Exercices & Corrigés

**Exercice 1 :** Dans une architecture à double pare-feu avec DMZ, pourquoi le serveur de base de données (PostgreSQL) ne doit-il JAMAIS se trouver en DMZ ?

**Corrigé :** Si un serveur web en DMZ est compromis, l'attaquant peut directement attaquer la base de données si elle est dans la même zone. En plaçant la BDD dans le LAN interne derrière le pare-feu interne, l'attaquant compromis en DMZ doit franchir un second périmètre de sécurité. La règle : seules les ressources NÉCESSAIREMENT exposées à Internet vont en DMZ.

**Exercice 2 :** Expliquez pourquoi `AllowTcpForwarding local` (et pas `yes`) est la configuration correcte pour un bastion SSH.

**Corrigé :** `AllowTcpForwarding yes` permettrait d'utiliser le bastion comme proxy SOCKS pour créer des tunnels arbitraires vers n'importe quelle destination — contournant potentiellement tous les contrôles réseau. `local` autorise uniquement le forwarding de ports locaux (`ssh -L`), permettant l'accès à des services internes spécifiques de manière contrôlée.

---

## ❓ Banque de Questions & Test du Jour

**Q1 :** Quelle est la principale différence entre un pare-feu classique (iptables/nftables) et un NGFW ?
- A) Un NGFW est toujours matériel, un pare-feu classique toujours logiciel
- B) Un NGFW inspecte le contenu applicatif (L7) tandis qu'un pare-feu classique ne filtre qu'aux couches IP et transport (L3/L4)
- C) Un NGFW ne supporte pas le NAT
- D) Un pare-feu classique est plus sécurisé car plus simple

**Réponse : B**

**Q2 :** Dans une architecture DMZ à double pare-feu, quelle règle le pare-feu INTERNE doit-il appliquer par défaut ?
- A) Accepter tout le trafic depuis la DMZ
- B) Tout bloquer depuis la DMZ, sauf les flux explicitement autorisés vers le LAN
- C) Appliquer le même ruleset que le pare-feu externe
- D) Ne gérer que le trafic sortant du LAN interne

**Réponse : B**

**Q3 :** Un bastion SSH est un "choke point". Qu'est-ce que cela signifie ?
- A) Le bastion bloque tout le trafic réseau
- B) Tout accès d'administration aux systèmes internes est forcé de passer par un seul point de contrôle centralisé (le bastion), facilitant la surveillance et l'audit
- C) Le bastion est le serveur le plus puissant de l'infrastructure
- D) Le bastion est connecté à Internet en permanence sans restrictions

**Réponse : B**

**Q4 :** Suricata en mode NFQUEUE (IPS inline) permet de :
- A) Monitorer passivement le trafic sans l'altérer
- B) Bloquer activement les paquets suspects avant qu'ils n'atteignent leur destination
- C) Chiffrer tout le trafic réseau
- D) Remplacer le pare-feu nftables

**Réponse : B**

**Q5 :** Pourquoi l'en-tête HTTP HSTS (HTTP Strict Transport Security) est-il important pour un site bancaire ?
- A) Il accélère le chargement des pages web
- B) Il force les navigateurs à toujours utiliser HTTPS et interdit les connexions HTTP non chiffrées, protégeant contre les attaques SSL Stripping
- C) Il remplace les certificats SSL
- D) Il bloque les attaques SQL Injection

**Réponse : B**

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
