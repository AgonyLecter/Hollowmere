#!/usr/bin/env python3
"""La fauna di Hollowmere disegnata a mano, alla grana dell'Albero dei Morti, di profilo verso destra (il gioco la
specchia): il corvo dall'occhio rosso (posato, due battiti d'ala), il coniglio grigio-bruno (fermo, due salti),
la volpe rossa (quattro passi di trotto, seduta con la coda che si muove), il gufo reale (di fronte: guarda,
sbatte gli occhi, gira la testa), il pipistrello (di fronte, tre posizioni delle ali), il cervo nero dalle corna
enormi (fermo, che bruca, quattro di corsa).
Scrive fauna.pxs; poi:
    python3 tools/pixel/studio.py tools/pixel/fauna.pxs --js js/fauna_mano.js --nome FAUNA_MANO
"""
import os, math
from tela import Tela

PAL = """o #07050a
X #0e090c
K #1c1418
k #2a1e24
c #3a2a30
v #3a3a5a
J #8aa0a8
j #5a6a74
R #d8302a
r #7c1512
B #6a5a4a
b #4a3a2e
L #8a7a68
W #d8ccb4
i #a87a7a
F #b0521e
f #7a3414
h #d8803a
U #4a3e30
u #8a7a5e
O #6a5a44
w #c8b898
Y #f0c030
y #c8a040
D #5a3a24
d #3a2416
H #7a5434
A #c0b090
a #7a6a50
m #2a1e24"""

A = {}


def zampa(T, x0, y0, x1, y1, ch, spess=1):
    n = int(max(abs(x1 - x0), abs(y1 - y0))) + 1
    for k in range(n + 1):
        t = k / n
        for d in range(spess):
            T.put(x0 + (x1 - x0) * t + d, y0 + (y1 - y0) * t, ch)


def finisci(T, scuri):
    T.luna(scuri, chiaro='J', medio='j')
    return T.contorno()


# ---------------------------------------------------------------- corvo 13x11: 0 posato, 1-2 in volo
def corvo(f):
    T = Tela(13, 11, 1)
    if f == 0:
        zampa(T, 5, 8, 5, 10, 'X'); zampa(T, 7, 8, 7, 10, 'X')
        T.poli([(0, 6), (3, 4.5), (3, 7.5)], ('c', 'K', 'X'))  # la coda a ventaglio
        T.ell(6, 6, 3.6, 2.6, ('v', 'K', 'X'))  # il corpo, riflessi blu-viola
        T.poli([(4, 5), (8, 4.5), (7, 7.5), (3, 7.5)], ('c', 'k', 'X'))  # l'ala chiusa
        T.ell(9.5, 3.5, 2, 1.9, ('v', 'K', 'X'))  # la testa
        T.poli([(11, 2.8), (13, 3.8), (11, 4.6)], ('c', 'k', 'X'))  # il becco forte
        T.put(10, 3, 'R')  # l'occhio rosso
    else:
        su = f == 1
        T.ell(6, 6, 3.4, 1.8, ('v', 'K', 'X'))
        T.poli([(0, 5.5), (3, 5), (3, 7)], ('c', 'K', 'X'))
        T.ell(9.5, 5, 1.8, 1.6, ('v', 'K', 'X'))
        T.poli([(11, 4.4), (13, 5), (11, 5.8)], ('c', 'k', 'X'))
        T.put(10, 4.6, 'R')
        # le ali: due "dita" di penne, su o giù
        for k in range(5):
            y = 5 - k * 1.1 if su else 6 + k * .9
            T.put(5 + k * .6, y, 'K'); T.put(6 + k * .6, y, 'k'); T.put(7 + k * .5, y + (.6 if su else -.6), 'X')
        T.put(7.5, 0 if su else 10, 'K')
    return finisci(T, 'Kkcv')


for f in range(3):
    A[f'corvo{f}'] = corvo(f)


