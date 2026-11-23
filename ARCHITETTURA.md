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
   Per decidere *se e quando* chiamare la funzione originale (sostituirla in certi casi, cambiarne il
   risultato) si usa un involucro. La funzione originale si dichiara come catena, l'involucro si iscrive:
   ```js
   // file originale
   function nomeBase(x, y) { /* ... */ }
   function nome(...a) { return Ext.catena('nome', nomeBase, this, a); }
   // un altro file
   Ext.avvolgi('nome', function (prossimo, x, y) { if (speciale) return 1; return prossimo(x, y); });
   ```
   L'ultimo involucro iscritto è il più esterno. Il test `toppe` non ammette nessuna sovrascrittura
   (né `nome = function…` né `window[nome] = …`): il tetto è zero. Per convertire in blocco: `tools/a_catena.js`.
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
| `porta:intercetta` | il giocatore usa la porta di un edificio del paese (`o`); chi restituisce qualcosa la gestisce |
| `contenitore` | il giocatore ha cambiato una cassa o una macchina (`k`, `tipo`, `ops`): in cooperativo parte come operazione |
| `fatto` | un'azione che conta per la missione comune e per le faccende (`tipo`: annaffia, raccogli, albero, falcia; `n`) |
| `posta:intercetta` (`Ext.intercetta('posta', a)`) | un messaggio dalla posta (`visite/<pid>`); chi lo gestisce restituisce `true` |
| `mira` | chi o cosa si può toccare davanti al giocatore (`C`, `ax`, `ay`, `m`): si aggiunge `{ k: 'ext', d, act(), fumetto() }` a `C` |
| `arredo` (`Ext.intercetta('arredo', o)`) | il giocatore tocca un mobile di casa senza un'azione sua (la ciotola, la cuccia…) |

## Mappa dei file (in ordine di caricamento)
- **Motore**: `core.js` (stato, input, effetti sonori, Ext), `calendario.js` (giorni, stagioni, anni), `musica.js` (la colonna sonora: brani scritti come dati —
  temi in gradi della scala, accordi in numeri romani — strumenti sintetizzati, l'«ombra» che mette angoscia anche nei
  brani allegri; il brano lo sceglie `chooseMusic` in `main.js`), `art.js` (pixel art generata), `world.js` (mappe, rendering),
  `ui.js`, `net.js` (Firebase), `main.js` (avvio, ciclo, giorni), `update.js` (aggiornamenti automatici).
- **Storia**: `farm.js`, `npc.js`, `life.js`, `story.js`, `cine.js`, `ambient.js`, `relations.js`, `feste.js`.
- **La Valle (gioco libero)**: `free.js`, `animals.js`, `build.js`, `garden.js`, `macchine.js` (abilità, macchine,
  alberi da frutto), `trade.js`, `anim.js`, `valle.js`, `espansione.js` (rango, zone, nuovi abitanti), `costruire.js`,
  `miniera.js`, `sempre.js` (museo, traguardi, eventi), `rango.js`, `vita.js` (giornate e chiacchiere degli abitanti),
  `aspetto.js`, `zaino.js` (zaino, casse e la riparazione dei contenitori), `compagno.js` (il cane o il gatto:
  adozione, Segui/Resta, bottega), `contenuti.js` (colture, alberi, animali, ricette aggiunti di recente).
- **Multiplayer**: `mp.js`, `missions.js`, `chat.js`, `coop.js`, `scambi.js`, `postino.js`, `coop_vivo.js`.
- **Grafica rifatta**: `grafica.js` (personaggi, edifici, animali, attrezzi, cibi, atmosfera, strutture animate).
- **Natura**: `natura_flora.js` (colture, alberi, selvatici), `natura_macchine.js` (frantoio, essiccatoio, zangola,
  alambicco, seminatrice, compostiera, forno a legna: ognuna con la sua animazione), `natura_cucina.js` (ricette che si
  imparano dagli abitanti, da soli o con l'esperienza; effetti dei piatti), `natura_fauna.js` (animali selvatici e
  taccuino del naturalista). La grafica si fa nel punto `arte`; macchine e animali si disegnano con `listaMondo`.
