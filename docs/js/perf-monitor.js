/**
 * PARADIS — Monitoring des Performances Web (Sprint 37)
 *
 * Explication du script :
 *   Ce module mesure en temps réel les Core Web Vitals de chaque page de cours.
 *   Il utilise l'API native PerformanceObserver du navigateur (sans dépendance externe).
 *
 *   Métriques collectées :
 *     - LCP (Largest Contentful Paint) : temps d'apparition du bloc principal de leçon.
 *       Seuil : ✅ < 2500ms  ⚠️ < 4000ms  ❌ ≥ 4000ms
 *     - INP (Interaction to Next Paint) : réactivité aux clics/touches de l'apprenant.
 *       Seuil : ✅ < 200ms   ⚠️ < 500ms   ❌ ≥ 500ms
 *     - CLS (Cumulative Layout Shift) : saut de mise en page pendant le chargement.
 *       Seuil : ✅ < 0.1     ⚠️ < 0.25    ❌ ≥ 0.25
 *
 *   Stockage :
 *     - Les métriques sont persistées dans IndexedDB via window.ParadisStorage
 *       (clé "perf_log_<timestamp>"), permettant leur lecture dans le Dashboard
 *       Analytics du Sprint 23.
 *
 *   Indicateur visuel :
 *     - Un badge discret "⚡ Perf" dans le header affiche les 3 métriques en temps
 *       réel au survol (tooltip). Il se colore en vert/orange/rouge selon les seuils.
 *
 *   Exposition : window.ParadisPerf.getMetrics() retourne les métriques de la page.
 */
