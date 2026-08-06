# TOME P5 — Cybersécurité Avancée & Red/Blue Team — Jour 237 (6h) : IAM Avancé & Identité des Charge de Travail (OAuth 2.0 Token Exchange RFC 8693, SPIFFE/SPIRE Workload Identity, Passkeys FIDO2 & WebAuthn)

> [!NOTE]
> **Objectif du jour :** Maîtriser les architectures modernes d’**Identity & Access Management (IAM)** avancées : implémentation du standard **OAuth 2.0 Token Exchange (RFC 8693)** pour la délégation sécurisée de jetons inter-services, déploiement du framework **SPIFFE/SPIRE** pour l'attribution d'identités cryptographiques aux workloads (conteneurs/microservices sans secrets statiques), et généralisation de l'authentification sans mot de passe résistante au hameçonnage (**Passkeys / FIDO2 / WebAuthn**).
>
> **Compétences visées :** `SEC-04` (A) — Advanced IAM & Workload Identity SPIFFE/SPIRE | `SEC-05` (A) — OAuth 2.0 RFC 8693 Token Exchange & FIDO2 Passkeys WebAuthn

---

## 1) Module — Workload Identity & Framework SPIFFE/SPIRE (2h)

### 📖 Narration/Intuition

Dans une architecture Zero Trust (J230), l'authentification des **humains** se fait via FIDO2/MFA. Mais comment authentifier de manière fiable et automatique les **machines et microservices** (les workloads) qui communiquent entre eux dans le cluster Kubernetes de la BCC ?

Stocker des clés API ou des certificats statiques dans des fichiers de configuration est dangereux (risques de fuites sur GitHub). Le projet **SPIFFE/SPIRE** (CNCF) résout ce problème en attribuant dynamiquement une identité cryptographique (un jeton SVID X.509/JWT) à chaque workload en fonction de ses caractéristiques d'exécution.

### 🔍 Anatomie Technique

**Architecture SPIFFE/SPIRE :**

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       ARCHITECTURE SPIFFE / SPIRE (BCC)                     │
├─────────────────────────────────────────────────────────────────────────────┤
│  1. SPIFFE ID (Format d'URI d'Identité)                                     │
│     spiffe://bcc-mnbc.cd/ns/mnbc-production/sa/settlement-service           │
├─────────────────────────────────────────────────────────────────────────────┤
│  2. SPIRE Server (Autorité de Certification racine interne)                 │
│     ├── Valide les nœuds via Node Attestation (AWS IAM / TPM)               │
│     └── Émet les certificats SVID (Short-lived X.509 certs, validité 1h)     │
├─────────────────────────────────────────────────────────────────────────────┤
│  3. SPIRE Agent (Exécuté sur chaque nœud Kubernetes)                        │
│     ├── Workload Attestation : Atteste le Pod (Namespace, SA, Image Hash)   │
│     └── Fournit le SVID au microservice via le Workload API Socket          │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Interaction avec le Workload API SPIRE en Python (`spire_workload.py`) :**

```python
import socket

# Le microservice BCC interroge le socket UNIX local de l'Agent SPIRE
# Aucun secret ou clé privée n'est stocké sur disque !
SPIRE_SOCKET_PATH = "/tmp/spire-agent/public/api.sock"

# Récupération de l'identité SVID X.509 attribuée dynamiquement
def get_spiffe_svid():
    client = socket.socket(socket.AF_UNIX, socket.SOCK_STREAM)
    client.connect(SPIRE_SOCKET_PATH)
    # Le serveur SPIRE vérifie le PID/UID du processus appelant (Attestation)
    # et retourne le certificat client mTLS correspondant à son SPIFFE ID.
    print("✅ Identité SPIFFE récupérée automatiquement sans secret statique !")
```

---

## 2) Module — OAuth 2.0 Token Exchange (RFC 8693) (2h)

### 📖 Narration/Intuition

