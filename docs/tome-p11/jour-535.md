# TOME P11 — DevSecOps, Cloud Security & Gouvernance — Jour 535 (6h) : Sécurité des Données & DLP : Classification des Données, Data Masking, Tokenisation & Microsoft Purview

> [!NOTE]
> **Objectifs pédagogiques :**
> - Définir et appliquer une politique de **Classification des Données** (Public, Interne, Confidentiel, Secret) alignée sur le RGPD et les besoins métier
> - Maîtriser les techniques de **protection des données sensibles** : masquage (Data Masking), pseudonymisation, tokenisation et chiffrement au niveau colonne
> - Déployer une solution de **DLP (Data Loss Prevention)** pour intercepter les fuites de données vers des canaux non autorisés (E-mail, USB, Cloud personnel)
> - Configurer Microsoft Purview (anciennement Azure Information Protection) pour l'étiquetage et la protection automatique des documents
>
> **Compétences visées :** `SEC-05` (A), `POL-02` (A) — Data Security, Classification & DLP

---

## Module 1 — Classification des Données & Politique de Protection (2h)

### 📖 Intuition & Narration

Toutes les données ne se valent pas. Le menu de la cantine de l'entreprise peut être public. Le bilan financier trimestriel est strictement confidentiel. Un code source propriétaire ou un brevet sont des secrets commerciaux. La clé de chiffrement des transactions bancaires est un secret absolu.

Traiter toutes ces catégories avec le même niveau de contrôle serait soit trop coûteux (tout protéger comme un secret), soit catastrophique (tout laisser accessible comme si c'était public).

La **Classification des Données** est la fondation de toute stratégie de sécurité des données (Data Security). Elle doit définir **qui peut accéder à quelle donnée, dans quel contexte, et quelles protections techniques s'appliquent automatiquement** selon le niveau de sensibilité.

### 🔍 Anatomie Technique — Grille de Classification & Contrôles Associés

```
GRILLE DE CLASSIFICATION DES DONNÉES PARADIS FINANCE (EXEMPLE)

  ┌────────────────────────────────────────────────────────────────────────┐
  │ NIVEAU           │ EXEMPLES                    │ CONTRÔLES OBLIGATOIRES│
  ├──────────────────┼─────────────────────────────┼───────────────────────┤
  │ PUBLIC           │ Communiqués de presse, FAQ   │ Aucun                 │
  │ INTERNE          │ Procédures internes, Planning│ Authentification MFA  │
  │ CONFIDENTIEL     │ Bilans financiers, CRM, RH   │ Chiffrement, DLP, Log │
  │ SECRET           │ Clés cryptographiques, M&A   │ HSM, PAM, Enveloppe  │
  └────────────────────────────────────────────────────────────────────────┘

TECHNIQUES DE PROTECTION SELON LE NIVEAU :
  • Pseudonymisation   : Remplacement d'identifiants directs (Nom → Pseudonyme réversible)
  • Anonymisation      : Transformation irréversible (RGPD Art. 89)
  • Tokenisation       : Remplacement par un jeton non significatif
  • Data Masking       : Occultation partielle (4111 11** **** 1111)
  • Chiffrement Colonne: AES-256 au niveau base de données (ex: TDE, pgcrypto)
```

---

## Module 2 — Atelier Pratique : Data Classification & Masking Engine (2h)

### 🛠️ Code Python : Automated Data Sensitivity Scanner & Masker

```python
#!/usr/bin/env python3
"""
PARADIS — Data Sensitivity Scanner & Automated Masking Engine
Détecte les données sensibles (PII, PAN, IBAN) et les masque automatiquement selon la politique de classification.
"""

import re
import json
import sys
from dataclasses import dataclass
from typing import List, Tuple

@dataclass
class DetectedSensitiveField:
    field_name: str
    raw_value: str
    data_type: str    # "PAN_BANCAIRE", "IBAN", "EMAIL", "NUMERO_SECU", "DATE_NAISS"
    classification: str
    masked_value: str

class DataSensitivityEngine:
    # Patterns de détection PII / PAN / IBAN
    PATTERNS = {
        "PAN_BANCAIRE": (r"\b(?:\d[ -]?){13,16}\b", "SECRET"),
        "IBAN": (r"\bFR\d{2}[ ]\d{4}[ ]\d{4}[ ]\d{4}[ ]\d{4}[ ]\d{3}\b", "CONFIDENTIEL"),
        "EMAIL": (r"\b[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[A-Z|a-z]{2,}\b", "CONFIDENTIEL"),
        "NUMERO_SECU": (r"\b[12]\d{2}\d{2}\d{2}\d{3}\d{3}\d{2}\b", "SECRET")
    }

    def _mask_pan(self, value: str) -> str:
        """Masque un PAN bancaire : 4111 11** **** 1111"""
        digits = re.sub(r'\D', '', value)
        if len(digits) >= 13:
            return f"{digits[:6]}{'*' * (len(digits) - 10)}{digits[-4:]}"
        return "****"

    def _mask_email(self, value: str) -> str:
        """Masque un e-mail : a***@p***.fr"""
        if "@" in value:
            user, domain = value.split("@", 1)
            return f"{user[0]}{'*' * (len(user)-1)}@{domain[0]}{'*' * (len(domain.split('.')[0])-1)}.{domain.split('.')[-1]}"
        return "****"

    def _mask_iban(self, value: str) -> str:
        """Masque un IBAN : FR76 **** **** **** **** ***"""
        parts = value.replace(' ', '')
        return f"{parts[:4]} {'**** ' * 4}{parts[-3:]}"

    def scan_and_mask(self, data: dict) -> List[DetectedSensitiveField]:
        print("=== DÉTECTION ET MASQUAGE DES DONNÉES SENSIBLES (DLP ENGINE) ===")
        results = []

        for field_name, field_value in data.items():
            str_value = str(field_value)
            for data_type, (pattern, classification) in self.PATTERNS.items():
                if re.search(pattern, str_value):
                    if data_type == "PAN_BANCAIRE":
                        masked = self._mask_pan(str_value)
                    elif data_type == "EMAIL":
                        masked = self._mask_email(str_value)
                    elif data_type == "IBAN":
                        masked = self._mask_iban(str_value)
                    else:
                        masked = f"{'*' * (len(str_value) - 4)}{str_value[-4:]}"

                    result = DetectedSensitiveField(
                        field_name=field_name,
                        raw_value=str_value,
                        data_type=data_type,
                        classification=classification,
                        masked_value=masked
                    )
                    results.append(result)
                    print(f"  [🔴 DÉTECTÉ] [{classification}] Champ '{field_name}' : Type={data_type}")
                    print(f"    Original : {str_value}")
                    print(f"    Masqué   : {masked}")
                    break

        return results

if __name__ == "__main__":
    # Simulation d'un enregistrement de base de données client
    client_record = {
        "client_id": "CLI-0042",
        "nom": "Jean Dupont",
        "email": "jean.dupont@paradis-bank.fr",
        "numero_carte": "4111 1111 1111 1111",
        "iban": "FR76 3000 4028 3788 0000 0000 043",
        "statut": "VIP"
    }

    engine = DataSensitivityEngine()
    detected = engine.scan_and_mask(client_record)

    print(f"\n[*] Total de données sensibles détectées : {len(detected)}")
    print("[✅ DLP ENGINE] Données masquées prêtes pour log/export sécurisé.")
```

---

## Module 3 — Microsoft Purview & DLP Endpoint (1h30)

### 🔍 DLP Endpoint & Purview (Azure Information Protection)

**Microsoft Purview** (anciennement Azure Information Protection) est une solution de protection des données qui opère en 3 étapes :

1. **Découverte** : Scan automatique des fichiers OneDrive, SharePoint et Teams pour identifier les données sensibles (Numéros de CB, NIR, termes confidentiels).
2. **Étiquetage automatique (Auto-labeling)** : Application d'une étiquette de sensibilité (ex: `Confidentiel - Finance`) directement dans les métadonnées du fichier Office.
3. **Enforcement (Règles DLP)** : Blocage automatique du partage par e-mail d'un document étiqueté `SECRET` vers une adresse Gmail ou vers une clé USB.

---

## Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **DLP** | Data Loss Prevention — Prévention des pertes ou fuites de données |
| **PII** | Personally Identifiable Information — Informations personnellement identifiables |
| **TDE** | Transparent Data Encryption — Chiffrement transparent des données au niveau stockage |
| **Data Masking** | Technique d'occultation partielle des données sensibles (ex: PAN → 4111 11** **** 1111) |

---

## Exercices Pratiques

### Exercice 1 — Classification d'un Actif Informationnel

Classifiez les actifs informationnels suivants selon la grille à 4 niveaux :
1. La liste des employés et leurs salaires.
2. L'annonce publique d'un nouveau produit.
3. La clé privée TLS du site web de production.
4. Le plan de continuité d'activité (PCA).

**Corrigé guidé :**
1. **CONFIDENTIEL** — Données RH sensibles, accès restreint aux RH et direction.
2. **PUBLIC** — Document destiné à la diffusion grand public.
3. **SECRET** — Clé cryptographique critique, accès HSM uniquement.
4. **CONFIDENTIEL** — Document interne sensible, partagé uniquement avec les responsables opérationnels.

---

## Banque QCM — 5 Questions

**Q1.** Quelle est la différence entre la **pseudonymisation** et l'**anonymisation** d'une donnée personnelle ?

- A) Aucune différence.
- B) La pseudonymisation est un processus réversible (le lien avec l'individu peut être rétabli avec la table de correspondance), tandis que l'anonymisation est irréversible. ✅
- C) L'anonymisation est plus rapide.
- D) La pseudonymisation supprime les données.

