# TOME P11 — DevSecOps, Cloud Security & Gouvernance — Jour 539 (6h) : Réponse aux Incidents Avancée : Playbooks IR, Gestion de Crise Cyber & Communication de Crise

> [!NOTE]
> **Objectifs pédagogiques :**
> - Structurer un **programme de Réponse aux Incidents (IR)** conforme au NIST SP 800-61r2 et à la norme ISO/IEC 27035
> - Rédiger un **Playbook IR** opérationnel pour des scénarios de cyberattaque critiques (Ransomware, Compromission de compte Admin, Fuite de données)
> - Maîtriser la **chaîne de commandement et les rôles** en cellule de crise cyber : RSSI, DPO, DSI, Communication, Direction
> - Appliquer les principes de **Communication de Crise** : timeline, porte-parole, notification aux autorités (CNIL, ANSSI)
>
> **Compétences visées :** `SEC-08` (A), `POL-03` (A) — Incident Response, Crisis Management

---

## Module 1 — Structure d'un Programme IR & Playbooks (2h)

### 📖 Intuition & Narration

Une cyberattaque majeure est une catastrophe imprévisible, mais sa **réponse** doit être parfaitement prévisible. Les sapeurs-pompiers ne décident pas de la stratégie à adopter face à un incendie en voyant les flammes : ils ont des procédures standardisées, des rôles attribués à l'avance, et du matériel prêt à l'emploi.

Un **Playbook IR (Incident Response Playbook)** est l'équivalent du manuel d'intervention du pompier pour le cyberdéfenseur. Il décrit, étape par étape, les actions à exécuter dans les premières minutes, heures, et jours suivant la détection d'une attaque spécifique.

La norme **NIST SP 800-61r2** structure le cycle de vie IR en 4 phases :

```
CYCLE DE VIE DE LA RÉPONSE AUX INCIDENTS (NIST SP 800-61r2)

  ┌────────────────────────────────────────────────────────────────────┐
  │  1. PRÉPARATION         │  Plans IR, Playbooks, formation, outils  │
  │  2. DÉTECTION & ANALYSE │  SIEM/UEBA, forensique, évaluation impact│
  │  3. CONTAINMENT,        │  Isolation des systèmes, suppression de  │
  │     ERADICATION &       │  la menace, restauration des services     │
  │     RECOVERY            │                                          │
  │  4. POST-INCIDENT       │  Rapport, leçons apprises, amélioration  │
  └────────────────────────────────────────────────────────────────────┘
```

### 🔍 Playbook IR — Scénario Ransomware (Exemple Complet)

```markdown
# PLAYBOOK IR — RANSOMWARE (VERSION PARADIS IT v2.0)
# Criticité : CRITIQUE | Délai de confinement cible : < 30 minutes

## PHASE 1 : DÉTECTION (T+0)
[ ] Alerte SIEM reçue : détection de chiffrement de masse de fichiers
[ ] Identifier le(s) serveur(s) affecté(s) : hostname, IP, segment réseau
[ ] Confirmer les marqueurs ransomware : extension de fichiers modifiée, README.txt, ombre VSS supprimée
[ ] Escalader IMMÉDIATEMENT au RSSI, DSI et à la Direction

## PHASE 2 : CONFINEMENT IMMÉDIAT (T+5 à T+30 minutes)
[ ] ISOLER les machines infectées du réseau (déconnecter le câble LAN ou désactiver le port switch)
[ ] BLOQUER l'accès au(x) domaine(s) C2 identifiés sur le pare-feu périmétrique
[ ] DÉSACTIVER les comptes Active Directory compromis (notamment les comptes de service)
[ ] NOTIFIER la cellule de crise (RSSI, DPO, DSI, Communication)
[ ] PRÉSERVER les preuves : capturer l'image mémoire AVANT d'éteindre les machines

## PHASE 3 : INVESTIGATION & ÉRADICATION (T+1h à T+24h)
[ ] Analyser les logs SIEM pour déterminer le Patient Zéro (premier système infecté)
[ ] Identifier le vecteur d'entrée (phishing, VPN vulnérable, RDP exposé...)
[ ] Rechercher la persistance (tâches planifiées, registre, services, backdoors)
[ ] Scanner TOUS les systèmes avec EDR (Falcon/Defender) pour cartographier l'étendue

## PHASE 4 : RESTAURATION (T+24h à T+72h)
[ ] Restaurer depuis les sauvegardes hors-ligne (VEEAM/Barracuda) pour les systèmes critiques
[ ] Reconstruire les systèmes compromis DEPUIS ZÉRO (ne pas restaurer l'OS infecté)
[ ] Réinitialiser TOUS les mots de passe et secrets (AD, comptes de service, clés API)
[ ] Déployer des correctifs pour le vecteur d'entrée identifié

## PHASE 5 : POST-INCIDENT (T+72h à T+30 jours)
[ ] Rédiger le rapport d'incident (timeline, impact, actions de remédiation)
[ ] Notifier la CNIL dans les 72h si des données personnelles ont été compromises
[ ] Notifier l'ANSSI si l'organisation est un OIV/OSE
[ ] Réaliser un Lessons Learned Meeting (30 jours post-incident)
[ ] Mettre à jour le Playbook et les défenses techniques
```

