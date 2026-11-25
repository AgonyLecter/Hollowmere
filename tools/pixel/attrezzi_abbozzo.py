#!/usr/bin/env python3
"""Gli attrezzi (32x32, manico dal basso a sinistra verso l'alto a destra, la testa in alto: il gioco li ruota così
quando il personaggio li impugna). Forme che si leggono al primo sguardo, anche piccole nella barra:
  · l'accetta: lama larga a barba che si apre verso sinistra, il filo lucido, il tallone dietro il manico;
  · il piccone: la testa a mezzaluna di traverso sul manico, due punte che scendono, il collare di ferro;
  · la zappa: la lama piatta che scende a «L» dalla cima del manico;
  · la pala: la lama a cuore in linea col manico, la maniglia a T in fondo;
  · la falce: l'asta lunga con l'impugnatura laterale, la lama lunga e ricurva col filo chiaro;
  · l'annaffiatoio: tondo, di rame rivettato, il manico ad arco, il beccuccio lungo con la cipolla forata;
  · la canna da pesca: la canna che si piega, il mulinello, la lenza e il galleggiante rosso e bianco.
Ferro scuro col filo lucido, legno vecchio con le fasce di cuoio, rame ammaccato. Scrive attrezzi.pxs; poi:
    python3 tools/pixel/studio.py tools/pixel/attrezzi.pxs --js js/attrezzi_mano.js --nome ATTREZZI_MANO
"""
import os, math
from tela import Tela

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
m #74726e
L #8aa0a8
S #c8ccd4
s #eef0f4
c #7a4a2a
C #a86a3a
E #c8864a
u #5a3a22
R #b0261e
r #6a1418
l #e8dcc0
f #c8c0b0
g #d8aa48"""

A = {}


def manico(T, x0, y0, x1, y1, fasce=(), spess=2):
    """il manico di legno: chiaro in alto a sinistra, scuro sotto; fasce di cuoio dove dice fasce (0..1)"""
    n = int(max(abs(x1 - x0), abs(y1 - y0)))
    for i in range(n + 1):
        t = i / n
        x, y = x0 + (x1 - x0) * t, y0 + (y1 - y0) * t
        cuoio = any(abs(t - f) < .05 for f in fasce)
        T.put(x, y, 'k' if cuoio else 'W')
        if spess > 1:
            T.put(x + 1, y, 'k' if cuoio else 'w')
            T.put(x + 1, y + 1, 'd')
        if not cuoio and i % 6 == 2:
            T.put(x, y, 'h')


def ferro(T, dentro, filo=None):
    """una testa di ferro piena: lucida dove guarda la luna (in alto), scura sotto; il filo, se c'è, chiarissimo"""
    M = {(x, y) for y in range(H) for x in range(W) if dentro(x + .5, y + .5)}
    for (x, y) in M:
        ch = 'I'
        if (x, y - 1) not in M:
            ch = 'L'
        elif (x, y + 1) not in M:
            ch = 'i'
        elif (x - 1, y) not in M:
            ch = 'm'
        T.put(x, y, ch)
    if filo:
        for (x, y) in M:
            if filo(x, y, M):
                T.put(x, y, 'S' if (x + y) % 3 else 's')
    return M


def poligono(pts):
    def dentro(px, py):
        d = False
        for i in range(len(pts)):
            (ax, ay), (bx, by) = pts[i], pts[(i + 1) % len(pts)]
            if (ay > py) != (by > py) and px < ax + (py - ay) * (bx - ax) / (by - ay):
                d = not d
        return d
    return dentro


def finisci(T):
    return T.contorno()


# ================================================================ l'accetta
T = Tela(W, H, 1)
manico(T, 5, 29, 22, 8, fasce=(.08, .16, .24))
# la lama: stretta vicino all'occhio, si apre a barba verso sinistra; il filo è curvo
lama = poligono([(21, 6.5), (21, 11), (17, 12), (12, 17.5), (9.5, 16), (8, 11), (8.5, 6), (10.5, 1.5), (16, 5)])
ferro(T, lama, filo=lambda x, y, M: (x - 1, y) not in M or (x - 2, y) not in M and x < 11)
for y in range(5, 13):  # l'occhio e il tallone dietro il manico
    for x in range(21, 25):
        T.put(x, y, 'I' if x < 24 else 'i')
