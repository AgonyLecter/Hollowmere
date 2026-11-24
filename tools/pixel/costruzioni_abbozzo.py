#!/usr/bin/env python3
"""Le costruzioni della Valle, gotiche come il paese e alla stessa misura di prima (la base tocca il fondo):
pollaio su pali, stalla nera col teschio di vacca sopra la porta, ovile di pietra col recinto, serra di ferro
nero e vetri verdastri, mulino a vento di pietra con le pale rotte, silos di doghe cerchiate di ferro,
pozzo di pietra col tettuccio. Legno tinto di nero, ardesia col muschio, una luce calda alle finestre.
Scrive costruzioni.pxs; poi:
    python3 tools/pixel/studio.py tools/pixel/costruzioni.pxs --js js/costruzioni_mano.js --nome COSTRUZIONI_MANO
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
J #8aa0a8
j #5a6a74
d #1e2a18
e #2e3a22
f #44522c
g #606a36
2 #7c1512
3 #b0261e
6 #b05a22
7 #c8862e
8 #d8aa48
9 #ffd070
0 #fff0c0
t #1e2a36
T #2e4450
x #4a6a70
y #7a9a98"""

A = {}


def rett(T, x0, y0, x1, y1, ch):
    for y in range(int(y0), int(y1)):
        for x in range(int(x0), int(x1)):
            T.put(x, y, ch)


def assi(T, x0, y0, x1, y1, scuro=False):
    """parete di assi verticali tinte di nero (o di legno vecchio), coi coprigiunti e le macchie"""
    for y in range(int(y0), int(y1)):
        for x in range(int(x0), int(x1)):
            u = (x - x0) % 4
            ch = ('X' if u == 0 else 'K' if u == 3 else 'k') if scuro else ('b' if u == 0 else 'B' if u in (1, 3) else 'w')
            if (x * 7 + y * 3) % 23 == 0:
                ch = 'c' if scuro else 'W'
            T.put(x, y, ch)


