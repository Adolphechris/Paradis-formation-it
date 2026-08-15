# Jour J0H — Le Métier d'Administrateur Système : Gardien de l'Infrastructure

> [!NOTE]
> **SEMESTRE 0 — PARCOURS D'INITIATION ET SOCLE DE PRÉ-REQUIS ABSOLUS (J0a–J0o)**
> Cette leçon explore en profondeur le métier d'administrateur système (SysAdmin) : responsabilités quotidiennes, outils professionnels, trajectoire de carrière et compétences fondamentales que vous développerez tout au long de cette Masterclass.

---

## 🎯 Objectifs de la Leçon

- 🖥️ Comprendre le rôle complet d'un administrateur système en entreprise.
- 📋 Découvrir les responsabilités quotidiennes, hebdomadaires et mensuelles d'un SysAdmin.
- 🔧 Explorer l'écosystème d'outils d'un SysAdmin moderne (Ansible, Terraform, monitoring).
- 📊 Comprendre les concepts de SLA, SLO, et la culture on-call.
- 🚀 Tracer le chemin du SysAdmin junior vers le SRE/DevOps/Architecte senior.

---

## 🖼️ Le SysAdmin : Pilote de l'Infrastructure

![SysAdmin](https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800)

---

## 📖 1. Qui est l'Administrateur Système ?

### 1.1 Narration & Intuition — Le Chef Mécanicien du Numérique

Imaginez une grande ville comme Toronto ou Montréal. Elle fonctionne grâce à une infrastructure invisible mais critique : l'électricité, l'eau, les égouts, les transports. Si l'un de ces systèmes tombe en panne, la ville s'arrête. Dans le monde numérique, c'est exactement le rôle de l'**administrateur système** : maintenir l'infrastructure invisible qui fait tourner les entreprises.

L'administrateur système est à la fois :
- 🔧 **Mécanicien** : il répare ce qui ne fonctionne pas
- 🏗️ **Architecte** : il conçoit et déploie l'infrastructure
- 🛡️ **Gardien** : il sécurise et protège les systèmes
- 📊 **Analyste** : il monitore et optimise les performances
- 👥 **Support** : il aide les utilisateurs et les développeurs

Sans administrateurs système, aucune application ne tournerait, aucun email ne s'enverrait, aucune transaction bancaire ne s'effectuerait.

### 1.2 L'Évolution du Rôle : SysAdmin → DevOps → SRE

```
ANNÉES 90-2000 : SysAdmin traditionnel
  → Gérait des serveurs physiques en salle des machines
  → Installait des OS depuis des CD-ROMs
  → Corriger les pannes manuellement

ANNÉES 2000-2010 : SysAdmin moderne
  → Virtualisation (VMware, Hyper-V)
  → Premiers scripts de déploiement (Bash, Ruby)
  → Monitoring professionnel (Nagios, Zabbix)

ANNÉES 2010-2020 : Naissance du DevOps
  → Infrastructure as Code (Ansible, Puppet, Chef)
  → Cloud (AWS, Azure, GCP)
  → Conteneurs (Docker, Kubernetes)

ANNÉES 2020+ : SRE & Platform Engineer
  → Site Reliability Engineering (SLO, Error Budgets)
  → GitOps et déploiements automatisés
  → IA/ML intégrés à l'observabilité
```

---

## 📖 2. Une Journée dans la Vie d'un SysAdmin

### 2.1 Le Matin — Rituels et Veille

```
08h00 — Vérification des tableaux de bord de monitoring
         → Les alertes ont-elles déclenché pendant la nuit ?
         → Tous les services critiques sont-ils UP (actifs) ?

08h30 — Revue des logs de la nuit
         → sudo journalctl --since "yesterday" -p err
         → Vérification des tentatives de connexion SSH suspectes

09h00 — Réunion standup avec l'équipe (15 min)
         → Hier : qu'est-ce qui a été fait ?
         → Aujourd'hui : quelles tâches sont prévues ?
         → Blocages : quels obstacles existent ?

09h15 — Traitement du ticket backlog (JIRA, ServiceNow, Linear)
         → Tickets de haute priorité en premier
         → Répondre aux demandes utilisateurs
```

