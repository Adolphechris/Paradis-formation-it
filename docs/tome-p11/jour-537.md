# TOME P11 — DevSecOps, Cloud Security & Gouvernance — Jour 537 (6h) : Kubernetes Security Hardening : PSA, OPA/Gatekeeper, Network Policies & Runtime Security (Falco)

> [!NOTE]
> **Objectifs pédagogiques :**
> - Appliquer les **Pod Security Admission (PSA)** pour restreindre les capacités des Pods Kubernetes selon les profils Privileged, Baseline et Restricted
> - Déployer et configurer **OPA/Gatekeeper** pour écrire des politiques d'admission personnalisées en Rego
> - Implémenter des **Network Policies** Kubernetes pour créer une micro-segmentation réseau entre les Namespaces
> - Détecter les comportements anormaux en temps réel dans les conteneurs avec **Falco** (Runtime Security)
>
> **Compétences visées :** `SEC-07` (A), `INFRA-02` (A) — Kubernetes Security, Runtime Security

---

## Module 1 — Pod Security Admission & Durcissement des Workloads (2h)

### 📖 Intuition & Narration

Un cluster Kubernetes non sécurisé est équivalent à une immense salle de serveurs avec toutes les portes déverrouillées. Par défaut, un Pod peut :
- S'exécuter en tant que **root** (UID 0)
- Monter le **socket Docker** du nœud hôte (escalade de privilèges triviale)
- Utiliser `hostNetwork: true` (voir tout le trafic réseau de l'hôte)
- Accéder aux **secrets** d'autres Namespaces via le compte de service par défaut

Le durcissement Kubernetes consiste à fermer méthodiquement toutes ces portes par défaut.

### 🔍 Anatomie Technique — Niveaux PSA et SecurityContext

```yaml
# NIVEAU RESTRICTED : Profil le plus strict (recommandé production)
# Activer PSA sur un Namespace
apiVersion: v1
kind: Namespace
metadata:
  name: app-production
  labels:
    # Rejette les Pods ne respectant pas le profil "restricted"
    pod-security.kubernetes.io/enforce: restricted
    pod-security.kubernetes.io/enforce-version: latest
    # Avertit (sans bloquer) pour le niveau "baseline"
    pod-security.kubernetes.io/warn: baseline
---
# SecurityContext durci pour un Pod en production
apiVersion: v1
kind: Pod
metadata:
  name: api-backend
  namespace: app-production
spec:
  securityContext:
    runAsNonRoot: true          # Interdit l'exécution en tant que root (UID 0)
    runAsUser: 10001            # UID applicatif dédié
    runAsGroup: 10001
    seccompProfile:
      type: RuntimeDefault      # Profil seccomp par défaut du runtime
    fsGroup: 10001
  containers:
  - name: api
    image: registry.paradis.internal/api:1.0.0
    securityContext:
      allowPrivilegeEscalation: false   # Interdit sudo / setuid
      readOnlyRootFilesystem: true      # Système de fichiers en lecture seule
      capabilities:
        drop: ["ALL"]                    # Supprime TOUTES les capabilities Linux
        add: ["NET_BIND_SERVICE"]        # Ré-ajoute uniquement ce qui est nécessaire
    resources:
      limits:
        memory: "256Mi"
        cpu: "500m"
```

---

## Module 2 — OPA/Gatekeeper & Network Policies (2h)

### 🔍 OPA Gatekeeper — Politiques d'Admission Kubernetes en Rego

**OPA (Open Policy Agent)** est un moteur de politique généraliste. **Gatekeeper** est son intégration Kubernetes via un webhook d'admission validant.

Chaque `ConstraintTemplate` définit une politique Rego. Chaque `Constraint` instancie cette politique avec des paramètres.

```yaml
# ConstraintTemplate : Interdit les images sans tag spécifique (pas de :latest)
apiVersion: templates.gatekeeper.sh/v1beta1
kind: ConstraintTemplate
metadata:
  name: k8snolatestimage
spec:
  crd:
    spec:
      names:
        kind: K8sNoLatestImage
  targets:
    - target: admission.k8s.gatekeeper.sh
      rego: |
        package k8snolatestimage
        violation[{"msg": msg}] {
          container := input.review.object.spec.containers[_]
          endswith(container.image, ":latest")
          msg := sprintf("Image '%v' utilise le tag ':latest' qui est interdit en production.", [container.image])
        }
---
# Constraint : Applique la règle à tous les Namespaces de production
apiVersion: constraints.gatekeeper.sh/v1beta1
kind: K8sNoLatestImage
metadata:
  name: interdire-tag-latest
spec:
  match:
    namespaces: ["app-production", "app-staging"]
```

### 🔍 Network Policies — Micro-Segmentation Réseau

Par défaut dans Kubernetes, **tous les Pods peuvent communiquer avec tous les autres Pods**, indépendamment du Namespace. Les `NetworkPolicy` permettent de définir des règles de pare-feu L3/L4 au niveau Pod.

```yaml
# Network Policy : Isole le Namespace "app-production"
# Seul l'ingress-controller peut appeler l'API backend
# Seul le backend peut appeler la base de données
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: politique-isolation-backend
  namespace: app-production
spec:
  podSelector:
    matchLabels:
      app: api-backend
  policyTypes:
  - Ingress
  - Egress
  ingress:
  - from:
    - namespaceSelector:
        matchLabels:
          name: ingress-nginx
      podSelector:
        matchLabels:
          app: ingress-nginx
    ports:
    - protocol: TCP
      port: 8080
  egress:
  - to:
    - podSelector:
        matchLabels:
          app: postgres
    ports:
    - protocol: TCP
      port: 5432
  # Autoriser la résolution DNS
  - to:
    - namespaceSelector: {}
    ports:
    - protocol: UDP
      port: 53
```

---

## Module 3 — Falco : Détection d'Anomalies Runtime (1h30)

### 🛠️ Atelier Pratique — Déploiement et Règles Falco

**Falco** est un outil de détection d'anomalies comportementales en temps réel pour les conteneurs. Il se connecte au noyau Linux via un driver eBPF et génère des alertes dès qu'un comportement inhabituel est détecté.

```bash
#!/bin/bash
# --- Installation de Falco avec Helm ---
helm repo add falcosecurity https://falcosecurity.github.io/charts
helm repo update
helm install falco falcosecurity/falco \
  --namespace falco \
  --create-namespace \
  --set driver.kind=ebpf \
  --set falcosidekick.enabled=true \
  --set falcosidekick.config.slack.webhookurl="https://hooks.slack.com/services/XXXXX/YYYYY/ZZZZZ"

echo "[✅] Falco déployé. Les alertes sont envoyées vers Slack."
```

```yaml
# Règle Falco personnalisée : Détecte un shell spawné dans un conteneur
- rule: Shell Spawné dans un Conteneur
  desc: Détecte toute tentative d'ouverture d'un shell interactif (bash/sh) dans un conteneur en production
  condition: >
    spawned_process and
    container and
    not container.image.repository in (allowed_maintenance_images) and
    proc.name in (shell_binaries)
  output: >
    Shell détecté dans conteneur (user=%user.name cmd=%proc.cmdline
    container=%container.name image=%container.image.repository:%container.image.tag
    k8s_ns=%k8s.ns.name k8s_pod=%k8s.pod.name)
  priority: CRITICAL
  tags: [container, shell, paradis_custom]
```

---

## Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **PSA** | Pod Security Admission — Contrôleur Kubernetes natif pour l'application de profils de sécurité des Pods |
| **OPA** | Open Policy Agent — Moteur de politique généraliste basé sur le langage Rego |
| **Rego** | Langage déclaratif utilisé pour écrire des politiques dans OPA |
| **Seccomp** | Secure Computing — Mécanisme Linux permettant de restreindre les appels système autorisés pour un processus |
| **eBPF** | Extended Berkeley Packet Filter — Technologie kernel Linux permettant l'observation et la sécurité sans modification du code noyau |

---

## Exercices Pratiques

### Exercice 1 — Audit de la Sécurité d'un Pod

Examinez ce manifeste Kubernetes et identifiez **5 failles de sécurité** :

```yaml
spec:
  containers:
  - name: app
    image: myapp:latest
    securityContext:
      privileged: true
    volumeMounts:
    - name: docker-socket
      mountPath: /var/run/docker.sock
  volumes:
  - name: docker-socket
    hostPath:
      path: /var/run/docker.sock
```

**Corrigé guidé :**
1. **`image: myapp:latest`** — Tag `:latest` non fixe = non reproductible, risque de régression et d'injection d'image non contrôlée.
2. **`privileged: true`** — Donne au conteneur un accès complet au nœud hôte (équivalent root sur le serveur physique).
3. **Montage du socket Docker (`/var/run/docker.sock`)** — Permet de contrôler le daemon Docker du nœud → escalade de privilèges triviale vers le cluster entier.
4. **Absence de `readOnlyRootFilesystem: true`** — Le système de fichiers est en écriture, facilitant la persistance de malware.
5. **Absence de `capabilities: drop: [ALL]`** — Les capabilities Linux par défaut (ex: `CAP_NET_RAW`) restent actives sans nécessité.

---

## Banque QCM — 5 Questions

**Q1.** Quel est le rôle du **Pod Security Admission (PSA)** dans Kubernetes ?

- A) Gérer les secrets des applications.
- B) Intercepter les requêtes d'admission des Pods et rejeter ceux qui ne respectent pas un profil de sécurité prédéfini (Restricted, Baseline ou Privileged). ✅
- C) Configurer les règles de pare-feu réseau entre les Pods.
- D) Déployer automatiquement les mises à jour des images.

