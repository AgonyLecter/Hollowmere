"""Strumenti comuni degli abbozzi di pixel art (tools/pixel/*_abbozzo.py): una griglia di lettere della tavolozza,
'.' trasparente, con forme piene ombreggiate, rami, luce di luna sui bordi alti e contorno scuro."""
import math, random


class Tela:
    def __init__(s, w, h, seme=0):
        s.w, s.h = w, h
        s.G = [['.'] * w for _ in range(h)]
        s.rnd = random.Random(seme)

    def put(s, x, y, ch, solo_vuoto=False):
        x, y = int(math.floor(x)), int(math.floor(y))
        if 0 <= x < s.w and 0 <= y < s.h and (not solo_vuoto or s.G[y][x] == '.'):
            s.G[y][x] = ch

    def get(s, x, y):
        x, y = int(math.floor(x)), int(math.floor(y))
        return s.G[y][x] if 0 <= x < s.w and 0 <= y < s.h else '.'

    def disco(s, cx, cy, r, ch, solo_vuoto=False):
        for y in range(int(cy - r - 1), int(cy + r + 2)):
            for x in range(int(cx - r - 1), int(cx + r + 2)):
                if (x + .5 - cx) ** 2 + (y + .5 - cy) ** 2 <= r * r:
                    s.put(x, y, ch, solo_vuoto)

    def luna(s, scuri, chiaro='J', medio='j'):
        N = [r[:] for r in s.G]
        for y in range(s.h):
            for x in range(s.w):
                if s.G[y][x] in scuri and s.get(x, y - 1) == '.':
                    N[y][x] = chiaro if s.get(x - 1, y) != '.' and s.get(x + 1, y) != '.' else medio
        s.G = N

    def contorno(s):
        N = [r[:] for r in s.G]
        for y in range(s.h):
            for x in range(s.w):
                if s.G[y][x] == '.' and any(s.get(x + a, y + b) not in '.o' for a, b in ((1, 0), (-1, 0), (0, 1), (0, -1))):
                    N[y][x] = 'o'
        s.G = N
        return s

    def righe(s):
        return [''.join(r) for r in s.G]

    def parte(s, dentro, ramp, luce=True, trama=None):
        """riempie i pixel dove dentro(x,y): chiaro sul bordo alto, scuro sul bordo basso e dietro"""
        hi, mid, lo = ramp
        M = {(x, y) for y in range(s.h) for x in range(s.w) if dentro(x + .5, y + .5)}
        for (x, y) in M:
            su, giu = (x, y - 1) in M, (x, y + 1) in M
            ch = mid
            if not giu or (x, y + 2) not in M and (x - 1, y + 1) not in M:
                ch = lo
            if luce and not su:
                ch = hi
            if trama:
                ch = trama(x, y, ch) or ch
            s.G[y][x] = ch
        return M

    def ell(s, cx, cy, rx, ry, ramp, **k):
        return s.parte(lambda x, y: ((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2 <= 1, ramp, **k)

    def poli(s, pts, ramp, **k):
        def dentro(px, py):
            d = False
            for i in range(len(pts)):
                (ax, ay), (bx, by) = pts[i], pts[(i + 1) % len(pts)]
                if (ay > py) != (by > py) and px < ax + (py - ay) * (bx - ax) / (by - ay):
                    d = not d
            return d
        return s.parte(dentro, ramp, **k)

    def gamba(s, x0, y0, x1, y1, ramp, spess=1):
        """una zampa: linea spessa, chiara davanti, scura dietro"""
        n = int(max(abs(x1 - x0), abs(y1 - y0))) + 1
        for i in range(n + 1):
            t = i / n
            x, y = x0 + (x1 - x0) * t, y0 + (y1 - y0) * t
            for d in range(spess):
                s.put(x + d, y, ramp[1] if d < spess - 1 or spess == 1 else ramp[2])
