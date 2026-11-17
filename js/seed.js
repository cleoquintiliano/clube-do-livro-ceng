// =====================================================================
// Dados de demonstração. TODOS os leitores são fictícios (LGPD/ECA):
// nenhum dado real de estudante deve ser colocado neste arquivo.
// =====================================================================
const D = (s) => new Date(s).toISOString();

const books = [
  ["b1", "Extraordinário", "R. J. Palacio", "Intrínseca", 2013, 320, "Romance juvenil", "Auggie nasceu com uma diferença facial e, depois de anos estudando em casa, encara pela primeira vez uma escola de verdade. Uma história sobre amizade, gentileza e coragem, contada por vários pontos de vista.", "A partir de 10 anos", "#1B365D", true],
  ["b2", "Quarto de Despejo", "Carolina Maria de Jesus", "Ática", 1960, 200, "Diário / Não ficção", "O diário de uma mulher negra, mãe e catadora de papel na favela do Canindé, em São Paulo. Um testemunho poderoso sobre fome, dignidade e o poder da escrita.", "A partir de 13 anos", "#C84B31", true],
  ["b3", "Dom Casmurro", "Machado de Assis", "Domínio público", 1899, 256, "Romance clássico", "Bentinho, já idoso, revisita sua história com Capitu e tenta provar a si mesmo uma suspeita que nunca o abandonou. Um dos maiores enigmas da literatura brasileira.", "A partir de 14 anos", "#2E6F40", true],
  ["b4", "O Pequeno Príncipe", "Antoine de Saint-Exupéry", "Agir", 1943, 96, "Fábula", "Um aviador perdido no deserto encontra um menino vindo de um asteroide. Juntos, conversam sobre amizade, responsabilidade e o que é realmente essencial.", "Livre", "#D97706", false],
  ["b5", "Capitães da Areia", "Jorge Amado", "Companhia das Letras", 1937, 280, "Romance", "Um grupo de meninos em situação de rua em Salvador sobrevive de pequenos furtos e de uma lealdade feroz entre si. Liberdade, desigualdade e afeto na Bahia dos anos 1930.", "A partir de 14 anos", "#4A5568", true],
  ["b6", "Vidas Secas", "Graciliano Ramos", "Record", 1938, 176, "Romance clássico", "Fabiano, Sinhá Vitória, os dois meninos e a cachorra Baleia fogem da seca pelo sertão nordestino. Uma narrativa seca e precisa como a paisagem que descreve.", "A partir de 13 anos", "#C84B31", false],
  ["b7", "O Diário de Anne Frank", "Anne Frank", "Record", 1947, 352, "Diário / Não ficção", "Escondida com a família em Amsterdã durante a Segunda Guerra Mundial, uma adolescente registra medos, sonhos, brigas e esperanças em seu diário.", "A partir de 12 anos", "#1B365D", false],
  ["b8", "A Revolução dos Bichos", "George Orwell", "Companhia das Letras", 1945, 152, "Fábula política", "Os animais de uma granja expulsam o fazendeiro e prometem uma sociedade de iguais. Aos poucos, porém, alguns se tornam mais iguais que outros.", "A partir de 13 anos", "#2E6F40", true],
  ["b9", "Torto Arado", "Itamar Vieira Junior", "Todavia", 2019, 264, "Romance contemporâneo", "Duas irmãs do sertão baiano têm a vida marcada por um acidente na infância. Uma história sobre terra, ancestralidade, trabalho e resistência.", "A partir de 15 anos", "#D97706", false],
  ["b10", "Coraline", "Neil Gaiman", "Intrínseca", 2002, 160, "Fantasia / Terror", "Ao se mudar, Coraline descobre uma porta que leva a uma versão aparentemente perfeita de sua casa. Mas a Outra Mãe tem planos assustadores para ela.", "A partir de 10 anos", "#4A5568", false],
  ["b11", "Percy Jackson e o Ladrão de Raios", "Rick Riordan", "Intrínseca", 2005, 400, "Fantasia", "Percy descobre que é filho de um deus grego e é acusado de roubar o raio de Zeus. Agora precisa atravessar os Estados Unidos para evitar uma guerra entre os deuses.", "A partir de 10 anos", "#1B365D", false],
  ["b12", "O Alienista", "Machado de Assis", "Domínio público", 1882, 96, "Novela clássica", "O médico Simão Bacamarte funda um hospício na pequena Itaguaí e começa a internar quase toda a cidade. Afinal, onde termina a razão e começa a loucura?", "A partir de 13 anos", "#2E6F40", false]
].map(([id, title, author, publisher, year, pages, genre, synopsis, age, color, featured]) =>
  ({ id, title, author, publisher, year, pages, genre, synopsis, age, color, featured, addedBy: "adm", likes: [], createdAt: D("2026-03-01") }));

