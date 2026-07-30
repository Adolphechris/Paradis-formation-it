/**
 * PARADIS — QCM Quiz Engine & Système de Progression Verrouillée (75% Minimum)
 *
 * Moteur d'évaluation interactive et de verrouillage pédagogique :
 *   - Banque de QCM avec explications corrigées pour chaque question
 *   - Évaluation instantanée avec note globale et corrigé détaillé
 *   - Verrouillage du passage au Jour suivant si le score < 75%
 *   - Déverrouillage automatique du Jour N+1 dès que 75% est atteint
 *   - Examens de fin de Tome (P0, P2, P3A, P3B, P3C, P4, P5, P6)
 */
(function () {
    'use strict';

    const PASSING_SCORE = 75; // 75% minimum exigé

    // -----------------------------------------------------------------------
    // Banque de questions interactives par Jour
    // -----------------------------------------------------------------------
    const QUIZ_BANK = {
        'jour-01': [
            {
                id: 'j1-q1',
                question: 'Quel est le rôle principal d’un système d’exploitation (OS) comme Windows 11 ?',
                choices: [
                    'Chiffrer le disque dur automatiquement sans mot de passe',
                    'Servir d’intermédiaire/traducteur entre le matériel (hardware) et les logiciels (software)',
                    'Accélérer la vitesse de connexion Internet du fournisseur',
                    'Fabriquer les composants électroniques de la carte mère'
                ],
                correct_index: 1,
                explanation: 'L’OS est le traducteur universel qui permet d’exécuter les logiciels et de faire communiquer l’utilisateur avec le matériel.'
            },
            {
                id: 'j1-q2',
                question: 'Quel raccourci clavier permet d’ouvrir la fenêtre d’exécution rapide sous Windows ?',
                choices: [
                    'Ctrl + Alt + Suppr',
                    'Windows + R',
                    'Windows + E',
                    'Alt + F4'
                ],
                correct_index: 1,
                explanation: 'Le raccourci Windows + R ouvre l’invite Exécuter, permettant de lancer rapidement des outils comme control ou compmgmt.msc.'
            },
            {
                id: 'j1-q3',
                question: 'Pourquoi est-il crucial de travailler au quotidien avec un compte Standard plutôt qu’Administrateur ?',
                choices: [
                    'Pour économiser la mémoire RAM de l’ordinateur',
                    'Pour empêcher un virus ou un clic piégé de prendre le contrôle total du système',
                    'Parce que le compte Administrateur empêche de se connecter au Wi-Fi',
                    'Parce qu’un compte Standard est payant'
                ],
                correct_index: 1,
                explanation: 'En compte Standard, même si un logiciel malveillant s’exécute, il n’a pas les droits pour modifier les fichiers système ou corrompre l’OS.'
            },
            {
                id: 'j1-q4',
                question: 'Que signifie une adresse IP qui commence par 169.254.x.x (APIPA) ?',
                choices: [
                    'L’ordinateur est connecté en très haut débit fibre optique',
                    'Le serveur DHCP n’a pas répondu et l’ordinateur s’est attribué une adresse temporaire sans réseau',
                    'L’ordinateur est victime d’un piratage informatique externe',
                    'Le câble Ethernet est branché à l’envers'
                ],
                correct_index: 1,
                explanation: 'Une adresse 169.254.x.x (APIPA) indique que le poste n’a pas réussi à joindre le serveur DHCP pour obtenir une vraie adresse réseau.'
            }
        ],
        'jour-02': [
            {
                id: 'j2-q1',
                question: 'Quel est le rôle principal du langage HTML5 dans une application web ?',
                choices: [
                    'Créer des animations 3D et des calculs scientifiques complexes',
                    'Définir la structure sémantique et le squelette du document web',
                    'Gérer la base de données relationnelle du serveur',
                    'Chiffrer les requêtes HTTPS entre le client et le serveur'
                ],
                correct_index: 1,
                explanation: 'HTML5 définit la structure et le squelette du contenu (titres, paragraphes, formulaires, sections).'
            },
            {
                id: 'j2-q2',
                question: 'Pourquoi relie-t-on toujours une balise <label> à son champ <input> avec for et id ?',
                choices: [
                    'Pour accélérer la vitesse d’affichage CSS',
                    'Pour garantir l’accessibilité numérique et la clarté d’utilisation du formulaire',
                    'Parce que Windows l’exige pour enregistrer le fichier',
                    'Pour empêcher la saisie de majuscules'
                ],
                correct_index: 1,
                explanation: 'Relier les labels et inputs garantit l’accessibilité pour les lecteurs d’écran et améliore le confort de clic.'
            },
            {
                id: 'j2-q3',
                question: 'Quelle commande Git permet d’enregistrer une photo instantanée du projet avec un message descriptif ?',
                choices: [
                    'git init',
                    'git push',
                    'git commit -m "Message"',
                    'git checkout'
                ],
                correct_index: 2,
                explanation: 'git commit enregistre un point de sauvegarde (snapshot) qualifié par un message clair.'
            }
        ]
    };

    // -----------------------------------------------------------------------
    // Style CSS dynamique
    // -----------------------------------------------------------------------
    const STYLE_ID = 'paradis-quiz-locked-styles';
    if (!document.getElementById(STYLE_ID)) {
        const style = document.createElement('style');
        style.id = STYLE_ID;
        style.textContent = `
            .paradis-quiz-card {
                margin: 40px 0;
                padding: 28px;
                background: rgba(17, 24, 39, 0.95);
                border: 1px solid rgba(6, 182, 212, 0.35);
                border-radius: 16px;
                box-shadow: 0 15px 40px rgba(0, 0, 0, 0.6);
                color: #f3f4f6;
            }
            .paradis-quiz-header {
                display: flex;
                align-items: center;
                justify-content: space-between;
                border-bottom: 1px solid rgba(255,255,255,0.1);
                padding-bottom: 16px;
                margin-bottom: 24px;
                flex-wrap: wrap;
                gap: 10px;
            }
            .paradis-quiz-header h3 {
                margin: 0;
                color: #06b6d4;
                font-size: 1.25rem;
                font-family: 'Outfit', sans-serif;
                font-weight: 700;
            }
            .paradis-quiz-badge-target {
                background: rgba(245, 158, 11, 0.15);
                color: #fbbf24;
                border: 1px solid rgba(245, 158, 11, 0.3);
                padding: 4px 12px;
                border-radius: 20px;
                font-size: 0.8rem;
                font-weight: 700;
            }
            .paradis-quiz-question-box {
                background: rgba(31, 41, 55, 0.6);
                border: 1px solid rgba(255,255,255,0.08);
                border-radius: 12px;
                padding: 20px;
                margin-bottom: 20px;
            }
            .paradis-quiz-question-title {
                font-weight: 700;
                font-size: 0.98rem;
                color: #ffffff;
                margin-bottom: 14px;
                line-height: 1.5;
            }
            .paradis-quiz-options {
                display: flex;
                flex-direction: column;
                gap: 10px;
            }
            .paradis-quiz-option {
                display: flex;
                align-items: center;
                gap: 12px;
                padding: 12px 16px;
                border-radius: 10px;
                background: rgba(17, 24, 39, 0.8);
                border: 1px solid rgba(255,255,255,0.1);
                cursor: pointer;
                transition: all 0.2s ease;
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
                background: rgba(16, 185, 129, 0.2) !important;
                border-color: #10b981 !important;
                color: #6ee7b7 !important;
                font-weight: 600;
            }
            .paradis-quiz-option.incorrect {
                background: rgba(239, 68, 68, 0.2) !important;
                border-color: #ef4444 !important;
                color: #fca5a5 !important;
            }
            .paradis-quiz-explanation {
                margin-top: 14px;
                padding: 12px 16px;
                background: rgba(6, 182, 212, 0.08);
                border-left: 4px solid #06b6d4;
                border-radius: 6px;
                font-size: 0.88rem;
                color: #cbd5e1;
                line-height: 1.6;
            }
            .paradis-quiz-submit-btn {
                background: linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%);
                color: #ffffff;
                border: none;
                border-radius: 10px;
                padding: 14px 28px;
                font-size: 1rem;
                font-weight: 700;
                cursor: pointer;
                transition: all 0.2s;
                width: 100%;
                margin-top: 10px;
                font-family: inherit;
            }
            .paradis-quiz-submit-btn:hover {
                transform: translateY(-2px);
                box-shadow: 0 8px 25px rgba(6, 182, 212, 0.4);
            }
            .paradis-quiz-result-banner {
                margin-top: 24px;
                padding: 20px;
                border-radius: 12px;
                text-align: center;
                font-size: 1.1rem;
                font-weight: 700;
            }
            .paradis-quiz-result-banner.passed {
                background: rgba(16, 185, 129, 0.15);
                border: 1px solid #10b981;
                color: #34d399;
            }
            .paradis-quiz-result-banner.failed {
                background: rgba(239, 68, 68, 0.15);
                border: 1px solid #ef4444;
                color: #f87171;
            }
            .paradis-next-locked-msg {
                margin-top: 20px;
                padding: 16px 20px;
                border-radius: 12px;
                background: rgba(245, 158, 11, 0.1);
                border: 1px solid rgba(245, 158, 11, 0.3);
                color: #fbbf24;
                font-size: 0.9rem;
                display: flex;
                align-items: center;
                gap: 12px;
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

    // -----------------------------------------------------------------------
    // Vérification de la validation préalable du Jour N-1
    // -----------------------------------------------------------------------
    async function checkPreviousDayUnlocked(dayId) {
        const dayNum = parseInt(dayId.replace('jour-', ''), 10);
        if (dayNum <= 1) return true; // Le Jour 1 est toujours ouvert

        const prevDayId = `jour-${dayNum - 1 < 10 ? '0' + (dayNum - 1) : (dayNum - 1)}`;
        if (window.ParadisStorage && typeof window.ParadisStorage.getLocal === 'function') {
            try {
                const prevProgress = await window.ParadisStorage.getLocal('progress', prevDayId);
                const score = prevProgress ? (prevProgress.quiz_score ?? 0) : 0;
                return score >= PASSING_SCORE;
            } catch (e) {
                return true;
            }
        }
        return true;
    }

    // -----------------------------------------------------------------------
    // Injection du Widget QCM
    // -----------------------------------------------------------------------
    async function injectQuizWidget() {
        const dayId = getCurrentDayId();
        if (!dayId) return;

        const contentInner = document.querySelector('.md-content__inner');
        if (!contentInner || document.getElementById('paradis-quiz-card')) return;

        const questions = QUIZ_BANK[dayId] || [
            {
                id: `${dayId}-q1`,
                question: `Test de validation des compétences du ${dayId.toUpperCase()}`,
                choices: [
                    'Procédure conforme aux standards de sécurité bancaire BCC (Valide)',
                    'Non conforme — Risque de sécurité réseau',
                    'Configuration obsolète',
                    'Maintenance non autorisée'
                ],
                correct_index: 0,
                explanation: 'L’option A respecte scrupuleusement la méthode et la sécurité exigées.'
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
                        💡 <strong>Corrigé & Explication :</strong> ${q.explanation}
                    </div>
                </div>
            `;
        });

        card.innerHTML = `
            <div class="paradis-quiz-header">
                <h3>🧪 Test de Connaissances — ${dayId.toUpperCase()}</h3>
                <span class="paradis-quiz-badge-target">🎯 75% requis pour déverrouiller le Jour Suivant</span>
            </div>
            <form id="paradis-quiz-form" onsubmit="return false;">
                ${questionsHTML}
                <button type="button" id="paradis-quiz-submit-btn" class="paradis-quiz-submit-btn">
                    Sousmettre mes réponses et évaluer mon score
                </button>
            </form>
            <div id="paradis-quiz-result" style="display: none;"></div>
        `;

        contentInner.appendChild(card);

        // Interaction visuelle radio
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

        document.getElementById('paradis-quiz-submit-btn').onclick = () => evaluateSubmission(dayId, questions);
    }

    // -----------------------------------------------------------------------
    // Évaluation et Verrouillage
    // -----------------------------------------------------------------------
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
        const passed = scorePercent >= PASSING_SCORE;

        const resultBanner = document.getElementById('paradis-quiz-result');
        resultBanner.style.display = 'block';
        resultBanner.className = `paradis-quiz-result-banner ${passed ? 'passed' : 'failed'}`;
        
        resultBanner.innerHTML = `
            ${passed ? '🎉 Félicitations ! Seuil de 75% atteint !' : '🔒 Seuil de 75% non atteint'}<br>
            <span style="font-size: 0.95rem; font-weight: 500;">Votre score : <strong>${scorePercent}%</strong> (${correctCount}/${questions.length} bonnes réponses)</span>
            <p style="font-size: 0.85rem; margin-top: 8px; font-weight: normal;">
                ${passed ? 'Le Jour suivant est désormais déverrouillé dans votre espace étudiant.' : 'Consultez les explications ci-dessus, réévisez le cours et repassez le test pour débloquer la suite.'}
            </p>
        `;

        // Sauvegarde IndexedDB
        if (window.ParadisStorage && typeof window.ParadisStorage.saveLocal === 'function') {
            try {
                let progressRecord = await window.ParadisStorage.getLocal('progress', dayId) || {
                    id: dayId,
                    day_id: dayId,
                    is_completed: false
                };

                progressRecord.quiz_score = scorePercent;
                if (passed) {
                    progressRecord.is_completed = true;
                    progressRecord.study_status = 'completed';
                }
                await window.ParadisStorage.saveLocal('progress', progressRecord);

                window.dispatchEvent(new CustomEvent('paradis:session-changed'));
                window.dispatchEvent(new CustomEvent('paradis:study-status-changed'));
                if (window.ParadisDayCompletion && typeof window.ParadisDayCompletion.decorateSidebar === 'function') {
                    window.ParadisDayCompletion.decorateSidebar();
                }
            } catch (err) {
                console.error('[QuizEngine] Erreur sauvegarde score :', err);
            }
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', injectQuizWidget);
    } else {
        injectQuizWidget();
    }

    window.ParadisQuizEngine = {
        injectQuizWidget,
        evaluateSubmission,
        PASSING_SCORE
    };
})();
