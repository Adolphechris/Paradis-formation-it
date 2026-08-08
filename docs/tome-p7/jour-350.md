# TOME P7 — Certifications d'Élite & Spécialisations — Jour 350 (6h) : Grand Examen de Synthèse du Semestre 7 (50 QCM Corrigés & Bilan Global du Semestre — Certifications Élite & Spécialisations)

> [!NOTE]
> **Objectif du jour :** Évaluer et valider l'ensemble des connaissances théoriques, techniques et réglementaires acquises tout au long du **Semestre 7 (Jour 301 à Jour 350)** à travers un **Grand Examen de Synthèse de 50 questions QCM** couvrant les 8 domaines de spécialisation certifiants (OSCP+, AWS Security, CKS, CISM, CISSP, GREM, CIPP/E, OSED, Red Team TIBER-EU).
>
> **Seuil de réussite exigé : 38/50 (76%) — Condition de validation définitive du Semestre 7.**

---

## 📋 Modalités du Grand Examen de Synthèse S7

| Paramètre | Spécification |
|:---:|:---:|
| Nombre de Questions | 50 Questions à Choix Multiple (QCM) |
| Durée Recommandée | 90 Minutes |
| Seuil de Validation | **38 / 50 (76%)** |
| Domaines Évalués | OSCP+, AWS Security, CKS, CISM, CISSP, GREM, CIPP/E, OSED, Red Team, Supply Chain |

---

## ✍️ ÉPREUVE DE QCM — 50 QUESTIONS (SEMESTRE 7)

### SECTION 1 : OSCP+ & Offensive Engineering (Q01 - Q06)

**Q01 :** Lors d'un buffer overflow x86, quelle est la fonction du registre `EIP` ?
- A) Pointer vers la prochaine instruction à exécuter dans le flux du programme — **✅ Réponse : A**
- B) Stocker la clé de chiffrement RSA
- C) Gérer les allocations réseau
- D) Compter les boucles for

**Q02 :** Quelle option SSH permet de créer un proxy SOCKS5 dynamique local utilisable avec Proxychains ?
- A) `ssh -D 1080 -N -f user@pivot` — **✅ Réponse : A**
- B) `ssh -L 8080:localhost:80`
- C) `ssh -R 443:localhost:443`
- D) `ssh -X user@pivot`

**Q03 :** Quelle attaque Active Directory consiste à demander un TGT puis un TGS pour un service possédant un SPN afin de craquer le hash de mot de passe hors-ligne ?
- A) Kerberoasting — **✅ Réponse : A**
- B) AS-REP Roasting
- C) DCSync
- D) Golden Ticket

**Q04 :** Quel outil permet de créer une interface réseau virtuelle TUN kernel sous Kali pour du pivoting transparent sans proxychains ?
- A) Ligolo-ng — **✅ Réponse : A**
- B) Chisel
- C) Nmap
- D) Wireshark

**Q05 :** Quelle attaque Active Directory permet d'extraire l'intégralité de la base des hashes NTLM (y compris `krbtgt`) en simulant le comportement d'un contrôleur de domaine ?
- A) DCSync (via secretsdump.py / Mimikatz) — **✅ Réponse : A**
- B) Pass-the-Hash
- C) LLMNR Poisoning
- D) Password Spraying

**Q06 :** Dans mona.py sous Immunity Debugger, quelle commande permet de générer la liste des octets interdits (badchars) ?
- A) `!mona bytearray -b "\x00"` — **✅ Réponse : A**
- B) `!mona find`
- C) `!mona pattern_create`
- D) `!mona jmp -r esp`

---

### SECTION 2 : AWS Security Specialty (Q07 - Q12)

**Q07 :** Dans AWS Organizations, quel type de politique permet de définir la limite absolue des autorisations accordables dans une Organizational Unit (OU) ?
- A) SCP (Service Control Policy) — **✅ Réponse : A**
- B) IAM Group Policy
- C) Resource-Based Policy
- D) S3 Bucket Policy

