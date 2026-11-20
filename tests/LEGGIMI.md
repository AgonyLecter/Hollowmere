# Test automatici

```
npm test                    # tutti i test (circa un minuto)
node tests/run.js dati      # solo una parte: sintassi, dati, impronta, fumo
npm run test:aggiorna       # rifà l'impronta, SOLO dopo una modifica voluta a grafica o dati
```

- **sintassi**: ogni file JS è valido; `index.html` e `sw.js` elencano gli stessi script, nello stesso ordine.
- **dati**: ogni riferimento esiste (semi → colture, ricette → ingredienti, animali → case, abitanti → orari...).
- **impronta**: un codice per ognuna delle immagini generate e delle tabelle di dati, con il caso reso prevedibile.
  Se cambia senza che tu l'abbia voluto, qualcosa si è rotto. Utile per pulire o spostare codice.
- **fumo**: si gioca davvero, a grandi passi (prologo, paese, meteo, notte e Cavaliere, salvataggio e
  «Continua», la Valle con animali, colture, menu, un mese di mattine e quattro stagioni): nessun errore ammesso.

Su GitHub i test girano da soli a ogni pull request (`.github/workflows/test.yml`).
