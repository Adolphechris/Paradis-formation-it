# TOME P2 — Réseaux & Télécoms — Jour 96 (6h) : Logique Booléenne & Applications en Cybersécurité

> [!NOTE]
> **Objectif du jour :** Maîtriser les fondements de l'algèbre booléenne, les tables de vérité, les lois de simplification (De Morgan) et leurs applications concrètes en cybersécurité : règles de pare-feu, conditions d'accès, filtrage de paquets et logique de programmation sécurisée.
>
> **Compétences visées :** `SEC-01` (A) — Logique de Sécurité & Conditions | `BIT-09` (A) — Fondements Algorithmiques

---

## 1) Module — Fondements de l'Algèbre Booléenne (2h)

### 📖 Narration/Intuition

Toute la cybersécurité repose sur des décisions binaires : **autoriser / refuser**, **vrai / faux**, **1 / 0**. Une règle de pare-feu, une condition d'accès, un filtre de détection d'intrusion ne sont rien d'autre que des expressions logiques booléennes évaluées sur chaque paquet ou chaque tentative de connexion.

L'**algèbre booléenne**, inventée par George Boole en 1854, est le langage mathématique qui permet de manipuler ces décisions binaires de manière rigoureuse.

### 🔍 Anatomie Technique

**Variables et Opérateurs Booléens Fondamentaux :**

| Opérateur | Symbole | Signification | Exemple Sécurité |
|:---|:---|:---|:---|
| **ET** (AND) | `∧` ou `*` | Les deux conditions doivent être vraies | `(IP_source = autorisée) ∧ (Port = 443)` |
| **OU** (OR) | `∨` ou `+` | Au moins une condition vraie | `(Role = admin) ∨ (Role = auditor)` |
| **NON** (NOT) | `¬` ou `'` | Inversion de la condition | `NOT (IP_source = blacklistée)` |
| **XOR** | `⊕` | Une seule des deux conditions vraie | `(VPN = actif) XOR (Réseau_invite = actif)` |

**Tables de Vérité des Opérateurs de Base :**

```
┌───────┬───────┬───────┬────────┬────────┐
│   A   │   B   │ A AND B │ A OR B │ A XOR B│
├───────┼───────┼─────────┼────────┼────────┤
│   0   │   0   │    0    │   0    │   0    │
│   0   │   1   │    0    │   1    │   1    │
│   1   │   0   │    0    │   1    │   1    │
│   1   │   1   │    1    │   1    │   0    │
└───────┴───────┴───────┴────────┴────────┘
```

**Exercice mental :** Évaluer l'expression `(A ∧ B) ∨ (¬A ∧ ¬B)` pour toutes les combinaisons de A et B.

**Corrigé :**

```
A=0, B=0 : (0∧0)∨(1∧1) = 0∨1 = 1
A=0, B=1 : (0∧1)∨(1∧0) = 0∨0 = 0
A=1, B=0 : (1∧0)∨(0∧1) = 0∨0 = 0
A=1, B=1 : (1∧1)∨(0∧0) = 1∨0 = 1
```

Résultat : Cette expression est l'opérateur **XNOR** (équivalence). Elle est vraie quand A et B sont identiques.

---

## 2) Module — Lois de Simplification & Formes Canoniques (2h)

### 📖 Narration/Intuition

En cybersécurité, les règles de pare-feu ou les conditions d'autorisation peuvent devenir extrêmement complexes. Un administrateur peut se retrouver avec 50 règles qui, en réalité, ne sont que des combinaisons redondantes des mêmes conditions. L'algèbre booléenne permet de **simplifier** ces expressions pour ne garder que l'essentiel, réduisant les erreurs et les failles de sécurité.

### 🔍 Anatomie Technique

**Lois Fondamentales de l'Algèbre Booléenne :**

```
1. LOI D'IDENTITÉ :
   A ∧ 1 = A          A ∨ 0 = A

2. LOI DE NULLITÉ :
   A ∧ 0 = 0          A ∨ 1 = 1

3. LOI DE IDEMPOTENCE :
   A ∧ A = A          A ∨ A = A

4. LOI DE COMPLÉMENTARITÉ :
   A ∧ ¬A = 0         A ∨ ¬A = 1

5. LOI DE COMMUTATIVITÉ :
   A ∧ B = B ∧ A      A ∨ B = B ∨ A

6. LOI D'ASSOCIATIVITÉ :
   (A ∧ B) ∧ C = A ∧ (B ∧ C)
   (A ∨ B) ∨ C = A ∨ (B ∨ C)

7. LOI DE DISTRIBUTIVITÉ :
   A ∧ (B ∨ C) = (A ∧ B) ∨ (A ∧ C)
   A ∨ (B ∧ C) = (A ∨ B) ∧ (A ∨ C)
```

