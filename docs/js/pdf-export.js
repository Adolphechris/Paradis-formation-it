/**
 * PARADIS — Exportation PDF & Impression de Leçons (Sprint 28)
 *
 * Permet l'exportation et l'impression propre de n'importe quelle leçon :
 *   - Injection d'un bouton d'export PDF en bas de leçon
 *   - Optimisation des règles d'impression (Print Media CSS)
 */
(function () {
    'use strict';

    // Injection des règles CSS spécial d'impression (Print Media)
    const styleId = 'paradis-pdf-styles';
    if (!document.getElementById(styleId)) {
        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = `
            @media print {
                .md-header, .md-sidebar, .md-footer, .paradis-notes-trigger-btn, .paradis-chat-trigger, .paradis-completion-card, #paradis-lesson-nav, .paradis-quiz-card {
                    display: none !important;
                }
                .md-content {
                    width: 100% !important;
                    margin: 0 !important;
                    padding: 0 !important;
                }
                body {
                    background: #ffffff !important;
                    color: #000000 !important;
                }
            }
            .paradis-pdf-btn {
                display: inline-flex;
                align-items: center;
                gap: 6px;
                background: rgba(31, 41, 55, 0.8);
                border: 1px solid rgba(6, 182, 212, 0.3);
                border-radius: 8px;
                padding: 8px 16px;
                font-size: 0.85rem;
                font-weight: 700;
                color: #d1d5db;
                cursor: pointer;
                transition: all 0.2s;
                margin-top: 20px;
            }
            .paradis-pdf-btn:hover {
                border-color: #06b6d4;
                color: #06b6d4;
            }
        `;
        document.head.appendChild(style);
    }

    function injectPDFButton() {
        const contentInner = document.querySelector('.md-content__inner');
        if (!contentInner || document.getElementById('paradis-pdf-btn')) return;

        const btn = document.createElement('button');
        btn.id = 'paradis-pdf-btn';
        btn.type = 'button';
        btn.className = 'paradis-pdf-btn';
        btn.innerHTML = '📄 Exporter cette leçon (PDF / Impression)';
        btn.onclick = () => window.print();

        contentInner.appendChild(btn);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            injectPDFButton();
        });
    } else {
        injectPDFButton();
    }

    window.ParadisPDF = {
        exportPDF: () => window.print()
    };
})();
