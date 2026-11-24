#!/usr/bin/env python3
"""Gli animali della fattoria, di profilo verso destra (il gioco li specchia quando vanno a sinistra).
Bestie magre di un autunno lungo: la gallina nera a scaglie, l'anatra grigia col collo verde petrolio,
la mucca ossuta con le corna lunghe, la capra nera con l'occhio giallo, la pecora dal muso nero
(lana sporca, e tosata). 2 fotogrammi di passo (la gallina ne ha 3: il terzo becca).
Scrive animali.pxs; poi:
    python3 tools/pixel/studio.py tools/pixel/animali.pxs --js js/animali_mano.js --nome ANIMALI_MANO
"""
import os, math
from tela import Tela as TelaBase

PAL = """o #07050a
J #8aa0a8
j #5a6a74
l #e8dcc0
L #c0baa8
m #9a968a
n #74726e
s #55545a
X #0e090c
K #1c1418
k #2a1e24
c #3a2a30
b #4a3222
B #6a4a30
w #8a6a44
R #b0261e
r #7c1512
g #d8aa48
p #b88a6a
P #8a5a4a
t #3e5a6e
T #2a3a52
y #c8862e
Y #8a3418"""


class Tela(TelaBase):
    """la luce di luna degli animali: chiara sui pelami chiari, fredda sugli scuri"""

    def luna(s, ok='KkcbBsnmLTt'):
        """luce di luna: il pixel pieno col vuoto sopra prende il tono freddo (solo sui colori scuri)"""
        N = [r[:] for r in s.G]
        for y in range(s.h):
            for x in range(s.w):
                if s.G[y][x] in ok and s.get(x, y - 1) == '.':
                    N[y][x] = 'J' if s.G[y][x] in 'mLn' else 'j'
        s.G = N


A = {}


# ---------------------------------------------------------------- gallina nera a scaglie (12x12)
def gallina(f):
    T = Tela(12, 12)
    becca = f == 2
    # zampe gialle spente
    for k, lx in enumerate((5, 7)):
        sw = (1 if k else -1) if f == 1 else 0
        T.gamba(lx, 8, lx + sw, 10, 'yyY')
        T.put(lx + sw - 1, 11, 'Y'); T.put(lx + sw + 1, 11, 'Y'); T.put(lx + sw, 11, 'y')
    # la coda a falce, piccola, che si alza dietro
    for x, y, ch in ((1, 3, 'T'), (2, 2, 'j'), (1, 4, 'K'), (2, 3, 'K'), (2, 4, 'c'), (3, 4, 'K'), (2, 5, 'K'), (3, 5, 'c')):
        T.put(x, y, ch)
    # il corpo a uovo con le scaglie chiare
    T.ell(5.6, 7, 3.6, 2.5, 'cKX', trama=lambda x, y, ch: 'n' if ch == 'K' and (x + y * 2) % 4 == 0 else None)
    # collo e testa (becca: giù, davanti)
    hx, hy = (10, 8) if becca else (8, 3)
    T.poli([(6.5, 6), (hx - 1, hy), (hx + 1, hy + 1), (8.5, 7)], 'cKX')
    T.ell(hx, hy, 1.5, 1.5, 'cKX')
    # cresta e bargigli rosso sangue, becco, occhio
    for dx, dy in ((-1, -2), (0, -2), (1, -2), (0, -3) if not becca else (1, -3)):
        T.put(hx + dx, hy + dy, 'R')
    T.put(hx + 1, hy + 2, 'r')
    T.put(hx + 2, hy, 'y'); T.put(hx + 2, hy + 1, 'Y')
    T.put(hx + 1, hy, 'g')
    T.luna()
    return T.contorno()


for f in range(3):
    A[f'gallina{f}'] = gallina(f)


