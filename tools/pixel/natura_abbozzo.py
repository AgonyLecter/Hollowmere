#!/usr/bin/env python3
"""La natura di Hollowmere, alla grana dell'Albero dei Morti (1 pixel = 1 unità di gioco).
- alberi 44x58, 5 forme x 4 stagioni: tronchi contorti, rami che finiscono in dita, chiome rade a ciuffi
  (autunno ruggine e sangue, inverno nudi con la neve, primavera verde malato con pochi fiori pallidi,
  estate verde nero); la quinta forma è un albero mezzo morto in ogni stagione
- pini 30x52, 3 forme: abeti neri a palchi cadenti e sfrangiati, il terzo mezzo secco
- cespugli 20x17: rovo scuro con le spine, e con le bacche rosse
Scrive natura.pxs; poi:
    python3 tools/pixel/studio.py tools/pixel/natura.pxs --js js/natura_mano.js --nome NATURA_MANO
"""
import os, math
from tela import Tela

PAL = """o #07050a
X #0e090c
K #1c1418
k #2a1e24
c #3a2a30
b #2e2016
B #4a3222
w #6a4a30
J #8aa0a8
j #5a6a74
N #e8e4dc
n #c0c4c8
1 #4a0a0c
2 #7c1512
3 #b0261e
4 #5a1e10
5 #8a3418
6 #b05a22
7 #c8862e
8 #d8aa48
a #141e12
d #1e2a18
e #2e3a22
f #44522c
g #606a36
h #7e8240
p #c8a8b0
q #e8dcc0
s #10201c
t #1a3028
u #26463a
v #3a5e4c
x #5a7a68"""


# ================================================================ alberi
# chiome per stagione: (chiaro, medio, scuro) per ogni ciuffo, scelti a caso
CHIOME = {
    0: [('7', '6', '5'), ('6', '5', '4'), ('3', '2', '1'), ('8', '7', '5'), ('6', '5', '4')],  # autunno
    2: [('g', 'f', 'e'), ('h', 'g', 'f'), ('f', 'e', 'd')],  # primavera: verde malato
    3: [('f', 'e', 'd'), ('e', 'd', 'a'), ('g', 'f', 'e')],  # estate: verde quasi nero
}


