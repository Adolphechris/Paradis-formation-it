# TOME P2 — Réseaux & Télécoms — Jour 73 (6h) : Conteneurisation Avancée & Sécurité Docker

> [!NOTE]
> **Objectif du jour :** Maîtriser Docker en profondeur : Dockerfile multi-stage, Docker Compose, réseaux Docker, volumes, et sécurité des conteneurs (rootless, capabilities, seccomp, AppArmor). Contexte BCC : déploiement sécurisé d'applications en conteneurs.
>
> **Compétences visées :** `BIT-08` (A) — Conteneurisation & Docker | `SEC-03` (A) — Sécurité des Systèmes

---

## 1) Module — Docker Avancé : Dockerfile Multi-Stage & Réseaux (2h)

### 📖 Narration/Intuition

Un Dockerfile mal conçu produit des images gigantesques (plusieurs GB), expose des secrets, et intègre des outils de build inutiles en production. Le **multi-stage build** résout ce problème : une image de build contient tous les outils de compilation, mais seul l'artefact final est copié dans l'image de production — légère et sans outil superflu.

### 🔍 Anatomie Technique

**Dockerfile Multi-Stage — Application Python BCC :**

```dockerfile
# ─── Stage 1 : Build (image complète avec tous les outils) ───────────────────
FROM python:3.12-slim AS builder

WORKDIR /app

# Copier uniquement les fichiers de dépendances d'abord (optimisation cache)
COPY requirements.txt .

# Créer un environnement virtuel isolé
RUN python -m venv /opt/venv && \
    /opt/venv/bin/pip install --no-cache-dir --upgrade pip && \
    /opt/venv/bin/pip install --no-cache-dir -r requirements.txt

# ─── Stage 2 : Production (image minimale) ───────────────────────────────────
FROM python:3.12-slim AS production

# Utilisateur non-root obligatoire en production
RUN groupadd --gid 1001 bccapp && \
    useradd --uid 1001 --gid bccapp --no-create-home --shell /bin/false bccapp

WORKDIR /app

# Copier seulement le virtualenv du stage builder (pas les outils de build)
COPY --from=builder /opt/venv /opt/venv

# Copier le code applicatif
COPY --chown=bccapp:bccapp . .

# Supprimer les fichiers de dev inutiles en production
RUN rm -f .env.dev tests/ *.md

# Activer le venv
ENV PATH="/opt/venv/bin:$PATH"
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Port non-privilegié (> 1024) — requis pour un utilisateur non-root
EXPOSE 8080

# Basculer sur l'utilisateur non-root
USER bccapp

# Health check intégré
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8080/health')"

# Entrypoint avec exec (pas de shell intermédiaire — signal handling correct)
ENTRYPOINT ["python", "-m", "gunicorn"]
CMD ["--bind", "0.0.0.0:8080", "--workers", "4", "app:create_app()"]
```

**Réseaux Docker — Types et cas d'usage :**

```bash
# Types de réseaux Docker :
# bridge  : réseau isolé entre conteneurs (défaut)
# host    : partage le réseau de l'hôte (performance max, moins d'isolation)
# none    : pas de réseau (isolation totale)
# overlay : réseau multi-hôtes (Swarm/K8s)
# macvlan : conteneur avec sa propre adresse MAC (traité comme un hôte réseau)

# Créer un réseau bridge personnalisé avec un sous-réseau précis
docker network create \
    --driver bridge \
    --subnet 172.20.0.0/24 \
    --ip-range 172.20.0.128/25 \
    --gateway 172.20.0.1 \
    bcc-backend-net

# Créer un réseau frontend séparé
docker network create bcc-frontend-net

# Architecture multi-réseaux (isolation par couche) :
# Frontend net : nginx + app   → trafic web
# Backend net  : app + db      → trafic données
# app est sur les DEUX réseaux, mais nginx ne voit pas la DB directement

docker run -d --name nginx \
    --network bcc-frontend-net \
    -p 443:443 \
    nginx:alpine

docker run -d --name app \
    --network bcc-frontend-net \
    bcc/app:latest
docker network connect bcc-backend-net app   # Connecter app au backend aussi

docker run -d --name postgres \
    --network bcc-backend-net \            # DB visible UNIQUEMENT depuis app
    -e POSTGRES_DB=bcc \
    postgres:16-alpine

# Vérifier la connectivité réseau
docker exec app ping postgres              # app → db : OK
docker exec nginx ping postgres            # nginx → db : IMPOSSIBLE ✅ isolation OK
```

---

## 2) Module — Docker Compose & Orchestration (2h)

### 📖 Narration/Intuition

**Docker Compose** permet de définir et gérer une stack multi-conteneurs dans un seul fichier YAML. C'est l'outil de référence pour le développement local et les déploiements simples. Il simplifie considérablement la gestion des réseaux, volumes, dépendances et configurations.

### 🔍 Anatomie Technique

**Docker Compose complet — Stack BCC (API + DB + Reverse Proxy) :**

