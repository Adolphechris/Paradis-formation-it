# TOME P8 — Blue Team, SOC & SIEM Advanced — Jour 384 (6h) : Cloud Red Team & Multi-Cloud Exploitation (AWS IAM Escalation, Azure Service Principal Abuse & GCP Metadata SSRF)

> [!NOTE]
> **Objectif du jour :** Maîtriser l'ingénierie offensive et l'élaboration de tactiques Red Team ciblées sur les infrastructures **Multi-Cloud (AWS, Azure, GCP)** : exploiter les 21 méthodes d'élévation de privilèges IAM AWS (**AWS IAM Privilege Escalation** via `iam:PassRole`, `sts:AssumeRole`, `iam:CreatePolicyVersion`), abuser des identités d'applications Azure (**Service Principal & Managed Identity Hijacking**), et pivoter à travers les métadonnées **GCP Cloud Functions / Compute Engine**.
>
> **Compétences visées :** `RED-CLOUD-01` (A) — AWS IAM Privilege Escalation Vectors & Cross-Account Pivoting | `RED-CLOUD-02` (A) — Azure Managed Identity Abuse & GCP Cloud Metadata Attack Paths

---

## 1) Module — Matrice d'Élévation de Privilèges Cloud (2h)

### 📖 Narration/Intuition

Dans le Cloud, la compromission initiale d'une clé d'accès ou d'un rôle aux privilèges restreints n'est que la première étape. L'attaquant cherche les **misconfigurations de politiques IAM** qui lui permettent de s'auto-attribuer des rôles `AdministratorAccess` sans modifier les mots de passe de l'entreprise.

```
  [ CLÉ AWS COMPROMISE : ROLE RESTREINT (DevRole) ]
                          │
                          │ 1. `iam:CreatePolicyVersion` (Attribution Politique Administrateur)
                          ▼
  [ NOUVELLE VERSION DE POLITIQUE IAM INJECTÉE : "*" on "*" ]
                          │
                          │ 2. Set-Default-Policy-Version
                          ▼
  [ ÉLÉVATION DE PRIVILÈGES COMPLÈTE ──► ADMINISTRATORACCESS ]
                          │
                          │ 3. `sts:AssumeRole` (Pivot vers d'autres comptes de l'Organization)
                          ▼
             [ COMPROMISSION TOTALE DE L'INFRASTRUCTURE CLOUD ]
```

#### Vecteurs Majeurs d'Élévation de Privilèges IAM AWS

| Permission IAM AWS | Mécanisme d'Attaque / Élévation | Niveau de Risque |
|:---:|:---|:---:|
| **`iam:CreatePolicyVersion`** | Crée une nouvelle version de politique avec `Effect: Allow, Action: *` et la définit par défaut | **CRITIQUE** |
| **`iam:SetDefaultPolicyVersion`** | Active une ancienne version de politique plus permissive conservée dans l'historique | **ÉLEVÉ** |
| **`iam:PassRole` + `ec2:RunInstances`** | Lance une nouvelle instance EC2 en lui attribuant un rôle IAM privilégié | **CRITIQUE** |
| **`iam:CreateAccessKey`** | Crée une nouvelle clé d'accès pour un autre utilisateur IAM administrateur | **CRITIQUE** |
| **`lambda:CreateFunction` + `lambda:InvokeFunction`** | Crée une fonction Lambda exécutée sous un rôle d'exécution privilégié | **ÉLEVÉ** |

---

## 2) Module — Outillage Cloud Red Team Engine (`cloud_redteam_engine.py`) (2h)

### 🛠️ Atelier Pratique

```python
import json
from datetime import datetime, timezone
from typing import List, Dict

class CloudRedTeamEngine:
    """
    Moteur d'analyse et d'exploitation de vulnérabilités IAM Multi-Cloud (AWS / Azure / GCP).
    Identifie et simule les vecteurs d'élévation de privilèges IAM.
    """

    def __init__(self, cloud_provider: str, operator: str):
        self.provider = cloud_provider
        self.operator = operator
        self.attack_vector_results: List[dict] = []

    def evaluate_aws_iam_privesc(self, user_permissions: List[str]) -> List[dict]:
        """
        Évalue une liste de permissions IAM AWS pour détecter les chemins d'élévation de privilèges.
        """
        print(f"[*] Analyse des privilèges IAM AWS pour l'opérateur {self.operator}...")

        # Vecteur 1 : iam:CreatePolicyVersion
        if "iam:CreatePolicyVersion" in user_permissions:
            self._register_vector(
                vector_id="AWS-PRIVESC-01",
                name="IAM CreatePolicyVersion Abuse",
                severity="CRITICAL",
                technique="T1098 - Account Manipulation",
                details="Permet de créer une version de politique administrative avec Action:* et de la définir par défaut."
            )

        # Vecteur 2 : iam:PassRole + ec2:RunInstances
        if "iam:PassRole" in user_permissions and "ec2:RunInstances" in user_permissions:
            self._register_vector(
                vector_id="AWS-PRIVESC-02",
                name="PassRole to EC2 Privilege Escalation",
                severity="CRITICAL",
                technique="T1078.004 - Cloud Accounts",
                details="Permet de démarrer une instance EC2 attachée à n'importe quel rôle IAM privilégié de l'organisation."
            )

        # Vecteur 3 : sts:AssumeRole
        if "sts:AssumeRole" in user_permissions:
            self._register_vector(
                vector_id="AWS-PRIVESC-03",
                name="AssumeRole Cross-Account Pivoting",
                severity="HIGH",
                technique="T1550 - Use Alternate Authentication Material",
                details="Permet d'assumer des rôles IAM sur des comptes AWS tiers via les relations de confiance."
            )

        return self.attack_vector_results

    def _register_vector(self, vector_id: str, name: str, severity: str, technique: str, details: str):
        vector = {
            "vector_id": vector_id,
            "vector_name": name,
            "severity": severity,
            "mitre_technique": technique,
            "details": details,
            "discovered_at": datetime.now(timezone.utc).isoformat()
        }
        self.attack_vector_results.append(vector)
        print(f"  [!] VECTEUR DÉCOUVERT [{severity}] {vector_id}: {name}")

    def generate_cloud_redteam_report(self) -> dict:
        return {
            "cloud_provider": self.provider,
            "operator": self.operator,
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "privesc_vectors_found": len(self.attack_vector_results),
            "attack_vectors": self.attack_vector_results
        }

# Démonstration Cloud Red Team Engine
cloud_rt = CloudRedTeamEngine("AWS", "RT_CLOUD_EXPERT")

print("=== CLOUD RED TEAM PRIVILEGE ESCALATION ENGINE ===")

# Test d'une clé d'accès compromises avec un sous-ensemble de permissions
stolen_permissions = [
    "iam:CreatePolicyVersion",
    "iam:PassRole",
    "ec2:RunInstances",
    "sts:AssumeRole",
    "s3:GetObject"
]

cloud_rt.evaluate_aws_iam_privesc(stolen_permissions)

print("\n=== CLOUD RED TEAM REPORT ===")
print(json.dumps(cloud_rt.generate_cloud_redteam_report(), indent=2, ensure_ascii=False))
```

