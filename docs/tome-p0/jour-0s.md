# Jour J0S — Portfolio S1 : Qu'est-ce qu'un Livrable ?

> [!NOTE]
> **JOUR DE TRANSITION VERS LE SEMESTRE 1 — S0→S1 (J0p–J0v)**  
> Cette leçon explique ce qu'est un livrable portfolio et pourquoi il est essentiel pour votre carrière. Aucun prérequis technique n'est nécessaire.

---

## 🎯 Objectifs de la Leçon
- 📁 Comprendre ce qu'est un livrable portfolio.
- 🎯 Savoir ce qui constitue une "preuve de compétence".
- 📝 Produire son premier script portfolio.
- 🏆 Comprendre comment le portfolio sert pour les certifications et l'employabilité.

---

## 📖 1. Qu'est-ce qu'un livrable portfolio ?

Dans le Semestre 1, chaque journée peut produire un **livrable** : un fichier, un script, une capture d'écran, un rapport qui prouve que vous avez maîtrisé le concept du jour.

**Exemples de livrables S1** :
- Un script Bash qui automatise une sauvegarde.
- Une capture d'écran montrant la configuration d'un firewall.
- Un rapport d'audit de sécurité d'un serveur Linux.
- Un diagramme réseau dessiné et documenté.

### Pourquoi le portfolio est-il essentiel ?

Sur le marché nord-américain (Canada/USA), les recruteurs ne cherchent pas des certificats. Ils cherchent des **preuves de compétence**.

| Ce que les recruteurs voient | Ce que le portfolio prouve |
|---|---|
| "J'ai suivi une formation Linux" | "Voici 50 scripts Bash que j'ai écrits et testés" |
| "Je connais la théorie" | "Voici un rapport d'audit que j'ai produit" |
| "J'ai un certificat" | "Voici un projet fonctionnel que j'ai déployé" |

---

## 📖 2. Les types de livrables dans le Semestre 1

| Type | Description | Exemple S1 |
|---|---|---|
| **Script Bash** | Automatisation d'une tâche | Script de sauvegarde quotidienne |
| **Capture d'écran** | Preuve visuelle d'une configuration | UFW configuré, service démarré |
| **Rapport Markdown** | Document structuré | Rapport d'audit de sécurité |
| **Fichier de configuration** | Fichier configuré et documenté | `/etc/ssh/sshd_config` durci |
| **Diagramme** | Schéma technique | Architecture réseau d'un serveur |

---

## 📖 3. Critères de qualité d'un livrable

Un bon livrable portfolio respecte ces 5 critères :

1. **Fonctionnel** : Il marche. Pas de pseudo-code.
2. **Documenté** : Un README explique ce que ça fait, comment l'utiliser, et pourquoi c'est sécurisé.
3. **Reproductible** : Quelqu'un d'autre peut le lire, le comprendre et l'exécuter.
4. **Professionnel** : Noms de variables clairs, comments utiles, structure lisible.
5. **Prenable en main** : Un recruteur peut le lire en 2 minutes et comprendre votre valeur.

---

## 📖 4. Structure standard d'un livrable

### Script Bash
```bash
#!/bin/bash
# =============================================================================
# SCRIPT : backup_daily.sh
# AUTEUR : Adolphe
# DATE   : 2026-08-14
# USAGE  : Sauvegarde quotidienne du dossier /home vers /backup
# =============================================================================

# Configuration
SOURCE="/home"
DESTINATION="/backup"
DATE=$(date +%Y-%m-%d_%H-%M-%S)
LOG="/var/log/backup.log"

# Exécution
echo "[$DATE] Début de la sauvegarde..." >> $LOG
rsync -av --delete $SOURCE/ $DESTINATION/
echo "[$DATE] Sauvegarde terminée avec succès." >> $LOG
```

### Rapport Markdown
```markdown
# Rapport d'Audit de Sécurité — Serveur Web Linux

**Date** : 2026-08-14  
**Auteur** : Adolphe  
**Serveur** : web-prod-01 (192.168.1.10)

## Résumé Exécutif
Le serveur présente 3 faiblesses critiques à corriger immédiatement.

## Constats
| # | Constat | Gravité | Recommandation |
|---|---|---|---|
| 1 | SSH ouvert sur 0.0.0.0/0 | Critique | Restreindre à 10.0.0.0/24 |
| 2 | MFA non activé | Élevée | Activer TOTP |
| 3 | Logs non centralisés | Moyenne | Configurer rsyslog |

## Plan d'Action
- J+1 : Corriger SSH
- J+3 : Activer MFA
- J+7 : Centraliser logs
```

