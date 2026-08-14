# Rapport d'Audit Pédagogique — Semestre 9 (Jour 401–450)

## Résumés Par Jour

**J401 | Crypto Symétrique Avancée AEAD | 6h | Maîtriser AES-256-GCM, ChaCha20-Poly1305 & attaques IV reuse | GHASH GF(2^128) math, IV Reuse → C1⊕C2=P1⊕P2 | TP Python AES-GCM engine | IV Reuse Attack | J400 crypto | Facile | TLS 1.3 AEAD | Pas de différence entre nonce aléatoire et répété dans la pratique

**J402 | Crypto Asymétrique RSA | 6h | RSA-4096, OAEP, attaques Bleichenbacher/Coppersmith | e=65537, OAEP-MGF1-SHA256, PKCS#1 v1.5 vulnérable | TP Python RSA-OAEP/PSS | Bleichenbacher PKCS#1 v1.5 | J401 symétrique | Facile | PKI RSA signée | OAEP pas utilisé dans TLS <1.3 (legacy)

**J403 | Cryptographie ECC | 6h | Courbes elliptiques, ECDHE, Ed25519, ECDSA nonce reuse | Y²=X³+aX+b mod p, ECDHE-PFS, r=(kG)x, s=k⁻¹(m+rd) | TP Python ECDHE+Ed25519 | ECDSA Nonce Reuse → k=(m1-m2)/(s1-s2) | J401-402 crypto | Facile | WireGuard Curve25519 | ECDSA nonce reuse non détecté par les libs basiques

**J404 | Hash & MAC | 6h | SHA-3/Sponge, HMAC-SHA256, HKDF, BLAKE3, Length Extension | Sponge: absorb/squeeze, HMAC=H((K⊕opad)∥H((K⊕ipad)∥M)), HKDF Extract+Expand | TP Python HMAC/HKDF/SHA3 | Length Extension sur H(K‖M) | J403 ECC+hash | Facile | TLS 1.3 HKDF | Merkle-Damgård toujours vulnérable si utilisé sans HMAC

**J405 | Capstone Hybride P1 | 6h | Moteur hybride ECDHE+HKDF+AES-256-GCM+Ed25519 | Échange ECDHE PFS, dérivation HKDF, chiffrement AEAD AAD, signature Ed25519 | TP Orchestration Python complète | Audit complet | J401-404 crypto | Facile | Signal/TLS 1.3 | Score 100/100 capstone P1 validé dès ce jour

**J406 | PKI d'Entreprise | 6h | Hiérarchie Root CA→Intermediate CA, X.509 v3, CP/CPS | Basic Constraints, Key Usage, SAN, CRL/OCSP DP, AIA, HSM air-gap | TP Python x509 builder | X.509 v3 extensions critiques | J405 hybrid capstone | Facile | PKI Cloud ACME | Root CA 30 ans sur HSM, mais Intermediate RSA-2048 (obsolète 2026)

**J407 | Révocation PKI | 6h | CRL, OCSP Stapling, Certificate Transparency, Must-Staple | CRL taille MB, OCSP privacy leak → stapling, CT logs immuables | TP Python CRL/OCSP/CT monitor | OCSP Stapling vs CRL | J406 PKI X.509 | Facile | TLS Must-Staple | OCSP stapling pas disponible sur tous les backends Nginx

**J408 | ACME & Automatisation | 6h | ACME protocol, Let's Encrypt, Cert-Manager K8s, Vault PKI | HTTP-01/DNS-01/TLS-ALPN-01, short-lived certs 24h-90j, CSR finalize après challenge | TP Python ACME simulé + YAML K8s | Cert-Manager Certificate CRD | J407 révocation | Facile | mTLS/Vault | ACME DNS-01 requiert accès API DNS, pas de mTLS

**J409 | Key Management HSM | 6h | HSM FIPS 140-3, PKCS#11, Cloud KMS, Key Ceremony M-of-N | Level 3 tamper-response + zeroization, CKA_EXTRACTABLE=FALSE, Shamir M-of-N | TP Python PKCS#11 simulé | Shamir Secret Sharing | J408 ACME + clés | Facile | Confidential Computing | Cloud KMS délègue la confiance au provider cloud