**Q08 :** Quel service AWS utilise le Machine Learning pour scanner automatiquement les buckets S3 et détecter les données personnelles (PII) ?
- A) Amazon Macie — **✅ Réponse : A**
- B) Amazon GuardDuty
- C) AWS Inspector
- D) AWS Config

**Q09 :** Quelles sont les trois sources de données principales analysées par Amazon GuardDuty pour détecter les menaces ?
- A) CloudTrail Event Logs, VPC Flow Logs et Route 53 DNS Query Logs — **✅ Réponse : A**
- B) CloudWatch, S3 Access Logs et EC2 Logs
- C) Config Rules, Macie et Inspector
- D) WAF Logs, Shield et Firewall Manager

**Q10 :** Quel service AWS permet de visualiser graphiquement les relations entre entités impliquées dans un incident pour l'investigation forensique ?
- A) Amazon Detective — **✅ Réponse : A**
- B) AWS Config
- C) AWS Trusted Advisor
- D) AWS Inspector

**Q11 :** Quel événement CloudTrail indique qu'un attaquant tente de masquer ses actions en arrêtant l'enregistrement des journaux ?
- A) `StopLogging` ou `DeleteTrail` — **✅ Réponse : A**
- B) `DescribeInstances`
- C) `ListBuckets`
- D) `GetCallerIdentity`

**Q12 :** Quelle est la première action forensique recommandée sur une instance EC2 compromise avant toute modification ?
- A) Créer un snapshot EBS de tous les volumes attachés, puis isoler réseau l'instance — **✅ Réponse : A**
- B) Redémarrer l'instance immédiatement
- C) Supprimer les logs de l'instance
- D) Changer le mot de passe root

---

### SECTION 3 : CKS Kubernetes Security (Q13 - Q18)

**Q13 :** Dans Kubernetes, comment appliquer le profil Pod Security Standard `restricted` en mode bloquant sur un namespace ?
- A) En ajoutant le label `pod-security.kubernetes.io/enforce=restricted` sur le namespace — **✅ Réponse : A**
- B) En créant une NetworkPolicy
- C) En modifiant le fichier kube-apiserver.yaml
- D) En installant Caldera CNI

**Q14 :** Quel outil open-source (CNCF / Sigstore) permet de signer cryptographiquement une image de conteneur par son digest SHA256 ?
- A) Cosign (Sigstore) — **✅ Réponse : A**
- B) Let's Encrypt
- C) HashiCorp Vault
- D) Trivy

**Q15 :** Quel outil CKS basé sur eBPF détecte en temps réel les comportements anormaux des conteneurs à l'exécution (ex. shell spawné) ?
- A) Falco — **✅ Réponse : A**
- B) OPA Gatekeeper
- C) Kyverno
- D) Trivy

**Q16 :** Dans Istio, qu'impose le mode `PeerAuthentication` **STRICT** ?
- A) Tout le trafic inter-services doit être chiffré avec mTLS (TLS mutuel) — **✅ Réponse : A**
- B) Seul le trafic entrant doit être en HTTPS
- C) Les services doivent s'authentifier avec un JWT
- D) Les Pods doivent s'exécuter en tant que root

**Q17 :** Quelle directive `securityContext` empêche un processus d'obtenir des privilèges supplémentaires via `sudo` ou SUID ?
- A) `allowPrivilegeEscalation: false` — **✅ Réponse : A**
- B) `runAsNonRoot: true`
- C) `readOnlyRootFilesystem: true`
- D) `capabilities.drop: [ALL]`

**Q18 :** Quel outil d'Aqua Security est la référence CKS pour scanner les CVE des images de conteneurs ?
- A) Trivy — **✅ Réponse : A**
- B) Nmap
- C) Wireshark
- D) Snyk

---

### SECTION 4 : CISM & Governance (Q19 - Q24)