```yaml
# docker-compose.yml — Stack de déploiement BCC
name: bcc-services

services:
  # ─── Reverse Proxy ──────────────────────────────────────────────────────────
  nginx:
    image: nginx:1.27-alpine
    container_name: bcc-nginx
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./ssl:/etc/nginx/ssl:ro
      - nginx-logs:/var/log/nginx
    networks:
      - frontend
    depends_on:
      api:
        condition: service_healthy
    restart: unless-stopped
    
  # ─── Application API ────────────────────────────────────────────────────────
  api:
    build:
      context: .
      dockerfile: Dockerfile
      target: production    # Multi-stage : seulement le stage production
    container_name: bcc-api
    environment:
      # ✅ Variables sensibles via fichier .env (JAMAIS en dur dans le compose)
      - DATABASE_URL=${DATABASE_URL}
      - SECRET_KEY=${SECRET_KEY}
      - REDIS_URL=redis://redis:6379/0
    env_file:
      - .env.production
    networks:
      - frontend
      - backend
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_started
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8080/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
    restart: unless-stopped
    # Limites de ressources (protection contre les fuites mémoire)
    deploy:
      resources:
        limits:
          cpus: '1.0'
          memory: 512M
        reservations:
          memory: 128M
  
  # ─── Base de données PostgreSQL ──────────────────────────────────────────────
  postgres:
    image: postgres:16-alpine
    container_name: bcc-postgres
    environment:
      POSTGRES_DB: ${POSTGRES_DB}
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
    volumes:
      - postgres-data:/var/lib/postgresql/data
      - ./init-sql:/docker-entrypoint-initdb.d:ro
    networks:
      - backend
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER} -d ${POSTGRES_DB}"]
      interval: 10s
      timeout: 5s
      retries: 5
    restart: unless-stopped
  
  # ─── Redis (cache et sessions) ───────────────────────────────────────────────
  redis:
    image: redis:7-alpine
    container_name: bcc-redis
    command: redis-server --requirepass ${REDIS_PASSWORD} --maxmemory 256mb --maxmemory-policy allkeys-lru
    networks:
      - backend
    restart: unless-stopped

# ─── Réseaux isolés ──────────────────────────────────────────────────────────
networks:
  frontend:
    driver: bridge
    ipam:
      config:
        - subnet: 172.20.1.0/24
  backend:
    driver: bridge
    internal: true    # Pas d'accès externe au réseau backend
    ipam:
      config:
        - subnet: 172.20.2.0/24

# ─── Volumes persistants ─────────────────────────────────────────────────────
volumes:
  postgres-data:
    driver: local
  nginx-logs:
    driver: local
```

```bash
# Commandes Docker Compose essentielles
docker compose up -d              # Démarrer en arrière-plan
docker compose down               # Arrêter et supprimer les conteneurs
docker compose down -v            # Arrêter + supprimer les volumes (ATTENTION : perte de données)
docker compose logs -f api        # Suivre les logs du service api
docker compose ps                 # État de tous les services
docker compose exec api bash      # Ouvrir un shell dans le conteneur api
docker compose build --no-cache   # Reconstruire les images sans cache
docker compose pull               # Télécharger les images les plus récentes
```

---

## 3) Module — Sécurité des Conteneurs Docker (2h)

### 📖 Narration/Intuition

Un conteneur Docker mal sécurisé peut devenir un vecteur d'évasion vers l'hôte. Les principales menaces : conteneurs rootful (tournant en root), capabilities Linux excessives, montages de volumes dangereux (`-v /:/host`), images non vérifiées. La sécurité Docker est une discipline à part entière.

### 🔍 Anatomie Technique

**Audit de sécurité Docker avec Trivy & Docker Scout :**

```bash
# Trivy : scanner de vulnérabilités pour images Docker
apt install trivy   # ou : curl https://... | sh

# Scanner une image pour les CVE
trivy image python:3.12-slim
trivy image bcc/api:latest

# Scanner avec seuil de sévérité (ne reporter que CRITICAL et HIGH)
trivy image --severity CRITICAL,HIGH bcc/api:latest

# Scanner le Dockerfile lui-même (mauvaises pratiques)
trivy config Dockerfile

# Docker Scout (intégré à Docker Desktop)
docker scout cves bcc/api:latest
docker scout recommendations bcc/api:latest

# Docker Bench Security (audit de l'hôte Docker)
docker run --rm -it --net host --pid host --userns host --cap-add audit_control \
    -v /var/lib:/var/lib:ro \
    -v /var/run/docker.sock:/var/run/docker.sock:ro \
    -v /etc:/etc:ro \
    docker/docker-bench-security
```

**Sécurité des conteneurs — Bonnes pratiques :**