books[0].likes = ["u2", "u3", "u4", "u5"];
books[1].likes = ["u1", "u3", "u5", "u6"];
books[2].likes = ["u5", "u6"];
books[7].likes = ["u2", "u6", "u3"];

const users = [
  { id: "u1", name: "Ana Luiza", email: "ana.luiza.demo@escola.pr.gov.br", turma: "8º ano A", role: "leitor", bio: "Leio de tudo, mas tenho um fraco por diários e histórias reais.", goal: 12, avatarColor: "#2E6F40", consent: true, createdAt: D("2026-03-02") },
  { id: "u2", name: "Pedro Henrique", email: "pedro.h.demo@escola.pr.gov.br", turma: "9º ano B", role: "leitor", bio: "Fantasia e mitologia. Se tem dragão, eu leio.", goal: 10, avatarColor: "#1B365D", consent: true, createdAt: D("2026-03-03") },
  { id: "u3", name: "Maria Eduarda", email: "maria.e.demo@escola.pr.gov.br", turma: "1ª série EM", role: "leitor", bio: "Clássicos brasileiros e poesia.", goal: 15, avatarColor: "#C84B31", consent: true, createdAt: D("2026-03-03") },
  { id: "u4", name: "Lucas Gabriel", email: "lucas.g.demo@escola.pr.gov.br", turma: "6º ano A", role: "leitor", bio: "Comecei agora no clube!", goal: 6, avatarColor: "#D97706", consent: true, createdAt: D("2026-04-10") },
  { id: "u5", name: "Júlia Santos", email: "julia.s.demo@escola.pr.gov.br", turma: "3ª série EM", role: "leitor", bio: "Literatura contemporânea e muito café.", goal: 20, avatarColor: "#2A9D8F", consent: true, createdAt: D("2026-03-05") },
  { id: "u6", name: "Gabriel Rocha", email: "gabriel.r.demo@escola.pr.gov.br", turma: "2ª série EM", role: "leitor", bio: "Distopias e livros que fazem pensar.", goal: 8, avatarColor: "#4A5568", consent: true, createdAt: D("2026-03-08") },
  { id: "adm", name: "Coordenação do Clube", email: "coordenacao.demo@escola.pr.gov.br", turma: "Professores", role: "admin", bio: "Equipe de professores que coordena o Clube do Livro.", goal: 12, avatarColor: "#1B365D", consent: true, createdAt: D("2026-03-01") }
];

let sh = 0;
const S = (userId, bookId, status, rating, finishedAt, extra = {}) =>
  ({ id: "sh" + (++sh), userId, bookId, status, rating, finishedAt: finishedAt ? D(finishedAt) : null, startedAt: D("2026-03-10"), progress: 0, rereads: [], ...extra });

