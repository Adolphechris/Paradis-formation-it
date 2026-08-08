# TOME P7 — Certifications d'Élite & Spécialisations — Jour 326 (6h) : CIPP/E & RGPD Expert — Data Subject Rights Automation (DSR API, DSAR Workflows & Automated Anonymization/Erasure)

> [!NOTE]
> **Objectif du jour :** Maîtriser l'automatisation de la conformité au **RGPD (Règlement Général sur la Protection des Données)** ciblée par la certification **CIPP/E (Certified Information Privacy Professional/Europe)** : concevoir une architecture technique et des workflows automatisés de réponse aux demandes de droit des personnes (DSAR - Data Subject Access Requests), implémenter une **DSR API** (Droit d'accès, de rectification, d'effacement/droit à l'oubli, et de portabilité des données Article 15 à 20 du RGPD), et automatiser la pseudonymisation/anonymisation irréversible en base de données.
>
> **Compétences visées :** `CIPPE-01` (A) — RGPD Data Subject Rights (Art 15-22) | `CIPPE-02` (A) — DSAR Automation Engineering & Anonymization Pipelines

---

## 1) Module — Cadre Légal RGPD & Droits des Personnes (2h)

### 📖 Narration/Intuition

Le RGPD accorde aux personnes physiques (personnes concernées) des droits stricts sur leurs données à caractère personnel (DCP). La réponse aux demandes doit intervenir **sous 1 mois** (prolongeable de 2 mois si la demande est complexe).

| Article RGPD | Droit de la Personne | Exigence Technique |
|:---:|:---|:---|
| **Art. 15** | Droit d'Accès | Extraction exhaustive de toutes les DCP liées à l'utilisateur dans tous les datastores |
| **Art. 16** | Droit de Rectification | Mise à jour synchrone/asynchrone des champs DCP obsolètes/inexacts |
| **Art. 17** | Droit à l'Effacement ("Droit à l'oubli") | Purge/anonymisation irréversible des DCP (sauf obligations légales de conservation) |
| **Art. 20** | Droit à la Portabilité | Exportation des données dans un format structuré, couramment utilisé et lisible par machine (JSON/CSV) |

---

## 2) Module — Pipeline Automation DSAR (`dsar_automation_engine.py`) (2h)

### 🛠️ Atelier Pratique

```python
import json
import hashlib
from datetime import datetime, timezone

class DSARAutomationEngine:
    """
    Moteur automatisé d'exécution des demandes de droit des personnes (RGPD Art. 15-20).
    Supporte l'Export Portabilité (JSON) et l'Effacement / Anonymisation Irréversible (Art. 17).
    """

    def __init__(self, db_connection_mock):
        self.db = db_connection_mock

    def process_dsar_export(self, user_id: str) -> dict:
        """Exécute une demande de Droit d'Accès & Portabilité (Art. 15 & 20)."""
        print(f"[*] Traitement du DSAR Export pour User ID: {user_id}")
        user_data = self.db.get("users", {}).get(user_id)
        if not user_data:
            return {"status": "NOT_FOUND", "message": "Aucun utilisateur trouvé."}

        # Agrégation des données secondaires (commandes, logs d'accès, préférences)
        orders = [o for o in self.db.get("orders", []).values() if o.get("user_id") == user_id]
        access_logs = [l for l in self.db.get("access_logs", []) if l.get("user_id") == user_id]

        dsar_package = {
            "metadata": {
                "dsar_type": "EXPORT_ART_15_20",
                "request_timestamp": datetime.now(timezone.utc).isoformat(),
                "legal_basis": "Consent / Contract",
                "controller": "PARADIS BANK SA"
            },
            "personal_data": {
                "profile": user_data,
                "transaction_history": orders,
                "security_logs": access_logs
            }
        }
        return {"status": "SUCCESS", "export_json": dsar_package}

    def process_dsar_erasure(self, user_id: str, retention_exceptions: list = None) -> dict:
        """
        Exécute le Droit à l'Effacement (Art. 17 - Droit à l'Oubli).
        Anonymise irréversiblement les champs nominatifs tout en conservant les données anonymes requis par la loi.
        """
        print(f"[!] Traitement du DSAR Effacement/Anonymisation pour User ID: {user_id}")
        user_data = self.db.get("users", {}).get(user_id)
        if not user_data:
            return {"status": "NOT_FOUND"}

        # Anonymisation irréversible via Salted Hash pour conserver la cohérence statistique sans ré-identification
        salt = "PARADIS_SALT_2026"
        anon_hash = hashlib.sha256(f"{user_id}_{salt}".encode()).hexdigest()[:16]

        anonymized_profile = {
            "user_id": f"ANON_{anon_hash}",
            "full_name": "ANONYMIZED_DATA_SUBJECT",
            "email": f"deleted_user_{anon_hash}@anonymized.local",
            "phone": "0000000000",
            "address": "REDACTED_GDPR_ART17",
            "account_status": "ERASED",
            "erasure_timestamp": datetime.now(timezone.utc).isoformat()
        }

        # Remplacement en base (Purger les identifiants directs)
        self.db["users"][user_id] = anonymized_profile
        return {"status": "SUCCESS", "anonymized_id": f"ANON_{anon_hash}"}

# Démonstration
mock_database = {
    "users": {
        "USR-1092": {"full_name": "Jean Dupont", "email": "j.dupont@email.com", "phone": "+33612345678"}
    },
    "orders": {
        "ORD-55": {"user_id": "USR-1092", "amount": 250.0, "item": "Formation Cyber"}
    },
    "access_logs": [
        {"user_id": "USR-1092", "ip": "192.168.1.50", "timestamp": "2026-08-01T10:00:00Z"}
    ]
}

engine = DSARAutomationEngine(mock_database)
export_res = engine.process_dsar_export("USR-1092")
print("\n=== RSULTAT EXPORT PORTABILITÉ (JSON) ===")
print(json.dumps(export_res["export_json"], indent=2, ensure_ascii=False))

erasure_res = engine.process_dsar_erasure("USR-1092")
print("\n=== RÉSULTAT EFFACEMENT / ANONYMISATION ===")
print(json.dumps(erasure_res, indent=2))
```

