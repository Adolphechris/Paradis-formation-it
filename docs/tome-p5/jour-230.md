# TOME P5 — Cybersécurité Avancée & Red/Blue Team — Jour 230 (6h) : Projet Intégrateur Partie 6 — Architecture Zero Trust Complète BCC (Identity-Centric Security, Micro-Segmentation, ZTNA & Gouvernance des Accès)

> [!NOTE]
> **Objectif du jour :** Concevoir et implémenter une **Architecture Zero Trust (ZTA — Zero Trust Architecture)** complète pour l'infrastructure hybride de la Banque Centrale du Congo (BCC) : intégration des principes **"Never Trust, Always Verify"** à toutes les couches (Identité, Appareils, Réseau, Applications, Données), déploiement d'un **ZTNA (Zero Trust Network Access)** avec **Cloudflare Access**, micro-segmentation réseau avec **Cilium eBPF**, et gouvernance des accès privilégiés avec **CyberArk/Teleport PAM**. Ce projet consolide tous les acquis du Semestre 5 (J201-J229).
>
> **Compétences visées :** `SEC-04` (A) — Zero Trust Architecture Design & Implementation | `PRO-01` (A) — Projet Intégrateur Architecture ZTA Complète BCC — Consolidation Semestre 5

---

## 1) Module — Principes Zero Trust & Architecture BCC (2h)

### 📖 Narration/Intuition

L'ensemble des incidents analysés au Semestre 5 — de l'infiltration du compte "mnbc-worker" (J221) à l'attaque SCADA Modbus (J218), en passant par la faille Reentrancy du Smart Contract MNBC (J219) et l'escalade IAM Cloud (J229) — ont tous une racine commune : **un modèle de sécurité basé sur la confiance implicite** accordée à un utilisateur ou un composant une fois à l'intérieur du réseau de la BCC.

Le paradigme **Zero Trust** répond à cette faiblesse fondamentale avec 7 principes définis dans le **NIST SP 800-207** :

### 🔍 Anatomie Technique

**Les 7 Piliers de l'Architecture Zero Trust (NIST SP 800-207) :**

```
┌────────────────────────────────────────────────────────────────────────────────┐
│                   ARCHITECTURE ZERO TRUST — BCC MNBC                          │
│                      NIST SP 800-207 — "Never Trust, Always Verify"           │
├────────────────────────────────────────────────────────────────────────────────┤
│  PILIER 1 — IDENTITÉS (Identity)                                               │
│  Vérifier TOUTE identité avant tout accès (Humain, Service, Machine)           │
│  ✅ MFA Obligatoire sur tous les comptes | ✅ JIT (Just-in-Time) Privileges    │
│  ✅ PAM CyberArk/Teleport pour les accès privilégiés                          │
├────────────────────────────────────────────────────────────────────────────────┤
│  PILIER 2 — APPAREILS (Devices)                                                │
│  Vérifier la posture de sécurité de chaque appareil AVANT d'autoriser l'accès │
│  ✅ MDM (Mobile Device Management) | ✅ EDR Crowdstrike/SentinelOne            │
│  ✅ Device Trust Certificates (certificats machine x.509)                     │
├────────────────────────────────────────────────────────────────────────────────┤
│  PILIER 3 — RÉSEAU (Networks)                                                  │
│  Micro-segmentation : Aucune confiance basée sur la localisation réseau       │
│  ✅ Cilium eBPF (micro-segmentation Kubernetes) | ✅ ZTNA Cloudflare Access   │
│  ✅ Suppression du VPN traditionnel (périmètre interne non fiable)            │
├────────────────────────────────────────────────────────────────────────────────┤
│  PILIER 4 — APPLICATIONS (Applications)                                        │
│  Authentification & autorisation SYSTÉMATIQUE sur chaque application           │
│  ✅ OIDC/OAuth 2.0 sur toutes les APIs | ✅ mTLS inter-services (Istio)        │
├────────────────────────────────────────────────────────────────────────────────┤
│  PILIER 5 — DONNÉES (Data)                                                     │
│  Chiffrement des données au repos et en transit, classification des données   │
│  ✅ Chiffrement KMS S3/RDS | ✅ DLP (Data Loss Prevention)                    │
│  ✅ AES-256 + PQC Migration (J226)                                            │
├────────────────────────────────────────────────────────────────────────────────┤
│  PILIER 6 — VISIBILITÉ (Visibility & Analytics)                                │
│  Monitoring continu de toutes les transactions et accès                        │
│  ✅ SIEM ELK Stack | ✅ CloudTrail All Regions | ✅ Audit Log immuable         │
├────────────────────────────────────────────────────────────────────────────────┤
│  PILIER 7 — AUTOMATISATION (Automation & Orchestration)                        │
│  Réponse automatisée aux anomalies détectées                                   │
│  ✅ SOAR Cortex XSOAR | ✅ AWS GuardDuty auto-remediation | ✅ Caldera BAS    │
└────────────────────────────────────────────────────────────────────────────────┘
```

