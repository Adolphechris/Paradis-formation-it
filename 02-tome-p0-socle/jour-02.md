# TOME P0 — Jour 02 (14h) : Web Fondamental & Versioning (HTML5, CSS3, JS & Git)

> [!NOTE]
> **Objectif de la journée** : Ce cours vous apprend comment fonctionne le Web à partir de zéro. Vous découvrirez comment structurer une page web avec HTML5, l'embellir avec CSS3, lui donner de la vie avec JavaScript, et sauvegarder vos projets de manière professionnelle avec Git et GitHub.

---

## 1) HTML5 : La Structure & La Sémantique Web (2h30)

### 📖 1.1 C'est quoi HTML5 ?
Quand vous consultez un site web (ex: le portail de la Banque Centrale), ce que votre navigateur (Chrome, Firefox, Edge) reçoit en premier est un fichier texte avec l'extension `.html`.

**HTML** (*HyperText Markup Language*) est le squelette de la page. Il utilise des **balises** (mots encadrés par des chevrons `< >`) pour indiquer au navigateur la nature de chaque élément : *"Ceci est un titre principal"*, *"Ceci est un paragraphe"*, *"Ceci est une image"*.

> [!TIP]
> **Analogie** : Pensez à une maison. Le HTML représente les fondations, les murs et la charpente. Sans mur, impossible de peindre ou de mettre des meubles !

---

### 🔍 1.2 Anatomie d'un document HTML5 complet
Voici la structure exacte d'un fichier HTML5 valide :

```html
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Portail Support — Banque Centrale</title>
</head>
<body>
    <header>
        <h1>🏛️ Banque Centrale du Congo — Support IT</h1>
    </header>

    <main>
        <section>
            <h2>Demande d'Assistance Technicien</h2>
            <p>Remplissez le formulaire ci-dessous pour ouvrir un ticket.</p>
        </section>
    </main>

    <footer>
        <p>© 2026 Direction Informatique — Tous droits réservés.</p>
    </footer>
</body>
</html>
```

#### Explication des balises clés :
- `<!DOCTYPE html>` : Dit au navigateur *"C'est du HTML5 moderne"*.
- `<head>` : Le cerveau invisible (titre de l'onglet, encodage des caractères `UTF-8`).
- `<body>` : Le corps visible de la page web.
- Balises sémantiques (`<header>`, `<main>`, `<section>`, `<footer>`) : Permettent aux moteurs de recherche (Google) et aux lecteurs d'écran pour malvoyants de comprendre l'organisation du site.

---

### 🛠️ 1.3 Les Formulaires Web Professionnels
Pour permettre à un utilisateur de saisir des informations (ex: ouverture de compte, demande de support) :

```html
<form action="/submit-ticket" method="POST">
    <label for="agent-email">Email Professionnel :</label>
    <input type="email" id="agent-email" name="email" required placeholder="nom@bcc.cd">

    <label for="incident-desc">Description du Problème :</label>
    <textarea id="incident-desc" name="description" rows="4" required></textarea>

    <button type="submit">Envoyer la Demande</button>
</form>
```
> [!IMPORTANT]
> **Règle d'accessibilité** : Toujours relier chaque `<label>` à son `<input>` avec `for="..."` et `id="..."`. Cela permet aux personnes handicapées d'utiliser votre formulaire sans difficulté.

---

## 2) CSS3 : Le Style & La Mise en Page Responsive (3h)

### 📖 2.1 C'est quoi CSS3 ?
Si le HTML est les murs bruts de la maison, le **CSS** (*Cascading Style Sheets*) est la peinture, les tapisseries, l'éclairage et la disposition des meubles.

Le CSS permet de choisir :
- Les couleurs, les polices de caractères et la taille des textes.
- Les espacements (marges internes `padding` et marges externes `margin`).
- La disposition responsive (adapter l'affichage automatiquement sur smartphone, tablette et écran 4K).

---

### 🛠️ 2.2 Relier le CSS au HTML & cibler les éléments
On crée un fichier séparé `style.css` et on le lie dans le `<head>` de la page HTML :
```html
<link rel="stylesheet" href="style.css">
```

Dans `style.css`, on écrit des règles avec des **sélecteurs** :
```css
/* Cibler les éléments par classe */
.btn-primary {
    background-color: #06b6d4; /* Couleur Cyan */
    color: #ffffff;            /* Texte blanc */
    padding: 12px 24px;       /* Espacement interne */
    border-radius: 8px;        /* Bords arrondis */
    border: none;
    cursor: pointer;
}

/* Effet au survol de la souris */
.btn-primary:hover {
    background-color: #3b82f6; /* Devient bleu au survol */
}
```

---

## 3) JavaScript & Git/GitHub (6h)

### ⚡ 3.1 JavaScript : Donner de la vie et du dynamisme
Le **JavaScript (JS)** est le moteur logique de la page web. Il s'exécute directement dans le navigateur du client.
- **Rôle** : Relever un formulaire, afficher un message d'erreur instantané sans recharger la page, faire des calculs dynamiques.

```javascript
// Exemple : Afficher un message de bienvenue dynamique
const submitBtn = document.querySelector('button');
submitBtn.addEventListener('click', () => {
    alert('✅ Votre demande de support a été enregistrée avec succès !');
});
```

---

### 🐙 3.2 Git & GitHub : Le Versioning Professionnel
**Git** est l'outil de gestion de versions standard dans le monde informatique. Il agit comme une "machine à remonter le temps" pour votre code source.

#### Les 4 commandes Git vitales à connaître :
1. `git init` : Initialiser un nouveau projet sous contrôle de version.
2. `git add .` : Mettre en attente tous les fichiers modifiés.
3. `git commit -m "Description de la modification"` : Enregistrer une photo instantanée du projet avec un message clair.
4. `git push origin main` : Envoyer son travail sur les serveurs sécurisés de GitHub.

---

## 🏋️ Exercices Pratiques & Corrigés

### Exercice 1 : HTML5 / CSS3
Créer un bouton HTML avec la classe `.btn-support` et lui appliquer un style CSS avec un fond vert `#10b981`, du texte blanc et un effet d'agrandissement au survol (`transform: scale(1.05)`).

- **Corrigé** :
  ```html
  <button class="btn-support">Contacter le Helpdesk</button>
  ```
  ```css
  .btn-support {
      background-color: #10b981;
      color: white;
      padding: 10px 20px;
      border: none;
      border-radius: 6px;
      transition: transform 0.2s ease;
  }
  .btn-support:hover {
      transform: scale(1.05);
  }
  ```

---

## ❓ Banque de Questions & Test du Jour 02

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
