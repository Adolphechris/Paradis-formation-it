# TOME P4 — Cloud, DevOps & SecOps — Jour 193 (6h) : Architectures Zero-Downtime & Stratégies de Déploiement Avancées (Blue/Green, Canary, Feature Flags avec LaunchDarkly & DB Schema Migrations sans verrou)

> [!NOTE]
> **Objectif du jour :** Maîtriser les techniques de déploiement continu à zéro interruption de service (**Zero-Downtime Deployment**) : stratégies **Blue/Green** et **Canary**, gestion dynamique des fonctionnalités via **Feature Flags** (LaunchDarkly/Unleash), et exécution de **migrations de schéma de base de données sans verrou (Lock-free DB Migrations)** via le pattern Expand/Contract.
>
> **Compétences visées :** `OPS-05` (A) — Stratégies de Déploiement Zero-Downtime | `BIT-04` (A) — Lock-Free Database Migrations (Expand/Contract)

---

## 1) Module — Déploiements Blue/Green vs Canary (2h)

### 📖 Narration/Intuition

Comment mettre à jour le système de Core Banking de la BCC en pleine journée de travail sans interrompre les milliers de transactions bancaires en cours ni risquer une panne globale si la nouvelle version contient un bug ?

Il existe deux stratégies majeures de déploiement à zéro interruption de service :
1. **Blue/Green Deployment** : Deux environnements identiques existent en parallèle. Le trafic passe instantanément de l'environnement actif (Blue) vers le nouvel environnement (Green) via le routeur.
2. **Canary Deployment** : Le nouvel environnement reçoit d'abord une infime partie du trafic (ex: 1%, 5%, 25%), permettant de tester en production réelle avant un basculement complet.

### 🔍 Anatomie Technique

**Comparatif Blue/Green vs Canary :**

```
BLUE/GREEN DEPLOMENT
═════════════════════
         ROUTEUR / INGRESS
                │
         ┌──────┴──────┐
         │             │
    100% │             │ 0%
         ▼             ▼
   ┌───────────┐ ┌───────────┐
   │ Env BLUE  │ │ Env GREEN │  ──► Basculement atomique 100% en une fois
   │ (v1.0.0)  │ │ (v1.1.0)  │      Rollback instantané si problème
   └───────────┘ └───────────┘

CANARY DEPLOYMENT
═════════════════
         ROUTEUR / INGRESS
                │
         ┌──────┴──────┐
         │             │
     95% │             │ 5%
         ▼             ▼
   ┌───────────┐ ┌───────────┐
   │ Stable    │ │ Canary    │  ──► Déploiement progressif par paliers
   │ (v1.0.0)  │ │ (v1.1.0)  │      Surveillance des métriques d'erreur
   └───────────┘ └───────────┘
```

**Configuration Kubernetes Argo Rollouts — Canary avec Analyse Prometheus (`canary_rollout.yaml`) :**

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Rollout
metadata:
  name: bcc-core-api
  namespace: bcc-production
spec:
  replicas: 10
  strategy:
    canary:
      # Paliers de progression automatique
      steps:
      - setWeight: 5
      - pause: { duration: 10m } # Pause de 10 min pour analyse métriques
      - setWeight: 20
      - pause: { duration: 30m }
      - setWeight: 50
      - pause: { duration: 1h }
      
      # Analyse automatique des métriques Prometheus pendant le Canary
      analysis:
        templates:
        - templateName: success-rate-check
        args:
        - name: service-name
          value: bcc-core-api
```

---

## 2) Module — Migrations de Schéma BDD sans Verrou (Expand/Contract Pattern) (2h)

### 📖 Narration/Intuition

Déployer une nouvelle version de code sans interruption est facile pour des serveurs stateless. Mais que se passe-t-il lorsque la nouvelle version nécessite de **renommer une colonne** dans une table PostgreSQL contenant 100 millions de lignes ?

Exécuter un `ALTER TABLE accounts RENAME COLUMN name TO full_name;` pose un **verrou exclusif (Exclusive Lock)** sur la table, bloquant toutes les lectures et écritures pendant plusieurs minutes (ou heures), causant un crash généralisé.

La solution est le **Pattern Expand/Contract (Parallel Run)** en 4 phases.

### 🔍 Anatomie Technique

**Les 4 Phases du Pattern Expand/Contract pour les Migrations BDD :**

```
PHASE 1 — EXPAND (Agrandir)
  - Ajouter la NOUVELLE colonne à la BDD sans toucher à l'ancienne.
  - La nouvelle colonne est NULLABLE ou a une valeur par défaut.
  - SQL : ALTER TABLE accounts ADD COLUMN full_name VARCHAR(255);
  - Impact : Verrou de fraction de seconde uniquement.

