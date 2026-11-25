#!/usr/bin/env python3
"""L'interno dell'Emporio Crane, alla grana dell'Albero dei Morti:
  · il bancone (64x26): legno scuro coi cassetti e le maniglie d'ottone, il piano chiaro consumato, la bilancia
    d'ottone coi piatti, il campanello, il registro aperto e il barattolo degli scudi;
  · lo scaffale (32x36): due montanti, quattro assi; la merce (pacchetti di semi) la disegna il gioco sulle assi;
  · il tavolo delle novità (48x20) con le cassette di legno;
  · i sacchi di concime (24x20), il cesto del pane (18x12), il mazzo di erbe secche appeso (14x12),
    la lavagnetta coi prezzi (16x14).
Scrive emporio.pxs; poi:
    python3 tools/pixel/studio.py tools/pixel/emporio.pxs --js js/emporio_mano.js --nome EMPORIO_MANO
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
W #8a6a44
h #a88a5e
H #c8a878
i #24242c
I #3a3a44
L #55545a
m #74726e
M #9a968a
Q #c0baa8
q #e8dcc0
d #1e2a18
e #2e3a22
f #44522c
g #606a36
2 #7c1512
3 #b0261e
5 #8a3418
6 #b05a22
7 #c8862e
8 #d8aa48
9 #ffd070
p #4a2a48
P #74447a
t #1e2a36
T #2e4450
J #8aa0a8
j #5a6a74"""

A = {}


def rett(T, x0, y0, x1, y1, ch):
    for y in range(int(y0), int(y1)):
        for x in range(int(x0), int(x1)):
            T.put(x, y, ch)


def chiudi(T, scuri='kKcBbwIiLm'):
    T.luna(scuri, chiaro='J', medio='j')
    return T.contorno()


# ---------------------------------------------------------------- il bancone 64x26
T = Tela(64, 26, 1)
# il piano: legno chiaro consumato al centro
rett(T, 1, 8, 63, 11, 'W')
for x in range(1, 63):
    T.put(x, 8, 'H' if 20 < x < 44 else 'h')
    T.put(x, 10, 'w')
# il fronte coi cassetti
rett(T, 2, 11, 62, 25, 'B')
for x in range(2, 62):
    T.put(x, 11, 'b'); T.put(x, 24, 'b')
for i in range(5):
    x0 = 4 + i * 12
    rett(T, x0, 13, x0 + 10, 18, 'w')
    for x in range(x0, x0 + 10):
        T.put(x, 13, 'W'); T.put(x, 17, 'b')
    T.put(x0 + 4, 15, '7'); T.put(x0 + 5, 15, '8')  # la maniglia d'ottone
    rett(T, x0, 19, x0 + 10, 23, 'w')
    for x in range(x0, x0 + 10):
        T.put(x, 22, 'b')
    T.put(x0 + 5, 20, 'K')
# la bilancia d'ottone: il palo, il giogo, due piatti
rett(T, 12, 2, 13, 8, '7')
rett(T, 6, 2, 20, 3, '8')
for cx in (7, 18):
    T.put(cx, 3, '7'); T.put(cx, 4, '7')
    rett(T, cx - 3, 5, cx + 4, 6, '8'); rett(T, cx - 2, 6, cx + 3, 7, '6')
T.put(12, 1, '9')
rett(T, 10, 7, 16, 8, '6')
# il campanello
T.ell(30, 6, 2.2, 1.6, '987'); T.put(30, 4, 'K'); T.put(30, 7, '6')
# il registro aperto con la piuma
rett(T, 36, 5, 47, 8, 'q')
for x in range(36, 47):
    T.put(x, 7, 'Q')
T.put(41, 5, 'M'); T.put(41, 6, 'M'); T.put(41, 7, 'M')
for x, y in ((38, 6), (39, 6), (43, 6), (44, 6)):
    T.put(x, y, 'm')
T.put(46, 2, 'q'); T.put(45, 3, 'q'); T.put(44, 4, 'Q')
# il barattolo degli scudi
rett(T, 52, 3, 58, 8, 'j')
rett(T, 53, 2, 57, 3, 'I')
for x, y in ((53, 6), (55, 5), (56, 7), (54, 7)):
    T.put(x, y, '8')
T.put(53, 4, 'J')
A['bancone'] = chiudi(T, scuri='bBwWkK')

