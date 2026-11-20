# 🚀 Sistema de Gestão de Usuários (CRUD Full-Stack)

> **Desafio Técnico Full-Stack** — Iniciativa DevPool  
> Aplicação completa com API REST, persistência em banco de dados e interface web interativa.

---

## 📋 Sumário
1. [Sobre o Projeto](#-sobre-o-projeto)
2. [Tecnologias Escolhidas e Justificativas](#-tecnologias-escolhidas-e-justificativas)
3. [Instalação e Execução Local](#-instalação-e-execução-local)
4. [Documentação dos Endpoints da API (cURL)](#-documentação-dos-endpoints-da-api-curl)
5. [Arquitetura e Estrutura de Pastas](#-arquitetura-e-estrutura-de-pastas)
6. [Ciclo de Vida da Requisição (Para o Estudo de Caso Visual)](#-ciclo-de-vida-da-requisição-estudo-de-caso-visual)
7. [Dicas para a Apresentação na Entrevista](#-dicas-para-a-apresentação-na-entrevista)

---

## 📌 Sobre o Projeto

O sistema é uma aplicação web completa para gerenciamento (CRUD) de usuários corporativos, construída para demonstrar fundamentos sólidos de arquitetura de software, boas práticas de segurança, validação de regras de negócio e comunicação desacoplada via API REST.

### Principais Funcionalidades:
- **Listagem e Busca em Tempo Real:** Tabela dinâmica com estatísticas de usuários (total, ativos e inativos) e filtro de busca por nome, e-mail ou login.
- **Cadastro e Edição:** Modal intuitivo com validações no frontend e no backend.
- **Exclusão Segura:** Diálogo de confirmação antes de remover qualquer registro.
- **Feedback Visual Imediato:** Loading spinners durante requisições e notificações *Toast* de sucesso ou erro amigável.
- **Segurança de Dados:** Hash de senhas com algoritmo BCrypt e proteção total de dados sensíveis (a API **nunca** expõe senhas ou hashes em nenhum retorno JSON).

---

## 🛠 Tecnologias Escolhidas e Justificativas

Conforme as opções estritas do desafio, foram selecionadas as tecnologias que garantem máxima clareza, facilidade de manutenção e zero atrito para execução pelo avaliador:

### 1. Frontend: HTML5 + CSS3 Moderno + Vanilla JavaScript
* **Por que Vanilla JS?** Elimina a complexidade de compilação/build (como Webpack ou Vite) e abstrações de frameworks. Todo o fluxo de eventos e manipulação do DOM é direto e 100% transparente para quem está lendo ou apresentando o código.
* **Consumo via REST:** Todo o frontend se comunica exclusivamente com a API através da Fetch API padrão dos navegadores, garantindo isolamento total da camada de persistência.

### 2. Backend: Node.js com Express
* **Por que Node.js + Express?** É o ecossistema mais amplamente adotado no mercado web, oferecendo sintaxe limpa, excelente desempenho assíncrono e arquitetura modular simples de defender.
* **CORS:** Habilitado para permitir requisições sem bloqueios do navegador.

### 3. Banco de Dados: SQLite
* **Por que SQLite?** Não necessita de servidores externos nem configuração de containers Docker. O arquivo do banco é criado e gerenciado automaticamente na inicialização, permitindo que a banca rode o projeto com um simples comando `npm start`.

### 4. Segurança e Criptografia: BCrypt (bcryptjs)
* **Por que BCrypt?** Padrão da indústria com salt integrado para geração de hash irreversível de senhas contra ataques de dicionário e rainbow tables.

---

## 💻 Instalação e Execução Local

### Pré-requisitos
* **Node.js** (versão 18 ou superior)
* **npm** (já incluso no Node.js)

### Passo a Passo

1. **Clone o repositório:**
   ```bash
   git clone <URL_DO_SEU_REPOSITORIO>
   cd "Projeto Bling"
   ```

2. **Instale as dependências:**
   ```bash
   npm install
   ```
   *(Ou entre na pasta `backend` e execute `npm install`)*

3. **Inicie o servidor:**
   ```bash
   npm start
   ```

4. **Acesse a aplicação:**
   * Abra no seu navegador: **[http://localhost:3000](http://localhost:3000)**
   * A aplicação web será carregada imediatamente.

---

## 📡 Documentação dos Endpoints da API (cURL)

A URL base da API é `http://localhost:3000`.

### 1. Cadastrar Usuário (`POST /users`)
* **Status de Sucesso:** `201 Created`
* **Exemplo cURL:**
  ```bash
  curl -X POST http://localhost:3000/users \
    -H "Content-Type: application/json" \
    -d '{
      "name": "Maria Silva",
      "email": "maria@empresa.com",
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
    "email": "maria@empresa.com",
    "login": "mariasilva",
    "active": true,
    "created_at": "2026-11-17 19:30:00",
    "updated_at": "2026-11-17 19:30:00"
  }
  ```

### 2. Listar Todos os Usuários (`GET /users`)
* **Status de Sucesso:** `200 OK`
* **Exemplo cURL:**
  ```bash
  curl -X GET http://localhost:3000/users
  ```

### 3. Obter Detalhes de um Usuário (`GET /users/{id}`)
* **Status de Sucesso:** `200 OK` (ou `404 Not Found` se não existir)
* **Exemplo cURL:**
  ```bash
  curl -X GET http://localhost:3000/users/1
  ```

### 4. Atualizar Usuário (`PUT /users/{id}` ou `PATCH /users/{id}`)
* **Status de Sucesso:** `200 OK`
* **Exemplo cURL:**
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

### 5. Excluir Usuário (`DELETE /users/{id}`)
* **Status de Sucesso:** `200 OK` (ou `204 No Content`)
* **Exemplo cURL:**
  ```bash
  curl -X DELETE http://localhost:3000/users/1
  ```

### 6. Exemplo de Resposta de Erro / Validação (`400 Bad Request`)
Quando um campo obrigatório for omitido ou duplicado (ex: e-mail repetido):
```json
{
  "error": "O e-mail informado já está cadastrado no sistema."
}
```

---

## 🏛 Arquitetura e Estrutura de Pastas

O backend segue o padrão em camadas (**Layered Architecture**), desacoplando responsabilidades de forma que cada arquivo possua uma única função bem definida:

```
├── backend/
│   ├── src/
│   │   ├── database/
│   │   │   └── connection.js      # Conexão SQLite e criação automática da tabela
│   │   ├── repositories/
│   │   │   └── user.repository.js # Camada de Dados (SQL puro: SELECT, INSERT, UPDATE, DELETE)
│   │   ├── services/
│   │   │   └── user.service.js    # Regras de Negócio, validações (chars, regex, unicidade) e hash
│   │   ├── controllers/
│   │   │   └── user.controller.js # Camada de Apresentação HTTP (recebe req e envia res com status)
│   │   ├── routes/
│   │   │   └── user.routes.js     # Mapeamento dos endpoints REST para os Controllers
│   │   └── app.js                 # Configuração do Express, CORS e arquivos estáticos
│   ├── server.js                  # Ponto de entrada que inicializa a porta HTTP (3000)
│   ├── test_api.js                # Script de testes automatizados dos endpoints
│   └── package.json
│
├── frontend/
│   ├── index.html                 # Estrutura semântica, acessível e responsiva
│   ├── style.css                  # Folha de estilo moderna (paleta limpa, modais, cards, badges)
│   └── app.js                     # Lógica de consumo da API REST via Fetch, estado e eventos DOM
│
├── package.json                   # Script raiz para inicialização unificada
├── .gitignore
└── README.md
```

---

## 🔄 Ciclo de Vida da Requisição (Estudo de Caso Visual - Etapa 2)

Para a **Etapa 2 da Entrevista Técnica (Estudo de Caso de Arquitetura Visual - 30 min)**, foram disponibilizados os seguintes artefatos prontos:
- 📊 **Draw.io:** [fluxo_arquitetura_completo.drawio](file:///z:/Projeto%20Bling/fluxo_arquitetura_completo.drawio) (pode ser aberto diretamente no [app.diagrams.net](https://app.diagrams.net) ou na extensão Draw.io do VS Code).
- 🎨 **Excalidraw:** [fluxo_arquitetura_completo.excalidraw](file:///z:/Projeto%20Bling/fluxo_arquitetura_completo.excalidraw) (pode ser arrastado diretamente para o [excalidraw.com](https://excalidraw.com) ou aberto na extensão Excalidraw).
- 🎙️ **Roteiro Completo de Apresentação:** [ROTEIRO_APRESENTACAO_ETAPA_2_ARQUITETURA.md](file:///z:/Projeto%20Bling/ROTEIRO_APRESENTACAO_ETAPA_2_ARQUITETURA.md) (com guia minuto a minuto, scripts de fala e respostas para a banca).

### Visão Resumida do Fluxo:

```
[ Usuário no Navegador ]
         │ (Preenche formulário e clica em Salvar)
         ▼
[ Frontend: app.js ]
         │ 1. Validação básica de campos
         │ 2. Dispara requisição HTTP com fetch() (ex: POST /users com JSON)
         ▼
[ Rede / HTTP ] ──► [ CORS Middleware ] ──► [ express.json() Parser ]
                                                       │
                                                       ▼
                                            [ Rota: user.routes.js ]
                                                       │
                                                       ▼
                                      [ Controller: user.controller.js ]
                                                       │
                                                       ▼
                                       [ Service: user.service.js ]
                                        • Valida nome (>= 3 chars)
                                        • Valida regex do e-mail
                                        • Checa duplicidade de login/e-mail
                                        • Gera hash seguro da senha com BCrypt
                                                       │
                                                       ▼
                                   [ Repository: user.repository.js ]
                                        • Monta SQL parametrizado (INSERT INTO...)
                                                       │
                                                       ▼
                                        [ Banco de Dados: SQLite ]
                                                       │
                                                       ▼
         ◄── [ Resposta HTTP: Status 201 Created + JSON do Usuário (SEM SENHA) ] ──
```

---

## 🎯 Dicas para a Apresentação na Entrevista

### Como explicar o projeto em 2 minutos (Roteiro Verbal):
1. *"Optei por uma arquitetura em 3 camadas no backend: **Controller**, **Service** e **Repository**."*
2. *"O **Controller** apenas recebe a requisição HTTP e define o código de status correto (200, 201, 400, 404)."*
3. *"O **Service** é onde mora o coração das regras de negócio: valida tamanho de campos, unicidade de login/e-mail e gera o hash da senha via **BCrypt**."*
4. *"O **Repository** é o único que fala SQL com o **SQLite**, mantendo a camada de dados 100% isolada."*
5. *"No **Frontend**, utilizei **Vanilla JavaScript** consumindo a API com `fetch`. Não há acoplamento com o banco: toda comunicação respeita o protocolo REST."*

### Como responder à pergunta: *"Por que exclusão física ou lógica?"*
> *"No projeto deixei a exclusão física funcional com o comando `DELETE /users/:id`, mas adicionei a coluna booleana `active` que permite inativação lógica. Em sistemas empresariais reais, a exclusão lógica (soft delete) é preferível para manter a integridade referencial e histórico de auditoria."*