# ---------------------------------------------------------------- coniglio 13x11: 0 fermo, 1-2 salto
def coniglio(f):
    T = Tela(13, 11, 2)
    su = {0: 0, 1: -2, 2: -1}[f]
    allunga = 2 if f == 1 else 0
    # le zampe posteriori lunghe, le anteriori piccole
    if f == 0:
        T.ell(4.5, 9, 2.6, 1.3, ('L', 'B', 'b'))
        zampa(T, 8, 8, 8, 10, 'b')
    else:
        zampa(T, 2, 7 + su, 0, 9 + su, 'b', 2)
        zampa(T, 9 + allunga, 8 + su, 10 + allunga, 10 + su, 'B')
    T.ell(5.5 - allunga * .3, 7 + su, 4 + allunga * .5, 2.8, ('L', 'B', 'b'))  # il corpo
    T.ell(1.5, 6.5 + su, 1.2, 1.2, ('W', 'W', 'L'))  # la coda bianca
    T.ell(9 + allunga * .5, 4.6 + su, 2.2, 2, ('L', 'B', 'b'))  # la testa
    for dx in (0, 1.2):  # le orecchie lunghe, all'indietro
        T.poli([(7.6 + dx + allunga * .5, 3.6 + su), (6 + dx + allunga * .5, -1 + su + (2 if f else 0)),
                (8 + dx + allunga * .5, 2.6 + su)], ('L', 'B', 'b'))
    T.put(7.6 + allunga * .5, 1.6 + su, 'i')
    T.put(10 + allunga * .5, 4 + su, 'X')  # l'occhio, nero e lucido
    T.put(11 + allunga * .5, 5 + su, 'i')  # il naso
    return finisci(T, 'LBb')


for f in range(3):
    A[f'coniglio{f}'] = coniglio(f)


# ---------------------------------------------------------------- volpe 18x13: passo 0-3, seduta 0-1
def volpe(f, seduta=False):
    T = Tela(18, 13, 3)
    if seduta:
        cs = f  # la coda che si muove
        for k in range(9):
            t = k / 8
            T.disco(3 + t * 6, 11.5 - math.sin(t * 2.6) * (1.5 + cs), 1.6 - t * .6, 'F')
        T.ell(3.2 + cs * .3, 11.5 - 1.5 - cs, 1, 1, ('W', 'W', 'W'))
        T.ell(8, 8.5, 3.6, 3.6, ('h', 'F', 'f'))
        T.poli([(8, 5), (12, 3.5), (13, 7), (12, 12), (9, 12)], ('h', 'F', 'f'))
        zampa(T, 11, 8, 11, 12, 'K'); zampa(T, 12.5, 8, 12.5, 12, 'K')
        T.ell(12.2, 7.5, 1.3, 2, ('W', 'W', 'w'))
        hx, hy = 13, 3.5
    else:
        ph = f * math.pi / 2
        for lx, lontana, s in ((4, 1, 0), (5.5, 0, math.pi), (11, 1, math.pi), (12.5, 0, 0)):
            dx = math.sin(ph + s) * 1.5
            zampa(T, lx, 8, lx + dx, 12, 'K' if not lontana else 'X')
        # la coda folta, orizzontale, la punta bianca
        for k in range(8):
            t = k / 7
            T.disco(3.5 - t * 3.5, 6 + t * 1.5 + math.sin(ph) * .5, 1.8 - t * .5, 'F')
        T.ell(0.6, 7.6, 1.1, 1, ('W', 'W', 'W'))
        T.poli([(3, 6), (8, 5), (13, 4.5), (14, 8), (11, 9.5), (4, 9)], ('h', 'F', 'f'))
        T.ell(13, 7.6, 1.4, 1.6, ('W', 'W', 'w'))
        hx, hy = 14.5, 3.6
    # la testa: le orecchie a punta nere dentro, il muso lungo, la punta nera del naso
    T.ell(hx, hy + .4, 2, 1.8, ('h', 'F', 'f'))
    T.poli([(hx + 1, hy + .2), (hx + 3.6, hy + 1.2), (hx + 1, hy + 2.2)], ('h', 'F', 'W'))
    T.put(hx + 3.4, hy + 1, 'X')
    for ox in (-1, .4):
        T.poli([(hx + ox - .8, hy - .8), (hx + ox, hy - 3.4), (hx + ox + .9, hy - .8)], ('F', 'F', 'f'))
        T.put(hx + ox, hy - 1.6, 'X')
    T.put(hx + .8, hy, 'Y')  # l'occhio giallo
    T.put(hx + 1.4, hy + 1.6, 'W')
    return finisci(T, 'hFf')