def albero(forma, stagione):
    T = Tela(44, 58, 1000 + forma * 7)
    rnd = T.rnd
    morto = forma == 4
    pende = (-.25, .1, .2, -.1, .3)[forma]  # quanto è storto
    punte = []

    def ramo(x, y, ang, lung, spess, liv):
        for i in range(int(lung)):
            ang += (rnd.random() - .5) * .6
            ang = max(-math.pi + .2, min(-.2, ang))
            x = min(40, max(3, x + math.cos(ang)))
            y = max(4, y + math.sin(ang))
            t = spess * (1 - i / lung * .5)
            T.disco(x, y, max(.5, t / 2), 'K' if t > 1.6 else 'k')
        if liv == 1:
            punte.append((x, y))
        if liv > 0:
            for k in range(2):
                ramo(x, y, ang + (k - .5) * (.8 + rnd.random() * .5), lung * (.62 + rnd.random() * .15), spess * .6, liv - 1)
        else:
            punte.append((x, y))
            for k in (-1, 1):  # le dita uncinate
                xx, yy, a = x, y, ang + k * .7
                for i in range(2 + (rnd.random() < .5)):
                    a += k * .4
                    xx += math.cos(a)
                    yy += math.sin(a)
                    T.put(xx, yy, 'k')

    # rami
    base_y = 38
    for a, l, sp in ((-math.pi / 2 - .95, 11, 4), (-math.pi / 2 + .9, 11, 4), (-math.pi / 2 + pende * .5, 13, 5)):
        ramo(22 + pende * 6, base_y, a + pende * .3, l, sp, 2)
    # tronco: largo e contorto, le radici che si allargano
    for y in range(base_y - 2, 58):
        t = (y - base_y + 2) / (58 - base_y + 2)
        hw = 2.8 + t ** 3 * 6 + math.sin(y * .5 + forma) * .5
        cx = 22 + pende * 6 * (1 - t) + math.sin(y * .25 + forma) * 1
        for x in range(int(cx - hw), int(cx + hw) + 1):
            u = (x - (cx - hw)) / (2 * hw + .01)
            ch = 'c' if u < .2 else 'k' if u < .55 else 'K' if u < .85 else 'X'
            if (x * 3 + y // 3 + forma) % 7 == 0:
                ch = 'X'  # i solchi
            T.put(x, y, ch)
    # un nodo, una cavità scura
    T.put(22 + pende * 3, 46, 'X'); T.put(23 + pende * 3, 46, 'X'); T.put(22 + pende * 3, 47, 'X')

    # chioma: ciuffi radi attorno alle punte (niente d'inverno; mezzo morto: pochissimi)
    if stagione != 1:
        tav = CHIOME[stagione]
        quanti = .25 if morto else .9 if stagione == 3 else .75
        ciuffi = []
        for (x, y) in punte:
            if rnd.random() < quanti:
                ciuffi.append((x + rnd.uniform(-2, 2), y + rnd.uniform(-1, 2), rnd.uniform(3, 5.2) if not morto else rnd.uniform(2, 3), rnd.choice(tav)))
        # i ciuffi dietro prima, più scuri
        for (x, y, r, (hi, mid, lo)) in sorted(ciuffi, key=lambda c: c[1]):
            for yy in range(int(y - r - 1), int(y + r + 2)):
                for xx in range(int(x - r - 1), int(x + r + 2)):
                    dx, dy = xx + .5 - x, yy + .5 - y
                    d = math.hypot(dx * 1.1, dy * 1.25)
                    bordo = r + (math.sin(xx * 2.1 + yy * 1.3) * .8)
                    if d > bordo or yy < 0 or yy >= 58:
                        continue
                    if (xx * 7 + yy * 3) % 11 == 0 and d > r * .4:
                        continue  # i buchi: si vedono i rami dietro
                    luce = -dx * .5 - dy
                    ch = hi if luce > r * .45 else lo if luce < -r * .35 else mid
                    if ch == mid and (xx + yy * 2) % 5 == 0:
                        ch = lo
                    T.put(xx, yy, ch)
        if stagione == 2:  # pochi fiori pallidi
            for (x, y, r, _) in ciuffi:
                for i in range(2):
                    T.put(x + rnd.uniform(-r * .6, r * .6), y - rnd.uniform(0, r * .7), 'p' if i else 'q')
        if stagione == 0:  # qualche foglia che cade
            for i in range(4):
                T.put(rnd.uniform(4, 40), rnd.uniform(36, 54), rnd.choice('765'), solo_vuoto=True)
    T.luna('Kkc')
    if stagione == 1:  # la neve sopra i rami e alla base
        N = [r[:] for r in T.G]
        for y in range(58):
            for x in range(44):
                if T.G[y][x] in 'Kkcj J' and T.get(x, y - 1) == '.':
                    N[y][x] = 'N'
                    if y > 0 and T.rnd.random() < .5:
                        N[y - 1][x] = 'n'
        T.G = N
        for x in range(10, 35):
            if T.get(x, 57) != '.' or abs(x - 22) < 9:
                T.put(x, 57, 'N' if x % 3 else 'n')
    T.contorno()
    return T


# ================================================================ pini
def pino(forma):
    T = Tela(30, 52, 2000 + forma)
    rnd = T.rnd
    secco = forma == 2
    for y in range(40, 52):  # tronco
        for x in range(13, 17):
            T.put(x, y, 'c' if x == 13 else 'k' if x < 15 else 'K')
    # palchi dall'alto: ognuno una gonna di rami che pende, sfrangiata sotto, con la luce sul dorso
    palchi = 6
    for i in range(palchi):
        y0 = 2 + i * 6.3
        h = 8 + i * .8
        wm = 3 + i * 2.3 + rnd.uniform(-.4, .4)
        morto = secco and i in (1, 3, 4)
        cx = 15 + rnd.uniform(-.6, .6)
        for yy in range(int(h) + 3):
            y = y0 + yy
            t = yy / h
            ww = wm * min(1, t) ** .7 + (1.2 if t > .8 else 0)
            for x in range(int(cx - ww), int(cx + ww) + 1):
                u = (x + .5 - (cx - ww)) / (2 * ww + .01)
                fr = (x * 7 + i * 3) % 4
                if yy > h - 2 + fr * .7:
                    continue  # le frange che pendono
                if morto:
                    if yy % 3 or (x * 5 + yy) % 4 == 0:
                        continue  # rami secchi a righe orizzontali
                    ch = 'w' if u < .4 else 'B'
                else:
                    ch = 'v' if u < .3 else 'u' if u < .6 else 't' if u < .85 else 's'
                    if yy < 2 and u < .55:
                        ch = 'x' if yy == 0 else 'v'  # la luce di luna sul dorso del palco
                    elif yy >= h - 2:
                        ch = 's' if u > .4 else 't'  # l'ombra sotto
                    elif yy > 2 and abs(u - .5) < .35 and (x * 7 + yy * 13 + i * 5) % 17 == 0:
                        ch = 's'  # qualche buco scuro tra gli aghi
                T.put(x, y, ch)
    T.put(15, 0, 'u'); T.put(15, 1, 'v'); T.put(16, 1, 'u')  # la cima
    T.luna('vutsBw', chiaro='x', medio='v')
    return T.contorno()


# ================================================================ cespugli
def cespuglio(bacche):
    T = Tela(20, 17, 3000 + bacche)
    rnd = T.rnd
    for (x, y, r) in ((6, 11, 4.5), (12, 9, 5), (15, 12, 3.8), (9, 7, 3.5), (4, 13, 3)):
        for yy in range(17):
            for xx in range(20):
                dx, dy = xx + .5 - x, yy + .5 - y
                if math.hypot(dx, dy * 1.15) <= r + math.sin(xx * 1.7 + yy) * .7:
                    luce = -dx * .5 - dy
                    ch = 'g' if luce > r * .5 else 'd' if luce < -r * .3 else 'e'
                    if ch == 'e' and (xx * 3 + yy) % 5 == 0:
                        ch = 'd'
                    T.put(xx, yy, ch)
    # i rami spinosi che escono
    for (x, y, dx, dy) in ((2, 8, -1, -1), (17, 6, 1, -1), (10, 3, 0, -1), (18, 13, 1, 0)):
        for i in range(3):
            T.put(x + dx * i, y + dy * i, 'k')
        T.put(x + dx * 2 - dy, y + dy * 2 + dx, 'k')
    if bacche:
        for i in range(9):
            x, y = int(rnd.uniform(3, 17)), int(rnd.uniform(6, 15))
            if T.get(x, y) in 'gde':
                T.put(x, y, '3'); T.put(x + 1, y, '2'); T.put(x, y + 1, '1')
    # il piede scuro nell'erba
    for x in range(3, 18):
        if T.get(x, 15) != '.':
            T.put(x, 16, 'a')
    T.luna('gdek', chiaro='h', medio='g')
    return T.contorno()


A = {}
for st in (0, 1, 2, 3):
    for f in range(5):
        A[f'albero{st}_{f}'] = albero(f, st)
for f in range(3):
    A[f'pino{f}'] = pino(f)
A['cespuglio'] = cespuglio(False)
A['cespuglioR'] = cespuglio(True)

QUI = os.path.dirname(__file__)
righe = ['# La natura. Generato da natura_abbozzo.py.', '@tavolozza', PAL]
for k, T in A.items():
    righe.append(f'@sprite {k} {T.w}x{T.h}')
    righe += T.righe()
open(os.path.join(QUI, 'natura.pxs'), 'w').write('\n'.join(righe) + '\n')
print('scritto natura.pxs')
