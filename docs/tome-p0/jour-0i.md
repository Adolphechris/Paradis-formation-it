# Jour J0I — Le Métier d'Expert Cybersécurité & Hacker Éthique

> [!NOTE]
> **SEMESTRE 0 — PARCOURS D'INITIATION ET SOCLE DE PRÉ-REQUIS ABSOLUS (J0a–J0o)**  
> Cette leçon vous plonge dans le monde de la sécurité informatique, de la défense des systèmes et du hacking éthique.

---

## 🎯 Objectifs de la Leçon
- 🛡️ Comprendre ce qu'est la **Cybersécurité** et les principes de la Trinité **CIA** (Confidentialité, Intégrité, Disponibilité).
- 🎩 Distinguer les Hackers **Chapeaux Blancs (Ethical)**, **Noirs (Cybercriminels)** et **Gris**.
- ⚔️ Comprendre l'affrontement entre la **Red Team** (Attaque) et la **Blue Team** (Défense / SOC).
- ⚖️ Connaître le cadre légal et éthique du Pentest.

---

## 🖼️ Cybersécurité & Hacking Éthique
![Cybersécurité](https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800)

---

## 📖 1. La Trinité de la Cybersécurité : La Règle C-I-A

Toute la sécurité informatique vise à protéger trois piliers fondamentaux :
1. **Confidentialité (C)** : S'assurer que seules les personnes autorisées ont accès aux données (chiffrement, mots de passe, MFA).
2. **Intégrité (I)** : Garantir que les données n'ont pas été modifiées ou altérées par un attaquant (signatures numériques, hashs).
3. **Disponibilité (A)** : Veiller à ce que les systèmes et serveurs restent accessibles aux utilisateurs légitimes sans interruption (protection anti-DDoS, redondance).

---

## 📖 2. Les Couleurs du Hacking : White Hat vs Black Hat

- **White Hat (Hacker Éthique / Chapeau Blanc)** : Expert en sécurité engagé légalement par les entreprises pour tester et découvrir les failles de sécurité *avant* que les criminels ne les exploitent.
- **Black Hat (Cybercriminel / Chapeau Noir)** : Attaquant malveillant qui pirate les systèmes sans autorisation pour voler des données, extorquer de l'argent (ransomwares) ou détruire des infrastructures.

---

## 📖 3. Red Team vs Blue Team : L'Entraînement des Armées Numériques

Dans les grandes organisations et institutions bancaires :
- **Red Team (L'Attaque)** : Simule des attaques réelles avancées pour tester la résistance globale des défenses et des collaborateurs.
- **Blue Team (La Défense / SOC)** : Surveille le réseau 24h/24, détecte les intrusions, analyse les malwares et stoppe les attaques en temps réel.

---

## 🧪 2. Atelier Pratique : Calculer une Empreinte de Sécurité (Hash SHA-256)

En cybersécurité, pour vérifier l'intégrité d'un fichier et s'assurer qu'il n'a pas été altéré, on calcule son "empreinte digitale" (*Hash*). Tapez cette commande dans votre terminal :

```bash
# Générer le hash SHA-256 d'un texte pour vérifier son intégrité
echo -n "PARADIS_IT_SECURITY" | sha256sum
```

---

## ❓ Banque de QCM & Test du Jour (5 Questions)

**Q1 : Que désignent les trois lettres C-I-A en cybersécurité ?**
- A) Control, Intelligence, Action
- B) Confidentialité, Intégrité, Disponibilité
- C) Cloud, Internet, Apple
- D) Central Internal Architecture

*Réponse : B — La trinité CIA représente la Confidentialité, l'Intégrité et la Disponibilité des données.*

**Q2 : Quelle est la mission principale d'un "Hacker Éthique" (White Hat) ?**
- A) Pirater les comptes bancaires pour s'enrichir
- B) Identifier légalement les failles de sécurité avec l'autorisation de l'entreprise pour les corriger
- C) Détruire les serveurs des concurrents
- D) Bloquer l'accès à Internet

*Réponse : B — Le hacker éthique teste la sécurité de manière autorisée pour renforcer les défenses.*

**Q3 : Quel est le rôle de la "Blue Team" dans une entreprise ?**
- A) Concevoir des jeux vidéo
- B) Assurer la défense en temps réel, la surveillance du SOC et la réaction aux incidents de sécurité
- C) Vendre des ordinateurs bleus
- D) Attaquer les serveurs distants

*Réponse : B — La Blue Team est l'équipe défensive chargée de la détection et de la réponse aux attaques.*

**Q4 : Qu'est-ce qu'un "Ransomware" (Rançongiciel) ?**
- A) Un logiciel de nettoyage de disque dur
- B) Un logiciel malveillant qui chiffre les fichiers d'une victime et exige une rançon financier pour les débloquer
- C) Un antivirus gratuit
- D) Un câble réseau rapide

*Réponse : B — Le ransomware chiffre les données des entreprises pour exiger une rançon.*

**Q5 : À quoi sert un algorithme de hachage comme SHA-256 en sécurité ?**
- A) À afficher des photos
- B) À calculer l'empreinte digitale unique d'une donnée pour garantir son intégrité
- C) À éteindre le processeur
- D) À accélérer le démarrage de Windows

*Réponse : B — Un hash permet de vérifier qu'un fichier n'a pas été altéré ou modifié.*

---

*Semestre 0 — Module d'Initiation & Pré-requis Absolus PARADIS IT Masterclass*
