# Annexes — Fiches Aide-Mémoire & Synthèses Techniques

> [!NOTE]
> Ces fiches de révision condensées regroupent les commandes, syntaxes et règles indispensables pour réussir l'examen de certification BCC et briller en environnement bancaire professionnel.

---

## 🐧 Fiche 1 : Commandes Linux & Shell Bash

```bash
# === NAVIGATION & FICHIERS ===
pwd                      # Affiche le répertoire courant
ls -la                   # Liste détaillée avec fichiers cachés
cd /var/log              # Se déplacer dans un dossier (chemin absolu)
mkdir -p bcc/2026/logs   # Créer une arborescence complète
cp -r src/ dest/         # Copier récursivement un dossier
mv ancien.txt nouveau.txt # Déplacer ou renommer
rm -rf dossier/          # Supprimer un dossier et son contenu (ATTENTION)

# === PERMISSIONS & PROPRIÉTAIRES ===
chmod 755 script.sh      # rwxr-xr-x (Propriétaire: rwx, Groupe: r-x, Autres: r-x)
chmod 600 secret.key     # rw------- (Lecture/Écriture uniquement par le propriétaire)
chown user:group fichier  # Changer le propriétaire et le groupe

# === PROCESSUS & LOGS ===
ps aux | grep nginx      # Chercher un processus actif
top / htop               # Moniteur de ressources en temps réel
kill -9 PID              # Forcer l'arrêt d'un processus par son PID
tail -f /var/log/syslog  # Suivre un log en direct
grep -i "error" auth.log # Chercher un motif (insensible à la casse)

# === GESTION DE SERVICES SYSTEMD ===
systemctl status nginx   # État d'un service
systemctl start nginx    # Démarrer un service
systemctl stop nginx     # Arrêter un service
systemctl restart nginx  # Redémarrer un service
systemctl enable nginx   # Activer au démarrage du système
```

---

## 🐍 Fiche 2 : Syntaxe Python & Structure Objet

```python
# === TYPES & VARIABLES ===
nom = "Banque Centrale"   # str
agent_id = 1042           # int
solde = 15500.50          # float
actif = True              # bool
services = ["Réseau", "Sécurité", "Support"]  # list
config = {"host": "10.0.1.1", "port": 5432}   # dict

# === CONDITIONS & BOUCLES ===
if score >= 75:
    print("✅ Réussi")
elif score >= 50:
    print("⚠️ À revoir")
else:
    print("❌ Échec")

for s in services:
    print(f"Service IT : {s}")

# === GESTION D'EXCEPTIONS & FICHIERS ===
try:
    with open("config.json", "r") as f:
        data = f.read()
except FileNotFoundError:
    print("Fichier introuvable !")

# === CLASSE POO ===
class Ticket:
    def __init__(self, agent, desc):
        self.agent = agent
        self.desc = desc
        self.statut = "Ouvert"

    def fermer(self):
        self.statut = "Fermé"
```

---

## 🐘 Fiche 3 : SQL & PostgreSQL (Cheat Sheet)

```sql
-- === DDL (Structure) ===
CREATE TABLE agents (
    id SERIAL PRIMARY KEY,
    nom VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    departement VARCHAR(50),
    cree_le TIMESTAMP DEFAULT NOW()
);

-- === DML (Données) ===
INSERT INTO agents (nom, email, departement) 
VALUES ('Jean Mukendi', 'j.mukendi@bcc.cd', 'Réseau');

SELECT a.nom, COUNT(t.id) AS nb_tickets
FROM agents a
LEFT JOIN tickets t ON a.id = t.agent_id
WHERE a.departement = 'IT'
GROUP BY a.nom
HAVING COUNT(t.id) > 5
ORDER BY nb_tickets DESC;

UPDATE tickets SET statut = 'Fermé' WHERE id = 42;
DELETE FROM tickets WHERE statut = 'Annulé';

-- === INDEXATION & PERFORMANCE ===
CREATE INDEX idx_tickets_statut ON tickets(statut);
EXPLAIN ANALYZE SELECT * FROM tickets WHERE statut = 'Ouvert';
```

---

## 🌐 Fiche 4 : Réseaux & Ports TCP/IP

| Port | Protocole | Service / Description |
| :--- | :--- | :--- |
| **20/21** | FTP | Transfert de fichiers (non sécurisé) |
| **22** | SSH / SFTP | Administration à distance chiffrée |
| **23** | Telnet | Terminal à distance (obsolète/non sécurisé) |
| **25** | SMTP | Envoi de courriers électroniques |
| **53** | DNS | Résolution de noms de domaine |
| **67/68** | DHCP | Attribution dynamique d'adresses IP |
| **80** | HTTP | Web non chiffré |
| **443** | HTTPS | Web chiffré SSL/TLS |
| **5432** | PostgreSQL | Connexion à la base de données PostgreSQL |
| **3389** | RDP | Bureau à distance Windows |

---

## 🔄 Fiche 5 : Commande Git

```bash
git init                 # Initialiser un dépôt local
git clone <url>          # Cloner un dépôt distant
git status               # Vérifier l'état des fichiers
git add .                # Indexer toutes les modifications
git commit -m "feat:..." # Enregistrer une photo instantanée
git push origin main     # Envoyer les commits vers le serveur distant
git pull --rebase        # Récupérer et réaligner la branche locale
git checkout -b feature  # Créer et basculer sur une nouvelle branche
git merge feature        # Fusionner une branche dans la branche courante
```

---

*Fiches Aide-Mémoire Officielles — PARADIS IT BCC 2026*
