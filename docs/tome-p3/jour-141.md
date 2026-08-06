# TOME P3 — Cloud Native, DevOps & Cyberdéfense — Jour 141 (6h) : Sécurité du Wi-Fi 7 (802.11be) & WPA3 Enterprise (WPA3-192bit, EAP-TLS & Wi-Fi Sensing Security)

> [!NOTE]
> **Objectif du jour :** Déployer et sécuriser les réseaux sans-fil d'entreprise de dernière génération Wi-Fi 7 (IEEE 802.11be) : mode de sécurité WPA3-Enterprise 192-bit, authentification forte EAP-TLS avec certificats X.509/ECC, protection des trames de gestion (PMF / 802.11w) et sécurité du Wi-Fi Sensing / MLO (Multi-Link Operation).
>
> **Compétences visées :** `BIT-04` (A) — Wi-Fi 7 (802.11be) & MLO | `SEC-04` (A) — WPA3 Enterprise 192-bit Security

---

## 1) Module — Wi-Fi 7 (802.11be) & Multi-Link Operation (MLO) (2h)

### 📖 Narration/Intuition

Le **Wi-Fi 7 (IEEE 802.11be / Extremely High Throughput)** est la norme réseau sans-fil la plus rapide et la plus complexe jamais créée. Elle introduit le **Multi-Link Operation (MLO)** : un terminal (ordinateur, smartphone) peut émettre et recevoir simultanément des paquets sur les 3 bandes de fréquences (2.4 GHz, 5 GHz et 6 GHz) en agrégeant leur bande passante.

Cette complexité multi-liens crée de nouveaux défis de sécurité : si le lien 2.4 GHz est brouillé ou intercepté par un attaquant, comment garantir la confidentialité et l'intégrité de la session globale ?

### 🔍 Anatomie Technique

**Architecture Wi-Fi 7 MLO & WPA3 Enterprise 192-bit :**

```
TERMINAL CLIENT WI-FI 7 (UE)                   POINT D'ACCÈS WI-FI 7 (AP)             SERVEUR RADIUS (FreeRADIUS)
┌───────────────────────────┐                 ┌───────────────────────────┐           ┌───────────────────────────┐
│ Multi-Link Operation (MLO)│                 │ WPA3 192-bit Mode         │           │ EAP-TLS Authentication    │
│  - Link 1: 2.4 GHz        │                 │ PMF (802.11w Mandatory)   │           │ Client Cert: ECC P-384    │
│  - Link 2: 5 GHz          │================>│ GCMP-256 / Suite B Crypto │==========>│ Server Cert: ECC P-384    │
│  - Link 3: 6 GHz          │                 │                           │           │                           │
└───────────────────────────┘                 └───────────────────────────┘           └───────────────────────────┘
```

---

## 2) Module — WPA3 Enterprise Mode 192-bit (CNSA Suite) (2h)

### 📖 Narration/Intuition

Le mode **WPA3 Enterprise 192-bit** (également appelé mode CNSA - Commercial National Security Algorithm) est le niveau de chiffrement le plus élevé de l'alliance Wi-Fi. Il impose des algorithmes cryptographiques militaires :
- Chiffrement symétrique des données : **GCMP-256** (Galois Counter Mode 256 bits).
- Échange de clés EAP-TLS : Courbe elliptique **ECDHE_ECDSA avec P-384**.
- Hachage de clés : **HMAC-SHA-384**.
- Protection des trames de gestion (PMF) : **BIP-GMAC-256**.

### 🔍 Anatomie Technique

**Configuration FreeRADIUS pour WPA3 Enterprise 192-bit (`eap.conf`) :**

```ini
# Configuration FreeRADIUS / EAP-TLS 192-bit Mode
eap {
    default_eap_type = tls
    timer_expire = 60
    
    tls-config tls-common {
        private_key_file = ${certdir}/server_ecdsa_p384.key
        certificate_file = ${certdir}/server_ecdsa_p384.crt
        CA_file = ${cadir}/bcc_wifi_ca.pem
        dh_file = ${certdir}/dh
        
        # Exiger TLS 1.3 avec les ciphersuites 192-bit CNSA
        tls_max_version = "1.3"
        tls_min_version = "1.3"
        cipher_list = "ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384"
        
        # Vérification stricte du certificat client
        check_crl = yes
    }
}
```

---

## 3) Module — Protection des Trames de Gestion (802.11w PMF) & Audit (2h)

### 📖 Narration/Intuition

