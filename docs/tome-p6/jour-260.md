# TOME P6 — Cybersécurité Expert & Red Team Avancé — Jour 260 (6h) : Projet Intégrateur S6 Partie 2 — Synthèse & Évaluation Globale (Examen Pratique Multi-Domaines, Matrix de Compétences S6 & Bilan Master 1)

> [!NOTE]
> **Objectif du jour :** Valider l'ensemble des acquis techniques du **Semestre 6 (J251-J259)** à travers un **examen de synthèse de 20 questions à choix multiples complexes** et un **projet de rétro-ingénierie d'architecture hybride (Web, AD, K8s, Mobile, CTI, Wireless)** marquant la fin du Cycle Master 1 (Semestres 5 & 6).
>
> **Ce projet valide l'aptitude opérationnelle globale de l'apprenant à intervenir en tant que Red Team Operator, Cloud Security Engineer ou Lead Pentester dans n'importe quelle organisation internationale.**

---

## 1) Module — Matrice de Synthèse des Compétences du Semestre 6 (2h)

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                      MATRICE DE COMPÉTENCES EXPERT — SEMESTRE 6                         │
├───────────────────────┬──────────────────────────────────┬──────────────────────────────┤
│ Domaine               │ Compétences Techniques           │ Certifications Associées     │
├───────────────────────┼──────────────────────────────────┼──────────────────────────────┤
│ Bug Bounty & VDP      │ CVSS 3.1, HackerOne Reporting    │ BBP Hunter, VDP Analyst      │
│ Web Exploitation      │ SSRF-to-RCE, OOB-XXE, HRS, Proto │ BSCP, OSCP+                  │
│ Active Directory      │ DCSync, Shadow Creds, ADCS ESC1  │ CRTO, CRTE                   │
│ Reverse Mobile        │ Frida Hooking, SSL Pinning Bypass│ OWASP MASTG                  │
│ Kubernetes Security   │ etcd Encryption, OPA Gatekeeper  │ CKS                          │
│ Threat Intelligence   │ OpenCTI, STIX 2.1, Diamond Model │ GCTI                         │
│ Modern APIs           │ GraphQL Introspection, gRPC      │ API Security Certified       │
│ Wireless & IoT        │ PMKID Attack, BLE GATT Hacking   │ OSWP                         │
└───────────────────────┴──────────────────────────────────┴──────────────────────────────┘
```

---

## 2) Module — Examen Pratique & Évaluation Globale S6 (20 QCM Corrigés) (3h)

**Q01 :** Quelle est la commande `certipy` permettant d'identifier les templates d'authentification ADCS vulnérables à l'escalade de privilèges ESC1 ?
- A) `certipy find -vulnerable`
- B) `certipy req`
- C) `certipy auth`
- D) `certipy shadow`
- **✅ Réponse : A**

**Q02 :** Dans l'attaque PMKID Wi-Fi, quel attribut du paquet EAPOL RSN est capturé et cracké sans nécessiter de client connecté ?
- A) Le champ PMKID émis par le point d'accès dans la trame 1/4 du handshake
- B) Le mot de passe WPA en clair
- C) L'adresse IP du routeur
- D) Le certificat SSL du portail captif
- **✅ Réponse : A**

**Q03 :** Quel paramètre sysctl ou manifest Kubernetes contrôle le chiffrement des Secrets at rest dans etcd ?
- A) `EncryptionConfiguration` avec le provider `aescbc` ou `secretbox`
- B) `kubelet.conf`
- C) `etcd.service --tls`
- D) `sysctl net.ipv4.ip_forward`
- **✅ Réponse : A**

**Q04 :** Quel objet STIX 2.1 permet de relier deux entités STIX (ex: un ThreatActor et un Indicator) ?
- A) Relationship (SRO)
- B) Bundle
- C) Domain Object
- D) Observable
- **✅ Réponse : A**

**Q05 :** Quelle méthode de l'API OkHttp3 Android doit être neutralisée via Frida pour contourner l'épinglage de certificat (SSL Pinning) ?
- A) `CertificatePinner.check()`
- B) `HttpClient.execute()`
- C) `URL.openConnection()`
- D) `Socket.connect()`
- **✅ Réponse : A**

**Q06 :** Dans une attaque HTTP Request Smuggling de type **CL.TE**, comment le front-end et le back-end interprètent-ils les entêtes de longueur ?
- A) Le front-end utilise `Content-Length`, le back-end utilise `Transfer-Encoding: chunked`
- B) Les deux utilisent Content-Length
- C) Le front-end utilise TE, le back-end utilise CL
- D) Aucun n'utilise Content-Length
- **✅ Réponse : A**

**Q07 :** Quelle vulnérabilité GraphQL se produit lorsqu'un serveur accepte des requêtes imbriquées sans limite de profondeur, causant une déni de service (DoS) du processeur ?
- A) Circular Query / Deeply Nested Query DoS
- B) BOLA
- C) SQL Injection
- D) Cross-Site Scripting
- **✅ Réponse : A**

**Q08 :** Quel protocole est utilisé par les objets connectés IoT (ex: serrure connectée) pour exposer leurs Services et Caractéristiques en Bluetooth Low Energy ?
- A) GATT (Generic Attribute Profile)
- B) HTTP/2
- C) MQTT
- D) CoAP
- **✅ Réponse : A**

**Q09 :** Dans l'attaque **Shadow Credentials** Active Directory, quel attribut d'un compte utilisateur est modifié pour ajouter la clé publique de l'attaquant ?
- A) `msDS-KeyCredentialLink`
- B) `userPassword`
- C) `sAMAccountName`
- D) `memberOf`
- **✅ Réponse : A**

**Q10 :** Quelle option de la commande `protoc` permet de décompiler un binaire Protobuf gRPC sans fichier `.proto` d'origine ?
- A) `--decode_raw`
- B) `--decompile`
- C) `--export-json`
- D) `--unpack`
- **✅ Réponse : A**

**Q11 :** Quel outil open-source CNCF est utilisé comme moteur de politique déclaratif avec le langage Rego dans Kubernetes ?
- A) OPA Gatekeeper
- B) Falco
- C) Trivy
- D) Cilium
- **✅ Réponse : A**

**Q12 :** Dans le Diamond Model, quel nœud représente la cible de l'attaque (systèmes, organisation, secteur d'activité) ?
- A) Victim
- B) Adversary
- C) Infrastructure
- D) Capability
- **✅ Réponse : A**

**Q13 :** Quel est le délai standard accordé aux organisations dans la politique de divulgation responsable (Coordinated Disclosure) pour corriger une vulnérabilité avant sa publication ?
- A) 90 jours
- B) 24h
- C) 1 an
- D) 30 jours
- **✅ Réponse : A**

**Q14 :** Quelle attaque sur WPA3 SAE exploite des canaux cachés (side-channel) pour déduire la clé de passe réseau ?
- A) Dragonblood
- B) KRACK
- C) PMKID
- D) BlueBorne
- **✅ Réponse : A**

**Q15 :** Quel outil d'analyse statique Android décompile un binaire APK directement en code source Java lisible ?
- A) jadx
- B) Wireshark
- C) Burp Suite
- D) Hashcat
- **✅ Réponse : A**

**Q16 :** Quelle permission Active Directory sur l'objet racine du domaine est nécessaire pour exécuter l'attaque **DCSync** ?
- A) `DS-Replication-Get-Changes` ET `DS-Replication-Get-Changes-All`
- B) Domain Admins uniquement
- C) Account Operators
- D) Schema Admins
- **✅ Réponse : A**

**Q17 :** Quel standard de format de données JSON est utilisé par OpenCTI pour structurer son graphe de connaissances sur les menaces ?
- A) STIX 2.1
- B) OpenIOC
- C) YAML
- D) CSV
- **✅ Réponse : A**

**Q18 :** Quel protocole permet d'exécuter un SSRF-to-RCE contre un service Redis interne non authentifié ?
- A) `gopher://`
- B) `https://`
- C) `ftp://`
- D) `ssh://`
- **✅ Réponse : A**

