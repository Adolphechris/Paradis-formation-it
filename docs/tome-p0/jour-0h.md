# Jour J0H — Le Métier d'Administrateur Système & Ingénieur Cloud

> [!NOTE]
> **SEMESTRE 0 — PARCOURS D'INITIATION ET SOCLE DE PRÉ-REQUIS ABSOLUS (J0a–J0o)**  
> Cette leçon vous fait découvrir les coulisses, les responsabilités et les carrières des ingénieurs qui font tourner les serveurs et le Cloud mondial.

---

## 🎯 Objectifs de la Leçon
- 👨‍💻 Découvrir le rôle quotidien de l'Administrateur Système (SysAdmin) et de l'Ingénieur Cloud.
- 🏢 Comprendre la notion d'**Infrastructure SI** et de **Haute Disponibilité**.
- 🛠️ Identifier les missions clés : Déploiement, Supervision, Sauvegarde, Sécurisation.
- 📈 Découvrir les perspectives de carrière et la valeur sur le marché du travail.

---

## 🖼️ Le Quotidien de l'Ingénieur IT
![Ingénieur Cloud & SysAdmin](https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800)

---

## 📖 1. Qu'est-ce qu'un Administrateur Système (SysAdmin) ?

L'**Administrateur Système** est le gardien de l'infrastructure informatique d'une entreprise. Son rôle est de s'assurer que les serveurs, les systèmes d'exploitation, les bases de données et les services réseau fonctionnent sans interruption, en toute sécurité, 24 heures sur 24 et 7 jours sur 7.

### Ses 5 Responsabilités Majeures :
1. **Installation & Configuration** : Déployer et configurer des serveurs Linux et Windows.
2. **Supervision (Monitoring)** : Surveiller la santé des machines (CPU, RAM, Disques) pour intervenir *avant* la panne.
3. **Gestion des Accès & Sécurité** : Créer les comptes utilisateurs, appliquer le principe du moindre privilège et sécuriser les accès SSH/Réseau.
4. **Sauvegarde (Backup) & Plan de Reprise (PRA)** : S'assurer qu'en cas d'incident (panne ou cyberattaque), les données peuvent être restaurées en quelques minutes.
5. **Mise à Jour & Patching** : Appliquer les correctifs de sécurité pour combler les failles.

---

## 📖 2. De l'Administrateur Système à l'Ingénieur Cloud & DevOps

Avec l'évolution de l'informatique vers le Cloud (AWS, Azure, Google Cloud), le métier de SysAdmin s'est enrichi :
- **Ingénieur Cloud** : Gère des milliers de serveurs virtuels automatisés dans les Data Centers distants.
- **Ingénieur DevOps / Infrastructure-as-Code** : Écrit du code (Terraform, Ansible) pour déployer une infrastructure réseau complète en quelques secondes.

---

## 🧪 2. Atelier Pratique : Voir le Temps d'Activité d'un Serveur

Dans votre terminal Linux, tapez cette commande pour afficher la charge du système et son temps d'activité ininterrompu (*Uptime*) :

```bash
# Afficher depuis combien de temps le système tourne sans redémarrage
uptime
```

---

## ❓ Banque de QCM & Test du Jour (5 Questions)

**Q1 : Quel est le rôle principal d'un Administrateur Système (SysAdmin) ?**
- A) Réparer les câbles électriques des bâtiments
- B) Garantir le fonctionnement continu, la sécurité et la disponibilité des serveurs et infrastructures IT
- C) Dessiner des logos pour les sites web
- D) Vendre des ordinateurs en magasin

*Réponse : B — Le SysAdmin veille sur la santé, la disponibilité et la sécurité des serveurs de l'entreprise.*

**Q2 : Que signifie l'expression "Haute Disponibilité" (High Availability) en informatique ?**
- A) Que les ordinateurs sont vendus à un prix élevé
- B) Que les services informatiques sont conçus pour fonctionner sans interruption même en cas de panne d'un matériel
- C) Que le bureau de l'ingénieur est au dernier étage
- D) Que le Wi-Fi est gratuit

*Réponse : B — La haute disponibilité garantit la continuité de service grâce à la redondance des équipements.*

**Q3 : Pourquoi les sauvegardes (Backups) sont-elles vitales pour une entreprise ?**
- A) Pour vider la mémoire RAM
- B) Pour pouvoir restaurer immédiatement les données et réouvrir l'activité en cas de panne ou de ransomware
- C) Pour accélérer la vitesse d'Internet
- D) Pour économiser l'électricité

*Réponse : B — Les sauvegardes sont l'assurance-vie des données de l'entreprise face aux sinistres et cyberattaques.*

**Q4 : Que permet l'approche "Infrastructure-as-Code" (IaC) utilisée par les ingénieurs DevOps ?**
- A) De dessiner des serveurs sur du papier
- B) D'automatiser le déploiement et la configuration de centaines de serveurs via du code texte répétable
- C) De supprimer le besoin d'électricité
- D) De fabriquer des câbles réseau

*Réponse : B — L'IaC permet de déployer toute une infrastructure cloud en exécutant un fichier de configuration.*

**Q5 : Quelle commande Linux permet de vérifier le temps d'activité ininterrompu d'un serveur (*Uptime*) ?**
- A) `time`
- B) `uptime`
- C) `clock`
- D) `rundate`

*Réponse : B — `uptime` affiche l'heure, la durée de fonctionnement continu du serveur et la charge moyenne.*

---

*Semestre 0 — Module d'Initiation & Pré-requis Absolus PARADIS IT Masterclass*
