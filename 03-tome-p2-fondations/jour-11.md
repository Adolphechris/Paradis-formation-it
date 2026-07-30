# TOME P2 — Jour 11 (12h) : Projet Intégrateur P2 — Système de Monitoring Automatisé BCC

> [!NOTE]
> **Objectif de la journée** : Assembler et livrer un projet informatique complet qui intègre toutes les compétences de la Phase P2 : Python, SQL, Bash, Git. Vous construirez un système de monitoring automatisé pour la Banque Centrale du Congo.

---

## 1) Architecture du Projet (2h)

### 📖 1.1 Vue d'Ensemble

Le projet consiste en un **système de surveillance automatisé** pour l'infrastructure IT de la BCC :

```
monitoring-bcc/
├── monitor.py          ← Script principal Python (collecte métriques)
├── database.py         ← Couche d'accès PostgreSQL
├── alertes.py          ← Système d'alertes et notifications
├── scripts/
│   ├── collect.sh      ← Script Bash de collecte système
│   └── deploy.sh       ← Script de déploiement
├── sql/
│   └── schema.sql      ← Schéma de la base de données
├── tests/
│   └── test_monitor.py ← Tests unitaires
├── requirements.txt    ← Dépendances Python
└── README.md           ← Documentation complète
```

---

## 2) Base de Données PostgreSQL (2h)

### 🛠️ 2.1 Schéma SQL

```sql
-- sql/schema.sql
CREATE TABLE serveurs (
    id          SERIAL PRIMARY KEY,
    nom         VARCHAR(100) NOT NULL UNIQUE,
    ip          INET NOT NULL,
    type        VARCHAR(50) DEFAULT 'Linux',
    actif       BOOLEAN DEFAULT TRUE
);

CREATE TABLE metriques (
    id              SERIAL PRIMARY KEY,
    serveur_id      INTEGER REFERENCES serveurs(id),
    cpu_pct         DECIMAL(5,2),
    ram_pct         DECIMAL(5,2),
    disque_pct      DECIMAL(5,2),
    releve_le       TIMESTAMP DEFAULT NOW()
);

CREATE TABLE alertes (
    id          SERIAL PRIMARY KEY,
    serveur_id  INTEGER REFERENCES serveurs(id),
    type        VARCHAR(50),
    message     TEXT,
    severite    VARCHAR(20) DEFAULT 'WARNING',
    resolue     BOOLEAN DEFAULT FALSE,
    cree_le     TIMESTAMP DEFAULT NOW()
);

-- Données initiales
INSERT INTO serveurs (nom, ip, type) VALUES
    ('BCC-PROD-01', '10.0.1.10', 'Linux Ubuntu'),
    ('BCC-DB-01',   '10.0.1.20', 'PostgreSQL'),
    ('BCC-WEB-01',  '10.0.1.30', 'Nginx');
```

---

## 3) Script Python de Monitoring (4h)

### 🛠️ 3.1 Collecte des Métriques

```python
# monitor.py
import psutil
import psycopg2
import datetime
import json

class MonitorBCC:
    def __init__(self, db_config):
        self.conn = psycopg2.connect(**db_config)
        self.seuils = {"cpu": 85, "ram": 80, "disque": 90}

    def collecter_metriques(self):
        return {
            "cpu_pct": psutil.cpu_percent(interval=2),
            "ram_pct": psutil.virtual_memory().percent,
            "disque_pct": psutil.disk_usage('/').percent,
            "timestamp": datetime.datetime.now().isoformat()
        }

    def sauvegarder(self, serveur_id, metriques):
        with self.conn.cursor() as cur:
            cur.execute(
                "INSERT INTO metriques (serveur_id, cpu_pct, ram_pct, disque_pct) VALUES (%s, %s, %s, %s)",
                (serveur_id, metriques["cpu_pct"], metriques["ram_pct"], metriques["disque_pct"])
            )
        self.conn.commit()

    def verifier_alertes(self, serveur_id, metriques):
        for ressource, seuil in self.seuils.items():
            valeur = metriques.get(f"{ressource}_pct", 0)
            if valeur >= seuil:
                self.creer_alerte(serveur_id, ressource, valeur)

    def creer_alerte(self, serveur_id, ressource, valeur):
        msg = f"ALERTE : {ressource.upper()} à {valeur:.1f}% — Seuil critique atteint !"
        severity = "CRITIQUE" if valeur >= 95 else "WARNING"
        with self.conn.cursor() as cur:
            cur.execute(
                "INSERT INTO alertes (serveur_id, type, message, severite) VALUES (%s, %s, %s, %s)",
                (serveur_id, ressource, msg, severity)
            )
        self.conn.commit()
        print(f"🚨 {msg}")

if __name__ == "__main__":
    db_config = {
        "host": "localhost", "database": "bcc_monitoring",
        "user": "monitor_user", "password": "SecurePass2026!"
    }
    monitor = MonitorBCC(db_config)
    metriques = monitor.collecter_metriques()
    print(f"CPU: {metriques['cpu_pct']}% | RAM: {metriques['ram_pct']}% | Disque: {metriques['disque_pct']}%")
    monitor.sauvegarder(1, metriques)
    monitor.verifier_alertes(1, metriques)
```

---

## 4) Déploiement et Documentation Git (2h)

### 🛠️ 4.1 Initialiser et Versionner le Projet

```bash
cd monitoring-bcc
git init
git add .
git commit -m "feat: initialisation système monitoring BCC v1.0.0

- Collecte métriques CPU/RAM/Disque en temps réel
- Stockage PostgreSQL avec schéma relationnel optimisé
- Système d'alertes multi-niveaux (WARNING/CRITIQUE)
- Script de déploiement automatisé"

git remote add origin https://github.com/bcc-it/monitoring-bcc.git
git push -u origin main
```

---

## 🏋️ Exercices Pratiques & Corrigés

### Exercice : Rapport Automatique
Ajoutez une méthode `generer_rapport_json()` qui exporte les 24 dernières heures de métriques en fichier JSON.
- **Corrigé** :
  ```python
  def generer_rapport_json(self, serveur_id):
      with self.conn.cursor() as cur:
          cur.execute(
              "SELECT cpu_pct, ram_pct, disque_pct, releve_le FROM metriques WHERE serveur_id = %s AND releve_le > NOW() - INTERVAL '24 hours' ORDER BY releve_le",
              (serveur_id,)
          )
          rows = cur.fetchall()
      rapport = [{"cpu": r[0], "ram": r[1], "disque": r[2], "ts": str(r[3])} for r in rows]
      with open(f"rapport-{datetime.date.today()}.json", "w") as f:
          json.dump(rapport, f, indent=2)
      print(f"Rapport généré : {len(rapport)} relevés exportés.")
  ```

---

## ❓ Banque de Questions & Test du Jour 11

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*