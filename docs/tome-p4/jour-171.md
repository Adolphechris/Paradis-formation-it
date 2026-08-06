# TOME P4 — Cloud, DevOps & SecOps — Jour 171 (6h) : Architectures Web Modernes & HTML5/CSS3 Avancé (Responsive Design, Flexbox, Grid & Accessibilité WAI-ARIA)

> [!NOTE]
> **Objectif du jour :** Maîtriser la création d'interfaces web bancaires modernes, adaptatives et accessibles : sémantique HTML5, mise en page avancée avec CSS Grid et Flexbox, variables CSS natifs, règles de Responsive Web Design (Media Queries, Mobile-First) et conformité aux standards d'accessibilité numérique (WAI-ARIA, WCAG 2.1).
>
> **Compétences visées :** `BIT-06` (A) — Frontend Development & Responsive Design | `SEC-04` (A) — Accessibilité & Sémantique Web

---

## 1) Module — Sémantique HTML5 & Modèles de Mise en Page (Flexbox vs CSS Grid) (2h)

### 📖 Narration/Intuition

En 2026, le portail web de la Banque Centrale du Congo (BCC) doit être parfaitement lisible sur n'importe quel écran : du smartphone 6 pouces d'un citoyen consultant le cours des devises, jusqu'au mur d'écrans 4K de la salle de marché du siège.

