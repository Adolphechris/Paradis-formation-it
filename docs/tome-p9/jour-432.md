# TOME P9 — Cryptographie, PKI & Sécurité des Communications — Jour 432 (6h) : Gestion des Incidents Cryptographiques & Compromission — Emergency Key Rotation, CRL Mass-Revocation, HSM Zeroization Protocols & Compromise Recovery

> [!NOTE]
> **Objectif du jour :** Maîtriser le **Plan de Réponse aux Incidents Cryptographiques (Cryptographic Incident Response Plan — CIRP)** en cas de compromission d'une clé privée critique ou d'une Autorité de Certification (CA) : exécuter la **Rotation d'Urgence des Clés (Emergency Key Rotation)**, procéder à la **Révocation de Masse par CRL/OCSP**, déclencher la **Zéroisation Matérielle d'un HSM (Hardware Zeroization)** et orchestrer la reconstruction de la chaîne de confiance post-incident.
>
> **Compétences visées :** `INCIDENT-CRYPTO-01` (A) — Cryptographic Incident Response Playbook (Emergency Key Revocation & HSM Zeroization) | `INCIDENT-CRYPTO-02` (A) — Mass-Certificate Revocation Orchestration (CRL/OCSP) & Post-Compromise Trust Recovery

---

## 1) Module — Compromise Playbook & Zeroisation HSM (2h)

### 📖 Narration/Intuition

La compromission d'une clé privée Root CA, d'une Intermediate CA ou de la Master Key d'un KMS d'entreprise est une crise majeure (P0 Emergency). Sans procédure de réponse d'urgence pré-scriptée et testée, l'entreprise risque l'interruption complète de ses services TLS, la fraude massive ou l'exfiltration de ses données chiffrées.

```
  ═══════════════════════════════════════════════════════════════════
    PLAYBOOK D'URGENCE — COMPROMISSION DE CLÉ PRIVÉE CRITIQUE (P0)
  ═══════════════════════════════════════════════════════════════════

  Étape 1 : DÉCLENCHEMENT DE L'ALERTE P0 & CONFINEMENT
  ├── Isoler immédiatement l'instance ou le HSM compromis du réseau.
  └── Déclencher la procédure de Zéroisation HSM si intrusion physique.

  Étape 2 : RÉVOCATION DE MASSE (MASS-REVOCATION)
  ├── Émettre une CRL d'urgence signée par le Root CA / CA supérieur.
  └── Forcer la mise à jour des répondeurs OCSP et distribuer la CRL aux CDN.

  Étape 3 : ROTATION D'URGENCE & RE-CHIFFREMENT
  ├── Générer une nouvelle paire de clés via une Key Ceremony d'urgence.
  └── Re-chiffrer les secrets avec la nouvelle Master Key (Re-encryption).

  Étape 4 : RECONSTRUCTION DE LA CHAÎNE DE CONFIANCE & AUDIT
  └── Publier les nouveaux certificats Root/Intermediate et notifier les auditeurs.
```

---

## 2) Module — Outillage Incident Response Engine (`crypto_incident_engine.py`) (2h)

### 🛠️ Atelier Pratique

```python
import os
import json
import hashlib
from datetime import datetime, timezone
from typing import List, Dict

class CryptoIncidentResponseEngine:
    """
    Moteur de réponse automatisée aux incidents cryptographiques majeurs :
    - Zéroisation d'urgence HSM (Hardware Zeroization Simulation)
    - Révocation de masse de certificats (Mass-CRL Generation)
    - Re-chiffrement d'urgence des clés de données (Emergency Re-encryption)
    """

    def __init__(self, hsm_id: str):
        self.hsm_id = hsm_id
        self.active_keys: Dict[str, str] = {
            "ROOT_CA_KEY": "0xSUPER_SECRET_ROOT_PRIVATE_KEY_DATA",
            "INTERMEDIATE_TLS_KEY": "0xSECRET_INTERMEDIATE_PRIVATE_KEY",
            "KMS_MASTER_KEY": "0xDATA_ENCRYPTION_MASTER_KEY"
        }
        self.incident_log: List[dict] = []

    def trigger_hsm_zeroization(self, Security_officer_id: str, authorization_code: str) -> dict:
        """
        [URGENCE P0] Zéroisation physique/logique immédiate du HSM.
        Efface de la mémoire volatile et ré-écrit 0x00 sur toutes les clés privées.
        """
        print(f"\n[!] URGENCE P0: DÉCLENCHEMENT ZÉROISATION HSM '{self.hsm_id}'")
        print(f"  [AUTHORIZATION] Officer ID: {Security_officer_id} — Code: {authorization_code}")

        # Surécriture et suppression des clés privées en mémoire
        for key_label in list(self.active_keys.keys()):
            self.active_keys[key_label] = "0x00000000000000000000000000000000"  # Surécriture
            del self.active_keys[key_label]  # Suppression définitive
            print(f"  [ZEROIZATION] Clé '{key_label}' effacée et zéroisée avec succès !")

        record = {
            "event": "HSM_ZEROIZATION_EXECUTED",
            "hsm_id": self.hsm_id,
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "officer": Security_officer_id,
            "keys_destroyed_count": 3,
            "status": "ALL_KEYS_PERMANENTLY_DESTROYED"
        }
        self.incident_log.append(record)
        print("  [+] HSM ZÉROISÉ : Toutes les clés privées ont été détruites physiquement ! 💥")
        return record

    def execute_mass_crl_revocation(self, compromised_ca_cn: str, serial_numbers: List[int], reason: str = "KEY_COMPROMISE") -> dict:
        """
        [URGENCE P0] Génère une CRL de révocation de masse d'urgence pour une CA compromise.
        """
        print(f"\n[*] RÉVOCATION DE MASSE D'URGENCE — CA: '{compromised_ca_cn}'")
        revoked_entries = []
        
        for serial in serial_numbers:
            entry = {
                "serial_number": hex(serial),
                "revocation_time": datetime.now(timezone.utc).isoformat(),
                "reason": reason
            }
            revoked_entries.append(entry)
            print(f"  [MASS REVOKE] Certificat {hex(serial)} ajouté à la CRL d'urgence")

        crl_package = {
            "issuer": compromised_ca_cn,
            "emergency_crl_id": hashlib.sha256(str(serial_numbers).encode()).hexdigest()[:16],
            "total_revoked": len(revoked_entries),
            "generated_at": datetime.now(timezone.utc).isoformat(),
            "revoked_certificates": revoked_entries
        }
        print(f"  [+] CRL d'Urgence générée : {len(revoked_entries)} certificat(s) révoqué(s) ✅")
        return crl_package

# Démonstration Crypto Incident Engine
engine = CryptoIncidentResponseEngine("Thales-Luna-HSM-PROD-01")
print("=== CRYPTOGRAPHIC INCIDENT RESPONSE & ZEROIZATION ENGINE ===")

# 1. Révocation de masse d'urgence
engine.execute_mass_crl_revocation(
    compromised_ca_cn="Paradis Intermediate CA TLS",
    serial_numbers=[0x1A2B, 0x3C4D, 0x5E6F, 0x7890],
    reason="KEY_COMPROMISE"
)

# 2. Zéroisation d'urgence du HSM
engine.trigger_hsm_zeroization(
    Security_officer_id="CCO_OFFICER_ADOLPHE",
    authorization_code="EMERGENCY_CODE_RED_999"
)
```

