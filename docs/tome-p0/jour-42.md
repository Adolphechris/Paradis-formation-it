# SEMESTRE 1 — Jour 42 (6h) : Virtualisation, Conteneurisation Docker, Dockerfile, Volumes & Modèles Cloud (IaaS/PaaS/SaaS)

> [!NOTE]
> **Objectif de la journée** : Comprendre la différence entre virtualisation lourde et conteneurisation légère, maîtriser le fonctionnement du moteur Docker (Namespaces & Cgroups), fabriquer des images optimisées via `Dockerfile`, assurer la persistance avec les **Volumes**, et déployer des stacks multi-conteneurs avec **Docker Compose**.
> **Compétences visées** : `BIT-08` (Niveau Cible: A) — Conteneurisation Docker, Scripting et Modèles Cloud.

---

## 🎯 Objectifs de la Leçon

- 🏢 Distinguer les **Machines Virtuelles (VMs)** et les **Conteneurs Docker**.
- 🔬 Explorer les mécanismes du noyau Linux qui rendent Docker possible : **Namespaces** (isolation) et **Cgroups** (limitation de ressources).
- 📦 Rédiger un **Dockerfile** optimisé et employer le *Multi-Stage Build* pour fabriquer des images minimales.
- 💾 Gérer la persistance des données avec les **Volumes Docker** et les **Bind Mounts**.
- 🎶 Orchestrer une stack d'applications multi-conteneurs avec **Docker Compose** (`docker-compose.yml`).
- ☁️ Différencier les modèles de services Cloud : **IaaS**, **PaaS** et **SaaS**.
- 🧪 Manipuler les commandes Docker en ligne de commande sous Linux.

---

## 🖼️ Virtualisation vs Conteneurisation Docker

![Docker & Cloud](https://images.unsplash.com/photo-1607799279861-4dd421887fb3?w=800)

---

## 📖 1. Virtualisation vs Conteneurisation Docker

### 1.1 Narration & Intuition — La Maison Individuelle vs L'Appartement

Imaginez que vous deviez loger 5 familles.
- La **Virtualisation classique (Machines Virtuelles / VMs)**, c'est construire 5 maisons individuelles séparées. Chaque maison a ses propres murs porteurs, sa propre toiture, sa propre chaudière et sa propre plomberie. C'est extrêmement robuste, mais très lourd, coûteux en terrain (RAM/CPU) et long à construire (plusieurs minutes de démarrage).
- La **Conteneurisation (Docker)**, c'est construire un immeuble d'habitation moderne. Chaque famille possède son appartement totalement isolé (portes fermées, intimité), mais toutes les familles partagent la même structure centrale, la même fondation et la même plomberie d'eau générale (le **Noyau Linux de l'hôte**).

```
        ARCHITECTURE MACHINE VIRTUELLE (VM)               ARCHITECTURE CONTENEUR DOCKER
┌───────────────────────────────────────────────┐   ┌───────────────────────────────────────────────┐
│ App A          │ App B          │ App C       │   │ App A          │ App B          │ App C       │
├────────────────┼────────────────┼─────────────┤   ├────────────────┼────────────────┼─────────────┤
│ Bins / Libs    │ Bins / Libs    │ Bins / Libs │   │ Bins / Libs    │ Bins / Libs    │ Bins / Libs │
├────────────────┼────────────────┼─────────────┤   ├────────────────┴────────────────┴─────────────┤
│ Guest OS (OS 1)│ Guest OS (OS 2)│ Guest OS 3  │   │ MOTEUR DOCKER (Docker Engine)                 │
├────────────────┴────────────────┴─────────────┤   ├───────────────────────────────────────────────┤
│ HYPERVISEUR (Type 1 ESXi/Proxmox ou Type 2)   │   │ NOYAU LINUX HÔTE (Kernel Linux unique)        │
├───────────────────────────────────────────────┤   ├───────────────────────────────────────────────┤
│ MATÉRIEL PHYSIQUE (CPU, RAM, Disques)         │   │ MATÉRIEL PHYSIQUE (CPU, RAM, Disques)         │
└───────────────────────────────────────────────┘   └───────────────────────────────────────────────┘
```

### 1.2 La Magie du Noyau Linux : Namespaces et Cgroups

Docker n'est pas un système de virtualisation. C'est un moteur d'isolation de processus sous Linux basé sur 2 fonctionnalités natives du noyau :

