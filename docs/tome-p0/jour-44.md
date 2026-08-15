# SEMESTRE 1 — Jour 44 (6h) : Conformité, RGPD & Gouvernance IT

> [!NOTE]
> **Objectif de la journée** : Comprendre le cadre légal (RGPD), la norme internationale d'organisation de la sécurité (ISO/IEC 27001), les méthodes d'analyse de risques (EBIOS RM) et intégrer la conformité au cœur des opérations informatiques quotidiennes.
> **Compétences visées** : `POL-01` (Niveau Cible: A), `POL-04` (Niveau Cible: A) — Politiques de Sécurité, Gouvernance et Audits.

---

## 🎯 Objectifs de la Leçon

- ⚖️ Maîtriser les 6 principes fondamentaux du **RGPD** et les obligations légales de protection des données.
- 🏢 Comprendre le rôle du **SMSI** (Système de Management de la Sécurité) et la norme **ISO/IEC 27001**.
- 🔄 Déployer le cycle d'amélioration continue **PDCA** (Roue de Deming).
- 🔍 Exécuter des audits de sécurité automatisés basés sur les **CIS Benchmarks** avec **Lynis** et **OpenSCAP**.
- 📜 Définir le rôle légal d'une **Charte Informatique** d'entreprise.
- 🧪 Pratiquer des vérifications de conformité et du chiffrement sous Linux.

---

## 🖼️ Gouvernance et Sécurité du Système d'Information

![Conformité & RGPD](https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800)

---

## 📖 1. Le RGPD : Le Cadre Légal Universel des Données Personnelles

### 1.1 Narration & Intuition — Le Code de la Route des Données

Si une entreprise transporte des produits chimiques dangereux sur la voie publique, la loi exige des citernes étanches, des chauffeurs formés, un traçage du parcours et des procédures d'urgence en cas de fuite.

Dans le monde numérique, les **données personnelles** des clients, employés et utilisateurs sont l'équivalent de ces matières sensibles. Le **RGPD** (*Règlement Général sur la Protection des Données* — RGPD en français, GDPR en anglais) est le code de la route européen et mondial qui oblige toute entreprise à manipuler ces données avec une hygiène irréprochable.

