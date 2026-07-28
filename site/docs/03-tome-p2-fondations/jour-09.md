# TOME P2 — Jour 09 (14h)

## Découpage horaire opérationnel J9
- Fondamentaux réseau TCP/IP — **6h**
- Diagnostic pratique réseau — **3h**
- Labs progressifs de dépannage — **3h**
- Banque de questions — **1h30**
- Suivi P1 (recherche d'emploi, CV, veille) — **30 min**

---

## 1) Fondamentaux réseau TCP/IP (6h)

### Objectifs d'apprentissage
- Expliquer simplement comment deux machines communiquent sur un réseau.
- Lire une configuration IP (adresse, masque, passerelle, DNS).
- Différencier réseau local, internet et rôle du routage.
- Identifier les causes probables d'une panne de connectivité.

### Contenu pédagogique
Le réseau est une chaîne logique: **machine → réseau local → routeur → internet → service distant**.

1. **Adresse IP et masque**
   - IP identifie l'hôte.
   - Masque détermine la partie réseau/hôte.
   - Une IP sans masque ne suffit pas pour raisonner correctement.

2. **Passerelle et DNS**
   - Passerelle: sortie vers les réseaux externes.
   - DNS: traduction nom de domaine ↔ IP.
   - Sans DNS, ping IP peut marcher mais navigation par nom échoue.

3. **DHCP vs statique**
   - DHCP: automatique.
   - Statique: manuel (utile serveurs/cas précis).
   - APIPA (169.254.x.x) signale souvent absence de DHCP.

4. **TCP vs UDP (vue opérationnelle)**
   - TCP: fiable, orienté connexion (web, mail, etc.).
   - UDP: plus léger, sans garantie stricte (DNS, streaming, VoIP selon cas).

5. **Sous-réseaux CIDR**
   - Notation `/24`, `/16`, etc.
   - Aide à comprendre portée d'un réseau et possibilités d'adressage.

### Exercices pratiques (avec corrigés)
1. **Exercice 1 (simple)**  
   Lire une config type: `IP 192.168.1.25 /24, GW 192.168.1.1, DNS 8.8.8.8`.
   - **Corrigé détaillé** :
     - Hôte dans réseau `192.168.1.0/24`.
     - Passerelle correcte car même sous-réseau.
     - DNS public opérationnel pour résolution.

2. **Exercice 2 (intermédiaire)**  
   Déterminer si deux machines peuvent communiquer directement:
   - A: `10.0.1.10/24`
   - B: `10.0.2.20/24`
   - **Corrigé détaillé** :
     - Réseaux différents (`10.0.1.0/24` vs `10.0.2.0/24`).
     - Communication directe non, routeur requis.
     - Vérifier présence passerelle sur les deux.

3. **Exercice 3 (avancé)**  
   Diagnostiquer: IP OK, ping passerelle OK, ping nom de domaine KO.
   - **Corrigé détaillé** :
     - Suspect principal: DNS.
     - Tester ping IP externe (ex: `8.8.8.8`) puis test nom.
     - Corriger DNS configuré puis re-tester.

### Nouvelles abréviations rencontrées
- CIDR | Classless Inter-Domain Routing | Notation de sous-réseaux IP (`/24`, `/16`) | Interagit avec IP, masque, routage
- UDP | User Datagram Protocol | Protocole léger sans connexion | Interagit avec DNS, streaming, temps réel

### Banque de questions du module (15)
1. QCM : Le DNS sert à...  
   A. Chiffrer B. Résoudre les noms C. Router
2. QCM : Une IP en `169.254.x.x` indique souvent...  
   A. DHCP indisponible B. DNS parfait C. VPN actif
3. QCM : `10.0.1.10/24` et `10.0.2.20/24` sont...  
   A. Même réseau B. Réseaux différents C. Incomparables
4. Ouverte : Différence passerelle vs DNS.
5. Ouverte : Pourquoi le masque est indispensable ?
6. Mise en situation : Tu ping une IP mais pas un nom de domaine.
7. QCM : CIDR `/24` signifie...  
   A. 24 hôtes max B. 24 bits réseau C. 24 routeurs
8. Ouverte : TCP vs UDP en une phrase.
9. Mise en situation : Quand préférer une IP statique ?
10. QCM : APIPA est...  
    A. Auto-attribution IP B. Antivirus C. Base SQL
11. Ouverte : Pourquoi tester passerelle avant internet ?
12. Mise en situation : Le user dit "internet lent", 1er réflexe réseau ?
13. QCM : Sans passerelle correcte, on perd surtout...  
    A. Accès local B. Accès externe C. Accès disque
14. Ouverte : Donne une mini-checklist réseau initiale.
15. QCM : Objectif du bloc ?  
    A. Mémoriser commandes B. Comprendre la chaîne réseau C. Installer Python

---

## 2) Diagnostic pratique réseau (3h)

### Objectifs d'apprentissage
- Exécuter un diagnostic structuré et reproductible.
- Utiliser `ipconfig`/`ifconfig`/`ip`, `ping`, `traceroute`, `nslookup`.
- Isoler rapidement si le problème est local, LAN, DNS ou distant.

### Contenu pédagogique
La méthode vaut plus que la commande isolée.

1. **Étapes standard**
   1) Vérifier IP locale.
   2) Tester boucle locale (`127.0.0.1`).
   3) Tester passerelle.
   4) Tester IP externe.
   5) Tester nom de domaine.

