# TOME P4 — Cloud, DevOps & SecOps — Jour 176 (6h) : Conteneurisation Docker & Docker Compose (Images, Volumes, Réseaux, Multi-Services & Sécurité)

> [!NOTE]
> **Objectif du jour :** Maîtriser la conteneurisation d'applications avec **Docker** : construction d'images optimisées (Dockerfile multi-stage), gestion des volumes persistants, réseaux de conteneurs, orchestration de stacks multi-services avec **Docker Compose**, et durcissement sécurité des conteneurs (User non-root, Secrets, image scanning).
>
> **Compétences visées :** `OPS-04` (A) — Conteneurisation Docker & Docker Compose | `SEC-05` (A) — Sécurité des Conteneurs

---

## 1) Module — Architecture Docker & Construction d'Images Optimisées (2h)

### 📖 Narration/Intuition

Imaginez que vous déployez l'API Node.js de la BCC sur 15 serveurs différents. Sans Docker, chaque serveur doit avoir exactement la même version de Node.js, de `npm`, des dépendances... c'est l'enfer de la configuration manuelle. Avec Docker, vous empaquetez l'application ET son environnement exact dans une **Image** immuable. Cette image s'exécute identiquement sur n'importe quelle machine disposant du moteur Docker.

**Concepts clés :**
- **Image Docker** : Template immuable (snapshot de l'environnement de l'application).
- **Conteneur Docker** : Instance en cours d'exécution d'une image (processus isolé).
- **Layer (Couche)** : Chaque instruction `Dockerfile` crée une couche immuable dans le système de fichiers en oignon **(Union File System)**.
- **Registry** : Dépôt d'images (Docker Hub, GHCR, Harbor en privé).

### 🔍 Anatomie Technique

**Dockerfile Multi-Stage Build optimisé pour l'API Node.js BCC (`Dockerfile`) :**

```dockerfile
# ── STAGE 1 : BUILD (Contient les outils de compilation, ne sera pas dans l'image finale)
FROM node:20-alpine AS builder
WORKDIR /app

# Copier uniquement les fichiers de dépendances pour maximiser le cache Docker
COPY package*.json ./
RUN npm ci --only=production

# ── STAGE 2 : PRODUCTION (Image finale légère — minimiser la surface d'attaque)
FROM node:20-alpine AS production

# Sécurité : Créer un utilisateur non-root pour exécuter l'application
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

WORKDIR /app

# Copier uniquement les artefacts construits depuis le stage builder
COPY --from=builder /app/node_modules ./node_modules
COPY --chown=appuser:appgroup ./src ./src

# Passer à l'utilisateur non-root (Principe du moindre privilège)
USER appuser

EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s \
  CMD wget -qO- http://localhost:3000/health || exit 1

CMD ["node", "src/server.js"]
```

**Construction et lancement :**
```bash
# Build de l'image
docker build -t bcc-api:1.0.0 --target production .

# Inspection de la taille de l'image résultante
docker images bcc-api

# Lancement d'un conteneur avec restriction de ressources (Anti-DoS)
docker run -d \
  --name bcc-api-instance-1 \
  --memory="512m" \
  --cpus="0.5" \
  -p 3000:3000 \
  --read-only \
  --security-opt=no-new-privileges:true \
  bcc-api:1.0.0
```

---

## 2) Module — Docker Compose : Orchestration Multi-Services (2h)

### 📖 Narration/Intuition

L'API BCC ne vit pas seule : elle a besoin d'une base de données PostgreSQL, d'un cache Redis, et d'un reverse proxy Nginx. Docker Compose permet de définir et démarrer l'ensemble de cette stack en un seul fichier YAML.

### 🔍 Anatomie Technique

**Stack complète BCC avec Docker Compose (`docker-compose.yml`) :**

