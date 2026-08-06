# TOME P3 — Cloud Native, DevOps & Cyberdéfense — Jour 133 (6h) : Sécurité de la Cryptographie Quantique & QKD (Quantum Key Distribution, BB84 Protocol & Quantum Networks)

> [!NOTE]
> **Objectif du jour :** Comprendre les principes physiques et protocolaires de la cryptographie quantique expérimentale et du réseau d'intrication quantique : distribution quantique de clés (QKD - Quantum Key Distribution), protocole BB84, principe d'incertitude d'Heisenberg contre les interceptions, et intégration hybride QKD avec IPsec/MACsec.
>
> **Compétences visées :** `SEC-02` (A) — Cryptographie Quantique & QKD | `BIT-04` (A) — Réseaux Quantiques & Intégration IPsec

---

## 1) Module — Principes de la Physique Quantique & Protocole BB84 (2h)

### 📖 Narration/Intuition

Tant en cryptographie classique qu'en cryptographie post-quantique (PQC), la sécurité repose sur une hypothèse mathématique : la difficulté supposée d'un problème (factorisation, réseaux euclidiens). Mais rien ne prouve mathématiquement qu'une nouvelle découverte d'algorithme ne viendra pas casser ces problèmes dans 20 ans.

La **Distribution Quantique de Clés (QKD - Quantum Key Distribution)** s'appuie sur une garantie absolue de niveau supérieur : les **lois inaltérables de la physique quantique**.

Selon le **Théorème de Non-Clonage** et le **Principe d'Incertitude d'Heisenberg**, il est physiquement impossible pour un espion (Eve) de mesurer ou de copier un état quantique (un photon individuel) sans modifier instantanément cet état. Une tentative d'interception modifie les photons et est **immédiatement et physiquement détectée** par les deux correspondants (Alice et Bob).

### 🔍 Anatomie Technique

**Le Protocole QKD BB84 (Bennett & Brassard 1984) :**

```
ALICE (Émetteur Photonique)                                   BOB (Détecteur Photonique)
┌──────────────────────────┐                                 ┌──────────────────────────┐
│ Generates Random Bits    │                                 │ Measures Photons with    │
│ Encodes in Polarization  │                                 │ Random Bases (+ or x)    │
│ Bases (+ or x)           │                                 │                          │
└───────────┬──────────────┘                                 └────────────▲─────────────┘
            │                                                             │
            │══════════ FIBRE OPTIQUE QUANTIQUE (Photons Uniques) ════════│
            │                                                             │
            │                 EVE (Espion Tentative de Mesure)            │
            │               ❌ Modifie la polarisation du photon !        │
            │               ❌ Provoque un Taux d'Erreur (QBER > 11%)     │
            ▼                                                             ▼
┌───────────────────────────────────────────────────────────────────────────────────────┐
│ CANAL CLASSIQUE PUBLIQUEMENT VÉRIFIÉ                                                  │
│ - Alice & Bob comparent leurs bases de mesure (+ ou x).                              │
│ - Si QBER (Quantum Bit Error Rate) < 11% -> Clé Cryptographique Secrète Valide !     │
│ - Si QBER >= 11% -> INTERCEPTION DÉTECTÉE ! Clé jetée instantanément.                 │
└───────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 2) Module — Intégration Hybride QKD avec IPsec & MACsec (2h)

### 📖 Narration/Intuition

La QKD ne sert pas à chiffrer directement de gros volumes de données (des gigaoctets de vidéos), mais à **générer et distribuer des clés secrètes parfaites** à très haute fréquence (ex: 100 clés/seconde). Ces clés d'une sécurité absolue générées par la physique sont ensuite injectées dans les équipements réseau d'entreprise pour alimenter des tunnels **IPsec** ou **MACsec** chiffrés en AES-256-GCM.

### 🔍 Anatomie Technique

**Architecture d'un Nœud Réseau Hybride QKD / IPsec :**

```
┌─────────────────────────────────────────────────────────────┐
│ 1. APPAREIL QKD MATÉRIEL (Équipement Quantique)             │
│    - Génère la clé secrète via fibre optique dédiée         │
│    - Interface REST Standard ETSI GS QKD 014                │
└──────────────┬──────────────────────────────────────────────┘
               │ Clé secrète par seconde (ETSI QKD 014 API)
               ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. ROUTEUR RÉSEAU IPSEC / PARE-FEU D'ENTREPRISE (BCC)        │
