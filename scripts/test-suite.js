#!/usr/bin/env node
/**
 * PARADIS — Suite de Tests Automatisée (Sprint 39)
 *
 * Explication du script :
 *   Script de validation complète de la plateforme PARADIS, sans dépendance
 *   externe. Utilise uniquement Node.js natif (fs, path, child_process).
 *
 *   Tests exécutés :
 *     TEST-01 : Cohérence mkdocs.yml → vérifie que chaque JS/CSS listé existe
 *     TEST-02 : Syntaxe JS → node --check sur chaque fichier JS du projet
 *     TEST-03 : Contrat API → chaque module expose window.ParadisXxx
 *     TEST-04 : Secrets → aucune URL Supabase ou clé en dur dans les JS
 *     TEST-05 : Build MkDocs Strict → mkdocs build --strict sans erreur
 *
 *   Usage :
 *     node scripts/test-suite.js
 *
 *   Code de sortie :
 *     0 → tous les tests passent (déploiement autorisé)
 *     1 → au moins un test échoue (déploiement bloqué)
 */

'use strict';

const fs            = require('fs');
const path          = require('path');
const { execSync }  = require('child_process');

// ─── Configuration des chemins ───────────────────────────────────────────────
const ROOT     = path.resolve(__dirname, '..');
const DOCS_JS  = path.join(ROOT, 'docs', 'js');
const MKDOCS   = path.join(ROOT, 'mkdocs.yml');
const VENV_BIN = path.join(ROOT, '.venv', 'bin');

// ─── Couleurs ANSI ───────────────────────────────────────────────────────────
const C = {
    reset:  '\x1b[0m',
    bold:   '\x1b[1m',
    green:  '\x1b[32m',
    red:    '\x1b[31m',
    yellow: '\x1b[33m',
    cyan:   '\x1b[36m',
    gray:   '\x1b[90m',
};

// ─── Résultats globaux ───────────────────────────────────────────────────────
const results = [];
let totalPassed = 0;
let totalFailed = 0;

function pass(testId, msg) {
    console.log(`  ${C.green}✅ ${testId}${C.reset} ${msg}`);
    results.push({ testId, status: 'PASS', msg });
    totalPassed++;
}

function fail(testId, msg, detail = '') {
    console.log(`  ${C.red}❌ ${testId}${C.reset} ${msg}`);
    if (detail) console.log(`     ${C.gray}→ ${detail}${C.reset}`);
    results.push({ testId, status: 'FAIL', msg, detail });
    totalFailed++;
}

function warn(testId, msg) {
    console.log(`  ${C.yellow}⚠️  ${testId}${C.reset} ${msg}`);
    results.push({ testId, status: 'WARN', msg });
}

function header(title) {
    console.log(`\n${C.bold}${C.cyan}━━━ ${title} ━━━${C.reset}`);
}

// ─── Utilitaires ─────────────────────────────────────────────────────────────
function readFile(filePath) {
    try { return fs.readFileSync(filePath, 'utf8'); }
    catch (_) { return null; }
}

function fileExists(filePath) {
    try { return fs.statSync(filePath).isFile(); }
    catch (_) { return false; }
}