**J410 | Capstone PKI P2 | 6h | Full PKI enterprise déploiement Root→Intermediate→Leaf | Air-gap Root CA, OCSP, CT monitoring, KMP document | TP Orchestration Python complète | Audit TLS/SSH/VPN | J406-409 PKI+KMS | Facile | TLS 1.3 mTLS | Score 100/100, mais pas de cross-certification entre Root CA

**J411 | TLS 1.3 Handshake | 6h | TLS 1.3 1-RTT, 0-RTT, Session Tickets, JA3, Downgrade | AEAD-only 5 cipher suites, PSK 0-RTT risk, JA3=MD5(ClientHello) | TP Python JA3/JA3S | 0-RTT Replay Attack | J410 PKI mTLS | Moyenne | Signal Protocol | 0-RTT pas de protection replay native → risques double paiement

**J412 | SSH Hardening | 6h | SSH CA, sshd_config NIST SP 800-190, Bastion Jump Host | Ed25519/ChaCha20, pubkey-only, no agent forwarding, ProxyJump -J | TP Python audit sshd_config | SSH CA cert 8h short-lived | J411 TLS+PKI | Moyenne | Zero-Trust SPIFFE | authorized_keys statiques non gérés si SSH CA pas déployé

**J413 | VPN IPsec/WireGuard | 6h | IPsec IKEv2, WireGuard Noise IK, Perfect Forward Secrecy | IKE_SA/CHILD_SA, ESP AES-256-GCM, Curve25519 ChaCha20-Poly1305, logjam modp1024 | TP Python audit config VPN | modp1024 vulnérable Logjam | J412 SSH+TLS | Moyenne | Zero-Trust mTLS | WireGuard pas de PFS si seul (pas de rekey)

**J414 | Signal Protocol | 6h | Double Ratchet, X3DH, Forward Secrecy, Break-in Recovery | KDF_RK/KDF_CK, Chain Key par message, OPK one-time, post-quantum PQXDH | TP Python Double Ratchet | X3DH 4 DH combinés | J413 VPN + J403 ECC | Moyenne | PQC Signal | Signal basé sur Curve25519, cassé par Shor

**J415 | Capstone Comm Stack P3 | 6h | TLS 1.3+SSH CA+WireGuard+Zero Trust audit | mTLS, JA3 enforcement, OCSP Must-Staple, bastion ProxyJump | TP Orchestration 3 phases | Audit NIST SP 800-52/190/77 | J411-414 TLS+SSH+VPN+Signal | Moyenne | Cloud Crypto | Score 100/100, mais Zero-Trust pas complet sans SPIFFE

**J416 | Post-Quantum Crypto | 6h | NIST FIPS 203/204/205, ML-KEM, ML-DSA, HNDL migration | Shor casse RSA/ECC, Grover AES-256→128, M-LWE problème réseau | TP Python simulateur PQC hybride | HNDL Harvest-Now-Decrypt-Later | J403 ECC + J404 hash | Moyenne | PQC prod TLS | RSA-4096 cassé par Shor, mais AES-256 safe Grover

**J417 | Side-Channel Attacks | 6h | Timing, SPA/DPA, Cache Bleed, Constant-Time | Hamming weight corrélation, RSA Blinding, AES-NI constant-time | TP Python timing+blinding | Length Extension vs Sponge | J414 Signal + crypto | Difficile | FHE/SMPC | Constant-time pas enforcé par défaut en Python

**J418 | Cryptanalyse Symétrique | 6h | Padding Oracle (Vaudenay), CBC Byte-Flipping, GCM Forbidden IV | GCM: 2 ciphertexts → Tag1⊕Tag2 = GHASH(C1)⊕GHASH(C2) → H dérivé | TP Python lab padding/GCM audit | GCM IV reuse → forge GMAC | J416 PQC + J417 SCA | Difficile | Container Security | AES-GCM IV reuse fatal mais difficile à détecter en prod

**J419 | Zero-Knowledge Proofs | 6h | zk-SNARKs, Pedersen Commitments, FHE, Forward Secrecy | Completeness/Soundness/Zero-Knowledge, C=g^v*h^r, homomorphic addition | TP Python Pedersen ZKP | zk-SNARK vs zk-STARK (trusted setup) | J416 PQC + J404 hash | Difficile | Formal Verification | zk-SNARK nécessite trusted setup, zk-STARK transparent mais gros

