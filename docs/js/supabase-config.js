/**
 * PARADIS — Supabase Configuration Bridge
 *
 * IMPORTANT SECURITY DESIGN:
 * ─────────────────────────────────────────────────────────────────────────────
 * Ce fichier ne contient JAMAIS de credentials en dur.
 * Les credentials (SUPABASE_URL + SUPABASE_ANON_KEY) sont injectés à deux niveaux :
 *
 *   1. LOCAL (développement) : via `.env` + script `scripts/inject-config.js`
 *      qui génère `docs/js/supabase-env.js` (exclu du git par .gitignore).
 *
 *   2. CI/CD (GitHub Actions) : via GitHub Secrets → injectés dans le workflow
 *      qui génère `site/js/supabase-env.js` pendant le build.
 *
 * Ce fichier lit `window.__PARADIS_CONFIG__` injecté par `supabase-env.js`.
 * Si aucun config n'est trouvé, la plateforme fonctionne en mode LOCAL ONLY
 * (IndexedDB uniquement, sans synchronisation cloud).
 * ─────────────────────────────────────────────────────────────────────────────
 */
(function () {
    'use strict';

    /**
     * Lit la configuration depuis l'objet global injecté par supabase-env.js
     * ou par le workflow CI via une balise <script> générée.
     *
     * Priorité de résolution (du plus prioritaire au moins prioritaire) :
     *  1. window.__PARADIS_CONFIG__   (injecté par supabase-env.js)
     *  2. window.__PARADIS_SUPABASE_URL__ / window.__PARADIS_SUPABASE_ANON_KEY__
     *     (ancien format, conservé pour compatibilité ascendante)
     *  3. Mode hors-ligne uniquement (pas d'erreur fatale)
     */
    function resolveConfig() {
        // Source 1 : objet config complet (format préféré)
        if (
            window.__PARADIS_CONFIG__ &&
            window.__PARADIS_CONFIG__.url &&
            window.__PARADIS_CONFIG__.anonKey &&
            !window.__PARADIS_CONFIG__.url.includes('your-project') &&
            !window.__PARADIS_CONFIG__.anonKey.includes('your-anon')
        ) {
            return {
                url: window.__PARADIS_CONFIG__.url,
                anonKey: window.__PARADIS_CONFIG__.anonKey,
                source: 'config-object',
            };
        }

        // Source 2 : variables globales individuelles (ancien format)
        if (
            window.__PARADIS_SUPABASE_URL__ &&
            window.__PARADIS_SUPABASE_ANON_KEY__ &&
            !window.__PARADIS_SUPABASE_URL__.includes('your-project')
        ) {
            return {
                url: window.__PARADIS_SUPABASE_URL__,
                anonKey: window.__PARADIS_SUPABASE_ANON_KEY__,
                source: 'legacy-globals',
            };
        }

        // Source 3 : fallback → mode IndexedDB uniquement
        return {
            url: null,
            anonKey: null,
            source: 'offline-only',
        };
    }

    const config = resolveConfig();

    // Expose l'état de la configuration à toute la plateforme
    window.PARADIS_SUPABASE = {
        url: config.url,
        anonKey: config.anonKey,
        isConfigured: config.url !== null && config.anonKey !== null,
        isOfflineOnly: config.url === null,
        configSource: config.source,
    };

    // Log de démarrage (visible dans la console DevTools)
    if (window.PARADIS_SUPABASE.isConfigured) {
        console.info(
            '[PARADIS] Supabase connecté →',
            window.PARADIS_SUPABASE.url,
            '(source: ' + config.source + ')'
        );
    } else {
        console.warn(
            '[PARADIS] Mode HORS-LIGNE uniquement — Supabase non configuré.',
            'Toutes les données sont stockées dans IndexedDB localement.',
            'Pour activer la synchronisation cloud, configurez les GitHub Secrets',
            'SUPABASE_URL et SUPABASE_ANON_KEY.'
        );
    }
})();
