# TOME P2 — Réseaux & Télécoms — Jour 89 (6h) : Audit de Sécurité, Conformité Réglementaire (ISO 27001 & PCI-DSS) & Hardening CIS Benchmarks

> [!NOTE]
> **Objectif du jour :** Maîtriser le processus d'audit de sécurité des systèmes d'information, la mise en conformité réglementaire selon les normes internationales (ISO/IEC 27001, PCI-DSS pour les données bancaires) et l'application automatisée des guides de durcissement CIS Benchmarks.
>
> **Compétences visées :** `POL-01` (A) — Gouvernance & Audit de Sécurité | `SEC-03` (A) — Conformité & Hardening CIS

---

## 1) Module — Normes Internationales : ISO 27001 & PCI-DSS (2h)

### 📖 Narration/Intuition

La sécurité informatique ne s'arrête pas à la technique : elle s'inscrit dans un cadre de **gouvernance, gestion des risques et conformité**.

- **ISO/IEC 27001** est la norme internationale qui définit les exigences pour mettre en place un **Système de Management de la Sécurité de l'Information (SMSI)**.
- **PCI-DSS (Payment Card Industry Data Security Standard)** est la norme de sécurité obligatoire pour toute institution financière (comme la BCC) ou entreprise qui stocke, traite ou transmet des données de cartes bancaires.

### 🔍 Anatomie Technique

**Les 12 Exigences Majeures de la Norme PCI-DSS (v4.0) :**

```
Construire et maintenir un réseau et des systèmes sécurisés :
  1. Installer et maintenir des contrôles de sécurité réseau (Pare-feux / NGFW).
  2. Appliquer des configurations sécurisées sur tous les composants (Pas de mots de passe par défaut).

Protéger les données de cartes bancaires :
  3. Protéger les données de cartes stockées (Chiffrement AES-256 / Troncature PAN).
  4. Chiffrer la transmission des données de cartes sur les réseaux publics (TLS 1.3).

Maintenir un programme de gestion des vulnérabilités :
  5. Protéger tous les systèmes contre les logiciels malveillants (Antivirus / EDR).
  6. Développer et maintenir des systèmes et logiciels sécurisés (Patch Management / DevSecOps).

Mettre en œuvre des mesures de contrôle d'accès stricts :
  7. Restreindre l'accès aux données de cartes selon le besoin d'en connaître (Need-to-Know).
  8. Identifier les utilisateurs et authentifier l'accès aux composants (MFA / Unique User IDs).
  9. Restreindre l'accès physique aux données de cartes (Sécurité des Datacenters).

Surveiller et tester régulièrement les réseaux :
  10. Enregistrer et surveiller tous les accès aux ressources réseau et données (SIEM / Centralized Logging).
  11. Tester régulièrement la sécurité des systèmes et réseaux (Scans trimestriels & Pentests annuels).

Maintenir une politique de sécurité de l'information :
  12. Soutenir la sécurité de l'information avec des politiques et des programmes organisationnels.
```

---

## 2) Module — CIS Benchmarks : Application Automatisée de Recommandations (2h)

### 📖 Narration/Intuition

Les **CIS Benchmarks** (édités par le Center for Internet Security) sont des guides de durcissement consensus rédigés par des experts mondiaux pour chaque système d'exploitation et logiciel (Ubuntu Linux, PostgreSQL, Docker, Nginx, AWS). Ils fournissent des listes de contrôle ultra-précises avec le niveau d'impact (Level 1 pour un équilibre sécurité/usabilité, Level 2 pour un environnement bancaire hautement sécurisé).

### 🔍 Anatomie Technique

**Script Ansible de durcissement conforme CIS Benchmark Ubuntu Level 2 (`cis_hardening.yml`) :**

```yaml
---
- name: "Application du Durcissement CIS Benchmark Level 2 — Ubuntu 22.04"
  hosts: all
  become: yes
  tasks:
    # CIS 1.1.1.1 — Désactiver les systèmes de fichiers inutilisés
    - name: Désactiver le module noyau cramfs
      kernel_blacklist:
        name: cramfs
        state: present

    - name: Désactiver le module noyau freevxfs
      kernel_blacklist:
        name: freevxfs
        state: present

    # CIS 1.4.1 — Mot de passe GRUB sécurisé
    - name: Vérifier que le chargeur de démarrage GRUB est protégé
      file:
        path: /boot/grub/grub.cfg
        owner: root
        group: root
        mode: '0400'

    # CIS 5.2.2 — Désactiver le login Root direct en SSH
    - name: Interdire le login Root via SSH
      lineinfile:
        path: /etc/ssh/sshd_config
        regexp: '^#?PermitRootLogin'
        line: 'PermitRootLogin no'
        state: present
      notify: Restart SSH

    # CIS 5.2.11 — Définir les ciphers et MACs autorisés en SSH
    - name: Appliquer les ciphers SSH recommandés par CIS
      blockinfile:
        path: /etc/ssh/sshd_config
        block: |
          Ciphers chacha20-poly1305@openssh.com,aes256-gcm@openssh.com,aes128-gcm@openssh.com
          MACs hmac-sha2-512-etm@openssh.com,hmac-sha2-256-etm@openssh.com
          KexAlgorithms curve25519-sha256,curve25519-sha256@libssh.org,diffie-hellman-group16-sha512
      notify: Restart SSH

    # CIS 5.4.1 — Expiration et complexité des mots de passe (PAM)
    - name: Définir la durée maximale de validité des mots de passe (90 jours)
      lineinfile:
        path: /etc/login.defs
        regexp: '^PASS_MAX_DAYS'
        line: 'PASS_MAX_DAYS 90'

  handlers:
    - name: Restart SSH
      service:
        name: sshd
        state: restarted
```

