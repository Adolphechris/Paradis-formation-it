# TOME P12 — Architecture Ultime, Leadership Technique & Capstone Final — Jour 581 (6h) : Révision Intensive Semestres 1–4 — Linux, Réseaux, Sécurité & Scripting

> [!NOTE]
> **Objectifs pédagogiques :**
> - Consolider et réviser les fondamentaux absolus couverts aux **Semestres 1 à 4** : Administration Linux, Réseaux TCP/IP, Sécurité de Base, Scripting Bash/Python
> - Identifier et combler les lacunes avant l'examen final via des exercices de remise à niveau ciblés
> - Maîtriser les **commandes Linux critiques** susceptibles d'apparaître lors d'entretiens techniques ou de certifications (LPIC-1, RHCSA, CompTIA Linux+)
> - Pratiquer le diagnostic réseau de bout en bout : de la couche 1 (physique) à la couche 7 (application)
>
> **Compétences visées :** `BIT-01` (A), `BIT-02` (A), `BIT-03` (A), `SEC-01` (A) — Fondamentaux IT, Linux, Réseaux, Sécurité de Base

---

## Module 1 — Révision Linux & Scripting Bash/Python (2h)

### 📖 Récapitulatif des Fondamentaux S1 (J1–J50) & S2 (J51–J100)

Le **Semestre 1** a posé les bases de l'administration système Linux et du scripting. Voici les concepts clés à maîtriser absolument :

```
HIÉRARCHIE DES PROCESSUS & SIGNAUX LINUX

  PID 1 = systemd (ou init)
  ├── sshd (PID 234)
  │   └── bash (PID 1205) ← Session utilisateur
  │       └── vim (PID 1240)
  └── nginx (PID 456)

  SIGNAUX CRITIQUES (kill -N PID) :
  ┌────┬────────────┬───────────────────────────────────────────────┐
  │  1 │ SIGHUP     │ Recharge de la configuration (ex: nginx -s reload) │
  │  2 │ SIGINT     │ Ctrl+C — Interruption gracieuse               │
  │  9 │ SIGKILL    │ Terminaison forcée — NON interceptable        │
  │ 15 │ SIGTERM    │ Terminaison gracieuse (défaut kill)            │
  │ 19 │ SIGSTOP    │ Pause du processus — NON interceptable        │
  └────┴────────────┴───────────────────────────────────────────────┘

  GESTION DISQUES & FILESYSTEMS :
  lsblk -f                      # Liste les blocs et filesystems
  fdisk -l /dev/sda             # Partitions du disque
  mkfs.ext4 /dev/sdb1           # Formatage partition ext4
  mount /dev/sdb1 /mnt/data     # Montage
  df -hT                        # Espace disque avec type FS
  du -sh /var/log/*             # Taille par répertoire
  tune2fs -l /dev/sda1          # Métadonnées filesystem ext4

  GESTION SERVICES SYSTEMD :
  systemctl start|stop|restart|status nginx
  systemctl enable nginx         # Démarrage automatique
  systemctl list-units --failed  # Services en erreur
  journalctl -u nginx -f --since "1 hour ago"
```

### 🔍 Scripting Bash — Patterns Essentiels

```bash
#!/usr/bin/env bash
# ─── PATTERNS BASH CRITIQUES ────────────────────────────────────────────────

# 1. Set d'erreur stricte (TOUJOURS en production)
set -euo pipefail
IFS=$'\n\t'

# 2. Fonctions avec retour de valeur
check_disk_usage() {
    local threshold="${1:-80}"  # Défaut 80%
    local usage
    usage=$(df / | awk 'NR==2 {print $5}' | tr -d '%')
    if (( usage > threshold )); then
        echo "ALERTE: Disque / à ${usage}% (seuil: ${threshold}%)" >&2
        return 1
    fi
    echo "OK: Disque / à ${usage}%"
    return 0
}

# 3. Gestion de signaux (trap)
cleanup() {
    echo "Nettoyage avant sortie..."
    rm -f /tmp/mon_script.lock
}
trap cleanup EXIT SIGINT SIGTERM

# 4. Boucle avec gestion d'erreur
for host in web01 web02 db01; do
    if ! ping -c1 -W2 "$host" &>/dev/null; then
        echo "ERREUR: $host ne répond pas"
        continue
    fi
    echo "OK: $host joignable"
done

# 5. Heredoc pour configuration dynamique
cat > /tmp/nginx_vhost.conf <<EOF
server {
    listen 80;
    server_name ${DOMAIN_NAME:-example.com};
    root /var/www/html;
}
EOF
```

