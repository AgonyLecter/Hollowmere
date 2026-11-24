#!/usr/bin/env python3
"""Le colture dell'orto disegnate a mano, alla grana dell'Albero dei Morti: 16x24, un pixel per unità di gioco
(la misura delle vecchie, che erano 32x48 a 2x). Ogni coltura ha i suoi 4 stadi (seme nella zolla, germoglio,
cresciuta, matura); in più la pianta secca e la zucca intagliata della notte delle streghe.
Scrive colture.pxs; poi:
    python3 tools/pixel/studio.py tools/pixel/colture.pxs --js js/colture_mano.js --nome COLTURE_MANO
"""
import os
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
l #7e8a48
i #24242c
s #2a3440
t #3e5a6e
u #6a8494
p #4a2a48
P #74447a
r #a884b0
q #e8dcc0
Q #c0baa8"""

W_, H_ = 16, 24
A = {}


def tela(seme):
    return Tela(W_, H_, seme)


def zolla(T, larga=5.6):
    """la terra smossa ai piedi della pianta"""
    T.ell(8, 21.6, larga, 1.9, 'BbX', luce=True)
    T.put(5, 21, 'w'); T.put(10, 21, 'w'); T.put(7, 22, 'X')


def finisci(T, scuri='defgbBkK'):
    T.luna(scuri, chiaro='l', medio='g')
    return T.contorno()


def seme(col, seme_n):
    """stadio 0: la zolla rimossa coi semi che affiorano"""
    T = tela(seme_n)
    T.ell(8, 21, 5.8, 2.4, 'wBb')
    for x, y in ((6, 20), (10, 20), (8, 21)):
        T.put(x, y, col)
    T.put(4, 21, 'X'); T.put(12, 21, 'X'); T.put(9, 19, 'B')
    T.luna('wBb', chiaro='W', medio='w')
    return T.contorno()


def stelo(T, x, y0, y1, ch='e'):
    for y in range(y1, y0 + 1):
        T.put(x, y, ch)


def foglia(T, cx, cy, rx, ry, ramp='gfe', nervo=None):
    T.ell(cx, cy, rx, ry, ramp)
    if nervo:
        for k in range(-int(rx) + 1, int(rx)):
            T.put(cx + k, cy + (0.4 if k % 2 else 0), nervo)


def germoglio(seme_n, tondo=False, verde='gfe'):
    """stadio 1: lo stelo e le prime due foglie"""
    T = tela(seme_n)
    zolla(T, 4.4)
    stelo(T, 8, 20, 15)
    if tondo:  # cotiledoni grossi e tondi (zucca, fagioli)
        foglia(T, 4.6, 14.6, 2.3, 1.7, verde)
        foglia(T, 11.4, 14.1, 2.3, 1.7, verde)
        stelo(T, 8, 16, 13, verde[2])
    else:
        T.poli([(8, 16), (3, 13), (4, 15.5)], verde)
        T.poli([(8, 15), (13, 12), (12, 14.6)], verde)
    T.put(8, 14, 'f')
    return finisci(T)


# ---------- rapa: la rosetta, poi la radice viola e bianca che spunta ----------
def rosetta(T, alto, ramp='gfe', base=19):
    # foglie a lancia che si aprono a ventaglio dalla corona, col margine frastagliato
    for (x1, y1) in ((2, alto + 4), (14, alto + 4), (5, alto), (11, alto), (8, alto - 2)):
        T.poli([(8 - 1.2, base), (x1 - 1.8, y1 + 1.5), (x1, y1 - 1), (x1 + 1.8, y1 + 1.5), (8 + 1.2, base)], ramp,
               trama=lambda x, y, ch: 'd' if (x + y * 2) % 7 == 0 else None)
    for (x1, y1) in ((2, alto + 4), (14, alto + 4), (5, alto), (11, alto), (8, alto - 2)):
        for k in range(1, 6):
            T.put(x1 + (8 - x1) * k / 7, y1 + (base - y1) * k / 7, 'd')  # la nervatura


A['rapa0'] = seme('r', 1)
A['rapa1'] = germoglio(2)
T = tela(3); zolla(T); rosetta(T, 13)
A['rapa2'] = finisci(T)
T = tela(4)
zolla(T)
rosetta(T, 8, base=16)
T.ell(8, 18.6, 4.4, 3.6, 'rPp')          # la spalla viola della radice
T.parte(lambda x, y: ((x - 8) / 4.4) ** 2 + ((y - 18.6) / 3.6) ** 2 <= 1 and y > 19.6, 'QQq', luce=False)  # bianca sotto
T.put(6, 17, 'r'); T.put(5, 18, 'r'); T.put(8, 22, 'Q'); T.put(8, 23, 'Q')  # luce e il codino
T.put(6, 15, 'e'); T.put(8, 14.6, 'e'); T.put(10, 15, 'e')
A['rapa3'] = finisci(T)

