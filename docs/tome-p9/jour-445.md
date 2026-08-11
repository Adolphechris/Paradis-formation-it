# TOME P9 — Cryptographie, PKI & Sécurité des Communications — Jour 445 (6h) : Zero-Knowledge Proofs & zk-SNARKs (Groth16, PLONK, Circom & Applications Blockchain/Confidential Computing)

> [!NOTE]
> **Objectifs pédagogiques :**
> - Comprendre le paradigme des **preuves à divulgation nulle (Zero-Knowledge Proofs)** et leurs propriétés fondamentales (Complétude, Solidité, Divulgation Nulle)
> - Maîtriser l'architecture des **zk-SNARKs** (Groth16, PLONK) et des **zk-STARKs**
> - Développer des circuits arithmétiques avec **Circom 2.0** et les compiler en contraintes R1CS
> - Appliquer les ZKP aux cas d'usage : Authentification anonyme, Confidential Smart Contracts, Privacy-preserving compliance
>
> **Compétences visées :** `SEC-04` (A) — Zero-Knowledge Cryptography, `SEC-06` (A) — Advanced Privacy Cryptography

---

## Module 1 — Fondements des Preuves à Divulgation Nulle (2h)

### 📖 Intuition & Narration

Imaginez que vous devez prouver à un juge que vous connaissez un mot de passe sans jamais lui révéler ce mot de passe. Ou prouver que votre revenu est supérieur à 50 000€ par an sans divulguer votre revenu exact. Ce paradigme, appelé **Zero-Knowledge Proof (ZKP)**, permet au **Prouveur** (Prover) de convaincre le **Vérificateur** (Verifier) de la vérité d'une affirmation, sans révéler aucune information sur le "pourquoi".

Un ZKP satisfait trois propriétés formelles :
1. **Complétude (Completeness)** : Si l'affirmation est vraie, un Prouveur honnête peut toujours convaincre le Vérificateur.
2. **Solidité (Soundness)** : Si l'affirmation est fausse, aucun Prouveur malveillant ne peut convaincre le Vérificateur (sauf avec une probabilité négligeable).
3. **Divulgation Nulle (Zero-Knowledge)** : Le Vérificateur n'apprend rien d'autre que "l'affirmation est vraie".

### 🔍 Anatomie Technique — Protocole de Schnorr (ZKP simple)

```
PROTOCOLE DE SCHNORR — Preuve de Connaissance d'un Logarithme Discret

  Contexte : Alice connaît x tel que Y = x*G (sur courbe elliptique).
  Elle veut prouver qu'elle connaît x sans révéler x.

  1. Alice choisit un nonce aléatoire r et calcule R = r*G  ──▶ Envoie R au Vérificateur
  2. Vérificateur envoie un défi aléatoire c (challenge)
  3. Alice calcule s = r + c*x mod q                       ──▶ Envoie s au Vérificateur
  4. Vérificateur vérifie : s*G == R + c*Y ?

  Si s*G = (r+c*x)*G = r*G + c*x*G = R + c*Y ──▶ VRAI ! ✅
  Alice a prouvé qu'elle connaît x SANS révéler x.
```

---

## Module 2 — zk-SNARKs (Groth16 & PLONK) et Circuits Circom (2h)

### 📖 Intuition & Narration