---

## Module 2 — Gestion de Crise Cyber & Rôles (2h)

### 🔍 Anatomie de la Cellule de Crise Cyber

```
ORGANISATION DE LA CELLULE DE CRISE CYBER — PARADIS FINANCE

  ┌──────────────────────────────────────────────────────────────────────┐
  │  RÔLE             │ RESPONSABILITÉS EN CRISE                         │
  ├───────────────────┼──────────────────────────────────────────────────┤
  │  RSSI             │ Pilote technique IR, valide les actions de        │
  │ (Incident Lead)   │ confinement, interface avec ANSSI, arbitre les   │
  │                   │ décisions techniques                              │
  ├───────────────────┼──────────────────────────────────────────────────┤
  │  DPO              │ Évalue l'impact sur les données personnelles,     │
  │ (Data Officer)    │ prépare la notification CNIL, documente le RGPD  │
  ├───────────────────┼──────────────────────────────────────────────────┤
  │  DSI              │ Alloue les ressources IT, valide les décisions    │
  │ (IT Lead)         │ de coupure réseau, interface avec les équipes ops │
  ├───────────────────┼──────────────────────────────────────────────────┤
  │  Communication    │ Rédige les messages internes/externes, gère le    │
  │ (porte-parole)    │ contact presse, prépare la déclaration publique   │
  ├───────────────────┼──────────────────────────────────────────────────┤
  │  Direction        │ Prend les décisions d'impact business (coupure    │
  │ (COMEX)           │ de service, paiement rançon refusé, dépôt plainte)│
  └──────────────────────────────────────────────────────────────────────┘
```

### 🛠️ Atelier Pratique — Simulation de Timeline d'Incident

