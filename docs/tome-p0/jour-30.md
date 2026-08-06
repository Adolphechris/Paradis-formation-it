# SEMESTRE 1 — Jour 30 (6h) : Projet Synthétique Semestre 1 (Partie 3)

> [!NOTE]
> **Objectif de la journée** : Assembler toutes les compétences acquises durant ce semestre pour déployer, configurer et sécuriser un serveur d'infrastructure complet (Stockage LVM, Partages sécurisés, Hardening SSH/PAM, Centralisation et Rotation de logs).
> **Compétences visées** : `BIT-01` (A), `BIT-02` (A), `SEC-03` (A), `PRO-01` (A) — Déploiement et sécurisation d'infrastructure.

---

## 1) Architecture du Projet (1h30)

### 📖 1.1 Narration & Intuition
C'est le grand final du semestre. Dans le monde professionnel, on ne configure jamais un seul composant de façon isolée. Un serveur de fichiers (Samba/NFS) doit être sécurisé (Hardening, PAM), son stockage doit être flexible (LVM), et chaque action doit être auditable et historisée (Rsyslog/Logrotate). Vous êtes l'Administrateur Système en chef ; vous devez livrer ce serveur "Prêt à la production" au client.

### 🔍 1.2 Le Cahier des Charges
Le client, l'entreprise "CorpIT", exige le déploiement d'un serveur unique avec le cahier des charges suivant :
1. **Stockage Flex** : Un Volume Logique (LVM) de 5 Go dédié aux données, monté dans `/srv/corpit_data`.
2. **Partage Réseau** : Ce dossier doit être partagé via NFS pour les serveurs Linux internes, et via Samba pour les clients Windows.
3. **Sécurité Base** : Le serveur SSH n'accepte pas de mot de passe ni de root.
4. **Sécurité Avancée** : Les utilisateurs locaux sont bloqués après 3 mauvais mots de passe.
5. **Surveillance** : Les logs critiques d'authentification font l'objet d'un fichier dédié, avec une rotation hebdomadaire.

---

## 2) Atelier Projet : Implémentation Étape par Étape (2h00)

### 🛠️ 2.1 Étape 1 : Stockage LVM
Vous devez simuler un nouveau disque (ou utiliser un fichier loopback), créer un Physical Volume, un Volume Group (`vg_corpit`), et un Logical Volume (`lv_data`). Ensuite, formater en ext4 et configurer le montage persistant dans `/etc/fstab`.

```bash
# (Exemple de démarche attendue, l'étudiant doit exécuter et valider)
# sudo pvcreate /dev/sdb
# sudo vgcreate vg_corpit /dev/sdb
# sudo lvcreate -L 5G -n lv_data vg_corpit
# sudo mkfs.ext4 /dev/vg_corpit/lv_data
# sudo mkdir -p /srv/corpit_data
# Ajouter dans fstab : /dev/vg_corpit/lv_data  /srv/corpit_data  ext4  defaults  0  2
```

### 🛠️ 2.2 Étape 2 : Partages NFS et Samba
Configurer NFS pour exporter `/srv/corpit_data` sur le réseau local (`192.168.1.0/24`), et configurer Samba pour créer un partage "Corpit_Share" pointant vers le même répertoire, accessible à un utilisateur `corpit_user`.

### 🛠️ 2.3 Étape 3 : Hardening SSH et PAM
Désactiver `PermitRootLogin` et `PasswordAuthentication` dans `/etc/ssh/sshd_config`. 
Implémenter `pam_faillock.so` dans `/etc/pam.d/common-auth` (ou équivalent) pour le verrouillage après 3 échecs.

### 🛠️ 2.4 Étape 4 : Logs et Audit
Configurer `/etc/rsyslog.d/corpit.conf` pour rediriger `authpriv.*` (ou équivalent) vers `/var/log/corpit_auth.log`.
Créer `/etc/logrotate.d/corpit_auth` pour effectuer une rotation `weekly`, en gardant 4 archives (4 semaines).

---

## 3) Validation, Recette et Audit (1h30)