# ---------------------------------------------------------------- anatra grigia, collo petrolio (12x10)
def anatra(f):
    T = Tela(12, 10)
    for k, lx in enumerate((5, 7)):
        sw = (1 if k else -1) if f else 0
        T.put(lx + sw, 8, 'y')
        T.put(lx + sw, 9, 'y'); T.put(lx + sw + 1, 9, 'Y')
    T.poli([(1, 5), (3, 4), (3, 7)], 'nsc')  # la coda
    T.ell(5.5, 6, 4.5, 2.4, 'Lnm', trama=lambda x, y, ch: 's' if y == 6 and 3 <= x <= 7 else None)  # l'ala
    T.ell(9, 4, 1.3, 2.4, 'tTK')  # collo
    T.ell(9.3, 2.3, 1.7, 1.6, 'tTK')  # testa
    T.put(9, 4, 'l')  # il collarino bianco
    T.put(11, 2, 'y'); T.put(11, 3, 'Y')  # becco
    T.put(10, 2, 'X')
    T.luna()
    return T.contorno()


for f in range(2):
    A[f'anatra{f}'] = anatra(f)


# ---------------------------------------------------------------- mucca ossuta, corna lunghe (24x17)
def mucca(f):
    T = Tela(24, 17)
    # zampe lunghe e secche, le lontane più scure; il passo incrocia le coppie; ginocchio nodoso
    for lx, lontana, fase in ((4, 1, 1), (6, 0, -1), (15, 1, -1), (17, 0, 1)):
        sw = fase if f else 0
        T.gamba(lx, 9, lx + sw, 15, 'KKc' if lontana else 'bBb', spess=2 if not lontana else 1)
        T.put(lx + sw, 13, 'w' if not lontana else 'c')
        T.put(lx + sw, 16, 'X'); T.put(lx + sw + 1, 16, 'X')  # zoccoli
    # coda sottile col fiocco
    T.gamba(2, 4, 1, 10, 'BBB')
    T.put(0, 11, 'K'); T.put(1, 11, 'K'); T.put(1, 12, 'K')

    # corpo: dorso che cala, ventre tirato; chiazze color osso, costole in vista
    def trama(x, y, ch):
        if ((x - 7.5) / 2.6) ** 2 + ((y - 5.5) / 2) ** 2 <= 1 or ((x - 13) / 2) ** 2 + ((y - 8.5) / 1.4) ** 2 <= 1:
            return 'L' if ch == 'B' else 'm' if ch == 'b' else 'l'
        if ch == 'B' and y in (6, 8) and 10 <= x <= 14 and x % 2 == 0:
            return 'b'
        return None
    T.poli([(2, 4), (4, 3), (10, 4.5), (15, 3.5), (18, 4), (19, 9), (15, 10.5), (12, 10), (7, 10.5), (2.5, 9)], 'wBb', trama=trama)
    T.put(10, 11, 'P'); T.put(11, 11, 'P')  # mammella, spenta
    # collo che scende e testa lunga, il muso in basso
    T.poli([(17, 4), (19, 3.5), (21.5, 6), (20, 9), (18, 8)], 'wBb')
    T.poli([(19.5, 4), (21.5, 4), (23.5, 8.5), (23, 10.5), (21, 10.5), (20, 7.5)], 'BbK')
    T.put(21, 5, 'l'); T.put(22, 7, 'l'); T.put(22, 8, 'l')  # la fiammata sul muso
    T.put(22, 10, 'P'); T.put(23, 10, 'P')  # il muso
    T.put(21, 6, 'X')  # l'occhio
    T.put(19, 5, 'b'); T.put(18, 5, 'b')  # l'orecchio di lato
    T.luna()
    # corna lunghe a lira, ingiallite, con le punte scure (dopo la luna: restano color osso)
    for x, y, ch in ((20, 3, 'L'), (19, 2, 'L'), (18, 1, 'm'), (17, 1, 'n'), (21, 3, 'L'), (22, 2, 'L'), (22, 1, 'm'), (23, 0, 'n')):
        T.put(x, y, ch)
    return T.contorno()


for f in range(2):
    A[f'mucca{f}'] = mucca(f)


