# TOME P8 — Blue Team, SOC & SIEM Advanced — Jour 390 (6h) : Grand Examen de Synthèse du Semestre 8 (50 QCM — Blue Team, Threat Hunting, DFIR, GRC, Cloud, Red Team & AI Cyber Certification)

> [!NOTE]
> **Objectif du jour :** Évaluer et certifier l'ensemble des connaissances théoriques, méthodologiques et pratiques acquises tout au long du **Semestre 8 (Blue Team, SOC & SIEM Advanced)**. Cet examen comporte **50 questions QCM d'élite** couvrant l'intégralité du programme : SOC Ops, SIEM, SOAR, Threat Intel (STIX/TAXII), EDR/NDR, Zero Trust, Threat Hunting (PEAK), Active Directory Security, Cloud SOC, DFIR (Volatility 3, NTFS MFT, Registre, PCAP), Malware Analysis, Ransomware IR, Purple Team (TIBER-EU), GRC (ISO 27001, RGPD/NIS2, FAIR), Red Team C2/AD/Web/Cloud, DevSecOps (SLSA/SBOM), Container Security (Falco eBPF) et AI/LLM Security.
>
> **Score de réussite obligatoire : 75% (38/50 bonnes réponses).**

---

## 📋 Banque Complète de 50 Questions (QCM)

### Section 1 — SOC, SIEM & SOAR Automation (Questions 1 à 7)

**Q1 :** Dans un SOC d'entreprise, quelle est la fonction principale d'un système **SOAR** (Security Orchestration, Automation and Response) ?
- A) Exécuter des playbooks d'orchestration multi-outils pour automatiser la qualification et le confinement des incidents en réduisant le MTTR
- B) Remplacer les commutateurs réseau du datacenter
- C) Stocker les sauvegardes physiques sur bande
- D) Compiler le code source des applications

**Q2 :** Quel est le standard ouvert JSON (spécifié par OASIS) servant à modéliser et structurer le renseignement sur les menaces (Threat Intel) ?
- A) STIX 2.1
- B) HTML5
- C) CSV
- D) YAML 1.2

**Q3 :** Quel protocole applicatif web (utilisant HTTPS/REST) assure le transport sécurisé des objets STIX 2.1 entre serveurs CTI ?
- A) TAXII 2.1
- B) SFTP
- C) SNMPv3
- D) MQTT

**Q4 :** Lors d'un isolement réseau déclenché par un agent **EDR**, quel trafic réseau doit obligatoirement être maintenu ouvert ?
- A) Le canal de communication chiffré entre l'agent EDR local et sa console de management Cloud
- B) Le trafic web HTTP non chiffré
- C) Les flux de messagerie instantanée
- D) Le protocole FTP anonyme

**Q5 :** Dans une analyse statistique NDR, quelle métrique sur les intervalles de connexion ($\Delta t$) trahit la présence d'un signal de **C2 Beaconing** ?
- A) Une faible variance ($\sigma^2$) et un écart-type très réduit entre les temps d'appel successifs
- B) Une variance très élevée
- C) Une taille de paquet supérieure à 10 Mo
- D) L'utilisation exclusive d'adresses IP privées

**Q6 :** Dans l'architecture Zero Trust (NIST SP 800-207), quel composant est responsable d'évaluer le contexte et de prendre la décision d'accorder ou refuser l'accès ?
- A) Le Policy Decision Point (PDP)
- B) Le Policy Enforcement Point (PEP)
- C) Le serveur DHCP
- D) Le répartiteur de charge (Load Balancer)

**Q7 :** Pourquoi la méthode d'authentification **FIDO2 / WebAuthn** est-elle qualifiée de "Phishing-Resistant" ?
- A) Parce qu'elle lie cryptographiquement le défi d'authentification au nom de domaine exact (Origin) du site web, rendant les attaques par proxy de phishing (AiTM) inopérantes
- B) Parce qu'elle envoie un code par SMS
- C) Parce qu'elle ne nécessite aucun matériel
- D) Parce qu'elle utilise un mot de passe de 8 caractères

---

### Section 2 — Threat Hunting & Active Directory Security (Questions 8 à 14)

**Q8 :** Dans le framework de Threat Hunting **PEAK**, quelle est la première étape d'une session de chasse guidée ?
- A) La formulation d'une hypothèse de chasse basée sur la Threat Intel ou les TTPs MITRE ATT&CK
- B) La suppression des logs SIEM
- C) Le formatage du disque dur
- D) Le redémarrage des routeurs

