// =====================================================================
// Páginas: início, explorar, obra, cadastro de obra, perfil, registros
// =====================================================================
import { DB, Session, Media, scoreOf, levelOf, LEVELS, BADGES, readInYear, nowISO, uid } from "./db.js";
import { $, $$, esc, toast, modal, fmtDate, ago, avatar, levelBadge, userLink, cover, bookCard, quills, bindQuills, avgRating, imageToDataURL, emptyState, STATUS, QUILL_LEVELS, bindNoPaste } from "./ui.js";
import { GENRES } from "./seed.js";

const C = window.CLUBE_CONFIG;
const app = () => $("#app");
export const me = () => Session.user();
const rerender = () => window.__rerender();
const shelfOf = (userId, bookId) => DB.all("shelves").find(s => s.userId === userId && s.bookId === bookId);
const book = id => DB.get("books", id);
const user = id => DB.get("users", id);
const readers = () => DB.where("users", u => u.role !== "admin");
const xp = (n, what) => toast(`+${n} pontos · ${what}`, "xp");

// ---------------------------------------------------------------- INÍCIO
export function home() {
  const u = me();
  const featured = DB.where("books", b => b.featured);
  const iv = DB.get("interviews", DB.settings().weekInterview) || DB.all("interviews").at(-1);
  const reading = DB.where("shelves", s => s.userId === u.id && (s.status === "lendo" || s.status === "relendo"));
  const rodas = DB.where("rodas", r => r.status === "ativa");
  const letters = [...DB.all("letters")].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 3);
  const ranking = readers().map(r => ({ r, p: scoreOf(r.id).total })).sort((a, b) => b.p - a.p).slice(0, 5);
  const totalRead = DB.where("shelves", s => s.status === "lido").length;
  const recs = DB.where("recs", r => r.toId === u.id);
  const trades = DB.where("trades", t => t.status === "aberto").length;

  app().innerHTML = `
  <section class="hero">
    <div style="position:relative;z-index:1">
      <span class="eyebrow" style="color:#E9C46A">Clube do Livro · ${esc(C.SCHOOL)}</span>
      <h1>Olá, ${esc(u.name.split(" ")[0])}! O que você está lendo hoje?</h1>
      <p>Registre sua leitura, escreva uma carta do leitor ou entre numa roda para conversar sobre a obra com colegas.</p>
      <div class="row"><a class="btn btn--terra" href="#/novo-registro">＋ Registrar leitura</a><a class="btn btn--ghost" href="#/explorar">Explorar obras</a></div>
      <div class="stats"><div><b>${totalRead}</b><span>livros lidos no clube</span></div><div><b>${readers().length}</b><span>leitores</span></div><div><b>${DB.all("letters").length}</b><span>cartas do leitor</span></div><div><b>${rodas.length}</b><span>rodas ativas</span></div></div>
    </div>
    <div class="hero__stack" aria-hidden="true">${featured.slice(0, 3).map(b => cover(b)).join("")}</div>
  </section>

  ${reading.length ? `<section class="section"><div class="section__head"><h2>Continue lendo</h2><a href="#/eu/lendo">Ver tudo</a></div>
    <div class="grid g3">${reading.map(s => { const b = book(s.bookId); const pct = Math.min(100, Math.round((s.progress || 0) / (b.pages || 1) * 100)); return `
      <div class="card row" style="flex-wrap:nowrap;align-items:flex-start"><a href="#/livro/${b.id}" style="width:70px;flex-shrink:0">${cover(b)}</a>
      <div style="flex:1;min-width:0"><span class="pill pill--${STATUS[s.status].pill}">${STATUS[s.status].label}</span><h3 style="margin:6px 0 2px;font-size:1rem">${esc(b.title)}</h3><small>pág. ${s.progress || 0} de ${b.pages} · ${pct}%</small>
      <div class="lvlbar" style="margin:8px 0"><span style="width:${pct}%"></span></div>
      <div class="row"><button class="btn btn--sm" data-progress="${s.id}">Atualizar</button><a class="btn btn--sm btn--ghost" href="#/eu/diario?livro=${b.id}">Diário</a></div></div></div>`; }).join("")}</div></section>` : ""}

  ${recs.length ? `<div class="notice notice--info" style="margin-top:20px">💌 ${recs.map(r => `<strong>${esc(user(r.fromId)?.name)}</strong> recomendou <a href="#/livro/${r.bookId}">${esc(book(r.bookId)?.title)}</a> para você${r.note ? `: “${esc(r.note)}”` : ""}`).join("<br>")}</div>` : ""}

  ${iv ? `<section class="section"><div class="section__head"><h2>Entrevista da semana</h2><a href="#/entrevistas">Todas as entrevistas</a></div>
    <article class="iv-feature">
      <div class="iv-feature__photo" style="background:${user(iv.userId)?.avatarColor || "#2E6F40"}">${iv.photo ? `<img src="${iv.photo}" alt="Foto de ${esc(iv.studentName)}">` : esc(iv.studentName[0])}</div>
      <div class="iv-feature__body"><span class="iv-tag">ENTREVISTA</span>
        <p class="iv-quote">${esc(iv.headline)}</p>
        <p><strong>${esc(iv.studentName)}</strong>, ${esc(iv.turma)}, conversou com o clube sobre <em>${esc(iv.bookTitle)}</em>, de ${esc(iv.bookAuthor)}.</p>
        <p class="muted">${esc(iv.intro).slice(0, 220)}…</p>
        <a class="btn" href="#/entrevista/${iv.id}">Ler entrevista</a> ${iv.example ? `<span class="pill" style="margin-left:6px">exemplo fictício</span>` : ""}
      </div>
    </article></section>` : ""}

  <section class="section"><div class="section__head"><h2>Obras em destaque</h2><a href="#/explorar">Ver acervo</a></div>
    <div class="shelf--row shelf">${featured.map(b => { const r = avgRating(b.id); return bookCard(b, `${esc(b.author)}<br>${quills(r.avg)}`); }).join("")}</div></section>

  <div class="split">
    <section>
      <div class="section__head"><h2>Cartas do leitor recentes</h2></div>
      <div class="stack">${letters.map(letterCard).join("")}</div>
    </section>
    <aside class="stack">
      <div class="card"><div class="row between"><h3>🏆 ${esc(C.RANKING_NAME)}</h3><a href="#/explorar/ranking" style="font-size:.85rem">ver</a></div>
        <ol class="list">${ranking.map((x, i) => `<li><span class="rank rank--${i + 1}">${i + 1}</span>${avatar(x.r)}<span style="flex:1"><a href="#/leitor/${x.r.id}">${esc(x.r.name)}</a><br><small>${levelOf(x.p).name} · ${x.p} pts</small></span></li>`).join("")}</ol></div>
      <div class="card"><h3>◎ Rodas de leitura</h3>${rodas.map(r => `<a href="#/roda/${r.id}" class="row" style="text-decoration:none;color:inherit;padding:8px 0;flex-wrap:nowrap"><div style="width:44px">${cover(book(r.bookId))}</div><div><strong>${esc(r.title)}</strong><br><small>${r.members.length} participantes · próximo: ${fmtDate(r.meetings.find(m => new Date(m.date) > new Date())?.date, { day: "2-digit", month: "short" }) || "a definir"}</small></div></a>`).join("")}<a class="btn btn--ghost btn--sm btn--block" href="#/rodas">Ver rodas</a></div>
      <a class="card card--flat" href="#/trocas" style="text-decoration:none;color:inherit;display:block"><h3>📌 Trocas e empréstimos</h3><p class="muted" style="margin:0">${trades} anúncios abertos. Troque ou empreste livros com colegas.</p></a>
      <a class="card" href="#/quero-ser-entrevistado" style="text-decoration:none;color:inherit;display:block;background:var(--aviso);border-color:transparent"><h3>🎙 Quero ser entrevistado!</h3><p style="margin:0">Conte sobre um livro que marcou você e apareça na entrevista da semana.</p></a>
    </aside>
  </div>`;
  $$("[data-progress]").forEach(b => b.onclick = () => progressModal(b.dataset.progress));
}

