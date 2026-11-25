#!/usr/bin/env python3
"""L'Ingegnere e i suoi congegni, alla grana dell'Albero dei Morti:
  · il carro-officina (64x48): un carro di legno scuro col tetto a botte di lamiera chiodata, la caldaia di rame
    col manometro, il camino storto, l'oblò acceso, la porta ad arco con la scaletta, l'ingranaggio sul fianco,
    l'insegna con la ruota dentata e l'antenna con la scintilla;
  · il passerotto meccanico che sta sul suo cilindro (7x6, due fotogrammi: ali giù e ali su);
  · le icone (16x16, nello zaino a 2x): la chiave inglese, l'irrigatore interrato, quello grande, il braccio.
Scrive ingegnere.pxs; poi:
    python3 tools/pixel/studio.py tools/pixel/ingegnere.pxs --js js/ingegnere_mano.js --nome INGEGNERE_MANO
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
4 #5a1e10
5 #8a3418
6 #b05a22
7 #c8862e
8 #d8aa48
9 #ffd070
0 #fff0c0
t #1e2a36
T #2e4450
y #7ab8d8
Y #c8e8f8
P #4a7a5a
p #2e4a3a
2 #7c1512
3 #b0261e"""

A = {}


def rett(T, x0, y0, x1, y1, ch):
    for y in range(int(y0), int(y1)):
        for x in range(int(x0), int(x1)):
            T.put(x, y, ch)


def chiudi(T, scuri='kKcBbwIiLm'):
    T.luna(scuri, chiaro='J', medio='j')
    return T.contorno()


def ruota(T, cx, cy, r):
    """la ruota grande: il cerchio di ferro, i raggi di legno, il mozzo d'ottone"""
    for y in range(int(cy - r - 1), int(cy + r + 2)):
        for x in range(int(cx - r - 1), int(cx + r + 2)):
            d = math.hypot(x + .5 - cx, y + .5 - cy)
            if r - 1.3 <= d <= r:
                T.put(x, y, 'I' if y < cy else 'K')
            elif r - 2.2 <= d < r - 1.3:
                T.put(x, y, 'B')
    for k in range(8):
        a = k * math.pi / 4
        for s in range(2, int(r) - 1):
            T.put(cx + math.cos(a) * s - .5, cy + math.sin(a) * s - .5, 'W' if k % 2 else 'w')
    T.disco(cx - .5, cy - .5, 1.6, '7')
    T.put(cx - 1, cy - 1, '8')


def ingranaggio(T, cx, cy, r, denti=8, ramp='786'):
    """una ruota dentata d'ottone col buco al centro"""
    for y in range(int(cy - r - 2), int(cy + r + 3)):
        for x in range(int(cx - r - 2), int(cx + r + 3)):
            dx, dy = x + .5 - cx, y + .5 - cy
            d, a = math.hypot(dx, dy), math.atan2(dy, dx)
            dente = (a * denti / (2 * math.pi)) % 1 < .5
            if d <= r or (d <= r + 1.6 and dente):
                ch = ramp[0] if dy < -r * .3 else ramp[2] if dy > r * .3 else ramp[1]
                if d < r * .35:
                    ch = 'K'
                T.put(x, y, ch)


# ---------------------------------------------------------------- il carro-officina 64x48
T = Tela(64, 48, 7)
# il tetto a botte di lamiera, coi chiodi e le giunture
for y in range(6, 17):
    for x in range(10, 63):
        t = ((x - 36.5) / 27) ** 2 + ((y - 17) / 11) ** 2
        if t <= 1:
            ch = 'I' if (x - 10) % 7 else 'i'
            if y in (9, 13) and x % 3 == 0:
                ch = 'm'
            T.put(x, y, ch)
rett(T, 9, 16, 64, 18, 'K')  # la gronda
for x in range(11, 63, 4):
    T.put(x, 17, '7')  # i chiodi d'ottone sulla gronda