---

## 3) Module — Workflow d'Ingénierie DSR & Registre des Traitements (2h)

```markdown
# ARCHITECTURE D'AUTOMATISATION DES DSAR (Art. 30 & 15-20 RGPD)

```
 [ Demandeur (Portal DSAR / API) ]
                │
                ▼
  [ API Gateway / OAuth2 Auth ]  ──► (Vérification stricte de l'identité du demandeur)
                │
                ▼
  [ Orchestrateur DSAR (Workflow Engine) ]
        ├── 1. Query Data Catalog (Art. 30 Register)
        ├── 2. Dispatch jobs vers DBs (SQL, NoSQL, Data Lake, S3)
        ├── 3. Traitement spécifique :
        │      ├── Mode Access/Portability ──► Agrégation & Génération archive ZIP/JSON
        │      └── Mode Erasure (Art. 17) ──► Anonymisation k-anonymity / Purge SQL
        │
        ▼
  [ Notification & Audit Log (Preuve de conformité CIPP/E) ]
```

### Directives d'Anonymisation vs Pseudonymisation

- **Pseudonymisation (Art. 4(5))** : Remplacement des identifiants par un pseudonyme (ex: Hash/Token). Les données restent des **Données à Caractère Personnel** (soumises au RGPD) car la ré-identification est possible avec la clé secrète.
- **Anonymisation** : Traitement irréversible rendant impossible toute ré-identification de la personne par quiconque (technique hors du champ d'application du RGPD si réussie).
```

---

## 🏅 Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **CIPP/E** | Certified Information Privacy Professional/Europe — Certification IAPP de référence en protection des données |
| **DSAR / DSR** | Data Subject Access Request / Data Subject Rights — Demande d'exercice des droits par une personne concernée |
| **DCP** | Données à Caractère Personnel — Toute information se rapportant à une personne physique identifiée ou identifiable |
| **DPO** | Data Protection Officer (Délégué à la Protection des Données) — Garant de la conformité RGPD dans l'organisation |

---

## ❓ Banque de Questions & Test du Jour

**Q1 :** Dans le cadre du RGPD (CIPP/E), quelle est la différence fondamentale entre la **pseudonymisation** et l'**anonymisation** ?
- A) La pseudonymisation est réversible à l'aide d'informations supplémentaires et les données restent soumises au RGPD, tandis que l'anonymisation est irréversible et fait sortir les données du champ d'application du RGPD
- B) L'anonymisation est obligatoire, la pseudonymisation est interdite
- C) La pseudonymisation s'applique uniquement aux emails
- D) Il n'y a aucune différence légale

**Réponse : A**

**Q2 :** Quel est le délai légal maximal accordé par le RGPD (Article 12(3)) pour répondre à une demande d'exercice des droits (DSAR) d'un utilisateur ?
- A) Un mois à compter de la réception de la demande (prolongeable de deux mois en cas de complexité)
- B) 24 heures
- C) 7 jours ouvrés
- D) 6 mois sans condition

**Réponse : A**

**Q3 :** L'Article 17 du RGPD (Droit à l'effacement / droit à l'oubli) s'applique-t-il sans aucune exception ?
- A) Non, l'effacement peut être refusé si la conservation est nécessaire au respect d'une obligation légale (ex. conservation des factures) ou à la constatation/exercice de droits en justice
- B) Oui, l'effacement est absolu et immédiat dans tous les cas
- C) Non, l'effacement est interdit pour toutes les entreprises
- D) Uniquement sur décision du DPO

**Réponse : A**

**Q4 :** Sous quel format les données doivent-elles être transmises lors de l'exercice du **Droit à la Portabilité (Article 20)** ?
- A) Dans un format structuré, couramment utilisé et lisible par machine (ex. JSON, CSV, XML)
- B) Uniquement sur papier imprimé
- C) En image PNG non lisible
- D) En binaire propriétaire crypté

**Réponse : A**

**Q5 :** Quel article du RGPD impose à l'organisme de tenir un **Registre des Activités de Traitement** (RoPA) ?
- A) Article 30
- B) Article 5
- C) Article 12
- D) Article 89

**Réponse : A**

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