### 📖 3.1 Narration & Intuition
Une infrastructure n'est terminée que lorsqu'elle est validée. En milieu professionnel, c'est ce qu'on appelle le VABF (Vérification d'Aptitude au Bon Fonctionnement). Vous devez démontrer, tests à l'appui, que chaque contrainte du cahier des charges est respectée.

### 🚑 3.2 Tests de Recette
- **Test LVM** : `df -h /srv/corpit_data` doit montrer le volume logique de 5Go.
- **Test SSH** : Essayer de se connecter en root avec un mot de passe ; l'accès doit être instantanément rejeté.
- **Test PAM** : Effectuer 3 tentatives locales avec un faux mot de passe ; vérifier via `faillock` (ou via logs) que le compte est verrouillé.
- **Test Logs** : Redémarrer le service sshd, et vérifier que le fichier `/var/log/corpit_auth.log` capture bien l'événement. Lancer `logrotate -f /etc/logrotate.d/corpit_auth` pour prouver la rotation.

---

## 🏧️ Exercices Pratiques (Preuves de Portfolio)

### Exercice 1 : Rapport d'Installation Final
- **Consigne** : Compilez toutes les commandes que vous avez exécutées pour les étapes 1 à 4 dans un seul grand script de déploiement (bash), commenté.
- **Livrables à produire** : Le script de déploiement `deploy_corpit.sh`. Ce livrable est crucial pour votre portfolio, car il démontre l'automatisation (Infrastructure as Code - rudimentaire).
- **Corrigé détaillé & Guidé** : (Extrait du script)
```bash
#!/bin/bash
# DEPLOIEMENT INFRASTRUCTURE CORPIT

echo "1. Configuration du stockage..."
# (Commandes LVM, fstab, mount -a)

echo "2. Hardening SSH..."
sed -i 's/^#PermitRootLogin.*/PermitRootLogin no/' /etc/ssh/sshd_config
sed -i 's/^#PasswordAuthentication.*/PasswordAuthentication no/' /etc/ssh/sshd_config
systemctl restart sshd

echo "3. Configuration Logs..."
echo "authpriv.* /var/log/corpit_auth.log" > /etc/rsyslog.d/corpit.conf
systemctl restart rsyslog

echo "Déploiement terminé. Veuillez valider manuellement."
```

---

## ❓ Banque de Questions QCM (Évaluation 75% minimum)
1. **Dans le cadre de ce projet, pourquoi utiliser LVM pour le stockage des données partagées ?**
   A) LVM chiffre les données automatiquement
   B) LVM permet d'agrandir l'espace disque du partage "à chaud" sans redémarrer le serveur
   C) LVM protège contre les virus Windows
   D) LVM est obligatoire pour NFS
   **Réponse : B**

2. **Lors de la création du fichier dans `/etc/logrotate.d/`, que faut-il faire pour que le service rsyslog sache que le fichier a tourné ?**
   A) Redémarrer la machine
   B) Utiliser une section `postrotate` pour envoyer un signal (HUP) à rsyslog
   C) Mettre l'option `compress`
   D) Supprimer rsyslog
   **Réponse : B**

3. **Quel fichier fstab est correctement formaté pour un montage automatique au boot du LVM projet ?**
   A) `/srv/corpit_data /dev/vg_corpit/lv_data ext4 defaults 0 0`
   B) `/dev/vg_corpit/lv_data /srv/corpit_data ext4 defaults 0 2`
   C) `mount /dev/vg_corpit/lv_data /srv/corpit_data`
   D) `/dev/sdb /srv/corpit_data lvm defaults 0 0`
   **Réponse : B**

4. **Si un client NFS ne peut pas accéder au dossier partagé, quelle est la commande idéale sur le serveur pour vérifier l'exportation en cours ?**
   A) `showmount -e 127.0.0.1` ou `exportfs -v`
   B) `smbstatus`
   C) `df -h`
   D) `systemctl status lvm`
   **Réponse : A**

5. **Quelle est la bonne pratique pour tester des modifications sur `/etc/pam.d/` ?**
   A) Tout supprimer et recommencer à zéro
   B) Garder une session root ouverte sur un autre terminal pendant les modifications
   C) Redémarrer la machine immédiatement après chaque modification
   D) Changer les droits du fichier en 777
   **Réponse : B**
