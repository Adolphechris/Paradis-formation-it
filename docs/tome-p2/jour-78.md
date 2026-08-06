# TOME P2 — Réseaux & Télécoms — Jour 78 (6h) : Infrastructure as Code — Terraform & Ansible

> [!NOTE]
> **Objectif du jour :** Maîtriser l'Infrastructure as Code (IaC) avec Terraform (provisionnement de l'infrastructure) et Ansible (configuration et automatisation des systèmes). Ces outils permettent de reproduire une infrastructure entière à partir du code — essentiel pour la résilience et la conformité en environnement bancaire.
>
> **Compétences visées :** `BIT-08` (A) — Infrastructure as Code | `BIT-09` (A) — Automatisation Système

---

## 1) Module — Terraform : Provisionnement d'Infrastructure (2h)

### 📖 Narration/Intuition

Imaginez devoir recréer toute l'infrastructure de la BCC après un sinistre : 20 serveurs, leurs configurations réseau, leurs règles de firewall, leurs volumes de stockage. Manuellement, cela prendrait des semaines et serait sujet aux erreurs humaines. Avec **Terraform**, l'infrastructure entière est décrite en code HCL (HashiCorp Configuration Language) — recréer tout l'environnement ne prend que quelques minutes et est 100% reproductible.

### 🔍 Anatomie Technique

**Concepts fondamentaux Terraform :**

```
Provider : Plugin qui communique avec un cloud/système spécifique
  (AWS, Azure, GCP, DigitalOcean, Proxmox, VMware, libvirt...)

Resource : Composant d'infrastructure à créer
  (VM, réseau, firewall, DNS, bucket S3...)

State : Fichier qui enregistre l'état actuel de l'infrastructure gérée
  (terraform.tfstate — à ne JAMAIS committer tel quel en Git)

Data Source : Données lues depuis le provider (pas créées)
  (lire un AMI existant, une IP élastique déjà créée...)

Module : Groupe réutilisable de ressources
  (module "serveur_web" encapsulant VM + DNS + Security Group)

Workspace : Environnements séparés (dev, staging, prod) avec le même code
```

**Premier Terraform — VM Linux locale avec libvirt :**

```hcl
# ─── main.tf — Infrastructure BCC (serveur local Proxmox/libvirt) ────────────

terraform {
  required_version = ">= 1.6.0"
  required_providers {
    libvirt = {
      source  = "dmacvicar/libvirt"
      version = "~> 0.7.0"
    }
  }
  # Backend distant : stockage du state dans S3 ou Terraform Cloud (pas en local)
  # backend "s3" { bucket = "bcc-tfstate"; key = "prod/terraform.tfstate" }
}

# ─── Variables (bonnes pratiques : typer et décrire chaque variable) ──────────
variable "environnement" {
  description = "Environnement cible (dev, staging, prod)"
  type        = string
  default     = "dev"
  
  validation {
    condition     = contains(["dev", "staging", "prod"], var.environnement)
    error_message = "Environnement doit être dev, staging ou prod."
  }
}

variable "nombre_serveurs" {
  description = "Nombre de serveurs API à déployer"
  type        = number
  default     = 2
}

# ─── Configuration Provider ───────────────────────────────────────────────────
provider "libvirt" {
  uri = "qemu:///system"    # Connection QEMU/KVM local
}

# ─── Ressources ────────────────────────────────────────────────────────────────

# Image de base Ubuntu 22.04
resource "libvirt_volume" "ubuntu_base" {
  name   = "ubuntu-22.04-base.qcow2"
  pool   = "default"
  source = "https://cloud-images.ubuntu.com/jammy/current/jammy-server-cloudimg-amd64.img"
  format = "qcow2"
}

# Réseau isolé pour la BCC
resource "libvirt_network" "bcc_net" {
  name      = "bcc-${var.environnement}"
  mode      = "nat"
  domain    = "bcc.internal"
  addresses = ["10.100.0.0/24"]
  
  dhcp { enabled = true }
  
  dns {
    enabled    = true
    local_only = true
  }
}

# Serveurs API (count = plusieurs instances identiques)
resource "libvirt_volume" "api_server" {
  count          = var.nombre_serveurs
  name           = "bcc-api-${var.environnement}-${count.index}.qcow2"
  base_volume_id = libvirt_volume.ubuntu_base.id
  pool           = "default"
  size           = 20 * 1024 * 1024 * 1024   # 20 GB
}

resource "libvirt_domain" "api_server" {
  count  = var.nombre_serveurs
  name   = "bcc-api-${var.environnement}-${count.index}"
  memory = 2048   # MB
  vcpu   = 2
  
  disk {
    volume_id = libvirt_volume.api_server[count.index].id
  }
  
  network_interface {
    network_id = libvirt_network.bcc_net.id
    hostname   = "bcc-api-${count.index}"
    wait_for_lease = true
  }
  
  # Cloud-init pour le provisionnement initial
  cloudinit = libvirt_cloudinit_disk.init[count.index].id
}

# Cloud-init : configuration initiale des VMs
resource "libvirt_cloudinit_disk" "init" {
  count     = var.nombre_serveurs
  name      = "init-${count.index}.iso"
  pool      = "default"
  user_data = templatefile("${path.module}/cloud-init/user-data.tftpl", {
    hostname    = "bcc-api-${count.index}"
    ssh_pub_key = file("~/.ssh/id_ed25519.pub")
  })
}

# ─── Outputs ──────────────────────────────────────────────────────────────────
output "api_server_ips" {
  description = "Adresses IP des serveurs API"
  value = [
    for vm in libvirt_domain.api_server : vm.network_interface[0].addresses[0]
  ]
}
```