**J420 | Capstone PQC+Privacy P4 | 6h | CBOM, cryptanalyse SCA, migration PQC, Pedersen ZKP | Inventaire crypto, RSA-4096→ML-DSA, AES-CBC→GCM, HNDL threat | TP Orchestration 3 phases | Audit constant-time+IV uniqueness | J416-419 PQC/SCA/ZKP | Difficile | Governance PCI-DSS | Score 100/100, mais HNDL pas évalué quantitativement

**J421 | Smart Contract Crypto | 6h | ECDSA malleability, EIP-712, ecrecover, reentrancy | s>n/2 → (r,n-s) valide, ecrecover→0x0 si invalide, chainId replay protection | Solidity contract sécurisé | EIP-712 Domain Separator + ChainID | J403 ECC + J404 | Moyenne | Token standards ERC | ecrecover 0x0 non vérifié = bypass critique fréquent

**J422 | HD Wallets & MPC | 6h | BIP32/39/44, Shamir backup SLIP-0039, Threshold Signatures | m/44'/60'/0'/0/0, entropy→mnemonic→seed→key, MPC-TSS=N-of-M parts | TP Python BIP39/HD+MPC | Shamir Secret Sharing 3-of-5 | J421 Smart Contract | Moyenne | FHE/SMPC | HD wallet seed compromise = vol de tous les dérivés

**J423 | Consensus Blockchain | 6h | PoW 51%, PoS slashing, BFT, long-range attacks | DH Group 1024 vuln, <33% Byzantins BFT, slashing 100% stake | TP Python simulateur PoW/PoS/BFT | 51% Hashrate Attack vs Slashing | J421-422 Web3 | Moyenne | Smart Contract audit | PoS rien stake = attaque 51% possible (long-range)

**J424 | Confidentialité Web3 | 6h | Ring Signatures Monero, Stealth Addresses, ZK Mixers | LSAG/CLSAG ring, KeyImage anti-double-spend, Nullifier hash | TP Python stealth/ring/mixer | Nullifier anti double-retrait | J422 HD + J419 ZKP | Difficile | FHE/MPC | Tornado Cash sanctionné OFAC — Mixer illégal US

**J425 | Capstone Web3 P5 | 6h | Audit complet Smart Contracts/Web3/DeFi | ECDSA malleability, MPC-TSS custody, BFT slashing, stealth/ZKP | TP Orchestration 4 phases | Audit complet S9 Web3 | J421-424 Web3 | Moyenne | Governance PCI-DSS | Score 100/100, mais MPC-TSS black-box non auditable

**J426 | Stockage Chiffré | 6h | LUKS2, dm-crypt XTS-AES-256, Argon2id, ZFS, Key Escrow | XTS tweak=sector, Argon2id 1GB RAM, DEK chiffrée par HSM | TP Python LUKS2/Argon2id | LUKS2 clé = 512 bits (2×256) | J409 HSM + J404 hash | Facile | Stream Kafka crypto | LUKS2 pas de forward secrecy → clé compromise = données passées exposées

**J427 | Base de Données Crypto | 6h | TDE vs Column-Level, Blind Indexing, Envelope Encryption | TDE=claire RAM (vuln. SQLi), CLE=opaque ciphertext, HMAC blind index | TP Python AES-256-GCM blind index | Blind Index recherche exacte only | J426 stockage | Facile | API tokens JOSE | TDE inutile contre SQLi — CLE obligatoire

**J428 | Streaming Kafka crypto | 6h | Kafka mTLS, SASL/SCRAM-SHA-512, Payload E2EE, Key Rotation | TLS=chiffré transit, mais stockage disque clair, DEK versionnée | TP Python Kafka producer E2EE | SASL/SCRAM-SHA-512 challenge | J427 DB + J413 VPN | Moyenne | OAuth2 DPoP | Kafka TLS-only = pas de E2EE = données lisibles sur disque broker

**J429 | API Tokens JOSE | 6h | JWS/JWE, OAuth2 DPoP, mTLS Token Binding, Sender-Constrained | JWS=lisible/signé, JWE=chiffré opaque, DPoP=JWS signé client | TP Python DPoP proof | JWE 5 parties: Header.Key.IV.Ciphertext.Tag | J428 Kafka + J411 TLS | Moyenne | Cloud Data Encryption | Bearer token volé = usurpation — DPoP obligatoire

