# TOME P3 — Cloud Native, DevOps & Cyberdéfense — Jour 111 (6h) : Architectures Multi-Region Cloud & Global Traffic Management (Route53, CloudFront & AWS Global Accelerator)

> [!NOTE]
> **Objectif du jour :** Concevoir et administrer des architectures cloud déployées sur plusieurs régions géographiques distantes (Multi-Region Cloud Architecture) : routage DNS intelligent (Route 53 Geolocation/Latency/Failover), distribution de contenu mondiale (CloudFront CDN) et accélération de trafic IP fixe (AWS Global Accelerator).
>
> **Compétences visées :** `BIT-04` (A) — Architectures Cloud Multi-Régions | `BIT-08` (A) — Global Traffic Management & CDN

---

## 1) Module — Modèles Multi-Régions Cloud & Stratégies de Routage DNS (2h)

### 📖 Narration/Intuition

Pour garantir une disponibilité maximale et respecter les contraintes de souveraineté numérique, la Banque Centrale du Congo doit pouvoir distribuer ses applications sur plusieurs régions cloud distantes (ex: AWS Paris `eu-west-3` et AWS Afrique du Sud `af-south-1`).

Le **Global Traffic Management (GTM)** s'appuie sur le DNS intelligent (**AWS Route 53**) pour diriger automatiquement les utilisateurs vers la région la plus proche (Latency Routing) ou basculer en quelques secondes vers une région de secours en cas de sinistre majeur (Failover Routing).

### 🔍 Anatomie Technique

**Politiques de Routage DNS AWS Route 53 :**

```
┌─────────────────────────────────────────────────────────────┐
│ 1. LATENCY-BASED ROUTING (Routage par Latence)             │
│    Redirige l'utilisateur vers la région AWS offrant la     │
│    latence réseau minimale mesurée en temps réel.           │
└─────────────────────────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. GEOLOCATION ROUTING (Routage Géographique)               │
│    Redirige les requêtes selon le pays d'origine IP.        │
│    (Ex: IPs Congo -> Region af-south-1, IPs Europe -> eu-west-3)│
└─────────────────────────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. FAILOVER ROUTING (Routage avec Basculement Automatique) │
│    - Primary Region (Santé OK)  -> 100% du trafic           │
│    - Secondary Region (Secours) -> Activée si Primary DOWN  │
└─────────────────────────────────────────────────────────────┘
```

---

## 2) Module — CDN & Web Application Firewall Distribué (AWS CloudFront & WAF) (2h)

### 📖 Narration/Intuition

Un **Content Delivery Network (CDN)** comme AWS CloudFront met en cache les contenus statiques (JS, CSS, images) et les réponses d'API sur plus de 400 Points de Présence (PoP) dans le monde. En y combinant **AWS WAF**, chaque PoP filtre les attaques OWASP Top 10 (SQLi, XSS) à la frontière du réseau avant qu'elles n'atteignent le serveur d'origine.

### 🔍 Anatomie Technique

**Manifeste Terraform CloudFront + AWS WAF (`cloudfront_multi_region.tf`) :**

```hcl
# cloudfront_multi_region.tf — CDN & WAF Global pour la BCC

resource "aws_cloudfront_distribution" "bcc_cdn" {
  origin {
    domain_name = "api-primary.bcc.cd"
    origin_id   = "Origin-Primary-Paris"

    custom_origin_config {
      http_port              = 80
      https_port             = 443
      origin_protocol_policy = "https-only"
      origin_ssl_protocols   = ["TLSv1.3"]
    }
  }

  enabled             = true
  is_ipv6_enabled     = true
  comment             = "CDN Global BCC Interbank"
  default_root_object = "index.html"

  # Intégration du Web Application Firewall au niveau Global (CloudFront Edge)
  web_acl_id = aws_wafv2_web_acl.bcc_waf_global.arn

  default_cache_behavior {
    allowed_methods  = ["DELETE", "GET", "HEAD", "OPTIONS", "PATCH", "POST", "PUT"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = "Origin-Primary-Paris"

    forwarded_values {
      query_string = true
      headers      = ["Authorization", "Host"]
      cookies { forward = "all" }
    }

    viewer_protocol_policy = "redirect-to-https"
    min_ttl                = 0
    default_ttl            = 300
    max_ttl                = 86400
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    cloudfront_default_certificate = true
  }
}
```

---

## 3) Module — AWS Global Accelerator & IP Anycast (2h)

