# SEMESTRE 1 — Jour 43 (6h) : Monitoring & Supervision d'Infrastructure

> [!NOTE]
> **Objectif de la journée** : Déployer et exploiter des outils de supervision pour surveiller l'état de santé du système et analyser les logs de manière centralisée.
> **Compétences visées** : `POL-03` (Niveau Cible: A) — Surveillance et Supervision IT.

---

## 1) Métriques Système : Prometheus et Grafana (1h30)

### 📖 1.1 Narration & Intuition
Conduire une infrastructure sans supervision, c'est rouler à 130 km/h de nuit tous feux éteints. Prometheus est le tableau de bord de la voiture qui récolte la vitesse et le carburant. Grafana est l'écran de luxe qui transforme ces chiffres bruts en beaux graphiques.

### 🔍 1.2 Anatomie Technique
Prometheus fonctionne sur un modèle "Pull" : il va "scraper" (récupérer) régulièrement des métriques exposées sur une URL HTTP par des "Exporters" (ex: Node Exporter pour les métriques Linux CPU/RAM). Grafana se connecte à Prometheus pour exécuter des requêtes PromQL et dessiner des dashboards.

### 🛠️ 1.3 Atelier Pratique Hands-on
```bash
# Lancement de Node Exporter pour exposer les métriques
docker run -d --net="host" --pid="host" -v "/:/host:ro,rslave" \
  quay.io/prometheus/node-exporter --path.rootfs=/host

# Vérifier la présence des métriques
curl http://localhost:9100/metrics | head -n 10
```

### 🚑 1.4 Diagnostic & Réflexes Terrain
Si Grafana affiche "No Data", vérifiez l'état des "Targets" dans l'interface de Prometheus (Menu Status > Targets). L'exporter est peut-être down ou bloqué par un pare-feu (ex: UFW bloque le port 9100).

---

## 2) Analyse Centralisée de Logs : ELK Stack (1h30)

### 📖 2.1 Narration & Intuition
Quand un serveur plante, les indices sont dans les logs (`/var/log`). Mais avec 50 serveurs, vous ne pouvez pas vous connecter partout en SSH. La Stack ELK (Elasticsearch, Logstash, Kibana) aspire tous les logs de l'entreprise vers un immense moteur de recherche centralisé.

### 🔍 2.2 Anatomie Technique
- **Logstash (ou Filebeat)** : L'agent sur le serveur qui lit le fichier et l'envoie.
- **Elasticsearch** : La base de données ultra-rapide qui indexe le texte.
- **Kibana** : L'interface web pour chercher dans les logs (ex: "Erreur 500 AND server: web01").

### 🛠️ 2.3 Atelier Pratique Hands-on
```bash
# Exemple de configuration simplifiée d'un agent de log via rsyslog
# Redirection des logs locaux vers un serveur central (ex: 10.0.0.50)
echo "*.* @10.0.0.50:514" | sudo tee -a /etc/rsyslog.conf

# Relancer le service pour appliquer
sudo systemctl restart rsyslog
```

### 🚑 2.4 Diagnostic & Réflexes Terrain
Elasticsearch est extrêmement gourmand en RAM. S'il crashe sans raison apparente sous Linux, regardez le OOM Killer (`dmesg | grep -i killed`).

---

## 3) Alertes et Seuils Critiques (2h00)

### 📖 3.1 Narration & Intuition
Regarder des graphiques 24h/24 est impossible. Il faut que le système vous réveille (SMS, Slack, Mail) uniquement si l'utilisation du disque dépasse 90% ou si le site web est inaccessible.

### 🔍 3.2 Anatomie Technique
Avec Prometheus, c'est le rôle de l'**Alertmanager**. Vous définissez des règles d'alerte dans Prometheus avec PromQL. Si la règle est enfreinte, l'alerte est envoyée à l'Alertmanager qui gère le dédoublonnage, le regroupement et le routage (vers Slack, Email, PagerDuty).

### 🛠️ 3.3 Atelier Pratique Hands-on
```yaml
# Exemple de règle PromQL d'alerte (dans prometheus.yml)
groups:
- name: exemple
  rules:
  - alert: InstanceDown
    expr: up == 0
    for: 1m
    labels:
      severity: critique
    annotations:
      summary: "Le serveur {{ $labels.instance }} est arrêté"
```

### 🚑 3.4 Diagnostic & Réflexes Terrain
Évitez la "fatigue d'alerte". Ne configurez pas d'alertes pour des pics d'utilisation CPU de 5 secondes. Utilisez des clauses `for: 5m` pour s'assurer que le problème est persistant avant de réveiller un ingénieur.

---

## Nouvelles abréviations rencontrées
- **ELK** : Elasticsearch, Logstash, Kibana
- **PromQL** : Prometheus Query Language
- **OOM** : Out Of Memory

---

## 🏧️ Exercices Pratiques (Preuves de Portfolio)

### Exercice 1 : Récupération de métriques
- **Consigne** : Déployez Node Exporter et prouvez qu'il expose la charge CPU.
- **Livrables à produire** : Résultat de la commande `curl` filtrée avec `grep`.
- **Corrigé détaillé & Guidé** :
  ```bash
  # Lancement du conteneur (voir module 1)
  curl -s http://localhost:9100/metrics | grep node_cpu_seconds_total
  ```

---

## ❓ Banque de Questions QCM (Évaluation 75% minimum)
1. QCM: Sur quel modèle de collecte de données fonctionne Prometheus ? A) Push B) Pull C) FTP D) SSH. *Réponse: B*
2. QCM: Dans la stack ELK, à quoi sert Kibana ? A) Stocker les logs B) Parser les logs C) Visualiser et chercher dans les données D) Générer des certificats SSL. *Réponse: C*
3. QCM: Quel composant expose les métriques Linux système à Prometheus ? A) Grafana B) Node Exporter C) Alertmanager D) Logstash. *Réponse: B*
4. QCM: Pourquoi utilise-t-on le paramètre "for: 5m" dans une règle d'alerte ? A) Pour augmenter la gravité B) Pour éviter d'alerter sur des pics courts (faux positifs) C) Pour envoyer l'alerte 5 fois D) Pour redémarrer le serveur. *Réponse: B*
5. QCM: Quelle base de données est au cœur de la stack ELK ? A) MySQL B) PostgreSQL C) Elasticsearch D) MongoDB. *Réponse: C*

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