### 2.2 La Journée — Tâches Opérationnelles

**Gestion des utilisateurs :**
```bash
# Créer un nouvel utilisateur Linux
sudo useradd -m -s /bin/bash -G sudo jean.dupont
sudo passwd jean.dupont

# Vérifier les utilisateurs du système
cat /etc/passwd | grep -v nologin | grep -v false

# Supprimer un utilisateur (départ d'entreprise)
sudo userdel -r jean.dupont    # -r supprime aussi le répertoire home

# Modifier les groupes d'un utilisateur
sudo usermod -aG docker jean.dupont    # Ajouter au groupe docker
```

**Gestion des sauvegardes :**
```bash
# Sauvegarde tar avec compression gzip
tar -czf /backup/db_$(date +%Y%m%d).tar.gz /var/lib/postgresql/

# Synchronisation vers un serveur distant avec rsync
rsync -avz --progress /data/ backup@192.168.1.100:/backup/data/

# Vérification de l'intégrité d'une sauvegarde
md5sum /backup/db_20241201.tar.gz > /backup/checksums.md5
md5sum -c /backup/checksums.md5    # Vérifie si le fichier est intact
```

**Mise à jour et patching :**
```bash
# Lister les mises à jour disponibles (sans installer)
apt list --upgradable 2>/dev/null

# Installer uniquement les patchs de sécurité
sudo apt update && sudo unattended-upgrade --dry-run

# Redémarrage planifié après mise à jour critique
sudo shutdown -r +60 "Redémarrage planifié dans 60 minutes pour mise à jour sécurité"
```

### 2.3 Monitoring & Surveillance

```bash
# Vérifier l'espace disque sur tous les serveurs critiques
df -h | awk '$5 > 80 {print "⚠️ ALERTE:", $6, ":", $5, "utilisé"}'

# Vérifier la mémoire disponible
free -h | awk '/Mem/{if ($7+0 < 500) print "⚠️ ALERTE: RAM disponible:", $7}'

# Processus zombie (signe d'un problème applicatif)
ps aux | awk '$8 == "Z" {print "Zombie PID:", $2, "Commande:", $11}'

# Test de connectivité vers les services critiques
for service in web.example.com db.example.com mail.example.com; do
  if ping -c1 -W2 $service &>/dev/null; then
    echo "✅ $service : OK"
  else
    echo "❌ $service : INACCESSIBLE — DÉCLENCHER ALERTE"
  fi
done
```

---

## 📖 3. Les Responsabilités Périodiques

### 3.1 Responsabilités Hebdomadaires

| Tâche | Fréquence | Outil |
|:---|:---:|:---|
| Revue des rapports de sécurité | Hebdo | SIEM, journalctl |
| Vérification des sauvegardes | Hebdo | rsync, tar, test de restauration |
| Mise à jour des patchs non-critiques | Hebdo | apt, dnf |
| Revue des capacités (CPU/RAM/Disk trends) | Hebdo | Grafana, Prometheus |
| Audit des accès utilisateurs | Hebdo | `/var/log/auth.log` |

### 3.2 Responsabilités Mensuelles

| Tâche | Fréquence | Description |
|:---|:---:|:---|
| Test de restauration sauvegarde | Mensuel | Simuler la restauration complète d'un serveur |
| Revue des règles firewall | Mensuel | Supprimer les règles obsolètes |
| Rotation des secrets/mots de passe | Mensuel | Clés API, certificats, comptes de service |
| Plan de capacité | Mensuel | Anticiper les besoins futurs en ressources |
| Rapport de disponibilité | Mensuel | Calculer l'uptime réel vs SLA |

---

## 📖 4. SLA, SLO, SLI — Les Concepts de Fiabilité

### 4.1 Le Triangle de la Fiabilité

```
SLA (Service Level Agreement)
  → Contrat avec le client : "Nous garantissons 99,9% de disponibilité"
  → Conséquence si non respecté : pénalités financières, crédits

SLO (Service Level Objective)
  → Objectif interne : "Nous visons 99,95%" (marge avant pénalité SLA)
  → Défini par l'équipe technique

SLI (Service Level Indicator)
  → Mesure réelle : "Notre uptime actuel est de 99,97%"
  → Les métriques collectées (Prometheus, Datadog, CloudWatch)
```