# ---------------------------------------------------------------- capra nera, occhio giallo (17x15)
def capra(f):
    T = Tela(17, 15)
    for lx, lontana, fase in ((4, 1, 1), (5, 0, -1), (11, 1, -1), (12, 0, 1)):
        sw = fase if f else 0
        T.gamba(lx, 9, lx + sw, 13, 'XKX' if lontana else 'kck')
        T.put(lx + sw, 14, 'n')  # zoccolo chiaro
    T.put(1, 4, 'K'); T.put(2, 5, 'c'); T.put(1, 3, 'c')  # coda corta all'insù
    # corpo nero, magro, a pelo lungo: ciuffi che pendono sotto la pancia
    T.poli([(2, 5), (6, 4.5), (11, 5), (13, 4), (14, 7), (12, 10), (5, 10), (2, 8)], 'ckK')
    for x in (4, 6, 8, 10):
        T.put(x, 10, 'K')
    # collo dritto e testa a cuneo, il muso in giù
    T.poli([(11.5, 5), (13, 2), (15, 2.5), (16.5, 6), (15.5, 7), (13.5, 5.5)], 'ckK')
    T.put(14, 7, 'K'); T.put(14, 8, 'K'); T.put(15, 8, 'X')  # la barba
    T.put(14, 3, 'g'); T.put(15, 3, 'X')  # l'occhio giallo con la pupilla
    T.put(12, 3, 'K'); T.put(11, 4, 'K')  # orecchio che pende
    T.luna()
    # corna che girano all'indietro, color corno
    for x, y, ch in ((13, 1, 'n'), (12, 0, 'm'), (11, 0, 'm'), (10, 1, 'n'), (14, 1, 'n')):
        T.put(x, y, ch)
    return T.contorno()


for f in range(2):
    A[f'capra{f}'] = capra(f)


# ---------------------------------------------------------------- pecora dal muso nero (18x14), e tosata
def pecora(f, tosata):
    T = Tela(18, 14)
    for lx, lontana, fase in ((4, 1, 1), (6, 0, -1), (11, 1, -1), (13, 0, 1)):
        sw = fase if f else 0
        T.gamba(lx, 9 if not tosata else 8, lx + sw, 12, 'XKX' if lontana else 'Kck')
        T.put(lx + sw, 13, 'X')
    if tosata:
        # pelle rasa, grigio rosato, la spina dorsale e le costole
        T.poli([(2, 5), (6, 4), (12, 4), (14, 5), (14, 9), (12, 10), (5, 10), (2, 8)], 'pPb',
               trama=lambda x, y, ch: 'P' if ch == 'p' and y in (6, 8) and 6 <= x <= 11 and x % 2 else None)
        T.put(1, 5, 'P')
    else:
        # lana sporca a riccioli: grumi chiari e scuri, il bordo bitorzoluto
        bozzi = [(3, 6, 2.6), (6, 4.5, 2.6), (9.5, 4.3, 2.6), (12, 5.5, 2.3), (12.5, 8, 2.2), (9, 9, 2.6), (5, 9, 2.6), (3, 8.5, 2)]
        T.parte(lambda x, y: any((x - a) ** 2 + (y - b) ** 2 <= r * r for a, b, r in bozzi), 'lLm',
                trama=lambda x, y, ch: 'm' if ch == 'L' and (x * 3 + y * 5) % 7 == 0 else 'n' if ch == 'm' and (x + y) % 3 == 0 else None)
    # testa nera, orecchie di lato, occhio chiaro
    T.poli([(14, 3), (16, 3), (17.5, 7), (16.5, 9), (15, 8), (14, 5)], 'ckK')
    T.put(13, 4, 'K'); T.put(12, 4, 'X')  # orecchio
    T.put(15, 5, 'L'); T.put(16, 5, 'X')  # l'occhio, chiaro e fisso
    T.put(17, 8, 'P')  # narice
    if not tosata:  # il ciuffo di lana sulla fronte
        T.put(13, 2, 'L'); T.put(14, 2, 'l'); T.put(13, 3, 'L')
    T.luna(ok='KkcsnmLPp' if tosata else 'Kkc')
    return T.contorno()


for f in range(2):
    A[f'pecora{f}'] = pecora(f, False)
for f in range(2):
    A[f'tosata{f}'] = pecora(f, True)

QUI = os.path.dirname(__file__)
righe = ['# Gli animali della fattoria. Generato da animali_abbozzo.py.', '@tavolozza', PAL]
for k, T in A.items():
    righe.append(f'@sprite {k} {T.w}x{T.h}')
    righe += T.righe()
open(os.path.join(QUI, 'animali.pxs'), 'w').write('\n'.join(righe) + '\n')
print('scritto animali.pxs')