export function letterCard(l) {
  const u = user(l.userId), b = book(l.bookId), mine = me();
  const n = DB.where("comments", c => c.target === "letter:" + l.id).length;
  return `<article class="letter"><div class="row" style="margin-bottom:8px">${avatar(u)}<div><strong>${userLink(u)}</strong> <small>escreveu sobre</small> <a href="#/livro/${b?.id}"><em>${esc(b?.title)}</em></a><br><small>${fmtDate(l.date)}</small></div></div>
  <h3 class="serif">${esc(l.title)}</h3><div class="letter__text">${esc(l.text.length > 420 ? l.text.slice(0, 420) + "…" : l.text)}</div>
  <div class="row" style="margin-top:12px"><button class="iconbtn ${l.likes.includes(mine.id) ? "on" : ""}" onclick="window.__likeLetter('${l.id}')">♥ ${l.likes.length}</button><button class="iconbtn" onclick="window.__openLetter('${l.id}')">💬 ${n} comentários</button></div></article>`;
}
window.__likeLetter = id => { const u = me(); DB.update("letters", id, l => ({ likes: l.likes.includes(u.id) ? l.likes.filter(x => x !== u.id) : [...l.likes, u.id] })); rerender(); };
window.__openLetter = id => {
  const l = DB.get("letters", id), u = user(l.userId), b = book(l.bookId);
  modal(`<span class="eyebrow">Carta do leitor · ${esc(b.title)}</span><h2 class="serif" id="modalTitle">${esc(l.title)}</h2><p><small>por ${esc(u.name)} · ${fmtDate(l.date)}</small></p><div class="letter__text">${esc(l.text)}</div><hr>${commentsBlock("letter:" + id)}`, root => bindComments(root, "letter:" + id));
};

// ---------------------------------------------------------------- COMENTÁRIOS
export function commentsBlock(target, title = "Comentários") {
  const list = DB.where("comments", c => c.target === target).sort((a, b) => a.date.localeCompare(b.date));
  return `<div data-comments="${target}"><h3>${title} (${list.length})</h3>
  ${list.map(c => { const u = user(c.userId); return `<div class="post">${avatar(u)}<div class="post__body"><div class="post__meta"><strong>${userLink(u)}</strong> · ${ago(c.date)}</div><div class="post__text">${esc(c.text)}</div></div></div>`; }).join("") || `<p class="muted">Seja o primeiro a comentar.</p>`}
  <form class="cform" style="margin-top:12px"><label class="sr" for="cm-${target}">Escreva um comentário</label><textarea id="cm-${target}" data-typed maxlength="800" required placeholder="Escreva com respeito: critique ideias, não pessoas." style="min-height:80px"></textarea><div class="row" style="justify-content:flex-end;margin-top:8px"><button class="btn btn--sm">Comentar</button></div></form></div>`;
}
export function bindComments(root, target, isRoda = false) {
  const f = $(`[data-comments="${target}"] .cform`, root);
  if (!f) return;
  bindNoPaste(f);
  f.onsubmit = e => {
    e.preventDefault();
    const t = $("textarea", f).value.trim(); if (t.length < 2) return;
    DB.add("comments", { target, userId: me().id, text: t, date: nowISO() });
    xp(isRoda ? 3 : 2, "comentário");
    const wrap = $(`[data-comments="${target}"]`, root);
    wrap.outerHTML = commentsBlock(target);
    bindComments(root, target, isRoda);
  };
}

// ---------------------------------------------------------------- EXPLORAR
export function explorar(tab = "livros") {
  const tabs = { livros: "Livros", autores: "Autores", leitores: "Leitores", ranking: C.RANKING_NAME };
  app().innerHTML = `<div class="row between"><div><span class="eyebrow">Explorar</span><h1>Descubra o que o clube está lendo</h1></div><a class="btn btn--verde" href="#/novo-livro">＋ Cadastrar obra</a></div>
  <form class="field" id="exSearch" style="margin:10px 0 18px"><label class="sr" for="exq">Buscar</label><input id="exq" type="search" placeholder="🔍 Buscar obras, autores, leitores…" style="max-width:520px"></form>
  <div class="tabs" role="tablist">${Object.entries(tabs).map(([k, v]) => `<button role="tab" class="${k === tab ? "active" : ""}" onclick="location.hash='#/explorar/${k}'">${v}</button>`).join("")}</div><div id="xp"></div>`;
  $("#exSearch").onsubmit = e => { e.preventDefault(); const q = $("#exq").value.trim(); if (q) location.hash = "#/busca/" + encodeURIComponent(q); };
  ({ livros: exLivros, autores: exAutores, leitores: exLeitores, ranking: exRanking })[tab]?.();
}
function exLivros() {
  let genre = "", sort = "recentes";
  const draw = () => {
    let list = DB.all("books").filter(b => !genre || b.genre === genre);
    if (sort === "curtidos") list.sort((a, b) => b.likes.length - a.likes.length);
    else if (sort === "avaliados") list.sort((a, b) => avgRating(b.id).avg - avgRating(a.id).avg);
    else if (sort === "lidos") list.sort((a, b) => DB.where("shelves", s => s.bookId === b.id && s.status === "lido").length - DB.where("shelves", s => s.bookId === a.id && s.status === "lido").length);
    else list.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    const genres = [...new Set(DB.all("books").map(b => b.genre))];
    $("#xp").innerHTML = `<div class="row between" style="margin-bottom:18px"><div class="chip-row"><button class="chip ${!genre ? "active" : ""}" data-g="">Todos</button>${genres.map(g => `<button class="chip ${g === genre ? "active" : ""}" data-g="${esc(g)}">${esc(g)}</button>`).join("")}</div>
      <label class="row" style="font-weight:500">Ordenar <select id="sort" style="width:auto">${[["recentes", "Mais recentes"], ["curtidos", "Mais curtidos"], ["avaliados", "Melhor avaliados"], ["lidos", "Mais lidos"]].map(([k, v]) => `<option value="${k}" ${k === sort ? "selected" : ""}>${v}</option>`).join("")}</select></label></div>
      <div class="shelf">${list.map(b => bookCard(b, `${esc(b.author)}<br>${quills(avgRating(b.id).avg)} <small>♥ ${b.likes.length}</small>`)).join("")}</div>`;
    $$("[data-g]").forEach(c => c.onclick = () => { genre = c.dataset.g; draw(); });
    $("#sort").onchange = e => { sort = e.target.value; draw(); };
  };
  draw();
}
function exAutores() {
  const map = {};
  DB.all("books").forEach(b => (map[b.author] ||= []).push(b));
  $("#xp").innerHTML = `<div class="grid g3">${Object.entries(map).sort().map(([a, bs]) => `<a class="card" href="#/autor/${encodeURIComponent(a)}" style="text-decoration:none;color:inherit"><div class="row" style="flex-wrap:nowrap"><span class="avatar avatar--md" style="background:var(--azul)">${esc(a.split(" ").map(x => x[0]).slice(0, 2).join(""))}</span><div><h3 style="margin:0">${esc(a)}</h3><small>${bs.length} obra(s) no acervo · ${bs.reduce((n, b) => n + DB.where("shelves", s => s.bookId === b.id && s.status === "lido").length, 0)} leituras</small></div></div></a>`).join("")}</div>`;
}
function exLeitores() {
  $("#xp").innerHTML = `<div class="grid g3">${readers().map(r => { const lidos = DB.where("shelves", s => s.userId === r.id && s.status === "lido").length; const lendo = DB.where("shelves", s => s.userId === r.id && s.status === "lendo").map(s => book(s.bookId)?.title)[0]; return `<a class="card" href="#/leitor/${r.id}" style="text-decoration:none;color:inherit"><div class="row" style="flex-wrap:nowrap">${avatar(r, "md")}<div><h3 style="margin:0">${esc(r.name)}</h3><small>${esc(r.turma)}</small></div></div><div class="row" style="margin-top:10px">${levelBadge(r.id)}<span class="pill">${lidos} lidos</span></div>${lendo ? `<p class="muted" style="margin:10px 0 0;font-size:.85rem">📖 Lendo <em>${esc(lendo)}</em></p>` : ""}</a>`; }).join("")}</div>`;
}
function exRanking() {
  const rk = readers().map(r => ({ r, p: scoreOf(r.id).total, l: DB.where("shelves", s => s.userId === r.id && s.status === "lido").length })).sort((a, b) => b.p - a.p);
  const topBooks = DB.all("books").map(b => ({ b, n: DB.where("shelves", s => s.bookId === b.id && s.status === "lido").length, r: avgRating(b.id) })).sort((a, b) => b.n - a.n || b.r.avg - a.r.avg).slice(0, 8);
  const topLetters = [...DB.all("letters")].sort((a, b) => b.likes.length - a.likes.length).slice(0, 5);
  $("#xp").innerHTML = `
  <p class="muted">O ${esc(C.RANKING_NAME)} soma leituras e participação: livros lidos, cartas do leitor, diário, comentários, rodas, trocas e mais. Os níveis vão da <strong>pena de galinha</strong> ao <strong>diamante</strong>.</p>
  <div class="chip-row" style="margin-bottom:20px">${LEVELS.map(l => `<span class="level"><i style="background:${l.color};color:#fff">${l.icon}</i>${l.name} · ${l.min}+</span>`).join("")}</div>
  <div class="grid g3">
    <div class="card"><h3>Leitores</h3><ol class="list">${rk.map((x, i) => `<li><span class="rank rank--${i + 1}">${i + 1}</span>${avatar(x.r)}<span style="flex:1"><a href="#/leitor/${x.r.id}">${esc(x.r.name)}</a><br><small>${esc(x.r.turma)} · ${x.l} lidos</small></span><strong>${x.p}</strong></li>`).join("")}</ol></div>
    <div class="card"><h3>Obras mais lidas</h3><ol class="list">${topBooks.map((x, i) => `<li><span class="rank rank--${i + 1}">${i + 1}</span><div style="width:34px">${cover(x.b)}</div><span style="flex:1"><a href="#/livro/${x.b.id}">${esc(x.b.title)}</a><br><small>${x.n} leituras</small></span>${quills(x.r.avg)}</li>`).join("")}</ol></div>
    <div class="card"><h3>Cartas mais curtidas</h3><ol class="list">${topLetters.map((l, i) => `<li><span class="rank rank--${i + 1}">${i + 1}</span><span style="flex:1"><a href="javascript:window.__openLetter('${l.id}')">${esc(l.title)}</a><br><small>${esc(user(l.userId)?.name)} · ${esc(book(l.bookId)?.title)}</small></span>♥ ${l.likes.length}</li>`).join("")}</ol></div>
  </div>`;
}