def pietre(T, x0, y0, x1, y1, chiare=False):
    """muro di pietre a corsi sfalsati, le fughe scure"""
    for y in range(int(y0), int(y1)):
        for x in range(int(x0), int(x1)):
            r = (y - y0) % 4
            off = 3 if ((y - y0) // 4) % 2 else 0
            if r == 3 or (x + off) % 6 == 0:
                ch = 'i' if not chiare else 'L'
            else:
                ch = ('m' if chiare else 'L') if r == 0 else ('M' if chiare and (x + y) % 5 == 0 else 'm' if chiare else 'I')
            T.put(x, y, ch)


def tetto(T, x0, x1, yb, ya, cx=None, muschio=True):
    """tetto a capanna ripido visto di fronte: ardesia a file sfalsate, le tegole che mancano, il muschio,
    la cornice scura sui due spioventi"""
    cx = (x0 + x1) / 2 if cx is None else cx
    for y in range(int(ya), int(yb)):
        t = (y - ya) / (yb - ya)
        l, r = cx - (cx - x0) * t, cx + (x1 - cx) * t
        for x in range(int(math.floor(l)), int(math.ceil(r))):
            fila = (y - int(ya)) // 2
            ch = 'I' if (x + fila * 2) % 4 else 'i'
            if (y - int(ya)) % 2 == 1:
                ch = 'i' if x % 2 else 'I'
            if (x * 13 + y * 7) % 41 == 0:
                ch = 'X'  # una tegola che manca
            if muschio and t > .55 and (x * 5 + y * 3) % 9 == 0:
                ch = 'f' if (x + y) % 2 else 'g'
            T.put(x, y, ch)
        T.put(math.floor(l), y, 'K'); T.put(math.ceil(r) - 1, y, 'K')
    for x in range(int(x0) - 1, int(x1) + 1):  # la gronda
        T.put(x, yb, 'K')


def finestra(T, x, y, w, h, accesa=True):
    rett(T, x - 1, y - 1, x + w + 1, y + h + 1, 'K')
    for yy in range(y, y + h):
        for xx in range(x, x + w):
            T.put(xx, yy, ('9' if (xx - x) < w / 2 and yy - y < h / 2 else '8') if accesa else ('T' if yy - y < 1 else 't'))
    for yy in range(y, y + h):
        T.put(x + w // 2, yy, 'X')
    for xx in range(x, x + w):
        T.put(xx, y + h // 2, 'X')
    rett(T, x - 1, y + h + 1, x + w + 1, y + h + 2, 'W')  # il davanzale


def porta(T, x, y, w, h, croce=True):
    rett(T, x - 1, y - 1, x + w + 1, y + h, 'X')
    for yy in range(y, y + h):
        for xx in range(x, x + w):
            T.put(xx, yy, 'B' if (xx - x) % 3 else 'b')
    if croce:  # la croce di sant'Andrea delle porte da stalla
        for k in range(h):
            T.put(x + k * (w - 1) / (h - 1), y + k, 'W'); T.put(x + w - 1 - k * (w - 1) / (h - 1), y + k, 'W')
        rett(T, x, y + h // 2, x + w, y + h // 2 + 1, 'W')


def lanterna(T, x, y):
    T.put(x, y - 1, 'K'); T.put(x, y, '9'); T.put(x, y + 1, '8'); T.put(x - 1, y, 'K'); T.put(x + 1, y, 'K'); T.put(x, y + 2, 'K')


def edera(T, x, y0, y1, seme):
    for y in range(y0, y1):
        xx = x + round(math.sin(y * .7 + seme) * 1.5)
        T.put(xx, y, 'e' if y % 3 else 'f')
        if (y + seme) % 3 == 0:
            T.put(xx + 1, y, 'g'); T.put(xx - 1, y + 1, 'f')


def erbacce(T, y, x0, x1, seme):
    for x in range(x0, x1):
        if (x * 7 + seme) % 5 == 0:
            T.put(x, y, 'f'); T.put(x, y - 1, 'g' if x % 2 else 'e')


def chiudi(T, scuri='kKcBbwIiLm'):
    T.luna(scuri, chiaro='J', medio='j')
    return T.contorno()


# ---------------------------------------------------------------- pollaio 48x34: casotto su pali
T = Tela(48, 34, 1)
for x in (6, 7, 40, 41):  # i pali
    rett(T, x, 24, x + 1, 33, 'K' if x % 2 else 'k')
assi(T, 4, 13, 44, 25, scuro=True)
tetto(T, 1, 47, 13, 1, cx=22)
finestra(T, 10, 16, 4, 4)
porta(T, 22, 17, 6, 8, croce=False)
rett(T, 23, 18, 27, 25, 'X')  # il buco della porticina, buio
T.put(24, 21, '8'); T.put(25, 21, '8')  # due occhi di gallina nel buio
for k in range(10):  # la passerella a pioli
    T.put(26 + k, 25 + k * .8, 'W'); T.put(27 + k, 25 + k * .8, 'w')
    if k % 2 == 0:
        T.put(26 + k, 24 + k * .8, 'h')
rett(T, 4, 25, 44, 26, 'b')
for x in range(5, 44, 3):  # la paglia che esce sotto
    T.put(x, 26, '7' if x % 2 else '6')
edera(T, 42, 14, 25, 2)
A['pollaio'] = chiudi(T)

# ---------------------------------------------------------------- stalla 64x48
T = Tela(64, 48, 2)
pietre(T, 3, 41, 61, 47)
assi(T, 3, 20, 61, 41, scuro=True)
tetto(T, 0, 64, 20, 0)
# il fienile: l'apertura in alto col fieno, il paranco
rett(T, 27, 7, 37, 15, 'X')
for x in range(28, 36):
    for y in range(10, 15):
        T.put(x, y, '7' if (x + y) % 3 else '6')
rett(T, 31, 4, 33, 6, 'K'); T.put(32, 6, 'k'); T.put(32, 7, 'K')
# la porta grande a due battenti
porta(T, 24, 26, 8, 15)
porta(T, 32, 26, 8, 15)
# il teschio di vacca sopra la porta, con le corna
for x, y, ch in ((31, 22, 'q'), (32, 22, 'q'), (31, 23, 'Q'), (32, 23, 'Q'), (31, 24, 'Q'), (32, 24, 'M'),
                 (30, 21, 'Q'), (29, 20, 'Q'), (28, 20, 'M'), (33, 21, 'Q'), (34, 20, 'Q'), (35, 20, 'M')):
    T.put(x, y, ch)
T.put(31, 23, 'X'); T.put(32, 23, 'X')
finestra(T, 9, 26, 6, 5)
finestra(T, 49, 26, 6, 5, accesa=False)
lanterna(T, 21, 27)
edera(T, 5, 22, 41, 1); edera(T, 59, 28, 41, 4)
A['stalla'] = chiudi(T)

# ---------------------------------------------------------------- ovile 48x34: pietra e assi, recinto davanti
T = Tela(48, 34, 3)
pietre(T, 6, 12, 42, 26, chiare=True)
tetto(T, 3, 45, 12, 0)
rett(T, 20, 16, 28, 26, 'X')  # l'ingresso basso, buio
for x in range(21, 27):
    T.put(x, 15, 'B')
T.put(22, 21, 'q'); T.put(25, 22, 'Q')  # lana che si intravede
finestra(T, 11, 16, 3, 3, accesa=False)
for X in range(1, 47, 5):  # il recinto davanti, pali storti e due traverse
    for y in range(24, 33):
        T.put(X + (1 if y < 26 and X % 2 else 0), y, 'k')
for y in (26, 30):
    for x in range(1, 47):
        T.put(x, y + (x // 12) % 2, 'w' if x % 7 else 'B')
A['ovile'] = chiudi(T, scuri='kKcBbwIiLmM')

# ---------------------------------------------------------------- serra 64x44: ferro nero e vetri verdastri
T = Tela(64, 44, 4)
pietre(T, 2, 38, 62, 44)
# il corpo di vetro e il tetto a capanna di vetro; dentro, ombre di piante
for y in range(8, 38):
    for x in range(3, 61):
        if y < 20 and abs(x - 32) > (y - 6) * 2.4:
            continue
        ch = 'T' if (x + y) % 7 else 'x'
        if y > 28 and (x * 3 + y) % 4 < 2:
            ch = 'e' if x % 3 else 'd'  # le piante dentro
        if (x - y) % 13 == 0 and y < 30:
            ch = 'y'  # i riflessi della luna sul vetro
        T.put(x, y, ch)
# i montanti di ferro
for x in range(3, 61, 6):
    for y in range(8, 38):
        if T.get(x, y) != '.':
            T.put(x, y, 'X')
for y in (20, 29):
    for x in range(3, 61):
        T.put(x, y, 'X')
for y in range(8, 21):  # gli spioventi
    d = (y - 6) * 2.4
    T.put(32 - d, y, 'K'); T.put(32 + d, y, 'K')
rett(T, 31, 3, 33, 8, 'K')  # il pinnacolo di ferro sul colmo
T.put(32, 2, 'K'); T.put(31, 4, 'X'); T.put(33, 4, 'X')
for x in range(8, 57, 8):  # la cresta traforata
    T.put(x if x < 32 else x, 7 + abs(x - 32) // 2.4 - 1, 'K')
porta(T, 29, 30, 6, 8, croce=False)
rett(T, 30, 31, 34, 36, 'T')
A['serra'] = chiudi(T, scuri='kKcIiL')

# ---------------------------------------------------------------- mulino 64x106: torre di pietra e pale rotte
T = Tela(64, 106, 5)
for y in range(40, 104):  # la torre che si stringe verso l'alto
    t = (y - 40) / 64
    hw = 12 + t * 6
    for x in range(int(32 - hw), int(32 + hw) + 1):
        u = (x - (32 - hw)) / (2 * hw)
        r = (y - 40) % 4
        off = 3 if ((y - 40) // 4) % 2 else 0
        ch = 'i' if r == 3 or (x + off) % 6 == 0 else 'm' if u < .22 else 'L' if u < .6 else 'I' if u < .85 else 'i'
        T.put(x, y, ch)
pietre(T, 12, 102, 52, 106)
# il cappello d'ardesia a cupola appuntita
for y in range(22, 41):
    t = (y - 22) / 18
    hw = 2 + t * 13
    for x in range(int(32 - hw), int(32 + hw) + 1):
        ch = 'I' if ((x + (y // 2) * 2) % 4) else 'i'
        if (x * 13 + y * 7) % 37 == 0:
            ch = 'f'
        T.put(x, y, ch)
rett(T, 17, 40, 48, 42, 'K')
T.put(32, 21, 'K'); T.put(32, 20, 'K'); T.put(31, 19, 'K'); T.put(33, 19, 'K')  # la banderuola
# finestre e porta ad arco
finestra(T, 30, 58, 4, 5)
finestra(T, 29, 78, 4, 4, accesa=False)
porta(T, 28, 92, 8, 11, croce=False)
for x in range(28, 36):
    T.put(x, 91 - (1 if 29 < x < 34 else 0), 'X')
# l'asse e le 4 pale a croce di sant'Andrea: il palo, il telaio di listelli, brandelli di tela; una è spezzata
cx, cy = 32, 44
for k, ang in enumerate((-2.36, -.79, .79, 2.36)):
    lung = 29 if k != 3 else 13
    n = (math.cos(ang + math.pi / 2), math.sin(ang + math.pi / 2))
    for s_ in range(3, lung):
        x, y = cx + math.cos(ang) * s_, cy + math.sin(ang) * s_
        T.put(x, y, 'K'); T.put(x + .5, y + .5, 'k')
        if s_ > 7:
            for q in range(1, 6):
                px, py = x + n[0] * q, y + n[1] * q
                if q == 5 or s_ % 3 == 0:
                    T.put(px, py, 'W' if q == 5 else 'w')
                elif k != 1 and (s_ * 7 + q * 3) % 4 == 0:
                    T.put(px, py, 'h' if (s_ + q) % 2 else 'Q')  # la tela strappata
T.ell(32, 44, 2.5, 2.5, 'cKX')
edera(T, 18, 80, 102, 3); edera(T, 45, 70, 102, 5)
A['mulino'] = chiudi(T, scuri='kKcBbwIiLm')

# ---------------------------------------------------------------- silos 32x56: doghe di legno e cerchi di ferro
T = Tela(32, 56, 6)
for y in range(12, 53):
    for x in range(4, 28):
        u = (x - 4) / 24
        ch = 'W' if u < .2 else 'w' if u < .55 else 'B' if u < .85 else 'b'
        if (x - 4) % 3 == 0:
            ch = 'b'
        T.put(x, y, ch)
for y in (16, 26, 36, 46):  # i cerchi di ferro con la ruggine
    for x in range(4, 28):
        T.put(x, y, 'K' if x % 5 else '6')
for y in range(2, 13):  # il cappello conico d'ardesia
    hw = 2 + (y - 2) * 1.35
    for x in range(int(16 - hw), int(16 + hw) + 1):
        T.put(x, y, 'I' if (x + y) % 3 else 'i')
rett(T, 2, 12, 30, 13, 'K')
T.put(16, 1, 'K'); T.put(16, 0, 'K')
porta(T, 12, 42, 8, 11, croce=False)
for y in range(14, 42, 2):  # la scala di ferro
    T.put(25, y, 'K'); T.put(27, y, 'K'); T.put(26, y, 'X')
pietre(T, 3, 53, 29, 56)
A['silos'] = chiudi(T)

# ---------------------------------------------------------------- pozzo grande 32x36
T = Tela(32, 36, 7)
pietre(T, 4, 22, 28, 35, chiare=True)
rett(T, 3, 20, 29, 23, 'M')  # la vera
for x in range(4, 28):
    T.put(x, 20, 'Q')
rett(T, 6, 23, 26, 24, 'X')
for x in (5, 26):  # i montanti
    rett(T, x, 7, x + 2, 21, 'k')
tetto(T, 1, 31, 8, 0, muschio=True)
rett(T, 7, 11, 25, 12, 'B')  # il rullo con la corda e il secchio
for y in range(12, 18):
    T.put(16, y, 'h')
rett(T, 14, 17, 19, 20, 'B'); rett(T, 14, 17, 19, 18, 'K')
rett(T, 6, 21, 26, 22, 't')  # l'acqua nera che si vede
T.put(10, 21, 'x'); T.put(20, 21, 'y')
edera(T, 7, 24, 35, 2)
A['pozzogrande'] = chiudi(T, scuri='kKcBbwIiLmM')

QUI = os.path.dirname(__file__)
righe = ['# Le costruzioni della Valle. Generato da costruzioni_abbozzo.py.', '@tavolozza', PAL]
for k, T in A.items():
    righe.append(f'@sprite {k} {T.w}x{T.h}')
    righe += T.righe()
open(os.path.join(QUI, 'costruzioni.pxs'), 'w').write('\n'.join(righe) + '\n')
print('scritto costruzioni.pxs')