---

## 🧪 Atelier Pratique : Votre premier livrable portfolio

### Mission
Créez un script Bash `mon_script.sh` qui affiche un menu interactif avec 3 options :
1. Afficher la date et l'heure
2. Afficher la liste des utilisateurs connectés
3. Afficher l'espace disque disponible

### Étapes

```bash
# 1. Créer le fichier
nano mon_script.sh
```

```bash
#!/bin/bash
# =============================================================================
# SCRIPT : mon_script.sh
# AUTEUR : Adolphe
# DATE   : 2026-08-14
# USAGE  : Menu interactif d'informations système
# =============================================================================

while true; do
    echo "=== MENU SYSTÈME ==="
    echo "1. Date et heure"
    echo "2. Utilisateurs connectés"
    echo "3. Espace disque"
    echo "4. Quitter"
    read -p "Choix : " choix
    
    case $choix in
        1) date ;;
        2) who ;;
        3) df -h ;;
        4) echo "Au revoir !"; exit 0 ;;
        *) echo "Choix invalide" ;;
    esac
done
```

```bash
# 2. Rendre le script exécutable
chmod +x mon_script.sh

# 3. Exécuter le script
./mon_script.sh
```

### Livrable
- Le fichier `mon_script.sh` fonctionnel.
- Une capture d'écran du script en cours d'exécution.
- Un fichier `README.md` qui explique ce que fait le script.

---

## 📖 5. Où stocker son portfolio ?

Créez une structure de dossiers professionnelle :

```
~/portfolio-paradis/
├── S0-transition/
│   ├── J0p-format-s1/
│   ├── J0q-codes-competences/
│   ├── J0r-diagnostic/
│   ├── J0s-portfolio/
│   ├── J0t-commandes/
│   ├── J0u-git/
│   └── J0v-examen/
├── S1-linux/
│   ├── J01-cli/
│   ├── J02-fhs/
│   └── ...
├── S2-reseaux/
├── S3-cloud/
├── ...
└── README.md (tableau de progression)
```

**Règle d'or** : Chaque livrable est classé par semestre et par jour. C'est votre **preuve de compétence** pour la vie.

---

## ❓ Banque de QCM & Test du Jour (5 Questions)

**Q1 : Qu'est-ce qu'un livrable portfolio ?**
- A) Un fichier vide
- B) Un script, une capture ou un rapport qui prouve une compétence
- C) Un examen blanc
- D) Un mot de passe

*Réponse : B — Un livrable portfolio est une preuve concrète de compétence.*

**Q2 : Pourquoi le portfolio est-il essentiel sur le marché nord-américain ?**
- A) Les recruteurs cherchent des preuves de compétence, pas juste des certificats
- B) C'est obligatoire par la loi
- C) Ça sert à décorer le bureau
- D) Ça n'a aucune utilité

*Réponse : A — Les recruteurs valident votre capacité par des projets concrets, pas par des papiers.*

**Q3 : Quels sont les 5 critères de qualité d'un livrable ?**
- A) Fonctionnel, documenté, reproductible, professionnel, prenable en main
- B) Court, rapide, gratuit, simple, rapide
- C) Long, complexe, cher, difficile, long
- D) Coloré, animé, drôle, musical, rapide

*Réponse : A — Les 5 critères : fonctionnel, documenté, reproductible, professionnel, prenable en main.*

**Q4 : Comment rendre un script Bash exécutable ?**
- A) `chmod +x script.sh`
- B) `rm script.sh`
- C) `cp script.sh /tmp`
- D) `echo "script"`

*Réponse : A — `chmod +x` ajoute le droit d'exécution.*

**Q5 : Où doit-on stocker son portfolio ?**
- A) N'importe où
- B) Dans une structure organisée par semestre et par jour
- C) Sur un disque externe seulement
- D) Dans la corbeille

*Réponse : B — Structure organisée par semestre et par jour pour la traçabilité.*

---

*Jour de Transition S0→S1 — Module J0s*