```yaml
version: '3.9'

services:
  # ── SERVICE 1 : Reverse Proxy Nginx (Point d'entrée public)
  nginx:
    image: nginx:1.25-alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./nginx/ssl:/etc/ssl/certs:ro
    depends_on:
      - api
    networks:
      - frontend-net
    restart: unless-stopped

  # ── SERVICE 2 : API Node.js BCC
  api:
    build:
      context: .
      target: production
    image: bcc-api:1.0.0
    environment:
      - NODE_ENV=production
      - DB_HOST=postgres
      - REDIS_HOST=redis
    secrets:
      - db_password
      - jwt_private_key
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    networks:
      - frontend-net
      - backend-net
    restart: unless-stopped

  # ── SERVICE 3 : PostgreSQL (Base de données)
  postgres:
    image: postgres:16-alpine
    volumes:
      - pg_data:/var/lib/postgresql/data
      - ./init.sql:/docker-entrypoint-initdb.d/init.sql:ro
    environment:
      POSTGRES_DB: bcc_core
      POSTGRES_USER: bcc_user
      POSTGRES_PASSWORD_FILE: /run/secrets/db_password
    secrets:
      - db_password
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U bcc_user -d bcc_core"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - backend-net
    restart: unless-stopped

  # ── SERVICE 4 : Cache Redis
  redis:
    image: redis:7-alpine
    command: redis-server --requirepass ${REDIS_PASSWORD} --appendonly yes
    volumes:
      - redis_data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
    networks:
      - backend-net
    restart: unless-stopped

# Réseaux (Isolation : Le frontend ne peut PAS accéder directement à la BDD)
networks:
  frontend-net:
    driver: bridge
  backend-net:
    driver: bridge
    internal: true  # Réseau interne uniquement — pas d'accès Internet depuis la BDD

# Volumes persistants
volumes:
  pg_data:
    driver: local
  redis_data:
    driver: local

# Secrets Docker (Jamais de secrets en variables d'environnement en clair)
secrets:
  db_password:
    file: ./secrets/db_password.txt
  jwt_private_key:
    file: ./secrets/jwt_private.pem
```

**Commandes de gestion de la stack :**
```bash
# Démarrer toute la stack en arrière-plan
docker compose up -d

# Vérifier l'état des services
docker compose ps

# Consulter les logs d'un service
docker compose logs -f api

# Arrêter et supprimer les conteneurs (sans supprimer les volumes)
docker compose down

# Arrêter et supprimer TOUT (volumes inclus — DANGER en production !)
docker compose down -v
```

---

## 3) Module — Laboratoire : Scan de Vulnérabilités & Durcissement d'Images (2h)

### 📖 Narration/Intuition

Toutes les images Docker disponibles sur Docker Hub ne sont pas égales en matière de sécurité. Une image peut embarquer des packages Linux contenant des CVEs (Common Vulnerabilities and Exposures) critiques. L'outil **Trivy** (CNCF) effectue un scan automatisé des images Docker avant leur déploiement.

### 🛠️ Atelier Pratique

**Scan de sécurité de l'image avec Trivy :**

```bash
# Installation de Trivy
apt-get install -y trivy

# Scan de l'image bcc-api (Signalement uniquement des vulns CRITICAL et HIGH)
trivy image --severity CRITICAL,HIGH bcc-api:1.0.0

# Exemple de sortie :
# ══════════════════════════════════════════════════════════
# bcc-api:1.0.0 (alpine 3.19.0)
# Total: 2 (CRITICAL: 0, HIGH: 2)
# ┌─────────────────┬────────────┬──────────┬───────────────────┐
# │    Library      │    CVE     │ Severity │ Installed Version │
# ├─────────────────┼────────────┼──────────┼───────────────────┤
# │ libssl3         │ CVE-2023-  │   HIGH   │ 3.1.2-r0          │
# │                 │ 5678       │          │ Fix: 3.1.3-r0     │
# └─────────────────┴────────────┴──────────┴───────────────────┘

# Génération d'un rapport SARIF pour intégration CI/CD
trivy image --format sarif --output trivy-report.sarif bcc-api:1.0.0
```

### 🚑 Terrain

**Bonne pratique de sécurité Docker en Production BCC :**
```bash
# 1. Toujours utiliser des images de base avec tag fixe (PAS latest)
FROM node:20.11.1-alpine3.19  # ✅ Version fixe

# 2. Vérifier la signature de l'image (Docker Content Trust)
export DOCKER_CONTENT_TRUST=1
docker pull node:20-alpine

# 3. Limiter les capacités Linux (Moindre Privilège)
docker run --cap-drop=ALL --cap-add=NET_BIND_SERVICE bcc-api:1.0.0
```

---

