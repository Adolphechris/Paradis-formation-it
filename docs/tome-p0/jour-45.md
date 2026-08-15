# SEMESTRE 1 — Jour 45 (6h) : Grand Examen de Synthèse & Validation du Semestre 1

> [!NOTE]
> **Objectif de la journée** : Valider l'intégration complète de toutes les compétences du Semestre 1 (Linux CLI, Réseaux TCP/IP, Administration Système, Scripting Bash, Docker, Monitoring & SecOps) via le Grand Examen Pratique Intégré et la finalisation du Portfolio Professionnel.
> **Compétences visées** : Synthèse Intégrale du Semestre 1 (`BIT-01` à `BIT-04`, `SEC-01`, `OPS-01`, `POL-01`).

---

## 🎯 Objectifs de la Leçon

- 🧱 Réaliser la synthèse globale des 5 piliers de l'ingénierie système Linux.
- 🚀 Relever le **Grand Défi Pratique Intégré** : Déployer et sécuriser une infrastructure de production complète en 2h00.
- 🛠️ Appliquer la méthode de **Troubleshooting méthodologique** (du matériel au réseau et à l'application).
- 📁 Structurer votre **Portfolio GitHub officiel du Semestre 1** pour les recruteurs IT.
- 🏆 Valider l'Examen de Synthèse et obtenir le déverrouillage officiel pour le **Semestre 2**.

---

## 🖼️ Le Grand Examen de Synthèse

![Examen & Validation](https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800)

---

## 📖 1. Synthèse des 5 Piliers du Semestre 1

Pendant 45 jours d'apprentissage intensif, vous avez forgé les compétences fondamentales de l'ingénieur Linux. Voici comment s'articulent les 5 piliers de votre savoir-faire :

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    LES 5 PILIERS DU SEMESTRE 1                          │
├─────────────────────────────────────────────────────────────────────────┤
│ 1. LE SOCLE LINUX & CLI                                                 │
│    - FHS, Inodes, Permissions octales (755, 644, 600), Processus, Syscalls│
├─────────────────────────────────────────────────────────────────────────┤
│ 2. RÉSEAUX & COMMUNICATIONS TCP/IP                                      │
│    - OSI (1-7), IP vs MAC, Routage, Subnetting, TCP/UDP, DNS, NAT       │
├─────────────────────────────────────────────────────────────────────────┤
│ 3. ADMINISTRATION SYSTÈME & AUTOMATISATION                              │
│    - Systemd (PID 1), LVM, User Management, Cron, Scripts Bash & Python│
├─────────────────────────────────────────────────────────────────────────┤
│ 4. CONTENEURS & ARCHITECTURE CLOUD-NATIVE                               │
│    - Docker, Isolation de conteneurs, Mappings de ports, Volumes        │
├─────────────────────────────────────────────────────────────────────────┤
│ 5. SURVEILLANCE & SECOPS / CONFORMITÉ                                   │
│    - Monitoring Prometheus & Grafana, UFW Firewall, RGPD, ISO 27001     │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 📖 2. Méthodologie Universelle de Troubleshooting (Dépannage)

Face à un système Linux en panne ou dégradé, l'ingénieur senior ne devine jamais. Il applique une démarche scientifique rigoureuse basée sur le Modèle OSI :

```
             ┌────────────────────────────────────────────────────────────┐
             │  ÉTAPES DE DÉPANNAGE DU SYSADMIN                           │
             ├────────────────────────────────────────────────────────────┤
             │  1. Vérifier la Couche Physique & Interface (ip link)      │
             │  2. Vérifier la Connectivité Réseau & Passerelle (ping/ip) │
             │  3. Vérifier le Statut du Service Systemd (systemctl)      │
             │  4. Inspecter les Ports en Écoute (ss -tlnp / lsof)       │
             │  5. Analyser les Journaux d'Erreurs (journalctl -xe)       │
             │  6. Tester la Réponse Applicative (curl -I / nc -vz)       │
             └────────────────────────────────────────────────────────────┘
```

---

## 🧪 3. Le Grand Défi Pratique Intégré (Durée : 2h00)

### 📋 Cahier des Charges de l'Épreuve

Vous êtes le nouvel Administrateur Système et Sécurité en chef de la société **"Paradis-Tech"**. Vous devez déployer et sécuriser en totalité un serveur Web de production d'urgence avec le cahier des charges suivant :

1. **Nettoyage & Sécurité de Base** : S'assurer que le pare-feu **UFW** est actif et ne laisse passer QUE les ports nécessaires (`22/tcp` SSH et `80/tcp` HTTP).
2. **Scripting d'Automatisation** : Créer un script Bash autonome `~/deploy_capstone.sh` qui :
   - Vérifie la présence de Docker (ou l'installe si manquant).
   - Déploie un conteneur Nginx nommé `paradis-prod-web` sur le port 80.
   - Monte un dossier hôte local `~/paradis_webdata` dans le conteneur pour la persistance des données HTML.
   - Écrit une page d'accueil personnalisée contenant la date du jour et le nom d'hôte du serveur.
3. **Automatisation de Sauvegarde** : Créer un script `~/backup_web.sh` qui compresse le dossier web sous forme d'archive `.tar.gz` datée dans `~/backups/` et génère sa clé de contrôle MD5.
4. **Validation de l'Infrastructure** : Effectuer une requête HTTP locale (`curl`) pour valider que le serveur répond avec un code HTTP `200 OK`.

### 🛠️ Corrigé Intégral & Exécution Guidée

Exécutez ce script de déploiement intégrateur qui résout le cahier des charges :

```bash
# 1. Création de la structure de répertoires
mkdir -p ~/paradis_webdata ~/backups

# 2. Écriture de la page web personnalisée
cat > ~/paradis_webdata/index.html << EOF
<!DOCTYPE html>
<html>
<head><title>PARADIS IT — Serveur de Production Capstone S1</title></head>
<body style="font-family:sans-serif; text-align:center; padding:50px; background:#0f172a; color:#f8fafc;">
    <h1 style="color:#38bdf8;">🚀 PARADIS IT — CAPSTONE SEMESTRE 1 VALIDE !</h1>
    <p>Serveur de Production Déployé avec Succès via Docker & Script Bash.</p>
    <hr style="border-color:#334155;">
    <p>Date de Déploiement : $(date)</p>
    <p>Nom d'Hôte Serveur : $(hostname)</p>
    <p>Statut Sécurité UFW : Actif / Port 80 & 22 Autorisés</p>
</body>
</html>
EOF

# 3. Création du Script d'Automatisation de Déploiement (deploy_capstone.sh)
cat > ~/deploy_capstone.sh << 'EOF'
#!/bin/bash
set -e # S'arrêter en cas d'erreur

echo "=== [1/4] CONFIGURATION DU PARE-FEU UFW ==="
sudo ufw --force enable
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow 22/tcp comment "SSH Access"
sudo ufw allow 80/tcp comment "HTTP Web Access"
sudo ufw reload

echo "=== [2/4] NETTOYAGE DES ANCIENS CONTENEURS WEB ==="
docker stop paradis-prod-web 2>/dev/null || true
docker rm paradis-prod-web 2>/dev/null || true

echo "=== [3/4] DÉPLOIEMENT DU CONTENEUR WEB NGINX ==="
docker run -d \
  --name paradis-prod-web \
  -p 80:80 \
  -v ~/paradis_webdata:/usr/share/nginx/html:ro \
  --restart always \
  nginx:latest

echo "=== [4/4] VÉRIFICATION ET AUDIT DE PERFORMANCE ==="
sleep 2
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost/)
if [ "$HTTP_STATUS" -eq 200 ]; then
    echo "✅ SUCCÈS : Le serveur Web répond HTTP 200 OK !"
else
    echo "❌ ÉCHEC : Le serveur renvoie le code HTTP $HTTP_STATUS"
    exit 1
fi
EOF

# 4. Rendre le script d'automatisation exécutable
chmod +x ~/deploy_capstone.sh

# 5. Exécuter le déploiement intégrateur Capstone
~/deploy_capstone.sh

# 6. Écriture du Script de Sauvegarde Automatisée (backup_web.sh)
cat > ~/backup_web.sh << 'EOF'
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR=~/backups
ARCHIVE_NAME="$BACKUP_DIR/webdata_$DATE.tar.gz"

echo "=== DÉBUT DE SAUVEGARDE WEB ==="
mkdir -p $BACKUP_DIR
tar -czf $ARCHIVE_NAME -C ~/ paradis_webdata
md5sum $ARCHIVE_NAME > "$ARCHIVE_NAME.md5"

echo "✅ Sauvegarde créée : $ARCHIVE_NAME"
echo "✅ Checksum MD5 : $(cat $ARCHIVE_NAME.md5)"
EOF

# 7. Rendre le script de sauvegarde exécutable et le tester
chmod +x ~/backup_web.sh
~/backup_web.sh

# 8. Test final d'accès Web local
curl -s http://localhost/ | grep -E "(CAPSTONE|Succès|Statut)"
```

---

## 📖 4. Finalisation du Portfolio GitHub Semestre 1

Votre **Portfolio GitHub** est la preuve tangible de vos compétences pour les recruteurs. Il ne suffit pas de dire *"Je connais Linux et Docker"*, il faut afficher vos livrables.

### Modèle de Fichier `README.md` Officiel pour Votre Dépôt GitHub

```markdown
# 🛡️ PARADIS IT — Portfolio Semestre 1 (Linux & Administration Système)

## 📌 Présentation
Ce dépôt regroupe l'ensemble de mes travaux pratiques, scripts d'automatisation et projets réalisés dans le cadre du **Semestre 1 de la Masterclass PARADIS IT** (50 Jours / 300 Heures d'apprentissage).

## 🛠️ Compétences Validées (Matrice BIT/SEC/OPS)
- **Linux Administration** : FHS, Inodes, Permissions octales (755/644/600), Processus, Systemd, LVM, SSH Hardening.
- **Réseaux & Sécurité** : TCP/IP, Modèle OSI, Routing, Subnetting CIDR, DNS, Firewall UFW, Analyse Wireshark.
- **Automation & Scripting** : Scripts Bash avancés avec gestion d'erreurs (`set -e`), scripts Python 3.
- **Cloud-Native & Ops** : Conteneurs Docker, Volumes, Port-Mapping, Monitoring Prometheus & Grafana.
- **Conformité** : Audits Lynis, RGPD, Norme ISO/IEC 27001.

## 🚀 Projets & Scripts Inclus
1. `deploy_capstone.sh` : Script Bash d'installation et de sécurisation automatisée d'un serveur Web Nginx sous Docker avec pare-feu UFW.
2. `backup_web.sh` : Script de sauvegarde automatique avec compression `.tar.gz` et vérification d'intégrité MD5.
3. `system_audit.sh` : Script de collecte de métriques système (CPU, RAM, Disque, Services actifs).

## 📊 Preuve d'Exécution (Capstone Final)
```bash
$ ~/deploy_capstone.sh
=== [1/4] CONFIGURATION DU PARE-FEU UFW ===
Rule added / Rules updated (80/tcp, 22/tcp)
=== [3/4] DÉPLOIEMENT DU CONTENEUR WEB NGINX ===
Container paradis-prod-web started successfully (ID: 4f8a10b9c3e2)
✅ SUCCÈS : Le serveur Web répond HTTP 200 OK !
```
```

---

## ❓ Banque de QCM de Synthèse du Semestre 1 (10 Questions Exigeantes)

**Q1 : Quelle commande Linux permet de lister les ports TCP en écoute avec les noms de processus associés (nécessitant les privilèges root) ?**
- A) `ping -a`
- B) `sudo ss -tlnp` (ou `sudo netstat -tulpn`)
- C) `cat /etc/hosts`
- D) `ifconfig -a`

