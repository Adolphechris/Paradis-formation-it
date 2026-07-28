/**
 * PARADIS — Progress Tracker
 * Tracks user completion status using IndexedDB with proper Promise handling.
 * Syncs with Supabase when online.
 */
(function () {
    'use strict';

    const DB_NAME = 'paradis-progress';
    const DB_VERSION = 2;
    const DB_STORES = ['progress', 'quizzes', 'notes', 'profile'];

    let db = null;

    /**
     * Open (or create) the IndexedDB database with proper Promise wrapping.
     * @returns {Promise<IDBDatabase>}
     */
    function openDB() {
        if (db) {
            return Promise.resolve(db);
        }

        return new Promise((resolve, reject) => {
            const request = indexedDB.open(DB_NAME, DB_VERSION);

            request.onupgradeneeded = (e) => {
                const database = e.target.result;
                DB_STORES.forEach((storeName) => {
                    if (!database.objectStoreNames.contains(storeName)) {
                        database.createObjectStore(storeName, { keyPath: 'id' });
                    }
                });
            };

            request.onsuccess = (e) => {
                db = e.target.result;
                db.onversionchange = () => {
                    db.close();
                    db = null;
                };
                resolve(db);
            };

            request.onerror = (e) => {
                reject(new Error('Failed to open IndexedDB: ' + e.target.error?.message));
            };

            request.onblocked = () => {
                console.warn('IndexedDB blocked — close other tabs using this database');
                reject(new Error('IndexedDB blocked'));
            };
        });
    }

    /**
     * Sync a progress record to Supabase when the client is configured.
     * @param {string} dayId
     * @param {Object} record
     * @returns {Promise<Object>}
     */
    async function syncProgressWithSupabase(dayId, record) {
        const supabaseApi = window.ParadisSupabase;
        if (!supabaseApi || typeof supabaseApi.isConfigured !== 'function' || !supabaseApi.isConfigured()) {
            return { enabled: false, status: 'not-configured' };
        }

        try {
            if (typeof supabaseApi.saveProgress !== 'function') {
                return { enabled: false, status: 'missing-bridge' };
            }

            const result = await supabaseApi.saveProgress(dayId, record);
            if (result?.error) {
                throw result.error;
            }
            return { enabled: true, status: 'synced' };
        } catch (err) {
            console.warn('Progress sync to Supabase failed:', err.message || err);
            return { enabled: true, status: 'failed', error: err };
        }
    }

    /**
     * Load progress from Supabase into the local cache when available.
     * @returns {Promise<Object>}
     */
    async function loadProgressFromSupabase() {
        const supabaseApi = window.ParadisSupabase;
        if (!supabaseApi || typeof supabaseApi.loadProgress !== 'function') {
            return { enabled: false, status: 'not-configured' };
        }

        const result = await supabaseApi.loadProgress();
        if (result?.error) {
            throw result.error;
        }

        return { enabled: true, status: 'loaded', rows: result.data || [] };
    }

    /**
     * Save progress record for a specific day.
     * @param {string} dayId — e.g. "jour-01"
     * @param {Object} data  — { tome, dayNumber, isCompleted, quizScore, timeSpentMinutes, notes, bookmarked }
     * @returns {Promise<void>}
     */
    async function saveProgress(dayId, data) {
        await openDB();
        return new Promise((resolve, reject) => {
            const tx = db.transaction('progress', 'readwrite');
            const store = tx.objectStore('progress');
            const record = {
                id: dayId,
                ...data,
                savedAt: Date.now()
            };

            const request = store.put(record);

            request.onsuccess = () => { /* resolve handled by tx.oncomplete */ };
            request.onerror = () => reject(request.error);
            tx.oncomplete = () => {
                syncProgressWithSupabase(dayId, record)
                    .then(() => resolve())
                    .catch((err) => reject(err));
            };
            tx.onerror = (e) => {
                const err = e.target?.error || new Error('Transaction error');
                reject(err);
            };
            tx.onabort = () => reject(new Error('Transaction aborted'));
        });
    }

    /**
     * Retrieve progress record for a specific day.
     * @param {string} dayId
     * @returns {Promise<Object|null>}
     */
    async function getProgress(dayId) {
        await openDB();
        return new Promise((resolve, reject) => {
            const tx = db.transaction('progress', 'readonly');
            const store = tx.objectStore('progress');
            const request = store.get(dayId);

            request.onsuccess = () => resolve(request.result ?? null);
            request.onerror = () => reject(request.error);
        });
    }

    /**
     * Retrieve all progress records.
     * @returns {Promise<Array>}
     */
    async function getAllProgress() {
        await openDB();
        return new Promise((resolve, reject) => {
            const tx = db.transaction('progress', 'readonly');
            const store = tx.objectStore('progress');
            const request = store.getAll();

            request.onsuccess = () => resolve(request.result ?? []);
            request.onerror = () => reject(request.error);
        });
    }

    /**
     * Delete a progress record.
     * @param {string} dayId
     * @returns {Promise<void>}
     */
    async function deleteProgress(dayId) {
        await openDB();
        return new Promise((resolve, reject) => {
            const tx = db.transaction('progress', 'readwrite');
            const store = tx.objectStore('progress');
            const request = store.delete(dayId);

            request.onsuccess = () => { /* handled by tx.oncomplete */ };
            request.onerror = () => reject(request.error);
            tx.oncomplete = () => resolve();
            tx.onerror = (e) => {
                const err = e.target?.error || new Error('Transaction error');
                reject(err);
            };
            tx.onabort = () => reject(new Error('Transaction aborted'));
        });
    }

    /**
     * Compute daily streak from completed days.
     * @param {Array} progressRecords
     * @returns {number}
     */
    function computeStreak(progressRecords) {
        const sorted = progressRecords
            .filter(r => r.isCompleted)
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
     * Compute competency radar scores from progress records.
     * @param {Array} progressRecords
     * @returns {Object}
     */
    function computeRadar(progressRecords) {
        const completed = progressRecords.filter(r => r.isCompleted && r.quizScore !== undefined);
        const tomeScores = {};

        const tomeMapping = {
            'P0': 'supportBureautique',
            'P2': 'systemesReseaux',
            'P3A': 'systemesReseaux',
            'P3C': 'devAlgo',
            'P2': 'devAlgo',
            'P3B': 'dataSql',
            'P2b': 'dataSql',
            'P4': 'cloudSecurity',
            'P5': 'bankingGovernance',
            'P6': 'bankingGovernance'
        };

        completed.forEach(r => {
            const tome = r.tome;
            if (tomeScores[tome] === undefined) {
                tomeScores[tome] = [];
            }
            tomeScores[tome].push(r.quizScore);
        });

        const result = {
            supportBureautique: averageScore(tomeScores['P0']),
            systemesReseaux: averageScore([...(tomeScores['P2'] || []), ...(tomeScores['P3A'] || [])]),
            devAlgo: averageScore([...(tomeScores['P2'] || []), ...(tomeScores['P3C'] || [])]),
            dataSql: averageScore([...(tomeScores['P2'] || []), ...(tomeScores['P3B'] || [])]),
            cloudSecurity: averageScore(tomeScores['P4']),
            bankingGovernance: averageScore([...(tomeScores['P5'] || []), ...(tomeScores['P6'] || [])])
        };

        return result;
    }

    function averageScore(scores) {
        if (!scores || scores.length === 0) return 0;
        return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
    }

    // Expose globally
    window.ParadisProgress = {
        openDB,
        saveProgress,
        getProgress,
        getAllProgress,
        deleteProgress,
        computeStreak,
        computeRadar,
        syncProgressWithSupabase,
        loadProgressFromSupabase
    };

    console.log('PARADIS Progress Tracker initialized');
})();
