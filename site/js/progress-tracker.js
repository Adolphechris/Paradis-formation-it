/**
 * PARADIS — Progress Tracker
 * Tracks user completion status using IndexedDB.
 * Syncs with Supabase when online.
 */
(function () {
    'use strict';

    const DB_NAME = 'paradis-progress';
    const DB_VERSION = 1;
    const STORES = ['progress', 'quizzes', 'notes', 'profile'];

    let db = null;

    function openDB() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(DB_NAME, DB_VERSION);
            request.onupgradeneeded = (e) => {
                const database = e.target.result;
                STORES.forEach((storeName) => {
                    if (!database.objectStoreNames.contains(storeName)) {
                        database.createObjectStore(storeName, { keyPath: 'id' });
                    }
                });
            };
            request.onsuccess = (e) => { db = e.target.result; resolve(db); };
            request.onerror = (e) => reject(e);
        });
    }

    async function saveProgress(dayId, data) {
        if (!db) await openDB();
        const tx = db.transaction('progress', 'readwrite');
        tx.objectStore('progress').put({ id: dayId, ...data, savedAt: Date.now() });
        return tx.complete;
    }

    async function getProgress(dayId) {
        if (!db) await openDB();
        return new Promise((resolve, reject) => {
            const tx = db.transaction('progress', 'readonly');
            const request = tx.objectStore('progress').get(dayId);
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    // Expose globally
    window.ParadisProgress = { openDB, saveProgress, getProgress };
})();
