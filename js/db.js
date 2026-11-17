// =====================================================================
// Camada de dados (v0.1): localStorage + IndexedDB para mídias.
// Pensada para ser trocada por um backend (Firebase/Supabase) depois,
// mantendo a mesma interface (DB.all, DB.get, DB.add, DB.update...).
// =====================================================================
import { SEED } from "./seed.js";

const KEY = "clube_db_v1";
const SESSION = "clube_session_v1";
let state = null;

const uid = (p = "id") => p + "_" + Math.random().toString(36).slice(2, 9) + Date.now().toString(36).slice(-3);
export const nowISO = () => new Date().toISOString();

function load() {
  try { state = JSON.parse(localStorage.getItem(KEY)); } catch { state = null; }
  if (!state || state.__v !== 1) { state = structuredClone(SEED); state.__v = 1; save(); }
  return state;
}
function save() {
  try { localStorage.setItem(KEY, JSON.stringify(state)); }
  catch (e) { console.error(e); window.dispatchEvent(new CustomEvent("db:full")); }
}

export const DB = {
  init: load,
  reset() { localStorage.removeItem(KEY); load(); },
  all(col) { return state[col] || (state[col] = []); },
  get(col, id) { return this.all(col).find(x => x.id === id); },
  where(col, fn) { return this.all(col).filter(fn); },
  add(col, obj) { const o = { id: uid(col.slice(0, 2)), createdAt: nowISO(), ...obj }; this.all(col).push(o); save(); return o; },
  update(col, id, patch) { const o = this.get(col, id); if (o) { Object.assign(o, typeof patch === "function" ? patch(o) : patch); save(); } return o; },
  remove(col, id) { state[col] = this.all(col).filter(x => x.id !== id); save(); },
  settings() { return state.settings || (state.settings = {}); },
  setSetting(k, v) { this.settings()[k] = v; save(); },
  save,
  exportMine(userId) {
    const out = {};
    for (const [k, v] of Object.entries(state)) {
      if (!Array.isArray(v)) continue;
      out[k] = v.filter(x => x.userId === userId || x.id === userId || x.fromId === userId);
    }
    return out;
  }
};

// ---------------- Sessão ----------------
export const Session = {
  get() { try { return JSON.parse(localStorage.getItem(SESSION)); } catch { return null; } },
  set(s) { localStorage.setItem(SESSION, JSON.stringify(s)); },
  clear() { localStorage.removeItem(SESSION); },
  user() { const s = this.get(); return s ? DB.get("users", s.userId) : null; }
};

// ---------------- Mídias (IndexedDB) ----------------
const IDB_NAME = "clube_media", IDB_STORE = "blobs";
function idb() {
  return new Promise((res, rej) => {
    const r = indexedDB.open(IDB_NAME, 1);
    r.onupgradeneeded = () => r.result.createObjectStore(IDB_STORE);
    r.onsuccess = () => res(r.result);
    r.onerror = () => rej(r.error);
  });
}
export const Media = {
  async put(key, blob) {
    const d = await idb();
    return new Promise((res, rej) => { const t = d.transaction(IDB_STORE, "readwrite"); t.objectStore(IDB_STORE).put(blob, key); t.oncomplete = () => res(key); t.onerror = () => rej(t.error); });
  },
  async get(key) {
    const d = await idb();
    return new Promise((res, rej) => { const r = d.transaction(IDB_STORE).objectStore(IDB_STORE).get(key); r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error); });
  },
  async del(key) {
    const d = await idb();
    return new Promise(res => { const t = d.transaction(IDB_STORE, "readwrite"); t.objectStore(IDB_STORE).delete(key); t.oncomplete = res; });
  },
  async url(key) { const b = await this.get(key); return b ? URL.createObjectURL(b) : null; }
};

