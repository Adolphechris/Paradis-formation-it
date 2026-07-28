/**
 * PARADIS — Schedule Timer 14h Widget (Sprint 11)
 *
 * Minuteur quotidien de la formation BCC :
 *   - 5 tranches horaires fixes (08h–10h, 10h–12h, 14h–16h, 16h–18h, 19h–21h)
 *   - Affichage permanent du temps restant dans la tranche courante
 *   - Badge dans la navbar indiquant la tranche active ou la prochaine
 *   - Notification visuelle lorsque la tranche se termine
 */
(function () {
    'use strict';

    const TRANCHES = [
        { label: '🌅 Matinée (1/2)', start: 8, end: 10 },
        { label: '☀️ Matinée (2/2)', start: 10, end: 12 },
        { label: '🏋️ Après-midi (1/2)', start: 14, end: 16 },
        { label: '📚 Après-midi (2/2)', start: 16, end: 18 },
        { label: '🌙 Soirée', start: 19, end: 21 }
    ];

    let timerInterval = null;

    const styleId = 'paradis-timer-styles';
    if (!document.getElementById(styleId)) {
        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = `
            .paradis-timer-badge {
                display: inline-flex;
                align-items: center;
                gap: 6px;
                padding: 4px 12px;
                border-radius: 16px;
                font-size: 0.78rem;
                font-weight: 700;
                margin-left: 10px;
                cursor: pointer;
                transition: all 0.3s;
            }
            .paradis-timer-badge.active {
                background: rgba(16, 185, 129, 0.15);
                color: #10b981;
                border: 1px solid rgba(16, 185, 129, 0.3);
                animation: paradisTimerPulse 3s infinite;
            }
            .paradis-timer-badge.upcoming {
                background: rgba(245, 158, 11, 0.15);
                color: #f59e0b;
                border: 1px solid rgba(245, 158, 11, 0.3);
            }
            .paradis-timer-badge.ended {
                background: rgba(107, 114, 128, 0.15);
                color: #9ca3af;
                border: 1px solid rgba(107, 114, 128, 0.3);
            }
            @keyframes paradisTimerPulse {
                0%, 100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
                50% { box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.15); }
            }

            /* Panneau détaillé du minuteur */
            .paradis-timer-panel {
                position: fixed;
                bottom: 20px;
                right: 20px;
                width: 320px;
                background: rgba(17, 24, 39, 0.97);
                border: 1px solid rgba(6, 182, 212, 0.3);
                border-radius: 14px;
                box-shadow: 0 12px 40px rgba(0, 0, 0, 0.6);
                padding: 20px;
                color: #f3f4f6;
                z-index: 99990;
                transform: translateY(120%);
                transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
            }
            .paradis-timer-panel.active {
                transform: translateY(0);
            }
            .paradis-timer-panel h4 {
                margin: 0 0 14px 0;
                color: #06b6d4;
                font-size: 1rem;
            }
            .paradis-timer-slot {
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 8px 10px;
                border-radius: 6px;
                margin-bottom: 6px;
                font-size: 0.85rem;
            }
            .paradis-timer-slot.current {
                background: rgba(16, 185, 129, 0.15);
                border: 1px solid rgba(16, 185, 129, 0.3);
                color: #10b981;
                font-weight: 700;
            }
            .paradis-timer-slot.past {
                opacity: 0.5;
                text-decoration: line-through;
            }
            .paradis-timer-slot.future {
                color: #d1d5db;
            }
            .paradis-timer-slot-time {
                font-weight: 600;
                font-size: 0.8rem;
                color: #9ca3af;
            }
            .paradis-timer-countdown {
                text-align: center;
                margin-top: 12px;
                padding-top: 12px;
                border-top: 1px solid #374151;
                font-size: 1.4rem;
                font-weight: 800;
                color: #06b6d4;
                font-variant-numeric: tabular-nums;
            }
        `;
        document.head.appendChild(style);
    }

    /**
     * Détermine la tranche active, la prochaine ou la dernière passée
     */
    function getTimerState() {
        const now = new Date();
        const h = now.getHours();
        const m = now.getMinutes();
        const currentMinutes = h * 60 + m;

        for (let i = 0; i < TRANCHES.length; i++) {
            const t = TRANCHES[i];
            const startMin = t.start * 60;
            const endMin = t.end * 60;

            if (currentMinutes >= startMin && currentMinutes < endMin) {
                const remainingSec = (endMin - currentMinutes) * 60 - now.getSeconds();
                return { status: 'active', trancheIndex: i, remainingSec };
            }
        }

        // Trouver la prochaine tranche
        for (let i = 0; i < TRANCHES.length; i++) {
            const t = TRANCHES[i];
            if (currentMinutes < t.start * 60) {
                const untilSec = (t.start * 60 - currentMinutes) * 60 - now.getSeconds();
                return { status: 'upcoming', trancheIndex: i, remainingSec: untilSec };
            }
        }

        return { status: 'ended', trancheIndex: TRANCHES.length - 1, remainingSec: 0 };
    }

    function formatCountdown(sec) {
        if (sec <= 0) return '00:00:00';
        const h = Math.floor(sec / 3600);
        const m = Math.floor((sec % 3600) / 60);
        const s = sec % 60;
        return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    }

    /**
     * Met à jour le badge de minuteur dans la navbar
     */
    function updateTimerBadge() {
        const headerInner = document.querySelector('.md-header__inner');
        if (!headerInner) return;

        let badge = document.getElementById('paradis-timer-header-badge');
        if (!badge) {
            badge = document.createElement('div');
            badge.id = 'paradis-timer-header-badge';
            headerInner.appendChild(badge);
            badge.onclick = toggleTimerPanel;
        }

        const state = getTimerState();
        const tranche = TRANCHES[state.trancheIndex];

        if (state.status === 'active') {
            badge.className = 'paradis-timer-badge active';
            badge.innerHTML = `⏱️ ${tranche.label} — ${formatCountdown(state.remainingSec)}`;
        } else if (state.status === 'upcoming') {
            badge.className = 'paradis-timer-badge upcoming';
            badge.innerHTML = `⏳ Prochaine : ${tranche.label} dans ${formatCountdown(state.remainingSec)}`;
        } else {
            badge.className = 'paradis-timer-badge ended';
            badge.innerHTML = `😴 Journée terminée — Repos mérité !`;
        }
    }

    /**
     * Construit et affiche le panneau détaillé avec les 5 tranches
     */
    function createTimerPanel() {
        if (document.getElementById('paradis-timer-panel')) return;

        const panel = document.createElement('div');
        panel.id = 'paradis-timer-panel';
        panel.className = 'paradis-timer-panel';

        panel.innerHTML = `
            <h4>⏱️ Planning Quotidien — 14h/jour</h4>
            <div id="paradis-timer-slots"></div>
            <div id="paradis-timer-countdown" class="paradis-timer-countdown"></div>
        `;

        document.body.appendChild(panel);
    }

    function updateTimerPanel() {
        const slotsContainer = document.getElementById('paradis-timer-slots');
        const countdownEl = document.getElementById('paradis-timer-countdown');
        if (!slotsContainer || !countdownEl) return;

        const state = getTimerState();

        let slotsHTML = '';
        TRANCHES.forEach((t, i) => {
            let slotClass = 'future';
            if (state.status === 'active' && i === state.trancheIndex) slotClass = 'current';
            else if (state.status === 'active' && i < state.trancheIndex) slotClass = 'past';
            else if (state.status === 'ended') slotClass = 'past';
            else if (state.status === 'upcoming' && i < state.trancheIndex) slotClass = 'past';

            slotsHTML += `
                <div class="paradis-timer-slot ${slotClass}">
                    <span>${t.label}</span>
                    <span class="paradis-timer-slot-time">${t.start}h00 — ${t.end}h00</span>
                </div>
            `;
        });

        slotsContainer.innerHTML = slotsHTML;

        if (state.status === 'active') {
            countdownEl.innerHTML = `⏱️ ${formatCountdown(state.remainingSec)}`;
        } else if (state.status === 'upcoming') {
            countdownEl.innerHTML = `⏳ ${formatCountdown(state.remainingSec)}`;
        } else {
            countdownEl.innerHTML = `🎉 Bravo, journée terminée !`;
        }
    }

    function toggleTimerPanel() {
        createTimerPanel();
        const panel = document.getElementById('paradis-timer-panel');
        if (panel) {
            panel.classList.toggle('active');
            if (panel.classList.contains('active')) {
                updateTimerPanel();
            }
        }
    }

    function startTicker() {
        if (timerInterval) clearInterval(timerInterval);
        timerInterval = setInterval(() => {
            updateTimerBadge();
            const panel = document.getElementById('paradis-timer-panel');
            if (panel && panel.classList.contains('active')) {
                updateTimerPanel();
            }
        }, 1000);
    }

    // Initialisation
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            updateTimerBadge();
            startTicker();
        });
    } else {
        updateTimerBadge();
        startTicker();
    }

    window.ParadisTimer = {
        getTimerState,
        toggleTimerPanel,
        TRANCHES
    };
})();
