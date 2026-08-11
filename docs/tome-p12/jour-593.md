# TOME P12 — Architecture Ultime, Leadership Technique & Capstone Final — Jour 593 (6h) : Knowledge Sharing & Conférences — CFP, Talk Prep, Demo Day & OSS Contribution

> [!NOTE]
> **Objectifs pédagogiques :**
> - Maîtriser l'art du **Knowledge Sharing d'entreprise** : Tech Talks internes, BBL (Brown Bag Lunches), Guildes techniques
> - Rédiger une **CFP (Call For Papers)** convaincante pour intervenir dans une conférence tech majeure (KubeCon, Devoxx, AWS Summit, USENIX)
> - Structurer une **présentation technique captivante** avec démonstration en direct (Live Demo) sans effet démo défavorable
> - Contribuer activement à l'écosystème **Open Source (OSS)** et valoriser son impact au sein de la communauté mondiale
>
> **Compétences visées :** `POL-03` (A), `PRO-01` (A) — Public Speaking, Knowledge Sharing, Open Source Advocacy

---

## Module 1 — Culture de Partage d'Entreprise & BBL (2h)

### 📖 Développer une Culture Engineering de Premier Ordre

Dans les plus grandes organisations tech (Google, Spotify, Netflix), le partage de connaissances est un **facteur multiplicateur de performance**. Un savoir qui reste isolé dans la tête d'un ingénieur est un risque organisationnel (Single Point of Failure humain).

```
LES 4 FORMATS DE PARTAGE INTERNE EN ENTREPRISE

  1. BBL (Brown Bag Lunch) / Tech Lunch (45 min)
     - Format informel pendant le déjeuner (présentation + Q&R).
     - Objectif : Faire découvrir une nouvelle techno ou un retour d'expérience projet.

  2. GUILDES / COMMUNAUTÉS DE PRATIQUE (CoP)
     - Groupes transversaux d'experts (ex: Guilde Sécurité, Guilde Cloud & K8s).
     - Rôle : Définir les standards d'ingénierie et aligner les pratiques.

  3. INTERNAL TECH TALKS & DEMO DAY
     - Célébration trimestrielle où les équipes présentent leurs réalisations.

  4. POST-MORTEMS PUBLICS INTERNES
     - Partage des leçons apprises des pannes pour que toute l'organisation en bénéficie.
```

---

## Module 2 — Rédiger une CFP & Réussir une Live Demo (2h)

### 🔍 Anatomie d'une CFP (Call For Papers) Sélectionnée

Les comités de sélection de conférences reçoivent des centaines de propositions pour quelques slots disponibles. Votre CFP doit se démarquer dès les premières lignes.

```
STRUCTURE D'UNE CFP DE NIVEAU KUBECON / DEVOXX

  TITRE (Accrocheur & Spécifique)
  ❌ "Introduction à la sécurité Kubernetes"
  ✅ "How We Blocked 100k Attacks/sec on K8s Using eBPF and Falco without Latency Overhead"

  ABSTRACT / DESCRIPTION (200-300 mots)
  - Le Problème : Quelle difficulté réelle et massive l'industrie rencontre-t-elle ?
  - La Solution : Quelle approche novatrice avez-vous mise en place ?
  - Les Résultats : Métriques réelles (chiffres d'impact).
  - Ce que l'audience emportera (Takeaways) : 3 enseignements directement applicables.

  RÈGLES D'OR DE LA LIVE DEMO (Sans "Effet Démo")
  1. TOUJOURS avoir un script d'enregistrement vidéo de secours en local.
  2. Ne jamais dépendre d'une connexion Wi-Fi publique de conférence (utiliser hotspot dédié).
  3. Pré-charger les images Docker et les caches.
  4. Utiliser des terminaux à grande police (> 20pt) avec thème sombre/clair très lisible.
```

---

## Module 3 — Atelier Pratique : CFP Scorer & Live Demo Script (1h30)

### 🛠️ Script Python : CFP Submission Assessor & Live Demo Guard

