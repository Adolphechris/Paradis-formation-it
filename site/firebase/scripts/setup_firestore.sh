#!/bin/bash
# Helper script to bootstrap a Firebase project for PARADIS (local usage)
# Requires: firebase-tools CLI installed and user authenticated

set -e
PROJECT_ID="paradis-paradis-it"

if [ -z "$(command -v firebase)" ]; then
  echo "firebase CLI not found. Install with: npm install -g firebase-tools"
  exit 1
fi

echo "Creating or selecting Firebase project $PROJECT_ID"
# firebase projects:create $PROJECT_ID --display-name "PARADIS-DEV" || true

echo "Initializing firestore in current folder (interactive)"
firebase init firestore --project $PROJECT_ID

echo "Deploying rules"
firebase deploy --only firestore:rules --project $PROJECT_ID

echo "Done. Update site/env.example with your Firebase config and restart the frontend."