const shelves = [
  S("u1", "b1", "lido", 5, "2026-04-02"), S("u1", "b2", "lido", 5, "2026-06-18"), S("u1", "b7", "lido", 4, "2026-08-25"),
  S("u1", "b4", "relendo", 5, "2026-03-20", { rereads: [{ date: D("2026-10-30"), text: "Na primeira vez achei que era um livro infantil. Agora percebi que a raposa fala sobre responsabilidade com quem a gente gosta." }] }),
  S("u1", "b9", "lendo", null, null, { progress: 118 }), S("u1", "b3", "quero"), S("u1", "b6", "espera", null, null, { progress: 40 }),
  S("u2", "b11", "lido", 5, "2026-04-20"), S("u2", "b10", "lido", 4, "2026-07-02"), S("u2", "b8", "lido", 4, "2026-09-15"), S("u2", "b1", "lendo", null, null, { progress: 210 }),
  S("u3", "b3", "lido", 5, "2026-05-10"), S("u3", "b12", "lido", 4, "2026-06-01"), S("u3", "b2", "lido", 5, "2026-08-12"), S("u3", "b6", "lido", 4, "2026-09-30"), S("u3", "b5", "lendo", null, null, { progress: 90 }),
  S("u4", "b4", "lido", 5, "2026-05-15"), S("u4", "b11", "lendo", null, null, { progress: 150 }), S("u4", "b10", "quero"),
  S("u5", "b9", "lido", 5, "2026-04-11"), S("u5", "b2", "lido", 5, "2026-05-02"), S("u5", "b3", "lido", 4, "2026-06-20"), S("u5", "b5", "lido", 5, "2026-08-01"), S("u5", "b1", "lido", 4, "2026-09-12"), S("u5", "b8", "lido", 5, "2026-10-20"), S("u5", "b7", "lendo", null, null, { progress: 60 }),
  S("u6", "b8", "lido", 5, "2026-05-22"), S("u6", "b3", "lido", 3, "2026-08-08"), S("u6", "b12", "lendo", null, null, { progress: 30 })
];

const sessions = [];
const months = ["2026-06", "2026-07", "2026-08", "2026-09", "2026-10", "2026-11"];
["u1", "u2", "u3", "u4", "u5", "u6"].forEach((u, ui) => months.forEach((m, mi) => {
  const n = 2 + ((ui + mi) % 4);
  for (let k = 0; k < n; k++) sessions.push({ id: `se_${u}_${mi}_${k}`, userId: u, bookId: null, date: D(`${m}-${String(3 + k * 6).padStart(2, "0")}T19:00:00`), minutes: 20 + ((ui * 7 + mi * 11 + k * 13) % 50), pages: 10 + ((ui + k) % 25) });
}));

const letters = [
  { id: "l1", userId: "u1", bookId: "b2", title: "A fome tem cor e tem endereço", date: D("2026-06-20"), likes: ["u3", "u5"], text: "Quarto de Despejo me deixou desconfortável, e acho que esse é o objetivo. Carolina escreve com uma sinceridade que dói: ela conta quanto custa o feijão, o que os vizinhos falam e como se sente quando não tem o que dar aos filhos.\n\nO que mais me marcou foi perceber que ela escrevia para não enlouquecer. A escrita era a casa dela dentro da favela. Recomendo para quem acha que leitura de diário é chata: não é." },
  { id: "l2", userId: "u6", bookId: "b8", title: "Todos os animais são iguais?", date: D("2026-05-25"), likes: ["u2", "u5"], text: "Achei que seria só uma história de bichos falantes, mas é um livro sobre como o poder muda as pessoas. Os porcos vão alterando as regras aos pouquinhos e ninguém percebe. Dá para comparar com muita coisa que a gente vê hoje, inclusive em grupo de amigos." },
  { id: "l3", userId: "u3", bookId: "b3", title: "Capitu traiu? Talvez a pergunta seja outra", date: D("2026-05-12"), likes: ["u5", "u6", "u1"], text: "Todo mundo quer saber se Capitu traiu Bentinho. Depois de ler, fiquei pensando que o livro é narrado só por ele, um homem ciumento contando a própria versão. Será que devemos confiar em um narrador assim? Machado deixa a dúvida de propósito e é isso que faz o livro ser tão bom." }
];

const diary = [
  { id: "d1", userId: "u1", bookId: "b9", page: 34, date: D("2026-11-03"), text: "O começo foi difícil por causa do acidente com a faca. Tive que reler duas vezes para entender quem estava narrando." },
  { id: "d2", userId: "u1", bookId: "b9", page: 77, date: D("2026-11-09"), text: "Estou gostando muito da relação das irmãs. Uma vira a voz da outra. Fiquei pensando em como a gente às vezes fala pelos outros." },
  { id: "d3", userId: "u1", bookId: "b9", page: 118, date: D("2026-11-15"), text: "A parte sobre o trabalho na terra sem receber nada me lembrou do que estudamos em História sobre o pós-abolição." },
  { id: "d4", userId: "u2", bookId: "b1", page: 120, date: D("2026-11-10"), text: "Gostei quando o livro muda para o ponto de vista da Via. Não tinha pensado em como a irmã se sentia." }
];

