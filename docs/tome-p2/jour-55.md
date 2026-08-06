# SEMESTRE 2 — Jour 55 (6h) : Routage Inter-VLAN & Protocoles de Routage Dynamique (OSPF)

> [!NOTE]
> **Objectif de la journée** : Faire communiquer des VLANs isolés (Routage Inter-VLAN) et configurer un réseau routé dynamique autonome avec OSPF.
> **Compétences visées** : `BIT-04` (Niveau Cible: A) — Routage dynamique.

---

## 1) Le Routage Inter-VLAN (Router-on-a-Stick & SVI) (1h30)

### 📖 1.1 Narration & Intuition
Les VLANs sont comme des coffres-forts étanches. Mais parfois, un utilisateur du VLAN "Compta" doit imprimer sur l'imprimante du VLAN "Services". Comment passer le mur ? Il faut un dispositif de Couche 3 (un routeur) qui fait le pont entre ces réseaux logiques.

### 🔍 1.2 Anatomie Technique
Deux architectures majeures :
- **Router-on-a-Stick (ROAS)** : Un lien physique Trunk 802.1Q relie le Switch L2 à un Routeur. Le routeur est découpé en "sous-interfaces" virtuelles (ex: `eth0.10` pour VLAN 10, `eth0.20` pour VLAN 20). Le trafic fait un aller-retour (goulot d'étranglement sur le lien physique).
- **Switch L3 / SVI (Switch Virtual Interface)** : Un Switch de Niveau 3 (Core Switch) intègre directement un moteur de routage matériel. On crée des SVI (Interfaces Virtuelles de Switch, ex: `interface vlan 10`). Le routage se fait à la vitesse du fond de panier (Wire-speed), c'est la norme en datacenter moderne.

### 🛠️ 1.3 Atelier Pratique Hands-on
Activer le routage (IP Forwarding) sur un Linux agissant comme Routeur :
```bash
# Vérifier l'état (0 = Désactivé)
sysctl net.ipv4.ip_forward

# Activer à la volée
sudo sysctl -w net.ipv4.ip_forward=1

# Pour persistance au reboot :
echo "net.ipv4.ip_forward = 1" | sudo tee -a /etc/sysctl.d/99-custom.conf
```

### 🚑 1.4 Diagnostic & Réflexes Terrain
Vous avez configuré votre ROAS mais le ping ne passe pas entre les VLANs ?
1. Vérifiez que la machine cliente a bien l'IP de la sous-interface du routeur en **Default Gateway**.
2. Vérifiez que le lien Switch-Routeur est bien en mode **Trunk** et autorise tous les VLANs nécessaires.

---

## 2) Introduction au Routage Dynamique (1h30)

### 📖 1.1 Narration & Intuition
Si vous gérez 3 routeurs, écrire les routes "à la main" (`ip route add`) est simple (Routage Statique). Mais si vous gérez le réseau mondial d'une banque (300 routeurs), une route statique devient un cauchemar. Les protocoles de routage dynamiques permettent aux routeurs de "discuter" et de recalculer automatiquement la meilleure route si un lien fibre est coupé par une pelleteuse.

### 🔍 1.2 Anatomie Technique
- **Vecteur de Distance (RIPv2, EIGRP)** : Partagent leur table de routage complète avec leurs voisins directs. Ex: "Je suis à 2 sauts du réseau X". Temps de convergence souvent lent (sauf EIGRP).
- **État de Liens (OSPF, IS-IS)** : Chaque routeur dresse une carte topologique (Map) complète du réseau (Base de données LSDB). Tous appliquent un algorithme mathématique (Dijkstra) pour trouver le chemin le plus court localement.

### 🛠️ 1.3 Atelier Pratique Hands-on
Afficher les routes dynamiques apprises (Linux via le daemon FRRouting - FRR) :
```bash
# Si FRR est installé (le standard moderne Linux remplaçant Quagga)
sudo vtysh
# Dans le shell vtysh :
show ip route
# (O = route OSPF, C = Connected, S = Statique, R = RIP)
```

### 🚑 1.4 Diagnostic & Réflexes Terrain
Un routeur injecte une "Route par Défaut" (`0.0.0.0/0`) mal configurée dans le protocole de routage. Résultat : tout le trafic Internet de l'entreprise s'engouffre vers le mauvais site géographique et tombe dans un trou noir (Blackhole). Toujours filtrer les injections de routes.

---

## 3) OSPF (Open Shortest Path First) - Single Area (2h00)

### 📖 1.1 Narration & Intuition
OSPF est le protocole standard industriel absolu pour les réseaux d'entreprise internes (IGP). Il utilise la notion de **Coût** (basé sur la bande passante) pour choisir le chemin. Un câble Fibre 10G coûtera "moins cher" qu'un vieux câble cuivre 100M.

### 🔍 1.2 Anatomie Technique
- **Hello Packets** : Envoyés toutes les 10 secondes (en Multicast `224.0.0.5`) pour découvrir les voisins (Adjacency).
- **LSA (Link State Advertisements)** : Messages informant de l'état des liens (Up, Down).
- **Area 0 (Backbone)** : OSPF est hiérarchique. Toutes les architectures OSPF doivent commencer par une Area 0 (Zone 0).
- **Router ID** : Le nom (sous format IP, ex: `1.1.1.1`) identifiant le routeur OSPF de manière unique.

### 🛠️ 1.3 Atelier Pratique Hands-on
Configuration d'un routeur OSPF dans FRRouting (`vtysh`) :
```bash
conf t
 router ospf
  ospf router-id 1.1.1.1
  # Annoncer le réseau connecté 10.0.0.0/24 dans l'Area 0
  network 10.0.0.0/24 area 0
  exit
exit
write memory
```

### 🚑 1.4 Diagnostic & Réflexes Terrain
Les routeurs OSPF refusent de devenir "voisins" (l'état reste bloqué sur INIT ou 2-WAY) ?
1. Les chronomètres (Hello / Dead timers) doivent correspondre exactement !
2. L'authentification (si activée) doit matcher.
3. Les MTU des interfaces doivent être identiques. C'est l'erreur numéro 1 en debug OSPF.

---

## Nouvelles abréviations rencontrées
- **ROAS** : Router-On-A-Stick
- **SVI** : Switch Virtual Interface
- **OSPF** : Open Shortest Path First
- **LSA** : Link State Advertisement
- **FRR** : FRRouting

---

## 🏧️ Exercices Pratiques (Preuves de Portfolio)

### Exercice 1 : Calcul du coût OSPF
- **Consigne** : Sachant que la formule de référence OSPF est `Cost = Reference_Bandwidth / Interface_Bandwidth`. La Reference par défaut est souvent de 100 Mbps. Calculez le coût pour une interface FastEthernet (100 Mbps) et une interface Gigabit (1000 Mbps). Quel est le problème avec ces valeurs par défaut sur des réseaux modernes ?
- **Corrigé détaillé & Guidé** :
- FastEthernet : $100 / 100 = 1$.
- Gigabit : $100 / 1000 = 0.1$ (arrondi à 1).
- **Problème** : Avec la référence à 100 Mbps, OSPF ne fait plus la différence entre un port 100M, 1G, 10G ou 100G (tous auront un coût de 1). Il faut modifier la bande passante de référence (`auto-cost reference-bandwidth 100000` sur tous les routeurs) pour que le Gigabit ait un coût de 100 et le 100G un coût de 1.

---

## ❓ Banque de Questions QCM (Évaluation 75% minimum)
1. QCM: En architecture Router-on-a-Stick, comment nomme-t-on le type de lien entre le switch et le routeur ? A) Access B) Trunk 802.1Q C) EtherChannel D) SVI. **Réponse: B**
2. QCM: Quel algorithme mathématique OSPF utilise-t-il pour calculer le plus court chemin ? A) Bellman-Ford B) DUAL C) Dijkstra D) RSA. **Réponse: C**
3. QCM: OSPF choisit la meilleure route en fonction de quelle métrique ? A) Le nombre de sauts (Hop Count) B) La latence (Ping) C) Le Coût (basé sur la bande passante) D) La charge CPU du routeur. **Réponse: C**
4. QCM: Quelle est l'adresse de multicast utilisée par OSPF pour découvrir les voisins (Hello packets) ? A) 224.0.0.1 B) 224.0.0.5 C) 255.255.255.255 D) 224.0.0.9. **Réponse: B**
5. QCM: Quelle zone OSPF est obligatoire et appelée Backbone ? A) Area 1 B) Area 100 C) Area 0.0.0.0 D) Area 0. **Réponse: D**

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