export function busca(q) {
  const t = q.toLowerCase();
  const bs = DB.where("books", b => (b.title + " " + b.author + " " + b.genre).toLowerCase().includes(t));
  const us = readers().filter(u => u.name.toLowerCase().includes(t));
  const authors = [...new Set(DB.all("books").map(b => b.author))].filter(a => a.toLowerCase().includes(t));
  app().innerHTML = `<span class="eyebrow">Busca</span><h1>Resultados para “${esc(q)}”</h1>
  <h2>Obras (${bs.length})</h2>${bs.length ? `<div class="shelf">${bs.map(b => bookCard(b)).join("")}</div>` : emptyState("Nenhuma obra encontrada. Que tal cadastrar?", `<a class="btn btn--verde" href="#/novo-livro">Cadastrar obra</a>`)}
  ${authors.length ? `<h2 style="margin-top:28px">Autores</h2><div class="chip-row">${authors.map(a => `<a class="chip" href="#/autor/${encodeURIComponent(a)}">${esc(a)}</a>`).join("")}</div>` : ""}
  ${us.length ? `<h2 style="margin-top:28px">Leitores</h2><div class="chip-row">${us.map(u => `<a class="chip" href="#/leitor/${u.id}">${esc(u.name)}</a>`).join("")}</div>` : ""}`;
}

export function autor(name) {
  const bs = DB.where("books", b => b.author === name);
  app().innerHTML = `<a href="#/explorar/autores">← Autores</a><span class="eyebrow" style="margin-top:14px">Autor(a)</span><h1>${esc(name)}</h1><p class="muted">${bs.length} obra(s) cadastrada(s) pelos leitores do clube.</p><div class="shelf">${bs.map(b => bookCard(b, `${b.year || ""} · ${esc(b.genre)}`)).join("")}</div>`;
}

