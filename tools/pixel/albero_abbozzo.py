#!/usr/bin/env python3
"""L'Albero dei Morti (112x104): tronco immenso e contorto, rami che si assottigliano in dita uncinate,
radici rosse come ferite, le teste dei Contati mezze sepolte (una, quella del nonno, ha gli occhi aperti).
Scrive albero.pxs; poi:  python3 tools/pixel/studio.py tools/pixel/albero.pxs --js js/albero_mano.js --nome ALBERO_MANO
"""
import os, random, math

W, H = 112, 104
PAL = """o #07050a
K #1c1418
k #2a1e24
c #3a2a30
J #5a6a74
j #3a4048
X #0e090c
R #7c1512
r #4a0a0c
D #b0261e
d #e05a40
P #8e8c80
p #6a685e
q #44423c
e #1a1214
l #f0ece0
h #241c18"""

G = [['.'] * W for _ in range(H)]
rnd = random.Random(777)


def put(x, y, ch, solo_vuoto=False):
    x, y = int(round(x)), int(round(y))
    if 0 <= x < W and 0 <= y < H and (not solo_vuoto or G[y][x] == '.'):
        G[y][x] = ch


def disco(cx, cy, r, ch, solo_vuoto=False):
    for y in range(int(cy - r - 1), int(cy + r + 2)):
        for x in range(int(cx - r - 1), int(cx + r + 2)):
            if (x + .5 - cx) ** 2 + (y + .5 - cy) ** 2 <= r * r:
                put(x, y, ch, solo_vuoto)


# ---- rami: partono grossi dal tronco, si torcono e si dividono fino a dita uncinate (sempre verso l'alto)
def ramo(x, y, ang, lung, spess, liv):
    for i in range(int(lung)):
        ang += (rnd.random() - .5) * .55
        ang = max(-math.pi + .25, min(-.25, ang))
        x += math.cos(ang)
        y += math.sin(ang)
        t = spess * (1 - i / lung * .45)
        disco(x, y, max(.6, t / 2), 'K')
    if liv > 0:
        for k in range(2 if liv > 1 else 3):
            ramo(x, y, ang + (k - .5) * (.9 + rnd.random() * .4), lung * (.6 + rnd.random() * .15), spess * .6, liv - 1)
    else:  # dita uncinate in punta
        for k in (-1, 1):
            xx, yy, a = x, y, ang + k * .7
            for i in range(4):
                a += k * .35
                xx += math.cos(a)
                yy += math.sin(a)
                put(xx, yy, 'K')


for a, l, s in [(-math.pi / 2 - 1.05, 26, 9), (-math.pi / 2 + 1.0, 26, 9), (-math.pi / 2 - .3, 22, 8), (-math.pi / 2 + .35, 20, 7)]:
    ramo(56, 50, a, l, s, 3)

# ---- il tronco: larghissimo alla base, contorto, con i solchi
for y in range(38, 100):
    t = (y - 38) / 62
    hw = 9 + t * t * 18 + math.sin(y * .25) * 1.5
    cx = 56 + math.sin(y * .12) * 2.5
    for x in range(int(cx - hw), int(cx + hw) + 1):
        u = (x - (cx - hw)) / (2 * hw)
        ch = 'c' if u < .18 else 'k' if u < .55 else 'K' if u < .88 else 'X'
        if (x * 3 + y // 5) % 7 == 0:  # solchi
            ch = 'X'
        put(x, y, ch)
# la cavità: una bocca spalancata nel legno
for y in range(66, 82):
    for x in range(50, 63):
        if ((x - 56) / 6) ** 2 + ((y - 73) / 8) ** 2 <= 1:
            put(x, y, 'X')
for x in range(51, 62):
    put(x, 65 + abs(x - 56) // 3, 'c')

# ---- luce di luna sui bordi alti di rami e tronco
N = [r[:] for r in G]
for y in range(1, H):
    for x in range(W):
        if G[y][x] in 'Kkc' and G[y - 1][x] == '.':
            N[y][x] = 'J'
            if y + 1 < H and G[y + 1][x] in 'Kk':
                N[y + 1][x] = 'j'
G = N

# ---- le radici rosse, come ferite: dal piede del tronco si allargano sul terreno
for i in range(14):
    sx = 40 + rnd.random() * 32
    ex = sx + (rnd.random() - .5) * 110
    ex = max(1, min(W - 2, ex))
    n = 60
    for k in range(n + 1):
        t = k / n
        x = sx + (ex - sx) * t
        y = 90 + math.sin(t * math.pi) * (5 + rnd.random() * 2) + t * 6
        r = 1.5 * (1 - t) + .5
        disco(x, y, r, 'R')
        if k % 3 == 0:
            put(x, y - r + .5, 'D')  # il lucido della ferita
        put(x, y + r, 'r')

# ---- le teste dei Contati: livide, piccole, sprofondate per metà, gli occhi chiusi, la bocca che sussurra
def testa(cx, cy, nonno=False, capelli=None, inclina=0):
    for y in range(cy - 4, cy + 2):  # la metà sotto è nella terra
        for x in range(cx - 3, cx + 4):
            if ((x - cx - inclina * (cy - y) * .2) / 3.3) ** 2 + ((y - cy) / 4) ** 2 <= 1:
                put(x, y, 'P' if x < cx + 1 else 'p')
    if capelli:
        for x in range(cx - 3, cx + 4):
            put(x, cy - 4, capelli)
    for dx in (-1, 2):
        if nonno:
            put(cx + dx, cy - 2, 'l')
            put(cx + dx, cy - 1, 'e')
        else:
            put(cx + dx, cy - 1, 'e')
    put(cx, cy + 1, 'e')  # la bocca socchiusa, appena sopra la terra


teste = [(8, 97, None, 0), (19, 99, 'h', 1), (29, 95, None, -1), (41, 100, 'h', 0), (70, 100, None, 1),
         (81, 96, 'h', 0), (93, 99, None, -1), (104, 96, 'h', 1)]
for x, y, cap, inc in teste:
    testa(x, y, capelli=cap, inclina=inc)
testa(56, 100, nonno=True, capelli='J')  # il nonno, i capelli bianchi, gli occhi aperti
# la terra smossa attorno e le radici che passano sopra le teste
for x, y, *_ in teste + [(56, 100)]:
    for k in range(-4, 5):
        put(x + k, y + 2, 'r')
for x0, y0 in ((19, 98), (41, 99), (81, 95), (104, 95), (30, 94)):
    for k in range(-4, 5):
        put(x0 + k, y0 - abs(k) // 2, 'R')
        put(x0 + k, y0 - abs(k) // 2 + 1, 'r')

# ---- contorno
N = [r[:] for r in G]
for y in range(H):
    for x in range(W):
        if G[y][x] != '.':
            continue
        if any(0 <= y + dy < H and 0 <= x + dx < W and G[y + dy][x + dx] not in '.o'
               for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1))):
            N[y][x] = 'o'
G = N
QUI = os.path.dirname(__file__)
open(os.path.join(QUI, 'albero.pxs'), 'w').write('\n'.join(
    ["# L'Albero dei Morti. Generato da albero_abbozzo.py.", '@tavolozza', PAL, f'@sprite albero {W}x{H}'] +
    [''.join(r) for r in G]) + '\n')
print('scritto albero.pxs')