### 4.2 Calcul de la Disponibilité

| SLA | Downtime/an | Downtime/mois | Downtime/semaine |
|:---:|:---:|:---:|:---:|
| **99%** | 3j 15h 36min | 7h 12min | 1h 40min |
| **99,9%** (three nines) | 8h 45min | 43min | 10min |
| **99,99%** (four nines) | 52min | 4min | 1min |
| **99,999%** (five nines) | 5min | 26sec | 6sec |

```bash
# Calculer l'uptime de votre propre système
uptime
# Output: 18:45:23 up 42 days, 6:15, 2 users, load average: 0.15, 0.12, 0.10

# Voir l'historique des reboots (donc les pannes potentielles)
last reboot | head -10
```

---

## 📖 5. L'Écosystème d'Outils du SysAdmin Moderne

### 5.1 Configuration & Automatisation

```bash
# Ansible — Automatisation agentless (SSH + YAML)
# Installation
sudo apt install ansible -y

# Ping tous les serveurs d'inventaire
ansible all -i inventaire.ini -m ping

# Exemple de playbook Ansible (déployer nginx sur 50 serveurs)
# Contenu de deploy-nginx.yml:
cat > /tmp/deploy-nginx.yml << 'EOF'
---
- name: Déployer Nginx
  hosts: webservers
  become: yes
  tasks:
    - name: Installer nginx
      apt:
        name: nginx
        state: present
    - name: Démarrer nginx
      systemd:
        name: nginx
        state: started
        enabled: yes
EOF

# Lancer le playbook
ansible-playbook -i inventaire.ini /tmp/deploy-nginx.yml
```

### 5.2 Monitoring — Prometheus + Grafana Stack

```bash
# Vérifier si Prometheus est installé
prometheus --version 2>/dev/null || echo "Prometheus non installé"

# Voir les métriques systèmes exposées par node_exporter
curl -s http://localhost:9100/metrics | grep "node_cpu" | head -5
# Output: # HELP node_cpu_seconds_total + valeurs CPU par mode
```

---

## 🧪 Atelier Pratique : Simulation SysAdmin Junior

```bash
# Scénario : Vous arrivez le matin sur un nouveau serveur Linux
# Exercice complet d'inventaire système

echo "=== RAPPORT SYSTÈME $(hostname) — $(date) ==="
echo ""
echo "--- OS & Kernel ---"
uname -a
cat /etc/os-release | grep -E "^(NAME|VERSION)="

echo ""
echo "--- CPU ---"
lscpu | grep -E "(Architecture|CPU\(s\)|Model name|MHz)"

echo ""
echo "--- Mémoire ---"
free -h

echo ""
echo "--- Disques ---"
df -h | grep -v tmpfs

echo ""
echo "--- Services actifs ---"
systemctl list-units --type=service --state=running | grep -v "^$" | head -15

echo ""
echo "--- Ports en écoute ---"
sudo ss -tlnp

echo ""
echo "--- Dernières connexions ---"
last | head -5

echo ""
echo "--- Charge système (Load Average) ---"
uptime

echo ""
echo "=== FIN DU RAPPORT ==="
```

---

## ⚠️ Erreurs Fréquentes & Debugging

> [!WARNING]
> **Erreur #1 : Exécuter des commandes destructrices en production sans tester en staging**
> `rm -rf /var/data/` sur le mauvais serveur a mis fin à des carrières. Toujours vérifier l'hostname (`hostname`) avant toute commande destructrice.

> [!WARNING]
> **Erreur #2 : Ne pas documenter les changements faits en urgence**
> Un changement non documenté à 3h du matin est une bombe à retardement. Utilisez toujours un ticket ou au minimum un commentaire dans les logs : `logger "CHANGEMENT URGENT: ouverture port 8443 par jean.dupont pour ticket #4521"`

> [!WARNING]
> **Erreur #3 : Ignorer les alertes de disk space**
> Un disque plein est l'une des pannes les plus fréquentes et les plus évitables. Configurez des alertes à 80% d'utilisation.

> [!TIP]
> **Bonne pratique : Toujours travailler dans un tmux avant une opération risquée**
> Si votre connexion SSH se coupe pendant une opération critique, la session tmux continue sur le serveur. `tmux new -s maintenance` avant tout travail de fond.