(function () {
    'use strict';

    // --- État interne ---
    const metrics = { lcp: null, inp: null, cls: 0 };
    let clsSessionValue = 0;

    // --- Seuils CWVS ---
    const THRESHOLDS = {
        lcp: { good: 2500, poor: 4000 },
        inp: { good: 200,  poor: 500 },
        cls: { good: 0.1,  poor: 0.25 },
    };

    function getStatus(key, value) {
        if (value === null || value === undefined) return 'unknown';
        if (value <= THRESHOLDS[key].good) return 'good';
        if (value <= THRESHOLDS[key].poor) return 'needs-improvement';
        return 'poor';
    }

    function statusColor(status) {
        return { good: '#10b981', 'needs-improvement': '#f59e0b', poor: '#ef4444', unknown: '#6b7280' }[status];
    }

    // --- CSS du badge ---
    const styleId = 'paradis-perf-styles';
    if (!document.getElementById(styleId)) {
        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = `
            .paradis-perf-badge {
                display: inline-flex;
                align-items: center;
                padding: 4px 10px;
                border-radius: 12px;
                font-size: 0.78rem;
                font-weight: 700;
                background: rgba(16, 185, 129, 0.12);
                border: 1px solid rgba(16, 185, 129, 0.35);
                color: #34d399;
                margin-left: 10px;
                cursor: pointer;
                position: relative;
            }
            .paradis-perf-tooltip {
                position: absolute;
                top: 100%;
                right: 0;
                margin-top: 6px;
                background: rgba(17, 24, 39, 0.97);
                border: 1px solid rgba(55, 65, 81, 0.8);
                border-radius: 10px;
                padding: 12px;
                width: 220px;
                font-size: 0.78rem;
                color: #f3f4f6;
                z-index: 9999;
                box-shadow: 0 8px 24px rgba(0,0,0,0.5);
                display: none;
            }
            .paradis-perf-badge:hover .paradis-perf-tooltip,
            .paradis-perf-badge:focus-within .paradis-perf-tooltip {
                display: block;
            }
            .paradis-perf-row {
                display: flex;
                justify-content: space-between;
                padding: 4px 0;
                border-bottom: 1px solid rgba(55,65,81,0.4);
            }
            .paradis-perf-row:last-child { border-bottom: none; }
        `;
        document.head.appendChild(style);
    }

    // --- Mise à jour du badge ---
    function updateBadge() {
        const badge = document.getElementById('paradis-perf-badge');
        if (!badge) return;

        const lcpS  = getStatus('lcp', metrics.lcp);
        const inpS  = getStatus('inp', metrics.inp);
        const clsS  = getStatus('cls', metrics.cls);

        // Couleur globale : la pire des 3
        const order = ['poor', 'needs-improvement', 'good', 'unknown'];
        const worst = [lcpS, inpS, clsS].sort((a, b) => order.indexOf(a) - order.indexOf(b))[0];
        badge.style.color       = statusColor(worst);
        badge.style.borderColor = statusColor(worst) + '55';

        const fmt = (v, unit) => v !== null ? `${Math.round(v)}${unit}` : '—';
        badge.innerHTML = `
            ⚡ Perf
            <div class="paradis-perf-tooltip">
                <div style="font-weight:700; margin-bottom:8px; color:#9ca3af;">Core Web Vitals</div>
                <div class="paradis-perf-row">
                    <span>LCP</span>
                    <span style="color:${statusColor(lcpS)}">${fmt(metrics.lcp, 'ms')}</span>
                </div>
                <div class="paradis-perf-row">
                    <span>INP</span>
                    <span style="color:${statusColor(inpS)}">${fmt(metrics.inp, 'ms')}</span>
                </div>
                <div class="paradis-perf-row">
                    <span>CLS</span>
                    <span style="color:${statusColor(clsS)}">${metrics.cls !== null ? metrics.cls.toFixed(3) : '—'}</span>
                </div>
                <div style="margin-top:8px; font-size:0.72rem; color:#6b7280;">
                    ✅ &lt;seuil ⚠️ moyen ❌ mauvais
                </div>
            </div>
        `;
    }

    // --- Persistance dans IndexedDB ---
    function persistMetrics() {
        if (!window.ParadisStorage) return;
        const entry = {
            timestamp: new Date().toISOString(),
            url: window.location.pathname,
            lcp: metrics.lcp,
            inp: metrics.inp,
            cls: metrics.cls,
            lcpStatus: getStatus('lcp', metrics.lcp),
            inpStatus: getStatus('inp', metrics.inp),
            clsStatus: getStatus('cls', metrics.cls),
        };
        window.ParadisStorage.setItem('perf_log_' + Date.now(), JSON.stringify(entry)).catch(() => {});
    }

    // --- PerformanceObserver : LCP ---
    function observeLCP() {
        if (!('PerformanceObserver' in window)) return;
        try {
            const po = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                const last = entries[entries.length - 1];
                if (last) {
                    metrics.lcp = last.startTime;
                    updateBadge();
                }
            });
            po.observe({ type: 'largest-contentful-paint', buffered: true });
        } catch (_) {}
    }

    // --- PerformanceObserver : INP (via event timing) ---
    function observeINP() {
        if (!('PerformanceObserver' in window)) return;
        try {
            const po = new PerformanceObserver((list) => {
                for (const entry of list.getEntries()) {
                    const duration = entry.processingEnd - entry.startTime;
                    if (metrics.inp === null || duration > metrics.inp) {
                        metrics.inp = duration;
                        updateBadge();
                    }
                }
            });
            po.observe({ type: 'event', buffered: true, durationThreshold: 16 });
        } catch (_) {}
    }

    // --- PerformanceObserver : CLS ---
    function observeCLS() {
        if (!('PerformanceObserver' in window)) return;
        try {
            const po = new PerformanceObserver((list) => {
                for (const entry of list.getEntries()) {
                    if (!entry.hadRecentInput) {
                        clsSessionValue += entry.value;
                        metrics.cls = clsSessionValue;
                        updateBadge();
                    }
                }
            });
            po.observe({ type: 'layout-shift', buffered: true });
        } catch (_) {}
    }

    // --- Badge Header ---
    function injectHeaderBadge() {
        const headerInner = document.querySelector('.md-header__inner');
        if (!headerInner || document.getElementById('paradis-perf-badge')) return;

        const badge = document.createElement('div');
        badge.id = 'paradis-perf-badge';
        badge.className = 'paradis-perf-badge';
        badge.innerHTML = '⚡ Perf';
        headerInner.appendChild(badge);
    }

    // --- Init ---
    function init() {
        injectHeaderBadge();
        observeLCP();
        observeINP();
        observeCLS();

        // Persister les métriques en fin de session page
        window.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'hidden') persistMetrics();
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // --- API publique ---
    window.ParadisPerf = {
        /**
         * Retourne les métriques Core Web Vitals de la page courante.
         * @returns {{ lcp: number|null, inp: number|null, cls: number }}
         */
        getMetrics: () => ({ ...metrics }),
    };

    console.info('[PARADIS] Monitoring des performances initialisé (LCP / INP / CLS).');
})();
