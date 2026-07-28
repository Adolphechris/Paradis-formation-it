/**
 * PARADIS — Lecteur de Leçons Markdown HD & Callouts (Sprint 09)
 *
 * Embellit le rendu des leçons MkDocs :
 *   1. Transformation des Callouts GitHub (NOTE, IMPORTANT, WARNING, TIP, CAUTION)
 *   2. Injection de la navigation fluide Précédent / Suivant au bas de la leçon
 *   3. Enrichissement visuel des tableaux et de la table des matières
 */
(function () {
    'use strict';

    // Injection des styles pour les Callouts GitHub et la navigation
    const styleId = 'paradis-lesson-reader-styles';
    if (!document.getElementById(styleId)) {
        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = `
            /* Callouts GitHub */
            .paradis-callout {
                padding: 16px 20px;
                border-radius: 10px;
                margin: 20px 0;
                border-left: 4px solid;
                background: rgba(17, 24, 39, 0.7);
                box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
            }
            .paradis-callout-title {
                display: flex;
                align-items: center;
                gap: 8px;
                font-weight: 700;
                font-size: 0.95rem;
                margin-bottom: 8px;
                text-transform: uppercase;
                letter-spacing: 0.04em;
            }
            .paradis-callout-content {
                font-size: 0.95rem;
                line-height: 1.6;
                color: #e5e7eb;
            }
            .paradis-callout-content p:last-child { margin-bottom: 0; }

            .paradis-callout.note { border-color: #3b82f6; background: rgba(59, 130, 246, 0.1); }
            .paradis-callout.note .paradis-callout-title { color: #60a5fa; }

            .paradis-callout.tip { border-color: #10b981; background: rgba(16, 185, 129, 0.1); }
            .paradis-callout.tip .paradis-callout-title { color: #34d399; }

            .paradis-callout.important { border-color: #8b5cf6; background: rgba(139, 92, 246, 0.1); }
            .paradis-callout.important .paradis-callout-title { color: #a78bfa; }

            .paradis-callout.warning { border-color: #f59e0b; background: rgba(245, 158, 11, 0.1); }
            .paradis-callout.warning .paradis-callout-title { color: #fbbf24; }

            .paradis-callout.caution { border-color: #ef4444; background: rgba(239, 68, 68, 0.1); }
            .paradis-callout.caution .paradis-callout-title { color: #f87171; }

            /* Navigation de leçon Précédent / Suivant */
            .paradis-lesson-nav {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 16px;
                margin-top: 32px;
                padding-top: 24px;
                border-top: 1px solid rgba(55, 65, 81, 0.6);
            }
            .paradis-nav-card {
                padding: 16px;
                border-radius: 10px;
                background: rgba(31, 41, 55, 0.6);
                border: 1px solid rgba(75, 85, 99, 0.4);
                text-decoration: none !important;
                color: #f3f4f6;
                transition: all 0.2s ease;
                display: flex;
                flex-direction: column;
            }
            .paradis-nav-card:hover {
                border-color: #06b6d4;
                background: rgba(6, 182, 212, 0.1);
                transform: translateY(-2px);
            }
            .paradis-nav-card.next { text-align: right; }
            .paradis-nav-card-label {
                font-size: 0.75rem;
                font-weight: 700;
                color: #9ca3af;
                text-transform: uppercase;
            }
            .paradis-nav-card-title {
                font-size: 1rem;
                font-weight: 700;
                color: #06b6d4;
                margin-top: 4px;
            }
        `;
        document.head.appendChild(style);
    }

    /**
     * Transforme les blockquotes [!TYPE] en Callouts stylisés
     */
    function transformCallouts() {
        const blockquotes = document.querySelectorAll('.md-content blockquote');
        const CALLOUT_TYPES = {
            '[!NOTE]': { type: 'note', icon: 'ℹ️', title: 'Note' },
            '[!TIP]': { type: 'tip', icon: '💡', title: 'Astuce & Conseil' },
            '[!IMPORTANT]': { type: 'important', icon: '⚠️', title: 'Important' },
            '[!WARNING]': { type: 'warning', icon: '⚡', title: 'Avertissement' },
            '[!CAUTION]': { type: 'caution', icon: '🚫', title: 'Attention Rigueur' }
        };

        blockquotes.forEach(bq => {
            const text = bq.innerHTML;
            for (const [key, cfg] of Object.entries(CALLOUT_TYPES)) {
                if (text.includes(key)) {
                    const callout = document.createElement('div');
                    callout.className = `paradis-callout ${cfg.type}`;

                    const cleanHTML = bq.innerHTML.replace(key, '').trim();

                    callout.innerHTML = `
                        <div class="paradis-callout-title">
                            <span>${cfg.icon}</span>
                            <span>${cfg.title}</span>
                        </div>
                        <div class="paradis-callout-content">
                            ${cleanHTML}
                        </div>
                    `;

                    bq.parentNode.replaceChild(callout, bq);
                    break;
                }
            }
        });
    }

    /**
     * Calcule et injecte la carte de navigation Précédent / Suivant
     */
    function injectLessonNavigation() {
        const path = window.location.pathname;
        const match = path.match(/jour-([0-9]{1,2})/i);
        if (!match) return;

        const dayNum = parseInt(match[1], 10);
        if (isNaN(dayNum)) return;

        const contentInner = document.querySelector('.md-content__inner');
        if (!contentInner || document.getElementById('paradis-lesson-nav')) return;

        const navContainer = document.createElement('div');
        navContainer.id = 'paradis-lesson-nav';
        navContainer.className = 'paradis-lesson-nav';

        // Calcule le lien du jour précédent
        let prevHTML = '<div></div>';
        if (dayNum > 1) {
            const prevNum = dayNum - 1;
            const prevPadded = prevNum < 10 ? '0' + prevNum : prevNum;
            const prevUrl = `../jour-${prevPadded}/`;
            prevHTML = `
                <a href="${prevUrl}" class="paradis-nav-card prev">
                    <span class="paradis-nav-card-label">⬅️ Leçon Précédente</span>
                    <span class="paradis-nav-card-title">Jour ${prevNum}</span>
                </a>
            `;
        }

        // Calcule le lien du jour suivant
        let nextHTML = '<div></div>';
        if (dayNum < 45) {
            const nextNum = dayNum + 1;
            const nextPadded = nextNum < 10 ? '0' + nextNum : nextNum;
            const nextUrl = `../jour-${nextPadded}/`;
            nextHTML = `
                <a href="${nextUrl}" class="paradis-nav-card next">
                    <span class="paradis-nav-card-label">Leçon Suivante ➡️</span>
                    <span class="paradis-nav-card-title">Jour ${nextNum}</span>
                </a>
            `;
        }

        navContainer.innerHTML = prevHTML + nextHTML;
        contentInner.appendChild(navContainer);
    }

    // Initialisation au chargement de la page
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            transformCallouts();
            injectLessonNavigation();
        });
    } else {
        transformCallouts();
        injectLessonNavigation();
    }

    window.ParadisLessonReader = {
        transformCallouts,
        injectLessonNavigation
    };
})();
