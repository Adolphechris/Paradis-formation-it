# TOME P4 — Cloud, DevOps & SecOps — Jour 174 (6h) : Authentification & Sécurité des APIs (JWT, OAuth2, Rate Limiting, CORS & OWASP API Top 10)

> [!NOTE]
> **Objectif du jour :** Sécuriser les APIs RESTful d'une institution financière selon les standards de l'industrie : authentification stateless par **JSON Web Tokens (JWT)**, protocole d'autorisation **OAuth 2.0 / OpenID Connect (OIDC)**, protection contre les attaques de déni de service via **Rate Limiting**, configuration stricte de **CORS (Cross-Origin Resource Sharing)** et remédiation des vulnérabilités de l'**OWASP API Security Top 10**.
>
> **Compétences visées :** `SEC-05` (A) — Authentification JWT & Sécurité APIs REST | `SEC-04` (A) — OWASP API Top 10 & OAuth2/OIDC

---

## 1) Module — Authentification Stateless JWT vs OAuth 2.0 / OIDC (2h)

### 📖 Narration/Intuition

Comment une application mobile bancaire prouve-t-elle au serveur backend que l'utilisateur est authentifié sans forcer le serveur à conserver des millions de sessions actives en mémoire RAM ?

Grâce au **JSON Web Token (JWT)**. Un JWT est un jeton autonome cryptographiquement signé (stateless) contenant les identifiants et rôles de l'utilisateur. Le serveur n'a pas besoin d'interroger une base de données pour vérifier la session : il lui suffit de valider la **signature numérique** du jeton avec sa clé publique/privée.

### 🔍 Anatomie Technique

**Structure d'un JSON Web Token (JWT) :**

```
HEADER . PAYLOAD . SIGNATURE

1. Header (Algorithme & Type) :
   {"alg": "RS256", "typ": "JWT"}

2. Payload (Claims / Données de session) :
   {
     "sub": "usr_998811",
     "name": "Kabila Adolphe",
     "role": "BANQUIER_REGIONAL",
     "iss": "https://auth.bcc.cd",
     "exp": 1786050000
   }

3. Signature (Chiffrement asymétrique HMAC-SHA256 ou RSA) :
   RSASHA256(base64(Header) + "." + base64(Payload), SecretKey)
```

**Distinction OAuth 2.0 vs OpenID Connect (OIDC) :**
- **OAuth 2.0** : Protocole d'**Autorisation** (Permet à une application tierce d'accéder à des ressources au nom de l'utilisateur via des Access Tokens).
- **OpenID Connect (OIDC)** : Couche d'**Authentification** au-dessus d'OAuth 2.0 qui fournit un `id_token` contenant l'identité vérifiée de l'utilisateur.

---

## 2) Module — OWASP API Security Top 10 & Protections Réseau (2h)

### 📖 Narration/Intuition

Les APIs RESTful sont devenues la cible privilégiée des hackers. L'OWASP publie le classement **API Security Top 10** des vulnérabilités les plus dévastatrices.

La vulnérabilité #1 est **BOLA (Broken Object Level Authorization)** : un utilisateur authentifié modifie l'ID dans l'URL (`/api/v1/accounts/101` ──► `/api/v1/accounts/102`) et parvient à consulter le compte d'un autre utilisateur car l'API a vérifié le mot de passe mais n'a pas vérifié si cet utilisateur précis avait le droit d'accéder à cet objet précis.

### 🔍 Anatomie Technique

**Protections Réseau pour APIs Express (`security_middlewares.js`) :**

```javascript
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const cors = require('cors');

// 1. Helmet : Sécurisation des en-têtes HTTP (Anti-XSS, Anti-Sniffing)
app.use(helmet());

// 2. CORS Stricte : Autoriser uniquement le domaine officiel du portail bancaire BCC
const corsOptions = {
    origin: 'https://portail.bcc.cd',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
};
app.use(cors(corsOptions));

// 3. Rate Limiting : Prévention DoS / Brute-Force (Max 100 requêtes par 15 min par IP)
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100,
    message: { status: 429, message: "Trop de requêtes. Accès temporairement bloqué (Anti-DoS)." }
});
app.use('/api/', apiLimiter);
```

---

## 3) Module — Laboratoire Pratique : Middleware de Vérification JWT & BOLA Fix (2h)

### 📖 Narration/Intuition

Implémentons le middleware de sécurité d'authentification JWT et la vérification des autorisations au niveau de l'objet (BOLA Fix).

### 🔍 Anatomie Technique

**Middleware d'authentification JWT et vérification de propriété (`authMiddleware.js`) :**

