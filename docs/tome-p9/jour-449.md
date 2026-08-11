# TOME P9 — Cryptographie, PKI & Sécurité des Communications — Jour 449 (6h) : Cryptanalyse Appliquée, Attaques sur Implémentations Cryptographiques (Timing Attacks, Padding Oracle, Bleichenbacher, BEAST, Lucky13) & Contre-Mesures

> [!NOTE]
> **Objectifs pédagogiques :**
> - Comprendre et reproduire les **attaques sur implémentations cryptographiques imparfaites** : Timing Side-Channel, Padding Oracle, Bleichenbacher sur RSA, BEAST (CBC IV Prédictible), Lucky13 (MAC-Then-Encrypt)
> - Analyser les **CVE historiques majeurs** liés aux implémentations TLS/OpenSSL défaillantes (CVE-2014-0160 Heartbleed, CVE-2014-3566 POODLE, CVE-2015-0204 FREAK)
> - Implémenter les **contre-mesures cryptographiques** : Algorithmes à temps constant, RSA-OAEP, Encrypt-Then-MAC, TLS 1.3 (obsolescence définitive de CBC dans TLS)
>
> **Compétences visées :** `SEC-04` (A) — Cryptanalyse Appliquée, `SEC-06` (A) — Attaques sur Protocoles Cryptographiques

---

## Module 1 — Attaques par Canal Auxiliaire (Side-Channel Attacks) (2h)

### 📖 Intuition & Narration

Un cryptosystème peut être mathématiquement parfait, mais son **implémentation logicielle ou matérielle** peut fuir des informations sur les clés secrètes à travers des canaux indirects : le temps d'exécution, la consommation électrique, les émissions électromagnétiques, ou les accès mémoire. Ces attaques sont appelées **Side-Channel Attacks** et contournent entièrement la solidité mathématique de l'algorithme.

### 🔍 Anatomie Technique — Timing Attack sur une Comparaison de Mot de Passe

```python
#!/usr/bin/env python3
"""
PARADIS — Démonstration d'une Timing Attack sur une comparaison de mot de passe VULNÉRABLE
vs implémentation sécurisée à TEMPS CONSTANT
"""

import time
import hmac
import os

# ============================================================
# IMPLÉMENTATION VULNÉRABLE — Comparaison naïve (court-circuit)
# ============================================================
def verify_token_vulnerable(provided: str, secret: str) -> bool:
    """
    Court-circuite dès le premier caractère différent.
    Un attaquant peut mesurer le temps de réponse pour deviner le token caractère par caractère.
    """
    if len(provided) != len(secret):
        return False
    for a, b in zip(provided, secret):
        if a != b:
            return False  # <-- Retour immédiat ! ──▶ FUITE DE TIMING
    return True

# ============================================================
# IMPLÉMENTATION SÉCURISÉE — Comparaison à Temps Constant
# ============================================================
def verify_token_secure(provided: bytes, secret: bytes) -> bool:
    """
    hmac.compare_digest() compare TOUJOURS tous les octets, même si le premier diffère.
    Le temps d'exécution est CONSTANT quelle que soit la position de la différence.
    """
    return hmac.compare_digest(provided, secret)

# Démonstration de la fuite de timing
secret_token = b"PARADIS-SUPER-SECRET-TOKEN-2024"

# Mesure du temps pour un token totalement faux
start = time.perf_counter_ns()
for _ in range(10000):
    verify_token_vulnerable("A" * len(secret_token), secret_token.decode())
elapsed_wrong = (time.perf_counter_ns() - start) / 10000

# Mesure du temps pour un token presque correct (sauf le dernier caractère)
near_correct = secret_token.decode()[:-1] + "X"
start = time.perf_counter_ns()
for _ in range(10000):
    verify_token_vulnerable(near_correct, secret_token.decode())
elapsed_near = (time.perf_counter_ns() - start) / 10000

print(f"[VULN] Token totalement faux    : {elapsed_wrong:.2f} ns/iter")
print(f"[VULN] Token presque correct    : {elapsed_near:.2f} ns/iter")
print(f"[VULN] FUITE : Δ = {abs(elapsed_near - elapsed_wrong):.2f} ns — Observable par un attaquant réseau !")

# Version sécurisée — temps constant
start = time.perf_counter_ns()
for _ in range(10000):
    verify_token_secure(b"A" * len(secret_token), secret_token)
elapsed_const_wrong = (time.perf_counter_ns() - start) / 10000

start = time.perf_counter_ns()
for _ in range(10000):
    verify_token_secure(near_correct.encode(), secret_token)
elapsed_const_near = (time.perf_counter_ns() - start) / 10000

print(f"\n[SECURE] Token totalement faux  : {elapsed_const_wrong:.2f} ns/iter")
print(f"[SECURE] Token presque correct  : {elapsed_const_near:.2f} ns/iter")
print(f"[SECURE] Δ ≈ {abs(elapsed_const_near - elapsed_const_wrong):.2f} ns — Indiscernable ✅")
```

