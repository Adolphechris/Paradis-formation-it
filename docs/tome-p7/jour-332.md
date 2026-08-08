# TOME P7 — Certifications d'Élite & Spécialisations — Jour 332 (6h) : OSED Prep — Browser Exploitation (Chrome V8 JIT Compiler, Type Confusion, Heap Spraying & Renderer Process Sandbox Escapes)

> [!NOTE]
> **Objectif du jour :** Maîtriser l'ingénierie de l'**exploitation de navigateurs web modernes (Chrome / Chromium V8 Engine)** ciblée par les spécialisations avancées de l'**OSED / OffSec Exploitation** : comprendre le compilateur JIT (Just-In-Time) V8 **TurboFan**, exploiter une vulnérabilité de **Type Confusion** dans la phase d'optimisation (Typer Phase), mettre en œuvre des techniques de **Heap Spraying** en JavaScript pour obtenir les primitives **ArrayBuffer Read/Write (AddrOf / Read64 / Write64)**, et concevoir une chaîne de **Renderer Process Sandbox Escape**.
>
> **Compétences visées :** `OSED-03` (A) — V8 JIT Engine Type Confusion Exploitation | `OSED-04` (A) — JavaScript Heap Spraying & Arbitrary Read/Write Primitives

---

## 1) Module — V8 Engine Architecture & JIT TurboFan (2h)

### 📖 Narration/Intuition

Le moteur JavaScript **V8 (Chromium)** utilise l'interprète **Ignition** pour l'exécution initiale, puis compile le code chaud (hot code) via le compilateur JIT **TurboFan**. Si le compilateur suppose à tort le type d'un objet lors de la phase d'optimisation (Typer phase) et que cette supposition s'avère fausse à l'exécution, il se produit une **Type Confusion**.

```
[ Code JS Utilisateur ]  ──► [ Interprète Ignition (Bytecode) ]
                                      │
                                      ▼ (Code chaud / Hot Function)
                             [ Compilateur JIT TurboFan ]
                                      │
                                      ├── 1. Graph Building (IR)
                                      ├── 2. Typer Phase (Inférence de type) <--- TYPE CONFUSION BUG !
                                      └── 3. Machine Code Generation
                                      │
                                      ▼
                        [ Execution Native (RAM GPU/CPU) ]
```

---

## 2) Module — Primitives Arbitrary Read/Write & Exploit Framework (`v8_exploit_harness.js`) (2h)

### 🛠️ Atelier Pratique

```javascript
/**
 * Harness d'Exploitation V8 (Chromium JIT) - OSED / Browser Exploitation
 * Démonstration des primitives AddrOf et FakeObj via Type Confusion ArrayBuffer.
 */

// Buffers de conversion IEEE 754 Float64 <-> Unsigned 64-bit Int
const buf = new ArrayBuffer(8);
const f64 = new Float64Array(buf);
const u64 = new BigUint64Array(buf);

function f2i(val) {
    f64[0] = val;
    return u64[0];
}

function i2f(val) {
    u64[0] = val;
    return f64[0];
}

class V8ExploitPrimitives {
    constructor(corrupted_array, float_array) {
        this.corrupted = corrupted_array;
        this.floats = float_array;
    }

    /**
     * Primitive addrof(obj) : Obteint l'adresse mémoire exacte d'un objet JS en RAM.
     */
    addrof(obj) {
        // En plaçant l'objet dans un champ typé confondu, on lit son pointeur d'adresse
        this.corrupted[0] = obj;
        return f2i(this.floats[0]) & 0xffffffffn; // Adressage compressed pointers V8
    }

    /**
     * Primitive fakeobj(addr) : Force V8 à traiter une adresse mémoire arbitraire comme un objet JS.
     */
    fakeobj(addr) {
        this.floats[0] = i2f(addr);
        return this.corrupted[0];
    }

    /**
     * Read64(addr) : Lecture arbitraire de 64 octets en mémoire à l'adresse spécifiée.
     */
    read64(addr) {
        // Exploitation de la corruption de longueur/backing store d'un DataView
        let fake_dataview = this.setup_fake_dataview(addr);
        return fake_dataview.getBigUint64(0, true);
    }

    /**
     * Write64(addr, value) : Écriture arbitraire de 64 octets en mémoire à l'adresse spécifiée.
     */
    write64(addr, value) {
        let fake_dataview = this.setup_fake_dataview(addr);
        fake_dataview.setBigUint64(0, value, true);
    }

    setup_fake_dataview(target_addr) {
        // Modélisation d'un DataView dont le BackingStore pointe sur target_addr
        console.log("[*] Configuration du Fake DataView sur l'adresse : 0x" + target_addr.toString(16));
        return new DataView(new ArrayBuffer(0x1000));
    }
}

// Validation du Framework
console.log("=== V8 JIT BROWSER EXPLOITATION HARNESS (POSED) ===");
let dummy_target = { victim_property: "PARADIS_EXPLOIT_TEST" };
let harness = new V8ExploitPrimitives([dummy_target], new Float64Array(2));

let leaked_addr = harness.addrof(dummy_target);
console.log("[+] Leak de l'adresse de l'objet (addrof) : 0x" + leaked_addr.toString(16));
```

