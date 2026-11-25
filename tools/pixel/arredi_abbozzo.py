#!/usr/bin/env python3
"""I mobili della casa, alla grana dell'Albero dei Morti (vista dall'alto di tre quarti, come il resto della casa):
  fermi:   il letto grande con la trapunta a quadri, l'armadio intagliato, il comò, il comodino con la candela,
           lo scrittoio col calamaio, la poltrona di velluto, il divano, la tavola da pranzo apparecchiata, il baule,
           l'appendiabiti col mantello, la mensola coi barattoli (a muro), il tappeto grande intrecciato, il vaso di
           cardi secchi;
  animati: l'orologio a pendolo (le lancette e il pendolo li disegna il gioco), la sedia a dondolo, il candelabro
           (le fiamme), la stufa di ghisa (il fuoco dietro il vetro), l'arcolaio (i raggi della ruota), la gabbia
           (l'uccellino), la boccia del pesce rosso (il pesce), il carillon (la ballerina).
Le parti che si muovono restano vuote qui: le disegna arredi.js sopra lo sprite, nello stesso ordine di profondità.
Scrive arredi.pxs; poi:
    python3 tools/pixel/studio.py tools/pixel/arredi.pxs --js js/arredi_mano.js --nome ARREDI_MANO
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
2 #5a1418
3 #8a2226
4 #b03a30
5 #8a3418
6 #b05a22
7 #c8862e
8 #d8aa48
9 #ffd070
0 #fff0c0
d #1e2a18
e #2e3a22
f #44522c
g #606a36
t #1e2a36
T #2e4450
y #4a6a70
u #7a9aa0
J #8aa0a8
j #5a6a74
p #3a2440
P #5a3a62
r #7a5a86"""

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