const comments = [
  { id: "c1", target: "book:b1", userId: "u4", text: "Chorei no final! Alguém mais?", date: D("2026-10-02") },
  { id: "c2", target: "book:b1", userId: "u5", text: "O capítulo do Jack é o meu favorito.", date: D("2026-10-03") },
  { id: "c3", target: "letter:l3", userId: "u6", text: "Concordo! Narrador não confiável total.", date: D("2026-05-14") },
  { id: "c4", target: "roda:r1", userId: "u5", text: "Para o próximo encontro: vamos discutir a parte da escola da cidade? Achei que mostra muito sobre quem tem direito de aprender.", date: D("2026-11-05") },
  { id: "c5", target: "roda:r1", userId: "u1", text: "Boa! Eu queria falar também sobre o papel da Bibiana.", date: D("2026-11-06") },
  { id: "c6", target: "roda:r2", userId: "u2", text: "Alguém já terminou? Estou no capítulo 7.", date: D("2026-11-12") }
];

const rodas = [
  { id: "r1", bookId: "b9", title: "Roda Torto Arado", description: "Leitura coletiva de Torto Arado com foco em terra, memória e ancestralidade.", mediatorId: "adm", members: ["u1", "u5", "u3"], meetings: [{ date: D("2026-11-21T14:00:00"), place: "Biblioteca da escola" }, { date: D("2026-12-05T14:00:00"), place: "Biblioteca da escola" }], status: "ativa", createdAt: D("2026-10-20") },
  { id: "r2", bookId: "b1", title: "Roda Extraordinário (6º e 7º anos)", description: "Para quem está começando no clube: gentileza, diferença e amizade.", mediatorId: "adm", members: ["u2", "u4"], meetings: [{ date: D("2026-11-24T10:00:00"), place: "Sala de leitura" }], status: "ativa", createdAt: D("2026-10-28") },
  { id: "r3", bookId: "b8", title: "Roda A Revolução dos Bichos", description: "Discussão sobre poder, propaganda e fábulas políticas.", mediatorId: "adm", members: ["u6", "u2", "u5"], meetings: [{ date: D("2026-09-20T14:00:00"), place: "Biblioteca da escola" }], status: "encerrada", createdAt: D("2026-08-25") }
];

const podcasts = [
  { id: "p1", rodaId: "r3", title: "Ep. 01 · Quem manda na granja?", description: "Gravado na Roda A Revolução dos Bichos: o que a história dos porcos tem a ver com o nosso dia a dia.", date: D("2026-09-27"), duration: "18 min", mediaKey: null },
  { id: "p2", rodaId: "r1", title: "Ep. 02 · Torto Arado e a voz das irmãs (em produção)", description: "Episódio que será gravado após o encontro de 21/11.", date: D("2026-11-28"), duration: "em produção", mediaKey: null }
];

const trades = [
  { id: "t1", userId: "u3", type: "emprestimo", bookTitle: "Vidas Secas", author: "Graciliano Ramos", condition: "Bom estado, algumas marcações a lápis", note: "Empresto por 3 semanas. Combinar na biblioteca no intervalo.", status: "aberto", date: D("2026-11-08") },
  { id: "t2", userId: "u2", type: "troca", bookTitle: "Percy Jackson: O Mar de Monstros", author: "Rick Riordan", condition: "Como novo", note: "Troco por qualquer livro de fantasia.", status: "aberto", date: D("2026-11-12") },
  { id: "t3", userId: "u4", type: "procuro", bookTitle: "Coraline", author: "Neil Gaiman", condition: "", note: "Alguém tem para emprestar?", status: "aberto", date: D("2026-11-14") }
];