---

## 2) Module — Déploiement ZTNA & Micro-Segmentation Cilium (2h)

### 🛠️ Atelier Pratique

**Configuration ZTNA avec Cloudflare Access pour l'API MNBC BCC (`ztna_config.sh`) :**

```bash
# 1. Connecter l'infrastructure BCC à Cloudflare Zero Trust
# Via cloudflared daemon (Tunnel chiffré depuis les serveurs BCC vers Cloudflare)
cloudflared tunnel create bcc-mnbc-tunnel
cloudflared tunnel route dns bcc-mnbc-tunnel api.bcc-mnbc.cd

# Configuration du tunnel (config.yml)
cat << 'EOF' > /etc/cloudflared/config.yml
tunnel: bcc-mnbc-tunnel-uuid
credentials-file: /etc/cloudflared/.credentials.json

ingress:
  - hostname: api.bcc-mnbc.cd
    service: http://localhost:8080
  - hostname: scada.internal.bcc-mnbc.cd
    service: http://192.168.10.100:80
  - service: http_status:404
EOF

# 2. Politique d'accès Zero Trust (Cloudflare Access Policy)
# Via API Cloudflare : Exiger MFA + Device Posture + Email @bcc.cd
cat << 'EOF' > bcc_ztna_policy.json
{
  "name": "BCC MNBC API — Zero Trust Policy",
  "decision": "allow",
  "include": [
    {
      "email_domain": {"domain": "bcc.cd"},
      "group": {"id": "bcc-mnbc-authorized-banks"}
    }
  ],
  "require": [
    {"mfa": {}},
    {"device_posture": {"integration_uid": "crowdstrike-bcc"}},
    {"ip": {"ip": "196.216.0.0/14"}}
  ],
  "exclude": [
    {"ip": {"ip": "185.220.101.47"}}
  ]
}
EOF

echo "✅ ZTNA Cloudflare Access configuré — VPN supprimé, Zero Trust activé"
```

**Micro-Segmentation Kubernetes avec Cilium eBPF (`cilium_policy.yaml`) :**

```yaml
# NetworkPolicy Cilium — Micro-segmentation du namespace mnbc-production
# Règle : La Lambda Settlement peut UNIQUEMENT communiquer avec SQS et DynamoDB
# Toute autre communication est INTERDITE par défaut (Deny-All + Allow-Explicit)

apiVersion: cilium.io/v2
kind: CiliumNetworkPolicy
metadata:
  name: bcc-settlement-isolation
  namespace: mnbc-production
spec:
  endpointSelector:
    matchLabels:
      app: bcc-settlement-lambda
  # EGRESS : Trafic SORTANT autorisé (Whitelist explicite)
  egress:
    - toEndpoints:
        - matchLabels:
            aws-service: sqs
      toPorts:
        - ports:
            - port: "443"
              protocol: TCP
    - toEndpoints:
        - matchLabels:
            aws-service: dynamodb
      toPorts:
        - ports:
            - port: "443"
              protocol: TCP
    - toEndpoints:
        - matchLabels:
            aws-service: secretsmanager
      toPorts:
        - ports:
            - port: "443"
              protocol: TCP
  # INGRESS : Trafic ENTRANT autorisé
  ingress:
    - fromEndpoints:
        - matchLabels:
            app: bcc-api-gateway
      toPorts:
        - ports:
            - port: "8080"
              protocol: TCP
  # TOUT AUTRE TRAFIC EST REFUSÉ PAR DÉFAUT (Zero Trust Network Policy)
```

---

## 3) Module — PAM, Gouvernance des Accès & Consolidation Semestre 5 (2h)

### 🛠️ Atelier Pratique

**Configuration PAM Teleport pour les Accès Privilégiés BCC (`teleport_config.yaml`) :**

```yaml
# /etc/teleport.yaml — Bastion SSH Zero Trust pour la BCC
teleport:
  nodename: bcc-bastion-zt
  data_dir: /var/lib/teleport
  auth_token: "bcc-mnbc-secure-join-token"
  auth_servers: ["teleport.internal.bcc-mnbc.cd:3025"]

auth_service:
  enabled: true
  authentication:
    type: github
    second_factor: on
    webauthn:
      rp_id: "bcc-mnbc.cd"   # FIDO2/WebAuthn — Phishing-Resistant MFA

  # Politique d'accès juste-à-temps (JIT — Just-in-Time)
  # Les accès SSH aux serveurs SCADA et Production ne sont valides que 1h
  access_request_policy:
    - name: scada-jit-access
      roles: [scada-operator]
      max_duration: "1h"    # Accès temporaire 1h maximum
      reviewers: [ciso-bcc]  # Revue obligatoire du CISO avant approbation

ssh_service:
  enabled: true
  labels:
    environment: production
    sensitivity: critical
```

