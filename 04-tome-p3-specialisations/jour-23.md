# TOME P3C — Jour 23 (12h) : HTML5 & CSS3 Modernes — Interface Utilisateur d'Élite

> [!NOTE]
> **Objectif de la journée** : Concevoir des interfaces web professionnelles, modernes et adaptatives (responsive) avec HTML5 et CSS3 avancé (Grid, Flexbox, Variables CSS, Animations). Vous créerez le design complet du portail bancaire de la BCC.

---

## 1) HTML5 Sémantique : La Structure Solide (2h)

### 📖 1.1 Pourquoi le HTML Sémantique ?

Une page HTML ne doit pas être une soupe de `<div>`. Le HTML5 moderne offre des balises **sémantiques** qui donnent du sens au contenu (pour les moteurs de recherche, l'accessibilité et les développeurs).

```html
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Portail IT — Banque Centrale du Congo</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <header class="app-header">
        <div class="logo">🏛️ BCC IT Portal</div>
        <nav class="nav-links">
            <a href="#dashboard">Dashboard</a>
            <a href="#tickets">Tickets</a>
            <a href="#agents">Agents</a>
        </nav>
    </header>

    <main class="main-content">
        <section class="hero-card">
            <h1>Système de Gestion des Incidents</h1>
            <p>Plateforme officielle du Département Informatique de la BCC</p>
        </section>

        <section class="grid-container">
            <article class="stat-card">
                <h3>Tickets Ouverts</h3>
                <p class="stat-number">14</p>
            </article>
            <article class="stat-card">
                <h3>MTTR Moyen</h3>
                <p class="stat-number">2.4h</p>
            </article>
        </section>
    </main>

    <footer class="app-footer">
        <p>&copy; 2026 Banque Centrale du Congo — Tous droits réservés.</p>
    </footer>
</body>
</html>
```

---

## 2) CSS3 Modern Layouts : Flexbox et CSS Grid (5h)

### 📖 2.1 Flexbox vs Grid : Le Guide Pratique

- **Flexbox** (1D) : Parfait pour aligner des éléments sur une seule ligne ou colonne (navigation, barres d'outils, cartes).
- **CSS Grid** (2D) : Parfait pour créer la grille globale d'une page (colonnes + lignes complexes).

```css
/* Design System BCC - style.css */
:root {
    --primary: #003366;      /* Bleu Institutionnel BCC */
    --secondary: #008080;    /* Teal */
    --accent: #d4af37;       /* Or */
    --bg-dark: #0f172a;      /* Slate Dark */
    --surface: #1e293b;     /* Card Dark */
    --text: #f8fafc;
    --text-muted: #94a3b8;
    --radius: 12px;
}

body {
    margin: 0;
    font-family: 'Inter', system-ui, sans-serif;
    background-color: var(--bg-dark);
    color: var(--text);
}

/* Header Flexbox */
.app-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 2rem;
    background: var(--surface);
    border-bottom: 1fr solid rgba(255,255,255,0.1);
}

/* Grille de statistiques CSS Grid */
.grid-container {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 1.5rem;
    padding: 2rem;
}

.stat-card {
    background: var(--surface);
    padding: 1.5rem;
    border-radius: var(--radius);
    border: 1px solid rgba(255,255,255,0.05);
    transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.stat-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.5);
}
```

---

## 3) Responsive Design & Animations (3h)

### 🛠️ 3.1 Media Queries pour Mobiles et Tablettes

```css
/* Responsive pour mobiles */
@media (max-width: 768px) {
    .app-header {
        flex-direction: column;
        gap: 1rem;
    }
    
    .grid-container {
        grid-template-columns: 1fr;
        padding: 1rem;
    }
}
```

---

## 🏋️ Exercices Pratiques & Corrigés

### Exercice : Carte d'Incident Responsive
Créez un composant CSS/HTML de carte d'incident avec un badge de priorité (Rouge=Haute, Jaune=Moyenne, Vert=Basse).
- **Corrigé** :
```html
<div class="incident-card">
    <div class="badge badge-high">HAUTE</div>
    <h4>Panne Réseau Siège</h4>
    <p>Interruption liaison fibre 2ème étage</p>
</div>
```

---

## ❓ Banque de Questions & Test du Jour 23

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*