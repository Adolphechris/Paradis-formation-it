# TOME P3 — Cloud Native, DevOps & Cyberdéfense — Jour 146 (6h) : Gouvernance, Risques & Conformité Avancée (GRC, ISO 27001 Audit, NIS2 & Régulation Bancaire DRC/COBAC)

> [!NOTE]
> **Objectif du jour :** Structurer et opérationnaliser le dispositif de Gouvernance, Risques et Conformité (GRC) d'une banque centrale africaine : audit de certification ISO 27001:2022, conformité à la directive NIS2 (Union Européenne), exigences de la régulation bancaire COBAC (Afrique Centrale) et outils de gestion automatisée des risques (OpenRMF, Wazuh Compliance).
>
> **Compétences visées :** `POL-03` (A) — GRC, ISO 27001 & NIS2 | `SEC-05` (A) — Conformité Réglementaire Bancaire (COBAC / DCRB)

---

## 1) Module — ISO 27001:2022 & Cadre de Gestion des Risques (2h)

### 📖 Narration/Intuition

La BCC souhaite obtenir la certification **ISO 27001:2022** pour démontrer à ses partenaires internationaux (FMI, Banque Mondiale, banques correspondantes) la maturité de son Système de Management de la Sécurité de l'Information (SMSI).

L'ISO 27001:2022 s'appuie sur une démarche **PDCA (Plan-Do-Check-Act)** cyclique et exige la définition d'un périmètre, d'une politique de sécurité, d'une analyse des risques documentée et d'un Plan de Traitement des Risques (PTR) pour chaque risque identifié.

### 🔍 Anatomie Technique

**Les 4 options de traitement d'un risque selon ISO 27001 :**

```
RISQUE IDENTIFIÉ : Accès non autorisé à la base de données RTGS
│
├── 1. TRAITEMENT (Réduire) : Implémenter TDE, MFA, ACL granulaires, pgAudit
│
├── 2. TRANSFERT (Externaliser) : Souscrire une cyber-assurance (Cyber Liability)
│
├── 3. TOLÉRANCE (Accepter) : Si le coût du traitement > impact attendu
│                              (Décision documentée et approuvée par la DG)
│
└── 4. ÉVITEMENT (Supprimer) : Supprimer l'actif ou l'activité exposée
```

---

## 2) Module — Directive NIS2 & Conformité COBAC/BEAC (2h)

### 📖 Narration/Intuition

La directive européenne **NIS2 (Network and Information Security - version 2)** (entrée en vigueur en octobre 2024) impose aux entités bancaires et aux infrastructures critiques des mesures de cybersécurité renforcées avec des sanctions pouvant atteindre **10 millions d'euros ou 2% du CA mondial**.

Bien que la BCC ne soit pas directement soumise à NIS2, ses partenaires et banques correspondantes européens exigent la démonstration d'un niveau équivalent. La **COBAC (Commission Bancaire de l'Afrique Centrale)** dispose de ses propres exigences de cybersécurité bancaire régionales.

### 🔍 Anatomie Technique

**Exigences minimales NIS2 pour les entités bancaires critiques :**

```
ART. 21 NIS2 — MESURES DE GESTION DES RISQUES REQUISES :
├── 1. Gestion des incidents et notification dans les 24h à l'autorité compétente
├── 2. Continuité des activités et plans de crise (BCP/DRP documentés et testés)
├── 3. Sécurité de la chaîne d'approvisionnement (SBOM, vetting des fournisseurs)
├── 4. Sécurité dans l'acquisition, le développement et la maintenance des systèmes (DevSecOps)
├── 5. Gestion des vulnérabilités et des correctifs (Patch Management < 30j)
├── 6. Politiques d'authentification forte (MFA, PAM) et contrôle d'accès
└── 7. Formation régulière des collaborateurs à la cybersécurité (Awareness)
```

---

## 3) Module — Automatisation GRC avec OpenRMF & Wazuh Compliance (2h)

### 📖 Narration/Intuition

La gestion manuelle (tableurs Excel) d'un référentiel de contrôles GRC avec des centaines de mesures ISO 27001, PCI-DSS et COBAC est impossible à l'échelle. Les outils GRC modernes (**OpenRMF, Wazuh Compliance Dashboard**) automatisent la collecte de preuves et le scoring de maturité des contrôles.

### 🔍 Anatomie Technique

**Configuration du module de conformité Wazuh pour ISO 27001 (`wazuh_iso27001.conf`) :**