**Q9 :** Quel événement Windows Security (`Event ID`) et quelle présence d'attributs sont caractéristiques d'une attaque par **DCSync** ?
- A) Event ID 4662 avec les GUIDs de réplication `DS-Replication-Get-Changes` émis par une IP qui n'est pas un contrôleur de domaine
- B) Event ID 4624 (Logon réussi)
- C) Event ID 1102 (Log effacé)
- D) Event ID 4688 (Processus créé)

**Q10 :** Pourquoi les attaquants sollicitent-ils des billets TGS chiffrés en **RC4-HMAC (0x17)** lors d'une attaque par **Kerberoasting** ?
- A) Parce que le hash RC4 d'un compte de service est nettement plus rapide et facile à craquer hors-ligne par force brute que l'AES-256
- B) Parce que le RC4 est le protocole le plus récent
- C) Parce que cela masque l'adresse IP
- D) C'est une obligation du protocole LDAP

**Q11 :** Comment fonctionne l'attaque **Shadow Credentials** sur un objet Active Directory ?
- A) L'attaquant injecte une clé publique RSA dans l'attribut `msDS-KeyCredentialLink` pour obtenir des TGTs Kerberos sans modifier le mot de passe cible
- B) Il efface le compte utilisateur
- C) Il modifie le registre local du poste
- D) Il envoie un mail de phishing

**Q12 :** Quel journal Cloud AWS enregistre l'ensemble des appels API effectués sur un compte AWS ?
- A) AWS CloudTrail
- B) AWS CloudWatch
- C) AWS Route53
- D) AWS VPC Flow Logs

**Q13 :** Quel événement CloudTrail indique qu'un attaquant tente de créer une clé d'accès statique pour maintenir son accès ?
- A) `CreateAccessKey`
- B) `ConsoleLogin`
- C) `DescribeInstances`
- D) `GetObject`

**Q14 :** Dans Azure Entra ID, que signale l'événement `"Update application – Certificates and secrets management"` sur un Service Principal ?
- A) L'injection d'une clé secrète ou d'un certificat sur une application registrée pour obtenir une persistance administrative invisible
- B) La mise à jour de l'antivirus
- C) Le changement de mot de passe d'un utilisateur
- D) La création d'un groupe d'utilisateurs

---

### Section 3 — DFIR & Forensic Analysis (Questions 15 à 22)

**Q15 :** Dans Volatility 3, quel plugin est utilisé pour détecter les pages mémoire dotées de permissions `PAGE_EXECUTE_READWRITE` (RWX) et contenant des en-têtes `MZ` ?
- A) `windows.malfind`
- B) `windows.info`
- C) `windows.netscan`
- D) `windows.pslist`

**Q16 :** Selon la RFC 3227, quel artefact forensique est le plus volatil et doit être collecté en premier lors d'une intervention de Live Response ?
- A) La mémoire RAM
- B) Le disque dur interne
- C) Les bandes de sauvegarde
- D) Le fichier de configuration du routeur

**Q17 :** Quelle comparaison différentielle d'attributs $MFT NTFS permet de détecter une falsification d'horodatage (**Timestomping**) ?
- A) Si la date de création dans `$STANDARD_INFORMATION` ($SI) est antérieure à la date de création dans `$FILE_NAME` ($FN)
- B) Si la taille du fichier est nulle
- C) Si le nom du fichier est en minuscules
- D) Si l'extension du fichier est `.exe`

**Q18 :** Quel journal NTFS conserve l'historique continu des opérations de suppression et de renommage de fichiers ?
- A) Le USN Journal (`$UsnJrnl::$J`)
- B) Le fichier hosts
- C) Le registre SAM
- D) Le cache DNS

**Q19 :** Dans quelle ruche du registre Windows l'artefact **UserAssist** (obfusqué en ROT13) est-il conservé ?
- A) `NTUSER.DAT`
- B) `SYSTEM`
- C) `SAM`
- D) `SOFTWARE`

**Q20 :** Quelle ruche du registre Windows contient la base de données **Amcache.hve** fournissant les empreintes SHA1 des binaires exécutés ?
- A) `C:\Windows\AppCompat\Programs\Amcache.hve`
- B) `C:\Windows\System32\config\SAM`
- C) `C:\Users\Default\NTUSER.DAT`
- D) `C:\Windows\System32\drivers\etc`

