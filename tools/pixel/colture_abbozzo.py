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
Q #c0baa8
v #5a5aa8
V #9a9ae0
y #7a8a5a
Y #b0bc78
n #8a2a5a"""

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


# =====================================================================================================
# LE ALTRE COLTURE. Ogni coltura è una funzione pianta(T, maturo): maturo=False disegna lo stadio 2 (cresciuta,
# senza frutti né fiori), maturo=True lo stadio 3. Gli stadi 0 e 1 sono la zolla coi semi e il germoglio.
# Le piante alte usano TelaAlta (16x32): si disegna con le stesse coordinate, la y parte da -8.
# =====================================================================================================
import math


class TelaAlta(Tela):
    def __init__(s, w, h, seme=0, oy=8):
        super().__init__(w, h, seme)
        s.oy = oy

    def put(s, x, y, ch, solo_vuoto=False):
        super().put(x, y + s.oy, ch, solo_vuoto)

    def get(s, x, y):
        return super().get(x, y + s.oy)

    def parte(s, dentro, ramp, luce=True, trama=None):
        oy = s.oy
        return super().parte(lambda x, y: dentro(x, y - oy), ramp, luce,
                             (lambda x, y, ch: trama(x, y - oy, ch)) if trama else None)

    def luna(s, scuri, chiaro='J', medio='j'):
        o, s.oy = s.oy, 0
        super().luna(scuri, chiaro, medio)
        s.oy = o

    def contorno(s):
        o, s.oy = s.oy, 0
        r = super().contorno()
        s.oy = o
        return r


def linea(T, x0, y0, x1, y1, ch):
    n = int(max(abs(x1 - x0), abs(y1 - y0))) + 1
    for i in range(n + 1):
        T.put(x0 + (x1 - x0) * i / n, y0 + (y1 - y0) * i / n, ch)


def lancia(T, x0, y0, x1, y1, larg, ramp, rib=None, trama=None):
    """una foglia lunga dalla base (x0,y0) alla punta (x1,y1), larga al centro"""
    L = math.hypot(x1 - x0, y1 - y0) or 1
    def dentro(px, py):
        t = ((px - x0) * (x1 - x0) + (py - y0) * (y1 - y0)) / (L * L)
        if t < 0 or t > 1:
            return False
        qx, qy = x0 + (x1 - x0) * t, y0 + (y1 - y0) * t
        return math.hypot(px - qx, py - qy) <= larg * (0.35 + 0.9 * math.sin(math.pi * min(1, t * 1.05)))
    T.parte(dentro, ramp, trama=trama)
    if rib:
        n = int(L)
        for i in range(1, n - 1):
            T.put(x0 + (x1 - x0) * i / n, y0 + (y1 - y0) * i / n, rib)


def bacca(T, x, y, col, ombra, luce=None):
    T.put(x, y, col); T.put(x + 1, y, col); T.put(x, y + 1, ombra); T.put(x + 1, y + 1, ombra)
    if luce:
        T.put(x, y, luce)


def frutto(T, cx, cy, rx, ry, ramp, picciolo='e'):
    T.ell(cx, cy, rx, ry, ramp)
    T.put(cx, cy - ry - .5, picciolo)


def ciuffo(T, cx, base, n, alto, ramp, apertura=6, seme=0):
    """tanti steli sottili che si aprono a ventaglio (carota, finocchio, grano, erba cipollina)"""
    for i in range(n):
        a = -apertura / 2 + apertura * i / max(1, n - 1)
        h = alto * (0.75 + 0.25 * ((i * 7 + seme) % 4) / 3)
        linea(T, cx, base, cx + a, base - h, ramp[i % len(ramp)])


