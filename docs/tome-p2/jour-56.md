# SEMESTRE 2 — Jour 56 (6h) : Protocoles de Résolution & Services Réseau — DNS Avancé

> [!NOTE]
> **Objectif de la journée** : Maîtriser le service critique d'infrastructure qu'est le DNS, savoir configurer une zone avancée et sécuriser les requêtes avec DNSSEC.
> **Compétences visées** : `BIT-04` (A) — Administrer les services réseaux de base, `POL-02` (A) — Appliquer des politiques de sécurité système.

---

## 1) Les Fondations du DNS et les Types d'Enregistrements (1h30)

### 📖 1.1 Narration & Intuition
Imaginez l'annuaire téléphonique mondial. Sans lui, pour appeler n'importe qui, vous devriez mémoriser son numéro à 10 chiffres (l'adresse IP). Le DNS (Domain Name System) fait exactement cela : il traduit des noms compréhensibles par les humains (google.com) en adresses IP (142.250.179.110). Plus encore, c'est aujourd'hui la clé de voûte de la sécurité e-mail (SPF/DKIM/DMARC dépendent tous d'enregistrements DNS textuels). Si le DNS tombe, tout s'arrête.

### 🔍 1.2 Anatomie Technique
Le DNS repose sur une architecture hiérarchique et décentralisée :
- **Serveurs Racines (.)** : Les points de départ absolus.
- **Serveurs TLD (.com, .fr)** : Les gestionnaires des extensions.
- **Serveurs Autoritaires** : Ceux qui connaissent réellement les enregistrements de votre domaine.
Les types d'enregistrements principaux :
- **A / AAAA** : Associe un nom à une IPv4 / IPv6.
- **CNAME** : Un alias vers un autre nom (ex: www vers domaine principal).
- **MX** : Indique les serveurs qui gèrent les e-mails du domaine.
- **PTR** : Le DNS inversé (trouver le nom à partir de l'IP).
- **TXT** : Permet de stocker du texte, très utilisé pour SPF, DKIM, DMARC.

### 🛠️ 1.3 Atelier Pratique Hands-on
```bash
# Interroger un enregistrement A
dig A www.paradis-it.com +short

# Interroger un enregistrement MX
dig MX paradis-it.com

# Tracer complètement le chemin DNS depuis les racines
dig +trace paradis-it.com
```

### 🚑 1.4 Diagnostic & Réflexes Terrain
- **Panne fréquente** : Propagation DNS trop lente.
- **Réflexe** : Vérifier le "TTL" (Time To Live). Si vous prévoyez une migration de serveur, baissez le TTL (ex: 300 secondes) 48h avant la migration. 

---

## 2) Configuration Pratique d'un Serveur BIND9 (1h30)

### 📖 2.1 Narration & Intuition
Vous êtes l'architecte IT de la banque. Vous ne voulez pas que vos serveurs internes soient résolus par un DNS public sur Internet. Vous devez donc héberger votre propre serveur DNS autoritaire pour la zone interne "banque.lan". C'est ici que BIND9 (Berkeley Internet Name Domain) entre en jeu, le logiciel DNS le plus déployé au monde.

### 🔍 2.2 Anatomie Technique
Sous Debian/Ubuntu, BIND9 place ses fichiers dans `/etc/bind/`.
- `named.conf.options` : Options globales (forwarders, sécurité).
- `named.conf.local` : Déclaration de vos zones.
- `db.banque.lan` : Le fichier de zone contenant les enregistrements DNS exacts.

### 🛠️ 2.3 Atelier Pratique Hands-on
```bash
# Installation de BIND9
sudo apt update && sudo apt install bind9 bind9utils bind9-doc dnsutils -y

# Configuration de la zone dans /etc/bind/named.conf.local
sudo bash -c 'cat <<EOF >> /etc/bind/named.conf.local
zone "banque.lan" {
    type master;
    file "/etc/bind/db.banque.lan";
};
EOF'

# Création du fichier de zone
sudo cp /etc/bind/db.local /etc/bind/db.banque.lan
# Éditer le fichier /etc/bind/db.banque.lan pour ajouter :
# @       IN      A       192.168.10.5
# srv-web IN      A       192.168.10.10
# www     IN      CNAME   srv-web

# Vérifier la syntaxe
sudo named-checkconf
sudo named-checkzone banque.lan /etc/bind/db.banque.lan

# Relancer BIND9
sudo systemctl restart bind9
```

### 🚑 2.4 Diagnostic & Réflexes Terrain
- **Message d'erreur** : `rndc: connect failed: 127.0.0.1#953: connection refused`
- **Solution** : Vérifiez le statut du service avec `systemctl status bind9`. Souvent, c'est une faute de frappe (point-virgule manquant) dans `named.conf.local`.

---

## 3) DNSSEC : Sécuriser la Résolution (2h00)

### 📖 3.1 Narration & Intuition
Le DNS a été conçu il y a longtemps, sans sécurité. N'importe qui sur le réseau pouvait usurper une réponse DNS (DNS Spoofing) et rediriger les utilisateurs de `banque.com` vers un faux site pirate. DNSSEC (Domain Name System Security Extensions) ajoute des signatures cryptographiques aux enregistrements DNS. Ainsi, le navigateur peut vérifier que l'IP reçue est bien celle signée par le vrai propriétaire du domaine.

### 🔍 3.2 Anatomie Technique
DNSSEC ne chiffre pas le DNS, il le *signe*.
- **KSK (Key Signing Key)** : Clé qui signe l'autre clé.
- **ZSK (Zone Signing Key)** : Clé qui signe les enregistrements.
- **DS (Delegation Signer)** : Enregistrement placé dans la zone parente (ex: chez le registrar) pour lier cryptographiquement le domaine.

### 🛠️ 3.3 Atelier Pratique Hands-on
```bash
# Activer DNSSEC dans /etc/bind/named.conf.options
# dnssec-validation auto;

# Générer les clés KSK et ZSK (sur le serveur)
dnssec-keygen -a RSASHA256 -b 2048 -n ZONE banque.lan
dnssec-keygen -f KSK -a RSASHA256 -b 4096 -n ZONE banque.lan

# Vous devez ensuite signer la zone avec ces clés
dnssec-signzone -A -3 $(head -c 1000 /dev/random | sha1sum | cut -b 1-16) -N INCREMENT -o banque.lan -t /etc/bind/db.banque.lan
```

### 🚑 3.4 Diagnostic & Réflexes Terrain
- **Panne fréquente** : Plus aucun client n'arrive à résoudre le domaine.
- **Cause** : Les signatures DNSSEC ont expiré (par défaut 30 jours). Il faut implémenter un script de re-signature automatique ou utiliser des outils modernes d'automatisation.

---

## 📚 Nouvelles abréviations rencontrées
- **DNS** : Domain Name System
- **FQDN** : Fully Qualified Domain Name
- **SPF** : Sender Policy Framework
- **DKIM** : DomainKeys Identified Mail
- **DMARC** : Domain-based Message Authentication, Reporting & Conformance
- **DNSSEC** : DNS Security Extensions
- **TTL** : Time To Live

---

## 🏧️ Exercices Pratiques (Preuves de Portfolio)

### Exercice 1 : Déploiement d'une zone et Reverse DNS
- **Consigne** : Configurez BIND9 pour gérer la zone "cyber.local" avec un enregistrement A pour "firewall" (10.0.0.1) et configurez la zone de résolution inverse correspondante.
- **Livrables à produire** : Fichiers `named.conf.local`, `db.cyber.local`, `db.10.0.0` et captures d'écran des tests `dig`.
- **Corrigé détaillé & Guidé** :
```bash
# 1. Configurer named.conf.local
# zone "cyber.local" { type master; file "/etc/bind/db.cyber.local"; };
# zone "0.0.10.in-addr.arpa" { type master; file "/etc/bind/db.10.0.0"; };

# 2. Créer db.cyber.local et y ajouter "firewall IN A 10.0.0.1"
# 3. Créer db.10.0.0 et y ajouter "1 IN PTR firewall.cyber.local."
# 4. named-checkconf && systemctl restart bind9
# 5. Test : dig -x 10.0.0.1 @localhost
```

---

## ❓ Banque de Questions QCM (Évaluation 75% minimum)
1. **Que permet de faire un enregistrement DNS de type CNAME ?**
   A) Associer une adresse IPv6 à un nom
   B) Définir le serveur mail du domaine
   C) Créer un alias vers un autre nom de domaine
   D) Signer cryptographiquement la zone
   **Réponse : C**

2. **Quel fichier de configuration de BIND9 contient généralement la définition des zones locales ?**
   A) /etc/bind/named.conf.options
   B) /etc/bind/named.conf.local
   C) /etc/bind/db.local
   D) /etc/resolv.conf
   **Réponse : B**

3. **Quelle commande permet de vérifier la syntaxe syntaxique du fichier global de BIND9 ?**
   A) bind-test
   B) systemctl verify bind9
   C) named-checkzone
   D) named-checkconf
   **Réponse : D**

4. **Quelle est l'utilité principale de DNSSEC ?**
   A) Chiffrer les requêtes DNS
   B) Cacher l'adresse IP réelle du serveur
   C) Garantir l'intégrité et l'authenticité des réponses DNS
   D) Réduire le temps de latence des requêtes DNS
   **Réponse : C**

5. **Quel enregistrement est utilisé pour vérifier que le serveur d'envoi d'e-mail est autorisé ?**
   A) AAAA
   B) SPF (via TXT)
   C) CNAME
   D) PTR
   **Réponse : B**

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
