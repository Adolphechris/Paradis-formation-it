/**
 * PARADIS — Orchestrateur Central & Rapport de Santé des Modules (Sprint 38)
 *
 * Explication du script :
 *   Ce module est le "chef d'orchestre" de la plateforme PARADIS. Il est chargé
 *   EN DERNIER dans mkdocs.yml pour s'exécuter après tous les autres modules.
 *
 *   À chaque chargement de page, il effectue :
 *
 *   1. AUDIT DE SANTÉ (Health Check) :
 *      Vérifie que chaque module critique expose bien son API publique sur window.
 *      Pour chaque module, il teste la présence des fonctions clés.
 *      Le rapport est affiché dans la console (groupé) avec un résumé ✅/⚠️/❌.
 *
 *   2. RAPPORT DE SANTÉ DANS INDEXEDDB :
 *      Le rapport complet (liste des modules OK/KO) est persisté via
 *      window.ParadisStorage pour consultation dans le Dashboard Analytics.
 *
 *   3. BADGE "PARADIS v5" DANS LE HEADER :
 *      Affiche la version et l'état global de la plateforme (vert = tous OK,
 *      orange = dégradé, rouge = modules critiques manquants).
 *
 *   Modules vérifiés (37 sprints) :
 *     Phase I  : ParadisSupabase, ParadisAuth, ParadisStorage, ParadisSync, ParadisPull
 *     Phase II : ParadisProgress, ParadisLesson, ParadisTimer
 *     Phase III: ParadisQuiz, ParadisExam, ParadisFlashcard, ParadisCertif
 *     Phase IV : ParadisAnalytics, ParadisPortfolio, ParadisRadar, ParadisBackup,
 *                ParadisChat, ParadisPDF, ParadisSearch
 *     Phase V  : ParadisPWA, ParadisErrors, ParadisA11y, ParadisKbd,
 *                ParadisTheme, ParadisPerf
 */
