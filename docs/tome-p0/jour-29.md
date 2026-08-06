# SEMESTRE 1 — Jour 29 (6h) : Métriques de Performance & Supervision Système

> [!NOTE]
> **Objectif de la journée** : Comprendre et utiliser les outils en ligne de commande pour analyser l'état de santé du système en temps réel et historiquement, repérer les goulots d'étranglement (CPU, RAM, I/O Disque).
> **Compétences visées** : `BIT-01` (Niveau Cible: A) — Administration Système de Base, `BIT-02` (Niveau Cible: A) — Performance et métriques système.

---

## 1) CPU et Mémoire : L'activité centrale (1h30)

### 📖 1.1 Narration & Intuition
Le processeur (CPU) est le cerveau, et la mémoire vive (RAM) est son espace de travail immédiat. Si l'espace de travail est plein (RAM saturée), le cerveau doit utiliser des archives au sous-sol (le swap sur disque), ce qui ralentit considérablement la réflexion. Si le cerveau est surchargé, toutes les tâches prennent du retard (Load Average élevé). Le monitoring de ces métriques est essentiel pour garantir la fluidité des services.

### 🔍 1.2 Anatomie Technique
- **Load Average** : 3 chiffres représentant la charge système sur 1, 5, et 15 minutes. Une charge de 1.0 sur un CPU mono-cœur signifie que le CPU est utilisé à 100%. S'il y a 4 cœurs, une charge de 4.0 signifie 100%.
- **free -m** : Affiche la mémoire. Attention au cache système ! Linux utilise la RAM libre pour mettre en cache les accès disques (buffer/cache). Une RAM "utilisée" ne signifie pas forcément "saturée" si le cache est grand.
- **vmstat** : (Virtual Memory Statistics) donne une vue d'ensemble instantanée des processus, de la mémoire, du swap, des IO et du CPU.

### 🛠️ 1.3 Atelier Pratique Hands-on
Utilisons `vmstat` et analysons le résultat.

```bash
# Afficher les statistiques de mémoire (en Megaoctets)
free -m

# Lancer vmstat : afficher l'état toutes les 2 secondes, 5 fois de suite
vmstat 2 5
```
*Observez la colonne `id` (idle) sous CPU : c'est le pourcentage de temps où le processeur se tourne les pouces. S'il est à 0, le CPU est à fond. Observez `si`/`so` sous swap : si ça n'est pas à 0, le système "swap" (mauvais).*

### 🚑 1.4 Diagnostic & Réflexes Terrain
- **Symptôme** : Le serveur est extrêmement lent, la commande `free -m` montre presque plus de RAM disponible et la valeur Swap `used` augmente.
- **Diagnostic** : Le système subit un "OOM" (Out Of Memory) ou y est proche. Le kernel commence à swapper massivement (Swapping death).
- **Réflexe** : Identifier le processus gourmand avec `top` (trier par %MEM avec la touche `M`) et envisager de le relancer, ou ajouter de la RAM physique.

---

## 2) Entrées/Sorties Disque (I/O) et Goulots (1h30)

### 📖 2.1 Narration & Intuition
Le processeur est un million de fois plus rapide que le disque dur (surtout mécanique). Si une application fait beaucoup de lecture/écriture (base de données par exemple), le processeur va devoir attendre. C'est le goulot d'étranglement (I/O Wait). Même avec le meilleur CPU du monde, un disque lent rendra le serveur inutilisable.

### 🔍 2.2 Anatomie Technique
L'outil roi pour cela est `iostat` (souvent inclus dans le paquet `sysstat`).
- **%iowait** : Pourcentage de temps pendant lequel le CPU était inactif en attendant une réponse du disque. S'il est supérieur à 10-15%, vous avez un goulot I/O.
- **rkB/s, wkB/s** : Vitesse de lecture/écriture en Ko/s.
- **aqu-sz** (Average queue size) : La taille de la file d'attente des requêtes disque. Si elle grandit, le disque n'arrive plus à suivre.

### 🛠️ 1.3 Atelier Pratique Hands-on
Générons de la charge I/O et observons-la.