**J430 | Capstone Cloud P6 | 6h | LUKS+DBM Kafka+API E2EE+DPoP architecture complète | Storage LUKS2, DB CLE+blind, Kafka mTLS+SASL, API JWE+DPoP | TP Orchestration 4 phases | Audit global S9 partie 6 | J426-429 crypto data | Moyenne | Gouvernance PCI-DSS | Score 100/100, mais pas de confidential computing

**J431 | Gouvernance Crypto | 6h | PCI-DSS v4.0, FIPS 140-3, NIST SP 800-57, Key Lifecycle | RSA-3072 min, AES-256, 3DES/MD5 interdits, crypto period <1an | TP Python audit conformité clés | PCI-DSS Req 3.4 (PAN illisible) | J430 cloud + J416 PQC | Facile | Incident Crypto P0 | RSA-2048 encore autorisé = obsolète NIST 2026

**J432 | Incident Crypto | 6h | CIRP, HSM Zeroization, Mass-CRL, Re-encryption, 72h ANSSI | Zéroisation 0x00, CRL TTL 60s, re-chiffrement DEK avec nouvelle KEK | TP Python incident P0 | Mass-CRL emergency | J431 gouvernance | Moyenne | CTI Threat Intel | Zeroization = destruction irréversible, pas de récupération possible

**J433 | Threat Intelligence | 6h | CTI, QHI, deprecation tracking NIST/ANSSI, weak crypto discovery | QHI=(sensibilité+migration)/horizon CRQC, 3DES/MD5/SHA1/RSA-1024 interdits | TP Python scanner vulnérabilités | Quantum Horizon Index ≥1.0 = urgence | J432 incident + J431 PCI | Moyenne | Policy-as-Code OPA | RSA-2048 "MEDIUM" (déprécié) mais encore présent = faible urgence

**J434 | Policy-as-Code | 6h | OPA/Rego, CI/CD crypto linter, automated crypto checks | Bloque MD5/SHA1/3DES/ECB/hardcoded keys/IV reuse dans Git push | TP Python linter CI/CD + YAML Rego | CRITICAL: hardcoded private key | J433 CTI + J432 | Moyenne | Confidential Computing | Linter regex = false positives/negatives, pas de vérif sémantique

**J435 | Capstone Governance P7 | 6h | PCI-DSS, P0 incident, QHI, Policy-as-Code CI/CD | Compliance NIS2/RGPD 72h, Zeroization HSM, OPA blocking | TP Orchestration 4 phases | Audit complet S9 gouvernance | J431-434 gouvernance | Moyenne | Confidential Computing | Score 100/100, mais CTI=0 vulnérabilité détectée (peut-être trop optimiste)

**J436 | Confidential Computing | 6h | Intel SGX, AMD SEV-SNP, TPM 2.0 PCR, ARM TrustZone | Data-in-Use isolation, Remote Attestation, PCR extend SHA256 | TP Python TPM2.0 attestation | TPM PCR = SHA256(PCR||hash) cumulatif | J435 governance + J409 HSM | Difficile | Formal Verification ProVerif | SGX attaqué par Spectre/Meltdown — side-channel persiste

**J437 | PQC Production TLS | 6h | OpenSSL 3.2 OQS, Hybrid X.509 (ML-DSA), TLS 1.3 perf | x25519_mlkem768 group, cert 5145 octets, MSS TCP fragmentation | TP Python benchmark handshake | Hybrid KEM x25519_mlkem768 | J416 PQC + J411 TLS | Difficile | Zero-Trust SPIFFE | Certificat hybride = taille 5KB, latency TLS impacté (1 RTT supplémentaire)

**J438 | Vérification Formelle | 6h | ProVerif, Tamarin Prover, Dolev-Yao, Needham-Schroeder | Attaquant contrôle 100% réseau, mais crypto=boîte noire, Lowe's attack | Python simulation Lowe attack | Dolev-Yao model | J437 PQC + J414 Signal | Difficile | Container Security | Needham-Schroeder sans identité répondeur = faille Lowe connue depuis 1995

