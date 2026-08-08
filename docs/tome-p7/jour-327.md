# TOME P7 — Certifications d'Élite & Spécialisations — Jour 327 (6h) : CIPP/E & RGPD Expert — Privacy by Design (DPIA CNIL/EDPB, Pseudonymisation, Minimisation & Architectural Privacy Patterns)

> [!NOTE]
> **Objectif du jour :** Maîtriser le principe de **Privacy by Design et by Default (Article 25 du RGPD)** et la conduite d'une **Analyse d'Impact sur la Protection des Données (AIPD / DPIA)** selon la méthodologie CNIL / EDPB ciblée par la certification **CIPP/E** : formaliser les 3 piliers d'une DPIA (Description, Nécessité/Proportionnalité, Gestion des Risques), concevoir des architectures garantissant la minimisation des données (Data Minimization) et la séparation des données (Data Segregation), et implémenter des masquages dynamiques.
>
> **Compétences visées :** `CIPPE-03` (A) — Privacy by Design & Default (Art. 25) | `CIPPE-04` (A) — DPIA/AIPD Methodology (CNIL/EDPB) & Privacy Architecture

---

## 1) Module — Privacy by Design & DPIA Methodology (2h)

### 📖 Narration/Intuition

Le **Privacy by Design** exige que la protection de la vie privée soit intégrée dès la conception des systèmes d'information, et non ajoutée après coup. L'**AIPD / DPIA (Data Protection Impact Assessment)** est **obligatoire (Art. 35)** lorsqu'un traitement est susceptible d'engendrer un **risque élevé** pour les droits et libertés des personnes physiques (ex. surveillance à grande échelle, données sensibles/biométriques, profilage automatisé).

```
Structure d'une AIPD / DPIA (Méthodologie CNIL / G29)
┌────────────────────────────────────────────────────────┐
│ 1. Description du Traitement (Objectifs, Données, Flux)│
├────────────────────────────────────────────────────────┤
│ 2. Évaluation de la Nécessité et de la Proportionnalité│
│    (Base légale, Minimisation, Durée de conservation) │
├────────────────────────────────────────────────────────┤
│ 3. Appréciation des Risques sur la Vie Privée          │
│    (Accès non autorisé, Modification, Disparition)    │
├────────────────────────────────────────────────────────┤
│ 4. Mesures de Sécurité & Atténuation des Risques       │
└────────────────────────────────────────────────────────┘
```

---

## 2) Module — Outillage DPIA & Dynamic Data Masking (`dpia_privacy_engine.py`) (2h)

### 🛠️ Atelier Pratique

```python
import re

class PrivacyByDesignEngine:
    """
    Composant applicatif assurant la Minimisation des Données et le Masquage Dynamique
    conformément à l'Article 25 du RGPD (Privacy by Default).
    """

    @staticmethod
    def mask_email(email: str) -> str:
        """Masque une adresse email pour l'affichage (ex: j***n@domain.com)."""
        if not email or "@" not in email:
            return "*****"
        name, domain = email.split("@", 1)
        if len(name) <= 2:
            masked_name = name[0] + "*"
        else:
            masked_name = name[0] + "*" * (len(name) - 2) + name[-1]
        return f"{masked_name}@{domain}"

    @staticmethod
    def mask_phone(phone: str) -> str:
        """Masque un numéro de téléphone (ex: +33 6 ** ** 56 78)."""
        clean_phone = re.sub(r"\s+", "", phone)
        if len(clean_phone) < 8:
            return "******"
        return clean_phone[:4] + " ** ** " + clean_phone[-4:]

    @staticmethod
    def enforce_data_minimization(user_record: dict, scope: str) -> dict:
        """
        Filtre les champs d'un profil utilisateur en fonction du contexte applicatif (Minimisation).
        Scope 'PUBLIC': Nom partiel uniquement.
        Scope 'SUPPORT': Informations masquées.
        Scope 'FULL_ADMIN': Accès complet avec audit log.
        """
        if scope == "PUBLIC":
            return {
                "display_name": user_record.get("full_name", "").split()[0],
                "account_created": user_record.get("created_at")
            }
        elif scope == "SUPPORT":
            return {
                "user_id": user_record.get("user_id"),
                "full_name": user_record.get("full_name"),
                "masked_email": PrivacyByDesignEngine.mask_email(user_record.get("email")),
                "masked_phone": PrivacyByDesignEngine.mask_phone(user_record.get("phone")),
                "role": user_record.get("role")
            }
        elif scope == "FULL_ADMIN":
            # Audit obligatoire avant de délivrer le payload complet
            print(f"[AUDIT LOG] Accès complet aux DCP accordé à l'Admin sur {user_record.get('user_id')}")
            return user_record
        else:
            raise ValueError("Scope non autorisé pour le traitement des DCP.")

# Exemple d'exécution
user_profile = {
    "user_id": "USR-8821",
    "full_name": "Sophie Martin",
    "email": "sophie.martin@paradis-bank.com",
    "phone": "+33698765432",
    "role": "Client Premium",
    "created_at": "2026-01-15"
}

print("=== MASQUAGE PRIVACY BY DEFAULT (SCOPE SUPPORT) ===")
support_view = PrivacyByDesignEngine.enforce_data_minimization(user_profile, "SUPPORT")
print(support_view)

print("\n=== MINIMISATION STRICTE (SCOPE PUBLIC) ===")
public_view = PrivacyByDesignEngine.enforce_data_minimization(user_profile, "PUBLIC")
print(public_view)
```