│    - Injecte la clé QKD dans la SA (Security Association)   │
│    - Chiffre le trafic bancaire Ethernet/IP en AES-256-GCM  │
└─────────────────────────────────────────────────────────────┘
```

---

## 3) Module — Simulation et Audit d'un Lien QKD en Python (2h)

### 📖 Narration/Intuition

Les ingénieurs en cybersécurité utilisent des bibliothèques de simulation pour calculer le taux d'erreur binaire quantique (QBER) et vérifier l'absence d'interception sur une liaison fibre.

### 🔍 Anatomie Technique

**Simulation du protocole BB84 et détection d'espion en Python (`qkd_bb84_simulation.py`) :**

```python
#!/usr/bin/env python3
"""
qkd_bb84_simulation.py — Simulation du protocole QKD BB84 et calcul du taux d'erreur QBER
"""
import random

def simuler_qkd_bb84(nb_bits=1000, presence_espion=False):
    # 1. Alice génère ses bits aléatoires et ses bases de polarisation (0 = Rectiligne +, 1 = Diagonale x)
    alice_bits = [random.randint(0, 1) for _ in range(nb_bits)]
    alice_bases = [random.randint(0, 1) for _ in range(nb_bits)]

    # 2. Transmission sur le canal quantique (avec ou sans espion Eve)
    photons_transmis = list(zip(alice_bits, alice_bases))
    
    if presence_espion:
        # Eve intercepte et mesure avec des bases aléatoires (Principe d'incertitude)
        eve_bases = [random.randint(0, 1) for _ in range(nb_bits)]
        photons_modifies = []
        for (bit, base_a), base_e in zip(photons_transmis, eve_bases):
            if base_a == base_e:
                photons_modifies.append((bit, base_a))
            else:
                # La mesure dans la mauvaise base altère le bit de manière aléatoire !
                photons_modifies.append((random.randint(0, 1), base_e))
        photons_transmis = photons_modifies

    # 3. Bob mesure les photons reçus avec ses propres bases aléatoires
    bob_bases = [random.randint(0, 1) for _ in range(nb_bits)]
    bob_bits = []
    for (bit, base_p), base_b in zip(photons_transmis, bob_bases):
        if base_p == base_b:
            bob_bits.append(bit)
        else:
            bob_bits.append(random.randint(0, 1))

    # 4. Reconciliation des bases (Alice et Bob comparent leurs bases sur canal classique)
    cle_alice = []
    cle_bob = []
    for i in range(nb_bits):
        if alice_bases[i] == bob_bases[i]:
            cle_alice.append(alice_bits[i])
            cle_bob.append(bob_bits[i])

    # 5. Calcul du QBER (Quantum Bit Error Rate)
    erreurs = sum(1 for a, b in zip(cle_alice, cle_bob) if a != b)
    qber = (erreurs / len(cle_alice)) * 100

    print(f"=== SIMULATION QKD BB84 (Espion: {presence_espion}) ===")
    print(f"[+] Clés reconciliées : {len(cle_alice)} bits.")
    print(f"[+] Taux d'Erreur Quantique (QBER) : {qber:.2f}%")

    if qber > 11.0:
        print("🚨 ALERTE INTERCEPTION : QBER > 11% ! Espion détecté par les lois de la physique.")
    else:
        print("✅ SUCCÈS : Clé Quantique Secrète Générée sans Interception !")

