# TOME P11 — DevSecOps, Cloud Security & Gouvernance — Jour 526 (6h) : Identity & Access Management (IAM) Avancé : PAM, CIAM, Authentification Passwordless & Standard FIDO2/WebAuthn

> [!NOTE]
> **Objectifs pédagogiques :**
> - Maîtriser les architectures IAM avancées : **PAM** (Privileged Access Management) et **CIAM** (Customer IAM)
> - Comprendre les faiblesses du MFA traditionnel basés sur SMS/TOTP et la vulnérabilité au Phishing (AitM - Adversary-in-the-Middle)
> - Implémenter l'authentification sans mot de passe résistante au phishing (**Passwordless / Passkeys**) avec **FIDO2 / WebAuthn**
> - Déployer une solution de coffre-fort de mots de passe et sessions privilégiées pour administrateurs (CyberArk, Teleport, HashiCorp Boundary)
>
> **Compétences visées :** `SEC-04` (A), `SEC-05` (A) — Advanced IAM & Passwordless Authentication

---

## Module 1 — Du MFA au Passwordless FIDO2 / WebAuthn (2h)

### 📖 Intuition & Narration

Pendant des années, le MFA par SMS ou application TOTP (Google Authenticator) a été considéré comme le rempart ultime contre le vol d'identifiants. Cependant, les cybercriminels ont développé des kits de phishing modernes de type **AitM (Adversary-in-the-Middle)** comme *Evilginx2*.

L'attaquant dresse un faux site de connexion (proxy). L'utilisateur saisit son mot de passe et son code TOTP. Le proxy relaie ces informations au vrai site, récupère le cookie de session authentifié, et le vole. Le MFA classique est contourné !

La solution définitive est le standard **FIDO2 / WebAuthn (Passkeys)**. Il utilise la cryptographie asymétrique liée au nom de domaine du site web (Origin Bound). La clé privée ne quitte jamais le composant matériel sécurisé du poste ou du téléphone (TPM / Secure Enclave / YubiKey). Il est **mathématiquement impossible d'effectuer du phishing contre une Passkey FIDO2**.

### 🔍 Anatomie Technique — FIDO2 WebAuthn vs Phishing AitM

```
FONCTIONNEMENT D'UN HANDSHAKE FIDO2 / WEBAUTHN (PASSKEY)

  [ NAVIGATEUR CLIENT / WEBAUTHN API ] ──► Challenge du Serveur : Random_Nonce
                 │
                 ▼ (Déverrouillage Biométrique / Empreinte / PIN)
  [ SECURE ENCLAVE / TPM / YUBIKEY ]
  • Vérifie le Nom de Domaine (Origin) : "https://paradis.fr"
  • Signe (Challenge + Origin) avec la Clé Privée FIDO2
                 │
                 ▼
  [ SERVEUR D'AUTHENTIFICATION ]
  • Vérifie la signature avec la Clé Publique FIDO2 enregistrée
  • Vérifie que l'Origin correspond exactement au domaine du serveur
  ──► AUTHENTIFICATION SUCCÈS (Résistance TOTALE au Phishing AitM)
```

---

## Module 2 — Atelier Pratique : WebAuthn Passkey Registration & Verification Engine (2h)

### 🛠️ Code Python : WebAuthn FIDO2 Signature & Challenge Validator

