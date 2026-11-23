#!/usr/bin/env python3
"""L'illustrazione dello spavento: il Cavaliere senza testa che s'impenna verso il giocatore (120x100).
Masse come forme, luce di luna sui bordi, poi i dettagli pixel per pixel. Scrive spavento.pxs.

    python3 tools/pixel/spavento_abbozzo.py && python3 tools/pixel/studio.py tools/pixel/spavento.pxs \
        --js js/spavento_mano.js --nome SPAVENTO_MANO
"""
import os

W, H = 120, 100
PAL = """o #08060a
K #221a20
k #30262e
J #5a7480
j #3e4a52
U #141016
u #2e2a36
B #0e0a0c
M #7a0a12
m #4a060c
D #b41a22
R #ff4a1a
r #8a0a10
w #7a868e
E #c8301a
e #ff9a3a
S #c8ccd4
s #7a808a
l #e8e0d0"""

G = [['.'] * W for _ in range(H)]


def ell(cx, cy, rx, ry, ch):
    for y in range(max(0, int(cy - ry - 1)), min(H, int(cy + ry + 2))):
        for x in range(max(0, int(cx - rx - 1)), min(W, int(cx + rx + 2))):
            if ((x + .5 - cx) / rx) ** 2 + ((y + .5 - cy) / ry) ** 2 <= 1:
                G[y][x] = ch


def linea(x0, y0, x1, y1, r, ch):
    n = int(max(abs(x1 - x0), abs(y1 - y0)) * 2) + 1
    for i in range(n + 1):
        t = i / n
        cx, cy = x0 + (x1 - x0) * t, y0 + (y1 - y0) * t
        rr = r if isinstance(r, (int, float)) else r[0] + (r[1] - r[0]) * t
        for y in range(max(0, int(cy - rr - 1)), min(H, int(cy + rr + 2))):
            for x in range(max(0, int(cx - rr - 1)), min(W, int(cx + rr + 2))):
                if (x + .5 - cx) ** 2 + (y + .5 - cy) ** 2 <= rr * rr:
                    G[y][x] = ch


def poli(pts, ch):
    for y in range(H):
        for x in range(W):
            px, py, dentro = x + .5, y + .5, False
            for i in range(len(pts)):
                (ax, ay), (bx, by) = pts[i], pts[(i + 1) % len(pts)]
                if (ay > py) != (by > py) and px < ax + (py - ay) * (bx - ax) / (by - ay):
                    dentro = not dentro
            if dentro:
                G[y][x] = ch


def specchio(pts):
    return [(W - x, y) for x, y in pts]


# ---- il mantello aperto come due ali, sfilacciato in basso
ala = [(60, 22), (44, 14), (26, 10), (10, 14), (2, 24), (8, 30), (0, 40), (7, 46), (2, 58), (12, 60), (6, 74),
       (18, 70), (16, 84), (28, 76), (30, 90), (40, 78), (52, 70)]
poli(ala, 'M')
poli(specchio(ala), 'M')
for i in range(6):  # pieghe
    for lato in (1, -1):
        x0 = 60 - lato * 6
        linea(x0, 24, 60 - lato * (14 + i * 8), 30 + i * 9, .7, 'm')
# ---- il cavaliere: busto nero, spalle larghe, colletto alto vuoto, braccio alzato con la spada
poli([(48, 22), (72, 22), (70, 48), (50, 48)], 'U')
ell(46, 24, 6, 5, 'U')
ell(74, 24, 6, 5, 'U')
poli([(52, 22), (55, 14), (65, 14), (68, 22)], 'U')  # colletto alto
ell(60, 16, 4.5, 2.2, 'B')  # dentro il colletto: il vuoto
linea(76, 22, 88, 8, 3, 'U')  # braccio alzato
linea(44, 26, 40, 40, 2.6, 'U')  # braccio che tiene le redini
# ---- il cavallo che s'impenna: petto, zampe alzate, criniera ai lati, testa di fronte
ell(60, 92, 24, 12, 'K')
# zampe anteriori alzate: dal petto al ginocchio (all'altezza della testa), poi lo stinco che penzola
for lato in (1, -1):
    linea(60 - lato * 12, 84, 60 - lato * 27, 58, (5.5, 4), 'K')
    linea(60 - lato * 27, 58, 60 - lato * 31, 70, (3.6, 2.8), 'k')
    ell(60 - lato * 31.5, 72.5, 3.6, 2.6, 'B')