Une mise en page moderne repose sur la sémantique HTML5 (donner du sens aux éléments pour les moteurs de recherche et les lecteurs d'écran) et sur la complémentarité entre **Flexbox** (pour les alignements unidimensionnels : lignes ou colonnes) et **CSS Grid** (pour les grilles bidimensionnelles complexes).

### 🔍 Anatomie Technique

**Comparaison Flexbox vs CSS Grid :**

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          FLEXBOX vs CSS GRID                                │
├──────────────┬──────────────────────────────────────────────────────────────┤
│ Caractéristique│ CSS Flexbox (Display: flex)                                 │
├──────────────┼──────────────────────────────────────────────────────────────┤
│ Dimension    │ Unidimensionnel (Ligne OU Colonne).                          │
│ Usage Cible  │ Barres de navigation, boutons alignés, cartes souples.       │
│ Philosophie  │ Le contenu définit la taille des conteneurs.                 │
├──────────────┼──────────────────────────────────────────────────────────────┤
│              │ CSS Grid (Display: grid)                                     │
├──────────────┼──────────────────────────────────────────────────────────────┤
│ Dimension    │ Bidimensionnel (Lignes ET Colonnes simultanément).          │
│ Usage Cible  │ Mises en page globales de pages, dashboards complexes.       │
│ Philosophie  │ Le conteneur grille définit l'emplacement du contenu.        │
└──────────────┴──────────────────────────────────────────────────────────────┘
```

---

## 2) Module — Responsive Web Design & Design System CSS (2h)

### 📖 Narration/Intuition

La stratégie **Mobile-First** consiste à concevoir d'abord l'expérience utilisateur pour les petits écrans mobiles, puis à enrichir progressivement la mise en page pour les grands écrans grâce aux **Media Queries**.

Pour garantir la cohérence graphique sur l'ensemble des applications de la BCC, on utilise des **Variables CSS (Custom Properties)** formant le Design System de la banque.

### 🔍 Anatomie Technique

**Design System CSS & Responsive Grid (`bcc_theme.css`) :**

```css
/* Design System Ntif BCC — Variables CSS Nativs */
:root {
  --primary-green: #006837;
  --secondary-gold: #D4AF37;
  --dark-bg: #0F172A;
  --light-bg: #F8FAFC;
  --text-color: #1E293B;
  --font-family: 'Inter', system-ui, sans-serif;
  --border-radius: 8px;
  --spacing-unit: 1rem;
}

/* Base Body */
body {
  font-family: var(--font-family);
  background-color: var(--light-bg);
  color: var(--text-color);
  margin: 0;
  padding: 0;
}

/* Grille Dashboard Bancaire Responsive (Mobile-First) */
.dashboard-grid {
  display: grid;
  grid-template-columns: 1fr; /* 1 seule colonne sur mobile */
  gap: var(--spacing-unit);
  padding: var(--spacing-unit);
}

/* Tablet Breakpoint (min-width: 768px) */
@media (min-width: 768px) {
  .dashboard-grid {
    grid-template-columns: repeat(2, 1fr); /* 2 colonnes sur tablette */
  }
}

/* Desktop Breakpoint (min-width: 1200px) */
@media (min-width: 1200px) {
  .dashboard-grid {
    grid-template-columns: 250px 1fr 300px; /* Sidebar | Main | Widgets */
  }
}
```

---

## 3) Module — Accessibilité Numérique : Standards WCAG 2.1 & ARIA (2h)

### 📖 Narration/Intuition

L'accessibilité web (**Accessibility - a11y**) garantit que les personnes en situation de handicap (déficients visuels, motoristes) peuvent utiliser les services bancaires numériques grâce aux lecteurs d'écran (ex: NVDA, VoiceOver).

Les attributs **WAI-ARIA (Accessible Rich Internet Applications)** permettent d'ajouter de la sémantique d'accessibilité aux composants dynamiques complexes (modales, onglets).

### 🔍 Anatomie Technique

**Composant HTML5/ARIA Accessible (`bank_card_widget.html`) :**

```html
<!-- Widget Carte Bancaire Accessible WCAG 2.1 AAA -->
<article class="bank-card" role="region" aria-labelledby="card-title-01">
    <header class="card-header">
        <h2 id="card-title-01" class="card-title">Compte Courant Principal</h2>
        <span class="badge" aria-label="Statut du compte : Actif">Actif</span>
    </header>

    <div class="card-body">
        <p class="balance-label">Solde Disponible :</p>
        <!-- Utilisation de aria-live pour annoncer les mises à jour de solde au lecteur d'écran -->
        <p class="balance-amount" aria-live="polite" aria-atomic="true">
            15 450 000,00 <span class="currency">CDF</span>
        </p>
    </div>

    <footer class="card-actions">
        <!-- Bouton accessible avec libellé explicite pour lecteur d'écran -->
        <button type="button" 
                class="btn-primary" 
                aria-label="Effectuer un virement depuis le Compte Courant Principal"
                onclick="ouvrirModalVirement()">
            Effectuer un virement
        </button>
    </footer>
</article>
```

---

## 🏅 Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **WAI-ARIA** | Web Accessibility Initiative - Accessible Rich Internet Applications |
| **WCAG** | Web Content Accessibility Guidelines — Recommandations internationales d'accessibilité |
| **a11y** | Abréviation numéronyme pour "Accessibility" (11 lettres entre 'a' et 'y') |
| **CSS** | Cascading Style Sheets — Langage de mise en forme des documents HTML |

---

## 🏋️ Exercices & Corrigés

**Exercice 1 :** Quelle est la différence entre les attributs ARIA `aria-live="polite"` et `aria-live="assertive"` lors de l'annonce d'une modification dynamique de contenu sur une page web bancaire ?

**Corrigé :** La propriété `aria-live` indique au lecteur d'écran de lire automatiquement les modifications apportées à une zone de la page sans rechargement. Avec **`aria-live="polite"`**, le lecteur d'écran attend que l'utilisateur ait fini d'écouter la phrase en cours avant de lire poliment la mise à jour (recommandé pour les rafraîchissements de solde ou les notifications d'arrière-plan). Avec **`aria-live="assertive"`**, le lecteur d'écran interrompt immédiatement la lecture en cours pour annoncer le message en urgence (réservé aux alertes d'erreur de sécurité ou aux interruptions de session).

**Exercice 2 :** Pourquoi la démarche **Mobile-First** est-elle techniquement supérieure à la démarche inverse (Desktop-First) pour les performances d'affichage des applications web ?

**Corrigé :** Dans la démarche **Mobile-First**, le CSS de base contient les styles simples pour smartphones sans Media Queries lourdes. Les règles pour grands écrans sont ajoutées progressivement via des `@media (min-width: ...)`. Les smartphones n'exécutent que le CSS minimal nécessaire à leur écran. Dans la démarche **Desktop-First**, le navigateur mobile doit télécharger et analyser tout le CSS complexe des ordinateurs de bureau, puis réécrire les règles via des `@media (max-width: ...)`, ce qui alourdit le temps de rendu (Render-Blocking) et consomme inutilement la bande passante mobile.

---

## ❓ Banque de Questions & Test du Jour

**Q1 :** Quel module de mise en page CSS moderne est spécialement conçu pour aligner des éléments le long d'un seul axe (unidimensionnel : ligne ou colonne) ?
- A) CSS Flexbox (`display: flex`)
- B) CSS Grid
- C) HTML Table
- D) Float

**Réponse : A**

**Q2 :** Quelle est la méthode recommandée en CSS moderne pour définir des variables de couleurs réutilisables sur l'ensemble d'un site web ?
- A) Les Custom Properties CSS (ex: `:root { --primary-color: #006837; }`)
- B) Les balises `<font>`
- C) Les commentaires HTML
- D) Les clés API

**Réponse : A**

**Q3 :** Quel standard international de W3C définit les directives et critères de conformité pour l'accessibilité des contenus web (WCAG) ?
- A) WCAG 2.1 (Web Content Accessibility Guidelines)
- B) ISO 9001
- C) IEEE 802.11
- D) RFC 791

**Réponse : A**

**Q4 :** Quel attribut ARIA permet d'informer un lecteur d'écran qu'un composant de solde bancaire a été mis à jour de manière asynchrone sans interrompre brutalement l'utilisateur ?
- A) `aria-live="polite"`
- B) `aria-hidden="true"`
- C) `disabled`
- D) `readonly`

**Réponse : A**

**Q5 :** Dans la conception web Responsive Mobile-First, quelle syntaxe de Media Query CSS est utilisée pour appliquer des styles spécifiques uniquement à partir d'une largeur d'écran minimale (ex: tablettes) ?
- A) `@media (min-width: 768px)`
- B) `@media (max-width: 100px)`
- C) `@import url()`
- D) `@keyframes`

**Réponse : A**

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