```python
#!/usr/bin/env python3
"""
PARADIS — FIDO2 / WebAuthn Passkey Registration & Authentication Validator
Simule la vérification cryptographique d'une authentification Passwordless FIDO2.
"""

import os
import base64
import json
import hashlib
import sys
from datetime import datetime

class WebAuthnFIDO2Server:
    def __init__(self, rp_id: str, rp_name: str):
        self.rp_id = rp_id       # Relying Party ID (Nom de domaine, ex: "paradis.fr")
        self.rp_name = rp_name
        self.registered_credentials = {} # Base de données : {user_id: {pubkey, sign_count}}

    def generate_authentication_challenge(self, user_id: str) -> dict:
        """Génère un challenge aléatoire pour l'authentification FIDO2."""
        challenge_bytes = os.urandom(32)
        challenge_b64 = base64.urlsafe_b64encode(challenge_bytes).decode().rstrip("=")

        return {
            "rp_id": self.rp_id,
            "challenge_b64": challenge_b64,
            "timeout_ms": 60000,
            "user_id": user_id
        }

    def register_passkey(self, user_id: str, public_key_b64: str):
        """Enregistre la clé publique FIDO2 lors de la création de la Passkey."""
        self.registered_credentials[user_id] = {
            "public_key_b64": public_key_b64,
            "sign_count": 0,
            "created_at": datetime.now().isoformat()
        }
        print(f"[+] Passkey FIDO2 enregistrée avec succès pour l'utilisateur '{user_id}' (Clé Publique stockée).")

    def verify_assertion_response(self, user_id: str, challenge_b64: str, origin: str, client_data_json_b64: str, signature_b64: str) -> bool:
        print(f"=== VÉRIFICATION DE L'AUTHENTIFICATION PASSKEY FIDO2 POUR '{user_id}' ===")

        if user_id not in self.registered_credentials:
            print("[🚨 ERREUR] Utilisateur inconnu ou aucune Passkey enregistrée.")
            return False

        # 1. Décodage de ClientDataJSON
        client_data_raw = base64.urlsafe_b64decode(client_data_json_b64 + "==")
        client_data = json.loads(client_data_raw.decode())

        # 2. Vérification du Challenge
        if client_data.get("challenge") != challenge_b64:
            print("[🚨 TENTATIVE D'ATTAQUE] Challenge WebAuthn ne correspond pas (Replay Attack) !")
            return False

        # 3. VERIFICATION CRITIQUE ANTI-PHISHING : L'Origin doit correspondre au domaine officiel !
        expected_origin = f"https://{self.rp_id}"
        if client_data.get("origin") != expected_origin:
            print(f"[🚨 PHISHING DETECTED] Tentative d'authentification depuis un domaine malveillant ! ({client_data.get('origin')} != {expected_origin})")
            return False

        # 4. En production : Vérification de la signature cryptographique asymétrique (ECC/RSA) avec la clé publique
        cred = self.registered_credentials[user_id]
        cred["sign_count"] += 1

        print(f"[✅ FIDO2 SUCCESS] Authentification Passwordless réussie ! Origin vérifiée ({expected_origin}). Compteur de signatures : {cred['sign_count']}")
        return True

if __name__ == "__main__":
    server = WebAuthnFIDO2Server(rp_id="paradis.fr", rp_name="PARADIS Finance Enterprise")
    user = "alice_devops"

    # 1. Enregistrement simulé
    dummy_pubkey = base64.b64encode(os.urandom(64)).decode()
    server.register_passkey(user, dummy_pubkey)

    # 2. Génération du Challenge
    challenge = server.generate_authentication_challenge(user)

    # 3. Simulation d'une authentification valide
    client_data_valid = json.dumps({
        "type": "webauthn.get",
        "challenge": challenge["challenge_b64"],
        "origin": "https://paradis.fr"
    })
    cdata_b64 = base64.urlsafe_b64encode(client_data_valid.encode()).decode().rstrip("=")
    dummy_sig = base64.b64encode(os.urandom(64)).decode()

    success = server.verify_assertion_response(user, challenge["challenge_b64"], "https://paradis.fr", cdata_b64, dummy_sig)

    # 4. Simulation d'une attaque de Phishing AitM (Domaine du serveur = evil-paradis-login.com)
    print("\n--- TEST DE RÉSISTANTE AU PHISHING AITM ---")
    client_data_phishing = json.dumps({
        "type": "webauthn.get",
        "challenge": challenge["challenge_b64"],
        "origin": "https://evil-paradis-login.com" # Faux domaine du pirate
    })
    cdata_phish_b64 = base64.urlsafe_b64encode(client_data_phishing.encode()).decode().rstrip("=")
    server.verify_assertion_response(user, challenge["challenge_b64"], "https://evil-paradis-login.com", cdata_phish_b64, dummy_sig)
```

---

## Module 3 — Privileged Access Management (PAM) & Zero-Trust Sessions (1h30)

### 🔍 PAM (Privileged Access Management) avec Teleport / CyberArk

La gestion des accès privilégiés (**PAM**) s'applique aux comptes d'administration système (accès SSH, bases de données, clusters Kubernetes).