const QA_SAMPLE = [
  ["Que tipo de livro você mais gosta de ler?", "Gosto muito de histórias reais e de diários. Sinto que estou conversando com a pessoa que escreveu."],
  ["Por que você escolheu esse livro?", "Uma professora comentou sobre ele em sala e eu fiquei curiosa porque foi escrito por uma catadora de papel. Pensei: como alguém com tão pouco tempo e dinheiro conseguiu escrever um livro inteiro?"],
  ["O livro correspondeu ao que você esperava? Por quê?", "Foi muito além. Eu esperava uma história triste, e é triste, mas também tem humor, raiva e muita inteligência. A Carolina comenta política, critica os vizinhos e sonha com uma casa de alvenaria."],
  ["Houve algum momento em que você teve vontade de parar de ler? O que aconteceu?", "Sim. As partes sobre a fome dos filhos dela foram pesadas. Precisei dar uma pausa de dois dias. Mas voltei porque queria saber se ela ia conseguir sair do Canindé."],
  ["Em algum momento você se identificou com algum personagem ou situação? Explique.", "Me identifiquei com a vontade dela de escrever para organizar os pensamentos. Eu também tenho um caderno onde escrevo quando fico ansiosa."],
  ["O livro fez você pensar sobre algum assunto importante? Qual?", "Sobre desigualdade e sobre quem tem o direito de ser escritor. Antes eu achava que livro era coisa de gente famosa."],
  ["Se pudesse conversar com a autora, o que perguntaria a ela?", "Perguntaria se ela imaginava que, tantos anos depois, uma estudante de Londrina ia ler o diário dela e se emocionar."],
  ["Você recomendaria esse livro para outro aluno? Por quê?", "Recomendaria para todo mundo a partir do 8º ano. É curto, fácil de ler e muda o jeito como a gente olha para a cidade."],
  ["Depois de terminar o livro, você acha que ele deixou alguma coisa em você? O quê?", "Deixou vontade de escrever mais e de reclamar menos. E deixou respeito por quem trabalha com reciclagem."]
];

const interviews = [
  { id: "i1", userId: "u1", studentName: "Ana Luiza", turma: "8º ano A", bookId: "b2", bookTitle: "Quarto de Despejo", bookAuthor: "Carolina Maria de Jesus", photo: null, headline: "“A escrita era a casa dela dentro da favela”", intro: "Ana Luiza leu Quarto de Despejo depois de uma indicação em sala e saiu da leitura com vontade de escrever mais. Nesta entrevista (exemplo fictício para demonstração), ela conta como foi atravessar as páginas mais duras do diário de Carolina Maria de Jesus.", qa: QA_SAMPLE.map(([q, a]) => ({ q, a })), score: 10, publishedAt: D("2026-11-16"), week: true, example: true }
];

const recs = [
  { id: "rc1", fromId: "u5", toId: "u1", bookId: "b5", note: "Você vai gostar, tem muito a ver com Quarto de Despejo.", date: D("2026-11-11") }
];

const library = [
  { id: "lb1", title: "Dom Casmurro", author: "Machado de Assis", year: 1899, genre: "Romance", pdf: "", source: "https://pt.wikisource.org/w/index.php?search=Dom+Casmurro" },
  { id: "lb2", title: "O Alienista", author: "Machado de Assis", year: 1882, genre: "Novela", pdf: "", source: "https://pt.wikisource.org/w/index.php?search=O+Alienista" },
  { id: "lb3", title: "Memórias Póstumas de Brás Cubas", author: "Machado de Assis", year: 1881, genre: "Romance", pdf: "", source: "https://pt.wikisource.org/w/index.php?search=Mem%C3%B3rias+P%C3%B3stumas+de+Br%C3%A1s+Cubas" },
  { id: "lb4", title: "O Cortiço", author: "Aluísio Azevedo", year: 1890, genre: "Romance naturalista", pdf: "", source: "https://pt.wikisource.org/w/index.php?search=O+Corti%C3%A7o" },
  { id: "lb5", title: "Iracema", author: "José de Alencar", year: 1865, genre: "Romance indianista", pdf: "", source: "https://pt.wikisource.org/w/index.php?search=Iracema" },
  { id: "lb6", title: "Triste Fim de Policarpo Quaresma", author: "Lima Barreto", year: 1915, genre: "Romance", pdf: "", source: "https://pt.wikisource.org/w/index.php?search=Triste+Fim+de+Policarpo+Quaresma" },
  { id: "lb7", title: "A Moreninha", author: "Joaquim Manuel de Macedo", year: 1844, genre: "Romance", pdf: "", source: "https://pt.wikisource.org/w/index.php?search=A+Moreninha" },
  { id: "lb8", title: "Contos de Machado de Assis (seleção)", author: "Machado de Assis", year: 1884, genre: "Contos", pdf: "", source: "https://www.dominiopublico.gov.br/" }
];

