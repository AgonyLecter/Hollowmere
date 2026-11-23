#!/usr/bin/env python3
"""Abbozzo del Cavaliere senza testa (44x40, due fotogrammi di galoppo): masse principali come forme,
da rifinire a mano in cavaliere.pxs. Scrive cavaliere.pxs SOLO se non esiste (poi si lavora a mano lì)."""
import os, math
W, H = 44, 40
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

def tela():
    return [['.'] * W for _ in range(H)]

def ell(G, cx, cy, rx, ry, ch):
    for y in range(H):
        for x in range(W):
            if ((x + .5 - cx) / rx) ** 2 + ((y + .5 - cy) / ry) ** 2 <= 1:
                G[y][x] = ch

def linea(G, x0, y0, x1, y1, r, ch):
    n = int(max(abs(x1 - x0), abs(y1 - y0)) * 2) + 1
    for i in range(n + 1):
        t = i / n
        cx, cy = x0 + (x1 - x0) * t, y0 + (y1 - y0) * t
        rr = r if isinstance(r, (int, float)) else r[0] + (r[1] - r[0]) * t
        for y in range(H):
            for x in range(W):
                if (x + .5 - cx) ** 2 + (y + .5 - cy) ** 2 <= rr * rr:
                    G[y][x] = ch

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

def contorno(G):
    N = [r[:] for r in G]
    for y in range(H):
        for x in range(W):
            if G[y][x] != '.':
                continue
            if any(0 <= y + dy < H and 0 <= x + dx < W and G[y + dy][x + dx] not in '.o'
                   for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1))):
                N[y][x] = 'o'
    return N

def luce(G):
    """luce di luna sui bordi in alto: stacca le sagome nere l'una dall'altra"""
    RIM = {'K': 'J', 'k': 'J', 'U': 'u', 'M': 'D'}
    N = [r[:] for r in G]
    for y in range(1, H):
        for x in range(W):
            c = G[y][x]
            if c in RIM and G[y - 1][x] in '.o':
                N[y][x] = RIM[c]
            elif c in 'Kk' and G[y - 1][x] in 'JUuMmD' and G[y - 1][x] != c:
                N[y][x] = 'j'
    return N