Principes clés du PAM moderne (ex: Teleport / Boundary) :
1. **Zero Standing Privileges (ZSP)** : Aucun administrateur n'a d'accès permanent `root` ou `cluster-admin`.
2. **Just-In-Time Access (JIT)** : Les privilèges sont accordés sur demande motivée pour une durée très courte (ex: 2 heures).
3. **Session Recording** : Enregistrement vidéo et textuel complet de toutes les commandes tapées dans les sessions SSH/K8s pour l'auditabilité.

---

## Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **PAM** | Privileged Access Management — Gestion des accès privilégiés administrateurs |
| **CIAM** | Customer Identity and Access Management — IAM orienté clients grand public |
| **FIDO2** | Fast Identity Online v2 — Standard ouvert d'authentification forte sans mot de passe |
| **AitM** | Adversary-in-the-Middle — Attaque d'interception de session de type proxy |
| **TPM** | Trusted Platform Module — Puce matérielle sécurisée intégrée à la carte mère |

---

## Exercices Pratiques

### Exercice 1 — Vulnérabilité TOTP vs FIDO2

Expliquez pourquoi une attaque par Phishing proxy (AitM — Evilginx2) réussit contre un code TOTP (Google Authenticator) mais échoue systématiquement contre FIDO2 / WebAuthn.

**Corrigé guidé :**
Avec TOTP, l'utilisateur tape un code à 6 chiffres qu'il peut transmettre à n'importe quel site web (même un faux site miroir). Le pirate intercepte ce code et le relaie immédiatement au vrai site.
Avec FIDO2, le navigateur et la puce matérielle (TPM/Secure Enclave) signent cryptographiquement le nom de domaine exact (**Origin**) affiché dans la barre d'adresse (`https://paradis.fr`). Si l'utilisateur est sur `https://evil-login.com`, le navigateur transmet `evil-login.com` dans la signature FIDO2, que le serveur d'authentification officiel rejette immédiatement.

---

## Banque QCM — 5 Questions

**Q1.** Pourquoi le standard d'authentification **FIDO2 / WebAuthn (Passkeys)** est-il qualifié de "résistant au phishing" ?

- A) Parce qu'il utilise des mots de passe très longs.
- B) Parce que la signature cryptographique générée par le composant matériel du poste intègre et vérifie l'Origine (nom de domaine) exacte du site web, rendant les proxies de phishing (AitM) inopérants. ✅
- C) Parce qu'il est payant.
- D) Parce qu'il n'utilise pas d'électricité.

**Q2.** Dans une solution de **Privileged Access Management (PAM)** moderne, que signifie le principe **Just-In-Time (JIT) Access** ?

- A) Donner des accès permanents à tous les administrateurs.
- B) Ne délivrer des privilèges d'administration qu'au moment précis de la demande et pour une durée strictement limitée (ex: 2 heures). ✅
- C) Arriver à l'heure aux réunions.
- D) Réduire le temps de chargement des pages web.

**Q3.** Où est conservée la **Clé Privée FIDO2** lors de la création d'une Passkey sur un ordinateur portable moderne ?

- A) Dans un fichier texte sur le bureau.
- B) Dans le composant matériel de sécurité inviolable du poste (TPM, Secure Enclave ou YubiKey). ✅
- C) Sur le serveur cloud d'Google.
- D) Dans la boîte de réception e-mail.

**Q4.** Que désigne le terme **AitM (Adversary-in-the-Middle)** dans le contexte de l'authentification ?

- A) Un jeu de société.
- B) Une technique d'attaque où un proxy malveillant s'interpose entre l'utilisateur et le vrai site pour intercepter les mots de passe et les jetons de session MFA. ✅
- C) Un middleware de base de données.
- D) Un câble réseau blindé.

**Q5.** Quel est le rôle de la fonctionnalité **Session Recording** dans un bastion d'administration PAM comme Teleport ?

- A) Enregistrer la musique d'ambiance de la salle des serveurs.
- B) Capturer et enregistrer intégralement sous forme de logs auditables toutes les commandes et sessions exécutées par les administrateurs. ✅
- C) Sauvegarder les fichiers MP3 des utilisateurs.
- D) Éteindre les écrans.

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