**Tableau de Consolidation — Architecture Zero Trust BCC (Semestre 5 Complet) :**

```markdown
# ARCHITECTURE ZERO TRUST BCC — ÉTAT FINAL APRÈS SEMESTRE 5

| Couche          | Technologie Déployée            | Leçon  | Statut  |
|:---------------:|:--------------------------------|:------:|:-------:|
| Identité/MFA    | FIDO2 WebAuthn + Teleport PAM   | J210   | ✅ OK   |
| Réseau ZTNA     | Cloudflare Access + Cilium eBPF | J230   | ✅ OK   |
| OT/SCADA        | Modbus TLS + IDS Nozomi         | J218   | ✅ OK   |
| IoT Firmware    | Secure Boot + Binwalk SBOM      | J217   | ✅ OK   |
| Smart Contracts | Checks-Effects-Interactions     | J219   | ✅ OK   |
| Cloud AWS       | IMDSv2 + IAM Least Privilege    | J227   | ✅ OK   |
| API Security    | OIDC + Rate Limit + Input Valid.| J224   | ✅ OK   |
| Cryptographie   | PQC Kyber768 + TLS Hybride      | J226   | ✅ OK   |
| DFIR/SOC        | Volatility3 + Plaso + ATT&CK    | J221   | ✅ OK   |
| Threat Modeling | STRIDE + DREAD + DevSecOps      | J228   | ✅ OK   |
| Purple Team     | Caldera BAS + Atomic Red Team   | J223   | ✅ OK   |
| Données         | KMS AES-256 + S3 WORM + DLP     | J229   | ✅ OK   |
```

---

## 🏅 Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **ZTA** | Zero Trust Architecture — Architecture de sécurité basée sur le principe de confiance zéro |
| **ZTNA** | Zero Trust Network Access — Accès réseau selon les principes Zero Trust (remplacement du VPN) |
| **PAM** | Privileged Access Management — Gestion des accès privilégiés (ex: Teleport, CyberArk) |
| **JIT** | Just-in-Time — Accès provisionnés uniquement pour la durée nécessaire, puis révoqués |
| **NIST SP 800-207** | Publication Spéciale NIST 800-207 — Standard de référence pour l'Architecture Zero Trust |
| **MDM** | Mobile Device Management — Gestion des appareils mobiles et de leur posture de sécurité |
| **DLP** | Data Loss Prevention — Prévention de la perte ou fuite de données sensibles |

---

## 🏋️ Exercices & Corrigés

**Exercice 1 :** Expliquer la différence fondamentale entre un modèle de sécurité **périmétrique (Castle-and-Moat)** traditionnel et une **Architecture Zero Trust (ZTA)**, et pourquoi le Semestre 5 a montré que le modèle périmétrique est insuffisant pour l'infrastructure hybride BCC.

