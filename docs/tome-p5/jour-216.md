# TOME P5 — Cybersécurité Avancée & Red/Blue Team — Jour 216 (6h) : Cryptanalyse & Attaques Cryptographiques (Padding Oracle, Attaques PRNG, TLS Downgrade, Weak RSA Keys & Side-Channel)

> [!NOTE]
> **Objectif du jour :** Maîtriser l'évaluation de la sécurité des implémentations cryptographiques et les attaques cryptanalytiques modernes : attaque **Padding Oracle (CBC Mode)**, générateurs de nombres pseudo-aléatoires faibles (**PRNG Flaws**), attaques par rétrogradation de protocole (**TLS Downgrade Attacks / POODLE**), faiblesses des clés RSA (Module commun, exposant faible $e=3$) et principes des attaques par canaux auxiliaires (**Side-Channel Attacks**).
>
> **Compétences visées :** `SEC-06` (A) — Cryptanalyse & Exploitation Cryptographique | `SEC-04` (A) — Cryptographic Hardening & Implementation Auditing

---

## 1) Module — Attaque Padding Oracle (Mode AES-CBC) (2h)

### 📖 Narration/Intuition

Lorsqu'une application web utilise le mode de chiffrement AES-CBC pour chiffrer des cookies de session ou des jetons sans authentification (sans HMAC ou GCM), elle est vulnérable à l'une des attaques cryptographiques les plus élégantes : l'**Attaque Padding Oracle**.

Un "Oracle de Padding" est un serveur qui renvoie un message d'erreur différent selon que le déchiffrement d'un message échoue à cause d'un **mauvais rembourrage (Padding PKCS#7 invalide)** ou d'une erreur applicative. En envoyant des paquets modifiés octet par octet et en observant la réponse de l'Oracle, un attaquant peut déchiffrer **l'intégralité d'un message sans jamais connaître la clé de chiffrement AES !**

### 🔍 Anatomie Technique

**Principe du Mode CBC (Cipher Block Chaining) & Padding PKCS#7 :**

```
CHIFFREMENT CBC :
  Block N-1 (ou IV) ──► XOR ──► AES Encrypt (Clé K) ──► Ciphertext N

DÉCHIFFREMENT CBC :
  Ciphertext N ──► AES Decrypt (Clé K) ──► Intermediate N ──► XOR avec Ciphertext N-1 ──► Plaintext N
```

**Formule de l'Attaque Padding Oracle :**
$$\text{Plaintext}_N[i] = \text{Intermediate}_N[i] \oplus \text{Ciphertext}_{N-1}[i]$$

Si l'attaquant modifie $\text{Ciphertext}_{N-1}[i]$ jusqu'à ce que le serveur ne renvoie plus d'erreur de padding (padding valide = `0x01`), il découvre la valeur de $\text{Intermediate}_N[i]$ :
$$\text{Intermediate}_N[i] = 0x01 \oplus \text{Ciphertext}_{N-1}[i]$$
Il en déduit immédiatement le véritable octet du message en clair ($\text{Plaintext}_N[i]$) !

**Exploitation automatisée avec PadBuster :**

```bash
# Déchiffrer un cookie de session chiffré en AES-CBC via PadBuster
padbuster https://portail.bcc.cd/index.php "a1b2c3d4e5f67890..." 16 \
  -encoding 0 \
  -error "Invalid Padding"

# Résultat : PadBuster extrait le cookie déchiffré octet par octet sans la clé !
```

---

## 2) Module — Générateurs Aléatoires (PRNG) & TLS Downgrade (2h)

### 📖 Narration/Intuition

En cryptographie, le hasard est le fondement de toute la sécurité. Si un développeur génère un jeton de réinitialisation de mot de passe ou une clé d'API en utilisant un générateur de nombres aléatoires non sécurisé (ex: `Math.random()` en JS ou `rand()` en C), un attaquant peut prédire les clés futures.

De plus, les attaques par rétrogradation (ex: **POODLE**, **FREAK**) forcent un serveur web à négocier une version obsolète et vulnérable de TLS (ex: SSL 3.0) pour en exploiter les failles.

### 🔍 Anatomie Technique

**Comparaison PRNG Faible vs CSPRNG Cryptographiquement Sûr :**

```java
// 🚨 VULNÉRABLE : java.util.Random (PRNG déterministe prédictible)
Random random = new Random();
int sessionToken = random.nextInt(); // ⚠️ Prédictible après quelques échantillons !

// ✅ SÉCURISÉ : java.security.SecureRandom (CSPRNG cryptographiquement sûr)
SecureRandom secureRandom = new SecureRandom();
byte[] token = new byte[32];
secureRandom.nextBytes(token); // Utilise la vraie entropie du système (/dev/urandom)
```

---

## 3) Module — Weak RSA & Hardening Cryptographique (2h)

### 📖 Narration/Intuition

