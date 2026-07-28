/**
 * PARADIS — Supabase Configuration
 *
 * Production: credentials are injected by GitHub Actions from GitHub Secrets
 * (see .github/workflows/deploy.yml). DO NOT hardcode values here.
 *
 * Development: values are read from window.__PARADIS_SUPABASE_URL__ and
 * window.__PARADIS_SUPABASE_ANON_KEY__ which are injected by the CI step
 * that creates docs/js/supabase-env.js at build time.
 */
(function () {
    'use strict';

    window.__PARADIS_SUPABASE_CONFIG__ = window.__PARADIS_SUPABASE_CONFIG__ || {
        url: window.__PARADIS_SUPABASE_URL__ || '',
        anonKey: window.__PARADIS_SUPABASE_ANON_KEY__ || '',
        debug: false
    };
})();