---

## Module 2 — Padding Oracle Attack & POODLE/BEAST (2h)

### 🔍 Anatomie Technique — Padding Oracle Attack sur CBC (PKCS#7)

```
PADDING ORACLE ATTACK — Principe (Vaudenay 2002)

  Contexte : Mode CBC avec padding PKCS#7
  Acteur    : Un serveur qui retourne des erreurs différentes pour "padding invalide" vs "MAC invalide"

  Ciphertext intercepté : C = [IV | C_1 | C_2 | C_3]
  Objectif : Déchiffrer C_3 sans la clé.

  ORACLE : Serveur(C') → VALID / PADDING_ERROR (fuites d'information !)

  1. L'attaquant construit C'_2 en modifiant le dernier octet de C_2
  2. Pour chaque valeur x de 0 à 255, envoie C'=[IV|C_1|C'_2|C_3]
  3. Quand le serveur répond VALID (pas PADDING_ERROR), le dernier octet de C_3 xor C'_2 = 0x01
  4. L'attaquant récupère P_3[dernier] = C'_2_byte xor 0x01 xor C_2[dernier]
  5. Itération → déchiffrement complet sans connaître la clé ! (1 bloq = 128 requêtes max)

  CVEs ASSOCIÉS :
  ├── CVE-2011-3389 (BEAST) — IV prédictible en TLS 1.0/CBC ──▶ Session hijacking
  ├── CVE-2014-3566 (POODLE) — Forcing SSL 3.0 CBC via downgrade ──▶ Cookie theft
  └── CVE-2013-0169 (Lucky13) — Timing oracle sur MAC-then-Encrypt en TLS 1.0/1.1
```

### 🛠️ Contre-Mesures

```bash
# CONTRE-MESURES CONFIGURÉES SUR NGINX (TLS 1.3 ONLY)
# /etc/nginx/conf.d/ssl-hardening.conf

server {
    listen 443 ssl http2;
    
    # FORCER TLS 1.3 UNIQUEMENT — Élimine TOUTES les vulnérabilités CBC (BEAST, POODLE, Lucky13)
    ssl_protocols TLSv1.3;
    
    # Ciphers TLS 1.3 uniquement (CHACHA20-POLY1305 et AES-GCM — Pas de CBC !)
    ssl_ciphers "TLS_AES_256_GCM_SHA384:TLS_CHACHA20_POLY1305_SHA256:TLS_AES_128_GCM_SHA256";
    
    # HSTS avec preload — Évite le downgrade TLS
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
    
    # Désactiver les renegociations TLS non sécurisées
    ssl_session_tickets off;
    ssl_session_cache off;
}
```

---

## Module 3 — Bleichenbacher sur RSA-PKCS#1 v1.5 & CVEs Historiques (1h30)

### 🔍 Anatomie Technique — Attaque Bleichenbacher (1998)

```
BLEICHENBACHER 1998 — "Million Message Attack" sur RSA-PKCS#1v1.5

  CONTEXTE : Déchiffrement RSA avec padding PKCS#1 v1.5
  Padding attendu : 0x00 0x02 [PS ≥ 8 octets non-nuls] 0x00 [Message]

  ORACLE : Le serveur retourne une erreur différente si le padding est invalide vs valide.

  1. L'attaquant intercepte le ciphertext RSA C (ex: un PreMasterSecret TLS)
  2. Il envoie C' = C * s^e mod n (blinding RSA)
  3. Le serveur déchiffre et retourne une erreur de padding (ou non)
  4. Chaque réponse Oracle réduit l'espace de recherche du message M
  5. Après ~1 million de requêtes → M entièrement retrouvé SANS LA CLÉ PRIVÉE !

  SOLUTION : Remplacer RSA-PKCS#1v1.5 par RSA-OAEP (Optimal Asymmetric Encryption Padding)
  OAEP intègre un masque probabiliste qui rend toutes les erreurs de padding IDENTIQUES.

  CVE-2017-6168 — Bleichenbacher F5 : Millions d'équipements vulnérables en production.
  CVE-2018-0737 — OpenSSL/AWS : Variante Bleichenbacher sur clés RSA-1024.
```

