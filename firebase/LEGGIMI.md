# Regole Firebase per Hollowmere (livello 2)

Il gioco usa il Realtime Database del progetto `wandertutto`, sotto il nodo `hollowmere/`.
Con queste regole:

- **ogni giocatore ha un'identità anonima** creata in automatico da Firebase (nessuna schermata di login);
- **un salvataggio appartiene a chi l'ha creato**: solo quell'identità può riscriverlo, così come la sua scheda di villaggio e la sua presenza online;
- per continuare su **un altro dispositivo** servono il codice (HM-XXXXXX) e la **chiave di recupero** (XXXX-XXXX), che il giocatore trova nel menu → Salvataggio;
- **missioni, eventi e novità della bacheca comune** li scrive solo chi è segnato come admin (login Google su `fusco.html`);
- Registro, lapidi, eredi e chat si possono solo **aggiungere**, mai modificare o cancellare; testi con lunghezza massima;
- le visite ricevute le legge e le cancella solo il proprietario del villaggio;
- **la Gazzetta della Valle** (il «social» col piccione): ognuno pubblica e toglie solo i propri biglietti (testo fino a 240 caratteri; le «fotografie» non sono immagini ma scene del gioco in testo, che il gioco ridisegna: le regole rifiutano qualsiasi immagine), dà o toglie solo le proprie piume, commenta a nome proprio.

## Aggiornamento: la Gazzetta e le visite

Se le regole sono già pubblicate, ripubblica il blocco `"hollowmere"`: contiene il ramo nuovo `"gazzetta"` e, in `"visite"`,
l'elenco completo dei tipi di messaggio usati dal gioco (lavorare insieme nel villaggio di un amico, doni, scudi, lettere).
Con l'elenco vecchio quelle azioni venivano rifiutate.

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
