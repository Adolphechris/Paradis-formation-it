/**
 * PARADIS — Paliers d'Employabilité & Jauge de Compétences (Sprint 12)
 *
 * Calcule et affiche la qualification professionnelle de l'apprenant selon 12 paliers (1 par semestre) :
 *   S1  🔴  Socle IT — Environnement, Outils, Linux de base (J001-J050)
 *   S2  🟠  Technicien Systèmes & Réseaux (J051-J100)
 *   S3  🟡  Développeur Python & SQL (J101-J150)
 *   S4  🟢  Administrateur Cloud & DevOps (J151-J200)
 *   S5  🟣  Ingénieur Sécurité & Pentest (J201-J250)
 *   S6  🔵  Architecte Cloud & Infrastructure (J251-J300)
 *   S7  🟤  Expert Red Team & DevSecOps (J301-J350)
 *   S8  🯤  Analyste SOC & Blue Team (J351-J400)
 *   S9  🟠  Spécialiste Cryptographie & PKI (J401-J450)
 *   S10 🟡  Expert DFIR & Reverse Engineering (J451-J500)
 *   S11 🟢  Ingénieur IA/ML & MLOps (J501-J550)
 *   S12 🏆  Architecte Master IT — Capstone & GRC (J551-J600)
 */
(function () {
    'use strict';

    const PALIERS = [
        { level: 1, name: 'Socle IT', minDays: 0,   maxDays: 50,  color: '#ef4444', icon: '🔴', role: 'Support N1 / Technicien Desktop' },
        { level: 2, name: 'Technicien Systèmes & Réseaux', minDays: 51, maxDays: 100, color: '#f97316', icon: '🟠', role: 'Admin Réseaux Junior' },
        { level: 3, name: 'Développeur Python & SQL', minDays: 101, maxDays: 150, color: '#eab308', icon: '🟡', role: 'Développeur Back-End / Analyste Data' },
        { level: 4, name: 'Administrateur Cloud & DevOps', minDays: 151, maxDays: 200, color: '#22c55e', icon: '🟢', role: 'Cloud Engineer / SRE Junior' },
        { level: 5, name: 'Ingénieur Sécurité & Pentest', minDays: 201, maxDays: 250, color: '#06b6d4', icon: '🟣', role: 'Pen Tester / Security Engineer' },
        { level: 6, name: 'Architecte Cloud & Infrastructure', minDays: 251, maxDays: 300, color: '#3b82f6', icon: '🔵', role: 'Cloud Architect / Solutions Architect' },
        { level: 7, name: 'Expert Red Team & DevSecOps', minDays: 301, maxDays: 350, color: '#8b5cf6', icon: '🟤', role: 'Red Team Engineer / DevSecOps Lead' },
        { level: 8, name: 'Analyste SOC & Blue Team', minDays: 351, maxDays: 400, color: '#ec4899', icon: '🯤', role: 'SOC Analyst L2-L3 / CSIRT' },
        { level: 9, name: 'Spécialiste Cryptographie & PKI', minDays: 401, maxDays: 450, color: '#f59e0b', icon: '🟠', role: 'Cryptographer / Security Architect' },
        { level: 10, name: 'Expert DFIR & Reverse Engineering', minDays: 451, maxDays: 500, color: '#10b981', icon: '🟡', role: 'DFIR Analyst / Malware Analyst' },
        { level: 11, name: 'Ingénieur IA/ML & MLOps', minDays: 501, maxDays: 550, color: '#6366f1', icon: '🟢', role: 'ML Engineer / AI Security Researcher' },
        { level: 12, name: 'Architecte Master IT', minDays: 551, maxDays: 600, color: '#f59e0b', icon: '🏆', role: 'CISO / Lead Architect / Expert GRC' }
    ];

    // Injection CSS dynamique
    const styleId = 'paradis-employability-styles';
    if (!document.getElementById(styleId)) {
        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = `
            .paradis-employability-badge {
                display: inline-flex;
                align-items: center;
                gap: 6px;
                padding: 4px 12px;
                border-radius: 16px;
                font-size: 0.78rem;
                font-weight: 700;
                margin-left: 10px;
                background: rgba(17, 24, 39, 0.8);
                border: 1px solid rgba(6, 182, 212, 0.3);
                color: #f3f4f6;
                cursor: pointer;
                transition: all 0.3s;
            }
            .paradis-employability-badge:hover {
                transform: translateY(-1px);
                box-shadow: 0 4px 12px rgba(6, 182, 212, 0.2);
            }

            /* Carte / Jauge globale de compétences */
            .paradis-employability-card {
                background: rgba(17, 24, 39, 0.95);
                border: 1px solid rgba(6, 182, 212, 0.3);
                border-radius: 12px;
                padding: 20px;
                margin: 20px 0;
                color: #f3f4f6;
            }
            .paradis-employability-header {
                display: flex;
                align-items: center;
                justify-content: space-between;
                margin-bottom: 12px;
            }
            .paradis-employability-title {
                font-size: 1rem;
                font-weight: 700;
                color: #06b6d4;
            }
            .paradis-employability-level-tag {
                font-weight: 700;
                font-size: 0.85rem;
                padding: 4px 10px;
                border-radius: 12px;
            }

            /* Progress Bar Track */
            .paradis-gauge-track {
                width: 100%;
                height: 12px;
                background: rgba(31, 41, 55, 0.8);
                border-radius: 6px;
                overflow: hidden;
                position: relative;
                margin: 10px 0 16px 0;
            }
            .paradis-gauge-fill {
                height: 100%;
                border-radius: 6px;
                transition: width 0.6s cubic-bezier(0.16, 1, 0.3, 1);
            }

            /* Grille des paliers */
            .paradis-paliers-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
                gap: 10px;
                margin-top: 14px;
            }
            .paradis-palier-item {
                padding: 10px;
                border-radius: 8px;
                background: rgba(31, 41, 55, 0.5);
                border: 1px solid rgba(75, 85, 99, 0.3);
                font-size: 0.8rem;
                display: flex;
                flex-direction: column;
                gap: 4px;
            }
            .paradis-palier-item.active {
                border-color: #06b6d4;
                background: rgba(6, 182, 212, 0.1);
            }
            .paradis-palier-item.reached {
                opacity: 0.9;
            }
            .paradis-palier-item.locked {
                opacity: 0.4;
            }
        `;
        document.head.appendChild(style);
    }

    /**
     * Détermine le palier actuel selon le nombre de jours validés
     */
    function getPalier(completedCount) {
        for (let i = PALIERS.length - 1; i >= 0; i--) {
            if (completedCount >= PALIERS[i].minDays) {
                return PALIERS[i];
            }
        }
        return PALIERS[0];
    }

    /**
     * Calcule le nombre de jours complétés depuis IndexedDB
     */
    async function getCompletedDaysCount() {
        if (!window.ParadisStorage || typeof window.ParadisStorage.getAllLocal !== 'function') return 0;
        try {
            const records = await window.ParadisStorage.getAllLocal('progress');
            return records.filter(r => r.is_completed || r.isCompleted).length;
        } catch (e) {
            return 0;
        }
    }

    /**
     * Met à jour ou injecte le badge d'employabilité dans le header
     */
    async function updateHeaderBadge() {
        const headerInner = document.querySelector('.md-header__inner');
        if (!headerInner) return;

        let badge = document.getElementById('paradis-employability-header-badge');
        if (!badge) {
            badge = document.createElement('div');
            badge.id = 'paradis-employability-header-badge';
            badge.className = 'paradis-employability-badge';
            headerInner.appendChild(badge);
        }

        const completedDays = await getCompletedDaysCount();
        const currentPalier = getPalier(completedDays);

        badge.innerHTML = `${currentPalier.icon} Nivo ${currentPalier.level} — ${currentPalier.name} (${completedDays}/600j)`;
        badge.title = `Palier Actuel: ${currentPalier.name}. Cliquez pour voir votre jauge de progression.`;
        badge.onclick = toggleEmployabilityCard;
    }

    /**
     * Génère le composant UI de la jauge de qualification
     */
    async function renderEmployabilityCard(targetElementId) {
        const target = document.getElementById(targetElementId);
        if (!target) return;

        const completedDays = await getCompletedDaysCount();
        const currentPalier = getPalier(completedDays);
        const percent = Math.min(100, Math.round((completedDays / 600) * 100));

        let paliersHTML = '';
        PALIERS.forEach(p => {
            let statusClass = 'locked';
            if (completedDays >= p.minDays && completedDays <= p.maxDays) statusClass = 'active';
            else if (completedDays > p.maxDays) statusClass = 'reached';

            paliersHTML += `
                <div class="paradis-palier-item ${statusClass}">
                    <div><strong>${p.icon} Niv. ${p.level} : ${p.name}</strong></div>
                    <div style="color: #9ca3af;">Jours ${p.minDays} à ${p.maxDays} — <em>${p.role}</em></div>
                </div>
            `;
        });

        target.innerHTML = `
            <div class="paradis-employability-card">
                <div class="paradis-employability-header">
                    <div class="paradis-employability-title">🎯 Palier d'Employabilité IT Bancaire (BCC)</div>
                    <div class="paradis-employability-level-tag" style="background: ${currentPalier.color}22; color: ${currentPalier.color}; border: 1px solid ${currentPalier.color}44;">
                        ${currentPalier.icon} ${currentPalier.name}
                    </div>
                </div>
                <div>Progression globale : <strong>${completedDays} / 600 Jours</strong> (${percent}%)</div>
                <div class="paradis-gauge-track">
                    <div class="paradis-gauge-fill" style="width: ${percent}%; background: ${currentPalier.color};"></div>
                </div>
                <div class="paradis-paliers-grid">
                    ${paliersHTML}
                </div>
            </div>
        `;
    }

    function toggleEmployabilityCard() {
        let modal = document.getElementById('paradis-employability-modal');
        if (modal) {
            modal.remove();
            return;
        }

        modal = document.createElement('div');
        modal.id = 'paradis-employability-modal';
        modal.style.cssText = `
            position: fixed;
            top: 0; left: 0; width: 100vw; height: 100vh;
            background: rgba(10, 15, 29, 0.85);
            backdrop-filter: blur(8px);
            z-index: 99995;
            display: flex; align-items: center; justify-content: center;
        `;

        const container = document.createElement('div');
        container.style.cssText = 'width: 100%; max-width: 650px; padding: 20px;';
        container.id = 'paradis-employability-modal-content';

        modal.appendChild(container);
        document.body.appendChild(modal);

        renderEmployabilityCard('paradis-employability-modal-content');

        modal.onclick = (e) => {
            if (e.target === modal) modal.remove();
        };
    }

    // Initialisation
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            updateHeaderBadge();
        });
    } else {
        updateHeaderBadge();
    }

    window.ParadisEmployability = {
        getPalier,
        getCompletedDaysCount,
        updateHeaderBadge,
        renderEmployabilityCard,
        PALIERS
    };
})();
