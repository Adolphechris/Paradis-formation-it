# TOME P11 — DevSecOps, Cloud Security & Gouvernance — Jour 534 (6h) : Ingénierie Sociale & Sensibilisation Anti-Phishing : Pretexting, Vishing, Phishing Simulé & Plateforme KnowBe4

> [!NOTE]
> **Objectifs pédagogiques :**
> - Comprendre la psychologie humaine et les vecteurs d'attaque d'**Ingénierie Sociale (Social Engineering)**
> - Différencier les techniques d'attaque : Spear Phishing, Pretexting, Vishing (Phishing vocal) et Smishing (SMS)
> - Concevoir et orchestrer des campagnes de **Phishing Simulé** d'entreprise avec GoPhish / KnowBe4
> - Mesurer et faire baisser le taux de clic (**Phish-Prone Percentage**) à travers des programmes de formation continus
>
> **Compétences visées :** `SEC-04` (A), `SEC-06` (A) — Human Risk Management & Social Engineering

---

## Module 1 — Psychologie de l'Ingénierie Sociale & Vecteurs d'Attaque (2h)

### 📖 Intuition & Narration

Les pare-feux les plus sophistiqués, le chiffrement le plus robuste et les clusters Kubernetes les mieux hardenés ne peuvent rien si un utilisateur légitime saisit volontairement ses identifiants sur une page de phishing après avoir reçu un e-mail qui semble provenir de son PDG ou du service RH.

L'**Ingénierie Sociale** exploite le "facteur humain" en manipulant les biais psychologiques naturels de la cible :
1. **L'Urgence** ("Votre compte sera clôturé dans 2 heures !").
2. **L'Autorité** ("Demande urgente de virement émanant du Directeur Général").
3. **La Peur / La Rareté** ("Sanction financière si vous ne remplissez pas le formulaire immédiatement").
4. **La Confiance / La Sympathie** ("Support technique IT proposant de débloquer votre imprimante").

### 4. Typologie des Attaques Humaines

```
VECTEURS D'INGÉNIERIE SOCIALE (SOCIAL ENGINEERING)

  ┌────────────────────────────────────────────────────────────────────────┐
  │ ATTAQUE           │ VECTEUR & DESCRIPTION                              │
  ├───────────────────┼────────────────────────────────────────────────────┤
  │ Spear Phishing    │ E-mail ciblé et personnalisé vers un individu/poste│
  │ Whaling           │ Phishing ciblant la haute direction (CEO, CFO)     │
  │ Vishing           │ Phishing téléphonique (Voice Phishing / Deepfake)  │
  │ Smishing          │ Phishing par SMS mobile (faux SMS de livraison/banq│
  │ Pretexting        │ Création d'un scénario fictif crédible pour l'audit│
  │ Baiting           │ Clé USB piégée abandonnée sur le parking          │
  └────────────────────────────────────────────────────────────────────────┘
```

---

## Module 2 — Atelier Pratique : Simulator de Campagne Phishing & Phish-Prone Metric (2h)

### 🛠️ Code Python : Phishing Campaign Metric Engine & Phish-Prone Calculator

```python
#!/usr/bin/env python3
"""
PARADIS — Simulated Phishing Campaign Manager & Phish-Prone Percentage Calculator
Analyse les résultats d'une campagne de phishing simulée et calcule le niveau de risque humain.
"""

import json
import sys
from dataclasses import dataclass
from typing import List

@dataclass
class EmployeePhishingResult:
    employee_id: str
    department: str
    email_opened: bool
    link_clicked: bool
    credentials_submitted: bool
    reported_to_soc: bool

class PhishingCampaignAnalyzer:
    def __init__(self, campaign_name: str, results: List[EmployeePhishingResult]):
        self.campaign_name = campaign_name
        self.results = results

    def calculate_phish_prone_percentage(self) -> dict:
        print(f"=== ANALYSE DE LA CAMPAGNE DE PHISHING SIMULÉ : {self.campaign_name} ===")
        total_employees = len(self.results)
        clicked_count = sum(1 for r in self.results if r.link_clicked)
        submitted_count = sum(1 for r in self.results if r.credentials_submitted)
        reported_count = sum(1 for r in self.results if r.reported_to_soc)

        phish_prone_pct = (clicked_count / total_employees * 100) if total_employees > 0 else 0.0
        compromise_pct = (submitted_count / total_employees * 100) if total_employees > 0 else 0.0
        report_rate_pct = (reported_count / total_employees * 100) if total_employees > 0 else 0.0

        print(f"[*] Total collaborateurs ciblés : {total_employees}")
        print(f"[*] E-mails ouverts             : {sum(1 for r in self.results if r.email_opened)}")
        print(f"[*] Clics sur le lien piégé     : {clicked_count} ({phish_prone_pct:.1f}%)")
        print(f"[*] Identifiants soumis         : {submitted_count} ({compromise_pct:.1f}%)")
        print(f"[*] Signalements au SOC         : {reported_count} ({report_rate_pct:.1f}%) ✅")

        # Analyse par département
        dept_stats = {}
        for r in self.results:
            if r.department not in dept_stats:
                dept_stats[r.department] = {"total": 0, "clicked": 0}
            dept_stats[r.department]["total"] += 1
            if r.link_clicked:
                dept_stats[r.department]["clicked"] += 1

        print("\n--- PHISH-PRONE PERCENTAGE PAR DÉPARTEMENT ---")
        for dept, data in dept_stats.items():
            rate = (data["clicked"] / data["total"] * 100) if data["total"] > 0 else 0.0
            print(f"  📌 {dept:<20s} : {rate:>5.1f}% de clics ({data['clicked']}/{data['total']})")

        return {
            "campaign_name": self.campaign_name,
            "phish_prone_percentage": round(phish_prone_pct, 1),
            "compromise_rate": round(compromise_pct, 1),
            "soc_reporting_rate": round(report_rate_pct, 1),
            "target_reached": phish_prone_pct <= 5.0 # Objectif entreprise < 5% de clics
        }

if __name__ == "__main__":
    results_list = [
        EmployeePhishingResult("EMP-01", "Finance", True, True, True, False),
        EmployeePhishingResult("EMP-02", "Finance", True, False, False, True),
        EmployeePhishingResult("EMP-03", "IT / DevSecOps", True, False, False, True),
        EmployeePhishingResult("EMP-04", "Ressources Humaines", True, True, False, False),
        EmployeePhishingResult("EMP-05", "Commercial", True, True, True, False),
        EmployeePhishingResult("EMP-06", "IT / DevSecOps", False, False, False, True),
        EmployeePhishingResult("EMP-07", "Commercial", True, True, False, False),
        EmployeePhishingResult("EMP-08", "Ressources Humaines", True, False, False, True)
    ]

    analyzer = PhishingCampaignAnalyzer("Campagne Q2 - Faux Fichier de Paie RH", results_list)
    summary = analyzer.calculate_phish_prone_percentage()

    print("\n" + "═"*75)
    print(f"  RÉSULTAT GLOBAL PHISH-PRONE : {summary['phish_prone_percentage']}%")
    print("═"*75)
    if not summary["target_reached"]:
        print("[⚠️ RISQUE HUMAIN ÉLEVÉ] Le taux de clic dépasse le seuil cible de 5%. Formation obligatoire requise.")
```

