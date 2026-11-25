#!/usr/bin/env python3
"""L'interno della fucina di Brom, alla grana dell'Albero dei Morti:
  · la forgia (48x48): pietra annerita, l'arco del focolare con le braci (il gioco le fa respirare), la cappa
    che sale nel muro;
  · il mantice (26x16) a riposo e schiacciato; l'incudine sul ceppo (26x20); la vasca della tempra (26x14);
  · la rastrelliera degli attrezzi (34x22): tenaglie, martelli, ferri di cavallo appesi;
  · il tavolo da disegno (34x24) con le piante della casa, il compasso, la candela;
  · il mucchio di carbone (22x12) e la mola (20x20).
Scrive fucina.pxs; poi:
    python3 tools/pixel/studio.py tools/pixel/fucina.pxs --js js/fucina_mano.js --nome FUCINA_MANO
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
i #24242c
I #3a3a44
L #55545a
m #74726e
M #9a968a
Q #c0baa8
q #e8dcc0
4 #5a1e10
5 #8a3418
6 #b05a22
7 #c8862e
8 #d8aa48
9 #ffd070
0 #fff0c0
2 #7c1512
3 #b0261e
t #1e2a36
T #2e4450
y #4a6a70
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


def pietre(T, x0, y0, x1, y1):
    for y in range(int(y0), int(y1)):
        for x in range(int(x0), int(x1)):
            r = (y - y0) % 4
            off = 3 if ((y - y0) // 4) % 2 else 0
            ch = 'i' if r == 3 or (x + off) % 6 == 0 else ('L' if r == 0 else 'I')
            if (x * 5 + y * 3) % 13 == 0 and ch == 'I':
                ch = 'k'  # la fuliggine
            T.put(x, y, ch)


# ---------------------------------------------------------------- la forgia 48x48
T = Tela(48, 48, 1)
pietre(T, 10, 0, 38, 22)  # la cappa che sale nel muro
for y in range(0, 22):
    for x in range(10, 38):
        if x < 10 + y * .3 or x > 37 - y * .3:
            T.put(x, y, '.')
pietre(T, 2, 20, 46, 46)  # il corpo del focolare
rett(T, 1, 20, 47, 23, 'L')
for x in range(1, 47):
    T.put(x, 20, 'm')
# l'arco del focolare, nero di fuliggine, con le braci
for y in range(26, 44):
    for x in range(9, 39):
        d = ((x + .5 - 24) / 14) ** 2 + ((y + .5 - 44) / 17) ** 2
        if d <= 1:
            T.put(x, y, 'X' if d > .78 else ('K' if y < 36 else 'X'))
for y in range(37, 44):
    for x in range(12, 36):
        if ((x + .5 - 24) / 12) ** 2 + ((y + .5 - 44) / 7) ** 2 <= 1:
            T.put(x, y, '3' if (x * 3 + y) % 5 == 0 else ('6' if (x + y) % 3 else '5'))
for x, y in ((20, 38), (24, 37), (28, 39), (17, 40), (31, 41)):
    T.put(x, y, '9'); T.put(x + 1, y, '8')
rett(T, 2, 44, 46, 48, 'I')  # il piano di pietra davanti
for x in range(2, 46):
    T.put(x, 44, 'm')
# le tenaglie appoggiate e un ferro rovente
for k in range(10):
    T.put(36 + k * .6, 32 + k, 'M')
T.put(39, 43, '9'); T.put(40, 43, '7')
A['forgia'] = chiudi(T, scuri='IiLk')

# ---------------------------------------------------------------- il mantice 26x16 (aperto e schiacciato)
for f, alto in ((0, 6), (1, 3)):
    T = Tela(26, 16, 2 + f)
    # le due tavole di legno e il cuoio a pieghe in mezzo, il becco di ferro verso la forgia
    rett(T, 2, 3 + (6 - alto), 20, 5 + (6 - alto), 'W')
    rett(T, 2, 12, 20, 14, 'w')
    for y in range(5 + (6 - alto), 12):
        for x in range(3, 19):
            T.put(x, y, '5' if (y + x // 4) % 3 else '4')
    rett(T, 20, 9, 25, 11, 'L'); T.put(24, 9, 'm')
    rett(T, 0, 3 + (6 - alto), 3, 5 + (6 - alto), 'B')  # la maniglia
    A[f'mantice{f}'] = chiudi(T, scuri='Ww54L')

# ---------------------------------------------------------------- l'incudine sul ceppo 26x20
T = Tela(26, 20, 4)
T.ell(13, 16, 7, 4, 'WwB', trama=lambda x, y, ch: 'b' if (x + y) % 4 == 0 else None)  # il ceppo
for x in range(8, 19):
    T.put(x, 13, 'h')
rett(T, 9, 6, 17, 12, 'I')  # il corpo
rett(T, 3, 3, 23, 7, 'L')  # la tavola, col corno a sinistra
for x in range(0, 4):
    T.put(x, 4 + x * .3, 'L'); T.put(x, 5, 'I')
for x in range(3, 23):
    T.put(x, 3, 'M')
T.put(18, 4, 'K'); T.put(20, 4, 'K')  # i fori
rett(T, 6, 11, 20, 13, 'I')
A['incudine'] = chiudi(T, scuri='LIWwB')

# ---------------------------------------------------------------- la vasca della tempra 26x14
T = Tela(26, 14, 5)
rett(T, 1, 3, 25, 14, 'B')
for x in range(1, 25):
    T.put(x, 3, 'W')
    if x % 6 == 0:
        for y in range(4, 14):
            T.put(x, y, 'b')
for x in range(1, 25):
    T.put(x, 7, 'I'); T.put(x, 11, 'I')  # i cerchi di ferro
rett(T, 3, 4, 23, 6, 't')
for x in (6, 12, 17):
    T.put(x, 4, 'y')
A['vasca'] = chiudi(T, scuri='BbWI')

# ---------------------------------------------------------------- la rastrelliera 34x22
T = Tela(34, 22, 6)
rett(T, 0, 2, 34, 5, 'B')
for x in range(0, 34):
    T.put(x, 2, 'W')
for x in range(3, 34, 6):
    T.put(x, 4, '7')  # i ganci
# un martello, le tenaglie, due ferri di cavallo, una lima
rett(T, 3, 5, 4, 16, 'w'); rett(T, 1, 14, 7, 17, 'L')
for k in range(12):
    T.put(9 + k * .25, 5 + k, 'M'); T.put(11 - k * .25, 5 + k, 'm')
for cx in (17, 23):
    for a in range(0, 181, 15):
        r = math.radians(a)
        T.put(cx + math.cos(r) * 2.6, 9 + math.sin(r) * 3, 'M')
rett(T, 29, 5, 30, 18, 'm'); T.put(29, 18, 'w')
A['rastrelliera'] = chiudi(T, scuri='BWwLmM')

# ---------------------------------------------------------------- il tavolo da disegno 34x24
T = Tela(34, 24, 7)
for x0 in (3, 28):
    rett(T, x0, 12, x0 + 2, 24, 'B')
rett(T, 1, 8, 33, 12, 'W')
for x in range(1, 33):
    T.put(x, 8, 'h'); T.put(x, 11, 'w')
# le piante della casa, il compasso, la candela accesa
rett(T, 5, 3, 21, 9, 'q')
for x in range(7, 19):
    T.put(x, 5, 'j')
for y in range(4, 8):
    T.put(9, y, 'j'); T.put(15, y, 'j')
T.put(12, 6, 'T')
for k in range(5):
    T.put(23 + k * .5, 3 + k, 'M'); T.put(25 - k * .3, 3 + k, 'M')
rett(T, 28, 3, 30, 8, 'q'); T.put(29, 2, '9'); T.put(29, 1, '0')
A['tavolo'] = chiudi(T, scuri='BWw')

# ---------------------------------------------------------------- il carbone 22x12 e la mola 20x20
T = Tela(22, 12, 8)
T.parte(lambda x, y: ((x - 11) / 10) ** 2 + ((y - 10) / 6) ** 2 <= 1 and y < 12, 'IKX',
        trama=lambda x, y, ch: 'L' if (x * 7 + y * 3) % 9 == 0 else None)
A['carbone'] = chiudi(T, scuri='IKX')
T = Tela(20, 20, 9)
for x0 in (3, 15):
    rett(T, x0, 8, x0 + 2, 20, 'B')
T.disco(10, 9, 7, 'm')
T.disco(10, 9, 5, 'M')
T.disco(10, 9, 1.6, 'K')
for a in range(0, 360, 45):
    T.put(10 + math.cos(math.radians(a)) * 6, 9 + math.sin(math.radians(a)) * 6, 'L')
rett(T, 17, 8, 20, 9, 'w')  # la manovella
A['mola'] = chiudi(T, scuri='BmML')

# ---------------------------------------------------------------- la cassa dei minerali 28x20
# una cassa bassa di assi, divisa in scomparti: ferro rugginoso, rame, nichel, pepite d'oro; il barattolo dei soldi
T = Tela(28, 20, 10)
rett(T, 1, 8, 27, 20, 'B')
for x in range(1, 27):
    T.put(x, 8, 'W'); T.put(x, 19, 'b')
for x in (7, 14, 21):
    for y in range(8, 20):
        T.put(x, y, 'b')
for y in (12, 16):
    for x in range(1, 27):
        if T.get(x, y) == 'B':
            T.put(x, y, 'w')
for x0, cols in ((1, '56'), (8, '67'), (15, 'mM'), (22, '89')):
    for k in range(9):
        x, y = x0 + 1 + (k * 3) % 5, 4 + (k * 5) % 4
        T.put(x, y, cols[k % 2]); T.put(x + 1, y, cols[(k + 1) % 2]); T.put(x, y + 1, cols[0])
    rett(T, x0 + 1, 7, x0 + 6, 8, cols[0])
T.put(23, 4, '0')  # una pepita che brilla
A['minerali'] = chiudi(T, scuri='BbWw56')

QUI = os.path.dirname(__file__)
righe = ['# L\'interno della fucina di Brom. Generato da fucina_abbozzo.py.', '@tavolozza', PAL]
for k, T in A.items():
    righe.append(f'@sprite {k} {T.w}x{T.h}')
    righe += T.righe()
open(os.path.join(QUI, 'fucina.pxs'), 'w').write('\n'.join(righe) + '\n')
print('scritto fucina.pxs')
