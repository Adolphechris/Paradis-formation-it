/**
 * PARADIS — QCM Quiz Engine & Widget de Fin de Leçon (Sprint 15)
 *
 * Génère et évalue les QCM interactifs en fin de chaque leçon :
 *   - Banque de questions QCM par jour (format structuré)
 *   - Rendu dynamique HTML avec choix multiples
 *   - Correction instantanée + explications détaillées
 *   - Enregistrement des tentatives dans IndexedDB ('quiz_attempts' et 'progress')
 *   - Sync Cloud vers Supabase
 */
(function () {
    'use strict';

    // Banque de questions QCM de démonstration / socle par jour
    const SAMPLE_QUIZ_BANK = {
        'jour-01': [
            {
                id: 'j1-q1',
                question: 'Quel est le rôle principal d’un composant matériel comme la RAM dans un poste de travail bancaire ?',
                choices: [
                    'Stockage permanent et non volatil des données bancaires',
                    'Mémoire vive rapide pour l’exécution temporaire des applications',
                    'Refroidissement des processeurs informatiques',
                    'Cryptage matériel des liaisons réseau'
                ],
                correct_index: 1,
                explanation: 'La mémoire RAM (Random Access Memory) est la mémoire vive volatile utilisée par le processeur pour exécuter les programmes en cours.'
            },
            {
                id: 'j1-q2',
                question: 'Quelle est la norme de maintenance de premier niveau recommandée pour un poste de travail ?',
                choices: [
                    'Formater le disque dur une fois par jour',
                    'Nettoyage physique, vérification des câbles et mises à jour de sécurité',
                    'Désactiver le pare-feu local pour accélérer le réseau',
                    'Partager les identifiants administrateur avec tous les techniciens'
                ],
                correct_index: 1,
                explanation: 'La maintenance N1 comprend l’inspection physique, l’organisation des câbles et l’application des correctifs système.'
            }
        ]
    };

    // Style CSS dynamique pour le composant QCM
    const styleId = 'paradis-quiz-styles';
    if (!document.getElementById(styleId)) {
        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = `
            .paradis-quiz-card {
                margin: 40px 0;
                padding: 24px;
                background: rgba(17, 24, 39, 0.9);
                border: 1px solid rgba(6, 182, 212, 0.4);
                border-radius: 14px;
                box-shadow: 0 12px 35px rgba(0, 0, 0, 0.5);
                color: #f3f4f6;
            }
            .paradis-quiz-header {
                display: flex;
                align-items: center;
                justify-content: space-between;
                border-bottom: 1px solid #374151;
                padding-bottom: 12px;
                margin-bottom: 20px;
            }
            .paradis-quiz-header h3 {
                margin: 0;
                color: #06b6d4;
                font-size: 1.2rem;
            }
            .paradis-quiz-question-box {
                background: rgba(31, 41, 55, 0.6);
                border: 1px solid #374151;
                border-radius: 10px;
                padding: 16px;
                margin-bottom: 16px;
            }
            .paradis-quiz-question-title {
                font-weight: 700;
                font-size: 1rem;
                color: #ffffff;
                margin-bottom: 12px;
            }
            .paradis-quiz-options {
                display: flex;
                flex-direction: column;
                gap: 8px;
            }
            .paradis-quiz-option {
                display: flex;
                align-items: center;
                gap: 10px;
                padding: 10px 14px;
                border-radius: 8px;
                background: rgba(17, 24, 39, 0.8);
                border: 1px solid #4b5563;
                cursor: pointer;
                transition: all 0.2s;
                font-size: 0.9rem;
            }
            .paradis-quiz-option:hover {
                border-color: #06b6d4;
                background: rgba(6, 182, 212, 0.1);
            }
            .paradis-quiz-option.selected {
                border-color: #06b6d4;
                background: rgba(6, 182, 212, 0.2);
            }
            .paradis-quiz-option.correct {
                border-color: #10b981 !important;
                background: rgba(16, 185, 129, 0.2) !important;
                color: #6ee7b7;
            }
            .paradis-quiz-option.incorrect {
                border-color: #ef4444 !important;
                background: rgba(239, 68, 68, 0.2) !important;
                color: #fca5a5;
            }
            .paradis-quiz-explanation {
                margin-top: 10px;
                padding: 10px 14px;
                border-radius: 6px;
                background: rgba(59, 130, 246, 0.1);
                border-left: 3px solid #3b82f6;
                font-size: 0.85rem;
                color: #d1d5db;
            }
            .paradis-quiz-submit-btn {
                background: linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%);
                color: #ffffff;
                border: none;
                border-radius: 8px;
                padding: 12px 24px;
                font-weight: 700;
                font-size: 0.95rem;
                cursor: pointer;
                transition: all 0.2s;
                margin-top: 10px;
            }
            .paradis-quiz-result-banner {
                margin-top: 20px;
                padding: 16px;
                border-radius: 10px;
                text-align: center;
                font-weight: 700;
                font-size: 1.1rem;
            }
            .paradis-quiz-result-banner.passed {
                background: rgba(16, 185, 129, 0.2);
                border: 1px solid #10b981;
                color: #6ee7b7;
            }
            .paradis-quiz-result-banner.failed {
                background: rgba(239, 68, 68, 0.2);
                border: 1px solid #ef4444;
                color: #fca5a5;
            }
        `;
        document.head.appendChild(style);
    }

    function getCurrentDayId() {
        const path = window.location.pathname;
        const match = path.match(/jour-([0-9]{1,2})/i);
        if (!match) return null;
        const num = parseInt(match[1], 10);
        return `jour-${num < 10 ? '0' + num : num}`;
    }

    /**
     * Injecte le composant QCM en bas de la leçon
     */
    function injectQuizWidget() {
        const dayId = getCurrentDayId();
        if (!dayId) return;

        const contentInner = document.querySelector('.md-content__inner');
        if (!contentInner || document.getElementById('paradis-quiz-card')) return;

        // Récupérer les questions pour cette leçon ou générer un QCM par défaut
        const questions = SAMPLE_QUIZ_BANK[dayId] || [
            {
                id: `${dayId}-q1`,
                question: `QCM de validation — Maîtrise des concepts du ${dayId.toUpperCase()}`,
                choices: [
                    'Option A : Conforme aux recommandations IT Bancaires',
                    'Option B : Non conforme / Vulnérabilité de sécurité',
                    'Option C : Procédure obsolète',
                    'Option D : Maintenance non autorisée'
                ],
                correct_index: 0,
                explanation: 'L’option A respecte les standards de rigueur et de conformité du référentiel IT BCC.'
            }
        ];

        const card = document.createElement('div');
        card.id = 'paradis-quiz-card';
        card.className = 'paradis-quiz-card';

        let questionsHTML = '';
        questions.forEach((q, qIndex) => {
            let optionsHTML = '';
            q.choices.forEach((choice, cIndex) => {
                optionsHTML += `
                    <div class="paradis-quiz-option" data-qindex="${qIndex}" data-cindex="${cIndex}">
                        <input type="radio" name="q_${qIndex}" value="${cIndex}" id="q_${qIndex}_c_${cIndex}">
                        <label for="q_${qIndex}_c_${cIndex}">${choice}</label>
                    </div>
                `;
            });

            questionsHTML += `
                <div class="paradis-quiz-question-box" id="qbox_${qIndex}">
                    <div class="paradis-quiz-question-title">Question ${qIndex + 1} : ${q.question}</div>
                    <div class="paradis-quiz-options">
                        ${optionsHTML}
                    </div>
                    <div class="paradis-quiz-explanation" id="qexp_${qIndex}" style="display: none;">
                        💡 <strong>Explication :</strong> ${q.explanation}
                    </div>
                </div>
            `;
        });

        card.innerHTML = `
            <div class="paradis-quiz-header">
                <h3>🧪 Test de Connaissances — ${dayId.toUpperCase()}</h3>
                <span style="font-size: 0.85rem; color: #9ca3af;">Score minimum requis : 80%</span>
            </div>
            <form id="paradis-quiz-form" onsubmit="return false;">
                ${questionsHTML}
                <button type="button" id="paradis-quiz-submit-btn" class="paradis-quiz-submit-btn">
                    Valider mes réponses
                </button>
            </form>
            <div id="paradis-quiz-result" style="display: none;"></div>
        `;

        contentInner.appendChild(card);

        // Binding sélection visuelle des options radio
        const options = card.querySelectorAll('.paradis-quiz-option');
        options.forEach(opt => {
            opt.onclick = () => {
                const qIndex = opt.getAttribute('data-qindex');
                card.querySelectorAll(`.paradis-quiz-option[data-qindex="${qIndex}"]`).forEach(o => o.classList.remove('selected'));
                opt.classList.add('selected');
                const radio = opt.querySelector('input[type="radio"]');
                if (radio) radio.checked = true;
            };
        });

        // Soumission et Évaluation
        document.getElementById('paradis-quiz-submit-btn').onclick = () => evaluateSubmission(dayId, questions);
    }

    /**
     * Évalue les réponses et enregistre les résultats
     */
    async function evaluateSubmission(dayId, questions) {
        let correctCount = 0;

        questions.forEach((q, qIndex) => {
            const selected = document.querySelector(`input[name="q_${qIndex}"]:checked`);
            const selectedIndex = selected ? parseInt(selected.value, 10) : -1;
            const expEl = document.getElementById(`qexp_${qIndex}`);

            if (expEl) expEl.style.display = 'block';

            const options = document.querySelectorAll(`.paradis-quiz-option[data-qindex="${qIndex}"]`);
            options.forEach(opt => {
                const cIndex = parseInt(opt.getAttribute('data-cindex'), 10);
                if (cIndex === q.correct_index) {
                    opt.classList.add('correct');
                } else if (cIndex === selectedIndex) {
                    opt.classList.add('incorrect');
                }
            });

            if (selectedIndex === q.correct_index) {
                correctCount++;
            }
        });

        const scorePercent = Math.round((correctCount / questions.length) * 100);
        const passed = scorePercent >= 80;

        const resultBanner = document.getElementById('paradis-quiz-result');
        resultBanner.style.display = 'block';
        resultBanner.className = `paradis-quiz-result-banner ${passed ? 'passed' : 'failed'}`;
        resultBanner.innerHTML = `
            ${passed ? '🎉 Bravo ! QCM Réussi !' : '⚠️ QCM Non Validé — Réessayez !'}<br>
            <span style="font-size: 0.95rem; font-weight: 500;">Score obtenu : <strong>${scorePercent}%</strong> (${correctCount}/${questions.length} bonnes réponses)</span>
        `;

        // Sauvegarde dans IndexedDB (quiz_attempts + progress)
        if (window.ParadisStorage && typeof window.ParadisStorage.saveLocal === 'function') {
            try {
                // 1. Store quiz_attempts
                await window.ParadisStorage.saveLocal('quiz_attempts', {
                    day_id: dayId,
                    score: scorePercent,
                    passed: passed,
                    timestamp: Date.now()
                });

                // 2. Mise à jour de progress avec le score QCM
                let progressRecord = await window.ParadisStorage.getLocal('progress', dayId) || {
                    id: dayId,
                    day_id: dayId,
                    is_completed: false
                };

                progressRecord.quiz_score = scorePercent;
                await window.ParadisStorage.saveLocal('progress', progressRecord);

                // Enfiler sync Cloud
                await window.ParadisStorage.enqueueSync({
                    action: 'UPSERT_PROGRESS',
                    payload: progressRecord
                });

                if (window.ParadisSync && typeof window.ParadisSync.triggerPushSync === 'function') {
                    window.ParadisSync.triggerPushSync();
                }
            } catch (err) {
                console.error('[QuizEngine] Erreur enregistrement :', err);
            }
        }
    }

    // Initialisation
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            injectQuizWidget();
        });
    } else {
        injectQuizWidget();
    }

    window.ParadisQuizEngine = {
        injectQuizWidget,
        evaluateSubmission
    };
})();
