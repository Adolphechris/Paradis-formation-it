#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
PARADIS IT — Générateur de navigation MkDocs (régénérable à volonté)
====================================================================
Régénère la section `nav:` de `mkdocs.yml` pour exposer **toutes** les leçons
du dépôt (627 fichiers `docs/tome-p*/jour-*.md`, hors symlink tome-p1) dans la
structure canonique :
  - Semestre 0 (J0a–J0v) — prérequis NON compté
  - 12 semestres (S1→S12) × 50 leçons = J001→J600
  - Variantes « *a » + Ponts « *b » + Milestones J300/J600

Usage :  python3 scripts/build-nav.py          (depuis la racine du dépôt)
Sortie : mkdocs.yml mis à jour (nav seulement), sauvegarde dans /tmp avant.
"""

import os
import re
import sys
import glob

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MKDOCS = os.path.join(ROOT, 'mkdocs.yml')
DOCS = os.path.join(ROOT, 'docs')

# ---------------------------------------------------------------------------
# 1. Structure canonique : 12 semestres + leurs plages de jours
# ---------------------------------------------------------------------------
SEMESTRES = [
    # (id, cycle, titre, tome, jour_debut, jour_fin)
    ('S1',  'C1', 'Semestre 1  — Socle Système (J001 - J050)', 'p0', 1, 50),
    ('S2',  'C1', 'Semestre 2  — Réseaux & Télécoms (J051 - J100)', 'p2', 51, 100),
    ('S3',  'C1', 'Semestre 3  — Python, Bash & Compréhension du Code (J101 - J150)', 'p3', 101, 150),
    ('S4',  'C1', 'Semestre 4  — Bases de Données, SQL & Data (J151 - J200)', 'p4', 151, 200),
    ('S5',  'C1', 'Semestre 5  — Web Full-Stack & APIs REST (J201 - J250)', 'p5', 201, 250),
    ('S6',  'C1', 'Semestre 6  — Cloud, DevOps & Projet Bachelor (J251 - J300)', 'p6', 251, 300),
    ('S7',  'C2', 'Semestre 7  — Fondations Cybersécurité & Offensive Security (J301 - J350)', 'p7', 301, 350),
    ('S8',  'C2', 'Semestre 8  — Blue Team, SOC, SIEM & Threat Hunting (J351 - J400)', 'p8', 351, 400),
    ('S9',  'C2', 'Semestre 9  — Cryptographie, PKI & Sécurité des Communications (J401 - J450)', 'p9', 401, 450),
    ('S10', 'C2', 'Semestre 10 — Intelligence Artificielle, Machine Learning & MLOps (J451 - J500)', 'p10', 451, 500),
    ('S11', 'C2', 'Semestre 11 — DevSecOps, Cloud Security & Gouvernance (J501 - J550)', 'p11', 501, 550),
    ('S12', 'C2', 'Semestre 12 — Architecture Ultime, Leadership Technique & Capstone Final (J551 - J600)', 'p12', 551, 600),
]

# Variantes « a » (fichiers jour dans les tomes) et ponts « b »
VARIANTES = [
    ('p0', '09a',  'S1',  'Pont Bash → PowerShell : Méthodologique'),
    ('p2', '100a', 'S2',  'Pont Docker → Proxmox : Conteneurs vs Virtualisation'),
    ('p7', '315a', 'S7',  'Pont Pentest → CISM : du Technique au Stratégique'),
    ('p11', '540a', 'S11', 'Pont Cloud → AD : Hybride, la Réalité des Entreprises'),
    ('p12', '580a', 'S12', 'Pont Smart City → Fondements : Pourquoi Revenir aux Bases ?'),
]
PONTS = {
    'j09b':  ('S1',  'Pont Bash → PowerShell : Méthodologique'),
    'j100b': ('S2',  'Pont Docker → Proxmox : Conteneurs vs Virtualisation'),
    'j315b': ('S7',  'Pont Pentest → CISM : du Technique au Stratégique'),
    'j540b': ('S11', 'Pont Cloud → AD : Hybride, la Réalité des Entreprises'),
    'j580b': ('S12', 'Pont Smart City → Fondements : Pourquoi Revenir aux Bases ?'),
}

MILESTONES = {
    'C1': [
        ('J300a', 'Grand Examen Massif Bachelor (50 QCM)', 'milestones/j300-a.md'),
        ('J300b', 'Projet Synthétique Architecture Cloud', 'milestones/j300-b.md'),
        ('J300c', 'Soutenance Oral & Jury Technique', 'milestones/j300-c.md'),
        ('J300d', 'Cahier des Charges & Grille d\'Évaluation', 'milestones/j300-d.md'),
    ],
    'C2': [
        ('J600a', 'Grand Examen Massif Master (60 QCM)', 'milestones/j600-a.md'),
        ('J600b', 'Grand Capstone Synthétique Zero-Trust', 'milestones/j600-b.md'),
        ('J600c', 'Soutenance Oral & Jury CISO/COMEX', 'milestones/j600-c.md'),
        ('J600d', 'Portfolio d\'Ingénierie & Certificat Master', 'milestones/j600-d.md'),
    ],
}

S0_JOURS = ['0a', '0b', '0c', '0d', '0e', '0f', '0g', '0h', '0i', '0j', '0k',
            '0l', '0m', '0n', '0o']
S0_TRANSITION = ['0p', '0q', '0r', '0s', '0t', '0u', '0v']

# ---------------------------------------------------------------------------
# 2. Titres curés existants (priorité) + extraction H1 (fallback)
# ---------------------------------------------------------------------------

def extract_curated():
    """Retourne {chemin: titre_curé} pour toutes les entrées nav existantes."""
    curated = {}
    try:
        text = open(MKDOCS, encoding='utf-8').read()
    except FileNotFoundError:
        return curated
    for m in re.finditer(r'-\s*"?([^"\n]+?)"?\s*:\s*((?:docs/)?(?:tome-p\d+|ponts|milestones)/[^\s#]+\.md)\s*$',
                         text, flags=re.M):
        title, path = m.group(1).strip(), m.group(2).strip()
        path = path.replace('docs/', '', 1)
        curated[path] = title
    return curated


def h1_of(path):
    """Premier titre H1 d'un fichier markdown (ou None)."""
    try:
        with open(path, encoding='utf-8', errors='replace') as fh:
            for line in fh:
                line = line.rstrip('\n')
                if line.startswith('# '):
                    return line[2:].strip()
    except OSError:
        return None
    return None