---

## ❓ Banque de QCM — Test du Jour (8 Questions)

**Q1 : Quelle commande Linux permet de créer un utilisateur avec un répertoire home et un shell Bash ?**
- A) `adduser jean`
- B) `useradd -m -s /bin/bash jean`
- C) `create-user --home jean`
- D) `mkuser jean`

*Réponse : B — `useradd -m` crée le répertoire home, `-s /bin/bash` définit le shell de connexion.*

**Q2 : Un SLA de 99,9% permet combien de minutes de downtime par mois ?**
- A) 1 minute
- B) 43 minutes
- C) 7 heures
- D) 24 heures

*Réponse : B — 99,9% (three nines) correspond à environ 43 minutes de downtime autorisé par mois.*

**Q3 : Quelle est la différence entre SLA et SLO ?**
- A) Le SLA est interne, le SLO est contractuel avec le client
- B) Le SLA est le contrat client (souvent moins strict), le SLO est l'objectif interne (plus strict)
- C) Ce sont deux termes identiques
- D) Le SLO concerne le réseau, le SLA concerne les serveurs

*Réponse : B — Le SLA est la promesse contractuelle au client. L'équipe IT se fixe un SLO plus ambitieux pour garder une marge de sécurité avant de violer le SLA.*

**Q4 : Quelle commande permet d'afficher depuis combien de temps un serveur Linux est actif (uptime) ?**
- A) `systemctl status`
- B) `ps uptime`
- C) `uptime`
- D) `last boot`

*Réponse : C — La commande `uptime` affiche le temps écoulé depuis le dernier démarrage, le nombre d'utilisateurs connectés et le load average.*

**Q5 : Quel outil d'automatisation IT utilise SSH et des fichiers YAML (sans agent installé sur les serveurs cibles) ?**
- A) Puppet
- B) Chef
- C) Ansible
- D) SaltStack

*Réponse : C — Ansible est "agentless" : il se connecte aux serveurs via SSH et exécute les tâches définies en YAML (playbooks) sans nécessiter l'installation d'un agent sur les machines cibles.*

**Q6 : Quelle commande permet de sauvegarder le répertoire /data/ vers un serveur distant via SSH ?**
- A) `scp -r /data/ backup@server:/backup/`
- B) `rsync -avz /data/ backup@server:/backup/`
- C) `tar -czf backup@server:/backup/data.tar.gz /data/`
- D) `cp -r /data/ ssh://backup@server/backup/`

*Réponse : B — `rsync` est l'outil standard pour la synchronisation et sauvegarde car il ne transfère que les fichiers modifiés (delta transfer), économisant la bande passante.*

**Q7 : Que fait la commande `sudo userdel -r jean.dupont` ?**
- A) Renomme l'utilisateur jean.dupont
- B) Réinitialise le mot de passe de l'utilisateur
- C) Supprime l'utilisateur ET son répertoire home
- D) Désactive temporairement l'utilisateur

*Réponse : C — `-r` supprime le répertoire home et la boîte mail de l'utilisateur en même temps que le compte. Attention, opération irréversible.*

**Q8 : Quel terme désigne la pratique d'être joignable 24/7 pour répondre aux incidents en dehors des heures de bureau ?**
- A) Remote work
- B) On-call (astreinte)
- C) Helpdesk
- D) NOC monitoring

*Réponse : B — L'astreinte (on-call) est une rotation où chaque ingénieur est joignable à tour de rôle pour gérer les incidents urgents. C'est une réalité du métier SysAdmin/SRE.*

---

## 📚 Ressources & Références

- **The Practice of System and Network Administration** (Limoncelli) — La Bible du SysAdmin
- **Google SRE Book** (gratuit) : https://sre.google/sre-book/table-of-contents/
- **Linux System Administration Handbook** (Nemeth et al.)
- **r/sysadmin** sur Reddit : https://www.reddit.com/r/sysadmin/
- **SAGE/USENIX** — Communauté professionnelle des administrateurs système

---

*Semestre 0 — Module d'Initiation & Pré-requis Absolus PARADIS IT Masterclass*
