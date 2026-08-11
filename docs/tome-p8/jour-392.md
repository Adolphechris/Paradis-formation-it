# TOME P8 — Blue Team, SOC & SIEM Advanced — Jour 392 (6h) : SOC AI & Machine Learning for Detection — ML-Based Anomaly Detection, Behavioral Analytics, Predictive Threat Modeling, UEBA Advanced & BCC AI-Enhanced SOC

> [!NOTE]
> **Objectif du jour :** Maîtriser l'application de l'**IA et du Machine Learning** au SOC : détection d'anomalies par ML, analytics comportemental avancé, modèles prédictifs de menaces, et conception d'un SOC augmenté par IA pour la BCC.
>
> **Compétences visées :** `SOC-AI-01` (A) — ML-Based Detection & Anomaly Detection | `SOC-AI-02` (A) — Predictive Threat Modeling & AI-Enhanced SOC Architecture

---

## 1) Module — ML-Based Detection & Anomaly Detection (2h)

### 📖 Narration/Intuition

Les règles statiques (signatures) détectent les menaces connues, mais échouent face aux menaces nouvelles ou aux comportements anormaux d'utilisateurs légitimes compromis. Le **Machine Learning** résout ce problème en apprenant les patterns normaux et en détectant les écarts significatifs.

```
[ DÉTECTION STATIQUE ]                [ DÉTECTION ML ]
         │                                      │
  Règle : "si X alors Y"              Modèle : "apprend ce qui est normal
  Détecte : menaces connues           et détecte ce qui est anormal"
         │                                      │
  ┌──────┴──────┐                    ┌──────────┴──────────┐
  ▼             ▼                    ▼                     ▼
TP : 100%     FP : élevé           TP : 95%             FP : 5%
(zéro-day :   (beaucoup de         (détecte             (faux
 0%)           faux positifs)       zero-day)            positifs
                                    réduits)             réduits)
```

### Types de ML pour SOC

| Type | Usage | Algorithme | Exemple BCC |
|:---|:---|:---|:---|
| **Supervisé** | Classification d'incidents | Random Forest, XGBoost | Détecter malware vs legitime |
| **Non supervisé** | Détection d'anomalies | Isolation Forest, Autoencoder | Détecter comportement anormal |
| **Séries temporelles** | Détection de beaconing | LSTM, Prophet | Détecter C2 beaconing |
| **Clustering** | Regroupement d'alertes | K-Means, DBSCAN | Réduire le volume d'alertes |
| **NLP** | Analyse de logs texte | BERT, Transformers | Détecter phishing dans emails |

---

## 2) Module — ML Detection Engine (`ml_detection_engine.py`) (2h)

### 🛠️ Atelier Pratique

