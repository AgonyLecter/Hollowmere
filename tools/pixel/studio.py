#!/usr/bin/env python3
"""Studio di pixel art di Hollowmere (strumento di sviluppo, non fa parte del gioco).

Gli sprite si scrivono a mano in file .pxs: una tavolozza (una lettera = un colore) e una o più griglie.

    python3 tools/pixel/studio.py FILE.pxs [--out tavola.png] [--js uscita.js]

Formato .pxs
    # commento
    @tavolozza
    o #1a1214        contorno
    S #eab48a        pelle
    ...
    @ombra S=s C=c   (facoltativo) a quale colore passa ogni colore nelle ombre dello specchio
    @sprite nome 24x46 specchio      'specchio': si scrive solo la metà sinistra, la destra si ricava
    ....oooo                         '.' è trasparente
    ...

Con 'specchio' la metà destra è il riflesso della sinistra; i pixel a meno di 2 dal bordo destro
passano al colore d'ombra (luce da sinistra). Un '|' nella riga separa le colonne da NON specchiare
(per esempio un dettaglio solo a sinistra): quello che segue '|' va scritto per intero a destra.

La tavola mostra ogni sprite ingrandito con la griglia, e accanto a grandezza di gioco (x1 e x2).
I controlli segnalano: colori non in tavolozza, pixel isolati (rumore), righe di lunghezza sbagliata.
"""
import sys, re, json
from PIL import Image, ImageDraw


def leggi(path):
    pal, ombra, sprites = {}, {}, []
    cur = None
    for n, raw in enumerate(open(path, encoding='utf8'), 1):
        line = raw.rstrip('\n')
        if not line.strip() or line.lstrip().startswith('#'):
            continue
        if line.startswith('@tavolozza'):
            cur = 'pal'
            continue
        if line.startswith('@ombra'):
            for kv in line.split()[1:]:
                a, b = kv.split('=')
                ombra[a] = b
            continue
        if line.startswith('@sprite'):
            p = line.split()
            w, h = map(int, p[2].split('x'))
            cur = {'nome': p[1], 'w': w, 'h': h, 'specchio': 'specchio' in p, 'righe': [], 'riga0': n + 1}
            sprites.append(cur)
            continue
        if cur == 'pal':
            m = re.match(r'\s*(\S)\s+(#[0-9a-fA-F]{6})', line)
            if m:
                pal[m.group(1)] = m.group(2)
            continue
        if isinstance(cur, dict):
            cur['righe'].append(line.split('#')[0].rstrip() if ' #' in line else line.rstrip())
    return pal, ombra, sprites


def componi(sp, ombra, problemi):
    w, h = sp['w'], sp['h']
    out = []
    for i, r in enumerate(sp['righe']):
        if sp['specchio']:
            sx, _, extra = r.partition('|')
            half = w // 2
            if len(sx) != half:
                problemi.append(f"{sp['nome']} riga {i + 1}: la metà sinistra è lunga {len(sx)}, deve essere {half}")
                sx = (sx + '.' * half)[:half]
            dx = list(reversed(sx))
            fuori = lambda j: j >= len(dx) or dx[j] in '.o'
            dx = [ombra.get(c, c) if (fuori(k + 1) or fuori(k + 2)) else c for k, c in enumerate(dx)]
            riga = sx + ''.join(dx)
            if extra:  # sovrascrive la parte destra a partire dal centro
                riga = sx + (extra + riga[half + len(extra):])[:half]
        else:
            riga = r
            if len(riga) != w:
                problemi.append(f"{sp['nome']} riga {i + 1}: lunga {len(riga)}, deve essere {w}")
        out.append((riga + '.' * w)[:w])
    if len(out) != h:
        problemi.append(f"{sp['nome']}: {len(out)} righe, ne servono {h}")
    while len(out) < h:
        out.append('.' * w)
    return out[:h]


def controlla(nome, griglia, pal, problemi):
    h, w = len(griglia), len(griglia[0])
    for y, r in enumerate(griglia):
        for x, c in enumerate(r):
            if c != '.' and c not in pal:
                problemi.append(f"{nome} ({x},{y}): '{c}' non è in tavolozza")
    # pixel isolati: un colore diverso da tutti e 4 i vicini, che non sia contorno né occhio
    isolati = 0
    for y in range(1, h - 1):
        for x in range(1, w - 1):
            c = griglia[y][x]
            if c in '.o':
                continue
            vic = [griglia[y - 1][x], griglia[y + 1][x], griglia[y][x - 1], griglia[y][x + 1]]
            if all(v != c for v in vic) and all(v != '.' for v in vic):
                isolati += 1
    return isolati


def hexrgb(h):
    return tuple(int(h[i:i + 2], 16) for i in (1, 3, 5))


def disegna(griglia, pal, scala):
    h, w = len(griglia), len(griglia[0])
    im = Image.new('RGBA', (w * scala, h * scala), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    for y, r in enumerate(griglia):
        for x, c in enumerate(r):
            if c in pal:
                d.rectangle([x * scala, y * scala, x * scala + scala - 1, y * scala + scala - 1], fill=hexrgb(pal[c]))
    return im


def tavola(sprites, pal, path, sfondo=(122, 106, 58)):
    Z = 10
    blocchi = []
    for nome, g in sprites:
        big = disegna(g, pal, Z)
        gd = ImageDraw.Draw(big)
        for x in range(0, big.width, Z):
            gd.line([x, 0, x, big.height], fill=(0, 0, 0, 40))
        for y in range(0, big.height, Z):
            gd.line([0, y, big.width, y], fill=(0, 0, 0, 40))
        blocchi.append((nome, big, disegna(g, pal, 2), disegna(g, pal, 4)))
    W = sum(b[1].width + b[3].width + 60 for b in blocchi) + 20
    H = max(b[1].height for b in blocchi) + 60
    T = Image.new('RGB', (W, H), sfondo)
    d = ImageDraw.Draw(T)
    x = 20
    for nome, big, x2, x4 in blocchi:
        d.text((x, 6), nome, fill=(255, 245, 220))
        T.paste(big, (x, 30), big)
        T.paste(x4, (x + big.width + 20, 30), x4)
        T.paste(x2, (x + big.width + 20, 40 + x4.height), x2)
        x += big.width + x4.width + 60
    T.save(path)


def main():
    a = sys.argv[1:]
    if not a:
        print(__doc__)
        return
    src = a[0]
    out = a[a.index('--out') + 1] if '--out' in a else re.sub(r'\.pxs$', '', src) + '_tavola.png'
    pal, ombra, sprites = leggi(src)
    problemi, fatti = [], []
    for sp in sprites:
        g = componi(sp, ombra, problemi)
        iso = controlla(sp['nome'], g, pal, problemi)
        fatti.append((sp['nome'], g))
        print(f"{sp['nome']}: {sp['w']}x{sp['h']}, pixel isolati {iso}")
    tavola(fatti, pal, out)
    print('tavola:', out)
    if '--js' in a:
        js = a[a.index('--js') + 1]
        dati = {'tavolozza': pal, 'sprite': {n: g for n, g in fatti}}
        open(js, 'w', encoding='utf8').write(json.dumps(dati, ensure_ascii=False, indent=1))
        print('dati:', js)
    for p in problemi:
        print('!', p)


if __name__ == '__main__':
    main()
