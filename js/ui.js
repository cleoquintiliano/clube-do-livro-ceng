// Utilitários de interface
import { DB, levelOf, scoreOf } from "./db.js";

export const esc = (s = "") => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
export const $ = (s, r = document) => r.querySelector(s);
export const $$ = (s, r = document) => [...r.querySelectorAll(s)];

export function toast(msg, type = "") {
  const t = document.createElement("div");
  t.className = "toast" + (type ? " toast--" + type : "");
  t.textContent = msg;
  $("#toasts").appendChild(t);
  setTimeout(() => t.remove(), 3400);
}

export function modal(html, onMount) {
  const m = $("#modal");
  $("#modalBody").innerHTML = html;
  m.hidden = false;
  document.body.style.overflow = "hidden";
  const close = () => { m.hidden = true; document.body.style.overflow = ""; $("#modalBody").innerHTML = ""; };
  $$("[data-close]", m).forEach(b => b.onclick = close);
  document.addEventListener("keydown", function k(e) { if (e.key === "Escape") { close(); document.removeEventListener("keydown", k); } });
  bindNoPaste($("#modalBody"));
  onMount && onMount($("#modalBody"), close);
  const f = $("#modalBody input, #modalBody textarea, #modalBody select, #modalBody button");
  f && f.focus();
  return close;
}

export function fmtDate(iso, opts = { day: "2-digit", month: "short", year: "numeric" }) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("pt-BR", opts);
}
export function ago(iso) {
  const s = (Date.now() - new Date(iso)) / 1000;
  if (s < 0) return "em " + fmtDate(iso);
  if (s < 60) return "agora";
  if (s < 3600) return Math.floor(s / 60) + " min atrás";
  if (s < 86400) return Math.floor(s / 3600) + " h atrás";
  if (s < 86400 * 30) return Math.floor(s / 86400) + " d atrás";
  return fmtDate(iso);
}
export const initials = n => (n || "?").split(/\s+/).filter(Boolean).slice(0, 2).map(x => x[0]).join("").toUpperCase();

export function avatar(u, size = "") {
  if (!u) return "";
  const cls = "avatar" + (size ? " avatar--" + size : "");
  if (u.photo) return `<img class="${cls}" src="${u.photo}" alt="Foto de ${esc(u.name)}">`;
  return `<span class="${cls}" style="background:${u.avatarColor || "#2E6F40"}" aria-hidden="true">${esc(initials(u.name))}</span>`;
}
export function levelBadge(userId) {
  const lv = levelOf(scoreOf(userId).total);
  return `<span class="level" title="${lv.name}"><i style="background:${lv.color};color:#fff">${lv.icon}</i>${lv.name}</span>`;
}
export const userLink = u => u ? `<a href="#/leitor/${u.id}">${esc(u.name)}</a>` : "Leitor";

// ---------- Capas geradas (sem imagens protegidas) ----------
export function cover(b, lg = false) {
  if (!b) return "";
  const inner = b.cover
    ? `<img src="${b.cover}" alt="">`
    : `<span class="cover__orn"></span><span class="cover__t">${esc(b.title)}</span><span class="cover__a">${esc(b.author)}</span>`;
  return `<div class="cover${lg ? " cover--lg" : ""}" style="background:${b.color || "#1B365D"}" role="img" aria-label="Capa de ${esc(b.title)}">${inner}</div>`;
}
export function bookCard(b, sub) {
  return `<a class="bookcard" href="#/livro/${b.id}">${cover(b)}<h4>${esc(b.title)}</h4><p>${sub ?? esc(b.author)}</p></a>`;
}