def fotogramma(f):
    G = tela()
    # il mantello rosso sangue che sventola dietro, sfilacciato, con le pieghe scure
    o = [0, 1, 0, -1][f]
    poli(G, [(21, 8), (15, 4 - o), (9, 3 + o), (3, 5 - o), (6, 7), (1, 10 + o), (6, 12), (2, 15 - o), (8, 16), (5, 20 + o), (12, 18), (10, 22 - o), (17, 18), (20, 15)], 'M')
    for i in range(4):
        linea(G, 18 - i, 9 + i, 6 - i, 7 + i * 3, .5, 'm')
    # coda al vento
    onda = [-1, 0, 1, 0][f]
    linea(G, 12, 20, 5, 23 + onda, (2, 1), 'K')
    linea(G, 6, 23 + onda, 1, 28 + [0, 1, 2, 1][f], (1.2, .6), 'K')
    # le 4 fasi del galoppo: allungato, raccolto davanti, tutto raccolto, spinta da dietro
    gambe = [
        [((32, 26), (37, 31), (41, 36)), ((30, 27), (33, 32), (34, 37)), ((15, 26), (10, 31), (5, 34)), ((17, 27), (15, 32), (13, 37))],
        [((32, 26), (36, 29), (36, 34)), ((30, 27), (31, 32), (32, 37)), ((15, 26), (13, 31), (10, 36)), ((17, 27), (17, 32), (18, 37))],
        [((32, 26), (35, 30), (33, 35)), ((30, 27), (28, 32), (30, 37)), ((15, 26), (18, 31), (21, 35)), ((17, 27), (13, 32), (11, 37))],
        [((32, 26), (34, 31), (37, 36)), ((30, 27), (29, 32), (27, 36)), ((15, 26), (14, 31), (16, 36)), ((17, 27), (11, 31), (7, 35))],
    ][f]
    for i, (a, b, c) in enumerate(gambe):
        ch = 'k' if i % 2 else 'K'
        linea(G, a[0], a[1], b[0], b[1], (2.3, 1.4), ch)
        linea(G, b[0], b[1], c[0], c[1], (1.3, 1.0), ch)
        ell(G, c[0], c[1] + .5, 1.6, 1, 'B')
    # corpo, petto, collo arcuato, testa tesa in avanti con la bocca aperta
    ell(G, 23, 22, 10.5, 5.6, 'K')
    ell(G, 31.5, 21, 4.5, 5.5, 'K')
    # collo teso in avanti e testa bassa da carica, la bocca aperta
    poli(G, [(30, 18), (34, 13), (37, 11), (40, 12), (38, 19), (35, 22)], 'K')
    poli(G, [(37, 11), (42, 13), (43, 16), (43, 18), (41, 17), (40, 19), (38, 17)], 'K')
    # criniera selvaggia, all'indietro
    for i in range(6):
        linea(G, 36 - i * .7, 12 + i * 1.3, 30 - i * 1.1, 10 + i * 1.5 + (i % 2), .8, 'k')
    # orecchie appuntite piegate indietro
    G[10][37] = 'K'; G[9][36] = 'K'; G[10][36] = 'K'; G[8][35] = 'K'
    # sella, gualdrappa rossa
    poli(G, [(18, 16), (27, 16), (28, 20), (24, 22), (19, 21)], 'M')
    # il cavaliere in nero: gamba nella staffa, stivale, busto, braccio teso con la spada alzata
    linea(G, 23, 17, 26, 24, 1.6, 'U')
    ell(G, 26.5, 25.5, 1.8, 1.5, 'B')
    poli(G, [(19, 8), (25, 8), (26, 17), (19, 17)], 'U')
    # il braccio alzato
    linea(G, 23, 10, 24, 4, 1.4, 'U')
    # colletto alto, spalle, e dove dovrebbe esserci la testa: il moncherino
    poli(G, [(18, 9), (20, 6), (25, 6), (26, 9)], 'U')
    G[6][21] = 'E'; G[6][22] = 'r'; G[6][23] = 'E'; G[5][22] = 'r'
    G = luce(G)
    # ritocco a mano del cavaliere (righe 5-16, colonne 16-27): busto, colletto col moncherino, cintura
    RITOCCO = {5: "Doo.oBrrBUuo", 6: "DDoBEreEBUUo", 7: "MMuuUUUUUUUo", 8: "mmuUUuUUUUUu", 9: "MMMuUUuUUUUo",
               10: "MMMoUUuUUUUo", 11: "MMMoUUuUUUUo", 12: "MMMoUUuUUUoo", 13: "MMMoMDMMDMoK", 14: "MMMoUUUUUUoK",
               15: "MMMoUUUUUUUo", 16: "MMMMUUUUUUUM"}
    for y, riga in RITOCCO.items():
        for i, ch in enumerate(riga):
            if ch != '.':
                G[y][16 + i] = ch
    # contorno scuro tra il cavaliere e il cavallo: le due sagome nere restano leggibili
    N = [r[:] for r in G]
    for y in range(H):
        for x in range(W):
            if G[y][x] in 'KkJj' and any(0 <= y + dy < H and 0 <= x + dx < W and G[y + dy][x + dx] in 'Uu'
                                         for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1))):
                N[y][x] = 'o'
    G = N
    # la spada: impugnata in alto, la lama indietro sopra il mantello, insanguinata, con le gocce
    G[4][24] = 'B'; G[3][25] = 's'; G[5][23] = 's'
    for i in range(12):
        x, y = 23 - i * .85, 3 - i * .28
        X, Y = round(x), round(y)
        if 0 <= Y < H and 0 <= X < W:
            G[Y][X] = 'S' if i < 5 or i % 3 else 'r'
            if Y + 1 < H and G[Y + 1][X] in '.oMmD':
                G[Y + 1][X] = 's'
    for x, y in ((18, 4), (15, 5), (13, 6 + f % 2)):
        G[y][x] = 'r'
    # occhio di brace, denti scoperti, fumo dalle narici
    G[14][39] = 'R'; G[14][40] = 'e'
    G[17][41] = 'l'; G[17][42] = 'l'; G[16][43] = 'r'
    for dx, dy in [[(-1, -1), (0, -2), (-2, -3)], [(0, -1), (-1, -3)], [(-1, -2)], [(0, -1), (-1, -2), (-2, -4)]][f]:
        G[15 + dy][43 + dx] = 'w'
    return contorno(G)

QUI = os.path.dirname(__file__)
out = os.path.join(QUI, 'cavaliere.pxs')
if os.path.exists(out) and '--rifai' not in os.sys.argv:
    print('cavaliere.pxs esiste già: si rifinisce a mano lì (--rifai per ripartire dall\'abbozzo)')
else:
    righe = ['# Il Cavaliere senza testa, 44x40, due fotogrammi di galoppo. Abbozzo da cavaliere_abbozzo.py,', '# poi rifinito a mano qui.', '@tavolozza', PAL]
    for f in range(4):
        righe.append(f'@sprite galoppo{f} {W}x{H}')
        righe += [''.join(r) for r in fotogramma(f)]
    open(out, 'w').write('\n'.join(righe) + '\n')
    print('scritto', out)
