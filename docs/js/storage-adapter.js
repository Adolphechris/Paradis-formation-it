/**
 * PARADIS — Storage Adapter (Local-First IndexedDB)
 *
 * Implémente la couche d'abstraction unifiée de stockage local.
 * Gère les 5 objectStores de la plateforme :
 *   1. progress      - Suivi quotidien des leçons
 *   2. notes         - Prises de notes personnelles
 *   3. quiz_attempts - Historique des tentatives QCM / examens
 *   4. sync_queue    - File d'attente des opérations à pousser vers Supabase
 *   5. user_profile  - Cache local du profil utilisateur
 */
(function () {
    'use strict';

    const DB_NAME = 'paradis-storage-v2';
    const DB_VERSION = 1;
    const STORES = {
        PROGRESS: 'progress',
        NOTES: 'notes',
        QUIZ_ATTEMPTS: 'quiz_attempts',
        SYNC_QUEUE: 'sync_queue',
        USER_PROFILE: 'user_profile'
    };

    let dbInstance = null;

    /**
     * Ouvre ou initialise la base IndexedDB avec gestion propre des Promises.
     * @returns {Promise<IDBDatabase>}
     */
    function openDB() {
        if (dbInstance) {
            return Promise.resolve(dbInstance);
        }

        return new Promise((resolve, reject) => {
            const request = indexedDB.open(DB_NAME, DB_VERSION);

            request.onupgradeneeded = (event) => {
                const db = event.target.result;

                // 1. Store progress (clé : id, ex: "jour-01")
                if (!db.objectStoreNames.contains(STORES.PROGRESS)) {
                    const progressStore = db.createObjectStore(STORES.PROGRESS, { keyPath: 'id' });
                    progressStore.createIndex('tome', 'tome', { unique: false });
                    progressStore.createIndex('is_completed', 'is_completed', { unique: false });
                }

                // 2. Store notes (clé : day_id, ex: "jour-01")
                if (!db.objectStoreNames.contains(STORES.NOTES)) {
                    db.createObjectStore(STORES.NOTES, { keyPath: 'day_id' });
                }

                // 3. Store quiz_attempts (clé générée : id)
                if (!db.objectStoreNames.contains(STORES.QUIZ_ATTEMPTS)) {
                    const quizStore = db.createObjectStore(STORES.QUIZ_ATTEMPTS, { keyPath: 'id', autoIncrement: true });
                    quizStore.createIndex('day_id', 'day_id', { unique: false });
                }

                // 4. Store sync_queue (clé générée : id)
                if (!db.objectStoreNames.contains(STORES.SYNC_QUEUE)) {
                    const queueStore = db.createObjectStore(STORES.SYNC_QUEUE, { keyPath: 'id', autoIncrement: true });
                    queueStore.createIndex('status', 'status', { unique: false });
                    queueStore.createIndex('timestamp', 'timestamp', { unique: false });
                }

                // 5. Store user_profile (clé : key, ex: "current_user")
                if (!db.objectStoreNames.contains(STORES.USER_PROFILE)) {
                    db.createObjectStore(STORES.USER_PROFILE, { keyPath: 'key' });
                }
            };

            request.onsuccess = (event) => {
                dbInstance = event.target.result;
                dbInstance.onversionchange = () => {
                    dbInstance.close();
                    dbInstance = null;
                };
                resolve(dbInstance);
            };

            request.onerror = (event) => {
                reject(new Error('[StorageAdapter] Erreur ouverture IndexedDB : ' + (event.target.error?.message || 'Inconnue')));
            };

            request.onblocked = () => {
                console.warn('[StorageAdapter] IndexedDB bloqué par une autre onglet ouvert.');
                reject(new Error('[StorageAdapter] IndexedDB bloqué'));
            };
        });
    }

    /**
     * Sauvegarde ou met à jour une donnée dans un store IndexedDB.
     * @param {string} storeName - Nom du store (STORES.*)
     * @param {Object} data - Objet à persister (doit inclure la keyPath configurée)
     * @returns {Promise<void>}
     */
    async function saveLocal(storeName, data) {
        const db = await openDB();
        return new Promise((resolve, reject) => {
            const tx = db.transaction(storeName, 'readwrite');
            const store = tx.objectStore(storeName);
            const record = {
                ...data,
                updated_at_local: Date.now()
            };
            store.put(record);

            tx.oncomplete = () => resolve();
            tx.onerror = (e) => reject(e.target?.error || new Error('Erreur transaction saveLocal'));
            tx.onabort = () => reject(new Error('Transaction saveLocal avortée'));
        });
    }

    /**
     * Récupère un enregistrement par sa clé.
     * @param {string} storeName - Nom du store
     * @param {string|number} key - Clé de recherche
     * @returns {Promise<Object|null>}
     */
    async function getLocal(storeName, key) {
        const db = await openDB();
        return new Promise((resolve, reject) => {
            const tx = db.transaction(storeName, 'readonly');
            const store = tx.objectStore(storeName);
            const request = store.get(key);

            request.onsuccess = () => resolve(request.result ?? null);
            request.onerror = (e) => reject(e.target?.error || new Error('Erreur lecture getLocal'));
        });
    }

    /**
     * Récupère tous les enregistrements d'un store.
     * @param {string} storeName - Nom du store
     * @returns {Promise<Array>}
     */
    async function getAllLocal(storeName) {
        const db = await openDB();
        return new Promise((resolve, reject) => {
            const tx = db.transaction(storeName, 'readonly');
            const store = tx.objectStore(storeName);
            const request = store.getAll();

            request.onsuccess = () => resolve(request.result ?? []);
            request.onerror = (e) => reject(e.target?.error || new Error('Erreur lecture getAllLocal'));
        });
    }

    /**
     * Supprime un enregistrement par sa clé.
     * @param {string} storeName
     * @param {string|number} key
     * @returns {Promise<void>}
     */
    async function deleteLocal(storeName, key) {
        const db = await openDB();
        return new Promise((resolve, reject) => {
            const tx = db.transaction(storeName, 'readwrite');
            const store = tx.objectStore(storeName);
            store.delete(key);

            tx.oncomplete = () => resolve();
            tx.onerror = (e) => reject(e.target?.error || new Error('Erreur suppression deleteLocal'));
        });
    }

    /**
     * Enregistre une opération en attente dans la file d'attente de synchronisation.
     * @param {Object} operation - { action: 'UPSERT_PROGRESS'|'SAVE_NOTE'|'SUBMIT_QUIZ', payload: Object }
     * @returns {Promise<number>} - ID généré dans la file
     */
    async function enqueueSync(operation) {
        const db = await openDB();
        return new Promise((resolve, reject) => {
            const tx = db.transaction(STORES.SYNC_QUEUE, 'readwrite');
            const store = tx.objectStore(STORES.SYNC_QUEUE);
            const entry = {
                action: operation.action,
                payload: operation.payload,
                status: 'pending',
                attempts: 0,
                timestamp: Date.now()
            };
            const request = store.add(entry);

            request.onsuccess = () => resolve(request.result);
            tx.onerror = (e) => reject(e.target?.error || new Error('Erreur ajout enqueueSync'));
        });
    }

    /**
     * Récupère la liste des opérations en attente de synchronisation.
     * @returns {Promise<Array>}
     */
    async function getSyncQueue() {
        return getAllLocal(STORES.SYNC_QUEUE);
    }

    /**
     * Efface les opérations synchronisées de la file d'attente.
     * @param {Array<number>} ids - Liste des IDs à supprimer
     * @returns {Promise<void>}
     */
    async function dequeueSync(ids) {
        if (!Array.isArray(ids) || ids.length === 0) return;
        const db = await openDB();
        return new Promise((resolve, reject) => {
            const tx = db.transaction(STORES.SYNC_QUEUE, 'readwrite');
            const store = tx.objectStore(STORES.SYNC_QUEUE);
            ids.forEach((id) => store.delete(id));

            tx.oncomplete = () => resolve();
            tx.onerror = (e) => reject(e.target?.error || new Error('Erreur suppression dequeueSync'));
        });
    }

    // Expose le module globalement
    window.ParadisStorage = {
        STORES,
        openDB,
        saveLocal,
        getLocal,
        getAllLocal,
        deleteLocal,
        enqueueSync,
        getSyncQueue,
        dequeueSync
    };

    console.info('[PARADIS] Storage Adapter (IndexedDB) initialisé avec succès.');
})();