// ---------------------------------------------------------------- OBRA
export function livro(id) {
  const b = book(id); if (!b) { app().innerHTML = emptyState("Obra não encontrada."); return; }
  const u = me(), s = shelfOf(u.id, id), r = avgRating(id);
  const liked = b.likes.includes(u.id);
  const peopleBy = st => DB.where("shelves", x => x.bookId === id && x.status === st).map(x => user(x.userId)).filter(Boolean);
  const letters = DB.where("letters", l => l.bookId === id);
  const similar = DB.where("books", x => x.genre === b.genre && x.id !== id).slice(0, 6);
  const rodasB = DB.where("rodas", x => x.bookId === id);
  const pct = s && b.pages ? Math.min(100, Math.round((s.progress || 0) / b.pages * 100)) : 0;
  const lib = DB.all("library").find(x => x.title.toLowerCase() === b.title.toLowerCase());

  app().innerHTML = `
  <a href="#/explorar">← Explorar</a>
  <div class="split" style="margin-top:16px">
    <div>
      <div class="row" style="align-items:flex-start;gap:28px;flex-wrap:wrap">
        <div style="width:200px;max-width:45vw">${cover(b, true)}</div>
        <div style="flex:1;min-width:240px">
          <span class="eyebrow">${esc(b.genre)}</span>
          <h1 class="serif">${esc(b.title)}</h1>
          <p style="font-size:1.05rem"><a href="#/autor/${encodeURIComponent(b.author)}">${esc(b.author)}</a></p>
          <div class="row">${quills(r.avg, { lg: true })}<span class="muted">${r.n ? r.avg.toFixed(1) + " · " + r.n + " avaliação(ões)" : "sem avaliações"}</span></div>
          <p class="muted" style="margin-top:10px;font-size:.9rem">${[b.publisher, b.year, b.pages && b.pages + " páginas", b.age].filter(Boolean).map(esc).join(" · ")}</p>
          <div class="row" style="margin:16px 0">
            <button class="iconbtn ${liked ? "on" : ""}" id="likeBook">♥ ${liked ? "Curtido" : "Curtir"} · ${b.likes.length}</button>
            <button class="iconbtn" id="recBtn">💌 Recomendar</button>
            ${lib ? `<a class="iconbtn" href="#/ler/${lib.id}">📄 Ler na biblioteca livre</a>` : ""}
          </div>
        </div>
      </div>
      <h3 style="margin-top:24px">Sinopse</h3><p class="serif" style="font-size:1.05rem;line-height:1.7">${esc(b.synopsis || "Sem sinopse.")}</p>

      <section class="section"><div class="section__head"><h2>Cartas do leitor</h2><button class="btn btn--sm" id="newLetter">✉ Escrever carta</button></div>
        <div class="stack">${letters.map(letterCard).join("") || emptyState("Nenhuma carta ainda. Escreva a primeira resenha crítica desta obra!")}</div></section>

      ${s && (s.status === "lido" || s.status === "relendo") ? mediaSection(id) : ""}

      <section class="section card" id="bookComments">${commentsBlock("book:" + id)}</section>
    </div>

    <aside class="stack">
      <div class="card">
        <h3>Na minha estante</h3>
        <div class="chip-row" role="group" aria-label="Status da leitura">${Object.entries(STATUS).map(([k, v]) => `<button class="chip ${s?.status === k ? "active" : ""}" data-status="${k}">${v.icon} ${v.label}</button>`).join("")}</div>
        ${s ? `
          ${s.status === "lendo" || s.status === "relendo" ? `<div style="margin-top:14px"><small>pág. ${s.progress || 0} de ${b.pages} · ${pct}%</small><div class="lvlbar" style="margin:6px 0 10px"><span style="width:${pct}%"></span></div><button class="btn btn--sm" id="prog">Registrar leitura</button> <a class="btn btn--sm btn--ghost" href="#/eu/diario?livro=${id}">Diário</a></div>` : ""}
          ${s.status === "espera" ? `<p class="muted" style="margin-top:10px;font-size:.88rem">Leitura em espera na pág. ${s.progress || 0}. Tudo bem pausar: volte quando quiser.</p>` : ""}
          <div style="margin-top:14px"><label style="margin-bottom:2px">Sua avaliação</label>${quills(s.rating, { input: true })}</div>
          ${s.status === "relendo" || s.rereads?.length ? `<div style="margin-top:16px"><h4 style="margin-bottom:6px">↻ Percepções da releitura</h4>${(s.rereads || []).map(x => `<div class="diary"><div class="diary__date">${fmtDate(x.date)}</div><div class="serif">${esc(x.text)}</div></div>`).join("")}<button class="btn btn--sm btn--ghost" id="reread">＋ Nova percepção</button></div>` : ""}
          <button class="btn btn--sm btn--ghost" id="rmShelf" style="margin-top:14px">Remover da estante</button>
        ` : `<p class="muted" style="margin:10px 0 0;font-size:.88rem">Escolha um status para adicionar à sua estante.</p>`}
      </div>
      ${rodasB.length ? `<div class="card"><h3>◎ Rodas desta obra</h3>${rodasB.map(x => `<a href="#/roda/${x.id}" style="display:block;padding:6px 0">${esc(x.title)} <span class="pill ${x.status === "ativa" ? "pill--verde" : ""}">${x.status}</span></a>`).join("")}</div>` : ""}
      ${["lendo", "lido", "quero"].map(st => { const p = peopleBy(st); return p.length ? `<div class="card"><h3 style="font-size:.95rem">${{ lendo: "Lendo agora", lido: "Já leram", quero: "Querem ler" }[st]} (${p.length})</h3><div class="row">${p.slice(0, 10).map(x => `<a href="#/leitor/${x.id}" title="${esc(x.name)}">${avatar(x)}</a>`).join("")}</div></div>` : ""; }).join("")}
      ${similar.length ? `<div class="card"><h3>Se você gostou, leia também</h3><div class="shelf" style="grid-template-columns:repeat(3,1fr);gap:12px">${similar.slice(0, 3).map(x => bookCard(x, "")).join("")}</div></div>` : ""}
    </aside>
  </div>`;

  bindComments(app(), "book:" + id);
  $("#likeBook").onclick = () => { DB.update("books", id, x => ({ likes: liked ? x.likes.filter(i => i !== u.id) : [...x.likes, u.id] })); rerender(); };
  $$("[data-status]").forEach(c => c.onclick = () => setStatus(id, c.dataset.status));
  $("#newLetter").onclick = () => letterModal(id);
  $("#recBtn").onclick = () => recommendModal(id);
  $("#prog") && ($("#prog").onclick = () => progressModal(s.id));
  $("#reread") && ($("#reread").onclick = () => rereadModal(s.id));
  $("#rmShelf") && ($("#rmShelf").onclick = () => { if (confirm("Remover esta obra da sua estante?")) { DB.remove("shelves", s.id); rerender(); } });
  bindQuills(app(), v => { DB.update("shelves", s.id, { rating: v }); toast(`Avaliado com ${QUILL_LEVELS[v]}`, "ok"); });
  if ($("#mediaSec")) bindMedia(id);
}

function setStatus(bookId, status) {
  const u = me(), b = book(bookId); let s = shelfOf(u.id, bookId);
  const patch = { status };
  if (status === "lido") { patch.finishedAt = s?.finishedAt || nowISO(); patch.progress = b.pages; }
  if (status === "lendo" && !s?.startedAt) patch.startedAt = nowISO();
  if (status === "relendo") patch.rereads = s?.rereads || [];
  if (s) DB.update("shelves", s.id, patch); else s = DB.add("shelves", { userId: u.id, bookId, rating: null, progress: 0, startedAt: nowISO(), finishedAt: null, rereads: [], ...patch });
  if (status === "lido") { xp(20, "livro lido"); toast("Parabéns pela leitura! Que tal escrever uma carta do leitor?", "ok"); }
  else toast(`Marcado como “${STATUS[status].label}”`, "ok");
  rerender();
}

// ---------------------------------------------------------------- MODAIS DE REGISTRO
export function letterModal(bookId) {
  const b = book(bookId);
  modal(`<span class="eyebrow">Carta do leitor</span><h2 id="modalTitle">Sua resenha crítica de <em>${esc(b.title)}</em></h2>
  <p class="muted" style="font-size:.9rem">Dica: apresente a obra sem contar o final, diga o que achou e por quê, e para quem você recomendaria. Veja o <a href="#/tutoriais" data-close>tutorial</a>.</p>
  <form id="lf"><div class="field"><label for="lt">Título da carta</label><input id="lt" type="text" data-typed maxlength="90" required></div>
  <div class="field"><label for="lx">Sua carta</label><textarea id="lx" data-typed required minlength="80" maxlength="4000" style="min-height:220px" placeholder="Querido leitor, ..."></textarea></div>
  <label class="check" style="margin-bottom:14px"><input type="checkbox" id="spoil"> Contém spoiler (revela partes importantes da história)</label>
  <button class="btn btn--block">Publicar carta</button></form>`, (root, close) => {
    $("#lf", root).onsubmit = e => {
      e.preventDefault();
      const text = $("#lx", root).value.trim();
      if (text.length < 80) return toast("Escreva pelo menos 80 caracteres.", "warn");
      DB.add("letters", { userId: me().id, bookId, title: $("#lt", root).value.trim(), text: ($("#spoil", root).checked ? "⚠ Contém spoiler\n\n" : "") + text, date: nowISO(), likes: [] });
      close(); xp(15, "carta do leitor"); rerender();
    };
  });
}

