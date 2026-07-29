/**
 * PARADIS — Progress Widget (Page d'accueil)
 *
 * Ce script remplace le spinner de chargement dans #progress-widget
 * par un affichage réel de la progression de l'étudiant.
 *
 * Il s'initialise dès que le DOM est prêt — même sans session active
 * (affiche un état "invité" invitant à s'inscrire).
 *
 * Données lues depuis :
 *   - ParadisStorage.getAllLocal('progress') — IndexedDB
 *   - localStorage.paradis_active_session — Session locale
 *   - window.ParadisAuth.getActiveStudentSession() — Session cloud/locale
 */
(function () {
    'use strict';

    const TOTAL_DAYS = 45;

    // ------------------------------------------------------------------
    // Styles intégrés
    // ------------------------------------------------------------------
    const STYLE_ID = 'paradis-progress-widget-styles';
    if (!document.getElementById(STYLE_ID)) {
        const style = document.createElement('style');
        style.id = STYLE_ID;
        style.textContent = `
            /* Widget Progression */
            .pw-guest {
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 12px;
                padding: 1.5rem 1rem;
                text-align: center;
            }
            .pw-guest-icon {
                font-size: 2.5rem;
                line-height: 1;
            }
            .pw-guest-title {
                font-family: 'Outfit', sans-serif;
                font-size: 1.1rem;
                font-weight: 700;
                color: #f1f5f9;
                margin: 0;
            }
            .pw-guest-desc {
                font-size: 0.88rem;
                color: #64748b;
                margin: 0;
                max-width: 380px;
            }
            .pw-guest-btn {
                display: inline-flex;
                align-items: center;
                gap: 8px;
                background: linear-gradient(135deg, #06b6d4, #3b82f6);
                color: #fff;
                border: none;
                border-radius: 10px;
                padding: 10px 22px;
                font-size: 0.9rem;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.2s ease;
                font-family: inherit;
                text-decoration: none;
            }
            .pw-guest-btn:hover {
                transform: translateY(-2px);
                box-shadow: 0 8px 20px rgba(6, 182, 212, 0.4);
                color: #fff;
                text-decoration: none;
            }

            /* Widget Progression — Étudiant connecté */
            .pw-student {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 1rem;
            }
            @media (max-width: 640px) {
                .pw-student { grid-template-columns: 1fr; }
            }

            .pw-stat-card {
                background: rgba(10, 13, 20, 0.5);
                border: 1px solid rgba(255,255,255,0.07);
                border-radius: 12px;
                padding: 1rem 1.25rem;
                display: flex;
                flex-direction: column;
                gap: 4px;
            }
            .pw-stat-label {
                font-size: 0.78rem;
                color: #64748b;
                text-transform: uppercase;
                letter-spacing: 0.06em;
            }
            .pw-stat-value {
                font-family: 'Outfit', sans-serif;
                font-size: 1.7rem;
                font-weight: 700;
                color: #f1f5f9;
                line-height: 1.1;
            }
            .pw-stat-sub {
                font-size: 0.8rem;
                color: #94a3b8;
            }

            .pw-bar-section {
                grid-column: 1 / -1;
                display: flex;
                flex-direction: column;
                gap: 8px;
            }
            .pw-bar-header {
                display: flex;
                justify-content: space-between;
                font-size: 0.85rem;
            }
            .pw-bar-title { color: #94a3b8; }
            .pw-bar-pct { color: #06b6d4; font-weight: 600; }

            .pw-bar-track {
                height: 8px;
                background: rgba(255,255,255,0.06);
                border-radius: 99px;
                overflow: hidden;
            }
            .pw-bar-fill {
                height: 100%;
                border-radius: 99px;
                background: linear-gradient(90deg, #06b6d4, #3b82f6);
                transition: width 1s cubic-bezier(0.4, 0, 0.2, 1);
            }

            .pw-greeting {
                font-size: 0.88rem;
                color: #94a3b8;
                margin-bottom: 0.5rem;
            }
            .pw-greeting strong { color: #06b6d4; }
        `;
        document.head.appendChild(style);
    }

    // ------------------------------------------------------------------
    // Helpers
    // ------------------------------------------------------------------
    function getSession() {
        try {
            const raw = localStorage.getItem('paradis_active_session');
            if (!raw) return null;
            const parsed = JSON.parse(raw);
            return (parsed && parsed.email) ? parsed : null;
        } catch (e) {
            return null;
        }
    }

    async function getProgressData() {
        if (window.ParadisStorage && typeof window.ParadisStorage.getAllLocal === 'function') {
            try {
                return await window.ParadisStorage.getAllLocal('progress');
            } catch (e) {}
        }
        return [];
    }

    // ------------------------------------------------------------------
    // Rendu : Visiteur non connecté
    // ------------------------------------------------------------------
    function renderGuest(container) {
        container.innerHTML = `
            <div class="pw-guest">
                <div class="pw-guest-icon">📚</div>
                <p class="pw-guest-title">Suivez votre progression dans PARADIS IT</p>
                <p class="pw-guest-desc">
                    Créez votre compte étudiant gratuit pour enregistrer votre avancement,
                    suivre votre streak quotidien et synchroniser vos données.
                </p>
                <button type="button" class="pw-guest-btn" id="pw-signup-btn">
                    🎓 Créer mon compte étudiant
                </button>
            </div>
        `;
        const btn = container.querySelector('#pw-signup-btn');
        if (btn) {
            btn.addEventListener('click', () => {
                if (window.ParadisAuth && typeof window.ParadisAuth.openModal === 'function') {
                    window.ParadisAuth.openModal('signup');
                }
            });
        }
    }

    // ------------------------------------------------------------------
    // Rendu : Étudiant connecté avec données de progression
    // ------------------------------------------------------------------
    function renderStudent(container, session, progressRecords) {
        const completedDays = progressRecords.filter(r => (r.is_completed || r.isCompleted || r.study_status === 'completed') && (r.quiz_score !== undefined && r.quiz_score !== null ? r.quiz_score >= 75 : true)).length;
        const pct = Math.round((completedDays / TOTAL_DAYS) * 100);
        const name = session.display_name || session.email.split('@')[0] || 'Étudiant';

        // Streak
        let streak = 0;
        if (window.ParadisProgress && typeof window.ParadisProgress.computeStreak === 'function') {
            streak = window.ParadisProgress.computeStreak(progressRecords);
        }

        // Score moyen
        const scored = progressRecords.filter(r => (r.quiz_score !== null && r.quiz_score !== undefined));
        const avgScore = scored.length > 0
            ? Math.round(scored.reduce((a, b) => a + (b.quiz_score || 0), 0) / scored.length)
            : null;

        container.innerHTML = `
            <p class="pw-greeting">Bonjour, <strong>${name}</strong> 👋 Continuez sur cette lancée !</p>
            <div class="pw-student">
                <div class="pw-stat-card">
                    <span class="pw-stat-label">Jours validés</span>
                    <span class="pw-stat-value">${completedDays}<span style="font-size:1rem;color:#64748b">/${TOTAL_DAYS}</span></span>
                    <span class="pw-stat-sub">jours de formation</span>
                </div>
                <div class="pw-stat-card">
                    <span class="pw-stat-label">Streak actuel</span>
                    <span class="pw-stat-value">${streak} 🔥</span>
                    <span class="pw-stat-sub">jours consécutifs</span>
                </div>
                ${avgScore !== null ? `
                <div class="pw-stat-card">
                    <span class="pw-stat-label">Score QCM moyen</span>
                    <span class="pw-stat-value" style="color:${avgScore >= 70 ? '#10b981' : avgScore >= 50 ? '#f59e0b' : '#f43f5e'}">${avgScore}%</span>
                    <span class="pw-stat-sub">sur ${scored.length} quiz réalisés</span>
                </div>` : ''}
                <div class="pw-bar-section">
                    <div class="pw-bar-header">
                        <span class="pw-bar-title">Progression globale du programme</span>
                        <span class="pw-bar-pct">${pct}%</span>
                    </div>
                    <div class="pw-bar-track">
                        <div class="pw-bar-fill" id="pw-bar-fill" style="width:0%"></div>
                    </div>
                </div>
            </div>
        `;

        // Animation de la barre après insertion dans le DOM
        requestAnimationFrame(() => {
            const fill = container.querySelector('#pw-bar-fill');
            if (fill) fill.style.width = pct + '%';
        });
    }

    // ------------------------------------------------------------------
    // Initialisation principale
    // ------------------------------------------------------------------
    async function renderWidget() {
        const widget = document.getElementById('progress-widget');
        if (!widget) return;

        try {
            const session = getSession();

            if (!session) {
                renderGuest(widget);
                return;
            }

            const progressRecords = await getProgressData();
            renderStudent(widget, session, progressRecords);
        } catch (err) {
            console.warn('[ProgressWidget] Erreur rendu:', err);
            // En cas d'erreur, afficher l'état invité (jamais bloquer avec un spinner)
            const widget2 = document.getElementById('progress-widget');
            if (widget2) renderGuest(widget2);
        }
    }

    // Écoute les connexions/déconnexions pour mettre à jour le widget
    window.addEventListener('paradis:session-changed', () => {
        setTimeout(renderWidget, 300);
    });

    // Initialisation au chargement DOM
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', renderWidget);
    } else {
        // DOM déjà prêt — attendre légèrement que ParadisStorage s'initialise
        setTimeout(renderWidget, 200);
    }

    window.ParadisProgressWidget = {
        refresh: renderWidget
    };

    console.info('[PARADIS] Progress Widget initialisé.');
})();