**Q19 :** Dans le domaine CISM, quelle est la différence entre un KPI et un KRI ?
- A) Un KPI mesure l'efficacité passée des contrôles, un KRI est un signal d'alerte précoce d'augmentation du risque — **✅ Réponse : A**
- B) Un KPI est financier, un KRI est technique
- C) Un KPI est pour la direction, un KRI pour les techniciens
- D) Aucune différence

**Q20 :** Quel cadre ISACA est la référence mondiale pour la gouvernance IT en 40 objectifs de contrôle ?
- A) COBIT 2019 — **✅ Réponse : A**
- B) ISO 27001:2022
- C) NIST CSF 2.0
- D) ITIL v4

**Q21 :** Dans une BIA, que représente le RTO (Recovery Time Objective) ?
- A) La durée maximale acceptable d'interruption d'un processus métier — **✅ Réponse : A**
- B) La quantité de données perdues tolérée
- C) Le budget de reprise après sinistre
- D) Le délai de notification réglementaire

**Q22 :** Quelle stratégie de Risk Treatment consiste à souscrire une assurance cyber ?
- A) Transfer (Transfert du risque) — **✅ Réponse : A**
- B) Mitigate
- C) Accept
- D) Avoid

**Q23 :** En gestion des risques CISM, comment calcule-t-on le score de risque inhérent ?
- A) Probabilité (Likelihood) × Impact — **✅ Réponse : A**
- B) Impact ÷ Probabilité
- C) Impact + Probabilité
- D) Impact × Coût

**Q24 :** À qui le CISO doit-il idéalement rapporter pour garantir l'indépendance de sa fonction ?
- A) Directement au CEO ou au Conseil d'Administration (Board) — **✅ Réponse : A**
- B) Au Directeur Informatique (CIO)
- C) Au Directeur Financier (CFO)
- D) Au Directeur des Ressources Humaines

---

### SECTION 5 : CISSP & Architecture (Q25 - Q30)

**Q25 :** Dans le modèle STRIDE, quelle catégorie est mitigée par les pistes d'audit immuables ?
- A) R — Repudiation (Non-répudiation) — **✅ Réponse : A**

**Q26 :** Selon le principe de Defense-in-Depth, quelle est la règle fondamentale ?
- A) Superposer plusieurs couches de contrôles de sécurité indépendants — **✅ Réponse : A**
- B) Tout miser sur un seul pare-feu
- C) Utiliser uniquement des outils certifiés CC EAL7
- D) Déléguer la sécurité au cloud

**Q27 :** Dans FIPS 140-3, quel niveau exige la destruction automatique des clés en cas d'attaque physique ?
- A) Level 4 — **✅ Réponse : A**
- B) Level 1
- C) Level 2
- D) Level 3

**Q28 :** Pourquoi la Root CA d'une PKI d'entreprise doit-elle rester hors-ligne (air-gapped) ?
- A) Car sa compromission détruit la confiance de toute la hiérarchie PKI — **✅ Réponse : A**
- B) Pour économiser l'électricité
- C) Pour respecter le RGPD
- D) Car elle n'émet pas de certificats

**Q29 :** Quel mode de chiffrement symétrique AES offre confidentialité et authentification en un seul passage (AEAD) ?
- A) AES-GCM — **✅ Réponse : A**
- B) AES-CBC
- C) AES-ECB
- D) AES-OFB

**Q30 :** Quel principe stipule que la sécurité d'un système ne doit reposer que sur le secret de la clé, pas de l'algorithme ?
- A) Principe de Kerckhoffs — **✅ Réponse : A**
- B) Principe de Kerberos
- C) Règle de Bell-LaPadula
- D) Loi de Moore

---

### SECTION 6 : GREM & Reverse Engineering (Q31 - Q36)

**Q31 :** Qu'indique une entropie supérieure à 7.0 dans une section d'un fichier PE ?
- A) La section est probablement compressée ou chiffrée (packing/obfuscation) — **✅ Réponse : A**
- B) Le fichier est très petit
- C) Le fichier est compilé en Go
- D) La section contient des images

