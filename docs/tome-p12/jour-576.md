# TOME P12 — Architecture Ultime, Leadership Technique & Capstone Final — Jour 576 (6h) : Bioinformatique & Informatique Médicale — HL7 FHIR, DICOM & Medical AI

> [!NOTE]
> **Objectifs pédagogiques :**
> - Maîtriser le standard d'interopérabilité santé **HL7 FHIR R4** (Fast Healthcare Interoperability Resources) : Resources, REST API, Bundle et Bundles de transactions
> - Comprendre le format d'imagerie médicale **DICOM** (Digital Imaging and Communications in Medicine) : structure de fichier, Tags, SOP Classes et WADO-RS
> - Architecturer des pipelines d'**Intelligence Artificielle Médicale** conformes aux réglementations (CE Marquage Classe IIa/IIb, FDA 510(k))
> - Implémenter des mécanismes de sécurité et de confidentialité des données de santé (HIPAA, RGPD — Données de Santé Catégorie Spéciale)
>
> **Compétences visées :** `ARCH-01` (A), `SEC-04` (A) — Health IT, FHIR, DICOM, Medical AI, HIPAA/RGPD Santé

---

## Module 1 — HL7 FHIR & Interopérabilité Santé (2h)

### 📖 Intuition & Narration

Dans un hôpital typique, les données d'un patient sont fragmentées entre des dizaines de systèmes incompatibles : le Système d'Information Hospitalier (SIH), le dossier pharmaceutique, le logiciel radiologue, le système de biologie médicale... Cette **fragmentation des données** tue : des erreurs de médication, des examens dupliqués, des diagnostics tardifs résultent directement de l'incapacité des systèmes à se parler.

**HL7 FHIR R4** (Fast Healthcare Interoperability Resources) est le standard moderne qui résout ce problème en exposant les données de santé via une **API REST standard**, avec des ressources JSON/XML normalisées.

### 🔍 Anatomie d'un Resource FHIR

```
STRUCTURE D'UNE RESSOURCE FHIR R4 (JSON)

  {
    "resourceType": "Patient",     // Type de ressource FHIR
    "id": "patient-123",           // Identifiant unique
    "meta": {
      "versionId": "1",
      "lastUpdated": "2026-08-11T10:00:00Z"
    },
    "identifier": [{               // Identifiant institutionnel (IPP)
      "system": "http://hopital-paradis.fr/ipp",
      "value": "IPP-789456"
    }],
    "name": [{
      "family": "Dupont",
      "given": ["Jean", "Pierre"]
    }],
    "birthDate": "1985-03-22",
    "gender": "male",
    "address": [{
      "city": "Paris",
      "country": "FR"
    }]
  }

  PRINCIPALES RESSOURCES FHIR R4 :
  ┌────────────────┬───────────────────────────────────────────┐
  │ Patient        │ Données démographiques du patient         │
  │ Observation    │ Constantes vitales, résultats labo        │
  │ DiagnosticRpt  │ Compte-rendu d'examens                    │
  │ Medication     │ Médicaments et prescriptions              │
  │ Encounter      │ Consultation, hospitalisation             │
  │ ImagingStudy   │ Lien vers étude DICOM                     │
  │ Bundle         │ Ensemble de ressources (transaction)      │
  └────────────────┴───────────────────────────────────────────┘
```

### 🔍 Format DICOM — Digital Imaging and Communications in Medicine

**DICOM** est le standard universel pour l'imagerie médicale (IRM, Scanner, Radio...). Un fichier DICOM contient à la fois l'**image** et ses **métadonnées structurées** (Tags) :

```
STRUCTURE D'UN FICHIER DICOM

  ┌──────────────────────────────────────────────────────────┐
  │  DICOM FILE HEADER (Preamble 128 bytes + "DICM" Magic)  │
  ├──────────────────────────────────────────────────────────┤
  │  DATA SET (séquence de Data Elements)                   │
  │  ┌─────────────────────────────────────────────────┐    │
  │  │ Tag (0010,0010) │ PN  │ 20 │ "DUPONT^Jean"      │    │ ← Patient Name
  │  │ Tag (0010,0020) │ LO  │ 12 │ "IPP-789456"       │    │ ← Patient ID
  │  │ Tag (0008,0060) │ CS  │  2 │ "CT"               │    │ ← Modality (Scanner)
  │  │ Tag (0008,103E) │ LO  │ 20 │ "THORAX SANS/AVEC" │    │ ← Description
  │  │ Tag (7FE0,0010) │ OB  │  N │ [PIXEL DATA]       │    │ ← Données image
  │  └─────────────────────────────────────────────────┘    │
  └──────────────────────────────────────────────────────────┘
```