- **Porte**: `porte.js` — bussare a chi è in casa (esce e parla, o risponde da dietro la porta; di notte, nella storia,
  vale la Regola III), il biglietto sulla porta se non c'è, e `Porte.dove(id)` per il taccuino. Battute in `BUSSA_TESTI`.
- **Gazzetta**: `gazzetta.js` — il «social» della Valle (multiplayer): trespolo, Pennino il piccione, fotografie seppia,
  piume, commenti, gara della settimana. Dati in `hollowmere/gazzetta` (regole in `firebase/regole.json`).
- **Novità**: `novita.js` — ogni aggiornamento ha una voce che Ottavio il postino annuncia ai giocatori (tranne la wiki).
- **Wiki**: `wiki.js` (in fondo a tutto). Si costruisce dal vivo dai dati del gioco: un oggetto, una ricetta, una
  coltura, un animale o un abitante nuovo compare da solo, con la sua icona. È privata (nessun pulsante): si apre con
  `#wiki=CHIAVE` in fondo all'indirizzo; «Salva PDF» la stampa. Per un easter egg nuovo basta aggiungere `dove: '…'` ai suoi dati.
  I testi di racconto (lore, capitoli, finali) sono scritti in `wiki.js`: se cambia la storia, aggiornali lì.

## Strumenti di manutenzione (`tools/`)
Script usati per i lavori di pulizia (spostare funzioni, togliere toppe, convertirle in `Ext`). Non fanno parte del gioco.

## Verso i moduli JavaScript (tappa 3)
L'obiettivo è che ogni file diventi un modulo (`import`/`export`) invece di condividere tutto come nome globale.
Per farlo senza cambiare l'ordine in cui il gioco parte, **ogni file deve usare solo file caricati prima di lui**.
- `node tools/dipendenze.js` — per ogni file: quanti nomi definisce, quanti ne usa da altri e da chi è usato;
  `--cicli` mostra i gruppi di file intrecciati.
- `node tools/ordine_moduli.js` — simula l'avvio come moduli e conta le letture che si romperebbero.
- Il test `toppe` controlla che nessun file scriva le variabili di un altro e che i **riferimenti all'indietro**
  (nomi presi da un file caricato dopo) non aumentino: il tetto in `tests/toppe.json` può solo scendere.

Come si toglie un riferimento all'indietro: si sposta la cosa usata in un file che viene prima (utilità pure,
dati), oppure chi sta prima offre un punto di estensione (`Ext.run`/`Ext.avvolgi`) e chi sta dopo si iscrive.

## Pixel art disegnata a mano (`tools/pixel/`)
Le teste del protagonista (e in futuro gli altri personaggi) sono disegnate a mano, pixel per pixel, come griglie
di lettere: ogni lettera è un colore (`S` pelle, `R` capelli, `e` occhi, `o` contorno…).
- `teste.pxs` — le teste a mano (capelli corti) di fronte, di fianco e di spalle. **Si modifica qui.**
- `teste_varianti.py` — ricava le altre acconciature del menu Aspetto (lunghi, raccolti, spettinati, rasati) e
  scrive `teste_tutte.pxs` (generato).
- `studio.py` — disegna la tavola ingrandita con la griglia e la grandezza di gioco, controlla gli errori ed
  esporta i dati per il gioco:
  ```
  python3 tools/pixel/teste_varianti.py
  python3 tools/pixel/studio.py tools/pixel/teste_tutte.pxs --out tavola.png --js js/teste_mano.js --nome TESTE_MANO
  ```
Nel gioco (`grafica.js`) chi ha `mano: 1` nell'aspetto usa la testa a mano: le lettere si ricolorano con pelle,
capelli, occhi e labbra scelti; il ritratto è la stessa testa ingrandita 3 volte, con le espressioni.
Corpo, vestiti, passi e braccia con gli attrezzi restano del motore a parti, nello stesso stile.
