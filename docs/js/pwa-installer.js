/**
 * PARADIS — PWA Installer & Service Worker Registration (Sprint 31)
 *
 * Enregistre le Service Worker et propose l'installation de l’application sur Mobile/Desktop.
 */
(function () {
    'use strict';

    let deferredPrompt = null;

    // Enregistrement du Service Worker
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('./sw.js')
                .then(() => console.info('[PWA] Service Worker enregistré avec succès.'))
                .catch((err) => console.warn('[PWA] Échec enregistrement SW :', err));
        });
    }

    // Écoute de l'événement d'installation PWA
    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredPrompt = e;
        showInstallBanner();
    });

    function showInstallBanner() {
        const headerInner = document.querySelector('.md-header__inner');
        if (!headerInner || document.getElementById('paradis-pwa-install-btn')) return;

        const btn = document.createElement('button');
        btn.id = 'paradis-pwa-install-btn';
        btn.type = 'button';
        btn.style.cssText = `
            background: rgba(6, 182, 212, 0.15);
            border: 1px solid rgba(6, 182, 212, 0.4);
            color: #06b6d4;
            border-radius: 16px;
            padding: 4px 12px;
            font-size: 0.78rem;
            font-weight: 700;
            margin-left: 10px;
            cursor: pointer;
        `;
        btn.innerHTML = '📲 Installer l’App PWA';

        btn.onclick = () => {
            if (deferredPrompt) {
                deferredPrompt.prompt();
                deferredPrompt.userChoice.then(() => {
                    deferredPrompt = null;
                    btn.remove();
                });
            }
        };

        headerInner.appendChild(btn);
    }

    window.ParadisPWA = {
        showInstallBanner
    };
})();
