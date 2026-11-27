// finto Realtime Database: lo stato vero sta in Node (window.__fbOp), qui una copia aggiornata da __fbSync
const W = window;
W.__fbDB = W.__fbDB || {};
const L = new Set();
const clone = v => (v === undefined ? null : JSON.parse(JSON.stringify(v)));
const norm = p =>
  String(p || '')
    .split('/')
    .filter(Boolean)
    .join('/');
const at = p => {
  let o = W.__fbDB;
  for (const k of norm(p).split('/').filter(Boolean)) {
    if (o == null || typeof o !== 'object') return null;
    o = o[k];
  }
  return o === undefined ? null : o;
};
export const getDatabase = () => ({});
export function ref(db, p) {
  p = norm(p);
  return { path: p, key: p.split('/').pop() || null, q: [] };
}
export const limitToLast = n => ({ t: 'ltl', n });
export const orderByChild = k => ({ t: 'obc', k });
export const orderByKey = () => ({ t: 'obk' });
export const query = (r, ...q) => ({ path: r.path, key: r.key, q });
function evalQ(r) {
  if (r.path === '.info/connected') return true;
  let v = at(r.path);
  if (!r.q || !r.q.length || v == null || typeof v !== 'object') return clone(v);
  let e = Object.entries(v);
  const ob = r.q.find(x => x.t === 'obc');
  e.sort((a, b) => (ob ? ((a[1] && a[1][ob.k]) || 0) - ((b[1] && b[1][ob.k]) || 0) : a[0] < b[0] ? -1 : 1));
  const l = r.q.find(x => x.t === 'ltl');
  if (l) e = e.slice(-l.n);
  return clone(Object.fromEntries(e));
}
const snap = (r, v) => ({
  key: r.key,
  ref: r,
  val: () => clone(v),
  exists: () => v != null,
  forEach(f) {
    if (v && typeof v === 'object')
      for (const k of Object.keys(v)) f(snap(ref(null, r.path + '/' + k), v[k]));
  }
});
function fire() {
  for (const l of [...L]) {
    const v = evalQ(l.r),
      j = JSON.stringify(v);
    if (l.kind === 'value') {
      if (j !== l.last) {
        l.last = j;
        try {
          l.cb(snap(l.r, v));
        } catch (e) {
          console.error(e);
        }
      }
    } else {
      const o = v && typeof v === 'object' ? v : {};
      for (const k of Object.keys(o))
        if (!l.seen.has(k)) {
          l.seen.add(k);
          try {
            l.cb(snap(ref(null, l.r.path + '/' + k), o[k]));
          } catch (e) {
            console.error(e);
          }
        }
    }
  }
}
W.__fbSync = db => {
  W.__fbDB = db;
  fire();
};
export function onValue(r, cb) {
  const l = { kind: 'value', r, cb, last: undefined };
  L.add(l);
  setTimeout(fire, 0);
  return () => L.delete(l);
}
export function onChildAdded(r, cb) {
  const l = { kind: 'child', r, cb, seen: new Set() };
  L.add(l);
  setTimeout(fire, 0);
  return () => L.delete(l);
}
const op = (kind, path, value) =>
  W.__fbOp(kind, path, clone(value)).then(res => {
    if (res && res.err) {
      const e = new Error(res.err);
      e.code = res.err;
      throw e;
    }
  });
export const get = async r => snap(r, evalQ(r));
export const set = (r, v) => op('set', r.path, v);
export const update = (r, v) => op('update', r.path, v);
export const remove = r => op('set', r.path, null);
let cnt = 0;
export function push(r, v) {
  const k = 'k' + Date.now().toString(36) + (cnt++).toString(36) + Math.random().toString(36).slice(2, 6);
  const c = ref(null, r.path + '/' + k);
  if (v === undefined) return c;
  const p = set(c, v);
  c.then = p.then.bind(p);
  c.catch = p.catch.bind(p);
  return c;
}
export async function runTransaction(r, fn) {
  const cur = evalQ(r);
  const nv = fn(cur);
  if (nv === undefined) return { committed: false, snapshot: snap(r, cur) };
  await set(r, nv);
  return { committed: true, snapshot: snap(r, nv) };
}
export function onDisconnect(r) {
  W.__fbOnDisc = W.__fbOnDisc || [];
  return {
    remove() {
      W.__fbOnDisc.push(r.path);
      return Promise.resolve();
    },
    set() {
      return Promise.resolve();
    },
    cancel() {
      return Promise.resolve();
    }
  };
}
