# TOME P3 — Cloud Native, DevOps & Cyberdéfense — Jour 127 (6h) : Sécurité de la Messagerie d'Entreprise & Protections Anti-Phishing (SPF, DKIM, DMARC, ARC & Email Gateways)

> [!NOTE]
> **Objectif du jour :** Concevoir et mettre en œuvre la sécurité complète du vecteur e-mail d'une institution bancaire : protocoles d'authentification anti-usurpation (SPF, DKIM, DMARC avec rapport RUA/RUF, ARC), pare-feu de messagerie (Secure Email Gateway - SEG), et filtrage des pièces jointes malveillantes.
>
> **Compétences visées :** `SEC-04` (A) — Sécurité de la Messagerie & Anti-Phishing | `BIT-04` (A) — Authentification DNS & Messagerie

---

## 1) Module — Le Trio d'Authentification e-Mail : SPF, DKIM & DMARC (2h)

### 📖 Narration/Intuition

L'e-mail est le vecteur n°1 utilisé par les cybercriminels pour mener des attaques d'ingénierie sociale (Phishing, Arnaque au Président / BEC). Le protocole SMTP d'origine ne vérifie pas l'adresse de l'expéditeur : n'importe qui peut envoyer un e-mail prétendant venir de `gouverneur@bcc.cd`.

Pour empêcher cette usurpation d'identité (Domain Spoofing), on combine 3 mécanismes complémentaires :
- **SPF (Sender Policy Framework)** : Liste dans le DNS les adresses IP des serveurs autorisés à envoyer des e-mails pour le domaine.
- **DKIM (DomainKeys Identified Mail)** : Signe cryptographiquement (RSA/ECC) l'en-tête et le corps du message avec une clé privée.
- **DMARC (Domain-based Message Authentication, Reporting, and Conformance)** : Indique au serveur destinataire la politique à appliquer (none, quarantine, reject) si SPF ou DKIM échouent, et envoie des rapports d'attaque à l'administrateur.

### 🔍 Anatomie Technique

**Fonctionnement de l'Authentification DMARC :**

```
   Expéditeur Phishing (Fake IP)                   Serveur Messagerie Destinataire
   (Pretends: gouverneur@bcc.cd)                   (ex: Gmail / Banque Partner)
               │                                                │
               │ 1. Envoi SMTP E-mail (No DKIM Signature)       │
               ├───────────────────────────────────────────────→│
                                                                │ 2. Interroge DNS bcc.cd :
                                                                │    - SPF: IP non répertoriée ❌
                                                                │    - DKIM: Signature manquante ❌
                                                                │ 3. Évalue la Politique DMARC :
                                                                │    p=reject (Rejet Strict !)
                                                                │
                                                                ▼
                                                   [ E-MAIL REJETÉ & POUBELLE ]
                                                   + Rapport d'attaque envoyé à rne@bcc.cd
```

---

## 2) Module — Configuration des Enregistrements DNS SPF, DKIM & DMARC (2h)

### 📖 Narration/Intuition

La mise en œuvre de DMARC exige une configuration DNS d'une précision chirurgicale sous peine de voir les e-mails légitimes de la banque rejetés par les serveurs distants.

### 🔍 Anatomie Technique

**1. Enregistrement TXT SPF (`bcc.cd`) :**
```text
bcc.cd. IN TXT "v=spf1 ip4:196.200.10.50 ip4:196.200.10.51 include:_spf.google.com -all"
```
*Explication : Seules les IPs 196.200.10.50 et 51 ainsi que les serveurs Google sont autorisés. Le `-all` (Hard Fail) rejette strictement toutes les autres IPs.*

**2. Enregistrement TXT DKIM (`mail._domainkey.bcc.cd`) :**
```text
mail._domainkey.bcc.cd. IN TXT "v=DKIM1; k=rsa; p=MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA0Z..."
```
*Explication : Fournit la clé publique RSA permettant au destinataire de vérifier la signature numérique des e-mails.*

**3. Enregistrement TXT DMARC (`_dmarc.bcc.cd`) :**
```text
_dmarc.bcc.cd. IN TXT "v=DMARC1; p=reject; sp=reject; pct=100; rua=mailto:dmarc-rua@bcc.cd; ruf=mailto:dmarc-ruf@bcc.cd; adkim=s; aspf=s"
```
*Explication : Policy `reject` à 100%. Alignement strict (`adkim=s`, `aspf=s`). Les rapports agrégés sont envoyés à `dmarc-rua@bcc.cd`.*

---

## 3) Module — Validation & Authentification de Messagerie avec Python (2h)

### 📖 Narration/Intuition

Les passerelles de messagerie (Secure Email Gateways - SEG) et les scripts d'audit automatisent l'inspection des en-têtes d'e-mails pour vérifier l'alignement DMARC et détecter les pièces jointes malveillantes (macro Office, binaires exécutables).

### 🔍 Anatomie Technique

**Script Python de vérification d'alignement DMARC et analyse d'en-tête (`email_security_checker.py`) :**

