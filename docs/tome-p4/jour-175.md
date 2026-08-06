# TOME P4 — Cloud, DevOps & SecOps — Jour 175 (6h) : Frameworks Frontend Modernes & Single Page Applications (React.js, Virtual DOM, State Management & Hooks)

> [!NOTE]
> **Objectif du jour :** Maîtriser le développement d'applications web Single Page (SPA) avec le framework React.js : architecture par composants réutilisables, fonctionnement du **Virtual DOM**, gestion de l'état (**State**) et des propriétés (**Props**), Hooks React fondamentaux (`useState`, `useEffect`, `useContext`, `useCallback`), et intégration sécurisée d'APIs RESTful backend.
>
> **Compétences visées :** `BIT-06` (A) — Frontend Development React.js & SPA | `BIT-04` (A) — State Management & Component Architecture

---

## 1) Module — React.js & le Concept de Virtual DOM (2h)

### 📖 Narration/Intuition

Dans une application web traditionnelle, chaque fois qu'une donnée change (ex: le cours du Franc Congolais en direct), le navigateur doit recalculer l'arbre complet du DOM HTML et redessiner l'écran. Cette ré-exécution directe du DOM réel (**Real DOM**) est l'opération la plus lente et la plus gourmande en performances d'un navigateur web.

**React.js** (créé par Meta/Facebook) introduit le **Virtual DOM**. React conserve une copie légère en mémoire RAM de l'arbre de la page. Lors d'un changement d'état, React compare la nouvelle version du Virtual DOM avec l'ancienne via un algorithme de comparaison rapide (**Reconciliation / Diffing Algorithm**) et ne met à jour dans le Real DOM du navigateur que **les quelques nœuds strictement modifiés**.

### 3) Anatomie Technique

**Fonctionnement de l'Algorithme de Réconciliation React :**

```
 [ Changement d'État (State Change) ]
                 │
                 ▼
 ┌───────────────────────────────────────┐
 │ 1. Génération du Nouveau Virtual DOM  │
 └──────────────────┬────────────────────┘
                    │
                    ▼
 ┌───────────────────────────────────────┐
 │ 2. Diffing Algorithm (Reconciliation) │ ──► Compare l'ancien & le nouveau Virtual DOM
 └──────────────────┬────────────────────┘
                    │
                    ▼ (Identifie uniquement les nœuds modifiés)
 ┌───────────────────────────────────────┐
 │ 3. Batch Update sur le Real DOM       │ ──► Met à jour uniquement l'élément HTML modifié (< 1ms)
 └───────────────────────────────────────┘
```

---

## 2) Module — Composants, Props & State avec les Hooks React (2h)

### 📖 Narration/Intuition

Dans React, tout est **Composant**. Une interface bancaire est découpée en briques logiques autonomes et réutilisables (`<Header />`, `<CarteBancaire />`, `<FormulaireVirement />`).

- **Props (Propriétés)** : Données transmises de manière descendante (Parent ──► Enfant). Les props sont en lecture seule (Immutables).
- **State (État)** : Données internes et mutables d'un composant (ex: saisie d'un formulaire, solde à jour).
- **Hooks** : Fonctions spéciales commençant par `use` permettant d'utiliser l'état et le cycle de vie dans les composants fonctionnels (`useState`, `useEffect`).

### 🔍 Anatomie Technique

**Exemple de Composant Fonctionnel avec Hooks (`CarteCompte.jsx`) :**

```jsx
import React, { useState, useEffect } from 'react';

// Composant Fonctionnel React pour l'affichage d'un compte bancaire
export function CarteCompte({ iban, nomTitulaire }) {
    // 1. Déclaration de l'état local avec useState
    const [solde, setSolde] = useState(null);
    const [chargement, setChargement] = useState(true);
    const [erreur, setErreur] = useState(null);

    // 2. Effet secondaire avec useEffect (Chargement des données au montage du composant)
    useEffect(() => {
        let isMounted = true;

        async function fetchSolde() {
            try {
                const response = await fetch(`https://api.bcc.cd/v1/accounts/${iban}/solde`, {
                    headers: { 'Authorization': `Bearer ${sessionStorage.getItem('jwt_token')}` }
                });
                const data = await response.json();
                
                if (isMounted) {
                    setSolde(data.solde);
                    setChargement(false);
                }
            } catch (err) {
                if (isMounted) {
                    setErreur("Échec du chargement du solde.");
                    setChargement(false);
                }
            }
        }

        fetchSolde();

        // Fonction de nettoyage (Cleanup function) lors du démontage du composant
        return () => { isMounted = false; };
    }, [iban]); // Dépendance : Réexécuter si l'IBAN change

    if (chargement) return <div class="spinner">Chargement du solde en cours...</div>;
    if (erreur) return <div class="alert-danger">{erreur}</div>;

    return (
        <div className="card-compte">
            <h3>{nomTitulaire}</h3>
            <p className="iban">{iban}</p>
            <p className="solde-montant">{solde.toLocaleString('fr-CD')} CDF</p>
        </div>
    );
}
```

---

## 3) Module — Laboratoire Pratique : Formulaire de Virement SPA avec Validation (2h)

### 📖 Narration/Intuition

Construisons un composant de formulaire de virement interactif pour une application Single Page (SPA) bancaire avec validation des champs en temps réel.

### 🔍 Anatomie Technique

**Composant Formulaire Virement React (`FormulaireVirement.jsx`) :**

```jsx
import React, { useState } from 'react';

