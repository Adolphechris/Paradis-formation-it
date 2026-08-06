# TOME P5 — Cybersécurité Avancée & Red/Blue Team — Jour 249 (6h) : Réponse aux Incidents Majeurs & Crisis Management (Gestion de Crise Cyber COMEX/Board Level, Communication de Crise, Plan de Continuité d'Activité PCA & Rétro-Ingénierie de Crise)

> [!NOTE]
> **Objectif du jour :** Maîtriser la **Gestion de Crise Cyber à haut niveau (Crisis Management)** : organisation de la Cellule de Crise au niveau COMEX/Direction Générale, communication de crise interne et externe (presse, régulateurs, CNIL), déclenchement et arbitrage du **Plan de Continuité d'Activité (PCA)** et du **Plan de Reprise d'Activité (PRA)**, et conduite des rétro-ingénieries d'urgence lors d'attaques d'envergure nationale ou internationale.
>
> **Compétences visées :** `SEC-06` (A) — Executive Cyber Crisis Management & COMEX Steering | `POL-03` (A) — Crisis Communication Regulatory Notification (RGPD 72h / NIS 2 24h) & BCP/DRP Activation

---

## 1) Module — Organisation de la Cellule de Crise Cyber & Gouvernance (2h)

### 📖 Narration/Intuition

Lorsqu'une entreprise ou une institution est victime d'une cyberattaque par ransomware paralysant l'ensemble de ses systèmes d'information (ex: attaques contre Bouygues Construction, Altran, ou le système de santé), la réponse n'est plus uniquement technique. Elle devient une **crise d'entreprise globale** qui implique la Direction Générale, les juristes, la communication, la DRH et les équipes métiers.

La **Cellule de Crise Cyber** doit fonctionner selon des rôles et des règles de gouvernance strictement préparés à l'avance.

### 🔍 Anatomie Technique