export const SEED = {
  users, books, shelves, sessions, letters, diary, comments, rodas, podcasts, trades, interviews, recs, library,
  media: [], requests: [], tickets: [],
  settings: { weekInterview: "i1" }
};

// Perguntas do formulário atual de entrevista (Google Forms do Clube).
export const INTERVIEW_QUESTIONS = {
  sobre: [
    "Há quanto tempo você estuda nesta escola?",
    "Você costuma ler livros fora das atividades escolares?",
    "Que tipo de livro você mais gosta de ler?",
    "Qual foi o último livro que você leu antes deste sobre o qual conversaremos?"
  ],
  obra: [
    "Você já conhecia esse autor?",
    "Como você teve contato com esse livro?",
    "Por que você escolheu esse livro?",
    "O que você imaginava que encontraria na história antes de começar a leitura?",
    "O livro correspondeu ao que você esperava? Por quê?",
    "Em poucas palavras, sobre o que é o livro?",
    "Onde e quando a história se passa?",
    "Quem é o personagem que mais se destaca na história?",
    "Qual o personagem que mais chamou sua atenção? Por quê?",
    "Existe algum personagem de quem você não gostou? Por quê?",
    "Qual acontecimento da história mais chamou sua atenção?",
    "Houve alguma parte que você achou especialmente interessante, emocionante, engraçada, assustadora ou surpreendente?",
    "Houve alguma parte de que você não gostou? Por quê?",
    "Em algum momento você se identificou com algum personagem ou situação? Explique.",
    "O livro fez você pensar sobre algum assunto importante? Qual?",
    "Existe alguma mensagem ou ideia que você considera importante na obra?",
    "Você gostou de ler esse livro?",
    "A leitura foi fácil ou difícil? Por quê?",
    "Houve algum momento em que você teve vontade de parar de ler? O que aconteceu?",
    "O que fez você continuar a leitura?",
    "Você mudou de opinião sobre algum personagem ou acontecimento ao longo da história?",
    "Se pudesse conversar com o autor, o que perguntaria a ele?",
    "Se pudesse fazer uma pergunta para um dos personagens, qual seria?",
    "Se pudesse mudar alguma coisa na história, o que mudaria?",
    "Você gostaria de ler outro livro desse autor? Por quê?",
    "Qual foi sua parte favorita do livro?",
    "Qual foi o aspecto de que você menos gostou?",
    "Para você, qual é o maior ponto positivo da obra?",
    "Existe algum ponto negativo?",
    "Você recomendaria esse livro para outro aluno? Por quê?",
    "Para que tipo de leitor você recomendaria essa obra?",
    "Por que você escolheu essa nota?",
    "Depois de terminar o livro, você acha que ele deixou alguma coisa em você? O quê?",
    "O que mais você gostaria de comentar sobre a sua experiência de leitura?"
  ]
};

export const GENRES = ["Romance", "Romance clássico", "Romance juvenil", "Romance contemporâneo", "Conto", "Crônica", "Poesia", "Fantasia", "Ficção científica", "Terror / Suspense", "Mistério / Policial", "Aventura", "Distopia", "Fábula", "HQ / Mangá", "Biografia", "Diário / Não ficção", "Teatro", "Outro"];
export const TURMAS = ["6º ano A", "6º ano B", "7º ano A", "7º ano B", "8º ano A", "8º ano B", "9º ano A", "9º ano B", "1ª série EM", "2ª série EM", "3ª série EM", "Professores"];
