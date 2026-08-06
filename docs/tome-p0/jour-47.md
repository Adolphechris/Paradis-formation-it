# SEMESTRE 1 — Jour 47 (6h) : Automation de SecOps avec Ansible

> [!NOTE]
> **Objectif de la journée** : Déployer de manière automatisée, massive et reproductible une configuration de sécurité durcie (CIS) sur tout un parc de serveurs à l'aide d'Ansible.
> **Compétences visées** : `BIT-05` (Niveau Cible: A) — Automatiser le déploiement d'infrastructure, `SEC-03` (Niveau Cible: A) — Appliquer le hardening.

---

## 1) Introduction à l'Infra-as-Code pour la Sécurité (1h30)

### 📖 1.1 Narration & Intuition
Vous savez durcir un serveur à la main (Jour 46). Mais que se passe-t-il si vous avez 500 serveurs ? Vous ne pouvez pas taper `nano /etc/ssh/sshd_config` sur 500 machines. L'automatisation SecOps (Security Operations) vous permet de décrire l'état final sécurisé de votre serveur dans un simple fichier texte. Ansible agit comme un chef d'orchestre : il se connecte à vos 500 serveurs et applique la partition à l'identique, sans fatigue, sans erreur.

### 🔍 1.2 Anatomie Technique
- **L'Inventaire (Inventory)** : Le carnet d'adresses d'Ansible (ex: le fichier `hosts` listant les IP).
- **Le Playbook** : Le livre de recettes écrit en YAML. Il décrit ce qu'Ansible doit accomplir (les rôles et les tâches).
- **Le Rôle** : Un package de tâches réutilisable. Par exemple, un rôle "hardened-ssh".
- **Agentless** : Ansible n'a pas besoin de logiciel pré-installé sur les serveurs cibles, il n'a besoin que de SSH et de Python.

### 🛠️ 1.3 Atelier Pratique Hands-on
```bash
# 1. Installation d'Ansible sur la machine de contrôle
sudo apt update && sudo apt install -y ansible

# 2. Création de l'inventaire local
mkdir ~/ansible-secops && cd ~/ansible-secops
echo -e "[webservers]\nlocalhost ansible_connection=local" > inventory.ini

# 3. Test de connectivité
ansible all -i inventory.ini -m ping
```

### 🚑 1.4 Diagnostic & Réflexes Terrain
- **Symptôme** : "UNREACHABLE! - Failed to connect to the host via ssh."
- **Réflexe** : Vérifiez que la clé SSH de l'utilisateur Ansible est bien présente dans le `authorized_keys` du serveur distant. Testez d'abord la connexion à la main : `ssh user@ip`.

---

## 2) Écriture de Playbooks de Hardening (CIS) (1h30)

### 📖 2.1 Narration & Intuition
Le référentiel CIS (Center for Internet Security) est la bible mondiale de la configuration sécurisée. Écrire un Playbook de Hardening CIS, c'est coder les recommandations de ce livre. Si le livre dit "Les mots de passe vides doivent être refusés", la tâche Ansible s'assurera que la ligne correspondante dans `sshd_config` est bien paramétrée.

### 🔍 2.2 Anatomie Technique
Un Playbook YAML utilise des "Modules". Pour modifier un fichier, le module `lineinfile` est roi. Pour redémarrer un service, on utilise `service` ou `systemd`. Ansible est *idempotent* : si la ligne est déjà sécurisée, Ansible ne fera rien et annoncera un statut "OK".

### 🛠️ 2.3 Atelier Pratique Hands-on
```bash
# 1. Création d'un playbook de durcissement
nano hardening.yml
```
*Contenu du fichier `hardening.yml` :*
```yaml
---
- name: Hardening des serveurs Linux (Base CIS)
  hosts: all
  become: yes # Pour exécuter en sudo

  tasks:
    - name: SecOps - Désactiver l'accès root SSH
      lineinfile:
        path: /etc/ssh/sshd_config
        regexp: '^#?PermitRootLogin'
        line: 'PermitRootLogin no'
        state: present
      notify: Restart SSH

    - name: SecOps - Paramètre kernel pour bloquer l'IP spoofing
      sysctl:
        name: net.ipv4.conf.all.rp_filter
        value: '1'
        state: present
        reload: yes

  handlers:
    - name: Restart SSH
      service:
        name: sshd
        state: restarted
```

```bash
# 2. Exécution du playbook
# (Sera exécuté sur localhost avec mot de passe sudo)
ansible-playbook -i inventory.ini hardening.yml --ask-become-pass
```

### 🚑 2.4 Diagnostic & Réflexes Terrain
- **Symptôme** : Le Playbook plante avec une erreur de parsing YAML.
- **Réflexe** : Le YAML est sensible à l'indentation (les espaces). Ne jamais utiliser la touche TAB. Utilisez 2 espaces pour indenter à chaque niveau.