export function progressModal(shelfId) {
  const s = DB.get("shelves", shelfId), b = book(s.bookId);
  modal(`<span class="eyebrow">Registrar leitura</span><h2 id="modalTitle">${esc(b.title)}</h2>
  <form id="pf"><div class="grid g2"><div class="field"><label for="pp">Parei na página</label><input id="pp" type="number" min="0" max="${b.pages || 9999}" value="${s.progress || 0}" required></div>
  <div class="field"><label for="pm">Tempo de leitura hoje (min)</label><input id="pm" type="number" min="0" max="600" value="30"></div></div>
  <div class="field"><label for="pd">Registro no diário (opcional)</label><textarea id="pd" data-typed maxlength="1500" placeholder="O que você percebeu, sentiu ou pensou nesta parte?"></textarea></div>
  <button class="btn btn--block">Salvar</button></form>`, (root, close) => {
    $("#pf", root).onsubmit = e => {
      e.preventDefault();
      const page = +$("#pp", root).value, min = +$("#pm", root).value, txt = $("#pd", root).value.trim();
      const pagesRead = Math.max(0, page - (s.progress || 0));
      DB.update("shelves", s.id, { progress: page });
      if (min > 0) DB.add("sessions", { userId: me().id, bookId: b.id, date: nowISO(), minutes: min, pages: pagesRead });
      if (txt) { DB.add("diary", { userId: me().id, bookId: b.id, page, date: nowISO(), text: txt }); xp(4, "diário de leitura"); }
      close();
      if (b.pages && page >= b.pages && s.status === "lendo" && confirm("Você chegou ao fim! Marcar como lido?")) return setStatus(b.id, "lido");
      toast("Leitura registrada", "ok"); rerender();
    };
  });
}

function rereadModal(shelfId) {
  const s = DB.get("shelves", shelfId), b = book(s.bookId);
  modal(`<span class="eyebrow">Relendo</span><h2 id="modalTitle">Novas percepções sobre ${esc(b.title)}</h2><p class="muted">O que você notou agora que não tinha notado na primeira leitura?</p>
  <form id="rf"><div class="field"><textarea id="rt" data-typed required maxlength="2000"></textarea></div><button class="btn btn--block">Salvar percepção</button></form>`, (root, close) => {
    $("#rf", root).onsubmit = e => { e.preventDefault(); DB.update("shelves", s.id, x => ({ rereads: [...(x.rereads || []), { date: nowISO(), text: $("#rt", root).value.trim() }] })); close(); xp(6, "releitura"); rerender(); };
  });
}

function recommendModal(bookId) {
  const b = book(bookId), u = me();
  modal(`<span class="eyebrow">Recomendação</span><h2 id="modalTitle">Recomendar <em>${esc(b.title)}</em></h2>
  <form id="rcf"><div class="field"><label for="rto">Para quem?</label><select id="rto" required><option value="">Escolha um leitor</option>${readers().filter(x => x.id !== u.id).map(x => `<option value="${x.id}">${esc(x.name)} · ${esc(x.turma)}</option>`).join("")}</select></div>
  <div class="field"><label for="rnote">Por que essa pessoa vai gostar?</label><textarea id="rnote" data-typed maxlength="300" style="min-height:90px"></textarea></div><button class="btn btn--block">Enviar recomendação</button></form>`, (root, close) => {
    $("#rcf", root).onsubmit = e => { e.preventDefault(); DB.add("recs", { fromId: u.id, toId: $("#rto", root).value, bookId, note: $("#rnote", root).value.trim(), date: nowISO() }); close(); xp(3, "recomendação"); };
  });
}

// ---------------------------------------------------------------- ÁUDIO E VÍDEO
function mediaSection(bookId) {
  return `<section class="section" id="mediaSec"><div class="section__head"><h2>🎧 Áudios e vídeos sobre a leitura</h2><button class="btn btn--sm btn--verde" id="addMedia">＋ Gravar ou enviar</button></div>
  <p class="muted" style="font-size:.88rem">Registros curtos (áudio até ${C.MEDIA_LIMITS.audioSeconds}s, vídeo até ${C.MEDIA_LIMITS.videoSeconds}s). Na versão 0.1 ficam salvos apenas neste dispositivo.</p>
  <div class="media-list" id="mediaList"></div></section>`;
}
async function bindMedia(bookId) {
  const list = DB.where("media", m => m.bookId === bookId && m.userId === me().id);
  const el = $("#mediaList");
  el.innerHTML = list.length ? "" : `<div class="empty" style="grid-column:1/-1">Nenhum registro em áudio ou vídeo ainda.</div>`;
  for (const m of list) {
    const url = await Media.url(m.id);
    el.insertAdjacentHTML("beforeend", `<div class="media-item">${m.kind === "video" ? `<video controls src="${url || ""}"></video>` : `<audio controls src="${url || ""}"></audio>`}<div class="row between"><small>${esc(m.caption || "")} · ${fmtDate(m.date)}</small><button class="btn btn--sm btn--ghost" data-delmedia="${m.id}">Excluir</button></div></div>`);
  }
  $$("[data-delmedia]").forEach(b => b.onclick = async () => { if (!confirm("Excluir este registro?")) return; await Media.del(b.dataset.delmedia); DB.remove("media", b.dataset.delmedia); bindMedia(bookId); });
  $("#addMedia").onclick = () => mediaModal(bookId);
}
function mediaModal(bookId) {
  const L = C.MEDIA_LIMITS;
  modal(`<span class="eyebrow">Registro em áudio ou vídeo</span><h2 id="modalTitle">Fale sobre a sua leitura</h2>
  <div class="seg" style="margin-bottom:14px"><button class="active" data-k="audio">🎙 Áudio</button><button data-k="video">🎥 Vídeo</button><button data-k="file">📁 Enviar arquivo</button></div>
  <div id="recArea"></div>
  <div class="field" style="margin-top:12px"><label for="mcap">Legenda</label><input id="mcap" type="text" data-typed maxlength="80" placeholder="Ex.: Minha parte favorita"></div>
  <div class="notice" style="font-size:.85rem">Cuidado com a privacidade: evite mostrar uniforme, casa, documentos ou outras pessoas sem autorização.</div>
  <button class="btn btn--block" id="msave" disabled style="margin-top:14px">Salvar registro</button>`, (root, close) => {
    let blob = null, kind = "audio", rec = null, stream = null, timer = null;
    const area = $("#recArea", root);
    const stop = () => { try { rec && rec.state !== "inactive" && rec.stop(); } catch { } stream && stream.getTracks().forEach(t => t.stop()); clearInterval(timer); };
    const draw = () => {
      stop(); blob = null; $("#msave", root).disabled = true;
      if (kind === "file") {
        area.innerHTML = `<input type="file" id="mfile" accept="audio/*,video/*"><small class="muted">Até ${L.maxFileMB} MB.</small>`;
        $("#mfile", root).onchange = e => { const f = e.target.files[0]; if (!f) return; if (f.size > L.maxFileMB * 1e6) return toast("Arquivo grande demais", "err"); blob = f; kind = f.type.startsWith("video") ? "video" : "audio"; $("#msave", root).disabled = false; };
        return;
      }
      const max = kind === "video" ? L.videoSeconds : L.audioSeconds;
      area.innerHTML = `<div class="card card--flat" style="text-align:center">${kind === "video" ? `<video id="prev" muted playsinline style="width:100%;border-radius:8px;background:#000;max-height:260px"></video>` : `<div style="font-size:3rem">🎙</div>`}
        <p id="rstat" class="muted">Pronto para gravar (máx. ${max}s)</p><button class="btn btn--terra" id="rbtn">● Gravar</button></div>`;
      $("#rbtn", root).onclick = async () => {
        if (rec && rec.state === "recording") return stop();
        try { stream = await navigator.mediaDevices.getUserMedia(kind === "video" ? { video: { width: 640 }, audio: true } : { audio: true }); }
        catch { return toast("Permita o acesso ao microfone/câmera para gravar.", "err"); }
        if (kind === "video") { const p = $("#prev", root); p.srcObject = stream; p.play(); }
        const chunks = []; rec = new MediaRecorder(stream);
        rec.ondataavailable = e => chunks.push(e.data);
        rec.onstop = () => {
          blob = new Blob(chunks, { type: rec.mimeType }); stream.getTracks().forEach(t => t.stop());
          const url = URL.createObjectURL(blob);
          area.querySelector(".card").innerHTML = (kind === "video" ? `<video controls src="${url}" style="width:100%;border-radius:8px"></video>` : `<audio controls src="${url}" style="width:100%"></audio>`) + `<button class="btn btn--sm btn--ghost" style="margin-top:8px" id="redo">Gravar de novo</button>`;
          $("#redo", root).onclick = draw; $("#msave", root).disabled = false;
        };
        rec.start(); let t = 0;
        $("#rbtn", root).textContent = "■ Parar";
        timer = setInterval(() => { t++; $("#rstat", root).innerHTML = `<span class="rec-dot"></span> Gravando ${t}s / ${max}s`; if (t >= max) stop(); }, 1000);
      };
    };
    $$(".seg button", root).forEach(b => b.onclick = () => { $$(".seg button", root).forEach(x => x.classList.remove("active")); b.classList.add("active"); kind = b.dataset.k; draw(); });
    draw();
    $$("[data-close]", $("#modal")).forEach(b => b.addEventListener("click", stop));
    $("#msave", root).onclick = async () => {
      if (!blob) return;
      const id = uid("me");
      try { await Media.put(id, blob); } catch { return toast("Não foi possível salvar a mídia neste navegador.", "err"); }
      DB.all("media").push({ id, userId: me().id, bookId, kind: kind === "file" ? "audio" : kind, caption: $("#mcap", root).value.trim(), date: nowISO() }); DB.save();
      stop(); close(); xp(5, "registro em mídia"); bindMedia(bookId);
    };
  });
}

