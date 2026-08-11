# TOME P10 — Intelligence Artificielle, ML & MLOps — Jour 468 (6h) : Apprentissage par Renforcement (RL) : Équation de Bellman, Q-Learning, Deep Q-Network (DQN) & Proximal Policy Optimization (PPO)

> [!NOTE]
> **Objectifs pédagogiques :**
> - Comprendre le formalisme des **Processus de Décision de Markov (MDP)** : État $S$, Action $A$, Récompense $R$, Politique $\pi$, Valeur $V(s)$
> - Dériver l'**Équation d'Optimalité de Bellman** et l'itération de valeur
> - Implémenter l'algorithme **Deep Q-Network (DQN)** avec Replay Buffer et Target Network en PyTorch
> - Analyser le fonctionnement de **PPO (Proximal Policy Optimization)** et son rôle dans l'alignement LLM via RLHF
>
> **Compétences visées :** `AI-01` (A) — Reinforcement Learning & Deep RL

---

## Module 1 — Formalisme des MDP & Équation de Bellman (2h)

### 📖 Intuition & Narration

L'Apprentissage par Renforcement (RL) se distingue du Machine Learning Supervisé : il n'y a pas d'expert pour donner la "bonne réponse" à chaque étape. Un **Agent** interagit avec un **Environnement** dynamique. À chaque étape temporel $t$, l'agent observe l'état $s_t$, choisit une action $a_t$, reçoit une récompense scalaire $r_t$, et passe au nouvel état $s_{t+1}$.

