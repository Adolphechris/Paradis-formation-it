/**
 * PARADIS — Markdown Parser
 * Uses Marked.js (CDN) for robust Markdown → HTML rendering.
 * Applies DOMPurify sanitization before injecting into the DOM.
 * Falls back to basic text extraction if Marked.js is unavailable.
 */
(function () {
    'use strict';

    let markedReady = false;
    let purifyReady = false;

    /**
     * Load Marked.js dynamically from CDN if not already loaded.
     * @returns {Promise<Function>} — marked.parse function
     */
    async function loadMarked() {
        if (markedReady && window.marked && typeof window.marked.parse === 'function') {
            return window.marked.parse;
        }

        try {
            await import('https://cdn.jsdelivr.net/npm/marked@14/dist/marked.umd.min.js');
            if (window.marked && typeof window.marked.parse === 'function') {
                markedReady = true;
                return window.marked.parse;
            }
        } catch (err) {
            console.warn('Marked.js CDN unavailable:', err.message);
        }

        return null;
    }

    /**
     * Load DOMPurify dynamically from CDN if not already loaded.
     * @returns {Promise<Function|null>} — DOMPurify.sanitize function or null
     */
    async function loadDOMPurify() {
        if (purifyReady && window.DOMPurify && typeof window.DOMPurify.sanitize === 'function') {
            return window.DOMPurify.sanitize;
        }

        try {
            await import('https://cdn.jsdelivr.net/npm/dompurify@3/dist/purify.es.min.js');
            if (window.DOMPurify && typeof window.DOMPurify.sanitize === 'function') {
                purifyReady = true;
                return window.DOMPurify.sanitize;
            }
        } catch (err) {
            console.warn('DOMPurify CDN unavailable:', err.message);
        }

        return null;
    }

    /**
     * Sanitize HTML string using DOMPurify or basic escaping.
     * @param {string} html
     * @returns {string}
     */
    async function sanitize(html) {
        const purify = await loadDOMPurify();
        if (purify) {
            return purify(html, {
                ALLOWED_TAGS: [
                    'p', 'br', 'strong', 'em', 'b', 'i', 'u', 's',
                    'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
                    'ul', 'ol', 'li', 'dl', 'dt', 'dd',
                    'a', 'img', 'table', 'thead', 'tbody', 'tr', 'th', 'td',
                    'blockquote', 'pre', 'code', 'hr', 'div', 'span', 'sub', 'sup',
                    'details', 'summary', 'input'
                ],
                ALLOWED_ATTR: ['href', 'src', 'alt', 'title', 'class', 'id', 'target', 'rel', 'checked', 'disabled', 'readonly', 'placeholder'],
                ALLOW_DATA_ATTR: false,
                ADD_ATTR: ['target', 'rel']
            });
        }
        // Fallback: basic text escaping
        return html
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    /**
     * Render Markdown to safe HTML.
     * @param {string} markdown — raw Markdown text
     * @returns {Promise<string>} — sanitized HTML
     */
    async function render(markdown) {
        if (!markdown || typeof markdown !== 'string') return '';

        const parse = await loadMarked();
        if (parse) {
            const html = parse(markdown);
            return await sanitize(html);
        }

        // Fallback: convert basic Markdown manually with escaping
        return await sanitize(escapeHtml(markdown));
    }

    /**
     * Render Markdown synchronously (best-effort, no async).
     * Use when you can await renderAsync().
     * @param {string} markdown
     * @returns {string}
     */
    function renderSync(markdown) {
        if (!markdown || typeof markdown !== 'string') return '';

        if (window.marked && typeof window.marked.parse === 'function') {
            const html = window.marked.parse(markdown);
            // No DOMPurify in sync path — use basic escaping
            return escapeHtml(html);
        }

        return escapeHtml(markdown);
    }

    /**
     * Async version for proper rendering.
     * @param {string} markdown
     * @returns {Promise<string>}
     */
    async function renderAsync(markdown) {
        return render(markdown);
    }

    /**
     * Basic HTML entity escaping for fallback path.
     * @param {string} text
     * @returns {string}
     */
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.appendChild(document.createTextNode(text));
        return div.innerHTML;
    }

    // Expose globally
    window.ParadisMarkdown = { render, renderSync, renderAsync, sanitize };

    console.log('PARADIS Markdown Parser initialized (Marked.js + DOMPurify)');
})();
