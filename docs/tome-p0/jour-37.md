# TOME P0 — Socle Universel — Jour 37 (6h) : Introduction à la Cybersécurité & Paysage des Menaces

> [!NOTE]
> **Objectif du jour :** Comprendre le paysage global de la cybersécurité : les principes fondamentaux (triptyque CIA), les types d'acteurs malveillants, les vecteurs d'attaque courants, et la distinction essentielle entre vulnérabilité, exploit et attaque. Poser les fondations conceptuelles du Master Cybersécurité.
>
> **Compétences visées :** `SEC-01` (A) — Fondamentaux cybersécurité et paysage des menaces

---

## 1) Module — Le Triptyque CIA & Principes Fondamentaux (2h)

### 📖 Narration/Intuition

La cybersécurité repose sur trois piliers indissociables, connus sous l'acronyme **CIA** — pas la Central Intelligence Agency américaine, mais **Confidentialité, Intégrité, Disponibilité**. Toute attaque informatique vise à compromettre au moins l'un de ces trois piliers.

En tant que futur professionnel de la sécurité à la BCC, votre mission est de garantir simultanément ces trois propriétés pour tous les systèmes critiques de l'organisation.

### 🔍 Anatomie Technique

**Le Triptyque CIA :**

```
╔══════════════════════════════════════════════════════════════╗
║              LA TRIADE CIA EN CYBERSÉCURITÉ                  ║
╠══════════════╦══════════════╦═══════════════════════════════╣
║CONFIDENTIALITÉ║  INTÉGRITÉ   ║      DISPONIBILITÉ            ║
║(Confidential.)║ (Integrity)  ║     (Availability)           ║
╠══════════════╬══════════════╬═══════════════════════════════╣
║Les données   ║Les données   ║Les systèmes et données        ║
║ne sont       ║sont exactes  ║sont accessibles quand         ║
║accessibles   ║et n'ont pas  ║les utilisateurs               ║
║qu'aux        ║été altérées  ║légitimes en ont besoin        ║
║personnes     ║sans          ║                               ║
║autorisées    ║autorisation  ║                               ║
╠══════════════╬══════════════╬═══════════════════════════════╣
║Exemples      ║Exemples      ║Exemples d'attaques :          ║
║d'attaques :  ║d'attaques :  ║                               ║
║• Fuite de    ║• Altération  ║• DDoS (Distributed Denial     ║
║  données     ║  de logs     ║  of Service)                  ║
║• Écoute      ║• Injection   ║• Ransomware (chiffrement      ║
║  réseau MITM ║  de commandes║  des données)                 ║
║• Vol de      ║• Manipulation║• Panne matérielle             ║
║  credentials ║  de données  ║  (si pas de redondance)       ║
╚══════════════╩══════════════╩═══════════════════════════════╝
```

**Propriétés complémentaires :**

| Propriété | Définition | Exemple |
|:---:|:---|:---|
| **Authentification** | Vérifier l'identité d'un utilisateur | Mot de passe, biométrie, certificat |
| **Autorisation** | Vérifier les droits d'accès | RBAC, ACL, sudo |
| **Non-répudiation** | Impossibilité de nier une action | Signature numérique, logs d'audit |
| **Traçabilité (Accountability)** | Chaque action est attribuée à un utilisateur | Logs SIEM, journaux d'événements |

**Taxonomie des actifs à protéger :**

```
Actifs informationnels (Information Assets)
├── Données (Data)
│   ├── Données en transit (in transit)     → Chiffrement TLS/VPN
│   ├── Données au repos (at rest)          → Chiffrement AES, FDE
│   └── Données en cours de traitement      → Mémoire sécurisée
├── Systèmes (Systems)
│   ├── Serveurs, postes de travail
│   ├── Applications, bases de données
│   └── Infrastructure réseau
└── Personnes (People)
    ├── Employés — vecteur d'attaque n°1
    ├── Administrateurs — comptes privilégiés
    └── Clients — données personnelles RGPD
```

---

## 2) Module — Acteurs Malveillants & Vecteurs d'Attaque (2h)

### 📖 Narration/Intuition