def piume(T, cx, base, n, alto, apertura, stelo, foglia):
    """foglie piumate: steli con i ciuffetti di foglioline (carota, finocchio, pastinaca)"""
    for i in range(n):
        a = -apertura / 2 + apertura * i / max(1, n - 1)
        h = alto * (0.8 + 0.2 * (i % 3) / 2)
        x1, y1 = cx + a, base - h
        linea(T, cx, base, x1, y1, stelo)
        for k in (0.45, 0.7, 0.95):
            px, py = cx + a * k, base - h * k
            T.put(px - 1, py, foglia); T.put(px + 1, py - .5, foglia); T.put(px, py - 1, foglia)


def rosa(T, cy, n, lungo, larg, ramp, rib=None, apertura=150, base_y=20, trama=None):
    """rosetta di foglie che si aprono dalla corona"""
    for i in range(n):
        ang = math.radians(-90 - apertura / 2 + apertura * i / max(1, n - 1))
        x1, y1 = 8 + math.cos(ang) * lungo, base_y + math.sin(ang) * lungo * (cy / 10)
        lancia(T, 8, base_y, x1, y1, larg, ramp, rib, trama)


def nuovo(seme_n, alto=False):
    return TelaAlta(16, 32, seme_n) if alto else Tela(16, 24, seme_n)


CO = {}  # id → (pianta, colore del seme, germoglio tondo, verde del germoglio, alta)


def coltura(id, seme_col, tondo=False, verde='gfe', alto=False):
    def reg(f):
        CO[id] = (f, seme_col, tondo, verde, alto)
        return f
    return reg


bumpy = lambda x, y, ch: 'd' if (x * 3 + y * 5) % 7 == 0 and ch != 'g' else None


@coltura('fragola', '3')
def _(T, M):
    zolla(T)
    for cx, cy in ((4.5, 17.5), (11.5, 17.5), (8, 15.5), (6, 19), (10.5, 19)):
        foglia(T, cx, cy, 2.4, 1.8, 'gfe')
        T.put(cx, cy, 'd')
    for x, y in ((3, 14), (12, 14)):
        T.put(x, y, 'q'); T.put(x + 1, y, 'Q'); T.put(x, y + 1, 'Q'); T.put(x + 1, y + 1, '8')
    if M:
        for x, y in ((2, 19), (6, 21), (11, 20), (13, 18), (8, 20)):
            bacca(T, x, y, '3', '2', '8')


@coltura('pomodoro', 'h')
def _(T, M):
    zolla(T); paletto(T); rampicante(T, 5)
    if M:
        for cx, cy in ((4, 9), (12, 12), (4.5, 16), (12, 18), (8.5, 6)):
            frutto(T, cx, cy, 1.6, 1.5, '332')
            T.put(cx - .6, cy - .6, '8')
    else:
        for cx, cy in ((4, 10), (12, 15)):
            T.put(cx, cy, 'l'); T.put(cx + 1, cy, 'g')


@coltura('mais', '8', alto=True)
def _(T, M):
    zolla(T, 5)
    top = -6 if M else 2
    for x in (7, 9):
        stelo(T, x, 21, top + (x == 9) * 3, 'f')
    for (x1, y1, lato) in ((2, 6, -1), (14, 10, 1), (3, 15, -1), (13, 2, 1), (4, -1, -1)):
        if y1 > top:
            lancia(T, 8, y1 + 4, x1, y1, 1.3, 'gfe')
    if M:
        T.ell(11, 8, 1.6, 3.6, '876', trama=lambda x, y, ch: '7' if (x + y) % 2 else None)  # la pannocchia
        lancia(T, 9.5, 12, 12.5, 4, 1.2, 'lgf')  # le brattee
        for k in range(5):  # il pennacchio
            linea(T, 8, top, 8 + (k - 2) * 1.5, top - 2 - (k % 2), 'h')


@coltura('porro', 'Q')
def _(T, M):
    zolla(T, 4.6)
    alto = 12 if M else 15
    for y in range(alto, 22):
        T.put(7, y, 'q'); T.put(8, y, 'Q'); T.put(9, y, 'Q')
    for x1, y1 in ((2, alto - 7), (14, alto - 6), (5, alto - 10), (11, alto - 11)):
        lancia(T, 8, alto + 1, x1, y1, 1.6, 'uts', rib='s')


