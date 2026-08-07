# TOME P6 — Cybersécurité Expert & Red Team Avancé — Jour 279 (6h) : Cyber Crisis Management & Executive Communication (Cellule de Crise COMEX/Board Level, Notification Réglementaire NIS2/RGPD 72h, Communication Média & Plan de Continuité PCA)

> [!NOTE]
> **Objectif du jour :** Maîtriser la **Gestion de Crise Cyber d'Entreprise au niveau COMEX / Direction Générale** : organiser la Cellule de Crise Cyber, piloter les arbitrages stratégiques (continuité vs déconnexion réseau), rédiger les notifications réglementaires obligatoires (RGPD 72h, NIS 2 24h/72h), et gérer la communication de crise vis-à-vis des médias et des régulateurs.
>
> **Compétences visées :** `CRISIS-01` (A) — Executive Cyber Crisis Management | `CRISIS-02` (A) — Regulatory Incident Notification & Media Communication

---

## 1) Module — Organisation de la Cellule de Crise Cyber (2h)

### 📖 Narration/Intuition

Lors d'un incident cyber majeur (ex: Ransomware généralisé), la gestion de crise ne se limite pas à la technique : elle implique la Direction Générale (CEO), le Juridique, la Communication, les RH et les Opérations. La **Cellule de Crise** se divise en deux entités distinctes :
- **Cellule de Crise Décisionnelle (COMEX) :** Décisions stratégiques (déconnexion de filiales, dépôt de plainte, notification régulateur).
- **Cellule de Crise Opérationnelle (CERT/SOC) :** Confinement, investigation et reconstruction.

---

## 2) Module — Plan de Notification Réglementaire Automatisé (`regulatory_notification.py`) (2h)

### 🛠️ Atelier Pratique

**Calculateur de délais de notification réglementaire d'incident (`crisis_timer.py`) :**

```python
from datetime import datetime, timedelta

def calculate_regulatory_deadlines(incident_detection_time: datetime):
    print("=== DÉLAIS DE NOTIFICATION RÉGLEMENTAIRE POST-INCIDENT ===")
    print(f"[*] Incident détecté le : {incident_detection_time.strftime('%Y-%m-%d %H:%M:%S UTC')}")

    # 1) NIS 2 - Alerte précoce (24h)
    nis2_warning = incident_detection_time + timedelta(hours=24)
    print(f"[!] NIS 2 — Alerte Précoce (ANSSI) : {nis2_warning.strftime('%Y-%m-%d %H:%M:%S UTC')} (Max 24h)")

    # 2) RGPD - Notification DPA/CNIL (72h)
    rgpd_deadline = incident_detection_time + timedelta(hours=72)
    print(f"[!] RGPD — Notification CNIL (Article 33) : {rgpd_deadline.strftime('%Y-%m-%d %H:%M:%S UTC')} (Max 72h)")

    # 3) DORA - Notification Autorité Bancaire (4h)
    dora_deadline = incident_detection_time + timedelta(hours=4)
    print(f"[!] DORA — Notification Initiale (EBA/ACPR) : {dora_deadline.strftime('%Y-%m-%d %H:%M:%S UTC')} (Max 4h)")

calculate_regulatory_deadlines(datetime.utcnow())
```

---

## 3) Module — Template de Communication de Crise Média & Communiqué (2h)

```markdown
# COMMUNIQUÉ DE PRESSE DE CRISE — PARADIS GLOBAL FINANCIAL
**Date :** 2026-08-07 — 16:00 UTC
**Statut :** COMMUNIQUÉ OFFICIEL

## Objet : Déclaratif relatif à l'incident de sécurité informatique

PARADIS Global Financial a identifié une intrusion informatique ciblant une partie de ses serveurs administratifs.

### Actions immédiates engagées :
1. **Confinement :** Les systèmes affectés ont été immédiatement isolés du réseau par nos équipes spécialisées.
2. **Investigation :** Des experts internationaux en cybersécurité sont mobilisés aux côtés de nos équipes internes.
3. **Autorités :** L'ANSSI et la CNIL ont été notifiées conformément à la réglementation.
4. **Services Clients :** Les services bancaires essentiels restent opérationnels grâce à nos mécanismes de résilience.

Une ligne d'information dédiée est ouverte pour nos clients : 0800-XXX-XXX.
```

---

## 🏅 Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **PCA / PRA** | Plan de Continuité d'Activité / Plan de Reprise d'Activité |
| **CNIL** | Commission Nationale de l'Informatique et des Libertés (Autorité de contrôle RGPD France) |
| **ANSSI** | Agence Nationale de la Sécurité des Systèmes d'Information |

---

## ❓ Banque de Questions & Test du Jour

**Q1 :** Quel est le rôle principal de la **Cellule de Crise Décisionnelle (COMEX)** lors d'un incident cyber majeur ?
- A) Prendre les décisions stratégiques, juridiques, financières et de communication d'entreprise (ex: déconnexion réseau, notification régulateurs)
- B) Écrire du code Python
- C) Reconstruire les serveurs
- D) Déchiffrer les disques durs

**Réponse : A**

**Q2 :** Quel est le délai maximal imposé par l'Article 33 du **RGPD** pour notifier une violation de données personnelles à l'autorité de contrôle (CNIL) ?
- A) 72 heures à compter de la prise de connaissance de l'incident
- B) 24h
- C) 30 jours
- D) 6 mois

**Réponse : A**

**Q3 :** Selon la recommandation unanime des autorités de sécurité (ANSSI, FBI, Europol), quelle est la position officielle concernant le paiement d'une rançon lors d'une attaque Ransomware ?
- A) Ne jamais payer la rançon — Cela ne garantit pas la récupération des données et alimente le modèle économique du cybercrime
- B) Payer immédiatement
- C) Payer la moitié
- D) Négocier 3 mois

**Réponse : A**

**Q4 :** Quel est le délai maximal exigé par la directive **NIS 2** pour transmettre l'**Alerte Précoce (Early Warning)** à l'autorité nationale de cybersécurité ?
- A) 24 heures
- B) 72h
- C) 1 semaine
- D) 10 jours

**Réponse : A**

**Q5 :** Dans un plan de communication de crise média, quel principe doit être respecté pour éviter les contradictions et la panique ?
- A) Désigner un porte-parole unique formé et diffuser uniquement des informations vérifiées et validées par la cellule de crise
- B) Laisser chaque employé répondre aux journalistes
- C) Cacher l'incident indéfiniment
- D) Blâmer publiquement l'équipe informatique

**Réponse : A**

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