```python
#!/usr/bin/env python3
"""
PARADIS — IR Timeline Tracker
Outil de suivi chronologique d'un incident de sécurité en cours.
"""
from datetime import datetime, timedelta
from dataclasses import dataclass, field
from typing import List

@dataclass
class IREvent:
    timestamp: datetime
    phase: str           # DETECTION | CONFINEMENT | INVESTIGATION | RESTAURATION | POST-INCIDENT
    actor: str           # Qui a pris l'action (RSSI, SOC_L2, DSI, DPO...)
    action: str
    evidence: str = ""

class IRTimeline:
    def __init__(self, incident_id: str, incident_type: str):
        self.incident_id = incident_id
        self.incident_type = incident_type
        self.t0 = datetime.now()
        self.events: List[IREvent] = []
        print(f"\n[🚨 INCIDENT DÉTECTÉ] {incident_type}")
        print(f"  Incident ID : {incident_id}")
        print(f"  T0          : {self.t0.strftime('%Y-%m-%d %H:%M:%S UTC')}\n")

    def log_event(self, phase: str, actor: str, action: str, evidence: str = "", delta_minutes: int = 0):
        event_time = self.t0 + timedelta(minutes=delta_minutes)
        event = IREvent(
            timestamp=event_time,
            phase=phase,
            actor=actor,
            action=action,
            evidence=evidence
        )
        self.events.append(event)
        elapsed = f"T+{delta_minutes:03d}min" if delta_minutes > 0 else "T+000min"
        print(f"  [{elapsed}] [{phase}] {actor} → {action}")
        if evidence:
            print(f"             📎 Preuve : {evidence}")

    def print_timeline(self):
        print("\n" + "="*70)
        print(f"  TIMELINE COMPLÈTE — INCIDENT {self.incident_id}")
        print("="*70)
        for event in self.events:
            print(f"  {event.timestamp.strftime('%H:%M')} | [{event.phase}] {event.actor} : {event.action}")
        print("="*70)
        print(f"  Durée totale gérée : {(self.events[-1].timestamp - self.t0).seconds // 60} minutes\n")

if __name__ == "__main__":
    # Simulation d'un incident Ransomware
    timeline = IRTimeline("INC-2024-0847", "RANSOMWARE — LockBit 3.0")

    timeline.log_event("DÉTECTION",    "SIEM/SENTINEL",  "Alerte détection : 4200 fichiers chiffrés en 3 min sur SRV-FS-01", "Rule: Mass File Encryption", 0)
    timeline.log_event("DÉTECTION",    "SOC_L2",         "Confirmation ransomware : extension .lockbit3 sur \\\\SRV-FS-01\\Partages$", "Screenshot + hash malware", 8)
    timeline.log_event("CONFINEMENT",  "SOC_L2",         "Isolation réseau SRV-FS-01 via VLAN quarantaine", "Switch port shutdown confirmé", 12)
    timeline.log_event("CONFINEMENT",  "RSSI",           "Désactivation compte service svc_backup compromis dans Active Directory", "Event 4726 AD", 18)
    timeline.log_event("CONFINEMENT",  "DSI",            "Coupure du lien VPN RAS (vecteur d'entrée présumé)", "Logs VPN : connexion anormale 02h14", 25)
    timeline.log_event("INVESTIGATION","SOC_L2",         "Patient Zéro identifié : poste WKSTN-COMPTA-12 (phishing reçu à 01h58)", "MDE alert: malicious macro", 45)
    timeline.log_event("RESTAURATION", "DSI",            "Lancement de la restauration depuis sauvegarde Veeam J-1 (hors-ligne)", "Veeam job ID 2024-IR-847", 120)
    timeline.log_event("POST-INCIDENT","DPO",            "Notification CNIL préparée (données clients comptabilité potentiellement exposées)", "Formulaire CNIL AR", 180)

    timeline.print_timeline()
```

---

## Module 3 — Communication de Crise & Obligations Légales (1h30)

### 🔍 Notification CNIL & ANSSI : Obligations Légales

**Article 33 du RGPD** : Toute violation de données personnelles **doit être notifiée à l'autorité de contrôle** (CNIL en France) **dans les 72 heures** suivant la prise de connaissance de la violation, sauf si la violation ne présente pas de risque pour les droits des personnes.

**Article 34 du RGPD** : Si la violation présente un **risque élevé** pour les personnes concernées, celles-ci doivent également en être informées **sans délai**.

```
DÉCISION ARBRE : DOIS-JE NOTIFIER LA CNIL ?

  Incident détecté
      │
      ▼
  Données personnelles impliquées ?
  ├── NON → Pas d'obligation RGPD (autres obligations légales possibles)
  └── OUI
         ▼
     Risque pour les droits des personnes ?
     ├── FAIBLE (ex: données chiffrées, sauvegardées) → Documenter en interne
     └── MODÉRÉ/ÉLEVÉ → NOTIFIER LA CNIL dans les 72 HEURES
              │
              ▼
          Risque ÉLEVÉ pour les individus ?
          ├── NON → Notification CNIL uniquement
          └── OUI → Notification CNIL + notification des individus concernés
```

