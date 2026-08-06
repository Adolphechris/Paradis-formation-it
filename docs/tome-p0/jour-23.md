# SEMESTRE 1 — Jour 23 (6h) : Stockage Réseau NFS & Samba

> [!NOTE]
> **Objectif de la journée** : Configurer et exploiter les partages de fichiers à travers un réseau local, que ce soit entre machines Linux (NFS) ou dans un parc hétérogène incluant des machines Windows (Samba), et rendre ces montages persistants au redémarrage.
> **Compétences visées** : `BIT-02` (Niveau Cible: A), `BIT-04` (Niveau Cible: A) — Stockage réseau, partages NFS/Samba et administration système.

---

## 1) NFS : Le Partage de Fichiers Natif Linux (1h30)

### 📖 1.1 Narration & Intuition
Imaginez une entreprise avec 100 serveurs web. Si chaque serveur a sa propre copie des images d'un site, c'est un cauchemar de mise à jour et un gaspillage d'espace. La solution est un serveur de stockage centralisé (NAS). 
Le protocole NFS (Network File System) permet de partager un dossier d'un serveur et de faire croire à une autre machine Linux que ce dossier réseau est un de ses propres disques durs locaux. C'est rapide, léger, et conçu historiquement par et pour le monde UNIX/Linux.

### 🔍 1.2 Anatomie Technique
- **Côté Serveur** : On installe `nfs-kernel-server`. Les dossiers à partager sont listés dans le fichier de configuration `/etc/exports`. Ce fichier définit quel dossier est partagé, à qui (IP), et avec quels droits (ro: Read-Only, rw: Read-Write).
- **Côté Client** : On utilise la commande `mount` standard en spécifiant le type `nfs` et l'adresse du serveur suivie du chemin partagé : `IP_SERVEUR:/chemin/partage`.

### 🛠️ 1.3 Atelier Pratique Hands-on
Nous allons configurer notre propre machine comme serveur NFS et la monter sur nous-mêmes comme si nous étions un client distant.
```bash
# --- Côté Serveur ---
# 1. Installer le paquet NFS
sudo apt update
sudo apt install nfs-kernel-server -y

# 2. Créer le dossier à partager
sudo mkdir -p /var/nfs_partage
sudo chown nobody:nogroup /var/nfs_partage # Simplification des droits d'accès

# 3. Déclarer le partage dans /etc/exports (Autoriser le réseau local 127.0.0.1)
echo "/var/nfs_partage 127.0.0.1(rw,sync,no_subtree_check)" | sudo tee -a /etc/exports

# 4. Appliquer les modifications du fichier exports
sudo exportfs -a
sudo systemctl restart nfs-kernel-server

# --- Côté Client ---
# 5. Installer le client NFS
sudo apt install nfs-common -y

# 6. Créer le point de montage local
mkdir /tmp/nfs_client

# 7. Monter le partage distant
sudo mount -t nfs 127.0.0.1:/var/nfs_partage /tmp/nfs_client

# 8. Tester
sudo touch /tmp/nfs_client/hello_nfs.txt
ls -l /var/nfs_partage/ # Le fichier est bien sur le serveur !
```

### 🚑 1.4 Diagnostic & Réflexes Terrain
- **`mount.nfs: access denied by server`** : L'IP de votre client n'est pas autorisée dans le fichier `/etc/exports` du serveur.
- **La commande mount reste bloquée (timeout)** : Un pare-feu bloque le port NFS (habituellement 2049) entre le client et le serveur.

---

## 2) Samba : Le Pont entre Linux et Windows (1h30)

### 📖 2.1 Narration & Intuition
NFS est parfait entre Linux, mais dans le monde de l'entreprise, les postes de travail sont souvent sous Windows. Windows ne comprend pas NFS nativement, il utilise son propre protocole : SMB/CIFS.
Samba est une suite logicielle géniale qui permet à un serveur Linux de "parler" le protocole SMB. Ainsi, votre serveur Linux apparaît dans les "Favoris Réseau" d'une machine Windows exactement comme si c'était un autre serveur Windows.

### 🔍 2.2 Anatomie Technique
Le cœur de Samba est le démon `smbd`.
Toute la configuration réside dans un seul gros fichier : `/etc/samba/smb.conf`. On y définit le groupe de travail ("Workgroup"), les paramètres globaux, et on y ajoute des blocs `[nom_du_partage]` pour chaque dossier à exposer.
Contrairement à NFS qui fait confiance aux IP, Samba gère son propre annuaire d'utilisateurs. Il faut convertir un utilisateur Linux en utilisateur Samba via la commande `smbpasswd`.

### 🛠️ 2.3 Atelier Pratique Hands-on
Mettons en place un partage Samba accessible.
```bash
# 1. Installer Samba
sudo apt install samba smbclient -y

# 2. Créer le dossier à partager
sudo mkdir -p /srv/samba_share
sudo chmod 777 /srv/samba_share # (Pour l'atelier, accès total)

# 3. Ajouter la définition du partage à la fin de smb.conf
sudo bash -c 'cat <<EOF >> /etc/samba/smb.conf
[DocsEntreprise]
   path = /srv/samba_share
   browsable = yes
   read only = no
   guest ok = no
EOF'

# 4. Créer un mot de passe Samba pour l'utilisateur courant
# (Tapez un mot de passe quand demandé)
sudo smbpasswd -a $(whoami)

# 5. Redémarrer le service Samba
sudo systemctl restart smbd

# 6. Tester en local avec le client SMB (comme un client FTP)
# Remplacer "votre_utilisateur" par le résultat de "whoami"
smbclient //127.0.0.1/DocsEntreprise -U $(whoami)
# Dans le prompt smb: \> tapez "ls" pour lister, puis "exit"
```

