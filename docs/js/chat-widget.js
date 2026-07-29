/**
 * PARADIS — Tuteur IA Gemini (Sprint 28 — v3)
 *
 * Tuteur IA propulsé par Google Gemini via l'API Google AI Studio.
 * Fallback automatique vers la base de connaissances locale si l'API
 * est indisponible ou non configurée.
 *
 * Clé API injectée via GitHub Secrets → window.__PARADIS_AI_CONFIG__
 */
(function () {
    'use strict';

    // ── Prompt système PARADIS ─────────────────────────────────────────────────
    const SYSTEM_PROMPT = `Tu es le Tuteur IA de PARADIS IT, une plateforme universitaire de formation IT Bancaire.

Programme : 45 jours intensifs, 630 heures, 7 tomes.
- P0 (J1-J3) : Fondamentaux IT — Support, bureautique, Web, Git, Linux
- P2 (J4-J11) : Fondations — Python, SQL, Réseaux TCP/IP, Bash
- P3A (J12-J17) : Administration Système — Linux, Windows Server, Active Directory
- P3B (J18-J22) : Bases de données — PostgreSQL, analytique, BI
- P3C (J23-J28) : Développement Web — HTML/CSS/JS, API REST
- P4 (J29-J35) : Cloud & Sécurité — AWS/Azure, SWIFT, RTGS, monétique BCC
- P5 (J36-J41) : Préparation BCC — QCM, examens blancs
- P6 (J42-J45) : Portfolio — Projets, rapport d'employabilité, soutenance

Objectif : Préparer les étudiants aux concours IT de la Banque Centrale du Congo (BCC) et à l'employabilité dans les institutions financières de RDC.

Règles :
- Réponds TOUJOURS en français
- Sois précis, pédagogique et contextualise pour le secteur bancaire en RDC
- Cite le tome et le jour concerné quand c'est pertinent
- Limite tes réponses à 3-4 paragraphes maximum
- Utilise des exemples concrets liés à la BCC, aux banques ou à la RDC
- Si la question sort du cadre IT/bancaire, redirige poliment vers le programme`;

    // ── Base de connaissances locale (fallback) ────────────────────────────────
    const KB_FALLBACK = [
        {
            keys: ['python', 'script', 'variable', 'boucle', 'pandas', 'fonction'],
            reply: '🐍 **Python** est au cœur du Tome P2 (J4–J11). Pour le contexte BCC, maîtrise `pandas` pour analyser des fichiers CSV de transactions, `os/subprocess` pour l\'automatisation, et `json` pour les APIs interbancaires. Consulte le Tome P2 > Jour 5-6 pour les scripts pratiques.'
        },
        {
            keys: ['sql', 'base de donn', 'postgresql', 'requête', 'jointure', 'select', 'table'],
            reply: '🗄️ **SQL/PostgreSQL** est essentiel pour les SGBD bancaires (Tome P3B, J18-J22). Points clés : JOINs, INDEX pour les performances, TRANSACTIONS ACID, et vues matérialisées pour les rapports. En production BCC, utilise `EXPLAIN ANALYZE` pour optimiser les requêtes sur des millions de transactions.'
        },
        {
            keys: ['réseau', 'tcp', 'ip', 'dns', 'vlan', 'routeur', 'firewall', 'http'],
            reply: '🌐 **Réseaux** (Tome P2 J8-9 + Tome P4) : le modèle OSI à 7 couches est fondamental. Pour la BCC, les VLAN segmentent le réseau (VLAN 10 opérations, VLAN 20 gestion, VLAN 30 DMZ). Maîtrise le subnetting : 192.168.10.0/26 = 62 hôtes utilisables.'
        },
        {
            keys: ['sécurité', 'chiffrement', 'ssl', 'tls', 'vpn', 'audit', 'malware'],
            reply: '🔐 **Cybersécurité bancaire** (Tome P4, J29-J35) : la BCC applique ISO 27001. Piliers CIA : Confidentialité, Intégrité, Disponibilité. AES-256 pour les données au repos, TLS 1.3 en transit. Le framework NIST CSF guide les audits : Identifier, Protéger, Détecter, Répondre, Récupérer.'
        },
        {
            keys: ['swift', 'rtgs', 'monétique', 'virement', 'bcc', 'banque centrale'],
            reply: '🏦 **SWIFT & RTGS** (Tome P4) : SWIFT est le réseau mondial de messagerie financière (MT103, MT202). Le RTGS de la BCC traite les paiements interbancaires en temps réel pour les gros montants. La monétique couvre les protocoles EMV des cartes bancaires. Indispensable pour les concours BCC IT.'
        },
        {
            keys: ['linux', 'bash', 'terminal', 'commande', 'chmod', 'systemd', 'cron'],
            reply: '🐧 **Linux** est l\'OS de référence des serveurs bancaires (Tome P2 + P3A). Commandes BCC essentielles : `systemctl` pour les services, `journalctl` pour les logs, `crontab` pour les tâches planifiées. La maîtrise de `grep/awk/sed` est indispensable pour analyser les logs RTGS.'
        },
        {
            keys: ['examen', 'concours', 'qcm', 'révision', 'préparer', 'test'],
            reply: '📝 **Préparation BCC** (Tome P5, J36-J41) : les épreuves couvrent Culture IT, Réseaux & Sécurité, Bases de données, et Culture Bancaire. Utilise le module QCM PARADIS quotidiennement. Vise 75%+ avant de continuer. Le module Examen Blanc simule les conditions réelles.'
        },
        {
            keys: ['aide', 'bonjour', 'salut', 'hello', 'programme', 'paradis'],
            reply: '👋 Bonjour ! Je suis votre **Tuteur IA PARADIS**, propulsé par Google Gemini. Posez-moi vos questions sur Python, SQL, Réseaux, Sécurité, Linux, SWIFT/RTGS, ou la préparation aux concours BCC. Je suis là pour vous aider tout au long des 45 jours de formation !'
        }
    ];

    const DEFAULT_FALLBACK = '🧠 Je n\'ai pas de réponse précise à cela dans mon contexte actuel. Reformulez votre question ou précisez le tome/jour concerné. Je peux vous aider sur Python, SQL, Réseaux, Sécurité, Linux, SWIFT ou la préparation aux concours BCC.';

    // ── Historique de conversation ─────────────────────────────────────────────
    const conversationHistory = [];

    // ── Config API Gemini ──────────────────────────────────────────────────────
    function getApiKey() {
        const cfg = window.__PARADIS_AI_CONFIG__ || {};
        return cfg.apiKey || '';
    }

    function getModel() {
        const cfg = window.__PARADIS_AI_CONFIG__ || {};
        return cfg.model || 'gemini-1.5-flash';
    }

    function isGeminiConfigured() {
        const key = getApiKey();
        return key && key.length > 10 && !key.includes('your-key');
    }

    // ── Appel API Gemini ───────────────────────────────────────────────────────
    async function callGemini(userMessage) {
        const apiKey = getApiKey();
        const model = getModel();
        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

        // Construire le contexte de conversation (max 10 derniers échanges)
        const recentHistory = conversationHistory.slice(-10);

        const contents = [
            // Contexte système comme premier message user/model
            {
                role: 'user',
                parts: [{ text: 'Tu es le Tuteur IA de PARADIS IT. Voici ton contexte :\n\n' + SYSTEM_PROMPT + '\n\nConfirme que tu as bien compris ton rôle.' }]
            },
            {
                role: 'model',
                parts: [{ text: 'Compris ! Je suis le Tuteur IA PARADIS IT, spécialisé dans la formation IT bancaire pour les concours BCC en RDC. Je répondrai toujours en français avec des exemples concrets du secteur bancaire congolais. Que puis-je vous expliquer ?' }]
            },
            // Historique récent
            ...recentHistory,
            // Message actuel
            {
                role: 'user',
                parts: [{ text: userMessage }]
            }
        ];

        const response = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents,
                generationConfig: {
                    temperature: 0.7,
                    maxOutputTokens: 800,
                    topP: 0.9
                },
                safetySettings: [
                    { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
                    { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_MEDIUM_AND_ABOVE' }
                ]
            })
        });

        if (!response.ok) {
            const errData = await response.json().catch(() => ({}));
            const errMsg = errData?.error?.message || `HTTP ${response.status}`;
            throw new Error(errMsg);
        }

        const data = await response.json();
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!text) throw new Error('Réponse vide de Gemini');

        // Ajouter à l'historique
        conversationHistory.push({ role: 'user', parts: [{ text: userMessage }] });
        conversationHistory.push({ role: 'model', parts: [{ text }] });

        return text;
    }

    // ── Fallback local par mots-clés ───────────────────────────────────────────
    function getLocalResponse(userMessage) {
        const msg = userMessage.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        let best = null, bestScore = 0;
        for (const entry of KB_FALLBACK) {
            let score = 0;
            for (const key of entry.keys) {
                const k = key.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
                if (msg.includes(k)) score += k.length;
            }
            if (score > bestScore) { bestScore = score; best = entry; }
        }
        return best && bestScore > 0 ? best.reply : DEFAULT_FALLBACK;
    }

    // ── Rendu Markdown simple ──────────────────────────────────────────────────
    function renderMarkdown(text) {
        return text
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/`(.*?)`/g, '<code>$1</code>')
            .replace(/^#{1,3}\s+(.+)$/gm, '<strong>$1</strong>')
            .replace(/\n\n/g, '</p><p>')
            .replace(/\n/g, '<br>');
    }

    // ── Injection CSS ──────────────────────────────────────────────────────────
    const styleId = 'paradis-chat-styles';
    if (!document.getElementById(styleId)) {
        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = `
            .paradis-chat-trigger {
                position: fixed;
                bottom: 85px;
                right: 25px;
                background: linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%);
                color: #ffffff;
                border: none;
                border-radius: 50px;
                padding: 12px 20px;
                font-weight: 700;
                font-size: 0.9rem;
                box-shadow: 0 8px 25px rgba(139, 92, 246, 0.5);
                cursor: pointer;
                z-index: 99980;
                display: flex;
                align-items: center;
                gap: 8px;
                transition: transform 0.2s, box-shadow 0.2s;
                animation: chatPulse 3s ease-in-out infinite;
            }
            @keyframes chatPulse {
                0%, 100% { box-shadow: 0 8px 25px rgba(139, 92, 246, 0.5); }
                50% { box-shadow: 0 8px 35px rgba(139, 92, 246, 0.8), 0 0 0 6px rgba(139, 92, 246, 0.15); }
            }
            .paradis-chat-trigger:hover { transform: translateY(-3px); animation: none; box-shadow: 0 12px 30px rgba(139, 92, 246, 0.7); }

            .paradis-chat-box {
                position: fixed;
                bottom: 145px; right: 25px;
                width: 400px; height: 560px;
                background: rgba(13, 18, 30, 0.98);
                border: 1px solid rgba(139, 92, 246, 0.4);
                border-radius: 20px;
                box-shadow: 0 25px 60px rgba(0,0,0,0.9), 0 0 30px rgba(139, 92, 246, 0.1);
                z-index: 99990;
                display: none;
                flex-direction: column;
                color: #f3f4f6;
                overflow: hidden;
                backdrop-filter: blur(20px);
                -webkit-backdrop-filter: blur(20px);
            }
            .paradis-chat-box.open {
                display: flex;
                animation: chatSlideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);
            }
            @keyframes chatSlideIn {
                from { opacity: 0; transform: translateY(20px) scale(0.95); }
                to   { opacity: 1; transform: translateY(0) scale(1); }
            }

            .paradis-chat-header {
                padding: 14px 18px;
                border-bottom: 1px solid rgba(139, 92, 246, 0.2);
                display: flex;
                justify-content: space-between;
                align-items: center;
                background: rgba(139, 92, 246, 0.08);
                flex-shrink: 0;
            }
            .paradis-chat-header-info { display: flex; align-items: center; gap: 10px; }
            .paradis-chat-avatar {
                width: 36px; height: 36px;
                background: linear-gradient(135deg, #8b5cf6, #3b82f6);
                border-radius: 50%;
                display: flex; align-items: center; justify-content: center;
                font-size: 18px;
            }
            .paradis-chat-header-text h4 { margin: 0; color: #a78bfa; font-size: 0.9rem; font-weight: 700; }
            .paradis-chat-powered { font-size: 0.68rem; color: #4b5563; margin-top: 2px; }
            .paradis-chat-status {
                font-size: 0.72rem; color: #10b981;
                display: flex; align-items: center; gap: 4px;
            }
            .paradis-chat-status::before {
                content: ''; width: 6px; height: 6px;
                background: #10b981; border-radius: 50%; display: inline-block;
                animation: statusPulse 1.5s ease infinite;
            }
            @keyframes statusPulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
            .paradis-chat-close-btn { background: none; border: none; color: #6b7280; font-size: 22px; cursor: pointer; transition: color 0.2s; line-height: 1; }
            .paradis-chat-close-btn:hover { color: #a78bfa; }

            .paradis-chat-messages {
                flex: 1; padding: 14px;
                overflow-y: auto;
                display: flex; flex-direction: column; gap: 12px;
                scrollbar-width: thin; scrollbar-color: rgba(139, 92, 246, 0.3) transparent;
            }
            .paradis-chat-messages::-webkit-scrollbar { width: 4px; }
            .paradis-chat-messages::-webkit-scrollbar-thumb { background: rgba(139, 92, 246, 0.3); border-radius: 4px; }

            .paradis-msg {
                padding: 10px 14px; border-radius: 14px;
                font-size: 0.875rem; max-width: 90%;
                line-height: 1.55; word-break: break-word;
            }
            .paradis-msg p { margin: 0 0 6px; }
            .paradis-msg p:last-child { margin: 0; }
            .paradis-msg.user {
                background: linear-gradient(135deg, #3b82f6, #1d4ed8);
                color: #fff; align-self: flex-end;
                border-radius: 14px 14px 4px 14px;
                box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
            }
            .paradis-msg.bot {
                background: rgba(31, 41, 55, 0.9);
                border: 1px solid rgba(139, 92, 246, 0.2);
                color: #e5e7eb; align-self: flex-start;
                border-radius: 14px 14px 14px 4px;
            }
            .paradis-msg.bot strong { color: #a78bfa; }
            .paradis-msg.bot code { background: rgba(0,0,0,0.4); padding: 1px 5px; border-radius: 4px; font-size: 0.82rem; color: #06b6d4; }
            .paradis-msg.error { border-color: rgba(239, 68, 68, 0.3) !important; }
            .paradis-msg.error strong { color: #fca5a5 !important; }

            .paradis-typing {
                display: flex; align-items: center; gap: 5px;
                padding: 12px 16px;
                background: rgba(31, 41, 55, 0.9);
                border: 1px solid rgba(139, 92, 246, 0.2);
                border-radius: 14px 14px 14px 4px;
                align-self: flex-start; width: 60px;
            }
            .paradis-typing span {
                width: 7px; height: 7px;
                background: #a78bfa; border-radius: 50%;
                display: inline-block;
                animation: typingDot 1.2s ease infinite;
            }
            .paradis-typing span:nth-child(2) { animation-delay: 0.2s; }
            .paradis-typing span:nth-child(3) { animation-delay: 0.4s; }
            @keyframes typingDot {
                0%, 60%, 100% { transform: translateY(0); opacity: 0.5; }
                30% { transform: translateY(-5px); opacity: 1; }
            }

            .paradis-quick-qs {
                padding: 8px 12px;
                display: flex; flex-wrap: wrap; gap: 5px;
                border-top: 1px solid rgba(139, 92, 246, 0.1);
                flex-shrink: 0;
            }
            .paradis-quick-q {
                background: rgba(139, 92, 246, 0.1);
                border: 1px solid rgba(139, 92, 246, 0.25);
                color: #c4b5fd; border-radius: 20px;
                padding: 4px 10px; font-size: 0.73rem;
                cursor: pointer; transition: all 0.2s; white-space: nowrap;
            }
            .paradis-quick-q:hover { background: rgba(139, 92, 246, 0.25); color: #fff; }

            .paradis-chat-input-area {
                padding: 12px 14px;
                border-top: 1px solid rgba(255,255,255,0.06);
                display: flex; gap: 8px; align-items: flex-end;
                flex-shrink: 0;
            }
            .paradis-chat-input {
                flex: 1;
                background: rgba(31, 41, 55, 0.9);
                border: 1px solid rgba(139, 92, 246, 0.25);
                border-radius: 10px; padding: 10px 14px;
                color: #fff; font-size: 0.875rem;
                outline: none; resize: none;
                min-height: 40px; max-height: 100px;
                transition: border-color 0.2s;
                font-family: inherit; line-height: 1.4;
            }
            .paradis-chat-input:focus { border-color: #8b5cf6; box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.15); }
            .paradis-chat-input::placeholder { color: #6b7280; }
            .paradis-chat-send-btn {
                background: linear-gradient(135deg, #8b5cf6, #3b82f6);
                color: #fff; border: none; border-radius: 10px;
                width: 40px; height: 40px;
                display: flex; align-items: center; justify-content: center;
                cursor: pointer; transition: transform 0.15s, box-shadow 0.15s;
                flex-shrink: 0;
            }
            .paradis-chat-send-btn:hover { transform: scale(1.05); box-shadow: 0 4px 15px rgba(139, 92, 246, 0.5); }
            .paradis-chat-send-btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }

            @media (max-width: 480px) {
                .paradis-chat-box { width: calc(100vw - 30px); right: 15px; bottom: 130px; height: 70vh; }
                .paradis-chat-trigger { right: 15px; padding: 10px 16px; font-size: 0.82rem; }
            }
        `;
        document.head.appendChild(style);
    }

    // ── Suggestions rapides ────────────────────────────────────────────────────
    const QUICK_QUESTIONS = [
        'Comment fonctionne SWIFT ?',
        'Explique SQL JOIN avec exemple',
        'Qu\'est-ce qu\'un VLAN ?',
        'Comment préparer l\'examen BCC ?',
        'Python vs Bash pour l\'admin système ?'
    ];

    // ── Injection du markup HTML ───────────────────────────────────────────────
    function injectChatUI() {
        if (document.getElementById('paradis-chat-trigger')) return;

        const geminiActive = isGeminiConfigured();
        const statusText = geminiActive ? 'Gemini AI — Programme BCC' : 'Mode local — Programme BCC';
        const poweredText = geminiActive ? '⚡ Propulsé par Google Gemini' : '📚 Base de connaissances locale';

        const btn = document.createElement('button');
        btn.id = 'paradis-chat-trigger';
        btn.className = 'paradis-chat-trigger';
        btn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg> Tuteur IA`;
        btn.onclick = toggleChat;
        document.body.appendChild(btn);

        const box = document.createElement('div');
        box.id = 'paradis-chat-box';
        box.className = 'paradis-chat-box';
        box.innerHTML = `
            <div class="paradis-chat-header">
                <div class="paradis-chat-header-info">
                    <div class="paradis-chat-avatar">🤖</div>
                    <div class="paradis-chat-header-text">
                        <h4>Tuteur IA PARADIS</h4>
                        <div class="paradis-chat-status">${statusText}</div>
                        <div class="paradis-chat-powered">${poweredText}</div>
                    </div>
                </div>
                <button type="button" class="paradis-chat-close-btn" onclick="window.ParadisChat.toggleChat()">&times;</button>
            </div>
            <div id="paradis-chat-messages" class="paradis-chat-messages">
                <div class="paradis-msg bot">👋 Bonjour ! Je suis votre <strong>Tuteur IA PARADIS</strong>${geminiActive ? ', propulsé par <strong>Google Gemini</strong>' : ''}. Posez-moi vos questions sur le programme IT Bancaire — Python, SQL, Réseaux, Sécurité, SWIFT, Linux ou la préparation aux concours <strong>BCC</strong>.</div>
            </div>
            <div class="paradis-quick-qs" id="paradis-quick-qs"></div>
            <div class="paradis-chat-input-area">
                <textarea id="paradis-chat-input" class="paradis-chat-input" placeholder="Posez votre question..." rows="1"></textarea>
                <button type="button" id="paradis-chat-send" class="paradis-chat-send-btn" onclick="window.ParadisChat.sendUserMessage()" title="Envoyer">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                </button>
            </div>
        `;
        document.body.appendChild(box);

        // Suggestions rapides
        const quickQsContainer = document.getElementById('paradis-quick-qs');
        QUICK_QUESTIONS.forEach(q => {
            const qBtn = document.createElement('button');
            qBtn.className = 'paradis-quick-q';
            qBtn.textContent = q;
            qBtn.onclick = () => {
                const input = document.getElementById('paradis-chat-input');
                if (input) { input.value = q; sendUserMessage(); }
            };
            quickQsContainer.appendChild(qBtn);
        });

        // Entrée clavier
        const inputEl = document.getElementById('paradis-chat-input');
        if (inputEl) {
            inputEl.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendUserMessage(); }
            });
            inputEl.addEventListener('input', () => {
                inputEl.style.height = 'auto';
                inputEl.style.height = Math.min(inputEl.scrollHeight, 100) + 'px';
            });
        }
    }

    function toggleChat() {
        const box = document.getElementById('paradis-chat-box');
        if (!box) return;
        const isOpen = box.classList.contains('open');
        if (isOpen) {
            box.classList.remove('open');
            box.style.display = 'none';
        } else {
            box.style.display = 'flex';
            setTimeout(() => box.classList.add('open'), 10);
            setTimeout(() => {
                const input = document.getElementById('paradis-chat-input');
                if (input) input.focus();
            }, 300);
        }
    }

    function appendMessage(text, role, isError = false) {
        const msgs = document.getElementById('paradis-chat-messages');
        if (!msgs) return;
        const div = document.createElement('div');
        div.className = `paradis-msg ${role}${isError ? ' error' : ''}`;
        if (role === 'bot') {
            div.innerHTML = `<p>${renderMarkdown(text)}</p>`;
        } else {
            div.textContent = text;
        }
        msgs.appendChild(div);
        msgs.scrollTop = msgs.scrollHeight;
        return div;
    }

    function showTyping() {
        const msgs = document.getElementById('paradis-chat-messages');
        if (!msgs) return null;
        const el = document.createElement('div');
        el.className = 'paradis-typing';
        el.innerHTML = '<span></span><span></span><span></span>';
        msgs.appendChild(el);
        msgs.scrollTop = msgs.scrollHeight;
        return el;
    }

    async function sendUserMessage() {
        const input = document.getElementById('paradis-chat-input');
        const sendBtn = document.getElementById('paradis-chat-send');
        if (!input) return;

        const text = input.value.trim();
        if (!text) return;

        // Désactiver pendant l'envoi
        input.value = '';
        input.style.height = 'auto';
        if (sendBtn) sendBtn.disabled = true;

        // Masquer les suggestions après première utilisation
        const quickQs = document.getElementById('paradis-quick-qs');
        if (quickQs) quickQs.style.display = 'none';

        appendMessage(text, 'user');
        const typingEl = showTyping();

        try {
            let reply;
            if (isGeminiConfigured()) {
                // 🤖 Gemini API
                reply = await callGemini(text);
            } else {
                // 📚 Fallback local
                await new Promise(r => setTimeout(r, 600 + Math.random() * 400));
                reply = getLocalResponse(text);
            }
            typingEl && typingEl.remove();
            appendMessage(reply, 'bot');
        } catch (err) {
            typingEl && typingEl.remove();
            console.error('[TuteurIA] Erreur Gemini :', err.message);
            // Fallback automatique en cas d'erreur
            const fallback = getLocalResponse(text);
            appendMessage(fallback + '\n\n_⚠️ Gemini temporairement indisponible — réponse depuis la base locale._', 'bot', true);
        } finally {
            if (sendBtn) sendBtn.disabled = false;
            const inp = document.getElementById('paradis-chat-input');
            if (inp) inp.focus();
        }
    }

    // ── Initialisation ─────────────────────────────────────────────────────────
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', injectChatUI);
    } else {
        injectChatUI();
    }

    window.ParadisChat = { injectChatUI, toggleChat, sendUserMessage };
})();