// ─── TEST-01 : Cohérence mkdocs.yml ──────────────────────────────────────────
function testMkdocsConsistency() {
    header('TEST-01 · Cohérence mkdocs.yml');

    const content = readFile(MKDOCS);
    if (!content) { fail('T01-000', 'mkdocs.yml introuvable'); return; }

    // Extraire les lignes "  - js/xxx.js" et "  - css/xxx.css"
    const jsMatches  = [...content.matchAll(/^\s+- (js\/[^\s#]+\.js)/gm)].map(m => m[1]);
    const cssMatches = [...content.matchAll(/^\s+- (css\/[^\s#]+\.css)/gm)].map(m => m[1]);

    const allAssets = [...jsMatches, ...cssMatches];
    if (allAssets.length === 0) { warn('T01-000', 'Aucun asset JS/CSS trouvé dans mkdocs.yml'); return; }

    for (const asset of allAssets) {
        const fullPath = path.join(ROOT, 'docs', asset);
        if (fileExists(fullPath)) {
            pass(`T01`, `${asset} existe`);
        } else {
            fail(`T01`, `${asset} listé dans mkdocs.yml mais ABSENT`, fullPath);
        }
    }
}

// ─── TEST-01bis : Couverture nav = fichiers leçons (anti-régression) ─────────
function testNavCoverage() {
    header('TEST-01bis · Couverture navigation (disque ↔ nav)');

    const content = readFile(MKDOCS);
    if (!content) { fail('T01B-000', 'mkdocs.yml introuvable'); return; }

    // 1) Références de jours dans le nav
    const navRefs = new Set();
    for (const m of content.matchAll(/tome-p\d+\/jour-[a-z0-9]+\.md/g)) navRefs.add(m[0]);

    // 2) Fichiers jours sur disque (hors symlink tome-p1 qui duplique p0)
    const TOMES = ['p0', 'p2', 'p3', 'p4', 'p5', 'p6', 'p7', 'p8', 'p9', 'p10', 'p11', 'p12'];
    const disk = new Set();
    for (const t of TOMES) {
        const dir = path.join(ROOT, 'docs', `tome-${t}`);
        if (!fs.existsSync(dir)) continue;
        for (const f of fs.readdirSync(dir)) {
            if (f.startsWith('jour-') && f.endsWith('.md')) disk.add(`tome-${t}/${f}`);
        }
    }

    // 3) Écarts
    const missing = [...disk].filter(p => !navRefs.has(p)).sort();
    const ghosts  = [...navRefs].filter(p => !disk.has(p)).sort();

    if (missing.length === 0 && ghosts.length === 0) {
        pass('T01B', `nav complète : ${disk.size}/${disk.size} leçons référencées`);
    } else {
        if (missing.length) {
            fail('T01B', `${missing.length} leçon(s) absente(s) de la nav`, missing.slice(0, 8).join(', '));
        }
        if (ghosts.length) {
            fail('T01B', `${ghosts.length} référence(s) fantôme(s) dans la nav`, ghosts.slice(0, 8).join(', '));
        }
    }

    // 4) Ponts & milestones : chacun référencé au moins une fois
    const required = [];
    for (const f of fs.readdirSync(path.join(ROOT, 'docs', 'ponts')).filter(f => f.endsWith('.md'))) required.push(`ponts/${f}`);
    for (const f of fs.readdirSync(path.join(ROOT, 'docs', 'milestones')).filter(f => f.endsWith('.md'))) required.push(`milestones/${f}`);
    const orphans = required.filter(p => !content.includes(p));
    if (orphans.length === 0) {
        pass('T01B', `ponts & milestones : ${required.length}/${required.length} référencés`);
    } else {
        fail('T01B', `référence(s) absente(s) de la nav`, orphans.join(', '));
    }
}

// ─── TEST-02 : Syntaxe JS ────────────────────────────────────────────────────
function testJSSyntax() {
    header('TEST-02 · Syntaxe JavaScript (node --check)');

    if (!fs.existsSync(DOCS_JS)) { fail('T02-000', `Dossier ${DOCS_JS} introuvable`); return; }

    const jsFiles = fs.readdirSync(DOCS_JS)
        .filter(f => f.endsWith('.js'))
        .map(f => path.join(DOCS_JS, f));

    for (const filePath of jsFiles) {
        const name = path.basename(filePath);
        try {
            execSync(`node --check "${filePath}"`, { stdio: 'pipe' });
            pass('T02', `${name} — syntaxe OK`);
        } catch (err) {
            const detail = err.stderr?.toString().trim().split('\n')[0] || '';
            fail('T02', `${name} — ERREUR DE SYNTAXE`, detail);
        }
    }
}

// ─── TEST-03 : Contrat API (window.ParadisXxx) ───────────────────────────────
function testAPIContracts() {
    header('TEST-03 · Contrat API (window.ParadisXxx exposé)');

    // Registre attendu : { fichier JS → identifiant window attendu }
    const contracts = [
        { file: 'supabase-client.js',       api: 'window.ParadisSupabase' },
        { file: 'auth-modal.js',             api: 'window.ParadisAuth' },
        { file: 'storage-adapter.js',        api: 'window.ParadisStorage' },
        { file: 'progress-tracker.js',       api: 'window.ParadisProgress' },
        { file: 'sync-bridge.js',            api: 'window.ParadisSync' },
        { file: 'sync-pull-engine.js',       api: 'window.ParadisPull' },
        { file: 'quiz-engine.js',            api: 'window.ParadisQuiz' },
        { file: 'analytics-dashboard.js',    api: 'window.ParadisAnalytics' },
        { file: 'portfolio-generator.js',    api: 'window.ParadisPortfolio' },
        { file: 'backup.js',                 api: 'window.ParadisBackup' },
        { file: 'chat-widget.js',            api: 'window.ParadisChat' },
        { file: 'pdf-export.js',             api: 'window.ParadisPDF' },
        { file: 'search-engine.js',          api: 'window.ParadisSearch' },
        { file: 'pwa-installer.js',          api: 'window.ParadisPWA' },
        { file: 'offline-resync.js',         api: 'window.ParadisErrors',   skip: true }, // uses ParadisSync internals
        { file: 'accessibility-controls.js', api: 'window.ParadisA11y' },
        { file: 'keyboard-shortcuts.js',     api: 'window.ParadisKbd' },
        { file: 'theme-switcher.js',         api: 'window.ParadisTheme' },
        { file: 'perf-monitor.js',           api: 'window.ParadisPerf' },
        { file: 'error-boundary.js',         api: 'window.ParadisErrors' },
        { file: 'paradis-init.js',           api: 'window.ParadisInit' },
    ];

    for (const { file, api, skip } of contracts) {
        if (skip) continue;
        const filePath = path.join(DOCS_JS, file);
        const content  = readFile(filePath);
        if (!content) { fail('T03', `${file} — fichier introuvable`); continue; }

        if (content.includes(api)) {
            pass('T03', `${file} expose ${api}`);
        } else {
            fail('T03', `${file} n'expose pas ${api}`, `Recherche "${api}" non trouvée`);
        }
    }
}

// ─── TEST-04 : Absence de secrets en dur ─────────────────────────────────────
function testNoHardcodedSecrets() {
    header('TEST-04 · Absence de secrets en dur');

    // Patterns suspects (regex simples)
    const PATTERNS = [
        { re: /eyJ[A-Za-z0-9_-]{30,}/,            label: 'JWT token en dur' },
        { re: /supabase\.co\/rest/,                label: 'URL Supabase REST en dur' },
        { re: /anon[_-]?key\s*=\s*["'][^"']{10,}/, label: 'anon key en dur' },
        { re: /service_role.*["'][^"']{30,}/,       label: 'service_role key en dur' },
    ];

    if (!fs.existsSync(DOCS_JS)) { warn('T04-000', `Dossier ${DOCS_JS} introuvable, test ignoré`); return; }

    const jsFiles = fs.readdirSync(DOCS_JS).filter(f => f.endsWith('.js'));

    for (const file of jsFiles) {
        // Exclure supabase-env.js (contient des placeholders légitimes)
        if (file === 'supabase-env.js') { pass('T04', `${file} — exclu (env placeholder)`); continue; }

        const content = readFile(path.join(DOCS_JS, file)) || '';
        let clean = true;

        for (const { re, label } of PATTERNS) {
            if (re.test(content)) {
                fail('T04', `${file} — ${label} détecté`);
                clean = false;
            }
        }
        if (clean) pass('T04', `${file} — aucun secret détecté`);
    }
}

// ─── TEST-05 : Build MkDocs Strict ───────────────────────────────────────────
function testMkDocsBuild() {
    header('TEST-05 · Build MkDocs --strict');

    const mkdocsBin = path.join(VENV_BIN, 'mkdocs');
    if (!fileExists(mkdocsBin)) {
        fail('T05-000', 'mkdocs non trouvé dans .venv/bin', mkdocsBin);
        return;
    }

    try {
        const output = execSync(`"${mkdocsBin}" build --strict 2>&1`, {
            cwd: ROOT,
            stdio: 'pipe',
            encoding: 'utf8',
        });
        if (output.includes('Documentation built in')) {
            // Extraire le temps de build
            const match = output.match(/built in ([\d.]+) seconds/);
            const time  = match ? match[1] + 's' : '—';
            pass('T05', `mkdocs build --strict réussi (${time})`);
        } else {
            fail('T05', 'mkdocs build — sortie inattendue', output.slice(0, 200));
        }
    } catch (err) {
        const detail = (err.stdout || err.stderr || '').toString().slice(0, 300);
        fail('T05', 'mkdocs build --strict a échoué', detail);
    }
}

// ─── Rapport final ───────────────────────────────────────────────────────────
function printFinalReport() {
    const total = totalPassed + totalFailed;
    const rate  = total > 0 ? Math.round((totalPassed / total) * 100) : 0;

    console.log(`\n${C.bold}${'━'.repeat(55)}${C.reset}`);
    console.log(`${C.bold}  PARADIS Test Suite — Rapport Final${C.reset}`);
    console.log(`${'━'.repeat(55)}`);
    console.log(`  Tests passés  : ${C.green}${totalPassed}${C.reset}`);
    console.log(`  Tests échoués : ${totalFailed > 0 ? C.red : C.green}${totalFailed}${C.reset}`);
    console.log(`  Taux de réussite : ${rate >= 90 ? C.green : C.yellow}${rate}%${C.reset}`);

    if (totalFailed === 0) {
        console.log(`\n  ${C.green}${C.bold}🎉 TOUS LES TESTS PASSENT — Déploiement autorisé.${C.reset}`);
    } else {
        console.log(`\n  ${C.red}${C.bold}🔴 ${totalFailed} TEST(S) ÉCHOUÉ(S) — Déploiement bloqué.${C.reset}`);
    }
    console.log(`${'━'.repeat(55)}\n`);
}

// ─── Point d'entrée ──────────────────────────────────────────────────────────
console.log(`\n${C.bold}${C.cyan}╔══════════════════════════════════════════════════╗${C.reset}`);
console.log(`${C.bold}${C.cyan}║  PARADIS — Suite de Tests Automatisée v1.0      ║${C.reset}`);
console.log(`${C.bold}${C.cyan}╚══════════════════════════════════════════════════╝${C.reset}`);

testMkdocsConsistency();
testNavCoverage();
testJSSyntax();
testAPIContracts();
testNoHardcodedSecrets();
testMkDocsBuild();

printFinalReport();

process.exit(totalFailed > 0 ? 1 : 0);
