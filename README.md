# 🚀 Sistema de Gestão de Usuários (Full-Stack CRUD)

> Aplicação completa de **Gestão de Usuários** desenvolvida com arquitetura em camadas desacopladas, comunicação assíncrona via API REST, persistência em banco de dados relacional e interface web interativa e responsiva.

---

## 📋 Sumário

1. [Sobre o Projeto](#-sobre-o-projeto)
2. [Tecnologias Utilizadas e Justificativas Técnicas](#-tecnologias-utilizadas-e-justificativas-técnicas)
   - [Frontend](#1-frontend-interface-do-usuário)
   - [Backend](#2-backend-servidor-e-api-rest)
   - [Banco de Dados & Persistência](#3-banco-de-dados--persistência)
   - [Segurança & Criptografia](#4-segurança--criptografia)
   - [Ferramentas de Desenvolvimento & Engenharia](#5-ferramentas-de-desenvolvimento--engenharia)
3. [Instalação e Execução Local](#-instalação-e-execução-local)
   - [Pré-requisitos](#pré-requisitos)
   - [Passo a Passo](#passo-a-passo)
   - [Execução dos Testes Automatizados](#execução-dos-testes-automatizados)
4. [Documentação dos Endpoints da API REST (Exemplos cURL)](#-documentação-dos-endpoints-da-api-rest-exemplos-curl)
5. [Arquitetura de Software e Estrutura de Pastas](#-arquitetura-de-software-e-estrutura-de-pastas)
6. [Ciclo de Vida da Requisição e Diretrizes de Segurança](#-ciclo-de-vida-da-requisição-e-diretrizes-de-segurança)

---

## 📌 Sobre o Projeto

O sistema é uma solução web corporativa para gerenciamento completo do ciclo de vida de usuários (*Create, Read, Update, Delete*). O projeto foi desenhado sob princípios rigorosos de **Clean Architecture**, **Separação de Preocupações (Separation of Concerns - SoC)** e **Responsabilidade Única (SRP)**, garantindo que o frontend nunca acesse diretamente a camada de dados e que todas as regras de negócio sejam validadas e centralizadas no servidor.

### Principais Recursos:
- **Painel de Usuários com Estatísticas:** Cards dinâmicos exibindo Total de Usuários, Ativos e Inativos com atualização em tempo real.
- **Busca Instantânea (Filtragem Client-Side):** Campo de busca reativo que filtra por nome, e-mail ou login sem recarregar a página.
- **Formulário Reutilizável (Criação e Edição):** Modal dinâmico que adapta regras e campos automaticamente para cadastros novos ou atualizações.
- **Exclusão Segura com Diálogo de Confirmação:** Modal de confirmação explícita que previne remoções acidentais no banco de dados.
- **Feedback Visual Imediato:** Estados de carregamento (*spinners* nos botões e na listagem), notificações flutuantes (*Toasts*) de sucesso e tratamento amigável de erros de validação.
- **Proteção Total de Credenciais:** As senhas são armazenadas como hash criptográfico irreversível e a API **nunca** expõe senhas ou seus hashes em nenhum retorno JSON.

---

## 🛠 Tecnologias Utilizadas e Justificativas Técnicas

Todas as escolhas tecnológicas foram orientadas para garantir robustez, alto desempenho, facilidade de manutenção e máxima portabilidade (zero atrito para quem clona e executa o projeto):

### 1. Frontend (Interface do Usuário)
* **HTML5 Semântico:** Marcação estruturada focada em acessibilidade (`<header>`, `<main>`, `<section>`, `<table>`, formulários com validações nativas e tags semânticas).
* **CSS3 Moderno:**
  * Uso de **CSS Custom Properties (Variáveis CSS)** para padronização de paleta de cores (tema moderno dark/slate), tipografia e espaçamentos.
  * Layout flexível e adaptável utilizando **Flexbox** e **CSS Grid**.
  * **Media Queries** garantindo responsividade em dispositivos móveis, tablets e telas widescreen.
  * Animações suaves de transição para modais, spinners e notificações toast.
* **JavaScript Puro (Vanilla JS - ES6+):**
  * **Sem dependências de compilação:** Dispensou o overhead de builders pesados (Webpack/Vite) ou abstrações de frameworks, proporcionando carregamento instantâneo no navegador.
  * **Manipulação Nativa do DOM:** Controle granular do ciclo de vida dos eventos (`addEventListener`, delegação de eventos e manipulação dinâmica de nós).
  * **Comunicação Assíncrona com Fetch API:** Requisições assíncronas nativas utilizando `async/await`, com controle explícito de cabeçalhos HTTP (`Content-Type: application/json`).
  * **Sanitização Anti-XSS e Delegação Segura:** Implementação de rotinas de escape de caracteres HTML (`escapeHtml`), uso estrito de `textContent` no DOM e delegação de eventos via `data-action`/`data-id` no `tableBody`, eliminando `onclick` inline e prevenindo qualquer vetor de injeção ou *Cross-Site Scripting* (XSS).
* **Phosphor Icons (via CDN):** Conjunto leve e consistente de ícones vetoriais em SVG para enriquecimento visual da interface.

### 2. Backend (Servidor e API REST)
* **Node.js (>= 20.17.0 / LTS v20 ou v22):** Ambiente de execução JavaScript assíncrono baseado no motor V8, orientado a eventos e I/O não bloqueante, em conformidade com as exigências dos drivers nativos modernos do `sqlite3@6.0.1`.
* **Express (v4.21):** Framework web minimalista e consagrado na indústria, utilizado para roteamento semântico, encadeamento de middlewares e tratamento padronizado de requisições e respostas HTTP.
* **CORS (Cross-Origin Resource Sharing):** Middleware configurado para gerenciar políticas de cabeçalhos HTTP, permitindo que a aplicação frontend e consumidores autorizados consumam a API com segurança.
* **Parser de JSON Nativo (`express.json()`):** Middleware para deserialização automática de corpos de requisição formatados em JSON com controle de tamanho de payload.

### 3. Banco de Dados & Persistência
* **SQLite (via biblioteca `sqlite3`):**
  * **Persistência Relacional em Arquivo:** Sistema de gerenciamento de banco de dados relacional completo em conformidade com **ACID**, que persiste as informações em um arquivo local (`database.sqlite`).
  * **Zero Setup Externo:** Elimina a necessidade de instalação e configuração de servidores externos ou containers Docker, permitindo que a aplicação execute imediatamente após a instalação.
  * **Integridade de Dados:** Tabela estruturada com chaves primárias autoincrementadas (`id INTEGER PRIMARY KEY AUTOINCREMENT`) e constraints de unicidade (`UNIQUE`) para os campos `email` e `login`.

### 4. Segurança & Criptografia
* **BCrypt (`bcryptjs`):**
  * Função de derivação de chave criptográfica baseada na cifra Blowfish, com geração de **salt aleatório** integrada e fator de custo ajustado para 10 rounds.
  * Garante que as senhas dos usuários nunca sejam armazenadas em texto puro, tornando o sistema resistente a ataques de força bruta, dicionário e *rainbow tables*.
* **Sanitização de Retorno (Data Sanitization):** Método centralizado na camada de serviço (`formatUser`) que desestrutura o objeto de usuário e descarta explicitamente o atributo de senha antes de serializar o JSON de resposta.

### 5. Ferramentas de Desenvolvimento & Engenharia
* **Google Antigravity (Gemini 3.8 Flash):** Utilizado como apoio à concepção e à estruturação arquitetural em camadas, à validação dos fluxos e à elaboração da suíte de testes.
* **OpenCode (DeepSeek V4.1 Flash Free):** Utilizado para executar testes automatizados, revisar o código e identificar oportunidades de refinamento.
* **Codex (GPT-5):** Utilizado para revisão complementar, implementação de ajustes e verificação da consistência entre código, testes e documentação.
* **Git:** Controle de versionamento distribuído com histórico semântico de commits e arquivos de configuração limpos.

---

## 💻 Instalação e Execução Local

### Pré-requisitos
* **Node.js** instalado na máquina (versão **20.17.0 ou superior** recomendada — LTS v20.17+ ou v22+).
* Gerenciador de pacotes **npm** (incluso na instalação padrão do Node.js).
* Navegador web moderno (Chrome, Edge, Firefox, Brave ou Safari).

### Passo a Passo

1. **Clone o repositório:**
   ```bash
   git clone https://github.com/arthurkroning/projeto-bling.git
   cd projeto-bling
   ```

2. **Instale as dependências:**
   ```bash
   npm install
   ```
   *Nota: O comando acima instala as dependências da raiz e aciona automaticamente a instalação das dependências do backend.*

3. **Inicie o servidor:**
   ```bash
   npm start
   ```

4. **Acesse a aplicação no navegador:**
   * Abra: **[http://localhost:3000](http://localhost:3000)**
   * A interface web será exibida e a conexão com a API REST será confirmada automaticamente.

---

### Execução dos Testes Automatizados

O projeto acompanha uma suíte de **24 testes de integração** ponta a ponta (`test_api.js`) que utiliza `assert` do Node.js para validar automaticamente as regras de negócio da API — validação de campos (nome, e-mail, login, senha), unicidade de e-mail e login, `active` padrão e booleano estrito, ocultação de senha no retorno, atualização completa por `PUT`, atualização parcial por `PATCH`, códigos de status HTTP (200, 201, 400, 404), tratamento de JSON malformado, CORS e rotas inexistentes. O processo termina com **exit code 1** caso algum teste falhe:

```bash
npm run test:api
```

*(Ou diretamente: `node backend/test_api.js`)*

---

## 📡 Documentação dos Endpoints da API REST (Exemplos cURL)

A URL base da API é: `http://localhost:3000`

### 1. Cadastrar Usuário (`POST /users`)
Recebe o payload em JSON, valida regras de negócio, gera o hash seguro da senha e persiste o usuário com status padrão `active: true`.

* **Status de Sucesso:** `201 Created`
* **Chamada cURL:**
  ```bash
  curl -X POST http://localhost:3000/users \
    -H "Content-Type: application/json" \
    -d '{
      "name": "Maria Silva",
      "email": "maria.silva@empresa.com",
      "login": "mariasilva",
      "password": "senhaSegura123",
      "active": true
    }'
  ```
* **Exemplo de Resposta (201 Created):**
  ```json
  {
    "id": 1,
    "name": "Maria Silva",
    "email": "maria.silva@empresa.com",
    "login": "mariasilva",
    "active": true,
    "created_at": "2026-11-19 20:00:00",
    "updated_at": "2026-11-19 20:00:00"
  }
  ```

---

### 2. Listar Todos os Usuários (`GET /users`)
Retorna a listagem de todos os usuários ordenados pelo ID mais recente.

* **Status de Sucesso:** `200 OK`
* **Chamada cURL:**
  ```bash
  curl -X GET http://localhost:3000/users
  ```
* **Exemplo de Resposta (200 OK):**
  ```json
  [
    {
      "id": 1,
      "name": "Maria Silva",
      "email": "maria.silva@empresa.com",
      "login": "mariasilva",
      "active": true,
      "created_at": "2026-11-19 20:00:00",
      "updated_at": "2026-11-19 20:00:00"
    }
  ]
  ```

---

### 3. Obter Detalhes por ID (`GET /users/{id}`)
Retorna os dados de um usuário específico identificado pelo parâmetro de rota.

* **Status de Sucesso:** `200 OK`
* **Status se não encontrado:** `404 Not Found`
* **Chamada cURL:**
  ```bash
  curl -X GET http://localhost:3000/users/1
  ```
* **Exemplo de Resposta (200 OK):**
  ```json
  {
    "id": 1,
    "name": "Maria Silva",
    "email": "maria.silva@empresa.com",
    "login": "mariasilva",
    "active": true,
    "created_at": "2026-11-19 20:00:00",
    "updated_at": "2026-11-19 20:00:00"
  }
  ```

---

### 4. Atualizar Dados do Usuário (`PUT /users/{id}` ou `PATCH /users/{id}`)
`PUT` atualiza o cadastro completo e exige `name`, `email` e `login`. `PATCH` atualiza somente os campos enviados, preservando os demais. Em ambos, se o campo `password` for enviado (mínimo de 8 caracteres), gera um novo hash; se omitido ou em branco, preserva o hash anterior.

* **Status de Sucesso:** `200 OK`
* **Status se não encontrado:** `404 Not Found`
* **Chamada cURL:**
  ```bash
  curl -X PUT http://localhost:3000/users/1 \
    -H "Content-Type: application/json" \
    -d '{
      "name": "Maria Silva Santos",
      "email": "maria.santos@empresa.com",
      "login": "mariasantos",
      "active": true
    }'
  ```
* **Exemplo de atualização parcial:**
  ```bash
  curl -X PATCH http://localhost:3000/users/1 \
    -H "Content-Type: application/json" \
    -d '{ "active": false }'
  ```

---

### 5. Excluir Usuário (`DELETE /users/{id}`)
Remove o registro do banco de dados relacional.

* **Status de Sucesso:** `200 OK`
* **Status se não encontrado:** `404 Not Found`
* **Chamada cURL:**
  ```bash
  curl -X DELETE http://localhost:3000/users/1
  ```
* **Exemplo de Resposta (200 OK):**
  ```json
  {
    "message": "Usuário 1 excluído com sucesso."
  }
  ```

---

### 6. Tratamento de Erros e Validações (`400 Bad Request`)
Quando qualquer regra de negócio for violada (nome menor que 3 caracteres, e-mail com formato inválido, e-mail já existente, login duplicado ou senha menor que 8 caracteres):

```json
{
  "error": "O e-mail informado já está cadastrado no sistema."
}
```

---

## 🏛 Arquitetura de Software e Estrutura de Pastas

O backend implementa o padrão **Layered Architecture** com divisões estritas de escopo:

```text
├── backend/
│   ├── src/
│   │   ├── database/
│   │   │   └── connection.js      # Gerenciador da conexão SQLite e DDL da tabela
│   │   ├── repositories/
│   │   │   └── user.repository.js # Camada de Dados (SQL: SELECT, INSERT, UPDATE, DELETE)
│   │   ├── services/
│   │   │   └── user.service.js    # Camada de Negócio (regras, validações e BCrypt)
│   │   ├── controllers/
│   │   │   └── user.controller.js # Camada de Apresentação HTTP (status codes e serialização)
│   │   ├── routes/
│   │   │   └── user.routes.js     # Definição e roteamento dos endpoints REST
│   │   └── app.js                 # Pipeline do Express, CORS e entrega de estáticos
│   ├── server.js                  # Inicialização do servidor na porta designada
│   ├── test_api.js                # Suíte de testes automatizados da API
│   ├── package.json               # Dependências do backend
│   └── package-lock.json
│
├── frontend/
│   ├── index.html                 # Interface estrutural semântica e modais
│   ├── style.css                  # Folha de estilo moderna, paleta de cores e animações
│   └── app.js                     # Controlador do DOM, consumo de API e tratamento de eventos
│
├── package.json                   # Script orquestrador raiz
├── .gitignore                     # Filtros de exclusão de arquivos transitórios
└── README.md                      # Documentação técnica oficial do repositório
```

---

## 🔄 Ciclo de Vida da Requisição e Diretrizes de Segurança

O fluxo de dados da aplicação obedece a um pipeline unidirecional, desacoplado e seguro:

```
[ Navegador Web / Cliente ]
           │
           │  1. Dispara requisição HTTP assíncrona (ex: POST /users com JSON)
           ▼
[ Middlewares: CORS & express.json() ]
           │  2. Valida política de origem e converte o payload em objeto JavaScript
           ▼
[ Roteador: user.routes.js ]
           │  3. Encaminha para a ação correspondente no Controller
           ▼
[ Controller: user.controller.js ]
           │  4. Extrai parâmetros/body e delega para a camada de Serviço
           ▼
[ Service: user.service.js ]
           │  5. Executa regras de negócio:
           │     • Validação de nome (mínimo 3 caracteres válidos)
           │     • Validação de e-mail por regex e verificação de unicidade
           │     • Validação de login (mínimo 3 caracteres e unicidade)
           │     • Geração de hash seguro da senha com BCrypt (salt rounds: 10)
           ▼
[ Repository: user.repository.js ]
           │  6. Executa SQL parametrizado contra injeção de SQL (Prepared Statements)
           ▼
[ Banco de Dados: SQLite ]
           │  7. Grava o registro no disco e retorna o ID autoincrementado
           ▼
[ Higienização & Retorno Seguro ]
           │  8. O Service aplica formatUser() (descarta senha/hash)
           │  9. O Controller responde com status HTTP semântico (201 Created)
           ▼
[ Interface Frontend ]
              10. Fecha o modal, atualiza a tabela e notifica o usuário via Toast
```

### Síntese de Segurança:
- **Proteção contra SQL Injection:** Todos os comandos no `user.repository.js` utilizam placeholders (`?`) garantindo consultas parametrizadas.
- **Proteção contra XSS:** Sanitização em tempo de renderização no frontend de qualquer conteúdo injetado no DOM.
- **Isolamento de Credenciais:** Consultas de listagem, detalhe e unicidade não recuperam a coluna de senha. Apenas a consulta interna de atualização busca o hash existente para preservá-lo quando a senha é omitida; a camada de serviço o remove antes de qualquer retorno ao cliente.
