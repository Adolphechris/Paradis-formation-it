/**
 * PARADIS — Thème Sombre/Clair Persistant & Personnalisation UI (Sprint 35)
 *
 * Explication du script :
 *   Ce module gère la personnalisation visuelle persistante de la plateforme.
 *
 *   Fonctionnalités :
 *     1. Bascule Dark/Light : toggle entre thème sombre (défaut PARADIS #0a0f1d)
 *        et thème clair, sauvegardé en localStorage et restauré à chaque page.
 *        Synchronise aussi l'attribut MkDocs Material [data-md-color-scheme].
 *
 *     2. Couleur d'accentuation personnalisable : 5 accents disponibles
 *        (Cyan, Violet, Émeraude, Ambre, Rose) appliqués via la variable CSS
 *        --paradis-accent sur :root, persistée en localStorage.
 *
 *     3. Badge 🎨 dans le header : ouvre un mini-panneau de personnalisation
 *        avec aperçu des accents et le toggle dark/light.
 *
 *     4. Application immédiate des préférences au chargement (avant render)
 *        pour éviter tout flash de couleur indésirable (FOUC).
 */
(function () {
    'use strict';

    const STORAGE_KEY_THEME  = 'paradis_theme';
    const STORAGE_KEY_ACCENT = 'paradis_accent';

    const ACCENTS = [
        { name: 'Cyan',     value: '#06b6d4' },
        { name: 'Violet',   value: '#8b5cf6' },
        { name: 'Émeraude', value: '#10b981' },
        { name: 'Ambre',    value: '#f59e0b' },
        { name: 'Rose',     value: '#ec4899' },
    ];

    // -----------------------------------------------------------------------
    // 1. APPLICATION IMMÉDIATE DES PRÉFÉRENCES (anti-FOUC)
    // -----------------------------------------------------------------------
    function applyTheme(theme) {
        const isDark = (theme === 'dark');
        document.documentElement.setAttribute('data-md-color-scheme', isDark ? 'slate' : 'default');
        document.body.classList.toggle('paradis-light-mode', !isDark);
    }

    function applyAccent(accentValue) {
        document.documentElement.style.setProperty('--paradis-accent', accentValue);
        document.documentElement.style.setProperty('--md-primary-fg-color', accentValue);
    }

    // Appliquer immédiatement (avant DOMContentLoaded pour éviter le flash)
    const savedTheme  = localStorage.getItem(STORAGE_KEY_THEME)  || 'dark';
    const savedAccent = localStorage.getItem(STORAGE_KEY_ACCENT) || '#06b6d4';
    applyTheme(savedTheme);
    applyAccent(savedAccent);

    // -----------------------------------------------------------------------
    // 2. CSS DU PANNEAU & DU BADGE
    // -----------------------------------------------------------------------
    const styleId = 'paradis-theme-styles';
    if (!document.getElementById(styleId)) {
        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = `
            /* Mode Clair général */
            body.paradis-light-mode {
                background-color: #f8fafc !important;
                color: #1e293b !important;
            }
            body.paradis-light-mode .md-main {
                background-color: #f8fafc !important;
            }
            body.paradis-light-mode .md-content {
                background-color: #ffffff !important;
                color: #1e293b !important;
            }

            /* Badge thème header */
            .paradis-theme-badge {
                display: inline-flex;
                align-items: center;
                padding: 4px 10px;
                border-radius: 12px;
                font-size: 0.78rem;
                font-weight: 700;
                background: rgba(245, 158, 11, 0.12);
                border: 1px solid rgba(245, 158, 11, 0.35);
                color: #fbbf24;
                margin-left: 10px;
                cursor: pointer;
                transition: all 0.2s;
            }
            .paradis-theme-badge:hover {
                background: rgba(245, 158, 11, 0.25);
            }

            /* Panneau personnalisation */
            .paradis-theme-panel {
                position: fixed;
                top: 60px;
                right: 12px;
                z-index: 99998;
                background: rgba(17, 24, 39, 0.97);
                border: 1px solid rgba(245, 158, 11, 0.3);
                border-radius: 14px;
                padding: 18px;
                width: 240px;
                box-shadow: 0 12px 40px rgba(0,0,0,0.6);
                color: #f3f4f6;
            }
            .paradis-theme-panel h4 {
                margin: 0 0 12px;
                font-size: 0.9rem;
                color: #fbbf24;
            }
            .paradis-accent-grid {
                display: flex;
                flex-wrap: wrap;
                gap: 8px;
                margin-bottom: 14px;
            }
            .paradis-accent-swatch {
                width: 30px;
                height: 30px;
                border-radius: 50%;
                cursor: pointer;
                border: 2px solid transparent;
                transition: transform 0.15s, border-color 0.15s;
            }
            .paradis-accent-swatch:hover {
                transform: scale(1.15);
            }
            .paradis-accent-swatch.active {
                border-color: #ffffff;
                transform: scale(1.2);
            }
            .paradis-toggle-btn {
                width: 100%;
                padding: 8px;
                border-radius: 8px;
                border: 1px solid rgba(107, 114, 128, 0.5);
                background: rgba(55, 65, 81, 0.8);
                color: #f3f4f6;
                font-weight: 700;
                cursor: pointer;
                font-size: 0.85rem;
            }
        `;
        document.head.appendChild(style);
    }

    // -----------------------------------------------------------------------
    // 3. LOGIQUE TOGGLE & PERSISTANCE
    // -----------------------------------------------------------------------
    function toggleDarkLight() {
        const current = localStorage.getItem(STORAGE_KEY_THEME) || 'dark';
        const next = (current === 'dark') ? 'light' : 'dark';
        localStorage.setItem(STORAGE_KEY_THEME, next);
        applyTheme(next);
        refreshPanel();
    }

    function setAccent(accentValue) {
        localStorage.setItem(STORAGE_KEY_ACCENT, accentValue);
        applyAccent(accentValue);
        refreshPanel();
    }

    // -----------------------------------------------------------------------
    // 4. PANNEAU DE PERSONNALISATION
    // -----------------------------------------------------------------------
    function refreshPanel() {
        const panel = document.getElementById('paradis-theme-panel');
        if (panel) {
            panel.remove();
            openPanel();
        }
    }

    function openPanel() {
        if (document.getElementById('paradis-theme-panel')) {
            document.getElementById('paradis-theme-panel').remove();
            return;
        }

        const currentTheme  = localStorage.getItem(STORAGE_KEY_THEME) || 'dark';
        const currentAccent = localStorage.getItem(STORAGE_KEY_ACCENT) || '#06b6d4';

        const panel = document.createElement('div');
        panel.id = 'paradis-theme-panel';
        panel.className = 'paradis-theme-panel';

        const swatches = ACCENTS.map(a =>
            `<div class="paradis-accent-swatch ${a.value === currentAccent ? 'active' : ''}"
                  style="background:${a.value}"
                  title="${a.name}"
                  onclick="window.ParadisTheme.setAccent('${a.value}')"></div>`
        ).join('');

        panel.innerHTML = `
            <h4>🎨 Personnalisation</h4>
            <p style="font-size:0.78rem; color:#9ca3af; margin:0 0 8px;">Couleur d'accentuation</p>
            <div class="paradis-accent-grid">${swatches}</div>
            <button type="button" class="paradis-toggle-btn" onclick="window.ParadisTheme.toggleDarkLight()">
                ${currentTheme === 'dark' ? '☀️ Passer en mode Clair' : '🌙 Passer en mode Sombre'}
            </button>
        `;

        document.body.appendChild(panel);

        // Fermeture au clic extérieur
        setTimeout(() => {
            document.addEventListener('click', function closePanel(e) {
                if (!panel.contains(e.target) && e.target.id !== 'paradis-theme-badge') {
                    panel.remove();
                    document.removeEventListener('click', closePanel);
                }
            });
        }, 100);
    }

    // -----------------------------------------------------------------------
    // 5. BADGE HEADER
    // -----------------------------------------------------------------------
    function injectHeaderBadge() {
        const headerInner = document.querySelector('.md-header__inner');
        if (!headerInner || document.getElementById('paradis-theme-badge')) return;

        const badge = document.createElement('div');
        badge.id = 'paradis-theme-badge';
        badge.className = 'paradis-theme-badge';
        badge.title = 'Personnaliser le thème';
        badge.innerHTML = '🎨 Thème';
        badge.onclick = (e) => { e.stopPropagation(); openPanel(); };
        headerInner.appendChild(badge);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', injectHeaderBadge);
    } else {
        injectHeaderBadge();
    }

    window.ParadisTheme = { toggleDarkLight, setAccent, openPanel };
    console.info('[PARADIS] Gestionnaire de thème initialisé (thème:', savedTheme, '/ accent:', savedAccent, ').');
})();
