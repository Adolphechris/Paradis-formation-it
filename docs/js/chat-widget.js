/**
 * PARADIS — Tuteur IA (Sprint 27)
 *
 * Interface de chat et assistant IA pour l'apprentissage IT Bancaire :
 *   - Widget de chat flottant Glassmorphism
 *   - Réponses contextualisées au programme BCC
 *   - Assistant réactif et dynamique
 */
(function () {
    'use strict';

    // Styles CSS dynamiques pour le Tuteur IA
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
                box-shadow: 0 8px 25px rgba(139, 92, 246, 0.4);
                cursor: pointer;
                z-index: 99980;
                display: flex;
                align-items: center;
                gap: 8px;
                transition: transform 0.2s;
            }
            .paradis-chat-trigger:hover {
                transform: translateY(-2px);
            }
            .paradis-chat-box {
                position: fixed;
                bottom: 140px; right: 25px;
                width: 380px; height: 500px;
                background: rgba(17, 24, 39, 0.97);
                border: 1px solid rgba(139, 92, 246, 0.4);
                border-radius: 16px;
                box-shadow: 0 20px 50px rgba(0,0,0,0.8);
                z-index: 99990;
                display: flex;
                flex-direction: column;
                color: #f3f4f6;
                display: none;
            }
            .paradis-chat-messages {
                flex: 1;
                padding: 16px;
                overflow-y: auto;
                display: flex;
                flex-direction: column;
                gap: 10px;
            }
            .paradis-msg {
                padding: 10px 14px;
                border-radius: 10px;
                font-size: 0.88rem;
                max-width: 85%;
                line-height: 1.4;
            }
            .paradis-msg.user {
                background: #3b82f6;
                color: #fff;
                align-self: flex-end;
            }
            .paradis-msg.bot {
                background: rgba(31, 41, 55, 0.8);
                border: 1px solid #374151;
                color: #e5e7eb;
                align-self: flex-start;
            }
        `;
        document.head.appendChild(style);
    }

    function injectChatUI() {
        if (document.getElementById('paradis-chat-trigger')) return;

        const btn = document.createElement('button');
        btn.id = 'paradis-chat-trigger';
        btn.className = 'paradis-chat-trigger';
        btn.innerHTML = '🤖 Tuteur IA';
        btn.onclick = toggleChat;
        document.body.appendChild(btn);

        const box = document.createElement('div');
        box.id = 'paradis-chat-box';
        box.className = 'paradis-chat-box';
        box.innerHTML = `
            <div style="padding: 14px 18px; border-bottom: 1px solid #374151; display: flex; justify-content: space-between; align-items: center;">
                <h4 style="margin: 0; color: #a78bfa;">🤖 Tuteur IA PARADIS</h4>
                <button type="button" onclick="window.ParadisChat.toggleChat()" style="background: none; border: none; color: #9ca3af; font-size: 20px; cursor: pointer;">&times;</button>
            </div>
            <div id="paradis-chat-messages" class="paradis-chat-messages">
                <div class="paradis-msg bot">Bonjour ! Je suis votre Tuteur IA. Posez-moi vos questions sur le programme IT Bancaire (Support, Systèmes, SQL, Sécurité, BCC).</div>
            </div>
            <div style="padding: 12px; border-top: 1px solid #374151; display: flex; gap: 8px;">
                <input type="text" id="paradis-chat-input" placeholder="Posez une question..." style="flex: 1; background: rgba(31, 41, 55, 0.8); border: 1px solid #374151; border-radius: 6px; padding: 8px 12px; color: #fff; outline: none;">
                <button type="button" onclick="window.ParadisChat.sendUserMessage()" style="background: #8b5cf6; color: #fff; border: none; border-radius: 6px; padding: 8px 14px; font-weight: 700; cursor: pointer;">Envoyer</button>
            </div>
        `;
        document.body.appendChild(box);
    }

    function toggleChat() {
        const box = document.getElementById('paradis-chat-box');
        if (box) {
            box.style.display = box.style.display === 'flex' ? 'none' : 'flex';
        }
    }

    function sendUserMessage() {
        const input = document.getElementById('paradis-chat-input');
        const msgs = document.getElementById('paradis-chat-messages');
        if (!input || !msgs) return;

        const text = input.value.trim();
        if (!text) return;

        // Message Utilisateur
        const uMsg = document.createElement('div');
        uMsg.className = 'paradis-msg user';
        uMsg.textContent = text;
        msgs.appendChild(uMsg);

        input.value = '';

        // Réponse simulée du Tuteur IA
        setTimeout(() => {
            const bMsg = document.createElement('div');
            bMsg.className = 'paradis-msg bot';
            bMsg.innerHTML = `💡 <strong>Tuteur IA :</strong> Concernant "<em>${text}</em>", reportez-vous aux normes de rigueur du référentiel IT BCC et vérifiez les configurations réseau/sécurité correspondantes.`;
            msgs.appendChild(bMsg);
            msgs.scrollTop = msgs.scrollHeight;
        }, 600);
    }

    // Initialisation
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            injectChatUI();
        });
    } else {
        injectChatUI();
    }

    window.ParadisChat = {
        injectChatUI,
        toggleChat,
        sendUserMessage
    };
})();