**Q2.** Qu'est-ce que le langage **Rego** dans le contexte d'OPA/Gatekeeper ?

- A) Un langage de programmation orienté objet pour Kubernetes.
- B) Un langage déclaratif de politiques utilisé par Open Policy Agent pour exprimer des règles d'autorisation et de validation. ✅
- C) Un protocole de chiffrement.
- D) Un format de fichier de configuration Kubernetes.

**Q3.** Que se passe-t-il par défaut, sans **NetworkPolicy**, entre deux Pods dans des Namespaces différents dans Kubernetes ?

- A) Toute communication est bloquée par défaut.
- B) Seul le trafic HTTPS est autorisé.
- C) Tout trafic est autorisé entre tous les Pods et tous les Namespaces (réseau plat). ✅
- D) Seul le trafic dans le même Namespace est autorisé.

**Q4.** Quel est le rôle de **Falco** dans la sécurité d'un cluster Kubernetes ?

- A) Scanner les images Docker pour détecter les vulnérabilités.
- B) Détecter en temps réel les comportements anormaux dans les conteneurs (shells inattendus, lectures de fichiers sensibles, connexions réseau suspectes) via l'observation des appels système. ✅
- C) Gérer les certificats TLS des services.
- D) Sauvegarder les données persistantes des Pods.

**Q5.** Pourquoi monter le socket Docker (`/var/run/docker.sock`) dans un conteneur est-il une **vulnérabilité critique** ?

- A) Cela ralentit les performances du conteneur.
- B) Cela expose le daemon Docker de l'hôte au conteneur, permettant à un attaquant de créer de nouveaux conteneurs privilégiés et d'échapper au sandbox Kubernetes pour prendre le contrôle du nœud entier. ✅
- C) Cela empêche les mises à jour automatiques.
- D) Cela consomme trop de mémoire.

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
