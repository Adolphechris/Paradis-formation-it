/**
 * PARADIS — Marque-pages & Favoris (Sprint 14)
 *
 * Permet aux apprenants de marquer les leçons importantes comme favoris (Bookmark) :
 *   - Bouton d'action rapide dans le header de chaque leçon
 *   - Liste globale des favoris accessibles depuis le header ou le profil
 *   - Stockage IndexedDB (Local-First) + Sync Supabase
 */
(function () {
    'use strict';

    // Styles CSS dynamiques pour les Marque-pages
    const styleId = 'paradis-bookmarks-styles';
    if (!document.getElementById(styleId)) {
        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = `
            .paradis-bookmark-btn {
                display: inline-flex;
                align-items: center;
                gap: 6px;
                background: rgba(31, 41, 55, 0.8);
                border: 1px solid rgba(6, 182, 212, 0.3);
                border-radius: 20px;
                padding: 5px 14px;
                font-size: 0.82rem;
                font-weight: 700;
                color: #d1d5db;
                cursor: pointer;
                transition: all 0.2s ease;
                margin-left: 10px;
            }
            .paradis-bookmark-btn:hover {
                border-color: #06b6d4;
                color: #06b6d4;
                transform: translateY(-1px);
            }
            .paradis-bookmark-btn.active {
                background: rgba(245, 158, 11, 0.15);
                border-color: #f59e0b;
                color: #fbbf24;
            }

            /* Badge Header Global */
            .paradis-bookmarks-header-badge {
                display: inline-flex;
                align-items: center;
                gap: 6px;
                padding: 4px 10px;
                border-radius: 12px;
                font-size: 0.78rem;
                font-weight: 600;
                background: rgba(245, 158, 11, 0.1);
                border: 1px solid rgba(245, 158, 11, 0.3);
                color: #fbbf24;
                margin-left: 10px;
                cursor: pointer;
            }

            /* Modale Liste des Favoris */
            .paradis-bookmarks-modal {
                position: fixed;
                top: 0; left: 0;
                width: 100vw; height: 100vh;
                background: rgba(10, 15, 29, 0.85);
                backdrop-filter: blur(8px);
                z-index: 99994;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            .paradis-bookmarks-card {
                background: rgba(17, 24, 39, 0.95);
                border: 1px solid rgba(245, 158, 11, 0.4);
                box-shadow: 0 20px 50px rgba(0, 0, 0, 0.7);
                border-radius: 16px;
                width: 100%;
                max-width: 500px;
                padding: 24px;
                color: #f3f4f6;
            }
            .paradis-bookmarks-list {
                max-height: 320px;
                overflow-y: auto;
                margin-top: 16px;
                display: flex;
                flex-direction: column;
                gap: 8px;
            }
            .paradis-bookmark-item {
                padding: 10px 14px;
                background: rgba(31, 41, 55, 0.6);
                border: 1px solid #374151;
                border-radius: 8px;
                display: flex;
                align-items: center;
                justify-content: space-between;
                text-decoration: none;
                color: #f3f4f6;
                transition: all 0.2s;
            }
            .paradis-bookmark-item:hover {
                border-color: #f59e0b;
                background: rgba(245, 158, 11, 0.1);
            }
        `;
        document.head.appendChild(style);
    }

    /**
     * Détermine les métadonnées de la leçon courante (ex: "jour-01")
     */
    function getCurrentDayMeta() {
        const path = window.location.pathname;
        const match = path.match(/jour-([0-9]{1,2})/i);
        if (!match) return null;
        const num = parseInt(match[1], 10);
        return {
            dayId: `jour-${num < 10 ? '0' + num : num}`,
            dayNumber: num
        };
    }

    /**
     * Injecte le bouton Bookmark en haut de la leçon
     */
    async function injectBookmarkButton() {
        const meta = getCurrentDayMeta();
        if (!meta) return;

        const contentInner = document.querySelector('.md-content__inner');
        if (!contentInner) return;

        const h1 = contentInner.querySelector('h1');
        if (!h1 || document.getElementById('paradis-bookmark-btn')) return;

        const btn = document.createElement('button');
        btn.id = 'paradis-bookmark-btn';
        btn.type = 'button';
        btn.className = 'paradis-bookmark-btn';

        // Vérifie si la leçon est en favoris
        let isBookmarked = false;
        if (window.ParadisStorage && typeof window.ParadisStorage.getLocal === 'function') {
            try {
                const rec = await window.ParadisStorage.getLocal('progress', meta.dayId);
                if (rec && rec.bookmarked) isBookmarked = true;
            } catch (e) {}
        }

        updateButtonUI(btn, isBookmarked);

        btn.onclick = async () => {
            btn.disabled = true;
            const nextState = !isBookmarked;

            if (window.ParadisStorage && typeof window.ParadisStorage.getLocal === 'function') {
                try {
                    let rec = await window.ParadisStorage.getLocal('progress', meta.dayId);
                    if (!rec) {
                        rec = {
                            id: meta.dayId,
                            day_id: meta.dayId,
                            day_number: meta.dayNumber,
                            is_completed: false,
                            bookmarked: nextState
                        };
                    } else {
                        rec.bookmarked = nextState;
                    }

                    await window.ParadisStorage.saveLocal('progress', rec);
                    await window.ParadisStorage.enqueueSync({
                        action: 'UPSERT_PROGRESS',
                        payload: rec
                    });

                    if (window.ParadisSync && typeof window.ParadisSync.triggerPushSync === 'function') {
                        window.ParadisSync.triggerPushSync();
                    }

                    isBookmarked = nextState;
                    updateButtonUI(btn, isBookmarked);
                    updateHeaderBadge();
                } catch (err) {
                    console.error('[Bookmarks] Erreur :', err);
                } finally {
                    btn.disabled = false;
                }
            }
        };

        h1.appendChild(btn);
    }

    function updateButtonUI(btn, isBookmarked) {
        if (isBookmarked) {
            btn.className = 'paradis-bookmark-btn active';
            btn.innerHTML = '🔖 Leçon en Favoris';
        } else {
            btn.className = 'paradis-bookmark-btn';
            btn.innerHTML = '🔖 Ajouter aux Favoris';
        }
    }

    /**
     * Injecte ou met à jour le badge des favoris dans le header
     */
    async function updateHeaderBadge() {
        const headerInner = document.querySelector('.md-header__inner');
        if (!headerInner) return;

        let badge = document.getElementById('paradis-bookmarks-header-badge');
        if (!badge) {
            badge = document.createElement('div');
            badge.id = 'paradis-bookmarks-header-badge';
            badge.className = 'paradis-bookmarks-header-badge';
            headerInner.appendChild(badge);
        }

        let count = 0;
        if (window.ParadisStorage && typeof window.ParadisStorage.getAllLocal === 'function') {
            try {
                const records = await window.ParadisStorage.getAllLocal('progress');
                count = records.filter(r => r.bookmarked).length;
            } catch (e) {}
        }

        badge.innerHTML = `🔖 Favoris (${count})`;
        badge.onclick = openBookmarksModal;
    }

    /**
     * Affiche la modale de tous les marque-pages
     */
    async function openBookmarksModal() {
        let modal = document.getElementById('paradis-bookmarks-modal');
        if (modal) { modal.remove(); return; }

        modal = document.createElement('div');
        modal.id = 'paradis-bookmarks-modal';
        modal.className = 'paradis-bookmarks-modal';

        let itemsHTML = '<div style="color: #9ca3af; text-align: center; padding: 20px;">Aucun favori enregistré.</div>';

        if (window.ParadisStorage && typeof window.ParadisStorage.getAllLocal === 'function') {
            try {
                const records = await window.ParadisStorage.getAllLocal('progress');
                const bookmarked = records.filter(r => r.bookmarked).sort((a, b) => (a.day_number || 0) - (b.day_number || 0));

                if (bookmarked.length > 0) {
                    itemsHTML = bookmarked.map(r => `
                        <a href="../${r.id}/" class="paradis-bookmark-item">
                            <span>📖 <strong>${(r.id || '').toUpperCase()}</strong> — Leçon enregistrée</span>
                            <span style="font-size: 0.8rem; color: #fbbf24;">🔖 Favori</span>
                        </a>
                    `).join('');
                }
            } catch (e) {}
        }

        modal.innerHTML = `
            <div class="paradis-bookmarks-card">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <h3 style="margin: 0; color: #fbbf24;">🔖 Mes Leçons Favorites</h3>
                    <button type="button" onclick="document.getElementById('paradis-bookmarks-modal').remove()" style="background: none; border: none; color: #9ca3af; font-size: 22px; cursor: pointer;">&times;</button>
                </div>
                <div class="paradis-bookmarks-list">
                    ${itemsHTML}
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        modal.onclick = (e) => {
            if (e.target === modal) modal.remove();
        };
    }

    // Initialisation
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            injectBookmarkButton();
            updateHeaderBadge();
        });
    } else {
        injectBookmarkButton();
        updateHeaderBadge();
    }

    window.ParadisBookmarks = {
        injectBookmarkButton,
        updateHeaderBadge,
        openBookmarksModal
    };
})();
