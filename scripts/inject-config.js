#!/usr/bin/env node
/**
 * PARADIS — Script d'injection des credentials Supabase
 * ─────────────────────────────────────────────────────────────────────────────
 * Ce script lit les variables SUPABASE_URL et SUPABASE_ANON_KEY depuis :
 *   - Les variables d'environnement du shell (ex: export SUPABASE_URL=...)
 *   - Le fichier .env à la racine du projet
 *
 * Il génère : docs/js/supabase-env.js
 * Ce fichier est EXCLU DU GIT via .gitignore (ne jamais le commiter).
 *
 * Usage :
 *   node scripts/inject-config.js
 *   # ou dans package.json :
 *   # "dev:inject": "node scripts/inject-config.js && mkdocs serve"
 * ─────────────────────────────────────────────────────────────────────────────
 */

const fs = require('fs');
const path = require('path');

// Charger le .env si disponible
function loadDotEnv() {
    const envPath = path.resolve(__dirname, '..', '.env');
    if (!fs.existsSync(envPath)) return {};

    const lines = fs.readFileSync(envPath, 'utf8').split('\n');
    const vars = {};
    for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) continue;
        const eqIdx = trimmed.indexOf('=');
        if (eqIdx === -1) continue;
        const key = trimmed.slice(0, eqIdx).trim();
        const value = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, '');
        vars[key] = value;
    }
    return vars;
}

const dotenv = loadDotEnv();

const supabaseUrl = process.env.SUPABASE_URL || dotenv.SUPABASE_URL || '';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || dotenv.SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ [inject-config] SUPABASE_URL ou SUPABASE_ANON_KEY manquant.');
    console.error('   Ajoutez ces variables dans .env ou exportez-les dans votre shell.');
    console.error('   La plateforme fonctionnera en mode HORS-LIGNE uniquement.');
    // On génère quand même un fichier vide pour ne pas bloquer mkdocs serve
}

const outputContent = `/* AUTO-GÉNÉRÉ PAR scripts/inject-config.js — NE PAS COMMITER */
/* Ce fichier est exclu du git via .gitignore */
window.__PARADIS_CONFIG__ = {
    url: ${JSON.stringify(supabaseUrl)},
    anonKey: ${JSON.stringify(supabaseAnonKey)},
};
`;

const outputPath = path.resolve(__dirname, '..', 'docs', 'js', 'supabase-env.js');
fs.writeFileSync(outputPath, outputContent, 'utf8');

if (supabaseUrl && supabaseAnonKey) {
    console.log('✅ [inject-config] supabase-env.js généré avec succès.');
    console.log('   URL:', supabaseUrl);
    console.log('   Anon Key:', supabaseAnonKey.slice(0, 20) + '...[masqué]');
} else {
    console.warn('⚠️  [inject-config] supabase-env.js généré en mode HORS-LIGNE (credentials vides).');
}
