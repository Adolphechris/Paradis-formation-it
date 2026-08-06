# TOME P3 — Cloud Native, DevOps & Cyberdéfense — Jour 134 (6h) : Sécurité des Infrastructures Multi-Cloud & Mesh d'Identités (HashiCorp Boundary, SPIRE Multi-Cluster & Cloud Federation)

> [!NOTE]
> **Objectif du jour :** Automatiser la gestion des accès distants sécurisés et la fédération d'identités multi-cloud sans VPN traditionnel : accès d'administration Zero Trust avec HashiCorp Boundary, fédération d'identités de workloads multi-clusters avec SPIRE Multi-Cluster Federation et accès basé sur l'identité (Identity-Based Access).
>
> **Compétences visées :** `SEC-01` (A) — IAM Multi-Cloud & Zero Trust Access | `BIT-08` (A) — Boundary & Multi-Cluster SPIRE

---

## 1) Module — Accès d'Administration Zero Trust avec HashiCorp Boundary (2h)

### 📖 Narration/Intuition

Dans les architectures d'entreprise modernes distribuées sur plusieurs clouds et datacenters, donner un accès VPN traditionnel aux administrateurs ou prestataires est un risque majeur : un VPN connecte le poste de l'utilisateur directement au sous-réseau IP complet de l'entreprise.

**HashiCorp Boundary** réinvente l'accès d'administration selon le modèle Zero Trust : **aucun accès au réseau n'est accordé**. L'administrateur s'authentifie auprès de Boundary (via OIDC/Keycloak). Boundary lui ouvre un canal chiffré temporaire vers la cible exacte (ex: une instance PostgreSQL ou un serveur SSH spécifique) sans jamais exposer le réseau sous-jacent ni lui confier de secrets statiques.

### 🔍 Anatomie Technique

**Architecture HashiCorp Boundary :**

```
Administrateur (Poste de Travail)            Boundary Controller (Auth OIDC)          Boundary Worker & Cible (BDD)
┌───────────────────────────┐                ┌───────────────────────────┐            ┌───────────────────────────┐
│ boundary connect postgres │───────────────→│ 1. Authentification &     │            │                           │
│ (Reçoit session temporaire│                │    Évaluation des droits  │            │                           │
│  sur localhost:5432)      │                └─────────────┬─────────────┘            │                           │
│                           │                              │                          │                           │
│                           │ 2. Ouvre un tunnel chiffré via le Worker ──────────────→│ Session PostgreSQL ouverte│
│                           │    (Pas d'accès au sous-réseau IP)                      │ (10.0.20.200:5432)        │
└───────────────────────────┘                                                         └───────────────────────────┘
```

---

## 2) Module — SPIRE Multi-Cluster Federation (2h)

### 📖 Narration/Intuition

Lorsque la BCC exploite plusieurs clusters Kubernetes distants (ex: Cluster On-Premises à Kinshasa et Cluster Cloud dans AWS), un microservice du cluster Kinshasa doit pouvoir prouver son identité cryptographique SVID auprès d'un microservice s'exécutant dans AWS sans partager de clés d'API.

**SPIRE Federation** permet à deux domaines de confiance SPIRE indépendants d'échanger leurs clés publiques de manière sécurisée (Bundle Endpoint) pour vérifier mutuellement les certificats SVID émis par l'autre cluster.

### 🔍 Anatomie Technique

**Configuration de la Fédération SPIRE (`spire-federation-config.hcl`) :**

```hcl
# Configuration de la Fédération SPIRE entre le Domaine Kinshasa et AWS
trust_domain = "bcc-kinshasa.internal"

federates_with "bcc-aws.cloud" {
  bundle_endpoint_url = "https://spire-bundle.aws.bcc.cd:8443"
  bundle_endpoint_profile "https_spiffe" {
    endpoint_spiffe_id = "spiffe://bcc-aws.cloud/spire/server"
  }
}
```

---

## 3) Module — Administration Zero Trust via la CLI Boundary (2h)

### 📖 Narration/Intuition

Pour les équipes d'exploitation, se connecter à une base de données sensible ou un serveur SSH s'effectue en une seule ligne de commande simple, entièrement auditée dans le SIEM.

### 🔍 Anatomie Technique

**Commandes CLI Boundary pour l'accès sécurisé :**

