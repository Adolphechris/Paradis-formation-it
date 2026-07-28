/**
 * PARADIS — Sync Pull & LWW Merge Engine (Sprint 07)
 *
 * Moteur de synchronisation descendante (Pull) et de fusion Last-Write-Wins (LWW)
 * au moment de la connexion sur un nouvel appareil.
 */
(function () {
    'use strict';

    let isPulling = false;

    /**
     * Convertit une date ISO ou un timestamp en millisecondes pour comparaison.
     */
    function parseTimestamp(val) {
        if (!val) return 0;
        if (typeof val === 'number') return val;
        const parsed = new Date(val).getTime();
        return isNaN(parsed) ? 0 : parsed;
    }

    /**
     * Récupère la progression distante Supabase et la fusionne dans IndexedDB (LWW)
     */
    async function pullAndMergeProgress() {
        if (isPulling || !navigator.onLine) return;

        const supabaseApi = window.ParadisSupabase;
        const storageApi = window.ParadisStorage;

        if (!supabaseApi || !storageApi || typeof supabaseApi.loadProgress !== 'function') return;

        const session = await supabaseApi.getSession();
        if (!session?.user) return; // Pas de session active

        isPulling = true;
        console.info('[SyncPull] Début de la synchronisation Pull & LWW Merge...');

        try {
            // 1. Récupération des données distantes Supabase
            const { data: remoteRows, error } = await supabaseApi.loadProgress();
            if (error) {
                console.warn('[SyncPull] Erreur récupération Supabase :', error.message);
                return;
            }

            if (!Array.isArray(remoteRows) || remoteRows.length === 0) {
                console.info('[SyncPull] Aucune donnée distante à fusionner.');
                return;
            }

            // 2. Récupération des données locales IndexedDB
            const localRows = await storageApi.getAllLocal('progress');
            const localMap = new Map();
            localRows.forEach(r => localMap.set(r.id || r.day_id, r));

            let mergedCount = 0;

            // 3. Fusion Last-Write-Wins (LWW)
            for (const remote of remoteRows) {
                const dayId = remote.day_id;
                const local = localMap.get(dayId);

                const remoteTime = parseTimestamp(remote.updated_at || remote.completed_at);
                const localTime = local ? parseTimestamp(local.updated_at_local || local.completed_at) : 0;

                // Si le serveur est plus récent ou que le local n'existe pas -> Victoire du serveur (LWW)
                if (!local || remoteTime >= localTime) {
                    const mergedRecord = {
                        id: dayId,
                        day_id: dayId,
                        tome: remote.tome || 'P0',
                        day_number: remote.day_number || 1,
                        is_completed: Boolean(remote.is_completed),
                        quiz_score: remote.quiz_score ?? null,
                        notes: remote.notes || '',
                        completed_at: remote.completed_at,
                        updated_at_local: remoteTime
                    };

                    await storageApi.saveLocal('progress', mergedRecord);
                    mergedCount++;
                }
            }

            console.info(`[SyncPull] Fusion LWW terminée : ${mergedCount} enregistrements mis à jour dans IndexedDB.`);

            // 4. Rafraîchissement des composants UI
            if (window.ParadisDayCompletion) {
                if (typeof window.ParadisDayCompletion.decorateSidebar === 'function') {
                    window.ParadisDayCompletion.decorateSidebar();
                }
                if (typeof window.ParadisDayCompletion.injectCompletionWidget === 'function') {
                    window.ParadisDayCompletion.injectCompletionWidget();
                }
            }
        } catch (err) {
            console.error('[SyncPull] Erreur lors de la fusion LWW :', err);
        } finally {
            isPulling = false;
        }
    }

    // Déclenchement au chargement de la page après initialisation du client
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            setTimeout(pullAndMergeProgress, 2000);
        });
    } else {
        setTimeout(pullAndMergeProgress, 2000);
    }

    window.ParadisPull = {
        pullAndMergeProgress
    };
})();
