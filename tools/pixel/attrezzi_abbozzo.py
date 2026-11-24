#!/usr/bin/env python3
"""Gli attrezzi (32x32, manico dal basso a sinistra verso l'alto a destra, la testa in alto a destra: il gioco li
ruota così quando il personaggio li impugna). Ferro scuro con il filo lucido, legno vecchio con fasce di cuoio,
rame ammaccato. Scrive attrezzi.pxs; poi:
    python3 tools/pixel/studio.py tools/pixel/attrezzi.pxs --js js/attrezzi_mano.js --nome ATTREZZI_MANO
"""
import os

W = H = 32
PAL = """o #07050a
w #6a4a30
W #8a6a44
d #3e2a1c
h #a88a5e
k #4a2a1c
I #55545a
i #3a3a44
j #24242c
L #8aa0a8
S #c8ccd4
c #7a4a2a
C #a86a3a
u #5a3a22
R #b0261e
r #6a1418
l #e8dcc0
f #c8c0b0
g #d8aa48"""


def tela():
    return [['.'] * W for _ in range(H)]


def put(G, x, y, ch):
    x, y = int(round(x)), int(round(y))
    if 0 <= x < W and 0 <= y < H:
        G[y][x] = ch


def manico(G, x0, y0, x1, y1, fasce=()):
    """manico di legno a 2 pixel: luce in alto a sinistra, ombra sotto; fasce di cuoio dove dice fasce (0..1)"""
    n = int(max(abs(x1 - x0), abs(y1 - y0)))
    for i in range(n + 1):
        t = i / n
        x, y = x0 + (x1 - x0) * t, y0 + (y1 - y0) * t
        cuoio = any(abs(t - f) < .045 for f in fasce)
        put(G, x, y, 'k' if cuoio else 'W')
        put(G, x + 1, y, 'k' if cuoio else 'w')
        put(G, x, y - 1, 'k' if cuoio else 'h') if i % 5 == 0 and not cuoio else None
        put(G, x + 1, y + 1, 'd')


def poli(G, pts, ch):
    for y in range(H):
        for x in range(W):
            px, py, dentro = x + .5, y + .5, False
            for i in range(len(pts)):
                (ax, ay), (bx, by) = pts[i], pts[(i + 1) % len(pts)]
                if (ay > py) != (by > py) and px < ax + (py - ay) * (bx - ax) / (by - ay):
                    dentro = not dentro
            if dentro:
                G[y][x] = ch


def ferro(G, pts):
    """una testa di ferro: corpo scuro, bordo in alto lucido di luna"""
    poli(G, pts, 'I')
    for y in range(1, H):
        for x in range(W):
            if G[y][x] == 'I' and G[y - 1][x] == '.':
                G[y][x] = 'L'
            elif G[y][x] == 'I' and (y + 1 >= H or G[y + 1][x] == '.'):
                G[y][x] = 'i'


def contorno(G):
    N = [r[:] for r in G]
    for y in range(H):
        for x in range(W):
            if G[y][x] == '.' and any(0 <= y + b < H and 0 <= x + a < W and G[y + b][x + a] not in '.o'
                                      for a, b in ((1, 0), (-1, 0), (0, 1), (0, -1))):
                N[y][x] = 'o'
    return N


A = {}
# zappa: lama di ferro piegata, chiodata al manico
G = tela(); manico(G, 3, 29, 22, 9, fasce=(.75,))
ferro(G, [(19, 7), (22, 5), (24, 6), (28, 13), (28, 16), (25, 15), (23, 10)]); put(G, 21, 7, 'j'); put(G, 26, 15, 'S'); put(G, 27, 15, 'S')
A['hoe'] = G
# accetta: lama a barba, manico con l'impugnatura di cuoio
G = tela(); manico(G, 4, 29, 21, 8, fasce=(.1, .2, .3))
ferro(G, [(18, 3), (24, 2), (28, 6), (28, 13), (24, 11), (21, 9)]); put(G, 27, 7, 'S'); put(G, 27, 8, 'S'); put(G, 27, 9, 'S')
put(G, 20, 7, 'j'); A['accetta'] = G
# piccone: testa ricurva a due punte
G = tela(); manico(G, 4, 29, 20, 10, fasce=(.75,))
for i in range(12):
    t = i / 11
    put(G, 12 + t * 16, 6 - 3.2 * (1 - (2 * t - 1) ** 2) + 2, 'I'); put(G, 12 + t * 16, 7 - 3.2 * (1 - (2 * t - 1) ** 2) + 2, 'i')
