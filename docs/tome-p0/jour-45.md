# SEMESTRE 1 — Jour 45 (6h) : Examen Massif & Validation Semestre 1

> [!NOTE]
> **Objectif de la journée** : Valider l'acquisition de toutes les compétences du Semestre 1 via un exercice d'intégration global et un bilan du portfolio.
> **Compétences visées** : `PRO-01` à `SEC-05` (Niveau Cible: A) — Synthèse Globale.

---

## 1) Synthèse Générale de l'Architecture IT (1h30)

### 📖 1.1 Narration & Intuition
Le Semestre 1 a posé les fondations du château. Vous avez appris à construire les murs (Systèmes Linux), tirer les routes (Réseau), poster des gardes (Sécurité/Firewall), automatiser les tâches (Bash/Python), et surveiller le tout (Monitoring).

### 🔍 1.2 Anatomie Technique
Dans un SI d'entreprise réel, tous ces composants s'imbriquent. L'infrastructure est hébergée sur des conteneurs (Docker), déployée automatiquement, protégée par des règles de filtrage (UFW), sauvegardée de manière chiffrée, et supervisée en temps réel (Prometheus).

### 🛠️ 1.3 Atelier Pratique Hands-on
```bash
# Vérification globale de la stack d'un serveur type
uname -a                # Version du système
df -h                   # Espace disque
docker ps               # Conteneurs actifs
sudo ufw status         # Etat du pare-feu
htop                    # Charge système (Ctrl+C pour quitter)
```

### 🚑 1.4 Diagnostic & Réflexes Terrain
La capacité de résolution de problème (Troubleshooting) est la compétence #1. Face à un système en panne, suivez la méthode OSI (du physique/réseau vers l'application) et analysez systématiquement les logs.

---

## 2) Épreuve Pratique Intégrée (2h00)

### 📖 2.1 Narration & Intuition
C'est l'heure de vérité. Le scénario : Vous êtes le nouvel Administrateur Système d'une startup. Vous devez déployer un service web sécurisé, scripté, et documenté en un temps imparti.

### 🔍 2.2 Anatomie Technique
L'épreuve combine :
- L'écriture d'un script Bash d'automatisation.
- Le déploiement d'un conteneur Nginx.
- La configuration du pare-feu UFW pour n'autoriser que les ports nécessaires.
- La validation des droits d'accès.

### 🛠️ 2.3 Atelier Pratique Hands-on
```bash
# Script type attendu lors de l'examen (deploy.sh)
#!/bin/bash
echo "1. Mise à jour de sécurité..."
sudo ufw allow 80/tcp
sudo ufw reload

echo "2. Déploiement du conteneur Web..."
docker run -d -p 80:80 --name exam-web nginx

echo "3. Déploiement terminé. Vérification :"
docker ps | grep exam-web
```

### 🚑 2.4 Diagnostic & Réflexes Terrain
Pendant l'examen, ne paniquez pas sur les erreurs de syntaxe. Utilisez le manuel ! `man commande` ou `commande --help` sont les meilleurs amis de l'ingénieur.

---

## 3) Bilan du Portfolio & Transition Semestre 2 (2h00)

### 📖 3.1 Narration & Intuition
Le portfolio est votre vitrine professionnelle. Il ne s'agit pas de dire "je sais faire", il s'agit de **prouver** "voici comment j'ai fait".

### 🔍 3.2 Anatomie Technique
Chaque exercice validé tout au long de ce semestre (captures d'écran, scripts commentés, fichiers de configuration) doit être compilé proprement (via Git ou Markdown). Le Semestre 2 nous plongera dans les arcanes de la Cybersécurité offensive et du Cloud avancé.

### 🛠️ 3.3 Atelier Pratique Hands-on
```bash
# Archivage final des travaux pratiques du S1
mkdir -p ~/portfolio/s1
cp -r ~/labs/* ~/portfolio/s1/
tar -czvf portfolio_S1_votre_nom.tar.gz ~/portfolio/s1/
```

### 🚑 3.4 Diagnostic & Réflexes Terrain
Un livrable inexploitable (ex: script qui ne s'exécute pas, capture floue) vaut zéro. Testez toujours vos rendus sur une machine vierge ou revérifiez l'historique de vos commandes (`history`).

---

## Nouvelles abréviations rencontrées
- **SI** : Système d'Information
- **Troubleshooting** : Dépannage
- **OSI** : Open Systems Interconnection (Modèle)

---

## 🏧️ Exercices Pratiques (Preuves de Portfolio)

### Exercice 1 : Le Défi Ultime
- **Consigne** : Rédigez un script `clean.sh` qui stoppe et supprime tous les conteneurs Docker existants, ferme le port 80 sur le firewall, et affiche "Environnement nettoyé".
- **Livrables à produire** : Code du script et capture de l'exécution.
- **Corrigé détaillé & Guidé** :
  ```bash
  #!/bin/bash
  # Arrêter tous les conteneurs
  docker stop $(docker ps -a -q) 2>/dev/null
  docker rm $(docker ps -a -q) 2>/dev/null
  # Fermer le port 80
  sudo ufw delete allow 80/tcp
  echo "Environnement nettoyé"
  ```

---

## ❓ Banque de Questions QCM (Évaluation 75% minimum)
1. QCM: Quelle est la première étape du troubleshooting réseau selon le modèle OSI ? A) Réinstaller l'OS B) Vérifier la couche physique (câble/connexion) C) Modifier le code de l'application D) Appeler le fournisseur. *Réponse: B*
2. QCM: Quelle commande affiche l'historique des commandes tapées dans le terminal ? A) `history` B) `logs` C) `trace` D) `cmd-log`. *Réponse: A*
3. QCM: Comment obtient-on de l'aide sur une commande Linux (ex: tar) ? A) Demander à Google B) `man tar` C) `help me tar` D) `sudo tar`. *Réponse: B*
4. QCM: Quelle action le script suivant réalise-t-il : `docker run -d nginx` ? A) Télécharge Nginx uniquement B) Lance Nginx en arrière-plan (detached) C) Lance Nginx et bloque le terminal D) Supprime Nginx. *Réponse: B*
5. QCM: Quel est l'objectif principal d'un Portfolio IT ? A) Gagner de l'espace disque B) Prouver techniquement ses compétences avec des cas réels C) Stocker des mots de passe D) Remplacer un CV papier. *Réponse: B*

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