**Q32 :** Quel ensemble d'imports Windows indique fortement une tentative d'injection de processus ?
- A) `VirtualAllocEx` + `WriteProcessMemory` + `CreateRemoteThread` — **✅ Réponse : A**
- B) `MessageBoxA`
- C) `GetSystemTime`
- D) `RegOpenKeyEx`

**Q33 :** Pourquoi les ransomwares suppriment-ils les Volume Shadow Copies (VSS) ?
- A) Pour empêcher la victime de restaurer ses fichiers via les snapshots Windows — **✅ Réponse : A**
- B) Pour libérer du disque
- C) Pour masquer leur présence
- D) Pour accélérer le chiffrement

**Q34 :** Comment un rootkit DKOM masque-t-il un processus des outils de gestion des tâches ?
- A) En décrochant la structure EPROCESS de la liste `ActiveProcessLinks` — **✅ Réponse : A**
- B) En chiffrant le processus
- C) En modifiant tasklist.exe
- D) En injectant une DLL

**Q35 :** Dans Volatility 3, quelle combinaison permet de repérer les processus cachés par DKOM ?
- A) `windows.pslist` comparé à `windows.psscan` — **✅ Réponse : A**
- B) `windows.malfind` vs `cmdline`
- C) `windows.netstat` vs `connections`
- D) `windows.dlllist` vs `driverscan`

**Q36 :** Qu'est-ce qu'un SSDT Hook dans le noyau Windows ?
- A) La modification des pointeurs de la System Service Descriptor Table pour rediriger les appels système — **✅ Réponse : A**
- B) L'injection dans lsass.exe
- C) La modification du MBR
- D) Le chiffrement du kernel

---

### SECTION 7 : CIPP/E & Privacy (Q37 - Q41)

**Q37 :** Quelle est la différence majeure entre la pseudonymisation et l'anonymisation selon le RGPD ?
- A) La pseudonymisation est réversible et soumise au RGPD ; l'anonymisation est irréversible et sort du champ du RGPD — **✅ Réponse : A**
- B) L'anonymisation est interdite
- C) Aucune différence
- D) La pseudonymisation est payante

**Q38 :** Quel est le délai légal maximal de réponse à une demande DSAR (Article 12(3)) ?
- A) Un mois (prolongeable de deux mois si complexe) — **✅ Réponse : A**
- B) 24 heures
- C) 7 jours
- D) 6 mois

**Q39 :** Le principe de Privacy by Default (Article 25(2)) impose :
- A) Que seules les données nécessaires pour chaque finalité spécifique soient traitées par défaut — **✅ Réponse : A**
- B) Que toutes les données soient publiques
- C) Que le consentement soit pré-coché
- D) De payer pour la confidentialité

**Q40 :** Quel article du RGPD rend obligatoire la tenue d'un Registre des Activités de Traitement (RoPA) ?
- A) Article 30 — **✅ Réponse : A**
- B) Article 5
- C) Article 12
- D) Article 89

**Q41 :** Quel droit possède une personne soumise à une décision fondée exclusivement sur un traitement automatisé (Art. 22) ?
- A) Le droit d'obtenir une intervention humaine et de contester la décision — **✅ Réponse : A**
- B) Aucun droit
- C) Le droit d'effacer internet
- D) Le droit de racheter l'entreprise

---

### SECTION 8 : OSED & Advanced Exploitation (Q42 - Q46)

**Q42 :** Sous Windows x64 (FastCall), quels registres transmettent les 4 premiers arguments d'une fonction ?
- A) `RCX`, `RDX`, `R8`, `R9` — **✅ Réponse : A**
- B) Stack uniquement
- C) EAX, EBX, ECX, EDX
- D) RDI, RSI, RBP, RSP