L'objectif absolu de l'agent est de maximiser la somme cumulée des récompenses futures pondérées par un facteur de remise $\gamma \in [0, 1[$ (le **Return $G_t$**).

### 开启 Anatomie Technique — Équation d'Optimalité de Bellman

```
CYCLE D'INTERACTION AGENT-ENVIRONNEMENT (MDP)

          ┌──────────────────────────────────────────────┐
          │               ENVIRONNEMENT                  │
          └───────┬──────────────────────────────▲───────┘
                  │                              │
     Récompense R_t│                              │ Action A_t
        État S_t  │                              │
                  ▼                              │
          ┌──────────────────────────────────────┴───────┐
          │                  AGENT                       │
          │         Politique π(a|s) = P(A_t=a | S_t=s)  │
          └──────────────────────────────────────────────┘

ÉQUATION DE BELLMAN POUR LA FONCTION DE VALEUR D'ACTION Q*(s, a) :

  Q*(s, a) = E [ R_t+1 + γ * max_{a'} Q*(S_t+1, a') | S_t = s, A_t = a ]

  - Q*(s, a) représente le retour futur espéré si l'on prend l'action 'a' depuis l'état 's' puis que l'on agit de manière optimale.
  - γ (Discount Factor) : Valorise les récompenses immédiates par rapport aux récompenses lointaines (ex: γ = 0.99).
```

---

## Module 2 — Atelier Pratique : Deep Q-Network (DQN) en PyTorch (2h)

### 🛠️ Code PyTorch : Implémentation DQN avec Replay Memory & Target Network

```python
#!/usr/bin/env python3
"""
PARADIS — Agent Deep Q-Network (DQN) complet avec Replay Buffer & Target Network
Apprentissage par renforcement pour optimisation de routage/allocation de ressources.
"""

import random
from collections import deque
import torch
import torch.nn as nn
import torch.optim as optim
import numpy as np

# 1. Réseau de Neurones Q-Network
class QNetwork(nn.Module):
    def __init__(self, state_dim, action_dim):
        super().__init__()
        self.net = nn.Sequential(
            nn.Linear(state_dim, 64),
            nn.ReLU(),
            nn.Linear(64, 64),
            nn.ReLU(),
            nn.Linear(64, action_dim)
        )

    def forward(self, x):
        return self.net(x)

# 2. Tampon de Reconstitution (Experience Replay Buffer)
class ReplayBuffer:
    def __init__(self, capacity=10000):
        self.buffer = deque(maxlen=capacity)

    def push(self, state, action, reward, next_state, done):
        self.buffer.append((state, action, reward, next_state, done))

    def sample(self, batch_size):
        state, action, reward, next_state, done = zip(*random.sample(self.buffer, batch_size))
        return (
            torch.tensor(np.array(state), dtype=torch.float32),
            torch.tensor(action, dtype=torch.long),
            torch.tensor(reward, dtype=torch.float32),
            torch.tensor(np.array(next_state), dtype=torch.float32),
            torch.tensor(done, dtype=torch.float32)
        )

    def __len__(self):
        return len(self.buffer)

# 3. Agent DQN
class DQNAgent:
    def __init__(self, state_dim, action_dim, lr=1e-3, gamma=0.99, epsilon=1.0):
        self.state_dim = state_dim
        self.action_dim = action_dim
        self.gamma = gamma
        self.epsilon = epsilon
        self.epsilon_min = 0.05
        self.epsilon_decay = 0.995

        # Policy Network & Target Network (stabilité)
        self.policy_net = QNetwork(state_dim, action_dim)
        self.target_net = QNetwork(state_dim, action_dim)
        self.target_net.load_state_dict(self.policy_net.state_dict())
        self.target_net.eval()

        self.optimizer = optim.Adam(self.policy_net.parameters(), lr=lr)
        self.memory = ReplayBuffer()

    def select_action(self, state):
        # Exploration epsilon-greedy
        if random.random() < self.epsilon:
            return random.randint(0, self.action_dim - 1)
        with torch.no_grad():
            state_t = torch.tensor(state, dtype=torch.float32).unsqueeze(0)
            q_values = self.policy_net(state_t)
            return q_values.argmax(dim=1).item()

    def train_step(self, batch_size=32):
        if len(self.memory) < batch_size:
            return

        states, actions, rewards, next_states, dones = self.memory.sample(batch_size)

        # Q(s, a) actuel
        q_values = self.policy_net(states)
        state_action_values = q_values.gather(1, actions.unsqueeze(1)).squeeze(1)

        # Q_target(s', a') via Target Network
        with torch.no_grad():
            next_q_values = self.target_net(next_states).max(dim=1)[0]
            expected_state_action_values = rewards + (1 - dones) * self.gamma * next_q_values

        # Perte Huber (Smooth L1 Loss)
        loss = nn.functional.smooth_l1_loss(state_action_values, expected_state_action_values)

        self.optimizer.zero_grad()
        loss.backward()
        self.optimizer.step()

        # Décroissance de l'exploration
        if self.epsilon > self.epsilon_min:
            self.epsilon *= self.epsilon_decay

    def update_target_network(self):
        self.target_net.load_state_dict(self.policy_net.state_dict())

def run_dqn_demo():
    agent = DQNAgent(state_dim=4, action_dim=2)
    print("[*] Agent DQN Initialisé (StateDim=4, ActionDim=2)")

    # Simulation d'une étape de jeu
    state = np.array([0.1, -0.2, 0.05, 0.1])
    action = agent.select_action(state)
    next_state = np.array([0.12, -0.15, 0.04, 0.08])
    reward = 1.0
    done = False

    agent.memory.push(state, action, reward, next_state, done)
    agent.train_step(batch_size=1)
    agent.update_target_network()

    print(f"[+] Action sélectionnée par Epsilon-Greedy (eps={agent.epsilon:.2f}) : {action}")
    print("  ✅ Étape DQN (Experience Replay + Target Net Update) validée.")

if __name__ == "__main__":
    run_dqn_demo()
```

---

## Module 3 — Proximal Policy Optimization (PPO) & RLHF (1h30)

### 🔍 PPO & Alignement LLM via RLHF

```
MÉCANISME DE DÉCOUPAGE PPO (Clipped Surrogate Objective)

  Formule de Perte PPO (Schulman et al. 2017) :
  L_CLIP(θ) = E [ min( r_t(θ) * A_t , clip(r_t(θ), 1-ε, 1+ε) * A_t ) ]

  où :
  - r_t(θ) = π_θ(a_t | s_t) / π_old(a_t | s_t)  (Ratio entre nouvelle et ancienne politique)
  - A_t : Fonction d'Avantage (Advantage Function — la valeur de l'action par rapport à la moyenne)
  - ε   : Seuil de tronquage (clipping), typiquement ε = 0.2

POURQUOI PPO EST L'ALGORITHME STANDARD EN RLHF ?
  1. Évite les mises à jour destructrices de politique (Policy Collapse).
  2. Grande stabilité numérique et efficacité d'échantillonnage (Sample Efficiency).
  3. Utilisé pour aligner ChatGPT / LLaMA-Instruct sur les préférences humaines via Reward Model.
```

---

## Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **MDP** | Markov Decision Process — Formalisme mathématique des problèmes de décision séquentielle |
| **DQN** | Deep Q-Network — Combinaison du Q-Learning et des réseaux de neurones profonds |
| **PPO** | Proximal Policy Optimization — Algorithme Policy Gradient stable avec fonction objectif tronquée |
| **RLHF** | Reinforcement Learning from Human Feedback — Alignement des modèles par renforcement humain |
| **Target Net** | Réseau réseau cible gelé périodiquement pour stabiliser le calcul du Q-Target |

---

## Exercices Pratiques

### Exercice 1 — Calcul d'Équation de Bellman

Dans un environnement de décision réseau à 2 états ($S_1, S_2$) :
- Depuis $S_1$, en prenant l'action $A_1$, l'agent reçoit une récompense immédiate $R = +10$ et atterrit en $S_2$ avec certitude.
- La valeur $V(S_2)$ de l'état futur est estimée à $+50$.
- Le facteur de remise est $\gamma = 0.90$.

Calculez la valeur de l'action $Q(S_1, A_1)$ selon l'équation de Bellman.

**Corrigé guidé :**
$$\begin{aligned}
Q(S_1, A_1) &= R + \gamma \cdot V(S_2) \\
&= 10 + (0.90 \times 50) \\
&= 10 + 45 = 55.
\end{aligned}$$
La valeur estimée de cette action depuis l'état $S_1$ est de **55**.

---

## Banque QCM — 5 Questions

**Q1.** Dans un Processus de Décision de Markov (MDP), que stipule l'**Propriété de Markov** ?

- A) Que le futur dépend de l'ensemble de l'historique depuis le début des temps.
- B) Que l'état futur $S_{t+1}$ dépend UNIQUEMENT de l'état présent $S_t$ et de l'action présente $A_t$, et non de la séquence d'états passés. ✅
- C) Que la récompense est toujours égale à zéro.
- D) Que le facteur de remise $\gamma = 1.0$.