---

## 3) Module — Fiche Technique Azure Managed Identity Abuse (2h)

```markdown
# AZURE MANAGED IDENTITY HIJACKING & PIVOTING

## 1. Concept des Azure Managed Identities
Les **Managed Identities** Azure évitent aux développeurs d'inscrire des secrets en dur dans les applications. Un jeton OAuth est demandé localement au service IMDS d'Azure (`http://169.254.169.254/metadata/identity/oauth2/token`).

## 2. Vol de Jeton Managed Identity (RCE / Command Injection)
Si une application Web hébergée sur une VM ou une Azure App Service a une vulnérabilité RCE :

```bash
# Obtenir un Jeton d'Accès ARM (Azure Resource Manager) via le Metadata Service Azure
curl -H "Metadata: true" "http://169.254.169.254/metadata/identity/oauth2/token?api-version=2018-02-01&resource=https://management.azure.com/"

# Utiliser le Jeton Bearer reçu pour énumérer les ressources Azure via l'API REST Azure
curl -H "Authorization: Bearer <AZURE_ACCESS_TOKEN>" https://management.azure.com/subscriptions?api-version=2020-01-01
```
```

---

## 🏅 Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **`iam:PassRole`** | Permission IAM AWS permettant d'attribuer un rôle d'exécution à un service AWS (ex: EC2, Lambda) |
| **`sts:AssumeRole`** | Appel API AWS STS retournant des identifiants temporaires pour assumer un rôle d'accès spécifique |
| **Managed Identity** | Identité managée automatiquement par Azure Entra ID pour l'authentification sans mot de passe entre services |

---

## ❓ Banque de Questions & Test du Jour (5 QCM)

**Q1 :** Quelle permission **IAM AWS** permet à un attaquant de s'accorder un accès administrateur total en injectant une nouvelle version de politique ?
- A) `iam:CreatePolicyVersion`
- B) `s3:GetObject`
- C) `ec2:DescribeInstances`
- D) `sts:GetCallerIdentity`

**Réponse : A**

**Q2 :** Comment la combinaison `iam:PassRole` + `ec2:RunInstances` permet-elle une élévation de privilèges dans AWS ?
- A) En permettant à l'attaquant de lancer une nouvelle instance EC2 et de lui associer un rôle IAM privilégié (ex. `AdministratorAccess`), puis de s'y connecter pour récupérer les clés du rôle
- B) En supprimant le compte de l'administrateur
- C) En redémarrant le routeur réseau
- D) En modifiant les règles du DNS

**Réponse : A**

**Q3 :** Quel est l'endpoint HTTP local du service de métadonnées Azure utilisé pour récupérer un jeton **Azure Managed Identity** ?
- A) `http://169.254.169.254/metadata/identity/oauth2/token` avec le header `Metadata: true`
- B) `http://127.0.0.1/azure/token`
- C) `http://10.0.0.1/auth`
- D) `http://localhost:8080/token`

**Réponse : A**

**Q4 :** Quelle API AWS Security Token Service (**STS**) permet d'assumer temporairement un rôle IAM avec des autorisations différentes ou sur un autre compte de l'organisation ?
- A) `sts:AssumeRole`
- B) `sts:GetCredentials`
- C) `sts:LoginUser`
- D) `sts:CreateAccount`

**Réponse : A**

**Q5 :** Dans GCP (Google Cloud Platform), quel service est souvent visé par une vulnérabilité SSRF pour extraire le Service Account Token du nœud ?
- A) Le Metadata Server GCP (`http://metadata.google.internal/computeMetadata/v1/`) avec le header `Metadata-Flavor: Google`
- B) Le portail GCP Billing
- C) Le service Google Drive
- D) Le serveur DNS Google (8.8.8.8)

**Réponse : A**

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
