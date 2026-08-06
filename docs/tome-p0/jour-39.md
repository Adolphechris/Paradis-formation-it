# TOME P0 — Socle Universel — Jour 39 (6h) : Sécurité des Systèmes & Contrôle d'Accès

> [!NOTE]
> **Objectif du jour :** Maîtriser les modèles de contrôle d'accès (DAC, MAC, RBAC), la gestion des identités (IAM), l'authentification multi-facteurs (MFA/2FA), le principe du moindre privilège (PoLP) et l'application des CIS Benchmarks pour sécuriser un système Linux.
>
> **Compétences visées :** `SEC-03` (A) — Sécurité des systèmes et contrôle d'accès

---

## 1) Module — Modèles de Contrôle d'Accès (2h)

### 📖 Narration/Intuition

Le **contrôle d'accès** est le mécanisme qui détermine QUI peut faire QUOI sur QUELLES ressources. C'est le pilier de la sécurité des systèmes. Il existe plusieurs modèles théoriques, chacun adapté à des contextes différents — des systèmes gouvernementaux ultra-sécurisés aux entreprises commerciales.

**Analogy :** Dans un hôpital, un médecin peut consulter les dossiers de ses patients (DAC), mais ne peut pas consulter les dossiers classifiés de la recherche militaire (MAC), et les infirmières ont un rôle spécifique avec des droits prédéfinis (RBAC).

### 🔍 Anatomie Technique

