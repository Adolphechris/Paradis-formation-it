/**
 * PARADIS — Sync Bridge Push Engine (Sprint 06)
 *
 * Moteur de synchronisation push automatique de IndexedDB (local) vers Supabase (cloud).
 * Dépile la file sync_queue au retour de la connexion internet ou sur demande.
 */
(function () {
    'use strict';

    let isSyncing = false;
    let lastSyncTime = null;
    let retryTimeout = null;

    // Style de l'indicateur de synchronisation dans le header
    const styleId = 'paradis-sync-styles';
    if (!document.getElementById(styleId)) {
        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = `
            .paradis-sync-badge {
                display: inline-flex;
                align-items: center;
                gap: 6px;
                padding: 4px 10px;
                border-radius: 12px;
                font-size: 0.78rem;
                font-weight: 600;
                margin-left: 10px;
                transition: all 0.3s;
                cursor: pointer;
            }
            .paradis-sync-badge.synced {
                background: rgba(16, 185, 129, 0.15);
                color: #10b981;
                border: 1px solid rgba(16, 185, 129, 0.3);
            }
            .paradis-sync-badge.pending {
                background: rgba(245, 158, 11, 0.15);
                color: #f59e0b;
                border: 1px solid rgba(245, 158, 11, 0.3);
            }
            .paradis-sync-badge.offline {
                background: rgba(107, 114, 128, 0.2);
                color: #9ca3af;
                border: 1px solid rgba(107, 114, 128, 0.3);
            }
            .paradis-sync-badge.syncing {
                background: rgba(6, 182, 212, 0.15);
                color: #06b6d4;
                border: 1px solid rgba(6, 182, 212, 0.3);
                animation: paradisPulse 1.5s infinite;
            }
            .paradis-sync-badge.failed {
                background: rgba(239, 68, 68, 0.15);
                color: #fca5a5;
                border: 1px solid rgba(239, 68, 68, 0.3);
            }
            @keyframes paradisPulse {
                0% { opacity: 0.6; }
                50% { opacity: 1; }
                100% { opacity: 0.6; }
            }
        `;
        document.head.appendChild(style);
    }

    /**
     * Met à jour ou injecte le badge de statut de synchronisation dans la navbar
     */
    async function updateSyncBadgeUI(statusState, messageOverride = null) {
        const headerInner = document.querySelector('.md-header__inner');
        if (!headerInner) return;

        let badge = document.getElementById('paradis-sync-header-badge');
        if (!badge) {
            badge = document.createElement('div');
            badge.id = 'paradis-sync-header-badge';
            headerInner.appendChild(badge);
        }

        let pendingCount = 0;
        if (window.ParadisStorage && typeof window.ParadisStorage.getSyncQueue === 'function') {
            try {
                const queue = await window.ParadisStorage.getSyncQueue();
                pendingCount = queue.length;
            } catch (e) {}
        }

        const isOnline = navigator.onLine;

        if (!isOnline) {
            badge.className = 'paradis-sync-badge offline';
            badge.innerHTML = `📶 Hors-ligne ${pendingCount > 0 ? `(${pendingCount} en attente)` : ''}`;
            badge.title = 'Vous travaillez en mode local IndexedDB. Les données seront synchronisées au retour du réseau.';
            badge.onclick = null;
            return;
        }

        if (statusState === 'syncing') {
            badge.className = 'paradis-sync-badge syncing';
            badge.innerHTML = `⏳ Synchronisation...`;
            badge.title = 'Envoi des modifications vers Supabase...';
            badge.onclick = null;
        } else if (statusState === 'failed') {
            badge.className = 'paradis-sync-badge failed';
            badge.innerHTML = `⚠️ Sync échec (Forcer)`;
            badge.title = 'Cliquez pour réesayer la synchronisation immédiatement.';
            badge.onclick = () => triggerPushSync(true);
        } else if (pendingCount > 0) {
            badge.className = 'paradis-sync-badge pending';
            badge.innerHTML = `☁️ ${pendingCount} en attente (Sync)`;
            badge.title = 'Cliquez pour synchroniser les modifications avec le Cloud Supabase.';
            badge.onclick = () => triggerPushSync(true);
        } else {
            badge.className = 'paradis-sync-badge synced';
            const timeAgo = lastSyncTime ? Math.round((Date.now() - lastSyncTime) / 1000) : 0;
            badge.innerHTML = `☁️ Synchronisé ${lastSyncTime ? `(${timeAgo}s)` : ''}`;
            badge.title = 'Toutes les données locales sont à jour sur Supabase.';
            badge.onclick = () => triggerPushSync(true);
        }
    }

    /**
     * Dépile la file sync_queue et transmet chaque opération à Supabase
     */
    async function processSyncQueue() {
        if (isSyncing || !navigator.onLine) return;

        const storageApi = window.ParadisStorage;
        const supabaseApi = window.ParadisSupabase;

        if (!storageApi || !supabaseApi || typeof storageApi.getSyncQueue !== 'function') return;

        let queue = [];
        try {
            queue = await storageApi.getSyncQueue();
        } catch (err) {
            console.warn('[SyncBridge] Erreur lecture sync_queue :', err);
            return;
        }

        if (queue.length === 0) {
            updateSyncBadgeUI('synced');
            return;
        }

        isSyncing = true;
        updateSyncBadgeUI('syncing');

        const successfulIds = [];
        let hasError = false;

        for (const item of queue) {
            try {
                if (item.action === 'UPSERT_PROGRESS') {
                    const { error } = await supabaseApi.saveProgress(item.payload.day_id, {
                        tome: item.payload.tome,
                        dayNumber: item.payload.day_number,
                        isCompleted: item.payload.is_completed,
                        quizScore: item.payload.quiz_score,
                        notes: item.payload.notes
                    });
                    if (error) throw error;
                    successfulIds.push(item.id);
                } else if (item.action === 'SAVE_NOTE') {
                    const { error } = await supabaseApi.saveNote(item.payload.day_id, item.payload.content);
                    if (error) throw error;
                    successfulIds.push(item.id);
                } else {
                    // Action non gérée, marquer comme traitée
                    successfulIds.push(item.id);
                }
            } catch (err) {
                console.warn(`[SyncBridge] Échec sync item ${item.id} (${item.action}) :`, err.message || err);
                hasError = true;
                break; // Stopper le dépilage en cas d'erreur réseau
            }
        }

        // Supprime les éléments synchronisés avec succès
        if (successfulIds.length > 0) {
            await storageApi.dequeueSync(successfulIds);
        }

        isSyncing = false;
        lastSyncTime = Date.now();

        if (hasError) {
            updateSyncBadgeUI('failed');
            scheduleBackoffRetry();
        } else {
            updateSyncBadgeUI('synced');
        }
    }

    /**
     * Planifie un retry avec backoff exponentiel (1s -> 2s -> 4s -> 8s)
     */
    function scheduleBackoffRetry(attempt = 1) {
        if (retryTimeout) clearTimeout(retryTimeout);
        if (attempt > 5) return; // Max 5 tentatives

        const delay = Math.pow(2, attempt - 1) * 1000;
        retryTimeout = setTimeout(() => {
            if (navigator.onLine) {
                processSyncQueue().catch(() => scheduleBackoffRetry(attempt + 1));
            }
        }, delay);
    }

    /**
     * Déclencheur principal de la synchronisation
     */
    function triggerPushSync(force = false) {
        if (force || navigator.onLine) {
            processSyncQueue();
        } else {
            updateSyncBadgeUI('offline');
        }
    }

    // Écouteurs d'événements réseau
    window.addEventListener('online', () => {
        console.info('[SyncBridge] Connexion internet rétablie — lancement de la synchronisation...');
        triggerPushSync(true);
    });

    window.addEventListener('offline', () => {
        console.warn('[SyncBridge] Connexion internet perdue — passage en mode hors-ligne IndexedDB.');
        updateSyncBadgeUI('offline');
    });

    // Initialisation au chargement de la page
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            setTimeout(triggerPushSync, 1500);
        });
    } else {
        setTimeout(triggerPushSync, 1500);
    }

    window.ParadisSync = {
        triggerPushSync,
        processSyncQueue,
        updateSyncBadgeUI
    };
})();