if __name__ == "__main__":
    simuler_qkd_bb84(1000, presence_espion=False)
    print()
    simuler_qkd_bb84(1000, presence_espion=True)
```

---

## 🏅 Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **QKD** | Quantum Key Distribution — Distribution quantique de clés cryptographiques basée sur la physique |
| **QBER** | Quantum Bit Error Rate — Taux d'erreur binaire quantique révélant une tentative d'écoute |
| **BB84** | Protocole fondateur de distribution quantique de clés (Bennett & Brassard 1984) |
| **ETSI GS QKD 014** | Spécification standard de l'API REST d'interconnexion des équipements QKD avec le réseau |

---

## 🏋️ Exercices & Corrigés

**Exercice 1 :** Pourquoi le **Théorème de Non-Clonage** de la mécanique quantique garantit-il qu'un espion ne peut pas intercepter furtivement une clé distribuée par QKD ?

**Corrigé :** Le **Théorème de Non-Clonage** énonce qu'il est rigoureusement et physiquement impossible de créer une copie exacte d'un état quantique inconnu (un photon individuel). Un espion ne peut pas dupliquer le photon pour en garder une copie et laisser passer l'original. Si l'espion tente de mesurer le photon, il modifie irréversiblement son état de polarisation. Cette perturbation physique augmente immédiatement le taux d'erreur (QBER) mesuré par Alice et Bob, révélant la présence de l'espion et provoquant le rejet instantané de la clé.

**Exercice 2 :** Quelle est la différence de positionnement entre la **Cryptographie Post-Quantique (PQC)** et la **Distribution Quantique de Clés (QKD)** ?

**Corrigé :** La **PQC (Cryptographie Post-Quantique)** s'appuie sur des algorithmes mathématiques complexes (réseaux euclidiens) s'exécutant sur des **ordinateurs et réseaux informatiques classiques** (aucun matériel quantique requis). La **QKD (Distribution Quantique de Clés)** s'appuie sur les **lois de la physique quantique** et nécessite des **équipements matériels photoniques dédiés** et une fibre optique directe pour émettre des photons uniques. La combinaison idéale consiste à utiliser la PQC pour l'authentification et la QKD pour le renouvellement physique des clés de chiffrement symétrique AES-256.

---

## ❓ Banque de Questions & Test du Jour

**Q1 :** Quelle technologie cryptographique s'appuie sur les lois de la physique quantique et des photons uniques pour distribuer des clés secrètes inviolables ?
- A) QKD (Quantum Key Distribution)
- B) MS-DOS
- C) Disquette
- D) Câble VGA

**Réponse : A**

**Q2 :** Quel protocole pionnier de distribution quantique de clés a été inventé par Charles Bennett et Gilles Brassard en 1984 ?
- A) BB84
- B) HTTP/1.0
- C) FTP
- D) POP3

**Réponse : A**

**Q3 :** Que mesure le taux QBER (Quantum Bit Error Rate) lors de la réconciliation d'une clé quantique ?
- A) La présence d'une tentative d'écoute ou d'interception physique par un espion sur la fibre optique quantique
- B) La température de la pièce
- C) Le prix de l'électricité
- D) Le nombre de fichiers texte

**Réponse : A**

**Q4 :** Quel théorème fondamental de la physique quantique interdit la copie conforme ou la duplication d'un photon dans un état quantique inconnu ?
- A) Théorème de Non-Clonage (No-Cloning Theorem)
- B) Théorème de Pythagore
- C) Loi de Ohm
- D) Loi de Murphy

**Réponse : A**

**Q5 :** Quelle norme de l'ETSI (ETSI GS QKD 014) définit l'interface API REST standard permettant aux routeurs IPsec et pare-feux d'extraire les clés générées par des boîtiers QKD ?
- A) ETSI GS QKD 014
- B) DOCX
- C) MP3
- D) EXE

**Réponse : A**

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
