# SEMESTRE 1 — Jour 44 (6h) : Conformité, RGPD & Gouvernance IT

> [!NOTE]
> **Objectif de la journée** : Comprendre le cadre légal (RGPD), les normes de gouvernance (ISO 27001) et intégrer la conformité au cœur des opérations IT.
> **Compétences visées** : `POL-01` (Niveau Cible: A), `POL-04` (Niveau Cible: A) — Politiques de Sécurité et Audits.

---

## 1) Principes du RGPD et Protection des Données (1h30)

### 📖 1.1 Narration & Intuition
Si vous manipulez des données de citoyens européens, vous manipulez des matières dangereuses soumises à la loi. Le RGPD (Règlement Général sur la Protection des Données) garantit que les entreprises respectent la vie privée. Il ne s'agit pas de bloquer le business, mais de le faire de manière responsable (consentement, droit à l'oubli).

### 🔍 1.2 Anatomie Technique
Le RGPD s'appuie sur le *Privacy by Design* : la sécurité doit être intégrée dès la conception du logiciel. Les données au repos doivent être chiffrées. Une fuite de données (Data Breach) doit être signalée à l'autorité (CNIL en France, APD en Belgique) dans les 72h.

### 🛠️ 1.3 Atelier Pratique Hands-on
```bash
# Exemple de protection basique : chiffrer une archive sensible contenant des données clients
tar -czvf clients.tar.gz dossier_clients/
gpg -c clients.tar.gz
# Supprimer l'original non chiffré
rm clients.tar.gz
```

### 🚑 1.4 Diagnostic & Réflexes Terrain
Lors d'un audit de base de données, cherchez les mots de passe stockés en texte clair (plain text). C'est la violation RGPD/Sécurité la plus flagrante.

---

## 2) Gouvernance de sécurité : Norme ISO 27001 (1h30)

### 📖 2.1 Narration & Intuition
Comment prouver à un client que vous êtes sécurisé ? "Croyez-moi" ne suffit pas. ISO 27001 est un tampon officiel, un système de management (le SMSI) qui prouve que votre entreprise a des processus solides d'analyse des risques et d'amélioration continue.

### 🔍 2.2 Anatomie Technique
L'ISO 27001 ne dit pas "utilisez un pare-feu Cisco". Elle exige que vous mettiez en place des contrôles selon la roue de Deming (PDCA : Plan, Do, Check, Act) : Politique de mot de passe, gestion des accès, plan de reprise d'activité (PRA).

### 🛠️ 2.3 Atelier Pratique Hands-on
```bash
# Vérifier la politique d'expiration des mots de passe sur Linux (Check de conformité)
chage -l root
# Configurer une expiration tous les 90 jours
sudo chage -M 90 adolphe
```

### 🚑 2.4 Diagnostic & Réflexes Terrain
La documentation est vitale. Si un processus technique existe mais n'est pas documenté, pour un auditeur ISO, il n'existe pas. Gardez des traces écrites (logs, tickets de révocation de droits).

---

## 3) Audits de Conformité et Chartes d'Utilisation (2h00)

### 📖 3.1 Narration & Intuition
L'audit est une photographie de l'état de santé sécuritaire. La charte d'utilisation est le contrat moral et légal entre l'entreprise et l'employé sur l'utilisation du matériel IT.

### 🔍 3.2 Anatomie Technique
Un audit technique s'automatise via des outils comme OpenSCAP ou LinPEAS. Ces outils scannent les systèmes d'exploitation pour vérifier la conformité aux guides de bonnes pratiques (CIS Benchmarks).

### 🛠️ 3.3 Atelier Pratique Hands-on
```bash
# Audit basique de permissions sensibles (recherche de fichiers SUID)
find / -perm -4000 2>/dev/null

# Audit de la configuration SSH (interdire Root)
grep PermitRootLogin /etc/ssh/sshd_config
```

### 🚑 3.4 Diagnostic & Réflexes Terrain
Si un employé contourne les règles de sécurité (ex: Brancher sa propre clé USB), ce n'est pas seulement un problème technique, c'est une rupture de la charte IT. La solution implique le département RH.

---

## Nouvelles abréviations rencontrées
- **RGPD** : Règlement Général sur la Protection des Données
- **CNIL** : Commission Nationale de l'Informatique et des Libertés
- **SMSI** : Système de Management de la Sécurité de l'Information
- **PDCA** : Plan, Do, Check, Act

---

## 🏧️ Exercices Pratiques (Preuves de Portfolio)

### Exercice 1 : Audit rapide Linux
- **Consigne** : Vérifiez que l'utilisateur `root` ne peut pas se connecter en SSH sur votre machine, pour répondre à une exigence de conformité basique.
- **Livrables à produire** : Commande(s) et résultat de la modification du fichier de configuration.
- **Corrigé détaillé & Guidé** :
  ```bash
  sudo sed -i 's/PermitRootLogin yes/PermitRootLogin no/g' /etc/ssh/sshd_config
  sudo systemctl restart sshd
  grep PermitRootLogin /etc/ssh/sshd_config
  ```

---

## ❓ Banque de Questions QCM (Évaluation 75% minimum)
1. QCM: En combien de temps une violation de données (fuite) doit-elle être signalée selon le RGPD ? A) 24h B) 72h C) 1 semaine D) 1 mois. *Réponse: B*
2. QCM: Qu'est-ce que le principe de "Privacy by Design" ? A) Cacher les serveurs B) Intégrer la sécurité et confidentialité dès la conception C) Concevoir de beaux sites D) Un outil de chiffrement. *Réponse: B*
3. QCM: Quel est le but principal de l'ISO 27001 ? A) Vendre des antivirus B) Mettre en place un Système de Management de la Sécurité (SMSI) C) Développer en Python D) Configurer des routeurs. *Réponse: B*
4. QCM: Que signifie le cycle PDCA en gouvernance ? A) Plan, Do, Check, Act B) Protect, Defend, Control, Assess C) Private Data Control Act D) Plan, Delete, Create, Alert. *Réponse: A*
5. QCM: A quoi sert une charte informatique dans une entreprise ? A) Configurer le Wi-Fi B) Définir les droits et devoirs des utilisateurs vis-à-vis du SI C) Augmenter le salaire des ingénieurs D) Installer un OS. *Réponse: B*

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
