# TOME P2 — Réseaux & Télécoms — Jour 81 (6h) : Sécurité Linux & Hardening du Noyau (Kernel)

> [!NOTE]
> **Objectif du jour :** Maîtriser le durcissement (hardening) du noyau Linux et du système d'exploitation pour une infrastructure bancaire critique : paramètres sysctl, namespaces, cgroups, Linux Security Modules (AppArmor/SELinux), et audit avec Lynis/OpenSCAP.
>
> **Compétences visées :** `SEC-03` (A) — Sécurité des Systèmes Operating System | `BIT-09` (A) — Administration Linux Avancée

---

## 1) Module — Durcissement du Noyau Linux via sysctl (2h)

### 📖 Narration/Intuition

Par défaut, le noyau Linux est configuré pour privilégier la compatibilité et la facilité d'utilisation au détriment de la sécurité. Pour un serveur hébergeant des applications critiques, cette configuration par défaut expose le système à des attaques réseau (IP spoofing, SYN flood, redirections ICMP) et des attaques de mémoire (buffer overflow, élévation de privilèges).

**Le durcissement du noyau (kernel hardening)** consiste à désactiver les fonctionnalités inutiles, restreindre l'accès à la mémoire du noyau et activer les protections défensives natives.

### 🔍 Anatomie Technique

**Paramètres sysctl critiques pour la sécurité (`/etc/sysctl.d/99-hardening.conf`) :**

```ini
# ─── 1. Protections Mémoire & Kernel ─────────────────────────────────────────
# Désactiver le chargement de modules noyau à chaud (post-boot)
# kernel.modules_disabled = 1 (Avertissement: à n'activer qu'après boot complet)

# Restreindre l'accès aux pointeurs du noyau (kptr_restrict)
kernel.kptr_restrict = 2

# Restreindre dmesg aux utilisateurs avec CAP_SYSLOG
kernel.dmesg_restrict = 1

# Masquer la table des appels système et adresses mémoire
kernel.kexec_load_disabled = 1

# Désactiver la touche Magic SysRq (sauf REISUB si nécessaire)
kernel.sysrq = 0

# Randomisation de l'espace d'adressage (ASLR) au niveau maximum
kernel.randomize_va_space = 2

# Interdire le ptrace sur des processus non enfants (Yama LSM)
kernel.yama.ptrace_scope = 2

# ─── 2. Protections Réseau (IPv4 / IPv6 Stack) ──────────────────────────────
# Désactiver le transfert IP (sauf sur les routeurs/passerelles)
net.ipv4.ip_forward = 0
net.ipv6.conf.all.forwarding = 0

# Activer le filtrage par chemin inverse (anti-spoofing IP)
net.ipv4.conf.all.rp_filter = 1
net.ipv4.conf.default.rp_filter = 1

# Refuser les paquets d'option de routage par la source (Source Routing)
net.ipv4.conf.all.accept_source_route = 0
net.ipv6.conf.all.accept_source_route = 0

# Ignorer les redirections ICMP (anti-Man-in-the-Middle)
net.ipv4.conf.all.accept_redirects = 0
net.ipv4.conf.default.accept_redirects = 0
net.ipv4.conf.all.secure_redirects = 0
net.ipv6.conf.all.accept_redirects = 0

# Ne pas envoyer de redirections ICMP
net.ipv4.conf.all.send_redirects = 0
net.ipv4.conf.default.send_redirects = 0

# Protection contre les attaques SYN Flood (SYN Cookies)
net.ipv4.tcp_syncookies = 1
net.ipv4.tcp_max_syn_backlog = 2048
net.ipv4.tcp_synack_retries = 2

# Ignorer les pings ICMP broadcast (anti-Smurf attack)
net.ipv4.icmp_echo_ignore_broadcasts = 1

# Ignorer les fausses réponses d'erreur ICMP
net.ipv4.icmp_ignore_bogus_error_responses = 1

# Logging des paquets suspects (martians / IP impossibles)
net.ipv4.conf.all.log_martians = 1
net.ipv4.conf.default.log_martians = 1

# ─── 3. Protections Système de Fichiers (Filesystem) ─────────────────────────
# Empêcher la création de liens symboliques / durs malveillants dans /tmp
fs.protected_symlinks = 1
fs.protected_hardlinks = 1

# Protections additionnelles FIFO et régulières dans les dossiers sticky (/tmp)
fs.protected_fifos = 2
fs.protected_regular = 2
```

**Application et vérification des paramètres :**

```bash
# Appliquer la configuration sysctl sans redémarrer
sudo sysctl -p /etc/sysctl.d/99-hardening.conf

# Vérifier un paramètre spécifique
sysctl kernel.randomize_va_space
sysctl net.ipv4.tcp_syncookies
```

---

## 2) Module — Linux Security Modules : AppArmor & SELinux (2h)

