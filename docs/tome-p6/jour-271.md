# TOME P6 — Cybersécurité Expert & Red Team Avancé — Jour 271 (6h) : Gouvernance, Risques & Conformité GRC (ISO 27001:2022, Méthode EBIOS RM, Directive NIS 2 & Règlement DORA)

> [!NOTE]
> **Objectif du jour :** Maîtriser la **Gouvernance, la Gestion des Risques et la Conformité (GRC)** selon les référentiels internationaux ciblés par les certifications **CISM** et **CRISC** : conduire une analyse de risques avec la méthode **EBIOS RM (ANSSI)**, mettre en œuvre les 93 contrôles de l'Annexe A de la norme **ISO/IEC 27001:2022**, et appliquer les exigences de la directive européenne **NIS 2** et du règlement **DORA**.
>
> **Compétences visées :** `GRC-01` (A) — ISO 27001:2022 & EBIOS RM Risk Assessment | `GRC-02` (A) — NIS 2 & DORA Regulatory Compliance

---

## 1) Module — Analyse de Risques avec EBIOS RM (2h)

### 📖 Narration/Intuition

**EBIOS Risk Manager (EBIOS RM)** est la méthode officielle d'analyse de risques développée par l'ANSSI. Elle comporte 5 ateliers successifs :
1. **Socle de sécurité :** Délimiter le périmètre et identifier les événements redoutés.
2. **Sources de risques :** Identifier les attaquants cibles (SR) et leurs objectifs visés (OV).
3. **Scénarios stratégiques :** Cartographier les chemins d'attaque de haut niveau sur l'écosystème.
4. **Scénarios opérationnels :** Détailler les séquences d'actions techniques (TTPs MITRE).
5. **Traitement des risques :** Définir le plan d'amélioration de la sécurité (PACS).

---

## 2) Module — Matrice de Risques EBIOS RM & Registre de Risques (`ebios_risk_matrix.py`) (2h)

```python
# Registre de Risques automatisé selon la méthode EBIOS RM / ISO 27005

risks = [
    {
        "id": "RSK-01",
        "description": "Ransomware chiffrant les bases de données bancaires via compromission Active Directory",
        "vraisemblance": 4, # Scale 1 (Très faible) à 4 (Très forte)
        "gravite": 4,      # Scale 1 (Mineure) à 4 (Critique)
        "mesures": ["Déploiement MFA FIDO2", "Sauvegardes S3 WORM immutables", "Micro-segmentation ZTA"]
    },
    {
        "id": "RSK-02",
        "description": "Vol de données clients via SSRF applicatif exposé sur Internet",
        "vraisemblance": 3,
        "gravite": 4,
        "mesures": ["Pipeline DevSecOps Checkov", "Migration IMDSv2 obligatoire", "WAF Rules"]
    }
]

print("=== REGISTRE DE RISQUES EBIOS RM ===")
for r in risks:
    critique = r['vraisemblance'] * r['gravite']
    status = "CRITIQUE (Action immédiate)" if critique >= 12 else "MAJEUR"
    print(f"[{r['id']}] Score : {critique}/16 ({status})")
    print(f"  Description : {r['description']}")
    print(f"  Plan de Traitement : {', '.join(r['mesures'])}\n")
```

---

## 3) Module — Conformité Réglementaire NIS 2 & DORA (2h)

### 🛠️ Résumé des Exigences NIS 2 & DORA

| Directive / Règlement | Entités Concernées | Exigence Clé | Délai d'Alerte Incident |
|:---|:---|:---|:---|
| **NIS 2** | Entités Essentielles (EE) & Importantes (EI) | 10 mesures de sécurité obligatoires (MFA, chiffrement, supply chain) | **24 heures** (Notification précoce) |
| **DORA** | Entités Financières UE (Banques, Assurances, Fintech) | 5 piliers de résilience numérique (Risk, Incidents, Testing, 3rd Party, Sharing) | **4 heures** (Incident majeur) |

---

## 🏅 Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **GRC** | Governance, Risk, and Compliance — Gouvernance, gestion des risques et conformité |
| **EBIOS RM** | Expression des Besoins et Identification des Objectifs de Sécurité - Risk Manager (ANSSI) |
| **NIS 2** | Network and Information Security Directive 2 — Directive européenne sur la cybersécurité |
| **DORA** | Digital Operational Resilience Act — Règlement européen sur la résilience opérationnelle du secteur financier |

---

## ❓ Banque de Questions & Test du Jour

**Q1 :** Combien d'ateliers successifs comporte la méthode d'analyse de risques **EBIOS RM** recommandée par l'ANSSI ?
- A) 5 ateliers
- B) 2 ateliers
- C) 10 ateliers
- D) 1 seul atelier

**Réponse : A**

**Q2 :** Dans la norme **ISO/IEC 27001:2022**, combien de contrôles de sécurité sont regroupés dans l'Annexe A révisée ?
- A) 93 contrôles répartis en 4 thèmes (Organisationnel, Personnes, Physique, Technique)
- B) 114 contrôles
- C) 50 contrôles
- D) 200 contrôles

**Réponse : A**

**Q3 :** Quel est le délai d'alerte précoce (Early Warning) imposé par la directive **NIS 2** en cas d'incident de sécurité significatif ?
- A) 24 heures
- B) 72 heures
- C) 30 jours
- D) 1 an

**Réponse : A**

**Q4 :** Combien de piliers fondamentaux composent le règlement européen **DORA** pour le secteur financier ?
- A) 5 piliers
- B) 3 piliers
- C) 8 piliers
- D) 12 piliers

**Réponse : A**

**Q5 :** Quelle certification de l'ISACA valide les compétences d'un responsable de la gouvernance et de la gestion des risques des SI ?
- A) CISM / CRISC
- B) CEH
- C) OSCP
- D) Network+

**Réponse : A**

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
