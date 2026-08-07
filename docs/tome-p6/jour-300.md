# TOME P6 — Cybersécurité Avancée & Red/Blue Team — Jour 300 (6h) : Grand Examen de Synthèse du Semestre 6 & Fin de Master 1 (50 QCM Corrigés — Red Team, EDR Evasion, Cloud, Kubernetes CKS, CTI, PQC, GRC & Master 1 Final Assessment)

> [!NOTE]
> **Objectif du jour :** Évaluer et valider l'intégralité des compétences acquises durant le **Semestre 6 (J251-J299)** et le **Cycle Master 1 (J201-J300)** via un grand examen de synthèse de **50 questions à choix multiples rédigées au niveau des certifications internationales les plus exigeantes (OSCP+, CRTO, CKS, GCTI, CISSP, BSCP, GREM, OSED, CISM)**.

---

## 📋 Conditions d'Examen

| Paramètre | Valeur |
|:---:|:---:|
| Nombre de questions | 50 QCM |
| Durée recommandée | 90 minutes |
| Seuil de réussite | 38/50 (76%) |
| Domaines couverts | J251 à J299 (Ensemble du Semestre 6 & Synthèse Master 1) |

---

## PARTIE 1 — Red Team, Bug Bounty & EDR Evasion (Questions 1 à 15)

**Q01 :** Quel outil open-source permet d'exécuter un DCSync depuis Linux en s'authentifiant via NTLM sur un contrôleur de domaine Active Directory ?
- A) `secretsdump.py` (Impacket)
- B) `psexec.py`
- C) `nmap`
- D) `sqlmap`
- **✅ Réponse : A**

**Q02 :** Dans une attaque ADCS ESC1, quelle mauvaise configuration du template de certificat permet l'escalade vers Domain Admin ?
- A) La permission accordée au demandeur de spécifier un Subject Alternative Name (SAN) arbitraire avec des droits d'enrollment utilisateur
- B) L'utilisation de RSA 2048
- C) L'absence d'adresse IP dans le certificat
- D) La validité de 1 an
- **✅ Réponse : A**

**Q03 :** Quelle fonction de la DLL `amsi.dll` est la cible principale du patching mémoire pour neutraliser l'Antimalware Scan Interface sous Windows ?
- A) `AmsiScanBuffer`
- B) `AmsiInit`
- C) `WinExec`
- D) `CreateProcess`
- **✅ Réponse : A**

**Q04 :** Quel est le principal avantage des Direct System Calls (générés par SysWhispers3) pour un opérateur Red Team ?
- A) Ignorer les crochets en espace utilisateur (user-land hooks) posés par les agents EDR dans les DLLs système
- B) Rendre le fichier plus petit
- C) Supprimer le besoin de réseau
- D) Chiffrer le disque dur
- **✅ Réponse : A**

**Q05 :** Quelle technique de persistance Windows stocke le filtre et le consommateur d'événements sous forme de données dans le dépôt WMI sans aucun binaire sur disque ?
- A) WMI Event Subscription
- B) Service Windows
- C) Tâche planifiée GUI
- D) Fichier `.bat`
- **✅ Réponse : A**

**Q06 :** Dans une attaque HTTP Request Smuggling de type CL.TE, qui du front-end ou du back-end lit le header `Content-Length` ?
- A) Le front-end lit Content-Length, le back-end lit Transfer-Encoding
- B) Les deux lisent Transfer-Encoding
- C) Le back-end uniquement
- D) Aucun des deux
- **✅ Réponse : A**

**Q07 :** Quel protocole URI permet d'envoyer des commandes brutes à un service Redis interne via une vulnérabilité SSRF ?
- A) `gopher://`
- B) `http://`
- C) `ftp://`
- D) `file://`
- **✅ Réponse : A**

**Q08 :** Quel outil (combinaison de jadx + Frida) est la référence pour l'analyse statique et dynamique des APK Android selon l'OWASP MASTG ?
- A) jadx pour la décompilation Java + Frida pour le hooking dynamique
- B) Nmap + Wireshark
- C) Ghidra + OllyDbg
- D) Burp Suite uniquement
- **✅ Réponse : A**

**Q09 :** Dans l'attaque PMKID contre les réseaux Wi-Fi WPA2/WPA3, quel est l'avantage majeur par rapport au 4-way handshake ?
- A) Elle s'exécute directement contre l'Access Point sans aucun client connecté au réseau
- B) Elle déchiffre le mot de passe sans dictionnaire
- C) Elle ne nécessite pas de carte Wi-Fi
- D) Elle fonctionne en Bluetooth
- **✅ Réponse : A**