Comprendre QUI attaque et COMMENT est essentiel pour construire des défenses adaptées. La sécurité est un jeu d'adversaires : chaque défense que vous construisez, un attaquant cherche à la contourner. Connaître son adversaire — ses motivations, ses capacités, ses méthodes — vous permet d'anticiper ses mouvements.

### 🔍 Anatomie Technique

**Classification des acteurs malveillants :**

```
╔════════════════════════════════════════════════════════════════╗
║              PAYSAGE DES MENACES                               ║
╠══════════════╦══════════════╦══════════════╦══════════════════╣
║    ACTEUR    ║ MOTIVATION   ║  CAPACITÉS   ║    EXEMPLES      ║
╠══════════════╬══════════════╬══════════════╬══════════════════╣
║Script Kiddie ║Notoriété,    ║Faibles —     ║Attaques DDoS     ║
║(Lamer)       ║curiosité     ║utilise outils║avec LOIC,        ║
║              ║              ║existants     ║défacement web    ║
╠══════════════╬══════════════╬══════════════╬══════════════════╣
║Cybercriminel ║Gain financier║Moyennes à    ║Ransomware,       ║
║(Cracker)     ║              ║élevées       ║banking trojans   ║
╠══════════════╬══════════════╬══════════════╬══════════════════╣
║Hacktiviste   ║Idéologie,    ║Variables     ║Anonymous,        ║
║              ║message       ║              ║attaques DDoS     ║
╠══════════════╬══════════════╬══════════════╬══════════════════╣
║Insider       ║Rancune,      ║Très élevées  ║Employé mécontent ║
║(menace       ║corruption,   ║(accès        ║qui exfiltre      ║
║interne)      ║espionnage    ║légitimes)    ║des données       ║
╠══════════════╬══════════════╬══════════════╬══════════════════╣
║APT           ║Espionnage,   ║Très élevées  ║Lazarus Group,    ║
║(État-Nation) ║sabotage,     ║(ressources   ║APT28, APT41      ║
║              ║géopolitique  ║illimitées)   ║(Fancy Bear)      ║
╚══════════════╩══════════════╩══════════════╩══════════════════╝
```

**Les vecteurs d'attaque courants :**

**1. Phishing & Ingénierie Sociale (Social Engineering) :**

```
Phishing (hameçonnage)
├── Email Phishing : email frauduleux imitant une institution légitime
├── Spear Phishing : phishing ciblé (victime spécifique, personnalisé)
├── Whaling : phishing ciblant les dirigeants (DG, CFO, CISO)
├── Smishing : phishing par SMS (SMS + Phishing)
├── Vishing : phishing par appel vocal (Voice + Phishing)
└── Clone Phishing : copie exacte d'un email légitime avec lien malveillant

Techniques d'ingénierie sociale :
├── Pretexting : se faire passer pour quelqu'un d'autre (faux technicien IT)
├── Baiting : laisser une clé USB infectée dans un parking d'entreprise
├── Tailgating/Piggybacking : entrer dans les locaux derrière quelqu'un
└── Quid Pro Quo : offrir un service contre des informations (faux support IT)
```

**2. Attaques réseau :**

```bash
# MITM — Man-in-The-Middle (Homme du Milieu)
# L'attaquant se positionne entre la victime et le serveur
# et intercepte/modifie les communications

Victime ←───→ Attaquant ←───→ Serveur
              (intercepte et
               peut modifier)

# Techniques MITM :
# - ARP Spoofing/Poisoning : falsification de la table ARP
# - DNS Spoofing : réponses DNS falsifiées
# - SSL Stripping : rétrogradation HTTPS → HTTP
# - Rogue Wi-Fi : point d'accès Wi-Fi malveillant imitant un AP légitime

# Contre-mesures :
# - HTTPS avec HSTS (HTTP Strict Transport Security)
# - Certificats SSL/TLS valides + pinning de certificat
# - VPN sur les réseaux publics
```

**3. Brute Force & Attaques sur les mots de passe :**

