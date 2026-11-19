# Regole Firebase per Hollowmere — proposta

Il gioco usa il Realtime Database del progetto `wandertutto`, sotto il nodo `hollowmere/`.
**Oggi il nodo non ha regole proprie**: chiunque può leggere e scrivere tutto, anche cancellare.

## Cosa scrive il gioco

| Nodo | Chi scrive | Cosa |
|---|---|---|
| `registro/` | ogni nuovo giocatore | nome e data d'arrivo (il Registro dei Nuovi Arrivati) |
| `lapidi/` | giocatori | frasi incise sulle lapidi del bosco (max 80 caratteri) |
| `eredi/` | chi ottiene il finale 2 | il proprio nome |
| `stats/arrivi` | ogni nuovo giocatore | contatore +1 |
| `players/{codice}` | il proprietario | salvataggio completo (serve per "Carica da codice" e per le visite) |
| `villaggi/{codice}` | chi è nel gioco libero | scheda pubblica del villaggio (stagione, bestie, costruzioni) |
| `presenza/{villaggio}/{codice}` | chi è in un villaggio | posizione in tempo reale (si cancella da sola all'uscita) |
| `chat/{villaggio}` | chi è in un villaggio | messaggi brevi (max 60 caratteri) |
| `visite/{codice}` | gli ospiti | annaffiature e regali per il proprietario, che li cancella dopo averli letti |
| `missioni/`, `eventi` | solo l'admin, da `fusco.html` | missioni ed evento globale |

## Il problema vero: senza login nessuno "è" nessuno

Le regole possono controllare **la forma** dei dati (lunghezze, campi, niente cancellazioni dove non servono),
ma senza Firebase Authentication **non possono sapere chi sta scrivendo**. Quindi, anche con le regole del livello 1:

- chi conosce il codice di un altro giocatore (e i codici sono visibili nella lista dei villaggi) **può sovrascrivergli il salvataggio**;
- `fusco.html`, senza login, resta usabile da chiunque ne trovi l'indirizzo.

## Tre livelli

**Livello 1 — solo regole, nessuna modifica al gioco** (`regole-livello1.json`)
- Blocca cancellazioni e scritture fuori forma: niente testi lunghissimi, niente cancellazione del Registro, delle lapidi o della chat.
- Il contatore può solo salire di 1.
- Missioni ed eventi scrivibili **solo dall'account admin**: richiede il login Google in `fusco.html`, che aggiungo io.
- Resta il rischio dei salvataggi sovrascrivibili da chi conosce un codice.

**Livello 2 — consigliato: login anonimo per i giocatori + Google per l'admin**
- Ogni giocatore riceve in automatico un'identità anonima di Firebase: non vede nessuna schermata di login.
- Il salvataggio `players/{codice}` registra chi l'ha creato; solo quell'identità può riscriverlo.
- "Carica da codice" su un altro dispositivo richiede un **codice segreto di recupero**, mostrato nel menu Salvataggio.
- Admin con login Google: solo il tuo account scrive missioni ed eventi.
- Tocca il gioco in pochi punti (`js/net.js`, menu Salvataggio, `fusco.html`). Lo implemento io quando decidi.

**Livello 3 — server (Cloud Functions)**
- Calcoli e premi verificati lato server, anti-cheat. Non serve per un gioco di questa dimensione.

## Attenzione: il database è condiviso

Il progetto `wandertutto` potrebbe ospitare anche altre app. Le regole valgono per **tutto** il database:
non incollare questo file al posto delle regole esistenti. Bisogna **aggiungere** il blocco `"hollowmere"`
dentro le regole già presenti (console Firebase → Realtime Database → Regole).

## Passi nella console Firebase (quando si decide)

1. Authentication → Sign-in method: attivare **Google**; per il livello 2 anche **Anonimo**.
2. Accedere una volta a `fusco.html` con il proprio account Google e copiare l'UID mostrato.
3. Realtime Database → Regole: unire il blocco `hollowmere` alle regole esistenti, sostituire `UID_DEL_TUO_ACCOUNT_ADMIN`, pubblicare.
4. Usare il simulatore di regole della console per provare una scrittura permessa e una vietata.