*Réponse : B — `ss -tlnp` (TCP, Listening, Numeric, Process) affiche les sockets d'écoute avec les PIDs des processus.*

**Q2 : Quelle est la différence fondamentale entre la commande `kill -15 PID` et `kill -9 PID` ?**
- A) `kill -15` demande un arrêt propre (*SIGTERM*), tandis que `kill -9` force l'arrêt immédiat sans nettoyage (*SIGKILL*)
- B) `kill -9` redémarre l'ordinateur
- C) `kill -15` est réservé à l'utilisateur root
- D) Il n'y a aucune différence

*Réponse : A — SIGTERM (15) laisse le temps au processus d'enregistrer ses données. SIGKILL (9) interrompt le processus de manière inconditionnelle.*

**Q3 : Dans le Modèle OSI, à quelle couche s'effectue le filtrage des paquets réalisé par un pare-feu d'état (Firewall IP/Port comme UFW/iptables) ?**
- A) Couche 1 (Physique)
- B) Couche 3 (Réseau / IP) et Couche 4 (Transport / Ports TCP/UDP)
- C) Couche 7 uniquement
- D) Couche 2 (Liaison)

*Réponse : B — Les pare-feu standards filtrent les paquets selon les IP source/destination (Couche 3) et les ports TCP/UDP (Couche 4).*

