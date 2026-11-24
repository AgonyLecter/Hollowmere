#!/usr/bin/env python3
"""Le piccole cose della natura, alla grana dell'Albero dei Morti e alla stessa misura di prima:
ceppi (anche con l'offerta e svuotato, con la brace), erba secca, funghi, sassi, il tronco caduto, canne e
tife, il girasole che si piega, la ninfea, l'ortensia, il mucchio di foglie.
Scrive minori.pxs; poi:
    python3 tools/pixel/studio.py tools/pixel/minori.pxs --js js/minori_mano.js --nome MINORI_MANO
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
J #8aa0a8
j #5a6a74
1 #4a0a0c
2 #7c1512
3 #b0261e
4 #5a1e10
5 #8a3418
6 #b05a22
7 #c8862e
8 #d8aa48
9 #ffd070
a #141e12
d #1e2a18
e #2e3a22
f #44522c
g #606a36
i #24242c
I #3a3a44
L #55545a
m #74726e
M #9a968a
q #e8dcc0
Q #c0baa8
p #5a3a52
P #8a6a8a
r #b8a8c8
t #3e5a6e"""

A = {}


def ceppo(T, x0=1):
    """il ceppo: corteccia scura, il taglio chiaro con gli anelli, una radice di lato"""
    T.poli([(2, 5), (14, 5), (15, 12), (1, 12)], 'kKX')
    for y in range(6, 12):
        for x in (4, 7, 10, 13):
            if T.get(x, y) != '.':
                T.put(x, y, 'X')
    T.ell(8, 5, 6.2, 2.4, 'hWw')
    T.ell(8, 5, 3.6, 1.3, 'Www')
    T.put(8, 5, 'B')
    T.put(11, 4, 'B'); T.put(4, 6, 'B')  # le crepe del taglio
    T.poli([(0, 11), (3, 10), (4, 13), (0, 13)], 'kKX')
    T.poli([(13, 10), (16, 12), (16, 13), (12, 13)], 'kKX')
    T.put(2, 9, 'f'); T.put(3, 10, 'g'); T.put(2, 10, 'e')  # muschio


T = Tela(16, 14); ceppo(T); T.luna('kKc'); A['ceppo'] = T.contorno()
# il ceppo con l'offerta: una pagnotta dorata appoggiata sul taglio
T = Tela(16, 14); ceppo(T)
T.ell(8, 3.5, 3.4, 2, '876'); T.put(7, 2, '9'); T.put(9, 3, '6'); T.put(8, 2, '8')
T.luna('kKc'); A['ceppoB'] = T.contorno()
# il ceppo svuotato: un buco nero nel taglio e una brace che guarda
T = Tela(16, 14); ceppo(T)
T.ell(8, 5, 4.2, 1.8, 'XXX'); T.put(6, 4, 'c'); T.put(7, 4, 'c'); T.put(8, 5, '6'); T.put(9, 5, '3')
T.luna('kKc'); A['ceppoH'] = T.contorno()


# erba alta secca: ciuffi di steli ocra e grigi che si piegano
def erba(v):
    T = Tela(14, 15, 50 + v)
    secca = v != 2
    xs = [1.5, 4, 6.5, 9, 11.5] if v != 1 else [2, 5, 8, 11]
    for i, x0 in enumerate(xs):
        alt = T.rnd.uniform(7, 13)
        pieg = T.rnd.uniform(-2.2, 2.2)
        for k in range(int(alt)):
            t = k / alt
            ch = ('h' if t > .55 else 'W' if t > .25 else 'w') if secca else ('g' if t > .5 else 'f' if t > .2 else 'e')
            T.put(x0 + pieg * t * t, 14 - k, ch)
        if i % 2 == 0:  # la spiga
            T.put(x0 + pieg, 14 - alt, 'h' if secca else 'g')
            T.put(x0 + pieg, 13 - alt, 'W' if secca else 'f')
    for x in range(1, 13):  # il piede scuro nell'erba; i fili restano senza contorno (sottili, si perderebbero nel nero)
        T.put(x, 14, 'b' if secca else 'd')
    return T