Le chiffrement asymétrique RSA repose sur la difficulté mathématique de factoriser le produit $n = p \times q$ de deux grands nombres premiers $p$ et $q$. Si $p$ et $q$ sont mal générés (trop proches, réutilisés entre serveurs, ou si l'exposant public $e=3$ est trop petit), l'attaquant peut factoriser $n$ en quelques secondes et recalculer la clé privée d'un certificat SSL ou d'une clé SSH !

### 🛠️ Atelier Pratique

**Factorisation d'une Clé RSA Faible avec RsaCft Tool (`rsa_attack.py`) :**

```bash
# 1. Inspecter le module RSA n et l'exposant e d'une clé publique vulnérable
openssl rsa -pubin -in public_key.pem -text -noout

# 2. Utiliser RsaCftTool pour casser la clé publique et générer la clé privée
python3 RsaCftTool.py --publickey public_key.pem --uncipherfile encrypted_data.bin --private

# Résultat : RsaCftTool factorise n et génère private_key.pem !
```

---

## 🏅 Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **CBC** | Cipher Block Chaining — Mode de chiffrement par bloc avec chaînage XOR |
| **PRNG** | Pseudo-Random Number Generator — Générateur de nombres pseudo-aléatoires |
| **CSPRNG** | Cryptographically Secure PRNG — PRNG sûr pour la cryptographie |
| **POODLE** | Padding Oracle On Downgraded Legacy Encryption — Attaque sur SSL 3.0 |
| **IV** | Initialization Vector — Vecteur d'initialisation aléatoire pour le mode CBC |

---

## 🏋️ Exercices & Corrigés

**Exercice 1 :** Pourquoi le mode de chiffrement **AES-GCM (Galois/Counter Mode)** élimine-t-il totalement le risque d'une attaque par **Padding Oracle**, contrairement au mode **AES-CBC** ?

**Corrigé :** Le mode **AES-CBC** est un mode de chiffrement pur qui ne fournit **aucune authentification ni contrôle d'intégrité** sur le ciphertext. Lorsqu'il déchiffre un message altéré, le serveur tente d'abord de vérifier le rembourrage (padding PKCS#7). S'il est invalide, il renvoie une erreur de padding distincte que l'attaquant utilise comme un "oracle". Le mode **AES-GCM** est un mode de chiffrement **authentifié (AEAD)**. Il génère un tag d'authentification cryptographique de 128 bits (`authTag`). Lors du déchiffrement, AES-GCM **vérifie d'abord l'intégrité du message via l'authTag AVANT toute opération de déchiffrement ou de vérification de padding**. Si un seul octet a été modifié par un attaquant, la vérification de l'authTag échoue immédiatement et le serveur rejette tout le paquet sans effectuer aucune vérification de padding, annulant la fuite d'information d'oracle.

**Exercice 2 :** Pourquoi la réutilisation du même vecteur d'initialisation (IV) en mode AES-CBC ou AES-GCM est-elle une faille cryptographique critique ?

**Corrigé :** Le vecteur d'initialisation (**IV**) est conçu pour garantir que deux messages identiques chiffrés avec la même clé produisent des ciphertexts complètement différents. En mode **AES-CBC**, si deux messages $M_1$ et $M_2$ sont chiffrés avec le même IV, un attaquant peut détecter si le premier bloc des deux messages est identique (les ciphertexts seront identiques), révélant des informations sur le contenu. En mode **AES-GCM**, la réutilisation d'une même paire (Clé, IV) — appelée *Nonce Reuse* — est catastrophique : elle permet à un attaquant de déduire la clé d'authentification GHASH via des opérations algébriques simples, permettant de déchiffrer tout le trafic passé et de forger de faux messages authentifiés.

---

## ❓ Banque de Questions & Test du Jour

**Q1 :** Quelle attaque cryptographique permet à un attaquant de déchiffrer un message chiffré en AES-CBC octet par octet sans connaître la clé, simplement en observant les messages d'erreur de padding du serveur ?
- A) Attaque Padding Oracle
- B) Attaque par dictionnaire
- C) Attaque Man-in-the-Middle
- D) Attaque SQL Injection

**Réponse : A**

**Q2 :** Quel mode de chiffrement AES moderne offre une authentification intégrée des données (AEAD) et immunise les applications contre les attaques de Padding Oracle ?
- A) AES-GCM
- B) AES-CBC
- C) AES-ECB
- D) DES

**Réponse : A**

**Q3 :** Pourquoi l'utilisation de `Math.random()` en JavaScript ou `rand()` en C est-elle strictement interdite pour la génération de clés de sécurité ou de jetons de réinitialisation ?
- A) Car ce sont des PRNGs déterministes non-sécurisés dont la suite de nombres peut être prédite à partir de quelques valeurs observées
- B) Car ils ralentissent le processeur
- C) Car ils nécessitent un accès à Internet
- D) Car ils sont limités aux nombres pairs

**Réponse : A**

**Q4 :** Quelle attaque sur le protocole TLS (ex: POODLE) consiste à forcer un client et un serveur à négocier une ancienne version de protocole vulnérable (ex: SSL 3.0) pour exploiter ses failles ?
- A) TLS Downgrade Attack
- B) Buffer Overflow
- C) Cross-Site Scripting
- D) DNS Poisoning

**Réponse : A**

**Q5 :** Quel outil open-source basé sur Python permet d'analyser et de factoriser des clés publiques RSA faibles en exploitant des vulnérabilités mathématiques (petit exposant $e$, clés partagées) ?
- A) RsaCftTool
- B) Wireshark
- C) Nmap
- D) Metasploit

**Réponse : A**

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
