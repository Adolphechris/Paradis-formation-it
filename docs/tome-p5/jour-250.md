# TOME P5 — Cybersécurité Avancée & Red/Blue Team — Jour 250 (6h) : Grand Examen de Synthèse du Semestre 5 (50 QCM Corrigés — Cybersécurité Avancée, Red/Blue Team, Cloud Security, DevSecOps, IA, Conformité & Crisis Management)

> [!NOTE]
> **Objectif du jour :** Évaluer et consolider la totalité des compétences acquises durant le **Semestre 5 (J201-J249)** via 50 questions à choix multiples couvrant l'ensemble des domaines : Forensique, Malware Reverse Engineering, Purple Team, API Security, PQC, Red Team Cloud, Zero Trust, Container Security, Supply Chain, AI/LLM Security, Kernel Hardening, Cryptographie Entreprise, CTI, Conformité, Privacy Engineering et Crisis Management.
>
> **Ce Grand Examen couvre des sujets universellement reconnus par les certifications OSCP, CEH, CISSP, AWS Security Specialty, CKS et CISM — destiné au marché mondial de l'emploi en cybersécurité.**

---

## 📋 Conditions d'Examen

| Paramètre | Valeur |
|:---:|:---:|
| Nombre de questions | 50 QCM |
| Durée recommandée | 90 minutes |
| Seuil de réussite | 37/50 (75%) |
| Domaines couverts | J201 à J249 |

---

## PARTIE 1 — DFIR & Forensique (J201-J215) — Questions 1 à 10

**Q01 :** Quelle commande Volatility 3 permet d'analyser la liste des processus actifs d'un dump mémoire Linux ?
- A) `python3 vol.py -f dump.mem linux.pslist`
- B) `python3 vol.py --scan processes`
- C) `dumpit -o output.dmp`
- D) `foremost -i dump.mem`

**✅ Réponse : A** — `linux.pslist` est le plugin Volatility 3 pour lister les processus d'un dump mémoire Linux.

---

**Q02 :** Quel outil open-source de forensique numérique crée une **timeline chronologique unifiée** en agrégeant les artéfacts de journaux Windows, Linux, Plaso, SQLite et navigateurs web ?
- A) log2timeline (Plaso)
- B) Autopsy
- C) Volatility
- D) Binwalk

**✅ Réponse : A** — Plaso/log2timeline génère des timelines forensiques unifiées multi-sources.

---

**Q03 :** Dans l'analyse de malware statique, quel outil open-source de décompilation gratuit (développé par la NSA) permet de décompiler des binaires compilés C/C++ en code pseudo-C lisible ?
- A) Ghidra
- B) IDA Pro
- C) OllyDbg
- D) gdb

**✅ Réponse : A** — Ghidra est le désassembleur/décompilateur open-source développé par la NSA.

---

**Q04 :** Quel PE (Portable Executable) header field analyse PEstudio pour déterminer si une DLL Windows a été compilée avec un compilateur non standard (indicateur de malware) ?
- A) Le champ `Compiler Timestamp` et `Rich Header` dans le PE Header
- B) L'extension `.dll` du fichier
- C) La taille du fichier en octets
- D) Le nom de l'éditeur dans les ressources

**✅ Réponse : A** — Le Rich Header encode les informations de compilation et peut signaler un packer ou un compilateur inhabituel.

---

**Q05 :** Lors d'un examen de mémoire volatile, comment le framework Volatility identifie-t-il les **injections de code en mémoire (Process Hollowing)** ?
- A) En comparant les sections PE chargées en mémoire avec les sections du binaire légitime sur disque via le plugin `malfind` (recherche de pages exécutables marquées `PAGE_EXECUTE_READWRITE` sans image correspondante)
- B) En scannant les fichiers du répertoire System32
- C) En comparant les timestamps des fichiers NTFS
- D) En analysant le registre Windows

**✅ Réponse : A** — `malfind` détecte les injections mémoire via les anomalies de permissions sur les pages.

---