**Q4 : Quel est l'effet de l'option `set -e` au début d'un script Bash de production ?**
- A) Elle active l'impression couleur
- B) Elle interrompt immédiatement l'exécution du script dès qu'une commande renvoie un code de sortie d'erreur (non-zéro)
- C) Elle masque tous les messages d'erreur
- D) Elle envoie un mail à l'administrateur

*Réponse : B — `set -e` est la bonne pratique de sécurité sous Bash qui empêche un script de continuer si une étape a échoué.*

**Q5 : Que fait la commande `docker run -d -p 8080:80 nginx` ?**
- A) Elle télécharge le code source de Nginx sur le disque
- B) Elle lance un conteneur Nginx en arrière-plan (`-d`) et mappe le port 8080 de l'hôte vers le port 80 du conteneur (`-p`)
- C) Elle supprime le serveur web
- D) Elle installe Nginx directement sur l'OS hôte

*Réponse : B — `-d` détache le conteneur en arrière-plan, `-p 8080:80` effectue la redirection de port.*

**Q6 : Quel outil de surveillance collecte des métriques système au format Time Series sous forme de modèle "Pull" HTTP ?**
- A) Wireshark
- B) Prometheus
- C) GPG
- D) Git

*Réponse : B — Prometheus interroge les cibles (ex: Node Exporter) à intervalles réguliers pour collecter des métriques temporelles.*

