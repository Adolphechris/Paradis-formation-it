/**
 * PARADIS — Suivi de Progression par Compétence & Matrice Radar (Sprint 25)
 *
 * Visualisation cartographique de l'évolution des compétences :
 *   - 6 axes de compétences (Support N1/N2, SysAdmin, Dev/Algo, Data/SQL, SecOps, BCC Governance)
 *   - Rendu SVG réactif autonome sans dépendance lourde externe
 *   - Intégration dans le profil apprenant
 */
(function () {
    'use strict';

    // Styles CSS dynamiques
    const styleId = 'paradis-radar-styles';
    if (!document.getElementById(styleId)) {
        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = `
            .paradis-radar-card {
                background: rgba(17, 24, 39, 0.95);
                border: 1px solid rgba(6, 182, 212, 0.4);
                border-radius: 14px;
                padding: 20px;
                color: #f3f4f6;
                text-align: center;
            }
            .paradis-radar-svg {
                max-width: 320px;
                max-height: 320px;
                margin: 0 auto;
            }
        `;
        document.head.appendChild(style);
    }

    /**
     * Génère un rendu SVG autónome d'un Radar 6 axes
     */
    function renderRadarSVG(scores) {
        const categories = [
            { key: 'supportBureautique', label: 'Support N1/N2' },
            { key: 'systemesReseaux', label: 'Systèmes & Réseaux' },
            { key: 'devAlgo', label: 'Dev & Algo' },
            { key: 'dataSql', label: 'Data & SQL' },
            { key: 'cloudSecurity', label: 'SecOps & Cloud' },
            { key: 'bankingGovernance', label: 'Normes BCC' }
        ];

        const size = 300;
        const center = size / 2;
        const radius = 100;
        const numAxes = categories.length;

        let points = [];
        let axisLines = '';
        let labelsHTML = '';

        categories.forEach((cat, i) => {
            const angle = (Math.PI * 2 / numAxes) * i - Math.PI / 2;
            const value = (scores[cat.key] || 40) / 100; // Val par défaut 40%
            const r = radius * value;

            const x = center + r * Math.cos(angle);
            const y = center + r * Math.sin(angle);
            points.push(`${x},${y}`);

            // Axe
            const ax = center + radius * Math.cos(angle);
            const ay = center + radius * Math.sin(angle);
            axisLines += `<line x1="${center}" y1="${center}" x2="${ax}" y2="${ay}" stroke="#374151" stroke-width="1" />`;

            // Label
            const lx = center + (radius + 25) * Math.cos(angle);
            const ly = center + (radius + 15) * Math.sin(angle);
            labelsHTML += `<text x="${lx}" y="${ly}" fill="#9ca3af" font-size="10" font-weight="bold" text-anchor="middle">${cat.label}</text>`;
        });

        const polygonPoints = points.join(' ');

        return `
            <svg class="paradis-radar-svg" viewBox="0 0 ${size} ${size}">
                <!-- Toiles concentriques -->
                <circle cx="${center}" cy="${center}" r="${radius * 0.25}" fill="none" stroke="#374151" stroke-dasharray="2,2"/>
                <circle cx="${center}" cy="${center}" r="${radius * 0.5}" fill="none" stroke="#374151" stroke-dasharray="2,2"/>
                <circle cx="${center}" cy="${center}" r="${radius * 0.75}" fill="none" stroke="#374151" stroke-dasharray="2,2"/>
                <circle cx="${center}" cy="${center}" r="${radius}" fill="none" stroke="#4b5563"/>

                ${axisLines}
                <polygon points="${polygonPoints}" fill="rgba(6, 182, 212, 0.25)" stroke="#06b6d4" stroke-width="2"/>
                ${labelsHTML}
            </svg>
        `;
    }

    /**
     * Calcule et affiche le composant Radar de progression
     */
    async function renderRadarWidget(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        let scores = {
            supportBureautique: 60,
            systemesReseaux: 50,
            devAlgo: 40,
            dataSql: 55,
            cloudSecurity: 45,
            bankingGovernance: 65
        };

        if (window.ParadisProgress && typeof window.ParadisProgress.computeRadar === 'function') {
            try {
                const records = await window.ParadisStorage.getAllLocal('progress');
                scores = window.ParadisProgress.computeRadar(records);
            } catch (e) {}
        }

        container.innerHTML = `
            <div class="paradis-radar-card">
                <h4 style="margin: 0 0 10px 0; color: #06b6d4;">📊 Matrice de Compétences Spatiotemporelle</h4>
                ${renderRadarSVG(scores)}
            </div>
        `;
    }

    window.ParadisRadarSkill = {
        renderRadarSVG,
        renderRadarWidget
    };
})();
