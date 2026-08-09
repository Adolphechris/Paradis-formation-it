# TOME P8 — Blue Team, SOC & SIEM Advanced — Jour 369 (6h) : Network & Traffic Forensics — PCAP Deep-Dive (Wireshark, TShark, Zeek Packet Analysis, TLS Decryption & Protocol Dissection)

> [!NOTE]
> **Objectif du jour :** Maîtriser l'analyse forensique du trafic réseau au niveau paquets (**Network Traffic Forensics / PCAP Analysis**) : utiliser **Wireshark** et **TShark** en ligne de commande pour disséquer des captures PCAP volumineuses, reconstruire des flux TCP/HTTP, déchiffrer des connexions **TLS 1.2/1.3** à l'aide de fichiers de clés de session (`SSLKEYLOGFILE`), et extraire les payloads malveillants exfiltrés via des protocoles légitimes.
>
> **Compétences visées :** `DFIR-NET-01` (A) — PCAP Packet Dissection & TShark CLI Forensics | `DFIR-NET-02` (A) — TLS Decryption (SSLKEYLOGFILE), TCP Stream Reassembly & Payload Extraction

---

## 1) Module — Inspection de Paquets & TLS Decryption Workflow (2h)

### 📖 Narration/Intuition

Lorsque la télémétrie système ou EDR est insuffisante (ex. attaques sur des appareils IoT ou serveurs sans agent), la capture de paquets brute (**PCAP**) constitue la preuve réseau ultime. Cependant, avec la généralisation de TLS 1.3, le contenu du trafic est chiffré. L'analyse forensique réseau nécessite de savoir réinjecter les clés de session symétriques (`SSLKEYLOGFILE`) pour déchiffrer les paquets en clair.

```
       [ FICHIER CAPTURE RÉSEAU (traffic_incident.pcap) ]
                               │
                               ├─────────────────────────────────────────┐
                               ▼                                         ▼
                 [ SANS CLÉ TLS (Chiffré) ]               [ AVEC SSLKEYLOGFILE (Déchiffré) ]
                 - Paquets TLS Handshake                  - Reconstitution HTTP GET / POST
                 - SNI (Server Name Indication)           - Extraction Fichier Exfiltré (Payload)
                 - IP Source & Destination                - En-têtes HTTP & Cookies de Session
```

---

## 2) Module — Outillage PCAP Forensics Engine (`pcap_forensics_engine.py`) (2h)

### 🛠️ Atelier Pratique

```python
import json
import subprocess
from datetime import datetime, timezone
from typing import List, Dict

class PCAPForensicsEngine:
    """
    Moteur de dissection et d'analyse forensique PCAP automatisé basé sur TShark.
    Extrait les flux HTTP, reconstruit les fichiers transmis et analyse les poignées de main TLS.
    """

    def __init__(self, pcap_file_path: str, sslkeylog_path: str = None):
        self.pcap_path = pcap_file_path
        self.keylog_path = sslkeylog_path
        self.extracted_streams: List[dict] = []

    def build_tshark_command(self, display_filter: str, fields: List[str]) -> List[str]:
        """Construit la commande TShark CLI pour l'extraction de champs spécifiques."""
        cmd = ["tshark", "-r", self.pcap_path, "-Y", display_filter, "-T", "fields"]
        
        # Injection du fichier de clés SSLKEYLOGFILE pour déchiffrement TLS si fourni
        if self.keylog_path:
            cmd.extend(["-o", f"tls.keylog_file:{self.keylog_path}"])

        for f in fields:
            cmd.extend(["-e", f])

        return cmd

    def parse_http_requests_mock(self) -> List[dict]:
        """
        Simule l'extraction de requêtes HTTP/HTTPS déchiffrées depuis un fichier PCAP.
        """
        print(f"[*] Dissection du fichier PCAP : {self.pcap_path}")
        if self.keylog_path:
            print(f"[+] Clefs TLS injectées depuis : {self.keylog_path} (Déchiffrement Actif)")

        # Simulation de résultats d'extraction TShark
        mock_extracted_requests = [
            {
                "frame_number": 104,
                "src_ip": "10.0.4.15",
                "dest_ip": "185.220.101.5",
                "http_method": "POST",
                "http_host": "c2-gateway-finance.net",
                "uri": "/api/v1/upload_stolen_data",
                "user_agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
                "payload_size_bytes": 45000,
                "is_suspicious": True
            }
        ]

        self.extracted_streams.extend(mock_extracted_requests)
        return mock_extracted_requests

    def generate_pcap_report(self) -> dict:
        """Génère le rapport d'investigation forensique réseau."""
        return {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "pcap_file": self.pcap_path,
            "decryption_used": self.keylog_path is not None,
            "total_suspicious_streams": len(self.extracted_streams),
            "streams": self.extracted_streams
        }

# Démonstration Forensique PCAP
pcap_analyzer = PCAPForensicsEngine("capture_exfiltration.pcap", sslkeylog_path="keys_ssl.log")

print("=== PCAP FORENSICS & TRAFFIC DISSECTION ENGINE ===")
pcap_analyzer.parse_http_requests_mock()

print("\n=== RAPPORT FORENSIQUE TRAFIC RÉSEAU ===")
print(json.dumps(pcap_analyzer.generate_pcap_report(), indent=2, ensure_ascii=False))
```