**Q06 :** Qu'est-ce qu'un **Indicateur de Compromission (IoC — Indicator of Compromise)** dans le contexte d'une investigation DFIR ?
- A) Un artefact observable (hash SHA256, adresse IP, nom de domaine, clé de registre) indiquant avec forte probabilité qu'un système a été compromis
- B) Un fichier de configuration réseau
- C) Un certificat TLS expiré
- D) Un script de sauvegarde programmé

**✅ Réponse : A** — Les IoCs sont les preuves observables d'une compromission.

---

**Q07 :** Dans quel format standardisé l'outil Plaso stocke-t-il ses timelines forensiques pour permettre l'analyse dans des outils comme Timesketch ?
- A) `.plaso` (SQLite Format) compatible avec `psort.py` pour l'export CSV/JSON
- B) `.evtx` Windows Event Log
- C) `.pcap` packet capture
- D) `.docx` Microsoft Word

**✅ Réponse : A** — Plaso génère un fichier `.plaso` (SQLite) analysable avec psort.py.

---

**Q08 :** Lors d'une simulation Purple Team avec le framework **Caldera (MITRE ATT&CK)**, quel est l'objectif principal de l'exercice ?
- A) Valider en conditions réelles quelles techniques ATT&CK sont détectées par les défenses en place (SIEM/EDR) et identifier les angles morts de détection à combler
- B) Former les développeurs aux pratiques DevSecOps
- C) Tester les performances réseau
- D) Valider la configuration du pare-feu périmétrique

**✅ Réponse : A** — Purple Team = mesurer la couverture de détection SOC face aux TTPs réels ATT&CK.

---

**Q09 :** Quelle ressource du framework **MITRE ATT&CK** fournit des règles de détection Sigma précises associées à chaque technique d'attaque T-XXXX pour l'intégration dans un SIEM ?
- A) MITRE CAR (Cyber Analytics Repository)
- B) MITRE CVE
- C) MITRE CWE
- D) MITRE NVD

**✅ Réponse : A** — MITRE CAR fournit des analytics et requêtes de détection pour les techniques ATT&CK.

---

**Q10 :** Lors d'un audit de sécurité API REST, qu'est-ce qu'une vulnérabilité **BOLA (Broken Object Level Authorization)** et dans quelle position figure-t-elle dans l'OWASP API Security Top 10 ?
- A) Une faille API #1 (API1:2023) où un utilisateur peut accéder aux données d'un autre utilisateur en modifiant l'ID d'objet dans la requête (ex: `GET /api/accounts/1234` → modifier en `1235`)
- B) Une injection SQL dans les paramètres GET
- C) Un défaut de chiffrement TLS
- D) Un déni de service par flood de requêtes

**✅ Réponse : A** — BOLA est la vulnérabilité #1 de l'OWASP API Security Top 10 2023.

---

## PARTIE 2 — Sécurité Cloud & Architecture (J216-J230) — Questions 11 à 25

**Q11 :** Quelle technologie de chiffrement post-quantique (PQC), standardisée par le NIST sous le nom **FIPS 203**, est conçue pour l'échange de clés résistant aux ordinateurs quantiques ?
- A) ML-KEM (Kyber) — Module-Lattice-Based Key Encapsulation Mechanism
- B) RSA-4096
- C) ECDH P-521
- D) Diffie-Hellman 8192 bits

**✅ Réponse : A** — ML-KEM (ex-Kyber) est le standard FIPS 203 de l'NIST pour le KEM post-quantique.

---

**Q12 :** Quelle attaque sur les communications chiffrées actuelles justifie une migration urgente vers la cryptographie post-quantique (PQC) ?
- A) HNDL (Harvest Now, Decrypt Later) — Collecte massive de trafic chiffré TLS aujourd'hui pour le déchiffrer lorsque des ordinateurs quantiques seront disponibles
- B) Birthday Paradox sur SHA-256
- C) Brute Force AES-128
- D) Collision MD5

**✅ Réponse : A** — L'attaque HNDL est le principal moteur d'urgence de la migration PQC.

