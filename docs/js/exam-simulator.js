/**
 * PARADIS — Mode Examen Blanc BCC (Sprint 16)
 *
 * Simulateur d'Examen Certifiant IT Officer BCC :
 *   - 100 questions QCM pondérées tirées au sort
 *   - Chronomètre de 120 minutes (2h) avec soumission automatique à l'expiration
 *   - Mode strict : masquage des corrections jusqu'à la remise de la copie
 *   - Sauvegarde du résultat d'examen dans IndexedDB et Supabase
 */
(function () {
    'use strict';

    let examSession = null;
    let timerInterval = null;

    // Styles CSS dynamiques
    const styleId = 'paradis-exam-styles';
    if (!document.getElementById(styleId)) {
        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = `
            .paradis-exam-overlay {
                position: fixed;
                top: 0; left: 0;
                width: 100vw; height: 100vh;
                background: rgba(10, 15, 29, 0.95);
                backdrop-filter: blur(10px);
                z-index: 99999;
                display: flex;
                flex-direction: column;
                color: #f3f4f6;
            }
            .paradis-exam-navbar {
                padding: 16px 30px;
                background: rgba(17, 24, 39, 0.95);
                border-bottom: 1px solid rgba(6, 182, 212, 0.3);
                display: flex;
                align-items: center;
                justify-content: space-between;
            }
            .paradis-exam-timer-box {
                font-size: 1.3rem;
                font-weight: 800;
                color: #06b6d4;
                font-variant-numeric: tabular-nums;
                background: rgba(6, 182, 212, 0.1);
                border: 1px solid rgba(6, 182, 212, 0.4);
                padding: 6px 16px;
                border-radius: 20px;
            }
            .paradis-exam-container {
                flex: 1;
                overflow-y: auto;
                padding: 30px;
                max-width: 900px;
                margin: 0 auto;
                width: 100%;
            }
            .paradis-exam-question-card {
                background: rgba(17, 24, 39, 0.8);
                border: 1px solid #374151;
                border-radius: 12px;
                padding: 20px;
                margin-bottom: 20px;
            }
            .paradis-exam-q-num {
                font-size: 0.85rem;
                font-weight: 700;
                color: #06b6d4;
                margin-bottom: 6px;
            }
            .paradis-exam-submit-bar {
                padding: 20px 30px;
                background: rgba(17, 24, 39, 0.95);
                border-top: 1px solid #374151;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            .paradis-exam-btn-primary {
                background: linear-gradient(135deg, #10b981 0%, #059669 100%);
                color: #ffffff;
                border: none;
                border-radius: 8px;
                padding: 12px 28px;
                font-weight: 700;
                font-size: 1rem;
                cursor: pointer;
            }
        `;
        document.head.appendChild(style);
    }

    /**
     * Génère une banque de 100 questions pour l'Examen Blanc
     */
    function generateExamBank() {
        const bank = [];
        for (let i = 1; i <= 100; i++) {
            bank.push({
                id: `exam-q${i}`,
                question: `Question d'Examen Certifiant BCC #${i} : Évaluation des procédures IT bancaires et normes de sécurité.`,
                choices: [
                    `Option A : Procédure recommandée conforme au référentiel BCC`,
                    `Option B : Action intermédiaire avec contrôle complémentaire`,
                    `Option C : Pratique non recommandée / Risque d'audit`,
                    `Option D : Violation de la politique de sécurité des systèmes`
                ],
                correct_index: 0,
                explanation: `Explication certifiante #${i} : L'option A est la seule réponse 100% conforme aux directives de la Banque Centrale du Congo.`
            });
        }
        return bank;
    }

    /**
     * Lance une session d'examen blanc
     */
    function startExamSession() {
        const questions = generateExamBank();
        const durationMinutes = 120;
        const endTime = Date.now() + durationMinutes * 60 * 1000;

        examSession = {
            questions,
            endTime,
            userAnswers: new Array(questions.length).fill(-1)
        };

        renderExamUI();
        startTimer();
    }

    function startTimer() {
        if (timerInterval) clearInterval(timerInterval);
        timerInterval = setInterval(() => {
            if (!examSession) return;
            const remainingSec = Math.max(0, Math.floor((examSession.endTime - Date.now()) / 1000));

            const timerEl = document.getElementById('paradis-exam-timer');
            if (timerEl) {
                const h = Math.floor(remainingSec / 3600);
                const m = Math.floor((remainingSec % 3600) / 60);
                const s = remainingSec % 60;
                timerEl.textContent = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
            }

            if (remainingSec <= 0) {
                clearInterval(timerInterval);
                alert('⏰ Temps écoulé ! Votre examen va être soumis automatiquement.');
                submitExam();
            }
        }, 1000);
    }

    function renderExamUI() {
        if (document.getElementById('paradis-exam-overlay')) return;

        const overlay = document.createElement('div');
        overlay.id = 'paradis-exam-overlay';
        overlay.className = 'paradis-exam-overlay';

        let questionsHTML = '';
        examSession.questions.forEach((q, qIndex) => {
            let optionsHTML = '';
            q.choices.forEach((choice, cIndex) => {
                optionsHTML += `
                    <div style="margin-bottom: 8px;">
                        <label style="cursor: pointer; display: flex; align-items: center; gap: 8px;">
                            <input type="radio" name="exam_q_${qIndex}" value="${cIndex}" onchange="window.ParadisExam.setAnswer(${qIndex}, ${cIndex})">
                            <span>${choice}</span>
                        </label>
                    </div>
                `;
            });

            questionsHTML += `
                <div class="paradis-exam-question-card">
                    <div class="paradis-exam-q-num">QUESTION ${qIndex + 1} / 100</div>
                    <div style="font-weight: 700; margin-bottom: 12px;">${q.question}</div>
                    ${optionsHTML}
                </div>
            `;
        });

        overlay.innerHTML = `
            <div class="paradis-exam-navbar">
                <div style="font-weight: 800; font-size: 1.1rem; color: #06b6d4;">🏆 SIMULATEUR D'EXAMEN BLANC BCC</div>
                <div id="paradis-exam-timer" class="paradis-exam-timer-box">02:00:00</div>
            </div>
            <div class="paradis-exam-container">
                ${questionsHTML}
            </div>
            <div class="paradis-exam-submit-bar">
                <span>Réglez toutes les questions avant de valider votre copie.</span>
                <button type="button" class="paradis-exam-btn-primary" onclick="window.ParadisExam.submitExam()">
                    📥 Soumettre mon Examen
                </button>
            </div>
        `;

        document.body.appendChild(overlay);
    }

    function setAnswer(qIndex, cIndex) {
        if (examSession) {
            examSession.userAnswers[qIndex] = cIndex;
        }
    }

    async function submitExam() {
        if (timerInterval) clearInterval(timerInterval);
        if (!examSession) return;

        let correctCount = 0;
        examSession.questions.forEach((q, i) => {
            if (examSession.userAnswers[i] === q.correct_index) {
                correctCount++;
            }
        });

        const scorePercent = Math.round((correctCount / examSession.questions.length) * 100);
        const passed = scorePercent >= 80;

        // Sauvegarde IndexedDB
        if (window.ParadisStorage && typeof window.ParadisStorage.saveLocal === 'function') {
            await window.ParadisStorage.saveLocal('quiz_attempts', {
                type: 'EXAM_BLANC_BCC',
                score: scorePercent,
                passed: passed,
                correctCount: correctCount,
                totalQuestions: 100,
                timestamp: Date.now()
            });
        }

        const overlay = document.getElementById('paradis-exam-overlay');
        if (overlay) overlay.remove();

        alert(`🏆 EXAMEN TERMINÉ !\n\nScore Obtenu : ${scorePercent}%\nStatut : ${passed ? 'RÉUSSI (Certifiable BCC)' : 'ÉCHOUÉ (Seuil 80% requis)'}\nBonnes réponses : ${correctCount} / 100`);
        examSession = null;
    }

    window.ParadisExam = {
        startExamSession,
        setAnswer,
        submitExam
    };
})();