// ---------- Avaliação com penas ----------
export const QUILL_LEVELS = ["", "Lápis de grafite", "Caneta esferográfica", "Pena de ganso", "Caneta-tinteiro", "Pena de ouro"];
const QUILL_SVG = `<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M20.7 2.3c-5.6.4-10.4 3.6-12.9 8.6l-1.6 3.3 1.7.8-2.6 5.6 1.4.7 2.6-5.6 1.7.8 1.6-3.3c.5-1 1.1-1.9 1.8-2.8l-2.8.2 3.8-2.2c2.3-2.2 4.6-4 5.3-6.1z"/></svg>`;
export function quills(value = 0, { input = false, lg = false, name = "rating" } = {}) {
  const v = Math.round(value || 0);
  let h = `<span class="quills${lg ? " quills--lg" : ""}" ${input ? `role="radiogroup" aria-label="Avaliação com penas" data-quills="${name}"` : `aria-label="${v} de 5 penas"`}>`;
  for (let i = 1; i <= 5; i++) {
    h += input
      ? `<button type="button" role="radio" aria-checked="${i === v}" class="${i <= v ? "on" : ""}" data-v="${i}" title="${i} · ${QUILL_LEVELS[i]}">${QUILL_SVG}</button>`
      : `<span class="q ${i <= v ? "on" : ""}">${QUILL_SVG}</span>`;
  }
  h += `</span>`;
  if (input) h += `<span class="quill-label" data-quill-label>${v ? QUILL_LEVELS[v] : "Toque para avaliar"}</span>`;
  return h;
}
export function avgRating(bookId) {
  const r = DB.where("shelves", s => s.bookId === bookId && s.rating).map(s => s.rating);
  return r.length ? { avg: r.reduce((a, b) => a + b, 0) / r.length, n: r.length } : { avg: 0, n: 0 };
}

// ---------- Escrita autoral: bloqueio de colar ----------
const BLOCK_TYPES = new Set(["insertFromPaste", "insertFromDrop", "insertFromYank", "insertFromPasteAsQuotation"]);
export function bindNoPaste(root = document) {
  $$("textarea[data-typed], input[data-typed]", root).forEach(el => {
    if (el.__np) return; el.__np = true;
    const warn = () => toast("Aqui vale a sua própria escrita: digite o texto, colar está desativado ✍️", "warn");
    el.addEventListener("paste", e => { e.preventDefault(); warn(); });
    el.addEventListener("drop", e => { e.preventDefault(); warn(); });
    el.addEventListener("beforeinput", e => { if (BLOCK_TYPES.has(e.inputType)) { e.preventDefault(); warn(); } });
    el.addEventListener("contextmenu", e => e.preventDefault());
    // Rede de segurança: blocos grandes inseridos de uma vez (ex.: teclados que colam sem evento)
    let last = el.value;
    el.addEventListener("input", e => {
      const jump = el.value.length - last.length;
      if (jump > 40 && e.inputType !== "insertText" && e.inputType !== "insertCompositionText") { el.value = last; warn(); }
      last = el.value;
      const c = el.parentElement.querySelector("[data-count]");
      if (c) c.textContent = el.value.length + (el.maxLength > 0 ? " / " + el.maxLength : "") + " caracteres";
    });
    if (!el.parentElement.querySelector(".nopaste-hint")) {
      el.insertAdjacentHTML("afterend", `<div class="row between"><span class="nopaste-hint">✍️ Escrita autoral: colar texto está desativado.</span><span class="counter" data-count></span></div>`);
    }
  });
}

// ---------- Imagens: redimensiona e converte em dataURL ----------
export function imageToDataURL(file, max = 320, quality = .82) {
  return new Promise((res, rej) => {
    if (!file || !file.type.startsWith("image/")) return rej(new Error("Arquivo não é imagem"));
    const img = new Image();
    img.onload = () => {
      const s = Math.min(1, max / Math.max(img.width, img.height));
      const c = document.createElement("canvas");
      c.width = Math.round(img.width * s); c.height = Math.round(img.height * s);
      c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
      res(c.toDataURL("image/jpeg", quality));
      URL.revokeObjectURL(img.src);
    };
    img.onerror = rej;
    img.src = URL.createObjectURL(file);
  });
}

export function bindQuills(root, onChange) {
  $$("[data-quills]", root).forEach(g => {
    const label = g.parentElement.querySelector("[data-quill-label]");
    $$("button", g).forEach(b => b.onclick = () => {
      const v = +b.dataset.v;
      g.dataset.value = v;
      $$("button", g).forEach(x => { x.classList.toggle("on", +x.dataset.v <= v); x.setAttribute("aria-checked", +x.dataset.v === v); });
      if (label) label.textContent = QUILL_LEVELS[v];
      onChange && onChange(v);
    });
  });
}

export function emptyState(msg, action = "") { return `<div class="empty">${msg}${action ? `<div style="margin-top:12px">${action}</div>` : ""}</div>`; }
export const STATUS = {
  lido: { label: "Lido", pill: "verde", icon: "✓" },
  lendo: { label: "Lendo", pill: "azul", icon: "📖" },
  relendo: { label: "Relendo", pill: "ouro", icon: "↻" },
  quero: { label: "Lista de desejos", pill: "terra", icon: "♡" },
  espera: { label: "Em espera", pill: "", icon: "⏸" }
};
