// =====================================================================
// App: autenticação, layout e rotas (SPA com hash, compatível com GitHub Pages)
// =====================================================================
import { DB, Session } from "./db.js";
import { $, $$, esc, avatar, levelBadge, toast, bindNoPaste, imageToDataURL } from "./ui.js";
import { TURMAS } from "./seed.js";
import * as V from "./views.js";
import * as W from "./views2.js";

const C = window.CLUBE_CONFIG;
DB.init();
window.addEventListener("db:full", () => toast("O armazenamento deste navegador está cheio. Remova mídias antigas.", "err"));

const routes = [
  [/^\/$/, V.home, "home"],
  [/^\/explorar(?:\/(\w+))?$/, V.explorar, "explorar"],
  [/^\/busca\/(.+)$/, V.busca, "explorar"],
  [/^\/livro\/([\w-]+)$/, V.livro, "explorar"],
  [/^\/novo-livro$/, V.novoLivro, "explorar"],
  [/^\/autor\/(.+)$/, V.autor, "explorar"],
  [/^\/leitor\/([\w-]+)(?:\/(\w+))?$/, V.perfil, "perfil"],
  [/^\/eu(?:\/(\w+))?$/, (tab) => V.perfil(Session.get().userId, tab), "perfil"],
  [/^\/novo-registro$/, V.novoRegistro, "novo-registro"],
  [/^\/rodas$/, W.rodas, "rodas"],
  [/^\/roda\/([\w-]+)$/, W.roda, "rodas"],
  [/^\/entrevistas$/, W.entrevistas, "entrevistas"],
  [/^\/entrevista\/([\w-]+)$/, W.entrevista, "entrevistas"],
  [/^\/quero-ser-entrevistado$/, W.queroSerEntrevistado, "entrevistas"],
  [/^\/autorizacao\/([\w-]+)$/, W.autorizacao, "entrevistas"],
  [/^\/trocas$/, W.trocas, "trocas"],
  [/^\/biblioteca$/, W.biblioteca, "biblioteca"],
  [/^\/ler\/([\w-]+)$/, W.ler, "biblioteca"],
  [/^\/podcast$/, W.podcast, "podcast"],
  [/^\/tutoriais$/, W.tutoriais, "tutoriais"],
  [/^\/atendimento$/, W.atendimento, "atendimento"],
  [/^\/privacidade$/, W.privacidade, "privacidade"],
  [/^\/admin(?:\/(\w+))?$/, W.admin, "admin"]
];

// ---------------- Autenticação ----------------
function domainOk(email) { return C.ALLOWED_DOMAINS.some(d => email.toLowerCase().endsWith("@" + d)); }

function loginWithEmail(email, name, picture) {
  email = email.trim().toLowerCase();
  if (!domainOk(email)) { toast("Use sua conta @" + C.ALLOWED_DOMAINS[0], "err"); return; }
  let u = DB.all("users").find(x => x.email === email);
  if (!u) {
    u = DB.add("users", { name: name || email.split("@")[0].replace(/[._]/g, " ").replace(/\b\w/g, c => c.toUpperCase()), email, turma: "", role: C.ADMIN_EMAILS.includes(email) ? "admin" : "leitor", bio: "", goal: 6, avatarColor: ["#2E6F40", "#1B365D", "#C84B31", "#D97706", "#2A9D8F"][Math.floor(Math.random() * 5)], photo: null, consent: false, googlePicture: picture || null });
  }
  Session.set({ userId: u.id, at: Date.now() });
  start();
}