# ---------- patata: il cespo, poi i fiori bianchi e i tuberi che affiorano ----------
def cespo(T, cy, larg, ramp='gfe'):
    T.ell(8, cy, larg, larg * .78, ramp,
          trama=lambda x, y, ch: 'd' if (x * 3 + y * 5) % 6 == 0 and ch != 'g' else None)
    for x, y in ((8 - larg, cy + 1), (8 + larg - 1, cy + 1), (5, cy - larg * .7), (11, cy - larg * .6)):
        T.put(x, y, 'f')


A['patata0'] = seme('h', 5)
A['patata1'] = germoglio(6)
T = tela(7); zolla(T); stelo(T, 8, 20, 16, 'd'); cespo(T, 14.5, 4.6)
A['patata2'] = finisci(T)
T = tela(8)
zolla(T, 6.2)
stelo(T, 7, 20, 16, 'd'); stelo(T, 9, 20, 16, 'd')
cespo(T, 12.5, 6)
for x, y in ((5, 9), (9, 8), (12, 11), (7, 12)):  # fiori pallidi col cuore giallo
    T.put(x, y, 'q'); T.put(x + 1, y, 'Q'); T.put(x, y + 1, 'Q'); T.put(x + 1, y + 1, '8')
for cx, cy in ((4.5, 21), (11.5, 21.3), (8, 22.3)):  # i tuberi
    T.ell(cx, cy, 1.9, 1.3, 'hWw')
A['patata3'] = finisci(T)

# ---------- zucca: i tralci col fiore, poi la zucca a coste ----------
def tralcio(T):
    for k in range(12):
        T.put(2 + k, 19 + (k % 5 == 2) - (k > 8), 'e')
    for cx, cy in ((4, 16.5), (11.5, 16), (8, 14.5)):
        foglia(T, cx, cy, 2.8, 2.2, 'gfe')
        T.put(cx, cy, 'd')
    T.put(1, 18, 'f'); T.put(14, 17, 'f')  # i viticci


def zucca(T, faccia=False):
    T.ell(8, 18.2, 7, 4.6, '765',
          trama=lambda x, y, ch: ('6' if ch == '7' else '4') if x in (4, 7, 10, 13) else None)
    T.put(3, 16, '8'); T.put(7, 15, '8'); T.put(11, 15, '8')
    T.poli([(7, 13), (9, 12), (9.6, 14.5), (7.4, 14.6)], 'wBb')  # il picciolo
    T.put(10, 11, 'e'); T.put(11, 11, 'f'); T.put(12, 12, 'e')  # il ricciolo del tralcio
    T.ell(13.5, 13, 2, 1.5, 'gfe')
    if faccia:
        for x0 in (4, 10):  # occhi triangolari che ardono
            T.put(x0 + 1, 16, '8')
            for x in range(x0, x0 + 3):
                T.put(x, 17, '9')
        T.put(8, 18, '8')  # il naso
        for x in range(4, 13):  # la bocca, coi denti rimasti
            T.put(x, 20, '9')
            if x not in (6, 10):
                T.put(x, 19, '9' if 5 <= x <= 11 else '8')
        T.put(8, 21, '8'); T.put(5, 21, '8'); T.put(11, 21, '8')


A['zucca0'] = seme('q', 9)
A['zucca1'] = germoglio(10, tondo=True)
T = tela(11); zolla(T, 6); tralcio(T)
T.ell(8, 11.5, 2, 1.7, '987'); T.put(8, 11, '6'); T.put(8, 13, 'e')  # il fiore giallo
T.ell(12, 19.3, 1.6, 1.2, 'gfe')  # una zucchetta acerba
A['zucca2'] = finisci(T)
T = tela(12); zolla(T, 7); zucca(T)
A['zucca3'] = finisci(T, scuri='defgbBkK7')
T = tela(12); zolla(T, 7); zucca(T, faccia=True)
A['zuccaFace'] = finisci(T, scuri='defgbBkK7')

