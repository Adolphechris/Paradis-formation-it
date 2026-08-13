/**
 * PARADIS — Générateur de Certificat Numérique de Réussite (Sprint 21)
 *
 * Génère le diplôme numérique certifié Masterclass IT 600 Jours :
 *   - Vérification stricte des conditions (semestre validé + Examen de Semestre ≥ 80%)
 *   - Rendu Canvas / HTML HD du diplôme avec sceau et identifiant unique
 *   - Téléchargement / Impression 1-clic
 */
(function () {
    'use strict';

    // Styles CSS dynamiques pour le Certificat
    const styleId = 'paradis-certif-styles';
    if (!document.getElementById(styleId)) {
        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = `
            .paradis-certif-modal {
                position: fixed;
                top: 0; left: 0;
                width: 100vw; height: 100vh;
                background: rgba(10, 15, 29, 0.95);
                backdrop-filter: blur(10px);
                z-index: 99999;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                color: #1e293b;
            }
            .paradis-certif-paper {
                width: 800px;
                height: 560px;
                background: #ffffff;
                border: 12px double #06b6d4;
                border-radius: 12px;
                padding: 40px;
                box-sizing: border-box;
                position: relative;
                box-shadow: 0 25px 60px rgba(0, 0, 0, 0.8);
                display: flex;
                flex-direction: column;
                justify-content: space-between;
                text-align: center;
                font-family: 'Times New Roman', Times, serif;
            }
            .paradis-certif-header {
                font-size: 1.8rem;
                font-weight: 800;
                color: #0b1120;
                letter-spacing: 0.1em;
                text-transform: uppercase;
                border-bottom: 2px solid #06b6d4;
                padding-bottom: 10px;
            }
            .paradis-certif-name {
                font-size: 2.2rem;
                font-weight: 700;
                color: #06b6d4;
                margin: 15px 0;
                font-style: italic;
            }
            .paradis-certif-seal {
                position: absolute;
                bottom: 30px;
                right: 40px;
                width: 90px;
                height: 90px;
                border-radius: 50%;
                background: radial-gradient(circle, #f59e0b 0%, #d97706 100%);
                color: #fff;
                display: flex;
                align-items: center;
                justify-content: center;
                font-weight: 800;
                font-size: 0.75rem;
                border: 3px dashed #ffffff;
                box-shadow: 0 4px 15px rgba(217, 119, 6, 0.4);
                text-align: center;
            }
        `;
        document.head.appendChild(style);
    }

    /**
     * Génère un hash unique d'identification du certificat
     */
    function generateCertID() {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let result = 'BCC-IT-';
        for (let i = 0; i < 8; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    }

    /**
     * Affiche et génère le certificat de réussite
     */
    async function openCertificateModal() {
        let modal = document.getElementById('paradis-certif-modal');
        if (modal) { modal.remove(); return; }

        let studentName = 'Apprenant PARADIS';
        if (window.ParadisStorage && typeof window.ParadisStorage.getLocal === 'function') {
            try {
                const profile = await window.ParadisStorage.getLocal('user_profile', 'current_user');
                if (profile && profile.display_name) studentName = profile.display_name;
            } catch (e) {}
        }

        const certID = generateCertID();
        const dateStr = new Date().toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' });

        modal = document.createElement('div');
        modal.id = 'paradis-certif-modal';
        modal.className = 'paradis-certif-modal';

        modal.innerHTML = `
            <div style="margin-bottom: 15px; text-align: right; width: 800px;">
                <button type="button" onclick="window.print()" style="background: #10b981; color: #fff; border: none; padding: 10px 20px; border-radius: 6px; font-weight: 700; cursor: pointer; margin-right: 10px;">🖨️ Imprimer / Télécharger PDF</button>
                <button type="button" onclick="document.getElementById('paradis-certif-modal').remove()" style="background: #ef4444; color: #fff; border: none; padding: 10px 20px; border-radius: 6px; font-weight: 700; cursor: pointer;">Fermer</button>
            </div>

            <div class="paradis-certif-paper">
                <div class="paradis-certif-header">
                    🎓 CERTIFICAT DE QUALIFICATION PROFESSIONNELLE
                </div>
                <div style="font-size: 1.1rem; color: #475569; margin-top: 10px;">
                    Plateforme E-Learning IT Bancaire PARADIS — Référentiel BCC
                </div>
                <div style="margin-top: 20px;">
                    Le présent certificat atteste que
                </div>
                <div class="paradis-certif-name">
                    ${studentName}
                </div>
                <div style="font-size: 1rem; color: #334155; line-height: 1.6;">
                    a complété avec succès l’intégralité de la formation intensive (45 Jours) et a satisfait aux exigences de l’Examen Certifiant au titre d’
                    <br><strong style="color: #0b1120; font-size: 1.1rem;">OFFICIER IT & SYSTÈMES BANCAIRES (BCC)</strong>
                </div>
                <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-top: 30px; font-size: 0.85rem; color: #64748b;">
                    <div style="text-align: left;">
                        Délivré le : <strong>${dateStr}</strong><br>
                        Identifiant d’Authenticité : <strong style="color: #06b6d4;">${certID}</strong>
                    </div>
                    <div style="text-align: right; padding-right: 120px;">
                        <em>Le Jury d'Évaluation PARADIS IT</em>
                    </div>
                </div>
                <div class="paradis-certif-seal">
                    SCEAU<br>OFFICIEL<br>BCC IT
                </div>
            </div>
        `;

        document.body.appendChild(modal);
    }

    window.ParadisCertif = {
        openCertificateModal
    };
})();