export function FormulaireVirement({ onVirementSuccess }) {
    const [formData, setFormData] = useState({
        destIban: '',
        montant: '',
        motif: ''
    });
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState(null);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault(); // Empêcher le rechargement de la page HTML
        setSubmitting(true);
        setMessage(null);

        try {
            const res = await fetch('https://api.bcc.cd/v1/virements', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${sessionStorage.getItem('jwt_token')}`
                },
                body: JSON.stringify(formData)
            });

            const result = await res.json();
            if (!res.ok) throw new Error(result.message || 'Erreur lors du virement');

            setMessage({ type: 'success', text: '✅ Virement transmis avec succès !' });
            setFormData({ destIban: '', montant: '', motif: '' });
            if (onVirementSuccess) onVirementSuccess(result);

        } catch (err) {
            setMessage({ type: 'error', text: `❌ ${err.message}` });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="form-virement">
            <h2>Nouveau Virement Interbancaire</h2>

            {message && <div className={`alert alert-${message.type}`}>{message.text}</div>}

            <div className="form-group">
                <label htmlFor="destIban">IBAN Destinataire :</label>
                <input type="text" id="destIban" name="destIban" value={formData.destIban} onChange={handleChange} required />
            </div>

            <div className="form-group">
                <label htmlFor="montant">Montant (CDF) :</label>
                <input type="number" id="montant" name="montant" value={formData.montant} onChange={handleChange} min="1" required />
            </div>

            <button type="submit" disabled={submitting} className="btn-submit">
                {submitting ? 'Traitement en cours...' : 'Valider le Virement'}
            </button>
        </form>
    );
}
```

---

## 🏅 Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **SPA** | Single Page Application — Application web s'exécutant dans une seule page sans rechargement |
| **Virtual DOM** | Copie légère du DOM en mémoire RAM utilisée par React pour optimiser le rendu |
| **JSX** | JavaScript XML — Extension de syntaxe permettant d'écrire des éléments HTML dans du code JS |
| **Hooks** | Fonctions spéciales React (ex: `useState`, `useEffect`) permettant d'utiliser l'état dans des composants |

---

## 🏋️ Exercices & Corrigés

**Exercice 1 :** Quelle est la règle d'or concernant le tableau de dépendances (Dependency Array) du Hook React `useEffect()`, et quel bug grave peut résulter de son omission ?

**Corrigé :** Le tableau de dépendances (2ème argument de `useEffect(fn, [dep1, dep2])`) indique à React les variables dont dépend l'effet. Si une variable réactive utilisée dans l'effet est omise du tableau, l'effet utilisera des valeurs périmées (**Stale Closure**). Si le tableau de dépendances est **totalement omis** (`useEffect(fn)`), l'effet s'exécutera **à chaque rendu du composant**. Si cet effet déclenche un changement d'état (ex: `setSolde()`), cela provoque un nouveau rendu, qui réexécute l'effet, entraînant une **boucle de rendu infinie (Infinite Re-render Loop)** qui fait planter le navigateur.

**Exercice 2 :** Pourquoi la modification directe de l'état d'un composant React (ex: `state.solde = 500;`) est-elle une erreur grave, et quelle méthode faut-il obligatoirement utiliser ?

**Corrigé :** React détecte les changements d'état pour déclencher l'algorithme de réconciliation et mettre à jour l'interface graphique uniquement lorsque la fonction de mise à jour d'état (ex: `setSolde(500)`) est appelée. Si vous modifiez directement l'objet `state.solde = 500`, la valeur en mémoire est altérée mais React ne reçoit aucun signal de modification : l'interface utilisateur reste inchangée, créant un décalage entre les données en mémoire et ce que l'utilisateur voit à l'écran.

---

## ❓ Banque de Questions & Test du Jour

**Q1 :** Quelle technologie fondamentale de React.js conserve une représentation en mémoire de l'interface pour calculer uniquement les modifications minimales à appliquer au Real DOM ?
- A) Le Virtual DOM
- B) Le Web Storage
- C) L'Index DB
- D) Le Flash Player

**Réponse : A**

**Q2 :** Quel Hook React fondamental est utilisé pour déclarer et gérer un état local modifiable à l'intérieur d'un composant fonctionnel ?
- A) `useState`
- B) `useRoute`
- C) `useFetch`
- D) `useDatabase`

**Réponse : A**

**Q3 :** Quel Hook React permet d'exécuter des effets secondaires (ex: chargement de données depuis une API REST, abonnements) après le rendu d'un composant ?
- A) `useEffect`
- B) `useState`
- C) `useRef`
- D) `useHistory`

**Réponse : A**

**Q4 :** Quelle est la caractéristique principale d'une Single Page Application (SPA) développée en React par rapport à un site web traditionnel multi-pages ?
- A) L'application ne charge qu'une seule page HTML initiale et met à jour dynamiquement les vues en JavaScript sans rechargement complet de la page par le navigateur
- B) Elle ne fonctionne que sur un seul ordinateur
- C) Elle ne contient qu'une seule ligne de code
- D) Elle nécessite une imprimante

**Réponse : A**

**Q5 :** Dans React, comment appelle-t-on les données transmises de manière descendante et immuable d'un composant Parent vers un composant Enfant ?
- A) Les Props (Propriétés)
- B) Les States
- C) Les Cookies
- D) Les Sockets

**Réponse : A**

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
