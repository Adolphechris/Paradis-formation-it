/**
 * PARADIS — Student Dashboard (Tableau de Bord Étudiant)
 *
 * Rend le contenu de la page /espace-etudiant/ :
 *   - Carte de bienvenue personnalisée
 *   - Grille de progression sur 600 Jours / 12 Semestres avec statut visuel par leçon
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
            background: linear-gradient(135deg, rgba(30, 58, 138, 0.2) 0%, rgba(30, 41, 59, 0.8) 100%);
            border: 1px solid rgba(56, 189, 248, 0.2);
            border-radius: 16px;
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
            background: radial-gradient(ellipse at 80% 50%, rgba(2, 132, 199, 0.06), transparent 60%);
            pointer-events: none;
        }
        .sdb-avatar {
            width: 64px;
            height: 64px;
            border-radius: 50%;
            background: linear-gradient(135deg, #1e3a8a, #0284c7);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.8rem;
            flex-shrink: 0;
            box-shadow: 0 0 0 4px rgba(2, 132, 199, 0.15);
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
            background: linear-gradient(135deg, #1e3a8a, #0284c7);
            color: #fff;
            border-radius: 10px;
            text-decoration: none;
            font-weight: 700;
            font-size: 0.9rem;
            transition: all 0.2s;
            box-shadow: 0 4px 14px rgba(2, 132, 199, 0.25);
            flex-shrink: 0;
        }
        .sdb-resume-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(2, 132, 199, 0.35);
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
        return `../${folder}/${dayId}/`;
    }

    function isDayValidated(dayNum, progressMap) {
        if (dayNum < 1) return true;
        const dayId = 'jour-' + String(dayNum).padStart(2, '0');
        const rec = progressMap[dayId];
        if (!rec) return false;
        const score = rec.quiz_score ?? null;
        const completed = Boolean(rec.is_completed || rec.study_status === 'completed');
        if (score !== null && score !== undefined) {
            return score >= 75;
        }
        return completed;
    }

    function isDayUnlocked(dayNum, progressMap) {
        if (dayNum <= 1) {
            // Jour 1 nécessite la validation du Grand Examen Massif (jour-0o)
            const j0oRec = progressMap['jour-0o'];
            return Boolean(j0oRec && ((j0oRec.quiz_score ?? 0) >= 75 || j0oRec.is_completed));
        }
        return isDayValidated(dayNum - 1, progressMap);
    }

    // Helper Semestre 0 (jour-0a à jour-0o)
    const S0_DAYS = [
        { id: 'jour-0a', code: 'a', label: 'J0a', title: 'Qu\'est-ce qu\'un Ordinateur ?' },
        { id: 'jour-0b', code: 'b', label: 'J0b', title: 'La Logique Binaire' },
        { id: 'jour-0c', code: 'c', label: 'OS vs Applications' },
        { id: 'jour-0d', code: 'd', label: 'Réseau & Internet' },
        { id: 'jour-0e', code: 'e', label: 'Premiers Pas Terminal' },
        { id: 'jour-0f', code: 'f', label: 'Fichiers & Arborescence' },
        { id: 'jour-0g', code: 'g', label: 'Logique d\'un Programme' },
        { id: 'jour-0h', code: 'h', label: 'Métier Admin Sys' },
        { id: 'jour-0i', code: 'i', label: 'Métier Cybersécurité' },
        { id: 'jour-0j', code: 'j', label: 'Avenir de l\'IT' },
        { id: 'jour-0k', code: 'k', label: 'Linux & Open Source' },
        { id: 'jour-0l', code: 'l', label: 'Boîte à Outils IT' },
        { id: 'jour-0m', code: 'm', label: 'Méthodologie & Débogage' },
        { id: 'jour-0n', code: 'n', label: 'Masterclass 600 Jours' },
        { id: 'jour-0o', code: 'o', label: 'Grand Examen Massif' }
    ];

    function isS0DayValidated(dayId, progressMap) {
        const rec = progressMap[dayId];
        if (!rec) return false;
        const score = rec.quiz_score ?? null;
        const completed = Boolean(rec.is_completed || rec.study_status === 'completed');
        return (score !== null && score !== undefined) ? score >= 75 : completed;
    }

    function isS0DayUnlocked(index, progressMap) {
        if (index === 0) return true; // J0a est toujours déverrouillé
        const prevDayId = S0_DAYS[index - 1].id;
        return isS0DayValidated(prevDayId, progressMap);
    }

    function getStatusIcon(record, isUnlocked) {
        if (!isUnlocked) return '🔒';
        if (!record) return '⚪';
        const st = record.study_status;
        const score = record.quiz_score ?? null;
        if ((record.is_completed || st === 'completed') && (score === null || score >= 75)) return '✅';
        if (score !== null && score < 75) return '⚠️';
        if (st === 'in_progress') return '🔵';
        if (st === 'paused') return '⏸️';
        return '⚪';
    }

    function getCardClass(record, isUnlocked) {
        if (!isUnlocked) return 'locked';
        if (!record) return '';
        const st = record.study_status;
        const score = record.quiz_score ?? null;
        if ((record.is_completed || st === 'completed') && (score === null || score >= 75)) return 'completed';
        if (score !== null && score < 75) return 'paused';
        if (st === 'in_progress') return 'in-progress';
        if (st === 'paused') return 'paused';
        return '';
    }

    // -----------------------------------------------------------------------
    // Rendu
    // -----------------------------------------------------------------------
    async function renderDashboard() {
        const anchor = document.getElementById('student-dashboard-root');
        if (!anchor) return;

        const engine = window.ParadisStudySession;
        if (!engine) {
            setTimeout(renderDashboard, 500);
            return;
        }

        const session = getSession();
        const progressRecords = await getAllProgress();
        const progressMap = buildProgressMap(progressRecords);

        // Compte les jours validés avec score >= 75%
        let completed = 0;
        const TOTAL_DAYS = 600;
        for (let d = 1; d <= TOTAL_DAYS; d++) {
            if (isDayValidated(d, progressMap)) {
                completed++;
            }
        }

        const pct = Math.round((completed / TOTAL_DAYS) * 100);
        const streak = computeStreak(progressRecords);
        const totalMin = progressRecords.reduce((a, r) => a + (r.time_spent_minutes || 0), 0);

        // Déterminer la leçon à proposer sur le bouton "Continuer"
        let nextTargetLabel = 'Jour J0a';
        let nextTargetUrl = '../tome-p0/jour-0a/';
        let nextIsS0 = true;

        // Trouver le premier jour de S0 non validé mais déverrouillé
        let s0NextIndex = S0_DAYS.findIndex((d, idx) => !isS0DayValidated(d.id, progressMap) && isS0DayUnlocked(idx, progressMap));
        if (s0NextIndex !== -1) {
            nextTargetLabel = S0_DAYS[s0NextIndex].label;
            nextTargetUrl = `../tome-p0/${S0_DAYS[s0NextIndex].id}/`;
        } else {
            // S0 est entièrement validé ! Passer au Cursus Principal (Jour 1..600)
            nextIsS0 = false;
            let nextNum = 1;
            for (let d = 1; d <= TOTAL_DAYS; d++) {
                if (!isDayValidated(d, progressMap)) {
                    nextNum = d;
                    break;
                }
            }
            if (!isDayUnlocked(nextNum, progressMap)) {
                for (let d = TOTAL_DAYS; d >= 1; d--) {
                    if (isDayUnlocked(d, progressMap)) {
                        nextNum = d;
                        break;
                    }
                }
            }
            nextTargetLabel = `Jour ${nextNum}`;
            const nextDayId = 'jour-' + String(nextNum).padStart(2, '0');
            nextTargetUrl = getLessonUrl(nextDayId);
        }

        // ── HTML ──
        let html = '';

        // Bandeau non-connecté
        if (!session) {
            html += `
            <div class="sdb-guest-banner">
                <span style="font-size:1.8rem">🔑</span>
                <div class="sdb-guest-text">
                    <p class="sdb-guest-title">Connectez-vous pour sauvegarder votre progression</p>
                    <p class="sdb-guest-desc">Vos données de progression sont enregistrées localement. Créez un compte pour les synchroniser.</p>
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
                <p class="sdb-welcome-sub">Double Diplôme PARADIS IT · Bachelor BIT & Master Cybersécurité · 600 jours · Initiation Semestre 0 inclus</p>
            </div>
            <a href="${nextTargetUrl}" class="sdb-resume-btn" style="background: linear-gradient(135deg, #06b6d4, #0284c7);">
                ▶ Continuer — ${nextTargetLabel}
            </a>
        </div>`;

        // Stats
        html += `
        <div class="sdb-stats-row">
            <div class="sdb-stat-card">
                <div class="sdb-stat-icon">📅</div>
                <div class="sdb-stat-val">${completed}<span style="font-size:1rem;color:#64748b">/600</span></div>
                <div class="sdb-stat-lbl">Jours validés (75% min)</div>
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
                <span class="sdb-progress-title">Progression du programme (600 Jours)</span>
                <span class="sdb-progress-pct">${pct}%</span>
            </div>
            <div class="sdb-progress-track">
                <div class="sdb-progress-fill" id="sdb-progress-fill" style="width:0%"></div>
            </div>
        </div>`;

        // ── RENDER SEMESTRE 0 (FEATURING CARDS) ──
        const s0DoneCount = S0_DAYS.filter(d => isS0DayValidated(d.id, progressMap)).length;
        const s0AllDone = s0DoneCount === S0_DAYS.length;
        const s0BadgeClass = s0AllDone ? 'done' : s0DoneCount > 0 ? 'active' : 'locked';
        const s0BadgeLabel = s0AllDone ? `✅ Semestre 0 Validé` : s0DoneCount > 0 ? `🔵 En cours (${s0DoneCount}/15)` : `🚀 À Découvrir (15 Leçons)`;

        html += `
        <div style="margin: 36px 0 18px 0; padding-bottom: 8px; border-bottom: 2px solid #06b6d4;">
            <h3 style="margin:0; font-family:'Outfit',sans-serif; color:#06b6d4; font-size:1.3rem; text-transform:uppercase; letter-spacing:0.05em;">
                🚀 SEMESTRE 0 — INITIATION & PRÉ-REQUIS ABSOLUS (J0a–J0o)
            </h3>
        </div>
        <div class="sdb-phase-section" style="border: 1px solid rgba(6, 182, 212, 0.3); background: rgba(6, 182, 212, 0.03);">
            <div class="sdb-phase-header">
                <span class="sdb-phase-icon">💻</span>
                <span class="sdb-phase-title">Initiation Informatique, Operating Systems, Réseaux & Grand Examen d'Entrée</span>
                <span class="sdb-phase-badge ${s0BadgeClass}" style="background: rgba(6, 182, 212, 0.2); color: #06b6d4;">${s0BadgeLabel}</span>
            </div>
            <div class="sdb-days-grid">`;

        S0_DAYS.forEach((day, idx) => {
            const rec = progressMap[day.id];
            const unlocked = isS0DayUnlocked(idx, progressMap);
            const icon = getStatusIcon(rec, unlocked);
            const cardCls = getCardClass(rec, unlocked);
            const url = unlocked ? `../tome-p0/${day.id}/` : 'javascript:void(0)';
            const score = rec ? (rec.quiz_score ?? null) : null;

            html += `
            <a href="${url}" class="sdb-day-card ${cardCls}" ${!unlocked ? `data-s0-index="${idx}"` : ''}>
                <span class="sdb-day-status-icon">${icon}</span>
                <div class="sdb-day-info">
                    <div class="sdb-day-num" style="color:#06b6d4;">${day.label}</div>
                    <div class="sdb-day-title">${day.title}</div>
                    ${!unlocked ? `<div style="font-size:0.68rem;color:#ef4444;margin-top:2px;">🔒 Requis: ${S0_DAYS[idx-1].label} (75%)</div>` :
                      (score !== null ? `<div style="font-size:0.68rem;color:${score>=75?'#34d399':'#f59e0b'};margin-top:2px;">QCM: ${score}%</div>` : '')}
                </div>
            </a>`;
        });

        html += `</div></div>`;

        // ── 12 SEMESTRES PRINCIPAUX ──
        const makeRange = (start, end) => Array.from({length: end - start + 1}, (_, i) => start + i);

        const SEMESTRES = [
            // CYCLE 1 — BACHELOR BIT
            { id: 'S1',  cycle: 'Cycle 1 — Bachelor BIT (Bac+3)', icon: '🖥️',  title: 'Semestre 1 — Socle Système (Linux, Hardware, Windows)', days: makeRange(1, 50) },
            { id: 'S2',  cycle: 'Cycle 1 — Bachelor BIT (Bac+3)', icon: '🌐',  title: 'Semestre 2 — Réseaux & Télécoms (TCP/IP, VLANs, Routers)', days: makeRange(51, 100) },
            { id: 'S3',  cycle: 'Cycle 1 — Bachelor BIT (Bac+3)', icon: '🐍',  title: 'Semestre 3 — Python, Bash & Compréhension du Code', days: makeRange(101, 150) },
            { id: 'S4',  cycle: 'Cycle 1 — Bachelor BIT (Bac+3)', icon: '🗄️',  title: 'Semestre 4 — Bases de Données, SQL & Data Engineering', days: makeRange(151, 200) },
            { id: 'S5',  cycle: 'Cycle 1 — Bachelor BIT (Bac+3)', icon: '⚡',  title: 'Semestre 5 — Développement Web Full-Stack & APIs REST', days: makeRange(201, 250) },
            { id: 'S6',  cycle: 'Cycle 1 — Bachelor BIT (Bac+3)', icon: '☁️',  title: 'Semestre 6 — Cloud, DevOps (Docker/K8s) & Grand Projet Bachelor', days: makeRange(251, 300) },
            // CYCLE 2 — MASTER CYBERSÉCURITÉ
            { id: 'S7',  cycle: 'Cycle 2 — Master Cybersécurité (Bac+5)', icon: '🛡️',  title: 'Semestre 7 — Fondations Cybersécurité & Offensive Security', days: makeRange(301, 350) },
            { id: 'S8',  cycle: 'Cycle 2 — Master Cybersécurité (Bac+5)', icon: '🦅',  title: 'Semestre 8 — Blue Team, SOC, SIEM & Threat Hunting', days: makeRange(351, 400) },
            { id: 'S9',  cycle: 'Cycle 2 — Master Cybersécurité (Bac+5)', icon: '🔐',  title: 'Semestre 9 — Cryptographie, PKI & Sécurité des Paiements', days: makeRange(401, 450) },
            { id: 'S10', cycle: 'Cycle 2 — Master Cybersécurité (Bac+5)', icon: '🔬',  title: 'Semestre 10 — DFIR, Reverse Engineering & Malware Analysis', days: makeRange(451, 500) },
            { id: 'S11', cycle: 'Cycle 2 — Master Cybersécurité (Bac+5)', icon: '⚙️',  title: 'Semestre 11 — DevSecOps, Hardening CIS & Sécurité Cloud', days: makeRange(501, 550) },
            { id: 'S12', cycle: 'Cycle 2 — Master Cybersécurité (Bac+5)', icon: '🏆',  title: 'Semestre 12 — Gouvernance, Grand Projet Synthétique & Portfolio', days: makeRange(551, 600) },
        ];

        let currentCycleHeader = '';

        for (const sem of SEMESTRES) {
            if (sem.cycle !== currentCycleHeader) {
                currentCycleHeader = sem.cycle;
                html += `
                <div style="margin: 36px 0 18px 0; padding-bottom: 8px; border-bottom: 2px solid #06b6d4;">
                    <h3 style="margin:0; font-family:'Outfit',sans-serif; color:#06b6d4; font-size:1.3rem; text-transform:uppercase; letter-spacing:0.05em;">
                        ${currentCycleHeader}
                    </h3>
                </div>`;
            }

            const phaseDone = sem.days.filter(n => isDayValidated(n, progressMap)).length;
            const phaseTotal = sem.days.length;
            const allDone = phaseDone === phaseTotal;
            const hasStarted = phaseDone > 0 || sem.days.some(n => {
                const id = 'jour-' + String(n).padStart(2, '0');
                const rec = progressMap[id];
                return rec && (rec.study_status === 'in_progress' || rec.study_status === 'paused');
            });
            const badgeClass = allDone ? 'done' : hasStarted ? 'active' : 'locked';
            const badgeLabel = allDone ? `✅ Terminé` : hasStarted ? `🔵 En cours (${phaseDone}/${phaseTotal})` : `🔒 Verrouillé`;

            html += `
            <div class="sdb-phase-section">
                <div class="sdb-phase-header">
                    <span class="sdb-phase-icon">${sem.icon}</span>
                    <span class="sdb-phase-title">${sem.title}</span>
                    <span class="sdb-phase-badge ${badgeClass}">${badgeLabel}</span>
                </div>
                <div class="sdb-days-grid">`;

            for (const dayNum of sem.days) {
                const dayId = 'jour-' + String(dayNum).padStart(2, '0');
                const rec = progressMap[dayId];
                const meta = engine.LESSON_META[dayId] || {};
                const unlocked = isDayUnlocked(dayNum, progressMap);
                const icon = getStatusIcon(rec, unlocked);
                const cardCls = getCardClass(rec, unlocked);
                const url = unlocked ? getLessonUrl(dayId) : 'javascript:void(0)';
                const shortTitle = meta.title ? meta.title.replace(/^Jour \d+ — /, '') : dayId;
                const score = rec ? (rec.quiz_score ?? null) : null;

                html += `
                <a href="${url}" class="sdb-day-card ${cardCls}" ${!unlocked ? `data-day="${dayNum}" data-prev="${dayNum - 1}"` : ''}>
                    <span class="sdb-day-status-icon">${icon}</span>
                    <div class="sdb-day-info">
                        <div class="sdb-day-num">Jour ${dayNum}</div>
                        <div class="sdb-day-title">${shortTitle}</div>
                        ${!unlocked ? `<div style="font-size:0.68rem;color:#ef4444;margin-top:2px;">🔒 Requis: ${dayNum === 1 ? 'Examen J0o (75%)' : `Jour ${dayNum - 1} (75%)`}</div>` :
                          (score !== null ? `<div style="font-size:0.68rem;color:${score>=75?'#34d399':'#f59e0b'};margin-top:2px;">QCM: ${score}%</div>` : '')}
                    </div>
                </a>`;
            }

            html += `</div></div>`;
        }

        anchor.innerHTML = html;

        // Écouteurs de clic sur les cartes verrouillées
        anchor.querySelectorAll('.sdb-day-card.locked').forEach(card => {
            card.addEventListener('click', (e) => {
                e.preventDefault();
                const d = card.getAttribute('data-day');
                const p = card.getAttribute('data-prev');
                alert(`🔒 ACCÈS VERROUILLÉ\n\nLe Jour ${d} est actuellement cadenassé.\nVous devez d'abord réussir l'évaluation QCM du Jour ${p} avec un score d'au moins 75% !`);
            });
        });

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

    // Écouteurs globaux & Détection continue pour MkDocs Instant Navigation
    window.addEventListener('paradis:session-changed', () => setTimeout(renderDashboard, 200));
    window.addEventListener('paradis:study-status-changed', () => setTimeout(renderDashboard, 200));
    window.addEventListener('popstate', () => setTimeout(renderDashboard, 100));
    window.addEventListener('hashchange', () => setTimeout(renderDashboard, 100));

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', renderDashboard);
    } else {
        setTimeout(renderDashboard, 100);
    }

    // Surveillance active du DOM (garantit le rendu lors de la navigation MkDocs)
    setInterval(() => {
        const anchor = document.getElementById('student-dashboard-root');
        if (anchor && anchor.children.length <= 1) {
            renderDashboard();
        }
    }, 400);

    window.ParadisStudentDashboard = { refresh: renderDashboard };
    console.info('[PARADIS] Student Dashboard initialisé avec succès.');
})();
