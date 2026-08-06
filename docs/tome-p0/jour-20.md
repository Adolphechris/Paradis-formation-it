# SEMESTRE 1 — Jour 20 (6h) : Projet Synthétique — Surpervision & Alerting

> [!NOTE]
> **Objectif de la journée** : Assembler toutes les notions du Semestre 1 (Commandes, Fichiers, Variables, Boucles, Conditions, Cron, et Réseau) pour créer un agent de surveillance autonome.
> **Compétences visées** : `BIT-04` (A), `BIT-05` (A), `POL-05` (A), `PRO-01` (A) — Automation et surveillance réseau/système.

---

## 1) Architecture et Cahier des Charges (1h30)

### 📖 1.1 Narration & Intuition
Un Administrateur Système ne peut pas passer sa journée à taper `ping` et vérifier la charge RAM des serveurs. Il lui faut des "sentinelles". Nous allons construire ensemble un script Bash de niveau industriel qui va surveiller le système et le réseau, consigner les événements et lever des alertes si les ressources saturent.

### 🔍 1.2 Anatomie Technique
Le projet est divisé en blocs logiques (fonctions) pour respecter le principe de modularité :
1. **Initialisation** : Configuration stricte (`set -e`), définition des variables et fichiers de log.
2. **Sonde Réseau** : Boucle sur un tableau d'IPs pour tester le `ping` et des ports via `nc` (Netcat).
3. **Sonde Système** : Extraction avec `awk` et `grep` des données de `/proc/loadavg` (CPU) et `free -m` (RAM).
4. **Moteur de Log** : Une fonction unique de journalisation horodatée.
5. **Planificateur** : Déploiement automatique via `cron`.

### 🛠️ 1.3 Atelier Pratique Hands-on (Structure Globale)
```bash
#!/bin/bash
# monitor_agent.sh - V1.0
set -euo pipefail

# --- CONFIGURATION ---
LOG_FILE="/var/log/monitor_agent.log"
SERVERS=("8.8.8.8" "192.168.1.254")
PORTS_WEB=(80 443)
ALERTE_RAM_PERCENT=80

# --- FONCTIONS (Squelette) ---
function log() { echo "LOGGING..." ; }
function check_network() { echo "NETWORK CHECK..." ; }
function check_system() { echo "SYSTEM CHECK..." ; }

# --- MAIN ---
check_network
check_system
```

### 🚑 1.4 Diagnostic & Réflexes Terrain
- **Exécution silencieuse** : Ce script étant destiné à Cron, il ne doit faire AUCUN `echo` dans le vide sans le rediriger vers le log. Autrement, le mail local de root va exploser.

---

## 2) Sondes de Test Réseau et Système (1h30)

### 📖 2.1 Narration & Intuition
Ici, la machine regarde autour d'elle (Réseau) et à l'intérieur d'elle-même (Système). C'est le coeur du code.

### 🔍 2.2 Anatomie Technique
- **Ping rapide** : `ping -c 1 -W 1 $IP` (1 paquet, délai d'attente max d'1 seconde).
- **Test de Port** : `nc -z -w 2 $IP $PORT` (Scan TCP rapide sans envoyer de données).
- **Calcul RAM** : Via `free | grep Mem`, on isole l'utilisé et le total, puis on calcule le pourcentage via `awk`.

### 🛠️ 2.3 Atelier Pratique Hands-on (Implémentation)
```bash
function check_network() {
    for ip in "${SERVERS[@]}"; do
        if ping -c 1 -W 1 "$ip" > /dev/null 2>&1; then
            log "INFO" "Serveur $ip est UP (Ping)."
        else
            log "ERROR" "ALERTE: Serveur $ip est DOWN (Ping échoué)."
        fi
    done
}

function check_system() {
    # Récupérer la RAM avec un calcul awk
    local RAM_USE=$(free -m | grep Mem | awk '{print ($3/$2)*100}' | awk -F. '{print $1}')
    
    if [[ $RAM_USE -ge $ALERTE_RAM_PERCENT ]]; then
         log "ERROR" "ALERTE: RAM Critique à ${RAM_USE}%"
    else
         log "INFO" "RAM OK (${RAM_USE}%)"
    fi
}
```

---

## 3) Déploiement Final et Tests (2h00)

### 📖 3.1 Narration & Intuition
Le code est prêt, mais il faut le packager, le rendre exécutable, le tester sous contrainte (en simulant une saturation) et l'installer dans l'ordonnanceur.

### 🔍 3.2 Anatomie Technique
On rend le fichier exécutable avec `chmod +x`.
On ajoute un `trap` pour gérer la rotation basique ou indiquer la fin du cycle.
On l'intègre au système de façon sécurisée (ex: sous un utilisateur dédié à la supervision avec les bons droits sur `/var/log`).