1. **Linux Namespaces (L'Isolation)** : Isole ce que le conteneur a le droit de **voir**.
   - `pid namespace` : Le conteneur ne voit que ses propres processus (pour lui, son processus principal porte le PID 1).
   - `net namespace` : Le conteneur possède sa propre carte réseau virtuelle et ses propres ports.
   - `mnt namespace` : Le conteneur possède son propre système de fichiers isolé.
   - `user namespace` : L'utilisateur dans le conteneur peut être `root` à l'intérieur mais être un utilisateur sans droits sur la machine hôte.
2. **Control Groups / Cgroups (La Limitation)** : Limite ce que le conteneur a le droit de **consommer** (ex: interdiction pour un conteneur de consommer plus de 512 Mo de RAM ou 1 cœur CPU).

---

## 📖 2. Images, Conteneurs & Dockerfile

### 2.1 La Différence entre Image et Conteneur

- **Une Image Docker** : C'est le moule ou la recette figée en lecture seule (*Read-Only*). Elle contient les binaires, les bibliothèques et la configuration nécessaires pour faire tourner une application.
- **Un Conteneur Docker** : C'est l'instance vivante et en cours d'exécution issue d'une image. Docker ajoute une fine couche d'écriture temporaire (*Read-Write Layer*) au-dessus de l'image.

### 2.2 Rédiger un Dockerfile d'Élite

Un `Dockerfile` est le fichier texte qui contient la suite d'instructions permettant à Docker de construire une image personnalisée.

```dockerfile
# 1. Image de base légère
FROM python:3.11-slim

# 2. Répertoire de travail dans le conteneur
WORKDIR /app

# 3. Copier les fichiers du projet depuis l'hôte vers le conteneur
COPY requirements.txt .

# 4. Exécuter les commandes d'installation
RUN pip install --no-cache-dir -r requirements.txt

# 5. Copier le restant du code source
COPY . .

# 6. Déclarer le port d'écoute applicatif (Documentation)
EXPOSE 5000

# 7. Commande par défaut exécutée lors du lancement du conteneur
CMD ["python3", "app.py"]
```

> [!TIP]
> **Bonne pratique — Les Layers (Couches) et le Cache Docker :**  
> Chaque instruction (`FROM`, `RUN`, `COPY`) crée une couche (*layer*) dans l'image. Copiez toujours les fichiers de dépendances (`requirements.txt` ou `package.json`) et faites le `RUN pip install` **AVANT** de copier le code source complet (`COPY . .`). Ainsi, lorsque vous modifiez votre code source, Docker réutilise le cache des dépendances sans réinstaller toutes les bibliothèques !

---

## 📖 3. Persistance des Données : Volumes vs Bind Mounts

Par nature, les conteneurs sont **éphémères**. Si un conteneur est détruit avec `docker rm`, tout fichier écrit à l'intérieur de sa couche temporaire est définitivement perdu !

Pour conserver les données de manière permanente (ex: une base de données MySQL ou PostgreSQL), on utilise deux stratégies :

```
                        STRATÉGIES DE STOCKAGE DOCKER
┌───────────────────────────────────────────────┬───────────────────────────────────────────────┐
│ DOCKER VOLUMES (Recommandé en Production)    │ BIND MOUNTS (Recommandé en Développement)     │
├───────────────────────────────────────────────┼───────────────────────────────────────────────┤
│ Gérés directement par Docker dans             │ Mappe un dossier physique spécifique de l'hôte│
│ `/var/lib/docker/volumes/`.                  │ (ex: `/home/user/mon-projet/html`).            │
│ Indépendants de l'OS hôte, sauvegardes faciles│ Modifications du code sur l'hôte visibles     │
│ et ultra-performants.                         │ instantanément dans le conteneur en direct !  │
└───────────────────────────────────────────────┴───────────────────────────────────────────────┘
```

---

## 📖 4. Docker Compose & Modèles Cloud (IaaS / PaaS / SaaS)

### 4.1 Orchestration Locale avec Docker Compose

Dans une application réelle, vous avez besoin d'un serveur Web (Nginx), d'une API (Python/Node) et d'une base de données (PostgreSQL). Lancer chaque conteneur à la main avec `docker run` devient fastidieux.

**Docker Compose** permet de déclarer toute la stack d'applications dans un unique fichier `docker-compose.yml` :

```yaml
version: '3.8'

services:
  web:
    build: .
    ports:
      - "8000:5000"
    environment:
      - DB_HOST=db
    depends_on:
      - db

  db:
    image: postgres:15-alpine
    environment:
      POSTGRES_PASSWORD: SecretPassword123!
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

Une seule commande suffit alors pour démarrer l'ensemble des services interconnectés : **`docker-compose up -d`**.

### 4.2 Les 3 Modèles de Services Cloud

```
                               LE TRIO DES SERVICES CLOUD
┌──────────────────────────────────────────────────────────────────────────┐
│ IAAS (Infrastructure as a Service) — Ex: AWS EC2, Compute Engine, VPS   │
│ - Le fournisseur fournit le matériel et la virtualisation.               │
│ - VOUS gérez l'OS Linux, les mises à jour, la sécurité et le code.       │
├──────────────────────────────────────────────────────────────────────────┤
│ PAAS (Platform as a Service) — Ex: Heroku, AWS Elastic Beanstalk         │
│ - Le fournisseur gère le matériel, l'OS et le moteur d'exécution.        │
│ - VOUS déployez uniquement votre code source ou votre conteneur Docker.  │
├──────────────────────────────────────────────────────────────────────────┤
│ SAAS (Software as a Service) — Ex: Gmail, Google Drive, Microsoft 365    │
│ - Le fournisseur gère TOUT (Infrastructure, OS, Code, Sécurité).        │
│ - VOUS êtes simple utilisateur du logiciel via un navigateur web.       │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## 🧪 Atelier Pratique : Exercices et Manipulation Docker en CLI

Exécutez cette série de 10 commandes réelles dans votre terminal Linux :

```bash
# 1. Vérifier que le moteur Docker est installé et actif
docker --version

# 2. Lancer un conteneur Nginx en arrière-plan (-d) et mapper le port 8080 de l'hôte vers le port 80 du conteneur
docker run -d -p 8080:80 --name mon-web-nginx nginx:alpine

# 3. Lister tous les conteneurs actuellement en cours d'exécution
docker ps

# 4. Tester l'accès au serveur Nginx conteneurisé
curl http://localhost:8080 | head -10

# 5. Inspecter les journaux de logs générés par le conteneur
docker logs --tail 20 mon-web-nginx

# 6. S'introduire de manière interactive dans le conteneur en cours d'exécution
docker exec -it mon-web-nginx sh -c "cat /etc/nginx/nginx.conf"

# 7. Créer un volume Docker managé pour la persistance des données
docker volume create mon_volume_data

# 8. Lancer un conteneur avec un volume rattaché
docker run -d --name db-test -v mon_volume_data:/data alpine sleep 3600

# 9. Créer un mini Dockerfile et construire une image personnalisée
mkdir -p ~/docker-lab && cd ~/docker-lab
cat > Dockerfile << 'EOF'
FROM alpine:latest
RUN apk add --no-cache curl
CMD ["curl", "-I", "https://google.com"]
EOF

docker build -t mon-curl-app .

# 10. Lancer l'image construite puis nettoyer les conteneurs de test
docker run --rm mon-curl-app
docker stop mon-web-nginx db-test
docker rm mon-web-nginx db-test
```

---

## 🛠️ Diagnostics & Réflexes Terrain

### 1. Message d'Erreur : `bind: address already in use`
- **Cause** : Le port demandé sur la machine hôte (ex: port 80 ou 8080) est déjà occupé par un autre processus ou un autre conteneur.
- **Réflexe** : Identifiez le processus occupant le port avec `sudo ss -tlnp | grep 8080` ou modifiez le port hôte lors du `docker run -p 8081:80`.

### 2. Disparition des données lors du redémarrage d'un conteneur de Base de Données
- **Cause** : Le conteneur a écrit ses fichiers dans sa couche temporaire au lieu d'écrire dans un **Volume Docker** ou un **Bind Mount**.
- **Réflexe** : Map un volume persistant dans `/var/lib/mysql` ou `/var/lib/postgresql/data`.

### 3. Images Docker trop volumineuses (> 1 Go)
- **Réflexe** : Utilisez des images de base minimalistes (ex: `alpine` ou `python:3.11-slim`) et supprimez le cache des gestionnaires de paquets (`apk add --no-cache` ou `pip install --no-cache-dir`).

---

## ❓ Banque de QCM & Test du Jour (8 Questions)

**Q1 : Quelle est la différence majeure d'architecture entre une Machine Virtuelle (VM) et un Conteneur Docker ?**
- A) Le conteneur nécessite un hyperviseur de Type 1 et 10 Go de RAM
- B) La VM possède son propre système d'exploitation invité (*Guest OS*), tandis que le conteneur partage le noyau Linux de la machine hôte
- C) Les conteneurs ne peuvent pas utiliser de réseau
- D) Il n'y a aucune différence