```python
import json
from datetime import datetime, timezone
from typing import List, Dict, Optional
from enum import Enum

class AnomalyLevel(Enum):
    NORMAL = "NORMAL"
    SUSPICIOUS = "SUSPICIOUS"
    ANOMALOUS = "ANOMALOUS"
    CRITICAL = "CRITICAL"

class MLDetectionEngine:
    """
    Moteur de détection ML pour SOC Blue Team.
    Détection d'anomalies, scoring de risque, modèles prédictifs.
    """

    def __init__(self, org_name: str = "BCC"):
        self.org_name = org_name
        self.models: Dict[str, dict] = {}
        self.anomalies: List[dict] = []
        self.predictions: List[dict] = []

    def register_model(self, model_id: str, name: str, model_type: str,
                       algorithm: str, features: List[str],
                       accuracy: float = 0.0) -> dict:
        """Enregistre un modèle ML de détection."""
        model = {
            "model_id": model_id,
            "name": name,
            "model_type": model_type,
            "algorithm": algorithm,
            "features": features,
            "accuracy": accuracy,
            "deployed": accuracy > 0.7,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        self.models[model_id] = model
        return model

    def detect_anomaly(self, model_id: str, data_point: dict) -> dict:
        """Détecte une anomalie avec un modèle ML."""
        model = self.models.get(model_id)
        if not model:
            return {"status": "ERROR"}

        # Simulation de détection ML
        anomaly_score = 0.0
        features_triggered = []

        # Simulation basée sur les features
        if "login_time" in data_point:
            hour = data_point["login_time"]
            if hour < 6 or hour > 22:
                anomaly_score += 30
                features_triggered.append(f"Unusual login time: {hour}:00")

        if "data_volume_mb" in data_point:
            volume = data_point["volume"]
            if volume > 1000:
                anomaly_score += 25
                features_triggered.append(f"High data volume: {volume}MB")

        if "failed_logins" in data_point:
            logins = data_point["failed_logins"]
            if logins >= 5:
                anomaly_score += 20
                features_triggered.append(f"Multiple failed logins: {logins}")

        if "country" in data_point:
            if data_point["country"] != "CD":
                anomaly_score += 25
                features_triggered.append(f"Unusual country: {data_point['country']}")

        # Plafonnement
        anomaly_score = min(anomaly_score, 100)

        # Niveau
        if anomaly_score >= 80:
            level = AnomalyLevel.CRITICAL.value
        elif anomaly_score >= 60:
            level = AnomalyLevel.ANOMALOUS.value
        elif anomaly_score >= 40:
            level = AnomalyLevel.SUSPICIOUS.value
        else:
            level = AnomalyLevel.NORMAL.value

        anomaly = {
            "model_id": model_id,
            "data_point": data_point,
            "anomaly_score": round(anomaly_score, 1),
            "level": level,
            "features_triggered": features_triggered,
            "timestamp": datetime.now(timezone.utc).isoformat()
        }
        self.anomalies.append(anomaly)
        return anomaly

    def predict_threat(self, prediction_id: str, threat_type: str,
                       indicators: List[str], confidence: float) -> dict:
        """Prédit une menace future."""
        prediction = {
            "prediction_id": prediction_id,
            "threat_type": threat_type,
            "indicators": indicators,
            "confidence": confidence,
            "predicted_at": datetime.now(timezone.utc).isoformat()
        }
        self.predictions.append(prediction)
        return prediction

    def get_ml_dashboard(self) -> dict:
        """Dashboard ML Detection."""
        critical = sum(1 for a in self.anomalies if a["level"] == AnomalyLevel.CRITICAL.value)
        anomalous = sum(1 for a in self.anomalies if a["level"] == AnomalyLevel.ANOMALOUS.value)
        suspicious = sum(1 for a in self.anomalies if a["level"] == AnomalyLevel.SUSPICIOUS.value)
        normal = sum(1 for a in self.anomalies if a["level"] == AnomalyLevel.NORMAL.value)

        return {
            "organisation": self.org_name,
            "models": len(self.models),
            "models_deployed": sum(1 for m in self.models.values() if m["deployed"]),
            "anomalies_detected": len(self.anomalies),
            "critical": critical,
            "anomalous": anomalous,
            "suspicious": suspicious,
            "normal": normal,
            "predictions": len(self.predictions)
        }


# --- Démonstration ---
print("=== ML DETECTION ENGINE DEMONSTRATION ===")

ml = MLDetectionEngine(org_name="BCC")

# Enregistrement des modèles
models = [
    ("ML-001", "User Behavior Anomaly", "ANOMALY_DETECTION", "Isolation Forest",
     ["login_time", "location", "assets", "data_volume"], 0.92),
    ("ML-002", "Beaconing Detection", "TIME_SERIES", "LSTM",
     ["connection_timing", "packet_size", "destination"], 0.88),
    ("ML-003", "Malware Classification", "CLASSIFICATION", "XGBoost",
     ["file_hash", "imports", "strings", "pe_header"], 0.95),
    ("ML-004", "Insider Threat", "ANOMALY_DETECTION", "Autoencoder",
     ["file_access", "email_patterns", "removable_media"], 0.79),
]

for mid, name, mtype, algo, features, acc in models:
    ml.register_model(mid, name, mtype, algo, features, acc)

# Détection d'anomalies
test_data = [
    ("user-01", {"login_time": 14, "data_volume_mb": 50, "failed_logins": 0, "country": "CD"}),
    ("user-02", {"login_time": 2, "data_volume_mb": 2500, "failed_logins": 0, "country": "NG"}),
    ("user-03", {"login_time": 23, "data_volume_mb": 100, "failed_logins": 7, "country": "CD"}),
    ("user-04", {"login_time": 10, "data_volume_mb": 80, "failed_logins": 0, "country": "CD"}),
]

for uid, data in test_data:
    result = ml.detect_anomaly("ML-001", data)
    print(f"    {uid}: score={result['anomaly_score']}, level={result['level']}, features={len(result['features_triggered'])}")

# Prédictions de menaces
predictions = [
    ("PRED-001", "AI-Powered Phishing", ["increase in LLM-generated emails", "personalized content"], 0.85),
    ("PRED-002", "Ransomware Evolution", ["double extortion", "supply chain targeting"], 0.90),
]

for pid, threat, indicators, confidence in predictions:
    ml.predict_threat(pid, threat, indicators, confidence)

# Dashboard
dashboard = ml.get_ml_dashboard()
print(f"\n[+] ML Detection Dashboard :")
print(f"    Models: {dashboard['models']} ({dashboard['models_deployed']} deployed)")
print(f"    Anomalies: {dashboard['anomalies_detected']}")
print(f"    Critical: {dashboard['critical']}, Anomalous: {dashboard['anomalous']}, Suspicious: {dashboard['suspicious']}, Normal: {dashboard['normal']}")
print(f"    Predictions: {dashboard['predictions']}")
```

