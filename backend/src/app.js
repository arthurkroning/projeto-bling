const express = require('express');
const cors = require('cors');
const path = require('path');
const userRoutes = require('./routes/user.routes');

const app = express();

// 1. Suporte a CORS (permitindo acesso de qualquer origem, inclusive frontend local)
app.use(cors());

// 2. Parser para JSON no corpo das requisições
app.use(express.json());

// 3. Servir os arquivos estáticos do Frontend (permite acessar http://localhost:3000 direto no navegador)
app.use(express.static(path.resolve(__dirname, '../../frontend')));

// 4. Registro das rotas da API
app.use(userRoutes);

// 5. Rota de verificação de status da API
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'API online', timestamp: new Date().toISOString() });
});

// 6. Tratamento de rotas inexistentes
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint não encontrado.' });
});

// 7. Middleware global de tratamento de erros
// Captura SyntaxError do express.json() (JSON malformado) e quaisquer erros não tratados
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, _next) => {
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'O corpo da requisição contém JSON inválido.' });
  }
  console.error('Erro inesperado:', err);
  const statusCode = err.statusCode || 500;
  const message = statusCode >= 500 ? 'Erro interno do servidor.' : err.message;
  return res.status(statusCode).json({ error: message });
});

module.exports = app;