**Q21 :** Quelle variable d'environnement permet d'exporter les clés de session TLS pour déchiffrer un trafic HTTPS dans TShark / Wireshark ?
- A) `SSLKEYLOGFILE`
- B) `PATH`
- C) `HTTP_PROXY`
- D) `TEMP`

**Q22 :** Quelle commande TShark permet d'exporter tous les objets HTTP transmis dans une capture PCAP ?
- A) `tshark -r capture.pcap --export-objects "http,./extracted_files/"`
- B) `tshark -r capture.pcap --delete`
- C) `tshark -r capture.pcap --convert`
- D) `tshark --clean`

---

### Section 4 — Malware Analysis, Ransomware & Purple Team (Questions 23 à 31)

**Q23 :** Dans la table d'importation (IAT) d'un binaire PE, que signale la combinaison `VirtualAllocEx` + `WriteProcessMemory` + `CreateRemoteThread` ?
- A) Une capacité d'injection de code dans un processus distant (Process Injection)
- B) Une sauvegarde de fichier
- C) Une impression de document
- D) Une défragmentation de disque

**Q24 :** Une section PE présentant une entropie de Shannon de **7.8** indique que la section est :
- A) Compressée ou chiffrée (Packed/Encrypted)
- B) Composée uniquement de zéro
- C) Rédigée en texte clair ASCII
- D) Corrompue et inutilisable

**Q25 :** Quel est l'intérêt de l'**Import Hash (ImpHash)** lors de l'analyse statique d'échantillons malveillants ?
- A) Permettre le regroupement (clustering) des variantes d'une même famille de malwares partageant la même table d'importation IAT
- B) Déchiffrer les fichiers chiffrés par un ransomware
- C) Supprimer le virus du disque
- D) Modifier les droits administrateurs

**Q26 :** Quel mécanisme permet à une sandbox automatisée (Cuckoo/CAPE) d'intercepter les appels API Windows effectués par un binaire pendant son exécution ?
- A) L'injection d'une DLL de surveillance (DLL Hooking) dans le processus analysé
- B) La lecture du code source
- C) Un scan antivirus passif
- D) Une requête SQL sur le registre

**Q27 :** Pourquoi la réécriture des premiers octets de `ntdll.dll` en mémoire (**EDR Unhooking**) est-elle tentée par les loaders malveillants ?
- A) Pour supprimer les crochets (hooks) insérés par l'agent EDR et exécuter les appels système sans être intercepté par l'EDR en usermode
- B) Pour accélérer la vitesse de téléchargement
- C) Pour changer la résolution de l'écran
- D) Pour effacer le disque dur

**Q28 :** Quelle est la première mesure de confinement à appliquer lors de la détection active d'un Ransomware sur le réseau ?
- A) Isoler immédiatement le segment réseau concerné du reste de l'infrastructure
- B) Payer la rançon
- C) Redémarrer les serveurs
- D) Formater les postes non infectés

**Q29 :** Dans la règle de sauvegarde 3-2-1 anti-ransomware, que signifie le "1" final ?
- A) Conserver au moins 1 copie des sauvegardes hors-ligne (air-gapped) ou immuable (WORM/Object Lock)
- B) Avoir 1 seul administrateur
- C) Réaliser 1 sauvegarde par an
- D) Stocker les données sur 1 seule clé USB

**Q30 :** Quel est l'objectif principal d'un exercice **Purple Team** par rapport à un Pentest classique ?
- A) Évaluer et corriger en temps réel les lacunes de détection et de réponse du SOC face à des TTPs d'attaque réelles
- B) Trouver le maximum de failles web en un minimum de temps
- C) Remplacer l'équipe d'audit externe
- D) Rédiger un contrat d'assurance cyber

**Q31 :** Quel cadre européen régit les exercices de Red Teaming guidés par la Threat Intelligence pour le secteur financier ?
- A) TIBER-EU
- B) SOX
- C) HIPAA
- D) PCI-DSS v4.0

---

### Section 5 — GRC, Governance & Cloud Security (Questions 32 à 38)

**Q32 :** Combien de contrôles de sécurité sont répertoriés dans l'**Annexe A** révisée de la norme **ISO 27001:2022** ?
- A) 93 contrôles regroupés en 4 thèmes
- B) 114 contrôles regroupés en 14 domaines
- C) 50 contrôles
- D) 200 contrôles