@coltura('carota', '6')
def _(T, M):
    zolla(T)
    piume(T, 8, 19, 5, 9 if M else 7, 9, 'f', 'g')
    if M:
        T.ell(8, 20, 2.6, 1.8, '765')
        T.put(7, 19, '8')


@coltura('lattuga', 'Y')
def _(T, M):
    zolla(T)
    r = 5.6 if M else 4.2
    T.ell(8, 21 - r * .55, r, r * .72, 'Yyf', trama=lambda x, y, ch: 'g' if (x * 5 + y * 3) % 7 == 0 else None)
    T.ell(8, 20 - r * .7, r * .5, r * .38, 'lYy')
    for k in range(-2, 3):
        T.put(8 + k * 2, 21 - r * .25, 'f')


@coltura('cipolla', 'W')
def _(T, M):
    zolla(T)
    for x1, y1 in ((4, 7 if not M else 10), (8, 5), (12, 8), (6, 6), (10, 7)):
        linea(T, 8, 19, x1, y1 + (5 if M else 0), 'g' if x1 % 4 else 'f')
    if M:
        T.ell(8, 19.5, 3.2, 2.6, '765')
        T.put(8, 22, 'W'); T.put(7, 18, '8')


@coltura('aglio', 'q')
def _(T, M):
    zolla(T)
    for x1, y1 in ((3, 9), (13, 10), (6, 6), (10, 5)):
        lancia(T, 8, 19, x1, y1 + (3 if M else 0), 0.9, 'gfe')
    if M:
        T.ell(8, 19.6, 3, 2.4, 'qQQ')
        for x in (7, 9):
            T.put(x, 19, 'h')


def cespuglio_frutti(T, M, frutti, fiore=None):
    zolla(T); stelo(T, 8, 21, 12, 'd')
    cespo(T, 12.5, 5.6)
    if M:
        for f in frutti:
            f(T)
    elif fiore:
        for x, y in ((5, 10), (11, 12)):
            T.put(x, y, fiore); T.put(x + 1, y, fiore); T.put(x, y + 1, '8')


@coltura('peperone', 'q')
def _(T, M):
    def bel(cx, cy, ramp):
        return lambda T: (T.ell(cx, cy, 1.8, 2.3, ramp), T.put(cx, cy - 2.6, 'e'), T.put(cx - .7, cy - 1, '9'))
    cespuglio_frutti(T, M, [bel(4, 15, '332'), bel(12, 16, '876'), bel(8, 18.5, '332')], 'q')


@coltura('melanzana', 'W')
def _(T, M):
    def mel(cx, cy):
        return lambda T: (T.ell(cx, cy, 1.5, 3, 'PpX'), T.ell(cx, cy - 2.6, 1.4, .8, 'gfe'), T.put(cx - .5, cy - 1, 'r'))
    cespuglio_frutti(T, M, [mel(4, 16), mel(12, 17), mel(8.5, 18.5)], 'P')


@coltura('anguria', 'X', tondo=True)
def _(T, M):
    zolla(T, 6.6); tralcio(T)
    if M:
        T.ell(8, 18.5, 6.4, 3.8, 'gfe',
              trama=lambda x, y, ch: 'd' if x % 3 == 0 else 'l' if ch == 'g' and x % 3 == 1 else None)
        T.put(4, 16, 'l'); T.put(5, 16, 'Y')
    else:
        T.ell(12, 19.2, 1.8, 1.4, 'gfe'); T.put(5, 13, '9'); T.put(6, 13, '8')


@coltura('barbabietola', '2')
def _(T, M):
    zolla(T)
    rosa(T, 9, 4, 9 if M else 7, 1.7, 'gfe', rib='2', base_y=18)
    if M:
        T.ell(8, 19.4, 3.4, 2.8, '321')
        T.put(7, 18, 'n'); T.put(8, 22.3, '2')