**Commandes Terraform essentielles :**

```bash
terraform init        # Initialiser (télécharger les providers)
terraform plan        # Afficher les changements prévus (dry run)
terraform apply       # Appliquer les changements
terraform apply -auto-approve  # Sans confirmation (CI/CD uniquement)
terraform destroy     # Supprimer toute l'infrastructure
terraform show        # Afficher le state actuel
terraform output      # Afficher les outputs
terraform fmt         # Formater le code HCL
terraform validate    # Valider la syntaxe des fichiers .tf

# Plans dans des fichiers (bonne pratique CI/CD)
terraform plan -out=tfplan
terraform apply tfplan
```

---

## 2) Module — Ansible : Configuration des Systèmes (2h)

### 📖 Narration/Intuition

**Terraform** crée l'infrastructure (les machines). **Ansible** configure les machines (installe les logiciels, applique les politiques de sécurité, déploie les applications). Ansible est **agentless** : il se connecte en SSH aux serveurs et exécute les tâches — pas besoin d'installer un agent sur les machines cibles.

### 🔍 Anatomie Technique

**Structure d'un projet Ansible :**

```
bcc-infrastructure/
├── inventory/
│   ├── production.yml      # Inventaire des serveurs de prod
│   └── staging.yml         # Inventaire staging
├── group_vars/
│   ├── all.yml             # Variables communes à tous les groupes
│   ├── web_servers.yml     # Variables spécifiques aux serveurs web
│   └── db_servers.yml      # Variables spécifiques aux serveurs DB
├── host_vars/
│   └── db-01.bcc.cd.yml   # Variables spécifiques à ce serveur
├── roles/
│   ├── common/             # Rôle appliqué à TOUS les serveurs (durcissement de base)
│   ├── nginx/              # Rôle serveur web
│   ├── postgresql/         # Rôle base de données
│   └── docker/             # Rôle installation Docker
└── playbooks/
    ├── deploy-api.yml      # Déploiement de l'API
    └── hardening.yml       # Playbook de durcissement sécurité
```

**Inventaire Ansible :**

```yaml
# inventory/production.yml
all:
  vars:
    ansible_user: ubuntu
    ansible_ssh_private_key_file: ~/.ssh/bcc_deploy_key
    ansible_ssh_common_args: '-o StrictHostKeyChecking=accept-new'
  
  children:
    web_servers:
      hosts:
        bcc-api-0:
          ansible_host: 10.100.0.101
        bcc-api-1:
          ansible_host: 10.100.0.102
    
    db_servers:
      hosts:
        bcc-db-01:
          ansible_host: 10.100.0.200
          postgresql_version: "16"
          max_connections: 200
    
    monitoring:
      hosts:
        bcc-siem:
          ansible_host: 10.100.0.250
```

**Playbook de durcissement Linux (hardening.yml) :**

