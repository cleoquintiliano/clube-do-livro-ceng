# Clube do Livro · Colégio Estadual Newton Guimarães (v0.1)

Plataforma web do Clube do Livro do Colégio Estadual Newton Guimarães (Londrina/PR), projeto inspirado pelo professor Saulo para incentivar a leitura e o pensamento crítico entre estudantes do 6º ano do Ensino Fundamental à 3ª série do Ensino Médio. O foco é a **interação entre leitores** sobre as obras.

> Nome oficial ainda em escolha. Para trocar, edite `APP_NAME` em `js/config.js`.

## O que tem na versão 0.1

| Área | Funcionalidades |
|---|---|
| Acesso | Login com conta Google `@escola.pr.gov.br` (Google Identity Services) ou modo demonstração; primeiro acesso com turma, meta e confirmação da autorização dos responsáveis |
| Início | Obras em destaque, entrevista da semana, continue lendo, recomendações recebidas, cartas recentes, Pódio das Penas, rodas ativas, trocas |
| Obras | Busca, cadastro pelos leitores (com alerta de duplicidade e capa gerada nas cores da escola), curtir, comentar, avaliação com penas (lápis → pena de ouro), quem está lendo, "leia também" |
| Estante | Lido, Lendo, Relendo (com novas percepções), Lista de desejos, Em espera |
| Escrita | Cartas do leitor (resenha crítica), Diário de leitura (vários registros por livro), comentários. **Colar texto é bloqueado** em todos os campos de escrita autoral |
| Mídia | Áudios (até 90 s) e vídeos (até 60 s) gravados no navegador ou enviados, nos livros lidos |
| Perfil | Foto, nível, livros e páginas lidas, tempo de leitura por semana/mês/ano, meta anual, conquistas, exportação dos dados (LGPD) |
| Gamificação | Níveis: Pena de galinha, Ferro, Bronze, Prata, Ouro, Platina, Diamante |
| Explorar | Livros, autores, leitores e ranking (Pódio das Penas) |
| Entrevistas | Repositório, entrevista da semana, "Quero ser entrevistado!" com as 45 perguntas do formulário atual, termo de autorização dos responsáveis com assinatura digital na tela (ou impressão/gov.br) |
| Comunidade | Rodas de leitura (conversa + encontros), Podcast gerado das rodas, 📌 Trocas e empréstimos (fixado no menu), Atendimento ao leitor |
| Conteúdo | Biblioteca de domínio público com leitor de PDF, Tutoriais (técnicas de leitura, fichamento, carta do leitor, conservação, rodas) |
| Coordenação | Painel admin: montar e publicar entrevistas, definir a da semana, criar rodas e encontros, publicar podcast, biblioteca, destaques, responder atendimento |

## Importante: limites da v0.1

Esta versão é **estática** (GitHub Pages, sem servidor). Todos os dados ficam **no navegador de quem usa** (localStorage e IndexedDB), e os leitores de exemplo são fictícios. Ela serve para validar telas e fluxos com a escola. Para uso real com estudantes, a próxima etapa é ligar um backend (sugestão: Firebase ou Supabase) com:

- validação do login no servidor (restrição ao domínio da escola);
- banco de dados compartilhado e regras de acesso por perfil;
- armazenamento de fotos, áudios, vídeos e PDFs;
- moderação e registro de consentimentos.

## Configurar o login Google

1. No [Google Cloud Console](https://console.cloud.google.com/apis/credentials), crie um **ID do cliente OAuth** do tipo *Aplicativo da Web*.
2. Em *Origens JavaScript autorizadas*, adicione `https://cleoquintiliano.github.io`.
3. Cole o ID em `GOOGLE_CLIENT_ID` no arquivo `js/config.js` e adicione os e-mails da coordenação em `ADMIN_EMAILS`.

## Estrutura

```
index.html        casca da aplicação
css/styles.css    design system (paleta, tipografia Inter + Lora, responsivo)
js/config.js      nome, domínio, admins, limites de mídia
js/app.js         login, layout e rotas
js/views.js       início, explorar, obra, perfil, registros
js/views2.js      rodas, entrevistas, trocas, biblioteca, podcast, tutoriais, atendimento, privacidade, admin
js/db.js          dados, sessão, mídias e gamificação
js/seed.js        dados fictícios de exemplo e perguntas da entrevista
assets/           logo e fontes (hospedadas localmente, sem Google Fonts)
biblioteca/       coloque aqui PDFs de obras em domínio público
```

Sem etapa de build: basta abrir com um servidor local (`python3 -m http.server`) ou publicar pelo GitHub Pages.

## LGPD e ECA

Ver a página "Privacidade e proteção" na plataforma. Princípios adotados: acesso restrito à comunidade escolar, minimização de dados, sem chat privado entre estudantes, trocas combinadas só dentro da escola, entrevistas apenas com termo assinado pelo responsável (com escolhas separadas para texto, foto, coletânea impressa e podcast), direito de exportar e pedir exclusão dos dados.