```python
#!/usr/bin/env python3
"""
email_security_checker.py — Inspecteur d'en-têtes et de conformité DMARC/SPF/DKIM
"""
import dns.resolver
import email
import sys

DOMAIN = "bcc.cd"

def auditer_dmarc(domaine):
    print(f"[+] Audit de l'enregistrement DMARC pour '{domaine}'...")
    try:
        answers = dns.resolver.resolve(f"_dmarc.{domaine}", 'TXT')
        for rdata in answers:
            txt_record = str(rdata)
            print(f"    ✅ Enregistrement DMARC trouvé : {txt_record}")
            if "p=reject" in txt_record:
                print("    🔒 POLITIQUE CRITIQUE : p=reject (Sécurité Maximale).")
            elif "p=quarantine" in txt_record:
                print("    ⚠️ POLITIQUE MOYENNE : p=quarantine.")
            else:
                print("    ❌ POLITIQUE FAIBLE : p=none (Aucune protection contre le spoofing !)")
    except Exception as e:
        print(f"    ❌ ERREUR : Aucun enregistrement DMARC valide pour {domaine} ({e})")

if __name__ == "__main__":
    auditer_dmarc(DOMAIN)
```

---

## 🏅 Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **SPF** | Sender Policy Framework — Liste DNS des serveurs autorisés à émettre des e-mails |
| **DKIM** | DomainKeys Identified Mail — Signature cryptographique des e-mails |
| **DMARC** | Domain-based Message Authentication, Reporting, and Conformance — Politique d'action et rapports anti-spoofing |
| **ARC** | Authenticated Received Chain — Préserve les validations d'authentification e-mail lors de transferts |
| **SEG** | Secure Email Gateway — Passerelle de sécurité et pare-feu de messagerie |

---

## 🏋️ Exercices & Corrigés

**Exercice 1 :** Quelle est la différence entre la directive `~all` (Soft Fail) et la directive `-all` (Hard Fail) dans un enregistrement SPF DNS ?

**Corrigé :** La directive `~all` (Soft Fail) indique que si l'e-mail provient d'une IP non répertoriée dans l'enregistrement SPF, l'e-mail doit quand même être accepté par le serveur destinataire, mais marqué comme potentiellement suspect (spam). La directive `-all` (Hard Fail) est une **interdiction stricte** : tout e-mail émis depuis une IP non listée doit être immédiatement **rejeté (Refused/Dropped)** par le serveur destinataire. C'est la configuration recommandée pour une institution bancaire.

**Exercice 2 :** Qu'est-ce que l'**alignement DMARC** (DMARC Alignment) et pourquoi est-il indispensable pour bloquer le Phishing ?

**Corrigé :** Un e-mail possède deux adresses d'expéditeur : l'adresse technique de transmission (`RFC5321.MailFrom` / Return-Path) et l'adresse affichée à l'utilisateur (`RFC5322.From`). Un attaquant peut passer la vérification SPF en utilisant son propre domaine dans le Return-Path, tout en affichant `gouverneur@bcc.cd` dans l'adresse visuelle `From`. L'**alignement DMARC** exige que le domaine vérifié par SPF ou DKIM corresponde **exactement** au domaine affiché dans l'en-tête `From` visible par l'utilisateur.

---

## ❓ Banque de Questions & Test du Jour

**Q1 :** Quel enregistrement DNS liste les adresses IP autorisées à envoyer des e-mails au nom d'un domaine d'entreprise ?
- A) SPF (Sender Policy Framework)
- B) MS Paint
- C) Disquette
- D) HDMI

**Réponse : A**

**Q2 :** Quel mécanisme d'authentification de messagerie utilise la cryptographie asymétrique (RSA/ECC) pour signer numériquement les en-têtes et le corps des e-mails ?
- A) DKIM (DomainKeys Identified Mail)
- B) Bluetooth
- C) FTP
- D) Telnet

**Réponse : A**

**Q3 :** Quelle politique DMARC (`p=...`) ordonne aux serveurs de messagerie destinataires de rejeter immédiatement et définitivement tout e-mail qui échoue aux contrôles d'alignement SPF/DKIM ?
- A) `p=reject`
- B) `p=none`
- C) `p=allow`
- D) `p=ignore`

**Réponse : A**

**Q4 :** Quel protocole récent (RFC 8617) permet de conserver les validations d'authentification SPF/DKIM/DMARC lorsqu'un e-mail légitime est réacheminé ou transféré par une liste de diffusion intermédiaire ?
- A) ARC (Authenticated Received Chain)
- B) POP3
- C) Gzip
- D) Systemd

**Réponse : A**

**Q5 :** Dans un enregistrement DMARC, à quoi sert la balise `rua=mailto:dmarc-reports@bcc.cd` ?
- A) À spécifier l'adresse e-mail à laquelle les serveurs de messagerie du monde entier doivent envoyer des rapports d'audit agrégés quotidiens sur les e-mails émis au nom du domaine
- B) À réinitialiser les mots de passe
- C) À fermer le port 80
- D) À effacer la base de données

**Réponse : A**

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