**Q19 :** Quel outil d'automatisation Red Team cartographie graphiquement les chemins d'attaque Active Directory ?
- A) BloodHound
- B) Metasploit
- C) Nmap
- D) Wireshark
- **✅ Réponse : A**

**Q20 :** Quel score CVSS v3.1 minimal déclenche généralement la sévérité CRITIQUE dans un rapport de Bug Bounty ?
- A) 9.0 à 10.0
- B) 7.0 à 8.9
- C) 4.0 à 6.9
- D) 0.1 à 3.9
- **✅ Réponse : A**

---

## 3) Module — Bilan Général du Cycle Master 1 (1h)

```
╔══════════════════════════════════════════════════════════════════════╗
║                   BILAN GENERAL DE FORMATION                         ║
║               MASTER 1 CYBERSÉCURITÉ AVANCÉE (J201-J260)             ║
╠══════════════════════════════════════════════════════════════════════╣
║ Total des leçons Master 1 rédigées : 60 Journées (6h/jour)           ║
║ Total des heures d'apprentissage : 360 Heures d'Expertise            ║
║ Code source & Scripts de laboratoire : 100% Fonctionnels & Commités  ║
║ Projets Intégrateurs validés : 10 Projets Full-Stack                 ║
║ Statut Git Repository : Pushé sur origin/main                        ║
╚══════════════════════════════════════════════════════════════════════╝
```

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