# criniera: ciocche che scendono ai lati del collo, fuori dalla testa
for i in range(8):
    for lato in (1, -1):
        x0 = 60 - lato * (11 + i * .3)
        linea(x0, 50 + i * 3, x0 - lato * (6 + i), 58 + i * 3.4, (1.6, .8), 'k')
# collo e testa: larga sulla fronte, stretta sul muso
poli([(48, 84), (49, 60), (71, 60), (72, 84)], 'K')
poli([(49, 46), (71, 46), (68, 62), (52, 62)], 'K')
poli([(52, 60), (68, 60), (66, 78), (54, 78)], 'K')
ell(60, 78, 7.5, 4.5, 'K')
# orecchie appuntite, tese in avanti
poli([(50, 47), (47, 36), (54, 44)], 'K')
poli([(70, 47), (73, 36), (66, 44)], 'K')
# le guance in ombra, la cresta del naso in luce
for y in range(52, 76):
    G[y][60] = 'j' if y % 2 else 'k'
    G[y][59] = 'k'
# ---- luce di luna sui bordi alti
RIM = {'K': 'J', 'k': 'J', 'U': 'u', 'M': 'D'}
N = [r[:] for r in G]
for y in range(1, H):
    for x in range(W):
        c = G[y][x]
        if c in RIM and G[y - 1][x] == '.':
            N[y][x] = RIM[c]
            if y + 1 < H and G[y + 1][x] == c and c in 'Kk':
                N[y + 1][x] = 'j'
G = N

# ---- dettagli pixel per pixel
# il moncherino che arde dentro il colletto
for x, y, c in [(57, 16, 'E'), (58, 16, 'r'), (59, 16, 'e'), (60, 16, 'e'), (61, 16, 'r'), (62, 16, 'E'),
                (58, 15, 'E'), (59, 15, 'e'), (60, 15, 'E'), (61, 15, 'E'), (59, 17, 'r'), (60, 17, 'r')]:
    G[y][x] = c
for x, y in ((56, 18), (64, 19), (63, 21)):  # sangue che cola sul colletto
    G[y][x] = 'r'
# la cintura rossa e il fermaglio
for x in range(50, 71):
    G[40][x] = 'M'
G[40][59] = G[40][60] = 'S'
# la spada: impugnatura nel pugno, lama lunga verso l'alto a destra, insanguinata
ell(89, 7, 2.4, 2.4, 'B')
for i in range(40):
    x, y = 90 + i * .7, 6 - i * .16
    X, Y = round(x), round(y)
    if 0 <= X < W and 0 <= Y < H:
        G[Y][X] = 'S'
        if Y + 1 < H:
            G[Y + 1][X] = 's' if i % 5 else 'r'
for x, y in ((96, 7), (100, 7), (103, 6), (99, 9), (99, 10), (104, 8), (108, 6)):
    G[y][x] = 'r'
# gli occhi di brace, le narici che fumano, i denti
for cx in (54, 66):
    ell(cx + .5, 53, 3.4, 2.6, 'B')
    for dx, dy, c in [(0, 0, 'R'), (1, 0, 'e'), (0, 1, 'r'), (1, 1, 'R'), (-1, 0, 'r'), (2, 0, 'r')]:
        G[52 + dy][cx + dx] = c
for cx in (56, 64):
    ell(cx, 73, 1.6, 1.2, 'o')
    G[73][cx] = 'r'
ell(60, 79, 6, 2.6, 'o')  # bocca spalancata
for x in range(55, 66, 2):
    G[78][x] = 'l'
    G[80][x + 1] = 'l'
for x, y in ((50, 74), (48, 72), (46, 71), (70, 74), (72, 72), (74, 71), (47, 69), (73, 69)):
    G[y][x] = 'w'

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
righe = ['# Lo spavento: il Cavaliere senza testa che s\'impenna. Generato da spavento_abbozzo.py.', '@tavolozza', PAL,
         f'@sprite spavento {W}x{H}'] + [''.join(r) for r in G]
open(os.path.join(QUI, 'spavento.pxs'), 'w').write('\n'.join(righe) + '\n')
print('scritto spavento.pxs')
