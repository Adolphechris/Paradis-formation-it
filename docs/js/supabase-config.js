/**
 * PARADIS — Supabase Configuration Bridge
 *
 * Ce fichier unifie les credentials Supabase exposés par supabase-env.js
 * (généré par le CI depuis les GitHub Secrets) et les rend disponibles
 * sous window.PARADIS_SUPABASE pour supabase-client.js.
 *
 * Chaîne de configuration :
 *   CI → supabase-env.js → window.__PARADIS_CONFIG__ → ici → window.PARADIS_SUPABASE
 */
(function () {
    'use strict';

    // Lecture de la config injectée par le CI (supabase-env.js)
    var cfg = window.__PARADIS_CONFIG__ || {};

    // Exposition sous le nom attendu par supabase-client.js
    window.PARADIS_SUPABASE = {
        url:     cfg.url     || cfg.SUPABASE_URL     || '',
        anonKey: cfg.anonKey || cfg.SUPABASE_ANON_KEY || ''
    };

    // Rétro-compatibilité pour d'autres modules qui liraient l'ancienne variable
    window.__PARADIS_SUPABASE_CONFIG__ = window.PARADIS_SUPABASE;

    if (window.PARADIS_SUPABASE.url && window.PARADIS_SUPABASE.url.length > 10) {
        console.info('[PARADIS] Supabase configuré — URL:', window.PARADIS_SUPABASE.url.substring(0, 30) + '...');
    } else {
        console.warn('[PARADIS] Supabase non configuré — mode local uniquement.');
    }
})();