**Q2.** Qu'est-ce que le **Data Masking** ?

- A) Supprimer définitivement les données.
- B) Occultation partielle de données sensibles affichées pour en masquer une partie tout en conservant un format lisible (ex: PAN : 4111 11** **** 1111). ✅
- C) Chiffrer la totalité du disque dur.
- D) Envoyer les données par courrier.

**Q3.** Quel est le rôle d'une solution de **DLP (Data Loss Prevention)** au niveau de l'endpoint ?

- A) Accélérer les transferts de fichiers.
- B) Surveiller et bloquer les tentatives de transfert de fichiers classifiés vers des canaux non autorisés (e-mail personnel, clé USB, service cloud non-approuvé). ✅
- C) Installer des mises à jour Windows.
- D) Changer les mots de passe des utilisateurs.

**Q4.** Que fait **Microsoft Purview** lors de la phase d'**étiquetage automatique (Auto-labeling)** ?

- A) Imprime les documents sur l'imprimante la plus proche.
- B) Scanne automatiquement le contenu des fichiers et applique une étiquette de sensibilité dans les métadonnées (ex: "Confidentiel") sans intervention manuelle de l'utilisateur. ✅
- C) Traduit les documents en anglais.
- D) Supprime les fichiers trop volumineux.

**Q5.** La **tokenisation** d'un numéro de carte bancaire consiste à :

- A) Masquer partiellement le PAN avec des astérisques.
- B) Remplacer le PAN par un jeton aléatoire non significatif stocké en base de données et dont la correspondance avec le PAN réel est tenue dans un serveur de tokenisation ultra-sécurisé. ✅
- C) Chiffrer le PAN en Base64.
- D) Supprimer le PAN de la base de données.

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
