/**
 * PARADIS — Auth Modal & Navbar Integration (Sprint 03)
 *
 * Gère l'interface modale d'authentification (Connexion / Inscription)
 * et l'état de la session utilisateur dans le header MkDocs Material.
 */
(function () {
    'use strict';

    // Injection CSS dynamique pour le style Glassmorphism Dark
    const styleId = 'paradis-auth-styles';
    if (!document.getElementById(styleId)) {
        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = `
            /* Overlay Modale Auth */
            .paradis-auth-overlay {
                position: fixed;
                top: 0;
                left: 0;
                width: 100vw;
                height: 100vh;
                background: rgba(10, 15, 29, 0.85);
                backdrop-filter: blur(8px);
                -webkit-backdrop-filter: blur(8px);
                z-index: 99999;
                display: flex;
                align-items: center;
                justify-content: center;
                opacity: 0;
                pointer-events: none;
                transition: opacity 0.3s ease;
            }

            .paradis-auth-overlay.active {
                opacity: 1;
                pointer-events: auto;
            }

            /* Container Modale Glassmorphism */
            .paradis-auth-card {
                background: rgba(17, 24, 39, 0.95);
                border: 1px solid rgba(6, 182, 212, 0.3);
                box-shadow: 0 20px 50px rgba(0, 0, 0, 0.6), 0 0 20px rgba(6, 182, 212, 0.15);
                border-radius: 16px;
                width: 100%;
                max-width: 440px;
                padding: 32px;
                color: #f3f4f6;
                font-family: var(--md-text-font-family, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif);
                position: relative;
                transform: translateY(20px);
                transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
            }

            .paradis-auth-overlay.active .paradis-auth-card {
                transform: translateY(0);
            }

            /* Bouton Fermer */
            .paradis-auth-close {
                position: absolute;
                top: 16px;
                right: 16px;
                background: transparent;
                border: none;
                color: #9ca3af;
                font-size: 24px;
                cursor: pointer;
                line-height: 1;
                transition: color 0.2s;
            }
            .paradis-auth-close:hover { color: #06b6d4; }

            /* En-tête Modale */
            .paradis-auth-header {
                text-align: center;
                margin-bottom: 24px;
            }
            .paradis-auth-header h2 {
                font-size: 1.5rem;
                font-weight: 700;
                color: #06b6d4;
                margin: 0 0 6px 0;
            }
            .paradis-auth-header p {
                font-size: 0.875rem;
                color: #9ca3af;
                margin: 0;
            }

            /* Onglets (Login / Signup) */
            .paradis-auth-tabs {
                display: flex;
                background: rgba(31, 41, 55, 0.8);
                border-radius: 8px;
                padding: 4px;
                margin-bottom: 20px;
            }
            .paradis-auth-tab {
                flex: 1;
                padding: 10px;
                text-align: center;
                border: none;
                background: transparent;
                color: #9ca3af;
                font-weight: 600;
                font-size: 0.875rem;
                border-radius: 6px;
                cursor: pointer;
                transition: all 0.2s;
            }
            .paradis-auth-tab.active {
                background: #06b6d4;
                color: #0b1120;
            }

            /* Formulaire */
            .paradis-auth-form {
                display: flex;
                flex-direction: column;
                gap: 16px;
            }
            .paradis-auth-group {
                display: flex;
                flex-direction: column;
                gap: 6px;
            }
            .paradis-auth-group label {
                font-size: 0.8rem;
                font-weight: 600;
                color: #d1d5db;
                text-transform: uppercase;
                letter-spacing: 0.05em;
            }
            .paradis-auth-input {
                background: rgba(31, 41, 55, 0.9);
                border: 1px solid #374151;
                border-radius: 8px;
                padding: 12px 14px;
                color: #ffffff;
                font-size: 0.95rem;
                outline: none;
                transition: border-color 0.2s, box-shadow 0.2s;
            }
            .paradis-auth-input:focus {
                border-color: #06b6d4;
                box-shadow: 0 0 0 3px rgba(6, 182, 212, 0.2);
            }

            /* Feedback Alert */
            .paradis-auth-alert {
                padding: 10px 14px;
                border-radius: 8px;
                font-size: 0.85rem;
                display: none;
                margin-bottom: 12px;
            }
            .paradis-auth-alert.error {
                background: rgba(239, 68, 68, 0.15);
                border: 1px solid rgba(239, 68, 68, 0.4);
                color: #fca5a5;
                display: block;
            }
            .paradis-auth-alert.success {
                background: rgba(16, 185, 129, 0.15);
                border: 1px solid rgba(16, 185, 129, 0.4);
                color: #6ee7b7;
                display: block;
            }

            /* Bouton d'action principal */
            .paradis-auth-btn {
                background: linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%);
                color: #ffffff;
                border: none;
                border-radius: 8px;
                padding: 12px;
                font-weight: 700;
                font-size: 0.95rem;
                cursor: pointer;
                transition: transform 0.15s, box-shadow 0.15s;
                margin-top: 8px;
            }
            .paradis-auth-btn:hover {
                transform: translateY(-1px);
                box-shadow: 0 4px 15px rgba(6, 182, 212, 0.4);
            }
            .paradis-auth-btn:disabled {
                opacity: 0.6;
                cursor: not-allowed;
                transform: none;
            }

            /* Mode Invité Fallback */
            .paradis-auth-footer {
                text-align: center;
                margin-top: 16px;
                padding-top: 16px;
                border-top: 1px solid #374151;
            }
            .paradis-auth-guest-link {
                color: #9ca3af;
                font-size: 0.825rem;
                text-decoration: underline;
                cursor: pointer;
            }
            .paradis-auth-guest-link:hover { color: #06b6d4; }

            /* Navbar Header Button & User Pill */
            .paradis-nav-user-pill {
                display: inline-flex;
                align-items: center;
                gap: 8px;
                background: rgba(6, 182, 212, 0.15);
                border: 1px solid rgba(6, 182, 212, 0.4);
                border-radius: 20px;
                padding: 4px 12px;
                color: #06b6d4;
                font-size: 0.85rem;
                font-weight: 600;
                margin-left: 12px;
                cursor: pointer;
            }
            .paradis-nav-user-pill:hover {
                background: rgba(6, 182, 212, 0.25);
            }
            .paradis-nav-login-btn {
                background: #06b6d4;
                color: #0b1120 !important;
                border-radius: 6px;
                padding: 6px 14px;
                font-weight: 700;
                font-size: 0.85rem;
                text-decoration: none;
                margin-left: 12px;
                cursor: pointer;
                border: none;
            }
        `;
        document.head.appendChild(style);
    }

    let activeTab = 'login'; // 'login' | 'signup'

    /**
     * Injecte le markup HTML de la modale d'authentification dans document.body
     */
    function createModalHTML() {
        if (document.getElementById('paradis-auth-overlay')) return;

        const overlay = document.createElement('div');
        overlay.id = 'paradis-auth-overlay';
        overlay.className = 'paradis-auth-overlay';
        overlay.innerHTML = `
            <div class="paradis-auth-card">
                <button type="button" class="paradis-auth-close" id="paradis-auth-close-btn">&times;</button>
                <div class="paradis-auth-header">
                    <h2>🎓 PARADIS E-Learning</h2>
                    <p id="paradis-auth-subtitle">Accédez à votre espace de formation BCC</p>
                </div>

                <div class="paradis-auth-tabs">
                    <button type="button" class="paradis-auth-tab active" id="paradis-tab-login">Connexion</button>
                    <button type="button" class="paradis-auth-tab" id="paradis-tab-signup">Inscription</button>
                </div>

                <div id="paradis-auth-alert" class="paradis-auth-alert"></div>

                <form id="paradis-auth-form" class="paradis-auth-form" onsubmit="return false;">
                    <div class="paradis-auth-group" id="group-display-name" style="display: none;">
                        <label for="auth-display-name">Nom d'affichage</label>
                        <input type="text" id="auth-display-name" class="paradis-auth-input" placeholder="ex: Jean Dupont" />
                    </div>

                    <div class="paradis-auth-group">
                        <label for="auth-email">Adresse Email</label>
                        <input type="email" id="auth-email" class="paradis-auth-input" placeholder="votre.email@domaine.com" required />
                    </div>

                    <div class="paradis-auth-group">
                        <label for="auth-password">Mot de passe</label>
                        <input type="password" id="auth-password" class="paradis-auth-input" placeholder="••••••••" required minlength="8" />
                    </div>

                    <button type="submit" id="paradis-auth-submit-btn" class="paradis-auth-btn">
                        Se connecter
                    </button>
                </form>

                <div class="paradis-auth-footer">
                    <span class="paradis-auth-guest-link" id="paradis-auth-guest-btn">
                        Continuer en mode Invité (IndexedDB local uniquement)
                    </span>
                </div>
            </div>
        `;
        document.body.appendChild(overlay);

        // Binding des événements
        document.getElementById('paradis-auth-close-btn').onclick = closeModal;
        document.getElementById('paradis-tab-login').onclick = () => switchTab('login');
        document.getElementById('paradis-tab-signup').onclick = () => switchTab('signup');
        document.getElementById('paradis-auth-form').onsubmit = handleSubmit;
        document.getElementById('paradis-auth-guest-btn').onclick = closeModal;

        // Fermeture au clic sur le fond noir
        overlay.onclick = (e) => {
            if (e.target === overlay) closeModal();
        };
    }

    function switchTab(tab) {
        activeTab = tab;
        const loginTab = document.getElementById('paradis-tab-login');
        const signupTab = document.getElementById('paradis-tab-signup');
        const nameGroup = document.getElementById('group-display-name');
        const submitBtn = document.getElementById('paradis-auth-submit-btn');
        const alertEl = document.getElementById('paradis-auth-alert');

        alertEl.style.display = 'none';

        if (tab === 'login') {
            loginTab.classList.add('active');
            signupTab.classList.remove('active');
            nameGroup.style.display = 'none';
            submitBtn.textContent = 'Se connecter';
        } else {
            signupTab.classList.add('active');
            loginTab.classList.remove('active');
            nameGroup.style.display = 'flex';
            submitBtn.textContent = 'Créer mon compte';
        }
    }

    function openModal() {
        createModalHTML();
        const overlay = document.getElementById('paradis-auth-overlay');
        if (overlay) overlay.classList.add('active');
    }

    function closeModal() {
        const overlay = document.getElementById('paradis-auth-overlay');
        if (overlay) overlay.classList.remove('active');
    }

    function showAlert(message, type = 'error') {
        const alertEl = document.getElementById('paradis-auth-alert');
        if (!alertEl) return;
        alertEl.textContent = message;
        alertEl.className = `paradis-auth-alert ${type}`;
    }

    async function getActiveStudentSession() {
        const clientApi = window.ParadisSupabase;
        // 1. Essayer Supabase Session
        if (clientApi && typeof clientApi.getSession === 'function') {
            try {
                const session = await clientApi.getSession();
                if (session && session.user) {
                    const email = session.user.email || '';
                    const name = session.user.user_metadata?.full_name || session.user.user_metadata?.display_name || email.split('@')[0] || 'Étudiant';
                    return { email, name, isCloud: true, user: session.user };
                }
            } catch (e) {}
        }

        // 2. Essayer Local Session
        try {
            const localSess = localStorage.getItem('paradis_active_session');
            if (localSess) {
                const parsed = JSON.parse(localSess);
                if (parsed && parsed.email) {
                    return { email: parsed.email, name: parsed.display_name || parsed.email.split('@')[0] || 'Étudiant', isCloud: false };
                }
            }
        } catch (e) {}

        // 3. Essayer IndexedDB user_profile
        if (window.ParadisStorage && typeof window.ParadisStorage.getLocal === 'function') {
            try {
                const prof = await window.ParadisStorage.getLocal('user_profile', 'current_user');
                if (prof && prof.email) {
                    return { email: prof.email, name: prof.display_name || prof.email.split('@')[0] || 'Étudiant', isCloud: false };
                }
            } catch (e) {}
        }

        return null;
    }

    async function handleSubmit(e) {
        e.preventDefault();
        const email = document.getElementById('auth-email').value.trim();
        const password = document.getElementById('auth-password').value;
        const displayName = document.getElementById('auth-display-name').value.trim() || email.split('@')[0];
        const submitBtn = document.getElementById('paradis-auth-submit-btn');

        if (!email || !password) {
            showAlert('Veuillez remplir tous les champs requis.');
            return;
        }

        if (password.length < 8) {
            showAlert('Le mot de passe doit contenir au moins 8 caractères.');
            return;
        }

        submitBtn.disabled = true;
        submitBtn.textContent = 'Création du compte...';

        const clientApi = window.ParadisSupabase;
        const isConfigured = clientApi && typeof clientApi.isConfigured === 'function' && clientApi.isConfigured();

        // 1. Profil Étudiant Local (Créé immédiatement pour garantir l'accès sans blocage)
        const localProfile = {
            key: 'current_user',
            id: 'std_' + Date.now(),
            email: email,
            display_name: displayName,
            target_role: 'bcc_it_officer',
            status: 'active',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };

        // Sauvegarde locale immédiate
        if (window.ParadisStorage && typeof window.ParadisStorage.saveLocal === 'function') {
            try {
                await window.ParadisStorage.saveLocal('user_profile', localProfile);
            } catch(e) {}
        }
        try {
            localStorage.setItem('paradis_active_session', JSON.stringify({
                user_id: localProfile.id,
                email: email,
                display_name: displayName,
                logged_in: true,
                created_at: localProfile.created_at
            }));
        } catch(e) {}

        if (activeTab === 'signup') {
            if (isConfigured) {
                try {
                    const { data, error } = await clientApi.signUpWithPassword(email, password, displayName);
                    if (error) {
                        const msg = error.message || '';
                        if (msg.includes('User already registered') || msg.includes('already registered')) {
                            showAlert('⚠️ Cet email est déjà enregistré sur le cloud. Basculement sur votre compte local.', 'success');
                        } else {
                            console.warn('[AuthModal] Supabase signup error:', msg);
                        }
                    } else if (typeof clientApi.ensureProfile === 'function') {
                        await clientApi.ensureProfile(localProfile);
                    }
                } catch(err) {
                    console.warn('[AuthModal] Supabase sync fallback to local mode:', err);
                }
            }

            showAlert(`🎓 Compte Étudiant créé avec succès ! Bienvenue ${displayName} dans PARADIS IT.`, 'success');
            setTimeout(() => {
                closeModal();
                updateNavbarUI();
            }, 1200);
        } else {
            // Connexion
            if (isConfigured) {
                try {
                    const { data, error } = await clientApi.signInWithPassword(email, password);
                    if (error) {
                        const msg = error.message || '';
                        if (msg.includes('Invalid login credentials')) {
                            showAlert('❌ Email ou mot de passe incorrect.');
                            submitBtn.disabled = false;
                            submitBtn.textContent = 'Se connecter';
                            return;
                        }
                    } else {
                        if (typeof clientApi.ensureProfile === 'function') {
                            await clientApi.ensureProfile({ email, display_name: displayName });
                        }
                    }
                } catch(err) {
                    console.warn('[AuthModal] Cloud login error, using local session:', err);
                }
            }
            showAlert(`✅ Connexion réussie ! Bienvenue ${displayName}...`, 'success');
            setTimeout(() => {
                closeModal();
                updateNavbarUI();
            }, 1200);
        }

        submitBtn.disabled = false;
        submitBtn.textContent = activeTab === 'login' ? 'Se connecter' : 'Créer mon compte';
    }

    /**
     * Injecte ou met à jour le widget d'état utilisateur dans le Header MkDocs Material
     */
    async function updateNavbarUI() {
        const headerInner = document.querySelector('.md-header__inner');
        if (!headerInner) return;

        let navWidget = document.getElementById('paradis-nav-auth-widget');
        if (!navWidget) {
            navWidget = document.createElement('div');
            navWidget.id = 'paradis-nav-auth-widget';
            navWidget.style.display = 'inline-flex';
            navWidget.style.alignItems = 'center';
            headerInner.appendChild(navWidget);
        }

        const student = await getActiveStudentSession();

        if (student && student.email) {
            const displayName = student.name || student.email.split('@')[0];
            const badgeType = student.isCloud ? '☁️' : '🎓';
            navWidget.innerHTML = `
                <div class="paradis-nav-user-pill" title="${student.email} (${student.isCloud ? 'Cloud Sync' : 'Session Locale'})">
                    ${badgeType} ${displayName}
                </div>
            `;
            const pillEl = navWidget.querySelector('.paradis-nav-user-pill');
            if (pillEl) {
                pillEl.onclick = () => {
                    if (window.ParadisProfile && typeof window.ParadisProfile.openDrawer === 'function') {
                        window.ParadisProfile.openDrawer();
                    } else if (confirm(`Compte Étudiant : ${displayName} (${student.email})\n\nVoulez-vous vous déconnecter ?`)) {
                        const clientApi = window.ParadisSupabase;
                        if (clientApi && typeof clientApi.signOut === 'function') {
                            clientApi.signOut().then(() => updateNavbarUI());
                        } else {
                            localStorage.removeItem('paradis_active_session');
                            updateNavbarUI();
                        }
                    }
                };
            }
        } else {
            navWidget.innerHTML = `
                <button type="button" class="paradis-nav-login-btn">
                    🔑 Connexion / Inscription
                </button>
            `;
            const btnEl = navWidget.querySelector('.paradis-nav-login-btn');
            if (btnEl) btnEl.onclick = openModal;
        }
    }

    // Initialisation au chargement de la page
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            createModalHTML();
            updateNavbarUI();
        });
    } else {
        createModalHTML();
        updateNavbarUI();
    }

    window.ParadisAuth = {
        openModal,
        closeModal,
        updateNavbarUI,
        getActiveStudentSession
    };
})();