---

## 3) Module — Sandboxing & Renderer Sandbox Escape (2h)

```markdown
# ARCHITECTURE DE SÉCURITÉ CHROMIUM & SANDBOX ESCAPE (OSED)

```
[ Site Web Malveillant (Exploit JIT RCE) ]
                   │
                   ▼
  ┌──────────────────────────────────────────┐
  │ RENDERER PROCESS (Chromium Sandbox)      │
  │  - Exécute V8 & Blink Engine             │
  │  - Pas d'accès disque, pas d'accès réseau│
  │  - Compromis par l'exploit V8 JIT        │
  └────────────────────┬─────────────────────┘
                       │
                       │ (Attaque IPC / Mojo Binder Interface / Win32k Syscall)
                       ▼
  ┌──────────────────────────────────────────┐
  │ BROWSER PROCESS (Privilégié / Broker)    │
  │  - Accès Système Complet (Disk/Network)  │
  │  - IPC Vulnerability -> FULL SYSTEM RCE! │
  └──────────────────────────────────────────┘
```

### Étapes d'un Sandbox Escape (Renderer -> Browser / Kernel)
1. **RCE Renderer** : Obtenir l'exécution de code native dans le Renderer Process via l'exploit V8 JIT.
2. **IPC Interception** : Auditer et manipuler les interfaces **Mojo IPC** (Chromium Inter-Process Communication).
3. **Mojo Deserialization Bug / Win32k GDI Bug** : Exploiter un UAF (Use-After-Free) dans le Browser Process ou un bogue dans le driver graphique du noyau Windows (`win32kfull.sys`).
4. **Elevated RCE** : Obtenir les privilèges `SYSTEM` ou `User` en dehors de la sandbox Chromium.
```

---

## 🏅 Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **V8** | Moteur open-source d'exécution JavaScript et WebAssembly développé par Google pour Chromium et Node.js |
| **JIT** | Just-In-Time Compilation — Compilation à la volée du bytecode JavaScript en code machine natif pour des raisons de performance |
| **Type Confusion** | Vulnérabilité mémoire où une donnée est attribuée à un type d'objet en mémoire alors qu'elle est manipulée comme un autre type |
| **Mojo IPC** | Système de communication inter-processus (IPC) interne à Chromium liant le Renderer au Browser Process |

---

## ❓ Banque de Questions & Test du Jour

**Q1 :** Qu'est-ce qu'une vulnérabilité de **Type Confusion** dans le compilateur JIT V8 (TurboFan) de Chrome ?
- A) Une erreur d'inférence où le compilateur JIT optimise un bloc de code en supposant qu'un objet est d'un certain type (ex. un tableau de doubles), alors qu'à l'exécution l'objet contient d'autres types (ex. des pointeurs d'objets), permettant de confondre adresses et données
- B) Un mot de passe oublié
- C) Une erreur de syntaxe HTML5
- D) Une fuite de mémoire CSS

**Réponse : A**

**Q2 :** À quoi servent les primitives **`addrof`** et **`fakeobj`** dans l'exploitation de moteurs JavaScript ?
- A) `addrof` permet d'obtenir l'adresse mémoire d'un objet JavaScript, et `fakeobj` permet d'injecter une adresse arbitraire pour la faire passer aux yeux du moteur pour un objet légitime
- B) À télécharger des fichiers en HTTPS
- C) À afficher des fenêtres popup
- D) À accélérer les boucles for

**Réponse : A**

**Q3 :** Pourquoi l'obtention d'une exécution de code (RCE) dans le **Renderer Process** de Chromium ne suffit-elle pas pour compromettre totalement le système hôte ?
- A) Parce que le Renderer Process s'exécute dans une **Sandbox** stricte interdisant les accès au système de fichiers, au réseau direct et aux API système sensibles, nécessitant un deuxième exploit (Sandbox Escape via IPC Mojo ou Kernel)
- B) Parce que V8 est écrit en Python
- C) Parce que Windows bloque Chromium
- D) Parce que le GPU protège le disque dur

**Réponse : A**

**Q4 :** Qu'est-ce que le **Heap Spraying** dans le contexte de l'exploitation web ?
- A) Une technique consistant à allouer un très grand nombre d'objets ou de tampons identiques dans le tas (Heap) JavaScript afin d'aligner la mémoire et prédire l'emplacement d'un payload malveillant
- B) Une attaque DDoS sur le serveur DNS
- C) La compression des images JPEG
- D) Un nettoyage automatique de la mémoire RAM

**Réponse : A**

**Q5 :** Quel est le composant de Chromium responsable de la communication sécurisée inter-processus entre le Renderer (sandboxé) et le Browser Process (privilégié) ?
- A) Mojo IPC
- B) WebSockets
- C) OpenSSL
- D) Docker Socket

**Réponse : A**

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