** Lois de De Morgan (Fondamentales en Sécurité Informatique) :**

```
¬(A ∧ B) = ¬A ∨ ¬B
¬(A ∨ B) = ¬A ∧ ¬B

Interprétation sécurité :
"NE PAS (autoriser SI admin ET IP_interne)" 
= "refuser SI (NON admin) OU (NON IP_interne)"
```

**Exemple de Simplification de Règle de Sécurité :**

Expression complexe d'une règle de pare-feu :
```
(A ∧ B) ∨ (A ∧ ¬B) ∨ (¬A ∧ B)
```

Simplification étape par étape :
```
= A ∧ (B ∨ ¬B) ∨ (¬A ∧ B)      [Factorisation par A]
= A ∧ 1 ∨ (¬A ∧ B)             [B ∨ ¬B = 1]
= A ∨ (¬A ∧ B)                 [A ∧ 1 = A]
= (A ∨ ¬A) ∧ (A ∨ B)           [Distributivité]
= 1 ∧ (A ∨ B)                  [A ∨ ¬A = 1]
= A ∨ B                        [1 ∧ X = X]
```

**Résultat :** La règle complexe se résume à `A ∨ B` (autoriser si A OU B est vrai).

---

## 3) Module — Applications Pratiques en Cybersécurité (2h)

### 📖 Narration/Intuition

La logique booléenne n'est pas une théorie abstraite : elle est au cœur de chaque décision de sécurité. Un administrateur système, un analyste SOC ou un développeur d'applications sécurisées utilise quotidiennement des expressions booléennes pour :

- Écrire des règles de pare-feu (iptables/nftables)
- Définir des politiques d'accès conditionnel (RBAC/ABAC)
- Programmer des détections d'intrusion (Suricata/Snort rules)
- Concevoir des workflows d'authentification multifacteur

### 🔍 Anatomie Technique

**Application 1 — Règle de Pare-feu booléenne (nftables) :**

```bash
# Logique : Autoriser le trafic SSH UNIQUEMENT si
#   (IP_source est dans le réseau interne) ET (Port destination = 22)
#   OU
#   (IP_source est dans le réseau VPN) ET (Port destination = 22)

# En nftables, cela se traduit par :
nft add rule inet filter input \
  ip saddr {10.0.0.0/8, 172.16.0.0/12} tcp dport 22 \
  accept

nft add rule inet filter input \
  ip saddr {196.200.30.0/24} tcp dport 22 \
  accept

# Règle par défaut (tout le reste est refusé) :
nft add rule inet filter input \
  tcp dport 22 \
  drop
```

**Expression booléenne équivalente :**
```
Autoriser = (Réseau_interne ∧ Port_22) ∨ (Réseau_VPN ∧ Port_22)
Refuser  = Port_22 ∧ ¬(Réseau_interne ∨ Réseau_VPN)
```

**Application 2 — Condition d'accès multifacteur (Pseudo-code sécurisé) :**

```python
def verifier_acces_admin(utilisateur):
    """
    Logique booléenne d'accès administrateur sécurisé :
    Autoriser SI (authentification forte réussie) ET (appareil de confiance)
              ET (hors plage horaire interdite = 23h-6h OU validation manager)
    """
    
    auth_forte = (utilisateur.mfa_valide == True) and (utilisateur.mot_de_passe_recent == True)
    appareil_ok = utilisateur.appareil in liste_appareils_de_confiance
    horaire_ok = (utilisateur.heure_connexion < 23) and (utilisateur.heure_connexion > 6)
    validation_manager = utilisateur.validation_manager == True
    
    # Expression booléenne finale
    acces_autorise = auth_forte and appareil_ok and (horaire_ok or validation_manager)
    
    return acces_autorise
```

**Application 3 — Détection d'intrusion par motifs booléens (Suricata/Snort) :**

