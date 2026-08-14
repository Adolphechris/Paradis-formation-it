# Jour J315A — Pont Pentest → CISM : du Technique au Stratégique

> [!NOTE]
> **JOUR ANNEXE DU JOUR 315 — S7 (J315a)**  
> Cette leçon fait le lien entre l'offensif technique (pentest, OSCP+) et la gouvernance stratégique (CISM, CISO). Aucun prérequis de management.

---

## 🎯 Objectifs de la Leçon
- 🧠 Comprendre pourquoi un CISO a besoin de comprendre le pentest.
- 📊 Apprendre à traduire une technique d'attaque en risque business.
- 🛠️ Réaliser un mapping MITRE ATT&CK → risques métier.
- 🚀 Préparer les modules CISM/CISSP de S7.

---

## 📖 1. Du technique au stratégique

### Le fossé
- **Pentester / Red Team** : "J'ai exploité une faille SSRF pour accéder aux clés IAM AWS."
- **CISO / Board** : "Quel est l'impact financier ? Quel est le risque pour la réputation ?"

### La traduction
| Technique d'attaque | Risque technique | Risque métier | Impact financier |
|---|---|---|---|
| SSRF → vol de clés IAM | Accès full AWS | Fuite de données clients | Amende RGPD + perte de confiance |
| Kerberoasting | Vol de hash AD | Compromission du domaine | Arrêt de production + ransom |
| Phishing + MFA bypass | Accès boîte mail CEO | Fraude CEO (virement) | Perte $M + poursuites |
| DDoS | Indisponibilité service | Perte de revenus | $10k–$1M par heure |

---

## 📖 2. MITRE ATT&CK comme pont

### Concept
MITRE ATT&CK est le **langage commun** entre technique et stratégie :

- **Red Team** : "J'ai utilisé T1059.001 (PowerShell) + T1552.001 (credentials in files)"
- **Blue Team** : "Je détecte T1059.001 avec ma règle SIGMA"
- **CISO** : "Couverture détection = 60% sur les tactiques Initial Access et Credential Access"

### Atelier : Mapping attaque → risque
**Scénario** : Un attaquant exploite une faille SSRF sur le serveur web pour accéder aux métadonnées IMDS d'AWS et voler des clés IAM.

| Étape | Technique | MITRE | Risque métier | Impact |
|---|---|---|---|---|
| 1 | Scan initial | T1595 | Identification surface d'attaque | Aucun |
| 2 | Exploitation SSRF | T1189 | Accès non autorisé au cloud | Critique |
| 3 | Vol clés IAM | T1552.005 | Compromission compte AWS | Critique |
| 4 | Élévation privilèges | T1078.004 | Accès ressources sensibles | Majeur |
| 5 | Exfiltration données | T1041 | Fuite données clients | Majeur |

**Traduction CISO** : "Risque de fuite de données clients avec amendes RGPD potentielles et atteinte à la réputation."

---

## 🧪 Atelier Pratique : 3 scénarios de traduction

### Scénario 1 : Phishing + MFA bypass
**Technique** : Evilginx2 reverse proxy, vol de session MFA.
**Traduction métier** : Compromission messagerie CEO → fraude virement bancaire → perte $2M.

### Scénario 2 : Ransomware
**Technique** : Initial Access (phishing) → Execution (Cobalt Strike) → Impact (chiffrement).
**Traduction métier** : Arrêt production 48h → perte revenus $500k + rançon $300k + coût remédiation $200k.

### Scénario 3 : DDoS
**Technique** : SYN flood 10Gbps → saturation load balancer.
**Traduction métier** : Site e-commerce indisponible 6h → perte CA $1.2M + SLA penalties $300k.

---

## ❓ Banque de QCM & Test du Jour (5 Questions)

**Q1 : Pourquoi un CISO a-t-il besoin de comprendre le pentest ?**
- A) Pour évaluer le risque financier et prioriser les investissements sécurité
- B) Pour savoir coder des exploits
- C) Pour installer des antivirus
- D) Pour réparer les serveurs

*Réponse : A — Le CISO traduit les risques techniques en langage business pour le Board.*

**Q2 : Que fait MITRE ATT&CK ?**
- A) Cartographie les techniques d'attaque pour faciliter la communication technique/stratégique
- B) Bloque les attaques automatiquement
- C) Installe des firewalls
- D) Remplaçe les antivirus

*Réponse : A — MITRE ATT&CK est le langage commun entre Red Team, Blue Team et CISO.*

**Q3 : Comment traduit-on un risque technique en risque financier ?**
- A) En évaluant l'impact (ALE = ARO × EF × AV)
- B) En devinant
- C) En ignorant le risque
- D) En demandant aux clients

*Réponse : A — ALE = Annual Loss Expectancy = fréquence × impact financier.*

**Q4 : Quel est l'impact d'un ransomware sur une entreprise ?**
- A) Arrêt production, perte de revenus, rançon, amendes, réputation
- B) Rien de grave
- C) Juste un mot de passe à changer
- D) Un redémarrage suffit

*Réponse : A — Ransomware = impact financier majeur + opérationnel + réputation.*

**Q5 : Quel est le rôle principal d'un CISO ?**
- A) Protéger les actifs informationnels et communiquer les risques au Board
- B) Coder des exploits
- C) Installer des logiciels
- D) Gérer les mots de passe

*Réponse : A — Le CISO protège l'information et informe la direction.*

---

*Pont Pédagogique S7 — Module J315a (annexe de J315)*