**Q10 :** Quel attribut d'objet Active Directory est modifié lors d'une attaque **Shadow Credentials** pour permettre une authentification Kerberos PKINIT ?
- A) `msDS-KeyCredentialLink`
- B) `userPassword`
- C) `sAMAccountName`
- D) `memberOf`
- **✅ Réponse : A**

**Q11 :** Quel langage est utilisé dans le framework Cobalt Strike ou Mythic pour personnaliser l'empreinte des requêtes HTTP C2 et imiter du trafic légitime ?
- A) Malleable C2 Profile
- B) C++
- C) Python
- D) HTML
- **✅ Réponse : A**

**Q12 :** Qu'est-ce que le **Domain Fronting** ?
- A) Abuser des CDN de confiance en utilisant un domaine autorisé dans le SNI TLS et un domaine C2 réel dans l'entête Host
- B) Acheter des domaines expirés
- C) Modifier le DNS local
- D) Scanner des ports
- **✅ Réponse : A**

**Q13 :** Quel binaire légitime signé Windows est souvent détourné par les attaquants (LOLBin) pour télécharger un fichier depuis une URL distante via `-urlcache -f` ?
- A) `certutil.exe`
- B) `notepad.exe`
- C) `calc.exe`
- D) `cmd.exe`
- **✅ Réponse : A**

**Q14 :** En exploitation binaire x64, quel registre processeur sous Linux est utilisé pour passer le 1er argument à une fonction système (`system`) ?
- A) `RDI`
- B) `RAX`
- C) `RSP`
- D) `RBX`
- **✅ Réponse : A**

**Q15 :** Dans un binaire paqueté (packed), que représente l'**OEP (Original Entry Point)** ?
- A) L'adresse mémoire du code malveillant d'origine vers laquelle pointe le saut final de l'unpacker
- B) La première ligne du fichier
- C) La clé AES
- D) L'IP du C2
- **✅ Réponse : A**

---

## PARTIE 2 — Cloud, DevSecOps, Kubernetes & CTI (Questions 16 à 30)

**Q16 :** Quel outil open-source multi-cloud (AWS, Azure, GCP) permet d'exécuter des audits de sécurité automatisés basés sur les CIS Benchmarks ?
- A) Prowler (v4)
- B) Wireshark
- C) Metasploit
- D) Volatility
- **✅ Réponse : A**

**Q17 :** Dans Kubernetes, quel composant gère le chiffrement au repos (Encryption at Rest) des Secrets stockés dans `etcd` ?
- A) `EncryptionConfiguration` sur le `kube-apiserver` avec le provider `aescbc`
- B) `kubelet`
- C) `flannel`
- D) `coredns`
- **✅ Réponse : A**

**Q18 :** Quel langage est utilisé par Open Policy Agent (OPA Gatekeeper) pour rédiger les règles d'admission dans Kubernetes ?
- A) Rego
- B) Python
- C) Go
- D) YAML
- **✅ Réponse : A**

**Q19 :** Quel scanner IaC open-source de Bridgecrew permet d'analyser les templates Terraform, CloudFormation et Helm dans une CI/CD ?
- A) Checkov
- B) Nmap
- C) Ghidra
- D) Slither
- **✅ Réponse : A**

**Q20 :** Dans le standard STIX 2.1, quel objet représente une technique d'attaque spécifique liée à MITRE ATT&CK ?
- A) `attack-pattern`
- B) `indicator`
- C) `malware`
- D) `vulnerability`
- **✅ Réponse : A**

**Q21 :** Quel protocole REST standardisé est utilisé pour échanger de manière automatisée des objets STIX 2.1 entre plateformes CTI ?
- A) TAXII 2.1
- B) HTTP/1.0
- C) FTP
- D) MQTT
- **✅ Réponse : A**

**Q22 :** Quel est le rôle principal d'une plateforme SOAR comme Shuffle ou Cortex XSOAR ?
- A) Orchestrer et automatiser les actions de réponse aux incidents (isolation EDR, blocage firewall) via des playbooks
- B) Compiler du code C++
- C) Stocker des mots de passe en clair
- D) Formater des disques
- **✅ Réponse : A**

**Q23 :** En Threat Hunting, quel indicateur statistique sur les deltas de temps inter-connexions signale la présence d'un C2 Beaconing périodique ?
- A) Une faible variance (écart-type proche de zéro) des deltas de temps inter-requêtes
- B) Une forte variance
- C) Un grand nombre de paquets UDP
- D) Une adresse MAC nulle
- **✅ Réponse : A**