```bash
# Règle Suricata : Détecter un scan de ports SYN
# Logique : (Protocole = TCP) ∧ (Flag = SYN) ∧ (Flag != ACK) ∧ (Ports multiples)

alert tcp any any -> $HOME_NET any (msg:"SCAN: SYN Scan détecté"; 
  flags:S; 
  threshold: type both, track by_src, count 20, seconds 60; 
  sid:1000001; rev:1;)

# Interprétation booléenne :
# Détecter SI (Protocole == TCP) ∧ (Flag SYN == 1) ∧ (Flag ACK == 0)
#        ET (Nombre de paquets > 20 en 60 secondes)
```

---

## 🏅 Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **AND** | Opérateur booléen ET — toutes les conditions doivent être vraies |
| **OR** | Opérateur booléen OU — au moins une condition vraie |
| **NOT** | Opérateur booléen de négation — inverse la vérité |
| **XOR** | OU exclusif — une seule condition vraie parmi deux |
| **XNOR** | NON-OU exclusif — équivalence (les deux conditions identiques) |
| **De Morgan** | Lois de transformation logique : ¬(A∧B) = ¬A∨¬B et ¬(A∨B) = ¬A∧¬B |

---

## 🏋️ Exercices & Corrigés

**Exercice 1 :** Simplifier l'expression booléenne suivante en utilisant les lois de l'algèbre booléenne :
```
(A ∧ B) ∨ (A ∧ ¬B)
```

**Corrigé :**
```
= A ∧ (B ∨ ¬B)      [Factorisation par A — loi de distributivité]
= A ∧ 1             [B ∨ ¬B = 1 — loi de complémentarité]
= A                 [A ∧ 1 = A — loi d'identité]
```
**Résultat :** L'expression se simplifie en `A`.

---

**Exercice 2 :** En cybersécurité, un administrateur écrit la condition suivante pour autoriser l'accès à un serveur :
```
Autoriser SI (utilisateur_est_admin = VRAI) OU (utilisateur_est_auditor = VRAI)
```
En utilisant la loi de De Morgan, écrire l'expression booléenne de la condition de **refus** d'accès.

**Corrigé :**
```
Refus = NOT(utilisateur_est_admin OU utilisateur_est_auditor)
      = (NOT utilisateur_est_admin) ET (NOT utilisateur_est_auditor)
      = (utilisateur_n'est_pas_admin) ∧ (utilisateur_n'est_pas_auditor)
```
**Interprétation :** L'accès est refusé si l'utilisateur n'est NI admin NI auditor.

---

**Exercice 3 :** Quelle est la valeur de l'expression `(A XOR B) XOR B` pour toutes les valeurs de A et B ? Simplifier.

**Corrigé :**
```
(A XOR B) XOR B = A XOR (B XOR B)   [Associativité du XOR]
                = A XOR 0           [B XOR B = 0 — tout nombre XOR lui-même = 0]
                = A                 [A XOR 0 = A — élément neutre]
```
**Résultat :** L'expression est équivalente à `A`. Cette propriété est utilisée en cryptographie (chiffrement par flot).

---

## ❓ Banque de Questions & Test du Jour

**Q1 :** Quelle est la table de vérité de l'opérateur AND (ET logique) ?
- A) Vrai seulement si A ET B sont vrais
- B) Vrai si A OU B est vrai
- C) Toujours vrai
- D) Jamais vrai

**Réponse : A**

---

**Q2 :** Quelle est la forme simplifiée de l'expression `(A ∧ B) ∨ (A ∧ ¬B)` ?
- A) A ∧ B
- B) A ∨ B
- C) A
- D) B

**Réponse : C**

---

**Q3 :** Quelle est la transformation de `¬(A ∧ B)` selon les lois de De Morgan ?
- A) `¬A ∧ ¬B`
- B) `¬A ∨ ¬B`
- C) `A ∨ B`
- D) `A ∧ B`

**Réponse : B**

---

**Q4 :** Dans une règle de pare-feu, la logique `(Réseau_interne ∧ Port_443) ∨ (Réseau_VPN ∧ Port_443)` signifie :
- A) Autoriser le port 443 UNIQUEMENT depuis les deux réseaux simultanément
- B) Autoriser le port 443 depuis le réseau interne OU depuis le réseau VPN
- C) Refuser le port 443 depuis tous les réseaux
- D) Autoriser tous les ports depuis le réseau interne

**Réponse : B**

---

**Q5 :** Quel opérateur booléen est utilisé pour exprimer "une seule des deux conditions est vraie, pas les deux" ?
- A) AND
- B) OR
- C) XOR
- D) NOT

**Réponse : C**

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
