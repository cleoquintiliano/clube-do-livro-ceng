/*
 * Configuração da plataforma (editável sem mexer no restante do código).
 *
 * GOOGLE_CLIENT_ID: crie um "ID do cliente OAuth" do tipo "Aplicativo da Web" no
 * Google Cloud Console e adicione a URL do GitHub Pages em "Origens JavaScript
 * autorizadas". Enquanto estiver vazio, a plataforma roda em MODO DEMONSTRAÇÃO
 * (login simulado com perfis fictícios, dados salvos apenas neste navegador).
 */
window.CLUBE_CONFIG = {
  APP_NAME: "Clube do Livro",          // nome provisório: troque quando o nome oficial for escolhido
  SCHOOL: "Colégio Estadual Newton Guimarães",
  CITY: "Londrina/PR",
  VERSION: "0.1.0",
  GOOGLE_CLIENT_ID: "",
  ALLOWED_DOMAINS: ["escola.pr.gov.br"], // contas @escola da SEED-PR
  ADMIN_EMAILS: [],                      // e-mails de professores/administradores
  RANKING_NAME: "Pódio das Penas",       // nome provisório do ranking
  MEDIA_LIMITS: { audioSeconds: 90, videoSeconds: 60, maxFileMB: 15 }
};