**DAC — Discretionary Access Control (Contrôle d'accès discrétionnaire) :**

```bash
# DAC = le PROPRIÉTAIRE décide qui peut accéder à ses ressources
# C'est le modèle par défaut sur Linux (chmod/chown)

# Anatomie des permissions Linux (DAC)
ls -la /etc/passwd
# -rw-r--r-- 1 root root 2847 Jan 10 14:30 /etc/passwd
# │││ │││ │││
# │││ │││ └── Autres (o) : r-- = lecture seule
# │││ └────── Groupe (g)  : r-- = lecture seule
# └────────── Propriétaire (u) : rw- = lecture + écriture

# rwx = read (4) + write (2) + execute (1) = 7
# 755 = rwxr-xr-x : propriétaire RWX, groupe RX, autres RX
# 644 = rw-r--r-- : propriétaire RW, groupe R, autres R
# 600 = rw------- : propriétaire RW seulement (clés SSH !)
# 700 = rwx------ : propriétaire RWX seulement

# Permissions spéciales
chmod +s script.sh    # SUID : s'exécute avec les droits du propriétaire
chmod g+s dossier/   # SGID : héritage du groupe du répertoire parent
chmod +t /tmp/        # Sticky Bit : seul le propriétaire peut supprimer ses fichiers

# ACL (Access Control List) — Permissions étendues sur Linux
apt install acl
setfacl -m u:alice:rw fichier.conf     # Donner RW à Alice spécifiquement
setfacl -m g:auditeurs:r rapport.pdf   # Donner R au groupe auditeurs
getfacl fichier.conf                   # Afficher les ACL

# Masques umask — droits par défaut
umask 022    # Nouveaux fichiers créés avec 644, dossiers avec 755
umask 027    # Nouveaux fichiers 640, dossiers 750 (sécurité renforcée)
echo "umask 027" >> /etc/profile  # Appliquer globalement
```

**MAC — Mandatory Access Control (Contrôle d'accès obligatoire) :**

```bash
# MAC = le SYSTÈME décide, l'utilisateur ne peut pas déléguer ses droits
# Utilisé dans les environnements haute sécurité (militaire, gouvernemental)
# Implémentations : SELinux (RedHat/CentOS), AppArmor (Ubuntu/Debian)

# SELinux — Vérification de l'état
getenforce        # Enforcing / Permissive / Disabled
sestatus          # Status détaillé

# SELinux labellise TOUT : fichiers, processus, ports
ls -Z /etc/passwd    # system_u:object_r:passwd_file_t:s0
ps axZ | grep nginx  # system_u:system_r:httpd_t:s0

# Contexte SELinux : user:role:type:level
# Un processus ne peut accéder qu'aux ressources de son type (type enforcement)

# AppArmor — Interface plus simple (Ubuntu)
aa-status                              # Voir les profils actifs
aa-genprof /usr/bin/mon_script        # Générer un profil pour un script
cat /etc/apparmor.d/usr.bin.nginx     # Voir un profil nginx

# Exemple de profil AppArmor simplifi
#/usr/sbin/nginx {
#  /var/www/html/** r,         # Nginx peut lire le webroot
#  /var/log/nginx/** w,        # Nginx peut écrire les logs
#  network tcp,                 # Réseau TCP autorisé
#  deny /etc/passwd r,          # Interdit de lire /etc/passwd
#}
```

**RBAC — Role-Based Access Control (Contrôle d'accès basé sur les rôles) :**

```bash
# RBAC = les droits sont assignés à des RÔLES, les utilisateurs reçoivent des rôles
# Plus facile à gérer que DAC pur (surtout en entreprise)

# Implémentation Linux : groupes Unix + sudo
# Créer des groupes fonctionnels (= rôles)
groupadd admins-reseau
groupadd auditeurs-securite
groupadd deployers-web

# Assigner les utilisateurs aux rôles
usermod -aG admins-reseau alice
usermod -aG auditeurs-securite bob
usermod -aG deployers-web charlie

# Configurer les droits du rôle via sudoers
cat >> /etc/sudoers.d/roles << 'EOF'
# Rôle admins-reseau : peut gérer les interfaces et le firewall
%admins-reseau ALL=(root) /sbin/ip, /usr/sbin/iptables, /usr/sbin/nftables

# Rôle auditeurs-securite : lecture seule des logs
%auditeurs-securite ALL=(root) NOPASSWD: /usr/bin/tail -f /var/log/*, /usr/bin/journalctl

# Rôle deployers-web : peut redémarrer nginx uniquement
%deployers-web ALL=(root) /usr/bin/systemctl restart nginx, /usr/bin/systemctl status nginx
EOF
```

---

## 2) Module — IAM, MFA & Gestion des Identités (2h)

### 📖 Narration/Intuition

La **gestion des identités et des accès** (IAM) est l'ensemble des processus et technologies qui permettent de gérer le cycle de vie des comptes utilisateurs : création, modification, révocation, et surveillance. MFA (Multi-Factor Authentication) est la mesure de sécurité avec le meilleur rapport effort/protection disponible aujourd'hui.

### 🔍 Anatomie Technique

**Les 3 facteurs d'authentification :**

```
Facteur 1 — Ce que vous SAVEZ (Knowledge)
├── Mot de passe
├── PIN (Personal Identification Number)
└── Question de sécurité (déconseillé — social engineering)

Facteur 2 — Ce que vous AVEZ (Possession)
├── Application TOTP (Google Authenticator, Authy)
├── Token matériel (YubiKey, RSA SecurID)
├── SMS OTP (One-Time Password) — ⚠ moins sécurisé (SIM swapping)
└── Carte à puce (Smart Card)

Facteur 3 — Ce que vous ÊTES (Inherence — Biométrie)
├── Empreinte digitale
├── Reconnaissance faciale
├── Iris
└── Reconnaissance vocale

MFA = utiliser AU MOINS 2 facteurs de 2 catégories différentes
2FA = MFA avec exactement 2 facteurs
```

**TOTP — Time-based One-Time Password (le code à 6 chiffres) :**

```python
# Fonctionnement du TOTP (RFC 6238)
import hmac
import hashlib
import struct
import time
import base64

def generer_totp(secret_base32, intervalle=30, digits=6):
    """
    Génère un code TOTP (Time-based One-Time Password).
    
    Le code change toutes les 30 secondes.
    Même secret + même timestamp → même code
    (synchronisation entre client et serveur)
    """
    # Décoder le secret Base32
    secret = base64.b32decode(secret_base32.upper())
    
    # Compteur temporel : timestamp / 30 (arrondi à la tranche de 30s)
    compteur = int(time.time()) // intervalle
    
    # Convertir en 8 octets big-endian
    msg = struct.pack(">Q", compteur)
    
    # HMAC-SHA1 du compteur avec le secret
    h = hmac.new(secret, msg, hashlib.sha1).digest()
    
    # Dynamic truncation
    offset = h[-1] & 0x0f
    code = struct.unpack(">I", h[offset:offset+4])[0] & 0x7fffffff
    
    # Garder seulement 6 chiffres
    return str(code % (10 ** digits)).zfill(digits)

# Usage
# secret = "JBSWY3DPEHPK3PXP"  # En production, généré aléatoirement
# print(generer_totp(secret))   # Ex: "482931"
```

**Configuration MFA sur SSH (Google Authenticator) :**

```bash
# Installation
apt install libpam-google-authenticator

# Configuration par utilisateur
google-authenticator
# → Répond aux questions : tokens temporels, window, rate limiting
# → Affiche le QR code à scanner dans l'app

# Configurer PAM pour SSH
echo "auth required pam_google_authenticator.so" >> /etc/pam.d/sshd

# Configurer SSH pour utiliser PAM et MFA
cat >> /etc/ssh/sshd_config << 'EOF'
ChallengeResponseAuthentication yes
AuthenticationMethods publickey,keyboard-interactive
EOF

systemctl restart ssh
# Désormais : clé SSH + code TOTP requis pour la connexion
```

**Gestion sécurisée des comptes de service :**

```bash
# Compte de service : compte non-humain utilisé par une application
# Règles d'or pour les comptes de service :

# 1. Créer un compte dédié (ne jamais utiliser root ou un compte humain)
useradd --system --no-create-home --shell /usr/sbin/nologin webapp
# --system : UID < 1000 (compte système)
# --no-create-home : pas de répertoire home
# --shell /nologin : connexion interactive interdite

# 2. Droits minimaux sur les fichiers de l'application
chown -R webapp:webapp /opt/monapp/
chmod 750 /opt/monapp/
chmod 640 /opt/monapp/config.yaml

# 3. Limiter les capacités système (sans sudo)
# Via systemd (préféré pour les services)
cat > /etc/systemd/system/monapp.service << 'EOF'
[Service]
User=webapp
Group=webapp
NoNewPrivileges=true          # Interdit l'escalade de privilèges
PrivateTmp=true               # /tmp isolé
ProtectSystem=strict          # Système en lecture seule
ProtectHome=true              # Pas d'accès aux /home
ReadWritePaths=/var/lib/monapp  # Exception pour les données de l'app
CapabilityBoundingSet=        # Aucune capability Linux
EOF

systemctl daemon-reload && systemctl enable --now monapp
```

---

## 3) Module — CIS Benchmarks & Principe du Moindre Privilège (2h)

### 📖 Narration/Intuition

**CIS Benchmarks** (Center for Internet Security) sont les référentiels de configuration sécurisée les plus utilisés au monde pour durcir (hardening) les systèmes. Ils définissent des centaines de contrôles concrets avec leur justification et leur impact.

Le **Principe du Moindre Privilège** (PoLP) stipule que chaque utilisateur, processus ou système ne doit avoir que les droits MINIMUM nécessaires à l'accomplissement de sa fonction — ni plus, ni moins.

### 🔍 Anatomie Technique

**CIS Benchmarks Level 1 — Contrôles essentiels Linux :**

```bash
#!/bin/bash
# Script de vérification CIS Benchmark Ubuntu 22.04 LTS (sélection)

echo "=== AUDIT CIS BENCHMARK — BCC LINUX ==="
echo ""

# ─── 1. Partitions et filesystem ────────────────────────────────
echo "[CIS 1.1.1] Vérification des partitions sensibles"
for partition in /tmp /var /var/log /home; do
    if mount | grep -q "on $partition "; then
        echo "  ✓ $partition est une partition séparée"
    else
        echo "  ✗ $partition n'est PAS une partition séparée"
    fi
done

# ─── 2. Services inutiles ────────────────────────────────────────
echo ""
echo "[CIS 2.x] Services potentiellement inutiles"
services_inutiles=("telnet" "rsh" "rlogin" "ftp" "nfs" "rpcbind" "cups")
for svc in "${services_inutiles[@]}"; do
    if systemctl is-active "$svc" &>/dev/null; then
        echo "  ✗ ACTIF — $svc doit être désactivé"
    else
        echo "  ✓ $svc est inactif"
    fi
done

# ─── 3. SSH Configuration ────────────────────────────────────────
echo ""
echo "[CIS 5.2] Configuration SSH"
sshd_checks=(
    "Protocol 2:Protocole SSH2 uniquement"
    "PermitRootLogin no:Root SSH interdit"
    "PasswordAuthentication no:Auth par mot de passe interdite"
    "MaxAuthTries 4:Maximum 4 tentatives"
    "X11Forwarding no:X11 Forwarding interdit"
    "ClientAliveInterval 300:Timeout d'inactivité"
)

for check in "${sshd_checks[@]}"; do
    parametre="${check%%:*}"
    description="${check#*:}"
    if sshd -T 2>/dev/null | grep -qi "${parametre,,}"; then
        echo "  ✓ $description"
    else
        echo "  ✗ NON CONFIGURÉ — $description"
    fi
done

# ─── 4. Authentification et mots de passe ────────────────────────
echo ""
echo "[CIS 5.3] Politique de mots de passe"
echo "  Longueur minimale : $(grep -E "^PASS_MIN_LEN" /etc/login.defs | awk '{print $2}')"
echo "  Expiration max :    $(grep -E "^PASS_MAX_DAYS" /etc/login.defs | awk '{print $2}') jours"
echo "  Durée minimum :     $(grep -E "^PASS_MIN_DAYS" /etc/login.defs | awk '{print $2}') jours"

# ─── 5. Comptes sans mot de passe ────────────────────────────────
echo ""
echo "[CIS 6.2.1] Comptes sans mot de passe (CRITIQUE)"
awk -F: '($2 == "") {print "  ✗ CRITIQUE : compte sans MDP = " $1}' /etc/shadow 2>/dev/null \
    || echo "  → Permissions insuffisantes pour lire /etc/shadow"

# ─── 6. Permissions critiques ────────────────────────────────────
echo ""
echo "[CIS 6.1] Permissions fichiers critiques"
fichiers_critiques=(
    "/etc/passwd:644"
    "/etc/shadow:640"
    "/etc/group:644"
    "/etc/gshadow:640"
    "/etc/ssh/sshd_config:600"
)
for f in "${fichiers_critiques[@]}"; do
    fichier="${f%%:*}"
    perms_attendues="${f#*:}"
    perms_actuelles=$(stat -c "%a" "$fichier" 2>/dev/null)
    if [ "$perms_actuelles" = "$perms_attendues" ]; then
        echo "  ✓ $fichier ($perms_actuelles)"
    else
        echo "  ✗ $fichier : attendu $perms_attendues, actuel $perms_actuelles"
    fi
done

echo ""
echo "=== FIN DE L'AUDIT ==="
```

**Appliquer le PoLP — Remédiation concrète :**

```bash
# Limiter sudo à des commandes spécifiques (PoLP)
visudo  # Édite /etc/sudoers en sécurité

# ❌ MAUVAIS — accès root complet
alice ALL=(ALL) ALL

# ✅ BON — PoLP : seulement les commandes nécessaires
alice ALL=(root) NOPASSWD: /usr/bin/systemctl restart nginx
alice ALL=(root) /usr/bin/tail -f /var/log/nginx/*, /usr/sbin/nginx -t

# Auditer les comptes privilégiés
grep -E "^(root|sudo):.*:" /etc/group  # Membres du groupe sudo
awk -F: '$3 == 0 {print "UID 0 (root) :", $1}' /etc/passwd  # Comptes UID 0

# Désactiver les comptes inactifs
passwd -l alice  # Verrouiller un compte
usermod -e 2024-12-31 bob  # Date d'expiration
chage -l alice  # Voir la politique de mot de passe d'un compte
```

---

## 🏅 Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **DAC** | Discretionary Access Control — contrôle d'accès discrétionnaire |
| **MAC** | Mandatory Access Control — contrôle d'accès obligatoire |
| **RBAC** | Role-Based Access Control — contrôle d'accès basé sur les rôles |
| **IAM** | Identity and Access Management — gestion des identités et des accès |
| **MFA** | Multi-Factor Authentication — authentification multi-facteurs |
| **2FA** | Two-Factor Authentication — authentification à deux facteurs |
| **TOTP** | Time-based One-Time Password — mot de passe unique basé sur le temps |
| **PoLP** | Principle of Least Privilege — principe du moindre privilège |
| **CIS** | Center for Internet Security — référentiel de sécurité |
| **ACL** | Access Control List — liste de contrôle d'accès |
| **PAM** | Pluggable Authentication Modules — modules d'authentification Linux |

---

## 🏋️ Exercices & Corrigés

**Exercice 1 :** Configurez un compte de service `backup-agent` qui ne peut que lire `/var/log/` et écrire dans `/var/backups/`. Montrez les commandes complètes.

**Corrigé :**
```bash
useradd --system --no-create-home --shell /usr/sbin/nologin backup-agent
mkdir -p /var/backups/bcc
chown backup-agent:backup-agent /var/backups/bcc
chmod 750 /var/backups/bcc
setfacl -m u:backup-agent:r-x /var/log/
# Dans /etc/sudoers.d/backup-agent :
# backup-agent ALL=(root) NOPASSWD: /usr/bin/rsync --read-only
```

**Exercice 2 :** Expliquez pourquoi `%auditeurs ALL=(root) ALL` dans sudoers viole le PoLP.

**Corrigé :** Cette règle donne aux auditeurs un accès root complet. Le PoLP exige que les auditeurs aient uniquement les droits nécessaires à leur rôle : lecture des logs, exécution d'outils d'audit — mais pas la possibilité de modifier des configurations ou créer des comptes.

---

## ❓ Banque de Questions & Test du Jour

**Q1 :** Dans le modèle RBAC, comment sont assignés les droits d'accès ?
- A) Directement aux utilisateurs par le propriétaire des ressources
- B) Par le système d'exploitation de façon automatique
- C) Aux rôles, et les utilisateurs reçoivent des rôles
- D) Aléatoirement selon la politique de sécurité

