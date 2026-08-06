# TOME P5 — Cybersécurité Avancée & Red/Blue Team — Jour 247 (6h) : Offensive AI & Exploitation Automatisée (Agents d'Attaque IA, Machine Learning Adversarial, Deepfake Phishing & Defenses EDR/XDR)

> [!NOTE]
> **Objectif du jour :** Maîtriser le domaine émergent de l'**IA Offensive (Offensive AI)** et de l'exploitation automatisée : compréhension des attaques par **Adversarial Machine Learning** (perturbations d'entrées pour aveugler les EDR/antivirus IA), utilisation des **agents d'attaque autonomes alimentés par LLM** (Frameworks d'auto-exploitation), vecteurs d'ingénierie sociale de nouvelle génération (**Deepfake Vishing/Phishing**), et déploiement de contre-mesures défensives avancées dans les EDR/XDR modernes.
>
> **Compétences visées :** `SEC-04` (A) — Offensive AI & Adversarial Machine Learning Exploitation | `SEC-05` (A) — Deepfake Phishing Defense & AI-Driven EDR/XDR Detection

---

## 1) Module — Adversarial Machine Learning & EDR Evasion (2h)

### 📖 Narration/Intuition

Les solutions modernes de sécurité (EDR/XDR Next-Gen comme CrowdStrike, SentinelOne, Defender for Endpoint) s'appuient sur des modèles de Machine Learning pour classifier les fichiers et comportements comme "sains" ou "malveillants".

L'**Adversarial Machine Learning** consiste à modifier légèrement un fichier malveillant (en injectant des bruits imperceptibles ou des séquences d'octets neutres) pour tromper le classificateur IA et faire passer un malware pour un fichier inoffensif (attaque par **Evasion / Evasion Perturbation**).

### 🔍 Anatomie Technique

**Attaque d'Évasion contre un Classificateur Malware IA :**

```
 ┌─────────────────────────┐
 │ Binary Malveillant      │ ──► [ Modèle IA EDR ] ──► 🔴 DÉTECTÉ (Malware Score: 0.98)
 └─────────────────────────┘
              │
              │ Injection d'octets neutres (Adversarial Noise Injection)
              ▼
 ┌─────────────────────────┐
 │ Binary Modifié (Adv)    │ ──► [ Modèle IA EDR ] ──► 🟢 PASSÉ (Malware Score: 0.12)
 └─────────────────────────┘                             (Faux Négatif / Bypassed !)
```

**Script de Perturbation Adversariale d'un PE (`adversarial_pe.py`) :**

```python
import struct

def inject_adversarial_noise(pe_file_path: str, output_path: str):
    """Ajoute des sections de données neutres pour modifier le score des modèles de détection IA."""
    with open(pe_file_path, "rb") as f:
        data = f.read()

    # Append de chaînes légitimes extraites de logiciels sains (ex: certificats, strings bénignes)
    benign_padding = b"\x00" * 4096 + b"Microsoft Corporation. All rights reserved. Windows System Utility."
    
    modified_data = data + benign_padding
    
    with open(output_path, "wb") as f:
        f.write(modified_data)
        
    print(f"✅ Fichier binaire perturbé généré : {output_path} (Taille augmentée, signatures IA modifiées)")

if __name__ == "__main__":
    inject_adversarial_noise("payload.exe", "payload_adv.exe")
```

---

## 2) Module — Agents d'Attaque Autonomes (Auto-Exploitation LLM) (2h)

### 📖 Narration/Intuition

Les attaquants Red Team et les groupes cybercriminels utilisent désormais des **Agents d'Attaque Autonomes** basés sur les LLM. Ces agents sont capables de scanner un réseau, d'analyser automatiquement la sortie de Nmap, de rechercher les exploits correspondants sur Exploit-DB, et de générer/exécuter les scripts d'attaque sans intervention humaine en boucle autonome (**Agentic Cyberattack**).

### 🛠️ Atelier Pratique

**Architecture d'un Agent Red Team Autonome en Python (`auto_attacker.py`) :**

```python
import subprocess, json

class AutonomousRedTeamAgent:
    def __init__(self, target_ip: str):
        self.target_ip = target_ip

    def step1_recon(self):
        print(f"🔍 [AGENT IA] Scan Nmap automatique sur {self.target_ip}...")
        # Exécution du scan
        cmd = f"nmap -sV -T4 --script=vuln {self.target_ip}"
        res = subprocess.run(cmd, shell=True, capture_output=True, text=True)
        return res.stdout

    def step2_analyze_and_exploit(self, scan_output: str):
        print("🧠 [AGENT IA] Analyse de la sortie par le LLM d'attaque...")
        # L'agent analyse les ports ouverts et sélectionne l'exploit optimal
        if "502/tcp open" in scan_output:
            print("🎯 [AGENT IA] Vulnérabilité Modbus TCP détectée → Déclenchement de l'exploit SCADA...")
        elif "8080/tcp open" in scan_output:
            print("🎯 [AGENT IA] Service Web vulnérable détecté → Tentative d'injection RCE...")

agent = AutonomousRedTeamAgent("192.168.10.50")
scan_res = agent.step1_recon()
agent.step2_analyze_and_exploit(scan_res)
```

---

## 3) Module — Deepfake Vishing & Défenses EDR/XDR Next-Gen (2h)

### 🛠️ Atelier Pratique

**Détection des Vishing IA et Authentification Hors-Bande (`deepfake_defense_checklist.md`) :**

```markdown
# GUIDE DE DÉFENSE ANTI-DEEPFAKE & VISHING IA — ENTREPRISE

## 1. Menace Deepfake Audio / Video (Vishing de Nouvelle Génération)
Les attaquants utilisent des modèles de clonage vocal (Voice Cloning - ElevenLabs/Coqui)
pour imiter la voix d'un dirigeant (CEO/CFO) ou d'un administrateur système lors d'un appel téléphonique,
demandant un virement d'urgence ou une réinitialisation de mot de passe.

## 2. Procédure de Validation Hors-Bande (Out-of-Band Verification)
- INTERDICTION stricte d'exécuter un transfert de fonds ou un changement d'accès basé sur un simple appel vocal ou vidéo.
- Exiger systématiquement une validation secondaire via un canal séparé et cryptographiquement certifié :
  1. Notification Push FIDO2 / WebAuthn sur l'application mobile d'entreprise.
  2. Mot de passe de phrase de défi (Challenge-Response Phrase) pré-convenu de vive voix.

## 3. Configuration EDR/XDR contre le Process Hollowing piloté par IA
Activer les règles de détection comportementale indépendantes des signatures de fichiers :
  - Bloquer la création de threads distants (`CreateRemoteThread`) depuis des processus non signés.
  - Alerte immédiate sur l'écriture de mémoire avec permissions `PAGE_EXECUTE_READWRITE`.
```

---

## 🏅 Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **Adversarial ML** | Technique de manipulation des données d'entrée pour tromper un modèle de Machine Learning |
| **Vishing** | Voice Phishing — Hameçonnage téléphonique (exécuté par voix clonée par IA) |
| **EDR / XDR** | Endpoint Detection and Response / Extended Detection and Response |
| **Process Hollowing** | Technique d'injection où un processus légitime est vidé de son code et remplacé par un malware |

---

## 🏋️ Exercices & Corrigés

**Exercice 1 :** Expliquer le principe d'une **attaque d'évasion par perturbation (Adversarial Perturbation Attack)** contre un modèle de Machine Learning utilisé par un EDR.

**Corrigé :** Une attaque par perturbation consiste à modifier légèrement un fichier malveillant (ex: ajouter des octets neutres, modifier la taille des sections PE, injecter des chaînes d'un binaire sain) de manière à modifier les vecteurs de caractéristiques (*feature vectors*) extraits par le modèle IA de l'EDR. Bien que ces modifications ne changent en rien l'exécution malveillante réelle du programme, elles font basculer le score calculé par l'algorithme sous le seuil de détection malveillant, le faisant classifier comme "fichier bénin" (faux négatif).

**Exercice 2 :** Quelle est la parade la plus efficace contre les attaques d'ingénierie sociale basées sur le clonage vocal d'un dirigeant par IA (**Deepfake Audio Vishing**) ?

**Corrigé :** La parade la plus efficace est l'application stricte d'une **procédure de vérification hors-bande (Out-of-Band Verification)** combinée à des contrôles d'autorisation cryptographiques. Aucune décision financière ou modification d'accès privilégié ne doit reposer uniquement sur la voix ou la vidéo. Toute demande doit être validée par une seconde méthode d'authentification forte (ex: approbation Push FIDO2/WebAuthn sur un appareil géré, ou validation par signature numérique), rendant l'imitation vocale inopérante pour valider la transaction.

---

## ❓ Banque de Questions & Test du Jour

**Q1 :** Quelle technique d'Adversarial Machine Learning consiste à modifier un binaire malveillant pour faire chuter son score de risque auprès des classificateurs IA des EDR ?
- A) Adversarial Evasion Attack (Perturbation d'entrée)
- B) SQL Injection
- C) XSS
- D) Man-in-the-Middle