---

## Module 2 — Révision Réseaux TCP/IP & Sécurité (S2–S4) (2h)

### 🔍 Modèle OSI / TCP-IP — Récapitulatif

```
COUCHES OSI / TCP-IP — CORRESPONDANCE & PROTOCOLES

  OSI           TCP/IP          Protocoles           Équipements
  ─────────────────────────────────────────────────────────────────
  7. Application Application     HTTP/2, DNS, SMTP    Serveurs
  6. Présentation    │           TLS 1.3, JSON         Proxy, WAF
  5. Session         │           SSH, RPC              Bastion
  ─────────────────────────────────────────────────────────────────
  4. Transport   Transport       TCP (fiable), UDP     Load Balancer
  ─────────────────────────────────────────────────────────────────
  3. Réseau      Internet        IPv4, IPv6, OSPF, BGP  Routeur, FW L3
  ─────────────────────────────────────────────────────────────────
  2. Liaison     Accès Réseau    Ethernet, Wi-Fi 802.11  Switch, AP
  1. Physique        │           Câble RJ45, Fibre       Hub, Câbles
  ─────────────────────────────────────────────────────────────────

  CALCUL VLSM (Variable Length Subnet Masking) :
  Réseau parent  : 192.168.10.0/24  (256 adresses)
  Sous-réseau 1  : /25 → 128 adresses (192.168.10.0  – 192.168.10.127)
  Sous-réseau 2  : /26 →  64 adresses (192.168.10.128 – 192.168.10.191)
  Sous-réseau 3  : /27 →  32 adresses (192.168.10.192 – 192.168.10.223)

  PORTS CRITIQUES À CONNAÎTRE :
  22 SSH | 23 Telnet | 25 SMTP | 53 DNS | 80 HTTP | 110 POP3
  143 IMAP | 443 HTTPS | 3306 MySQL | 5432 PostgreSQL | 6379 Redis
  8080 HTTP-Alt | 9200 Elasticsearch | 27017 MongoDB | 2379 etcd
```

### 🔍 Commandes de Diagnostic Réseau Essentielles

```bash
# ─── DIAGNOSTIC RÉSEAU — BOÎTE À OUTILS COMPLÈTE ─────────────────────────

# Couche 3 — Connectivité IP
ping -c4 8.8.8.8                          # Test ICMP
traceroute -n 8.8.8.8                     # Chemin IP (UDP par défaut)
mtr --report --report-cycles=10 8.8.8.8  # Traceroute dynamique

# Couche 4 — TCP/UDP
ss -tulpn                                 # Ports en écoute (remplace netstat)
nc -zv 192.168.1.1 443                    # Test connectivité TCP port 443
nmap -sV -p 22,80,443 192.168.1.0/24     # Scan de services

# Couche 7 — Application
curl -v --resolve mon-site.fr:443:1.2.3.4 https://mon-site.fr  # Test HTTPS forcé
dig +short mon-site.fr A                  # Résolution DNS IPv4
dig +trace mon-site.fr                    # Délégation DNS complète
openssl s_client -connect mon-site.fr:443 -servername mon-site.fr  # Cert TLS

# Capture de paquets
tcpdump -i eth0 -nn 'port 443' -w /tmp/cap.pcap  # Capture HTTPS
tshark -r /tmp/cap.pcap -Y 'tls.handshake'       # Analyse TLS handshake

# ─── COMMANDES LINUX CRITIQUES ──────────────────────────────────────────────
# Surveillance système temps réel
top / htop / btop                         # Processus CPU/RAM
iotop -o                                  # Processus I/O disque
nethogs                                   # Bande passante par processus
sar -u 1 5                               # CPU sur 5 secondes
vmstat 1 5                               # CPU/RAM/Swap/I/O
free -h                                  # Mémoire (RAM + Swap)
```

---

## Module 3 — Atelier Pratique : Diagnostic Système Complet (1h30)

### 🛠️ Script Python : System Health Checker — Révision S1–S4