PHASE 2 — DUAL WRITE (Écriture Double)
  - Déployer l'application v1.1.0 qui écrit dans les DEUX colonnes (name ET full_name).
  - L'application lit toujours depuis l'ancienne colonne (name).
  - Exécuter un script d'arrière-plan par lots (backfill) pour copier les anciennes données.

PHASE 3 — READ SWITCH (Bascule de Lecture)
  - Déployer l'application v1.2.0 qui lit désormais depuis la NOUVELLE colonne (full_name).
  - L'application continue d'écrire dans les deux colonnes pour permettre un rollback.

PHASE 4 — CONTRACT (Rétrécir)
  - Une fois la version v1.2.0 stabilisée, supprimer le code écrivant dans l'ancienne colonne (v1.3.0).
  - Supprimer l'ancienne colonne de la base de données.
  - SQL : ALTER TABLE accounts DROP COLUMN name;
```

**Exemple de migration de schéma sans verrou avec Prisma/Knex (`migration_expand.sql`) :**

```sql
-- Phase 1 : EXPAND — Ajout sans verrou d'une nouvelle colonne avec valeur par défaut
ALTER TABLE accounts ADD COLUMN IF NOT EXISTS full_name VARCHAR(255);

-- Création d'un trigger temporaire pour assurer la synchronisation en cas de reliquat v1.0
CREATE OR REPLACE FUNCTION sync_account_name()
RETURNS TRIGGER AS $$
BEGIN
    NEW.full_name := NEW.name;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_sync_account_name
BEFORE INSERT OR UPDATE ON accounts
FOR EACH ROW
EXECUTION WHEN (NEW.full_name IS NULL)
EXECUTE FUNCTION sync_account_name();
```

---

## 3) Module — Feature Flags & Decoupling (LaunchDarkly/Unleash) (2h)

### 📖 Narration/Intuition

Un **Feature Flag** (ou Feature Toggle) permet d'activer ou désactiver une fonctionnalité dans une application en cours d'exécution **en temps réel**, sans redéployer de code et sans redémarrer les serveurs.

Cela permet de séparer le **Déploiement du Code** (opération technique Ops) de la **Livraison de la Fonctionnalité** (opération métier Product Manager).

### 🛠️ Atelier Pratique

**Intégration d'Unleash / LaunchDarkly dans Node.js (`feature_flags.js`) :**

```javascript
const { initialize, isEnabled } = require('unleash-client');

// Initialisation du client Feature Flags
const unleash = initialize({
    url: 'https://unleash.internal.bcc.cd/api/',
    appName: 'bcc-core-api',
    customHeaders: { Authorization: process.env.UNLEASH_API_TOKEN }
});

