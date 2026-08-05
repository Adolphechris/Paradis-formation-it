/**
 * PARADIS — QCM Quiz Engine & Système de Progression Verrouillée (75% Minimum)
 *
 * Moteur d'évaluation interactive et de verrouillage pédagogique :
 *   - Banque de QCM avec explications corrigées pour chaque question
 *   - Évaluation instantanée avec note globale et corrigé détaillé
 *   - Verrouillage du passage au Jour suivant si le score < 75%
 *   - Déverrouillage automatique du Jour N+1 dès que 75% est atteint
 *   - Examens de fin de Tome (P0, P2, P3A, P3B, P3C, P4, P5, P6)
 */
(function () {
    'use strict';

    const PASSING_SCORE = 75; // 75% minimum exigé

    // -----------------------------------------------------------------------
    // Banque de questions interactives par Jour
    // -----------------------------------------------------------------------
    const QUIZ_BANK = {
        "jour-01": [
            {
                id: "j1-q1",
                question: "Quel est le concept cl\u00e9 au c\u0153ur de la le\u00e7on du Jour 01 (Prise en main Linux & Windows) ?",
                choices: [
                    "La ma\u00eetrise pratique de d\u00e9couverte du terminal, commandes de base et gestion syst\u00e8me",
                    "La m\u00e9morisation purement th\u00e9orique des d\u00e9finitions",
                    "L\u2019inactivation des fonctionnalit\u00e9s de s\u00e9curit\u00e9",
                    "L\u2019ex\u00e9cution al\u00e9atoire de commandes syst\u00e8me",
                ],
                correct_index: 0,
                explanation: "La le\u00e7on du Jour 01 est ax\u00e9e sur la ma\u00eetrise op\u00e9rationnelle de d\u00e9couverte du terminal, commandes de base et gestion syst\u00e8me."
            },
            {
                id: "j1-q2",
                question: "Quelle est la premi\u00e8re action recommand\u00e9e lors de la mise en pratique du Jour 01 ?",
                choices: [
                    "Modifier directement les fichiers sans sauvegarde",
                    "Inspecter l\u2019\u00e9tat du syst\u00e8me et v\u00e9rifier les pr\u00e9requis techniques",
                    "Ignorer les messages d\u2019erreur du terminal",
                    "Supprimer les comptes d\u2019acc\u00e8s administrateur",
                ],
                correct_index: 1,
                explanation: "Une inspection rigoureuse et la v\u00e9rification des pr\u00e9requis permettent d\u2019\u00e9viter les erreurs de configuration."
            },
            {
                id: "j1-q3",
                question: "En cas de dysfonctionnement sur un outil vu au Jour 01, quel r\u00e9flexe adopter ?",
                choices: [
                    "Consulter les logs pertinents et analyser le code de retour",
                    "Fermer la session et ignorer le probl\u00e8me",
                    "R\u00e9installer int\u00e9gralement le syst\u00e8me d\u2019exploitation",
                    "D\u00e9sactiver le pare-feu et les contr\u00f4les d\u2019acc\u00e8s",
                ],
                correct_index: 0,
                explanation: "L\u2019analyse factuelle des logs et codes d\u2019erreur est l\u2019attitude requise pour un diagnostic professionnel."
            },
            {
                id: "j1-q4",
                question: "Quel r\u00e9sultat valide la ma\u00eetrise de la journ\u00e9e du Jour 01 ?",
                choices: [
                    "Un score de 75% minimum au QCM et des exercices pratiques compl\u00e9t\u00e9s",
                    "La simple consultation de la page sans r\u00e9pondre aux questions",
                    "Un passage automatique bas\u00e9 sur le temps pass\u00e9",
                    "Une r\u00e9ponse donn\u00e9e au hasard sans justification",
                ],
                correct_index: 0,
                explanation: "Le seuil exigeant de 75% combin\u00e9 aux livrables pratiques garantit une vraie mont\u00e9e en comp\u00e9tences."
            }
        ],
        "jour-02": [
            {
                id: "j2-q1",
                question: "Quel est le concept cl\u00e9 au c\u0153ur de la le\u00e7on du Jour 02 (HTML5 / CSS3 & Git) ?",
                choices: [
                    "La ma\u00eetrise pratique de structure web s\u00e9mantique, formulaires et premier commit Git",
                    "La m\u00e9morisation purement th\u00e9orique des d\u00e9finitions",
                    "L\u2019inactivation des fonctionnalit\u00e9s de s\u00e9curit\u00e9",
                    "L\u2019ex\u00e9cution al\u00e9atoire de commandes syst\u00e8me",
                ],
                correct_index: 0,
                explanation: "La le\u00e7on du Jour 02 est ax\u00e9e sur la ma\u00eetrise op\u00e9rationnelle de structure web s\u00e9mantique, formulaires et premier commit Git."
            },
            {
                id: "j2-q2",
                question: "Quelle est la premi\u00e8re action recommand\u00e9e lors de la mise en pratique du Jour 02 ?",
                choices: [
                    "Modifier directement les fichiers sans sauvegarde",
                    "Inspecter l\u2019\u00e9tat du syst\u00e8me et v\u00e9rifier les pr\u00e9requis techniques",
                    "Ignorer les messages d\u2019erreur du terminal",
                    "Supprimer les comptes d\u2019acc\u00e8s administrateur",
                ],
                correct_index: 1,
                explanation: "Une inspection rigoureuse et la v\u00e9rification des pr\u00e9requis permettent d\u2019\u00e9viter les erreurs de configuration."
            },
            {
                id: "j2-q3",
                question: "En cas de dysfonctionnement sur un outil vu au Jour 02, quel r\u00e9flexe adopter ?",
                choices: [
                    "Consulter les logs pertinents et analyser le code de retour",
                    "Fermer la session et ignorer le probl\u00e8me",
                    "R\u00e9installer int\u00e9gralement le syst\u00e8me d\u2019exploitation",
                    "D\u00e9sactiver le pare-feu et les contr\u00f4les d\u2019acc\u00e8s",
                ],
                correct_index: 0,
                explanation: "L\u2019analyse factuelle des logs et codes d\u2019erreur est l\u2019attitude requise pour un diagnostic professionnel."
            },
            {
                id: "j2-q4",
                question: "Quel r\u00e9sultat valide la ma\u00eetrise de la journ\u00e9e du Jour 02 ?",
                choices: [
                    "Un score de 75% minimum au QCM et des exercices pratiques compl\u00e9t\u00e9s",
                    "La simple consultation de la page sans r\u00e9pondre aux questions",
                    "Un passage automatique bas\u00e9 sur le temps pass\u00e9",
                    "Une r\u00e9ponse donn\u00e9e au hasard sans justification",
                ],
                correct_index: 0,
                explanation: "Le seuil exigeant de 75% combin\u00e9 aux livrables pratiques garantit une vraie mont\u00e9e en comp\u00e9tences."
            }
        ],
        "jour-03": [
            {
                id: "j3-q1",
                question: "Quel est le concept cl\u00e9 au c\u0153ur de la le\u00e7on du Jour 03 (Linux CLI & Permissions) ?",
                choices: [
                    "La ma\u00eetrise pratique de arborescence Linux, permissions chmod/chown et processus",
                    "La m\u00e9morisation purement th\u00e9orique des d\u00e9finitions",
                    "L\u2019inactivation des fonctionnalit\u00e9s de s\u00e9curit\u00e9",
                    "L\u2019ex\u00e9cution al\u00e9atoire de commandes syst\u00e8me",
                ],
                correct_index: 0,
                explanation: "La le\u00e7on du Jour 03 est ax\u00e9e sur la ma\u00eetrise op\u00e9rationnelle de arborescence Linux, permissions chmod/chown et processus."
            },
            {
                id: "j3-q2",
                question: "Quelle est la premi\u00e8re action recommand\u00e9e lors de la mise en pratique du Jour 03 ?",
                choices: [
                    "Modifier directement les fichiers sans sauvegarde",
                    "Inspecter l\u2019\u00e9tat du syst\u00e8me et v\u00e9rifier les pr\u00e9requis techniques",
                    "Ignorer les messages d\u2019erreur du terminal",
                    "Supprimer les comptes d\u2019acc\u00e8s administrateur",
                ],
                correct_index: 1,
                explanation: "Une inspection rigoureuse et la v\u00e9rification des pr\u00e9requis permettent d\u2019\u00e9viter les erreurs de configuration."
            },
            {
                id: "j3-q3",
                question: "En cas de dysfonctionnement sur un outil vu au Jour 03, quel r\u00e9flexe adopter ?",
                choices: [
                    "Consulter les logs pertinents et analyser le code de retour",
                    "Fermer la session et ignorer le probl\u00e8me",
                    "R\u00e9installer int\u00e9gralement le syst\u00e8me d\u2019exploitation",
                    "D\u00e9sactiver le pare-feu et les contr\u00f4les d\u2019acc\u00e8s",
                ],
                correct_index: 0,
                explanation: "L\u2019analyse factuelle des logs et codes d\u2019erreur est l\u2019attitude requise pour un diagnostic professionnel."
            },
            {
                id: "j3-q4",
                question: "Quel r\u00e9sultat valide la ma\u00eetrise de la journ\u00e9e du Jour 03 ?",
                choices: [
                    "Un score de 75% minimum au QCM et des exercices pratiques compl\u00e9t\u00e9s",
                    "La simple consultation de la page sans r\u00e9pondre aux questions",
                    "Un passage automatique bas\u00e9 sur le temps pass\u00e9",
                    "Une r\u00e9ponse donn\u00e9e au hasard sans justification",
                ],
                correct_index: 0,
                explanation: "Le seuil exigeant de 75% combin\u00e9 aux livrables pratiques garantit une vraie mont\u00e9e en comp\u00e9tences."
            }
        ],
        "jour-04": [
            {
                id: "j4-q1",
                question: "Quel est le concept cl\u00e9 au c\u0153ur de la le\u00e7on du Jour 04 (Python Fondamentaux) ?",
                choices: [
                    "La ma\u00eetrise pratique de variables, types de donn\u00e9es, boucles et conditions",
                    "La m\u00e9morisation purement th\u00e9orique des d\u00e9finitions",
                    "L\u2019inactivation des fonctionnalit\u00e9s de s\u00e9curit\u00e9",
                    "L\u2019ex\u00e9cution al\u00e9atoire de commandes syst\u00e8me",
                ],
                correct_index: 0,
                explanation: "La le\u00e7on du Jour 04 est ax\u00e9e sur la ma\u00eetrise op\u00e9rationnelle de variables, types de donn\u00e9es, boucles et conditions."
            },
            {
                id: "j4-q2",
                question: "Quelle est la premi\u00e8re action recommand\u00e9e lors de la mise en pratique du Jour 04 ?",
                choices: [
                    "Modifier directement les fichiers sans sauvegarde",
                    "Inspecter l\u2019\u00e9tat du syst\u00e8me et v\u00e9rifier les pr\u00e9requis techniques",
                    "Ignorer les messages d\u2019erreur du terminal",
                    "Supprimer les comptes d\u2019acc\u00e8s administrateur",
                ],
                correct_index: 1,
                explanation: "Une inspection rigoureuse et la v\u00e9rification des pr\u00e9requis permettent d\u2019\u00e9viter les erreurs de configuration."
            },
            {
                id: "j4-q3",
                question: "En cas de dysfonctionnement sur un outil vu au Jour 04, quel r\u00e9flexe adopter ?",
                choices: [
                    "Consulter les logs pertinents et analyser le code de retour",
                    "Fermer la session et ignorer le probl\u00e8me",
                    "R\u00e9installer int\u00e9gralement le syst\u00e8me d\u2019exploitation",
                    "D\u00e9sactiver le pare-feu et les contr\u00f4les d\u2019acc\u00e8s",
                ],
                correct_index: 0,
                explanation: "L\u2019analyse factuelle des logs et codes d\u2019erreur est l\u2019attitude requise pour un diagnostic professionnel."
            },
            {
                id: "j4-q4",
                question: "Quel r\u00e9sultat valide la ma\u00eetrise de la journ\u00e9e du Jour 04 ?",
                choices: [
                    "Un score de 75% minimum au QCM et des exercices pratiques compl\u00e9t\u00e9s",
                    "La simple consultation de la page sans r\u00e9pondre aux questions",
                    "Un passage automatique bas\u00e9 sur le temps pass\u00e9",
                    "Une r\u00e9ponse donn\u00e9e au hasard sans justification",
                ],
                correct_index: 0,
                explanation: "Le seuil exigeant de 75% combin\u00e9 aux livrables pratiques garantit une vraie mont\u00e9e en comp\u00e9tences."
            }
        ],
        "jour-05": [
            {
                id: "j5-q1",
                question: "Quel est le concept cl\u00e9 au c\u0153ur de la le\u00e7on du Jour 05 (Python Interm\u00e9diaire & POO) ?",
                choices: [
                    "La ma\u00eetrise pratique de fonctions, modules, gestion de fichiers et classes",
                    "La m\u00e9morisation purement th\u00e9orique des d\u00e9finitions",
                    "L\u2019inactivation des fonctionnalit\u00e9s de s\u00e9curit\u00e9",
                    "L\u2019ex\u00e9cution al\u00e9atoire de commandes syst\u00e8me",
                ],
                correct_index: 0,
                explanation: "La le\u00e7on du Jour 05 est ax\u00e9e sur la ma\u00eetrise op\u00e9rationnelle de fonctions, modules, gestion de fichiers et classes."
            },
            {
                id: "j5-q2",
                question: "Quelle est la premi\u00e8re action recommand\u00e9e lors de la mise en pratique du Jour 05 ?",
                choices: [
                    "Modifier directement les fichiers sans sauvegarde",
                    "Inspecter l\u2019\u00e9tat du syst\u00e8me et v\u00e9rifier les pr\u00e9requis techniques",
                    "Ignorer les messages d\u2019erreur du terminal",
                    "Supprimer les comptes d\u2019acc\u00e8s administrateur",
                ],
                correct_index: 1,
                explanation: "Une inspection rigoureuse et la v\u00e9rification des pr\u00e9requis permettent d\u2019\u00e9viter les erreurs de configuration."
            },
            {
                id: "j5-q3",
                question: "En cas de dysfonctionnement sur un outil vu au Jour 05, quel r\u00e9flexe adopter ?",
                choices: [
                    "Consulter les logs pertinents et analyser le code de retour",
                    "Fermer la session et ignorer le probl\u00e8me",
                    "R\u00e9installer int\u00e9gralement le syst\u00e8me d\u2019exploitation",
                    "D\u00e9sactiver le pare-feu et les contr\u00f4les d\u2019acc\u00e8s",
                ],
                correct_index: 0,
                explanation: "L\u2019analyse factuelle des logs et codes d\u2019erreur est l\u2019attitude requise pour un diagnostic professionnel."
            },
            {
                id: "j5-q4",
                question: "Quel r\u00e9sultat valide la ma\u00eetrise de la journ\u00e9e du Jour 05 ?",
                choices: [
                    "Un score de 75% minimum au QCM et des exercices pratiques compl\u00e9t\u00e9s",
                    "La simple consultation de la page sans r\u00e9pondre aux questions",
                    "Un passage automatique bas\u00e9 sur le temps pass\u00e9",
                    "Une r\u00e9ponse donn\u00e9e au hasard sans justification",
                ],
                correct_index: 0,
                explanation: "Le seuil exigeant de 75% combin\u00e9 aux livrables pratiques garantit une vraie mont\u00e9e en comp\u00e9tences."
            }
        ],
        "jour-06": [
            {
                id: "j6-q1",
                question: "Quel est le concept cl\u00e9 au c\u0153ur de la le\u00e7on du Jour 06 (SQL & SGBD Relationnels) ?",
                choices: [
                    "La ma\u00eetrise pratique de requ\u00eates SELECT, JOIN, INSERT, UPDATE et DELETE",
                    "La m\u00e9morisation purement th\u00e9orique des d\u00e9finitions",
                    "L\u2019inactivation des fonctionnalit\u00e9s de s\u00e9curit\u00e9",
                    "L\u2019ex\u00e9cution al\u00e9atoire de commandes syst\u00e8me",
                ],
                correct_index: 0,
                explanation: "La le\u00e7on du Jour 06 est ax\u00e9e sur la ma\u00eetrise op\u00e9rationnelle de requ\u00eates SELECT, JOIN, INSERT, UPDATE et DELETE."
            },
            {
                id: "j6-q2",
                question: "Quelle est la premi\u00e8re action recommand\u00e9e lors de la mise en pratique du Jour 06 ?",
                choices: [
                    "Modifier directement les fichiers sans sauvegarde",
                    "Inspecter l\u2019\u00e9tat du syst\u00e8me et v\u00e9rifier les pr\u00e9requis techniques",
                    "Ignorer les messages d\u2019erreur du terminal",
                    "Supprimer les comptes d\u2019acc\u00e8s administrateur",
                ],
                correct_index: 1,
                explanation: "Une inspection rigoureuse et la v\u00e9rification des pr\u00e9requis permettent d\u2019\u00e9viter les erreurs de configuration."
            },
            {
                id: "j6-q3",
                question: "En cas de dysfonctionnement sur un outil vu au Jour 06, quel r\u00e9flexe adopter ?",
                choices: [
                    "Consulter les logs pertinents et analyser le code de retour",
                    "Fermer la session et ignorer le probl\u00e8me",
                    "R\u00e9installer int\u00e9gralement le syst\u00e8me d\u2019exploitation",
                    "D\u00e9sactiver le pare-feu et les contr\u00f4les d\u2019acc\u00e8s",
                ],
                correct_index: 0,
                explanation: "L\u2019analyse factuelle des logs et codes d\u2019erreur est l\u2019attitude requise pour un diagnostic professionnel."
            },
            {
                id: "j6-q4",
                question: "Quel r\u00e9sultat valide la ma\u00eetrise de la journ\u00e9e du Jour 06 ?",
                choices: [
                    "Un score de 75% minimum au QCM et des exercices pratiques compl\u00e9t\u00e9s",
                    "La simple consultation de la page sans r\u00e9pondre aux questions",
                    "Un passage automatique bas\u00e9 sur le temps pass\u00e9",
                    "Une r\u00e9ponse donn\u00e9e au hasard sans justification",
                ],
                correct_index: 0,
                explanation: "Le seuil exigeant de 75% combin\u00e9 aux livrables pratiques garantit une vraie mont\u00e9e en comp\u00e9tences."
            }
        ],
        "jour-07": [
            {
                id: "j7-q1",
                question: "Quel est le concept cl\u00e9 au c\u0153ur de la le\u00e7on du Jour 07 (R\u00e9seaux TCP/IP) ?",
                choices: [
                    "La ma\u00eetrise pratique de mod\u00e8le OSI/TCP-IP, adressage IP, masques, DNS et DHCP",
                    "La m\u00e9morisation purement th\u00e9orique des d\u00e9finitions",
                    "L\u2019inactivation des fonctionnalit\u00e9s de s\u00e9curit\u00e9",
                    "L\u2019ex\u00e9cution al\u00e9atoire de commandes syst\u00e8me",
                ],
                correct_index: 0,
                explanation: "La le\u00e7on du Jour 07 est ax\u00e9e sur la ma\u00eetrise op\u00e9rationnelle de mod\u00e8le OSI/TCP-IP, adressage IP, masques, DNS et DHCP."
            },
            {
                id: "j7-q2",
                question: "Quelle est la premi\u00e8re action recommand\u00e9e lors de la mise en pratique du Jour 07 ?",
                choices: [
                    "Modifier directement les fichiers sans sauvegarde",
                    "Inspecter l\u2019\u00e9tat du syst\u00e8me et v\u00e9rifier les pr\u00e9requis techniques",
                    "Ignorer les messages d\u2019erreur du terminal",
                    "Supprimer les comptes d\u2019acc\u00e8s administrateur",
                ],
                correct_index: 1,
                explanation: "Une inspection rigoureuse et la v\u00e9rification des pr\u00e9requis permettent d\u2019\u00e9viter les erreurs de configuration."
            },
            {
                id: "j7-q3",
                question: "En cas de dysfonctionnement sur un outil vu au Jour 07, quel r\u00e9flexe adopter ?",
                choices: [
                    "Consulter les logs pertinents et analyser le code de retour",
                    "Fermer la session et ignorer le probl\u00e8me",
                    "R\u00e9installer int\u00e9gralement le syst\u00e8me d\u2019exploitation",
                    "D\u00e9sactiver le pare-feu et les contr\u00f4les d\u2019acc\u00e8s",
                ],
                correct_index: 0,
                explanation: "L\u2019analyse factuelle des logs et codes d\u2019erreur est l\u2019attitude requise pour un diagnostic professionnel."
            },
            {
                id: "j7-q4",
                question: "Quel r\u00e9sultat valide la ma\u00eetrise de la journ\u00e9e du Jour 07 ?",
                choices: [
                    "Un score de 75% minimum au QCM et des exercices pratiques compl\u00e9t\u00e9s",
                    "La simple consultation de la page sans r\u00e9pondre aux questions",
                    "Un passage automatique bas\u00e9 sur le temps pass\u00e9",
                    "Une r\u00e9ponse donn\u00e9e au hasard sans justification",
                ],
                correct_index: 0,
                explanation: "Le seuil exigeant de 75% combin\u00e9 aux livrables pratiques garantit une vraie mont\u00e9e en comp\u00e9tences."
            }
        ],
        "jour-08": [
            {
                id: "j8-q1",
                question: "Quel est le concept cl\u00e9 au c\u0153ur de la le\u00e7on du Jour 08 (Scripting Bash) ?",
                choices: [
                    "La ma\u00eetrise pratique de automatisation syst\u00e8me, variables, boucles et crontab",
                    "La m\u00e9morisation purement th\u00e9orique des d\u00e9finitions",
                    "L\u2019inactivation des fonctionnalit\u00e9s de s\u00e9curit\u00e9",
                    "L\u2019ex\u00e9cution al\u00e9atoire de commandes syst\u00e8me",
                ],
                correct_index: 0,
                explanation: "La le\u00e7on du Jour 08 est ax\u00e9e sur la ma\u00eetrise op\u00e9rationnelle de automatisation syst\u00e8me, variables, boucles et crontab."
            },
            {
                id: "j8-q2",
                question: "Quelle est la premi\u00e8re action recommand\u00e9e lors de la mise en pratique du Jour 08 ?",
                choices: [
                    "Modifier directement les fichiers sans sauvegarde",
                    "Inspecter l\u2019\u00e9tat du syst\u00e8me et v\u00e9rifier les pr\u00e9requis techniques",
                    "Ignorer les messages d\u2019erreur du terminal",
                    "Supprimer les comptes d\u2019acc\u00e8s administrateur",
                ],
                correct_index: 1,
                explanation: "Une inspection rigoureuse et la v\u00e9rification des pr\u00e9requis permettent d\u2019\u00e9viter les erreurs de configuration."
            },
            {
                id: "j8-q3",
                question: "En cas de dysfonctionnement sur un outil vu au Jour 08, quel r\u00e9flexe adopter ?",
                choices: [
                    "Consulter les logs pertinents et analyser le code de retour",
                    "Fermer la session et ignorer le probl\u00e8me",
                    "R\u00e9installer int\u00e9gralement le syst\u00e8me d\u2019exploitation",
                    "D\u00e9sactiver le pare-feu et les contr\u00f4les d\u2019acc\u00e8s",
                ],
                correct_index: 0,
                explanation: "L\u2019analyse factuelle des logs et codes d\u2019erreur est l\u2019attitude requise pour un diagnostic professionnel."
            },
            {
                id: "j8-q4",
                question: "Quel r\u00e9sultat valide la ma\u00eetrise de la journ\u00e9e du Jour 08 ?",
                choices: [
                    "Un score de 75% minimum au QCM et des exercices pratiques compl\u00e9t\u00e9s",
                    "La simple consultation de la page sans r\u00e9pondre aux questions",
                    "Un passage automatique bas\u00e9 sur le temps pass\u00e9",
                    "Une r\u00e9ponse donn\u00e9e au hasard sans justification",
                ],
                correct_index: 0,
                explanation: "Le seuil exigeant de 75% combin\u00e9 aux livrables pratiques garantit une vraie mont\u00e9e en comp\u00e9tences."
            }
        ],
        "jour-09": [
            {
                id: "j9-q1",
                question: "Quel est le concept cl\u00e9 au c\u0153ur de la le\u00e7on du Jour 09 (Linux Avanc\u00e9 & Systemd) ?",
                choices: [
                    "La ma\u00eetrise pratique de logs systemd, services, s\u00e9curit\u00e9 des utilisateurs et cron",
                    "La m\u00e9morisation purement th\u00e9orique des d\u00e9finitions",
                    "L\u2019inactivation des fonctionnalit\u00e9s de s\u00e9curit\u00e9",
                    "L\u2019ex\u00e9cution al\u00e9atoire de commandes syst\u00e8me",
                ],
                correct_index: 0,
                explanation: "La le\u00e7on du Jour 09 est ax\u00e9e sur la ma\u00eetrise op\u00e9rationnelle de logs systemd, services, s\u00e9curit\u00e9 des utilisateurs et cron."
            },
            {
                id: "j9-q2",
                question: "Quelle est la premi\u00e8re action recommand\u00e9e lors de la mise en pratique du Jour 09 ?",
                choices: [
                    "Modifier directement les fichiers sans sauvegarde",
                    "Inspecter l\u2019\u00e9tat du syst\u00e8me et v\u00e9rifier les pr\u00e9requis techniques",
                    "Ignorer les messages d\u2019erreur du terminal",
                    "Supprimer les comptes d\u2019acc\u00e8s administrateur",
                ],
                correct_index: 1,
                explanation: "Une inspection rigoureuse et la v\u00e9rification des pr\u00e9requis permettent d\u2019\u00e9viter les erreurs de configuration."
            },
            {
                id: "j9-q3",
                question: "En cas de dysfonctionnement sur un outil vu au Jour 09, quel r\u00e9flexe adopter ?",
                choices: [
                    "Consulter les logs pertinents et analyser le code de retour",
                    "Fermer la session et ignorer le probl\u00e8me",
                    "R\u00e9installer int\u00e9gralement le syst\u00e8me d\u2019exploitation",
                    "D\u00e9sactiver le pare-feu et les contr\u00f4les d\u2019acc\u00e8s",
                ],
                correct_index: 0,
                explanation: "L\u2019analyse factuelle des logs et codes d\u2019erreur est l\u2019attitude requise pour un diagnostic professionnel."
            },
            {
                id: "j9-q4",
                question: "Quel r\u00e9sultat valide la ma\u00eetrise de la journ\u00e9e du Jour 09 ?",
                choices: [
                    "Un score de 75% minimum au QCM et des exercices pratiques compl\u00e9t\u00e9s",
                    "La simple consultation de la page sans r\u00e9pondre aux questions",
                    "Un passage automatique bas\u00e9 sur le temps pass\u00e9",
                    "Une r\u00e9ponse donn\u00e9e au hasard sans justification",
                ],
                correct_index: 0,
                explanation: "Le seuil exigeant de 75% combin\u00e9 aux livrables pratiques garantit une vraie mont\u00e9e en comp\u00e9tences."
            }
        ],
        "jour-10": [
            {
                id: "j10-q1",
                question: "Quel est le concept cl\u00e9 au c\u0153ur de la le\u00e7on du Jour 10 (Git Avanc\u00e9 & CI/CD) ?",
                choices: [
                    "La ma\u00eetrise pratique de branches, pull requests, conflits et GitHub Actions",
                    "La m\u00e9morisation purement th\u00e9orique des d\u00e9finitions",
                    "L\u2019inactivation des fonctionnalit\u00e9s de s\u00e9curit\u00e9",
                    "L\u2019ex\u00e9cution al\u00e9atoire de commandes syst\u00e8me",
                ],
                correct_index: 0,
                explanation: "La le\u00e7on du Jour 10 est ax\u00e9e sur la ma\u00eetrise op\u00e9rationnelle de branches, pull requests, conflits et GitHub Actions."
            },
            {
                id: "j10-q2",
                question: "Quelle est la premi\u00e8re action recommand\u00e9e lors de la mise en pratique du Jour 10 ?",
                choices: [
                    "Modifier directement les fichiers sans sauvegarde",
                    "Inspecter l\u2019\u00e9tat du syst\u00e8me et v\u00e9rifier les pr\u00e9requis techniques",
                    "Ignorer les messages d\u2019erreur du terminal",
                    "Supprimer les comptes d\u2019acc\u00e8s administrateur",
                ],
                correct_index: 1,
                explanation: "Une inspection rigoureuse et la v\u00e9rification des pr\u00e9requis permettent d\u2019\u00e9viter les erreurs de configuration."
            },
            {
                id: "j10-q3",
                question: "En cas de dysfonctionnement sur un outil vu au Jour 10, quel r\u00e9flexe adopter ?",
                choices: [
                    "Consulter les logs pertinents et analyser le code de retour",
                    "Fermer la session et ignorer le probl\u00e8me",
                    "R\u00e9installer int\u00e9gralement le syst\u00e8me d\u2019exploitation",
                    "D\u00e9sactiver le pare-feu et les contr\u00f4les d\u2019acc\u00e8s",
                ],
                correct_index: 0,
                explanation: "L\u2019analyse factuelle des logs et codes d\u2019erreur est l\u2019attitude requise pour un diagnostic professionnel."
            },
            {
                id: "j10-q4",
                question: "Quel r\u00e9sultat valide la ma\u00eetrise de la journ\u00e9e du Jour 10 ?",
                choices: [
                    "Un score de 75% minimum au QCM et des exercices pratiques compl\u00e9t\u00e9s",
                    "La simple consultation de la page sans r\u00e9pondre aux questions",
                    "Un passage automatique bas\u00e9 sur le temps pass\u00e9",
                    "Une r\u00e9ponse donn\u00e9e au hasard sans justification",
                ],
                correct_index: 0,
                explanation: "Le seuil exigeant de 75% combin\u00e9 aux livrables pratiques garantit une vraie mont\u00e9e en comp\u00e9tences."
            }
        ],
        "jour-11": [
            {
                id: "j11-q1",
                question: "Quel est le concept cl\u00e9 au c\u0153ur de la le\u00e7on du Jour 11 (Projet Int\u00e9grateur P2) ?",
                choices: [
                    "La ma\u00eetrise pratique de application compl\u00e8te Python + SQL + Bash + Git",
                    "La m\u00e9morisation purement th\u00e9orique des d\u00e9finitions",
                    "L\u2019inactivation des fonctionnalit\u00e9s de s\u00e9curit\u00e9",
                    "L\u2019ex\u00e9cution al\u00e9atoire de commandes syst\u00e8me",
                ],
                correct_index: 0,
                explanation: "La le\u00e7on du Jour 11 est ax\u00e9e sur la ma\u00eetrise op\u00e9rationnelle de application compl\u00e8te Python + SQL + Bash + Git."
            },
            {
                id: "j11-q2",
                question: "Quelle est la premi\u00e8re action recommand\u00e9e lors de la mise en pratique du Jour 11 ?",
                choices: [
                    "Modifier directement les fichiers sans sauvegarde",
                    "Inspecter l\u2019\u00e9tat du syst\u00e8me et v\u00e9rifier les pr\u00e9requis techniques",
                    "Ignorer les messages d\u2019erreur du terminal",
                    "Supprimer les comptes d\u2019acc\u00e8s administrateur",
                ],
                correct_index: 1,
                explanation: "Une inspection rigoureuse et la v\u00e9rification des pr\u00e9requis permettent d\u2019\u00e9viter les erreurs de configuration."
            },
            {
                id: "j11-q3",
                question: "En cas de dysfonctionnement sur un outil vu au Jour 11, quel r\u00e9flexe adopter ?",
                choices: [
                    "Consulter les logs pertinents et analyser le code de retour",
                    "Fermer la session et ignorer le probl\u00e8me",
                    "R\u00e9installer int\u00e9gralement le syst\u00e8me d\u2019exploitation",
                    "D\u00e9sactiver le pare-feu et les contr\u00f4les d\u2019acc\u00e8s",
                ],
                correct_index: 0,
                explanation: "L\u2019analyse factuelle des logs et codes d\u2019erreur est l\u2019attitude requise pour un diagnostic professionnel."
            },
            {
                id: "j11-q4",
                question: "Quel r\u00e9sultat valide la ma\u00eetrise de la journ\u00e9e du Jour 11 ?",
                choices: [
                    "Un score de 75% minimum au QCM et des exercices pratiques compl\u00e9t\u00e9s",
                    "La simple consultation de la page sans r\u00e9pondre aux questions",
                    "Un passage automatique bas\u00e9 sur le temps pass\u00e9",
                    "Une r\u00e9ponse donn\u00e9e au hasard sans justification",
                ],
                correct_index: 0,
                explanation: "Le seuil exigeant de 75% combin\u00e9 aux livrables pratiques garantit une vraie mont\u00e9e en comp\u00e9tences."
            }
        ],
        "jour-12": [
            {
                id: "j12-q1",
                question: "`systemctl status` sert \u00e0...",
                choices: [
                    "supprimer",
                    "observer l\u2019\u00e9tat",
                    "installer",
                    "Aucune de ces r\u00e9ponses / Autre",
                ],
                correct_index: 1,
                explanation: "Explication p\u00e9dagogique : La bonne option r\u00e9pond directement aux exigences du cours."
            },
            {
                id: "j12-q2",
                question: "`enable` signifie...",
                choices: [
                    "d\u00e9marrage auto",
                    "red\u00e9marrage imm\u00e9diat",
                    "suppression",
                    "Aucune de ces r\u00e9ponses / Autre",
                ],
                correct_index: 1,
                explanation: "Explication p\u00e9dagogique : La bonne option r\u00e9pond directement aux exigences du cours."
            },
            {
                id: "j12-q3",
                question: "service `failed` implique...",
                choices: [
                    "sain",
                    "en \u00e9chec",
                    "d\u00e9sactiv\u00e9",
                    "Aucune de ces r\u00e9ponses / Autre",
                ],
                correct_index: 1,
                explanation: "Explication p\u00e9dagogique : La bonne option r\u00e9pond directement aux exigences du cours."
            },
            {
                id: "j12-q4",
                question: "action au boot = ...",
                choices: [
                    "disable",
                    "enable",
                    "reload",
                    "Aucune de ces r\u00e9ponses / Autre",
                ],
                correct_index: 1,
                explanation: "Explication p\u00e9dagogique : La bonne option r\u00e9pond directement aux exigences du cours."
            },
            {
                id: "j12-q5",
                question: "disponibilit\u00e9 service concerne...",
                choices: [
                    "uptime",
                    "couleur terminal",
                    "clavier",
                    "Aucune de ces r\u00e9ponses / Autre",
                ],
                correct_index: 1,
                explanation: "Explication p\u00e9dagogique : La bonne option r\u00e9pond directement aux exigences du cours."
            }
        ],
        "jour-13": [
            {
                id: "j13-q1",
                question: "Windows Server sert surtout \u00e0...",
                choices: [
                    "bureautique perso",
                    "services d\u2019infra",
                    "jeux",
                    "Aucune de ces r\u00e9ponses / Autre",
                ],
                correct_index: 1,
                explanation: "Explication p\u00e9dagogique : La bonne option r\u00e9pond directement aux exigences du cours."
            },
            {
                id: "j13-q2",
                question: "AD DS est un r\u00f4le de...",
                choices: [
                    "design",
                    "annuaire",
                    "monitoring vid\u00e9o",
                    "Aucune de ces r\u00e9ponses / Autre",
                ],
                correct_index: 1,
                explanation: "Explication p\u00e9dagogique : La bonne option r\u00e9pond directement aux exigences du cours."
            },
            {
                id: "j13-q3",
                question: "un incident DNS impacte souvent...",
                choices: [
                    "r\u00e9solution noms",
                    "clavier",
                    "disque",
                    "Aucune de ces r\u00e9ponses / Autre",
                ],
                correct_index: 1,
                explanation: "Explication p\u00e9dagogique : La bonne option r\u00e9pond directement aux exigences du cours."
            },
            {
                id: "j13-q4",
                question: "service critique se valide par...",
                choices: [
                    "restart seul",
                    "test fonctionnel",
                    "intuition",
                    "Aucune de ces r\u00e9ponses / Autre",
                ],
                correct_index: 1,
                explanation: "Explication p\u00e9dagogique : La bonne option r\u00e9pond directement aux exigences du cours."
            },
            {
                id: "j13-q5",
                question: "objectif bloc 1 =",
                choices: [
                    "apprendre un outil",
                    "administrer de fa\u00e7on fiable",
                    "faire SQL",
                    "Aucune de ces r\u00e9ponses / Autre",
                ],
                correct_index: 1,
                explanation: "Explication p\u00e9dagogique : La bonne option r\u00e9pond directement aux exigences du cours."
            }
        ],
        "jour-14": [
            {
                id: "j14-q1",
                question: "un hyperviseur de type 1 s'ex\u00e9cute...",
                choices: [
                    "sur un OS h\u00f4te",
                    "directement sur le mat\u00e9riel",
                    "dans un navigateur",
                    "Aucune de ces r\u00e9ponses / Autre",
                ],
                correct_index: 1,
                explanation: "Explication p\u00e9dagogique : La bonne option r\u00e9pond directement aux exigences du cours."
            },
            {
                id: "j14-q2",
                question: "VirtualBox est un hyperviseur de type...",
                choices: [
                    "1",
                    "2",
                    "3",
                    "Aucune de ces r\u00e9ponses / Autre",
                ],
                correct_index: 1,
                explanation: "Explication p\u00e9dagogique : La bonne option r\u00e9pond directement aux exigences du cours."
            },
            {
                id: "j14-q3",
                question: "une VM contient...",
                choices: [
                    "uniquement l'application",
                    "un OS complet",
                    "seulement un processus",
                    "Aucune de ces r\u00e9ponses / Autre",
                ],
                correct_index: 1,
                explanation: "Explication p\u00e9dagogique : La bonne option r\u00e9pond directement aux exigences du cours."
            },
            {
                id: "j14-q4",
                question: "un snapshot sert \u00e0...",
                choices: [
                    "sauvegarder l'\u00e9tat d'une VM",
                    "acc\u00e9l\u00e9rer le CPU",
                    "remplacer le r\u00e9seau",
                    "Aucune de ces r\u00e9ponses / Autre",
                ],
                correct_index: 1,
                explanation: "Explication p\u00e9dagogique : La bonne option r\u00e9pond directement aux exigences du cours."
            },
            {
                id: "j14-q5",
                question: "l'overhead d'une VM vient principalement de...",
                choices: [
                    "l'OS invit\u00e9",
                    "l'application",
                    "l'\u00e9cran",
                    "Aucune de ces r\u00e9ponses / Autre",
                ],
                correct_index: 1,
                explanation: "Explication p\u00e9dagogique : La bonne option r\u00e9pond directement aux exigences du cours."
            }
        ],
        "jour-15": [
            {
                id: "j15-q1",
                question: "le durcissement (hardening) vise \u00e0...",
                choices: [
                    "acc\u00e9l\u00e9rer le syst\u00e8me",
                    "r\u00e9duire la surface d'attaque",
                    "ajouter des fonctionnalit\u00e9s",
                    "Aucune de ces r\u00e9ponses / Autre",
                ],
                correct_index: 1,
                explanation: "Explication p\u00e9dagogique : La bonne option r\u00e9pond directement aux exigences du cours."
            },
            {
                id: "j15-q2",
                question: "un service inutilis\u00e9 doit \u00eatre...",
                choices: [
                    "laiss\u00e9 actif",
                    "d\u00e9sactiv\u00e9",
                    "ignor\u00e9",
                    "Aucune de ces r\u00e9ponses / Autre",
                ],
                correct_index: 1,
                explanation: "Explication p\u00e9dagogique : La bonne option r\u00e9pond directement aux exigences du cours."
            },
            {
                id: "j15-q3",
                question: "la politique par d\u00e9faut d'un pare-feu restrictif est...",
                choices: [
                    "ACCEPT",
                    "DROP",
                    "FORWARD",
                    "Aucune de ces r\u00e9ponses / Autre",
                ],
                correct_index: 1,
                explanation: "Explication p\u00e9dagogique : La bonne option r\u00e9pond directement aux exigences du cours."
            },
            {
                id: "j15-q4",
                question: "`ss -tlnp` sert \u00e0...",
                choices: [
                    "lister les ports en \u00e9coute",
                    "supprimer des fichiers",
                    "red\u00e9marrer un service",
                    "Aucune de ces r\u00e9ponses / Autre",
                ],
                correct_index: 1,
                explanation: "Explication p\u00e9dagogique : La bonne option r\u00e9pond directement aux exigences du cours."
            },
            {
                id: "j15-q5",
                question: "fail2ban sert \u00e0...",
                choices: [
                    "bloquer les IP apr\u00e8s \u00e9checs r\u00e9p\u00e9t\u00e9s",
                    "acc\u00e9l\u00e9rer le r\u00e9seau",
                    "remplacer le pare-feu",
                    "Aucune de ces r\u00e9ponses / Autre",
                ],
                correct_index: 1,
                explanation: "Explication p\u00e9dagogique : La bonne option r\u00e9pond directement aux exigences du cours."
            }
        ],
        "jour-16": [
            {
                id: "j16-q1",
                question: "la supervision sert \u00e0...",
                choices: [
                    "savoir si les syst\u00e8mes fonctionnent",
                    "\u00e9crire du code",
                    "g\u00e9rer les mots de passe",
                    "Aucune de ces r\u00e9ponses / Autre",
                ],
                correct_index: 1,
                explanation: "Explication p\u00e9dagogique : La bonne option r\u00e9pond directement aux exigences du cours."
            },
            {
                id: "j16-q2",
                question: "un agent de supervision est install\u00e9...",
                choices: [
                    "sur chaque serveur supervis\u00e9",
                    "uniquement sur le poste admin",
                    "dans le cloud",
                    "Aucune de ces r\u00e9ponses / Autre",
                ],
                correct_index: 1,
                explanation: "Explication p\u00e9dagogique : La bonne option r\u00e9pond directement aux exigences du cours."
            },
            {
                id: "j16-q3",
                question: "un seuil \"critical\" signifie...",
                choices: [
                    "tout va bien",
                    "action urgente requise",
                    "information sans importance",
                    "Aucune de ces r\u00e9ponses / Autre",
                ],
                correct_index: 1,
                explanation: "Explication p\u00e9dagogique : La bonne option r\u00e9pond directement aux exigences du cours."
            },
            {
                id: "j16-q4",
                question: "Prometheus est un outil de...",
                choices: [
                    "monitoring et alerting",
                    "traitement de texte",
                    "visioconf\u00e9rence",
                    "Aucune de ces r\u00e9ponses / Autre",
                ],
                correct_index: 1,
                explanation: "Explication p\u00e9dagogique : La bonne option r\u00e9pond directement aux exigences du cours."
            },
            {
                id: "j16-q5",
                question: "une maintenance planifi\u00e9e permet de...",
                choices: [
                    "supprimer le serveur",
                    "\u00e9viter les fausses alertes",
                    "d\u00e9sactiver la supervision d\u00e9finitivement",
                    "Aucune de ces r\u00e9ponses / Autre",
                ],
                correct_index: 1,
                explanation: "Explication p\u00e9dagogique : La bonne option r\u00e9pond directement aux exigences du cours."
            }
        ],
        "jour-17": [
            {
                id: "j17-q1",
                question: "un sch\u00e9ma d'infrastructure sert \u00e0...",
                choices: [
                    "d\u00e9corer le bureau",
                    "visualiser les composants et leurs interactions",
                    "remplacer les serveurs",
                    "Aucune de ces r\u00e9ponses / Autre",
                ],
                correct_index: 1,
                explanation: "Explication p\u00e9dagogique : La bonne option r\u00e9pond directement aux exigences du cours."
            },
            {
                id: "j17-q2",
                question: "le dimensionnement d'un serveur d\u00e9pend de...",
                choices: [
                    "la couleur du bo\u00eetier",
                    "la charge pr\u00e9vue",
                    "la m\u00e9t\u00e9o",
                    "Aucune de ces r\u00e9ponses / Autre",
                ],
                correct_index: 1,
                explanation: "Explication p\u00e9dagogique : La bonne option r\u00e9pond directement aux exigences du cours."
            },
            {
                id: "j17-q3",
                question: "la r\u00e8gle \"default deny\" signifie...",
                choices: [
                    "tout autoriser",
                    "bloquer par d\u00e9faut, n'autoriser que le n\u00e9cessaire",
                    "tout supprimer",
                    "Aucune de ces r\u00e9ponses / Autre",
                ],
                correct_index: 1,
                explanation: "Explication p\u00e9dagogique : La bonne option r\u00e9pond directement aux exigences du cours."
            },
            {
                id: "j17-q4",
                question: "une matrice de flux sert \u00e0...",
                choices: [
                    "documenter les flux r\u00e9seau autoris\u00e9s",
                    "calculer des imp\u00f4ts",
                    "remplacer le c\u00e2blage",
                    "Aucune de ces r\u00e9ponses / Autre",
                ],
                correct_index: 1,
                explanation: "Explication p\u00e9dagogique : La bonne option r\u00e9pond directement aux exigences du cours."
            },
            {
                id: "j17-q5",
                question: "la DMZ est une zone...",
                choices: [
                    "isol\u00e9e pour les serveurs expos\u00e9s \u00e0 Internet",
                    "de stockage",
                    "de r\u00e9union",
                    "Aucune de ces r\u00e9ponses / Autre",
                ],
                correct_index: 1,
                explanation: "Explication p\u00e9dagogique : La bonne option r\u00e9pond directement aux exigences du cours."
            }
        ],
        "jour-18": [
            {
                id: "j18-q1",
                question: "la moyenne est sensible...",
                choices: [
                    "aux valeurs extr\u00eames",
                    "uniquement \u00e0 la m\u00e9diane",
                    "\u00e0 rien",
                    "pour synth\u00e9tiser des donn\u00e9es. - Produire des graphiques statistiques pertinents (histogramme, bo\u00eete \u00e0 moustaches, nuage de points). - Automatiser l'analyse avec des formules et la mise en forme conditionnelle. - Pr\u00e9senter des r\u00e9sultats statistiques de fa\u00e7on claire pour un public non technique.",
                ],
                correct_index: 1,
                explanation: "Explication p\u00e9dagogique : La bonne option r\u00e9pond directement aux exigences du cours."
            },
            {
                id: "j18-q2",
                question: "la m\u00e9diane partage les donn\u00e9es en...",
                choices: [
                    "deux moiti\u00e9s \u00e9gales",
                    "quatre parties",
                    "dix parties",
                    "pour synth\u00e9tiser des donn\u00e9es. - Produire des graphiques statistiques pertinents (histogramme, bo\u00eete \u00e0 moustaches, nuage de points). - Automatiser l'analyse avec des formules et la mise en forme conditionnelle. - Pr\u00e9senter des r\u00e9sultats statistiques de fa\u00e7on claire pour un public non technique.",
                ],
                correct_index: 1,
                explanation: "Explication p\u00e9dagogique : La bonne option r\u00e9pond directement aux exigences du cours."
            },
            {
                id: "j18-q3",
                question: "l'\u00e9cart-type mesure...",
                choices: [
                    "la dispersion des donn\u00e9es",
                    "la valeur maximale",
                    "la somme",
                    "pour synth\u00e9tiser des donn\u00e9es. - Produire des graphiques statistiques pertinents (histogramme, bo\u00eete \u00e0 moustaches, nuage de points). - Automatiser l'analyse avec des formules et la mise en forme conditionnelle. - Pr\u00e9senter des r\u00e9sultats statistiques de fa\u00e7on claire pour un public non technique.",
                ],
                correct_index: 1,
                explanation: "Explication p\u00e9dagogique : La bonne option r\u00e9pond directement aux exigences du cours."
            },
            {
                id: "j18-q4",
                question: "Q1 repr\u00e9sente...",
                choices: [
                    "25% des donn\u00e9es en dessous",
                    "50%",
                    "75%",
                    "pour synth\u00e9tiser des donn\u00e9es. - Produire des graphiques statistiques pertinents (histogramme, bo\u00eete \u00e0 moustaches, nuage de points). - Automatiser l'analyse avec des formules et la mise en forme conditionnelle. - Pr\u00e9senter des r\u00e9sultats statistiques de fa\u00e7on claire pour un public non technique.",
                ],
                correct_index: 1,
                explanation: "Explication p\u00e9dagogique : La bonne option r\u00e9pond directement aux exigences du cours."
            },
            {
                id: "j18-q5",
                question: "l'IQR est...",
                choices: [
                    "Q3 - Q1",
                    "Q3 + Q1",
                    "Q3 / Q1",
                    "pour synth\u00e9tiser des donn\u00e9es. - Produire des graphiques statistiques pertinents (histogramme, bo\u00eete \u00e0 moustaches, nuage de points). - Automatiser l'analyse avec des formules et la mise en forme conditionnelle. - Pr\u00e9senter des r\u00e9sultats statistiques de fa\u00e7on claire pour un public non technique.",
                ],
                correct_index: 1,
                explanation: "Explication p\u00e9dagogique : La bonne option r\u00e9pond directement aux exigences du cours."
            }
        ],
        "jour-19": [
            {
                id: "j19-q1",
                question: "une fonction fen\u00eatre s'applique sur...",
                choices: [
                    "un sous-ensemble de lignes sans les r\u00e9duire",
                    "toute la table sans condition",
                    "une seule ligne",
                    ", nombres (virgule vs point), unit\u00e9s (\u20ac, K\u20ac, M\u20ac). Standardiser en amont.",
                ],
                correct_index: 1,
                explanation: "Explication p\u00e9dagogique : La bonne option r\u00e9pond directement aux exigences du cours."
            },
            {
                id: "j19-q2",
                question: "`ROW_NUMBER()` vs `RANK()` \u2014 diff\u00e9rence sur ex-aequo ?",
                choices: [
                    "RANK cr\u00e9e un trou, ROW_NUMBER non",
                    "ROW_NUMBER cr\u00e9e un trou, RANK non",
                    "identiques",
                    ", nombres (virgule vs point), unit\u00e9s (\u20ac, K\u20ac, M\u20ac). Standardiser en amont.",
                ],
                correct_index: 1,
                explanation: "Explication p\u00e9dagogique : La bonne option r\u00e9pond directement aux exigences du cours."
            },
            {
                id: "j19-q3",
                question: "une CTE r\u00e9cursive utilise...",
                choices: [
                    "UNION ALL",
                    "UNION uniquement",
                    "INTERSECT",
                    ", nombres (virgule vs point), unit\u00e9s (\u20ac, K\u20ac, M\u20ac). Standardiser en amont.",
                ],
                correct_index: 1,
                explanation: "Explication p\u00e9dagogique : La bonne option r\u00e9pond directement aux exigences du cours."
            },
            {
                id: "j19-q4",
                question: "ROLLUP(a, b) produit...",
                choices: [
                    "(a,b), (a), ()",
                    "(a,b) uniquement",
                    "toutes les combinaisons",
                    ", nombres (virgule vs point), unit\u00e9s (\u20ac, K\u20ac, M\u20ac). Standardiser en amont.",
                ],
                correct_index: 1,
                explanation: "Explication p\u00e9dagogique : La bonne option r\u00e9pond directement aux exigences du cours."
            },
            {
                id: "j19-q5",
                question: "`LEAD(colonne)` retourne...",
                choices: [
                    "la valeur de la ligne suivante",
                    "la valeur de la ligne pr\u00e9c\u00e9dente",
                    "la moyenne",
                    ", nombres (virgule vs point), unit\u00e9s (\u20ac, K\u20ac, M\u20ac). Standardiser en amont.",
                ],
                correct_index: 1,
                explanation: "Explication p\u00e9dagogique : La bonne option r\u00e9pond directement aux exigences du cours."
            }
        ],
        "jour-20": [
            {
                id: "j20-q1",
                question: "un graphique en courbes est id\u00e9al pour...",
                choices: [
                    "montrer une \u00e9volution dans le temps",
                    "comparer des parts",
                    "montrer une distribution",
                    "Aucune de ces r\u00e9ponses / Autre",
                ],
                correct_index: 1,
                explanation: "Explication p\u00e9dagogique : La bonne option r\u00e9pond directement aux exigences du cours."
            },
            {
                id: "j20-q2",
                question: "un waterfall (cascade) sert \u00e0...",
                choices: [
                    "d\u00e9composer une variation",
                    "montrer des tendances",
                    "remplacer un tableau",
                    "Aucune de ces r\u00e9ponses / Autre",
                ],
                correct_index: 1,
                explanation: "Explication p\u00e9dagogique : La bonne option r\u00e9pond directement aux exigences du cours."
            },
            {
                id: "j20-q3",
                question: "des sparklines sont...",
                choices: [
                    "des mini-graphiques dans une cellule",
                    "un type de carte",
                    "des formules",
                    "Aucune de ces r\u00e9ponses / Autre",
                ],
                correct_index: 1,
                explanation: "Explication p\u00e9dagogique : La bonne option r\u00e9pond directement aux exigences du cours."
            },
            {
                id: "j20-q4",
                question: "un segment dans Excel permet de...",
                choices: [
                    "filtrer interactivement les donn\u00e9es",
                    "supprimer des lignes",
                    "prot\u00e9ger la feuille",
                    "Aucune de ces r\u00e9ponses / Autre",
                ],
                correct_index: 1,
                explanation: "Explication p\u00e9dagogique : La bonne option r\u00e9pond directement aux exigences du cours."
            },
            {
                id: "j20-q5",
                question: "un bon titre de graphique doit...",
                choices: [
                    "raconter l'histoire",
                    "\u00eatre technique et long",
                    "\u00eatre absent",
                    "Aucune de ces r\u00e9ponses / Autre",
                ],
                correct_index: 1,
                explanation: "Explication p\u00e9dagogique : La bonne option r\u00e9pond directement aux exigences du cours."
            }
        ],
        "jour-21": [
            {
                id: "j21-q1",
                question: "les 3V du Big Data sont...",
                choices: [
                    "Volume, V\u00e9locit\u00e9, Vari\u00e9t\u00e9",
                    "Valeur, Visibilit\u00e9, Virtualisation",
                    "Vitesse, Volume, Vente",
                    "Aucune de ces r\u00e9ponses / Autre",
                ],
                correct_index: 1,
                explanation: "Explication p\u00e9dagogique : La bonne option r\u00e9pond directement aux exigences du cours."
            },
            {
                id: "j21-q2",
                question: "le scale-out consiste \u00e0...",
                choices: [
                    "ajouter des machines",
                    "acheter un plus gros serveur",
                    "supprimer des donn\u00e9es",
                    "Aucune de ces r\u00e9ponses / Autre",
                ],
                correct_index: 1,
                explanation: "Explication p\u00e9dagogique : La bonne option r\u00e9pond directement aux exigences du cours."
            },
            {
                id: "j21-q3",
                question: "Spark est plus rapide que MapReduce car il travaille...",
                choices: [
                    "en m\u00e9moire",
                    "sur disque",
                    "sans donn\u00e9es",
                    "Aucune de ces r\u00e9ponses / Autre",
                ],
                correct_index: 1,
                explanation: "Explication p\u00e9dagogique : La bonne option r\u00e9pond directement aux exigences du cours."
            },
            {
                id: "j21-q4",
                question: "HDFS est un...",
                choices: [
                    "syst\u00e8me de fichiers distribu\u00e9",
                    "langage de requ\u00eate",
                    "outil de visualisation",
                    "Aucune de ces r\u00e9ponses / Autre",
                ],
                correct_index: 1,
                explanation: "Explication p\u00e9dagogique : La bonne option r\u00e9pond directement aux exigences du cours."
            },
            {
                id: "j21-q5",
                question: "PySpark permet d'\u00e9crire du code...",
                choices: [
                    "Python pour Spark",
                    "Java pour Hadoop",
                    "SQL uniquement",
                    "Aucune de ces r\u00e9ponses / Autre",
                ],
                correct_index: 1,
                explanation: "Explication p\u00e9dagogique : La bonne option r\u00e9pond directement aux exigences du cours."
            }
        ],
        "jour-22": [
            {
                id: "j22-q1",
                question: "la premi\u00e8re \u00e9tape d'une analyse de donn\u00e9es est...",
                choices: [
                    "cadrer la question business",
                    "faire des graphiques",
                    "nettoyer les donn\u00e9es",
                    "Aucune de ces r\u00e9ponses / Autre",
                ],
                correct_index: 1,
                explanation: "Explication p\u00e9dagogique : La bonne option r\u00e9pond directement aux exigences du cours."
            },
            {
                id: "j22-q2",
                question: "un KPI doit \u00eatre...",
                choices: [
                    "mesurable et li\u00e9 \u00e0 l'objectif",
                    "vague",
                    "subjectif",
                    "Aucune de ces r\u00e9ponses / Autre",
                ],
                correct_index: 1,
                explanation: "Explication p\u00e9dagogique : La bonne option r\u00e9pond directement aux exigences du cours."
            },
            {
                id: "j22-q3",
                question: "transformer \"r\u00e9duire les co\u00fbts\" en question data =",
                choices: [
                    "\"Quel est le co\u00fbt par transaction par agence ?\"",
                    "\"Pourquoi tout co\u00fbte cher ?\"",
                    "\"Supprimons des budgets\"",
                    "Aucune de ces r\u00e9ponses / Autre",
                ],
                correct_index: 1,
                explanation: "Explication p\u00e9dagogique : La bonne option r\u00e9pond directement aux exigences du cours."
            },
            {
                id: "j22-q4",
                question: "le p\u00e9rim\u00e8tre d'une analyse inclut...",
                choices: [
                    "les donn\u00e9es disponibles, la p\u00e9riode, les limites",
                    "uniquement le budget",
                    "rien",
                    "Aucune de ces r\u00e9ponses / Autre",
                ],
                correct_index: 1,
                explanation: "Explication p\u00e9dagogique : La bonne option r\u00e9pond directement aux exigences du cours."
            },
            {
                id: "j22-q5",
                question: "un bon KPI est...",
                choices: [
                    "SMART (Sp\u00e9cifique, Mesurable, Atteignable, R\u00e9aliste, Temporel)",
                    "flou",
                    "inatteignable",
                    "Aucune de ces r\u00e9ponses / Autre",
                ],
                correct_index: 1,
                explanation: "Explication p\u00e9dagogique : La bonne option r\u00e9pond directement aux exigences du cours."
            }
        ],
        "jour-23": [
            {
                id: "j23-q1",
                question: "Quel est le concept cl\u00e9 au c\u0153ur de la le\u00e7on du Jour 23 (HTML5/CSS3 Avanc\u00e9) ?",
                choices: [
                    "La ma\u00eetrise pratique de CSS Grid, Flexbox, variables CSS et responsive design",
                    "La m\u00e9morisation purement th\u00e9orique des d\u00e9finitions",
                    "L\u2019inactivation des fonctionnalit\u00e9s de s\u00e9curit\u00e9",
                    "L\u2019ex\u00e9cution al\u00e9atoire de commandes syst\u00e8me",
                ],
                correct_index: 0,
                explanation: "La le\u00e7on du Jour 23 est ax\u00e9e sur la ma\u00eetrise op\u00e9rationnelle de CSS Grid, Flexbox, variables CSS et responsive design."
            },
            {
                id: "j23-q2",
                question: "Quelle est la premi\u00e8re action recommand\u00e9e lors de la mise en pratique du Jour 23 ?",
                choices: [
                    "Modifier directement les fichiers sans sauvegarde",
                    "Inspecter l\u2019\u00e9tat du syst\u00e8me et v\u00e9rifier les pr\u00e9requis techniques",
                    "Ignorer les messages d\u2019erreur du terminal",
                    "Supprimer les comptes d\u2019acc\u00e8s administrateur",
                ],
                correct_index: 1,
                explanation: "Une inspection rigoureuse et la v\u00e9rification des pr\u00e9requis permettent d\u2019\u00e9viter les erreurs de configuration."
            },
            {
                id: "j23-q3",
                question: "En cas de dysfonctionnement sur un outil vu au Jour 23, quel r\u00e9flexe adopter ?",
                choices: [
                    "Consulter les logs pertinents et analyser le code de retour",
                    "Fermer la session et ignorer le probl\u00e8me",
                    "R\u00e9installer int\u00e9gralement le syst\u00e8me d\u2019exploitation",
                    "D\u00e9sactiver le pare-feu et les contr\u00f4les d\u2019acc\u00e8s",
                ],
                correct_index: 0,
                explanation: "L\u2019analyse factuelle des logs et codes d\u2019erreur est l\u2019attitude requise pour un diagnostic professionnel."
            },
            {
                id: "j23-q4",
                question: "Quel r\u00e9sultat valide la ma\u00eetrise de la journ\u00e9e du Jour 23 ?",
                choices: [
                    "Un score de 75% minimum au QCM et des exercices pratiques compl\u00e9t\u00e9s",
                    "La simple consultation de la page sans r\u00e9pondre aux questions",
                    "Un passage automatique bas\u00e9 sur le temps pass\u00e9",
                    "Une r\u00e9ponse donn\u00e9e au hasard sans justification",
                ],
                correct_index: 0,
                explanation: "Le seuil exigeant de 75% combin\u00e9 aux livrables pratiques garantit une vraie mont\u00e9e en comp\u00e9tences."
            }
        ],
        "jour-24": [
            {
                id: "j24-q1",
                question: "Quel est le concept cl\u00e9 au c\u0153ur de la le\u00e7on du Jour 24 (JavaScript DOM & Asynchrone) ?",
                choices: [
                    "La ma\u00eetrise pratique de DOM, \u00e9v\u00e9nements, Fetch API, Promesses et Async/Await",
                    "La m\u00e9morisation purement th\u00e9orique des d\u00e9finitions",
                    "L\u2019inactivation des fonctionnalit\u00e9s de s\u00e9curit\u00e9",
                    "L\u2019ex\u00e9cution al\u00e9atoire de commandes syst\u00e8me",
                ],
                correct_index: 0,
                explanation: "La le\u00e7on du Jour 24 est ax\u00e9e sur la ma\u00eetrise op\u00e9rationnelle de DOM, \u00e9v\u00e9nements, Fetch API, Promesses et Async/Await."
            },
            {
                id: "j24-q2",
                question: "Quelle est la premi\u00e8re action recommand\u00e9e lors de la mise en pratique du Jour 24 ?",
                choices: [
                    "Modifier directement les fichiers sans sauvegarde",
                    "Inspecter l\u2019\u00e9tat du syst\u00e8me et v\u00e9rifier les pr\u00e9requis techniques",
                    "Ignorer les messages d\u2019erreur du terminal",
                    "Supprimer les comptes d\u2019acc\u00e8s administrateur",
                ],
                correct_index: 1,
                explanation: "Une inspection rigoureuse et la v\u00e9rification des pr\u00e9requis permettent d\u2019\u00e9viter les erreurs de configuration."
            },
            {
                id: "j24-q3",
                question: "En cas de dysfonctionnement sur un outil vu au Jour 24, quel r\u00e9flexe adopter ?",
                choices: [
                    "Consulter les logs pertinents et analyser le code de retour",
                    "Fermer la session et ignorer le probl\u00e8me",
                    "R\u00e9installer int\u00e9gralement le syst\u00e8me d\u2019exploitation",
                    "D\u00e9sactiver le pare-feu et les contr\u00f4les d\u2019acc\u00e8s",
                ],
                correct_index: 0,
                explanation: "L\u2019analyse factuelle des logs et codes d\u2019erreur est l\u2019attitude requise pour un diagnostic professionnel."
            },
            {
                id: "j24-q4",
                question: "Quel r\u00e9sultat valide la ma\u00eetrise de la journ\u00e9e du Jour 24 ?",
                choices: [
                    "Un score de 75% minimum au QCM et des exercices pratiques compl\u00e9t\u00e9s",
                    "La simple consultation de la page sans r\u00e9pondre aux questions",
                    "Un passage automatique bas\u00e9 sur le temps pass\u00e9",
                    "Une r\u00e9ponse donn\u00e9e au hasard sans justification",
                ],
                correct_index: 0,
                explanation: "Le seuil exigeant de 75% combin\u00e9 aux livrables pratiques garantit une vraie mont\u00e9e en comp\u00e9tences."
            }
        ],
        "jour-25": [
            {
                id: "j25-q1",
                question: "Express est...",
                choices: [
                    "un framework web Node.js",
                    "une base de donn\u00e9es",
                    "un langage",
                    "* | Representational State Transfer \u2014 style d'architecture API | Interagit avec HTTP, les verbes, les statuts, le routing",
                ],
                correct_index: 1,
                explanation: "Explication p\u00e9dagogique : La bonne option r\u00e9pond directement aux exigences du cours."
            },
            {
                id: "j25-q2",
                question: "un middleware Express a la signature...",
                choices: [
                    "`(req, res, next)`",
                    "`(req, res)`",
                    "`(data)`",
                    "* | Representational State Transfer \u2014 style d'architecture API | Interagit avec HTTP, les verbes, les statuts, le routing",
                ],
                correct_index: 1,
                explanation: "Explication p\u00e9dagogique : La bonne option r\u00e9pond directement aux exigences du cours."
            },
            {
                id: "j25-q3",
                question: "`app.use(express.json())` parse...",
                choices: [
                    "le body JSON des requ\u00eates",
                    "les URLs",
                    "les cookies",
                    "* | Representational State Transfer \u2014 style d'architecture API | Interagit avec HTTP, les verbes, les statuts, le routing",
                ],
                correct_index: 1,
                explanation: "Explication p\u00e9dagogique : La bonne option r\u00e9pond directement aux exigences du cours."
            },
            {
                id: "j25-q4",
                question: "les variables d'environnement se stockent dans...",
                choices: [
                    "`.env`",
                    "`index.js`",
                    "`package.json`",
                    "* | Representational State Transfer \u2014 style d'architecture API | Interagit avec HTTP, les verbes, les statuts, le routing",
                ],
                correct_index: 1,
                explanation: "Explication p\u00e9dagogique : La bonne option r\u00e9pond directement aux exigences du cours."
            },
            {
                id: "j25-q5",
                question: "`res.status(201).json(data)` envoie...",
                choices: [
                    "statut 201 Created + JSON",
                    "statut 200",
                    "une erreur",
                    "* | Representational State Transfer \u2014 style d'architecture API | Interagit avec HTTP, les verbes, les statuts, le routing",
                ],
                correct_index: 1,
                explanation: "Explication p\u00e9dagogique : La bonne option r\u00e9pond directement aux exigences du cours."
            }
        ],
        "jour-26": [
            {
                id: "j26-q1",
                question: "Quel est le concept cl\u00e9 au c\u0153ur de la le\u00e7on du Jour 26 (APIs REST & OpenAPI) ?",
                choices: [
                    "La ma\u00eetrise pratique de architecture REST, HTTP, JSON, JWT et Swagger",
                    "La m\u00e9morisation purement th\u00e9orique des d\u00e9finitions",
                    "L\u2019inactivation des fonctionnalit\u00e9s de s\u00e9curit\u00e9",
                    "L\u2019ex\u00e9cution al\u00e9atoire de commandes syst\u00e8me",
                ],
                correct_index: 0,
                explanation: "La le\u00e7on du Jour 26 est ax\u00e9e sur la ma\u00eetrise op\u00e9rationnelle de architecture REST, HTTP, JSON, JWT et Swagger."
            },
            {
                id: "j26-q2",
                question: "Quelle est la premi\u00e8re action recommand\u00e9e lors de la mise en pratique du Jour 26 ?",
                choices: [
                    "Modifier directement les fichiers sans sauvegarde",
                    "Inspecter l\u2019\u00e9tat du syst\u00e8me et v\u00e9rifier les pr\u00e9requis techniques",
                    "Ignorer les messages d\u2019erreur du terminal",
                    "Supprimer les comptes d\u2019acc\u00e8s administrateur",
                ],
                correct_index: 1,
                explanation: "Une inspection rigoureuse et la v\u00e9rification des pr\u00e9requis permettent d\u2019\u00e9viter les erreurs de configuration."
            },
            {
                id: "j26-q3",
                question: "En cas de dysfonctionnement sur un outil vu au Jour 26, quel r\u00e9flexe adopter ?",
                choices: [
                    "Consulter les logs pertinents et analyser le code de retour",
                    "Fermer la session et ignorer le probl\u00e8me",
                    "R\u00e9installer int\u00e9gralement le syst\u00e8me d\u2019exploitation",
                    "D\u00e9sactiver le pare-feu et les contr\u00f4les d\u2019acc\u00e8s",
                ],
                correct_index: 0,
                explanation: "L\u2019analyse factuelle des logs et codes d\u2019erreur est l\u2019attitude requise pour un diagnostic professionnel."
            },
            {
                id: "j26-q4",
                question: "Quel r\u00e9sultat valide la ma\u00eetrise de la journ\u00e9e du Jour 26 ?",
                choices: [
                    "Un score de 75% minimum au QCM et des exercices pratiques compl\u00e9t\u00e9s",
                    "La simple consultation de la page sans r\u00e9pondre aux questions",
                    "Un passage automatique bas\u00e9 sur le temps pass\u00e9",
                    "Une r\u00e9ponse donn\u00e9e au hasard sans justification",
                ],
                correct_index: 0,
                explanation: "Le seuil exigeant de 75% combin\u00e9 aux livrables pratiques garantit une vraie mont\u00e9e en comp\u00e9tences."
            }
        ],
        "jour-27": [
            {
                id: "j27-q1",
                question: "Vercel d\u00e9tecte automatiquement...",
                choices: [
                    "le framework et la commande de build",
                    "les bugs",
                    "les utilisateurs",
                    ": **25 pts** - D\u00e9ploiement backend (Render, Dockerfile, health check, env vars) : **30 pts** - HTTPS, DNS et s\u00e9curit\u00e9 (TLS, HSTS, CORS production) : **20 pts** - Int\u00e9gration full-stack (frontend \u2194 backend \u2194 DB) : **15 pts** - Communication technique employabilit\u00e9 : **10 pts**",
                ],
                correct_index: 1,
                explanation: "Explication p\u00e9dagogique : La bonne option r\u00e9pond directement aux exigences du cours."
            },
            {
                id: "j27-q2",
                question: "les variables `VITE_*` sont...",
                choices: [
                    "expos\u00e9es au frontend",
                    "secr\u00e8tes",
                    "inaccessibles",
                    ": **25 pts** - D\u00e9ploiement backend (Render, Dockerfile, health check, env vars) : **30 pts** - HTTPS, DNS et s\u00e9curit\u00e9 (TLS, HSTS, CORS production) : **20 pts** - Int\u00e9gration full-stack (frontend \u2194 backend \u2194 DB) : **15 pts** - Communication technique employabilit\u00e9 : **10 pts**",
                ],
                correct_index: 1,
                explanation: "Explication p\u00e9dagogique : La bonne option r\u00e9pond directement aux exigences du cours."
            },
            {
                id: "j27-q3",
                question: "un preview deployment est cr\u00e9\u00e9 pour...",
                choices: [
                    "chaque Pull Request",
                    "chaque commit local",
                    "rien",
                    ": **25 pts** - D\u00e9ploiement backend (Render, Dockerfile, health check, env vars) : **30 pts** - HTTPS, DNS et s\u00e9curit\u00e9 (TLS, HSTS, CORS production) : **20 pts** - Int\u00e9gration full-stack (frontend \u2194 backend \u2194 DB) : **15 pts** - Communication technique employabilit\u00e9 : **10 pts**",
                ],
                correct_index: 1,
                explanation: "Explication p\u00e9dagogique : La bonne option r\u00e9pond directement aux exigences du cours."
            },
            {
                id: "j27-q4",
                question: "le build de production inclut...",
                choices: [
                    "minification et tree-shaking",
                    "le code source non modifi\u00e9",
                    "les node_modules",
                    ": **25 pts** - D\u00e9ploiement backend (Render, Dockerfile, health check, env vars) : **30 pts** - HTTPS, DNS et s\u00e9curit\u00e9 (TLS, HSTS, CORS production) : **20 pts** - Int\u00e9gration full-stack (frontend \u2194 backend \u2194 DB) : **15 pts** - Communication technique employabilit\u00e9 : **10 pts**",
                ],
                correct_index: 1,
                explanation: "Explication p\u00e9dagogique : La bonne option r\u00e9pond directement aux exigences du cours."
            },
            {
                id: "j27-q5",
                question: "Vercel + GitHub =",
                choices: [
                    "d\u00e9ploiement automatique \u00e0 chaque push",
                    "d\u00e9ploiement manuel",
                    "aucun lien",
                    ": **25 pts** - D\u00e9ploiement backend (Render, Dockerfile, health check, env vars) : **30 pts** - HTTPS, DNS et s\u00e9curit\u00e9 (TLS, HSTS, CORS production) : **20 pts** - Int\u00e9gration full-stack (frontend \u2194 backend \u2194 DB) : **15 pts** - Communication technique employabilit\u00e9 : **10 pts**",
                ],
                correct_index: 1,
                explanation: "Explication p\u00e9dagogique : La bonne option r\u00e9pond directement aux exigences du cours."
            }
        ],
        "jour-28": [
            {
                id: "j28-q1",
                question: "SOLID est un acronyme pour...",
                choices: [
                    "5 principes de conception logicielle",
                    "un framework JavaScript",
                    "une base de donn\u00e9es",
                    "avec Supertest + Jest.",
                ],
                correct_index: 1,
                explanation: "Explication p\u00e9dagogique : La bonne option r\u00e9pond directement aux exigences du cours."
            },
            {
                id: "j28-q2",
                question: "dans MVC, le Controller...",
                choices: [
                    "orchestre la requ\u00eate HTTP",
                    "stocke les donn\u00e9es",
                    "affiche l'interface",
                    "avec Supertest + Jest.",
                ],
                correct_index: 1,
                explanation: "Explication p\u00e9dagogique : La bonne option r\u00e9pond directement aux exigences du cours."
            },
            {
                id: "j28-q3",
                question: "Dependency Inversion signifie...",
                choices: [
                    "d\u00e9pendre d'interfaces, pas d'impl\u00e9mentations",
                    "inverser le code",
                    "supprimer les d\u00e9pendances",
                    "avec Supertest + Jest.",
                ],
                correct_index: 1,
                explanation: "Explication p\u00e9dagogique : La bonne option r\u00e9pond directement aux exigences du cours."
            },
            {
                id: "j28-q4",
                question: "un ADR (Architecture Decision Record) documente...",
                choices: [
                    "les d\u00e9cisions d'architecture et leur justification",
                    "le code",
                    "les bugs",
                    "avec Supertest + Jest.",
                ],
                correct_index: 1,
                explanation: "Explication p\u00e9dagogique : La bonne option r\u00e9pond directement aux exigences du cours."
            },
            {
                id: "j28-q5",
                question: "le domaine (domain) dans Clean Architecture...",
                choices: [
                    "ne d\u00e9pend d'aucune technologie externe",
                    "d\u00e9pend de Prisma",
                    "d\u00e9pend d'Express",
                    "avec Supertest + Jest.",
                ],
                correct_index: 1,
                explanation: "Explication p\u00e9dagogique : La bonne option r\u00e9pond directement aux exigences du cours."
            }
        ],
        "jour-29": [
            {
                id: "j29-q1",
                question: "IaaS signifie...",
                choices: [
                    "Infrastructure as a Service",
                    "Integration as a Service",
                    "Internet as a Service",
                    ".",
                ],
                correct_index: 1,
                explanation: "Explication p\u00e9dagogique : La bonne option r\u00e9pond directement aux exigences du cours."
            },
            {
                id: "j29-q2",
                question: "dans le mod\u00e8le SaaS, le client g\u00e8re...",
                choices: [
                    "rien (tout est g\u00e9r\u00e9 par le fournisseur)",
                    "l'OS",
                    "l'infrastructure",
                    ".",
                ],
                correct_index: 1,
                explanation: "Explication p\u00e9dagogique : La bonne option r\u00e9pond directement aux exigences du cours."
            },
            {
                id: "j29-q3",
                question: "le cloud hybride combine...",
                choices: [
                    "cloud public et priv\u00e9",
                    "deux clouds publics",
                    "SaaS et IaaS",
                    ".",
                ],
                correct_index: 1,
                explanation: "Explication p\u00e9dagogique : La bonne option r\u00e9pond directement aux exigences du cours."
            },
            {
                id: "j29-q4",
                question: "AWS Lambda est un service de type...",
                choices: [
                    "FaaS/Serverless",
                    "IaaS",
                    "PaaS",
                    ".",
                ],
                correct_index: 1,
                explanation: "Explication p\u00e9dagogique : La bonne option r\u00e9pond directement aux exigences du cours."
            },
            {
                id: "j29-q5",
                question: "\"On-demand self-service\" signifie...",
                choices: [
                    "provisionner des ressources sans interaction humaine",
                    "payer en esp\u00e8ces",
                    "contacter le support",
                    ".",
                ],
                correct_index: 1,
                explanation: "Explication p\u00e9dagogique : La bonne option r\u00e9pond directement aux exigences du cours."
            }
        ],
        "jour-30": [
            {
                id: "j30-q1",
                question: "Quel est le concept cl\u00e9 au c\u0153ur de la le\u00e7on du Jour 30 (Conteneurisation Docker) ?",
                choices: [
                    "La ma\u00eetrise pratique de Dockerfile, images, conteneurs, volumes et Compose",
                    "La m\u00e9morisation purement th\u00e9orique des d\u00e9finitions",
                    "L\u2019inactivation des fonctionnalit\u00e9s de s\u00e9curit\u00e9",
                    "L\u2019ex\u00e9cution al\u00e9atoire de commandes syst\u00e8me",
                ],
                correct_index: 0,
                explanation: "La le\u00e7on du Jour 30 est ax\u00e9e sur la ma\u00eetrise op\u00e9rationnelle de Dockerfile, images, conteneurs, volumes et Compose."
            },
            {
                id: "j30-q2",
                question: "Quelle est la premi\u00e8re action recommand\u00e9e lors de la mise en pratique du Jour 30 ?",
                choices: [
                    "Modifier directement les fichiers sans sauvegarde",
                    "Inspecter l\u2019\u00e9tat du syst\u00e8me et v\u00e9rifier les pr\u00e9requis techniques",
                    "Ignorer les messages d\u2019erreur du terminal",
                    "Supprimer les comptes d\u2019acc\u00e8s administrateur",
                ],
                correct_index: 1,
                explanation: "Une inspection rigoureuse et la v\u00e9rification des pr\u00e9requis permettent d\u2019\u00e9viter les erreurs de configuration."
            },
            {
                id: "j30-q3",
                question: "En cas de dysfonctionnement sur un outil vu au Jour 30, quel r\u00e9flexe adopter ?",
                choices: [
                    "Consulter les logs pertinents et analyser le code de retour",
                    "Fermer la session et ignorer le probl\u00e8me",
                    "R\u00e9installer int\u00e9gralement le syst\u00e8me d\u2019exploitation",
                    "D\u00e9sactiver le pare-feu et les contr\u00f4les d\u2019acc\u00e8s",
                ],
                correct_index: 0,
                explanation: "L\u2019analyse factuelle des logs et codes d\u2019erreur est l\u2019attitude requise pour un diagnostic professionnel."
            },
            {
                id: "j30-q4",
                question: "Quel r\u00e9sultat valide la ma\u00eetrise de la journ\u00e9e du Jour 30 ?",
                choices: [
                    "Un score de 75% minimum au QCM et des exercices pratiques compl\u00e9t\u00e9s",
                    "La simple consultation de la page sans r\u00e9pondre aux questions",
                    "Un passage automatique bas\u00e9 sur le temps pass\u00e9",
                    "Une r\u00e9ponse donn\u00e9e au hasard sans justification",
                ],
                correct_index: 0,
                explanation: "Le seuil exigeant de 75% combin\u00e9 aux livrables pratiques garantit une vraie mont\u00e9e en comp\u00e9tences."
            }
        ],
        "jour-31": [
            {
                id: "j31-q1",
                question: "la d\u00e9fense en profondeur consiste \u00e0...",
                choices: [
                    "superposer plusieurs couches de s\u00e9curit\u00e9",
                    "utiliser un seul firewall",
                    "tout chiffrer",
                    ". Les utilisateurs se connectent avec leur compte Office 365. Justifier le choix du protocole pour chaque app.    - **Corrig\u00e9** : GitHub \u2192 SAML (GitHub Enterprise supporte SAML nativement). AWS \u2192 AWS IAM Identity Center (ex-AWS SSO) f\u00e9d\u00e9r\u00e9 avec Entra ID via SAML. Slack \u2192 SAML (Slack supporte SAML pour les plans payants). Justification : SAML est le standard pour les applications SaaS d'entreprise. R\u00e9sultat : un seul compte, un seul mot de passe, une seule politique MFA pour toutes les apps.",
                ],
                correct_index: 1,
                explanation: "Explication p\u00e9dagogique : La bonne option r\u00e9pond directement aux exigences du cours."
            },
            {
                id: "j31-q2",
                question: "le principe Zero Trust est...",
                choices: [
                    "\"Never trust, always verify\"",
                    "\"Trust but verify\"",
                    "\"Trust everything inside\"",
                    ". Les utilisateurs se connectent avec leur compte Office 365. Justifier le choix du protocole pour chaque app.    - **Corrig\u00e9** : GitHub \u2192 SAML (GitHub Enterprise supporte SAML nativement). AWS \u2192 AWS IAM Identity Center (ex-AWS SSO) f\u00e9d\u00e9r\u00e9 avec Entra ID via SAML. Slack \u2192 SAML (Slack supporte SAML pour les plans payants). Justification : SAML est le standard pour les applications SaaS d'entreprise. R\u00e9sultat : un seul compte, un seul mot de passe, une seule politique MFA pour toutes les apps.",
                ],
                correct_index: 1,
                explanation: "Explication p\u00e9dagogique : La bonne option r\u00e9pond directement aux exigences du cours."
            },
            {
                id: "j31-q3",
                question: "DevSecOps int\u00e8gre la s\u00e9curit\u00e9...",
                choices: [
                    "d\u00e8s le d\u00e9but du cycle DevOps",
                    "\u00e0 la fin du projet",
                    "uniquement en production",
                    ". Les utilisateurs se connectent avec leur compte Office 365. Justifier le choix du protocole pour chaque app.    - **Corrig\u00e9** : GitHub \u2192 SAML (GitHub Enterprise supporte SAML nativement). AWS \u2192 AWS IAM Identity Center (ex-AWS SSO) f\u00e9d\u00e9r\u00e9 avec Entra ID via SAML. Slack \u2192 SAML (Slack supporte SAML pour les plans payants). Justification : SAML est le standard pour les applications SaaS d'entreprise. R\u00e9sultat : un seul compte, un seul mot de passe, une seule politique MFA pour toutes les apps.",
                ],
                correct_index: 1,
                explanation: "Explication p\u00e9dagogique : La bonne option r\u00e9pond directement aux exigences du cours."
            },
            {
                id: "j31-q4",
                question: "un SIEM centralise...",
                choices: [
                    "les logs de s\u00e9curit\u00e9 de toutes les sources",
                    "uniquement les logs r\u00e9seau",
                    "les backups",
                    ". Les utilisateurs se connectent avec leur compte Office 365. Justifier le choix du protocole pour chaque app.    - **Corrig\u00e9** : GitHub \u2192 SAML (GitHub Enterprise supporte SAML nativement). AWS \u2192 AWS IAM Identity Center (ex-AWS SSO) f\u00e9d\u00e9r\u00e9 avec Entra ID via SAML. Slack \u2192 SAML (Slack supporte SAML pour les plans payants). Justification : SAML est le standard pour les applications SaaS d'entreprise. R\u00e9sultat : un seul compte, un seul mot de passe, une seule politique MFA pour toutes les apps.",
                ],
                correct_index: 1,
                explanation: "Explication p\u00e9dagogique : La bonne option r\u00e9pond directement aux exigences du cours."
            },
            {
                id: "j31-q5",
                question: "IMDSv2 sur EC2 prot\u00e8ge contre...",
                choices: [
                    "le vol de credentials via SSRF",
                    "les DDoS",
                    "le SQL injection",
                    ". Les utilisateurs se connectent avec leur compte Office 365. Justifier le choix du protocole pour chaque app.    - **Corrig\u00e9** : GitHub \u2192 SAML (GitHub Enterprise supporte SAML nativement). AWS \u2192 AWS IAM Identity Center (ex-AWS SSO) f\u00e9d\u00e9r\u00e9 avec Entra ID via SAML. Slack \u2192 SAML (Slack supporte SAML pour les plans payants). Justification : SAML est le standard pour les applications SaaS d'entreprise. R\u00e9sultat : un seul compte, un seul mot de passe, une seule politique MFA pour toutes les apps.",
                ],
                correct_index: 1,
                explanation: "Explication p\u00e9dagogique : La bonne option r\u00e9pond directement aux exigences du cours."
            }
        ],
        "jour-32": [
            {
                id: "j32-q1",
                question: "ITIL est un framework de...",
                choices: [
                    "gestion des services IT",
                    "d\u00e9veloppement logiciel",
                    "s\u00e9curit\u00e9",
                    ", avec possibilit\u00e9 de prolongation de 2 mois en cas de complexit\u00e9. L'organisation doit r\u00e9pondre m\u00eame si elle refuse (avec justification).",
                ],
                correct_index: 1,
                explanation: "Explication p\u00e9dagogique : La bonne option r\u00e9pond directement aux exigences du cours."
            },
            {
                id: "j32-q2",
                question: "un SLA d\u00e9finit...",
                choices: [
                    "le niveau de service entre fournisseur et client",
                    "le budget",
                    "les technologies",
                    ", avec possibilit\u00e9 de prolongation de 2 mois en cas de complexit\u00e9. L'organisation doit r\u00e9pondre m\u00eame si elle refuse (avec justification).",
                ],
                correct_index: 1,
                explanation: "Explication p\u00e9dagogique : La bonne option r\u00e9pond directement aux exigences du cours."
            },
            {
                id: "j32-q3",
                question: "dans ITIL, un probl\u00e8me est...",
                choices: [
                    "la cause racine inconnue d'incidents",
                    "un incident critique",
                    "une demande utilisateur",
                    ", avec possibilit\u00e9 de prolongation de 2 mois en cas de complexit\u00e9. L'organisation doit r\u00e9pondre m\u00eame si elle refuse (avec justification).",
                ],
                correct_index: 1,
                explanation: "Explication p\u00e9dagogique : La bonne option r\u00e9pond directement aux exigences du cours."
            },
            {
                id: "j32-q4",
                question: "PDCA signifie...",
                choices: [
                    "Plan, Do, Check, Act",
                    "Plan, Deploy, Configure, Audit",
                    "rien",
                    ", avec possibilit\u00e9 de prolongation de 2 mois en cas de complexit\u00e9. L'organisation doit r\u00e9pondre m\u00eame si elle refuse (avec justification).",
                ],
                correct_index: 1,
                explanation: "Explication p\u00e9dagogique : La bonne option r\u00e9pond directement aux exigences du cours."
            },
            {
                id: "j32-q5",
                question: "une OLA est un accord entre...",
                choices: [
                    "\u00e9quipes internes",
                    "fournisseur et client",
                    "concurrents",
                    ", avec possibilit\u00e9 de prolongation de 2 mois en cas de complexit\u00e9. L'organisation doit r\u00e9pondre m\u00eame si elle refuse (avec justification).",
                ],
                correct_index: 1,
                explanation: "Explication p\u00e9dagogique : La bonne option r\u00e9pond directement aux exigences du cours."
            }
        ],
        "jour-33": [
            {
                id: "j33-q1",
                question: "\"stateful\" pour un Security Group signifie...",
                choices: [
                    "les r\u00e9ponses sortantes sont automatiquement autoris\u00e9es",
                    "tout est bloqu\u00e9",
                    "rien",
                    "Aucune de ces r\u00e9ponses / Autre",
                ],
                correct_index: 1,
                explanation: "Explication p\u00e9dagogique : La bonne option r\u00e9pond directement aux exigences du cours."
            },
            {
                id: "j33-q2",
                question: "dans une RFC, \"MUST\" signifie...",
                choices: [
                    "obligatoire",
                    "optionnel",
                    "recommand\u00e9",
                    "Aucune de ces r\u00e9ponses / Autre",
                ],
                correct_index: 1,
                explanation: "Explication p\u00e9dagogique : La bonne option r\u00e9pond directement aux exigences du cours."
            },
            {
                id: "j33-q3",
                question: "\"blameless\" dans un post-mortem signifie...",
                choices: [
                    "on ne cherche pas de coupable",
                    "on ignore les erreurs",
                    "on bl\u00e2me l'\u00e9quipe",
                    "Aucune de ces r\u00e9ponses / Autre",
                ],
                correct_index: 1,
                explanation: "Explication p\u00e9dagogique : La bonne option r\u00e9pond directement aux exigences du cours."
            },
            {
                id: "j33-q4",
                question: "\"deploy\" signifie...",
                choices: [
                    "d\u00e9ployer",
                    "supprimer",
                    "arr\u00eater",
                    "Aucune de ces r\u00e9ponses / Autre",
                ],
                correct_index: 1,
                explanation: "Explication p\u00e9dagogique : La bonne option r\u00e9pond directement aux exigences du cours."
            },
            {
                id: "j33-q5",
                question: "un RFC est publi\u00e9 par...",
                choices: [
                    "l'IETF",
                    "AWS",
                    "Microsoft",
                    "Aucune de ces r\u00e9ponses / Autre",
                ],
                correct_index: 1,
                explanation: "Explication p\u00e9dagogique : La bonne option r\u00e9pond directement aux exigences du cours."
            }
        ],
        "jour-34": [
            {
                id: "j34-q1",
                question: "Quel est le concept cl\u00e9 au c\u0153ur de la le\u00e7on du Jour 34 (Cybers\u00e9curit\u00e9 Avanc\u00e9e) ?",
                choices: [
                    "La ma\u00eetrise pratique de OWASP Top 10, SIEM, analyse de logs et pentest basique",
                    "La m\u00e9morisation purement th\u00e9orique des d\u00e9finitions",
                    "L\u2019inactivation des fonctionnalit\u00e9s de s\u00e9curit\u00e9",
                    "L\u2019ex\u00e9cution al\u00e9atoire de commandes syst\u00e8me",
                ],
                correct_index: 0,
                explanation: "La le\u00e7on du Jour 34 est ax\u00e9e sur la ma\u00eetrise op\u00e9rationnelle de OWASP Top 10, SIEM, analyse de logs et pentest basique."
            },
            {
                id: "j34-q2",
                question: "Quelle est la premi\u00e8re action recommand\u00e9e lors de la mise en pratique du Jour 34 ?",
                choices: [
                    "Modifier directement les fichiers sans sauvegarde",
                    "Inspecter l\u2019\u00e9tat du syst\u00e8me et v\u00e9rifier les pr\u00e9requis techniques",
                    "Ignorer les messages d\u2019erreur du terminal",
                    "Supprimer les comptes d\u2019acc\u00e8s administrateur",
                ],
                correct_index: 1,
                explanation: "Une inspection rigoureuse et la v\u00e9rification des pr\u00e9requis permettent d\u2019\u00e9viter les erreurs de configuration."
            },
            {
                id: "j34-q3",
                question: "En cas de dysfonctionnement sur un outil vu au Jour 34, quel r\u00e9flexe adopter ?",
                choices: [
                    "Consulter les logs pertinents et analyser le code de retour",
                    "Fermer la session et ignorer le probl\u00e8me",
                    "R\u00e9installer int\u00e9gralement le syst\u00e8me d\u2019exploitation",
                    "D\u00e9sactiver le pare-feu et les contr\u00f4les d\u2019acc\u00e8s",
                ],
                correct_index: 0,
                explanation: "L\u2019analyse factuelle des logs et codes d\u2019erreur est l\u2019attitude requise pour un diagnostic professionnel."
            },
            {
                id: "j34-q4",
                question: "Quel r\u00e9sultat valide la ma\u00eetrise de la journ\u00e9e du Jour 34 ?",
                choices: [
                    "Un score de 75% minimum au QCM et des exercices pratiques compl\u00e9t\u00e9s",
                    "La simple consultation de la page sans r\u00e9pondre aux questions",
                    "Un passage automatique bas\u00e9 sur le temps pass\u00e9",
                    "Une r\u00e9ponse donn\u00e9e au hasard sans justification",
                ],
                correct_index: 0,
                explanation: "Le seuil exigeant de 75% combin\u00e9 aux livrables pratiques garantit une vraie mont\u00e9e en comp\u00e9tences."
            }
        ],
        "jour-35": [
            {
                id: "j35-q1",
                question: "la premi\u00e8re \u00e9tape d'un projet de consulting IT est...",
                choices: [
                    "l'analyse du besoin",
                    "la solution technique",
                    "le d\u00e9ploiement",
                    "Aucune de ces r\u00e9ponses / Autre",
                ],
                correct_index: 1,
                explanation: "Explication p\u00e9dagogique : La bonne option r\u00e9pond directement aux exigences du cours."
            },
            {
                id: "j35-q2",
                question: "un crit\u00e8re de succ\u00e8s doit \u00eatre...",
                choices: [
                    "mesurable",
                    "vague",
                    "optionnel",
                    "Aucune de ces r\u00e9ponses / Autre",
                ],
                correct_index: 1,
                explanation: "Explication p\u00e9dagogique : La bonne option r\u00e9pond directement aux exigences du cours."
            },
            {
                id: "j35-q3",
                question: "le RTO d\u00e9finit...",
                choices: [
                    "le temps max de r\u00e9tablissement",
                    "le budget",
                    "l'\u00e9quipe",
                    "Aucune de ces r\u00e9ponses / Autre",
                ],
                correct_index: 1,
                explanation: "Explication p\u00e9dagogique : La bonne option r\u00e9pond directement aux exigences du cours."
            },
            {
                id: "j35-q4",
                question: "objectif du module 1 =",
                choices: [
                    "cadrer le projet de fa\u00e7on professionnelle",
                    "improviser",
                    "\u00e9viter l'analyse",
                    "Aucune de ces r\u00e9ponses / Autre",
                ],
                correct_index: 1,
                explanation: "Explication p\u00e9dagogique : La bonne option r\u00e9pond directement aux exigences du cours."
            },
            {
                id: "j35-q5",
                question: "Multi-AZ pour RDS fournit...",
                choices: [
                    "la haute disponibilit\u00e9",
                    "plus de CPU",
                    "le chiffrement",
                    "Aucune de ces r\u00e9ponses / Autre",
                ],
                correct_index: 1,
                explanation: "Explication p\u00e9dagogique : La bonne option r\u00e9pond directement aux exigences du cours."
            }
        ],
        "jour-36": [
            {
                id: "j36-q1",
                question: "UAC sous Windows sert \u00e0...",
                choices: [
                    "contr\u00f4ler l'\u00e9l\u00e9vation de privil\u00e8ges",
                    "acc\u00e9l\u00e9rer le syst\u00e8me",
                    "supprimer des fichiers",
                    "Aucune de ces r\u00e9ponses / Autre",
                ],
                correct_index: 1,
                explanation: "Explication p\u00e9dagogique : La bonne option r\u00e9pond directement aux exigences du cours."
            },
            {
                id: "j36-q2",
                question: "NTFS permet...",
                choices: [
                    "les permissions avanc\u00e9es sur les fichiers",
                    "uniquement FAT32",
                    "rien",
                    "Aucune de ces r\u00e9ponses / Autre",
                ],
                correct_index: 1,
                explanation: "Explication p\u00e9dagogique : La bonne option r\u00e9pond directement aux exigences du cours."
            },
            {
                id: "j36-q3",
                question: "un TCD Excel croise...",
                choices: [
                    "lignes et colonnes pour synth\u00e9tiser des donn\u00e9es",
                    "des formules uniquement",
                    "rien",
                    "Aucune de ces r\u00e9ponses / Autre",
                ],
                correct_index: 1,
                explanation: "Explication p\u00e9dagogique : La bonne option r\u00e9pond directement aux exigences du cours."
            },
            {
                id: "j36-q4",
                question: "MMC est...",
                choices: [
                    "une console d'administration Windows",
                    "un tableur",
                    "un navigateur",
                    "Aucune de ces r\u00e9ponses / Autre",
                ],
                correct_index: 1,
                explanation: "Explication p\u00e9dagogique : La bonne option r\u00e9pond directement aux exigences du cours."
            },
            {
                id: "j36-q5",
                question: "Event Viewer affiche...",
                choices: [
                    "les logs syst\u00e8me Windows",
                    "les emails",
                    "les formules Excel",
                    "Aucune de ces r\u00e9ponses / Autre",
                ],
                correct_index: 1,
                explanation: "Explication p\u00e9dagogique : La bonne option r\u00e9pond directement aux exigences du cours."
            }
        ],
        "jour-37": [
            {
                id: "j37-q1",
                question: "`systemctl enable nginx` fait...",
                choices: [
                    "d\u00e9marrer nginx au boot",
                    "red\u00e9marrer nginx",
                    "arr\u00eater nginx",
                    ", 39A, 40A, 41-sinon bruit et ignorance des alertes, 42A, 43A, 44-incident = interruption, probl\u00e8me = cause racine, 45-ouvrir ticket probl\u00e8me + RCA, 46A, 47-diagnostiquer (du -sh), nettoyer, pr\u00e9venir (logrotate), 48A, 49-contexte + tests + hypoth\u00e8se + demande claire, 50A.",
                ],
                correct_index: 1,
                explanation: "Explication p\u00e9dagogique : La bonne option r\u00e9pond directement aux exigences du cours."
            },
            {
                id: "j37-q2",
                question: "`journalctl -u nginx --since \"1 hour ago\"` affiche...",
                choices: [
                    "les logs nginx de la derni\u00e8re heure",
                    "tout le journal",
                    "rien",
                    ", 39A, 40A, 41-sinon bruit et ignorance des alertes, 42A, 43A, 44-incident = interruption, probl\u00e8me = cause racine, 45-ouvrir ticket probl\u00e8me + RCA, 46A, 47-diagnostiquer (du -sh), nettoyer, pr\u00e9venir (logrotate), 48A, 49-contexte + tests + hypoth\u00e8se + demande claire, 50A.",
                ],
                correct_index: 1,
                explanation: "Explication p\u00e9dagogique : La bonne option r\u00e9pond directement aux exigences du cours."
            },
            {
                id: "j37-q3",
                question: "`chmod 640 fichier` donne...",
                choices: [
                    "rw-r-----",
                    "rwx------",
                    "r--r--r--",
                    ", 39A, 40A, 41-sinon bruit et ignorance des alertes, 42A, 43A, 44-incident = interruption, probl\u00e8me = cause racine, 45-ouvrir ticket probl\u00e8me + RCA, 46A, 47-diagnostiquer (du -sh), nettoyer, pr\u00e9venir (logrotate), 48A, 49-contexte + tests + hypoth\u00e8se + demande claire, 50A.",
                ],
                correct_index: 1,
                explanation: "Explication p\u00e9dagogique : La bonne option r\u00e9pond directement aux exigences du cours."
            },
            {
                id: "j37-q4",
                question: "Active Directory utilise le protocole...",
                choices: [
                    "LDAP",
                    "HTTP",
                    "SSH",
                    ", 39A, 40A, 41-sinon bruit et ignorance des alertes, 42A, 43A, 44-incident = interruption, probl\u00e8me = cause racine, 45-ouvrir ticket probl\u00e8me + RCA, 46A, 47-diagnostiquer (du -sh), nettoyer, pr\u00e9venir (logrotate), 48A, 49-contexte + tests + hypoth\u00e8se + demande claire, 50A.",
                ],
                correct_index: 1,
                explanation: "Explication p\u00e9dagogique : La bonne option r\u00e9pond directement aux exigences du cours."
            },
            {
                id: "j37-q5",
                question: "une OU dans Active Directory...",
                choices: [
                    "organise les objets",
                    "stocke les backups",
                    "remplace DNS",
                    ", 39A, 40A, 41-sinon bruit et ignorance des alertes, 42A, 43A, 44-incident = interruption, probl\u00e8me = cause racine, 45-ouvrir ticket probl\u00e8me + RCA, 46A, 47-diagnostiquer (du -sh), nettoyer, pr\u00e9venir (logrotate), 48A, 49-contexte + tests + hypoth\u00e8se + demande claire, 50A.",
                ],
                correct_index: 1,
                explanation: "Explication p\u00e9dagogique : La bonne option r\u00e9pond directement aux exigences du cours."
            }
        ],
        "jour-38": [
            {
                id: "j38-q1",
                question: "`const x = [1,2,3]; x.push(4);` est...",
                choices: [
                    "autoris\u00e9",
                    "interdit",
                    "erreur",
                    ".",
                ],
                correct_index: 1,
                explanation: "Explication p\u00e9dagogique : La bonne option r\u00e9pond directement aux exigences du cours."
            },
            {
                id: "j38-q2",
                question: "`async function f() { return 1; }` retourne...",
                choices: [
                    "une Promise",
                    "1",
                    "undefined",
                    ".",
                ],
                correct_index: 1,
                explanation: "Explication p\u00e9dagogique : La bonne option r\u00e9pond directement aux exigences du cours."
            },
            {
                id: "j38-q3",
                question: "`setTimeout(() => console.log('A'), 0); console.log('B');` affiche...",
                choices: [
                    "B puis A",
                    "A puis B",
                    "erreur",
                    ".",
                ],
                correct_index: 1,
                explanation: "Explication p\u00e9dagogique : La bonne option r\u00e9pond directement aux exigences du cours."
            },
            {
                id: "j38-q4",
                question: "`Promise.all([p1, p2])` rejette si...",
                choices: [
                    "une seule Promise rejette",
                    "toutes r\u00e9ussissent",
                    "rien",
                    ".",
                ],
                correct_index: 1,
                explanation: "Explication p\u00e9dagogique : La bonne option r\u00e9pond directement aux exigences du cours."
            },
            {
                id: "j38-q5",
                question: "`[...arr1, ...arr2]` cr\u00e9e...",
                choices: [
                    "un nouveau tableau",
                    "modifie arr1",
                    "rien",
                    ".",
                ],
                correct_index: 1,
                explanation: "Explication p\u00e9dagogique : La bonne option r\u00e9pond directement aux exigences du cours."
            }
        ],
        "jour-39": [
            {
                id: "j39-q1",
                question: "Un utilisateur signale que son poste Windows est lent. Quelle est la premi\u00e8re v\u00e9rification ?",
                choices: [
                    "Gestionnaire des t\u00e2ches (CPU/RAM)",
                    "R\u00e9installer Windows",
                    "Changer le disque dur",
                    "Appeler le fournisseur",
                ],
                correct_index: 1,
                explanation: "Explication p\u00e9dagogique : La bonne option r\u00e9pond directement aux exigences du cours."
            },
            {
                id: "j39-q2",
                question: "Sous Windows, quel outil permet de voir les logs syst\u00e8me ?",
                choices: [
                    "Event Viewer",
                    "Excel",
                    "Word",
                    "Paint",
                ],
                correct_index: 1,
                explanation: "Explication p\u00e9dagogique : La bonne option r\u00e9pond directement aux exigences du cours."
            },
            {
                id: "j39-q3",
                question: "UAC (User Account Control) sert \u00e0 :",
                choices: [
                    "Contr\u00f4ler l'\u00e9l\u00e9vation de privil\u00e8ges",
                    "Acc\u00e9l\u00e9rer le syst\u00e8me",
                    "Sauvegarder les fichiers",
                    "Installer Office",
                ],
                correct_index: 1,
                explanation: "Explication p\u00e9dagogique : La bonne option r\u00e9pond directement aux exigences du cours."
            },
            {
                id: "j39-q4",
                question: "Dans Excel, que fait la formule `=RECHERCHEV(A1;Table;2;FAUX)` ?",
                choices: [
                    "Cherche la valeur exacte de A1 dans la premi\u00e8re colonne de Table et retourne la 2e colonne",
                    "Additionne A1",
                    "Supprime A1",
                    "Formate A1",
                ],
                correct_index: 1,
                explanation: "Explication p\u00e9dagogique : La bonne option r\u00e9pond directement aux exigences du cours."
            },
            {
                id: "j39-q5",
                question: "Un TCD (Tableau Crois\u00e9 Dynamique) permet de :",
                choices: [
                    "Synth\u00e9tiser et croiser des donn\u00e9es",
                    "\u00c9crire du code",
                    "Envoyer des emails",
                    "Dessiner",
                ],
                correct_index: 1,
                explanation: "Explication p\u00e9dagogique : La bonne option r\u00e9pond directement aux exigences du cours."
            }
        ],
        "jour-40": [
            {
                id: "j40-q1",
                question: "Quel est le concept cl\u00e9 au c\u0153ur de la le\u00e7on du Jour 40 (Simulation Grand Oral) ?",
                choices: [
                    "La ma\u00eetrise pratique de pr\u00e9sentation technique 20 min et questions du jury",
                    "La m\u00e9morisation purement th\u00e9orique des d\u00e9finitions",
                    "L\u2019inactivation des fonctionnalit\u00e9s de s\u00e9curit\u00e9",
                    "L\u2019ex\u00e9cution al\u00e9atoire de commandes syst\u00e8me",
                ],
                correct_index: 0,
                explanation: "La le\u00e7on du Jour 40 est ax\u00e9e sur la ma\u00eetrise op\u00e9rationnelle de pr\u00e9sentation technique 20 min et questions du jury."
            },
            {
                id: "j40-q2",
                question: "Quelle est la premi\u00e8re action recommand\u00e9e lors de la mise en pratique du Jour 40 ?",
                choices: [
                    "Modifier directement les fichiers sans sauvegarde",
                    "Inspecter l\u2019\u00e9tat du syst\u00e8me et v\u00e9rifier les pr\u00e9requis techniques",
                    "Ignorer les messages d\u2019erreur du terminal",
                    "Supprimer les comptes d\u2019acc\u00e8s administrateur",
                ],
                correct_index: 1,
                explanation: "Une inspection rigoureuse et la v\u00e9rification des pr\u00e9requis permettent d\u2019\u00e9viter les erreurs de configuration."
            },
            {
                id: "j40-q3",
                question: "En cas de dysfonctionnement sur un outil vu au Jour 40, quel r\u00e9flexe adopter ?",
                choices: [
                    "Consulter les logs pertinents et analyser le code de retour",
                    "Fermer la session et ignorer le probl\u00e8me",
                    "R\u00e9installer int\u00e9gralement le syst\u00e8me d\u2019exploitation",
                    "D\u00e9sactiver le pare-feu et les contr\u00f4les d\u2019acc\u00e8s",
                ],
                correct_index: 0,
                explanation: "L\u2019analyse factuelle des logs et codes d\u2019erreur est l\u2019attitude requise pour un diagnostic professionnel."
            },
            {
                id: "j40-q4",
                question: "Quel r\u00e9sultat valide la ma\u00eetrise de la journ\u00e9e du Jour 40 ?",
                choices: [
                    "Un score de 75% minimum au QCM et des exercices pratiques compl\u00e9t\u00e9s",
                    "La simple consultation de la page sans r\u00e9pondre aux questions",
                    "Un passage automatique bas\u00e9 sur le temps pass\u00e9",
                    "Une r\u00e9ponse donn\u00e9e au hasard sans justification",
                ],
                correct_index: 0,
                explanation: "Le seuil exigeant de 75% combin\u00e9 aux livrables pratiques garantit une vraie mont\u00e9e en comp\u00e9tences."
            }
        ],
        "jour-41": [
            {
                id: "j41-q1",
                question: "Le port standard HTTPS est...",
                choices: [
                    "443",
                    "80",
                    "22",
                    "25",
                ],
                correct_index: 1,
                explanation: "Explication p\u00e9dagogique : La bonne option r\u00e9pond directement aux exigences du cours."
            },
            {
                id: "j41-q2",
                question: "DNS traduit...",
                choices: [
                    "nom de domaine \u2192 IP",
                    "IP \u2192 nom de domaine",
                    "email",
                    "25",
                ],
                correct_index: 1,
                explanation: "Explication p\u00e9dagogique : La bonne option r\u00e9pond directement aux exigences du cours."
            },
            {
                id: "j41-q3",
                question: "Un sous-r\u00e9seau /24 contient...",
                choices: [
                    "256 adresses",
                    "128",
                    "512",
                    "25",
                ],
                correct_index: 1,
                explanation: "Explication p\u00e9dagogique : La bonne option r\u00e9pond directement aux exigences du cours."
            },
            {
                id: "j41-q4",
                question: "TCP est...",
                choices: [
                    "fiable, orient\u00e9 connexion",
                    "non fiable",
                    "de messagerie",
                    "lent",
                ],
                correct_index: 1,
                explanation: "Explication p\u00e9dagogique : La bonne option r\u00e9pond directement aux exigences du cours."
            },
            {
                id: "j41-q5",
                question: "DHCP attribue...",
                choices: [
                    "des IP dynamiquement",
                    "des DNS",
                    "des emails",
                    "rien",
                ],
                correct_index: 1,
                explanation: "Explication p\u00e9dagogique : La bonne option r\u00e9pond directement aux exigences du cours."
            }
        ],
        "jour-42": [
            {
                id: "j42-q1",
                question: "Quel est le concept cl\u00e9 au c\u0153ur de la le\u00e7on du Jour 42 (Portfolio Digital Professionnel) ?",
                choices: [
                    "La ma\u00eetrise pratique de GitHub Pages, documentation projets et README",
                    "La m\u00e9morisation purement th\u00e9orique des d\u00e9finitions",
                    "L\u2019inactivation des fonctionnalit\u00e9s de s\u00e9curit\u00e9",
                    "L\u2019ex\u00e9cution al\u00e9atoire de commandes syst\u00e8me",
                ],
                correct_index: 0,
                explanation: "La le\u00e7on du Jour 42 est ax\u00e9e sur la ma\u00eetrise op\u00e9rationnelle de GitHub Pages, documentation projets et README."
            },
            {
                id: "j42-q2",
                question: "Quelle est la premi\u00e8re action recommand\u00e9e lors de la mise en pratique du Jour 42 ?",
                choices: [
                    "Modifier directement les fichiers sans sauvegarde",
                    "Inspecter l\u2019\u00e9tat du syst\u00e8me et v\u00e9rifier les pr\u00e9requis techniques",
                    "Ignorer les messages d\u2019erreur du terminal",
                    "Supprimer les comptes d\u2019acc\u00e8s administrateur",
                ],
                correct_index: 1,
                explanation: "Une inspection rigoureuse et la v\u00e9rification des pr\u00e9requis permettent d\u2019\u00e9viter les erreurs de configuration."
            },
            {
                id: "j42-q3",
                question: "En cas de dysfonctionnement sur un outil vu au Jour 42, quel r\u00e9flexe adopter ?",
                choices: [
                    "Consulter les logs pertinents et analyser le code de retour",
                    "Fermer la session et ignorer le probl\u00e8me",
                    "R\u00e9installer int\u00e9gralement le syst\u00e8me d\u2019exploitation",
                    "D\u00e9sactiver le pare-feu et les contr\u00f4les d\u2019acc\u00e8s",
                ],
                correct_index: 0,
                explanation: "L\u2019analyse factuelle des logs et codes d\u2019erreur est l\u2019attitude requise pour un diagnostic professionnel."
            },
            {
                id: "j42-q4",
                question: "Quel r\u00e9sultat valide la ma\u00eetrise de la journ\u00e9e du Jour 42 ?",
                choices: [
                    "Un score de 75% minimum au QCM et des exercices pratiques compl\u00e9t\u00e9s",
                    "La simple consultation de la page sans r\u00e9pondre aux questions",
                    "Un passage automatique bas\u00e9 sur le temps pass\u00e9",
                    "Une r\u00e9ponse donn\u00e9e au hasard sans justification",
                ],
                correct_index: 0,
                explanation: "Le seuil exigeant de 75% combin\u00e9 aux livrables pratiques garantit une vraie mont\u00e9e en comp\u00e9tences."
            }
        ],
        "jour-43": [
            {
                id: "j43-q1",
                question: "Quel est le concept cl\u00e9 au c\u0153ur de la le\u00e7on du Jour 43 (M\u00e9moire de Soutenance) ?",
                choices: [
                    "La ma\u00eetrise pratique de r\u00e9daction du m\u00e9moire, slides et d\u00e9monstration live",
                    "La m\u00e9morisation purement th\u00e9orique des d\u00e9finitions",
                    "L\u2019inactivation des fonctionnalit\u00e9s de s\u00e9curit\u00e9",
                    "L\u2019ex\u00e9cution al\u00e9atoire de commandes syst\u00e8me",
                ],
                correct_index: 0,
                explanation: "La le\u00e7on du Jour 43 est ax\u00e9e sur la ma\u00eetrise op\u00e9rationnelle de r\u00e9daction du m\u00e9moire, slides et d\u00e9monstration live."
            },
            {
                id: "j43-q2",
                question: "Quelle est la premi\u00e8re action recommand\u00e9e lors de la mise en pratique du Jour 43 ?",
                choices: [
                    "Modifier directement les fichiers sans sauvegarde",
                    "Inspecter l\u2019\u00e9tat du syst\u00e8me et v\u00e9rifier les pr\u00e9requis techniques",
                    "Ignorer les messages d\u2019erreur du terminal",
                    "Supprimer les comptes d\u2019acc\u00e8s administrateur",
                ],
                correct_index: 1,
                explanation: "Une inspection rigoureuse et la v\u00e9rification des pr\u00e9requis permettent d\u2019\u00e9viter les erreurs de configuration."
            },
            {
                id: "j43-q3",
                question: "En cas de dysfonctionnement sur un outil vu au Jour 43, quel r\u00e9flexe adopter ?",
                choices: [
                    "Consulter les logs pertinents et analyser le code de retour",
                    "Fermer la session et ignorer le probl\u00e8me",
                    "R\u00e9installer int\u00e9gralement le syst\u00e8me d\u2019exploitation",
                    "D\u00e9sactiver le pare-feu et les contr\u00f4les d\u2019acc\u00e8s",
                ],
                correct_index: 0,
                explanation: "L\u2019analyse factuelle des logs et codes d\u2019erreur est l\u2019attitude requise pour un diagnostic professionnel."
            },
            {
                id: "j43-q4",
                question: "Quel r\u00e9sultat valide la ma\u00eetrise de la journ\u00e9e du Jour 43 ?",
                choices: [
                    "Un score de 75% minimum au QCM et des exercices pratiques compl\u00e9t\u00e9s",
                    "La simple consultation de la page sans r\u00e9pondre aux questions",
                    "Un passage automatique bas\u00e9 sur le temps pass\u00e9",
                    "Une r\u00e9ponse donn\u00e9e au hasard sans justification",
                ],
                correct_index: 0,
                explanation: "Le seuil exigeant de 75% combin\u00e9 aux livrables pratiques garantit une vraie mont\u00e9e en comp\u00e9tences."
            }
        ],
        "jour-44": [
            {
                id: "j44-q1",
                question: "UAC signifie...",
                choices: [
                    "User Account Control",
                    "Universal Access Code",
                    "User Authentication Center",
                    "rien",
                ],
                correct_index: 1,
                explanation: "Explication p\u00e9dagogique : La bonne option r\u00e9pond directement aux exigences du cours."
            },
            {
                id: "j44-q2",
                question: "un TCD Excel permet de...",
                choices: [
                    "synth\u00e9tiser et croiser des donn\u00e9es",
                    "\u00e9crire du code",
                    "envoyer des emails",
                    "rien",
                ],
                correct_index: 1,
                explanation: "Explication p\u00e9dagogique : La bonne option r\u00e9pond directement aux exigences du cours."
            },
            {
                id: "j44-q3",
                question: "`git merge` combine...",
                choices: [
                    "deux branches",
                    "deux fichiers",
                    "deux repos",
                    "rien",
                ],
                correct_index: 1,
                explanation: "Explication p\u00e9dagogique : La bonne option r\u00e9pond directement aux exigences du cours."
            },
            {
                id: "j44-q4",
                question: "`chmod 755 fichier` donne...",
                choices: [
                    "rwxr-xr-x",
                    "rw-r--r--",
                    "---------",
                    "rwxrwxrwx",
                ],
                correct_index: 1,
                explanation: "Explication p\u00e9dagogique : La bonne option r\u00e9pond directement aux exigences du cours."
            },
            {
                id: "j44-q5",
                question: "`[x*2 for x in range(5)]` retourne...",
                choices: [
                    "[0,2,4,6,8]",
                    "[0,1,2,3,4]",
                    "erreur",
                    "rien",
                ],
                correct_index: 1,
                explanation: "Explication p\u00e9dagogique : La bonne option r\u00e9pond directement aux exigences du cours."
            }
        ],
        "jour-45": [
            {
                id: "j45-q1",
                question: "Quel est le concept cl\u00e9 au c\u0153ur de la le\u00e7on du Jour 45 (Cl\u00f4ture & Certification) ?",
                choices: [
                    "La ma\u00eetrise pratique de bilan de progression, certification et plan de carri\u00e8re",
                    "La m\u00e9morisation purement th\u00e9orique des d\u00e9finitions",
                    "L\u2019inactivation des fonctionnalit\u00e9s de s\u00e9curit\u00e9",
                    "L\u2019ex\u00e9cution al\u00e9atoire de commandes syst\u00e8me",
                ],
                correct_index: 0,
                explanation: "La le\u00e7on du Jour 45 est ax\u00e9e sur la ma\u00eetrise op\u00e9rationnelle de bilan de progression, certification et plan de carri\u00e8re."
            },
            {
                id: "j45-q2",
                question: "Quelle est la premi\u00e8re action recommand\u00e9e lors de la mise en pratique du Jour 45 ?",
                choices: [
                    "Modifier directement les fichiers sans sauvegarde",
                    "Inspecter l\u2019\u00e9tat du syst\u00e8me et v\u00e9rifier les pr\u00e9requis techniques",
                    "Ignorer les messages d\u2019erreur du terminal",
                    "Supprimer les comptes d\u2019acc\u00e8s administrateur",
                ],
                correct_index: 1,
                explanation: "Une inspection rigoureuse et la v\u00e9rification des pr\u00e9requis permettent d\u2019\u00e9viter les erreurs de configuration."
            },
            {
                id: "j45-q3",
                question: "En cas de dysfonctionnement sur un outil vu au Jour 45, quel r\u00e9flexe adopter ?",
                choices: [
                    "Consulter les logs pertinents et analyser le code de retour",
                    "Fermer la session et ignorer le probl\u00e8me",
                    "R\u00e9installer int\u00e9gralement le syst\u00e8me d\u2019exploitation",
                    "D\u00e9sactiver le pare-feu et les contr\u00f4les d\u2019acc\u00e8s",
                ],
                correct_index: 0,
                explanation: "L\u2019analyse factuelle des logs et codes d\u2019erreur est l\u2019attitude requise pour un diagnostic professionnel."
            },
            {
                id: "j45-q4",
                question: "Quel r\u00e9sultat valide la ma\u00eetrise de la journ\u00e9e du Jour 45 ?",
                choices: [
                    "Un score de 75% minimum au QCM et des exercices pratiques compl\u00e9t\u00e9s",
                    "La simple consultation de la page sans r\u00e9pondre aux questions",
                    "Un passage automatique bas\u00e9 sur le temps pass\u00e9",
                    "Une r\u00e9ponse donn\u00e9e au hasard sans justification",
                ],
                correct_index: 0,
                explanation: "Le seuil exigeant de 75% combin\u00e9 aux livrables pratiques garantit une vraie mont\u00e9e en comp\u00e9tences."
            }
        ]
    };

    // -----------------------------------------------------------------------
    // Style CSS dynamique
    // -----------------------------------------------------------------------
    const STYLE_ID = 'paradis-quiz-locked-styles';
    if (!document.getElementById(STYLE_ID)) {
        const style = document.createElement('style');
        style.id = STYLE_ID;
        style.textContent = `
            .paradis-quiz-card {
                margin: 40px 0;
                padding: 28px;
                background: rgba(17, 24, 39, 0.95);
                border: 1px solid rgba(6, 182, 212, 0.35);
                border-radius: 16px;
                box-shadow: 0 15px 40px rgba(0, 0, 0, 0.6);
                color: #f3f4f6;
            }
            .paradis-quiz-header {
                display: flex;
                align-items: center;
                justify-content: space-between;
                border-bottom: 1px solid rgba(255,255,255,0.1);
                padding-bottom: 16px;
                margin-bottom: 24px;
                flex-wrap: wrap;
                gap: 10px;
            }
            .paradis-quiz-header h3 {
                margin: 0;
                color: #06b6d4;
                font-size: 1.25rem;
                font-family: 'Outfit', sans-serif;
                font-weight: 700;
            }
            .paradis-quiz-badge-target {
                background: rgba(245, 158, 11, 0.15);
                color: #fbbf24;
                border: 1px solid rgba(245, 158, 11, 0.3);
                padding: 4px 12px;
                border-radius: 20px;
                font-size: 0.8rem;
                font-weight: 700;
            }
            .paradis-quiz-question-box {
                background: rgba(31, 41, 55, 0.6);
                border: 1px solid rgba(255,255,255,0.08);
                border-radius: 12px;
                padding: 20px;
                margin-bottom: 20px;
            }
            .paradis-quiz-question-title {
                font-weight: 700;
                font-size: 0.98rem;
                color: #ffffff;
                margin-bottom: 14px;
                line-height: 1.5;
            }
            .paradis-quiz-options {
                display: flex;
                flex-direction: column;
                gap: 10px;
            }
            .paradis-quiz-option {
                display: flex;
                align-items: center;
                gap: 12px;
                padding: 12px 16px;
                border-radius: 10px;
                background: rgba(17, 24, 39, 0.8);
                border: 1px solid rgba(255,255,255,0.1);
                cursor: pointer;
                transition: all 0.2s ease;
                font-size: 0.9rem;
            }
            .paradis-quiz-option:hover {
                border-color: #06b6d4;
                background: rgba(6, 182, 212, 0.1);
            }
            .paradis-quiz-option.selected {
                border-color: #06b6d4;
                background: rgba(6, 182, 212, 0.2);
            }
            .paradis-quiz-option.correct {
                background: rgba(16, 185, 129, 0.2) !important;
                border-color: #10b981 !important;
                color: #6ee7b7 !important;
                font-weight: 600;
            }
            .paradis-quiz-option.incorrect {
                background: rgba(239, 68, 68, 0.2) !important;
                border-color: #ef4444 !important;
                color: #fca5a5 !important;
            }
            .paradis-quiz-explanation {
                margin-top: 14px;
                padding: 12px 16px;
                background: rgba(6, 182, 212, 0.08);
                border-left: 4px solid #06b6d4;
                border-radius: 6px;
                font-size: 0.88rem;
                color: #cbd5e1;
                line-height: 1.6;
            }
            .paradis-quiz-submit-btn {
                background: linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%);
                color: #ffffff;
                border: none;
                border-radius: 10px;
                padding: 14px 28px;
                font-size: 1rem;
                font-weight: 700;
                cursor: pointer;
                transition: all 0.2s;
                width: 100%;
                margin-top: 10px;
                font-family: inherit;
            }
            .paradis-quiz-submit-btn:hover {
                transform: translateY(-2px);
                box-shadow: 0 8px 25px rgba(6, 182, 212, 0.4);
            }
            .paradis-quiz-result-banner {
                margin-top: 24px;
                padding: 20px;
                border-radius: 12px;
                text-align: center;
                font-size: 1.1rem;
                font-weight: 700;
            }
            .paradis-quiz-result-banner.passed {
                background: rgba(16, 185, 129, 0.15);
                border: 1px solid #10b981;
                color: #34d399;
            }
            .paradis-quiz-result-banner.failed {
                background: rgba(239, 68, 68, 0.15);
                border: 1px solid #ef4444;
                color: #f87171;
            }
            .paradis-next-locked-msg {
                margin-top: 20px;
                padding: 16px 20px;
                border-radius: 12px;
                background: rgba(245, 158, 11, 0.1);
                border: 1px solid rgba(245, 158, 11, 0.3);
                color: #fbbf24;
                font-size: 0.9rem;
                display: flex;
                align-items: center;
                gap: 12px;
            }
        `;
        document.head.appendChild(style);
    }

    function getCurrentDayId() {
        const path = window.location.pathname;
        const match = path.match(/jour-([0-9]{1,2})/i);
        if (!match) return null;
        const num = parseInt(match[1], 10);
        return `jour-${num < 10 ? '0' + num : num}`;
    }

    // -----------------------------------------------------------------------
    // Vérification de la validation préalable du Jour N-1
    // -----------------------------------------------------------------------
    async function checkPreviousDayUnlocked(dayId) {
        const dayNum = parseInt(dayId.replace('jour-', ''), 10);
        if (dayNum <= 1) return true; // Le Jour 1 est toujours ouvert

        const prevDayId = `jour-${dayNum - 1 < 10 ? '0' + (dayNum - 1) : (dayNum - 1)}`;
        if (window.ParadisStorage && typeof window.ParadisStorage.getLocal === 'function') {
            try {
                const prevProgress = await window.ParadisStorage.getLocal('progress', prevDayId);
                const score = prevProgress ? (prevProgress.quiz_score ?? 0) : 0;
                return score >= PASSING_SCORE;
            } catch (e) {
                return true;
            }
        }
        return true;
    }

    // -----------------------------------------------------------------------
    // Injection du Widget QCM
    // -----------------------------------------------------------------------
    async function injectQuizWidget() {
        const dayId = getCurrentDayId();
        if (!dayId) return;

        const contentInner = document.querySelector('.md-content__inner');
        if (!contentInner || document.getElementById('paradis-quiz-card')) return;

        const questions = QUIZ_BANK[dayId] || [
            {
                id: `${dayId}-q1`,
                question: `Test de validation des compétences du ${dayId.toUpperCase()}`,
                choices: [
                    'Procédure conforme aux standards de sécurité bancaire BCC (Valide)',
                    'Non conforme — Risque de sécurité réseau',
                    'Configuration obsolète',
                    'Maintenance non autorisée'
                ],
                correct_index: 0,
                explanation: 'L’option A respecte scrupuleusement la méthode et la sécurité exigées.'
            }
        ];

        const card = document.createElement('div');
        card.id = 'paradis-quiz-card';
        card.className = 'paradis-quiz-card';

        let questionsHTML = '';
        questions.forEach((q, qIndex) => {
            let optionsHTML = '';
            q.choices.forEach((choice, cIndex) => {
                optionsHTML += `
                    <div class="paradis-quiz-option" data-qindex="${qIndex}" data-cindex="${cIndex}">
                        <input type="radio" name="q_${qIndex}" value="${cIndex}" id="q_${qIndex}_c_${cIndex}">
                        <label for="q_${qIndex}_c_${cIndex}">${choice}</label>
                    </div>
                `;
            });

            questionsHTML += `
                <div class="paradis-quiz-question-box" id="qbox_${qIndex}">
                    <div class="paradis-quiz-question-title">Question ${qIndex + 1} : ${q.question}</div>
                    <div class="paradis-quiz-options">
                        ${optionsHTML}
                    </div>
                    <div class="paradis-quiz-explanation" id="qexp_${qIndex}" style="display: none;">
                        💡 <strong>Corrigé & Explication :</strong> ${q.explanation}
                    </div>
                </div>
            `;
        });

        card.innerHTML = `
            <div class="paradis-quiz-header">
                <h3>🧪 Test de Connaissances — ${dayId.toUpperCase()}</h3>
                <span class="paradis-quiz-badge-target">🎯 75% requis pour déverrouiller le Jour Suivant</span>
            </div>
            <form id="paradis-quiz-form" onsubmit="return false;">
                ${questionsHTML}
                <button type="button" id="paradis-quiz-submit-btn" class="paradis-quiz-submit-btn">
                    Sousmettre mes réponses et évaluer mon score
                </button>
            </form>
            <div id="paradis-quiz-result" style="display: none;"></div>
        `;

        contentInner.appendChild(card);

        // Interaction visuelle radio
        const options = card.querySelectorAll('.paradis-quiz-option');
        options.forEach(opt => {
            opt.onclick = () => {
                const qIndex = opt.getAttribute('data-qindex');
                card.querySelectorAll(`.paradis-quiz-option[data-qindex="${qIndex}"]`).forEach(o => o.classList.remove('selected'));
                opt.classList.add('selected');
                const radio = opt.querySelector('input[type="radio"]');
                if (radio) radio.checked = true;
            };
        });

        document.getElementById('paradis-quiz-submit-btn').onclick = () => evaluateSubmission(dayId, questions);
    }

    // -----------------------------------------------------------------------
    // Évaluation et Verrouillage
    // -----------------------------------------------------------------------
    async function evaluateSubmission(dayId, questions) {
        let correctCount = 0;

        questions.forEach((q, qIndex) => {
            const selected = document.querySelector(`input[name="q_${qIndex}"]:checked`);
            const selectedIndex = selected ? parseInt(selected.value, 10) : -1;
            const expEl = document.getElementById(`qexp_${qIndex}`);

            if (expEl) expEl.style.display = 'block';

            const options = document.querySelectorAll(`.paradis-quiz-option[data-qindex="${qIndex}"]`);
            options.forEach(opt => {
                const cIndex = parseInt(opt.getAttribute('data-cindex'), 10);
                if (cIndex === q.correct_index) {
                    opt.classList.add('correct');
                } else if (cIndex === selectedIndex) {
                    opt.classList.add('incorrect');
                }
            });

            if (selectedIndex === q.correct_index) {
                correctCount++;
            }
        });

        const scorePercent = Math.round((correctCount / questions.length) * 100);
        const passed = scorePercent >= PASSING_SCORE;

        const resultBanner = document.getElementById('paradis-quiz-result');
        resultBanner.style.display = 'block';
        resultBanner.className = `paradis-quiz-result-banner ${passed ? 'passed' : 'failed'}`;
        
        resultBanner.innerHTML = `
            ${passed ? '🎉 Félicitations ! Seuil de 75% atteint !' : '🔒 Seuil de 75% non atteint'}<br>
            <span style="font-size: 0.95rem; font-weight: 500;">Votre score : <strong>${scorePercent}%</strong> (${correctCount}/${questions.length} bonnes réponses)</span>
            <p style="font-size: 0.85rem; margin-top: 8px; font-weight: normal;">
                ${passed ? 'Le Jour suivant est désormais déverrouillé dans votre espace étudiant.' : 'Consultez les explications ci-dessus, réévisez le cours et repassez le test pour débloquer la suite.'}
            </p>
        `;

        // Sauvegarde IndexedDB
        if (window.ParadisStorage && typeof window.ParadisStorage.saveLocal === 'function') {
            try {
                let progressRecord = await window.ParadisStorage.getLocal('progress', dayId) || {
                    id: dayId,
                    day_id: dayId,
                    is_completed: false
                };

                progressRecord.quiz_score = scorePercent;
                if (passed) {
                    progressRecord.is_completed = true;
                    progressRecord.study_status = 'completed';
                }
                await window.ParadisStorage.saveLocal('progress', progressRecord);

                window.dispatchEvent(new CustomEvent('paradis:session-changed'));
                window.dispatchEvent(new CustomEvent('paradis:study-status-changed'));
                if (window.ParadisDayCompletion && typeof window.ParadisDayCompletion.decorateSidebar === 'function') {
                    window.ParadisDayCompletion.decorateSidebar();
                }
            } catch (err) {
                console.error('[QuizEngine] Erreur sauvegarde score :', err);
            }
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', injectQuizWidget);
    } else {
        injectQuizWidget();
    }

    window.ParadisQuizEngine = {
        injectQuizWidget,
        evaluateSubmission,
        PASSING_SCORE
    };
})();
