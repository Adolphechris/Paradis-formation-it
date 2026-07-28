/**
 * PARADIS — Historique & Re-tentatives QCM (Sprint 18)
 *
 * Gère le journal d'historique des QCM et examens :
 *   - Consultation de l'historique complet depuis IndexedDB ('quiz_attempts')
 *   - Calcul des scores moyens par tome et détection des notions à consolider
 *   - Re-tentative ciblée des QCM échoués (< 80%)
 */
(function () {
    'use strict';

    // Styles CSS dynamiques pour l'historique
    const styleId = 'paradis-qcm-history-styles';
    if (!document.getElementById(styleId)) {
        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = `
            .paradis-history-modal {
                position: fixed;
                top: 0; left: 0;
                width: 100vw; height: 100vh;
                background: rgba(10, 15, 29, 0.85);
                backdrop-filter: blur(8px);
                z-index: 99993;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            .paradis-history-card {
                background: rgba(17, 24, 39, 0.95);
                border: 1px solid rgba(6, 182, 212, 0.4);
                border-radius: 16px;
                width: 100%;
                max-width: 650px;
                padding: 24px;
                color: #f3f4f6;
                box-shadow: 0 20px 50px rgba(0,0,0,0.7);
            }
            .paradis-history-item {
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 12px;
                border-radius: 8px;
                background: rgba(31, 41, 55, 0.6);
                border: 1px solid #374151;
                margin-bottom: 8px;
                font-size: 0.88rem;
            }
            .paradis-history-badge {
                padding: 4px 10px;
                border-radius: 12px;
                font-weight: 700;
                font-size: 0.8rem;
            }
            .paradis-history-badge.passed {
                background: rgba(16, 185, 129, 0.2);
                color: #6ee7b7;
                border: 1px solid #10b981;
            }
            .paradis-history-badge.failed {
                background: rgba(239, 68, 68, 0.2);
                color: #fca5a5;
                border: 1px solid #ef4444;
            }
        `;
        document.head.appendChild(style);
    }

    /**
     * Charge l'historique complet des tentatives depuis IndexedDB
     */
    async function getHistory() {
        if (!window.ParadisStorage || typeof window.ParadisStorage.getAllLocal !== 'function') return [];
        try {
            return await window.ParadisStorage.getAllLocal('quiz_attempts');
        } catch (e) {
            return [];
        }
    }

    /**
     * Affiche la modale de suivi d'historique QCM
     */
    async function openHistoryModal() {
        let modal = document.getElementById('paradis-history-modal');
        if (modal) { modal.remove(); return; }

        modal = document.createElement('div');
        modal.id = 'paradis-history-modal';
        modal.className = 'paradis-history-modal';

        const attempts = await getHistory();
        let listHTML = '<div style="color: #9ca3af; text-align: center; padding: 20px;">Aucune tentative enregistrée.</div>';

        if (attempts.length > 0) {
            const sorted = attempts.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
            listHTML = sorted.map(item => {
                const dateStr = item.timestamp ? new Date(item.timestamp).toLocaleString('fr-FR') : 'Date inconnue';
                const statusClass = item.passed ? 'passed' : 'failed';
                const title = item.type === 'EXAM_BLANC_BCC' ? '🏆 Examen Blanc BCC (100 QCM)' : `🧪 QCM ${(item.day_id || '').toUpperCase()}`;

                return `
                    <div class="paradis-history-item">
                        <div>
                            <div><strong>${title}</strong></div>
                            <div style="font-size: 0.78rem; color: #9ca3af;">Passé le : ${dateStr}</div>
                        </div>
                        <div style="display: flex; align-items: center; gap: 12px;">
                            <span class="paradis-history-badge ${statusClass}">Score: ${item.score}%</span>
                            ${item.day_id ? `<a href="../${item.day_id}/" style="color: #06b6d4; text-decoration: none; font-weight: 700;">🔄 Refaire</a>` : ''}
                        </div>
                    </div>
                `;
            }).join('');
        }

        modal.innerHTML = `
            <div class="paradis-history-card">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
                    <h3 style="margin: 0; color: #06b6d4;">📊 Historique des Évaluations & QCM</h3>
                    <button type="button" onclick="document.getElementById('paradis-history-modal').remove()" style="background: none; border: none; color: #9ca3af; font-size: 22px; cursor: pointer;">&times;</button>
                </div>
                <div style="max-height: 380px; overflow-y: auto;">
                    ${listHTML}
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        modal.onclick = (e) => {
            if (e.target === modal) modal.remove();
        };
    }

    window.ParadisQCMHistory = {
        getHistory,
        openHistoryModal
    };
})();