```yaml
# playbooks/hardening.yml
---
- name: "Durcissement Linux — BCC Security Baseline"
  hosts: all
  become: yes    # sudo
  vars:
    # Ports SSH autorisés (liste des IPs du bastion)
    allowed_ssh_ips:
      - 10.0.200.50    # Bastion SSH
    
    # Packages à désinstaller (surface d'attaque)
    packages_a_supprimer:
      - telnet
      - rsh-client
      - xinetd
      - nis
      - tftp
  
  tasks:
    # ─── Mise à jour et packages de sécurité ─────────────────────────────────
    - name: Mise à jour du système
      apt:
        upgrade: dist
        update_cache: yes
        autoremove: yes
      when: ansible_os_family == "Debian"
    
    - name: Supprimer les packages dangereux
      apt:
        name: "{{ packages_a_supprimer }}"
        state: absent
    
    - name: Installer les outils de sécurité
      apt:
        name:
          - fail2ban
          - auditd
          - rkhunter
          - unattended-upgrades
          - apt-listchanges
        state: present
    
    # ─── Configuration SSH ────────────────────────────────────────────────────
    - name: Configurer sshd sécurisé
      template:
        src: templates/sshd_config.j2
        dest: /etc/ssh/sshd_config
        mode: '0600'
        validate: '/usr/sbin/sshd -t -f %s'
      notify: Restart SSH
    
    # ─── Fail2ban — protection anti brute force ───────────────────────────────
    - name: Configurer fail2ban SSH
      copy:
        dest: /etc/fail2ban/jail.d/sshd.conf
        content: |
          [sshd]
          enabled = true
          port = 22
          filter = sshd
          logpath = /var/log/auth.log
          maxretry = 3
          bantime = 3600
          findtime = 600
      notify: Restart Fail2ban
    
    # ─── Kernel hardening (sysctl) ────────────────────────────────────────────
    - name: Paramètres kernel sécurisés
      sysctl:
        name: "{{ item.key }}"
        value: "{{ item.value }}"
        sysctl_set: yes
        reload: yes
      loop:
        - { key: "kernel.randomize_va_space", value: "2" }    # ASLR
        - { key: "net.ipv4.conf.all.rp_filter", value: "1" }  # Reverse path filtering
        - { key: "net.ipv4.tcp_syncookies", value: "1" }      # SYN cookies (anti SYN flood)
        - { key: "kernel.dmesg_restrict", value: "1" }        # Restreindre dmesg
        - { key: "kernel.core_uses_pid", value: "1" }         # Noms de core uniques
    
    # ─── Audit ────────────────────────────────────────────────────────────────
    - name: Configurer auditd
      copy:
        dest: /etc/audit/rules.d/bcc-audit.rules
        content: |
          # Surveiller les modifications de fichiers sensibles
          -w /etc/passwd -p wa -k identity
          -w /etc/shadow -p wa -k identity
          -w /etc/sudoers -p wa -k privilege_escalation
          -w /var/log/auth.log -p wa -k auth_logs
          # Surveiller les connexions réseau (TCP bind)
          -a always,exit -F arch=b64 -S bind -k network_bind
      notify: Restart Auditd
  
  handlers:
    - name: Restart SSH
      service: name=ssh state=restarted
    
    - name: Restart Fail2ban
      service: name=fail2ban state=restarted
    
    - name: Restart Auditd
      service: name=auditd state=restarted
```

**Exécution des playbooks :**

```bash
# Tester la connectivité (ping Ansible)
ansible all -i inventory/production.yml -m ping

# Exécuter en mode dry-run (vérifier sans modifier)
ansible-playbook -i inventory/production.yml playbooks/hardening.yml --check --diff

# Exécuter le playbook réellement
ansible-playbook -i inventory/production.yml playbooks/hardening.yml

# Cibler un groupe spécifique
ansible-playbook -i inventory/production.yml playbooks/hardening.yml --limit web_servers

# Afficher les variables d'un hôte
ansible-inventory -i inventory/production.yml --host bcc-api-0
```

---

## 3) Module — Terraform + Ansible : Pipeline IaC Complet (2h)

### 📖 Narration/Intuition

Terraform et Ansible sont complémentaires. Le workflow typique : Terraform crée les VMs → un script récupère les IPs → Ansible configure les VMs. Ce pipeline peut être entièrement automatisé dans CI/CD.

### 🔍 Anatomie Technique

**Script de pipeline IaC (Terraform → Ansible) :**

```bash
#!/bin/bash
# deploy-infrastructure.sh — Pipeline IaC complet BCC
set -euo pipefail

ENV="${1:-staging}"
echo "=== Déploiement Infrastructure BCC — Environnement: $ENV ==="

# ─── Phase 1 : Terraform (provisionnement) ───────────────────────────────────
echo "[1/3] Terraform — Provisionnement de l'infrastructure..."
cd terraform/

terraform init
terraform workspace select "$ENV" 2>/dev/null || terraform workspace new "$ENV"
terraform plan -var="environnement=$ENV" -out=tfplan
terraform apply tfplan

# Récupérer les IPs des serveurs provisionnés
terraform output -json api_server_ips > /tmp/api_ips.json

echo "Serveurs créés :"
cat /tmp/api_ips.json

# ─── Phase 2 : Générer l'inventaire Ansible dynamique ────────────────────────
echo "[2/3] Génération de l'inventaire Ansible..."
cd ../ansible/

python3 << 'PYEOF'
import json
import yaml

with open('/tmp/api_ips.json') as f:
    ips = json.load(f)

inventory = {
    'all': {
        'vars': {
            'ansible_user': 'ubuntu',
            'ansible_ssh_private_key_file': '~/.ssh/bcc_deploy_key'
        },
        'children': {
            'web_servers': {
                'hosts': {
                    f'bcc-api-{i}': {'ansible_host': ip}
                    for i, ip in enumerate(ips)
                }
            }
        }
    }
}

with open(f'/tmp/inventory-dynamic.yml', 'w') as f:
    yaml.dump(inventory, f, default_flow_style=False)

print(f"Inventaire généré pour {len(ips)} serveurs")
PYEOF

# ─── Phase 3 : Ansible (configuration) ────────────────────────────────────────
echo "[3/3] Ansible — Configuration des serveurs..."
# Attendre que SSH soit disponible
sleep 30

ansible-playbook \
    -i /tmp/inventory-dynamic.yml \
    playbooks/hardening.yml \
    playbooks/deploy-api.yml \
    --extra-vars "environment=$ENV"

echo "=== ✅ Déploiement $ENV terminé ==="
```