@coltura('spinaci', 'B')
def _(T, M):
    zolla(T)
    rosa(T, 8, 6, 7 if M else 5, 2.4, 'fed', rib='d', apertura=170, trama=bumpy)


@coltura('piselli', 'l', tondo=True)
def _(T, M):
    zolla(T); paletto(T); rampicante(T, 4 if M else 9)
    for x, y in ((3, 7), (13, 13)):
        T.put(x, y, 'q'); T.put(x + 1, y, 'r')
    if M:
        for x, y in ((2, 10), (14, 7), (2, 16), (14, 16)):
            for k in range(4):
                T.put(x + (k > 2) * (1 if x < 8 else -1), y + k, 'l' if k % 2 else 'Y')


@coltura('zucchina', 'q', tondo=True)
def _(T, M):
    zolla(T, 6.4)
    for cx, cy in ((4, 15), (12, 14.5), (8, 12), (5, 19), (11.5, 19)):
        foglia(T, cx, cy, 3, 2.3, 'gfe'); T.put(cx, cy, 'y'); T.put(cx + 1, cy - 1, 'y')
    T.ell(8, 9.5, 1.6, 1.4, '987')
    if M:
        for x0, y0 in ((2, 20), (10, 21)):
            for k in range(5):
                T.put(x0 + k, y0 - k * .3, 'e'); T.put(x0 + k, y0 + 1 - k * .3, 'd')
            T.put(x0 + 1, y0, 'g')


@coltura('girasole', 'K', alto=True)
def _(T, M):
    zolla(T, 4.4)
    top = -3 if M else 3
    stelo(T, 8, 21, top + 3, 'f'); stelo(T, 9, 21, top + 6, 'e')
    for x1, y1 in ((3, 10), (13, 7), (3, 16), (13, 14)):
        foglia(T, x1, y1, 2.8, 1.8, 'gfe'); linea(T, x1, y1, 8, y1 + 1, 'd')
    if M:
        T.ell(8, top, 5, 4.4, '987')
        for a in range(0, 360, 45):
            T.put(8 + math.cos(math.radians(a)) * 5.4, top + math.sin(math.radians(a)) * 4.8, '7')
        T.ell(8, top + .3, 2.6, 2.3, 'BbX', trama=lambda x, y, ch: 'w' if (x + y) % 3 == 0 else None)
    else:
        T.ell(8, top, 2.2, 2, 'gfe'); T.put(8, top - 1, 'l')


def spighe(T, M, maturo, verde, reste=False):
    zolla(T, 5)
    for i, x in enumerate((2, 5, 8, 11, 14)):
        h = (11 if M else 8) + (0, 2, 3, 1, 2)[i]
        piega = (x - 8) * 0.2
        col = maturo[1] if M else verde[1]
        linea(T, x, 21, x + piega, 21 - h, col)
        T.put(x + piega + (1 if x < 8 else -1), 21 - h * .5, verde[0] if not M else maturo[2])  # la foglia
        if M:
            for k in range(4):  # la spiga: chicchi a coppie
                T.put(x + piega, 20 - h - k, maturo[0] if k % 2 else maturo[1])
                T.put(x + piega + 1, 20 - h - k, maturo[2] if k % 2 else maturo[0])
            if reste:
                for k in range(3):
                    linea(T, x + piega + k * .5, 17 - h, x + piega + k - 1, 13 - h, 'h')
        else:
            T.put(x + piega, 20 - h, verde[0])


@coltura('grano', '8')
def _(T, M):
    spighe(T, M, '876', 'gfe')


@coltura('orzo', 'W')
def _(T, M):
    spighe(T, M, 'hWw', 'gfe', reste=True)


@coltura('mirtilli', 'v')
def _(T, M):
    zolla(T, 6)
    linea(T, 8, 21, 6, 14, 'w'); linea(T, 8, 21, 11, 13, 'w')
    T.ell(8, 13.5, 6.4, 5, 'fed', trama=bumpy)
    if M:
        for x, y in ((3, 13), (6, 11), (10, 10), (12, 14), (8, 15), (5, 16), (11, 17)):
            T.put(x, y, 'v'); T.put(x + 1, y, 'v'); T.put(x, y + 1, 'i'); T.put(x + 1, y + 1, 'i'); T.put(x, y, 'V')