2. **Commandes clés**
   - `ping`: connectivité + latence de base.
   - `traceroute`/`tracert`: chemin réseau.
   - `nslookup`: résolution DNS.
   - `ip a` / `ipconfig /all`: état interfaces.

3. **Lecture des symptômes**
   - Ping local KO: pile réseau locale en défaut.
   - Ping GW KO: problème LAN/interface/câblage/Wi-Fi.
   - Ping IP externe OK mais nom KO: DNS.
   - Tracé bloqué tard: probable problème distant/opérateur.

### Exercices pratiques (avec corrigés)
1. **Exercice 1 (simple)**  
   Faire un diagnostic complet d'un poste sans internet.
   - **Corrigé détaillé** :
     - Exécuter séquence 5 étapes.
     - Noter premier point d'échec.
     - Proposer hypothèse principale.

2. **Exercice 2 (intermédiaire)**  
   Cas: ping passerelle OK, ping 8.8.8.8 OK, ping google.com KO.
   - **Corrigé détaillé** :
     - Confirmer panne DNS.
     - `nslookup google.com`.
     - Changer DNS (ex: 1.1.1.1/8.8.8.8) et revalider.

3. **Exercice 3 (avancé)**  
   Analyser un traceroute avec saut bloqué au 5e routeur.
   - **Corrigé détaillé** :
     - Identifier portion locale vs distante.
     - Conclure probable incident amont.
     - Préparer message technique pour escalade.

### Nouvelles abréviations rencontrées
- ICMP | Internet Control Message Protocol | Protocole utilisé notamment par `ping` | Interagit avec diagnostic, routage, supervision réseau
- RTT | Round Trip Time | Temps aller-retour d'un paquet | Interagit avec latence, qualité de connexion, performance perçue

### Banque de questions du module (15)
1. QCM : `ping` utilise principalement...  
   A. FTP B. ICMP C. SMTP
2. QCM : Si ping IP externe OK mais nom KO, suspect principal...  
   A. DNS B. CPU C. RAM
3. QCM : `traceroute` sert à...  
   A. Voir le chemin réseau B. Chiffrer trafic C. Créer VLAN
4. Ouverte : Pourquoi suivre un ordre de diagnostic fixe ?
5. Ouverte : Différence `ping` vs `nslookup`.
6. Mise en situation : Ton premier test réseau local échoue.
7. QCM : RTT mesure...  
   A. Débit disque B. Latence aller-retour C. Taille paquet
8. Ouverte : Que documenter avant d'escalader un incident ?
9. Mise en situation : Le traceroute échoue hors réseau local.
10. QCM : `127.0.0.1` teste...  
    A. DNS B. Pile locale C. Routeur
11. Ouverte : Pourquoi re-tester après correction ?
12. Mise en situation : Wi-Fi connecté mais pas d'accès internet.
13. QCM : Objectif d'un diagnostic pro =  
    A. Aller vite sans preuve B. Isoler précisément la cause C. Redémarrer au hasard
14. Ouverte : Quel message envoyer à un niveau 2 après diagnostic ?
15. QCM : Bloc 2 vise surtout...  
    A. Théorie abstraite B. Méthode opérationnelle C. Design UI

---

## 3) Labs progressifs de dépannage (3h)

