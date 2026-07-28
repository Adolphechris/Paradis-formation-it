/**
 * PARADIS — Mode Entraînement Thématique & Flashcards (Sprint 20)
 *
 * Moteur de révision rapide par cartes mémoire (Flashcards) :
 *   - Cartes mémoire interactives avec effet de retournement 3D
 *   - Filtrage thématique (Support, Réseaux, Linux, SQL, Sécurité, BCC)
 *   - Auto-évaluation (Connu / À réviser)
 */
(function () {
    'use strict';

    let currentCards = [];
    let currentIndex = 0;
    let isFlipped = false;

    // Styles CSS dynamiques
    const styleId = 'paradis-flashcards-styles';
    if (!document.getElementById(styleId)) {
        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = `
            .paradis-flashcard-modal {
                position: fixed;
                top: 0; left: 0;
                width: 100vw; height: 100vh;
                background: rgba(10, 15, 29, 0.9);
                backdrop-filter: blur(8px);
                z-index: 99995;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                color: #f3f4f6;
            }
            .paradis-flashcard-scene {
                width: 500px;
                height: 300px;
                perspective: 1000px;
                margin: 20px 0;
                cursor: pointer;
            }
            .paradis-flashcard-inner {
                width: 100%;
                height: 100%;
                position: relative;
                transform-style: preserve-3d;
                transition: transform 0.6s cubic-bezier(0.4, 0.2, 0.2, 1);
            }
            .paradis-flashcard-inner.flipped {
                transform: rotateY(180deg);
            }
            .paradis-flashcard-face {
                position: absolute;
                width: 100%; height: 100%;
                backface-visibility: hidden;
                border-radius: 16px;
                padding: 30px;
                display: flex;
                flex-direction: column;
                justify-content: space-between;
                box-sizing: border-box;
                background: rgba(17, 24, 39, 0.95);
                border: 1px solid rgba(6, 182, 212, 0.4);
                box-shadow: 0 15px 35px rgba(0,0,0,0.6);
            }
            .paradis-flashcard-back {
                transform: rotateY(180deg);
                background: rgba(31, 41, 55, 0.95);
                border-color: #10b981;
            }
            .paradis-flashcard-controls {
                display: flex;
                gap: 16px;
                margin-top: 10px;
            }
            .paradis-fc-btn {
                padding: 10px 20px;
                border-radius: 8px;
                border: none;
                font-weight: 700;
                cursor: pointer;
            }
        `;
        document.head.appendChild(style);
    }

    const FLASHCARD_DATA = [
        { front: 'Quel est le port par défaut du protocole SSH ?', back: 'Port 22 (TCP)', category: 'Réseaux' },
        { front: 'Que signifie l’acronyme RLS dans Supabase / PostgreSQL ?', back: 'Row Level Security (Sécurité au niveau des lignes)', category: 'Sécurité' },
        { front: 'Quelle est la commande Linux pour changer les permissions d’un fichier ?', back: 'chmod (ex: chmod 755 fichier.txt)', category: 'Linux' },
        { front: 'En SQL, quelle clause permet de filtrer les résultats d’un GROUP BY ?', back: 'La clause HAVING (contrairement à WHERE qui filtre avant le regroupement)', category: 'SQL' },
        { front: 'Quel document formalise la gestion de crise IT selon la BCC ?', back: 'Le Plan de Continuité d’Activité (PCA)', category: 'BCC' }
    ];

    function openFlashcardsModal() {
        let modal = document.getElementById('paradis-flashcard-modal');
        if (modal) { modal.remove(); return; }

        currentCards = [...FLASHCARD_DATA];
        currentIndex = 0;
        isFlipped = false;

        modal = document.createElement('div');
        modal.id = 'paradis-flashcard-modal';
        modal.className = 'paradis-flashcard-modal';

        modal.innerHTML = `
            <div style="width: 100%; max-width: 550px; display: flex; justify-content: space-between; align-items: center;">
                <h3 style="margin: 0; color: #06b6d4;">💡 Cartes Mémoire (Flashcards IT)</h3>
                <button type="button" onclick="document.getElementById('paradis-flashcard-modal').remove()" style="background: none; border: none; color: #9ca3af; font-size: 24px; cursor: pointer;">&times;</button>
            </div>

            <div class="paradis-flashcard-scene" onclick="window.ParadisFlashcards.flipCard()">
                <div id="paradis-fc-inner" class="paradis-flashcard-inner">
                    <div class="paradis-flashcard-face paradis-flashcard-front">
                        <div style="font-size: 0.8rem; font-weight: 700; color: #06b6d4;" id="paradis-fc-cat">CATEGORIE</div>
                        <div style="font-size: 1.1rem; font-weight: 600;" id="paradis-fc-front-text">Question...</div>
                        <div style="font-size: 0.75rem; color: #9ca3af; text-align: center;">Cliquez pour retourner la carte 🔄</div>
                    </div>
                    <div class="paradis-flashcard-face paradis-flashcard-back">
                        <div style="font-size: 0.8rem; font-weight: 700; color: #10b981;">RÉPONSE</div>
                        <div style="font-size: 1.1rem; font-weight: 600; color: #6ee7b7;" id="paradis-fc-back-text">Réponse...</div>
                        <div style="font-size: 0.75rem; color: #9ca3af; text-align: center;">Cliquez pour retourner 🔄</div>
                    </div>
                </div>
            </div>

            <div class="paradis-flashcard-controls">
                <button type="button" class="paradis-fc-btn" style="background: #ef4444; color: #fff;" onclick="window.ParadisFlashcards.nextCard()">❌ À Réviser</button>
                <button type="button" class="paradis-fc-btn" style="background: #10b981; color: #fff;" onclick="window.ParadisFlashcards.nextCard()">✅ Assimilé</button>
            </div>
        `;

        document.body.appendChild(modal);
        renderCurrentCard();
    }

    function renderCurrentCard() {
        if (currentCards.length === 0) return;
        const card = currentCards[currentIndex];

        document.getElementById('paradis-fc-cat').textContent = card.category;
        document.getElementById('paradis-fc-front-text').textContent = card.front;
        document.getElementById('paradis-fc-back-text').textContent = card.back;

        const inner = document.getElementById('paradis-fc-inner');
        if (inner) inner.classList.remove('flipped');
        isFlipped = false;
    }

    function flipCard() {
        const inner = document.getElementById('paradis-fc-inner');
        if (inner) {
            inner.classList.toggle('flipped');
            isFlipped = !isFlipped;
        }
    }

    function nextCard() {
        currentIndex = (currentIndex + 1) % currentCards.length;
        renderCurrentCard();
    }

    window.ParadisFlashcards = {
        openFlashcardsModal,
        flipCard,
        nextCard
    };
})();
