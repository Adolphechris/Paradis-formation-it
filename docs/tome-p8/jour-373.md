# TOME P8 — Blue Team, SOC & SIEM Advanced — Jour 373 (6h) : Ransomware Incident Response — Detection, Containment, Recovery & Post-Incident Hardening

> [!NOTE]
> **Objectif du jour :** Maîtriser la réponse opérationnelle complète à une attaque de **Ransomware d'entreprise** : identifier les indicateurs d'infection précoces (Early Warning Indicators), orchestrer le **Plan de Confinement à Chaud (Runbook IRP)**, évaluer l'impact réel (blast radius), coordonner la récupération via les sauvegardes (**RTO/RPO**), et déployer le durcissement post-incident (Ransomware Hardening Checklist).
>
> **Compétences visées :** `RANSOM-IR-01` (A) — Ransomware Early Detection & Multi-Layer Containment | `RANSOM-IR-02` (A) — Business Continuity (BCP/DRP), Recovery Planning & Post-Incident Hardening

---

## 1) Module — Anatomie d'une Attaque Ransomware d'Entreprise (Chaîne d'Attaque) (2h)

### 📖 Narration/Intuition

Les attaques Ransomware modernes (**Ransomware as a Service — RaaS**) ne sont pas des actions isolées de quelques minutes. Ce sont des **intrusions planifiées sur des semaines** avant le déclenchement du chiffrement. La fenêtre de détection précoce est critique.

```
   ┌─────────────────────────────────────────────────────────────────┐
   │           CHRONOLOGIE D'UNE ATTAQUE RANSOMWARE ENTERPRISE       │
   └─────────────────────────────────────────────────────────────────┘

   J-21 : ACCÈS INITIAL          ──► Phishing Spear / VPN 0-Day / Achat Accès IAB
     │
   J-14 : PERSISTANCE            ──► Backdoor / Scheduled Task / Registry Run Key
     │
   J-7  : RECONNAISSANCE INTERNE ──► BloodHound AD / Network Scanning (nmap)
     │
   J-3  : ÉLÉVATION PRIVILÈGES   ──► Kerberoasting / DCSync / Local Admin Abuse
     │
   J-2  : DÉSACTIVATION DÉFENSES ──► Disable AV / Inhibit Backup / Delete VSS
     │
   J-1  : EXFILTRATION DONNÉES   ──► Rclone / FTP / HTTPS vers serveur attaquant
     │
   J-0  : CHIFFREMENT MASSIF     ──► Déploiement via GPO / PsExec / Wmic sur tout le parc
     │
   J+0  : RANSOM NOTE            ──► !!! README_DECRYPT.txt (HOW_TO_DECRYPT.html) !!!
```

---

## 2) Module — Outillage Ransomware Incident Response Engine (`ransomware_ir_engine.py`) (2h)

### 🛠️ Atelier Pratique

