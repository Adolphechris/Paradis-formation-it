/**
 * PARADIS — Day Completion Widget, Lock Gatekeeper & Sidebar Locking
 *
 * Contrôle d'accès strict :
 *   - Verrouillage automatique de la leçon si le Jour N-1 n'est pas validé à >= 75%
 *   - Décoration et verrouillage interactif des liens de la sidebar MkDocs
 *   - Affichage du statut de validation en bas de leçon (lié au QCM)
 */
(function () {
    'use strict';

    // Styles des composants de verrouillage et de complétion
    const styleId = 'paradis-completion-styles';
    if (!document.getElementById(styleId)) {
        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = `
            .paradis-completion-card {
                margin-top: 40px;
                padding: 24px;
                background: var(--bg-2, rgba(31, 37, 48, 0.9));
                border: 1px solid var(--border, rgba(255, 255, 255, 0.08));
                border-radius: 12px;
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 12px;
                text-align: center;
            }

            .paradis-completion-status-pill {
                display: inline-flex;
                align-items: center;
                gap: 8px;
                padding: 10px 20px;
                border-radius: 8px;
                font-weight: 700;
                font-size: 0.95rem;
            }
            .paradis-completion-status-pill.passed {
                background: rgba(74, 140, 111, 0.15);
                color: #34d399;
                border: 1px solid rgba(74, 140, 111, 0.4);
            }
            .paradis-completion-status-pill.failed {
                background: rgba(156, 74, 74, 0.15);
                color: #f87171;
                border: 1px solid rgba(156, 74, 74, 0.4);
            }
            .paradis-completion-status-pill.pending {
                background: rgba(74, 127, 165, 0.15);
                color: #6fa5c9;
                border: 1px solid rgba(74, 127, 165, 0.4);
            }

            /* Badge dans la sidebar */
            .paradis-sidebar-badge {
                margin-left: 6px;
                font-size: 0.85rem;
            }

            .md-nav__link.paradis-sidebar-locked {
                opacity: 0.45 !important;
                cursor: not-allowed !important;
            }

            /* Ecran de verrouillage de leçon */
            .paradis-locked-screen {
                text-align: center;
                padding: 50px 24px;
                background: var(--bg-2, #1f2530);
                border: 1px solid var(--error, #9c4a4a);
                border-radius: 16px;
                margin: 40px auto;
                max-width: 680px;
                box-shadow: 0 8px 24px rgba(0,0,0,0.4);
            }
            .paradis-locked-screen .locked-icon {
                font-size: 3.5rem;
                margin-bottom: 16px;
            }
            .paradis-locked-screen h1 {
                font-size: 1.6rem !important;
                color: var(--txt-1, #f8fafc) !important;
                margin-bottom: 12px !important;
                border: none !important;
            }
            .paradis-locked-screen p {
                color: var(--txt-2, #b4bfcc);
                font-size: 0.98rem;
                line-height: 1.6;
                margin-bottom: 24px;
            }
            .paradis-locked-screen .locked-btn-group {
                display: flex;
                gap: 12px;
                justify-content: center;
                flex-wrap: wrap;
            }
            .paradis-locked-screen .btn-lock-prev {
                background: var(--accent, #4a7fa5);
                color: #ffffff;
                padding: 12px 24px;
                border-radius: 8px;
                font-weight: 700;
                text-decoration: none;
                display: inline-flex;
                align-items: center;
                gap: 8px;
            }
            .paradis-locked-screen .btn-lock-home {
                background: var(--bg-3, #262d3a);
                color: var(--txt-1, #ffffff);
                padding: 12px 24px;
                border-radius: 8px;
                font-weight: 600;
                text-decoration: none;
                display: inline-flex;
                align-items: center;
                gap: 8px;
                border: 1px solid var(--border, rgba(255,255,255,0.08));
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
     * Vérifie si un jour N est validé (score QCM >= 75%).
     */
    function isDayValidatedFromRecords(dayNum, progressMap) {
        if (dayNum < 1) return true;
        const dayId = `jour-${dayNum < 10 ? '0' + dayNum : dayNum}`;
        const rec = progressMap[dayId];
        if (!rec) return false;
        const score = rec.quiz_score ?? null;
        const completed = Boolean(rec.is_completed || rec.study_status === 'completed');
        if (score !== null && score !== undefined) {
            return score >= 75;
        }
        return completed;
    }

    /**
     * Calcule le dossier du tome pour n'importe quel jour (1..600).
     */
    function getTomeFolderForDay(dayNum) {
        if (dayNum <= 50) return 'tome-p0';
        if (dayNum <= 100) return 'tome-p2';
        if (dayNum <= 150) return 'tome-p3';
        if (dayNum <= 200) return 'tome-p4';
        if (dayNum <= 250) return 'tome-p5';
        if (dayNum <= 300) return 'tome-p6';
        if (dayNum <= 350) return 'tome-p7';
        if (dayNum <= 400) return 'tome-p8';
        if (dayNum <= 450) return 'tome-p9';
        if (dayNum <= 500) return 'tome-p10';
        if (dayNum <= 550) return 'tome-p11';
        return 'tome-p12';
    }

    /**
     * Gatekeeper : Verrouille la leçon courante si le pré-requis n'est pas validé à >= 75%.
     */
    async function checkLessonLockGatekeeper() {
        const path = window.location.pathname;
        const matchS0 = path.match(/\/jour-0([a-o])\/?$/i);
        const matchMain = path.match(/\/jour-(\d+)\/?$/i);

        if (!window.ParadisStorage || typeof window.ParadisStorage.getAllLocal !== 'function') return;

        try {
            const records = await window.ParadisStorage.getAllLocal('progress');
            const progressMap = {};
            records.forEach(r => { progressMap[r.id || r.day_id] = r; });

            const contentInner = document.querySelector('.md-content__inner') || document.querySelector('.md-content');

            // 1. Cas Semestre 0 (jour-0a à jour-0o)
            if (matchS0) {
                const charCode = matchS0[1].toLowerCase().charCodeAt(0);
                if (charCode === 97) return; // J0a (97) est toujours déverrouillé

                const prevChar = String.fromCharCode(charCode - 1);
                const prevDayId = `jour-0${prevChar}`;
                const prevRec = progressMap[prevDayId];
                const isValidated = prevRec && ((prevRec.quiz_score ?? 0) >= 75 || prevRec.is_completed);

                if (!isValidated && contentInner) {
                    contentInner.innerHTML = `
                        <div class="paradis-locked-screen">
                            <div class="locked-icon">🔒</div>
                            <h1>Leçon Verrouillée — Jour J0${matchS0[1].toUpperCase()}</h1>
                            <p>
                                Accès refusé ! Vous devez d'abord valider l'évaluation du <strong>Jour J0${prevChar.toUpperCase()}</strong> avec un score minimum de <strong>75%</strong>.
                            </p>
                            <div class="locked-btn-group">
                                <a href="../jour-0${prevChar}/" class="btn-lock-prev">
                                    🎯 Réussir l'évaluation du Jour J0${prevChar.toUpperCase()}
                                </a>
                                <a href="../../espace-etudiant/" class="btn-lock-home">
                                    🎓 Tableau de bord Étudiant
                                </a>
                            </div>
                        </div>
                    `;
                    return;
                }
            }

            // 2. Cas Cursus Principal (Jour 1 à Jour 600)
            if (matchMain) {
                const dayNum = parseInt(matchMain[1], 10);

                // Pour le Jour 1 : vérification du Grand Examen Massif (jour-0o)
                if (dayNum === 1) {
                    const j0oRec = progressMap['jour-0o'];
                    const isJ0oValidated = j0oRec && ((j0oRec.quiz_score ?? 0) >= 75 || j0oRec.is_completed);
                    
                    if (!isJ0oValidated && contentInner) {
                        contentInner.innerHTML = `
                            <div class="paradis-locked-screen">
                                <div class="locked-icon">🎓</div>
                                <h1>Semestre 0 Non Validé — Accès Bloqué</h1>
                                <p>
                                    Pour entamer le <strong>Jour 1 du Semestre 1</strong>, vous devez d'abord réussir le <strong>Grand Examen Massif de Pré-requis (Jour J0o)</strong> avec un score minimum de <strong>75%</strong>.
                                </p>
                                <div class="locked-btn-group">
                                    <a href="../jour-0o/" class="btn-lock-prev">
                                        🏆 Passer le Grand Examen Massif (Jour J0o)
                                    </a>
                                    <a href="../jour-0a/" class="btn-lock-prev" style="background: #0284c7;">
                                        🚀 Commencer le Semestre 0 au Jour J0a
                                    </a>
                                    <a href="../../espace-etudiant/" class="btn-lock-home">
                                        🎓 Tableau de bord Étudiant
                                    </a>
                                </div>
                            </div>
                        `;
                        return;
                    }
                    return; // J1 déverrouillé une fois J0o validé !
                }

                // Pour les Jours 2 à 600 : vérification du jour N-1
                const prevDayNum = dayNum - 1;
                const isPrevValidated = isDayValidatedFromRecords(prevDayNum, progressMap);

                if (!isPrevValidated && contentInner) {
                    const prevDayStr = String(prevDayNum).padStart(2, '0');
                    const prevTomeFolder = getTomeFolderForDay(prevDayNum);
                    const prevUrl = `../../${prevTomeFolder}/jour-${prevDayStr}/`;

                    contentInner.innerHTML = `
                        <div class="paradis-locked-screen">
                            <div class="locked-icon">🔒</div>
                            <h1>Leçon Verrouillée — Jour ${dayNum}</h1>
                            <p>
                                Accès refusé ! Vous ne pouvez pas étudier la leçon du <strong>Jour ${dayNum}</strong> car vous n'avez pas encore validé l'évaluation du <strong>Jour ${prevDayNum}</strong> avec un score minimum de <strong>75%</strong>.
                            </p>
                            <div class="locked-btn-group">
                                <a href="${prevUrl}" class="btn-lock-prev">
                                    🎯 Réussir l'évaluation du Jour ${prevDayNum}
                                </a>
                                <a href="../../espace-etudiant/" class="btn-lock-home">
                                    🎓 Tableau de bord Étudiant
                                </a>
                            </div>
                        </div>
                    `;
                }
            }
        } catch (err) {
            console.warn('[DayCompletion] Erreur vérification verrouillage :', err);
        }
    }

    /**
     * Injecte l'indicateur de statut de complétion en bas de chaque leçon.
     */
    async function injectCompletionWidget() {
        const meta = getCurrentDayMeta();
        if (!meta) return;

        const contentInner = document.querySelector('.md-content__inner');
        if (!contentInner) return;
        if (document.getElementById('paradis-completion-card')) return;

        let record = null;
        if (window.ParadisStorage && typeof window.ParadisStorage.getLocal === 'function') {
            try {
                record = await window.ParadisStorage.getLocal('progress', meta.dayId);
            } catch (err) {
                console.warn('[DayCompletion] Erreur lecture locale :', err);
            }
        }

        const score = record ? (record.quiz_score ?? null) : null;
        const isValidated = score !== null ? (score >= 75) : Boolean(record?.is_completed);

        const card = document.createElement('div');
        card.id = 'paradis-completion-card';
        card.className = 'paradis-completion-card';

        let pillClass = 'pending';
        let pillText = `✍️ Passez le QCM ci-dessus pour valider ce cours (75% requis)`;

        if (score !== null) {
            if (score >= 75) {
                pillClass = 'passed';
                pillText = `🎉 Journée Validée avec ${score}% aux QCM ! (Jour suivant déverrouillé)`;
            } else {
                pillClass = 'failed';
                pillText = `🔒 Score actuel : ${score}% / 75% requis. Réévisez et repassez le test pour débloquer la suite.`;
            }
        }

        card.innerHTML = `
            <div style="font-weight: 700; font-size: 1.05rem; color: var(--txt-1, #f8fafc);">
                🎯 Évaluation & Validation — Jour ${meta.dayNumber}
            </div>
            <div class="paradis-completion-status-pill ${pillClass}">
                ${pillText}
            </div>
            <div style="font-size:0.8rem; color: var(--txt-3, #7a8898);">
                Seul un score supérieur ou égal à 75% au QCM ci-dessus permet de débloquer le Jour suivant.
            </div>
        `;

        contentInner.appendChild(card);
    }

    /**
     * Decorne et verrouille la sidebar MkDocs pour empêcher l'accès aux jours non déverrouillés.
     */
    async function decorateSidebar() {
        if (!window.ParadisStorage || typeof window.ParadisStorage.getAllLocal !== 'function') return;

        try {
            const records = await window.ParadisStorage.getAllLocal('progress');
            const progressMap = {};
            records.forEach(r => { progressMap[r.id || r.day_id] = r; });

            const navLinks = document.querySelectorAll('.md-nav__link');
            navLinks.forEach(link => {
                const href = link.getAttribute('href') || '';
                const match = href.match(/jour-([0-9]{1,2})/i) || link.textContent.match(/jour\s*([0-9]{1,2})/i);
                if (match) {
                    const dayNum = parseInt(match[1], 10);

                    // Supprime les anciens badges
                    const oldBadge = link.querySelector('.paradis-sidebar-badge');
                    if (oldBadge) oldBadge.remove();

                    const isUnlocked = (dayNum <= 1) || isDayValidatedFromRecords(dayNum - 1, progressMap);
                    const isValidated = isDayValidatedFromRecords(dayNum, progressMap);

                    const badge = document.createElement('span');
                    badge.className = 'paradis-sidebar-badge';

                    if (isValidated) {
                        badge.textContent = ' ✅';
                        badge.style.color = '#34d399';
                        link.appendChild(badge);
                    } else if (!isUnlocked) {
                        badge.textContent = ' 🔒';
                        badge.style.opacity = '0.7';
                        link.appendChild(badge);
                        link.classList.add('paradis-sidebar-locked');
                        link.title = `🔒 Verrouillé (Jour ${dayNum - 1} requis à 75%)`;

                        link.onclick = (e) => {
                            e.preventDefault();
                            alert(`🔒 ACCÈS VERROUILLÉ\n\nLe Jour ${dayNum} est actuellement cadenassé.\nVous devez d'abord réussir l'évaluation QCM du Jour ${dayNum - 1} avec un score d'au moins 75% !`);
                        };
                    }
                }
            });
        } catch (err) {
            console.warn('[DayCompletion] Erreur décoration sidebar :', err);
        }
    }

    // Listener sur changement de session ou score
    window.addEventListener('paradis:session-changed', () => {
        decorateSidebar();
        checkLessonLockGatekeeper();
    });

    // Initialisation au chargement de la page
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            checkLessonLockGatekeeper();
            injectCompletionWidget();
            decorateSidebar();
        });
    } else {
        checkLessonLockGatekeeper();
        injectCompletionWidget();
        decorateSidebar();
    }

    window.ParadisDayCompletion = {
        injectCompletionWidget,
        decorateSidebar,
        checkLessonLockGatekeeper
    };
})();
