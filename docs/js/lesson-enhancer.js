/**
 * PARADIS — Lesson Enhancer (Espace Étudiant)
 *
 * Transforme visuellement les pages de leçon (jour-XX.md) en un vrai
 * studio d'apprentissage premium :
 *
 *   1. BARRE D'ACTIONS FLOTTANTE : Commencer / Pause / Reprendre / Terminer
 *      avec chronomètre en direct et indicateur de progression.
 *
 *   2. CARDS VISUELLES : Transforme les sections Exercices, QCM et
 *      Abréviations de texte brut en composants visuels interactifs.
 *
 *   3. SCROLL SPY : La table des matières MkDocs se met en surbrillance
 *      selon la section visible à l'écran.
 *
 *   4. SIDEBAR BADGES : Chaque leçon dans la sidebar reçoit un badge
 *      de statut (✅ / 🔵 / ⚪) reflétant la progression.
 */
(function () {
    'use strict';

    // -----------------------------------------------------------------------
    // Styles premium
    // -----------------------------------------------------------------------
    const STYLE_ID = 'paradis-lesson-enhancer-styles';
    if (!document.getElementById(STYLE_ID)) {
        const style = document.createElement('style');
        style.id = STYLE_ID;
        style.textContent = `
        /* ═══════════════════════════════════════════════════════════════
           BARRE D'ACTIONS D'ÉTUDE — flottante en haut
        ═══════════════════════════════════════════════════════════════ */
        .paradis-study-bar {
            position: sticky;
            top: 0;
            z-index: 9000;
            background: rgba(10, 13, 20, 0.95);
            backdrop-filter: blur(16px);
            -webkit-backdrop-filter: blur(16px);
            border-bottom: 1px solid rgba(6, 182, 212, 0.2);
            padding: 10px 20px;
            display: flex;
            align-items: center;
            gap: 14px;
            flex-wrap: wrap;
            box-shadow: 0 4px 20px rgba(0,0,0,0.5);
            animation: slideDown 0.35s cubic-bezier(0.16,1,0.3,1);
        }
        @keyframes slideDown {
            from { transform: translateY(-100%); opacity: 0; }
            to   { transform: translateY(0);     opacity: 1; }
        }

        .psb-lesson-info {
            display: flex;
            flex-direction: column;
            gap: 2px;
            flex: 1;
            min-width: 150px;
        }
        .psb-day-label {
            font-size: 0.72rem;
            text-transform: uppercase;
            letter-spacing: 0.08em;
            color: #64748b;
            font-weight: 600;
        }
        .psb-lesson-title {
            font-family: 'Outfit', sans-serif;
            font-size: 0.92rem;
            font-weight: 700;
            color: #f1f5f9;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }

        .psb-timer {
            font-family: 'Fira Code', monospace;
            font-size: 1.1rem;
            font-weight: 600;
            color: #06b6d4;
            min-width: 90px;
            text-align: center;
            padding: 4px 12px;
            background: rgba(6,182,212,0.08);
            border: 1px solid rgba(6,182,212,0.2);
            border-radius: 8px;
            transition: all 0.3s;
        }
        .psb-timer.running {
            color: #10b981;
            border-color: rgba(16,185,129,0.3);
            background: rgba(16,185,129,0.08);
            animation: pulse-timer 2s ease-in-out infinite;
        }
        @keyframes pulse-timer {
            0%,100% { box-shadow: 0 0 0 0 rgba(16,185,129,0); }
            50%      { box-shadow: 0 0 0 4px rgba(16,185,129,0.15); }
        }
        .psb-timer.paused {
            color: #f59e0b;
            border-color: rgba(245,158,11,0.3);
            background: rgba(245,158,11,0.08);
        }

        .psb-actions {
            display: flex;
            gap: 8px;
            flex-shrink: 0;
        }

        .psb-btn {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            padding: 8px 16px;
            border: none;
            border-radius: 8px;
            font-size: 0.85rem;
            font-weight: 700;
            cursor: pointer;
            transition: all 0.2s cubic-bezier(0.4,0,0.2,1);
            white-space: nowrap;
            font-family: inherit;
        }
        .psb-btn:hover { transform: translateY(-1px); }
        .psb-btn:active { transform: translateY(0); }

        .psb-btn-start {
            background: linear-gradient(135deg, #10b981, #059669);
            color: #fff;
            box-shadow: 0 4px 12px rgba(16,185,129,0.3);
        }
        .psb-btn-start:hover { box-shadow: 0 6px 20px rgba(16,185,129,0.5); }

        .psb-btn-pause {
            background: linear-gradient(135deg, #f59e0b, #d97706);
            color: #fff;
            box-shadow: 0 4px 12px rgba(245,158,11,0.3);
        }
        .psb-btn-pause:hover { box-shadow: 0 6px 20px rgba(245,158,11,0.5); }

        .psb-btn-resume {
            background: linear-gradient(135deg, #3b82f6, #2563eb);
            color: #fff;
            box-shadow: 0 4px 12px rgba(59,130,246,0.3);
        }
        .psb-btn-resume:hover { box-shadow: 0 6px 20px rgba(59,130,246,0.5); }

        .psb-btn-complete {
            background: linear-gradient(135deg, #8b5cf6, #7c3aed);
            color: #fff;
            box-shadow: 0 4px 12px rgba(139,92,246,0.3);
        }
        .psb-btn-complete:hover { box-shadow: 0 6px 20px rgba(139,92,246,0.5); }

        .psb-status-badge {
            padding: 4px 10px;
            border-radius: 20px;
            font-size: 0.75rem;
            font-weight: 700;
            letter-spacing: 0.04em;
        }
        .psb-status-badge.not-started { background: rgba(100,116,139,0.15); color: #94a3b8; border: 1px solid rgba(100,116,139,0.2); }
        .psb-status-badge.in-progress  { background: rgba(16,185,129,0.15); color: #34d399; border: 1px solid rgba(16,185,129,0.25); }
        .psb-status-badge.paused       { background: rgba(245,158,11,0.15); color: #fbbf24; border: 1px solid rgba(245,158,11,0.25); }
        .psb-status-badge.completed    { background: rgba(139,92,246,0.15); color: #a78bfa; border: 1px solid rgba(139,92,246,0.25); }

        /* ═══════════════════════════════════════════════════════════════
           TOAST DE CONFIRMATION
        ═══════════════════════════════════════════════════════════════ */
        .paradis-study-toast {
            position: fixed;
            bottom: 24px;
            right: 24px;
            z-index: 99999;
            padding: 14px 20px;
            border-radius: 12px;
            background: rgba(17,24,39,0.97);
            border: 1px solid rgba(255,255,255,0.1);
            color: #f1f5f9;
            font-size: 0.9rem;
            font-weight: 600;
            box-shadow: 0 10px 30px rgba(0,0,0,0.5);
            display: flex;
            align-items: center;
            gap: 10px;
            animation: toastIn 0.4s cubic-bezier(0.16,1,0.3,1);
            max-width: 360px;
        }
        @keyframes toastIn {
            from { transform: translateY(20px); opacity: 0; }
            to   { transform: translateY(0);    opacity: 1; }
        }
        .paradis-study-toast.hide {
            animation: toastOut 0.3s ease forwards;
        }
        @keyframes toastOut {
            to { transform: translateY(20px); opacity: 0; }
        }

        /* ═══════════════════════════════════════════════════════════════
           CARDS EXERCICES & QCM
        ═══════════════════════════════════════════════════════════════ */
        .paradis-exercise-card {
            background: rgba(26, 34, 52, 0.6);
            border: 1px solid rgba(59,130,246,0.2);
            border-left: 4px solid #3b82f6;
            border-radius: 12px;
            padding: 18px 20px;
            margin: 12px 0;
            transition: all 0.2s ease;
        }
        .paradis-exercise-card:hover {
            border-color: rgba(59,130,246,0.4);
            background: rgba(26,34,52,0.8);
            transform: translateX(2px);
        }
        .paradis-exercise-level {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            font-size: 0.72rem;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.07em;
            padding: 3px 9px;
            border-radius: 20px;
            margin-bottom: 8px;
        }
        .level-simple    { background: rgba(16,185,129,0.15); color: #34d399; }
        .level-inter     { background: rgba(245,158,11,0.15); color: #fbbf24; }
        .level-avance    { background: rgba(239,68,68,0.15);  color: #f87171; }

        .paradis-exercise-title {
            font-weight: 700;
            color: #f1f5f9;
            font-size: 0.95rem;
            margin-bottom: 6px;
        }
        .paradis-exercise-body {
            color: #cbd5e1;
            font-size: 0.9rem;
            line-height: 1.6;
        }

        .paradis-solution-toggle {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            margin-top: 10px;
            padding: 6px 12px;
            background: rgba(6,182,212,0.08);
            border: 1px solid rgba(6,182,212,0.2);
            border-radius: 6px;
            color: #06b6d4;
            font-size: 0.82rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s;
        }
        .paradis-solution-toggle:hover {
            background: rgba(6,182,212,0.15);
        }
        .paradis-solution-body {
            margin-top: 12px;
            padding: 12px 16px;
            background: rgba(6,182,212,0.06);
            border-radius: 8px;
            border-left: 3px solid rgba(6,182,212,0.4);
            color: #e2e8f0;
            font-size: 0.88rem;
            line-height: 1.65;
            display: none;
        }
        .paradis-solution-body.open { display: block; }

        /* ═══════════════════════════════════════════════════════════════
           MODAL COMPLÉTION LEÇON
        ═══════════════════════════════════════════════════════════════ */
        .paradis-complete-overlay {
            position: fixed;
            inset: 0;
            z-index: 99998;
            background: rgba(0,0,0,0.7);
            backdrop-filter: blur(8px);
            display: flex;
            align-items: center;
            justify-content: center;
            animation: fadeIn 0.3s ease;
        }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

        .paradis-complete-modal {
            background: rgba(17,24,39,0.98);
            border: 1px solid rgba(139,92,246,0.4);
            border-radius: 20px;
            padding: 36px;
            max-width: 440px;
            width: 90%;
            text-align: center;
            box-shadow: 0 30px 60px rgba(0,0,0,0.6), 0 0 40px rgba(139,92,246,0.15);
            animation: modalPop 0.4s cubic-bezier(0.16,1,0.3,1);
        }
        @keyframes modalPop {
            from { transform: scale(0.85); opacity: 0; }
            to   { transform: scale(1);    opacity: 1; }
        }
        .pcm-emoji { font-size: 3.5rem; margin-bottom: 12px; }
        .pcm-title {
            font-family: 'Outfit', sans-serif;
            font-size: 1.5rem;
            font-weight: 800;
            color: #f1f5f9;
            margin: 0 0 8px 0;
        }
        .pcm-subtitle { color: #94a3b8; font-size: 0.9rem; margin: 0 0 20px 0; }
        .pcm-stats {
            display: flex;
            justify-content: center;
            gap: 24px;
            margin: 20px 0;
        }
        .pcm-stat-item { display: flex; flex-direction: column; gap: 4px; }
        .pcm-stat-val {
            font-family: 'Outfit', sans-serif;
            font-size: 1.4rem;
            font-weight: 700;
            color: #a78bfa;
        }
        .pcm-stat-lbl { font-size: 0.75rem; color: #64748b; text-transform: uppercase; letter-spacing: 0.06em; }
        .pcm-actions { display: flex; gap: 12px; justify-content: center; margin-top: 24px; flex-wrap: wrap; }
        .pcm-btn {
            padding: 10px 22px;
            border-radius: 10px;
            border: none;
            font-size: 0.9rem;
            font-weight: 700;
            cursor: pointer;
            transition: all 0.2s;
            font-family: inherit;
            text-decoration: none;
            display: inline-flex;
            align-items: center;
            gap: 6px;
        }
        .pcm-btn-primary {
            background: linear-gradient(135deg, #8b5cf6, #7c3aed);
            color: #fff;
            box-shadow: 0 4px 12px rgba(139,92,246,0.4);
        }
        .pcm-btn-secondary {
            background: rgba(255,255,255,0.07);
            color: #e2e8f0;
            border: 1px solid rgba(255,255,255,0.1);
        }
        .pcm-btn:hover { transform: translateY(-2px); }
        `;
        document.head.appendChild(style);
    }

    // -----------------------------------------------------------------------
    // Helpers
    // -----------------------------------------------------------------------
    function showToast(emoji, message, color = '#06b6d4') {
        const existing = document.getElementById('paradis-study-toast');
        if (existing) existing.remove();

        const toast = document.createElement('div');
        toast.id = 'paradis-study-toast';
        toast.className = 'paradis-study-toast';
        toast.innerHTML = `<span style="font-size:1.3rem">${emoji}</span><span>${message}</span>`;
        toast.style.borderColor = color + '40';
        document.body.appendChild(toast);

        setTimeout(() => {
            toast.classList.add('hide');
            setTimeout(() => toast.remove(), 350);
        }, 3500);
    }

    function getNextLessonUrl(dayNum) {
        if (dayNum >= 600) return null;
        const next = dayNum + 1;
        const nextId = 'jour-' + String(next).padStart(2, '0');
        const engine = window.ParadisStudySession;
        if (!engine) return null;
        // Construire l'URL relative selon la structure MkDocs
        const phase = engine.LESSON_META[nextId];
        if (!phase) return null;
        const tomeMap = { P0:'tome-p0', P2:'tome-p2', P3A:'tome-p3a', P3B:'tome-p3b', P3C:'tome-p3c', P4:'tome-p4', P5:'tome-p5', P6:'tome-p6' };
        const tomeFolder = tomeMap[phase.tome] || 'tome-p0';
        return `../${tomeFolder}/${nextId}/`;
    }

    // -----------------------------------------------------------------------
    // BARRE D'ACTIONS — Construction & Logique
    // -----------------------------------------------------------------------
    async function buildStudyBar(dayId) {
        // Ne pas créer deux fois
        if (document.getElementById('paradis-study-bar')) return;

        const engine = window.ParadisStudySession;
        if (!engine) return;

        const meta = engine.LESSON_META[dayId] || {};
        const dayNum = parseInt(dayId.replace('jour-', ''), 10);
        const { status, timeMs } = await engine.getStatus(dayId);

        let currentStatus = status;
        let currentTimeStr = engine.formatTime(timeMs);

        // ── Création du DOM ──
        const bar = document.createElement('div');
        bar.id = 'paradis-study-bar';
        bar.className = 'paradis-study-bar';

        bar.innerHTML = `
            <div class="psb-lesson-info">
                <span class="psb-day-label">📖 Phase ${meta.tome || ''} · Jour ${dayNum} / 600</span>
                <span class="psb-lesson-title">${meta.title || dayId}</span>
            </div>
            <div id="psb-timer" class="psb-timer">${currentTimeStr}</div>
            <span id="psb-status" class="psb-status-badge"></span>
            <div class="psb-actions" id="psb-actions"></div>
        `;

        // Insérer avant le contenu principal
        const content = document.querySelector('.md-content__inner') || document.querySelector('.md-content') || document.querySelector('article');
        if (content) {
            content.parentNode.insertBefore(bar, content);
        }

        const timerEl = document.getElementById('psb-timer');
        const statusEl = document.getElementById('psb-status');
        const actionsEl = document.getElementById('psb-actions');

        function onTick(timeStr) {
            if (timerEl) timerEl.textContent = timeStr;
        }

        function renderState(st) {
            currentStatus = st;
            actionsEl.innerHTML = '';

            // Timer class
            timerEl.className = 'psb-timer';
            if (st === 'in_progress') timerEl.classList.add('running');
            else if (st === 'paused') timerEl.classList.add('paused');

            // Status badge
            const labels = {
                not_started: '⚪ Non commencé',
                in_progress:  '🟢 En cours',
                paused:       '⏸ En pause',
                completed:    '✅ Terminé',
            };
            const classes = {
                not_started: 'not-started',
                in_progress:  'in-progress',
                paused:       'paused',
                completed:    'completed',
            };
            statusEl.textContent = labels[st] || st;
            statusEl.className = `psb-status-badge ${classes[st] || ''}`;

            // Boutons selon état
            if (st === 'not_started') {
                addBtn('▶ Commencer', 'psb-btn-start', async () => {
                    await engine.startStudy(dayId, onTick);
                    renderState('in_progress');
                    showToast('▶️', 'Session démarrée ! Bon courage 💪', '#10b981');
                });
            } else if (st === 'in_progress') {
                addBtn('⏸ Pause', 'psb-btn-pause', async () => {
                    await engine.pauseStudy(dayId, onTick);
                    renderState('paused');
                    showToast('⏸', 'Pause enregistrée. Votre progression est sauvegardée.', '#f59e0b');
                });
                addBtn('✅ Terminer', 'psb-btn-complete', () => handleComplete(dayNum));
            } else if (st === 'paused') {
                addBtn('▶ Reprendre', 'psb-btn-resume', async () => {
                    await engine.resumeStudy(dayId, onTick);
                    renderState('in_progress');
                    showToast('▶️', 'Session reprise. Continuez !', '#3b82f6');
                });
                addBtn('✅ Terminer', 'psb-btn-complete', () => handleComplete(dayNum));
            } else if (st === 'completed') {
                const nextUrl = getNextLessonUrl(dayNum);
                if (nextUrl) {
                    addLinkBtn('➡ Leçon suivante', 'psb-btn-resume', nextUrl);
                }
                addBtn('🔁 Réviser', 'psb-btn-pause', async () => {
                    await engine.startStudy(dayId, onTick);
                    renderState('in_progress');
                    showToast('🔁', 'Mode révision activé.', '#f59e0b');
                });
            }
        }

        function addBtn(label, cls, handler) {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = `psb-btn ${cls}`;
            btn.innerHTML = label;
            btn.addEventListener('click', handler);
            actionsEl.appendChild(btn);
        }

        function addLinkBtn(label, cls, href) {
            const a = document.createElement('a');
            a.href = href;
            a.className = `psb-btn ${cls}`;
            a.innerHTML = label;
            actionsEl.appendChild(a);
        }

        async function handleComplete(dayNum) {
            const record = await engine.completeStudy(dayId);
            const elapsed = engine.formatTime(record.accumulated_ms || 0);
            renderState('completed');
            showCompletionModal(dayNum, elapsed);
        }

        renderState(currentStatus);

        // Si en cours au chargement → reprendre le timer display
        if (currentStatus === 'in_progress') {
            await engine.resumeStudy(dayId, onTick);
        } else {
            timerEl.textContent = engine.formatTime(timeMs);
        }
    }

    // -----------------------------------------------------------------------
    // MODAL DE COMPLÉTION
    // -----------------------------------------------------------------------
    function showCompletionModal(dayNum, elapsed) {
        const nextUrl = getNextLessonUrl(dayNum);
        const nextNum = dayNum + 1;

        const overlay = document.createElement('div');
        overlay.className = 'paradis-complete-overlay';
        overlay.innerHTML = `
            <div class="paradis-complete-modal">
                <div class="pcm-emoji">🎓</div>
                <h2 class="pcm-title">Jour ${dayNum} terminé !</h2>
                <p class="pcm-subtitle">Félicitations ! Votre progression est sauvegardée.</p>
                <div class="pcm-stats">
                    <div class="pcm-stat-item">
                        <span class="pcm-stat-val">${elapsed}</span>
                        <span class="pcm-stat-lbl">Temps étudié</span>
                    </div>
                    <div class="pcm-stat-item">
                        <span class="pcm-stat-val">${dayNum}<span style="font-size:0.9rem;color:#64748b">/600</span></span>
                        <span class="pcm-stat-lbl">Jours validés</span>
                    </div>
                </div>
                <div class="pcm-actions">
                    ${nextUrl ? `<a href="${nextUrl}" class="pcm-btn pcm-btn-primary">➡ Jour ${nextNum}</a>` : ''}
                    <a href="/espace-etudiant/" class="pcm-btn pcm-btn-secondary">📊 Mon tableau de bord</a>
                    <button type="button" class="pcm-btn pcm-btn-secondary" id="pcm-close">Fermer</button>
                </div>
            </div>
        `;
        document.body.appendChild(overlay);
        overlay.querySelector('#pcm-close').addEventListener('click', () => overlay.remove());
        overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });
    }

    // -----------------------------------------------------------------------
    // ENRICHISSEMENT VISUEL DES EXERCICES
    // -----------------------------------------------------------------------
    function enhanceExercises() {
        const content = document.querySelector('.md-content__inner');
        if (!content) return;

        // Transforme les éléments de liste "Exercice X (niveau)" en cards
        const listItems = content.querySelectorAll('li');
        listItems.forEach(li => {
            const text = li.textContent || '';
            const exMatch = text.match(/^Exercice\s+(\d+)\s*\(([^)]+)\)/i);
            if (!exMatch) return;

            const num = exMatch[1];
            const level = exMatch[2].toLowerCase();
            const levelCls = level.includes('simple') ? 'level-simple' :
                             level.includes('interm') ? 'level-inter' :
                             level.includes('avanc') ? 'level-avance' : 'level-inter';
            const levelLabel = level.includes('simple') ? '🟢 Niveau Simple' :
                               level.includes('interm') ? '🟡 Niveau Intermédiaire' :
                               '🔴 Niveau Avancé';

            // Cherche le corrigé dans le même li
            const liHTML = li.innerHTML;
            const corrigeIdx = liHTML.toLowerCase().indexOf('corrigé');
            let exerciseBody = liHTML;
            let solutionBody = '';

            if (corrigeIdx > -1) {
                exerciseBody = liHTML.substring(0, corrigeIdx);
                solutionBody = liHTML.substring(corrigeIdx);
            }

            const card = document.createElement('div');
            card.className = 'paradis-exercise-card';
            card.innerHTML = `
                <div class="paradis-exercise-level ${levelCls}">${levelLabel}</div>
                <div class="paradis-exercise-title">Exercice ${num}</div>
                <div class="paradis-exercise-body">${exerciseBody}</div>
                ${solutionBody ? `
                    <button type="button" class="paradis-solution-toggle">
                        💡 Voir le corrigé
                    </button>
                    <div class="paradis-solution-body">${solutionBody}</div>
                ` : ''}
            `;

            if (li.parentNode) {
                li.parentNode.replaceChild(card, li);
            }

            // Toggle corrigé
            const toggleBtn = card.querySelector('.paradis-solution-toggle');
            const solutionDiv = card.querySelector('.paradis-solution-body');
            if (toggleBtn && solutionDiv) {
                toggleBtn.addEventListener('click', () => {
                    const isOpen = solutionDiv.classList.toggle('open');
                    toggleBtn.innerHTML = isOpen ? '🔼 Masquer le corrigé' : '💡 Voir le corrigé';
                });
            }
        });
    }

    // -----------------------------------------------------------------------
    // SCROLL SPY — Table des matières
    // -----------------------------------------------------------------------
    function initScrollSpy() {
        const tocLinks = document.querySelectorAll('.md-nav--secondary .md-nav__link');
        if (tocLinks.length === 0) return;

        const headings = Array.from(document.querySelectorAll('.md-content h2, .md-content h3'))
            .filter(h => h.id);

        if (headings.length === 0) return;

        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) return;
                const id = entry.target.id;
                tocLinks.forEach(link => {
                    const href = link.getAttribute('href') || '';
                    link.style.color = href.includes('#' + id) ? '#06b6d4' : '';
                    link.style.fontWeight = href.includes('#' + id) ? '700' : '';
                });
            });
        }, { rootMargin: '-20% 0px -70% 0px', threshold: 0 });

        headings.forEach(h => observer.observe(h));
    }

    // -----------------------------------------------------------------------
    // INITIALISATION
    // -----------------------------------------------------------------------
    async function init() {
        const engine = window.ParadisStudySession;
        if (!engine) {
            // Réessayer dans 500ms si le moteur n'est pas encore chargé
            setTimeout(init, 500);
            return;
        }

        const dayId = engine.detectCurrentLesson();
        if (!dayId) return; // Pas une page leçon

        await buildStudyBar(dayId);
        enhanceExercises();
        initScrollSpy();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        setTimeout(init, 200);
    }

    window.ParadisLessonEnhancer = { init };
    console.info('[PARADIS] Lesson Enhancer initialisé.');
})();
