# TOME P4 — Jour 30 (12h) : Docker & Conteneurisation — Déployer n'importe où sans accroc

> [!NOTE]
> **Objectif de la journée** : Comprendre et utiliser Docker pour conteneuriser vos applications. Finis les *"Mais ça marche sur ma machine !"*. Vous apprendrez à créer des images Docker, gérer des conteneurs et orchestrer des applications multi-conteneurs avec Docker Compose.

---

## 1) Conteneurs vs Machines Virtuelles (2h)

### 📖 1.1 La Révolution du Conteneur

Une **Machine Virtuelle (VM)** emporte tout un système d'exploitation hôte + invité (plusieurs Go, démarrage en minutes).
Un **Conteneur Docker** partage le noyau Linux du serveur et n'embarque QUE l'application et ses dépendances (quelques Mo, démarrage en millisecondes).

---

## 2) Dockerfile et Images Docker (4h)

### 🛠️ 2.1 Écrire un Dockerfile pour une App Python/Node

```dockerfile
# Dockerfile — Portail IT BCC
FROM python:3.11-slim

WORKDIR /app

# Copier les dépendances et installer
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copier le code source
COPY . .

# Exposer le port de l'application
EXPOSE 5000

# Commande de démarrage
CMD ["python", "app.py"]
```

```bash
# Construire l'image Docker
docker build -t bcc-portail-it:1.0 .

# Lancer le conteneur
docker run -d -p 8080:5000 --name portail-bcc bcc-portail-it:1.0

# Voir les conteneurs actifs
docker ps
```

---

## 3) Orchestration avec Docker Compose (4h)

### 🛠️ 3.1 Orchestrer App Web + Base de Données PostgreSQL

```yaml
# docker-compose.yml
version: '3.8'

services:
  web:
    build: .
    ports:
      - "8080:5000"
    environment:
      - DB_HOST=db
      - DB_NAME=bcc_db
    depends_on:
      - db

  db:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: bcc_db
      POSTGRES_PASSWORD: SecurePassword2026!
    volumes:
      - pgdata:/var/lib/postgresql/data

volumes:
  pgdata:
```

```bash
# Démarrer toute l'infrastructure en une commande
docker compose up -d

# Arrêter proprement
docker compose down
```

---

## 🏋️ Exercices Pratiques & Corrigés

### Exercice : Inspection de Logs
Affichez les logs en direct du conteneur `portail-bcc`.
- **Corrigé** : `docker logs -f portail-bcc`

---

## ❓ Banque de Questions & Test du Jour 30

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*