```python
import json
from datetime import datetime, timezone
from typing import List, Dict, Set

class RansomwareIncidentResponseEngine:
    """
    Moteur de réponse à incident Ransomware : qualification de l'étendue du chiffrement,
    assessment du Blast Radius, coordination du confinement et calcul RTO/RPO.
    """

    # Extensions de fichiers ajoutées par les familles Ransomware majeures
    KNOWN_RANSOM_EXTENSIONS = {".locked", ".encrypted", ".paradisencrypted", ".lckd", ".ryk", ".conti"}

    def __init__(self, incident_id: str, affected_organization: str):
        self.incident_id = incident_id
        self.org = affected_organization
        self.affected_hosts: List[str] = []
        self.encrypted_share_paths: List[str] = []
        self.containment_actions: List[dict] = []
        self.recovery_plan: dict = {}

    def assess_blast_radius(self, file_scan_results: List[dict]) -> dict:
        """
        Évalue l'étendue du chiffrement Ransomware sur les partages réseau.
        Détecte les extensions malveillantes et recense les hôtes impactés.
        """
        encrypted_file_count = 0
        impacted_hosts: Set[str] = set()

        for scan_entry in file_scan_results:
            file_path = scan_entry.get("path", "")
            host = scan_entry.get("host", "")

            if any(file_path.endswith(ext) for ext in self.KNOWN_RANSOM_EXTENSIONS):
                encrypted_file_count += 1
                impacted_hosts.add(host)
                self.encrypted_share_paths.append(file_path)

        self.affected_hosts = list(impacted_hosts)

        blast_radius = {
            "total_encrypted_files": encrypted_file_count,
            "affected_hosts_count": len(self.affected_hosts),
            "affected_hosts": self.affected_hosts,
            "severity": "CATASTROPHIC" if encrypted_file_count > 1000 else "CRITICAL" if encrypted_file_count > 100 else "HIGH"
        }
        print(f"[!] BLAST RADIUS ASSESSMENT -> {encrypted_file_count} fichiers chiffrés sur {len(self.affected_hosts)} hôtes.")
        return blast_radius

    def execute_containment_runbook(self, network_segment: str) -> List[dict]:
        """
        Exécute le Runbook de Confinement IRP (Incident Response Plan).
        Chaque action est horodatée et tracée pour la post-investigation.
        """
        runbook_steps = [
            ("NETWORK_ISOLATE_SEGMENT",     f"Isolation du segment réseau {network_segment} du VLAN core"),
            ("DISABLE_COMPROMISED_ACCOUNTS", "Désactivation de tous les comptes compromis identifiés"),
            ("REVOKE_VPN_SESSIONS",          "Révocation de toutes les sessions VPN actives"),
            ("BLOCK_C2_IPS_FIREWALL",        "Injection des IoCs C2 sur le pare-feu de bordure"),
            ("PRESERVE_EVIDENCE_MEMORY",     "Capture mémoire RAM des serveurs en cours d'exécution (prioritaire)"),
            ("NOTIFY_CISO_LEGAL_COMMS",      "Notification CISO + Équipe Juridique + Cellule Communication de Crise")
        ]

        for action_id, description in runbook_steps:
            entry = {
                "timestamp": datetime.now(timezone.utc).isoformat(),
                "action_id": action_id,
                "description": description,
                "status": "EXECUTED"
            }
            self.containment_actions.append(entry)
            print(f"  [IRP] {action_id} -> {description}")

        return self.containment_actions

    def build_recovery_plan(self, backup_rto_hours: int, backup_rpo_hours: int) -> dict:
        """Construit le plan de reprise d'activité basé sur les SLAs backup de l'entreprise."""
        self.recovery_plan = {
            "recovery_order": [
                "1. DC & Active Directory Controllers (Restore & Integrity Check)",
                "2. Serveurs d'Infrastructure Critiques (DNS, DHCP, PKI)",
                "3. Serveurs Applicatifs Core Banking / ERP",
                "4. Postes de Travail Prioritaires (Directions, Finance, IT)"
            ],
            "rto_target": f"{backup_rto_hours}h (Recovery Time Objective)",
            "rpo_target": f"{backup_rpo_hours}h (Recovery Point Objective)",
            "backup_verification_steps": [
                "Vérifier l'intégrité SHA-256 des sauvegardes avant restauration",
                "Restaurer en environnement réseau isolé pour éviter la réinfection",
                "Valider l'absence de persistance avant remise en production"
            ]
        }
        return self.recovery_plan

# Démonstration Réponse à Incident Ransomware
ir_engine = RansomwareIncidentResponseEngine("INC-RANSOM-2026-001", "PARADIS GLOBAL BANK")

print("=== RANSOMWARE INCIDENT RESPONSE ENGINE ===")

# Simulation de scan de fichiers sur les partages réseau
file_scan = [
    {"host": "SRV-FILESERVER-01", "path": "\\\\shares\\finance\\rapport_Q4.xlsx.locked"},
    {"host": "SRV-FILESERVER-01", "path": "\\\\shares\\hr\\salaires.docx.paradisencrypted"},
    {"host": "WKSTN-CFO-01",      "path": "C:\\Users\\cfo\\budget_2026.xlsx.locked"},
    {"host": "SRV-FILESERVER-02", "path": "\\\\shares\\legal\\contrats.pdf"}  # Légitime (pas chiffré)
]

blast = ir_engine.assess_blast_radius(file_scan)
containment = ir_engine.execute_containment_runbook("10.0.5.0/24")
recovery = ir_engine.build_recovery_plan(backup_rto_hours=4, backup_rpo_hours=24)

print("\n=== RANSOMWARE IR FULL REPORT ===")
print(json.dumps({"blast_radius": blast, "recovery_plan": recovery}, indent=2, ensure_ascii=False))
```