> [!IMPORTANT]
> **Portée extraterritoriale du RGPD :**  
> Même si votre entreprise est basée au Canada, aux États-Unis ou en Afrique, dès lors que vous traitez les données d'un seul citoyen résidant dans l'Union Européenne, vous êtes **juridiquement soumis au RGPD** sous peine de sanctions financières majeures (jusqu'à 20 millions d'euros ou 4% du chiffre d'affaires mondial annuel).

### 1.2 Les 6 Principes Fondamentaux du RGPD

```
1. Légalité, Loyauté et Transparence  ──► Obtenir le consentement explicite de l'utilisateur.
2. Limitation des Finalités          ──► N'utiliser les données QUE pour ce qui a été annoncé.
3. Minimisation des Données          ──► Ne collecter que le strict minimum nécessaire.
4. Exactitude                        ──► Maintenir les données à jour et corriger les erreurs.
5. Limitation de la Conservation     ──► Effacer les données une fois la finalité atteinte.
6. Intégrité et Confidentialité       ──► Chiffrer et sécuriser les données contre les fuites.
```

### 1.3 Concepts Clés & Acteurs du RGPD

- **Donnée Personnelle** : Toute information identifiant directement ou indirectement une personne physique (Nom, IP, Email, Empreinte, Géolocalisation).
- **Responsable de Traitement (*Data Controller*)** : L'entreprise ou l'organisation qui décide des finalités du traitement des données.
- **Sous-traitant (*Data Processor*)** : Le prestataire (ex: hébergeur Cloud AWS, service d'emailing) qui traite les données pour le compte du responsable.
- **DPO (*Data Protection Officer*)** : Le délégué à la protection des données chargé de veiller à la conformité interne.
- **Privacy by Design & by Default** : Obligation d'intégrer la sécurité des données dès la première ligne de code d'une application, et de régler les options par défaut sur le niveau de confidentialité le plus élevé.
- **Notification de Fuite sous 72h** : En cas de cyberattaque ou de fuite de données (*Data Breach*), l'entreprise doit obligatoirement notifier l'autorité de contrôle (CNIL en France, APD en Belgique, OPC au Canada) dans un délai maximal de **72 heures**.

---

## 📖 2. La Norme ISO/IEC 27001 et le SMSI

### 2.1 Qu'est-ce que le SMSI ?

Comment prouver à un client grand compte ou à un auditeur que votre infrastructure est sécurisée ? La déclaration d'intention ne suffit pas.

La norme internationale **ISO/IEC 27001** définit les exigences pour mettre en place un **SMSI** (*Système de Management de la Sécurité de l'Information*). Le SMSI n'est pas un logiciel : c'est un ensemble structuré de politiques, de procédures, d'analyses de risques et de contrôles techniques permettant de gérer la sécurité de l'entreprise.

### 2.2 Le Cycle d'Amélioration Continue PDCA (Roue de Deming)

```
                       ┌──────────────────────────────┐
                       │  1. PLAN (Planifier)         │
                       │  - Analyse des risques       │
                       │  - Définition des politiques │
                       └──────────────┬───────────────┘
                                      │
                                      ▼
┌──────────────────────────────┐              ┌──────────────────────────────┐
│  4. ACT (Agir / Corriger)    │              │  2. DO (Déployer)            │
│  - Corriger les pannes       │              │  - Appliquer les contrôles   │
│  - Mettre à jour les règles  │              │  - Former les employés       │
└──────────────▲───────────────┘              └──────────────┬───────────────┘
               │                                             │
               └──────────────┬──────────────────────────────┘
                              │
                       ┌──────┴───────────────────────┐
                       │  3. CHECK (Auditer/Vérifier) │
                       │  - Audits de sécurité        │
                       │  - Revue des logs & métriques│
                       └──────────────────────────────┘
```

---

## 📖 3. Audits de Conformité Technique : Lynis et CIS Benchmarks

### 3.1 Les CIS Benchmarks (Center for Internet Security)

Un **CIS Benchmark** est un guide mondial de recommandations de hardening (durcissement) pour un système d'exploitation ou un serveur (ex: *CIS Ubuntu Linux 22.04 LTS Benchmark*). Il liste des centaines de règles précises :
- Interdire le login root direct en SSH
- Désactiver les systèmes de fichiers obsolètes (cramfs, hfs)
- Forcer la complexité des mots de passe via PAM
- Configurer la rotation automatique des logs

### 3.2 Outils d'Audit sous Linux

```
                       ┌──────────────────────────────────────────┐
                       │  LYNIS (Audit Système Linux Open Source)  │
                       │  Scanne la machine et attribue un score  │
                       │  de conformité (Hardening Index /100).   │
                       └──────────────────────────────────────────┘
                       ┌──────────────────────────────────────────┐
                       │  OPENSCAP (Security Content Automation)  │
                       │  Compare la machine aux profils officiels│
                       │  NIST / DISA-STIG / CIS.                 │
                       └──────────────────────────────────────────┘
```

---

## 📖 4. La Charte Informatique et l'Aspect Humain

L'élément le plus vulnérable d'une chaîne de sécurité reste l'être humain (ingénierie sociale, phishing). La **Charte Informatique** est un document juridique annexé au règlement intérieur de l'entreprise :

- **Objectif** : Définir les droits et devoirs des utilisateurs vis-à-vis des ressources numériques (mots de passe, accès Wi-Fi, usage personnel toléré).
- **Valeur juridique** : Permet à la direction d'engager des sanctions disciplinaires en cas d'utilisation malveillante du système d'information.
- **Règles clés** : Verrouillage obligatoire de session, interdiction des clés USB personnelles, interdiction du *Shadow IT* (installation de logiciels non approuvés).

---

## 🧪 Atelier Pratique : Exécuter des Contrôles de Conformité Linux

Exécutez cette série de commandes pour réaliser un audit de conformité et sécuriser des données :

```bash
# 1. Installer l'outil d'audit de sécurité Lynis sous Ubuntu/Debian
sudo apt update && sudo apt install -y lynis gpg

# 2. Lancer un audit de sécurité automatisé complet du système
sudo lynis audit system --quick

# 3. Vérifier le score de conformité (Hardening Index) généré par Lynis
sudo grep "Hardening index" /var/log/lynis.log
# Output attendu: Hardening index : [ 75 ] [ Result: 75/100 ]

# 4. Vérifier la conformité de la politique de mots de passe Linux (login.defs)
grep -E "^(PASS_MAX_DAYS|PASS_MIN_DAYS|PASS_WARN_AGE)" /etc/login.defs
# Output souhaité en production :
# PASS_MAX_DAYS  90
# PASS_MIN_DAYS  7
# PASS_WARN_AGE  14

# 5. Vérifier la date d'expiration du mot de passe d'un utilisateur
sudo chage -l $USER

# 6. Modifier l'expiration maximale d'un compte à 90 jours (exigence ISO 27001)
sudo chage -M 90 $USER

# 7. Audit de conformité SSH : Vérifier que le login Root direct est désactivé
sudo grep -i "^PermitRootLogin" /etc/ssh/sshd_config || echo "Option non explicitée (Défaut)"

# 8. Corriger et sécuriser la configuration SSH avec sed (Hardening)
sudo sed -i 's/^#*PermitRootLogin.*/PermitRootLogin no/' /etc/ssh/sshd_config
sudo systemctl reload sshd

# 9. Atelier Chiffrement RGPD : Chiffrer une archive de données sensibles avec GPG
echo "Données personnelles clients confidentielles" > clients.csv
tar -czf clients.tar.gz clients.csv
gpg --batch --yes --passphrase "MotDePasseTresSecurise123!" -c clients.tar.gz
rm clients.csv clients.tar.gz # Supprimer les originaux en clair

# 10. Vérifier la présence de l'archive chiffrée (.gpg)
ls -l clients.tar.gz.gpg
# Output attendu: -rw-r--r-- 1 adolphe adolphe ... clients.tar.gz.gpg
```

---

## 🛠️ Diagnostics & Réflexes Terrain

### 1. Violation RGPD : Découverte d'une base de données contenant des mots de passe en texte clair
- **Constat** : Lors d'un audit de base de données, les mots de passe sont stockés sans hachage (Plaintext).
- **Réflexe** : Bloquez l'accès à la base de données, signalez la vulnérabilité au DPO et refactorisez l'application pour utiliser un algorithme de hachage robuste avec sel (ex: `Argon2id` ou `bcrypt`).

### 2. Échec d'Audit ISO 27001 : "Absence de preuve d'application de la procédure"
- **Constat** : Une procédure de révocation des accès lors du départ d'un employé existe sur le papier, mais aucun registre ou log de validation n'est conservé.
- **Réflexe** : Pour un auditeur ISO 27001, **ce qui n'est pas documenté ou tracé n'existe pas**. Automatisez la création de tickets de traçabilité lors de chaque action d'administration.

### 3. Gestion d'un incident de fuite de données (Data Breach)
- **Réflexe chronologique** :
  1. **Isoler** la machine ou la base de données compromise.
  2. **Notifier** le DPO et la cellule de crise sous 24h.
  3. **Analyser** les logs pour déterminer la portée exacte de la fuite.
  4. **Notifier la CNIL / autorité de contrôle** dans les **72 heures** légales.

---

## ❓ Banque de QCM & Test du Jour (8 Questions)

**Q1 : Dans quel délai maximal une fuite de données personnelles (Data Breach) doit-elle être notifiée à l'autorité de contrôle (CNIL / APD) selon le RGPD ?**
- A) 24 heures
- B) 48 heures
- C) 72 heures
- D) 30 jours

