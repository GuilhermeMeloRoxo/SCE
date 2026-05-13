# SCE - Sistema de Controle de Egressos
Projeto do segundo período do curso de Engenharia de Software - IFPB Campus João Pessoa

## Descrição
É um sistema desenvolvido para fortalecer o vínculo entre a instituição e seus ex-alunos, 
focado em uma rede de comunicação constante. O site oferece um espaço de networking onde 
egressos trocam experiências, oportunidades de emprego e mentorias com alunos que cursam 
atualmente no Instituto.

A ferramenta permite que o IFPB monitore a vida profissional de seus formandos, através de 
coleta de dados por meio do LinkedIn e GitHub. Gerando os indicadores necessários para a CPA, 
garantindo conformidade total com as exigências de avaliação do MEC.

## Funcionalidades
- Navegação Intuitiva
- Layout Responsivo
- Integração com APIs
- Gestão de Perfil
- Vínculo com a Instituição
- Coleta de Feedback
- Interação Social
- Feed de Notícias
- Sistema de Conexões

## Tecnologias Utilizadas
- Frontend: HTML, CSS, Tailwind, Vanilla JS
- Backend: Node.js
- Database: Supabase

## Como Executar

### Pré-requisitos
- Node.js 24+
- NPM 11+

### Instalação
1. Clone o repositório:
   - git clone https://github.com/GuilhermeMeloRoxo/SCE
  
2. Instalação das dependências:
   - npm install (npm i)
   
3. Configuração do Banco de Dados e Autenticação (Supabase)

   - Para rodar este projeto localmente, você precisa replicar a estrutura do banco de dados,
   chaves de criptografia, armazenamento e as configurações de autenticação diretamente no
   painel web do [Supabase](https://supabase.com). Siga os passos abaixo:

            1. Criar o Projeto e Estrutura Inicial
            - Crie uma conta gratuita em [supabase.com](https://supabase.com) e inicie um novo projeto.
            - No painel do seu projeto, acesse o SQL Editor no menu lateral esquerdo.
            - Clique em New query para abrir um editor em branco.
            - Abra o arquivo schema.sql disponível na raiz deste repositório, copie todo o seu
            conteúdo e cole no editor.
            - Clique no botão Run (Executar) no canto superior direito do editor.
            
            2. Configurar o Cofre de Chaves (Vault)
            A aplicação utiliza criptografia avançada para proteger os CPFs dos usuários. Você precisa
            registrar a chave secreta no cofre do Supabase:
            - No menu lateral esquerdo, navegue até Project Settings > Vault.
            - Na aba Secrets, clique em Add new secret e adicione o seguinte registro:
               * Name: chave_criptografia_cpf
               * Secret: (Digite uma senha forte ou texto longo de sua preferência)
            
            3. Criar os Buckets de Armazenamento (Storage)
            O projeto gerencia imagens publicamente. Você deve criar as pastas de armazenamento manualmente:
            - No menu lateral esquerdo, clique em Storage.
            - Clique em New Bucket e configure o primeiro diretório:
               * Name: avatares
               * Public bucket: Ative esta opção (Deixe marcado como público).
            - Clique em New Bucket novamente e crie o segundo diretório:
               * Name: posts_imagens
               * Public bucket: Ative esta opção (Deixe marcado como público).
            - Crie políticas de inserção/atualização para usuários autenticados e política de leitura para todos.
            
            4. Configurar Provedores de Autenticação (Auth)
            
            Provedor 1: E-mail (Padrão)
            - Vá em Authentication > Providers > Email.
            - Para facilitar os testes em ambiente local de desenvolvimento, desative a opção Confirm email.
            - Clique em Save.
            
            Provedor 2: GitHub (OAuth)
            Como as chaves de acesso são vinculadas ao seu perfil pessoal do GitHub, você precisa
            registrar uma aplicação própria:
            - No seu GitHub pessoal, acesse: Settings > Developer Settings > OAuth Apps > New OAuth App.
            - Preencha os campos obrigatórios:
               * Application Name: Nome do seu projeto local.
               * Homepage URL:`http://localhost:5173 (ou a url correspondente do seu app).
               * Authorization callback URL: Para obter este endereço, volte ao painel do Supabase,
               acesse Authentication > Providers > GitHub e copie o endereço listado no
               campo Redirect URL. Cole este valor no formulário do GitHub.
            - Clique em Register application.
            - Na tela seguinte, clique no botão Generate a new client secret.
            - Copie o Client ID e o Client Secret gerados.
            - Retorne ao painel do Supabase, ative a opção Enable GitHub provider, cole as duas
            credenciais nos campos correspondentes e clique em Save.
            
            5. Configuração das Variáveis de Ambiente
            Por fim, vá em Project Settings > API no painel do Supabase, copie as credenciais
            de acesso públicas e configure o seu arquivo .env local da aplicação:
            
            .env
            NEXT_PUBLIC_SUPABASE_URL=seu_project_url_aqui
            NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_anon_public_key_aqui
         
4. Dê start na aplicação:
   - npm run dev

## Demo
- [Site SCE](http://sce-wordle-coders.vercel.app/)

## Estrutura do Projeto

      SCE/
      ├── pages/                                 # Páginas do sistema
      |   ├── cadastro/                          # Página de cadastro
      |   |   ├── index.html
      |   |   └── main.js
      |   ├── login/                             # Página de login
      |   |   ├── index.html
      |   |   └── main.js
      |   ├── perfil/                            # Página de perfil
      |   |   ├── editar/                        # Página de edição do perfil
      |   |   |   ├── index.html
      |   |   |   └── main.js
      |   |   ├── index.html
      |   |   └── main.js
      ├── public/                                # Imagens e ícones
      |   ├── components/                        # Componentes reutilizáveis
      |   |   ├── footer.html
      |   |   ├── navbar.html
      |   |   └── search.html
      |   ├── favicon.svg
      |   ├── github.png
      |   ├── icons.svg 
      |   ├── instagram.png
      |   ├── linkedin.png
      |   └── logo.png
      ├── src/                                   # Código-fonte principal da aplicação
      |   ├── lib/                               # Lida com armazenamento de feedbacks
      |   |   └── storage.js
      |   ├── main.js
      |   ├── style.css                          # Estilização global
      |   └── supabaseClient.js
      ├── .env.example                           # Modelo para configurar variáveis do projeto
      ├── index.html                             # Página inicial
      ├── package-lock.json                      
      ├── package.json                           # Gerencia de dependências
      ├── preview.png
      ├── schema.sql                             # SQL para gerar tabelas no supabase
      └── vite.config.js                         # Configuração do Vite

## Autores
- **Guilherme Mélo** - Desenvolvimento Full Stack - [@GuilhermeMelo](https://github.com/GuilhermeMeloRoxo)
- **Yasmin Marinho** - Desenvolvimento Full Stack - [@YasminMarinho](https://github.com/Yasmin-Marinho1)