```python
#!/usr/bin/env python3
"""
PARADIS — System Health Checker (Révision S1–S4)
Vérifie la santé complète d'un système Linux : CPU, RAM, Disque, Réseau, Services.
"""
import subprocess
import shutil
import socket
import time
from dataclasses import dataclass, field
from typing import List, Optional, Tuple

@dataclass
class HealthCheck:
    name    : str
    status  : str   # "OK" | "WARNING" | "CRITICAL" | "UNKNOWN"
    value   : str
    details : str = ""

class SystemHealthChecker:
    """Effectue un diagnostic complet d'un système Linux"""

    def _run(self, cmd: List[str]) -> Tuple[str, int]:
        try:
            result = subprocess.run(cmd, capture_output=True, text=True, timeout=5)
            return result.stdout.strip(), result.returncode
        except (subprocess.TimeoutExpired, FileNotFoundError):
            return "", 1

    def check_disk(self, threshold_warning=70, threshold_critical=90) -> List[HealthCheck]:
        checks = []
        out, rc = self._run(["df", "-h", "--output=target,pcent"])
        if rc != 0:
            return [HealthCheck("Disque", "UNKNOWN", "N/A", "df indisponible")]

        for line in out.splitlines()[1:]:
            parts = line.split()
            if len(parts) < 2:
                continue
            mount, pct_str = parts[0], parts[1].rstrip("%")
            try:
                pct = int(pct_str)
            except ValueError:
                continue
            if pct >= threshold_critical:
                status = "CRITICAL"
            elif pct >= threshold_warning:
                status = "WARNING"
            else:
                status = "OK"
            checks.append(HealthCheck(f"Disque {mount}", status, f"{pct}%",
                                       f"Seuils: W={threshold_warning}% C={threshold_critical}%"))
        return checks

    def check_load_average(self) -> HealthCheck:
        try:
            with open("/proc/loadavg") as f:
                content = f.read().split()
            load1, load5, load15 = float(content[0]), float(content[1]), float(content[2])
            # Normaliser par le nombre de CPUs
            cpu_count = int(self._run(["nproc"])[0] or 1)
            load_ratio = load1 / cpu_count
            if load_ratio >= 1.5:
                status = "CRITICAL"
            elif load_ratio >= 1.0:
                status = "WARNING"
            else:
                status = "OK"
            return HealthCheck("Load Average (1m)", status,
                               f"{load1:.2f} ({load_ratio:.0%} de {cpu_count} CPUs)",
                               f"Load 5m={load5:.2f} Load 15m={load15:.2f}")
        except Exception as e:
            return HealthCheck("Load Average", "UNKNOWN", "N/A", str(e))

    def check_memory(self) -> HealthCheck:
        try:
            with open("/proc/meminfo") as f:
                lines = {k: int(v.split()[0]) for line in f for k, v in [line.rstrip().split(":", 1)]}
            total = lines["MemTotal"]
            available = lines.get("MemAvailable", lines.get("MemFree", 0))
            used_pct = int((1 - available / total) * 100)
            if used_pct >= 90:
                status = "CRITICAL"
            elif used_pct >= 75:
                status = "WARNING"
            else:
                status = "OK"
            return HealthCheck("Mémoire RAM", status, f"{used_pct}% utilisée",
                               f"Total: {total//1024} MB | Dispo: {available//1024} MB")
        except Exception as e:
            return HealthCheck("Mémoire RAM", "UNKNOWN", "N/A", str(e))

    def check_tcp_port(self, host: str, port: int, timeout: float = 2.0) -> HealthCheck:
        try:
            sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            sock.settimeout(timeout)
            result = sock.connect_ex((host, port))
            sock.close()
            if result == 0:
                return HealthCheck(f"Port TCP {host}:{port}", "OK", "Ouvert")
            else:
                return HealthCheck(f"Port TCP {host}:{port}", "CRITICAL", "Fermé/Refusé",
                                   f"Code d'erreur socket: {result}")
        except Exception as e:
            return HealthCheck(f"Port TCP {host}:{port}", "UNKNOWN", "N/A", str(e))

    def run_full_audit(self, ports_to_check=None) -> List[HealthCheck]:
        all_checks = []
        all_checks.extend(self.check_disk())
        all_checks.append(self.check_load_average())
        all_checks.append(self.check_memory())
        for host, port in (ports_to_check or [("localhost", 22)]):
            all_checks.append(self.check_tcp_port(host, port))
        return all_checks

    def print_report(self, checks: List[HealthCheck]):
        icons = {"OK": "🟢", "WARNING": "🟡", "CRITICAL": "🔴", "UNKNOWN": "⚪"}
        print("=" * 70)
        print("  PARADIS — SYSTEM HEALTH REPORT (Révision S1–S4)")
        print("=" * 70)
        for c in checks:
            icon = icons.get(c.status, "❓")
            print(f"  {icon} [{c.status:8s}] {c.name:30s} : {c.value}")
            if c.details:
                print(f"             {'':30s}   {c.details}")
        criticals = sum(1 for c in checks if c.status == "CRITICAL")
        warnings  = sum(1 for c in checks if c.status == "WARNING")
        print("─" * 70)
        print(f"  Bilan : {len(checks)} vérifications | 🔴 {criticals} critiques | 🟡 {warnings} avertissements")
        print("=" * 70)


if __name__ == "__main__":
    checker = SystemHealthChecker()
    checks  = checker.run_full_audit(ports_to_check=[("localhost", 22), ("8.8.8.8", 53)])
    checker.print_report(checks)
```

