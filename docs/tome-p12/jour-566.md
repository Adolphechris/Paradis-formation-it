# TOME P12 — Architecture Ultime, Leadership Technique & Capstone Final — Jour 566 (6h) : Edge Computing & CDN Architecture : Cloudflare Workers, Lambda@Edge & Edge Caching

> [!NOTE]
> **Objectifs pédagogiques :**
> - Comprendre l'évolution de l'architecture web vers l'**Edge Computing** (calcul distribué sur 300+ Points of Presence mondialement)
> - Développer et déployer des **Edge Functions** (Cloudflare Workers, Vercel Edge, AWS Lambda@Edge) avec un temps de réponse < 10 ms
> - Concevoir des stratégies de cache CDN avancées : en-têtes `Cache-Control`, `stale-while-revalidate`, invalidation par étiquettes (`Cache-Tags` / `Surrogate-Keys`)
> - Sécuriser les applications au niveau de l'Edge : Web Application Firewall (WAF Edge), détection de bots et contrôle d'accès géolocalisé
>
> **Compétences visées :** `INFRA-02` (A), `ARCH-01` (A) — Edge Computing, CDN Architecture, Serverless

---

## Module 1 — Principes de l'Edge Computing (2h)

### 📖 Intuition & Narration

La vitesse de la lumière dans la fibre optique est de ~200 000 km/s. Un aller-retour réseau entre Paris et Tokyo prend au minimum 230 millisecondes uniquement en latence physique de propagation. Aucune optimisation de code backend ou de base de données ne pourra jamais réduire ce délai physique.

La seule façon de fournir une expérience utilisateur instantanée (< 20 ms) aux utilisateurs du monde entier est d'**exécuter le code et le stockage au plus près de l'utilisateur** : dans le POP (Point of Presence) du réseau CDN situé à quelques kilomètres de lui.

C'est la promesse de l'**Edge Computing**.

### 🔍 Évolution : Datacenter Central → Cloud → Edge

```
ÉVOLUTION DES ARCHITECTURES DE CALCUL

  DATACENTER CENTRAL (1990)
  [Serveur Unique à Paris] ◄════ 230ms ════► Utilisateur à Tokyo

  CLOUD MULTI-RÉGION (2010)
  [AWS us-east-1]  [AWS eu-west-1]  [AWS ap-northeast-1]
  Utilisateur connecté au datacenter régional le plus proche (50-100ms).

  EDGE COMPUTING (2020+)
  [300+ POPs CDN Mondiaux : Cloudflare / Fastly / AWS CloudFront]
  Code exécuté directement dans le POP local de la ville de l'utilisateur (< 10ms).
```

---

## Module 2 — Edge Functions & Invalidation de Cache (2h)

### 🔍 Cloudflare Workers & V8 Isolates

Contrairement à AWS Lambda traditionnel qui démarre un conteneur Docker/microVM (Cold Start de 200 à 500 ms), **Cloudflare Workers** utilise des **V8 Isolates** (le moteur JavaScript de Google Chrome).

- **Cold Start < 5 ms** (versus 300 ms pour les microVMs).
- Empreinte mémoire minime (quelques mégaoctets par Isolate).
- Des milliers d'Isolates s'exécutent en parallèle sur le même serveur Edge en toute sécurité.

### 🔍 Invalidation de Cache par Cache-Tags / Surrogate-Keys

Invalider le cache page par page est inefficace sur un site e-commerce de 500 000 produits. La technique des **Cache-Tags** associe des étiquettes sémantiques aux objets en cache :

```http
HTTP/1.1 200 OK
Content-Type: text/html
Cache-Control: public, max-age=3600, stale-while-revalidate=86400
Cache-Tags: product-4421, category-electronics, brand-sony
```

Lorsqu'un prix change sur le produit `4421`, un seul appel d'API vers le CDN invalide l'étiquette `product-4421`, purgeant instantanément les 10 000 pages et fragments qui contiennent ce produit à travers les 300 POPs mondiaux.

---

## Module 3 — Atelier Pratique : Cloudflare Worker Engine (1h30)