## 🏅 Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **CVE** | Common Vulnerabilities and Exposures — Identifiant standardisé d'une faille de sécurité |
| **CNCF** | Cloud Native Computing Foundation — Organisation open-source qui gère Kubernetes, Prometheus, Trivy... |
| **UFS** | Union File System — Système de fichiers en couches utilisé par Docker (OverlayFS) |
| **GHCR** | GitHub Container Registry — Registre d'images Docker privé intégré à GitHub |
| **Trivy** | Scanner de vulnérabilités open-source pour images Docker, code IaC et dépôts Git |

---

## 🏋️ Exercices & Corrigés

**Exercice 1 :** Expliquer la technique du **Multi-Stage Build** Docker et son principal avantage en termes de sécurité et de taille d'image.

**Corrigé :** Le Multi-Stage Build permet de définir plusieurs stages (`FROM image AS stage_name`) dans un seul Dockerfile. Les stages intermédiaires contiennent les outils de compilation et de build (compilateurs, SDK, `npm`, `make`). L'image finale ne copie que les artefacts compilés depuis ces stages intermédiaires, sans embarquer les outils de build. Avantages : (1) **Réduction drastique de la taille** (50-90% plus petite), (2) **Surface d'attaque minimisée** (moins de packages = moins de CVEs potentiels), (3) **Séparation claire** des environnements de build et de production.

**Exercice 2 :** Pourquoi les réseaux `backend-net` marqués `internal: true` dans Docker Compose améliorent-ils significativement la sécurité de la base de données PostgreSQL ?

**Corrigé :** Un réseau Docker marqué `internal: true` est un réseau de conteneurs **totalement isolé d'Internet**. Les conteneurs qui y sont connectés (PostgreSQL, Redis) peuvent communiquer entre eux et avec les services autorisés (ex: l'API), mais ils **ne peuvent pas initier ni recevoir de connexions depuis Internet**. Cela applique le principe de **défense en profondeur** : même si un attaquant compromet un service exposé (ex: Nginx), il ne peut pas atteindre directement la base de données.

---

## ❓ Banque de Questions & Test du Jour

**Q1 :** Qu'est-ce qu'une **Image Docker** par opposition à un **Conteneur Docker** ?
- A) L'image est un template immuable. Un conteneur est une instance en cours d'exécution de cette image
- B) L'image et le conteneur sont exactement la même chose
- C) L'image est un fichier texte. Un conteneur est un réseau
- D) L'image s'exécute sur bare-metal. Un conteneur est une VM

**Réponse : A**

**Q2 :** Quel est le principal avantage sécuritaire d'utiliser un **utilisateur non-root** (`USER appuser`) dans un Dockerfile en production ?
- A) Principe du moindre privilège : si le conteneur est compromis, l'attaquant n'obtient que les droits d'un utilisateur restreint et ne peut pas effectuer d'opérations root sur le système hôte
- B) Accélérer les performances du conteneur
- C) Permettre plus de connexions réseau simultanées
- D) Réduire la taille de l'image

**Réponse : A**

**Q3 :** Dans Docker Compose, à quoi sert la directive `depends_on` avec `condition: service_healthy` ?
- A) Elle garantit qu'un service ne démarrera que lorsque le service dont il dépend est déclaré "healthy" par son `healthcheck`, évitant les erreurs de connexion au démarrage
- B) Elle copie des fichiers entre services
- C) Elle expose les ports d'un service vers l'extérieur
- D) Elle crée un volume partagé entre deux services

**Réponse : A**

**Q4 :** Quel outil open-source CNCF est utilisé pour scanner les vulnérabilités (CVEs) dans les images Docker avant leur déploiement en production ?
- A) Trivy
- B) Docker Scout uniquement
- C) Prometheus
- D) Grafana

**Réponse : A**

**Q5 :** Quelle est la meilleure pratique pour transmettre des secrets (ex: mots de passe de BDD) à un conteneur Docker en production ?
- A) Via les **Docker Secrets** (fichiers montés dans `/run/secrets/`) ou les Secret Managers (Vault, AWS Secrets Manager)
- B) Via une variable d'environnement en clair dans `docker-compose.yml`
- C) En les encodant en Base64 dans l'image
- D) En les écrivant dans les logs du conteneur

**Réponse : A**

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