**Réponse : C**

**Q2 :** Quelle est la différence entre 2FA et MFA ?
- A) 2FA est plus sécurisé que MFA
- B) 2FA utilise exactement 2 facteurs, MFA en utilise 2 ou plus (2FA est un sous-ensemble de MFA)
- C) MFA n'est utilisé que pour les connexions VPN
- D) 2FA nécessite une biométrie obligatoirement

**Réponse : B**

**Q3 :** Un processus web `www-data` a besoin d'écrire dans `/var/www/uploads/`. Quelle approche respecte le PoLP ?
- A) Donner à `www-data` les droits `root`
- B) Faire appartenir `/var/www/uploads/` à `www-data` avec les permissions 700
- C) Mettre les permissions 777 sur `/var/www/uploads/`
- D) Lancer le serveur web en tant que root

**Réponse : B** — Seul `www-data` peut écrire, les autres ne peuvent pas, et le processus n'a pas de droits superflus.

**Q4 :** Un code TOTP change toutes les 30 secondes. Pourquoi cela protège-t-il contre le rejeu (replay attack) ?
- A) Le code est chiffré avec AES-256
- B) Le code change si vite qu'un code intercepté sera expiré avant de pouvoir être réutilisé
- C) Le code est transmis sur un canal sécurisé VPN
- D) Le serveur bloque automatiquement toute connexion multiple

**Réponse : B** — Un attaquant qui intercepte un code TOTP a au maximum 30 secondes pour l'utiliser. Avec la détection de double-utilisation, il est pratiquement inutilisable.

**Q5 :** Le Principe du Moindre Privilège (PoLP) stipule que :
- A) Chaque utilisateur doit avoir les mêmes droits pour garantir l'équité
- B) Seul l'administrateur root peut avoir des droits sur le système
- C) Chaque entité (utilisateur, processus, service) ne doit avoir que les droits strictement nécessaires à sa fonction
- D) Les droits doivent être maximaux pour éviter les blocages en production

**Réponse : C**

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