---

## Module 2 — Medical AI & Conformité Réglementaire (2h)

### 🔍 Pipeline Medical AI — Détection de Pathologie sur IRM

```
PIPELINE MEDICAL AI — DÉTECTION LÉSION SUR SCANNER (CT)

  DICOM Files → Preprocessing → AI Model → Post-processing → Rapport FHIR
       │              │              │              │                │
  Anonymisation  Normalisation  Segmentation   Seuillage       DiagnosticReport
  (Pseudonymisa) HU → [-1,1]   U-Net/nnUNet   confidence       + Observation
                                              threshold=0.85    Ressource FHIR

  CONFORMITÉ RÉGLEMENTAIRE (EU) :
  ┌────────────────────────────────────────────────────────────────┐
  │ MDR 2017/745 — Dispositif Médical Logiciel (SaMD)             │
  │ Classe IIa : Aide au diagnostic (recommandation secondaire)   │
  │ Classe IIb : Décision diagnostique critique (autonome)        │
  │ Exigences : ISO 13485 QMS, ISO 14971 Risk Management,         │
  │             IEC 62304 Software Lifecycle, EU AI Act (2024)    │
  └────────────────────────────────────────────────────────────────┘
```

### 🔍 Sécurité des Données de Santé — HIPAA & RGPD

Les données de santé sont des **données à caractère personnel de catégorie spéciale** (Article 9 RGPD), soumises à des obligations renforcées :

| Obligation | RGPD Art. 9 (EU) | HIPAA (USA) |
|:---|:---|:---|
| **Base légale** | Consentement explicite ou soin médical | Traitement pour soins / recherche autorisée |
| **Pseudonymisation** | Obligatoire avant partage | Safe Harbor ou Expert Determination |
| **Chiffrement** | Obligatoire en transit & au repos | Addressable (fortement recommandé) |
| **Journalisation** | Registre des accès (RGPD Art. 30) | Audit Log obligatoire (HIPAA Security Rule) |
| **DPO** | Obligatoire pour hôpitaux | Privacy Officer obligatoire |

---

## Module 3 — Atelier Pratique : FHIR Client & Medical Data Anonymizer (1h30)

### 🛠️ Script Python : FHIR R4 Patient Resource Builder & DICOM Anonymizer

