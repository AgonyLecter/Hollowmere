#!/usr/bin/env python3
"""I compagni (cane e gatto), di profilo verso destra, 4 pose: 0-1 passo, 2 seduto, 3 sdraiato a dormire.
Gatto 24x18, cane 26x20. Ogni manto ha la sua tavolozza e il suo collare:
  gatto: rosso tigrato (campanellino d'ottone), nero (riflessi viola, occhi verde acido, collare rosso col pentacolo),
         grigio tigrato (fiocco blu notte e campanello d'argento), tricolore (nastro prugna)
  cane:  fulvo (cuoio rosso e medaglietta), nero focato (collare di ferro chiodato), pezzato (fazzoletto verde),
         grigio lupo (cuoio nero e anello d'argento, occhi di ghiaccio)
Scrive compagni/<manto>.pxs (da guardare con lo studio) e js/compagni_mano.js:
    python3 tools/pixel/compagni_abbozzo.py
    python3 tools/pixel/studio.py tools/pixel/compagni/gatto1.pxs --out tavola.png   (per vederne uno)
"""
import os, math, json
from tela import Tela

# lettere comuni: o contorno, B pelo, b pelo in ombra, L pelo in luce, J luce di luna, W muso/petto chiaro,
# M macchia, K macchia scura, e occhio, p pupilla, n naso, i dentro l'orecchio, C collare, c collare in ombra,
# G ciondolo, g ciondolo in ombra, X nero, Z bocca
MANTI = {
    'gatto': [
        dict(nome='rosso tigrato', B='#c8762e', b='#8a4a1e', L='#e8a050', J='#f0c890', W='#f4d8b0', M='#8a4a1e', K='#5a2a10',
             e='#9ad04a', p='#14100c', n='#d88080', i='#c87070', C='#5a3a22', c='#3a2416', G='#d8aa48', g='#8a6a20', righe=1),
        dict(nome='nero', B='#1e1a26', b='#0c0a10', L='#3a304a', J='#6a5a8a', W='#2a2434', M='#1e1a26', K='#0c0a10',
             e='#c8f040', p='#0c0a10', n='#4a3a44', i='#3a2a3a', C='#b0261e', c='#6a1418', G='#e04030', g='#7c1512', pentacolo=1),
        dict(nome='grigio tigrato', B='#7a7a88', b='#4a4a58', L='#a8a8b8', J='#d0d4e0', W='#e0e0e8', M='#4a4a58', K='#33333e',
             e='#e0a030', p='#14100c', n='#c88a90', i='#c08890', C='#2a3a52', c='#1a2434', G='#c8ccd4', g='#74747e', righe=1),
        dict(nome='tricolore', B='#efe6d6', b='#b8ae9c', L='#fffaf0', J='#ffffff', W='#fffaf0', M='#d8822e', K='#2a2228',
             e='#7ac050', p='#14100c', n='#e0989c', i='#e0a0a8', C='#5a3a52', c='#3a2436', G='#8a5a7a', g='#5a3a52', macchie=1),
    ],
    'cane': [
        dict(nome='fulvo', B='#b8742e', b='#7a4a1e', L='#dca060', J='#f0c890', W='#f2e2c4', M='#7a4a1e', K='#4a2a10',
             e='#5a3010', p='#0c0806', n='#1c1012', i='#8a4a2a', C='#7c1512', c='#4a0a0c', G='#d8aa48', g='#8a6a20'),
        dict(nome='nero focato', B='#1e1a1c', b='#0c0a0c', L='#3e363c', J='#6a6070', W='#b8743a', M='#b8743a', K='#7a4a1e',
             e='#c88a2a', p='#0c0806', n='#0c0a0c', i='#3a2a2a', C='#55545a', c='#2a2a32', G='#c0baa8', g='#74726e', borchie=1),
        dict(nome='pezzato', B='#ece4d4', b='#b8ae9c', L='#fffaf0', J='#ffffff', W='#fffaf0', M='#5a3a22', K='#3a2416',
             e='#3a2010', p='#0c0806', n='#2a1a1a', i='#c09080', C='#3e5a3e', c='#24382a', G='#3e5a3e', g='#24382a', macchie=1, fazzoletto=1),
        dict(nome='grigio lupo', B='#6a6a74', b='#3e3e48', L='#9a9aa6', J='#c8ccd8', W='#d8d8e0', M='#3e3e48', K='#2a2a32',
             e='#8ac8e8', p='#0c0a10', n='#14100c', i='#5a4a50', C='#1c1418', c='#0e090c', G='#c8ccd4', g='#74747e'),
    ],
}

