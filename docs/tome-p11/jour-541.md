# TOME P11 — DevSecOps, Cloud Security & Gouvernance — Jour 541 (6h) : Sécurité des Infrastructures Legacy : Active Directory Hardening, Kerberoasting & Golden Ticket

> [!NOTE]
> **Objectifs pédagogiques :**
> - Comprendre l'architecture d'**Active Directory (AD)** et ses mécanismes d'authentification Kerberos dans un contexte de sécurité offensif et défensif
> - Maîtriser les attaques **Kerberoasting**, **AS-REP Roasting**, **Pass-the-Hash** et **Golden/Silver Ticket** pour mieux les défendre
> - Appliquer le **Tiering Model** Microsoft (Tier 0/1/2) pour sécuriser les comptes à privilèges dans Active Directory
> - Utiliser **BloodHound** pour cartographier les chemins d'attaque et les déléguer via le modèle **CanRDP/GenericAll/WriteDACL**
>
> **Compétences visées :** `SEC-04` (A), `SEC-08` (A) — Active Directory Security, Privilege Escalation Defense

---

## Module 1 — Kerberos & Attaques sur Active Directory (2h)

### 📖 Intuition & Narration

**Active Directory** est le cerveau de l'authentification dans 90% des entreprises mondiales. C'est aussi le Saint Graal des attaquants : compromettre l'AD, c'est compromettre l'organisation entière.

Kerberos est le protocole d'authentification de l'AD. Son fonctionnement repose sur un système de **tickets** délivrés par le **KDC (Key Distribution Center)** :

```
FLUX KERBEROS SIMPLIFIÉ

  CLIENT                    KDC (AD)                    SERVICE
     │                         │                            │
     │─── AS-REQ (TGT REQ) ───→│                            │
     │←── AS-REP (TGT) ────────│                            │
     │                         │                            │
     │─── TGS-REQ (ST REQ) ───→│                            │
     │←── TGS-REP (ST) ────────│                            │
     │                                                       │
     │─────────── AP-REQ (ST → Service) ───────────────────→│
     │←────────── AP-REP (Accès accordé) ───────────────────│
```

### 🔍 Anatomie des Attaques Kerberos

**Kerberoasting** : Toute authentification Kerberos peut demander un **Service Ticket (ST)** pour n'importe quel Service Principal Name (SPN). Ce ticket est chiffré avec le hash du mot de passe du compte de service. Un attaquant peut extraire ce ticket et le cracker hors-ligne.

```
KERBEROASTING — PRINCIPE

  Attaquant (user normal) ──TGS-REQ (SPN: MSSQLSvc/db.paradis.fr)──→ KDC
  KDC ──TGS-REP (ST chiffré avec hash de svc_sql)──────────────────→ Attaquant
  Attaquant ──→ hashcat / john ──→ crack hors-ligne ──→ mot de passe de svc_sql
```

**AS-REP Roasting** : Si un compte AD a l'attribut `DONT_REQUIRE_PREAUTH` activé, il est possible d'obtenir un TGT partiellement chiffré avec le hash du mot de passe du compte sans s'authentifier.