**Q33 :** Dans le modèle de quantification du risque **FAIR**, quelle est la formule de calcul de l'**ALE (Annual Loss Expectancy)** ?
- A) $ALE = ARO \times (EF \times AV)$
- B) $ALE = AV + ARO$
- C) $ALE = AV / EF$
- D) $ALE = ARO \times 100$

**Q34 :** Quel est le délai légal maximal pour notifier la **CNIL** d'une violation de données personnelles selon l'article 33 du RGPD ?
- A) 72 heures après en avoir pris connaissance
- B) 24 heures
- C) 7 jours
- D) 30 jours

**Q35 :** Quel est le délai d'alerte précoce (**Early Warning**) exigé par la Directive **NIS2** auprès de l'ANSSI en cas d'incident significatif ?
- A) 24 heures
- B) 72 heures
- C) 7 jours
- D) 30 jours

**Q36 :** Quel service natif AWS est spécialisé dans le **CSPM (Cloud Security Posture Management)** et centralise les règles de conformité CIS Benchmark ?
- A) AWS Security Hub
- B) AWS EC2
- C) AWS S3
- D) AWS IAM

**Q37 :** Dans AWS Organizations, quel mécanisme permet d'appliquer des politiques de sécurité bloquantes de manière descendante sur tous les comptes enfants ?
- A) Service Control Policies (SCPs)
- B) VPC Peering
- C) Route Tables
- D) IAM Roles

**Q38 :** Quel est le rôle d'un **Tableau de Bord CISO Executive** présenté au Conseil d'Administration ?
- A) Traduire la posture de cybersécurité et les risques en indicateurs financiers (ALE) et décisionnels orientés business
- B) Lister l'ensemble des IP bloquées par le pare-feu
- C) Afficher le code source des règles YARA
- D) Présenter les bulletins de salaire de l'équipe IT

---

### Section 6 — Red Team Operations & Advanced Attacks (Questions 39 à 44)

**Q39 :** Dans une infrastructure C2 professionnelle, quel est le rôle d'un **Redirecteur** ?
- A) Masquer l'adresse IP réelle du Teamserver C2 pour empêcher la contre-investigation et l'attribution par la Blue Team
- B) Rediriger le trafic Wi-Fi des utilisateurs
- C) Augmenter la vitesse du processeur
- D) Stocker les logs d'événements Windows

**Q40 :** Quelle technique d'évasion réseau exploite l'infrastructure d'un CDN légitime pour masquer la destination réelle des flux C2 ?
- A) Domain Fronting
- B) DNS Spoofing
- C) ARP Poisoning
- D) IP Spoofing

**Q41 :** Quel outil basé sur un graphe Neo4j est la référence pour cartographier les chemins de privilèges et de compromission dans Active Directory ?
- A) BloodHound
- B) Wireshark
- C) Nmap
- D) Burp Suite

**Q42 :** Quelle permission IAM AWS permet à un utilisateur non-privilégié d'attribuer un rôle IAM administrateur à une nouvelle instance EC2 et de s'élever administrateur ?
- A) `iam:PassRole` combiné avec `ec2:RunInstances`
- B) `s3:ListBucket`
- C) `cloudtrail:LookupEvents`
- D) `aws-portal:ViewBilling`

**Q43 :** Quelle vulnérabilité Web permet à un attaquant d'interroger le service de métadonnées interne Cloud (**IMDS 169.254.169.254**) depuis le serveur web ?
- A) SSRF (Server-Side Request Forgery)
- B) XSS (Cross-Site Scripting)
- C) CSRF (Cross-Site Request Forgery)
- D) SQL Injection

**Q44 :** Quel est l'impact d'une vulnérabilité de type **SSTI (Server-Side Template Injection)** exploitée avec succès ?
- A) L'exécution de code arbitraire à distance (RCE) sur le serveur
- B) Le changement de couleur du logo du site
- C) La fermeture de la session de l'utilisateur
- D) L'affichage d'un message d'erreur HTTP 404

---

### Section 7 — DevSecOps, K8s & AI Security (Questions 45 à 50)

**Q45 :** Quel niveau du framework **SLSA** exige une revue du code par deux pairs distincts et un environnement de build hermétique et isolé ?
- A) SLSA Level 4
- B) SLSA Level 1
- C) SLSA Level 2
- D) SLSA Level 0