function renderLogin() {
  document.body.classList.add("is-login");
  ["#topbar", "#footer", "#tabbar"].forEach(s => $(s).hidden = true);
  const demo = !C.GOOGLE_CLIENT_ID;
  const demoUsers = DB.all("users").filter(u => u.email.includes(".demo@"));
  $("#app").innerHTML = `
  <section class="login">
    <div class="login__art">
      <div class="row"><img src="assets/logo.svg" width="48" height="48" alt=""><div><strong>${esc(C.APP_NAME)}</strong><br><small style="color:#c7d2e0">${esc(C.SCHOOL)}</small></div></div>
      <div>
        <h1>Toda leitura fica maior quando é conversada.</h1>
        <p>Organize sua estante, escreva cartas do leitor, registre percepções no diário de leitura e participe das rodas de leitura com colegas do 6º ano à 3ª série.</p>
      </div>
      <small style="color:#c7d2e0;position:relative;z-index:1">Projeto inspirado pelo professor Saulo · ${esc(C.CITY)}</small>
    </div>
    <div class="login__panel">
      <div class="login__box">
        <h2>Entrar no clube</h2>
        <p class="muted">Use sua conta Google institucional <strong>@${esc(C.ALLOWED_DOMAINS[0])}</strong>.</p>
        <div id="gbtn"></div>
        ${demo ? `
          <div class="notice notice--info" style="margin:18px 0">
            <strong>Modo demonstração.</strong> O login Google ainda não foi configurado (veja o README). Escolha um perfil fictício ou simule seu e-mail @escola. Os dados ficam apenas neste navegador.
          </div>
          <form id="demoForm" class="field">
            <label for="demoEmail">E-mail @escola (simulado)</label>
            <div class="row" style="flex-wrap:nowrap"><input id="demoEmail" type="email" required placeholder="nome.sobrenome@${esc(C.ALLOWED_DOMAINS[0])}"><button class="btn">Entrar</button></div>
          </form>
          <p class="muted" style="margin:6px 0 0;font-size:.85rem">ou entre como um perfil de exemplo:</p>
          <div class="demo-users">${demoUsers.map(u => `<button data-u="${u.id}">${avatar(u)}<span><strong>${esc(u.name)}</strong><br><small>${esc(u.turma)}${u.role === "admin" ? " · administrador" : ""}</small></span></button>`).join("")}</div>
        ` : ""}
        <p class="muted" style="font-size:.8rem;margin-top:22px">Ao entrar você concorda com a <a href="#/privacidade">política de privacidade e proteção de crianças e adolescentes</a>. A participação depende de autorização dos responsáveis.</p>
      </div>
    </div>
  </section>`;
  if (demo) {
    $("#demoForm").onsubmit = e => { e.preventDefault(); loginWithEmail($("#demoEmail").value); };
    $$(".demo-users button").forEach(b => b.onclick = () => { Session.set({ userId: b.dataset.u, at: Date.now() }); start(); });
    $("#gbtn").innerHTML = `<button class="gbtn" disabled title="Configure GOOGLE_CLIENT_ID em js/config.js">${GLOGO} Entrar com Google (a configurar)</button>`;
  } else {
    const s = document.createElement("script");
    s.src = "https://accounts.google.com/gsi/client"; s.async = true;
    s.onload = () => {
      google.accounts.id.initialize({ client_id: C.GOOGLE_CLIENT_ID, hd: C.ALLOWED_DOMAINS[0], ux_mode: "popup", callback: r => {
        const p = JSON.parse(decodeURIComponent(escape(atob(r.credential.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")))));
        if (!p.email_verified) return toast("E-mail não verificado", "err");
        loginWithEmail(p.email, p.name, p.picture);
      } });
      google.accounts.id.renderButton($("#gbtn"), { theme: "outline", size: "large", shape: "pill", width: 360, text: "signin_with", locale: "pt-BR" });
    };
    document.head.appendChild(s);
  }
}
const GLOGO = `<svg width="18" height="18" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z"/><path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z"/></svg>`;

// ---------------- Primeiro acesso ----------------
function renderOnboarding(u) {
  ["#topbar", "#footer", "#tabbar"].forEach(s => $(s).hidden = true);
  $("#app").innerHTML = `
  <div style="max-width:560px;margin:20px auto">
    <div class="row" style="margin-bottom:16px"><img src="assets/logo.svg" width="40" height="40" alt=""><span class="eyebrow" style="margin:0">Primeiro acesso</span></div>
    <h1>Boas-vindas, ${esc(u.name.split(" ")[0])}!</h1>
    <p class="muted">Antes de começar, complete seu perfil de leitor.</p>
    <form id="ob" class="card">
      <div class="field"><label for="obName">Como quer ser chamado(a)?</label><input id="obName" type="text" required maxlength="40" value="${esc(u.name)}"><small class="muted">Recomendamos primeiro nome + inicial do sobrenome.</small></div>
      <div class="field"><label for="obTurma">Turma</label><select id="obTurma" required><option value="">Selecione</option>${TURMAS.map(t => `<option ${u.turma === t ? "selected" : ""}>${t}</option>`).join("")}</select></div>
      <div class="field"><label for="obGoal">Meta de leitura para ${new Date().getFullYear()}</label><input id="obGoal" type="number" min="1" max="200" value="${u.goal || 6}"><small class="muted">Quantos livros você quer ler no ano?</small></div>
      <div class="field"><label for="obPhoto">Foto do perfil (opcional)</label><input id="obPhoto" type="file" accept="image/*"><small class="muted">Pode ser um desenho ou avatar. Evite fotos com uniforme, endereço ou outras pessoas.</small></div>
      <div class="field"><label class="check"><input type="checkbox" id="obConsent" required> <span>Confirmo que meus responsáveis assinaram a autorização de participação no Clube do Livro e que li a <a href="#/privacidade" target="_blank">política de privacidade</a>.</span></label></div>
      <button class="btn btn--block">Entrar na plataforma</button>
    </form>
  </div>`;
  $("#ob").onsubmit = async e => {
    e.preventDefault();
    const f = $("#obPhoto").files[0];
    let photo = u.photo;
    if (f) try { photo = await imageToDataURL(f, 300); } catch { toast("Não foi possível ler a imagem", "err"); }
    DB.update("users", u.id, { name: $("#obName").value.trim(), turma: $("#obTurma").value, goal: +$("#obGoal").value, photo, consent: true, consentAt: new Date().toISOString() });
    toast("Perfil criado! Boas leituras 📚", "ok");
    start();
  };
}

// ---------------- Shell ----------------
function renderShell(u) {
  document.body.classList.remove("is-login");
  ["#topbar", "#footer", "#tabbar"].forEach(s => $(s).hidden = false);
  $$("[data-appname]").forEach(e => e.textContent = C.APP_NAME);
  $$("[data-version]").forEach(e => e.textContent = C.VERSION);
  $("#userBtn").innerHTML = `${avatar(u)}<span class="lvl">${levelBadge(u.id)}</span>`;
  $("#userMenu").innerHTML = `
    <div style="padding:10px 12px"><strong>${esc(u.name)}</strong><br><small>${esc(u.turma)} · ${esc(u.email)}</small></div>
    <hr style="margin:4px 0">
    <a href="#/eu">Meu perfil</a><a href="#/eu/diario">Diário de leitura</a><a href="#/eu/estante">Minha estante</a>
    <a href="#/novo-livro">Cadastrar obra</a>
    <div class="mobonly"><hr style="margin:4px 0"><a href="#/entrevistas">Entrevistas</a><a href="#/trocas">📌 Trocas e empréstimos</a><a href="#/biblioteca">Biblioteca livre</a><a href="#/podcast">Podcast</a><a href="#/tutoriais">Tutoriais</a><a href="#/quero-ser-entrevistado">Quero ser entrevistado!</a><a href="#/atendimento">Atendimento ao leitor</a></div>
    ${u.role === "admin" ? `<a href="#/admin">⚙ Administração</a>` : ""}
    <hr style="margin:4px 0">
    <button id="logout">Sair</button>`;
  $("#logout").onclick = () => { Session.clear(); location.hash = "#/"; start(); };
}

function closeMenus() { $$(".more,.usermenu").forEach(m => m.classList.remove("open")); }
document.addEventListener("click", e => {
  const mb = e.target.closest(".more__btn, .usermenu__btn");
  if (mb) { const p = mb.parentElement; const o = !p.classList.contains("open"); closeMenus(); p.classList.toggle("open", o); mb.setAttribute("aria-expanded", o); return; }
  if (!e.target.closest(".more__menu, .usermenu__menu")) closeMenus();
});
$("#globalSearch").onsubmit = e => { e.preventDefault(); const q = $("#q").value.trim(); if (q) location.hash = "#/busca/" + encodeURIComponent(q); };

// ---------------- Router ----------------
function router() {
  const u = Session.user();
  if (!u) return renderLogin();
  if (!u.consent || !u.turma) return renderOnboarding(u);
  renderShell(u);
  closeMenus();
  const path = (location.hash.replace(/^#/, "") || "/").split("?")[0];
  const app = $("#app");
  for (const [re, view, nav] of routes) {
    const m = path.match(re);
    if (m) {
      $$("[data-nav]").forEach(a => a.classList.toggle("active", a.dataset.nav === nav));
      try { view(...m.slice(1).map(x => x && decodeURIComponent(x))); }
      catch (err) { console.error(err); app.innerHTML = `<div class="empty">Algo deu errado ao abrir esta página.<br><small>${esc(err.message)}</small></div>`; }
      bindNoPaste(app);
      window.scrollTo(0, 0);
      app.focus({ preventScroll: true });
      return;
    }
  }
  app.innerHTML = `<div class="empty"><h2>Página não encontrada</h2><a class="btn" href="#/">Voltar ao início</a></div>`;
}
function start() { router(); }
window.addEventListener("hashchange", router);
window.__rerender = router;
start();