def clean_title(h1):
    """Retire les préfixes « TOME … — Jour N (xh) : » / « SEMESTRE … — Jour … » etc."""
    if not h1:
        return None
    # "TOME P6 — … — Jour 251 (6h) : Titre"
    m = re.match(r'^TOME P\d+\s*—\s*.*?—\s*Jour\s+J?[A-Z0-9]+\s*\(\d+h\)\s*:\s*(.+)$', h1)
    if m:
        return m.group(1).strip()
    # "SEMESTRE 1 — Jour 02 (6h) : Titre"
    m = re.match(r'^SEMESTRE\s+\d+\s*—\s*Jour\s+\d+\s*\(\d+h\)\s*:\s*(.+)$', h1)
    if m:
        return m.group(1).strip()
    # "Jour J0A — Titre" ou "Jour 02 — Titre"
    m = re.match(r'^Jour\s+J?[A-Z0-9]+\s*—\s*(.+)$', h1)
    if m:
        return m.group(1).strip()
    # "Jour 02 : Titre"
    m = re.match(r'^Jour\s+[0-9]+\s*:\s*(.+)$', h1)
    if m:
        return m.group(1).strip()
    return h1


def yq(s):
    """Sérialisation YAML sûre (toujours entre guillemets doubles)."""
    s = s.replace('\\', '\\\\').replace('"', '\\"')
    return '"%s"' % s


def title_for(rel_path):
    """Titre final pour une entrée nav : curé si dispo, sinon H1 nettoyé."""
    curated = extract_curated()
    if rel_path in curated:
        t = curated[rel_path]
        # Les entrées « Semestre N — … » pointent sur le 1er jour comme index :
        # on préfère alors le titre réel de la leçon (H1).
        if re.match(r'^Semestre\s+\d+', t):
            t = None
        else:
            # Enlever le préfixe éventuel « JNNN — » du titre curé
            t = re.sub(r'^J\d+[a-z]?\s*—\s*', '', t)
            return t
    h1 = clean_title(h1_of(os.path.join(DOCS, rel_path)))
    return h1 or None


def day_label(suffix):
    """Libellé « JNNN » canonique depuis le suffixe de fichier."""
    if suffix.isdigit():
        return 'J%03d' % int(suffix)
    return 'J' + suffix  # ex : J0a, J09a


def day_file(tome, jour):
    """Nom de fichier réel d'un jour numérique (2 chiffres < 100, sinon 3)."""
    return 'jour-%s.md' % (('%02d' % jour) if jour < 100 else str(jour))

# ---------------------------------------------------------------------------
# 3. Construction du bloc nav
# ---------------------------------------------------------------------------