*Réponse : B — Les conteneurs partagent le noyau de l'hôte, ce qui les rend ultra-légers et instantanés à démarrer par rapport aux VMs.*

**Q2 : Quels sont les 2 mécanismes fondamentaux du noyau Linux utilisés par Docker pour isoler et limiter les conteneurs ?**
- A) SSL et TLS
- B) Linux Namespaces (isolation) et Control Groups / Cgroups (limitation de ressources)
- C) BIOS et UEFI
- D) IP et MAC

*Réponse : B — Les Namespaces isolent la vue (processus, réseau, disques) et les Cgroups limitent la consommation (RAM, CPU).*

**Q3 : Dans un `Dockerfile`, quelle instruction définit la commande par défaut exécutée au lancement du conteneur ?**
- A) `FROM`
- B) `RUN`
- C) `CMD`
- D) `COPY`

*Réponse : C — `CMD` (ou `ENTRYPOINT`) spécifie la commande et les arguments exécutés au démarrage du conteneur.*

**Q4 : Pourquoi est-il recommandé d'utiliser des Volumes Docker pour les bases de données (MySQL, PostgreSQL) ?**
- A) Parce que les conteneurs sont éphémères et que toute donnée écrite hors d'un volume est perdue lors de la suppression du conteneur
- B) Parce que les volumes chiffrent les données automatiquement
- C) Parce que les volumes rendent le code Python plus rapide
- D) Pour économiser la mémoire RAM

