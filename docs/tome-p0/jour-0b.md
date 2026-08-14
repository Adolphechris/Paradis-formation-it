# Jour J0B — La Logique Binaire : Pourquoi tout est 0 et 1 ?

> [!NOTE]
> **SEMESTRE 0 — PARCOURS D'INITIATION ET SOCLE DE PRÉ-REQUIS ABSOLUS (J0a–J0o)**  
> Cette leçon explique clairement pourquoi et comment les ordinateurs traduisent textes, images, sons et programmes en simples séries de 0 et de 1.

---

## 🎯 Objectifs de la Leçon
- 💡 Comprendre pourquoi l'électronique numérique utilise le système binaire (`0` et `1`).
- 🔢 Maitriser la définition exacte du **bit** et de l'**octet (byte)**.
- 📏 Connaître la chaîne des unités de stockage (Octet, Ko, Mo, Go, To, Po).
- 🔤 Découvrir le principe de l'encodage des caractères (ASCII et Unicode / UTF-8).

---

## 🖼️ Le Monde en Binaire
![Logique Binaire](https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800)

---

## 📖 1. Pourquoi des 0 et des 1 ?

### 1.1 L'Interrupteur Électronique
Au cœur de tous les composants électroniques de votre ordinateur (processeur, RAM, SSD), il y a des milliards de minuscules transistors. Un transistor agit exactement comme un **interrupteur de lumière** :
- Soit le courant ne passe pas : état **ÉTEINT** (`0` ou tension nulle `0 Volt`).
- Soit le courant passe : état **ALLUMÉ** (`1` ou tension positive `+1.2 Volt`).

Puisque les composants électroniques ne savent que mesurer la présence ou l'absence d'électricité, le langage le plus naturel et le plus fiable pour un ordinateur est le **système binaire (base 2)**.

---

## 📖 2. Du Bit à l'Octet (Byte)

### 2.1 Qu'est-ce qu'un Bit ?
Un **bit** (contraction de *Binary Digit*) est la plus petite unité d'information en informatique. Il ne peut prendre que deux valeurs : **`0`** ou **`1`**.

### 2.2 Qu'est-ce qu'un Octet (Byte en anglais) ?
Un seul bit ne permet d'exprimer que deux états (ex: Oui/Non, Vrai/Faux). Pour représenter des nombres plus grands, des lettres ou des symboles, on regroupe **8 bits ensemble**.
Un paquet de 8 bits s'appelle un **octet** (*byte* en anglais).

Exemple d'octet : `01000001` (qui représente le nombre 65 en binaire, ou la lettre `A` majuscule).

---

## 📖 3. L'Échelle des Tailles de Données

| Unité | Symbole | Valeur exacte / Équivalent concret |
| :--- | :---: | :--- |
| **Bit** | b | `0` ou `1` (un interrupteur) |
| **Octet (Byte)** | O (B) | 8 bits (un seul caractère texte, ex: 'a') |
| **Kilooctet** | Ko (KB) | ~1 000 octets (une page de texte simple) |
| **Mégaoctet** | Mo (MB) | ~1 000 Ko (une chanson MP3 ou une photo) |
| **Gigaoctet** | Go (GB) | ~1 000 Mo (un film HD ou 8 Go de RAM) |
| **Téraoctet** | To (TB) | ~1 000 Go (un disque dur moderne de 1 ou 2 To) |
| **Pétaoctet** | Po (PB) | ~1 000 To (un grand centre de données Cloud) |

---

## 📖 4. Encodage des Textes : Comment une Lettre devient Binaire ?

### 4.1 La Table ASCII
Comment l'ordinateur sait-il que `01000001` correspond à la lettre `A` ? Grâce à une convention internationale appelée **ASCII** (*American Standard Code for Information Interchange*).
À chaque lettre et symbole est attribué un numéro :
- `A` = 65 = `01000001`
- `B` = 66 = `01000010`
- `a` = 97 = `01100001`

### 4.2 L'Unicode / UTF-8
Pour prendre en charge les alphabets du monde entier (français avec accents, chinois, arabe, émojis 🚀), l'industrie a créé **UTF-8**, la norme universelle du Web moderne qui peut encoder plus de 140 000 caractères différents sur 1 à 4 octets.

---

## 🧪 2. Atelier Pratique : Traduire du Texte en Binaire en Bash

Tapez cette commande dans votre terminal Linux pour voir la représentation binaire et hexadécimale du mot "PARADIS" :

```bash
# Convertir du texte en valeur hexadécimale/binaire
echo -n "PARADIS" | xxd -b
```

---

## ❓ Banque de QCM & Test du Jour (5 Questions)

**Q1 : Pourquoi les ordinateurs fonctionnent-ils exclusivement avec des 0 et des 1 ?**
- A) Parce que les informaticiens n'aiment pas les chiffres de 2 à 9
- B) Parce que les transistors électroniques ne mesurent que la présence (1) ou l'absence (0) de courant électrique
- C) Parce que la langue anglaise n'utilise que deux lettres
- D) Parce que les disques durs ne peuvent stocker que deux fichiers

*Réponse : B — Le binaire dérive de la nature physique des transistors électroniques (états ouvert/fermé).*

**Q2 : Combien de bits forment exactement un octet (Byte) ?**
- A) 2 bits
- B) 4 bits
- C) 8 bits
- D) 100 bits

*Réponse : C — Un octet est rigoureusement un ensemble de 8 bits.*

**Q3 : Quelle est l'unité de mesure immédiatement supérieure au Gigaoctet (Go) ?**
- A) Le Kilooctet (Ko)
- B) Le Mégaoctet (Mo)
- C) Le Téraoctet (To)
- D) Le Pétaoctet (Po)

*Réponse : C — 1 Téraoctet (To) équivaut à 1 000 Gigaoctets (Go).*

**Q4 : Quel standard d'encodage moderne permet de représenter tous les alphabets du monde ainsi que les émojis ?**
- A) ASCII 1963
- B) UTF-8 / Unicode
- C) MS-DOS Prompt
- D) ISO-8859-1

*Réponse : B — UTF-8 est le standard universel moderne capable d'encoder l'ensemble des caractères mondiaux et émojis.*

**Q5 : Si un fichier texte contient exactement 500 caractères ASCII, quelle sera approximativement sa taille sur le disque ?**
- A) 500 octets (bytes)
- B) 500 Gigaoctets
- C) 5 Octets
- D) 50 Mégaoctets

*Réponse : A — En ASCII standard, chaque caractère occupe exactement 1 octet ; 500 caractères occupent donc 500 octets.*

---

*Semestre 0 — Module d'Initiation & Pré-requis Absolus PARADIS IT Masterclass*
