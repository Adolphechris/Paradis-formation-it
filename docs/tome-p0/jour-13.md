# SEMESTRE 1 — Jour 13 (6h) : Protocoles de Résolution DNS, DHCP & ARP

> [!NOTE]
> **Objectif de la journée** : Comprendre et diagnostiquer la trinité des services vitaux d'un réseau : l'attribution d'IP (DHCP), la traduction d'IP en MAC (ARP), et la traduction de noms de domaine en IP (DNS).
> **Compétences visées** : `BIT-04` (A), `POL-02` (A) — Services réseau DNS/DHCP/ARP.

---

## 1) Résolution matérielle : ARP (1h30)

### 📖 1.1 Narration & Intuition
Pour parler à une machine sur le même réseau local, il faut connaître son adresse MAC (Couche 2). Mais les logiciels n'utilisent que des adresses IP (Couche 3). Comment trouver la MAC correspondant à une IP ? C'est le rôle de l'ARP (Address Resolution Protocol). La machine crie dans le réseau : "Qui a l'IP 192.168.1.10 ? Dites-moi votre adresse MAC !" et la machine concernée répond.

### 🔍 1.2 Anatomie Technique
- **Requête ARP (ARP Request)** : Envoyée en broadcast MAC (`FF:FF:FF:FF:FF:FF`). "Qui a l'IP X ?"
- **Réponse ARP (ARP Reply)** : Envoyée en unicast (directement au demandeur). "J'ai l'IP X et ma MAC est Y."
- **Table ARP** : L'ordinateur met en cache ces correspondances pendant quelques minutes pour éviter de crier sans cesse.

### 🛠️ 1.3 Atelier Pratique Hands-on
```bash
# Afficher la table ARP (cache) de votre machine Linux
ip neigh show
# Ou l'ancienne commande :
arp -a

# Vider le cache ARP (pour forcer une nouvelle résolution)
sudo ip neigh flush all
```