# il corpo di legno scuro, a doghe orizzontali, con le fasce d'ottone
for y in range(18, 38):
    for x in range(12, 61):
        ch = 'b' if (y - 18) % 4 == 0 else ('B' if (x + y // 4 * 5) % 9 else 'w')
        if (x * 7 + y * 3) % 29 == 0:
            ch = 'W'
        T.put(x, y, ch)
rett(T, 12, 36, 61, 38, '6')
for x in range(12, 61, 3):
    T.put(x, 36, '8')
# il tubo di rame che corre sotto la gronda dalla caldaia all'ingranaggio
rett(T, 12, 19, 58, 20, '6')
for x in range(16, 58, 8):
    T.put(x, 19, '7'); T.put(x, 20, '5')
# la caldaia di rame a sinistra, coi cerchi e i rivetti, il manometro
for y in range(12, 40):
    for x in range(1, 13):
        dx = (x + .5 - 7) / 6
        ch = '7' if dx < -.45 else '6' if dx < .3 else '5' if dx < .75 else '4'
        if y in (16, 24, 32):
            ch = 'K'
        elif y in (17, 25, 33) and x % 3 == 1:
            ch = '8'
        T.put(x, y, ch)
for x in range(2, 12):
    T.put(x, 11, '5' if x % 2 else '6')  # la cupola
T.disco(6.5, 20.5, 2.6, 'q')
T.put(6, 20, 'K'); T.put(7, 19, '3'); T.put(8, 18, '3')  # la lancetta rossa del manometro, quasi al massimo
T.put(5, 22, 'Q')
# il camino storto, col cappello
for y in range(0, 12):
    x = 5 + (1 if y < 4 else 0)
    T.put(x, y, 'K'); T.put(x + 1, y, 'I'); T.put(x + 2, y, 'i')
rett(T, 4, 0, 10, 2, 'K')
T.put(5, 0, 'I'); T.put(6, 0, 'm')
# la porta ad arco, chiodata, con la maniglia d'ottone e la scaletta di legno
for y in range(22, 38):
    for x in range(30, 39):
        if y < 25 and ((x + .5 - 34.5) / 4.5) ** 2 + ((y + .5 - 25) / 3) ** 2 > 1:
            continue
        T.put(x, y, 'X' if x in (30, 38) or y == 22 else ('c' if (x - 30) % 3 else 'k'))
for y in (27, 33):
    for x in range(31, 38, 2):
        T.put(x, y, '7')
T.put(36, 30, '9'); T.put(36, 31, '8')
rett(T, 29, 38, 40, 39, 'W'); rett(T, 28, 40, 41, 41, 'w'); rett(T, 27, 42, 42, 43, 'B')
# l'oblò acceso, cerchiato d'ottone
for y in range(19, 31):
    for x in range(44, 56):
        d = math.hypot(x + .5 - 50, y + .5 - 25)
        if d <= 5.2:
            T.put(x, y, '8' if d > 4 else ('9' if (x < 50 and y < 25) else '8' if d < 2 else '7'))
        if 4 < d <= 5.2 and (x + y) % 4 == 0:
            T.put(x, y, '6')
T.put(48, 23, '0'); T.put(47, 24, '0')
rett(T, 45, 25, 55, 26, '6'); rett(T, 49, 20, 50, 30, '6')  # la croce dell'oblò
# l'insegna appesa: un'asse con la ruota dentata
rett(T, 17, 18, 18, 21, 'K'); rett(T, 25, 18, 26, 21, 'K')
rett(T, 15, 21, 28, 29, 'W'); rett(T, 15, 28, 28, 29, 'B')
ingranaggio(T, 21.5, 25, 2.2, 6)
# l'ingranaggio grande sul fianco destro e uno piccolo che morde
ingranaggio(T, 59, 31, 4.3, 10)
ingranaggio(T, 55, 37.5, 2.2, 7, '765')
# l'antenna sul tetto, con la bobina e la scintilla
for y in range(0, 9):
    T.put(54, y, 'L' if y > 2 else 'm')
for y in range(4, 8):
    T.put(53, y, '6'); T.put(55, y, '6')
T.put(54, 0, '0'); T.put(53, 1, 'Y'); T.put(55, 1, 'Y')
# la lanterna accanto alla porta
T.put(27, 22, 'K'); T.put(27, 23, '9'); T.put(27, 24, '8'); T.put(26, 23, 'K'); T.put(28, 23, 'K'); T.put(27, 25, 'K')
# le ruote
ruota(T, 18, 40, 7.5)
ruota(T, 50, 40, 7.5)
A['carro'] = chiudi(T)

# ---------------------------------------------------------------- il passerotto meccanico 11x8 (due fotogrammi)
# di profilo, guarda a sinistra: becco di rame, occhio che brilla, corpo d'ottone, coda alzata, la chiavetta
# della carica sulla schiena; nel secondo fotogramma l'ala si alza
PASSEROTTO = [
    ["......m..",
     ".88...mm.",
     "6087778.5",
     ".7787766.",
     "..77766..",
     "...K.K..."],
    ["...88.m..",
     ".88.8.mm.",
     "6087778.5",
     ".7777766.",
     "..77766..",
     "...K.K..."],
]
for f, G in enumerate(PASSEROTTO):
    T = Tela(11, 8, 30 + f)
    for y, r in enumerate(G):
        for x, ch in enumerate(r):
            if ch != '.':
                T.put(x + 1, y + 1, ch)
    A[f'passerotto{f}'] = T.contorno()


# ---------------------------------------------------------------- le icone 16x16
def icona(seme):
    return Tela(16, 16, seme)


# la chiave inglese: ferro, la bocca aperta in alto a destra, l'anello d'ottone sul manico
T = icona(40)
for k in range(11):
    x, y = 3 + k * .9, 13 - k * .9
    T.disco(x, y, 1.25, 'm' if k % 4 else 'L')
T.disco(12.5, 3.5, 2.8, 'M')
rett(T, 12, 1, 14, 4, '.')  # la bocca
T.put(13, 4, 'L'); T.put(11, 3, 'L')
T.disco(3, 13, 1.8, '7'); T.put(3, 13, 'K'); T.put(2, 12, '8')
A['ico_chiave'] = chiudi(T, scuri='mLM7')

# l'irrigatore interrato: la testa d'ottone che spunta da un tondo di terra, quattro schizzi
T = icona(41)
T.ell(8, 12.5, 6, 2.2, 'wBb')
rett(T, 7, 7, 9, 12, 'm'); T.put(7, 8, 'M')
T.ell(8, 6.5, 2.6, 1.4, '876')
T.put(8, 6, 'K')
for x, y in ((2, 4), (4, 2), (12, 2), (14, 4)):
    T.put(x, y, 'y'); T.put(x, y + 1, 'Y')
A['ico_irr'] = chiudi(T, scuri='wBbm876')

# l'irrigatore grande: quattro becchi a croce, più acqua
T = icona(42)
T.ell(8, 13, 7, 2.2, 'wBb')
rett(T, 7, 6, 9, 12, 'm'); T.put(7, 7, 'M')
T.disco(8, 5, 2.4, '7')
for dx, dy in ((-3, 0), (3, 0), (0, -3)):
    T.put(8 + dx, 5 + dy, '6'); T.put(8 + dx * 1.3, 5 + dy * 1.3, '8')
T.put(8, 5, 'K')
for x, y in ((1, 6), (2, 2), (5, 0), (11, 0), (14, 2), (15, 6)):
    T.put(x, y, 'y'); T.put(x, y + 1, 'Y')
A['ico_irr2'] = chiudi(T, scuri='wBbm876')

# il braccio raccoglitore: il palo sull'incrocio, il gomito d'ottone, le pinze con una rapa
T = icona(43)
rett(T, 3, 4, 5, 15, 'L'); T.put(3, 5, 'm')
T.disco(4, 15, 1.5, 'K')
for k in range(7):
    T.put(5 + k, 4 + k * .2, 'm'); T.put(5 + k, 5 + k * .2, 'L')
T.disco(4, 4, 1.6, '8'); T.disco(11.5, 5.5, 1.3, '7')
for k in range(5):
    T.put(11 + k * .3, 6 + k, 'L')
for dx in (-1, 2):
    T.put(12 + dx, 11, 'K'); T.put(12 + dx, 12, 'm')
T.ell(12.5, 13.5, 1.6, 1.2, '332')
A['ico_braccio'] = chiudi(T, scuri='Lm87')

QUI = os.path.dirname(__file__)
righe = ["# L'Ingegnere e i suoi congegni. Generato da ingegnere_abbozzo.py.", '@tavolozza', PAL]
for k, T in A.items():
    righe.append(f'@sprite {k} {T.w}x{T.h}')
    righe += T.righe()
open(os.path.join(QUI, 'ingegnere.pxs'), 'w').write('\n'.join(righe) + '\n')
print('scritto ingegnere.pxs')