**Pass-the-Hash (PtH)** : Dans les protocoles NTLM, le hash d'un mot de passe peut être utilisé directement pour s'authentifier, sans connaître le mot de passe en clair (via l'outil `mimikatz`).

**Golden Ticket** : Si un attaquant compromet le hash **KRBTGT** (le compte maître du KDC), il peut **forger n'importe quel ticket Kerberos** pour n'importe quel utilisateur, pour n'importe quel service, indéfiniment.

---

## Module 2 — Active Directory Hardening (2h)

### 🛠️ Atelier Pratique — Détection et Remédiation

```powershell
# ============================================================
# PARADIS — Active Directory Hardening Audit Script (PowerShell)
# Détecte les comptes vulnérables à Kerberoasting & AS-REP Roasting
# ============================================================

Import-Module ActiveDirectory

Write-Host "`n[1/4] DÉTECTION — Comptes avec SPN (Kerberoasting potential)" -ForegroundColor Yellow
$KerberoastableAccounts = Get-ADUser -Filter {ServicePrincipalName -ne "$null"} `
    -Properties ServicePrincipalName, PasswordLastSet, Enabled |
    Where-Object { $_.Enabled -eq $true }

foreach ($acct in $KerberoastableAccounts) {
    $pwAge = (Get-Date) - $acct.PasswordLastSet
    $risky = if ($pwAge.Days -gt 365) { "⚠️ MOT DE PASSE ANCIEN > 1 AN" } else { "✅ OK" }
    Write-Host "  $($acct.SamAccountName) | SPN: $($acct.ServicePrincipalName) | PwdAge: $($pwAge.Days) jours | $risky"
}

Write-Host "`n[2/4] DÉTECTION — Comptes avec DONT_REQUIRE_PREAUTH (AS-REP Roasting)" -ForegroundColor Yellow
$ASREPRoastable = Get-ADUser -Filter {DoesNotRequirePreAuth -eq $true} `
    -Properties DoesNotRequirePreAuth |
    Where-Object { $_.Enabled -eq $true }

foreach ($acct in $ASREPRoastable) {
    Write-Host "  [🚨 CRITIQUE] $($acct.SamAccountName) — DONT_REQUIRE_PREAUTH activé ! Désactiver immédiatement."
}

if (-not $ASREPRoastable) {
    Write-Host "  [✅] Aucun compte vulnérable à AS-REP Roasting détecté."
}

Write-Host "`n[3/4] REMÉDIATION — Rotation du mot de passe KRBTGT (protection Golden Ticket)" -ForegroundColor Yellow
Write-Host "  [⚠️] La rotation du KRBTGT doit être effectuée 2 fois (dupliqué en 2 versions) avec un délai de 10h."
Write-Host "  [*] Étape 1 : Réinitialiser le mot de passe KRBTGT..."
# Set-ADAccountPassword -Identity krbtgt -Reset -NewPassword (ConvertTo-SecureString -AsPlainText "P@ss-1234-TEMP" -Force)
Write-Host "  [*] Attendre 10h (propagation inter-DC), puis effectuer une 2ème rotation."
Write-Host "  [*] Étape 2 (après 10h) : 2ème réinitialisation du mot de passe KRBTGT."

Write-Host "`n[4/4] VÉRIFICATION — Comptes membres de Domain Admins (Tier 0)" -ForegroundColor Yellow
$DomainAdmins = Get-ADGroupMember -Identity "Domain Admins" -Recursive
Write-Host "  Membres actuels de 'Domain Admins' (doivent être < 5 comptes) :"
foreach ($member in $DomainAdmins) {
    Write-Host "  • $($member.SamAccountName) ($($member.objectClass))"
}
Write-Host "`n[✅ AUDIT] Rapport Active Directory Hardening généré."
```

### 🔍 Tiering Model Microsoft — Ségrégation des Privilèges AD

Le **Tiering Model** est la stratégie de défense en profondeur la plus efficace contre les mouvements latéraux dans Active Directory :

```
MICROSOFT ACTIVE DIRECTORY TIERING MODEL

  ┌─────────────────────────────────────────────────────────────────┐
  │  TIER 0 — Actifs de Contrôle (accès depuis postes dédiés SEULEMENT)│
  │  • Domain Controllers, KDC (KRBTGT)                              │
  │  • AD Connect (synchronisation hybride)                          │
  │  • Comptes : Domain Admins, Schema Admins, Enterprise Admins     │
  ├─────────────────────────────────────────────────────────────────┤
  │  TIER 1 — Serveurs d'Application                                  │
  │  • Serveurs SQL, Exchange, SharePoint, serveurs métier           │
  │  • Comptes : Admins locaux des serveurs, comptes de service      │
  ├─────────────────────────────────────────────────────────────────┤
  │  TIER 2 — Postes de Travail & Utilisateurs Standards              │
  │  • Laptops, desktops, utilisateurs finaux                        │
  │  • Comptes : Helpdesk, utilisateurs standards                    │
  └─────────────────────────────────────────────────────────────────┘
  
  RÈGLE FONDAMENTALE : Un compte d'un Tier inférieur NE DOIT JAMAIS
  se connecter sur un système d'un Tier supérieur.
```

---

## Module 3 — BloodHound & Cartographie des Chemins d'Attaque (1h30)

### 🔍 BloodHound — Graphe des Relations AD

**BloodHound** est un outil de cartographie des chemins d'attaque dans Active Directory. Il représente les relations AD (membres de groupes, droits de délégation, sessions actives) sous forme de graphe orienté.

Les relations les plus dangereuses cartographiées par BloodHound :
- **`GenericAll`** : Contrôle total sur un objet AD (peut réinitialiser le mot de passe, modifier les membres)
- **`WriteDACL`** : Peut modifier les ACL d'un objet (peut se donner `GenericAll`)
- **`DCSync`** : Droit de répliquer le contenu de l'AD (inclut tous les hashs NTLM)
- **`CanRDP`** : Peut ouvrir une session RDP sur une machine

---

## Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **KDC** | Key Distribution Center — Serveur Kerberos centralisant l'émission des tickets (intégré au DC) |
| **TGT** | Ticket-Granting Ticket — Ticket initial obtenu après authentification (valide 10h par défaut) |
| **SPN** | Service Principal Name — Identifiant unique d'un service dans un domaine Kerberos |
| **KRBTGT** | Compte spécial AD dont le hash est utilisé pour signer tous les TGT |
| **PtH** | Pass-the-Hash — Technique d'authentification utilisant le hash NTLM sans connaître le clair |

---

## Exercices Pratiques

### Exercice 1 — Identification des Chemins d'Attaque AD

Dans un domaine AD fictif, l'utilisateur `user_compta` possède le droit **WriteDACL** sur le groupe **IT_Admins**, qui est lui-même membre de **Domain Admins**. Décrivez le chemin d'attaque complet permettant à `user_compta` d'obtenir des privilèges de Domain Admin.

**Corrigé guidé :**
1. `user_compta` utilise son droit `WriteDACL` sur `IT_Admins` pour se donner le droit `GenericAll` (contrôle total) sur ce groupe.
2. Avec `GenericAll`, `user_compta` s'ajoute lui-même comme membre du groupe `IT_Admins`.
3. `IT_Admins` étant membre de `Domain Admins`, `user_compta` hérite des privilèges de Domain Admin.
4. En tant que Domain Admin, `user_compta` peut effectuer une attaque **DCSync** pour exfiltrer tous les hashs NTLM du domaine, y compris le hash KRBTGT.

---

## Banque QCM — 5 Questions

**Q1.** Qu'est-ce que le **Kerberoasting** ?

- A) Une attaque visant à crasher les contrôleurs de domaine par déni de service.
- B) Une attaque permettant à tout utilisateur authentifié d'extraire un Service Ticket chiffré avec le hash du compte de service associé à un SPN, puis de le cracker hors-ligne pour obtenir le mot de passe en clair. ✅
- C) Une technique d'escalade de privilèges exploitant des vulnérabilités du noyau Windows.
- D) Une attaque par force brute sur le protocole LDAP.

**Q2.** Un **Golden Ticket** est rendu possible par :

- A) La compromission du hash NTLM d'un utilisateur standard.
- B) La compromission du hash du compte **KRBTGT**, permettant de forger des tickets Kerberos arbitraires pour n'importe quel utilisateur et service du domaine. ✅
- C) L'exploitation d'une vulnérabilité CVE dans Windows Server.
- D) L'accès physique à un contrôleur de domaine.

**Q3.** Dans le **Tiering Model Microsoft**, un administrateur de Tier 0 doit gérer les Domain Controllers. Depuis quel type de poste doit-il effectuer ces opérations ?

- A) Son poste de travail quotidien (laptop personnel du Tier 2).
- B) N'importe quel poste du réseau interne.
- C) Une Privileged Access Workstation (PAW) dédiée et durcie, physiquement et logiquement isolée des postes standard. ✅
- D) Depuis un serveur de Tier 1.

**Q4.** Quelle est la particularité du compte **DONT_REQUIRE_PREAUTH** dans Active Directory, exploitée par l'attaque **AS-REP Roasting** ?

- A) Le compte ne requiert pas de mot de passe.
- B) Il est possible d'obtenir un TGT partiellement chiffré avec le hash du mot de passe de ce compte **sans fournir d'authentification préalable**, puis de cracker ce hash hors-ligne. ✅
- C) Le compte peut réinitialiser n'importe quel mot de passe AD.
- D) Le compte a accès illimité à tous les partages réseau.

**Q5.** Quel outil est utilisé pour **cartographier les chemins d'attaque** dans Active Directory en représentant les relations (GenericAll, WriteDACL, CanRDP) sous forme de graphe ?

- A) Nessus
- B) Burp Suite
- C) BloodHound ✅
- D) Wireshark

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