```python
#!/usr/bin/env python3
"""
PARADIS — CFP Submission Assessor & Live Demo Safety Script
Évalue la probabilité de sélection d'une CFP de conférence et génère une checklist de sécurité pour Live Demo.
"""
from dataclasses import dataclass
from typing import List, Dict

@dataclass
class CFPSubmission:
    title               : str
    abstract            : str
    target_conference   : str
    has_live_demo       : bool
    has_metrics         : bool
    takeaways_count     : int

class CFPEvaluator:
    """Évaluateur de proposition de conférence (Call For Papers)"""

    POWER_VERBS = ["built", "reduced", "scaled", "stopped", "optimized", "migrated", "automated", "benchmarked"]

    def evaluate(self, cfp: CFPSubmission) -> dict:
        score = 0
        feedback = []

        # 1. Analyse du titre
        title_lower = cfp.title.lower()
        if len(cfp.title) >= 30 and ("how" in title_lower or "why" in title_lower or "using" in title_lower):
            score += 25
            feedback.append("✅ Titre engageant et orienté résultat")
        else:
            feedback.append("💡 Titre trop court ou générique — utiliser 'How We...', 'Why...'")

        # 2. Présence de métriques chiffrées dans l'abstract
        if cfp.has_metrics:
            score += 25
            feedback.append("✅ Présence de métriques chiffrées (impact quantifié)")
        else:
            feedback.append("💡 Ajouter des chiffres réels (ex: '60% cost reduction', '100k QPS')")

        # 3. Présence de Live Demo
        if cfp.has_live_demo:
            score += 20
            feedback.append("✅ Live Demo annoncée — très apprécié des comités KubeCon/Devoxx")

        # 4. Nombre de Takeaways clairs
        if cfp.takeaways_count >= 3:
            score += 30
            feedback.append(f"✅ {cfp.takeaways_count} enseignements clés identifiés pour l'audience")
        else:
            feedback.append("💡 Lister au moins 3 takeaways explicites pour l'audience")

        rating = "🌟 EXCELLENTE CFP (Top 5%)" if score >= 85 else "✅ BONNE CFP" if score >= 60 else "🔴 À AMÉLIORER"
        return {"score": score, "rating": rating, "feedback": feedback}

class LiveDemoSafetyChecklist:
    """Génère la checklist de sécurité pour intervention en conférence"""

    @staticmethod
    def generate_checklist() -> List[str]:
        return [
            "📹 Enregistrement vidéo mp4 de secours prêt et testé localement",
            "📶 Hotspot 5G personnel configuré (ne pas compter sur le Wi-Fi conférence)",
            "🖥️ Resolution écran fixée à 1080p, police terminal > 22pt",
            "🐋 Images Docker pré-pullées (`docker pull`) localement",
            "🔕 Mode 'Ne pas déranger' (Do Not Disturb) activé sur l'OS",
            "🔋 Chargeur PC branché",
        ]


if __name__ == "__main__":
    print("=== PARADIS — CFP SCORER & LIVE DEMO SAFETY ===\n")

    submission = CFPSubmission(
        title = "How We Scaled Our Kubernetes Ingress to 500k QPS with Zero Packet Loss",
        abstract = "In this talk, we share our real-world experience migrating our edge infrastructure to eBPF and Cilium. We reduced P99 latency by 45ms and saved $120k/year in cloud bandwidth costs.",
        target_conference = "KubeCon EU 2027",
        has_live_demo = True,
        has_metrics = True,
        takeaways_count = 3
    )

    evaluator = CFPEvaluator()
    res       = evaluator.evaluate(submission)

    print(f"🎤 Conférence Target : {submission.target_conference}")
    print(f"📌 Titre : {submission.title}")
    print(f"📊 Score CFP         : {res['score']}/100 — {res['rating']}\n")
    for f in res["feedback"]:
        print(f"  {f}")

    print("\n" + "─"*70 + "\n")

    print("🛡️ CHECKLIST DE SÉCURITÉ LIVE DEMO :")
    for item in LiveDemoSafetyChecklist.generate_checklist():
        print(f"  {item}")
```

---

## Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **CFP** | Call For Papers — Appel à propositions d'interventions pour une conférence |
| **BBL** | Brown Bag Lunch — Session de partage technique pendant la pause déjeuner |
| **CoP** | Community of Practice — Communauté de pratique réunissant des passionnés d'un même sujet |

---

## Exercices Pratiques

### Exercice 1 — Rédaction de Titre et Takeaways de CFP

Proposez un titre et 3 takeaways pour un sujet de conférence traitant de la **gestion des coûts Kubernetes avec KEDA et Spot Instances**.

**Corrigé :**
- **Titre proposé :** *"How We Cut Our Production Kubernetes Bill by 65% Using KEDA and Spot Fleet Auto-Scaling"*
- **Takeaways pour l'audience :**
  1. *Comment configurer KEDA pour scaler des deployments basés sur le lag de queues Kafka.*
  2. *Comment gérer l'interruption des instances Spot en < 30 secondes sans perte de requêtes.*
  3. *Le tableau de bord FinOps open-source pour suivre le ROI en temps réel.* ✅

---

## Banque QCM — 5 Questions

**Q1.** Qu'est-ce qu'une **CFP (Call For Papers)** dans le monde des conférences informatiques ?

- A) Une demande de remboursement de papier.
- B) Un appel à soumettre des propositions de présentations ou d'ateliers techniques devant un comité de sélection. ✅
- C) Un rapport financier annuel.
- D) Un format de fichier d'impression.

**Q2.** Quelle est la règle de sécurité numéro 1 lors d'une **Live Demo** en conférence pour éviter l'effet démo ?

- A) Compter uniquement sur le Wi-Fi de la salle.
- B) Avoir toujours une vidéo d'enregistrement de secours et des images/dépendances pré-chargées localement. ✅
- C) Ne pas tester la démo avant de monter sur scène.
- D) Écrire tout le code en direct sans copier-coller.

**Q3.** Quel est le format d'échange technique informel organisé généralement entre collègues pendant le déjeuner ?

- A) Hackathon
- B) BBL (Brown Bag Lunch) ✅
- C) Board Meeting
- D) Standup meeting

**Q4.** Dans le résumé d'une CFP, qu'est-ce qui augmente le plus la chance d'acceptation par le comité KubeCon ou Devoxx ?

- A) L'absence de code.
- B) La présence de métriques réelles d'impact (chiffres) et de takeaways immédiatement exploitables pour l'audience. ✅
- C) Utiliser uniquement des mots pompeux.
- D) Écrire le résumé en une seule phrase.

**Q5.** Quel est le rôle d'une **Guilde Technique (Community of Practice)** dans une entreprise tech ?

- A) Gérer la paie des employés.
- B) Réunir transversalement les ingénieurs d'un même domaine (ex: Sécurité, Cloud) pour partager le savoir et établir des standards communs. ✅
- C) Vendre du matériel informatique.
- D) Organiser les soirées d'entreprise.

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