---

## Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **IR** | Incident Response — Réponse aux incidents de sécurité |
| **NIST SP 800-61** | Publication spéciale NIST sur la gestion des incidents de sécurité informatique |
| **T0** | "Temps zéro" — Moment de la détection officielle d'un incident |
| **C2** | Command & Control — Serveur de commande utilisé par les attaquants pour piloter les malwares |
| **OIV/OSE** | Opérateur d'Importance Vitale / Opérateur de Services Essentiels (NIS2) |

---

## Exercices Pratiques

### Exercice 1 — Jeu de Rôle : Notification CNIL

Votre organisation découvre qu'un ransomware a chiffré un serveur de fichiers contenant les données de 15 000 clients (noms, adresses, IBAN). L'incident a été détecté à J+36h de l'intrusion initiale.

1. Devez-vous notifier la CNIL ? Dans quel délai maximum à partir de maintenant ?
2. Devez-vous notifier les individus concernés ?
3. Quelles informations clés doit contenir la notification CNIL ?

**Corrigé guidé :**
1. **Oui**, les données personnelles sont compromises avec un risque modéré à élevé (IBAN = données financières sensibles). La notification doit être faite dans les **72h à partir de la prise de connaissance** de la violation. Si l'incident est découvert maintenant, la notification doit être envoyée dans les **72 heures suivantes**.
2. **Oui** — La présence d'IBAN représente un risque élevé pour les individus (fraude bancaire possible). Ils doivent être notifiés sans délai.
3. La notification CNIL doit inclure : nature de la violation, catégories et nombre approximatif de personnes concernées, catégories et nombre approximatif d'enregistrements compromis, coordonnées du DPO, conséquences probables, mesures prises ou envisagées.

---

## Banque QCM — 5 Questions

**Q1.** Le cycle de vie de la Réponse aux Incidents selon le **NIST SP 800-61r2** comprend 4 phases. Laquelle de ces séquences est correcte ?

- A) Préparation → Réponse → Restauration → Clôture
- B) Préparation → Détection & Analyse → Confinement, Éradication & Restauration → Activité Post-Incident ✅
- C) Alerte → Confinement → Restauration → Formation
- D) Détection → Escalade → Containment → Paiement

**Q2.** Dans un incident ransomware, quelle est la **première action** à effectuer pour préserver les preuves numériques AVANT d'éteindre une machine infectée ?

- A) Formater le disque dur.
- B) Installer un antivirus.
- C) Capturer une image de la mémoire vive (RAM dump), qui contient les clés de chiffrement, les processus actifs et les connexions réseau de l'attaquant. ✅
- D) Contacter le service commercial du fabricant.

**Q3.** L'**Article 33 du RGPD** impose de notifier la CNIL en cas de violation de données personnelles dans un délai de :

- A) 24 heures.
- B) 72 heures à compter de la prise de connaissance de la violation. ✅
- C) 30 jours.
- D) La notification est optionnelle.

**Q4.** Dans la cellule de crise cyber, le **DPO (Data Protection Officer)** est responsable de :

- A) Couper physiquement les serveurs infectés.
- B) Rédiger les communiqués de presse.
- C) Évaluer l'impact sur les données personnelles, préparer la notification CNIL et assurer la conformité RGPD pendant et après l'incident. ✅
- D) Contacter l'hébergeur pour suspendre les serveurs.

**Q5.** Qu'est-ce qu'un **Patient Zéro** dans le contexte d'une investigation IR ?

- A) La première victime décédée lors d'une épidémie hospitalière.
- B) Le premier système informatique compromis, point d'entrée initial de l'attaquant, dont l'identification permet de comprendre le vecteur d'intrusion et la propagation latérale. ✅
- C) Le compte administrateur le plus puissant du domaine.
- D) Le serveur de sauvegarde non affecté par l'attaque.

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