En WPA2, les trames de déauthentification (Deauth Frames) circulaient en clair, permettant à n'importe qui de couper la connexion Wi-Fi d'un utilisateur. En WPA3, l'activation des **PMF (Protected Management Frames - IEEE 802.11w)** est **OBLIGATOIRE**.

### 🔍 Anatomie Technique

**Verification des PMF WPA3 avec Wpa_supplicant et TShark :**

```bash
# 1. Inspecter la configuration wpa_supplicant.conf
# pmf=2 signifie PMF Required (Strict)
cat /etc/wpa_supplicant/wpa_supplicant.conf | grep pmf

# 2. Inspecter les trames 802.11be MLO et PMF avec TShark
sudo tshark -i wlan0mon -Y "wlan.fc.type_subtype == 0x000c" -V | grep -i "Protected Management"
```

---

## 🏅 Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **MLO** | Multi-Link Operation — Agrégation et utilisation simultanée de plusieurs bandes (2.4/5/6 GHz) en Wi-Fi 7 |
| **802.11be** | Standard IEEE du Wi-Fi 7 (Extremely High Throughput) |
| **GCMP-256** | Galois Counter Mode 256 bits — Chiffrement symétrique ultra-sécurisé WPA3 192-bit |
| **CNSA** | Commercial National Security Algorithm — Suite cryptographique recommandée pour la sécurité nationale |

---

## 🏋️ Exercices & Corrigés

**Exercice 1 :** Quelle est la différence majeure entre le mode **WPA3-Enterprise 128-bit** et le mode **WPA3-Enterprise 192-bit (CNSA)** ?

**Corrigé :** Le mode WPA3 128-bit utilise le chiffrement AES-128 et autorise RSA-2048. Le mode **WPA3-Enterprise 192-bit (CNSA)** impose une suite cryptographique homogène hautement sécurisée : chiffrement des données en **GCMP-256**, signatures et échanges de clés sur courbe elliptique **P-384**, hachage en **SHA-384** et protection des trames de gestion en **BIP-GMAC-256**. Aucun algorithme de niveau 128-bit n'est toléré.

**Exercice 2 :** Pourquoi la fonctionnalité **Multi-Link Operation (MLO)** du Wi-Fi 7 améliore-t-elle la résilience réseau des terminaux mobiles bancaires ?

**Corrigé :** Dans les normes Wi-Fi précédentes (Wi-Fi 5/6), un terminal ne pouvait être connecté qu'à une seule bande de fréquence à la fois (ex: 5 GHz). Si cette bande subissait des interférences ou des attaques par brouillage radio (Jamming), la connexion s'interrompait. Avec **MLO (Wi-Fi 7)**, le terminal est connecté simultanément sur 2.4 GHz, 5 GHz et 6 GHz. Si une bande est perturbée, les paquets réseau basculent de manière transparente et instantanée sur les autres liens actifs sans aucune perte de paquet.

---

## ❓ Banque de Questions & Test du Jour

**Q1 :** Quelle norme IEEE définit la technologie sans-fil Wi-Fi 7 (Extremely High Throughput) ?
- A) IEEE 802.11be
- B) MS-DOS
- C) Disquette
- D) Câble VGA

**Réponse : A**

**Q2 :** Quelle fonctionnalité clé du Wi-Fi 7 permet à un équipement d'émettre et de recevoir simultanément du trafic sur les trois bandes de fréquences (2.4 GHz, 5 GHz et 6 GHz) ?
- A) Multi-Link Operation (MLO)
- B) Bluetooth 1.0
- C) Port parallèle
- D) Lecteur CD

**Réponse : A**

**Q3 :** Quel algorithme de chiffrement symétrique 256 bits est exigé par le mode WPA3-Enterprise 192-bit (CNSA Suite) ?
- A) GCMP-256
- B) WEP 64-bit
- C) DES
- D) MD5

**Réponse : A**

**Q4 :** Pourquoi l'activation des Protected Management Frames (PMF / 802.11w) est-elle obligatoire en WPA3 ?
- A) Pour chiffrer et signer les trames de gestion (ex: deauthentication) afin d'empêcher les attaques par déconnexion forcée du Wi-Fi
- B) Pour accélérer l'impression
- C) Pour éteindre le routeur
- D) Pour effacer le disque dur

**Réponse : A**

**Q5 :** Quel protocole d'authentification EAP basé sur la validation mutuelle de certificats X.509/ECC est le standard pour le mode WPA3 Enterprise ?
- A) EAP-TLS
- B) EAP-MD5
- C) Password en clair
- D) POP3

**Réponse : A**

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