(function () {
    'use strict';

    const PARADIS_VERSION = '5.0.0';

    // -----------------------------------------------------------------------
    // Registre des modules à auditer : { nom_window, méthodes_clés[] }
    // -----------------------------------------------------------------------
    const MODULE_REGISTRY = [
        // Phase I
        { name: 'ParadisStorage',  keys: ['getItem', 'setItem'] },
        { name: 'ParadisSupabase', keys: ['getClient'] },
        { name: 'ParadisAuth',     keys: ['signIn', 'signOut', 'getUser'] },
        { name: 'ParadisSync',     keys: ['triggerPushSync'] },
        { name: 'ParadisPull',     keys: ['pullAndMergeProgress'] },
        // Phase II
        { name: 'ParadisProgress', keys: ['markDayComplete', 'getDayStatus'] },
        { name: 'ParadisLesson',   keys: ['onPageLoad'] },
        { name: 'ParadisTimer',    keys: ['start', 'stop'] },
        // Phase III
        { name: 'ParadisQuiz',     keys: ['loadQuiz'] },
        { name: 'ParadisExam',     keys: ['startExam'] },
        { name: 'ParadisFlashcard',keys: ['init'] },
        { name: 'ParadisCertif',   keys: ['generate'] },
        // Phase IV
        { name: 'ParadisAnalytics',keys: ['render'] },
        { name: 'ParadisPortfolio',keys: ['generate'] },
        { name: 'ParadisRadar',    keys: ['render'] },
        { name: 'ParadisBackup',   keys: ['exportData', 'importData'] },
        { name: 'ParadisChat',     keys: ['sendMessage'] },
        { name: 'ParadisPDF',      keys: ['exportPDF'] },
        { name: 'ParadisSearch',   keys: ['highlightSearchQuery'] },
        // Phase V
        { name: 'ParadisPWA',      keys: ['showInstallBanner'] },
        { name: 'ParadisErrors',   keys: ['getLogs'] },
        { name: 'ParadisA11y',     keys: ['toggleHighContrast'] },
        { name: 'ParadisKbd',      keys: ['toggleHelpModal'] },
        { name: 'ParadisTheme',    keys: ['toggleDarkLight', 'setAccent'] },
        { name: 'ParadisPerf',     keys: ['getMetrics'] },
    ];

    // -----------------------------------------------------------------------
    // CSS du badge version
    // -----------------------------------------------------------------------
    const styleId = 'paradis-init-styles';
    if (!document.getElementById(styleId)) {
        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = `
            .paradis-version-badge {
                display: inline-flex;
                align-items: center;
                gap: 5px;
                padding: 3px 9px;
                border-radius: 10px;
                font-size: 0.72rem;
                font-weight: 700;
                margin-left: 10px;
                border: 1px solid;
                cursor: default;
                letter-spacing: 0.02em;
            }
        `;
        document.head.appendChild(style);
    }

    // -----------------------------------------------------------------------
    // Audit des modules
    // -----------------------------------------------------------------------
    function auditModules() {
        const results = [];
        let okCount = 0, warnCount = 0, failCount = 0;

        for (const mod of MODULE_REGISTRY) {
            const obj = window[mod.name];
            if (!obj) {
                results.push({ name: mod.name, status: 'ABSENT', missing: mod.keys });
                failCount++;
                continue;
            }
            const missingKeys = mod.keys.filter(k => typeof obj[k] !== 'function');
            if (missingKeys.length > 0) {
                results.push({ name: mod.name, status: 'PARTIEL', missing: missingKeys });
                warnCount++;
            } else {
                results.push({ name: mod.name, status: 'OK', missing: [] });
                okCount++;
            }
        }

        return { results, okCount, warnCount, failCount };
    }

    // -----------------------------------------------------------------------
    // Affichage console groupé
    // -----------------------------------------------------------------------
    function logHealthReport(audit) {
        const { results, okCount, warnCount, failCount } = audit;
        const total = results.length;
        const emoji = failCount > 2 ? '🔴' : warnCount > 0 ? '🟡' : '🟢';

        console.groupCollapsed(
            `%c[PARADIS v${PARADIS_VERSION}] ${emoji} Rapport de santé — ${okCount}/${total} modules OK`,
            'font-weight:bold; color:#06b6d4;'
        );
        for (const r of results) {
            const icon = r.status === 'OK' ? '✅' : r.status === 'PARTIEL' ? '⚠️' : '❌';
            const msg  = r.status === 'OK' ? '' : ` — manquant: [${r.missing.join(', ')}]`;
            console.log(`  ${icon} window.${r.name}${msg}`);
        }
        console.log(`\n  Résumé : ${okCount} OK · ${warnCount} partiels · ${failCount} absents sur ${total}`);
        console.groupEnd();
    }

    // -----------------------------------------------------------------------
    // Persistance IndexedDB du rapport
    // -----------------------------------------------------------------------
    function persistReport(audit) {
        if (!window.ParadisStorage) return;
        const report = {
            version: PARADIS_VERSION,
            timestamp: new Date().toISOString(),
            url: window.location.pathname,
            ok: audit.okCount,
            warn: audit.warnCount,
            fail: audit.failCount,
            details: audit.results,
        };
        window.ParadisStorage.setItem('health_report_' + Date.now(), JSON.stringify(report)).catch(() => {});
    }

    // -----------------------------------------------------------------------
    // Badge version dans le header
    // -----------------------------------------------------------------------
    function injectVersionBadge(audit) {
        const headerInner = document.querySelector('.md-header__inner');
        if (!headerInner || document.getElementById('paradis-version-badge')) return;

        const { failCount, warnCount } = audit;
        const color  = failCount > 2 ? '#ef4444' : warnCount > 0 ? '#f59e0b' : '#10b981';
        const emoji  = failCount > 2 ? '🔴' : warnCount > 0 ? '🟡' : '🟢';

        const badge = document.createElement('div');
        badge.id = 'paradis-version-badge';
        badge.className = 'paradis-version-badge';
        badge.style.color       = color;
        badge.style.borderColor = color + '55';
        badge.style.background  = color + '15';
        badge.title = `PARADIS v${PARADIS_VERSION} — ${audit.okCount}/${MODULE_REGISTRY.length} modules actifs`;
        badge.innerHTML = `${emoji} v${PARADIS_VERSION}`;
        headerInner.appendChild(badge);
    }

    // -----------------------------------------------------------------------
    // Initialisation principale — s'exécute après tous les modules
    // -----------------------------------------------------------------------
    function init() {
        const audit = auditModules();
        logHealthReport(audit);
        injectVersionBadge(audit);
        persistReport(audit);
    }

    // Attendre la fin du chargement de tous les scripts
    if (document.readyState === 'complete') {
        init();
    } else {
        window.addEventListener('load', init);
    }

    window.ParadisInit = {
        version: PARADIS_VERSION,
        runHealthCheck: () => {
            const audit = auditModules();
            logHealthReport(audit);
            return audit;
        },
    };
})();