# ---------------------------------------------------------------- lo scaffale 32x36
T = Tela(32, 36, 2)
rett(T, 1, 1, 31, 35, 'K')  # il fondo scuro
for x in range(2, 30):
    for y in range(2, 34):
        T.put(x, y, 'c' if (x + y // 3) % 7 else 'k')
for x0 in (1, 29):  # i montanti
    rett(T, x0, 0, x0 + 2, 36, 'B')
    for y in range(0, 36):
        T.put(x0, y, 'w')
for y in (9, 17, 25, 33):  # le assi
    rett(T, 1, y, 31, y + 2, 'W')
    for x in range(1, 31):
        T.put(x, y, 'h'); T.put(x, y + 1, 'w')
rett(T, 0, 0, 32, 2, 'B')
for x in range(0, 32):
    T.put(x, 0, 'W')
A['scaffale'] = chiudi(T, scuri='BbwWcKk')

# ---------------------------------------------------------------- il tavolo delle novità 48x20
T = Tela(48, 20, 3)
rett(T, 1, 6, 47, 9, 'W')
for x in range(1, 47):
    T.put(x, 6, 'h'); T.put(x, 8, 'w')
for x0 in (3, 43):
    rett(T, x0, 9, x0 + 2, 20, 'B')
    for y in range(9, 20):
        T.put(x0, y, 'w')
rett(T, 3, 13, 45, 14, 'b')
# tre cassette di legno, il gioco ci disegna dentro i semi
for x0 in (4, 18, 32):
    rett(T, x0, 1, x0 + 12, 7, 'B')
    rett(T, x0 + 1, 2, x0 + 11, 5, 'b')
    for x in range(x0, x0 + 12):
        T.put(x, 1, 'W'); T.put(x, 6, 'w')
A['tavolo'] = chiudi(T, scuri='BbwW')

# ---------------------------------------------------------------- i sacchi di concime 24x20
T = Tela(24, 20, 4)
for cx, cy, s in ((7, 12, 1), (16, 13, 1), (11, 7, .85)):
    T.parte(lambda x, y, cx=cx, cy=cy, s=s: ((x - cx) / (6 * s)) ** 2 + ((y - cy) / (6.5 * s)) ** 2 <= 1,
            'hWw', trama=lambda x, y, ch: 'W' if (x + y) % 4 == 0 and ch == 'h' else None)
    T.put(cx - 1, cy - 6 * s, 'b'); T.put(cx, cy - 6 * s, 'b'); T.put(cx + 1, cy - 6 * s, 'b')  # il collo legato
    T.put(cx, cy, '5'); T.put(cx - 1, cy + 1, '5'); T.put(cx + 1, cy + 1, '5')  # il segno rosso del concime
for x in range(2, 22, 3):
    T.put(x, 19, 'f')
A['sacchi'] = chiudi(T, scuri='wWb')

# ---------------------------------------------------------------- il cesto del pane 18x12
T = Tela(18, 12, 5)
T.parte(lambda x, y: ((x - 9) / 8) ** 2 + ((y - 9) / 3) ** 2 <= 1 and y > 6, 'WwB',
        trama=lambda x, y, ch: 'B' if (x + y) % 3 == 0 else None)
for cx, cy in ((5, 5), (9, 4), (13, 5)):
    T.ell(cx, cy, 2.8, 2, '876')
    T.put(cx - 1, cy - 1, '9'); T.put(cx, cy, '5')
A['cesto'] = chiudi(T, scuri='WwB876')

# ---------------------------------------------------------------- le erbe secche appese 14x12
T = Tela(14, 12, 6)
rett(T, 0, 0, 14, 1, 'B')
for i, x in enumerate((2, 5, 8, 11)):
    T.put(x, 1, 'w')
    for y in range(2, 9 + (i % 2)):
        T.put(x, y, 'g' if y % 2 else 'f')
        if y > 4:
            T.put(x - 1, y, 'e' if i % 2 else 'P')
            T.put(x + 1, y + 1, 'f')
A['erbe'] = chiudi(T, scuri='Bbwefg')

# ---------------------------------------------------------------- la lavagnetta coi prezzi 16x14
T = Tela(16, 14, 7)
rett(T, 0, 0, 16, 14, 'B')
rett(T, 1, 1, 15, 13, 'i')
for y in (3, 6, 9):
    for x in range(3, 13):
        if (x * 3 + y) % 4:
            T.put(x, y, 'Q' if x < 9 else 'M')
T.put(7, 11, 'q'); T.put(8, 11, 'q')
A['lavagna'] = chiudi(T, scuri='Bi')

QUI = os.path.dirname(__file__)
righe = ["# L'interno dell'Emporio Crane. Generato da emporio_abbozzo.py.", '@tavolozza', PAL]
for k, T in A.items():
    righe.append(f'@sprite {k} {T.w}x{T.h}')
    righe += T.righe()
open(os.path.join(QUI, 'emporio.pxs'), 'w').write('\n'.join(righe) + '\n')
print('scritto emporio.pxs')