Lorsque la banque commerciale "Rawbank" appelle l'API Gateway BCC pour effectuer un virement, l'API Gateway doit transmettre cette requête au microservice de settlement, puis au registre Blockchain.

Si l'API Gateway passe directement le jeton de l'utilisateur final au microservice interne, on viole le principe du moindre privilège. La norme **RFC 8693 (OAuth 2.0 Token Exchange)** permet à l'API Gateway d'échanger le jeton client contre un **jeton interne restreint** spécifique au service cible.

### 🛠️ Atelier Pratique

**Flux Token Exchange RFC 8693 (`token_exchange.py`) :**

```python
import requests

TOKEN_ENDPOINT = "https://auth.bcc-mnbc.cd/oauth/token"

# Jeton JWT d'origine reçu de la banque partenaire (subject_token)
user_access_token = "eyJhbGciOiJSUzI1Ni..."

# Échange de jeton (Token Exchange Request RFC 8693)
payload = {
    "grant_type": "urn:ietf:params:oauth:grant-type:token-exchange",
    "client_id": "api-gateway-service",
    "client_secret": "secret_gateway_bcc",
    "subject_token": user_access_token,
    "subject_token_type": "urn:ietf:params:oauth:token-type:access_token",
    "requested_token_type": "urn:ietf:params:oauth:token-type:access_token",
    "audience": "urn:bcc:settlement-service", # Restreint au service de settlement
    "scope": "mnbc:write"
}

resp = requests.post(TOKEN_ENDPOINT, data=payload)
downstream_token = resp.json()["access_token"]
print("✅ Nouveau jeton interne échangé (Portée restreinte) :", downstream_token[:30] + "...")
```

---

## 3) Module — Phishing-Resistant Auth : FIDO2 / WebAuthn & Passkeys (2h)

### 🛠️ Atelier Pratique

**Fonctionnement WebAuthn / FIDO2 (`webauthn_flow.js`) :**

```javascript
// Enregistrement d'une clé FIDO2 / Passkey côté navigateur client (WebAuthn API)

async function registerPasskey() {
  const challenge = new Uint8Array(32);
  window.crypto.getRandomValues(challenge);

  const publicKeyCredentialCreationOptions = {
    challenge: challenge,
    rp: { name: "Banque Centrale du Congo", id: "bcc-mnbc.cd" },
    user: {
      id: Uint8Array.from("USER_12345", c => c.charCodeAt(0)),
      name: "analyste@bcc.cd",
      displayName: "Analyste BCC"
    },
    pubKeyCredParams: [{ alg: -7, type: "public-key" }], // ES256 (ECDSA P-256)
    authenticatorSelection: {
      authenticatorAttachment: "cross-platform", // YubiKey ou Passkey mobile
      userVerification: "required" // PIN ou Empreinte biométrique requis
    },
    timeout: 60000
  };

  // Déclenche l'invite matérielle (YubiKey / TouchID)
  const credential = await navigator.credentials.create({
    publicKey: publicKeyCredentialCreationOptions
  });

  console.log("✅ Clef FIDO2 enregistrée — Résistante au Hameçonnage (Anti-Phishing) !");
}
```

---

## 🏅 Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **SPIFFE** | Secure Production Identity Framework for Everyone — Standard d'identité de workloads |
| **SPIRE** | SPIFFE Runtime Environment — Implémentation de référence du standard SPIFFE |
| **SVID** | SPIFFE Verifiable Identity Document — Document d'identité (certificat X.509 ou JWT) |
| **FIDO2** | Fast Identity Online 2 — Standard d'authentification forte sans mot de passe |
| **WebAuthn** | Web Authentication API — API W3C permettant l'authentification FIDO2 dans les navigateurs |
| **RFC 8693** | Spécification IETF décrivant le protocole OAuth 2.0 Token Exchange |

---

## 🏋️ Exercices & Corrigés