---

**Q13 :** Quel framework open-source de pentest AWS (développé par Rhino Security Labs) permet d'automatiser la découverte des chemins d'escalade de privilèges IAM ?
- A) PACU
- B) Metasploit
- C) OpenVAS
- D) Nessus

**✅ Réponse : A** — PACU est le framework d'exploitation dédié aux environnements AWS.

---

**Q14 :** Dans AWS, quelle version de l'Instance Metadata Service **doit obligatoirement être activée** pour prévenir les attaques SSRF → Vol de credentials IAM depuis une Lambda compromise ?
- A) IMDSv2 (Instance Metadata Service v2) — Requiert un token de session HTTP PUT préalable
- B) IMDSv1
- C) IAM Policy v3
- D) GuardDuty v2

**✅ Réponse : A** — IMDSv2 avec token de session bloque les attaques SSRF contre l'endpoint de métadonnées.

---

**Q15 :** Quelle permission IAM AWS, si accordée à un utilisateur ou rôle non-administrateur, constitue un chemin d'escalade de privilèges critique permettant d'obtenir `AdministratorAccess` ?
- A) `iam:CreatePolicyVersion` + `iam:SetDefaultPolicyVersion`
- B) `s3:GetObject`
- C) `ec2:DescribeInstances`
- D) `cloudwatch:GetMetricData`

**✅ Réponse : A** — Créer une nouvelle version de politique avec `"Action": "*"` et la définir par défaut = accès admin complet.

---

**Q16 :** Quel standard NIST (SP 800-207) définit les 7 piliers de l'Architecture Zero Trust et le principe "Never Trust, Always Verify" ?
- A) NIST SP 800-207 — Zero Trust Architecture
- B) NIST SP 800-53
- C) NIST SP 800-61
- D) NIST SP 800-82

**✅ Réponse : A** — NIST SP 800-207 est la référence définitive du Zero Trust.

---

**Q17 :** Quelle technologie de micro-segmentation réseau basée sur **eBPF** est utilisée dans les clusters Kubernetes pour appliquer une politique réseau "Deny-All + Allow-Explicit" au niveau de chaque pod ?
- A) Cilium
- B) Calico classique
- C) iptables
- D) NSX-T

**✅ Réponse : A** — Cilium utilise eBPF pour la micro-segmentation Kubernetes de nouvelle génération.

---

**Q18 :** Lors d'un Threat Model STRIDE, quelle menace (lettre **E**) correspond à l'exploitation d'une vulnérabilité permettant à un utilisateur normal d'obtenir les droits administrateur ?
- A) **E** — Elevation of Privilege
- B) **E** — Encryption Bypass
- C) **E** — Endpoint Spoofing
- D) **E** — Execution Error

**✅ Réponse : A** — E de STRIDE = Elevation of Privilege.

---

**Q19 :** Quel outil open-source de BishopFox cartographie automatiquement les ressources, secrets, rôles IAM et chemins d'attaque dans un compte AWS lors d'un engagement Red Team Cloud ?
- A) CloudFox
- B) ScoutSuite
- C) PACU
- D) Prowler

**✅ Réponse : A** — CloudFox est l'outil de cartographie d'attack paths Cloud de BishopFox.

---

**Q20 :** Dans la configuration d'un tunnel **Cloudflare Access** (ZTNA), quelle alternative est-elle proposée pour remplacer le VPN traditionnel tout en appliquant Zero Trust ?
- A) Le déploiement de **cloudflared** (tunnel chiffré sortant), associé à une politique d'accès ZT vérifiant identité, posture du device et localisation
- B) Le déploiement d'un concentrateur IPSec supplémentaire
- C) L'extension du périmètre réseau MPLS
- D) L'ajout d'un VLAN isolé

**✅ Réponse : A** — Cloudflare Access avec cloudflared est la solution ZTNA remplaçant le VPN.

---

