# Jour J580A — Pont Smart City → Fondements : Pourquoi Revenir aux Bases ?

> [!NOTE]
> **JOUR ANNEXE DU JOUR 580 — S12 (J580a)**  
> Cette leçon explique pourquoi un architecte système travaillant sur des technologies de pointe (IA, Smart City, Edge) doit maîtriser les fondamentaux Linux. Aucun prérequis avancé.

---

## 🎯 Objectifs de la Leçon
- 🧠 Comprendre pourquoi les fondements sont indispensables même pour les technologies avancées.
- 🛠️ Automatiser une tâche Smart City avec un script Bash simple.
- 📊 Réconcilier l'innovation (IA, Edge) avec les fondamentaux (Linux, scripting).
- 🚀 Préparer les révisions S1–S4 (J581–J584) sans dissonance cognitive.

---

## 📖 1. Le paradoxe de l'architecte moderne

### Le problème
Après avoir travaillé sur des sujets avancés (IA, Smart City, Edge Computing, IoT satellite), revenir aux fondamentaux Linux peut sembler... régressif.

**En réalité, c'est la force de l'architecte :**

| Technologie avancée | Dépend des fondamentaux |
|---|---|
| IA / LLM | Nécessite des serveurs Linux, des scripts Python, des APIs REST |
| Smart City | Nécessite des capteurs IoT, des scripts de collecte, des bases de données |
| Edge Computing | Nécessite des devices Linux embarqués, des scripts de déploiement |
| Cloud Native | Nécessite des conteneurs Linux, des pipelines CI/CD, des configurations YAML |
| Cybersécurité | Nécessite des logs Linux, des permissions, des firewalls |

**Leçon** : Plus la technologie est avancée, plus elle repose sur des fondations solides.

---

## 📖 2. L'analogie du gratte-ciel

```
        [IA / Smart City / Edge]
              ↑
        [K8s / Cloud / DevOps]
              ↑
        [Réseaux / Sécurité]
              ↑
        [Linux / Bash / Python] ← Fondations
```

Un gratte-ciel de 100 étages (IA, Smart City) ne tient pas sans des fondations profondes (Linux, Bash, scripting).

---

## 📖 3. Automatiser une tâche Smart City avec Linux

### Scénario
Vous avez déployé 50 capteurs de qualité de l'air dans une ville. Chaque capteur envoie une mesure toutes les 5 minutes. Vous devez automatiser la collecte et l'analyse.

### Solution : Script Bash + cron

```bash
#!/bin/bash
# smart_city_air_quality.sh
# Collecte et analyse les données de qualité de l'air des capteurs Smart City

# Configuration
CAPTEURS_DIR="/opt/smart-city/capteurs"
LOG_DIR="/var/log/smart-city"
DATE=$(date +%Y-%m-%d_%H-%M)

# Créer le dossier de log si nécessaire
mkdir -p $LOG_DIR

# Parcourir tous les capteurs
for capteur in $CAPTEURS_DIR/*/; do
    capteur_id=$(basename $capteur)
    
    # Récupérer la dernière mesure
    mesure=$(cat $capteur/derniere_mesure.txt)
    pm25=$(echo $mesure | cut -d',' -f1)
    timestamp=$(echo $mesure | cut -d',' -f2)
    
    # Analyser la qualité de l'air
    if [ "$pm25" -gt 50 ]; then
        echo "[$DATE] ALERTE: Capteur $capteur_id - PM2.5 = $pm25 µg/m³ (seuil: 50)" >> $LOG_DIR/alertes.log
    fi
    
    # Archiver la mesure
    echo "$capteur_id,$pm25,$timestamp" >> $LOG_DIR/mesures_$DATE.csv
done

# Générer un rapport quotidien
echo "Rapport Smart City - $DATE" > $LOG_DIR/rapport_$DATE.txt
echo "Nombre de capteurs actifs: $(ls -1 $CAPTEURS_DIR | wc -l)" >> $LOG_DIR/rapport_$DATE.txt
echo "Alertes déclenchées: $(grep -c ALERTE $LOG_DIR/alertes.log)" >> $LOG_DIR/rapport_$DATE.txt

echo "[$DATE] Collecte Smart City terminée."
```

