/**
 * PARADIS — Banque Centralisée de Questions QCM par Tome (Sprint 17)
 *
 * Banque structurée de questions QCM couvrant les 8 tomes de la formation BCC :
 *   - Tome P0 : Support & Bureautique
 *   - Tome P2 : Systèmes & Réseaux Fondamentaux
 *   - Tome P3A : Administration Systèmes & Réseaux Avancés
 *   - Tome P3B : Data, SQL & Bases de Données Bancaires
 *   - Tome P3C : Développement, Algo & Scripting
 *   - Tome P4 : Cloud, Infrastructure & Sécurité
 *   - Tome P5 : Gouvernance, Rigeur & Audit IT Bancaire
 *   - Tome P6 : Réglementation & Normes BCC
 */
(function () {
    'use strict';

    const QUESTION_BANK = [
        // Tome P0 (Jours 01-03)
        {
            id: 'p0-j1-q1',
            tome: 'P0',
            dayId: 'jour-01',
            question: 'En maintenance bureautique N1, quelle est la première étape en cas de panne d’affichage d’un écran ?',
            choices: [
                'Changer immédiatement la carte graphique',
                'Vérifier le câblage électrique et la connexion vidéo (HDMI/VGA/DP)',
                'Reconfigurer le registre système Windows',
                'Appeler directement le support N3'
            ],
            correct_index: 1,
            explanation: 'La vérification physique des connexions est la règle fondamentale du dépannage N1.',
            difficulty: 'easy'
        },
        {
            id: 'p0-j2-q1',
            tome: 'P0',
            dayId: 'jour-02',
            question: 'Quel outil permet de vérifier la connectivité réseau de base entre deux machines ?',
            choices: ['nslookup', 'ping', 'chkdsk', 'sfc /scannow'],
            correct_index: 1,
            explanation: 'La commande ping utilise le protocole ICMP pour tester l’accessibilité d’un hôte distant.',
            difficulty: 'easy'
        },
        // Tome P2 (Jours 04-11)
        {
            id: 'p2-j4-q1',
            tome: 'P2',
            dayId: 'jour-04',
            question: 'Quelle est la plage d’adresses IPv4 privées de Classe A selon le RFC 1918 ?',
            choices: ['10.0.0.0 à 10.255.255.255', '172.16.0.0 à 172.31.255.255', '192.168.0.0 à 192.168.255.255', '127.0.0.0 à 127.255.255.255'],
            correct_index: 0,
            explanation: 'Le bloc 10.0.0.0/8 est réservé aux réseaux privés de Classe A.',
            difficulty: 'medium'
        },
        // Tome P3A (Jours 12-17)
        {
            id: 'p3a-j12-q1',
            tome: 'P3A',
            dayId: 'jour-12',
            question: 'Sous Linux, quelle commande permet d’afficher l’utilisation du disque en format lisible (Human Readable) ?',
            choices: ['df -h', 'du -s', 'ls -la', 'fdisk -l'],
            correct_index: 0,
            explanation: 'La commande `df -h` affiche les systèmes de fichiers montés et leur espace disponible avec des unités compréhensibles (Mo, Go).',
            difficulty: 'medium'
        },
        // Tome P3B (Jours 18-22)
        {
            id: 'p3b-j18-q1',
            tome: 'P3B',
            dayId: 'jour-18',
            question: 'En SQL, quel mot-clé garantit l’unicité des lignes renvoyées par une requête SELECT ?',
            choices: ['UNIQUE', 'DISTINCT', 'GROUP BY', 'HAVING'],
            correct_index: 1,
            explanation: 'Le mot-clé `DISTINCT` élimine les doublons dans le jeu de résultats d’une requête SQL.',
            difficulty: 'medium'
        },
        // Tome P4 (Jours 29-35)
        {
            id: 'p4-j29-q1',
            tome: 'P4',
            dayId: 'jour-29',
            question: 'Quel est le principe fondamental de l’architecture Zero Trust en sécurité informatique ?',
            choices: ['Faire confiance à toutes les machines du réseau interne', 'Ne jamais faire confiance, toujours vérifier ("Never Trust, Always Verify")', 'Utiliser un seul mot de passe fort pour tous les services', 'Désactiver les pare-feu de bordure'],
            correct_index: 1,
            explanation: 'Le modèle Zero Trust exige la vérification continue de l’identité et de la conformité de chaque accès, qu’il vienne de l’intérieur ou de l’extérieur.',
            difficulty: 'hard'
        },
        // Tome P5 & P6 (Jours 36-45)
        {
            id: 'p6-j42-q1',
            tome: 'P6',
            dayId: 'jour-42',
            question: 'Selon la réglementation bancaire BCC, quel document formalise la continuité des opérations en cas de sinistre majeur ?',
            choices: ['Le Cahier des Charges de l’application', 'Le Plan de Continuité d’Activité (PCA)', 'Le Manuel utilisateur', 'La Charte Graphique du site web'],
            correct_index: 1,
            explanation: 'Le PCA (Plan de Continuité d’Activité) définit les stratégies et procédures permettant à la banque de maintenir ou reprendre ses activités après un incident critique.',
            difficulty: 'hard'
        }
    ];

    /**
     * Obtenir des questions filtrées par Tome
     */
    function getQuestionsByTome(tome) {
        return QUESTION_BANK.filter(q => q.tome === tome);
    }

    /**
     * Obtenir des questions filtrées par Jour
     */
    function getQuestionsByDay(dayId) {
        return QUESTION_BANK.filter(q => q.dayId === dayId);
    }

    /**
     * Tirer un échantillon aléatoire de N questions
     */
    function getRandomQuestions(count = 10, filterTome = null) {
        const source = filterTome ? getQuestionsByTome(filterTome) : [...QUESTION_BANK];
        const shuffled = [...source].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, count);
    }

    window.ParadisQCMBank = {
        QUESTION_BANK,
        getQuestionsByTome,
        getQuestionsByDay,
        getRandomQuestions
    };

    console.info('[PARADIS] Banque de QCM par Tome initialisée.');
})();
