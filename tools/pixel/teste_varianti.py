#!/usr/bin/env python3
"""Ricava dalle teste a mano (teste.pxs, capelli corti) le altre acconciature del menu Aspetto e scrive
teste_tutte.pxs (generato: le modifiche si fanno in teste.pxs o qui).

    python3 tools/pixel/teste_varianti.py && python3 tools/pixel/studio.py tools/pixel/teste_tutte.pxs \
        --js js/teste_mano.js --nome TESTE_MANO

Ogni testa è 18 colonne; le varianti hanno 3 righe in più sopra (ciuffi, chignon) e 5 sotto (capelli lunghi):
la cima della testa corta resta alla riga 3 di ogni griglia, così il gioco le posa tutte allo stesso punto.
"""
import os, sys
sys.path.insert(0, os.path.dirname(__file__))
from studio import leggi, componi

QUI = os.path.dirname(__file__)
pal, ombra, sprites = leggi(os.path.join(QUI, 'teste.pxs'))
TESTE = {sp['nome'].split('_')[1]: componi(sp, ombra, []) for sp in sprites if sp['nome'].startswith('testa_')}
VOLTI = {sp['nome'].split('_')[1]: componi(sp, ombra, []) for sp in sprites if sp['nome'].startswith('volto_')}
base = dict(TESTE)  # giu, lato, su: si cambia la testa di fronte per ogni volto
W, SU, GIU = 18, 3, 5
CAPELLI = set('Rrh')


def tela(g):
    t = [list('.' * W) for _ in range(SU)] + [list(r) for r in g] + [list('.' * W) for _ in range(GIU)]
    return t


def metti(t, x, y, c, solo_vuoto=False):
    y += SU
    if 0 <= y < len(t) and 0 <= x < W and (not solo_vuoto or t[y][x] == '.'):
        t[y][x] = c


def contorna(t):
    """rimette il contorno 'o' attorno a quello che è stato aggiunto"""
    h = len(t)
    nuovo = [r[:] for r in t]
    for y in range(h):
        for x in range(W):
            if t[y][x] != '.':
                continue
            if any(0 <= y + dy < h and 0 <= x + dx < W and t[y + dy][x + dx] not in '.o'
                   for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1))):
                nuovo[y][x] = 'o'
    return nuovo


def rasati(d):
    t = tela(base[d])
    for r in t:
        for x, c in enumerate(r):
            if c in CAPELLI:
                r[x] = {'R': 'S', 'r': 'S', 'h': 'H'}[c]
    # un'ombra di capelli rasati sulla nuca e ai lati
    for r in t[SU + 2:SU + 9]:
        for x, c in enumerate(r):
            if c == 'S' and (x < 4 or x > 13):
                r[x] = 's'
    return t


def spettinati(d):
    t = tela(base[d])
    # ciuffi a punta, larghi due pixel alla base
    for x, alt in ((3, 2), (6, 3), (9, 3), (12, 2), (14, 1)):
        for k in range(1, alt + 1):
            metti(t, x, -k + 1, 'h' if k == alt else 'R')
            if k < alt:
                metti(t, x + 1, -k + 1, 'r')
    return contorna(t)


def lunghi(d):
    t = tela(base[d])
    if d == 'su':
        # di spalle: una cascata che scende fino alle spalle
        for y in range(9, 18 + GIU - 1):
            larg = 7 if y < 16 else 7 - (y - 15)
            for x in range(9 - larg, 9 + larg):
                metti(t, x, y, 'r' if x % 3 == 0 and y > 11 else ('h' if x == 9 - larg + 1 else 'R'))
    else:
        lati = (1, 2, 3, 14, 15, 16) if d == 'giu' else (1, 2, 3, 4)
        for x in lati:
            for y in range(8, 18 + GIU - 2):
                if y > 19 and x in (1, 16):
                    continue
                metti(t, x, y, 'h' if x in (2, 15) and y < 14 else ('r' if x in (3, 14) else 'R'))
    return contorna(t)


def raccolti(d):
    t = tela(base[d])
    if d == 'su':
        for y in range(4, 10):
            for x in range(6, 12):
                if (x - 8.5) ** 2 + (y - 6.5) ** 2 <= 8:
                    metti(t, x, y, 'h' if (x < 8 and y < 6) else ('r' if (x - 8.5) ** 2 + (y - 6.5) ** 2 > 5 else 'R'))
    else:
        cx = 9 if d == 'giu' else 4
        for y in range(-3, 1):
            for x in range(cx - 3, cx + 3):
                if ((x - cx + 0.5) / 3) ** 2 + ((y + 1) / 2.2) ** 2 <= 1:
                    metti(t, x, y, 'h' if x < cx and y < -1 else ('r' if y == 0 else 'R'))
    return contorna(t)


VARIANTI = {'short': lambda d: tela(base[d]), 'bald': rasati, 'messy': spettinati, 'long': lunghi, 'bun': raccolti}
righe = ['# GENERATO da teste_varianti.py: non modificare (si modifica teste.pxs)', '@tavolozza']
righe += [f'{k} {v}' for k, v in pal.items()]
n = 0
for volto, faccia in VOLTI.items():
    # la testa di fronte con questo volto: capelli e fronte (righe 0-8) della testa disegnata, poi il volto
    base['giu'] = TESTE['giu'][:9] + faccia
    for stile, f in VARIANTI.items():
        for d in ('giu', 'lato', 'su'):
            g = f(d)
            righe.append(f'@sprite {volto}_{stile}_{d} {W}x{len(g)}')
            righe += [''.join(r) for r in g]
            n += 1
open(os.path.join(QUI, 'teste_tutte.pxs'), 'w').write('\n'.join(righe) + '\n')
print('scritto teste_tutte.pxs:', n, 'teste')