**Q46 :** Quel outil du projet Sigstore permet de signer et de vérifier la provenance des images de conteneurs OCI ?
- A) Cosign
- B) Docker Desktop
- C) Git
- D) Jenkins

**Q47 :** Pourquoi la technologie **eBPF** (utilisée par Falco) est-elle supérieure aux solutions usermode pour la sécurité Runtime de Kubernetes ?
- A) Parce qu'elle s'exécute directement au niveau du noyau Linux (Kernelmode) pour capturer les appels système sans dépendre de l'espace utilisateur du conteneur
- B) Parce qu'elle ne nécessite aucun système d'exploitation
- C) Parce qu'elle fonctionne uniquement sur macOS
- D) Parce qu'elle remplace les sauvegardes

**Q48 :** Quel paramètre de `securityContext` dans un manifeste Pod Kubernetes présente le risque maximal de **Container Escape** ?
- A) `privileged: true`
- B) `readOnlyRootFilesystem: true`
- C) `runAsNonRoot: true`
- D) `allowPrivilegeEscalation: false`

**Q49 :** Quelle vulnérabilité du OWASP Top 10 for LLM (LLM01) consiste à manipuler les consignes d'un modèle d'IA pour contourner ses règles de sécurité ?
- A) Prompt Injection
- B) SQL Injection
- C) Buffer Overflow
- D) Insecure Deserialization

**Q50 :** Quel est le rôle d'un **Output Guardrail** dans une application intégrant un Modèle de Langage (LLM) ?
- A) Inspecter et assainir la réponse textuelle générée par l'IA avant son affichage afin de masquer les fuites de données sensibles (PII, secrets, clés API)
- B) Accélérer la vitesse de génération des tokens
- C) Réduire le coût de l'abonnement API
- D) Bloquer l'accès des utilisateurs non enregistrés

---

## 🔑 Corrigé Officiel & Clé de Validation

