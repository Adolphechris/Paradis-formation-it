# TOME P9 — Cryptographie, PKI & Sécurité des Communications — Jour 438 (6h) : Analyse Formelle & Vérification de Protocoles Cryptographiques — ProVerif, Tamarin Prover, Modélisation Symbolique (Dolev-Yao) & Thèses d'Équivalence

> [!NOTE]
> **Objectif du jour :** Maîtriser les méthodes formelles d'analyse et de vérification des protocoles cryptographiques : modéliser les attaquants dans le modèle **Dolev-Yao** (l'attaquant contrôle 100% du réseau), utiliser les vérificateurs formels **ProVerif** (calcul de Pi appliqué) et **Tamarin Prover** (systèmes de réécriture de règles), prouver formellement des propriétés de confidentialité, d'authentification et de **Secrecy**, et détecter les vulnérabilités de logique de protocole (Logical Flaws).
>
> **Compétences visées :** `FORMAL-CRYPTO-01` (A) — Formal Verification Theory & Dolev-Yao Attacker Model | `FORMAL-CRYPTO-02` (A) — ProVerif / Tamarin Prover Protocol Modeling & Automated Proof Verification

---

## 1) Module — Modèle Dolev-Yao & Vérification Formelle (2h)

### 📖 Narration/Intuition

Même avec des primitives cryptographiques parfaites (AES, RSA, ECDH incassables), un protocole peut présenter des **failles logiques critiques** (Logical Flaws) permettant à un man-in-the-middle d'usurper l'identité d'un utilisateur. La vérification formelle utilise la logique mathématique pour prouver qu'AUCUN scénario d'exécution ne peut violer la sécurité, sous les hypothèses du modèle **Dolev-Yao**.

```
  ═══════════════════════════════════════════════════════════════════
    LE MODÈLE D'ATTAQUANT DOLEV-YAO (1983)
  ═══════════════════════════════════════════════════════════════════

  L'Attaquant Dolev-Yao est le MAÎTRE ABSOLU du réseau :
  1. Il peut intercepter, lire et supprimer N'IMPORTE QUEL paquet.
  2. Il peut injecter, modifier ou rejouer N'IMPORTE QUEL message.
  3. Il peut déchiffrer s'il possède la clé, et chiffrer s'il a la clé publique.
  4. HYPOTHÈSE SYMBOLIQUE : La cryptographie est une "boîte noire parfaite"
     (Impossible de casser AES/RSA sans la clé).

  ═══════════════════════════════════════════════════════════════════
    OUTILS DE VÉRIFICATION : PROVERIF VS TAMARIN PROVER
  ═══════════════════════════════════════════════════════════════════

  Outil               Langage de Modélisation     Technique de Preuve
  ─────               ───────────────────────     ───────────────────
  ProVerif            Calcul de Pi appliqué       Resolution sur clauses de Horn
                      (Applied Pi-Calculus)       (Automatique, rapide)

  Tamarin Prover      Multiset Rewriting Rules    Graphe de dépendance de règles
                      + First-Order Logic         (Semi-automatique, très expressif)
```

---

## 2) Module — Outillage Protocol Verification Engine (`protocol_verifier_engine.py`) (2h)

### 🛠️ Atelier Pratique

```python
import json
from datetime import datetime, timezone
from typing import List, Dict

class ProtocolVerifierEngine:
    """
    Moteur de simulation et de vérification formelle de protocoles cryptographiques :
    - Modélisation symbolique Dolev-Yao
    - Vérification des propriétés de Secrecy et d'Authentification (Needham-Schroeder)
    - Détection de l'attaque de Gavin Lowe (Lowe's Attack sur Needham-Schroeder)
    """

    def __init__(self, protocol_name: str):
        self.protocol = protocol_name
        self.dolev_yao_knowledge = set()
        self.proof_steps = []

    def simulate_needham_schroeder_vulnerable(self) -> dict:
        """
        Simule l'attaque de Gavin Lowe (1995) sur le protocole Needham-Schroeder Asymmetric.
        Prouve l'absence d'authentification lorsque l'attaquant s'interpose entre Alice et Bob.
        """
        print(f"\n[*] ANALYSE FORMELLE : NEEDHAM-SCHROEDER VULNÉRABLE (LOWE'S ATTACK)")

        # Étape 1 : Alice démarre une session avec l'Attaquant Eve (E)
        print("  [1] Alice ── Encrypt(PK_E, {Nonce_A, Alice}) ──► Eve")
        self.dolev_yao_knowledge.add("Nonce_A")

        # Étape 2 : Eve rejoue le message vers Bob (B) en se faisant passer pour Alice
        print("  [2] Eve(Alice) ── Encrypt(PK_B, {Nonce_A, Alice}) ──► Bob")
        
        # Étape 3 : Bob répond à Alice avec Nonce_B
        print("  [3] Bob ── Encrypt(PK_A, {Nonce_A, Nonce_B}) ──► Alice")
        self.dolev_yao_knowledge.add("Nonce_B")

        # Étape 4 : Alice déchiffre et renvoie Nonce_B à Eve
        print("  [4] Alice ── Encrypt(PK_E, {Nonce_B}) ──► Eve")

        # Étape 5 : Eve transmet Nonce_B à Bob -> Bob croit qu'Alice a authentifié la session avec lui !
        print("  [5] Eve ── Encrypt(PK_B, {Nonce_B}) ──► Bob")

        attack_summary = {
            "protocol": "Needham-Schroeder Public Key (1978)",
            "flaw_discovered_by": "Gavin Lowe (1995 via FDR Model Checker)",
            "violated_property": "AUTHENTICATION_FAILED",
            "impact": "Eve usurpe l'identité d'Alice auprès de Bob",
            "fix": "Inclure l'identité du répondeur (Bob) dans le message 2: Encrypt(PK_A, {Nonce_A, Nonce_B, Bob})"
        }
        print(f"  [!] FAILLE LOGIQUE DÉTECTÉE par Modélisation Formelle: Usurpation d'identité !")
        return attack_summary

    def verify_proverif_model_output(self, model_script: str) -> dict:
        """Simule la sortie d'un outil de vérification formelle ProVerif."""
        print("\n[*] VÉRIFICATION PROVERIF AUTOMATISÉE")
        
        proof_result = {
            "tool": "ProVerif 2.04",
            "model": self.protocol,
            "queries": [
                {"query": "query secret secret_data", "result": "RESULT true (Secrecy Preserved ✅)"},
                {"query": "inj-event(end_alice) ==> inj-event(begin_bob)", "result": "RESULT true (Authentication Valid ✅)"}
            ],
            "verified_at": datetime.now(timezone.utc).isoformat()
        }
        print(f"  [+] ProVerif: Secrecy & Authentication formellement prouvés (0 attaque possible)")
        return proof_result

# Démonstration Protocol Verifier Engine
engine = ProtocolVerifierEngine("Needham-Schroeder Protocol")
print("=== FORMAL PROTOCOL VERIFICATION ENGINE ===")

# 1. Simulation Faille Logique (Attaque de Lowe)
engine.simulate_needham_schroeder_vulnerable()

# 2. Sortie de Preuve ProVerif
engine.verify_proverif_model_output("needham_schroeder_fixed.pv")
```