### 📖 Narration/Intuition

La résolution DNS classique (Route 53) peut être ralentie par la mise en cache DNS des fournisseurs d'accès (TTL). **AWS Global Accelerator** résout ce problème en fournissant **deux adresses IP statiques mondiales Anycast**.

Le trafic entrant sur ces IPs Anycast est immédiatement capté par le nœud de bordure AWS le plus proche de l'utilisateur et acheminé sur le réseau de fibre optique privé d'AWS (plutôt que sur l'Internet public), réduisant la latence de 30% à 60%.

### 🔍 Anatomie Technique

**Architecture de Global Accelerator :**

```
Client (Kinshasa) ─── IP Anycast Fixe (1.2.3.4) ───> AWS Edge PoP (Luanda)
                                                          │
                                                          │ Réseau de Fibre Optique
                                                          │ Privé AWS (Ultra Fast)
                                                          ▼
                                                  AWS VPC (eu-west-3)
```

---

## 🏅 Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **GTM** | Global Traffic Management — Gestion et routage du trafic réseau à l'échelle mondiale |
| **CDN** | Content Delivery Network — Réseau de distribution de contenu distribué aux frontières |
| **PoP** | Point of Presence — Point de présence réseau physique localisé |
| **TTL** | Time To Live — Durée de mise en cache d'un enregistrement DNS ou objet web |

---

## 🏋️ Exercices & Corrigés

**Exercice 1 :** Quelle est la différence de fonctionnement entre **AWS Route 53 (Routage DNS)** et **AWS Global Accelerator (IP Anycast)** pour la gestion du trafic mondial ?

**Corrigé :** **Route 53** agit au niveau de la résolution **DNS** (Nom de domaine -> Adresse IP). Ses décisions dépendent du renouvellement des caches DNS chez les fournisseurs d'accès (respect du TTL). **AWS Global Accelerator** fournit deux **adresses IP fixes Anycast**. Le trafic est capté instantanément au niveau du réseau IP de bordure AWS et acheminé via le réseau privé mondial d'AWS vers la région la plus saine, éliminant tout délai de propagation DNS lors d'un basculement de secours.

**Exercice 2 :** Pourquoi est-il fortement recommandé de positionner **AWS WAF** au niveau du CDN CloudFront (Edge) plutôt qu'uniquement devant l'Application Load Balancer (ALB) dans le VPC ?

**Corrigé :** Positionner le pare-feu applicatif (WAF) à l'**Edge (CloudFront)** permet d'intercepter et de bloquer les requêtes malveillantes (SQLi, XSS, attaques DDoS) directement sur les points de présence mondiaux, **avant qu'elles ne s'acheminent sur le réseau d'origine ou consomment de la bande passante et des ressources processeur** sur les serveurs applicatifs du VPC d'entreprise.

---

## ❓ Banque de Questions & Test du Jour

**Q1 :** Quelle politique de routage DNS AWS Route 53 permet de diriger automatiquement chaque utilisateur vers la région AWS offrant le temps de réponse réseau le plus court ?
- A) Latency-Based Routing
- B) Simple Routing
- C) Weighted Routing
- D) Multivalue Answer

**Réponse : A**

**Q2 :** Quel service d'accélération réseau fournit des adresses IP publiques statiques Anycast pour acheminer le trafic sur le réseau privé de fibre optique d'AWS ?
- A) AWS Global Accelerator
- B) Ping
- C) Gzip
- D) Systemd

**Réponse : A**

**Q3 :** Quel est le rôle principal d'un Content Delivery Network (CDN) comme AWS CloudFront ?
- A) Mettre en cache les contenus et réponses aux frontières du réseau mondial pour réduire la latence et soulager les serveurs d'origine
- B) Formater les disques durs
- C) Imprimer des chèques
- D) Réparer les câbles sous-marins

**Réponse : A**

**Q4 :** Si un bilan de santé (Health Check) Route 53 détecte que la région principale est hors service, quel type de routage DNS effectue la bascule automatique du trafic vers la région secondaire ?
- A) Failover Routing
- B) Random Routing
- C) Manual Routing
- D) Loopback

**Réponse : A**

**Q5 :** Quel protocole de sécurité réseau est obligatoire sur les origines CloudFront pour garantir le chiffrement des données de l'Edge jusqu'au VPC ?
- A) HTTPS / TLS 1.3
- B) Telnet
- C) HTTP non sécurisé
- D) FTP

**Réponse : A**

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