---

## 3) Module — Predictive Threat Modeling & BCC AI-Enhanced SOC (2h)

### 📖 Modèles Prédictifs de Menaces

```yaml
# Predictive Threat Models — BCC
models:
  user_behavior_prediction:
    algorithm: "Isolation Forest + LSTM"
    features: ["login_time", "location", "assets", "data_volume", "auth_method"]
    training_window: "90 days"
    update_frequency: "daily"
    accuracy: 0.92
    false_positive_rate: 0.08
    use_case: "Detect compromised accounts and insider threats"

  network_beaconing_prediction:
    algorithm: "LSTM + Statistical Analysis"
    features: ["connection_timing", "packet_size", "destination", "protocol"]
    training_window: "30 days"
    accuracy: 0.88
    use_case: "Detect C2 beaconing and data exfiltration"

  malware_family_prediction:
    algorithm: "XGBoost + CNN"
    features: ["file_hash", "imports", "strings", "pe_header", "behavioral"]
    accuracy: 0.95
    use_case: "Classify malware families and predict variants"

  vulnerability_exploit_prediction:
    algorithm: "Gradient Boosting"
    features: ["cve_severity", "asset_criticality", "exploit_availability", "patch_status"]
    accuracy: 0.83
    use_case: "Prioritize patching based on exploit likelihood"

bcc_ai_soc:
  architecture:
    - "Data Lake: Centralized log storage (S3/ADLS)"
    - "Feature Engineering: Automated feature extraction"
    - "Model Training: Weekly retraining on new data"
    - "Inference: Real-time scoring in SIEM/SOAR"
    - "Feedback Loop: Analyst feedback improves models"

  capabilities:
    - "Anomaly Detection: 95% accuracy, < 5% FP rate"
    - "Predictive Alerts: 30-day threat forecasting"
    - "Automated Tuning: Rules optimized based on ML feedback"
    - "Explainable AI: SHAP/LIME for analyst trust"
```

---

## 🏅 Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **ML** | Machine Learning — Apprentissage automatique |
| **AI** | Artificial Intelligence — Intelligence artificielle |
| **LSTM** | Long Short-Term Memory — Réseau de neurones récurrent pour séries temporelles |
| **XGBoost** | eXtreme Gradient Boosting — Algorithme d'ensemble |
| **Isolation Forest** | Algorithme de détection d'anomalies |
| **Autoencoder** | Réseau de neurones pour détection d'anomalies |
| **NLP** | Natural Language Processing — Traitement du langage naturel |
| **BERT** | Bidirectional Encoder Representations from Transformers — Modèle NLP |
| **SHAP/LIME** | Méthodes d'explicabilité des modèles ML |
| **UEBA** | User and Entity Behavior Analytics — Analytique comportementale |
| **C2** | Command and Control — Canal de commandement et contrôle |
| **IoC** | Indicator of Compromise — Indicateur de compromission |

---

## ❓ Banque de Questions & Test du Jour

**Q1 :** Comment le **Machine Learning** améliore-t-il la détection dans un SOC bancaire ?
- A) En apprenant les patterns normaux et en détectant les écarts (anomalies) que les règles statiques ne capturent pas, notamment les zero-days et les comportements d'utilisateurs compromis — mais il nécessite des données de qualité et une supervision humaine pour éviter les faux positifs
- B) En remplaçant complètement les analystes SOC
- C) En réduisant le budget SOC
- D) En augmentant le nombre d'alertes

**Réponse : A**

**Q2 :** Qu'est-ce que la **détection de beaconing** par ML et pourquoi est-elle critique pour un SOC bancaire ?
- A) C'est la détection des communications périodiques avec un serveur C2 (Command and Control) — le ML analyse les patterns temporels et la taille des paquets pour identifier des beacons même chiffrés, ce qui est critique pour détecter les ransomwares et les APTs qui exfiltrent des données
- B) C'est un type de malware
- C) C'est un outil de sauvegarde
- D) C'est un protocole réseau

**Réponse : A**

**Q3 :** Qu'est-ce que l'**IA explicable (Explainable AI / XAI)** et pourquoi est-elle importante pour un SOC ?
- A) C'est la capacité à expliquer les décisions d'un modèle ML (via SHAP, LIME) — elle est essentielle pour que les analystes SOC fassent confiance aux alertes ML, puissent les justifier à la direction, et ajuster les modèles en cas d'erreur
- B) C'est un type de malware
- C) C'est un outil de détection
- D) C'est un framework de sécurité

**Réponse : A**

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
