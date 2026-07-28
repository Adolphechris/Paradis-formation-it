/**
 * PARADIS — Day Completion Widget & Sidebar Decoration (Sprint 05)
 *
 * Injecte le bouton de validation de la journée en bas de chaque leçon
 * et met à jour la navigation (sidebar MkDocs) avec des indicateurs visuels.
 */
(function () {
    'use strict';

    // Style du widget de complétion
    const styleId = 'paradis-completion-styles';
    if (!document.getElementById(styleId)) {
        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = `
            .paradis-completion-card {
                margin-top: 40px;
                padding: 24px;
                background: rgba(17, 24, 39, 0.8);
                border: 1px solid rgba(6, 182, 212, 0.3);
                border-radius: 12px;
                box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4);
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 16px;
                text-align: center;
            }

            .paradis-completion-btn {
                background: linear-gradient(135deg, #10b981 0%, #059669 100%);
                color: #ffffff;
                border: none;
                border-radius: 8px;
                padding: 14px 28px;
                font-size: 1rem;
                font-weight: 700;
                cursor: pointer;
                transition: transform 0.2s, box-shadow 0.2s;
                display: inline-flex;
                align-items: center;
                gap: 10px;
            }

            .paradis-completion-btn:hover {
                transform: translateY(-2px);
                box-shadow: 0 6px 20px rgba(16, 185, 129, 0.4);
            }

            .paradis-completion-btn.completed {
                background: linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%);
            }

            .paradis-completion-status {
                font-size: 0.85rem;
                color: #9ca3af;
            }

            /* Badge dans la sidebar */
            .paradis-sidebar-completed-badge {
                margin-left: 6px;
                color: #10b981;
                font-weight: bold;
            }
        `;
        document.head.appendChild(style);
    }

    /**
     * Extrait les métadonnées de la journée courante depuis l'URL ou la page.
     */
    function getCurrentDayMeta() {
        const path = window.location.pathname;
        const match = path.match(/jour-([0-9]{1,2})/i);
        if (!match) return null;

        const dayNumber = parseInt(match[1], 10);
        const dayId = `jour-${dayNumber < 10 ? '0' + dayNumber : dayNumber}`;

        let tome = 'P0';
        if (dayNumber >= 4 && dayNumber <= 11) tome = 'P2';
        else if (dayNumber >= 12 && dayNumber <= 17) tome = 'P3A';
        else if (dayNumber >= 18 && dayNumber <= 22) tome = 'P3B';
        else if (dayNumber >= 23 && dayNumber <= 28) tome = 'P3C';
        else if (dayNumber >= 29 && dayNumber <= 35) tome = 'P4';
        else if (dayNumber >= 36 && dayNumber <= 41) tome = 'P5';
        else if (dayNumber >= 42 && dayNumber <= 45) tome = 'P6';

        return { dayId, dayNumber, tome };
    }

    /**
     * Enregistre la validation de la journée (IndexedDB + Supabase s'il est en ligne).
     */
    async function markDayAsCompleted(meta, isCompleted = true) {
        const payload = {
            id: meta.dayId,
            day_id: meta.dayId,
            tome: meta.tome,
            day_number: meta.dayNumber,
            is_completed: isCompleted,
            completed_at: isCompleted ? new Date().toISOString() : null
        };

        // 1. Sauvegarde locale IndexedDB
        if (window.ParadisStorage && typeof window.ParadisStorage.saveLocal === 'function') {
            await window.ParadisStorage.saveLocal('progress', payload);
            await window.ParadisStorage.enqueueSync({
                action: 'UPSERT_PROGRESS',
                payload: payload
            });
        }

        // 2. Synchronisation directe Supabase si disponible
        if (window.ParadisSupabase && typeof window.ParadisSupabase.saveProgress === 'function') {
            try {
                await window.ParadisSupabase.saveProgress(meta.dayId, {
                    tome: meta.tome,
                    dayNumber: meta.dayNumber,
                    isCompleted: isCompleted
                });
            } catch (err) {
                console.warn('[DayCompletion] Sync Cloud reportée (hors-ligne) :', err.message);
            }
        }
    }

    /**
     * Injecte le widget au bas du contenu principal de la leçon.
     */
    async function injectCompletionWidget() {
        const meta = getCurrentDayMeta();
        if (!meta) return; // Pas sur une page de leçon

        const contentInner = document.querySelector('.md-content__inner');
        if (!contentInner) return;

        if (document.getElementById('paradis-completion-card')) return;

        // Vérifie si la journée est déjà validée
        let isAlreadyCompleted = false;
        if (window.ParadisStorage && typeof window.ParadisStorage.getLocal === 'function') {
            try {
                const record = await window.ParadisStorage.getLocal('progress', meta.dayId);
                if (record && record.is_completed) {
                    isAlreadyCompleted = true;
                }
            } catch (err) {
                console.warn('[DayCompletion] Erreur lecture locale :', err);
            }
        }

        const card = document.createElement('div');
        card.id = 'paradis-completion-card';
        card.className = 'paradis-completion-card';

        card.innerHTML = `
            <div style="font-weight: 700; font-size: 1.1rem; color: #f3f4f6;">
                🎯 Validation de la Journée ${meta.dayNumber} (Tome ${meta.tome})
            </div>
            <button type="button" id="paradis-completion-btn" class="paradis-completion-btn ${isAlreadyCompleted ? 'completed' : ''}">
                ${isAlreadyCompleted ? '🎉 Journée Validée ! (Cliquer pour annuler)' : '✅ Marquer cette journée comme terminée'}
            </button>
            <div id="paradis-completion-status" class="paradis-completion-status">
                ${isAlreadyCompleted ? '💾 Enregistré dans IndexedDB & synchronisé' : 'Cliquez dès que vous avez terminé l\'étude de ce chapitre (14h/jour).'}
            </div>
        `;

        contentInner.appendChild(card);

        const btn = document.getElementById('paradis-completion-btn');
        const status = document.getElementById('paradis-completion-status');

        btn.onclick = async () => {
            btn.disabled = true;
            const nextState = !isAlreadyCompleted;

            try {
                await markDayAsCompleted(meta, nextState);
                isAlreadyCompleted = nextState;

                if (isAlreadyCompleted) {
                    btn.classList.add('completed');
                    btn.innerHTML = '🎉 Journée Validée ! (Cliquer pour annuler)';
                    status.innerHTML = '💾 Enregistré localement (IndexedDB) — Progression sauvegardée !';
                } else {
                    btn.classList.remove('completed');
                    btn.innerHTML = '✅ Marquer cette journée comme terminée';
                    status.innerHTML = 'Marquage réinitialisé.';
                }

                decorateSidebar();
            } catch (err) {
                console.error('[DayCompletion] Erreur :', err);
                status.innerHTML = '⚠️ Erreur enregistrement : ' + err.message;
            } finally {
                btn.disabled = false;
            }
        };
    }

    /**
     * Parcourt la sidebar MkDocs et coche visuellement les jours validés.
     */
    async function decorateSidebar() {
        if (!window.ParadisStorage || typeof window.ParadisStorage.getAllLocal !== 'function') return;

        try {
            const records = await window.ParadisStorage.getAllLocal('progress');
            const completedDays = new Set(records.filter(r => r.is_completed).map(r => r.id));

            const navLinks = document.querySelectorAll('.md-nav__link');
            navLinks.forEach(link => {
                const href = link.getAttribute('href') || '';
                const match = href.match(/jour-([0-9]{1,2})/i) || link.textContent.match(/jour\s*([0-9]{1,2})/i);
                if (match) {
                    const dayNum = parseInt(match[1], 10);
                    const dayId = `jour-${dayNum < 10 ? '0' + dayNum : dayNum}`;

                    // Retire le badge existant
                    const oldBadge = link.querySelector('.paradis-sidebar-completed-badge');
                    if (oldBadge) oldBadge.remove();

                    if (completedDays.has(dayId)) {
                        const badge = document.createElement('span');
                        badge.className = 'paradis-sidebar-completed-badge';
                        badge.textContent = ' ✅';
                        link.appendChild(badge);
                    }
                }
            });
        } catch (err) {
            console.warn('[DayCompletion] Erreur décoration sidebar :', err);
        }
    }

    // Initialisation au chargement de la page
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            injectCompletionWidget();
            decorateSidebar();
        });
    } else {
        injectCompletionWidget();
        decorateSidebar();
    }

    window.ParadisDayCompletion = {
        injectCompletionWidget,
        decorateSidebar,
        markDayAsCompleted
    };
})();