*Réponse : C — L'article 33 du RGPD impose une notification dans un délai maximal de 72 heures après en avoir pris connaissance.*

**Q2 : Quelle est la norme internationale de référence pour la mise en place d'un Système de Management de la Sécurité de l'Information (SMSI) ?**
- A) ISO 9001
- B) ISO/IEC 27001
- C) IEEE 802.11
- D) RFC 1918

*Réponse : B — ISO/IEC 27001 est la norme internationale certifiante pour le SMSI.*

**Q3 : Que signifie le principe de "Privacy by Design" imposé par le RGPD ?**
- A) Concevoir de belles interfaces graphiques pour les formulaires
- B) Intégrer les exigences de sécurité et de protection des données dès la phase de conception d'une application
- C) Cacher l'emplacement des serveurs de bases de données
- D) Désactiver l'accès à Internet pour les employés

*Réponse : B — Privacy by Design exige que la confidentialité et la sécurité soient pensées dès la conception initiale des systèmes.*

**Q4 : Que représentent les 4 étapes du cycle d'amélioration continue PDCA (Roue de Deming) ?**
- A) Plan, Do, Check, Act
- B) Protect, Defend, Control, Assess
- C) Private Data Control Act
- D) Password, Disk, CPU, Access

*Réponse : A — PDCA signifie Planifier (Plan), Déployer (Do), Contrôler/Auditer (Check) et Agir/Corriger (Act).*

