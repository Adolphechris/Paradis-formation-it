/**
 * PARADIS — Tuteur IA (Sprint 27 — v2)
 *
 * Interface de chat et assistant IA pour l'apprentissage IT Bancaire :
 *   - Widget de chat flottant Glassmorphism
 *   - Réponses contextualisées par mots-clés (moteur de règles riche)
 *   - Suggestions de questions rapides
 *   - Indicateur de frappe animé
 */
(function () {
    'use strict';

    // ── Base de connaissances contextuelle ──────────────────────────────────────
    const KB = [
        {
            keys: ['python', 'script', 'fonction', 'variable', 'boucle', 'liste', 'dict', 'pandas', 'numpy'],
            responses: [
                '🐍 **Python** est au cœur du programme P2 (J4–J11). En Python, les listes sont mutables (`list = []`) tandis que les tuples sont immuables. Pour les données bancaires, `pandas` permet l\'analyse de fichiers CSV de transactions. As-tu consulté le Tome P2 sur les structures de données ?',
                '💡 Pour Python dans le contexte BCC : les scripts d\'automatisation Bash+Python sont très demandés. Maîtrise `os`, `subprocess`, `csv` et `json`. La BCC utilise des scripts pour le traitement des fichiers RTGS et SWIFT. Consulte le Tome P2, Jour 5-6.',
                '🔧 En Python, un pattern très utilisé en banque : `try/except` pour la gestion des erreurs dans les appels API. N\'oublie pas les type hints et la documentation PEP8. Tome P2 > Jour 7 couvre le scripting avancé.'
            ]
        },
        {
            keys: ['sql', 'base de donnée', 'base de données', 'postgresql', 'requête', 'requete', 'jointure', 'select', 'insert', 'table', 'index', 'bdd'],
            responses: [
                '🗄️ **SQL/PostgreSQL** est essentiel pour les systèmes bancaires. La BCC utilise des SGBD relationnels pour les registres de comptes et les journaux de transactions. Points clés Tome P3B : INDEX pour les performances, TRANSACTIONS ACID, et les vues matérialisées pour les rapports.',
                '📊 Pour les bases de données bancaires (Tome P3B, J18-J22) : maîtrise les JOINs (INNER, LEFT, RIGHT), les fonctions de fenêtrage (`ROW_NUMBER`, `RANK`), et les CTEs (`WITH`). En production BCC, les requêtes sur les tables de millions de transactions doivent être optimisées avec EXPLAIN ANALYZE.',
                '💡 Un exemple SQL critique pour la BCC : détecter les transactions suspectes avec `SELECT * FROM transactions WHERE montant > 10000 AND heure BETWEEN \'00:00\' AND \'06:00\'`. Le Tome P3B couvre aussi la réplication PostgreSQL pour la haute disponibilité.'
            ]
        },
        {
            keys: ['réseau', 'reseau', 'tcp', 'ip', 'dns', 'dhcp', 'vlan', 'switch', 'routeur', 'routeur', 'pare-feu', 'firewall', 'wifi', 'http', 'https'],
            responses: [
                '🌐 **Les réseaux** sont fondamentaux à la BCC (Tome P2, J8-J9 + Tome P4). Le modèle OSI à 7 couches : Physique, Liaison, Réseau, Transport, Session, Présentation, Application. Pour les systèmes interbancaires, TCP/IP assure la fiabilité des transferts SWIFT.',
                '🔒 En environnement bancaire, les VLAN segmentent le réseau : VLAN 10 (opérations), VLAN 20 (gestion), VLAN 30 (DMZ). Le pare-feu filtre le trafic entre ces segments. Tome P4 couvre la topologie réseau sécurisée des institutions financières.',
                '💡 Pour les examens BCC : maîtrise le sous-réseau (subnetting). Exemple : 192.168.10.0/26 donne 62 hôtes utilisables. Les DNS internes et DHCP sont administrés par l\'équipe réseau de la BCC. Consulte Tome P2 > réseaux.'
            ]
        },
        {
            keys: ['sécurité', 'securite', 'hacker', 'hack', 'chiffrement', 'cryptographie', 'ssl', 'tls', 'certificat', 'vpn', 'audit', 'pentest', 'malware', 'virus'],
            responses: [
                '🔐 **Cybersécurité bancaire** (Tome P4, J29-J35) : la BCC applique la norme ISO 27001. Les piliers : Confidentialité, Intégrité, Disponibilité (CIA). Le chiffrement AES-256 protège les données au repos, TLS 1.3 les données en transit. Les certificats X.509 authentifient les parties.',
                '🛡️ En sécurité BCC, les menaces principales : phishing ciblé, ransomware sur les systèmes legacy, et attaques Man-in-the-Middle sur les réseaux non chiffrés. La défense en profondeur : pare-feu + IDS/IPS + SIEM + formation des utilisateurs. Tome P4 > Cybersécurité.',
                '💡 Les audits de sécurité à la BCC suivent le framework NIST CSF : Identifier, Protéger, Détecter, Répondre, Récupérer. La gestion des accès (IAM) avec le principe du moindre privilège est fondamentale. Tome P4 couvre aussi la conformité réglementaire bancaire.'
            ]
        },
        {
            keys: ['cloud', 'aws', 'azure', 'gcp', 'serveur', 'docker', 'kubernetes', 'vm', 'virtuel', 'virtualisation', 'vmware', 'hyper-v'],
            responses: [
                '☁️ **Cloud & Virtualisation** (Tome P4, J29-J35) : les banques centrales africaines migrent progressivement vers des architectures hybrides (cloud privé + cloud public). AWS propose RDS pour les bases de données et S3 pour les archives. La BCC évalue ces technologies pour la modernisation.',
                '🖥️ La virtualisation avec VMware vSphere est standard dans les datacenters bancaires. Avantages : isolation, snapshots pour la reprise après incident, meilleure utilisation des ressources. Tome P4 > Virtualisation couvre la configuration d\'un hyperviseur pour un environnement bancaire.',
                '💡 Docker et conteneurs en contexte bancaire : déploiement rapide des microservices, isolation des applications critiques. Kubernetes orchestre ces conteneurs en production. Cependant, les banques centrales préfèrent souvent les VMs classiques pour les systèmes cœur métier (RTGS, SWIFT).'
            ]
        },
        {
            keys: ['swift', 'rtgs', 'monétique', monetique', 'virement', 'transaction', 'bcc', 'banque centrale', 'banque', 'fintech', 'mobile money', 'sepa'],
            responses: [
                '🏦 **SWIFT & RTGS** : SWIFT (Society for Worldwide Interbank Financial Telecommunication) est le réseau mondial de messagerie financière. Les messages SWIFT (MT103, MT202) encodent les virements internationaux. Le RTGS (Real-Time Gross Settlement) de la BCC traite les paiements interbancaires en temps réel. Tome P4 > Systèmes bancaires.',
                '💳 La **monétique** couvre les cartes bancaires (Visa, Mastercard), les TPE, et les DAB/GAB. Les protocoles EMV sécurisent les transactions par puce. En RDC, le Mobile Money (M-Pesa, Orange Money) est crucial. La BCC réglemente ces systèmes. Tome P4 > Fintech & Paiements.',
                '📡 Pour l\'examen BCC IT : connais la différence entre RTGS (règlement brut en temps réel, montants élevés) et STEP2/ACH (compensation différée, petits montants). La BCC gère les deux systèmes. Le SWIFT GPI améliore la traçabilité des virements internationaux.'
            ]
        },
        {
            keys: ['linux', 'ubuntu', 'debian', 'centos', 'bash', 'shell', 'terminal', 'commande', 'chmod', 'chown', 'systemd', 'service', 'cron'],
            responses: [
                '🐧 **Linux** est l\'OS de référence pour les serveurs bancaires (Tome P2 + P3A). Commandes essentielles BCC : `systemctl` pour gérer les services, `journalctl` pour les logs, `crontab` pour les tâches planifiées (rapports nuits). La maîtrise de `grep`, `awk`, `sed` est indispensable pour analyser les logs RTGS.',
                '⚙️ Administration Linux pour la BCC (Tome P3A, J12-J17) : permissions avec `chmod 750` (propriétaire:rwx, groupe:rx, autres:aucun). La séparation des privilèges est critique en banque. `sudo` avec `sudoers` configure les accès fin. Les services bancaires tournent souvent en `systemd` units.',
                '💡 Script Bash utile pour audit BCC : `find /var/log -name "*.log" -mtime -1 | xargs grep -i "error\|fail" > /tmp/audit_$(date +%Y%m%d).txt`. Tome P2 > Bash couvre les scripts d\'automatisation pour les tâches quotidiennes des équipes IT bancaires.'
            ]
        },
        {
            keys: ['windows', 'active directory', 'active-directory', 'ad', 'gpo', 'powershell', 'domain', 'domaine', 'serveur windows'],
            responses: [
                '🪟 **Windows Server & Active Directory** (Tome P3A) : l\'AD est central dans les environnements bancaires Windows. Les GPO (Group Policy Objects) appliquent les politiques de sécurité sur tous les postes. Exemple BCC : politique de mot de passe (12 caractères, complexité, expiration 90 jours).',
                '💻 PowerShell est l\'outil d\'administration Windows incontournable. Script utile : `Get-ADUser -Filter * -Properties LastLogonDate | Where {$_.LastLogonDate -lt (Get-Date).AddDays(-90)} | Export-CSV inactive_users.csv` — identifie les comptes inactifs, critique pour l\'audit de sécurité BCC.',
                '🔐 Dans un domaine Windows bancaire, les rôles FSMO sont essentiels : PDC Emulator, RID Master, Infrastructure Master. La réplication AD entre contrôleurs de domaine doit être surveillée. Consulte Tome P3A > Windows Server pour la configuration complète.'
            ]
        },
        {
            keys: ['examen', 'concours', 'qcm', 'quiz', 'révision', 'revision', 'exercice', 'préparer', 'preparer', 'test'],
            responses: [
                '📝 **Préparation aux concours BCC** (Tome P5, J36-J41) : les épreuves couvrent Culture IT générale, Réseaux & Sécurité, Bases de données, et une partie Culture Bancaire. Utilise le module QCM de PARADIS pour t\'exercer quotidiennement. Vise 75% de bonnes réponses avant de passer à la suite.',
                '🎯 Stratégie d\'examen BCC : 1) Révise les définitions clés (OSI, TCP/IP, SQL JOIN types), 2) Maîtrise les calculs de sous-réseaux, 3) Comprends les protocoles SWIFT/RTGS, 4) Pratique les QCM chronométrés. Le module Examen Blanc (Tome P5) simule les conditions réelles.',
                '💡 Les questions BCC les plus fréquentes portent sur : la sécurité réseau (pare-feu, DMZ), la reprise après sinistre (RTO/RPO), les bases de données SQL, et les systèmes d\'exploitation (Linux/Windows). Accède au module QCM depuis le menu principal pour t\'entraîner.'
            ]
        },
        {
            keys: ['emploi', 'cv', 'recrutement', 'entretien', 'portfolio', 'certificat', 'diplome', 'poste'],
            responses: [
                '💼 **Portfolio & Employabilité** (Tome P6, J42-J45) : après PARADIS, tu auras 4-6 projets concrets à présenter : script d\'audit réseau, base de données bancaire, dashboard Python, et configuration serveur. Ces projets sont directement valorisables dans un CV IT pour la BCC ou les banques commerciales.',
                '🏆 Pour l\'entretien technique BCC : prépare-toi à des questions pratiques (configurer un VLAN, écrire une requête SQL complexe, expliquer le chiffrement TLS). La certification de complétion PARADIS (générée automatiquement en J45) atteste de ton niveau. Tome P6 > Rapport d\'employabilité.',
                '🎓 Les profils recherchés par la BCC : Technicien Support Niveau 2, Administrateur Système, DBA Junior, Technicien Réseaux. Avec PARADIS, tu as couvert toutes ces spécialités. PARADIS génère un badge numérique d\'employabilité visible dans ton profil.'
            ]
        },
        {
            keys: ['aide', 'bonjour', 'salut', 'hello', 'bonsoir', 'comment', 'qui es tu', 'quoi', 'programme', 'paradis'],
            responses: [
                '👋 Bonjour ! Je suis le **Tuteur IA PARADIS**, ton assistant personnel pour la formation IT Bancaire. Je peux t\'aider sur : Python, SQL, Réseaux, Sécurité, Linux, Windows Server, SWIFT/RTGS, et la préparation aux concours BCC. Que veux-tu apprendre aujourd\'hui ?',
                '🤖 Je suis là pour t\'accompagner tout au long des 45 jours de formation PARADIS. Tu peux me poser des questions sur n\'importe quel concept IT, demander des explications sur un cours, ou obtenir des conseils de préparation aux examens BCC. Par où veux-tu commencer ?',
                '🎓 PARADIS IT = 630h de formation intensive en 45 jours pour maîtriser le Bachelor of Information Technology calibré BCC. Mon rôle : t\'expliquer, clarifier et approfondir chaque concept. Pose-moi ta question ou dis-moi sur quel tome tu travailles !'
            ]
        }
    ];

    const DEFAULT_RESPONSES = [
        '🧠 Intéressant ! Ce sujet n\'est pas dans ma base directe, mais voici ce que je sais : en IT bancaire, tout concept technique s\'applique dans un contexte de haute disponibilité, sécurité et conformité réglementaire. Peux-tu préciser ta question ? Je peux t\'aider sur Python, SQL, Réseaux, Sécurité, Linux, SWIFT ou la préparation BCC.',
        '💡 Je ne trouve pas de réponse spécifique à cela dans le programme PARADIS. Essaie de reformuler ou utilise la **recherche** (Ctrl+K) pour trouver le tome correspondant. Tu peux aussi me demander : "Explique-moi les réseaux TCP/IP" ou "Comment fonctionne SQL JOIN ?".',
        '📚 Cette question semble sortir de mon domaine de spécialisation BCC. Pour les sujets hors-programme, je te recommande de consulter la documentation officielle ou d\'utiliser la recherche intégrée PARADIS. Pour les cours, quel tome étudies-tu actuellement ?'
    ];

    const QUICK_QUESTIONS = [
        'Explique-moi le protocole SWIFT',
        'Quelle est la différence entre TCP et UDP ?',
        'Comment fonctionne SQL JOIN ?',
        'Qu\'est-ce qu\'un VLAN ?',
        'Comment préparer l\'examen BCC ?'
    ];

    // ── Logique de réponse intelligente ────────────────────────────────────────
    function getResponse(userMessage) {
        const msg = userMessage.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        
        let bestMatch = null;
        let bestScore = 0;

        for (const entry of KB) {
            let score = 0;
            for (const key of entry.keys) {
                const normalizedKey = key.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
                if (msg.includes(normalizedKey)) {
                    score += normalizedKey.length; // pondération par longueur du mot-clé
                }
            }
            if (score > bestScore) {
                bestScore = score;
                bestMatch = entry;
            }
        }

        if (bestMatch && bestScore > 0) {
            const responses = bestMatch.responses;
            // Sélection pseudo-aléatoire basée sur le message (pas toujours le même)
            const idx = Math.abs(userMessage.split('').reduce((a, c) => a + c.charCodeAt(0), 0)) % responses.length;
            return responses[idx];
        }

        return DEFAULT_RESPONSES[Math.floor(Math.random() * DEFAULT_RESPONSES.length)];
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
            .paradis-chat-trigger:hover {
                transform: translateY(-3px);
                box-shadow: 0 12px 30px rgba(139, 92, 246, 0.7);
                animation: none;
            }
            .paradis-chat-box {
                position: fixed;
                bottom: 145px;
                right: 25px;
                width: 400px;
                height: 550px;
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
                to { opacity: 1; transform: translateY(0) scale(1); }
            }
            .paradis-chat-header {
                padding: 16px 18px;
                border-bottom: 1px solid rgba(139, 92, 246, 0.2);
                display: flex;
                justify-content: space-between;
                align-items: center;
                background: rgba(139, 92, 246, 0.08);
            }
            .paradis-chat-header-info {
                display: flex;
                align-items: center;
                gap: 10px;
            }
            .paradis-chat-avatar {
                width: 36px;
                height: 36px;
                background: linear-gradient(135deg, #8b5cf6, #3b82f6);
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 18px;
            }
            .paradis-chat-header-text h4 {
                margin: 0;
                color: #a78bfa;
                font-size: 0.95rem;
                font-weight: 700;
            }
            .paradis-chat-status {
                font-size: 0.72rem;
                color: #10b981;
                display: flex;
                align-items: center;
                gap: 4px;
            }
            .paradis-chat-status::before {
                content: '';
                width: 6px;
                height: 6px;
                background: #10b981;
                border-radius: 50%;
                display: inline-block;
                animation: statusPulse 1.5s ease infinite;
            }
            @keyframes statusPulse {
                0%, 100% { opacity: 1; }
                50% { opacity: 0.4; }
            }
            .paradis-chat-close-btn {
                background: none;
                border: none;
                color: #6b7280;
                font-size: 22px;
                cursor: pointer;
                transition: color 0.2s;
                line-height: 1;
            }
            .paradis-chat-close-btn:hover { color: #a78bfa; }
            .paradis-chat-messages {
                flex: 1;
                padding: 16px;
                overflow-y: auto;
                display: flex;
                flex-direction: column;
                gap: 12px;
                scrollbar-width: thin;
                scrollbar-color: rgba(139, 92, 246, 0.3) transparent;
            }
            .paradis-chat-messages::-webkit-scrollbar { width: 4px; }
            .paradis-chat-messages::-webkit-scrollbar-thumb { background: rgba(139, 92, 246, 0.3); border-radius: 4px; }
            .paradis-msg {
                padding: 10px 14px;
                border-radius: 14px;
                font-size: 0.875rem;
                max-width: 88%;
                line-height: 1.5;
                word-break: break-word;
            }
            .paradis-msg.user {
                background: linear-gradient(135deg, #3b82f6, #1d4ed8);
                color: #fff;
                align-self: flex-end;
                border-radius: 14px 14px 4px 14px;
                box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
            }
            .paradis-msg.bot {
                background: rgba(31, 41, 55, 0.9);
                border: 1px solid rgba(139, 92, 246, 0.2);
                color: #e5e7eb;
                align-self: flex-start;
                border-radius: 14px 14px 14px 4px;
            }
            .paradis-msg.bot strong { color: #a78bfa; }
            .paradis-msg.bot code {
                background: rgba(0,0,0,0.4);
                padding: 1px 5px;
                border-radius: 4px;
                font-size: 0.82rem;
                color: #06b6d4;
            }
            .paradis-typing {
                display: flex;
                align-items: center;
                gap: 5px;
                padding: 12px 16px;
                background: rgba(31, 41, 55, 0.9);
                border: 1px solid rgba(139, 92, 246, 0.2);
                border-radius: 14px 14px 14px 4px;
                align-self: flex-start;
                max-width: 80px;
            }
            .paradis-typing span {
                width: 7px;
                height: 7px;
                background: #a78bfa;
                border-radius: 50%;
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
                display: flex;
                flex-wrap: wrap;
                gap: 6px;
                border-top: 1px solid rgba(139, 92, 246, 0.1);
            }
            .paradis-quick-q {
                background: rgba(139, 92, 246, 0.1);
                border: 1px solid rgba(139, 92, 246, 0.25);
                color: #c4b5fd;
                border-radius: 20px;
                padding: 4px 10px;
                font-size: 0.75rem;
                cursor: pointer;
                transition: all 0.2s;
                white-space: nowrap;
            }
            .paradis-quick-q:hover {
                background: rgba(139, 92, 246, 0.25);
                color: #fff;
            }
            .paradis-chat-input-area {
                padding: 12px 14px;
                border-top: 1px solid rgba(255,255,255,0.06);
                display: flex;
                gap: 8px;
                align-items: flex-end;
            }
            .paradis-chat-input {
                flex: 1;
                background: rgba(31, 41, 55, 0.9);
                border: 1px solid rgba(139, 92, 246, 0.25);
                border-radius: 10px;
                padding: 10px 14px;
                color: #fff;
                font-size: 0.875rem;
                outline: none;
                resize: none;
                min-height: 40px;
                max-height: 100px;
                transition: border-color 0.2s;
                font-family: inherit;
                line-height: 1.4;
            }
            .paradis-chat-input:focus {
                border-color: #8b5cf6;
                box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.15);
            }
            .paradis-chat-input::placeholder { color: #6b7280; }
            .paradis-chat-send-btn {
                background: linear-gradient(135deg, #8b5cf6, #3b82f6);
                color: #fff;
                border: none;
                border-radius: 10px;
                width: 40px;
                height: 40px;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                transition: transform 0.15s, box-shadow 0.15s;
                flex-shrink: 0;
            }
            .paradis-chat-send-btn:hover {
                transform: scale(1.05);
                box-shadow: 0 4px 15px rgba(139, 92, 246, 0.5);
            }

            @media (max-width: 480px) {
                .paradis-chat-box { width: calc(100vw - 30px); right: 15px; bottom: 130px; }
                .paradis-chat-trigger { right: 15px; padding: 10px 16px; font-size: 0.82rem; }
            }
        `;
        document.head.appendChild(style);
    }

    // ── Injection du markup ────────────────────────────────────────────────────
    function injectChatUI() {
        if (document.getElementById('paradis-chat-trigger')) return;

        // Bouton déclencheur
        const btn = document.createElement('button');
        btn.id = 'paradis-chat-trigger';
        btn.className = 'paradis-chat-trigger';
        btn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg> Tuteur IA';
        btn.onclick = toggleChat;
        document.body.appendChild(btn);

        // Boîte de chat
        const box = document.createElement('div');
        box.id = 'paradis-chat-box';
        box.className = 'paradis-chat-box';
        box.innerHTML = `
            <div class="paradis-chat-header">
                <div class="paradis-chat-header-info">
                    <div class="paradis-chat-avatar">🤖</div>
                    <div class="paradis-chat-header-text">
                        <h4>Tuteur IA PARADIS</h4>
                        <div class="paradis-chat-status">En ligne — Programme IT BCC</div>
                    </div>
                </div>
                <button type="button" class="paradis-chat-close-btn" onclick="window.ParadisChat.toggleChat()">&times;</button>
            </div>
            <div id="paradis-chat-messages" class="paradis-chat-messages">
                <div class="paradis-msg bot">👋 Bonjour ! Je suis votre <strong>Tuteur IA PARADIS</strong>. Posez-moi vos questions sur le programme IT Bancaire — Python, SQL, Réseaux, Sécurité, SWIFT, Linux ou la préparation aux concours <strong>BCC</strong>.</div>
            </div>
            <div class="paradis-quick-qs" id="paradis-quick-qs"></div>
            <div class="paradis-chat-input-area">
                <textarea id="paradis-chat-input" class="paradis-chat-input" placeholder="Posez votre question..." rows="1"></textarea>
                <button type="button" class="paradis-chat-send-btn" onclick="window.ParadisChat.sendUserMessage()" title="Envoyer">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                </button>
            </div>
        `;
        document.body.appendChild(box);

        // Questions rapides
        const quickQsContainer = document.getElementById('paradis-quick-qs');
        QUICK_QUESTIONS.forEach(q => {
            const btn = document.createElement('button');
            btn.className = 'paradis-quick-q';
            btn.textContent = q;
            btn.onclick = () => {
                const input = document.getElementById('paradis-chat-input');
                if (input) {
                    input.value = q;
                    sendUserMessage();
                }
            };
            quickQsContainer.appendChild(btn);
        });

        // Touche Entrée pour envoyer (Shift+Entrée = nouvelle ligne)
        const inputEl = document.getElementById('paradis-chat-input');
        if (inputEl) {
            inputEl.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendUserMessage();
                }
            });
            // Auto-resize du textarea
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
            const input = document.getElementById('paradis-chat-input');
            if (input) setTimeout(() => input.focus(), 300);
        }
    }

    // Rendu Markdown simple (gras, code inline)
    function renderMarkdown(text) {
        return text
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/`(.*?)`/g, '<code>$1</code>')
            .replace(/\n/g, '<br>');
    }

    function sendUserMessage() {
        const input = document.getElementById('paradis-chat-input');
        const msgs = document.getElementById('paradis-chat-messages');
        if (!input || !msgs) return;

        const text = input.value.trim();
        if (!text) return;

        // Message utilisateur
        const uMsg = document.createElement('div');
        uMsg.className = 'paradis-msg user';
        uMsg.textContent = text;
        msgs.appendChild(uMsg);

        input.value = '';
        input.style.height = 'auto';
        msgs.scrollTop = msgs.scrollHeight;

        // Masquer les suggestions après première utilisation
        const quickQs = document.getElementById('paradis-quick-qs');
        if (quickQs) quickQs.style.display = 'none';

        // Indicateur de frappe
        const typingEl = document.createElement('div');
        typingEl.className = 'paradis-typing';
        typingEl.innerHTML = '<span></span><span></span><span></span>';
        msgs.appendChild(typingEl);
        msgs.scrollTop = msgs.scrollHeight;

        // Délai réaliste selon la longueur de la réponse
        const response = getResponse(text);
        const delay = 600 + Math.min(response.length * 1.5, 1500);

        setTimeout(() => {
            typingEl.remove();
            const bMsg = document.createElement('div');
            bMsg.className = 'paradis-msg bot';
            bMsg.innerHTML = renderMarkdown(response);
            msgs.appendChild(bMsg);
            msgs.scrollTop = msgs.scrollHeight;
        }, delay);
    }

    // Initialisation
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', injectChatUI);
    } else {
        injectChatUI();
    }

    window.ParadisChat = {
        injectChatUI,
        toggleChat,
        sendUserMessage
    };
})();
