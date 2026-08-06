# TOME P3 — Cloud Native, DevOps & Cyberdéfense — Jour 128 (6h) : Sécurité des Systèmes d'Exploitation Linux en Temps Réel (PREEMPT_RT Kernel, Industrial Real-Time Linux & Latency Isolation)

> [!NOTE]
> **Objectif du jour :** Comprendre l'architecture et la sécurité des systèmes d'exploitation Linux en Temps Réel Strict (Hard Real-Time Linux / Patch `PREEMPT_RT`) : ordonnancement déterministe (SCHED_FIFO / SCHED_DEADLINE), isolation des cœurs processeur (CPU Pinning / csets), inversion de priorité, et protection contre les latences imprévisibles sur les systèmes de trading ou de contrôle critique.
>
> **Compétences visées :** `BIT-09` (A) — Linux Temps Réel PREEMPT_RT | `SEC-03` (A) — Hardening Systèmes Déterministes

---

## 1) Module — Temps Réel Strict vs Soft Real-Time & Patch PREEMPT_RT (2h)

### 📖 Narration/Intuition

Dans une application informatique classique (Soft Real-Time), si un serveur met 200 ms au lieu de 20 ms pour répondre, l'utilisateur attend un peu mais le système ne plante pas.

Dans un système **Temps Réel Strict (Hard Real-Time)** (ex: algorithme d'arbitrage de marché financier Haute Fréquence de la BCC, ou contrôle de sécurité d'un automate nucléaire/bancaire), une réponse qui arrive **après l'échéance temporelle (Deadline)** est considérée comme une défaillance critique du système, quelle que soit la justesse du résultat.

Le patch **`PREEMPT_RT`** transforme le noyau Linux standard en un noyau Temps Réel en rendant les sections critiques du noyau préemptables et en remplaçant les verrous tournants (Spinlocks) par des Mutex préemptables avec héritage de priorité.

### 🔍 Anatomie Technique

**Comparaison de l'Ordonnancement Linux Standard vs PREEMPT_RT :**

```
NOYAU LINUX STANDARD (Non Déterministe) :
Appel Système / Section Critique ─── [ VERROU NON PREEMPTABLE ] ───> Latence Imprévisible (Sprints de 10-100ms)

NOYAU LINUX PREEMPT_RT (Temps Réel Strict) :
Appel Système ─── [ INTERRUPTIBILITÉ MAXIMALE ] ───> Interruption immédiate par la tâche RT (< 10µs)
```

---

## 2) Module — Isolation CPU (CPU Pinning) & Ordonnancement SCHED_DEADLINE (2h)

### 📖 Narration/Intuition

Pour garantir qu'une tâche Temps Réel ne soit jamais ralentie par les autres processus du système (ex: mise à jour système, indexation de logs), on utilise l'**isolation de processeur (CPU Pinning / csets)**. On réserve un ou plusieurs cœurs CPU exclusivement pour l'application Temps Réel et on interdit au noyau Linux d'y exécuter le moindre processus d'arrière-plan.

### 🔍 Anatomie Technique

**Isolation de cœurs CPU dans `/etc/default/grub` :**

```ini
# Isoler les cœurs CPU 2 et 3 de l'ordonnanceur Linux standard
GRUB_CMDLINE_LINUX_DEFAULT="quiet splash isolcpus=2,3 nohz_full=2,3 rcu_nocbs=2,3 idle=poll"
```

**Script Python de configuration d'Ordonnancement Temps Réel (`rt_scheduler.py`) :**

```python
#!/usr/bin/env python3
"""
rt_scheduler.py — Attribution de la politique d'ordonnancement temps réel SCHED_FIFO et CPU Affinity
"""
import os
import psutil

# 1. Obtenir l'identifiant du processus courant
pid = os.getpid()
p = psutil.Process(pid)

# 2. Fixer la liaison processeur (CPU Affinity) sur le cœur dédié #2
p.cpu_affinity([2])
print(f"[+] Processus PID {pid} verrouillé sur le cœur CPU #2.")

# 3. Appliquer la politique Temps Réel SCHED_FIFO avec priorité maximale (99)
# Nécessite les privilèges CAP_SYS_NICE ou root
try:
    os.sched_setscheduler(pid, os.SCHED_FIFO, os.sched_param(99))
    print("✅ Politique Temps Réel SCHED_FIFO (Priorité 99) appliquée avec succès !")
except PermissionError:
    print("❌ Erreur : Privilèges CAP_SYS_NICE ou root nécessaires pour SCHED_FIFO.")
```

---

## 3) Module — Inversion de Priorité & Outils de Mesure de Latence (cyclictest) (2h)

### 📖 Narration/Intuition

