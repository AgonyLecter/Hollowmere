#!/usr/bin/env python3
"""La piazza della Valle, alla grana dell'Albero dei Morti:
  · il selciato (224x144, si posa a terra su tutta la piazza): il cordolo di granito lungo il bordo e al centro il
    medaglione d'ardesia con la H di Hollowmere intarsiata in ottone, nel carattere del titolo;
  · la bacheca degli incarichi (36x46): legno sotto un tettuccio di scandole, i foglietti appuntati, la lanterna;
  · l'albo della Valle (36x48): cornice di pietra, tetto d'ardesia col piccione intagliato in cima, la mappa
    dipinta della Valle in alto e la lavagna dei nomi sotto;
  · le fioriere di pietra (28x20), una per stagione (autunno, inverno, primavera, estate);
  · l'alloro in vaso (20x34), ai due lati dell'ingresso dalla cappella.
Scrive piazza.pxs; poi:
    python3 tools/pixel/studio.py tools/pixel/piazza.pxs --js js/piazza_mano.js --nome PIAZZA_MANO
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
n #6a645c
N #8a8478
2 #5a1418
3 #8a2226
4 #b03a30
6 #b05a22
7 #c8862e
8 #d8aa48
9 #ffd070
d #1e2a18
e #2e3a22
f #44522c
g #606a36
G #7a8a44
t #1e2a36
T #2e4450
y #4a6a70
u #7a9aa0
J #8aa0a8
j #5a6a74
p #3a2440
P #5a3a62
r #7a5a86
R #e8a8b8
v #f0e2c0"""

A = {}


def rett(T, x0, y0, x1, y1, ch):
    for y in range(int(y0), int(y1)):
        for x in range(int(x0), int(x1)):
            T.put(x, y, ch)


def cornice(T, x0, y0, x1, y1, ch):
    for x in range(int(x0), int(x1)):
        T.put(x, y0, ch); T.put(x, y1 - 1, ch)
    for y in range(int(y0), int(y1)):
        T.put(x0, y, ch); T.put(x1 - 1, y, ch)


def chiudi(T, scuri='kKcBbwIiLm'):
    T.luna(scuri, chiaro='J', medio='j')
    return T.contorno()


# ================================================================ il selciato 224x144 (a terra, niente contorno)
T = Tela(224, 144, 1)
# il cordolo: blocchi di granito lunghi lungo il bordo, giunti scuri
for x in range(224):
    for y in list(range(0, 4)) + list(range(140, 144)):
        T.put(x, y, 'k' if x % 14 == 0 else ('N' if y in (0, 140) else ('n' if y in (3, 143) else 'M')))
for y in range(144):
    for x in list(range(0, 4)) + list(range(220, 224)):
        T.put(x, y, 'k' if y % 14 == 0 else ('N' if x in (0, 220) else ('n' if x in (3, 223) else 'M')))