**Q7 : Quelle commande permet de vérifier le MD5 d'une archive sauvegardée pour s'assurer qu'elle n'a pas été corrompue ?**
- A) `md5sum -c archive.tar.gz.md5`
- B) `cat archive.tar.gz`
- C) `check-md5 archive.tar.gz`
- D) `gzip -d archive.tar.gz`

*Réponse : A — `md5sum -c` (check) compare la signature calculée avec la signature enregistrée dans le fichier checksum.*

**Q8 : Quel fichier système contient la liste de tous les comptes utilisateurs configurés sur une machine Linux ?**
- A) `/etc/shadow`
- B) `/etc/passwd`
- C) `/etc/group`
- D) `/var/log/users`

*Réponse : B — `/etc/passwd` répertorie les comptes utilisateurs, leurs UID, GID, répertoires home et shells par défaut.*

**Q9 : Comment appelle-t-on la méthode de dépannage qui consiste à tester les couches une par une depuis le câble physique jusqu'à l'application ?**
- A) L'approche aléatoire
- B) L'approche Bottom-Up (du bas vers le haut du modèle OSI)
- C) Le débogage par devinette
- D) La compilation inverse

*Réponse : B — L'approche Bottom-Up isole méthodiquement les pannes de la Couche 1 à la Couche 7.*

**Q10 : Quelle est la condition d'obtention de la validation officielle du Semestre 1 ?**
- A) Payer des frais de diplôme
- B) Réussir le Capstone Pratique et obtenir au minimum 75% au QCM de synthèse
- C) Attendre 3 mois
- D) Recompiler le noyau Linux

*Réponse : B — La validation repose sur l'exécution propre du Capstone et la réussite du QCM de synthèse avec 75% minimum.*

---

## 🏆 Bilan & Prochaine Étape : Le Passage au Semestre 2

Félicitations ! En validant le **Jour 45**, vous venez de franchir la première grande étape du cursus **PARADIS IT Masterclass**. Vous possédez désormais le socle opérationnel d'un **Administrateur Système Linux Junior / Technicien Infra**.

```
╔══════════════════════════════════════════════════════════════════════════╗
║                   BADGE OFFICIEL : SEMESTRE 1 VALIDÉ 🏅                 ║
║                                                                          ║
║  CONGRATULATIONS! SOCLE SYSTÈME LINUX & ADMINISTRATION MAÎTRISÉ.         ║
║  PROCHAINE ÉTAPE ──► SEMESTRE 2 : RÉSEAUX & TELECOMS AVANCÉS (J051-J100) ║
╚══════════════════════════════════════════════════════════════════════════╝
```

---

## 📚 Ressources & Références

- **Espace Étudiant PARADIS IT** : [Accéder](https://adolphechris.github.io/Paradis-formation-it/espace-etudiant/)
- **Linux Command Line Complete Guide** : https://linuxcommand.org/
- **Docker Documentation** : https://docs.docker.com/
- **Ubuntu Server Administration Guide** : https://canonical-ubuntu-server.readthedocs-hosted.com/

---

*Semestre 1 — Socle Système Linux & Administration PARADIS IT Masterclass*