@coltura('lavanda', 'p')
def _(T, M):
    zolla(T)
    T.ell(8, 18, 5.8, 3.4, 'yjf')
    for i, x in enumerate((3, 5, 7, 9, 11, 13)):
        h = 10 + (i % 3) * 2
        linea(T, x, 17, 8 + (x - 8) * 1.3, 17 - h, 'y')
        if M:
            for k in range(4):
                T.put(8 + (x - 8) * 1.3 + (k % 2) * .5, 17 - h + k, 'P' if k % 2 else 'r')


@coltura('cavolfiore', 'Q')
def _(T, M):
    zolla(T)
    rosa(T, 9, 6, 8, 1.9, 'yjf', rib='Q', apertura=180, base_y=19)
    if M:
        T.ell(8, 15.5, 3.8, 2.8, 'qQh', trama=lambda x, y, ch: 'Q' if (x + y * 2) % 4 == 0 else None)


@coltura('ravanello', '3')
def _(T, M):
    zolla(T)
    rosa(T, 9, 4, 6 if M else 5, 1.6, 'gfe', rib='d', base_y=18)
    if M:
        T.ell(8, 19.3, 2.4, 2.1, '332'); T.put(8, 21.6, 'q'); T.put(7, 18.5, 'n')


@coltura('basilico', 'X')
def _(T, M):
    zolla(T); stelo(T, 8, 21, 10, 'f')
    for cx, cy in ((5, 17), (11, 17), (5.5, 13), (10.5, 13), (8, 10)):
        foglia(T, cx, cy, 2.2, 1.6, 'lgf'); T.put(cx + 1, cy - 1, 'Y')
    if M:
        for x in (8, 5, 11):
            for k in range(3):
                T.put(x, 7 - k + (x != 8) * 3, 'q')


@coltura('prezzemolo', 'f')
def _(T, M):
    zolla(T)
    for cx, cy, r in ((5, 15, 2.2), (11, 15, 2.2), (8, 12, 2.4), (6.5, 10, 1.8), (10, 9.5, 1.8)):
        if not M and cy < 11:
            continue
        linea(T, 8, 20, cx, cy, 'f')
        T.disco(cx, cy, r, 'g'); T.put(cx, cy, 'l'); T.put(cx - 1, cy + 1, 'f'); T.put(cx + 1, cy - 1, 'l')


@coltura('salvia', 'B')
def _(T, M):
    zolla(T)
    for x1, y1 in ((3, 14), (13, 14), (5, 10), (11, 10), (8, 8)):
        lancia(T, 8, 19, x1, y1, 1.8, 'Yyj', rib='y')
    if M:
        for x in (4, 12):
            for k in range(4):
                T.put(x, 6 + k, 'v' if k % 2 else 'V')


@coltura('rosmarino', 'w')
def _(T, M):
    zolla(T)
    for i in range(11):
        x = 3 + i
        h = 7 + (i * 3) % 6
        linea(T, 8, 21, x, 21 - h - 2, 'w' if i % 4 == 0 else 'e')
        for k in range(1, int(h), 2):
            T.put(8 + (x - 8) * (k / h) + (k % 4 == 1) - .5, 21 - k - 2, 'f')
    if M:
        for x, y in ((4, 10), (9, 8), (12, 11), (6, 13), (11, 14)):
            T.put(x, y, 'V')