### 📖 Narration/Intuition

Même si un service (comme Nginx ou PostgreSQL) s'exécute avec un utilisateur non-root, une vulnérabilité applicative (ex: RCE) pourrait lui permettre d'explorer le système de fichiers, de lire des clés SSH ou d'exécuter un binaire non autorisé.

Les **Linux Security Modules (LSM)** comme **AppArmor** (par défaut sur Debian/Ubuntu) et **SELinux** (par défaut sur RHEL/CentOS) mettent en œuvre le contrôle d'accès obligatoire (MAC - Mandatory Access Control). Ils confinent les processus dans un "bac à sable" strict : même en cas de compromission, le binaire ne peut pas exécuter d'actions hors de son profil autorisé.

### 🔍 Anatomie Technique

**Fonctionnement et profils AppArmor :**

```
Modes AppArmor :
- Enforce : Bloque activement les actions non autorisées et génère un log.
- Complain : Autorise l'action mais génère un log d'avertissement (utile pour créer/tester un profil).
- Disabled : AppArmor ne surveille pas le profil.
```

**Création et déploiement d'un profil AppArmor pour une application Python (`/etc/apparmor.d/usr.bin.app-critique`) :**

```gperf
#include <tunables/global>

profile app-critique /opt/app-critique/venv/bin/python3 flags=(attach_disconnected) {
  #include <abstractions/base>
  #include <abstractions/nameservice>
  #include <abstractions/openssl>

  # Autoriser la lecture du code applicatif et des bibliothèques
  /opt/app-critique/** r,
  /opt/app-critique/venv/lib/python3.*/site-packages/** r,
  /opt/app-critique/venv/lib/python3.*/site-packages/**/*.so mr,

  # Autoriser la lecture des certificats TLS
  /etc/ssl/certs/** r,
  /etc/pki/certs/** r,

  # Autoriser l'écriture uniquement dans le dossier de logs spécifique
  /var/log/app-critique/ w,
  /var/log/app-critique/* w,

  # Accès aux fichiers temporaires isolés
  /tmp/app-critique-tmp-* rw,

  # Interdire explicitement l'accès aux clés privées d'autres services ou root
  deny /root/** mrwklx,
  deny /etc/shadow r,
  deny /etc/ssh/** mrwklx,

  # Interdire l'exécution de shells système (empêcher les reverse shells)
  deny /bin/bash rx,
  deny /bin/sh rx,
  deny /usr/bin/python* rx,
}
```

**Commandes de gestion AppArmor :**

```bash
# Vérifier l'état d'AppArmor
sudo aa-status

# Passer un profil en mode complain (apprentissage)
sudo aa-complain /etc/apparmor.d/usr.bin.app-critique

# Charger/Recharger un profil en mode enforce
sudo aa-enforce /etc/apparmor.d/usr.bin.app-critique

# Examiner les violations d'AppArmor dans les logs
sudo aa-notify -s 1 -v
# ou via dmesg / auditd
sudo ausearch -m avc -ts recent
```

---

## 3) Module — Audit de Conformité avec Lynis & OpenSCAP (2h)

### 📖 Narration/Intuition

Comment prouver à un auditeur ou à une autorité de régulation que les serveurs respectent les normes de sécurité (CIS Benchmarks, ISO 27001) ? L'analyse manuelle est impossible à grande échelle. Des outils d'audit comme **Lynis** et **OpenSCAP** scannent le système de manière automatisée, évaluent l'indice de durcissement (Hardening Index) et génèrent un rapport détaillé des faiblesses.

### 🔍 Anatomie Technique

**Audit système avec Lynis :**

```bash
# Installation de Lynis
sudo apt update && sudo apt install -y lynis

# Lancer un audit de sécurité complet du système
sudo lynis audit system

# Audit automatisé pour CI/CD (mode non interactif)
sudo lynis audit system --quick --warnings-only

# Consulter le rapport et le score de durcissement
# Le fichier /var/log/lynis.log contient tous les détails
# Le fichier /var/log/lynis-report.dat contient les métriques brutes
grep "hardening_index" /var/log/lynis-report.dat
```

**Script Python d'automatisation et parsing du rapport Lynis :**

