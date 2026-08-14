/**
 * PARADIS — Moteur de Session d'Étude (Espace Étudiant)
 *
 * Gère le cycle de vie complet d'une session d'étude pour chaque leçon :
 *   not_started → in_progress → paused → in_progress → completed
 *
 * Fonctionnalités :
 *   - Démarrer / Mettre en pause / Reprendre / Terminer une leçon
 *   - Chronomètre en direct avec persistance du temps accumulé
 *   - Sauvegarde dans IndexedDB via ParadisStorage
 *   - Émission d'événements pour synchroniser le progress widget et le dashboard
 *   - Détection automatique de la leçon courante depuis l'URL
 */
(function () {
    'use strict';

    // -----------------------------------------------------------------------
    // Constantes
    // -----------------------------------------------------------------------
    const STATUS = {
        NOT_STARTED: 'not_started',
        IN_PROGRESS:  'in_progress',
        PAUSED:       'paused',
        COMPLETED:    'completed'
    };

    // Mapping URL → métadonnées leçon
    const LESSON_META = {
        'jour-0a': { tome: 'P0', title: 'Jour J0a — Qu\'est-ce qu\'un Ordinateur ?', totalHours: 4 },
        'jour-0b': { tome: 'P0', title: 'Jour J0b — La Logique Binaire (Bits & Octets)', totalHours: 4 },
        'jour-0c': { tome: 'P0', title: 'Jour J0c — OS vs Applications', totalHours: 4 },
        'jour-0d': { tome: 'P0', title: 'Jour J0d — Réseau & Internet', totalHours: 4 },
        'jour-0e': { tome: 'P0', title: 'Jour J0e — Premiers Pas Terminal', totalHours: 4 },
        'jour-0f': { tome: 'P0', title: 'Jour J0f — Fichiers & Arborescence', totalHours: 4 },
        'jour-0g': { tome: 'P0', title: 'Jour J0g — Logique d\'un Programme', totalHours: 4 },
        'jour-0h': { tome: 'P0', title: 'Jour J0h — Métier Administrateur Système', totalHours: 4 },
        'jour-0i': { tome: 'P0', title: 'Jour J0i — Métier Expert Cybersécurité', totalHours: 4 },
        'jour-0j': { tome: 'P0', title: 'Jour J0j — Avenir Radieux de l\'IT', totalHours: 4 },
        'jour-0k': { tome: 'P0', title: 'Jour J0k — Linux & Open Source', totalHours: 4 },
        'jour-0l': { tome: 'P0', title: 'Jour J0l — Boîte à Outils Ingénieur', totalHours: 4 },
        'jour-0m': { tome: 'P0', title: 'Jour J0m — Méthodologie & Débogage', totalHours: 4 },
        'jour-0n': { tome: 'P0', title: 'Jour J0n — Présentation de la Masterclass 600 Jours', totalHours: 4 },
        'jour-0o': { tome: 'P0', title: 'Jour J0o — Grand Examen Massif d\'Entrée', totalHours: 6 },
        'jour-0p': { tome: 'P0', title: 'Jour J0p — Format S1 & Anatomie Journée', totalHours: 4 },
        'jour-0q': { tome: 'P0', title: 'Jour J0q — Anatomie Système Linux Moderne', totalHours: 4 },
        'jour-0r': { tome: 'P0', title: 'Jour J0r — Le Terminal comme Outil Pro', totalHours: 4 },
        'jour-0s': { tome: 'P0', title: 'Jour J0s — Installation & Lab Environment', totalHours: 4 },
        'jour-0t': { tome: 'P0', title: 'Jour J0t — Sécurité & Hygiène Numérique', totalHours: 4 },
        'jour-0u': { tome: 'P0', title: 'Jour J0u — Méthodologie des 600 Jours', totalHours: 4 },
        'jour-0v': { tome: 'P0', title: 'Jour J0v — Examen Validation S0→S1', totalHours: 6 },
        'j09b':    { tome: 'P0', title: 'Jour J09b — Pont Bash → PowerShell', totalHours: 4 },
        'j100b':   { tome: 'P2', title: 'Jour J100b — Pont Réseaux → Virtualisation', totalHours: 4 },
        'j315b':   { tome: 'P7', title: 'Jour J315b — Pont Offensive Security', totalHours: 4 },
        'j540b':   { tome: 'P11', title: 'Jour J540b — Pont DevSecOps & CIS Hardening', totalHours: 4 },
        'j580b':   { tome: 'P12', title: 'Jour J580b — Pont Technique → Zero-Trust', totalHours: 4 },
        'j300-a':  { tome: 'MILESTONE', title: 'J300a — Examen Massif Bachelor BIT (50 QCM)', totalHours: 12 },
        'j300-b':  { tome: 'MILESTONE', title: 'J300b — Projet Synthétique Cloud Architecture', totalHours: 20 },
        'j300-c':  { tome: 'MILESTONE', title: 'J300c — Soutenance Oral & Jury Technique', totalHours: 8 },
        'j300-d':  { tome: 'MILESTONE', title: 'J300d — Cahier des Charges & Grille Évaluation', totalHours: 6 },
        'j600-a':  { tome: 'MILESTONE', title: 'J600a — Examen Massif Master Architect (60 QCM)', totalHours: 14 },
        'j600-b':  { tome: 'MILESTONE', title: 'J600b — Grand Capstone Synthétique Zero-Trust', totalHours: 30 },
        'j600-c':  { tome: 'MILESTONE', title: 'J600c — Soutenance Oral & Jury CISO/COMEX', totalHours: 10 },
        'j600-d':  { tome: 'MILESTONE', title: 'J600d — Portfolio d\'Ingénierie & Certificat Master', totalHours: 8 },
        'jour-01': { tome: 'P0', title: 'Jour 1 — Prise en main Linux CLI', totalHours: 6 },
        'jour-02': { tome: 'P0', title: 'Jour 2 — Tableur & Collaboration', totalHours: 14 },
        'jour-03': { tome: 'P0', title: 'Jour 3 — Mini-projet P0', totalHours: 14 },
        'jour-04': { tome: 'P2', title: 'Jour 4 — Python Fondamentaux', totalHours: 12 },
        'jour-05': { tome: 'P2', title: 'Jour 5 — Python Intermédiaire', totalHours: 12 },
        'jour-06': { tome: 'P2', title: 'Jour 6 — SQL & Données', totalHours: 12 },
        'jour-07': { tome: 'P2', title: 'Jour 7 — Réseaux TCP/IP', totalHours: 12 },
        'jour-08': { tome: 'P2', title: 'Jour 8 — Scripting Bash', totalHours: 12 },
        'jour-09': { tome: 'P2', title: 'Jour 9 — Linux Fondamentaux', totalHours: 12 },
        'jour-10': { tome: 'P2', title: 'Jour 10 — Git & Versioning', totalHours: 12 },
        'jour-11': { tome: 'P2', title: 'Jour 11 — Projet P2', totalHours: 12 },
        'jour-12': { tome: 'P3A', title: 'Jour 12 — Admin Linux', totalHours: 12 },
        'jour-13': { tome: 'P3A', title: 'Jour 13 — Admin Windows Server', totalHours: 12 },
        'jour-14': { tome: 'P3A', title: 'Jour 14 — Active Directory', totalHours: 12 },
        'jour-15': { tome: 'P3A', title: 'Jour 15 — Virtualisation', totalHours: 12 },
        'jour-16': { tome: 'P3A', title: 'Jour 16 — Monitoring', totalHours: 12 },
        'jour-17': { tome: 'P3A', title: 'Jour 17 — Projet P3A', totalHours: 12 },
        'jour-18': { tome: 'P3B', title: 'Jour 18 — PostgreSQL Fondamentaux', totalHours: 10 },
        'jour-19': { tome: 'P3B', title: 'Jour 19 — SQL Avancé', totalHours: 10 },
        'jour-20': { tome: 'P3B', title: 'Jour 20 — Data Warehouse', totalHours: 10 },
        'jour-21': { tome: 'P3B', title: 'Jour 21 — BI & Reporting', totalHours: 10 },
        'jour-22': { tome: 'P3B', title: 'Jour 22 — Projet P3B', totalHours: 10 },
        'jour-23': { tome: 'P3C', title: 'Jour 23 — HTML/CSS Modernes', totalHours: 10 },
        'jour-24': { tome: 'P3C', title: 'Jour 24 — JavaScript Fondamentaux', totalHours: 10 },
        'jour-25': { tome: 'P3C', title: 'Jour 25 — JavaScript Avancé', totalHours: 10 },
        'jour-26': { tome: 'P3C', title: 'Jour 26 — APIs REST', totalHours: 10 },
        'jour-27': { tome: 'P3C', title: 'Jour 27 — Frameworks Web', totalHours: 10 },
        'jour-28': { tome: 'P3C', title: 'Jour 28 — Projet P3C', totalHours: 10 },
        'jour-29': { tome: 'P4', title: 'Jour 29 — Cloud AWS/Azure Fondamentaux', totalHours: 10 },
        'jour-30': { tome: 'P4', title: 'Jour 30 — Conteneurisation Docker', totalHours: 10 },
        'jour-31': { tome: 'P4', title: 'Jour 31 — Sécurité Réseau', totalHours: 10 },
        'jour-32': { tome: 'P4', title: 'Jour 32 — Cryptographie & PKI', totalHours: 10 },
        'jour-33': { tome: 'P4', title: 'Jour 33 — Conformité RGPD', totalHours: 10 },
        'jour-34': { tome: 'P4', title: 'Jour 34 — Cybersécurité BCC', totalHours: 10 },
        'jour-35': { tome: 'P4', title: 'Jour 35 — Projet P4', totalHours: 10 },
        'jour-36': { tome: 'P5', title: 'Jour 36 — Révisions Intensives', totalHours: 8 },
        'jour-37': { tome: 'P5', title: 'Jour 37 — Tests Blancs QCM', totalHours: 8 },
        'jour-38': { tome: 'P5', title: 'Jour 38 — Examens Pratiques', totalHours: 8 },
        'jour-39': { tome: 'P5', title: 'Jour 39 — Corrections & Analyse', totalHours: 8 },
        'jour-40': { tome: 'P5', title: 'Jour 40 — Simulation Complète', totalHours: 8 },
        'jour-41': { tome: 'P5', title: 'Jour 41 — Préparation Orale', totalHours: 8 },
        'jour-42': { tome: 'P6', title: 'Jour 42 — Portfolio Digital', totalHours: 8 },
        'jour-43': { tome: 'P6', title: 'Jour 43 — Soutenance Technique', totalHours: 8 },
        'jour-44': { tome: 'P6', title: 'Jour 44 — Simulation Entretien', totalHours: 8 },
        'jour-45': { tome: 'P6', title: 'Jour 45 — Certification & Remise', totalHours: 8 },
    };

    // -----------------------------------------------------------------------
    // État interne
    // -----------------------------------------------------------------------
    let _currentDayId = null;
    let _timerInterval = null;
    let _sessionStartTs = null;   // timestamp de reprise actuelle
    let _accumulatedMs = 0;       // ms accumulées avant la reprise actuelle

    // -----------------------------------------------------------------------
    // Détection de la leçon courante depuis l'URL
    // -----------------------------------------------------------------------
    function detectCurrentLesson() {
        const path = window.location.pathname;
        const match = path.match(/jour-(\d{2})/i);
        if (!match) return null;
        return 'jour-' + match[1];
    }

    // -----------------------------------------------------------------------
    // Lecture / écriture de la progression dans IndexedDB
    // -----------------------------------------------------------------------
    async function loadRecord(dayId) {
        if (!window.ParadisStorage) return null;
        try {
            return await window.ParadisStorage.getLocal('progress', dayId);
        } catch (e) {
            return null;
        }
    }

    async function saveRecord(record) {
        if (!window.ParadisStorage) return;
        try {
            await window.ParadisStorage.saveLocal('progress', record);
            // Synchronisation cloud si disponible
            await window.ParadisStorage.enqueueSync({
                action: 'UPSERT_PROGRESS',
                payload: record
            });
            if (window.ParadisSync && typeof window.ParadisSync.triggerPushSync === 'function') {
                window.ParadisSync.triggerPushSync();
            }
        } catch (e) {
            console.warn('[StudySession] Erreur sauvegarde:', e);
        }
    }

    // -----------------------------------------------------------------------
    // Chronomètre
    // -----------------------------------------------------------------------
    function formatTime(totalMs) {
        const s = Math.floor(totalMs / 1000);
        const h = Math.floor(s / 3600);
        const m = Math.floor((s % 3600) / 60);
        const sec = s % 60;
        if (h > 0) {
            return `${h}h ${String(m).padStart(2,'0')}m ${String(sec).padStart(2,'0')}s`;
        }
        return `${String(m).padStart(2,'0')}m ${String(sec).padStart(2,'0')}s`;
    }

    function getCurrentElapsed() {
        if (_sessionStartTs === null) return _accumulatedMs;
        return _accumulatedMs + (Date.now() - _sessionStartTs);
    }

    function startTimer(onTick) {
        stopTimer();
        _sessionStartTs = Date.now();
        _timerInterval = setInterval(() => {
            onTick(formatTime(getCurrentElapsed()));
        }, 1000);
    }

    function stopTimer() {
        if (_timerInterval !== null) {
            clearInterval(_timerInterval);
            _timerInterval = null;
        }
        if (_sessionStartTs !== null) {
            _accumulatedMs += Date.now() - _sessionStartTs;
            _sessionStartTs = null;
        }
    }

    // -----------------------------------------------------------------------
    // Actions principales
    // -----------------------------------------------------------------------
    async function startStudy(dayId, onTick) {
        _currentDayId = dayId;
        let record = await loadRecord(dayId);
        const meta = LESSON_META[dayId] || {};

        if (!record) {
            record = {
                id: dayId,
                day_id: dayId,
                tome: meta.tome || 'P0',
                day_number: parseInt(dayId.replace('jour-', ''), 10) || 1,
                is_completed: false,
                study_status: STATUS.NOT_STARTED,
                time_spent_minutes: 0,
                accumulated_ms: 0,
                quiz_score: null,
                notes: '',
                bookmarked: false,
                completed_at: null,
            };
        }

        _accumulatedMs = (record.accumulated_ms || 0);
        record.study_status = STATUS.IN_PROGRESS;
        record.session_started_at = new Date().toISOString();
        await saveRecord(record);

        startTimer(onTick);
        broadcastChange(dayId, STATUS.IN_PROGRESS);
        return record;
    }

    async function pauseStudy(dayId, onTick) {
        stopTimer();
        let record = await loadRecord(dayId);
        if (!record) return;

        record.study_status = STATUS.PAUSED;
        record.accumulated_ms = _accumulatedMs;
        record.time_spent_minutes = Math.round(_accumulatedMs / 60000);
        record.last_pause = new Date().toISOString();
        await saveRecord(record);

        if (onTick) onTick(formatTime(_accumulatedMs));
        broadcastChange(dayId, STATUS.PAUSED);
        return record;
    }

    async function resumeStudy(dayId, onTick) {
        let record = await loadRecord(dayId);
        if (!record) return startStudy(dayId, onTick);

        _accumulatedMs = record.accumulated_ms || 0;
        record.study_status = STATUS.IN_PROGRESS;
        await saveRecord(record);

        startTimer(onTick);
        broadcastChange(dayId, STATUS.IN_PROGRESS);
        return record;
    }

    async function completeStudy(dayId) {
        stopTimer();
        let record = await loadRecord(dayId);
        if (!record) {
            record = { id: dayId, day_id: dayId };
        }

        record.study_status = STATUS.COMPLETED;
        record.is_completed = true;
        record.accumulated_ms = _accumulatedMs;
        record.time_spent_minutes = Math.round(_accumulatedMs / 60000);
        record.completed_at = new Date().toISOString();

        await saveRecord(record);

        // Reset timer state
        _accumulatedMs = 0;
        _sessionStartTs = null;

        broadcastChange(dayId, STATUS.COMPLETED);
        return record;
    }

    async function getStatus(dayId) {
        const record = await loadRecord(dayId);
        if (!record) return { status: STATUS.NOT_STARTED, timeMs: 0 };
        return {
            status: record.study_status || STATUS.NOT_STARTED,
            timeMs: record.accumulated_ms || 0,
            isCompleted: record.is_completed || false,
            record
        };
    }

    // -----------------------------------------------------------------------
    // Broadcast d'événements
    // -----------------------------------------------------------------------
    function broadcastChange(dayId, status) {
        window.dispatchEvent(new CustomEvent('paradis:study-status-changed', {
            detail: { dayId, status }
        }));
        window.dispatchEvent(new CustomEvent('paradis:session-changed'));
    }

    // -----------------------------------------------------------------------
    // Chargement initial du timer depuis IndexedDB (si reprise de page)
    // -----------------------------------------------------------------------
    async function initCurrentPage() {
        const dayId = detectCurrentLesson();
        if (!dayId) return;
        const { status, timeMs } = await getStatus(dayId);
        _accumulatedMs = timeMs;
        if (status === STATUS.IN_PROGRESS) {
            // La page a été rechargée pendant une session active → reprendre
            // (ne pas relancer le timer automatiquement sans action utilisateur)
        }
    }

    // Init
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initCurrentPage);
    } else {
        setTimeout(initCurrentPage, 100);
    }

    // -----------------------------------------------------------------------
    // API Publique
    // -----------------------------------------------------------------------
    window.ParadisStudySession = {
        STATUS,
        LESSON_META,
        detectCurrentLesson,
        startStudy,
        pauseStudy,
        resumeStudy,
        completeStudy,
        getStatus,
        getCurrentElapsed,
        formatTime,
    };

    console.info('[PARADIS] Study Session Engine initialisé.');
})();
