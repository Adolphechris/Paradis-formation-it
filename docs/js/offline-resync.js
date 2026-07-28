/**
 * PARADIS — Moteur de Re-synchronisation Automatique Hors-Ligne (Sprint 32)
 *
 * Gère la résilience réseau et les reconnexions intermittentes :
 *   - Notification Toast visuelle et non-intrusive lors des pertes/retours de connexion
 *   - Déclenchement automatique et sécurisé du Push Sync et du Pull LWW dès le retour du réseau
 */
(function () {
    'use strict';

    // Injection CSS pour les Toasts de notification réseau
    const styleId = 'paradis-toast-styles';
    if (!document.getElementById(styleId)) {
        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = `
            .paradis-toast-container {
                position: fixed;
                bottom: 20px;
                left: 20px;
                z-index: 99999;
                display: flex;
                flex-direction: column;
                gap: 8px;
            }
            .paradis-toast {
                padding: 10px 16px;
                border-radius: 8px;
                font-size: 0.85rem;
                font-weight: 600;
                box-shadow: 0 4px 15px rgba(0,0,0,0.5);
                color: #ffffff;
                display: flex;
                align-items: center;
                gap: 8px;
                animation: paradisToastSlide 0.3s cubic-bezier(0.16, 1, 0.3, 1);
            }
            .paradis-toast.offline {
                background: rgba(31, 41, 55, 0.95);
                border: 1px solid #4b5563;
                color: #d1d5db;
            }
            .paradis-toast.online {
                background: rgba(16, 185, 129, 0.95);
                border: 1px solid #10b981;
                color: #ffffff;
            }
            @keyframes paradisToastSlide {
                from { transform: translateY(20px); opacity: 0; }
                to { transform: translateY(0); opacity: 1; }
            }
        `;
        document.head.appendChild(style);
    }

    function showNetworkToast(message, isOnline) {
        let container = document.getElementById('paradis-toast-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'paradis-toast-container';
            container.className = 'paradis-toast-container';
            document.body.appendChild(container);
        }

        const toast = document.createElement('div');
        toast.className = `paradis-toast ${isOnline ? 'online' : 'offline'}`;
        toast.innerHTML = `${isOnline ? '📶' : '🌐'} ${message}`;

        container.appendChild(toast);

        setTimeout(() => {
            toast.remove();
        }, 4000);
    }

    /**
     * Gère l'événement de retour de connexion internet
     */
    function handleOnline() {
        showNetworkToast('Connexion rétablie — Synchronisation Cloud en cours...', true);

        // 1. Déclenche la poussée Push
        if (window.ParadisSync && typeof window.ParadisSync.triggerPushSync === 'function') {
            window.ParadisSync.triggerPushSync(true);
        }

        // 2. Déclenche la fusion Pull LWW
        if (window.ParadisPull && typeof window.ParadisPull.pullAndMergeProgress === 'function') {
            setTimeout(() => window.ParadisPull.pullAndMergeProgress(), 1000);
        }
    }

    /**
     * Gère l'événement de perte de connexion
     */
    function handleOffline() {
        showNetworkToast('Mode hors-ligne activé — Vos données sont sauvegardées dans IndexedDB.', false);

        if (window.ParadisSync && typeof window.ParadisSync.updateSyncBadgeUI === 'function') {
            window.ParadisSync.updateSyncBadgeUI('offline');
        }
    }

    // Écouteurs d'événements réseau
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    console.info('[PARADIS] Moteur de Re-synchronisation Automatique Hors-Ligne initialisé.');
})();