def build():
    lines = []
    # --- Entêtes haut de page ---
    lines += [
        '  - Accueil: index.md',
        '  - 🎓 Espace Étudiant: espace-etudiant.md',
        '  - 🧪 Espace Évaluation Annexes: espace-evaluation.md',
        '  - Aperçu du programme: apercu.md',
        '  - Feuille de route: feuille-de-route.md',
        '  - Table des matières (600 jours): table-des-matieres.md',
    ]

    # --- Semestre 0 (prérequis, non compté) ---
    lines.append('  - 🚀 SEMESTRE 0 — INITIATION & PRÉ-REQUIS (J0a-J0v):')
    for suf in S0_JOURS:
        t = title_for('tome-p0/jour-%s.md' % suf) or 'Leçon %s' % suf
        lines.append('      - %s: tome-p0/jour-%s.md' % (yq('%s — %s' % (day_label(suf), t)), suf))
    lines.append('      - 🔄 Transition S0→S1 (J0p-J0v):')
    for suf in S0_TRANSITION:
        t = title_for('tome-p0/jour-%s.md' % suf) or 'Transition %s' % suf
        lines.append('          - %s: tome-p0/jour-%s.md' % (yq('%s — %s' % (day_label(suf), t)), suf))

    # --- Cycles ---
    for cycle in ('C1', 'C2'):
        header = ('🎓 CYCLE 1 — BACHELOR BIT (Bac+3)'
                  if cycle == 'C1' else '🛡️ CYCLE 2 — MASTER CYBERSÉCURITÉ (Bac+5)')
        lines.append('  - %s:' % header)
        for sem_id, cyc, sem_titre, tome, j0, j1 in SEMESTRES:
            if cyc != cycle:
                continue
            lines.append('      - %s:' % yq(sem_titre))
            if sem_id == 'S6':
                lines.append('          - Vue d\'ensemble S6: tome-p6-intro.md')
            for jour in range(j0, j1 + 1):
                fn = day_file(tome, jour)
                rel = 'tome-%s/%s' % (tome, fn)
                t = title_for(rel) or 'Jour %s' % jour
                lines.append('          - %s: %s' % (yq('%s — %s' % (day_label(str(jour)), t)), rel))
            for vt, vsuf, vsem, vtit in VARIANTES:
                if vsem == sem_id:
                    rel = 'tome-%s/jour-%s.md' % (vt, vsuf)
                    lines.append('          - %s: %s' % (yq('%s — %s' % (day_label(vsuf), vtit)), rel))
            for pname, (psem, ptit) in PONTS.items():
                if psem == sem_id:
                    rel = 'ponts/%s.md' % pname
                    lines.append('          - %s: %s' % (yq('%s — %s' % ('J%s' % pname[1:], ptit)), rel))
        lines.append('      - 🏆 %s:' % ('Milestone J300 — Diplôme Bachelor BIT'
                                          if cycle == 'C1' else 'Milestone J600 — Diplôme Master Architecte'))
        for lbl, mtit, mrel in MILESTONES[cycle]:
            lines.append('          - %s: %s' % (yq('%s — %s' % (lbl, mtit)), mrel))

    # --- Pied de page ---
    lines += [
        '  - Exercices et QCM: qcm.md',
        '  - Portfolio & Employabilité: portfolio.md',
        '  - Radar de Compétences: radar.md',
        '  - Annexe — Abréviations: annexes.md',
        '  - Tuteur IA: tuteur-ia.md',
    ]
    return lines


# ---------------------------------------------------------------------------
# 4. Écriture du fichier (seule la section nav est remplacée)
# ---------------------------------------------------------------------------

def main():
    if not os.path.isfile(MKDOCS):
        sys.exit('mkdocs.yml introuvable (%s)' % MKDOCS)

    nb_jour = len(glob.glob(os.path.join(DOCS, 'tome-p*/jour-*.md')))
    nb_jour -= len(glob.glob(os.path.join(DOCS, 'tome-p1/jour-*.md')))
    if nb_jour < 600:
        sys.exit('Attendu >= 600 leçons sur disque, trouvé %d. Abandon.' % nb_jour)

    new_nav = build()
    new_block = 'nav:\n' + '\n'.join(new_nav) + '\n'

    old = open(MKDOCS, encoding='utf-8').read()
    idx = old.find('\nnav:')
    if idx == -1:
        sys.exit('Section nav: introuvable dans mkdocs.yml. Abandon.')

    head = old[:idx]
    backup = '/tmp/mkdocs.yml.bak-navgen'
    open(backup, 'w', encoding='utf-8').write(old)
    print('Sauvegarde : %s' % backup)

    open(MKDOCS, 'w', encoding='utf-8').write(head + new_block)

    # Vérification finale (ensembles)
    nav_refs = set(re.findall(r'tome-p\d+/jour-[a-z0-9]+\.md', new_block))
    disk = set()
    for p in glob.glob(os.path.join(DOCS, 'tome-p*/jour-*.md')):
        rel = p.replace(DOCS + '/', '')
        if rel.startswith('tome-p1/'):
            continue
        disk.add(rel)
    miss = disk - nav_refs
    extra = nav_refs - disk
    print('Références jours dans nav : %d' % len(nav_refs))
    print('Fichiers jours sur disque  : %d' % len(disk))
    if miss:
        print('MANQUANTS : %d' % len(miss))
        for m in sorted(miss)[:10]:
            print('  -', m)
        sys.exit('Échec : des leçons manquent dans la nav.')
    if extra:
        print('RÉFÉRENCES FANTOMES : %d' % len(extra))
        for m in sorted(extra)[:10]:
            print('  -', m)
    print('OK : nav complète (0 écart).')


if __name__ == '__main__':
    main()