for x in range(21, 25):
    T.put(x, 5, 'L')
T.put(22, 8, 'j'); T.put(23, 8, 'j'); T.put(22, 9, 'j')  # il cuneo nel manico
A['accetta'] = finisci(T)

# ================================================================ il piccone
T = Tela(W, H, 2)
manico(T, 4, 29, 21, 10, fasce=(.1, .2))
# la mezzaluna: di traverso sul manico (da in alto a sinistra a in basso a destra), le punte che scendono
cx, cy = 21, 9
for k in range(-26, 27):
    s = k / 26
    x = cx + s * 11.5
    y = cy + s * 11.5 * .55 - (1 - s * s) * 6 + 3 + (s * s) * 2.5
    sp = 3.2 * (1 - abs(s)) + .9
    for d in range(int(-sp), int(sp) + 1):
        ch = 'L' if d <= -sp + 1 else ('i' if d >= sp - 1 else 'I')
        T.put(x, y + d * .7, ch)
for (x, y) in ((cx - 11.5, cy - 6.3 + 3 + 2.5), (cx + 11.5, cy + 6.3 + 3 + 2.5)):
    T.put(x, y + 1, 'S'); T.put(x, y + 2, 's')  # le punte lucide
for y in range(2, 7):  # il collare
    for x in range(19, 24):
        if T.get(x, y) != '.':
            T.put(x, y, 'j' if x in (19, 23) else 'i')
A['piccone'] = finisci(T)

# ================================================================ la zappa
T = Tela(W, H, 3)
manico(T, 4, 29, 23, 7, fasce=(.72,))
ferro(T, poligono([(25, 3), (25, 7), (16, 7), (16, 4)]))  # il collo che esce dalla cima
ferro(T, poligono([(13, 5), (17, 5), (16.5, 15), (14.5, 17.5), (11, 17), (12.5, 10)]),
      filo=lambda x, y, M: (x, y + 1) not in M)  # la lama che scende, col filo in basso
T.put(24, 5, 'j'); T.put(13, 6, 'j'); T.put(15, 6, 'j')  # i chiodi
A['hoe'] = finisci(T)

# ================================================================ la pala
T = Tela(W, H, 4)
manico(T, 6, 27, 18, 15)
for k in (-2, -1, 0, 1, 2):  # la maniglia a T
    T.put(4 + k, 28 - k, 'W'); T.put(5 + k, 29 - k, 'd')
T.put(5, 29, 'k')
# la lama a cuore, in linea col manico (verso l'alto a destra), un po' consumata
u = (1 / math.sqrt(2), -1 / math.sqrt(2))
v = (1 / math.sqrt(2), 1 / math.sqrt(2))
P0 = (18, 14)
def cuore(px, py):
    dx, dy = px - P0[0], py - P0[1]
    a, b = dx * u[0] + dy * u[1], dx * v[0] + dy * v[1]  # a: lungo il manico, b: di traverso
    if a < 1 or a > 15:
        return False
    larg = 5.2 if a < 10 else 5.2 * (1 - (a - 10) / 5.4)
    if a < 3.2:
        larg = 2.6
    return abs(b) <= larg
ferro(T, cuore)
for k in range(6):
    T.put(20 + k * .7, 12 - k * .7, 'j')  # la costola centrale
T.put(23, 11, 'u'); T.put(26, 7, 'u'); T.put(22, 6, 'u')  # la ruggine
A['pala'] = finisci(T)

# ================================================================ la falce
T = Tela(W, H, 5)
manico(T, 5, 30, 25, 4, fasce=(.6,))
for k in range(4):  # l'impugnatura di lato
    T.put(13 + k, 18 - k * .2, 'W'); T.put(13 + k, 19 - k * .2, 'd')
for i in range(26):  # la lama lunga e ricurva verso sinistra
    t = i / 25
    x = 25 - t * 22
    y = 3 + 7 * t * t
    sp = 2.6 * (1 - t) + .8
    for d in range(int(sp) + 1):
        T.put(x, y + d, 'L' if d == 0 else ('S' if d >= int(sp) else 'I'))