**Q21 :** Quelle vulnérabilité de sécurité Kubernetes constitue la principale voie d'évasion de conteneur (Container Escape) vers le nœud hôte ?
- A) Conteneur avec `privileged: true` et/ou montage de `/var/run/docker.sock`
- B) `readOnlyRootFilesystem: true`
- C) Déploiement dans le namespace `default`
- D) Image Docker basée sur Ubuntu 22.04

**✅ Réponse : A** — Privileged container et docker socket mount sont les deux vecteurs d'escape les plus critiques.

---

**Q22 :** Quel outil CNCF (runtime security) analyse les appels système en temps réel via eBPF et génère des alertes sur les comportements anormaux des conteneurs (shell interactif, accès docker socket) ?
- A) Falco
- B) OPA Gatekeeper
- C) Trivy
- D) Kyverno

**✅ Réponse : A** — Falco est le moteur de détection runtime de la CNCF.

---

**Q23 :** Quelle attaque majeure de la supply chain logicielle (2020) a compromis environ 18 000 organisations en injectant un backdoor dans les builds du produit Orion de SolarWinds ?
- A) SolarWinds / SUNBURST
- B) XZ Utils (CVE-2024-3094)
- C) Dependency Confusion
- D) Log4Shell

**✅ Réponse : A** — SUNBURST est le backdoor injecté dans les builds de SolarWinds Orion.

---

**Q24 :** Dans un pipeline DevSecOps, quel outil scanner d'images Docker retourne un code de sortie 1 (échec CI/CD) lorsqu'une vulnérabilité CRITICAL est détectée, bloquant ainsi le déploiement automatiquement ?
- A) Trivy avec `--exit-code 1 --severity CRITICAL`
- B) Nmap
- C) Burp Suite
- D) Metasploit

**✅ Réponse : A** — Trivy en mode CI avec `--exit-code 1` bloque le pipeline automatiquement.

---

**Q25 :** Quel outil open-source Aqua Security génère des **SBOM (Software Bill of Materials)** au format CycloneDX ou SPDX pour inventorier tous les composants d'une image Docker ou d'un projet ?
- A) Syft
- B) Falco
- C) Gitleaks
- D) Cosign

**✅ Réponse : A** — Syft (Anchore) est le générateur de SBOM de référence open-source.

---

## PARTIE 3 — Sécurité IA, IAM Avancé & Conformité (J231-J250) — Questions 26 à 50

**Q26 :** Quelle vulnérabilité de l'OWASP Top 10 for LLM (LLM01:2023) se produit lorsqu'un utilisateur insère des instructions dans son prompt pour outrepasser le prompt système du modèle ?
- A) Prompt Injection
- B) Model Inversion
- C) Data Poisoning
- D) Supply Chain Attack

**✅ Réponse : A** — LLM01:2023 = Prompt Injection directe ou indirecte.

---

**Q27 :** Quel framework open-source (NVIDIA) permet de définir des règles programmatiques de sécurité (rails) pour contrôler les entrées et sorties d'une application basée sur un LLM ?
- A) NeMo Guardrails
- B) LlamaGuard
- C) LangChain
- D) LlamaIndex

**✅ Réponse : A** — NeMo Guardrails de NVIDIA permet de définir des règles comportementales pour les LLM.

---

**Q28 :** Quel standard CNCF d'identité de workload définit un format d'URI `spiffe://domain/ns/service` pour authentifier cryptographiquement les microservices sans secrets statiques ?
- A) SPIFFE (Secure Production Identity Framework for Everyone)
- B) OAuth2
- C) SAML 2.0
- D) Kerberos

**✅ Réponse : A** — SPIFFE définit le format et SPIRE l'implémente pour les workloads cloud-native.

---

**Q29 :** Pourquoi l'authentification FIDO2 / WebAuthn est-elle **immunisée contre les attaques de phishing** par proxy inverse (ex: Evilginx2) ?
- A) La signature cryptographique est liée à l'Origin (nom de domaine exact), rendant toute assertion produite sur un faux domaine invalide
- B) Elle nécessite un certificat client X.509
- C) Elle utilise un VPN dédié
- D) Elle ignore le DNS