### Objectifs d'apprentissage
- Appliquer la méthode réseau sur des pannes simulées.
- Produire un compte rendu de dépannage clair.
- Prioriser les hypothèses sans dispersion.

### Contenu pédagogique
Chaque lab suit: contexte → tests → résultat → décision.

### Exercices pratiques (avec corrigés)
1. **Exercice 1 (simple)**  
   Panne simulée DHCP indisponible.
   - **Corrigé détaillé** :
     - Observer IP APIPA.
     - Renouveler bail (`release/renew` ou équivalent).
     - Vérifier retour IP valide.

2. **Exercice 2 (intermédiaire)**  
   Panne simulée DNS mal configuré.
   - **Corrigé détaillé** :
     - Ping IP externe OK, nom KO.
     - Corriger DNS.
     - Vérifier navigation/résolution rétablies.

3. **Exercice 3 (avancé)**  
   Panne intermittente avec latence élevée.
   - **Corrigé détaillé** :
     - Mesurer RTT sur plusieurs essais.
     - Comparer heures/périodes.
     - Conclure congestion probable et documenter preuves.

### Nouvelles abréviations rencontrées
- Aucune nouvelle abréviation technique.

### Banque de questions du module (15)
1. QCM : APIPA pointe souvent vers...  
   A. DHCP absent B. DNS absent C. Disque plein
2. QCM : Diagnostic intermittent exige...  
   A. 1 seul test B. mesures répétées C. aucune trace
3. Ouverte : Pourquoi conserver les preuves de test ?
4. Mise en situation : Tu corriges DNS mais ne retestes pas. Risque ?
5. QCM : Compte rendu dépannage doit inclure...  
   A. Hypothèse seule B. Tests + résultats + action C. juste conclusion
6. Ouverte : Quel est l'intérêt d'horodater les mesures ?
7. QCM : Une escalade utile contient...  
   A. "ça marche pas" B. symptôme + tests + point d'échec C. rien
8. Mise en situation : DHCP revient après redémarrage, que vérifier encore ?
9. Ouverte : Différence panne stable vs intermittente.
10. QCM : Latence élevée concerne souvent...  
    A. RTT B. Taille écran C. clavier
11. Ouverte : Comment prioriser hypothèses réseau ?
12. Mise en situation : Tu as 10 min pour diagnostiquer, que fais-tu d'abord ?
13. QCM : But d'un lab progressif =  
    A. Décorer B. Entraîner décision technique C. éviter commandes
14. Ouverte : Comment rendre un rapport lisible pour non spécialiste ?
15. QCM : Résultat attendu bloc 3 =  
    A. Réflexes opérationnels B. Théorie seule C. Pause

---

## 4) Banque de questions (1h30)

### Objectifs d'apprentissage
- Mesurer la maîtrise réelle de J9.
- Préparer le passage à J10 (Bash + automatisation).
- Cibler les lacunes réseau critiques.

### Contenu pédagogique
Format:
1. 45 min test mixte.
2. 30 min correction argumentée.
3. 15 min plan de remédiation.

### Exercices pratiques (avec corrigés)
1. **Exercice 1 (simple)**  
   Créer une épreuve de 20 questions TCP/IP + diagnostic.
   - **Corrigé détaillé** :
     - Couverture équilibrée.
     - Difficulté progressive.
     - Correction immédiate.

2. **Exercice 2 (intermédiaire)**  
   Classer 10 erreurs de diagnostic (ordre, interprétation, validation, communication).
   - **Corrigé détaillé** :
     - Une cause dominante par erreur.
     - Une action corrective mesurable.
     - Plan exécutable sous 24h.

3. **Exercice 3 (avancé)**  
   Simuler oral: "Explique ton diagnostic réseau de bout en bout".
   - **Corrigé détaillé** :
     - Contexte incident.
     - Séquence de tests.
     - Cause probable + action + vérification.

### Nouvelles abréviations rencontrées
- Aucune nouvelle abréviation technique.

### Banque de questions du module (15)
1. QCM : But de la banque J9 ?  
   A. Notation brute B. Mesure + correction C. Remplacer labs
2. QCM : Une erreur d'ordre de tests provoque souvent...  
   A. Diagnostic flou B. Résolution plus fiable C. rien
3. Ouverte : Pourquoi corriger juste après test ?
4. Mise en situation : Bon score théorique, faible dépannage réel.
5. QCM : Une remédiation utile est...  
   A. vague B. mesurable C. reportée
