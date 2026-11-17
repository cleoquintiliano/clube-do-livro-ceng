// =====================================================================
// Páginas: rodas, entrevistas, trocas, biblioteca, podcast, tutoriais,
// atendimento, privacidade e administração
// =====================================================================
import { DB, Media, nowISO, uid } from "./db.js";
import { $, $$, esc, toast, modal, fmtDate, ago, avatar, userLink, cover, emptyState, imageToDataURL, bindNoPaste } from "./ui.js";
import { me, commentsBlock, bindComments } from "./views.js";
import { INTERVIEW_QUESTIONS, GENRES, TURMAS } from "./seed.js";

const C = window.CLUBE_CONFIG;
const app = () => $("#app");
const rerender = () => window.__rerender();
const book = id => DB.get("books", id);
const user = id => DB.get("users", id);
const isAdmin = () => me().role === "admin";

// ---------------------------------------------------------------- RODAS DE LEITURA
export function rodas() {
  const list = DB.all("rodas");
  const card = r => { const b = book(r.bookId), next = r.meetings.find(m => new Date(m.date) > new Date()); const inR = r.members.includes(me().id);
    return `<a class="card rodacard" href="#/roda/${r.id}"><div class="row" style="flex-wrap:nowrap;align-items:flex-start"><div style="width:70px;flex-shrink:0">${cover(b)}</div><div><span class="pill ${r.status === "ativa" ? "pill--verde" : ""}">${r.status === "ativa" ? "Ativa" : "Encerrada"}</span>${inR ? ` <span class="pill pill--azul">Você participa</span>` : ""}<h3 style="margin:6px 0 4px">${esc(r.title)}</h3><small>${esc(b?.title)} · ${esc(b?.author)}</small></div></div>
    <p class="muted" style="margin:0;font-size:.9rem">${esc(r.description)}</p><div class="row between"><div class="row" style="gap:0">${r.members.slice(0, 6).map(m => `<span style="margin-right:-8px">${avatar(user(m))}</span>`).join("")}</div><small>${next ? "Próximo: " + fmtDate(next.date, { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }) : "Sem encontros agendados"}</small></div></a>`; };
  app().innerHTML = `<div class="row between"><div><span class="eyebrow">Rodas de leitura</span><h1>Leia junto, converse melhor</h1><p class="muted">Cada roda reúne leitores em torno de uma obra, com encontros presenciais e conversa aqui na plataforma. As melhores conversas viram episódios do <a href="#/podcast">podcast</a>.</p></div>${isAdmin() ? `<a class="btn btn--verde" href="#/admin/rodas">＋ Nova roda</a>` : ""}</div>
  <h2 style="margin-top:20px">Ativas</h2><div class="grid g3">${list.filter(r => r.status === "ativa").map(card).join("") || emptyState("Nenhuma roda ativa.")}</div>
  <h2 style="margin-top:32px">Encerradas</h2><div class="grid g3">${list.filter(r => r.status !== "ativa").map(card).join("") || emptyState("Nenhuma roda encerrada.")}</div>`;
}

export function roda(id) {
  const r = DB.get("rodas", id); if (!r) return app().innerHTML = emptyState("Roda não encontrada.");
  const b = book(r.bookId), u = me(), inR = r.members.includes(u.id);
  const eps = DB.where("podcasts", p => p.rodaId === id);
  app().innerHTML = `<a href="#/rodas">← Rodas</a>
  <div class="split" style="margin-top:16px"><div>
    <div class="row" style="align-items:flex-start;flex-wrap:nowrap;gap:20px"><div style="width:110px;flex-shrink:0">${cover(b)}</div><div><span class="eyebrow">Roda de leitura · ${r.status}</span><h1>${esc(r.title)}</h1><p><a href="#/livro/${b.id}">${esc(b.title)}</a> · ${esc(b.author)}</p><p class="muted">${esc(r.description)}</p>
    ${r.status === "ativa" ? `<button class="btn ${inR ? "btn--ghost" : "btn--verde"}" id="join">${inR ? "Sair da roda" : "Participar da roda"}</button>` : ""}</div></div>
    <section class="section card">${inR || isAdmin() ? commentsBlock("roda:" + id, "Conversa da roda") : `<h3>Conversa da roda</h3>${emptyState("Participe da roda para ler e escrever na conversa.")}`}</section>
  </div>
  <aside class="stack">
    <div class="card"><h3>📅 Encontros</h3><ul class="list">${r.meetings.map(m => `<li style="display:block"><strong>${fmtDate(m.date, { weekday: "short", day: "2-digit", month: "short" })}</strong> · ${new Date(m.date).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}<br><small>${esc(m.place)}${new Date(m.date) < new Date() ? " · realizado" : ""}</small></li>`).join("") || "<li>A definir</li>"}</ul></div>
    <div class="card"><h3>Participantes (${r.members.length})</h3>${r.members.map(m => user(m)).filter(Boolean).map(x => `<div class="row" style="padding:4px 0">${avatar(x)}<span>${userLink(x)}<br><small>${esc(x.turma)}</small></span></div>`).join("")}<p class="muted" style="margin:10px 0 0;font-size:.85rem">Mediação: ${esc(user(r.mediatorId)?.name)}</p></div>
    ${eps.length ? `<div class="card"><h3>🎙 Episódios desta roda</h3>${eps.map(e => `<a href="#/podcast" style="display:block;padding:4px 0">${esc(e.title)}</a>`).join("")}</div>` : ""}
  </aside></div>`;
  $("#join") && ($("#join").onclick = () => { DB.update("rodas", id, x => ({ members: inR ? x.members.filter(m => m !== u.id) : [...x.members, u.id] })); toast(inR ? "Você saiu da roda" : "Boas-vindas à roda!", "ok"); rerender(); });
  bindComments(app(), "roda:" + id, true);
}

// ---------------------------------------------------------------- ENTREVISTAS
export function entrevistas() {
  const list = [...DB.all("interviews")].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
  const week = DB.settings().weekInterview;
  app().innerHTML = `<div class="row between"><div><span class="eyebrow">Repositório de entrevistas</span><h1>Leitores que inspiram leitores</h1><p class="muted" style="max-width:60ch">Toda semana uma entrevista vai para a página inicial e depois fica guardada aqui. No futuro, este acervo vai virar um livro físico de entrevistas do clube.</p></div><a class="btn" href="#/quero-ser-entrevistado" style="background:var(--aviso);color:var(--nanquim)">🎙 Quero ser entrevistado!</a></div>
  <div class="grid g3" style="margin-top:20px">${list.map(i => `<a class="card" href="#/entrevista/${i.id}" style="text-decoration:none;color:inherit;padding:0;overflow:hidden"><div style="height:150px;background:${user(i.userId)?.avatarColor || "#2E6F40"};display:grid;place-items:center;color:#fff;font-size:3rem;font-weight:800;position:relative">${i.photo ? `<img src="${i.photo}" alt="" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover">` : esc(i.studentName[0])}</div><div style="padding:16px"><div class="row">${i.id === week ? `<span class="pill pill--ouro">★ Entrevista da semana</span>` : ""}${i.example ? `<span class="pill">exemplo</span>` : ""}</div><h3 class="serif" style="margin:8px 0">${esc(i.headline)}</h3><small>${esc(i.studentName)} · ${esc(i.turma)} · <em>${esc(i.bookTitle)}</em><br>${fmtDate(i.publishedAt)}</small></div></a>`).join("") || emptyState("Nenhuma entrevista publicada ainda.")}</div>`;
}

