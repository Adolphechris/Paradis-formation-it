/**
 * PARADIS — Backup & Restore Engine (Sprint 26)
 *
 * Moteur d'exportation et importation de sauvegarde complète :
 *   - Exportation JSON de l'intégralité des données IndexedDB (progress, notes, quiz_attempts, user_profile)
 *   - Importation et restauration 1-clic avec rafraîchissement réactif
 */
(function () {
    'use strict';

    window.ParadisBackup = {
        /**
         * Exporte toutes les données IndexedDB au format JSON
         */
        async exportProfile() {
            if (!window.ParadisStorage || typeof window.ParadisStorage.getAllLocal !== 'function') {
                alert('⚠️ Service de stockage local non disponible.');
                return;
            }

            try {
                const backupData = {
                    version: '2.0',
                    exportedAt: new Date().toISOString(),
                    progress: await window.ParadisStorage.getAllLocal('progress'),
                    notes: await window.ParadisStorage.getAllLocal('notes'),
                    quiz_attempts: await window.ParadisStorage.getAllLocal('quiz_attempts'),
                    user_profile: await window.ParadisStorage.getAllLocal('user_profile')
                };

                const jsonStr = JSON.stringify(backupData, null, 2);
                const blob = new Blob([jsonStr], { type: 'application/json' });
                const url = URL.createObjectURL(blob);

                const a = document.createElement('a');
                a.href = url;
                a.download = `paradis-backup-${new Date().toISOString().slice(0, 10)}.json`;
                a.click();

                URL.revokeObjectURL(url);
                console.info('[Backup] Sauvegarde exportée avec succès.');
            } catch (err) {
                console.error('[Backup] Erreur exportation :', err);
                alert('⚠️ Échec de l’exportation de la sauvegarde.');
            }
        },

        /**
         * Importe et restaure les données depuis un fichier JSON
         * @param {File} file
         */
        async importProfile(file) {
            if (!file) return;

            try {
                const text = await file.text();
                const data = JSON.parse(text);

                if (!data || (!data.progress && !data.user_profile)) {
                    throw new Error('Format de fichier de sauvegarde invalide.');
                }

                const storage = window.ParadisStorage;
                if (!storage || typeof storage.saveLocal !== 'function') {
                    throw new Error('StorageAdapter non disponible.');
                }

                // Restauration dans IndexedDB
                if (Array.isArray(data.progress)) {
                    for (const item of data.progress) {
                        await storage.saveLocal('progress', item);
                    }
                }

                if (Array.isArray(data.notes)) {
                    for (const item of data.notes) {
                        await storage.saveLocal('notes', item);
                    }
                }

                if (Array.isArray(data.quiz_attempts)) {
                    for (const item of data.quiz_attempts) {
                        await storage.saveLocal('quiz_attempts', item);
                    }
                }

                if (Array.isArray(data.user_profile)) {
                    for (const item of data.user_profile) {
                        await storage.saveLocal('user_profile', item);
                    }
                }

                alert('🎉 Sauvegarde restaurée avec succès ! La page va se rafraîchir.');
                window.location.reload();
            } catch (err) {
                console.error('[Backup] Erreur importation :', err);
                alert('⚠️ Erreur lors de la restauration : ' + err.message);
            }
        }
    };

    console.info('[PARADIS] Backup & Restore Engine initialisé.');
})();
