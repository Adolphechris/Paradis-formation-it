# TOME P4 — Cloud, DevOps & SecOps — Jour 169 (6h) : Ingestion en Temps Réel & Architectures Kappa/Lambda (Apache Flink, Kafka Streams & Real-Time Analytics)

> [!NOTE]
> **Objectif du jour :** Maîtriser le traitement de flux d'événements à très faible latence et l'évolution des architectures Big Data : comparaison de l'architecture **Lambda** (Batch + Real-Time) vs l'architecture **Kappa** (Real-Time pure), moteurs de Stream Processing modernes (**Apache Flink**, **Kafka Streams**), gestion du temps basé sur l'événement (Event-Time vs Processing-Time), fenêtrage (Tumbling, Sliding, Session Windows) et détection d'anomalies financières sous la seconde.
>
> **Compétences visées :** `BIT-05` (A) — Low-Latency Stream Processing | `BIT-04` (A) — Architectures Lambda/Kappa & Apache Flink

---

## 1) Module — Architectures de Traitement : Lambda vs Kappa (2h)

### 📖 Narration/Intuition

Comment combiner l'analyse historique de 10 ans de transactions (Batch) avec la détection instantanée d'une fraude bancaire qui se produit à cette exacte milliseconde (Streaming) ?

Historiquement, Nathan Marz a proposé l'**Architecture Lambda** : maintenir deux chemins séparés (un Batch Layer lent mais précis sur Hadoop, et un Speed Layer rapide sur Storm). Mais maintenir deux bases de code et deux frameworks différents était un enfer d'ingénierie.

En 2014, Jay Kreps a introduit l'**Architecture Kappa** : éliminer le Batch Layer et traiter **l'ensemble des données (historiques et temps réel) via un seul et unique moteur de Stream Processing (Flink / Kafka Streams)** au-dessus d'un bus de données immuable (Kafka).

### 🔍 Anatomie Technique

**Comparaison des Architectures Lambda et Kappa :**

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       ARCHITECTURE LAMBDA vs KAPPA                          │
├──────────────┬──────────────────────────────────────────────────────────────┤
│ Lambda       │ Deux couches distinctes : Batch (Hadoop) + Speed (Storm/Flink)│
│ Architecture │ - Complexité élevée : Deux bases de code à maintenir.        │
│              │ - Fusion des résultats au niveau de la Serving Layer.        │
├──────────────┼──────────────────────────────────────────────────────────────┤
│ Kappa        │ Une seule couche : Stream Processing pur (Apache Flink/Kafka)│
│ Architecture │ - Code unifié pour les données en temps réel et le rejeu.    │
│              │ - Traitement des historiques en rejouant les Offsets Kafka. │
└──────────────┴──────────────────────────────────────────────────────────────┘
```

---

## 2) Module — Stream Processing avec Apache Flink & Fenêtrage (2h)

### 📖 Narration/Intuition

Pourquoi **Apache Flink** est-il considéré comme le moteur de Stream Processing le plus puissant, surpassant Spark Streaming pour les très faibles latences ?

Spark Streaming découpe le flux en "micro-lots" (Micro-batches de 100ms). Apache Flink est un moteur **Stream-First natif** qui traite les événements **élément par élément (Event-by-Event)** avec une latence de quelques **millisecondes**, tout en gérant l'état applicatif de manière distribuée (Stateful Stream Processing).

### 🔍 Anatomie Technique

**Les 3 Types de Fenêtres de Temps (Windowing) dans Flink :**

```
1. Tumbling Window (Fenêtre fixe non-chevauchante) :
   [ 12:00 - 12:05 ] [ 12:05 - 12:10 ] [ 12:10 - 12:15 ]

2. Sliding Window (Fenêtre glissante chevauchante) :
   [ 12:00 - 12:05 ]
       [ 12:01 - 12:06 ]
           [ 12:02 - 12:07 ]

