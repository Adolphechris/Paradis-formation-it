/**
 * PARADIS — Progress Tracker (Unified with StorageAdapter)
 *
 * Moteur unifié de calcul de progression, streaks et score radar.
 * Utilise window.ParadisStorage comme unique source de vérité IndexedDB.
 */
(function () {
    'use strict';

    /**
     * Accès au Storage Adapter unifié
     */
    function getStorage() {
        if (!window.ParadisStorage) {
            throw new Error('[ProgressTracker] ParadisStorage non disponible.');
        }
        return window.ParadisStorage;
    }

    /**
     * Sauvegarde la progression d'une journée dans IndexedDB (via StorageAdapter)
     * et planifie la synchronisation cloud.
     */
    async function saveProgress(dayId, data) {
        const storage = getStorage();
        const record = {
            id: dayId,
            day_id: dayId,
            tome: data.tome || 'P0',
            day_number: data.dayNumber || Number(dayId.replace(/[^0-9]/g, '')) || 1,
            is_completed: Boolean(data.isCompleted),
            quiz_score: data.quizScore ?? null,
            time_spent_minutes: data.timeSpentMinutes ?? 0,
            notes: data.notes || '',
            bookmarked: Boolean(data.bookmarked),
            completed_at: data.isCompleted ? new Date().toISOString() : null,
            savedAt: Date.now()
        };

        // 1. Sauvegarde IndexedDB local-first
        await storage.saveLocal('progress', record);

        // 2. Mise en file d'attente pour synchronisation cloud Push
        await storage.enqueueSync({
            action: 'UPSERT_PROGRESS',
            payload: record
        });

        // 3. Déclenche le push sync si en ligne
        if (window.ParadisSync && typeof window.ParadisSync.triggerPushSync === 'function') {
            window.ParadisSync.triggerPushSync();
        }
    }

    /**
     * Récupère la progression d'une journée spécifique.
     */
    async function getProgress(dayId) {
        const storage = getStorage();
        return storage.getLocal('progress', dayId);
    }

    /**
     * Récupère l'intégralité de la progression.
     */
    async function getAllProgress() {
        const storage = getStorage();
        return storage.getAllLocal('progress');
    }

    /**
     * Supprime la progression d'une journée.
     */
    async function deleteProgress(dayId) {
        const storage = getStorage();
        return storage.deleteLocal('progress', dayId);
    }

    /**
     * Calcule la série de jours consécutifs validés (Streak).
     */
    function computeStreak(progressRecords) {
        if (!Array.isArray(progressRecords)) return 0;
        const sorted = progressRecords
            .filter(r => (r.is_completed || r.isCompleted || r.study_status === 'completed') && (r.quiz_score !== undefined && r.quiz_score !== null ? r.quiz_score >= 75 : true))
            .map(r => ({
                dayNumber: r.day_number || r.dayNumber || Number((r.id || r.day_id || '').replace(/[^0-9]/g, ''))
            }))
            .filter(r => !isNaN(r.dayNumber))
            .sort((a, b) => b.dayNumber - a.dayNumber);

        if (sorted.length === 0) return 0;

        let streak = 1;
        for (let i = 1; i < sorted.length; i++) {
            if (sorted[i].dayNumber === sorted[i - 1].dayNumber - 1) {
                streak++;
            } else {
                break;
            }
        }
        return streak;
    }

    /**
     * Calcule les scores radar de compétences par domaine.
     */
    function computeRadar(progressRecords) {
        if (!Array.isArray(progressRecords)) {
            return {
                supportBureautique: 0,
                systemesReseaux: 0,
                devAlgo: 0,
                dataSql: 0,
                cloudSecurity: 0,
                bankingGovernance: 0
            };
        }

        const completed = progressRecords.filter(r => (r.is_completed || r.isCompleted) && (r.quiz_score !== null && r.quiz_score !== undefined || r.quizScore !== undefined));
        const tomeScores = {};

        completed.forEach(r => {
            const tome = r.tome || 'P0';
            if (!tomeScores[tome]) tomeScores[tome] = [];
            const score = r.quiz_score ?? r.quizScore ?? 0;
            tomeScores[tome].push(score);
        });

        return {
            supportBureautique: averageScore(tomeScores['P0']),
            systemesReseaux: averageScore([...(tomeScores['P2'] || []), ...(tomeScores['P3A'] || [])]),
            devAlgo: averageScore([...(tomeScores['P2'] || []), ...(tomeScores['P3C'] || [])]),
            dataSql: averageScore([...(tomeScores['P2'] || []), ...(tomeScores['P3B'] || [])]),
            cloudSecurity: averageScore(tomeScores['P4']),
            bankingGovernance: averageScore([...(tomeScores['P5'] || []), ...(tomeScores['P6'] || [])])
        };
    }

    function averageScore(scores) {
        if (!scores || scores.length === 0) return 0;
        return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
    }

    // Exposition globale de l'API unifiée
    window.ParadisProgress = {
        saveProgress,
        getProgress,
        getAllProgress,
        deleteProgress,
        computeStreak,
        computeRadar
    };

    console.info('[PARADIS] Progress Tracker unifié avec StorageAdapter (IndexedDB unique).');
})();