---

## Module 3 — Culture de Sécurité & Bouton de Signalement SOC (1h30)

### 🔍 Transformation de la Culture : Du Maillon Faible au Premier Rempart

Un programme de sensibilisation efficace (ex: **KnowBe4**, **PhishInsight**) ne cherche pas à punir les employés qui cliquent, mais à créer une **culture positive du signalement**.

Le déploiement d'un **Phish Alert Button (PAB)** dans le client de messagerie (Outlook/Gmail) permet à chaque collaborateur de signaler un e-mail suspect au SOC en un clic.

---

## Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **Whaling** | Attaque de Phishing ciblant spécifiquement la haute direction (CEOs) |
| **Vishing** | Voice Phishing — Phishing réalisé par appel téléphonique |
| **Smishing** | SMS Phishing — Phishing réalisé par message texte SMS |
| **PPP** | Phish-Prone Percentage — Pourcentage de collaborateurs vulnérables au Phishing |
| **PAB** | Phish Alert Button — Bouton de signalement d'e-mail suspect dans la messagerie |

---

## Exercices Pratiques

### Exercice 1 — Identification d'un Vecteur d'Attaque

Un collaborateur reçoit un SMS sur son téléphone pro : *"Banque PARADIS : Votre compte a été temporairement restreint. Cliquez ici pour débloquer : https://paradis-unblock.info"*.
De quel type d'attaque d'ingénierie sociale s'agit-il ?

**Corrigé guidé :**
Il s'agit d'une attaque de **Smishing (SMS Phishing)**.

---

## Banque QCM — 5 Questions

**Q1.** Qu'est-ce que l'**Ingénierie Sociale (Social Engineering)** en cybersécurité ?

- A) La conception de réseaux sociaux.
- B) L'art de manipuler psychologiquement des individus pour les amener à réaliser des actions compromettantes ou à divulguer des informations confidentielles. ✅
- C) La réparation de câbles fibre optique.
- D) L'écriture de scripts Python.

**Q2.** Que désigne le terme **Whaling** ?

- A) La pêche à la baleine.
- B) Une forme hautement ciblée de Spear Phishing visant spécifiquement les hauts dirigeants (CEO, CFO, CISO) d'une entreprise. ✅
- C) L'envoi d'e-mails à 1 million de personnes au hasard.
- D) Le chiffrement de disques durs.

**Q3.** Que mesure l'indicateur **Phish-Prone Percentage (PPP)** ?

- A) La vitesse d'ouverture des e-mails.
- B) Le pourcentage d'employés d'une organisation qui succombent à une simulation de phishing en cliquant sur un lien piégé. ✅
- C) Le nombre d'e-mails envoyés par jour.
- D) Le coût des serveurs de messagerie.

**Q4.** Quel est le rôle principal d'un **Phish Alert Button (PAB)** intégré dans Outlook/Gmail ?

- A) Effacer tous les e-mails de la boîte de réception.
- B) Permettre aux collaborateurs de signaler instantanément un e-mail suspect à l'équipe SOC d'un seul clic. ✅
- C) Répondre automatiquement au destinataire.
- D) Bloquer les appels téléphoniques.

**Q5.** Quelle attaque consiste à téléphoner à un collaborateur en se faisant passer pour un technicien du support informatique afin de lui soutirer son mot de passe ?

- A) Smishing.
- B) Vishing (Voice Phishing / Pretexting téléphonique). ✅
- C) Dumpster Diving.
- D) Buffer Overflow.

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