---

## 3) Module — Audit de Conformité avec OpenSCAP / SCAP Workbench (2h)

### 📖 Narration/Intuition

Pour émettre un certificat de conformité automatique ou un rapport d'audit exécutif, on utilise la suite **OpenSCAP**. Elle prend en entrée des profils SCAP officiels (XCCDF) et exécute les tests sur le serveur pour générer un rapport HTML complet listant chaque règle CIS validée ou échouée.

### 🔍 Anatomie Technique

**Exécution d'un audit de conformité SCAP et génération du rapport :**

```bash
# 1. Installer la suite OpenSCAP et les profils de sécurité officiels
sudo apt update && sudo apt install -y openscap-utils ssg-debderived ssg-base

# 2. Lister les profils de conformité disponibles pour Ubuntu/Debian
oscap info /usr/share/xml/scap/ssg/content/ssg-ubuntu2204-ds.xml

# 3. Exécuter un audit complet par rapport au profil CIS Level 2 Workstation/Server
sudo oscap xccdf eval \
  --profile xccdf_org.ssgproject.content_profile_cis_level2_server \
  --results /tmp/rapport-scap-resultats.xml \
  --report /var/www/html/rapport-conformite-cis.html \
  /usr/share/xml/scap/ssg/content/ssg-ubuntu2204-ds.xml

# 4. (Optionnel) Générer automatiquement un script de correction (Remediation Script)
sudo oscap xccdf generate fix \
  --profile xccdf_org.ssgproject.content_profile_cis_level2_server \
  /tmp/rapport-scap-resultats.xml > /tmp/corriger_conformite.sh

echo "✅ Audit SCAP terminé. Rapport disponible sur : http://localhost/rapport-conformite-cis.html"
```

---

## 🏅 Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **SMSI** | Système de Management de la Sécurité de l'Information (ISMS en anglais) |
| **PCI-DSS** | Payment Card Industry Data Security Standard — Norme de sécurité des cartes bancaires |
| **CIS** | Center for Internet Security — Éditeur des guides de durcissement de référence |
| **XCCDF** | Extensible Configuration Checklist Description Format — Format XML des règles SCAP |
| **PAN** | Primary Account Number — Numéro principal à 16 chiffres de la carte bancaire |

---

## 🏋️ Exercices & Corrigés

**Exercice 1 :** Quelle est l'exigence fondamentale de la norme PCI-DSS concernant le stockage du numéro de carte bancaire (PAN - Primary Account Number) ?

**Corrigé :** La norme PCI-DSS exige que le numéro de carte (PAN) soit rendu illisible partout où il est stocké (base de données, logs, sauvegardes). Cela doit être réalisé par **chiffrement fort** (ex: AES-256 avec gestion stricte des clés), hachage irréversible (hash avec sel), ou par **troncature** (ne conserver au maximum que les 6 premiers et 4 derniers chiffres : 1234 56XX XXXX 7890). Les données d'authentification critiques comme le code CVV/CVC ne doivent **JAMAIS** être conservées après l'autorisation de paiement.

**Exercice 2 :** Pourquoi est-il préférable d'utiliser un outil standardisé comme OpenSCAP plutôt que des vérifications manuelles lors d'un audit de conformité CIS Benchmark ?

**Corrigé :** OpenSCAP utilise le standard international SCAP (XCCDF/OVAL), ce qui garantit des vérifications 100% répétables, objectives et non sujettes aux erreurs humaines. Il permet d'auditer des centaines de serveurs en quelques secondes, génère un rapport HTML opposable aux auditeurs certifiés et peut même produire automatiquement des scripts de remédiation (Bash ou Ansible) pour corriger les écarts de conformité détectés.

---

## ❓ Banque de Questions & Test du Jour

**Q1 :** Quelle norme internationale définit les exigences relatives au Système de Management de la Sécurité de l'Information (SMSI) ?
- A) ISO/IEC 27001
- B) ISO 9001
- C) RFC 1918
- D) IEEE 802.3

**Réponse : A**

**Q2 :** Quelle donnée de carte bancaire la norme PCI-DSS interdit-elle STRICTEMENT de stocker après l'autorisation de la transaction, même de manière chiffrée ?
- A) Le nom du porteur de la carte
- B) Le code de vérification cryptographique (CVV / CVC) imprimé au dos de la carte
- C) La date d'expiration
- D) L'adresse IP du client

**Réponse : B**

**Q3 :** Les guides de durcissement du CIS (Center for Internet Security) définissent deux niveaux. Que caractérise le Niveau 2 (Level 2) ?
- A) Un niveau de base pour ordinateurs de bureau domestiques
- B) Un niveau de durcissement élevé réservé aux environnements critiques (ex: bancaires), privilégiant la sécurité maximale même si cela peut limiter certaines fonctionnalités
- C) Un profil pour téléphones mobiles uniquement
- D) Une licence payante

**Réponse : B**

**Q4 :** Quel format standard basé sur XML est utilisé par OpenSCAP pour structurer les règles et listes de contrôle de conformité ?
- A) JSON
- B) XCCDF / OVAL
- C) YAML
- D) HTML5

**Réponse : B**

**Q5 :** Dans la gestion des accès selon PCI-DSS (Exigence 7), quel principe d'attribution des privilèges doit être strictement appliqué ?
- A) Accès total pour tous les employés du département IT
- B) Principe du moindre privilège / Besoin d'en connaître (Need-to-Know)
- C) Attribution des accès basée uniquement sur l'ancienneté
- D) Partage d'un compte Administrateur unique pour toute l'équipe

**Réponse : B**

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
