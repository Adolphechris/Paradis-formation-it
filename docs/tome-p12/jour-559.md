# TOME P12 — Architecture Ultime, Leadership Technique & Capstone Final — Jour 559 (6h) : Performance Engineering : Load Testing k6/Gatling, Profiling & Flamegraphs

> [!NOTE]
> **Objectifs pédagogiques :**
> - Maîtriser la méthodologie du **Performance Engineering** et distinguer les 4 types de tests de charge : **Load**, **Stress**, **Spike** et **Endurance/Soak Testing**
> - Rédiger des scripts de tests de performance automatisés avec **k6 (Grafana)** intégrés aux pipelines CI/CD
> - Réaliser un **profiling CPU et mémoire en temps réel** sur des applications en production avec `py-spy` / `pprof`
> - Générer et analyser des **Flamegraphs (Graphes de Flammes)** pour identifier visuellement les fonctions consommatrices de CPU
>
> **Compétences visées :** `DEV-03` (A), `INFRA-03` (A) — Performance Engineering, k6 Load Testing, Profiling & Flamegraphs

---

## Module 1 — Méthodologie des Tests de Charge & Types de Tests (2h)

### 📖 Intuition & Narration

Tester la performance d'une application ne consiste pas à envoyer un million de requêtes au hasard jusqu'à ce que le serveur plante. C'est une discipline d'ingénierie rigoureuse visant à **comprendre les limites physiques du système**, identifier les goulots d'étranglement (CPU, RAM, verrous DB, I/O disque) et valider les SLAs sous différentes conditions de trafic.

### 🔍 Les 4 Types de Tests de Charge

```
PROFILS DE CHARGE SELON LE TYPE DE TEST

  1. LOAD TESTING (Test de Charge Standard)
     Régime de croisière prévu en production (ex: 500 utilisateurs simultanés pendant 1h).
     Objectif : Valider les SLOs de latence et le comportement nominal.

  2. STRESS TESTING (Test de Stress)
     Montée en charge progressive jusqu'à la RUPTURE du système.
     Objectif : Déterminer la capacité maximale absolue (Break-point) et vérifier
     que la dégradation se fait proprement (Graceful Degradation, pas de crash brutal).

  3. SPIKE TESTING (Test de Pic)
     Augmentation soudaine et massive du trafic en quelques secondes (ex: 10x le trafic normal).
     Objectif : Tester l'élasticité et la vitesse de réaction des auto-scalers (K8s HPA).

  4. ENDURANCE / SOAK TESTING (Test d'Endurance)
     Charge modérée mais maintenue sur une TRÈS LONGUE DURÉE (24h à 72h).
     Objectif : Détecter les fuites de mémoire (Memory Leaks) et la saturation progressive des pools de connexions.
```

---

## Module 2 — k6 Scripting & Flamegraphs (2h)

### 🛠️ Script JavaScript : Test de Charge k6 Avancé avec Thresholds (k6-load-test.js)

```javascript
// k6-load-test.js — Test de charge k6 pour l'API PARADIS
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  // Définition des paliers de charge (Ramping VUs - Virtual Users)
  stages: [
    { duration: '30s', target: 50 },   # Monte à 50 utilisateurs en 30s
    { duration: '2m',  target: 200 },  # Maintient 200 VUs pendant 2 min
    { duration: '30s', target: 0 },    # Descend à 0
  ],

  // SLA / Thresholds (Le test échoue en CI/CD si ces seuils sont dépassés)
  thresholds: {
    'http_req_duration': ['p(95)<200', 'p(99)<500'], // 95% des req < 200ms, 99% < 500ms
    'http_req_failed':   ['rate<0.01'],              // Moins de 1% d'erreurs
  },
};

export default function () {
  const BASE_URL = __ENV.TARGET_URL || 'http://localhost:8080';

  // 1. Transaction 1 : GET /api/v1/health
  const resHealth = http.get(`${BASE_URL}/health`);
  check(resHealth, {
    'Health OK (status 200)': (r) => r.status === 200,
  });

  // 2. Transaction 2 : POST /api/v1/payments
  const payload = JSON.stringify({
    user_id: 'USR-TEST-01',
    amount: 99.99,
  });

  const params = {
    headers: { 'Content-Type': 'application/json' },
  };

  const resPayment = http.post(`${BASE_URL}/api/v1/payments`, payload, params);
  check(resPayment, {
    'Payment Processed (status 201)': (r) => r.status === 201,
    'Response time < 300ms': (r) => r.timings.duration < 300,
  });

  sleep(1); // Temps de pause simulé de l'utilisateur (Think time)
}
```