```bash
# Installer sysstat si ce n'est pas fait
sudo apt install sysstat

# Dans le premier terminal, lancer iostat en rafraîchissant toutes les 2 sec
iostat -x 2

# Dans un SECOND terminal, générer une écriture massive sur disque :
dd if=/dev/zero of=~/gros_fichier.tmp bs=1M count=1000 oflag=direct
# Une fois terminé, supprimez le fichier
rm ~/gros_fichier.tmp
```
*Dans le terminal iostat, regardez le device (ex: sda), les valeurs `wMB/s` et `await` (temps d'attente moyen).*

### 🚑 1.4 Diagnostic & Réflexes Terrain
- **Symptôme** : Load average très élevé, mais le CPU (via `top`) est montré comme étant à 5% d'utilisation utilisateur/système (`us`/`sy`).
- **Diagnostic** : Regardez la colonne `wa` (I/O Wait) dans `top` ou `%iowait` dans `iostat`. Le CPU attend les disques.
- **Réflexe** : Identifier quel processus écrit sur le disque. Utiliser `iotop` (nécessite un `sudo apt install iotop`) pour voir quel processus consomme la bande passante disque.

---

## 3) Historisation avec SAR (System Activity Reporter) (2h00)

### 📖 3.1 Narration & Intuition
`top`, `vmstat` et `iostat` sont superbes, mais ils donnent l'état *en direct*. Que faire si l'astreinte vous appelle à 8h pour dire "le serveur s'est bloqué cette nuit à 3h du matin" ? Il vous faut une boîte noire : `sar`. SAR enregistre l'état du système toutes les 10 minutes, permettant de voyager dans le temps pour voir l'état des ressources au moment d'un crash passé.

### 🔍 3.2 Anatomie Technique
`sar` collecte ses données via un cron job (souvent défini dans `/etc/cron.d/sysstat`) qui exécute la commande de collecte. Les données binaires sont stockées dans `/var/log/sysstat/saXX` (XX = jour du mois).
- `sar -u` : Historique CPU.
- `sar -r` : Historique Mémoire.
- `sar -b` : Historique I/O Disque globales.
- `sar -f /var/log/sysstat/sa15` : Lire les données du 15 du mois.

### 🛠️ 1.3 Atelier Pratique Hands-on
Activer la collecte `sysstat` et interroger les statistiques du jour.

```bash
# Editer la configuration pour ACTIVER la collecte sar
sudo nano /etc/default/sysstat
# Mettre ENABLED="true"

# Redémarrer le service
sudo systemctl restart sysstat

# Interroger la mémoire depuis minuit jusqu'à maintenant
sar -r

# Interroger l'activité CPU
sar -u
```

### 🚑 1.4 Diagnostic & Réflexes Terrain
- **Symptôme** : Un service plante chaque nuit vers 2h du matin.
- **Diagnostic** : Avec `sar -r -f /var/log/sysstat/saXX`, on observe une chute drastique de la RAM libre et une montée de l'utilisation Swap à 2h00 précise.
- **Réflexe** : Corréler cette observation avec les tâches planifiées (cron). Il est fort probable qu'un script de sauvegarde mal optimisé lancé à 2h du matin consomme toute la mémoire.

---

## 🏧️ Exercices Pratiques (Preuves de Portfolio)

### Exercice 1 : Audit de charge complet
- **Consigne** : En utilisant 3 terminaux, créez une charge CPU (avec `stress` ou une boucle bash infinie), surveillez l'impact sur le système avec `top` ou `mpstat`, et capturez l'état.
- **Livrables à produire** : Capture d'écran de l'impact du processeur.
- **Corrigé détaillé & Guidé** :
```bash
# Terminal 1 : lancer la boucle infinie pour surcharger 1 coeur
while true; do true; done

# Terminal 2 : Observer la charge sur chaque coeur
mpstat -P ALL 2

# On remarquera qu'un des CPU est à 100% d'utilisation (%usr).
# Dans le terminal 1, faire CTRL+C pour arrêter.
```

---

## ❓ Banque de Questions QCM (Évaluation 75% minimum)
1. **Que signifie un `Load Average` de "2.0, 1.5, 1.0" sur une machine à un seul cœur ?**
   A) Que le système n'a jamais dépassé 2% d'utilisation
   B) Que le système est en surcharge importante (plus de processus demandent le CPU qu'il ne peut en traiter)
   C) Que 2 processus attendent une réponse réseau
   D) Que le système a planté il y a 1 minute
   **Réponse : B**

2. **Quelle commande donne un instantané des statistiques de mémoire virtuelle et de swap ?**
   A) `iostat`
   B) `netstat`
   C) `vmstat`
   D) `sysstat`
   **Réponse : C**

3. **Quelle valeur dans `iostat` indique que le processeur perd du temps à attendre le disque ?**
   A) `%idle`
   B) `%iowait` (ou %wa)
   C) `rkB/s`
   D) `%system`
   **Réponse : B**

4. **Quelle est l'utilité principale de la commande `sar` ?**
   A) Redémarrer automatiquement les services plantés
   B) Afficher les métriques de performance historiques (boîte noire)
   C) Effectuer des sauvegardes du système de fichiers
   D) Sécuriser les mots de passe des utilisateurs
   **Réponse : B**

5. **Lorsque vous analysez la sortie de `free -m`, quelle portion de la mémoire n'est pas "perdue" mais utilisée pour optimiser les accès disques par le système ?**
   A) Swap
   B) Used
   C) Buff/Cache
   D) Total
   **Réponse : C**
