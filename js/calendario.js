'use strict';
// ================= CALENDARIO =================
// Giorni, stagioni e anni: funzioni pure sullo stato (G.st), usate da quasi tutti i file.
// Nella storia è sempre autunno; nel gioco libero (st.free) le stagioni girano ogni SEASON_LEN giorni.

const DAYN = ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'];

// ---------- stagioni ----------
const SEASONS = ['Autunno', 'Inverno', 'Primavera', 'Estate'];
const SEASON_LEN = 28;
const isFree = st => !!((st || G.st) && (st || G.st).free);
function seasonOf(st) {
  st = st || G.st;
  if (!isFree(st)) return 0;
  return Math.floor((st.day - st.free.start) / SEASON_LEN) % 4;
}
function seasonDay(st) {
  st = st || G.st;
  if (!isFree(st)) return st.day;
  return ((st.day - st.free.start) % SEASON_LEN) + 1;
}
function yearOf(st) {
  st = st || G.st;
  if (!isFree(st)) return 1;
  return Math.floor((st.day - st.free.start) / (SEASON_LEN * 4)) + 1;
}
const seasonName = st => SEASONS[seasonOf(st)];
function dateLabel(st) {
  st = st || G.st;
  return `${DAYN[(st.day + 3) % 7]} ${seasonDay(st)} · ${seasonName(st)}${isFree(st) && yearOf(st) > 1 ? ' · anno ' + yearOf(st) : ''}`;
}