### 🔍 Analyse par Flamegraph (Graphe de Flammes)

Un **Flamegraph** (créé par Brendan Gregg) est une visualisation graphique de l'empilement des appels de fonctions (Stack Traces) profilés sur une période donnée :

- **Axe X (Largeur)** : Représente la **proportion du temps CPU** consommée par la fonction. Plus la case est large, plus la fonction consomme du CPU !
- **Axe Y (Hauteur)** : Représente la **profondeur de la pile d'appels** (Call Stack).
- **Règle d'or Flamegraph** : Les cases les plus larges au sommet ("flat tops") sont les goulots d'étranglement CPU prioritaires à optimiser.

---

## Module 3 — Profiling Python & Flamegraph Engine (1h30)

### 🛠️ Script Python : CPU Profiler & Benchmark Benchmark (py-spy / cProfile)

```python
#!/usr/bin/env python3
"""
PARADIS — CPU Profiler & Algorithmic Optimization Demonstrator
Compare la consommation CPU de deux implémentations et génère un rapport de profilage.
"""
import time
import cProfile
import pstats
import io

class PerformanceDemonstrator:
    @staticmethod
    def inefficient_duplicate_check(data: list) -> list:
        """Méthode inefficace O(N²) : Recherche de doublons par boucles imbriquées"""
        unique = []
        for item in data:
            if item not in unique:  # Recherche linéaire O(N) dans une liste !
                unique.append(item)
        return unique

    @staticmethod
    def optimized_duplicate_check(data: list) -> list:
        """Méthode optimisée O(N) : Utilisation d'un Set (Hash Table)"""
        return list(set(data))  # Lookups O(1)

def run_profiler():
    print("=" * 65)
    print("  PARADIS PERFORMANCE ENGINEERING — PROFILING CPU")
    print("=" * 65)

    # Génération d'un jeu de données de 20 000 éléments
    dataset = [f"user_{i % 1000}" for i in range(20000)]

    # 1. Benchmark Méthode Inefficace
    pr = cProfile.Profile()
    pr.enable()
    start_time = time.time()
    res1 = PerformanceDemonstrator.inefficient_duplicate_check(dataset)
    t1 = (time.time() - start_time) * 1000.0
    pr.disable()

    # 2. Benchmark Méthode Optimisée
    start_time = time.time()
    res2 = PerformanceDemonstrator.optimized_duplicate_check(dataset)
    t2 = (time.time() - start_time) * 1000.0

    print(f"\n  🐢 Implémentation Inefficace (O(N²)) : {t1:7.2f} ms")
    print(f"  🚀 Implémentation Optimisée   (O(N))  : {t2:7.2f} ms")
    speedup = t1 / t2 if t2 > 0 else 0
    print(f"  ⚡ GAIN DE PERFORMANCE (SPEEDUP)   : x{speedup:.1f} PLUS RAPIDE !")

    print("\n" + "─" * 65)
    print("  📋 RAPPORT DE PROFILAGE CPU (cProfile Stats - Inefficient Method) :")
    s = io.StringIO()
    ps = pstats.Stats(pr, stream=s).sort_stats('tottime')
    ps.print_stats(5)
    print(s.getvalue())
    print("=" * 65)

if __name__ == "__main__":
    run_profiler()
```

```bash
# Génération d'un Flamegraph en production avec py-spy (sans arrêter l'application Python)
# py-spy est un profiler d'échantillonnage non-intrusif écrit en Rust
sudo py-spy record --pid <PID_APPLICATION> --output flamegraph.svg --duration 30
echo "[✅] Flamegraph généré : flamegraph.svg — Ouvrir dans un navigateur pour explorer."
```