---

## 3) Déploiement et Vérification d'État (2h00)

### 📖 3.1 Narration & Intuition
Déployer la sécurité, c'est bien. Mais s'assurer qu'elle reste active, c'est mieux. Le SecOps moderne repose sur l'exécution planifiée des Playbooks Ansible. S'ils sont lancés tous les jours, toute modification manuelle frauduleuse sur un serveur sera écrasée et remise à l'état sécurisé le lendemain ("Configuration Drift Remediation").

### 🔍 3.2 Anatomie Technique
- **Mode Check (`--check`)** : Ansible simule l'exécution du playbook. Il vous montre ce qu'il changerait *sans le modifier*. Idéal pour auditer un parc ("Dry Run").
- **Mode Diff (`--diff`)** : Montre exactement quelles lignes de configuration seraient modifiées.

### 🛠️ 3.3 Atelier Pratique Hands-on
```bash
# 1. Simuler (Check) une exécution pour voir ce qui n'est pas conforme
ansible-playbook -i inventory.ini hardening.yml --ask-become-pass --check --diff

# 2. Vous verrez les changements en "jaune" (changed).
# 3. Lancer en réel.
ansible-playbook -i inventory.ini hardening.yml --ask-become-pass

# 4. Relancer en réel. Tout sera en "vert" (ok). Idempotence prouvée !
ansible-playbook -i inventory.ini hardening.yml --ask-become-pass
```

### 🚑 3.4 Diagnostic & Réflexes Terrain
- **Symptôme** : Ansible montre "changed" à chaque exécution du playbook, l'idempotence ne fonctionne pas.
- **Réflexe** : Votre module ou regex est mal écrit. Si `lineinfile` ne trouve pas *exactement* la ligne avec son expression régulière, il l'ajoutera à l'infini au lieu de dire "OK, elle est déjà là".

---

## 🔤 Nouvelles abréviations rencontrées
- **IaC** : Infrastructure as Code (Définition de l'infrastructure par du code).
- **CIS** : Center for Internet Security (Référentiel des normes de sécurité).
- **YAML** : YAML Ain't Markup Language (Format de sérialisation de données lisible par l'humain).

---

## 🏧️ Exercices Pratiques (Preuves de Portfolio)

### Exercice 1 : Ansible et le mot de passe utilisateur
- **Consigne** : Modifiez le playbook `hardening.yml` pour ajouter une tâche qui garantit que le mot de passe vide est interdit (`PermitEmptyPasswords no` dans `sshd_config`). Testez-le en `--check` puis appliquez-le.
- **Livrables à produire** : Le fichier YAML finalisé et la capture du terminal avec un résultat "ok" certifiant l'idempotence.
- **Corrigé détaillé & Guidé** :
  1. Éditez `hardening.yml`.
  2. Ajoutez une tâche sous `tasks:` :
     ```yaml
     - name: Interdire mots de passe vides
       lineinfile:
         path: /etc/ssh/sshd_config
         regexp: '^#?PermitEmptyPasswords'
         line: 'PermitEmptyPasswords no'
       notify: Restart SSH
     ```
  3. Sauvegardez et exécutez `ansible-playbook -i inventory.ini hardening.yml --ask-become-pass`.

---

## ❓ Banque de Questions QCM (Évaluation 75% minimum)

1. Quelle est la principale caractéristique d'Ansible par rapport aux serveurs cibles ?
   - A) Il nécessite un agent lourd (Daemon) préinstallé.
   - B) Il s'exécute exclusivement sous Windows.
   - C) Il est "agentless" et utilise SSH et Python.
   - D) Il requiert une base de données MySQL.
   - **Réponse : C**

2. Qu'est-ce que l'idempotence en automatisation ?
   - A) La capacité à exécuter un script 100 fois en obtenant toujours le même état final désiré.
   - B) Un type d'attaque de déni de service.
   - C) Le processus de chiffrement d'un mot de passe.
   - D) L'incapacité d'Ansible à annuler une action.
   - **Réponse : A**

3. Dans Ansible, quel fichier sert à lister les machines sur lesquelles on veut agir ?
   - A) L'inventaire (Inventory)
   - B) Le Playbook
   - C) Le handler
   - D) Le playbook.yml
   - **Réponse : A**

4. Quel module est le plus utilisé pour modifier une valeur spécifique dans un fichier de configuration ?
   - A) `apt`
   - B) `systemd`
   - C) `ping`
   - D) `lineinfile`
   - **Réponse : D**

5. À quoi servent les "handlers" dans un Playbook Ansible ?
   - A) À télécharger des modules supplémentaires.
   - B) À s'exécuter uniquement s'ils sont notifiés par un changement de tâche (ex: redémarrer un service).
   - C) À remplacer l'inventaire principal.
   - D) À contourner les mots de passe.
   - **Réponse : B**

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
