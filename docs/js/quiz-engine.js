/**
 * PARADIS — QCM Quiz Engine
 * Client-side QCM evaluation engine.
 */
(function () {
    'use strict';

    window.ParadisQuiz = {
        /**
         * Evaluate a QCM submission against the answer key.
         * @param {Array} questions  — Array of question objects
         * @param {Array} answers    — Array of user answer indices
         * @returns {Object}        — { score, total, details[] }
         */
        evaluate(questions, answers) {
            let correct = 0;
            const details = [];
            questions.forEach((q, i) => {
                const isCorrect = answers[i] === q.correct_index;
                if (isCorrect) correct++;
                details.push({ question: q.question, isCorrect, explanation: q.explanation });
            });
            const score = Math.round((correct / questions.length) * 100);
            return { score, total: questions.length, correct, details, passed: score >= 80 };
        }
    };
})();