// ---------------------------------------------------------------- CADASTRO DE OBRA
export function novoLivro() {
  app().innerHTML = `<a href="#/explorar">← Explorar</a>
  <div style="max-width:760px;margin:16px auto 0">
    <span class="eyebrow">Novas obras</span><h1>Cadastrar uma obra</h1>
    <p class="muted">O acervo é construído pelos próprios leitores. Antes de cadastrar, confira na busca se a obra já existe.</p>
    <form id="bf" class="card">
      <div class="grid g2">
        <div class="field" style="grid-column:1/-1"><label for="bt">Título *</label><input id="bt" type="text" required maxlength="140"><div id="dup" class="nopaste-hint" style="color:var(--ouro)"></div></div>
        <div class="field"><label for="ba">Autor(a) *</label><input id="ba" type="text" required maxlength="100" list="authors"><datalist id="authors">${[...new Set(DB.all("books").map(b => b.author))].map(a => `<option value="${esc(a)}">`).join("")}</datalist></div>
        <div class="field"><label for="bp">Editora</label><input id="bp" type="text" maxlength="80"></div>
        <div class="field"><label for="by">Ano de publicação</label><input id="by" type="number" min="1500" max="${new Date().getFullYear()}"></div>
        <div class="field"><label for="bn">Número de páginas *</label><input id="bn" type="number" min="1" max="5000" required></div>
        <div class="field"><label for="bg">Gênero *</label><select id="bg" required><option value="">Selecione</option>${GENRES.map(g => `<option>${g}</option>`).join("")}</select></div>
        <div class="field"><label for="bage">Faixa etária indicada</label><select id="bage"><option>Livre</option><option>A partir de 10 anos</option><option>A partir de 12 anos</option><option>A partir de 14 anos</option><option>A partir de 16 anos</option></select></div>
        <div class="field"><label for="bisbn">ISBN (opcional)</label><input id="bisbn" type="text" maxlength="20" inputmode="numeric"></div>
        <div class="field"><label for="bc">Capa (foto do seu exemplar, opcional)</label><input id="bc" type="file" accept="image/*"><small class="muted">Sem capa, geramos uma com as cores da escola.</small></div>
        <div class="field" style="grid-column:1/-1"><label for="bs">Sinopse com suas palavras *</label><textarea id="bs" data-typed required minlength="40" maxlength="1200" placeholder="Sobre o que é a obra, sem contar o final."></textarea></div>
      </div>
      <div class="row between"><div id="cprev" style="width:90px"></div><button class="btn btn--verde">Cadastrar obra</button></div>
    </form>
  </div>`;
  const colors = ["#1B365D", "#2E6F40", "#C84B31", "#D97706", "#4A5568"];
  const color = colors[Math.floor(Math.random() * colors.length)];
  let coverData = null;
  const prev = () => $("#cprev").innerHTML = cover({ title: $("#bt").value || "Título", author: $("#ba").value || "Autor", color, cover: coverData });
  ["#bt", "#ba"].forEach(s => $(s).addEventListener("input", () => {
    prev();
    const t = $("#bt").value.trim().toLowerCase();
    const d = t.length > 3 && DB.all("books").find(b => b.title.toLowerCase().includes(t));
    $("#dup").innerHTML = d ? `⚠ Já existe <a href="#/livro/${d.id}">${esc(d.title)}</a> (${esc(d.author)}). Será a mesma obra?` : "";
  }));
  $("#bc").onchange = async e => { try { coverData = await imageToDataURL(e.target.files[0], 400); prev(); } catch { toast("Imagem inválida", "err"); } };
  prev();
  $("#bf").onsubmit = e => {
    e.preventDefault();
    const b = DB.add("books", { title: $("#bt").value.trim(), author: $("#ba").value.trim(), publisher: $("#bp").value.trim(), year: +$("#by").value || null, pages: +$("#bn").value, genre: $("#bg").value, age: $("#bage").value, isbn: $("#bisbn").value.trim(), synopsis: $("#bs").value.trim(), cover: coverData, color, featured: false, addedBy: me().id, likes: [] });
    xp(5, "obra cadastrada");
    location.hash = "#/livro/" + b.id;
  };
}