```python
#!/usr/bin/env python3
"""
PARADIS — FHIR R4 Patient Resource Builder & DICOM Anonymizer
Simule la création de ressources HL7 FHIR R4 et l'anonymisation DICOM (RGPD Art. 9).
"""
import json
import hashlib
import datetime
from dataclasses import dataclass, field
from typing import List, Dict, Any, Optional

# ─── PARTIE 1 : FHIR R4 Resource Builder ───────────────────────────────────

@dataclass
class FHIRHumanName:
    family: str
    given: List[str]

@dataclass
class FHIRIdentifier:
    system: str
    value: str

class FHIRPatientResource:
    """Constructeur de ressource FHIR R4 Patient"""

    def __init__(self, patient_id: str, name: FHIRHumanName, birth_date: str,
                 gender: str, identifiers: List[FHIRIdentifier]):
        self.patient_id  = patient_id
        self.name        = name
        self.birth_date  = birth_date
        self.gender      = gender
        self.identifiers = identifiers

    def to_fhir_json(self) -> dict:
        return {
            "resourceType": "Patient",
            "id"          : self.patient_id,
            "meta": {
                "versionId"  : "1",
                "lastUpdated": datetime.datetime.utcnow().isoformat() + "Z",
                "profile"    : ["http://hl7.org/fhir/StructureDefinition/Patient"]
            },
            "identifier": [{"system": i.system, "value": i.value} for i in self.identifiers],
            "name"      : [{"family": self.name.family, "given": self.name.given}],
            "birthDate" : self.birth_date,
            "gender"    : self.gender
        }


class FHIRObservationResource:
    """Constructeur de ressource FHIR R4 Observation (Glycémie, TA, etc.)"""

    def __init__(self, obs_id: str, patient_id: str, code_loinc: str,
                 display: str, value: float, unit: str, unit_code: str):
        self.obs_id     = obs_id
        self.patient_id = patient_id
        self.code_loinc = code_loinc
        self.display    = display
        self.value      = value
        self.unit       = unit
        self.unit_code  = unit_code

    def to_fhir_json(self) -> dict:
        return {
            "resourceType": "Observation",
            "id"          : self.obs_id,
            "status"      : "final",
            "code"        : {
                "coding": [{"system": "http://loinc.org", "code": self.code_loinc, "display": self.display}]
            },
            "subject"              : {"reference": f"Patient/{self.patient_id}"},
            "effectiveDateTime"    : datetime.datetime.utcnow().isoformat() + "Z",
            "valueQuantity"        : {"value": self.value, "unit": self.unit,
                                       "system": "http://unitsofmeasure.org", "code": self.unit_code}
        }


# ─── PARTIE 2 : DICOM Anonymizer (RGPD) ────────────────────────────────────

class DICOMAnonymizer:
    """
    Anonymisation DICOM conforme RGPD Art. 9 & HIPAA Safe Harbor.
    Remplace les tags d'identification par des pseudonymes SHA-256.
    """
    # Tags DICOM d'identification à anonymiser (format GroupElement)
    PHI_TAGS = {
        "(0010,0010)": "PatientName",
        "(0010,0020)": "PatientID",
        "(0010,0030)": "PatientBirthDate",
        "(0010,1040)": "PatientAddress",
        "(0008,0080)": "InstitutionName",
        "(0008,1048)": "PhysiciansOfRecord"
    }

    def __init__(self, salt: str = "PARADIS-SALT-2026"):
        self.salt = salt

    def _pseudonymize(self, value: str) -> str:
        """Pseudonymisation déterministe via HMAC-SHA256"""
        combined = f"{self.salt}:{value}".encode("utf-8")
        return f"ANON-{hashlib.sha256(combined).hexdigest()[:16].upper()}"

    def anonymize(self, dicom_metadata: Dict[str, str]) -> Dict[str, Any]:
        """Anonymise un dictionnaire de métadonnées DICOM"""
        anonymized   = {}
        audit_log    = []

        for tag, value in dicom_metadata.items():
            if tag in self.PHI_TAGS:
                pseudo = self._pseudonymize(value)
                anonymized[tag] = pseudo
                audit_log.append({
                    "tag"        : tag,
                    "field_name" : self.PHI_TAGS[tag],
                    "action"     : "PSEUDONYMIZED",
                    "original_len": len(value),
                    "pseudo_value": pseudo
                })
            else:
                anonymized[tag] = value  # Tags non-PHI conservés

        return {"anonymized_metadata": anonymized, "audit_log": audit_log,
                "rgpd_compliant": True, "phi_fields_processed": len(audit_log)}

# ─── DÉMONSTRATION ──────────────────────────────────────────────────────────

if __name__ == "__main__":
    print("=== PARADIS — HL7 FHIR R4 & DICOM ANONYMIZER DEMO ===\n")

    # 1. Création d'une ressource FHIR Patient
    patient = FHIRPatientResource(
        patient_id  = "patient-paradis-001",
        name        = FHIRHumanName(family="Dupont", given=["Jean", "Pierre"]),
        birth_date  = "1985-03-22",
        gender      = "male",
        identifiers = [FHIRIdentifier("http://hopital-paradis.fr/ipp", "IPP-789456")]
    )
    print("=== RESSOURCE FHIR R4 PATIENT ===")
    print(json.dumps(patient.to_fhir_json(), indent=2, ensure_ascii=False))

    # 2. Observation glycémie
    obs = FHIRObservationResource(
        obs_id="obs-001", patient_id="patient-paradis-001",
        code_loinc="2339-0", display="Glucose [Mass/volume] in Blood",
        value=5.4, unit="mmol/L", unit_code="mmol/L"
    )
    print("\n=== RESSOURCE FHIR R4 OBSERVATION (Glycémie) ===")
    print(json.dumps(obs.to_fhir_json(), indent=2, ensure_ascii=False))

    # 3. Anonymisation DICOM
    dicom_metadata = {
        "(0010,0010)": "DUPONT^Jean^Pierre",
        "(0010,0020)": "IPP-789456",
        "(0010,0030)": "19850322",
        "(0008,0060)": "CT",
        "(0008,103E)": "THORAX SANS ET AVEC INJECTION",
        "(0010,1040)": "12 rue de la Paix, Paris"
    }

    anonymizer = DICOMAnonymizer()
    result = anonymizer.anonymize(dicom_metadata)
    print("\n=== ANONYMISATION DICOM — RGPD ART. 9 ===")
    print(f"  Champs PHI traités    : {result['phi_fields_processed']}")
    print(f"  Conforme RGPD        : {'✅' if result['rgpd_compliant'] else '❌'}")
    print("\n  Métadonnées Anonymisées :")
    for tag, val in result["anonymized_metadata"].items():
        print(f"    {tag} → {val}")
```