### 🚑 2.4 Diagnostic & Réflexes Terrain
- **"Tree connect failed: NT_STATUS_ACCESS_DENIED"** : L'utilisateur n'a pas été ajouté à la base Samba avec `smbpasswd`, ou les permissions système (chmod) du dossier `/srv/samba_share` empêchent l'accès à l'utilisateur Linux sous-jacent.

---

## 3) Persistance et Montage Automatique (fstab) (2h00)

### 📖 3.1 Narration & Intuition
Vous savez monter une partition locale, un partage NFS et vous connaissez Samba. Mais tout cela disparaît quand vous redémarrez le serveur. C'est inacceptable en production. 
Il faut demander au système d'attacher automatiquement ces volumes au démarrage. C'est le rôle du fichier `/etc/fstab` (File System TABle). C'est le registre officiel des disques et partages à monter dès le boot.

### 🔍 3.2 Anatomie Technique
Le fichier `/etc/fstab` est lu par le système au démarrage. Chaque ligne contient 6 colonnes séparées par des espaces ou tabulations :
1. **Device/Source** : `/dev/sdb1` ou `192.168.1.10:/partage`
2. **Point de montage** : `/mnt/data`
3. **Type de système de fichiers** : `ext4`, `xfs`, `nfs`, `cifs` (pour Samba), `swap`
4. **Options** : `defaults`, `rw`, `_netdev` (attend que le réseau soit prêt)
5. **Dump** : Outil de sauvegarde (généralement `0`)
6. **Pass** : Ordre de vérification fsck (0 = désactivé, 1 = racine, 2 = autres)

### 🛠️ 3.3 Atelier Pratique Hands-on
Ajoutons notre montage NFS au `fstab` pour le rendre persistant.
```bash
# 1. Sauvegarder le fstab original par prudence
sudo cp /etc/fstab /etc/fstab.backup

# 2. Ajouter l'entrée NFS (nous utilisons le partage créé au Module 1)
# On utilise _netdev pour dire à Linux d'attendre l'initialisation du réseau
echo "127.0.0.1:/var/nfs_partage /tmp/nfs_client nfs defaults,_netdev 0 0" | sudo tee -a /etc/fstab

# 3. Démonter le partage existant pour tester proprement
sudo umount /tmp/nfs_client

# 4. MAGIE : Forcer le système à lire fstab et tout monter
sudo mount -a

# 5. Vérifier que c'est bien monté
df -h | grep nfs
```

### 🚑 3.4 Diagnostic & Réflexes Terrain
- **Le serveur refuse de démarrer (Emergency Mode)** : C'est le drame classique d'une faute de frappe dans le `/etc/fstab`. Si le système ne trouve pas un disque vital listé dans fstab, il panique. Il faut entrer le mot de passe root en mode urgence, ouvrir `/etc/fstab` avec `nano` et commenter la ligne fautive avec `#`.

---

## 📚 Nouvelles Abréviations Rencontrées
- **NFS** : Network File System
- **SMB** : Server Message Block (protocole sous-jacent à Samba)
- **CIFS** : Common Internet File System (ancienne appellation Microsoft pour SMB)
- **NAS** : Network Attached Storage

---

## 🏧️ Exercices Pratiques (Preuves de Portfolio)

### Exercice 1 : Samba Permanent
- **Consigne** : Votre machine héberge le partage Samba "DocsEntreprise". Montez ce partage *sur votre propre machine* en utilisant CIFS de manière persistante via `/etc/fstab` dans le dossier `/mnt/partage_windows`.
- **Livrables à produire** : La ligne exacte ajoutée dans `/etc/fstab` et le résultat de `mount -a`.
- **Corrigé détaillé & Guidé** :
```bash
# Installation du paquet nécessaire pour monter du SMB/CIFS
sudo apt install cifs-utils -y

# Création du point de montage
sudo mkdir -p /mnt/partage_windows

# Ajout dans fstab (utiliser les identifiants en option)
USER=$(whoami)
echo "//127.0.0.1/DocsEntreprise /mnt/partage_windows cifs username=$USER,password=votremotdepassesamba,uid=$USER,_netdev 0 0" | sudo tee -a /etc/fstab

# Montage depuis fstab
sudo mount -a

# Vérification
df -h | grep cifs
```

---

## ❓ Banque de Questions QCM (Évaluation 75% minimum)
1. **Quel est le protocole utilisé nativement par Windows pour partager des fichiers, simulé par Samba sous Linux ?**
   A) NFS
   B) FTP
   C) SMB/CIFS
   D) SSH
   *Réponse : C*

2. **Dans quel fichier un serveur NFS déclare-t-il les dossiers qu'il autorise à partager ?**
   A) `/etc/samba/smb.conf`
   B) `/etc/exports`
   C) `/etc/fstab`
   D) `/etc/nfs.conf`
   *Réponse : B*

3. **Que fait la commande `sudo mount -a` ?**
   A) Elle monte tous les systèmes de fichiers définis dans `/etc/fstab`
   B) Elle démonte tous les disques (unmount all)
   C) Elle affiche l'espace disque (all)
   D) Elle monte tous les périphériques USB connectés
   *Réponse : A*

4. **Quelle option critique faut-il ajouter dans `/etc/fstab` pour un montage réseau afin d'éviter que le système ne bloque au démarrage si le réseau n'est pas encore prêt ?**
   A) `rw`
   B) `auto`
   C) `_netdev`
   D) `network_wait`
   *Réponse : C*

5. **Comment ajoute-t-on un utilisateur Linux à la base de données Samba pour qu'il puisse se connecter à un partage ?**
   A) `useradd`
   B) `passwd`
   C) `smbpasswd -a`
   D) On édite manuellement le fichier `/etc/shadow`
   *Réponse : C*