# il medaglione al centro: ardesia scura con l'orlo di granito e un filo di bronzo, e dentro, intarsiata in ottone,
# la H di Hollowmere nel carattere del titolo (Jacquard 12, la sua griglia 13x15 ingrandita tre volte: h_hollowmere.txt).
# Ai quattro lati, piccoli intarsi: due zucche intagliate, la luna e il corvo. Nelle feste qui sopra si accende il falò.
CX, CY, RX, RY = 112, 72, 42, 36
for y in range(144):
    for x in range(224):
        dx, dy = (x + .5 - CX) / RX, (y + .5 - CY) / RY
        d = math.sqrt(dx * dx + dy * dy)
        if d > 1:
            continue
        if d > .9:
            ch = 'N' if (int(math.degrees(math.atan2(dy, dx))) // 15) % 2 else 'Q'  # i conci dell'orlo
            if d > .97:
                ch = 'n'
        elif d > .86:
            ch = '6' if (x + y) % 3 else '7'  # il filo di bronzo
        elif d > .83:
            ch = 'k'
        else:
            ch = 'I' if (x * 7 + y * 3) % 17 else 'L'  # l'ardesia
        T.put(x, y, ch)
GH = open(os.path.join(os.path.dirname(__file__), 'h_hollowmere.txt')).read().split()
S = 3
HX, HY = CX - len(GH[0]) * S // 2, CY - len(GH) * S // 2
PIENO = {(i, j) for j, r in enumerate(GH) for i, c in enumerate(r) if c == '#'}
for (i, j) in PIENO:  # prima l'ombra, un pixel più in basso a destra
    for a in range(S):
        for b in range(S):
            T.put(HX + i * S + a + 1, HY + j * S + b + 1, 'K')
for (i, j) in PIENO:
    for a in range(S):
        for b in range(S):
            su = b == 0 and (i, j - 1) not in PIENO
            sx = a == 0 and (i - 1, j) not in PIENO
            giu = b == S - 1 and (i, j + 1) not in PIENO
            T.put(HX + i * S + a, HY + j * S + b, '9' if su else ('8' if sx else ('6' if giu else '7')))
def zucca(x0, y0):
    T.ell(x0, y0, 3.2, 2.4, ('7', '6', '6'), luce=False)
    T.put(x0, y0 - 3, 'g'); T.put(x0 - 1, y0 - 1, '9'); T.put(x0 + 1, y0 - 1, '9'); T.put(x0, y0 + 1, '9')
zucca(CX - 33, CY + 1); zucca(CX + 33, CY + 1)
for k in range(9):  # la luna in alto
    a = math.pi * (.15 + k * .09)
    T.put(CX + math.cos(a) * 3 - 1, CY - 29 - math.sin(a) * 3 + 2, 'q')
T.put(CX - 2, CY - 29, 'q'); T.put(CX - 2, CY - 28, 'Q')
for (dx, dy) in ((-2, 0), (-1, -1), (0, 0), (1, -1), (2, 0), (0, 1)):  # il corvo in basso, ad ali aperte
    T.put(CX + dx, CY + 29 + dy, 'X')
# dove entrano i sentieri il cordolo si apre (in pixel: nord x 80-96, sud x 96-128, ovest y 64-96, est y 32-64)
for x in range(80, 96):
    for y in range(0, 4):
        T.put(x, y, '.')
for x in range(96, 128):
    for y in range(140, 144):
        T.put(x, y, '.')
for y in range(64, 96):
    for x in range(0, 4):
        T.put(x, y, '.')
for y in range(32, 64):
    for x in range(220, 224):
        T.put(x, y, '.')
A['selciato'] = T

# ================================================================ la bacheca degli incarichi 36x46
T = Tela(36, 46, 2)
for x0 in (4, 30):  # i due pali
    rett(T, x0, 10, x0 + 3, 46, 'B'); rett(T, x0, 10, x0 + 1, 46, 'w')
# il tettuccio di scandole
for y in range(0, 9):
    for x in range(int(9 - y), int(27 + y) if y < 9 else 36):
        if 0 <= x < 36:
            T.put(x, y, 'K' if (x + (y // 2) * 2) % 4 == 0 else ('c' if y % 2 else 'k'))
for x in range(0, 36):
    T.put(x, 9, 'b'); T.put(x, 8, 'B')
rett(T, 16, 0, 20, 2, 'b')
# il pannello di legno con la cornice
rett(T, 3, 12, 33, 34, 'w')
for y in range(13, 33):
    for x in range(4, 32):
        T.put(x, y, 'W' if (x * 3 + y) % 13 else 'w')
cornice(T, 3, 12, 33, 34, 'B')
# i foglietti appuntati (il gioco li fa svolazzare un po')
for (x0, y0, w, h, ch) in ((6, 15, 8, 9, 'q'), (16, 14, 7, 7, 'v'), (25, 16, 6, 8, 'q'), (8, 25, 9, 6, 'v'), (20, 23, 9, 8, 'q')):
    rett(T, x0, y0, x0 + w, y0 + h, ch)
    for yy in range(y0 + 2, y0 + h - 1, 2):
        for xx in range(x0 + 1, x0 + w - 1):
            T.put(xx, yy, 'N' if (xx + yy) % 5 else 'n')
    T.put(x0 + w // 2, y0, '4')  # la puntina
T.put(28, 30, '3'); T.put(29, 30, '4'); T.put(28, 29, '4')  # il sigillo di ceralacca
# la mensolina in basso con il calamaio
rett(T, 3, 34, 33, 36, 'B'); T.put(10, 33, 'K'); T.put(11, 33, 'K')
# la lanterna appesa al tetto
T.put(31, 10, 'I'); rett(T, 30, 11, 34, 15, 'I'); rett(T, 31, 12, 33, 14, '9')
A['bacheca'] = chiudi(T, scuri='BbwWkcK')

# ================================================================ l'albo della Valle 36x48
T = Tela(36, 48, 3)
for x0 in (2, 30):  # i pilastri di pietra
    for y in range(12, 46):
        for x in range(x0, x0 + 4):
            T.put(x, y, 'k' if y % 6 == 0 else ('M' if x == x0 else ('m' if x < x0 + 3 else 'L')))
rett(T, 0, 44, 36, 48, 'L'); rett(T, 0, 44, 36, 45, 'M')  # il gradino
# il tetto d'ardesia a due falde
for y in range(4, 12):
    w = 4 + (y - 4) * 2.2
    for x in range(int(18 - w), int(18 + w)):
        T.put(x, y, 'j' if (x + y) % 3 == 0 else ('T' if y % 2 else 't'))
for x in range(0, 36):
    T.put(x, 12, 'I')
# il piccione intagliato in cima
T.ell(18, 2.5, 3.2, 2, ('M', 'm', 'L')); T.put(21, 1, 'L'); T.put(22, 1, '7'); T.put(20, 1, 'K')
T.put(14, 3, 'L'); T.put(15, 3, 'm')
# la mappa dipinta della Valle (in alto) e la lavagna dei nomi (in basso)
rett(T, 6, 14, 30, 27, 'q')
for y in range(14, 27):
    for x in range(6, 30):
        if ((x - 12) / 6) ** 2 + ((y - 21) / 4) ** 2 <= 1:
            T.put(x, y, 'g' if (x + y) % 3 else 'G')  # i prati
        if 20 <= x <= 28 and 15 <= y <= 19 and (x + y) % 2 == 0:
            T.put(x, y, 'f')  # il bosco
        if abs(y - (24 - (x - 6) * .12)) < .8:
            T.put(x, y, 'y')  # il fiume
T.put(13, 20, '4'); T.put(14, 20, '3'); T.put(22, 22, '4')  # le case
cornice(T, 6, 14, 30, 27, 'B')
rett(T, 6, 28, 30, 43, 'e')  # la lavagna
cornice(T, 6, 28, 30, 43, 'B')
for (y, x0, x1) in ((31, 9, 21), (34, 9, 24), (37, 9, 18), (40, 9, 22)):
    for x in range(x0, x1):
        T.put(x, y, 'q' if (x * 7 + y) % 5 else 'e')  # i nomi scritti col gesso
    T.put(x1 + 2, y, '9')  # il pallino di chi è online (il gioco lo fa brillare)
rett(T, 24, 41, 28, 42, 'q')  # il gessetto
A['albo'] = chiudi(T, scuri='MmLIBtTj')

# ================================================================ le fioriere 28x20, una per stagione
FIORI = [('6', '7', '4'), ('q', 'J', 'f'), ('R', '8', 'r'), ('4', '9', 'P')]
for s, (a, b, c) in enumerate(FIORI):
    T = Tela(28, 20, 10 + s)
    rett(T, 1, 9, 27, 19, 'M')  # la vasca di pietra
    for x in range(1, 27):
        T.put(x, 9, 'Q'); T.put(x, 18, 'm')
        if x % 7 == 0:
            for y in range(10, 18):
                T.put(x, y, 'N')
    rett(T, 0, 8, 28, 10, 'Q')
    rett(T, 2, 7, 26, 9, 'e')  # la terra
    for k in range(30):  # le foglie e i fiori
        x = 2 + (k * 5) % 23
        y = 1 + (k * 3) % 6
        T.put(x, y + 2, 'f'); T.put(x + 1, y + 3, 'g')
        if s == 1:  # d'inverno: rametti di agrifoglio e neve
            T.put(x, y + 1, 'e'); T.put(x + 1, y + 1, '4' if k % 3 == 0 else 'e')
            T.put(x, y, 'q')
        else:
            T.put(x, y + 1, [a, b, c][k % 3]); T.put(x + 1, y + 1, [a, b, c][(k + 1) % 3]); T.put(x, y, [a, b, c][(k + 2) % 3])
    A[f'fioriera{s}'] = chiudi(T, scuri='MQNm')

# ================================================================ l'alloro in vaso 20x34
T = Tela(20, 34, 14)
rett(T, 5, 24, 15, 33, '6'); rett(T, 4, 23, 16, 25, '7')  # il vaso di terracotta
for x in range(5, 15):
    T.put(x, 32, '2' if x % 2 else '6')
rett(T, 9, 17, 11, 24, 'B')  # il tronchetto
T.ell(10, 10, 8, 9, ('G', 'g', 'f'), trama=lambda x, y, ch: 'e' if (x * 5 + y * 3) % 11 == 0 else None)
T.ell(10, 6, 5, 5, ('G', 'g', 'f'), trama=lambda x, y, ch: 'e' if (x * 5 + y * 3) % 11 == 0 else None)
A['alloro'] = chiudi(T, scuri='gfeG67')

QUI = os.path.dirname(__file__)
righe = ['# La piazza della Valle. Generato da piazza_abbozzo.py.', '@tavolozza', PAL]
for k, T in A.items():
    righe.append(f'@sprite {k} {T.w}x{T.h}')
    righe += T.righe()
open(os.path.join(QUI, 'piazza.pxs'), 'w').write('\n'.join(righe) + '\n')
print('scritto piazza.pxs:', len(A))