---

## Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **VU** | Virtual User — Utilisateur virtuel simulant un comportement humain lors d'un test de charge k6 |
| **p95 / p99** | 95ème / 99ème centile — Latence maximale subie par 95% ou 99% des utilisateurs |
| **Flamegraph** | Visualisation graphique des piles d'appels profilées où la largeur indique la consommation CPU |
| **Spike Test** | Test de performance mesurant la réaction du système face à un pic brutal de trafic |
| **Soak Test** | Test de charge maintenu sur une longue durée (24h+) pour détecter les fuites mémoire |

---

## Exercices Pratiques

### Exercice 1 — Analyse d'un Rapport de Test k6

Un rapport de test de charge k6 renvoie les métriques suivantes pour un service e-commerce lors d'un test à 1 000 utilisateurs virtuels :
- `http_req_duration`: avg=120ms, p(90)=180ms, p(95)=450ms, p(99)=3800ms
- `http_req_failed`: rate=0.04 (4%)

Analysez ces résultats par rapport à un SLA stipulant : *"p(95) < 300ms et taux d'erreur < 0.5%"*. Le test est-il réussi ? Pourquoi le p(99) est-il à 3.8s ?

**Corrigé guidé :**
1. **Échec du test** :
   - Le **p(95) est de 450 ms**, ce qui dépasse le SLA de 300 ms.
   - Le **taux d'erreur est de 4%**, ce qui dépasse largement le seuil autorisé de 0.5%.
2. **Analyse de la dégradation sur le p(99) (3.8s)** :
   - La moyenne (120ms) masque la dégradation subie par les 1% des requêtes les plus lentes (3.8s).
   - Ce phénomène est typique d'une **saturation de pool de connexions base de données** ou d'un **Garbage Collection (GC) stop-the-world** qui bloque temporairement l'application sous forte charge.

---

## Banque QCM — 5 Questions

**Q1.** Quel type de test de charge consiste à maintenir une charge modérée sur une **très longue durée (24h à 72h)** pour détecter les fuites de mémoire ?

- A) Spike Test
- B) Stress Test
- C) Endurance / Soak Test ✅
- D) Unit Test

**Q2.** Dans un **Flamegraph**, que représente la **largeur d'un bloc** de fonction ?

- A) Le nombre de lignes de code de la fonction.
- B) La proportion du temps CPU total consommée par cette fonction lors du profilage. ✅
- C) La mémoire RAM totale utilisée par la fonction.
- D) L'heure exacte où la fonction a été appelée.

**Q3.** Dans k6, que permettent de définir les **Thresholds** ?

- A) La couleur du graphique de sortie.
- B) Des critères de réussite/échec automatisés (SLAs) sur les métriques (ex: `p(95)<200ms`), faisant échouer le pipeline CI/CD si les seuils sont dépassés. ✅
- C) Le nombre maximal de serveurs autorisés.
- D) La taille des fichiers de log.

**Q4.** Pourquoi l'utilisation des percentiles (**p95, p99**) est-elle indispensable par rapport à la simple **moyenne** pour analyser la latence d'une application ?

- A) Parce que la moyenne est trop difficile à calculer.
- B) Parce que la moyenne masque les requêtes très lentes (les valeurs extrêmes) qui ruinent l'expérience des utilisateurs les plus actifs. ✅
- C) Parce que le percentile mesure la mémoire RAM et la moyenne le CPU.
- D) Les percentiles ne sont utiles qu'en mode stress test.

**Q5.** Quel est l'avantage principal de l'outil de profiling **py-spy** par rapport au profiler natif `cProfile` en Python ?

- A) py-spy est écrit en HTML.
- B) py-spy est un profiler d'échantillonnage binaire non-intrusif qui peut s'attacher à un processus Python en cours d'exécution en production sans modifier le code ni éteindre l'application. ✅
- C) py-spy supprime automatiquement les bugs du code.
- D) py-spy ne fonctionne que sur Windows.

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