```xml
<!-- Wazuh agent - active response et conformité ISO 27001 -->
<ossec_config>
  <syscheck>
    <!-- Vérification d'intégrité des fichiers système (A.12.5.1) -->
    <directories check_all="yes" report_changes="yes" realtime="yes">/etc,/bin,/sbin</directories>
    <alert_new_files>yes</alert_new_files>
  </syscheck>

  <rootcheck>
    <!-- Détection des rootkits et anomalies (A.12.6.1) -->
    <system_audit>/var/ossec/etc/shared/system_audit_rcl.txt</system_audit>
  </rootcheck>
</ossec_config>
```

---

## 🏅 Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **GRC** | Governance, Risk and Compliance — Gouvernance, risques et conformité |
| **SMSI** | Système de Management de la Sécurité de l'Information (ISO 27001) |
| **NIS2** | Network and Information Security Directive 2 — Directive UE cybersécurité 2024 |
| **COBAC** | Commission Bancaire de l'Afrique Centrale — Régulateur bancaire sous-régional |
| **PDCA** | Plan-Do-Check-Act — Cycle d'amélioration continue (Deming) |

---

## 🏋️ Exercices & Corrigés

**Exercice 1 :** Quelle est la différence entre un **risque résiduel** et un **risque inhérent** dans le cadre d'une analyse des risques ISO 27001 ?

**Corrigé :** Le **risque inhérent (ou brut)** est le niveau de risque évalué en l'absence de tout contrôle de sécurité. Il représente l'exposition maximale théorique. Le **risque résiduel** est le niveau de risque subsistant après l'application de tous les contrôles de sécurité choisis (ex: chiffrement, MFA, pare-feu). C'est le risque résiduel que la direction accepte formellement et documente dans le registre des risques. Si le risque résiduel dépasse le seuil d'appétit au risque de l'organisation, des contrôles supplémentaires doivent être implémentés.

**Exercice 2 :** Selon la directive **NIS2**, en combien de temps maximum une entité critique doit-elle notifier l'autorité nationale compétente suite à la détection d'un incident de cybersécurité significatif ?

**Corrigé :** La directive NIS2 impose un processus de notification en deux temps : une **notification précoce (Early Warning) dans les 24 heures** suivant la détection de l'incident, permettant à l'autorité de l'évaluer et d'activer d'éventuelles réponses nationales coordonnées. Ensuite, un **rapport d'incident complet dans les 72 heures** avec une description précise de la nature, de l'impact, des actions correctives et des informations techniques détaillées.

---

## ❓ Banque de Questions & Test du Jour

**Q1 :** Quel est le sigle désignant le cycle d'amélioration continue sur lequel repose le Système de Management de la Sécurité de l'Information (SMSI) ISO 27001 ?
- A) PDCA (Plan-Do-Check-Act)
- B) HDMI
- C) USB
- D) VGA

**Réponse : A**

**Q2 :** Quelle directive européenne entrée en vigueur en 2024 impose aux banques et infrastructures critiques des exigences renforcées de cybersécurité avec des sanctions pouvant dépasser 10 millions d'euros ?
- A) NIS2 (Network and Information Security Directive 2)
- B) MS-DOS
- C) HTML5
- D) WiFi 1.0

**Réponse : A**

**Q3 :** En matière de gestion des risques ISO 27001, que désigne la décision d'"Accepter" un risque résiduel ?
- A) Documenter formellement que le risque résiduel est inférieur à l'appétit au risque de l'organisation et que la direction accepte de ne pas le réduire davantage
- B) Ignorer définitivement le risque sans documentation
- C) Rembourser les victimes
- D) Redémarrer les serveurs

**Réponse : A**

**Q4 :** Quel outil de cybersécurité open-source dispose d'un tableau de bord de conformité permettant de mapper automatiquement les alertes de sécurité aux contrôles ISO 27001, PCI-DSS et HIPAA ?
- A) Wazuh (ou OpenRMF)
- B) Word
- C) Paint
- D) Solitaire

**Réponse : A**

**Q5 :** Dans l'Article 21 de la directive NIS2, quelle exigence oblige les entités bancaires à maintenir une liste de leurs fournisseurs logiciels et à auditer la sécurité de la chaîne d'approvisionnement ?
- A) Gestion de la sécurité de la chaîne d'approvisionnement (Supply Chain Security)
- B) Achat de nouvelles imprimantes
- C) Augmentation du Wi-Fi gratuit
- D) Mise à jour des écrans

**Réponse : A**

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
