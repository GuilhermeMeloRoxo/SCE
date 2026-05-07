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

## Demo
- [Site Online]()

## Estrutura do Projeto

      SCE/
      ├── components/                            # Componentes reutilizáveis
      |   ├── footer.html
      |   ├── navbar.html
      |   └── search.html
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
      |   ├── favicon.svg
      |   ├── github.png
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
      └── vite.config.js                         # Configuração do Vite

## Autores
- **Guilherme Mélo** - Desenvolvimento Full Stack - [@GuilhermeMelo](https://github.com/GuilhermeMeloRoxo)
- **Yasmin Marinho** - Desenvolvimento Full Stack - [@YasminMarinho](https://github.com/Yasmin-Marinho1)