---

## 3) Module — Checklist de Durcissement Post-Incident (2h)

```markdown
# RANSOMWARE POST-INCIDENT HARDENING CHECKLIST

## 1. Suppression du Vecteur d'Entrée Initial
- [ ] Patcher la vulnérabilité exploitée (VPN, Exchange, RDP)
- [ ] Révoquer TOUTES les sessions et certificats de l'account compromis

## 2. Sauvegarde Hors-Ligne (Immutable Backups)
- [ ] Vérifier l'isolation réseau du stockage de sauvegardes (3-2-1 Backup Rule)
- [ ] Activer la fonctionnalité de **Backup Immutability** (AWS S3 Object Lock / Azure Blob WORM)

## 3. Hardening Active Directory
- [ ] Implémenter le Tiering Model Active Directory (Tier 0/1/2)
- [ ] Activer le **Protected Users Security Group** pour les comptes Tier-0
- [ ] Déployer Microsoft LAPS (Local Administrator Password Solution)

## 4. Segmentation Réseau Anti-Propagation
- [ ] Micro-segmenter les partages réseau (Least Privilege)
- [ ] Bloquer les protocoles latéraux RPC/SMB inutiles via GPO Windows Firewall
```

---

## 🏅 Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **RaaS** | Ransomware as a Service — Modèle d'affaires cybercriminel où des affiliés louent l'infrastructure Ransomware |
| **RTO / RPO** | Recovery Time Objective / Recovery Point Objective — Indicateurs de SLA de reprise d'activité |
| **Blast Radius** | Étendue de l'impact d'une attaque : nombre de systèmes, fichiers et données affectés |

---

## ❓ Banque de Questions & Test du Jour (5 QCM)

**Q1 :** Pourquoi les attaquants Ransomware suppriment-ils systématiquement les **Volume Shadow Copies (VSS)** avant de lancer le chiffrement ?
- A) Pour empêcher les victimes de restaurer des versions précédentes non chiffrées de leurs fichiers via Windows VSS, les forçant à payer la rançon
- B) Pour accélérer la vitesse du disque dur
- C) Pour contourner le pare-feu
- D) Parce que VSS est une fonctionnalité Linux

**Réponse : A**

**Q2 :** Dans un contexte Ransomware, que signifie le **Blast Radius** ?
- A) Le nombre total de systèmes, serveurs, postes de travail et fichiers affectés (chiffrés) lors d'une attaque de Ransomware
- B) L'adresse IP du serveur C2
- C) La taille de la rançon en bitcoins
- D) La durée totale de l'investigation forensique

**Réponse : A**

**Q3 :** Quel est le **premier** réflexe de confinement à effectuer lors de la détection active d'un Ransomware en cours d'exécution sur le réseau ?
- A) Isoler immédiatement le(s) segment(s) réseau impacté(s) du reste de l'infrastructure pour bloquer la propagation latérale via SMB, avant toute autre action
- B) Payer la rançon
- C) Redémarrer tous les serveurs
- D) Changer le fond d'écran Windows

**Réponse : A**

**Q4 :** Quelle règle de sauvegarde standard est recommandée pour résister à une attaque Ransomware ciblant les sauvegardes connectées ?
- A) La règle **3-2-1** : 3 copies de données, sur 2 supports différents, dont 1 copie hors-ligne ou immuable (offsite / air-gapped)
- B) 1 seule sauvegarde sur le même serveur
- C) Sauvegarder uniquement les fichiers PDF
- D) Stocker les sauvegardes sur la même partition chiffrée

**Réponse : A**

**Q5 :** Quelle est la différence critique entre le **RTO** et le **RPO** dans un plan de continuité d'activité (BCP/DRP) ?
- A) Le **RTO** définit le délai maximal acceptable pour restaurer les systèmes (ex: 4 heures), tandis que le **RPO** définit la quantité maximale de données qui peut être perdue (ex: 24 heures de données)
- B) RTO concerne les réseaux sans fil, RPO les bases de données
- C) Ce sont des termes identiques
- D) RPO est l'acronyme de Recovery Point Officer

**Réponse : A**

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