### 🛠️ Script JavaScript : Cloudflare Worker (Edge Auth & Geo-Routing)

```javascript
// edge-worker.js — Cloudflare Worker pour Edge Auth, Geo-Routing & Stale-While-Revalidate
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const country = request.cf?.country || 'FR'; // Code pays fourni par l'Edge CDN

    console.log(`[*] Requête Edge reçue pour ${url.pathname} depuis le pays : ${country}`);

    # 1. Edge Security : Blocage WAF au niveau de l'Edge
    const blockedCountries = ['XX', 'YY']; // Pays sous embargo / attaques
    if (blockedCountries.includes(country)) {
      return new Response('Accès non autorisé depuis votre région.', { status: 403 });
    }

    # 2. Edge Routing : Redirection dynamique selon la langue du pays
    if (url.pathname === '/') {
      if (country === 'FR') {
        return Response.redirect(`${url.origin}/fr/`, 302);
      } else if (country === 'DE') {
        return Response.redirect(`${url.origin}/de/`, 302);
      }
    }

    # 3. Interception et ajout d'en-têtes de sécurité HSTS / CSP au niveau Edge
    const response = await fetch(request);
    const newHeaders = new Headers(response.headers);

    newHeaders.set('X-Edge-Served-By', 'PARADIS-Edge-POP-' + (request.cf?.colo || 'PAR'));
    newHeaders.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
    newHeaders.set('X-Frame-Options', 'DENY');

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: newHeaders,
    });
  },
};
```

### 🛠️ Script Python : Edge Cache Simulator & Surrogate Key Purger

```python
#!/usr/bin/env python3
"""
PARADIS — Edge Cache Simulator & Surrogate-Key Purger
Simule la purge instantanée du cache CDN mondial par étiquettes (Cache-Tags).
"""
from dataclasses import dataclass
from typing import Dict, List, Set

@dataclass
class CachedEdgeObject:
    url: str
    content: str
    tags: Set[str]

class EdgeCDNCache:
    def __init__(self):
        self.cache: Dict[str, CachedEdgeObject] = {}

    def store(self, url: str, content: str, tags: List[str]):
        self.cache[url] = CachedEdgeObject(url, content, set(tags))
        print(f"  [CDN STORE] {url} mis en cache (Tags: {', '.join(tags)})")

    def purge_by_tag(self, tag: str) -> int:
        """Purge instantanément tous les objets associés à l'étiquette tag"""
        purged_urls = [url for url, obj in self.cache.items() if tag in obj.tags]
        for url in purged_urls:
            del self.cache[url]

        print(f"\n  [CDN PURGE] Purge globale par Tag '{tag}' → {len(purged_urls)} objet(s) supprimé(s) des 300+ POPs Edge.")
        return len(purged_urls)

    def print_cache_state(self):
        print("─" * 60)
        print(f"  ÉTAT DU CACHE EDGE CDN : {len(self.cache)} objet(s) présent(s)")
        for url, obj in self.cache.items():
            print(f"    • {url:<35} | Tags: {', '.join(obj.tags)}")
        print("─" * 60)


if __name__ == "__main__":
    cdn = EdgeCDNCache()

    print("=== DÉMONSTRATION PURGE EDGE CACHE PAR SURROGATE-KEYS (PARADIS) ===\n")

    # Mise en cache de plusieurs pages e-commerce avec des tags partagés
    cdn.store("/products/sony-wh1000xm5", "Casque Sony WH-1000XM5", ["product-4421", "brand-sony", "cat-audio"])
    cdn.store("/products/sony-bravia-tv", "TV Sony Bravia 4K",      ["product-9902", "brand-sony", "cat-tv"])
    cdn.store("/products/apple-airpods",  "Apple AirPods Pro 2",    ["product-1105", "brand-apple", "cat-audio"])

    cdn.print_cache_state()

    # Le prix de la marque SONY change -> Purge globale du tag 'brand-sony'
    cdn.purge_by_tag("brand-sony")

    cdn.print_cache_state()
```

---

## Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **POP** | Point of Presence — Datacenter local d'un réseau CDN situé au plus près des utilisateurs |
| **Edge Function** | Code Serverless exécuté directement dans les POPs CDN au plus près du client |
| **V8 Isolate** | Instance légère du moteur JS V8 offrant une isolation sécurisée sans surcoût de microVM |
| **Surrogate-Keys** | En-tête HTTP (`Cache-Tags`) permettant d'étiqueter et d'invalider sélectivement des groupes d'objets en cache |

---

## Exercices Pratiques

### Exercice 1 — Optimisation d'En-têtes de Cache HTTP

Un développeur configure l'en-tête de cache suivant pour la page d'accueil dynamique d'un site d'actualités :
`Cache-Control: max-age=86400` (24 heures).

1. Pourquoi cette configuration est-elle sous-optimale pour un site d'actualités ?
2. Quelle directive HTTP moderne permet de servir immédiatement le contenu en cache tout en vérifiant en arrière-plan s'il existe une nouvelle version ?
3. Proposez l'en-tête `Cache-Control` optimal.

**Corrigé guidé :**
1. **Inconvénient de `max-age=86400`** : Les utilisateurs verront une version obsolète pendant 24 heures sans pouvoir recevoir les urgences d'actualité en temps réel.
2. **Directive moderne** : **`stale-while-revalidate`** permet au CDN/navigateur d'afficher immédiatement la version en cache (0 ms), puis de lancer une requête asynchrone en arrière-plan pour rafraîchir le cache pour la prochaine visite.
3. **En-tête optimal** :
   `Cache-Control: public, max-age=60, stale-while-revalidate=3600, s-maxage=300`
   (Fraîcheur garantie sous 60s, stale toléré 1h en arrière-plan).

---

## Banque QCM — 5 Questions

**Q1.** Quelle est la raison physique majeure qui justifie l'utilisation de l'**Edge Computing** ?

- A) Les processeurs des Datacenters centraux ne fonctionnent plus.
- B) La vitesse de la lumière dans la fibre optique limite le temps de transit réseau (ex: ~230 ms Paris-Tokyo) ; exécuter le code dans un POP local Edge réduit cette latence physique à < 20 ms. ✅
- C) L'Edge Computing est gratuit.
- D) L'Edge Computing ne fonctionne qu'avec le langage C.

**Q2.** Pourquoi **Cloudflare Workers** offre-t-il des temps de démarrage à froid (Cold Starts) de **< 5 ms**, bien plus rapides que les microVMs traditionnelles ?

- A) Il n'utilise aucun processeur.
- B) Il s'appuie sur la technologie des **V8 Isolates** (moteur JS Chrome), permettant de faire tourner des milliers de contextes isolés sur le même processus système sans démarrer un OS ou une VM. ✅
- C) Il pré-charge le code sur des disques disquettes.
- D) Il désactive la sécurité mémoire.

**Q3.** À quoi sert la directive `stale-while-revalidate` dans l'en-tête HTTP `Cache-Control` ?

- A) À bloquer les utilisateurs qui n'ont pas de mot de passe.
- B) À autoriser le client ou le CDN à servir immédiatement une version expirée (stale) de la page tout en déclenchant un rafraîchissement asynchrone en arrière-plan. ✅
- C) À vider la mémoire RAM du serveur.
- D) À supprimer les cookies de session.

**Q4.** Comment fonctionne la purge de cache CDN par **Cache-Tags / Surrogate-Keys** ?

- A) Elle nécessite de redémarrer tous les serveurs du CDN.
- B) Elle permet d'associer des étiquettes sémantiques (ex: `brand-sony`) aux réponses en cache et d'invalider en une seule API toutes les pages contenant cette étiquette dans tous les POPs mondiaux. ✅
- C) Elle supprime le cache de manière aléatoire.
- D) Elle ne fonctionne que sur les images JPEG.

**Q5.** Dans l'architecture Edge Computing, où est exécuté le code d'une **Edge Function** ?

- A) Uniquement sur le smartphone de l'utilisateur final.
- B) Directement sur le Point of Presence (POP) du réseau CDN le plus proche géographiquement de l'utilisateur. ✅
- C) Sur un serveur unique situé au siège de l'entreprise.
- D) Dans la base de données principale.

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