```python
# Types d'attaques sur les mots de passe

"""
1. Brute Force : essayer toutes les combinaisons possibles
   - Très lent, mais exhaustif
   - Ex: tous les mots de 8 caractères (26^8 = 208 milliards de combinaisons)

2. Dictionary Attack (Attaque par dictionnaire) :
   - Utilise une liste de mots de passe communs (rockyou.txt = 14M mots de passe)
   - Rapide sur les mots de passe faibles

3. Rainbow Table : table précalculée de hashs
   - Très rapide si le hash n'est pas salé (salted)
   - Contré par le salt (valeur aléatoire ajoutée avant le hachage)

4. Credential Stuffing :
   - Utilise des paires (email, mot de passe) volées dans des fuites
   - Exploite la réutilisation des mots de passe

5. Password Spraying :
   - Essayer UN mot de passe commun sur TOUS les comptes
   - Évite le verrouillage de compte (max tentatives par compte)
"""

# Contre-mesures :
# - MFA (Multi-Factor Authentication) — rend le brute force inutile
# - Verrouillage de compte (account lockout) après N tentatives
# - Mots de passe longs et complexes (passphrase)
# - Hachage sécurisé (bcrypt, Argon2, scrypt) avec salt
# - Surveillance des tentatives de connexion (SIEM)
```

**4. Exploitation de vulnérabilités :**

```
Vulnérabilité → Exploit → Attaque

Vulnérabilité (Vulnerability) :
  Faille dans un système — ex: buffer overflow dans nginx 1.2.3

Exploit :
  Code/technique qui exploite la vulnérabilité
  — ex: code C qui déclenche le buffer overflow

Attaque (Attack) :
  Utilisation de l'exploit contre un système cible
  — ex: envoi du payload au serveur nginx vulnérable

CVE (Common Vulnerabilities and Exposures) :
  Base de données publique des vulnérabilités connues
  Format : CVE-ANNÉE-NUMÉRO (ex: CVE-2021-44228 = Log4Shell)

0-Day (Zero-Day) :
  Vulnérabilité inconnue du vendeur → pas de patch disponible
  Très valorisée sur les marchés noirs
```

---

## 3) Module — Modèle de Menace & Défense en Profondeur (2h)

### 📖 Narration/Intuition

La **modélisation des menaces** (Threat Modeling) est l'approche structurée qui permet d'identifier QUOI protéger, CONTRE QUI, et avec quelles priorités. La **défense en profondeur** (Defense in Depth) est le principe selon lequel aucune défense unique n'est suffisante — il faut plusieurs couches de sécurité.

### 🔍 Anatomie Technique

**Cadre STRIDE pour la modélisation des menaces :**