// ---------------- Gamificação ----------------
export const LEVELS = [
  { name: "Pena de galinha", min: 0,    color: "#E9C46A", icon: "🪶" },
  { name: "Ferro",           min: 60,   color: "#8a8f98", icon: "⚙" },
  { name: "Bronze",          min: 150,  color: "#b0753f", icon: "●" },
  { name: "Prata",           min: 300,  color: "#a9b3c1", icon: "◆" },
  { name: "Ouro",            min: 500,  color: "#D97706", icon: "★" },
  { name: "Platina",         min: 800,  color: "#6f8fa6", icon: "✦" },
  { name: "Diamante",        min: 1200, color: "#2A9D8F", icon: "◈" }
];
export const POINTS = { lido: 20, carta: 15, diario: 4, comentario: 2, roda: 3, avaliacao: 2, troca: 5, recomendacao: 3, midia: 5, entrevista: 40, releitura: 6, livroNovo: 5, sessao30: 1 };

export function scoreOf(userId) {
  const sh = DB.where("shelves", s => s.userId === userId);
  const mins = DB.where("sessions", s => s.userId === userId).reduce((a, s) => a + (+s.minutes || 0), 0);
  const parts = {
    "Livros lidos": sh.filter(s => s.status === "lido" || s.finishedAt).length * POINTS.lido,
    "Avaliações": sh.filter(s => s.rating).length * POINTS.avaliacao,
    "Releituras": sh.reduce((a, s) => a + (s.rereads?.length || 0), 0) * POINTS.releitura,
    "Cartas do leitor": DB.where("letters", x => x.userId === userId).length * POINTS.carta,
    "Diário de leitura": DB.where("diary", x => x.userId === userId).length * POINTS.diario,
    "Comentários": DB.where("comments", x => x.userId === userId && !x.target.startsWith("roda:")).length * POINTS.comentario,
    "Rodas de leitura": DB.where("comments", x => x.userId === userId && x.target.startsWith("roda:")).length * POINTS.roda,
    "Trocas e empréstimos": DB.where("trades", x => x.userId === userId).length * POINTS.troca,
    "Recomendações": DB.where("recs", x => x.fromId === userId).length * POINTS.recomendacao,
    "Áudios e vídeos": DB.where("media", x => x.userId === userId).length * POINTS.midia,
    "Entrevistas": DB.where("interviews", x => x.userId === userId).length * POINTS.entrevista,
    "Obras cadastradas": DB.where("books", x => x.addedBy === userId).length * POINTS.livroNovo,
    "Tempo de leitura": Math.floor(mins / 30) * POINTS.sessao30
  };
  const total = Object.values(parts).reduce((a, b) => a + b, 0);
  return { total, parts };
}
export function levelOf(points) {
  let i = 0; LEVELS.forEach((l, k) => { if (points >= l.min) i = k; });
  const cur = LEVELS[i], next = LEVELS[i + 1];
  const pct = next ? Math.round(((points - cur.min) / (next.min - cur.min)) * 100) : 100;
  return { ...cur, index: i, next, pct };
}

export const BADGES = [
  { id: "primeira-carta", name: "Primeira carta", icon: "✉", test: u => DB.where("letters", x => x.userId === u).length >= 1 },
  { id: "diarista", name: "Diarista (10 registros)", icon: "📓", test: u => DB.where("diary", x => x.userId === u).length >= 10 },
  { id: "maratonista", name: "Maratonista (5 lidos)", icon: "🏃", test: u => DB.where("shelves", x => x.userId === u && x.status === "lido").length >= 5 },
  { id: "roda-viva", name: "Roda viva", icon: "◎", test: u => DB.where("rodas", r => r.members.includes(u)).length >= 1 },
  { id: "releitor", name: "Releitor", icon: "↻", test: u => DB.where("shelves", x => x.userId === u && x.rereads?.length).length >= 1 },
  { id: "entrevistado", name: "Entrevistado", icon: "🎙", test: u => DB.where("interviews", x => x.userId === u).length >= 1 },
  { id: "generoso", name: "Generoso", icon: "🤝", test: u => DB.where("trades", x => x.userId === u).length >= 1 },
  { id: "meta", name: "Meta cumprida", icon: "🎯", test: u => { const usr = DB.get("users", u); const y = new Date().getFullYear(); return usr?.goal && readInYear(u, y) >= usr.goal; } }
];
export function readInYear(userId, year) {
  return DB.where("shelves", s => s.userId === userId && s.status === "lido" && s.finishedAt && new Date(s.finishedAt).getFullYear() === year).length;
}
export { uid };
