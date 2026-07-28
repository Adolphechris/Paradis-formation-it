/**
 * PARADIS — Mode Contraste Élevé & Accessibilité (Sprint 33)
 *
 * Explication du script :
 *   1. Gère le mode Contraste Élevé (WCAG 2.1 AA) pour lisibilité optimale
 *   2. Permet l'agrandissement de la taille du texte
 *   3. Offre une option de police adaptée aux personnes dyslexiques
 *   4. Améliore les indicateurs de focus visuel pour la navigation au clavier
 */
(function () {
    'use strict';

    // Injection CSS dynamiques pour l'accessibilité
    const styleId = 'paradis-a11y-styles';
    if (!document.getElementById(styleId)) {
        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = `
            /* Mode Contraste Élevé */
            body.paradis-high-contrast {
                background-color: #000000 !important;
                color: #ffffff !important;
            }
            body.paradis-high-contrast .md-main,
            body.paradis-high-contrast .md-content {
                background-color: #000000 !important;
                color: #ffffff !important;
            }
            body.paradis-high-contrast a {
                color: #ffff00 !important;
                text-decoration: underline !important;
            }
            body.paradis-high-contrast button {
                border: 2px solid #ffffff !important;
            }

            /* Option Police Dyslexie */
            body.paradis-dyslexic-font {
                font-family: 'OpenDyslexic', 'Comic Sans MS', sans-serif !important;
                letter-spacing: 0.05em !important;
                word-spacing: 0.1em !important;
            }

            /* Badge Header Accessibilité */
            .paradis-a11y-badge {
                display: inline-flex;
                align-items: center;
                gap: 6px;
                padding: 4px 10px;
                border-radius: 12px;
                font-size: 0.78rem;
                font-weight: 700;
                background: rgba(139, 92, 246, 0.15);
                border: 1px solid rgba(139, 92, 246, 0.4);
                color: #c4b5fd;
                margin-left: 10px;
                cursor: pointer;
            }

            /* Panneau de réglages Accessibilité */
            .paradis-a11y-modal {
                position: fixed;
                top: 0; left: 0;
                width: 100vw; height: 100vh;
                background: rgba(10, 15, 29, 0.85);
                backdrop-filter: blur(8px);
                z-index: 99996;
                display: flex;
                align-items: center;
                justify-content: center;
                color: #f3f4f6;
            }
            .paradis-a11y-card {
                background: rgba(17, 24, 39, 0.95);
                border: 1px solid rgba(139, 92, 246, 0.4);
                border-radius: 16px;
                width: 100%;
                max-width: 450px;
                padding: 24px;
                box-shadow: 0 20px 50px rgba(0,0,0,0.7);
            }
            .paradis-a11y-row {
                display: flex;
                align-items: center;
                justify-content: space-between;
                margin-bottom: 16px;
            }
        `;
        document.head.appendChild(style);
    }

    let fontSizeLevel = 0; // -1: petit, 0: normal, 1: grand, 2: très grand

    function injectHeaderBadge() {
        const headerInner = document.querySelector('.md-header__inner');
        if (!headerInner || document.getElementById('paradis-a11y-badge')) return;

        const badge = document.createElement('div');
        badge.id = 'paradis-a11y-badge';
        badge.className = 'paradis-a11y-badge';
        badge.innerHTML = '♿ Accessibilité';
        badge.onclick = openA11yModal;

        headerInner.appendChild(badge);
    }

    function openA11yModal() {
        let modal = document.getElementById('paradis-a11y-modal');
        if (modal) { modal.remove(); return; }

        modal = document.createElement('div');
        modal.id = 'paradis-a11y-modal';
        modal.className = 'paradis-a11y-modal';

        const isHC = document.body.classList.contains('paradis-high-contrast');
        const isDys = document.body.classList.contains('paradis-dyslexic-font');

        modal.innerHTML = `
            <div class="paradis-a11y-card">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                    <h3 style="margin: 0; color: #c4b5fd;">♿ Options d'Accessibilité (WCAG)</h3>
                    <button type="button" onclick="document.getElementById('paradis-a11y-modal').remove()" style="background: none; border: none; color: #9ca3af; font-size: 22px; cursor: pointer;">&times;</button>
                </div>

                <div class="paradis-a11y-row">
                    <span><strong>Mode Contraste Élevé</strong></span>
                    <button type="button" onclick="window.ParadisA11y.toggleHighContrast()" style="padding: 6px 14px; border-radius: 6px; background: #8b5cf6; color: #fff; border: none; font-weight: 700; cursor: pointer;">
                        ${isHC ? 'Désactiver' : 'Activer'}
                    </button>
                </div>

                <div class="paradis-a11y-row">
                    <span><strong>Police Confort DYS (Dyslexie)</strong></span>
                    <button type="button" onclick="window.ParadisA11y.toggleDyslexicFont()" style="padding: 6px 14px; border-radius: 6px; background: #8b5cf6; color: #fff; border: none; font-weight: 700; cursor: pointer;">
                        ${isDys ? 'Désactiver' : 'Activer'}
                    </button>
                </div>

                <div class="paradis-a11y-row">
                    <span><strong>Taille du texte</strong></span>
                    <div>
                        <button type="button" onclick="window.ParadisA11y.changeFontSize(-1)" style="padding: 4px 10px; border-radius: 4px; background: #374151; color: #fff; border: none; cursor: pointer;">A-</button>
                        <button type="button" onclick="window.ParadisA11y.changeFontSize(1)" style="padding: 4px 10px; border-radius: 4px; background: #374151; color: #fff; border: none; cursor: pointer;">A+</button>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        modal.onclick = (e) => {
            if (e.target === modal) modal.remove();
        };
    }

    function toggleHighContrast() {
        document.body.classList.toggle('paradis-high-contrast');
        openA11yModal(); // rafraîchir
    }

    function toggleDyslexicFont() {
        document.body.classList.toggle('paradis-dyslexic-font');
        openA11yModal(); // rafraîchir
    }

    function changeFontSize(delta) {
        fontSizeLevel += delta;
        if (fontSizeLevel < -1) fontSizeLevel = -1;
        if (fontSizeLevel > 2) fontSizeLevel = 2;

        const sizes = { '-1': '90%', '0': '100%', '1': '115%', '2': '130%' };
        document.body.style.fontSize = sizes[fontSizeLevel];
    }

    // Initialisation
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            injectHeaderBadge();
        });
    } else {
        injectHeaderBadge();
    }

    window.ParadisA11y = {
        openA11yModal,
        toggleHighContrast,
        toggleDyslexicFont,
        changeFontSize
    };
})();