for v in range(3):
    A[f'erba{v}'] = erba(v)


# funghi: v0 cappelli color osso a gruppetti, v1 bruni a mensola con i puntini
def fungo(v):
    T = Tela(11, 9, 70 + v)
    gruppi = [(3.6, 5, 2.4), (8, 6, 1.9)] if v == 0 else [(4, 5, 2.8), (8, 6.5, 1.9)]
    for (x, y, r) in gruppi:
        for yy in range(int(y), 9):
            T.put(x - .5, yy, 'Q'); T.put(x + .5, yy, 'M')
    for (x, y, r) in gruppi:
        T.parte(lambda px, py, x=x, y=y, r=r: py <= y + .3 and ((px - x) / r) ** 2 + ((py - y) / (r * .75)) ** 2 <= 1,
                'qQM' if v == 0 else '655')
        if v == 1:
            T.put(x - 1, y - 1, 'q'); T.put(x + 1, y - 2, 'q')
        T.put(x - r + .5, y, 'M' if v == 0 else '4')
    return T.contorno()


for v in range(2):
    A[f'fungo{v}'] = fungo(v)


# sassi: pietra scura con le facce, muschio sopra, una crepa
def sasso(v):
    T = Tela(15, 11, 90 + v)
    forme = [[(1, 9), (3, 4), (7, 2), (12, 3), (14, 8), (12, 10), (3, 10)],
             [(2, 10), (2, 6), (6, 3), (10, 3), (13, 7), (12, 10)],
             [(1, 10), (4, 5), (9, 4), (13, 6), (14, 10)]][v]
    T.poli(forme, 'MLI')
    for x in range(15):  # una faccia in ombra a destra
        for y in range(11):
            if T.get(x, y) == 'L' and x > 9:
                T.put(x, y, 'I')
    for k in range(3):  # la crepa
        T.put(7 + k // 2, 5 + k, 'i')
    for x in range(4, 10):  # il muschio sul dorso
        for y in range(11):
            if T.get(x, y) == 'M' and T.get(x, y - 1) == '.':
                T.put(x, y, 'g' if x % 3 else 'f')
                break
    T.luna('LI', chiaro='J', medio='m')
    return T.contorno()


for v in range(3):
    A[f'sasso{v}'] = sasso(v)

# il tronco caduto: corteccia solcata, il taglio con gli anelli, funghi a mensola e muschio
T = Tela(32, 13, 110)
T.poli([(3, 3), (29, 4), (29, 11), (2, 11)], 'kKX')
for x in range(4, 28, 3):
    for y in range(5, 11):
        if (x + y) % 2:
            T.put(x, y, 'X')
T.ell(29, 7.5, 2.4, 4, 'hWw'); T.put(29, 7, 'B'); T.put(30, 6, 'w')
T.ell(3, 7, 1.8, 4, 'kKX')
for x in (9, 10, 18, 19, 20):  # funghi a mensola sul fianco
    T.put(x, 6, '7'); T.put(x, 7, '5')
for x in range(6, 22):
    if x % 4:
        T.put(x, 3 if x < 14 else 4, 'f' if x % 3 else 'g')
T.luna('kKc')
A['tronco'] = T.contorno()


# canne e tife: steli verde scuro, le tife brune, le foglie lunghe che si piegano
def canna(v):
    T = Tela(10, 17, 130 + v)
    for i, x0 in enumerate((2, 5, 7) if v == 0 else (3, 6)):
        alt = 12 + (i * 3 + v) % 4
        for k in range(alt):
            T.put(x0, 16 - k, 'e' if k % 4 else 'f')
        T.put(x0, 16 - alt, 'B'); T.put(x0, 17 - alt, 'B'); T.put(x0, 18 - alt, 'b')  # la tifa
        T.put(x0, 15 - alt, 'e')
    for k in range(7):  # una foglia lunga che cade
        T.put(1 + k * .9 if v else 8 - k * .9, 9 + k * k * .12, 'f')
    return T.contorno()


for v in range(2):
    A[f'canna{v}'] = canna(v)

# canne alte della riva (12x18)
T = Tela(12, 18, 140)
for i, x0 in enumerate((2, 4, 6, 8, 10)):
    alt = 11 + (i * 5) % 6
    for k in range(alt):
        T.put(x0 + (k > alt - 4) * (1 if i % 2 else -1), 17 - k, 'f' if k % 3 else 'g')
    if i % 2 == 0:
        T.put(x0, 17 - alt, 'B'); T.put(x0, 18 - alt, 'B')
A['canne'] = T.contorno()

# il girasole d'autunno: alto, il capo pesante che si piega, i petali che cadono
T = Tela(11, 24, 150)
for k in range(17):
    T.put(5 + (k > 12) * .5, 23 - k, 'e' if k % 3 else 'f')
T.poli([(5, 16), (1, 13), (2, 16)], 'gfe'); T.poli([(6, 19), (10, 17), (9, 20)], 'gfe')  # foglie avvizzite
T.ell(6, 6, 3.8, 3.4, '877')
T.ell(6.5, 6.5, 2.2, 2, 'BbX')
for x, y in ((2, 3), (10, 5), (3, 10), (9, 9)):
    T.put(x, y, '6')
T.put(6, 6, 'w'); T.put(7, 7, 'X')
T.luna('ef')
A['girasole'] = T.contorno()

# la ninfea: foglia tonda col taglio, un fiore pallido
T = Tela(11, 6, 160)
T.parte(lambda x, y: ((x - 5.5) / 5) ** 2 + ((y - 3.5) / 2.3) ** 2 <= 1 and not (x > 5.5 and abs(y - 3.5) < .6), 'gfe')
T.put(4, 2, 'q'); T.put(5, 2, 'Q'); T.put(4, 1, 'q'); T.put(3, 2, 'Q'); T.put(4, 3, '8')
A['ninfea'] = T.contorno()

# l'ortensia: un cespo scuro coi fiori color livido
T = Tela(15, 13, 170)
T.ell(7.5, 8.5, 6.5, 4.2, 'fed')
for (x, y) in ((4, 6), (8, 5), (11, 7), (6, 9), (10, 10), (3, 9)):
    for dx, dy, ch in ((0, 0, 'P'), (1, 0, 'p'), (0, 1, 'p'), (-1, 0, 'P'), (0, -1, 'r'), (1, 1, 'p'), (-1, 1, 'p'), (1, -1, 'P'), (-1, -1, 'r')):
        T.put(x + dx, y + dy, ch)
T.luna('fedpP', chiaro='g', medio='f')
A['ortensia'] = T.contorno()

# il mucchio di foglie: ruggine, ocra e sangue
T = Tela(16, 10, 180)
T.parte(lambda x, y: ((x - 8) / 7.2) ** 2 + ((y - 7.5) / 3.6) ** 2 <= 1 and y < 9.8, '765',
        trama=lambda x, y, ch: '3' if (x * 5 + y * 3) % 7 == 0 else '4' if ch == '5' and x % 3 == 0 else None)
for x, y in ((2, 9), (14, 9), (5, 3), (11, 4)):
    T.put(x, y, '6')
A['foglie'] = T.contorno()

QUI = os.path.dirname(__file__)
righe = ['# Le piccole cose della natura. Generato da minori_abbozzo.py.', '@tavolozza', PAL]
for k, T in A.items():
    righe.append(f'@sprite {k} {T.w}x{T.h}')
    righe += T.righe()
open(os.path.join(QUI, 'minori.pxs'), 'w').write('\n'.join(righe) + '\n')
print('scritto minori.pxs')