```javascript
const jwt = require('jsonwebtoken');
const JWT_PUBLIC_KEY = process.env.JWT_PUBLIC_KEY;

// 1. Middleware d'Authentification JWT
exports.verifyJwtToken = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ status: "ERROR", message: "Accès refusé. Token JWT manquant." });
    }

    const token = authHeader.split(' ')[1];

    try {
        // Vérification de la signature cryptographique et de la date d'expiration
        const decoded = jwt.verify(token, JWT_PUBLIC_KEY, { algorithms: ['RS256'] });
        req.user = decoded; // Attacher les claims de l'utilisateur à la requête
        next();
    } catch (error) {
        return res.status(403).json({ status: "ERROR", message: "Token JWT invalide ou expiré." });
    }
};

// 2. Middleware de Prévention BOLA (Broken Object Level Authorization)
exports.verifyAccountOwnership = async (req, res, next) => {
    const requestedAccountId = req.params.accountId;
    const authenticatedUserId = req.user.sub; // ID extrait du JWT vérifié

    // Vérifier en BDD que le compte appartient bien à l'utilisateur connecté
    const isOwner = await db.checkOwnership(requestedAccountId, authenticatedUserId);

    if (!isOwner && req.user.role !== 'SUPER_ADMIN') {
        // Alerte de Sécurité BOLA
        console.warn(`🚨 TENTATIVE D'INTRUSION BOLA : L'utilisateur ${authenticatedUserId} a tenté d'accéder au compte ${requestedAccountId}`);
        return res.status(403).json({ status: "ERROR", message: "Accès interdit : Vous n'êtes pas propriétaire de cette ressource." });
    }

    next();
};
```

---

## 🏅 Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **JWT** | JSON Web Token — Standard RFC 7519 d'échange sécurisé de jetons autonomes |
| **OIDC** | OpenID Connect — Couche d'authentification basée sur le protocole OAuth 2.0 |
| **BOLA** | Broken Object Level Authorization — Vulnérabilité #1 OWASP API Security |
| **CORS** | Cross-Origin Resource Sharing — Mécanisme de sécurité des navigateurs restreignant les requêtes cross-domain |

---

## 🏋️ Exercices & Corrigés

**Exercice 1 :** Quelle est la différence majeure entre une vulnérabilité **BBA (Broken Authentication)** et une vulnérabilité **BOLA (Broken Object Level Authorization)** selon l'OWASP API Security Top 10 ?

**Corrigé :** **BBA (Broken Authentication)** concerne l'échec de la vérification de l'identité de l'utilisateur (ex: mots de passe faibles, tokens JWT non signés, absence de MFA). L'attaquant parvient à se faire passer pour un autre utilisateur. **BOLA (Broken Object Level Authorization)** concerne l'échec du contrôle d'accès sur une ressource spécifique **après** que l'utilisateur s'est valablement authentifié. L'utilisateur est légitimement connecté avec son propre compte, mais l'API omet de vérifier s'il a le droit de lire ou modifier l'objet spécifique (ex: `/api/accounts/999`) demandé dans l'URL.

**Exercice 2 :** Pourquoi est-il fortement déconseillé de stocker des jetons **JWT d'authentification** sensibles dans le `localStorage` du navigateur web, et quelle est l'alternative sécurisée ?

**Corrigé :** Le `localStorage` de HTML5 est accessible par n'importe quel code JavaScript s'exécutant sur la page. Si l'application web souffre d'une vulnérabilité de type **XSS (Cross-Site Scripting)**, un script malveillant injecté par l'attaquant peut lire le `localStorage`, voler le JWT et prendre le contrôle total de la session bancaire de la victime. L'alternative hautement sécurisée consiste à transmettre le token dans un **Cookie HTTP-Only et Secure** (`Set-Cookie: token=...; HttpOnly; Secure; SameSite=Strict`). Un cookie marqué `HttpOnly` est totalement inaccessible au code JavaScript, protégeant le jeton contre le vol par XSS.

---

## ❓ Banque de Questions & Test du Jour

**Q1 :** Quelle est la structure en trois parties séparées par des points d'un JSON Web Token (JWT) ?
- A) Header . Payload . Signature
- B) User . Password . Key
- C) HTML . CSS . JS
- D) XML . JSON . YAML

**Réponse : A**

**Q2 :** Quelle est la vulnérabilité #1 du classement OWASP API Security Top 10 où un utilisateur authentifié accède aux données d'un autre utilisateur en modifiant l'ID de la ressource dans la requête ?
- A) BOLA (Broken Object Level Authorization)
- B) SQLi
- C) CSRF
- D) Buffer Overflow

**Réponse : A**

**Q3 :** Quel protocole standard d'authentification fondé sur OAuth 2.0 fournit un `id_token` contenant les informations d'identité vérifiées de l'utilisateur ?
- A) OpenID Connect (OIDC)
- B) FTP
- C) Telnet
- D) POP3

**Réponse : A**

**Q4 :** Quel middleware Express permet de limiter le nombre de requêtes HTTP par adresse IP sur une période donnée pour protéger l'API contre les attaques DoS et de Brute-Force ?
- A) Rate Limiting (`express-rate-limit`)
- B) Body Parser
- C) Cookie Parser
- D) Router

**Réponse : A**

**Q5 :** Quel en-tête de sécurité de Cookie empêche formellement le code JavaScript d'accéder au jeton d'authentification, éradiquant le risque de vol par injection XSS ?
- A) `HttpOnly`
- B) `Public`
- C) `Allow-All`
- D) `Debug`

**Réponse : A**

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
