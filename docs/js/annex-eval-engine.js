/**
 * PARADIS — Espace Évaluation des Annexes Engine
 *
 * Moteur interactif dédié à l'évaluation, la compréhension et la mémorisation des Annexes :
 *   - Mode Flashcards 3D interactives (Auto-évaluation Maîtrisé / À revoir)
 *   - Mode QCM Évaluation par Domaine avec seuil de 75% et explications corrigées
 *   - Mode Sprint Mémorisation Chronométré (60 secondes)
 *   - Persistance locale dans IndexedDB (ParadisStorage)
 */

(function () {
    'use strict';

    // -----------------------------------------------------------------------
    // Banque de données spécialisée pour les Annexes
    // -----------------------------------------------------------------------
    const ANNEX_DATA = {
        grc: {
            title: "🏛️ GRC, ISO 27001 & Architecture Zero-Trust",
            flashcards: [
                { term: "ISO 27001", def: "Norme internationale définissant les exigences pour le Système de Management de la Sécurité de l'Information (SMSI)." },
                { term: "Zero-Trust (NIST SP 800-207)", def: "Principe de sécurité 'Ne jamais faire confiance, toujours vérifier' appliqué à chaque requête." },
                { term: "PCA / PRA", def: "Plan de Continuité d'Activité (maintien du service) / Plan de Reprise d'Activité (reconstruction du SI après sinistre)." },
                { term: "ITIL v4", def: "Référentiel des meilleures pratiques de gestion des services IT et gouvernance d'entreprise." },
                { term: "EBIOS RM / NIST CSF", def: "Méthodes d'analyse de risques et cadres de cybersécurité pour les infrastructures critiques." },
                { term: "GDPR / RGPD & Compliance", def: "Cadre réglementaire de protection des données personnelles et d'audit de conformité." }
            ],
            questions: [
                {
                    id: "annex-grc-1",
                    question: "Quel principe fondamental définit l'architecture Zero-Trust (NIST SP 800-207) ?",
                    choices: [
                        "Faire confiance au réseau interne et bloquer uniquement l'extérieur",
                        "Ne jamais faire confiance, toujours vérifier explicitement chaque accès et chaque identité",
                        "Chiffrer uniquement les sauvegardes mensuelles",
                        "Utiliser un seul mot de passe pour tous les serveurs"
                    ],
                    correct_index: 1,
                    explanation: "Le Zero-Trust impose l'authentification et l'autorisation systématiques à chaque flux, sans supposer la sécurité du réseau local."
                },
                {
                    id: "annex-grc-2",
                    question: "Quelle est la différence fondamentale entre le PCA et le PRA ?",
                    choices: [
                        "Le PCA s'occupe du réseau et le PRA s'occupe des ordinateurs",
                        "Le PCA vise le maintien continu de l'activité en crise, tandis que le PRA planifie la reconstruction complète du SI après un sinistre",
                        "Le PCA est réservé au cloud et le PRA à l'on-premise",
                        "Il n'y a aucune différence, ce sont des synonymes"
                    ],
                    correct_index: 1,
                    explanation: "Le PCA évite l'interruption de service pendant la crise, le PRA remet en état l'infrastructure après l'interruption."
                },
                {
                    id: "annex-grc-3",
                    question: "Quelle norme internationale définit les exigences du SMSI (Système de Management de la Sécurité de l'Information) ?",
                    choices: ["ISO 9001", "ISO 27001", "ITIL v4", "PCI-DSS 4.0"],
                    correct_index: 1,
                    explanation: "La norme ISO 27001 est la référence mondiale de gouvernance et de management de la sécurité de l'information."
                }
            ]
        },

        linux: {
            title: "🐧 Linux & Shell Bash",
            flashcards: [
                { term: "chmod 755 script.sh", def: "rwxr-xr-x : Propriétaire (Lecture/Écriture/Exécution), Groupe et Autres (Lecture/Exécution)." },
                { term: "chmod 600 key.pem", def: "rw------- : Lecture et écriture strictement réservées au seul propriétaire." },
                { term: "systemctl enable --now service", def: "Active le démarrage automatique au boot ET démarre immédiatement le service." },
                { term: "tail -f /var/log/syslog", def: "Affiche et suit les nouvelles lignes de log en temps réel (live monitoring)." },
                { term: "ps aux | grep nginx", def: "Affiche la liste de tous les processus actifs et filtre ceux contenant 'nginx'." },
                { term: "mkdir -p a/b/c", def: "Crée toute l'arborescence de dossiers parents sans générer d'erreur." }
            ],
            questions: [
                {
                    id: "annex-lin-1",
                    question: "Que signifient les permissions numériques 600 sur un fichier Linux ?",
                    choices: [
                        "Tout le monde peut tout faire",
                        "Lecture et écriture par le propriétaire uniquement, aucun droit pour le groupe ni les autres",
                        "Fichier exécutable par les administrateurs seulement",
                        "Fichier caché en lecture seule"
                    ],
                    correct_index: 1,
                    explanation: "6 (4+2 = read+write) pour le propriétaire, 0 (aucun accès) pour le groupe et 0 pour les autres."
                },
                {
                    id: "annex-lin-2",
                    question: "Quelle commande permet de suivre en temps réel un fichier de journalisation (log) ?",
                    choices: ["cat -r log.txt", "head -100 log.txt", "tail -f /var/log/syslog", "grep -live log.txt"],
                    correct_index: 2,
                    explanation: "L'option -f (follow) de tail permet de garder le fichier ouvert et d'afficher les nouvelles lignes au fur et à mesure."
                },
                {
                    id: "annex-lin-3",
                    question: "Quelle est l'utilité du flag -p avec la commande mkdir (ex: mkdir -p dossier/sous_dossier) ?",
                    choices: [
                        "Protéger le dossier avec un mot de passe",
                        "Créer automatiquement tous les dossiers parents nécessaires sans erreur",
                        "Purger le dossier s'il existe déjà",
                        "Attribuer les permissions Administrateur au dossier"
                    ],
                    correct_index: 1,
                    explanation: "mkdir -p (parents) crée toute la hiérarchie de répertoires intermédiaires si elle n'existe pas."
                }
            ]
        },

        dev: {
            title: "🐍 Python & SQL",
            flashcards: [
                { term: "Dictionnaire Python", def: "Structure de données associative sous forme de paires clé-valeur { 'cle': 'valeur' }." },
                { term: "Try ... Except ... Finally", def: "Structure d'interception d'erreurs en Python pour éviter le plantage d'un programme." },
                { term: "INNER JOIN (SQL)", def: "Jointure qui ne retourne que les lignes ayant une correspondance dans les deux tables croisées." },
                { term: "EXPLAIN ANALYZE (SQL)", def: "Commande PostgreSQL qui exécute la requête et affiche son plan et son temps d'exécution exact." },
                { term: "Index B-Tree (SQL)", def: "Structure d'arbre équilibré qui accélère considérablement la recherche de données dans une table." }
            ],
            questions: [
                {
                    id: "annex-dev-1",
                    question: "Quelle clause SQL permet de ne retourner que les résultats ayant une correspondance dans DEUX tables reliées ?",
                    choices: ["LEFT JOIN", "RIGHT JOIN", "INNER JOIN", "CROSS JOIN"],
                    correct_index: 2,
                    explanation: "INNER JOIN filtre rigoureusement les enregistrements qui existent simultanément dans les deux tables jointes."
                },
                {
                    id: "annex-dev-2",
                    question: "En Python, que fait l'instruction 'finally' dans un bloc try...except...finally ?",
                    choices: [
                        "S'exécute uniquement s'il n'y a eu aucune erreur",
                        "S'exécute TOUJOURS, qu'une erreur soit survenue ou non",
                        "Annule l'exécution du programme",
                        "Redémarre la boucle for"
                    ],
                    correct_index: 1,
                    explanation: "Le bloc finally est toujours exécuté, idéal pour fermer les fichiers ou les connexions à la base de données."
                }
            ]
        },

        network: {
            title: "🌐 Réseaux & Ports TCP/IP",
            flashcards: [
                { term: "Port 22", def: "SSH / SFTP — Administration à distance chiffrée." },
                { term: "Port 53", def: "DNS — Résolution des noms de domaine en adresses IP." },
                { term: "Port 80 / 443", def: "HTTP (Web clair) / HTTPS (Web chiffré SSL/TLS)." },
                { term: "Port 5432", def: "PostgreSQL — Connexion au serveur de base de données." },
                { term: "Masque /24 (CIDR)", def: "255.255.255.0 — Offre 254 adresses d'hôtes utilisables dans le sous-réseau." },
                { term: "OWASP Top 10", def: "Classement des 10 failles de sécurité web les plus répandues et critiques." }
            ],
            questions: [
                {
                    id: "annex-net-1",
                    question: "Quel est le port réseau standard par défaut pour les connexions sécurisées SSH ?",
                    choices: ["Port 80", "Port 22", "Port 443", "Port 5432"],
                    correct_index: 1,
                    explanation: "SSH écoute par défaut sur le port TCP 22."
                },
                {
                    id: "annex-net-2",
                    question: "Quel service réseau associe le port UDP/TCP 53 ?",
                    choices: ["DHCP", "DNS", "HTTPS", "FTP"],
                    correct_index: 1,
                    explanation: "Le service d'annuaire des noms de domaine (DNS) utilise le port 53."
                }
            ]
        },

        git: {
            title: "🔄 Git & DevOps",
            flashcards: [
                { term: "git checkout -b feature", def: "Crée la branche 'feature' et bascule immédiatement dessus." },
                { term: "git pull --rebase", def: "Récupère les commits distants et réaligne proprement les commits locaux par-dessus." },
                { term: "Docker Container", def: "Instance isolée et légère qui exécute une application et ses dépendances sans OS complet." },
                { term: "Docker Compose", def: "Outil d'orchestration pour définir et démarrer des applications multi-conteneurs via un fichier YAML." }
            ],
            questions: [
                {
                    id: "annex-git-1",
                    question: "Quelle commande Git combine la création d'une nouvelle branche et le basculement direct sur celle-ci ?",
                    choices: ["git branch new", "git checkout -b new_branch", "git commit -b new", "git merge --new"],
                    correct_index: 1,
                    explanation: "git checkout -b nom_branche crée et active la branche."
                }
            ]
        }
    };

    // -----------------------------------------------------------------------
    // Variables d'état
    // -----------------------------------------------------------------------
    let activeDomain = 'all';
    let userState = {
        completedDomains: {},
        flashcardsMastered: {},
        sprintHighScore: 0
    };

    function init() {
        const app = document.getElementById('annex-eval-app');
        if (!app) return;

        injectStyles();
        loadState();
        bindEvents();
        updateDashboardUI();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        setTimeout(init, 100);
    }

    window.addEventListener('popstate', () => setTimeout(init, 100));
    window.addEventListener('hashchange', () => setTimeout(init, 100));

    setInterval(() => {
        const app = document.getElementById('annex-eval-app');
        if (app && !app.dataset.initialized) {
            app.dataset.initialized = 'true';
            init();
        }
    }, 400);

    // -----------------------------------------------------------------------
    // Injection des Styles CSS Dynamiques
    // -----------------------------------------------------------------------
    function injectStyles() {
        if (document.getElementById('annex-eval-styles')) return;

        const style = document.createElement('style');
        style.id = 'annex-eval-styles';
        style.textContent = `
            .annex-eval-hero {
                background: linear-gradient(135deg, rgba(30, 58, 138, 0.2), rgba(30, 41, 59, 0.8));
                border: 1px solid rgba(56, 189, 248, 0.2);
                border-radius: 16px;
                padding: 24px;
                margin-bottom: 24px;
                backdrop-filter: blur(8px);
            }
            .annex-badge-container {
                display: flex;
                gap: 10px;
                align-items: center;
                margin-bottom: 12px;
            }
            .annex-badge {
                background: #1e3a8a;
                color: #fff;
                padding: 4px 12px;
                border-radius: 20px;
                font-size: 0.8rem;
                font-weight: 700;
            }
            .annex-status-pill {
                background: rgba(5, 150, 105, 0.15);
                color: #34d399;
                border: 1px solid #059669;
                padding: 4px 12px;
                border-radius: 20px;
                font-size: 0.8rem;
                font-weight: 600;
            }
            .annex-stats-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
                gap: 16px;
                margin-top: 20px;
            }
            .annex-stat-item {
                background: rgba(15, 23, 42, 0.6);
                border: 1px solid rgba(255, 255, 255, 0.08);
                border-radius: 12px;
                padding: 16px;
                text-align: center;
            }
            .annex-stat-val {
                font-size: 1.6rem;
                font-weight: 800;
                color: #38bdf8;
            }
            .annex-stat-lbl {
                font-size: 0.8rem;
                color: #94a3b8;
                margin-top: 4px;
            }
            .annex-section-title {
                margin: 28px 0 14px 0;
            }
            .annex-domain-selector {
                display: flex;
                flex-wrap: wrap;
                gap: 10px;
                margin-bottom: 24px;
            }
            .annex-domain-btn {
                background: rgba(30, 41, 59, 0.8);
                color: #cbd5e1;
                border: 1px solid rgba(255, 255, 255, 0.1);
                padding: 10px 18px;
                border-radius: 10px;
                cursor: pointer;
                font-weight: 600;
                transition: all 0.2s ease;
            }
            .annex-domain-btn:hover {
                background: rgba(11, 95, 255, 0.2);
                color: #fff;
                border-color: #0B5FFF;
            }
            .annex-domain-btn.active {
                background: #0B5FFF;
                color: #fff;
                border-color: #0B5FFF;
                box-shadow: 0 4px 14px rgba(11, 95, 255, 0.4);
            }
            .annex-modes-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
                gap: 20px;
                margin-bottom: 30px;
            }
            .annex-mode-card {
                background: rgba(30, 41, 59, 0.7);
                border: 1px solid rgba(255, 255, 255, 0.08);
                border-radius: 16px;
                padding: 24px;
                display: flex;
                flex-direction: column;
                justify-content: space-between;
                transition: all 0.3s ease;
            }
            .annex-mode-card:hover {
                transform: translateY(-4px);
                border-color: #38bdf8;
                box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.4);
            }
            .annex-mode-card.highlighted {
                border-color: #0B5FFF;
                background: linear-gradient(180deg, rgba(11, 95, 255, 0.15), rgba(30, 41, 59, 0.8));
            }
            .mode-icon {
                font-size: 2.2rem;
                margin-bottom: 12px;
            }
            .mode-start-btn {
                background: rgba(255, 255, 255, 0.1);
                color: #fff;
                border: 1px solid rgba(255, 255, 255, 0.2);
                padding: 12px;
                border-radius: 10px;
                cursor: pointer;
                font-weight: 700;
                margin-top: 16px;
                width: 100%;
                transition: all 0.2s ease;
            }
            .mode-start-btn:hover {
                background: #38bdf8;
                color: #0f172a;
                border-color: #38bdf8;
            }
            .mode-start-btn.primary {
                background: #0B5FFF;
                border-color: #0B5FFF;
            }
            .mode-start-btn.primary:hover {
                background: #2563eb;
                box-shadow: 0 4px 14px rgba(11, 95, 255, 0.5);
            }
            .annex-workspace-container {
                background: rgba(15, 23, 42, 0.95);
                border: 1px solid rgba(56, 189, 248, 0.3);
                border-radius: 16px;
                padding: 24px;
                margin-top: 24px;
                animation: fadeIn 0.3s ease;
            }
            .annex-workspace-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                border-bottom: 1fr solid rgba(255, 255, 255, 0.1);
                padding-bottom: 16px;
                margin-bottom: 20px;
            }
            .btn-close-ws {
                background: rgba(239, 68, 68, 0.2);
                color: #f87171;
                border: 1px solid #ef4444;
                padding: 6px 14px;
                border-radius: 8px;
                cursor: pointer;
                font-weight: 600;
            }
            .btn-close-ws:hover {
                background: #ef4444;
                color: #fff;
            }
            /* Flashcard UI 3D */
            .fc-scene {
                width: 100%;
                max-width: 520px;
                height: 280px;
                perspective: 1000px;
                margin: 20px auto;
                cursor: pointer;
            }
            .fc-card {
                width: 100%; height: 100%;
                position: relative;
                transform-style: preserve-3d;
                transition: transform 0.6s cubic-bezier(0.4, 0.2, 0.2, 1);
            }
            .fc-card.flipped {
                transform: rotateY(180deg);
            }
            .fc-face {
                position: absolute;
                width: 100%; height: 100%;
                backface-visibility: hidden;
                border-radius: 16px;
                padding: 24px;
                display: flex;
                flex-direction: column;
                justify-content: space-between;
                background: linear-gradient(135deg, #1e293b, #0f172a);
                border: 2px solid #0B5FFF;
                box-sizing: border-box;
            }
            .fc-back {
                transform: rotateY(180deg);
                border-color: #2EC4B6;
                background: linear-gradient(135deg, #0f172a, #1e293b);
            }
            .fc-controls {
                display: flex;
                justify-content: center;
                gap: 16px;
                margin-top: 20px;
            }
            .fc-btn {
                padding: 10px 20px;
                border-radius: 8px;
                border: none;
                font-weight: 700;
                cursor: pointer;
            }
            .fc-btn-known { background: #10b981; color: #fff; }
            .fc-btn-retry { background: #f59e0b; color: #fff; }

            /* QCM UI */
            .annex-qcm-item {
                background: rgba(30, 41, 59, 0.6);
                border: 1px solid rgba(255, 255, 255, 0.08);
                border-radius: 12px;
                padding: 20px;
                margin-bottom: 20px;
            }
            .annex-qcm-opt {
                display: block;
                background: rgba(15, 23, 42, 0.8);
                border: 1px solid rgba(255, 255, 255, 0.1);
                padding: 12px 16px;
                border-radius: 8px;
                margin: 8px 0;
                cursor: pointer;
                transition: all 0.2s ease;
            }
            .annex-qcm-opt:hover {
                border-color: #38bdf8;
                background: rgba(56, 189, 248, 0.1);
            }
            .annex-qcm-opt.selected {
                border-color: #0B5FFF;
                background: rgba(11, 95, 255, 0.2);
            }
            @keyframes fadeIn {
                from { opacity: 0; transform: translateY(10px); }
                to { opacity: 1; transform: translateY(0); }
            }
        `;
        document.head.appendChild(style);
    }

    // -----------------------------------------------------------------------
    // Gestion de l'État (Storage local)
    // -----------------------------------------------------------------------
    function loadState() {
        try {
            const raw = localStorage.getItem('paradis_annex_eval');
            if (raw) userState = JSON.parse(raw);
        } catch (e) {
            console.warn('Storage read error:', e);
        }
    }

    function saveState() {
        try {
            localStorage.setItem('paradis_annex_eval', JSON.stringify(userState));
            if (window.ParadisStorage) {
                window.ParadisStorage.set('annex_eval_data', userState);
            }
        } catch (e) {
            console.warn('Storage write error:', e);
        }
    }

    // -----------------------------------------------------------------------
    // Événements UI
    // -----------------------------------------------------------------------
    function bindEvents() {
        // Selector de domaine
        document.querySelectorAll('.annex-domain-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.annex-domain-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                activeDomain = btn.dataset.domain;
            });
        });

        // Boutons de modes
        document.getElementById('mode-btn-flashcard').addEventListener('click', startFlashcardMode);
        document.getElementById('mode-btn-qcm').addEventListener('click', startQcmMode);
        document.getElementById('mode-btn-sprint').addEventListener('click', startSprintMode);

        document.getElementById('btn-close-workspace').addEventListener('click', closeWorkspace);
    }

    function updateDashboardUI() {
        const completedCount = Object.keys(userState.completedDomains || {}).length;
        const flashcardCount = Object.keys(userState.flashcardsMastered || {}).length;
        const sprintScore = userState.sprintHighScore || 0;

        const statComp = document.getElementById('annex-stat-completed');
        const statFc = document.getElementById('annex-stat-flashcards');
        const statSp = document.getElementById('annex-stat-sprint');
        const pill = document.getElementById('annex-mastery-pill');

        if (statComp) statComp.textContent = `${completedCount} / 5`;
        if (statFc) statFc.textContent = flashcardCount;
        if (statSp) statSp.textContent = `${sprintScore} pts`;

        const pct = Math.round((completedCount / 5) * 100);
        if (pill) pill.textContent = `Maîtrise Globale : ${pct}%`;
    }

    function openWorkspace(title) {
        const ws = document.getElementById('annex-workspace');
        const titleEl = document.getElementById('workspace-title');
        if (titleEl) titleEl.textContent = title;
        if (ws) ws.style.display = 'block';
        ws.scrollIntoView({ behavior: 'smooth' });
    }

    function closeWorkspace() {
        const ws = document.getElementById('annex-workspace');
        if (ws) ws.style.display = 'none';
        updateDashboardUI();
    }

    // -----------------------------------------------------------------------
    // MODE 1 : FLASHCARDS 3D
    // -----------------------------------------------------------------------
    function getCardsForActiveDomain() {
        let cards = [];
        if (activeDomain === 'all') {
            Object.keys(ANNEX_DATA).forEach(key => {
                cards = cards.concat(ANNEX_DATA[key].flashcards);
            });
        } else if (ANNEX_DATA[activeDomain]) {
            cards = ANNEX_DATA[activeDomain].flashcards;
        }
        return cards;
    }

    function startFlashcardMode() {
        const cards = getCardsForActiveDomain();
        if (!cards.length) return alert("Aucune carte disponible pour ce domaine.");

        openWorkspace("🎴 Flashcards (Cartes Mémoire 3D)");
        let currentIndex = 0;

        function renderCard() {
            const card = cards[currentIndex];
            const isKnown = !!userState.flashcardsMastered[card.term];

            const body = document.getElementById('workspace-content');
            body.innerHTML = `
                <div style="text-align: center;">
                    <span style="color: #94a3b8;">Carte ${currentIndex + 1} sur ${cards.length} ${isKnown ? '✅ (Maîtrisée)' : ''}</span>
                    <div class="fc-scene" id="fc-scene-el">
                        <div class="fc-card" id="fc-card-el">
                            <div class="fc-face fc-front">
                                <span style="font-size: 0.8rem; color: #38bdf8;">QUESTION / TERME</span>
                                <h3 style="font-size: 1.6rem; color: #fff;">${card.term}</h3>
                                <small style="color: #94a3b8;">👆 Cliquez pour retourner</small>
                            </div>
                            <div class="fc-face fc-back">
                                <span style="font-size: 0.8rem; color: #2EC4B6;">RÉPONSE / DÉFINITION</span>
                                <p style="font-size: 1.1rem; color: #f3f4f6; line-height: 1.5;">${card.def}</p>
                                <small style="color: #94a3b8;">👆 Cliquez pour retourner</small>
                            </div>
                        </div>
                    </div>
                    <div class="fc-controls">
                        <button class="fc-btn fc-btn-retry" id="btn-fc-retry">⚠️ À revoir</button>
                        <button class="fc-btn fc-btn-known" id="btn-fc-known">✅ Maîtrisé !</button>
                    </div>
                </div>
            `;

            const cardEl = document.getElementById('fc-card-el');
            document.getElementById('fc-scene-el').addEventListener('click', () => {
                cardEl.classList.toggle('flipped');
            });

            document.getElementById('btn-fc-known').addEventListener('click', () => {
                userState.flashcardsMastered[card.term] = true;
                saveState();
                nextCard();
            });

            document.getElementById('btn-fc-retry').addEventListener('click', () => {
                delete userState.flashcardsMastered[card.term];
                saveState();
                nextCard();
            });
        }

        function nextCard() {
            currentIndex = (currentIndex + 1) % cards.length;
            renderCard();
        }

        renderCard();
    }

    // -----------------------------------------------------------------------
    // MODE 2 : QCM & ÉVALUATION DES ANNEXES (75% Threshold)
    // -----------------------------------------------------------------------
    function getQuestionsForActiveDomain() {
        let questions = [];
        if (activeDomain === 'all') {
            Object.keys(ANNEX_DATA).forEach(key => {
                questions = questions.concat(ANNEX_DATA[key].questions);
            });
        } else if (ANNEX_DATA[activeDomain]) {
            questions = ANNEX_DATA[activeDomain].questions;
        }
        return questions;
    }

    function startQcmMode() {
        const questions = getQuestionsForActiveDomain();
        if (!questions.length) return alert("Aucune question QCM disponible pour ce domaine.");

        openWorkspace("📝 QCM Évaluation des Annexes (Seuil 75% Exigé)");
        const userAnswers = {};

        const body = document.getElementById('workspace-content');

        let html = `<p style="color: #cbd5e1; margin-bottom: 20px;">Répondez à toutes les questions ci-dessous. Un score minimal de <strong>75%</strong> est requis pour valider ce domaine d'annexes.</p>`;

        questions.forEach((q, qIndex) => {
            html += `
                <div class="annex-qcm-item" id="q-box-${q.id}">
                    <h4 style="color: #38bdf8; margin-bottom: 12px;">Question ${qIndex + 1} : ${q.question}</h4>
                    <div class="annex-qcm-options">
            `;

            q.choices.forEach((choice, cIndex) => {
                html += `
                    <label class="annex-qcm-opt" data-qid="${q.id}" data-opt="${cIndex}">
                        <input type="radio" name="q_${q.id}" value="${cIndex}" style="margin-right: 10px;">
                        ${choice}
                    </label>
                `;
            });

            html += `
                    </div>
                    <div class="q-explanation" id="exp-${q.id}" style="display: none; margin-top: 12px; padding: 12px; border-radius: 8px;"></div>
                </div>
            `;
        });

        html += `
            <div style="text-align: center; margin-top: 24px;">
                <button class="mode-start-btn primary" id="btn-submit-annex-qcm" style="max-width: 300px;">Valider et Calculer la Note</button>
            </div>
            <div id="qcm-result-banner" style="display: none; margin-top: 24px; padding: 20px; border-radius: 12px; text-align: center;"></div>
        `;

        body.innerHTML = html;

        // Événements de sélection
        document.querySelectorAll('.annex-qcm-opt').forEach(opt => {
            opt.addEventListener('click', () => {
                const qid = opt.dataset.qid;
                const val = parseInt(opt.dataset.opt, 10);
                userAnswers[qid] = val;

                document.querySelectorAll(`[data-qid="${qid}"]`).forEach(o => o.classList.remove('selected'));
                opt.classList.add('selected');
            });
        });

        // Soumission
        document.getElementById('btn-submit-annex-qcm').addEventListener('click', () => {
            let correctCount = 0;

            questions.forEach(q => {
                const userVal = userAnswers[q.id];
                const expBox = document.getElementById(`exp-${q.id}`);

                if (userVal === q.correct_index) {
                    correctCount++;
                    if (expBox) {
                        expBox.style.display = 'block';
                        expBox.style.background = 'rgba(16, 185, 129, 0.15)';
                        expBox.style.border = '1px solid #10b981';
                        expBox.style.color = '#34d399';
                        expBox.innerHTML = `<strong>✅ Correct !</strong> ${q.explanation}`;
                    }
                } else {
                    if (expBox) {
                        expBox.style.display = 'block';
                        expBox.style.background = 'rgba(239, 68, 68, 0.15)';
                        expBox.style.border = '1px solid #ef4444';
                        expBox.style.color = '#f87171';
                        expBox.innerHTML = `<strong>❌ Réponse incorrecte.</strong> Bonne réponse : <em>${q.choices[q.correct_index]}</em>.<br><small>${q.explanation}</small>`;
                    }
                }
            });

            const scorePct = Math.round((correctCount / questions.length) * 100);
            const banner = document.getElementById('qcm-result-banner');

            banner.style.display = 'block';
            if (scorePct >= 75) {
                banner.style.background = 'rgba(16, 185, 129, 0.2)';
                banner.style.border = '2px solid #10b981';
                banner.style.color = '#34d399';
                banner.innerHTML = `
                    <h3 style="margin: 0 0 8px 0;">🎉 FÉLICITATIONS ! Note : ${scorePct}%</h3>
                    <p style="margin: 0;">Seuil de 75% atteint ! Le domaine <strong>${activeDomain.toUpperCase()}</strong> est validé avec succès.</p>
                `;
                userState.completedDomains[activeDomain] = scorePct;
                saveState();
            } else {
                banner.style.background = 'rgba(239, 68, 68, 0.2)';
                banner.style.border = '2px solid #ef4444';
                banner.style.color = '#f87171';
                banner.innerHTML = `
                    <h3 style="margin: 0 0 8px 0;">⚠️ Score Insuffisant : ${scorePct}% (Seuil : 75%)</h3>
                    <p style="margin: 0;">Révisez les explications ci-dessus et retentez le test pour valider ce domaine d'annexes.</p>
                `;
            }
        });
    }

    // -----------------------------------------------------------------------
    // MODE 3 : SPRINT CHRONO 60s
    // -----------------------------------------------------------------------
    function startSprintMode() {
        const cards = getCardsForActiveDomain();
        if (!cards.length) return alert("Pas de données pour le sprint.");

        openWorkspace("⚡ Sprint Mémorisation Chrono (60 Secondes)");
        let score = 0;
        let timeLeft = 60;
        let timer = null;

        const body = document.getElementById('workspace-content');
        body.innerHTML = `
            <div style="text-align: center;">
                <div style="font-size: 2rem; font-weight: 800; color: #f59e0b;" id="sprint-timer">⏱️ 60s</div>
                <div style="font-size: 1.2rem; color: #38bdf8; margin: 10px 0;" id="sprint-score">Score : 0 pts</div>
                <div class="annex-qcm-item" style="max-width: 500px; margin: 20px auto; text-align: left;" id="sprint-card-box">
                    <!-- Injected -->
                </div>
            </div>
        `;

        function nextSprintItem() {
            if (timeLeft <= 0) return;
            const item = cards[Math.floor(Math.random() * cards.length)];
            const box = document.getElementById('sprint-card-box');

            box.innerHTML = `
                <h4 style="color: #fff;">Que signifie ou à quoi correspond :</h4>
                <div style="font-size: 1.4rem; color: #38bdf8; font-weight: 700; margin: 12px 0;">${item.term}</div>
                <p style="color: #94a3b8;">Définition : ${item.def}</p>
                <div style="display: flex; gap: 10px; margin-top: 16px;">
                    <button class="fc-btn fc-btn-known" style="flex:1;" id="btn-sprint-yes">✅ Je le savais (+10 pts)</button>
                    <button class="fc-btn fc-btn-retry" style="flex:1;" id="btn-sprint-no">❌ Oublié</button>
                </div>
            `;

            document.getElementById('btn-sprint-yes').onclick = () => {
                score += 10;
                document.getElementById('sprint-score').textContent = `Score : ${score} pts`;
                nextSprintItem();
            };

            document.getElementById('btn-sprint-no').onclick = () => {
                nextSprintItem();
            };
        }

        timer = setInterval(() => {
            timeLeft--;
            const timerEl = document.getElementById('sprint-timer');
            if (timerEl) timerEl.textContent = `⏱️ ${timeLeft}s`;

            if (timeLeft <= 0) {
                clearInterval(timer);
                if (score > (userState.sprintHighScore || 0)) {
                    userState.sprintHighScore = score;
                    saveState();
                }

                const box = document.getElementById('sprint-card-box');
                if (box) {
                    box.innerHTML = `
                        <h3 style="color: #34d399;">⏱️ Temps écoulé !</h3>
                        <p style="font-size: 1.3rem;">Score final : <strong>${score} points</strong></p>
                        <p>Meilleur score personnel : <strong>${userState.sprintHighScore} points</strong></p>
                    `;
                }
            }
        }, 1000);

        nextSprintItem();
    }

})();