export function entrevista(id) {
  const i = DB.get("interviews", id); if (!i) return app().innerHTML = emptyState("Entrevista não encontrada.");
  app().innerHTML = `<a href="#/entrevistas" class="noprint">← Entrevistas</a>
  <article class="article" style="margin-top:20px">
    <span class="iv-tag">ENTREVISTA</span>
    ${i.example ? `<p class="notice" style="margin-top:16px">Exemplo fictício criado para demonstrar o formato.</p>` : ""}
    <h1 class="serif" style="margin-top:22px">${esc(i.headline)}</h1>
    <p class="muted"><strong>${esc(i.studentName)}</strong> · ${esc(i.turma)} · sobre <em>${esc(i.bookTitle)}</em>, de ${esc(i.bookAuthor)} · ${fmtDate(i.publishedAt)}</p>
    ${i.photo ? `<img class="article__photo" src="${i.photo}" alt="Foto de ${esc(i.studentName)}">` : `<div class="article__photo" style="background:${user(i.userId)?.avatarColor || "#2E6F40"}">${esc(i.studentName[0])}</div>`}
    <p class="serif" style="font-size:1.15rem;line-height:1.7">${esc(i.intro)}</p>
    ${i.qa.filter(x => x.a).map(x => `<div class="qa"><h3>${esc(x.q)}</h3><p>${esc(x.a)}</p></div>`).join("")}
    ${i.score != null ? `<div class="qa"><h3>De 0 a 10, que nota você daria ao livro?</h3><p style="font-size:2rem;font-weight:800;color:var(--ouro);font-family:var(--sans)">${esc(i.score)}</p></div>` : ""}
    <div class="row noprint" style="margin-top:30px"><button class="btn btn--ghost" onclick="print()">🖨 Imprimir / salvar PDF</button>${i.bookId ? `<a class="btn" href="#/livro/${i.bookId}">Ver a obra</a>` : ""}</div>
  </article>`;
}

// ---------------------------------------------------------------- QUERO SER ENTREVISTADO
const DRAFT = "clube_iv_draft";
export function queroSerEntrevistado() {
  const u = me();
  const mine = DB.where("requests", r => r.userId === u.id);
  let draft = {}; try { draft = JSON.parse(localStorage.getItem(DRAFT + u.id)) || {}; } catch { }
  const Q = INTERVIEW_QUESTIONS;
  const ta = (key, label, req = true, long = true) => `<div class="field"><label for="${key}">${esc(label)}${req ? " *" : ""}</label>${long ? `<textarea id="${key}" name="${key}" data-typed ${req ? "required" : ""} maxlength="1500" style="min-height:90px">${esc(draft[key] || "")}</textarea>` : `<input id="${key}" name="${key}" type="text" data-typed ${req ? "required" : ""} maxlength="120" value="${esc(draft[key] || "")}">`}</div>`;
  app().innerHTML = `
  <div style="max-width:820px;margin:0 auto">
    <span class="iv-tag">ENTREVISTA</span>
    <h1 style="margin-top:18px">Quero ser entrevistado!</h1>
    <p class="muted">Responda às perguntas sobre um livro que você leu. A coordenação do clube revisa as respostas, monta a entrevista e ela pode aparecer como <strong>entrevista da semana</strong> na página inicial. Depois de enviar, você vai gerar o <strong>termo de autorização</strong> para seu responsável assinar.</p>
    ${mine.length ? `<div class="notice notice--info" style="margin-bottom:18px"><strong>Suas solicitações:</strong> ${mine.map(r => `<br>• <em>${esc(r.answers.livro)}</em> · ${statusReq(r)} · <a href="#/autorizacao/${r.id}">${r.guardian ? "ver autorização assinada" : "assinar autorização"}</a>`).join("")}</div>` : ""}
    <div class="card" style="position:sticky;top:64px;z-index:5;padding:12px 18px;margin-bottom:16px"><div class="row between"><small id="ivProg">0% respondido</small><small class="muted">Rascunho salvo automaticamente neste navegador</small></div><div class="lvlbar" style="margin-top:6px"><span id="ivBar" style="width:0"></span></div></div>
    <form id="ivf">
      <section class="card stack"><h2>1. Sobre você</h2>
        <div class="grid g2">${ta("nome", "Nome (como quer aparecer na entrevista)", true, false).replace(`value=""`, `value="${esc(draft.nome || u.name)}"`)}
        <div class="field"><label for="turma">Turma *</label><select id="turma" name="turma" required>${TURMAS.map(t => `<option ${(draft.turma || u.turma) === t ? "selected" : ""}>${t}</option>`).join("")}</select></div>
        <div class="field"><label for="idade">Idade *</label><input id="idade" name="idade" type="number" min="9" max="25" required value="${esc(draft.idade || "")}"></div></div>
        ${Q.sobre.map((q, k) => ta("s" + k, q)).join("")}
        <div class="field"><label for="foto">Foto para a entrevista (opcional)</label><input id="foto" type="file" accept="image/*"><small class="muted">Só será publicada se o responsável autorizar o uso de imagem.</small></div>
      </section>
      <section class="card stack" style="margin-top:18px"><h2>2. Sobre a obra lida</h2>
        <div class="grid g2">${ta("livro", "a) Qual é o nome do livro?", true, false)}${ta("autor", "b) Quem é o(a) autor(a)?", true, false)}${ta("editora", "c) Qual a editora?", true, false)}
        <div class="field"><label for="paginas">d) Quantas páginas tem o livro? *</label><input id="paginas" name="paginas" type="number" min="1" required value="${esc(draft.paginas || "")}"></div>
        <div class="field"><label for="ano">e) Em que ano o livro que você leu foi publicado? *</label><input id="ano" name="ano" type="number" min="1500" max="2100" required value="${esc(draft.ano || "")}"></div>
        <div class="field"><label for="genero">f) Em que gênero esse livro se enquadra? *</label><select id="genero" name="genero" required><option value="">Selecione</option>${GENRES.map(g => `<option ${draft.genero === g ? "selected" : ""}>${g}</option>`).join("")}</select></div>
        <div class="field"><label for="nota">g) De 0 a 10, que nota você deu para esse livro? *</label><input id="nota" name="nota" type="number" min="0" max="10" required value="${esc(draft.nota ?? "")}"></div></div>
      </section>
      <section class="card stack" style="margin-top:18px"><h2>3. A conversa sobre o livro</h2>${Q.obra.map((q, k) => ta("q" + k, q)).join("")}</section>
      <div class="card" style="margin-top:18px"><label class="check"><input type="checkbox" required id="ivok"> Declaro que as respostas foram escritas por mim e sei que a entrevista pode ser editada (correções de ortografia e cortes) antes da publicação.</label>
      <button class="btn btn--block" style="margin-top:14px">Enviar e gerar autorização dos responsáveis</button></div>
    </form>
  </div>`;
  const f = $("#ivf");
  const progress = () => { const req = $$("[required]", f).filter(x => x.type !== "checkbox"); const ok = req.filter(x => x.value.trim()).length; const p = Math.round(ok / req.length * 100); $("#ivProg").textContent = `${p}% respondido (${ok}/${req.length})`; $("#ivBar").style.width = p + "%"; };
  let t; f.addEventListener("input", () => { progress(); clearTimeout(t); t = setTimeout(() => { const d = Object.fromEntries(new FormData(f)); localStorage.setItem(DRAFT + u.id, JSON.stringify(d)); }, 400); });
  progress();
  f.onsubmit = async e => {
    e.preventDefault();
    const a = Object.fromEntries(new FormData(f));
    let photo = null; const file = $("#foto").files[0];
    if (file) try { photo = await imageToDataURL(file, 900, .8); } catch { }
    const r = DB.add("requests", { userId: u.id, answers: a, photo, status: "aguardando autorização", date: nowISO(), guardian: null });
    localStorage.removeItem(DRAFT + u.id);
    toast("Respostas enviadas! Agora gere a autorização.", "ok");
    location.hash = "#/autorizacao/" + r.id;
  };
}
const statusReq = r => `<span class="pill ${r.status === "publicada" ? "pill--verde" : r.status === "em revisão" ? "pill--azul" : "pill--ouro"}">${r.status}</span>`;

// ---------------------------------------------------------------- AUTORIZAÇÃO DOS RESPONSÁVEIS
export function autorizacao(id) {
  const r = DB.get("requests", id); if (!r) return app().innerHTML = emptyState("Solicitação não encontrada.");
  const s = r.answers, g = r.guardian;
  const hoje = fmtDate(g?.signedAt || nowISO(), { day: "2-digit", month: "long", year: "numeric" });
  app().innerHTML = `<a href="#/quero-ser-entrevistado" class="noprint">← Quero ser entrevistado</a>
  <div style="max-width:820px;margin:16px auto 0">
    <div class="notice notice--info noprint" style="margin-bottom:16px">Mostre esta página ao seu responsável <strong>no celular ou computador</strong> para assinar com o dedo/mouse, ou use <strong>Imprimir / salvar PDF</strong> para assinar no papel ou com a assinatura eletrônica gratuita do <strong>gov.br</strong> (Assinador GOV.BR).</div>
    <div class="doc">
      <h2>TERMO DE AUTORIZAÇÃO DE PARTICIPAÇÃO, USO DE IMAGEM E DE TEXTO</h2>
      <p style="text-align:center"><small>${esc(C.APP_NAME)} · ${esc(C.SCHOOL)} · ${esc(C.CITY)}</small></p>
      <p>Eu, <strong>${g ? esc(g.name) : "______________________________"}</strong>, ${g ? esc(g.relation) : "________________"} e responsável legal pelo(a) estudante <strong>${esc(s.nome)}</strong>, da turma <strong>${esc(s.turma)}</strong>, declaro estar ciente de que ele(a) respondeu voluntariamente a uma entrevista sobre o livro <strong><em>${esc(s.livro)}</em></strong>, de ${esc(s.autor)}, no âmbito do Clube do Livro do ${esc(C.SCHOOL)}.</p>
      <p>Em conformidade com o Estatuto da Criança e do Adolescente (Lei nº 8.069/1990, arts. 17 e 100) e com a Lei Geral de Proteção de Dados Pessoais (Lei nº 13.709/2018, art. 14), que exige o consentimento específico e em destaque de pelo menos um dos pais ou responsável legal para o tratamento de dados de crianças e adolescentes, AUTORIZO, de forma gratuita, as opções marcadas abaixo:</p>
      <div id="opts">
        ${[["publicar", "Publicação do texto da entrevista na plataforma do Clube do Livro, acessível somente a estudantes e professores da escola com conta institucional."], ["imagem", "Uso da fotografia enviada pelo(a) estudante junto à entrevista."], ["livro", "Inclusão da entrevista em uma futura coletânea impressa do Clube do Livro, sem fins lucrativos."], ["podcast", "Leitura da entrevista ou participação do(a) estudante em episódio do podcast do Clube do Livro."]].map(([k, t]) => `<label class="check" style="margin:8px 0"><input type="checkbox" name="${k}" ${g ? (g.opts[k] ? "checked" : "") + " disabled" : k === "publicar" ? "checked" : ""}> <span>${t}</span></label>`).join("")}
      </div>
      <p>Estou ciente de que: serão divulgados apenas o primeiro nome, a turma e as respostas revisadas; não serão divulgados endereço, telefone, documentos ou dados de localização; posso revogar esta autorização a qualquer momento, solicitando a retirada do conteúdo pelo Atendimento ao Leitor ou diretamente à coordenação do clube; e os dados serão usados exclusivamente para as finalidades educativas acima.</p>
      <p>Londrina, ${hoje}.</p>
      ${g ? `<div style="margin-top:20px;text-align:center"><img src="${g.signature}" alt="Assinatura do responsável" style="max-height:110px;margin:0 auto;border-bottom:1px solid var(--nanquim)"><p style="margin:4px 0 0">${esc(g.name)} (${esc(g.relation)})<br><small>Assinado digitalmente na plataforma em ${new Date(g.signedAt).toLocaleString("pt-BR")} · código ${esc(r.id)}</small></p></div>`
      : `<div class="noprint" style="margin-top:20px">
          <div class="grid g2"><div class="field"><label for="gn">Nome completo do responsável *</label><input id="gn" type="text" required maxlength="100"></div>
          <div class="field"><label for="gr">Parentesco *</label><select id="gr" required><option value="">Selecione</option><option>mãe</option><option>pai</option><option>avó/avô</option><option>tutor(a) legal</option><option>outro responsável legal</option></select></div></div>
          <label>Assinatura do responsável *</label><canvas class="sigpad" id="sig" aria-label="Área para assinatura"></canvas>
          <div class="row between" style="margin-top:6px"><small class="muted">Assine com o dedo ou o mouse.</small><button class="btn btn--sm btn--ghost" id="clr" type="button">Limpar</button></div>
          <label class="check" style="margin-top:14px"><input type="checkbox" id="gok"> Declaro ser o responsável legal pelo(a) estudante e que li este termo.</label>
          <button class="btn btn--verde btn--block" id="sign" style="margin-top:14px">Assinar autorização</button>
        </div>
        <div class="print-only" style="margin-top:50px;text-align:center">_______________________________________<br>Assinatura do responsável legal</div>`}
    </div>
    <div class="row noprint" style="margin-top:16px"><button class="btn btn--ghost" onclick="print()">🖨 Imprimir / salvar PDF</button><a class="btn btn--ghost" href="https://www.gov.br/governodigital/pt-br/identidade/assinatura-eletronica" target="_blank" rel="noopener">Como assinar pelo gov.br ↗</a></div>
  </div>`;
  if (g) return;
  const c = $("#sig"), ctx = c.getContext("2d"); let drawing = false, dirty = false;
  const fit = () => { const r2 = c.getBoundingClientRect(); c.width = r2.width * devicePixelRatio; c.height = r2.height * devicePixelRatio; ctx.scale(devicePixelRatio, devicePixelRatio); ctx.lineWidth = 2.2; ctx.lineCap = "round"; ctx.strokeStyle = "#1A202C"; };
  fit();
  const pos = e => { const b = c.getBoundingClientRect(); return [e.clientX - b.left, e.clientY - b.top]; };
  c.onpointerdown = e => { drawing = true; dirty = true; c.setPointerCapture(e.pointerId); ctx.beginPath(); ctx.moveTo(...pos(e)); };
  c.onpointermove = e => { if (drawing) { ctx.lineTo(...pos(e)); ctx.stroke(); } };
  c.onpointerup = () => drawing = false;
  $("#clr").onclick = () => { ctx.clearRect(0, 0, c.width, c.height); dirty = false; };
  $("#sign").onclick = () => {
    if (!$("#gn").value.trim() || !$("#gr").value) return toast("Preencha nome e parentesco do responsável.", "warn");
    if (!dirty) return toast("Falta a assinatura.", "warn");
    if (!$("#gok").checked) return toast("Confirme a declaração.", "warn");
    const opts = Object.fromEntries($$("#opts input").map(i => [i.name, i.checked]));
    if (!opts.publicar) return toast("Sem autorizar a publicação, a entrevista não pode ser divulgada.", "warn");
    DB.update("requests", id, { guardian: { name: $("#gn").value.trim(), relation: $("#gr").value, signature: c.toDataURL("image/png"), signedAt: nowISO(), opts }, status: "em revisão" });
    toast("Autorização assinada! A coordenação vai revisar sua entrevista.", "ok"); rerender();
  };
}

// ---------------------------------------------------------------- TROCAS E EMPRÉSTIMOS
export function trocas() {
  let filter = "todos";
  const types = { troca: ["🔄", "Troca", "pill--azul"], emprestimo: ["🤝", "Empréstimo", "pill--verde"], procuro: ["🔎", "Procuro", "pill--terra"] };
  const draw = () => {
    const list = DB.all("trades").filter(t => filter === "todos" || t.type === filter).sort((a, b) => (a.status === "aberto" ? 0 : 1) - (b.status === "aberto" ? 0 : 1) || b.date.localeCompare(a.date));
    $("#tl").innerHTML = list.map(t => { const u = user(t.userId), mine = t.userId === me().id, [ic, lb, pc] = types[t.type];
      return `<div class="card trade" style="${t.status !== "aberto" ? "opacity:.55" : ""}"><div class="cover" style="background:${{ troca: "#1B365D", emprestimo: "#2E6F40", procuro: "#C84B31" }[t.type]};padding:10%"><span class="cover__t" style="font-size:.7rem">${esc(t.bookTitle)}</span></div>
      <div><div class="row"><span class="pill ${pc}">${ic} ${lb}</span>${t.status !== "aberto" ? `<span class="pill">concluído</span>` : ""}</div><h3 style="margin:6px 0 2px">${esc(t.bookTitle)}</h3><small>${esc(t.author || "")}${t.condition ? " · " + esc(t.condition) : ""}</small><p style="margin:8px 0;font-size:.92rem">${esc(t.note)}</p>
      <div class="row between"><small>${avatar(u)} ${userLink(u)} · ${esc(u?.turma)} · ${ago(t.date)}</small>${mine && t.status === "aberto" ? `<button class="btn btn--sm btn--ghost" data-done="${t.id}">Marcar como concluído</button>` : t.status === "aberto" ? `<button class="btn btn--sm" data-int="${t.id}">Tenho interesse</button>` : ""}</div></div></div>`; }).join("") || emptyState("Nenhum anúncio.");
    $$("[data-done]").forEach(b => b.onclick = () => { DB.update("trades", b.dataset.done, { status: "concluido" }); draw(); });
    $$("[data-int]").forEach(b => b.onclick = () => { const t = DB.get("trades", b.dataset.int); DB.add("comments", { target: "trade:" + t.id, userId: me().id, text: "Tenho interesse", date: nowISO() }); toast(`Interesse registrado! Combine com ${user(t.userId)?.name} na escola, na biblioteca ou com a coordenação do clube.`, "ok"); });
  };
  app().innerHTML = `<div class="row between"><div><span class="eyebrow" style="color:var(--terracota)">📌 Espaço fixado</span><h1>Trocas e empréstimos</h1><p class="muted" style="max-width:62ch">Anuncie livros para trocar ou emprestar e encontre o que você procura. As entregas são combinadas <strong>somente dentro da escola</strong> (biblioteca ou sala do clube). Não compartilhe telefone ou endereço aqui.</p></div><button class="btn btn--terra" id="newT">＋ Novo anúncio</button></div>
  <div class="chip-row" style="margin:16px 0">${[["todos", "Todos"], ["troca", "🔄 Trocas"], ["emprestimo", "🤝 Empréstimos"], ["procuro", "🔎 Procuro"]].map(([k, v]) => `<button class="chip ${k === filter ? "active" : ""}" data-f="${k}">${v}</button>`).join("")}</div>
  <div class="grid g2" id="tl"></div>`;
  $$("[data-f]").forEach(c => c.onclick = () => { filter = c.dataset.f; $$("[data-f]").forEach(x => x.classList.toggle("active", x === c)); draw(); });
  draw();
  $("#newT").onclick = () => modal(`<h2 id="modalTitle">Novo anúncio</h2><form id="tf">
    <div class="field"><label for="tt">Tipo</label><select id="tt"><option value="troca">🔄 Quero trocar</option><option value="emprestimo">🤝 Posso emprestar</option><option value="procuro">🔎 Estou procurando</option></select></div>
    <div class="grid g2"><div class="field"><label for="tb">Título do livro *</label><input id="tb" type="text" required maxlength="120"></div><div class="field"><label for="ta">Autor(a)</label><input id="ta" type="text" maxlength="100"></div></div>
    <div class="field"><label for="tc">Estado de conservação</label><select id="tc"><option>Como novo</option><option>Bom estado</option><option>Marcas de uso</option><option>—</option></select></div>
    <div class="field"><label for="tn">Detalhes *</label><textarea id="tn" data-typed required maxlength="300" style="min-height:80px" placeholder="Ex.: empresto por 2 semanas; troco por livro de fantasia."></textarea></div>
    <button class="btn btn--terra btn--block">Publicar anúncio</button></form>`, (root, close) => {
    $("#tf", root).onsubmit = e => { e.preventDefault(); DB.add("trades", { userId: me().id, type: $("#tt", root).value, bookTitle: $("#tb", root).value.trim(), author: $("#ta", root).value.trim(), condition: $("#tc", root).value === "—" ? "" : $("#tc", root).value, note: $("#tn", root).value.trim(), status: "aberto", date: nowISO() }); close(); toast("+5 pontos · anúncio publicado", "xp"); draw(); };
  });
}

// ---------------------------------------------------------------- BIBLIOTECA (DOMÍNIO PÚBLICO)
export function biblioteca() {
  const list = DB.all("library");
  app().innerHTML = `<div class="row between"><div><span class="eyebrow">Biblioteca livre</span><h1>Obras em domínio público</h1><p class="muted" style="max-width:62ch">Clássicos que podem ser lidos gratuitamente. Obras com PDF no acervo abrem no leitor da plataforma; as demais abrem na fonte oficial.</p></div>${isAdmin() ? `<a class="btn btn--verde" href="#/admin/biblioteca">＋ Adicionar PDF</a>` : ""}</div>
  <div class="shelf" style="margin-top:20px">${list.map(l => `<a class="bookcard" href="#/ler/${l.id}">${cover({ title: l.title, author: l.author, color: ["#1B365D", "#2E6F40", "#C84B31", "#D97706", "#4A5568"][l.title.length % 5] })}<h4>${esc(l.title)}</h4><p>${esc(l.author)} · ${l.year}<br>${l.pdf || l.pdfKey ? `<span class="pill pill--verde">📄 ler aqui</span>` : `<span class="pill">↗ fonte externa</span>`}</p></a>`).join("")}</div>
  <p class="muted" style="margin-top:28px;font-size:.88rem">Fontes recomendadas: <a href="https://www.dominiopublico.gov.br/" target="_blank" rel="noopener">Portal Domínio Público (MEC)</a> e <a href="https://pt.wikisource.org/" target="_blank" rel="noopener">Wikisource em português</a>.</p>`;
}
export async function ler(id) {
  const l = DB.get("library", id); if (!l) return app().innerHTML = emptyState("Obra não encontrada.");
  const src = l.pdfKey ? await Media.url(l.pdfKey) : l.pdf;
  app().innerHTML = `<a href="#/biblioteca">← Biblioteca</a><div class="row between" style="margin:12px 0"><div><h1 class="serif" style="margin:0">${esc(l.title)}</h1><small>${esc(l.author)} · ${l.year} · ${esc(l.genre)}</small></div>${l.source ? `<a class="btn btn--ghost btn--sm" href="${esc(l.source)}" target="_blank" rel="noopener">Abrir na fonte ↗</a>` : ""}</div>
  ${src ? `<iframe class="reader" src="${src}#view=FitH" title="Leitor: ${esc(l.title)}"></iframe><p class="muted" style="font-size:.85rem">Se o PDF não aparecer no seu celular, <a href="${src}" target="_blank" rel="noopener">abra em nova aba</a>.</p>`
    : `<div class="empty"><p>Esta obra ainda não tem PDF no acervo da plataforma.</p><a class="btn" href="${esc(l.source)}" target="_blank" rel="noopener">Ler gratuitamente na fonte ↗</a>${isAdmin() ? `<p style="margin-top:14px"><a href="#/admin/biblioteca">Administrador: anexar PDF</a></p>` : ""}</div>`}`;
}

// ---------------------------------------------------------------- PODCAST
export async function podcast() {
  const eps = [...DB.all("podcasts")].sort((a, b) => b.date.localeCompare(a.date));
  app().innerHTML = `<section class="hero" style="grid-template-columns:1fr"><div style="position:relative;z-index:1"><span class="eyebrow" style="color:#E9C46A">Podcast do clube</span><h1>Rodas em voz alta</h1><p>Episódios gravados a partir das Rodas de leitura: as melhores conversas dos encontros, editadas pelos próprios estudantes com a coordenação.</p></div></section>
  <div class="stack" style="margin-top:24px" id="eps">${eps.map(e => { const r = DB.get("rodas", e.rodaId); return `<div class="card row" style="flex-wrap:nowrap;align-items:flex-start;gap:18px"><div style="width:70px;flex-shrink:0">${cover(book(r?.bookId))}</div><div style="flex:1;min-width:0"><small>${fmtDate(e.date)} · ${esc(e.duration)} · <a href="#/roda/${r?.id}">${esc(r?.title)}</a></small><h3 style="margin:4px 0">${esc(e.title)}</h3><p class="muted" style="margin:0 0 10px">${esc(e.description)}</p><div data-ep="${e.id}">${e.mediaKey ? "" : `<span class="pill">áudio ainda não publicado</span>`}</div></div></div>`; }).join("") || emptyState("Nenhum episódio ainda.")}</div>
  ${isAdmin() ? `<a class="btn btn--verde" href="#/admin/podcast" style="margin-top:16px">＋ Publicar episódio</a>` : ""}`;
  for (const e of eps.filter(x => x.mediaKey)) { const url = await Media.url(e.mediaKey); const el = $(`[data-ep="${e.id}"]`); if (el && url) el.innerHTML = `<audio controls src="${url}" style="width:100%"></audio>`; }
}

// ---------------------------------------------------------------- TUTORIAIS
export function tutoriais() {
  const T = [
    ["📖", "Técnicas de leitura", `<p>Ler bem não é ler rápido: é entender, lembrar e conseguir conversar sobre o que leu.</p><ol><li><strong>Pré-leitura (skimming):</strong> antes de começar, observe capa, título, orelha, sumário e quarta capa. Faça uma previsão: sobre o que será?</li><li><strong>Leitura ativa:</strong> leia com lápis por perto. Marque palavras desconhecidas e trechos que chamaram atenção (use marcadores adesivos em livros emprestados).</li><li><strong>Pausas de checagem:</strong> ao fim de cada capítulo, conte para você mesmo, em duas frases, o que aconteceu.</li><li><strong>Perguntas ao texto:</strong> quem narra? Posso confiar nesse narrador? O que o personagem quer? O que o impede?</li><li><strong>Ritmo:</strong> 20 minutos por dia rendem mais que 3 horas uma vez por mês. Registre seu tempo na plataforma e acompanhe no perfil.</li></ol>`],
    ["🗂", "Como fazer um fichamento", `<p>O fichamento é um registro organizado da leitura. Ele ajuda a estudar e a escrever a sua carta do leitor.</p><ul><li><strong>Referência:</strong> autor, título, editora, ano e número de páginas.</li><li><strong>Resumo:</strong> com as suas palavras, em até 10 linhas, sem contar o final.</li><li><strong>Personagens e espaço:</strong> quem são, onde e quando a história acontece.</li><li><strong>Citações:</strong> copie à mão trechos marcantes, sempre entre aspas e com o número da página.</li><li><strong>Comentário crítico:</strong> o que você achou e por quê, com exemplos do livro.</li><li><strong>Conexões:</strong> o livro lembra outra obra, um filme, uma aula, algo da sua vida?</li></ul><p class="notice notice--info">Dica: o <a href="#/eu/diario">diário de leitura</a> da plataforma funciona como um fichamento em construção.</p>`],
    ["✉", "Como escrever uma carta do leitor", `<ol><li>Comece apresentando a obra: título, autor e sobre o que é (sem spoiler).</li><li>Diga o que achou e <strong>justifique</strong> com exemplos: um personagem, uma cena, o jeito de escrever.</li><li>Aponte pontos fortes e fracos. Crítica não é só falar mal: é analisar.</li><li>Termine dizendo para quem você recomendaria.</li><li>Releia antes de publicar. Lembre: aqui na plataforma tudo é digitado por você, sem colar.</li></ol>`],
    ["🧴", "Conservação do livro", `<ul><li>Lave e seque as mãos antes de ler; nada de comer sobre o livro.</li><li>Use marcador de página. Nunca dobre a ponta da folha (a famosa "orelha").</li><li>Não abra o livro totalmente "deitado" para não quebrar a lombada.</li><li>Guarde em pé na estante, longe de sol direto, umidade e calor.</li><li>Em livros da biblioteca ou emprestados: não escreva, não grife; use post-its removíveis.</li><li>Transporte dentro da mochila em um saco plástico em dias de chuva.</li><li>Folha rasgada? Não use fita adesiva comum: avise a biblioteca, que tem fita própria para restauro.</li></ul>`],
    ["🎙", "Como participar de uma roda de leitura", `<ul><li>Leia o trecho combinado antes do encontro e anote 2 perguntas.</li><li>Escute até o fim antes de responder. Discorde da ideia, nunca da pessoa.</li><li>Use exemplos do texto para defender sua opinião ("na página 54...").</li><li>Dê espaço para quem fala menos. Uma boa roda é uma conversa, não uma prova.</li></ul>`]
  ];
  app().innerHTML = `<span class="eyebrow">Tutoriais</span><h1>Aprenda a ler (ainda) melhor</h1><p class="muted">Guias rápidos de técnicas de leitura, fichamento, escrita e cuidado com os livros.</p>
  <div class="grid g2 tut" style="margin-top:20px">${T.map(([i, t, b]) => `<article class="card"><h3>${i} ${t}</h3>${b}</article>`).join("")}</div>`;
}

// ---------------------------------------------------------------- ATENDIMENTO AO LEITOR
export function atendimento() {
  const mine = DB.where("tickets", t => t.userId === me().id).sort((a, b) => b.date.localeCompare(a.date));
  const faq = [["Como adiciono um livro que não está no acervo?", "Use Explorar > Cadastrar obra. Confira antes na busca se ele já existe."], ["Por que não consigo colar texto?", "No clube valorizamos a escrita autoral: cartas, diário, comentários e entrevistas devem ser digitados por você."], ["Como subo de nível?", "Lendo, escrevendo cartas, registrando o diário, comentando, participando das rodas e das trocas. Veja o detalhamento em Perfil > Conquistas."], ["Quero apagar algo que escrevi ou retirar minha entrevista.", "Abra uma solicitação abaixo na categoria Privacidade e dados. Você e seu responsável podem pedir isso a qualquer momento."], ["Alguém foi desrespeitoso comigo.", "Abra uma solicitação na categoria Denúncia ou fale com um professor. Ela é vista só pela coordenação."]];
  app().innerHTML = `<span class="eyebrow">Atendimento ao leitor</span><h1>Como podemos ajudar?</h1>
  <div class="split"><div><div class="card"><h2>Perguntas frequentes</h2>${faq.map(([q, a]) => `<details class="faq"><summary>${q}</summary><p style="margin:8px 0 0">${a}</p></details>`).join("")}</div>
    <h2 style="margin-top:28px">Minhas solicitações</h2>${mine.map(t => `<div class="card" style="margin-bottom:12px"><div class="row between"><strong>${esc(t.subject)}</strong><span class="pill ${t.status === "respondido" ? "pill--verde" : "pill--ouro"}">${t.status}</span></div><small>${esc(t.category)} · ${fmtDate(t.date)}</small><p class="serif" style="margin:8px 0">${esc(t.text)}</p>${t.reply ? `<div class="notice notice--ok"><strong>Coordenação:</strong> ${esc(t.reply)}</div>` : ""}</div>`).join("") || `<p class="muted">Nenhuma solicitação.</p>`}
  </div>
  <aside class="card"><h3>Nova solicitação</h3><form id="tkf"><div class="field"><label for="kc">Categoria</label><select id="kc"><option>Dúvida</option><option>Sugestão</option><option>Problema técnico</option><option>Correção de obra</option><option>Privacidade e dados</option><option>Denúncia</option></select></div>
  <div class="field"><label for="ks">Assunto</label><input id="ks" type="text" required maxlength="80"></div><div class="field"><label for="kt">Mensagem</label><textarea id="kt" data-typed required maxlength="1000"></textarea></div><button class="btn btn--block">Enviar</button></form>
  <p class="muted" style="font-size:.82rem;margin-top:12px">Em caso de situação grave ou urgente, procure imediatamente um professor ou a equipe pedagógica da escola.</p></aside></div>`;
  $("#tkf").onsubmit = e => { e.preventDefault(); DB.add("tickets", { userId: me().id, category: $("#kc").value, subject: $("#ks").value.trim(), text: $("#kt").value.trim(), date: nowISO(), status: "aberto", reply: "" }); toast("Solicitação enviada!", "ok"); rerender(); };
}

// ---------------------------------------------------------------- PRIVACIDADE (LGPD/ECA)
export function privacidade() {
  app().innerHTML = `<article class="article"><span class="eyebrow">Privacidade e proteção</span><h1>Como cuidamos dos seus dados</h1>
  <p class="notice notice--info">Versão preliminar (v0.1) para revisão da direção da escola. Os requisitos não-funcionais serão detalhados nas próximas versões.</p>
  <div class="tut">
  <h3>Base legal</h3><p>A plataforma segue a Lei Geral de Proteção de Dados Pessoais (LGPD, Lei nº 13.709/2018), em especial o art. 14, que trata dos dados de crianças e adolescentes e exige que o tratamento seja feito no seu <strong>melhor interesse</strong>, e o Estatuto da Criança e do Adolescente (ECA, Lei nº 8.069/1990), que garante o direito ao respeito, à imagem e à privacidade.</p>
  <h3>Quem pode acessar</h3><p>Somente estudantes e professores do ${esc(C.SCHOOL)} com conta institucional @${esc(C.ALLOWED_DOMAINS[0])}, com autorização dos responsáveis para participar do Clube do Livro. Os perfis não são públicos na internet nem indexados por buscadores.</p>
  <h3>Quais dados usamos (minimização)</h3><ul><li>Nome de exibição, turma e e-mail institucional;</li><li>Foto de perfil opcional (pode ser um avatar);</li><li>Registros de leitura, cartas, diário, comentários e mídias que você mesmo cria.</li></ul><p>Não pedimos CPF, endereço, telefone, localização ou dados sensíveis. A idade só é solicitada no formulário de entrevista, a pedido da coordenação, e não é exibida no perfil.</p>
  <h3>Entrevistas e imagem</h3><p>Uma entrevista só é publicada após o termo de autorização assinado por um responsável legal, que escolhe separadamente o uso do texto, da foto, da coletânea impressa e do podcast. A autorização pode ser revogada a qualquer momento.</p>
  <h3>Segurança e convivência</h3><ul><li>Não existe chat privado entre estudantes: as conversas acontecem em espaços visíveis e moderados pela coordenação.</li><li>Trocas e empréstimos são combinados somente dentro da escola.</li><li>Denúncias pelo Atendimento ao Leitor são vistas apenas pela coordenação.</li><li>Sem anúncios, sem rastreadores de terceiros e com fontes hospedadas na própria plataforma.</li></ul>
  <h3>Seus direitos</h3><p>Você e seu responsável podem acessar, corrigir, baixar (em Perfil > "Baixar meus dados") e pedir a exclusão dos seus dados pelo <a href="#/atendimento">Atendimento ao Leitor</a>.</p>
  <h3>Nesta versão de demonstração</h3><p>Todos os dados ficam salvos apenas no navegador deste dispositivo (localStorage e IndexedDB). Os leitores de exemplo são fictícios.</p>
  </div></article>`;
}

// ---------------------------------------------------------------- ADMINISTRAÇÃO
export function admin(tab = "solicitacoes") {
  if (!isAdmin()) return app().innerHTML = emptyState("Área restrita à coordenação do clube.");
  const reqs = DB.all("requests"), tk = DB.where("tickets", t => t.status !== "respondido");
  const tabs = { solicitacoes: `Entrevistas (${reqs.filter(r => r.status === "em revisão").length})`, rodas: "Rodas", podcast: "Podcast", biblioteca: "Biblioteca", obras: "Destaques", atendimento: `Atendimento (${tk.length})`, dados: "Dados" };
  app().innerHTML = `<span class="eyebrow">Administração</span><h1>Painel da coordenação</h1><div class="tabs">${Object.entries(tabs).map(([k, v]) => `<button class="${k === tab ? "active" : ""}" onclick="location.hash='#/admin/${k}'">${v}</button>`).join("")}</div><div id="at"></div>`;
  const A = $("#at");
  if (tab === "solicitacoes") {
    const ivs = [...DB.all("interviews")].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
    A.innerHTML = `<h2>Solicitações “Quero ser entrevistado”</h2>${reqs.map(r => `<div class="card" style="margin-bottom:12px"><div class="row between"><div><strong>${esc(r.answers.nome)}</strong> · ${esc(r.answers.turma)} · <em>${esc(r.answers.livro)}</em><br><small>${fmtDate(r.date)} · ${r.guardian ? `autorizado por ${esc(r.guardian.name)} (${esc(r.guardian.relation)}) · foto: ${r.guardian.opts.imagem ? "sim" : "não"}` : "sem autorização"}</small></div><div class="row">${statusReq(r)}${r.guardian && r.status !== "publicada" ? `<button class="btn btn--sm btn--verde" data-pub="${r.id}">Montar e publicar</button>` : ""}<a class="btn btn--sm btn--ghost" href="#/autorizacao/${r.id}">Termo</a></div></div></div>`).join("") || emptyState("Nenhuma solicitação.")}
    <h2 style="margin-top:28px">Entrevistas publicadas</h2>${ivs.map(i => `<div class="card row between" style="margin-bottom:10px"><span><strong>${esc(i.headline)}</strong><br><small>${esc(i.studentName)} · ${fmtDate(i.publishedAt)}</small></span><div class="row">${DB.settings().weekInterview === i.id ? `<span class="pill pill--ouro">★ da semana</span>` : `<button class="btn btn--sm" data-week="${i.id}">Definir como da semana</button>`}<button class="btn btn--sm btn--ghost" data-delv="${i.id}">Excluir</button></div></div>`).join("")}`;
    $$("[data-week]").forEach(b => b.onclick = () => { DB.setSetting("weekInterview", b.dataset.week); toast("Entrevista da semana atualizada", "ok"); rerender(); });
    $$("[data-delv]").forEach(b => b.onclick = () => { if (confirm("Excluir entrevista?")) { DB.remove("interviews", b.dataset.delv); rerender(); } });
    $$("[data-pub]").forEach(b => b.onclick = () => publishModal(DB.get("requests", b.dataset.pub)));
  }
  else if (tab === "rodas") {
    A.innerHTML = `<div class="split"><div>${DB.all("rodas").map(r => `<div class="card row between" style="margin-bottom:10px"><span><strong>${esc(r.title)}</strong><br><small>${r.members.length} participantes · ${r.status}</small></span><div class="row"><button class="btn btn--sm btn--ghost" data-meet="${r.id}">＋ Encontro</button><button class="btn btn--sm btn--ghost" data-toggle="${r.id}">${r.status === "ativa" ? "Encerrar" : "Reabrir"}</button></div></div>`).join("")}</div>
    <aside class="card"><h3>Nova roda de leitura</h3><form id="rf"><div class="field"><label for="rb">Obra</label><select id="rb" required>${DB.all("books").map(b => `<option value="${b.id}">${esc(b.title)}</option>`).join("")}</select></div><div class="field"><label for="rt">Nome da roda</label><input id="rt" type="text" required></div><div class="field"><label for="rd">Descrição</label><textarea id="rd" style="min-height:80px" required></textarea></div><div class="field"><label for="rdt">Primeiro encontro</label><input id="rdt" type="datetime-local" required></div><div class="field"><label for="rp">Local</label><input id="rp" type="text" value="Biblioteca da escola"></div><button class="btn btn--verde btn--block">Criar roda</button></form></aside></div>`;
    $("#rf").onsubmit = e => { e.preventDefault(); DB.add("rodas", { bookId: $("#rb").value, title: $("#rt").value, description: $("#rd").value, mediatorId: me().id, members: [], meetings: [{ date: new Date($("#rdt").value).toISOString(), place: $("#rp").value }], status: "ativa" }); toast("Roda criada", "ok"); rerender(); };
    $$("[data-toggle]").forEach(b => b.onclick = () => { DB.update("rodas", b.dataset.toggle, r => ({ status: r.status === "ativa" ? "encerrada" : "ativa" })); rerender(); });
    $$("[data-meet]").forEach(b => b.onclick = () => { const d = prompt("Data e hora (AAAA-MM-DD HH:MM)"); if (!d) return; const place = prompt("Local", "Biblioteca da escola") || ""; const dt = new Date(d.replace(" ", "T")); if (isNaN(dt)) return toast("Data inválida", "err"); DB.update("rodas", b.dataset.meet, r => ({ meetings: [...r.meetings, { date: dt.toISOString(), place }].sort((x, y) => x.date.localeCompare(y.date)) })); rerender(); });
  }
  else if (tab === "podcast") {
    A.innerHTML = `<div class="card" style="max-width:640px"><h3>Publicar episódio a partir de uma roda</h3><form id="pf"><div class="field"><label for="pr">Roda</label><select id="pr">${DB.all("rodas").map(r => `<option value="${r.id}">${esc(r.title)}</option>`).join("")}</select></div><div class="field"><label for="pt">Título</label><input id="pt" type="text" required></div><div class="field"><label for="pd">Descrição</label><textarea id="pd" style="min-height:80px"></textarea></div><div class="field"><label for="pa">Arquivo de áudio (MP3/M4A/OGG)</label><input id="pa" type="file" accept="audio/*"><small class="muted">Na v0.1 o áudio fica salvo neste navegador. Confirme as autorizações de voz dos participantes.</small></div><button class="btn btn--verde btn--block">Publicar</button></form></div>`;
    $("#pf").onsubmit = async e => { e.preventDefault(); const f = $("#pa").files[0]; let key = null, dur = "—"; if (f) { key = uid("au"); await Media.put(key, f); dur = Math.round(f.size / 16000 / 60) + " min (aprox.)"; } DB.add("podcasts", { rodaId: $("#pr").value, title: $("#pt").value, description: $("#pd").value, date: nowISO(), duration: dur, mediaKey: key }); toast("Episódio publicado", "ok"); location.hash = "#/podcast"; };
  }
  else if (tab === "biblioteca") {
    A.innerHTML = `<div class="card" style="max-width:640px"><h3>Adicionar obra de domínio público</h3><p class="muted" style="font-size:.88rem">Confirme que a obra está em domínio público no Brasil (em regra, 70 anos após a morte do autor). Para PDFs permanentes, coloque o arquivo na pasta <code>biblioteca/</code> do repositório e informe o caminho.</p><form id="lf"><div class="grid g2"><div class="field"><label for="lt">Título</label><input id="lt" type="text" required></div><div class="field"><label for="la">Autor</label><input id="la" type="text" required></div><div class="field"><label for="ly">Ano</label><input id="ly" type="number"></div><div class="field"><label for="lg">Gênero</label><input id="lg" type="text"></div></div>
    <div class="field"><label for="lp">Caminho do PDF no repositório (ex.: biblioteca/dom-casmurro.pdf)</label><input id="lp" type="text"></div><div class="field"><label for="lfile">ou enviar PDF (fica neste navegador)</label><input id="lfile" type="file" accept="application/pdf"></div><div class="field"><label for="ls">Link da fonte</label><input id="ls" type="url"></div><button class="btn btn--verde btn--block">Adicionar</button></form></div>`;
    $("#lf").onsubmit = async e => { e.preventDefault(); const f = $("#lfile").files[0]; let pdfKey = null; if (f) { pdfKey = uid("pdf"); await Media.put(pdfKey, f); } DB.add("library", { title: $("#lt").value, author: $("#la").value, year: +$("#ly").value || "", genre: $("#lg").value, pdf: $("#lp").value.trim(), pdfKey, source: $("#ls").value }); toast("Obra adicionada", "ok"); location.hash = "#/biblioteca"; };
  }
  else if (tab === "obras") {
    A.innerHTML = `<p class="muted">Marque as obras que aparecem em “Obras em destaque” na página inicial.</p><ul class="list">${DB.all("books").map(b => `<li><div style="width:36px">${cover(b)}</div><span style="flex:1">${esc(b.title)}<br><small>${esc(b.author)} · cadastrada por ${esc(user(b.addedBy)?.name || "—")}</small></span><label class="check"><input type="checkbox" data-feat="${b.id}" ${b.featured ? "checked" : ""}> destaque</label></li>`).join("")}</ul>`;
    $$("[data-feat]").forEach(c => c.onchange = () => DB.update("books", c.dataset.feat, { featured: c.checked }));
  }
  else if (tab === "atendimento") {
    A.innerHTML = DB.all("tickets").map(t => `<div class="card" style="margin-bottom:12px"><div class="row between"><strong>${esc(t.subject)}</strong><span class="pill ${t.category === "Denúncia" ? "pill--terra" : ""}">${esc(t.category)}</span></div><small>${esc(user(t.userId)?.name)} · ${fmtDate(t.date)}</small><p>${esc(t.text)}</p>${t.reply ? `<div class="notice notice--ok">${esc(t.reply)}</div>` : `<form data-rep="${t.id}" class="row" style="flex-wrap:nowrap"><input type="text" required placeholder="Resposta"><button class="btn btn--sm">Responder</button></form>`}</div>`).join("") || emptyState("Nenhuma solicitação.");
    $$("[data-rep]").forEach(f => f.onsubmit = e => { e.preventDefault(); DB.update("tickets", f.dataset.rep, { reply: $("input", f).value, status: "respondido" }); rerender(); });
  }
  else if (tab === "dados") {
    A.innerHTML = `<div class="card" style="max-width:640px"><h3>Dados da demonstração</h3><p class="muted">Na v0.1 tudo fica no navegador. Use para restaurar os dados de exemplo.</p><button class="btn btn--terra" id="reset">Restaurar dados de exemplo</button></div>`;
    $("#reset").onclick = () => { if (confirm("Apagar todos os dados locais e restaurar o exemplo?")) { DB.reset(); toast("Dados restaurados", "ok"); location.hash = "#/"; } };
  }
}

function publishModal(r) {
  const a = r.answers, Q = INTERVIEW_QUESTIONS;
  const qa = [...Q.sobre.map((q, k) => ({ q, a: a["s" + k] })), ...Q.obra.map((q, k) => ({ q, a: a["q" + k] }))].filter(x => x.a);
  modal(`<span class="iv-tag">ENTREVISTA</span><h2 id="modalTitle" style="margin-top:12px">Montar entrevista de ${esc(a.nome)}</h2>
  <form id="mf"><div class="field"><label for="mh">Título / frase de destaque</label><input id="mh" type="text" required value="“${esc((a.q32 || a.q15 || "").slice(0, 90))}”"></div>
  <div class="field"><label for="mi">Introdução</label><textarea id="mi" required style="min-height:100px">${esc(`${a.nome.split(" ")[0]}, da turma ${a.turma}, leu ${a.livro}, de ${a.autor}, e conversou com o Clube do Livro sobre a experiência.`)}</textarea></div>
  <p><strong>Perguntas incluídas</strong> <small class="muted">(desmarque as que não entram; edite o texto depois de publicar, se necessário)</small></p>
  <div style="max-height:260px;overflow:auto;border:1px solid var(--line);border-radius:8px;padding:8px 12px">${qa.map((x, k) => `<label class="check" style="margin:6px 0"><input type="checkbox" data-qa="${k}" checked> <span><strong>${esc(x.q)}</strong><br><small>${esc(x.a.slice(0, 140))}</small></span></label>`).join("")}</div>
  ${r.photo && r.guardian.opts.imagem ? `<label class="check" style="margin:12px 0"><input type="checkbox" id="mph" checked> Usar a foto enviada (autorizada)</label>` : `<p class="muted" style="font-size:.85rem;margin-top:12px">${r.photo ? "Foto enviada, mas o uso de imagem NÃO foi autorizado." : "Sem foto."}</p>`}
  <label class="check" style="margin-bottom:12px"><input type="checkbox" id="mw" checked> Definir como entrevista da semana</label>
  <button class="btn btn--verde btn--block">Publicar entrevista</button></form>`, (root, close) => {
    $("#mf", root).onsubmit = e => {
      e.preventDefault();
      const sel = $$("[data-qa]", root).filter(c => c.checked).map(c => qa[+c.dataset.qa]);
      const b = DB.all("books").find(x => x.title.toLowerCase() === a.livro.toLowerCase());
      const iv = DB.add("interviews", { userId: r.userId, studentName: a.nome.split(" ")[0], turma: a.turma, bookId: b?.id || null, bookTitle: a.livro, bookAuthor: a.autor, photo: $("#mph", root)?.checked ? r.photo : null, headline: $("#mh", root).value, intro: $("#mi", root).value, qa: sel, score: a.nota, publishedAt: nowISO(), requestId: r.id });
      DB.update("requests", r.id, { status: "publicada" });
      if ($("#mw", root).checked) DB.setSetting("weekInterview", iv.id);
      close(); toast("Entrevista publicada!", "ok"); location.hash = "#/entrevista/" + iv.id;
    };
  });
}
