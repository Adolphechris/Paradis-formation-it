/**
 * PARADIS — Raccourcis Clavier & Navigation Keyboard-First (Sprint 34)
 *
 * Explication du script :
 *   Ce module enregistre des raccourcis clavier globaux pour permettre une
 *   navigation rapide et sans souris dans la plateforme PARADIS.
 *
 *   Raccourcis disponibles :
 *     [?]         → Affiche / masque le panneau d'aide des raccourcis
 *     [Alt + N]   → Navigue vers la leçon suivante
 *     [Alt + P]   → Navigue vers la leçon précédente
 *     [Alt + H]   → Retour à la page d'accueil (index)
 *     [Alt + S]   → Met le focus sur la barre de recherche MkDocs
 *     [Alt + A]   → Ouvre le panneau de contrôles d'Accessibilité (Sprint 33)
 *     [Escape]    → Ferme tout modal ou panneau ouvert
 *
 *   Un badge "?" apparaît dans le header pour rappeler l'aide clavier.
 */
(function () {
    'use strict';

    // --- CSS ---
    const styleId = 'paradis-kbd-styles';
    if (!document.getElementById(styleId)) {
        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = `
            .paradis-kbd-help-modal {
                position: fixed;
                top: 0; left: 0;
                width: 100vw; height: 100vh;
                background: rgba(10, 15, 29, 0.85);
                backdrop-filter: blur(8px);
                z-index: 99997;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            .paradis-kbd-help-card {
                background: rgba(17, 24, 39, 0.97);
                border: 1px solid rgba(6, 182, 212, 0.35);
                border-radius: 16px;
                width: 100%;
                max-width: 520px;
                padding: 28px;
                box-shadow: 0 20px 60px rgba(0,0,0,0.7);
                color: #f3f4f6;
            }
            .paradis-kbd-help-card h3 {
                margin: 0 0 18px;
                font-size: 1.1rem;
                color: #06b6d4;
                display: flex;
                align-items: center;
                gap: 8px;
            }
            .paradis-kbd-table {
                width: 100%;
                border-collapse: collapse;
                font-size: 0.88rem;
            }
            .paradis-kbd-table tr {
                border-bottom: 1px solid rgba(75, 85, 99, 0.4);
            }
            .paradis-kbd-table tr:last-child {
                border-bottom: none;
            }
            .paradis-kbd-table td {
                padding: 9px 6px;
                color: #d1d5db;
            }
            .paradis-kbd-table td:first-child {
                text-align: right;
                width: 38%;
            }
            kbd {
                display: inline-block;
                padding: 3px 7px;
                font-size: 0.78rem;
                font-family: monospace;
                background: rgba(55, 65, 81, 0.9);
                border: 1px solid rgba(107, 114, 128, 0.6);
                border-radius: 5px;
                color: #e5e7eb;
                box-shadow: 0 2px 0 rgba(0,0,0,0.5);
                margin: 2px;
            }
            .paradis-kbd-badge {
                display: inline-flex;
                align-items: center;
                padding: 4px 10px;
                border-radius: 12px;
                font-size: 0.78rem;
                font-weight: 700;
                background: rgba(6, 182, 212, 0.12);
                border: 1px solid rgba(6, 182, 212, 0.35);
                color: #67e8f9;
                margin-left: 10px;
                cursor: pointer;
            }
        `;
        document.head.appendChild(style);
    }

    // --- RACCOURCIS ---
    const SHORTCUTS = [
        { keys: ['?'],         label: 'Afficher / masquer cette aide clavier' },
        { keys: ['Alt', 'N'],  label: 'Leçon suivante' },
        { keys: ['Alt', 'P'],  label: 'Leçon précédente' },
        { keys: ['Alt', 'H'],  label: 'Retour à l\'accueil' },
        { keys: ['Alt', 'S'],  label: 'Focus sur la recherche' },
        { keys: ['Alt', 'A'],  label: 'Ouvrir les contrôles d\'Accessibilité' },
        { keys: ['Escape'],    label: 'Fermer tout panneau ouvert' },
    ];

    // --- MODAL D'AIDE ---
    function toggleHelpModal() {
        const existing = document.getElementById('paradis-kbd-help-modal');
        if (existing) { existing.remove(); return; }

        const modal = document.createElement('div');
        modal.id = 'paradis-kbd-help-modal';
        modal.className = 'paradis-kbd-help-modal';

        const rows = SHORTCUTS.map(s =>
            `<tr>
                <td>${s.keys.map(k => `<kbd>${k}</kbd>`).join(' + ')}</td>
                <td>${s.label}</td>
            </tr>`
        ).join('');

        modal.innerHTML = `
            <div class="paradis-kbd-help-card">
                <h3>⌨️ Raccourcis Clavier PARADIS</h3>
                <table class="paradis-kbd-table"><tbody>${rows}</tbody></table>
                <p style="margin-top:16px; font-size:0.78rem; color:#6b7280; text-align:center;">
                    Appuyez sur <kbd>?</kbd> ou <kbd>Escape</kbd> pour fermer
                </p>
            </div>
        `;

        modal.onclick = (e) => { if (e.target === modal) modal.remove(); };
        document.body.appendChild(modal);
    }

    // --- GESTIONNAIRE GLOBAL DES TOUCHES ---
    document.addEventListener('keydown', (e) => {
        // Ignorer les saisies dans les champs texte
        const tag = e.target.tagName.toLowerCase();
        if (tag === 'input' || tag === 'textarea' || e.target.isContentEditable) return;

        // [?] → aide
        if (e.key === '?' && !e.altKey && !e.ctrlKey) {
            e.preventDefault();
            toggleHelpModal();
            return;
        }

        // [Escape] → fermer tous les modaux PARADIS
        if (e.key === 'Escape') {
            ['paradis-kbd-help-modal', 'paradis-a11y-modal', 'paradis-notes-drawer',
             'paradis-chat-panel', 'paradis-bookmark-modal'].forEach(id => {
                const el = document.getElementById(id);
                if (el) el.remove();
            });
            return;
        }

        if (!e.altKey) return;

        switch (e.key.toLowerCase()) {
            case 'n': { // Leçon suivante
                e.preventDefault();
                const nextLink = document.querySelector('a[rel="next"], .md-footer__link--next');
                if (nextLink) nextLink.click();
                break;
            }
            case 'p': { // Leçon précédente
                e.preventDefault();
                const prevLink = document.querySelector('a[rel="prev"], .md-footer__link--prev');
                if (prevLink) prevLink.click();
                break;
            }
            case 'h': { // Accueil
                e.preventDefault();
                window.location.href = '/';
                break;
            }
            case 's': { // Focus recherche
                e.preventDefault();
                const searchInput = document.querySelector('.md-search__input');
                if (searchInput) { searchInput.focus(); searchInput.select(); }
                break;
            }
            case 'a': { // Accessibilité
                e.preventDefault();
                if (window.ParadisA11y?.openA11yModal) {
                    window.ParadisA11y.openA11yModal();
                }
                break;
            }
        }
    });

    // --- BADGE HEADER ---
    function injectHeaderBadge() {
        const headerInner = document.querySelector('.md-header__inner');
        if (!headerInner || document.getElementById('paradis-kbd-badge')) return;

        const badge = document.createElement('div');
        badge.id = 'paradis-kbd-badge';
        badge.className = 'paradis-kbd-badge';
        badge.title = 'Aide raccourcis clavier';
        badge.innerHTML = '⌨️ ?';
        badge.onclick = toggleHelpModal;
        headerInner.appendChild(badge);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', injectHeaderBadge);
    } else {
        injectHeaderBadge();
    }

    window.ParadisKbd = { toggleHelpModal };
    console.info('[PARADIS] Raccourcis clavier initialisés (appuyez sur ? pour l\'aide).');
})();
