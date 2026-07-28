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

    async function handleSubmit(e) {
        e.preventDefault();
        const email = document.getElementById('auth-email').value.trim();
        const password = document.getElementById('auth-password').value;
        const displayName = document.getElementById('auth-display-name').value.trim();
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
        submitBtn.textContent = 'Patientez...';

        const clientApi = window.ParadisSupabase;
        if (!clientApi || typeof clientApi.signInWithPassword !== 'function') {
            showAlert('Service d’authentification cloud non configuré. Vous pouvez continuer en mode invité local.');
            submitBtn.disabled = false;
            submitBtn.textContent = activeTab === 'login' ? 'Se connecter' : 'Créer mon compte';
            return;
        }

        try {
            if (activeTab === 'login') {
                const { data, error } = await clientApi.signInWithPassword(email, password);
                if (error) throw error;
                showAlert('Connexion réussie ! Initialisation...', 'success');
                if (typeof clientApi.ensureProfile === 'function') {
                    await clientApi.ensureProfile();
                }
                setTimeout(() => {
                    closeModal();
                    updateNavbarUI();
                }, 1000);
            } else {
                const { data, error } = await clientApi.signUpWithPassword(email, password);
                if (error) throw error;
                showAlert('Compte créé ! Vérifiez votre boîte mail si la confirmation est requise.', 'success');
                if (typeof clientApi.ensureProfile === 'function') {
                    await clientApi.ensureProfile();
                }
                setTimeout(() => {
                    closeModal();
                    updateNavbarUI();
                }, 1500);
            }
        } catch (err) {
            console.error('[AuthModal] Erreur Auth :', err);
            showAlert(err.message || 'Une erreur est survenue lors de l’authentification.');
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = activeTab === 'login' ? 'Se connecter' : 'Créer mon compte';
        }
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

        const clientApi = window.ParadisSupabase;
        let session = null;

        if (clientApi && typeof clientApi.getSession === 'function') {
            session = await clientApi.getSession();
        }

        if (session && session.user) {
            const userEmail = session.user.email || 'Apprenant';
            const name = userEmail.split('@')[0];
            navWidget.innerHTML = `
                <div class="paradis-nav-user-pill" title="${userEmail}">
                    👤 ${name}
                </div>
            `;
            navWidget.querySelector('.paradis-nav-user-pill').onclick = () => {
                if (window.ParadisProfile && typeof window.ParadisProfile.openDrawer === 'function') {
                    window.ParadisProfile.openDrawer();
                } else if (confirm('Voulez-vous vous déconnecter ?')) {
                    if (typeof clientApi.signOut === 'function') {
                        clientApi.signOut().then(() => updateNavbarUI());
                    }
                }
            };
        } else {
            navWidget.innerHTML = `
                <button type="button" class="paradis-nav-login-btn">
                    🔑 Connexion
                </button>
            `;
            navWidget.querySelector('.paradis-nav-login-btn').onclick = openModal;
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
        updateNavbarUI
    };
})();