### 🚑 1.4 Diagnostic & Réflexes Terrain
- **Symptôme** : "IP Conflict" (Conflit d'adresse IP) ou déconnexions aléatoires.
- **Cause possible** : ARP Spoofing/Poisoning (un attaquant prétend avoir l'IP de la passerelle) ou deux machines configurées avec la même IP fixe.
- **Réflexe** : Regarder la table ARP pour voir si la MAC de la passerelle change tout le temps.

---

## 2) Attribution automatique : DHCP (1h30)

### 📖 2.1 Narration & Intuition
Connecter un ordinateur à un réseau sans DHCP, c'est comme arriver dans un hôtel et devoir chercher soi-même une chambre vide, espérer que personne ne la prendra, et deviner où est la sortie. Le DHCP (Dynamic Host Configuration Protocol) est le réceptionniste : il vous attribue une chambre (IP), la sortie (Passerelle/Gateway), et l'annuaire (DNS).

### 🔍 2.2 Anatomie Technique
- Le processus fonctionne en 4 étapes (DORA) :
  1. **D**iscover : "Y a-t-il un serveur DHCP ?" (Broadcast).
  2. **O**ffer : Le serveur répond "Oui, voici une IP possible : 192.168.1.50".
  3. **R**equest : Le client "Je veux bien l'IP 192.168.1.50".
  4. **A**cknowledge : Le serveur "C'est validé pour X heures (bail/lease)".

### 🛠️ 2.3 Atelier Pratique Hands-on
```bash
# Demander manuellement un nouveau bail DHCP sur eth0
sudo dhclient -v eth0

# Libérer l'adresse IP actuelle
sudo dhclient -r eth0
```

### 🚑 2.4 Diagnostic & Réflexes Terrain
- **Symptôme** : Vous avez une IP qui commence par `169.254.x.x` (APIPA).
- **Cause** : Votre machine a fait un DHCP Discover mais aucun serveur n'a répondu.
- **Réflexe** : Le serveur DHCP (souvent la box internet ou le routeur) est tombé, injoignable, ou n'a plus d'IP disponibles dans son pool. Vérifiez la liaison physique.

---

## 3) Résolution de Noms : DNS (2h00)

### 📖 3.1 Narration & Intuition
Personne ne retient les numéros de téléphone de tous ses contacts ; on utilise un carnet d'adresses. Le DNS (Domain Name System) est l'annuaire mondial d'Internet. Il traduit "google.com" en "142.250.174.46". C'est un système hiérarchique distribué : aucun serveur ne connaît tout.

### 🔍 3.2 Anatomie Technique
- **Enregistrement A** : Traduit un nom (Ex: `www.paradis.fr`) vers une IP**v4**.
- **Enregistrement AAAA** : Traduit un nom vers une IP**v6**.
- **Enregistrement CNAME** : Un alias (ex: `web.paradis.fr` pointe vers `www.paradis.fr`).
- **Enregistrement MX** : Désigne le serveur qui gère les e-mails de ce domaine.
- **Enregistrement PTR** : L'inverse de A. Traduit une IP vers un nom de domaine (Reverse DNS).
- Le DNS utilise le port **UDP 53**.

### 🛠️ 3.3 Atelier Pratique Hands-on
```bash
# Résolution simple et affichage concis
host google.com

# Outil avancé pour diagnostiquer les enregistrements DNS
dig google.com +short
dig google.com MX +short

# Ancien outil interactif toujours présent (Windows/Linux)
nslookup google.com
```

### 🚑 3.4 Diagnostic & Réflexes Terrain
- **Symptôme** : Vous pouvez pinger `8.8.8.8` mais pas `google.com`.
- **Cause** : Problème DNS ! Le réseau marche, mais l'annuaire est injoignable ou faux.
- **Réflexe** : Vérifiez le fichier `/etc/resolv.conf` sous Linux pour voir quels serveurs DNS votre machine interroge. Testez avec `dig @8.8.8.8 google.com` pour forcer la requête via un serveur public.

---

## 🏧️ Exercices Pratiques (Preuves de Portfolio)

### Exercice 1 : Investigation DNS et ARP
- **Consigne** : Trouvez l'adresse IP des serveurs e-mail (MX) de "github.com". Ensuite, déterminez l'adresse MAC de votre passerelle par défaut.
- **Livrables à produire** : Captures des commandes et de leurs résultats.
- **Corrigé détaillé & Guidé** :
```bash
# 1. Pour les serveurs mail de github :
dig github.com MX +short
# Le résultat affichera des adresses comme alt1.aspmx.l.google.com.

# 2. Trouver l'IP de la passerelle :
ip route show | grep default
# Supposons que l'IP soit 192.168.1.1.

# 3. Pinger la passerelle pour remplir le cache ARP :
ping -c 1 192.168.1.1

# 4. Lire l'adresse MAC dans la table ARP :
ip neigh show | grep 192.168.1.1
# Résultat : 192.168.1.1 dev eth0 lladdr 00:11:22:33:44:55 REACHABLE
```

---

## ❓ Banque de Questions QCM (Évaluation 75% minimum)
1. **Que fait le protocole ARP ?**
   A) Traduit un nom de domaine en IP  B) Traduit une IP en adresse MAC  C) Attribue automatiquement des IPs  D) Route les paquets
   *Réponse: B*

2. **Lorsqu'un client DHCP cherche un serveur, quel type de message envoie-t-il au réseau ?**
   A) Unicast  B) Multicast  C) Broadcast  D) Anycast
   *Réponse: C*

3. **Quel type d'enregistrement DNS est utilisé pour indiquer le serveur de messagerie d'un domaine ?**
   A) A  B) CNAME  C) PTR  D) MX
   *Réponse: D*

4. **Quelle commande Linux n'est PAS conçue pour diagnostiquer le DNS ?**
   A) dig  B) host  C) nslookup  D) arp
   *Réponse: D*

5. **Que signifie une adresse IP en 169.254.x.x (APIPA) sur une machine configurée en DHCP ?**
   A) Le bail a expiré et a été renouvelé avec succès.  B) Le serveur DNS ne répond pas.  C) Aucun serveur DHCP n'a été trouvé.  D) Le réseau utilise de l'IPv6.
   *Réponse: C*
