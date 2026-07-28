/**
 * PARADIS — Code Block Highlighter & Copy Button (Sprint 10)
 *
 * Embellit les blocs de code <pre><code> :
 *   1. Injection d'un en-tête avec badge de langage (BASH, PYTHON, SQL, etc.)
 *   2. Bouton "📋 Copier" en 1 clic avec animation de confirmation "✅ Copié !"
 */
(function () {
    'use strict';

    // Injection CSS pour le header des blocs de code
    const styleId = 'paradis-code-styles';
    if (!document.getElementById(styleId)) {
        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = `
            .md-content pre {
                position: relative;
                margin: 20px 0 !important;
                border-radius: 10px !important;
                background: #0f172a !important;
                border: 1px solid rgba(6, 182, 212, 0.25) !important;
                box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4) !important;
                overflow: hidden !important;
            }

            .paradis-code-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                background: rgba(30, 41, 59, 0.9);
                padding: 6px 14px;
                border-bottom: 1px solid rgba(51, 65, 85, 0.6);
                font-family: var(--md-code-font-family, monospace);
                font-size: 0.75rem;
            }

            .paradis-code-lang-badge {
                color: #06b6d4;
                font-weight: 700;
                text-transform: uppercase;
                letter-spacing: 0.05em;
                display: flex;
                align-items: center;
                gap: 6px;
            }

            .paradis-code-copy-btn {
                background: rgba(51, 65, 85, 0.6);
                color: #cbd5e1;
                border: 1px solid rgba(100, 116, 139, 0.4);
                border-radius: 4px;
                padding: 3px 10px;
                font-size: 0.75rem;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.2s;
            }

            .paradis-code-copy-btn:hover {
                background: #06b6d4;
                color: #0f172a;
                border-color: #06b6d4;
            }

            .paradis-code-copy-btn.copied {
                background: #10b981;
                color: #ffffff;
                border-color: #10b981;
            }
        `;
        document.head.appendChild(style);
    }

    /**
     * Extrait le nom du langage depuis les classes du bloc <code>
     */
    function detectLanguage(codeEl) {
        const classes = Array.from(codeEl.classList);
        for (const cls of classes) {
            if (cls.startsWith('language-')) {
                return cls.replace('language-', '').toUpperCase();
            }
            if (cls.startsWith('highlight-')) {
                return cls.replace('highlight-', '').toUpperCase();
            }
        }

        // Détection heuristique rapide
        const text = codeEl.textContent.trim();
        if (text.startsWith('$') || text.startsWith('#!') || text.includes('sudo ') || text.includes('apt-get')) return 'BASH';
        if (text.includes('SELECT ') || text.includes('FROM ') || text.includes('WHERE ')) return 'SQL';
        if (text.includes('def ') || text.includes('import ') || text.includes('print(')) return 'PYTHON';

        return 'CODE';
    }

    /**
     * Embellit tous les blocs <pre><code> avec un en-tête et un bouton de copie
     */
    function enhanceCodeBlocks() {
        const preBlocks = document.querySelectorAll('.md-content pre');

        preBlocks.forEach(pre => {
            if (pre.querySelector('.paradis-code-header')) return; // Déjà traité

            const code = pre.querySelector('code');
            if (!code) return;

            const lang = detectLanguage(code);

            // En-tête
            const header = document.createElement('div');
            header.className = 'paradis-code-header';

            let langIcon = '💻';
            if (lang === 'BASH' || lang === 'SH') langIcon = '🐚';
            else if (lang === 'PYTHON') langIcon = '🐍';
            else if (lang === 'SQL') langIcon = '🛢️';
            else if (lang === 'JS' || lang === 'JAVASCRIPT') langIcon = '📜';
            else if (lang === 'YAML' || lang === 'JSON') langIcon = '⚙️';

            header.innerHTML = `
                <span class="paradis-code-lang-badge">
                    <span>${langIcon}</span>
                    <span>${lang}</span>
                </span>
                <button type="button" class="paradis-code-copy-btn">📋 Copier</button>
            `;

            pre.insertBefore(header, code);

            // Action de copie
            const copyBtn = header.querySelector('.paradis-code-copy-btn');
            copyBtn.onclick = async () => {
                const codeText = code.innerText || code.textContent;
                try {
                    await navigator.clipboard.writeText(codeText);
                    copyBtn.textContent = '✅ Copié !';
                    copyBtn.classList.add('copied');

                    setTimeout(() => {
                        copyBtn.textContent = '📋 Copier';
                        copyBtn.classList.remove('copied');
                    }, 2000);
                } catch (err) {
                    console.warn('[CodeHighlighter] Erreur presse-papier :', err);
                }
            };
        });
    }

    // Initialisation
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', enhanceCodeBlocks);
    } else {
        enhanceCodeBlocks();
    }

    window.ParadisCodeHighlighter = {
        enhanceCodeBlocks
    };
})();