put(G, 12, 7, 'S'); put(G, 28, 7, 'S'); put(G, 20, 6, 'j'); put(G, 21, 6, 'j'); A['piccone'] = G
# falce da mietitore: asta lunga, lama lunga e ricurva verso sinistra, il filo lucido
G = tela(); manico(G, 6, 30, 26, 3, fasce=(.55,))
for i in range(16):
    t = i / 15
    x, y = 26 - t * 22, 3 + 6 * t * t
    put(G, x, y, 'I'); put(G, x, y + 1, 'L' if i % 2 else 'S'); put(G, x, y - 1, 'i')
put(G, 25, 2, 'j'); put(G, 26, 2, 'j'); A['falce'] = G
# pala: lama a cuore di ferro consumato, manico con la maniglia a T
G = tela(); manico(G, 6, 27, 19, 13)
ferro(G, [(18, 12), (21, 6), (26, 3), (29, 5), (27, 11), (21, 15)]); put(G, 22, 9, 'j'); put(G, 24, 10, 'u'); put(G, 26, 6, 'u')
for k in (-2, -1, 0, 1, 2):
    put(G, 5 + k, 28 - k, 'w')
put(G, 4, 29, 'k'); put(G, 3, 30, 'k'); A['pala'] = G
# annaffiatoio: rame ammaccato e rivettato, beccuccio, manico
G = tela()
poli(G, [(4, 12), (19, 12), (20, 27), (3, 27)], 'C')
for y in range(12, 28):
    for x in range(3, 21):
        if G[y][x] == 'C':
            G[y][x] = 'C' if x < 9 else 'c' if x > 15 else 'C'
for x in range(4, 20):
    G[12][x] = 'h'; G[27][x] = 'u'
for x, y in ((6, 15), (6, 24), (17, 15), (17, 24), (12, 15)):
    put(G, x, y, 'g')
put(G, 10, 19, 'u'); put(G, 11, 20, 'u'); put(G, 11, 19, 'c')  # un'ammaccatura
for i in range(10):
    put(G, 19 + i * .9, 18 - i * .9, 'c'); put(G, 19 + i * .9, 19 - i * .9, 'u')
for x, y in ((28, 8), (29, 8), (29, 9), (28, 7), (30, 9)):
    put(G, x, y, 'I')
for i in range(12):
    put(G, 6 + i, 11 - (4 * (1 - ((i - 5.5) / 6) ** 2)), 'u')
A['can'] = G
# canna da pesca: canna sottile, mulinello, lenza e galleggiante rosso
G = tela()
for i in range(26):
    x, y = 3 + i * .95, 29 - i * 1.0
    put(G, x, y, 'W' if i % 4 else 'k'); put(G, x + 1, y, 'w') if i < 12 else None
for y in range(5, 22):
    put(G, 28, y, 'f')
for (x, y, ch) in ((27, 22, 'R'), (28, 22, 'R'), (29, 22, 'R'), (27, 23, 'l'), (28, 23, 'l'), (29, 23, 'l'),
                   (27, 24, 'R'), (28, 24, 'r'), (29, 24, 'r'), (28, 21, 'r')):
    put(G, x, y, ch)
for (x, y, ch) in ((6, 22, 'I'), (7, 22, 'I'), (6, 23, 'i'), (7, 23, 'L'), (5, 22, 'i')):
    put(G, x, y, ch)
A['canna'] = G

QUI = os.path.dirname(__file__)
righe = ['# Gli attrezzi. Generato da attrezzi_abbozzo.py.', '@tavolozza', PAL]
for k, G in A.items():
    righe.append(f'@sprite {k} {W}x{H}')
    righe += [''.join(r) for r in contorno(G)]
open(os.path.join(QUI, 'attrezzi.pxs'), 'w').write('\n'.join(righe) + '\n')
print('scritto attrezzi.pxs')