for f in range(4):
    A[f'volpe_passo{f}'] = volpe(f)
for f in range(2):
    A[f'volpe_fermo{f}'] = volpe(f, seduta=True)


# ---------------------------------------------------------------- gufo 12x14, di fronte: 0 guarda, 1 occhi chiusi, 2 testa girata
def gufo(k):
    T = Tela(13, 15, 4)
    T.parte(lambda x, y: ((x - 6.5) / 4) ** 2 + ((y - 10) / 4.4) ** 2 <= 1, ('u', 'O', 'U'))  # il corpo a goccia
    for y in range(8, 14, 2):  # le penne a scaglie sul petto
        for x in range(5, 9, 2):
            T.put(x + (y // 2) % 2, y, 'U')
    T.poli([(2.4, 4), (2, 0.6), (4.6, 3)], ('u', 'O', 'U'))  # i ciuffi
    T.poli([(10.6, 4), (11, 0.6), (8.4, 3)], ('u', 'O', 'U'))
    T.ell(6.5, 5.4, 3.8, 3, ('u', 'O', 'U'))  # la testa larga
    if k == 2:
        T.ell(8, 5.4, 1.8, 1.8, ('w', 'w', 'u'))
        T.put(8, 5.2, 'Y'); T.put(9, 5.2, 'X')
        T.put(5, 5, 'U')
    else:
        for ex in (4.8, 8.2):
            T.ell(ex, 5.4, 1.7, 1.7, ('w', 'w', 'u'))  # i dischi facciali
            if k == 1:
                T.put(ex - .5, 5.4, 'U'); T.put(ex + .5, 5.4, 'U')
            else:
                T.put(ex - .5, 5.2, 'Y'); T.put(ex + .5, 5.2, 'Y'); T.put(ex, 5.8, 'X')
        T.put(6.5, 6.4, 'y'); T.put(6.5, 7.2, 'y')  # il becco
    T.put(5, 14, 'y'); T.put(8, 14, 'y')
    return finisci(T, 'uOU')


for k in range(3):
    A[f'gufo{k}'] = gufo(k)


# ---------------------------------------------------------------- pipistrello 15x8, di fronte: ali su, in mezzo, giù
def pipistrello(k):
    T = Tela(17, 9, 5)
    yb = {0: 0.4, 1: 3.2, 2: 5.6}[k]  # dove sta il polso: ali su, distese, giù
    yt = {0: 1.4, 1: 3.6, 2: 8.4}[k]  # la punta
    for s in (-1, 1):
        cx = 8.5
        pts = [(cx + s * 1.2, 3.4), (cx + s * 4.2, yb), (cx + s * 8.2, yt)]
        # il bordo di sotto smerlato, tra le dita
        for t, h in ((.8, 1.8), (.62, .6), (.45, 1.6), (.28, .5)):
            pts.append((cx + s * 8 * t, max(yb, yt) * t + 4.6 * (1 - t) + h))
        pts.append((cx + s * 1.2, 6))
        T.poli(pts, ('k', 'm', 'X'))
        for t in (.5, .8):  # le dita delle ali
            T.put(cx + s * 8 * t, yb + (yt - yb) * (t - .5) * 2 if t > .5 else yb + .6, 'K')
    T.ell(8.5, 4.6, 1.6, 2.2, ('c', 'K', 'X'))
    T.put(7.5, 2, 'K'); T.put(9.5, 2, 'K')  # le orecchie
    T.put(8, 4, 'R'); T.put(9, 4, 'R')  # gli occhi rossi
    return finisci(T, 'Kkcm')


for k in range(3):
    A[f'pipistrello{k}'] = pipistrello(k)


# ---------------------------------------------------------------- cervo 22x26: 0 fermo, 1 bruca, 2-5 corsa
def cervo(f):
    T = Tela(24, 26, 6)
    bruca = f == 1
    corsa = f >= 2
    ph = (f - 2) * math.pi / 2
    for lx, lontana, s in ((5, 1, 0), (7, 0, math.pi), (14, 1, math.pi), (16, 0, 0)):
        if corsa:
            dx = math.sin(ph + s) * 2.6
            zampa(T, lx, 16, lx + dx, 24 - abs(math.cos(ph + s)) * 1.5, 'd' if lontana else 'D', 1 if lontana else 2)
        else:
            zampa(T, lx, 16, lx, 24, 'd' if lontana else 'D', 1 if lontana else 2)
            T.put(lx, 24, 'X'); T.put(lx + 1, 24, 'X' if not lontana else '.')
    alza = -1 if corsa and f % 2 else 0
    T.parte(lambda x, y: ((x - 10.5) / 8) ** 2 + ((y - 13.8 - alza) / 3.4) ** 2 <= 1, ('H', 'D', 'd'))  # il corpo
    T.ell(16.5, 12.6 + alza, 2.6, 3, ('H', 'D', 'd'))  # il petto
    T.ell(5, 13 + alza, 2.8, 3.2, ('H', 'D', 'd'))  # la groppa
    T.put(3, 12 + alza, 'W'); T.put(2.5, 13 + alza, 'W')  # la coda chiara
    for x in range(6, 15):
        T.put(x, 16 + alza, 'd')  # il ventre in ombra
    if bruca:
        # il collo che scende, la testa nell'erba
        T.poli([(16, 11), (18.4, 11), (20.6, 21), (18.6, 22)], ('H', 'D', 'd'))
        hx, hy = 20, 21.5
    else:
        T.poli([(16, 11 + alza), (18.6, 10 + alza), (19.6, 5 + alza), (17.6, 4.6 + alza)], ('H', 'D', 'd'))
        hx, hy = 19.4, 4.6 + alza
    T.ell(hx, hy, 2, 1.6, ('H', 'D', 'd'))
    T.poli([(hx + 1, hy - .6), (hx + 3, hy + .4), (hx + 2.6, hy + 1.4), (hx + .6, hy + 1.2)], ('H', 'D', 'd'))
    T.put(hx + 2.8, hy + .4, 'X')
    T.put(hx + .4, hy - .4, 'X')  # l'occhio scuro
    T.put(hx - 1, hy - 1.2, 'D'); T.put(hx - 1.6, hy - 1.8, 'd')  # l'orecchio
    # le corna enormi, ramificate come i rami dell'Albero: sopra la testa serve spazio, la tela cresce di 8 righe
    T2 = Tela(24, 34, 6)
    T2.G = [['.'] * 24 for _ in range(8)] + T.G
    T, hy = T2, hy + 8
    if not bruca:
        bx, by = hx - .4, hy - 1.4
        for s, ang0 in ((1, -.55), (-1, -2.6)):
            x, y, ang = bx, by, ang0
            for k in range(10):
                ang += (-math.pi / 2 - ang) * .16  # i rami si piegano verso l'alto
                x += math.cos(ang) * 1.05
                y += math.sin(ang) * 1.05
                T.put(x, y, 'A' if k < 5 else 'a')
                if k in (2, 5, 8):  # le punte, dritte verso l'alto
                    T.put(x, y - 1, 'a'); T.put(x + .3 * s, y - 2, 'a')
    else:
        T.put(hx - .6, hy - 2, 'a'); T.put(hx - 1.4, hy - 3, 'a')
    return finisci(T, 'HDd')


A['cervo_fermo'] = cervo(0)
A['cervo_bruca'] = cervo(1)
for f in range(4):
    A[f'cervo_corsa{f}'] = cervo(2 + f)

QUI = os.path.dirname(__file__)
righe = ['# La fauna. Generato da fauna_abbozzo.py.', '@tavolozza', PAL]
for k, T in A.items():
    righe.append(f'@sprite {k} {T.w}x{T.h}')
    righe += T.righe()
open(os.path.join(QUI, 'fauna.pxs'), 'w').write('\n'.join(righe) + '\n')
print('scritto fauna.pxs')