---

## 3) Module — Modélisation de la DPIA CNIL / EDPB (2h)

```markdown
# FICHE D'ANALYSE D'IMPACT SUR LA PROTECTION DES DONNÉES (AIPD / DPIA)

## 1. Présentation du Traitement
- **Nom du projet :** Système de Détection Intelligente des Fraudes (IA / Profilage)
- **Responsable de Traitement :** PARADIS BANK SA
- **DPO Référent :** dpo@paradis-bank.com
- **Finalité :** Prévention du blanchiment d'argent et détection des transactions anormales en temps réel.

## 2. Évaluation de la Nécessité et Proportionnalité
- **Base Légale :** Obligation légale (Code Monétaire et Financier / Directives Anti-Blanchiment LCB-FT).
- **Données Traitées :** Historique des paiements, IPs de connexion, géolocalisation, montants.
- **Durée de Conservation :** 5 ans à compter de la clôture du compte (archivage intermédiaire).

## 3. Analyse des Risques et Mesures d'Atténuation

| Risque Identifié | Impact | Vraisemblance | Mesures d'Atténuation Intégrées | Risque Résiduel |
|:---|:---:|:---:|:---|:---:|
| Accès illégitime aux profils de risque clients | Élevé | Moyenne | Chiffrement AES-256 des tables + IAM RBAC avec MFA strict | **Faible** |
| Erreur d'algorithme / Faux positif (Blocage abusif) | Moyen | Élevée | Droit à une intervention humaine (Art. 22) + Recours client | **Faible** |
| Fuite de données lors de l'entraînement du modèle | Élevé | Faible | Pseudonymisation via Differential Privacy (ε=0.5) | **Faible** |

## 4. Avis du DPO
**Avis Favorable sous réserve** de la réalisation d'audits annuels d'explicabilité des algorithmes de profilage.
```

---

## 🏅 Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **DPIA / AIPD** | Data Protection Impact Assessment / Analyse d'Impact sur la Protection des Données (Art. 35) |
| **EDPB / CEPD** | European Data Protection Board / Comité Européen de la Protection des Données |
| **CNIL** | Commission Nationale de l'Informatique et des Libertés (Autorité de contrôle française) |
| **PbD** | Privacy by Design — Intégration de la protection de la vie privée dès la conception |

---

## ❓ Banque de Questions & Test du Jour

**Q1 :** Selon l'Article 35 du RGPD, dans quel cas la réalisation d'une **DPIA (Analyse d'Impact)** est-elle légalement obligatoire ?
- A) Lorsque le traitement est susceptible d'engendrer un risque élevé pour les droits et libertés des personnes physiques (ex. profilage automatisé, surveillance à grande échelle, données sensibles)
- B) Pour tous les traitements sans exception
- C) Uniquement sur demande écrite de la police
- D) Si l'entreprise compte plus de 10 000 salariés uniquement

**Réponse : A**

**Q2 :** Le principe de **Privacy by Default (Article 25(2))** impose que :
- A) Par défaut, seules les données personnelles nécessaires pour chaque finalité spécifique du traitement soient traitées (minimisation de la collecte, de la durée et de l'accès)
- B) Toutes les données soient publiques par défaut
- C) L'utilisateur doive payer pour activer la confidentialité
- D) Le consentement soit pré-coché par défaut

**Réponse : A**

**Q3 :** Selon l'Article 22 du RGPD, quel droit possède une personne faisant l'objet d'une décision fondé **exclusivement sur un traitement automatisé** (ex. refus de prêt bancaire par un algorithme) ?
- A) Le droit d'obtenir une intervention humaine, d'exprimer son point de vue et de contester la décision
- B) Aucun droit si l'algorithme est breveté
- C) Uniquement le droit de supprimer son compte
- D) Le droit de racheter l'entreprise

**Réponse : A**

**Q4 :** Quelles sont les trois composantes fondamentales de l'évaluation des risques dans une DPIA selon la méthodologie CNIL ?
- A) Apprécier les risques d'accès non autorisé, de modification non autorisée, et de disparition/indisponibilité des données
- B) Évaluer les coûts logiciels, hardware et réseaux
- C) Calculer le chiffre d'affaires et la marge nette
- D) Vérifier les licences open-source

**Réponse : A**

**Q5 :** Si une DPIA indique un risque résiduel **élevé** que le responsable de traitement ne peut pas atténuer par des mesures raisonnables, quelle est l'obligation légale (Article 36) ?
- A) Consulter préalablement l'Autorité de Contrôle compétente (ex. CNIL) avant de débuter le traitement
- B) Lancer le projet sans rien dire
- C) Supprimer le département informatique
- D) Vendre les données immédiatement

**Réponse : A**

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
