# TOME P2 — Jour 08 (12h) : Scripting Bash — Automatiser les Tâches Répétitives

> [!NOTE]
> **Objectif de la journée** : Apprendre à écrire des scripts Bash qui automatisent les tâches répétitives d'administration système. Un bon script remplace des heures de travail manuel. À la fin de ce cours, vous créerez des scripts professionnels pour la sauvegarde automatique, la surveillance système et la gestion des comptes.

---

## 1) Qu'est-ce qu'un Script Bash ? (1h)

### 📖 1.1 L'Automatisation comme Super-Pouvoir

Un technicien IT réalise souvent les mêmes tâches des dizaines de fois : créer des comptes utilisateurs, sauvegarder des fichiers, vérifier l'espace disque, redémarrer des services. Au lieu de taper les mêmes commandes manuellement à chaque fois, un **script Bash** les exécute automatiquement en une seule commande.

Un script Bash est simplement un fichier texte contenant une suite de commandes Linux, qu'on exécute comme un programme.

### 🛠️ 1.2 Créer votre Premier Script

```bash
#!/bin/bash
# La première ligne (shebang) indique quel interpréteur utiliser

echo "=== Rapport Système BCC - $(date) ==="
echo "Serveur : $(hostname)"
echo "Uptime  : $(uptime -p)"
echo "Espace disque :"
df -h /
echo "Utilisation RAM :"
free -h
```

```bash
# Rendre le script exécutable et le lancer
chmod +x rapport-systeme.sh
./rapport-systeme.sh
```

---

## 2) Variables, Conditions et Boucles en Bash (4h)

### 🛠️ 2.1 Variables Bash

```bash
#!/bin/bash

NOM_SERVEUR="BCC-PROD-01"
SEUIL_ESPACE=80   # Pourcentage d'utilisation critique

echo "Surveillance du serveur : $NOM_SERVEUR"

# Récupérer une valeur dynamique
ESPACE_UTILISE=$(df -h / | awk 'NR==2 {print $5}' | tr -d '%')
echo "Espace disque utilisé : $ESPACE_UTILISE%"
```

### 🛠️ 2.2 Conditions `if/elif/else`

```bash
#!/bin/bash
ESPACE=$(df / | awk 'NR==2 {print $5}' | tr -d '%')

if [ "$ESPACE" -ge 90 ]; then
    echo "🔴 CRITIQUE : Disque plein à ${ESPACE}% ! Action immédiate requise."
    # Envoyer une alerte email (exemple)
    # mail -s "ALERTE DISQUE BCC" admin@bcc.cd
elif [ "$ESPACE" -ge 80 ]; then
    echo "🟡 ATTENTION : Disque à ${ESPACE}%. Planifier un nettoyage."
else
    echo "🟢 OK : Disque à ${ESPACE}%. Situation normale."
fi
```

### 🛠️ 2.3 Boucles `for` et `while`

```bash
#!/bin/bash
# Créer 10 comptes utilisateurs en une boucle

for i in $(seq 1 10); do
    UTILISATEUR="agent-bcc-$(printf '%03d' $i)"
    useradd -m -s /bin/bash "$UTILISATEUR"
    echo "$UTILISATEUR:ChangeMe2026!" | chpasswd
    echo "✅ Compte $UTILISATEUR créé"
done

echo "10 comptes agents créés avec succès."
```

---

## 3) Script de Sauvegarde Automatique Professionnel (3h)

### 🛠️ 3.1 Script de Backup avec Rotation

```bash
#!/bin/bash
# backup-bcc.sh — Sauvegarde automatique avec rotation sur 7 jours

SOURCE="/home/agents"
DESTINATION="/backup/agents"
DATE=$(date +%Y-%m-%d)
ARCHIVE="$DESTINATION/backup-agents-$DATE.tar.gz"

# Créer le dossier de destination si nécessaire
mkdir -p "$DESTINATION"

# Créer l'archive compressée
tar -czf "$ARCHIVE" "$SOURCE" 2>/dev/null

if [ $? -eq 0 ]; then
    echo "✅ Sauvegarde réussie : $ARCHIVE ($(du -sh $ARCHIVE | cut -f1))"
else
    echo "❌ Erreur lors de la sauvegarde !" | tee -a /var/log/backup-bcc.log
    exit 1
fi

# Supprimer les sauvegardes de plus de 7 jours
find "$DESTINATION" -name "*.tar.gz" -mtime +7 -delete
echo "🧹 Anciennes sauvegardes nettoyées (>7 jours)"
```

### 🛠️ 3.2 Automatiser avec Crontab

```bash
# Éditer les tâches planifiées de l'utilisateur courant
crontab -e

# Syntaxe : minute heure jour mois jour_semaine commande
# Exécuter la sauvegarde tous les jours à 2h00 du matin
0 2 * * * /usr/local/bin/backup-bcc.sh >> /var/log/backup-bcc.log 2>&1

# Vérifier l'espace disque toutes les heures
0 * * * * /usr/local/bin/check-disk.sh

# Lister les tâches programmées
crontab -l
```

---

## 🏋️ Exercices Pratiques & Corrigés

### Exercice 1 : Script de Monitoring
Écrivez un script qui vérifie si le service `ssh` est actif et, s'il est arrêté, le redémarre automatiquement et enregistre l'événement dans un fichier log.
- **Corrigé** :
  ```bash
  #!/bin/bash
  SERVICE="ssh"
  LOG="/var/log/monitor-services.log"

  if systemctl is-active --quiet "$SERVICE"; then
      echo "$(date): $SERVICE est actif." >> "$LOG"
  else
      echo "$(date): $SERVICE ARRETE — Redémarrage en cours..." >> "$LOG"
      systemctl start "$SERVICE"
      echo "$(date): $SERVICE redémarré." >> "$LOG"
  fi
  ```

---

## ❓ Banque de Questions & Test du Jour 08

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*