| Lettre | Menace | Violation CIA | Contre-mesure |
|:---:|:---|:---:|:---|
| **S** | Spoofing (usurpation d'identité) | Authentification | MFA, certificats |
| **T** | Tampering (altération) | Intégrité | HMAC, signatures numériques |
| **R** | Repudiation (non-traçabilité) | Non-répudiation | Logs d'audit, SIEM |
| **I** | Information Disclosure (divulgation) | Confidentialité | Chiffrement, ACL |
| **D** | Denial of Service (déni de service) | Disponibilité | Rate limiting, CDN |
| **E** | Elevation of Privilege (escalade) | Autorisation | PoLP, RBAC |

**Défense en Profondeur — les couches de sécurité :**

```
Couche 1 — Périmètre Physique
    └── Contrôle d'accès physique, caméras, badges

Couche 2 — Périmètre Réseau
    └── Firewall, IDS/IPS, DMZ, VLAN, VPN

Couche 3 — Système d'Exploitation
    └── Hardening, patches, SELinux/AppArmor

Couche 4 — Application
    └── WAF (Web Application Firewall), OWASP Top 10

Couche 5 — Données
    └── Chiffrement AES-256, DLP, classification des données

Couche 6 — Utilisateurs
    └── Formation, MFA, gestion des identités (IAM)

Couche 7 — Surveillance & Réponse
    └── SIEM, SOC, plan de réponse à incident (IRP)
```

**Cyber Kill Chain — les phases d'une attaque :**

```
1. Reconnaissance (Recon)
   └── Collecte d'informations sur la cible (OSINT, scan réseau)

2. Weaponization (Armement)
   └── Création du payload (malware, exploit)

3. Delivery (Livraison)
   └── Envoi du payload (email phishing, site web, USB)

4. Exploitation
   └── Exécution du payload — exploitation de la vulnérabilité

5. Installation
   └── Persistance (backdoor, rootkit, startup script)

6. Command & Control (C2 / C&C)
   └── Communication avec le serveur de l'attaquant

7. Actions on Objectives
   └── Objectif final : exfiltration, chiffrement, sabotage
```

---

## 🏅 Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **CIA** | Confidentiality, Integrity, Availability — la triade de la cybersécurité |
| **APT** | Advanced Persistent Threat — menace avancée persistante (groupe étatique) |
| **MITM** | Man-in-The-Middle — attaque de l'homme du milieu |
| **CVE** | Common Vulnerabilities and Exposures — base des vulnérabilités connues |
| **DDoS** | Distributed Denial of Service — déni de service distribué |
| **SIEM** | Security Information and Event Management — gestion centralisée des événements de sécurité |
| **SOC** | Security Operations Center — centre opérationnel de sécurité |
| **IRP** | Incident Response Plan — plan de réponse à incident |
| **OSINT** | Open Source Intelligence — renseignement en sources ouvertes |
| **C2/C&C** | Command and Control — infrastructure de contrôle des malwares |
| **IoC** | Indicator of Compromise — indicateur de compromission |
| **TTPs** | Tactics, Techniques and Procedures — méthodes d'un acteur malveillant |

---

## 🏋️ Exercices & Corrigés

**Exercice 1 :** Classez ces incidents selon les piliers CIA compromis :
1. Un employé de la BCC envoie des relevés clients à son email personnel
2. Un attaquant modifie les logs système pour effacer ses traces
3. Un ransomware chiffre tous les fichiers et les serveurs de production

**Corrigé :**
1. **Confidentialité** — données accessibles à une personne non autorisée (externe)
2. **Intégrité** — les données (logs) ont été altérées
3. **Disponibilité** — les systèmes et données sont inaccessibles

**Exercice 2 :** Appliquez STRIDE à un système d'authentification web de la BCC.

**Corrigé :**
- **S**poofing : un attaquant usurpe l'identité d'un employé → MFA obligatoire
- **T**ampering : modification des tokens de session → HMAC sur les JWT
- **R**epudiation : nier avoir accédé aux données → logs d'audit non modifiables
- **I**nformation Disclosure : fuite des mots de passe → hachage bcrypt + salt
- **D**enial of Service : bloquer le portail de connexion → rate limiting, CAPTCHA
- **E**levation of Privilege : accès admin depuis un compte normal → RBAC strict, PoLP

---

## ❓ Banque de Questions & Test du Jour

**Q1 :** Un ransomware qui chiffre tous vos fichiers et les rend inaccessibles compromet principalement quel pilier CIA ?
- A) Confidentialité
- B) Intégrité
- C) Disponibilité
- D) Authentification

**Réponse : C** — Les fichiers existent mais sont inaccessibles → Disponibilité compromise.

**Q2 :** Un attaquant APT (Advanced Persistent Threat) se distingue des autres par :
- A) L'utilisation exclusive de phishing
- B) Ses ressources importantes, sa sophistication et sa persistence sur le long terme (souvent état-nation)
- C) Son objectif uniquement financier
- D) L'absence de traces dans les logs

**Réponse : B**

**Q3 :** Le Password Spraying consiste à :
- A) Essayer tous les mots de passe possibles sur un compte
- B) Chiffrer les mots de passe avec un algorithme de spray
- C) Essayer un seul mot de passe commun sur un grand nombre de comptes pour éviter le verrouillage
- D) Copier les mots de passe depuis un fichier de base de données

**Réponse : C**

**Q4 :** Dans la Cyber Kill Chain, quelle est la phase d'Installation ?
- A) Envoi d'un email de phishing
- B) Scan des ports ouverts sur la cible
- C) Mise en place de la persistance (backdoor) sur le système compromis
- D) Communication avec le serveur C2

**Réponse : C**

**Q5 :** Quelle propriété de sécurité garantit qu'un utilisateur ne peut pas nier avoir effectué une action spécifique ?
- A) Confidentialité
- B) Intégrité
- C) Disponibilité
- D) Non-répudiation

**Réponse : D** — La non-répudiation est assurée par les logs signés numériquement et les certificats.

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