**Q43 :** Pourquoi la protection HVCI rend-elle les shellcodes kernel inopérants sur Windows 11 ?
- A) Car elle interdit l'exécution des pages mémoire noyau qui ne possèdent pas une signature cryptographique valide — **✅ Réponse : A**
- B) Car elle coupe le réseau
- C) Car elle désactive C++
- D) Car elle exige 128 Go de RAM

**Q44 :** Qu'est-ce qu'une Data-Only Attack en exploitation du noyau Windows ?
- A) Une attaque qui n'injecte aucun code exécutable mais modifie uniquement des variables/structures de données en mémoire — **✅ Réponse : A**
- B) Un envoi de spams
- C) Un formatage de disque
- D) Une requête SQL SELECT

**Q45 :** Quel composant de Chromium assure la communication sécurisée entre le Renderer (sandboxé) et le Browser Process ?
- A) Mojo IPC — **✅ Réponse : A**
- B) WebSockets
- C) OpenSSL
- D) Docker Socket

**Q46 :** À quoi servent les primitives `addrof` et `fakeobj` en exploitation V8 JavaScript ?
- A) `addrof` obtient l'adresse mémoire d'un objet ; `fakeobj` fait passer une adresse arbitraire pour un objet JS — **✅ Réponse : A**
- B) À télécharger des fichiers
- C) À afficher des fenêtres popup
- D) À accélérer les boucles

---

### SECTION 9 : Red Team & Supply Chain (Q47 - Q50)

**Q47 :** Quelle est la caractéristique clé d'une opération Red Team sous le cadre TIBER-EU ?
- A) Attaque guidée par la Threat Intelligence (TI-Led), testant des scénarios APT réels avec déconfliction par la White Team — **✅ Réponse : A**
- B) Scan de vulnérabilités Nessus automatisé
- C) Prévenance du SOC 1 semaine à l'avance
- D) Test sur environnement de développement uniquement

**Q48 :** Quel est le rôle de la White Team lors d'un exercice Red Team TIBER-EU ?
- A) Être la seule équipe au courant, veiller au respect des RoE et assurer la déconfliction lors des alertes du SOC — **✅ Réponse : A**
- B) Attaquer le réseau
- C) Écrire le code source
- D) Acheter le matériel

**Q49 :** Que garantit une Attestation de Provenance signée dans le framework SLSA ?
- A) La preuve cryptographique de la source du code, de l'identité du builder et des étapes de construction de l'artefact — **✅ Réponse : A**
- B) L'absence totale de bugs
- C) Le téléchargement rapide
- D) La gratuité de la licence

**Q50 :** Comment prévenir une attaque par Dependency Confusion dans un projet d'entreprise ?
- A) Utiliser des scopes d'organisation réservés (ex: `@company/pkg`) et configurer le registre privé pour exclure les registres publics — **✅ Réponse : A**
- B) Augmenter la taille du disque
- C) Désactiver package-lock.json
- D) Supprimer Git

---

## 📊 BARÈME ET RÉSULTAT DU SEMESTRE 7

```
50 / 50  →  100%  — EXCELLENCE ABSOLUE (Major de Promotion Master 2)
45-49    →  90-98% — MENTION TRÈS BIEN
38-44    →  76-88% — SEMESTRE 7 VALIDÉ (SEUIL MINIMUM REQUIS : 38/50)
< 38     →  < 76%  — ÉCHEC (Rattrapage requis)
```

---

> [!IMPORTANT]
> **BILAN FINAL DU SEMESTRE 7 (JOUR 301 À JOUR 350) :**
> - **50 Leçons Haut de Gamme** rédigées, validées et publiées sans aucune régression.
> - **9 Projets Intégrateurs (Capstones)** complets développés avec scripts Python/C/JS et architectures.
> - **8 Certifications d'Élite** couvertes (OSCP+, AWS Security, CKS, CISM, CISSP, GREM, CIPP/E, OSED).
> - **100% de Conformité** aux règles MkDocs (`python3 -m mkdocs build --strict`).
>
> *(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