**Q24 :** Dans Volatility 3, quel plugin recherche les pages mémoire exécutables non cartographiées sur disque pour repérer les injections de code ?
- A) `windows.malfind`
- B) `windows.pslist`
- C) `windows.netscan`
- D) `windows.info`
- **✅ Réponse : A**

**Q25 :** Quel token maître Azure AD / Entra ID stocké dans LSASS permet de contourner le MFA et le mot de passe sur tous les services Cloud liés ?
- A) PRT (Primary Refresh Token)
- B) Ticket Kerberos TGT
- C) Token JWT simple
- D) Cookie de session
- **✅ Réponse : A**

**Q26 :** Quelle API AWS STS permet d'effectuer un mouvement latéral d'un compte AWS vers un autre via une relation de confiance IAM ?
- A) `AssumeRole`
- B) `GetCallerIdentity`
- C) `CreateUser`
- D) `ListBuckets`
- **✅ Réponse : A**

**Q27 :** Dans l'OWASP Top 10 for LLM (2023), quelle vulnérabilité survient lorsqu'un document externe analysé par une IA contient des consignes malveillantes masquées ?
- A) Indirect Prompt Injection
- B) Direct Prompt Injection
- C) SQL Injection
- D) XSS
- **✅ Réponse : A**

**Q28 :** Quel framework de NVIDIA permet d'appliquer des garde-fous de sécurité d'entrée/sortie sur des applications basées sur des LLM ?
- A) NeMo Guardrails
- B) CUDA
- C) TensorRT
- D) PyTorch
- **✅ Réponse : A**

**Q29 :** Quel état de la donnée est spécifiquement protégé par les technologies de Confidential Computing (AMD SEV-SNP, Intel SGX) ?
- A) Data in Use (données actives en mémoire RAM pendant le calcul)
- B) Data at Rest
- C) Data in Transit
- D) Data in Archive
- **✅ Réponse : A**

**Q30 :** Quel type de chiffrement avancé permet d'exécuter des additions et multiplications sur des ciphertexts sans les déchiffrer au préalable ?
- A) FHE (Fully Homomorphic Encryption)
- B) AES-GCM
- C) RSA-4096
- D) SHA-256
- **✅ Réponse : A**

---

## PARTIE 3 — Cryptographie, GRC, PQC & OT/IoT (Questions 31 à 50)

**Q31 :** Quel est le standard officiel NIST FIPS 203 dédié à l'échange de clés post-quantique (KEM) ?
- A) ML-KEM (ex-Kyber)
- B) ML-DSA
- C) RSA-2048
- D) AES-256
- **✅ Réponse : A**

**Q32 :** Que désigne la stratégie d'attaque **HNDL (Harvest Now, Decrypt Later)** ?
- A) Intercepter et stocker le trafic chiffré TLS d'aujourd'hui pour le déchiffrer plus tard avec un ordinateur quantique
- B) Voler des mots de passe en clair
- C) Attaquer les bases SQL
- D) Envoyer des spams
- **✅ Réponse : A**

**Q33 :** Dans la phase de transition vers le PQC, quelle approche d'échange de clés combine un algorithme classique (X25519) et un algorithme PQC (ML-KEM) ?
- A) Échange de clés Hybride (Hybrid Key Exchange)
- B) Chiffrement simple
- C) Double hashing MD5
- D) RSA 1024
- **✅ Réponse : A**

**Q34 :** Quelle API C/C++ standard (Cryptoki) est universellement utilisée pour interagir avec des HSM (Hardware Security Modules) d'entreprise ?
- A) PKCS#11
- B) REST API
- C) POSIX
- D) JDBC
- **✅ Réponse : A**

**Q35 :** Quel moteur de HashiCorp Vault fournit un service d'Encryption-as-a-Service sans manipulation de clés par les applications ?
- A) Transit Engine
- B) PKI Engine
- C) KV Engine
- D) AWS Engine
- **✅ Réponse : A**

**Q36 :** Combien d'ateliers successifs comporte la méthode d'analyse de risques EBIOS RM de l'ANSSI ?
- A) 5 ateliers
- B) 3 ateliers
- C) 10 ateliers
- D) 1 atelier
- **✅ Réponse : A**

**Q37 :** Quel est le délai d'alerte précoce (Early Warning) imposé par la directive européenne NIS 2 lors d'un incident significatif ?
- A) 24 heures
- B) 72 heures
- C) 30 jours
- D) 6 mois
- **✅ Réponse : A**

**Q38 :** Quel est le délai maximal imposé par le RGPD (Article 33) pour notifier une violation de données personnelles à la CNIL ?
- A) 72 heures
- B) 24h
- C) 14 jours
- D) 1 mois
- **✅ Réponse : A**