L'**Inversion de Priorité** est le piège mortel des systèmes temps réel : une tâche de basse priorité détient un verrou sur une ressource partagée. Une tâche de priorité moyenne s'exécute et empêche la tâche de basse priorité de terminer et de libérer le verrou. Résultat : la tâche haute priorité est bloquée indéfiniment par la tâche moyenne.

`PREEMPT_RT` intègre l'**Héritage de Priorité (Priority Inheritance)** : la tâche basse priorité hérite temporairement de la haute priorité de la tâche qui attend son verrou pour libérer la ressource au plus vite.

### 🔍 Anatomie Technique

**Mesure de la latence maximale du noyau avec `cyclictest` :**

```bash
# Installation de la suite d'outils temps réel Linux (rt-tests)
sudo apt update && sudo apt install -y rt-tests

# Lancer cyclictest sur les cœurs isolés pour mesurer la jitte/latence maximale en microsecondes (µs)
sudo cyclictest -m -sp99 -p99 -i100 -d0 -a2,3 -l100000

# Résultat attendu sur un Noyau PREEMPT_RT :
# Max Latency < 15 µs (Garantie déterministe Temps Réel)
# Résultat sur un Noyau Standard : Max Latency > 2000 µs (Non déterministe)
```

---

## 🏅 Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **PREEMPT_RT** | Patch officiel du noyau Linux apportant le temps réel strict (Hard Real-Time) |
| **SCHED_FIFO** | Politique d'ordonnancement temps réel Linux premier arrivé, premier servi |
| **SCHED_DEADLINE** | Ordonnanceur temps réel basé sur la théorie du plus proche délai d'échéance (EDF) |
| **Priority Inheritance** | Mécanisme évitant le blocage des tâches haute priorité par transfert temporaire de priorité |

---

## 🏋️ Exercices & Corrigés

**Exercice 1 :** Quelle est la différence entre un système **Temps Réel Soft** et un système **Temps Réel Hard (Strict)** ?

**Corrigé :** Dans un système **Soft Real-Time** (ex: streaming vidéo, navigateur web), le respect des délais est souhaitable pour la qualité d'expérience, mais le dépassement d'une deadline entraîne simplement un léger ralentissement sans dommage catastrophique. Dans un système **Hard Real-Time** (ex: trading haute fréquence bancaire, contrôle de freinage ABS, automates critiques), le non-respect d'une deadline (dépassement de quelques microsecondes) est considéré comme une **défaillance totale et inacceptable du système**.

**Exercice 2 :** Comment le mécanisme d'**Héritage de Priorité (Priority Inheritance)** résout-il le problème de l'inversion de priorité ?

**Corrigé :** Lorsqu'une tâche de haute priorité (Tâche A) est bloquée en attente d'un verrou détenu par une tâche de basse priorité (Tâche C), le noyau Linux `PREEMPT_RT` augmente immédiatement la priorité de la Tâche C au niveau de la Tâche A. Cela empêche n'importe quelle tâche de priorité intermédiaire (Tâche B) d'interrompre la Tâche C. La Tâche C termine rapidement son traitement, libère le verrou et permet à la Tâche A de s'exécuter sans délai.

---

## ❓ Banque de Questions & Test du Jour

**Q1 :** Quel patch officiel du noyau Linux transforme l'OS en un système d'exploitation temps réel strict (Hard Real-Time) à ordonnancement déterministe ?
- A) PREEMPT_RT
- B) MS-DOS
- C) Paint
- D) Word

**Réponse : A**

**Q2 :** Quel outil de mesure de la suite `rt-tests` permet d'évaluer la latence maximale (en microsecondes) d'un noyau Linux sous charge ?
- A) cyclictest
- B) Ping
- C) Gzip
- D) Telnet

**Réponse : A**

**Q3 :** Quelle politique d'ordonnancement Linux temps réel attribue une priorité fixe (de 1 à 99) et permet à un processus de s'exécuter sans interruption jusqu'à ce qu'il cède volontairement le processeur ?
- A) SCHED_FIFO
- B) SCHED_OTHER
- C) SCHED_BATCH
- D) SCHED_IDLE

**Réponse : A**

**Q4 :** Quel mécanisme empêche le phénomène d'inversion de priorité en augmentant temporairement la priorité d'une tâche basse possédant un verrou attendu par une tâche haute ?
- A) Priority Inheritance (Héritage de Priorité)
- B) Formatage de disque
- C) Redémarrage du serveur
- D) Effacement de logs

**Réponse : A**

**Q5 :** Quelle option de ligne de commande du noyau Linux (`isolcpus=...`) permet de réserver des cœurs CPU exclusivement pour une application temps réel en interdisant à l'ordonnanceur standard d'y placer d'autres processus ?
- A) Isolation CPU (CPU Pinning / isolcpus)
- B) Wifi
- C) USB
- D) VGA

**Réponse : A**

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