**Q5 : Quel outil d'audit open source Linux permet d'effectuer un scan complet du système et d'attribuer un score d'indice de hardening (*Hardening Index*) ?**
- A) `ping`
- B) `Lynis`
- C) `Nginx`
- D) `Wireshark`

*Réponse : B — Lynis est l'outil d'audit de sécurité et de conformité système de référence sous Linux.*

**Q6 : Quelle est la sanction financière maximale encourue par une entreprise en cas de violation grave des règles du RGPD ?**
- A) 10 000 €
- B) 500 000 €
- C) Jusqu'à 20 millions d'euros ou 4% du chiffre d'affaires mondial annuel
- D) La fermeture définitive du site web par la police

*Réponse : C — Les amendes du RGPD peuvent atteindre 20 millions d'euros ou 4% du CA mondial annuel (le montant le plus élevé étant retenu).*

**Q7 : À quoi sert le fichier `/etc/login.defs` sur un système Linux ?**
- A) À stocker les mots de passe des utilisateurs en clair
- B) À définir les paramètres globaux de conformité des comptes (durée de vie maximale des mots de passe, UID min/max, etc.)
- C) À configurer le Wi-Fi
- D) À sauvegarder le journal des connexions SSH

*Réponse : B — `/etc/login.defs` régit la configuration de sécurité par défaut pour la création et la gestion des comptes utilisateurs.*

**Q8 : Quel document légal annexé au règlement intérieur définit les règles d'utilisation acceptables des ressources IT par les salariés d'une entreprise ?**
- A) Le contrat de bail du bâtiment
- B) La Charte Informatique
- C) Le manuel de la carte mère
- D) Le diplôme d'ingénieur

*Réponse : B — La Charte Informatique fixe le cadre d'utilisation légal et sécurisé des outils informatiques par les collaborateurs.*

---

## 📚 Ressources & Références

- **CNIL (Guide du Développeur RGPD)** : https://www.cnil.fr/fr/cnil-innovation-lab/guide-rgpd-du-developpeur
- **ISO/IEC 27001 Information Security Management** : https://www.iso.org/isoiec-27001-information-security.html
- **CIS Benchmarks (Center for Internet Security)** : https://www.cisecurity.org/cis-benchmarks
- **Lynis Official Documentation** : https://cisofy.com/lynis/

---

*Semestre 1 — Socle Système Linux & Administration PARADIS IT Masterclass*
