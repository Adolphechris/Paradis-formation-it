# SEMESTRE 1 — Jour 42 (6h) : Introduction au Cloud & Conteneurisation

> [!NOTE]
> **Objectif de la journée** : Comprendre et appliquer la conteneurisation avec Docker, et appréhender les modèles de services Cloud.
> **Compétences visées** : `BIT-08` (Niveau Cible: A) — Déploiement et Conteneurisation.

---

## 1) Virtualisation vs Conteneurisation (1h30)

### 📖 1.1 Narration & Intuition
Une Machine Virtuelle (VM) est comme acheter une maison entière avec sa propre plomberie (Système d'exploitation complet). Un conteneur, c'est louer un appartement dans un grand immeuble : vous partagez la plomberie (noyau OS de l'hôte), ce qui rend le tout infiniment plus léger et rapide à démarrer.

### 🔍 1.2 Anatomie Technique
L'hyperviseur gère des VMs en virtualisant le hardware. Docker utilise les fonctionnalités du noyau Linux (Cgroups et Namespaces) pour isoler les processus sans émuler de matériel. Résultat : un conteneur pèse quelques mégaoctets et démarre en millisecondes.

### 🛠️ 1.3 Atelier Pratique Hands-on
```bash
# Vérifier la présence de Docker
docker --version

# Lancer son premier conteneur (serveur web Nginx)
docker run -d -p 8080:80 --name mon-serveur nginx

# Vérifier les processus isolés
docker ps
```

### 🚑 1.4 Diagnostic & Réflexes Terrain
Si le port 8080 est déjà utilisé, Docker affichera "bind: address already in use". Changez le port côté hôte : `docker run -p 8081:80 nginx`.

---

## 2) Docker Fondamentaux : Images et Dockerfile (1h30)

### 📖 2.1 Narration & Intuition
Une image Docker est la recette de cuisine figée (read-only). Le conteneur est le gâteau que vous sortez du four (instance en cours d'exécution). Le `Dockerfile` est le papier sur lequel vous écrivez la recette.

### 🔍 2.2 Anatomie Technique
Un `Dockerfile` définit l'image de base (`FROM`), les commandes d'installation (`RUN`), les ports exposés (`EXPOSE`), et la commande de lancement (`CMD`). Chaque ligne crée un "layer" (couche) mis en cache pour accélérer les futurs builds.

### 🛠️ 2.3 Atelier Pratique Hands-on
```bash
# Création d'un Dockerfile
echo 'FROM alpine' > Dockerfile
echo 'CMD ["echo", "Bonjour PARADIS IT !"]' >> Dockerfile

# Construire l'image
docker build -t mon-image-alpine .

# Lancer l'image
docker run mon-image-alpine
```

### 🚑 2.4 Diagnostic & Réflexes Terrain
Toujours utiliser `.dockerignore` pour éviter d'envoyer des gigaoctets inutiles (comme `node_modules/`) au daemon Docker lors du `docker build`.

---

## 3) Docker Compose & Concepts Cloud (2h00)

### 📖 3.1 Narration & Intuition
Quand votre application a besoin d'un serveur web ET d'une base de données, les lancer un par un devient fastidieux. `docker-compose` est le chef d'orchestre qui lit une partition (un fichier YAML) et lance tous les musiciens (conteneurs) ensemble.
Le Cloud (IaaS, PaaS, SaaS) représente simplement "l'ordinateur de quelqu'un d'autre" géré avec différents niveaux de délégation.

### 🔍 3.2 Anatomie Technique
Le fichier `docker-compose.yml` définit des `services`, des `networks` (réseaux internes pour que les conteneurs se parlent), et des `volumes` (persistance des données).
- **IaaS** : Vous gérez l'OS (ex: AWS EC2).
- **PaaS** : Vous déployez juste votre code (ex: Heroku).
- **SaaS** : Vous utilisez le logiciel (ex: Gmail).

### 🛠️ 3.3 Atelier Pratique Hands-on
```yaml
# Sauvegardez ceci dans docker-compose.yml
version: '3.8'
services:
  web:
    image: httpd:latest
    ports:
      - "8000:80"
```
```bash
# Lancement de la stack
docker-compose up -d

# Arrêt de la stack
docker-compose down
```

### 🚑 3.4 Diagnostic & Réflexes Terrain
Si les données de votre base de données disparaissent au redémarrage, c'est que vous n'avez pas mappé de **Volume**. Les conteneurs sont éphémères par nature.

---

## Nouvelles abréviations rencontrées
- **VM** : Virtual Machine
- **IaaS** : Infrastructure as a Service
- **PaaS** : Platform as a Service
- **SaaS** : Software as a Service

---

## 🏧️ Exercices Pratiques (Preuves de Portfolio)

### Exercice 1 : Application Multi-Conteneurs
- **Consigne** : Déployez un serveur Nginx qui partage un volume local contenant un fichier `index.html`.
- **Livrables à produire** : Capture du site s'affichant dans le navigateur et commandes utilisées.
- **Corrigé détaillé & Guidé** :
  ```bash
  mkdir mon-site && cd mon-site
  echo "<h1>Mon Site Docker</h1>" > index.html
  docker run -d -p 9090:80 -v $(pwd):/usr/share/nginx/html nginx
  curl http://localhost:9090
  ```

---

## ❓ Banque de Questions QCM (Évaluation 75% minimum)
1. QCM: Quelle est la différence majeure entre un conteneur et une VM ? A) Le conteneur est plus lourd B) Le conteneur inclut son propre noyau C) Le conteneur partage le noyau de l'hôte D) Le conteneur ne peut pas accéder à internet. *Réponse: C*
2. QCM: Que fait la commande `docker build` ? A) Télécharge une image B) Crée une image à partir d'un Dockerfile C) Lance un conteneur D) Supprime un conteneur. *Réponse: B*
3. QCM: Quel outil permet de gérer plusieurs conteneurs avec un fichier YAML ? A) Dockerfile B) Docker Daemon C) Docker Compose D) Docker Swarm. *Réponse: C*
4. QCM: Comment assurer la persistance des données d'une BDD dans Docker ? A) Les données sont persistantes par défaut B) Utiliser un Volume Docker C) Copier les données en RAM D) Écrire un script shell. *Réponse: B*
5. QCM: Quelle catégorie de Cloud fournit une application clé en main (ex: Office 365) ? A) IaaS B) PaaS C) SaaS D) CaaS. *Réponse: C*

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