**J439 | Zero-Trust Identity | 6h | SPIFFE/SPIRE, SVID, mTLS, IBE Boneh-Franklin, Kubernetes PKI | SPIFFE ID dans SAN URI, SVID 1h TTL, mTLS strict, IBE=email=clé publique | Python simulation SPIFFE/SPIRE | SPIFFE ID = spiffe://domain/ns/sa/service | J438 formal + J410 PKI | Difficile | Post-Quantum Migration | SPIFFE ID dans SAN mais pas de mTLS mandat if non-Istio

**J440 | Capstone Trusted P8 | 6h | Confidential Computing + PQC TLS + Formal Verification + Zero-Trust | SEV-SNP RAM encrypted, x25519_mlkem768, ProVerif proved, SPIFFE 1h | TP Orchestration 4 phases | Audit global S9 partie 8 | J436-439 trusted computing | Difficile | — final (Distinguished Architect) | Score 100/100, mais SGX side-channel mitigé mais non résolu

**J441 | Cryptanalyse Avancée | 6h | Differential/Linear cryptanalysis, DPA/CPA, fault injection | S-Box DDT biais, Hamming weight corrélation, RSA non-constant-time | Python CPA attack simulation | CPA = Pearson correlation sur traces power | J441 SCA + J442 RSA | Très difficile | — | DPA/CPA nécessite matériel physique (oscillateur), simulation limitée

**J442 | Cryptanalyse Asymétrique | 6h | RSA weak keys, Coppersmith, Wiener, LLL lattice reduction | GCD(N1,N2)=p factorisation, d<(1/3)N^1/4 → fraction continue, Coppersmith M-LWE | Python Wiener attack simulation | Wiener d<(1/3)N^(1/4) | J402 RSA + J416 PQC | Très difficile | ZKP/FHE | RSA-1024 partage facteur commun → casser par GCD instantanément

**J443 | HSM & Cloud HSM | 6h | HSM FIPS 140-3, PKCS#11 API, Thales PayShield, AWS CloudHSM, KMIP | Level 1→4 zeroization, C_GenerateKey/C_Sign/C_Decrypt, KMIP Create/Get/Revoke | Python PyKCS11 demo | PKCS#11=interface vendor-agnostic | J436 confidential + J409 HSM | Difficile | Formal Verification | HSM on-premise=contrôle total, Cloud HSM=délégation trust provider

**J444 | PQC Avancée | 6h | NIST FIPS 203 ML-KEM, FIPS 204 ML-DSA, FIPS 205 SLH-DSA, M-LWE | Shor casse RSA/ECC, Grover AES-256→128 safe, SLH-DSA hash-based (post-quantum) | Python liboqs ML-KEM simulation | ML-KEM=768/1024/512 security levels | J416 PQC + J419 ZKP | Difficile | Policy-as-Code | SLH-DSA backup=non lattice, mais signature 50KB (trop gros TLS)

**J445 | Zero-Knowledge Proofs Avancée | 6h | zk-SNARKs Groth16/PLONK, Circom R1CS, Schnorr, FHE | Trusted setup, completeness/soundness/Zero-Knowledge, homomorphic Pedersen | Circom circuit majority proof | zk-SNARK=288 octets vs zk-STARK=100KB | J419 ZKP + J446 FHE | Très difficile | Container Security | Trusted setup malveillant = backdoor ZKP (Zcash)

**J446 | Chiffrement Homomorphe | 6h | FHE, CKKS, BFV/BGV, SMPC, Shamir secret sharing | E(a)*E(b)=E(a+b) additif, bootstrapping bruit, SMPC=k-of-n parts | Python TenSEAL CKKS demo | FHE=calcul sur ciphertext sans décrypter | J445 ZKP + J422 MPC | Très difficile | Event Stream Kafka | FHE=Surcharge ×1000 → latence, pas de production ready

**J447 | Event Stream & Messaging E2EE | 6h | Kafka Message-Level Encryption, Signal Protocol Double Ratchet, E2EE REST API | Envelope Encryption DEK/CMK, Double Ratchet KDF, AES-256-GCM | Python Kafka Envelope E2EE | Signal=DH Ratchet + Symmetric Ratchet | J446 FHE + J428 Kafka | Difficile | API Tokens JOSE | Kafka E2EE=performance overhead, mais protection disque

