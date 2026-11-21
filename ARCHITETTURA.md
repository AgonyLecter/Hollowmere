# Hollowmere: come è fatto il codice

Il gioco è HTML + JavaScript puro, **senza compilazione**: `index.html` carica gli script di `js/` in ordine
e il sito si pubblica così com'è. `package.json` serve solo agli sviluppatori (test e formattazione).

## Regole
1. **Prima di ogni modifica, e dopo:** `npm test` (vedi `tests/LEGGIMI.md`). Se l'impronta cambia senza che tu
   l'abbia voluto, qualcosa si è rotto. Se l'hai voluto: `npm run test:aggiorna`.
2. **Non sovrascrivere le funzioni di un altro file.** Usa i punti di estensione (`Ext`, in `js/core.js`):
   ```js
   Ext.on('applyFree', (m, st) => { /* dopo che la mappa della Valle è pronta */ });
   Ext.on('applyFree:prima', (m, st) => { /* prima */ });
   Ext.on('freeAct:intercetta', (fx, fy) => { if (gestito) return true; });   // azione nella Valle
   ```
   Il test `toppe` conta le sovrascritture rimaste e non permette che aumentino.
3. **Formattazione automatica:** `npm run format` (Prettier) prima di salvare.
4. **Un file nuovo** va aggiunto sia in `index.html` sia nella lista `CORE` di `sw.js`, nello stesso ordine,
   e a ogni pubblicazione si cambia `CACHE` in `sw.js` (così i telefoni si aggiornano da soli).
5. **I salvataggi dei giocatori** (`G.st`) vanno solo estesi, mai rinominati: le partite vecchie devono restare valide.

## Punti di estensione disponibili
| Punto | Quando |
|---|---|
| `applyFree` / `applyFree:prima` | quando si costruisce la mappa della Valle |
| `freeAct:intercetta` | il giocatore agisce su una casella nella Valle |
| `freeMorning` / `freeMorning:prima` | ogni mattina nella Valle |
| `mpTick` | ogni fotogramma, cose della Valle e del multiplayer |
| `drawWorldExtras` | disegno sopra gli oggetti del mondo |
| `drawAmbTop` | disegno sopra il buio (luci, bagliori) |
| `listaMondo` | aggiungere cose da disegnare in ordine di profondità (`{ sy, draw }`, oppure `disegna` su un oggetto) |
| `arte` | alla fine del caricamento: disegnare la grafica dei file aggiunti |
| `ottieni` | qualcosa è entrato nello zaino (`id`, `n`) |
| `mangia` | il giocatore ha mangiato un piatto (`id`) |

## Mappa dei file (in ordine di caricamento)
- **Motore**: `core.js` (stato, input, audio, Ext), `art.js` (pixel art generata), `world.js` (mappe, rendering),
  `ui.js`, `net.js` (Firebase), `main.js` (avvio, ciclo, giorni), `update.js` (aggiornamenti automatici).
- **Storia**: `farm.js`, `npc.js`, `life.js`, `story.js`, `cine.js`, `ambient.js`, `relations.js`, `feste.js`.
- **La Valle (gioco libero)**: `free.js`, `animals.js`, `build.js`, `garden.js`, `macchine.js` (abilità, macchine,
  alberi da frutto), `trade.js`, `anim.js`, `valle.js`, `espansione.js` (rango, zone, nuovi abitanti), `costruire.js`,
  `miniera.js`, `sempre.js` (museo, traguardi, eventi), `rango.js`, `vita.js` (giornate e chiacchiere degli abitanti),
  `aspetto.js`, `zaino.js`, `contenuti.js` (colture, alberi, animali, ricette aggiunti di recente).
- **Multiplayer**: `mp.js`, `missions.js`, `chat.js`, `coop.js`, `scambi.js`, `postino.js`, `coop_vivo.js`.
- **Grafica rifatta**: `grafica.js` (personaggi, edifici, animali, attrezzi, cibi, atmosfera, strutture animate).
- **Natura**: `natura_flora.js` (colture, alberi, selvatici), `natura_macchine.js` (frantoio, essiccatoio, zangola,
  alambicco, seminatrice, compostiera, forno a legna: ognuna con la sua animazione), `natura_cucina.js` (ricette che si
  imparano dagli abitanti, da soli o con l'esperienza; effetti dei piatti), `natura_fauna.js` (animali selvatici e
  taccuino del naturalista). La grafica si fa nel punto `arte`; macchine e animali si disegnano con `listaMondo`.
- **Wiki**: `wiki.js` (in fondo a tutto). Si costruisce dal vivo dai dati del gioco: un oggetto, una ricetta, una
  coltura, un animale o un abitante nuovo compare da solo, con la sua icona. È privata (nessun pulsante): si apre con
  `#wiki=CHIAVE` in fondo all'indirizzo; «Salva PDF» la stampa. Per un easter egg nuovo basta aggiungere `dove: '…'` ai suoi dati.
  I testi di racconto (lore, capitoli, finali) sono scritti in `wiki.js`: se cambia la storia, aggiornali lì.

## Strumenti di manutenzione (`tools/`)
Script usati per i lavori di pulizia (spostare funzioni, togliere toppe, convertirle in `Ext`). Non fanno parte del gioco.
