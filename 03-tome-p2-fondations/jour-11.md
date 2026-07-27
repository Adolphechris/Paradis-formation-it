# TOME P2 — Jour 11 (14h)

## Découpage horaire opérationnel J11
- Projet de synthèse P2 (Bash + Python + SQL) — **8h**
- Révision technique ciblée P2 (J4 à J10) — **2h**
- Soutenance technique simulée — **1h**
- Banque cumulative P2 — **2h30**
- Suivi P1 (recherche d'emploi, CV, veille) — **30 min**

---

## 1) Projet de synthèse P2 — Bash + Python + SQL (8h)

### Objectifs d'apprentissage
- Intégrer Bash, Python et SQL dans une chaîne de traitement unique.
- Produire un livrable technique démontrable et reproductible.
- Gérer erreurs, logs et validations de sortie.
- Expliquer les choix techniques et leur impact métier.

### Contenu pédagogique
Projet J11: **Pipeline de supervision opérationnelle**.

Fonctionnement cible:
1. Bash lance extraction SQL quotidienne.
2. Export SQL brut (CSV) contrôlé.
3. Python nettoie et produit un rapport synthèse.
4. Sortie finale: rapport + indicateurs + journal d'exécution.

Minimum attendu:
- 1 script Bash d'orchestration.
- 1 script Python de traitement.
- 5+ requêtes SQL utiles.
- logs horodatés.
- contrôle d'erreurs explicite.

### Exercices pratiques (avec corrigés)
1. **Exercice 1 (simple)**  
   Construire l'ossature du projet (`scripts/`, `sql/`, `data/`, `reports/`, `logs/`).
   - **Corrigé détaillé** :
     - Arborescence claire.
     - Fichiers nommés de façon explicite.
     - Exécution d'un script test sans erreur.

2. **Exercice 2 (intermédiaire)**  
   Exécuter requêtes SQL via Bash et exporter en CSV daté.
   - **Corrigé détaillé** :
     - Nom de fichier avec timestamp.
     - Vérification existence + non-vide.
     - Log de statut succès/échec.

3. **Exercice 3 (avancé)**  
   Traiter CSV via Python et générer rapport final (top anomalies + KPI simples).
   - **Corrigé détaillé** :
     - Lecture robuste des données.
     - Contrôles d'intégrité basiques.
     - Rapport lisible orienté décision.

### Nouvelles abréviations rencontrées
- RCA | Root Cause Analysis | Analyse de cause racine d'un incident/problème | Interagit avec diagnostic, amélioration continue, support
- SOP | Standard Operating Procedure | Procédure opérationnelle standard réutilisable | Interagit avec runbooks, qualité de service, transmission d'équipe

### Banque de questions du module (15)
1. QCM : Objectif principal du projet J11 ?  
   A. Théorie B. Intégration opérationnelle C. Design
2. QCM : Bash joue surtout le rôle de...  
   A. SGBD B. Orchestrateur C. Frontend
3. QCM : SQL sert surtout à...  
   A. Extraire/agréger données B. Compiler Python C. Superviser OS
4. Ouverte : Pourquoi séparer extraction SQL et traitement Python ?
5. Ouverte : Que doit contenir un log d'exécution fiable ?
6. Mise en situation : CSV généré vide, que vérifies-tu d'abord ?
7. QCM : Un pipeline robuste doit...  
   A. Ignorer erreurs B. Contrôler les étapes C. Être manuel
8. Ouverte : Pourquoi dater les exports ?
9. Mise en situation : Le rapport contredit le SQL brut, diagnostic ?
10. QCM : RCA signifie...  
    A. Root Cause Analysis B. Report Control Access C. Remote Cloud Admin
11. Ouverte : À quoi sert une SOP dans ce projet ?
12. Mise en situation : Tu dois passer le projet à un autre technicien demain.
13. QCM : Validation minimale d'un export =  
    A. Fichier existe B. Existe + non vide + format cohérent C. Nom correct
14. Ouverte : Comment démontrer la valeur métier du pipeline ?
15. QCM : Résultat attendu module 1 =  
    A. Prototype flou B. Pipeline démontrable C. Slides seules

---

## 2) Révision technique ciblée P2 (2h)

### Objectifs d'apprentissage
- Consolider les points faibles J4→J10.
- Standardiser les méthodes de résolution (logique, SQL, réseau, Bash).
- Préparer une exécution fiable sans assistance.

### Contenu pédagogique
Révision par blocs:
1. Logique/Python (structures + complexité).
2. SQL (base + avancé + transactions).
3. Réseau (méthode de diagnostic).
4. Bash (scripts + automatisation).

Règle:
- 70% du temps sur points faibles.
- 30% sur maintien des acquis forts.

### Exercices pratiques (avec corrigés)
1. **Exercice 1 (simple)**  
   Faire une matrice "faible / moyen / fort" sur 10 compétences P2.
   - **Corrigé détaillé** :
     - Auto-positionnement honnête.
     - Priorités claires.
     - 3 actions immédiates associées.

2. **Exercice 2 (intermédiaire)**  
   Refaire 3 mini-exercices ciblant les 2 plus grosses faiblesses.
   - **Corrigé détaillé** :
     - Exécution chronométrée.
     - Correction argumentée.
     - Re-test rapide pour valider progression.

3. **Exercice 3 (avancé)**  
   Produire une fiche "méthodes réflexes" (diagnostic réseau, check SQL, check Bash).
   - **Corrigé détaillé** :
     - Liste courte actionnable.
     - Ordre d'exécution clair.
     - Réutilisable en test/entretien.

### Nouvelles abréviations rencontrées
- Aucune nouvelle abréviation technique.

### Banque de questions du module (15)
1. QCM : Révision efficace =  
   A. Refaire tout pareil B. Cibler faiblesses d'abord C. Ignorer scores
2. QCM : 70/30 signifie...  
   A. 70% points forts B. 70% points faibles C. 70% repos
3. Ouverte : Pourquoi refaire les exercices ratés ?
4. Mise en situation : Tu as progressé en SQL mais chuté en Bash.
5. QCM : Une fiche réflexe doit être...  
   A. Longue B. Actionnable C. Théorique
6. Ouverte : Quel indicateur montre une vraie progression ?
7. QCM : Auto-audit utile =  
   A. flou B. honnête et mesurable C. optimiste sans preuve
8. Mise en situation : Tu n'as que 45 min de révision.
9. Ouverte : Différence réviser vs consolider.
10. QCM : Priorité avant soutenance =  
    A. Décoration B. Clarté de raisonnement C. Multiplication outils
11. Ouverte : Exemple d'action corrective rapide en Python.
12. Mise en situation : Erreur répétée sur `JOIN`, quelle routine ?
13. QCM : But module 2 =  
    A. Maintenir confusion B. Stabiliser compétences C. Retarder J11
14. Ouverte : Pourquoi une méthode écrite aide sous stress ?
15. QCM : Résultat attendu =  
    A. Confiance justifiée B. Impression vague C. Saturation

---

## 3) Soutenance technique simulée (1h)

### Objectifs d'apprentissage
- Présenter clairement un livrable technique en temps limité.
- Répondre à des questions de recruteur avec structure.
- Défendre ses choix sans jargon inutile.

### Contenu pédagogique
Format soutenance:
1. 5 min contexte/problème.
2. 10 min démonstration.
3. 10 min questions-réponses.
4. 5 min feedback/ajustement.

Structure de réponse recommandée:
- Besoin → choix technique → preuve → impact.

### Exercices pratiques (avec corrigés)
1. **Exercice 1 (simple)**  
   Préparer pitch 90 secondes du projet J11.
   - **Corrigé détaillé** :
     - Message clair.
     - Pas de digression.
     - Exemple concret inclus.

2. **Exercice 2 (intermédiaire)**  
   Répondre à 5 questions "pourquoi ce choix ?".
   - **Corrigé détaillé** :
     - Réponses structurées.
     - Justifications par preuve.
     - Limites reconnues proprement.

3. **Exercice 3 (avancé)**  
   Simuler objection: "Votre solution est-elle vraiment fiable ?"
   - **Corrigé détaillé** :
     - Citer logs, contrôles, tests limites.
     - Expliquer gestion d'échec.
     - Proposer amélioration future réaliste.

### Nouvelles abréviations rencontrées
- Aucune nouvelle abréviation technique.

### Banque de questions du module (15)
1. QCM : Bonne structure de réponse =  
   A. Outil→outil B. Besoin→choix→preuve→impact C. Résultat seul
2. QCM : En soutenance, il faut surtout...  
   A. Impressionner jargon B. Être clair et prouvé C. Parler vite
3. Ouverte : Pourquoi admettre les limites de ta solution ?
4. Mise en situation : Le recruteur coupe et demande "résumez en 20 secondes".
5. QCM : Une preuve technique solide =  
   A. Opinion B. Log/test/résultat C. Promesse
6. Ouverte : Comment répondre sans se disperser ?
7. QCM : Si tu ne sais pas répondre...  
   A. Inventer B. Dire ce que tu sais + plan de vérification C. Changer sujet
8. Mise en situation : Question agressive sur performance.
9. Ouverte : Pourquoi le contexte métier est important en entretien ?
10. QCM : Pitch de qualité =  
    A. Long B. Synthétique et précis C. Hors sujet
11. Ouverte : Comment montrer progression entre J4 et J11 ?
12. Mise en situation : On te demande un exemple d'échec corrigé.
13. QCM : But module 3 =  
    A. Théâtraliser B. Défendre une solution crédible C. Éviter questions
14. Ouverte : Quelle phrase d'ouverture pro utiliser ?
15. QCM : Résultat attendu =  
    A. Stress non géré B. Expression technique structurée C. Silence

---

## 4) Banque cumulative P2 (2h30)

### Objectifs d'apprentissage
- Évaluer globalement les acquis J4 à J11.
- Identifier les zones à renforcer avant P3.
- Produire une base de questions exploitable pour P5.

### Contenu pédagogique
Répartition conseillée des questions:
- Python/logique: 30%
- SQL: 30%
- Réseau: 20%
- Bash/automatisation: 20%

### Exercices pratiques (avec corrigés)
1. **Exercice 1 (simple)**  
   Construire une banque cumulative de 40 questions équilibrées.
   - **Corrigé détaillé** :
     - Répartition respectée.
     - Niveaux variés.
     - Questions alignées au poste cible.

2. **Exercice 2 (intermédiaire)**  
   Corriger une session test complète et classer les erreurs.
   - **Corrigé détaillé** :
     - Typologie d'erreurs.
     - Priorisation des remédiations.
     - Mesure de progression.

3. **Exercice 3 (avancé)**  
   Générer plan de remédiation pré-P3 en 5 actions.
   - **Corrigé détaillé** :
     - Actions mesurables.
     - Délais réalistes.
     - Critères de réussite définis.

### Nouvelles abréviations rencontrées
- Aucune nouvelle abréviation technique.

### Banque de questions du module (15)
1. QCM : Banque cumulative sert à...  
   A. Noter seulement B. Piloter progression C. Remplacer projet
2. QCM : Répartition équilibrée évite...  
   A. Biais de préparation B. Apprentissage C. Révision
3. Ouverte : Pourquoi mixer QCM, ouvertes et cas pratiques ?
4. Mise en situation : Très bon SQL, faible réseau.
5. QCM : Une erreur récurrente doit...  
   A. être ignorée B. devenir priorité C. être reportée
6. Ouverte : Exemple d'indicateur global P2 pertinent.
7. QCM : Plan remédiation efficace =  
   A. vague B. mesurable C. théorique
8. Mise en situation : Tu as peu de temps avant P3.
9. Ouverte : Pourquoi documenter les progrès chiffrés ?
10. QCM : Une question "poste visé" doit...  
    A. rester abstraite B. simuler réalité métier C. être hors contexte
11. Ouverte : Comment construire une progression durable ?
12. Mise en situation : Tu doutes de tes résultats.
13. QCM : But module 4 =  
    A. créer fatigue B. préparer efficacement la suite C. figer apprentissage
14. Ouverte : Pourquoi conserver les corrigés détaillés ?
15. QCM : Résultat attendu =  
    A. Vision claire des acquis B. Incertitude C. Mémorisation seule

---

## 5) Suivi P1 (30 min)

### Objectifs d'apprentissage
- Transformer P2 complet en argumentaire d'employabilité.
- Mettre à jour CV/portfolio avec preuves transversales.
- Préparer la transition vers P3 selon poste cible.

### Contenu pédagogique
Routine:
1. Ajouter projet J11 au portfolio.
2. Mettre à jour 2 lignes CV (automatisation + SQL/réseau).
3. Cibler 3 offres et ajuster plan P3.

### Exercices pratiques (avec corrigés)
1. **Exercice 1 (simple)**  
   Rédiger une ligne CV sur pipeline Bash+Python+SQL.
   - **Corrigé détaillé** :
     - Action + stack + résultat.
     - Formulation courte et crédible.

2. **Exercice 2 (intermédiaire)**  
   Préparer un pitch 60 secondes "ce que P2 m'a rendu capable de faire".
   - **Corrigé détaillé** :
     - Avant/après.
     - Exemples réels.
     - Posture professionnelle.

3. **Exercice 3 (avancé)**  
   Définir plan d'entrée P3 en 3 priorités mesurables.
   - **Corrigé détaillé** :
     - Priorité technique n°1.
     - Priorité preuves portfolio.
     - Priorité communication entretien.

### Nouvelles abréviations rencontrées
- Aucune nouvelle abréviation technique.

### Banque de questions du module (15)
1. QCM : But P1 fin P2 ?  
   A. Reporter B. Convertir acquis en preuves C. Ignorer marché
2. Ouverte : Pourquoi une preuve transversale est forte ?
3. QCM : Une ligne CV efficace contient...  
   A. adjectifs B. action + résultat C. emojis
4. Mise en situation : Tu as le code, pas l'explication métier.
5. Ouverte : Comment relier P2 à postes support/admin/data junior ?
6. QCM : Pitch efficace suit...  
   A. outils listés B. problème→solution→impact C. histoire personnelle
7. Ouverte : Quelle preuve publier immédiatement ?
8. QCM : Plan P3 doit être...  
   A. mesurable B. flou C. improvisé
9. Mise en situation : Offre demande Linux avancé, que fais-tu ce soir ?
10. Ouverte : Micro-indicateur de progression crédible.
11. QCM : Portfolio robuste =  
    A. captures seules B. code + tests + contexte + impact C. titres
12. Ouverte : Pourquoi adapter son langage au recruteur ?
13. Mise en situation : Stress entretien, routine courte ?
14. QCM : Résultat P1 réussi =  
    A. CV inchangé B. CV/portfolio à jour C. aucune action
15. Ouverte : Action exacte avant démarrage P3.

---

## Validation qualité J11 (anti-superficiel)

### Livrables obligatoires fin de J11
1. Pipeline fonctionnel Bash + SQL + Python exécutable de bout en bout.  
2. Export CSV validé + rapport final généré automatiquement.  
3. Journal d'exécution complet (succès/échecs + horodatage).  
4. SOP courte (procédure de relance/maintenance du pipeline).  
5. Simulation de soutenance documentée (questions/réponses/axes d'amélioration).  
6. Mise à jour CV/portfolio avec preuve concrète P2.

### Grille d'évaluation rapide (100 points)
- Intégration technique (Bash/Python/SQL): **30 pts**
- Fiabilité opérationnelle (erreurs, logs, reprise): **20 pts**
- Qualité analytique (requêtes, traitement, rapport): **20 pts**
- Qualité de communication technique (écrit/oral): **15 pts**
- Employabilité (preuves CV/portfolio): **15 pts**

### Seuil attendu
- **>= 80/100** : P2 validé, prêt pour P3.  
- **65-79/100** : P2 validé sous renforcement ciblé immédiat.  
- **< 65/100** : consolidation P2 indispensable avant P3.

---

## Corrigés guidés — mode tuteur (réponses attendues)

### A. Corrigé — Module 1 (Projet synthèse)
1. **B**  
2. **B**  
3. **A**  
4. Pour séparer responsabilités et faciliter maintenance/test.  
5. Date, étape, statut, erreur éventuelle, durée.  
6. Requête SQL, droits d'accès, chemin de sortie, séparateur.  
7. **B**  
8. Traçabilité, versionnement des sorties, audit.  
9. Comparer source SQL, transformation Python, règles de nettoyage.  
10. **A**  
11. Standardiser exécution/maintenance sans dépendre d'une personne.  
12. Fournir SOP + arborescence + commandes + exemple de sortie.  
13. **B**  
14. Montrer gain concret (temps, fiabilité, visibilité incidents).  
15. **B**

### B. Corrigé — Module 2 (Révision ciblée)
1. **B**  
2. **B**  
3. Car la répétition ciblée corrige réellement les lacunes.  
4. Replanifier avec créneau Bash prioritaire + maintien SQL court.  
5. **B**  
6. Taux de réussite chronométré + baisse des erreurs récurrentes.  
7. **B**  
8. Prioriser 2 faiblesses majeures avec exercices courts mesurables.  
9. Réviser = revoir; consolider = prouver stabilité en exécution réelle.  
10. **B**  
11. Refaire une fonction avec cas limites + validation types.  
12. Refaire 3 patterns JOIN + contrôle résultat manuel.  
13. **B**  
14. Elle réduit la charge cognitive sous pression.  
15. **A**

### C. Corrigé — Module 3 (Soutenance)
1. **B**  
2. **B**  
3. Pour montrer lucidité et posture professionnelle crédible.  
4. Donner version ultra-courte: besoin, solution, impact en 1 phrase chacun.  
5. **B**  
6. Utiliser un plan fixe en 3-4 points.  
7. **B**  
8. Répondre avec mesure simple + piste d'amélioration réaliste.  
9. Il permet de comprendre la valeur du livrable.  
10. **B**  
11. Comparer compétences initiales vs livrables finaux vérifiables.  
12. Décrire bug, cause racine, correction, prévention.  
13. **B**  
14. "J'ai automatisé un flux de données pour fiabiliser le suivi opérationnel."  
15. **B**

### D. Corrigé — Module 4 (Banque cumulative)
1. **B**  
2. **A**  
3. Car les formats d'évaluation et de poste sont variés.  
4. Priorité remédiation réseau avec labs ciblés courts et mesurés.  
5. **B**  
6. Exemple: score global + temps moyen + taux d'erreurs critiques.  
7. **B**  
8. Prioriser les thèmes à impact immédiat sur poste visé.  
9. Pour objectiver l'évolution et ajuster la stratégie.  
10. **B**  
11. Alternance pratique, feedback, et itérations courtes.  
12. Revenir aux preuves concrètes: scripts, requêtes, diagnostics.  
13. **B**  
14. Ils accélèrent la remédiation et servent de base P5.  
15. **A**

### E. Corrigé — Module 5 (Suivi P1)
1. **B**  
2. Parce qu'elle prouve polyvalence opérationnelle sur plusieurs couches.  
3. **B**  
4. Ajouter "impact": ce que la solution a amélioré concrètement.  
5. Support (diag/automatisation), admin (scripts), data (SQL/reporting).  
6. **B**  
7. Pipeline J11 + log + rapport + 3 lignes d'interprétation métier.  
8. **A**  
9. Préparer socle Linux/services et revoir points réseau faibles.  
10. Ex: "pipeline relancé en <5 min avec SOP, 3 exécutions OK".  
11. **B**  
12. Pour être compris et pertinent selon le poste ciblé.  
13. Respiration, plan de réponse, exemple réel court.  
14. **B**  
15. Publier preuve P2 finale et fixer objectif P3-J12 n°1.