**Q39 :** Quel modèle mathématique garantit que chaque individu partage ses quasi-identifiants avec au moins k-1 autres personnes ?
- A) k-Anonymity
- B) Differential Privacy
- C) AES-256
- D) RSA
- **✅ Réponse : A**

**Q40 :** Quel composant de l'architecture Zero Trust NIST SP 800-207 prend la décision d'accorder ou de refuser un accès ?
- A) PDP (Policy Decision Point)
- B) PEP (Policy Enforcement Point)
- C) SIEM
- D) EDR
- **✅ Réponse : A**

**Q41 :** Quel standard d'identité de workload attribue des URIs `spiffe://...` aux microservices cloud-native ?
- A) SPIFFE / SPIRE
- B) OAuth2
- C) SAML
- D) Kerberos
- **✅ Réponse : A**

**Q42 :** Quelle est la vulnérabilité majeure du protocole industriel Modbus TCP (Port 502) ?
- A) Aucune authentification ni chiffrement natif, permettant la lecture/écriture directe sur les registres PLC
- B) Il nécessite du HTTPS
- C) Il est trop rapide
- D) Il est crypté en AES
- **✅ Réponse : A**

**Q43 :** Dans le Purdue Model des réseaux industriels OT, à quel niveau se situent les automates programmables (PLC) ?
- A) Level 1
- B) Level 4
- C) Level 5
- D) DMZ
- **✅ Réponse : A**

**Q44 :** Quel outil d'analyse permet d'extraire les systèmes de fichiers SquashFS à partir d'un fichier binaire d'image de firmware IoT ?
- A) Binwalk
- B) Wireshark
- C) Nmap
- D) Metasploit
- **✅ Réponse : A**

**Q45 :** Quel protocole télécom de niveau 5G Core (SBA) remplace les anciens protocoles propriétaires par des microservices web ?
- A) HTTP/2 REST API
- B) SS7
- C) Telnet
- D) FTP
- **✅ Réponse : A**

**Q46 :** En 5G SA, quel identifiant chiffré remplace l'IMSI sur les ondes radio pour contrer les IMSI Catchers ?
- A) SUCI (Subscription Concealed Identifier)
- B) IMEI
- C) MAC Address
- D) IP v4
- **✅ Réponse : A**

**Q47 :** Quel organisme international édite les standards de normalisation des télécommandes et de la télémétrie spatiale (CCSDS) ?
- A) CCSDS (Consultative Committee for Space Data Systems)
- B) IEEE
- C) ISO
- D) IETF
- **✅ Réponse : A**

**Q48 :** Quelle vulnérabilité Solidity historique (hack The DAO) survient lorsqu'un contrat transfère des Ether avant de mettre à jour son solde interne ?
- A) Reentrancy (Réentrée)
- B) Overflow
- C) Underflow
- D) BadUSB
- **✅ Réponse : A**

**Q49 :** Quel scanner statique développé par Trail of Bits est la référence d'audit de code Solidity / Smart Contracts ?
- A) Slither
- B) Checkov
- C) Trivy
- D) Semgrep
- **✅ Réponse : A**

**Q50 :** Quelle est la recommandation officielle des autorités (ANSSI, FBI, Europol) concernant le paiement de rançons lors d'une attaque Ransomware ?
- A) Ne jamais payer — Cela entretient le modèle économique du cybercrime et n'assure aucune garantie de restauration
- B) Payer immédiatement
- C) Payer la moitié
- D) Negocier 6 mois
- **✅ Réponse : A**

---

## 🏆 Tableau de Score & Bilan Final Master 1

```
╔══════════════════════════════════════════════════════════════════════╗
║             GRAND EXAMEN FINALE — SEMESTRE 6 & MASTER 1              ║
╠══════════════════════════════════════════════════════════════════════╣
║  50 / 50 → 100% — EXCELLENCE NATIONALE & INTERNATIONALE              ║
║  45 / 50 →  90% — EXCEPTIONNEL (Niveau Senior Lead Cyber)            ║
║  40 / 50 →  80% — TRÈS BON (Niveau Architecte & Specialist)          ║
║  38 / 50 →  76% — SEUIL DE RÉUSSITE MASTER 1 (PARADIS IT)            ║
║  < 38/50 →  < 76% — À REPASSER (Réviser J251-J299)                  ║
╚══════════════════════════════════════════════════════════════════════╝
```

---

## 🏅 Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **M1** | Master 1 — Première année du diplôme de Master (Bac+4) |
| **GCTI** | GIAC Cyber Threat Intelligence — Certification SANS de référence CTI |
| **CKS** | Certified Kubernetes Security Specialist — Certification CNCF Sécurité K8s |

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