3. Session Window (Fenêtre basée sur l'inactivité) :
   [ Activité Client A ... ] --- Inactivité > 15 min --- [ Fin de Session ]
```

---

## 3) Module — Laboratoire Pratique : Détection de Fraude avec Kafka Streams (2h)

### 📖 Narration/Intuition

Construisons un microservice léger de détection de fraudes en Java/Python avec **Kafka Streams** capable de détecter un motif suspect : **plus de 3 tentatives de retrait de plus de 500 000 CDF dans une fenêtre de 60 secondes pour un même compte**.

### 🔍 Anatomie Technique

**Code de Détection de Fraudes avec Kafka Streams & Sliding Window (`FraudStreamDetector.java`) :**

```java
// Application Kafka Streams de détection de fraudes en temps réel (Latence < 10ms)
public class FraudStreamDetector {

    public static void main(String[] args) {
        StreamsBuilder builder = new StreamsBuilder();
        
        // 1. Consommer le flux d'événements de transactions depuis Kafka
        KStream<String, TransactionEvent> transactions = builder.stream("bcc.rtgs.transactions");

        // 2. Filtrer les transactions d'un montant élevé et grouper par Compte Source
        transactions
            .filter((key, tx) -> tx.getMontant() > 500000.00)
            .groupBy((key, tx) -> tx.getCompteSource(), Grouped.with(Serdes.String(), new TransactionSerde()))
            // 3. Appliquer une Sliding Window de 60 secondes avec saut de 10 secondes
            .windowedBy(TimeWindows.ofSizeWithNoGrace(Duration.ofSeconds(60)))
            .count()
            .toStream()
            // 4. Déclencher une alerte si le nombre de retraits > 3 dans la minute
            .filter((windowedKey, count) -> count >= 3)
            .map((windowedKey, count) -> new KeyValue<>(
                windowedKey.key(),
                String.format("⚠️ ALERTE FRAUDE : %d retraits suspects pour le compte %s dans la dernière minute !", count, windowedKey.key())
            ))
            // 5. Publier l'alerte sur le Topic des Incidents de Sécurité
            .to("bcc.security.alerts", Produced.with(Serdes.String(), Serdes.String()));

        KafkaStreams streams = new KafkaStreams(builder.build(), getKafkaProperties());
        streams.start();
    }
}
```

---

## 🏅 Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **Flink** | Apache Flink — Moteur de traitement de flux de données distribué à très faible latence |
| **Kafka Streams** | Bibliothèque cliente Java/Scala légère pour le traitement de flux sur Kafka |
| **Event-Time** | Horodatage réel auquel l'événement s'est produit à la source (vs Processing-Time) |
| **Stateful** | Traitement avec conservation d'état en mémoire/disque local (ex: RocksDB) |

---

## 🏋️ Exercices & Corrigés

**Exercice 1 :** Pourquoi la distinction entre **Event-Time (Temps de l'événement)** et **Processing-Time (Temps du traitement)** est-elle cruciale lors de la détection de fraudes bancaires par Stream Processing ?

**Corrigé :** Le **Processing-Time** est l'heure de l'horloge du serveur qui traite l'événement. Si une panne réseau survient à 14h00 et que des milliers de transactions effectuées par les clients à 14h01 ne sont reçues par Flink qu'à 14h30 après le rétablissement du réseau, le traitement en Processing-Time va analyser ces transactions dans la fenêtre de 14h30, produisant de fausses alertes ou manquant des fraudes réelles. L'**Event-Time** utilise l'horodatage réel gravé dans la transaction au moment de son émission à la banque. Flink utilise le mécanisme des **Watermarks** pour traiter les événements dans l'ordre de leur Event-Time même s'ils arrivent en retard par le réseau.

**Exercice 2 :** Quel est l'avantage principal de l'utilisation de **Kafka Streams** par rapport au déploiement d'un cluster dédié **Apache Flink** pour une application de microservices ?

**Corrigé :** **Apache Flink** est un moteur lourd qui nécessite le déploiement et la gestion d'un cluster dédié d'infrastructures (JobManager, TaskManagers, YARN/K8s). **Kafka Streams** n'est pas un framework de cluster, c'est une simple **bibliothèque cliente** (Library). Il s'intègre directement dans une application Java/Spring Boot standard. On peut l'exécuter dans un simple conteneur Docker ou Kubernetes existant sans avoir à maintenir un cluster Big Data supplémentaire, simplifiant considérablement le déploiement et les opérations DevSecOps.

---

## ❓ Banque de Questions & Test du Jour

**Q1 :** Quelle architecture Big Data élimine la couche Batch pour traiter l'intégralité des données (historiques et temps réel) via un seul moteur de Stream Processing unifié ?
- A) Architecture Kappa
- B) Architecture Lambda
- C) Architecture Monolithique
- D) Architecture Mainframe

**Réponse : A**

**Q2 :** Quel moteur open-source de Stream Processing se distingue par son traitement événement par événement (Event-by-Event) offrant des latences de quelques millisecondes ?
- A) Apache Flink
- B) Excel
- C) MS Access
- D) Notepad

**Réponse : A**

**Q3 :** Quel type de fenêtre temporelle (Windowing) découpe le flux de données en segments fixes de durée égale non chevauchants (ex: 12:00-12:05, 12:05-12:10) ?
- A) Tumbling Window
- B) Sliding Window
- C) Session Window
- D) Open Window

**Réponse : A**

**Q4 :** Quelle bibliothèque client Java permet d'écrire des applications de Stream Processing légères directement intégrées dans des microservices sans déployer de cluster dédié ?
- A) Kafka Streams
- B) Paint
- C) Word
- D) Skype

**Réponse : A**

**Q5 :** Dans Apache Flink, quel mécanisme permet de gérer et d'ordonnancer correctement les événements qui arrivent en retard par le réseau en fonction de leur horodatage réel (Event-Time) ?
- A) Watermarks (Repères d'eau)
- B) Chronomètre manuel
- C) Redémarrage du serveur
- D) Suppression des logs

**Réponse : A**

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