@coltura('fave', 'l', tondo=True)
def _(T, M):
    zolla(T)
    for x in (6, 10):
        stelo(T, x, 21, 6, 'f')
        for y in range(8, 20, 3):
            foglia(T, x + (-2 if (y // 3) % 2 else 2), y, 1.8, 1.1, 'yjf')
    if not M:
        T.put(6, 9, 'q'); T.put(7, 9, 'X'); T.put(10, 12, 'q'); T.put(11, 12, 'X')
    else:
        for x, y in ((3, 10), (12, 12), (4, 15), (13, 6)):
            for k in range(5):
                T.put(x + (k > 3), y + k, 'g' if k in (0, 4) else 'l')


@coltura('ceci', 'h')
def _(T, M):
    zolla(T)
    T.ell(8, 15, 6, 5, 'gfe', trama=lambda x, y, ch: 'y' if (x * 2 + y) % 4 == 0 else None)
    if M:
        for x, y in ((3, 14), (6, 11), (10, 12), (12, 16), (7, 17)):
            T.put(x, y, 'h'); T.put(x + 1, y, 'W'); T.put(x, y + 1, 'W')


@coltura('lenticchie', 'w')
def _(T, M):
    zolla(T)
    ciuffo(T, 8, 20, 9, 9, 'gfy', apertura=12)
    if M:
        for x, y in ((3, 12), (6, 11), (10, 10), (13, 12), (8, 13)):
            T.put(x, y, 'h'); T.put(x + 1, y, 'W')


@coltura('cetriolo', 'Q', tondo=True)
def _(T, M):
    zolla(T); paletto(T); rampicante(T, 6)
    T.put(3, 9, '9'); T.put(13, 12, '9')
    if M:
        for x, y in ((3, 13), (13, 15), (4, 18)):
            for k in range(5):
                T.put(x, y + k, 'f' if k % 2 else 'e'); T.put(x + 1, y + k, 'e')
            T.put(x, y + 1, 'l')


@coltura('finocchio', 'g')
def _(T, M):
    zolla(T)
    piume(T, 8, 17, 6, 11 if M else 8, 11, 'l', 'g')
    if M:
        T.ell(8, 18.3, 3.4, 2.7, 'qYy'); T.put(7, 17, 'q')
    else:
        T.ell(8, 19, 2, 1.6, 'Yyf')


@coltura('carciofo', 'j', alto=True)
def _(T, M):
    zolla(T, 6)
    for x1, y1 in ((1, 11), (15, 12), (3, 6), (13, 5)):
        lancia(T, 8, 20, x1, y1, 2, 'Juj', rib='j',
               trama=lambda x, y, ch: 'u' if (x + y) % 3 == 0 and ch == 'J' else None)
    if M:
        stelo(T, 8, 18, 0, 'y')
        T.ell(8, -2, 3, 3.4, 'yfe', trama=lambda x, y, ch: 'P' if (x + y) % 3 == 0 else None)
        T.put(8, -6, 'P'); T.put(7, -5, 'p')
    else:
        stelo(T, 8, 18, 8, 'y'); T.ell(8, 7, 1.6, 1.6, 'yfe')


@coltura('cavolocap', 'Y')
def _(T, M):
    zolla(T)
    rosa(T, 8, 5, 7, 2.2, 'yjf', rib='Y', apertura=180, base_y=20)
    r = 4.2 if M else 2.8
    T.ell(8, 18.5 - r * .5, r, r * .85, 'YyJ' if M else 'yfe',
          trama=lambda x, y, ch: 'y' if (x - 8) ** 2 + (y * 2 - 30) ** 2 in (9, 16) else None)
    T.put(7, 16 - r * .4, 'l')


@coltura('broccolo', 's')
def _(T, M):
    zolla(T)
    rosa(T, 9, 6, 8, 2, 'uts', rib='u', apertura=180, base_y=19)
    if M:
        T.ell(8, 14.5, 4, 3, 'gfe', trama=lambda x, y, ch: 'd' if (x * 3 + y * 2) % 5 == 0 else 'l' if (x + y) % 6 == 0 else None)
        stelo(T, 8, 19, 17, 'y')


@coltura('bietola', '3')
def _(T, M):
    zolla(T)
    for (x1, y1, gambo) in ((3, 9, '3'), (13, 9, '8'), (6, 6, 'q'), (10, 5, '3'), (8, 8, '8')):
        if not M and y1 < 7:
            continue
        linea(T, 8, 20, (8 + x1) / 2, (20 + y1) / 2 + 2, gambo)
        lancia(T, (8 + x1) / 2, (20 + y1) / 2 + 2, x1, y1, 2.1, 'fed', rib=gambo, trama=bumpy)


@coltura('rucola', 'h')
def _(T, M):
    zolla(T)
    rosa(T, 8, 6, 7, 1.2, 'gfe', apertura=170,
         trama=lambda x, y, ch: '.' if (x + y) % 5 == 0 and ch == 'g' else None)
    if M:
        for x, y in ((5, 9), (11, 8)):
            stelo(T, x, 15, y + 1, 'f'); T.put(x, y, 'q'); T.put(x + 1, y, 'Y')


@coltura('sedano', 'Y')
def _(T, M):
    zolla(T)
    for x, h in ((4, 8), (8, 10), (12, 8)):
        h += 2 if M else 0
        x1 = 8 + (x - 8) * 1.4
        linea(T, x, 21, x1, 21 - h, 'Y'); linea(T, x + 1, 21, x1 + 1, 21 - h, 'y')
        T.disco(x1 + .5, 21 - h - 1.5, 2, 'g'); T.put(x1, 21 - h - 2, 'l')


@coltura('zafferano', 'p')
def _(T, M):
    zolla(T, 4.6)
    ciuffo(T, 8, 20, 6, 8, 'gf', apertura=10)
    if M:
        for cx, cy in ((5, 14), (11, 13), (8, 11)):
            T.ell(cx, cy, 1.8, 2, 'rPp')
            T.put(cx, cy - 2.5, '3'); T.put(cx - 1, cy - 2.2, '3'); T.put(cx + 1, cy - 2.4, '2')


@coltura('topinambur', 'h', alto=True)
def _(T, M):
    zolla(T)
    for x, top in ((6, -2 if M else 6), (10, 0 if M else 8)):
        stelo(T, x, 21, top, 'f')
        for y in range(top + 3, 19, 4):
            lancia(T, x, y, x + (3 if (y // 4) % 2 else -3), y - 1, 1.1, 'gfe')
        if M:
            T.disco(x, top - 1, 1.8, '8'); T.put(x, top - 1, 'B')
    if M:
        T.ell(4, 21.5, 1.6, 1.1, 'hWw'); T.ell(12, 21.5, 1.6, 1.1, 'hWw')


@coltura('cicoria', 'f')
def _(T, M):
    zolla(T)
    rosa(T, 8, 6, 7, 1.6, 'fed', rib='d', apertura=170,
         trama=lambda x, y, ch: '.' if (x * 3 + y) % 6 == 0 and ch == 'f' else None)
    if M:
        stelo(T, 8, 18, 6, 'y')
        for x, y in ((8, 5), (6, 9), (10, 8), (7, 12)):
            T.put(x, y, 'V'); T.put(x + 1, y, 'v'); T.put(x, y + 1, 'v')


def fiorellini(T, M, petalo, cuore, punti):
    zolla(T)
    T.ell(8, 17, 6, 3.8, 'gfe', trama=bumpy)
    if M:
        for x, y in punti:
            for dx, dy in ((0, -1), (-1, 0), (1, 0), (0, 1)):
                T.put(x + dx, y + dy, petalo)
            T.put(x, y, cuore)


@coltura('calendula', '6')
def _(T, M):
    fiorellini(T, M, '7', '5', ((4, 14), (8, 12), (12, 14), (10, 17)))


@coltura('viola', 'P')
def _(T, M):
    fiorellini(T, M, 'P', '8', ((4, 15), (8, 13), (12, 15), (6, 18)))


@coltura('radicchio', '2')
def _(T, M):
    zolla(T)
    rosa(T, 8, 5, 6.5, 1.8, 'fed', apertura=180, base_y=20)
    r = 4.6 if M else 2.8
    T.ell(8, 19.5 - r * .6, r, r * .85, '21X' if M else 'fed')
    if M:
        for x, y in ((6, 16), (8, 15), (10, 16), (7, 18), (9, 18)):
            T.put(x, y, 'q')
        T.put(7, 14, '3')


@coltura('cavolonero', 's', verde='tsi')
def _(T, M):
    zolla(T)
    if M:
        stelo(T, 8, 21, 17, 'f')
        for x1, y1, l in ((1, 9, 1.6), (15, 9, 1.6), (4, 3, 1.8), (12, 3, 1.8), (8, 1, 1.7)):
            foglione(T, 8, 19, x1, y1, l)
    else:
        for x1, y1 in ((3, 11), (13, 11), (8, 8)):
            foglione(T, 8, 20, x1, y1, 1.5)


@coltura('pastinaca', 'q')
def _(T, M):
    zolla(T)
    for x1, y1 in ((3, 9), (13, 9), (8, 6)):
        linea(T, 8, 19, x1, y1 + (3 if not M else 0), 'f')
        foglia(T, x1, y1 + (3 if not M else 0), 2, 1.5, 'yfe')
        foglia(T, (8 + x1) / 2, (19 + y1) / 2 + 1, 1.6, 1.2, 'yfe')
    if M:
        T.ell(8, 20, 2.8, 2, 'qQh'); T.put(8, 22.4, 'Q')


@coltura('rabarbaro', '2')
def _(T, M):
    zolla(T, 6)
    for x1, y1 in ((3, 11), (13, 11), (8, 8)):
        if M or y1 > 9:
            linea(T, 8, 20, x1, y1 + 3, '3'); linea(T, 8.6, 20, x1 + .6, y1 + 3, '2')
            T.ell(x1, y1, 3.6 if M else 2.6, 2.6 if M else 1.9, 'gfe', trama=bumpy)


@coltura('fagiolini', 'w', tondo=True)
def _(T, M):
    zolla(T); paletto(T); rampicante(T, 3 if M else 8)
    T.put(3, 6, 'P'); T.put(13, 10, 'r')
    if M:
        for x, y in ((2, 8), (14, 12), (2, 14), (14, 17), (13, 4)):
            for k in range(6):
                T.put(x + (k > 4) * (1 if x < 8 else -1), y + k, 'l' if k % 2 else 'g')


@coltura('peperoncino', '3')
def _(T, M):
    def pod(x, y, col):
        return lambda T: [T.put(x, y + k, col if k else 'e') for k in range(4)] + [T.put(x + 1, y + 3, col)]
    cespuglio_frutti(T, M, [pod(2, 13, '3'), pod(5, 16, '3'), pod(13, 13, '6'), pod(11, 16, '3'), pod(14, 9, '3')], 'q')


@coltura('erbacipollina', 'X')
def _(T, M):
    zolla(T, 5)
    ciuffo(T, 8, 20, 13, 11 if M else 8, 'gfg', apertura=11)
    if M:
        for x, y in ((4, 9), (9, 7), (12, 10)):
            T.disco(x, y, 1.4, 'P'); T.put(x, y - 1, 'r')


for id, (f, col, tondo, verde, alto) in CO.items():
    A[id + '0'] = seme(col, sum(map(ord, id)) % 97)
    A[id + '1'] = germoglio(sum(map(ord, id)) % 89, tondo=tondo, verde=verde)
    for st, M in ((2, False), (3, True)):
        T = nuovo(sum(map(ord, id)) % 83 + st, alto)
        f(T, M)
        A[id + str(st)] = finisci(T, scuri='defgbBkKtsiyjuJYl')

QUI = os.path.dirname(__file__)
righe = ["# Le colture dell'orto. Generato da colture_abbozzo.py.", '@tavolozza', PAL]
for k, T in A.items():
    righe.append(f'@sprite {k} {T.w}x{T.h}')
    righe += T.righe()
open(os.path.join(QUI, 'colture.pxs'), 'w').write('\n'.join(righe) + '\n')
print('scritto colture.pxs')
