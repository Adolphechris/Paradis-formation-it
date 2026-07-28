/**
 * PARADIS — Fuse.js Search Engine
 * Client-side full-text search over all course content.
 */
(function () {
    'use strict';

    let fuse = null;
    let indexBuilt = false;

    /**
     * Build the Fuse.js index from lesson frontmatter.
     * Called at build time or on first use.
     */
    async function buildIndex() {
        if (indexBuilt && fuse) return fuse;
        try {
            const Fuse = await import('https://cdn.jsdelivr.net/npm/fuse.js@7/dist/fuse.esm.min.js');
            const response = await fetch('/search-index.json');
            const data = await response.json();
            fuse = new Fuse.default(data, {
                keys: [
                    { name: 'title', weight: 0.6 },
                    { name: 'tags', weight: 0.3 },
                    { name: 'summary', weight: 0.1 }
                ],
                threshold: 0.3,
                includeMatches: true,
                minMatchCharLength: 2
            });
            indexBuilt = true;
            return fuse;
        } catch (err) {
            console.error('Search index unavailable:', err);
            return null;
        }
    }

    /**
     * Search across all lessons.
     * @param {string} query
     * @returns {Promise<Array>}
     */
    async function search(query) {
        const engine = await buildIndex();
        if (!engine) return [];
        return engine.search(query).map(r => r.item);
    }

    window.ParadisSearch = { buildIndex, search };
})();