**Exercice 1 :** Pourquoi l’authentification **FIDO2 / WebAuthn (Passkeys)** est-elle qualifiée de **résistante au hameçonnage (Phishing-Resistant)** contrairement au MFA classique par SMS ou TOTP (Google Authenticator) ?

**Corrigé :** Les méthodes MFA classiques (SMS, TOTP) sont vulnérables aux attaques de type **Man-in-the-Middle (MitM) via proxy inverse** (ex: Evilginx2, voir J208). L'attaquant intercepte le code TOTP saisi par la victime sur un faux site d'hameçonnage et le rejoue en temps réel sur le vrai site. **FIDO2 / WebAuthn** utilise une signature cryptographique asymétrique liée au **nom de domaine (Origin)**. Lors de la signature du challenge par la clé matérielle (YubiKey / Passkey), le navigateur injecte automatiquement le véritable nom de domaine affiché dans la barre d'adresse (`rpId`). Si l'utilisateur est sur un site de phishing `bcc-fake.cd`, la signature FIDO2 est calculée sur ce faux domaine et sera systématiquement **rejetée par le serveur légitime** `bcc-mnbc.cd`. Il est techniquement impossible pour l'utilisateur de se faire piéger.

**Exercice 2 :** Quel problème de sécurité majeur résout le déploiement de **SPIFFE/SPIRE** pour l'authentification inter-microservices dans un cluster Kubernetes ?

**Corrigé :** SPIFFE/SPIRE résout le problème dit du **"Secret Zero"** (comment délivrer un premier secret à une application sans le hardcoder quelque part). Sans SPIFFE/SPIRE, les microservices doivent utiliser des secrets statiques (mots de passe BDD, tokens de service, clés API) stockés dans des fichiers ou des variables d'environnement, qui finissent par fuiter ou ne sont jamais renouvelés. SPIFFE/SPIRE délivre des certificats X.509 **éphémères** (durée de vie très courte, ex: 1 heure) directement en mémoire via un socket local Unix (`Workload API`), après avoir vérifié cryptographiquement l'identité et l'intégrité du pod (Attestation). Le renouvellement est automatique et transparent.

---

## ❓ Banque de Questions & Test du Jour

**Q1 :** Quel standard d'identité open-source de la CNCF définit un format d'URI d'identité structuré (`spiffe://domain/ns/name`) pour les conteneurs et microservices ?
- A) SPIFFE
- B) OAuth2
- C) SAML 2.0
- D) Kerberos

**Réponse : A**

**Q2 :** Quelle spécification IETF (RFC 8693) définit le protocole permettant à un service d'échanger un jeton d'accès d'origine contre un nouveau jeton d'accès à portée restreinte pour un service aval ?
- A) OAuth 2.0 Token Exchange (RFC 8693)
- B) OIDC Core 1.0
- C) RFC 7519 (JWT)
- D) RFC 6749

**Réponse : A**

**Q3 :** Pourquoi l'authentification FIDO2 / WebAuthn (Passkeys) est-elle totalement immunisée contre les attaques d'ingénierie sociale et d'Evilginx2 ?
- A) La signature cryptographique dépend strictement de l'Origin (nom de domaine) vérifié par le navigateur
- B) Elle utilise des mots de passe de 64 caractères
- C) Elle nécessite un réseau VPN
- D) Elle envoie des SMS chiffrés

**Réponse : A**

**Q4 :** Quelle est la durée de vie typique des certificats X.509 (SVID) émis par SPIRE pour limiter l'impact en cas de compromission d'un Pod ?
- A) Très courte (ex: 1 heure), renouvelée automatiquement
- B) 1 an
- C) 10 ans
- D) Infinie

**Réponse : A**

**Q5 :** Dans le standard WebAuthn, quelle API JavaScript du navigateur est appelée pour initier la création d'une Passkey sur une YubiKey ou un capteur biométrique ?
- A) `navigator.credentials.create()`
- B) `fetch('/login')`
- C) `window.localStorage.setItem()`
- D) `document.cookie`

**Réponse : A**

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