### 🛠️ 3.3 Atelier Pratique Hands-on (Assemblage et Cron)
```bash
# 1. Droits du script
sudo chmod 700 /opt/scripts/monitor_agent.sh

# 2. Test manuel
sudo /opt/scripts/monitor_agent.sh

# 3. Affichage des logs en temps réel (pour valider)
tail -f /var/log/monitor_agent.log

# 4. Déploiement crontab (toutes les 15 minutes)
# Ligne à rajouter dans crontab -e
# */15 * * * * /opt/scripts/monitor_agent.sh >> /dev/null 2>&1
```

### 🚑 3.4 Diagnostic & Réflexes Terrain
- **Simuler une panne réseau** : Changez l'IP d'un serveur par une IP inexistante (ex: 192.168.254.254) et vérifiez que votre script lève bien une alerte `ERROR`.
- **Simuler la RAM** : Baissez temporairement la limite d'alerte `ALERTE_RAM_PERCENT=10` pour voir si l'erreur se déclenche au prochain passage.

---

## 📚 Nouvelles abréviations rencontrées
- **NC**: Netcat (le couteau suisse réseau TCP/UDP).

---

## 🏧️ Exercices Pratiques (Preuves de Portfolio)

### Exercice 1 : Le Script Complet (Projet)
- **Consigne** : Assemblez toutes les parties vues aujourd'hui en un seul script robuste, exécutable et sans erreur syntaxique. Ajoutez une fonction de log qui intègre la date exacte et le niveau de sévérité.
- **Livrables à produire** : Le fichier `/opt/scripts/monitor_agent.sh` complété et commenté, ainsi qu'une capture de `tail /var/log/monitor_agent.log`.
- **Corrigé détaillé & Guidé** :
```bash
#!/bin/bash
set -euo pipefail

LOG_FILE="/tmp/monitor_agent.log" # Changé pour des tests utilisateurs sans root
SERVERS=("8.8.8.8" "127.0.0.1" "192.168.254.254")
ALERTE_RAM_PERCENT=80

function log() {
    local NIVEAU="$1"
    local MESSAGE="$2"
    echo "$(date +'%Y-%m-%d %H:%M:%S') [$NIVEAU] $MESSAGE" >> "$LOG_FILE"
}

function check_network() {
    for ip in "${SERVERS[@]}"; do
        if ping -c 1 -W 1 "$ip" > /dev/null 2>&1; then
            log "INFO" "Serveur $ip: Ping OK"
        else
            log "CRITICAL" "Serveur $ip: PING ERROR"
        fi
    done
}

function check_system() {
    local RAM_USE=$(free | awk '/Mem/ {printf("%3.0f", ($3/$2) * 100)}')
    if [[ $RAM_USE -ge $ALERTE_RAM_PERCENT ]]; then
         log "WARNING" "RAM Utilization élevée: ${RAM_USE}%"
    else
         log "INFO" "RAM OK (${RAM_USE}%)"
    fi
}

log "INFO" "--- Début du scan réseau et système ---"
check_network
check_system
log "INFO" "--- Fin du scan ---"
```

---

## ❓ Banque de Questions QCM (Évaluation 75% minimum)
1. QCM: Pourquoi redirige-t-on la sortie ping avec `> /dev/null 2>&1` dans un script de monitoring ?
A) Pour améliorer la vitesse du réseau.
B) Pour masquer l'affichage normal et les erreurs afin que le script gère tout en arrière-plan sans polluer le terminal.
C) Pour enregistrer la réponse dans un dossier secret.
D) Pour forcer l'usage du protocole IPv6.
*Réponse: B*

2. QCM: Que signifie `-W 1` dans la commande ping `ping -c 1 -W 1` ?
A) Web timeout de 1 heure.
B) Un délai d'attente maximum (Wait) de 1 seconde.
C) Weight = 1.
D) Windows compatibility.
*Réponse: B*

3. QCM: A quoi sert l'outil `nc` (Netcat) utilisé avec les options `-z` ?
A) Scanner l'existence d'un port ouvert sans envoyer de payload de données.
B) Négocier une clé de Chiffrement.
C) Compresser le fichier de Log (zlib).
D) Supprimer la variable (nullify connection).
*Réponse: A*

4. QCM: Si le projet est dans la crontab avec `*/10 * * * *`, combien de fois s'exécute-t-il par heure ?
A) 1 fois.
B) 6 fois.
C) 10 fois.
D) 60 fois.
*Réponse: B*

5. QCM: Quelle est l'utilité du `chmod +x` sur le script du projet final ?
A) Il chiffre le script avec une clé X.
B) Il l'efface après usage (eXtirper).
C) Il le rend eXécutable par le système d'exploitation.
D) Il exporte (eXport) le script vers un autre serveur.
*Réponse: C*