```bash
# 1. Authentification de l'administrateur auprès du Controller Boundary via OIDC / Keycloak
boundary authenticate oidc -auth-method-id=amoidc_123456789

# 2. Lister les cibles autorisées (Target Resources) pour cet utilisateur
boundary targets list -scope-id=p_bcc_production

# 3. Établir une connexion sécurisée à une base de données PostgreSQL sans connaître son IP
boundary connect postgres -target-id=ttcp_pg_prod_db -- -U postgres -d bcc_banking
```

---

## 🏅 Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **Boundary** | Solution HashiCorp d'accès d'administration Zero Trust basé sur l'identité |
| **SVID** | SPIFFE Verifiable Identity Document — Certificat cryptographique d'identité de service |
| **Identity-Based Access** | Contrôle d'accès basé exclusivement sur l'identité vérifiée et non sur l'IP |

---

## 🏋️ Exercices & Corrigés

**Exercice 1 :** Pourquoi la solution d'accès **HashiCorp Boundary** est-elle plus sécurisée qu'un accès par **VPN d'entreprise traditionnel** pour l'administration des serveurs ?

**Corrigé :** Un **VPN traditionnel** fonctionne au niveau de la couche réseau (L3) : une fois le tunnel établi, le poste de l'utilisateur est virtuellement connecté au sous-réseau IP complet de l'entreprise, lui permettant de répertorier et scanner les autres serveurs du réseau. **HashiCorp Boundary** fonctionne au niveau de la couche d'application et de l'identité : **aucun accès réseau n'est accordé à l'utilisateur**. Boundary établit un tunnel chiffré éphémère d'hôte à hôte uniquement vers la cible applicative exacte autorisée (ex: une seule base de données sur un port spécifique), empêchant tout déplacement latéral ou scan de réseau.

**Exercice 2 :** Comment la **Fédération SPIRE (SPIRE Federation)** permet-elle d'établir une connexion mTLS sécurisée entre deux microservices s'exécutant dans des clusters Kubernetes totalement distants ?

**Corrigé :** Chaque cluster Kubernetes possède son propre domaine de confiance SPIRE (ex: `spiffe://cluster-kinshasa` et `spiffe://cluster-aws`). Via la **Fédération SPIRE**, les deux serveurs SPIRE échangent de manière sécurisée leur bundle de clés publiques de CA (Certificate Authority). Lorsqu'un microservice de Kinshasa présente son certificat SVID au microservice d'AWS lors du handshake mTLS, le microservice d'AWS utilise le bundle fédéré pour vérifier la signature du certificat SVID, établissant une confiance cryptographique mutuelle instantanée sans passer par une autorité de certification publique.

---

## ❓ Banque de Questions & Test du Jour

**Q1 :** Quelle solution open-source d'HashiCorp permet de gérer l'accès d'administration Zero Trust aux serveurs et bases de données en fonction de l'identité, sans accorder d'accès réseau VPN global ?
- A) HashiCorp Boundary
- B) MS Paint
- C) Disquette
- D) Lecteur DVD

**Réponse : A**

**Q2 :** Quel composant de l'architecture SPIRE permet à deux clusters Kubernetes distants d'échanger leurs bundles de clés publiques pour vérifier les identités SVID inter-clusters ?
- A) SPIRE Federation
- B) Telnet
- C) POP3
- D) FTP

**Réponse : A**

**Q3 :** Comment un administrateur s'authentifie-t-il auprès d'HashiCorp Boundary pour obtenir une session d'accès temporaire ?
- A) Via un fournisseur d'identité OIDC / SSO (ex: Keycloak / Azure AD)
- B) En écrivant sur une disquette
- C) En appelant le standardiste
- D) Par envoi de fax

**Réponse : A**

**Q4 :** Que se passe-t-il lorsqu'un administrateur ferme sa session de connexion établie via `boundary connect` ?
- A) Le tunnel temporaire et l'autorisation d'accès sont immédiatement fermés et révoqués par le Worker Boundary
- B) Le serveur s'éteint
- C) L'adresse IP change
- D) La base de données est supprimée

**Réponse : A**

**Q5 :** Quel est le principe de l'accès basé sur l'identité (Identity-Based Access Control) ?
- A) Accorder des droits d'accès uniquement sur la base de l'identité vérifiée de l'utilisateur/service et du moindre privilège, indépendamment de son adresse IP ou de sa localisation réseau
- B) Autoriser toutes les IPs
- C) Supprimer les mots de passe
- D) Bloquer le Wi-Fi

**Réponse : A**

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