### Automatisation avec cron
```bash
# Éditer le crontab
crontab -e

# Ajouter cette ligne pour exécuter le script toutes les 5 minutes
*/5 * * * * /opt/smart-city/scripts/smart_city_air_quality.sh
```

### Résultat
- Collecte automatisée toutes les 5 minutes.
- Alertes automatiques si PM2.5 > 50 µg/m³.
- Rapport quotidien archivé.

---

## 📖 4. Les fondamentaux réutilisés

| Fondamental | Utilisation dans la Smart City |
|---|---|
| `bash` | Script d'automatisation |
| `cron` | Planification des tâches |
| `for` / `if` | Logique de traitement |
| `cat` / `cut` / `grep` | Parsing des données capteurs |
| `date` | Horodatage des mesures |
| `wc -l` | Statistiques |
| `ssh` | Déploiement sur les edge devices |
| `scp` | Transfert de fichiers vers le cloud |

---

## 🧪 Atelier Pratique : Votre propre script Smart City

### Mission
Adaptez le script ci-dessus pour collecter des données de température depuis des capteurs IoT.

### Étapes
1. Créez 3 dossiers de capteurs : `capteur-001`, `capteur-002`, `capteur-003`.
2. Dans chaque dossier, créez un fichier `derniere_mesure.txt` avec le format : `22.5,2026-08-14T14:30:00`.
3. Écrivez un script `smart_city_temperature.sh` qui collecte les températures et alerte si > 30°C.
4. Automatisez avec cron (toutes les minutes pour tester).
5. Vérifiez les logs : `tail -f /var/log/smart-city/alertes.log`.

### Livrable
- Script fonctionnel.
- Capture d'écran des logs montrant une alerte.
- Explication de comment ce script s'intègre dans une architecture Smart City plus large.

---

## ❓ Banque de QCM & Test du Jour (5 Questions)

**Q1 : Pourquoi un architecte Smart City a-t-il besoin de Linux ?**
- A) Pour automatiser la collecte de données, déployer sur des edge devices, gérer des serveurs
- B) Pour décorer les capteurs
- C) Parce que c'est à la mode
- D) Ça n'a aucune utilité

*Réponse : A — Linux est le système d'exploitation des serveurs et devices IoT.*

**Q2 : Quel outil permet de planifier l'exécution automatique d'un script ?**
- A) `cron`
- B) `ls`
- C) `grep`
- D) `cat`

*Réponse : A — `cron` planifie l'exécution de scripts à des intervalles réguliers.*

**Q3 : Dans le script Smart City, que fait `cut -d',' -f1` ?**
- A) Extrait le premier champ séparé par une virgule
- B) Supprime le fichier
- C) Crée un dossier
- D) Formate le disque

*Réponse : A — `cut` extrait un champ précis d'une ligne délimitée.*

**Q4 : Pourquoi les révisions S1–S4 sont-elles importantes après S12 ?**
- A) Parce que les technologies avancées reposent sur des fondations solides
- B) Parce que S12 est inutile
- C) Pour perdre du temps
- D) Aucune raison

*Réponse : A — Plus la technologie est avancée, plus elle dépend des fondamentaux.*

**Q5 : Quel est l'objectif de ce pont pédagogique ?**
- A) Réconcilier l'innovation (Smart City, IA) avec les fondamentaux (Linux, scripting)
- B) Remplacer S12
- C) Supprimer les révisions
- D) Rendre S1 plus difficile

*Réponse : A — Ce pont fait le lien entre technologies de pointe et fondamentaux.*

---

*Pont Pédagogique S12 — Module J580a (annexe de J580)*