Les **zk-SNARKs** (Zero-Knowledge Succinct Non-Interactive Arguments of Knowledge) poussent le concept encore plus loin : la preuve est **succincte** (de taille constante, quelques centaines d'octets, indépendamment de la complexité du calcul) et **non-interactive** (aucun aller-retour entre Prover et Verifier). C'est ce qui les rend utilisables en pratique dans les blockchains et les systèmes embarqués.

### 🔍 Anatomie Technique — Pipeline Circom → Groth16

```
PIPELINE COMPLET ZK-SNARK AVEC CIRCOM

  [Programme Circom] ──▶ [Compilateur Circom2] ──▶ [R1CS Constraints]
        │                                                │
        ▼                                                ▼
  [Trusted Setup] ──────────────────────────▶ [Proving Key + Verification Key]
  (Powers of Tau)                                        │
        │                                                ▼
  [Witness calculation] ────────────────────▶ [snarkjs.groth16.prove()] ──▶ [Proof π]
                                                          │
                                              [snarkjs.groth16.verify()] ──▶ VALID / INVALID
```

### 🛠️ Atelier Pratique — Circuit Circom pour la Preuve de Majorité

```circom
// PARADIS — Circuit Circom 2.0
// Preuve ZKP : "Je suis majeur (>= 18 ans) sans révéler mon âge exact"

pragma circom 2.0.0;

include "circomlib/comparators.circom";

template MajorityProof() {
    // Signaux privés (non révélés au vérificateur)
    signal input age;          // Âge réel de l'utilisateur (PRIVÉ)
    
    // Signaux publics (connus du vérificateur)
    signal input threshold;    // Seuil légal = 18

    // Sortie publique
    signal output is_major;    // 1 si majeur, 0 sinon

    // Composant de comparaison de Circomlib
    component gte = GreaterEqThan(8);  // 8 bits suffisent pour des âges 0-255
    gte.in[0] <== age;
    gte.in[1] <== threshold;
    
    is_major <== gte.out;

    // Contrainte : la preuve ne sera valide que si is_major == 1
    is_major === 1;
}

component main {public [threshold]} = MajorityProof();
```

```bash
# Compilation et génération de la preuve
circom majority_proof.circom --r1cs --wasm --sym -o ./build

# Calcul du witness (avec l'âge réel privé : 25 ans)
cat > input.json << 'EOF'
{
  "age": 25,
  "threshold": 18
}
EOF

node build/majority_proof_js/generate_witness.js build/majority_proof.wasm input.json build/witness.wtns

# Génération de la preuve zk-SNARK (Groth16)
snarkjs groth16 prove build/majority_proof_final.zkey build/witness.wtns build/proof.json build/public.json

# Vérification de la preuve (le vérificateur NE VOIT PAS l'âge réel !)
snarkjs groth16 verify build/verification_key.json build/public.json build/proof.json
```

---

## Module 3 — Applications Pratiques des ZKP (1h30)

### 🔍 Cas d'Usage Industriels des Zero-Knowledge Proofs

```
APPLICATIONS ZKP EN PRODUCTION (2024)

  1. ZKML (Zero-Knowledge Machine Learning)
     └── Prouver qu'un modèle IA a donné un résultat correct sans révéler les poids du modèle

  2. PRIVACY-PRESERVING COMPLIANCE (Finance)
     └── Prouver qu'un client a un score KYC/AML positif sans révéler ses données personnelles

  3. ZKEVM (zkSync, Polygon zkEVM, Scroll)
     └── Valider des centaines de transactions blockchain en une seule preuve succincte

  4. ANONYMOUS CREDENTIALS (zk-creds)
     └── Prouver que l'on possède un attribut (ex: niveau de clearance) sans révéler son identité

  5. PRIVATE SET INTERSECTION (PSI)
     └── Deux parties vérifient des éléments en commun sans révéler leurs listes respectives
```

---

## Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **ZKP** | Zero-Knowledge Proof — Preuve mathématique prouvant la connaissance d'un secret sans le révéler |
| **zk-SNARK** | Zero-Knowledge Succinct Non-Interactive Argument of Knowledge — Preuve compacte non-interactive |
| **zk-STARK** | Zero-Knowledge Scalable Transparent Argument of Knowledge — Variante sans Trusted Setup |
| **R1CS** | Rank-1 Constraint System — Système de contraintes quadratiques décrivant un circuit arithmétique |
| **Circom** | Circuit Compiler — Langage dédié à la définition de circuits arithmétiques pour les ZKP |

---

## Exercices Pratiques

### Exercice 1 — Identification de la Propriété ZKP

Lors d'un audit de conformité RGPD, un auditeur doit vérifier que l'âge de tous les utilisateurs d'une plateforme est supérieur à 18 ans, sans accéder aux données personnelles réelles. Quelle propriété des ZKP est exploitée ? Quel outil permet de l'implémenter ?

**Corrigé guidé :** La propriété exploitée est la **Divulgation Nulle (Zero-Knowledge)** combinée à la **Solidité (Soundness)**. L'utilisateur génère une preuve ZKP via un circuit Circom (comme `MajorityProof` ci-dessus) que son âge est ≥ 18, sans révéler sa date de naissance. L'auditeur ne reçoit que la preuve binaire cryptographiquement vérifiable, sans aucune donnée personnelle, respectant ainsi parfaitement le RGPD.

---

## Banque QCM — 5 Questions

**Q1.** La propriété de **Solidité (Soundness)** d'une preuve ZKP garantit que :

- A) La preuve est compressée en dessous de 1 Ko
- B) Aucun Prouveur malveillant ne peut convaincre le Vérificateur d'une affirmation fausse (sauf probabilité négligeable) ✅
- C) La clé privée est toujours révélée
- D) Le vérificateur peut retrouver le secret après 1000 preuves

**Q2.** La différence fondamentale entre **zk-SNARK** et **zk-STARK** est :

- A) zk-STARK requiert un Trusted Setup, zk-SNARK non
- B) zk-SNARK requiert un Trusted Setup (paramètres publics) ; zk-STARK est Transparent (pas de Trusted Setup) ✅
- C) zk-SNARK ne fonctionne que sur Windows
- D) Les deux algorithmes sont strictement identiques

**Q3.** Un **Trusted Setup** dans les zk-SNARKs (Groth16) est :

- A) Un contrat notarial pour les blockchains
- B) Une cérémonie cryptographique collaborative générant les paramètres publics (Powers of Tau) — si un seul participant est honnête, le secret est sécurisé ✅
- C) L'installation d'un antivirus sur le prouveur
- D) Une liste blanche d'adresses IP

**Q4.** La bibliothèque **Circom** est principalement utilisée pour :

- A) Déployer des conteneurs Docker
- B) Définir des circuits arithmétiques compilés en contraintes R1CS, utilisées pour générer des preuves ZKP ✅
- C) Configurer des serveurs DNS
- D) Générer des certificats SSL X.509

**Q5.** Dans le protocole de Schnorr, pourquoi l'utilisateur choisit-il un nonce aléatoire $r$ différent à chaque preuve ?

- A) Pour accélérer le calcul
- B) La réutilisation du même $r$ permettrait au vérificateur de calculer la clé secrète $x$ par une simple soustraction ✅
- C) Pour respecter la norme ISO 27001
- D) Car le protocole TCP l'exige

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