---

## 3) Module — Commandes TShark CLI pour l'Investigation Rapid (2h)

```bash
# CHEATSHEET TSHARK CLI POUR L'ANALYSE FORENSIQUE RÉSEAU

# 1. Extraction de toutes les requêtes DNS avec leur résolution IP
tshark -r capture.pcap -Y "dns.flags.response == 1" -T fields -e frame.time -e ip.src -e dns.qry.name -e dns.a

# 2. Extraction des hôtes HTTP consultés et User-Agents
tshark -r capture.pcap -Y "http.request" -T fields -e ip.src -e http.host -e http.request.uri -e http.user_agent

# 3. Extraction de paquets TLS avec déchiffrement SSLKEYLOGFILE
tshark -r capture.pcap -o "tls.keylog_file:sslkeys.txt" -Y "http" -T fields -e ip.src -e ip.dst -e http.request.full_uri

# 4. Extraction d'un fichier binaire transféré en HTTP (Reconstitution du payload)
tshark -r capture.pcap --export-objects "http,./extracted_files/"
```

---

## 🏅 Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **PCAP** | Packet Capture — Format de fichier standard de capture de paquets réseau bruts |
| **TShark** | Version en ligne de commande (CLI) de l'analyseur de paquets Wireshark |
| **SSLKEYLOGFILE** | Variable d'environnement enregistrant les clés secrètes Master Secret de TLS pour déchiffrer le trafic |

---

## ❓ Banque de Questions & Test du Jour (5 QCM)

**Q1 :** Comment le fichier **`SSLKEYLOGFILE`** permet-il à un analyste DFIR de déchiffrer un trafic **TLS 1.3** capturé dans un fichier PCAP ?
- A) Il contient les clés de session symétriques éphémères générées par le navigateur/client lors du handshake, permettant à Wireshark/TShark de déchiffrer le contenu des paquets en clair
- B) Il contient le mot de passe root du serveur
- C) Il modifie l'adresse IP du client
- D) Il supprime le pare-feu réseau

**Réponse : A**

**Q2 :** Quelle commande **TShark** permet d'extraire et de sauvegarder automatiquement tous les fichiers (ex. malwares, images, PDFs) transmis via le protocole HTTP dans une capture PCAP ?
- A) `tshark -r capture.pcap --export-objects "http,./extracted_files/"`
- B) `tshark --delete-all`
- C) `tshark --ping`
- D) `tshark --format-disk`

**Réponse : A**

**Q3 :** Lors d'une investigation sur du trafic chiffré non déchiffrable, quelle information du handshake TLS reste visible en clair dans le paquet `Client Hello` ?
- A) Le nom du serveur cible (**SNI - Server Name Indication**)
- B) Le mot de passe de l'utilisateur
- C) Le contenu du formulaire HTML
- D) La clé privée RSA du serveur

**Réponse : A**

**Q4 :** Quel filtre d'affichage Wireshark/TShark permet d'isoler uniquement les réponses DNS résolues ?
- A) `dns.flags.response == 1`
- B) `http.request == true`
- C) `tcp.port == 80`
- D) `ip.addr == 127.0.0.1`

**Réponse : A**

**Q5 :** Qu'est-ce que la reconstitution de flux TCP (**TCP Stream Reassembly**) dans Wireshark ?
- A) L'assemblage ordonné de tous les segments TCP d'une même connexion pour restituer l'intégralité du dialogue applicatif échangé entre le client et le serveur
- B) La fermeture de la connexion réseau
- C) L'augmentation de la vitesse de téléchargement
- D) La suppression des entêtes IP

**Réponse : A**

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