// ---------------------------------------------------------------- PERFIL
export function perfil(userId, tab = "visao") {
  const p = user(userId); if (!p) { app().innerHTML = emptyState("Leitor não encontrado."); return; }
  const mine = p.id === me().id;
  const sh = DB.where("shelves", s => s.userId === p.id);
  const by = st => sh.filter(s => s.status === st);
  const sc = scoreOf(p.id), lv = levelOf(sc.total);
  const year = new Date().getFullYear(), doneYear = readInYear(p.id, year);
  const goalPct = p.goal ? Math.min(100, Math.round(doneYear / p.goal * 100)) : 0;
  const pages = by("lido").reduce((a, s) => a + (book(s.bookId)?.pages || 0), 0);
  const mins = DB.where("sessions", s => s.userId === p.id).reduce((a, s) => a + s.minutes, 0);
  const base = mine ? "#/eu" : "#/leitor/" + p.id;
  const tabs = { visao: "Visão geral", estante: `Estante (${by("lido").length})`, lendo: `Lendo (${by("lendo").length})`, relendo: `Relendo (${by("relendo").length})`, desejos: `Lista de desejos (${by("quero").length})`, espera: `Em espera (${by("espera").length})`, diario: "Diário de leitura", cartas: "Cartas", ...(mine ? { midias: "Áudios e vídeos" } : {}) };
  if (!tabs[tab]) tab = "visao";

  app().innerHTML = `
  <section class="profile-head">
    <div style="position:relative">${avatar(p, "lg")}${mine ? `<label class="iconbtn" style="position:absolute;bottom:0;right:-6px;padding:5px 8px;cursor:pointer" title="Trocar foto">📷<input type="file" accept="image/*" id="ph" hidden></label>` : ""}</div>
    <div><h1 style="margin-bottom:4px">${esc(p.name)}</h1><p class="muted" style="margin:0 0 8px">${esc(p.turma)}${p.role === "admin" ? " · Coordenação" : ""}</p>
      ${p.bio ? `<p class="serif" style="margin:0 0 10px">${esc(p.bio)}</p>` : ""}
      <div class="row">${levelBadge(p.id)}<small>${sc.total} pontos${lv.next ? ` · faltam ${lv.next.min - sc.total} para ${lv.next.name}` : " · nível máximo!"}</small></div>
      <div class="lvlbar" style="max-width:340px;margin-top:8px"><span style="width:${lv.pct}%"></span></div>
    </div>
    <div class="row">${mine ? `<button class="btn btn--ghost btn--sm" id="editP">Editar perfil</button><button class="btn btn--ghost btn--sm" id="exportP" title="LGPD: portabilidade dos seus dados">Baixar meus dados</button>` : ""}</div>
  </section>
  <div class="kpis"><div class="kpi"><b>${by("lido").length}</b><span>livros lidos</span></div><div class="kpi"><b>${pages.toLocaleString("pt-BR")}</b><span>páginas lidas</span></div><div class="kpi"><b>${Math.floor(mins / 60)}h${String(mins % 60).padStart(2, "0")}</b><span>tempo de leitura</span></div><div class="kpi"><b>${DB.where("letters", l => l.userId === p.id).length}</b><span>cartas do leitor</span></div></div>
  <div class="tabs" role="tablist">${Object.entries(tabs).map(([k, v]) => `<button role="tab" class="${k === tab ? "active" : ""}" onclick="location.hash='${base}/${k}'">${v}</button>`).join("")}</div>
  <div id="ptab"></div>`;

  const T = $("#ptab");
  const shelfGrid = (list, sub) => list.length ? `<div class="shelf wood">${list.map(s => { const b = book(s.bookId); return b ? bookCard(b, sub(s, b)) : ""; }).join("")}</div>` : emptyState("Nada por aqui ainda.", mine ? `<a class="btn btn--sm" href="#/explorar">Explorar obras</a>` : "");

  if (tab === "visao") {
    const lendo = by("lendo").concat(by("relendo"));
    T.innerHTML = `<div class="grid g3">
      <div class="card"><h3>🎯 Meta de leitura ${year}</h3><div class="goal"><div class="ring" style="--p:${goalPct}"><span>${goalPct}%</span></div><div><strong style="font-size:1.4rem">${doneYear} de ${p.goal || "?"}</strong><br><small>livros lidos no ano</small>${mine ? `<br><button class="btn btn--sm btn--ghost" id="editGoal" style="margin-top:8px">Alterar meta</button>` : ""}</div></div></div>
      <div class="card" style="grid-column:span 2"><div class="row between"><h3>⏱ Tempo de leitura</h3><div class="seg" id="per"><button data-p="semana">Semanas</button><button class="active" data-p="mes">Meses</button><button data-p="ano">Anos</button></div></div><div class="bars" id="bars"></div></div>
    </div>
    <div class="grid g2" style="margin-top:20px">
      <div class="card"><h3>📖 Lendo agora</h3>${lendo.map(s => { const b = book(s.bookId); const pc = Math.round((s.progress || 0) / (b.pages || 1) * 100); return `<a href="#/livro/${b.id}" class="row" style="text-decoration:none;color:inherit;flex-wrap:nowrap;padding:6px 0"><div style="width:48px">${cover(b)}</div><div style="flex:1"><strong>${esc(b.title)}</strong><br><small>${STATUS[s.status].label} · ${pc}%</small><div class="lvlbar" style="margin-top:4px"><span style="width:${pc}%"></span></div></div></a>`; }).join("") || `<p class="muted">Nenhuma leitura em andamento.</p>`}</div>
      <div class="card"><h3>🏅 Conquistas</h3><div class="badges">${BADGES.map(bd => `<span class="badge ${bd.test(p.id) ? "" : "locked"}"><i>${bd.icon}</i>${bd.name}</span>`).join("")}</div>
        <details style="margin-top:14px"><summary style="cursor:pointer;font-weight:600">Como os pontos foram somados</summary><ul class="list">${Object.entries(sc.parts).filter(([, v]) => v).map(([k, v]) => `<li style="padding:6px 0"><span style="flex:1">${k}</span><strong>${v}</strong></li>`).join("")}</ul></details></div>
    </div>`;
    const drawBars = per => {
      const ss = DB.where("sessions", s => s.userId === p.id);
      const buckets = []; const now = new Date();
      if (per === "semana") for (let i = 7; i >= 0; i--) { const end = new Date(now); end.setDate(now.getDate() - i * 7); const start = new Date(end); start.setDate(end.getDate() - 7); buckets.push({ l: fmtDate(end.toISOString(), { day: "2-digit", month: "2-digit" }), v: ss.filter(s => new Date(s.date) > start && new Date(s.date) <= end).reduce((a, s) => a + s.minutes, 0) }); }
      else if (per === "mes") for (let i = 5; i >= 0; i--) { const d = new Date(now.getFullYear(), now.getMonth() - i, 1); buckets.push({ l: d.toLocaleDateString("pt-BR", { month: "short" }), v: ss.filter(s => { const x = new Date(s.date); return x.getMonth() === d.getMonth() && x.getFullYear() === d.getFullYear(); }).reduce((a, s) => a + s.minutes, 0) }); }
      else for (let i = 3; i >= 0; i--) { const y = now.getFullYear() - i; buckets.push({ l: y, v: ss.filter(s => new Date(s.date).getFullYear() === y).reduce((a, s) => a + s.minutes, 0) }); }
      const max = Math.max(60, ...buckets.map(b => b.v));
      $("#bars").innerHTML = buckets.map(b => `<div><i style="height:${Math.round(b.v / max * 100)}%" title="${b.v} min"><b>${b.v >= 60 ? Math.round(b.v / 60) + "h" : b.v + "m"}</b></i><small>${b.l}</small></div>`).join("");
    };
    drawBars("mes");
    $$("#per button").forEach(b => b.onclick = () => { $$("#per button").forEach(x => x.classList.remove("active")); b.classList.add("active"); drawBars(b.dataset.p); });
    $("#editGoal") && ($("#editGoal").onclick = () => { const g = prompt("Quantos livros você quer ler em " + year + "?", p.goal || 6); if (g && +g > 0) { DB.update("users", p.id, { goal: +g }); rerender(); } });
  }
  else if (tab === "estante") T.innerHTML = shelfGrid(by("lido").sort((a, b) => (b.finishedAt || "").localeCompare(a.finishedAt || "")), (s) => `${quills(s.rating)}<br><small>${fmtDate(s.finishedAt, { month: "short", year: "numeric" })}</small>`);
  else if (tab === "lendo") T.innerHTML = shelfGrid(by("lendo"), (s, b) => `pág. ${s.progress || 0}/${b.pages}`);
  else if (tab === "relendo") T.innerHTML = by("relendo").length ? by("relendo").map(s => { const b = book(s.bookId); return `<div class="card row" style="align-items:flex-start;flex-wrap:nowrap;margin-bottom:14px"><a href="#/livro/${b.id}" style="width:80px;flex-shrink:0">${cover(b)}</a><div style="flex:1"><h3>${esc(b.title)}</h3>${(s.rereads || []).map(x => `<div class="diary"><div class="diary__date">${fmtDate(x.date)}</div><div class="serif">${esc(x.text)}</div></div>`).join("") || `<p class="muted">Sem novas percepções registradas.</p>`}</div></div>`; }).join("") : emptyState("Nenhuma releitura no momento.");
  else if (tab === "desejos") T.innerHTML = shelfGrid(by("quero"), (s, b) => esc(b.author));
  else if (tab === "espera") T.innerHTML = `<p class="muted">Leituras pausadas. Sem culpa: cada livro tem a sua hora.</p>` + shelfGrid(by("espera"), (s, b) => `parou na pág. ${s.progress || 0}`);
  else if (tab === "diario") diaryTab(T, p, mine);
  else if (tab === "cartas") { const ls = DB.where("letters", l => l.userId === p.id); T.innerHTML = ls.length ? `<div class="stack">${ls.map(letterCard).join("")}</div>` : emptyState("Nenhuma carta do leitor ainda."); }
  else if (tab === "midias") mediaTab(T, p);

  if (mine) {
    $("#ph").onchange = async e => { try { DB.update("users", p.id, { photo: await imageToDataURL(e.target.files[0], 300) }); rerender(); } catch { toast("Imagem inválida", "err"); } };
    $("#editP").onclick = () => editProfile(p);
    $("#exportP").onclick = () => { const blob = new Blob([JSON.stringify({ exportadoEm: nowISO(), ...DB.exportMine(p.id) }, null, 2)], { type: "application/json" }); const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "meus-dados-clube-do-livro.json"; a.click(); };
  }
}