**✅ Réponse : A** — La liaison cryptographique à l'Origin est le mécanisme fondamental anti-phishing de FIDO2.

---

**Q30 :** Quelle technique d'attaque sur ADFS permet de forger des assertions SAML valides pour n'importe quel utilisateur après vol de la clé privée du Token-Signing Certificate ?
- A) Golden SAML Attack
- B) Pass-the-Hash
- C) Kerberoasting
- D) LLMNR Poisoning

**✅ Réponse : A** — Golden SAML est l'équivalent du Golden Ticket dans le monde de la fédération Cloud.

---

**Q31 :** Quel modèle mathématique d'anonymisation garantit que chaque enregistrement d'un jeu de données partage ses quasi-identifiants avec au moins k-1 autres individus ?
- A) k-Anonymity
- B) RSA-2048
- C) SHA-256
- D) AES-GCM

**✅ Réponse : A** — k-Anonymity est le modèle fondamental d'anonymisation formelle.

---

**Q32 :** Quel mécanisme de bruit probabiliste est injecté dans les calculs statistiques pour garantir la Confidentialité Différentielle (Differential Privacy) ?
- A) Mécanisme de Laplace ou Gaussien (bruit calibré selon le paramètre epsilon)
- B) Chiffrement XOR
- C) Suppression de lignes aléatoires
- D) Hachage SHA-3

**✅ Réponse : A** — Le mécanisme de Laplace (ou Gaussien) est le coeur de la Differential Privacy.

---

**Q33 :** Quel état des données est protégé par les technologies de **Confidential Computing** (AMD SEV-SNP, Intel SGX/TDX) ?
- A) Data in Use (Données en cours de traitement en mémoire RAM)
- B) Data at Rest
- C) Data in Transit
- D) Data in Archive

**✅ Réponse : A** — Confidential Computing protège les données **during computation** (en mémoire active).

---

**Q34 :** Quel type de chiffrement avancé permet d'exécuter des calculs arithmétiques sur des données chiffrées sans les déchiffrer, grâce à des propriétés algébriques d'homomorphisme ?
- A) FHE — Fully Homomorphic Encryption (Chiffrement Homomorphe Complet)
- B) AES-256-GCM
- C) RSA-OAEP
- D) TLS 1.3

**✅ Réponse : A** — FHE permet des calculs sur ciphertexts sans jamais déchiffrer.

---

**Q35 :** Quel paramètre sysctl Linux protège contre les tentatives de contournement de KASLR (Kernel Address Space Layout Randomization) en empêchant la lecture des pointeurs du noyau ?
- A) `kernel.kptr_restrict = 2`
- B) `net.ipv4.ip_forward = 0`
- C) `vm.swappiness = 10`
- D) `fs.inotify.max_user_watches`

**✅ Réponse : A** — `kernel.kptr_restrict = 2` cache les adresses kernel aux utilisateurs non-root.

---

**Q36 :** Quelle norme d'interface (API standard) est utilisée pour communiquer de manière standardisée avec un HSM (Hardware Security Module) depuis une application ?
- A) PKCS#11 (Cryptoki)
- B) REST API
- C) GraphQL
- D) JDBC

**✅ Réponse : A** — PKCS#11 (Cryptoki) est le standard universel d'accès aux HSM.

---

**Q37 :** Quel moteur de **HashiCorp Vault** fournit un service d'Encryption-as-a-Service permettant aux microservices de chiffrer des données à la volée sans jamais manipuler les clés ?
- A) Transit Engine
- B) KV Engine
- C) PKI Engine
- D) Database Engine

**✅ Réponse : A** — Le Transit Engine de Vault est le service de chiffrement à la demande.

---

**Q38 :** Dans la **Differential Privacy**, que représente le paramètre **epsilon (ε)** ?
- A) Le budget de confidentialité — une valeur basse (ex: ε=0.1) signifie plus de bruit et plus de protection de la vie privée
- B) La clé de chiffrement symétrique
- C) Le nombre de processeurs utilisés
- D) La durée de validité du token JWT