**Structure d'une Cellule de Crise Cyber d'Entreprise :**

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      ORGANISATION DE LA CELLULE DE CRISE                     │
├─────────────────────────────────────────────────────────────────────────────┤
│  CELLULE STRATÉGIQUE (Cellule Décisionnelle / COMEX)                        │
│  ├── CEO / Directeur Général (Président de la crise)                        │
│  ├── CISO / RSSI (Rapporteur technique & statut d'incident)                 │
│  ├── Directeur Juridique (Conformité RGPD 72h, obligations légales)         │
│  └── Directeur de la Communication (Gestion presse, réseaux sociaux)       │
├─────────────────────────────────────────────────────────────────────────────┤
│  CELLULE OPÉRATIONNELLE / TECHNIQUE (CERT / CSIRT / IT Ops)                 │
│  ├── Lead Incident Responder (Pilote des investigations DFIR)               │
│  ├── Lead Infrastructure / Cloud (Isolement & Restauration)                 │
│  └── Expert Forensique (Analyse de la cause racine / Root Cause)            │
├─────────────────────────────────────────────────────────────────────────────┤
│  CELLULE MÉTIER / CONTINUITÉ (PCA)                                           │
│  ├── Directeurs Métiers (Mise en œuvre des modes dégradés papier/secours)   │
│  └── Responsable PCA (Plan de Continuité d'Activité)                        │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2) Module — Communication de Crise & Notifications Réglementaires (2h)

### 📖 Narration/Intuition

L'un des plus grands risques lors d'une crise cyber est la **perte de contrôle de la communication**. Une mauvaise déclaration publique ou le non-respect des délais de notification légaux (ex: **72 heures maximum** pour notifier la CNIL selon le RGPD, ou **24 heures** pour NIS 2) peut entraîner des amendes records et détruire la réputation de l'organisation.

### 🛠️ Atelier Pratique

**Matrice des Délais de Notification Légaux en Cas d'Incident Majeur (`crisis_notification_matrix.md`) :**

```markdown
# MATRICE DE NOTIFICATION D'INCIDENT CYBER DE CRISE

| Régulateur / Autorité | Délais Impératifs | Document Requis | Responsable |
|:----------------------|:------------------|:----------------|:------------|
| CNIL (RGPD Art. 33)   | ≤ 72 Heures       | Notification de violation de données | Juridique / DPO |
| ANSSI / NIS 2         | ≤ 24 Heures       | Alerte précoce (Early Warning)       | CISO / RSSI     |
| Clients / Public      | Sans délai indu   | Communiqué de presse officiel        | Comms Team     |
| Assureur Cyber        | ≤ 24-48 Heures    | Déclaration de sinistre cyber        | DAF / Finance   |

## Exemple de Communiqué de Presse de Crise (Format Standard ANSSI/OWASP) :
"Le [Date], notre organisation a identifié un incident de sécurité affectant une partie de nos systèmes d'information.
Nos équipes techniques et des experts externes en cybersécurité ont immédiatement isolé les systèmes touchés et engagé les mesures de confinement.
Les autorités compétentes ont été notifiées. Nos activités se poursuivent en mode dégradé sécurisé."
```

---

## 3) Module — Arbitrage PCA / PRA & Exercice de Simulation de Crise (2h)

### 🛠️ Atelier Pratique

**Script d'Orchestration et d'Arbitrage de Crise (`crisis_sim.py`) :**

```python
# Outil de simulation et d'aide à la décision en Cellule de Crise

class CrisisDecisionEngine:
    def __init__(self, incident_type: str, encrypted_systems_ratio: float):
        self.incident_type = incident_type
        self.ratio = encrypted_systems_ratio

    def evaluate_action(self):
        print(f"⚠️ ÉVALUATION DE CRISE : Incident={self.incident_type} | Systèmes touchés={self.ratio*100}%")
        
        if self.ratio > 0.50:
            print("🚨 DÉCISION COMEX : BASCULE EN MODE DÉGRADÉ MAJEUR (PCA).")
            print("👉 Action 1 : Couper toutes les liaisons réseau WAN et d'interconnexion.")
            print("👉 Action 2 : Interdiction stricte de payer toute rançon (Recommandation ANSSI/FBI).")
            print("👉 Action 3 : Activer la restauration Cleanroom à partir des backups WORM immuables.")
        else:
            print("🟠 DÉCISION COMEX : CONFINEMENT CIBLÉ.")

if __name__ == "__main__":
    crisis = CrisisDecisionEngine(incident_type="Ransomware-Enterprise", encrypted_systems_ratio=0.75)
    crisis.evaluate_action()
```

---

## 🏅 Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **COMEX** | Comité Exécutif — Instance de direction stratégique de l'entreprise |
| **PCA** | Plan de Continuité d'Activité — Procédures maintenant les opérations en mode dégradé |
| **DPO** | Data Protection Officer — Délégué à la Protection des Données (RGPD) |
| **CNIL** | Commission Nationale de l'Informatique et des Libertés (Autorité RGPD) |

---

## 🏋️ Exercices & Corrigés

**Exercice 1 :** Quel est le délai maximal accordé par le **RGPD (Article 33)** pour notifier une violation de données à caractère personnel à l'autorité de contrôle (ex: CNIL) ?

**Corrigé :** Le RGPD exige que toute violation de données personnelles présentant un risque pour les droits et libertés des personnes soit notifiée à l'autorité de contrôle au plus tard **72 heures** après en avoir pris connaissance. Si la notification ne peut pas être complète dans ce délai, une notification initiale doit être faite dans les 72h, suivie d'informations complémentaires fournies de manière échelonnée.

**Exercice 2 :** Pourquoi la position officielle des autorités de sécurité (ANSSI, FBI, Europol) est-elle d'**interdire formellement le paiement des rançons** lors d'une attaque par ransomware ?

**Corrigé :** L'interdiction du paiement des rançons s'explique par trois raisons majeures : (1) **Aucune garantie** : Payer ne garantit pas d'obtenir une clé de déchiffrement fonctionnelle ni que les données ne seront pas re-vendues. (2) **Financement du cybercrime** : Le paiement finance et entretient le modèle économique des groupes criminels. (3) **Sur-ciblage** : Les entreprises qui paient sont ré-identifiées comme des proies faciles et subissent souvent une seconde attaque dans les mois qui suivent.

---

## ❓ Banque de Questions & Test du Jour

**Q1 :** Dans une cellule de crise cyber, qui doit assurer la présidence et prendre les arbitrages stratégiques majeurs (comme l'arrêt de production) ?
- A) Le CEO / Directeur Général au niveau COMEX
- B) L'analyste SOC de garde
- C) Le développeur de l'application
- D) Le prestataire informatique externe

**Réponse : A**

**Q2 :** Quel est le délai légal d'alerte précoce (Early Warning) imposé par la directive **NIS 2** en cas d'incident de sécurité majeur ?
- A) 24 heures
- B) 30 jours
- C) 6 mois
- D) Aucun délai

**Réponse : A**

**Q3 :** Que signifie le déclenchement du **PCA (Plan de Continuité d'Activité)** lors d'une crise cyber ?
- A) La mise en œuvre des procédures dégradées (ex: processus manuels/papier) pour maintenir les services essentiels pendant que le SI est indisponible
- B) L'achat de nouveaux serveurs
- C) La réinitialisation des mots de passe de tous les clients
- D) La fermeture définitive de l'entreprise

**Réponse : A**

**Q4 :** Quelle est la recommandation ferme des autorités de cybersécurité (ANSSI/FBI) en cas de chantage au ransomware ?
- A) Ne jamais payer la rançon
- B) Payer immédiatement la moitié de la somme
- C) Négocier une réduction sur Telegram
- D) Offrir des bitcoins aux attaquants

**Réponse : A**

**Q5 :** Quel rôle au sein de l'entreprise est responsable de la notification formelle de la violation de données à la CNIL sous 72h ?
- A) Le DPO / Service Juridique
- B) Le stagiaire informatique
- C) Le Webmaster
- D) L'administrateur réseau

**Réponse : A**

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
