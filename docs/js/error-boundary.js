/**
 * PARADIS — Gestion Globale des Erreurs JS (Error Boundary) (Sprint 36)
 *
 * Explication du script :
 *   Ce module installe un filet de sécurité applicatif global couvrant
 *   TOUS les modules PARADIS chargés sur la page.
 *
 *   Mécanismes :
 *     1. window.onerror           → capture les erreurs JS synchrones non gérées
 *     2. window.onunhandledrejection → capture les Promises rejetées silencieusement
 *
 *   Pour chaque erreur capturée :
 *     a) Affiche un Toast discret (non-bloquant, coin inférieur droit) indiquant
 *        qu'une anomalie a été détectée, sans interrompre la session de l'apprenant.
 *     b) Enregistre une entrée structurée dans IndexedDB (store "error_log")
 *        avec : timestamp, message, source, ligne, colonne, stack trace.
 *        Cela permet un audit des erreurs à distance depuis le Dashboard Analytics.
 *     c) Tente un basculement en mode dégradé local si Supabase ou IndexedDB
 *        ne répond pas (appel window.ParadisStorage.setOfflineMode(true)).
 *
 *   Exposition : window.ParadisErrors.getLogs() retourne tous les logs en mémoire.
 *   Ce module doit être le PREMIER chargé après supabase-config.js dans mkdocs.yml.
 */
(function () {
    'use strict';

    // --- Stockage en mémoire des erreurs (session courante) ---
    const errorLog = [];

    // --- CSS du Toast d'erreur ---
    const styleId = 'paradis-error-styles';
    if (!document.getElementById(styleId)) {
        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = `
            .paradis-error-toast {
                position: fixed;
                bottom: 20px;
                right: 20px;
                z-index: 99999;
                background: rgba(127, 29, 29, 0.95);
                border: 1px solid #ef4444;
                border-radius: 10px;
                padding: 10px 14px;
                color: #fecaca;
                font-size: 0.82rem;
                font-weight: 600;
                max-width: 320px;
                display: flex;
                align-items: flex-start;
                gap: 8px;
                box-shadow: 0 8px 24px rgba(0,0,0,0.6);
                animation: paradisErrSlide 0.3s cubic-bezier(0.16,1,0.3,1);
            }
            @keyframes paradisErrSlide {
                from { transform: translateX(30px); opacity: 0; }
                to   { transform: translateX(0);    opacity: 1; }
            }
            .paradis-error-toast-msg {
                flex: 1;
                line-height: 1.4;
            }
            .paradis-error-toast-close {
                cursor: pointer;
                font-size: 16px;
                color: #f87171;
                flex-shrink: 0;
                background: none;
                border: none;
                padding: 0;
            }
        `;
        document.head.appendChild(style);
    }

    // --- Affichage du Toast discret ---
    function showErrorToast(message) {
        // Ne pas spammer : max 1 toast à la fois
        if (document.querySelector('.paradis-error-toast')) return;

        const toast = document.createElement('div');
        toast.className = 'paradis-error-toast';
        toast.role = 'alert';
        toast.innerHTML = `
            <span>⚠️</span>
            <div class="paradis-error-toast-msg">
                <strong>Anomalie détectée</strong><br>
                <span style="font-weight:400; font-size:0.78rem; color:#fca5a5;">${message}</span>
            </div>
            <button class="paradis-error-toast-close" title="Fermer">&times;</button>
        `;

        toast.querySelector('.paradis-error-toast-close').onclick = () => toast.remove();
        document.body?.appendChild(toast);

        setTimeout(() => toast?.remove(), 6000);
    }

    // --- Enregistrement dans IndexedDB ---
    function persistToIndexedDB(entry) {
        if (!window.ParadisStorage) return;
        try {
            window.ParadisStorage.setItem('error_log_' + entry.timestamp, JSON.stringify(entry))
                .catch(() => {}); // Silencieux
        } catch (_) { /* Silencieux */ }
    }

    // --- Logique centrale de traitement d'une erreur ---
    function handleError(message, source, lineno, colno, stack) {
        // Ignorer les erreurs de scripts tiers (CDN, extensions navigateur)
        if (source && !source.includes(window.location.hostname) && !source.includes('paradis')) {
            return;
        }

        const entry = {
            timestamp: new Date().toISOString(),
            message: String(message).slice(0, 200),
            source: String(source || '').slice(0, 100),
            lineno,
            colno,
            stack: String(stack || '').slice(0, 500),
            url: window.location.pathname,
        };

        errorLog.push(entry);

        // Afficher le toast (message raccourci)
        const shortMsg = String(message).slice(0, 80) + (String(message).length > 80 ? '…' : '');
        showErrorToast(shortMsg);

        // Persister en IndexedDB
        persistToIndexedDB(entry);

        // Tentative de basculement mode dégradé si erreur Supabase
        if (String(message).toLowerCase().includes('supabase') || String(message).toLowerCase().includes('fetch')) {
            if (window.ParadisStorage?.setOfflineMode) {
                window.ParadisStorage.setOfflineMode(true);
            }
        }
    }

    // --- 1. Erreurs JS synchrones ---
    window.onerror = function (message, source, lineno, colno, error) {
        handleError(message, source, lineno, colno, error?.stack);
        return false; // Ne pas supprimer le comportement natif
    };

    // --- 2. Promises rejetées non gérées ---
    window.addEventListener('unhandledrejection', function (event) {
        const reason = event.reason;
        const message = reason?.message || String(reason) || 'Promise rejetée';
        const stack   = reason?.stack || '';
        handleError(message, 'Promise', 0, 0, stack);
    });

    // --- API publique ---
    window.ParadisErrors = {
        /**
         * Retourne tous les logs d'erreurs de la session courante.
         * @returns {Array} Liste d'erreurs enregistrées
         */
        getLogs: () => [...errorLog],

        /**
         * Vide les logs en mémoire.
         */
        clearLogs: () => { errorLog.length = 0; },
    };

    console.info('[PARADIS] Error Boundary initialisé — couverture globale active.');
})();