function diaryTab(T, p, mine) {
  const q = new URLSearchParams(location.hash.split("?")[1] || "");
  const current = DB.where("shelves", s => s.userId === p.id && ["lendo", "relendo"].includes(s.status)).map(s => book(s.bookId));
  const sel = q.get("livro") || current[0]?.id || "";
  const entries = DB.where("diary", d => d.userId === p.id).sort((a, b) => b.date.localeCompare(a.date));
  const groups = {}; entries.forEach(d => (groups[d.bookId] ||= []).push(d));
  T.innerHTML = `<div class="split"><div>
    ${Object.keys(groups).length ? Object.entries(groups).map(([bid, ds]) => { const b = book(bid); return `<div class="card" style="margin-bottom:18px"><div class="row" style="margin-bottom:12px;flex-wrap:nowrap"><div style="width:44px">${cover(b)}</div><div><h3 style="margin:0">${esc(b?.title)}</h3><small>${ds.length} registro(s)</small></div></div>${ds.map(d => `<div class="diary"><div class="diary__date">${fmtDate(d.date)}${d.page ? " · pág. " + d.page : ""}</div><div class="serif" style="white-space:pre-wrap">${esc(d.text)}</div></div>`).join("")}</div>`; }).join("") : emptyState("O diário ainda está em branco.")}
  </div>
  ${mine ? `<aside class="card"><h3>✍ Novo registro</h3><p class="muted" style="font-size:.88rem">Anote percepções durante a leitura: dúvidas, frases que marcaram, conexões com a sua vida. Pode ter muitos registros para um mesmo livro.</p>
    <form id="df"><div class="field"><label for="db">Livro</label><select id="db" required><option value="">Selecione</option>${current.map(b => `<option value="${b.id}" ${b.id === sel ? "selected" : ""}>${esc(b.title)}</option>`).join("")}${DB.where("shelves", s => s.userId === p.id && !["lendo", "relendo"].includes(s.status)).map(s => book(s.bookId)).map(b => `<option value="${b.id}" ${b.id === sel ? "selected" : ""}>${esc(b.title)}</option>`).join("")}</select></div>
    <div class="field"><label for="dpg">Página</label><input id="dpg" type="number" min="0"></div>
    <div class="field"><label for="dtx">Percepção</label><textarea id="dtx" data-typed required maxlength="1500"></textarea></div><button class="btn btn--block">Salvar no diário</button></form></aside>` : `<aside></aside>`}</div>`;
  $("#df") && ($("#df").onsubmit = e => { e.preventDefault(); DB.add("diary", { userId: p.id, bookId: $("#db").value, page: +$("#dpg").value || null, date: nowISO(), text: $("#dtx").value.trim() }); xp(4, "diário de leitura"); rerender(); });
}

async function mediaTab(T, p) {
  const list = DB.where("media", m => m.userId === p.id);
  T.innerHTML = list.length ? `<div class="media-list" id="ml"></div>` : emptyState("Grave áudios ou vídeos curtos na página de um livro que você já leu.");
  for (const m of list) { const url = await Media.url(m.id); $("#ml").insertAdjacentHTML("beforeend", `<div class="media-item">${m.kind === "video" ? `<video controls src="${url}"></video>` : `<audio controls src="${url}"></audio>`}<small><a href="#/livro/${m.bookId}">${esc(book(m.bookId)?.title)}</a> · ${esc(m.caption || "")}</small></div>`); }
}

function editProfile(p) {
  modal(`<h2 id="modalTitle">Editar perfil</h2><form id="ep">
  <div class="field"><label for="en">Nome de exibição</label><input id="en" type="text" maxlength="40" required value="${esc(p.name)}"></div>
  <div class="field"><label for="eb">Sobre mim como leitor(a)</label><textarea id="eb" data-typed maxlength="200" style="min-height:80px">${esc(p.bio || "")}</textarea></div>
  <div class="field"><label for="eg">Meta de leitura ${new Date().getFullYear()}</label><input id="eg" type="number" min="1" max="200" value="${p.goal || 6}"></div>
  ${p.photo ? `<label class="check" style="margin-bottom:14px"><input type="checkbox" id="erm"> Remover foto do perfil</label>` : ""}
  <button class="btn btn--block">Salvar</button></form>`, (root, close) => {
    $("#ep", root).onsubmit = e => { e.preventDefault(); DB.update("users", p.id, { name: $("#en", root).value.trim(), bio: $("#eb", root).value.trim(), goal: +$("#eg", root).value, ...($("#erm", root)?.checked ? { photo: null } : {}) }); close(); rerender(); };
  });
}

// ---------------------------------------------------------------- HUB DE REGISTRO (botão +)
export function novoRegistro() {
  const u = me();
  const lendo = DB.where("shelves", s => s.userId === u.id && ["lendo", "relendo"].includes(s.status));
  app().innerHTML = `<span class="eyebrow">Registrar</span><h1>O que você quer registrar?</h1>
  <div class="grid g3">
    ${lendo.map(s => `<button class="card" style="text-align:left;border:1px solid var(--line)" data-pg="${s.id}"><h3>📖 ${esc(book(s.bookId).title)}</h3><p class="muted" style="margin:0">Atualizar página e tempo de leitura</p></button>`).join("")}
    <a class="card" href="#/eu/diario" style="text-decoration:none;color:inherit"><h3>✍ Diário de leitura</h3><p class="muted" style="margin:0">Anotar uma percepção sobre a leitura atual</p></a>
    <a class="card" href="#/explorar" style="text-decoration:none;color:inherit"><h3>✉ Carta do leitor</h3><p class="muted" style="margin:0">Escolha a obra e escreva sua resenha crítica</p></a>
    <a class="card" href="#/novo-livro" style="text-decoration:none;color:inherit"><h3>＋ Cadastrar obra</h3><p class="muted" style="margin:0">Adicionar um livro ao acervo do clube</p></a>
    <a class="card" href="#/trocas" style="text-decoration:none;color:inherit"><h3>📌 Troca ou empréstimo</h3><p class="muted" style="margin:0">Anunciar um livro para trocar ou emprestar</p></a>
    <a class="card" href="#/quero-ser-entrevistado" style="text-decoration:none;color:inherit"><h3>🎙 Quero ser entrevistado</h3><p class="muted" style="margin:0">Responder à entrevista sobre um livro</p></a>
  </div>`;
  $$("[data-pg]").forEach(b => b.onclick = () => progressModal(b.dataset.pg));
}
