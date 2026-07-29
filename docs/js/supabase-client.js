(function () {
    'use strict';

    let client = null;
    let initPromise = null;

    function getConfig() {
        const bridge = window.PARADIS_SUPABASE || {};
        const legacyConfig = window.__PARADIS_CONFIG__ || window.__PARADIS_SUPABASE_CONFIG__ || {};
        return {
            url: bridge.url || legacyConfig.url || '',
            anonKey: bridge.anonKey || legacyConfig.anonKey || '',
            debug: Boolean(legacyConfig.debug)
        };
    }

    function isPlaceholderValue(value) {
        return typeof value !== 'string' || value.includes('your-project') || value.includes('your-anon') || value.trim() === '';
    }

    function updateStatus(message, detail = '') {
        const statusEl = document.getElementById('supabase-status');
        const detailEl = document.getElementById('supabase-status-detail');
        if (statusEl) {
            statusEl.textContent = message;
        }
        if (detailEl) {
            detailEl.textContent = detail;
        }
    }

    async function loadSupabaseLibrary() {
        if (window.supabase && typeof window.supabase.createClient === 'function') {
            return window.supabase;
        }

        try {
            const mod = await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm');
            if (mod && typeof mod.createClient === 'function') {
                window.supabase = mod;
                return mod;
            }
        } catch (err) {
            console.warn('Supabase SDK unavailable:', err.message || err);
            return null;
        }

        return null;
    }

    async function initSupabase(configOverride = {}) {
        if (client) return client;
        if (initPromise) return initPromise;

        initPromise = (async () => {
            const config = {
                ...getConfig(),
                ...configOverride
            };

            if (isPlaceholderValue(config.url) || isPlaceholderValue(config.anonKey)) {
                updateStatus('Pas encore configuré', 'Ajoutez l’URL du projet et la clé anon Supabase dans la configuration du site.');
                return null;
            }

            const lib = await loadSupabaseLibrary();
            if (!lib) {
                updateStatus('SDK indisponible', 'Le client Supabase n’a pas pu être chargé. Vérifiez la connexion réseau/ CDN.');
                return null;
            }

            client = lib.createClient(config.url, config.anonKey, {
                auth: {
                    persistSession: true,
                    autoRefreshToken: true,
                    detectSessionInUrl: true
                },
                global: {
                    headers: {
                        'x-paradis-platform': 'mkdocs-material'
                    }
                }
            });

            updateStatus('Prêt pour la synchronisation', 'Connexion Supabase initialisée — prêt à sauvegarder la progression.');
            return client;
        })();

        return initPromise;
    }

    async function getClient() {
        return initSupabase();
    }

    function isConfigured() {
        const config = getConfig();
        return !isPlaceholderValue(config.url) && !isPlaceholderValue(config.anonKey);
    }

    async function getSession() {
        const supabase = await getClient();
        if (!supabase) return null;
        const { data, error } = await supabase.auth.getSession();
        if (error) {
            console.warn('Supabase session error:', error.message);
            return null;
        }
        return data?.session || null;
    }

    async function signInWithPassword(email, password) {
        const supabase = await getClient();
        if (!supabase) return { error: new Error('Supabase not configured') };
        return supabase.auth.signInWithPassword({ email, password });
    }

    async function signUpWithPassword(email, password, displayName = '') {
        const supabase = await getClient();
        if (!supabase) return { error: new Error('Supabase not configured') };
        return supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: displayName,
                    display_name: displayName
                }
            }
        });
    }

    async function signOut() {
        try {
            localStorage.removeItem('paradis_active_session');
            localStorage.removeItem('paradis_user_profile');
            localStorage.removeItem('paradis_guest_profile');
            if (window.ParadisStorage && typeof window.ParadisStorage.deleteLocal === 'function') {
                await window.ParadisStorage.deleteLocal('user_profile', 'current_user');
            }
        } catch (e) {
            console.warn('[SupabaseClient] Error clearing local session:', e);
        }

        const supabase = await getClient();
        if (!supabase) return { error: null };
        return supabase.auth.signOut();
    }

    async function ensureProfile(overrides = {}) {
        const supabase = await getClient();
        const session = await getSession();

        const userEmail = overrides.email || session?.user?.email || '';
        const userId = session?.user?.id || overrides.id || 'usr_' + Date.now();
        const displayName = overrides.display_name || session?.user?.user_metadata?.full_name || session?.user?.user_metadata?.display_name || userEmail.split('@')[0] || 'Utilisateur PARADIS';

        const profilePayload = {
            key: 'current_user',
            id: userId,
            display_name: displayName,
            email: userEmail,
            target_role: overrides.target_role || 'bcc_it_officer',
            updated_at: new Date().toISOString()
        };

        if (window.ParadisStorage && typeof window.ParadisStorage.saveLocal === 'function') {
            try {
                await window.ParadisStorage.saveLocal('user_profile', profilePayload);
            } catch (err) {
                console.warn('[SupabaseClient] Storage local error:', err);
            }
        }

        try {
            localStorage.setItem('paradis_active_session', JSON.stringify({
                user_id: userId,
                email: userEmail,
                display_name: displayName,
                logged_in: true,
                updated_at: new Date().toISOString()
            }));
        } catch (e) {}

        if (!supabase || !session?.user) return profilePayload;

        const { data, error } = await supabase.from('profiles').upsert({
            id: userId,
            display_name: displayName,
            email: userEmail,
            target_role: profilePayload.target_role,
            updated_at: profilePayload.updated_at
        }, { onConflict: 'id' }).select().single();

        if (error) {
            console.warn('Unable to sync profile to Supabase:', error.message);
            return profilePayload;
        }
        return data;
    }

    async function saveProgress(dayId, data) {
        const supabase = await getClient();
        if (!supabase) return { error: new Error('Supabase not configured') };
        const session = await getSession();
        if (!session?.user) return { error: new Error('No active session') };

        await ensureProfile();

        const payload = {
            user_id: session.user.id,
            day_id: dayId,
            tome: data.tome || 'P0',
            day_number: data.dayNumber || Number(dayId.replace(/[^0-9]/g, '')) || 1,
            is_completed: Boolean(data.isCompleted),
            quiz_score: data.quizScore ?? null,
            time_spent_minutes: data.timeSpentMinutes ?? 0,
            notes: data.notes || '',
            bookmarked: Boolean(data.bookmarked),
            completed_at: data.isCompleted ? new Date().toISOString() : null,
            updated_at: new Date().toISOString()
        };

        const { data: row, error } = await supabase.from('progress').upsert(payload, { onConflict: 'user_id,day_id' }).select().single();
        return { row, error };
    }

    async function loadProgress() {
        const supabase = await getClient();
        if (!supabase) return { error: new Error('Supabase not configured') };
        const session = await getSession();
        if (!session?.user) return { error: new Error('No active session') };
        const { data, error } = await supabase.from('progress').select('*').order('day_number', { ascending: true });
        return { data, error };
    }

    async function saveNote(dayId, content) {
        const supabase = await getClient();
        if (!supabase) return { error: new Error('Supabase not configured') };
        const session = await getSession();
        if (!session?.user) return { error: new Error('No active session') };

        const { data, error } = await supabase.from('notes').upsert({
            user_id: session.user.id,
            day_id: dayId,
            content,
            updated_at: new Date().toISOString()
        }, { onConflict: 'user_id,day_id' }).select().single();

        return { data, error };
    }

    async function loadNotes(dayId) {
        const supabase = await getClient();
        if (!supabase) return { error: new Error('Supabase not configured') };
        const session = await getSession();
        if (!session?.user) return { error: new Error('No active session') };
        const { data, error } = await supabase.from('notes').select('*').eq('day_id', dayId).maybeSingle();
        return { data, error };
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            initSupabase().catch((err) => {
                console.warn('Supabase init failed', err);
                updateStatus('Initialisation impossible', err.message || 'Unknown error');
            });
        });
    } else {
        initSupabase().catch((err) => {
            console.warn('Supabase init failed', err);
            updateStatus('Initialisation impossible', err.message || 'Unknown error');
        });
    }

    window.ParadisSupabase = {
        initSupabase,
        getClient,
        isConfigured,
        getSession,
        signInWithPassword,
        signUpWithPassword,
        signOut,
        ensureProfile,
        saveProgress,
        loadProgress,
        saveNote,
        loadNotes
    };
})();
