/**
 * PARADIS — Générateur de Portfolio & CV Officier IT BCC (Sprint 24)
 *
 * Génère une fiche de compétences et portfolio valorisable :
 *   - Synthèse des 45 jours d'apprentissage et projets validés
 *   - Badges de certification et compétences techniques
 *   - Exportation / Impression pour les recruteurs du secteur bancaire
 */
(function () {
    'use strict';

    // Styles CSS dynamiques
    const styleId = 'paradis-portfolio-styles';
    if (!document.getElementById(styleId)) {
        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = `
            .paradis-portfolio-modal {
                position: fixed;
                top: 0; left: 0;
                width: 100vw; height: 100vh;
                background: rgba(10, 15, 29, 0.92);
                backdrop-filter: blur(8px);
                z-index: 99995;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                color: #f3f4f6;
            }
            .paradis-portfolio-paper {
                background: rgba(17, 24, 39, 0.98);
                border: 1px solid rgba(6, 182, 212, 0.4);
                border-radius: 16px;
                width: 100%;
                max-width: 750px;
                padding: 30px;
                box-shadow: 0 25px 60px rgba(0,0,0,0.8);
                max-height: 85vh;
                overflow-y: auto;
            }
            .paradis-skills-grid {
                display: grid;
                grid-template-columns: repeat(2, 1fr);
                gap: 14px;
                margin-top: 16px;
            }
            .paradis-skill-card {
                padding: 12px;
                background: rgba(31, 41, 55, 0.6);
                border: 1px solid #374151;
                border-radius: 10px;
                font-size: 0.85rem;
            }
        `;
        document.head.appendChild(style);
    }

    async function openPortfolioModal() {
        let modal = document.getElementById('paradis-portfolio-modal');
        if (modal) { modal.remove(); return; }

        let studentName = 'Apprenant PARADIS';
        let targetRole = 'Officier IT Bancaire';

        if (window.ParadisStorage && typeof window.ParadisStorage.getLocal === 'function') {
            try {
                const profile = await window.ParadisStorage.getLocal('user_profile', 'current_user');
                if (profile) {
                    if (profile.display_name) studentName = profile.display_name;
                    if (profile.target_role) targetRole = profile.target_role;
                }
            } catch (e) {}
        }

        modal = document.createElement('div');
        modal.id = 'paradis-portfolio-modal';
        modal.className = 'paradis-portfolio-modal';

        modal.innerHTML = `
            <div class="paradis-portfolio-paper">
                <div style="display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 1px solid #374151; padding-bottom: 16px;">
                    <div>
                        <h2 style="margin: 0; color: #06b6d4;">💼 Portfolio IT & Compétences BCC</h2>
                        <div style="font-size: 1.1rem; font-weight: 700; color: #ffffff; margin-top: 4px;">${studentName}</div>
                        <div style="font-size: 0.85rem; color: #9ca3af;">Profil : ${targetRole}</div>
                    </div>
                    <button type="button" onclick="document.getElementById('paradis-portfolio-modal').remove()" style="background: none; border: none; color: #9ca3af; font-size: 24px; cursor: pointer;">&times;</button>
                </div>

                <div style="margin-top: 20px;">
                    <h4 style="margin: 0 0 10px 0; color: #10b981;">🛡️ Domaines d'Expertise IT Certifiés</h4>
                    <div class="paradis-skills-grid">
                        <div class="paradis-skill-card">
                            <strong>🖥️ Support & Maintenance N1/N2</strong>
                            <div style="color: #9ca3af; font-size: 0.8rem; margin-top: 4px;">Dépannage matériel, gestion de parc, déploiement automatisé.</div>
                        </div>
                        <div class="paradis-skill-card">
                            <strong>🌐 Administration Réseaux & Sécurité</strong>
                            <div style="color: #9ca3af; font-size: 0.8rem; margin-top: 4px;">Subnetting IPv4/IPv6, VPN, VLANs, pare-feu & règles Zero Trust.</div>
                        </div>
                        <div class="paradis-skill-card">
                            <strong>💾 Data & SQL Bancaire</strong>
                            <div style="color: #9ca3af; font-size: 0.8rem; margin-top: 4px;">Requêtes complexes, modélisation de bases de données & sauvegardes.</div>
                        </div>
                        <div class="paradis-skill-card">
                            <strong>🏛️ Governance & Normes BCC</strong>
                            <div style="color: #9ca3af; font-size: 0.8rem; margin-top: 4px;">Plan de Continuité d'Activité (PCA), conformité & audits réglementaires.</div>
                        </div>
                    </div>
                </div>

                <div style="margin-top: 24px; text-align: right;">
                    <button type="button" onclick="window.print()" style="background: linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%); color: #fff; border: none; border-radius: 8px; padding: 10px 20px; font-weight: 700; cursor: pointer;">
                        🖨️ Exporter mon Portfolio (PDF)
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        modal.onclick = (e) => {
            if (e.target === modal) modal.remove();
        };
    }

    window.ParadisPortfolio = {
        openPortfolioModal
    };
})();