6. Ouverte : Quel indicateur réseau suivre avant J10 ?
7. QCM : Communication technique pro doit être...  
   A. confuse B. factuelle C. dramatique
8. Mise en situation : Tu oublies de noter le point d'échec exact.
9. Ouverte : Différence savoir commande / savoir diagnostiquer.
10. QCM : Plan J10 doit cibler...  
    A. points bloquants B. sujets aléatoires C. ce qui est déjà acquis
11. Ouverte : Exemple d'action corrective réseau en 30 min.
12. Mise en situation : Tu dois expliquer APIPA au support niveau 1.
13. QCM : Preuve de progression crédible =  
    A. impression B. logs + compte rendu + réussite test C. promesse
14. Ouverte : Pourquoi standardiser le rapport d'incident ?
15. QCM : Résultat attendu ?  
    A. réflexe de diagnostic B. surcharge théorique C. aucune preuve

---

## 5) Suivi P1 (30 min)

### Objectifs d'apprentissage
- Transformer les acquis réseau en preuve employable.
- Renforcer CV/portfolio avec un cas de diagnostic documenté.
- Préparer argumentaire pour postes support/admin junior.

### Contenu pédagogique
Routine P1:
1. Ajouter un mini-cas incident réseau au portfolio.
2. Rédiger une ligne CV orientée impact.
3. Relever 3 attentes récurrentes d'offres support/admin junior.

### Exercices pratiques (avec corrigés)
1. **Exercice 1 (simple)**  
   Rédiger une ligne CV: diagnostic DNS/DHCP résolu.
   - **Corrigé détaillé** :
     - Action + outils + résultat.
     - Style concis et vérifiable.

2. **Exercice 2 (intermédiaire)**  
   Écrire pitch 60 secondes d'un incident réseau géré.
   - **Corrigé détaillé** :
     - Symptôme initial.
     - Méthode de test.
     - Correction et validation.

3. **Exercice 3 (avancé)**  
   Définir 3 priorités J10 mesurables (dont une liée au scripting).
   - **Corrigé détaillé** :
     - Lacune réseau à corriger.
     - Pont réseau→Bash à préparer.
     - Objectif communication technique.

### Nouvelles abréviations rencontrées
- Aucune nouvelle abréviation technique.

### Banque de questions du module (15)
1. QCM : But P1 après J9 ?  
   A. Reporter preuves B. Valoriser immédiatement C. Ignorer marché
2. Ouverte : Pourquoi un cas incident réel aide en recrutement ?
3. QCM : Une bonne ligne CV doit contenir...  
   A. Vague B. Action + preuve C. Emoji
4. Mise en situation : Tu résous techniquement mais expliques mal au recruteur.
5. Ouverte : Comment relier réseau à poste support junior ?
6. QCM : Pitch efficace suit...  
   A. Symptôme→tests→solution→validation B. histoire longue C. jargon pur
7. Ouverte : Quelle preuve publier ce soir ?
8. QCM : Priorités J10 doivent être...  
   A. Mesurables B. Floues C. Copiées
9. Mise en situation : Offre demande Bash + réseau, adaptation immédiate ?
10. Ouverte : Micro-indicateur de progression réseau.
11. QCM : Preuve solide =  
    A. titre seul B. diagnostic documenté + résultat C. capture isolée
12. Ouverte : Pourquoi adapter ton vocabulaire au public non expert ?
13. Mise en situation : Stress oral technique, routine courte ?
14. QCM : Résultat P1 réussi =  
    A. CV inchangé B. CV+portfolio mis à jour C. aucune action
15. Ouverte : Action exacte à lancer avant J10.

---

## Validation qualité J9 (anti-superficiel)

### Livrables obligatoires fin de J9
1. 3 diagnostics réseau complets documentés (DHCP, DNS, latence).  
2. 1 compte rendu standardisé par incident (symptôme, tests, cause, correction, validation).  
3. 1 mini-checklist de diagnostic réutilisable en entretien/test.  
4. 1 preuve portfolio (cas incident réel/simulé expliqué).  
5. 1 pitch oral 60 secondes sur une panne résolue.

