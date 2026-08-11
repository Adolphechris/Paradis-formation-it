# TOME P8 — Blue Team, SOC & SIEM Advanced — Jour 353 (6h) : Splunk Enterprise Security — SPL Deep-Dive, Data Models, CIM Normalization & Correlation Searches

> [!NOTE]
> **Objectif du jour :** Maîtriser le fonctionnement du SIEM leader du marché **Splunk Enterprise Security (ES)** : écrire des requêtes complexes en langage **SPL (Search Processing Language)**, normaliser les données via le **Common Information Model (CIM)**, structurer des **Data Models** accélérés pour optimiser les performances, et créer des **Correlation Searches** pour générer des incidents notables (Notable Events).
>
> **Compétences visées :** `SIEM-SPLUNK-01` (A) — Advanced SPL Engineering & CIM Data Normalization | `SIEM-SPLUNK-02` (A) — Splunk Data Models Acceleration & Correlation Searches

---

## 1) Module — Normalisation CIM & Architecture Splunk ES (2h)

### 📖 Narration/Intuition

Pour que Splunk Enterprise Security puisse corréler des événements provenant d'équipements différents (un pare-feu Palo Alto et un serveur Linux), les champs bruts doivent être traduits en alias conformes au **CIM (Common Information Model)**.

```
Log Palo Alto Brut ──► `src_ip=192.168.1.50` ──┐
                                               ├──► Alias CIM `src` / `dest` ──► Correlation Search SIEM
Log Linux SSH Brut ──► `IP=192.168.1.50` ─────┘
```

---

## 2) Module — Outillage de Requêtes SPL & Data Model (`splunk_es_query_builder.py`) (2h)

### 🛠️ Atelier Pratique

```python
import json

class SplunkESQueryBuilder:
    """
    Générateur de requêtes SPL (Search Processing Language) et d'alertes de corrélation
    normalisées selon le modèle CIM (Common Information Model).
    """

    @staticmethod
    def build_brute_force_spl(timeframe: str = "5m", threshold: int = 10) -> str:
        """
        Génère la requête SPL pour détecter une attaque par force brute sur l'authentification.
        Utilise le Data Model CIM 'Authentication'.
        """
        spl = f"""
| tstats summariesonly=true count from datamodel=Authentication.Authentication 
  where Authentication.action="failure" 
  by _time span={timeframe}, Authentication.src, Authentication.user, Authentication.dest 
| rename Authentication.src as src, Authentication.user as user, Authentication.dest as dest 
| stats sum(count) as total_failures by src, user, dest 
| where total_failures >= {threshold}
| eval severity="HIGH", risk_object=user, risk_object_type="user"
"""
        return spl.strip()

    @staticmethod
    def build_impossible_travel_spl() -> str:
        """
        Génère la requête SPL pour détecter un voyage impossible (Impossible Travel)
        entre deux connexions réussies d'un même utilisateur.
        """
        spl = """
index=notable sourcetype="pan:traffic" OR sourcetype="azure:signinlogs"
| stats early(_time) as first_login, latest(_time) as last_login, values(src_ip) as ips, values(src_country) as countries by user
| eval time_diff_hrs = (last_login - first_login) / 3600
| where dc(countries) > 1 AND time_diff_hrs < 2
| table user, countries, ips, time_diff_hrs
"""
        return spl.strip()

# Tests
print("=== SPLUNK ENTERPRISE SECURITY QUERY BUILDER ===")
print("\n[+] Requête SPL Détection Brute Force (Data Model Accéléré) :")
print(SplunkESQueryBuilder.build_brute_force_spl())

print("\n[+] Requête SPL Détection Voyage Impossible (Impossible Travel) :")
print(SplunkESQueryBuilder.build_impossible_travel_spl())
```

---

## 3) Module — Guide d'Anatomie d'une Correlation Search Splunk ES (2h)

```markdown
# ANATOMIE D'UNE CORRELATION SEARCH (SPLUNK ES)

Une **Correlation Search** s'exécute périodiquement en arrière-plan pour scanner les Data Models accélérés et générer un **Notable Event** dans le tableau de bord de l'analyste SOC.

```yaml
# Définition de la Correlation Search : Suspicious PowerShell Execution
search_name: Security - Suspicious Encoded PowerShell - Rule
search_query: >
  | tstats summariesonly=true count from datamodel=Endpoint.Processes
    where Processes.process_name="powershell.exe" AND (Processes.process="*-enc*" OR Processes.process="*-encodedcommand*")
    by Processes.dest, Processes.user, Processes.process_name, Processes.process
cron_schedule: "*/5 * * * *"
action.notable:
  param.severity: high
  param.rule_title: Exécution PowerShell Encodée Détectée sur $dest$
  param.rule_description: L'utilisateur $user$ a exécuté une commande PowerShell encodée en Base64.
  param.nes_fields: dest, user, process
```
```

---

## 🏅 Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **SPL** | Search Processing Language — Langage de recherche et d'analyse de données propriétaire de Splunk |
| **CIM** | Common Information Model — Schéma de normalisation des données de sécurité pour Splunk ES |
| **tstats** | Commande SPL optimisée effectuant des recherches ultrarapides sur les Data Models accélérés |

---

## ❓ Banque de Questions & Test du Jour

**Q1 :** Pourquoi est-il fortement recommandé d'utiliser la commande **`tstats`** au lieu de `search` dans les Correlation Searches Splunk ES ?
- A) Parce que `tstats` interroge directement les métadonnées pré-calculées des Data Models accélérés, rendant les recherches des dizaines de fois plus rapides et réduisant la charge processeur du cluster Splunk
- B) Parce que `search` est déprécié
- C) Parce que `tstats` chiffre les résultats
- D) C'est une obligation légale

**Réponse : A**

**Q2 :** Quel est le rôle du **Common Information Model (CIM)** dans Splunk Enterprise Security ?
- A) Standardiser les noms de champs provenant de sources d'événements différentes sous une terminologie commune (ex. mapper `src_ip` et `clientip` vers `src`) pour appliquer des règles de détection uniques
- B) Générer des rapports au format PDF
- C) Gérer les sauvegardes disques
- D) Bloquer les attaques DDoS au niveau réseau

**Réponse : A**

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