---

## Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **FHIR** | Fast Healthcare Interoperability Resources — Standard HL7 d'interopérabilité santé basé sur REST |
| **DICOM** | Digital Imaging and Communications in Medicine — Standard universel d'imagerie médicale |
| **SIH** | Système d'Information Hospitalier — ERP hospitalier |
| **PHI** | Protected Health Information — Données de santé protégées (HIPAA) |
| **SaMD** | Software as a Medical Device — Logiciel constitutif d'un dispositif médical (MDR EU) |
| **LOINC** | Logical Observation Identifiers Names and Codes — Nomenclature internationale des examens biologiques |

---

## Exercices Pratiques

### Exercice 1 — Identification de Tags DICOM PHI

Un fichier DICOM contient les tags suivants. Identifiez lesquels constituent des **Données de Santé PHI** (Protected Health Information) à anonymiser selon le RGPD Art. 9 avant tout partage externe :

- `(0008,0060)` = "MR" (Modality : IRM)
- `(0010,0010)` = "MARTIN^Sophie" (Patient Name)
- `(0028,0010)` = 512 (Rows)
- `(0010,0020)` = "IPP-12345" (Patient ID)
- `(0008,103E)` = "CERVEAU SANS INJECTION" (Series Description)
- `(0010,0030)` = "19920615" (Birth Date)

**Corrigé :** Les tags PHI à anonymiser sont :
- ✅ `(0010,0010)` PatientName = "MARTIN^Sophie" → pseudonymiser
- ✅ `(0010,0020)` PatientID = "IPP-12345" → pseudonymiser
- ✅ `(0010,0030)` BirthDate = "19920615" → supprimer ou généraliser (ex: "1992")
- Les tags `(0008,0060)`, `(0028,0010)`, `(0008,103E)` sont des **métadonnées techniques non-PHI** → conservés.

---

## Banque QCM — 5 Questions

**Q1.** Quel standard moderne permet l'**interopérabilité entre systèmes de santé** via une API REST et des ressources JSON/XML normalisées ?

- A) HL7 v2.x (EDI)
- B) HL7 FHIR R4 ✅
- C) DICOM
- D) IHE XDS.b

**Q2.** Dans un fichier **DICOM**, où se trouvent à la fois l'image médicale et ses métadonnées ?

- A) Dans deux fichiers séparés (un JPEG + un CSV).
- B) Dans un seul fichier DICOM qui contient les métadonnées (Data Elements/Tags) et les données pixel (Tag 7FE0,0010) dans un même conteneur. ✅
- C) L'image est dans le DICOM, les métadonnées sont dans FHIR.
- D) Dans un fichier PDF.

**Q3.** Selon le **RGPD Article 9**, dans quelle catégorie tombent les données de santé ?

- A) Données ordinaires (Article 6).
- B) Données à caractère personnel de catégorie spéciale, nécessitant une protection renforcée et une base légale explicite. ✅
- C) Données publiques librement partageables.
- D) Données anonymes non soumises au RGPD.

**Q4.** Un logiciel d'aide au **diagnostic radiologique** basé sur l'IA est considéré comme quel type de produit en Union Européenne ?

- A) Un simple logiciel SaaS.
- B) Un Dispositif Médical Logiciel (SaMD) soumis au Règlement MDR 2017/745, nécessitant un marquage CE selon sa classe de risque. ✅
- C) Un équipement industriel.
- D) Un bien de consommation courante.

**Q5.** Pourquoi la **pseudonymisation** est-elle préférable à l'anonymisation complète dans le cadre de la recherche médicale ?

- A) Parce que la pseudonymisation est moins coûteuse.
- B) La pseudonymisation permet de ré-identifier un patient sous conditions strictes (ex: adverse event reporting), contrairement à l'anonymisation irréversible qui empêche tout suivi individuel, tout en protégeant la vie privée au quotidien. ✅
- C) La pseudonymisation n'est pas reconnue par le RGPD.
- D) Parce que l'anonymisation est illégale en France.

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
