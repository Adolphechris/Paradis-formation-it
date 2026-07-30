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
     * Gatekeeper : Verrouille la leçon courante si le jour précédent n'est pas validé à >= 75%.
     */
    async function checkLessonLockGatekeeper() {
        const meta = getCurrentDayMeta();
        if (!meta || meta.dayNumber <= 1) return; // Jour 01 est toujours libre

        if (!window.ParadisStorage || typeof window.ParadisStorage.getAllLocal !== 'function') return;

        try {
            const records = await window.ParadisStorage.getAllLocal('progress');
            const progressMap = {};
            records.forEach(r => { progressMap[r.id || r.day_id] = r; });

            const prevDayNum = meta.dayNumber - 1;
            const isPrevValidated = isDayValidatedFromRecords(prevDayNum, progressMap);

            if (!isPrevValidated) {
                // Verrouiller la page !
                const contentInner = document.querySelector('.md-content__inner') || document.querySelector('.md-content');
                if (contentInner) {
                    const prevDayStr = String(prevDayNum).padStart(2, '0');
                    // Retrouver le sous-dossier du tome du jour précédent
                    let prevTomeFolder = 'tome-p0';
                    if (prevDayNum >= 4 && prevDayNum <= 11) prevTomeFolder = 'tome-p2';
                    else if (prevDayNum >= 12 && prevDayNum <= 17) prevTomeFolder = 'tome-p3a';
                    else if (prevDayNum >= 18 && prevDayNum <= 22) prevTomeFolder = 'tome-p3b';
                    else if (prevDayNum >= 23 && prevDayNum <= 28) prevTomeFolder = 'tome-p3c';
                    else if (prevDayNum >= 29 && prevDayNum <= 35) prevTomeFolder = 'tome-p4';
                    else if (prevDayNum >= 36 && prevDayNum <= 41) prevTomeFolder = 'tome-p5';
                    else if (prevDayNum >= 42 && prevDayNum <= 45) prevTomeFolder = 'tome-p6';

                    // Chemin relatif vers la leçon précédente et l'espace étudiant
                    const prevUrl = `../../${prevTomeFolder}/jour-${prevDayStr}/`;
                    const studentSpaceUrl = `../../espace-etudiant/`;

                    contentInner.innerHTML = `
                        <div class="paradis-locked-screen">
                            <div class="locked-icon">🔒</div>
                            <h1>Leçon Verrouillée — Jour ${meta.dayNumber}</h1>
                            <p>
                                Accès refusé ! Vous ne pouvez pas étudier la leçon du <strong>Jour ${meta.dayNumber}</strong> car vous n'avez pas encore validé l'évaluation du <strong>Jour ${prevDayNum}</strong> avec un score minimum de <strong>75%</strong>.
                            </p>
                            <div class="locked-btn-group">
                                <a href="${prevUrl}" class="btn-lock-prev">
                                    🎯 Réussir l'évaluation du Jour ${prevDayNum}
                                </a>
                                <a href="${studentSpaceUrl}" class="btn-lock-home">
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