---

## 3) Module — Fiche de Procédure de Crise Cryptographique (2h)

```markdown
# FICHE DE REFLEXE CRAN DE SÉCURITÉ — COMPROMISSION CRYPTOGRAPHIQUE P0

## 1. Isolement Réseau Immédiat (Containment)
- Couper immédiatement les accès réseau au serveur ou au KMS hébergeant la clé compromise.
- Basculer le trafic TLS sur la PKI de secours (Disaster Recovery PKI).

## 2. Invalidation & Distribution Rapide
- Pusher la nouvelle CRL d'urgence sur les CDN publics avec un TTL de cache réduit à **60 secondes**.
- Déclencher le renouvellement automatique via ACME/Cert-Manager pour l'ensemble du parc de serveurs.

## 3. Communication & Handoff Légale
- Notifier l'ANSSI / la CNIL dans les **72 heures** (conformément au RGPD et NIS 2) si des données personnelles ont été exposées.
```

---

## 🏅 Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **CIRP** | Cryptographic Incident Response Plan — Plan formalisé de réponse aux incidents cryptographiques |
| **Zéroisation** | Procédure de destruction définitive des clés privées en mémoire par surécriture binaire (0x00) |
| **Mass-Revocation** | Processus de révocation simultanée de milliers de certificats lors de la perte d'une CA |

---

## ❓ Banque de Questions & Test du Jour (5 QCM)

**Q1 :** Qu'est-ce que la **Zéroisation matérielle (Hardware Zeroization)** d'un HSM en cas d'intrusion physique ou de compromission critique ?
- A) La destruction physique ou logique immédiate et irréversible de l'ensemble des clés privées stockées dans le HSM par surécriture binaire (0x00) de la mémoire volatile/NVDIMM
- B) Le redémarrage du HSM
- C) La réinitialisation du mot de passe administrateur
- D) La création d'une sauvegarde sur clé USB

**Réponse : A**

**Q2 :** Lors de la compromission d'une clé privée d'Autorité de Certification Intermediate (CA), quelle doit être la PREMIÈRE action cryptographique sur la PKI ?
- A) Émettre immédiatement une CRL d'urgence signée par le Root CA révoquant le certificat de la CA Intermediate et diffuser la CRL avec un TTL de cache minimal
- B) Attendre la fin du mois pour mettre à jour la CRL
- C) Supprimer le serveur web
- D) Réinstaller le système d'exploitation Linux

**Réponse : A**

**Q3 :** Pourquoi la procédure de **Re-chiffrement d'Urgence (Emergency Re-encryption)** est-elle nécessaire si la Master Key (KEK) d'un KMS a été exfiltrée ?
- A) Parce que toutes les clés de données (DEK) et données chiffrées par cette Master Key doivent être re-chiffrées sous une nouvelle Master Key saine pour invalider la clé volée
- B) Pour accélérer le système
- C) Pour libérer de l'espace disque
- D) Parce qu'AWS supprime les clés automatiquement

**Réponse : A**

**Q4 :** Quel est le délai légal maximum imposé par le **RGPD / NIS 2** pour notifier l'autorité de contrôle (ex: ANSSI/CNIL) en cas de fuite de données suite à la compromission d'une clé cryptographique ?
- A) 72 heures maximum après avoir pris connaissance de l'incident
- B) 30 jours
- C) 6 mois
- D) Aucune notification n'est requise

**Réponse : A**

**Q5 :** Quel paramètre de distribution HTTP doit être modifié en urgence sur la CRL lors d'une crise de révocation de masse ?
- A) Réduire le temps de cache HTTP (`Cache-Control: max-age=60`) pour forcer les clients TLS à télécharger immédiatement la nouvelle liste de révocation
- B) Augmenter la taille du fichier CRL à 1 Go
- C) Passer en protocole HTTP/1.0
- D) Activer la compression Zip

**Réponse : A**

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