| Q# | Rép. | Explication Technique / Justification |
|:---:|:---:|:---|
| **1** | **A** | Le SOAR orchestre graphiquement la réponse multi-outils pour automatiser le triage et le confinement (MTTR). |
| **2** | **A** | STIX 2.1 est le standard OASIS basé sur JSON pour modéliser les objets CTI. |
| **3** | **A** | TAXII 2.1 est le protocole applicatif REST/HTTPS de transport des objets STIX. |
| **4** | **A** | L'isolation EDR doit maintenir le canal chiffré vers sa console Cloud pour permettre les investigations à distance. |
| **5** | **A** | Le C2 Beaconing se caractérise par des intervalles récurrents à très faible variance statistique ($\sigma^2$). |
| **6** | **A** | Le Policy Decision Point (PDP) évalue les règles Zero Trust et prend la décision d'accès. |
| **7** | **A** | FIDO2 lie le défi cryptographique au nom de domaine exact (Origin), rendant le Phishing AiTM inopérant. |
| **8** | **A** | La méthode PEAK débute par la formulation d'une hypothèse de chasse basée sur la CTI/ATT&CK. |
| **9** | **A** | Le DCSync génère l'Event ID 4662 avec les GUIDs de réplication `Get-Changes` depuis une IP non-DC. |
| **10** | **A** | Les tickets Kerberos chiffrés en RC4-HMAC (0x17) sont beaucoup plus rapides à briser hors-ligne par force brute. |
| **11** | **A** | Shadow Credentials injecte une clé RSA dans `msDS-KeyCredentialLink` pour obtenir des TGTs via PKINIT. |
| **12** | **A** | AWS CloudTrail enregistre l'ensemble des appels API effectués sur un compte AWS. |
| **13** | **A** | `CreateAccessKey` enregistre la création de clés IAM pour maintenir un accès persistant. |
| **14** | **A** | Cet événement Entra ID signale l'injection d'un secret/certificat sur un Service Principal pour créer une porte dérobée. |
| **15** | **A** | `windows.malfind` repère les plages mémoire VAD avec permissions RWX et en-têtes MZ (injection de code). |
| **16** | **A** | La mémoire RAM et les registres CPU sont les éléments les plus volatils (RFC 3227) à capturer d'abord. |
| **17** | **A** | Le Timestomping altère `$STANDARD_INFORMATION` mais laisse la vraie date système dans `$FILE_NAME`. |
| **18** | **A** | Le USN Journal (`$UsnJrnl::$J`) trace l'historique continu des opérations de suppression et renommage NTFS. |
| **19** | **A** | La clé UserAssist (obfusquée en ROT13) se trouve dans la ruche utilisateur `NTUSER.DAT`. |
| **20** | **A** | `Amcache.hve` est situé dans `C:\Windows\AppCompat\Programs\Amcache.hve`. |
| **21** | **A** | `SSLKEYLOGFILE` permet d'exporter les clés symétriques TLS pour le déchiffrement dans TShark/Wireshark. |
| **22** | **A** | `--export-objects "http,..."` extrait l'ensemble des payloads transmis via HTTP. |
| **23** | **A** | Cette séquence IAT trahit une capacité d'injection de code dans un processus distant. |
| **24** | **A** | Une entropie > 7.0 (max 8.0) indique un binaire compressé ou chiffré (Packed/Encrypted). |
| **25** | **A** | L'ImpHash (MD5 de l'IAT) permet de cluster les familles de malwares malgré les recompilations. |
| **26** | **A** | Les sandboxes injectent une DLL de monitoring pour intercepter (hooker) les appels API en mémoire. |
| **27** | **A** | L'EDR Unhooking écrase les crochets usermode de `ntdll.dll` pour réexécuter des syscalls directs non surveillés. |
| **28** | **A** | L'isolement réseau immédiat du segment concerné stoppe la propagation latérale SMB/RPC. |
| **29** | **A** | Le "1" de la règle 3-2-1 exige au moins 1 copie de sauvegarde hors-ligne (air-gapped) ou immuable (WORM). |
| **30** | **A** | Le Purple Team réunit Red et Blue pour tester et corriger en temps réel la couverture de détection. |
| **31** | **A** | TIBER-EU est le cadre réglementaire européen de Red Teaming guidé par la Threat Intelligence. |
| **32** | **A** | L'Annexe A révisée d'ISO 27001:2022 répertorie 93 contrôles regroupés en 4 thèmes. |
| **33** | **A** | Dans FAIR, l'ALE s'obtient en multipliant la fréquence $ARO$ par la perte unique $SLE = EF \times AV$. |
| **34** | **A** | L'article 33 du RGPD fixe un délai maximal de 72h pour notifier la CNIL d'une violation de données. |
| **35** | **A** | NIS2 exige un "Early Warning" initial auprès de l'ANSSI dans les 24h suivant la découverte d'un incident. |
| **36** | **A** | AWS Security Hub rassemble la gestion de la posture de sécurité (CSPM) et les benchmarks CIS. |
| **37** | **A** | Les SCPs (Service Control Policies) imposent des règles de sécurité bloquantes sur toute l'organisation AWS. |
| **38** | **A** | Le tableau de bord CISO Executive traduit le risque cyber en valeur financière (ALE) et enjeux métiers. |
| **39** | **A** | Les redirecteurs C2 masquent l'IP du Teamserver réel pour éviter l'attribution et l'analyse Blue Team. |
| **40** | **A** | Le Domain Fronting détourne l'infrastructure d'un CDN légitime pour camoufler le trafic C2. |
| **41** | **A** | BloodHound cartographie les chemins d'attaque et privilèges Active Directory sous forme de graphe Neo4j. |
| **42** | **A** | `iam:PassRole` + `ec2:RunInstances` permet d'attribuer un rôle administrateur à une nouvelle instance contrôlée. |
| **43** | **A** | Une vulnérabilité SSRF permet d'interroger l'endpoint interne Metadata (`169.254.169.254`) pour voler des clés IAM. |
| **44** | **A** | Le SSTI permet d'injecter du code dans le moteur de template et d'obtenir l'exécution de code (RCE). |
| **45** | **A** | Le niveau SLSA 4 exige une revue du code par deux pairs et un environnement de build hermétique et isolé. |
| **46** | **A** | Cosign (projet Sigstore) est l'outil standard pour signer et vérifier cryptographiquement les conteneurs OCI. |
| **47** | **A** | eBPF s'exécute dans le noyau (Kernelmode), rendant l'interception des syscalls insensible aux évats usermode. |
| **48** | **A** | `privileged: true` donne au conteneur l'accès direct aux périphériques et capacités du nœud hôte (Escape risk). |
| **49** | **A** | La Prompt Injection (OWASP LLM01) manipule les consignes du modèle pour contourner ses règles de sécurité. |
| **50** | **A** | Les Output Guardrails analysent et assainissent la réponse du modèle avant affichage pour éviter la fuite de secrets. |

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