```bash
# 1. Utilisateur non-root obligatoire
docker run --user 1001:1001 bcc/api:latest

# 2. Système de fichiers en lecture seule
docker run --read-only \
    --tmpfs /tmp \                          # /tmp en RAM (writeable)
    --tmpfs /run \
    bcc/api:latest

# 3. Supprimer toutes les capabilities et n'ajouter que le strict minimum
docker run \
    --cap-drop ALL \                        # Supprimer toutes les capabilities
    --cap-add NET_BIND_SERVICE \           # Seulement si besoin de binding < 1024
    bcc/api:latest

# 4. Profil seccomp (filtrage des appels système)
docker run \
    --security-opt seccomp=/etc/docker/seccomp-profile.json \
    bcc/api:latest

# 5. Profil AppArmor
docker run \
    --security-opt apparmor=docker-default \
    bcc/api:latest

# 6. Pas de mode privilegié (--privileged est une évasion de conteneur triviale)
# ❌ Ne JAMAIS faire : docker run --privileged bcc/api

# 7. Rootless Docker (conteneurs sans privilège root sur l'hôte)
dockerd-rootless-setuptool.sh install
export DOCKER_HOST=unix:///run/user/$(id -u)/docker.sock
docker run --rm hello-world  # Tourne sans root sur l'hôte

# Dans Docker Compose (sécurité combinée)
services:
  api:
    security_opt:
      - no-new-privileges:true
      - apparmor=docker-default
    cap_drop:
      - ALL
    cap_add:
      - CHOWN
      - SETUID
      - SETGID
    read_only: true
    tmpfs:
      - /tmp:noexec,nosuid,size=64m
```

---

## 🏅 Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **OCI** | Open Container Initiative — standard ouvert pour les conteneurs |
| **CVE** | Common Vulnerabilities and Exposures — base des vulnérabilités connues |
| **SBOM** | Software Bill of Materials — inventaire des composants logiciels |
| **seccomp** | Secure Computing Mode — filtre d'appels système Linux |
| **LRU** | Least Recently Used — algorithme d'éviction du cache |
| **ENTRYPOINT** | Point d'entrée du conteneur Docker (commande principale) |
| **CMD** | Arguments par défaut passés à l'ENTRYPOINT |
| **Rootless** | Mode Docker où les conteneurs tournent sans nécessiter root sur l'hôte |

---

## 🏋️ Exercices & Corrigés

**Exercice 1 :** Réécrivez ce Dockerfile pour le sécuriser : `FROM ubuntu:latest; RUN apt install python3; COPY . .; CMD python3 app.py`

**Corrigé :**
```dockerfile
FROM python:3.12-slim AS production
RUN useradd --uid 1001 --no-create-home --shell /bin/false appuser
WORKDIR /app
COPY --chown=appuser:appuser requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY --chown=appuser:appuser . .
USER appuser
EXPOSE 8080
CMD ["python3", "-m", "gunicorn", "--bind", "0.0.0.0:8080", "app:app"]
```
Améliorations : image officielle spécifique (pas latest), utilisateur non-root, workdir, chown.

**Exercice 2 :** Dans le Docker Compose, pourquoi le réseau `backend` est-il configuré avec `internal: true` ?

**Corrigé :** `internal: true` empêche tout trafic sortant depuis ce réseau vers l'extérieur. Les conteneurs PostgreSQL et Redis ne peuvent pas initier de connexions vers Internet — uniquement recevoir des connexions depuis les conteneurs sur le même réseau. Cela protège contre les exfiltrations de données depuis la base de données si elle est compromise.

---

## ❓ Banque de Questions & Test du Jour

**Q1 :** Quel est l'avantage principal d'un Dockerfile multi-stage ?
- A) Permet d'utiliser plusieurs registres Docker simultanément
- B) Réduit la taille de l'image de production en excluant les outils de build
- C) Accélère le pull de l'image depuis le registre
- D) Permet de lancer plusieurs conteneurs depuis le même Dockerfile

**Réponse : B**

**Q2 :** Pourquoi `docker run --privileged` est-il dangereux ?
- A) Cela ralentit le conteneur
- B) Cela donne au conteneur un accès complet à l'hôte, permettant l'évasion de conteneur
- C) Cela empêche le conteneur de se connecter au réseau
- D) Cela désactive les variables d'environnement

**Réponse : B**

**Q3 :** Dans Docker Compose, que garantit `condition: service_healthy` dans `depends_on` ?
- A) Le service démarre seulement si le service dépendant a un uptime > 1 heure
- B) Le service attend que le healthcheck du service dépendant retourne un succès avant de démarrer
- C) Les deux services démarrent simultanément
- D) Le service redémarre automatiquement si le service dépendant tombe

**Réponse : B**

**Q4 :** `--cap-drop ALL --cap-add NET_BIND_SERVICE` dans un run Docker signifie :
- A) Supprimer le réseau du conteneur mais autoriser les binds de ports
- B) Supprimer toutes les capabilities Linux et ne ré-ajouter que celle permettant le binding sur les ports < 1024
- C) Configurer le pare-feu pour bloquer tout sauf NET_BIND
- D) Activer le mode réseau bridge avec filtrage

**Réponse : B**

**Q5 :** Trivy est un outil qui :
- A) Orchestre des clusters Docker Swarm
- B) Scanne les images Docker à la recherche de CVE (vulnérabilités connues) et de mauvaises pratiques dans les Dockerfiles
- C) Génère automatiquement des Dockerfiles sécurisés
- D) Remplace Docker Compose pour les déploiements en production

**Réponse : B**

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