**Q2.** À quoi sert le **Replay Buffer (Experience Replay)** dans l'algorithme DQN ?

- A) À sauvegarder le modèle sur disque dur.
- B) À briser la corrélation temporelle entre des expériences consécutives en ré-échantillonnant des minibatches aléatoires $(s, a, r, s', done)$ du passé, stabilisant ainsi le gradient SGD. ✅
- C) À accélérer le temps de réponse réseau.
- D) À supprimer les états perdants.

**Q3.** Pourquoi l'algorithme DQN utilise-t-il un **Target Network** distinct du Policy Network ?

- A) Pour exécuter le code en multithreading.
- B) Pour éviter que la valeur cible $Q_{target} = r + \gamma \max Q(s', a')$ ne varie continuellement à chaque pas de mise à jour des poids, ce qui provoquerait des oscillations et une instabilité d'entraînement. ✅
- C) Pour chiffrer les requêtes HTTPS.
- D) Pour réduire le nombre d'actions possibles.

**Q4.** Quel est le rôle du mécanisme de **Clipping (tronquage)** dans la fonction objectif de **PPO (Proximal Policy Optimization)** ?

- A) Réduire la résolution des images.
- B) Empêcher les mises à jour de poids trop brutales qui éloigneraient trop la nouvelle politique $\pi_\theta$ de l'ancienne politique $\pi_{old}$. ✅
- C) Tronquer les mots dans les phrases.
- D) Limiter l'utilisation de la RAM.

**Q5.** Dans une stratégie d'exploration **Epsilon-Greedy ($\epsilon$-greedy)** avec $\epsilon = 0.1$ :

- A) L'agent choisit l'action optimale avec une probabilité de 10%.
- B) L'agent choisit une action complètement aléatoire (exploration) 10% du temps, et l'action estimée comme meilleure (exploitation) 90% du temps. ✅
- C) L'agent arrête de s'entraîner 10% du temps.
- D) La récompense est réduite de 10%.

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