---

## 3) Module — Fiche de Syntaxe ProVerif (2h)

```proverif
(* PROVERIF MODEL — NEEDHAM-SCHROEDER FIXE *)

type key.
type host.

free c: channel. (* Canal public contrôlé par Dolev-Yao *)

(* Primitives cryptographiques *)
fun pk(key): key.
fun aenc(bitstring, key): bitstring.
reduc forall m: bitstring, k: key; adec(aenc(m, pk(k)), k) = m.

(* Requêtes de sécurité formelles *)
free secret_data: bitstring [private].
query attacker(secret_data). (* Doit retourner FALSE *)

process
    (* Processus principal de vérification formelle *)
    0
```

---

## 🏅 Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **Dolev-Yao** | Modèle d'attaquant formel où l'adversaire contrôle totalement le réseau de communication |
| **ProVerif** | Outil de vérification formelle automatisée de protocoles cryptographiques basés sur le calcul de Pi |
| **Tamarin** | Vérificateur formel basé sur les systèmes de réécriture de règles multiset pour protocoles de sécurité |

---

## ❓ Banque de Questions & Test du Jour (5 QCM)

**Q1 :** Quelle est l'hypothèse fondamentale du modèle d'attaquant **Dolev-Yao** dans la vérification formelle de protocoles ?
- A) L'attaquant contrôle à 100% le réseau (il peut lire, intercepter, modifier et injecter tous les paquets), mais la cryptographie est considérée comme une "boîte noire parfaite" (incassable sans la clé)
- B) L'attaquant possède un ordinateur quantique
- C) L'attaquant ne peut lire que 10% du trafic
- D) L'attaquant connaît toutes les clés privées du système

**Réponse : A**

**Q2 :** Quelle faille logique majeure de protocole **Gavin Lowe** a-t-il découverte en 1995 sur le protocole Needham-Schroeder via la vérification formelle ?
- A) Une attaque de man-in-the-middle (Replay/Interposition) permettant à un attaquant $E$ d'utiliser une session démarrée par $A$ pour usurper l'identité de $A$ auprès de $B$, car le message 2 n'incluait pas l'identité de $B$
- B) La cassure de la clé RSA-1024
- C) Une fuite de mémoire tampon (Buffer Overflow)
- D) Une vulnérabilité dans le compilateur C

**Réponse : A**

**Q3 :** Quelle est la différence de technique entre **ProVerif** et **Tamarin Prover** ?
- A) ProVerif utilise le calcul de Pi appliqué et la résolution de clauses de Horn (analyse entièrement automatique), tandis que Tamarin utilise des règles de réécriture multiset et le graphe de dépendance (analyse très expressive)
- B) ProVerif est pour Windows et Tamarin pour Linux
- C) ProVerif ne vérifie que le chiffrement AES
- D) Tamarin est une crypto-monnaie

**Réponse : A**

**Q4 :** Que signifie la requête ProVerif `query attacker(secret_data)` lorsque ProVerif répond `RESULT true` ?
- A) ATTENTION : L'attaquant EST CAPABLE de dériver la valeur `secret_data` (la propriété de confidentialité est VIOLÉE !)
- B) Le secret est bien protégé
- C) Le code ne contient pas d'erreur
- D) La connexion réseau a réussi

**Réponse : A**

**Q5 :** Pourquoi la vérification formelle est-elle obligatoire pour la certification de sécurité de haut niveau (ex: **Critères Communs EAL6/EAL7**) ?
- A) Parce que les tests de pénétration classiques (Pen-Testing) ne peuvent prouver que la présence de failles, alors que la vérification formelle prouve mathématiquement l'ABSENCE de failles logiques dans le protocole
- B) Parce qu'elle coûte moins cher
- C) Parce qu'elle remplace les pare-feux
- D) Parce qu'elle est exigée par le W3C

**Réponse : A**

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