**Réponse : A**

**Q2 :** Comment appelle-t-on l'ingénierie sociale téléphonique utilisant l'intelligence artificielle pour cloner la voix d'un responsable d'entreprise ?
- A) Deepfake Vishing (Voice Phishing)
- B) Smishing
- C) TypoSquatting
- D) Port Scanning

**Réponse : A**

**Q3 :** Pourquoi les règles de détection EDR basées sur le **comportement en mémoire (Behavioral Monitoring)** sont-elles plus efficaces contre l'Adversarial ML que les classificateurs basés sur les fichiers ?
- A) Parce qu'un binaire a beau modifier sa signature de fichier, son comportement en mémoire au moment de l'exécution (ex: Process Hollowing, allocation `PAGE_EXECUTE_READWRITE`) reste détectable par le kernel
- B) Parce que le comportement ne peut pas être analysé par l'IA
- C) Parce que les fichiers sont toujours chiffrés
- D) Parce qu'EDR signifie Encryption Data Recovery

**Réponse : A**

**Q4 :** Qu'est-ce qu'un **Agent d'Attaque Autonome** dans le contexte de l'IA Offensive ?
- A) Un programme piloté par un LLM capable d'enchaîner seul des étapes de reconnaissance, recherche de vulnérabilités et génération d'exploits
- B) Un virus classique
- C) Un pare-feu physique
- D) Un antivirus traditionnel

**Réponse : A**

**Q5 :** Quelle mesure organisationnelle garantit qu'un virement frauduleux initié par un faux appel vidéo Deepfake ne soit pas exécuté ?
- A) La procédure de validation obligatoire hors-bande avec authentification forte (MFA/FIDO2)
- B) L'interdiction d'utiliser le téléphone
- C) Le chiffrement du disque dur du PC
- D) L'installation d'un filtre anti-spam email

**Réponse : A**

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
