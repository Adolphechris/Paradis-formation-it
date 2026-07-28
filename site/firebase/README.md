# Firestore init (PARADIS)

But : Fournir les fichiers d'initialisation et instructions pour configurer Cloud Firestore (Firebase) en free tier pour la collaboration avec Antigravity.

Important : Ces fichiers sont fournis comme modèle. L'initialisation et le déploiement nécessitent le CLI `firebase-tools` et un compte Google avec projet Firebase.

Étapes rapides :
1. Installer Firebase CLI :
   npm install -g firebase-tools
2. Se connecter :
   firebase login
3. Créer un projet Firebase (ou utiliser un projet existant) :
   firebase projects:create paradis-paradis-it --display-name "PARADIS-DEV"
   (ou récupérer l'ID d'un projet existant)
4. Initialiser Firestore dans le dossier :
   cd site
   firebase init firestore
   # quand demandé, fournir le path to rules : site/firebase/firestore.rules
5. Déployer les règles :
   firebase deploy --only firestore:rules

Sécurité recommandée (en local) :
- Définir des règles strictes pour limiter l'accès aux documents utilisateur :
  request.auth != null && request.auth.uid == resource.data.ownerUid

Note sur coût : le free tier (Spark) suffit pour le développement initial et un petit nombre d'utilisateurs. Surveiller la facturation si l'usage augmente.

Fichiers inclus :
- firestore.rules : règles de sécurité d'exemple
- firestore.indexes.json : indexes recommandés
- env.example : variables d'environnement pour la configuration client
- scripts/setup_firestore.sh : script d'aide pour créer projet et rules (à exécuter localement)