**J448 | Sécurité Conteneurs | 6h | Docker Sigstore/Cosign keyless, SBOM, Admission Controller, Pod Security | OIDC keyless signing, Rekor transparency log, Syft+Grype, OPA Gatekeeper | YAML GitHub Actions Cosign keyless | Cosign verify --certificate-identity | J447 stream + J438 formal | Moyenne | Formal Verification | SBOM pas de signature = falsifiable, keyless = OIDC provider compromis

**J449 | Cryptanalyse Appliquée & CVEs | 6h | Timing Attacks, Padding Oracle, Bleichenbacher, BEAST, POODLE, Lucky13 | CBC IV prédictible, POODLE SSLv3, Lucky13 MAC-then-Encrypt, TLS 1.3 fixe | Python timing attack demo | POODLE CVE-2014-3566 | J441-442 crypto + J411 TLS | Difficile | Gouvernance PCI-DSS | TLS 1.3 élimine CBC mais legacy TLS 1.0/1.1 encore présent

**J450 | Capstone Architecture Complète | 6h | PKI multi-niveaux Vault+SoftHSM2, Zero-Trust SPIFFE/SPIRE, Post-Quantum migration | Root CA offline HSM, Intermediate, Issuing CA Vault HA, SVID 1h rotation | Bash script Vault PKI + SPIFFE | Plan migration ML-KEM/ML-DSA 3 phases | J436-449 entire S9 | Difficile | — final | Score 100/100, mais RSA-2048 encore utilisé, PQC transition incomplète**

---

## Synthèse S9 — 5 Points

- **Progression logique globale :** La progression S9 suit un arc impeccable : crypto fondamentale (J401-405) → PKI & gestion clés (J406-410) → communications sécurisées (J411-415) → cryptanalyse & PQC (J416-420) → Web3 (J421-425) → storage & data (J426-430) → gouvernance & incident (J431-435) → confidential computing & ZT (J436-440) → crypto avancée & conteneurs (J441-450). Chaque bloc de 5 jours se clôture par un capstone validé 100/100, assurant la montée en complexité.

- **Points forts :** Approche ultra-pratique (11 moteurs Python + 8 projets capstone orchestrés) ; couverture exhaustive des standards industriels NIST/FIPS/CAB Forum/PCI-DSS ; intégration continue via Policy-as-Code (OPA/Rego + linter CI/CD) ; forte cohérence thématique entre capstones et modules introductifs.

- **Points faibles / ruptures :** (1) **Score capstone systématiquement 100/100** depuis J405 — suspicion de notation automatique informatique sans évaluation pédagogique réelle ; (2) **Rupture difficulté** nette J437→J441 : passage brutal du "facile/moyen" des modules standards à du "très difficile" (proverif Dolev-Yao, LLL, CPA, FHE) sans transition pédagogique ; (3) **Redondance thématique** : crypto symétrique/attaques/side-channel abordée 3 fois (J417, J441, J449) avec des chevauchements quasi-identiques sur le timing attack ; (4) **Absence de mise en œuvre réelle** : tous les TPs sont des simulations Python, aucun déploiement réel sur VM/container.

- **Alignement Bachelor BIT / Master Cybersecurity :** Très bonne correspondance avec le Master Cybersecurity (sécurité offense/defense, PKI, ZKP, PQC, formal verification, cloud crypto). Mais le Bachelor BIT (bac+3, plus appliqué) serait dépassé : le niveau mathématique (Lattices M-LWE, Dolev-Yao, LLL, CPA Pearson) nécessite un niveau ingénieur ou master. Le programme tâche un Master Crypto/Applied Math, non un Bachelor.

- **Recommandations :** (1) **Intégrer des labs réels** (VM Debian, OpenSSL, Vault, Istio) au lieu de simulations pour J406-410 et J440-448 ; (2) **Étaler la difficulté** : insérer un J417b "intermediate" entre les modules simples et les modèles formels/Lattice ; (3) **Réconcilier l'évaluation** des capstones — remplacer le 100/100 systématique par des checks objectifs (ex: exécuter le script et vérifier la sortie) ; (4) **Dédoublonner J417/J441/J449** en un seul module avancé d'attaques SCA + intégrer la démonstration Hardware (oscilloscope) manquante ; (5) **Clarifier la piste Bachelor BIT** : proposer un parcours "Crypto opérationnelle" (appliquée, gestion, audits) distinct du parcours "Crypto recherche" (mathématique, vérification formelle, FHE).