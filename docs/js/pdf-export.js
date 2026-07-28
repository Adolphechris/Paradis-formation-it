/**
 * PARADIS — PDF Export (Sprint 30)
 *
 * Génère un PDF de progression et de portfolio via jsPDF (CDN).
 * - Rapport de progression (jours complétés, scores QCM, notes)
 * - Export employabilité (badges, compétences, radar)
 */
(function () {
    'use strict';

    function waitForJsPDF(timeout = 5000) {
        return new Promise((resolve, reject) => {
            const start = Date.now();
            const check = () => {
                if (window.jspdf && window.jspdf.jsPDF) {
                    return resolve(window.jspdf.jsPDF);
                }
                if (Date.now() - start > timeout) {
                    return reject(new Error('jsPDF CDN not available'));
                }
                setTimeout(check, 100);
            };
            check();
        });
    }

    function getProgressRows(progressData) {
        if (!Array.isArray(progressData)) return [];
        return progressData.map(row => ({
            day: row.day_id || '',
            tome: row.tome || '',
            completed: row.is_completed ? 'Oui' : 'Non',
            score: row.quiz_score != null ? row.quiz_score + '/100' : '—',
            time: row.time_spent_minutes != null ? row.time_spent_minutes + ' min' : '—',
        }));
    }

    function buildProgressPDF(doc, rows) {
        doc.setFontSize(16);
        doc.text('PARADIS — Rapport de progression', 14, 18);

        doc.setFontSize(10);
        doc.text(
            'Genere le : ' + new Date().toLocaleDateString('fr-FR', {
                year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
            }),
            14, 26
        );

        let y = 34;
        doc.setFontSize(12);
        doc.text('Progression par jour', 14, y);
        y += 6;

        doc.setFontSize(9);
        const headers = ['Jour', 'Tome', 'Complete', 'Score', 'Temps'];
        const colX = [14, 44, 72, 100, 128];

        doc.setFillColor(11, 95, 255);
        doc.setTextColor(255, 255, 255);
        headers.forEach((h, i) => doc.text(h, colX[i] + 1, y));
        doc.setFillColor(240, 240, 240);
        doc.rect(14, y - 4, 148, 7, 'F');
        doc.setTextColor(0, 0, 0);
        y += 7;

        rows.forEach((row, idx) => {
            if (y > 270) {
                doc.addPage();
                y = 18;
            }
            const values = [row.day, row.tome, row.completed, row.score, row.time];
            values.forEach((v, i) => doc.text(String(v), colX[i] + 1, y));
            if (idx % 2 === 0) {
                doc.setFillColor(248, 248, 248);
                doc.rect(14, y - 4, 148, 7, 'F');
                doc.setTextColor(0, 0, 0);
            }
            y += 7;
        });

        y += 6;
        doc.setFontSize(10);
        doc.text('Plateforme PARADIS IT — Autoformation 45 jours / 630h', 14, y);
    }

    async function exportProgress(progressData) {
        try {
            const jsPDF = await waitForJsPDF();
            const doc = new jsPDF({ unit: 'pt', format: 'a4' });
            const rows = getProgressRows(progressData);
            buildProgressPDF(doc, rows);
            doc.save('PARADIS-progression.pdf');
            return { success: true };
        } catch (err) {
            console.error('PDF export failed:', err);
            return { success: false, error: err.message };
        }
    }

    window.ParadisPDF = {
        exportProgress,
        exportReport: exportProgress,
        version: '1.0.0',
    };
})();
