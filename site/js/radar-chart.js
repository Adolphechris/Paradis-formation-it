/**
 * PARADIS — Radar Chart
 * Renders a spider/radar chart of competency scores using Chart.js.
 */
(function () {
    'use strict';

    window.ParadisRadar = {
        /**
         * Render a radar chart in a canvas element.
         * @param {string} canvasId — ID of the <canvas> element
         * @param {Object} scores   — { supportBureautique, systemesReseaux, devAlgo, dataSql, cloudSecurity, bankingGovernance }
         */
        render(canvasId, scores) {
            const canvas = document.getElementById(canvasId);
            if (!canvas) return;

            const ctx = canvas.getContext('2d');
            new Chart(ctx, {
                type: 'radar',
                data: {
                    labels: [
                        'Support & Bureautique',
                        'Systèmes & Réseaux',
                        'Développement & Algo',
                        'Data & SQL',
                        'Cloud & Sécurité',
                        'Conformité & BCC'
                    ],
                    datasets: [{
                        label: 'Vos scores',
                        data: [
                            scores.supportBureautique || 0,
                            scores.systemesReseaux || 0,
                            scores.devAlgo || 0,
                            scores.dataSql || 0,
                            scores.cloudSecurity || 0,
                            scores.bankingGovernance || 0
                        ],
                        backgroundColor: 'rgba(46, 196, 182, 0.2)',
                        borderColor: '#2EC4B6',
                        pointBackgroundColor: '#2EC4B6',
                        pointBorderColor: '#fff',
                        pointHoverBackgroundColor: '#fff',
                        pointHoverBorderColor: '#2EC4B6'
                    }]
                },
                options: {
                    responsive: true,
                    scales: {
                        r: {
                            beginAtZero: true,
                            max: 100,
                            ticks: { stepSize: 20 }
                        }
                    }
                }
            });
        }
    };
})();
