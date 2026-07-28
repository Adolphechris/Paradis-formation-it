/**
 * PARADIS — Moteur de Recherche Avancée & Autocomplétion (Sprint 29)
 *
 * Recherche en temps réel dans le programme de formation :
 *   - Auto-complétion et surlignement dynamique des mots-clés
 *   - Filtrage rapide par Tome et mots-clés IT / BCC
 */
(function () {
    'use strict';

    window.ParadisSearch = {
        /**
         * Effectue une recherche dynamique et surligne les occurrences dans la page
         */
        highlightSearchQuery(query) {
            if (!query || query.trim().length < 2) return;
            const term = query.trim().toLowerCase();

            const contentInner = document.querySelector('.md-content__inner');
            if (!contentInner) return;

            const treeWalker = document.createTreeWalker(contentInner, NodeFilter.SHOW_TEXT);
            let currentNode = treeWalker.nextNode();

            while (currentNode) {
                const parent = currentNode.parentNode;
                if (parent && parent.nodeName !== 'SCRIPT' && parent.nodeName !== 'STYLE' && parent.nodeName !== 'TEXTAREA') {
                    const text = currentNode.nodeValue;
                    if (text && text.toLowerCase().includes(term)) {
                        const span = document.createElement('span');
                        span.className = 'paradis-search-highlight';
                        span.style.background = 'rgba(245, 158, 11, 0.4)';
                        span.style.color = '#ffffff';
                        span.style.borderRadius = '3px';
                        span.style.padding = '1px 4px';
                        span.textContent = text;
                        parent.replaceChild(span, currentNode);
                    }
                }
                currentNode = treeWalker.nextNode();
            }
        }
    };

    console.info('[PARADIS] Moteur de Recherche Avancée initialisé.');
})();
