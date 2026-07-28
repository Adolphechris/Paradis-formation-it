/**
 * PARADIS — Gestionnaire de Notes Personnelles par Leçon (Sprint 13)
 *
 * Tiroir latéral (Drawer) pour la prise de notes Markdown sur chaque leçon :
 *   - Auto-sauvegarde locale (IndexedDB objectStore 'notes')
 *   - Synchronisation automatique avec Supabase (table 'notes') via Sync Bridge
 *   - Bouton flottant réactif sur chaque page de leçon (Jour 01 à 45)
 */
(function () {
    'use strict';

    let autoSaveTimer = null;
    let currentDayId = null;

    // Styles CSS dynamiques
    const styleId = 'paradis-notes-styles';
    if (!document.getElementById(styleId)) {
        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = `
            /* Bouton d'ouverture du tiroir de notes */
            .paradis-notes-trigger-btn {
                position: fixed;
                bottom: 25px;
                right: 25px;
                background: linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%);
                color: #ffffff;
                border: none;
                border-radius: 50px;
                padding: 12px 20px;
                font-weight: 700;
                font-size: 0.9rem;
                box-shadow: 0 8px 25px rgba(6, 182, 212, 0.4);
                cursor: pointer;
                z-index: 99980;
                display: flex;
                align-items: center;
                gap: 8px;
                transition: transform 0.2s, box-shadow 0.2s;
            }
            .paradis-notes-trigger-btn:hover {
                transform: translateY(-2px);
                box-shadow: 0 12px 30px rgba(6, 182, 212, 0.6);
            }

            /* Tiroir Latéral (Drawer) */
            .paradis-notes-drawer {
                position: fixed;
                top: 0;
                right: -420px;
                width: 400px;
                height: 100vh;
                background: rgba(17, 24, 39, 0.97);
                border-left: 1px solid rgba(6, 182, 212, 0.3);
                box-shadow: -10px 0 30px rgba(0, 0, 0, 0.7);
                z-index: 99992;
                display: flex;
                flex-direction: column;
                transition: right 0.3s cubic-bezier(0.16, 1, 0.3, 1);
                color: #f3f4f6;
            }
            .paradis-notes-drawer.open {
                right: 0;
            }

            /* Header du Drawer */
            .paradis-notes-header {
                padding: 20px;
                border-bottom: 1px solid #374151;
                display: flex;
                align-items: center;
                justify-content: space-between;
            }
            .paradis-notes-header h3 {
                margin: 0;
                font-size: 1.1rem;
                color: #06b6d4;
                display: flex;
                align-items: center;
                gap: 8px;
            }
            .paradis-notes-close {
                background: transparent;
                border: none;
                color: #9ca3af;
                font-size: 22px;
                cursor: pointer;
            }
            .paradis-notes-close:hover { color: #f3f4f6; }

            /* Contenu / Editeur */
            .paradis-notes-body {
                padding: 20px;
                flex: 1;
                display: flex;
                flex-direction: column;
                gap: 12px;
            }
            .paradis-notes-textarea {
                flex: 1;
                background: rgba(31, 41, 55, 0.8);
                border: 1px solid #374151;
                border-radius: 8px;
                padding: 14px;
                color: #ffffff;
                font-family: monospace, sans-serif;
                font-size: 0.9rem;
                line-height: 1.5;
                resize: none;
                outline: none;
            }
            .paradis-notes-textarea:focus {
                border-color: #06b6d4;
                box-shadow: 0 0 0 2px rgba(6, 182, 212, 0.2);
            }

            /* Status & Actions */
            .paradis-notes-footer {
                padding: 14px 20px;
                border-top: 1px solid #374151;
                display: flex;
                align-items: center;
                justify-content: space-between;
                font-size: 0.8rem;
                color: #9ca3af;
            }
            .paradis-notes-status {
                font-style: italic;
            }
        `;
        document.head.appendChild(style);
    }

    /**
     * Détermine le day_id courant depuis l'URL (ex: "jour-01")
     */
    function getCurrentDayId() {
        const path = window.location.pathname;
        const match = path.match(/jour-([0-9]{1,2})/i);
        if (!match) return null;
        const num = parseInt(match[1], 10);
        return `jour-${num < 10 ? '0' + num : num}`;
    }

    /**
     * Crée l'élément HTML du tiroir et du bouton d'ouverture
     */
    function injectNotesUI() {
        currentDayId = getCurrentDayId();
        if (!currentDayId) return; // Ne pas afficher hors leçons

        if (document.getElementById('paradis-notes-trigger')) return;

        // 1. Bouton Flottant
        const trigger = document.createElement('button');
        trigger.id = 'paradis-notes-trigger';
        trigger.className = 'paradis-notes-trigger-btn';
        trigger.innerHTML = `📝 Mes Notes (${currentDayId.toUpperCase()})`;
        trigger.onclick = toggleDrawer;
        document.body.appendChild(trigger);

        // 2. Tiroir Latéral (Drawer)
        const drawer = document.createElement('div');
        drawer.id = 'paradis-notes-drawer';
        drawer.className = 'paradis-notes-drawer';
        drawer.innerHTML = `
            <div class="paradis-notes-header">
                <h3>📝 Notes — ${currentDayId.toUpperCase()}</h3>
                <button type="button" class="paradis-notes-close" id="paradis-notes-close-btn">&times;</button>
            </div>
            <div class="paradis-notes-body">
                <textarea id="paradis-notes-input" class="paradis-notes-textarea" placeholder="Rédigez vos notes personnelles pour cette leçon... (Format Markdown supporté)"></textarea>
            </div>
            <div class="paradis-notes-footer">
                <span id="paradis-notes-status" class="paradis-notes-status">Prêt</span>
                <span>💾 IndexedDB + Cloud</span>
            </div>
        `;
        document.body.appendChild(drawer);

        document.getElementById('paradis-notes-close-btn').onclick = closeDrawer;

        // Écouteur pour auto-sauvegarde (Debounce 800ms)
        const textarea = document.getElementById('paradis-notes-input');
        textarea.addEventListener('input', () => {
            updateStatus('Écriture...');
            if (autoSaveTimer) clearTimeout(autoSaveTimer);
            autoSaveTimer = setTimeout(saveCurrentNotes, 800);
        });

        // Charger les notes enregistrées
        loadNotesForDay(currentDayId);
    }

    function toggleDrawer() {
        const drawer = document.getElementById('paradis-notes-drawer');
        if (drawer) drawer.classList.toggle('open');
    }

    function closeDrawer() {
        const drawer = document.getElementById('paradis-notes-drawer');
        if (drawer) drawer.classList.remove('open');
    }

    function updateStatus(msg) {
        const statusEl = document.getElementById('paradis-notes-status');
        if (statusEl) statusEl.textContent = msg;
    }

    /**
     * Charge les notes depuis IndexedDB (ou Supabase)
     */
    async function loadNotesForDay(dayId) {
        const textarea = document.getElementById('paradis-notes-input');
        if (!textarea) return;

        if (window.ParadisStorage && typeof window.ParadisStorage.getLocal === 'function') {
            try {
                const noteRecord = await window.ParadisStorage.getLocal('notes', dayId);
                if (noteRecord && noteRecord.content) {
                    textarea.value = noteRecord.content;
                    updateStatus('Notes chargées');
                    return;
                }
            } catch (err) {
                console.warn('[NotesDrawer] Erreur chargement local :', err);
            }
        }

        updateStatus('Aucune note enregistrée');
    }

    /**
     * Sauvegarde les notes dans IndexedDB et enclenche la sync Cloud
     */
    async function saveCurrentNotes() {
        if (!currentDayId) return;

        const textarea = document.getElementById('paradis-notes-input');
        if (!textarea) return;

        const content = textarea.value;

        if (window.ParadisStorage && typeof window.ParadisStorage.saveLocal === 'function') {
            try {
                const payload = {
                    day_id: currentDayId,
                    content: content,
                    updated_at: new Date().toISOString()
                };

                // 1. Sauvegarde IndexedDB local-first
                await window.ParadisStorage.saveLocal('notes', payload);

                // 2. Mise en file d'attente pour sync Cloud
                await window.ParadisStorage.enqueueSync({
                    action: 'SAVE_NOTE',
                    payload: payload
                });

                // 3. Déclenche le push sync si en ligne
                if (window.ParadisSync && typeof window.ParadisSync.triggerPushSync === 'function') {
                    window.ParadisSync.triggerPushSync();
                }

                updateStatus('Sauvegardé !');
            } catch (err) {
                console.error('[NotesDrawer] Erreur sauvegarde :', err);
                updateStatus('⚠️ Erreur de sauvegarde');
            }
        }
    }

    // Initialisation
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            injectNotesUI();
        });
    } else {
        injectNotesUI();
    }

    window.ParadisNotes = {
        injectNotesUI,
        toggleDrawer,
        loadNotesForDay,
        saveCurrentNotes
    };
})();