*Réponse : A — Les volumes hébergent les données hors de la couche temporaire du conteneur, garantissant leur persistance.*

**Q5 : Quel outil officiel permet de définir et de lancer une application multi-conteneurs (ex: Web + Base de données) via un fichier YAML unique ?**
- A) Dockerfile
- B) Docker Compose (`docker-compose.yml`)
- C) Git
- D) VirtualBox

*Réponse : B — Docker Compose permet d'orchestrer le lancement et l'interconnexion de plusieurs conteneurs décrits dans un fichier YAML.*

**Q6 : Quel modèle de service Cloud fournit une infrastructure de serveurs virtuels bruts dont vous devez gérer l'OS et la sécurité (ex: AWS EC2, VPS) ?**
- A) SaaS (Software as a Service)
- B) PaaS (Platform as a Service)
- C) IaaS (Infrastructure as a Service)
- D) FaaS (Function as a Service)

*Réponse : C — L'IaaS fournit du matériel/virtualisation brut. L'utilisateur installe et administre l'OS et la stack.*

**Q7 : Que fait la commande `docker exec -it mon-conteneur sh` ?**
- A) Elle éteint le conteneur
- B) Elle ouvre un terminal interactif `sh` à l'intérieur du conteneur en cours d'exécution
- C) Elle supprime l'image Docker
- D) Elle télécharge la dernière version de Nginx

*Réponse : B — `docker exec -it` permet de s'introduire dans un conteneur actif pour le débogage et l'inspection.*

**Q8 : Quel est l'intérêt d'utiliser l'image de base `alpine` (ex: `nginx:alpine` ou `python:alpine`) ?**
- A) Elle permet d'afficher des images en 4K
- B) Elle est basée sur une distribution Linux ultra-légère (~5 Mo), réduisant la surface d'attaque et la taille des images
- C) Elle est développée par Microsoft
- D) Elle ne nécessite pas de processeur

*Réponse : B — Alpine Linux est la distribution minimale de référence en conteneurisation pour créer des images ultra-légères.*

---

## 📚 Ressources & Références

- **Docker Official Documentation** : https://docs.docker.com/
- **Docker Compose Overview** : https://docs.docker.com/compose/
- **Best Practices for Writing Dockerfiles** : https://docs.docker.com/develop/develop-images/dockerfile_best-practices/
- **NIST SP 800-190 — Application Container Security Guide** : https://csrc.nist.gov/publications/detail/sp/800-190/final

---

*Semestre 1 — Socle Système Linux & Administration PARADIS IT Masterclass*