**✅ Réponse : A** — Epsilon = budget de confidentialité. Faible epsilon = forte protection.

---

**Q39 :** Quel standard JSON/REST (TAXII 2.1) est utilisé pour l'échange automatisé d'objets de Cyber Threat Intelligence (CTI) entre organisations ?
- A) TAXII 2.1 (Trusted Automated Exchange of Intelligence Information)
- B) STIX 2.1
- C) OpenIOC
- D) SNORT

**✅ Réponse : A** — TAXII est le protocole de transport, STIX est le format de données.

---

**Q40 :** Quel langage de requête est utilisé dans Azure Sentinel (Microsoft) et Elastic pour rédiger des requêtes de Threat Hunting sur les logs de sécurité ?
- A) KQL (Kusto Query Language)
- B) SQL
- C) Python
- D) JavaScript

**✅ Réponse : A** — KQL est le langage de requête de Microsoft Azure Sentinel / Log Analytics.

---

**Q41 :** Quel programme de sécurité bancaire international impose des contrôles de sécurité obligatoires annuels (CSCF v2024) à toutes les institutions financières participantes au réseau de paiement interbancaire mondial ?
- A) SWIFT Customer Security Program (SWIFT CSP)
- B) PCI-DSS v4
- C) SOC 2 Type II
- D) ISO 9001

**✅ Réponse : A** — Le SWIFT CSP et son CSCF imposent 32 contrôles (dont 25 obligatoires) à chaque banque participante.

---

**Q42 :** Combien de piliers définit le règlement européen **DORA (Digital Operational Resilience Act)** pour garantir la résilience opérationnelle numérique des entités financières ?
- A) 5 piliers (Risk Management, Incident Reporting, Resilience Testing, Third-Party Risk, Information Sharing)
- B) 2 piliers
- C) 12 piliers
- D) 1 seul pilier

**✅ Réponse : A** — DORA repose sur 5 piliers de résilience numérique.

---

**Q43 :** Quel délai maximal le **RGPD (Article 33)** impose-t-il pour notifier une violation de données à l'autorité de contrôle (ex: CNIL) ?
- A) 72 heures
- B) 7 jours
- C) 30 jours
- D) 6 mois

**✅ Réponse : A** — Le RGPD impose une notification à la CNIL dans les 72 heures.

---

**Q44 :** Quelle métrique de cybersécurité (MTTD — Mean Time To Detect) mesure principalement ?
- A) Le délai moyen entre le début d'une intrusion et sa première détection par l'équipe SOC
- B) Le délai moyen de déploiement d'une mise à jour applicative
- C) Le nombre d'alertes SIEM par jour
- D) La durée de validité d'un certificat TLS

**✅ Réponse : A** — MTTD = temps moyen de détection d'un incident de sécurité.

---

**Q45 :** Quel modèle de notation de risques utilisé en Threat Modeling évalue les menaces selon 5 dimensions : Damage, Reproducibility, Exploitability, Affected Users, Discoverability ?
- A) DREAD (Damage, Reproducibility, Exploitability, Affected Users, Discoverability)
- B) CVSS v3.1
- C) STRIDE
- D) PASTA

**✅ Réponse : A** — DREAD est le modèle de scoring de menaces microsoftien complémentaire à STRIDE.

---

**Q46 :** Quelle technique de Red Team Cloud utilise une clé privée du certificat ADFS volée pour créer des assertions SAML contournant totalement l'authentification, le MFA et les changements de mot de passe ?
- A) Golden SAML Attack
- B) Kerberoasting
- C) NTLM Relay
- D) Pass-the-Ticket

**✅ Réponse : A** — Golden SAML = équivalent du Golden Ticket dans les fédérations Cloud/ADFS.

---

**Q47 :** Dans un contexte DevSecOps, que signifie **Shift-Left Security** ?
- A) Intégrer les contrôles de sécurité le plus tôt possible dans le cycle de développement (dès la phase de conception et de code), plutôt qu'après déploiement
- B) Déplacer les serveurs vers un datacenter plus à gauche sur la carte
- C) Supprimer les tests de sécurité pour accélérer les livraisons
- D) Augmenter la taille de l'équipe de conformité