PELO = ('L', 'B', 'b')


def tavolozza(S):
    t = {'o': '#07050a', 'X': '#0c0806', 'Z': '#3a1418'}
    for k in 'BbLJWMKepniCcGg':
        t[k] = S[k]
    return t


def zampa(T, x0, y0, x1, y1, lontana, spess=2):
    """una zampa: davanti in luce, dietro in ombra, il piede un po' più largo"""
    n = int(max(abs(x1 - x0), abs(y1 - y0))) + 1
    for k in range(n + 1):
        t = k / n
        x, y = x0 + (x1 - x0) * t, y0 + (y1 - y0) * t
        for d in range(spess):
            T.put(x + d, y, 'b' if lontana else ('B' if d == 0 else 'b'))
    T.put(x1 + spess, y1, 'b' if lontana else 'B')


def pattern(T, S, testa):
    """righe del tigrato e macchie del tricolore / pezzato, solo sul pelo"""
    hx, hy = testa
    for y in range(T.h):
        for x in range(T.w):
            ch = T.G[y][x]
            if ch not in 'BLb':
                continue
            if S.get('righe'):
                sul_capo = math.hypot(x - hx, y - hy) < 3.2
                if (not sul_capo and (x + y // 3) % 3 == 0 and y > 4) or (sul_capo and y < hy - 1 and x % 2 == 0):
                    T.G[y][x] = 'b' if ch != 'b' else 'K'
            if S.get('macchie'):
                if math.hypot(x - 7, (y - 9) * 1.3) < 3.4:
                    T.G[y][x] = 'M' if ch != 'b' else 'K'
                elif math.hypot(x - hx + 1.6, y - hy + 1.8) < 1.8:
                    T.G[y][x] = 'K' if S is MANTI['gatto'][3] else 'M'
                elif math.hypot(x - 12, (y - 12) * 1.4) < 2.2 and S is MANTI['gatto'][3]:
                    T.G[y][x] = 'K'


def collare(T, S, x, y, verticale=False):
    """il collare e il suo ciondolo: il pentacolo rosso del gatto nero, la medaglietta, le borchie, il fazzoletto"""
    for k in range(3):
        T.put(x + (0 if verticale else k * 0.4), y + k, 'C' if k < 2 else 'c')
        T.put(x + 1 + (0 if verticale else k * 0.4), y + k, 'C')
    if S.get('pentacolo'):
        # un pentacolo appeso: cerchio rosso e la stella dentro (5x5)
        P = ['.ggg.', 'gG.Gg', 'gGGGg', 'g.G.g', '.ggg.']
        for dy, r in enumerate(P):
            for dx, ch in enumerate(r):
                if ch != '.':
                    T.put(x - 1 + dx, y + 2 + dy, ch)
    elif S.get('borchie'):
        for k in range(3):
            T.put(x + 2, y + k, 'G')
        T.put(x + 3, y + 1, 'G')
    elif S.get('fazzoletto'):
        for dy in range(4):
            for dx in range(-1, 3 - dy):
                T.put(x + dx, y + 2 + dy, 'C' if (dx + dy) % 3 else 'c')
    else:
        T.put(x + 1, y + 3, 'G'); T.put(x + 2, y + 3, 'g'); T.put(x + 1, y + 4, 'g')


def occhio(T, S, x, y, chiuso=False, grande=False):
    if chiuso:
        T.put(x, y, 'b'); T.put(x + 1, y, 'b')
        return
    # a mandorla, due pixel per due: il colore, la pupilla, il fondo che brilla
    T.put(x, y, 'e'); T.put(x + 1, y, 'p'); T.put(x, y + 1, 'e'); T.put(x + 1, y + 1, 'e' if grande else 'p')


# ================================================================ il gatto 24x18
def gatto(S, f):
    T = Tela(24, 18, 7)
    if f in (0, 1):
        # la coda lunga, che sale e si arriccia in punta (oscilla col passo)
        oz = 1 if f else 0
        for k in range(11):
            t = k / 10
            x = 4 - t * 3 + math.sin(t * 3.2) * 1.2 - oz * t * t
            y = 10 - t * 8
            T.disco(x, y, 1.1 - t * .3, 'B')
        T.put(1 - oz, 1, 'B'); T.put(2 - oz, 1, 'B')
        # zampe: lontane in ombra; il passo incrocia le coppie
        for lx, lontana, fase in ((6, 1, 1), (8, 0, -1), (14, 1, -1), (16, 0, 1)):
            sw = fase * 2 if f else -fase
            zampa(T, lx, 11, lx + sw, 16, lontana)
        # il corpo snello, il dorso che si alza verso le spalle
        T.poli([(4, 9), (8, 7.5), (14, 8), (17, 7), (18, 11), (15, 13), (8, 13), (4, 12)], PELO)
        T.ell(17.5, 10.5, 2, 2.3, ('W', 'W', 'b'))  # il petto chiaro
        hx, hy = 18.5, 6
    elif f == 2:
        # seduto: la schiena dritta, la coda attorno alle zampe
        for k in range(12):
            t = k / 11
            T.disco(5 + t * 11, 16.2 - math.sin(t * 3) * .5, .9, 'B')
        T.ell(10, 12, 4.6, 4.6, PELO)  # le anche
        T.poli([(9, 8), (14, 6), (16, 10), (15, 16), (11, 16), (8, 13)], PELO)
        zampa(T, 13, 12, 13, 16, 0)
        zampa(T, 15, 12, 15, 16, 1)
        T.ell(15, 10.5, 1.8, 2.4, ('W', 'W', 'b'))
        hx, hy = 15.5, 5
    else:
        # sdraiato a dormire: arrotolato, il muso sulle zampe, la coda che lo avvolge
        T.ell(11, 13, 8.4, 4.2, PELO)
        T.ell(5.5, 12, 3.6, 3.6, PELO)  # l'anca
        for k in range(14):
            t = k / 13
            T.disco(4 + t * 13, 16.2 - math.sin(t * 3.1) * 1.2, .9, 'b' if t < .5 else 'B')
        T.ell(18, 15, 2.6, 1.3, ('W', 'W', 'b'))  # le zampe davanti
        hx, hy = 18, 11
    # la testa: tonda, le orecchie a punta col dentro rosa
    T.ell(hx, hy, 3.6, 3.1, PELO)
    for ox, d in ((-2.2, -1), (1.6, 1)):
        ex = hx + ox
        T.poli([(ex - 1.5, hy - 2), (ex + .2 * d, hy - 5.6), (ex + 1.6, hy - 1.6)], ('L', 'B', 'b'))
        T.put(ex + .2 * d, hy - 3.2, 'i'); T.put(ex + .2 * d, hy - 2.4, 'i')
    pattern(T, S, (hx, hy))
    # il muso: guance chiare, il naso, gli occhi
    T.put(hx + 2.4, hy + .8, 'W'); T.put(hx + 3.2, hy + .6, 'W'); T.put(hx + 2.6, hy + 1.6, 'W')
    T.put(hx + 3.6, hy - .2, 'n')
    T.put(hx + 3, hy + 1.8, 'Z')
    occhio(T, S, hx + .6, hy - 1, chiuso=(f == 3), grande=bool(S.get('pentacolo')))
    if f == 3:  # dorme: le Z non le disegna il gatto, le disegna il gioco
        pass
    T.luna('BLb', chiaro='J', medio='L')
    # il collare dopo la luna (resta del suo colore)
    if f != 3 and not S.get('randagio'):
        collare(T, S, hx - 1.4, hy + 2.4)
    T.contorno()
    return T


# il gatto nero del paese: randagio, senza collare, un po' spelacchiato, gli occhi gialli
GATTO_PAESE = dict(nome='gatto del paese', B='#1c1820', b='#0c0a10', L='#34303c', J='#5a5468', W='#26222c', M='#1c1820',
                   K='#0c0a10', e='#e8c030', p='#0c0a10', n='#4a3a44', i='#3a2a3a', C='#1c1820', c='#0c0a10',
                   G='#1c1820', g='#0c0a10', randagio=1)


# ================================================================ il cane 26x20
def cane(S, f):
    T = Tela(26, 20, 9)
    focato = S['nome'] == 'nero focato'
    if f in (0, 1):
        # la coda alta, a sciabola, che scodinzola
        sc = 1.4 if f else -.4
        for k in range(8):
            t = k / 7
            T.disco(5 - t * 2.5, 9 - t * 6 + sc * t * t, 1.3 - t * .5, 'B')
        for lx, lontana, fase in ((6, 1, 1), (8, 0, -1), (15, 1, -1), (17, 0, 1)):
            sw = fase * 2 if f else -fase
            zampa(T, lx, 12, lx + sw, 18, lontana, spess=2)
            if focato:
                T.put(lx + sw, 17, 'W'); T.put(lx + sw + 1, 17, 'W')
        T.poli([(4, 9), (9, 8), (15, 8.5), (19, 7), (20, 12), (17, 14), (8, 14), (4, 13)], PELO)
        T.ell(19, 11, 2.2, 2.6, ('W', 'W', 'b'))
        hx, hy = 20, 6
    elif f == 2:
        # seduto, il petto in fuori, le zampe dritte
        for k in range(6):
            T.disco(6 - k * .6, 17 - k * .3, 1, 'B')
        T.ell(10, 14, 5, 4.4, PELO)
        T.poli([(10, 9), (16, 7), (18, 11), (17, 18), (12, 18), (9, 14)], PELO)
        zampa(T, 14, 13, 14, 18, 0)
        zampa(T, 16, 13, 16, 18, 1)
        T.ell(16.6, 11, 2, 2.8, ('W', 'W', 'b'))
        hx, hy = 17, 5.5
    else:
        # sdraiato a dormire: allungato, il muso tra le zampe
        T.ell(11, 15, 9, 3.6, PELO)
        T.ell(5, 14, 3.6, 3.6, PELO)
        for k in range(6):
            T.disco(2 - k * .3, 16.5 + k * .2, 1, 'B')
        T.ell(19.5, 17.4, 3.4, 1.2, ('W' if focato else 'B', 'B', 'b'))
        hx, hy = 19, 13.5
    # la testa: cranio, muso lungo, orecchio che pende
    T.ell(hx, hy, 3.4, 3, PELO)
    T.poli([(hx + 1.5, hy - .5), (hx + 5.4, hy + .2), (hx + 5.4, hy + 2.6), (hx + 1.5, hy + 2.8)], ('L', 'B', 'b'))
    pattern(T, S, (hx, hy))
    if focato:  # le focature: sopracciglio, muso, petto
        T.put(hx + .5, hy - 1.8, 'W'); T.put(hx + 1.4, hy - 1.8, 'W')
        for x in range(int(hx + 2), int(hx + 5)):
            T.put(x, hy + 2.2, 'W')
    else:
        for x in range(int(hx + 2), int(hx + 5)):
            T.put(x, hy + 2.2, 'W')
    T.put(hx + 5.2, hy + .2, 'n'); T.put(hx + 5.2, hy + 1, 'n')
    T.put(hx + 3.6, hy + 2.8, 'Z')
    # l'orecchio che pende, in ombra
    for k in range(5):
        T.put(hx - 1.6 + k * .2, hy - 2 + k, 'b'); T.put(hx - .8 + k * .2, hy - 2 + k, 'b' if k > 1 else 'B')
    occhio(T, S, hx + .8, hy - .6, chiuso=(f == 3))
    T.luna('BLb', chiaro='J', medio='L')
    if f != 3:
        collare(T, S, hx - 1.8, hy + 2.6)
    T.contorno()
    return T


QUI = os.path.dirname(__file__)
os.makedirs(os.path.join(QUI, 'compagni'), exist_ok=True)
DATI = {}
for kind, fn in (('gatto', gatto), ('cane', cane)):
    DATI[kind] = []
    for s, S in enumerate(MANTI[kind]):
        pose = [fn(S, f) for f in range(4)]
        pal = tavolozza(S)
        DATI[kind].append({'tavolozza': pal, 'sprite': {f'f{f}': T.righe() for f, T in enumerate(pose)}})
        righe = [f'# {kind}, {S["nome"]}. Generato da compagni_abbozzo.py.', '@tavolozza'] + [f'{k} {v}' for k, v in pal.items()]
        for f, T in enumerate(pose):
            righe.append(f'@sprite {kind}{s}_{f} {T.w}x{T.h}')
            righe += T.righe()
        open(os.path.join(QUI, 'compagni', f'{kind}{s}.pxs'), 'w').write('\n'.join(righe) + '\n')
DATI['paese'] = {'tavolozza': tavolozza(GATTO_PAESE), 'sprite': {f'f{f}': gatto(GATTO_PAESE, f).righe() for f in range(4)}}
js = ("'use strict';\n// Generato da tools/pixel/compagni_abbozzo.py: non modificare a mano, si rifà con l'abbozzo.\n"
      "// COMPAGNI_MANO[kind][manto] = {tavolozza, sprite: {f0..f3}} (passo, passo, seduto, sdraiato);\n"
      "// COMPAGNI_MANO.paese: il gatto nero randagio del paese, stesse pose\n"
      'const COMPAGNI_MANO = ' + json.dumps(DATI, indent=1) + ';\n')
open(os.path.join(QUI, '..', '..', 'js', 'compagni_mano.js'), 'w').write(js)
print('scritti compagni/*.pxs e js/compagni_mano.js')
