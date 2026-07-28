/**
 * PARADIS — Profile Widget & Settings Drawer (Sprint 04)
 *
 * Permet l'affichage et l'édition du profil utilisateur (Display Name, Target Role)
 * avec persistance locale (IndexedDB) et synchronisation Cloud (Supabase profiles).
 */
(function () {
    'use strict';

    const ROLES = {
        bcc_it_officer: { label: '🏛️ Officier IT BCC', badge: 'BCC Officer', color: '#06b6d4' },
        sysadmin: { label: '⚙️ Administrateur Systèmes & Réseaux', badge: 'SysAdmin', color: '#3b82f6' },
        data_analyst: { label: '📊 Analyste de Données & SQL', badge: 'Data Analyst', color: '#10b981' },
        fullstack: { label: '💻 Développeur Fullstack', badge: 'Fullstack Dev', color: '#8b5cf6' }
    };

    // Style de la modale de profil
    const styleId = 'paradis-profile-styles';
    if (!document.getElementById(styleId)) {
        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = `
            .paradis-profile-role-badge {
                display: inline-block;
                padding: 2px 8px;
                border-radius: 12px;
                font-size: 0.75rem;
                font-weight: 700;
                text-transform: uppercase;
                margin-left: 6px;
            }
            .paradis-profile-drawer {
                position: fixed;
                top: 0;
                right: -400px;
                width: 100%;
                max-width: 380px;
                height: 100vh;
                background: rgba(17, 24, 39, 0.98);
                border-left: 1px solid rgba(6, 182, 212, 0.3);
                box-shadow: -10px 0 30px rgba(0,0,0,0.5);
                z-index: 999999;
                transition: right 0.3s cubic-bezier(0.16, 1, 0.3, 1);
                padding: 24px;
                box-sizing: border-box;
                color: #f3f4f6;
                display: flex;
                flex-direction: column;
            }
            .paradis-profile-drawer.active {
                right: 0;
            }
            .paradis-profile-drawer-backdrop {
                position: fixed;
                top: 0;
                left: 0;
                width: 100vw;
                height: 100vh;
                background: rgba(0, 0, 0, 0.5);
                z-index: 999998;
                opacity: 0;
                pointer-events: none;
                transition: opacity 0.3s;
            }
            .paradis-profile-drawer-backdrop.active {
                opacity: 1;
                pointer-events: auto;
            }
        `;
        document.head.appendChild(style);
    }

    function createDrawerHTML() {
        if (document.getElementById('paradis-profile-drawer')) return;

        const backdrop = document.createElement('div');
        backdrop.id = 'paradis-profile-backdrop';
        backdrop.className = 'paradis-profile-drawer-backdrop';

        const drawer = document.createElement('div');
        drawer.id = 'paradis-profile-drawer';
        drawer.className = 'paradis-profile-drawer';
        drawer.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px; border-bottom:1px solid #374151; padding-bottom:12px;">
                <h3 style="margin:0; color:#06b6d4; font-size:1.2rem;">👤 Mon Profil PARADIS</h3>
                <button type="button" id="paradis-profile-close-btn" style="background:none; border:none; color:#9ca3af; font-size:1.5rem; cursor:pointer;">&times;</button>
            </div>

            <div id="paradis-profile-alert" style="display:none; padding:10px; border-radius:6px; font-size:0.85rem; margin-bottom:16px;"></div>

            <form id="paradis-profile-form" style="display:flex; flex-direction:column; gap:16px;">
                <div style="display:flex; flex-direction:column; gap:6px;">
                    <label style="font-size:0.8rem; font-weight:600; color:#9ca3af;">ADRESSE EMAIL</label>
                    <input type="email" id="profile-email-readonly" class="paradis-auth-input" readonly style="opacity:0.7; cursor:not-allowed;" />
                </div>

                <div style="display:flex; flex-direction:column; gap:6px;">
                    <label style="font-size:0.8rem; font-weight:600; color:#d1d5db;">NOM D'AFFICHAGE</label>
                    <input type="text" id="profile-display-name" class="paradis-auth-input" placeholder="ex: Adolphe Christopher" required />
                </div>

                <div style="display:flex; flex-direction:column; gap:6px;">
                    <label style="font-size:0.8rem; font-weight:600; color:#d1d5db;">OBJECTIF DE CARRIÈRE (RÔLE CIBLE)</label>
                    <select id="profile-target-role" class="paradis-auth-input" style="background:#1f2937; color:#fff;">
                        <option value="bcc_it_officer">🏛️ Officier IT Banque Centrale du Congo (BCC)</option>
                        <option value="sysadmin">⚙️ Administrateur Systèmes & Réseaux</option>
                        <option value="data_analyst">📊 Analyste de Données & SQL</option>
                        <option value="fullstack">💻 Développeur Fullstack Web</option>
                    </select>
                </div>

                <button type="submit" id="profile-save-btn" class="paradis-auth-btn" style="margin-top:10px;">
                    💾 Enregistrer les modifications
                </button>
            </form>

            <div style="margin-top:auto; padding-top:20px; border-top:1px solid #374151; text-align:center;">
                <button type="button" id="profile-logout-btn" style="background:rgba(239,68,68,0.2); color:#fca5a5; border:1px solid rgba(239,68,68,0.4); border-radius:6px; padding:8px 16px; width:100%; font-weight:600; cursor:pointer;">
                    🚪 Se déconnecter
                </button>
            </div>
        `;

        document.body.appendChild(backdrop);
        document.body.appendChild(drawer);

        backdrop.onclick = closeDrawer;
        document.getElementById('paradis-profile-close-btn').onclick = closeDrawer;
        document.getElementById('paradis-profile-form').onsubmit = handleSaveProfile;
        document.getElementById('profile-logout-btn').onclick = handleLogout;
    }

    function openDrawer() {
        createDrawerHTML();
        loadProfileValues();
        document.getElementById('paradis-profile-backdrop').classList.add('active');
        document.getElementById('paradis-profile-drawer').classList.add('active');
    }

    function closeDrawer() {
        const backdrop = document.getElementById('paradis-profile-backdrop');
        const drawer = document.getElementById('paradis-profile-drawer');
        if (backdrop) backdrop.classList.remove('active');
        if (drawer) drawer.classList.remove('active');
    }

    async function loadProfileValues() {
        const emailInput = document.getElementById('profile-email-readonly');
        const nameInput = document.getElementById('profile-display-name');
        const roleSelect = document.getElementById('profile-target-role');

        const clientApi = window.ParadisSupabase;
        let session = null;

        if (clientApi && typeof clientApi.getSession === 'function') {
            session = await clientApi.getSession();
        }

        if (session && session.user) {
            emailInput.value = session.user.email || '';
            nameInput.value = session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || '';
        } else {
            emailInput.value = 'mode-invite@local';
            nameInput.value = 'Apprenant Invité';
        }

        // Tente de lire depuis IndexedDB
        if (window.ParadisStorage && typeof window.ParadisStorage.getLocal === 'function') {
            try {
                const cached = await window.ParadisStorage.getLocal('user_profile', 'current_user');
                if (cached) {
                    if (cached.display_name) nameInput.value = cached.display_name;
                    if (cached.target_role) roleSelect.value = cached.target_role;
                }
            } catch (err) {
                console.warn('[ProfileWidget] Erreur cache local :', err);
            }
        }
    }

    async function handleSaveProfile(e) {
        e.preventDefault();
        const displayName = document.getElementById('profile-display-name').value.trim();
        const targetRole = document.getElementById('profile-target-role').value;
        const saveBtn = document.getElementById('profile-save-btn');
        const alertEl = document.getElementById('paradis-profile-alert');

        saveBtn.disabled = true;
        saveBtn.textContent = 'Enregistrement...';
        alertEl.style.display = 'none';

        try {
            const clientApi = window.ParadisSupabase;
            if (clientApi && typeof clientApi.ensureProfile === 'function') {
                await clientApi.ensureProfile({
                    display_name: displayName,
                    target_role: targetRole
                });
            }

            alertEl.style.background = 'rgba(16,185,129,0.2)';
            alertEl.style.color = '#6ee7b7';
            alertEl.textContent = '✅ Profil mis à jour avec succès !';
            alertEl.style.display = 'block';

            if (window.ParadisAuth && typeof window.ParadisAuth.updateNavbarUI === 'function') {
                window.ParadisAuth.updateNavbarUI();
            }

            setTimeout(closeDrawer, 1200);
        } catch (err) {
            alertEl.style.background = 'rgba(239,68,68,0.2)';
            alertEl.style.color = '#fca5a5';
            alertEl.textContent = '⚠️ ' + (err.message || 'Erreur mise à jour profil');
            alertEl.style.display = 'block';
        } finally {
            saveBtn.disabled = false;
            saveBtn.textContent = '💾 Enregistrer les modifications';
        }
    }

    async function handleLogout() {
        if (confirm('Voulez-vous vous déconnecter de votre session PARADIS ?')) {
            const clientApi = window.ParadisSupabase;
            if (clientApi && typeof clientApi.signOut === 'function') {
                await clientApi.signOut();
            }
            closeDrawer();
            if (window.ParadisAuth && typeof window.ParadisAuth.updateNavbarUI === 'function') {
                window.ParadisAuth.updateNavbarUI();
            }
        }
    }

    window.ParadisProfile = {
        openDrawer,
        closeDrawer,
        ROLES
    };
})();