// Middleware Express d'utilisation des Feature Flags
app.post('/api/v1/virements', async (req, res) => {
    const context = {
        userId: req.user.id,
        remoteAddress: req.ip,
        properties: { userRole: req.user.role, region: req.user.region }
    };

    // Vérification dynamique du Feature Flag en < 1ms (Evalué localement en RAM)
    const isNewVirementEngineActive = isEnabled('BCC_INSTANT_VIREMENT_ENGINE_V2', context);

    if (isNewVirementEngineActive) {
        console.log(`🚀 Utilisation du nouveau moteur de virement V2 pour ${req.user.id}`);
        return await executeVirementV2(req, res);
    } else {
        console.log(`ℹ️ Utilisation du moteur standard V1 pour ${req.user.id}`);
        return await executeVirementV1(req, res);
    }
});
```

---

## 🏅 Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **Canary** | Déploiement progressif testant une nouvelle version sur un faible % d'utilisateurs |
| **Blue/Green** | Bascule instantanée entre deux environnements de production identiques |
| **Feature Flag** | Interrupteur logiciel permettant de modifier le comportement du code au runtime |
| **Expand/Contract** | Pattern de migration de schéma BDD sans verrouillage prolongé |
| **Argo Rollouts** | Contrôleur Kubernetes avancé pour les stratégies Canary et Blue/Green |

---

## 🏋️ Exercices & Corrigés

**Exercice 1 :** Pourquoi la suppression directe d'une colonne SQL (`ALTER TABLE accounts DROP COLUMN name;`) sans passer par le pattern Expand/Contract peut-elle faire planter une application même si le nouveau code redéployé n'utilise plus cette colonne ?

**Corrigé :** Pendant un déploiement continu (Rolling Update ou Canary), **plusieurs versions de l'application s'exécutent simultanément** en production. Si vous supprimez la colonne dans la BDD avant que 100% des Pods de l'ancienne version v1.0.0 ne soient arrêtés, toute requête exécutée par un Pod v1.0.0 contenant encore `SELECT name FROM accounts` échouera immédiatement avec une erreur SQL `column "name" does not exist`. Le pattern Expand/Contract garantit que la colonne n'est supprimée qu'en **Phase 4 (Contract)**, c'est-à-dire plusieurs jours après que 100% des Pods de production ont été migrés vers la version v1.2.0 et n'utilisent plus du tout l'ancienne colonne.

**Exercice 2 :** Quel est le principal avantage de coupler les **Feature Flags** avec un déploiement **Canary** lors du lancement d'un nouveau service bancaire sensible ?

**Corrigé :** Le couplage permet d'obtenir un niveau de contrôle et de sécurité maximal : (1) Le **Canary** gère l'acheminement progressif du **trafic réseau** (ex: 5% des requêtes). (2) Le **Feature Flag** gère l'activation sélective de la **logique métier** au niveau de l'utilisateur (ex: activer la fonctionnalité uniquement pour les employés internes de la BCC d'abord, puis pour les clients d'une région spécifique). Si le nouveau service rencontre un dysfonctionnement grave, désactiver le Feature Flag coupe la fonctionnalité **instantanément (en quelques millisecondes)** sans même devoir attendre le rollback de l'infrastructure Canary (qui peut prendre plusieurs minutes).

---

## ❓ Banque de Questions & Test du Jour

**Q1 :** Quelle stratégie de déploiement Zero-Downtime consiste à maintenir deux environnements identiques (Blue et Green) et à faire basculer le routeur de 100% du trafic de l'un à l'autre ?
- A) Blue/Green Deployment
- B) Canary Deployment
- C) Recreate Deployment
- D) Rolling Update

**Réponse : A**

**Q2 :** Dans le pattern **Expand/Contract** de migration de schéma de base de données sans verrou, que fait-on lors de la phase **Expand** ?
- A) On ajoute la nouvelle colonne à la base de données en la rendant nullable ou avec une valeur par défaut, sans modifier ni supprimer l'ancienne colonne
- B) On supprime l'ancienne colonne immédiatement
- C) On bloque toutes les écritures sur la table
- D) On renomme la table existante

**Réponse : A**

**Q3 :** Quel est le principal bénéfice des **Feature Flags (Feature Toggles)** pour une équipe DevOps ?
- A) Découpler le déploiement technique du code (Ops) de la livraison fonctionnelle de la caractéristique (Product/Business)
- B) Remplacer les tests unitaires
- C) Accélérer la vitesse du compilateur
- D) Réduire l'utilisation de la mémoire RAM

**Réponse : A**

**Q4 :** Quel outil Kubernetes natif étend les capacités de déploiement standard pour exécuter des stratégies Canary avec analyse automatique des métriques Prometheus ?
- A) Argo Rollouts
- B) kubectl standard
- C) Docker Compose
- D) Helm

**Réponse : A**

**Q5 :** Dans une migration de colonne SQL sans arrêt de service, pourquoi est-il nécessaire d'exécuter une phase de **Dual Write (Double Écriture)** ?
- A) Pour garantir que les données écrites par les instances applicatives récentes soient également répercutées dans l'ancien format, permettant un rollback sans perte de données si la nouvelle version échoue
- B) Pour doubler la taille de la base de données
- C) Pour accélérer les requêtes de lecture
- D) Pour satisfaire aux exigences RGPD

**Réponse : A**

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
