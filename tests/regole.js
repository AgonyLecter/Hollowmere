'use strict';
// 27. Le regole del database e il gioco vanno d'accordo: ogni tipo di messaggio tra villaggi che il gioco manda
// (MP.act) o sa ricevere deve essere nell'elenco ammesso da firebase/regole.json, altrimenti Firebase lo
// rifiuta in silenzio e l'amico non vede niente (com'è successo alle casse in cooperativo: «cop»).
const fs = require('fs'),
  path = require('path');
module.exports = async function (t, { ROOT }) {
  const R = JSON.parse(fs.readFileSync(path.join(ROOT, 'firebase/regole.json'), 'utf8')),
    H = R.rules ? R.rules.hollowmere : R.hollowmere,
    val = H.visite.$pid.$id['.validate'],
    m = val.match(/matches\(\/\^\(([^)]*)\)\$\/\)/),
    ammessi = new Set(m ? m[1].split('|') : []);
  t.true('regole: le visite hanno un elenco di tipi ammessi', ammessi.size > 0);
  const usati = new Set(),
    dir = path.join(ROOT, 'js');
  for (const f of fs.readdirSync(dir).filter(f => f.endsWith('.js'))) {
    const s = fs.readFileSync(path.join(dir, f), 'utf8');
    for (const x of s.matchAll(/MP\.act\([^;]*?\bt: '([a-z]+)'/g)) usati.add(x[1]);
    // le funzioni send(...) che passano da MP.act (coop, scambi): send({ t: '…' })
    if (/send = a => MP\.act/.test(s)) for (const x of s.matchAll(/send\(\{ t: '([a-z]+)'/g)) usati.add(x[1]);
    if (/MP\.act\(/.test(s)) for (const x of s.matchAll(/\{ t: '([a-z]+)', from/g)) usati.add(x[1]);
    // chi riceve: a.t === '…' nei file che ascoltano la posta delle visite
    if (/inbox|visite|MP\.act/.test(s)) for (const x of s.matchAll(/\ba\.t === '([a-z]+)'/g)) usati.add(x[1]);
  }
  t.true('regole: trovati i messaggi del gioco', usati.size >= 10);
  const mancano = [...usati].filter(x => !ammessi.has(x)).sort();
  t.eq('regole: ogni messaggio tra villaggi è ammesso dalle regole', mancano.join(', '), '');
  // i salvataggi si leggono uno alla volta (col codice), mai tutti insieme: l'elenco intero solo all'admin
  const admin = x => typeof x === 'string' && /hollowmere\/admin\//.test(x);
  t.true('regole: l’elenco dei salvataggi non è leggibile da tutti', admin(H.players['.read']));
  t.true('regole: un salvataggio si legge col suo codice (visite)', H.players.$pid['.read'] === true);
  t.true(
    'regole: le schede leggere per la regia le legge solo l’admin',
    !!H.schede && admin(H.schede['.read'])
  );
  // la regia legge le schede, non i salvataggi completi
  const fusco = fs.readFileSync(path.join(ROOT, 'fusco.html'), 'utf8');
  t.true(
    'regole: la regia non resta in ascolto sui salvataggi completi',
    !/onValue\([^;]*R\('players'\)/.test(fusco)
  );
};