def venato(T, x0, y0, x1, y1, base='w', vena='B', chiaro='W'):
    """legno: assi con le venature, un filo chiaro in alto"""
    for y in range(int(y0), int(y1)):
        for x in range(int(x0), int(x1)):
            ch = base
            if (x * 3 + (y // 3) * 7) % 11 == 0:
                ch = vena
            T.put(x, y, ch)
    for x in range(int(x0), int(x1)):
        T.put(x, y0, chiaro)


def chiudi(T, scuri='kKcBbwIiLm'):
    T.luna(scuri, chiaro='J', medio='j')
    return T.contorno()


# ================================================================ il letto grande 32x40 (2x2 caselle)
T = Tela(32, 40, 1)
venato(T, 1, 0, 31, 9, 'B', 'b', 'W')  # la testiera intagliata
for x in range(1, 31):
    if abs(x - 16) < 6:
        T.put(x, 0, '.')
T.put(16, 1, 'h')
for x in (4, 27):
    T.put(x, 0, 'W'); T.put(x, 1, 'h')
rett(T, 2, 9, 30, 36, 'q')  # il lenzuolo
for x in range(4, 14):  # i cuscini
    for y in range(10, 15):
        T.put(x, y, 'q' if (x + y) % 5 else 'Q')
for x in range(18, 28):
    for y in range(10, 15):
        T.put(x, y, 'q' if (x + y) % 5 else 'Q')
# la trapunta a quadri: rosso, ocra, blu notte, verde
Q4 = ['3', '7', 'T', 'f']
for y in range(17, 36):
    for x in range(2, 30):
        q = Q4[((x - 2) // 7 + (y - 17) // 6) % 4]
        if (x - 2) % 7 == 0 or (y - 17) % 6 == 0:
            q = 'k'
        T.put(x, y, q)
for x in range(2, 30):
    T.put(x, 17, 'q' if x % 2 else 'Q')  # il risvolto del lenzuolo
rett(T, 1, 36, 31, 40, 'B')  # la pediera
for x in range(1, 31):
    T.put(x, 36, 'W')
A['letto'] = chiudi(T, scuri='BbWwqQ')

# ================================================================ l'armadio 30x44 (2x1)
T = Tela(30, 44, 2)
venato(T, 1, 5, 29, 42, 'w', 'B', 'W')
rett(T, 0, 2, 30, 6, 'B')  # la cornice in alto, intagliata
for x in range(0, 30):
    T.put(x, 2, 'h')
    if x % 4 == 1:
        T.put(x, 1, 'W')
for x in range(10, 20):
    T.put(x, 0 if abs(x - 15) < 3 else 1, 'W')
for x0 in (3, 16):  # le due ante con le specchiature
    cornice(T, x0, 9, x0 + 11, 38, 'B')
    cornice(T, x0 + 2, 11, x0 + 9, 22, 'b')
    cornice(T, x0 + 2, 25, x0 + 9, 36, 'b')
T.put(13, 23, '8'); T.put(16, 23, '8')  # le maniglie d'ottone
T.put(13, 24, '7'); T.put(16, 24, '7')
rett(T, 2, 41, 6, 44, 'B'); rett(T, 24, 41, 28, 44, 'B')  # i piedi
A['armadio'] = chiudi(T, scuri='BbwW')

# ================================================================ il comò 30x30 (2x1)
T = Tela(30, 30, 3)
venato(T, 1, 9, 29, 27, 'w', 'B', 'W')
rett(T, 0, 7, 30, 10, 'h')  # il piano
for x in range(0, 30):
    T.put(x, 9, 'W')
for y0 in (11, 16, 21):  # tre cassetti
    cornice(T, 3, y0, 27, y0 + 5, 'B')
    T.put(14, y0 + 2, '8'); T.put(15, y0 + 2, '8')
rett(T, 2, 27, 5, 30, 'B'); rett(T, 25, 27, 28, 30, 'B')
# sopra: lo scrigno e una foto incorniciata
rett(T, 4, 3, 11, 8, '3'); rett(T, 4, 3, 11, 4, '4'); T.put(7, 5, '8')
cornice(T, 18, 0, 25, 8, '7'); rett(T, 19, 1, 24, 7, 'Q'); T.put(21, 3, 'k'); T.put(22, 3, 'k'); rett(T, 20, 4, 24, 7, 'c')
A['como'] = chiudi(T, scuri='Bbw3')

# ================================================================ il comodino 14x20 (la fiamma la fa il gioco)
T = Tela(14, 20, 4)
venato(T, 1, 8, 13, 18, 'w', 'B', 'W')
rett(T, 0, 7, 14, 9, 'h')
cornice(T, 2, 10, 12, 14, 'B'); T.put(7, 12, '8')
rett(T, 1, 18, 3, 20, 'B'); rett(T, 11, 18, 13, 20, 'B')
rett(T, 5, 3, 9, 7, 'q'); rett(T, 4, 6, 10, 8, 'M')  # la candela sul piattino (accesa dal gioco)
T.put(7, 2, 'k')
A['comodino'] = chiudi(T, scuri='Bbw')

# ================================================================ lo scrittoio 32x32 (2x1)
T = Tela(32, 32, 5)
venato(T, 1, 13, 31, 29, 'B', 'b', 'W')
rett(T, 0, 10, 32, 14, 'W')  # il piano di scrittura
for x in range(0, 32):
    T.put(x, 10, 'h')
cornice(T, 4, 16, 14, 22, 'b'); T.put(9, 19, '8')
cornice(T, 18, 16, 28, 22, 'b'); T.put(23, 19, '8')
rett(T, 2, 28, 5, 32, 'B'); rett(T, 27, 28, 30, 32, 'B')
# il libro aperto, i fogli, il calamaio con la penna d'oca
rett(T, 4, 6, 15, 12, 'q'); T.put(9, 6, 'Q'); T.put(9, 7, 'M'); T.put(9, 8, 'M'); T.put(9, 9, 'M'); T.put(9, 10, 'M'); T.put(9, 11, 'M')
for y in (7, 9):
    for x in range(5, 9):
        T.put(x, y, 'm')
    for x in range(10, 14):
        T.put(x, y, 'm')
rett(T, 17, 8, 23, 12, 'Q'); T.put(18, 9, 'm'); T.put(19, 9, 'm'); T.put(18, 10, 'm')
rett(T, 25, 7, 29, 11, 'K'); T.put(26, 7, 'I')
for k in range(7):
    T.put(28 + k * .3, 6 - k, 'q')  # la penna
A['scrittoio'] = chiudi(T, scuri='BbWwK')

# ================================================================ la poltrona 20x26, velluto rosso
T = Tela(20, 26, 6)
T.parte(lambda x, y: 3 <= x <= 17 and 1 <= y <= 15 and not (y < 4 and (x < 5 or x > 15)), ('4', '3', '2'))
T.parte(lambda x, y: (1 <= x <= 5 or 15 <= x <= 19) and 7 <= y <= 20, ('4', '3', '2'))  # i braccioli
T.parte(lambda x, y: 5 <= x <= 15 and 13 <= y <= 20, ('4', '3', '2'))  # la seduta
for y in range(3, 12, 3):
    T.put(10, y, '2')  # i bottoni del capitonné
    T.put(7, y + 1, '2'); T.put(13, y + 1, '2')
for x in (2, 17):
    rett(T, x, 21, x + 2, 26, 'B')
A['poltrona'] = chiudi(T, scuri='432B')

# ================================================================ il divano 44x26, velluto verde bottiglia
T = Tela(44, 26, 7)
T.parte(lambda x, y: 3 <= x <= 41 and 2 <= y <= 13, ('g', 'f', 'e'))
T.parte(lambda x, y: (1 <= x <= 5 or 39 <= x <= 43) and 6 <= y <= 20, ('g', 'f', 'e'))
T.parte(lambda x, y: 5 <= x <= 39 and 12 <= y <= 20, ('g', 'f', 'e'))
for x in range(6, 39):
    if x in (17, 28):
        for y in range(12, 20):
            T.put(x, y, 'e')  # tra i tre cuscini
for y in range(4, 12, 4):
    for x in range(9, 38, 7):
        T.put(x, y, 'd')
for x in (3, 40):
    rett(T, x, 21, x + 2, 26, 'B')
rett(T, 30, 9, 36, 14, '7'); T.put(33, 11, '8')  # un cuscino ricamato
A['divano'] = chiudi(T, scuri='gfeB')

# ================================================================ la tavola da pranzo 46x30, apparecchiata
T = Tela(46, 30, 8)
rett(T, 1, 4, 45, 20, 'q')  # la tovaglia di lino
for x in range(1, 45):
    T.put(x, 4, 'Q')
    if x % 2 == 0:
        T.put(x, 19, 'Q')
rett(T, 1, 20, 45, 23, 'Q')  # il bordo che pende
for x in range(1, 45, 3):
    T.put(x, 22, 'M')
for x in (3, 41):
    rett(T, x, 23, x + 3, 30, 'B')
for x in (12, 32):
    rett(T, x, 23, x + 2, 28, 'b')
# i piatti, i bicchieri, la brocca e il pane
for cx in (8, 19, 29, 39):
    T.disco(cx, 13, 3.2, 'M'); T.disco(cx, 13, 2, 'Q')
    T.put(cx + 3, 9, 'u'); T.put(cx + 3, 10, 'y')
rett(T, 22, 5, 25, 10, 'h'); T.put(23, 5, 'W')  # la brocca
T.ell(14, 8, 3, 1.6, ('8', '7', '6'))  # la pagnotta
A['tavolopranzo'] = chiudi(T, scuri='BbqQM')

# ================================================================ il baule 26x20
T = Tela(26, 20, 9)
T.parte(lambda x, y: 1 <= x <= 25 and 2 <= y <= 8 and ((x - 13) / 13) ** 2 + ((y - 8) / 7) ** 2 <= 1.15, ('W', 'w', 'B'))
venato(T, 1, 8, 25, 19, 'w', 'B', 'h')
for x in (5, 13, 21):  # le fasce di ferro
    for y in range(2, 19):
        if T.get(x, y) != '.':
            T.put(x, y, 'I')
rett(T, 11, 9, 16, 13, 'L'); T.put(13, 11, 'K')  # la serratura
A['baule'] = chiudi(T, scuri='WwBI')

# ================================================================ l'appendiabiti 16x38, col mantello e il cappello
T = Tela(16, 38, 10)
rett(T, 7, 2, 9, 34, 'B')
for k in range(4):
    T.put(6 - k, 4 + k * .5, 'W'); T.put(9 + k, 4 + k * .5, 'W')
T.parte(lambda x, y: 2 <= x <= 13 and 6 <= y <= 30 and abs(x - 7.5) <= 2.5 + (y - 6) * .2, ('c', 'k', 'K'))  # il mantello
for y in range(10, 30, 4):
    T.put(7, y, 'K')
T.ell(8, 3, 5, 1.3, ('k', 'K', 'X')); T.ell(8, 1.5, 2.6, 1.5, ('k', 'K', 'X'))  # il cappello
for x in range(4, 13):
    T.put(x, 35, 'B')
rett(T, 3, 34, 13, 36, 'B')
A['appendiabiti'] = chiudi(T, scuri='BckK')

# ================================================================ la mensola a muro 30x16, coi barattoli
T = Tela(30, 16, 11)
rett(T, 0, 11, 30, 14, 'W')
for x in range(0, 30):
    T.put(x, 11, 'h')
for x in (3, 26):
    rett(T, x, 14, x + 2, 16, 'B')
for x0, col, hh in ((2, 'y', 8), (7, '6', 6), (12, 'f', 9), (18, 'Q', 5), (23, '3', 7)):
    rett(T, x0, 11 - hh, x0 + 4, 11, col)
    rett(T, x0, 11 - hh - 1, x0 + 4, 11 - hh, 'B')  # il tappo
    T.put(x0 + 1, 11 - hh + 2, 'q')
A['mensola'] = chiudi(T, scuri='WB')

# ================================================================ il tappeto grande 48x32, intrecciato
T = Tela(48, 32, 12)
for y in range(32):
    for x in range(48):
        d = ((x + .5 - 24) / 23.5) ** 2 + ((y + .5 - 16) / 15.5) ** 2
        if d <= 1:
            anello = int(math.sqrt(d) * 9)
            T.put(x, y, ['3', '7', '2', '6', '3', 'g', '7', '2', '3'][anello % 9] if (x + y) % 3 else ['4', '8', '3', '7', '4', 'f', '8', '3', '4'][anello % 9])
A['tappetone'] = T.contorno()

# ================================================================ il vaso di cardi secchi 14x28
T = Tela(14, 28, 13)
T.ell(7, 22, 4.5, 5.5, ('T', 't', 'i'))
T.ell(7, 16, 2.4, 1.2, ('y', 'T', 't'))
for k, (dx, top) in enumerate(((-4, 2), (-1, 0), (2, 3), (4, 6), (-3, 7))):
    for y in range(top + 2, 16):
        T.put(7 + dx * (16 - y) / 14, y, 'f')
    T.disco(7 + dx, top + 2, 1.6, 'r')  # il fiore viola del cardo
    T.put(7 + dx, top + 1, 'P')
A['vasofiori'] = chiudi(T, scuri='tTi')

# ================================================================ l'orologio a pendolo 18x48 (vuoti: il quadrante e il vetro del pendolo)
T = Tela(18, 48, 14)
venato(T, 2, 6, 16, 46, 'B', 'b', 'W')
T.parte(lambda x, y: 1 <= x <= 17 and 0 <= y <= 7 and y >= 4 - (8 - abs(x - 9)) * .6, ('W', 'w', 'B'))  # il frontone
T.disco(9, 11, 5.6, 'h'); T.disco(9, 11, 4.6, 'q')  # il quadrante (le lancette dal gioco)
for a in range(0, 360, 30):
    T.put(9 + math.cos(math.radians(a)) * 3.6, 11 + math.sin(math.radians(a)) * 3.6, 'k')
cornice(T, 4, 19, 14, 41, '7')  # la finestra del pendolo, col vetro scuro
rett(T, 5, 20, 13, 40, 't')
rett(T, 1, 44, 17, 48, 'B')
A['pendolo'] = chiudi(T, scuri='BbWw')

# ================================================================ la sedia a dondolo 26x30 (con il margine per dondolare)
T = Tela(26, 30, 15)
for x in range(3, 23):  # i pattini curvi
    y = 26 + ((x - 13) / 10) ** 2 * 3
    T.put(x, y, 'B'); T.put(x, y - 1, 'W')
for x0 in (7, 17):
    rett(T, x0, 16, x0 + 2, 25, 'B')
rett(T, 6, 2, 20, 4, 'W')  # lo schienale: traversa e stecche
for x in range(7, 20, 3):
    rett(T, x, 4, x + 1, 15, 'w')
rett(T, 6, 2, 8, 16, 'B'); rett(T, 18, 2, 20, 16, 'B')
rett(T, 5, 15, 21, 18, 'W')  # la seduta impagliata
for x in range(5, 21):
    T.put(x, 16, 'h' if x % 2 else '8')
rett(T, 8, 9, 18, 15, '3'); T.put(13, 12, '7')  # un cuscino
A['dondolo'] = chiudi(T, scuri='BWw3')

# ================================================================ il candelabro 16x26 (le fiamme dal gioco)
T = Tela(16, 26, 16)
rett(T, 7, 8, 9, 23, '7')
T.ell(8, 24, 5, 1.6, ('8', '7', '6'))
for k in range(8):  # i bracci
    T.put(2 + k * .75, 8 - k * .3 + (k * k) * .05, '7'); T.put(13 - k * .75, 8 - k * .3 + (k * k) * .05, '7')
for x in (2, 8, 14):
    rett(T, x - 1, 3, x + 1, 7, 'q')
    T.put(x - 1, 2, 'k') if False else None
    T.put(x - 1, 7, '8'); T.put(x, 7, '8')
A['candelabro'] = chiudi(T, scuri='76q')

# ================================================================ la stufa di ghisa 20x34 (il fuoco dal gioco)
T = Tela(20, 34, 17)
rett(T, 8, 0, 12, 12, 'I'); rett(T, 8, 0, 9, 12, 'L')  # il tubo
rett(T, 2, 11, 18, 31, 'I')
rett(T, 1, 11, 19, 14, 'L'); rett(T, 1, 11, 19, 12, 'M')
cornice(T, 4, 16, 16, 26, 'L'); rett(T, 5, 17, 15, 25, 'K')  # lo sportello col vetro (il fuoco dal gioco)
T.put(15, 21, 'M')
for x in (3, 15):
    rett(T, x, 31, x + 2, 34, 'I')
T.put(10, 28, 'm'); T.put(9, 28, 'm')
A['stufa'] = chiudi(T, scuri='ILK')

# ================================================================ l'arcolaio 30x30 (i raggi della ruota dal gioco)
T = Tela(30, 30, 18)
rett(T, 2, 24, 28, 27, 'B')  # la base
for x in range(2, 28):
    T.put(x, 24, 'W')
for (x0, y0, x1, y1) in ((5, 27, 7, 30), (24, 27, 26, 30), (8, 24, 10, 14), (14, 24, 16, 14)):
    rett(T, x0, y1 if y1 < y0 else y0, x1, y0 if y1 < y0 else y1, 'B')
for a in range(0, 360, 4):  # il cerchione
    T.put(12 + math.cos(math.radians(a)) * 9.5, 12 + math.sin(math.radians(a)) * 9.5, 'W')
    T.put(12 + math.cos(math.radians(a)) * 8.7, 12 + math.sin(math.radians(a)) * 8.7, 'B')
T.disco(12, 12, 1.6, 'h')
rett(T, 22, 8, 25, 24, 'B'); T.ell(24, 8, 2, 3, ('q', 'Q', 'M'))  # il fuso con la lana
A['arcolaio'] = chiudi(T, scuri='BW')

# ================================================================ la gabbia 16x34, su un piede (l'uccellino dal gioco)
T = Tela(16, 34, 19)
for a in range(0, 181, 6):  # la cupola
    T.put(8 + math.cos(math.radians(a)) * 6.5, 7 - math.sin(math.radians(a)) * 5, '7')
for x in range(2, 15, 2):
    for y in range(4, 17):
        if T.get(x, y) == '.' and (y > 6 or abs(x - 8) < 6):
            T.put(x, y, '7')
rett(T, 1, 16, 15, 18, '8'); T.put(8, 0, '8'); T.put(8, 1, '7')
rett(T, 7, 18, 9, 31, 'B')
T.ell(8, 32, 5, 1.6, ('W', 'w', 'B'))
A['gabbia'] = chiudi(T, scuri='78B')

# ================================================================ la boccia del pesce 14x26, sul suo tavolinetto (il pesce dal gioco)
T = Tela(14, 26, 20)
T.parte(lambda x, y: ((x - 7) / 6.2) ** 2 + ((y - 7) / 6) ** 2 <= 1, ('J', 'u', 'y'), luce=False)
for x in range(2, 12):
    T.put(x, 2, '.') if abs(x - 7) > 3 else None
rett(T, 4, 1, 10, 2, 'J')
T.put(4, 5, 'q'); T.put(4, 6, 'J')  # il riflesso
rett(T, 1, 13, 13, 15, 'W'); rett(T, 6, 15, 8, 24, 'B'); T.ell(7, 24.5, 4, 1.3, ('W', 'w', 'B'))
A['boccia'] = chiudi(T, scuri='WB')

# ================================================================ il carillon 14x24, sul suo piedistallo (la ballerina dal gioco)
T = Tela(14, 24, 21)
rett(T, 2, 7, 12, 12, '3'); rett(T, 2, 7, 12, 8, '4')  # la scatola aperta
rett(T, 2, 2, 12, 4, 'P'); rett(T, 2, 4, 12, 7, 'r')  # il coperchio alzato con lo specchio
rett(T, 3, 5, 11, 7, 'J')
T.put(7, 9, '8')
rett(T, 6, 12, 8, 21, 'B'); T.ell(7, 22, 4.5, 1.6, ('W', 'w', 'B'))
A['carillon'] = chiudi(T, scuri='34PrB')

# ================================================================ l'applique da parete 10x16 (la fiamma dal gioco)
T = Tela(10, 16, 22)
rett(T, 3, 9, 7, 14, '7'); rett(T, 3, 9, 4, 14, '8')  # la piastra d'ottone
for k in range(4):
    T.put(5, 8 - k * .5 + 1, '7')
T.put(4, 15, '7'); T.put(5, 15, '6')
rett(T, 3, 4, 7, 8, 'q'); rett(T, 2, 7, 8, 9, '8')  # la candela nel suo piattino
A['applique'] = chiudi(T, scuri='786q')

QUI = os.path.dirname(__file__)
righe = ['# I mobili della casa. Generato da arredi_abbozzo.py.', '@tavolozza', PAL]
for k, T in A.items():
    righe.append(f'@sprite {k} {T.w}x{T.h}')
    righe += T.righe()
open(os.path.join(QUI, 'arredi.pxs'), 'w').write('\n'.join(righe) + '\n')
print('scritto arredi.pxs:', len(A), 'mobili')
