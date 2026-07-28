# TOME P0 — Jour 01 (14h)

## Découpage horaire officiel (à respecter)
- Windows en environnement professionnel — **3h**
- Microsoft Excel avancé — **4h**
- Microsoft Word et PowerPoint — **2h**
- Outlook et gestion du temps — **1h**
- Outils collaboratifs — **2h**
- Banque de questions du jour — **1h30**
- Suivi P1 (recherche d'emploi, CV, veille) — **30 min**

---

## 1) Windows en environnement professionnel (3h)

### Objectifs d'apprentissage
- Créer et gérer des comptes utilisateurs locaux en respectant des règles minimales de sécurité.
- Diagnostiquer un problème courant poste/réseau avec une méthode reproductible.
- Appliquer des réglages de sécurité de base sur un poste Windows.
- Documenter une intervention support de manière professionnelle.

### Contenu pédagogique
Un poste Windows en contexte professionnel se gère avec une logique simple : **compte utilisateur propre**, **accès limité au nécessaire**, **diagnostic structuré**.

1. **Interface et administration**
   - Outils principaux : Paramètres, Panneau de configuration, et consoles d'administration.
   - Raccourcis utiles : `Win + R` puis `control`, `compmgmt.msc`.
   - La console d'administration permet d'accéder vite à gestion des disques, services et comptes locaux.

2. **Gestion utilisateurs**
   - Types de comptes : administrateur, standard.
   - Bonne pratique : l'utilisateur travaille en compte standard; les actions sensibles passent en élévation.
   - Politique mot de passe : longueur, complexité, rotation selon contexte.

3. **Paramétrage réseau de base**
   - Vérifier IP, passerelle, DNS.
   - Distinguer panne locale (machine) et panne réseau (infrastructure).
   - Commandes de base : `ipconfig /all`, `ping`.
   - APIPA (`169.254.x.x`) = symptôme fréquent d'absence de réponse DHCP.

4. **Sécurité poste de travail**
   - Mises à jour système activées.
   - Antivirus/pare-feu actifs.
   - Chiffrement et verrouillage automatique en environnement sensible.

5. **Méthode de résolution d'incident**
   - Étape 1 : observer le symptôme exact.
   - Étape 2 : reproduire.
   - Étape 3 : isoler la cause probable.
   - Étape 4 : corriger.
   - Étape 5 : tester et documenter.

Exemple concret : "Internet ne marche pas".
- Vérifier câble/Wi-Fi.
- Vérifier IP attribuée (`ipconfig /all`).
- Tester `ping 127.0.0.1` puis passerelle puis DNS externe.
- Si IP absente : vérifier adaptateur ou DHCP.
- Documenter cause + action.

### Exercices pratiques (avec corrigés)
1. **Exercice 1 (simple)**  
   Créer un compte utilisateur standard `stagiaire.p0` et configurer un mot de passe robuste.
   - **Corrigé détaillé** :
     - Le compte existe et appartient au type standard (non administrateur).
     - Le mot de passe respecte longueur/complexité minimales.
     - Une connexion test confirme que le compte est opérationnel.
     - Validation : droits limités cohérents avec le principe du moindre privilège.

2. **Exercice 2 (intermédiaire)**  
   Simuler une panne réseau (désactiver Wi-Fi ou câble), observer la configuration, puis rétablir.
   - **Corrigé détaillé** :
     - En simulation de panne, `ipconfig` peut montrer une IP APIPA (`169.254.x.x`).
     - Après reconnexion, `ipconfig /release` puis `ipconfig /renew` renouvelle l'adresse.
     - `ping passerelle` puis `ping DNS externe` valident le rétablissement.
     - Validation : accès réseau revenu et incident documenté.

3. **Exercice 3 (avancé)**  
   Créer un compte `Technicien-P0`, tester droits, puis corriger pour revenir au principe de moindre privilège.
   - **Corrigé détaillé** :
     - Le compte est créé via `net user` et testé à la connexion.
     - L'ajout au groupe admin est fait uniquement pour démonstration/maintenance ponctuelle.
     - Le compte est retiré du groupe admin pour usage quotidien sécurisé.
     - Validation : procédure et justification sécurité consignées dans la fiche d'intervention.

### Nouvelles abréviations rencontrées
- UAC | User Account Control | Contrôle l'élévation de privilèges sous Windows | Interagit avec OS, sécurité poste, comptes utilisateurs
- NTFS | New Technology File System | Système de fichiers Windows avec gestion fine des permissions | Interagit avec ACL, sécurité fichiers, administration poste
- MMC | Microsoft Management Console | Console d'administration système Windows | Interagit avec gestion utilisateurs, services, disques, support technique
- APIPA | Automatic Private IP Addressing | Adresse d'auto-attribution quand DHCP ne répond pas | Interagit avec IP, DHCP, diagnostic réseau

### Banque de questions du module (15)
1. QCM : Quel type de compte doit être utilisé au quotidien ?  
   A. Administrateur B. Standard C. Invité  
2. QCM : Quel composant traduit un nom de domaine en IP ?  
   A. DHCP B. DNS C. NAT  
3. QCM : Quel est le premier réflexe devant "pas internet" ?  
   A. Réinstaller Windows B. Vérifier connectivité locale C. Changer mot de passe  
4. QCM : UAC sert principalement à...  
   A. Sauvegarder les fichiers B. Contrôler élévation de privilèges C. Accélérer le réseau  
5. QCM : NTFS permet surtout...  
   A. Gérer permissions fichiers B. Héberger un site C. Configurer DNS  
6. Ouverte : Explique la différence entre panne locale et panne d'infrastructure.  
7. Ouverte : Donne une procédure courte de diagnostic réseau sur poste Windows.  
8. Ouverte : Pourquoi éviter le compte administrateur pour usage quotidien ?  
9. Ouverte : Quelles vérifications sécurité minimales faire sur un nouveau poste ?  
10. Mise en situation : Un utilisateur se plaint d'un accès lent. Que vérifies-tu en premier ?  
11. Mise en situation : Le Wi-Fi est connecté mais aucun site n'ouvre. Décris les tests.  
12. Mise en situation : Tu dois livrer un poste à un nouvel agent. Checklist minimale ?  
13. Ouverte : Comment documenter une intervention pour qu'un collègue puisse la reprendre ?  
14. QCM : Quelle action suit la correction d'une panne ?  
   A. Fermer ticket B. Tester et valider C. Redémarrer sans vérifier  
15. Ouverte : Donne un exemple de mesure préventive après incident réseau.

---

## 2) Microsoft Excel avancé (4h)

### Objectifs d'apprentissage
- Construire un tableau propre et exploitable avec validation des données.
- Utiliser des formules conditionnelles et de recherche pour automatiser l'analyse.
- Produire un tableau croisé dynamique lisible et utile.
- Interpréter les résultats pour une décision opérationnelle.

### Contenu pédagogique
Excel professionnel = **données propres + formules fiables + synthèse claire**.

1. **Structurer avant de calculer**
   - Une ligne = un enregistrement.
   - Pas de fusion de cellules dans les données brutes.
   - Colonnes nommées clairement.

2. **Formules clés**
   - SI(), SOMME.SI.ENS(), NB.SI.ENS().
   - Recherche : RECHERCHEV ou XLOOKUP selon version.
   - Gestion erreurs : SIERREUR().
   - Références absolues/mixte : `$A$1`, `$A1`, `A$1` pour fiabiliser les copies.

3. **Tableaux croisés dynamiques (TCD)**
   - Choisir dimensions (ex: service) et mesures (ex: total ventes).
   - Filtrer pour lire rapidement une situation.
   - Vérifier cohérence avec données source.

4. **Lecture métier**
   - Identifier un indicateur clé qui dérive.
   - Formuler une conclusion actionnable.
   - Utiliser la mise en forme conditionnelle pour repérer rapidement les seuils critiques.

Exemple : suivi tickets support.
- Colonnes : date, agent, catégorie, statut, délai.
- TCD : tickets par agent et délai moyen.
- Décision : renforcer catégorie où délai dépasse la cible.

### Exercices pratiques (avec corrigés)
1. **Exercice 1 (simple)**  
   Calculer une commission : 10% si ventes > 5000, sinon 5%.
   - **Corrigé détaillé** :
     - La formule conditionnelle calcule 10% au-dessus du seuil, sinon 5%.
     - La recopie vers les lignes suivantes conserve une logique correcte.
     - Les résultats sont cohérents sur plusieurs cas tests.
     - Validation : aucune cellule en erreur et règle métier respectée.

2. **Exercice 2 (intermédiaire)**  
   Rechercher automatiquement nom/prix d'un produit depuis un code.
   - **Corrigé détaillé** :
     - La recherche renvoie le bon nom et le bon prix pour un code valide.
     - Les codes inexistants sont traités proprement avec `SIERREUR`.
     - Le référentiel source est stable (colonnes correctes, types homogènes).
     - Validation : pas de `#N/A` non gérés.

3. **Exercice 3 (avancé)**  
   Créer un TCD CA par région/mois + règle de mise en forme (< 1000 en rouge).
   - **Corrigé détaillé** :
     - Le TCD agrège le CA par région et par mois sans incohérence.
     - Le regroupement des dates en mois est correctement appliqué.
     - La mise en forme conditionnelle marque les zones sous le seuil.
     - Validation : une conclusion métier courte accompagne le visuel.

### Nouvelles abréviations rencontrées
- CSV | Comma-Separated Values | Format simple d'échange de tableaux | Interagit avec Excel, SQL, ETL, import/export de données
- TVA | Taxe sur la Valeur Ajoutée | Taux fixe souvent utilisé dans les calculs commerciaux | Interagit avec formules absolues et facturation

### Banque de questions du module (15)
1. QCM : Une bonne donnée source Excel doit éviter...  
   A. Colonnes nommées B. Lignes vides aléatoires C. Types homogènes  
2. QCM : SIERREUR sert à...  
   A. Trier plus vite B. Gérer erreurs de formule C. Protéger feuille  
3. QCM : Un TCD sert surtout à...  
   A. Dessiner logos B. Synthétiser données C. Installer macros  
4. QCM : CSV est principalement...  
   A. Un moteur SQL B. Un format d'échange C. Un antivirus  
5. QCM : Pour compter avec plusieurs critères, on utilise...  
   A. NB.SI.ENS B. SOMME C. GAUCHE  
6. Ouverte : Pourquoi la qualité des données source est critique ?  
7. Ouverte : Différence entre formule de calcul et TCD.  
8. Ouverte : Donne une règle pour éviter les erreurs d'analyse dans Excel.  
9. Mise en situation : Ton TCD affiche des résultats incohérents. Que contrôles-tu ?  
10. Mise en situation : Un manager veut "tickets urgents > 48h". Quelle formule proposer ?  
11. QCM : Quel risque majeur des fusions de cellules dans une base ?  
   A. Meilleur design B. Tri/filtre cassés C. Aucun  
12. Ouverte : Quand utiliser RECHERCHEV/XLOOKUP ?  
13. Ouverte : Comment présenter une conclusion métier à partir d'un TCD ?  
14. QCM : Une colonne "date" doit être...  
   A. Texte libre B. Format date cohérent C. Mélange texte/date  
15. Mise en situation : Tu dois livrer un fichier d'analyse à un recruteur. Que vérifies-tu avant envoi ?

---

## 3) Microsoft Word et PowerPoint (2h)

### Objectifs d'apprentissage
- Produire un document Word structuré (titres, pagination, styles).
- Générer un document professionnel exportable en format de diffusion.
- Construire une présentation PowerPoint claire orientée décision.
- Adapter le niveau de détail au temps de présentation.

### Contenu pédagogique
En contexte pro, la qualité de forme influence la crédibilité technique.

1. **Word**
   - Styles titres (Titre 1/2/3), table des matières auto.
   - En-tête/pied, pagination, sections.
   - Mise en page sobre, cohérente.
   - Publipostage depuis source Excel pour courriers personnalisés en volume.

2. **PowerPoint**
   - Une idée par slide.
   - Structure recommandée : contexte → problème → solution → résultat.
   - Visuels utiles, texte court.
   - Utilisation du masque des diapositives pour uniformiser logo, police et pied de page.

3. **Rendu final**
   - Export en PDF pour diffusion stable.
   - Vérification orthographe + cohérence visuelle.

### Exercices pratiques (avec corrigés)
1. **Exercice 1 (simple)**  
   Créer une note Word de 1 page avec styles et pagination.
   - **Corrigé détaillé** :
     - Les styles de titre sont appliqués de manière hiérarchique.
     - Pagination active et cohérente sur tout le document.
     - Mise en page uniforme (marges, interlignes, police lisible).
     - Validation : document exploitable sans retouche majeure.

2. **Exercice 2 (intermédiaire)**  
   Ajouter une table des matières automatique puis réaliser un mini publipostage (5 contacts).
   - **Corrigé détaillé** :
     - La table des matières est générée automatiquement depuis les styles.
     - La source Excel est bien connectée au publipostage.
     - Les champs fusionnés (prénom/nom) se remplissent correctement.
     - Validation : prévisualisation correcte avant export final.

3. **Exercice 3 (avancé)**  
   Créer un mini deck de 5 slides avec masque personnalisé (logo + date + police).
   - **Corrigé détaillé** :
     - Le masque impose logo, police et pied de page sur toutes les slides.
     - La structure suit contexte → problème → solution → résultat.
     - Le texte reste synthétique et orienté décision.
     - Validation : deck lisible en présentation rapide.

### Nouvelles abréviations rencontrées
- PDF | Portable Document Format | Format de diffusion stable entre machines | Interagit avec Word, PowerPoint, portfolio et candidatures

### Banque de questions du module (15)
1. QCM : Pourquoi utiliser les styles Word ?  
   A. Pour colorer vite B. Pour structurer et automatiser C. Pour imprimer moins cher  
2. QCM : Une slide efficace contient...  
   A. Un paragraphe long B. Une idée clé C. Le plus de texte possible  
3. QCM : PDF est utile surtout pour...  
   A. Modifier facilement B. Diffuser sans casse de format C. Compiler du code  
4. Ouverte : Explique l'intérêt d'une table des matières automatique.  
5. Ouverte : Donne une structure de présentation en 4 étapes.  
6. Mise en situation : Tu as 5 minutes d'oral pour un recruteur, que gardes-tu ?  
7. QCM : Le risque principal d'une slide surchargée est...  
   A. Plus complète B. Moins lisible C. Plus persuasive  
8. Ouverte : Comment garantir la cohérence visuelle d'un document ?  
9. QCM : Pour mise à jour facile d'un document long, priorité à...  
   A. Styles B. Couleurs C. Images lourdes  
10. Ouverte : Pourquoi un rapport technique mal formaté peut nuire en entretien ?  
11. Mise en situation : On te demande un compte-rendu en 30 min. Quelles sections minimales ?  
12. QCM : L'ordre recommandé d'un deck pro est...  
   A. Résultat→Problème→Contexte B. Contexte→Problème→Solution→Résultat C. Aléatoire  
13. Ouverte : Différence entre document de travail et document de diffusion.  
14. Mise en situation : Un fichier envoyé s'affiche mal chez le recruteur. Prévention ?  
15. QCM : Quel format privilégier pour envoi final d'une présentation ?  
   A. PNG B. PDF C. TXT

---

## 4) Outlook et gestion du temps (1h)

### Objectifs d'apprentissage
- Organiser une boîte mail avec des règles simples et robustes.
- Planifier un agenda professionnel (blocs focus, réunions, relances).
- Rédiger des emails clairs avec objet/action attendue.
- Réduire la perte de temps liée aux interruptions.

### Contenu pédagogique
Un professionnel numérique gère son temps par **priorisation visible**.

1. **Boîte mail**
   - Dossiers utiles : Action, Attente, Archive.
   - Objet explicite : [Action requise] + sujet.
   - Règles automatiques pour trier.
   - Signature professionnelle standardisée (nom, rôle, contact).

2. **Calendrier**
   - Bloquer des plages de production.
   - Préparer les réunions (objectif, durée, livrable).
   - Ajouter des rappels réalistes.
   - Utiliser l'assistant de planification pour vérifier les disponibilités.

3. **Qualité de communication**
   - Message court : contexte, demande, échéance.
   - Pièces jointes nommées proprement.

### Exercices pratiques (avec corrigés)
1. **Exercice 1 (simple)**  
   Créer une signature pro + 3 dossiers mail (Action/Attente/Archive).
   - **Corrigé détaillé** :
     - La signature contient identité, rôle et contact professionnel.
     - Les dossiers Action/Attente/Archive sont créés et utilisés.
     - Le tri initial rend la boîte plus lisible.
     - Validation : priorités visibles en moins de 30 secondes.

2. **Exercice 2 (intermédiaire)**  
   Créer une règle Outlook : si objet contient "URGENT", déplacer vers dossier "Urgents".
   - **Corrigé détaillé** :
     - La règle cible bien le mot-clé "URGENT" dans l'objet.
     - Un mail test déclenche le déplacement automatique.
     - Aucun autre flux critique n'est cassé par la règle.
     - Validation : dossier "Urgents" opérationnel.

3. **Exercice 3 (avancé)**  
   Planifier une réunion technique avec assistant de disponibilité + mail de suivi.
   - **Corrigé détaillé** :
     - Le planificateur identifie un créneau disponible pour tous.
     - L'invitation contient objectif, durée et livrable attendu.
     - Un mail de suivi synthétique est envoyé après réunion.
     - Validation : traçabilité complète de la réunion.

### Nouvelles abréviations rencontrées
- SMTP | Simple Mail Transfer Protocol | Protocole d'envoi d'emails | Interagit avec Outlook, réseau TCP/IP, sécurité mail
- IMAP | Internet Message Access Protocol | Protocole d'accès/synchronisation des emails | Interagit avec Outlook, serveur mail, gestion multi-appareils

### Banque de questions du module (15)
1. QCM : Un bon objet mail doit être...  
   A. Vague B. Actionnable C. Très long  
2. QCM : IMAP sert surtout à...  
   A. Envoyer B. Synchroniser accès C. Chiffrer disque  
3. QCM : SMTP sert à...  
   A. Recevoir web B. Envoyer email C. Résoudre DNS  
4. Ouverte : Propose une structure courte de mail professionnel.  
5. Ouverte : Pourquoi bloquer des créneaux "focus" dans le calendrier ?  
6. Mise en situation : Trop de mails non lus. Quelle stratégie en 3 étapes ?  
7. QCM : Quel dossier est utile pour suivre les réponses en attente ?  
   A. Corbeille B. Attente C. Spam  
8. Ouverte : Erreur fréquente en communication email technique ?  
9. QCM : Une réunion utile doit avoir...  
   A. Sujet flou B. Objectif explicite C. Durée indéfinie  
10. Mise en situation : Tu dois relancer un fournisseur sans conflit. Comment formuler ?  
11. Ouverte : Comment réduire les interruptions liées à la messagerie ?  
12. QCM : Quelle pratique augmente la traçabilité ?  
   A. Objets clairs B. Réponses orales non notées C. Pièces jointes sans nom  
13. Ouverte : Quand utiliser "répondre à tous" ?  
14. Mise en situation : Un manager demande un statut rapide d'incident par mail. Réponse type ?  
15. QCM : Priorité de gestion du temps dans ce programme intensif ?  
   A. Réagir à tout B. Protéger les blocs d'apprentissage C. Reporter systématiquement

---

## 5) Outils collaboratifs professionnels (2h)

### Objectifs d'apprentissage
- Utiliser Teams/Slack de manière professionnelle et traçable.
- Structurer un canal de travail (messages, fichiers, décisions).
- Appliquer une logique ticket simple pour suivi des demandes.
- Collaborer sans perdre l'information critique.

### Contenu pédagogique
La collaboration efficace repose sur trois principes : **canal clair**, **message utile**, **trace durable**.

1. **Règles de communication**
   - Un canal = un sujet.
   - Message court avec contexte + action + échéance.
   - Mention ciblée, pas de bruit.
   - Teams privilégié pour synchronisation rapide; canaux asynchrones pour traçabilité.

2. **Partage documentaire**
   - Versionner les fichiers, nommage uniforme.
   - Distinguer brouillon / validé.
   - Éviter les documents orphelins sans propriétaire.
   - Niveaux d'accès : lecteur/commentateur/éditeur selon besoin.

3. **Logique ticket**
   - Chaque demande importante devient ticket.
   - Ticket minimal : problème, impact, priorité, statut, propriétaire.
   - Cycle standard : Nouveau → En cours → Résolu → Fermé.
   - Clôture avec preuve de résolution.

### Exercices pratiques (avec corrigés)
1. **Exercice 1 (simple)**  
   Créer un dossier partagé et attribuer lecteur/commentateur/éditeur selon trois cas.
   - **Corrigé détaillé** :
     - Les droits sont attribués selon besoin réel (lecture/commentaire/édition).
     - Aucun utilisateur n'obtient plus de droits que nécessaire.
     - La propriété du document est explicite.
     - Validation : partage sécurisé et traçable.

2. **Exercice 2 (intermédiaire)**  
   Rédiger 5 messages de canal avec format pro (contexte/action/échéance).
   - **Corrigé détaillé** :
     - Chaque message suit le format contexte → action → échéance.
     - Les mentions sont ciblées aux personnes concernées.
     - L'action attendue est explicite et vérifiable.
     - Validation : lecture rapide sans ambiguïté.

3. **Exercice 3 (avancé)**  
   Simuler un ticket imprimante bloquée (Nouveau → En cours → Résolu → Fermé) avec preuve finale.
   - **Corrigé détaillé** :
     - Le ticket passe par les 4 statuts standard sans saut illogique.
     - Les actions réalisées sont historisées à chaque étape.
     - La clôture inclut une preuve de résolution.
     - Validation : ticket réouvrable avec diagnostic déjà documenté.

### Nouvelles abréviations rencontrées
- SSO | Single Sign-On | Authentification unique multi-applications | Interagit avec sécurité des accès, comptes utilisateurs, outils collaboratifs
- ITSM | IT Service Management | Gestion structurée des services et incidents IT | Interagit avec tickets, SLA, supervision et support

### Banque de questions du module (15)
1. QCM : But principal d'un canal dédié ?  
   A. Multiplier les discussions B. Concentrer un sujet C. Éviter les preuves  
2. QCM : Un ticket doit contenir au minimum...  
   A. Couleur B. Impact + statut + propriétaire C. Emoji  
3. QCM : SSO signifie...  
   A. Multi mots de passe B. Authentification unique C. Sauvegarde serveur  
4. QCM : ITSM concerne...  
   A. Design graphique B. Gestion des services IT C. Compression de fichiers  
5. Ouverte : Différence entre message informatif et message actionnable.  
6. Mise en situation : Une demande urgente est noyée dans le chat. Que fais-tu ?  
7. Ouverte : Pourquoi documenter la clôture d'un ticket ?  
8. QCM : Quel risque d'un partage documentaire sans règles ?  
   A. Collaboration fluide B. Perte de version C. Sécurité renforcée  
9. Ouverte : Donne un format standard de message équipe.  
10. Mise en situation : Deux équipes se contredisent sur la cause d'incident. Comment cadrer ?  
11. QCM : Pour traçabilité, mieux vaut...  
   A. Appels non notés B. Ticket mis à jour C. Message vocal unique  
12. Ouverte : Rôle d'un propriétaire de ticket.  
13. Mise en situation : Un ticket "résolu" revient 2h après. Que dois-tu ajouter ?  
14. QCM : Quel lien fort entre ITSM et SLA ?  
   A. Aucun B. Suivi du niveau de service C. UI  
15. Ouverte : Quelles bonnes pratiques pour réduire le bruit dans un canal équipe ?

---

## 6) Banque de questions du jour (1h30)

### Objectifs d'apprentissage
- S'entraîner en conditions de test court et chronométré.
- Identifier rapidement les zones faibles du jour.
- Transformer les erreurs en plan de correction immédiat.

### Contenu pédagogique
Cette séance n'est pas "théorique": c'est une **simulation**.

Format recommandé :
1. 45 min : test mixte (QCM + questions ouvertes + cas courts).
2. 30 min : correction active (justifier chaque réponse).
3. 15 min : plan correctif (3 faiblesses + 3 actions).

Règle clé : ne pas mémoriser des réponses, mais mémoriser des **raisonnements**.

### Exercices pratiques (avec corrigés)
1. **Exercice 1 (simple)**  
   Créer un mini-test de 12 questions couvrant Windows + Excel.
   - **Corrigé détaillé** :
     - Répartition équilibrée entre Windows, Excel, bureautique et collaboration.
     - Mélange QCM/ouvert/mise en situation.
     - Difficulté progressive (simple → intermédiaire → cas).
     - Validation : test représentatif du niveau J1.

2. **Exercice 2 (intermédiaire)**  
   Corriger un test en classant les erreurs : connaissance / méthode / attention.
   - **Corrigé détaillé** :
     - Chaque erreur est classée (concept, méthode, attention).
     - La cause racine est explicitée pour éviter la répétition.
     - Une action corrective est associée à chaque erreur.
     - Validation : plan de correction concret et priorisé.

3. **Exercice 3 (avancé)**  
   Construire un plan "rattrapage 24h" basé sur les erreurs.
   - **Corrigé détaillé** :
     - Le plan est découpé en blocs horaires réalistes.
     - Chaque bloc possède un livrable mesurable.
     - Une vérification finale confirme la progression.
     - Validation : plan exécutable dès la prochaine session.

### Nouvelles abréviations rencontrées
- Aucune nouvelle abréviation technique.

### Banque de questions du module (15)
1. QCM : Quel est l'objectif principal d'une banque de questions quotidienne ?  
   A. Remplir du temps B. Mesurer et corriger C. Remplacer la pratique  
2. QCM : Une erreur "méthode" signifie souvent...  
   A. Concept inconnu B. Processus de résolution faible C. Faute de frappe uniquement  
3. Ouverte : Pourquoi chronométrer une partie du test ?  
4. Ouverte : Comment transformer une erreur en action correctrice ?  
5. Mise en situation : Score faible en réseau, bon en Office. Plan immédiat ?  
6. QCM : La correction utile doit...  
   A. Donner juste la bonne réponse B. Expliquer le raisonnement C. Être reportée  
7. Ouverte : Quelle différence entre révision passive et révision active ?  
8. QCM : À la fin du test, priorité à...  
   A. Passer à autre chose B. Identifier faiblesses C. Changer d'objectif  
9. Mise en situation : Tu manques de temps en test. Que modifies-tu ?  
10. Ouverte : Propose une grille simple de suivi des erreurs.  
11. QCM : Un bon item de test doit être...  
   A. Ambigu B. Mesurable C. Hors sujet  
12. Ouverte : Comment équilibrer QCM et questions ouvertes ?  
13. Mise en situation : Tu connais la théorie mais rates les cas. Que faire ?  
14. QCM : Quelle pratique améliore la rétention ?  
   A. Relecture unique B. Rappel actif C. Surlignage seul  
15. Ouverte : Donne un exemple de "preuve de progression" après correction.

---

## 7) Suivi P1 (30 min) — recherche d'emploi, CV, veille

### Objectifs d'apprentissage
- Mettre à jour chaque jour le dossier de candidature sans attendre la fin du programme.
- Aligner le vocabulaire CV avec les compétences réellement travaillées.
- Repérer les exigences réelles des offres ciblées.

### Contenu pédagogique
Le suivi P1 quotidien crée un avantage cumulatif :
1. 10 min : mise à jour CV/profil (1 ligne de compétence prouvée).
2. 10 min : veille 3 offres ciblées (banque/institution/IT).
3. 10 min : extraction des exigences récurrentes.

Livrable quotidien minimum :
- 1 mise à jour CV/profil,
- 1 capture d'exigences marché,
- 1 action du lendemain.

### Exercices pratiques (avec corrigés)
1. **Exercice 1 (simple)**  
   Ajouter au CV une ligne "Compétences J1" liée à preuve concrète.
   - **Corrigé détaillé** :
     - La ligne CV cite l'action faite, l'outil utilisé et le résultat obtenu.
     - Le vocabulaire reste factuel et vérifiable.
     - Pas d'affirmation non prouvée.
     - Validation : formulation crédible en entretien.

2. **Exercice 2 (intermédiaire)**  
   Analyser 3 offres et lister 5 exigences communes.
   - **Corrigé détaillé** :
     - Les exigences similaires sont regroupées (ex: support/ticketing).
     - Les occurrences sont comptées pour prioriser.
     - Le top 3 sert de cible de progression.
     - Validation : lien direct entre veille et plan d'étude.

3. **Exercice 3 (avancé)**  
   Rédiger un mini pitch (5 lignes) "ce que je sais déjà faire après J1".
   - **Corrigé détaillé** :
     - Le pitch présente compétences, preuve et utilité poste.
     - Les phrases sont courtes et concrètes.
     - Le niveau annoncé correspond aux preuves disponibles.
     - Validation : discours défendable face à un recruteur.

### Nouvelles abréviations rencontrées
- Aucune nouvelle abréviation technique.

### Banque de questions du module (15)
1. QCM : Pourquoi mettre à jour CV/profil dès J1 ?  
   A. Pour décorer B. Pour candidater plus tôt C. Sans utilité  
2. Ouverte : Donne une bonne formulation de compétence prouvée.  
3. QCM : La veille d'offres sert à...  
   A. Reporter l'étude B. Cibler les compétences demandées C. Éviter les candidatures  
4. Ouverte : Qu'est-ce qu'une preuve crédible sur un CV technique ?  
5. Mise en situation : Une offre demande Linux + tickets + Excel. Comment t'aligner dès J1 ?  
6. QCM : Une compétence doit être reliée à...  
   A. Outil + action + résultat B. Opinion C. Titre seul  
7. Ouverte : Pourquoi éviter les formulations vagues ("bon en informatique") ?  
8. QCM : Quelle action quotidienne renforce l'employabilité ?  
   A. Rien documenter B. Tracer progression C. Changer objectif chaque jour  
9. Ouverte : Comment choisir les offres de veille utiles ?  
10. Mise en situation : Tu as peu d'expérience officielle. Quelle stratégie de preuve ?  
11. QCM : Un pitch utile doit être...  
   A. Long B. Concret C. Généraliste  
12. Ouverte : Donne un exemple de micro-livrable à valoriser après J1.  
13. QCM : P1 doit démarrer...  
   A. À la fin du programme B. Dès le début C. Après P3  
14. Mise en situation : Une offre insiste sur "communication technique". Comment le montrer ?  
15. Ouverte : Quel lien entre suivi P1 quotidien et réussite entretien ?

---

---

## Validation qualité J1 (anti-superficiel)

### Grille d'évaluation rapide (sur 20)
| Module | Note /20 | Seuil |
|---|---|---|
| Windows environnement pro | ? | >= 14 |
| Excel avancé | ? | >= 14 |
| Word/PowerPoint | ? | >= 14 |
| Outlook | ? | >= 12 |
| Outils collaboratifs | ? | >= 14 |

### Seuil global J1
- **>= 16/20** : acquis opérationnel, passage J2 normal.
- **12-15/20** : passage J2 avec remédiation ciblée 30 min.
- **< 12/20** : renforcement J2 obligatoire avant montée de charge.

### Check-lists de validation
- [ ] Je peux diagnostiquer un problème réseau de bout en bout (ipconfig → ping → DNS) sans aide
- [ ] Je peux expliquer la différence entre un utilisateur standard et administrateur
- [ ] Je sais créer un tableau croisé dynamique avec au moins 2 champs calculés
- [ ] Je sais écrire une formule VLOOKUP/XLOOKUP pertinente pour un besoin métier
- [ ] Je peux structurer un document Word avec styles, table des matières et en-têtes
- [ ] Je sais créer un canal Teams/Slack avec permissions appropriées
- [ ] Je peux ouvrir, suivre et fermer un ticket selon le cycle standard (Nouveau → Résolu → Fermé)
- [ ] Je peux expliquer oralement une action réalisée en 2 minutes, faits + impact

---

## Corrigés guidés — mode tuteur (réponses attendues)

> Tu as raison : ici tu es l'étudiant. Utilise cette section pour t'auto-corriger immédiatement après avoir tenté chaque module.

### A. Corrigé — Module 1 (Windows environnement professionnel)
1. **B** — `ipconfig /all` affiche la configuration IP complète (adresse, masque, passerelle, DNS)
2. **C** — Un pare-feu bloque le trafic non autorisé
3. **B** — Compte standard = droits limités, élévation temporaire pour les actions sensibles
4. `ipconfig /all` (adresse IP, masque, passerelle, DNS), `ping` (test connectivité), `tracert` (sauts réseau). Ordre : vérifier le local, puis la passerelle, puis l'externe.
5. **B** — Les droits administrateurs ne doivent être utilisés que pour les tâches d'administration
6. **A** — Un problème de résolution DNS se manifeste par : ping IP OK mais ping nom_de_domaine FAIL
7. **B** — 169.254.x.x = adresse APIPA = absence de réponse DHCP = pas de connexion réseau automatique
8. **C** — Un rapport d'intervention documente symptômes, tests réalisés, correction, résultat et timestamp
9. **B** — Windows Defender Firewall ou pare-feu réseau (routeur)
10. **A** — Un compte administrateur ne doit être utilisé que pour l'administration, pas pour le travail quotidien
11. **B** — Le registre Windows est sensible : une mauvaise modification peut rendre le système instable
12. **B** — `compmgmt.msc` gère disques, services et utililisateurs en un seul endroit
13. **A** — Les mises à jour de sécurité corrigent les vulnérabilités exploitables
14. **C** — L'antivirus ne remplace pas une politique de sécurité (mots de passe, droits, mises à jour)
15. **B** — Vérifier que le service est actif (`systemctl status` ou via l'interface)

### B. Corrigé — Module 2 (Excel avancé)
1. **B** — La référence absolue (`$A$1`) ne change pas lors de la copie de la formule
2. **B** — `VLOOKUP` (vertical lookup) cherche une valeur dans la première colonne d'un tableau et retourne une valeur d'une autre colonne de la même ligne
3. **B** — `SOMME(A1:A10)` calcule le total d'une plage de cellules
4. **A** — Un TCD (Tableau Croisé Dynamique) agrège des données pour les analyser par catégorie sans formule manuelle
5. **B** — `MOYENNE(B2:B100)` calcule la moyenne de la colonne Ventes
6. **C** — `NB.SI(plage;critère)` compte les cellules répondant à un critère
7. **B** — `JOUR(A1)` extrait le jour d'une date, `MOIS(A1)` extrait le mois, `ANNEE(A1)` extrait l'année
8. **A** — Le format conditionnel modifie l'apparence en fonction de la valeur
9. **A** — Trier par la colonne la plus pertinente (ex: date, montant) d'abord
10. **A** — Un graphique rend les tendances visuelles et compréhensibles
11. **C** — Le filtre avancé permet de combiner plusieurs critères simultanément
12. **B** — La fonction SI (`=SI(condition;valeur_si_vrai;valeur_si_faux)`) permet une logique conditionnelle
13. **B** — Verrouiller les cellules contenant les formules empêche les modifications accidentelles
14. **A** — Un graphique combiné (ex: colonne + ligne) montre deux types de données sur un même graphique
15. **A** — La protection par mot de passe d'un fichier Excel limite la modification non autorisée

### C. Corrigé — Module 3 (Word/PowerPoint)
1. **B** — Un "Style" (Titre 1, Titre 2, Normal) définit une apparence uniforme réutilisable
2. **B** — `Références > Table des matières` génère automatiquement la table à partir des styles
3. **C** — Un en-tête/pièce de page répète des informations (numéro page, titre document) sur chaque page
4. **B** — Le format PDF préserve la mise en page et les polices sur tout appareil
5. **B** — Les transitions (apparition, fondu) ne doivent pas être excessives — privilégier la fluidité
6. **A** — La diapositive titre présente le sujet, le nom, la date, l'organisation
7. **B** — Le format 16:9 (widescreen) est le standard actuel pour les présentations
8. **A** — Dans Word, `Créer un document > Nouveau document vierge` ou Ctrl+N
9. **C** — La règle des 3 points par diapositive : un message, un support visuel, un résumé
10. **B** — Le mode Présentation permet de voir la diapositive telle que le public la verra
11. **A** — `Disposition > Marges > Normales` pour des marges standards de 2,5 cm
12. **B** — Powerpoint est conçu pour les présentations avec diapositives animées
13. **A** — `Mise en page > Colonnes` divise le texte en plusieurs colonnes
14. **B** — Un objet SmartArt (organigramme, processus) améliore la lisibilité visuelle
15. **B** — Le mode Plan permet de réorganiser la structure du document par titres hiérarchiques

### D. Corrigé — Module 4 (Outlook)
1. **C** — Le courriel est la principale source de perte de temps en environnement pro
2. **B** — Dossiers classés par projet, date ou type de destinataire
3. **B** — Le Délai de Rappel (Rappel) notifie à une heure précise si aucune réponse n'est reçue
4. **B** — Répondre à tous envoie à tous les destinataires initiaux, Répondre seulement à l'expéditeur direct
5. **B** — Un RDV doit contenir : objet clair, date/heure, lieu/lien, ordre du jour, Participants invités
6. **C** — Le drapeau rouge indique une action prioritaire à faire rapidement
7. **A** — Le dossier Boîte de réception est le point central — un email y va puis sort (traité/archivé/supprimé)
8. **B** — Règle : traiter un email = agir (répondre), archiver ou supprimer — jamais le laisser dans la boîte
9. **C** — Le filtre automatique (règles de messagerie) trie les emails entrants par critères
10. **B** — Un email professionnel commence par une salutation, corps concis, formule de politesse, signature
11. **C** — En pièce jointe utilise toujours le format PDF pour les documents finalisés
12. **A** — Le Rappel (Rappel de RDV) dans le calendrier notifie à un intervalle configurable avant le RDV
13. **B** — Le dossier Éléments envoyés sert de preuve écrite des communications
14. **B** — Planifier des plages horaires dédiées (ex: 9h-9h30 et 16h-16h30) plutôt que de consulter en permanence
15. **A** — Un email trop long perd le lecteur — les points courts et la structure améliorent la lisibilité

### E. Corrigé — Module 5 (Outils collaboratifs)
1. **B** — Un canal dédié = un sujet = moins de bruit, plus de traçabilité
2. **A** — Teams est synchronisé (temps réel), Slack peut être asynchrone selon les canaux configurés
3. **B** — Évite de mélanger les sujets dans un même canal — chaque canal = un thème
4. **C** — Le canal est la conversation structurée, le ticket est la demande tracée
5. **A** — Le nommage doit être explicite : `projet-x-contrats` plutôt que `general` ou `test`
6. **C** — Le fichier est la source de vérité, les messages dans le canal pointent vers lui
7. **B** — Un membre Éditeur peut modifier, un Commentateur peut commenter, un Lecteur ne fait que lire
8. **B** — Chaque message doit contenir : Contexte (quoi), Action (quoi attendre), Échéance (quand)
9. **C** — Le bon format : `[ACTION requise] Contenu — Réponse attendue avant [date]`
10. **B** — La visibilité de la progression crée la confiance dans l'équipe
11. **C** — Une notification par canal pour les messages importants, les réactions pour les confirmations
12. **A** — Les décisions doivent être résumées dans le canal et archivées (message épinglé)
13. **B** — Un document orphelin (sans propriétaire ni lien dans un canal) est perdu pour l'équipe
14. **A** — Un canal d'équipe pour la communication quotidienne, un canal projet pour un projet spécifique
15. **B** — La traçabilité est le critère numéro 1 en collaboratif professionnel — on doit pouvoir retracer qui a dit quoi et quand

### F. Corrigé — Module 6 (Banque de questions)
1. **B** — Tester et valider la résolution avant de fermer le ticket
2. **B** — Parce que la résolution sans preuve n'est pas traçable et risque de se reproduire
3. **B** — Un rapport horodaté avec les étapes et le résultat
4. **B** — Il y a une résolution documentée (pas seulement un essai) et une validation (le ticket est Fermé, pas juste Résolu)
5. **A** — Symptôme observé → test effectué → cause identifiée → correction appliquée → résultat validé
6. **B** — Une réouverture implique que la correction n'a pas tenue — il faut chercher la cause profonde
7. **A** — La majorité des incidents ne sont pas des urgences : les classer (P1 critique, P2 urgent, P3 normal, P4 basse) permet de prioriser
8. **B** — L'observation précède le diagnostic et l'action : on corrige en aveugle si on n'observe pas
9. **A** — Un diagnostic sans tests est une supposition, pas une résolution
10. **B** — Un ticket ne doit pas rester ouvert indéfiniment : clôturer après résolution ou escalader
11. **A** — Documenter les actions et résultats crée un historique utile pour les incidents futurs
12. **B** — Si un collègue a le même problème, la résolution documentée permet un dépannage plus rapide
13. **A** — Accuser réception → qualifier → traiter → résoudre → clore. Sauter une étape cause de la confusion et des retours
14. **B** — L'impact métier justifie la priorité : un serveur ERP en panne = P1, une imprimante en panne isolée = P3/P4
15. **B** — Traiter un incident sans le documenter = recommencer à zéro la prochaine fois que le même incident se produit

### G. Corrigé — Module 7 (Suivi P1)
1. **B** — Rappel actif (relancer régulièrement) plutôt que révision passive
2. **B** — Un poste de travail à jour est un prérequis professionnel que tout recruteur attend
3. **A** — La combinaison des compétences techniques + preuves + résultats est ce qui distingue un profil crédible
4. Un poste cible est identifié → on extrait les compétences demandées dans l'offre → on cartographie ses preuves (même partielles) → on comble les écarts les plus critiques en priorité
5. **B** — Parce que les formulations vagues ("bon en informatique") ne sont ni testables ni vérifiables dans un entretien
6. **B** — Prouver que tu as fait x avec outil → résultat mesurable → contexte d'usage
7. **B** — Prouver la maîtrise, pas la connaissance théorique
8. **B** — C'est l'action quotidienne la plus concrète qui transforme un portfolio de compétences en un portfolio de preuves
9. **A** — Cibler les offres réelles et extraire les compétences demandées, plutôt que de se former dans le vide
10. **B** — "Compétences : administration Windows (7 ans d'expérience, 15 serveurs gérés)" — précis, vérifiable, orienté résultat. "Compétences : bon en Windows" — vague, non testable, non crédible
11. **B** — Le pitch doit être concret, basé sur des preuves et orienté vers le résultat métier
12. **B** — Le mini-site web statique est le premier livrable concret du programme, il montre une compétence démontrable
13. **B** — P1 doit démarrer dès le début (J1) pour être utile tout au long du programme
14. **B** — "J'ai documenté l'utilisation de Teams pour la coordination d'équipe en créant un canal structuré avec 5 messages de décision historisés" — c'est une preuve de communication technique
15. **A** — Le suivi P1 quotidien crée un avantage cumulatif : chaque jour, le dossier de candidature s'améliore


## Cahier des charges — Projet de fin de Tome P0 (référence J1-J3)

### Livrables obligatoires
1. **Mini-site web statique fonctionnel**
   - 3 pages minimum : accueil, services/compétences, contact.
   - HTML sémantique, CSS responsive, JS pour interactions simples.
   - Version publiée localement et testée navigateur.

2. **Dossier bureautique complet**
   - Rapport Word (2 à 4 pages) : contexte, démarche, résultats.
   - Fichier Excel : tableau + formules + TCD + synthèse.
   - Présentation PowerPoint (5 à 8 slides) : pitch du projet.
   - Exports PDF des livrables de diffusion.

### Critères d'acceptation
- Le site fonctionne sans erreur visible sur navigation de base.
- Le fichier Excel contient au moins 3 formules pertinentes et 1 TCD exploitable.
- Le rapport et la présentation sont lisibles, structurés, orientés professionnel.
- L'apprenant peut expliquer oralement ses choix en 5 minutes.

### Grille de validation rapide (sur 20)
- Fonctionnalité technique : 8
- Qualité documentaire : 5
- Clarté de présentation : 4
- Cohérence avec poste cible : 3

### Preuves à archiver dans le portfolio
- Captures d'écran + fichiers sources + exports PDF.
- Note de synthèse : difficultés rencontrées et comment elles ont été résolues.