---

## 🏅 Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **IaC** | Infrastructure as Code — infrastructure décrite et gérée comme du code |
| **HCL** | HashiCorp Configuration Language — langage de Terraform |
| **ASLR** | Address Space Layout Randomization — protection kernel contre les exploits de mémoire |
| **Idempotence** | Propriété d'une opération : exécutée plusieurs fois, elle produit toujours le même résultat |
| **Cloud-init** | Standard de provisionnement initial des VMs cloud |
| **Handler** | Ansible : tâche déclenchée uniquement si une tâche notifiante a changé quelque chose |
| **Role** | Ansible : ensemble réutilisable de tâches, templates et variables organisés |

---

## 🏋️ Exercices & Corrigés

**Exercice 1 :** Quel est l'avantage de `terraform plan` avant `terraform apply` ?

**Corrigé :** `terraform plan` affiche exactement ce qui sera créé, modifié ou supprimé **sans rien toucher** à l'infrastructure réelle. Cela permet de valider les changements prévus avant de les appliquer — évitant les destructions accidentelles de ressources de production.

**Exercice 2 :** Pourquoi dit-on qu'Ansible est **idempotent** ?

**Corrigé :** Exécuter un playbook Ansible plusieurs fois sur le même serveur produit toujours le même résultat — il ne ré-installe pas un package déjà installé, ne re-crée pas un fichier déjà conforme, ne redémarre pas un service qui n'a pas changé. C'est garanti par les modules Ansible (apt, copy, template, sysctl...) qui vérifient l'état actuel avant d'agir.

---

## ❓ Banque de Questions & Test du Jour

**Q1 :** Terraform et Ansible ont des rôles complémentaires. Laquelle de ces affirmations est correcte ?
- A) Terraform configure les applications, Ansible crée les VMs
- B) Terraform provisionne l'infrastructure (VMs, réseaux, firewall) ; Ansible configure les systèmes (packages, services, fichiers)
- C) Les deux outils font exactement la même chose
- D) Ansible est uniquement pour Windows, Terraform pour Linux

**Réponse : B**

**Q2 :** Le fichier `terraform.tfstate` doit être :
- A) Versionné dans Git pour partager l'état entre l'équipe
- B) Stocké dans un backend distant (S3, Terraform Cloud) — JAMAIS dans Git car il peut contenir des secrets en clair
- C) Chiffré localement et partagé par email
- D) Recréé à chaque `terraform apply` — il n'a pas besoin d'être conservé

**Réponse : B**

**Q3 :** Dans Ansible, `become: yes` dans un playbook signifie :
- A) Les tâches s'exécutent uniquement si le serveur est disponible
- B) Les tâches s'exécutent avec sudo/root sur le serveur distant
- C) Ansible demande confirmation avant chaque tâche
- D) Le playbook s'arrête en cas d'erreur sur un hôte

**Réponse : B**

**Q4 :** `resource "libvirt_domain" "api" { count = 3 }` dans Terraform crée :
- A) Une seule VM nommée "api_count_3"
- B) 3 VMs identiques (api[0], api[1], api[2])
- C) Une VM avec 3 vCPUs
- D) 3 snapshots de la VM existante

**Réponse : B**

**Q5 :** La propriété d'idempotence d'Ansible est importante en CI/CD car :
- A) Elle accélère l'exécution des playbooks
- B) Elle permet de rejouer le playbook plusieurs fois sans risque — si l'état est déjà conforme, Ansible ne fait rien
- C) Elle permet d'annuler les changements en cas d'erreur
- D) Elle chiffre automatiquement les données sensibles dans les vars

**Réponse : B**

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