---

## Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **CBC** | Cipher Block Chaining — Mode de chiffrement par blocs vulnérable aux padding oracles sans AEAD |
| **POODLE** | Padding Oracle On Downgraded Legacy Encryption — CVE-2014-3566 ciblant SSL 3.0 / TLS CBC |
| **BEAST** | Browser Exploit Against SSL/TLS — CVE-2011-3389 exploitant les IVs prévisibles de CBC TLS 1.0 |
| **Bleichenbacher** | Attaque oracle adaptative sur RSA-PKCS#1v1.5, requérant 1M de requêtes pour retrouver un plaintext |
| **OAEP** | Optimal Asymmetric Encryption Padding — Padding RSA sécurisé résistant à l'attaque Bleichenbacher |

---

## Exercices Pratiques

### Exercice 1 — Diagnostic de Configuration TLS

Un test Qualys SSL Labs sur le serveur `api.paradis.example.com` retourne les résultats suivants : Score **B**, vulnérable à POODLE SSLv3, support de TLS 1.0 et TLS 1.1 actif, Cipher Suite `TLS_RSA_WITH_AES_128_CBC_SHA` proposée.

**Question :** Identifiez TOUTES les vulnérabilités et rédigez la configuration Nginx corrigée.

**Corrigé guidé :**
1. **SSLv3 POODLE** : Support SSLv3 à désactiver immédiatement (`ssl_protocols` sans `SSLv3`).
2. **TLS 1.0/1.1** : Vulnérables à BEAST, Lucky13 et downgrade attacks → Désactiver au profit de TLS 1.2+ minimum, TLS 1.3 préféré.
3. **CBC Cipher Suite** : `AES_128_CBC_SHA` vulnérable aux Padding Oracles et Lucky13 → Remplacer par AES-256-GCM ou CHACHA20-POLY1305 (AEAD uniquement).
4. **RSA sans Forward Secrecy** : `TLS_RSA_WITH_*` ne fournit aucune Forward Secrecy → Remplacer par ECDHE.
5. **Config corrigée** : `ssl_protocols TLSv1.3;` + `ssl_ciphers "TLS_AES_256_GCM_SHA384:TLS_CHACHA20_POLY1305_SHA256";` + HSTS preload.

---

## Banque QCM — 5 Questions

**Q1.** La Padding Oracle Attack sur AES-CBC exploite :

- A) Une faiblesse mathématique d'AES
- B) Le fait que le serveur retourne des messages d'erreur différents selon la validité du padding PKCS#7, permettant de deviner le plaintext sans la clé ✅
- C) La longueur de clé AES insuffisante (< 256 bits)
- D) L'absence de certificat X.509

**Q2.** La vulnérabilité **POODLE** (CVE-2014-3566) exploite :

- A) Le fait que TLS 1.3 n'utilise pas de nonces
- B) Un downgrade forcé vers SSL 3.0, puis une Padding Oracle Attack sur le mode CBC vulnérable de SSL 3.0 ✅
- C) Une faiblesse dans la signature ECDSA
- D) L'absence de HSTS dans les headers HTTP

**Q3.** L'attaque de Bleichenbacher cible spécifiquement :

- A) RSA-OAEP avec SHA-256
- B) RSA-PKCS#1 v1.5 (utilisé dans TLS avant TLS 1.3), exploitant le padding oracle du serveur TLS ✅
- C) L'algorithme ECDH X25519
- D) Les clés Diffie-Hellman de 2048 bits

**Q4.** La contre-mesure principale contre les Timing Attacks lors de la comparaison de tokens est :

- A) Augmenter la longueur du token à 256 caractères
- B) Utiliser `hmac.compare_digest()` ou équivalent à temps constant, comparant TOUS les octets sans court-circuit ✅
- C) Stocker le token en base64 URL-safe
- D) Utiliser HTTPS avec certificat wildcard

**Q5.** Pourquoi TLS 1.3 élimine-t-il structurellement BEAST, POODLE et Lucky13 ?

- A) TLS 1.3 utilise des clés RSA de 4096 bits
- B) TLS 1.3 supprime entièrement les modes CBC et MAC-then-Encrypt — Il n'utilise que des AEAD (AES-GCM, CHACHA20-POLY1305) dont le padding est intégré cryptographiquement ✅
- C) TLS 1.3 requiert une authentification biométrique
- D) TLS 1.3 désactive le mode handshake

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