```python
#!/usr/bin/env python3
"""
parse_lynis_report.py — Analyseur de conformité Lynis
Exige un score de durcissement (Hardening Index) >= 80%
"""
import re
import sys

LOG_FILE = "/var/log/lynis-report.dat"

def analyser_rapport():
    suggestions = []
    warnings = []
    hardening_index = 0

    try:
        with open(LOG_FILE, "r") as f:
            for line in f:
                if line.startswith("hardening_index="):
                    hardening_index = int(line.split("=")[1].strip())
                elif line.startswith("suggestion[]="):
                    suggestions.append(line.split("=")[1].strip())
                elif line.startswith("warning[]="):
                    warnings.append(line.split("=")[1].strip())
    except FileNotFoundError:
        print(f"❌ Erreur : Fichier {LOG_FILE} introuvable. Exécutez 'lynis audit system' d'abord.")
        sys.exit(1)

    print(f"\n==========================================")
    print(f"   RAPPORT D'AUDIT LYNIS — HARDENING SECURITY   ")
    print(f"==========================================")
    print(f"Score de Durcissement : {hardening_index}%")
    print(f"Avertissements (Warnings) : {len(warnings)}")
    print(f"Suggestions : {len(suggestions)}")
    print(f"------------------------------------------")

    if warnings:
        print("\n⚠️  AVERTISSEMENTS CRITIQUES :")
        for w in warnings[:5]:
            print(f"  - {w}")

    if hardening_index >= 80:
        print(f"\n✅ CONFORME : Score {hardening_index}% >= 80% requis.")
        sys.exit(0)
    else:
        print(f"\n❌ NON CONFORME : Score {hardening_index}% < 80% minimum requis.")
        sys.exit(1)

if __name__ == "__main__":
    analyser_rapport()
```

---

## 🏅 Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **LSM** | Linux Security Modules — framework de sécurité intégré au noyau Linux |
| **MAC** | Mandatory Access Control — contrôle d'accès obligatoire |
| **DAC** | Discretionary Access Control — contrôle d'accès discrétionnaire (droits POSIX classiques) |
| **ASLR** | Address Space Layout Randomization — randomisation de l'emplacement mémoire |
| **SCAP** | Security Content Automation Protocol — protocole d'automatisation du contenu de sécurité |
| **CIS** | Center for Internet Security — organisme éditant les benchmarks de référence |
| **AVC** | Access Vector Cache — logs de refus/permis de SELinux/AppArmor |

---

## 🏋️ Exercices & Corrigés

**Exercice 1 :** Pourquoi le paramètre `net.ipv4.conf.all.rp_filter = 1` est-il essentiel sur un serveur de production ?

**Corrigé :** Le paramètre `rp_filter` (Reverse Path Filtering) vérifie si le paquet reçu sur une interface réseau provient d'une adresse IP source cohérente avec la table de routage. Si l'IP source semble venir d'une interface différente, le paquet est rejeté. Cela protège contre le **spoofing d'adresses IP** et l'injection de paquets forgés.

**Exercice 2 :** Quelle est la différence entre le mode `enforce` et le mode `complain` d'AppArmor ?

**Corrigé :** En mode **enforce**, AppArmor applique strictement les règles : toute action non explicitement autorisée est bloquée et enregistrée dans les logs. En mode **complain**, les actions non autorisées sont exécutées normalement, mais une alerte est générée dans les logs. Le mode complain est utilisé lors de la phase de développement d'un profil pour identifier toutes les opérations légitimes d'une application sans casser son fonctionnement.

---

## ❓ Banque de Questions & Test du Jour

**Q1 :** Que fait le paramètre sysctl `fs.protected_symlinks = 1` ?
- A) Il chiffre tous les liens symboliques sur le disque
- B) Il empêche les utilisateurs de créer ou suivre des symlinks malveillants dans des dossiers temporaires partagés (ex: `/tmp`)
- C) Il désactive la création de liens symboliques pour l'utilisateur root
- D) Il sauvegarde automatiquement les liens symboliques en cas de suppression

**Réponse : B**

**Q2 :** Quel outil permet d'effectuer un audit de sécurité automatisé complet d'un système Linux et de calculer un indice de durcissement (Hardening Index) ?
- A) Wireshark
- B) Lynis
- C) Gzip
- D) Netcat

**Réponse : B**

**Q3 :** AppArmor et SELinux sont des exemples de systèmes de type :
- A) DAC (Discretionary Access Control)
- B) MAC (Mandatory Access Control)
- C) PKI (Public Key Infrastructure)
- D) RAID (Redundant Array of Independent Disks)

**Réponse : B**

**Q4 :** Si `kernel.randomize_va_space` est réglé sur 2, quelle protection est activée ?
- A) Le pare-feu réseau du noyau est activé
- B) L'ASLR (Address Space Layout Randomization) complet est activé (stack, VDSO, heap, mmap)
- C) Les mots de passe sont hachés avec 2 itérations
- D) Seuls 2 utilisateurs peuvent se connecter en SSH simultanément

**Réponse : B**

**Q5 :** Quel est l'impact de la directive sysctl `net.ipv4.tcp_syncookies = 1` ?
- A) Elle enregistre tous les cookies HTTP dans le noyau
- B) Elle protège le serveur contre les attaques de déni de service SYN Flood
- C) Elle chiffre toutes les connexions TCP
- D) Elle ferme automatiquement les connexions inactives au bout de 1 seconde

**Réponse : B**

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