**✅ Réponse : A** — Shift-Left = sécurité intégrée dès la conception (Threat Modeling, SAST, SCA en CI/CD).

---

**Q48 :** Quelle technologie de déception (Cyber Deception) génère par construction **zéro faux-positif** car toute interaction avec elle est nécessairement malveillante ?
- A) Canary Token / Honeypot — Aucun utilisateur légitime ne devrait jamais y accéder
- B) Règles Sigma SIEM
- C) Antivirus avec signatures
- D) Pare-feu applicatif WAF

**✅ Réponse : A** — Honeypots et Canary Tokens = zéro faux-positif par définition.

---

**Q49 :** Quel est le délai d'alerte précoce (Early Warning) exigé par la directive **NIS 2** en cas d'incident de cybersécurité significatif affectant une entité essentielle ou importante ?
- A) 24 heures (Early Warning) puis 72h rapport intermédiaire, puis 1 mois pour le rapport final
- B) 7 jours
- C) 6 mois
- D) Aucun délai imposé

**✅ Réponse : A** — NIS 2 exige 24h pour l'alerte précoce, 72h pour le rapport intermédiaire.

---

**Q50 :** Quelle est la recommandation unanime des autorités internationales de cybersécurité (ANSSI, FBI, EUROPOL, NCA) concernant le paiement d'une rançon lors d'une attaque par ransomware ?
- A) Ne jamais payer — Cela finance le cybercrime, ne garantit pas la restauration des données et favorise un reciblage futur
- B) Payer rapidement pour minimiser le temps d'interruption
- C) Négocier puis payer une rançon réduite
- D) Payer uniquement si l'attaquant fournit une preuve de déchiffrement d'un fichier test

**✅ Réponse : A** — Ne jamais payer la rançon est la recommandation unanime de toutes les autorités cyber.

---

## 🏆 Tableau de Score

```
╔══════════════════════════════════════════════════════════════════════╗
║              GRAND EXAMEN — SEMESTRE 5 — RÉSULTATS                   ║
╠══════════════════════════════════════════════════════════════════════╣
║  50 / 50 → 100% — EXCELLENCE (CISSP / OSCP Tier)                     ║
║  45 / 50 →  90% — EXCEPTIONNEL (CEH / CISM Level)                    ║
║  40 / 50 →  80% — TRÈS BON (AWS Security Specialty Level)            ║
║  37 / 50 →  74% — RÉUSSITE MINIMALE (Seuil PARADIS IT : 75%)        ║
║  < 37/50 →  < 74% — À REPASSER (Réviser J201-J249)                  ║
╚══════════════════════════════════════════════════════════════════════╝
```

---

## 🏅 Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **CISSP** | Certified Information Systems Security Professional |
| **OSCP** | Offensive Security Certified Professional |
| **CEH** | Certified Ethical Hacker |
| **CISM** | Certified Information Security Manager |
| **CKS** | Certified Kubernetes Security Specialist |

---

## 📌 Référentiels de Certifications Visés par le Semestre 5

| Certification | Organisme | Domaines Couverts au S5 |
|:---:|:---:|:---|
| **CISSP** | (ISC)² | Gouvernance (J233), Crypto (J242), Conformité (J244), DRP (J238) |
| **OSCP** | OffSec | Red Team Cloud (J229), Container Escape (J231), Golden SAML (J239) |
| **CISM** | ISACA | NIST CSF (J233), ISO 27001 (J244), Crisis Management (J249) |
| **AWS Security Specialty** | Amazon | IAM PrivEsc (J229), IMDSv2 (J227), Nitro Enclaves (J248) |
| **CKS** | CNCF | Seccomp/AppArmor (J241), Falco (J231), OPA Gatekeeper (J231) |
| **AI Security** | Divers | LLM Sec (J236), Adversarial ML (J247), Privacy DP (J246) |

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