# ---------- fagioli: il paletto, il rampicante, i baccelli appesi ----------
def paletto(T):
    for y in range(2, 22):
        T.put(8, y, 'W' if y % 6 else 'h'); T.put(9, y, 'w')
    T.put(8, 1, 'h')  # punta spaccata
    T.put(7, 9, 'B'); T.put(10, 15, 'B')  # nodi dello spago


def rampicante(T, fino):
    for y in range(21, fino, -1):  # gira attorno al paletto
        x = 7 if (y // 2) % 2 else 10
        T.put(x, y, 'e')
    for y in range(fino + 1, 21, 3):
        lato = -1 if (y // 3) % 2 else 1
        foglia(T, 8.5 + lato * 3.4, y, 2.2, 1.6, 'gfe')


A['fagioli0'] = seme('3', 13)
A['fagioli1'] = germoglio(14, tondo=True)
T = tela(15); zolla(T); paletto(T); rampicante(T, 9)
A['fagioli2'] = finisci(T, scuri='defgbBkKW')
T = tela(16); zolla(T); paletto(T); rampicante(T, 3)
for x, y, col in ((2, 6, 'l'), (14, 9, 'P'), (2, 12, 'l'), (14, 15, 'l'), (13, 3, 'l')):  # i baccelli appesi, fuori dalle foglie
    T.put(x + (1 if x < 8 else -1), y - 1, 'e')
    for k in range(5):
        T.put(x + (k > 3) * (1 if x > 8 else -1), y + k, '8' if k == 1 and col == 'l' else col if k < 4 else 'g' if col == 'l' else 'p')
A['fagioli3'] = finisci(T, scuri='defgbBkKW')

# ---------- cavolo nero: foglie lunghe, strette, bollose, blu-nere ----------
def foglione(T, x0, y0, x1, y1, larg=1.6):
    """una foglia lunga di cavolo nero: bolle chiare sul blu-nero, la costola pallida"""
    import math
    L = math.hypot(x1 - x0, y1 - y0)
    def dentro(px, py):
        t = ((px - x0) * (x1 - x0) + (py - y0) * (y1 - y0)) / (L * L)
        if t < 0 or t > 1:
            return False
        qx, qy = x0 + (x1 - x0) * t, y0 + (y1 - y0) * t
        return math.hypot(px - qx, py - qy) <= larg * (0.55 + 0.9 * math.sin(math.pi * min(1, t * 1.1)))
    T.parte(dentro, 'tsi', trama=lambda x, y, ch: 't' if (x * 2 + y * 3) % 7 == 0 and ch == 's' else None)
    n = int(L)
    for i in range(1, n - 1):
        T.put(x0 + (x1 - x0) * i / n, y0 + (y1 - y0) * i / n, 'j' if i < n / 2 else 's')


A['cavolo0'] = seme('s', 17)
A['cavolo1'] = germoglio(18, verde='tsi')
T = tela(19); zolla(T)
for x1, y1 in ((3, 11), (13, 11), (8, 8)):
    foglione(T, 8, 20, x1, y1, 1.5)
A['cavolo2'] = finisci(T, scuri='defgbBkKtsi')
T = tela(20); zolla(T)
stelo(T, 8, 21, 17, 'f')
for x1, y1, l in ((1, 9, 1.6), (15, 9, 1.6), (4, 3, 1.8), (12, 3, 1.8), (8, 1, 1.7)):
    foglione(T, 8, 19, x1, y1, l)
A['cavolo3'] = finisci(T, scuri='defgbBkKtsi')

# ---------- la pianta secca: steli spezzati e foglie accartocciate ----------
T = tela(21); zolla(T, 4.6)
for (x0, y0, x1, y1) in ((8, 20, 5, 12), (8, 20, 11, 13), (8, 20, 8, 14)):
    n = 10
    for i in range(n + 1):
        T.put(x0 + (x1 - x0) * i / n, y0 + (y1 - y0) * i / n, 'w')
T.ell(4, 12, 1.8, 1, 'W4b'); T.ell(12, 14, 1.8, 1, 'Wwb'); T.put(9, 13, '4'); T.put(10, 12, 'B')
T.ell(6, 19.6, 1.6, .9, '54b')  # una foglia caduta
A['secca'] = finisci(T, scuri='bBw')

QUI = os.path.dirname(__file__)
righe = ["# Le colture dell'orto. Generato da colture_abbozzo.py.", '@tavolozza', PAL]
for k, T in A.items():
    righe.append(f'@sprite {k} {T.w}x{T.h}')
    righe += T.righe()
open(os.path.join(QUI, 'colture.pxs'), 'w').write('\n'.join(righe) + '\n')
print('scritto colture.pxs')