T.put(24, 2, 'j'); T.put(25, 2, 'j'); T.put(26, 3, 'j')
A['falce'] = finisci(T)

# ================================================================ l'annaffiatoio
T = Tela(W, H, 6)
# il corpo tondo di rame, un po' bombato
T.parte(lambda x, y: ((x - 13) / 8.5) ** 2 + ((y - 21) / 7.5) ** 2 <= 1, ('E', 'C', 'c'),
        trama=lambda x, y, ch: 'c' if x > 18 and ch == 'C' else ('E' if x < 8 and ch == 'C' else None))
for x in range(7, 20):
    T.put(x, 26, 'u')  # la fascia in basso
for (x, y) in ((8, 18), (8, 24), (18, 18), (18, 24), (13, 26)):
    T.put(x, y, 'g')  # i ribattini
T.put(11, 20, 'u'); T.put(12, 21, 'u'); T.put(11, 21, 'c')  # un'ammaccatura
for x in range(10, 16):  # la bocca in alto, scura dentro
    T.put(x, 13, 'g'); T.put(x, 14, 'u' if 10 < x < 15 else 'g')
for i in range(15):  # il manico ad ansa, dietro (a sinistra), dall'alto al fianco
    a = math.pi * (0.5 + i / 14)
    T.put(8 + math.cos(a) * 5.5, 19 - math.sin(a) * 5.5 - 1, 'c')
    T.put(8 + math.cos(a) * 4.6, 19 - math.sin(a) * 4.6 - 1, 'C')
for i in range(11):  # il beccuccio lungo
    T.put(20 + i * .85, 24 - i * 1.3, 'C'); T.put(20 + i * .85, 25 - i * 1.3, 'c'); T.put(19 + i * .85, 25 - i * 1.3, 'C')
for (x, y, ch) in ((28, 10, 'C'), (29, 10, 'c'), (28, 9, 'E'), (29, 9, 'C'), (30, 9, 'c'), (27, 9, 'E'), (28, 8, 'C'), (29, 8, 'C'), (30, 10, 'c'), (30, 8, 'c')):
    T.put(x, y, ch)  # la cipolla
T.put(29, 9, 'u'); T.put(28, 10, 'u')  # i forellini
A['can'] = finisci(T)

# ================================================================ la canna da pesca
T = Tela(W, H, 7)
for i in range(27):  # la canna, che si piega un po' in cima
    t = i / 26
    x, y = 3 + i * .95, 29 - i * 1.0 + (t ** 3) * 2.5
    T.put(x, y, 'W' if i % 5 else 'k')
    if i < 10:
        T.put(x + 1, y, 'w')
for k in range(5):  # l'impugnatura di sughero
    T.put(3 + k * .95, 29 - k, 'h')
for (x, y, ch) in ((8, 22, 'I'), (9, 22, 'L'), (8, 23, 'i'), (9, 23, 'I'), (7, 22, 'm'), (10, 23, 'j'), (9, 21, 'S')):
    T.put(x, y, ch)  # il mulinello
for y in range(6, 22):
    T.put(29, y, 'f')  # la lenza
for (x, y, ch) in ((28, 22, 'R'), (29, 22, 'R'), (30, 22, 'r'), (28, 23, 'l'), (29, 23, 'l'), (30, 23, 'f'),
                   (28, 24, 'R'), (29, 24, 'r'), (30, 24, 'r'), (29, 21, 'r'), (29, 25, 'r')):
    T.put(x, y, ch)  # il galleggiante
A['canna'] = finisci(T)

QUI = os.path.dirname(__file__)
righe = ['# Gli attrezzi. Generato da attrezzi_abbozzo.py.', '@tavolozza', PAL]
for k, T in A.items():
    righe.append(f'@sprite {k} {W}x{H}')
    righe += T.righe()
open(os.path.join(QUI, 'attrezzi.pxs'), 'w').write('\n'.join(righe) + '\n')
print('scritto attrezzi.pxs')