---

## Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **SIGHUP** | Signal HangUp (1) — Recharge de configuration pour la plupart des démons Unix |
| **SIGKILL** | Signal Kill (9) — Terminaison immédiate non-interceptable d'un processus |
| **VLSM** | Variable Length Subnet Masking — Sous-réseaux de longueurs variables pour optimisation IPv4 |
| **ss** | Socket Statistics — Outil Linux moderne remplaçant netstat pour l'affichage des sockets actifs |
| **MTR** | My TraceRoute — Outil combinant ping et traceroute pour diagnostique réseau dynamique |

---

## Exercices Pratiques

### Exercice 1 — Calcul CIDR & Sous-Résaux VLSM

Vous devez découper le réseau **172.16.0.0/16** pour héberger 3 réseaux :
- **VLAN 10 Production** : 500 hôtes max
- **VLAN 20 Développement** : 120 hôtes max
- **VLAN 30 Management** : 30 hôtes max

Attribuez les sous-réseaux les plus petits possibles (VLSM) dans l'ordre décroissant de taille.

**Corrigé :**
1. **VLAN 10 (500 hôtes)** : Besoin de 502 adresses (500 hôtes + réseau + broadcast) → /23 = 512 adresses. Attribution : **172.16.0.0/23** (172.16.0.0 – 172.16.1.255).
2. **VLAN 20 (120 hôtes)** : Besoin de 122 → /25 = 128 adresses. Attribution : **172.16.2.0/25** (172.16.2.0 – 172.16.2.127).
3. **VLAN 30 (30 hôtes)** : Besoin de 32 → /27 = 32 adresses. Attribution : **172.16.2.128/27** (172.16.2.128 – 172.16.2.159).

---

## Banque QCM — 5 Questions

**Q1.** Quelle commande Linux affiche les **sockets TCP/UDP en écoute** avec les PIDs des processus associés (successeur moderne de `netstat`) ?

- A) `netstat -tulpn`
- B) `ss -tulpn` ✅
- C) `lsof -i`
- D) `ifconfig -a`

**Q2.** Quel signal Unix **termine immédiatement** un processus et **ne peut pas être intercepté** ni ignoré par le processus cible ?

- A) SIGTERM (15)
- B) SIGHUP (1)
- C) SIGKILL (9) ✅
- D) SIGINT (2)

**Q3.** Dans un script Bash, que fait l'option `set -euo pipefail` ?

- A) Active le mode débogage (affiche chaque commande exécutée).
- B) Arrête le script sur toute erreur (`-e`), considère les variables non définies comme erreur (`-u`), et propage les erreurs dans les pipes (`-o pipefail`). ✅
- C) Désactive les messages d'erreur.
- D) Active le mode interactif.

**Q4.** Quelle est la **notation CIDR** correcte pour un masque de sous-réseau `255.255.255.192` ?

- A) /24
- B) /25
- C) /26 ✅
- D) /27

> /26 = 11111111.11111111.11111111.11000000 = 64 adresses (62 hôtes)

**Q5.** La commande `journalctl -u nginx -f --since "2 hours ago"` affiche :

- A) Tous les journaux système depuis 2 heures.
- B) Les journaux du service nginx des 2 dernières heures en mode suivi temps réel (comme `tail -f`). ✅
- C) La configuration de nginx.
- D) Les connexions réseau nginx des 2 dernières heures.

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