### Grille d'évaluation rapide (100 points)
- Maîtrise des fondamentaux TCP/IP: **25 pts**
- Méthode de diagnostic (ordre + précision): **30 pts**
- Qualité des preuves (mesures, logs, validation): **20 pts**
- Résolution pratique des cas (DHCP/DNS/latence): **15 pts**
- Communication technique (rapport + oral): **10 pts**

### Seuil attendu
- **>= 78/100** : J9 validé, prêt pour J10.  
- **65-77/100** : validé sous remédiation ciblée.  
- **< 65/100** : consolidation réseau requise avant automatisation.

---

## Corrigés guidés — mode tuteur (réponses attendues)

### A. Corrigé — Module 1 (Fondamentaux TCP/IP)
1. **B**  
2. **A**  
3. **B**  
4. Passerelle = sortie réseau; DNS = traduction nom↔IP.  
5. Il délimite réseau/hôte et permet de savoir qui est local ou non.  
6. Problème DNS probable.  
7. **B**  
8. TCP fiable connecté, UDP léger non connecté.  
9. Serveur, imprimante réseau, ou poste nécessitant adresse fixe.  
10. **A**  
11. Pour isoler local vs externe rapidement.  
12. Vérifier d'abord latence/RTT locale et perte de paquets simple.  
13. **B**  
14. IP locale, loopback, passerelle, IP externe, nom de domaine.  
15. **B**

### B. Corrigé — Module 2 (Diagnostic pratique)
1. **B**  
2. **A**  
3. **A**  
4. Pour éviter les erreurs de conclusion et gagner du temps.  
5. `ping` teste connectivité; `nslookup` teste résolution DNS.  
6. Vérifier interface/pile locale avant toute hypothèse externe.  
7. **B**  
8. Heure, tests lancés, résultats, point d'échec, action effectuée.  
9. Probable incident amont/opérateur; escalade avec preuves.  
10. **B**  
11. Valider que la correction a réellement résolu le problème.  
12. Vérifier IP attribuée, passerelle, DNS, puis tests séquentiels.  
13. **B**  
14. Message factuel: contexte, tests, résultats, hypothèse, besoin d'action N2.  
15. **B**

### C. Corrigé — Module 3 (Labs dépannage)
1. **A**  
2. **B**  
3. Pour justifier la décision technique et éviter discussions floues.  
4. Tu risques de conclure à tort; il faut valider la résolution.  
5. **B**  
6. Pour corréler panne avec plage horaire/congestion.  
7. **B**  
8. Vérifier stabilité dans le temps (pas seulement retour ponctuel).  
9. Stable = reproductible constant; intermittente = fluctue dans le temps.  
10. **A**  
11. Commencer par causes les plus probables et vérifiables rapidement.  
12. Enchaîner checklist standard: local → GW → externe → DNS.  
13. **B**  
14. Format simple avec sections fixes et termes non ambigus.  
15. **A**

### D. Corrigé — Module 4 (Banque J9)
1. **B**  
2. **A**  
3. Pour ancrer l'apprentissage pendant que l'erreur est fraîche.  
4. Théorie correcte, transfert opérationnel encore insuffisant.  
5. **B**  
6. Taux de diagnostics réussis sans aide + qualité des comptes rendus.  
7. **B**  
8. Refaire diagnostic avec template imposé et point d'échec explicite.  
9. Commande = outil; diagnostic = raisonnement structuré avec preuve.  
10. **A**  
11. "2 incidents simulés documentés avec checklist et validation finale".  
12. Définition courte + symptôme + action immédiate recommandée.  
13. **B**  
14. Pour comparer incidents et accélérer support en équipe.  
15. **A**

### E. Corrigé — Module 5 (Suivi P1)
1. **B**  
2. Parce qu'il prouve un raisonnement concret sous contrainte réelle.  
3. **B**  
4. Priorité: entraîner explication claire orientée impact utilisateur.  
5. En montrant diagnostic, résolution et réduction d'indisponibilité.  
6. **A**  
7. Un cas DNS/DHCP avec étapes, résultat, et leçon tirée.  
8. **A**  
9. Ajouter mini-script Bash de tests réseau de base (ping/nslookup).  
10. Ex: "3 diagnostics complets réussis en <15 min chacun".  
11. **B**  
12. Pour être compris et jugé utile par le recruteur.  
13. Respiration 60s + plan en 4 étapes + exemple concret court.  
14. **B**  
15. Publier preuve J9 + préparer script réseau de démarrage J10.