**Corrigé :** Le modèle **périmétrique traditionnel (Castle-and-Moat)** repose sur l'hypothèse qu'un utilisateur ou un composant à l'intérieur du réseau d'entreprise est automatiquement **digne de confiance**. Le réseau est protégé par un "mur" (firewall, VPN) et tout ce qui passe la frontière est considéré sûr. Le problème : une fois ce périmètre franchi (via credential stuffing, phishing, compromission d'un appareil), l'attaquant se déplace librement à l'intérieur du réseau sans aucune vérification supplémentaire. L'**Architecture Zero Trust (ZTA — NIST SP 800-207)** repose sur le principe **"Never Trust, Always Verify"** : **aucune confiance implicite n'est accordée** à quiconque, que ce soit à l'intérieur ou à l'extérieur du réseau. Chaque accès à chaque ressource est continuellement vérifié (identité, appareil, contexte, comportement). Le Semestre 5 a illustré parfaitement cette insuffisance : l'attaquant de l'incident BCC (J221) a utilisé un compte légitime compromis ("mnbc-worker") — franchissant le périmètre avec des credentials valides. Dans un modèle ZTA, même avec des credentials valides, l'accès aurait été refusé car : l'IP était un Tor Exit Node (Device Posture/Location Policy), la connexion depuis une heure suspecte (2h31) aurait déclenché une vérification MFA/FIDO2 supplémentaire, et l'action de téléchargement de `nc` depuis Internet aurait été bloquée par la micro-segmentation Cilium.

**Exercice 2 :** Dans le contexte du Pilier 3 (Réseau) de l'Architecture Zero Trust BCC, expliquer comment la **micro-segmentation Cilium eBPF** aurait empêché le mouvement latéral de l'attaquant depuis le service Lambda Settlement vers le réseau SCADA/OT lors de l'incident BCC (J221).

**Corrigé :** La **micro-segmentation Cilium eBPF** implémente un modèle de politique réseau **"Deny-All by Default + Allow-Explicit"** au niveau de chaque pod/service Kubernetes. Avant le déploiement Zero Trust, le réseau interne de la BCC avait une architecture **"flat network"** où tous les services du VLAN ingénierie pouvaient communiquer librement entre eux — c'est ce qui a permis à l'attaquant, après avoir compromis le serveur de la Lambda Settlement, d'atteindre directement le réseau OT/SCADA (port 502 Modbus TCP de l'automate PLC). Avec la politique `CiliumNetworkPolicy` déployée lors de J230, le pod `bcc-settlement-lambda` n'est autorisé à communiquer qu'avec **trois destinations explicitement whitelistées** : SQS, DynamoDB et Secrets Manager (tous sur port 443). Toute connexion sortante vers `192.168.10.50:502` (PLC Modbus) ou vers toute autre destination non listée est **silencieusement ignorée (DROP)** par Cilium au niveau du kernel Linux via eBPF. L'attaquant n'aurait donc pas pu exécuter `modbus_attack_bcc.py` depuis le contexte de la Lambda compromise : le paquet TCP vers le PLC n'aurait jamais quitté le pod.

---

## ❓ Banque de Questions & Test du Jour

**Q1 :** Quel standard NIST (SP 800-207) définit les 7 piliers de l'**Architecture Zero Trust** et le principe **"Never Trust, Always Verify"** ?
- A) NIST SP 800-207 — Zero Trust Architecture
- B) NIST SP 800-53 — Security Controls
- C) NIST SP 800-61 — Incident Handling
- D) NIST SP 800-82 — ICS Security

**Réponse : A**

**Q2 :** Quelle technologie de **micro-segmentation réseau** basée sur **eBPF (extended Berkeley Packet Filter)** est utilisée dans l'Architecture Zero Trust BCC pour isoler les pods Kubernetes et appliquer une politique réseau **Deny-All + Allow-Explicit** ?
- A) Cilium eBPF
- B) iptables classique
- C) Palo Alto NGFW
- D) AWS Security Groups

**Réponse : A**

**Q3 :** Dans l'Architecture Zero Trust BCC, qu'est-ce que le **JIT (Just-in-Time) Privileged Access** configuré dans Teleport PAM, et quel risque cela mitige-t-il ?
- A) Des accès privilégiés (ex: SSH admin sur les serveurs SCADA) provisionnés **temporairement** (ex: 1h) sur demande et révoqués automatiquement, mitigeant le risque d'exposition permanente de comptes à hauts privilèges qui pourraient être compromis et réutilisés par un attaquant sur une longue période
- B) Un mécanisme de déploiement rapide de correctifs de sécurité
- C) Un protocole d'authentification cryptographique post-quantique
- D) Un système de sauvegarde automatique des configurations réseau

**Réponse : A**

**Q4 :** Quelle technologie remplace le **VPN traditionnel (périmétrique)** dans l'Architecture Zero Trust BCC pour fournir un accès sécurisé aux applications internes sans créer de périmètre de confiance implicite ?
- A) ZTNA — Zero Trust Network Access (ex: Cloudflare Access avec tunnels cloudflared)
- B) OpenVPN avec authentification par certificat
- C) IPSec VPN site-à-site
- D) MPLS privé

**Réponse : A**

**Q5 :** En consolidant tous les acquis du Semestre 5 (J201-J229), quelle menace incidente majeure de la BCC (J221 — Credential Stuffing + Reverse Shell + Exfiltration MNBC) aurait été **prévenue ou fortement entravée** par l'Architecture Zero Trust complète déployée au J230 ?
- A) L'ensemble de la chaîne d'attaque aurait été entravée : le Tor Exit Node aurait été bloqué par la politique ZTNA Cloudflare, le MFA FIDO2 aurait empêché le credential stuffing sans phishing-resistant auth, la micro-segmentation Cilium aurait bloqué l'attaque SCADA, et l'IMDSv2 + Least Privilege IAM aurait empêché le pivot Cloud
- B) Uniquement la phase d'exfiltration aurait été bloquée
- C) Aucune des phases de l'attaque n'aurait pu être bloquée par Zero Trust
- D) Seule la phase de privilege escalation (CVE-2023-27997) aurait été bloquée

**Réponse : A**

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
