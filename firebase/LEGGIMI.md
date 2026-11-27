# Regole Firebase per Hollowmere (livello 2)

Il gioco usa il Realtime Database del progetto `wandertutto`, sotto il nodo `hollowmere/`.
Con queste regole:

- **ogni giocatore ha un'identità anonima** creata in automatico da Firebase (nessuna schermata di login);
- **un salvataggio appartiene a chi l'ha creato**: solo quell'identità può riscriverlo, così come la sua scheda di villaggio e la sua presenza online;
- per continuare su **un altro dispositivo** servono il codice (HM-XXXXXX) e la **chiave di recupero** (XXXX-XXXX), che il giocatore trova nel menu → Salvataggio;
- **missioni, eventi e novità della bacheca comune** li scrive solo chi è segnato come admin (login Google su `fusco.html`);
- Registro, lapidi, eredi e chat si possono solo **aggiungere**, mai modificare o cancellare; testi con lunghezza massima;
- le visite ricevute le legge e le cancella solo il proprietario del villaggio;
- **la Gazzetta della Valle** (il «social» col piccione): ognuno pubblica e toglie solo i propri biglietti (testo fino a 240 caratteri; le «fotografie» non sono immagini ma scene del gioco in testo, che il gioco ridisegna: le regole rifiutano qualsiasi immagine), dà o toglie solo le proprie piume, commenta a nome proprio; **un biglietto ogni 20 ore** per giocatore (nodo `gazzetta/ultimo`), che l'autore può correggere (solo il testo) o togliere.

## Aggiornamento: salvataggi non più elencabili, schede leggere per la regia

Ripubblica il blocco `"hollowmere"`. Cambia due cose:

- **`players`**: prima chiunque poteva scaricare in un colpo i salvataggi di tutti (`".read": true` sul ramo intero).
  Ora si legge **un salvataggio alla volta, conoscendone il codice** (`players/$pid`): visite, amici e cambio di
  dispositivo funzionano come prima. L'elenco intero lo legge solo l'admin.
- **`schede`** (ramo nuovo): a ogni salvataggio il gioco scrive anche una scheda leggera (nome, giorno, capitolo, ora).
  `fusco.html` legge queste, non più i salvataggi completi: da molti megabyte a pochi kilobyte, e niente più
  salvataggi interi che arrivano alla regia ogni volta che qualcuno salva. Le schede le legge solo l'admin.

Dopo aver ripubblicato le regole, apri `fusco.html`, accedi e premi **«Ricostruisci l'elenco dai salvataggi»** una
volta sola: così compaiono anche i giocatori che non hanno più salvato dall'aggiornamento.

## Aggiornamento: la Gazzetta e le visite

Se le regole sono già pubblicate, ripubblica il blocco `"hollowmere"`: contiene il ramo nuovo `"gazzetta"` e, in `"visite"`,
l'elenco completo dei tipi di messaggio usati dal gioco (lavorare insieme nel villaggio di un amico, doni, scudi, lettere).
Con l'elenco vecchio quelle azioni venivano rifiutate.

## Aggiornamento: casse in cooperativo e missione comune

Ripubblica il blocco `"hollowmere"`: in `"visite"` l'elenco dei tipi ora comprende anche `cop` (mettere e prendere
dalle casse e dalle macchine di un amico) e `ins`, `insc`, `insp` (la missione comune). Con l'elenco vecchio
quei messaggi venivano rifiutati: l'amico non vedeva le cose messe nelle sue casse.

## Cosa fare nella console Firebase (una volta sola)

1. **Authentication → Metodo di accesso**: attiva **Anonimo** e **Google**.
2. **Authentication → Impostazioni → Domini autorizzati**: aggiungi il dominio dove è pubblicato il gioco (su Vercel: il dominio di produzione, es. `nome-progetto.vercel.app`, più l'eventuale dominio personalizzato; le anteprime di Vercel non funzionano col login Google).
3. Nelle regole, al posto di `EMAIL_DEL_REGISTA` metti l'email Google di chi gestisce `fusco.html`.
4. Apri `fusco.html` e premi **Accedi con Google**: al primo accesso con quell'email diventi admin da solo.
5. **Realtime Database → Regole**: il progetto `wandertutto` potrebbe servire anche ad altre app, quindi **non sostituire** le regole esistenti. Copia il blocco `"hollowmere": { … }` di `regole.json` dentro `"rules"`, accanto a quello che c'è già, e premi **Pubblica**.
6. Prova con il simulatore della console: una scrittura su `hollowmere/missioni` senza login deve essere rifiutata.

## Ordine consigliato

1. Pubblicare la nuova versione del gioco: con le regole di oggi, ancora aperte, funziona già, e ogni giocatore "prende possesso" del proprio codice al primo salvataggio.
2. Lasciare passare qualche giorno, così i giocatori attivi registrano i loro salvataggi.
3. Attivare le regole.

Un salvataggio mai più aperto dopo l'aggiornamento resta senza proprietario. Con le regole attive, il primo che lo carica da codice ne diventa proprietario.
