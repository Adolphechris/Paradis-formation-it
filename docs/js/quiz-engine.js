/**
 * PARADIS — QCM Quiz Engine
 * Client-side QCM evaluation engine with exam mode support.
 */
(function () {
    'use strict';

    /**
     * Fisher-Yates shuffle for array randomization.
     * @param {Array} arr
     * @returns {Array} shuffled copy
     */
    function shuffle(arr) {
        const result = [...arr];
        for (let i = result.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [result[i], result[j]] = [result[j], result[i]];
        }
        return result;
    }

    /**
     * Select N random unique items from an array.
     * @param {Array} arr
     * @param {number} n
     * @returns {Array}
     */
    function sampleN(arr, n) {
        if (n >= arr.length) return [...arr];
        return shuffle(arr).slice(0, n);
    }

    window.ParadisQuiz = {
        /**
         * Evaluate a QCM submission against the answer key.
         * @param {Array} questions  — Array of question objects
         * @param {Array} answers    — Array of user answer indices (parallel to questions)
         * @param {boolean} [examMode=false] — if true, hides explanations
         * @returns {Object}         — { score, total, correct, details[], passed }
         */
        evaluate(questions, answers, examMode = false) {
            if (!questions || !Array.isArray(questions) || questions.length === 0) {
                return { score: 0, total: 0, correct: 0, details: [], passed: false };
            }

            let correct = 0;
            const details = [];

            questions.forEach((q, i) => {
                const userAnswer = answers[i];
                const isCorrect = userAnswer === q.correct_index;

                if (isCorrect) correct++;

                const detail = {
                    question: q.question,
                    userAnswer: userAnswer,
                    correctAnswer: q.correct_index,
                    isCorrect: isCorrect,
                    weight: q.weight || 1,
                    type: q.type || 'qcm'
                };

                // In exam mode, hide explanations until the session ends
                if (!examMode) {
                    detail.explanation = q.explanation || '';
                    detail.feedback = isCorrect ? 'Correct' : 'Incorrect';
                } else {
                    detail.explanation = null; // hidden until exam ends
                    detail.feedback = null;      // hidden until exam ends
                }

                details.push(detail);
            });

            // Weighted score calculation
            const totalWeight = questions.reduce((sum, q) => sum + (q.weight || 1), 0);
            const weightedCorrect = details.reduce((sum, d) => {
                return sum + (d.isCorrect ? (d.weight || 1) : 0);
            }, 0);
            const score = totalWeight > 0 ? Math.round((weightedCorrect / totalWeight) * 100) : 0;

            return {
                score,
                total: questions.length,
                correct,
                details,
                weightedCorrect,
                totalWeight,
                passed: score >= 80,
                failed: score < 60,
                toConsolidate: score >= 60 && score < 80
            };
        },

        /**
         * Prepare questions for exam mode:
         * - Random selection of N questions
         * - Shuffle choices per question
         * - Strip explanations (revealed only at end)
         * @param {Array} allQuestions — full bank
         * @param {number} count      — number to select (default: all)
         * @returns {Array} prepared questions
         */
        prepareExam(allQuestions, count) {
            if (!allQuestions || !Array.isArray(allQuestions)) return [];

            const selected = count
                ? sampleN(allQuestions, count)
                : [...allQuestions];

            return selected.map((q) => {
                const examQ = {
                    id: q.id,
                    question: q.question,
                    type: q.type || 'qcm',
                    choices: shuffle([...(q.choices || [])]),
                    // Find new index of the correct answer after shuffle
                    correct_index: (q.choices || []).indexOf(q.correct_index !== undefined ? q.choices[q.correct_index instanceof Number ? q.correct_index : q.correct_index] : q.correct) !== -1
                        ? (q.choices || []).indexOf(q.correct_index !== undefined ? (typeof q.correct_index === 'number' ? q.choices[q.correct_index] : q.correct_index) : (q.choices[q.correct_index] || q.correct))
                        : 0,
                    weight: q.weight || 1,
                    tags: q.tags || [],
                    difficulty: q.difficulty || 'medium'
                    // explanation is intentionally absent in exam mode
                };

                return examQ;
            });
        },

        /**
         * Start an exam session: select questions, shuffle answers, set timer.
         * @param {Array} bank    — full question bank
         * @param {Object} opts   — { totalQuestions: 100, durationMinutes: 120, strictMode: true }
         * @returns {Object}      — { questions, startTime, endTime, settings }
         */
        startExam(bank, opts = {}) {
            const settings = {
                totalQuestions: opts.totalQuestions || 100,
                durationMinutes: opts.durationMinutes || 120,
                strictMode: opts.strictMode !== undefined ? opts.strictMode : true
            };

            const questions = this.prepareExam(bank, settings.totalQuestions);
            const startTime = Date.now();
            const endTime = startTime + settings.durationMinutes * 60 * 1000;

            return {
                questions,
                startTime,
                endTime,
                settings,
                answers: new Array(questions.length).fill(null),
                completed: false
            };
        },

        /**
         * Check if exam time has expired.
         * @param {Object} session
         * @returns {boolean}
         */
        isTimeExpired(session) {
            if (!session || !session.endTime) return false;
            return Date.now() > session.endTime;
        },

        /**
         * Get remaining time in seconds.
         * @param {Object} session
         * @returns {number}
         */
        remainingTime(session) {
            if (!session || !session.endTime) return 0;
            return Math.max(0, Math.floor((session.endTime - Date.now()) / 1000));
        },

        /**
         * Format seconds as MM:SS.
         * @param {number} seconds
         * @returns {string}
         */
        formatTime(seconds) {
            const mins = Math.floor(seconds / 60);
            const secs = seconds % 60;
            return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
        }
    };

    console.log('PARADIS Quiz Engine initialized');
})();
