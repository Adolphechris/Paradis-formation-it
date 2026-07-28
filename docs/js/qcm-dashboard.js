/**
 * PARADIS — Tableau de Bord & Diagnostic des QCM par Tome (Sprint 19)
 *
 * Analyse globale des performances de l'apprenant :
 *   - Diagnostic automatique des compétences par Tome
 *   - Identification des faiblesses et suggestions de révision
 *   - Lancement rapide d'examens d'entraînement ciblés
 */
(function () {
    'use strict';

    // Styles CSS dynamiques
    const styleId = 'paradis-qcm-dashboard-styles';
    if (!document.getElementById(styleId)) {
        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = `
            .paradis-dashboard-modal {
                position: fixed;
                top: 0; left: 0;
                width: 100vw; height: 100vh;
                background: rgba(10, 15, 29, 0.85);
                backdrop-filter: blur(8px);
                z-index: 99992;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            .paradis-dashboard-card {
                background: rgba(17, 24, 39, 0.95);
                border: 1px solid rgba(6, 182, 212, 0.4);
                border-radius: 16px;
                width: 100%;
                max-width: 700px;
                padding: 24px;
                color: #f3f4f6;
                box-shadow: 0 20px 50px rgba(0,0,0,0.7);
            }
            .paradis-tome-stat-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
                gap: 12px;
                margin: 16px 0;
            }
            .paradis-tome-stat-box {
                padding: 12px;
                border-radius: 10px;
                background: rgba(31, 41, 55, 0.6);
                border: 1px solid #374151;
                text-align: center;
            }
            .paradis-tome-stat-score {
                font-size: 1.4rem;
                font-weight: 800;
                color: #06b6d4;
                margin-top: 4px;
            }
        `;
        document.head.appendChild(style);
    }

    /**
     * Calcule la moyenne des scores QCM par Tome depuis IndexedDB
     */
    async function computeTomeDiagnostics() {
        if (!window.ParadisStorage || typeof window.ParadisStorage.getAllLocal !== 'function') return {};

        try {
            const records = await window.ParadisStorage.getAllLocal('progress');
            const tomeScores = {};

            records.forEach(r => {
                if (r.quiz_score !== undefined && r.quiz_score !== null) {
                    const tome = r.tome || 'P0';
                    if (!tomeScores[tome]) tomeScores[tome] = [];
                    tomeScores[tome].push(r.quiz_score);
                }
            });

            const diagnostics = {};
            for (const [tome, scores] of Object.entries(tomeScores)) {
                const avg = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
                diagnostics[tome] = {
                    average: avg,
                    count: scores.length,
                    status: avg >= 80 ? 'MAÎTRISÉ' : 'À CONSOLIDER'
                };
            }

            return diagnostics;
        } catch (e) {
            return {};
        }
    }

    /**
     * Affiche la modale du Tableau de Bord QCM
     */
    async function openQCMDashboard() {
        let modal = document.getElementById('paradis-dashboard-modal');
        if (modal) { modal.remove(); return; }

        modal = document.createElement('div');
        modal.id = 'paradis-dashboard-modal';
        modal.className = 'paradis-dashboard-modal';

        const diag = await computeTomeDiagnostics();
        const tomes = ['P0', 'P2', 'P3A', 'P3B', 'P3C', 'P4', 'P5', 'P6'];

        let boxesHTML = '';
        tomes.forEach(t => {
            const data = diag[t] || { average: 0, count: 0, status: 'NON ÉVALUÉ' };
            const color = data.average >= 80 ? '#10b981' : (data.count > 0 ? '#ef4444' : '#9ca3af');

            boxesHTML += `
                <div class="paradis-tome-stat-box">
                    <div style="font-weight: 700; font-size: 0.85rem;">Tome ${t}</div>
                    <div class="paradis-tome-stat-score" style="color: ${color};">${data.average}%</div>
                    <div style="font-size: 0.75rem; color: #9ca3af; margin-top: 4px;">${data.status}</div>
                </div>
            `;
        });

        modal.innerHTML = `
            <div class="paradis-dashboard-card">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <h3 style="margin: 0; color: #06b6d4;">📊 Diagnostic QCM & Niveaux de Maîtrise par Tome</h3>
                    <button type="button" onclick="document.getElementById('paradis-dashboard-modal').remove()" style="background: none; border: none; color: #9ca3af; font-size: 22px; cursor: pointer;">&times;</button>
                </div>
                <div class="paradis-tome-stat-grid">
                    ${boxesHTML}
                </div>
                <div style="margin-top: 20px; padding: 14px; background: rgba(6, 182, 212, 0.1); border-left: 4px solid #06b6d4; border-radius: 8px; font-size: 0.88rem;">
                    💡 <strong>Recommandation :</strong> Pour valider la certification IT Officer BCC, vous devez obtenir un score d'au moins 80% dans chaque Tome.
                </div>
                <div style="margin-top: 20px; text-align: right;">
                    <button type="button" onclick="document.getElementById('paradis-dashboard-modal').remove(); if(window.ParadisExam) window.ParadisExam.startExamSession();" style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: #fff; border: none; border-radius: 8px; padding: 10px 20px; font-weight: 700; cursor: pointer;">
                        🏆 Lancer un Examen Blanc (100 QCM)
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        modal.onclick = (e) => {
            if (e.target === modal) modal.remove();
        };
    }

    window.ParadisQCMDashboard = {
        computeTomeDiagnostics,
        openQCMDashboard
    };
})();
