/**
 * PARADIS — Student Dashboard (Tableau de Bord Étudiant)
 *
 * Rend le contenu de la page /espace-etudiant/ :
 *   - Carte de bienvenue personnalisée
 *   - Grille des 45 jours avec statut visuel par leçon
 *   - Statistiques globales (progression, streak, temps total)
 *   - Bouton "Reprendre là où j'en suis"
 */
(function () {
    'use strict';

    const STYLE_ID = 'paradis-dashboard-styles';
    if (!document.getElementById(STYLE_ID)) {
        const style = document.createElement('style');
        style.id = STYLE_ID;
        style.textContent = `
        /* ═══════════════════════════════════════════════════════════════
           TABLEAU DE BORD ÉTUDIANT
        ═══════════════════════════════════════════════════════════════ */

        /* Masque le contenu statique (placeholder) */
        #student-dashboard-placeholder { display: none !important; }

        #student-dashboard-root {
            max-width: 1100px;
            margin: 0 auto;
            padding: 0 0 40px 0;
        }

        /* ── Carte de bienvenue ── */
        .sdb-welcome-card {
            background: linear-gradient(135deg, rgba(6,182,212,0.12) 0%, rgba(139,92,246,0.12) 100%);
            border: 1px solid rgba(6,182,212,0.25);
            border-radius: 20px;
            padding: 28px 32px;
            display: flex;
            align-items: center;
            gap: 24px;
            flex-wrap: wrap;
            margin-bottom: 28px;
            position: relative;
            overflow: hidden;
        }
        .sdb-welcome-card::before {
            content: '';
            position: absolute;
            inset: 0;
            background: radial-gradient(ellipse at 80% 50%, rgba(139,92,246,0.08), transparent 60%);
            pointer-events: none;
        }
        .sdb-avatar {
            width: 64px;
            height: 64px;
            border-radius: 50%;
            background: linear-gradient(135deg, #06b6d4, #8b5cf6);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.8rem;
            flex-shrink: 0;
            box-shadow: 0 0 0 4px rgba(6,182,212,0.15);
        }
        .sdb-welcome-text { flex: 1; min-width: 200px; }
        .sdb-welcome-greeting {
            font-size: 0.85rem;
            color: #94a3b8;
            margin: 0 0 4px 0;
        }
        .sdb-welcome-name {
            font-family: 'Outfit', sans-serif;
            font-size: 1.5rem;
            font-weight: 800;
            color: #f1f5f9;
            margin: 0 0 4px 0;
        }
        .sdb-welcome-sub {
            font-size: 0.85rem;
            color: #94a3b8;
            margin: 0;
        }
        .sdb-resume-btn {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            padding: 12px 24px;
            background: linear-gradient(135deg, #06b6d4, #3b82f6);
            color: #fff;
            border-radius: 12px;
            text-decoration: none;
            font-weight: 700;
            font-size: 0.9rem;
            transition: all 0.2s;
            box-shadow: 0 4px 15px rgba(6,182,212,0.3);
            flex-shrink: 0;
        }
        .sdb-resume-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(6,182,212,0.5);
            color: #fff;
            text-decoration: none;
        }

        /* ── Stats bar ── */
        .sdb-stats-row {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 14px;
            margin-bottom: 28px;
        }
        @media (max-width: 768px) { .sdb-stats-row { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 480px) { .sdb-stats-row { grid-template-columns: 1fr; } }

        .sdb-stat-card {
            background: rgba(26,34,52,0.6);
            border: 1px solid rgba(255,255,255,0.07);
            border-radius: 14px;
            padding: 18px 20px;
            display: flex;
            flex-direction: column;
            gap: 4px;
            transition: all 0.2s;
        }
        .sdb-stat-card:hover { border-color: rgba(6,182,212,0.25); background: rgba(26,34,52,0.9); }
        .sdb-stat-icon { font-size: 1.4rem; margin-bottom: 4px; }
        .sdb-stat-val {
            font-family: 'Outfit', sans-serif;
            font-size: 1.8rem;
            font-weight: 800;
            color: #f1f5f9;
            line-height: 1;
        }
        .sdb-stat-lbl { font-size: 0.78rem; color: #64748b; text-transform: uppercase; letter-spacing: 0.06em; }

        /* ── Barre de progression globale ── */
        .sdb-progress-section { margin-bottom: 28px; }
        .sdb-progress-header {
            display: flex;
            justify-content: space-between;
            align-items: baseline;
            margin-bottom: 10px;
        }
        .sdb-progress-title { font-weight: 700; color: #f1f5f9; font-size: 1rem; }
        .sdb-progress-pct { color: #06b6d4; font-weight: 700; font-family: 'Outfit', sans-serif; font-size: 1.1rem; }
        .sdb-progress-track {
            height: 10px;
            background: rgba(255,255,255,0.06);
            border-radius: 99px;
            overflow: hidden;
        }
        .sdb-progress-fill {
            height: 100%;
            background: linear-gradient(90deg, #06b6d4, #8b5cf6);
            border-radius: 99px;
            transition: width 1.2s cubic-bezier(0.4,0,0.2,1);
        }

        /* ── Grille des phases ── */
        .sdb-phase-section { margin-bottom: 32px; }
        .sdb-phase-header {
            display: flex;
            align-items: center;
            gap: 12px;
            margin-bottom: 14px;
            padding-bottom: 10px;
            border-bottom: 1px solid rgba(255,255,255,0.06);
        }
        .sdb-phase-icon { font-size: 1.3rem; }
        .sdb-phase-title {
            font-family: 'Outfit', sans-serif;
            font-weight: 700;
            font-size: 1.05rem;
            color: #f1f5f9;
        }
        .sdb-phase-badge {
            margin-left: auto;
            font-size: 0.75rem;
            padding: 3px 10px;
            border-radius: 20px;
            font-weight: 600;
        }
        .sdb-phase-badge.done { background: rgba(16,185,129,0.15); color: #34d399; }
        .sdb-phase-badge.active { background: rgba(6,182,212,0.15); color: #06b6d4; }
        .sdb-phase-badge.locked { background: rgba(100,116,139,0.15); color: #64748b; }

        .sdb-days-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
            gap: 10px;
        }

        .sdb-day-card {
            background: rgba(26,34,52,0.5);
            border: 1px solid rgba(255,255,255,0.06);
            border-radius: 12px;
            padding: 12px 14px;
            text-decoration: none;
            color: inherit;
            display: flex;
            align-items: center;
            gap: 10px;
            transition: all 0.2s;
            position: relative;
            overflow: hidden;
        }
        .sdb-day-card:hover {
            transform: translateY(-2px);
            border-color: rgba(6,182,212,0.3);
            background: rgba(26,34,52,0.9);
            text-decoration: none;
            color: inherit;
        }
        .sdb-day-card.completed { border-color: rgba(16,185,129,0.2); background: rgba(16,185,129,0.05); }
        .sdb-day-card.in-progress { border-color: rgba(6,182,212,0.3); background: rgba(6,182,212,0.07); animation: glow-pulse 2s ease-in-out infinite; }
        .sdb-day-card.paused { border-color: rgba(245,158,11,0.25); background: rgba(245,158,11,0.05); }
        @keyframes glow-pulse {
            0%,100% { box-shadow: 0 0 0 0 rgba(6,182,212,0); }
            50%      { box-shadow: 0 0 12px rgba(6,182,212,0.2); }
        }

        .sdb-day-status-icon { font-size: 1.1rem; flex-shrink: 0; }
        .sdb-day-info { flex: 1; min-width: 0; }
        .sdb-day-num {
            font-size: 0.72rem;
            color: #64748b;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.05em;
        }
        .sdb-day-title {
            font-size: 0.82rem;
            font-weight: 600;
            color: #cbd5e1;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }
        .sdb-day-card.completed .sdb-day-title { color: #34d399; }
        .sdb-day-card.in-progress .sdb-day-title { color: #06b6d4; }

        /* Toast non connecté */
        .sdb-guest-banner {
            background: rgba(139,92,246,0.1);
            border: 1px solid rgba(139,92,246,0.25);
            border-radius: 14px;
            padding: 20px 24px;
            display: flex;
            align-items: center;
            gap: 16px;
            flex-wrap: wrap;
            margin-bottom: 28px;
        }
        .sdb-guest-text { flex: 1; min-width: 200px; }
        .sdb-guest-title { font-weight: 700; color: #f1f5f9; margin: 0 0 4px 0; font-size: 1rem; }
        .sdb-guest-desc  { font-size: 0.85rem; color: #94a3b8; margin: 0; }
        .sdb-guest-btn {
            padding: 10px 20px;
            background: linear-gradient(135deg, #8b5cf6, #7c3aed);
            color: #fff;
            border: none;
            border-radius: 10px;
            font-size: 0.88rem;
            font-weight: 700;
            cursor: pointer;
            transition: all 0.2s;
            flex-shrink: 0;
            font-family: inherit;
        }
        .sdb-guest-btn:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(139,92,246,0.4); }
        `;
        document.head.appendChild(style);
    }

    // -----------------------------------------------------------------------
    // Helpers
    // -----------------------------------------------------------------------
    function getSession() {
        try {
            const raw = localStorage.getItem('paradis_active_session');
            if (!raw) return null;
            const p = JSON.parse(raw);
            return (p && p.email) ? p : null;
        } catch (e) { return null; }
    }

    async function getAllProgress() {
        if (!window.ParadisStorage) return [];
        try { return await window.ParadisStorage.getAllLocal('progress'); }
        catch (e) { return []; }
    }

    function buildProgressMap(records) {
        const map = {};
        records.forEach(r => { map[r.id || r.day_id] = r; });
        return map;
    }

    function computeStreak(records) {
        if (!window.ParadisProgress) return 0;
        return window.ParadisProgress.computeStreak(records);
    }

    function formatMinutes(min) {
        if (min < 60) return `${min}m`;
        const h = Math.floor(min / 60);
        const m = min % 60;
        return m > 0 ? `${h}h ${m}m` : `${h}h`;
    }

    function getLessonUrl(dayId) {
        const engine = window.ParadisStudySession;
        if (!engine) return '#';
        const meta = engine.LESSON_META[dayId];
        if (!meta) return '#';
        const tomeMap = { P0:'tome-p0', P2:'tome-p2', P3A:'tome-p3a', P3B:'tome-p3b', P3C:'tome-p3c', P4:'tome-p4', P5:'tome-p5', P6:'tome-p6' };
        const folder = tomeMap[meta.tome] || 'tome-p0';
        // Chemin relatif depuis /espace-etudiant/
        return `../${folder}/${dayId}/`;
    }

    function getStatusIcon(record) {
        if (!record) return '⚪';
        const st = record.study_status;
        if (record.is_completed || st === 'completed') return '✅';
        if (st === 'in_progress') return '🔵';
        if (st === 'paused') return '⏸️';
        return '⚪';
    }

    function getCardClass(record) {
        if (!record) return '';
        const st = record.study_status;
        if (record.is_completed || st === 'completed') return 'completed';
        if (st === 'in_progress') return 'in-progress';
        if (st === 'paused') return 'paused';
        return '';
    }

    // -----------------------------------------------------------------------
    // Rendu
    // -----------------------------------------------------------------------
    async function renderDashboard() {
        // Chercher le container cible sur la page espace-etudiant.md
        const anchor = document.getElementById('student-dashboard-root');
        if (!anchor) return; // Pas la bonne page

        const engine = window.ParadisStudySession;
        if (!engine) {
            setTimeout(renderDashboard, 500);
            return;
        }

        const session = getSession();
        const progressRecords = await getAllProgress();
        const progressMap = buildProgressMap(progressRecords);

        const completed = progressRecords.filter(r => r.is_completed || r.study_status === 'completed').length;
        const pct = Math.round((completed / 45) * 100);
        const streak = computeStreak(progressRecords);
        const totalMin = progressRecords.reduce((a, r) => a + (r.time_spent_minutes || 0), 0);
        const inProgress = progressRecords.find(r => r.study_status === 'in_progress' || r.study_status === 'paused');
        const nextDayId = inProgress ? (inProgress.id || inProgress.day_id) :
            (progressRecords.length > 0 ? ('jour-' + String(completed + 1).padStart(2, '0')) : 'jour-01');
        const nextUrl = getLessonUrl(nextDayId);
        const nextNum = parseInt(nextDayId.replace('jour-', ''), 10) || 1;

        // ── HTML ──
        let html = '';

        // Bandeau non-connecté
        if (!session) {
            html += `
            <div class="sdb-guest-banner">
                <span style="font-size:1.8rem">🔑</span>
                <div class="sdb-guest-text">
                    <p class="sdb-guest-title">Connectez-vous pour sauvegarder votre progression</p>
                    <p class="sdb-guest-desc">Vos données de progression sont déjà enregistrées localement. Créez un compte pour les synchroniser.</p>
                </div>
                <button type="button" class="sdb-guest-btn" id="sdb-login-btn">🎓 Créer mon compte</button>
            </div>`;
        }

        // Carte de bienvenue
        const displayName = session ? (session.display_name || session.email.split('@')[0]) : 'Étudiant';
        html += `
        <div class="sdb-welcome-card">
            <div class="sdb-avatar">👨‍🎓</div>
            <div class="sdb-welcome-text">
                <p class="sdb-welcome-greeting">Bienvenue sur votre espace d'étude</p>
                <h2 class="sdb-welcome-name">${displayName}</h2>
                <p class="sdb-welcome-sub">Formation BCC · Agent IT · 45 jours · Banque Centrale du Congo</p>
            </div>
            <a href="${nextUrl}" class="sdb-resume-btn">
                ${inProgress ? '▶ Reprendre' : '▶ Commencer'} — Jour ${nextNum}
            </a>
        </div>`;

        // Stats
        html += `
        <div class="sdb-stats-row">
            <div class="sdb-stat-card">
                <div class="sdb-stat-icon">📅</div>
                <div class="sdb-stat-val">${completed}<span style="font-size:1rem;color:#64748b">/45</span></div>
                <div class="sdb-stat-lbl">Jours validés</div>
            </div>
            <div class="sdb-stat-card">
                <div class="sdb-stat-icon">🔥</div>
                <div class="sdb-stat-val">${streak}</div>
                <div class="sdb-stat-lbl">Streak actuel</div>
            </div>
            <div class="sdb-stat-card">
                <div class="sdb-stat-icon">⏱</div>
                <div class="sdb-stat-val">${formatMinutes(totalMin)}</div>
                <div class="sdb-stat-lbl">Temps total étudié</div>
            </div>
            <div class="sdb-stat-card">
                <div class="sdb-stat-icon">🎯</div>
                <div class="sdb-stat-val">${pct}%</div>
                <div class="sdb-stat-lbl">Progression globale</div>
            </div>
        </div>`;

        // Barre de progression
        html += `
        <div class="sdb-progress-section">
            <div class="sdb-progress-header">
                <span class="sdb-progress-title">Progression du programme</span>
                <span class="sdb-progress-pct">${pct}%</span>
            </div>
            <div class="sdb-progress-track">
                <div class="sdb-progress-fill" id="sdb-progress-fill" style="width:0%"></div>
            </div>
        </div>`;

        // Phases
        const PHASES = [
            { id: 'P0',  icon: '🖥️',  title: 'Phase P0 — Fondamentaux', days: [1,2,3] },
            { id: 'P2',  icon: '🐍',  title: 'Phase P2 — Fondations IT', days: [4,5,6,7,8,9,10,11] },
            { id: 'P3A', icon: '⚙️',  title: 'Phase P3A — Admin Système', days: [12,13,14,15,16,17] },
            { id: 'P3B', icon: '🗄️',  title: 'Phase P3B — Bases de Données', days: [18,19,20,21,22] },
            { id: 'P3C', icon: '🌐',  title: 'Phase P3C — Développement Web', days: [23,24,25,26,27,28] },
            { id: 'P4',  icon: '☁️',  title: 'Phase P4 — Cloud & Sécurité', days: [29,30,31,32,33,34,35] },
            { id: 'P5',  icon: '📝',  title: 'Phase P5 — Tests & Révisions', days: [36,37,38,39,40,41] },
            { id: 'P6',  icon: '🏆',  title: 'Phase P6 — Portfolio & Soutenance', days: [42,43,44,45] },
        ];

        for (const phase of PHASES) {
            const phaseDone = phase.days.filter(n => {
                const id = 'jour-' + String(n).padStart(2, '0');
                const rec = progressMap[id];
                return rec && (rec.is_completed || rec.study_status === 'completed');
            }).length;
            const phaseTotal = phase.days.length;
            const allDone = phaseDone === phaseTotal;
            const hasStarted = phaseDone > 0 || phase.days.some(n => {
                const id = 'jour-' + String(n).padStart(2, '0');
                const rec = progressMap[id];
                return rec && (rec.study_status === 'in_progress' || rec.study_status === 'paused');
            });
            const badgeClass = allDone ? 'done' : hasStarted ? 'active' : 'locked';
            const badgeLabel = allDone ? `✅ Terminée` : hasStarted ? `🔵 En cours (${phaseDone}/${phaseTotal})` : `⚪ Non commencée`;

            html += `
            <div class="sdb-phase-section">
                <div class="sdb-phase-header">
                    <span class="sdb-phase-icon">${phase.icon}</span>
                    <span class="sdb-phase-title">${phase.title}</span>
                    <span class="sdb-phase-badge ${badgeClass}">${badgeLabel}</span>
                </div>
                <div class="sdb-days-grid">`;

            for (const dayNum of phase.days) {
                const dayId = 'jour-' + String(dayNum).padStart(2, '0');
                const rec = progressMap[dayId];
                const meta = engine.LESSON_META[dayId] || {};
                const icon = getStatusIcon(rec);
                const cardCls = getCardClass(rec);
                const url = getLessonUrl(dayId);
                const shortTitle = meta.title ? meta.title.replace(/^Jour \d+ — /, '') : dayId;

                html += `
                <a href="${url}" class="sdb-day-card ${cardCls}">
                    <span class="sdb-day-status-icon">${icon}</span>
                    <div class="sdb-day-info">
                        <div class="sdb-day-num">Jour ${dayNum}</div>
                        <div class="sdb-day-title">${shortTitle}</div>
                    </div>
                </a>`;
            }

            html += `</div></div>`;
        }

        anchor.innerHTML = html;

        // Animation barre de progression
        requestAnimationFrame(() => {
            const fill = document.getElementById('sdb-progress-fill');
            if (fill) fill.style.width = pct + '%';
        });

        // Bouton connexion
        const loginBtn = document.getElementById('sdb-login-btn');
        if (loginBtn) {
            loginBtn.addEventListener('click', () => {
                if (window.ParadisAuth && typeof window.ParadisAuth.openModal === 'function') {
                    window.ParadisAuth.openModal('signup');
                }
            });
        }
    }

    // Mise à jour automatique après connexion
    window.addEventListener('paradis:session-changed', () => setTimeout(renderDashboard, 300));
    window.addEventListener('paradis:study-status-changed', () => setTimeout(renderDashboard, 300));

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', renderDashboard);
    } else {
        setTimeout(renderDashboard, 200);
    }

    window.ParadisStudentDashboard = { refresh: renderDashboard };
    console.info('[PARADIS] Student Dashboard initialisé.');
})();
